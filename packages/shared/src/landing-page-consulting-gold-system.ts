/**
 * Consulting premium registry — 3 gold benchmarks + 7 direction presets.
 * B2B advisory; audit, retainer, discovery-first conversion.
 */

export const CONSULTING_GOLD_STANDARDS = [
  'audit-cta',
  'trust-credentials',
  'retainer-pricing',
] as const;

export type ConsultingGoldStandard = (typeof CONSULTING_GOLD_STANDARDS)[number];

export const CONSULTING_DIRECTION_STANDARDS = [
  'engagement-process',
  'case-gallery',
  'thought-video',
  'faq-authority',
  'practice-nav',
  'early-brief',
  'minimal-consult',
] as const;

export type ConsultingDirectionStandard = (typeof CONSULTING_DIRECTION_STANDARDS)[number];

export const CONSULTING_PREMIUM_STANDARDS = [
  ...CONSULTING_GOLD_STANDARDS,
  ...CONSULTING_DIRECTION_STANDARDS,
] as const;

export type ConsultingPremiumStandard = (typeof CONSULTING_PREMIUM_STANDARDS)[number];

export const CONSULTING_GOLD_ARCHITECTURE_IDS: Record<ConsultingGoldStandard, string> = {
  'audit-cta': 'consulting_audit_cta',
  'trust-credentials': 'consulting_trust',
  'retainer-pricing': 'consulting_retainers',
};

export const CONSULTING_DIRECTION_ARCHITECTURE_IDS: Record<ConsultingDirectionStandard, string> = {
  'engagement-process': 'consulting_engagement',
  'case-gallery': 'consulting_case_gallery',
  'thought-video': 'consulting_thought_video',
  'faq-authority': 'consulting_faq',
  'practice-nav': 'consulting_nav',
  'early-brief': 'consulting_early_brief',
  'minimal-consult': 'consulting_minimal',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(CONSULTING_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ConsultingGoldStandard>;

const ARCH_TO_DIRECTION = Object.fromEntries(
  Object.entries(CONSULTING_DIRECTION_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ConsultingDirectionStandard>;

export function resolveConsultingGoldStandard(
  architectureId: string | undefined,
): ConsultingGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function resolveConsultingDirectionStandard(
  architectureId: string | undefined,
): ConsultingDirectionStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_DIRECTION[architectureId];
}

export function resolveConsultingPremiumStandard(
  architectureId: string | undefined,
): ConsultingPremiumStandard | undefined {
  return (
    resolveConsultingGoldStandard(architectureId) || resolveConsultingDirectionStandard(architectureId)
  );
}

export function isConsultingGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveConsultingGoldStandard(architectureId));
}

export function isConsultingDirectionArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveConsultingDirectionStandard(architectureId));
}

export function isConsultingPremiumArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveConsultingPremiumStandard(architectureId));
}

export const CONSULTING_GOLD_BLOCK_VARIANTS: Record<
  ConsultingGoldStandard,
  Partial<Record<string, string>>
> = {
  'audit-cta': {
    Header: 'default',
    Hero: 'split-left',
    Features: 'numbered',
    Process: 'steps',
    Testimonials: 'metric-plus-quote',
    CTA: 'split',
    LeadForm: 'card',
    Footer: 'default',
  },
  'trust-credentials': {
    Hero: 'centered',
    Guarantee: 'banner',
    Speaker: 'default',
    Benefits: 'editorial-list',
    Testimonials: 'editorial',
    LeadForm: 'card',
    Footer: 'default',
  },
  'retainer-pricing': {
    Hero: 'centered',
    Pricing: 'comparison',
    Features: 'icon-grid',
    FAQ: 'two-column',
    LeadForm: 'split',
    CTA: 'banner',
    Footer: 'default',
  },
};

export const CONSULTING_DIRECTION_BLOCK_VARIANTS: Record<
  ConsultingDirectionStandard,
  Partial<Record<string, string>>
