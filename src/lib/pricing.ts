// Centralized pricing table for posters
// Prices are stored in cents (EUR)

export type Format = 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
export type Quality = 'classic' | 'premium' | 'museum';

type PriceKey = `${Format}-${Quality}`;

// New prices with psychological ",99" endings
// Standard => classic
// Premium  => premium
// Museum   => museum
export const PRICE_CENTS: Record<PriceKey, number> = {
  // A4
  'A4-classic': 4499,  // 44,99 € (Standard A4)
  'A4-premium': 5299,  // 52,99 € (Premium A4)
  'A4-museum': 5499,   // 54,99 € (Museum A4)

  // A3
  'A3-classic': 5499,  // 54,99 €
  'A3-premium': 6499,  // 64,99 €
  'A3-museum': 6999,   // 69,99 €

  // A2
  'A2-classic': 6499,  // 64,99 €
  'A2-premium': 7499,  // 74,99 €
  'A2-museum': 7999,   // 79,99 €

  // A1
  'A1-classic': 8499,  // 84,99 €
  'A1-premium': 9799,  // 97,99 €
  'A1-museum': 10499,  // 104,99 €

  // A0
  'A0-classic': 10499, // 104,99 €
  'A0-premium': 12499, // 124,99 €
  'A0-museum': 13499,  // 134,99 €
};

export function getPriceCents(format: Format, quality: Quality): number {
  return PRICE_CENTS[`${format}-${quality}`];
}

export function getPriceEuros(format: Format, quality: Quality): number {
  return getPriceCents(format, quality) / 100;
}


