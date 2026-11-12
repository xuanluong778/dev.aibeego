/**
 * SaaS premium registry — 3 gold benchmarks + 7 direction presets.
 * Data-driven; renderer reads meta.goldStandard + stamped block backgrounds.
 */

export const SAAS_GOLD_STANDARDS = ['product-led', 'enterprise', 'ai-modern'] as const;

export type SaasGoldStandard = (typeof SAAS_GOLD_STANDARDS)[number];

export const SAAS_DIRECTION_STANDARDS = [
  'trust-first',
  'workflow-story',
  'ui-gallery',
  'faq-trial',
  'nav-product',
  'early-trial',
  'minimal-trial',
] as const;

export type SaasDirectionStandard = (typeof SAAS_DIRECTION_STANDARDS)[number];

export const SAAS_PREMIUM_STANDARDS = [
  ...SAAS_GOLD_STANDARDS,
  ...SAAS_DIRECTION_STANDARDS,
] as const;

export type SaasPremiumStandard = (typeof SAAS_PREMIUM_STANDARDS)[number];

export const SAAS_GOLD_ARCHITECTURE_IDS: Record<SaasGoldStandard, string> = {
  'product-led': 'saas_product_led',
  enterprise: 'saas_enterprise',
  'ai-modern': 'saas_ai_modern',
};

export const SAAS_DIRECTION_ARCHITECTURE_IDS: Record<SaasDirectionStandard, string> = {
  'trust-first': 'saas_trust_logos',
  'workflow-story': 'saas_workflow',
  'ui-gallery': 'saas_ui_gallery',
  'faq-trial': 'saas_faq_trial',
  'nav-product': 'saas_nav_product',
  'early-trial': 'saas_early_trial',
  'minimal-trial': 'saas_minimal_trial',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(SAAS_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, SaasGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(SAAS_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, SaasDirectionStandard>;

export function resolveSaasGoldStandard(
  architectureId: string | undefined,
): SaasGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveSaasDirectionStandard(
  architectureId: string | undefined,
): SaasDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveSaasPremiumStandard(
  architectureId: string | undefined,
): SaasPremiumStandard | undefined {
  return resolveSaasGoldStandard(architectureId) || resolveSaasDirectionStandard(architectureId);
}

export function isSaasGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSaasGoldStandard(architectureId));
}

export function isSaasDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSaasDirectionStandard(architectureId));
}

export function isSaasPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveSaasPremiumStandard(architectureId));
}

export type SaasGoldSectionTone = 'dark' | 'cream' | 'surface' | 'accent' | 'canvas' | 'glow';

export const SAAS_GOLD_BLOCK_VARIANTS: Record<
  SaasGoldStandard,
  Partial<Record<string, string>>
> = {
  'product-led': {
    Header: 'minimal',
    Hero: 'split-left',
    Gallery: 'masonry',
    Features: 'alternating',
    Process: 'steps',
    Testimonials: 'metric-plus-quote',
    Pricing: 'comparison',
    FAQ: 'two-column',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'columns',
  },
  enterprise: {
    Header: 'default',
    Hero: 'centered',
    Testimonials: 'metric-plus-quote',
    Features: 'numbered',
    Guarantee: 'banner',
    Process: 'timeline',
    Pricing: 'comparison',
    FAQ: 'accordion',
    LeadForm: 'card',
    CTA: 'split',
    Footer: 'default',
  },
  'ai-modern': {
    Header: 'minimal',
    Hero: 'editorial-overlay',
    Video: 'default',
    Features: 'icon-grid',
    Gallery: 'editorial-mosaic',
    Process: 'steps',
    Testimonials: 'editorial',
    Pricing: 'cards',
    FAQ: 'two-column',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'columns',
  },
};

export const SAAS_DIRECTION_BLOCK_VARIANTS: Record<
  SaasDirectionStandard,
  Partial<Record<string, string>>
