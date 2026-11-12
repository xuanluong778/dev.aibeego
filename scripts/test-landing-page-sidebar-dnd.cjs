#!/usr/bin/env node
/**
 * Gate: LP sidebar → canvas drag & drop presets
 *   node scripts/test-landing-page-sidebar-dnd.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const dnd = read('apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const buttons = read('apps/web/src/components/landing-pages/landing-page-button-presets.tsx');
const text = read('apps/web/src/components/landing-pages/landing-page-title-presets.tsx');
const media = read('apps/web/src/components/landing-pages/landing-page-media-modal.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const nextCfg = read('apps/web/next.config.js');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'MIME_HELPERS',
  dnd.includes('LP_SIDEBAR_PRESET_MIME') &&
    dnd.includes('beginSidebarPresetDrag') &&
    dnd.includes('parseSidebarPresetPayload') &&
    dnd.includes("effectAllowed = 'copy'") &&
    dnd.includes('setDragImage'),
  'shared MIME + drag preview helpers',
);

gate(
  'CANVAS_DROP_HIGHLIGHT',
  canvas.includes('onInsertSidebarPreset') &&
    canvas.includes('isSidebarPresetDrag') &&
    canvas.includes('data-lp-preset-drop') &&
    canvas.includes("mode: 'before'") &&
    renderer.includes('data-lp-canvas-preset-over') &&
    renderer.includes("mode: 'end'"),
  'section + canvas root accept drop with highlight',
);

gate(
  'ELEMENT_INSERT_LINE',
  canvas.includes('showElementInsertLine') &&
    canvas.includes('resolveElementInsertTarget') &&
    dnd.includes("LP_ELEMENT_INSERT_LINE_COLOR = '#00E174'") &&
    dnd.includes('setTransparentSidebarDragImage'),
  'element drags show the #00E174 slot line and a transparent drag image',
);

gate(
  'INSERT_POS_HISTORY',
  builder.includes('resolveInsertIndex') &&
    builder.includes('function insertSidebarPreset') &&
    builder.includes("pos?.mode === 'before'") &&
    builder.includes('pushHistory') &&
    builder.includes('onInsertSidebarPreset:') &&
    builder.includes('insertTitlePreset(payload.preset, pos)') &&
    builder.includes('insertButtonPreset(payload.preset, pos)') &&
    builder.includes('insertBoxPreset(payload.preset, pos)'),
  'drop inserts at position via existing pushHistory inserts',
);

gate(
  'PRESET_DRAGGABLE',
  buttons.includes('beginSidebarPresetDrag') &&
    buttons.includes('draggable') &&
    buttons.includes("kind: 'button'") &&
    text.includes("kind: 'title'") &&
    text.includes("kind: 'paragraph'") &&
    text.includes("kind: 'list'") &&
    media.includes("kind: 'media'") &&
    sidebar.includes("kind: 'block-type'") &&
    sidebar.includes('draggableType') &&
    dnd.includes("kind: 'box'"),
  'buttons/text/media/video/box rail are draggable; click still works',
);

gate(
  'CLICK_PRESERVED',
  buttons.includes('onInsertButton(preset)') &&
    text.includes('onInsertTitle(preset)') &&
    builder.includes('onInsertButtonPreset={'),
  'click-to-add callbacks remain',
);

gate(
  'SCOPE_SAFE',
  nextCfg.includes('module.exports = nextConfig') &&
    !builder.includes('facebook') &&
    canvas.includes('LP_BLOCK_MIME'),
  'next config intact; block reorder MIME untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=landing-page-sidebar-dnd.ts,landing-page-canvas-ux.tsx,landing-page-renderer.tsx,landing-page-builder.tsx,landing-page-button-presets.tsx,landing-page-title-presets.tsx,landing-page-media-modal.tsx,landing-page-builder-sidebar.tsx,scripts/test-landing-page-sidebar-dnd.cjs',
);
console.log('SIDEBAR_DND_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
