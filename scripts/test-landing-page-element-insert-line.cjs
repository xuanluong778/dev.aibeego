#!/usr/bin/env node
/**
 * Gate: Element sidebar drag insert line + slot destination
 *   node scripts/test-landing-page-element-insert-line.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const dnd = read('apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const panel = read('apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'LINE_SPEC',
  dnd.includes("LP_ELEMENT_INSERT_LINE_PX = 50") &&
    dnd.includes("LP_ELEMENT_INSERT_LINE_COLOR = '#00E174'") &&
    dnd.includes('data-lp-element-insert-line') &&
    dnd.includes('showElementInsertLine') &&
    dnd.includes('hideElementInsertLine') &&
    !dnd.includes('Thả vào đây') &&
    !canvas.includes('Thả vào đây') &&
    !renderer.includes('Thả vào đây'),
  'single 50px #00E174 line; no drop label',
);

gate(
  'TRANSPARENT_ELEMENT_DRAG_IMAGE',
  dnd.includes('setTransparentSidebarDragImage') &&
    dnd.includes("data-lp-sidebar-drag-preview', 'transparent") &&
    dnd.includes('elementDrag ?') &&
    dnd.includes("setData('text/plain', elementDrag ? '\\u00A0'"),
  'Element drags use a transparent drag image instead of the Văn bản chip',
);

gate(
  'SLOT_NOT_SECTION_EDGE_FOR_ELEMENT',
  canvas.includes('isLiveElementSidebarDrag') &&
    canvas.includes('resolveElementInsertTarget') &&
    canvas.includes('insertPosFromElementTarget') &&
    canvas.includes('showElementInsertLine(target.line)') &&
    builder.includes('cloneSidebarInsertPos') &&
    builder.includes('resolveInsideSlotCanvasLayout') &&
    builder.includes('markerKey/place') &&
    dnd.includes("mode: 'inside'") &&
    dnd.includes('markerKey') &&
    dnd.includes('pickInsertSlot'),
  'element drop saves section + slot/marker; line and insert share the target',
);

gate(
  'PAGE_LEVEL_KEEPS_BEFORE_AFTER',
  canvas.includes('isPageLevelSidebarPayload') &&
    dnd.includes('isPageLevelSidebarPayload') &&
    canvas.includes("mode: 'after' as const") &&
    canvas.includes("mode: 'before' as const") &&
    canvas.includes('resolveSectionDropMode(e.clientY, rect, false)'),
  'before/after whole section only for page-level blocks',
);

gate(
  'NO_OVERLAY_ON_ELEMENT_DRAG',
  canvas.includes("e.currentTarget.removeAttribute('data-lp-drop-over')") &&
    canvas.includes("e.currentTarget.removeAttribute('data-lp-preset-drop')") &&
    renderer.includes('isLiveElementSidebarDrag()') &&
    !renderer.includes('data-[lp-canvas-preset-over=1]:ring'),
  'no drop-zone wash / outline while dragging an Element',
);

gate(
  'POPUP_AFTER_DROP_ONLY',
  panel.includes("dragKind === 'picker'") &&
    panel.includes('kéo vào canvas, rồi chọn mẫu để chèn') &&
    panel.includes('onAbandonDropInsert') &&
    panel.includes('closeSubView') &&
    builder.includes('onAbandonDropInsert={abandonDropInsert}') &&
    builder.includes('pickerInsertPosRef.current = null') &&
    /case 'text':[\s\S]*Element cards insert only/.test(panel),
  'sidebar Element click does not open/insert; closing picker without a template clears the drop',
);

gate(
  'HIDE_LINE_ON_LEAVE_END',
  canvas.includes('hideElementInsertLine()') &&
    dnd.includes('hideElementInsertLine()') &&
    /onDragEnd[\s\S]*hideElementInsertLine/.test(dnd),
  'line hides on leave / drop / dragend',
);

const extracted = dnd.match(
  /export function pickInsertSlot\([\s\S]*?\nexport function insertLineRect/,
);
const colExtracted = dnd.match(
  /export function pickColumnBox\([\s\S]*?\nfunction cssEscapeValue/,
);
gate('EXTRACT_SLOT_FN', Boolean(extracted), 'pickInsertSlot source extracted');
gate('EXTRACT_COL_FN', Boolean(colExtracted), 'pickColumnBox source extracted');

function loadFns() {
  const src = `${extracted[0].replace(/\nexport function insertLineRect[\s\S]*$/, '')}
${colExtracted[0].replace(/\nfunction cssEscapeValue[\s\S]*$/, '')}
`;
  const js = ts.transpileModule(src, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const ctx = { exports: {}, module: { exports: {} }, console };
  ctx.module.exports = ctx.exports;
  vm.runInNewContext(`${js}\nthis.pickInsertSlot = pickInsertSlot; this.pickColumnBox = pickColumnBox;`, ctx);
  return ctx;
}

const fns = extracted && colExtracted ? loadFns() : null;

if (fns) {
  const content = { left: 100, top: 200, width: 800, height: 400 };
  const desc = { key: 'cta::subheadline', top: 260, bottom: 310, left: 120, right: 500 };
  const btn = { key: 'cta::ctaLabel', top: 340, bottom: 390, left: 120, right: 280 };
  const between = fns.pickInsertSlot(320, content, [desc, btn]);
  const below = fns.pickInsertSlot(410, content, [desc, btn]);
  const above = fns.pickInsertSlot(250, content, [desc, btn]);
  gate(
    'CTA_SLOT_BETWEEN_DESC_AND_BUTTON',
    between.markerKey === 'cta::subheadline' && between.place === 'after' && between.slotY === 310,
    JSON.stringify(between),
  );
  gate(
    'CTA_SLOT_BELOW_BUTTON',
    below.markerKey === 'cta::ctaLabel' && below.place === 'after' && below.slotY === 390,
    JSON.stringify(below),
  );
  gate(
    'CTA_SLOT_ABOVE_DESC',
    above.markerKey === 'cta::subheadline' && above.place === 'before' && above.slotY === 260,
    JSON.stringify(above),
  );

  const colA = { left: 100, top: 200, width: 300, height: 400 };
  const colB = { left: 430, top: 200, width: 300, height: 400 };
  const container = { left: 100, top: 200, width: 700, height: 400 };
  const inCol = fns.pickColumnBox(200, container, [colA, colB]);
  const splitRight = fns.pickColumnBox(740, container, [colA, colB]);
  const splitGap = fns.pickColumnBox(420, container, [colA, colB]);
  gate(
    'COLUMN_SCOPED_HOST',
    inCol.columnIndex === 0 && !inCol.splitColumns && inCol.box.width === 300,
    JSON.stringify(inCol),
  );
  gate(
    'SPLIT_2_TO_3_RIGHT_EDGE',
    splitRight.splitColumns === 3 && splitRight.columnIndex === 2,
    JSON.stringify(splitRight),
  );
  gate(
    'SPLIT_2_TO_3_GAP',
    splitGap.splitColumns === 3 && splitGap.columnIndex === 1,
    JSON.stringify(splitGap),
  );
}

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=landing-page-sidebar-dnd.ts,landing-page-canvas-ux.tsx,landing-page-builder.tsx,landing-page-add-components-panel.tsx,landing-page-renderer.tsx,scripts/test-landing-page-element-insert-line.cjs',
);
console.log('ELEMENT_INSERT_LINE_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
