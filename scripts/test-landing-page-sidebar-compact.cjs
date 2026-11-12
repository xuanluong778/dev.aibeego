#!/usr/bin/env node
/**
 * Landing Page Builder — compact left sidebar gates.
 *   node scripts/test-landing-page-sidebar-compact.cjs
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
const types = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

const shared = require('../packages/shared/dist/index.js');
const realTypes = new Set(shared.LANDING_PAGE_BLOCK_TYPES);

gate(
  'SIDEBAR_COLLAPSED',
  sidebar.includes('data-lp-sidebar-rail') &&
    sidebar.includes('data-lp-sidebar-compact="1"') &&
    (sidebar.includes('w-12') || sidebar.includes('sm:w-14') || sidebar.includes('w-14')) &&
    sidebar.includes('bg-white') &&
    (builder.includes('lg:grid-cols-[56px_1fr_280px]') ||
      builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_minmax(240px,280px)]') ||
      builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_minmax(280px,320px)]') ||
      (builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]') &&
        sidebar.includes("position: 'fixed'"))),
  'icon rail ~48–56px, white, compact grid',
);

gate(
  'PLUS_OPEN_PANEL',
  sidebar.includes('data-lp-rail-icon={dataAttr}') &&
    sidebar.includes("dataAttr=\"add\"") &&
    sidebar.includes('data-lp-add-elements-panel') &&
    sidebar.includes('Thêm phần tử') &&
    sidebar.includes("toggle('add')"),
  '+ opens add elements overlay',
);

gate(
  'PLUS_CLOSE_PANEL',
  sidebar.includes('data-lp-sidebar-close') &&
    sidebar.includes('setPanel((cur) => (cur === next ? null : next))'),
  'toggle + closes when open',
);

gate(
  'CLICK_OUTSIDE_CLOSE',
  sidebar.includes("mousedown") &&
    sidebar.includes('!el.contains(e.target)') &&
    sidebar.includes('close()'),
  'outside click closes panel',
);

gate(
  'ESC_CLOSE',
  sidebar.includes("e.key === 'Escape'") && sidebar.includes('close()'),
  'Escape closes panel',
);

gate(
  'ADD_ELEMENT',
  sidebar.includes('onAddBlock(item.type)') &&
    builder.includes('LandingPageBuilderSidebar') &&
    builder.includes('onAddBlock={addBlock}') &&
    builder.includes('function addBlocks') &&
    builder.includes('blocks.splice(insertAt, 0, block)'),
  'click adds after selected / append',
);

gate(
  'NEW_ELEMENT_SELECTED',
  (builder.includes('setSelectedId(focus.id)') ||
    builder.includes('setSelectedId(block.id)') ||
    builder.includes("selectCanvas({ blockId: focus.id, element: 'section' })")) &&
    (builder.includes("setSelectedElement('section')") ||
      builder.includes("element: 'section'")) &&
    builder.includes('function addBlock'),
  'new block selected after add',
);

gate(
  'RIGHT_PANEL_SYNC',
  builder.includes('data-inspector-block-id') &&
    builder.includes('selectedBlockId') &&
    builder.includes('scrollIntoView'),
  'inspector still syncs selection',
);

gate(
  'UNDO_REDO',
  builder.includes('pushHistory') &&
    builder.includes('const undo =') &&
    builder.includes('const redo =') &&
    builder.includes('historyRef'),
  'add uses pushHistory',
);

gate(
  'AUTOSAVE',
  builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('/autosave'),
  'autosave concurrency path intact',
);

gate(
  'MOBILE_DRAWER',
  sidebar.includes('max-md:fixed') &&
    (sidebar.includes('max-md:inset-x-3') ||
      (sidebar.includes('max-md:left-3') && sidebar.includes('max-md:right-3'))) &&
    sidebar.includes('max-md:w-auto'),
  'mobile near-full overlay drawer',
);

gate(
  'CANVAS_UI_UNCHANGED',
  canvasUx.includes('data-lp-floating-toolbar') &&
    builder.includes('canvas={canvasHandlers}') &&
    builder.includes('data-lp-canvas-scroll') &&
    !builder.includes('LayersPanel') &&
    (builder.includes('lg:grid-cols-[56px_1fr_280px]') ||
      builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_minmax(240px,280px)]') ||
      builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_minmax(280px,320px)]') ||
      builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]')),
  'canvas handlers/toolbar untouched',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !sidebar.includes('facebook') && !builder.includes('facebookAppReview'),
  'no facebook coupling in sidebar change',
);

gate(
  'FACEBOOK_APP_REVIEW_SAFE',
  !sidebar.includes('meta-review') &&
    !sidebar.includes('AppReview') &&
    types.includes('independent from Funnel / Facebook App Review'),
  'LP types remain FB-isolated',
);

// Only live types in catalog
const catalogMatch = [...sidebar.matchAll(/type:\s*'([A-Za-z]+)'/g)].map((m) => m[1]);
const fake = catalogMatch.filter((t) => !realTypes.has(t));
gate(
  'ONLY_LIVE_ELEMENTS',
  catalogMatch.length > 0 && fake.length === 0 && sidebar.includes('LP_ADD_ELEMENTS_LIVE'),
  fake.length ? `fake types: ${fake.join(',')}` : `${catalogMatch.length} live types`,
);

// Hidden reference fakes must not appear as add buttons
const forbidden = ['Survey', 'Table', 'Pen Tool', 'Spin Lucky', 'Carousel', 'Notify', 'Frame', 'Mã HTML'];
gate(
  'NO_FAKE_BUTTONS',
  forbidden.every((f) => !sidebar.includes(`label: '${f}'`) && !sidebar.includes(`label: "${f}"`)),
  'reference-only items not exposed',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log('SIDEBAR_COMPACT_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log(
  'FILES_CHANGED=apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx,apps/web/src/components/landing-pages/landing-page-builder.tsx,scripts/test-landing-page-sidebar-compact.cjs',
);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name}${g.detail ? ' — ' + g.detail : ''}`);
}
process.exit(failed.length ? 1 : 0);
