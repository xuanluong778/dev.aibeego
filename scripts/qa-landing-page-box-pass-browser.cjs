// Actual Builder, native box pointer handlers, sanitizer and history. API writes intercepted.
const fs = require('fs'),
  path = require('path'),
  assert = require('assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_PASS_QA_ORIGIN || 'http://127.0.0.1:13013',
  out = process.env.LP_PASS_QA_OUT || fs.mkdtempSync('/tmp/lp-box-pass-');
fs.mkdirSync(out, { recursive: true });
const report = {
  passed: false,
  origin,
  steps: [],
  errors: [],
  frames: 0,
  overlaps: 0,
  realApiWrites: 0,
};
function fixture(columns = false) {
  return {
    ...shared.createBlankLandingPageSpec(),
    blocks: [
      {
        id: 'boxes',
        type: 'Benefits',
        enabled: true,
        headline: '',
        subheadline: '',
        items: ['first', 'second'].map((id) => ({
          id,
          title: '',
          description: 'Nội dung trong box ' + id,
          positionMode: 'free',
          freeLayout: { x: 0, y: 0, width: 220, height: 150, reserveHeight: 150 },
        })),
        style: {
          ...(columns ? { lpContentColumns: 3, lpNativeColumnIndices: [0, 1] } : {}),
          minHeight: '700px',
          background: '#304b39',
          lpItemBoxes: Object.fromEntries(
            ['first', 'second'].map((id) => [
              id,
              {
                backgroundOn: true,
                background: '#b4cfbf',
                borderOn: true,
                borderColor: '#facc15',
                borderWidth: 2,
                borderRadius: 40,
                paddingX: 18,
                paddingY: 20,
              },
            ]),
          ),
        },
      },
    ],
    meta: { layout: 'classic', clientRevision: 10 },
  };
}
const hit = (a, b) =>
  a.x < b.x + b.width - 0.7 &&
  a.x + a.width > b.x + 0.7 &&
  a.y < b.y + b.height - 0.7 &&
  a.y + a.height > b.y + 0.7;
(async () => {
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  try {
    for (const control of ['handle', 'toolbar', 'columns']) {
      const context = await browser.newContext({ viewport: { width: 1542, height: 1000 } }),
        p = await context.newPage();
      let stored = shared.sanitizeLandingPagePersistSpec(fixture(control === 'columns')),
        saves = 0;
      p.on('pageerror', (e) => report.errors.push(e.stack));
      await p.addInitScript(() =>
        localStorage.setItem(
          'ms_access_token',
          'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
        ),
      );
      await p.route('**/api/v1/**', (route) => {
        const req = route.request(),
          u = new URL(req.url()).pathname;
        let body = {};
        if (u.endsWith('/auth/me'))
          body = {
            id: 'qa',
            name: 'QA',
            email: 'qa@example.invalid',
            role: 'SUPER_ADMIN',
            permissions: [],
            organizationId: 'qa',
          };
        else if (u.endsWith('/box-pass-qa/autosave')) {
          const q = req.postDataJSON();
          stored = shared.sanitizeLandingPagePersistSpec(q.draftSpec);
          saves++;
          body = {
            clientRevision: q.clientRevision,
            requestId: q.requestId,
            updatedAt: new Date().toISOString(),
          };
        } else if (u.endsWith('/box-pass-qa'))
          body = { id: 'box-pass-qa', name: 'QA box crossing', status: 'DRAFT', draftSpec: stored };
        else if (u.includes('subscription'))
          body = {
            hasPlan: true,
            status: 'ACTIVE',
            subscriptionStatus: 'ACTIVE',
            isExpired: false,
          };
        else if (u.includes('/templates')) body = [];
        return route.fulfill({ json: body });
      });
      await p.goto(origin + '/landing-pages/builder/box-pass-qa', {
        waitUntil: 'domcontentloaded',
      });
      const first = p.locator('[data-lp-item-id="first"]'),
        second = p.locator('[data-lp-item-id="second"]');
      await first.waitFor({ timeout: 30000 });
      await p.waitForTimeout(700);
      const a = await first.boundingBox(),
        b = await second.boundingBox();
      assert(!hit(a, b), 'Initial boxes separate');
      async function dragTo(left, label) {
        let r = await first.boundingBox();
        await p.mouse.click(r.x + 8, r.y + 8, { button: 'right' });
        await p.keyboard.press('Escape');
        await p.waitForTimeout(150);
        let start = { x: r.x + 9, y: r.y + 9 };
        if (control !== 'toolbar') {
          const h = await first.locator('[data-lp-free-drag-handle]').boundingBox();
          assert(h, 'Native move handle visible');
          start = { x: h.x + h.width / 2, y: h.y + h.height / 2 };
        }
        if (control === 'toolbar') {
          const handle = p.locator('[data-lp-vertical-tool="move"]');
          await handle.waitFor();
          const h = await handle.boundingBox();
          start = { x: h.x + h.width / 2, y: h.y + h.height / 2 };
        }
        await p.mouse.move(start.x, start.y);
        await p.mouse.down();
        let active = 0;
        for (let i = 1; i <= 30; i++) {
          await p.mouse.move(start.x + ((left - r.x) * i) / 30, start.y);
          await p.waitForTimeout(17);
          active += await p.locator('[data-lp-free-dragging="1"]').count();
          const x = await first.boundingBox(),
            y = await second.boundingBox();
          report.frames++;
          if (hit(x, y)) report.overlaps++;
          assert(!hit(x, y), 'No overlap ' + control + ' ' + label + ' frame ' + i);
        }
        await p.mouse.up();
        await p.waitForTimeout(400);
        assert(active > 0, 'Actual pointer engine engaged');
        return first.boundingBox();
      }
      const goal = b.x + b.width + 25;
      const passed = await dragTo(goal, 'forward');
      assert(
        passed.x >= b.x + b.width - 1,
        'Box passes to opposite side instead of stopping at obstacle ' +
          JSON.stringify({ a, b, passed, goal }),
      );
      assert(Math.abs((await second.boundingBox()).x - b.x) < 1, 'Other box remains stationary');
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await p.waitForTimeout(300);
      assert(Math.abs((await first.boundingBox()).x - a.x) < 2, 'One undo restores move');
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await p.waitForTimeout(300);
      assert((await first.boundingBox()).x >= b.x + b.width - 1, 'Redo restores opposite side');
      for (let i = 0; i < 80 && !saves; i++) await p.waitForTimeout(100);
      assert(saves > 0, 'Move autosaved');
      await p.waitForTimeout(1000);
      await p.reload({ waitUntil: 'domcontentloaded' });
      await first.waitFor();
      await p.waitForTimeout(600);
      assert((await first.boundingBox()).x >= b.x + b.width - 1, 'Reload keeps passed position');
      await p.screenshot({ path: path.join(out, control + '-passed.png') });
      const returned = await dragTo(a.x, 'reverse');
      assert(returned.x + returned.width <= b.x + 1, 'Reverse crossing returns to first side');
      report.steps.push({
        control,
        forward: true,
        reverse: true,
        noOverlap: true,
        undoRedo: true,
        autosaveReload: true,
      });
      await context.close();
    }
    assert.deepEqual(report.errors, []);
    report.passed = true;
    console.log(JSON.stringify(report));
  } finally {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
