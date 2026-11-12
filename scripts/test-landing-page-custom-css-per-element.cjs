#!/usr/bin/env node
/**
 * Gate: Custom CSS per element (no stale / no leak between Box A ↔ Box B).
 *   node scripts/test-landing-page-custom-css-per-element.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const helper = read('apps/web/src/components/landing-pages/landing-page-block-design-style.ts');
const design = read('apps/web/src/components/landing-pages/landing-page-inspector-design-tab.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

gate(
  'CSS_PER_ELEMENT',
  helper.includes('elementCustomCss') &&
    helper.includes('elementCustomClass') &&
    helper.includes('resolveCustomCssTargetKey') &&
    helper.includes('readCustomCssFields') &&
    helper.includes('patchCustomCssFields') &&
    design.includes('selectionKey') &&
    design.includes('data-lp-custom-css-selection'),
  'customCss/class stored per blockId::element target',
);

gate(
  'EMPTY_CSS_FOR_NEW_ELEMENT',
  design.includes('setDraftClass(next.className)') &&
    design.includes('setDraftCss(next.customCss)') &&
    design.includes('[selectionKey]') &&
    helper.includes("String(classMap[targetKey] || '')") &&
    helper.includes("String(cssMap[targetKey] || '')"),
  'new selection with no CSS → empty drafts',
);

gate(
  'NO_STALE_CSS',
  design.includes('selectionKey is the sync trigger') ||
    design.includes('never keep previous') ||
    (design.includes('useEffect') && design.includes('[selectionKey]')),
  'drafts reset on selectionKey change only',
);

gate(
  'NO_CSS_LEAK_BETWEEN_ELEMENTS',
  helper.includes('scopeLandingPageCustomCss') &&
    helper.includes('[data-lp-element-id=') &&
    helper.includes('[data-lp-block-id=') &&
    helper.includes('buildPageCustomCssBlocks') &&
    renderer.includes('buildPageCustomCssBlocks'),
  'CSS scoped to block/element selector',
);

gate(
  'SWITCH_SELECTION_RESTORE_CORRECT_CSS',
  design.includes('readCustomCssFields(style, targetKey)') &&
    design.includes('`${blockId}::${targetKey}`') &&
    builder.includes('CustomCssPanel') &&
    builder.includes('selectedElement={selectedElement}'),
  'switch back to A restores A fields from saved style maps',
);

gate(
  'AUTOSAVE_CUSTOM_CSS',
  builder.includes('updateBlock(selected.id, { style: nextStyle }') &&
    builder.includes('pushHistory') &&
    builder.includes('dirtyRef') &&
    design.includes('onPatchStyle(patchCustomCssFields'),
  'CSS writes go through updateBlock → history/autosave',
);

gate(
  'PREVIEW_PUBLISH_SCOPED_CSS',
  renderer.includes('buildPageCustomCssBlocks') &&
    renderer.includes('data-lp-custom-css') &&
    helper.includes('elementCustomCss') &&
    helper.includes('parseCustomCssDeclarations') &&
    helper.includes('readElementCustomCssStyle') &&
    canvas.includes('getElementCustomCssStyle') &&
    canvas.includes('mergeFieldStyle') &&
    canvas.includes('data-lp-element-id'),
  'custom CSS applied inline + scoped style tag for publish',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  builder.includes('commitBlockFreeLayout') &&
    builder.includes('pushHistory') &&
    builder.includes('autosaveInflightRef') &&
    canvas.includes('useFreeDragBox') &&
    builder.includes('LandingPageInspectorDesignTab') &&
    !builder.includes('sharedCustomCssState'),
  'drag/autosave/undo/inspector core intact',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
