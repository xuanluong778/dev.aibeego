/**
 * Product premium registry — 3 gold benchmarks + 7 direction presets.
 * Ecommerce / physical SKU; buy-first conversion.
 */

export const PRODUCT_GOLD_STANDARDS = ['buy-path', 'trust-reviews', 'price-compare'] as const;

export type ProductGoldStandard = (typeof PRODUCT_GOLD_STANDARDS)[number];

export const PRODUCT_DIRECTION_STANDARDS = [
  'how-it-works',
  'lookbook',
  'demo-reel',
  'faq-buy',
  'nav-shop',
  'early-order',
  'minimal-buy',
] as const;

export type ProductDirectionStandard = (typeof PRODUCT_DIRECTION_STANDARDS)[number];

export const PRODUCT_PREMIUM_STANDARDS = [
  ...PRODUCT_GOLD_STANDARDS,
  ...PRODUCT_DIRECTION_STANDARDS,
] as const;

export type ProductPremiumStandard = (typeof PRODUCT_PREMIUM_STANDARDS)[number];

export const PRODUCT_GOLD_ARCHITECTURE_IDS: Record<ProductGoldStandard, string> = {
  'buy-path': 'product_buy_path',
  'trust-reviews': 'product_trust_reviews',
  'price-compare': 'product_price_compare',
};

export const PRODUCT_DIRECTION_ARCHITECTURE_IDS: Record<ProductDirectionStandard, string> = {
  'how-it-works': 'product_how_it_works',
  lookbook: 'product_lookbook',
  'demo-reel': 'product_demo_reel',
  'faq-buy': 'product_faq_buy',
  'nav-shop': 'product_nav_shop',
  'early-order': 'product_early_order',
  'minimal-buy': 'product_minimal_buy',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(PRODUCT_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ProductGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(PRODUCT_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ProductDirectionStandard>;

export function resolveProductGoldStandard(
  architectureId: string | undefined,
): ProductGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveProductDirectionStandard(
  architectureId: string | undefined,
): ProductDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveProductPremiumStandard(
  architectureId: string | undefined,
): ProductPremiumStandard | undefined {
  return resolveProductGoldStandard(architectureId) || resolveProductDirectionStandard(architectureId);
}

export function isProductGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveProductGoldStandard(architectureId));
}

export function isProductDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveProductDirectionStandard(architectureId));
}

export function isProductPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveProductPremiumStandard(architectureId));
}

export const PRODUCT_GOLD_BLOCK_VARIANTS: Record<
  ProductGoldStandard,
  Partial<Record<string, string>>
> = {
  'buy-path': {
    Gallery: 'featured-plus-grid',
    Benefits: 'icon-grid',
    Features: 'image-cards',
    Pricing: 'comparison',
    Testimonials: 'cards',
    LeadForm: 'inline',
    CTA: 'split',
    Footer: 'default',
  },
  'trust-reviews': {
    Header: 'default',
    Hero: 'centered',
    Testimonials: 'portrait-quotes',
    Benefits: 'editorial-list',
    Guarantee: 'banner',
    Features: 'numbered',
    LeadForm: 'card',
    Footer: 'default',
  },
  'price-compare': {
    Hero: 'centered',
    Pricing: 'comparison',
    Product: 'comparison',
    FAQ: 'two-column',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const PRODUCT_DIRECTION_BLOCK_VARIANTS: Record<
  ProductDirectionStandard,
  Partial<Record<string, string>>
> = {
  'how-it-works': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Benefits: 'icon-grid',
    Features: 'numbered',
    Gallery: 'masonry',
    LeadForm: 'card',
    Footer: 'default',
  },
  lookbook: {
    Gallery: 'editorial-mosaic',
    Hero: 'editorial-overlay',
    Product: 'featured-card',
    Benefits: 'editorial-list',
    CTA: 'image-background',
    LeadForm: 'inline',
    Footer: 'columns',
  },
  'demo-reel': {
    Hero: 'centered',
    Video: 'default',
    Features: 'alternating',
    Pricing: 'cards',
    LeadForm: 'floating-card',
    Testimonials: 'cards',
    Footer: 'default',
  },
  'faq-buy': {
    Hero: 'centered',
    Benefits: 'icon-grid',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Pricing: 'comparison',
    LeadForm: 'card',
    Footer: 'default',
  },
  'nav-shop': {
    Header: 'minimal',
    Hero: 'split-left',
    Gallery: 'featured-plus-grid',
    Features: 'image-cards',
    Pricing: 'comparison',
    CTA: 'split',
    LeadForm: 'split',
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
    Product: 'product-grid',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type ProductSectionTone = 'showcase' | 'dark' | 'cream' | 'accent' | 'canvas';

function productGoldSectionToneInner(
  gold: ProductGoldStandard,
  blockType: string,
  index: number,
): ProductSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'buy-path':
      if (blockType === 'Gallery') return 'showcase';
      if (blockType === 'Pricing') return 'cream';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Testimonials') return 'dark';
      return even ? 'canvas' : 'cream';
    case 'trust-reviews':
      if (blockType === 'Hero') return 'showcase';
      if (blockType === 'Testimonials') return 'cream';
      if (blockType === 'Guarantee') return 'accent';
      if (blockType === 'LeadForm') return 'dark';
      return even ? 'canvas' : 'cream';
    case 'price-compare':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'Pricing' || blockType === 'Product') return 'showcase';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'cream';
    default:
      return 'canvas';
  }
}

function productDirectionSectionToneInner(
  dir: ProductDirectionStandard,
  blockType: string,
  index: number,
): ProductSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'how-it-works':
      if (blockType === 'Process') return 'showcase';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'cream';
    case 'lookbook':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'Product') return 'showcase';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'cream';
    case 'demo-reel':
      if (blockType === 'Hero' || blockType === 'Video') return 'showcase';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'cream';
    case 'faq-buy':
      if (blockType === 'FAQ') return 'cream';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      return even ? 'showcase' : 'canvas';
    case 'nav-shop':
      if (blockType === 'Pricing') return 'showcase';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'cream';
    case 'early-order':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'showcase';
    case 'minimal-buy':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Product') return 'showcase';
      return even ? 'cream' : 'canvas';
    default:
      return 'canvas';
  }
}

export function productGoldSectionTone(
  gold: ProductPremiumStandard,
  blockType: string,
  index: number,
): ProductSectionTone {
  if ((PRODUCT_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return productGoldSectionToneInner(gold as ProductGoldStandard, blockType, index);
  }
  return productDirectionSectionToneInner(gold as ProductDirectionStandard, blockType, index);
}

export function productGoldSectionBackground(tone: ProductSectionTone): string | null {
  switch (tone) {
    case 'showcase':
      return 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 55%, #FFFFFF 100%)';
    case 'dark':
      return 'linear-gradient(165deg, #1C1917 0%, #292524 48%, #0C0A09 100%)';
    case 'cream':
      return 'linear-gradient(180deg, #FDF8F3 0%, #FAF5EF 55%, #F5EFE6 100%)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #92400E) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
