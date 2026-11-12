/**
 * Expand each category seed into 10 architecture-distinct templates + gallery image paths.
 * Stamps architectureRecipe + designFamily + conversionGoal into spec.meta (canonical SoT).
 */

import { applyAgencyPortfolioStandard } from './landing-page-agency-portfolio-standard';
import { applyCommercialContent } from './landing-page-commercial-content';
import type { LandingPageCategory, LandingPageTemplateDefinition } from './landing-page-types';
import { layoutForCategory } from './landing-page-ui';
import {
  CATEGORY_ARCHITECTURES,
  architectureVariantToRecipe,
  buildBlocksFromArchitecture,
  type CategoryArchitectureVariant,
} from './landing-page-category-architectures';
import {
  landingPageTemplateImagePaths,
  type LandingPageTemplateBadge,
} from './landing-page-template-flows';
import { applyCatalogThemeTokens } from './landing-page-design-tokens';
import { resolveBlockVariant } from './landing-page-template-foundation';
import { resolveAgencyPremiumStandard } from './landing-page-agency-gold-system';
import { resolveClinicGoldStandard } from './landing-page-clinic-gold-system';
import { resolveSaasPremiumStandard } from './landing-page-saas-gold-system';
import { resolveConsultingPremiumStandard } from './landing-page-consulting-gold-system';
import { resolveSeoPremiumStandard } from './landing-page-seo-gold-system';
import { resolveServicePremiumStandard } from './landing-page-service-gold-system';
import { resolveWebsitePremiumStandard } from './landing-page-website-gold-system';
import { resolveProductPremiumStandard } from './landing-page-product-gold-system';
import { resolveFashionPremiumStandard } from './landing-page-fashion-gold-system';
import { resolveCosmeticsPremiumStandard } from './landing-page-cosmetics-gold-system';

export const LANDING_PAGE_TEMPLATE_CATALOG_VERSION = 'gallery-v22-commercial-content';

function slugFor(seedSlug: string, flowSlugSuffix: string, variantIndex = 0): string {
  if (variantIndex === 0 || !flowSlugSuffix) return seedSlug;
  return `${seedSlug}-${flowSlugSuffix}`;
}

function badgeTags(badges: LandingPageTemplateBadge[]): string[] {
  return badges.map((b) => `badge:${b}`);
}

/**
 * From one seed template per category → 10 variants with industry conversion architecture.
 * Primary variant (index 0) keeps the legacy slug for create/AI compatibility.
 */
export function expandLandingPageTemplateCatalog(
  seeds: LandingPageTemplateDefinition[],
): LandingPageTemplateDefinition[] {
  const out: LandingPageTemplateDefinition[] = [];

  for (const seed of seeds) {
    const category = seed.category as LandingPageCategory;
    const architectures =
      CATEGORY_ARCHITECTURES[category] || CATEGORY_ARCHITECTURES.product;

    for (const arch of architectures) {
      const slug = slugFor(seed.slug, arch.flowSlugSuffix, arch.variantIndex);
      const images = landingPageTemplateImagePaths(slug);
      const theme = arch.theme;
      const resolvedLayout = arch.layout || layoutForCategory(category);
      const recipe = architectureVariantToRecipe(arch, category);

      // Webinar primary keeps handcrafted seed stack (Speaker→agenda… already industry DNA).
      let blocks =
        category === 'webinar' && arch.variantIndex === 0
          ? structuredClone(seed.spec.blocks)
          : buildBlocksFromArchitecture({
              sourceBlocks: seed.spec.blocks,
              architecture: arch,
              category,
              brandName: seed.name,
            });

      // Ensure webinar primary also carries resolved variants (backward-compatible stamp).
      if (category === 'webinar' && arch.variantIndex === 0) {
        blocks = blocks.map((b) => ({
          ...b,
          variant: resolveBlockVariant(
            b.type,
            b.variant || recipe.blockVariants[b.type] || (b.type === 'Hero' ? arch.heroVariant : undefined),
          ),
        }));
      }

      const name = arch.nameSuffix ? `${seed.name} ${arch.nameSuffix}` : seed.name;
      const description = arch.flowSlugSuffix
        ? `${arch.descriptionHint} — ${seed.description}`
        : seed.description;

      const badges = arch.badges;
      const def: LandingPageTemplateDefinition = {
        slug,
        name,
        category,
        theme,
        description: description.slice(0, 280),
        designFamily: recipe.designFamily,
        conversionGoal: recipe.conversionGoal,
        tags: [
          ...new Set([
            category,
            theme.toLowerCase(),
            arch.architectureId,
            recipe.designFamily,
            recipe.conversionGoal,
            arch.ctaStrategy,
            recipe.heroVariant,
            'landing',
            'conversion',
            ...badgeTags(badges),
            ...seed.tags.filter((t) => !t.startsWith('badge:')),
          ]),
        ],
        thumbnail: images.thumbnail,
        previewLongImage: images.previewLongImage,
        badges,
        spec: {
          version: 1,
          theme,
          themeTokens: applyCatalogThemeTokens({
            theme,
            designFamily: recipe.designFamily,
            category,
            variantIndex: arch.variantIndex,
          }),
          seo: {
            title: `${name} | Landing Page`,
            metaDescription: description.slice(0, 160),
            canonical: null,
            ogImage: images.thumbnail,
            robotsIndex: true,
          },
          blocks,
          meta: {
            catalogVersion: LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
            layout: resolvedLayout,
            category,
            designFamily: recipe.designFamily,
            conversionGoal: recipe.conversionGoal,
            goldStandard:
              resolveAgencyPremiumStandard(arch.architectureId) ||
              resolveClinicGoldStandard(arch.architectureId) ||
              resolveSaasPremiumStandard(arch.architectureId) ||
              resolveServicePremiumStandard(arch.architectureId) ||
              resolveConsultingPremiumStandard(arch.architectureId) ||
              resolveSeoPremiumStandard(arch.architectureId) ||
              resolveWebsitePremiumStandard(arch.architectureId) ||
              resolveProductPremiumStandard(arch.architectureId) ||
              resolveFashionPremiumStandard(arch.architectureId) ||
              resolveCosmeticsPremiumStandard(arch.architectureId) ||
              undefined,
            architectureRecipe: recipe,
            gallery: {
              thumbnail: images.thumbnail,
              previewLongImage: images.previewLongImage,
              badges,
              flowId: arch.flowSlugSuffix || 'primary',
              // Legacy mirror — prefer architectureRecipe; kept for old readers.
              architecture: {
                id: recipe.architectureId,
                heroVariant: recipe.heroVariant,
                sectionSequence: recipe.sectionSequence,
                ctaStrategy: recipe.ctaStrategy,
                formPlacement: recipe.formPlacement,
                proofType: recipe.proofType,
                visualComposition: recipe.visualComposition,
                designFamily: recipe.designFamily,
                conversionGoal: recipe.conversionGoal,
                purpose: recipe.purpose,
              },
            },
          },
        },
      };
      out.push(applyAgencyPortfolioStandard(applyCommercialContent(def, arch.variantIndex)));
    }
  }

  return out;
}

export function countTemplatesPerCategory(
  templates: LandingPageTemplateDefinition[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of templates) {
    map[t.category] = (map[t.category] || 0) + 1;
  }
  return map;
}

export function listArchitectureVariants(
  category: LandingPageCategory,
): CategoryArchitectureVariant[] {
  return CATEGORY_ARCHITECTURES[category] || [];
}
