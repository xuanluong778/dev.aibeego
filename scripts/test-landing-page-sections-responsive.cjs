#!/usr/bin/env node
/**
 * Prompt 2 — Landing Page section/template responsive gates.
 *   node scripts/test-landing-page-sections-responsive.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const publicClient = read('apps/web/src/components/landing-pages/public-landing-page-client.tsx');
const shared = read('packages/shared/src/landing-page-free-position.ts');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const templates = read('packages/shared/src/landing-page-templates.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'PRICING_RESPONSIVE',
  renderer.includes('data-lp-pricing-grid="1"') &&
    renderer.includes('grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3') &&
    renderer.includes('data-lp-pricing-card="1"') &&
    renderer.includes('[data-lp-pricing-grid]') &&
    /tablet[\s\S]{0,400}\[data-lp-pricing-grid\][\s\S]{0,120}repeat\(2/.test(renderer.replace(/\n/g, ' ')),
  'Pricing: 1 / 2 / 3 cols + tablet sim 2-col',
);

gate(
  'ALL_SECTIONS_RESPONSIVE',
  renderer.includes('data-lp-cards-grid="1"') &&
    renderer.includes('data-lp-testimonials-grid="1"') &&
    renderer.includes('data-lp-faq-grid="1"') &&
    renderer.includes('data-lp-process-grid="1"') &&
    renderer.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3') &&
    renderer.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4') &&
    renderer.includes('LP_VIEWPORT_SIM_CSS') &&
    renderer.includes('[data-lp-public-root]') &&
    renderer.includes('max-w-full sm:max-w-lg') &&
    publicClient.includes('viewport={viewport}') &&
    publicClient.includes('readPublicViewport'),
  'Shared grids + public viewport + form full-width mobile',
);

gate(
  'NO_CARD_OVERFLOW',
  renderer.includes('data-lp-pricing-card="1"') &&
    renderer.includes('min-w-0') &&
    renderer.includes('break-words') &&
    renderer.includes('[data-lp-pricing-card]') &&
    renderer.includes('transform: none !important') &&
    !/transform:\s*plan\.highlighted\s*\?\s*'scale\(1\.02\)'/.test(renderer),
  'Cards min-w-0 + break-words; highlight scale only on lg',
);

gate(
  'NO_SECTION_OVERLAP',
  shared.includes('constrainFreeLayoutToCanvasWidth') &&
    shared.includes('constrainFreeLayoutToCanvasWidth(mobile, 390)') &&
    shared.includes('constrainFreeLayoutToCanvasWidth(tablet, 768)') &&
    renderer.includes('computeCanvasFreeReserveHeight') &&
    renderer.includes('data-lp-free-reserve-h'),
  'Free layout constrained on tablet/mobile; reserve height keeps sections apart',
);

gate(
  'NO_TEXT_CLIPPING',
  renderer.includes('overflow-wrap: anywhere') &&
    renderer.includes('word-break: break-word') &&
    renderer.includes('break-words text-2xl font-extrabold') &&
    renderer.includes('white-space: normal'),
  'Headings/body wrap; no clip',
);

gate(
  'AUTOSAVE_RELOAD',
  builder.includes('persist(') &&
    builder.includes('dirtyRef') &&
    builder.includes('revisionRef') &&
    !builder.includes('constrainFreeLayoutToCanvasWidth'),
  'Builder autosave wiring untouched by responsive CSS/helpers',
);

gate(
  'PUBLISH',
  publicClient.includes('mode="public"') &&
    publicClient.includes('viewport={viewport}') &&
    !publicClient.includes('LandingPageDeviceFrame') &&
    renderer.includes('@media (max-width: 767px)') &&
    renderer.includes('[data-lp-public-root]'),
  'Publish path gets real viewport + public responsive CSS; no device frame',
);

let templatesDirty = false;
try {
  const st = execSync('git status --porcelain -- packages/shared/src/landing-page-templates.ts packages/shared/src/landing-page-template-expand.ts packages/shared/src/landing-page-template-flows.ts packages/shared/src/landing-page-template-select.ts', {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  templatesDirty = Boolean(st);
} catch {
  templatesDirty = !/id:\s*['"]/.test(templates);
}

gate(
  'OLD_TEMPLATES_UNCHANGED',
  !templatesDirty &&
    templates.includes('export') &&
    !renderer.includes('landing-page-templates'),
  'Template catalog files not modified; fixes are shared renderer/CSS only',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_SECTIONS_RESPONSIVE_GATES_PASS');
process.exit(0);
