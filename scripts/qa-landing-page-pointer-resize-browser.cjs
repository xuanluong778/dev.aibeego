// Actual Builder route. API persistence is intercepted; production drafts are never written.
const fs = require('fs'),
  path = require('path'),
  assert = require('assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_POINTER_QA_ORIGIN || 'http://127.0.0.1:13014',
  out = process.env.LP_POINTER_QA_OUT || fs.mkdtempSync('/tmp/lp-pointer-');
fs.mkdirSync(out, { recursive: true });
const report = { passed: false, origin, steps: [], errors: [], realApiWrites: 0 };
function fixture(obstructed = false) {
  const base = shared.createBlankLandingPageSpec(),
    hero = {
      ...base.blocks.find((b) => b.type === 'Hero'),
      id: 'host',
      headline: 'Tiêu đề chính thu hút khách',
      background: '#304b39',
      subheadline: '',
      ctaLabel: '',
      trustPoints: [],
      style: {
        lpContentColumns: 3,
        lpNativeColumnIndices: [0],
        minHeight: '800px',
        background: '#304b39',
      },
    };
  return {
    ...base,
    blocks: [
      hero,
      {
        id: 'below',
        type: 'Benefits',
        enabled: true,
        headline: '',
        subheadline: 'Box nằm dưới tiêu đề. Giữ nội dung ngoài khung tiêu đề.',
        items: [],
        sectionPlacement: {
          sectionId: 'host',
          anchor: { kind: 'end' },
          edge: 'after',
          columnIndex: 0,
        },
      },
      {
        id: 'right',
        type: 'Benefits',
        enabled: true,
        headline: '',
        subheadline: 'Nội dung bên phải',
        items: [],
        sectionPlacement: {
          sectionId: 'host',
          anchor: { kind: 'end' },
          edge: 'after',
          columnIndex: 2,
        },
        style: { lpAcceptedLayoutFields: '["subheadline"]' },
      },
    ],
    meta: {
      layout: 'classic',
      clientRevision: 10,
      elementHidden: { 'host::subheadline': true, 'host::ctaLabel': true },
      elementFreeLayouts: {
        'host::headline': { x: 142, y: 20, width: 820 },
        'right::subheadline': { x: 0, y: obstructed ? 0 : 230, width: 280 },
      },
      inlineTextStyles: {
        'host::headline': {
          width: 820,
          height: 88,
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.2,
          color: '#fff',
        },
        'below::subheadline': {
          width: 320,
          fontSize: 20,
          lineHeight: 1.5,
          box: {
            backgroundOn: true,
            background: '#b4cfbf',
            paddingX: 18,
            paddingY: 20,
            borderOn: true,
            borderColor: '#facc15',
            borderWidth: 2,
            borderRadius: 40,
          },
        },
        'right::subheadline': { width: 280, fontSize: 18, lineHeight: 1.5 },
      },
    },
  };
}
async function geometry(p, selector) {
  return p.locator(selector).evaluate((n) => {
    const r = n.getBoundingClientRect(),
      root = n.closest('[data-lp-canvas-root]'),
      rr = root.getBoundingClientRect(),
      scale = rr.width / root.offsetWidth;
    return {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      scale,
      left: (r.x - rr.x) / scale,
      top: (r.y - rr.y) / scale,
      w: r.width / scale,
      h: r.height / scale,
    };
  });
}
const close = (a, b, t = 3) => Math.abs(a - b) <= t;
(async () => {
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  try {
    for (const viewport of [
      { width: 1542, height: 1000 },
      { width: 1900, height: 1100 },
      { width: 1542, height: 1000, obstructed: true },
      { width: 1542, height: 1000, corner: true },
    ]) {
      const ctx = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        }),
        p = await ctx.newPage();
      let stored = shared.sanitizeLandingPagePersistSpec(fixture(Boolean(viewport.obstructed)));
      let saves = 0;
      p.on('pageerror', (e) => report.errors.push(e.stack));
      await p.addInitScript(() =>
        localStorage.setItem(
          'ms_access_token',
          'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
        ),
      );
      await p.route('**/api/v1/**', (route) => {
        const q = route.request(),
          u = new URL(q.url()).pathname;
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
        else if (u.endsWith('/pointer-qa/autosave')) {
          const data = q.postDataJSON();
          stored = shared.sanitizeLandingPagePersistSpec(data.draftSpec);
          saves++;
          body = {
            clientRevision: data.clientRevision,
            requestId: data.requestId,
            updatedAt: new Date().toISOString(),
          };
        } else if (u.endsWith('/pointer-qa'))
          body = { id: 'pointer-qa', name: 'Pointer QA', status: 'DRAFT', draftSpec: stored };
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
      await p.goto(origin + '/landing-pages/builder/pointer-qa', { waitUntil: 'domcontentloaded' });
      const selector = '[data-lp-free-id="host::headline"]',
        title = p.locator(selector);
      await title.waitFor({ timeout: 30000 });
      await p.waitForTimeout(1000);
      await p.evaluate(() => document.fonts.ready);
      await title.click({ button: 'right' });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(150);
      const before = await geometry(p, selector),
        font = await title.evaluate((n) =>
          parseFloat(getComputedStyle(n.querySelector('[data-lp-inline-field]')).fontSize),
        );
      const handle = title.locator(
          viewport.corner ? '[data-lp-resize-handle="se"]' : '[data-lp-resize-handle="e"]',
        ),
        h = await handle.boundingBox();
      assert(h, 'East resize handle');
      const start = { x: h.x + h.width / 2, y: h.y + h.height / 2 };
      await p.mouse.move(start.x, start.y);
      await p.mouse.down();
      await p.waitForTimeout(40);
      let r = await geometry(p, selector);
      assert(close(r.left, before.left), 'No left jump on resize down');
      assert(close(r.w, before.w), 'Resize starts with painted width, not stale saved 820px');
      const resizeDelta = viewport.obstructed ? 800 : 420;
      let last = before.w;
      for (let i = 1; i <= 24; i++) {
        await p.mouse.move(start.x + (resizeDelta * before.scale * i) / 24, start.y);
        await p.waitForTimeout(18);
        r = await geometry(p, selector);
        assert(close(r.left, before.left), 'East resize keeps left edge ' + JSON.stringify(r));
        assert(r.w >= last - 3, 'Width does not jump backwards');
        last = r.w;
      }
      const during = await geometry(p, selector);
      if (viewport.obstructed)
        assert(
          during.w < before.w + resizeDelta - 10,
          'A neighbouring element limits resize instead of allowing overlap',
        );
      assert(
        during.w > before.w + 300,
        'Heading can expand past its column ' + JSON.stringify({ before, during }),
      );
      await p.mouse.up();
      await p.waitForTimeout(500);
      const after = await geometry(p, selector);
      assert(close(after.w, during.w), 'Width does not snap back after release');
      assert(close(after.left, before.left), 'Left edge stays fixed after release');
      assert.equal(await title.getAttribute('data-lp-size-accepted'), '1');
      const fontAfter = await title.evaluate((n) =>
        parseFloat(getComputedStyle(n.querySelector('[data-lp-inline-field]')).fontSize),
      );
      assert(
        viewport.corner ? fontAfter > font : close(fontAfter, font),
        'Typography follows the selected handle',
      );
      assert(close(after.h, during.h), 'Height must not jump on pointer release');
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await p.waitForTimeout(300);
      assert(
        close((await geometry(p, selector)).w, before.w),
        'One undo restores original visible width',
      );
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await p.waitForTimeout(300);
      assert(close((await geometry(p, selector)).w, after.w), 'Redo restores resized width');
      for (let i = 0; i < 90; i++) {
        if (
          saves &&
          Math.abs((stored.meta.inlineTextStyles['host::headline']?.width || 0) - after.w) < 4
        )
          break;
        await p.waitForTimeout(100);
      }
      assert(saves > 0);
      assert(
        close(stored.meta.inlineTextStyles['host::headline'].width, after.w),
        'Autosave retains actual width',
      );
      await p.reload({ waitUntil: 'domcontentloaded' });
      await title.waitFor();
      await p.waitForTimeout(700);
      r = await geometry(p, selector);
      assert(close(r.w, after.w), 'Reload retains width');
      assert(close(r.left, after.left), 'Reload retains heading position');
      await p.locator('[data-lp-preview-switch]').first().click();
      await p.locator('[data-lp-preview-canvas]').waitFor();
      await p.waitForTimeout(400);
      const preview = await geometry(p, '[data-lp-preview-canvas] ' + selector);
      assert(close(preview.w, after.w), 'Preview retains resized width');
      await p.locator('[data-lp-preview-shell] [data-lp-preview-switch]').click();
      await p.waitForTimeout(200);
      // Follow the pointer precisely through free space, repeating after save/reload.
      for (const dx of viewport.obstructed || viewport.corner ? [] : [91, -37, 5]) {
        await title.click({ button: 'right' });
        await p.keyboard.press('Escape');
        await p.waitForTimeout(120);
        const b = await geometry(p, selector),
          move = p.locator('[data-lp-vertical-tool="move"]');
        await move.waitFor();
        const mb = await move.boundingBox(),
          st = { x: mb.x + mb.width / 2, y: mb.y + mb.height / 2 };
        await p.mouse.move(st.x, st.y);
        await p.mouse.down();
        await p.waitForTimeout(35);
        r = await geometry(p, selector);
        assert(
          close(r.left, b.left) && close(r.top, b.top) && close(r.w, b.w),
          'No jump or size change on move down',
        );
        for (let i = 1; i <= 15; i++) {
          await p.mouse.move(st.x + (dx * b.scale * i) / 15, st.y);
          await p.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          r = await geometry(p, selector);
          assert(
            close(r.left, b.left + (dx * i) / 15, Math.max(3, 9 / b.scale)),
            'Move tracks pointer ' + JSON.stringify({ dx, i, b, r }),
          );
          assert(close(r.top, b.top), 'Horizontal move keeps Y');
          assert(close(r.w, b.w), 'Move keeps width');
        }
        const live = await geometry(p, selector);
        await p.mouse.up();
        await p.waitForTimeout(350);
        r = await geometry(p, selector);
        assert(
          close(r.left, live.left) && close(r.top, live.top),
          'Release retains exact live location',
        );
      }
      if (viewport.obstructed) {
        const a = await geometry(p, selector),
          other = await geometry(p, '[data-lp-free-id="right::subheadline"]');
        assert(a.left + a.w <= other.left + 1, 'Resizing stops before adjacent text');
      }
      // Escape cancels without leaving imperative geometry behind.
      await title.click({ button: 'right' });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(100);
      const cancelBefore = await geometry(p, selector),
        ch = await title.locator('[data-lp-resize-handle="e"]').boundingBox();
      await p.mouse.move(ch.x + ch.width / 2, ch.y + ch.height / 2);
      await p.mouse.down();
      await p.mouse.move(ch.x + ch.width / 2 - 60 * cancelBefore.scale, ch.y + ch.height / 2, {
        steps: 8,
      });
      await p.keyboard.press('Escape');
      await p.mouse.up();
      await p.waitForTimeout(250);
      const cancelled = await geometry(p, selector);
      assert(
        close(cancelled.w, cancelBefore.w) && close(cancelled.left, cancelBefore.left),
        'Escape restores geometry',
      );
      await p.screenshot({
        path: path.join(
          out,
          'width-' +
            viewport.width +
            (viewport.obstructed ? '-blocked' : viewport.corner ? '-corner' : '') +
            '.png',
        ),
      });
      report.steps.push({
        viewport: viewport.width,
        obstructed: Boolean(viewport.obstructed),
        corner: Boolean(viewport.corner),
        scale: before.scale,
        resize: { before: before.w, after: after.w, leftAnchored: true },
        undoRedo: true,
        autosaveReload: true,
        preview: true,
        pointerMoves: viewport.obstructed || viewport.corner ? 0 : 3,
        cancelResize: true,
      });
      await ctx.close();
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
