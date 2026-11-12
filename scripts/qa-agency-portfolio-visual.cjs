const fs = require('fs'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const BASE = process.env.AGENCY_QA_URL || 'http://127.0.0.1:32941',
  OUT = '/mnt/data/agency-portfolio-implementation';
const design = '/mnt/data/agency-portfolio-design/agency-portfolio.html';
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.route('https://**/*', (r) => r.abort());
  await p.route('**/api/v1/**', (r) => r.fulfill({ status: 200, json: { ok: true, items: [] } }));
  const geometry = [];
  const selectors = [
    '.header',
    '.hero',
    '.benefits',
    '.services',
    '.gallery',
    '.process',
    '.pricing',
    '.faq',
    '.cta',
    '.form-section',
    '.footer',
  ];
  const measure = () =>
    p.evaluate(
      (ss) =>
        Object.fromEntries(
          ss.map((sel) => {
            const e = document.querySelector(sel),
              r = e.getBoundingClientRect();
            return [sel, { top: r.top + scrollY, width: r.width, height: r.height }];
          }),
        ),
      selectors,
    );
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: 900 });
    await p.goto('file://' + design);
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    const approved = await measure();
    await p.goto(BASE + '/lp-agency-pilot?surface=renderer', {
      timeout: 90000,
      waitUntil: 'domcontentloaded',
    });
    await p.waitForFunction(() => typeof window.agencyPilotSetSpec === 'function');
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    const actual = await measure();
    geometry.push({
      width,
      sections: selectors.map((s) => ({
        section: s,
        approved: approved[s],
        actual: actual[s],
        heightDelta: actual[s].height - approved[s].height,
        topDelta: actual[s].top - approved[s].top,
      })),
    });
    await p.screenshot({ path: OUT + '/implemented-' + width + '.png', fullPage: true });
    console.log('CAPTURE implemented', width);
  }
  const contrast = await p.evaluate(() => {
    const lum = (c) => {
      const channels = c
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    return [
      '.hero-description',
      '.hero-points li',
      '.benefit-card p',
      '.service-card p',
      '.faq details p',
      '.price-card.dark li',
      'form label',
      'form .form-optional',
      'form input::placeholder',
      'form .agency-form-footer',
      '.hero .btn-primary',
    ].map((selector) => {
      const [elementSelector, pseudo] = selector.split('::');
      const e = document.querySelector(elementSelector),
        color = getComputedStyle(e, pseudo ? '::' + pseudo : null).color;
      let parent = e,
        bg = '';
      while (parent) {
        bg = getComputedStyle(parent).backgroundColor;
        if (!/^rgba\(0, 0, 0, 0\)$|^transparent$/.test(bg)) break;
        parent = parent.parentElement;
      }
      const fgL = lum(color),
        bgL = lum(bg);
      return {
        selector,
        color,
        background: bg,
        contrastRatio: +((Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05)).toFixed(2),
      };
    });
  });
  for (const row of contrast)
    assert(row.contrastRatio >= 4.5, row.selector + ' contrast ' + row.contrastRatio);
  let spec = structuredClone(shared.getLandingPageSystemTemplate('agency-portfolio').spec);
  spec.meta.inlineTextStyles = { 'agency-hero::headline': { fontSize: 43 } };
  spec.meta.responsiveInlineTextStyles = {
    'agency-hero::headline': { mobile: { fontSize: 29, color: '#225544' } },
  };
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  await p.waitForFunction(() => getComputedStyle(document.querySelector('h1')).fontSize === '29px');
  assert.equal(await p.locator('h1').evaluate((e) => getComputedStyle(e).color), 'rgb(34, 85, 68)');
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForFunction(() => getComputedStyle(document.querySelector('h1')).fontSize === '43px');
  spec.themeTokens.button = '#bbccdd';
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  await p.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('.hero .btn-primary')).backgroundColor ===
      'rgb(187, 204, 221)',
  );
  // Real media controls and formTheme continue to override presentation defaults.
  spec.blocks[1].imageStyle = {
    fit: 'contain',
    position: '20% 80%',
    flip: 'x',
    borderRadius: '23px',
  };
  spec.blocks[9].formTheme.buttonBg = '#ddeeff';
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  const media = await p.locator('.photo-frame img').evaluate((e) => {
    let s = getComputedStyle(e);
    return {
      fit: s.objectFit,
      position: s.objectPosition,
      flip: s.transform,
      radius: s.borderRadius,
    };
  });
  assert.equal(media.fit, 'contain');
  assert.equal(media.position, '20% 80%');
  assert.equal(media.radius, '23px');
  assert.match(media.flip, /-1/);
  await p.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('form button[type=submit]')).backgroundColor ===
      'rgb(221, 238, 255)',
  );
  spec.blocks[0].imageUrl = spec.blocks[1].imageUrl;
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  await p.waitForFunction(() => document.querySelector('.header .brand img')?.naturalWidth > 0);
  const logo = await p
    .locator('.header .brand img')
    .evaluate((e) => ({
      width: e.getBoundingClientRect().width,
      height: e.getBoundingClientRect().height,
    }));
  assert(logo.width <= 120 && logo.height === 36);
  spec = structuredClone(shared.getLandingPageSystemTemplate('agency-portfolio').spec);
  const process = spec.blocks.find((b) => b.type === 'Process');
  process.items.push({ ...process.items[0], id: 'extra-step', title: 'Bước bổ sung' });
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  await p.waitForFunction(
    () => document.querySelector('.process h2').textContent === '5 bước phối hợp.',
  );
  assert.equal(await p.locator('.step').count(), 5);
  fs.writeFileSync(
    OUT + '/visual-comparison.json',
    JSON.stringify(
      {
        geometry,
        contrast,
        responsiveOverrides: 'mobile 29px -> desktop 43px verified in actual renderer',
        media,
        formTheme: 'custom button background wins over global theme',
        globalTheme: 'button palette propagates to CTA',
        logo,
        itemCountMutation: { source: 4, afterDuplicate: 5, heading: '5 bước phối hợp.' },
      },
      null,
      2,
    ),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
