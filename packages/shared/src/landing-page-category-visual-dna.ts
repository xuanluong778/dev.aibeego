/**
 * Per-category visual DNA — palettes, imagery, design families, index overrides.
 * Data-driven visual differentiation for catalog expand (no slug hardcoding).
 */

import type { LandingPageBlock, LandingPageCategory } from './landing-page-types';
import type { LandingPageThemeTokens } from './landing-page-types';
import type { LandingPageDesignFamily } from './landing-page-template-foundation';
import { getVerifiedBackdropPhotoIds } from './landing-page-verified-backdrops';
type ArchitectureVariantLike = { designFamily: LandingPageDesignFamily; variantIndex: number };

type PaletteSlot = {
  mode: 'light' | 'dark';
  primary: string;
  secondary?: string;
  background?: string;
  canvas?: string;
  fontFamily?: string;
  density?: LandingPageThemeTokens['density'];
  buttonStyle?: LandingPageThemeTokens['buttonStyle'];
  imageTreatment?: LandingPageThemeTokens['imageTreatment'];
  fontWeightHeading?: number;
  fontSizeHero?: string;
  gradient?: string | 'auto' | 'none';
  radius?: string;
};

function buildPalette(slot: PaletteSlot): Partial<LandingPageThemeTokens> {
  const secondary = slot.secondary || (slot.mode === 'dark' ? '#F8FAFC' : '#0F172A');
  const muted = slot.mode === 'dark' ? '#94A3B8' : '#64748B';
  const text = slot.mode === 'dark' ? '#F8FAFC' : secondary;

  if (slot.mode === 'dark') {
    const canvas = '#0B1220';
    const surface = '#111827';
    const surfaceAlt = '#1E293B';
    const gradient =
      slot.gradient === 'none'
        ? 'none'
        : slot.gradient === 'auto' || !slot.gradient
          ? `linear-gradient(145deg, ${canvas} 0%, ${surfaceAlt} 55%, ${surface} 100%)`
          : slot.gradient;
    return {
      primary: slot.primary,
      secondary,
      background: canvas,
      canvas,
      surface,
      surfaceAlt,
      text,
      muted,
      gradient,
      fontFamily: slot.fontFamily,
      density: slot.density,
      buttonStyle: slot.buttonStyle,
      imageTreatment: slot.imageTreatment,
      fontWeightHeading: slot.fontWeightHeading,
      fontSizeHero: slot.fontSizeHero,
      radius: slot.radius,
    };
  }

  const canvas = slot.canvas || '#F8FAFC';
  const surface = slot.background || '#FFFFFF';
  const surfaceAlt = '#F1F5F9';
  const gradient =
    slot.gradient === 'none'
      ? 'none'
      : slot.gradient === 'auto' || !slot.gradient
        ? `linear-gradient(160deg, ${surfaceAlt} 0%, ${surface} 45%, ${canvas} 100%)`
        : slot.gradient;

  return {
    primary: slot.primary,
    secondary,
    background: surface,
    canvas,
    surface,
    surfaceAlt,
    text,
    muted,
    gradient,
    fontFamily: slot.fontFamily,
    density: slot.density,
    buttonStyle: slot.buttonStyle,
    imageTreatment: slot.imageTreatment,
    fontWeightHeading: slot.fontWeightHeading,
    fontSizeHero: slot.fontSizeHero,
    radius: slot.radius,
  };
}

function palettes(slots: PaletteSlot[]): Partial<LandingPageThemeTokens>[] {
  return slots.map(buildPalette);
}

type CategoryVisualDna = {
  palettes: Partial<LandingPageThemeTokens>[];
  images: string[];
  designFamilies: LandingPageDesignFamily[];
  indexOverrides: Array<Partial<Record<LandingPageBlock['type'], string>>>;
};

