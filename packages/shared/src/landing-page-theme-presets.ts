/**
 * Landing Page Quick Theme Switcher — token-driven presets.
 * Visuals come only from themeTokens CSS variables (no per-component hardcode).
 */

import type { LandingPageTheme, LandingPageThemeTokens } from './landing-page-types';
import { LANDING_PAGE_THEME_PRESETS } from './landing-page-types';

export const LANDING_PAGE_QUICK_THEME_IDS = [
  'light',
  'dark',
  'orange',
  'luxury_gold',
  'navy',
  'blue',
  'green',
  'purple',
  'rose',
  'custom',
] as const;

export type LandingPageQuickThemeId = (typeof LANDING_PAGE_QUICK_THEME_IDS)[number];

export type LandingPageThemeTokenSet = LandingPageThemeTokens & {
  /** Brand accent (links, highlights). Defaults to secondary when omitted. */
  accent?: string;
  border?: string;
  /** CTA / button fill — defaults to primary. */
  button?: string;
  /** Hero / band gradient (CSS value). */
  gradient?: string;
  shadow?: string;
};

export type LandingPageQuickThemePreset = {
  id: LandingPageQuickThemeId;
  label: string;
  description: string;
  /** Maps to Prisma / legacy theme enum for row.theme. */
  legacyTheme: LandingPageTheme;
  swatch: [string, string, string];
  tokens: LandingPageThemeTokenSet;
};

function baseFont(theme: LandingPageTheme): string {
  return LANDING_PAGE_THEME_PRESETS[theme].fontFamily;
}

