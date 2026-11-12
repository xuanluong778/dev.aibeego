#!/usr/bin/env node
/**
 * Preview mode — hide all editor chrome; toolbar-only full canvas.
 *   node scripts/test-landing-page-preview-mode.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const toolbar = read('apps/web/src/components/landing-pages/landing-page-builder-toolbar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const shell = read('apps/web/src/components/layout/app-shell.tsx');
const page = read('apps/web/src/app/(app)/landing-pages/builder/[id]/page.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const flat = builder.replace(/\n/g, ' ');

gate(
  'PREVIEW_HIDE_ALL_EDITOR_UI',
  builder.includes("document.body.setAttribute('data-lp-preview-mode', '1')") &&
    shell.includes('data-lp-preview-mode') &&
    shell.includes("lpPreviewMode && '!hidden'") &&
    shell.includes("lpPreviewMode && 'hidden'") &&
    builder.includes('{!fullscreenPreview ? (') &&
    builder.includes('LandingPageBuilderSidebar') &&
    builder.includes('data-lp-builder-layout') &&
    /\{!fullscreenPreview \? \(\s*<LandingPageBuilderSidebar/.test(
      builder.replace(/\n/g, ' '),
    ) &&
    toolbar.includes('hideBack'),
  'Preview ON: body flag + AppShell hides header/sidebar; builder chrome gated off',
);

gate(
  'TOOLBAR_ONLY',
  builder.includes('data-lp-toolbar-only="1"') &&
    builder.includes('hideBack') &&
    builder.includes('data-lp-preview-shell="1"') &&
    /createPortal\(\s*<div[\s\S]*data-lp-preview-shell[\s\S]*LandingPageBuilderToolbar[\s\S]*hideBack/.test(
      builder,
    ) &&
    toolbar.includes('Xem trước') &&
    toolbar.includes('data-lp-device-switcher') &&
    toolbar.includes('onUndo') &&
    toolbar.includes('onRedo') &&
    toolbar.includes('onSave') &&
    toolbar.includes('onPublish') &&
    toolbar.includes('{!hideBack ? ('),
  'Preview shell keeps only mini toolbar (no Back); devices + undo/redo + save + publish',
);

gate(
  'PREVIEW_FULL_CANVAS',
  builder.includes('fixed inset-0 z-[100]') &&
    builder.includes('data-lp-preview-full-canvas="1"') &&
    builder.includes('data-lp-fullscreen-preview-surface="1"') &&
    builder.includes('mode="preview"') &&
    /fullscreenPreview[\s\S]{0,400}createPortal/.test(flat) &&
    page.includes('data-lp-preview-mode=1'),
  'Preview fills remaining viewport below toolbar via fixed shell + preview renderer',
);

gate(
  'RESTORE_BUILDER',
  builder.includes("document.body.removeAttribute('data-lp-preview-mode')") &&
    builder.includes('onPreviewChange={onPreviewChange}') &&
    /if \(fullscreenPreview\)[\s\S]{0,120}setFullscreenPreview\(false\)/.test(flat) &&
    builder.includes('{!fullscreenPreview ? (') &&
    builder.includes('LandingPageBuilderSidebar') &&
    builder.includes('data-lp-builder-layout') &&
    // Spec/history/autosave stay in same component — chrome remounts when OFF
    builder.includes('dirtyRef') &&
    builder.includes('autosaveTimer') &&
    builder.includes('historyRef') &&
    builder.includes('onUndo={undo}') &&
    builder.includes('onRedo={redo}') &&
    builder.includes('onPublish={() => void publish()}'),
  'OFF clears body flag, remounts builder chrome; undo/redo/save/publish/autosave unchanged',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_PREVIEW_MODE_GATES_PASS');
process.exit(0);
