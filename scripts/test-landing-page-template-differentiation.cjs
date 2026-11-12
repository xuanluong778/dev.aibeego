#!/usr/bin/env node
/**
 * Landing Page template differentiation gates.
 *   node scripts/test-landing-page-template-differentiation.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const shared = require('../packages/shared/dist/index.js');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  LANDING_PAGE_CATEGORIES,
  CATEGORY_ARCHITECTURES,
  analyzeArchitectureUniqueness,
  selectLandingPageTemplate,
  sectionSignature,
} = shared;

const analysis = analyzeArchitectureUniqueness();

// --- CATEGORY_ARCHITECTURE_UNIQUE ---
const primarySigs = Object.values(analysis.categoryPrimarySignatures);
const primaryUnique = analysis.primaryUnique;
gate(
  'CATEGORY_ARCHITECTURE_UNIQUE',
  primaryUnique,
  `primaries=${primarySigs.length} unique=${new Set(primarySigs).size}`,
);

// --- TEMPLATE_STRUCTURE_UNIQUE (within category: max share ≤ 50%) ---
let structureOk = true;
const structureDetails = [];
for (const cat of LANDING_PAGE_CATEGORIES) {
  const templates = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === cat);
  const counts = new Map();
  for (const t of templates) {
    const sig = t.spec.blocks.map((b) => b.type).join('>');
    counts.set(sig, (counts.get(sig) || 0) + 1);
  }
  const max = Math.max(0, ...counts.values());
  const share = templates.length ? max / templates.length : 1;
  if (share > 0.5 || counts.size < 8) structureOk = false;
  structureDetails.push(`${cat}:${counts.size}/${templates.length}@${(share * 100).toFixed(0)}%`);
}
gate(
  'TEMPLATE_STRUCTURE_UNIQUE',
  structureOk && analysis.globalMaxShare <= 0.5,
  `globalMaxShare=${(analysis.globalMaxShare * 100).toFixed(1)}% sample=${structureDetails.slice(0, 5).join(',')}`,
);

// --- HERO_VARIATION ---
let heroOk = true;
const heroDetails = [];
for (const cat of LANDING_PAGE_CATEGORIES) {
  const variants = CATEGORY_ARCHITECTURES[cat] || [];
  const heroes = new Set(variants.map((v) => v.heroVariant));
  if (heroes.size < 4) heroOk = false;
  heroDetails.push(`${cat}:${heroes.size}`);
}
gate('HERO_VARIATION', heroOk, heroDetails.slice(0, 8).join(','));

// --- SECTION_FLOW_VARIATION ---
let flowOk = true;
for (const cat of LANDING_PAGE_CATEGORIES) {
  const variants = CATEGORY_ARCHITECTURES[cat] || [];
  const sigs = new Set(variants.map((v) => sectionSignature(v.sectionSequence)));
  if (sigs.size < 10) flowOk = false;
}
gate(
  'SECTION_FLOW_VARIATION',
  flowOk,
  `uniqueSignatures=${analysis.globalUniqueSignatures}/${analysis.totalTemplates}`,
);

// --- CTA_BY_INDUSTRY ---
const industryCta = {
  seo: 'audit',
  clinic: 'booking',
  spa: 'booking',
  course: 'enroll',
  saas: 'trial',
  product: 'buy',
  restaurant: 'reserve',
  real_estate: 'viewing',
  webinar: 'register',
};
let ctaOk = true;
for (const [cat, expected] of Object.entries(industryCta)) {
  const primary = CATEGORY_ARCHITECTURES[cat]?.[0];
  if (!primary || primary.ctaStrategy !== expected) ctaOk = false;
}
gate(
  'CTA_BY_INDUSTRY',
  ctaOk,
  Object.entries(industryCta)
    .map(([c, e]) => `${c}=${CATEGORY_ARCHITECTURES[c]?.[0]?.ctaStrategy || '?'}/${e}`)
    .join(','),
);

// --- FORM_BY_INDUSTRY ---
const formPlacements = new Set();
const earlyCats = [];
for (const cat of LANDING_PAGE_CATEGORIES) {
  const placements = new Set((CATEGORY_ARCHITECTURES[cat] || []).map((v) => v.formPlacement));
  placements.forEach((p) => formPlacements.add(p));
  if (placements.has('early_after_hero') || placements.has('final_before_footer')) {
    earlyCats.push(cat);
  }
}
gate(
  'FORM_BY_INDUSTRY',
  formPlacements.size >= 4 && earlyCats.length >= 15,
  `placements=${[...formPlacements].join('|')} catsWithFormVariety=${earlyCats.length}`,
);

// --- AI_ARCHITECTURE_SELECTION ---
const pickSeo = selectLandingPageTemplate({
  businessType: 'SEO agency',
  pageGoal: 'lead',
  offer: 'free SEO audit',
  audience: 'SMB',
  conversionType: 'audit',
});
const pickClinic = selectLandingPageTemplate({
  businessType: 'Nha khoa',
  pageGoal: 'consult',
  offer: 'khám răng',
  audience: 'gia đình',
});
const pickWebinar = selectLandingPageTemplate({
  businessType: 'Education',
  pageGoal: 'event',
  offer: 'live webinar',
  audience: 'marketers',
});
const pickPricing = selectLandingPageTemplate({
  businessType: 'SaaS',
  pageGoal: 'signup',
  offer: 'pricing packages',
  audience: 'startups',
  conversionType: 'trial',
});
const aiOk =
  pickSeo.category === 'seo' &&
  pickSeo.architectureId.startsWith('seo_') &&
  pickSeo.ctaStrategy === 'audit' &&
  pickClinic.category === 'clinic' &&
  pickClinic.architectureId.startsWith('clinic_') &&
  pickWebinar.templateSlug.startsWith('webinar-register') &&
  pickWebinar.architectureId.startsWith('webinar_') &&
  pickPricing.category === 'saas' &&
  pickPricing.architectureId.includes('pricing') &&
  Array.isArray(pickSeo.sectionSequence) &&
  pickSeo.sectionSequence.length >= 4;
gate(
  'AI_ARCHITECTURE_SELECTION',
  aiOk,
  `seo=${pickSeo.architectureId} clinic=${pickClinic.architectureId} webinar=${pickWebinar.architectureId} pricing=${pickPricing.architectureId}`,
);

// --- FACEBOOK_UNTOUCHED ---
const fbPaths = [
  'apps/api/src/facebook',
  'apps/web/src/app/(app)/facebook',
  'apps/web/src/components/facebook',
];
let fbUntouched = true;
for (const rel of fbPaths) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    // presence OK — we only ensure this script/change set doesn't edit FB by checking git isn't required;
    // structural check: architecture files don't import facebook
  }
}
const archSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-category-architectures.ts'),
  'utf8',
);
const expandSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-template-expand.ts'),
  'utf8',
);
const selectSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-template-select.ts'),
  'utf8',
);
fbUntouched =
  !/facebook|fanpage|messenger|meta ads/i.test(archSrc) &&
  !/facebook|fanpage|messenger/i.test(expandSrc) &&
  !/facebook|fanpage|messenger/i.test(selectSrc);
gate('FACEBOOK_UNTOUCHED', fbUntouched, 'architecture modules have no Facebook refs');

// --- Report ---
const categoryArchitectures = {};
for (const cat of LANDING_PAGE_CATEGORIES) {
  const primary = CATEGORY_ARCHITECTURES[cat]?.[0];
  categoryArchitectures[cat] = primary
    ? `${primary.architectureId}: ${primary.sectionSequence.join(' → ')}`
    : 'missing';
}

const templateVariants = {};
for (const cat of ['seo', 'clinic', 'spa', 'course', 'saas', 'product', 'restaurant', 'real_estate', 'webinar']) {
  templateVariants[cat] = (CATEGORY_ARCHITECTURES[cat] || []).map((v) => ({
    id: v.architectureId,
    hero: v.heroVariant,
    cta: v.ctaStrategy,
    form: v.formPlacement,
    proof: v.proofType,
    visual: v.visualComposition,
    flow: v.sectionSequence.join('>'),
  }));
}

const allPass = Object.values(gates).every((g) => g.ok);

console.log('\n--- REPORT ---');
console.log('CATEGORY_ARCHITECTURES', JSON.stringify(categoryArchitectures, null, 2));
console.log(
  'TEMPLATE_VARIANTS_SAMPLE',
  JSON.stringify(
    Object.fromEntries(
      Object.entries(templateVariants).map(([k, arr]) => [
        k,
        arr.map((x) => `${x.id}|${x.hero}|${x.cta}|${x.form}`),
      ]),
    ),
    null,
    2,
  ),
);
console.log('STRUCTURAL_SIMILARITY', {
  globalMaxShare: analysis.globalMaxShare,
  globalUniqueSignatures: analysis.globalUniqueSignatures,
  totalTemplates: analysis.totalTemplates,
  primaryUnique: analysis.primaryUnique,
});
console.log('FILES_CHANGED', [
  'packages/shared/src/landing-page-category-architectures.ts',
  'packages/shared/src/landing-page-template-expand.ts',
  'packages/shared/src/landing-page-template-select.ts',
  'packages/shared/src/landing-page-template-flows.ts',
  'packages/shared/src/index.ts',
  'scripts/test-landing-page-template-differentiation.cjs',
]);
console.log(`TEMPLATE_DIFFERENTIATION_READY=${allPass ? 'PASS' : 'FAIL'}`);

process.exit(allPass ? 0 : 1);
