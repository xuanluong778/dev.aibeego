#!/usr/bin/env node
/**
 * Landing Page Builder — fixed toolbar + internal canvas scroll gates.
 *   node scripts/test-landing-page-builder-toolbar.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const toolbar = read('apps/web/src/components/landing-pages/landing-page-builder-toolbar.tsx');
const page = read('apps/web/src/app/(app)/landing-pages/builder/[id]/page.tsx');
const shell = read('apps/web/src/components/layout/app-shell.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'OLD_TOPBAR_REMOVED',
  !builder.includes('left-0 border-b border-white/10 bg-[#0A3D30] px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.25)] lg:left-[var(--app-sidebar-width,16rem)]') &&
    !builder.includes('data-lp-action-bar="fixed"') &&
    !builder.includes('data-lp-action-bar-spacer'),
  'Legacy full-width dark action bar + spacer removed',
);

gate(
  'TOOLBAR_FIXED',
  toolbar.includes('data-lp-toolbar-fixed="1"') &&
    toolbar.includes('shrink-0') &&
    toolbar.includes('h-11') &&
    !toolbar.includes('LandingPageToolbarDock') &&
    !toolbar.includes('dock:') &&
    !builder.includes('toolbarDock') &&
    !builder.includes('createPortal(\n            <LandingPageBuilderToolbar'),
  'Toolbar is in-flow fixed row under header (not floating portal dock)',
);

gate(
  'CANVAS_BELOW_TOOLBAR',
  builder.includes('data-lp-canvas-below-toolbar="1"') &&
    builder.includes('<LandingPageBuilderToolbar') &&
    builder.includes('data-lp-canvas-scroll-mode="internal"') &&
    builder.indexOf('<LandingPageBuilderToolbar') <
      builder.indexOf('data-lp-canvas-below-toolbar="1"'),
  'Canvas sits below toolbar in flex column; scroll mode internal',
);

gate(
  'CANVAS_INTERNAL_SCROLL',
  builder.includes('overflow-y-auto overscroll-contain') &&
    builder.includes('data-lp-canvas-scroll-mode="internal"') &&
    page.includes('h-full') &&
    page.includes('overflow-hidden') &&
    builder.includes('overflow-hidden') &&
    builder.includes('min-h-0 flex-1'),
  'Page+builder height-locked; only canvas overflow-y:auto',
);

gate(
  'NO_OVERLAP',
  !toolbar.includes('bg-white/95') &&
    !toolbar.includes('rounded-[12px] border border-[#E5E7EB]') &&
    !builder.includes('pt-14') &&
    builder.includes("'--builder-top-offset' as string]: '6.75rem'") &&
    toolbar.includes('data-lp-toolbar-fixed'),
  'No floating white panels over canvas; chrome offset = header+toolbar',
);

gate(
  'NO_DOUBLE_SCROLL',
  page.includes('data-lp-no-double-scroll="1"') &&
    builder.includes('data-lp-no-double-scroll="1"') &&
    page.includes('overflow-hidden') &&
    shell.includes('data-lp-builder-main') &&
    shell.includes('h-[100dvh]') &&
    shell.includes('data-lp-viewport-locked') &&
    shell.includes('overflow-hidden') &&
    builder.includes('flex h-full min-h-0 flex-col overflow-hidden'),
  'Viewport locked to 100dvh; no page-level scroll competing with canvas',
);

gate(
  'TOOLBAR_NO_WHEEL_SCROLL',
  toolbar.includes('data-lp-toolbar-no-scroll="1"') &&
    toolbar.includes('onWheel={blockToolbarWheel}') &&
    toolbar.includes('overflow-y-hidden') &&
    toolbar.includes('overscroll-y-none') &&
    toolbar.includes('sticky top-0') &&
    toolbar.includes('shrink-0'),
  'Toolbar blocks wheel scroll and stays sticky under app header',
);

gate(
  'RESPONSIVE',
  toolbar.includes('data-lp-device-switcher') &&
    toolbar.includes('onViewportChange') &&
    builder.includes('onViewportChange={setViewport}') &&
    toolbar.includes('overflow-x-auto') &&
    toolbar.includes('min-w-0'),
  'Device switch + compact overflow-safe toolbar row',
);

gate(
  'COMPACT_TOOLBAR',
  toolbar.includes('data-lp-compact-toolbar="1"') &&
    builder.includes('LandingPageBuilderToolbar') &&
    toolbar.includes('h-9 w-9') &&
    toolbar.includes('bg-[#F97316]'),
  'Compact icon buttons + orange Publish',
);

gate(
  'FULLSCREEN_PREVIEW',
  builder.includes('fullscreenPreview') &&
    builder.includes('data-lp-fullscreen-preview-surface') &&
    builder.includes('mode="preview"') &&
    builder.includes("setFullscreenPreview(false)"),
  'Preview surface + ESC exits',
);

gate(
  'DEVICE_SWITCH',
  toolbar.includes('Monitor') &&
    toolbar.includes('Tablet') &&
    toolbar.includes('Smartphone') &&
    builder.includes('onViewportChange={setViewport}'),
  'Icon-only device switch',
);

gate(
  'SAVE',
  toolbar.includes('label="Lưu"') &&
    builder.includes('onSave={() => void persist(spec, page.name, { manual: true })}'),
  'Save wired',
);

gate(
  'UNDO_REDO',
  toolbar.includes('Undo2') &&
    toolbar.includes('Redo2') &&
    builder.includes('onUndo={undo}') &&
    builder.includes('onRedo={redo}'),
  'Undo/Redo wired',
);

gate(
  'BACK_BUTTON',
  toolbar.includes('Quay lại') &&
    builder.includes("router.push('/landing-pages/pages')"),
  'Back wired',
);

gate(
  'PUBLISH',
  toolbar.includes('data-lp-publish-btn') &&
    toolbar.includes('bg-[#F97316]') &&
    builder.includes('onPublish={() => void publish()}'),
  'Publish orange wired',
);

gate(
  'TOOLBAR_CANVAS_ALIGN',
  toolbar.includes('alignToCanvas') &&
    toolbar.includes('data-lp-toolbar-align') &&
    toolbar.includes("centerInCanvas ? 'canvas' : 'viewport'") &&
    toolbar.includes('lg:pr-[calc(240px+0.5rem)]') &&
    builder.includes('alignToCanvas') &&
    builder.includes('inspectorDocked={inspectorMode === \'docked\' || !inspectorDesktop}'),
  'Edit mode centers toolbar in canvas column; preview keeps viewport center',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_BUILDER_TOOLBAR_GATES_PASS');
process.exit(0);
