/**
 * 10 launch-countdown visual presets (Aibeego mockups).
 * Clock skins + split copy/form tokens. Renderer consumes these by styleVariant.
 */

import {
  LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS,
  type LandingPageCountdownStyle,
} from './landing-page-types';

export const LANDING_PAGE_COUNTDOWN_LAUNCH_STYLES = LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS;

export type LandingPageCountdownLaunchStyle =
  (typeof LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS)[number];

export type LandingPageCountdownPresetTokens = {
  bg: string;
  bgImage?: string;
  text: string;
  muted: string;
  accent: string;
  digit: string;
  formBg: string;
  formBorder: string;
  formRadius: string;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  inputRadius: string;
  ctaBg: string;
  ctaColor: string;
  kicker: string;
  headlineFont?: string;
  digitFont?: string;
};

export type LandingPageCountdownPreset = {
  id: LandingPageCountdownLaunchStyle;
  label: string;
  description: string;
  thumb: string;
  kicker: string;
  headline: string;
  subheadline: string;
  formHeadline: string;
  submitLabel: string;
  tokens: LandingPageCountdownPresetTokens;
};

const COPY = {
  kicker: 'Aibeego',
  headline: 'Đếm ngược đến ngày ra mắt',
  subheadline: 'Đăng ký để nhận thông báo khi Aibeego ra mắt.',
  formHeadline: 'Đăng ký nhận thông báo',
  submitLabel: 'Đăng ký ngay',
} as const;

