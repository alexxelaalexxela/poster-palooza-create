// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Assurez-vous d'avoir les imports

/*───────────────────────────*
 * Configuration CORS
 *───────────────────────────*/
const ALLOWED_ORIGINS = [
  "https://poster-palooza-create.lovable.app",
  "https://preview--poster-palooza-create.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const signupEncKeyB64 = Deno.env.get('SIGNUP_ENC_KEY')!; // 32 bytes base64

const prices = {
  // A4
  'A4-classic': 50,
  'A4-premium': 2500,
  'A4-museum': 2800,

  // A3
  'A3-classic': 2500,
  'A3-premium': 3500,
  'A3-museum': 3800,

  // A2
  'A2-classic': 3500,
  'A2-premium': 4500, // donné
  'A2-museum': 4800, // donné

  // A1
  'A1-classic': 4500,
  'A1-premium': 5500,
  'A1-museum': 5800,

  // A0
  'A0-classic': 5500,
  'A0-premium': 6500,
  'A0-museum': 6800,
};

const baseCorsHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Authorization, x-client-authorization",
} as const;

/*───────────────────────────*
 * Fonction Edge
 *───────────────────────────*/
serve(async (req) => {
  /*---------- 1) Pré-requête CORS ----------*/
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const corsHeaders = { ...baseCorsHeaders, "Access-Control-Allow-Origin": allowOrigin } as Record<string, string>;
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

  let body: { format: string; quality: string; posterUrl?: string; purchaseType?: 'poster' | 'plan'; email?: string; password?: string; visitorId?: string };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { format, quality, posterUrl, purchaseType = 'poster', email, password, visitorId } = body;
  const priceId = `${format}-${quality}`;
  let unit_amount = prices[priceId];

  if (purchaseType === 'poster') {
    unit_amount += 499;
  }

  if (!unit_amount) {
    return new Response(JSON.stringify({ error: "Invalid format or quality" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Récupérer l'utilisateur via JWT (optionnel pour paiement invité)
  // Attention: `verify_jwt = true` exige que Authorization soit un JWT projet (anon/service)
  // On lit donc le token utilisateur (GoTrue) via un en-tête séparé.
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const clientAuthHeader = req.headers.get('X-Client-Authorization') || req.headers.get('x-client-authorization') || '';
  let userId = 'anonymous';
  if (clientAuthHeader.startsWith('Bearer ')) {
    try {
      const token = clientAuthHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAuth.auth.getUser(token);
      if (user?.id) {
        userId = user.id;
      }
    } catch (_e) {
      // ignore, reste en "anonymous"
    }
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
    success_url: allowOrigin,
    cancel_url: allowOrigin,
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]":
      purchaseType === 'plan'
        ? `Forfait 1 poster ${format} – ${quality} (15 générations incluses)`
        : `Poster ${format} – ${quality} + frais de livraison`,
    "line_items[0][price_data][unit_amount]": `${unit_amount}`, "line_items[0][quantity]": "1",
    "payment_method_types[0]": "card",
  });
  // Ajoute une image d'aperçu si l'URL est courte et publique (uniquement pour achat poster)
  if (
    purchaseType === 'poster' &&
    typeof posterUrl === 'string' &&
    !posterUrl.startsWith('data:') &&
    posterUrl.length <= 200
  ) {
    bodyParams.append("line_items[0][price_data][product_data][images][0]", posterUrl);
  }
  bodyParams.append("metadata[purchase_type]", purchaseType);
  bodyParams.append("metadata[user_id]", userId);
  if (visitorId && (!userId || userId === 'anonymous')) {
    bodyParams.append("metadata[visitor_id]", String(visitorId));
    bodyParams.append("client_reference_id", String(visitorId));
  }
  if (purchaseType === 'plan') {
    bodyParams.append("metadata[plan_format]", String(format));
    bodyParams.append("metadata[plan_quality]", String(quality));
    if (!userId || userId === 'anonymous') {
      // Create a pending signup record securely server-side with AES-GCM
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required for plan purchase' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      try {
        const encKey = await crypto.subtle.importKey(
          'raw',
          Uint8Array.from(atob(signupEncKeyB64), c => c.charCodeAt(0)),
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cipherBuf = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          encKey,
          new TextEncoder().encode(password)
        );
        const password_ciphertext = btoa(String.fromCharCode(...new Uint8Array(cipherBuf)));
        const password_iv = btoa(String.fromCharCode(...iv));

        const { data: pending, error: errPending } = await supabaseAdmin
          .from('pending_signups')
          .insert({ email, password_ciphertext, password_iv })
          .select('id')
          .single();
        if (errPending || !pending?.id) {
          console.error('Could not prepare pending signup', errPending);
          return new Response(JSON.stringify({ error: 'Could not prepare pending signup' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        bodyParams.append("metadata[signup_id]", pending.id);
      } catch (e) {
        console.error('Encryption error', e);
        return new Response(JSON.stringify({ error: 'Encryption failed' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
  }
  // N'ajoute pas d'énormes data URLs en metadata Stripe (limites ~500 chars)
  if (purchaseType === 'poster') {
    // Always include format and quality for post-payment processing
    bodyParams.append("metadata[format]", String(format));
    bodyParams.append("metadata[quality]", String(quality));
    if (
      typeof posterUrl === 'string' &&
      !posterUrl.startsWith('data:') &&
      posterUrl.length <= 500
    ) {
      bodyParams.append("metadata[poster_url]", posterUrl);
    }
  }
  bodyParams.append(
    "shipping_address_collection[allowed_countries][]",
    "FR",        // France
  );
  // Ajouter des frais de livraison pour les forfaits (plan)
  if (purchaseType === 'plan') {
    bodyParams.append("shipping_options[0][shipping_rate_data][display_name]", "Livraison standard");
    bodyParams.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    bodyParams.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "499");
    bodyParams.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
  }

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