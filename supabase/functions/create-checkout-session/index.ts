// @ts-nocheck
// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Assurez-vous d'avoir les imports
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

/*───────────────────────────*
 * Configuration CORS
 *───────────────────────────*/
const ALLOWED_ORIGINS = [
  "https://neoma-ai.fr",
  "https://neomaposter.netlify.app",
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
  'A4-classic': 4498,
  'A4-premium': 5298,
  'A4-museum': 5498,

  // A3
  'A3-classic': 5498,
  'A3-premium': 6498,
  'A3-museum': 6998,

  // A2
  'A2-classic': 6498,
  'A2-premium': 7498,
  'A2-museum': 7998,

  // A1
  'A1-classic': 8498,
  'A1-premium': 9798,
  'A1-museum': 10498,

  // A0
  'A0-classic': 10498,
  'A0-premium': 12498,
  'A0-museum': 13498,
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



  let body: { format?: string; quality?: string; posterUrl?: string; posterPreviewDataUrl?: string; purchaseType?: 'poster' | 'plan' | 'cart'; email?: string; password?: string; visitorId?: string; fbEventId?: string; fbp?: string; fbc?: string; pageUrl?: string; promo?: { code?: string; percent?: number }; items?: Array<{ format: string; quality: string; posterUrl?: string; posterPreviewDataUrl?: string; quantity?: number }> };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { format, quality, posterUrl, posterPreviewDataUrl, purchaseType = 'poster', email, password, visitorId, fbEventId, fbp, fbc, pageUrl, promo, items } = body;
  let unit_amount = 0;
  let isCart = purchaseType === 'cart' && Array.isArray(items) && items.length > 0;
  if (!isCart) {
    const priceId = `${format}-${quality}`;
    unit_amount = prices[priceId];
    if (!unit_amount) {
      return new Response(JSON.stringify({ error: "Invalid format or quality" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  // Apply promo on the product price EXCLUDING shipping, then add shipping back
  const SHIPPING_FEE_CENTS = 499;
  let base_ex_shipping = isCart ? 0 : Math.max(0, unit_amount - SHIPPING_FEE_CENTS);

  if (!isCart && !unit_amount) {
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

  // Apply promo discount (poster, cart and plan) if valid
  let promoApplied = false;
  let promoCode: string | undefined = undefined;
  let promoPercent: number | undefined = undefined;
  if (promo) {
    const incomingCode = String(promo.code || '').trim().toUpperCase();
    const incomingPercent = Number(promo.percent || 0);
    // Server-side validation: accept NEOMA25 (25%) and FIRST100 (50%)
    const serverValid: Record<string, number> = {
      'NEOMA25': 25,
      'FIRST100': 50,
    };
    const allowedPercent = serverValid[incomingCode];
    if (allowedPercent) {
      const capped = Math.min(allowedPercent, Math.max(0, incomingPercent || allowedPercent));
      if (capped > 0) {
        if (isCart && Array.isArray(items)) {
          // For cart, we'll apply the discount later per line by multiplying by (1 - capped/100)
          promoApplied = true;
          promoCode = incomingCode;
          promoPercent = capped;
        } else {
          const discountCents = Math.floor(base_ex_shipping * (capped / 100));
          base_ex_shipping = Math.max(0, base_ex_shipping - discountCents);
          promoApplied = true;
          promoCode = incomingCode;
          promoPercent = capped;
        }
      }
    }
  }

  const bodyParams = new URLSearchParams({
    mode: "payment",
    success_url: purchaseType === 'plan' 
      ? "https://neoma-ai.fr/subscribe/success"
      : "https://neoma-ai.fr/poster/success",
    cancel_url: "https://neoma-ai.fr/subscribe",
    "payment_method_types[0]": "card",
  });

  if (isCart && Array.isArray(items)) {
    const discountFactor = typeof promoPercent === 'number' && promoPercent > 0 ? Math.max(0, 1 - (promoPercent / 100)) : 1;
    let idx = 0;
    for (const it of items) {
      const key = `${it.format}-${it.quality}`;
      const price = prices[key];
      if (!price) continue;
      const exShipping = Math.max(0, price - SHIPPING_FEE_CENTS);
      const perUnit = Math.max(0, Math.floor(exShipping * discountFactor));
      const qty = Math.max(1, Number(it.quantity || 1));
      bodyParams.append(`line_items[${idx}][price_data][currency]`, "eur");
      bodyParams.append(`line_items[${idx}][price_data][product_data][name]`, `Poster ${it.format} – ${it.quality}`);
      bodyParams.append(`line_items[${idx}][price_data][unit_amount]`, `${perUnit}`);
      bodyParams.append(`line_items[${idx}][quantity]`, `${qty}`);
      idx += 1;
      if (idx >= 20) break; // safety cap
    }
    // add shipping as session-level option (single fee)
    bodyParams.append("shipping_address_collection[allowed_countries][]", "FR");
    bodyParams.append("shipping_options[0][shipping_rate_data][display_name]", "Livraison");
    bodyParams.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    bodyParams.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", `${SHIPPING_FEE_CENTS}`);
    bodyParams.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
  } else {
    // Recompose unit amount: discounted base + shipping (single poster)
    unit_amount = Math.max(0, base_ex_shipping + SHIPPING_FEE_CENTS);
    bodyParams.append("line_items[0][price_data][currency]", "eur");
    bodyParams.append("line_items[0][price_data][product_data][name]", purchaseType === 'plan' ? `Forfait 1 poster ${format} – ${quality} (15 générations incluses)` : `Poster ${format} – ${quality} + frais de livraison`);
    bodyParams.append("line_items[0][price_data][unit_amount]", `${unit_amount}`);
    bodyParams.append("line_items[0][quantity]", "1");
  }
  // Ajoute une image d'aperçu filigranée (Stripe Checkout) si possible
  // Ajoute une image d'aperçu fournie par le client (déjà filigranée) si possible
  if (!isCart && purchaseType === 'poster' && typeof posterPreviewDataUrl === 'string' && posterPreviewDataUrl.startsWith('data:image')) {
    try {
      const uploadedUrl = await uploadPreviewFromDataUrl(posterPreviewDataUrl);
      if (uploadedUrl) {
        bodyParams.append("line_items[0][price_data][product_data][images][0]", uploadedUrl);
      }
    } catch (e) {
      console.warn('Could not upload client watermarked preview:', e);
    }
  }
  bodyParams.append("metadata[purchase_type]", purchaseType);
  bodyParams.append("metadata[user_id]", userId);
  if (isCart && Array.isArray(items)) {
    bodyParams.append("metadata[cart_count]", String(Math.min(items.length, 20)));
  }
  if (promoApplied) {
    bodyParams.append("metadata[promo_applied]", "true");
    if (promoCode) bodyParams.append("metadata[promo_code]", promoCode);
    if (typeof promoPercent === 'number') bodyParams.append("metadata[promo_percent]", String(promoPercent));
  }
  if (visitorId && (!userId || userId === 'anonymous')) {
    bodyParams.append("metadata[visitor_id]", String(visitorId));
    bodyParams.append("client_reference_id", String(visitorId));
  }
  // Meta CAPI metadata for dedupe and match
  if (fbEventId) bodyParams.append("metadata[fb_event_id]", fbEventId);
  if (fbp) bodyParams.append("metadata[fbp]", fbp);
  if (fbc) bodyParams.append("metadata[fbc]", fbc);
  if (pageUrl) bodyParams.append("metadata[page_url]", pageUrl);
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
    // Ne jamais exposer l'URL originale en clair dans les metadata Stripe
  }
  bodyParams.append(
    "shipping_address_collection[allowed_countries][]",
    "FR",        // France
  );
  // Ajouter des frais de livraison pour les forfaits (plan)
  if (purchaseType === 'plan') {
    bodyParams.append("shipping_options[0][shipping_rate_data][display_name]", "Livraison standard");
    bodyParams.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    bodyParams.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "0");
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

async function uploadStripePreview(bytes: Uint8Array): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const filename = `stripe-previews/${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage.from('posters').upload(filename, bytes, {
    contentType: 'image/png',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('posters').getPublicUrl(filename);
  return data.publicUrl;
}

async function uploadPreviewFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const b64 = dataUrl.slice(commaIdx + 1);
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return await uploadStripePreview(bytes);
  } catch (_e) {
    return null;
  }
}