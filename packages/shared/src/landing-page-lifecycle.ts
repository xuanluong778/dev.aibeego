import { sanitizeLandingPageMotionStyle, remapLandingPageMotion } from './landing-page-motion';
import { sanitizeSectionPlacement } from './landing-page-section-elements';
import { isVersionedLandingPageCanvasSpec, remapAgencyPortfolioCloneIds } from './landing-page-agency-portfolio-standard';
/**
 * Landing Page Auto — sanitize + validate + mutate helpers (Phase 1).
 */

import {
  LANDING_PAGE_BLOCK_TYPES,
  LANDING_PAGE_STATUSES,
  LANDING_PAGE_THEMES,
  LANDING_PAGE_THEME_PRESETS,
  type LandingPageBlock,
  type LandingPageBlockType,
  type LandingPageCountdownExpire,
  type LandingPageCountdownStyle,
  LANDING_PAGE_COUNTDOWN_STYLES,
  type LandingPageImageStyle,
  type LandingPageLeadFormField,
  type LandingPageSpec,
  type LandingPageStatus,
  type LandingPageTheme,
} from './landing-page-types';
import { sanitizeHtmlFragment } from './landing-page-html-import';
import { sanitizeTextBoxChrome } from './landing-page-text-box';
import { normalizeLandingPageThemeTokens } from './landing-page-theme-presets';
import {
  ELEMENT_FREE_MAX_X_PX,
  ELEMENT_FREE_MAX_Y_PX,
  sanitizeFreeLayout,
  sanitizePositionMode,
  sanitizeResponsiveFreeLayout,
  ensureSectionFreeLayoutHeight,
} from './landing-page-free-position';
import {
  AGENCY_PREMIUM_STANDARDS,
  resolveAgencyPremiumStandard,
  type AgencyPremiumStandard,
} from './landing-page-agency-gold-system';
import {
  CLINIC_GOLD_STANDARDS,
  resolveClinicGoldStandard,
  type ClinicGoldStandard,
} from './landing-page-clinic-gold-system';
import {
  SAAS_PREMIUM_STANDARDS,
  resolveSaasPremiumStandard,
  type SaasPremiumStandard,
} from './landing-page-saas-gold-system';
import {
  CONSULTING_PREMIUM_STANDARDS,
  resolveConsultingPremiumStandard,
  type ConsultingPremiumStandard,
} from './landing-page-consulting-gold-system';
import {
  SEO_PREMIUM_STANDARDS,
  resolveSeoPremiumStandard,
  type SeoPremiumStandard,
} from './landing-page-seo-gold-system';
import {
  SERVICE_PREMIUM_STANDARDS,
  resolveServicePremiumStandard,
  type ServicePremiumStandard,
} from './landing-page-service-gold-system';
import {
  WEBSITE_PREMIUM_STANDARDS,
  resolveWebsitePremiumStandard,
  type WebsitePremiumStandard,
} from './landing-page-website-gold-system';
import {
  PRODUCT_PREMIUM_STANDARDS,
  resolveProductPremiumStandard,
  type ProductPremiumStandard,
} from './landing-page-product-gold-system';
import {
  FASHION_PREMIUM_STANDARDS,
  resolveFashionPremiumStandard,
  type FashionPremiumStandard,
} from './landing-page-fashion-gold-system';
import {
  COSMETICS_PREMIUM_STANDARDS,
  resolveCosmeticsPremiumStandard,
  type CosmeticsPremiumStandard,
} from './landing-page-cosmetics-gold-system';
import {
  isLandingPageConversionGoal,
  isLandingPageDesignFamily,
  recipeFromLegacyGalleryArchitecture,
  resolveBlockVariant,
  sanitizeArchitectureRecipe,
} from './landing-page-template-foundation';

function withNestedFreeLayout<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  base: T,
): T {
  const positionMode = sanitizePositionMode(row.positionMode);
  const freeLayout = sanitizeFreeLayout(row.freeLayout);
  return {
    ...base,
    ...(positionMode ? { positionMode } : {}),
    ...(freeLayout ? { freeLayout } : {}),
  };
}

const BLOCK_TYPE_SET = new Set<string>(LANDING_PAGE_BLOCK_TYPES);

function sanitizeImageStyle(input: unknown, mode: LandingPageSanitizeMode): LandingPageImageStyle | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const row = input as Record<string, unknown>;
  const fit = row.fit === 'contain' || row.fit === 'cover' ? row.fit : undefined;
  const alt = clampText(row.alt ?? '', 200, mode) || undefined;
  const position = clampText(row.position ?? '', 40, mode) || undefined;
  const borderRadius = clampText(row.borderRadius ?? '', 24, mode) || undefined;
  const bgColor = clampText(row.bgColor ?? '', 64, mode) || undefined;
  const flipRaw = clampText(row.flip ?? '', 8, mode);
  const flip =
    flipRaw && /^(x|y|xy|yx)$/i.test(flipRaw)
      ? flipRaw.toLowerCase().includes('x') && flipRaw.toLowerCase().includes('y')
        ? 'xy'
        : flipRaw.toLowerCase().includes('x')
          ? 'x'
          : 'y'
      : undefined;
  const motionRaw = clampText(row.motion ?? '', 32, mode);
  const motion =
    motionRaw && motionRaw !== 'none' && /^(fade-in|ken-burns|pan-slow)$/.test(motionRaw)
      ? motionRaw
      : undefined;
  const zIndex = clampText(row.zIndex ?? '', 8, mode) || undefined;
  const href = safeUrl(row.href) || undefined;
  if (!fit && !alt && !position && !borderRadius && !bgColor && !flip && !motion && !zIndex && !href) {
    return undefined;
  }
  return { alt, fit, position, borderRadius, bgColor, flip, motion, zIndex, href: href || undefined };
}

/** `draft` = live typing / structural builder ops (preserve edge spaces). `persist` = autosave/publish/load. */
export type LandingPageSanitizeMode = 'draft' | 'persist';

export type SanitizeLandingPageOptions = {
  mode?: LandingPageSanitizeMode;
};

/**
 * Strip dangerous HTML only. Never trim — edge whitespace is owned by
 * `clampText(..., mode)` so draft vs persist semantics stay explicit.
 * Scoped to Landing Page lifecycle (not a global shared string util).
 */
const TEMPLATE_HTML_MAX = 1_500_000;

