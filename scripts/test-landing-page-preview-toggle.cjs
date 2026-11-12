#!/usr/bin/env node
/**
 * Preview toggle polarity gates — OFF=left/gray, ON=right/active.
 *   node scripts/test-landing-page-preview-toggle.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const toolbar = read('apps/web/src/components/landing-pages/landing-page-builder-toolbar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const switchBlock = toolbar.slice(
  toolbar.indexOf('data-lp-preview-toggle'),
  toolbar.indexOf('data-lp-device-switcher'),
);

gate(
  'PREVIEW_TOGGLE_OFF_LEFT',
  switchBlock.includes("data-lp-preview-knob={previewOn ? 'right' : 'left'}") &&
    switchBlock.includes("previewOn ? 'left-[20px]' : 'left-[2px]'") &&
    switchBlock.includes("previewOn ? 'bg-emerald-400' : 'bg-zinc-400/80'") &&
    switchBlock.includes('dir="ltr"'),
  'OFF → knob left-[2px], gray track, LTR forced',
);

gate(
  'PREVIEW_TOGGLE_ON_RIGHT',
  switchBlock.includes("previewOn ? 'left-[20px]'") &&
    switchBlock.includes("previewOn ? 'bg-emerald-400'") &&
    switchBlock.includes("data-state={previewOn ? 'on' : 'off'}") &&
    switchBlock.includes("aria-checked={previewOn}"),
  'ON → knob right left-[20px], emerald track, aria-checked true',
);

gate(
  'PREVIEW_STATE_SYNC',
  builder.includes('previewOn={fullscreenPreview}') &&
    (builder.includes('onPreviewChange={setFullscreenPreview}') ||
      builder.includes('onPreviewChange={onPreviewChange}')) &&
    toolbar.includes('onClick={() => onPreviewChange(!previewOn)}') &&
    !/previewOn\s*\?\s*'left-\[2px\]'/.test(switchBlock) &&
    !/!previewOn\s*\?\s*'left-\[20px\]'/.test(switchBlock),
  'Toolbar previewOn bound 1:1 to fullscreenPreview; knob polarity not inverted',
);

gate(
  'BUILDER_PREVIEW_BEHAVIOR',
  builder.includes('{!fullscreenPreview ? (') &&
    builder.includes('LandingPageBuilderSidebar') &&
    builder.includes('data-lp-fullscreen-preview-surface') &&
    builder.includes('mode="preview"') &&
    builder.includes("setFullscreenPreview(false)") &&
    /if \(fullscreenPreview\)[\s\S]{0,120}setFullscreenPreview\(false\)/.test(
      builder.replace(/\n/g, ' '),
    ),
  'OFF shows builder chrome; ON shows preview surface; ESC exits preview',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_PREVIEW_TOGGLE_GATES_PASS');
process.exit(0);
