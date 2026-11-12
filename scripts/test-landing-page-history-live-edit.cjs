#!/usr/bin/env node
// Source callbacks: pending text transition -> reorder -> history -> persist/load.
const {
  assert,
  builder,
  definition,
  evaluate,
  jsxCallback,
  harness,
  snapshot,
  state,
  clock,
} = require('./helpers/landing-page-source-harness.cjs');
const failures = [];
for (const action of ['moveBlock', 'reorderBlockById', 'sidebar']) {
  const ctx = harness();
  ctx.specRef.current.blocks.push({
    id: 'cta',
    type: 'CTA',
    enabled: true,
    headline: 'Second section',
  });
  ctx.spec = snapshot(ctx.specRef.current);
  const transitions = [];
  // React may defer this transition; the source explicitly writes specRef first.
  ctx.startTransition = (callback) => transitions.push(callback);
  for (const name of ['applyNestedBlockField', 'updateBlockFieldLive'])
    ctx[name] = evaluate(definition(builder, name), ctx);
  ctx.updateBlockFieldLive('hero', 'headline', 'Live text waiting for React');
  assert.equal(ctx.specRef.current.blocks[0].headline, 'Live text waiting for React');
  assert.equal(ctx.spec.blocks[0].headline, 'Headline');
  assert.equal(transitions.length, 1);
  if (action === 'sidebar')
    evaluate(jsxCallback(builder, 'LandingPageAddComponentsPanel', 'onReorderBlocks'), ctx)(0, 1);
  else evaluate(definition(builder, action), ctx)('hero', action === 'moveBlock' ? 'down' : 'cta');
  const actual = ctx.specRef.current.blocks.find((block) => block.id === 'hero').headline;
  assert.deepEqual(snapshot(ctx.specRef.current.blocks.map((block) => block.id)), ['cta', 'hero']);
  if (actual !== 'Live text waiting for React') {
    failures.push({
      action,
      expected: 'Live text waiting for React',
      actual,
      revision: ctx.revisionRef.current,
    });
    console.error('FAIL LIVE_EDIT_PRESERVED_' + action, JSON.stringify(failures.at(-1)));
  }
}
assert.deepEqual(
  failures,
  [],
  'reordering sections must preserve text from the live draft during a pending transition',
);

function editor() {
  const ctx = harness();
  const timers = clock(ctx);
  ctx.specRef.current.blocks.push({
    id: 'cta',
    type: 'CTA',
    enabled: true,
    headline: 'Second section',
  });
  ctx.specRef.current.meta.elementHidden = { 'hero::body': true };
  ctx.spec = snapshot(ctx.specRef.current);
  const initial = snapshot(ctx.specRef.current);
  const pendingStates = [];
  let transition = false;
  const setSpec = ctx.setSpec;
  // startTransition invokes its callback synchronously; React may defer committing
  // its state updates. Real React queue/rebase is also exercised by the browser test.
  ctx.startTransition = (callback) => {
    transition = true;
    try {
      callback();
    } finally {
      transition = false;
    }
  };
  ctx.setSpec = (value) => (transition ? pendingStates.push(value) : setSpec(value));
  for (const name of ['applyNestedBlockField', 'updateBlockFieldLive'])
    ctx[name] = evaluate(definition(builder, name), ctx);
  for (const text of ['L', 'Li', 'Live', 'Live text waiting for React'])
    ctx.updateBlockFieldLive('hero', 'headline', text);
  assert.equal(pendingStates.length, 4);
  assert.equal(ctx.spec.blocks[0].headline, 'Headline');
  assert.equal(ctx.historyRef.current.length, 1, 'rapid typing is one undo entry');
  assert.equal(ctx.revisionRef.current, 14);
  return { ctx, timers, initial, typed: snapshot(ctx.specRef.current) };
}

function reorder(ctx, action) {
  if (action === 'sidebar')
    evaluate(jsxCallback(builder, 'LandingPageAddComponentsPanel', 'onReorderBlocks'), ctx)(0, 1);
  else ctx[action]('hero', action === 'moveBlock' ? 'down' : 'cta');
}

