#!/usr/bin/env node
/**
 * Landing Page Design UX audit gates (selection / drag / delete / reserve / toolbar)
 *   node scripts/test-landing-page-design-audit.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const selection = read('apps/web/src/components/landing-pages/landing-page-canvas-selection.ts');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const freeDrag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const bgToolbar = read('apps/web/src/components/landing-pages/landing-page-section-background-toolbar.tsx');
const sharedFree = read('packages/shared/src/landing-page-free-position.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'CLICK_BOX_BODY_SELECTS_BOX',
  renderer.includes('data-lp-box-select="1"') &&
    renderer.includes('data-lp-box-hit') &&
    /onPointerUp[\s\S]*?element: imgUrl \? 'image' : 'section'/.test(renderer),
  'box body hit selects section/image via pointerUp',
);

gate(
  'CLICK_EMPTY_BOX_SELECTS_BOX',
  renderer.includes('data-lp-box-select="1"') &&
    renderer.includes("element: imgUrl ? 'image' : 'section'"),
  'empty box (no imgUrl) selects section via same handler',
);

gate(
  'FREE_BODY_DRAG',
  canvas.includes('canArmSectionBodyFreeDrag') &&
    canvas.includes('freeDrag.beginDrag(e, { force: true })') &&
    canvas.includes('data-lp-free-toggle') &&
    canvas.includes('onToggleFreePosition'),
  'free mode: body drag armed; Tự do is toggle not drag-only handle',
);

gate(
  'CTA_BODY_SELECTS_CTA',
  canvas.includes('data-lp-cta-body') &&
    canvas.includes("element === 'cta'") &&
    freeDrag.includes('[data-lp-cta-body]'),
  'CTA text body selects cta; not stolen by section free drag',
);

gate(
  'SECTION_EMPTY_SELECTS_SECTION',
  canvas.includes('data-lp-section-bg-hit') &&
    canvas.includes("element: 'section'") &&
    canvas.includes('data-lp-selection-target="section"') &&
    !canvas.includes('selectSectionSurface'),
  'empty padding always selects section',
);

gate(
  'BACKGROUND_EXPLICIT_ONLY',
  !canvas.includes('selectSectionSurface') &&
    canvas.includes('onBackground={()') &&
    canvas.includes("handlers.onSelect({ blockId, element: 'section-background' }") &&
    /data-lp-section-bg-hit[\s\S]*?onPointerUp[\s\S]*?element: 'section'/.test(canvas),
  'Nền only via explicit button — bg-hit never auto-selects section-background',
);

gate(
  'DELETE_SECTION_ALWAYS_REACHABLE',
  bgToolbar.includes('data-lp-delete-section-from-bg') &&
    bgToolbar.includes('data-lp-back-to-section') &&
    canvas.includes('onDeleteSection={() => handlers.onDelete(blockId)}') &&
    canvas.includes('onDelete={() => handlers.onDelete(blockId)}'),
  'Xóa section on section + Nền toolbars',
);

gate(
  'INLINE_EDIT_DELETE_SAFE',
  builder.includes("closest?.('[data-lp-inline-editing=\"1\"]')") &&
    builder.includes("e.key === 'Delete'") &&
    builder.includes('isEditableKeyboardTarget'),
  'Delete/Backspace blocked during inline edit / form input',
);

gate(
  'ONE_RESERVE_PER_FREE_SECTION',
  sharedFree.includes('computeCanvasFreeReserveHeight') &&
    renderer.includes('computeCanvasFreeReserveHeight') &&
    !renderer.includes('<FlowReserve') &&
    freeDrag.includes('syncCanvasFreeReserve') &&
    freeDrag.includes('clearLegacySlotFlowReserves'),
  'canvas-level single reserve; no per-block FlowReserve in renderer',
);

gate(
  'FREE_SECTION_HEIGHT_CONTENT_BASED',
  sharedFree.includes('maxBottom') &&
    sharedFree.includes('CANVAS_FREE_RESERVE_PADDING') &&
    renderer.includes('data-lp-free-reserve-h'),
  'reserve height = max(y+height)+padding',
);

gate(
  'NO_RANDOM_TOOLBAR_SWITCH',
  !canvas.includes('selectSectionSurface') &&
    canvas.includes('showBgToolbar = Boolean(isBgSelected)') &&
    canvas.includes('showToolbar ='),
  'toolbar swap only when selection target changes explicitly',
);

gate(
  'TOOLBAR_NO_CANVAS_BLOCK',
  canvas.includes('pointer-events-none') &&
    canvas.includes('pointer-events-auto') &&
    bgToolbar.includes('pointer-events-none') &&
    bgToolbar.includes('[&_button]:pointer-events-auto'),
  'toolbar shells pass clicks outside button chrome',
);

gate(
  'FREE_TOGGLE_NOT_DRAG',
  canvas.includes('data-lp-free-toggle') &&
    canvas.includes('onToggleFreePosition') &&
    builder.includes('toggleBlockFreePosition') &&
    !/data-lp-free-toggle[\s\S]{0,400}beginDrag/.test(canvas),
  'Tự do toggles free mode — does not start drag on click',
);

gate(
  'LEADFORM_SELECT_RESIZE',
  renderer.includes('data-lp-form-hit="1"') &&
    renderer.includes('element="form"') &&
    renderer.includes('ElementChrome') &&
    selection.includes("el === 'form'") &&
    canvas.includes('isSectionToolbarElement') &&
    freeDrag.includes('[data-lp-form-hit]'),
  'LeadForm card selectable + resizable; section toolbar stays when form selected',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(failed.length ? 'LANDING_PAGE_DESIGN_AUDIT=FAIL' : 'LANDING_PAGE_DESIGN_AUDIT=PASS');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
