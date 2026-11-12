/**
 * Landing Page Template foundation — designFamily, conversionGoal,
 * architecture recipes, and type-safe block variants.
 *
 * Source of truth for recipe/variant IDs. Catalog expand stamps a snapshot into
 * spec.meta; blocks carry only `variant` (string id). Renderer (next step)
 * reads resolveBlockVariant() — no duplicate DNA elsewhere.
 */

import type { LandingPageBlockType, LandingPageTheme } from './landing-page-types';
import type { LandingPageLayout } from './landing-page-ui';
import type { LandingPageTemplateFlowId } from './landing-page-template-flows';

/* -------------------------------------------------------------------------- */
/* Design family & conversion goal                                            */
/* -------------------------------------------------------------------------- */

export const LANDING_PAGE_DESIGN_FAMILIES = [
  'editorial',
  'minimal',
  'luxury',
  'bold',
  'organic',
  'corporate',
  'conversion',
  'portfolio',
  'local',
  'product',
] as const;
export type LandingPageDesignFamily = (typeof LANDING_PAGE_DESIGN_FAMILIES)[number];

export const LANDING_PAGE_CONVERSION_GOALS = [
  'lead',
  'booking',
  'purchase',
  'signup',
  'download',
  'contact',
] as const;
export type LandingPageConversionGoal = (typeof LANDING_PAGE_CONVERSION_GOALS)[number];

const DESIGN_FAMILY_SET = new Set<string>(LANDING_PAGE_DESIGN_FAMILIES);
const CONVERSION_GOAL_SET = new Set<string>(LANDING_PAGE_CONVERSION_GOALS);

export function isLandingPageDesignFamily(v: unknown): v is LandingPageDesignFamily {
  return typeof v === 'string' && DESIGN_FAMILY_SET.has(v);
}

export function isLandingPageConversionGoal(v: unknown): v is LandingPageConversionGoal {
  return typeof v === 'string' && CONVERSION_GOAL_SET.has(v);
}

export function resolveDesignFamily(raw: unknown): LandingPageDesignFamily {
  return isLandingPageDesignFamily(raw) ? raw : 'conversion';
}

export function resolveConversionGoal(raw: unknown): LandingPageConversionGoal {
  return isLandingPageConversionGoal(raw) ? raw : 'lead';
}

/* -------------------------------------------------------------------------- */
/* Block variant registries (type-safe)                                       */
/* -------------------------------------------------------------------------- */

export const LANDING_PAGE_HERO_VARIANTS = [
  'default',
  'centered',
  'split-left',
  'split-right',
  'editorial-overlay',
  'fullscreen-image',
  'minimal-copy',
  'floating-card',
] as const;
export type LandingPageHeroVariant = (typeof LANDING_PAGE_HERO_VARIANTS)[number];

export const LANDING_PAGE_CTA_VARIANTS = [
  'default',
  'centered',
  'split',
  'banner',
  'minimal',
  'image-background',
  'floating-card',
] as const;
export type LandingPageCtaVariant = (typeof LANDING_PAGE_CTA_VARIANTS)[number];

export const LANDING_PAGE_LEAD_FORM_VARIANTS = [
  'default',
  'compact',
  'split',
  'card',
  'inline',
  'booking',
  'minimal',
  'floating-card',
] as const;
export type LandingPageLeadFormVariant = (typeof LANDING_PAGE_LEAD_FORM_VARIANTS)[number];

export const LANDING_PAGE_PRICING_VARIANTS = [
  'default',
  'cards',
  'comparison',
  'minimal',
] as const;
export type LandingPagePricingVariant = (typeof LANDING_PAGE_PRICING_VARIANTS)[number];

/** Features / Benefits / Product / Speaker list compositions. */
export const LANDING_PAGE_FEATURES_VARIANTS = [
  'default',
  'icon-grid',
  'image-cards',
  'alternating',
  'editorial-list',
  'numbered',
  'minimal-list',
  // legacy aliases kept in allow-list for old stamped specs
  'grid',
  'list',
  'icons',
] as const;
export type LandingPageFeaturesVariant = (typeof LANDING_PAGE_FEATURES_VARIANTS)[number];

