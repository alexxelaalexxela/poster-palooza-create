import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ViewPayload {
  eventName?: 'ViewContent';
  pageUrl?: string;
  fbEventId?: string;
  fbp?: string;
  fbc?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body: ViewPayload = await req.json();
    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID') || Deno.env.get('VITE_META_PIXEL_ID');
    const META_CAPI_ACCESS_TOKEN = Deno.env.get('META_CAPI_ACCESS_TOKEN');
    const META_TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE');
    if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ success: false, error: 'Meta credentials missing' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0] || undefined;
    const eventId = body.fbEventId || crypto.randomUUID();
    const payload = {
      data: [
        {
          event_name: 'ViewContent',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: body.pageUrl || undefined,
          event_id: eventId,
          user_data: {
            client_user_agent: userAgent,
            client_ip_address: ip,
            fbp: body.fbp || undefined,
            fbc: body.fbc || undefined,
          },
        },
      ],
    };
    const res = await fetch(`https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(META_TEST_EVENT_CODE ? { ...payload, test_event_code: META_TEST_EVENT_CODE } : payload),
    });
    const json = await res.json();
    return new Response(JSON.stringify({ success: res.ok, response: json }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


