/**
 * Clinic gold-standard registry — trust / care / premium medical presets.
 * Data-driven; renderer reads meta.goldStandard + stamped block backgrounds.
 */

export const CLINIC_GOLD_STANDARDS = [
  'trust-clinical',
  'care-warm',
  'premium-medical',
] as const;

export type ClinicGoldStandard = (typeof CLINIC_GOLD_STANDARDS)[number];

export const CLINIC_GOLD_ARCHITECTURE_IDS: Record<ClinicGoldStandard, string> = {
  'trust-clinical': 'clinic_trust_clinical',
  'care-warm': 'clinic_care_warm',
  'premium-medical': 'clinic_premium_medical',
};

const ARCH_TO_GOLD = Object.fromEntries(
  Object.entries(CLINIC_GOLD_ARCHITECTURE_IDS).map(([k, v]) => [v, k]),
) as Record<string, ClinicGoldStandard>;

export function resolveClinicGoldStandard(
  architectureId: string | undefined,
): ClinicGoldStandard | undefined {
  if (!architectureId) return undefined;
  return ARCH_TO_GOLD[architectureId];
}

export function isClinicGoldArchitecture(architectureId: string | undefined): boolean {
  return Boolean(resolveClinicGoldStandard(architectureId));
}

export type ClinicGoldSectionTone = 'dark' | 'cream' | 'surface' | 'accent' | 'canvas' | 'sage';

export const CLINIC_GOLD_BLOCK_VARIANTS: Record<
  ClinicGoldStandard,
  Partial<Record<string, string>>
> = {
  'trust-clinical': {
    Header: 'default',
    Hero: 'split-left',
    Speaker: 'authority',
    Guarantee: 'banner',
    Benefits: 'icon-grid',
    Gallery: 'masonry',
    Process: 'steps',
    FAQ: 'accordion',
    LeadForm: 'booking',
    Footer: 'default',
  },
  'care-warm': {
    Hero: 'centered',
    Speaker: 'authority',
    Process: 'timeline',
    Benefits: 'editorial-list',
    Gallery: 'editorial-mosaic',
    Testimonials: 'editorial',
    FAQ: 'two-column',
    Guarantee: 'banner',
    LeadForm: 'booking',
    CTA: 'banner',
    Footer: 'default',
  },
  'premium-medical': {
    Header: 'default',
    Hero: 'editorial-overlay',
    Speaker: 'authority',
    Gallery: 'editorial-mosaic',
    Process: 'steps',
    Testimonials: 'metric-plus-quote',
    Guarantee: 'banner',
    FAQ: 'accordion',
    LeadForm: 'card',
    CTA: 'banner',
    Footer: 'default',
  },
};

/** Alternating section rhythm per clinic gold standard. */
export function clinicGoldSectionTone(
  gold: ClinicGoldStandard,
  blockType: string,
  index: number,
): ClinicGoldSectionTone {
  const even = index % 2 === 0;
  switch (gold) {
    case 'trust-clinical':
      if (blockType === 'Header' || blockType === 'Hero') return 'surface';
      if (blockType === 'Speaker' || blockType === 'Guarantee') return 'canvas';
      if (blockType === 'LeadForm') return 'accent';
      if (blockType === 'Gallery' || blockType === 'Process') return even ? 'surface' : 'canvas';
      return even ? 'canvas' : 'surface';
    case 'care-warm':
      if (blockType === 'Hero') return 'cream';
      if (blockType === 'Speaker' || blockType === 'Process') return 'sage';
      if (blockType === 'CTA' || blockType === 'Guarantee') return 'accent';
      if (blockType === 'LeadForm') return 'cream';
      return even ? 'cream' : 'surface';
    case 'premium-medical':
      if (blockType === 'Hero' || blockType === 'Header') return 'dark';
      if (blockType === 'Speaker' || blockType === 'Gallery') return even ? 'dark' : 'surface';
      if (blockType === 'CTA' || blockType === 'Guarantee') return 'accent';
      if (blockType === 'LeadForm') return 'dark';
      return even ? 'surface' : 'canvas';
    default:
      return 'canvas';
  }
}

export function clinicGoldSectionBackground(tone: ClinicGoldSectionTone): string | null {
  switch (tone) {
    case 'dark':
      return 'linear-gradient(165deg, #0B1A2E 0%, #122640 48%, #0E1729 100%)';
    case 'cream':
      return 'linear-gradient(180deg, #F7F4EC 0%, #FAF8F2 55%, #F3F0E8 100%)';
    case 'sage':
      return 'linear-gradient(180deg, #E8F0EA 0%, #F4F7F5 55%, #EEF3EF 100%)';
    case 'surface':
      return 'var(--lp-surface, #FFFFFF)';
    case 'accent':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 62%, #0B1A2E) 100%)';
    case 'canvas':
    default:
      return 'var(--lp-canvas, var(--lp-bg))';
  }
}
