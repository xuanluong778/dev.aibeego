// Real saved draft, read-only API interception. No production draft writes.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_OVERLAP_QA_ORIGIN || 'https://aibeego.com',
  out = process.env.LP_OVERLAP_QA_OUT || fs.mkdtempSync('/tmp/lp-overlap-'),
  input = JSON.parse(fs.readFileSync(process.env.LP_OVERLAP_QA_PAGE_FILE));
fs.mkdirSync(out, { recursive: true });
const report = {
  passed: false,
  origin,
  errors: [],
  checks: [],
  realApiWrites: 0,
  interceptedWrites: 0,
};
async function geometry(page, label) {
  const result = await page.locator('[data-lp-canvas-root]').evaluate((root) => {
    const visible = (n) => {
      const r = n.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && getComputedStyle(n).visibility !== 'hidden';
    };
    const rect = (n) => {
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const native = [...root.querySelectorAll('[data-lp-item-id]')].filter(visible);
    const attached = [...root.querySelectorAll('[data-lp-section-element]')].filter(visible);
    const texts = [...root.querySelectorAll('[data-lp-text-hug="1"]')].filter(visible);
    const actors = [...new Set([...native, ...attached.filter(n=>!n.querySelector('[data-lp-free-child],[data-lp-free-box]')), ...texts])];
    const collisions = [];
    for (let i = 0; i < actors.length; i++)
      for (let j = i + 1; j < actors.length; j++) {
        const a = actors[i],
          b = actors[j];
        if (a.contains(b) || b.contains(a)) continue;
        const x = rect(a),
          y = rect(b);
        if (
          x.x < y.x + y.width - 1 &&
          x.x + x.width > y.x + 1 &&
          x.y < y.y + y.height - 1 &&
          x.y + x.height > y.y + 1
        )
          collisions.push({
            a: a.dataset.lpFreeId || a.dataset.lpItemId || a.dataset.lpBlockId,
            b: b.dataset.lpFreeId || b.dataset.lpItemId || b.dataset.lpBlockId,
            x,
            y,
          });
      }
    return { native: native.length, attached: attached.length, texts: texts.length, collisions };
  });
  report.checks.push({ label, ...result });
  return result;
}
(async () => {
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1542, height: 1000 } });
    let stored = structuredClone(input.draftSpec);
    page.on('pageerror', (e) => report.errors.push(e.stack));
    await page.addInitScript(() =>
      localStorage.setItem(
        'ms_access_token',
        'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
      ),
    );
    await page.route('**/api/v1/**', (route) => {
      const req = route.request(),
        p = new URL(req.url()).pathname;
      let body = {};
      if (!['GET', 'HEAD'].includes(req.method())) report.interceptedWrites++;
      if (p.endsWith('/auth/me'))
        body = {
          id: 'qa',
          name: 'QA',
          email: 'qa@example.invalid',
          role: 'SUPER_ADMIN',
          permissions: [],
          organizationId: 'qa',
          organization: { id: 'qa', name: 'QA' },
        };
      else if (p === '/api/v1/landing-pages/' + input.id + '/autosave') {
        const data = req.postDataJSON();
        stored = shared.sanitizeLandingPagePersistSpec(data.draftSpec);
        report.autosaves = (report.autosaves || 0) + 1;
        body = {
          clientRevision: data.clientRevision,
          requestId: data.requestId,
          updatedAt: new Date().toISOString(),
        };
      } else if (p === '/api/v1/landing-pages/' + input.id) {
        if (['PATCH', 'PUT'].includes(req.method())) {
          const data = req.postDataJSON();
          if (data?.draftSpec) stored = shared.sanitizeLandingPagePersistSpec(data.draftSpec);
        }
        body = { ...input, draftSpec: stored };
      } else if (p.includes('/templates')) body = [];
      else if (p.includes('subscription'))
        body = { hasPlan: true, status: 'ACTIVE', subscriptionStatus: 'ACTIVE', isExpired: false };
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.goto(origin + '/landing-pages/builder/' + input.id, {
      waitUntil: 'domcontentloaded',
    });
    await page.locator('[data-lp-canvas-root]').waitFor({ timeout: 30000 });
    await page.waitForTimeout(4000);
    let r = await geometry(page, 'desktop-load');
    await page.screenshot({ path: path.join(out, 'desktop.png'), fullPage: true });
    if (process.env.LP_OVERLAP_DEBUG)
      fs.writeFileSync(
        path.join(out, 'dom-debug.json'),
        JSON.stringify(
          await page.locator('[data-lp-canvas-root]').evaluate((root) =>
            [
              ...root.querySelectorAll(
                '[data-lp-free-id="hero_xqdqrrgu::headline"],[data-lp-section-element][data-lp-block-id="benefits_whntnsha"]',
              ),
            ].map((n) => {
              const a = [];
              while (n && n !== root) {
                a.push({
                  tag: n.tagName,
                  attrs: [...n.attributes].map((a) => [a.name, a.value]),
                  rect: n.getBoundingClientRect().toJSON(),
                  css: {
                    display: getComputedStyle(n).display,
                    width: getComputedStyle(n).width,
                    minWidth: getComputedStyle(n).minWidth,
                    maxWidth: getComputedStyle(n).maxWidth,
                    grid: getComputedStyle(n).gridTemplateColumns,
                  },
                });
                n = n.parentElement;
              }
              return a;
            }),
          ),
          null,
          2,
        ),
      );
    assert.deepEqual(r.collisions, [], 'Saved text/box overlap');
    assert.equal(
      report.interceptedWrites,
      0,
      'Loading a legacy layout must not autosave any rewrite',
    );
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-lp-canvas-root]').waitFor();
    await page.waitForTimeout(2000);
    r = await geometry(page, 'desktop-reload');
    assert.deepEqual(r.collisions, []);
    // Drag the external paragraph directly towards a native box, measuring each frame.
    const selector = '[data-lp-free-id="benefits_ays94ucl::subheadline"]',
      node = page.locator(selector);
    if (await node.count()) {
      await node.scrollIntoViewIfNeeded();
      await node.click({ button: 'right' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const b = await node.boundingBox(),
        boxes = await page
          .locator(
            '[data-lp-item-id],[data-lp-section-element]:not([data-lp-block-id="benefits_ays94ucl"])',
          )
          .evaluateAll((ns) =>
            ns
              .map((n) => {
                const r = n.getBoundingClientRect();
                return { x: r.x, y: r.y, width: r.width, height: r.height };
              })
              .filter((r) => r.width > 1 && r.height > 1),
          );
      const near = boxes.sort(
        (x, y) => Math.hypot(x.x - b.x, x.y - b.y) - Math.hypot(y.x - b.x, y.y - b.y),
      )[0];
      if (near) {
        let activeFrames = 0;
        const start = { x: b.x + Math.min(30, b.width / 2), y: b.y + Math.min(20, b.height / 2) };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        for (let i = 1; i <= 14; i++) {
          await page.mouse.move(
            start.x + ((near.x + near.width / 2 - b.x) * i) / 14,
            start.y + ((near.y - b.y) * i) / 14,
          );
          await page.waitForTimeout(25);
          activeFrames += await page.locator('[data-lp-free-dragging="1"]').count();
          r = await geometry(page, 'drag-frame-' + i);
          assert.deepEqual(r.collisions, [], 'Overlap during pointer movement');
        }
        await page.mouse.up();
        assert(activeFrames > 0, 'The test must engage the actual free-drag engine');
        report.dragFrames = activeFrames;
        await page.waitForTimeout(500);
        r = await geometry(page, 'after-drag');
        assert.deepEqual(r.collisions, []);
        await page.screenshot({ path: path.join(out, 'after-drag.png') });
        for (let i = 0; i < 80 && !report.autosaves; i++) await page.waitForTimeout(100);
        assert(report.autosaves > 0, 'User drag autosaved in intercepted API');
        const accepted = stored.blocks.find((x) => x.id === 'benefits_ays94ucl').style
          ?.lpAcceptedLayoutFields;
        assert(
          JSON.parse(accepted || '[]').includes('subheadline'),
          'Explicit text position marker survives sanitizer',
        );
        assert.equal(
          stored.blocks.find((x) => x.id === 'benefits_j4r8ipc7').items[0].freeLayout.x,
          input.draftSpec.blocks.find((x) => x.id === 'benefits_j4r8ipc7').items[0].freeLayout.x,
          'Do not rewrite saved native coordinates',
        );
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-lp-canvas-root]').waitFor();
        await page.waitForTimeout(1200);
        r = await geometry(page, 'reload-after-drag-autosave');
        assert.deepEqual(r.collisions, []);
      }
    }
    await page.locator('[data-lp-preview-switch]').first().click();
    await page.locator('[data-lp-preview-canvas]').waitFor();
    await page.waitForTimeout(500);
    r = await geometry(page, 'preview');
    assert.deepEqual(r.collisions, []);
    await page.screenshot({ path: path.join(out, 'preview.png') });
    await page.locator('[data-lp-preview-shell] [data-lp-preview-switch]').click();
    await page.setViewportSize({ width: 900, height: 1000 });
    await page.waitForTimeout(600);
    r = await geometry(page, 'narrow-window');
    assert.deepEqual(r.collisions, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    r = await geometry(page, 'mobile-window');
    assert.deepEqual(r.collisions, []);
    await page.screenshot({ path: path.join(out, 'mobile.png'), fullPage: true });
    assert.deepEqual(report.errors, []);
    report.passed = true;
    console.log(
      JSON.stringify({
        passed: true,
        checks: report.checks.length,
        realApiWrites: 0,
        errors: report.errors.length,
      }),
    );
  } finally {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