export const LANDING_PAGE_TESTIMONIALS_VARIANTS = [
  'default',
  'quote-centered',
  'cards',
  'editorial',
  'portrait-quotes',
  'metric-plus-quote',
  // legacy
  'quote',
  'logo-wall',
] as const;
export type LandingPageTestimonialsVariant = (typeof LANDING_PAGE_TESTIMONIALS_VARIANTS)[number];

export const LANDING_PAGE_GALLERY_VARIANTS = [
  'default',
  'grid',
  'masonry',
  'editorial-mosaic',
  'featured-plus-grid',
  // legacy
  'carousel',
] as const;
export type LandingPageGalleryVariant = (typeof LANDING_PAGE_GALLERY_VARIANTS)[number];

export const LANDING_PAGE_FAQ_VARIANTS = [
  'default',
  'accordion',
  'two-column',
] as const;
export type LandingPageFaqVariant = (typeof LANDING_PAGE_FAQ_VARIANTS)[number];

export const LANDING_PAGE_HEADER_VARIANTS = [
  'default',
  'minimal',
  'centered',
] as const;
export type LandingPageHeaderVariant = (typeof LANDING_PAGE_HEADER_VARIANTS)[number];

export const LANDING_PAGE_FOOTER_VARIANTS = [
  'default',
  'minimal',
  'columns',
] as const;
export type LandingPageFooterVariant = (typeof LANDING_PAGE_FOOTER_VARIANTS)[number];

export const LANDING_PAGE_PROCESS_VARIANTS = [
  'default',
  'timeline',
  'steps',
] as const;
export type LandingPageProcessVariant = (typeof LANDING_PAGE_PROCESS_VARIANTS)[number];

export const LANDING_PAGE_VIDEO_VARIANTS = [
  'default',
  'widescreen',
  'sidebar',
] as const;
export type LandingPageVideoVariant = (typeof LANDING_PAGE_VIDEO_VARIANTS)[number];

/** Per-block-type allowed variant ids. Missing type → only `default`. */
export const LANDING_PAGE_BLOCK_VARIANTS = {
  Header: LANDING_PAGE_HEADER_VARIANTS,
  Hero: LANDING_PAGE_HERO_VARIANTS,
  Benefits: LANDING_PAGE_FEATURES_VARIANTS,
  Features: LANDING_PAGE_FEATURES_VARIANTS,
  Product: LANDING_PAGE_FEATURES_VARIANTS,
  Pricing: LANDING_PAGE_PRICING_VARIANTS,
  Testimonials: LANDING_PAGE_TESTIMONIALS_VARIANTS,
  Gallery: LANDING_PAGE_GALLERY_VARIANTS,
  Video: LANDING_PAGE_VIDEO_VARIANTS,
  Process: LANDING_PAGE_PROCESS_VARIANTS,
  Speaker: LANDING_PAGE_FEATURES_VARIANTS,
  Guarantee: ['default', 'banner', 'minimal'] as const,
  FAQ: LANDING_PAGE_FAQ_VARIANTS,
  LeadForm: LANDING_PAGE_LEAD_FORM_VARIANTS,
  CTA: LANDING_PAGE_CTA_VARIANTS,
  Footer: LANDING_PAGE_FOOTER_VARIANTS,
  Countdown: [
    'default',
    'boxes',
    'inline',
    'minimal',
    'amethyst-flip',
    'champagne-editorial',
    'cyan-grid',
    'emerald-halo',
    'copper-ember',
    'rose-glass',
    'silver-minimal',
    'cobalt-orbit',
    'lime-terminal',
    'opal-ribbon',
  ] as const,
} as const satisfies Record<LandingPageBlockType, readonly string[]>;

export type LandingPageBlockVariantMap = {
  [K in LandingPageBlockType]: (typeof LANDING_PAGE_BLOCK_VARIANTS)[K][number];
};

