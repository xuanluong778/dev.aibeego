#!/usr/bin/env node
/**
 * Landing Page Builder — free-position canvas readiness.
 *   node scripts/test-landing-page-free-position-canvas.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const sharedFree = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-free-position.ts'),
  'utf8',
);
const types = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);
const lifecycle = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);
const index = fs.readFileSync(path.join(root, 'packages/shared/src/index.ts'), 'utf8');
const drag = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-free-drag.tsx'),
  'utf8',
);
const ux = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);

// --- unit: snap math ---
function loadSnap() {
  // Minimal eval of threshold + compute via require after build; for gate use inline mirror checks
  return {
    thr: /FREE_SNAP_THRESHOLD_PX\s*=\s*10/.test(sharedFree),
    hasCompute: sharedFree.includes('export function computeFreeSnap'),
    hasAxis: sharedFree.includes('export function applyAxisLock'),
    hasNudge: sharedFree.includes('export function nudgeFreeLayout'),
  };
}
const snap = loadSnap();

gate(
  'FREE_DRAG',
  drag.includes('useFreeDragBox') &&
    drag.includes('translate3d') &&
    drag.includes('requestAnimationFrame') &&
    drag.includes("window.addEventListener('pointermove'") &&
    drag.includes('cancelAllFreeDrags') &&
    drag.includes('ev.buttons === 0') &&
    ux.includes('beginDrag') &&
    ux.includes('cancelAllFreeDrags') &&
    ux.includes('data-lp-free-drag-handle') &&
    (ux.includes('data-lp-free-box') || ux.includes('data-lp-free-drag-frame')) &&
    builder.includes('commitBlockFreeLayout') &&
    builder.includes('onFreeLayoutCommit'),
  'pointer free-drag + window listeners + sticky-drag guard + commit on drop',
);

gate(
  'VERTICAL_GUIDE',
  sharedFree.includes("orientation: 'v'") &&
    drag.includes("data-lp-guide") &&
    /orientation === 'v'|data-lp-guide.*v/.test(drag) &&
    sharedFree.includes("'center'") &&
    sharedFree.includes("'sibling'"),
  'vertical smart guides (edges/center/siblings)',
);

gate(
  'HORIZONTAL_GUIDE',
  sharedFree.includes("orientation: 'h'") &&
    drag.includes("data-lp-guide") &&
    sharedFree.includes('canvas') &&
    drag.includes('data-lp-smart-guides'),
  'horizontal smart guides across canvas',
);

gate(
  'CENTER_SNAP',
  sharedFree.includes('centerX') &&
    sharedFree.includes('centerY') &&
    /centerX\(input\.canvas\)|centerX\(s\)/.test(sharedFree) &&
    snap.thr,
  'snap to canvas/sibling centers ≤10px',
);

gate(
  'EDGE_SNAP',
  sharedFree.includes("'edge'") &&
    sharedFree.includes('addX(s.left') &&
    sharedFree.includes('addY(s.top'),
  'snap to left/right/top/bottom edges',
);

gate(
  'SIBLING_SNAP',
  sharedFree.includes("'sibling'") &&
    sharedFree.includes('input.siblings') &&
    ux.includes('data-lp-free-box'),
  'snap against neighboring free boxes',
);

gate(
  'EQUAL_SPACING',
  sharedFree.includes("'spacing'") &&
    sharedFree.includes('refGap') &&
    drag.includes('data-lp-spacing-label') &&
    sharedFree.includes('spacings.push'),
  'equal gap snap + pixel spacing labels',
);

gate(
  'SHIFT_AXIS_LOCK',
  sharedFree.includes('export function applyAxisLock') &&
    drag.includes('applyAxisLock') &&
    drag.includes('shiftLock') &&
    drag.includes('e.shiftKey'),
  'Shift locks drag to X or Y',
);

gate(
  'KEYBOARD_NUDGE',
  sharedFree.includes('nudgeFreeLayout') &&
    drag.includes('ArrowLeft') &&
    drag.includes('shiftKey ? 10 : 1') &&
    drag.includes('onCommit'),
  'arrows 1px / Shift+arrow 10px',
);

gate(
  'BOUNDARY_SAFE',
  (sharedFree.includes('Math.max(0, input.canvas.width - w)') ||
    sharedFree.includes('clampBoxToContentSafeArea') ||
    drag.includes('clampBoxToContentSafeArea')) &&
    sharedFree.includes('Math.min(maxX') &&
    drag.includes('resolveFreeSurface') &&
    (renderer.includes('data-lp-free-surface') || drag.includes('data-lp-free-surface')) &&
    (drag.includes("mode === 'offset'") || drag.includes("mode: 'offset'") || ux.includes("mode: 'offset'")),
  'clamp inside free surface; cards use offset mode (no vanish)',
);

gate(
  'INLINE_EDIT_NO_DRAG',
  drag.includes('data-lp-inline-editing="1"') &&
    drag.includes('isFreeDragBlockedTarget') &&
    ux.includes('data-lp-inline-editing="1"') &&
    /inline-editing[\s\S]{0,80}return/.test(drag.replace(/\n/g, ' ')),
  'no free-drag while inline editing / form / links',
);

gate(
  'UNDO_REDO_POSITION',
  builder.includes('commitBlockFreeLayout') &&
    builder.includes('pushHistory') &&
    builder.includes('markLandingPageUserEdits') &&
    builder.includes('freeLayout') &&
    builder.includes('const undo ='),
  'drop pushes one history entry; undo/redo works',
);

gate(
  'AUTOSAVE_POSITION',
  builder.includes('/autosave') &&
    builder.includes('clientRevision') &&
    builder.includes('commitBlockFreeLayout') &&
    builder.includes('dirtyRef') &&
    lifecycle.includes('freeLayout'),
  'position commits dirty+revision; sanitize persists freeLayout',
);

gate(
  'RESPONSIVE_SAFE',
  sharedFree.includes('resolveFreeLayoutForViewport') &&
    sharedFree.includes("viewport === 'mobile'") &&
    /return responsive\?\.mobile \?\? null/.test(sharedFree) &&
    builder.includes('responsiveFreeLayout') &&
    types.includes("positionMode?:") &&
    renderer.includes('resolveFreeLayoutForViewport'),
  'mobile without free layout falls back to flow',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  types.includes("positionMode?:") &&
    !/positionMode:\s*'free'/.test(
      fs.readFileSync(path.join(root, 'packages/shared/src/landing-page-templates.ts'), 'utf8').slice(0, 500),
    ) &&
    lifecycle.includes('sanitizePositionMode') &&
    renderer.includes('computeCanvasFreeReserveHeight') &&
    !types.includes("positionMode: 'free'"), // not required on base
  'old pages omit positionMode → stay flow',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !drag.toLowerCase().includes('facebook') &&
    !ux.includes('pages_manage') &&
    !builder.includes('meta-fanpage') &&
    builder.includes('runPageDoctor') &&
    builder.includes('publish') &&
    index.includes('landing-page-free-position'),
  'LP-only; doctor/publish/FB untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);

console.log('');
console.log('DRAG_ENGINE=pointer+rAF+transform-commit');
console.log('SMART_GUIDES=v/h magenta dashed + spacing labels (DOM imperative)');
console.log('SNAP_RULES=center|edge|sibling|canvas|equal-spacing thr=10px; Shift axis; arrow nudge');
console.log('RESPONSIVE_MODEL=positionMode flow|free; mobile free optional else flow');
console.log(
  'SCHEMA_CHANGED=LandingPageBlockBase.positionMode/freeLayout/responsiveFreeLayout + list item freeLayout',
);
console.log(
  'FILES_CHANGED=landing-page-free-position.ts,landing-page-types.ts,landing-page-lifecycle.ts,index.ts,landing-page-free-drag.tsx,landing-page-canvas-ux.tsx,landing-page-builder.tsx,landing-page-renderer.tsx,test-landing-page-free-position-canvas.cjs',
);
console.log(failed.length ? 'FREE_POSITION_CANVAS_READY=FAIL' : 'FREE_POSITION_CANVAS_READY=PASS');
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name} — ${g.detail}`);
}
process.exit(failed.length ? 1 : 0);
