#!/usr/bin/env node
/**
 * Gate: drag Element to section edge/gap splits 2–12 columns.
 *   node scripts/test-landing-page-column-split.cjs
 */
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const target = read('apps/web/src/components/landing-pages/landing-page-section-insert-target.ts');
const indicator = read('apps/web/src/components/landing-pages/landing-page-sidebar-drop-indicator.tsx');
const toolbar = read('apps/web/src/components/landing-pages/landing-page-element-vertical-toolbar.tsx');
const notice = read('apps/web/src/components/landing-pages/landing-page-builder-version-notice.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const archive = read('scripts/aibeego-web-bundle-archive.cjs');
const shared = read('packages/shared/src/landing-page-section-elements.ts');
const elements = read('apps/web/src/components/landing-pages/landing-page-section-elements.tsx');

function gate(name, ok, detail) {
  if (!ok) throw new Error(`FAIL ${name}${detail ? ' — ' + detail : ''}`);
  console.log('PASS', name + (detail ? ' — ' + detail : ''));
}

gate(
  'VERTICAL_BAR',
  indicator.includes("orientation === 'vertical'") &&
    indicator.includes("data-lp-drop-bar={vertical ? 'column'") &&
    target.includes('orientation: \'vertical\'') &&
    target.includes('columnBar'),
  'drop indicator draws a vertical column bar',
);

gate(
  'SPLIT_POS',
  target.includes('splitColumns: picked.splitColumns') &&
    target.includes('columnIndex: picked.columnIndex') &&
    target.includes('export function pickColumnBox'),
  'drop target stores splitColumns + columnIndex',
);

gate(
  'PERSIST',
  shared.includes('export function applySplitColumnsToBlocks') &&
    shared.includes('lpContentColumns') &&
    elements.includes('applySplitColumnsToBlocks') &&
    elements.includes('ensureSectionColumns') &&
    elements.includes('data-lp-content-columns'),
  'split persists on host and wraps columns in the section',
);

gate(
  'VERSION_NOTICE_DISABLED',
  !builder.includes('LandingPageBuilderVersionNotice') &&
    !notice.includes('fetch(') &&
    !notice.includes('setInterval(') &&
    notice.includes('return null;') &&
    archive.includes('landing-page-builder-version.json') &&
    !target.includes("#00E174") &&
    target.includes('container: hostBox'),
  'update popup and polling are disabled; split uses the full section gutters',
);

gate(
  'WHITE_DROP_BAR',
  target.includes("export function sectionDropBarColor") &&
    target.includes("return '#ffffff'") &&
    !target.includes("luminance > 0.179 ? '#000000'") &&
    indicator.includes("background: '#ffffff'") &&
    indicator.includes('2px dashed #2563EB') &&
    indicator.includes('data-lp-drop-plus') &&
    indicator.includes('background:#ffffff!important'),
  'insert bar is pure white with a dashed blue border and centered plus',
);

gate(
  'CHROME_INSIDE_PAGE',
  toolbar.includes('placeVerticalToolbar') &&
    toolbar.includes('readToolbarPageBounds') &&
    toolbar.includes('resolveToolbarDockRect') &&
    toolbar.includes('createPortal(toolbar, document.body)') &&
    toolbar.includes('tightContentRect') &&
    toolbar.includes('fixed z-[50]') &&
    !toolbar.includes('createPortal(toolbar, canvasHost)') &&
    indicator.includes('querySelector(\'[data-lp-canvas-root]\')') &&
    indicator.includes('document.body') &&
    indicator.includes("position: 'fixed'") &&
    target.includes('export function placeVerticalToolbar') &&
    target.includes("never clamp a toolbar into content") &&
    target.includes('export function readToolbarPageBounds') &&
    target.includes('clampRectToBounds'),
  'toolbar stays inside the landing-page content box, never the inspector',
);

const chromeExtracted = target.match(
  /export function intersectRects\([\s\S]*?\nexport function columnEdgePx/,
);
const extracted = target.match(
  /export function columnEdgePx\([\s\S]*?\nexport function readColumnRects/,
);
gate('EXTRACT_CHROME', Boolean(chromeExtracted), 'placeVerticalToolbar source extracted');
gate('EXTRACT_PICK', Boolean(extracted), 'pickColumnBox source extracted');

const applySrc = shared.match(
  /export function applySplitColumnsToBlocks\([\s\S]*?\nexport function isSectionElement/,
);
gate('EXTRACT_APPLY', Boolean(applySrc), 'applySplitColumnsToBlocks source extracted');

const js = ts.transpileModule(
  `${chromeExtracted[0].replace(/\nexport function columnEdgePx[\s\S]*$/, '')}
${extracted[0].replace(/\nexport function readColumnRects[\s\S]*$/, '')}
${applySrc[0].replace(/\nexport function isSectionElement[\s\S]*$/, '')}
function readContentColumns(style) {
  const n = Number(style && style.lpContentColumns);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(12, Math.round(n)));
}
function readNativeColumnIndices(style) { return Array.isArray(style?.lpNativeColumnIndices) ? style.lpNativeColumnIndices : [readNativeColumnIndex(style)]; }
function readNativeColumnIndex(style) {
  const n = Number(style && style.lpNativeColumnIndex);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(11, Math.round(n)));
}
const LP_CONTENT_COLUMNS_MAX = 12;
`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } },
).outputText;

const ctx = { exports: {}, module: { exports: {} }, console };
ctx.module.exports = ctx.exports;
vm.runInNewContext(
  `${js}\nthis.pickColumnBox = pickColumnBox; this.applySplitColumnsToBlocks = applySplitColumnsToBlocks; this.placeVerticalToolbar = placeVerticalToolbar; this.clampRectToBounds = clampRectToBounds; this.readToolbarPageBounds = readToolbarPageBounds;`,
  ctx,
);

const colA = { left: 100, top: 200, width: 300, height: 400 };
const colB = { left: 430, top: 200, width: 300, height: 400 };
const container = { left: 100, top: 200, width: 700, height: 400 };
const inCol = ctx.pickColumnBox(200, container, [colA, colB]);
const splitRight = ctx.pickColumnBox(740, container, [colA, colB]);
const splitGap = ctx.pickColumnBox(420, container, [colA, colB]);
gate('COLUMN_SCOPED_HOST', inCol.columnIndex === 0 && !inCol.splitColumns && inCol.box.width === 300, JSON.stringify(inCol));
gate('SPLIT_2_TO_3_RIGHT_EDGE', splitRight.splitColumns === 3 && splitRight.columnIndex === 2, JSON.stringify(splitRight));
gate('SPLIT_2_TO_3_GAP', splitGap.splitColumns === 3 && splitGap.columnIndex === 1, JSON.stringify(splitGap));

const one = { left: 80, top: 100, width: 800, height: 360 };
const right = ctx.pickColumnBox(850, one, [one]);
const left = ctx.pickColumnBox(90, one, [one]);
const mid = ctx.pickColumnBox(480, one, [one]);
gate('SPLIT_1_TO_2_RIGHT', right.splitColumns === 2 && right.columnIndex === 1, JSON.stringify(right));
gate('SPLIT_1_TO_2_LEFT', left.splitColumns === 2 && left.columnIndex === 0, JSON.stringify(left));
gate('KEEP_1_COL_CENTER', !mid.splitColumns && mid.columnIndex === 0, JSON.stringify(mid));

const hostWide = { left: 80, top: 100, width: 1000, height: 360 };
const copy = { left: 180, top: 120, width: 640, height: 300 };
const gutter = ctx.pickColumnBox(900, hostWide, [copy]);
gate(
  'SPLIT_RIGHT_GUTTER',
  gutter.splitColumns === 2 && gutter.columnIndex === 1,
  JSON.stringify(gutter),
);
const leftGutter = ctx.pickColumnBox(100, hostWide, [copy]);
gate(
  'SPLIT_LEFT_GUTTER',
  leftGutter.splitColumns === 2 && leftGutter.columnIndex === 0,
  JSON.stringify(leftGutter),
);

const three = [0, 1, 2].map((i) => ({ left: 100 + i * 220, top: 0, width: 200, height: 300 }));
const box3 = { left: 100, top: 0, width: 660, height: 300 };
const to4 = ctx.pickColumnBox(770, box3, three);
gate('SPLIT_3_TO_4', to4.splitColumns === 4 && to4.columnIndex === 3, JSON.stringify(to4));

const six = [0, 1, 2, 3, 4].map((i) => ({ left: 40 + i * 140, top: 0, width: 120, height: 240 }));
const box5 = { left: 40, top: 0, width: 720, height: 240 };
const to6 = ctx.pickColumnBox(750, box5, six);
gate('SPLIT_5_TO_6', to6.splitColumns === 6 && to6.columnIndex === 5, JSON.stringify(to6));

const twelve = Array.from({ length: 12 }, (_, i) => ({ left: 10 + i * 50, top: 0, width: 40, height: 100 }));
const box12 = { left: 10, top: 0, width: 600, height: 100 };
const capped = ctx.pickColumnBox(620, box12, twelve);
gate('CAP_AT_12', !capped.splitColumns, JSON.stringify(capped));

const host = { id: 'sec', type: 'Benefits', style: {} };
const child = { id: 'el', type: 'Benefits', sectionPlacement: { sectionId: 'sec', anchor: { kind: 'end' }, edge: 'after', columnIndex: 1 } };
const grown = ctx.applySplitColumnsToBlocks([host, child], 'sec', 3, 1);
gate(
  'APPLY_SHIFT',
  grown[0].style.lpContentColumns === 3 && grown[1].sectionPlacement.columnIndex === 2,
  JSON.stringify({ host: grown[0].style, child: grown[1].sectionPlacement }),
);
const first = ctx.applySplitColumnsToBlocks([{ id: 'sec', type: 'Benefits', style: {} }], 'sec', 2, 1);
gate('APPLY_1_TO_2', first[0].style.lpContentColumns === 2, JSON.stringify(first[0].style));

const page = { left: 200, top: 80, width: 900, height: 700 };
const inside = ctx.placeVerticalToolbar({
  anchor: { left: 260, top: 220, width: 320, height: 80 },
  canvas: page,
  toolbarW: 44,
  toolbarH: 176,
});
gate(
  'TOOLBAR_FITS_RIGHT_INSIDE',
  inside &&
    inside.side === 'right' &&
    inside.left >= 260 + 320 &&
    inside.left + 44 <= page.left + page.width - 16,
  JSON.stringify(inside),
);
const nearRight = ctx.placeVerticalToolbar({
  anchor: { left: 980, top: 220, width: 100, height: 80 },
  canvas: page,
  toolbarW: 44,
  toolbarH: 176,
});
gate(
  'TOOLBAR_FLIPS_OR_PINS_INSIDE',
  nearRight &&
    nearRight.side === 'left' &&
    nearRight.left >= page.left + 16 &&
    nearRight.left + 44 <= page.left + page.width - 16,
  JSON.stringify(nearRight),
);
const tightRight = ctx.placeVerticalToolbar({
  anchor: { left: 400, top: 220, width: 680, height: 80 },
  canvas: page,
  toolbarW: 44,
  toolbarH: 176,
});
gate(
  'TOOLBAR_USES_FREE_LEFT_LANE',
  tightRight &&
    tightRight.side === 'left' &&
    tightRight.left >= page.left + 16 &&
    tightRight.left + 44 <= page.left + page.width - 16,
  JSON.stringify(tightRight),
);
const fullBleed = ctx.placeVerticalToolbar({
  anchor: page,
  canvas: page,
  toolbarW: 44,
  toolbarH: 176,
});
gate(
  'TOOLBAR_HIDES_WHEN_NO_FREE_LANE',
  fullBleed === null,
  JSON.stringify(fullBleed),
);
const pageBox = ctx.readToolbarPageBounds({
  canvas: { left: 80, top: 40, width: 1100, height: 800 },
  scroll: { left: 80, top: 40, width: 1100, height: 800 },
  inspector: { left: 980, top: 40, width: 320, height: 800 },
  contentSafe: { left: 140, top: 40, width: 900, height: 800 },
});
gate(
  'TOOLBAR_BOUNDS_CUT_INSPECTOR',
  pageBox.left === 140 &&
    pageBox.left + pageBox.width <= 980 &&
    pageBox.left + pageBox.width <= 140 + 900,
  JSON.stringify(pageBox),
);
const overflowBar = ctx.clampRectToBounds(
  { left: 1080, top: 100, width: 20, height: 400 },
  page,
);
gate(
  'DROP_BAR_CLAMPED_INSIDE',
  overflowBar.left >= page.left &&
    overflowBar.left + overflowBar.width <= page.left + page.width,
  JSON.stringify(overflowBar),
);

console.log('COLUMN_SPLIT_READY=PASS');
