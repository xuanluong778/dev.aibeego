#!/usr/bin/env node
const {
  assert,
  ts,
  vm,
  path,
  root,
  components,
  builder,
  canvas,
  shared,
  parse,
  find,
  calls,
  definition,
  evaluate,
  harness,
  clock,
  snapshot,
} = require('./helpers/landing-page-source-harness.cjs');
async function main() {
  const ctx = harness();
  clock(ctx);
  ctx.publishing = false;
  ctx.setPublishing = (value) => {
    ctx.publishing = value;
  };
  ctx.setPublishPublicPath = (value) => {
    ctx.publicPath = value;
  };
  ctx.revalidatePublicLandingPage = async () => true;
  const publish = evaluate(definition(builder, 'publish'), ctx);
  const trace = [],
    bodies = [];
  let release;
  ctx.apiClient = async (url, options) => {
    trace.push(url);
    const body = JSON.parse(options.body);
    bodies.push(body);
    if (url.endsWith('/publish')) {
      assert.equal(ctx.dirtyRef.current, false);
      assert.equal(ctx.autosaveInflightRef.current, false);
      assert.equal(body.clientRevision, 12);
      return { slug: 'fixture', status: 'PUBLISHED' };
    }
    if (trace.length === 1)
      await new Promise((resolve) => {
        release = resolve;
      });
    return { requestId: body.requestId, clientRevision: body.clientRevision, updatedAt: '2026-10-30T00:00:00Z' };
  };
  ctx.toggleElementHidden('hero', 'headline');
  const inflight = ctx.persist();
  ctx.updateBlock('hero', { headline: 'Typed while saving' });
  const publishing = publish();
  assert.equal(trace.length, 1, 'publish waits for the existing autosave');
  release();
  await inflight;
  assert.equal(await publishing, 'fixture');
  assert.deepEqual(trace, [
    '/landing-pages/p/autosave',
    '/landing-pages/p/autosave',
    '/landing-pages/p/publish',
  ]);
  assert.equal(bodies[1].draftSpec.blocks[0].headline, 'Typed while saving');
  console.log('PASS PUBLISH_LATEST_SPEC / AUTOSAVE_PUBLISH_RACE');

  for (const alreadyConflicted of [true, false]) {
    const editor = harness();
    clock(editor);
    editor.publishing = false;
    editor.setPublishing = () => {};
    editor.setPublishPublicPath = () => {};
    editor.saveConflictRef.current = alreadyConflicted;
    const paths = [];
    editor.apiClient = async (url) => {
      paths.push(url);
      return { rejected: true, reason: 'STALE_REVISION', clientRevision: 99 };
    };
    assert.equal(await evaluate(definition(builder, 'publish'), editor)(), null);
    assert.equal(
      paths.some((url) => url.endsWith('/publish')),
      false,
    );
    assert.equal(editor.saveConflictRef.current, true);
  }

  const live = harness();
  const start = snapshot(live.specRef.current);
  live.specRef.current.blocks[0].headline = 'Live ref newer than closure';
  for (const name of ['setTheme', 'applyAiToBlockField'])
    live[name] = evaluate(definition(builder, name), live);
  const theme = Object.keys(shared.LANDING_PAGE_THEME_PRESETS).at(-1);
  live.setTheme(theme);
  assert.equal(live.specRef.current.blocks[0].headline, 'Live ref newer than closure');
  assert.equal(live.specRef.current.theme, theme);
  const themed = snapshot(live.specRef.current);
  live.applyAiToBlockField('hero', 'headline', 'AI text');
  assert.equal(live.specRef.current.blocks[0].headline, 'AI text');
  live.undo();
  assert.deepEqual(snapshot(live.specRef.current), themed);
  live.redo();
  assert.equal(live.specRef.current.blocks[0].headline, 'AI text');
  assert.notDeepEqual(snapshot(live.specRef.current), start);
  console.log('PASS STALE_STATE_ACTIONS / UNDO_REDO');

  const design = parse(path.join(components, 'landing-page-inspector-design-tab.tsx'));
  const cssCtx = harness();
  const timers = clock(cssCtx);
  const commits = [];
  cssCtx.debounceRef = { current: null };
  cssCtx.commitPatch = (value) => commits.push(snapshot(value));
  cssCtx.draftClass = 'hero';
  cssCtx.draftCss = 'color: red';
  cssCtx.scheduleCommit = evaluate(definition(design, 'scheduleCommit'), cssCtx);
  cssCtx.scheduleCommit({ customCss: 'color: blue' });
  cssCtx.scheduleCommit({ customCss: 'color: red' });
  assert.equal(commits.length, 0);
  assert.equal(timers.pending.size, 1);
  await timers.fire(450);
  assert.deepEqual(commits, [{ customCss: 'color: red' }]);
  const textarea = find(
    design,
    (node) =>
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.attributes.properties.some(
        (attr) => attr.name?.text === 'data-lp-design-custom-css-textarea',
      ),
  )[0];
  const blur = textarea.attributes.properties.find((attr) => attr.name?.text === 'onBlur');
  cssCtx.scheduleCommit({ customCss: 'superseded' });
  evaluate(blur.initializer.expression.getText(design), cssCtx)();
  assert.equal(timers.pending.size, 0);
  assert.deepEqual(commits.at(-1), { className: 'hero', customCss: 'color: red' });
  console.log('PASS CUSTOM_CSS_SAVE');

  const textToolbar = find(
    canvas,
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === 'TextEditToolbar',
  )[0];
  const positionHooks = find(
    textToolbar,
    (node) =>
      ts.isCallExpression(node) &&
      node.expression.getText(canvas) === 'useLayoutEffect' &&
      calls(node.arguments[0], 'setPos').length > 0,
  );
  assert.equal(positionHooks.length, 1);
  for (const width of [390, 1200]) {
    const position = vm.createContext({
      anchorEl: { getBoundingClientRect: () => ({ left: 50, top: 120, bottom: 150, width: 100 }) },
      barRef: { current: { offsetHeight: 36, offsetWidth: 200 } },
      document: { documentElement: { getAttribute: () => null } },
      window: {
        innerWidth: width,
        innerHeight: 800,
        addEventListener() {},
        removeEventListener() {},
      },
      setPos(value) {
        position.pos = value;
      },
    });
    evaluate(positionHooks[0].arguments[0].getText(canvas), position)();
    assert.equal(position.pos.placement, width === 390 ? 'below' : 'above');
    assert.ok(position.pos.top >= 8 && position.pos.top <= 756);
  }
  console.log('PASS MOBILE_TOOLBAR (source positioning callback; no browser layout claim)');

  const selection = parse(path.join(components, 'landing-page-canvas-selection.ts'));
  const selectionCtx = vm.createContext({});
  for (const statement of selection.statements)
    if (ts.isFunctionDeclaration(statement))
      selectionCtx[statement.name.text] = evaluate(
        definition(selection, statement.name.text),
        selectionCtx,
      );
  let selected = selectionCtx.applySelectionClick([], null, { blockId: 'a', element: 'section' });
  selected = selectionCtx.applySelectionClick(
    selected.ids,
    selected.primaryId,
    { blockId: 'b', element: 'section' },
    { shiftKey: true },
  );
  assert.equal(selected.ids.length, 2);
  selected = selectionCtx.applySelectionClick(
    selected.ids,
    selected.primaryId,
    { blockId: 'b', element: 'section' },
    { shiftKey: true },
  );
  assert.deepEqual(snapshot(selected.ids), ['a::section']);
  console.log('PASS MULTISELECT');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
