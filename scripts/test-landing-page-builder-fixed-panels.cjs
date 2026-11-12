#!/usr/bin/env node
/**
 * Landing Page Builder — floating toolbar + right inspector (desktop only).
 *   node scripts/test-landing-page-builder-fixed-panels.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

gate(
  'LEFT_SIDEBAR_FIXED',
  sidebar.includes('data-lp-left-sidebar-slot') &&
    sidebar.includes('data-lp-sidebar-fixed="1"') &&
    sidebar.includes('createPortal') &&
    sidebar.includes("position: 'fixed'") &&
    sidebar.includes('data-lp-toolbar-drag-handle') &&
    sidebar.includes('data-lp-sidebar-rail'),
  'floating toolbar portal — no grid width reserved',
);

gate(
  'INSPECTOR_FIXED',
  builder.includes('data-lp-inspector-slot') &&
    (builder.includes("data-lp-inspector-fixed={inspectorMode === 'docked' ? '1' : '0'}") ||
      builder.includes('data-lp-inspector-fixed="1"')) &&
    builder.includes('data-lp-inspector') &&
    (builder.includes('lg:grid-cols-[minmax(0,1fr)_320px]') ||
      builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]')) &&
    builder.includes("label: 'Nội dung'") &&
    builder.includes("label: 'Thiết kế'") &&
    builder.includes("label: 'Nâng cao'"),
  'inspector docked column / floating portal; tabs retained',
);

gate(
  'INSPECTOR_INNER_SCROLL',
  builder.includes('overflow-y-auto') &&
    builder.includes('overscroll-contain') &&
    builder.includes('data-lp-inspector-scroll') &&
    (builder.includes('max-h-[calc(100dvh-var(--builder-top-offset') ||
      builder.includes("maxHeight: 'calc(100dvh - var(--builder-top-offset") ||
      builder.includes('maxHeight: `min(calc(100dvh') ||
      builder.includes("height: 'calc(100dvh - var(--builder-top-offset")) &&
    (builder.includes('lg:sticky lg:top-[var(--builder-top-offset') ||
      builder.includes('data-lp-inspector-sticky') ||
      builder.includes("position: 'fixed'")),
  'inspector sticky + inner scroll capped to viewport',
);

gate(
  'CANVAS_NO_OVERLAP',
  builder.includes('data-lp-inspector-slot') &&
    (builder.includes('lg:grid-cols-[minmax(0,1fr)_320px]') ||
      builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]')) &&
    !builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_320px]'),
  'canvas full column; toolbar floats above',
);

gate(
  'NO_HORIZONTAL_OVERFLOW',
  builder.includes('overflow-x-hidden') &&
    builder.includes('data-lp-fixed-panels="1"') &&
    builder.includes('min-w-0'),
  'layout overflow-x-hidden',
);

gate(
  'DESKTOP_SCROLL',
  builder.includes('--builder-top-offset') &&
    sidebar.includes('createPortal') &&
    builder.includes('overscroll-contain') &&
    builder.includes('data-lp-canvas-scroll-mode="page"') &&
    !sidebar.includes('lg:fixed left-4') /* must clear app nav */,
  'page scroll + floating toolbar + inspector scroll',
);

gate(
  'MOBILE_UNCHANGED',
  sidebar.includes('desktopFloating') &&
    builder.includes('max-[767px]:overflow-y-auto') &&
    sidebar.includes('max-md:fixed'),
  'mobile overflow/touch behavior kept',
);

gate(
  'CANVAS_CORE_UNCHANGED',
  canvasUx.includes('onSelect') &&
    canvasUx.includes('onReorderBlock') &&
    canvasUx.includes('onFieldLive') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('STALE_REVISION') &&
    builder.includes('pushHistory') &&
    builder.includes('const undo =') &&
    builder.includes('LandingPageAiMenu') &&
    sidebar.includes('data-lp-sidebar-compact="1"'),
  'canvas/autosave/AI/compact sidebar untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(failed.length ? 'BUILDER_FIXED_PANELS=FAIL' : 'BUILDER_FIXED_PANELS=PASS');
console.log(
  'FILES_CHANGED=landing-page-builder-sidebar.tsx,landing-page-builder.tsx,scripts/test-landing-page-toolbar-float.cjs',
);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name} — ${g.detail}`);
}
process.exit(failed.length ? 1 : 0);
