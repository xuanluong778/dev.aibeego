/**
 * SEO premium registry — 3 gold benchmarks + 7 direction presets.
 * Organic growth agency; audit / lead / consult conversion.
 */

export const SEO_GOLD_STANDARDS = ['audit-kpi', 'problem-first', 'pricing-packages'] as const;

export type SeoGoldStandard = (typeof SEO_GOLD_STANDARDS)[number];

export const SEO_DIRECTION_STANDARDS = [
  'process-roadmap',
  'portfolio-gallery',
  'video-audit',
  'faq-authority',
  'split-nav',
  'early-audit-form',
  'minimal-cta',
] as const;

export type SeoDirectionStandard = (typeof SEO_DIRECTION_STANDARDS)[number];

export const SEO_PREMIUM_STANDARDS = [
  ...SEO_GOLD_STANDARDS,
  ...SEO_DIRECTION_STANDARDS,
] as const;

export type SeoPremiumStandard = (typeof SEO_PREMIUM_STANDARDS)[number];

export const SEO_GOLD_ARCHITECTURE_IDS: Record<SeoGoldStandard, string> = {
  'audit-kpi': 'seo_audit_kpi',
  'problem-first': 'seo_problem_first',
  'pricing-packages': 'seo_pricing_packages',
};

export const SEO_DIRECTION_ARCHITECTURE_IDS: Record<SeoDirectionStandard, string> = {
  'process-roadmap': 'seo_process_roadmap',
  'portfolio-gallery': 'seo_portfolio_gallery',
  'video-audit': 'seo_video_audit',
  'faq-authority': 'seo_faq_authority',
  'split-nav': 'seo_split_nav',
  'early-audit-form': 'seo_early_audit_form',
  'minimal-cta': 'seo_minimal_cta',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(SEO_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, SeoGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(SEO_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, SeoDirectionStandard>;

export function resolveSeoGoldStandard(
  architectureId: string | undefined,
): SeoGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveSeoDirectionStandard(
  architectureId: string | undefined,
): SeoDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveSeoPremiumStandard(
  architectureId: string | undefined,
): SeoPremiumStandard | undefined {
  return resolveSeoGoldStandard(architectureId) || resolveSeoDirectionStandard(architectureId);
}

export function isSeoGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSeoGoldStandard(architectureId));
}

export function isSeoDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSeoDirectionStandard(architectureId));
}

export function isSeoPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSeoPremiumStandard(architectureId));
}

export const SEO_GOLD_BLOCK_VARIANTS: Record<
  SeoGoldStandard,
  Partial<Record<string, string>>
