#!/usr/bin/env node
/**
 * Gate: BUG-15 canvas-reserve-height-dual-writer-race.
 *   node scripts/test-landing-page-canvas-reserve-height.cjs
 *
 * Before the fix, canvas `[data-lp-canvas-root]` minHeight had TWO independent
 * writers: landing-page-renderer.tsx (React-declarative, from committed spec via
 * computeCanvasFreeReserveHeight — "nguồn A") and landing-page-free-drag.tsx's
 * syncCanvasFreeReserve (imperative, live getBoundingClientRect — "nguồn B"),
 * called from ~10 sites including several that fired AFTER commit (racing nguồn A).
 * nguồn A also ignored rotation, so even when it "won" the race the value was wrong
 * for rotated sections.
 *
 * Fix: nguồn B now only writes DURING an active drag/resize/rotate gesture (rAF
 * ticks + gesture-start DOM mutation + cancel cleanup). Every post-commit call site
 * was removed. nguồn A (computeCanvasFreeReserveHeight) is now rotation-aware, so it
 * is a correct, sole, authoritative source once a gesture commits to spec.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const sharedSrc = read('packages/shared/src/landing-page-free-position.ts');

// --- 1. Single authoritative post-commit source -----------------------------

gate(
  'NO_POST_COMMIT_SYNC_IN_FINISH',
  !drag.includes('React mounts FlowReserve after commit') &&
    !/onCommitRef\.current\(\{[\s\S]{0,400}requestAnimationFrame\(\(\) => syncCanvasFreeReserve/.test(drag),
  'finish() no longer imperatively re-syncs reserve right after onCommit — LandingPageRenderer owns it',
);

gate(
  'NO_LAYOUT_MODE_EFFECT_DUPLICATE',
  !/When section returns to flow, collapse canvas reserve immediately/.test(drag) &&
    !/useEffect\(\(\) => \{\s*if \(mode === 'offset'\) return;[\s\S]{0,150}syncCanvasFreeReserve/.test(drag),
  'removed the [layout, mode]-keyed effect that duplicated computeCanvasFreeReserveHeight\'s job on every spec-driven layout change',
);

gate(
  'NO_KEYBOARD_NUDGE_POST_COMMIT_SYNC',
  !/onCommit\(\{ positionMode: 'free', freeLayout: next, viewport \}\);\s*if \(modeRef\.current/.test(drag),
  'keyboard nudge commits via onCommit only — no imperative resync races LandingPageRenderer afterward',
);

gate(
  'NO_BUILDER_SPEC_BLOCKS_EFFECT_DUPLICATE',
  !/Re-sync canvas reserve after spec mutations/.test(builder) &&
    !/useEffect\(\(\) => \{\s*if \(typeof document === 'undefined'\) return;\s*requestAnimationFrame\(\(\) => syncCanvasFreeReserve\(\)\);\s*\}, \[spec\.blocks, viewport\]\);/.test(
      builder,
    ),
  'removed builder.tsx\'s own [spec.blocks, viewport] effect — same job as LandingPageRenderer\'s effect',
);

gate(
  'BUILDER_NO_LONGER_IMPORTS_SYNC_RESERVE',
  !/import \{[^}]*syncCanvasFreeReserve[^}]*\} from '\.\/landing-page-free-drag'/.test(builder),
  'dead import removed after the last call site in builder.tsx was deleted',
);

gate(
  'RENDERER_STILL_SOLE_POST_COMMIT_WRITER',
  renderer.includes('computeCanvasFreeReserveHeight(canvasBlocks, viewport)') &&
    /useEffect\(\(\) => \{[\s\S]{0,300}root\.style\.minHeight = `\$\{canvasFreeReserve\}px`/.test(renderer) &&
    renderer.includes('...(canvasFreeReserve > 0 ? { minHeight: canvasFreeReserve } : null)'),
  'LandingPageRenderer\'s render (inline style) + effect are untouched — still the single post-commit authority',
);

// --- 2. DOM live reserve still serves ONLY active gestures -------------------

const activeGestureSites = [
  // finish() cancel-cleanup: drag was aborted with no prior committed layout —
  // no spec change happens, so only the live imperative path can clean this up.
  /Drop drag-temp spacers[\s\S]{0,200}syncCanvasFreeReserve\(s\.el\)/,
  // rotate live rAF tick
  /s\.kind === 'rotate'[\s\S]{0,900}syncCanvasFreeReserve\(s\.el\)/,
  // resize live rAF tick
  /Push following sections in document flow while dragging[\s\S]{0,40}syncCanvasFreeReserve\(s\.el\)/,
  // move live rAF tick
  /Pin left\/top directly[\s\S]{0,300}syncCanvasFreeReserve\(s\.el\)/,
  // startSession: first flow -> free transition (DOM mutated before any commit)
  /if \(rot0\) el\.style\.transform[\s\S]{0,40}syncCanvasFreeReserve\(el\)/,
  // beginResize: gesture start
  /s\.el\.style\.width = `\$\{s\.width\}px`;\s*if \(s\.mode !== 'offset'\) syncCanvasFreeReserve\(s\.el\)/,
];
const activeGestureOk = activeGestureSites.every((re) => re.test(drag));
gate(
  'LIVE_RESERVE_STILL_SERVES_ACTIVE_GESTURE',
  activeGestureOk,
  'all 6 legitimate during-gesture call sites (cancel-cleanup, rotate/resize/move rAF, 2 gesture-start sites) are intact',
);

const syncCallCount = (drag.match(/syncCanvasFreeReserve\(/g) || []).length - 1; // -1 for the export declaration itself
gate(
  'NO_EXTRA_LIVE_RESERVE_CALL_SITES',
  syncCallCount === 6,
  `expected exactly 6 call sites (active-gesture only), found ${syncCallCount}`,
);

// --- 3. Undo/Redo/reload flow through the same spec-driven path -------------

gate(
  'UNDO_REDO_RELOAD_DRIVE_SPEC_NOT_IMPERATIVE_SYNC',
  builder.includes('setSpec(prev)') && // undo
    builder.includes('setSpec(next)') && // redo (shared literal also matches pushHistory; both go through setSpec)
    builder.includes('setSpec(loaded)') && // load()/reload
    !builder.includes('historyRef.current.pop()') === false, // sanity: undo still pops history (kept as-is, unrelated to this fix)
  'undo()/redo()/load() all call setSpec — LandingPageRenderer recomputes canvasFreeReserve from the new spec on its own, no separate wiring needed',
);

// --- 4. REAL MATH: rotate-aware computeCanvasFreeReserveHeight ---------------

let shared;
try {
  shared = require(path.join(root, 'packages/shared/dist/landing-page-free-position.js'));
} catch (e) {
  shared = null;
}

gate(
  'SHARED_DIST_BUILT_FROM_LATEST_SRC',
  fs.existsSync(path.join(root, 'packages/shared/dist/landing-page-free-position.js')) &&
    fs.statSync(path.join(root, 'packages/shared/dist/landing-page-free-position.js')).mtimeMs >=
      fs.statSync(path.join(root, 'packages/shared/src/landing-page-free-position.ts')).mtimeMs,
  'dist is not stale relative to src (run `pnpm --filter @marketingspa/shared build` after editing the .ts source)',
);

const PADDING = 48; // CANVAS_FREE_RESERVE_PADDING
const MIN = 120; // CANVAS_FREE_RESERVE_MIN

function block(y, height, rotate, width) {
  return { positionMode: 'free', freeLayout: { x: 0, y, height, rotate, width, reserveHeight: height } };
}

/** Independent ground-truth: rotated-rect AABB bottom edge (own re-derivation, not
 * copy-pasted from the fix, to catch a wrong-but-self-consistent implementation). */
