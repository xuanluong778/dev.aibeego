import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import ts from 'typescript';
import {
  clearLocalLandingDraft,
  decideDraftRecovery,
  readLocalLandingDraft,
  writeLocalLandingDraft,
  type LocalLandingDraft,
} from '../apps/web/src/components/landing-pages/landing-page-draft-recovery.ts';

const local: LocalLandingDraft = {
  pageId: 'p',
  spec: { version: 1, blocks: [{ id: 'hero', type: 'Hero', headline: 'Unsaved local' }] } as never,
  baseRevision: 10,
  clientRevision: 11,
  savedAt: '2026-10-30T00:00:00.000Z',
};

for (const [serverRevision, expected] of [
  [10, 'restore-local'],
  [11, 'conflict'],
  [12, 'conflict'],
] as const) {
  assert.equal(decideDraftRecovery({ serverRevision, local }), expected);
}
// Even a local revision higher than the server must not bypass a changed base.
assert.equal(
  decideDraftRecovery({ serverRevision: 12, local: { ...local, clientRevision: 20 } }),
  'conflict',
);
for (const serverRevision of [10, 11, 12]) {
  assert.equal(
    decideDraftRecovery({ serverRevision, local: { ...local, baseRevision: 11 } }),
    'use-server',
  );
}
assert.equal(decideDraftRecovery({ serverRevision: 12, local: null }), 'use-server');

const storage = new Map<string, string>();
const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

// Execute callbacks extracted from the real builder AST, with only UI/I/O mocked.
// This tests load() itself rather than a copied implementation of its decisions.
const builder = ts.createSourceFile(
  'builder.tsx',
  readFileSync(
    new URL('../apps/web/src/components/landing-pages/landing-page-builder.tsx', import.meta.url),
    'utf8',
  ),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
function callbackSource(name: string): string {
  let result = '';
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(builder) === name &&
      node.initializer &&
      ts.isCallExpression(node.initializer)
    ) {
      result = node.initializer.arguments[0].getText(builder);
    }
    ts.forEachChild(node, visit);
  };
  visit(builder);
  assert.ok(result, `real ${name} callback exists`);
  return result;
}
function hasLocalWrite(node: ts.Node | undefined): boolean {
  if (!node) return false;
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'writeLocalLandingDraft'
  )
    return true;
  return ts.forEachChild(node, (child) => hasLocalWrite(child) || undefined) === true;
}
const localWriteEffects: string[] = [];
function collectLocalWriteEffects(node: ts.Node) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(builder) === 'useEffect' &&
    hasLocalWrite(node.arguments[0])
  ) {
    localWriteEffects.push(node.arguments[0].getText(builder));
  }
  ts.forEachChild(node, collectLocalWriteEffects);
}
collectLocalWriteEffects(builder);
assert.equal(localWriteEffects.length, 2, 'exercise local debounce and page-exit effects');

function compile(source: string, context: ReturnType<typeof createContext>) {
  return runInContext(
    ts.transpileModule(`(${source})`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    }).outputText,
    context,
  );
}
function harness(serverRevision: number, upgrade = false) {
  const server = {
    version: 1,
    blocks: [{ id: 'server', type: 'Hero', headline: 'Other writer' }],
    meta: { clientRevision: serverRevision },
  };
  const requests: unknown[] = [];
  const context = createContext({
    pageId: 'p',
    requests,
    pendingLocalDraft: null,
    dirtyRef: { current: false },
    revisionRef: { current: 0 },
    ackedRevisionRef: { current: 0 },
    inspectorSuppressOpenRef: { current: false },
    historyRef: { current: [] },
    futureRef: { current: [] },
    inlineHistStarted: { current: false },
    gestureHistStarted: { current: false },
    autosaveInflightRef: { current: false },
    autosaveQueuedRef: { current: false },
    saveConflictRef: { current: false },
    autosaveTimer: { current: null },
    setError() {},
    setHtmlNode() {},
    setInspectorPanelOpen() {},
    selectCanvas() {},
    setCanvasSelection() {},
    setHistoryNav() {},
    setResolvingConflict() {},
    setPage(value: unknown) {
      context.page = value;
    },
    setSpec(value: unknown) {
      context.spec = value;
    },
    setPendingLocalDraft(value: unknown) {
      context.pendingLocalDraft = value;
    },
    setSaveConflict(value: boolean) {
      context.saveConflict = value;
    },
    setSaveMsg(value: string) {
      context.saveMsg = value;
    },
    pendingAutosaveRef: { current: null },
    apiClient: async (...args: unknown[]) => {
      requests.push(args);
      return { draftSpec: server };
    },
    sanitizeLandingPagePersistSpec: (spec: unknown) => spec,
    healTextLayerCoordinates: (spec: unknown) => spec,
    specWithEditableHtmlSections: () => (upgrade ? { ...server, upgraded: true } : null),
    readClientRevision: () => serverRevision,
    readLocalLandingDraft,
    decideDraftRecovery,
    clearLocalLandingDraft,
    clearTimeout,
    requestAnimationFrame() {},
  });
  context.load = compile(callbackSource('load'), context);
  return context;
}

