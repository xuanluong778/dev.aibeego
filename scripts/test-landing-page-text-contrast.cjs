const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readableSurfaceColors } = require('../apps/web/src/components/landing-pages/landing-page-readable-colors.ts');
const { chromium } = require(process.env.LP_PLAYWRIGHT_MODULE || 'playwright');
const components = path.resolve(__dirname, '../apps/web/src/components/landing-pages');
const css = ['landing-page-agency-portfolio.css', 'landing-page-text-contrast.css']
  .map(file => fs.readFileSync(path.join(components, file), 'utf8')).join('\n');
const palettes = process.argv[2]
  ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''))
  : [];
const surfaces = [...new Set(['#ffffff', '#0c1a27', '#162c3b', '#292524', '#1e293b', '#777777', '#ff6b00',
  ...palettes.map(p => p.tokens.surface)])];
const rgb = hex => hex.match(/\w\w/g).map(c => parseInt(c, 16));
function luminance(color) {
  const channels = color.map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(fg, bg) {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
// Exercise every gray value, including midtones where off-white/navy can fail AA.
for (let channel = 0; channel < 256; channel++) {
  const bg = '#' + channel.toString(16).padStart(2, '0').repeat(3);
  const colors = readableSurfaceColors(bg);
  for (const ink of Object.values(colors)) assert.ok(contrast(rgb(ink.slice(1)), rgb(bg.slice(1))) >= 4.5, bg);
}
assert.equal(readableSurfaceColors('transparent'), null);
assert.equal(readableSurfaceColors('linear-gradient(red,blue)'), null);
assert.deepEqual(readableSurfaceColors('#162c3bff'), readableSurfaceColors('#162c3b'));
assert.deepEqual(readableSurfaceColors('#fff0', '#162c3b'), readableSurfaceColors('#162c3b'));
const card = (cls, style = '') => `<article class="${cls}" style="${style}"><h3 data-check>Tiêu đề rõ chữ</h3><p data-check>Mô tả nội dung dễ đọc.</p></article>`;
const fixtures = surfaces.map((bg, i) => {
  const c = readableSurfaceColors(bg);
  assert.ok(c, bg);
  return `<div data-lp-renderer="agency-portfolio-v2"><div data-lp-canvas-root data-case="${bg}"
    style="--lp-surface:${bg};--lp-surface-ink:${c.ink};--lp-surface-muted:${c.muted};--lp-text-on-light:${c.ink};--lp-muted-on-light:${c.muted};--lp-on-primary:${c.ink};--orange:${bg};--ink:${c.ink};--muted:${c.muted};background:${bg};color:${c.ink}">
    ${card('benefit-card')}${card('service-card')}${card('step')}
    <article style="background:${bg}" data-lp-card-item><h3 data-check>Legacy card</h3><p data-check>Legacy description</p></article>
    ${card('work-copy', 'background:#fff')}${card('price-card', 'background:#fff')}
    ${card('price-card dark', 'background:#0b1220')}
    <div class="step"><span class="step-num" data-check>01</span></div>
    <a class="btn btn-primary" data-check><span data-lp-inline-field="ctaLabel" data-check>Trao đổi dự án</span></a>
    <article class="service-card" style="background:#fff;--lp-card-ink:#0f172a;--lp-card-muted:#475569"><h3 data-check>Saved white fill</h3><p data-check>Saved fill description</p></article>
    <h2 id="gradient-${i}" style="background-image:linear-gradient(red,blue);background-clip:text;-webkit-text-fill-color:transparent">Gradient heading</h2>
  </div></div>`;
}).join('');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.LP_CHROME_PATH ? { executablePath: process.env.LP_CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    let checked = 0;
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(`<style>${css}</style>${fixtures}`);
      const samples = await page.locator('[data-check]').evaluateAll(elements => elements.map(el => {
        const s = getComputedStyle(el);
        let ancestor = el, bg;
        while (ancestor) {
          const color = getComputedStyle(ancestor).backgroundColor;
          if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') { bg = color; break; }
          ancestor = ancestor.parentElement;
        }
        return { fg: s.color, bg, kind: el.tagName, surface: el.closest('[data-case]').dataset.case };
      }));
      for (const sample of samples) {
        const parse = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const ratio = contrast(parse(sample.fg), parse(sample.bg));
        assert.ok(ratio >= 4.5, `${width}px ${JSON.stringify(sample)} ratio=${ratio}`);
        checked++;
      }
      assert.equal(await page.locator('#gradient-0').evaluate(el => getComputedStyle(el).webkitTextFillColor), 'rgba(0, 0, 0, 0)');
    }
    console.log(JSON.stringify({ passed: true, catalogPalettes: palettes.length, uniqueSurfaces: surfaces.length, checked, viewports: [1440, 390], minimumContrast: 4.5 }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
