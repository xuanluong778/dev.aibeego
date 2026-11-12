#!/usr/bin/env node
// Full Next/Nest/Prisma app E2E. Requires an explicitly provisioned, internal
// Docker test network and disposable lp_e2e database. No default live origin.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  cp = require('node:child_process');
const { chromium } = require('playwright');
const {
  createEmptyLandingPageSpec,
  sanitizeLandingPagePersistSpec,
} = require('../packages/shared/dist');
const configFile = process.env.LP_E2E_CONFIG;
if (!configFile) {
  console.error('BLOCKED: LP_E2E_CONFIG must identify an isolated full-app/API/DB test stack');
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync(configFile)),
  origin = new URL(cfg.origin);
assert.ok(['127.0.0.1', 'localhost'].includes(origin.hostname) && origin.protocol === 'http:');
assert.match(cfg.prefix, /^lp-e2e-[a-z0-9-]+$/);
assert.equal(cfg.network, cfg.prefix + '-net');
assert.equal(cfg.postgresContainer, cfg.prefix + '-pg');
assert.equal(
  cp
    .execFileSync('docker', ['network', 'inspect', cfg.network, '--format', '{{.Internal}}'], {
      encoding: 'utf8',
    })
    .trim(),
  'true',
);
const pg = JSON.parse(
  cp.execFileSync('docker', ['inspect', cfg.postgresContainer], { encoding: 'utf8' }),
)[0];
assert.ok(pg.NetworkSettings.Networks[cfg.network]);
const seed = JSON.parse(fs.readFileSync(cfg.seedFile));
assert.equal(seed.email, cfg.prefix + '@example.invalid');
fs.mkdirSync(cfg.artifactDir, { recursive: true });
const blockId = 'p0_hero',
  storageKey = (id) => 'lp-draft-recovery:' + id;
const makeSpec = (text) =>
  sanitizeLandingPagePersistSpec({
    ...createEmptyLandingPageSpec(),
    blocks: [
      {
        id: blockId,
        type: 'Hero',
        enabled: true,
        headline: text,
        body: 'Disposable P0 test',
        ctaLabel: 'Test',
        ctaUrl: '#test',
      },
      { id: 'p0_cta', type: 'CTA', enabled: true, headline: 'Second section' },
    ],
  });
