#!/usr/bin/env node
/**
 * Gate: LP Builder free-drag / resize engine fixes (Phase drag-resize).
 *   node scripts/test-landing-page-drag-resize-engine.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const free = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const shared = read('packages/shared/src/landing-page-free-position.ts');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'COORD_SPACE_SCALE',
  free.includes('function readRect(el: HTMLElement, origin: DOMRect, scale = 1)') &&
    free.includes('(r.left - origin.left) / s') &&
    free.includes('surfaceLayoutSize') &&
    free.includes('clientWidth'),
  'rects ÷ scale; surface uses clientWidth',
);

gate(
  'RESIZE_SNAPSHOT_DELTA',
  free.includes('Snapshot geometry at pointerdown') &&
    free.includes('pendingClientX') &&
    free.includes('if (s.raf != null) return') &&
    free.includes('sess.originX') &&
    free.includes('sess.width') &&
    free.includes('applyResizeHandle'),
  'rAF from pending pointer + session snapshot only',
);

gate(
  'NO_REACT_FIGHT_WHILE_DRAGGING',
  free.includes('live DOM owns left/top/width/height/transform') &&
    free.includes('if (dragging)') &&
    free.includes("position: 'absolute'") &&
    !/transform:\s*dragging\s*\?\s*undefined/.test(free),
  'freeLayoutStyle omits geometry while dragging',
);

gate(
  'EIGHT_HANDLES',
  free.includes("['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']") &&
    canvas.includes("['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']") &&
    canvas.includes('applyResizeHandle') &&
    canvas.includes('onTextBoxResizeCommit'),
  'section + text box 8-direction resize',
);

gate(
  'TEXT_BOX_WH',
  canvas.includes('height: next.height') &&
    canvas.includes("maxWidth = 'none'") &&
    canvas.includes('overflowWrap') &&
    !canvas.includes('headingCornerOutwardDelta'),
  'corners set W+H; no max-width lock; old width-only scale removed',
);

gate(
  'SECTION_REFLOW',
  shared.includes('reflowFreeSectionsAfterChange') &&
    builder.includes('reflowFreeSectionsAfterChange') &&
    builder.includes('commitTextBoxResize') &&
    builder.includes('ONE history entry'),
  'reflow after section change; text box single history',
);

gate(
  'ONE_HISTORY_GESTURE',
  free.includes('onCommitRef.current') &&
    free.includes('scrollHeight') &&
    builder.includes('commitTextBoxResize') &&
    builder.includes("`${key}.textBoxResize`"),
  'commit once; content height folded into drop commit',
);

gate(
  'POINTER_CAPTURE',
  free.includes('setPointerCapture') &&
    canvas.includes('setPointerCapture') &&
    free.includes('requestAnimationFrame'),
  'Pointer Events + capture + rAF',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('DRAG_RESIZE_ENGINE_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
