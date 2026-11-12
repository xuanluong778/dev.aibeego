/**
 * Agency premium registry — 3 gold benchmarks + 7 direction presets.
 * Data-driven; renderer reads meta.goldStandard + stamped block backgrounds.
 */

export const AGENCY_GOLD_STANDARDS = [
  'dark-direct',
  'cream-editorial',
  'modern-saas',
] as const;

export type AgencyGoldStandard = (typeof AGENCY_GOLD_STANDARDS)[number];

export const AGENCY_DIRECTION_STANDARDS = [
  'trust-case',
  'process-sprint',
  'work-gallery',
  'faq-pitch',
  'nav-services',
  'early-brief',
  'minimal-pitch',
] as const;

export type AgencyDirectionStandard = (typeof AGENCY_DIRECTION_STANDARDS)[number];

export const AGENCY_PREMIUM_STANDARDS = [
  ...AGENCY_GOLD_STANDARDS,
  ...AGENCY_DIRECTION_STANDARDS,
] as const;

export type AgencyPremiumStandard = (typeof AGENCY_PREMIUM_STANDARDS)[number];

export const AGENCY_GOLD_ARCHITECTURE_IDS: Record<AgencyGoldStandard, string> = {
  'dark-direct': 'agency_dark_direct',
  'cream-editorial': 'agency_cream_editorial',
  'modern-saas': 'agency_modern_saas',
};

export const AGENCY_DIRECTION_ARCHITECTURE_IDS: Record<AgencyDirectionStandard, string> = {
  'trust-case': 'agency_trust_case',
  'process-sprint': 'agency_process_sprint',
  'work-gallery': 'agency_work_gallery',
  'faq-pitch': 'agency_faq_pitch',
  'nav-services': 'agency_nav_services',
  'early-brief': 'agency_brief_form',
  'minimal-pitch': 'agency_minimal_pitch',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(AGENCY_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, AgencyGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(AGENCY_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, AgencyDirectionStandard>;

export function resolveAgencyGoldStandard(
  architectureId: string | undefined,
): AgencyGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveAgencyDirectionStandard(
  architectureId: string | undefined,
): AgencyDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveAgencyPremiumStandard(
  architectureId: string | undefined,
): AgencyPremiumStandard | undefined {
  return resolveAgencyGoldStandard(architectureId) || resolveAgencyDirectionStandard(architectureId);
}

export function isAgencyGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveAgencyGoldStandard(architectureId));
}

export function isAgencyDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveAgencyDirectionStandard(architectureId));
}

export function isAgencyPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveAgencyPremiumStandard(architectureId));
}

export const AGENCY_GOLD_BLOCK_VARIANTS: Record<
  AgencyGoldStandard,
  Partial<Record<string, string>>