/** Full commercial palette presets — Luxury Gold is charcoal + gold + ivory. */
export const LANDING_PAGE_QUICK_THEME_PRESETS: LandingPageQuickThemePreset[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Nền sáng sạch, chữ đậm, CTA rõ',
    legacyTheme: 'MINIMAL',
    swatch: ['#FFFFFF', '#0F172A', '#2563EB'],
    tokens: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#2563EB',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      muted: '#64748B',
      border: '#E2E8F0',
      button: '#2563EB',
      gradient: 'linear-gradient(165deg, #EFF6FF 0%, #FFFFFF 45%, #F8FAFC 100%)',
      shadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
      fontFamily: baseFont('MINIMAL'),
      radius: '12px',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Nền đen mạnh, contrast cao, conversion tối',
    legacyTheme: 'BOLD',
    swatch: ['#0B1220', '#F8FAFC', '#F97316'],
    tokens: {
      primary: '#F97316',
      secondary: '#F8FAFC',
      accent: '#FB923C',
      background: '#0B1220',
      surface: '#111827',
      text: '#F8FAFC',
      muted: '#94A3B8',
      border: '#1F2937',
      button: '#F97316',
      gradient: 'linear-gradient(160deg, #0B1220 0%, #111827 50%, #0B1220 100%)',
      shadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
      fontFamily: baseFont('BOLD'),
      radius: '12px',
    },
  },
  {
    id: 'orange',
    label: 'Orange',
    description: 'Conversion-first — cam nổi CTA',
    legacyTheme: 'MODERN',
    swatch: ['#FFF7ED', '#0F172A', '#EA580C'],
    tokens: {
      primary: '#EA580C',
      secondary: '#0F172A',
      accent: '#F97316',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#0F172A',
      muted: '#9A3412',
      border: '#FED7AA',
      button: '#EA580C',
      gradient: 'linear-gradient(155deg, #FFEDD5 0%, #FFF7ED 40%, #FFFFFF 100%)',
      shadow: '0 14px 36px rgba(234, 88, 12, 0.18)',
      fontFamily: baseFont('MODERN'),
      radius: '12px',
    },
  },
  {
    id: 'luxury_gold',
    label: 'Luxury Gold',
    description: 'Đen/charcoal + gold + ivory — toàn trang',
    legacyTheme: 'PREMIUM',
    swatch: ['#0B0B0C', '#D4AF37', '#F5F0E6'],
    tokens: {
      primary: '#D4AF37',
      secondary: '#F5F0E6',
      accent: '#E8C547',
      background: '#0B0B0C',
      surface: '#161618',
      text: '#F5F0E6',
      muted: '#A89F91',
      border: '#2A2A2E',
      button: '#D4AF37',
      gradient: 'linear-gradient(145deg, #0B0B0C 0%, #1A1510 48%, #0B0B0C 100%)',
      shadow: '0 18px 48px rgba(212, 175, 55, 0.12)',
      fontFamily: '"Fraunces", "Palatino Linotype", serif',
      radius: '10px',
    },
  },
  {
    id: 'navy',
    label: 'Navy',
    description: 'Xanh navy doanh nghiệp',
    legacyTheme: 'CORPORATE',
    swatch: ['#F1F5F9', '#0B1F3A', '#1D4ED8'],
    tokens: {
      primary: '#1D4ED8',
      secondary: '#0B1F3A',
      accent: '#3B82F6',
      background: '#F1F5F9',
      surface: '#FFFFFF',
      text: '#0B1F3A',
      muted: '#475569',
      border: '#CBD5E1',
      button: '#1D4ED8',
      gradient: 'linear-gradient(160deg, #DBEAFE 0%, #F1F5F9 50%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(11, 31, 58, 0.12)',
      fontFamily: baseFont('CORPORATE'),
      radius: '10px',
    },
  },
  {
    id: 'blue',
    label: 'Blue',
    description: 'Xanh dương tin cậy / SaaS',
    legacyTheme: 'CORPORATE',
    swatch: ['#EFF6FF', '#0F172A', '#2563EB'],
    tokens: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#3B82F6',
      background: '#EFF6FF',
      surface: '#FFFFFF',
      text: '#0F172A',
      muted: '#475569',
      border: '#BFDBFE',
      button: '#2563EB',
      gradient: 'linear-gradient(160deg, #DBEAFE 0%, #EFF6FF 45%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(37, 99, 235, 0.14)',
      fontFamily: baseFont('CORPORATE'),
      radius: '12px',
    },
  },
  {
    id: 'green',
    label: 'Green',
    description: 'Xanh tăng trưởng / wellness',
    legacyTheme: 'MODERN',
    swatch: ['#F0FDF4', '#14532D', '#16A34A'],
    tokens: {
      primary: '#16A34A',
      secondary: '#14532D',
      accent: '#22C55E',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#14532D',
      muted: '#3F6212',
      border: '#BBF7D0',
      button: '#16A34A',
      gradient: 'linear-gradient(155deg, #DCFCE7 0%, #F0FDF4 45%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(22, 163, 74, 0.14)',
      fontFamily: baseFont('MODERN'),
      radius: '12px',
    },
  },
  {
    id: 'purple',
    label: 'Purple',
    description: 'Tím sáng tạo / agency',
    legacyTheme: 'PREMIUM',
    swatch: ['#FAF5FF', '#3B0764', '#7C3AED'],
    tokens: {
      primary: '#7C3AED',
      secondary: '#3B0764',
      accent: '#A78BFA',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#3B0764',
      muted: '#6B21A8',
      border: '#E9D5FF',
      button: '#7C3AED',
      gradient: 'linear-gradient(155deg, #F3E8FF 0%, #FAF5FF 45%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(124, 58, 237, 0.14)',
      fontFamily: baseFont('PREMIUM'),
      radius: '14px',
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Hồng ấm — beauty / lifestyle',
    legacyTheme: 'PREMIUM',
    swatch: ['#FFF1F2', '#881337', '#E11D48'],
    tokens: {
      primary: '#E11D48',
      secondary: '#881337',
      accent: '#FB7185',
      background: '#FFF1F2',
      surface: '#FFFFFF',
      text: '#881337',
      muted: '#9F1239',
      border: '#FECDD3',
      button: '#E11D48',
      gradient: 'linear-gradient(155deg, #FFE4E6 0%, #FFF1F2 45%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(225, 29, 72, 0.14)',
      fontFamily: baseFont('PREMIUM'),
      radius: '14px',
    },
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Tự chỉnh primary / accent / nền / chữ / nút / radius',
    legacyTheme: 'MODERN',
    swatch: ['#F8FAFC', '#0F172A', '#F97316'],
    tokens: {
      ...LANDING_PAGE_THEME_PRESETS.MODERN,
      accent: '#F97316',
      border: '#E2E8F0',
      button: '#F97316',
      gradient: 'linear-gradient(165deg, #FFF7ED 0%, #F8FAFC 50%, #FFFFFF 100%)',
      shadow: '0 12px 36px rgba(15, 23, 42, 0.10)',
    },
  },
];

export function isLandingPageQuickThemeId(v: unknown): v is LandingPageQuickThemeId {
  return (
    typeof v === 'string' &&
    (LANDING_PAGE_QUICK_THEME_IDS as readonly string[]).includes(v)
  );
}

export function getLandingPageQuickThemePreset(
  id: string | null | undefined,
): LandingPageQuickThemePreset {
  return (
    LANDING_PAGE_QUICK_THEME_PRESETS.find((p) => p.id === id) ||
    LANDING_PAGE_QUICK_THEME_PRESETS[0]!
  );
}

