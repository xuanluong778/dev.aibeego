#!/usr/bin/env node
/**
 * BUG-02 public-free-position-sections-lost
 *   node scripts/test-landing-page-public-free-position.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const free = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const shellFn = ux.slice(ux.indexOf('export function SelectableShell'));
const nonInteractiveBranch = shellFn.slice(0, shellFn.indexOf('function SelectableShellInteractive'));

gate(
  'PUBLIC_SHELL_APPLIES_FREE_LAYOUT',
  nonInteractiveBranch.includes('if (!handlers)') &&
    nonInteractiveBranch.includes('freeLayoutStyle(publicFreeLayout') &&
    nonInteractiveBranch.includes("data-lp-position-mode={freeStyle ? 'free' : 'flow'}") &&
    nonInteractiveBranch.includes('data-lp-section-chrome="1"') &&
    nonInteractiveBranch.includes('data-lp-public-free'),
  'SelectableShell !handlers applies freeLayoutStyle',
);

gate(
  'NO_EDIT_ON_PUBLIC',
  nonInteractiveBranch.includes('freeLayoutStyle(publicFreeLayout ?? null, false)') &&
    !nonInteractiveBranch.includes('useFreeDragBox') &&
    !nonInteractiveBranch.includes('beginDrag') &&
    !nonInteractiveBranch.includes('FreeTransformChrome') &&
    !nonInteractiveBranch.includes('onPointerDown'),
  'public shell is render-only (no drag/resize chrome)',
);

gate(
  'RENDERER_PASSES_FREE_LAYOUT',
  renderer.includes('resolvePublicSectionFreeLayout') &&
    renderer.includes('publicFreeLayout=') &&
    renderer.includes('isPlausibleFreeLayout') &&
    renderer.includes('resolveFreeLayoutForViewport') &&
    (renderer.match(/publicFreeLayout=\{/g) || []).length >= 2,
  'hero + blocks pass publicFreeLayout when no canvas handlers',
);

gate(
  'RESERVE_HEIGHT_PARITY',
  renderer.includes('computeCanvasFreeReserveHeight') &&
    renderer.includes('data-lp-free-reserve-h') &&
    free.includes('export function freeLayoutStyle') &&
    free.includes('position: \'absolute\'') &&
    free.includes('rotate('),
  'canvas reserve + absolute/rotate styles shared with builder',
);

gate(
  'SECTION_NO_OVERLAP_PUBLIC',
  renderer.includes('minHeight: canvasFreeReserve') &&
    nonInteractiveBranch.includes("data-lp-position-mode={freeStyle ? 'free' : 'flow'}") &&
    free.includes('[data-lp-section-chrome="1"][data-lp-position-mode="free"]'),
  'public free sections participate in reserve/height model',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of Object.keys(gates)) {
  console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'BUG_02=FAIL' : 'BUG_02=PASS');
console.log(
  'FILES_CHANGED=landing-page-canvas-ux.tsx,landing-page-renderer.tsx,scripts/test-landing-page-public-free-position.cjs',
);
process.exit(failed.length ? 1 : 0);
