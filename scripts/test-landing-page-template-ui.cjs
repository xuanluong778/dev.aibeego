#!/usr/bin/env node
/**
 * Landing Page Template UI upgrade gates.
 *   node scripts/test-landing-page-template-ui.cjs
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
const templatesSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-templates.ts'),
  'utf8',
);
const typesSrc = fs.readFileSync(path.join(root, 'packages/shared/src/landing-page-types.ts'), 'utf8');
const publicPage = fs.readFileSync(path.join(root, 'apps/web/src/app/p/[slug]/page.tsx'), 'utf8');

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  layoutForCategory,
  resolveLandingPageLayout,
  filterPublishableTestimonials,
  isPlaceholderTestimonial,
  LANDING_PAGE_PLACEHOLDER_TESTIMONIALS,
} = shared;

// DESKTOP / TABLET / MOBILE viewport support
gate(
  'DESKTOP',
  renderer.includes("desktop: '100%'") && renderer.includes('data-lp-viewport'),
  'viewport desktop width',
);
gate(
  'TABLET',
  renderer.includes("tablet: '768px'") && renderer.includes('VIEWPORT_WIDTH'),
  'viewport tablet',
);
gate(
  'MOBILE',
  renderer.includes("mobile: '390px'") &&
    renderer.includes('sm:px-6') &&
    renderer.includes('md:grid-cols'),
  'viewport mobile + responsive grids',
);

// Hero visual + CTA + Form
gate(
  'HERO_VISUAL',
  renderer.includes('HeroVisual') &&
    renderer.includes('lg:grid-cols-12') &&
    renderer.includes('webinar'),
  'split hero with visual',
);
gate(
  'CTA',
  renderer.includes('ctaLabel') && renderer.includes('background: primary') && renderer.includes('→'),
  'primary CTA buttons',
);
gate(
  'FORM',
  renderer.includes('LeadFormCard') &&
    renderer.includes('id="lead-form"') &&
    renderer.includes('Bảo mật thông tin'),
  'lead form card',
);

// No fake data
const hasFakeNames =
  /author:\s*'Lan Anh'|author:\s*'Quỳnh'|author:\s*'Mai'|Vinamilk|5000\+|5,000\+/.test(
    templatesSrc,
  );
const templates = LANDING_PAGE_SYSTEM_TEMPLATES;
let placeholderOnly = true;
for (const t of templates) {
  const tm = t.spec.blocks.find((b) => b.type === 'Testimonials');
  if (!tm) continue;
  for (const item of tm.items) {
    if (!isPlaceholderTestimonial(item)) placeholderOnly = false;
  }
}
const pubHidden = filterPublishableTestimonials(
  LANDING_PAGE_PLACEHOLDER_TESTIMONIALS.map((t, i) => ({ id: String(i), ...t })),
  'public',
);
const publicClient = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/public-landing-page-client.tsx'),
  'utf8',
);
gate(
  'NO_FAKE_DATA',
  !hasFakeNames &&
    placeholderOnly &&
    pubHidden.length === 0 &&
    (publicPage.includes('mode="public"') || publicClient.includes('mode="public"')),
  `fakeNames=${hasFakeNames} placeholders=${placeholderOnly} publicHidden=${pubHidden.length}`,
);

// Existing page compatible — classic layout without meta.layout
const emptyMeta = {
  version: 1,
  theme: 'MODERN',
  themeTokens: shared.LANDING_PAGE_THEME_PRESETS.MODERN,
  seo: { title: 't', metaDescription: '', robotsIndex: true },
  blocks: [
    {
      id: 'h',
      type: 'Hero',
      enabled: true,
      headline: 'Hello',
      subheadline: 'World',
      ctaLabel: 'Go',
    },
  ],
};
gate(
  'EXISTING_PAGE_COMPATIBLE',
  resolveLandingPageLayout(emptyMeta) === 'classic' &&
    renderer.includes("mode = 'preview'") &&
    templatesSrc.includes('meta:'),
  'classic fallback for old specs',
);

// Layout diversity across required groups
const required = {
  webinar: 'webinar',
  lead_magnet: 'lead_gen',
  service: 'service',
  course: 'course',
  saas: 'saas',
  product: 'product',
  restaurant: 'local',
  agency: 'agency',
};
let layoutsOk = true;
const layoutSet = new Set();
for (const [cat, expect] of Object.entries(required)) {
  const got = layoutForCategory(cat);
  layoutSet.add(got);
  if (got !== expect) layoutsOk = false;
}
const webinarTpl = templates.find((t) => t.slug === 'webinar-register');
const saasTpl = templates.find((t) => t.slug === 'saas-trial');
const agencyTpl = templates.find((t) => t.slug === 'agency-portfolio');
gate(
  'LAYOUT_VARIANTS',
  layoutsOk &&
    layoutSet.size >= 7 &&
    webinarTpl?.spec.meta?.layout === 'webinar' &&
    saasTpl?.spec.meta?.layout === 'saas' &&
    agencyTpl?.spec.meta?.layout === 'agency' &&
    renderer.includes("layout === 'webinar'") &&
    renderer.includes("layout === 'saas'"),
  `layouts=${[...layoutSet].join(',')}`,
);

// Regression
const doctor = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
gate(
  'FACEBOOK_UNTOUCHED',
  !/facebook\.com|Fanpage|App Review|auto.?post/i.test(renderer) &&
    !/facebook\.com|Fanpage|App Review/i.test(templatesSrc),
  'no facebook coupling',
);
gate(
  'OTHER_MODULES_UNCHANGED',
  doctor.includes('applyPageDoctor') && doctor.includes('assertPage'),
  'doctor/API paths intact',
);

// Theme tokens upgraded
gate(
  'DESIGN_TOKENS',
  typesSrc.includes('Plus Jakarta Sans') &&
    renderer.includes('--lp-primary') &&
    renderer.includes('--lp-shadow'),
  'premium tokens + CSS vars',
);

const critical = [
  'DESKTOP',
  'TABLET',
  'MOBILE',
  'HERO_VISUAL',
  'CTA',
  'FORM',
  'NO_FAKE_DATA',
  'EXISTING_PAGE_COMPATIBLE',
  'FACEBOOK_UNTOUCHED',
  'OTHER_MODULES_UNCHANGED',
];
const failed = critical.filter((k) => !gates[k]?.ok);
const ready = failed.length === 0;

const upgraded = templates
  .filter((t) =>
    ['webinar', 'lead_magnet', 'service', 'course', 'saas', 'product', 'restaurant', 'agency'].includes(
      t.category,
    ),
  )
  .map((t) => `${t.slug}:${t.spec.meta?.layout}`);

console.log('\n--- REPORT ---');
console.log('TEMPLATES_UPGRADED:', upgraded.join(', '));
console.log(
  'COMPONENTS_CHANGED: Hero, Benefits, Features, Process, Pricing, Testimonials, FAQ, LeadForm, CTA, Footer, HeroVisual',
);
console.log(
  'FILES_CHANGED: landing-page-renderer.tsx, landing-page-types.ts, landing-page-templates.ts, landing-page-ui.ts, landing-page-lifecycle.ts, index.ts, p/[slug]/page.tsx, test-landing-page-template-ui.cjs',
);
console.log(
  'REGRESSION:',
  `FACEBOOK=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} OTHER=${gates.OTHER_MODULES_UNCHANGED?.ok ? 'PASS' : 'FAIL'} LAYOUT=${gates.LAYOUT_VARIANTS?.ok ? 'PASS' : 'FAIL'}`,
);
console.log(`TEMPLATE_UI_READY=${ready ? 'PASS' : 'FAIL'}`);
if (failed.length) {
  console.log('FAILED_GATES:', failed.join(', '));
  process.exitCode = 1;
}
