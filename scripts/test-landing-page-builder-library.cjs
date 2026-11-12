#!/usr/bin/env node
/**
 * Landing Page Builder — library (add / presets / templates) gates.
 *   node scripts/test-landing-page-builder-library.cjs
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
const templatesPage = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/templates/page.tsx'),
  'utf8',
);
const life = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);
const service = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const dto = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/dto/landing-pages.dto.ts'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);
const types = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);

const shared = require('../packages/shared/dist/index.js');
const EXPECTED = [
  'Header',
  'Hero',
  'Benefits',
  'Features',
  'Product',
  'Pricing',
  'Testimonials',
  'Gallery',
  'Video',
  'Process',
  'Speaker',
  'Guarantee',
  'FAQ',
  'LeadForm',
  'CTA',
  'Footer',
  'Countdown',
];

gate(
  'ADD_BLOCK',
  sidebar.includes('data-lp-add-elements-panel') &&
    LP_COUNT_OK() &&
    builder.includes('function addBlocks') &&
    builder.includes('function addBlock') &&
    builder.includes('onAddBlock={addBlock}'),
  '17 live blocks in + panel; addBlocks wired',
);

function LP_COUNT_OK() {
  const typesInCat = [...sidebar.matchAll(/type:\s*'([A-Za-z]+)'/g)].map((m) => m[1]);
  // Only catalog entries before presets — filter to known block types
  const catalog = typesInCat.filter((t) => EXPECTED.includes(t));
  const unique = [...new Set(catalog)];
  return unique.length === 17 && EXPECTED.every((t) => unique.includes(t));
}

gate(
  'NEW_BLOCK_SELECT',
  (builder.includes('setSelectedId(focus.id)') ||
    builder.includes("selectCanvas({ blockId: focus.id, element: 'section' })")) &&
    (builder.includes("setSelectedElement('section')") ||
      builder.includes("element: 'section'")) &&
    builder.includes('data-inspector-block-id') &&
    builder.includes('scrollIntoView'),
  'new block selected + inspector sync',
);

gate(
  'UNDO_REDO',
  (builder.includes('pushHistory(sanitizeLandingPageDraftSpec({ ...spec, blocks })') ||
    builder.includes('pushHistory(sanitizeLandingPageDraftSpec({ ...current, blocks })')) &&
    builder.includes('const undo =') &&
    builder.includes('const redo ='),
  'add uses pushHistory',
);

gate(
  'AUTOSAVE',
  builder.includes('clientRevision') &&
    builder.includes('STALE_REVISION') &&
    builder.includes('/autosave'),
  'autosave revision path intact',
);

gate(
  'SECTION_PRESET',
  sidebar.includes('LP_SECTION_PRESETS') &&
    sidebar.includes('data-lp-section-presets-panel') &&
    sidebar.includes('data-lp-add-tab="presets"') &&
    builder.includes('onAddBlocks={addBlocks}') &&
    !sidebar.includes("type: 'Survey'") &&
    !sidebar.includes("type: 'Carousel'"),
  'presets from existing types only',
);

gate(
  'TEMPLATE_SEARCH',
  templatesPage.includes('data-lp-template-search') &&
    templatesPage.includes("params.set('q'") &&
    dto.includes('q?: string') &&
    service.includes('query.q'),
  'search UI + API q filter',
);

gate(
  'TEMPLATE_PREVIEW',
  templatesPage.includes('openPreview') &&
    templatesPage.includes('LandingPageRenderer') &&
    templatesPage.includes('Xem trước'),
  'preview modal retained',
);

gate(
  'TEMPLATE_CLONE',
  templatesPage.includes('data-lp-use-template') &&
    templatesPage.includes('templateSlug') &&
    life.includes('function cloneLandingPageSpecWithNewIds') &&
    service.includes('cloneLandingPageSpecWithNewIds(this.parseSpec(tpl.definition))') &&
    typeof shared.cloneLandingPageSpecWithNewIds === 'function',
  'use template clones draft with new IDs',
);

gate(
  'RESPONSIVE',
  builder.includes("['desktop', 'tablet', 'mobile']") &&
    builder.includes('selectedBlockId') &&
    builder.includes('minmax(0,1fr)') &&
    builder.includes('overflow-x-hidden') &&
    builder.includes('data-lp-viewport={viewport}'),
  'viewport switch keeps selection; no overflow',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  builder.includes('sanitizeLandingPagePersistSpec') &&
    types.includes("version: 1") &&
    canvasUx.includes('SelectableShell'),
  'legacy sanitize + canvas select intact',
);

gate(
  'CANVAS_CORE_UNCHANGED',
  canvasUx.includes('data-lp-floating-toolbar') &&
    canvasUx.includes('LP_ITEM_MIME') &&
    canvasUx.includes('TAP_MOVE_PX') &&
    builder.includes('canvas={canvasHandlers}') &&
    builder.includes('autosaveInflightRef'),
  'canvas UX + autosave concurrency untouched',
);

// Runtime: clone regenerates ids
const sample = shared.createEmptyLandingPageSpec('MODERN');
const cloned = shared.cloneLandingPageSpecWithNewIds(sample);
const idsA = sample.blocks.map((b) => b.id).join(',');
const idsB = cloned.blocks.map((b) => b.id).join(',');
gate(
  'CLONE_IDS_UNIT',
  idsA !== idsB &&
    sample.blocks.length === cloned.blocks.length &&
    cloned.blocks.every((b) => typeof b.id === 'string' && b.id.length > 3),
  'cloned block ids differ from master',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log('BUILDER_LIBRARY_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log(
  'FILES_CHANGED=' +
    [
      'landing-page-builder-sidebar.tsx',
      'landing-page-builder.tsx',
      'templates/page.tsx',
      'landing-page-lifecycle.ts',
      'landing-pages.service.ts',
      'landing-pages.dto.ts',
      'scripts/test-landing-page-builder-library.cjs',
    ].join(','),
);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name}${g.detail ? ' — ' + g.detail : ''}`);
}
process.exit(failed.length ? 1 : 0);