function groundTruthBottom(y, w, h, rotateDeg) {
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = w / 2;
  const cy = h / 2;
  // Rotate all 4 corners (relative to center) and take the max absolute Y extent.
  const corners = [
    [-cx, -cy],
    [cx, -cy],
    [cx, cy],
    [-cx, cy],
  ];
  let maxY = 0;
  for (const [px, py] of corners) {
    const ry = px * sin + py * cos;
    maxY = Math.max(maxY, Math.abs(ry));
  }
  return y + cy + maxY;
}

let rotateMathOk = true;
let rotateMathFailures = [];
if (shared && typeof shared.computeCanvasFreeReserveHeight === 'function') {
  const cases = [
    { angle: 0, w: 300, h: 150 },
    { angle: 45, w: 300, h: 150 },
    { angle: 90, w: 300, h: 150 },
    { angle: 135, w: 300, h: 150 },
    { angle: 180, w: 300, h: 150 },
    { angle: 225, w: 300, h: 150 },
    { angle: 270, w: 300, h: 150 },
    { angle: 315, w: 300, h: 150 },
  ];
  for (const c of cases) {
    const y = 200;
    const got = shared.computeCanvasFreeReserveHeight(
      [block(y, c.h, c.angle, c.w)],
      'desktop',
      PADDING,
    );
    const expectedBottom = groundTruthBottom(y, c.w, c.h, c.angle);
    const expected = Math.max(MIN, Math.round(expectedBottom + PADDING));
    if (Math.abs(got - expected) > 1) {
      rotateMathOk = false;
      rotateMathFailures.push(`angle=${c.angle}: expected ${expected}, got ${got}`);
    }
  }
  // A wide-but-short box (w=400,h=80) rotated 90 stands tall on screen (visual
  // height becomes ~its width). The PRE-FIX formula used only `h`, so it would have
  // reserved just 80px here — letting the next flow section overlap the now-tall
  // rotated box. Assert the fixed reserve is close to the WIDTH-driven bound, and
  // far larger than the old height-only value would have produced.
  // h kept >= CANVAS_FREE_RESERVE_MIN (120) so the unrelated min-height clamp inside
  // computeCanvasFreeReserveHeight doesn't muddy this rotation-specific assertion.
  const wide = { y: 0, w: 400, h: 130, rotate: 90 };
  const at90 = shared.computeCanvasFreeReserveHeight([block(wide.y, wide.h, wide.rotate, wide.w)], 'desktop', 0);
  const oldUnrotatedFormula = wide.y + wide.h; // what the pre-fix code would have produced
  const expectedAt90 = wide.y + wide.h / 2 + wide.w / 2; // center + half of rotated (width-driven) extent
  if (Math.abs(at90 - expectedAt90) > 1) {
    rotateMathOk = false;
    rotateMathFailures.push(`rotate=90 wide box: expected reserve ${expectedAt90}, got ${at90}`);
  }
  if (!(at90 > oldUnrotatedFormula * 2)) {
    rotateMathOk = false;
    rotateMathFailures.push(
      `rotate=90 wide box: reserve (${at90}) should be far larger than the pre-fix height-only value (${oldUnrotatedFormula}) — otherwise the next section would overlap it`,
    );
  }
} else {
  rotateMathOk = false;
  rotateMathFailures.push('packages/shared/dist/landing-page-free-position.js not built or function missing');
}
gate(
  'REAL_MATH_RESERVE_ACCOUNTS_FOR_ROTATE',
  rotateMathOk,
  'computeCanvasFreeReserveHeight (real, compiled) matches an independently re-derived rotated-AABB ground truth at 0/45/90/135/180/225/270/315°' +
    (rotateMathFailures.length ? ' — ' + rotateMathFailures.join('; ') : ''),
);

