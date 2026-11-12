#!/usr/bin/env node
// Run real callbacks with deterministic timers and mocked transport, never a live API.
const {
  assert,
  vm,
  path,
  ts,
  root,
  builder,
  canvas,
  parse,
  find,
  calls,
  definition,
  evaluate,
  harness,
  clock,
  snapshot,
} = require('./helpers/landing-page-source-harness.cjs');
const ack = (revision, requestId) => ({ requestId, clientRevision: revision, updatedAt: '2026-10-30T00:00:00Z' });
async function main() {
  const seeded = harness();
  seeded.apiClient = async () => ({
    draftSpec: { ...seeded.specRef.current, meta: { clientRevision: 42 } },
  });
  await seeded.load();
  assert.equal(seeded.revisionRef.current, 42);
  assert.equal(seeded.ackedRevisionRef.current, 42);
  seeded.pushHistory({ ...seeded.spec, seo: { ...seeded.spec.seo, title: 'Latest edit' } });
  assert.equal(seeded.revisionRef.current, 43);
  console.log('PASS SEED_REVISION_ON_LOAD');

  const stale = harness();
  const staleClock = clock(stale);
  stale.toggleElementHidden('hero', 'headline');
  stale.apiClient = async () => ({ rejected: true, reason: 'STALE_REVISION', ...ack(99) });
  const writes = [];
  stale.writeLocalLandingDraft = (draft) => writes.push(snapshot(draft));
  await stale.persist(undefined, undefined, { manual: true });
  assert.equal(stale.revisionRef.current, 11);
  assert.equal(stale.ackedRevisionRef.current, 10);
  assert.equal(stale.saveConflictRef.current, true);
  assert.equal(stale.dirtyRef.current, true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].spec.meta.elementHidden['hero::headline'], true);
  stale.apiClient = () => {
    throw new Error('conflict must stop all writes');
  };
  await stale.persist();
  const autosaveEffects = find(
    builder,
    (node) =>
      ts.isCallExpression(node) &&
      node.expression.getText(builder) === 'useEffect' &&
      calls(node.arguments[0], 'persist').length > 0,
  );
  assert.equal(autosaveEffects.length, 1);
  evaluate(autosaveEffects[0].arguments[0].getText(builder), stale)();
  assert.equal(staleClock.pending.size, 0);
  console.log(
    'PASS STALE_NEVER_FORCE_OVERWRITES / CONFLICT_PAUSES_AUTOSAVE_NO_LOOP / UNIT_STALE_NEVER_ADVANCES_OR_REFLUSHES',
  );

  for (const manual of [false, true]) {
    const ctx = harness();
    clock(ctx);
    const saving = [];
    const bodies = [];
    ctx.setSaving = (value) => saving.push(value);
    ctx.toggleElementHidden('hero', 'headline');
    ctx.apiClient = async (_url, options) => {
      bodies.push(JSON.parse(options.body));
      return ack(11, bodies.at(-1).requestId);
    };
    await ctx.persist(undefined, undefined, { manual });
    assert.deepEqual(saving, manual ? [true, false] : []);
    assert.equal(ctx.dirtyRef.current, false);
    assert.equal(ctx.ackedRevisionRef.current, 11);
    assert.equal(bodies[0].draftSpec.meta.elementHidden['hero::headline'], true);
  }
  // Exercise the real Save button callback too; flush must precede saving the live ref.
  const ctx = harness();
  clock(ctx);
  const hosts = find(
    builder,
    (node) =>
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(builder) === 'LandingPageBuilderToolbar',
  );
  for (const host of hosts) {
    const attr = host.attributes.properties.find((prop) => prop.name?.text === 'onSave');
    let flushed = false,
      saved = false;
    ctx.flushCanvasEdit = () => {
      flushed = true;
    };
    ctx.persist = (spec, name, opts) => {
      assert.equal(flushed, true);
      assert.equal(spec, ctx.specRef.current);
      assert.equal(opts.manual, true);
      saved = true;
    };
    evaluate(attr.initializer.expression.getText(builder), ctx)();
    assert.equal(saved, true);
  }
  console.log('PASS AUTOSAVE_NO_BUTTON_LOCK');

  const queued = harness();
  const timer = clock(queued);
  queued.toggleElementHidden('hero', 'headline');
  queued.apiClient = async (_url, opts) => {
    queued.toggleElementHidden('hero', 'ctaLabel');
    return ack(11, JSON.parse(opts.body).requestId);
  };
  await queued.persist();
  assert.equal(queued.dirtyRef.current, true);
  assert.equal(queued.ackedRevisionRef.current, 11);
  assert.deepEqual(
    [...timer.pending.values()].map((t) => t.delay),
    [500],
  );
  let release;
  const timed = harness();
  const timeouts = clock(timed);
  timed.apiClient = (_url, opts) =>
    new Promise((_resolve, reject) => {
      release = () => reject(new DOMException('timeout', 'AbortError'));
      opts.signal.addEventListener('abort', release);
    });
  const pending = timed.persist();
  assert.deepEqual(
    [...timeouts.pending.values()].map((t) => t.delay),
    [20000],
  );
  await timeouts.fire(20000);
  await pending;
  assert.equal(timed.autosaveInflightRef.current, false);
  assert.equal(timed.dirtyRef.current, true);
  assert.match(timed.saveMsg, /Lưu quá lâu/);
  console.log('PASS NO_TIGHT_REFUSH_LOOP');

  const api = parse(path.join(root, 'apps/web/src/lib/api-client.ts'));
  const abort = new DOMException('aborted', 'AbortError');
  const apiCtx = vm.createContext({
    DOMException,
    Error,
    process: { env: {} },
    getStoredAffiliateRef: () => null,
    fetch: async () => {
      throw abort;
    },
  });
  for (const name of ['resolveApiUrl', 'withCredentials', 'apiClient'])
    apiCtx[name] = evaluate(definition(api, name), apiCtx);
  await assert.rejects(
    apiCtx.apiClient('/offline-test', { auth: false }),
    (error) => error === abort,
  );
  console.log('PASS ABORT_PROPAGATES');

  // Execute React's effect callback using its actual dependency expression. A value
  // change during typing must not schedule another caret/focus operation.
  const focusHooks = find(
    canvas,
    (node) =>
      ts.isCallExpression(node) &&
      node.expression.getText(canvas) === 'useLayoutEffect' &&
      calls(node.arguments[0], 'focus').length > 0 &&
      calls(node.arguments[0], 'placeCaretAtPoint').length > 0,
  );
  assert.equal(focusHooks.length, 1);
  let focuses = 0;
  const focusCtx = vm.createContext({
    editing: false,
    value: 'hello',
    ref: {
      current: {
        innerText: 'hello',
        focus() {
          focuses++;
        },
      },
    },
    draftRef: { current: '' },
    pendingCaretRef: { current: null },
    document: { createRange: () => ({ selectNodeContents() {}, collapse() {} }) },
    window: { getSelection: () => null },
  });
  let previous;
  const render = () => {
    const deps = evaluate(focusHooks[0].arguments[1].getText(canvas), focusCtx);
    if (!previous || deps.some((value, i) => !Object.is(value, previous[i])))
      evaluate(focusHooks[0].arguments[0].getText(canvas), focusCtx)();
    previous = deps;
  };
  render();
  focusCtx.editing = true;
  render();
  focusCtx.value = 'hello world';
  render();
  assert.equal(focuses, 1);
  console.log('PASS INLINE_EDIT_NO_VALUE_CARET_LOOP');

  // Call the real API service method with transaction stubs; no Prisma client.
  const service = parse(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'));
  const serverCtx = vm.createContext({
    ...require('./helpers/landing-page-source-harness.cjs').shared,
    THEME_MAP: {},
    NotFoundException: Error,
    createHash: require('node:crypto').createHash,
  });
  const revision = require('./helpers/landing-page-source-harness.cjs').revisionSource;
  for (const name of [
    'decideLandingPageAutosave',
    'readLandingPageRevision',
    'readLandingPageRequestId',
    'readLandingPageRequestHash',
  ])
    serverCtx[name] = evaluate(definition(revision, name), serverCtx);
  const receipt = parse(path.join(root, 'apps/api/src/landing-pages/landing-page-autosave-receipt.ts'));
  for (const node of receipt.statements.filter(ts.isFunctionDeclaration)) serverCtx[node.name.text] = evaluate(definition(receipt, node.name.text), serverCtx);
  const autosave = require('./helpers/landing-page-source-harness.cjs').method(
    service,
    'autosave',
    serverCtx,
  );
  let updates = 0,
    lockedRow = false;
  const row = { id: 'p', draftSpec: { meta: { clientRevision: 12 } } };
  const receiver = {
    assertPage: async () => row,
    assertMutable() {},
    prisma: {
      $transaction: (fn) =>
        fn({
          $queryRaw: async () => {
            lockedRow = true;
          },
          landingPage: {
            findFirst: async () => row,
            update: async () => {
              updates++;
              throw new Error('stale write reached DB stub');
            },
          },
        }),
    },
  };
  const result = await autosave.call(receiver, { organizationId: 'org' }, 'p', {
    draftSpec: {},
    baseRevision: 10,
    clientRevision: 11,
  });
  assert.equal(result.rejected, true);
  assert.equal(result.reason, 'STALE_REVISION');
  assert.equal(updates, 0);
  assert.equal(lockedRow, true);
  console.log('PASS SERVER_STALE_STILL_BLOCKS');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
