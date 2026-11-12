#!/usr/bin/env node
/**
 * Phase 3 — full catalog (200 templates) variant + similarity + conversion gates.
 *   node scripts/test-landing-page-phase3-catalog.cjs
 *   node scripts/test-landing-page-phase3-catalog.cjs --category saas
 */
const shared = require('../packages/shared/dist/index.js');

const args = process.argv.slice(2);
const categoryFilter = args.includes('--category')
  ? args[args.indexOf('--category') + 1]
  : null;

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  LANDING_PAGE_CATEGORIES,
  evaluateTemplatePairSimilarity,
  validateLandingPageTemplateCatalog,
  phase2StructuralVariantsReady,
} = shared;

const templates = categoryFilter
  ? LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === categoryFilter)
  : LANDING_PAGE_SYSTEM_TEMPLATES;

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate('TEMPLATE_COUNT_200', !categoryFilter && templates.length === 200, `count=${templates.length}`);
gate('PHASE2_REGISTRY', phase2StructuralVariantsReady(), 'structural variants ready');

const byCat = new Map();
for (const t of templates) {
  if (!byCat.has(t.category)) byCat.set(t.category, []);
  byCat.get(t.category).push(t);
}

if (!categoryFilter) {
  gate('CATEGORIES_20', byCat.size === 20, `categories=${byCat.size}`);
  for (const cat of LANDING_PAGE_CATEGORIES) {
    const list = byCat.get(cat) || [];
    gate(`CAT_${cat}_COUNT_10`, list.length === 10, `n=${list.length}`);
  }
}

const MAJOR_BLOCKS = ['Hero', 'Features', 'Benefits', 'Process', 'Gallery', 'Testimonials', 'Pricing', 'CTA', 'LeadForm'];

for (const [cat, list] of byCat.entries()) {
  let stamped = 0;
  for (const t of list) {
    const recipe = t.spec.meta?.architectureRecipe;
    const bv = recipe?.blockVariants || {};
    const nonDefault = Object.entries(bv).filter(
      ([k, v]) => MAJOR_BLOCKS.includes(k) && v && v !== 'default',
    );
    if (nonDefault.length >= 3) stamped += 1;
  }
  gate(`CAT_${cat}_VARIANTS_STAMPED`, stamped >= 8, `${stamped}/10 with ≥3 major blockVariants`);
}

const sim = evaluateTemplatePairSimilarity(templates);
const failPairs = sim.pairs.filter((p) => p.level === 'fail').sort((a, b) => b.score - a.score);
const warnPairs = sim.pairs.filter((p) => p.level === 'warn').sort((a, b) => b.score - a.score);

gate(
  'SIMILARITY_GATES',
  sim.ok,
  `fail=${sim.failCount} warn=${sim.warnCount}${
    failPairs[0]
      ? ' | top:' +
        failPairs
          .slice(0, 5)
          .map((p) => `${p.a}↔${p.b}=${(p.score * 100).toFixed(1)}%`)
          .join('; ')
      : ''
  }`,
);

if (warnPairs.length) {
  console.log(
    'WARN pairs:',
    warnPairs
      .slice(0, 5)
      .map((p) => `${p.a}↔${p.b}=${(p.score * 100).toFixed(1)}%`)
      .join('; '),
  );
}

const catalog = validateLandingPageTemplateCatalog(templates);
gate(
  'CATALOG_VALIDATORS',
  catalog.ok,
  `errors=${catalog.errors.length} warnings=${catalog.warnings.length}`,
);

const conversionMap = {
  saas: ['signup'],
  product: ['purchase'],
  fashion: ['purchase'],
  cosmetics: ['purchase'],
  clinic: ['booking', 'contact'],
  spa: ['booking', 'contact', 'lead'],
  restaurant: ['booking'],
  real_estate: ['booking', 'lead'],
  course: ['signup'],
  webinar: ['signup'],
  service: ['booking', 'lead'],
  coaching: ['signup', 'lead'],
  consulting: ['lead', 'contact'],
  seo: ['lead', 'contact'],
  agency: ['lead', 'contact'],
  website: ['lead', 'contact'],
  quote: ['lead', 'contact'],
  ebook: ['download', 'lead'],
  demo: ['signup', 'lead'],
  lead_magnet: ['download', 'lead'],
};

for (const [cat, list] of byCat.entries()) {
  const allowed = conversionMap[cat] || ['lead'];
  const bad = list.filter((t) => !allowed.includes(t.conversionGoal || t.spec.meta?.conversionGoal));
  gate(
    `CAT_${cat}_CONVERSION_GOAL`,
    bad.length === 0,
    bad.length ? `bad=${bad.map((t) => t.slug).join(',')}` : allowed.join('|'),
  );
}

const critical = Object.keys(gates).filter((k) => !gates[k]?.ok);
console.log('\n--- PHASE 3 REPORT ---');
console.log(`SCOPE=${categoryFilter || 'full'}`);
console.log(`TEMPLATES=${templates.length}`);
console.log(`SIMILARITY_FAIL=${sim.failCount} WARN=${sim.warnCount}`);
console.log(`PHASE3_CATALOG=${critical.length === 0 ? 'PASS' : 'FAIL'}`);
if (critical.length) console.log('FAILED:', critical.join(', '));
process.exit(critical.length ? 1 : 0);
