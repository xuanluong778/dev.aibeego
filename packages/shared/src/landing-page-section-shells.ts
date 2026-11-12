/**
 * Stamp per-section surface shells from architecture DNA.
 * Renderer already reads block.background via landingPageSectionSurfaceStyle —
 * catalog stamping is the missing visual differentiation layer.
 */

import type { LandingPageBlock, LandingPageCategory } from './landing-page-types';
import type { LandingPageDesignFamily } from './landing-page-template-foundation';
import { verifiedBackdropUrl } from './landing-page-verified-backdrops';
import {
  goldSectionBackground,
  goldSectionTone,
  resolveAgencyPremiumStandard,
} from './landing-page-agency-gold-system';
import {
  clinicGoldSectionBackground,
  clinicGoldSectionTone,
  resolveClinicGoldStandard,
} from './landing-page-clinic-gold-system';
import {
  saasGoldSectionBackground,
  saasGoldSectionTone,
  resolveSaasPremiumStandard,
} from './landing-page-saas-gold-system';
import {
  consultingGoldSectionBackground,
  consultingGoldSectionTone,
  resolveConsultingPremiumStandard,
} from './landing-page-consulting-gold-system';
import {
  resolveSeoPremiumStandard,
  seoGoldSectionBackground,
  seoGoldSectionTone,
} from './landing-page-seo-gold-system';
import {
  resolveServicePremiumStandard,
  serviceGoldSectionBackground,
  serviceGoldSectionTone,
} from './landing-page-service-gold-system';
import {
  resolveWebsitePremiumStandard,
  websiteGoldSectionBackground,
  websiteGoldSectionTone,
} from './landing-page-website-gold-system';
import {
  cosmeticsGoldSectionBackground,
  cosmeticsGoldSectionTone,
  resolveCosmeticsPremiumStandard,
} from './landing-page-cosmetics-gold-system';
import {
  fashionGoldSectionBackground,
  fashionGoldSectionTone,
  resolveFashionPremiumStandard,
} from './landing-page-fashion-gold-system';
import {
  productGoldSectionBackground,
  productGoldSectionTone,
  resolveProductPremiumStandard,
} from './landing-page-product-gold-system';

export type SectionShellContext = {
  category: LandingPageCategory | string;
  designFamily: LandingPageDesignFamily | string;
  visualComposition?: string;
  variantIndex: number;
  conversionGoal?: string;
  architectureId?: string;
};

type ShellKind =
  | 'canvas'
  | 'surface'
  | 'surfaceAlt'
  | 'muted'
  | 'dark'
  | 'primarySoft'
  | 'gradient'
  | 'hero'
  | 'cta'
  | 'form'
  | 'transparent';

function shellCss(kind: ShellKind): string | null {
  switch (kind) {
    case 'canvas':
      return 'var(--lp-canvas, var(--lp-bg))';
    case 'surface':
      return 'var(--lp-surface)';
    case 'surfaceAlt':
      return 'var(--lp-surface-alt, var(--lp-surface))';
    case 'muted':
      return 'color-mix(in srgb, var(--lp-surface-alt, var(--lp-surface)) 88%, var(--lp-muted) 12%)';
    case 'dark':
      return 'linear-gradient(160deg, #0B1220 0%, #111827 55%, #0F172A 100%)';
    case 'primarySoft':
      return 'color-mix(in srgb, var(--lp-primary) 10%, var(--lp-surface) 90%)';
    case 'gradient':
      return 'var(--lp-gradient)';
    case 'hero':
      return 'var(--lp-gradient)';
    case 'cta':
      return 'linear-gradient(120deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 55%, #0F172A) 100%)';
    case 'form':
      return 'color-mix(in srgb, var(--lp-surface-alt, var(--lp-surface)) 70%, var(--lp-primary) 8%)';
    case 'transparent':
      return null;
    default:
      return null;
  }
}

