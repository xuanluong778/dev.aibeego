#!/usr/bin/env node
// Semantic unit coverage for menu field targeting and persisted canvas groups.
// Real menu/drag/clipboard/history QA: qa-landing-page-canvas-groups-browser.cjs.
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const assert = require('node:assert/strict'),
  ts = require('typescript');
const shared = require('../packages/shared/dist');
const root = path.join(__dirname, '..'),
  components = path.join(root, 'apps/web/src/components/landing-pages');
function definitions(file, names) {
  const text = fs.readFileSync(path.join(components, file), 'utf8'),
    source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
    found = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text))
      found.push(node.getText(source).replace(/^export\s+/, ''));
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(found.length, names.length, 'Every tested helper is read from current source');
  return found.join('\n');
}
const functions =
  definitions('landing-page-canvas-selection.ts', [
    'elementFromField',
    'isItemImageField',
    'normalizeLpSelectionTarget',
    'lpSelectionKey',
    'parseLpSelectionKey',
  ]) +
  '\n' +
  definitions('landing-page-canvas-groups.ts', [
    'targetField',
    'targetIsHidden',
    'readCanvasGroups',
    'writeCanvasGroups',
    'groupForSelection',
  ]) +
  '\n' +
  definitions('landing-page-canvas-context-menu.tsx', [
    'resolveFieldForContext',
    'readContextFieldValue',
  ]);
const js = ts.transpileModule(functions, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const context = vm.createContext({ console });
vm.runInContext(js, context);
const text = {
  id: 'test',
  type: 'Benefits',
  enabled: true,
  headline: 'Section title',
  items: [{ id: 'one', title: 'Card title', description: 'Card description' }],
};
const resolve = context.resolveFieldForContext,
  read = context.readContextFieldValue;
assert.equal(resolve(text, 'item:one', 'text', 'itemTitle:one').field, 'itemTitle:one');
assert.equal(resolve(text, 'item:one', 'text', 'itemTitle:one').fieldKind, 'item.title');
assert.equal(read(text, 'itemTitle:one'), 'Card title');
assert.equal(read(text, 'itemDesc:one'), 'Card description');
assert.equal(read(text, 'headline'), 'Section title');
assert.equal(resolve(text, 'cta', 'button', 'ctaLabel').fieldKind, 'ctaLabel');
console.log('PASS exact field targeting for nested card text, normal text and button');
let spec = shared.createBlankLandingPageSpec();
spec.blocks = [
  { ...text, id: 'box', items: [] },
  { id: 'outside', type: 'Benefits', enabled: true, headline: 'Outside', items: [] },
];
const before = JSON.stringify(spec),
  members = ['box::field:headline', 'box::field:subheadline', 'box::field:ctaLabel'];
const group = { id: 'g-1', ownerId: 'box', boxKey: 'box/0', members };
const grouped = context.writeCanvasGroups(spec, [group]);
assert.equal(JSON.stringify(spec), before, 'Grouping is immutable');
assert.equal(context.readCanvasGroups(grouped)[0].members.length, 3);
assert.equal(context.groupForSelection(grouped, [...members].reverse()).id, 'g-1');
assert.equal(context.groupForSelection(grouped, members.slice(0, 2)), null);
const persisted = shared.sanitizeLandingPagePersistSpec(JSON.parse(JSON.stringify(grouped)));
assert.equal(
  context.readCanvasGroups(persisted)[0].members.length,
  3,
  'Existing persistence sanitizer retains all group members',
);
assert.equal(context.readCanvasGroups(persisted)[0].ownerId, 'box');
const moved = {
  ...persisted,
  meta: {
    ...persisted.meta,
    elementFreeLayouts: {
      'box::headline': { x: 40, y: 15 },
      'box::subheadline': { x: 40, y: 15 },
      'box::ctaLabel': { x: 40, y: 15 },
    },
  },
};
const ungrouped = context.writeCanvasGroups(moved, []);
assert.equal(context.readCanvasGroups(ungrouped).length, 0);
assert.deepEqual(
  ungrouped.meta.elementFreeLayouts,
  moved.meta.elementFreeLayouts,
  'Ungroup keeps positions',
);
assert.equal(ungrouped.blocks[1].id, 'outside');
console.log(
  'PASS group persistence through actual shared sanitizer, exact membership and position-preserving ungroup',
);
const malformed = {
  ...spec,
  blocks: spec.blocks.map((b) => ({ ...b, style: { lpElementGroups: '{not json' } })),
};
assert.equal(context.readCanvasGroups(malformed).length, 0);
const hidden = {
  ...grouped,
  meta: { ...grouped.meta, elementHidden: { 'box::subheadline': true } },
};
assert.equal(
  context.readCanvasGroups(hidden)[0].members.length,
  2,
  'Hidden member cannot remain selected',
);
assert.equal(
  shared.landingPageInlineAiRequestSchema.safeParse({
    action: 'suggest_3',
    fieldKind: 'headline',
    blockType: 'Hero',
    currentContent: '',
  }).success,
  true,
);
assert.equal(
  shared.landingPageInlineAiRequestSchema.safeParse({
    action: 'generate',
    fieldKind: 'headline',
    blockType: 'Hero',
  }).success,
  false,
);
console.log('PASS malformed metadata, hidden members and AI request contract');
