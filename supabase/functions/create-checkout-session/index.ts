// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/*───────────────────────────*
 * Configuration CORS
 *───────────────────────────*/
const ALLOWED_ORIGIN = "http://localhost:8080"; //"https://poster-palooza-create.lovable.app" // ;          // ← remplace par ton domaine en prod

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,          // ton front
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey",   // ← ajoute Authorization + apikey
};

/*───────────────────────────*
 * Fonction Edge
 *───────────────────────────*/
serve(async (req) => {
  /*---------- 1) Pré-requête CORS ----------*/
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  /*---------- 2) Limiter à POST ----------*/
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  /*---------- 3) Lecture & validation du JSON ----------*/
  let body: {
    poster?: string;
    format?: string;
    quality?: string;
    price?: number;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { poster, format, quality, price } = body;

  if (!poster || !format || !quality || typeof price !== "number") {
    return new Response(
      JSON.stringify({ error: "Missing or invalid fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /*---------- 4) Préparation de la requête Stripe ----------*/
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY missing in secrets");
    return new Response("Server mis-configured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const bodyParams = new URLSearchParams({
    mode: "payment",
    success_url: "http://localhost:8080/success",
    cancel_url: "http://localhost:8080/cancel",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]":
      `Poster ${poster} – ${format} – ${quality}`,
    "line_items[0][price_data][unit_amount]": `${Math.round(price * 100)}`, // ← centimes
    "line_items[0][quantity]": "1",
    "payment_method_types[0]": "card",
  });

  /*---------- 5) Appel Stripe ----------*/
  let stripeRes: Response;
  try {
    stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });
  } catch (err) {
    console.error("Network error ->", err);
    return new Response(
      JSON.stringify({ error: "Could not reach Stripe" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripeJson = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("Stripe error ->", stripeJson);
    return new Response(
      JSON.stringify({ error: stripeJson.error?.message || "Stripe error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /*---------- 6) Succès ----------*/
  return new Response(
    JSON.stringify({ url: stripeJson.url }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});