export type LandingPageBlockVariantId = LandingPageBlockVariantMap[LandingPageBlockType];

/**
 * Resolve a block variant id. Unknown / missing → `default`.
 * Accepts legacy architecture hero tokens and old catalog aliases.
 */
export function resolveBlockVariant(
  type: LandingPageBlockType,
  raw: unknown,
): LandingPageBlockVariantMap[LandingPageBlockType] {
  const allowed = LANDING_PAGE_BLOCK_VARIANTS[type] as readonly string[];
  const alias = typeof raw === 'string' ? aliasBlockVariant(type, raw) : raw;
  if (typeof alias === 'string' && allowed.includes(alias)) {
    return alias as LandingPageBlockVariantMap[LandingPageBlockType];
  }
  if (type === 'Hero' && typeof raw === 'string') {
    const mapped = mapLegacyHeroVariant(raw);
    if (allowed.includes(mapped)) return mapped;
  }
  if (type === 'Countdown' && typeof raw === 'string') {
    if (allowed.includes(raw)) return raw as LandingPageBlockVariantMap['Countdown'];
  }
  return 'default';
}

/** Map deprecated catalog / recipe aliases → current visual variant ids. */
export function aliasBlockVariant(type: LandingPageBlockType, raw: string): string {
  if (type === 'Features' || type === 'Benefits' || type === 'Product' || type === 'Speaker') {
    if (raw === 'grid' || raw === 'icons') return 'icon-grid';
    if (raw === 'list') return 'editorial-list';
  }
  if (type === 'Testimonials') {
    if (raw === 'quote') return 'quote-centered';
    if (raw === 'logo-wall') return 'metric-plus-quote';
  }
  if (type === 'Gallery' && raw === 'carousel') return 'grid';
  return raw;
}

/** Canonical visual id after aliasing (for renderer data-attrs / CSS). */
export function canonicalBlockVariant(
  type: LandingPageBlockType,
  raw: unknown,
): string {
  const resolved = resolveBlockVariant(type, raw);
  return aliasBlockVariant(type, resolved);
}

/** Legacy architecture `heroVariant` → foundation Hero variant. */
export type LegacyArchitectureHeroVariant =
  | 'split'
  | 'centered'
  | 'form_embed'
  | 'visual_first'
  | 'minimal'
  | 'portrait'
  | 'countdown'
  | 'editorial-overlay'
  | 'fullscreen-image'
  | 'split-left'
  | 'split-right'
  | 'minimal-copy'
  | 'floating-card';

export function mapLegacyHeroVariant(raw: string): LandingPageHeroVariant {
  switch (raw) {
    case 'centered':
      return 'centered';
    case 'split':
      return 'split-left';
    case 'portrait':
      return 'split-right';
    case 'visual_first':
      return 'fullscreen-image';
    case 'minimal':
      return 'minimal-copy';
    case 'form_embed':
      return 'floating-card';
    case 'countdown':
      return 'centered';
    case 'editorial-overlay':
    case 'fullscreen-image':
    case 'minimal-copy':
    case 'floating-card':
    case 'split-left':
    case 'split-right':
    case 'default':
      return raw as LandingPageHeroVariant;
    default:
      return 'default';
  }
}

/* -------------------------------------------------------------------------- */
/* Architecture recipe (canonical DNA snapshot)                               */
/* -------------------------------------------------------------------------- */

export type ArchitectureFlowStep = {
  block: LandingPageBlockType;
  purpose: string;
  variant?: string;
};

/**
 * Canonical architecture recipe. Catalog expand writes this into `spec.meta.architectureRecipe`.
 * CategoryArchitectureVariant remains the authoring surface; recipe is the stamped SoT on specs.
 */
