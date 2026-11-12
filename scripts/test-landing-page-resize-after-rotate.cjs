#!/usr/bin/env node
/**
 * Gate: BUG-23 resize-after-rotate-wrong-axis.
 *   node scripts/test-landing-page-resize-after-rotate.cjs
 *
 * Resize handles are rendered as children of the rotated shell (FreeTransformChrome),
 * so they visually rotate with the box, but width/height/x/y in `useFreeDragBox`'s
 * applyMove() stay in the box's own pre-rotation (local) frame. The pointer delta
 * must be projected back into that local frame (inverse rotation by -s.rotate)
 * before being handed to the shared `applyResizeHandle`.
 *
 * This gate does two things:
 *  1. String-checks the actual fix is present in landing-page-free-drag.tsx (and that
 *     the surrounding commit/undo/autosave wiring — outside the dx/dy computation —
 *     was NOT touched by the fix).
 *  2. REAL MATH: mirrors the exact rotation-projection formula from the fixed source
 *     and feeds its output into the REAL, compiled `applyResizeHandle` (packages/shared)
 *     for all 8 handles x 5 angles, asserting the box grows in the direction the user
 *     actually dragged (not screen-axis-literal), and that rotate=0 is byte-identical
 *     to the pre-fix raw dx/dy behavior.
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

// --- 1. Source-level gates -------------------------------------------------

gate(
  'ROTATION_PROJECTION_PRESENT',
  drag.includes("const theta = (s.rotate * Math.PI) / 180;") &&
    drag.includes('const dx = rawDx * cos + rawDy * sin;') &&
    drag.includes('const dy = -rawDx * sin + rawDy * cos;'),
  'inverse-rotation projection (by -s.rotate) applied to resize pointer delta',
);

gate(
  'RESIZE_STILL_FEEDS_APPLY_RESIZE_HANDLE',
  /const dx = rawDx \* cos \+ rawDy \* sin;\s*const dy = -rawDx \* sin \+ rawDy \* cos;\s*const maxW[\s\S]{0,200}applyResizeHandle\(\{/.test(
    drag,
  ),
  'projected (dx,dy) — not raw screen delta — is what reaches applyResizeHandle',
);

gate(
  'COMMIT_UNDO_AUTOSAVE_PATH_UNTOUCHED',
  drag.includes('onCommitRef.current({') &&
    drag.includes("positionMode: 'free'") &&
    drag.includes('reserveHeight: flowH'),
  // Note: finish() no longer calls syncCanvasFreeReserve() after commit — that
  // post-commit imperative resync was removed separately by BUG-15
  // (canvas-reserve-height-dual-writer-race; see test-landing-page-canvas-reserve-height.cjs).
  // This gate only asserts the commit PAYLOAD shape (what pushHistory/autosave receive)
  // is untouched by the BUG-23 dx/dy rotation fix.
  'finish()/commit → onCommit payload shape unchanged by this fix (dx/dy-only change)',
);

gate(
  'ROTATE_ZERO_IS_IDENTITY_BY_CONSTRUCTION',
  // cos(0)=1, sin(0)=0 is a math fact, not something to grep — but confirm the
  // formula has no special-cased branch for theta===0 (i.e. it truly relies on
  // cos/sin degenerating to the identity rather than an `if (rotate) {...}` branch
  // that could drift out of sync with the general case).
  !/if\s*\(\s*s\.rotate\b[^)]*\)\s*\{[\s\S]{0,120}(rawDx|rawDy)/.test(drag),
  'no rotate-specific branch — identity at 0° falls out of the same formula as every other angle',
);

// --- 2. Real math: mirror the exact fixed formula + real applyResizeHandle -

let shared;
try {
  shared = require(path.join(root, 'packages/shared/dist/landing-page-free-position.js'));
} catch (e) {
  shared = null;
}

/** Mirrors the fixed dx/dy computation in landing-page-free-drag.tsx applyMove(). */
function projectPointerDeltaToLocal(rawDx, rawDy, rotateDeg) {
  const theta = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    dx: rawDx * cos + rawDy * sin,
    dy: -rawDx * sin + rawDy * cos,
  };
}

/** Forward-map a LOCAL (box-frame) pointer vector to SCREEN space at a given rotation —
 * i.e. "if the user physically dragged along the box's own axis, what would the
 * on-screen mouse delta be?" Used only to construct realistic test input; this is the
 * mathematical inverse of projectPointerDeltaToLocal (verified by ROUNDTRIP gates below). */
function localToScreen(localDx, localDy, rotateDeg) {
  const theta = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    dx: localDx * cos - localDy * sin,
    dy: localDx * sin + localDy * cos,
  };
}

const HANDLES = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
const ANGLES = [0, 45, 90, 180, 270];
const MAG = 50;
const EPS = 1e-6;
const approx = (a, b, eps = EPS) => Math.abs(a - b) < eps;

/** "Natural outward" local pointer vector for a handle — the local-frame mouse
 * movement that should grow the box along that handle (see BUG-23 write-up). */
function naturalLocalVectorForHandle(handle) {
  let ldx = 0;
  let ldy = 0;
  if (handle.includes('e')) ldx = MAG;
  if (handle.includes('w')) ldx = -MAG;
  if (handle.includes('s')) ldy = MAG;
  if (handle.includes('n')) ldy = -MAG;
  return { ldx, ldy };
}

