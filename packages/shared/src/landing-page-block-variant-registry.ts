/**
 * Block Variant Registry — contract against fake diversity.
 * `hasRendererImplementation: true` only when LandingPageRenderer has a distinct DOM/composition branch.
 * Phase 2: Pricing/Testimonials/CTA/LeadForm/Process/Gallery/Features structural shells.
 */

import type { LandingPageBlockType } from './landing-page-types';

export type BlockVariantDefinition = {
  id: string;
  blockType: LandingPageBlockType;
  label: string;
  structuralDescription: string;
  hasRendererImplementation: boolean;
};

export const BLOCK_VARIANT_REGISTRY: Partial<Record<LandingPageBlockType, BlockVariantDefinition[]>> = {
  Hero: [
    {
      id: 'centered',
      blockType: 'Hero',
      label: 'Centered',
      structuralDescription: 'Centered copy column; optional visual below',
      hasRendererImplementation: true,
    },
    {
      id: 'split-left',
      blockType: 'Hero',
      label: 'Split left',
      structuralDescription: '2-col grid copy | visual',
      hasRendererImplementation: true,
    },
    {
      id: 'split-right',
      blockType: 'Hero',
      label: 'Split right',
      structuralDescription: '2-col grid visual | copy (reversed)',
      hasRendererImplementation: true,
    },
    {
      id: 'editorial-overlay',
      blockType: 'Hero',
      label: 'Editorial overlay',
      structuralDescription: 'Full-bleed bg + overlay copy layer',
      hasRendererImplementation: true,
    },
    {
      id: 'fullscreen-image',
      blockType: 'Hero',
      label: 'Fullscreen image',
      structuralDescription: 'Visual-first then centered copy',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal-copy',
      blockType: 'Hero',
      label: 'Minimal copy',
      structuralDescription: 'Centered shell; trust strip hidden',
      hasRendererImplementation: true,
    },
    {
      id: 'floating-card',
      blockType: 'Hero',
      label: 'Floating card',
      structuralDescription: 'Optional 3-col with embedded LeadForm card',
      hasRendererImplementation: true,
    },
  ],
  Pricing: [
    {
      id: 'cards',
      blockType: 'Pricing',
      label: 'Cards',
      structuralDescription: 'Responsive card grid of plans',
      hasRendererImplementation: true,
    },
    {
      id: 'comparison',
      blockType: 'Pricing',
      label: 'Comparison table',
      structuralDescription: 'Feature rows × plan columns table',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal',
      blockType: 'Pricing',
      label: 'Minimal single',
      structuralDescription: 'Stacked single-column plans without card chrome',
      hasRendererImplementation: true,
    },
    {
      id: 'default',
      blockType: 'Pricing',
      label: 'Default',
      structuralDescription: 'Alias of cards',
      hasRendererImplementation: true,
    },
  ],
  Testimonials: [
    {
      id: 'cards',
      blockType: 'Testimonials',
      label: 'Cards',
      structuralDescription: '3-col card grid of quotes',
      hasRendererImplementation: true,
    },
    {
      id: 'quote-centered',
      blockType: 'Testimonials',
      label: 'Quote centered',
      structuralDescription: 'Single-column featured quote stack',
      hasRendererImplementation: true,
    },
    {
      id: 'editorial',
      blockType: 'Testimonials',
      label: 'Editorial',
      structuralDescription: 'Border-left pull-quotes in 2-col stack',
      hasRendererImplementation: true,
    },
    {
      id: 'portrait-quotes',
      blockType: 'Testimonials',
      label: 'Portrait quotes',
      structuralDescription: 'Portrait media + quote row (flex DOM)',
      hasRendererImplementation: true,
    },
    {
      id: 'metric-plus-quote',
      blockType: 'Testimonials',
      label: 'Metric + quote',
      structuralDescription: 'Metric node above each quote',
      hasRendererImplementation: true,
    },
  ],
  Gallery: [
    {
      id: 'grid',
      blockType: 'Gallery',
      label: 'Grid',
      structuralDescription: 'Uniform image grid',
      hasRendererImplementation: true,
    },
    {
      id: 'masonry',
      blockType: 'Gallery',
      label: 'Masonry',
      structuralDescription: 'CSS multi-column masonry',
      hasRendererImplementation: true,
    },
    {
      id: 'editorial-mosaic',
      blockType: 'Gallery',
      label: 'Editorial mosaic',
      structuralDescription: 'Asymmetric grid; first cell spans 2 rows',
      hasRendererImplementation: true,
    },
    {
      id: 'featured-plus-grid',
      blockType: 'Gallery',
      label: 'Featured + grid',
      structuralDescription: 'Featured figure DOM + remaining grid',
      hasRendererImplementation: true,
    },
  ],
  Features: [
    {
      id: 'icon-grid',
      blockType: 'Features',
      label: 'Icon grid',
      structuralDescription: 'Icon bubble + title/desc cards',
      hasRendererImplementation: true,
    },
    {
      id: 'image-cards',
      blockType: 'Features',
      label: 'Image cards',
      structuralDescription: 'Image-first cards',
      hasRendererImplementation: true,
    },
    {
      id: 'alternating',
      blockType: 'Features',
      label: 'Alternating',
      structuralDescription: 'Full-width media|copy rows with reverse',
      hasRendererImplementation: true,
    },
    {
      id: 'editorial-list',
      blockType: 'Features',
      label: 'Editorial list',
      structuralDescription: 'Border list, no card chrome',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal-list',
      blockType: 'Features',
      label: 'Minimal list',
      structuralDescription: 'Compact border list',
      hasRendererImplementation: true,
    },
    {
      id: 'numbered',
      blockType: 'Features',
      label: 'Numbered',
      structuralDescription: 'Number badges in list/process shell',
      hasRendererImplementation: true,
    },
  ],
  Benefits: [
    {
      id: 'icon-grid',
      blockType: 'Benefits',
      label: 'Icon grid',
      structuralDescription: 'Icon bubble cards',
      hasRendererImplementation: true,
    },
    {
      id: 'alternating',
      blockType: 'Benefits',
      label: 'Alternating',
      structuralDescription: 'Media|copy alternating rows',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal-list',
      blockType: 'Benefits',
      label: 'Minimal list',
      structuralDescription: 'Border list',
      hasRendererImplementation: true,
    },
  ],
  Process: [
    {
      id: 'steps',
      blockType: 'Process',
      label: 'Steps',
      structuralDescription: 'Horizontal numbered steps with connector',
      hasRendererImplementation: true,
    },
    {
      id: 'timeline',
      blockType: 'Process',
      label: 'Timeline',
      structuralDescription: 'Vertical timeline with spine + nodes',
      hasRendererImplementation: true,
    },
    {
      id: 'default',
      blockType: 'Process',
      label: 'Default cards',
      structuralDescription: 'Generic list cards',
      hasRendererImplementation: true,
    },
  ],
  CTA: [
    {
      id: 'default',
      blockType: 'CTA',
      label: 'Default band',
      structuralDescription: 'Gradient band row text + button',
      hasRendererImplementation: true,
    },
    {
      id: 'centered',
      blockType: 'CTA',
      label: 'Centered',
      structuralDescription: 'Column-centered band',
      hasRendererImplementation: true,
    },
    {
      id: 'split',
      blockType: 'CTA',
      label: 'Split',
      structuralDescription: '2-col: copy | action panel',
      hasRendererImplementation: true,
    },
    {
      id: 'banner',
      blockType: 'CTA',
      label: 'Banner',
      structuralDescription: 'Full-bleed band, no radius',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal',
      blockType: 'CTA',
      label: 'Minimal',
      structuralDescription: 'Surface bordered band',
      hasRendererImplementation: true,
    },
    {
      id: 'image-background',
      blockType: 'CTA',
      label: 'Image background',
      structuralDescription: 'Band with cover image background',
      hasRendererImplementation: true,
    },
    {
      id: 'floating-card',
      blockType: 'CTA',
      label: 'Floating card',
      structuralDescription: 'Section surface + elevated inner card',
      hasRendererImplementation: true,
    },
  ],
  LeadForm: [
    {
      id: 'default',
      blockType: 'LeadForm',
      label: 'Default card',
      structuralDescription: 'Centered form card',
      hasRendererImplementation: true,
    },
    {
      id: 'card',
      blockType: 'LeadForm',
      label: 'Card',
      structuralDescription: 'Centered form card',
      hasRendererImplementation: true,
    },
    {
      id: 'compact',
      blockType: 'LeadForm',
      label: 'Compact',
      structuralDescription: 'Compact field density',
      hasRendererImplementation: true,
    },
    {
      id: 'inline',
      blockType: 'LeadForm',
      label: 'Inline',
      structuralDescription: 'Borderless inline form',
      hasRendererImplementation: true,
    },
    {
      id: 'split',
      blockType: 'LeadForm',
      label: 'Split',
      structuralDescription: '2-col copy | form',
      hasRendererImplementation: true,
    },
    {
      id: 'booking',
      blockType: 'LeadForm',
      label: 'Booking',
      structuralDescription: 'Booking header strip + form body',
      hasRendererImplementation: true,
    },
    {
      id: 'minimal',
      blockType: 'LeadForm',
      label: 'Minimal',
      structuralDescription: 'Light bordered form',
      hasRendererImplementation: true,
    },
    {
      id: 'floating-card',
      blockType: 'LeadForm',
      label: 'Floating card',
      structuralDescription: 'Elevated floating form card',
      hasRendererImplementation: true,
    },
  ],
};

/** True when every major Phase-2 block type has ≥1 real structural implementation. */
export function phase2StructuralVariantsReady(): boolean {
  const types: LandingPageBlockType[] = [
    'Pricing',
    'Testimonials',
    'Gallery',
    'Features',
    'Process',
    'CTA',
    'LeadForm',
  ];
  return types.every((t) =>
    (BLOCK_VARIANT_REGISTRY[t] || []).some((v) => v.hasRendererImplementation),
  );
}
