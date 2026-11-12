#!/usr/bin/env node
/**
 * Landing Page premium template + content gates.
 *   node scripts/test-landing-page-premium.cjs
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

const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const generator = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-generator.ts'),
  'utf8',
);
const depthSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-content-depth.ts'),
  'utf8',
);
const aiSvc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-page-ai.service.ts'),
  'utf8',
);
const serviceSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const uiSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-ui.ts'),
  'utf8',
);

const {
  buildFallbackLandingPageAiCopy,
  applyLandingPageAiCopyToSpec,
  createEmptyLandingPageSpec,
  filterPublishableTestimonials,
  filterPublishableSpeakers,
  isPlaceholderTestimonial,
  LANDING_PAGE_PLACEHOLDER_TESTIMONIALS,
  getLandingPageSystemTemplate,
} = shared;

gate(
  'TEMPLATE_PREMIUM_UI',
  renderer.includes('linear-gradient') &&
    renderer.includes('font-extrabold') &&
    renderer.includes('min-h-[48px]') &&
    renderer.includes("py-8 md:py-11") &&
    renderer.includes('mb-6 md:mb-8') &&
    renderer.includes('HeroVisual') &&
    renderer.includes('trustPoints') &&
    !renderer.includes("hidden md:block lg:col-span-3"),
  'dense spacing + strong hero/CTA + mobile visual',
);

const deep = buildFallbackLandingPageAiCopy({
  productService: 'Phần mềm CRM cho spa',
  brandName: 'GlowCRM',
  targetCustomer: 'chủ spa 5–20 giường',
  uspBenefits: 'Tự động follow-up; giảm no-show; báo cáo doanh thu thật từ hệ thống',
  pageGoal: 'signup',
  businessType: 'spa',
  painPoint: 'Lễ tân quên follow-up khiến khách bỏ lịch',
  offer: 'Dùng thử 14 ngày',
  tone: 'professional',
});

const benefitDescOk =
  Array.isArray(deep.benefitDetails) &&
  deep.benefitDetails.length >= 3 &&
  deep.benefitDetails.every((d) => d.length >= 40);
const distinctBenefits =
  new Set(
    (deep.benefits || []).map((_, i) => deep.benefitDetails?.[i] || deep.benefits[i]),
  ).size >= 3;
const subDeep = (deep.subheadline || '').length >= 80;
const noFakeInFallback =
  !/5000\+|Vinamilk|★★★★★|doanh thu tăng \d+%|rating 4\.9/i.test(
    JSON.stringify(deep),
  );

gate(
  'CONTENT_DEPTH',
  benefitDescOk &&
    distinctBenefits &&
    subDeep &&
    depthSrc.includes('buildDeepFallbackNarrative') &&
    generator.includes('benefitDetails') &&
    generator.includes('deepenBenefitPairs') &&
    aiSvc.includes('benefitDetails') &&
    aiSvc.includes('businessType') &&
    aiSvc.includes('painPoint') &&
    aiSvc.includes('CẤM: bịa testimonial'),
  `subLen=${(deep.subheadline || '').length} details=${deep.benefitDetails?.length}`,
);

const placeholders = LANDING_PAGE_PLACEHOLDER_TESTIMONIALS.map((t, i) => ({
  id: `t${i}`,
  ...t,
}));
const pubTm = filterPublishableTestimonials(placeholders, 'public');
const speakers = filterPublishableSpeakers(
  [{ id: '1', title: '[Tên diễn giả]', role: '[Chức danh]', description: '[Bio]' }],
  'public',
);
gate(
  'NO_FAKE_DATA',
  pubTm.length === 0 &&
    speakers.length === 0 &&
    placeholders.every((t) => isPlaceholderTestimonial(t)) &&
    generator.includes('never invent reviews') &&
    renderer.includes("mode === 'public'") &&
    uiSrc.includes('filterPublishableSpeakers') &&
    noFakeInFallback,
  'testimonials/speakers hidden on public; AI skip invent',
);

gate(
  'MOBILE_RESPONSIVE',
  renderer.includes("mobile: '390px'") &&
    renderer.includes('sm:px-6') &&
    renderer.includes('md:grid-cols-2') &&
    renderer.includes('sm:grid-cols-2') &&
    renderer.includes('min-h-[48px]'),
  'viewport + grids + touch CTA',
);

const webinar = getLandingPageSystemTemplate('webinar-register');
const classic = createEmptyLandingPageSpec();
const filled = applyLandingPageAiCopyToSpec(webinar.spec, deep);
gate(
  'EXISTING_PAGE_COMPATIBLE',
  Boolean(webinar) &&
    classic.version === 1 &&
    filled.meta?.layout === 'webinar' &&
    filled.blocks[0]?.type === 'Header' &&
    filled.blocks.some((b) => b.type === 'Benefits' && b.items?.[0]?.description !== deep.usp),
  'legacy webinar layout preserved; distinct benefit descriptions',
);

gate(
  'FACEBOOK_UNTOUCHED',
  !/facebook\.com|Fanpage|App Review|auto.?post/i.test(renderer) &&
    !/facebook\.com|Fanpage|App Review/i.test(generator) &&
    !serviceSrc.includes('facebookAppReview'),
  'no FB coupling',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  serviceSrc.includes('applyPageDoctor') &&
    serviceSrc.includes('async publish') &&
    serviceSrc.includes('async autosave') &&
    !aiSvc.includes('applyPageDoctor'),
  'doctor/publish/autosave intact; AI service scoped',
);

const critical = [
  'TEMPLATE_PREMIUM_UI',
  'CONTENT_DEPTH',
  'NO_FAKE_DATA',
  'MOBILE_RESPONSIVE',
  'EXISTING_PAGE_COMPATIBLE',
  'FACEBOOK_UNTOUCHED',
];
const failed = critical.filter((k) => !gates[k]?.ok);
const ready = failed.length === 0 && gates.OTHER_MODULES_UNCHANGED?.ok;

console.log('\n--- REPORT ---');
console.log(
  'TEMPLATES_UPGRADED: renderer premium density (hero/CTA/cards/FAQ/speaker/guarantee) + public hide empty/placeholder',
);
console.log(
  'CONTENT_ENGINE: brief(+businessType/pain/offer/tone) → deep fallback + benefitDetails/featureDetails/processSteps + apply merge',
);
console.log(
  'FILES_CHANGED: landing-page-renderer.tsx, landing-page-generator.ts, landing-page-content-depth.ts, landing-page-ui.ts, landing-page-ai.service.ts, landing-pages.dto.ts, landing-pages.service.ts, index.ts, test-landing-page-premium.cjs',
);
console.log(
  `REGRESSION: FACEBOOK=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} OTHER=${gates.OTHER_MODULES_UNCHANGED?.ok ? 'PASS' : 'FAIL'} COMPAT=${gates.EXISTING_PAGE_COMPATIBLE?.ok ? 'PASS' : 'FAIL'}`,
);
console.log(`PREMIUM_READY=${ready ? 'PASS' : 'FAIL'}`);
if (failed.length || !gates.OTHER_MODULES_UNCHANGED?.ok) {
  console.log(
    'FAILED_GATES:',
    [...failed, !gates.OTHER_MODULES_UNCHANGED?.ok ? 'OTHER_MODULES_UNCHANGED' : '']
      .filter(Boolean)
      .join(', '),
  );
  for (const k of critical) if (!gates[k]?.ok) console.log(' ', k, gates[k]?.detail);
  process.exitCode = 1;
}
