// src/hooks/useUnifiedPosters.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFingerprint } from '@/hooks/useFingerprint';

interface PosterData {
    url: string;
    created_at: string;
    id: string;
}

export function useUnifiedPosters() {
    const { user } = useAuth();
    const visitorId = useFingerprint();
    const [posters, setPosters] = useState<PosterData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosters = useCallback(async () => {
        if (!user?.id && !visitorId) return;

        setLoading(true);
        setError(null);

        try {
            let allPosters: PosterData[] = [];

            if (user?.id) {
                // 1. Posters directement liés à l'utilisateur
                const { data: userPosters, error: userError } = await supabase
                    .from('visitor_posters')
                    .select('url, created_at, id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (userError) {
                    console.error("Error fetching user posters:", userError);
                } else if (userPosters) {
                    allPosters.push(...userPosters);
                }

                // 2. Posters des visitor_id historiques (via visitor_user_links)
                const { data: historicalVisitorIds, error: linksError } = await supabase
                    .from('visitor_user_links')
                    .select('visitor_id')
                    .eq('user_id', user.id);

                if (!linksError && historicalVisitorIds && historicalVisitorIds.length > 0) {
                    const visitorIdsList = historicalVisitorIds.map(link => link.visitor_id);
                    
                    for (const histVisitorId of visitorIdsList) {
                        const { data: historicalPosters, error: histError } = await supabase
                            .from('visitor_posters')
                            .select('url, created_at, id')
                            .eq('visitor_id', histVisitorId)
                            .is('user_id', null) // Seulement ceux pas encore claim
                            .order('created_at', { ascending: false });

                        if (!histError && historicalPosters) {
                            allPosters.push(...historicalPosters);
                        }
                    }
                }

                // 3. Posters du visitor_id actuel (session en cours)
                if (visitorId) {
                    const { data: currentVisitorPosters, error: currentError } = await supabase
                        .from('visitor_posters')
                        .select('url, created_at, id')
                        .eq('visitor_id', visitorId)
                        .is('user_id', null) // Seulement ceux pas encore claim
                        .order('created_at', { ascending: false });

                    if (!currentError && currentVisitorPosters) {
                        allPosters.push(...currentVisitorPosters);
                    }
                }
            } else if (visitorId) {
                // Utilisateur anonyme : seulement les posters du visitor_id actuel
                const { data: anonymousPosters, error: anonError } = await supabase
                    .from('visitor_posters')
                    .select('url, created_at, id')
                    .eq('visitor_id', visitorId)
                    .order('created_at', { ascending: false });

                if (anonError) {
                    console.error("Error fetching anonymous posters:", anonError);
                    setError(anonError.message);
                } else if (anonymousPosters) {
                    allPosters.push(...anonymousPosters);
                }
            }

            // Déduplication par URL
            const unique = Array.from(new Map(allPosters.map(p => [p.url, p])).values());
            // Tri par date décroissante
            unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setPosters(unique);

        } catch (err) {
            console.error("Exception fetching unified posters:", err);
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }, [user?.id, visitorId]);

    useEffect(() => {
        fetchPosters();
    }, [fetchPosters]);

    return {
        posters,
        loading,
        error,
        refresh: fetchPosters,
        urls: posters.map(p => p.url)
    };
}
