'use client';

/** Lightweight public tracking helpers (no builder). */

export type LpUtm = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export function readUtmFromLocation(): LpUtm {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get('utm_source') || undefined,
    utmMedium: p.get('utm_medium') || undefined,
    utmCampaign: p.get('utm_campaign') || undefined,
    utmContent: p.get('utm_content') || undefined,
    utmTerm: p.get('utm_term') || undefined,
  };
}

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getOrCreateVisitorId(): string {
  const key = 'lp_vid';
  let id = storageGet(key);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    storageSet(key, id);
  }
  return id;
}

export function getOrCreateSessionId(): string {
  const key = 'lp_sid';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      sessionStorage.setItem(key, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export function detectDevice(): string {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function injectTrackingPixels(config: Record<string, unknown> | null | undefined) {
  if (typeof document === 'undefined' || !config) return;
  const ga4 = typeof config.ga4MeasurementId === 'string' ? config.ga4MeasurementId : '';
  const meta = typeof config.metaPixelId === 'string' ? config.metaPixelId : '';
  const gads = typeof config.googleAdsId === 'string' ? config.googleAdsId : '';

  if (ga4 && !document.getElementById('lp-ga4')) {
    const s = document.createElement('script');
    s.id = 'lp-ga4';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
    document.head.appendChild(s);
    const inline = document.createElement('script');
    inline.id = 'lp-ga4-inline';
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`;
    document.head.appendChild(inline);
  }

  if (meta && !document.getElementById('lp-meta-pixel')) {
    const inline = document.createElement('script');
    inline.id = 'lp-meta-pixel';
    inline.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`;
    document.head.appendChild(inline);
  }

  if (gads && !document.getElementById('lp-gads')) {
    const inline = document.createElement('script');
    inline.id = 'lp-gads';
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${gads}');`;
    document.head.appendChild(inline);
  }

  // Architecture-ready flags (no network call here for CAPI / TikTok)
  void config.metaCapiReady;
  void config.tiktokPixelReady;
}
