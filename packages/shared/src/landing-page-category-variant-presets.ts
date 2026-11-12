/**
 * Phase 3 — per-category block variant stamping.
 * Maps variantIndex (0–9) + category DNA → structural blockVariants for renderer.
 * SPA keeps hand-authored variants; other categories merge presets here.
 */

import type { LandingPageBlock, LandingPageCategory } from './landing-page-types';
import {
  mapLegacyHeroVariant,
  resolveBlockVariant,
} from './landing-page-template-foundation';
import type { CtaStrategy } from './landing-page-cta-copy';
import { getCategoryIndexOverrides } from './landing-page-category-visual-dna';

type ArchitectureSection = LandingPageBlock['type'];

/** Index-aligned with SUFFIX/NAME in category-architectures (trust, pricing, process…). */
const INDEX_VARIANT_PROFILES: Array<Partial<Record<LandingPageBlock['type'], string>>> = [
  {
    Features: 'editorial-list',
    Process: 'timeline',
    Gallery: 'editorial-mosaic',
    Testimonials: 'quote-centered',
    Benefits: 'minimal-list',
    CTA: 'minimal',
    LeadForm: 'card',
  },
  {
    Testimonials: 'cards',
    Features: 'icon-grid',
    Benefits: 'icon-grid',
    Guarantee: 'banner',
    CTA: 'banner',
    LeadForm: 'split',
  },
  {
    Pricing: 'comparison',
    Features: 'numbered',
    FAQ: 'two-column',
    CTA: 'centered',
    LeadForm: 'compact',
  },
  {
    Process: 'timeline',
    Features: 'numbered',
    Benefits: 'alternating',
    Testimonials: 'editorial',
    CTA: 'minimal',
    LeadForm: 'split',
  },
  {
    Gallery: 'masonry',
    Features: 'image-cards',
    Testimonials: 'portrait-quotes',
    CTA: 'image-background',
    LeadForm: 'inline',
    Pricing: 'cards',
  },
  {
    Features: 'alternating',
    Process: 'steps',
    Benefits: 'minimal-list',
    CTA: 'split',
    LeadForm: 'split',
  },
  {
    FAQ: 'accordion',
    Guarantee: 'banner',
    Features: 'editorial-list',
    Testimonials: 'cards',
    CTA: 'floating-card',
    LeadForm: 'card',
  },
  {
    Header: 'minimal',
    Features: 'icon-grid',
    Process: 'steps',
    Pricing: 'cards',
    CTA: 'split',
    LeadForm: 'floating-card',
    Footer: 'columns',
  },
  {
    LeadForm: 'booking',
    Features: 'numbered',
    FAQ: 'accordion',
    Testimonials: 'metric-plus-quote',
    CTA: 'banner',
    Process: 'steps',
  },
  {
    Features: 'minimal-list',
    Benefits: 'minimal-list',
    Testimonials: 'quote-centered',
    CTA: 'minimal',
    LeadForm: 'minimal',
    Gallery: 'grid',
  },
];

/** Per-category perturbation — avoids cross-category clone fingerprints at same index. */
const CATEGORY_BLOCK_NUDGES: Partial<
  Record<LandingPageCategory, Partial<Record<LandingPageBlock['type'], string>>>
> = {
  seo: { Process: 'steps', Testimonials: 'editorial', CTA: 'banner' },
  agency: { Gallery: 'featured-plus-grid', Testimonials: 'portrait-quotes', CTA: 'split', Features: 'editorial-list' },
  clinic: { Process: 'timeline', Testimonials: 'metric-plus-quote', LeadForm: 'booking', Features: 'icon-grid' },
  course: { Process: 'steps', Testimonials: 'editorial', Pricing: 'cards' },
  saas: { Features: 'alternating', Pricing: 'comparison', CTA: 'split', LeadForm: 'split' },
  product: { Gallery: 'featured-plus-grid', Features: 'image-cards', Pricing: 'minimal' },
  restaurant: { Gallery: 'masonry', Process: 'timeline', LeadForm: 'booking' },
  real_estate: { Gallery: 'featured-plus-grid', Process: 'steps', Testimonials: 'cards' },
  webinar: { Testimonials: 'portrait-quotes', CTA: 'centered', LeadForm: 'compact' },
  cosmetics: { Features: 'image-cards', Gallery: 'editorial-mosaic', Pricing: 'cards' },
  fashion: { Gallery: 'masonry', Features: 'alternating', Testimonials: 'editorial' },
  website: { Gallery: 'grid', Process: 'timeline', Features: 'numbered' },
  service: { Process: 'steps', Testimonials: 'cards', LeadForm: 'booking' },
  coaching: { Testimonials: 'metric-plus-quote', Process: 'timeline', CTA: 'floating-card' },
  consulting: { Features: 'editorial-list', Testimonials: 'editorial', CTA: 'split' },
  quote: { Pricing: 'minimal', Process: 'steps', LeadForm: 'split' },
  ebook: { Features: 'minimal-list', Gallery: 'grid', LeadForm: 'inline' },
  demo: {
    Features: 'editorial-list',
    Gallery: 'grid',
    Testimonials: 'editorial',
    LeadForm: 'floating-card',
    CTA: 'banner',
    Process: 'timeline',
  },
  lead_magnet: { Features: 'icon-grid', Testimonials: 'quote-centered', LeadForm: 'compact' },
};

