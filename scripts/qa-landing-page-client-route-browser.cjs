// Load the actual production Builder bundles. Every API request is intercepted;
// no credentials or draft writes are sent to the target server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const origin = process.env.LP_CLIENT_QA_ORIGIN || 'http://127.0.0.1:13007';
const out = process.env.LP_CLIENT_QA_OUT || fs.mkdtempSync('/tmp/lp-client-route-');
const input = process.env.LP_CLIENT_QA_PAGE_FILE
  ? JSON.parse(fs.readFileSync(process.env.LP_CLIENT_QA_PAGE_FILE, 'utf8'))
  : {
      id: 'isolated-client-qa',
      name: 'Isolated QA',
      status: 'DRAFT',
      draftSpec: shared.createBlankLandingPageSpec(),
    };
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.LP_QA_BROWSER || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const report = {
    passed: false,
    origin,
    errors: [],
    preloadWarnings: [],
    apiRequestsIntercepted: 0,
    mutationRequestsIntercepted: 0,
    reloads: [],
  };
  try {
    const page = await browser.newPage({ viewport: { width: 1542, height: 900 } });
    page.on('pageerror', (e) => report.errors.push({ message: e.message, stack: e.stack }));
    page.on('console', (m) => {
      if (/preloaded using link preload/.test(m.text())) report.preloadWarnings.push(m.text());
    });
    await page.addInitScript(() =>
      localStorage.setItem(
        'ms_access_token',
        'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
      ),
    );
    await page.route('**/api/v1/**', (route) => {
      report.apiRequestsIntercepted++;
      if (!['GET', 'HEAD'].includes(route.request().method())) report.mutationRequestsIntercepted++;
      const url = new URL(route.request().url()),
        p = url.pathname;
      let body = {};
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
      else if (p === '/api/v1/landing-pages/' + input.id) body = input;
      else if (p.includes('/templates')) body = [];
      else if (p.includes('subscription'))
        body = { hasPlan: true, status: 'ACTIVE', subscriptionStatus: 'ACTIVE', isExpired: false };
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    const attached = input.draftSpec.blocks
      .filter((b) => b.enabled && !b.hidden && b.sectionPlacement)
      .map((b) => b.id);
    for (let i = 0; i < 2; i++) {
      if (i === 0)
        await page.goto(origin + '/landing-pages/builder/' + input.id, {
          waitUntil: 'domcontentloaded',
        });
      else await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-lp-canvas-root]').waitFor({ timeout: 30000 });
      await page.waitForTimeout(6500);
      assert.deepEqual(report.errors, [], 'Client exception while loading the actual draft');
      assert.deepEqual(report.preloadWarnings, [], 'Unused CSS preload warning');
      const mounted = await page
        .locator('[data-lp-section-element="1"]')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-lp-block-id')));
      assert.deepEqual(
        [...new Set(mounted)].sort(),
        [...attached].sort(),
        'All attached elements must render',
      );
      assert(!(await page.locator('body').innerText()).includes('Application error:'));
      report.reloads.push({ iteration: i + 1, attachedElements: mounted.length });
    }
    await page.screenshot({ path: path.join(out, 'builder-loaded.png') });
    report.passed = true;
    console.log(
      JSON.stringify({
        passed: true,
        reloads: report.reloads,
        clientErrors: report.errors.length,
        unusedPreloadWarnings: report.preloadWarnings.length,
        apiRequestsIntercepted: report.apiRequestsIntercepted,
        mutationRequestsIntercepted: report.mutationRequestsIntercepted,
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
