#!/usr/bin/env node
const {
  assert,
  vm,
  ts,
  path,
  root,
  parse,
  definition,
  evaluate,
  harness,
  snapshot,
  shared,
  builder,
} = require('./helpers/landing-page-source-harness.cjs');
const elements = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-section-elements.tsx'),
);
const target = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-section-insert-target.ts'),
);
const ctx = harness();
ctx.sectionPlacementFromInsertPos = evaluate(
  definition(target, 'sectionPlacementFromInsertPos'),
  ctx,
);
ctx.attachNewSectionElement = evaluate(definition(elements, 'attachNewSectionElement'), ctx);
const initial = shared.createBlankLandingPageSpec();
ctx.specRef.current = snapshot(initial);
const host = initial.blocks.find((b) => b.type === 'LeadForm');
const pos = {
  mode: 'section-element',
  blockId: host.id,
  anchor: { kind: 'submit', blockId: host.id },
  edge: 'after',
};
const child = {
  id: 'inserted_text',
  type: 'Benefits',
  enabled: true,
  headline: '',
  subheadline: 'Đoạn văn thử',
  items: [],
  positionMode: 'free',
  freeLayout: { x: 10, y: 10, width: 520, height: 96 },
};
ctx.sectionInsertCommitRef.current = pos;
ctx.pushHistory({ ...snapshot(initial), blocks: [...snapshot(initial.blocks), child] });
ctx.sectionInsertCommitRef.current = null;
assert.equal(ctx.historyRef.current.length, 1);
const stored = ctx.specRef.current;
assert.equal(stored.blocks.length, 7);
assert.equal(stored.blocks[6].freeLayout, undefined);
assert.equal(stored.blocks[6].sectionPlacement.sectionId, host.id);
const saved = shared.sanitizeLandingPagePersistSpec(snapshot(stored));
assert.deepEqual(saved.blocks[6].sectionPlacement, {
  sectionId: host.id,
  anchor: pos.anchor,
  edge: 'after',
});
const cloned = shared.cloneLandingPageSpecWithNewIds(saved),
  clonedHost = cloned.blocks.find((b) => b.type === 'LeadForm'),
  clonedChild = cloned.blocks.find((b) => b.sectionPlacement);
assert.notEqual(clonedHost.id, host.id);
assert.equal(clonedChild.sectionPlacement.sectionId, clonedHost.id);
assert.equal(clonedChild.sectionPlacement.anchor.blockId, clonedHost.id);
const tree = shared.normalizeLandingPageCanvas(saved);
assert.equal(tree.nodes[tree.rootId].children.length, 6);
assert.equal(tree.nodes[child.id].parentId, host.id + '__container');
assert(shared.sectionElementDeletionIds(saved.blocks, [host.id]).has(child.id));
assert.throws(
  () =>
    ctx.attachNewSectionElement(
      { ...initial, blocks: initial.blocks.filter((b) => b.id !== host.id) },
      stored,
      pos,
    ),
  /không còn/,
);
assert.equal(
  shared.sanitizeSectionPlacement({
    sectionId: 'x',
    anchor: { kind: 'field', blockId: 'x', field: '<script>' },
    edge: 'after',
  }),
  undefined,
);
console.log(
  'PASS native history one entry, nested flow ownership, persist/reload, clone IDs, layer tree, cascading delete, missing target, malformed anchor',
);
const chained = {
  id: 'inserted_button',
  type: 'CTA',
  enabled: true,
  ctaLabel: 'Tiếp tục',
  sectionPlacement: {
    sectionId: host.id,
    anchor: { kind: 'field', blockId: child.id, field: 'subheadline' },
    edge: 'after',
  },
};
const removed = shared.removeSectionElements([...saved.blocks, chained], [child.id]);
assert.equal(removed.find((b) => b.id === chained.id).sectionPlacement.anchor.kind, 'submit');
assert(!removed.some((b) => b.id === child.id));
const styled = {
  ...saved,
  meta: {
    ...saved.meta,
    inlineTextStyles: { [child.id + '::subheadline']: { fontSize: 21, color: '#334455' } },
  },
};
const styledCopy = shared.cloneLandingPageSpecWithNewIds(styled),
  newChild = styledCopy.blocks.find((b) => b.sectionPlacement);
