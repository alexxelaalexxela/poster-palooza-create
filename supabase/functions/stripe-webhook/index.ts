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
        const session = event.data.object;
        const userId = session?.metadata?.user_id;

        if (!userId) {
            console.error('Webhook Error: No user_id in Stripe session metadata');
            return new Response('User ID not found in session metadata', { status: 400 });
        }

        // Mettre à jour le profil utilisateur
        const { error } = await supabase
            .from('profiles')
            .update({
                is_paid: true,
                generations_remaining: 15, // Débloque le quota
                stripe_customer_id: session.customer,
            })
            .eq('id', userId);

        if (error) {
            console.error('Supabase update error:', error);
            return new Response('Failed to update user profile', { status: 500 });
        }

        console.log(`Successfully upgraded user: ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
});