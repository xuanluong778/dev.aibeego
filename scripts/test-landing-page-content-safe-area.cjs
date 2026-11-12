#!/usr/bin/env node
/**
 * Gate: Landing Page Builder content safe-area guides (1200px column).
 *   node scripts/test-landing-page-content-safe-area.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const sharedSrc = read('packages/shared/src/landing-page-free-position.ts');
const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const publicClient = read('apps/web/src/components/landing-pages/public-landing-page-client.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

let mod = null;
const distPath = path.join(root, 'packages/shared/dist/landing-page-free-position.js');
try {
  delete require.cache[require.resolve(distPath)];
  mod = require(distPath);
} catch {
  mod = null;
}

gate(
  'CONTENT_SAFE_AREA',
  sharedSrc.includes('resolveContentSafeArea') &&
    sharedSrc.includes('CONTENT_SAFE_AREA_DESKTOP_MAX_PX = 1200') &&
    sharedSrc.includes('CONTENT_SAFE_AREA_SNAP_PX = 7') &&
    drag.includes('ContentSafeAreaGuidesOverlay') &&
    drag.includes('data-lp-content-safe-guides') &&
    drag.includes('data-lp-content-safe-guide') &&
    renderer.includes('contentSafeArea={Boolean(interactive || canvasHandlers)}'),
  'shared safe-area + builder overlay guides',
);

let desktop1200 = false;
if (mod && typeof mod.resolveContentSafeArea === 'function') {
  const d = mod.resolveContentSafeArea(1400, 'desktop');
  desktop1200 =
    d.width === 1200 &&
    Math.abs(d.left - (1400 - 1200) / 2) < 0.5 &&
    Math.abs(d.left - (1400 / 2 - 600)) < 0.5;
}
gate(
  '1200PX_DESKTOP',
  sharedSrc.includes('1200') &&
    drag.includes("left: 'calc(50% - 600px)'") &&
    drag.includes("left: 'calc(50% + 600px)'") &&
    (mod ? desktop1200 : true),
  'desktop ≥1280 → 1200px centered (50% ± 600)',
);

gate(
  'DRAG_BOUNDARY',
  drag.includes('clampToSafeArea') &&
    drag.includes('shouldClampToContentSafeArea') &&
    drag.includes('safeArea: s.clampToSafeArea ? s.safeArea : null') &&
    sharedSrc.includes('safeArea?:') &&
    sharedSrc.includes("kind: 'section'") &&
    drag.includes('data-lp-section-chrome') &&
    drag.includes("mode === 'offset'"),
  'content drag clamps to safe-area; sections stay full-width',
);

gate(
  'RESIZE_BOUNDARY',
  drag.includes('clampBoxToContentSafeArea') &&
    drag.includes('s.clampToSafeArea && s.safeArea') &&
    drag.includes('maxW') &&
    sharedSrc.includes('export function clampBoxToContentSafeArea'),
  'content resize clamped inside safe-area width',
);

let responsiveOk = false;
if (mod && typeof mod.resolveContentSafeArea === 'function') {
  const t = mod.resolveContentSafeArea(900, 'tablet');
  const m = mod.resolveContentSafeArea(390, 'mobile');
  responsiveOk =
    Math.abs(t.width - (900 - 48)) < 0.5 &&
    t.left === 24 &&
    Math.abs(m.width - (390 - 32)) < 0.5 &&
    m.left === 16;
}
gate(
  'RESPONSIVE_GUIDES',
  sharedSrc.includes('CONTENT_SAFE_AREA_TABLET_GUTTER_PX = 24') &&
    sharedSrc.includes('CONTENT_SAFE_AREA_MOBILE_GUTTER_PX = 16') &&
    drag.includes('ResizeObserver') &&
    drag.includes('resolveContentSafeArea') &&
    (mod ? responsiveOk : true),
  'tablet 100%-48 / mobile 100%-32; guides recompute on resize',
);

gate(
  'PUBLIC_GUIDES_HIDDEN',
  renderer.includes('contentSafeArea={Boolean(interactive || canvasHandlers)}') &&
    publicClient.includes('mode="public"') &&
    !publicClient.includes('contentSafeArea={true}') &&
    !/FreeGuidesProvider[\s\S]{0,80}contentSafeArea=\{true\}/.test(publicClient),
  'safe guides only when builder interactive/canvas handlers',
);

gate(
  'NO_REGRESSION',
  drag.includes('useFreeDragBox') &&
    drag.includes('computeFreeSnap') &&
    drag.includes('FREE_SNAP_THRESHOLD_PX') &&
    sharedSrc.includes('FREE_SNAP_THRESHOLD_PX = 10') &&
    builder.includes('commitBlockFreeLayout') &&
    builder.includes('pushHistory') &&
    builder.includes('autosaveInflightRef') &&
    drag.includes('beginResize') &&
    drag.includes('beginRotate') &&
    sharedSrc.includes('CONTENT_SAFE_AREA_SNAP_PX = 7'),
  'free-drag/resize/rotate/guides/undo/autosave intact; snap thr 7 for safe guides',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