assert.equal(styledCopy.meta.inlineTextStyles[newChild.id + '::subheadline'].fontSize, 21);
const dnd = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts'),
);
ctx.ignoreSidebarElementClick = evaluate(definition(dnd, 'ignoreSidebarElementClick'), ctx);
ctx.parseSidebarPresetPayload = evaluate(definition(dnd, 'parseSidebarPresetPayload'), ctx);
assert.equal(ctx.parseSidebarPresetPayload('{"kind":"unknown"}'), null);
assert.equal(ctx.parseSidebarPresetPayload('{"kind":"block-type","type":"Unknown"}'), null);
const sidebar = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
);
const panel = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx'),
);
ctx.RailIconHoverLabel = () => null;
ctx.cn = (...c) => c.filter(Boolean).join(' ');
let actions = 0,
  prevented = 0;
const event = {
  preventDefault() {
    prevented++;
  },
  stopPropagation() {},
};
const rail = evaluate(definition(sidebar, 'RailIcon'), ctx),
  tile = rail({
    label: 'Text',
    dataAttr: 'quick-text',
    onClick: () => actions++,
    draggablePayload: { kind: 'add-picker-open', picker: 'text' },
    children: null,
  }).props.children;
for (let i = 0; i < 3; i++) tile.props.onClick(event);
tile.props.onDoubleClick(event);
assert.equal(actions, 0);
assert.equal(prevented, 4);
const nav = rail({ label: 'Layers', dataAttr: 'layers', onClick: () => actions++, children: null })
  .props.children;
nav.props.onClick(event);
assert.equal(actions, 1);
const card = evaluate(
  definition(panel, 'ComponentCard'),
  ctx,
)({
  card: { id: 'text', kind: 'text', label: 'Văn bản' },
  onClick: () => actions++,
  draggable: true,
});
card.props.onClick(event);
card.props.onDoubleClick(event);
assert.equal(actions, 1);
console.log(
  'PASS deletion reanchors following content, clone text styles, invalid payloads, actual quick-rail/card callbacks suppress all clicks while navigation remains clickable',
);

// Native section duplication must preserve anchors into nested form fields.
const fieldChild = {
  ...saved.blocks.find((b) => b.sectionPlacement),
  sectionPlacement: {
    sectionId: host.id,
    anchor: { kind: 'field', blockId: host.id, field: 'fieldLabel:' + host.fields[0].id },
    edge: 'after',
  },
};
ctx.specRef.current = snapshot({
  ...initial,
  blocks: [...initial.blocks, fieldChild],
  meta: {
    ...initial.meta,
    inlineTextStyles: {
      [fieldChild.id + '::subheadline']: { fontSize: 23 },
      [host.id + '::fieldLabel:' + host.fields[0].id]: { fontSize: 19 },
    },
  },
});
ctx.duplicateBlock = shared.duplicateBlock;
ctx.sanitizeLandingPageDraftSpec = shared.sanitizeLandingPageDraftSpec;
evaluate(definition(builder, 'dupBlock'), ctx)(host.id);
const duplicateSpec = ctx.specRef.current;
const duplicateHost = duplicateSpec.blocks.find((b) => b.type === 'LeadForm' && b.id !== host.id);
const duplicateChild = duplicateSpec.blocks.find(
  (b) => b.sectionPlacement?.sectionId === duplicateHost.id,
);
assert.equal(duplicateChild.sectionPlacement.anchor.blockId, duplicateHost.id);
assert.equal(
  duplicateChild.sectionPlacement.anchor.field,
  'fieldLabel:' + duplicateHost.fields[0].id,
);
assert.equal(duplicateSpec.meta.inlineTextStyles[duplicateChild.id + '::subheadline'].fontSize, 23);
assert.equal(
  duplicateSpec.meta.inlineTextStyles[
    duplicateHost.id + '::fieldLabel:' + duplicateHost.fields[0].id
  ].fontSize,
  19,
);
console.log('PASS native duplicate section remaps nested form anchor and attached text styles');