export const LP_COUNTDOWN_PRESETS: LandingPageCountdownPreset[] = [
  {
    id: 'amethyst-flip',
    label: 'Amethyst Flip',
    description: 'Đồng hồ lật tím — card flip với vạch giữa.',
    thumb: '/landing-page-assets/countdown-library/01-amethyst-flip.jpg',
    ...COPY,
    tokens: {
      bg: '#120818',
      bgImage:
        'radial-gradient(ellipse 55% 48% at 18% 18%, rgba(139,92,246,.42), transparent 62%), radial-gradient(ellipse 42% 36% at 82% 88%, rgba(192,38,211,.28), transparent 60%)',
      text: '#ffffff',
      muted: 'rgba(233,213,255,.78)',
      accent: '#c084fc',
      digit: '#e9d5ff',
      formBg: 'rgba(46,35,55,.78)',
      formBorder: '1px solid rgba(192,132,252,.28)',
      formRadius: '18px',
      inputBg: 'rgba(20,9,28,.55)',
      inputBorder: '1px solid rgba(216,180,254,.28)',
      inputColor: '#f5e8ff',
      inputRadius: '12px',
      ctaBg: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
      ctaColor: '#fff',
      kicker: '#d8b4fe',
    },
  },
  {
    id: 'champagne-editorial',
    label: 'Champagne Editorial',
    description: 'Serif vàng champagne, vạch dọc editorial.',
    thumb: '/landing-page-assets/countdown-library/02-champagne-editorial.jpg',
    ...COPY,
    tokens: {
      bg: '#150e0d',
      text: '#f7e7c4',
      muted: 'rgba(232,201,138,.72)',
      accent: '#e8c98a',
      digit: '#f3d9a1',
      formBg: 'transparent',
      formBorder: '1px solid #e8c98a',
      formRadius: '4px',
      inputBg: 'transparent',
      inputBorder: '1px solid rgba(232,201,138,.55)',
      inputColor: '#f7e7c4',
      inputRadius: '2px',
      ctaBg: '#f7d68d',
      ctaColor: '#1a100c',
      kicker: '#e8c98a',
      headlineFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
      digitFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    },
  },
  {
    id: 'cyan-grid',
    label: 'Cyan Grid',
    description: 'Khung số vát cạnh trên lưới cyan.',
    thumb: '/landing-page-assets/countdown-library/03-cyan-grid.jpg',
    ...COPY,
    tokens: {
      bg: '#061018',
      bgImage:
        'linear-gradient(rgba(142,246,253,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(142,246,253,.07) 1px, transparent 1px)',
      text: '#ffffff',
      muted: 'rgba(186,230,253,.78)',
      accent: '#8ef6fd',
      digit: '#8ef6fd',
      formBg: 'rgba(28,44,65,.82)',
      formBorder: '1px solid rgba(142,246,253,.28)',
      formRadius: '6px',
      inputBg: 'rgba(7,18,28,.7)',
      inputBorder: '1px solid rgba(142,246,253,.35)',
      inputColor: '#e8fdff',
      inputRadius: '4px',
      ctaBg: '#8ef6fd',
      ctaColor: '#06202a',
      kicker: '#8ef6fd',
    },
  },
  {
    id: 'emerald-halo',
    label: 'Emerald Halo',
    description: 'Vòng halo mint quanh từng đơn vị.',
    thumb: '/landing-page-assets/countdown-library/04-emerald-halo.jpg',
    ...COPY,
    tokens: {
      bg: '#071411',
      bgImage:
        'radial-gradient(ellipse 48% 55% at 22% 42%, rgba(52,211,153,.32), transparent 64%), radial-gradient(ellipse 36% 32% at 78% 12%, rgba(16,185,129,.16), transparent 62%)',
      text: '#ffffff',
      muted: 'rgba(209,250,229,.78)',
      accent: '#9cf4c9',
      digit: '#beffe3',
      formBg: 'rgba(17,50,40,.78)',
      formBorder: '1px solid rgba(156,244,201,.28)',
      formRadius: '20px',
      inputBg: 'rgba(8,21,18,.6)',
      inputBorder: '1px solid rgba(156,244,201,.3)',
      inputColor: '#ecfdf5',
      inputRadius: '12px',
      ctaBg: '#9cf4c9',
      ctaColor: '#052e1a',
      kicker: '#9cf4c9',
    },
  },
  {
    id: 'copper-ember',
    label: 'Copper Ember',
    description: 'Ô số cao phát sáng cam đồng.',
    thumb: '/landing-page-assets/countdown-library/05-copper-ember.jpg',
    ...COPY,
    tokens: {
      bg: '#160d0b',
      bgImage:
        'radial-gradient(ellipse 55% 48% at 12% 92%, rgba(251,146,60,.38), transparent 62%)',
      text: '#fff7f2',
      muted: 'rgba(255,237,213,.74)',
      accent: '#fb9e67',
      digit: '#fb9e67',
      formBg: 'rgba(62,43,36,.82)',
      formBorder: '1px solid rgba(251,158,103,.32)',
      formRadius: '16px',
      inputBg: 'rgba(26,15,12,.65)',
      inputBorder: '1px solid rgba(251,158,103,.35)',
      inputColor: '#fde7ce',
      inputRadius: '10px',
      ctaBg: '#fb9e67',
      ctaColor: '#2a120c',
      kicker: '#fb9e67',
    },
  },
  {
    id: 'rose-glass',
    label: 'Rose Glass',
    description: 'Kính mờ hồng, ô số bo góc phát sáng.',
    thumb: '/landing-page-assets/countdown-library/06-rose-glass.jpg',
    ...COPY,
    tokens: {
      bg: '#2a0618',
      bgImage:
        'radial-gradient(ellipse 42% 70% at 96% 8%, rgba(244,114,182,.55), transparent 58%), radial-gradient(ellipse 36% 55% at 4% 96%, rgba(190,24,93,.42), transparent 60%), radial-gradient(ellipse 28% 40% at 70% 70%, rgba(244,114,182,.18), transparent 70%)',
      text: '#ffffff',
      muted: 'rgba(251,207,232,.8)',
      accent: '#feacd1',
      digit: '#feacd1',
      formBg: 'rgba(79,29,52,.72)',
      formBorder: '1px solid rgba(254,172,209,.32)',
      formRadius: '20px',
      inputBg: 'rgba(45,11,28,.5)',
      inputBorder: '1px solid rgba(254,172,209,.32)',
      inputColor: '#ffe4f1',
      inputRadius: '12px',
      ctaBg: '#feacd1',
      ctaColor: '#4a1028',
      kicker: '#feacd1',
    },
  },
  {
    id: 'silver-minimal',
    label: 'Silver Minimal',
    description: 'Một thanh số tối giản, viền bạc.',
    thumb: '/landing-page-assets/countdown-library/07-silver-minimal.jpg',
    ...COPY,
    tokens: {
      bg: '#0c0d11',
      text: '#ffffff',
      muted: 'rgba(228,228,231,.72)',
      accent: '#f1f1f3',
      digit: '#ffffff',
      formBg: 'rgba(30,33,37,.92)',
      formBorder: '1px solid rgba(241,241,243,.16)',
      formRadius: '16px',
      inputBg: 'rgba(15,16,20,.8)',
      inputBorder: '1px solid rgba(241,241,243,.18)',
      inputColor: '#f5f5f6',
      inputRadius: '10px',
      ctaBg: '#f1f1f3',
      ctaColor: '#111318',
      kicker: '#c7c9ce',
    },
  },
  {
    id: 'cobalt-orbit',
    label: 'Cobalt Orbit',
    description: 'Số lớn navy, form trắng, quỹ đạo mờ.',
    thumb: '/landing-page-assets/countdown-library/08-cobalt-orbit.jpg',
    ...COPY,
    tokens: {
      bg: '#070b1e',
      bgImage:
        'radial-gradient(circle at 100% 0%, transparent 34%, rgba(96,165,250,.42) 35.1%, transparent 36.3%), radial-gradient(circle at 100% 0%, transparent 48%, rgba(125,211,252,.28) 49%, transparent 50.2%), radial-gradient(circle at 0% 100%, transparent 30%, rgba(59,130,246,.48) 31%, transparent 32.2%), radial-gradient(circle at 0% 100%, transparent 44%, rgba(96,165,250,.24) 45%, transparent 46.2%)',
      text: '#ffffff',
      muted: 'rgba(191,219,254,.82)',
      accent: '#93c5fd',
      digit: '#e0eaff',
      formBg: 'rgba(8,14,40,.9)',
      formBorder: '1px solid rgba(147,197,253,.55)',
      formRadius: '16px',
      inputBg: '#ffffff',
      inputBorder: '1px solid transparent',
      inputColor: '#18181b',
      inputRadius: '10px',
      ctaBg: '#c5d4fb',
      ctaColor: '#1e2433',
      kicker: '#93c5fd',
    },
  },
  {
    id: 'lime-terminal',
    label: 'Lime Terminal',
    description: 'LED 7 đoạn lime trên nền terminal.',
    thumb: '/landing-page-assets/countdown-library/09-lime-terminal.jpg',
    ...COPY,
    tokens: {
      bg: '#10140c',
      text: '#f7f8f2',
      muted: 'rgba(255,255,255,.78)',
      accent: '#d6f25c',
      digit: '#d6f25c',
      formBg: 'transparent',
      formBorder: '1px solid #d6f25c',
      formRadius: '2px',
      inputBg: '#070907',
      inputBorder: '1px solid rgba(214,242,92,.7)',
      inputColor: '#f4f7e4',
      inputRadius: '2px',
      ctaBg: '#d6f25c',
      ctaColor: '#14180c',
      kicker: '#d6f25c',
    },
  },
  {
    id: 'opal-ribbon',
    label: 'Opal Ribbon',
    description: 'Thanh capsule iridescent, CTA pastel.',
    thumb: '/landing-page-assets/countdown-library/10-opal-ribbon.jpg',
    ...COPY,
    tokens: {
      bg: '#100e1c',
      bgImage:
        'radial-gradient(ellipse 28% 70% at -4% 42%, rgba(196,181,253,.55), transparent 62%), radial-gradient(ellipse 22% 46% at 6% 88%, rgba(125,211,252,.4), transparent 68%), radial-gradient(ellipse 18% 36% at 0% 8%, rgba(244,114,182,.38), transparent 70%)',
      text: '#ffffff',
      muted: 'rgba(237,233,254,.78)',
      accent: '#c4b5fd',
      digit: '#f5d0fe',
      formBg: 'rgba(45,44,64,.82)',
      formBorder: '1px solid rgba(196,181,253,.28)',
      formRadius: '22px',
      inputBg: 'rgba(17,15,30,.65)',
      inputBorder: '1px solid rgba(196,181,253,.28)',
      inputColor: '#f8f7ff',
      inputRadius: '12px',
      ctaBg: 'linear-gradient(90deg, #f9a8d4 0%, #c4b5fd 50%, #7dd3fc 100%)',
      ctaColor: '#1e1b4b',
      kicker: '#e9d5ff',
    },
  },
];

