#!/usr/bin/env node
// Reproduce the video symptom with the real old/new ownership CSS in Chromium.
const {
  assert,
  fs,
  path,
  vm,
  definition,
  evaluate,
  rendererSource,
} = require('./helpers/landing-page-source-harness.cjs');
const { chromium } = require('playwright');
const out =
  process.env.LP_HIDDEN_QA_OUT ||
  path.resolve(__dirname, '../docs/evidence/landing-text-columns-20261105');
const spec = { meta: { elementHidden: { 'hero::subheadline': true } } };
// Exact legacy selector responsible for the video's blank text node.
const oldCss =
  '[data-lp-block-id="hero"] [data-lp-inline-field="subheadline"]{display:none!important}';
const newCss = evaluate(
  definition(rendererSource, 'buildElementHiddenCss'),
  vm.createContext({}),
)(spec);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.LP_QA_BROWSER || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
  const report = {};
  try {
    for (const [name, css] of [
      ['before', oldCss],
      ['after', newCss],
    ]) {
      await page.setContent(
        `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:20px system-ui}section{padding:30px}p{margin:0}#selected{display:inline-block;position:relative;width:400px;height:180px;outline:2px solid #f97316;padding:5px}#hero{background:#79b18b;min-height:310px}#benefits{background:white}${css}</style><section id="hero" data-lp-block-id="hero"><h1>Hero nền xanh</h1><p id="own" data-lp-inline-field="subheadline" data-lp-element-id="hero::subheadline">Chỉ ẩn đoạn văn này</p><div data-lp-section-element="1" data-lp-block-id="inserted"><span id="selected" data-lp-inline-wrap="paragraph"><p id="text" data-lp-inline-field="subheadline" data-lp-element-id="inserted::subheadline">Đoạn văn đã có nội dung. Khung chọn và bảng Text vẫn tồn tại khi CSS của Hero ẩn nhầm đoạn văn con.</p></span></div></section><section id="benefits"><h2>Benefits nền trắng</h2><p>Đoạn văn Benefits vẫn hiển thị.</p></section>`,
      );
      report[name] = await page.locator('#text').evaluate((n) => {
        const r = n.getBoundingClientRect(),
          w = n.closest('[data-lp-inline-wrap]').getBoundingClientRect(),
          s = getComputedStyle(n);
        return {
          content: n.textContent,
          display: s.display,
          color: s.color,
          visibility: s.visibility,
          opacity: s.opacity,
          overflow: s.overflow,
          zIndex: s.zIndex,
          textRect: { x: r.x, y: r.y, width: r.width, height: r.height },
          selectionRect: { x: w.x, y: w.y, width: w.width, height: w.height },
        };
      });
      assert.equal(await page.locator('#own').evaluate((n) => getComputedStyle(n).display), 'none');
      assert.equal(report[name].display, name === 'before' ? 'none' : 'block');
      assert(report[name].selectionRect.width > 0 && report[name].selectionRect.height > 0);
      if (name === 'after') assert(report[name].textRect.height > 0);
      await page.screenshot({ path: path.join(out, 'hidden-text-' + name + '.png') });
    }
    report.passed = true;
    fs.writeFileSync(path.join(out, 'hidden-text-diagnosis.json'), JSON.stringify(report, null, 2));
    console.log(
      'PASS hidden Hero CSS only hides its own field; nested text remains visible inside the selection frame',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
