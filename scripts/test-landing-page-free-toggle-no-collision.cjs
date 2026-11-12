#!/usr/bin/env node
/**
 * Gate: free-position toggle no longer snaps every section to the same corner.
 *   node scripts/test-landing-page-free-toggle-no-collision.cjs
 *
 * Reported bug (with screenshot): multiple sections in the same page rendered
 * overlapping/stacked on top of each other, and after clicking "Tự do" the
 * section still couldn't be dragged.
 *
 * Root cause (confirmed by reading the code): toggleBlockFreePosition and the
 * duplicate "Vị trí nâng cao" checkbox handler both defaulted a section's initial
 * free position to the HARDCODED `x: 24, y: 24` whenever it had no prior
 * freeLayout. Every section a user (or AI generation) switched to free position
 * for the first time landed at the exact same spot — stacking on top of each
 * other and on top of the first free section already there. Once stacked,
 * whichever section is topmost in paint order captures the pointerdown, making
 * the ones underneath feel "impossible to drag".
 *
 * Fix: measure the section's REAL current on-screen position (relative to the
 * canvas surface, same origin the live drag engine uses) via readRect/
 * resolveFreeSurface and use that as x/y — turning "Tự do" on is now a
 * no-visual-jump operation, and two different sections newly toggled free can
 * no longer land on the same coordinates just because neither had a saved
 * position yet.
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

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

gate(
  'READ_RECT_AND_SURFACE_EXPORTED',
  drag.includes('export function readRect(') && drag.includes('export function resolveFreeSurface('),
  'the position-measuring helpers used by the live drag engine are exported for reuse instead of being re-implemented',
);

gate(
  'BUILDER_IMPORTS_MEASURING_HELPERS',
  /import \{\s*clampAbsoluteFreeLayout,\s*patchAbsoluteFreeLayoutField,\s*readRect,\s*resolveFreeSurface,\s*\} from '\.\/landing-page-free-drag';/.test(
    builder,
  ),
  'landing-page-builder.tsx imports readRect/resolveFreeSurface',
);

gate(
  'SHARED_MEASURE_HELPER_PRESENT',
  builder.includes('function measureFreeToggleLayout(') &&
    /if \(x == null \|\| y == null\) \{\s*const surfaceEl = resolveFreeSurface\(shell\);\s*const box = readRect\(shell, surfaceEl\.getBoundingClientRect\(\)\);/.test(
      builder,
    ),
  'a single measureFreeToggleLayout() computes real on-screen x/y instead of a hardcoded corner',
);

gate(
  'NO_HARDCODED_24_24_DEFAULT_REMAINS',
  !/x: prev\?\.x \?\? 24,\s*\n\s*y: prev\?\.y \?\? 24,/.test(builder),
  'neither toggle call site still defaults straight to x:24,y:24 — both now go through measureFreeToggleLayout',
);

gate(
  'BOTH_TOGGLE_CALL_SITES_USE_SHARED_HELPER',
  (builder.match(/measureFreeToggleLayout\(/g) || []).length === 3, // 1 definition + 2 call sites
  'toggleBlockFreePosition and the "Vị trí nâng cao" checkbox handler both call the same fixed helper — no duplicated (and now-fixed-in-only-one-place) logic',
);

gate(
  'TOGGLE_FUNCTION_STILL_TURNS_OFF_CORRECTLY',
  /if \(block\.positionMode === 'free'\) \{\s*updateBlock\(blockId, \{ positionMode: 'flow' \} as Partial<LandingPageBlock>\);\s*return;\s*\}/.test(
    builder,
  ),
  'turning free position OFF is untouched by this fix',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log(
  'FILES_CHANGED=landing-page-builder.tsx,landing-page-free-drag.tsx,scripts/test-landing-page-free-toggle-no-collision.cjs',
);
console.log('FREE_TOGGLE_NO_COLLISION=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
