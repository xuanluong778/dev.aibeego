'use client';

/**
 * Additive icon packs for «Biểu tượng» / Đồ họa → graphics:
 * Socials · Icons (solid) · Material · Arrows · Pattern · Background
 * Inserted as CTA shape-only via backgroundImage SVG data-URI.
 */

import type { LandingPageBoxPreset } from './landing-page-box-presets';

export type IconSymbolGroupId =
  | 'social'
  | 'solid'
  | 'material'
  | 'arrows'
  | 'pattern'
  | 'background';

export type IconSymbolAsset = {
  id: string;
  label: string;
  group: IconSymbolGroupId;
  preset: LandingPageBoxPreset;
};

function svgUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
}

function icon(
  id: string,
  label: string,
  group: IconSymbolGroupId,
  opts: {
    svg: string;
    size?: string;
    width?: string;
    height?: string;
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    pad?: boolean;
    bgSize?: string;
  },
): IconSymbolAsset {
  const w = opts.width || opts.size || '72px';
  const h = opts.height || opts.size || '72px';
  const preset: LandingPageBoxPreset = {
    id,
    label,
    category: 'clip',
    style: {
      lpBox: id,
      width: w,
      height: h,
      background: opts.background || 'transparent',
      border: opts.border,
      borderRadius: opts.borderRadius || '0',
      boxShadow: opts.boxShadow,
      backgroundImage: svgUri(opts.svg),
      backgroundSize: opts.bgSize || (opts.pad === false ? '100% 100%' : '68% 68%'),
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    },
  };
  return { id, label, group, preset };
}

const G = '#374151';
const M = '#6b7280';

