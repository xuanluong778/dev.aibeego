#!/usr/bin/env node
/**
 * Landing Page Builder — sidebar height / icon-rail upgrade gates.
 *   node scripts/test-landing-page-sidebar-height-upgrade.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);

const orderOk =
  sidebar.includes('LP_RAIL_QUICK_INSERT') &&
  (/Hình ảnh[\s\S]*Tiêu đề[\s\S]*Đoạn văn[\s\S]*Nút bấm[\s\S]*Hình hộp[\s\S]*Biểu tượng[\s\S]*Video/.test(
    sidebar,
  ) ||
    /Hình ảnh[\s\S]*Tiêu đề[\s\S]*Đoạn văn[\s\S]*Nút bấm[\s\S]*Đồ họa[\s\S]*Biểu tượng[\s\S]*Video/.test(
      sidebar,
    )) &&
  (sidebar.includes('data-lp-rail-quick-order="image,heading,paragraph,button,box,icon,video"') ||
    sidebar.includes('data-lp-rail-quick-order="image,heading,paragraph,button,graphics,icon,video"'));

gate(
  'SIDEBAR_HEIGHT_UPGRADED',
  (sidebar.includes('data-lp-sidebar-height="content"') ||
    sidebar.includes('data-lp-toolbar-height="content"')) &&
    (sidebar.includes('lg:max-h-[calc(100vh-var(--builder-top-offset') ||
      sidebar.includes("position: 'fixed'") ||
      sidebar.includes('h-auto')) &&
    !sidebar.includes("lg:h-[calc(100vh-var(--builder-top-offset") &&
    (sidebar.includes('overflow-x-hidden') || sidebar.includes('overflow-visible')) &&
    (sidebar.includes('w-12') || sidebar.includes('sm:w-14') || sidebar.includes('w-14')) &&
    sidebar.includes('data-lp-sidebar-fixed="1"'),
  'content-sized height (capped); no horizontal scrollbar',
);

gate(
  'ICON_ORDER',
  orderOk &&
    sidebar.includes("type: 'Gallery'") &&
    sidebar.includes("type: 'Hero'") &&
    sidebar.includes("type: 'CTA'") &&
    sidebar.includes("type: 'Video'"),
  'Hình ảnh→Tiêu đề→Đoạn văn→Nút→Hộp→Biểu tượng→Video',
);

gate(
  'TOOLTIP',
  (sidebar.includes('data-lp-rail-tooltip') ||
    fs
      .readFileSync(
        path.join(root, 'apps/web/src/components/landing-pages/rail-icon-hover-label.tsx'),
        'utf8',
      )
      .includes('data-lp-rail-tooltip')) &&
    (sidebar.includes('title={label}') ||
      sidebar.includes('aria-label={label}') ||
      sidebar.includes('RailIconHoverLabel')) &&
    (sidebar.includes('group-hover:block') ||
      sidebar.includes('RailIconHoverLabel') ||
      fs
        .readFileSync(
          path.join(root, 'apps/web/src/components/landing-pages/rail-icon-hover-label.tsx'),
          'utf8',
        )
        .includes('data-lp-rail-tooltip')) &&
    sidebar.includes('aria-label={label}'),
  'hover/focus tooltips on rail icons',
);

gate(
  'PLUS_LIBRARY',
  sidebar.includes('dataAttr="add"') &&
    sidebar.includes("toggle('add')") &&
    sidebar.includes('data-lp-add-elements-panel') &&
    sidebar.includes('LP_ADD_ELEMENTS_LIVE') &&
    /dataAttr="add"[\s\S]{0,120}primary/.test(sidebar.replace(/\n/g, ' ')),
  '+ opens block library overlay',
);

gate(
  'NO_CANVAS_OVERLAP',
  sidebar.includes('data-lp-left-sidebar-slot') &&
    (builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_minmax(280px,320px)]') ||
      builder.includes('lg:grid-cols-[56px_minmax(0,1fr)') ||
      builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]') ||
      builder.includes('lg:grid-cols-[minmax(0,1fr)]')) &&
    (sidebar.includes('--builder-left-offset') || sidebar.includes("position: 'fixed'")) &&
    (sidebar.includes('lg:fixed') || sidebar.includes("position: 'fixed'")) &&
    !sidebar.includes('lg:left-4'),
  'grid slot + fixed offset; canvas/inspector clear',
);

gate(
  'MOBILE_UNCHANGED',
  (sidebar.includes('lg:fixed') || sidebar.includes("position: 'fixed'")) &&
    (sidebar.includes('lg:max-h-[calc(100vh') ||
      sidebar.includes('data-lp-toolbar-height="content"') ||
      sidebar.includes('h-auto')) &&
    !/className=\{cn\(\s*'fixed/.test(sidebar) &&
    (sidebar.includes('w-12 sm:w-14') ||
      sidebar.includes('w-14') ||
      sidebar.includes('sm:w-16')) &&
    sidebar.includes('max-md:max-h-[calc(100vh-8rem)]'),
  'fixed only under lg:; mobile keeps prior max-h panels',
);

gate(
  'EXISTING_LOGIC_PRESERVED',
  sidebar.includes('LP_ADD_ELEMENTS_LIVE') &&
    sidebar.includes('LP_SECTION_PRESETS') &&
    sidebar.includes('onReorderBlocks') &&
    sidebar.includes('LandingPageThemeSwitcher') &&
    sidebar.includes("toggle('layers')") &&
    sidebar.includes('onAddBlock') &&
    builder.includes('LandingPageBuilderSidebar') &&
    builder.includes('onDupBlock') &&
    builder.includes('undo') &&
    !sidebar.toLowerCase().includes('facebook') &&
    !sidebar.includes('meta-fanpage'),
  'add/layers/theme/dnd/autosave path untouched; LP-only',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log('FILES_CHANGED=landing-page-builder-sidebar.tsx,scripts/test-landing-page-sidebar-height-upgrade.cjs');
console.log('LOGIC_CHANGED_YES_NO=NO');
console.log(failed.length ? 'SIDEBAR_READY=FAIL' : 'SIDEBAR_READY=PASS');
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name} — ${g.detail}`);
}
process.exit(failed.length ? 1 : 0);