function shellForBlock(
  type: LandingPageBlock['type'],
  index: number,
  ctx: SectionShellContext,
  variant?: string | null,
): { background: string | null; spacing?: LandingPageBlock['spacing'] } {
  const family = String(ctx.designFamily || '');
  const composition = String(ctx.visualComposition || '');
  const darkFamily = family === 'bold' || family === 'portfolio';
  const isDarkCanvas = darkFamily && (ctx.variantIndex % 10 === 0 || ctx.variantIndex === 5 || ctx.variantIndex === 7);
  const isAgency = ctx.category === 'agency';
  const sectionSpace = (preferred: LandingPageBlock['spacing']) =>
    isAgency && preferred === 'lg' ? 'md' : preferred;

  switch (type) {
    case 'Header':
      return {
        background: shellCss(isDarkCanvas || darkFamily ? 'dark' : 'surface'),
        spacing: 'sm',
      };
    case 'Hero': {
      if (variant === 'editorial-overlay' || variant === 'fullscreen-image') {
        return { background: shellCss('dark'), spacing: 'lg' };
      }
      if (variant === 'minimal-copy') {
        return { background: shellCss('canvas'), spacing: 'lg' };
      }
      if (variant === 'floating-card') {
        return { background: shellCss('gradient'), spacing: 'lg' };
      }
      return { background: shellCss('hero'), spacing: 'lg' };
    }
    case 'Speaker':
      return {
        background: shellCss(composition === 'portrait_speaker' ? 'surfaceAlt' : 'surface'),
        spacing: 'lg',
      };
    case 'Gallery':
      if (composition === 'gallery_heavy' || index === 0) {
        return { background: shellCss(darkFamily ? 'dark' : 'muted'), spacing: sectionSpace('lg') };
      }
      return { background: shellCss(index % 2 === 0 ? 'surfaceAlt' : 'canvas'), spacing: 'md' };
    case 'Video':
      return { background: shellCss('dark'), spacing: 'lg' };
    case 'Features':
    case 'Benefits':
      if (variant === 'editorial-list' || variant === 'minimal-list') {
        return { background: shellCss('canvas'), spacing: 'lg' };
      }
      if (variant === 'alternating' || variant === 'image-cards') {
        return { background: shellCss('surfaceAlt'), spacing: 'lg' };
      }
      return {
        background: shellCss(index % 2 === 0 ? 'surface' : 'surfaceAlt'),
        spacing: 'md',
      };
    case 'Process':
      return {
        background: shellCss(variant === 'timeline' ? 'surfaceAlt' : 'canvas'),
        spacing: sectionSpace('md'),
      };
    case 'Testimonials':
      return {
        background: shellCss(
          variant === 'quote-centered' || variant === 'editorial' ? 'muted' : 'surfaceAlt',
        ),
        spacing: sectionSpace('md'),
      };
    case 'Pricing':
      return {
        background: shellCss(variant === 'comparison' ? 'surfaceAlt' : 'canvas'),
        spacing: sectionSpace('md'),
      };
    case 'FAQ':
      return {
        background: shellCss(variant === 'accordion' ? 'canvas' : 'surfaceAlt'),
        spacing: 'md',
      };
    case 'Guarantee':
      return {
        background: shellCss(variant === 'banner' ? 'primarySoft' : 'surface'),
        spacing: variant === 'banner' ? 'md' : 'sm',
      };
    case 'CTA':
      if (variant === 'minimal') {
        return { background: shellCss('transparent'), spacing: 'md' };
      }
      if (variant === 'banner' || variant === 'image-background') {
        return { background: shellCss('cta'), spacing: 'lg' };
      }
      return { background: shellCss('primarySoft'), spacing: 'md' };
    case 'LeadForm':
      if (variant === 'split' || variant === 'floating-card') {
        return { background: shellCss(darkFamily ? 'dark' : 'form'), spacing: 'lg' };
      }
      if (variant === 'booking') {
        return { background: shellCss('surfaceAlt'), spacing: 'lg' };
      }
      if (variant === 'minimal' || variant === 'inline') {
        return { background: shellCss('canvas'), spacing: 'md' };
      }
      return { background: shellCss('form'), spacing: 'md' };
    case 'Footer':
      return {
        background: shellCss(darkFamily || isDarkCanvas ? 'dark' : 'muted'),
        spacing: 'sm',
      };
    case 'Product':
      return { background: shellCss('surfaceAlt'), spacing: 'lg' };
    case 'Countdown':
      return { background: shellCss('primarySoft'), spacing: 'md' };
    default:
      return { background: shellCss(index % 2 === 0 ? 'transparent' : 'surfaceAlt') };
  }
}

/**
 * Apply section background + spacing rhythm. Idempotent for already-stamped backgrounds
 * unless `force` is true.
 */
