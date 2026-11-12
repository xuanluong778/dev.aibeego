#!/usr/bin/env node
/**
 * Gate: Free-drag move preserves size (no shrink / reflow)
 *   node scripts/test-landing-page-free-drag-move-size.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const free = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'MOVE_PRESERVES_SIZE',
  free.includes('preserveBoxSize: true') &&
    (free.match(/preserveBoxSize:\s*true/g) || []).length >= 3 &&
    !free.includes('function measureTightFreeSize') &&
    free.includes('getBoundingClientRect'),
  'move/rotate lock size; tight-shrink helper removed',
);

gate(
  'NO_REFLOW',
  free.includes('Lock measured size so children do not reflow') ||
    free.includes('Never shrink via measureTightFreeSize') &&
    free.includes("el.style.width = `${dragW}px`") &&
    free.includes("el.style.height = `${dragH}px`") &&
    free.includes('boxSizing'),
  'session locks width/height before translate',
);

gate(
  'CHILD_LAYOUT_PRESERVED',
  free.includes('never union-of-text-nodes') &&
    free.includes('Math.round(box.width)') &&
    free.includes('Math.round(box.height)'),
  'section size from shell rect, not text-node union',
);

gate(
  'MOVE_VS_RESIZE',
  free.includes("s.kind = 'resize'") &&
    free.includes("s.kind = 'rotate'") &&
    free.includes("kind: 'move'") &&
    free.includes('applyResizeHandle') &&
    (free.includes('// --- move ---') || free.includes('sess.lastW = sess.width')) &&
    (free.includes('s.lastW = s.width') || free.includes('sess.lastW = sess.width')) &&
    (free.includes('s.lastH = s.height') || free.includes('sess.lastH = sess.height')),
  'move keeps width/height; resize owns size mutation',
);

gate(
  'UNDO_REDO',
  free.includes('onCommitRef.current') &&
    free.includes("positionMode: 'free'") &&
    free.includes('freeLayout:'),
  'commits still go through onCommit → history',
);

gate(
  'NO_REGRESSION',
  free.includes('FreeTransformChrome') &&
    free.includes('beginResize') &&
    free.includes('beginRotate') &&
    free.includes('computeFreeSnap') &&
    free.includes('FlowReserve') &&
    free.includes('freeLayoutStyle'),
  'resize/rotate/guides/toolbar hooks intact',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('FREE_DRAG_MOVE_SIZE_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
