/**
 * Fashion premium registry — 3 gold benchmarks + 7 direction presets.
 * Limited drops / lookbook editorial; buy-first conversion.
 */

export const FASHION_GOLD_STANDARDS = ['drop-buy', 'trust-fit', 'price-drop'] as const;

export type FashionGoldStandard = (typeof FASHION_GOLD_STANDARDS)[number];

export const FASHION_DIRECTION_STANDARDS = [
  'style-guide',
  'lookbook',
  'runway-video',
  'faq-size',
  'nav-collection',
  'early-preorder',
  'minimal-drop',
] as const;

export type FashionDirectionStandard = (typeof FASHION_DIRECTION_STANDARDS)[number];

export const FASHION_PREMIUM_STANDARDS = [
  ...FASHION_GOLD_STANDARDS,
  ...FASHION_DIRECTION_STANDARDS,
] as const;

export type FashionPremiumStandard = (typeof FASHION_PREMIUM_STANDARDS)[number];

export const FASHION_GOLD_ARCHITECTURE_IDS: Record<FashionGoldStandard, string> = {
  'drop-buy': 'fashion_drop_buy',
  'trust-fit': 'fashion_trust_fit',
  'price-drop': 'fashion_price_drop',
};

export const FASHION_DIRECTION_ARCHITECTURE_IDS: Record<FashionDirectionStandard, string> = {
  'style-guide': 'fashion_style_guide',
  lookbook: 'fashion_lookbook',
  'runway-video': 'fashion_runway_video',
  'faq-size': 'fashion_faq_size',
  'nav-collection': 'fashion_nav_collection',
  'early-preorder': 'fashion_early_preorder',
  'minimal-drop': 'fashion_minimal_drop',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(FASHION_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, FashionGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(FASHION_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, FashionDirectionStandard>;

export function resolveFashionGoldStandard(
  architectureId: string | undefined,
): FashionGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveFashionDirectionStandard(
  architectureId: string | undefined,
): FashionDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveFashionPremiumStandard(
  architectureId: string | undefined,
): FashionPremiumStandard | undefined {
  return resolveFashionGoldStandard(architectureId) || resolveFashionDirectionStandard(architectureId);
}

export function isFashionGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveFashionGoldStandard(architectureId));
}

export function isFashionDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveFashionDirectionStandard(architectureId));
}

export function isFashionPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveFashionPremiumStandard(architectureId));
}

export const FASHION_GOLD_BLOCK_VARIANTS: Record<
  FashionGoldStandard,
  Partial<Record<string, string>>
> = {
  'drop-buy': {
    Gallery: 'editorial-mosaic',
    Product: 'default',
    Benefits: 'editorial-list',
    Pricing: 'cards',
    CTA: 'banner',
    LeadForm: 'card',
    Footer: 'default',
  },
  'trust-fit': {
    Hero: 'centered',
    Testimonials: 'portrait-quotes',
    Features: 'icon-grid',
    Guarantee: 'banner',
    Gallery: 'editorial-mosaic',
    LeadForm: 'card',
    Footer: 'default',
  },
  'price-drop': {
    Hero: 'centered',
    Pricing: 'comparison',
    Gallery: 'masonry',
    FAQ: 'two-column',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const FASHION_DIRECTION_BLOCK_VARIANTS: Record<
  FashionDirectionStandard,
  Partial<Record<string, string>>
> = {
  'style-guide': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Product: 'default',
    Benefits: 'editorial-list',
    Gallery: 'editorial-mosaic',
    LeadForm: 'card',
    Footer: 'default',
  },
  lookbook: {
    Gallery: 'editorial-mosaic',
    Hero: 'editorial-overlay',
    Product: 'default',
    Testimonials: 'editorial',
    LeadForm: 'floating-card',
    Footer: 'columns',
  },
  'runway-video': {
    Hero: 'editorial-overlay',
    Video: 'default',
    Gallery: 'masonry',
    Pricing: 'cards',
    LeadForm: 'card',
    Footer: 'default',
  },
  'faq-size': {
    Hero: 'centered',
    Product: 'default',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Benefits: 'icon-grid',
    LeadForm: 'card',
    Footer: 'default',
  },
  'nav-collection': {
    Header: 'minimal',
    Hero: 'split-left',
    Gallery: 'editorial-mosaic',
    Features: 'alternating',
    Pricing: 'comparison',
    CTA: 'split',
    LeadForm: 'split',
    Footer: 'columns',
  },
  'early-preorder': {
    Hero: 'floating-card',
    LeadForm: 'inline',
    Gallery: 'editorial-mosaic',
    Product: 'default',
    Benefits: 'numbered',
    Footer: 'default',
  },
  'minimal-drop': {
    Hero: 'minimal-copy',
    Gallery: 'masonry',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type FashionSectionTone = 'editorial' | 'dark' | 'cream' | 'surface' | 'accent' | 'canvas';

function fashionGoldSectionToneInner(
  gold: FashionGoldStandard,
  blockType: string,
  index: number,
): FashionSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'drop-buy':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'Product') return 'cream';
      if (blockType === 'Pricing' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'editorial';
      return even ? 'canvas' : 'surface';
    case 'trust-fit':
      if (blockType === 'Hero') return 'editorial';
      if (blockType === 'Testimonials') return 'cream';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery') return 'dark';
      return even ? 'canvas' : 'surface';
    case 'price-drop':
      if (blockType === 'Hero') return 'dark';
      if (blockType === 'Pricing') return 'cream';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function fashionDirectionSectionToneInner(
  dir: FashionDirectionStandard,
  blockType: string,
  index: number,
): FashionSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'style-guide':
      if (blockType === 'Process') return 'cream';
      if (blockType === 'Product' || blockType === 'Gallery') return 'editorial';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'lookbook':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'Hero') return 'editorial';
      if (blockType === 'Product') return 'cream';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'runway-video':
      if (blockType === 'Hero' || blockType === 'Video') return 'dark';
      if (blockType === 'Gallery') return 'editorial';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'cream' : 'surface';
    case 'faq-size':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Product') return 'editorial';
      return even ? 'canvas' : 'surface';
    case 'nav-collection':
      if (blockType === 'Header') return 'surface';
      if (blockType === 'Gallery') return 'dark';
      if (blockType === 'Pricing') return 'cream';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-preorder':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery') return 'dark';
      if (blockType === 'Product') return 'cream';
      return even ? 'canvas' : 'surface';
    case 'minimal-drop':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'editorial';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

export function fashionGoldSectionTone(
  gold: FashionPremiumStandard,
  blockType: string,
  index: number,
): FashionSectionTone {
  if ((FASHION_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return fashionGoldSectionToneInner(gold as FashionGoldStandard, blockType, index);
  }
  return fashionDirectionSectionToneInner(gold as FashionDirectionStandard, blockType, index);
}

export function fashionGoldSectionBackground(tone: FashionSectionTone): string | null {
  switch (tone) {
    case 'editorial':
      return 'linear-gradient(180deg, #F8F6F2 0%, #FAFAF8 55%, #FFFFFF 100%)';
    case 'dark':
      return 'linear-gradient(165deg, #0A0A0A 0%, #141414 48%, #0E0E0E 100%)';
    case 'cream':
      return 'linear-gradient(180deg, #F5F1E6 0%, #FAF7F0 55%, #F3EFE4 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #1A1A1A) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
