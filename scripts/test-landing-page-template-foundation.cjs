#!/usr/bin/env node
/**
 * Landing Page template foundation gates (designFamily, recipe, block variants).
 *   node scripts/test-landing-page-template-foundation.cjs
 */
const path = require('path');
const root = path.join(__dirname, '..');
const shared = require('../packages/shared/dist/index.js');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  LANDING_PAGE_DESIGN_FAMILIES,
  LANDING_PAGE_CONVERSION_GOALS,
  LANDING_PAGE_HERO_VARIANTS,
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
  resolveBlockVariant,
  mapLegacyHeroVariant,
  sanitizeLandingPageSpec,
  cloneLandingPageSpecWithNewIds,
  architectureVariantToRecipe,
  CATEGORY_ARCHITECTURES,
  buildArchitectureRecipe,
  canonicalBlockVariant,
} = shared;

gate(
  'CATALOG_VERSION_V7',
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION === 'gallery-v7-spa-offer-booking',
  String(LANDING_PAGE_TEMPLATE_CATALOG_VERSION),
);

gate(
  'DESIGN_FAMILY_ENUM',
  Array.isArray(LANDING_PAGE_DESIGN_FAMILIES) &&
    LANDING_PAGE_DESIGN_FAMILIES.includes('editorial') &&
    LANDING_PAGE_DESIGN_FAMILIES.includes('conversion') &&
    LANDING_PAGE_DESIGN_FAMILIES.length === 10,
  `count=${LANDING_PAGE_DESIGN_FAMILIES?.length}`,
);

gate(
  'CONVERSION_GOAL_ENUM',
  Array.isArray(LANDING_PAGE_CONVERSION_GOALS) &&
    LANDING_PAGE_CONVERSION_GOALS.includes('lead') &&
    LANDING_PAGE_CONVERSION_GOALS.includes('booking') &&
    LANDING_PAGE_CONVERSION_GOALS.length === 6,
  `count=${LANDING_PAGE_CONVERSION_GOALS?.length}`,
);

gate(
  'HERO_VARIANTS',
  LANDING_PAGE_HERO_VARIANTS.includes('default') &&
    LANDING_PAGE_HERO_VARIANTS.includes('split-left') &&
    LANDING_PAGE_HERO_VARIANTS.includes('editorial-overlay') &&
    LANDING_PAGE_HERO_VARIANTS.includes('floating-card'),
  'foundation hero variants present',
);

gate(
  'FEATURES_VARIANT_ALIASES',
  canonicalBlockVariant('Features', 'grid') === 'icon-grid' &&
    resolveBlockVariant('Features', 'icons') === 'icon-grid',
  'legacy grid/icons → icon-grid',
);

gate(
  'VARIANT_FALLBACK_DEFAULT',
  resolveBlockVariant('Hero', undefined) === 'default' &&
    resolveBlockVariant('Hero', 'nope') === 'default' &&
    resolveBlockVariant('Hero', 'split') === 'split-left' &&
    resolveBlockVariant('CTA', 'banner') === 'banner' &&
    mapLegacyHeroVariant('visual_first') === 'fullscreen-image',
  'unknown → default; legacy mapped',
);

const sample = LANDING_PAGE_SYSTEM_TEMPLATES.find((t) => t.slug === 'product-launch');
const sampleWithHero = LANDING_PAGE_SYSTEM_TEMPLATES.find((t) =>
  t.spec?.blocks?.some((b) => b.type === 'Hero'),
);
const recipe = sample?.spec?.meta?.architectureRecipe;
gate(
  'TEMPLATE_HAS_RECIPE',
  !!sample &&
    !!recipe &&
    typeof recipe.architectureId === 'string' &&
    LANDING_PAGE_DESIGN_FAMILIES.includes(recipe.designFamily) &&
    LANDING_PAGE_CONVERSION_GOALS.includes(recipe.conversionGoal) &&
    Array.isArray(recipe.flowSteps) &&
    recipe.flowSteps.length > 0 &&
    sample.designFamily === recipe.designFamily &&
    sample.conversionGoal === recipe.conversionGoal &&
    sample.spec.meta.designFamily === recipe.designFamily,
  sample
    ? `${sample.slug} family=${recipe?.designFamily} goal=${recipe?.conversionGoal}`
    : 'missing sample',
);