// Regression: attachNewSectionElement must shift previous occupants, never the new block.
for (const row of [
  { label: 'left', count: 1, at: 0, old: 0, expectedOld: 1 },
  { label: 'right', count: 1, at: 1, old: 0, expectedOld: 0 },
  { label: 'gap', count: 2, at: 1, old: 1, expectedOld: 2 },
]) {
  const h = { ...snapshot(host), style: { lpContentColumns: row.count } };
  const old = {
    ...snapshot(child),
    id: 'old',
    sectionPlacement: {
      sectionId: h.id,
      anchor: { kind: 'end' },
      edge: 'after',
      columnIndex: row.old,
    },
  };
  const prev = { ...snapshot(initial), blocks: [h, old] };
  const pos = {
    mode: 'section-element',
    blockId: h.id,
    anchor: { kind: 'end' },
    edge: 'after',
    columnIndex: row.at,
    splitColumns: row.count + 1,
  };
  const next = ctx.attachNewSectionElement(
    prev,
    { ...prev, blocks: [...prev.blocks, snapshot(child)] },
    pos,
  );
  assert.equal(
    next.blocks[2].sectionPlacement.columnIndex,
    row.at,
    row.label + ': new block stays',
  );
  assert.equal(
    next.blocks[1].sectionPlacement.columnIndex,
    row.expectedOld,
    row.label + ': old shifts',
  );
  assert.equal(next.blocks[0].style.lpContentColumns, row.count + 1);
  assert.equal(prev.blocks[0].style.lpContentColumns, row.count, 'previous history immutable');
  const stored = shared.sanitizeLandingPagePersistSpec(snapshot(next));
  assert.equal(stored.blocks[2].sectionPlacement.columnIndex, row.at);
  assert.equal(stored.blocks[0].style.lpContentColumns, row.count + 1);
  ctx.specRef.current = prev;
  ctx.sectionInsertCommitRef.current = pos;
  ctx.pushHistory({ ...snapshot(prev), blocks: [...snapshot(prev.blocks), snapshot(child)] });
  ctx.sectionInsertCommitRef.current = null;
  const after = snapshot(ctx.specRef.current);
  ctx.undo();
  assert.equal(ctx.specRef.current.blocks.length, 2);
  assert.equal(ctx.specRef.current.blocks[0].style.lpContentColumns, row.count);
  ctx.redo();
  assert.equal(ctx.specRef.current.blocks[2].sectionPlacement.columnIndex, row.at);
  console.log('PASS attach + history + persist new column regression', row.label);
}
const beforeNative = { ...snapshot(initial), blocks: [snapshot(host)] };
const nativePos = {
  mode: 'section-element',
  blockId: host.id,
  anchor: { kind: 'end' },
  edge: 'after',
  columnIndex: 1,
  splitColumns: 3,
  nativeColumnIndices: [0, 1],
};
const afterNative = ctx.attachNewSectionElement(
  beforeNative,
  { ...beforeNative, blocks: [...beforeNative.blocks, snapshot(child)] },
  nativePos,
);
assert.deepEqual(snapshot(afterNative.blocks[0].style.lpNativeColumnIndices), [0, 2]);
assert.equal(afterNative.blocks[1].sectionPlacement.columnIndex, 1);
console.log('PASS existing native split preserves both groups across gap insertion');

const nativeBodyPos = { ...nativePos, splitColumns: undefined, columnCount: 2 };
const afterNativeBody = ctx.attachNewSectionElement(
  beforeNative,
  { ...beforeNative, blocks: [...beforeNative.blocks, snapshot(child)] },
  nativeBodyPos,
);
assert.equal(afterNativeBody.blocks[0].style.lpContentColumns, 2);
assert.deepEqual(snapshot(afterNativeBody.blocks[0].style.lpNativeColumnIndices), [0, 1]);
assert.equal(afterNativeBody.blocks[1].sectionPlacement.columnIndex, 1);
console.log(
  'PASS body drop initializes an existing two-column layout without adding or shifting columns',
);

const elementsSrc = require('node:fs').readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-section-elements.tsx'),
  'utf8',
);
const indicatorSrc = require('node:fs').readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-sidebar-drop-indicator.tsx'),
  'utf8',
);
assert(
  elementsSrc.includes('function moveNode') &&
    elementsSrc.includes('node.contains(parent)') &&
    elementsSrc.includes('HierarchyRequestError') &&
    elementsSrc.includes('observer?.disconnect()') &&
    elementsSrc.includes('hostOwnedInner'),
  'section element sync must skip cyclic insertBefore and pause the observer while moving nodes',
);
assert(
  indicatorSrc.includes('createPortal(') &&
    indicatorSrc.includes('document.body') &&
    !indicatorSrc.includes(',\n    canvas,') &&
    !indicatorSrc.includes(', canvas)'),
  'drop indicator must portal to document.body so it is not inserted into the React canvas tree',
);
console.log('PASS HierarchyRequestError guards for nested section slots and drop-indicator portal');
