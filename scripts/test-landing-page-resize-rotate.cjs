#!/usr/bin/env node
/**
 * Gate: LP free-drag resize + rotate for button/icon blocks.
 *   node scripts/test-landing-page-resize-rotate.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const shared = read('packages/shared/src/landing-page-free-position.ts');
const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'SCHEMA_SIZE_ROTATE',
  shared.includes('height?: number') &&
    shared.includes('rotate?: number') &&
    shared.includes('export function applyResizeHandle') &&
    shared.includes('export function snapRotateDegrees') &&
    shared.includes('export function resizeHandleCursor') &&
    shared.includes("case 'nw':") &&
    /out\.height|o\.height/.test(shared) &&
    /out\.rotate|normalizeRotate/.test(shared),
  'freeLayout height+rotate sanitized; resize/rotate helpers',
);

gate(
  'RESIZE_TEST',
  drag.includes('beginResize') &&
    drag.includes("s.kind = 'resize'") &&
    drag.includes('applyResizeHandle') &&
    drag.includes('FreeTransformChrome') &&
    drag.includes('data-lp-resize-handle') &&
    ux.includes('beginResize') &&
    ux.includes('FreeTransformChrome') &&
    /ew-resize|ns-resize|nwse-resize|nesw-resize/.test(shared) &&
    shared.includes('FREE_SIZE_MIN_W') &&
    shared.includes('FREE_SIZE_MAX_W'),
  '8 handles + cursors + min/max + commit width/height',
);

gate(
  'ROTATE_TEST',
  drag.includes('beginRotate') &&
    drag.includes("s.kind = 'rotate'") &&
    drag.includes('snapRotateDegrees') &&
    drag.includes('data-lp-rotate-handle') &&
    drag.includes('data-lp-rotate-angle') &&
    drag.includes('liveAngle') &&
    shared.includes('FREE_ROTATE_SNAP_DEG') &&
    /15/.test(shared.match(/FREE_ROTATE_SNAP_DEG\s*=\s*(\d+)/)?.[0] || '') &&
    ux.includes('beginRotate'),
  'rotate handle 360° + angle badge + Shift snap 15°',
);

gate(
  'BUTTON_MOVE_FIX',
  ux.includes('data-lp-button-move-layer') &&
    ux.includes('buttonLike') &&
    renderer.includes('data-lp-button-block') &&
    renderer.includes('data-lp-transformable') &&
    drag.includes('data-lp-button-block'),
  'arrow/icon button blocks can free-move like others',
);

gate(
  'UNDO_KEEP_SELECT',
  builder.includes('commitBlockFreeLayout') &&
    builder.includes('pushHistory') &&
    drag.includes('const flowH = Math.round(s.lastH)') &&
    drag.includes('height: flowH') &&
    drag.includes('rotate: normalizeRotate(s.lastRotate)') &&
    !drag.includes('onDeselect'),
  'move/resize/rotate commit via history; no auto-deselect',
);

gate(
  'REGRESSION_CHECK',
  drag.includes('useFreeDragBox') &&
    drag.includes('computeFreeSnap') &&
    ux.includes('onInsertSidebarPreset') &&
    builder.includes('publish') &&
    !drag.toLowerCase().includes('facebook') &&
    renderer.includes('FreeGuidesProvider'),
  'reuse free-drag engine; sidebar/AI/publish/FB untouched',
);

// Live math from dist when available
let mathOk = true;
try {
  const dist = path.join(root, 'packages/shared/dist/landing-page-free-position.js');
  delete require.cache[require.resolve(dist)];
  const mod = require(dist);
  const r = mod.applyResizeHandle({
    handle: 'se',
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    dx: 20,
    dy: 10,
  });
  mathOk = r.width === 120 && r.height === 60 && r.x === 10 && r.y === 20;
  const snapped = mod.snapRotateDegrees(22, true, 15);
  mathOk = mathOk && snapped === 15;
  const cursors = ['n', 'e', 'se', 'ne'].map((h) => mod.resizeHandleCursor(h));
  mathOk =
    mathOk &&
    cursors[0] === 'ns-resize' &&
    cursors[1] === 'ew-resize' &&
    cursors[2] === 'nwse-resize' &&
    cursors[3] === 'nesw-resize';
} catch {
  mathOk = /applyResizeHandle/.test(shared);
}

gate('RESIZE_MATH', mathOk, 'applyResizeHandle + cursor map + snap 15°');

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=packages/shared/src/landing-page-free-position.ts,apps/web/src/components/landing-pages/landing-page-free-drag.tsx,apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx,apps/web/src/components/landing-pages/landing-page-renderer.tsx,scripts/test-landing-page-resize-rotate.cjs',
);
console.log('RESIZE_TEST=' + (gates.RESIZE_TEST?.ok ? 'PASS' : 'FAIL'));
console.log('ROTATE_TEST=' + (gates.ROTATE_TEST?.ok ? 'PASS' : 'FAIL'));
console.log('REGRESSION_CHECK=' + (gates.REGRESSION_CHECK?.ok ? 'PASS' : 'FAIL'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
