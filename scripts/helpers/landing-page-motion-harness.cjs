// Real source algorithms, mock only React state and successful API/database I/O.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const { createRequire } = require('node:module'),
  ts = require('typescript');
const root = path.resolve(__dirname, '../..'),
  webRequire = createRequire(path.join(root, 'apps/web/package.json'));
const shared = webRequire('@marketingspa/shared');
const snapshot = (value) => JSON.parse(JSON.stringify(value));
const parse = (file) =>
  ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
function find(source, predicate) {
  const out = [];
  function visit(node) {
    if (predicate(node)) out.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return out;
}
function definition(source, name) {
  const nodes = find(
    source,
    (node) =>
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name?.getText(source) === name,
  );
  assert.equal(nodes.length, 1, `one real definition: ${name}`);
  const node = nodes[0];
  return ts.isFunctionDeclaration(node)
    ? node.getText(source).replace(/^export\s+/, '')
    : (ts.isCallExpression(node.initializer)
        ? node.initializer.arguments[0]
        : node.initializer
      ).getText(source);
}
function evaluate(text, ctx) {
  const js = ts.transpileModule(`const result=(${text});`, {
    fileName: 'test.tsx',
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  return vm.runInContext(`(function(){${js};return result;})()`, ctx);
}
function method(source, name, ctx) {
  const nodes = find(
    source,
    (node) => ts.isMethodDeclaration(node) && node.name.getText(source) === name,
  );
  assert.equal(nodes.length, 1);
  return evaluate(`({${nodes[0].getText(source)}})[${JSON.stringify(name)}]`, ctx);
}
const builder = parse(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
);
function harness(locked = false) {
  const spec = shared.sanitizeLandingPagePersistSpec({
    ...shared.createEmptyLandingPageSpec(),
    blocks: [
      { id: 'hero', type: 'Hero', enabled: true, locked, headline: 'Title', ctaLabel: 'CTA' },
    ],
    meta: { clientRevision: 10 },
  });
  const ctx = vm.createContext({
    ...shared,
    require: webRequire,
    Date,
    Error,
    DOMException,
    AbortController,
    crypto: require('node:crypto').webcrypto,
    setTimeout,
    clearTimeout,
    window: { setTimeout, clearTimeout },
    document: { activeElement: null },
    pageId: 'motion-qa',
    page: { name: 'Motion QA' },
    requests: [],
    setSpec() {},
    setHtmlNode() {},
    setHistoryNav() {},
    setSaveMsg() {},
    setSaving() {},
    setSaveConflict() {},
    readLocalLandingDraft: () => null,
    clearLocalLandingDraft() {},
    writeLocalLandingDraft() {},
  });
  for (const [name, value] of Object.entries({
    specRef: spec,
    historyRef: [],
    futureRef: [],
    revisionRef: 10,
    ackedRevisionRef: 10,
    dirtyRef: false,
    inlineHistStarted: false,
    gestureHistStarted: false,
    autosaveInflightRef: false,
    autosaveQueuedRef: false,
    pendingAutosaveRef: null,
    autosaveTimer: null,
    persistWaitersRef: [],
    saveConflictRef: false,
    pendingCanvasCloneRef: null,
    sectionInsertCommitRef: null,
  }))
    ctx[name] = { current: value };
  ctx.apiClient = async (url, options) => {
    ctx.requests.push({ url, options });
    const body = JSON.parse(options.body);
    return {
      clientRevision: body.clientRevision,
      requestId: body.requestId,
      updatedAt: '2026-11-10T00:00:00Z',
    };
  };
  for (const name of [
    'cloneSpec',
    'readClientRevision',
    'blurInspectorEditors',
    'isSectionLocked',
    'guardSectionUnlocked',
    'pushHistory',
    'updateBlock',
    'undo',
    'redo',
    'persist',
  ])
    ctx[name] = evaluate(definition(builder, name), ctx);
  ctx.createLandingPageAutosaveRequestId = evaluate(
    definition(
      parse(
        path.join(root, 'apps/web/src/components/landing-pages/landing-page-autosave-request.ts'),
      ),
      'createLandingPageAutosaveRequestId',
    ),
    ctx,
  );
  return ctx;
}
const state = (ctx) =>
  snapshot({
    spec: ctx.specRef.current,
    history: ctx.historyRef.current,
    future: ctx.futureRef.current,
    revision: ctx.revisionRef.current,
    dirty: ctx.dirtyRef.current,
  });
module.exports = {
  assert,
  shared,
  snapshot,
  harness,
  state,
  evaluate,
  definition,
  builder,
  parse,
  path,
  root,
  method,
  vm,
};
