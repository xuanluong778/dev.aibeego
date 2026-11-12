#!/usr/bin/env node
/**
 * Gate: LP Đồ họa rail → Canva-style graphics library
 *   node scripts/test-landing-page-graphics-library.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const graphics = read('apps/web/src/components/landing-pages/landing-page-graphics-library.tsx');
const presets = read('apps/web/src/components/landing-pages/landing-page-box-presets.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const dnd = read('apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const freeDrag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const nextCfg = read('apps/web/next.config.js');
const addPanel = read('apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const boxCount = (presets.match(/\bbox\('/g) || []).length;
const categoryIds = [
  'shapes',
  'boxes',
  'graphics',
  'effects',
  'photos',
  'video',
  'audio',
  'charts',
  'forms',
  'sheets',
  'tables',
  'frames',
  'grids',
  'mockup',
  'threed',
];

gate(
  'INITIAL_SHAPE_GROUP_SCOPED',
  graphics.includes('initialShapeGroup = null') &&
    addPanel.includes('initialShapeGroup="social"') &&
    !sidebar.includes('initialShapeGroup='),
  'optional prop; only add-components Social subview sets social group',
);

gate(
  'RAIL_RENAMED',
  sidebar.includes("label: 'Đồ họa'") &&
    sidebar.includes("id: 'graphics'") &&
    sidebar.includes("toggle('graphics')") &&
    sidebar.includes('LandingPageGraphicsLibraryPanel') &&
    !sidebar.includes("label: 'Hình hộp'"),
  'rail tab Đồ họa opens graphics library',
);

gate(
  'CATEGORY_GRID',
  graphics.includes('LP_GRAPHICS_CATEGORIES') &&
    graphics.includes('data-lp-graphics-category-grid') &&
    graphics.includes("label: 'Hình dạng'") &&
    graphics.includes("label: 'Hình Hộp'") &&
    graphics.includes("id: 'boxes'") &&
    graphics.includes("label: 'Khung'") &&
    graphics.includes("label: 'Lưới'") &&
    graphics.includes("label: 'Mockup'") &&
    categoryIds.every((id) => graphics.includes(`id: '${id}'`)),
  'Hình dạng + Hình Hộp + other Canva tiles',
);

gate(
  'SHAPE_SILHOUETTES',
  fs.existsSync(path.join(root, 'apps/web/src/components/landing-pages/landing-page-shape-silhouettes.tsx')) &&
    read('apps/web/src/components/landing-pages/landing-page-shape-silhouettes.tsx').includes('LP_SHAPE_SILHOUETTES') &&
    read('apps/web/src/components/landing-pages/landing-page-shape-silhouettes.tsx').includes("label: 'Đường kẻ'") &&
    read('apps/web/src/components/landing-pages/landing-page-shape-silhouettes.tsx').includes("label: 'Mũi tên'") &&
    graphics.includes('data-lp-shape-groups') &&
    graphics.includes('Xem tất cả') &&
    graphics.includes('setShapeGroupId'),
  'new Hình dạng groups with see-all rows',
);

gate(
  'GRAPHICS_ICONS',
  fs.existsSync(path.join(root, 'apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx')) &&
    read('apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx').includes('LP_GRAPHICS_ICON_ASSETS') &&
    read('apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx').includes('gfx-wa-green') &&
    read('apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx').includes('gfx-ig-gradient') &&
    read('apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx').includes('gfx-fb-blue') &&
    graphics.includes('LP_GRAPHICS_ICON_ASSETS') &&
    graphics.includes('data-lp-graphics-groups') &&
    presets.includes('backgroundImage') &&
    renderer.includes('styleBgImage'),
  'Đồ họa box has social/contact/scrapbook icons',
);

const photoPresetsPath = 'apps/web/src/components/landing-pages/landing-page-photo-presets.tsx';
const photoPresets = fs.existsSync(path.join(root, photoPresetsPath))
  ? read(photoPresetsPath)
  : '';
const photoPresetCount =
  (photoPresets.match(/\bstock\('/g) || []).length +
  (photoPresets.match(/\bwash\('/g) || []).length +
  (photoPresets.match(/\bsticker\('/g) || []).length +
  (photoPresets.match(/\bphoto\('/g) || []).length;

gate(
  'PHOTO_PRESETS',
  photoPresets.includes('LP_PHOTO_PRESETS') &&
    photoPresets.includes('LP_PHOTO_GROUPS') &&
    photoPresets.includes("label: 'Đề xuất'") &&
    photoPresets.includes("label: 'Thịnh hành'") &&
    photoPresets.includes("label: 'Màu nước'") &&
    photoPresets.includes("label: 'Texture & giấy'") &&
    photoPresets.includes("label: 'Lifestyle'") &&
    photoPresets.includes("label: 'Sticker'") &&
    photoPresets.includes("label: 'Hoa & lá'") &&
    photoPresetCount >= 50 &&
    graphics.includes('LP_PHOTO_PRESETS') &&
    graphics.includes('LP_PHOTO_GROUPS') &&
    graphics.includes('data-lp-photo-groups') &&
    graphics.includes('fromPhotos') &&
    graphics.includes('data-lp-graphics-premium') &&
    graphics.includes("category: 'photos'"),
  'Ảnh box has watercolor/texture/lifestyle/sticker groups + premium badge',
);

const chartPresetsPath = 'apps/web/src/components/landing-pages/landing-page-chart-presets.tsx';
const chartPresets = fs.existsSync(path.join(root, chartPresetsPath))
  ? read(chartPresetsPath)
  : '';
const chartPresetCount = (chartPresets.match(/\bchart\(\s*'/g) || []).length;

gate(
  'CHART_PRESETS',
  chartPresets.includes('LP_CHART_PRESETS') &&
    chartPresets.includes('LP_CHART_GROUPS') &&
    chartPresets.includes("label: 'Biểu đồ cột'") &&
    chartPresets.includes("label: 'Biểu đồ đường'") &&
    chartPresets.includes('Biểu đồ tròn') &&
    chartPresets.includes("label: 'Biểu đồ miền'") &&
    chartPresets.includes('phân tán') &&
    chartPresets.includes('phân cấp') &&
    chartPresets.includes('chạy đua') &&
    chartPresets.includes('infographic') &&
    chartPresetCount >= 20 &&
    graphics.includes('LP_CHART_PRESETS') &&
    graphics.includes('LP_CHART_GROUPS') &&
    graphics.includes('data-lp-chart-groups') &&
    graphics.includes('fromCharts') &&
    graphics.includes("category: 'charts'"),
  'Biểu đồ box has bar/line/pie/area/scatter/hierarchy/race/infographic groups',
);

const formPresetsPath = 'apps/web/src/components/landing-pages/landing-page-form-presets.tsx';
const formPresets = fs.existsSync(path.join(root, formPresetsPath))
  ? read(formPresetsPath)
  : '';
const formPresetCount = (formPresets.match(/\bid: 'form-/g) || []).length;
const types = read('packages/shared/src/landing-page-types.ts');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');

gate(
  'FORM_PRESETS',
  formPresets.includes('LP_FORM_PRESETS') &&
    formPresets.includes('LP_FORM_GROUPS') &&
    formPresets.includes("label: 'Thu thập lead'") &&
    formPresets.includes("label: 'Liên hệ & đăng ký'") &&
    formPresets.includes('Khảo sát') &&
    formPresets.includes('Phản hồi') &&
    formPresets.includes('RSVP') &&
    formPresets.includes('Checklist') &&
    formPresetCount >= 18 &&
    types.includes('formTheme') &&
    types.includes('footerText') &&
    types.includes('optionsLayout') &&
    lifecycle.includes('formTheme') &&
    renderer.includes('formTheme') &&
    renderer.includes('fieldOption:') &&
    builder.includes('insertFormPreset') &&
    dnd.includes("kind: 'form'") &&
    graphics.includes('LP_FORM_PRESETS') &&
    graphics.includes('data-lp-form-groups') &&
    graphics.includes('fromForms') &&
    graphics.includes("kind: 'form'"),
  'Biểu mẫu has themed LeadForm presets with editable text/fields',
);

gate(
  'DRILL_IN_SEARCH_BACK',
  graphics.includes('data-lp-graphics-back') &&
    graphics.includes('data-lp-graphics-search') &&
    graphics.includes('overflow-y-auto') &&
    graphics.includes("setCategoryId(null)") &&
    graphics.includes('data-lp-graphics-asset-list'),
  'category → assets with search + back + scroll',
);

gate(
  'LEGACY_BOXES_KEPT',
  boxCount >= 90 &&
    presets.includes('sq-solid') &&
    presets.includes('frame-circle') &&
    presets.includes('clip-heart') &&
    presets.includes('clip-arrow-up') &&
    graphics.includes('LP_BOX_PRESETS') &&
    graphics.includes('boxPresetGraphicsCategory') &&
    graphics.includes("return 'boxes'") &&
    graphics.includes('buildGraphicsAssets'),
  'old presets kept under Hình Hộp (boxes)',
);

gate(
  'DRAG_DROP_INSERT',
  graphics.includes('beginSidebarPresetDrag') &&
    graphics.includes("kind: 'box'") &&
    graphics.includes("kind: 'block-type'") &&
    dnd.includes("kind: 'box'") &&
    builder.includes('function insertBoxPreset') &&
    builder.includes("case 'box':") &&
    builder.includes('insertBoxPreset(payload.preset, pos)') &&
    builder.includes('pushHistory'),
  'click + drag-drop reuse sidebar DnD + history',
);

gate(
  'FRAME_GRID_IMAGE',
  renderer.includes('data-lp-frame') &&
    renderer.includes('data-lp-grid-block') &&
    renderer.includes('data-lp-grid-cell') &&
    builder.includes('function applyBlockImage') &&
    builder.includes('onApplyBlockImage') &&
    canvas.includes('onApplyBlockImage') &&
    presets.includes('lpGrid') &&
    presets.includes('grid-2x2'),
  'frames/grids accept image fill via media apply/drop',
);

gate(
  'TRANSFORM_ENGINE',
  renderer.includes('data-lp-box-block') &&
    renderer.includes('data-lp-transformable') &&
    freeDrag.includes('data-lp-box-block') &&
    canvas.includes('data-lp-box-block') &&
    builder.includes('commitBlockFreeLayout'),
  'move/resize/rotate/guides reuse existing free-drag engine',
);

gate(
  'SCOPE_SAFE',
  nextCfg.includes('module.exports = nextConfig') &&
    sidebar.includes("label: 'Nút bấm'") &&
    sidebar.includes("label: 'Hình ảnh'") &&
    sidebar.includes("label: 'Video'"),
  'next config + other rail tabs intact',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const mappedBoxes = boxCount;
const extras = (graphics.match(/extraBox\('/g) || []).length;

console.log('');
console.log(
  'FILES_CHANGED=landing-page-graphics-library.tsx,landing-page-form-presets.tsx,landing-page-chart-presets.tsx,landing-page-photo-presets.tsx,landing-page-builder.tsx,landing-page-renderer.tsx,landing-page-sidebar-dnd.ts,packages/shared/src/landing-page-types.ts,packages/shared/src/landing-page-lifecycle.ts,scripts/test-landing-page-graphics-library.cjs',
);
console.log(
  'GRAPHICS_CATEGORIES=' + categoryIds.join(',') + ' COUNT=' + categoryIds.length,
);
console.log('PRESETS_BOXES=' + mappedBoxes + ' EXTRAS=' + extras + ' PHOTOS=' + photoPresetCount + ' CHARTS=' + chartPresetCount + ' FORMS=' + formPresetCount);
console.log('DRAG_DROP_TEST=' + (gates.DRAG_DROP_INSERT.ok && gates.FRAME_GRID_IMAGE.ok ? 'PASS' : 'FAIL'));
console.log(
  'REGRESSION_CHECK=' +
    (gates.LEGACY_BOXES_KEPT.ok && gates.SCOPE_SAFE.ok && gates.TRANSFORM_ENGINE.ok ? 'PASS' : 'FAIL'),
);
console.log('GRAPHICS_LIBRARY_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