const headline = (spec) => spec.blocks.find((b) => b.id === blockId).headline;
const revision = (spec) => spec.meta?.clientRevision || 0;
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};
async function poll(fn, label, timeout = 20000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const value = await fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error(label + ' not reached');
}
function db(id) {
  assert.match(id, /^[a-f0-9-]{36}$/);
  const sql = `SELECT json_build_object('draft',draft_spec,'published',published_spec,'name',name) FROM landing_pages WHERE id='${id}'`;
  return JSON.parse(
    cp
      .execFileSync(
        'docker',
        ['exec', cfg.postgresContainer, 'psql', '-U', 'lp_e2e', '-d', 'lp_e2e', '-At', '-c', sql],
        { encoding: 'utf8' },
      )
      .trim(),
  );
}
const authFile = path.join(cfg.artifactDir, 'auth-private.json');
let cachedAuth;
if (fs.existsSync(authFile)) {
  const previous = JSON.parse(fs.readFileSync(authFile));
  if (
    JSON.parse(Buffer.from(previous.token.split('.')[1], 'base64url')).exp >
    Date.now() / 1000 + 60
  )
    cachedAuth = previous;
}
async function login(context, fresh = false) {
  if (!cachedAuth || fresh) {
    const res = await context.request.post(cfg.origin + '/api/v1/auth/login', {
      data: { email: seed.email, password: seed.password },
    });
    assert.ok(res.ok(), 'real test login HTTP ' + res.status());
    const auth = {
      token: (await res.json()).accessToken,
      cookies: (await context.storageState()).cookies,
    };
    if (!fresh) {
      cachedAuth = auth;
      fs.writeFileSync(authFile, JSON.stringify(auth), { mode: 0o600 });
    }
    return auth;
  }
  await context.addCookies(cachedAuth.cookies);
  return cachedAuth;
}
async function setup(browser, name) {
  const dir = fs.mkdtempSync(path.join(cfg.artifactDir, name + '-')),
    record = {
      name,
      dir,
      steps: [],
      requests: [],
      responses: [],
      console: [],
      networkErrors: [],
      pageErrors: [],
      externalBlocked: [],
    },
    contexts = [];
  async function context(fresh = false) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    contexts.push(c);
    const auth = await login(c, fresh);
    await c.addInitScript((token) => localStorage.setItem('ms_access_token', token), auth.token);
    await c.route('**/*', (r) =>
      r
        .request()
        .url()
        .startsWith(cfg.origin + '/')
        ? r.continue()
        : (record.externalBlocked.push(r.request().url()), r.abort('blockedbyclient')),
    );
    await c.tracing.start({ screenshots: true, snapshots: true, sources: true });
    return { c, auth };
  }
  const { c, auth } = await context();
  function attach(p, tab) {
    p.setDefaultTimeout(15000);
    p.setDefaultNavigationTimeout(120000);
    p.on('console', (m) => record.console.push({ tab, type: m.type(), text: m.text() }));
    p.on('pageerror', (e) => record.pageErrors.push({ tab, message: e.message, stack: e.stack }));
    p.on('requestfailed', (r) =>
      record.networkErrors.push({ tab, url: r.url(), failure: r.failure() }),
    );
    p.on('response', async (r) => {
      if (r.url().endsWith('/autosave'))
        try {
          record.responses.push({
            tab,
            status: r.status(),
            request: JSON.parse(r.request().postData()),
            response: await r.json(),
          });
        } catch {}
    });
    return p;
  }
  async function api(route, method = 'GET', data) {
    const res = await c.request.fetch(cfg.origin + '/api/v1' + route, {
      method,
      headers: { authorization: 'Bearer ' + auth.token },
      ...(data === undefined ? {} : { data }),
    });
    const json = await res.json();
    assert.ok(res.ok(), method + ' ' + route + ' ' + res.status() + ' ' + JSON.stringify(json));
    return json;
  }
  async function create(label) {
    const row = await api('/landing-pages', 'POST', {
      name: 'P0 ' + label,
      slug: 'p0-' + label + '-' + Date.now(),
    });
    const base = revision(row.draftSpec) || 0;
    await api('/landing-pages/' + row.id + '/autosave', 'POST', {
      draftSpec: makeSpec('P0 seed'),
      baseRevision: base,
      clientRevision: base + 1,
      requestId: 'seed-' + row.id,
    });
    record.pageId = row.id;
    return row.id;
  }
  async function go(p, id) {
    await p.goto(cfg.origin + '/landing-pages/builder/' + id, { waitUntil: 'domcontentloaded' });
    await field(p).waitFor();
  }
  const field = (p) =>
    p.locator(`[data-lp-block-id="${blockId}"] [data-lp-inline-field="headline"]`).first();
  const save = (p) => p.locator('[data-lp-toolbar-btn="save"]').filter({ visible: true }).first();
  async function type(p, text) {
    await field(p).dblclick();
    await p.waitForFunction(
      (id) =>
        document.querySelector(`[data-lp-block-id="${id}"] [data-lp-inline-field="headline"]`)
          ?.isContentEditable,
      blockId,
    );
    await field(p).fill(text);
    await field(p).press('Tab');
    assert.equal(await field(p).textContent(), text);
  }
  async function step(label, fn) {
    const row = { label, status: 'START', at: new Date().toISOString() };
    record.steps.push(row);
    try {
      const result = await fn();
      row.status = 'PASS';
      return result;
    } catch (e) {
      row.status = 'FAIL';
      row.actual = e.message;
      throw e;
    }
  }
  async function local(p, id) {
    return p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), storageKey(id));
  }
  async function expectServer(id, text, rev) {
    const row = await api('/landing-pages/' + id);
    assert.equal(headline(row.draftSpec), text);
    if (rev !== undefined) assert.equal(revision(row.draftSpec), rev);
    const stored = db(id);
    assert.equal(headline(stored.draft), text);
    assert.equal(revision(stored.draft), revision(row.draftSpec));
    record.db = stored;
    return row;
  }
  async function gate(p, tab, id) {
    const first = deferred(),
      release = deferred();
    let opened = false;
    await p.route('**/api/v1/landing-pages/' + id + '/autosave', async (r) => {
      const body = JSON.parse(r.request().postData());
      record.requests.push({ tab, body, raw: r.request().postData() });
      first.resolve(body);
      if (!opened) await release.promise;
      await r.continue().catch(() => {});
    });
    return {
      first: first.promise,
      open() {
        opened = true;
        release.resolve();
      },
    };
  }
  async function finish(status, error) {
    record.status = status;
    record.error = error ? { message: error.message, stack: error.stack } : null;
    for (let i = 0; i < contexts.length; i++) {
      const ctx = contexts[i];
      for (const [j, p] of ctx.pages().entries())
        await p
          .screenshot({ path: path.join(dir, `final-${i}-${j}.png`), fullPage: true })
          .catch(() => {});
      await ctx.tracing
        .stop({ path: path.join(dir, i ? 'trace-context-' + i + '.zip' : 'trace.zip') })
        .catch(() => {});
      await ctx.close();
    }
    fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(record, null, 2));
    return { name, status, error: error?.message, dir };
  }
  return {
    browser,
    c,
    context,
    attach,
    api,
    create,
    go,
    field,
    save,
    type,
    step,
    local,
    expectServer,
    gate,
    record,
    finish,
  };
}
async function twoTabs(t, { concurrent = false, separate = false } = {}) {
  const {
      c,
      attach,
      context,
      create,
      go,
      type,
      save,
      gate,
      step,
      record,
      local,
      expectServer,
      api,
    } = t,
    id = await create(concurrent ? 'concurrent' : separate ? 'sessions' : 'tabs'),
    a = attach(await c.newPage(), 'A'),
    second = separate ? (await context(true)).c : c,
    b = attach(await second.newPage(), 'B'),
    textA = 'P0 writer A exact text',
    textB = 'P0 writer B exact text';
  await go(a, id);
  await go(b, id);
  const ga = await gate(a, 'A', id),
    gb = await gate(b, 'B', id);
  let requestA, requestB;
  await step('Both tabs submit from the same revision and base', async () => {
    await type(a, textA);
    await save(a).click();
    requestA = await ga.first;
    await type(b, textB);
    await save(b).click();
    requestB = await gb.first;
    assert.equal(requestA.baseRevision, requestB.baseRevision);
    assert.equal(requestA.clientRevision, requestB.clientRevision);
    assert.notEqual(requestA.requestId, requestB.requestId);
    await expectServer(id, 'P0 seed', requestA.baseRevision);
  });
  const responseA = a.waitForResponse(
      (r) =>
        r.url().endsWith('/autosave') &&
        JSON.parse(r.request().postData()).requestId === requestA.requestId,
    ),
    responseB = b.waitForResponse(
      (r) =>
        r.url().endsWith('/autosave') &&
        JSON.parse(r.request().postData()).requestId === requestB.requestId,
    );
  let resultA, resultB;
  await step(
    concurrent
      ? 'Release both requests concurrently through real DB row lock'
      : 'Save A then deliver B stale request',
    async () => {
      if (concurrent) {
        ga.open();
        gb.open();
      } else {
        ga.open();
        await responseA;
        await poll(
          async () => headline((await api('/landing-pages/' + id)).draftSpec) === textA,
          'A committed',
        );
        gb.open();
      }
      [resultA, resultB] = await Promise.all([
        responseA.then((r) => r.json()),
        responseB.then((r) => r.json()),
      ]);
      assert.equal([resultA, resultB].filter((r) => r.rejected === false).length, 1);
      assert.equal(
        [resultA, resultB].filter((r) => r.rejected === true && r.reason === 'STALE_REVISION')
          .length,
        1,
      );
    },
  );
  const aWon = !resultA.rejected,
    winner = aWon ? a : b,
    loser = aWon ? b : a,
    loserContext = aWon ? second : c,
    winningText = aWon ? textA : textB,
    losingText = aWon ? textB : textA,
    winningRequest = aWon ? requestA : requestB;
  await step('Check DB/revision and exact unacknowledged loser local', async () => {
    await loser.locator('[data-lp-save-conflict-toast]').waitFor();
    await expectServer(id, winningText, winningRequest.clientRevision);
    const draft = await local(loser, id);
    assert.equal(headline(draft.spec), losingText);
    assert.equal(draft.baseRevision, winningRequest.baseRevision);
    assert.equal(draft.clientRevision, winningRequest.clientRevision);
    record.loserLocal = draft;
    assert.equal(await t.field(loser).textContent(), losingText);
    await loser.screenshot({ path: path.join(record.dir, 'loser-conflict.png'), fullPage: true });
  });
  await step('Winner no-edit Save cannot clear other tab local or bump revision', async () => {
    const response = winner.waitForResponse((r) => r.url().endsWith('/autosave'));
    await save(winner).click();
    assert.equal((await (await response).json()).rejected, false);
    await expectServer(id, winningText, winningRequest.clientRevision);
    assert.equal(headline((await local(loser, id)).spec), losingText);
  });
  await step('Close/reopen loser: conflict and local survive; Save stays paused', async () => {
    await loser.close();
    const reopened = attach(await loserContext.newPage(), 'reopened');
    await go(reopened, id);
    await reopened.locator('[data-lp-save-conflict-toast]').waitFor();
    assert.equal(await t.field(reopened).textContent(), winningText);
    assert.equal(headline((await local(reopened, id)).spec), losingText);
    await save(reopened).click();
    await reopened
      .getByText(/Có bản mới hơn ở nơi khác/)
      .first()
      .waitFor();
    await expectServer(id, winningText, winningRequest.clientRevision);
    assert.equal(headline((await local(reopened, id)).spec), losingText);
    record.reopenedLocal = await local(reopened, id);
    await reopened.screenshot({
      path: path.join(record.dir, 'reopened-conflict.png'),
      fullPage: true,
    });
  });
}
async function lostResponse(t, exhausted = false) {
  const { c, attach, create, go, type, save, step, record, api, local, expectServer } = t,
    id = await create(exhausted ? 'lost-twice' : 'lost-once'),
    p = attach(await c.newPage(), 'retry'),
    firstText = 'P0 committed before response lost',
    newText = 'P0 newer edit after response lost';
  await go(p, id);
  const deliveries = [],
    secondHeld = deferred(),
    releaseSecond = deferred();
  let firstRequest;
  await p.route('**/api/v1/landing-pages/' + id + '/autosave', async (route) => {
    const raw = route.request().postData(),
      body = JSON.parse(raw);
    deliveries.push(raw);
    record.requests.push({ tab: 'retry', raw, body });
    firstRequest ||= body;
    if (deliveries.length <= (exhausted ? 2 : 1)) {
      const upstream = await route.fetch();
      record.responses.push({
        tab: 'upstream-response-dropped',
        request: body,
        response: await upstream.json(),
        status: upstream.status(),
      });
      await route.abort('failed');
      return;
    }
    if (!exhausted && deliveries.length === 2) {
      secondHeld.resolve();
      await releaseSecond.promise;
    }
    await route.continue().catch(() => {});
  });
  await step(
    'Commit through real API, then drop ' + (exhausted ? 'both responses' : 'first response'),
    async () => {
      await type(p, firstText);
      if (!exhausted) await save(p).click();
      if (exhausted) {
        await p
          .getByText(/^Không kết nối được API/)
          .first()
          .waitFor();
        assert.equal(deliveries.length, 2);
      } else await secondHeld.promise;
      await p.waitForFunction(
        ({ key, text }) => {
          const d = JSON.parse(localStorage.getItem(key) || 'null');
          return (
            d?.spec.blocks.find((b) => b.id === 'p0_hero')?.headline === text &&
            d.clientRevision > d.baseRevision
          );
        },
        { key: storageKey(id), text: firstText },
      );
      await expectServer(id, firstText, firstRequest.clientRevision);
      record.unacknowledgedLocal = await local(p, id);
      assert.equal(deliveries[0], deliveries[1]);
    },
  );
  await step(
    'Retry original operation byte-identically, then flush newer edits if any',
    async () => {
      if (exhausted) {
        await type(p, newText);
        await save(p).click();
        await poll(() => deliveries.length >= 4, 'original retry and new operation');
        assert.equal(deliveries[0], deliveries[2]);
        assert.notEqual(JSON.parse(deliveries[3]).requestId, firstRequest.requestId);
        assert.equal(headline(JSON.parse(deliveries[2]).draftSpec), firstText);
      } else releaseSecond.resolve();
      const text = exhausted ? newText : firstText;
      await poll(
        async () =>
          headline((await api('/landing-pages/' + id)).draftSpec) === text &&
          (await local(p, id)) === null,
        'ACK clears only confirmed local',
      );
      const last = JSON.parse(deliveries.at(-1));
      await expectServer(id, text, last.clientRevision);
      assert.equal(await p.locator('[data-lp-save-conflict-toast]').isVisible(), false);
      record.retryBodiesIdentical =
        deliveries[0] === deliveries[1] && (!exhausted || deliveries[0] === deliveries[2]);
    },
  );
  await step(
    'Close/reopen confirmed draft: no false recovery; next save gets new identity',
    async () => {
      const last = await api('/landing-pages/' + id),
        rev = revision(last.draftSpec);
      await p.close();
      const reopened = attach(await c.newPage(), 'reopened');
      await go(reopened, id);
      assert.equal(await t.field(reopened).textContent(), exhausted ? newText : firstText);
      assert.equal(await local(reopened, id), null);
      assert.equal(await reopened.locator('[data-lp-save-conflict-toast]').isVisible(), false);
      let body;
      await reopened.route('**/api/v1/landing-pages/' + id + '/autosave', async (r) => {
        body = JSON.parse(r.request().postData());
        record.requests.push({ tab: 'reopened', body });
        await r.continue();
      });
      await type(reopened, 'P0 next operation after reopen');
      await save(reopened).click();
      await poll(
        async () =>
          headline((await api('/landing-pages/' + id)).draftSpec) ===
          'P0 next operation after reopen',
        'new save',
      );
      assert.notEqual(body.requestId, firstRequest.requestId);
      assert.equal(body.baseRevision, rev);
      await expectServer(id, 'P0 next operation after reopen', body.clientRevision);
    },
  );
}
async function legacyCollision(t) {
  const { create, api, step, record, expectServer } = t,
    id = await create('legacy-id'),
    initial = await api('/landing-pages/' + id),
    base = revision(initial.draftSpec),
    body = {
      draftSpec: makeSpec('P0 A receipt'),
      name: initial.name,
      baseRevision: base,
      clientRevision: base + 1,
      requestId: 'lp-as-1',
    };
  await step('Legacy colliding ID is bound to payload/base/name', async () => {
    const first = await api('/landing-pages/' + id + '/autosave', 'POST', body),
      different = await api('/landing-pages/' + id + '/autosave', 'POST', {
        ...body,
        draftSpec: makeSpec('P0 B collision'),
      }),
      retry = await api('/landing-pages/' + id + '/autosave', 'POST', body);
    record.legacy = { body, first, different, retry };
    assert.equal(first.rejected, false);
    assert.equal(different.rejected, true);
    assert.equal(different.reason, 'STALE_REVISION');
    assert.equal(retry.rejected, false);
    await expectServer(id, 'P0 A receipt', base + 1);
  });
  await step('Same revision cannot prove different content saved', async () => {
    const mismatch = await api('/landing-pages/' + id + '/autosave', 'POST', {
      ...body,
      requestId: 'different-operation',
      baseRevision: base + 1,
      draftSpec: makeSpec('P0 unconfirmed same revision'),
    });
    record.unchangedMismatch = mismatch;
    assert.equal(mismatch.rejected, true);
    await expectServer(id, 'P0 A receipt', base + 1);
  });
}
async function lostResponseOtherWriter(t) {
  const { c, attach, context, create, go, type, save, step, api, local, expectServer, record } = t;
  const id = await create('lost-other-writer'),
    a = attach(await c.newPage(), 'A');
  const other = (await context(true)).c,
    b = attach(await other.newPage(), 'B');
  await go(a, id);
  await go(b, id);
  const release = deferred();
  let original, retry;
  let count = 0;
  await a.route('**/api/v1/landing-pages/' + id + '/autosave', async (route) => {
    const raw = route.request().postData(),
      body = JSON.parse(raw);
    record.requests.push({ tab: 'A', raw, body });
    if (++count === 1) {
      original = body;
      const response = await route.fetch();
      record.responses.push({
        tab: 'A-response-dropped',
        request: body,
        response: await response.json(),
        status: response.status(),
      });
      await route.abort('failed');
    } else {
      retry = body;
      assert.equal(raw, record.requests[0].raw);
      await release.promise;
      await route.continue().catch(() => {});
    }
  });
  const textA = 'P0 A awaiting receipt',
    textB = 'P0 B confirmed newer server';
  await step('A commits, loses response, and retains the exact pending retry', async () => {
    await type(a, textA);
    await save(a).click();
    await poll(() => retry, 'A retry held');
    await a.waitForFunction((key) => {
      const d = JSON.parse(localStorage.getItem(key) || 'null');
      return d?.clientRevision > d?.baseRevision;
    }, storageKey(id));
    await expectServer(id, textA, original.clientRevision);
  });
  await step('B reloads latest revision and saves through the actual Builder', async () => {
    await b.reload({ waitUntil: 'domcontentloaded' });
    await t.field(b).waitFor();
    assert.equal(await t.field(b).textContent(), textA);
    await type(b, textB);
    await save(b).click();
    await poll(
      async () => headline((await api('/landing-pages/' + id)).draftSpec) === textB,
      'B committed',
    );
  });
  await step('Old retry must conflict without rebasing or replacing B', async () => {
    const before = await api('/landing-pages/' + id);
    release.resolve();
    await a.locator('[data-lp-save-conflict-toast]').waitFor();
    await expectServer(id, textB, revision(before.draftSpec));
    const draft = await local(a, id);
    assert.equal(headline(draft.spec), textA);
    assert.equal(draft.baseRevision, original.baseRevision);
    assert.equal(draft.clientRevision, original.clientRevision);
    assert.ok(draft.clientRevision <= revision(before.draftSpec));
    record.loserLocal = draft;
    await a.screenshot({ path: path.join(record.dir, 'old-retry-conflict.png'), fullPage: true });
  });
  await step('Close/reopen A preserves local even when server revision is higher', async () => {
    await a.close();
    const reopened = attach(await c.newPage(), 'A-reopened');
    await go(reopened, id);
    await reopened.locator('[data-lp-save-conflict-toast]').waitFor();
    assert.equal(await t.field(reopened).textContent(), textB);
    const draft = await local(reopened, id);
    assert.equal(headline(draft.spec), textA);
    assert.equal(draft.baseRevision, original.baseRevision);
    assert.equal(draft.clientRevision, original.clientRevision);
    record.reopenedLocal = draft;
    await expectServer(id, textB, revision(db(id).draft));
  });
}
const cases = {
  'lost-response-other-writer': lostResponseOtherWriter,
  'same-revision-tabs': (t) => twoTabs(t),
  'concurrent-tabs': (t) => twoTabs(t, { concurrent: true }),
  'separate-sessions': (t) => twoTabs(t, { separate: true }),
  'lost-response-retry': (t) => lostResponse(t),
  'exhausted-response-retry': (t) => lostResponse(t, true),
  'legacy-id-collision-api': legacyCollision,
};
(async () => {
  const browser = await chromium.launch({ headless: true }),
    results = [];
  try {
    for (const name of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(cases)) {
      assert.ok(cases[name]);
      const t = await setup(browser, name);
      let status = 'PASS',
        error;
      try {
        await cases[name](t);
      } catch (e) {
        error = e;
        const state = JSON.parse(
          cp.execFileSync(
            'docker',
            ['inspect', cfg.prefix + '-web', '--format', '{{json .State}}'],
            { encoding: 'utf8' },
          ),
        );
        t.record.webStateAtFailure = state;
        status = state.OOMKilled || !state.Running ? 'BLOCKED' : 'FAIL';
      }
      const row = await t.finish(status, error);
      results.push(row);
      console.log(JSON.stringify(row));
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(cfg.artifactDir, 'results.json'), JSON.stringify(results, null, 2));
  }
  process.exitCode = results.some((x) => x.status === 'FAIL')
    ? 1
    : results.some((x) => x.status === 'BLOCKED')
      ? 2
      : 0;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
