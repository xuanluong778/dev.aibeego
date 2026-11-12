#!/usr/bin/env node
/**
 * Gate: text + nested child elements support offset free-drag on LP canvas.
 *   node scripts/test-landing-page-element-free-drag.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const countdown = read('apps/web/src/components/landing-pages/landing-page-countdown.tsx');
const types = read('packages/shared/src/landing-page-types.ts');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'ELEMENT_FREE_LAYOUT_META',
  types.includes('elementFreeLayouts') && lifecycle.includes('sanitizeElementFreeLayoutsMap'),
  'meta.elementFreeLayouts typed + sanitized',
);

gate(
  'CANVAS_HANDLERS',
  canvas.includes('getElementFreeLayout') &&
    canvas.includes('onElementFreeLayoutCommit') &&
    builder.includes('commitElementFreeLayout') &&
    builder.includes('getElementFreeLayout:'),
  'builder wires element free layout commit/read',
);

gate(
  'INLINE_TEXT_DRAG',
  canvas.includes('useCanvasElementFreeDrag') &&
    canvas.includes('elementFreeDrag.armDrag') &&
    canvas.includes('data-lp-free-child="1"') &&
    canvas.includes('data-lp-element-selected={selected ? \'1\' : \'0\'}'),
  'InlineEditable arms offset drag when selected',
);

gate(
  'SECTION_DOES_NOT_STEAL',
  canvas.includes('canArmSectionBodyFreeDrag') &&
    canvas.includes('isInteractiveCanvasChild') &&
    canvas.includes('isFreeDragBlockedTarget') &&
    canvas.includes('[data-lp-inline-field]') &&
    canvas.includes('data-lp-free-child="1"') &&
    canvas.includes('data-lp-element-selected'),
  'section free-drag blocked on inline/box/cta child hits',
);

gate(
  'ELEMENT_CHROME_DRAG',
  canvas.includes('layoutField = `__element:${element}`') &&
    canvas.includes('armDrag(e)'),
  'ElementChrome (image/button) supports free drag',
);

gate(
  'COUNTDOWN_CELLS_DRAG',
  countdown.includes('CountdownCellChrome') &&
    countdown.includes('countdownCell:') &&
    countdown.includes('useCanvasElementFreeDrag'),
  'countdown timer cells draggable in builder',
);

gate(
  'ITEM_BOX_RESIZE',
  canvas.includes('ItemReorderChromeInteractive') &&
    canvas.includes('freeDrag.beginResize(handle, e)') &&
    canvas.includes('FreeTransformChrome') &&
    canvas.match(/freeDrag\.beginResize\(handle, e\)/g)?.length >= 2,
  'nested cards/boxes expose resize + rotate handles',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('ELEMENT_FREE_DRAG_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