/** Keep layout CSS and markup. Drop scripts, frames, and javascript URLs. */
export function sanitizeTemplateHtml(input: string): string {
  let html = String(input || '').replace(/\0/g, '').slice(0, TEMPLATE_HTML_MAX);
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script\b[^>]*\/?>/gi, '');
  html = html.replace(/<\/script>/gi, '');
  html = html.replace(/<(?:iframe|object|embed|base)\b[^>]*>[\s\S]*?<\/(?:iframe|object|embed|base)>/gi, '');
  html = html.replace(/<(?:iframe|object|embed|base)\b[^>]*\/?>/gi, '');
  html = html.replace(/\s+on[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, '');
  html = html.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');
  html = html.replace(/(javascript|vbscript)\s*:/gi, '');
  html = html.replace(/(<form\b[^>]*?)\s+action\s*=\s*(['"])[\s\S]*?\2/gi, '$1');
  html = html.replace(/(<form\b[^>]*?)\s+action\s*=\s*[^\s>]+/gi, '$1');
  if (!html.trim()) return '';
  if (!/<html[\s>]/i.test(html)) {
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  }
  return html;
}

function stripHtml(input: string): string {
  return String(input || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\0/g, '');
}

function clampText(input: unknown, max: number, mode: LandingPageSanitizeMode = 'persist'): string {
  let raw = stripHtml(typeof input === 'string' ? input : String(input ?? ''));
  // Persist: trim only leading/trailing. Keep mid-string spaces (incl. multi-space) + Vietnamese.
  if (mode === 'persist') raw = raw.trim();
  return raw.slice(0, max);
}

/** CSS token values — strip tags, keep length bounded. Empty → omit so normalize fills defaults. */
function clampTokenCss(input: unknown, max: number): string | undefined {
  if (typeof input !== 'string') return undefined;
  const t = input.replace(/<\/style/gi, '').trim().slice(0, max);
  return t || undefined;
}

function clampTokenNumber(input: unknown): number | undefined {
  if (typeof input !== 'number' || !Number.isFinite(input)) return undefined;
  return input;
}

/**
 * Persist the full visual token set (density, type scale, shadows, …).
 * Old sanitizer only copied 12 color/font fields so live/public looked like a
 * different theme than the builder canvas.
 */
function sanitizePersistedThemeTokens(
  tokensIn: Record<string, unknown>,
  preset: (typeof LANDING_PAGE_THEME_PRESETS)[LandingPageTheme],
  theme: LandingPageTheme,
) {
  const density =
    tokensIn.density === 'compact' ||
    tokensIn.density === 'spacious' ||
    tokensIn.density === 'comfortable'
      ? tokensIn.density
      : undefined;
  const imageTreatment =
    tokensIn.imageTreatment === 'editorial' ||
    tokensIn.imageTreatment === 'product-flat' ||
    tokensIn.imageTreatment === 'illustration' ||
    tokensIn.imageTreatment === 'photo-real'
      ? tokensIn.imageTreatment
      : undefined;
  return normalizeLandingPageThemeTokens(
    {
      primary: clampText(tokensIn.primary ?? preset.primary, 48, 'persist') || preset.primary,
      secondary: clampText(tokensIn.secondary ?? preset.secondary, 48, 'persist') || preset.secondary,
      background: clampText(tokensIn.background ?? preset.background, 48, 'persist') || preset.background,
      surface: clampText(tokensIn.surface ?? preset.surface, 48, 'persist') || preset.surface,
      text: clampText(tokensIn.text ?? preset.text, 48, 'persist') || preset.text,
      muted: clampText(tokensIn.muted ?? preset.muted, 48, 'persist') || preset.muted,
      fontFamily: clampText(tokensIn.fontFamily ?? preset.fontFamily, 120, 'persist') || preset.fontFamily,
      radius: clampText(tokensIn.radius ?? preset.radius, 16, 'persist') || preset.radius,
      accent: clampTokenCss(tokensIn.accent, 48),
      border: clampTokenCss(tokensIn.border, 48),
      button: clampTokenCss(tokensIn.button, 48),
      gradient: clampTokenCss(tokensIn.gradient, 240),
      shadow: clampTokenCss(tokensIn.shadow, 160),
      canvas: clampTokenCss(tokensIn.canvas, 48),
      surfaceAlt: clampTokenCss(tokensIn.surfaceAlt, 48),
      textMuted: clampTokenCss(tokensIn.textMuted, 48),
      containerWidth: clampTokenCss(tokensIn.containerWidth, 32),
      textWidth: clampTokenCss(tokensIn.textWidth, 32),
      sectionSpacing: clampTokenCss(tokensIn.sectionSpacing, 32),
      fontSizeSm: clampTokenCss(tokensIn.fontSizeSm, 32),
      fontSizeMd: clampTokenCss(tokensIn.fontSizeMd, 32),
      fontSizeLg: clampTokenCss(tokensIn.fontSizeLg, 32),
      fontSizeXl: clampTokenCss(tokensIn.fontSizeXl, 32),
      fontSize2xl: clampTokenCss(tokensIn.fontSize2xl, 32),
      fontSizeHero: clampTokenCss(tokensIn.fontSizeHero, 80),
      imageRadius: clampTokenCss(tokensIn.imageRadius, 32),
      imageAspect: clampTokenCss(tokensIn.imageAspect, 32),
      buttonRadius: clampTokenCss(tokensIn.buttonRadius, 48),
      buttonStyle: clampTokenCss(tokensIn.buttonStyle, 32),
      density,
      radiusSm: clampTokenCss(tokensIn.radiusSm, 48),
      radiusMd: clampTokenCss(tokensIn.radiusMd, 48),
      radiusLg: clampTokenCss(tokensIn.radiusLg, 48),
      radiusPill: clampTokenCss(tokensIn.radiusPill, 16),
      shadowSm: clampTokenCss(tokensIn.shadowSm, 160),
      shadowMd: clampTokenCss(tokensIn.shadowMd, 160),
      shadowLg: clampTokenCss(tokensIn.shadowLg, 160),
      fontWeightHeading: clampTokenNumber(tokensIn.fontWeightHeading),
      fontWeightBody: clampTokenNumber(tokensIn.fontWeightBody),
      lineHeightHeading: clampTokenNumber(tokensIn.lineHeightHeading),
      lineHeightBody: clampTokenNumber(tokensIn.lineHeightBody),
      imageTreatment,
      iconSurface: clampTokenCss(tokensIn.iconSurface, 160),
      iconColor: clampTokenCss(tokensIn.iconColor, 48),
    },
    theme,
  );
}

function safeUrl(input: unknown): string | null {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return null;
  if (raw.startsWith('/')) return raw.slice(0, 2000);
  if (raw.startsWith('#')) return raw.slice(0, 120);
  // Landing Page CTAs commonly use phone / email deep links.
  if (/^tel:[+\d()\s.-]{3,40}$/i.test(raw)) return raw.replace(/\s+/g, '').slice(0, 64);
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(raw)) return raw.slice(0, 320);
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    // Block obvious SSRF to localhost / metadata (public LP assets only)
    const host = u.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return null;
    }
    return u.toString().slice(0, 2000);
  } catch {
    return null;
  }
}

/**
 * URL for draft/persist sanitize: keep in-progress values so autosave does not
 * drop Video/Hero blocks while the user is still typing a URL.
 */