async function testHistoryAndPersistence() {
  for (const action of ['moveBlock', 'reorderBlockById', 'sidebar']) {
    const { ctx, timers, initial, typed } = editor();
    const blocks = [...ctx.specRef.current.blocks],
      meta = ctx.specRef.current.meta;
    reorder(ctx, action);
    const ordered = { ...typed, blocks: [typed.blocks[1], typed.blocks[0]] };
    assert.deepEqual(snapshot(ctx.specRef.current), ordered, `${action} changes only order`);
    assert.equal(ctx.specRef.current.meta, meta);
    assert.equal(ctx.specRef.current.blocks[1], blocks[0]);
    assert.equal(ctx.specRef.current.blocks[0], blocks[1]);
    assert.equal(ctx.revisionRef.current, 15);
    assert.deepEqual(
      snapshot(ctx.historyRef.current),
      [initial, typed],
      'one text entry and exactly one reorder entry',
    );
    assert.equal(ctx.futureRef.current.length, 0);

    const noOp = state(ctx);
    ctx.moveBlock('hero', 'down');
    ctx.reorderBlockById('hero', 'hero');
    ctx.reorderBlockById('missing', 'cta');
    evaluate(jsxCallback(builder, 'LandingPageAddComponentsPanel', 'onReorderBlocks'), ctx)(0, 99);
    assert.deepEqual(state(ctx), noOp, 'no-op reorder adds no history or revision');

    ctx.undo();
    assert.deepEqual(snapshot(ctx.specRef.current), typed, 'Undo reorder retains all new text');
    assert.equal(ctx.historyRef.current.length, 1);
    assert.equal(ctx.futureRef.current.length, 1);
    ctx.undo();
    assert.deepEqual(snapshot(ctx.specRef.current), initial, 'second Undo undoes the text batch');
    assert.equal(ctx.historyNav.undo, false);
    assert.equal(ctx.futureRef.current.length, 2);
    ctx.redo();
    assert.deepEqual(snapshot(ctx.specRef.current), typed);
    ctx.redo();
    assert.deepEqual(snapshot(ctx.specRef.current), ordered);
    assert.equal(ctx.historyRef.current.length, 2);
    assert.equal(ctx.futureRef.current.length, 0);
    assert.equal(ctx.historyNav.undo, true);
    assert.equal(ctx.historyNav.redo, false);
    assert.equal(ctx.revisionRef.current, 19);
    assert.equal(ctx.ackedRevisionRef.current, 10);

    await ctx.persist();
    assert.equal(ctx.dirtyRef.current, false);
    assert.equal(ctx.ackedRevisionRef.current, 19);
    const body = JSON.parse(ctx.requests[0].options.body);
    assert.deepEqual(
      body.draftSpec.blocks.map((block) => block.id),
      ['cta', 'hero'],
    );
    assert.equal(body.draftSpec.blocks[1].headline, 'Live text waiting for React');
    await ctx.load();
    ctx.specRef.current = ctx.spec;
    assert.deepEqual(snapshot(ctx.specRef.current.blocks.map((block) => block.id)), [
      'cta',
      'hero',
    ]);
    assert.equal(ctx.specRef.current.blocks[1].headline, 'Live text waiting for React');
    assert.equal(ctx.specRef.current.meta.elementHidden['hero::body'], true);
    assert.equal(ctx.revisionRef.current, 19);
    assert.equal(ctx.ackedRevisionRef.current, 19);
    assert.equal(ctx.historyRef.current.length, 0);
    assert.equal(ctx.futureRef.current.length, 0);
    assert.equal(timers.pending.size, 0);

    // An earlier autosave response must not put the old order back on the canvas.
    const concurrent = editor();
    const api = concurrent.ctx.apiClient;
    let release,
      first = true;
    concurrent.ctx.apiClient = async (...args) => {
      if (first) {
        first = false;
        await new Promise((resolve) => {
          release = resolve;
        });
      }
      return api(...args);
    };
    const inflight = concurrent.ctx.persist();
    reorder(concurrent.ctx, action);
    release();
    await inflight;
    assert.deepEqual(snapshot(concurrent.ctx.specRef.current.blocks.map((block) => block.id)), [
      'cta',
      'hero',
    ]);
    assert.equal(concurrent.ctx.dirtyRef.current, true);
    await concurrent.ctx.persist(undefined, undefined, { manual: true });
    assert.equal(concurrent.ctx.requests.length, 2);
    await concurrent.timers.fire(500);
    assert.equal(concurrent.ctx.requests.length, 2, 'clean draft does not save again');
    await concurrent.ctx.load();
    concurrent.ctx.specRef.current = concurrent.ctx.spec;
    assert.deepEqual(snapshot(concurrent.ctx.specRef.current.blocks.map((block) => block.id)), [
      'cta',
      'hero',
    ]);
    assert.equal(concurrent.ctx.specRef.current.blocks[1].headline, 'Live text waiting for React');
    console.log(
      `PASS ${action}: latest text/order, exact Undo/Redo entries, autosave race and reload`,
    );
  }

  const { ctx } = editor();
  const visible = snapshot(ctx.spec);
  const other = { id: 'other', type: 'CTA', enabled: true, headline: 'Concurrent section' };
  ctx.pushHistory({ ...ctx.specRef.current, blocks: [other, ...ctx.specRef.current.blocks] });
  ctx.spec = visible; // an event from the previous visible list still carries its indices
  reorder(ctx, 'sidebar');
  assert.deepEqual(snapshot(ctx.specRef.current.blocks.map((block) => block.id)), [
    'other',
    'cta',
    'hero',
  ]);
  assert.equal(ctx.specRef.current.blocks[2].headline, 'Live text waiting for React');
  console.log('PASS sidebar: rendered indices resolve stable IDs against the latest live order');
}

testHistoryAndPersistence().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
