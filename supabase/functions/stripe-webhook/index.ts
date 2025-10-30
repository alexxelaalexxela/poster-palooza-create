// @ts-nocheck
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.3.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
const signupEncKeyB64 = Deno.env.get('SIGNUP_ENC_KEY')!; // same key as in checkout

const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID') || Deno.env.get('VITE_META_PIXEL_ID');
const META_CAPI_ACCESS_TOKEN = Deno.env.get('META_CAPI_ACCESS_TOKEN');
const META_TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE');

async function sendMetaEvent(payload: any) {
    if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) return;
    const url = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(META_TEST_EVENT_CODE ? { ...payload, test_event_code: META_TEST_EVENT_CODE } : payload)
        });
        const json = await res.json();
        if (!res.ok) console.error('Meta CAPI error', json);
        return json;
    } catch (e) {
        console.error('Meta CAPI request failed', e);
    }
}

async function sha256Hex(s: string): Promise<string> {
    const buf = new TextEncoder().encode(s);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
        );
    } catch (err) {
        console.error(err.message);
        return new Response(err.message, { status: 400 });
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session: any = event.data.object;
        const metadata = session?.metadata || {};
        const purchaseType = metadata?.purchase_type || 'poster';
        let userId: string | null = (metadata?.user_id && metadata.user_id !== 'anonymous') ? metadata.user_id : null;
        const visitorId: string | null = metadata?.visitor_id || session?.client_reference_id || null;

        // Extract shipping details from session
        const collected = session?.collected_information?.shipping_details || null;
        const shipping = session?.shipping_details || null;
        const customerDetails = session?.customer_details || {};
        const shippingName: string | null = (collected?.name ?? shipping?.name ?? customerDetails?.name) || null;
        const shippingAddress = (collected?.address || shipping?.address || customerDetails?.address) || {};
        const shippingLine1: string | null = shippingAddress?.line1 ?? null;
        const shippingLine2: string | null = shippingAddress?.line2 ?? null;
        const shippingCity: string | null = shippingAddress?.city ?? null;
        const shippingPostalCode: string | null = shippingAddress?.postal_code ?? null;
        const shippingCountry: string | null = shippingAddress?.country ?? null;
        const receiptEmail: string | null = customerDetails?.email ?? null;

        // For plan purchases, allow account creation post-payment (secure: no password)
        if (purchaseType === 'plan') {
            if (!userId) {
                const signupId = metadata?.signup_id as string | undefined;
                if (!signupId) {
                    console.error('Webhook Error: No user_id or signup_id for plan purchase');
                    return new Response('Missing user identification for plan', { status: 400 });
                }
                // fetch email/password (encrypted) from pending_signups
                const { data: pending, error: errPending } = await supabase
                    .from('pending_signups')
                    .select('email, password_ciphertext, password_iv')
                    .eq('id', signupId)
                    .single();
                if (errPending || !pending) {
                    console.error('Pending signup not found', errPending);
                    return new Response('Pending signup not found', { status: 400 });
                }
                // Decrypt password with AES-GCM
                let plainPassword = '';
                try {
                    const key = await crypto.subtle.importKey(
                        'raw',
                        Uint8Array.from(atob(signupEncKeyB64), c => c.charCodeAt(0)),
                        { name: 'AES-GCM' },
                        false,
                        ['decrypt']
                    );
                    const iv = Uint8Array.from(atob(pending.password_iv), c => c.charCodeAt(0));
                    const cipher = Uint8Array.from(atob(pending.password_ciphertext), c => c.charCodeAt(0));
                    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
                    plainPassword = new TextDecoder().decode(buf);
                } catch (e) {
                    console.error('Decryption failed', e);
                    return new Response('Decryption failed', { status: 500 });
                }
                // Create user immediately with decrypted password
                const { data: created, error: createErr } = await supabase.auth.admin.createUser({
                    email: pending.email,
                    password: plainPassword,
                    email_confirm: true,
                });
                if (createErr) {
                    console.error('Create user error:', createErr);
                    return new Response('Failed to create user', { status: 500 });
                }
                userId = created?.user?.id ?? null;
                if (!userId) {
                    console.error('Create user returned no user id');
                    return new Response('User creation failed', { status: 500 });
                }
                // cleanup pending row
                await supabase.from('pending_signups').delete().eq('id', signupId);
            }

            const updatePayload: Record<string, any> = {
                id: userId,
                is_paid: true,
                generations_remaining: 15,
                stripe_customer_id: session.customer ?? null,
                subscription_format: metadata?.plan_format ?? null,
                subscription_quality: metadata?.plan_quality ?? null,
                shipping_name: shippingName,
                shipping_address_line1: shippingLine1,
                shipping_address_line2: shippingLine2,
                shipping_city: shippingCity,
                shipping_postal_code: shippingPostalCode,
                
                shipping_country: shippingCountry,
                
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updatePayload, { onConflict: 'id' });

            if (error) {
                console.error('Supabase upsert error:', error);
                return new Response('Failed to update user profile (plan)', { status: 500 });
            }

            console.log(`Successfully upgraded user (plan): ${userId}`);
            // Send Purchase via CAPI
            try {
                const eventId = metadata?.fb_event_id || crypto.randomUUID();
                const value = Number(session?.amount_total ? (session.amount_total / 100).toFixed(2) : '0');
                const currency = session?.currency ? String(session.currency).toUpperCase() : 'EUR';
                const email = receiptEmail?.trim().toLowerCase();
                const userAgent = (session?.user_agent || '') as string;
                const ip = (session?.client_ip || '') as string;
                const fbp = metadata?.fbp || undefined;
                const fbc = metadata?.fbc || undefined;
                const pageUrl = metadata?.page_url || undefined;
                const user_data: any = {
                    client_user_agent: userAgent || undefined,
                    client_ip_address: ip || undefined,
                    fbp,
                    fbc,
                };
                if (email) user_data.em = await sha256Hex(email);
                const payload = {
                    data: [
                        {
                            event_name: 'Purchase',
                            event_time: Math.floor(Date.now() / 1000),
                            action_source: 'website',
                            event_source_url: pageUrl || 'https://neoma-ai.fr/subscribe/success',
                            event_id: eventId,
                            user_data,
                            custom_data: {
                                currency,
                                value,
                                content_type: 'product',
                                content_ids: [`plan-${metadata?.plan_format}-${metadata?.plan_quality}`]
                            }
                        }
                    ]
                };
                await sendMetaEvent(payload);
            } catch (e) {
                console.error('Meta CAPI purchase (plan) failed', e);
            }
        } else if (purchaseType === 'cart') {
            // Cart purchase: update user shipping and mark paid; skip detailed item storage for visitors
            if (userId) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_paid: true,
                        generations_remaining: 15,
                        stripe_customer_id: session.customer ?? null,
                        shipping_name: shippingName,
                        shipping_address_line1: shippingLine1,
                        shipping_address_line2: shippingLine2,
                        shipping_city: shippingCity,
                        shipping_postal_code: shippingPostalCode,
                        shipping_country: shippingCountry,
                    })
                    .eq('id', userId);
                if (error) {
                    console.error('Supabase update error (user cart):', error);
                    return new Response('Failed to update user profile (cart)', { status: 500 });
                }
                console.log(`Cart purchase stored for user ${userId}`);
            } else {
                console.log('Cart purchase completed for visitor', visitorId);
            }
            // Send Purchase via CAPI for cart
            try {
                const eventId = metadata?.fb_event_id || crypto.randomUUID();
                const value = Number(session?.amount_total ? (session.amount_total / 100).toFixed(2) : '0');
                const currency = session?.currency ? String(session.currency).toUpperCase() : 'EUR';
                const email = receiptEmail?.trim().toLowerCase();
                const userAgent = (session?.user_agent || '') as string;
                const ip = (session?.client_ip || '') as string;
                const fbp = metadata?.fbp || undefined;
                const fbc = metadata?.fbc || undefined;
                const pageUrl = metadata?.page_url || undefined;
                const user_data: any = {
                    client_user_agent: userAgent || undefined,
                    client_ip_address: ip || undefined,
                    fbp,
                    fbc,
                };
                if (email) user_data.em = await sha256Hex(email);
                const payload = {
                    data: [
                        {
                            event_name: 'Purchase',
                            event_time: Math.floor(Date.now() / 1000),
                            action_source: 'website',
                            event_source_url: pageUrl || 'https://neoma-ai.fr/poster/success',
                            event_id: eventId,
                            user_data,
                            custom_data: {
                                currency,
                                value,
                                content_type: 'product',
                                content_ids: ['cart']
                            }
                        }
                    ]
                };
                await sendMetaEvent(payload);
            } catch (e) {
                console.error('Meta CAPI purchase (cart) failed', e);
            }
        } else {
            // Poster one-off purchase (legacy behaviour)
            const metaUserId = session?.metadata?.user_id;
            const posterUrl: string | null = metadata?.poster_url ?? null;
            const format: string | null = metadata?.format ?? null;
            const quality: string | null = metadata?.quality ?? null;

            if (metaUserId && metaUserId !== 'anonymous') {
                // Logged in user poster purchase -> update profile with shipping + mark paid
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_paid: true,
                        generations_remaining: 15,
                        stripe_customer_id: session.customer,
                        shipping_name: shippingName,
                        shipping_address_line1: shippingLine1,
                        shipping_address_line2: shippingLine2,
                        shipping_city: shippingCity,
                        shipping_postal_code: shippingPostalCode,
                        shipping_country: shippingCountry,
                    })
                    .eq('id', metaUserId);

                if (error) {
                    console.error('Supabase update error (user poster):', error);
                    return new Response('Failed to update user profile (poster)', { status: 500 });
                }
                console.log(`Poster purchase stored for user ${metaUserId}`);
            } else if (visitorId) {
                // Visitor poster purchase -> insert visitor order record
                const { error } = await supabase
                    .from('visitor_orders')
                    .insert({
                        visitor_id: visitorId,
                        email: receiptEmail,
                        poster_url: posterUrl,
                        format,
                        quality,
                        stripe_session_id: session?.id ?? null,
                        shipping_name: shippingName,
                        shipping_address_line1: shippingLine1,
                        shipping_address_line2: shippingLine2,
                        shipping_city: shippingCity,
                        shipping_postal_code: shippingPostalCode,
                        shipping_country: shippingCountry,
                    });
                if (error) {
                    console.error('Supabase insert error (visitor order):', error);
                    return new Response('Failed to store visitor order', { status: 500 });
                }
                console.log(`Visitor order stored for ${visitorId}`);
            } else {
                console.warn('Poster purchase without user or visitor id');
            }

            // Send Purchase via CAPI for poster
            try {
                const eventId = metadata?.fb_event_id || crypto.randomUUID();
                const value = Number(session?.amount_total ? (session.amount_total / 100).toFixed(2) : '0');
                const currency = session?.currency ? String(session.currency).toUpperCase() : 'EUR';
                const email = receiptEmail?.trim().toLowerCase();
                const userAgent = (session?.user_agent || '') as string;
                const ip = (session?.client_ip || '') as string;
                const fbp = metadata?.fbp || undefined;
                const fbc = metadata?.fbc || undefined;
                const pageUrl = metadata?.page_url || undefined;
                const contentId = `poster-${metadata?.format ?? 'na'}-${metadata?.quality ?? 'na'}`;
                const user_data: any = {
                    client_user_agent: userAgent || undefined,
                    client_ip_address: ip || undefined,
                    fbp,
                    fbc,
                };
                if (email) user_data.em = await sha256Hex(email);
                const payload = {
                    data: [
                        {
                            event_name: 'Purchase',
                            event_time: Math.floor(Date.now() / 1000),
                            action_source: 'website',
                            event_source_url: pageUrl || 'https://neoma-ai.fr/poster/success',
                            event_id: eventId,
                            user_data,
                            custom_data: {
                                currency,
                                value,
                                content_type: 'product',
                                content_ids: [contentId]
                            }
                        }
                    ]
                };
                await sendMetaEvent(payload);
            } catch (e) {
                console.error('Meta CAPI purchase (poster) failed', e);
            }
        }
    } else if (event.type === 'payment_intent.succeeded') {
        const pi: any = event.data.object;
        let metadata = pi?.metadata || {};
        let shipping = pi?.shipping || null;
        let session: any = null;
        try {
            const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
            session = sessions.data?.[0] || null;
        } catch (e) {
            console.warn('Could not list sessions for PI', pi?.id, e);
        }
        if (session) {
            // Prefer session metadata & shipping if available
            metadata = session.metadata || metadata;
            shipping = session.shipping_details || shipping;
        }

        const purchaseType = metadata?.purchase_type || 'poster';
        const userId: string | null = (metadata?.user_id && metadata.user_id !== 'anonymous') ? metadata.user_id : null;
        const visitorId: string | null = metadata?.visitor_id || session?.client_reference_id || null;

        const customerDetails = session?.customer_details || {};
        const shippingName: string | null = (shipping?.name ?? customerDetails?.name) || null;
        const shippingAddress = (shipping?.address || customerDetails?.address) || {};
        const shippingLine1: string | null = shippingAddress?.line1 ?? null;
        const shippingLine2: string | null = shippingAddress?.line2 ?? null;
        const shippingCity: string | null = shippingAddress?.city ?? null;
        const shippingPostalCode: string | null = shippingAddress?.postal_code ?? null;
        const shippingCountry: string | null = shippingAddress?.country ?? null;
        const receiptEmail: string | null = customerDetails?.email ?? pi?.receipt_email ?? null;

        if (purchaseType === 'poster') {
            const posterUrl: string | null = metadata?.poster_url ?? null;
            const format: string | null = metadata?.format ?? null;
            const quality: string | null = metadata?.quality ?? null;

            if (userId) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_paid: true,
                        generations_remaining: 15,
                        stripe_customer_id: session?.customer ?? null,
                        shipping_name: shippingName,
                        shipping_address_line1: shippingLine1,
                        shipping_address_line2: shippingLine2,
                        shipping_city: shippingCity,
                        shipping_postal_code: shippingPostalCode,
                        shipping_country: shippingCountry,
                    })
                    .eq('id', userId);
                if (error) {
                    console.error('Supabase update error (PI user poster):', error);
                    return new Response('Failed to update user profile (PI poster)', { status: 500 });
                }
            } else if (visitorId) {
                const { error } = await supabase
                    .from('visitor_orders')
                    .insert({
                        visitor_id: visitorId,
                        email: receiptEmail,
                        poster_url: posterUrl,
                        format,
                        quality,
                        stripe_session_id: session?.id ?? null,
                        shipping_name: shippingName,
                        shipping_address_line1: shippingLine1,
                        shipping_address_line2: shippingLine2,
                        shipping_city: shippingCity,
                        shipping_postal_code: shippingPostalCode,
                        shipping_country: shippingCountry,
                    });
                if (error) {
                    console.error('Supabase insert error (PI visitor order):', error);
                    return new Response('Failed to store visitor order (PI)', { status: 500 });
                }
            }
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
});