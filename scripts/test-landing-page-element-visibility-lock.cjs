#!/usr/bin/env node
// node scripts/test-landing-page-element-visibility-lock.cjs
// Execute real builder callbacks and JSX controls; only React state and API I/O
// are mocked. No requests are sent to a running service.
const {
  assert,
  ts,
  builder,
  canvas,
  actions,
  button,
  find,
  definition,
  evaluate,
  makeSpec,
  harness,
  state,
  renderToStaticMarkup,
} = require('./helpers/landing-page-source-harness.cjs');
function syncUi(ctx) {
  ctx.selected = ctx.block = ctx.specRef.current.blocks[0];
  const host = find(
    canvas,
    (node) =>
      ts.isJsxSelfClosingElement(node) && node.tagName.getText(canvas) === 'TextEditToolbar',
  );
  assert.equal(host.length, 1);
  const sectionLockProp = host[0].attributes.properties.find(
    (prop) => prop.name?.text === 'sectionLocked',
  );
  ctx.handlers = { isBlockLocked: ctx.isSectionLocked };
  ctx.sectionLocked = evaluate(sectionLockProp.initializer.expression.getText(canvas), ctx);
  ctx.isHidden = ctx.isTextHidden = !!ctx.specRef.current.meta?.elementHidden?.['hero::headline'];
  ctx.cn = (...parts) => parts.filter(Boolean).join(' ');
  ctx.menuItem = '';
  ctx.setMoreOpen = () => {};
  ctx.onToggleHidden = () => ctx.toggleElementHidden('hero', 'headline');
  ctx.stopAll = evaluate(definition(canvas, 'stopAll'), ctx);
  ctx.run = evaluate(definition(canvas, 'run'), ctx);
  ctx.ActionBtn = evaluate(definition(actions, 'ActionBtn'), ctx);
}
const calls = find(
  builder,
  (node) =>
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'toggleElementHidden',
);
const callbacks = calls.map((call) => {
  let parent = call.parent;
  while (parent && !ts.isArrowFunction(parent)) parent = parent.parent;
  assert.ok(parent, 'every visibility call has a testable callback');
  return parent.getText(builder);
});
assert.equal(callbacks.length, 4, 'audit every builder visibility call site');
function jsxButton(source, matches) {
  const nodes = find(
    source,
    (node) =>
      (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) &&
      matches(node.openingElement || node),
  );
  assert.equal(nodes.length, 1, 'one matching visibility control');
  return nodes[0].getText(source);
}
const hasProp = (node, name) => node.attributes.properties.some((prop) => prop.name?.text === name);
const controls = [
  jsxButton(button, (node) => hasProp(node, 'data-lp-button-hide')),
  jsxButton(canvas, (node) => hasProp(node, 'data-lp-text-more-hide')),
  jsxButton(actions, (node) =>
    node.attributes.properties.some(
      (prop) => prop.name?.text === 'dataLp' && prop.initializer?.text === 'toggle-hidden',
    ),
  ),
  jsxButton(
    builder,
    (node) =>
      node.tagName.getText(builder) === 'button' &&
      find(
        node,
        (n) =>
          ts.isCallExpression(n) &&
          ts.isPropertyAccessExpression(n.expression) &&
          n.expression.name.text === 'toggleElementHidden',
      ).length > 0,
  ),
];
function renderButton(text, ctx) {
  const element = evaluate(text, ctx);
  const native = typeof element.type === 'function' ? element.type(element.props) : element;
  assert.equal(native.type, 'button');
  const html = renderToStaticMarkup(element);
  assert.equal(
    html.includes('disabled=""'),
    !!native.props.disabled,
    'rendered disabled state matches source props',
  );
  return native.props;
}