export type LandingPageArchitectureRecipe = {
  architectureId: string;
  designFamily: LandingPageDesignFamily;
  conversionGoal: LandingPageConversionGoal;
  /** High-level flow id (gallery suffix / template-flow id). */
  flow: string;
  /** Ordered section purposes (derived from sectionSequence + blockVariants). */
  flowSteps: ArchitectureFlowStep[];
  /** Flat block → variant map (defaults omitted as `default`). */
  blockVariants: Partial<Record<LandingPageBlockType, string>>;
  /** Human purpose of this architecture. */
  purpose: string;
  /** Legacy / structural fields kept for gates & AI select. */
  sectionSequence: LandingPageBlockType[];
  heroVariant: string;
  ctaStrategy: string;
  formPlacement: string;
  proofType: string;
  visualComposition: string;
  theme?: LandingPageTheme;
  layout?: LandingPageLayout;
};

export type ArchitectureRecipeInput = {
  architectureId: string;
  purpose: string;
  designFamily?: LandingPageDesignFamily | string;
  conversionGoal?: LandingPageConversionGoal | string;
  flow?: string;
  sectionSequence: LandingPageBlockType[];
  /** Preferred: explicit per-block variants. */
  blockVariants?: Partial<Record<LandingPageBlockType, string>>;
  /** Legacy hero token — mapped when blockVariants.Hero missing. */
  heroVariant?: string;
  ctaStrategy?: string;
  formPlacement?: string;
  proofType?: string;
  visualComposition?: string;
  theme?: LandingPageTheme;
  layout?: LandingPageLayout;
};

const SECTION_PURPOSE: Partial<Record<LandingPageBlockType, string>> = {
  Header: 'nav_trust',
  Hero: 'hook_offer',
  Benefits: 'value_props',
  Features: 'capability',
  Product: 'offer_detail',
  Pricing: 'commercial',
  Testimonials: 'social_proof',
  Gallery: 'visual_proof',
  Video: 'demo_story',
  Process: 'how_it_works',
  Speaker: 'authority',
  Guarantee: 'risk_reversal',
  FAQ: 'objection_handling',
  LeadForm: 'capture',
  CTA: 'conversion_push',
  Footer: 'close',
  Countdown: 'urgency',
};

export function mapCtaStrategyToConversionGoal(
  ctaStrategy: string | undefined,
): LandingPageConversionGoal {
  switch (ctaStrategy) {
    case 'booking':
    case 'reserve':
    case 'viewing':
      return 'booking';
    case 'buy':
      return 'purchase';
    case 'trial':
    case 'enroll':
    case 'register':
    case 'demo':
      return 'signup';
    case 'download':
      return 'download';
    case 'quote':
    case 'consult':
      return 'contact';
    case 'audit':
    default:
      return 'lead';
  }
}

export function inferDesignFamily(input: {
  theme?: LandingPageTheme;
  layout?: LandingPageLayout | string;
  visualComposition?: string;
  category?: string;
}): LandingPageDesignFamily {
  const { theme, layout, visualComposition, category } = input;
  if (visualComposition === 'gallery_heavy' || visualComposition === 'portrait_speaker') {
    return 'portfolio';
  }
  if (visualComposition === 'product_grid') return 'product';
  if (visualComposition === 'map_local') return 'local';
  if (visualComposition === 'pricing_forward' || visualComposition === 'header_nav') {
    return 'conversion';
  }
  if (category === 'spa' || category === 'cosmetics' || category === 'restaurant') {
    return theme === 'PREMIUM' ? 'luxury' : 'organic';
  }
  if (category === 'agency' || category === 'website') return 'portfolio';
  if (category === 'clinic' || category === 'service' || category === 'real_estate') {
    return 'local';
  }
  if (category === 'product' || category === 'fashion') return 'product';
  if (layout === 'webinar' || layout === 'lead_gen') return 'conversion';
  if (theme === 'MINIMAL') return 'minimal';
  if (theme === 'BOLD') return 'bold';
  if (theme === 'PREMIUM') return 'luxury';
  if (theme === 'CORPORATE') return 'corporate';
  if (visualComposition === 'minimal') return 'editorial';
  return 'conversion';
}

function defaultBlockVariantsForRecipe(input: ArchitectureRecipeInput): Partial<
  Record<LandingPageBlockType, string>
