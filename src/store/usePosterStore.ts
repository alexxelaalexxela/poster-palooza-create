
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

export type Format = 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
export type Quality = 'classic' | 'premium' | 'museum' | 'paper2';

interface PosterStore {
  selectedTemplate: number | null;
  selectedPoster: number | null;
  selectedFormat: Format | 'A2';
  selectedQuality: Quality | null;
  price: number;
  generatedUrls: string[];

  setSelectedTemplate: (id: number | null) => void;
  setSelectedPoster: (id: number | null) => void;
  setSelectedFormat: (format: Format | null) => void;
  setSelectedQuality: (quality: Quality | null) => void;
  calculatePrice: () => void;
  canOrder: () => boolean;
  setGeneratedUrls: (urls: string[]) => void;
}

export const usePosterStore = create<PosterStore>((set, get) => ({
  selectedTemplate: 2,
  selectedPoster: null,
  selectedFormat: null,
  selectedQuality: null,
  price: 60,
  generatedUrls: [],

  setSelectedTemplate: (id) => {
    set({ selectedTemplate: id });
    get().calculatePrice();
  },
  setGeneratedUrls: (urls) => set({ generatedUrls: urls }),

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

    if (selectedFormat === 'A0') price += 30;
    if (selectedFormat === 'A1') price += 20;
    if (selectedFormat === 'A2') price += 10;
    if (selectedFormat === 'A4') price -= 10;

    if (selectedQuality === 'premium') price += 10;
    if (selectedQuality === 'museum') price += 20;

    set({ price });
  },

  canOrder: () => {
    const { selectedPoster, selectedFormat, selectedQuality } = get();
    return selectedPoster !== null && selectedFormat !== null;
  },
}));
