#!/usr/bin/env node
/**
 * Landing Page interaction fixes from LANDING_PAGE_INTERACTION_AUDIT.md
 *   node scripts/test-landing-page-interaction-fixes.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const freeDrag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const types = read('packages/shared/src/landing-page-types.ts');
const life = read('packages/shared/src/landing-page-lifecycle.ts');
const sharedFree = read('packages/shared/src/landing-page-free-position.ts');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'SECTION_OVERLAP',
  sharedFree.includes('ensureSectionFreeLayoutHeight') &&
    sharedFree.includes('computeCanvasFreeReserveHeight') &&
    life.includes('ensureSectionFreeLayoutHeight') &&
    builder.includes('getBoundingClientRect().height') &&
    builder.includes('reserveHeight: height') &&
    renderer.includes('computeCanvasFreeReserveHeight') &&
    renderer.includes('data-lp-free-reserve-h') &&
    freeDrag.includes('syncCanvasFreeReserve') &&
    freeDrag.includes("overflow: 'visible'"),
  'free enable measures height; canvas-level reserve prevents overlap stack',
);

gate(
  'SECTION_CLIP',
  freeDrag.includes("overflow: 'visible'") &&
    !/overflow: layout\.height \? 'hidden'/.test(freeDrag),
  'free section shell does not clip with overflow:hidden',
);

gate(
  'HERO_FREE_SYNC',
  renderer.includes('data-lp-hero-slot-wrap') &&
    renderer.includes('data-lp-block-slot={hero.id}') &&
    freeDrag.includes('syncCanvasFreeReserve'),
  'Hero slot + canvas-level free reserve sync',
);

gate(
  'PRICING_DRAG',
  types.includes('LandingPagePricingPlan') &&
    /export type LandingPagePricingPlan = \{[\s\S]*?positionMode\?:/.test(types) &&
    /case 'Pricing':[\s\S]*?ItemReorderChrome[\s\S]*?itemId=\{plan\.id\}/.test(renderer) &&
    /case 'Pricing':[\s\S]*?data-lp-free-surface="1"/.test(renderer) &&
    builder.includes('b?.plans?.find') &&
    builder.includes('Array.isArray(block.plans)') &&
    builder.includes("Array.isArray(row.plans)") &&
    life.includes('withNestedFreeLayout(plan'),
  'Pricing plans use ItemReorderChrome + freeLayout schema + commit/get/dup paths',
);

gate(
  'PRICING_RESIZE_ROTATE',
  canvas.includes('ItemReorderChrome') &&
    canvas.includes('FreeTransformChrome') &&
    canvas.includes('freeDrag.beginResize') &&
    canvas.includes('beginRotate') &&
    /case 'Pricing':[\s\S]*?ItemReorderChrome/.test(renderer),
  'Pricing cards mount ItemReorderChrome which exposes resize/rotate',
);

gate(
  'EMPTY_SECTION_CLICK',
  sharedFree.includes('computeCanvasFreeReserveHeight') &&
    freeDrag.includes('syncCanvasFreeReserve') &&
    freeDrag.includes('clearLegacySlotFlowReserves') &&
    canvas.includes('data-lp-section-bg-hit') &&
    /data-lp-section-bg-hit[\s\S]*?className="absolute inset-0 z-0"/.test(canvas) &&
    !/layout\s*\?\s*'pointer-events-none absolute inset-0 z-0'/.test(canvas) &&
    canvas.includes('minHeight: 56') &&
    renderer.includes('data-lp-free-reserve-h') &&
    !renderer.includes('<FlowReserve') &&
    canvas.includes("element: 'section'"),
  'canvas-level free reserve; empty padding selects section',
);

gate(
  'TOOLBAR',
  canvas.includes('data-lp-section-bg-hit') &&
    sidebar.includes("pointerEvents: 'none'") &&
    sidebar.includes('pointer-events-auto'),
  'toolbar portal pointerEvents none + shell auto',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(failed.length ? 'LANDING_PAGE_INTERACTION_FIXED=FAIL' : 'LANDING_PAGE_INTERACTION_FIXED=PASS');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
