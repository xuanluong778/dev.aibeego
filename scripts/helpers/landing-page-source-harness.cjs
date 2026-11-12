// Source extraction and mocked UI/I/O only; production algorithms stay in source.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const components = path.join(root, 'apps/web/src/components/landing-pages');
const webRequire = createRequire(path.join(root, 'apps/web/package.json'));
const shared = webRequire('@marketingspa/shared');
const { renderToStaticMarkup } = webRequire('react-dom/server');
const snapshot = (value) => JSON.parse(JSON.stringify(value));
function parse(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
const builder = parse(path.join(components, 'landing-page-builder.tsx'));
const canvas = parse(path.join(components, 'landing-page-canvas-ux.tsx'));
const actions = parse(path.join(components, 'landing-page-inspector-element-actions.tsx'));
const button = parse(path.join(components, 'landing-page-button-inspector.tsx'));
function find(source, predicate) {
  const results = [];
  (function visit(node) {
    if (predicate(node)) results.push(node);
    ts.forEachChild(node, visit);
  })(source);
  return results;
}
function definition(source, name) {
  const nodes = find(
    source,
    (node) =>
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name?.getText(source) === name,
  );
  assert.equal(nodes.length, 1, `one real definition of ${name}`);
  const node = nodes[0];
  return ts.isFunctionDeclaration(node)
    ? node.getText(source).replace(/^export\s+(?:default\s+)?/, '')
    : (ts.isCallExpression(node.initializer)
        ? node.initializer.arguments[0]
        : node.initializer
      ).getText(source);
}
function evaluate(text, ctx) {
  const js = ts.transpileModule(`const result = (${text});`, {
    fileName: 'callback.tsx',
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  return vm.runInContext(`(function () { ${js}\nreturn result; })()`, ctx);
}
function method(source, name, ctx) {
  const nodes = find(
    source,
    (node) => ts.isMethodDeclaration(node) && node.name.getText(source) === name,
  );
  assert.equal(nodes.length, 1, `one source method ${name}`);
  return evaluate(`({${nodes[0].getText(source)}})[${JSON.stringify(name)}]`, ctx);
}
function clock(ctx) {
  let id = 0;
  const pending = new Map();
  const schedule = (fn, delay) => {
    pending.set(++id, { fn, delay });
    return id;
  };
  const cancel = (key) => pending.delete(key);
  ctx.setTimeout = ctx.window.setTimeout = schedule;
  ctx.clearTimeout = ctx.window.clearTimeout = cancel;
  return {
    pending,
    async fire(delay) {
      for (const [key, timer] of [...pending])
        if (timer.delay === delay) {
          pending.delete(key);
          await timer.fn();
        }
    },
  };
}
function calls(source, name) {
  return find(
    source,
    (node) =>
      ts.isCallExpression(node) &&
      (ts.isIdentifier(node.expression)
        ? node.expression.text === name
        : ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === name),
  );
}
function jsxCallback(source, component, prop) {
  const hosts = find(
    source,
    (node) =>
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === component,
  );
  const attrs = hosts.flatMap((node) =>
    node.attributes.properties.filter((attr) => attr.name?.text === prop),
  );
  assert.equal(attrs.length, 1, `one ${component}.${prop}`);
  return attrs[0].initializer.expression.getText(source);
}
const recoverySource = parse(path.join(components, 'landing-page-draft-recovery.ts'));
const revisionSource = parse(
  path.join(root, 'apps/api/src/landing-pages/landing-page-revision.ts'),
);
const selectionSource = parse(path.join(components, 'landing-page-canvas-selection.ts'));
const fieldSource = parse(path.join(components, 'landing-page-inspector-design-tab.tsx'));
const rendererSource = parse(path.join(components, 'landing-page-renderer.tsx'));
const policyContext = vm.createContext({});
const decideSave = evaluate(definition(revisionSource, 'decideLandingPageAutosave'), policyContext);
const makeSpec = (locked, hidden) =>
  snapshot(
    shared.sanitizeLandingPagePersistSpec({
      ...shared.createEmptyLandingPageSpec(),
      blocks: [
        { id: 'hero', type: 'Hero', enabled: true, locked, headline: 'Headline', ctaLabel: 'CTA' },
      ],
      meta: {
        clientRevision: 10,
        ...(hidden ? { elementHidden: { 'hero::headline': true } } : {}),
      },
    }),
  );

function harness(locked = false, hidden = false) {
  let stored = makeSpec(locked, hidden);
  const ctx = vm.createContext({
    require: webRequire,
    exports: {},
    pageId: 'p',
    page: { name: 'Page', status: 'DRAFT' },
    specRef: { current: snapshot(stored) },
    sectionInsertCommitRef: { current: null },
    historyRef: { current: [] },
    futureRef: { current: [] },
    revisionRef: { current: 10 },
    ackedRevisionRef: { current: 10 },
    dirtyRef: { current: false },
    inlineHistStarted: { current: false },
    gestureHistStarted: { current: false },
    autosaveInflightRef: { current: false },
    autosaveQueuedRef: { current: false },
    pendingAutosaveRef: { current: null },
    pendingCanvasCloneRef: { current: null },
    crypto: require('node:crypto').webcrypto,
    autosaveTimer: { current: null },
    persistWaitersRef: { current: [] },
    saveConflictRef: { current: false },
    inspectorSuppressOpenRef: { current: false },
    historyNav: { undo: false, redo: false },
    requests: [],
    selectedElement: 'headline',
    primaryTarget: { field: 'headline' },
    field: 'headline',
    blockId: 'hero',
    ...shared,
    AbortController,
    DOMException,
    Error,
    setTimeout,
    clearTimeout,
    window: { setTimeout, clearTimeout },
    document: { activeElement: null },
    requestAnimationFrame() {},
    setSaveMsg(value) {
      ctx.saveMsg = value;
    },
    setHistoryNav(value) {
      ctx.historyNav = value;
    },
    setSpec(value) {
      ctx.spec = value;
    },
    setPage(value) {
      ctx.page = value;
    },
    setError() {},
    setHtmlNode() {},
    setInspectorPanelOpen() {},
    setCanvasSelection() {},
    selectCanvas() {},
    setSaving() {},
    setPendingLocalDraft() {},
    setSaveConflict() {},
    clearLocalLandingDraft() {},
    writeLocalLandingDraft() {},
    readLocalLandingDraft: () => null,
    healTextLayerCoordinates: (spec) => spec,
    specWithEditableHtmlSections: () => null,
    apiClient: async (url, options) => {
      ctx.requests.push({ url, options });
      if (!options || !options.method || options.method==='GET') return { draftSpec: snapshot(stored) };
      const body = JSON.parse(options.body);
      const decision = decideSave({
        storedRevision: stored.meta.clientRevision,
        storedRequestId: null,
        baseRevision: body.baseRevision,
        incomingRevision: body.clientRevision,
        requestId: body.requestId,
      });
      if (decision.action === 'reject')
        return {
          rejected: true,
          reason: 'STALE_REVISION',
          clientRevision: decision.storedRevision,
        };
      if (decision.action === 'accept') stored = snapshot(body.draftSpec);
      return { updatedAt: '2026-10-30T00:00:00Z', clientRevision: decision.nextRevision, requestId: body.requestId };
    },
  });
  for (const name of [
    'cloneSpec',
    'readClientRevision',
    'isSectionLocked',
    'guardSectionUnlocked',
    'elementStyleKey',
    'pushHistory',
    'moveBlock',
    'reorderBlockById',
    'toggleElementHidden',
    'hideCanvasElements',
    'updateBlock',
    'toggleBlockLock',
    'blurInspectorEditors',
    'undo',
    'redo',
    'persist',
    'load',
  ])
    ctx[name] = evaluate(definition(builder, name), ctx);
  ctx.createLandingPageAutosaveRequestId = evaluate(definition(parse(path.join(components, 'landing-page-autosave-request.ts')), 'createLandingPageAutosaveRequestId'), ctx);
  ctx.isLocalLandingDraft = evaluate(definition(recoverySource, 'isLocalLandingDraft'), ctx);
  ctx.landingDraftContentKey = evaluate(definition(recoverySource, 'landingDraftContentKey'), ctx);
  ctx.landingDraftsHaveSameContent = evaluate(definition(recoverySource, 'landingDraftsHaveSameContent'), ctx);
  ctx.decideDraftRecovery = evaluate(definition(recoverySource, 'decideDraftRecovery'), ctx);
  ctx.isSectionLevelElement = evaluate(definition(selectionSource, 'isSectionLevelElement'), ctx);
  ctx.inspectorTextFieldKey = evaluate(definition(fieldSource, 'inspectorTextFieldKey'), ctx);
  ctx.buildElementHiddenCss = evaluate(definition(rendererSource, 'buildElementHiddenCss'), ctx);
  ctx.canvasActionRef = {
    current: {
      toggleElementHidden: ctx.toggleElementHidden,
      reorderBlockById: ctx.reorderBlockById,
      deleteToolbarTarget: ctx.deleteToolbarTarget || (() => {}),
      hideCanvasElements: ctx.hideCanvasElements || (() => {}),
      deselectCanvas: ctx.deselectCanvas || (() => {}),
      removeBlocks: ctx.removeBlocks || (() => {}),
    },
  };
  return ctx;
}
function state(ctx) {
  return snapshot({
    spec: ctx.specRef.current,
    history: ctx.historyRef.current,
    future: ctx.futureRef.current,
    revision: ctx.revisionRef.current,
    acked: ctx.ackedRevisionRef.current,
    dirty: ctx.dirtyRef.current,
    nav: ctx.historyNav,
    inline: ctx.inlineHistStarted.current,
    gesture: ctx.gestureHistStarted.current,
  });
}

module.exports = {
  assert,
  fs,
  path,
  vm,
  ts,
  root,
  components,
  webRequire,
  shared,
  renderToStaticMarkup,
  snapshot,
  parse,
  find,
  definition,
  evaluate,
  method,
  clock,
  calls,
  jsxCallback,
  builder,
  canvas,
  actions,
  button,
  recoverySource,
  revisionSource,
  selectionSource,
  fieldSource,
  rendererSource,
  makeSpec,
  harness,
  state,
};