async function main() {
  for (const hidden of [false, true]) {
    for (const callback of [definition(builder, 'toggleElementHidden'), ...callbacks]) {
      const ctx = harness(true, hidden);
      // A blocked action must also preserve an existing redo branch.
      ctx.futureRef.current.push(makeSpec(false, !hidden));
      syncUi(ctx);
      const before = state(ctx);
      evaluate(callback, ctx)('hero', 'headline');
      assert.deepEqual(
        state(ctx),
        before,
        'locked visibility leaves draft/history/revision untouched',
      );
      assert.match(ctx.saveMsg, /mở khóa/);
    }
    for (const control of controls) {
      const ctx = harness(true, hidden);
      syncUi(ctx);
      const props = renderButton(control, ctx);
      assert.equal(props.disabled, true, 'all Hide and Show buttons disabled when section locked');
      const before = state(ctx);
      props.onClick({ preventDefault() {}, stopPropagation() {} });
      assert.deepEqual(state(ctx), before, 'even a forced callback cannot bypass the guard');
      assert.match(ctx.saveMsg, /mở khóa/);
    }
  }
  for (const control of controls) {
    const ctx = harness();
    syncUi(ctx);
    let props = renderButton(control, ctx);
    assert.equal(!!props.disabled, false);
    props.onClick({ preventDefault() {}, stopPropagation() {} });
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::headline'], true);
    assert.equal(ctx.historyRef.current.length, 1);
    assert.equal(ctx.revisionRef.current, 11);
    ctx.undo();
    assert.equal(!!ctx.specRef.current.meta?.elementHidden?.['hero::headline'], false);
    ctx.redo();
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::headline'], true);
    await ctx.persist();
    assert.equal(ctx.dirtyRef.current, false);
    await ctx.load();
    ctx.specRef.current = ctx.spec;
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::headline'], true);
    assert.match(ctx.buildElementHiddenCss(ctx.specRef.current), /display:none!important/);
    syncUi(ctx);
    props = renderButton(control, ctx);
    props.onClick({ preventDefault() {}, stopPropagation() {} });
    assert.equal(!!ctx.specRef.current.meta?.elementHidden?.['hero::headline'], false);
    ctx.undo();
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::headline'], true);
    ctx.redo();
    assert.equal(!!ctx.specRef.current.meta?.elementHidden?.['hero::headline'], false);
    await ctx.persist();
    await ctx.load();
    ctx.specRef.current = ctx.spec;
    assert.equal(!!ctx.specRef.current.meta?.elementHidden?.['hero::headline'], false);
    assert.equal(ctx.buildElementHiddenCss(ctx.specRef.current), null);
  }
  for (const callback of callbacks) {
    const ctx = harness();
    syncUi(ctx);
    evaluate(callback, ctx)('hero', 'headline');
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::headline'], true);
    evaluate(callback, ctx)('hero', 'headline');
    assert.equal(!!ctx.specRef.current.meta.elementHidden['hero::headline'], false);
  }
  const elementLocked = harness();
  elementLocked.specRef.current.meta.elementLocked = { 'hero::headline': true };
  syncUi(elementLocked);
  assert.equal(
    renderButton(controls[1], elementLocked).disabled,
    false,
    'visibility disable follows the section lock independently of element lock',
  );
  const locked = harness(true);
  const beforeDelete = state(locked);
  locked.hideCanvasElements([{ blockId: 'hero', element: 'headline', field: 'headline' }]);
  assert.deepEqual(state(locked), beforeDelete, 'existing Delete path is guarded too');
  locked.toggleBlockLock('hero');
  assert.equal(locked.specRef.current.blocks[0].locked, false, 'section can still be unlocked');
  locked.toggleElementHidden('hero', 'headline');
  assert.equal(locked.specRef.current.meta.elementHidden['hero::headline'], true);
  console.log(
    'PASS: locked Hide/Show and all 4 call sites/controls preserve state and show unlock message; unlocked Hide/Show, Undo/Redo, real persist/load callbacks, renderer CSS and section unlock. API I/O mocked.',
  );
}
module.exports = { run: main };
if (require.main === module)
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