> {
  const out: Partial<Record<LandingPageBlockType, string>> = {
    ...(input.blockVariants || {}),
  };
  if (!out.Hero) {
    out.Hero = mapLegacyHeroVariant(input.heroVariant || 'default');
  } else {
    out.Hero = resolveBlockVariant('Hero', out.Hero);
  }
  if (!out.LeadForm) {
    const fp = input.formPlacement || '';
    out.LeadForm =
      fp === 'hero_adjacent' || fp === 'early_after_hero'
        ? 'compact'
        : fp === 'mid'
          ? 'card'
          : 'default';
  }
  if (!out.CTA) {
    out.CTA = input.visualComposition === 'minimal' ? 'minimal' : 'default';
  }
  if (!out.Header && input.sectionSequence.includes('Header')) {
    out.Header = 'default';
  }
  if (!out.Pricing && input.sectionSequence.includes('Pricing')) {
    out.Pricing = input.visualComposition === 'pricing_forward' ? 'cards' : 'default';
  }
  if (!out.Gallery && input.sectionSequence.includes('Gallery')) {
    out.Gallery = input.visualComposition === 'gallery_heavy' ? 'grid' : 'default';
  }
  // Normalize every entry through resolveBlockVariant
  for (const [k, v] of Object.entries(out)) {
    const type = k as LandingPageBlockType;
    if (type in LANDING_PAGE_BLOCK_VARIANTS) {
      out[type] = resolveBlockVariant(type, v);
    }
  }
  return out;
}

/** Build canonical recipe from architecture authoring fields (single SoT stamp). */
export function buildArchitectureRecipe(input: ArchitectureRecipeInput): LandingPageArchitectureRecipe {
  const designFamily = resolveDesignFamily(
    input.designFamily ||
      inferDesignFamily({
        theme: input.theme,
        layout: input.layout,
        visualComposition: input.visualComposition,
      }),
  );
  const conversionGoal = resolveConversionGoal(
    input.conversionGoal || mapCtaStrategyToConversionGoal(input.ctaStrategy),
  );
  const blockVariants = defaultBlockVariantsForRecipe(input);
  const flowSteps: ArchitectureFlowStep[] = input.sectionSequence.map((block) => ({
    block,
    purpose: SECTION_PURPOSE[block] || block.toLowerCase(),
    variant: blockVariants[block] || 'default',
  }));

  return {
    architectureId: input.architectureId,
    designFamily,
    conversionGoal,
    flow: input.flow || 'primary',
    flowSteps,
    blockVariants,
    purpose: input.purpose || input.architectureId,
    sectionSequence: [...input.sectionSequence],
    heroVariant: String(blockVariants.Hero || mapLegacyHeroVariant(input.heroVariant || 'default')),
    ctaStrategy: input.ctaStrategy || 'consult',
    formPlacement: input.formPlacement || 'late',
    proofType: input.proofType || 'none',
    visualComposition: input.visualComposition || 'minimal',
    ...(input.theme ? { theme: input.theme } : {}),
    ...(input.layout ? { layout: input.layout } : {}),
  };
}

