#!/usr/bin/env node
// Real mouse drags in Next Builder, isolated Nest API/PostgreSQL. No production writes.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const cfg = JSON.parse(fs.readFileSync(process.env.LP_TEXT_QA_CONFIG));
assert.equal(new URL(cfg.origin).hostname, '127.0.0.1');
assert.match(cfg.api, /^http:\/\/172\./);
assert.match(cfg.network, /^lp-text-qa/);
const network = JSON.parse(
  cp.execFileSync('docker', ['network', 'inspect', cfg.network], { encoding: 'utf8' }),
)[0];
assert.equal(network.Internal, true);
assert(
  Object.values(network.Containers).some(
    (c) => c.IPv4Address.split('/')[0] === new URL(cfg.api).hostname,
  ),
  'API must belong to the isolated QA network',
);
let token;
const out = cfg.out;
fs.mkdirSync(out, { recursive: true });
const report = {
  scope: 'Real Next Builder + Nest API + PostgreSQL, internal Docker QA network',
  steps: [],
  errors: [],
  writes: [],
};
let browser, page, context, seed, heroId, benefitId, lastDropId;
async function api(p, body, method = 'GET') {
  const r = await fetch(cfg.api + '/api/v1' + p, {
    method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const v = await r.json();
  assert(r.ok, JSON.stringify(v));
  return v.data ?? v;
}
const get = () => api('/landing-pages/' + cfg.pageId);
async function poll(fn, label) {
  for (let i = 0; i < 100; i++) {
    const r = await fn();
    if (r) return r;
    await page.waitForTimeout(100);
  }
  throw Error('Timed out: ' + label);
}
async function step(name, fn) {
  const r = { name, status: 'RUNNING' };
  report.steps.push(r);
  try {
    await fn();
    r.status = 'PASS';
    console.log('PASS', name);
  } catch (e) {
    r.status = 'FAIL';
    r.error = e.message;
    throw e;
  }
}
const host = (id) => page.locator('[data-lp-section-chrome="1"][data-lp-block-id="' + id + '"]');
const element = (id) =>
  page.locator('[data-lp-section-element="1"][data-lp-block-id="' + id + '"]');
async function latestChild() {
  return poll(async () => {
    const s = (await get()).draftSpec;
    return s.blocks.find((b) => b.id === lastDropId);
  }, 'saved child');
}
async function reset(spec = seed) {
  if (page) await page.close();
  await api(
    '/landing-pages/' + cfg.pageId,
    { draftSpec: JSON.parse(JSON.stringify(spec)) },
    'PATCH',
  );
  await context.clearCookies();
  page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  await page.goto(cfg.origin + '/landing-pages/builder/' + cfg.pageId, {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  });
  await page.locator('[data-lp-canvas-root]').waitFor({ timeout: 120000 });
  const discard = page.getByRole('button', { name: 'Tải bản mới nhất', exact: true });
  if (await discard.isVisible()) await discard.click();
  await host(heroId).waitFor();
}
async function addPanel() {
  const tile = page.locator('[data-lp-add-component-card="text"]');
  if (!(await tile.isVisible()))
    await page.locator('[data-lp-inspector-rail-btn="add-components"]').click();
  const tab = page.locator('[data-lp-add-root-tab="add"]');
  if (await tab.isVisible()) await tab.click();
  await tile.waitFor();
  return tile;
}
async function drag(id, location = 'body', options = {}) {
  const oldIds = new Set((await get()).draftSpec.blocks.map((b) => b.id));
  if (!options.source) await page.keyboard.press('Escape');
  let source = options.source || (await addPanel());
  await source.scrollIntoViewIfNeeded();
  let s = await source.boundingBox();
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.mouse.move(s.x + s.width / 2 - 25, s.y + s.height / 2, { steps: 6 });
  await host(id).scrollIntoViewIfNeeded();
  const p = await host(id).evaluate(
    (h, { location, index }) => {
      const r = h.getBoundingClientRect();
      let x = r.left + r.width / 2,
        y = r.top + Math.min(r.height / 2, 180);
      let cells = Array.from(
        h.querySelectorAll('[data-lp-content-columns] > [data-lp-content-column]'),
      );
      if (!cells.length) cells = Array.from(h.querySelector('[data-lp-hero-grid]')?.children || []);
      if (location === 'left') x = r.left + 6;
      if (location === 'right') x = r.right - 6;
      if (location === 'gap') {
        const a = cells[index - 1].getBoundingClientRect(),
          b = cells[index].getBoundingClientRect();
        x = (a.right + b.left) / 2;
        y = Math.max(a.top, b.top) + 30;
      }
      if (location === 'column') {
        let c = cells[index].getBoundingClientRect();
        if (c.width < 1 || c.height < 1) {
          const g = h.querySelector('[data-lp-hero-grid]').getBoundingClientRect();
          c = {
            left: g.left + (index * g.width) / cells.length,
            top: g.top,
            width: g.width / cells.length,
            height: g.height,
          };
        }
        x = c.left + c.width / 2;
        y = c.top + Math.min(c.height / 2, 35);
      }
      return { x, y };
    },
    { location, index: options.index ?? 1 },
  );
  await page.mouse.move(p.x, p.y, { steps: 22 });
  await page.mouse.move(p.x + 1, p.y + 1);
  const marker = page.locator('[data-lp-sidebar-drop-indicator]');
  await marker.waitFor();
  assert.equal(await marker.getAttribute('data-lp-drop-section'), id);
  const color = await marker
    .locator('[data-lp-drop-line]')
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(['rgb(0, 0, 0)', 'rgb(255, 255, 255)'].includes(color));
  if (options.cancel) {
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await marker.waitFor({ state: 'detached' });
    return;
  }
  await page.mouse.up();
  await marker.waitFor({ state: 'detached' });
  assert.equal(
    await page.locator('[data-lp-element-library-modal]').count(),
    0,
    'Text tile inserts without modal',
  );
  const child = await poll(
    async () => (await get()).draftSpec.blocks.find((b) => !oldIds.has(b.id)),
    'drop autosave',
  );
  lastDropId = child.id;
}
async function visibleText(id) {
  const n = element(id).locator('[data-lp-element-id="' + id + '::subheadline"]');
  await n.waitFor();
  const result = await n.evaluate((n) => {
    const r = n.getBoundingClientRect(),
      w = (n.closest('[data-lp-inline-wrap]') || n).getBoundingClientRect(),
      s = getComputedStyle(n);
    return {
      text: n.textContent,
      display: s.display,
      color: s.color,
      width: r.width,
      height: r.height,
      inFrame: r.left >= w.left - 1 && r.top >= w.top - 1 && r.right <= w.right + 1,
      overflow: s.overflow,
    };
  });
  assert(result.text?.trim());
  assert.notEqual(result.display, 'none');
  assert(result.width > 10 && result.height > 5);
  assert(result.inFrame, JSON.stringify(result));
  report.lastText = result;
  return n;
}
async function columns(id, count, placements) {
  await poll(
    async () =>
      (await host(id).locator('[data-lp-content-columns] > [data-lp-content-column]').count()) ===
      count,
    'DOM column count ' + count,
  );
  const s = await poll(async () => {
    const s = (await get()).draftSpec;
    return shared.readContentColumns(s.blocks.find((b) => b.id === id).style) === count ? s : null;
  }, 'saved column count');
  for (const [bid, index] of placements) {
    assert.equal(s.blocks.find((b) => b.id === bid).sectionPlacement.columnIndex, index);
    assert.equal(
      await element(bid).evaluate((n) =>
        Number(n.closest('[data-lp-content-column]').dataset.lpContentColumn),
      ),
      index,
    );
    await visibleText(bid);
  }
}
async function undoRedo(id, count, placements, previousCount) {
  await page.keyboard.press('Escape');
  await page.locator('[data-lp-toolbar-btn="undo"]').click();
  await poll(
    async () =>
      (await host(id).locator('[data-lp-content-columns] > [data-lp-content-column]').count()) ===
      previousCount,
    'Undo DOM columns',
  );
  await page.locator('[data-lp-toolbar-btn="redo"]').click();
  await poll(
    async () => (await get()).draftSpec.blocks.some((b) => b.id === placements.at(-1)[0]),
    'Redo saved',
  );
  await columns(id, count, placements);
}
(async () => {
  const auth = JSON.parse(fs.readFileSync(cfg.authFile));
  assert.match(auth.email, /@example\.invalid$/);
  const login = await api('/auth/login', auth, 'POST');
  token = login.accessToken;
  assert(token);
  seed = shared.createBlankLandingPageSpec();
  heroId = seed.blocks.find((b) => b.type === 'Hero').id;
  const hero = seed.blocks.find((b) => b.id === heroId);
  hero.background = '#79b18b';
  hero.style = { ...hero.style, lpSectionSettings: true, minHeight: '400px' };
  const benefits = {
    type: 'Benefits',
    enabled: true,
    id: 'qa-benefits',
    headline: 'Benefits nền trắng',
    subheadline: 'Nội dung có sẵn',
    items: [],
    background: '#ffffff',
    style: { minHeight: '300px' },
  };
  benefitId = benefits.id;
  seed.blocks.splice(2, 0, benefits);
  seed.meta = {
    ...seed.meta,
    elementHidden: { [heroId + '::image']: true, [heroId + '::subheadline']: true },
  };
  browser = await chromium.launch({ executablePath: cfg.browser, args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 1600, height: 1050 } });
  await context.addInitScript((t) => {
    localStorage.clear();
    localStorage.setItem('ms_access_token', t);
    localStorage.setItem('mkspa.mainSidebarCollapsed', '1');
  }, token);
  await context.route('**/*', async (route) => {
    const req = route.request(),
      u = new URL(req.url());
    if (u.pathname.startsWith('/api/v1/')) {
      if (!['GET', 'HEAD'].includes(req.method()))
        report.writes.push({ method: req.method(), path: u.pathname });
      return route.fulfill({
        response: await route.fetch({ url: cfg.api + u.pathname + u.search }),
      });
    }
    if (u.origin !== cfg.origin) return route.fulfill({ status: 200, body: '' });
    return route.continue();
  });
  await step(
    'Hidden Hero subheadline does not hide inserted paragraph; inline edit saves immediately',
    async () => {
      await reset();
      await drag(heroId);
      const child = await latestChild();
      assert.equal(child.sectionPlacement.sectionId, heroId);
      const n = await visibleText(child.id);
      assert.equal(
        await host(heroId)
          .locator('[data-lp-element-id="' + heroId + '::subheadline"]')
          .evaluate((n) => getComputedStyle(n).display),
        'none',
      );
      await n.dblclick();
      await page.locator('[data-lp-inline-editing="1"]').fill('Chữ trên Hero sửa trực tiếp');
      await page.keyboard.press('Tab');
      await poll(
        async () =>
          (await get()).draftSpec.blocks.find((b) => b.id === child.id)?.subheadline ===
          'Chữ trên Hero sửa trực tiếp',
        'inline edit saved',
      );
      await page.screenshot({
        path: path.join(out, 'hero-visible-inline-edit.png'),
        fullPage: true,
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await visibleText(child.id);
    },
  );
  for (const side of ['left', 'right'])
    await step(
      'Single column ' + side + ': new paragraph stays in new column; Undo/Redo/reload',
      async () => {
        await reset();
        await drag(heroId, side);
        const child = await latestChild(),
          index = side === 'left' ? 0 : 1;
        await columns(heroId, 2, [[child.id, index]]);
        const h = (await get()).draftSpec.blocks.find((b) => b.id === heroId);
        assert.equal(h.style.lpNativeColumnIndex, side === 'left' ? 1 : 0);
        await undoRedo(heroId, 2, [[child.id, index]], 0);
        for (let i = 0; i < 2; i++) {
          await page.reload({ waitUntil: 'domcontentloaded' });
          await columns(heroId, 2, [[child.id, index]]);
        }
        await page.screenshot({ path: path.join(out, 'split-' + side + '.png'), fullPage: true });
      },
    );
  await step(
    'Benefits: right then gap creates exactly one column; empty/body drops use existing column',
    async () => {
      await reset();
      await drag(benefitId, 'right');
      const right = await latestChild();
      await columns(benefitId, 2, [[right.id, 1]]);
      await drag(benefitId, 'gap', { index: 1 });
      const mid = await latestChild();
      await columns(benefitId, 3, [
        [right.id, 2],
        [mid.id, 1],
      ]);
      await undoRedo(
        benefitId,
        3,
        [
          [right.id, 2],
          [mid.id, 1],
        ],
        2,
      );
      await drag(benefitId, 'column', { index: 1 });
      const body = await latestChild();
      await columns(benefitId, 3, [
        [right.id, 2],
        [mid.id, 1],
        [body.id, 1],
      ]);
      // Existing layout with a truly empty middle cell, persisted then reloaded.
      const empty = (await get()).draftSpec;
      empty.blocks = empty.blocks.filter((b) => b.id !== mid.id && b.id !== body.id);
      await reset(empty);
      assert.equal(await host(benefitId).locator('[data-lp-content-column="1"]').innerText(), '');
      await drag(benefitId, 'column', { index: 1 });
      const inEmpty = await latestChild();
      await columns(benefitId, 3, [
        [right.id, 2],
        [inEmpty.id, 1],
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await columns(benefitId, 3, [
        [right.id, 2],
        [inEmpty.id, 1],
      ]);
      await page.screenshot({ path: path.join(out, 'benefits-gap-empty.png'), fullPage: true });
    },
  );
  await step(
    'Text library: native drag of a specific preset and click selection remain usable',
    async () => {
      await reset();
      await addPanel();
      await page.locator('[data-lp-open-text-library]').click();
      await page.locator('[data-lp-text-tab="paragraph"]').click();
      const preset = page.locator('[data-lp-paragraph-preset]').first();
      await drag(heroId, 'body', { source: preset });
      const d = await latestChild();
      await visibleText(d.id);
      await addPanel();
      await page.locator('[data-lp-open-text-library]').click();
      await page.locator('[data-lp-text-tab="paragraph"]').click();
      const before = (await get()).draftSpec.blocks.length;
      await page.locator('[data-lp-paragraph-preset]').first().click();
      const s = await poll(async () => {
        const s = (await get()).draftSpec;
        return s.blocks.length === before + 1 ? s : null;
      }, 'library click saves one block');
      const b = s.blocks.find((b) => !seed.blocks.some((x) => x.id === b.id) && b.id !== d.id);
      const n = page
        .locator('[data-lp-block-id="' + b.id + '"] [data-lp-inline-field="subheadline"]')
        .first();
      await n.waitFor();
      assert.notEqual(await n.evaluate((n) => getComputedStyle(n).display), 'none');
    },
  );
  await step('Escape and outside drop clear marker and add nothing', async () => {
    await reset();
    await drag(heroId, 'body', { cancel: true });
    assert.equal((await get()).draftSpec.blocks.length, seed.blocks.length);
    const tile = await addPanel(),
      b = await tile.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x - 30, b.y, { steps: 8 });
    await page.mouse.move(40, 150, { steps: 12 });
    await page.mouse.up();
    assert.equal(await page.locator('[data-lp-sidebar-drop-indicator]').count(), 0);
    assert.equal((await get()).draftSpec.blocks.length, seed.blocks.length);
  });
  await step(
    'Existing native split: drop in right body then gap preserves native content positions',
    async () => {
      const s = JSON.parse(JSON.stringify(seed));
      delete s.meta.rendererVersion;
      const h = s.blocks.find((b) => b.id === heroId);
      h.variant = 'split';
      h.imageUrl = '/landing-page-assets/blank/placeholder.svg';
      await reset(s);
      await drag(heroId, 'column', { index: 1 });
      const inNative = await latestChild();
      await columns(heroId, 2, [[inNative.id, 1]]);
      await drag(heroId, 'right');
      const child = await latestChild();
      // Right edge adds one column to the two native columns.
      await columns(heroId, 3, [[child.id, 2]]);
      assert.deepEqual(
        (await get()).draftSpec.blocks.find((b) => b.id === heroId).style.lpNativeColumnIndices,
        [0, 1],
      );
      await drag(heroId, 'gap', { index: 1 });
      const mid = await latestChild();
      await columns(heroId, 4, [
        [child.id, 3],
        [mid.id, 1],
      ]);
      assert.deepEqual(
        (await get()).draftSpec.blocks.find((b) => b.id === heroId).style.lpNativeColumnIndices,
        [0, 2],
      );
      await page.reload({ waitUntil: 'domcontentloaded' });
      await columns(heroId, 4, [
        [child.id, 3],
        [mid.id, 1],
      ]);
    },
  );
  await step(
    'Preview + isolated public route + mobile preserve saved columns and readable text',
    async () => {
      await reset();
      await drag(heroId, 'left');
      const child = await latestChild();
      await columns(heroId, 2, [[child.id, 0]]);
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      await page.locator('[data-lp-toolbar-btn="mobile"]').click();
      await poll(async () => {
        const cells = host(heroId).locator('[data-lp-content-columns] > [data-lp-content-column]');
        const a = await cells.nth(0).boundingBox(),
          b = await cells.nth(1).boundingBox();
        return a && b && Math.abs(a.x - b.x) < 2 && b.y >= a.y + a.height - 2;
      }, 'Builder mobile stacks columns');
      await visibleText(child.id);
      await page.screenshot({ path: path.join(out, 'builder-mobile.png'), fullPage: true });
      await page.locator('[data-lp-toolbar-btn="desktop"]').click();
      await page.getByRole('switch').first().click();
      await visibleText(child.id);
      await page.screenshot({ path: path.join(out, 'preview.png'), fullPage: true });
      await api('/landing-pages/' + cfg.pageId + '/publish', {}, 'POST');
      const saved = await get();
      assert(saved.publishedSpec);
      assert.equal(
        saved.publishedSpec.blocks.find((b) => b.id === child.id).sectionPlacement.columnIndex,
        0,
      );
      await page.goto(cfg.origin + '/p/' + saved.slug, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      });
      await visibleText(child.id);
      await page.screenshot({ path: path.join(out, 'public-desktop.png'), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await visibleText(child.id);
      const cells = host(heroId).locator('[data-lp-content-columns] > [data-lp-content-column]');
      const a = await cells.nth(0).boundingBox(),
        b = await cells.nth(1).boundingBox();
      assert(Math.abs(a.x - b.x) < 2 && b.y >= a.y + a.height - 2, JSON.stringify({ a, b }));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(out, 'public-mobile.png'), fullPage: true });
    },
  );
  assert.deepEqual(report.errors, []);
  report.passed = true;
})()
  .catch(async (e) => {
    console.error(e);
    report.error = e.stack;
    if (page)
      await page
        .screenshot({ path: path.join(out, 'failure.png'), fullPage: true })
        .catch(() => {});
    process.exitCode = 1;
  })
  .finally(async () => {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    if (browser) await browser.close();
  });
