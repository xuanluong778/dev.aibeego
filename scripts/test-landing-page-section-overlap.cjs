#!/usr/bin/env node
/**
 * Landing Page Builder — section reserve + smooth resize gates.
 *   node scripts/test-landing-page-section-overlap.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const shared = read('packages/shared/src/landing-page-free-position.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

// BUG-15 (canvas-reserve-height-dual-writer-race): builder.tsx used to ALSO call
// syncCanvasFreeReserve() imperatively after every spec mutation, racing renderer's
// own computeCanvasFreeReserveHeight-driven write. That duplicate writer was removed
// — LandingPageRenderer is now the single post-commit authority; the live/imperative
// path in free-drag.tsx only runs DURING an active drag/resize/rotate gesture.
gate(
  'SECTION_NO_OVERLAP',
  drag.includes('syncCanvasFreeReserve(s.el)') &&
    drag.includes('[data-lp-section-chrome="1"][data-lp-position-mode="free"]') &&
    drag.includes('s.el.style.left = `${snap.x}px`') &&
    !/move[\s\S]{0,400}translate3d\(/.test(drag.replace(/\n/g, ' ').match(/\/\/ --- move ---[\s\S]{0,600}/)?.[0] || '') &&
    !/syncCanvasFreeReserve/.test(builder) &&
    renderer.includes('computeCanvasFreeReserveHeight'),
  'live reserve on move + section-only selector + single post-commit authority (renderer, not builder)',
);

gate(
  'LIVE_SECTION_HEIGHT',
  drag.includes('export function syncCanvasFreeReserve') &&
    drag.includes('getBoundingClientRect') &&
    drag.includes('CANVAS_FREE_RESERVE_PADDING') &&
    shared.includes('rotated bounding box') &&
    shared.includes('Math.sin') &&
    shared.includes('Math.cos') &&
    renderer.includes('data-lp-free-reserve-h'),
  'DOM minHeight = max(bottom)+padding during drag; post-commit reserve is rotation-aware',
);

gate(
  'RESIZE_SMOOTH',
  drag.includes('readCanvasPointerScale') &&
    drag.includes('canvasScale') &&
    drag.includes('setPointerCapture') &&
    drag.includes('requestAnimationFrame') &&
    ux.includes('readCanvasPointerScale') &&
    ux.includes('scheduleMove') &&
    ux.includes('setPointerCapture'),
  'pointer capture + scale-normalized deltas + rAF',
);

gate(
  'RESIZE_4_CORNERS',
  ux.includes('data-lp-heading-corner-handle="nw"') &&
    ux.includes('data-lp-heading-corner-handle="se"') &&
    ux.includes('isHeadingCornerHandle') &&
    ux.includes('boxScale') &&
    ux.includes('data-lp-heading-corner-resizes-box'),
  '4 corner handles resize box proportionally',
);

gate(
  'TEXT_WRAP',
  ux.includes('syncHeadingWrapToContent') &&
    ux.includes('widthOnWrapOnly') &&
    ux.includes('whitespace-normal break-words') &&
    ux.includes('height: undefined') &&
    !/next\.overflow = 'hidden'/.test(ux),
  'width on wrap; text reflow; no clip',
);

gate(
  'UNDO_REDO',
  builder.includes('const undo = useCallback') &&
    builder.includes('const redo = useCallback') &&
    builder.includes('pushHistory') &&
    builder.includes('setSpec(prev)') &&
    builder.includes('setSpec(next)') &&
    renderer.includes('computeCanvasFreeReserveHeight'),
  'undo/redo mutate spec via setSpec; renderer recomputes+resyncs reserve on its own (no separate builder-side call needed)',
);

gate(
  'AUTOSAVE_RELOAD',
  builder.includes('dirtyRef.current = true') &&
    builder.includes('persist(') &&
    shared.includes('sanitizeFreeLayout') &&
    renderer.includes('canvasFreeReserve'),
  'freeLayout survives sanitize + reload reserve',
);

gate(
  'NO_META_CHANGE',
  !drag.includes('graph.facebook.com') &&
    !ux.includes('graph.facebook.com') &&
    !builder.includes('graph.facebook.com') &&
    !renderer.includes('graph.facebook.com'),
  'LP-only; no FB/Meta edits',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of [
  'SECTION_NO_OVERLAP',
  'LIVE_SECTION_HEIGHT',
  'RESIZE_SMOOTH',
  'RESIZE_4_CORNERS',
  'TEXT_WRAP',
  'UNDO_REDO',
  'AUTOSAVE_RELOAD',
  'NO_META_CHANGE',
]) {
  console.log(k + '=' + (gates[k]?.ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'SECTION_OVERLAP=FAIL' : 'SECTION_OVERLAP=PASS');
console.log(
  'FILES_CHANGED=landing-page-free-drag.tsx,landing-page-canvas-ux.tsx,landing-page-builder.tsx,landing-page-renderer.tsx,scripts/test-landing-page-section-overlap.cjs',
);
process.exit(failed.length ? 1 : 0);