> = {
  'dark-direct': {
    Header: 'default',
    Hero: 'editorial-overlay',
    Benefits: 'icon-grid',
    Features: 'numbered',
    Gallery: 'editorial-mosaic',
    Testimonials: 'metric-plus-quote',
    Process: 'steps',
    Pricing: 'comparison',
    FAQ: 'accordion',
    CTA: 'banner',
    LeadForm: 'card',
    Footer: 'default',
  },
  'cream-editorial': {
    Hero: 'centered',
    Video: 'default',
    Benefits: 'editorial-list',
    Features: 'editorial-list',
    Process: 'timeline',
    Gallery: 'editorial-mosaic',
    Testimonials: 'editorial',
    Pricing: 'cards',
    FAQ: 'two-column',
    Guarantee: 'banner',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
  'modern-saas': {
    Header: 'minimal',
    Hero: 'split-left',
    Features: 'alternating',
    Gallery: 'masonry',
    Testimonials: 'metric-plus-quote',
    Process: 'steps',
    Pricing: 'comparison',
    FAQ: 'two-column',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
};

export const AGENCY_DIRECTION_BLOCK_VARIANTS: Record<
  AgencyDirectionStandard,
  Partial<Record<string, string>>
> = {
  'trust-case': {
    Header: 'default',
    Hero: 'centered',
    Testimonials: 'metric-plus-quote',
    Gallery: 'editorial-mosaic',
    Features: 'numbered',
    Benefits: 'icon-grid',
    Guarantee: 'banner',
    Pricing: 'cards',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
  'process-sprint': {
    Header: 'minimal',
    Hero: 'minimal-copy',
    Process: 'timeline',
    Features: 'alternating',
    Benefits: 'icon-grid',
    Testimonials: 'cards',
    Gallery: 'masonry',
    LeadForm: 'card',
    CTA: 'split',
    Footer: 'default',
  },
  'work-gallery': {
    Header: 'minimal',
    Gallery: 'editorial-mosaic',
    Hero: 'split-left',
    Benefits: 'editorial-list',
    Process: 'steps',
    Testimonials: 'editorial',
    Pricing: 'comparison',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'columns',
  },
  'faq-pitch': {
    Header: 'default',
    Hero: 'centered',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Features: 'numbered',
    Testimonials: 'metric-plus-quote',
    Pricing: 'cards',
    LeadForm: 'card',
    CTA: 'minimal',
    Footer: 'default',
  },
  'nav-services': {
    Header: 'default',
    Hero: 'split-left',
    Features: 'icon-grid',
    Benefits: 'alternating',
    Process: 'steps',
    Gallery: 'masonry',
    Pricing: 'comparison',
    Testimonials: 'cards',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-brief': {
    Header: 'minimal',
    Hero: 'floating-card',
    LeadForm: 'inline',
    Gallery: 'masonry',
    Benefits: 'editorial-list',
    Process: 'steps',
    Testimonials: 'cards',
    CTA: 'banner',
    Footer: 'default',
  },
  'minimal-pitch': {
    Header: 'minimal',
    Hero: 'minimal-copy',
    Features: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type GoldSectionTone = 'dark' | 'cream' | 'surface' | 'accent' | 'canvas';

function goldSectionToneInner(
  gold: AgencyGoldStandard,
  blockType: string,
  index: number,
): GoldSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'dark-direct':
      if (blockType === 'Hero' || blockType === 'Header') return 'dark';
      if (blockType === 'CTA' || blockType === 'Guarantee') return 'accent';
      if (blockType === 'LeadForm') return 'dark';
      if (blockType === 'Gallery' || blockType === 'Testimonials') return even ? 'dark' : 'surface';
      return even ? 'cream' : 'surface';
    case 'cream-editorial':
      if (blockType === 'Hero' || blockType === 'Video') return 'dark';
      if (blockType === 'CTA' || blockType === 'Guarantee') return 'accent';
      if (blockType === 'LeadForm') return 'cream';
      return even ? 'cream' : 'surface';
    case 'modern-saas':
      if (blockType === 'Hero' || blockType === 'Header') return 'surface';
      if (blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'cream';
      return even ? 'canvas' : 'surface';
    default:
      return 'canvas';
  }
}

function agencyDirectionSectionToneInner(
  dir: AgencyDirectionStandard,
  blockType: string,
  index: number,
): GoldSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'trust-case':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'Testimonials') return 'surface';
      if (blockType === 'Gallery') return 'canvas';
      if (blockType === 'Guarantee' || blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'cream' : 'surface';
    case 'process-sprint':
      if (blockType === 'Process') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'canvas' : 'surface';
    case 'work-gallery':
      if (blockType === 'Gallery' && index <= 1) return 'dark';
      if (blockType === 'Hero') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      if (blockType === 'Pricing') return 'surface';
      return even ? 'canvas' : 'surface';
    case 'faq-pitch':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'CTA') return 'accent';
      if (blockType === 'LeadForm') return 'surface';
      return even ? 'cream' : 'canvas';
    case 'nav-services':
      if (blockType === 'Header') return 'surface';
      if (blockType === 'Pricing') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'early-brief':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'minimal-pitch':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

/** Alternating section rhythm per agency premium standard. */
export function goldSectionTone(
  gold: AgencyPremiumStandard,
  blockType: string,
  index: number,
): GoldSectionTone {
  if ((AGENCY_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return goldSectionToneInner(gold as AgencyGoldStandard, blockType, index);
  }
  return agencyDirectionSectionToneInner(gold as AgencyDirectionStandard, blockType, index);
}

export function goldSectionBackground(tone: GoldSectionTone): string | null {
  switch (tone) {
    case 'dark':
      return 'linear-gradient(165deg, #0A0A0A 0%, #141414 48%, #0E0E0E 100%)';
    case 'cream':
      return 'linear-gradient(180deg, #F5F1E6 0%, #FAF7F0 55%, #F3EFE4 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 62%, #0A0A0A) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
