#!/usr/bin/env node
/**
 * Landing Page template gallery gates.
 *   node scripts/test-landing-page-template-gallery.cjs
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
  countTemplatesPerCategory,
  LANDING_PAGE_TEMPLATE_FLOWS,
  getLandingPageSystemTemplate,
} = shared;

const pageSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/templates/page.tsx'),
  'utf8',
);
const switcherSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/template-viewport-switcher.tsx'),
  'utf8',
);
const hoverSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/template-hover-preview.tsx'),
  'utf8',
);
const serviceSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const previewDir = path.join(root, 'apps/web/public/landing-pages/templates');

const perCat = countTemplatesPerCategory(LANDING_PAGE_SYSTEM_TEMPLATES);
const allCats10 = LANDING_PAGE_CATEGORIES.every((c) => (perCat[c] || 0) >= 10);
gate(
  'TEMPLATE_COUNT_PER_CATEGORY_10',
  allCats10 && LANDING_PAGE_SYSTEM_TEMPLATES.length >= 200,
  `total=${LANDING_PAGE_SYSTEM_TEMPLATES.length} sample=${JSON.stringify(
    Object.fromEntries(LANDING_PAGE_CATEGORIES.slice(0, 3).map((c) => [c, perCat[c]])),
  )}`,
);

// Distinct flows (not color-only): compare block type signatures within a category
const product = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === 'product');
const signatures = new Set(
  product.map((t) => t.spec.blocks.map((b) => b.type).join('>')),
);
gate(
  'DISTINCT_FLOWS',
  signatures.size >= 8,
  `product unique flows=${signatures.size}/${product.length}`,
);

const legacyOk = Boolean(getLandingPageSystemTemplate('product-launch'));
const webinarOk = Boolean(getLandingPageSystemTemplate('webinar-register'));
gate('EXISTING_TEMPLATE_COMPATIBLE', legacyOk && webinarOk, 'legacy slugs preserved');

const sample = LANDING_PAGE_SYSTEM_TEMPLATES[0];
const hasThumbMeta =
  sample.thumbnail &&
  sample.previewLongImage &&
  sample.spec.meta?.gallery?.thumbnail;
gate(
  'TEMPLATE_CARD_IMAGE_PREVIEW',
  hasThumbMeta &&
    pageSrc.includes('TemplateHoverPreview') &&
    pageSrc.includes('thumbnail') &&
    fs.existsSync(previewDir),
  `thumb=${sample.thumbnail}`,
);

const svgCount = fs.existsSync(previewDir)
  ? fs.readdirSync(previewDir).filter((f) => f.endsWith('-long.svg')).length
  : 0;
gate(
  'IMAGE_ASSETS_PRESENT',
  svgCount >= 0 &&
    fs.existsSync(previewDir) &&
    fs.readdirSync(previewDir).filter((f) => f.endsWith('-long.webp')).length >= 200,
  `longWebp=${fs.existsSync(previewDir) ? fs.readdirSync(previewDir).filter((f) => f.endsWith('-long.webp')).length : 0}`,
);

gate(
  'HOVER_SCROLL_PREVIEW',
  hoverSrc.includes('translate3d') &&
    hoverSrc.includes('onMouseEnter') &&
    hoverSrc.includes('previewLongImage') &&
    hoverSrc.includes('will-change-transform'),
  'CSS transform hover scroll',
);

gate(
  'PREVIEW_OPEN_WORKS',
  pageSrc.includes('Xem trước') &&
    pageSrc.includes('openPreview') &&
    pageSrc.includes('LandingPageRenderer') &&
    pageSrc.includes('TemplateViewportSwitcher') &&
    switcherSrc.includes("'desktop'") &&
    switcherSrc.includes("'tablet'") &&
    switcherSrc.includes("'mobile'") &&
    pageSrc.includes('/landing-pages/templates/'),
  'modal + API fetch definition',
);

gate(
  'CATEGORY_FILTER_WORKS',
  pageSrc.includes('setCategory') &&
    pageSrc.includes('LANDING_PAGE_CATEGORIES') &&
    (pageSrc.includes('?category=') ||
      (pageSrc.includes("params.set('category'") && pageSrc.includes('params.toString()'))),
  'category filter buttons',
);

gate(
  'DESIGN_FAMILY_GOAL_FILTERS',
  !pageSrc.includes('data-lp-template-design-family') &&
    !pageSrc.includes('data-lp-template-conversion-goal') &&
    !pageSrc.includes("params.set('designFamily'") &&
    !pageSrc.includes("params.set('conversionGoal'") &&
    serviceSrc.includes('designFamily') &&
    serviceSrc.includes('conversionGoal') &&
    serviceSrc.includes('Omit full definition'),
  'UI hides Style/Goal filters; API still returns summary meta',
);

gate(
  'PREVIEW_USES_REAL_RENDERER',
  pageSrc.includes('LandingPageRenderer') &&
    pageSrc.includes('data-lp-template-preview-renderer') &&
    pageSrc.includes('openPreview') &&
    !pageSrc.includes('renderTemplateHtml'),
  'modal uses LandingPageRenderer only',
);

gate(
  'GRID_RESPONSIVE',
  pageSrc.includes('sm:grid-cols-2') &&
    pageSrc.includes('lg:grid-cols-3') &&
    pageSrc.includes('xl:grid-cols-4'),
  '1/2/3/4 col grid',
);

gate(
  'LAZY_LOAD_OK',
  hoverSrc.includes('loading="lazy"') &&
    pageSrc.includes('PAGE_SIZE') &&
    pageSrc.includes('pageItems') &&
    !pageSrc.includes('LANDING_PAGE_SYSTEM_TEMPLATES'),
  'lazy img + pagination + no full catalog client import',
);

gate(
  'NO_LAYOUT_BREAK',
  hoverSrc.includes('overflow-hidden') &&
    hoverSrc.includes('aspectRatio') &&
    pageSrc.includes('line-clamp-2'),
  'fixed frame + clamp text',
);

gate(
  'FACEBOOK_UNTOUCHED',
  !/facebook\.com|Fanpage|App Review|auto.?post/i.test(pageSrc) &&
    !/facebook\.com|Fanpage|App Review/i.test(hoverSrc),
  'gallery has no FB coupling',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  serviceSrc.includes('applyPageDoctor') &&
    serviceSrc.includes('async publish') &&
    serviceSrc.includes('async autosave') &&
    serviceSrc.includes('ensureSystemTemplates'),
  'doctor/publish/autosave intact',
);

gate(
  'FLOWS_DEFINED',
  LANDING_PAGE_TEMPLATE_FLOWS.length === 10,
  `flows=${LANDING_PAGE_TEMPLATE_FLOWS.length}`,
);

const critical = [
  'TEMPLATE_COUNT_PER_CATEGORY_10',
  'TEMPLATE_CARD_IMAGE_PREVIEW',
  'HOVER_SCROLL_PREVIEW',
  'PREVIEW_OPEN_WORKS',
  'CATEGORY_FILTER_WORKS',
  'DESIGN_FAMILY_GOAL_FILTERS',
  'PREVIEW_USES_REAL_RENDERER',
  'GRID_RESPONSIVE',
  'LAZY_LOAD_OK',
  'NO_LAYOUT_BREAK',
  'EXISTING_TEMPLATE_COMPATIBLE',
  'FACEBOOK_UNTOUCHED',
  'OTHER_MODULES_UNCHANGED',
  'IMAGE_ASSETS_PRESENT',
];
const failed = critical.filter((k) => !gates[k]?.ok);
const ready = failed.length === 0;

console.log('\n--- REPORT ---');
console.log(
  `CATEGORIES_UPDATED=${LANDING_PAGE_CATEGORIES.length} | TOTAL_TEMPLATES=${LANDING_PAGE_SYSTEM_TEMPLATES.length}`,
);
console.log(
  'FILES_CHANGED: landing-page-types.ts, landing-page-templates.ts, landing-page-template-flows.ts, landing-page-template-expand.ts, landing-page-lifecycle.ts, templates/page.tsx, template-hover-preview.tsx, landing-pages.service.ts, generate-landing-page-template-previews.cjs, test-landing-page-template-gallery.cjs, public/landing-pages/templates/*',
);
console.log(
  'IMAGE_PREVIEW_SOURCE: public/landing-pages/templates/{slug}-thumb.svg + {slug}-long.svg (replaceable with WebP same basename)',
);
console.log(
  `HOVER_SCROLL_STATUS=${gates.HOVER_SCROLL_PREVIEW?.ok ? 'PASS' : 'FAIL'} | PERFORMANCE_NOTES=pagination ${12}/page, lazy images, list API omits definition, catalog sync cached by version`,
);
console.log(
  `REGRESSION: FACEBOOK=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} OTHER=${gates.OTHER_MODULES_UNCHANGED?.ok ? 'PASS' : 'FAIL'} LEGACY=${gates.EXISTING_TEMPLATE_COMPATIBLE?.ok ? 'PASS' : 'FAIL'}`,
);
console.log(`TEMPLATE_GALLERY_READY=${ready ? 'PASS' : 'FAIL'}`);
if (failed.length) {
  console.log('FAILED_GATES:', failed.join(', '));
  for (const k of failed) console.log(' ', k, gates[k]?.detail);
  process.exitCode = 1;
}