> = {
  'engagement-process': {
    Hero: 'minimal-copy',
    Process: 'timeline',
    Benefits: 'icon-grid',
    Features: 'numbered',
    LeadForm: 'card',
    Footer: 'default',
  },
  'case-gallery': {
    Gallery: 'editorial-mosaic',
    Hero: 'split-left',
    Testimonials: 'metric-plus-quote',
    Process: 'steps',
    CTA: 'banner',
    LeadForm: 'card',
    Footer: 'columns',
  },
  'thought-video': {
    Hero: 'centered',
    Video: 'default',
    Speaker: 'default',
    Benefits: 'alternating',
    LeadForm: 'floating-card',
    FAQ: 'accordion',
    Footer: 'default',
  },
  'faq-authority': {
    Hero: 'centered',
    Features: 'numbered',
    FAQ: 'accordion',
    Guarantee: 'banner',
    Process: 'steps',
    LeadForm: 'card',
    Footer: 'default',
  },
  'practice-nav': {
    Header: 'default',
    Hero: 'split-left',
    Benefits: 'alternating',
    Features: 'icon-grid',
    Pricing: 'comparison',
    LeadForm: 'split',
    CTA: 'split',
    Footer: 'columns',
  },
  'early-brief': {
    Hero: 'floating-card',
    LeadForm: 'inline',
    Features: 'editorial-list',
    Process: 'steps',
    Testimonials: 'cards',
    Footer: 'default',
  },
  'minimal-consult': {
    Hero: 'minimal-copy',
    Features: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Footer: 'columns',
  },
};

export type ConsultingSectionTone =
  | 'executive'
  | 'corporate'
  | 'warm'
  | 'surface'
  | 'accent'
  | 'canvas';

function consultingGoldSectionToneInner(
  gold: ConsultingGoldStandard,
  blockType: string,
  index: number,
): ConsultingSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'audit-cta':
      if (blockType === 'Hero' || blockType === 'Header') return 'executive';
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Process') return 'corporate';
      if (blockType === 'Testimonials') return 'surface';
      return even ? 'canvas' : 'corporate';
    case 'trust-credentials':
      if (blockType === 'Hero') return 'warm';
      if (blockType === 'Speaker') return 'corporate';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Testimonials') return 'surface';
      return even ? 'warm' : 'corporate';
    case 'retainer-pricing':
      if (blockType === 'Hero') return 'corporate';
      if (blockType === 'Pricing') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'corporate';
    default:
      return 'canvas';
  }
}

function consultingDirectionSectionToneInner(
  dir: ConsultingDirectionStandard,
  blockType: string,
  index: number,
): ConsultingSectionTone {
  const even = index % 2 === 0;
  switch (dir) {
    case 'engagement-process':
      if (blockType === 'Process') return 'corporate';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'case-gallery':
      if (blockType === 'Gallery' && index <= 1) return 'executive';
      if (blockType === 'Hero') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'corporate';
    case 'thought-video':
      if (blockType === 'Hero' || blockType === 'Video') return 'executive';
      if (blockType === 'Speaker') return 'warm';
      if (blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'corporate';
    case 'faq-authority':
      if (blockType === 'Hero') return 'corporate';
      if (blockType === 'FAQ') return 'surface';
      if (blockType === 'Guarantee' || blockType === 'LeadForm') return 'accent';
      return even ? 'warm' : 'canvas';
    case 'practice-nav':
      if (blockType === 'Header') return 'corporate';
      if (blockType === 'Pricing') return 'surface';
      if (blockType === 'LeadForm' || blockType === 'CTA') return 'accent';
      return even ? 'canvas' : 'corporate';
    case 'early-brief':
      if (blockType === 'Hero' || blockType === 'LeadForm') return 'accent';
      return even ? 'canvas' : 'surface';
    case 'minimal-consult':
      if (blockType === 'CTA' || blockType === 'LeadForm') return 'accent';
      if (blockType === 'Hero') return 'canvas';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

/** Alternating section rhythm per consulting premium standard. */
export function consultingGoldSectionTone(
  gold: ConsultingPremiumStandard,
  blockType: string,
  index: number,
): ConsultingSectionTone {
  if ((CONSULTING_GOLD_STANDARDS as readonly string[]).includes(gold)) {
    return consultingGoldSectionToneInner(gold as ConsultingGoldStandard, blockType, index);
  }
  return consultingDirectionSectionToneInner(gold as ConsultingDirectionStandard, blockType, index);
}

export function consultingGoldSectionBackground(tone: ConsultingSectionTone): string | null {
  switch (tone) {
    case 'executive':
      return 'linear-gradient(165deg, #0F172A 0%, #1E293B 48%, #0B1220 100%)';
    case 'corporate':
      return 'linear-gradient(180deg, #F1F5F9 0%, #F8FAFC 55%, #FFFFFF 100%)';
    case 'warm':
      return 'linear-gradient(180deg, #F5F0E8 0%, #FAF7F2 55%, #F0EBE3 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 58%, #1E3A5F) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
