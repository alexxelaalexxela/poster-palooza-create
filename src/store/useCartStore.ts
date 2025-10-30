import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Format, Quality } from '@/lib/pricing';
import { getPriceEuros, SHIPPING_FEE_CENTS } from '@/lib/pricing';

export interface CartItem {
  posterUrl: string;
  format: Format;
  quality: Quality;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (input: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (posterUrl: string, format: Format, quality: Quality) => void;
  setQuantity: (posterUrl: string, format: Format, quality: Quality, quantity: number) => void;
  clear: () => void;
  getSubtotal: () => number; // subtotal excluding shipping (aligns with pre-order pricing)
  getTotalQuantity: () => number;
}

function computeUnitPriceExShipping(format: Format, quality: Quality): number {
  // Align with pre-order pricing: subtract shipping from item price on pre-order/cart screens.
  const euros = getPriceEuros(format, quality);
  const eurosMinusShipping = Math.max(0, euros - SHIPPING_FEE_CENTS / 100);
  return Number(eurosMinusShipping.toFixed(2));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ posterUrl, format, quality, quantity = 1 }) => {
        if (!posterUrl || !format || !quality) return;
        if (quantity <= 0) return;
        const next = [...get().items];
        const idx = next.findIndex(
          (it) => it.posterUrl === posterUrl && it.format === format && it.quality === quality,
        );
        if (idx !== -1) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        } else {
          next.push({ posterUrl, format, quality, quantity });
        }
        set({ items: next });
      },

      removeItem: (posterUrl, format, quality) => {
        set({
          items: get().items.filter(
            (it) => !(it.posterUrl === posterUrl && it.format === format && it.quality === quality),
          ),
        });
      },

      setQuantity: (posterUrl, format, quality, quantity) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter(
              (it) => !(it.posterUrl === posterUrl && it.format === format && it.quality === quality),
            ),
          });
          return;
        }
        const next = get().items.map((it) =>
          it.posterUrl === posterUrl && it.format === format && it.quality === quality
            ? { ...it, quantity }
            : it,
        );
        set({ items: next });
      },

      clear: () => set({ items: [] }),

      getSubtotal: () => {
        return get()
          .items
          .reduce((sum, it) => sum + computeUnitPriceExShipping(it.format, it.quality) * it.quantity, 0);
      },

      getTotalQuantity: () => get().items.reduce((sum, it) => sum + it.quantity, 0),
    }),
    {
      name: 'neoma-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

export function unitPriceLabel(format: Format, quality: Quality): string {
  return formatEuro(computeUnitPriceExShipping(format, quality));
}


