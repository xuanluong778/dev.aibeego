const fs = require('fs'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const BASE = process.env.AGENCY_QA_URL || 'http://127.0.0.1:32941',
  OUT = '/mnt/data/agency-portfolio-implementation';
const poll = async (fn) => {
  for (let i = 0; i < 60; i++) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error('Persisted state condition timed out');
};
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const c = await browser.newContext();
  let saved = structuredClone(shared.getLandingPageSystemTemplate('agency-portfolio').spec),
    writes = 0;
  const errors = [],
    results = [];
  await c.route('https://**/*', (r) => r.abort());
  await c.route('**/api/v1/**', async (route) => {
    const req = route.request(),
      u = new URL(req.url()),
      body = JSON.parse(req.postData() || '{}');
    if ((u.pathname.includes('autosave') || req.method() === 'PATCH') && body.draftSpec) {
      saved = shared.sanitizeLandingPagePersistSpec(body.draftSpec);
      writes++;
    }
    let json =
      u.pathname === '/api/v1/auth/me'
        ? { id: 'qa', role: 'ADMIN', organizationId: 'local-only', email: 'qa@example.test' }
        : u.pathname.includes('/landing-pages/agency-pilot-local')
          ? {
              id: 'agency-pilot-local',
              name: 'Agency Pilot QA',
              slug: 'agency-pilot-local',
              status: 'DRAFT',
              draftSpec: saved,
              clientRevision: saved.meta?.clientRevision || 0,
              requestId: body.requestId || null,
              updatedAt: new Date().toISOString(),
              rejected: false,
            }
          : { items: [], ok: true };
    await route.fulfill({ status: 200, json });
  });
  await c.addInitScript(() =>
    localStorage.setItem(
      'ms_access_token',
      'x.' + btoa(JSON.stringify({ exp: 1999999999 })) + '.x',
    ),
  );
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto(BASE + '/lp-agency-pilot?surface=builder', { timeout: 90000 });
  await p.waitForSelector('[data-lp-renderer="agency-portfolio-v2"]');
  await p.evaluate(() => document.fonts.ready);
  for (const width of process.env.AGENCY_BUILDER_INTERACTIONS_ONLY
    ? []
    : [375, 390, 768, 1024, 1440, 1920]) {
    await p.setViewportSize({ width, height: 1000 });
    const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    await p.locator(`[data-lp-toolbar-btn="${device}"]`).click();
    await p.waitForTimeout(250);
    const m = await p.locator('[data-lp-canvas-root]').evaluate((root) => {
      const h = root.querySelector('h1'),
        g = root.querySelector('.hero-grid');
      return {
        canvasWidth: root.offsetWidth,
        heroColumns: getComputedStyle(g).gridTemplateColumns.split(' ').length,
        headlineWhiteSpace: getComputedStyle(h).whiteSpace,
        headingRight: h.getBoundingClientRect().right,
        rootRight: root.getBoundingClientRect().right,
        gallery: root.querySelectorAll('.work-card').length,
        steps: root.querySelectorAll('.step').length,
        plans: root.querySelectorAll('.price-card').length,
      };
    });
    assert.equal(m.gallery, 4);
    assert.equal(m.steps, 4);
    assert.equal(m.plans, 2);
    if (width < 768) assert.equal(m.heroColumns, 1);
    assert(m.headingRight <= m.rootRight + 2, 'Headline escapes canvas');
    await p.screenshot({ path: OUT + '/builder-' + width + '.png' });
    results.push({ viewport: width, device, ...m });
    console.log('PASS builder viewport', width);
  }
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.locator('[data-lp-toolbar-btn="desktop"]').click();
  const h = p.locator('[data-lp-block-id="agency-hero"] h1');
  const original = await h.innerText();
  await h.dblclick();
  await p
    .locator('h1[contenteditable="true"]')
    .fill('Đối tác triển khai — kiểm tra tiếng Việt có dấu.');
  await p.locator('[data-lp-toolbar-btn="save"]').click();
  await poll(
    () =>
      saved.blocks.find((b) => b.id === 'agency-hero').headline ===
      'Đối tác triển khai — kiểm tra tiếng Việt có dấu.',
  );
  await p.locator('[data-lp-toolbar-btn="undo"]').click();
  await poll(async () => (await h.innerText()) === original);
  await p.locator('[data-lp-toolbar-btn="redo"]').click();
  await poll(
    async () => (await h.innerText()) === 'Đối tác triển khai — kiểm tra tiếng Việt có dấu.',
  );
  await p.locator('[data-lp-toolbar-btn="save"]').click();
  await p.reload();
  await p.waitForSelector('h1');
  await poll(
    async () => (await h.innerText()) === 'Đối tác triển khai — kiểm tra tiếng Việt có dấu.',
  );
  assert.equal(saved.meta.rendererVersion, 'agency-portfolio-v2');
  results.push({ interaction: 'inline editing + selection + undo/redo + save/reopen', ok: true });
  // Shared heading resize gesture commits through the real builder handlers.
  await h.click();
  const resize = p.locator('[data-lp-heading-width-handle="e"]').first();
  await resize.waitFor({ state: 'visible', timeout: 5000 });
  await resize.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400); // Selection may dock the inspector and rescale the canvas.
  const box = await resize.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width / 2 - 70, box.y + box.height / 2, { steps: 10 });
  await p.mouse.up();
  await p.waitForTimeout(500);
  await p.locator('[data-lp-toolbar-btn="save"]').click();
  await poll(
    () => typeof saved.meta.inlineTextStyles?.['agency-hero::headline']?.width === 'number',
  );
  results.push({
    interaction: 'heading resize through shared gesture -> saved inlineTextStyles',
    width: saved.meta.inlineTextStyles['agency-hero::headline'].width,
    ok: true,
  });
  // Move the selected heading through its shared drag handle, then save the offset.
  const mover = p.locator('[data-lp-free-drag-handle]').first();
  console.log('DRAG HANDLES', await p.locator('[data-lp-free-drag-handle]').count());
  await mover.waitFor({ state: 'visible', timeout: 5000 });
  const moveBox = await mover.boundingBox();
  await p.mouse.move(moveBox.x + moveBox.width / 2, moveBox.y + moveBox.height / 2);
  await p.mouse.down();
  await p.mouse.move(moveBox.x + moveBox.width / 2 + 24, moveBox.y + moveBox.height / 2 + 16, {
    steps: 8,
  });
  await p.mouse.up();
  await p.waitForTimeout(200);
  await p.locator('[data-lp-toolbar-btn="save"]').click();
  await poll(() => {
    const f = saved.meta.elementFreeLayouts?.['agency-hero::headline'];
    return f && (f.x !== 0 || f.y !== 0);
  });
  results.push({
    interaction: 'shared heading drag handle -> saved elementFreeLayouts',
    layout: saved.meta.elementFreeLayouts['agency-hero::headline'],
    ok: true,
  });
  // A stored responsive override + Custom CSS reopens through the builder's normal load path.
  saved.meta.responsiveInlineTextStyles = {
    'agency-hero::headline': { mobile: { fontSize: 29, color: '#225544' } },
  };
  saved.blocks.find((b) => b.id === 'agency-hero').style = {
    elementCustomCss: { headline: 'color: #aa3300;' },
  };
  await p.reload();
  await p.waitForSelector('h1');
  await p.locator('[data-lp-toolbar-btn="mobile"]').click();
  await poll(async () => (await h.evaluate((e) => getComputedStyle(e).fontSize)) === '29px');
  results.push({
    interaction: 'responsive font override + Custom CSS stored and reopened',
    fontSize: await h.evaluate((e) => getComputedStyle(e).fontSize),
    color: await h.evaluate((e) => getComputedStyle(e).color),
    ok: true,
  });
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    OUT + '/builder-results.json',
    JSON.stringify(
      {
        results,
        mockedAutosaves: writes,
        errors,
        note: 'Real builder component and handlers; API persistence is an in-memory fixture, no production writes.',
      },
      null,
      2,
    ),
  );
  await browser.close();
  console.log('PASS builder interactions', results.length);
})().catch((e) => {
  console.error(e);
  fs.writeFileSync(OUT + '/builder-failure.txt', String(e.stack));
  process.exit(1);
});
