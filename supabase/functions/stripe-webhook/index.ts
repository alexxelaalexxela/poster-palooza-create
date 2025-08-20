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

    if (event.type === 'checkout.session.completed') {
        const session: any = event.data.object;
        const metadata = session?.metadata || {};
        const purchaseType = metadata?.purchase_type || 'poster';
        let userId: string | null = (metadata?.user_id && metadata.user_id !== 'anonymous') ? metadata.user_id : null;

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
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updatePayload, { onConflict: 'id' });

            if (error) {
                console.error('Supabase upsert error:', error);
                return new Response('Failed to update user profile (plan)', { status: 500 });
            }

            console.log(`Successfully upgraded user (plan): ${userId}`);
        } else {
            // Poster one-off purchase (legacy behaviour)
            const userIdFromMeta = session?.metadata?.user_id;
            if (!userIdFromMeta) {
                console.error('Webhook Error: No user_id in Stripe session metadata');
                return new Response('User ID not found in session metadata', { status: 400 });
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    is_paid: true,
                    generations_remaining: 15, // Débloque le quota
                    stripe_customer_id: session.customer,
                })
                .eq('id', userIdFromMeta);

            if (error) {
                console.error('Supabase update error:', error);
                return new Response('Failed to update user profile', { status: 500 });
            }

            console.log(`Successfully upgraded user: ${userIdFromMeta}`);
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
});