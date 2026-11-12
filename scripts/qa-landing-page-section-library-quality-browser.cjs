// Real section-library preview UI; all API calls use fixtures. Captures every sample at two widths.
const fs = require('fs'),
  path = require('path'),
  assert = require('assert/strict'),
  { chromium } = require('playwright'),
  shared = require('../packages/shared/dist');
const origin = process.env.LP_SECTION_QA_ORIGIN || 'http://127.0.0.1:13025',
  out = process.env.LP_SECTION_QA_OUT || fs.mkdtempSync('/tmp/lp-section-quality-');
const fixtureFile = process.env.LP_SECTION_QUALITY_FIXTURES;
if (!fixtureFile) throw Error('LP_SECTION_QUALITY_FIXTURES required');
const ids = process.env.LP_SECTION_QA_IDS?.split(',');
const templates = JSON.parse(fs.readFileSync(fixtureFile, 'utf8')).filter(t => !ids || ids.includes(t.id));
const limit = Number(process.env.LP_SECTION_QA_LIMIT || templates.length);
function measure(root) {
  const bg = getComputedStyle(root);
  return {
    width: root.clientWidth,
    scroll: root.scrollWidth,
    height: root.getBoundingClientRect().height,
    color: bg.color,
    background: bg.backgroundColor,
    text: root.innerText,
    headings: [...root.querySelectorAll('h1,h2,h3')].map((n) => ({
      text: n.textContent.trim(),
      color: getComputedStyle(n).color,
      font: getComputedStyle(n).fontFamily,
      size: getComputedStyle(n).fontSize,
      width: n.getBoundingClientRect().width,
    })),
    images: [...root.querySelectorAll('img')].map((n) => ({
      src: n.getAttribute('src'),
      loaded: n.complete && n.naturalWidth > 0,
      width: n.getBoundingClientRect().width,
      height: n.getBoundingClientRect().height,
    })),
    grids: [...root.querySelectorAll('.sl2-grid,.sl2-hero-split,.sl2-gallery')].map((n) => ({
      className: n.className,
      display: getComputedStyle(n).display,
      columns: getComputedStyle(n).gridTemplateColumns,
    })),
    featured: [...root.querySelectorAll('.sl2-gallery-editorial-mosaic [data-lp-item-index],.sl2-gallery-featured-plus-grid [data-lp-item-index]')].map(n => ({index: n.dataset.lpItemIndex, span: getComputedStyle(n).gridColumn, imageRatio: (() => {const i=n.querySelector('img');return i.getBoundingClientRect().width/i.getBoundingClientRect().height})()})),
    textClips: [...root.querySelectorAll('h1,h2,h3,p')]
      .filter(
        (n) =>
          n.clientHeight > 0 &&
          n.scrollHeight > n.clientHeight + 3 &&
          ['hidden', 'clip'].includes(getComputedStyle(n).overflowY),
      )
      .map((n) => n.textContent.trim()),
    sections: root.parentElement.querySelectorAll('[data-sl2-section]').length,
  };
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.LP_QA_BROWSER || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({
    viewport: { width: 1550, height: 1100 },
    reducedMotion: 'reduce',
  });
  const report = {
    passed: false,
    origin,
    samples: [],
    errors: [],
    assetErrors: [],
    problems: [],
    noCustomerWrites: true,
  };
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('/landing-page-assets/'))
      report.assetErrors.push({ url: r.url(), status: r.status() });
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      'ms_access_token',
      'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
    ),
  );
  await page.route('**/api/v1/**', (route) => {
    const p = new URL(route.request().url()).pathname;
    let body = {};
    if (p.endsWith('/auth/me'))
      body = { id: 'qa-quality', name: 'QA', role: 'OWNER', organizationId: 'qa-quality' };
    else if (p.includes('subscription'))
      body = { hasPlan: true, status: 'ACTIVE', isExpired: false };
    else if (p.endsWith('/landing-pages/qa-quality'))
      body = {
        id: 'qa-quality',
        name: 'QA quality',
        status: 'DRAFT',
        draftSpec: shared.createBlankLandingPageSpec(),
      };
    else if (p.includes('templates')) body = { items: [] };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  try {
    await page.goto(origin + '/landing-pages/builder/qa-quality');
    await page.locator('[data-lp-section-chrome]').first().waitFor();
    await page
      .locator('[data-lp-section-chrome]')
      .first()
      .evaluate((el) => {
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
    for (const t of templates.slice(0, limit)) {
      try {
        await page.setViewportSize({ width: 1550, height: 1100 });
        await page.locator('[data-lp-section-library-search]').fill(t.label);
        const card = page.locator(`[data-lp-section-library-card="${t.id}"]`);
        const reopen = async () => {
          if (!(await page.locator('[data-lp-section-library-lightbox]').count()))
            await card.locator('[data-lp-section-library-preview-btn]').click();
        };
        await card.locator('[data-lp-section-library-preview-btn]').click();
        const section = page.locator(
          `[data-lp-section-library-lightbox-canvas] [data-sl2-section="${t.id}"]`,
        );
        await section.waitFor({ timeout: 12000 });
        for (const device of ['desktop', 'mobile']) {
          await page.setViewportSize({ width: device === 'desktop' ? 1550 : 390, height: 1600 });
          await page.waitForTimeout(100);
          await reopen();
          await page.evaluate(() => document.fonts.ready);
          await section
            .locator('img')
            .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode().catch(() => {}))));
          await page.waitForTimeout(100);
          let m = await section.evaluate(measure);
          await page.setViewportSize({
            width: device === 'desktop' ? 1550 : 390,
            height: Math.min(5500, Math.max(1000, Math.ceil(m.height) + 250)),
          });
          await page.waitForTimeout(100);
          await reopen();
          m = await section.evaluate(measure);
          if (m.scroll > m.width + 2)
            report.problems.push({ id: t.id, device, problem: 'horizontal overflow', ...m });
          if (!m.headings.length)
            report.problems.push({ id: t.id, device, problem: 'missing heading' });
          if (m.images.some((i) => !i.loaded || i.height < 60 || i.width < 70))
            report.problems.push({
              id: t.id,
              device,
              problem: 'broken/collapsed image',
              images: m.images,
            });
          if (m.featured.some(x => x.index === '0' ? !x.span.includes('span 2') || x.imageRatio < 1.9 : x.span.includes('span 2'))) report.problems.push({id: t.id, device, problem: 'featured gallery layout', featured: m.featured});
          if (m.textClips.length)
            report.problems.push({ id: t.id, device, problem: 'clipped text', text: m.textClips });
          if (m.sections !== 1)
            report.problems.push({
              id: t.id,
              device,
              problem: 'duplicate section',
              count: m.sections,
            });
          const name = t.id + '-' + device + '.png';
          await section.screenshot({ path: path.join(out, name) });
          report.samples.push({ id: t.id, label: t.label, device, file: name, metrics: m });
        }
        await page.locator('[data-lp-section-library-lightbox-close]').click();
      } catch (error) {
        report.problems.push({ id: t.id, problem: error.message });
        await page.screenshot({ path: path.join(out, t.id + '-error.png') });
        break;
      }
      if (report.samples.length % 20 === 0)
        console.log(
          'Checked',
          report.samples.length / 2,
          'templates, problems:',
          report.problems.length,
        );
    }
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.assetErrors, []);
    assert.deepEqual(report.problems, []);
    assert.equal(report.samples.length, limit * 2);
    report.passed = true;
    console.log(
      JSON.stringify({ passed: true, templates: limit, viewports: 2, errors: 0, assetErrors: 0 }),
    );
  } finally {
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
