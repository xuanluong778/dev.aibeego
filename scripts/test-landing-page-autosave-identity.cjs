#!/usr/bin/env node
// Execute current builder callbacks and the actual service method/policy. Only
// storage/transport are in memory; the full-app companion uses real API + DB.
const {
  assert,
  vm,
  ts,
  path,
  root,
  parse,
  definition,
  evaluate,
  method,
  harness,
  clock,
  snapshot,
  shared,
} = require('./helpers/landing-page-source-harness.cjs');
const crypto = require('node:crypto');
const service = parse(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'));
const revision = parse(path.join(root, 'apps/api/src/landing-pages/landing-page-revision.ts'));
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
function server() {
  const ctx = vm.createContext({
    ...shared,
    createHash: crypto.createHash,
    THEME_MAP: {},
    NotFoundException: Error,
  });
  for (const node of revision.statements.filter(ts.isFunctionDeclaration))
    ctx[node.name.text] = evaluate(definition(revision, node.name.text), ctx);
  const receipt = parse(
    path.join(root, 'apps/api/src/landing-pages/landing-page-autosave-receipt.ts'),
  );
  for (const node of receipt.statements.filter(ts.isFunctionDeclaration))
    ctx[node.name.text] = evaluate(definition(receipt, node.name.text), ctx);
  let row = {
      id: 'p',
      name: 'Page',
      status: 'DRAFT',
      draftSpec: snapshot(harness().specRef.current),
      updatedAt: '2026-10-30T00:00:00Z',
    },
    writes = 0;
  const receiver = {
    assertPage: async () => row,
    assertMutable() {},
    prisma: {
      $transaction: (fn) =>
        fn({
          $queryRaw: async () => {},
          landingPage: {
            findFirst: async () => snapshot(row),
            update: async ({ data }) => {
              writes++;
              row = { ...row, ...snapshot(data) };
              return snapshot(row);
            },
          },
        }),
    },
  };
  return {
    save: (body) =>
      method(service, 'autosave', ctx).call(
        receiver,
        { organizationId: 'test' },
        'p',
        snapshot(body),
      ),
    row: () => snapshot(row),
    writes: () => writes,
  };
}
function edit(ctx, title) {
  ctx.pushHistory({ ...ctx.specRef.current, seo: { ...ctx.specRef.current.seo, title } });
}
const echo = (body) => ({
  rejected: false,
  requestId: body.requestId,
  clientRevision: body.clientRevision,
  updatedAt: '2026-10-30T00:00:00Z',
});
function dto(text, requestId = 'lp-as-1', baseRevision = 10, clientRevision = 11) {
  const spec = snapshot(harness().specRef.current);
  spec.blocks[0].headline = text;
  spec.meta.clientRevision = clientRevision;
  return { draftSpec: spec, name: 'Page', requestId, baseRevision, clientRevision };
}

test('two independent tabs never share a save request ID', async () => {
  const requests = [];
  for (const title of ['Tab A', 'Tab B']) {
    const ctx = harness();
    clock(ctx);
    edit(ctx, title);
    ctx.apiClient = async (_url, opts) => {
      const body = JSON.parse(opts.body);
      requests.push(body);
      return echo(body);
    };
    await ctx.persist();
  }
  assert.notEqual(requests[0].requestId, requests[1].requestId);
  for (const body of requests) assert.ok(body.requestId.length <= 64);
});
test('different saves in one tab have different IDs', async () => {
  const ctx = harness();
  clock(ctx);
  const requests = [];
  ctx.apiClient = async (_url, opts) => {
    const body = JSON.parse(opts.body);
    requests.push(body);
    return echo(body);
  };
  edit(ctx, 'First');
  await ctx.persist();
  edit(ctx, 'Second');
  await ctx.persist();
  assert.notEqual(requests[0].requestId, requests[1].requestId);
});
test('retry after lost response keeps byte-identical ID and payload', async () => {
  const ctx = harness();
  clock(ctx);
  edit(ctx, 'First');
  const requests = [];
  ctx.apiClient = async (_url, opts) => {
    requests.push(opts.body);
    if (requests.length === 1) throw Error('response lost after commit');
    return echo(JSON.parse(opts.body));
  };
  await ctx.persist();
  assert.equal(requests.length, 2);
  assert.equal(requests[0], requests[1]);
  assert.equal(ctx.ackedRevisionRef.current, 11);
  assert.equal(ctx.dirtyRef.current, false);
});
test('exhausted retries retain pending request; later edits flush only after its ACK', async () => {
  const ctx = harness();
  clock(ctx);
  edit(ctx, 'Unconfirmed');
  const requests = [];
  let offline = true;
  ctx.apiClient = async (_url, opts) => {
    requests.push(opts.body);
    if (offline) throw Error('response lost');
    return echo(JSON.parse(opts.body));
  };
  await ctx.persist();
  assert.equal(ctx.ackedRevisionRef.current, 10);
  assert.equal(ctx.dirtyRef.current, true);
  edit(ctx, 'Newer edit');
  offline = false;
  await ctx.persist(undefined, undefined, { manual: true });
  assert.equal(requests[0], requests[1]);
  assert.equal(requests[0], requests[2]);
  assert.equal(JSON.parse(requests.at(-1)).draftSpec.seo.title, 'Newer edit');
  assert.notEqual(JSON.parse(requests[0]).requestId, JSON.parse(requests.at(-1)).requestId);
  assert.equal(ctx.ackedRevisionRef.current, 12);
});
test('server rejects same ID with another draft and leaves revision/data untouched', async () => {
  const s = server();
  await s.save(dto('A'));
  const before = s.row();
  const response = await s.save(dto('B'));
  assert.equal(response.rejected, true);
  assert.equal(response.reason, 'STALE_REVISION');
  assert.deepEqual(s.row(), before);
  assert.equal(s.writes(), 1);
});
test('server accepts an exact retry once, rejects ID reuse with changed base/name/payload', async () => {
  const s = server(),
    request = dto('A');
  const first = await s.save(request);
  const retry = await s.save(request);
  assert.equal(first.rejected, false);
  assert.equal(retry.rejected, false);
  assert.equal(retry.clientRevision, 11);
  assert.equal(s.writes(), 1);
  for (const patch of [
    { name: 'Another operation' },
    { baseRevision: 11, clientRevision: 12 },
    { draftSpec: dto('B').draftSpec },
  ]) {
    const response = await s.save({ ...request, ...patch });
    assert.equal(response.rejected, true);
    assert.equal(s.writes(), 1);
  }
});
test('exact legacy retry remains identical when normalization allocates missing IDs', async () => {
  const s = server(),
    body = dto('Legacy no block ID');
  delete body.draftSpec.blocks[0].id;
  const first = await s.save(body),
    stored = s.row(),
    retry = await s.save(body);
  assert.equal(first.rejected, false);
  assert.equal(retry.rejected, false);
  assert.equal(s.writes(), 1);
  assert.deepEqual(s.row(), stored);
});
test('same revision with different content cannot be acknowledged as unchanged', async () => {
  const s = server();
  await s.save(dto('A', 'first'));
  const before = s.row();
  const response = await s.save(dto('B', 'different-id', 11, 11));
  assert.equal(response.rejected, true);
  assert.deepEqual(s.row(), before);
});
test('legitimate no-edit flush is unchanged and does not bump revision', async () => {
  const s = server();
  await s.save(dto('A', 'first'));
  const body = { ...dto('A', 'flush', 11, 11), draftSpec: s.row().draftSpec };
  const response = await s.save(body);
  assert.equal(response.rejected, false);
  assert.equal(response.clientRevision, 11);
  assert.equal(s.writes(), 1);
});
test('foreign/missing ID or wrong revision ACK cannot advance base or clear local', async () => {
  for (const patch of [
    { requestId: 'another-tab' },
    { requestId: undefined },
    { clientRevision: 99 },
    { reason: 'STALE_REVISION' },
  ]) {
    const ctx = harness();
    clock(ctx);
    edit(ctx, 'Unsaved');
    let cleared = 0,
      local;
    ctx.clearLocalLandingDraft = () => cleared++;
    ctx.writeLocalLandingDraft = (value) => (local = snapshot(value));
    ctx.apiClient = async (_url, opts) => ({ ...echo(JSON.parse(opts.body)), ...patch });
    await ctx.persist();
    assert.equal(ctx.ackedRevisionRef.current, 10);
    assert.equal(ctx.revisionRef.current, 11);
    assert.equal(ctx.dirtyRef.current, true);
    assert.equal(cleared, 0);
    assert.equal(local.spec.seo.title, 'Unsaved');
    assert.equal(ctx.saveConflictRef.current, true);
  }
});
test('two real persist callbacks with common server preserve loser local and conflict', async () => {
  const s = server(),
    a = harness(),
    b = harness();
  let localB,
    clearedB = 0;
  for (const c of [a, b]) {
    clock(c);
    c.apiClient = (_url, opts) => s.save(JSON.parse(opts.body));
  }
  b.writeLocalLandingDraft = (value) => (localB = snapshot(value));
  b.clearLocalLandingDraft = () => clearedB++;
  edit(a, 'Winner');
  edit(b, 'Pending B');
  await a.persist();
  await b.persist();
  assert.equal(s.row().draftSpec.seo.title, 'Winner');
  assert.equal(s.row().draftSpec.meta.clientRevision, 11);
  assert.equal(a.ackedRevisionRef.current, 11);
  assert.equal(b.ackedRevisionRef.current, 10);
  assert.equal(b.saveConflictRef.current, true);
  assert.equal(clearedB, 0);
  assert.equal(localB.spec.seo.title, 'Pending B');
});
test('lost ACK followed by another writer never rebases the old pending draft', async () => {
  const s = server(),
    ctx = harness();
  clock(ctx);
  edit(ctx, 'Unconfirmed A');
  let local,
    calls = 0;
  ctx.writeLocalLandingDraft = (draft) => (local = snapshot(draft));
  ctx.apiClient = async (_url, opts) => {
    const body = JSON.parse(opts.body);
    if (++calls === 1) {
      await s.save(body);
      const other = s.row().draftSpec;
      other.seo.title = 'Confirmed B';
      await s.save({
        draftSpec: other,
        name: 'Page',
        baseRevision: 11,
        clientRevision: 12,
        requestId: 'other-writer-operation',
      });
      throw Error('A response lost after commit');
    }
    return s.save(body);
  };
  await ctx.persist();
  assert.equal(s.row().draftSpec.seo.title, 'Confirmed B');
  assert.equal(s.row().draftSpec.meta.clientRevision, 12);
  assert.equal(ctx.ackedRevisionRef.current, 10);
  assert.equal(ctx.revisionRef.current, 11);
  assert.equal(ctx.saveConflictRef.current, true);
  assert.equal(local.spec.seo.title, 'Unconfirmed A');
  assert.equal(local.baseRevision, 10);
  assert.equal(local.clientRevision, 11);
});
test('winner ACK only clears a local snapshot with matching content and revisions', async () => {
  for (const anotherDraft of [false, true]) {
    const ctx = harness();
    clock(ctx);
    edit(ctx, 'Winner');
    let cleared = 0;
    const local = {
      pageId: 'p',
      spec: snapshot(ctx.specRef.current),
      baseRevision: 10,
      clientRevision: 11,
      savedAt: '',
    };
    if (anotherDraft) local.spec.seo.title = 'Other tab pending';
    ctx.readLocalLandingDraft = () => snapshot(local);
    ctx.clearLocalLandingDraft = () => cleared++;
    ctx.apiClient = async (_url, opts) => echo(JSON.parse(opts.body));
    await ctx.persist();
    assert.equal(cleared, anotherDraft ? 0 : 1);
    assert.equal(ctx.ackedRevisionRef.current, 11);
  }
});
test('UUID fallback uses actual cryptographic randomness without a tab counter', async () => {
  const ctx = harness();
  ctx.crypto = { getRandomValues: (value) => crypto.webcrypto.getRandomValues(value) };
  const ids = new Set(Array.from({ length: 100 }, () => ctx.createLandingPageAutosaveRequestId()));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^lp-as-[a-f0-9]{32}$/);
});
(async () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log('PASS ' + name);
    } catch (e) {
      failed++;
      console.error('FAIL ' + name + '\n' + e.stack);
    }
  }
  console.log(JSON.stringify({ total: tests.length, failed }));
  process.exitCode = failed ? 1 : 0;
})();
