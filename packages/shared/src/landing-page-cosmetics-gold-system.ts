/**
 * Cosmetics premium registry — 3 gold benchmarks + 7 direction presets.
 * Skincare / makeup; buy-first conversion with routine & kit bundles.
 */

export const COSMETICS_GOLD_STANDARDS = ['buy-path', 'trust-skin', 'kit-pricing'] as const;

export type CosmeticsGoldStandard = (typeof COSMETICS_GOLD_STANDARDS)[number];

export const COSMETICS_DIRECTION_STANDARDS = [
  'routine',
  'lookbook',
  'tutorial',
  'faq-safe',
  'nav-shop',
  'early-order',
  'minimal-buy',
] as const;

export type CosmeticsDirectionStandard = (typeof COSMETICS_DIRECTION_STANDARDS)[number];

export const COSMETICS_PREMIUM_STANDARDS = [
  ...COSMETICS_GOLD_STANDARDS,
  ...COSMETICS_DIRECTION_STANDARDS,
] as const;

export type CosmeticsPremiumStandard = (typeof COSMETICS_PREMIUM_STANDARDS)[number];

export const COSMETICS_GOLD_ARCHITECTURE_IDS: Record<CosmeticsGoldStandard, string> = {
  'buy-path': 'cosmetics_buy_path',
  'trust-skin': 'cosmetics_trust_skin',
  'kit-pricing': 'cosmetics_kit_pricing',
};

export const COSMETICS_DIRECTION_ARCHITECTURE_IDS: Record<CosmeticsDirectionStandard, string> = {
  routine: 'cosmetics_routine',
  lookbook: 'cosmetics_lookbook',
  tutorial: 'cosmetics_tutorial',
  'faq-safe': 'cosmetics_faq_safe',
  'nav-shop': 'cosmetics_nav_shop',
  'early-order': 'cosmetics_early_order',
  'minimal-buy': 'cosmetics_minimal_buy',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(COSMETICS_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, CosmeticsGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(COSMETICS_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, CosmeticsDirectionStandard>;

export function resolveCosmeticsGoldStandard(
  architectureId: string | undefined,
): CosmeticsGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveCosmeticsDirectionStandard(
  architectureId: string | undefined,
): CosmeticsDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveCosmeticsPremiumStandard(
  architectureId: string | undefined,
): CosmeticsPremiumStandard | undefined {
  return (
    resolveCosmeticsGoldStandard(architectureId) ||
    resolveCosmeticsDirectionStandard(architectureId)
  );
}

export function isCosmeticsGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveCosmeticsGoldStandard(architectureId));
}

export function isCosmeticsDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveCosmeticsDirectionStandard(architectureId));
}

export function isCosmeticsPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveCosmeticsPremiumStandard(architectureId));
}

export const COSMETICS_GOLD_BLOCK_VARIANTS: Record<
  CosmeticsGoldStandard,
  Partial<Record<string, string>>
