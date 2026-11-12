'use client';

/**
 * Icon / sticker / scrapbook assets for «Đồ họa» category.
 * Rendered via style.backgroundImage (SVG data-URI) on CTA shape-only blocks.
 */

import type { LandingPageBoxPreset } from './landing-page-box-presets';
import { LP_ICON_SYMBOL_ASSETS } from './landing-page-icon-symbol-presets';

export type LandingPageGraphicsIconGroupId =
  | 'social'
  | 'solid'
  | 'material'
  | 'arrows'
  | 'pattern'
  | 'background'
  | 'contact'
  | 'location'
  | 'badges'
  | 'ui'
  | 'scrapbook'
  | 'clipart';

export type LandingPageGraphicsIconGroup = {
  id: LandingPageGraphicsIconGroupId;
  label: string;
};

export const LP_GRAPHICS_ICON_GROUPS: LandingPageGraphicsIconGroup[] = [
  { id: 'social', label: 'Socials' },
  { id: 'solid', label: 'Icons' },
  { id: 'material', label: 'Material Icons' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'background', label: 'Background' },
  { id: 'contact', label: 'Liên hệ' },
  { id: 'location', label: 'Vị trí' },
  { id: 'badges', label: 'Huy hiệu & biểu tượng' },
  { id: 'ui', label: 'Hình & khung UI' },
  { id: 'scrapbook', label: 'Trang trí scrapbook' },
  { id: 'clipart', label: 'Hình cắt trang trí' },
];

export type LandingPageGraphicsIconAsset = {
  id: string;
  label: string;
  group: LandingPageGraphicsIconGroupId;
  preset: LandingPageBoxPreset;
};

function svgUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
}

