
import { create } from 'zustand';
import { getPriceEuros, SHIPPING_FEE_CENTS } from '@/lib/pricing';

export interface Template {
  id: number;
  name: string;
  image: string;
}


export interface PosterResult {
  id: string;
  url: string;
  prompt: string;
  originalPrompt: string;
}

export type Format = 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
export type Quality = 'classic' | 'premium' | 'museum' | 'paper2';

interface PosterStore {
  selectedTemplate: number | null;
  selectedPoster: number | null;
  selectedPosterUrl: string | null;
  // Library selection (poster catalog)
  selectedLibraryPosterId: string | null;
  // Iteration reference from an existing poster URL
  improvementRefUrl: string | null;
  selectedFormat: Format | 'A2';
  selectedQuality: Quality | null;
  price: number;
  generatedUrls: string[];
  cachedUrls: string[];

  // Promo code state
  promoCode: string | null;
  promoApplied: boolean;
  promoPercent: number; // e.g., 25 for 25%

  setSelectedTemplate: (id: number | null) => void;
  setSelectedPoster: (id: number | null) => void;
  setSelectedPosterUrl: (url: string | null) => void;
  setSelectedLibraryPosterId: (id: string | null) => void;
  clearSelectedLibraryPoster: () => void;
  setImprovementRefUrl: (url: string | null) => void;
  setSelectedFormat: (format: Format | null) => void;
  setSelectedQuality: (quality: Quality | null) => void;
  calculatePrice: () => void;
  canOrder: () => boolean;
  setGeneratedUrls: (urls: string[]) => void;
  setCachedUrls: (urls: string[]) => void;

  // Promo code actions
  setPromoCode: (code: string) => void;
  applyPromoCode: (code: string) => boolean; // returns true if applied
  clearPromoCode: () => void;
}

export const usePosterStore = create<PosterStore>((set, get) => ({

  selectedTemplate: 1,
  selectedPoster: null,
  selectedPosterUrl: null,
  selectedLibraryPosterId: null,
  improvementRefUrl: null,
  selectedFormat: null,
  selectedQuality: 'classic',
  price: 0,
  generatedUrls: [],
  cachedUrls: [],

  // Promo defaults
  promoCode: null,
  promoApplied: false,
  promoPercent: 0,

  setSelectedTemplate: (id) => {
    set({ selectedTemplate: id });
    get().calculatePrice();
  },

  setCachedUrls: (urls) => set({ cachedUrls: urls }),
  setGeneratedUrls: (urls) => set({ generatedUrls: urls }),

  setSelectedPoster: (id) => {
    set({ selectedPoster: id });
    get().calculatePrice();
  },

  setSelectedPosterUrl: (url) => {
    set({ selectedPosterUrl: url });
    get().calculatePrice();
  },

  setSelectedLibraryPosterId: (id) => {
    set({ selectedLibraryPosterId: id });
    // Do not persist selection automatically; only session-level state
  },

  setImprovementRefUrl: (url) => {
    set({ improvementRefUrl: url });
  },

  clearSelectedLibraryPoster: () => {
    set({ selectedLibraryPosterId: null });
  },

  setSelectedFormat: (format) => {
    set({ selectedFormat: format });
    get().calculatePrice();
  },

  setSelectedQuality: (quality) => {
    set({ selectedQuality: quality });
    get().calculatePrice();
  },

  calculatePrice: () => {
    const { selectedFormat, selectedQuality, promoApplied, promoPercent } = get();
    if (!selectedFormat || !selectedQuality) {
      set({ price: 0 });
      return;
    }
    const normalizedQuality = selectedQuality === 'paper2' ? 'premium' : selectedQuality;
    const euros = getPriceEuros(selectedFormat as any, normalizedQuality as any);
    // Subtract shipping (4.99) on all pre-order pages, Order page will add it back
    const eurosMinusShipping = Math.max(0, euros - SHIPPING_FEE_CENTS / 100);
    const discounted = promoApplied && (promoPercent || 0) > 0
      ? Math.max(0, eurosMinusShipping * (1 - (promoPercent! / 100)))
      : eurosMinusShipping;
    set({ price: Number(discounted.toFixed(2)) });
  },

  canOrder: () => {
    const { selectedPoster, selectedFormat, selectedQuality } = get();
    return selectedPoster !== null && selectedFormat !== null && selectedQuality !== null;
  },

  // Promo code helpers
  setPromoCode: (code) => set({ promoCode: code }),
  applyPromoCode: (code) => {
    const normalized = (code || '').trim().toUpperCase();
    // Simple built-in validation: NEOMA25 -> 25%
    const validCodes: Record<string, number> = {
      'NEOMA25': 25,
      'FIRST100': 50,
    };
    const percent = validCodes[normalized];
    if (percent) {
      set({ promoCode: normalized, promoApplied: true, promoPercent: percent });
      get().calculatePrice();
      return true;
    }
    // Not valid
    set({ promoApplied: false, promoPercent: 0 });
    get().calculatePrice();
    return false;
  },
  clearPromoCode: () => {
    set({ promoCode: null, promoApplied: false, promoPercent: 0 });
    get().calculatePrice();
  },
}));
