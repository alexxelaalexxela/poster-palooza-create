import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, CartItem } from '@/store/useCartStore';

function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), waitMs);
  };
}

export function useCartSync() {
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mergedOnce = useRef(false);

  // On login: merge remote cart into local (without duplicating identical items)
  useEffect(() => {
    if (!user) return;
    if (mergedOnce.current) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_carts')
        .select('items')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return;
      const remoteItems = (data?.items as CartItem[] | null) || [];
      if (remoteItems.length > 0) {
        // Merge: add or increase qty for matching items
        for (const it of remoteItems) {
          addItem({ posterUrl: it.posterUrl, format: it.format, quality: it.quality, quantity: it.quantity });
        }
      }
      mergedOnce.current = true;
    })();
  }, [user, addItem]);

  // Debounced upsert on changes (logged-in only)
  useEffect(() => {
    if (!user) return;
    const upsert = debounce(async (payload: CartItem[]) => {
      await supabase.from('user_carts').upsert({ user_id: user.id, items: payload, updated_at: new Date().toISOString() });
    }, 500);
    upsert(items);
    return () => {};
  }, [items, user]);
}


