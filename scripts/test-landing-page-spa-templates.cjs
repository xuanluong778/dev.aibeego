#!/usr/bin/env node
/**
 * SPA / Beauty professional template gates (10 directions).
 *   node scripts/test-landing-page-spa-templates.cjs
 */
const path = require('path');
const shared = require('../packages/shared/dist/index.js');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
  CATEGORY_ARCHITECTURES,
  architectureFingerprint,
  architectureVariantToRecipe,
  resolveBlockVariant,
  LANDING_PAGE_BLOCK_VARIANTS,
  sanitizeLandingPageSpec,
  cloneLandingPageSpecWithNewIds,
  listSpaDirectionIds,
} = shared;

const EXPECTED_IDS = [
  'spa-luxury-editorial',
  'spa-soft-minimal',
  'spa-clinic-clean',
  'spa-dark-premium',
  'spa-organic-wellness',
  'spa-offer-conversion',
  'spa-booking-first',
  'spa-gallery-first',
  'spa-local-business',
  'spa-social-proof',
];

const EXPECTED_SLUGS = [
  'spa-wellness',
  'spa-wellness-soft-minimal',
  'spa-wellness-clinic-clean',
  'spa-wellness-dark-premium',
  'spa-wellness-organic-wellness',
  'spa-wellness-offer-conversion',
  'spa-wellness-booking-first',
  'spa-wellness-gallery-first',
  'spa-wellness-local-business',
  'spa-wellness-social-proof',
];

gate(
  'CATALOG_VERSION_V7',
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION === 'gallery-v7-spa-offer-booking',
  String(LANDING_PAGE_TEMPLATE_CATALOG_VERSION),
);

const spaArch = CATEGORY_ARCHITECTURES.spa || [];
gate('SPA_ARCH_COUNT_10', spaArch.length === 10, `n=${spaArch.length}`);

const archIds = spaArch.map((a) => a.architectureId);
gate(
  'SPA_ARCHITECTURE_IDS',
  EXPECTED_IDS.every((id) => archIds.includes(id)) && archIds.length === 10,
  archIds.join(','),
);

const spaTemplates = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === 'spa');
gate('SPA_TEMPLATE_COUNT_10', spaTemplates.length === 10, `n=${spaTemplates.length}`);

const slugs = spaTemplates.map((t) => t.slug).sort();
const expectedSorted = [...EXPECTED_SLUGS].sort();
gate(
  'SPA_SLUGS_UNIQUE_EXPECTED',
  slugs.length === new Set(slugs).size &&
    expectedSorted.every((s, i) => s === slugs[i]) &&
    Boolean(spaTemplates.find((t) => t.slug === 'spa-wellness')),
  slugs.join('|'),
);

const fingerprints = spaArch.map((a) => {
  const recipe = architectureVariantToRecipe(a, 'spa');
  return architectureFingerprint({
    designFamily: recipe.designFamily,
    conversionGoal: recipe.conversionGoal,
    heroVariant: recipe.heroVariant || a.heroVariant,
    sectionSequence: recipe.sectionSequence || a.sectionSequence,
    blockVariants: recipe.blockVariants,
  });
});
gate(
  'SPA_FINGERPRINTS_UNIQUE',
  fingerprints.length === 10 && new Set(fingerprints).size === 10,
  `unique=${new Set(fingerprints).size}`,
);

const directions = listSpaDirectionIds();
gate(
  'SPA_DIRECTION_COPY_10',
  directions.length === 10 && EXPECTED_IDS.every((id) => directions.includes(id)),
  directions.join(','),
);

let variantsOk = true;
const variantFails = [];
for (const a of spaArch) {
  const recipe = architectureVariantToRecipe(a, 'spa');
  for (const [type, raw] of Object.entries(recipe.blockVariants || {})) {
    const allowed = LANDING_PAGE_BLOCK_VARIANTS[type];
    const resolved = resolveBlockVariant(type, raw);
    if (!allowed || !allowed.includes(resolved)) {
      variantsOk = false;
      variantFails.push(`${a.architectureId}.${type}=${raw}->${resolved}`);
    }
  }
  if (!recipe.designFamily || !recipe.conversionGoal || !recipe.architectureId) {
    variantsOk = false;
    variantFails.push(`${a.architectureId}:missing-recipe-fields`);
  }
}
gate('SPA_VARIANTS_VALID', variantsOk, variantFails.slice(0, 5).join(';') || 'ok');

let pathOk = true;
const pathFails = [];
for (const t of spaTemplates) {
  const types = t.spec.blocks.map((b) => b.type);
  const hasHero = types.includes('Hero');
  const hasConv = types.includes('LeadForm') || types.includes('CTA');
  const ids = t.spec.blocks.map((b) => b.id);
  const uniqueIds = new Set(ids).size === ids.length;
  const recipe = t.spec.meta?.architectureRecipe;
  const fp = architectureFingerprint({
    designFamily: recipe?.designFamily || t.designFamily,
    conversionGoal: recipe?.conversionGoal || t.conversionGoal,
    heroVariant: recipe?.heroVariant,
    sectionSequence: recipe?.sectionSequence || types,
    blockVariants: recipe?.blockVariants,
  });
  if (!hasHero || !hasConv || !uniqueIds || !recipe || !fp) {
    pathOk = false;
    pathFails.push(t.slug);
  }
  // no lorem
  const blob = JSON.stringify(t.spec.blocks);
  if (/lorem ipsum/i.test(blob)) {
    pathOk = false;
    pathFails.push(`${t.slug}:lorem`);
  }
}
gate('SPA_HERO_CONVERSION_IDS', pathOk, pathFails.slice(0, 5).join(',') || 'ok');

const primary = spaTemplates.find((t) => t.slug === 'spa-wellness');
const sanitized = sanitizeLandingPageSpec(structuredClone(primary.spec));
const cloned = cloneLandingPageSpecWithNewIds(sanitized);
gate(
  'SPA_SANITIZE_CLONE',
  sanitized.meta?.architectureRecipe?.architectureId === 'spa-luxury-editorial' &&
    cloned.blocks.every((b) => typeof b.variant === 'string') &&
    cloned.blocks[0].id !== sanitized.blocks[0].id &&
    new Set(cloned.blocks.map((b) => b.id)).size === cloned.blocks.length,
  `arch=${sanitized.meta?.architectureRecipe?.architectureId}`,
);

// Fingerprint dump for report
console.log('\n--- SPA FINGERPRINTS ---');
spaArch.forEach((a, i) => {
  console.log(`${i + 1}. ${a.architectureId}`);
  console.log(`   slug≈${EXPECTED_SLUGS[i]}`);
  console.log(`   family=${a.designFamily} goal=${a.conversionGoal}`);
  console.log(`   hero=${a.blockVariants?.Hero || a.heroVariant}`);
  console.log(`   flow=${a.sectionSequence.join('>')}`);
  console.log(`   fp=${fingerprints[i]}`);
});

const allPass = Object.values(gates).every((g) => g.ok);
console.log(`\nSPA_TEMPLATES_READY=${allPass ? 'PASS' : 'FAIL'}`);
process.exitCode = allPass ? 0 : 1;