gate(
  'REAL_MATH_ROTATE_ZERO_AND_180_UNCHANGED',
  shared
    ? shared.computeCanvasFreeReserveHeight([block(200, 150, 0, 300)], 'desktop', PADDING) ===
        Math.max(MIN, Math.round(200 + 150 + PADDING)) &&
      shared.computeCanvasFreeReserveHeight([block(200, 150, 180, 300)], 'desktop', PADDING) ===
        Math.max(MIN, Math.round(200 + 150 + PADDING))
    : false,
  'at 0°/180° the formula reduces exactly to the pre-fix y+height (no regression for the common unrotated case)',
);

// --- 5. Multiple free sections — reserve tracks the DEEPEST one, no overlap --

let multiSectionOk = true;
if (shared) {
  const blocks = [block(50, 100, 0, 200), block(600, 300, 0, 200), block(120, 80, 90, 400)];
  const got = shared.computeCanvasFreeReserveHeight(blocks, 'desktop', PADDING);
  // Deepest is the y=600,h=300 section: bottom=900. The rotated one at y=120 with
  // w=400,h=80 rotated 90° has bottom = 120+40+200=360 — must not dominate.
  const expected = Math.max(MIN, Math.round(900 + PADDING));
  multiSectionOk = got === expected;
}
gate(
  'REAL_MATH_MULTI_SECTION_USES_DEEPEST_BOTTOM',
  multiSectionOk,
  'canvas reserve is driven by the single deepest section among several free sections (including a rotated one that is NOT the deepest) — prevents overlap with the next flow section',
);

// --- 6. "Drag deep" — no cap/overflow bug for large y ------------------------

let deepDragOk = true;
if (shared) {
  const y = 5000;
  const got = shared.computeCanvasFreeReserveHeight([block(y, 200, 0, 300)], 'desktop', PADDING);
  deepDragOk = got === Math.max(MIN, Math.round(y + 200 + PADDING));
}
gate(
  'REAL_MATH_DEEP_DRAG_NO_CAP',
  deepDragOk,
  'dragging a section far down (large y) scales the reserve linearly — no silent clamp that would let the next section overlap it',
);

// --- 7. Documented boundary: slow-loading image does not need a new writer ---

gate(
  'CONTENT_OVERFLOW_VISIBLE_BY_DESIGN',
  drag.includes('Do not clip free-section content') && drag.includes("overflow: 'visible'"),
  'free sections use overflow:visible + a spec-committed height (border-box) — organic content growth (e.g. a slow-loading image) intentionally does not auto-grow the canvas reserve; this predates and is unchanged by the BUG-15 fix — only an explicit resize (which does commit a new height) changes the reserve',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log(
  'FILES_CHANGED=landing-page-free-drag.tsx,landing-page-builder.tsx,packages/shared/src/landing-page-free-position.ts,scripts/test-landing-page-canvas-reserve-height.cjs',
);
console.log('BUG_15=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
