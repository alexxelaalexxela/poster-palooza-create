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

// Netlify Image CDN helpers
// Base: /.netlify/images?url=<path>&w=<width>&q=<quality>&fit=<fit>
export type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

function isAbsoluteOrDataUrl(src: string): boolean {
  return /^(?:https?:)?\/\//i.test(src) || src.startsWith('data:');
}

function shouldUseNetlifyImages(src: string): boolean {
  // Do not transform in dev/local preview
  const isDev = !!(import.meta as any)?.env?.DEV;
  if (isDev) return false;
  // Only transform local assets by default
  if (isAbsoluteOrDataUrl(src)) return false;
  // Allow opt-in via env for remote transformation if needed later
  const allowRemote = ((import.meta as any)?.env?.VITE_NETLIFY_REMOTE_IMAGES as string | undefined) === 'true';
  return allowRemote || src.startsWith('/');
}

export function buildNetlifyImageUrl(
  src: string,
  opts?: { width?: number; quality?: number; fit?: FitMode }
): string {
  if (!shouldUseNetlifyImages(src)) {
    return src;
  }
  const normalized = src.startsWith('/') ? src : `/${src}`;
  const params = new URLSearchParams();
  params.set('url', normalized);
  if (opts?.width) params.set('w', String(opts.width));
  params.set('q', String(opts?.quality ?? 75));
  params.set('fit', String(opts?.fit ?? 'cover'));
  return `/.netlify/images?${params.toString()}`;
}

export function buildNetlifySrcSet(
  src: string,
  widths: number[],
  opts?: { quality?: number; fit?: FitMode }
): string {
  if (!shouldUseNetlifyImages(src)) {
    // No transformation available → return empty srcset to avoid broken URLs in dev
    return '';
  }
  return widths
    .map((w) => `${buildNetlifyImageUrl(src, { width: w, quality: opts?.quality, fit: opts?.fit })} ${w}w`)
    .join(', ');
}