> = {
  'trust-first': {
    Header: 'minimal',
    Hero: 'split-left',
    Testimonials: 'metric-plus-quote',
    Gallery: 'masonry',
    Features: 'icon-grid',
    Guarantee: 'banner',
    Pricing: 'cards',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'columns',
  },
  'workflow-story': {
    Header: 'minimal',
    Hero: 'minimal-copy',
    Process: 'timeline',
    Video: 'default',
    Features: 'alternating',
    Gallery: 'masonry',
    Testimonials: 'cards',
    LeadForm: 'card',
    CTA: 'split',
    Footer: 'default',
  },
  'ui-gallery': {
    Header: 'minimal',
    Gallery: 'editorial-mosaic',
    Hero: 'split-left',
    Features: 'icon-grid',
    Pricing: 'comparison',
    Testimonials: 'editorial',
    FAQ: 'two-column',
    LeadForm: 'inline',
    CTA: 'banner',
    Footer: 'columns',
  },
  'faq-trial': {
    Header: 'default',
    Hero: 'centered',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Features: 'numbered',
    Benefits: 'icon-grid',
    Pricing: 'cards',
    LeadForm: 'card',
    CTA: 'minimal',
    Footer: 'default',
  },
  'nav-product': {
    Header: 'default',
    Hero: 'split-left',
    Features: 'alternating',
    Process: 'steps',
    Gallery: 'masonry',
    Pricing: 'comparison',
    Testimonials: 'metric-plus-quote',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-trial': {
    Header: 'minimal',
    Hero: 'floating-card',
    LeadForm: 'inline',
    Video: 'default',
    Features: 'icon-grid',
    Benefits: 'editorial-list',
    Testimonials: 'cards',
    CTA: 'banner',
    Footer: 'default',
  },
  'minimal-trial': {
    Header: 'minimal',
    Hero: 'minimal-copy',
    Features: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

function saasGoldSectionToneInner(
  gold: SaasGoldStandard,
  blockType: string,
  index: number,
): SaasGoldSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'product-led':
      if (blockType === 'Header' || blockType === 'Hero') return 'surface';
      if (blockType === 'Gallery') return 'canvas';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Pricing') return 'surface';
      return even ? 'canvas' : 'surface';
    case 'enterprise':
      if (blockType === 'Hero' || blockType === 'Header') return 'cream';
      if (blockType === 'Guarantee' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'surface';
      if (blockType === 'Testimonials') return 'surface';
      return even ? 'cream' : 'surface';
    case 'ai-modern':
      if (blockType === 'Hero' || blockType === 'Header' || blockType === 'Video') return 'dark';
      if (blockType === 'Gallery' || blockType === 'Features') return even ? 'glow' : 'dark';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

function saasDirectionSectionToneInner(
  dir: SaasDirectionStandard,
  blockType: string,
  index: number,
): SaasGoldSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'trust-first':
      if (blockType === 'Hero' || blockType === 'Header') return 'cream';
      if (blockType === 'Testimonials') return 'surface';
      if (blockType === 'Gallery') return 'canvas';
      if (blockType === 'Guarantee' || blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'cream' : 'surface';
    case 'workflow-story':
      if (blockType === 'Video') return 'dark';
      if (blockType === 'Process') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'canvas' : 'surface';
    case 'ui-gallery':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'Hero') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Pricing') return 'surface';
      return even ? 'canvas' : 'surface';
    case 'faq-trial':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'surface';
      return even ? 'cream' : 'canvas';
    case 'nav-product':
      if (blockType === 'Header') return 'surface';
      if (blockType === 'Pricing') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-trial':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Video') return 'dark';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'minimal-trial':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

/** Alternating section rhythm per SaaS premium standard. */
export function saasGoldSectionTone(
  gold: SaasPremiumStandard,
  blockType: string,
  index: number,
): SaasGoldSectionTone {
  if ((SAAS_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return saasGoldSectionToneInner(gold as SaasGoldStandard, blockType, index);
  }
  return saasDirectionSectionToneInner(gold as SaasDirectionStandard, blockType, index);
}

export function saasPremiumSectionTone(
  architectureId: string | undefined,
  blockType: string,
  index: number,
): SaasGoldSectionTone {
  const std = resolveSaasPremiumStandard(architectureId);
  if (!std) return 'canvas';
  return saasGoldSectionTone(std, blockType, index);
}

export function saasGoldSectionBackground(tone: SaasGoldSectionTone): string | null {
  switch (tone) {
    case 'dark':
      return 'linear-gradient(165deg, #0B0F1A 0%, #121A2E 48%, #0A0E18 100%)';
    case 'glow':
      return 'linear-gradient(145deg, #1E1B4B 0%, #312E81 35%, #0F172A 100%)';
    case 'cream':
      return 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 55%, #F1F5F9 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #0F172A) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
