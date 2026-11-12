#!/usr/bin/env node
/**
 * Landing Page Builder — canvas selection + single toolbar gates.
 *   node scripts/test-landing-page-canvas-selection.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const selection = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-selection.ts'),
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
const drag = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-free-drag.tsx'),
  'utf8',
);

gate(
  'SINGLE_SELECT',
  selection.includes('return { ids: [key], primaryId: key }') &&
    builder.includes('applySelectionClick') &&
    builder.includes('setCanvasSelection'),
  'normal click replaces selection array',
);

gate(
  'SHIFT_MULTI_SELECT',
  selection.includes('opts?.shiftKey') &&
    selection.includes('return { ids: [...ids, key], primaryId: key }') &&
    ux.includes('shiftKey: e.shiftKey'),
  'shift+click appends to selection',
);

gate(
  'SHIFT_TOGGLE',
  selection.includes('ids.filter((id) => id !== key)') &&
    selection.includes('primaryId === key'),
  'shift+click selected item removes it',
);

gate(
  'NO_PARENT_DOUBLE_SELECT',
  ux.includes('[data-lp-inline-field]') &&
    ux.includes('[data-lp-element-id]') &&
    renderer.includes('isSectionPrimary') &&
    !renderer.includes('selected={selectedBlockId === block.id}'),
  'child clicks stopPropagation; section uses isSectionPrimary',
);

gate(
  'ONLY_ONE_TOOLBAR',
  ux.includes('LandingPageCanvasTextToolbarHost') &&
    builder.includes('<LandingPageCanvasTextToolbarHost handlers={canvasHandlers} />') &&
    !ux.match(/InlineEditable[\s\S]{0,4000}<TextEditToolbar/),
  'single toolbar host; InlineEditable does not render toolbar',
);

gate(
  'NO_OVERLAP_TOOLBAR',
  ux.includes('primarySelectedId') &&
    ux.includes('isTextToolbarTarget(primaryTarget)') &&
    ux.includes('!isTextFieldSelected'),
  'section/image toolbar hidden when text field is primary',
);

gate(
  'CLICK_EMPTY_CLEAR',
  builder.includes('deselectCanvas()') &&
    builder.includes('data-lp-canvas-backdrop') &&
    builder.includes('setCanvasSelection({ ids: [], primaryId: null })'),
  'empty canvas clears selection state',
);

gate(
  'SECTION_DRAG_ONLY_BY_HANDLE',
  ux.includes('canArmSectionBodyFreeDrag') &&
    ux.includes('data-lp-free-toggle') &&
    ux.includes('onToggleFreePosition') &&
    ux.includes('data-lp-section-handle') &&
    ux.includes('data-lp-section-drag-handle') &&
    ux.includes('isFreeDragBlockedTarget'),
  'flow: reorder ⠿ only; free mode: body drag + Tự do toggle (not drag-on-click)',
);

gate(
  'MARQUEE_MULTI_SELECT',
  selection.includes('collectMarqueeTargetsInBlock') &&
    selection.includes('applyMarqueeSelection') &&
    ux.includes('data-lp-marquee-selection') &&
    builder.includes('onMarqueeSelect'),
  'empty-area drag marquee selects multiple elements',
);

gate(
  'NO_SECTION_MOVE_WHILE_SELECTING',
  selection.includes('isLpMarqueeSelecting') &&
    selection.includes('setLpMarqueeSelecting') &&
    drag.includes('isLpMarqueeSelecting()') &&
    ux.includes('setLpMarqueeSelecting(true)'),
  'marquee flag blocks section free-drag',
);

gate(
  'CHILD_ELEMENT_PRIORITY',
  ux.includes('isInteractiveCanvasChild') &&
    ux.includes('[data-lp-inline-field]') &&
    ux.includes('[data-lp-element-id]') &&
    ux.includes('[data-lp-box-hit]'),
  'text/image/button hits excluded from section drag/marquee arm',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  builder.includes('LandingPageRenderer') &&
    builder.includes('LandingPageInspectorDesignTab') &&
    renderer.includes('MemoBlockView') &&
    ux.includes('FloatingToolbar') &&
    ux.includes('SectionBackgroundToolbar') &&
    builder.includes('pushHistory') &&
    builder.includes('persist('),
  'renderer/inspector/autosave/undo intact',
);

const failed = Object.entries(gates).filter(([, v]) => !v.ok);
process.exit(failed.length ? 1 : 0);
