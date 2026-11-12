// Actual Builder route, actual HTML5 drag events and existing autosave sanitizer. No production writes.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_DROP_QA_ORIGIN || 'http://127.0.0.1:13011',
  out = process.env.LP_DROP_QA_OUT || fs.mkdtempSync('/tmp/lp-drop-qa-');
fs.mkdirSync(out, { recursive: true });
const report = { passed: false, origin, steps: [], errors: [], realApiWrites: 0 };
const prose =
  'Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point. Now that you have got your visitors attention, let them know what they can expect and encourage them to explore your site.';
function fixture() {
  const base = shared.createBlankLandingPageSpec();
  return {
    ...base,
    blocks: [
      {
        id: 'boxes',
        type: 'Benefits',
        enabled: true,
        headline: 'Tiêu đề chính thu hút khách',
        subheadline: '',
        items: [1, 2, 3, 4].map((i) => ({
          id: 'card-' + i,
          title: '',
          description: prose,
          positionMode: 'free',
          freeLayout: { x: 0, y: 0, width: 340, height: 286, reserveHeight: 286 },
        })),
        style: {
          minHeight: '800px',
          background: '#304b39',
          lpItemBoxes: Object.fromEntries(
            [1, 2, 3, 4].map((i) => [
              'card-' + i,
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
      {
        id: 'outside',
        type: 'Benefits',
        enabled: true,
        headline: 'PHẦN KHÁC',
        subheadline: 'Không bị dịch chuyển vào box',
        items: [],
      },
    ],
    meta: {
      layout: 'classic',
      clientRevision: 10,
      inlineTextStyles: Object.fromEntries(
        [1, 2, 3, 4].map((i) => ['boxes::itemDesc:card-' + i, { fontSize: 18, lineHeight: 1.45 }]),
      ),
    },
  };
}
const paragraph = {
  kind: 'paragraph',
  preset: {
    id: 'qa',
    text: 'NỘI DUNG MỚI NGOÀI BOX. Nội dung phải xuống dòng và giữ đúng vị trí thả.',
    style: { fontSize: 18, lineHeight: 1.5, color: '#111827' },
  },
};
const shape = {
  kind: 'box',
  preset: {
    id: 'qa-box',
    label: 'QA box',
    category: 'basic',
    style: {
      lpBox: 'sq-solid',
      width: '160px',
      height: '96px',
      background: '#fdba74',
      borderRadius: '12px',
    },
  },
};
const overlaps = (a, b) =>
  a.x < b.x + b.width - 0.5 &&
  a.x + a.width > b.x + 0.5 &&
  a.y < b.y + b.height - 0.5 &&
  a.y + a.height > b.y + 0.5;
async function pause(p) {
  await p.waitForTimeout(450);
}
async function main() {
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  let page, ctx;
  try {
    for (const side of process.env.LP_DROP_QA_SIDES?.split(',') || [
      'right',
      'left',
      'top',
      'bottom',
      'row-bottom',
    ]) {
      ctx = await browser.newContext({ viewport: { width: 1542, height: 1100 } });
      page = await ctx.newPage();
      let stored = shared.sanitizeLandingPagePersistSpec(fixture());
      page.on('pageerror', (e) => report.errors.push(e.stack));
      await page.addInitScript(() =>
        localStorage.setItem(
          'ms_access_token',
          'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
        ),
      );
      await page.route('**/api/v1/**', (route) => {
        const u = new URL(route.request().url()),
          p = u.pathname;
        let body = {};
        if (p.endsWith('/auth/me'))
          body = {
            id: 'qa',
            name: 'QA',
            email: 'qa@example.invalid',
            role: 'SUPER_ADMIN',
            permissions: [],
            organizationId: 'qa',
          };
        else if (p.endsWith('/drop-qa/autosave')) {
          const req = route.request().postDataJSON();
          stored = shared.sanitizeLandingPagePersistSpec(req.draftSpec);
          body = {
            clientRevision: req.clientRevision,
            requestId: req.requestId,
            updatedAt: new Date().toISOString(),
          };
        } else if (p.endsWith('/drop-qa')) {
          if (route.request().method() === 'PATCH') {
            const req = route.request().postDataJSON();
            if (req.draftSpec) stored = shared.sanitizeLandingPagePersistSpec(req.draftSpec);
          }
          body = { id: 'drop-qa', name: 'Drop QA', status: 'DRAFT', draftSpec: stored };
        } else if (p.includes('subscription'))
          body = {
            hasPlan: true,
            status: 'ACTIVE',
            subscriptionStatus: 'ACTIVE',
            isExpired: false,
          };
        else if (p.includes('/templates')) body = [];
        return route.fulfill({ json: body });
      });
      await page.goto(origin + '/landing-pages/builder/drop-qa', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-lp-item-id="card-2"]').waitFor({ timeout: 60000 });
      await pause(page);
      const card = page.locator('[data-lp-item-id="card-2"]');
      await card.scrollIntoViewIfNeeded();
      await pause(page);
      let b = await card.boundingBox(),
        point = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      if (side === 'right') point.x = b.x + b.width - 3;
      if (side === 'left') point.x = b.x + 3;
      if (side === 'top') point.y = b.y + 3;
      if (side === 'bottom') point.y = b.y + b.height - 3;
      if (side === 'row-bottom') {
        await page.locator('[data-lp-item-id="card-4"]').scrollIntoViewIfNeeded();
        await pause(page);
        const boxes = await page.locator('[data-lp-item-parent="boxes"]').evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
        point = {
          x: boxes[0].x + boxes[0].width / 2,
          y: Math.max(...boxes.map((r) => r.y + r.height)) + 12,
        };
      }
      const payload =
        side === 'left'
          ? shape
          : side === 'row-bottom'
            ? { kind: 'add-picker-open', picker: 'text', initialTab: 'paragraph' }
            : paragraph;
      const drag = async (type) =>
        page.evaluate(
          ({ type, point, payload }) => {
            const dt = new DataTransfer();
            dt.setData('application/x-lp-sidebar-preset', JSON.stringify(payload));
            const el = document.elementFromPoint(point.x, point.y);
            if (!el) throw Error('No drop target');
            el.dispatchEvent(
              new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                dataTransfer: dt,
                clientX: point.x,
                clientY: point.y,
              }),
            );
          },
          { type, point, payload },
        );
      await drag('dragover');
      await pause(page);
      const line = page.locator('[data-lp-drop-line]');
      await line.waitFor({ timeout: 5000 });
      const lr = await line.boundingBox();
      const cards = await page.locator('[data-lp-item-parent="boxes"]').evaluateAll((ns) =>
        ns.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
      assert(
        cards.every((r) => !overlaps(lr, r)),
        'Drop marker must stay outside all boxes',
      );
      await page.screenshot({ path: path.join(out, side + '-marker.png') });
      await drag('drop');
      if (side === 'row-bottom') {
        await page.locator('[data-lp-element-library-modal]').waitFor();
        await page
          .locator('[data-lp-element-library-modal] [data-lp-paragraph-preset]')
          .first()
          .click();
      }
      await page.locator('[data-lp-section-element]').waitFor({ timeout: 8000 });
      await pause(page);
      const inserted = page.locator('[data-lp-section-element]').first(),
        ir = await inserted.boundingBox(),
        native = await page.locator('[data-lp-item-parent="boxes"]').evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
      assert(
        native.every((r) => !overlaps(ir, r)),
        'Inserted content must not overlap boxes ' + side,
      );
      const heading = await page
        .locator('[data-lp-inline-field="headline"][data-lp-element-id="boxes::headline"]')
        .boundingBox();
      assert(!overlaps(ir, heading), 'Inserted content must not overlap heading');
      for (let i = 0; i < native.length; i++)
        for (let j = i + 1; j < native.length; j++)
          assert(!overlaps(native[i], native[j]), 'Native boxes must not overlap after reflow');
      await page.screenshot({ path: path.join(out, side + '-inserted.png') });
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      for (let i = 0; i < 50 && stored.blocks.length !== 3; i++) await page.waitForTimeout(100);
      assert.equal(stored.blocks.length, 3);
      const copy = stored.blocks.find((b) => b.id !== 'boxes' && b.id !== 'outside');
      assert(copy.sectionPlacement);
      assert(!copy.freeLayout && !copy.positionMode, 'Flow insert is not an absolute layer');
      if (side === 'top' || side === 'bottom')
        assert.match(copy.sectionPlacement.anchor.field, /^__box:/);
      if (side === 'row-bottom') assert.match(copy.sectionPlacement.anchor.field, /^__row:/);
      await page.locator('[data-lp-toolbar-btn="undo"]').click();
      await pause(page);
      assert.equal(
        await page.locator('[data-lp-section-element]').count(),
        0,
        'One Undo removes drop',
      );
      await page.locator('[data-lp-toolbar-btn="redo"]').click();
      await pause(page);
      assert.equal(
        await page.locator('[data-lp-section-element]').count(),
        1,
        'Redo restores drop',
      );
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      await pause(page);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-lp-section-element]').waitFor();
      await pause(page);
      const reloaded = await page.locator('[data-lp-section-element]').boundingBox(),
        newBoxes = await page.locator('[data-lp-item-parent="boxes"]').evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
      assert(
        newBoxes.every((r) => !overlaps(reloaded, r)),
        'Reload retains non-overlapping flow',
      );
      await page.locator('[data-lp-inline-field="itemDesc:card-3"]').click();
      await pause(page);
      const bar = page.locator('[data-lp-element-vertical-toolbar]');
      if (await bar.count()) {
        const tr = await bar.boundingBox();
        const obs = await page
          .locator('[data-lp-item-parent="boxes"],[data-lp-section-element]')
          .evaluateAll((ns) =>
            ns.map((n) => {
              const r = n.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            }),
          );
        assert(
          obs.every((r) => !overlaps(tr, r)),
          'Toolbar avoids every box and inserted element',
        );
      }
      if (side === 'right') {
        await page
          .locator('[data-lp-item-id="card-1"]')
          .click({ button: 'right', position: { x: 3, y: 3 } });
        await page.locator('[data-lp-cm="duplicate"]').click();
        await pause(page);
        assert.deepEqual(
          report.errors,
          [],
          'Native box duplication must not break React ownership',
        );
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 5);
        await page.locator('[data-lp-toolbar-btn="undo"]').click();
        await pause(page);
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 4);
        await page
          .locator('[data-lp-item-id="card-2"]')
          .click({ button: 'right', position: { x: 3, y: 3 } });
        await page.locator('[data-lp-cm="layer"]').hover();
        await page.locator('[data-lp-cm="layer-up"]').click();
        await pause(page);
        const moved2 = await page.locator('[data-lp-item-id="card-2"]').boundingBox(),
          moved3 = await page.locator('[data-lp-item-id="card-1"]').boundingBox();
        assert(moved2.x < moved3.x, 'Native reordering must change visual column order');
        await page.locator('[data-lp-toolbar-btn="undo"]').click();
        await pause(page);
        await page
          .locator('[data-lp-item-id="card-2"]')
          .click({ button: 'right', position: { x: 3, y: 3 } });
        await page.keyboard.press('Escape');
        await pause(page);
        await page.locator('[data-lp-vertical-tool="delete"]').click();
        await pause(page);
        assert.deepEqual(report.errors, [], 'Deleting a native box must preserve React ownership');
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 3);
        await page.locator('[data-lp-toolbar-btn="undo"]').click();
        await pause(page);
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 4);
        await page.locator('[data-lp-toolbar-btn="save"]').click();
        await pause(page);
      }
      if (side === 'top' || side === 'bottom') {
        await page
          .locator('[data-lp-item-id="card-2"]')
          .click({ button: 'right', position: { x: 3, y: 3 } });
        await page.keyboard.press('Escape');
        await pause(page);
        await page.locator('[data-lp-vertical-tool="delete"]').click();
        await pause(page);
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 3);
        assert.equal(
          await page.locator('[data-lp-section-element]').count(),
          1,
          'Removing a box keeps the element outside it',
        );
        await page.locator('[data-lp-toolbar-btn="undo"]').click();
        await pause(page);
        assert.equal(await page.locator('[data-lp-item-parent="boxes"]').count(), 4);
        await page.locator('[data-lp-toolbar-btn="save"]').click();
        await pause(page);
      }
      if (side === 'right' || side === 'row-bottom') {
        const first = await page.locator('[data-lp-section-element]').boundingBox();
        point = { x: first.x + first.width / 2, y: first.y + first.height - 2 };
        await drag('dragover');
        await pause(page);
        await page.locator('[data-lp-drop-line]').waitFor();
        await drag('drop');
        if (side === 'row-bottom') {
          await page.locator('[data-lp-element-library-modal]').waitFor();
          await page
            .locator('[data-lp-element-library-modal] [data-lp-paragraph-preset]')
            .first()
            .click();
        }
        await page.waitForTimeout(450);
        assert.equal(
          await page.locator('[data-lp-section-element]').count(),
          2,
          'Drop below an existing inserted element',
        );
        const pair = await page.locator('[data-lp-section-element]').evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
        assert(!overlaps(pair[0], pair[1]), 'Inserted siblings do not overlap');
        await page.locator('[data-lp-toolbar-btn="undo"]').click();
        await pause(page);
        assert.equal(
          await page.locator('[data-lp-section-element]').count(),
          1,
          'One Undo removes only the second drop',
        );
        await page.locator('[data-lp-toolbar-btn="save"]').click();
        await pause(page);
      }
      await page.locator('[data-lp-preview-switch]').click();
      await page.locator('[data-lp-preview-canvas] [data-lp-section-element]').waitFor();
      await pause(page);
      const preview = page.locator('[data-lp-preview-canvas]');
      const pr = await preview.locator('[data-lp-section-element]').boundingBox();
      const previewBoxes = await preview
        .locator('[data-lp-item-parent="boxes"]')
        .evaluateAll((ns) =>
          ns.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
      assert.equal(previewBoxes.length, 4, 'Public rendering retains every native box');
      assert(
        previewBoxes.every((r) => !overlaps(pr, r)),
        'Preview has the same non-overlapping flow',
      );
      await page.locator('[data-lp-preview-shell] [data-lp-preview-switch]').click();
      await pause(page);
      await page.getByRole('button', { name: 'Mobile', exact: true }).click();
      await pause(page);
      const mobileBox = await page.locator('[data-lp-section-element]').boundingBox();
      const mobileCards = await page.locator('[data-lp-item-parent="boxes"]').evaluateAll((ns) =>
        ns.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
      assert(
        mobileCards.every((r) => !overlaps(mobileBox, r)),
        'Mobile stacks the inserted element without overlapping boxes',
      );
      if (side !== 'row-bottom')
        assert(
          Math.max(...mobileCards.map((r) => r.x)) - Math.min(...mobileCards.map((r) => r.x)) < 2,
          'Managed columns stack in logical order on mobile',
        );
      report.steps.push({
        side,
        passed: true,
        anchor: copy.sectionPlacement,
        marker: lr,
        preview: true,
        mobile: true,
      });
      console.log('PASS ' + side);
      await ctx.close();
    }
    assert.deepEqual(report.errors, []);
    report.passed = true;
  } finally {
    if (!report.passed && page && !page.isClosed())
      await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(
    JSON.stringify({
      passed: report.passed,
      steps: report.steps.length,
      errors: report.errors.length,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