/** Sanitize unknown recipe (old DB specs / partial meta) → full recipe or undefined. */
export function sanitizeArchitectureRecipe(raw: unknown): LandingPageArchitectureRecipe | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const architectureId =
    typeof r.architectureId === 'string'
      ? r.architectureId.slice(0, 80)
      : typeof r.id === 'string'
        ? r.id.slice(0, 80)
        : '';
  if (!architectureId) return undefined;

  const sectionSequence = Array.isArray(r.sectionSequence)
    ? (r.sectionSequence.filter(
        (s): s is LandingPageBlockType =>
          typeof s === 'string' && s in LANDING_PAGE_BLOCK_VARIANTS,
      ) as LandingPageBlockType[])
    : [];

  const blockVariantsIn =
    r.blockVariants && typeof r.blockVariants === 'object'
      ? (r.blockVariants as Record<string, unknown>)
      : {};

  return buildArchitectureRecipe({
    architectureId,
    purpose: typeof r.purpose === 'string' ? r.purpose.slice(0, 280) : architectureId,
    designFamily: typeof r.designFamily === 'string' ? r.designFamily : undefined,
    conversionGoal: typeof r.conversionGoal === 'string' ? r.conversionGoal : undefined,
    flow: typeof r.flow === 'string' ? r.flow.slice(0, 40) : undefined,
    sectionSequence:
      sectionSequence.length > 0
        ? sectionSequence
        : (['Hero', 'LeadForm', 'Footer'] as LandingPageBlockType[]),
    blockVariants: Object.fromEntries(
      Object.entries(blockVariantsIn)
        .filter(([k]) => k in LANDING_PAGE_BLOCK_VARIANTS)
        .map(([k, v]) => [k, typeof v === 'string' ? v : 'default']),
    ) as Partial<Record<LandingPageBlockType, string>>,
    heroVariant: typeof r.heroVariant === 'string' ? r.heroVariant : undefined,
    ctaStrategy: typeof r.ctaStrategy === 'string' ? r.ctaStrategy : undefined,
    formPlacement: typeof r.formPlacement === 'string' ? r.formPlacement : undefined,
    proofType: typeof r.proofType === 'string' ? r.proofType : undefined,
    visualComposition: typeof r.visualComposition === 'string' ? r.visualComposition : undefined,
    theme: typeof r.theme === 'string' ? (r.theme as LandingPageTheme) : undefined,
    layout: typeof r.layout === 'string' ? (r.layout as LandingPageLayout) : undefined,
  });
}

/** Legacy gallery.architecture blob → recipe (when architectureRecipe missing). */
export function recipeFromLegacyGalleryArchitecture(
  arch: Record<string, unknown> | null | undefined,
  extras?: { flow?: string; purpose?: string },
): LandingPageArchitectureRecipe | undefined {
  if (!arch) return undefined;
  const id = typeof arch.id === 'string' ? arch.id : '';
  if (!id) return undefined;
  return sanitizeArchitectureRecipe({
    architectureId: id,
    purpose: extras?.purpose || id,
    flow: extras?.flow,
    heroVariant: arch.heroVariant,
    sectionSequence: arch.sectionSequence,
    ctaStrategy: arch.ctaStrategy,
    formPlacement: arch.formPlacement,
    proofType: arch.proofType,
    visualComposition: arch.visualComposition,
  });
}

/** Map flow slug suffix → template flow id when possible. */
export function flowIdFromSlugSuffix(suffix: string): LandingPageTemplateFlowId | string {
  const map: Record<string, LandingPageTemplateFlowId> = {
    '': 'full_conversion',
    trust: 'trust_usp_first',
    pricing: 'pricing_forward',
    process: 'process_story',
    gallery: 'gallery_showcase',
    video: 'video_lead',
    faq: 'faq_authority',
    split: 'header_split',
    form: 'early_form',
    minimal: 'minimal_cta',
  };
  return map[suffix] || suffix || 'full_conversion';
}

/**
 * Architecture fingerprint for differentiation gates:
 * designFamily + conversionGoal + heroVariant + ordered block types + ordered block variants.
 */
export function architectureFingerprint(input: {
  designFamily?: string | null;
  conversionGoal?: string | null;
  heroVariant?: string | null;
  sectionSequence?: readonly string[] | null;
  blockVariants?: Partial<Record<string, string>> | null;
}): string {
  const seq = Array.isArray(input.sectionSequence) ? input.sectionSequence : [];
  const variants = input.blockVariants || {};
  const orderedVariants = seq
    .map((t) => resolveBlockVariant(t as LandingPageBlockType, variants[t]))
    .join(',');
  const hero =
    (typeof variants.Hero === 'string' && variants.Hero) ||
    (typeof input.heroVariant === 'string' ? mapLegacyHeroVariant(input.heroVariant) : 'default');
  return [
    resolveDesignFamily(input.designFamily),
    resolveConversionGoal(input.conversionGoal),
    resolveBlockVariant('Hero', hero),
    seq.join('>'),
    orderedVariants,
  ].join('|');
}
