#!/usr/bin/env node
/**
 * Gate: LP Tiêu đề rail → title presets panel
 *   node scripts/test-landing-page-title-presets.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const presets = read('apps/web/src/components/landing-pages/landing-page-title-presets.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');
const types = read('packages/shared/src/landing-page-types.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const requiredLabels = [
  'Heading 3',
  'Heading 2',
  'Heading 1',
  'Thêm tiêu đề 1',
  'Thêm tiêu đề 2',
  'Thêm tiêu đề 3',
  'Thêm tiêu đề 4',
  'Thêm tiêu đề 5',
  'Big Title',
  'CAPS TITLE',
  'Small Title',
  'Business Title',
  'Huge Title',
  'Luxury Title',
  'Bold Title',
  'Classic Title',
  'MAGAZINE TITLE',
  'GAME TITLE',
  'Thin Title',
  'Tall title',
  'Lobster title',
  'Writing title',
  'DISCOVER',
];

gate(
  'PRESET_CATALOG',
  requiredLabels.every((l) => presets.includes(`label: '${l}'`)) &&
    presets.includes('LP_TITLE_PRESETS') &&
    /data-lp-title-preset-count=\{LP_TITLE_PRESETS\.length\}/.test(presets),
  `${requiredLabels.length} title presets with live preview styles`,
);

gate(
  'PARAGRAPH_PRESETS',
  presets.includes('LP_PARAGRAPH_PRESETS') &&
    presets.includes('para-en') &&
    presets.includes('para-orange') &&
    presets.includes('para-montserrat') &&
    presets.includes('para-mulish') &&
    presets.includes('para-arima') &&
    presets.includes('Montserrat is a geometric') &&
    /data-lp-paragraph-preset-count=\{LP_PARAGRAPH_PRESETS\.length\}/.test(presets) &&
    builder.includes('function insertParagraphPreset') &&
    (builder.includes("setSelectedElement('subheadline')") ||
      builder.includes("element: 'subheadline'")),
  '8 paragraph presets + insert via subheadline',
);

gate(
  'LIST_PRESETS',
  presets.includes('LP_LIST_PRESETS') &&
    presets.includes('list-bullet-en') &&
    presets.includes('list-bullet-orange') &&
    presets.includes('list-check') &&
    presets.includes("bullet: 'check'") &&
    /data-lp-list-preset-count=\{LP_LIST_PRESETS\.length\}/.test(presets) &&
    builder.includes('function insertListPreset') &&
    renderer.includes('data-lp-list-block') &&
    renderer.includes("icon === 'check'"),
  '3 list presets (bullet / orange / check) + plain list render',
);

gate(
  'PANEL_TABS',
  presets.includes("label: 'Tiêu đề'") &&
    presets.includes("label: 'Đoạn văn'") &&
    presets.includes("label: 'Danh sách'") &&
    presets.includes('data-lp-text-presets-panel') &&
    presets.includes('overflow-y-auto') &&
    presets.includes('LandingPageTextPresetsPanel'),
  'panel has 3 tabs + overflow-y-auto viewport height',
);

gate(
  'RAIL_OPENS_PANEL',
  sidebar.includes("item.id === 'heading'") &&
    sidebar.includes("toggle('text')") &&
    sidebar.includes('onInsertTitlePreset') &&
    sidebar.includes('LandingPageTextPresetsPanel') &&
    sidebar.includes("panel === 'text'"),
  'Tiêu đề rail opens text presets overlay (keeps thin rail)',
);

gate(
  'INSERT_REUSES_ENGINE',
  builder.includes('function insertTitlePreset') &&
    builder.includes("defaultBlock('Benefits')") &&
    builder.includes('items: []') &&
    builder.includes('inlineTextStyles') &&
    builder.includes('pushHistory') &&
    builder.includes('onInsertTitlePreset={insertTitlePreset}') &&
    !builder.includes('facebook'),
  'click preset → Benefits title-only + inlineTextStyles + history',
);

gate(
  'STYLE_EXT_AND_PERSIST',
  canvas.includes('fontFamily?: string') &&
    canvas.includes('textTransform?') &&
    canvas.includes('backgroundImage') &&
    canvas.includes('WebkitBackgroundClip') &&
    lifecycle.includes('sanitizeInlineTextStylesMap') &&
    lifecycle.includes('inlineTextStyles') &&
    types.includes('inlineTextStyles?:'),
  'extended styles merge + sanitize preserves meta.inlineTextStyles',
);

gate(
  'TITLE_ONLY_RENDER',
  renderer.includes('data-lp-title-block') &&
    renderer.includes('!block.items.length') &&
    renderer.includes('align="left"'),
  'empty-items Benefits renders as left title block',
);

gate(
  'SCOPE_TITLE_ONLY',
  presets.includes('LP_PARAGRAPH_PRESETS') &&
    presets.includes('LP_LIST_PRESETS') &&
    !presets.includes('data-lp-text-tab-stub') &&
    sidebar.includes("item.id === 'image' && onOpenMediaLibrary"),
  'paragraph/list presets live in panel; media rail untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const filesChanged = [
  'landing-page-title-presets.tsx',
  'landing-page-builder-sidebar.tsx',
  'landing-page-builder.tsx',
  'landing-page-canvas-ux.tsx',
  'landing-page-renderer.tsx',
  'landing-page-lifecycle.ts',
  'landing-page-types.ts',
  'scripts/test-landing-page-title-presets.cjs',
];

console.log('');
console.log('FILES_CHANGED=' + filesChanged.join(','));
console.log('PRESETS_ADDED=' + requiredLabels.length + '+paragraph:' + 8 + '+list:' + 3);
console.log('TITLE_PRESETS_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
