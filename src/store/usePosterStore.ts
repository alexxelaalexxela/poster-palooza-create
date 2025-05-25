
import { create } from 'zustand';

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

export type Format = 'A2' | 'A3' | 'A4' | 'A5';
export type Quality = 'paper1' | 'paper2';

interface PosterStore {
  selectedTemplate: number | null;
  selectedPoster: number | null;
  selectedFormat: Format | null;
  selectedQuality: Quality | null;
  price: number;
  
  setSelectedTemplate: (id: number | null) => void;
  setSelectedPoster: (id: number | null) => void;
  setSelectedFormat: (format: Format | null) => void;
  setSelectedQuality: (quality: Quality | null) => void;
  calculatePrice: () => void;
  canOrder: () => boolean;
}

export const usePosterStore = create<PosterStore>((set, get) => ({
  selectedTemplate: null,
  selectedPoster: null,
  selectedFormat: null,
  selectedQuality: null,
  price: 60,

  setSelectedTemplate: (id) => {
    set({ selectedTemplate: id });
    get().calculatePrice();
  },

  setSelectedPoster: (id) => {
    set({ selectedPoster: id });
    get().calculatePrice();
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
    const { selectedFormat, selectedQuality } = get();
    let price = 60; // base price
    
    if (selectedFormat === 'A2') price += 10;
    if (selectedQuality === 'paper2') price += 5;
    
    set({ price });
  },

  canOrder: () => {
    const { selectedPoster, selectedFormat, selectedQuality } = get();
    return selectedPoster !== null && selectedFormat !== null && selectedQuality !== null;
  },
}));
