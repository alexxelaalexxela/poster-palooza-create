import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetAttemptsRequest {
  visitorId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visitorId }: GetAttemptsRequest = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization') || '';

    let userId: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    let attemptsRemaining = 0;
    let isPaid = false;

    if (userId) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_paid, generations_remaining')
        .eq('id', userId)
        .single();
      if (error) throw error;
      attemptsRemaining = Math.max(0, profile?.generations_remaining ?? 0);
      isPaid = !!profile?.is_paid;
    } else if (visitorId) {
      const { data: visitorData, error } = await supabase
        .from('visitor_user_links')
        .select('generation_count')
        .eq('visitor_id', visitorId)
        .single();
      if (error && (error as any).code !== 'PGRST116') throw error;
      const used = visitorData?.generation_count ?? 0;
      attemptsRemaining = Math.max(0, 3 - used);
      isPaid = false;
    }

    return new Response(
      JSON.stringify({ success: true, attemptsRemaining, isPaid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-attempts function:', error);
    return new Response(JSON.stringify({ success: false, error: (error as any)?.message || 'Failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});