function draftUrl(input: unknown, max = 2000): string | null {
  const validated = safeUrl(input);
  if (validated) return validated;
  if (typeof input !== 'string') return null;
  const raw = stripHtml(input).slice(0, max);
  if (!raw) return null;
  if (raw.startsWith('#')) return raw.slice(0, 120);
  if (/^tel:/i.test(raw) || /^mailto:/i.test(raw)) return raw.slice(0, max);
  if (raw.startsWith('/') || /^(https?:\/\/|www\.)/i.test(raw)) return raw;
  return null;
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyLandingPageSpec(theme: LandingPageTheme = 'MODERN'): LandingPageSpec {
  const tokens = LANDING_PAGE_THEME_PRESETS[theme] ?? LANDING_PAGE_THEME_PRESETS.MODERN;
  return {
    version: 1,
    theme,
    themeTokens: { ...tokens },
    seo: {
      title: 'Landing Page mới',
      metaDescription: 'Mô tả ngắn cho trang landing.',
      canonical: null,
      ogImage: null,
      robotsIndex: true,
    },
    blocks: [
      {
        id: uid('hero'),
        type: 'Hero',
        enabled: true,
        spacing: 'lg',
        headline: 'Tiêu đề chính thu hút khách',
        subheadline: 'Một câu hỗ trợ ngắn gọn, rõ lợi ích.',
        ctaLabel: 'Đăng ký ngay',
        ctaUrl: '#lead-form',
        imageUrl: null,
      },
      {
        id: uid('benefits'),
        type: 'Benefits',
        enabled: true,
        spacing: 'md',
        headline: 'Lợi ích nổi bật',
        items: [
          { id: uid('b'), title: 'Nhanh chóng', description: 'Triển khai trong vài phút.' },
          { id: uid('b'), title: 'Chuyên nghiệp', description: 'Giao diện chuẩn conversion.' },
          { id: uid('b'), title: 'Đo lường', description: 'Theo dõi lead & chuyển đổi.' },
        ],
      },
      {
        id: uid('form'),
        type: 'LeadForm',
        enabled: true,
        spacing: 'md',
        headline: 'Để lại thông tin',
        subheadline: 'Chúng tôi sẽ liên hệ trong 24 giờ.',
        submitLabel: 'Gửi thông tin',
        successMessage: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin.',
        fields: defaultLeadFormFields(),
      },
      {
        id: uid('footer'),
        type: 'Footer',
        enabled: true,
        spacing: 'sm',
        body: '© Ai Bee Go — Landing Page Auto',
      },
    ],
  };
}

export function defaultLeadFormFields(): LandingPageLeadFormField[] {
  return [
    {
      id: uid('f'),
      name: 'name',
      label: 'Họ tên',
      fieldType: 'text',
      required: true,
      placeholder: 'Nguyễn Văn A',
    },
    {
      id: uid('f'),
      name: 'phone',
      label: 'Số điện thoại',
      fieldType: 'tel',
      required: true,
      placeholder: '09xx xxx xxx',
    },
    {
      id: uid('f'),
      name: 'email',
      label: 'Email',
      fieldType: 'email',
      required: false,
      placeholder: 'ban@email.com',
    },
  ];
}

export function isLandingPageTheme(v: unknown): v is LandingPageTheme {
  return typeof v === 'string' && (LANDING_PAGE_THEMES as readonly string[]).includes(v);
}

export function isLandingPageStatus(v: unknown): v is LandingPageStatus {
  return typeof v === 'string' && (LANDING_PAGE_STATUSES as readonly string[]).includes(v);
}

export function isLandingPageBlockType(v: unknown): v is LandingPageBlockType {
  return typeof v === 'string' && BLOCK_TYPE_SET.has(v);
}

export function sanitizeLandingPageSpec(
  input: unknown,
  options?: SanitizeLandingPageOptions,
): LandingPageSpec {
  const mode: LandingPageSanitizeMode = options?.mode === 'draft' ? 'draft' : 'persist';
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<LandingPageSpec>;
  const theme = isLandingPageTheme(raw.theme) ? raw.theme : 'MODERN';
  const preset = LANDING_PAGE_THEME_PRESETS[theme];
  const tokensIn = (raw.themeTokens && typeof raw.themeTokens === 'object'
    ? raw.themeTokens
    : {}) as Record<string, unknown>;

  const seoIn = (raw.seo && typeof raw.seo === 'object' ? raw.seo : {}) as Record<string, unknown>;
  const blocksIn = Array.isArray(raw.blocks) ? raw.blocks : [];

  const blocks: LandingPageBlock[] = [];
  for (const b of blocksIn.slice(0, 80)) {
    const industryVideoContract = raw.meta?.rendererVersion === 'restaurant-menu-v2' || raw.meta?.rendererVersion === 'local-service-v2';
    const cleaned = sanitizeBlock(b, mode, industryVideoContract);
    if (cleaned) blocks.push(cleaned);
  }
  if (!blocks.length) {
    return createEmptyLandingPageSpec(theme);
  }

  const metaIn =
    raw.meta && typeof raw.meta === 'object'
      ? (raw.meta as Record<string, unknown>)
      : null;
  const fieldSources =
    metaIn?.fieldSources && typeof metaIn.fieldSources === 'object'
      ? (metaIn.fieldSources as Record<string, 'profile' | 'ai' | 'user'>)
      : undefined;
  const layoutRaw = metaIn?.layout;
  const layout =
    typeof layoutRaw === 'string' &&
    ['classic', 'webinar', 'lead_gen', 'service', 'course', 'saas', 'product', 'local', 'agency'].includes(
      layoutRaw,
    )
      ? layoutRaw
      : undefined;
  const category =
    typeof metaIn?.category === 'string' ? metaIn.category.slice(0, 40) : undefined;
  const galleryIn =
    metaIn?.gallery && typeof metaIn.gallery === 'object'
      ? (metaIn.gallery as Record<string, unknown>)
      : null;
  const galleryArchIn =
    galleryIn?.architecture && typeof galleryIn.architecture === 'object'
      ? (galleryIn.architecture as Record<string, unknown>)
      : null;
  const architectureRecipe =
    sanitizeArchitectureRecipe(metaIn?.architectureRecipe) ||
    recipeFromLegacyGalleryArchitecture(galleryArchIn, {
      flow: typeof galleryIn?.flowId === 'string' ? galleryIn.flowId : undefined,
    });
  const designFamily = isLandingPageDesignFamily(metaIn?.designFamily)
    ? metaIn.designFamily
    : architectureRecipe?.designFamily;
  const conversionGoal = isLandingPageConversionGoal(metaIn?.conversionGoal)
    ? metaIn.conversionGoal
    : architectureRecipe?.conversionGoal;
  const goldStandard = sanitizeGoldStandard(
    metaIn?.goldStandard,
    architectureRecipe?.architectureId,
  );
  const gallery = galleryIn
    ? {
        thumbnail:
          typeof galleryIn.thumbnail === 'string'
            ? galleryIn.thumbnail.slice(0, 500)
            : undefined,
        previewLongImage:
          typeof galleryIn.previewLongImage === 'string'
            ? galleryIn.previewLongImage.slice(0, 500)
            : undefined,
        badges: Array.isArray(galleryIn.badges)
          ? galleryIn.badges
              .filter((b): b is 'new' | 'popular' | 'high_conversion' =>
                b === 'new' || b === 'popular' || b === 'high_conversion',
              )
              .slice(0, 5)
          : undefined,
        flowId:
          typeof galleryIn.flowId === 'string' ? galleryIn.flowId.slice(0, 40) : undefined,
        ...(architectureRecipe
          ? {
              architecture: {
                id: architectureRecipe.architectureId,
                heroVariant: architectureRecipe.heroVariant,
                sectionSequence: architectureRecipe.sectionSequence,
                ctaStrategy: architectureRecipe.ctaStrategy,
                formPlacement: architectureRecipe.formPlacement,
                proofType: architectureRecipe.proofType,
                visualComposition: architectureRecipe.visualComposition,
                designFamily: architectureRecipe.designFamily,
                conversionGoal: architectureRecipe.conversionGoal,
                purpose: architectureRecipe.purpose,
              },
            }
          : galleryArchIn
            ? {
                architecture: {
                  id:
                    typeof galleryArchIn.id === 'string'
                      ? galleryArchIn.id.slice(0, 80)
                      : undefined,
                  heroVariant:
                    typeof galleryArchIn.heroVariant === 'string'
                      ? galleryArchIn.heroVariant.slice(0, 40)
                      : undefined,
                  sectionSequence: Array.isArray(galleryArchIn.sectionSequence)
                    ? galleryArchIn.sectionSequence
                        .filter((s): s is string => typeof s === 'string')
                        .slice(0, 40)
                    : undefined,
                  ctaStrategy:
                    typeof galleryArchIn.ctaStrategy === 'string'
                      ? galleryArchIn.ctaStrategy.slice(0, 40)
                      : undefined,
                  formPlacement:
                    typeof galleryArchIn.formPlacement === 'string'
                      ? galleryArchIn.formPlacement.slice(0, 40)
                      : undefined,
                  proofType:
                    typeof galleryArchIn.proofType === 'string'
                      ? galleryArchIn.proofType.slice(0, 40)
                      : undefined,
                  visualComposition:
                    typeof galleryArchIn.visualComposition === 'string'
                      ? galleryArchIn.visualComposition.slice(0, 40)
                      : undefined,
                },
              }
            : {}),
      }
    : undefined;
  const htmlSource =
    typeof metaIn?.htmlSource === 'string' && metaIn.htmlSource.trim()
      ? sanitizeTemplateHtml(metaIn.htmlSource)
      : '';
  const htmlConverted = metaIn?.htmlConverted === true;
  const htmlSections = Array.isArray(metaIn?.htmlSections)
    ? metaIn.htmlSections.slice(0, 40).flatMap((row) => {
        if (!row || typeof row !== 'object') return [];
        const record = row as { blockId?: unknown; html?: unknown; label?: unknown };
        const blockId = clampText(record.blockId ?? '', 64, 'persist');
        const html = sanitizeHtmlFragment(typeof record.html === 'string' ? record.html : '');
        if (!blockId || !html) return [];
        const label = clampText(record.label ?? '', 80, 'persist');
        return [{ blockId, html, ...(label ? { label } : {}) }];
      })
    : [];
  const htmlImportNotes = Array.isArray(metaIn?.htmlImportNotes)
    ? metaIn.htmlImportNotes
        .filter((note): note is string => typeof note === 'string')
        .map((note) => note.replace(/<[^>]+>/g, '').slice(0, 240))
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const isolatedScriptCount =
    typeof metaIn?.isolatedScriptCount === 'number' && Number.isFinite(metaIn.isolatedScriptCount)
      ? Math.max(0, Math.min(100, Math.floor(metaIn.isolatedScriptCount)))
      : 0;
  const scopedCss =
    typeof metaIn?.scopedCss === 'string'
      ? metaIn.scopedCss.replace(/<\/style/gi, '').slice(0, 20_000).trim()
      : '';
  const fontHref =
    typeof metaIn?.fontHref === 'string' &&
    /^https:\/\/fonts\.googleapis\.com\//.test(metaIn.fontHref) &&
    metaIn.fontHref.length <= 500
      ? metaIn.fontHref
      : '';
  const themePreset =
    typeof metaIn?.themePreset === 'string' ? metaIn.themePreset.slice(0, 40) : undefined;
  const themeUserLocked = metaIn?.themeUserLocked === true;
  const inlineTextStyles = sanitizeInlineTextStylesMap(metaIn?.inlineTextStyles);
  const elementFreeLayouts = sanitizeElementFreeLayoutsMap(metaIn?.elementFreeLayouts);
  const elementHidden = sanitizeElementFlagMap(metaIn?.elementHidden);
  const elementLocked = sanitizeElementFlagMap(metaIn?.elementLocked);
  const responsiveInlineTextStyles = sanitizeResponsiveInlineTextStylesMap(
    metaIn?.responsiveInlineTextStyles,
  );

  const normalizedTokens = sanitizePersistedThemeTokens(tokensIn, preset, theme);

  return {
    version: 1,
    theme,
    themeTokens: normalizedTokens,
    seo: {
      title: clampText(seoIn.title ?? 'Landing Page', 120, mode) || 'Landing Page',
      metaDescription: clampText(seoIn.metaDescription ?? '', 320, mode),
      canonical: draftUrl(seoIn.canonical),
      ogImage: draftUrl(seoIn.ogImage),
      robotsIndex: seoIn.robotsIndex !== false,
    },
    blocks,
    ...(metaIn
      ? {
          meta: {
            fieldSources,
            profileAppliedAt:
              typeof metaIn.profileAppliedAt === 'string' ? metaIn.profileAppliedAt : null,
            lastAiAt: typeof metaIn.lastAiAt === 'string' ? metaIn.lastAiAt : null,
            ...(typeof metaIn.aiGenerationId === 'string' ? { aiGenerationId: metaIn.aiGenerationId.slice(0, 120) } : {}),
            ...(typeof metaIn.aiTemplateSlug === 'string' ? { aiTemplateSlug: metaIn.aiTemplateSlug.slice(0, 80) } : {}),
            ...(metaIn.aiSource === 'ai' || metaIn.aiSource === 'fallback' ? { aiSource: metaIn.aiSource } : {}),
            ...(layout ? { layout: layout as NonNullable<LandingPageSpec['meta']>['layout'] } : {}),
            ...(category ? { category } : {}),
            ...(designFamily ? { designFamily } : {}),
            ...(conversionGoal ? { conversionGoal } : {}),
            ...(goldStandard ? { goldStandard } : {}),
            ...(architectureRecipe ? { architectureRecipe } : {}),
            ...(gallery ? { gallery } : {}),
            ...(metaIn.templateCopyVersion === 'vi-VN-v1' ? { templateCopyVersion: 'vi-VN-v1' as const } : {}),
            ...(typeof metaIn.rendererVersion === 'string' && metaIn.rendererVersion.trim()
              ? { rendererVersion: metaIn.rendererVersion.trim().slice(0, 80) }
              : {}),
            ...(typeof metaIn.catalogVersion === 'string' && metaIn.catalogVersion.trim()
              ? { catalogVersion: metaIn.catalogVersion.trim().slice(0, 80) }
              : {}),
            ...(htmlSource ? { htmlSource } : {}),
            ...(htmlSections.length ? { htmlSections } : {}),
            ...(htmlImportNotes.length ? { htmlImportNotes } : {}),
            ...(htmlConverted ? { htmlConverted: true } : {}),
            ...(isolatedScriptCount ? { isolatedScriptCount } : {}),
            ...(scopedCss ? { scopedCss } : {}),
            ...(fontHref ? { fontHref } : {}),
            ...(themePreset ? { themePreset } : {}),
            ...(themeUserLocked ? { themeUserLocked: true } : {}),
            ...(typeof metaIn.clientRevision === 'number' && Number.isFinite(metaIn.clientRevision)
              ? { clientRevision: Math.max(0, Math.floor(metaIn.clientRevision)) }
              : {}),
            ...(typeof metaIn.lastAutosaveRequestId === 'string' && metaIn.lastAutosaveRequestId.trim()
              ? { lastAutosaveRequestId: metaIn.lastAutosaveRequestId.trim().slice(0, 64) }
              : {}),
            ...(inlineTextStyles ? { inlineTextStyles } : {}),
            ...(elementFreeLayouts ? { elementFreeLayouts } : {}),
            ...(elementHidden ? { elementHidden } : {}),
            ...(elementLocked ? { elementLocked } : {}),
            ...(responsiveInlineTextStyles ? { responsiveInlineTextStyles } : {}),
          },
        }
      : {}),
  };
}

function sanitizeElementFlagMap(input: unknown): Record<string, boolean> | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof k !== 'string' || k.length > 160 || v !== true) continue;
    out[k.slice(0, 160)] = true;
  }
  return Object.keys(out).length ? out : undefined;
}

