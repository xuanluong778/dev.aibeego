#!/usr/bin/env node
/**
 * Production catalog validators for Landing Page templates.
 *   node scripts/validate-landing-page-template-catalog.cjs
 */
const shared = require('../packages/shared/dist/index.js');

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  validateLandingPageTemplateCatalog,
  selectLandingPageTemplate,
  isCanonicalTemplateSlug,
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
} = shared;

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const report = validateLandingPageTemplateCatalog(LANDING_PAGE_SYSTEM_TEMPLATES);
gate(
  'CATALOG_VALIDATORS',
  report.ok,
  `errors=${report.errors.length} warnings=${report.warnings.length} n=${report.stats.total}`,
);
if (report.errors.length) {
  for (const e of report.errors.slice(0, 12)) {
    console.log('  ERR', e.code, e.slug || e.category || '', e.message);
  }
}
if (report.warnings.length) {
  for (const w of report.warnings.slice(0, 8)) {
    console.log('  WARN', w.code, w.category || '', w.message.slice(0, 120));
  }
}

gate(
  'FINGERPRINTS_UNIQUE_GLOBAL_ISH',
  report.stats.uniqueFingerprints >= report.stats.total * 0.9,
  `fp=${report.stats.uniqueFingerprints}/${report.stats.total}`,
);

const pickSpa = selectLandingPageTemplate({
  businessType: 'Spa wellness',
  pageGoal: 'booking',
  offer: 'facial massage',
  designFamily: 'luxury',
  conversionGoal: 'booking',
  tags: ['spa', 'premium'],
});
gate(
  'SELECTOR_CANONICAL_SLUG',
  isCanonicalTemplateSlug(pickSpa.templateSlug, LANDING_PAGE_SYSTEM_TEMPLATES) &&
    pickSpa.category === 'spa' &&
    pickSpa.designFamily &&
    pickSpa.conversionGoal,
  `${pickSpa.templateSlug} family=${pickSpa.designFamily} goal=${pickSpa.conversionGoal}`,
);

const pickBad = selectLandingPageTemplate({ templateSlug: 'does-not-exist-xyz' });
gate(
  'SELECTOR_UNKNOWN_SLUG_FALLBACK',
  isCanonicalTemplateSlug(pickBad.templateSlug, LANDING_PAGE_SYSTEM_TEMPLATES) &&
    pickBad.templateSlug !== 'does-not-exist-xyz',
  pickBad.templateSlug,
);

const pickOffer = selectLandingPageTemplate({
  businessType: 'Spa',
  offer: 'combo ưu đãi facial',
  conversionGoal: 'booking',
  tags: ['offer', 'conversion'],
});
gate(
  'SELECTOR_SPA_OFFER_BOOKING',
  pickOffer.category === 'spa' &&
    isCanonicalTemplateSlug(pickOffer.templateSlug, LANDING_PAGE_SYSTEM_TEMPLATES),
  `${pickOffer.templateSlug} goal=${pickOffer.conversionGoal}`,
);

gate(
  'CATALOG_VERSION_PRESENT',
  typeof LANDING_PAGE_TEMPLATE_CATALOG_VERSION === 'string' &&
    LANDING_PAGE_TEMPLATE_CATALOG_VERSION.startsWith('gallery-'),
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
);

const allPass = Object.values(gates).every((g) => g.ok) && report.ok;
console.log(`\nTEMPLATE_CATALOG_VALIDATORS=${allPass ? 'PASS' : 'FAIL'}`);
process.exitCode = allPass ? 0 : 1;
