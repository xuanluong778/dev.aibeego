#!/usr/bin/env node
/**
 * Business Profile autofill regression for Landing Page.
 */
const fs = require('fs');
const path = require('path');
const {
  applyBusinessProfileToSpec,
  createEmptyLandingPageSpec,
  isBusinessProfileEmpty,
  markLandingPageUserEdits,
  preserveUserEditedFields,
  markLandingPageAiSources,
  businessProfileToAiBrief,
  leadFormFieldsForGoal,
  buildFallbackLandingPageAiCopy,
  applyLandingPageAiCopyToSpec,
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
const schema = fs.readFileSync(path.join(root, 'packages/database/prisma/schema.prisma'), 'utf8');
const mig = fs.readFileSync(
  path.join(
    root,
    'packages/database/prisma/migrations/20260906180000_landing_page_business_profile/migration.sql',
  ),
  'utf8',
);
const svc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const ctrl = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'),
  'utf8',
);
const create = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/create/page.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);

assert(schema.includes('model BusinessProfile'), 'DB model BusinessProfile');
assert(mig.includes('business_profiles'), 'migration present');
assert(svc.includes('organizationId') && svc.includes('getBusinessProfile'), 'tenant-scoped get');
assert(svc.includes('findUnique({ where: { organizationId } })'), 'lookup by org only');
assert(ctrl.includes("Get('business-profile')") && ctrl.includes('apply-business-profile'), 'API routes');
assert(create.includes('Dùng thông tin doanh nghiệp'), 'Create UX button');
assert(builder.includes('Dùng thông tin doanh nghiệp') && builder.includes('Điền lại'), 'Builder UX');
assert(!svc.toLowerCase().includes('auto-post') && !create.includes('pages_'), 'Facebook untouched');

assert(isBusinessProfileEmpty({}), 'missing/empty profile');
assert(isBusinessProfileEmpty({ brandName: '  ' }), 'whitespace-only empty');
assert(!isBusinessProfileEmpty({ brandName: 'AZ' }), 'partial profile not empty');

const profile = {
  brandName: 'Spa Hoa',
  companyName: 'Spa Hoa Co',
  hotline: '0901234567',
  email: 'hi@spa.vn',
  address: 'Q1',
  productService: 'Liệu trình nám',
  targetCustomer: 'Phụ nữ 25-45',
  usp: 'Công nghệ cao, cam kết rõ',
  brandColor: '#c026d3',
  website: 'https://spa.vn',
  defaultCta: '',
};

const empty = createEmptyLandingPageSpec();
const filled = applyBusinessProfileToSpec(empty, profile, { pageGoal: 'consult' });
assert(filled.seo.title.includes('Spa Hoa'), 'SEO brand autofill');
assert(filled.themeTokens.primary === '#c026d3', 'brand color autofill');
const hero = filled.blocks.find((b) => b.type === 'Hero');
assert(hero?.headline?.includes('Spa Hoa'), 'Hero brand');
assert(hero?.ctaLabel?.includes('0901234567') || hero?.ctaUrl?.includes('0901234567'), 'CTA hotline');
const footer = filled.blocks.find((b) => b.type === 'Footer');
assert(footer?.body?.includes('0901234567') && footer.body.includes('hi@spa.vn'), 'Footer contact');
const lead = filled.blocks.find((b) => b.type === 'LeadForm');
assert(lead?.fields?.some((f) => f.name === 'need'), 'LeadForm fields by goal');
assert(filled.meta?.fieldSources && Object.values(filled.meta.fieldSources).includes('profile'), 'source=profile');

// User override then profile apply without force keeps user text
const edited = markLandingPageUserEdits(
  { ...filled, blocks: filled.blocks.map((b) => (b.type === 'Hero' ? { ...b, headline: 'USER HEADLINE' } : b)) },
  [`${hero.id}.headline`],
);
const reapply = applyBusinessProfileToSpec(edited, profile, { force: false });
const hero2 = reapply.blocks.find((b) => b.id === hero.id);
assert(hero2?.headline === 'USER HEADLINE', 'user override preserved without force');

const forced = applyBusinessProfileToSpec(edited, profile, { force: true });
const hero3 = forced.blocks.find((b) => b.id === hero.id);
assert(hero3?.headline !== 'USER HEADLINE', 'force refill overwrites user');

// AI regenerate preserves user fields
const aiCopy = buildFallbackLandingPageAiCopy(
  businessProfileToAiBrief(profile, { pageGoal: 'lead' }),
);
const aiSpec = applyLandingPageAiCopyToSpec(createEmptyLandingPageSpec(), aiCopy);
const withUser = markLandingPageUserEdits(
  {
    ...aiSpec,
    blocks: aiSpec.blocks.map((b) => (b.type === 'Hero' ? { ...b, headline: 'KEEP ME' } : b)),
  },
  [`${aiSpec.blocks.find((b) => b.type === 'Hero').id}.headline`],
);
const regenerated = applyLandingPageAiCopyToSpec(withUser, aiCopy);
const preserved = preserveUserEditedFields(withUser, markLandingPageAiSources(regenerated));
const heroKeep = preserved.blocks.find((b) => b.type === 'Hero');
assert(heroKeep?.headline === 'KEEP ME', 'regenerate keeps user custom headline');

