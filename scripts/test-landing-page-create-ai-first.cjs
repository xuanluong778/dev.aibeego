#!/usr/bin/env node
/**
 * Landing Page Create / AI-first regression (shared + static checks).
 */
const fs = require('fs');
const path = require('path');
const {
  normalizeLandingPageAiBrief,
  buildFallbackLandingPageAiCopy,
  applyLandingPageAiCopyToSpec,
  createEmptyLandingPageSpec,
  LANDING_PAGE_AI_GOALS,
  LANDING_PAGE_THEMES,
  parseLandingPageAiCopy,
} = require('../packages/shared/dist/index.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exitCode = 1;
    return false;
  }
  console.log('PASS', msg);
  return true;
}

const root = path.join(__dirname, '..');
const createPage = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/create/page.tsx'),
  'utf8',
);
const dto = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/dto/landing-pages.dto.ts'),
  'utf8',
);
const svc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const gen = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-generator.ts'),
  'utf8',
);

assert(createPage.includes("id: 'ai'") && createPage.includes("id: 'url'") && createPage.includes("id: 'template'") && createPage.includes("id: 'blank'"), 'UX has 4 start modes');
assert(createPage.includes('Tạo Landing Page bằng AI'), 'Primary AI CTA present');
assert(createPage.includes('submitLock'), 'Double-submit lock present');
assert(createPage.includes('sm:grid-cols-3') || createPage.includes('sm:grid-cols-2') || createPage.includes('lg:grid-cols-4'), 'Responsive grid classes');
assert(createPage.includes("phase === 'generating'") || createPage.includes("phase === 'previewing'"), 'Generating/preview state present');
assert(createPage.includes('previewAi') && createPage.includes('createDraftFromPreview'), 'Preview → Create Draft flow');

assert(dto.includes('brandName') && dto.includes('pageGoal') && dto.includes('sourceUrl'), 'DTO additive fields');
assert(dto.includes('@IsOptional()') && dto.includes('uspBenefits?'), 'uspBenefits optional');
assert(svc.includes('fetchPublicHtmlSafe') && svc.includes('sourceUrl'), 'URL enrich in generateAi');

assert(gen.includes('landing-page-generator.v1'), 'Schema version unchanged');
assert(gen.includes('guarantee') && gen.includes('theme') && gen.includes('features'), 'AI copy additive fields');
assert(LANDING_PAGE_AI_GOALS.includes('lead'), 'Goals exported');

// Validation / normalize without USP
const brief = normalizeLandingPageAiBrief({
  productService: 'Dịch vụ SEO',
  brandName: 'AutoAZ',
  targetCustomer: 'Chủ spa',
  pageGoal: 'lead',
});
assert(brief.uspBenefits.length > 0, 'USP derived when omitted');

const fallback = buildFallbackLandingPageAiCopy(brief);
assert(fallback.mode === 'fallback', 'AI fallback copy');
assert(fallback.theme && fallback.guarantee === '', 'Fallback keeps theme without inventing a guarantee');

const applied = applyLandingPageAiCopyToSpec(createEmptyLandingPageSpec(), fallback);
const types = applied.blocks.map((b) => b.type);
for (const need of ['Hero', 'Benefits', 'Features', 'Pricing', 'Guarantee', 'FAQ', 'CTA', 'LeadForm', 'Footer']) {
  assert(types.includes(need), `Applied blocks include ${need}`);
}
assert(applied.seo.title.length > 0 && applied.seo.metaDescription.length > 0, 'SEO filled');
assert(
  typeof applied.theme === 'string' && LANDING_PAGE_THEMES.includes(applied.theme),
  'Theme applied to spec',
);

// Backward compat: old AI JSON without new keys still parses
const legacy = parseLandingPageAiCopy({
  schemaVersion: 'landing-page-generator.v1',
  headline: 'H',
  subheadline: 'S',
  painPoints: ['a'],
  usp: 'u',
  benefits: ['b1', 'b2', 'b3'],
  cta: 'Go',
  pricingCopy: 'Price',
  faq: [{ question: 'Q?', answer: 'A' }],
  seoTitle: 'T',
  metaDescription: 'M',
  mode: 'ai',
});
assert(legacy.theme === 'MODERN' && Array.isArray(legacy.features), 'Legacy AI JSON still parses');

assert(!createPage.toLowerCase().includes('facebook') && !createPage.includes('pages_'), 'Create page no Facebook surface');
assert(svc.includes('withIdempotency') && svc.includes('idempotencyKey'), 'Server idempotency for create/generate');
assert(createPage.includes('idempotencyKey'), 'Create UI sends idempotencyKey');
assert(dto.includes('idempotencyKey'), 'DTO has idempotencyKey');

// URL fail still produces usable brief/fallback
{
  const fromUrlFail = buildFallbackLandingPageAiCopy(
    normalizeLandingPageAiBrief({
      productService: 'example.com',
      brandName: 'Ex',
      targetCustomer: 'Khách B2B',
      pageGoal: 'sales',
      sourceUrl: 'https://this-should-not-matter.invalid',
      extraNotes: 'URL fetch fail path',
    }),
  );
  assert(fromUrlFail.mode === 'fallback' && fromUrlFail.headline, 'URL fail still generates fallback');
}
if (process.exitCode) {
  console.error('CREATE_AI_FIRST=FAIL');
  process.exit(1);
}
console.log('CREATE_AI_FIRST=PASS');