/** Agency-style index override grid — leadForm tuned per conversion flow. */
function richIndexOverrides(
  leadForm: string,
  extras?: Partial<Record<LandingPageBlock['type'], string>>,
): Array<Partial<Record<LandingPageBlock['type'], string>>> {
  const lf = leadForm;
  return [
    { Hero: 'editorial-overlay', LeadForm: lf, Features: 'editorial-list', CTA: 'split', ...extras },
    { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: lf, Features: 'icon-grid' },
    { Pricing: 'comparison', FAQ: 'two-column', LeadForm: lf, CTA: 'banner' },
    { Process: 'timeline', Features: 'numbered', LeadForm: lf, CTA: 'minimal' },
    { Gallery: 'masonry', CTA: 'image-background', LeadForm: lf === 'booking' ? 'booking' : 'inline' },
    { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: lf, CTA: 'split' },
    { FAQ: 'accordion', Guarantee: 'banner', LeadForm: lf },
    { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: lf === 'card' ? 'floating-card' : lf },
    { LeadForm: lf, Features: 'numbered', CTA: 'banner' },
    { Features: 'minimal-list', CTA: 'minimal', LeadForm: lf === 'split' ? 'minimal' : lf },
  ];
}

const CATEGORY_VISUAL_DNA: Partial<Record<LandingPageCategory, CategoryVisualDna>> = {
  seo: {
    palettes: palettes([
      { mode: 'dark', primary: '#22C55E', secondary: '#ECFDF5', density: 'spacious', imageTreatment: 'product-flat', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E3A8A', density: 'comfortable', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#059669', secondary: '#064E3B', canvas: '#F0FDF4', background: '#F0FDF4', density: 'compact', fontWeightHeading: 800 },
      { mode: 'light', primary: '#0F172A', secondary: '#334155', buttonStyle: 'outline', density: 'compact', gradient: 'none' },
      { mode: 'dark', primary: '#10B981', density: 'spacious', imageTreatment: 'editorial', fontWeightHeading: 800 },
      { mode: 'light', primary: '#7C3AED', secondary: '#4C1D95', density: 'comfortable' },
      { mode: 'light', primary: '#0369A1', secondary: '#0C4A6E', density: 'spacious', imageTreatment: 'photo-real' },
      { mode: 'dark', primary: '#3B82F6', density: 'comfortable', fontFamily: '"Manrope", sans-serif' },
      { mode: 'light', primary: '#EA580C', secondary: '#9A3412', density: 'compact', fontWeightHeading: 900 },
      { mode: 'light', primary: '#171717', secondary: '#525252', buttonStyle: 'outline', fontSizeHero: 'clamp(1.85rem, 3.8vw, 2.85rem)', gradient: 'none' },
    ]),
    images: [
      'photo-1460925895917-afdab827c52f',
      'photo-1551288049-bebda4e38f71',
      'photo-1553877522-43269d4ea984',
      'photo-1504868584819-f8e8b4b6d7e3',
      'photo-1556761175-5973dc0f32e7',
      'photo-1542744173-8e7e53415bb0',
    ],
    designFamilies: ['corporate', 'conversion', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('card'),
  },

  website: {
    palettes: palettes([
      { mode: 'dark', primary: '#6366F1', density: 'spacious', imageTreatment: 'editorial', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', density: 'comfortable', fontFamily: '"Manrope", sans-serif' },
      { mode: 'light', primary: '#DB2777', secondary: '#831843', density: 'compact', fontWeightHeading: 900 },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none', density: 'compact' },
      { mode: 'dark', primary: '#F97316', imageTreatment: 'editorial', fontWeightHeading: 800 },
      { mode: 'light', primary: '#7C3AED', secondary: '#5B21B6', density: 'spacious' },
      { mode: 'light', primary: '#0891B2', secondary: '#164E63', imageTreatment: 'product-flat' },
      { mode: 'dark', primary: '#38BDF8', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#E11D48', secondary: '#881337', density: 'compact' },
      { mode: 'light', primary: '#404040', buttonStyle: 'outline', fontSizeHero: 'clamp(1.9rem, 4vw, 2.9rem)', gradient: 'none' },
    ]),
    images: [
      'photo-1498050108023-c5249f4df085',
      'photo-1467236648965-937a688b4365',
      'photo-1507238691740-187a5b1d37b8',
      'photo-1555066931-4365d14bab8c',
      'photo-1517694712202-14dd9538aa97',
      'photo-1547658719-da2b51169166',
    ],
    designFamilies: ['portfolio', 'corporate', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'portfolio', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('split'),
  },

  service: {
    palettes: palettes([
      { mode: 'light', primary: '#0D9488', secondary: '#134E4A', density: 'comfortable', imageTreatment: 'photo-real', fontFamily: '"Manrope", sans-serif', radius: '14px' },
      { mode: 'light', primary: '#0284C7', secondary: '#0C4A6E', density: 'spacious' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E3A8A', density: 'comfortable' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none', density: 'compact' },
      { mode: 'dark', primary: '#14B8A6', imageTreatment: 'photo-real' },
      { mode: 'light', primary: '#EA580C', secondary: '#9A3412', fontWeightHeading: 800 },
      { mode: 'light', primary: '#059669', secondary: '#065F46', density: 'spacious' },
      { mode: 'dark', primary: '#38BDF8', density: 'comfortable' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', density: 'compact' },
      { mode: 'light', primary: '#475569', buttonStyle: 'outline', fontSizeHero: 'clamp(1.85rem, 3.8vw, 2.85rem)' },
    ]),
    images: [
      'photo-1581578731548-c64695cc6952',
      'photo-1621905252507-b35492cc74b4',
      'photo-1504307651254-35680f356dfd',
      'photo-1503387762-592deb58ef4e',
      'photo-1504917595217-d4dc5ebe6122',
      'photo-1454165804606-c3d57bc86b40',
    ],
    designFamilies: ['local', 'corporate', 'conversion', 'minimal', 'portfolio', 'conversion', 'corporate', 'local', 'conversion', 'editorial'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'booking', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'split', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'booking', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'booking' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'booking', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  course: {
    palettes: palettes([
      { mode: 'light', primary: '#7C3AED', secondary: '#5B21B6', density: 'spacious', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', density: 'comfortable' },
      { mode: 'light', primary: '#EA580C', secondary: '#C2410C', fontWeightHeading: 900 },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#A78BFA', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#0891B2', secondary: '#155E75' },
      { mode: 'light', primary: '#059669', secondary: '#047857', density: 'spacious' },
      { mode: 'dark', primary: '#F97316', fontWeightHeading: 800 },
      { mode: 'light', primary: '#DB2777', secondary: '#9D174D' },
      { mode: 'light', primary: '#404040', buttonStyle: 'outline', fontSizeHero: 'clamp(1.9rem, 4vw, 2.9rem)' },
    ]),
    images: [
      'photo-1524178232363-1fb2b075b655',
      'photo-1434030216411-0b793f4b4173',
      'photo-1503676260728-1c00da094a0b',
      'photo-1522202176988-66273c2fd55f',
      'photo-1516321318423-f06f85e504b3',
      'photo-1523240795612-9a054b0db644',
    ],
    designFamilies: ['conversion', 'corporate', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('split'),
  },

  webinar: {
    palettes: palettes([
      { mode: 'dark', primary: '#EF4444', density: 'spacious', fontWeightHeading: 800 },
      { mode: 'light', primary: '#2563EB', secondary: '#1E3A8A', density: 'comfortable' },
      { mode: 'light', primary: '#7C3AED', secondary: '#5B21B6' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#F97316', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', fontWeightHeading: 900 },
      { mode: 'light', primary: '#0891B2', secondary: '#0E7490' },
      { mode: 'dark', primary: '#6366F1', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#EA580C', secondary: '#9A3412' },
      { mode: 'light', primary: '#525252', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1540575467063-178a50c2df87',
      'photo-1475721027880-d021e0fec107',
      'photo-1505373877841-8d25f7d46678',
      'photo-1591115765373-5207764f72e7',
      'photo-1511578314322-379afb476865',
      'photo-1505373877841-8d25f7d46678',
    ],
    designFamilies: ['conversion', 'corporate', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('compact'),
  },

  coaching: {
    palettes: palettes([
      { mode: 'light', primary: '#EA580C', secondary: '#9A3412', density: 'spacious', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#059669', secondary: '#065F46', imageTreatment: 'photo-real' },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#F97316', fontWeightHeading: 800 },
      { mode: 'light', primary: '#0284C7', secondary: '#0369A1' },
      { mode: 'light', primary: '#DB2777', secondary: '#BE185D', density: 'comfortable' },
      { mode: 'dark', primary: '#34D399', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#CA8A04', secondary: '#854D0E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#44403C', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1571019614242-c5c5dee9f50b',
      'photo-1518611012118-696072aa579a',
      'photo-1544367567-0f2fcb009e0b',
      'photo-1517836357463-d25dfeac3438',
      'photo-1506126613408-eca07ce68773',
      'photo-1518611012118-696072aa579a',
    ],
    designFamilies: ['conversion', 'local', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('split'),
  },

  consulting: {
    palettes: palettes([
      { mode: 'dark', primary: '#D97706', secondary: '#FEF3C7', density: 'spacious', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#1E3A8A', secondary: '#1E40AF', density: 'comfortable', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#0F766E', secondary: '#134E4A' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#F59E0B', fontWeightHeading: 800 },
      { mode: 'light', primary: '#4338CA', secondary: '#3730A3' },
      { mode: 'light', primary: '#0369A1', secondary: '#075985' },
      { mode: 'dark', primary: '#60A5FA', density: 'comfortable' },
      { mode: 'light', primary: '#B45309', secondary: '#92400E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#334155', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1556761175-b413da4baf72',
      'photo-1553877522-43269d4ea984',
      'photo-1600880292203-757bb62b4baf',
      'photo-1552664730-d307ca884978',
      'photo-1522071820081-009f0129c71c',
      'photo-1556761175-5973dc0f32e7',
    ],
    designFamilies: ['corporate', 'corporate', 'conversion', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('split'),
  },

  quote: {
    palettes: palettes([
      { mode: 'light', primary: '#EA580C', secondary: '#9A3412', density: 'comfortable', fontWeightHeading: 800 },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#FB923C', imageTreatment: 'photo-real' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B' },
      { mode: 'light', primary: '#0284C7', secondary: '#0369A1' },
      { mode: 'dark', primary: '#38BDF8' },
      { mode: 'light', primary: '#CA8A04', secondary: '#A16207' },
      { mode: 'light', primary: '#57534E', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1504307651254-35680f356dfd',
      'photo-1503387762-592deb58ef4e',
      'photo-1581094794399-8440e7c2f1f1',
      'photo-1504917595217-d4dc5ebe6122',
      'photo-1581578731548-c64695cc6952',
      'photo-1503387762-592deb58ef4e',
    ],
    designFamilies: ['conversion', 'corporate', 'bold', 'minimal', 'local', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('split'),
  },

  ebook: {
    palettes: palettes([
      { mode: 'light', primary: '#059669', secondary: '#065F46', fontFamily: '"Fraunces", serif', density: 'spacious' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', density: 'comfortable' },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#34D399', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#DB2777', secondary: '#BE185D' },
      { mode: 'light', primary: '#0891B2', secondary: '#0E7490' },
      { mode: 'dark', primary: '#A78BFA' },
      { mode: 'light', primary: '#CA8A04', secondary: '#854D0E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#44403C', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1512820790804-4153f7372b4c',
      'photo-1481627834876-b7833e8f5570',
      'photo-1456513080510-7bf3a84b82f8',
      'photo-1507003211169-0a1dd7228f2d',
      'photo-1497633762265-9d179a990aa6',
      'photo-1524995992477-879a36b4ae91',
    ],
    designFamilies: ['editorial', 'conversion', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'minimal'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'inline', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'compact', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'split', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'compact' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'inline', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  demo: {
    palettes: palettes([
      { mode: 'dark', primary: '#6366F1', density: 'spacious', fontFamily: '"IBM Plex Sans", sans-serif' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', density: 'comfortable' },
      { mode: 'light', primary: '#7C3AED', secondary: '#5B21B6', fontWeightHeading: 900 },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#8B5CF6', imageTreatment: 'product-flat' },
      { mode: 'light', primary: '#0891B2', secondary: '#155E75' },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'dark', primary: '#38BDF8' },
      { mode: 'light', primary: '#EA580C', secondary: '#C2410C' },
      { mode: 'light', primary: '#475569', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1551434678-e076c223a692d',
      'photo-1553877522-43269d4ea984',
      'photo-1460925895917-afdab827c52f',
      'photo-1551288049-bebda4e38f71',
      'photo-1519389950473-47ba0277781c',
      'photo-1498050108023-c5249f4df085',
    ],
    designFamilies: ['conversion', 'corporate', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('floating-card'),
  },

  lead_magnet: {
    palettes: palettes([
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', fontWeightHeading: 900, density: 'compact' },
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', density: 'comfortable' },
      { mode: 'light', primary: '#EA580C', secondary: '#C2410C' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#F97316', fontWeightHeading: 800 },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'dark', primary: '#EF4444' },
      { mode: 'light', primary: '#DB2777', secondary: '#BE185D' },
      { mode: 'light', primary: '#525252', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1556761175-5973dc0f32e7',
      'photo-1553877522-43269d4ea984',
      'photo-1454165804606-c3d57bc86b40',
      'photo-1504868584819-f8e8b4b6d7e3',
      'photo-1522071820081-009f0129c71c',
      'photo-1552664730-d307ca884978',
    ],
    designFamilies: ['conversion', 'corporate', 'bold', 'minimal', 'portfolio', 'conversion', 'corporate', 'conversion', 'conversion', 'minimal'],
    indexOverrides: richIndexOverrides('compact'),
  },

  product: {
    palettes: palettes([
      { mode: 'light', primary: '#2563EB', secondary: '#1E40AF', imageTreatment: 'product-flat', density: 'comfortable' },
      { mode: 'light', primary: '#0F172A', secondary: '#334155', buttonStyle: 'outline' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', fontWeightHeading: 900 },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'dark', primary: '#F97316', imageTreatment: 'product-flat' },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'light', primary: '#0891B2', secondary: '#0E7490' },
      { mode: 'dark', primary: '#38BDF8' },
      { mode: 'light', primary: '#DB2777', secondary: '#BE185D' },
      { mode: 'light', primary: '#404040', buttonStyle: 'outline', fontSizeHero: 'clamp(1.9rem, 4vw, 2.9rem)' },
    ]),
    images: [
      'photo-1523275335684-37898b6baf30',
      'photo-1505740420928-5e56006be30d',
      'photo-1572635196237-14b3f281503f',
      'photo-1560343090-f0409e92796a',
      'photo-1526170375885-4d8ecf77b99f',
      'photo-1491553895911-67a25a47a089',
    ],
    designFamilies: ['product', 'minimal', 'bold', 'conversion', 'portfolio', 'conversion', 'corporate', 'product', 'conversion', 'editorial'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'inline', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'compact', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'split', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'compact' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'inline', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  cosmetics: {
    palettes: palettes([
      { mode: 'light', primary: '#DB2777', secondary: '#9D174D', density: 'spacious', fontFamily: '"Fraunces", serif', radius: '14px' },
      { mode: 'light', primary: '#BE185D', secondary: '#831843', imageTreatment: 'editorial' },
      { mode: 'dark', primary: '#F472B6', fontWeightHeading: 800 },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#D97706', secondary: '#FEF3C7', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'light', primary: '#0891B2', secondary: '#155E75', density: 'comfortable' },
      { mode: 'dark', primary: '#EC4899' },
      { mode: 'light', primary: '#CA8A04', secondary: '#A16207', fontWeightHeading: 900 },
      { mode: 'light', primary: '#44403C', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1596462502278-27bfdc403348',
      'photo-1522335789203-aabd1fc54bc9',
      'photo-1570172619644-dfd03ed75981',
      'photo-1512496015851-a90fb38ba796',
      'photo-1487412947417-5cebf100ffc2',
      'photo-1596755389378-c179efa9a2c0',
    ],
    designFamilies: ['luxury', 'organic', 'bold', 'minimal', 'portfolio', 'conversion', 'luxury', 'organic', 'conversion', 'editorial'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'inline', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'compact', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'split', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'compact' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'inline', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  fashion: {
    palettes: palettes([
      { mode: 'dark', primary: '#FAFAF9', secondary: '#FAFAF9', density: 'spacious', imageTreatment: 'editorial', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#0F172A', secondary: '#171717', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', fontWeightHeading: 900 },
      { mode: 'light', primary: '#78716C', secondary: '#44403C', density: 'compact' },
      { mode: 'dark', primary: '#E11D48', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#7C3AED', secondary: '#5B21B6' },
      { mode: 'light', primary: '#0891B2', secondary: '#0E7490' },
      { mode: 'dark', primary: '#F5F5F4' },
      { mode: 'light', primary: '#CA8A04', secondary: '#854D0E' },
      { mode: 'light', primary: '#A8A29E', buttonStyle: 'outline', fontSizeHero: 'clamp(2rem, 4.5vw, 3.2rem)' },
    ]),
    images: [
      'photo-1483985988355-763728e3685b',
      'photo-1469334031218-e382a71b716b',
      'photo-1490481651871-ab68de25d43d',
      'photo-1515886657613-9f3515b0c78f',
      'photo-1539109136882-3baa02d2a4f6',
      'photo-1558618666-fcd25c85cd64',
    ],
    designFamilies: ['luxury', 'minimal', 'bold', 'editorial', 'portfolio', 'conversion', 'luxury', 'product', 'conversion', 'editorial'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'inline', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'compact', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'split', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'compact' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'inline', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  restaurant: {
    palettes: palettes([
      { mode: 'dark', primary: '#D97706', secondary: '#FEF3C7', density: 'spacious', fontFamily: '"Fraunces", serif', imageTreatment: 'photo-real' },
      { mode: 'light', primary: '#DC2626', secondary: '#991B1B', density: 'comfortable' },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#EA580C', fontWeightHeading: 800 },
      { mode: 'light', primary: '#B45309', secondary: '#92400E' },
      { mode: 'light', primary: '#7C2D12', secondary: '#431407', density: 'spacious' },
      { mode: 'dark', primary: '#FB923C' },
      { mode: 'light', primary: '#CA8A04', secondary: '#854D0E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#57534E', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1517248135467-4c7edcad34c4',
      'photo-1414235077428-338989a2e8c0',
      'photo-1555396273-367ea4eb4db5',
      'photo-1559339352-11d035aa65de',
      'photo-1424847651672-bf1950a495fa',
      'photo-1550966841-3eeb8c938e7b',
    ],
    designFamilies: ['luxury', 'local', 'conversion', 'minimal', 'portfolio', 'conversion', 'organic', 'local', 'conversion', 'editorial'],
    indexOverrides: [
      { Hero: 'editorial-overlay', LeadForm: 'booking', Features: 'editorial-list', CTA: 'split' },
      { Testimonials: 'portrait-quotes', Guarantee: 'banner', LeadForm: 'split', Features: 'icon-grid' },
      { Pricing: 'comparison', FAQ: 'two-column', LeadForm: 'booking', CTA: 'banner' },
      { Process: 'timeline', Features: 'numbered', LeadForm: 'card', CTA: 'minimal' },
      { Gallery: 'masonry', CTA: 'image-background', LeadForm: 'inline' },
      { Hero: 'editorial-overlay', Features: 'alternating', LeadForm: 'floating-card', CTA: 'split' },
      { FAQ: 'accordion', Guarantee: 'banner', LeadForm: 'booking' },
      { Header: 'minimal', Footer: 'columns', CTA: 'split', LeadForm: 'split' },
      { LeadForm: 'booking', Features: 'numbered', CTA: 'banner' },
      { Features: 'minimal-list', CTA: 'minimal', LeadForm: 'card' },
    ],
  },

  real_estate: {
    palettes: palettes([
      { mode: 'dark', primary: '#D97706', secondary: '#FEF3C7', density: 'spacious', fontFamily: '"Fraunces", serif' },
      { mode: 'light', primary: '#1E3A8A', secondary: '#1E40AF', density: 'comfortable', fontFamily: '"Manrope", sans-serif' },
      { mode: 'light', primary: '#059669', secondary: '#047857' },
      { mode: 'light', primary: '#0F172A', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'dark', primary: '#F59E0B', imageTreatment: 'editorial', fontWeightHeading: 800 },
      { mode: 'light', primary: '#0284C7', secondary: '#0369A1' },
      { mode: 'light', primary: '#7C3AED', secondary: '#6D28D9' },
      { mode: 'dark', primary: '#60A5FA' },
      { mode: 'light', primary: '#B45309', secondary: '#92400E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#44403C', buttonStyle: 'outline' },
    ]),
    images: [
      'photo-1600596542815-ffad4c1539a9',
      'photo-1600585154340-be6161a56a0c',
      'photo-1600607687939-ce8a6c25118c',
      'photo-1600566753190-17f0baa2a6c3',
      'photo-1564013799919-ab600027ffc6',
      'photo-1605276374104-de6862b9b645',
    ],
    designFamilies: ['luxury', 'local', 'conversion', 'minimal', 'portfolio', 'conversion', 'corporate', 'local', 'conversion', 'editorial'],
    indexOverrides: richIndexOverrides('booking'),
  },

  spa: {
    palettes: palettes([
      { mode: 'light', primary: '#0D9488', secondary: '#134E4A', density: 'spacious', fontFamily: '"Fraunces", serif', radius: '14px', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#A8A29E', secondary: '#57534E', density: 'comfortable', buttonStyle: 'outline', gradient: 'none' },
      { mode: 'light', primary: '#0284C7', secondary: '#0C4A6E', imageTreatment: 'photo-real' },
      { mode: 'dark', primary: '#D97706', secondary: '#FEF3C7', fontWeightHeading: 800, imageTreatment: 'editorial' },
      { mode: 'light', primary: '#059669', secondary: '#065F46', density: 'spacious' },
      { mode: 'dark', primary: '#14B8A6', imageTreatment: 'editorial' },
      { mode: 'light', primary: '#BE185D', secondary: '#9D174D' },
      { mode: 'dark', primary: '#F472B6' },
      { mode: 'light', primary: '#CA8A04', secondary: '#854D0E', fontWeightHeading: 900 },
      { mode: 'light', primary: '#44403C', buttonStyle: 'outline', fontSizeHero: 'clamp(2rem, 4.5vw, 3.2rem)' },
    ]),
    images: [
      'photo-1540555700478-4be289fbecef',
      'photo-1600334089648-b0d9d2788b70',
      'photo-1544161515-4ab6ce5db272',
      'photo-1519823551278-64b927cf2421',
      'photo-1515377902423-a895c1b77c27',
      'photo-1610639535210-6dbd866d5c67',
    ],
    designFamilies: ['luxury', 'minimal', 'corporate', 'bold', 'organic', 'conversion', 'portfolio', 'local', 'editorial', 'corporate'],
    indexOverrides: richIndexOverrides('booking'),
  },
};

/** Categories with Batch 1 hand-tuned palettes (keep in design-tokens). */
export const VISUAL_DNA_BATCH1_CATEGORIES = new Set<LandingPageCategory>(['agency', 'clinic', 'saas']);

/** Hand-authored designFamily — do not overwrite via DNA stamp. */
const SKIP_DESIGN_FAMILY_STAMP = new Set<LandingPageCategory>([
  ...VISUAL_DNA_BATCH1_CATEGORIES,
  'spa',
]);

export function getCategoryVisualPalette(
  category: LandingPageCategory | string,
  variantIndex: number,
): Partial<LandingPageThemeTokens> {
  const dna = CATEGORY_VISUAL_DNA[category as LandingPageCategory];
  if (!dna?.palettes.length) return {};
  return dna.palettes[variantIndex % dna.palettes.length] || {};
}

export function getCategoryBackdropImages(category: LandingPageCategory | string): string[] {
  return [...getVerifiedBackdropPhotoIds(category)];
}

export function getCategoryIndexOverrides(
  category: LandingPageCategory,
): Array<Partial<Record<LandingPageBlock['type'], string>>> | undefined {
  return CATEGORY_VISUAL_DNA[category]?.indexOverrides;
}

export function getCategoryDesignFamily(
  category: LandingPageCategory | string,
  variantIndex: number,
): LandingPageDesignFamily | undefined {
  const dna = CATEGORY_VISUAL_DNA[category as LandingPageCategory];
  return dna?.designFamilies[variantIndex % (dna.designFamilies.length || 1)];
}

/** Stamp designFamily from DNA on architectures that lack explicit family. */
export function stampArchitecturesFromVisualDna(
  architectures: Record<string, ArchitectureVariantLike[]>,
): void {
  for (const [cat, variants] of Object.entries(architectures)) {
    if (SKIP_DESIGN_FAMILY_STAMP.has(cat as LandingPageCategory)) continue;
    const dna = CATEGORY_VISUAL_DNA[cat as LandingPageCategory];
    if (!dna) continue;
    variants.forEach((variant, i) => {
      const stamped = dna.designFamilies[i];
      if (stamped) variant.designFamily = stamped;
    });
  }
}
