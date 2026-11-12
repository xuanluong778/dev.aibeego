#!/usr/bin/env node
/**
 * Phase 2 — SPA structural diversity + renderer variant gates + similarity.
 *   node scripts/test-landing-page-phase2-engine.cjs
 */
const fs = require('fs');
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
  phase2StructuralVariantsReady,
  BLOCK_VARIANT_REGISTRY,
  evaluateTemplatePairSimilarity,
  normalizeLandingPageThemeTokens,
  LANDING_PAGE_THEME_PRESETS,
} = shared;

const spa = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === 'spa');

gate('SPA_COUNT_10', spa.length === 10, `count=${spa.length}`);

gate(
  'PHASE2_REGISTRY_READY',
  typeof phase2StructuralVariantsReady === 'function' && phase2StructuralVariantsReady(),
  'Pricing/Testimonials/Gallery/Features/Process/CTA/LeadForm marked implemented',
);

const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const variantCss = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-variant-render.ts'),
  'utf8',
);

gate(
  'RENDERER_PRICING_STRUCTURAL',
  renderer.includes("canonicalBlockVariant('Pricing'") &&
    renderer.includes('data-lp-pricing-table') &&
    renderer.includes('data-lp-pricing-minimal') &&
    renderer.includes('data-lp-pricing-variant'),
  'comparison table + minimal + cards',
);

gate(
  'RENDERER_PROCESS_TIMELINE',
  renderer.includes("canonicalBlockVariant('Process'") &&
    renderer.includes('data-lp-timeline') &&
    renderer.includes('data-lp-process-variant'),
  'timeline + steps shells',
);

gate(
  'RENDERER_CTA_SPLIT_FLOAT',
  renderer.includes('data-lp-cta-split') && renderer.includes('data-lp-cta-float-wrap'),
  'CTA split + floating-card DOM',
);

gate(
  'RENDERER_LEADFORM_SPLIT',
  renderer.includes('data-lp-form-split') && renderer.includes("formVariant === 'booking'"),
  'LeadForm split + booking',
);

gate(
  'RENDERER_TESTIMONIALS_SHELLS',
  renderer.includes('data-lp-testimonial-editorial') &&
    renderer.includes('data-lp-testimonial-portrait'),
  'editorial + portrait DOM',
);

gate(
  'RENDERER_GALLERY_FEATURED',
  renderer.includes('data-lp-gallery-featured'),
  'featured-plus-grid DOM',
);

gate(
  'TOKENS_ADDITIVE',
  variantCss.includes('--lp-section-mult') &&
    variantCss.includes('--lp-fw-heading') &&
    variantCss.includes('density:') &&
    renderer.includes('data-lp-density') &&
    renderer.includes('data-lp-btn-style') &&
    renderer.includes('data-lp-image-treatment'),
  'density/typography/button/image tokens wired',
);

const norm = normalizeLandingPageThemeTokens({}, 'MODERN');
gate(
  'TOKENS_NORMALIZE_DEFAULTS',
  norm.density === 'comfortable' &&
    !!norm.radiusSm &&
    !!norm.shadowMd &&
    !!norm.imageTreatment &&
    typeof norm.fontWeightHeading === 'number',
  `density=${norm.density} treatment=${norm.imageTreatment}`,
);

const spaFamilies = new Set(spa.map((t) => t.designFamily || t.spec?.meta?.designFamily));
const spaHeroes = new Set(
  spa.map((t) => {
    const h = t.spec.blocks.find((b) => b.type === 'Hero');
    return h?.variant || 'default';
  }),
);
const spaSeqs = new Set(
  spa.map((t) =>
    t.spec.blocks
      .filter((b) => b.enabled !== false)
      .map((b) => b.type)
      .join('>'),
  ),
);

gate('SPA_DISTINCT_FAMILIES', spaFamilies.size >= 7, [...spaFamilies].join(','));
gate('SPA_DISTINCT_HEROES', spaHeroes.size >= 5, [...spaHeroes].join(','));
gate('SPA_DISTINCT_SEQUENCES', spaSeqs.size >= 8, `uniqueSeq=${spaSeqs.size}`);

const sim = evaluateTemplatePairSimilarity(spa);
const topFails = sim.pairs
  .filter((p) => p.level === 'fail')
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)
  .map((p) => `${p.a}↔${p.b}=${(p.score * 100).toFixed(1)}%`)
  .join('; ');
const topWarns = sim.pairs
  .filter((p) => p.level === 'warn')
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .map((p) => `${p.a}↔${p.b}=${(p.score * 100).toFixed(1)}%`)
  .join('; ');

gate(
  'SPA_SIMILARITY_GATES',
  sim.ok,
  `fail=${sim.failCount} warn=${sim.warnCount}${topFails ? ' | ' + topFails : ''}${
    topWarns ? ' | warn:' + topWarns : ''
  }`,
);

const pricingImplemented = (BLOCK_VARIANT_REGISTRY.Pricing || []).filter(
  (v) => v.hasRendererImplementation,
).length;
gate('PRICING_VARIANTS_IMPL', pricingImplemented >= 3, `impl=${pricingImplemented}`);

const critical = [
  'SPA_COUNT_10',
  'PHASE2_REGISTRY_READY',
  'RENDERER_PRICING_STRUCTURAL',
  'RENDERER_PROCESS_TIMELINE',
  'RENDERER_CTA_SPLIT_FLOAT',
  'RENDERER_LEADFORM_SPLIT',
  'RENDERER_TESTIMONIALS_SHELLS',
  'RENDERER_GALLERY_FEATURED',
  'TOKENS_ADDITIVE',
  'TOKENS_NORMALIZE_DEFAULTS',
  'SPA_DISTINCT_FAMILIES',
  'SPA_DISTINCT_HEROES',
  'SPA_DISTINCT_SEQUENCES',
  'SPA_SIMILARITY_GATES',
  'PRICING_VARIANTS_IMPL',
];
const failed = critical.filter((k) => !gates[k]?.ok);

console.log('\n--- PHASE 2 REPORT ---');
console.log(`SPA_TEMPLATES=${spa.length}`);
console.log(`SIMILARITY_FAIL=${sim.failCount} WARN=${sim.warnCount}`);
console.log(`PHASE2_ENGINE_READY=${failed.length === 0 ? 'PASS' : 'FAIL'}`);
if (failed.length) console.log('FAILED_GATES:', failed.join(', '));
process.exit(failed.length ? 1 : 0);