/** Fill missing extended tokens from legacy presets — old pages keep working. */
export function normalizeLandingPageThemeTokens(
  input: Partial<LandingPageThemeTokenSet> | null | undefined,
  legacyTheme: LandingPageTheme = 'MODERN',
): LandingPageThemeTokenSet {
  const base = LANDING_PAGE_THEME_PRESETS[legacyTheme] || LANDING_PAGE_THEME_PRESETS.MODERN;
  const primary = input?.primary || base.primary;
  const secondary = input?.secondary || base.secondary;
  const background = input?.background || base.background;
  const surface = input?.surface || base.surface;
  const text = input?.text || base.text;
  const muted = input?.muted || base.muted;
  const radius = input?.radius || base.radius;
  return {
    primary,
    secondary,
    background,
    surface,
    text,
    muted,
    fontFamily: input?.fontFamily || base.fontFamily,
    radius,
    accent: input?.accent || secondary,
    border: input?.border || '#E2E8F0',
    button: input?.button || primary,
    gradient:
      input?.gradient ||
      `linear-gradient(165deg, ${primary}14 0%, ${background} 42%, ${surface} 100%)`,
    shadow: input?.shadow || '0 12px 36px rgba(15, 23, 42, 0.10)',
    canvas: input?.canvas || background,
    surfaceAlt: input?.surfaceAlt || surface,
    textMuted: input?.textMuted || muted,
    containerWidth: input?.containerWidth || '72rem',
    textWidth: input?.textWidth || '42rem',
    sectionSpacing: input?.sectionSpacing || '2.75rem',
    fontSizeSm: input?.fontSizeSm || '0.875rem',
    fontSizeMd: input?.fontSizeMd || '1rem',
    fontSizeLg: input?.fontSizeLg || '1.125rem',
    fontSizeXl: input?.fontSizeXl || '1.5rem',
    fontSize2xl: input?.fontSize2xl || '2rem',
    fontSizeHero: input?.fontSizeHero || 'clamp(1.85rem, 4vw, 3.15rem)',
    imageRadius: input?.imageRadius || radius,
    imageAspect: input?.imageAspect || '4 / 5',
    buttonRadius: input?.buttonRadius || `calc(${radius} - 2px)`,
    buttonStyle: input?.buttonStyle || 'solid',
    density: input?.density || 'comfortable',
    radiusSm: input?.radiusSm || `calc(${radius} - 4px)`,
    radiusMd: input?.radiusMd || radius,
    radiusLg: input?.radiusLg || `calc(${radius} + 6px)`,
    radiusPill: input?.radiusPill || '9999px',
    shadowSm: input?.shadowSm || '0 4px 14px rgba(15, 23, 42, 0.06)',
    shadowMd: input?.shadowMd || input?.shadow || '0 12px 36px rgba(15, 23, 42, 0.10)',
    shadowLg: input?.shadowLg || '0 24px 60px rgba(15, 23, 42, 0.14)',
    fontWeightHeading: input?.fontWeightHeading ?? 800,
    fontWeightBody: input?.fontWeightBody ?? 400,
    lineHeightHeading: input?.lineHeightHeading ?? 1.15,
    lineHeightBody: input?.lineHeightBody ?? 1.6,
    imageTreatment: input?.imageTreatment || 'photo-real',
    iconSurface:
      input?.iconSurface || `color-mix(in srgb, ${primary} 14%, ${surface})`,
    iconColor: input?.iconColor || primary,
  };
}

export function applyQuickThemeToSpecTokens(
  presetId: LandingPageQuickThemeId,
  customOverrides?: Partial<LandingPageThemeTokenSet>,
): { theme: LandingPageTheme; themeTokens: LandingPageThemeTokenSet; themePreset: LandingPageQuickThemeId } {
  const preset = getLandingPageQuickThemePreset(presetId);
  const tokens =
    presetId === 'custom'
      ? normalizeLandingPageThemeTokens(
          { ...preset.tokens, ...customOverrides },
          preset.legacyTheme,
        )
      : normalizeLandingPageThemeTokens(preset.tokens, preset.legacyTheme);
  return {
    theme: preset.legacyTheme,
    themeTokens: tokens,
    themePreset: presetId,
  };
}

/** AI suggests a quick theme from industry / goal — user can always override. */
export function suggestLandingPageQuickTheme(input: {
  businessType?: string;
  pageGoal?: string;
  category?: string;
  productService?: string;
}): LandingPageQuickThemeId {
  const blob = [input.businessType, input.pageGoal, input.category, input.productService]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const goal = (input.pageGoal || '').toLowerCase();

  if (/luxury|premium|vàng|gold|jewelry|khách sạn|hotel|real.?estate|bất động sản/.test(blob)) {
    return 'luxury_gold';
  }
  if (/spa|clinic|wellness|skincare|mỹ phẩm|cosmetics|beauty|rose|làm đẹp/.test(blob)) {
    return 'rose';
  }
  if (/agency|creative|branding|purple|thiết kế/.test(blob)) return 'purple';
  if (/saas|software|tech|crm|blue|fintech/.test(blob)) return 'blue';
  if (/eco|green|organic|nông|wellness|health/.test(blob)) return 'green';
  if (/navy|b2b|consulting|corporate|bank/.test(blob)) return 'navy';
  if (goal === 'sales' || /conversion|orange|ecom|bán hàng/.test(blob)) return 'orange';
  if (/dark|night|gaming|crypto/.test(blob)) return 'dark';
  if (goal === 'event' || /webinar|event/.test(blob)) return 'navy';
  return 'light';
}
