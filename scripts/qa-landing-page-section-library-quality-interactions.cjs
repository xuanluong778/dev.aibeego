// Version isolation + real insert/edit/save/duplicate/preview using intercepted fixture APIs only.
const fs = require('fs'),
  path = require('path'),
  assert = require('assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_SECTION_QA_ORIGIN || 'http://127.0.0.1:13025',
  baseline = process.env.LP_SECTION_BASELINE_ORIGIN || 'https://aibeego.com',
  out = process.env.LP_SECTION_QA_OUT || fs.mkdtempSync('/tmp/lp-sl2-interactions-');
const fixtures = JSON.parse(fs.readFileSync(process.env.LP_SECTION_QUALITY_FIXTURES, 'utf8'));
const oldCatalog = JSON.parse(fs.readFileSync(process.env.LP_SECTION_OLD_CATALOG, 'utf8'));
let seq = 0;
const oldBlocks = oldCatalog
  .filter((t) => ['hero-02', 'hero-10', 'ben-07', 'feat-06'].includes(t.id))
  .map((t) => {
    const p = structuredClone(t.patch);
    for (const key of ['items', 'plans', 'fields'])
      if (p[key]) p[key] = p[key].map((x) => ({ ...x, id: 'old-item-' + ++seq }));
    return {
      id: 'old-section-' + t.id,
      type: t.blockType,
      enabled: true,
      spacing: 'md',
      ...p,
      style: {
        lpSectionLibrary: {
          version: 1,
          templateId: t.id,
          theme: t.previewTheme,
          themeTokens: t.previewTokens,
          designFamily: t.designFamily,
        },
      },
    };
  });
const initial = shared.sanitizeLandingPagePersistSpec({
  ...shared.createBlankLandingPageSpec(),
  blocks: [...shared.createBlankLandingPageSpec().blocks, ...oldBlocks],
});
function metrics(node) {
  return {
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    text: [...node.querySelectorAll('h1,h2,h3,p,.sl2-card-title')].map((n) => ({
      text: n.textContent.trim(),
      font: getComputedStyle(n).fontFamily,
      size: getComputedStyle(n).fontSize,
      color: getComputedStyle(n).color,
    })),
    images: [...node.querySelectorAll('img')].map((n) => ({
      src: n.getAttribute('src'),
      width: n.getBoundingClientRect().width,
      height: n.getBoundingClientRect().height,
    })),
    buttons: [...node.querySelectorAll('.sl2-btn')].map((n) => ({
      text: n.textContent.trim(),
      background: getComputedStyle(n).backgroundColor,
      color: getComputedStyle(n).color,
      font: getComputedStyle(n).fontSize,
      radius: getComputedStyle(n).borderRadius,
    })),
  };
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const report = { passed: false, steps: [], errors: [], noCustomerWrites: true };
  async function setup(url, saved) {
    const p = await browser.newPage({ viewport: { width: 1550, height: 1100 } });
    let spec = structuredClone(saved);
    const original = JSON.stringify(spec.blocks);
    p.on('pageerror', (e) => report.errors.push(e.message));
    await p.addInitScript(() =>
      localStorage.setItem(
        'ms_access_token',
        'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
      ),
    );
    // Keep legacy typography comparison independent of third-party font timing.
    await p.route('https://fonts.googleapis.com/**', route=>route.fulfill({contentType:'text/css',body:''}));
    await p.route('https://fonts.gstatic.com/**', route=>route.abort());
    await p.route('**/api/v1/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      let body = {};
      if (path.endsWith('/auth/me'))
        body = { id: 'qa-v2', name: 'QA', role: 'OWNER', organizationId: 'qa-v2' };
      else if (path.includes('subscription'))
        body = { hasPlan: true, status: 'ACTIVE', isExpired: false };
      else if (path.endsWith('/landing-pages/qa-v2'))
        body = { id: 'qa-v2', name: 'QA v2', status: 'DRAFT', draftSpec: spec };
      else if (path.endsWith('/autosave')) {
        const r = route.request().postDataJSON();
        spec = shared.sanitizeLandingPagePersistSpec(r.draftSpec);
        spec.meta = { ...spec.meta, clientRevision: r.clientRevision };
        body = {
          updatedAt: new Date().toISOString(),
          requestId: r.requestId,
          clientRevision: r.clientRevision,
        };
      } else if (path.includes('templates')) body = { items: [] };
      else
        assert.ok(['GET', 'HEAD'].includes(route.request().method()), 'Unexpected write ' + path);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await p.goto(url + '/landing-pages/builder/qa-v2');
    await p.locator('[data-lp-canvas-root]').first().waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    return { page: p, get: () => spec, original };
  }
  try {
    const before = await setup(baseline, initial),
      after = await setup(origin, initial);
    const a = await before.page.locator('[data-lp-block-slot]').evaluateAll((ns) =>
      ns.map((n) => ({
        id: n.dataset.lpBlockSlot,
        ...(function (node) {
          return {
            width: node.getBoundingClientRect().width,
            height: node.getBoundingClientRect().height,
            text: [...node.querySelectorAll('h1,h2,h3,p,.sl2-card-title')].map((n) => ({
              text: n.textContent.trim(),
              font: getComputedStyle(n).fontFamily,
              size: getComputedStyle(n).fontSize,
              color: getComputedStyle(n).color,
            })),
          };
        })(n),
      })),
    );
    const c = await after.page
      .locator('[data-lp-block-slot]')
      .evaluateAll((ns) =>
        ns.map((n) => ({
          id: n.dataset.lpBlockSlot,
          width: n.getBoundingClientRect().width,
          height: n.getBoundingClientRect().height,
          text: [...n.querySelectorAll('h1,h2,h3,p,.sl2-card-title')].map((n) => ({
            text: n.textContent.trim(),
            font: getComputedStyle(n).fontFamily,
            size: getComputedStyle(n).fontSize,
            color: getComputedStyle(n).color,
          })),
        })),
      );
    assert.equal(c.length,a.length);
    c.forEach((actual,index)=>{
      const expected=a[index];
      assert.equal(actual.id,expected.id);
      assert.ok(Math.abs(actual.width-expected.width)<1,'Legacy width unchanged');
      assert.ok(Math.abs(actual.height-expected.height)<1,'Legacy height unchanged: '+actual.id);
      assert.deepEqual(actual.text,expected.text,'Legacy copy/color/font unchanged');
    });
    await before.page.close();
    report.steps.push('Existing blank/v1 sections visually identical to deployed baseline');
    const page = after.page,
      save = async () => {
        await page.locator('[data-lp-toolbar-btn=save]').click();
        await page.waitForTimeout(1500);
      },
      local = (id) => page.locator(`[data-lp-block-slot="${id}"] .sl2-stage`);
    for (const templateId of [
      'hero-10',
      'intro-06',
      'ben-07',
      'feat-06',
      'price-05',
      'faq-02',
      'lead-02',
      'vid-01',
      'cd-01',
    ]) {
      const t = fixtures.find((x) => x.id === templateId);
      const host = page.locator('[data-lp-section-chrome]').first();
      await host.scrollIntoViewIfNeeded();
      await host.evaluate((el) => {
        const r = el.getBoundingClientRect(),
          dt = new DataTransfer();
        dt.setData(
          'application/x-lp-sidebar-preset',
          JSON.stringify({ kind: 'section-library-open' }),
        );
        for (const type of ['dragover', 'drop'])
          el.dispatchEvent(
            new DragEvent(type, {
              bubbles: true,
              cancelable: true,
              dataTransfer: dt,
              clientX: r.left + r.width / 2,
              clientY: r.bottom - 3,
            }),
          );
      });
      await page.locator('[data-lp-section-library-search]').fill(t.label);
      await page
        .locator(
          `[data-lp-section-library-card="${templateId}"] [data-lp-section-library-preview-btn]`,
        )
        .click();
      const preview = page.locator(
        `[data-lp-section-library-lightbox-canvas] [data-sl2-section="${templateId}"]`,
      );
      await preview.waitFor();
      const m = await preview.evaluate(metrics);
      await page.locator('[data-lp-section-library-lightbox-insert]').click();
      await save();
      const block = after
        .get()
        .blocks.find(
          (x) =>
            x.style?.lpSectionLibrary?.version === 2 &&
            x.style.lpSectionLibrary.templateId === templateId,
        );
      assert.ok(block, templateId + ' persisted');
      const inserted = await local(block.id).evaluate(metrics);
      assert.deepEqual(
        inserted.text.map((x) => ({ text: x.text, font: x.font, size: x.size, color: x.color })),
        m.text,
        templateId + ' text matches preview',
      );
      assert.deepEqual(inserted.buttons, m.buttons, templateId + ' CTA matches preview');
      assert.deepEqual(
        inserted.images.map((x) => x.src),
        m.images.map((x) => x.src),
      );
      const flow = await local(block.id).evaluate(n=>({width:n.clientWidth,scroll:n.scrollWidth}));
      assert.ok(flow.scroll<=flow.width+2,templateId+' editor text stays inside section');
      report.steps.push('Preview/insert ' + templateId);
    }
    for (const original of initial.blocks)
      (assert.deepEqual(
        JSON.parse(JSON.stringify(after.get().blocks.find((x) => x.id === original.id))),
        JSON.parse(JSON.stringify(original)),
      ),
        'Existing draft data preserved');
    assert.equal(await page.locator('[data-lp-canvas-root]').count(), 1);
    report.steps.push('One canvas root; original stored content unchanged');
    const hero = after
      .get()
      .blocks.find(
        (x) =>
          x.style?.lpSectionLibrary?.version === 2 &&
          x.style.lpSectionLibrary.templateId === 'hero-10',
      );
    const title = local(hero.id).locator('[data-lp-inline-field=headline]');
    await title.dblclick();
    await title.fill('Nội dung mẫu đã được chỉnh sửa');
    await page.keyboard.press('Tab');
    await save();
    assert.equal(
      after.get().blocks.find((x) => x.id === hero.id).headline,
      'Nội dung mẫu đã được chỉnh sửa',
    );
    await page.locator('[data-lp-toolbar-btn=undo]').click();
    await page.waitForTimeout(300);
    assert.notEqual(await title.innerText(), 'Nội dung mẫu đã được chỉnh sửa');
    await page.locator('[data-lp-toolbar-btn=redo]').click();
    await save();
    report.steps.push('Text edit, undo/redo and save');
    await page.evaluate(() => {
      const token = localStorage.getItem('ms_access_token');
      localStorage.clear();
      localStorage.setItem('ms_access_token', token);
    });
    await page.reload();
    await local(hero.id).waitFor();
    assert.equal(
      await local(hero.id).locator('[data-lp-inline-field=headline]').innerText(),
      'Nội dung mẫu đã được chỉnh sửa',
    );
    report.steps.push('Server fixture reload keeps edited v2 design');
    const video = after
      .get()
      .blocks.find((x) => x.type === 'Video' && x.style?.lpSectionLibrary?.version === 2);
    await local(video.id)
      .locator('.sl2-video')
      .click({ position: { x: 20, y: 20 } });
    await page.locator('[data-lp-inspector-video]').waitFor();
    report.steps.push('Video opens existing URL inspector');
    await local(hero.id).locator('.sl2-title').click();
    await page
      .locator(`[data-lp-block-slot="${hero.id}"] [data-lp-section-chrome]`)
      .click({ position: { x: 6, y: 6 } });
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Nhân bản', exact: true }).last().click();
    await save();
    const clones = after
      .get()
      .blocks.filter(
        (x) =>
          x.style?.lpSectionLibrary?.version === 2 &&
          x.style.lpSectionLibrary.templateId === 'hero-10',
      );
    assert.equal(clones.length, 2);
    assert.deepEqual(clones[0].style.lpSectionLibrary, clones[1].style.lpSectionLibrary);
    report.steps.push('Duplicate keeps snapshot and new ID');
    await page.locator('[data-lp-preview-switch]').click();
    await page.locator('[data-lp-preview-canvas]').waitFor();
    for (const device of ['desktop', 'tablet', 'mobile']) {
      await page.locator(`[data-lp-toolbar-btn=${device}]`).click();
      await page.waitForTimeout(200);
      const roots = page.locator('[data-lp-preview-canvas] .sl2-stage');
      const overflow = await roots.evaluateAll((ns) =>
        ns.filter((n) => n.scrollWidth > n.clientWidth + 2).map((n) => n.dataset.sl2Section),
      );
      assert.deepEqual(overflow, [], device + ' no overflow');
      report.steps.push(device + ' page preview');
    }
    assert.deepEqual(report.errors, []);
    report.passed = true;
    await page.screenshot({ path: path.join(out, 'mobile-preview.png') });
    console.log(JSON.stringify(report));
    await page.close();
  } finally {
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
