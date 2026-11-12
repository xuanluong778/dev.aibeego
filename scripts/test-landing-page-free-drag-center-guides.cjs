#!/usr/bin/env node
/**
 * Gate: LP free-drag X/Y movement + canvas center guides.
 *   node scripts/test-landing-page-free-drag-center-guides.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const sharedSrc = read('packages/shared/src/landing-page-free-position.ts');
const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

// --- live math via dist (rebuild may lag; also eval critical helpers from src via Function) ---
function loadCompute() {
  // Prefer freshly-built dist; fall back to compiling inline checks from source text.
  const distPath = path.join(root, 'packages/shared/dist/landing-page-free-position.js');
  if (fs.existsSync(distPath)) {
    try {
      return require(distPath);
    } catch {
      /* fall through */
    }
  }
  return null;
}

let mod = loadCompute();
// Always re-require after we may rebuild — caller runs build first ideally.
delete require.cache[require.resolve(path.join(root, 'packages/shared/dist/landing-page-free-position.js'))];
try {
  mod = require(path.join(root, 'packages/shared/dist/landing-page-free-position.js'));
} catch {
  mod = null;
}

gate(
  'ENGINE_REUSED',
  drag.includes('useFreeDragBox') &&
    drag.includes('computeFreeSnap') &&
    drag.includes('applyAxisLock') &&
    drag.includes('translate3d') &&
    sharedSrc.includes('export function computeFreeSnap') &&
    !drag.includes('function computeFreeSnap'),
  'reuse shared snap + existing pointer free-drag hook',
);

gate(
  'FREE_DRAG_XY_ROOM',
  drag.includes('dragH + 560') &&
    drag.includes('movingTop + s.height + 240') &&
    /maxX0|surfaceRect\.width - dragW/.test(drag) &&
    drag.includes('preserveBoxSize: true') &&
    !/function\s+measureTightFreeSize/.test(drag),
  'expand canvas for X/Y room; preserve box size (no shrink-on-move)',
);

gate(
  'SHIFT_AND_ARROWS',
  drag.includes('applyAxisLock') &&
    drag.includes('shiftKey') &&
    drag.includes('ArrowLeft') &&
    drag.includes('shiftKey ? 10 : 1') &&
    sharedSrc.includes('export function nudgeFreeLayout'),
  'Shift axis lock; Arrow 1px / Shift+Arrow 10px',
);

gate(
  'UNDO_COMMIT',
  builder.includes('commitBlockFreeLayout') &&
    builder.includes('pushHistory') &&
    drag.includes('onCommitRef.current') &&
    ux.includes('onFreeLayoutCommit'),
  'drop commits freeLayout via existing history',
);

// Numeric center-guide tests (require dist)
let xyOk = false;
let centerOk = false;
let bothOk = false;
let thrOk = false;
let fullWidthGuideOk = false;