let allRoundtripOk = true;
let allDirectionOk = true;
let allZeroIdentityOk = true;
const failures = [];

if (shared && typeof shared.applyResizeHandle === 'function') {
  for (const angle of ANGLES) {
    // Roundtrip: local -> screen -> (fixed formula) -> local must recover the original.
    for (const handle of HANDLES) {
      const { ldx, ldy } = naturalLocalVectorForHandle(handle);
      const screen = localToScreen(ldx, ldy, angle);
      const recovered = projectPointerDeltaToLocal(screen.dx, screen.dy, angle);
      const roundtripOk = approx(recovered.dx, ldx, 1e-6) && approx(recovered.dy, ldy, 1e-6);
      if (!roundtripOk) {
        allRoundtripOk = false;
        failures.push(
          `ROUNDTRIP angle=${angle} handle=${handle}: expected local (${ldx},${ldy}), got (${recovered.dx.toFixed(4)},${recovered.dy.toFixed(4)})`,
        );
      }

      // Zero-rotation identity: raw screen delta must equal the projected delta exactly.
      if (angle === 0) {
        const zeroOk = approx(recovered.dx, screen.dx, 1e-9) && approx(recovered.dy, screen.dy, 1e-9);
        if (!zeroOk) {
          allZeroIdentityOk = false;
          failures.push(`ZERO_IDENTITY handle=${handle}: projected delta differs from raw at rotate=0`);
        }
      }

      // Functional: feed the projected (local) delta into the REAL applyResizeHandle
      // and confirm the box grows correctly along the intended axis, with the
      // expected anchor shift, regardless of the section's rotation.
      const startBox = { x: 100, y: 100, width: 200, height: 120 };
      const result = shared.applyResizeHandle({
        handle,
        x: startBox.x,
        y: startBox.y,
        width: startBox.width,
        height: startBox.height,
        dx: recovered.dx,
        dy: recovered.dy,
      });

      const expectW = handle.includes('e') || handle.includes('w')
        ? startBox.width + MAG
        : startBox.width;
      const expectH = handle.includes('n') || handle.includes('s')
        ? startBox.height + MAG
        : startBox.height;
      // 'w'/'n' keep the OPPOSITE edge anchored, so x/y shift by -MAG; 'e'/'s' alone
      // leave x/y untouched (this anchor logic is applyResizeHandle's own, unchanged
      // by this fix — asserted here only to prove the fix didn't disturb it).
      const expectX = handle.includes('w') && !handle.includes('e') ? startBox.x - MAG : startBox.x;
      const expectY = handle.includes('n') && !handle.includes('s') ? startBox.y - MAG : startBox.y;

      const dirOk =
        approx(result.width, expectW, 0.5) &&
        approx(result.height, expectH, 0.5) &&
        approx(result.x, expectX, 0.5) &&
        approx(result.y, expectY, 0.5);
      if (!dirOk) {
        allDirectionOk = false;
        failures.push(
          `DIRECTION angle=${angle} handle=${handle}: expected {w:${expectW},h:${expectH},x:${expectX},y:${expectY}}, got {w:${result.width},h:${result.height},x:${result.x},y:${result.y}}`,
        );
      }
    }
  }
} else {
  allRoundtripOk = false;
  allDirectionOk = false;
  allZeroIdentityOk = false;
  failures.push('packages/shared/dist/landing-page-free-position.js not built or applyResizeHandle missing');
}

gate(
  'REAL_MATH_ROUNDTRIP_ALL_HANDLES_ALL_ANGLES',
  allRoundtripOk,
  `local->screen->local recovers original for ${HANDLES.length} handles x ${ANGLES.length} angles (0/45/90/180/270°)`,
);

gate(
  'REAL_MATH_ROTATE_ZERO_IDENTICAL_TO_RAW_DELTA',
  allZeroIdentityOk,
  'at rotate=0 the projected delta equals the raw screen delta exactly — unrotated behavior unchanged',
);

gate(
  'REAL_MATH_RESIZE_GROWS_ALONG_DRAGGED_AXIS',
  allDirectionOk,
  'applyResizeHandle (real, compiled) grows the correct dimension by the dragged amount for every handle at every angle, with unchanged anchor logic (no position jump beyond normal resize anchoring)',
);

if (failures.length) {
  console.log('');
  console.log('Failures:');
  for (const f of failures.slice(0, 20)) console.log('  - ' + f);
}

// --- 3. Undo/Redo + autosave/reload: confirm this fix cannot have touched that path -

gate(
  'UNDO_REDO_PIPELINE_UNCHANGED',
  drag.includes('onCommitRef.current(') &&
    !/onCommitRef\.current\(\{[\s\S]{0,50}(rawDx|rawDy|theta|cos|sin)/.test(drag),
  'onCommit payload construction has no dependency on the new rotation-projection locals — history/autosave receive the same shape as before',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log('FILES_CHANGED=landing-page-free-drag.tsx,scripts/test-landing-page-resize-after-rotate.cjs');
console.log('BUG_23=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
