// Minimal Meta Pixel loader and helpers

type FbqCommand = 'init' | 'track' | 'consent' | 'set' | 'data' | 'event';

declare global {
  interface Window {
    fbq?: (
      command: FbqCommand,
      param1?: string | number | Record<string, unknown>,
      param2?: Record<string, unknown>
    ) => void;
    _fbq?: unknown;
  }
}

export interface MetaPixelOptions {
  pixelId: string | undefined;
  autoPageView?: boolean;
}

let pixelInitialized = false;

export function initMetaPixel(options: MetaPixelOptions): void {
  const { pixelId, autoPageView = false } = options;
  if (typeof window === 'undefined') return;
  if (!pixelId) return;
  if (pixelInitialized) return;

  // Inject base code once
  (function initFbq(i: any, s: any, o: any, g: any, r: any, a?: any, m?: any) {
    if (i.fbq) return;
    r = i.fbq = function (...args: any[]) {
      (r as any).callMethod ? (r as any).callMethod.apply(r, args) : (r as any).queue.push(args);
    };
    if (!i._fbq) i._fbq = r;
    (r as any).push = (r as any);
    (r as any).loaded = true;
    (r as any).version = '2.0';
    (r as any).queue = [];
    a = s.createElement(o);
    a.async = true;
    a.src = g;
    m = s.getElementsByTagName(o)[0];
    m.parentNode?.insertBefore(a, m);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq?.('init', pixelId);

  if (autoPageView) {
    // Track initial page view
    window.fbq?.('track', 'PageView');
  }

  pixelInitialized = true;
}

export function trackPageView(): void {
  if (typeof window === 'undefined') return;
  window.fbq?.('track', 'PageView');
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (params) {
    window.fbq?.('track', eventName, params);
  } else {
    window.fbq?.('track', eventName);
  }
}

// Same as trackEvent but allows passing a specific eventID for deduplication with Conversions API
export function trackEventWithId(eventName: string, params: Record<string, unknown> | undefined, eventId?: string): void {
  if (typeof window === 'undefined') return;
  const fbq: any = (typeof window !== 'undefined' ? (window as any).fbq : undefined);
  if (!fbq) return;
  if (eventId) {
    fbq('track', eventName, params || {}, { eventID: eventId });
  } else {
    fbq('track', eventName, params || {});
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getFbp(): string | undefined {
  return readCookie('_fbp');
}

export function getFbc(): string | undefined {
  // Prefer cookie if set
  const fromCookie = readCookie('_fbc');
  if (fromCookie) return fromCookie;
  if (typeof window === 'undefined') return undefined;
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get('fbclid');
  if (!fbclid) return undefined;
  // Format: fb.1.<timestamp>.<fbclid>
  // Use milliseconds since epoch, to match Meta's _fbc cookie format
  const ts = Date.now();
  return `fb.1.${ts}.${fbclid}`;
}


