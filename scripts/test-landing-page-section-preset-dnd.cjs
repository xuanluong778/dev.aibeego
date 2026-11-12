#!/usr/bin/env node
/**
 * Landing Page — Section mẫu drag & drop (multi-block preset).
 *   node scripts/test-landing-page-section-preset-dnd.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const dnd = read('apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const addBlocksFn = (builder.match(/function addBlocks\([\s\S]*?\n  function addBlock/) || [''])[0];

gate(
  'PRESET_DRAG_START',
  dnd.includes("kind: 'section-preset'") &&
    dnd.includes('presetId: string') &&
    dnd.includes('types: LandingPageBlockType[]') &&
    sidebar.includes("kind: 'section-preset'") &&
    sidebar.includes('data-lp-sidebar-draggable="section-preset"') &&
    sidebar.includes('beginSidebarPresetDrag') &&
    dnd.includes('data-lp-section-preset-drag') &&
    dnd.includes('setDragImage'),
  'section-preset payload + ghost preview on drag start',
);

gate(
  'PRESET_DROP_INDEX',
  dnd.includes("mode: 'after'") &&
    dnd.includes("mode: 'start'") &&
    builder.includes("pos?.mode === 'after'") &&
    builder.includes("pos?.mode === 'start'") &&
    canvas.includes("data-lp-drop-edge") &&
    canvas.includes("mode: 'after'") &&
    canvas.includes("mode: 'before'") &&
    renderer.includes("mode: 'end'") &&
    canvas.includes('data-lp-section-drop-slot'),
  'before/after/end insert index from drop edge + canvas end',
);

gate(
  'PRESET_ORDERING',
  addBlocksFn.includes('insertAt += 1') &&
    addBlocksFn.includes('blocks.splice(insertAt, 0, block)') &&
    sidebar.includes("id: 'conversion-core'") &&
    sidebar.includes("id: 'social-proof-cta'") &&
    /types:\s*\['Hero',\s*'Benefits',\s*'Pricing',\s*'FAQ',\s*'LeadForm',\s*'CTA'\]/.test(sidebar) &&
    /types:\s*\['Testimonials',\s*'Guarantee',\s*'CTA'\]/.test(sidebar) &&
    builder.includes("case 'section-preset':") &&
    builder.includes('addBlocks(payload.types, { pos, select: \'first\' })'),
  'drop inserts full stack in preset.types order; conversion-core + social-proof-cta',
);

gate(
  'PRESET_UNIQUE_IDS',
  builder.includes('function uid(prefix: string)') &&
    builder.includes('id: uid(type.toLowerCase())') &&
    addBlocksFn.includes('defaultBlock(type)'),
  'each new block gets uid() id',
);

gate(
  'PRESET_UNDO_REDO',
  addBlocksFn.includes('pushHistory(sanitizeLandingPageDraftSpec({ ...current, blocks })') &&
    (addBlocksFn.match(/pushHistory/g) || []).length === 1 &&
    builder.includes('const undo =') &&
    builder.includes('const redo ='),
  'one history entry for whole preset stack',
);

gate(
  'PRESET_AUTOSAVE_RELOAD',
  addBlocksFn.includes('const current = specRef.current') &&
    builder.includes('dirtyRef.current = true') &&
    builder.includes('revisionRef.current += 1') &&
    builder.includes('/autosave'),
  'specRef + dirty/revision for autosave path',
);

gate(
  'PRESET_PUBLISH',
  builder.includes('await persist(specRef.current') &&
    builder.includes('wait: true') &&
    builder.includes("type === 'Guarantee'") &&
    builder.includes('Đảm bảo chất lượng dịch vụ'),
  'publish flush + Guarantee body for social-proof-cta',
);

gate(
  'PRESET_NO_DUPLICATE',
  sidebar.includes("dataset.lpDidDrag = '1'") &&
    sidebar.includes("dataset.lpDidDrag === '1'") &&
    canvas.includes('e.stopPropagation()') &&
    /onDrop=\{[\s\S]*?e\.stopPropagation\(\)/.test(canvas),
  'suppress click-after-drag; drop stopPropagation',
);

gate(
  'PRESET_DND_REGRESSION',
  sidebar.includes('onAddBlocks(preset.types)') &&
    canvas.includes('canArmSectionBodyFreeDrag') &&
    canvas.includes('data-lp-free-toggle') &&
    canvas.includes('beginResize') &&
    builder.includes('data-lp-inspector') &&
    !builder.toLowerCase().includes('facebookoauth') &&
    !sidebar.toLowerCase().includes('pages_manage') &&
    dnd.includes("kind: 'block-type'") &&
    dnd.includes("kind: 'button'"),
  'click-add kept; free-drag/resize/inspector/FB untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(failed.length ? 'SECTION_PRESET_DND_READY=FAIL' : 'SECTION_PRESET_DND_READY=PASS');
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
