/**
 * Service premium registry — 3 gold benchmarks + 7 direction presets.
 * Local trades / home services; booking-first conversion.
 */

export const SERVICE_GOLD_STANDARDS = ['local-book', 'neighborhood-trust', 'package-pro'] as const;

export type ServiceGoldStandard = (typeof SERVICE_GOLD_STANDARDS)[number];

export const SERVICE_DIRECTION_STANDARDS = [
  'work-process',
  'job-proof',
  'team-video',
  'faq-booking',
  'area-nav',
  'early-book',
  'quick-book',
] as const;

export type ServiceDirectionStandard = (typeof SERVICE_DIRECTION_STANDARDS)[number];

export const SERVICE_PREMIUM_STANDARDS = [
  ...SERVICE_GOLD_STANDARDS,
  ...SERVICE_DIRECTION_STANDARDS,
] as const;

export type ServicePremiumStandard = (typeof SERVICE_PREMIUM_STANDARDS)[number];

export const SERVICE_GOLD_ARCHITECTURE_IDS: Record<ServiceGoldStandard, string> = {
  'local-book': 'service_book_path',
  'neighborhood-trust': 'service_trust_local',
  'package-pro': 'service_price_packages',
};

export const SERVICE_DIRECTION_ARCHITECTURE_IDS: Record<ServiceDirectionStandard, string> = {
  'work-process': 'service_how_we_work',
  'job-proof': 'service_job_gallery',
  'team-video': 'service_intro_video',
  'faq-booking': 'service_faq_book',
  'area-nav': 'service_nav_areas',
  'early-book': 'service_early_book',
  'quick-book': 'service_minimal_book',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(SERVICE_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ServiceGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(SERVICE_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ServiceDirectionStandard>;

export function resolveServiceGoldStandard(
  architectureId: string | undefined,
): ServiceGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveServiceDirectionStandard(
  architectureId: string | undefined,
): ServiceDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveServicePremiumStandard(
  architectureId: string | undefined,
): ServicePremiumStandard | undefined {
  return resolveServiceGoldStandard(architectureId) || resolveServiceDirectionStandard(architectureId);
}

export function isServiceGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveServiceGoldStandard(architectureId));
}

export function isServiceDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveServiceDirectionStandard(architectureId));
}

export function isServicePremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveServicePremiumStandard(architectureId));
}

export const SERVICE_GOLD_BLOCK_VARIANTS: Record<
  ServiceGoldStandard,
  Partial<Record<string, string>>
> = {
  'local-book': {
    Header: 'default',
    Hero: 'editorial-overlay',
    Process: 'steps',
    Benefits: 'icon-grid',
    Guarantee: 'banner',
    LeadForm: 'booking',
    CTA: 'split',
    Footer: 'default',
  },
  'neighborhood-trust': {
    Header: 'default',
    Hero: 'split-left',
    Testimonials: 'portrait-quotes',
    Features: 'icon-grid',
    Guarantee: 'banner',
    LeadForm: 'booking',
    CTA: 'banner',
    Footer: 'default',
  },
  'package-pro': {
    Hero: 'centered',
    Pricing: 'comparison',
    Benefits: 'editorial-list',
    FAQ: 'two-column',
    LeadForm: 'booking',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const SERVICE_DIRECTION_BLOCK_VARIANTS: Record<
  ServiceDirectionStandard,
  Partial<Record<string, string>>
> = {
  'work-process': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Features: 'numbered',
    Gallery: 'masonry',
    LeadForm: 'card',
    Footer: 'default',
  },
  'job-proof': {
    Gallery: 'editorial-mosaic',
    Hero: 'split-left',
    Benefits: 'icon-grid',
    Process: 'steps',
    CTA: 'image-background',
    LeadForm: 'inline',
    Footer: 'columns',
  },
  'team-video': {
    Hero: 'editorial-overlay',
    Video: 'default',
    Process: 'steps',
    Benefits: 'alternating',
    LeadForm: 'floating-card',
    FAQ: 'accordion',
    Footer: 'default',
  },
  'faq-booking': {
    Hero: 'centered',
    Benefits: 'icon-grid',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Testimonials: 'cards',
    LeadForm: 'booking',
    Footer: 'default',
  },
  'area-nav': {
    Header: 'minimal',
    Hero: 'split-left',
    Features: 'icon-grid',
    Process: 'steps',
    Pricing: 'cards',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-book': {
    Hero: 'floating-card',
    LeadForm: 'booking',
    Benefits: 'numbered',
    Process: 'steps',
    Guarantee: 'banner',
    Footer: 'default',
  },
  'quick-book': {
    Hero: 'minimal-copy',
    Process: 'steps',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type ServiceSectionTone = 'local' | 'trust' | 'work' | 'surface' | 'accent' | 'canvas';

function serviceGoldSectionToneInner(
  gold: ServiceGoldStandard,
  blockType: string,
  index: number,
): ServiceSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'local-book':
      if (blockType === 'Hero') return 'local';
      if (blockType === 'Guarantee' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'trust';
      if (blockType === 'Process') return 'surface';
      return even ? 'canvas' : 'surface';
    case 'neighborhood-trust':
      if (blockType === 'Hero') return 'trust';
      if (blockType === 'Testimonials') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'local';
      return even ? 'canvas' : 'surface';
    case 'package-pro':
      if (blockType === 'Hero') return 'surface';
      if (blockType === 'Pricing') return 'local';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function serviceDirectionSectionToneInner(
  dir: ServiceDirectionStandard,
  blockType: string,
  index: number,
): ServiceSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'work-process':
      if (blockType === 'Process') return 'surface';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'job-proof':
      if (blockType === 'Gallery' && index <= 1) return 'work';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'team-video':
      if (blockType === 'Hero' || blockType === 'Video') return 'local';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'faq-booking':
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      return even ? 'trust' : 'canvas';
    case 'area-nav':
      if (blockType === 'Pricing') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-book':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'quick-book':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

export function serviceGoldSectionTone(
  gold: ServicePremiumStandard,
  blockType: string,
  index: number,
): ServiceSectionTone {
  if ((SERVICE_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return serviceGoldSectionToneInner(gold as ServiceGoldStandard, blockType, index);
  }
  return serviceDirectionSectionToneInner(gold as ServiceDirectionStandard, blockType, index);
}

export function serviceGoldSectionBackground(tone: ServiceSectionTone): string | null {
  switch (tone) {
    case 'local':
      return 'linear-gradient(180deg, #ECFDF5 0%, #F0FDFA 55%, #FFFFFF 100%)';
    case 'trust':
      return 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 55%, #FFFFFF 100%)';
    case 'work':
      return 'linear-gradient(165deg, #1E293B 0%, #334155 48%, #0F172A 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #0F766E) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
