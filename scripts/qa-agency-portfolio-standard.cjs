const fs = require('fs'),
  path = require('path'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const BASE = process.env.AGENCY_QA_URL || 'http://127.0.0.1:32941';
const OUT = process.env.AGENCY_QA_OUT || '/mnt/data/agency-portfolio-implementation';
fs.mkdirSync(OUT, { recursive: true });
const seed = shared.getLandingPageSystemTemplate('agency-portfolio').spec;
const widths = [375, 390, 768, 1024, 1440, 1920];
const results = process.env.AGENCY_QA_TAIL_ONLY
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'browser-failure.json'))).results
  : [];
const errors = [];
const ready = async (p) => {
  await p.waitForSelector('[data-lp-renderer]');
  await p.waitForFunction(() => typeof window.agencyPilotSetSpec === 'function');
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
};
async function context(browser) {
  const c = await browser.newContext();
  let stored = structuredClone(seed),
    leadReply = { status: 200, body: { ok: true, leadId: 'local-fixture-only' } },
    leadDelay = 0,
    leadCount = 0,
    leadBodies = [],
    events = 0,
    saves = 0;
  await c.route('**/api/v1/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      body = JSON.parse(req.postData() || '{}');
    if (url.pathname.endsWith('/lead')) {
      leadCount++;
      leadBodies.push(body);
      if (leadDelay) await new Promise((r) => setTimeout(r, leadDelay));
      if (leadReply.abort) return route.abort();
      return route.fulfill({
        status: leadReply.status,
        contentType: 'application/json',
        body: typeof leadReply.body === 'string' ? leadReply.body : JSON.stringify(leadReply.body),
      });
    }
    if (url.pathname.endsWith('/events')) events++;
    if (url.pathname.includes('/autosave') || req.method() === 'PATCH') {
      if (body.draftSpec) {
        stored = shared.sanitizeLandingPagePersistSpec(body.draftSpec);
        saves++;
      }
    }
    let json =
      url.pathname === '/api/v1/auth/me'
        ? { id: 'local-qa', role: 'ADMIN', organizationId: 'local-only', email: 'qa@example.test' }
        : url.pathname.includes('/landing-pages/agency-pilot-local')
          ? {
              id: 'agency-pilot-local',
              name: 'Agency Pilot QA',
              slug: 'agency-pilot-local',
              status: 'DRAFT',
              draftSpec: stored,
              clientRevision: stored.meta?.clientRevision || 0,
              requestId: body.requestId || null,
              updatedAt: new Date().toISOString(),
              rejected: false,
            }
          : { items: [], ok: true };
    return route.fulfill({ status: 200, json });
  });
  await c.route('https://**/*', (r) => r.abort());
  await c.addInitScript(() =>
    localStorage.setItem(
      'ms_access_token',
      'x.' + btoa(JSON.stringify({ exp: 1999999999 })) + '.x',
    ),
  );
  return {
    c,
    get stored() {
      return stored;
    },
    set stored(v) {
      stored = v;
    },
    get saves() {
      return saves;
    },
    get leads() {
      return leadCount;
    },
    get bodies() {
      return leadBodies;
    },
    get events() {
      return events;
    },
    reply: (status, body, delay = 0) => {
      leadReply = { status, body };
      leadDelay = delay;
    },
    abort: () => {
      leadReply = { abort: true };
    },
  };
}
async function metrics(p) {
  return p
    .locator('[data-lp-renderer]')
    .first()
    .evaluate((root) => {
      const q = (s) => root.querySelector(s),
        rect = (s) => q(s)?.getBoundingClientRect().toJSON();
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        canvasWidth: root.getBoundingClientRect().width,
        height: root.scrollHeight,
        heroColumns: getComputedStyle(q('.hero-grid')).gridTemplateColumns.split(' ').length,
        gallery: q('.work-grid')?.querySelectorAll('.work-card').length,
        steps: q('.steps')?.querySelectorAll('.step').length,
        plans: q('.pricing-grid')?.querySelectorAll('.price-card').length,
        formFields: q('form')?.querySelectorAll('input,textarea').length,
        hero: rect('.hero'),
        galleryCard: rect('.work-card'),
        pricingCard: rect('.price-card'),
        form: rect('form'),
        colors: ['.benefit-card p', '.faq details p', '.price-card.dark li', 'form label'].map(
          (s) => [s, getComputedStyle(q(s)).color],
        ),
        missingImages: [...root.querySelectorAll('img')].filter(
          (i) => !i.complete || !i.naturalWidth,
        ).length,
      };
    });
}
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const surface of process.env.AGENCY_QA_TAIL_ONLY ? [] : ['renderer', 'preview', 'public']) {
    const state = await context(browser),
      p = await state.c.newPage();
    p.on('pageerror', (e) => errors.push(surface + ': ' + e.message));
    for (const width of widths) {
      await p.setViewportSize({ width, height: 900 });
      if (width === widths[0])
        await p.goto(BASE + '/lp-agency-pilot?surface=' + surface, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
      await ready(p);
      await p.waitForTimeout(150);
      const m = await metrics(p);
      assert.equal(m.documentWidth, width, surface + ' horizontal overflow ' + width);
      assert.equal(m.gallery, 4);
      assert.equal(m.steps, 4);
      assert.equal(m.plans, 2);
      assert.equal(m.formFields, 4);
      assert.equal(m.missingImages, 0);
      if (width < 1024) assert.equal(m.heroColumns, 1);
      assert(m.pricingCard.width > Math.min(300, width - 80), 'Pricing card should fill cell');
      if (width === 1440 || width === 390)
        await p.screenshot({ path: path.join(OUT, `${surface}-${width}.png`), fullPage: true });
      if (width < 768) {
        await p.locator('.menu-toggle').click();
        const vertical = await p.locator('.mobile-nav').evaluate((nav) => {
          const rects = [...nav.querySelectorAll('a')].map((x) => x.getBoundingClientRect());
          return rects.every((r, i) => !i || r.top >= rects[i - 1].bottom - 1);
        });
        assert(vertical);
        await p.locator('.mobile-nav a').first().click();
        assert.equal(await p.locator('.mobile-nav').count(), 0);
        await p.locator('.menu-toggle').click();
        await p.locator('.mobile-nav a').first().focus();
        await p.keyboard.press('Escape');
        await p.waitForFunction(() => !document.querySelector('.mobile-nav'));
        await p.locator('.menu-toggle').click();
        await p.setViewportSize({ width: 1024, height: 900 });
        await p.waitForFunction(() => !document.querySelector('.mobile-nav'));
        await p.setViewportSize({ width, height: 900 });
      }
      results.push({ surface, ...m });
      console.log('PASS', surface, width);
    }
    if (surface !== 'renderer') {
      await p.setViewportSize({ width: 390, height: 900 });
      await p.goto(BASE + '/lp-agency-pilot?surface=' + surface);
      await ready(p);
      await p.locator('form button[type=submit]').click();
      assert.equal(await p.locator('[data-lp-field-error]').count(), 2);
      await p.locator('input[name=name]').fill('Nguyễn Thị Ánh Dương');
      await p.locator('input[name=phone]').fill('+84 912 345 678');
      assert(
        await p.locator('form').evaluate((e) => e.checkValidity()),
        'Valid Vietnamese name/phone rejected',
      );
      if (surface === 'preview') {
        await p.locator('form button[type=submit]').click();
        await p.waitForSelector('.agency-form-success');
        assert.equal(state.leads, 0);
        assert.equal(state.events, 0);
        results.push({
          surface,
          form: 'validation + simulated success; zero API leads or analytics',
        });
      } else {
        for (const response of [
          { status: 200, body: {} },
          { status: 500, body: { message: 'Thông báo lỗi dài có dấu tiếng Việt. '.repeat(30) } },
          { status: 429, body: { ok: false, message: 'Vui lòng thử lại sau.' } },
          { status: 200, body: { ok: false, message: 'Chưa tiếp nhận yêu cầu.' } },
          { status: 200, body: 'invalid json' },
        ]) {
          state.reply(response.status, response.body);
          await p.locator('form button[type=submit]').click();
          await p.locator('form [data-lp-form-error]').waitFor();
          assert.equal(await p.locator('.agency-form-success').count(), 0);
          assert.equal(await p.locator('input[name=name]').inputValue(), 'Nguyễn Thị Ánh Dương');
          assert.equal(await p.evaluate(() => document.documentElement.scrollWidth), 390);
        }
        state.abort();
        await p.locator('form button[type=submit]').click();
        await p.locator('form [data-lp-form-error]').waitFor();
        await p.locator('.price-card.dark .btn').click();
        await p.locator('.agency-selection').waitFor();
        state.reply(200, { ok: true, leadId: 'local-fixture-only' }, 600);
        await p.locator('form button[type=submit]').click();
        assert(await p.locator('form button[type=submit]').isDisabled());
        assert.equal(await p.locator('.agency-form-success').count(), 0);
        await p.locator('.agency-form-success').waitFor();
        assert.equal(state.bodies.at(-1).fields.cooperation, 'Theo tháng');
        results.push({
          surface,
          form: '200 missing ok, 500 long error, 429, ok:false, invalid JSON and network error stay unsuccessful and retain inputs; delayed ok:true alone succeeds; chosen plan included',
          endpoint: 'Mocked existing lead contract, no database write',
        });
      }
    }
    await state.c.close();
  }
  // Long content, image fallback, customization precedence, responsive overrides, and version fallback.
  const state = await context(browser),
    p = await state.c.newPage();
  await p.goto(BASE + '/lp-agency-pilot?surface=renderer');
  await ready(p);
  let changed = structuredClone(seed);
  changed.blocks[1].headline = 'Một đối tác cùng triển khai dự án tiếng Việt. '.repeat(12);
  changed.blocks[1].imageUrl = '/missing-pilot-photo.jpg';
  changed.blocks[4].items[0].description = 'Đầu ra dài, đầy đủ dấu tiếng Việt và ngữ cảnh. '.repeat(
    30,
  );
  await p.evaluate((spec) => window.agencyPilotSetSpec(spec), changed);
  await p.locator('[data-lp-img-fallback]').waitFor({ timeout: 30000 });
  for (const width of [375, 390, 1920]) {
    await p.setViewportSize({ width, height: 900 });
    await p.waitForTimeout(100);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth), width);
    assert((await p.locator('[data-lp-img-fallback]').count()) > 0);
  }
  changed = structuredClone(seed);
  changed.meta.inlineTextStyles = { 'agency-hero::headline': { color: '#123456', fontSize: 41 } };
  changed.blocks[1].style = { elementCustomCss: { headline: 'color: #ff0000 !important;' } };
  await p.evaluate((spec) => window.agencyPilotSetSpec(spec), changed);
  await p.waitForTimeout(100);
  assert.equal(await p.locator('h1').evaluate((e) => getComputedStyle(e).color), 'rgb(255, 0, 0)');
  for (const version of [null, 'unrecognized-future']) {
    changed = structuredClone(seed);
    if (version) changed.meta.rendererVersion = version;
    else delete changed.meta.rendererVersion;
    await p.evaluate((spec) => window.agencyPilotSetSpec(spec), changed);
    await p.waitForTimeout(100);
    assert.equal(await p.locator('[data-lp-renderer]').getAttribute('data-lp-renderer'), 'legacy');
  }
  results.push({
    runtime:
      'Long Vietnamese content + missing image at 375/390/1920; Custom CSS precedence; missing/unknown renderer -> legacy',
    ok: true,
  });
  await state.c.close();
  fs.writeFileSync(
    path.join(OUT, 'browser-results.json'),
    JSON.stringify({ results, errors }, null, 2),
  );
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('ALL', results.length, 'runtime checks completed');
})().catch((e) => {
  console.error(e);
  fs.writeFileSync(
    path.join(OUT, 'browser-failure.json'),
    JSON.stringify({ message: e.message, results, errors }, null, 2),
  );
  process.exit(1);
});
