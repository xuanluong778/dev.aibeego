#!/usr/bin/env node
/**
 * Landing Page Template Engine gates (Webinar + AI select + Preview + Perf).
 *   node scripts/test-landing-page-template-engine.cjs
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
  selectLandingPageTemplate,
  sanitizeLandingPageSpec,
  validateLandingPageSpec,
  applyLandingPageAiCopyToSpec,
  buildFallbackLandingPageAiCopy,
  createEmptyLandingPageSpec,
} = shared;

const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const templatesPage = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/templates/page.tsx'),
  'utf8',
);
const templatesSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-templates.ts'),
  'utf8',
);
const selectSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-template-select.ts'),
  'utf8',
);
const serviceSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const autosaveSrc = serviceSrc;
const dtoSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/dto/landing-pages.dto.ts'),
  'utf8',
);

// --- WEBINAR_COMPLETE ---
const webinar = LANDING_PAGE_SYSTEM_TEMPLATES.find((t) => t.slug === 'webinar-register');
const webinarTypes = (webinar?.spec?.blocks || []).map((b) => b.type);
const requiredOrder = [
  'Header',
  'Hero',
  'Features', // Trust/USP
  'Benefits',
  'Process', // Nội dung chương trình
  'Speaker',
  'Process', // Quy trình
  'Testimonials',
  'Guarantee',
  'FAQ',
  'LeadForm',
  'CTA',
  'Footer',
];
const orderOk =
  webinar &&
  requiredOrder.every((t, i) => webinarTypes[i] === t) &&
  webinar.spec.meta?.layout === 'webinar';

const hero = webinar?.spec?.blocks?.find((b) => b.type === 'Hero');
const heroFieldsOk =
  hero &&
  hero.headline &&
  hero.eventDate &&
  hero.eventTime &&
  hero.eventFormat &&
  hero.ctaLabel &&
  Array.isArray(hero.trustPoints) &&
  hero.trustPoints.length >= 2;

gate(
  'WEBINAR_COMPLETE',
  orderOk && heroFieldsOk && renderer.includes("case 'Header'") && renderer.includes("case 'Speaker'"),
  `blocks=${webinarTypes.join('→')} heroMeta=${!!heroFieldsOk}`,
);

// --- AI_TEMPLATE_SELECTION ---
const pickWebinar = selectLandingPageTemplate({
  pageGoal: 'event',
  productService: 'Webinar AI Automation',
  audience: 'SME owners',
});
const pickSaas = selectLandingPageTemplate({
  businessType: 'saas',
  pageGoal: 'signup',
  offer: '14-day trial',
});
const pickOverride = selectLandingPageTemplate({
  templateSlug: 'webinar-register',
  pageGoal: 'lead',
});
const aiWired =
  serviceSrc.includes('selectLandingPageTemplate') &&
  serviceSrc.includes('templateSelection') &&
  dtoSrc.includes('businessType') &&
  dtoSrc.includes('templateSlug') &&
  selectSrc.includes('export function selectLandingPageTemplate');

gate(
  'AI_TEMPLATE_SELECTION',
  pickWebinar.templateSlug === 'webinar-register' &&
    pickWebinar.layout === 'webinar' &&
    pickSaas.category === 'saas' &&
    pickOverride.reason === 'explicit templateSlug' &&
    aiWired,
  `${pickWebinar.templateSlug}/${pickSaas.templateSlug}`,
);

// --- SCHEMA_COMPATIBLE ---
const classic = createEmptyLandingPageSpec();
const classicV = validateLandingPageSpec(classic);
const webinarSan = sanitizeLandingPageSpec(structuredClone(webinar.spec));
const webinarV = validateLandingPageSpec(webinarSan);
const filled = applyLandingPageAiCopyToSpec(
  webinarSan,
  buildFallbackLandingPageAiCopy({
    productService: 'Webinar test',
    targetCustomer: 'SME',
    uspBenefits: 'Framework',
    pageGoal: 'event',
  }),
);
const layoutPreserved = filled.meta?.layout === 'webinar' && filled.blocks[0]?.type === 'Header';
const noPerPageSource =
  !templatesSrc.includes('generateLandingPageHtml') &&
  !serviceSrc.includes('eval(') &&
  serviceSrc.includes('needsTemplateSeed');

gate(
  'SCHEMA_COMPATIBLE',
  classicV.ok && webinarV.ok && layoutPreserved && noPerPageSource,
  `classic=${classicV.ok} webinar=${webinarV.ok} layout=${filled.meta?.layout}`,
);

// --- PREVIEW_RESPONSIVE ---
gate(
  'PREVIEW_RESPONSIVE',
  templatesPage.includes('Xem trước') &&
    templatesPage.includes('Sử dụng mẫu') &&
    templatesPage.includes('LandingPageRenderer') &&
    templatesPage.includes("'desktop'") &&
    templatesPage.includes("'tablet'") &&
    templatesPage.includes("'mobile'") &&
    (templatesPage.includes('TemplateHoverPreview') || templatesPage.includes('thumbGradient')) &&
    renderer.includes("desktop: '100%'") &&
    renderer.includes("tablet: '768px'") &&
    renderer.includes("mobile: '390px'"),
  'gallery + viewport preview',
);

// --- PERFORMANCE ---
// Hero headline uses a single InlineEditable as="h1" factory (parity BUG05) —
// not N literal <h1> tags per layout branch. Count semantic h1 bindings instead.
const h1Literal = (renderer.match(/<h1[\s>]/g) || []).length;
const h1AsProp = (renderer.match(/as=["']h1["']/g) || []).length;
const h1Count = h1Literal + h1AsProp;
gate(
  'PERFORMANCE',
  h1Count >= 1 &&
    h1Count <= 4 &&
    h1AsProp >= 1 &&
    renderer.includes('resolveBlockVariant') &&
    renderer.includes('data-lp-variant') &&
    renderer.includes('loading="lazy"') &&
    renderer.includes('loading="eager"') &&
    renderer.includes('fetchPriority="high"') &&
    renderer.includes('width={') &&
    renderer.includes('decoding="async"') &&
    renderer.includes('<header') &&
    renderer.includes('<nav') &&
    renderer.includes('aria-label') &&
    !renderer.includes('framer-motion') &&
    !renderer.includes('animate-bounce'),
  `h1Literal=${h1Literal} h1As=${h1AsProp} variantWired lazy+eager+dims`,
);

// --- Regression untouched ---
gate(
  'AUTOSAVE_UNTOUCHED',
  autosaveSrc.includes('async autosave') &&
    autosaveSrc.includes('AutosaveLandingPageDto') &&
    /autosave[\s\S]{0,800}draftSpec/.test(autosaveSrc),
  'autosave path present',
);
gate(
  'PUBLISH_UNTOUCHED',
  serviceSrc.includes('async publish') &&
    serviceSrc.includes('LandingPageStatus.PUBLISHED') &&
    serviceSrc.includes('publishedSpec'),
  'publish path present',
);
gate(
  'FACEBOOK_UNTOUCHED',
  !/facebook\.com|Fanpage|App Review|auto.?post/i.test(renderer) &&
    !/facebook\.com|Fanpage|App Review/i.test(templatesSrc) &&
    !/facebook\.com|Fanpage|App Review/i.test(selectSrc) &&
    !serviceSrc.includes('facebookAppReview'),
  'no FB coupling in LP template engine',
);

const critical = [
  'WEBINAR_COMPLETE',
  'AI_TEMPLATE_SELECTION',
  'SCHEMA_COMPATIBLE',
  'PREVIEW_RESPONSIVE',
  'PERFORMANCE',
  'AUTOSAVE_UNTOUCHED',
  'PUBLISH_UNTOUCHED',
  'FACEBOOK_UNTOUCHED',
];
const failed = critical.filter((k) => !gates[k]?.ok);
const ready = failed.length === 0;

console.log('\n--- REPORT ---');
console.log(
  `WEBINAR_UPGRADED=${gates.WEBINAR_COMPLETE?.ok ? 'PASS' : 'FAIL'} | AI_ENGINE=${gates.AI_TEMPLATE_SELECTION?.ok ? 'PASS' : 'FAIL'} | PREVIEW=${gates.PREVIEW_RESPONSIVE?.ok ? 'PASS' : 'FAIL'} | PERFORMANCE=${gates.PERFORMANCE?.ok ? 'PASS' : 'FAIL'}`,
);
console.log(
  `REGRESSION: AUTOSAVE=${gates.AUTOSAVE_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} PUBLISH=${gates.PUBLISH_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} FACEBOOK=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} SCHEMA=${gates.SCHEMA_COMPATIBLE?.ok ? 'PASS' : 'FAIL'}`,
);
console.log(`TEMPLATE_SYSTEM_READY=${ready ? 'PASS' : 'FAIL'}`);
if (failed.length) {
  console.log('FAILED_GATES:', failed.join(', '));
  for (const k of failed) console.log(' ', k, gates[k]?.detail);
  process.exitCode = 1;
}