> = {
  'audit-kpi': {
    Hero: 'centered',
    Features: 'numbered',
    Testimonials: 'metric-plus-quote',
    Benefits: 'icon-grid',
    Process: 'steps',
    CTA: 'banner',
    LeadForm: 'card',
    Footer: 'default',
  },
  'problem-first': {
    Header: 'default',
    Hero: 'split-left',
    Features: 'numbered',
    Benefits: 'icon-grid',
    Testimonials: 'metric-plus-quote',
    Guarantee: 'banner',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
  'pricing-packages': {
    Hero: 'centered',
    Pricing: 'comparison',
    Features: 'icon-grid',
    FAQ: 'two-column',
    Benefits: 'editorial-list',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const SEO_DIRECTION_BLOCK_VARIANTS: Record<
  SeoDirectionStandard,
  Partial<Record<string, string>>
> = {
  'process-roadmap': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Features: 'alternating',
    Benefits: 'icon-grid',
    Testimonials: 'cards',
    LeadForm: 'card',
    Footer: 'default',
  },
  'portfolio-gallery': {
    Hero: 'editorial-overlay',
    Gallery: 'editorial-mosaic',
    Testimonials: 'editorial',
    Features: 'numbered',
    CTA: 'banner',
    LeadForm: 'split',
    Footer: 'columns',
  },
  'video-audit': {
    Hero: 'centered',
    Video: 'default',
    Benefits: 'editorial-list',
    Process: 'steps',
    LeadForm: 'card',
    FAQ: 'accordion',
    Footer: 'default',
  },
  'faq-authority': {
    Hero: 'centered',
    Benefits: 'icon-grid',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Features: 'numbered',
    LeadForm: 'card',
    Footer: 'default',
  },
  'split-nav': {
    Header: 'default',
    Hero: 'split-left',
    Benefits: 'alternating',
    Process: 'steps',
    Pricing: 'comparison',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-audit-form': {
    Hero: 'floating-card',
    LeadForm: 'inline',
    Features: 'icon-grid',
    Testimonials: 'metric-plus-quote',
    Benefits: 'editorial-list',
    CTA: 'banner',
    Footer: 'default',
  },
  'minimal-cta': {
    Hero: 'minimal-copy',
    Benefits: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type SeoSectionTone = 'organic' | 'data' | 'authority' | 'surface' | 'accent' | 'canvas';

function seoGoldSectionToneInner(
  gold: SeoGoldStandard,
  blockType: string,
  index: number,
): SeoSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'audit-kpi':
      if (blockType === 'Hero') return 'data';
      if (blockType === 'Testimonials' || blockType === 'Process') return 'organic';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Features') return even ? 'surface' : 'data';
      return even ? 'canvas' : 'surface';
    case 'problem-first':
      if (blockType === 'Header' || blockType === 'Hero') return 'authority';
      if (blockType === 'Features' || blockType === 'Benefits') return even ? 'organic' : 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Testimonials') return 'data';
      return even ? 'canvas' : 'surface';
    case 'pricing-packages':
      if (blockType === 'Hero') return 'organic';
      if (blockType === 'Pricing') return 'data';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function seoDirectionSectionToneInner(
  dir: SeoDirectionStandard,
  blockType: string,
  index: number,
): SeoSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'process-roadmap':
      if (blockType === 'Process') return 'data';
      if (blockType === 'Hero') return 'organic';
      if (blockType === 'LeadForm') return 'accent';
      if (blockType === 'Testimonials') return 'surface';
      return even ? 'canvas' : 'surface';
    case 'portfolio-gallery':
      if (blockType === 'Gallery' && index <= 1) return 'authority';
      if (blockType === 'Hero') return 'organic';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Testimonials') return 'data';
      return even ? 'canvas' : 'surface';
    case 'video-audit':
      if (blockType === 'Hero' || blockType === 'Video') return 'authority';
      if (blockType === 'Process') return 'data';
      if (blockType === 'LeadForm') return 'accent';
      if (blockType === 'Benefits') return 'organic';
      return even ? 'canvas' : 'surface';
    case 'faq-authority':
      if (blockType === 'Hero') return 'authority';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Benefits') return 'organic';
      return even ? 'data' : 'canvas';
    case 'split-nav':
      if (blockType === 'Header') return 'surface';
      if (blockType === 'Hero') return 'organic';
      if (blockType === 'Pricing') return 'data';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-audit-form':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Testimonials') return 'data';
      if (blockType === 'Features') return 'organic';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'minimal-cta':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'organic';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

/** Alternating section rhythm per SEO premium standard. */
export function seoGoldSectionTone(
  gold: SeoPremiumStandard,
  blockType: string,
  index: number,
): SeoSectionTone {
  if ((SEO_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return seoGoldSectionToneInner(gold as SeoGoldStandard, blockType, index);
  }
  return seoDirectionSectionToneInner(gold as SeoDirectionStandard, blockType, index);
}

export function seoPremiumSectionTone(
  architectureId: string | undefined,
  blockType: string,
  index: number,
): SeoSectionTone {
  const std = resolveSeoPremiumStandard(architectureId);
  if (!std) return 'canvas';
  return seoGoldSectionTone(std, blockType, index);
}

export function seoGoldSectionBackground(tone: SeoSectionTone): string | null {
  switch (tone) {
    case 'organic':
      return 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 42%, #F0FDF4 100%)';
    case 'data':
      return 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 48%, #F8FAFC 100%)';
    case 'authority':
      return 'linear-gradient(165deg, #0F172A 0%, #1E293B 48%, #0B1220 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #065F46) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
