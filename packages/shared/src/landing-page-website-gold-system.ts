/**
 * Website premium registry — 3 gold benchmarks + 7 direction presets.
 * Web design/dev agency; quote-first conversion, live URL proof.
 */

export const WEBSITE_GOLD_STANDARDS = ['build-quote', 'portfolio-trust', 'package-first'] as const;

export type WebsiteGoldStandard = (typeof WEBSITE_GOLD_STANDARDS)[number];

export const WEBSITE_DIRECTION_STANDARDS = [
  'build-steps',
  'showcase',
  'demo-video',
  'faq-quote',
  'nav-services',
  'early-brief',
  'minimal-quote',
] as const;

export type WebsiteDirectionStandard = (typeof WEBSITE_DIRECTION_STANDARDS)[number];

export const WEBSITE_PREMIUM_STANDARDS = [
  ...WEBSITE_GOLD_STANDARDS,
  ...WEBSITE_DIRECTION_STANDARDS,
] as const;

export type WebsitePremiumStandard = (typeof WEBSITE_PREMIUM_STANDARDS)[number];

export const WEBSITE_GOLD_ARCHITECTURE_IDS: Record<WebsiteGoldStandard, string> = {
  'build-quote': 'website_build_quote',
  'portfolio-trust': 'website_portfolio_trust',
  'package-first': 'website_package_first',
};

export const WEBSITE_DIRECTION_ARCHITECTURE_IDS: Record<WebsiteDirectionStandard, string> = {
  'build-steps': 'website_build_steps',
  showcase: 'website_showcase',
  'demo-video': 'website_demo_video',
  'faq-quote': 'website_faq_quote',
  'nav-services': 'website_nav_services',
  'early-brief': 'website_early_brief',
  'minimal-quote': 'website_minimal_quote',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(WEBSITE_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, WebsiteGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(WEBSITE_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, WebsiteDirectionStandard>;

export function resolveWebsiteGoldStandard(
  architectureId: string | undefined,
): WebsiteGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveWebsiteDirectionStandard(
  architectureId: string | undefined,
): WebsiteDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveWebsitePremiumStandard(
  architectureId: string | undefined,
): WebsitePremiumStandard | undefined {
  return resolveWebsiteGoldStandard(architectureId) || resolveWebsiteDirectionStandard(architectureId);
}

export function isWebsiteGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveWebsiteGoldStandard(architectureId));
}

export function isWebsiteDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveWebsiteDirectionStandard(architectureId));
}

export function isWebsitePremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveWebsitePremiumStandard(architectureId));
}

export const WEBSITE_GOLD_BLOCK_VARIANTS: Record<
  WebsiteGoldStandard,
  Partial<Record<string, string>>
> = {
  'build-quote': {
    Header: 'default',
    Hero: 'centered',
    Process: 'steps',
    Features: 'numbered',
    Pricing: 'comparison',
    FAQ: 'accordion',
    LeadForm: 'card',
    Footer: 'default',
  },
  'portfolio-trust': {
    Header: 'default',
    Hero: 'split-left',
    Gallery: 'editorial-mosaic',
    Testimonials: 'metric-plus-quote',
    Guarantee: 'banner',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
  'package-first': {
    Hero: 'centered',
    Pricing: 'comparison',
    Benefits: 'editorial-list',
    FAQ: 'two-column',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const WEBSITE_DIRECTION_BLOCK_VARIANTS: Record<
  WebsiteDirectionStandard,
  Partial<Record<string, string>>
> = {
  'build-steps': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Benefits: 'icon-grid',
    Features: 'numbered',
    Testimonials: 'cards',
    LeadForm: 'card',
    Footer: 'default',
  },
  showcase: {
    Gallery: 'editorial-mosaic',
    Hero: 'split-left',
    Features: 'alternating',
    Pricing: 'comparison',
    CTA: 'banner',
    LeadForm: 'split',
    Footer: 'columns',
  },
  'demo-video': {
    Hero: 'centered',
    Video: 'default',
    Process: 'steps',
    Benefits: 'alternating',
    LeadForm: 'floating-card',
    FAQ: 'accordion',
    Footer: 'default',
  },
  'faq-quote': {
    Hero: 'centered',
    Features: 'numbered',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Pricing: 'cards',
    LeadForm: 'card',
    Footer: 'default',
  },
  'nav-services': {
    Header: 'default',
    Hero: 'split-left',
    Benefits: 'alternating',
    Process: 'steps',
    Features: 'icon-grid',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-brief': {
    Header: 'minimal',
    Hero: 'floating-card',
    LeadForm: 'inline',
    Gallery: 'masonry',
    Process: 'steps',
    Pricing: 'cards',
    Footer: 'default',
  },
  'minimal-quote': {
    Header: 'minimal',
    Hero: 'minimal-copy',
    Benefits: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type WebsiteSectionTone = 'studio' | 'craft' | 'dev' | 'surface' | 'accent' | 'canvas';

function websiteGoldSectionToneInner(
  gold: WebsiteGoldStandard,
  blockType: string,
  index: number,
): WebsiteSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'build-quote':
      if (blockType === 'Hero' || blockType === 'Header') return 'studio';
      if (blockType === 'Process') return 'dev';
      if (blockType === 'Pricing' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'FAQ') return 'surface';
      return even ? 'craft' : 'surface';
    case 'portfolio-trust':
      if (blockType === 'Hero') return 'craft';
      if (blockType === 'Gallery' && index <= 2) return 'studio';
      if (blockType === 'Testimonials') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'craft' : 'canvas';
    case 'package-first':
      if (blockType === 'Hero') return 'dev';
      if (blockType === 'Pricing') return 'studio';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Benefits') return 'craft';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function websiteDirectionSectionToneInner(
  dir: WebsiteDirectionStandard,
  blockType: string,
  index: number,
): WebsiteSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'build-steps':
      if (blockType === 'Process') return 'dev';
      if (blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'craft' : 'surface';
    case 'showcase':
      if (blockType === 'Gallery' && index <= 1) return 'studio';
      if (blockType === 'Hero') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Pricing') return 'dev';
      return even ? 'canvas' : 'surface';
    case 'demo-video':
      if (blockType === 'Hero' || blockType === 'Video') return 'studio';
      if (blockType === 'Process') return 'dev';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'craft' : 'surface';
    case 'faq-quote':
      if (blockType === 'Hero') return 'craft';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Pricing') return 'dev';
      return even ? 'craft' : 'canvas';
    case 'nav-services':
      if (blockType === 'Header') return 'surface';
      if (blockType === 'Process') return 'dev';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-brief':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery') return 'studio';
      return even ? 'canvas' : 'surface';
    case 'minimal-quote':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'surface' : 'craft';
    default:
      return 'canvas';
  }
}

/** Alternating section rhythm per website premium standard. */
export function websiteGoldSectionTone(
  gold: WebsitePremiumStandard,
  blockType: string,
  index: number,
): WebsiteSectionTone {
  if ((WEBSITE_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return websiteGoldSectionToneInner(gold as WebsiteGoldStandard, blockType, index);
  }
  return websiteDirectionSectionToneInner(gold as WebsiteDirectionStandard, blockType, index);
}

export function websiteGoldSectionBackground(tone: WebsiteSectionTone): string | null {
  switch (tone) {
    case 'studio':
      return 'linear-gradient(165deg, #0C0E14 0%, #151922 48%, #0A0D12 100%)';
    case 'craft':
      return 'linear-gradient(180deg, #F4EFE3 0%, #FAF6EC 55%, #EDE8DC 100%)';
    case 'dev':
      return 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 55%, #F0F9FF 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #1E3A8A) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
