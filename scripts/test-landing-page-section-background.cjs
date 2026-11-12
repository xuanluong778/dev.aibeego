#!/usr/bin/env node
/**
 * Gate: LP Section Background select + toolbar (additive)
 *   node scripts/test-landing-page-section-background.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const toolbar = read('apps/web/src/components/landing-pages/landing-page-section-background-toolbar.tsx');
const surface = read('apps/web/src/components/landing-pages/landing-page-section-surface.ts');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');
const freeDrag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'BACKGROUND_SELECT',
  canvas.includes("'section-background'") &&
    canvas.includes("element: 'section-background'") &&
    canvas.includes('data-lp-section-bg-hit') &&
    canvas.includes('onBackground') &&
    !canvas.includes('selectSectionSurface') &&
    canvas.includes('data-lp-selection-target="section"') &&
    canvas.includes("title=\"Chỉnh nền section\""),
  'empty click=section; Nền only via explicit button',
);

gate(
  'BACKGROUND_TOOLBAR',
  toolbar.includes('data-lp-bg-toolbar') &&
    toolbar.includes('Chỉnh sửa') &&
    toolbar.includes('Xóa nền') &&
    toolbar.includes('Xóa ảnh') &&
    toolbar.includes('Màu nền') &&
    toolbar.includes('Căn chỉnh ảnh') &&
    toolbar.includes('Lật') &&
    toolbar.includes('Chuyển động') &&
    toolbar.includes('Vị trí') &&
    toolbar.includes('createPortal') &&
    canvas.includes('SectionBackgroundToolbar') &&
    canvas.includes('showBgToolbar'),
  'portal background context toolbar with Canva actions',
);

gate(
  'CSS_BG_IMAGE',
  surface.includes('backgroundImage') &&
    renderer.includes('sectionBgStyle') &&
    builder.includes('backgroundImage') &&
    lifecycle.includes('clampText(b.background, 600'),
  'CSS background-image selectable + persist clamp raised',
);

gate(
  'CHILD_ELEMENT_SELECT',
  (canvas.includes('ElementChrome') || canvas.includes('stopPropagation')) &&
    canvas.includes('[data-lp-inline-editing="1"]') &&
    canvas.includes("element: 'section'") &&
    canvas.includes('FloatingToolbar'),
  'child widgets still stopPropagation; FloatingToolbar kept',
);

gate(
  'REMOVE_BG',
  builder.includes("case 'remove-bg'") &&
    builder.includes('background: null') &&
    !/case 'remove-bg':[\s\S]{0,240}removeBlock/.test(builder),
  'remove-bg clears visual bg only',
);

gate(
  'REMOVE_BG_IMAGE',
  builder.includes("case 'remove-bg-image'") &&
    builder.includes('backgroundImage: undefined'),
  'remove-bg-image clears image only',
);

gate(
  'BG_POSITION',
  builder.includes("case 'align'") &&
    builder.includes('backgroundPosition') &&
    builder.includes('backgroundSize') &&
    builder.includes("case 'z-layer'") &&
    toolbar.includes('Căn chỉnh ảnh'),
  'align/position/size/z-layer commands',
);

gate(
  'UNDO_REDO',
  builder.includes('handleSectionBackgroundAction') &&
    builder.includes('updateBlock(blockId') &&
    builder.includes('const pushHistory') &&
    builder.includes('const undo'),
  'bg edits go through updateBlock → pushHistory',
);

gate(
  'NO_SECTION_DELETE',
  builder.includes("case 'remove-bg'") &&
    !/case 'remove-bg':[\s\S]{0,200}removeBlock/.test(builder) &&
    toolbar.includes('Xóa nền') &&
    canvas.includes('FloatingToolbar') &&
    canvas.includes('onDelete={() => handlers.onDelete(blockId)}'),
  'Xóa nền ≠ Xóa section; section delete toolbar untouched',
);

gate(
  'NO_REGRESSION',
  canvas.includes('function FloatingToolbar') &&
    canvas.includes('FreeDragHandle') &&
    canvas.includes('Di chuyển') &&
    canvas.includes('Nhân bản') &&
    canvas.includes('onFreeLayoutCommit') &&
    freeDrag.includes('data-lp-box-block'),
  'existing section toolbar + free-drag intact',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log('BACKGROUND_SELECT=' + (gates.BACKGROUND_SELECT.ok ? 'PASS' : 'FAIL'));
console.log('BACKGROUND_TOOLBAR=' + (gates.BACKGROUND_TOOLBAR.ok ? 'PASS' : 'FAIL'));
console.log('CSS_BG_IMAGE=' + (gates.CSS_BG_IMAGE.ok ? 'PASS' : 'FAIL'));
console.log('CHILD_ELEMENT_SELECT=' + (gates.CHILD_ELEMENT_SELECT.ok ? 'PASS' : 'FAIL'));
console.log('REMOVE_BG=' + (gates.REMOVE_BG.ok ? 'PASS' : 'FAIL'));
console.log('REMOVE_BG_IMAGE=' + (gates.REMOVE_BG_IMAGE.ok ? 'PASS' : 'FAIL'));
console.log('BG_POSITION=' + (gates.BG_POSITION.ok ? 'PASS' : 'FAIL'));
console.log('UNDO_REDO=' + (gates.UNDO_REDO.ok ? 'PASS' : 'FAIL'));
console.log('NO_SECTION_DELETE=' + (gates.NO_SECTION_DELETE.ok ? 'PASS' : 'FAIL'));
console.log('NO_REGRESSION=' + (gates.NO_REGRESSION.ok ? 'PASS' : 'FAIL'));
console.log('SECTION_BACKGROUND_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
