#!/usr/bin/env node
const {
  assert,
  ts,
  path,
  components,
  builder,
  canvas,
  parse,
  find,
  definition,
  evaluate,
  jsxCallback,
  harness,
  state,
  snapshot,
  clock,
} = require('./helpers/landing-page-source-harness.cjs');
async function main() {
  const locked = harness(true);
  assert.equal(locked.guardSectionUnlocked('hero'), false);
  assert.match(locked.saveMsg, /mở khóa/);
  const attempts = [
    ['moveBlock', ['hero', 'up']],
    ['reorderBlockById', ['hero', 'other']],
    ['toggleBlockFreePosition', ['hero']],
    ['removeBlock', ['hero']],
    ['updateBlock', ['hero', { headline: 'blocked' }]],
    ['updateBlockFieldLive', ['hero', 'headline', 'blocked']],
    ['updateBlockFieldCommit', ['hero', 'headline', 'blocked']],
    ['patchInlineTextStyle', ['hero', 'headline', { color: '#123456' }]],
    [
      'commitBlockFreeLayout',
      ['hero', { positionMode: 'free', viewport: 'desktop', freeLayout: { x: 30, y: 20 } }],
    ],
  ];
  locked.removeBlocks = evaluate(definition(builder, 'removeBlocks'), locked);
  for (const [name, args] of attempts) {
    const before = state(locked);
    evaluate(definition(builder, name), locked)(...args);
    assert.deepEqual(state(locked), before, `${name} respects section lock`);
  }
  locked.spec = locked.specRef.current;
  evaluate(jsxCallback(builder, 'LandingPageAddComponentsPanel', 'onReorderBlocks'), locked)(0, 1);
  assert.equal(locked.historyRef.current.length, 0);
  locked.toggleBlockLock('hero');
  assert.equal(locked.specRef.current.blocks[0].locked, false);
  console.log('PASS LOCK_GUARD_HELPER / LOCK_GUARDS_STRUCTURAL / LOCK_GUARDS_EDIT');
  await require('./test-landing-page-element-visibility-lock.cjs').run();
  const reorderProps = find(
    canvas,
    (node) =>
      ts.isJsxAttribute(node) &&
      node.name.text === 'allowReorder' &&
      find(node, (child) => ts.isIdentifier(child) && child.text === 'sectionLocked').length > 0,
  );
  assert.equal(reorderProps.length, 1);
  const menu = parse(path.join(components, 'landing-page-canvas-context-menu.tsx'));
  for (const sectionLocked of [true, false]) {
    locked.allowReorder = true;
    locked.sectionLocked = sectionLocked;
    locked.menuBlockId = 'hero';
    assert.equal(
      evaluate(reorderProps[0].initializer.expression.getText(canvas), locked),
      !sectionLocked,
    );
    assert.equal(evaluate(definition(menu, 'editDisabled'), locked), sectionLocked);
  }
  console.log('PASS LOCK_UI_DISABLE');

  const drag = parse(path.join(components, 'landing-page-free-drag.tsx'));
  for (const name of [
    'FREE_LAYOUT_ABSOLUTE_BOUNDS',
    'FREE_LAYOUT_OFFSET_BOUNDS',
    'clampNumber',
    'clampAbsoluteFreeLayout',
    'patchAbsoluteFreeLayoutField',
    'isPlausibleFreeLayout',
  ])
    locked[name] = evaluate(definition(drag, name), locked);
  const bounds = locked.FREE_LAYOUT_ABSOLUTE_BOUNDS;
  assert.deepEqual(snapshot(bounds), { minPos: -40, maxPos: 2400, minSize: 1, maxSize: 2400 });
  const inputs = [
    { x: 24, y: -100, width: 2500, height: 200 },
    { x: 3000, y: 10, width: 100, height: 0 },
    { x: -40, y: 2400, width: 2400, height: 1 },
  ];
  for (const input of inputs) {
    const result = locked.clampAbsoluteFreeLayout(input);
    assert.equal(locked.isPlausibleFreeLayout(result), true);
    assert.ok(result.x >= bounds.minPos && result.x <= bounds.maxPos);
    assert.ok(result.height >= bounds.minSize && result.height <= bounds.maxSize);
    assert.equal(result.reserveHeight, result.height);
  }
  console.log('PASS SHARED_BOUNDS_CONSTANTS / CLAMP_HELPER_SAME_BOUNDS / CLAMP_KEEPS_PLAUSIBLE');
  const controls = find(
    builder,
    (node) =>
      ts.isJsxSelfClosingElement(node) &&
      node.attributes.properties.some(
        (attr) =>
          attr.name?.text === 'onChange' &&
          find(
            attr,
            (n) =>
              ts.isCallExpression(n) &&
              ts.isIdentifier(n.expression) &&
              n.expression.text === 'patchAbsoluteFreeLayoutField',
          ).length > 0,
      ),
  );
  assert.equal(controls.length, 1);
  const callback = controls[0].attributes.properties
    .find((attr) => attr.name?.text === 'onChange')
    .initializer.expression.getText(builder);
  const editor = harness();
  clock(editor);
  editor.selected = editor.specRef.current.blocks[0];
  editor.viewport = 'desktop';
  for (const name of [
    'FREE_LAYOUT_ABSOLUTE_BOUNDS',
    'clampNumber',
    'clampAbsoluteFreeLayout',
    'patchAbsoluteFreeLayoutField',
  ])
    editor[name] = evaluate(definition(drag, name), editor);
  editor.patchBlockFreeLayoutForViewport = evaluate(
    definition(builder, 'patchBlockFreeLayoutForViewport'),
    editor,
  );
  editor.resolvedSelectedFreeLayout = { x: 0, y: 0, width: 100, height: 100 };
  editor.key = 'height';
  evaluate(callback, editor)({ target: { value: '99999' } });
  assert.equal(editor.specRef.current.blocks[0].freeLayout.height, bounds.maxSize);
  assert.equal(editor.historyRef.current.length, 1);
  editor.undo();
  assert.equal(editor.specRef.current.blocks[0].positionMode, undefined);
  editor.redo();
  assert.equal(editor.specRef.current.blocks[0].freeLayout.height, bounds.maxSize);
  await editor.persist();
  assert.equal(editor.dirtyRef.current, false);
  console.log('PASS ADVANCED_POSITION_CLAMPS_BEFORE_UPDATE / UNDO_AUTOSAVE_PATH_INTACT');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