> = {
  'buy-path': {
    Gallery: 'editorial-mosaic',
    Benefits: 'icon-grid',
    Video: 'default',
    Pricing: 'cards',
    Testimonials: 'portrait-quotes',
    LeadForm: 'inline',
    Footer: 'default',
  },
  'trust-skin': {
    Header: 'default',
    Hero: 'centered',
    Features: 'editorial-list',
    Guarantee: 'banner',
    Testimonials: 'editorial',
    Benefits: 'icon-grid',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
  'kit-pricing': {
    Hero: 'centered',
    Pricing: 'comparison',
    Product: 'image-cards',
    FAQ: 'two-column',
    LeadForm: 'card',
    Footer: 'default',
  },
};

export const COSMETICS_DIRECTION_BLOCK_VARIANTS: Record<
  CosmeticsDirectionStandard,
  Partial<Record<string, string>>
> = {
  routine: {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Gallery: 'masonry',
    Benefits: 'icon-grid',
    Features: 'numbered',
    LeadForm: 'card',
    Footer: 'default',
  },
  lookbook: {
    Gallery: 'editorial-mosaic',
    Hero: 'editorial-overlay',
    Product: 'image-cards',
    Testimonials: 'portrait-quotes',
    CTA: 'image-background',
    LeadForm: 'inline',
    Footer: 'columns',
  },
  tutorial: {
    Hero: 'editorial-overlay',
    Video: 'default',
    Benefits: 'alternating',
    Pricing: 'cards',
    LeadForm: 'floating-card',
    FAQ: 'accordion',
    Footer: 'default',
  },
  'faq-safe': {
    Hero: 'centered',
    Benefits: 'icon-grid',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Gallery: 'masonry',
    LeadForm: 'compact',
    Footer: 'default',
  },
  'nav-shop': {
    Header: 'minimal',
    Hero: 'split-left',
    Gallery: 'editorial-mosaic',
    Features: 'image-cards',
    Pricing: 'cards',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-order': {
    Hero: 'floating-card',
    LeadForm: 'inline',
    Gallery: 'masonry',
    Benefits: 'numbered',
    Pricing: 'cards',
    Footer: 'default',
  },
  'minimal-buy': {
    Hero: 'minimal-copy',
    Benefits: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type CosmeticsSectionTone =
  | 'beauty'
  | 'clinical'
  | 'luxury'
  | 'glow'
  | 'surface'
  | 'accent'
  | 'canvas';

function cosmeticsGoldSectionToneInner(
  gold: CosmeticsGoldStandard,
  blockType: string,
  index: number,
): CosmeticsSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'buy-path':
      if (blockType === 'Gallery' && index <= 1) return 'glow';
      if (blockType === 'Video') return 'beauty';
      if (blockType === 'Pricing') return 'luxury';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'trust-skin':
      if (blockType === 'Hero') return 'clinical';
      if (blockType === 'Features' || blockType === 'Guarantee') return 'beauty';
      if (blockType === 'Testimonials') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'kit-pricing':
      if (blockType === 'Hero') return 'luxury';
      if (blockType === 'Pricing') return 'glow';
      if (blockType === 'Product') return 'beauty';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function cosmeticsDirectionSectionToneInner(
  dir: CosmeticsDirectionStandard,
  blockType: string,
  index: number,
): CosmeticsSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'routine':
      if (blockType === 'Process') return 'clinical';
      if (blockType === 'Gallery') return 'glow';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'lookbook':
      if (blockType === 'Gallery' && index <= 1) return 'luxury';
      if (blockType === 'Product') return 'beauty';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'tutorial':
      if (blockType === 'Hero' || blockType === 'Video') return 'beauty';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'faq-safe':
      if (blockType === 'FAQ') return 'clinical';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery') return 'glow';
      return even ? 'beauty' : 'canvas';
    case 'nav-shop':
      if (blockType === 'Pricing') return 'luxury';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Gallery') return 'glow';
      return even ? 'canvas' : 'surface';
    case 'early-order':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery') return 'glow';
      return even ? 'canvas' : 'surface';
    case 'minimal-buy':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

export function cosmeticsGoldSectionTone(
  gold: CosmeticsPremiumStandard,
  blockType: string,
  index: number,
): CosmeticsSectionTone {
  if ((COSMETICS_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return cosmeticsGoldSectionToneInner(gold as CosmeticsGoldStandard, blockType, index);
  }
  return cosmeticsDirectionSectionToneInner(gold as CosmeticsDirectionStandard, blockType, index);
}

export function cosmeticsGoldSectionBackground(tone: CosmeticsSectionTone): string | null {
  switch (tone) {
    case 'beauty':
      return 'linear-gradient(180deg, #FDF2F8 0%, #FCE7F3 55%, #FFFFFF 100%)';
    case 'clinical':
      return 'linear-gradient(180deg, #F0F9FF 0%, #F8FAFC 55%, #FFFFFF 100%)';
    case 'luxury':
      return 'linear-gradient(165deg, #1C1917 0%, #292524 48%, #0C0A09 100%)';
    case 'glow':
      return 'linear-gradient(120deg, #FFF7ED 0%, #FFEDD5 45%, #FEF3C7 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #BE185D) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