const hero = sampleWithHero?.spec?.blocks?.find((b) => b.type === 'Hero');
gate(
  'BLOCKS_STAMPED_VARIANT',
  !!sample &&
    sample.spec.blocks.every((b) => typeof b.variant === 'string') &&
    !!hero?.variant &&
    LANDING_PAGE_HERO_VARIANTS.includes(hero.variant),
  `all stamped; hero@${sampleWithHero?.slug}=${hero?.variant}`,
);

const seoArch = CATEGORY_ARCHITECTURES.seo[0];
const fromArch = architectureVariantToRecipe(seoArch, 'seo');
gate(
  'ARCHITECTURE_TO_RECIPE',
  fromArch.architectureId === seoArch.architectureId &&
    fromArch.designFamily &&
    fromArch.conversionGoal &&
    fromArch.blockVariants.Hero &&
    fromArch.purpose,
  fromArch.architectureId,
);

// Old spec without variant / recipe still sanitizes + clones
const legacySpec = {
  version: 1,
  theme: 'MODERN',
  themeTokens: sample.spec.themeTokens,
  seo: sample.spec.seo,
  blocks: [
    {
      id: 'hero_old',
      type: 'Hero',
      enabled: true,
      headline: 'Old',
      subheadline: 'Legacy',
      ctaLabel: 'Go',
      ctaUrl: '#',
    },
  ],
  meta: {
    gallery: {
      flowId: 'primary',
      architecture: {
        id: 'legacy_arch',
        heroVariant: 'split',
        sectionSequence: ['Hero', 'Footer'],
        ctaStrategy: 'buy',
        formPlacement: 'late',
        proofType: 'none',
        visualComposition: 'minimal',
      },
    },
  },
};

const sanitized = sanitizeLandingPageSpec(legacySpec);
const cloned = cloneLandingPageSpecWithNewIds(sanitized);
gate(
  'BACKCOMPAT_SANITIZE_CLONE',
  sanitized.blocks[0].variant === 'default' &&
    sanitized.meta?.architectureRecipe?.architectureId === 'legacy_arch' &&
    sanitized.meta?.architectureRecipe?.heroVariant === 'split-left' &&
    sanitized.meta?.conversionGoal === 'purchase' &&
    cloned.blocks[0].id !== 'hero_old' &&
    cloned.blocks[0].variant === 'default' &&
    cloned.meta?.architectureRecipe?.architectureId === 'legacy_arch',
  'legacy gallery.architecture → recipe; clone keeps recipe + new ids',
);

gate(
  'CATALOG_COUNT_200',
  LANDING_PAGE_SYSTEM_TEMPLATES.length === 200 &&
    LANDING_PAGE_SYSTEM_TEMPLATES.every(
      (t) => t.spec?.meta?.architectureRecipe && t.designFamily && t.conversionGoal,
    ),
  `n=${LANDING_PAGE_SYSTEM_TEMPLATES.length}`,
);

gate(
  'BUILD_RECIPE_HELPER',
  buildArchitectureRecipe({
    architectureId: 'x',
    purpose: 'test',
    sectionSequence: ['Hero', 'CTA', 'Footer'],
    heroVariant: 'centered',
    ctaStrategy: 'booking',
  }).conversionGoal === 'booking' &&
    buildArchitectureRecipe({
      architectureId: 'x',
      purpose: 'test',
      sectionSequence: ['Hero'],
      heroVariant: 'nope',
    }).blockVariants.Hero === 'default',
  'helper maps CTA + fallbacks',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_TEMPLATE_FOUNDATION_GATES_PASS');
process.exit(0);
