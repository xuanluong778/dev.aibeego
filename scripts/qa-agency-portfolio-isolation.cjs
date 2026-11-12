const fs = require('fs'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const BASE = process.env.AGENCY_QA_URL || 'http://127.0.0.1:32941',
  OUT = '/mnt/data/agency-portfolio-implementation';
const guard =
  ':not(:where([data-lp-style-scope="agency-portfolio-v2"], [data-lp-style-scope="agency-portfolio-v2"] *))';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const p = await browser.newPage();
  await p.route('https://**/*', (r) => r.abort());
  await p.route('**/api/v1/**', (r) => r.fulfill({ status: 200, json: { items: [] } }));
  let results = [];
  const ready = async () => {
    await p.waitForSelector('[data-lp-canvas-root]');
    await p.waitForFunction(() => !!document.getElementById('lp-premium-visual-axis-css'));
    await p.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important}',
    });
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
  };
  await p.goto(BASE + '/lp-template-shot/agency-portfolio');
  await ready();
  const match = await p.evaluate(() => {
    const root = document.querySelector('[data-lp-renderer="agency-portfolio-v2"]');
    let rules = 0,
      matches = 0,
      invalid = [];
    const walk = (arr) => {
      for (const r of arr) {
        if (r.cssRules) walk(r.cssRules);
        if (r.selectorText) {
          rules++;
          try {
            matches += root.matches(r.selectorText) ? 1 : 0;
            matches += root.querySelectorAll(r.selectorText).length;
          } catch (e) {
            invalid.push(r.selectorText);
          }
        }
      }
    };
    for (const el of document.querySelectorAll('style[id^="lp-"]')) {
      if (el.id === 'lp-section-bg-motion-css') continue;
      if (el.sheet) walk(el.sheet.cssRules);
    }
    return { rules, matches, invalid };
  });
  assert.equal(match.matches, 0, 'A legacy foundation selector still matches the pilot');
  assert.deepEqual(match.invalid, []);
  results.push({ isolation: match });
  const snapshot = () =>
    p.locator('[data-lp-canvas-root]').evaluate((root) =>
      [root, ...root.querySelectorAll('section,header,footer,h1,h2,h3,p,li,form,input,button')].map(
        (e) => {
          const s = getComputedStyle(e),
            r = e.getBoundingClientRect();
          return {
            tag: e.tagName,
            width: r.width,
            height: r.height,
            left: r.left,
            top: r.top,
            color: s.color,
            background: s.backgroundColor,
            font: s.fontFamily,
            size: s.fontSize,
            weight: s.fontWeight,
            lineHeight: s.lineHeight,
            display: s.display,
            padding: s.padding,
            margin: s.margin,
            border: s.border,
            shadow: s.boxShadow,
            overflow: s.overflow,
            grid: s.gridTemplateColumns,
          };
        },
      ),
    );
  for (const slug of [
    'legacy',
    'agency-portfolio-form',
    'clinic-booking',
    'saas-trial',
    'spa-wellness',
  ])
    for (const width of [1440, 390]) {
      await p.setViewportSize({ width, height: 900 });
      const url =
        slug === 'legacy'
          ? BASE + '/lp-agency-pilot?surface=legacy'
          : BASE +
            '/lp-template-shot/' +
            slug +
            '?viewport=' +
            (width === 390 ? 'mobile' : 'desktop');
      await p.goto(url, { timeout: 90000 });
      await ready();
      const before = await snapshot();
      if (slug === 'legacy')
        await p.screenshot({ path: OUT + '/legacy-preserved-' + width + '.png', fullPage: true });
      await p.evaluate((g) => {
        for (const el of document.querySelectorAll('style[id^="lp-"]'))
          el.textContent = el.textContent.split(g).join('');
      }, guard);
      await p.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const after = await snapshot();
      assert.deepEqual(
        before,
        after,
        slug + ' ' + width + ' computed styles changed by the isolation guard',
      );
      results.push({ slug, width, nodesCompared: before.length, computedStylesIdentical: true });
      console.log('PASS legacy isolation', slug, width);
    }
  fs.writeFileSync(OUT + '/isolation-results.json', JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
