import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
    is_paid: boolean | null;
    generations_remaining: number;
    subscription_format: string | null;
    subscription_quality: string | null;
    included_poster_selected_url: string | null;
    included_poster_validated: boolean | null;
    shipping_name: string | null;
    shipping_address_line1: string | null;
    shipping_address_line2: string | null;
    shipping_city: string | null;
    shipping_postal_code: string | null;
    shipping_country: string | null;
}

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!user) {
            setProfile(null);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('profiles')
                .select('is_paid, generations_remaining, subscription_format, subscription_quality, included_poster_selected_url, included_poster_validated, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_postal_code, shipping_country')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            setProfile(data as unknown as UserProfile);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { profile, loading, error, refresh };
};


