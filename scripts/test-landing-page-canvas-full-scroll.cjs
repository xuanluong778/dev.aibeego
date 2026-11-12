#!/usr/bin/env node
/**
 * Landing Page Builder — full-page canvas scroll (no fixed inner frame).
 *   node scripts/test-landing-page-canvas-full-scroll.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

gate(
  'CANVAS_HEIGHT_AUTO',
  builder.includes('lg:h-auto') &&
    builder.includes('lg:min-h-[calc(100dvh-var(--builder-chrome-offset') &&
    builder.includes('data-lp-canvas-scroll-mode="page"'),
  'canvas height auto + min-height from viewport chrome',
);

gate(
  'NO_FIXED_HEIGHT_FRAME',
  !builder.includes('lg:h-[calc(100dvh-var(--builder-chrome-offset') &&
    !builder.includes('lg:overflow-hidden') &&
    !/data-lp-canvas-scroll[\s\S]{0,400}lg:overflow-y-auto/.test(builder) &&
    !builder.includes('el.scrollTop += e.deltaY'),
  'no root/canvas fixed frame or inner wheel scroll on desktop',
);

gate(
  'CONTENT_MOVED_UP',
  builder.includes('pt-2') &&
    builder.includes('data-lp-action-bar-spacer') &&
    builder.includes('h-11 shrink-0 lg:h-12') &&
    builder.includes("'--builder-chrome-offset' as string]: '7.25rem'"),
  'reduced top padding + tighter chrome offset',
);

gate(
  'PAGE_SCROLL_FULL_CONTENT',
  builder.includes('lg:overflow-visible') &&
    builder.includes('data-lp-canvas-scroll-mode="page"') &&
    builder.includes('data-lp-builder-root') &&
    !builder.includes('lg:overflow-y-auto lg:overscroll-contain'),
  'desktop canvas overflow visible — page scrolls full content',
);

gate(
  'INSPECTOR_SCROLL_UNCHANGED',
  builder.includes('data-lp-inspector') &&
    (builder.includes('overflow-y-auto overscroll-contain') ||
      builder.includes('overflow-y-auto overflow-x-hidden overscroll-contain')) &&
    (builder.includes('lg:sticky lg:top-[var(--builder-top-offset') ||
      builder.includes('data-lp-inspector-sticky') ||
      (builder.includes("position: 'fixed'") && builder.includes('data-lp-inspector-scroll'))) &&
    (builder.includes('max-h-[calc(100dvh-var(--builder-top-offset') ||
      builder.includes("maxHeight: 'calc(100dvh - var(--builder-top-offset") ||
      builder.includes("height: 'calc(100dvh - var(--builder-top-offset")),
  'docked inspector sticky with own scroll',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  canvasUx.includes('onSelect') &&
    canvasUx.includes('onReorderBlock') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('STALE_REVISION') &&
    builder.includes('LandingPageRenderer') &&
    builder.includes('pushHistory') &&
    builder.includes('const undo =') &&
    builder.includes('LandingPageAiMenu'),
  'canvas/autosave/undo/publish core intact',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