function sanitizeResponsiveInlineTextStylesMap(
  input: unknown,
): NonNullable<LandingPageSpec['meta']>['responsiveInlineTextStyles'] | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const out: NonNullable<LandingPageSpec['meta']>['responsiveInlineTextStyles'] = {};
  for (const [key, row] of Object.entries(input as Record<string, unknown>)) {
    if (typeof key !== 'string' || key.length > 160 || !row || typeof row !== 'object') continue;
    const entry: Partial<Record<'desktop' | 'tablet' | 'mobile', Record<string, unknown>>> = {};
    for (const vp of ['desktop', 'tablet', 'mobile'] as const) {
      const style = (row as Record<string, unknown>)[vp];
      const sanitized = sanitizeInlineTextStylesMap({ [`${key}::${vp}`]: style });
      const one = sanitized?.[`${key}::${vp}`];
      if (one) entry[vp] = one;
    }
    if (Object.keys(entry).length) out[key.slice(0, 160)] = entry;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Preserve canvas element translate offsets (offset mode only). */
function sanitizeElementFreeLayoutsMap(
  raw: unknown,
): NonNullable<LandingPageSpec['meta']>['elementFreeLayouts'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: NonNullable<LandingPageSpec['meta']>['elementFreeLayouts'] = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const safeKey = String(key).slice(0, 160);
    if (!safeKey || !val || typeof val !== 'object') continue;
    const s = val as Record<string, unknown>;
    const x = typeof s.x === 'number' && Number.isFinite(s.x) ? Math.min(ELEMENT_FREE_MAX_X_PX, Math.max(-ELEMENT_FREE_MAX_X_PX, s.x)) : null;
    const y = typeof s.y === 'number' && Number.isFinite(s.y) ? Math.min(ELEMENT_FREE_MAX_Y_PX, Math.max(-ELEMENT_FREE_MAX_Y_PX, s.y)) : null;
    if (x == null || y == null) continue;
    const cleaned: NonNullable<typeof out>[string] = { x, y };
    if (typeof s.width === 'number' && Number.isFinite(s.width)) {
      cleaned.width = Math.min(1200, Math.max(40, s.width));
    }
    if (typeof s.height === 'number' && Number.isFinite(s.height)) {
      cleaned.height = Math.min(1200, Math.max(28, s.height));
    }
    if (typeof s.rotate === 'number' && Number.isFinite(s.rotate)) {
      cleaned.rotate = ((s.rotate % 360) + 360) % 360;
    }
    out[safeKey] = cleaned;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Preserve canvas typography presets across draft/persist sanitize (no HTML). */
function sanitizeInlineTextStylesMap(
  raw: unknown,
): NonNullable<LandingPageSpec['meta']>['inlineTextStyles'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: NonNullable<LandingPageSpec['meta']>['inlineTextStyles'] = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const safeKey = String(key).slice(0, 160);
    if (!safeKey || !val || typeof val !== 'object') continue;
    const s = val as Record<string, unknown>;
    const cleaned: NonNullable<typeof out>[string] = {};
    if (typeof s.fontSize === 'number' && Number.isFinite(s.fontSize)) {
      cleaned.fontSize = Math.min(200, Math.max(8, Math.round(s.fontSize)));
    }
    if (s.fontWeight === 'normal' || s.fontWeight === 'bold') {
      cleaned.fontWeight = s.fontWeight;
    } else if (typeof s.fontWeight === 'number' && Number.isFinite(s.fontWeight)) {
      cleaned.fontWeight = Math.min(900, Math.max(100, Math.round(s.fontWeight / 100) * 100));
    }
    if (
      s.textAlign === 'left' ||
      s.textAlign === 'center' ||
      s.textAlign === 'right' ||
      s.textAlign === 'justify'
    ) {
      cleaned.textAlign = s.textAlign;
    }
    if (typeof s.color === 'string' && s.color.length <= 64) cleaned.color = s.color;
    if (typeof s.fontFamily === 'string' && s.fontFamily.length <= 200) {
      cleaned.fontFamily = s.fontFamily.slice(0, 200);
    }
    if (s.fontStyle === 'normal' || s.fontStyle === 'italic') cleaned.fontStyle = s.fontStyle;
    if (s.fontSizeUnit === 'px' || s.fontSizeUnit === 'rem') cleaned.fontSizeUnit = s.fontSizeUnit;
    if (typeof s.textDecoration === 'string' && s.textDecoration.length <= 64) {
      cleaned.textDecoration = s.textDecoration.slice(0, 64);
    }
    if (
      s.textTransform === 'none' ||
      s.textTransform === 'uppercase' ||
      s.textTransform === 'capitalize' ||
      s.textTransform === 'lowercase'
    ) {
      cleaned.textTransform = s.textTransform;
    }
    if (typeof s.letterSpacing === 'string' && s.letterSpacing.length <= 24) {
      cleaned.letterSpacing = s.letterSpacing;
    }
    if (typeof s.lineHeight === 'number' && Number.isFinite(s.lineHeight)) {
      cleaned.lineHeight = Math.min(3, Math.max(0.8, s.lineHeight));
    } else if (typeof s.lineHeight === 'string' && s.lineHeight.length <= 24) {
      cleaned.lineHeight = s.lineHeight;
    }
    if (typeof s.backgroundImage === 'string' && s.backgroundImage.length <= 400) {
      cleaned.backgroundImage = s.backgroundImage.slice(0, 400);
    }
    if (s.backgroundClip === 'text') cleaned.backgroundClip = 'text';
    if (typeof s.webkitTextFillColor === 'string' && s.webkitTextFillColor.length <= 64) {
      cleaned.webkitTextFillColor = s.webkitTextFillColor;
    }
    if (
      typeof s.headingLevel === 'number' &&
      Number.isInteger(s.headingLevel) &&
      s.headingLevel >= 1 &&
      s.headingLevel <= 6
    ) {
      cleaned.headingLevel = s.headingLevel as 1 | 2 | 3 | 4 | 5 | 6;
    }
    if (typeof s.width === 'number' && Number.isFinite(s.width)) {
      cleaned.width = Math.min(2400, Math.max(40, Math.round(s.width)));
    }
    if (typeof s.height === 'number' && Number.isFinite(s.height)) {
      cleaned.height = Math.min(2400, Math.max(28, Math.round(s.height)));
    }
    const box = sanitizeTextBoxChrome(s.box);
    if (box) cleaned.box = box;
    if (Object.keys(cleaned).length) out[safeKey] = cleaned;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Preserve gold-standard preset through DB sync / API round-trip. */
function sanitizeGoldStandard(
  raw: unknown,
  architectureId?: string,
):
  | AgencyPremiumStandard
  | ClinicGoldStandard
  | SaasPremiumStandard
  | ServicePremiumStandard
  | ConsultingPremiumStandard
  | SeoPremiumStandard
  | WebsitePremiumStandard
  | ProductPremiumStandard
  | FashionPremiumStandard
  | CosmeticsPremiumStandard
  | undefined {
  const v = typeof raw === 'string' ? raw.trim() : '';
  if ((AGENCY_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as AgencyPremiumStandard;
  }
  if ((CLINIC_GOLD_STANDARDS as readonly string[]).includes(v)) {
    return v as ClinicGoldStandard;
  }
  if ((SAAS_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as SaasPremiumStandard;
  }
  if ((SERVICE_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as ServicePremiumStandard;
  }
  if ((CONSULTING_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as ConsultingPremiumStandard;
  }
  if ((SEO_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as SeoPremiumStandard;
  }
  if ((WEBSITE_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as WebsitePremiumStandard;
  }
  if ((PRODUCT_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as ProductPremiumStandard;
  }
  if ((FASHION_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as FashionPremiumStandard;
  }
  if ((COSMETICS_PREMIUM_STANDARDS as readonly string[]).includes(v)) {
    return v as CosmeticsPremiumStandard;
  }
  return (
    resolveAgencyPremiumStandard(architectureId) ||
    resolveClinicGoldStandard(architectureId) ||
    resolveSaasPremiumStandard(architectureId) ||
    resolveServicePremiumStandard(architectureId) ||
    resolveConsultingPremiumStandard(architectureId) ||
    resolveSeoPremiumStandard(architectureId) ||
    resolveWebsitePremiumStandard(architectureId) ||
    resolveProductPremiumStandard(architectureId) ||
    resolveFashionPremiumStandard(architectureId) ||
    resolveCosmeticsPremiumStandard(architectureId)
  );
}

/** Live / structural builder path — never edge-trims user text. */
export function sanitizeLandingPageDraftSpec(input: unknown): LandingPageSpec {
  return sanitizeLandingPageSpec(input, { mode: 'draft' });
}

/** Autosave / publish / reload path — strip dangerous HTML + trim edges only. */
export function sanitizeLandingPagePersistSpec(input: unknown): LandingPageSpec {
  return sanitizeLandingPageSpec(input, { mode: 'persist' });
}

function sanitizeBlock(input: unknown, mode: LandingPageSanitizeMode = 'persist', allowIndustryVideoPlaceholder = false): LandingPageBlock | null {
  if (!input || typeof input !== 'object') return null;
  const b = input as Record<string, unknown>;
  const type = b.type;
  if (!isLandingPageBlockType(type)) return null;
  const id = clampText(b.id ?? uid(type.toLowerCase()), 64, 'persist') || uid('blk');
  const enabled = b.enabled !== false;
  const spacing: 'none' | 'sm' | 'md' | 'lg' =
    b.spacing === 'none' || b.spacing === 'sm' || b.spacing === 'md' || b.spacing === 'lg'
      ? b.spacing
      : 'md';
  const background =
    typeof b.background === 'string' ? clampText(b.background, 600, 'persist') || null : null;
  const locked = b.locked === true;
  const hidden = b.hidden === true;
  const layerName = clampText(b.layerName ?? '', 80, mode) || undefined;
  const style =
    b.style && typeof b.style === 'object' && !Array.isArray(b.style)
      ? { ...(b.style as Record<string, unknown>) }
      : undefined;
  if (style && 'lpMotion' in style) {
    const motion = sanitizeLandingPageMotionStyle(style.lpMotion);
    if (motion) style.lpMotion = motion;
    else delete style.lpMotion;
  }
  const responsiveStyle =
    b.responsiveStyle && typeof b.responsiveStyle === 'object'
      ? (b.responsiveStyle as Record<string, unknown>)
      : undefined;
  const positionMode = sanitizePositionMode(b.positionMode);
  let freeLayout = sanitizeFreeLayout(b.freeLayout);
  if (positionMode === 'free' && freeLayout) {
    freeLayout = ensureSectionFreeLayoutHeight(freeLayout);
  }
  const responsiveFreeLayout = sanitizeResponsiveFreeLayout(b.responsiveFreeLayout);
  const variant = resolveBlockVariant(
    type,
    b.variant ?? (type === 'Countdown' ? b.styleVariant : undefined),
  );
  const sectionPlacement = sanitizeSectionPlacement(b.sectionPlacement);
  const base = {
    ...(sectionPlacement ? { sectionPlacement } : {}),
    id,
    enabled,
    spacing,
    background,
    variant,
    ...(locked ? { locked: true } : {}),
    ...(hidden ? { hidden: true } : {}),
    ...(layerName ? { layerName } : {}),
    ...(style ? { style } : {}),
    ...(responsiveStyle ? { responsiveStyle } : {}),
    ...(positionMode ? { positionMode } : {}),
    ...(freeLayout ? { freeLayout } : {}),
    ...(responsiveFreeLayout ? { responsiveFreeLayout } : {}),
  };

  if (type === 'Hero' || type === 'CTA' || type === 'Guarantee' || type === 'Footer' || type === 'Header') {
    const trustRaw = Array.isArray(b.trustPoints) ? b.trustPoints : [];
    const imageStyle = sanitizeImageStyle(b.imageStyle, mode);
    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      subheadline: clampText(b.subheadline ?? '', 400, mode),
      body: clampText(b.body ?? '', 2000, mode),
      ctaLabel: clampText(b.ctaLabel ?? '', 80, mode),
      ctaUrl: draftUrl(b.ctaUrl) ?? '',
      imageUrl: draftUrl(b.imageUrl),
      ...(imageStyle ? { imageStyle } : {}),
      videoUrl: draftUrl(b.videoUrl),
      ...(type === 'Hero'
        ? {
            eventDate: clampText(b.eventDate ?? '', 80, mode) || undefined,
            eventTime: clampText(b.eventTime ?? '', 80, mode) || undefined,
            eventFormat: clampText(b.eventFormat ?? '', 80, mode) || undefined,
            trustPoints: trustRaw
              .map((t) => clampText(t, 160, mode))
              .filter(Boolean)
              .slice(0, 8),
          }
        : {}),
    };
  }

  if (type === 'Countdown') {
    const expireRaw = String(b.expireBehavior || 'zero');
    const expireBehavior: LandingPageCountdownExpire =
      expireRaw === 'hide' || expireRaw === 'message' || expireRaw === 'cta' || expireRaw === 'zero'
        ? expireRaw
        : 'zero';
    const styleRaw = String(b.styleVariant || 'boxes');
    const styleVariant: LandingPageCountdownStyle = (
      LANDING_PAGE_COUNTDOWN_STYLES as readonly string[]
    ).includes(styleRaw)
      ? (styleRaw as LandingPageCountdownStyle)
      : 'boxes';
    const launch =
      styleVariant !== 'boxes' && styleVariant !== 'inline' && styleVariant !== 'minimal';
    let endsAt = clampText(b.endsAt ?? '', 64, mode);
    if (!endsAt || Number.isNaN(Date.parse(endsAt))) {
      endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }
    return {
      ...base,
      type: 'Countdown',
      headline: clampText(b.headline ?? '', 200, mode),
      subheadline: clampText(b.subheadline ?? '', 400, mode),
      kicker: clampText(b.kicker ?? '', 80, mode) || undefined,
      endsAt,
      timezone: clampText(b.timezone ?? 'Asia/Ho_Chi_Minh', 64, mode) || 'Asia/Ho_Chi_Minh',
      showDays: b.showDays !== false,
      showHours: b.showHours !== false,
      showMinutes: b.showMinutes !== false,
      showSeconds: b.showSeconds !== false,
      expireBehavior,
      expireMessage: clampText(b.expireMessage ?? '', 240, mode),
      expireCtaLabel: clampText(b.expireCtaLabel ?? '', 80, mode),
      expireCtaUrl: draftUrl(b.expireCtaUrl) ?? '#lead-form',
      styleVariant,
      showSignup: launch ? b.showSignup !== false : b.showSignup === true,
      formHeadline: clampText(b.formHeadline ?? '', 120, mode) || undefined,
      submitLabel: clampText(b.submitLabel ?? '', 80, mode) || undefined,
    };
  }

  if (type === 'Video') {
    const videoUrl = draftUrl(b.videoUrl);
    // Only the explicit industry contract keeps a deliberate empty video slot.
    // Legacy and unknown renderers retain their existing sanitization behavior.
    const placeholder = allowIndustryVideoPlaceholder && style?.industryVideoPlaceholder === true;
    if (!videoUrl && !placeholder) return null;
    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      videoUrl: videoUrl || '',
      posterUrl: draftUrl(b.posterUrl),
    };
  }

  if (type === 'Pricing') {
    const plansIn = Array.isArray(b.plans) ? b.plans : [];
    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      subheadline: clampText(b.subheadline ?? '', 400, mode),
      plans: plansIn.slice(0, 6).map((p) => {
        const plan = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
        const features = Array.isArray(plan.features)
          ? plan.features.map((f) => clampText(f, 120, mode)).filter(Boolean).slice(0, 12)
          : [];
        return withNestedFreeLayout(plan, {
          id: clampText(plan.id ?? uid('plan'), 64, 'persist'),
          name: clampText(plan.name ?? 'Gói', 80, mode),
          price: clampText(plan.price ?? '', 80, mode),
          period: clampText(plan.period ?? '', 40, mode),
          features,
          ctaLabel: clampText(plan.ctaLabel ?? 'Chọn gói', 60, mode),
          ...(plan.ctaUrl ? { ctaUrl: draftUrl(plan.ctaUrl) || '#lead-form' } : {}),
          highlighted: plan.highlighted === true,
        });
      }),
    };
  }

  if (type === 'Testimonials') {
    const itemsIn = Array.isArray(b.items) ? b.items : [];
    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      items: itemsIn.slice(0, 12).map((it) => {
        const row = (it && typeof it === 'object' ? it : {}) as Record<string, unknown>;
        return {
          id: clampText(row.id ?? uid('t'), 64, 'persist'),
          quote: clampText(row.quote ?? '', 600, mode),
          author: clampText(row.author ?? '', 80, mode),
          role: clampText(row.role ?? '', 80, mode),
          avatarUrl: draftUrl(row.avatarUrl),
        };
      }),
    };
  }

  if (type === 'FAQ') {
    const itemsIn = Array.isArray(b.items) ? b.items : [];
    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      items: itemsIn.slice(0, 20).map((it) => {
        const row = (it && typeof it === 'object' ? it : {}) as Record<string, unknown>;
        return {
          id: clampText(row.id ?? uid('q'), 64, 'persist'),
          question: clampText(row.question ?? '', 240, mode),
          answer: clampText(row.answer ?? '', 1200, mode),
        };
      }),
    };
  }

  if (type === 'LeadForm') {
    const fieldsIn = Array.isArray(b.fields) ? b.fields : defaultLeadFormFields();
    const themeIn =
      b.formTheme && typeof b.formTheme === 'object'
        ? (b.formTheme as Record<string, unknown>)
        : null;
    const formTheme = themeIn
      ? {
          background: clampText(themeIn.background ?? '', 120, 'persist') || undefined,
          border: clampText(themeIn.border ?? '', 120, 'persist') || undefined,
          headlineColor: clampText(themeIn.headlineColor ?? '', 40, 'persist') || undefined,
          labelColor: clampText(themeIn.labelColor ?? '', 40, 'persist') || undefined,
          mutedColor: clampText(themeIn.mutedColor ?? '', 40, 'persist') || undefined,
          inputBg: clampText(themeIn.inputBg ?? '', 40, 'persist') || undefined,
          inputBorder: clampText(themeIn.inputBorder ?? '', 40, 'persist') || undefined,
          inputColor: clampText(themeIn.inputColor ?? '', 40, 'persist') || undefined,
          buttonBg: clampText(themeIn.buttonBg ?? '', 80, 'persist') || undefined,
          buttonColor: clampText(themeIn.buttonColor ?? '', 40, 'persist') || undefined,
          optionBg: clampText(themeIn.optionBg ?? '', 40, 'persist') || undefined,
          optionBorder: clampText(themeIn.optionBorder ?? '', 40, 'persist') || undefined,
          radius: clampText(themeIn.radius ?? '', 24, 'persist') || undefined,
          titleFont:
            themeIn.titleFont === 'serif' || themeIn.titleFont === 'sans'
              ? (themeIn.titleFont as 'serif' | 'sans')
              : undefined,
        }
      : undefined;
    const crmIn = b.crm && typeof b.crm === 'object' ? (b.crm as Record<string, unknown>) : null;
    const crmTags = Array.isArray(crmIn?.tags)
      ? crmIn!.tags
          .map((t) => clampText(t, 48, 'persist'))
          .filter(Boolean)
          .slice(0, 12)
      : undefined;
    const crm =
      crmIn &&
      (crmIn.pipelineId ||
        crmIn.stageId ||
        crmIn.assignedToId ||
        (crmTags && crmTags.length) ||
        crmIn.webhookUrl ||
        crmIn.autoAssign === false)
        ? {
            ...(typeof crmIn.pipelineId === 'string' && crmIn.pipelineId.length <= 64
              ? { pipelineId: crmIn.pipelineId.slice(0, 64) }
              : {}),
            ...(typeof crmIn.stageId === 'string' && crmIn.stageId.length <= 64
              ? { stageId: crmIn.stageId.slice(0, 64) }
              : {}),
            ...(typeof crmIn.assignedToId === 'string' && crmIn.assignedToId.length <= 64
              ? { assignedToId: crmIn.assignedToId.slice(0, 64) }
              : {}),
            ...(crmTags?.length ? { tags: crmTags } : {}),
            ...(crmIn.autoAssign === false ? { autoAssign: false as const } : {}),
            ...(typeof crmIn.webhookUrl === 'string' && crmIn.webhookUrl.length <= 500
              ? { webhookUrl: crmIn.webhookUrl.slice(0, 500) }
              : {}),
            ...(typeof crmIn.webhookSecret === 'string' && crmIn.webhookSecret.length <= 256
              ? { webhookSecret: crmIn.webhookSecret.slice(0, 256) }
              : {}),
          }
        : undefined;

    return {
      ...base,
      type,
      headline: clampText(b.headline ?? '', 200, mode),
      subheadline: clampText(b.subheadline ?? '', 400, mode),
      submitLabel: clampText(b.submitLabel ?? 'Gửi', 60, mode) || 'Gửi',
      successMessage: clampText(b.successMessage ?? 'Cảm ơn bạn!', 240, mode),
      footerText: clampText(b.footerText ?? '', 200, mode) || undefined,
      ...(formTheme && Object.values(formTheme).some(Boolean) ? { formTheme } : {}),
      ...(crm && Object.keys(crm).length ? { crm } : {}),
      fields: fieldsIn.slice(0, 20).map((f) => {
        const row = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>;
        const fieldType =
          row.fieldType === 'email' ||
          row.fieldType === 'tel' ||
          row.fieldType === 'textarea' ||
          row.fieldType === 'select' ||
          row.fieldType === 'checkbox' ||
          row.fieldType === 'radio'
            ? row.fieldType
            : 'text';
        const optionsLayout =
          row.optionsLayout === 'select' ||
          row.optionsLayout === 'buttons' ||
          row.optionsLayout === 'checkboxes' ||
          row.optionsLayout === 'emoji' ||
          row.optionsLayout === 'scale' ||
          row.optionsLayout === 'stars'
            ? row.optionsLayout
            : undefined;
        return {
          id: clampText(row.id ?? uid('f'), 64, 'persist'),
          name: clampText(row.name ?? 'field', 40, 'persist').replace(/[^a-zA-Z0-9_]/g, '_') || 'field',
          label: clampText(row.label ?? 'Field', 80, mode),
          fieldType,
          required: row.required === true,
          placeholder: clampText(row.placeholder ?? '', 120, mode),
          options: Array.isArray(row.options)
            ? row.options.map((o) => clampText(o, 80, mode)).filter(Boolean).slice(0, 30)
            : undefined,
          ...(optionsLayout ? { optionsLayout } : {}),
        };
      }),
    };
  }

  // Benefits | Features | Process | Gallery | Product | Speaker
  const itemsIn = Array.isArray(b.items) ? b.items : [];
  return {
    ...base,
    type: type as 'Benefits' | 'Features' | 'Process' | 'Gallery' | 'Product' | 'Speaker',
    headline: clampText(b.headline ?? '', 200, mode),
    subheadline: clampText(b.subheadline ?? '', 400, mode),
    items: itemsIn.slice(0, 24).map((it) => {
      const row = (it && typeof it === 'object' ? it : {}) as Record<string, unknown>;
      const imageStyle = sanitizeImageStyle(row.imageStyle, mode);
      return withNestedFreeLayout(row, {
        id: clampText(row.id ?? uid('i'), 64, 'persist'),
        title: clampText(row.title ?? '', 120, mode),
        description: clampText(row.description ?? '', 400, mode),
        icon: clampText(row.icon ?? '', 40, 'persist') || null,
        imageUrl: draftUrl(row.imageUrl),
        ...(imageStyle ? { imageStyle } : {}),
        role: clampText(row.role ?? '', 120, mode) || undefined,
      });
    }),
  };
}

export function duplicateBlock(block: LandingPageBlock): LandingPageBlock {
  const copy = JSON.parse(JSON.stringify(block)) as LandingPageBlock & Record<string, unknown>;
  copy.id = uid(block.type.toLowerCase());
  // Fresh copy sits in normal document flow (never inherit broken free coords).
  delete copy.positionMode;
  delete copy.freeLayout;
  delete copy.responsiveFreeLayout;
  if (Array.isArray(copy.items)) {
    copy.items = copy.items.map((row: Record<string, unknown>) => {
      const next: Record<string, unknown> = { ...row, id: uid('item') };
      delete next.positionMode;
      delete next.freeLayout;
      return next;
    });
  }
  if (Array.isArray(copy.plans)) {
    copy.plans = copy.plans.map((row: { id?: string } & Record<string, unknown>) => {
      const next: Record<string, unknown> = { ...row, id: uid('plan') };
      delete next.positionMode;
      delete next.freeLayout;
      return next;
    });
  }
  if (Array.isArray(copy.fields)) {
    copy.fields = copy.fields.map((row: { id?: string } & Record<string, unknown>) => ({
      ...row,
      id: uid('fld'),
    }));
  }
  if (copy.style?.lpMotion) {
    const ids = new Map<string, string>();
    for (const name of ['items', 'plans', 'fields'] as const) {
      const before = (block as unknown as Record<string, unknown>)[name];
      const after = copy[name];
      if (Array.isArray(before) && Array.isArray(after)) before.forEach((row, index) => {
        if (row.id && after[index]?.id) ids.set(row.id, after[index].id);
      });
    }
    copy.style = { ...copy.style, lpMotion: remapLandingPageMotion(copy.style.lpMotion, ids) };
  }
  return sanitizeBlock(copy, 'persist', copy.style?.industryVideoPlaceholder === true)!;
}

/** Clone one nested card/item/plan row with a new stable id. */
export function duplicateLandingPageNestedItem<T extends { id: string }>(item: T): T {
  const copy = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
  copy.id = uid('item');
  if (copy.positionMode === 'free' || (copy.freeLayout && typeof copy.freeLayout === 'object')) {
    copy.positionMode = 'free';
    const fl = { ...((copy.freeLayout as Record<string, unknown>) || {}) };
    if (typeof fl.x === 'number') fl.x = Math.round(fl.x + 24);
    else fl.x = 24;
    if (typeof fl.y === 'number') fl.y = Math.round(fl.y + 24);
    else fl.y = 24;
    copy.freeLayout = fl;
  }
  return copy as T;
}

/**
 * Deep-clone a landing page spec and regenerate every stable id
 * (blocks + nested items/plans/fields). Used when cloning a template
 * into a new draft so the master template definition is never mutated.
 */
export function cloneLandingPageSpecWithNewIds(input: LandingPageSpec): LandingPageSpec {
  const raw = JSON.parse(JSON.stringify(input)) as LandingPageSpec;
  const idMap = new Map<string, string>();
  const hasSectionElements = raw.blocks.some(b => Boolean(b.sectionPlacement));
  const blocks = (raw.blocks || []).map((block) => {
    const id = uid(block.type.toLowerCase());
    idMap.set(block.id, id);
    const next = { ...block, id } as LandingPageBlock & Record<string, unknown>;
    if (Array.isArray(next.items)) {
      next.items = next.items.map((row: { id?: string } & Record<string, unknown>) => {
        const nestedId = uid('item');
        if ((isVersionedLandingPageCanvasSpec(raw) || hasSectionElements) && row.id) idMap.set(row.id, nestedId);
        return { ...row, id: nestedId };
      });
    }
    if (Array.isArray(next.plans)) {
      next.plans = next.plans.map((row: { id?: string } & Record<string, unknown>) => {
        const nestedId = uid('plan');
        if ((isVersionedLandingPageCanvasSpec(raw) || hasSectionElements) && row.id) idMap.set(row.id, nestedId);
        return { ...row, id: nestedId };
      });
    }
    if (Array.isArray(next.fields)) {
      next.fields = next.fields.map((row: { id?: string } & Record<string, unknown>) => {
        const nestedId = uid('fld');
        if ((isVersionedLandingPageCanvasSpec(raw) || hasSectionElements) && row.id) idMap.set(row.id, nestedId);
        return { ...row, id: nestedId };
      });
    }
    if (next.style?.lpMotion) {
      const localIds = new Map<string, string>();
      for (const name of ['items', 'plans', 'fields'] as const) {
        const before = (block as unknown as Record<string, unknown>)[name];
        const after = next[name];
        if (Array.isArray(before) && Array.isArray(after)) before.forEach((row, index) => {
          if (row.id && after[index]?.id) localIds.set(row.id, after[index].id);
        });
      }
      next.style = { ...next.style, lpMotion: remapLandingPageMotion(next.style.lpMotion, localIds) };
    }
    return next as LandingPageBlock;
  });
  for (const block of blocks) {
    const p = block.sectionPlacement;
    if (!p) continue;
    block.sectionPlacement = {
      ...p,
      sectionId: idMap.get(p.sectionId) || p.sectionId,
      anchor: p.anchor.kind === 'end' ? p.anchor : {
        ...p.anchor,
        blockId: idMap.get(p.anchor.blockId) || p.anchor.blockId,
        ...(p.anchor.kind === 'field' ? { field: p.anchor.field.replace(/:([^:]+)$/, (full, id) => ':' + (idMap.get(id) || id)) } : {}),
      },
    };
  }
  const meta = raw.meta ? { ...raw.meta } : undefined;
  if (meta && 'clientRevision' in meta) {
    delete (meta as { clientRevision?: number }).clientRevision;
  }
  if (meta && 'lastAutosaveRequestId' in meta) {
    delete (meta as { lastAutosaveRequestId?: string }).lastAutosaveRequestId;
  }
  if(hasSectionElements && meta){
    const bag=meta as Record<string,unknown>;
    for(const name of ['inlineTextStyles','elementFreeLayouts','elementHidden','elementLocked','responsiveInlineTextStyles','fieldSources']){
      const map=bag[name];
      if(map && typeof map==='object' && !Array.isArray(map))bag[name]=Object.fromEntries(Object.entries(map).map(([key,value])=>[key.split(/(::|:|\.)/).map(part=>idMap.get(part)||part).join(''),value]));
    }
  }
  if (meta && Array.isArray(meta.htmlSections)) {
    meta.htmlSections = meta.htmlSections.map((row) => ({
      ...row,
      blockId: idMap.get(row.blockId) || row.blockId,
    }));
  }
  return sanitizeLandingPagePersistSpec(remapAgencyPortfolioCloneIds({
    ...raw,
    blocks,
    ...(meta ? { meta } : {}),
  }, idMap));
}

export function reorderBlocks(blocks: LandingPageBlock[], from: number, to: number): LandingPageBlock[] {
  if (from < 0 || to < 0 || from >= blocks.length || to >= blocks.length || from === to) {
    return blocks;
  }
  const next = [...blocks];
  const [item] = next.splice(from, 1);
  if (!item) return blocks;
  next.splice(to, 0, item);
  return next;
}

export function slugifyLandingPage(input: string): string {
  const base = stripHtml(input)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || `lp-${Date.now().toString(36)}`;
}

export function validateLandingPageSpec(spec: LandingPageSpec): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!spec.seo.title) errors.push('SEO title is required');
  if (!spec.blocks.length) errors.push('At least one block is required');
  if (!spec.blocks.some((b) => b.enabled)) errors.push('At least one enabled block is required');
  return { ok: errors.length === 0, errors };
}