/** Brand / solid / material / arrow / pattern / background packs from reference sheets. */
export const LP_ICON_SYMBOL_ASSETS: IconSymbolAsset[] = [
  // ═══ SOCIALS (brand) ═══
  icon('ico-fb', 'Facebook', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M14.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6H18V4.1C17.5 4 16.5 4 15.4 4c-2.4 0-4 1.5-4 4.2v2.4H8.5v3.2H11.4V22h3.1z"/></svg>`,
    background: '#1877F2',
    borderRadius: '999px',
  }),
  icon('ico-ig', 'Instagram', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none"/></svg>`,
    background: 'linear-gradient(45deg,#f58529,#dd2a7b,#8134af,#515bd4)',
    borderRadius: '14px',
  }),
  icon('ico-line', 'LINE', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 4.2c-4.6 0-8.3 3-8.3 6.7 0 3.3 2.9 6.1 6.9 6.6.3 0 .6.2.7.5l.5 1.5c.1.3.4.4.7.3 3.1-1.3 7.8-3.7 7.8-8.9C20.3 7.2 16.6 4.2 12 4.2zm-3.2 9.2H7.3V9.1h1.5v4.3zm2.6 0H10v-4.3h1.4v4.3zm.7-2.7c0 1.5-1.2 1.6-1.2 1.6v1.1s1.9.1 2.6-1.4c.3-.6.3-1.3.3-1.3h-1.7v0zm4.6 2.7h-1.4l-1.5-2v2h-1.4V9.1h1.4l1.5 2.1V9.1h1.4v4.3z"/></svg>`,
    background: '#06C755',
    borderRadius: '14px',
  }),
  icon('ico-linkedin', 'LinkedIn', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M6.6 9.2H9v9.1H6.6V9.2zM7.8 5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM10.8 9.2h2.3v1.2h.1c.3-.6 1.2-1.4 2.5-1.4 2.7 0 3.2 1.8 3.2 4.1v5.2h-2.4v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4v4.7h-2.4V9.2z"/></svg>`,
    background: '#0A66C2',
    borderRadius: '10px',
  }),
  icon('ico-messenger', 'Messenger', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2c-4.8 0-8.6 3.5-8.6 7.8 0 2.5 1.2 4.7 3.2 6.1V21l2.9-1.6c.8.2 1.6.3 2.5.3 4.8 0 8.6-3.5 8.6-7.8S16.8 3.2 12 3.2zm.9 10.5-2.2-2.3-4.3 2.3 4.7-5 2.3 2.3 4.2-2.3-4.7 5z"/></svg>`,
    background: 'linear-gradient(135deg,#00B2FF,#006AFF,#A033FF)',
    borderRadius: '999px',
  }),
  icon('ico-phone-green', 'Gọi điện', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M7.2 3.4c.4-.4 1-.5 1.5-.3l2.1.8c.5.2.8.7.8 1.2l-.2 2.3c0 .4-.2.7-.5.9l-1.2.9a11.5 11.5 0 0 0 5.3 5.3l.9-1.2c.2-.3.5-.5.9-.5l2.3-.2c.5 0 1 .3 1.2.8l.8 2.1c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C10.4 19 5 13.6 3.6 6.3c-.1-.6.1-1.2.5-1.6L7.2 3.4z"/></svg>`,
    background: '#22C55E',
    borderRadius: '999px',
  }),
  icon('ico-pinterest', 'Pinterest', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2A8.8 8.8 0 0 0 8.4 20c0-.7.1-1.7.4-2.5l1.3-5.3s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.5 1.9 1.8 0 3.1-2.3 3.1-5.1 0-2.1-1.4-3.7-4-3.7-2.9 0-4.7 2.1-4.7 4.5 0 .8.2 1.4.6 1.9.1.1.1.2.1.4l-.2.9c0 .2-.2.3-.4.2-1.5-.6-2.2-2.3-2.2-4.1 0-3 2.5-6.5 7.5-6.5 4 0 6.6 2.9 6.6 6 0 4.1-2.3 7.1-5.6 7.1-1.1 0-2.2-.6-2.6-1.3l-.7 2.6c-.2.9-.8 1.9-1.3 2.6A8.8 8.8 0 1 0 12 3.2z"/></svg>`,
    background: '#E60023',
    borderRadius: '999px',
  }),
  icon('ico-skype', 'Skype', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12.2 4.1c.6 0 1.2.1 1.7.3a4.3 4.3 0 0 1 5.7 5.7c.2.5.3 1.1.3 1.7a5.8 5.8 0 0 1-5.8 5.8c-.6 0-1.2-.1-1.7-.3a4.3 4.3 0 0 1-5.7-5.7 5.6 5.6 0 0 1-.3-1.7 5.8 5.8 0 0 1 5.8-5.8zm.1 2.6c-2.5 0-4.2 1.2-4.2 3.1 0 1 .7 1.8 2 2.1l1.5.4c.7.2 1.1.4 1.1.8 0 .5-.5.8-1.3.8-.9 0-1.8-.3-2.5-.7l-.4 1.4c.8.4 1.8.7 3 .7 2.4 0 4-1.2 4-3.1 0-1.1-.6-1.9-2.1-2.3l-1.5-.4c-.6-.2-.9-.4-.9-.8 0-.4.4-.7 1.1-.7.7 0 1.5.2 2.2.5l.5-1.4c-.8-.4-1.7-.6-2.7-.6z"/></svg>`,
    background: '#00AFF0',
    borderRadius: '999px',
  }),
  icon('ico-slack', 'Slack', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E01E5A" d="M8.5 14.2a1.6 1.6 0 1 1-1.6 1.6v-1.6h1.6zm.8 0a1.6 1.6 0 1 1 3.2 0v-4a1.6 1.6 0 1 0-3.2 0v4z"/><path fill="#36C5F0" d="M9.8 8.5A1.6 1.6 0 1 1 8.2 6.9h1.6v1.6zm0 .8a1.6 1.6 0 1 1 0 3.2h4a1.6 1.6 0 1 0 0-3.2h-4z"/><path fill="#2EB67D" d="M15.5 9.8a1.6 1.6 0 1 1 1.6-1.6v1.6h-1.6zm-.8 0a1.6 1.6 0 1 1-3.2 0v4a1.6 1.6 0 1 0 3.2 0v-4z"/><path fill="#ECB22E" d="M14.2 15.5a1.6 1.6 0 1 1 1.6 1.6h-1.6v-1.6zm0-.8a1.6 1.6 0 1 1 0-3.2h-4a1.6 1.6 0 1 0 0 3.2h4z"/></svg>`,
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  }),
  icon('ico-snapchat', 'Snapchat', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M12 3.5c2.2 0 4 1.9 4 5.1 0 1.6.3 2.5.7 3.2.3.5.6.8.6 1.1 0 .4-.5.7-1.2 1-.3.1-.5.3-.5.6 0 .3.2.5.5.7 1 .6 2.2 1.1 2.6 1.5.4.4.3 1-.4 1.1-.7.2-1.4.1-2.1.4-.6.3-1 .9-2.2 1.2-.5.1-1 .4-2 .4s-1.5-.3-2-.4c-1.2-.3-1.6-.9-2.2-1.2-.7-.3-1.4-.2-2.1-.4-.7-.1-.8-.7-.4-1.1.4-.4 1.6-.9 2.6-1.5.3-.2.5-.4.5-.7 0-.3-.2-.5-.5-.6-.7-.3-1.2-.6-1.2-1 0-.3.3-.6.6-1.1.4-.7.7-1.6.7-3.2 0-3.2 1.8-5.1 4-5.1z"/></svg>`,
    background: '#FFFC00',
    borderRadius: '12px',
  }),
  icon('ico-spotify', 'Spotify', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6zm4 12.6c-.2.3-.5.4-.8.2-2.1-1.3-4.8-1.6-8-0.9-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 3.4-.8 6.4-.4 8.8 1 .3.2.4.5.3.8zm1.1-2.4c-.2.3-.6.5-1 .2-2.4-1.5-6.1-1.9-9-.1-.4.2-.8 0-1-.3-.2-.4 0-.8.3-1 3.3-2 7.4-1.5 10.2.2.4.2.5.6.5 1zm.1-2.5c-2.9-1.7-7.6-1.9-10.4-.1-.4.2-1 0-1.2-.4-.2-.4 0-1 .4-1.2 3.2-1.9 8.4-1.7 11.8.3.4.2.6.8.3 1.2-.2.3-.7.5-1.1.2z"/></svg>`,
    background: '#1DB954',
    borderRadius: '999px',
  }),
  icon('ico-telegram', 'Telegram', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M19.8 5.3 3.9 11.4c-1.1.4-1.1 1.1-.2 1.4l4.1 1.3 1.6 4.8c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.3-2.2 4.5 3.3c.8.5 1.4.2 1.6-.8L21 6.4c.3-1.1-.4-1.6-1.2-1.1zM9.7 14.3l-.2 3.1-1.4-4.6 10.6-6.6-9 8.1z"/></svg>`,
    background: '#26A5E4',
    borderRadius: '999px',
  }),
  icon('ico-tiktok-dark', 'TikTok đen', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#69C9D0" d="M16.5 4c.5 1.7 1.8 3 3.5 3.4V10c-1.4-.1-2.7-.6-3.8-1.4v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V4h2.7z"/><path fill="#EE1D52" d="M15.8 4c.5 1.7 1.8 3 3.5 3.4V10c-1.4-.1-2.7-.6-3.8-1.4v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V4h2.7z" opacity=".85" transform="translate(-.6 .4)"/><path fill="#fff" d="M15.2 4.2c.5 1.6 1.7 2.9 3.3 3.3v2.2c-1.3-.1-2.5-.5-3.5-1.3v6.1a5 5 0 1 1-5-5c.3 0 .5 0 .8.1v2.3a2.6 2.6 0 1 0 1.9 2.5V4.2h2.5z"/></svg>`,
    background: '#0f172a',
    borderRadius: '12px',
  }),
  icon('ico-tiktok-mark', 'TikTok', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0f172a" d="M16.5 4c.5 1.7 1.8 3 3.5 3.4V10c-1.4-.1-2.7-.6-3.8-1.4v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V4h2.7z"/></svg>`,
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  }),
  icon('ico-twitter', 'Twitter', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M19.6 7.6c.1-.8-.4-1.2-1.1-.9l-1.4.5c-.5-1.4-1.7-2.4-3.3-2.4-2.1 0-3.5 1.7-3.5 3.8 0 .3 0 .6.1.9-2.9-.2-5.5-1.6-7.2-3.9-.3.6-.5 1.3-.5 2 0 1.4.7 2.6 1.8 3.3-.5 0-1-.2-1.5-.4v.1c0 1.9 1.3 3.5 3.1 3.9-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.7 3.6 2.7-1.3 1-3 1.6-4.8 1.6H4c1.7 1.1 3.8 1.7 6 1.7 7.2 0 11.1-6.1 11.1-11.4v-.5c.8-.5 1.4-1.2 1.9-2z"/></svg>`,
    background: '#1DA1F2',
    borderRadius: '999px',
  }),
  icon('ico-x-bird', 'X / Twitter xanh', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DA1F2" d="M19.6 7.6c.1-.8-.4-1.2-1.1-.9l-1.4.5c-.5-1.4-1.7-2.4-3.3-2.4-2.1 0-3.5 1.7-3.5 3.8 0 .3 0 .6.1.9-2.9-.2-5.5-1.6-7.2-3.9-.3.6-.5 1.3-.5 2 0 1.4.7 2.6 1.8 3.3-.5 0-1-.2-1.5-.4v.1c0 1.9 1.3 3.5 3.1 3.9-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.7 3.6 2.7-1.3 1-3 1.6-4.8 1.6H4c1.7 1.1 3.8 1.7 6 1.7 7.2 0 11.1-6.1 11.1-11.4v-.5c.8-.5 1.4-1.2 1.9-2z"/></svg>`,
    background: '#E8F5FD',
    borderRadius: '999px',
  }),
  icon('ico-viber', 'Viber', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2c-4.3 0-7.8 2.9-7.8 7.1 0 2.5 1.3 4.7 3.3 5.9v3.2l3.1-1.7c.5.1 1 .1 1.4.1 4.3 0 7.8-2.9 7.8-7.1S16.3 3.2 12 3.2zm1.6 10.1-1.3.8c-.8.5-1.5.2-2.1-.4l-.9-.9c-.3-.3-.3-.7 0-1l.7-.7c.2-.2.5-.2.7 0l.5.5.9-.5.9-.9c.2-.2.5-.2.7 0l.7.7c.3.3.3.7 0 1l-.8.9z"/></svg>`,
    background: '#7360F2',
    borderRadius: '999px',
  }),
  icon('ico-vimeo', 'Vimeo', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M20.5 8.4c-.1 1.8-1.3 4.3-3.7 7.4-2.4 3.2-4.5 4.8-6.1 4.8-1 0-1.9-1-2.6-2.9-.5-1.7-1-3.4-1.5-5.1-.5-1.9-1.1-2.8-1.7-2.8-.1 0-.6.3-1.4.8L3 9.4c.9-.8 1.8-1.5 2.6-2.3 1.2-1 2-1.5 2.6-1.6 1.4-.1 2.2.8 2.5 2.8.3 2.2.6 3.5.8 4 .6 2.5 1.2 3.7 1.9 3.7.5 0 1.3-.9 2.3-2.6.9-1.7 1.4-3 1.5-3.9.1-1.4-.4-2.1-1.7-2.1-.6 0-1.2.1-1.8.4 1.2-3.9 3.4-5.8 6.8-5.6 2.5.1 3.6 1.7 3.4 4.7z"/></svg>`,
    background: '#1AB7EA',
    borderRadius: '12px',
  }),
  icon('ico-wechat', 'WeChat', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M9.2 4.2c-3.8 0-6.8 2.5-6.8 5.6 0 1.8 1 3.4 2.6 4.4L4.5 16l2.4-1.2c.7.2 1.5.3 2.3.3.2 0 .4 0 .6 0-.1-.4-.2-.8-.2-1.2 0-3.3 3.1-5.9 6.9-5.9.2 0 .4 0 .6 0-1-2.4-3.7-4-7.1-4zm-2 3.2a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.1 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm5.1 2.5c-3.1 0-5.6 2.1-5.6 4.7 0 1.5.8 2.8 2.1 3.7l-.4 1.6 1.9-1c.6.2 1.2.3 1.9.3 3.1 0 5.6-2.1 5.6-4.7s-2.5-4.6-5.5-4.6zm-1.8 2.8a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4zm3.6 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z"/></svg>`,
    background: '#07C160',
    borderRadius: '12px',
  }),
  icon('ico-wechat-alt', 'WeChat alt', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#07C160" d="M9.2 4.2c-3.8 0-6.8 2.5-6.8 5.6 0 1.8 1 3.4 2.6 4.4L4.5 16l2.4-1.2c.7.2 1.5.3 2.3.3.2 0 .4 0 .6 0-.1-.4-.2-.8-.2-1.2 0-3.3 3.1-5.9 6.9-5.9.2 0 .4 0 .6 0-1-2.4-3.7-4-7.1-4z"/><path fill="#07C160" d="M16.4 10c-3.1 0-5.6 2.1-5.6 4.7 0 1.5.8 2.8 2.1 3.7l-.4 1.6 1.9-1c.6.2 1.2.3 1.9.3 3.1 0 5.6-2.1 5.6-4.7S19.5 10 16.4 10z"/></svg>`,
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  }),
  icon('ico-weibo', 'Weibo', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M9.8 11.2c-2.8.1-5.1 1.7-5.1 3.7s2.4 3.5 5.3 3.5 5.1-1.5 5.1-3.5-2.5-3.8-5.3-3.7zm-.2 5.5c-1.4 0-2.5-.7-2.5-1.6 0-.9 1.1-1.6 2.5-1.6s2.5.7 2.5 1.6c0 .9-1.1 1.6-2.5 1.6zm1.5-1.9c-.3 0-.6.3-.5.6 0 .2.3.4.6.4.4 0 .7-.3.6-.6 0-.3-.3-.4-.7-.4zM15.8 10c-.4 0-.6.3-.4.6.5.8.6 1.4.1 1.5-.3.1-.3.4 0 .6 1.1.5 2.1-.1 2.4-1.1.4-1.3-.8-1.7-2.1-1.6zm.5-2.6c-.4-.1-.7.2-.5.5 1.1 1.7 1.2 3.1.1 3.4-.3.1-.3.5.1.6 1.8.5 3.5-.9 3.1-3.2-.3-1.7-1.8-2-2.8-1.3zM8.6 8.6C4.5 8.9 1.5 11.4 1.5 14.8c0 3.6 4.1 5.5 8.2 5.5 5.2 0 9.3-2.8 9.3-6.1 0-1.4-.7-2.5-2.1-3.6.1-.5 0-1.1-.3-1.6-.5-.8-1.4-1.1-2.2-.8-.5-1.1-1.6-1.8-2.9-1.9-1.4-.1-2.6.5-3.4 1.5-.5-.1-1-.1-1.5-.2z"/></svg>`,
    background: '#E6162D',
    borderRadius: '999px',
  }),
  icon('ico-whatsapp', 'WhatsApp', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.3c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.4-.3-.5.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2 .6 2.4.6.4 0 1.2-.5 1.3-1 .2-.5.2-.9.1-1z"/></svg>`,
    background: '#25D366',
    borderRadius: '999px',
  }),
  icon('ico-youtube', 'YouTube', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M21.5 8.2s-.2-1.5-.8-2.1c-.7-.8-1.6-.8-2-0.9C16.2 5 12 5 12 5h0s-4.2 0-6.7.2c-.4.1-1.3.1-2 .9-.6.6-.8 2.1-.8 2.1S2.3 10 2.3 11.7v1.6c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.7.8 1.7.8 2.1.9 1.5.1 6.6.2 6.6.2s4.2 0 6.7-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1.6c0-1.7-.2-3.5-.2-3.5zM10.2 14.8V8.9l5.2 2.95-5.2 2.95z"/></svg>`,
    background: '#FF0000',
    borderRadius: '12px',
  }),
  icon('ico-zalo', 'Zalo', 'social', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2c-4.8 0-8.6 3.2-8.6 7.2 0 2.3 1.2 4.3 3.1 5.6l-.6 3.3 3.5-1.8c.8.2 1.7.3 2.6.3 4.8 0 8.6-3.2 8.6-7.2S16.8 3.2 12 3.2zm1.4 10.4h-4.6l4.2-4.5c.2-.2.1-.5-.2-.5H8.8c-.3 0-.5.2-.5.5v.8c0 .3.2.5.5.5h3.8l-4.1 4.4c-.2.2-.1.6.2.6h5.2c.3 0 .5-.2.5-.5v-.8c0-.3-.2-.5-.5-.5z"/></svg>`,
    background: '#0068FF',
    borderRadius: '999px',
  }),

  // ═══ ICONS (solid dark) ═══
  icon('ico-martini', 'Ly cocktail', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M4 4h16l-7.2 8.5V18H16v2H8v-2h3.2v-5.5L4 4zm3.1 2 4.9 5.8L16.9 6H7.1z"/></svg>`,
  }),
  icon('ico-music', 'Nhạc', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M9 4v11.3A3.2 3.2 0 1 0 11 18V8h7V4H9z"/></svg>`,
  }),
  icon('ico-search', 'Tìm kiếm', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M10.5 3.5a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.7 10.3 3.5 3.5-1.4 1.4-3.5-3.5 1.4-1.4z"/></svg>`,
  }),
  icon('ico-mail', 'Email', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11zm2 .6 6.5 4.3L18.5 7.1V6.5c0-.3-.2-.5-.5-.5H6c-.3 0-.5.2-.5.5v.6zm13 1.9-6.2 4.1a1.5 1.5 0 0 1-1.6 0L4.5 9v8.5c0 .3.2.5.5.5h12c.3 0 .5-.2.5-.5V9z"/></svg>`,
  }),
  icon('ico-heart', 'Tim', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M12 20.4S3.5 14.8 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.6-8.5 11.2-8.5 11.2z"/></svg>`,
  }),
  icon('ico-star', 'Sao', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M12 2.5 14.2 9H21l-5.4 4 2.1 6.5L12 15.8 6.3 19.5 8.4 13 3 9h6.8L12 2.5z"/></svg>`,
  }),
  icon('ico-star-outline', 'Sao viền', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${G}" stroke-width="1.8"><path d="M12 3.2 14.1 9H20l-4.8 3.5 1.8 5.8L12 14.9 6.9 18.3 8.8 12.5 4 9h5.9L12 3.2z"/></svg>`,
  }),
  icon('ico-user', 'Người dùng', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c3.9 0 7 2.1 7 4.5V20H5v-1.5C5 16.1 8.1 14 12 14z"/></svg>`,
  }),
  icon('ico-film', 'Phim', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v2h2V7H5zm0 4v2h2v-2H5zm0 4v2h2v-2H5zm12-8v2h2V7h-2zm0 4v2h2v-2h-2zm0 4v2h2v-2h-2z"/></svg>`,
  }),
  icon('ico-grid-2', 'Lưới 2×2', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>`,
  }),
  icon('ico-grid-3', 'Lưới 3×3', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M3 3h5v5H3V3zm6.5 0h5v5h-5V3zM16 3h5v5h-5V3zM3 9.5h5v5H3v-5zm6.5 0h5v5h-5v-5zm6.5 0h5v5h-5v-5zM3 16h5v5H3v-5zm6.5 0h5v5h-5v-5zM16 16h5v5h-5v-5z"/></svg>`,
  }),
  icon('ico-list', 'Danh sách', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M4 6h2v2H4V6zm4 0h12v2H8V6zM4 11h2v2H4v-2zm4 0h12v2H8v-2zM4 16h2v2H4v-2zm4 0h12v2H8v-2z"/></svg>`,
  }),
  icon('ico-check', 'Check', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8-8 1.4 1.4-9.4 9.4z"/></svg>`,
  }),
  icon('ico-x-thick', 'Đóng dày', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M6.2 5 12 10.8 17.8 5 19 6.2 13.2 12 19 17.8 17.8 19 12 13.2 6.2 19 5 17.8 10.8 12 5 6.2 6.2 5z"/></svg>`,
  }),
  icon('ico-x-mid', 'Đóng', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M7 6.2 12 11.2 17 6.2 18.8 8 13.8 13 18.8 18 17 19.8 12 14.8 7 19.8 5.2 18 10.2 13 5.2 8 7 6.2z"/></svg>`,
  }),
  icon('ico-x-thin', 'Đóng mỏng', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${G}" stroke-width="1.6"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  }),
  icon('ico-zoom-in', 'Zoom in', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M10.5 3.5a7 7 0 1 1 4.4 12.5l3.8 3.8-1.4 1.4-3.8-3.8A7 7 0 0 1 10.5 3.5zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9.5 8h2v1.5H13v2h-1.5V13h-2v-1.5H8v-2h1.5V8z"/></svg>`,
  }),
  icon('ico-zoom-out', 'Zoom out', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M10.5 3.5a7 7 0 1 1 4.4 12.5l3.8 3.8-1.4 1.4-3.8-3.8A7 7 0 0 1 10.5 3.5zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM8 10.5h5v2H8v-2z"/></svg>`,
  }),
  icon('ico-power', 'Nguồn', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M11 3h2v9h-2V3zm1 18a8 8 0 0 1-5.7-13.7l1.4 1.4A6 6 0 1 0 18.3 8.7l1.4-1.4A8 8 0 0 1 12 21z"/></svg>`,
  }),
  icon('ico-signal', 'Tín hiệu', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M4 16h3v4H4v-4zm5-4h3v8H9v-8zm5-4h3v12h-3V8zm5-4h3v16h-3V4z"/></svg>`,
  }),
  icon('ico-gear', 'Cài đặt', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M11 2h2l.4 2.2a7 7 0 0 1 1.7.7l2-1.1 1.4 1.4-1.1 2c.3.5.5 1.1.7 1.7L20 10v2l-2.2.4a7 7 0 0 1-.7 1.7l1.1 2-1.4 1.4-2-1.1a7 7 0 0 1-1.7.7L13 20h-2l-.4-2.2a7 7 0 0 1-1.7-.7l-2 1.1-1.4-1.4 1.1-2a7 7 0 0 1-.7-1.7L4 12v-2l2.2-.4a7 7 0 0 1 .7-1.7l-1.1-2L7.2 4.5l2 1.1a7 7 0 0 1 1.7-.7L11 2zm1 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>`,
  }),
  icon('ico-gear-sm', 'Cài đặt nhỏ', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M11.2 4h1.6l.3 1.8c.5.1 1 .4 1.4.6l1.6-.9 1.1 1.1-.9 1.6c.3.4.5.9.6 1.4L20 11.2v1.6l-1.8.3c-.1.5-.4 1-.6 1.4l.9 1.6-1.1 1.1-1.6-.9c-.4.3-.9.5-1.4.6L12.8 20h-1.6l-.3-1.8c-.5-.1-1-.4-1.4-.6l-1.6.9-1.1-1.1.9-1.6c-.3-.4-.5-.9-.6-1.4L4 12.8v-1.6l1.8-.3c.1-.5.4-1 .6-1.4l-.9-1.6 1.1-1.1 1.6.9c.4-.3.9-.5 1.4-.6L11.2 4zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>`,
  }),
  icon('ico-trash', 'Thùng rác', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9zm-1 12h12l1-12H5l1 12z"/></svg>`,
  }),
  icon('ico-home', 'Trang chủ', 'solid', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M12 3.2 3.5 10.5V21h6.2v-6h4.6v6h6.2V10.5L12 3.2z"/></svg>`,
  }),

  // ═══ MATERIAL (outline) ═══
  icon('mat-search', 'Search', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>`,
  }),
  icon('mat-home', 'Home', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M4 11.5 12 4.5l8 7V20H4v-8.5z"/><path d="M10 20v-6h4v6"/></svg>`,
  }),
  icon('mat-menu', 'Menu', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  }),
  icon('mat-close', 'Close', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  }),
  icon('mat-settings', 'Settings', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6"/></svg>`,
  }),
  icon('mat-expand', 'Mở rộng', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M7 10l5 5 5-5"/></svg>`,
  }),
  icon('mat-check', 'Check', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.8"><path d="M5 12.5 9.5 17 19 7.5"/></svg>`,
  }),
  icon('mat-check-circle', 'Check circle', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M8 12.2 10.8 15 16 9.5"/></svg>`,
  }),
  icon('mat-heart', 'Heart', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M12 19s-7-4.8-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 4.2-7 9-7 9z"/></svg>`,
  }),
  icon('mat-add', 'Add', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`,
  }),
  icon('mat-delete', 'Delete', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><path d="M5 7h14M9 7V5h6v2m-7 0 1 12h6l1-12"/></svg>`,
  }),
  icon('mat-arrow-back', 'Back', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M15 6 9 12l6 6"/></svg>`,
  }),
  icon('mat-star', 'Star', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><path d="M12 3.5 14.1 9H20l-4.8 3.5 1.8 5.8L12 14.9 6.9 18.3 8.8 12.5 4 9h5.9L12 3.5z"/></svg>`,
  }),
  icon('mat-chevron-right', 'Chevron', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.6"><path d="M9 6l6 6-6 6"/></svg>`,
  }),
  icon('mat-logout', 'Logout', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><path d="M10 5H6v14h4M13 12h8M17 8l4 4-4 4"/></svg>`,
  }),
  icon('mat-play', 'Play chevron', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${M}" d="M9 6.5 17 12 9 17.5V6.5z"/></svg>`,
  }),
  icon('mat-add-circle', 'Add circle', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/></svg>`,
  }),
  icon('mat-cancel', 'Cancel circle', 'material', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${M}" stroke-width="1.5"><circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  }),

  // ═══ ARROWS ═══
  icon('arr-right', 'Mũi tên phải', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="${G}" d="M2 14h48l-8-8 3-3 14 14-14 14-3-3 8-8H2z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-right-thin', 'Mũi tên mỏng', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="${G}" stroke-width="2"><path d="M4 16h48M42 8l12 8-12 8"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-curved', 'Mũi tên cong', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="2.2"><path d="M8 36c12-20 28-28 48-28"/><path fill="${G}" stroke="none" d="M48 4l12 8-14 4z"/></svg>`,
    width: '96px',
    height: '64px',
    pad: false,
  }),
  icon('arr-sketch', 'Mũi tên sketch', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" fill="none" stroke="${G}" stroke-width="1.8" stroke-linecap="round"><path d="M6 28c10-2 22-10 34-16 6-3 12-5 18-6"/><path d="M48 4l10 8-12 2"/></svg>`,
    width: '96px',
    height: '56px',
    pad: false,
  }),
  icon('arr-loop', 'Mũi tên vòng', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="2"><path d="M12 28c0-12 10-20 22-20s18 6 18 14-6 12-14 12H22"/><path fill="${G}" stroke="none" d="M22 40l-8-6 8-6z"/></svg>`,
    width: '96px',
    height: '64px',
    pad: false,
  }),
  icon('arr-dashed', 'Mũi tên nét đứt', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="4 3"><path d="M4 16h44"/><path stroke-dasharray="0" fill="${G}" stroke="none" d="M48 8l12 8-12 8z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-zigzag', 'Mũi tên zigzag', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" fill="none" stroke="${G}" stroke-width="2.2" stroke-linejoin="round"><path d="M4 28 16 12 28 26 40 10 52 22"/><path fill="${G}" stroke="none" d="M50 14l12 10-14 2z"/></svg>`,
    width: '96px',
    height: '56px',
    pad: false,
  }),
  icon('arr-block', 'Mũi tên khối', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="${G}" d="M2 8h36v-6l24 14-24 14v-6H2z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-outline', 'Mũi tên viền', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="${G}" stroke-width="2"><path d="M4 10h34V6l20 10-20 10v-4H4z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-up-right', 'Chéo lên', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="2.2"><path d="M12 36 36 12M20 12h16v16"/></svg>`,
    width: '72px',
    height: '72px',
    pad: false,
  }),
  icon('arr-down-right', 'Chéo xuống', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="2.2"><path d="M12 12 36 36M20 36h16V20"/></svg>`,
    width: '72px',
    height: '72px',
    pad: false,
  }),
  icon('arr-double', 'Mũi tên đôi', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="${G}" d="M2 10h28l-6-6 3-3 12 11-12 11-3-3 6-6H2zm30 0h20l-6-6 3-3 12 11-12 11-3-3 6-6H32z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),
  icon('arr-hand-1', 'Sketch cong 1', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="1.6" stroke-linecap="round"><path d="M8 40c4-16 18-28 40-32"/><path d="M40 6l10 4-6 8"/></svg>`,
    width: '96px',
    height: '64px',
    pad: false,
  }),
  icon('arr-hand-2', 'Sketch cong 2', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="1.8" stroke-linecap="round"><path d="M10 12c16 4 28 18 36 30"/><path d="M38 34l10 8-12 2"/></svg>`,
    width: '96px',
    height: '64px',
    pad: false,
  }),
  icon('arr-3d', 'Mũi tên 3D', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><path fill="${G}" d="M4 12h32l-8-8h8l20 16-20 16h-8l8-8H4z" opacity=".9"/><path fill="${G}" d="M4 16h32v8H4z" opacity=".45"/></svg>`,
    width: '96px',
    height: '56px',
    pad: false,
  }),
  icon('arr-chevron', 'Chevron phải', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="${G}" stroke-width="2.4"><path d="M12 8l8 8-8 8"/></svg>`,
  }),
  icon('arr-back', 'Quay lại', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="${G}" stroke-width="2.4"><path d="M20 8l-8 8 8 8"/></svg>`,
  }),
  icon('arr-caret', 'Caret xuống', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${G}" d="M6 9h12l-6 8z"/></svg>`,
  }),
  icon('arr-more', 'Thêm dọc', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8" fill="${G}"/><circle cx="12" cy="12" r="1.8" fill="${G}"/><circle cx="12" cy="19" r="1.8" fill="${G}"/></svg>`,
  }),
  icon('arr-check', 'Check nhỏ', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${G}" stroke-width="2.2"><path d="M5 12.5 9.5 17 19 7.5"/></svg>`,
  }),
  icon('arr-check-box', 'Check hộp', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${G}" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M7.5 12.2 10.5 15 16.5 9"/></svg>`,
  }),
  icon('arr-long', 'Mũi tên dài', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 24"><path fill="${G}" d="M2 10h62l-6-6 2.5-2.5L78 12 60.5 22.5 58 20l6-6H2z"/></svg>`,
    width: '120px',
    height: '36px',
    pad: false,
  }),
  icon('arr-swoosh', 'Swoosh', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round"><path d="M6 38c20-4 34-22 50-30"/><path fill="${G}" stroke="none" d="M48 6l12 6-10 6z"/></svg>`,
    width: '96px',
    height: '64px',
    pad: false,
  }),
  icon('arr-fat', 'Mũi tên đậm', 'arrows', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="${G}" d="M2 6h38V2l22 14-22 14v-4H2z"/></svg>`,
    width: '96px',
    height: '48px',
    pad: false,
  }),

  // ═══ PATTERN ═══
  icon('pat-dots', 'Lưới chấm', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><g fill="${G}"><circle cx="8" cy="8" r="1.5"/><circle cx="20" cy="8" r="1.5"/><circle cx="32" cy="8" r="1.5"/><circle cx="44" cy="8" r="1.5"/><circle cx="56" cy="8" r="1.5"/><circle cx="8" cy="20" r="1.5"/><circle cx="20" cy="20" r="1.5"/><circle cx="32" cy="20" r="1.5"/><circle cx="44" cy="20" r="1.5"/><circle cx="56" cy="20" r="1.5"/><circle cx="8" cy="32" r="1.5"/><circle cx="20" cy="32" r="1.5"/><circle cx="32" cy="32" r="1.5"/><circle cx="44" cy="32" r="1.5"/><circle cx="56" cy="32" r="1.5"/></g></svg>`,
    width: '100px',
    height: '64px',
    pad: false,
  }),
  icon('pat-plus-grid', 'Lưới cộng', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" fill="none" stroke="${G}" stroke-width="1.2"><path d="M8 8h4M10 6v4M24 8h4M26 6v4M40 8h4M42 6v4M56 8h4M58 6v4M8 20h4M10 18v4M24 20h4M26 18v4M40 20h4M42 18v4M56 20h4M58 18v4M8 32h4M10 30v4M24 32h4M26 30v4M40 32h4M42 30v4M56 32h4M58 30v4"/></svg>`,
    width: '100px',
    height: '64px',
    pad: false,
  }),
  icon('pat-underline', 'Gạch chân', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 16"><path stroke="${G}" stroke-width="3" d="M4 10h72"/></svg>`,
    width: '120px',
    height: '24px',
    pad: false,
  }),
  icon('pat-brush', 'Nét cọ', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 20"><path fill="${G}" d="M2 12c12-6 24 2 36-2s20 4 40 0c-2 4-10 6-20 5S34 18 22 16 8 16 2 12z"/></svg>`,
    width: '120px',
    height: '28px',
    pad: false,
  }),
  icon('pat-wave', 'Sóng', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 20" fill="none" stroke="${G}" stroke-width="2.2"><path d="M2 10c8-8 16 8 24 0s16 8 24 0 16 8 24 0"/></svg>`,
    width: '120px',
    height: '28px',
    pad: false,
  }),
  icon('pat-zigzag', 'Răng cưa', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 20" fill="none" stroke="${G}" stroke-width="2"><path d="M2 14 12 6 22 14 32 6 42 14 52 6 62 14 72 6 78 10"/></svg>`,
    width: '120px',
    height: '28px',
    pad: false,
  }),
  icon('pat-ribbon', 'Ruy băng', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path fill="${G}" d="M6 2h20v48l-10-6-10 6z"/></svg>`,
    width: '48px',
    height: '96px',
    pad: false,
  }),
  icon('pat-arc', 'Cung', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" fill="none" stroke="${G}" stroke-width="3"><path d="M8 32a24 24 0 0 1 48 0"/></svg>`,
    width: '96px',
    height: '56px',
    pad: false,
  }),
  icon('pat-arc-fill', 'Cung đặc', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><path fill="${G}" d="M8 36a24 24 0 0 1 48 0H8z"/></svg>`,
    width: '96px',
    height: '56px',
    pad: false,
  }),
  icon('pat-prism', 'Lăng trụ', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${G}" d="M24 4 44 40H4z" opacity=".85"/><path fill="${G}" d="M24 12 36 36H12z" opacity=".35"/></svg>`,
  }),
  icon('pat-bar', 'Thanh ngang', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 24"><rect x="4" y="8" width="72" height="8" rx="2" fill="${G}"/></svg>`,
    width: '120px',
    height: '36px',
    pad: false,
  }),
  icon('pat-u', 'Chữ U', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="4"><path d="M10 8v18a14 14 0 0 0 28 0V8"/></svg>`,
  }),
  icon('pat-diamond', 'Kim cương', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${G}" d="M24 4 44 24 24 44 4 24z"/></svg>`,
  }),
  icon('pat-diamonds', 'Cụm kim cương', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path fill="${G}" d="M12 4 20 16 12 28 4 16zm20 0 8 12-8 12-8-12zm20 0 8 12-8 12-8-12z"/></svg>`,
    width: '100px',
    height: '48px',
    pad: false,
  }),
  icon('pat-leaf', 'Lá', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${G}" d="M24 4c12 8 16 20 12 32-8 2-18-2-24-12C8 14 12 6 24 4z"/><path fill="#fff" opacity=".35" d="M24 8c2 8 4 16 2 28"/></svg>`,
  }),
  icon('pat-pinwheel', 'Chong chóng', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${G}" d="M24 24 36 8c-8 2-12 8-12 16zm0 0 16 12c-2-8-8-12-16-12zm0 0L12 40c8-2 12-8 12-16zm0 0L8 12c2 8 8 12 16 12z"/></svg>`,
  }),
  icon('pat-interlock', 'Giao thoa', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="2.5"><path d="M16 12c8-6 20 0 16 12-4 8-16 6-16 0"/><path d="M32 36c-8 6-20 0-16-12 4-8 16-6 16 0"/></svg>`,
  }),
  icon('pat-bracket', 'Ngoặc L', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"><path d="M36 8H12v32"/></svg>`,
  }),
  icon('pat-shield', 'Khiên', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${G}" d="M24 4 40 10v14c0 10-8 18-16 20-8-2-16-10-16-20V10z"/></svg>`,
  }),
  icon('pat-slash', 'Gạch chéo', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="${G}" stroke-width="2"><path d="M8 28 20 4M20 28 32 4M32 28 44 4M44 28 56 4"/></svg>`,
    width: '100px',
    height: '48px',
    pad: false,
  }),
  icon('pat-dots-row', 'Hàng chấm', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 16"><g fill="${G}"><circle cx="8" cy="8" r="2.5"/><circle cx="24" cy="8" r="2.5"/><circle cx="40" cy="8" r="2.5"/><circle cx="56" cy="8" r="2.5"/><circle cx="72" cy="8" r="2.5"/></g></svg>`,
    width: '120px',
    height: '24px',
    pad: false,
  }),
  icon('pat-corner', 'Góc trang trí', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="2"><path d="M8 40V12a4 4 0 0 1 4-4h28"/><path d="M8 32h8M16 8v8"/></svg>`,
  }),
  icon('pat-burst', 'Tia', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="${G}" stroke-width="2"><path d="M24 4v8M24 36v8M4 24h8M36 24h8M9 9l6 6M33 33l6 6M39 9l-6 6M15 33l-6 6"/></svg>`,
  }),
  icon('pat-frame-ornament', 'Khung hoa văn', 'pattern', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none" stroke="${G}" stroke-width="1.6"><rect x="6" y="6" width="52" height="36" rx="2"/><path d="M12 12h8M12 12v8M52 12h-8M52 12v8M12 36h8M12 36v-8M52 36h-8M52 36v-8"/></svg>`,
    width: '100px',
    height: '72px',
    pad: false,
  }),

  // ═══ BACKGROUND (horizon / divider) ═══
  icon('bg-flat', 'Nền phẳng', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 22h160v18H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-hill', 'Đồi', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 28c30-16 50-16 80 0s50 12 80 0v12H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-double-hill', 'Đôi đồi', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 30c20-14 40-14 55 0 20-16 45-16 65 0 15-10 30-8 40 0v10H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-wave', 'Sóng nền', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 24c20 10 40-10 60 0s40 10 60 0 30-6 40 2v14H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-soft', 'Nền mềm', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 26c40-8 80-8 160 0v14H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-jagged', 'Nền răng cưa', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 28 12 18 24 28 36 16 48 28 60 20 72 28 84 14 96 28 108 18 120 28 132 16 144 28 160 20v20H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-dip', 'Nền lõm', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 18c40 16 80 16 160 0v22H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-rise', 'Nền dốc', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 30 160 12v28H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-plateau', 'Nền bậc', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 28h40l20-12h40l20 12h40v12H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-wiggle', 'Nền lượn', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><path fill="${G}" d="M0 26c10-8 20 8 30 0s20 8 30 0 20 8 30 0 20 8 30 0 20 6 40 2v12H0z"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-thin', 'Nền mỏng', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 24"><path fill="${G}" d="M0 14c50-6 100-6 160 0v10H0z"/></svg>`,
    width: '160px',
    height: '28px',
    pad: false,
    bgSize: '100% 100%',
  }),
  icon('bg-slab', 'Nền khối', 'background', {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect x="0" y="16" width="160" height="24" fill="${G}"/></svg>`,
    width: '160px',
    height: '40px',
    pad: false,
    bgSize: '100% 100%',
  }),
];
