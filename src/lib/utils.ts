import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// SEO helpers
export const SITE_URL: string = ((): string => {
  // Prefer Vite env if provided; fallback to production domain
  const fromVite = (import.meta as any).env?.VITE_SITE_URL as string | undefined;
  const fromRuntime = (globalThis as any).SITE_URL as string | undefined;
  return (fromVite || fromRuntime || 'https://neoma-ai.fr').replace(/\/$/, '');
})();

export function buildCanonical(pathname?: string): string {
  const path = pathname && pathname.startsWith('/') ? pathname : `/${pathname || ''}`;
  try {
    const url = new URL(path, SITE_URL);
    // Normalize trailing slash for canonical consistency
    url.pathname = url.pathname.replace(/\/$/, '') || '/';
    return url.toString();
  } catch {
    return `${SITE_URL}${path}`;
  }
}

export function truncate(text: string, max = 155): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