assert(leadFormFieldsForGoal('event').some((f) => f.name === 'company'), 'event lead fields');
assert(leadFormFieldsForGoal('sales').some((f) => f.name === 'need'), 'sales lead fields');

// sanitize keeps meta
const { sanitizeLandingPageSpec } = require('../packages/shared/dist/index.js');
const sanitized = sanitizeLandingPageSpec(filled);
assert(sanitized.meta?.fieldSources, 'autosave sanitize preserves meta');

// Multi-block same type: preserve by ordinal, not first-CTA-wins
{
  const prev = {
    ...createEmptyLandingPageSpec(),
    blocks: [
      {
        id: 'cta_a',
        type: 'CTA',
        enabled: true,
        spacing: 'md',
        headline: 'CTA A USER',
        ctaLabel: 'A',
        ctaUrl: '#a',
      },
      {
        id: 'cta_b',
        type: 'CTA',
        enabled: true,
        spacing: 'md',
        headline: 'CTA B USER',
        ctaLabel: 'B',
        ctaUrl: '#b',
      },
      {
        id: 'faq_1',
        type: 'FAQ',
        enabled: true,
        spacing: 'md',
        headline: 'FAQ KEEP',
        items: [],
      },
    ],
  };
  const markedPrev = markLandingPageUserEdits(prev, [
    'cta_a.headline',
    'cta_a.ctaLabel',
    'cta_b.headline',
    'faq_1.headline',
  ]);
  const next = {
    ...markedPrev,
    blocks: [
      {
        id: 'cta_new1',
        type: 'CTA',
        enabled: true,
        spacing: 'md',
        headline: 'AI CTA1',
        ctaLabel: 'AI1',
        ctaUrl: '#1',
      },
      {
        id: 'cta_new2',
        type: 'CTA',
        enabled: true,
        spacing: 'md',
        headline: 'AI CTA2',
        ctaLabel: 'AI2',
        ctaUrl: '#2',
      },
      {
        id: 'faq_new',
        type: 'FAQ',
        enabled: true,
        spacing: 'md',
        headline: 'AI FAQ',
        items: [],
      },
    ],
  };
  const kept = preserveUserEditedFields(markedPrev, markLandingPageAiSources(next));
  const ctas = kept.blocks.filter((b) => b.type === 'CTA');
  const faq = kept.blocks.find((b) => b.type === 'FAQ');
  assert(ctas[0]?.headline === 'CTA A USER' && ctas[0]?.ctaLabel === 'A', 'multi CTA ordinal #1');
  assert(ctas[1]?.headline === 'CTA B USER', 'multi CTA ordinal #2');
  assert(faq?.headline === 'FAQ KEEP', 'FAQ not overwritten by CTA preserve');
}

// Public surface strips builder provenance only (keep canvas render meta)
assert(
  svc.includes('toPublicSpec') &&
    svc.includes('fieldSources:') &&
    svc.includes('clientRevision:') &&
    !/meta:\s*\{\s*\.\.\.\(layout\s*\?\s*\{\s*layout/.test(svc),
  'public getBySlug strips provenance via toPublicSpec (keeps canvas meta)',
);
const pubCtrl = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages-public.controller.ts'),
  'utf8',
);
assert(
  !pubCtrl.includes('business-profile') && !pubCtrl.includes('BusinessProfile'),
  'public controller has no BusinessProfile routes',
);

// SSOT: seed only when missing; PATCH filters undefined
assert(svc.includes('if (!row)') && svc.includes('businessProfile.create'), 'org seed only when missing');
assert(
  svc.includes('Object.entries(data).filter(([, v]) => v !== undefined)'),
  'PATCH only sent fields',
);

// Auth guards on BusinessProfile + apply IDOR guard
assert(
  ctrl.includes("Get('business-profile')") &&
    ctrl.includes('JwtAuthGuard') &&
    ctrl.includes('TenantGuard'),
  'BP routes behind auth+tenant',
);
assert(svc.includes('assertPage(user.organizationId, pageId)'), 'apply is org-scoped page assert');
assert(
  svc.includes('findUnique({ where: { organizationId } })') &&
    !svc.match(/businessProfile\.findUnique\(\{[^}]*id:/),
  'BP lookup by organizationId only',
);
if (process.exitCode) {
  console.error('BUSINESS_PROFILE_LP=FAIL');
  process.exit(1);
}
console.log('BUSINESS_PROFILE_LP=PASS');
