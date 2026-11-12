#!/usr/bin/env node
const {
  assert,
  ts,
  vm,
  path,
  root,
  components,
  webRequire,
  shared,
  builder,
  parse,
  find,
  calls,
  definition,
  evaluate,
  method,
  jsxCallback,
  harness,
  snapshot,
} = require('./helpers/landing-page-source-harness.cjs');
const service = parse(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'));
const revision = parse(path.join(root, 'apps/api/src/landing-pages/landing-page-revision.ts'));
async function main() {
  const ctx = vm.createContext({ NotFoundException: Error });
  ctx.readLandingPageRevision = evaluate(definition(revision, 'readLandingPageRevision'), ctx);
  const restore = method(service, 'restorePageVersion', ctx);
  const row = { id: 'p', status: 'DRAFT', draftSpec: { meta: { clientRevision: 10 } } };
  const current = { ...shared.createEmptyLandingPageSpec(), meta: { clientRevision: 42 } };
  const target = {
    ...shared.createEmptyLandingPageSpec(),
    meta: { clientRevision: 5, lastAutosaveRequestId: 'old' },
  };
  const order = [],
    versions = [],
    updates = [],
    queries = [];
  const receiver = {
    assertPage: async (org, id) => {
      assert.equal(org, 'org');
      assert.equal(id, 'p');
      return row;
    },
    assertMutable() {},
    parseSpec: (value) => snapshot(value),
    serializePage: (value) => value,
    logger: { log() {} },
    prisma: {
      landingPageVersion: {
        findFirst: async (query) => {
          queries.push(query);
          return { snapshot: target };
        },
      },
      $transaction: (fn) =>
        fn({
          $queryRaw: async () => order.push('lock'),
          landingPage: {
            findFirst: async () => {
              order.push('read');
              return { ...row, draftSpec: current };
            },
            update: async (query) => {
              order.push('update');
              updates.push(query);
              return { ...row, ...query.data };
            },
          },
          landingPageVersion: {
            findFirst: async () => ({ version: 7 }),
            create: async (query) => {
              versions.push(query);
            },
          },
        }),
    },
  };
  const result = await restore.call(receiver, { organizationId: 'org', id: 'user' }, 'p', 3);
  assert.equal(
    result.clientRevision,
    43,
    'restore uses fresh locked revision, not pre-transaction revision',
  );
  assert.equal(result.draftSpec.meta.clientRevision, 43);
  assert.equal(result.draftSpec.meta.lastAutosaveRequestId, undefined);
  assert.equal(result.guardVersion, 8);
  assert.deepEqual(snapshot(versions[0].data.snapshot), snapshot(current));
  assert.deepEqual(order, ['lock', 'read', 'update']);
  assert.equal(queries[0].where.organizationId, 'org');
  assert.equal(Object.hasOwn(updates[0].data, 'publishedSpec'), false);
  assert.equal(shared.sanitizeLandingPagePersistSpec(result.draftSpec).meta.clientRevision, 43);
  const decide = evaluate(definition(revision, 'decideLandingPageAutosave'), ctx);
  assert.equal(
    decide({
      storedRevision: 43,
      storedRequestId: null,
      baseRevision: 42,
      incomingRevision: 43,
      requestId: 'other-tab',
    }).action,
    'reject',
  );
  console.log(
    'PASS RESTORE_BUMPS_CLIENT_REVISION / RESTORE_WRITES_BUMPED_SPEC / AUTOSAVE_STALE_STILL_PHASE1 / SANITIZE_PRESERVES_CLIENT_REVISION',
  );

  const toolbarFile = path.join(components, 'landing-page-builder-toolbar.tsx');
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(require('fs').readFileSync(toolbarFile, 'utf8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports: mod.exports, module: mod, require: webRequire },
  );
  const Toolbar = mod.exports.LandingPageBuilderToolbar;
  const React = webRequire('react');
  const hosts = find(
    builder,
    (node) =>
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(builder) === 'LandingPageBuilderToolbar',
  );
  assert.equal(hosts.length, 2);
  function buttons(ctx, host) {
    const props = {
      viewport: 'desktop',
      previewOn: false,
      onBack() {},
      onPreviewChange() {},
      onViewportChange() {},
      onSave() {},
      onPublish() {},
    };
    for (const attr of host.attributes.properties)
      if (['canUndo', 'canRedo', 'onUndo', 'onRedo'].includes(attr.name?.text))
        props[attr.name.text] = evaluate(attr.initializer.expression.getText(builder), ctx);
    const found = {};
    (function visit(element) {
      if (!element || typeof element !== 'object') return;
      if (typeof element.type === 'function') return visit(element.type(element.props));
      if (
        element.type === 'button' &&
        ['undo', 'redo'].includes(element.props['data-lp-toolbar-btn'])
      )
        found[element.props['data-lp-toolbar-btn']] = element.props;
      React.Children.forEach(element.props?.children, visit);
    })(Toolbar(props));
    return found;
  }
  const keyboard = find(
    builder,
    (node) =>
      ts.isCallExpression(node) &&
      node.expression.getText(builder) === 'useEffect' &&
      calls(node.arguments[0], 'addEventListener').some(
        (call) =>
          call.arguments[0]?.text === 'keydown' &&
          call.arguments[2]?.kind === ts.SyntaxKind.TrueKeyword,
      ),
  );
  assert.equal(keyboard.length, 1);
  for (const host of hosts)
    for (const mode of ['button', 'Ctrl', 'Cmd']) {
      const editor = harness();
      const before = snapshot(editor.specRef.current);
      let controls = buttons(editor, host);
      assert.equal(controls.undo.disabled, true);
      evaluate(
        jsxCallback(builder, 'LandingPageVersionHistoryPanel', 'onRestored'),
        editor,
      )(result);
      assert.equal(editor.revisionRef.current, 43);
      assert.equal(editor.ackedRevisionRef.current, 43);
      const restored = snapshot(editor.specRef.current);
      controls = buttons(editor, host);
      assert.equal(controls.undo.disabled, false);
      assert.equal(controls.redo.disabled, true);
      const events = new Map();
      editor.window.addEventListener = (name, fn) => events.set(name, fn);
      editor.window.removeEventListener = (name) => events.delete(name);
      editor.undoRef = { current: editor.undo };
      editor.redoRef = { current: editor.redo };
      const cleanup = evaluate(keyboard[0].arguments[0].getText(builder), editor)();
      const press = (shiftKey) => {
        let prevented = false,
          stopped = false;
        events.get('keydown')({
          key: 'z',
          code: 'KeyZ',
          shiftKey,
          ctrlKey: mode === 'Ctrl',
          metaKey: mode === 'Cmd',
          preventDefault() {
            prevented = true;
          },
          stopPropagation() {
            stopped = true;
          },
        });
        assert.equal(prevented && stopped, true);
      };
      if (mode === 'button') controls.undo.onClick();
      else press(false);
      assert.deepEqual(snapshot(editor.specRef.current), before);
      controls = buttons(editor, host);
      assert.equal(controls.undo.disabled, true);
      assert.equal(controls.redo.disabled, false);
      if (mode === 'button') controls.redo.onClick();
      else press(true);
      assert.deepEqual(snapshot(editor.specRef.current), restored);
      assert.equal(buttons(editor, host).redo.disabled, true);
      assert.equal(editor.ackedRevisionRef.current, 43);
      assert.equal(editor.revisionRef.current, 45);
      cleanup();
      assert.equal(events.has('keydown'), false);
    }
  console.log(
    'PASS CLIENT_SEEDS_REVISION_ON_RESTORE / fresh-page Undo and Redo buttons + keyboard parity on both toolbars (source execution, not browser E2E)',
  );
}
module.exports = { run: main };
if (require.main === module)
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