export function applySectionShells(
  blocks: LandingPageBlock[],
  ctx: SectionShellContext,
  opts?: { force?: boolean },
): LandingPageBlock[] {
  const agencyPremium = resolveAgencyPremiumStandard(ctx.architectureId);
  const clinicGold = resolveClinicGoldStandard(ctx.architectureId);
  const saasPremium = resolveSaasPremiumStandard(ctx.architectureId);
  const servicePremium = resolveServicePremiumStandard(ctx.architectureId);
  const consultingPremium = resolveConsultingPremiumStandard(ctx.architectureId);
  const seoPremium = resolveSeoPremiumStandard(ctx.architectureId);
  const websitePremium = resolveWebsitePremiumStandard(ctx.architectureId);
  const productPremium = resolveProductPremiumStandard(ctx.architectureId);
  const fashionPremium = resolveFashionPremiumStandard(ctx.architectureId);
  const cosmeticsPremium = resolveCosmeticsPremiumStandard(ctx.architectureId);
  return blocks.map((block, index) => {
    if (!opts?.force && block.background) return block;
    const goldBg = agencyPremium
      ? goldSectionBackground(goldSectionTone(agencyPremium, block.type, index))
      : clinicGold
        ? clinicGoldSectionBackground(clinicGoldSectionTone(clinicGold, block.type, index))
        : saasPremium
          ? saasGoldSectionBackground(saasGoldSectionTone(saasPremium, block.type, index))
          : servicePremium
            ? serviceGoldSectionBackground(serviceGoldSectionTone(servicePremium, block.type, index))
            : consultingPremium
              ? consultingGoldSectionBackground(
                  consultingGoldSectionTone(consultingPremium, block.type, index),
                )
              : seoPremium
                ? seoGoldSectionBackground(seoGoldSectionTone(seoPremium, block.type, index))
                : websitePremium
                  ? websiteGoldSectionBackground(
                      websiteGoldSectionTone(websitePremium, block.type, index),
                    )
                  : productPremium
                    ? productGoldSectionBackground(
                        productGoldSectionTone(productPremium, block.type, index),
                      )
                    : fashionPremium
                      ? fashionGoldSectionBackground(
                          fashionGoldSectionTone(fashionPremium, block.type, index),
                        )
                      : cosmeticsPremium
                        ? cosmeticsGoldSectionBackground(
                            cosmeticsGoldSectionTone(cosmeticsPremium, block.type, index),
                          )
                        : null;
    const shell = goldBg
      ? { background: goldBg, spacing: shellForBlock(block.type, index, ctx, block.variant).spacing }
      : shellForBlock(block.type, index, ctx, block.variant);
    const next: LandingPageBlock = { ...block };
    if (shell.background) next.background = shell.background;
    if (shell.spacing && (!block.spacing || block.spacing === 'md')) {
      next.spacing = shell.spacing;
    }
    // Section tone for renderer CSS — gold uses deterministic rhythm; others infer from shell bg.
    let tone: string | undefined;
    if (agencyPremium) {
      tone = goldSectionTone(agencyPremium, block.type, index);
    } else if (clinicGold) {
      tone = clinicGoldSectionTone(clinicGold, block.type, index);
    } else if (saasPremium) {
      tone = saasGoldSectionTone(saasPremium, block.type, index);
    } else if (servicePremium) {
      tone = serviceGoldSectionTone(servicePremium, block.type, index);
    } else if (consultingPremium) {
      tone = consultingGoldSectionTone(consultingPremium, block.type, index);
    } else if (seoPremium) {
      tone = seoGoldSectionTone(seoPremium, block.type, index);
    } else if (websitePremium) {
      tone = websiteGoldSectionTone(websitePremium, block.type, index);
    } else if (productPremium) {
      tone = productGoldSectionTone(productPremium, block.type, index);
    } else if (fashionPremium) {
      tone = fashionGoldSectionTone(fashionPremium, block.type, index);
    } else if (cosmeticsPremium) {
      tone = cosmeticsGoldSectionTone(cosmeticsPremium, block.type, index);
    } else if (shell.background) {
      if (
        shell.background.includes('#0B1220') ||
        shell.background.includes('#020617') ||
        shell.background.includes('#111827') ||
        shell.background.includes('#0A0A0A') ||
        shell.background.includes('#141414') ||
        shell.background === 'linear-gradient(160deg, #0B1220 0%, #111827 55%, #0F172A 100%)' ||
        shell.background.startsWith('linear-gradient(165deg, #0A0A0A')
      ) {
        tone = 'dark';
      } else if (
        shell.background.includes('#F5F1E6') ||
        shell.background.includes('#FAF7F0') ||
        shell.background.includes('F5F1E6')
      ) {
        tone = 'cream';
      } else if (shell.background.startsWith('linear-gradient(120deg, var(--lp-primary)')) {
        tone = 'accent';
      }
    }
    if (tone) {
      next.style = {
        ...(next.style || {}),
        lpSectionTone: tone,
      } as LandingPageBlock['style'];
    }
    return next;
  });
}

/** Stock image for CTA/Hero/Gallery shells — verified Unsplash pool only. */
export function defaultCtaBackdropUrl(category: string, variantIndex: number): string {
  return verifiedBackdropUrl(category, variantIndex);
}
