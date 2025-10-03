// Minimal TikTok Pixel loader and helpers

type TikTokTrackEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'CompletePayment'
  | 'Purchase';

declare global {
  interface Window {
    ttq?: any;
  }
}

export interface TikTokPixelOptions {
  pixelId: string | undefined;
  autoPageView?: boolean;
}

let tiktokInitialized = false;

export function initTikTokPixel(options: TikTokPixelOptions): void {
  const { pixelId, autoPageView = false } = options;
  if (typeof window === 'undefined') return;
  if (!pixelId) return;
  if (tiktokInitialized) return;

  (function (w: any, d: any, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
      'setUserProperties',
      'clearUserProperties',
    ];
    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: string, n?: any) {
      const i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const o = d.createElement('script');
      o.type = 'text/javascript';
      o.async = true;
      o.src = i + '?sdkid=' + e + '&lib=' + t;
      const a = d.getElementsByTagName('script')[0];
      a.parentNode?.insertBefore(o, a);
    };
  })(window, document, 'ttq');

  window.ttq?.load(pixelId);
  if (autoPageView) {
    window.ttq?.page();
  }

  tiktokInitialized = true;
}

export function trackTikTokPage(): void {
  if (typeof window === 'undefined') return;
  try {
    // Call immediately (queued if library not yet loaded)
    window.ttq?.page();
    // Also register a ready callback to ensure it fires after the library loads
    window.ttq?.ready?.(() => {
      try { window.ttq?.page(); } catch {}
    });
  } catch {}
}

export function trackTikTokEvent(eventName: TikTokTrackEvent, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (params) {
    window.ttq?.track(eventName, params);
  } else {
    window.ttq?.track(eventName);
  }
}


