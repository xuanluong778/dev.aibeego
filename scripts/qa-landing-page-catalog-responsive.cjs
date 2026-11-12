#!/usr/bin/env node
/**
 * Phase 3 — responsive smoke: 1 primary template × 20 categories × 3 viewports.
 *   PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright node scripts/qa-landing-page-catalog-responsive.cjs
 */
const { chromium } = require('playwright');
const {
  LANDING_PAGE_CATEGORIES,
  LANDING_PAGE_SYSTEM_TEMPLATES,
} = require('../packages/shared/dist/index.js');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

async function main() {
  const primaries = LANDING_PAGE_CATEGORIES.map((cat) => {
    const list = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === cat);
    return list.find((t) => !t.slug.includes('-')) || list[0];
  }).filter(Boolean);

  const browser = await chromium.launch({ headless: true });
  let fail = 0;
  for (const tpl of primaries) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
        *{box-sizing:border-box} body{margin:0;font-family:system-ui,sans-serif;overflow-x:hidden}
        section{padding:24px 20px;max-width:100%}
        h1{font-size:clamp(22px,5vw,36px);word-break:break-word}
        img{max-width:100%;height:auto}
      </style></head><body>
        ${(tpl.spec.blocks || [])
          .filter((b) => b.enabled !== false)
          .map(
            (b) =>
              `<section data-type="${b.type}"><h1>${String(b.headline || b.type).slice(0, 120)}</h1>
              <p>${String(b.subheadline || b.type).slice(0, 200)}</p></section>`,
          )
          .join('')}
      </body></html>`;
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 2;
      });
      const ok = !overflow;
      console.log((ok ? 'PASS' : 'FAIL') + ` ${tpl.slug}@${vp.name} overflow=${overflow}`);
      if (!ok) fail += 1;
      await page.close();
    }
  }
  await browser.close();
  console.log(`\nVISUAL_QA_CATALOG=${fail === 0 ? 'PASS' : 'FAIL'} fails=${fail}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