async function main() {
  try {
    for (const serverRevision of [11, 12]) {
      writeLocalLandingDraft(local);
      const snapshot = storage.get('lp-draft-recovery:p');
      const ctx = harness(serverRevision, true);
      await ctx.load();
      assert.equal(ctx.spec.blocks[0].headline, 'Other writer');
      assert.deepEqual(ctx.pendingLocalDraft, local);
      assert.equal(ctx.saveConflictRef.current, true);
      assert.equal(ctx.saveConflict, true);
      assert.equal(
        ctx.dirtyRef.current,
        false,
        'server upgrade must not overwrite recovery storage',
      );
      assert.equal(storage.get('lp-draft-recovery:p'), snapshot);
      assert.equal(ctx.requests.length, 1, 'load only fetches; it never saves');

      // Later canvas edits must not replace the pending recovery copy, whether
      // through persist(), the local debounce, or either page-exit event.
      ctx.dirtyRef.current = true;
      await compile(callbackSource('persist'), ctx)();
      assert.equal(ctx.requests.length, 1, 'conflict pauses autosave');
      const timers: Array<() => void> = [];
      const events = new Map<string, () => void>();
      ctx.window = {
        setTimeout: (fn: () => void) => timers.push(fn),
        clearTimeout() {},
        addEventListener: (name: string, fn: () => void) => events.set(name, fn),
        removeEventListener: (name: string) => events.delete(name),
      };
      ctx.writeLocalLandingDraft = writeLocalLandingDraft;
      ctx.specRef = { current: ctx.spec };
      for (const source of localWriteEffects) compile(source, ctx)();
      timers.forEach((fn) => fn());
      events.get('pagehide')!();
      events.get('beforeunload')!();
      assert.equal(
        storage.get('lp-draft-recovery:p'),
        snapshot,
        'pending local is preserved during edits and exit',
      );

      // Choosing the server through the existing resolution callback clears the
      // pending copy only after a successful load; fetch failures retain it.
      const resolve = compile(callbackSource('resolveSaveConflict'), ctx);
      const apiClient = ctx.apiClient;
      ctx.apiClient = async () => {
        throw new Error('offline');
      };
      await resolve();
      assert.equal(storage.get('lp-draft-recovery:p'), snapshot);
      assert.deepEqual(ctx.pendingLocalDraft, local);
      ctx.apiClient = apiClient;
      await resolve();
      assert.equal(ctx.pendingLocalDraft, null);
      assert.equal(ctx.saveConflictRef.current, false);
      assert.equal(readLocalLandingDraft('p'), null);
    }

    writeLocalLandingDraft(local);
    const restored = harness(10);
    await restored.load();
    assert.deepEqual(restored.spec, local.spec);
    assert.equal(restored.dirtyRef.current, true);
    assert.equal(restored.revisionRef.current, 11);
    assert.equal(restored.ackedRevisionRef.current, 10);

    writeLocalLandingDraft({ ...local, baseRevision: 11 });
    const acknowledged = harness(12);
    await acknowledged.load();
    assert.equal(acknowledged.pendingLocalDraft, null);
    assert.equal(acknowledged.spec.blocks[0].headline, 'Other writer');
    assert.equal(readLocalLandingDraft('p'), null);

    const invalidDrafts = [
      null,
      {},
      { ...local, pageId: 'other' },
      { ...local, spec: [] },
      { ...local, spec: {} },
      { ...local, spec: { version: 1, blocks: [null] } },
      { ...local, baseRevision: -1 },
      { ...local, baseRevision: 10.5 },
      { ...local, clientRevision: '11' },
      { ...local, clientRevision: null },
    ];
    for (const raw of [
      undefined,
      '{broken',
      ...invalidDrafts.map((value) => JSON.stringify(value)),
    ]) {
      storage.clear();
      if (raw !== undefined) storage.set('lp-draft-recovery:p', raw);
      assert.equal(readLocalLandingDraft('p'), null);
      const ctx = harness(12);
      await ctx.load();
      assert.equal(ctx.spec.blocks[0].headline, 'Other writer');
      assert.equal(ctx.pendingLocalDraft, null);
      assert.equal(ctx.saveConflictRef.current, false);
    }
    for (const invalid of [NaN, Infinity, -1, 10.5]) {
      assert.equal(
        decideDraftRecovery({ serverRevision: 10, local: { ...local, clientRevision: invalid } }),
        'use-server',
      );
    }
    console.log(
      'landing page draft recovery: PASS (source decisions, storage, builder load/resolution)',
    );
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
}
void main();
