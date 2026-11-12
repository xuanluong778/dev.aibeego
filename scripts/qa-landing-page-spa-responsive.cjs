#!/usr/bin/env node
/**
 * Visual smoke for SPA templates (1440 / 768 / 390).
 * Prefers real renderer route when LP_SHOT_BASE_URL is up; else HTML fallback.
 *   PLAYWRIGHT_BROWSERS_PATH=... node scripts/qa-landing-page-spa-responsive.cjs
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const { LANDING_PAGE_SYSTEM_TEMPLATES, LANDING_PAGE_THEME_PRESETS } =
  require('../packages/shared/dist/index.js');

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tokensFor(tpl) {
  return tpl.spec.themeTokens || LANDING_PAGE_THEME_PRESETS[tpl.theme] || LANDING_PAGE_THEME_PRESETS.MODERN;
}

function renderFallbackHtml(tpl) {
  const tokens = tokensFor(tpl);
  const blocks = (tpl.spec.blocks || []).filter((b) => b.enabled !== false);
  const primary = tokens.primary;
  const secondary = tokens.secondary;
  const muted = tokens.muted || '#64748b';
  const body = blocks
    .map((block) => {
      if (block.type === 'Hero') {
        return `<section style="padding:40px 28px"><h1 style="margin:0;font-size:clamp(24px,5vw,34px);color:${esc(
          secondary,
        )}">${esc(block.headline || '')}</h1>
        <p style="color:${esc(muted)}">${esc(block.subheadline || '')}</p>
        ${
          block.ctaLabel
            ? `<div style="margin-top:16px;display:inline-block;background:${esc(
                primary,
              )};color:#fff;padding:12px 16px;border-radius:10px">${esc(block.ctaLabel)}</div>`
            : ''
        }</section>`;
      }
      if (block.type === 'LeadForm') {
        return `<section id="lead-form" style="padding:32px 28px"><h3>${esc(
          block.headline || 'Form',
        )}</h3><div style="height:40px;border:1px solid #ddd;border-radius:8px;margin:8px 0"></div>
        <div style="background:${esc(primary)};color:#fff;padding:12px;border-radius:8px;text-align:center">${esc(
          block.submitLabel || 'Gửi',
        )}</div></section>`;
      }
      if (block.type === 'CTA') {
        return `<section style="padding:36px;background:${esc(primary)};color:#fff;text-align:center"><h2>${esc(
          block.headline || 'CTA',
        )}</h2></section>`;
      }
      return `<section style="padding:24px 28px"><h2 style="font-size:18px">${esc(
        block.headline || block.type,
      )}</h2></section>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>html,body{margin:0;font-family:system-ui}*{box-sizing:border-box}h1,h2{overflow-wrap:anywhere}</style></head>
<body data-lp-qa="1">${body}</body></html>`;
}

async function main() {
  const spa = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === 'spa');
  const widths = [1440, 768, 390];
  const shotBase = (process.env.LP_SHOT_BASE_URL || 'http://127.0.0.1:3020').replace(/\/$/, '');
  let useRenderer = false;
  try {
    const res = await fetch(`${shotBase}/lp-template-shot/spa-wellness`, { signal: AbortSignal.timeout(5000) });
    const text = await res.text();
    useRenderer = res.ok && /data-lp-template-shot|data-lp-canvas-root/i.test(text);
  } catch {
    useRenderer = false;
  }

  const browser = await chromium.launch({ headless: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-qa-'));
  let pass = true;
  console.log(`QA via ${useRenderer ? 'renderer-route' : 'html-fallback'}`);

  for (const tpl of spa) {
    const page = await browser.newPage();
    if (!useRenderer) {
      fs.writeFileSync(path.join(tmp, `${tpl.slug}.html`), renderFallbackHtml(tpl));
    }
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      if (useRenderer) {
        await page.goto(`${shotBase}/lp-template-shot/${encodeURIComponent(tpl.slug)}?viewport=${
          w <= 430 ? 'mobile' : w <= 900 ? 'tablet' : 'desktop'
        }`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForSelector('h1, [data-lp-template-shot]', { timeout: 20000 });
      } else {
        await page.goto(pathToFileURL(path.join(tmp, `${tpl.slug}.html`)).href, { waitUntil: 'load' });
      }
      const mtr = await page.evaluate(() => {
        const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const overflowX = scrollWidth > Math.ceil(window.innerWidth) + 1;
        const h1 = document.querySelector('h1');
        const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const text = document.body.innerText || '';
        const hasCta = /đặt lịch|giữ chỗ|nhận combo|gửi|tư vấn|đặt vip/i.test(text);
        const hasForm = !!document.querySelector('#lead-form, form, input');
        return {
          overflowX,
          scrollWidth,
          hasH1: !!h1,
          hasCtaOrForm: hasCta || hasForm,
          height,
          h1: (h1?.textContent || '').slice(0, 48),
        };
      });
      const ok = !mtr.overflowX && mtr.hasH1 && mtr.hasCtaOrForm && mtr.height > 80;
      if (!ok) pass = false;
      console.log(ok ? 'PASS' : 'FAIL', `${tpl.slug}@${w}`, JSON.stringify(mtr));
    }
    await page.close();
  }

  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`VISUAL_QA_SPA=${pass ? 'PASS' : 'FAIL'}`);
  process.exitCode = pass ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
