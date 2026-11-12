#!/usr/bin/env node
/**
 * Agency 10 templates — responsive QA at 1440 / 1024 / 768 / 390 / 375 via shot route.
 * Fresh browser per template to avoid OOM on low-RAM hosts.
 *   node scripts/qa-landing-page-agency-responsive.cjs
 */
const { chromium } = require('playwright');

const shared = require('../packages/shared/dist/index.js');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = shared;

const BASE = (process.env.LP_SHOT_BASE_URL || 'http://127.0.0.1:3020').replace(/\/$/, '');
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet1024', width: 1024, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile375', width: 375, height: 812 },
];

const agency = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === 'agency');

async function qaSlug(page, slug, vp) {
  const shotVp = vp.name.startsWith('mobile') ? 'mobile' : vp.name === 'tablet1024' ? 'tablet' : vp.name;
  const url = `${BASE}/lp-template-shot/${encodeURIComponent(slug)}?viewport=${shotVp}`;
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  if (!resp?.ok()) throw new Error(`HTTP ${resp?.status()} ${slug} ${vp.name}`);

  await page.waitForSelector('[data-lp-canvas-root]', { timeout: 25000 });
  await page.waitForTimeout(400);

  return page.evaluate(() => {
    const root = document.querySelector('[data-lp-canvas-root]');
    const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const vw = window.innerWidth;
    const overflowX = docW > vw + 2;
    const hasPlaceholder = /Placeholder|Thêm ảnh thật trong Builder|Thêm URL video|\[Tên khách\]|\[Nội dung đánh giá|cập nhật liên hệ trong Builder|Portfolio\s*→|Audit\s*→|Hero\s*→/i.test(
      root?.innerText || '',
    );
    const form = document.querySelector('[data-lp-form-block], form#lead-form');
    let formOverflow = false;
    if (form) {
      const r = form.getBoundingClientRect();
      formOverflow = r.width > vw + 1;
    }
    const heroGrid = document.querySelector('[data-lp-hero-grid]');
    let heroCols = 1;
    if (heroGrid) {
      const style = getComputedStyle(heroGrid);
      heroCols = style.display === 'grid' ? style.gridTemplateColumns.split(' ').length : 1;
    }
    const h1 = document.querySelector('[data-lp-hero-copy] h1, [data-lp-hero-copy] [data-lp-inline-field="headline"]');
    const h1Size = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
    return {
      overflowX,
      hasPlaceholder,
      formOverflow,
      heroCols,
      h1Size,
      height: root?.scrollHeight || 0,
    };
  });
}

(async () => {
  let fail = 0;
  const rows = [];

  for (const tpl of agency) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      for (const vp of VIEWPORTS) {
        try {
          const r = await qaSlug(page, tpl.slug, vp);
          const ok =
            !r.overflowX &&
            !r.hasPlaceholder &&
            !r.formOverflow &&
            r.height > 120 &&
            (!vp.name.startsWith('mobile') || r.heroCols <= 1) &&
            (!vp.name.startsWith('mobile') || (r.h1Size >= 22 && r.h1Size <= 38));
          if (!ok) fail += 1;
          rows.push({ slug: tpl.slug, vp: vp.name, ok, ...r });
          console.log(
            `${ok ? 'PASS' : 'FAIL'} ${tpl.slug} @${vp.name} overflowX=${r.overflowX} placeholder=${r.hasPlaceholder} form=${r.formOverflow} heroCols=${r.heroCols} h1=${r.h1Size}px`,
          );
        } catch (e) {
          fail += 1;
          console.log(`FAIL ${tpl.slug} @${vp.name}: ${e instanceof Error ? e.message : e}`);
        }
      }
    } finally {
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  }

  console.log(`AGENCY_RESPONSIVE_QA total=${rows.length} fail=${fail}`);
  process.exitCode = fail > 0 ? 1 : 0;
})();