const PRESET_BY_ID = new Map(LP_COUNTDOWN_PRESETS.map((p) => [p.id, p]));

export function isCountdownLaunchStyle(
  value: unknown,
): value is LandingPageCountdownLaunchStyle {
  return (
    typeof value === 'string' &&
    (LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS as readonly string[]).includes(value)
  );
}

export function isLegacyCountdownStyle(
  value: unknown,
): value is Extract<LandingPageCountdownStyle, 'boxes' | 'inline' | 'minimal'> {
  return value === 'boxes' || value === 'inline' || value === 'minimal';
}

export function countdownPresetById(id: string | undefined | null): LandingPageCountdownPreset | undefined {
  if (!id) return undefined;
  return PRESET_BY_ID.get(id as LandingPageCountdownLaunchStyle);
}

export function countdownLaunchStyleTokens(
  style: string | undefined | null,
): LandingPageCountdownPresetTokens | null {
  return countdownPresetById(style || '')?.tokens ?? null;
}

export type CountdownLaunchBlockPatch = {
  type: 'Countdown';
  styleVariant: LandingPageCountdownLaunchStyle;
  variant: LandingPageCountdownLaunchStyle;
  kicker?: string;
  headline?: string;
  subheadline?: string;
  showSignup: boolean;
  formHeadline?: string;
  submitLabel?: string;
  timezone?: string;
  spacing: 'lg';
  background: string;
  style: Record<string, unknown>;
};

/** Visual + copy patch used when inserting a library template. */
export function countdownLaunchInsertPatch(
  preset: LandingPageCountdownPreset,
  existingStyle?: Record<string, unknown>,
): CountdownLaunchBlockPatch {
  const t = preset.tokens;
  return {
    type: 'Countdown',
    styleVariant: preset.id,
    variant: preset.id,
    kicker: preset.kicker,
    headline: preset.headline,
    subheadline: preset.subheadline,
    showSignup: true,
    formHeadline: preset.formHeadline,
    submitLabel: preset.submitLabel,
    timezone: 'Asia/Ho_Chi_Minh',
    spacing: 'lg',
    background: t.bg,
    style: {
      ...(existingStyle || {}),
      background: t.bg,
      backgroundImage: t.bgImage,
      color: t.text,
      lpSectionTone: 'dark',
      lpCountdownTheme: preset.id,
      ...(preset.id === 'cyan-grid' ? { backgroundSize: '42px 42px' } : {}),
    },
  };
}