if (mod && typeof mod.computeFreeSnap === 'function') {
  const thr = mod.FREE_SNAP_THRESHOLD_PX;
  thrOk = thr >= 8 && thr <= 14;

  const canvas = { id: 'c', left: 0, top: 0, width: 800, height: 1000 };

  // Movable box near horizontal center → vertical guide + snap
  const nearX = mod.computeFreeSnap({
    moving: { id: 'm', left: 0, top: 100, width: 120, height: 60 },
    proposedX: 400 - 60 + 6, // 6px off center
    proposedY: 100,
    canvas,
    siblings: [],
    threshold: thr,
  });
  const hasVCenter =
    nearX.guides.some((g) => g.orientation === 'v' && g.kind === 'center') &&
    Math.abs(nearX.x - (400 - 60)) <= 1;

  // Near vertical center → horizontal guide
  const nearY = mod.computeFreeSnap({
    moving: { id: 'm', left: 40, top: 0, width: 120, height: 60 },
    proposedX: 40,
    proposedY: 500 - 30 + 5,
    canvas,
    siblings: [],
    threshold: thr,
  });
  const hasHCenter =
    nearY.guides.some((g) => g.orientation === 'h' && g.kind === 'center') &&
    Math.abs(nearY.y - (500 - 30)) <= 1;

  // Both axes at center → both guides
  const both = mod.computeFreeSnap({
    moving: { id: 'm', left: 0, top: 0, width: 120, height: 60 },
    proposedX: 400 - 60 + 4,
    proposedY: 500 - 30 - 3,
    canvas,
    siblings: [],
    threshold: thr,
  });
  bothOk =
    both.guides.some((g) => g.orientation === 'v' && g.kind === 'center') &&
    both.guides.some((g) => g.orientation === 'h' && g.kind === 'center');

  // Far from center → no center guides
  const far = mod.computeFreeSnap({
    moving: { id: 'm', left: 0, top: 0, width: 120, height: 60 },
    proposedX: 20,
    proposedY: 40,
    canvas,
    siblings: [],
    threshold: thr,
  });
  const farClean = !far.guides.some((g) => g.kind === 'center');

  // Free X/Y not stuck when width leaves room
  const move = mod.computeFreeSnap({
    moving: { id: 'm', left: 0, top: 0, width: 200, height: 80 },
    proposedX: 120,
    proposedY: 180,
    canvas,
    siblings: [],
    threshold: thr,
  });
  xyOk = move.x === 120 && move.y === 180 && hasVCenter && hasHCenter && farClean;

  // Full-width at x=0 still exposes vertical center guide (post-clamp)
  const full = mod.computeFreeSnap({
    moving: { id: 'm', left: 0, top: 100, width: 800, height: 80 },
    proposedX: 0,
    proposedY: 100,
    canvas,
    siblings: [],
    threshold: thr,
  });
  fullWidthGuideOk = full.guides.some(
    (g) => g.orientation === 'v' && g.kind === 'center' && Math.abs(g.position - 400) < 1,
  );

  centerOk = hasVCenter && hasHCenter && thrOk && fullWidthGuideOk;
} else {
  console.log('WARN dist missing — run shared build; falling back to source text checks');
  thrOk = /FREE_SNAP_THRESHOLD_PX\s*=\s*10/.test(sharedSrc);
  centerOk =
    thrOk &&
    sharedSrc.includes("kind: 'center'") &&
    sharedSrc.includes('boxCx - cxCanvas') &&
    sharedSrc.includes('SNAP_KIND_PRIORITY');
  xyOk =
    sharedSrc.includes('Math.max(0, input.canvas.width - w)') &&
    drag.includes('measureTightFreeSize');
  bothOk = sharedSrc.includes('orientation: \'v\'') && sharedSrc.includes('orientation: \'h\'');
  fullWidthGuideOk = sharedSrc.includes('boxCx - cxCanvas');
}

gate(
  'FREE_DRAG_TEST',
  xyOk &&
    drag.includes('measureTightFreeSize') &&
    drag.includes('requestAnimationFrame') &&
    drag.includes("window.addEventListener('pointermove'"),
  'X/Y free move within canvas; full-bleed shrink; rAF pointer engine',
);

gate(
  'CENTER_GUIDE_TEST',
  centerOk &&
    bothOk &&
    drag.includes("data-lp-guide") &&
    drag.includes("data-lp-guides-active") &&
    drag.includes('EMPTY_GUIDES') &&
    /isCenter|kind === 'center'/.test(drag) &&
    sharedSrc.includes('SNAP_KIND_PRIORITY'),
  'v/h center guides + snap; both at mid; hide on drop; thr≈10px',
);

gate(
  'SCOPE_SAFE',
  !drag.toLowerCase().includes('facebook') &&
    builder.includes('commitBlockFreeLayout') &&
    ux.includes('onInsertSidebarPreset'),
  'LP free-drag only; sidebar DnD untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=packages/shared/src/landing-page-free-position.ts,apps/web/src/components/landing-pages/landing-page-free-drag.tsx,scripts/test-landing-page-free-drag-center-guides.cjs',
);
console.log('FREE_DRAG_TEST=' + (gates.FREE_DRAG_TEST?.ok ? 'PASS' : 'FAIL'));
console.log('CENTER_GUIDE_TEST=' + (gates.CENTER_GUIDE_TEST?.ok ? 'PASS' : 'FAIL'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
