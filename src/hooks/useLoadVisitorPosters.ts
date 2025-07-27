// src/hooks/useLoadVisitorPosters.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePosterStore } from '@/store/usePosterStore';
import { useFingerprint } from '@/hooks/useFingerprint';

export function useLoadVisitorPosters() {
    const { setCachedUrls } = usePosterStore();
    const visitorId = useFingerprint();

    useEffect(() => {
        if (!visitorId) return;                  // attend l’empreinte
        (async () => {
            const { data, error } = await supabase
                .from('visitor_posters')
                .select('url')
                .eq('visitor_id', visitorId)
                .order('created_at', { ascending: false })
                .limit(20);                          // par ex.

            if (!error && data) {
                setCachedUrls(data.map((d) => d.url));
            }
        })();
    }, [visitorId, setCachedUrls]);
}