function icon(
  id: string,
  label: string,
  group: LandingPageGraphicsIconGroupId,
  opts: {
    svg: string;
    size?: string;
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    pad?: boolean;
  },
): LandingPageGraphicsIconAsset {
  const size = opts.size || '72px';
  const preset: LandingPageBoxPreset = {
    id,
    label,
    category: 'clip',
    style: {
      lpBox: id,
      width: size,
      height: size,
      background: opts.background || 'transparent',
      border: opts.border,
      borderRadius: opts.borderRadius || '0',
      boxShadow: opts.boxShadow,
      backgroundImage: svgUri(opts.svg),
      backgroundSize: opts.pad === false ? '100% 100%' : '68% 68%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    },
  };
  return { id, label, group, preset };
}

function shape(
  id: string,
  label: string,
  group: LandingPageGraphicsIconGroupId,
  style: LandingPageBoxPreset['style'],
): LandingPageGraphicsIconAsset {
  const preset: LandingPageBoxPreset = {
    id,
    label,
    category: 'clip',
    style: { ...style, lpBox: style.lpBox || id },
  };
  return { id, label, group, preset };
}

const WA_PATH =
  'M17.5 14.3c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.4-.3-.5.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2 .6 2.4.6.4 0 1.2-.5 1.3-1 .2-.5.2-.9.1-1zM12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-16.4A7.4 7.4 0 1 0 12 19.4 7.4 7.4 0 0 0 12 4.6z';

export const LP_GRAPHICS_ICON_ASSETS: LandingPageGraphicsIconAsset[] = [
  // Packs from Biểu tượng reference sheets (Socials / Icons / Material / Arrows / Pattern / Background)
  ...(LP_ICON_SYMBOL_ASSETS as LandingPageGraphicsIconAsset[]),

  // —— Social (legacy compact set) ——
  icon('gfx-wa-outline', 'WhatsApp viền', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.6"><path d="${WA_PATH}" fill="#0f172a" stroke="none"/><path d="M12 3a9 9 0 0 0-7.7 13.5L3.5 20.5l4.1-.8A9 9 0 1 0 12 3z" fill="none"/></svg>`,
    background: '#fff',
    borderRadius: '16px',
  }),
  icon('gfx-wa-green', 'WhatsApp xanh', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.3c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.4-.3-.5.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2 .6 2.4.6.4 0 1.2-.5 1.3-1 .2-.5.2-.9.1-1z"/></svg>`,
    background: '#25D366',
    borderRadius: '18px',
  }),
  icon('gfx-ig-gradient', 'Instagram', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none"/></svg>`,
    background: 'linear-gradient(45deg,#f58529,#dd2a7b,#8134af,#515bd4)',
    borderRadius: '18px',
  }),
  icon('gfx-ig-outline', 'Instagram viền', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="#0f172a" stroke="none"/></svg>`,
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  }),
  icon('gfx-ig-faint', 'Instagram nhạt', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="#cbd5e1" stroke="none"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-fb-blue', 'Facebook xanh', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M14.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6H18V4.1C17.5 4 16.5 4 15.4 4c-2.4 0-4 1.5-4 4.2v2.4H8.5v3.2H11.4V22h3.1z"/></svg>`,
    background: '#1877F2',
    borderRadius: '999px',
  }),
  icon('gfx-fb-square', 'Facebook vuông', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#94a3b8" d="M14.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6H18V4.1C17.5 4 16.5 4 15.4 4c-2.4 0-4 1.5-4 4.2v2.4H8.5v3.2H11.4V22h3.1z"/></svg>`,
    background: '#f1f5f9',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
  }),
  icon('gfx-tiktok', 'TikTok', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#69C9D0" d="M16.5 4c.5 1.7 1.8 3 3.5 3.4V10c-1.4-.1-2.7-.6-3.8-1.4v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V4h2.7z"/><path fill="#EE1D52" d="M15.8 4c.5 1.7 1.8 3 3.5 3.4V10c-1.4-.1-2.7-.6-3.8-1.4v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V4h2.7z" opacity=".85" transform="translate(-.6 .4)"/><path fill="#fff" d="M15.2 4.2c.5 1.6 1.7 2.9 3.3 3.3v2.2c-1.3-.1-2.5-.5-3.5-1.3v6.1a5 5 0 1 1-5-5c.3 0 .5 0 .8.1v2.3a2.6 2.6 0 1 0 1.9 2.5V4.2h2.5z"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),
  icon('gfx-globe', 'Globe', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.8 2.5 14.2 0 17M12 3.5c-2.5 2.8-2.5 14.2 0 17"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),

  // —— Contact ——
  icon('gfx-phone', 'Điện thoại', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M7.2 3.4c.4-.4 1-.5 1.5-.3l2.1.8c.5.2.8.7.8 1.2l-.2 2.3c0 .4-.2.7-.5.9l-1.2.9a11.5 11.5 0 0 0 5.3 5.3l.9-1.2c.2-.3.5-.5.9-.5l2.3-.2c.5 0 1 .3 1.2.8l.8 2.1c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C10.4 19 5 13.6 3.6 6.3c-.1-.6.1-1.2.5-1.6L7.2 3.4z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-phone-circle', 'Điện thoại vòng', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#0f172a" stroke-width="1.5"/><path fill="#0f172a" d="M8.4 6.6c.3-.3.7-.4 1.1-.2l1.5.6c.3.1.5.5.5.8l-.1 1.6c0 .3-.1.5-.4.6l-.9.7a8.2 8.2 0 0 0 3.8 3.8l.7-.9c.1-.2.3-.4.6-.4l1.6-.1c.4 0 .7.2.8.5l.6 1.5c.2.4.1.8-.2 1.1l-.9.9c-.3.3-.7.4-1.1.3-4.8-.9-8.6-4.7-9.5-9.5-.1-.4.1-.8.3-1.1l.9-.9z"/></svg>`,
    background: '#fff',
    borderRadius: '999px',
  }),
  icon('gfx-phone-fill', 'Điện thoại nền đen', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M8.4 6.6c.3-.3.7-.4 1.1-.2l1.5.6c.3.1.5.5.5.8l-.1 1.6c0 .3-.1.5-.4.6l-.9.7a8.2 8.2 0 0 0 3.8 3.8l.7-.9c.1-.2.3-.4.6-.4l1.6-.1c.4 0 .7.2.8.5l.6 1.5c.2.4.1.8-.2 1.1l-.9.9c-.3.3-.7.4-1.1.3-4.8-.9-8.6-4.7-9.5-9.5-.1-.4.1-.8.3-1.1l.9-.9z"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),
  icon('gfx-mail-black', 'Email đen', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11zm2 .6 6.5 4.3L18.5 7.1V6.5c0-.3-.2-.5-.5-.5H6c-.3 0-.5.2-.5.5v.6zm13 1.9-6.2 4.1a1.5 1.5 0 0 1-1.6 0L4.5 9v8.5c0 .3.2.5.5.5h12c.3 0 .5-.2.5-.5V9z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-mail-gray', 'Email xám', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#94a3b8" d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11zm2 .6 6.5 4.3L18.5 7.1V6.5c0-.3-.2-.5-.5-.5H6c-.3 0-.5.2-.5.5v.6zm13 1.9-6.2 4.1a1.5 1.5 0 0 1-1.6 0L4.5 9v8.5c0 .3.2.5.5.5h12c.3 0 .5-.2.5-.5V9z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-mail-circle', 'Email nền đen', 'contact', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 16.5v-9zm1.2.4 5.8 3.8 5.8-3.8V7.5c0-.2-.1-.3-.3-.3h-11c-.2 0-.3.1-.3.3v.4zm11.6 1.7-5.4 3.5a1.2 1.2 0 0 1-1.3 0L6.2 9.6v6.9c0 .2.1.3.3.3h11c.2 0 .3-.1.3-.3V9.6z"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),

  // —— Location ——
  icon('gfx-pin-black', 'Pin đen', 'location', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.6 5.4 11.2 6.1 12 .3.4.8.4 1.1 0 .7-.8 6.1-7.4 6.1-12 0-3.6-2.9-6.5-6.8-6.5zm0 8.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-pin-gray', 'Pin xám', 'location', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#94a3b8" d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.6 5.4 11.2 6.1 12 .3.4.8.4 1.1 0 .7-.8 6.1-7.4 6.1-12 0-3.6-2.9-6.5-6.8-6.5zm0 8.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-pin-orange', 'Pin cam', 'location', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f97316" d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.6 5.4 11.2 6.1 12 .3.4.8.4 1.1 0 .7-.8 6.1-7.4 6.1-12 0-3.6-2.9-6.5-6.8-6.5zm0 8.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-pin-outline', 'Pin viền', 'location', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.7"><path d="M12 21s5.5-6.2 5.5-11A5.5 5.5 0 0 0 12 4.5 5.5 5.5 0 0 0 6.5 10c0 4.8 5.5 11 5.5 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-pin-circle', 'Pin nền đen', 'location', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 4.2c-2.7 0-4.9 2.2-4.9 4.9 0 3.5 4.1 8.6 4.6 9.2.2.3.6.3.8 0 .5-.6 4.6-5.7 4.6-9.2 0-2.7-2.2-4.9-5.1-4.9zm0 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),

  // —— Badges ——
  icon('gfx-briefcase', 'Cặp tài liệu', 'badges', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h3.5A1.5 1.5 0 0 1 20 7.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-10A1.5 1.5 0 0 1 5.5 6H9zm2 0h2V5h-2v1z"/></svg>`,
    background: '#0f172a',
    borderRadius: '999px',
  }),
  icon('gfx-heart-red', 'Tim đỏ', 'badges', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ef4444" d="M12 20.4S3.5 14.8 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.6-8.5 11.2-8.5 11.2z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-grad-cap', 'Mũ tốt nghiệp', 'badges', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M12 4 2.5 9.2 12 14.4l8-4.4V16h1.5V9.2L12 4zm-4.5 9.1v3.2c0 1.4 2 2.7 4.5 2.7s4.5-1.3 4.5-2.7v-3.2L12 15.6l-4.5-2.5z"/></svg>`,
    background: 'transparent',
  }),
  icon('gfx-gold-seal', 'Huy chương vàng', 'badges', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2.2 13.6 6l4 .3-3.1 2.6 1 3.9L12 10.8 8.5 12.8l1-3.9L6.4 6.3l4-.3L12 2.2z"/><path fill="#fbbf24" d="M8.2 13.5 10 22l2-2.2L14 22l1.8-8.5-1.8 1.2L12 13.2l-2 1.5-1.8-1.2z"/><circle cx="12" cy="9" r="3.2" fill="#fde68a"/></svg>`,
    background: 'transparent',
    size: '80px',
    pad: false,
  }),
  icon('gfx-star-faint', 'Sao nhạt', 'badges', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#e2e8f0" d="M12 2.5 14.2 9H21l-5.4 4 2.1 6.5L12 15.8 6.3 19.5 8.4 13 3 9h6.8L12 2.5z"/></svg>`,
    background: 'transparent',
  }),

  // —— UI shapes ——
  shape('gfx-ui-circle', 'Tròn đen', 'ui', {
    lpBox: 'gfx-ui-circle',
    width: '72px',
    height: '72px',
    background: '#0f172a',
    borderRadius: '999px',
  }),
  shape('gfx-ui-square', 'Vuông đen', 'ui', {
    lpBox: 'gfx-ui-square',
    width: '72px',
    height: '72px',
    background: '#0f172a',
    borderRadius: '6px',
  }),
  shape('gfx-ui-pill-sage', 'Pill xanh sage', 'ui', {
    lpBox: 'gfx-ui-pill-sage',
    width: '120px',
    height: '44px',
    background: '#a3b18a',
    borderRadius: '999px',
  }),
  shape('gfx-ui-pill-teal', 'Pill teal', 'ui', {
    lpBox: 'gfx-ui-pill-teal',
    width: '120px',
    height: '44px',
    background: '#2a9d8f',
    borderRadius: '999px',
  }),
  shape('gfx-ui-frame', 'Khung xám', 'ui', {
    lpBox: 'gfx-ui-frame',
    width: '100px',
    height: '72px',
    background: 'transparent',
    border: '2px solid #94a3b8',
    borderRadius: '4px',
  }),
  shape('gfx-ui-frame-sketch', 'Khung sketch', 'ui', {
    lpBox: 'gfx-ui-frame-sketch',
    width: '100px',
    height: '72px',
    background: '#fff',
    border: '2px dashed #64748b',
    borderRadius: '2px',
    boxShadow: '2px 2px 0 rgba(100,116,139,0.25)',
  }),
  shape('gfx-ui-bar-shadow', 'Thanh bóng', 'ui', {
    lpBox: 'gfx-ui-bar-shadow',
    width: '120px',
    height: '36px',
    background: '#e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 8px 0 rgba(148,163,184,0.45)',
  }),
  shape('gfx-ui-grad-bar', 'Thanh gradient', 'ui', {
    lpBox: 'gfx-ui-grad-bar',
    width: '140px',
    height: '48px',
    background: 'linear-gradient(90deg,#0f172a,#f8fafc)',
    borderRadius: '8px',
  }),
  shape('gfx-ui-yellow-bar', 'Thanh vàng', 'ui', {
    lpBox: 'gfx-ui-yellow-bar',
    width: '140px',
    height: '40px',
    background: '#facc15',
    borderRadius: '6px',
  }),
  shape('gfx-ui-white-card', 'Thẻ trắng', 'ui', {
    lpBox: 'gfx-ui-white-card',
    width: '72px',
    height: '100px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
  }),

  // —— Scrapbook ——
  shape('gfx-paper-torn', 'Giấy rách chữ', 'scrapbook', {
    lpBox: 'gfx-paper-torn',
    width: '110px',
    height: '72px',
    background:
      'repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(120,80,40,0.12) 13px, rgba(120,80,40,0.12) 14px), linear-gradient(135deg,#f5e6c8,#efe0b8)',
    borderRadius: '2px 18px 4px 22px / 4px 8px 20px 6px',
    boxShadow: '0 3px 8px rgba(15,23,42,0.12)',
    clipPath: 'polygon(0 8%, 8% 0, 92% 2%, 100% 12%, 98% 88%, 90% 100%, 10% 96%, 0 85%)',
  }),
  shape('gfx-paper-tape', 'Băng dán', 'scrapbook', {
    lpBox: 'gfx-paper-tape',
    width: '120px',
    height: '28px',
    background: 'linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.8))',
    border: '1px solid rgba(148,163,184,0.35)',
    boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
    clipPath: 'polygon(0 20%, 4% 0, 96% 5%, 100% 25%, 98% 80%, 94% 100%, 6% 95%, 0 75%)',
    opacity: 0.92,
  }),
  shape('gfx-paper-deckle', 'Giấy deckle', 'scrapbook', {
    lpBox: 'gfx-paper-deckle',
    width: '100px',
    height: '72px',
    background: 'linear-gradient(145deg,#e7d3b0,#d4b896)',
    boxShadow: '0 4px 10px rgba(15,23,42,0.12)',
    clipPath:
      'polygon(2% 6%, 10% 0, 22% 4%, 40% 0, 58% 5%, 78% 1%, 95% 6%, 100% 20%, 96% 40%, 100% 58%, 94% 78%, 100% 92%, 86% 100%, 68% 96%, 48% 100%, 28% 95%, 10% 100%, 0 84%, 4% 62%, 0 40%, 5% 22%)',
  }),
  shape('gfx-paper-parchment', 'Giấy parchment', 'scrapbook', {
    lpBox: 'gfx-paper-parchment',
    width: '72px',
    height: '100px',
    background:
      'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 40%), linear-gradient(160deg,#c4a574,#8b6914 60%,#a67c3d)',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
  }),
  icon('gfx-floral-tape', 'Hoa dán băng', 'scrapbook', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="18" y="8" width="28" height="10" rx="1" fill="#fb923c" opacity=".75" transform="rotate(-12 32 13)"/><path d="M30 18c0 10 2 22 2 30" stroke="#78716c" stroke-width="1.4" fill="none"/><circle cx="28" cy="28" r="3" fill="#fbbf24"/><circle cx="34" cy="34" r="2.5" fill="#f59e0b"/><circle cx="27" cy="40" r="2.2" fill="#eab308"/><path d="M32 36c4 2 7 1 8-2" stroke="#a8a29e" stroke-width="1" fill="none"/></svg>`,
    size: '80px',
    background: 'transparent',
    pad: false,
  }),
  shape('gfx-dot-grid', 'Lưới chấm', 'scrapbook', {
    lpBox: 'gfx-dot-grid',
    width: '100px',
    height: '64px',
    background:
      'radial-gradient(circle, #94a3b8 1.2px, transparent 1.3px) 0 0 / 10px 10px',
    borderRadius: '4px',
  }),
  shape('gfx-zigzag', 'Đường răng cưa', 'scrapbook', {
    lpBox: 'gfx-zigzag',
    width: '100px',
    height: '16px',
    background: '#fff',
    border: '1.5px solid #cbd5e1',
    clipPath: 'polygon(0 50%, 8% 0, 16% 100%, 24% 0, 32% 100%, 40% 0, 48% 100%, 56% 0, 64% 100%, 72% 0, 80% 100%, 88% 0, 96% 100%, 100% 50%, 96% 0, 88% 100%, 80% 0, 72% 100%, 64% 0, 56% 100%, 48% 0, 40% 100%, 32% 0, 24% 100%, 16% 0, 8% 100%)',
  }),
];