const FEATURES_CYCLE = [
  'editorial-list',
  'icon-grid',
  'numbered',
  'alternating',
  'image-cards',
  'minimal-list',
] as const;

const TESTIMONIALS_CYCLE = [
  'quote-centered',
  'cards',
  'editorial',
  'portrait-quotes',
  'metric-plus-quote',
] as const;

const GALLERY_CYCLE = ['editorial-mosaic', 'masonry', 'featured-plus-grid', 'grid'] as const;

/** Fine-grained per-index overrides (cross-category dedup). */
const CATEGORY_INDEX_OVERRIDES: Partial<
  Record<LandingPageCategory, Array<Partial<Record<LandingPageBlock['type'], string>>>>
> = {
  demo: [
    {},
    { Testimonials: 'editorial', Features: 'editorial-list', LeadForm: 'split', CTA: 'banner' },
    { Pricing: 'minimal', Features: 'numbered', LeadForm: 'compact', CTA: 'centered' },
    {},
    { Gallery: 'grid', Features: 'image-cards' },
    {},
    {},
    { CTA: 'split', LeadForm: 'floating-card' },
    {},
    { LeadForm: 'floating-card', Features: 'minimal-list' },
    { CTA: 'minimal', LeadForm: 'inline' },
  ],
  saas: [
    {},
    { Testimonials: 'metric-plus-quote', Features: 'icon-grid' },
    { Pricing: 'comparison', Features: 'alternating' },
    { Process: 'timeline' },
    { Gallery: 'featured-plus-grid' },
    { Process: 'steps', LeadForm: 'split' },
    { FAQ: 'accordion', CTA: 'floating-card' },
    { Pricing: 'cards', CTA: 'split' },
    { LeadForm: 'split', Process: 'steps' },
    { Features: 'minimal-list', CTA: 'minimal' },
  ],
  agency: [
    {
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
    },
    { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'split' },
    {
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
    },
    { Process: 'timeline', Features: 'numbered', CTA: 'minimal' },
    { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
    {
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
    { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'card' },
    { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'floating-card' },
    { LeadForm: 'card', Features: 'numbered', CTA: 'banner' },
    { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'minimal' },
  ],
  clinic: [
    { LeadForm: 'booking', Gallery: 'editorial-mosaic', Process: 'timeline' },
    { Guarantee: 'banner', Testimonials: 'metric-plus-quote', LeadForm: 'booking' },
    { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'booking' },
    { Process: 'timeline', Benefits: 'alternating', LeadForm: 'booking' },
    { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'booking' },
    { Hero: 'editorial-overlay', LeadForm: 'booking', FAQ: 'accordion' },
    { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'booking' },
    { Header: 'minimal', CTA: 'split', LeadForm: 'booking' },
    { LeadForm: 'booking', Features: 'numbered', CTA: 'banner' },
    { CTA: 'minimal', LeadForm: 'booking', Features: 'minimal-list' },
  ],
};

function resolveLeadFormVariant(
  strategy: CtaStrategy,
  profileHint: string | undefined,
  variantIndex: number,
): string {
  if (strategy === 'booking' || strategy === 'reserve') {
    if (
      profileHint === 'split' ||
      profileHint === 'card' ||
      profileHint === 'inline' ||
      profileHint === 'floating-card' ||
      profileHint === 'compact'
    ) {
      return profileHint;
    }
    return 'booking';
  }
  if (strategy === 'buy') {
    if (
      profileHint === 'inline' ||
      profileHint === 'compact' ||
      profileHint === 'split' ||
      profileHint === 'card' ||
      profileHint === 'floating-card'
    ) {
      return profileHint;
    }
    return 'compact';
  }
  if (strategy === 'trial' || strategy === 'demo' || strategy === 'register' || strategy === 'enroll') {
    if (profileHint === 'floating-card') return 'floating-card';
    if (profileHint === 'minimal') return 'minimal';
    if (profileHint === 'compact' || profileHint === 'inline') return profileHint;
    return 'split';
  }
  if (strategy === 'download') {
    if (
      profileHint === 'inline' ||
      profileHint === 'compact' ||
      profileHint === 'split' ||
      profileHint === 'card' ||
      profileHint === 'floating-card'
    ) {
      return profileHint;
    }
    return 'inline';
  }
  if (strategy === 'viewing') return variantIndex === 8 ? 'booking' : 'split';
  return profileHint || 'card';
}

function rotatedVariant<T extends readonly string[]>(
  cycle: T,
  variantIndex: number,
  categoryIndex: number,
): T[number] {
  return cycle[(variantIndex + categoryIndex) % cycle.length]!;
}

export type VariantPresetInput = {
  variantIndex: number;
  sectionSequence: ArchitectureSection[];
  ctaStrategy: CtaStrategy;
  heroVariant: string;
  blockVariants?: Partial<Record<LandingPageBlock['type'], string>>;
  visualComposition?: string;
};

/** Build stamped blockVariants for a category architecture variant. */
export function resolveCategoryBlockVariants(
  category: LandingPageCategory,
  arch: VariantPresetInput,
): Partial<Record<LandingPageBlock['type'], string>> {
  if (category === 'spa' && arch.blockVariants && Object.keys(arch.blockVariants).length > 2) {
    return arch.blockVariants;
  }

  const seq = new Set(arch.sectionSequence);
  const profile = { ...INDEX_VARIANT_PROFILES[arch.variantIndex] };
  const nudge = CATEGORY_BLOCK_NUDGES[category] || {};
  const catIdx = [
    'product',
    'cosmetics',
    'fashion',
    'spa',
    'real_estate',
    'seo',
    'website',
    'service',
    'course',
    'webinar',
    'coaching',
    'consulting',
    'quote',
    'ebook',
    'demo',
    'lead_magnet',
    'saas',
    'clinic',
    'restaurant',
    'agency',
  ].indexOf(category);

  if (seq.has('Features') && !profile.Features && !nudge.Features) {
    profile.Features = rotatedVariant(FEATURES_CYCLE, arch.variantIndex, Math.max(0, catIdx));
  }
  if (seq.has('Testimonials') && !profile.Testimonials && !nudge.Testimonials) {
    profile.Testimonials = rotatedVariant(TESTIMONIALS_CYCLE, arch.variantIndex, Math.max(0, catIdx));
  }
  if (seq.has('Gallery') && !profile.Gallery && !nudge.Gallery) {
    profile.Gallery = rotatedVariant(GALLERY_CYCLE, arch.variantIndex, Math.max(0, catIdx));
  }

  if (arch.visualComposition === 'gallery_heavy' && seq.has('Gallery')) {
    profile.Gallery =
      arch.variantIndex === 7 ? 'featured-plus-grid' : profile.Gallery || 'masonry';
  }
  if (arch.visualComposition === 'pricing_forward' && seq.has('Pricing')) {
    profile.Pricing = arch.variantIndex === 2 ? 'comparison' : profile.Pricing || 'cards';
  }

  const indexOverride = {
    ...(getCategoryIndexOverrides(category)?.[arch.variantIndex] || {}),
    ...(CATEGORY_INDEX_OVERRIDES[category]?.[arch.variantIndex] || {}),
  };

  const merged: Partial<Record<LandingPageBlock['type'], string>> = {
    ...profile,
    ...nudge,
    ...indexOverride,
    ...(arch.blockVariants || {}),
  };

  merged.Hero =
    arch.blockVariants?.Hero ||
    resolveBlockVariant('Hero', mapLegacyHeroVariant(arch.heroVariant as never));

  if (seq.has('LeadForm')) {
    merged.LeadForm = resolveLeadFormVariant(
      arch.ctaStrategy,
      merged.LeadForm,
      arch.variantIndex,
    );
  }

  const result: Partial<Record<LandingPageBlock['type'], string>> = {};
  for (const [block, variant] of Object.entries(merged)) {
    const t = block as LandingPageBlock['type'];
    if (t === 'Hero' || seq.has(t as ArchitectureSection)) {
      result[t] = resolveBlockVariant(t, variant);
    }
  }

  return result;
}
