#!/usr/bin/env node
/**
 * Classify visual issues across 200 templates × 3 viewports.
 *   node scripts/audit-landing-page-visual-classify.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const shared = require('../packages/shared/dist/index.js');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = shared;

const BASE = (process.env.LP_SHOT_BASE_URL || 'http://127.0.0.1:3020').replace(/\/$/, '');
const OUT_DIR = path.resolve(process.env.LP_GLOBAL_QA_DIR || path.join(__dirname, '../.tmp/global-visual-qa'));
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, shotVp: 'desktop' },
  { name: 'tablet', width: 768, height: 1024, shotVp: 'tablet' },
  { name: 'mobile', width: 390, height: 844, shotVp: 'mobile' },
];

async function classifyPage(page, slug, vp) {
  const url = `${BASE}/lp-template-shot/${encodeURIComponent(slug)}?viewport=${vp.shotVp}`;
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  if (!resp?.ok()) throw new Error(`HTTP ${resp?.status()}`);
  await page.waitForSelector('[data-lp-canvas-root]', { timeout: 30000 });
  await page.waitForTimeout(250);

  return page.evaluate(() => {
    const issues = { CRITICAL: [], HIGH: [], MEDIUM: [] };
    const vw = window.innerWidth;

    const containers = Array.from(
      document.querySelectorAll(
        '[data-lp-container-inner], [data-lp-header-inner], [data-lp-canvas-root] .max-w-6xl',
      ),
    ).filter((c) => c.getBoundingClientRect().width > 120);
    if (containers.length > 1) {
      const lefts = containers.map((c) => Math.round(c.getBoundingClientRect().left));
      const ref = lefts[0];
      const off = lefts.filter((l) => Math.abs(l - ref) > 4).length;
      if (off > 2) issues.CRITICAL.push(`misaligned_containers=${off}`);
    }

    const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (docW > vw + 2) issues.CRITICAL.push('horizontal_overflow');

    for (const el of document.querySelectorAll('[data-lp-hero-copy] h1, [data-lp-section-head] h2')) {
      if (el.scrollWidth > el.clientWidth + 2) issues.HIGH.push('text_clip_heading');
    }

    const sections = Array.from(document.querySelectorAll('[data-lp-section-chrome] > section'));
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      const textLen = (sec.innerText || '').replace(/\s+/g, ' ').trim().length;
      const hasMedia = sec.querySelector('img[data-lp-content-image], [data-lp-img-fallback], iframe');
      if (!hasMedia && textLen < 24 && r.height > 360) issues.HIGH.push('dead_space_section');
      const emptyHero = sec.querySelector(
        '[data-lp-hero-visual]:not(:has(img[data-lp-content-image], [data-lp-img-fallback]))',
      );
      if (emptyHero && emptyHero.getBoundingClientRect().height > 400) issues.HIGH.push('empty_hero_visual');
    }

    const broken = [...document.querySelectorAll('img[data-lp-content-image]')].filter(
      (img) => img.complete && img.naturalWidth === 0 && img.offsetParent !== null,
    ).length;
    if (broken > 0) issues.CRITICAL.push(`broken_images=${broken}`);

    const pxSections = sections.filter((s) => {
      const cs = getComputedStyle(s);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      return pl > 20 && pr > 20;
    });
    if (pxSections.length > 0) issues.MEDIUM.push('double_section_padding');

    const pageH = document.querySelector('[data-lp-canvas-root]')?.scrollHeight || 0;
    if (pageH > 5200 && sections.length < 6) issues.MEDIUM.push('excessive_page_height');

    return issues;
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, templates: {} };
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const tpl of LANDING_PAGE_SYSTEM_TEMPLATES) {
      summary.templates[tpl.slug] = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, viewports: {} };
      for (const vp of VIEWPORTS) {
        try {
          const issues = await classifyPage(page, tpl.slug, vp);
          for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM']) {
            const n = issues[sev].length;
            summary[sev] += n;
            summary.templates[tpl.slug][sev] += n;
          }
          summary.templates[tpl.slug].viewports[vp.name] = issues;
        } catch (e) {
          summary.CRITICAL += 1;
          summary.templates[tpl.slug].CRITICAL += 1;
          summary.templates[tpl.slug].viewports[vp.name] = { CRITICAL: [String(e.message)], HIGH: [], MEDIUM: [] };
        }
      }
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  const out = path.join(OUT_DIR, 'visual-classify-report.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  console.log('VISUAL_CLASSIFY', JSON.stringify({ CRITICAL: summary.CRITICAL, HIGH: summary.HIGH, MEDIUM: summary.MEDIUM }));
  console.log('REPORT', out);
})();
