#!/usr/bin/env node
/**
 * Global visual QA — all 200 templates × desktop/tablet/mobile.
 *   node scripts/qa-landing-page-global-visual.cjs
 *   LP_GLOBAL_BATCH=0 LP_GLOBAL_BATCH_SIZE=30 node scripts/qa-landing-page-global-visual.cjs
 *   LP_GLOBAL_CONTACT_SHEET=1 node scripts/qa-landing-page-global-visual.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const shared = require('../packages/shared/dist/index.js');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = shared;

const BASE = (process.env.LP_SHOT_BASE_URL || 'http://127.0.0.1:3020').replace(/\/$/, '');
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, shotVp: 'desktop' },
  { name: 'tablet', width: 768, height: 1024, shotVp: 'tablet' },
  { name: 'mobile', width: 390, height: 844, shotVp: 'mobile' },
];

const BATCH = parseInt(process.env.LP_GLOBAL_BATCH || '0', 10);
const BATCH_SIZE = parseInt(process.env.LP_GLOBAL_BATCH_SIZE || '200', 10);
const OUT_DIR = path.resolve(process.env.LP_GLOBAL_QA_DIR || path.join(__dirname, '../.tmp/global-visual-qa'));
const CONTACT_SHEET = process.env.LP_GLOBAL_CONTACT_SHEET === '1';
const SHOT_DIR = path.join(OUT_DIR, 'shots');

const PLACEHOLDER_RE =
  /Placeholder|Thêm ảnh thật trong Builder|Thêm URL video|\[Tên khách\]|\[Nội dung đánh giá|cập nhật liên hệ trong Builder|Portfolio\s*→\s*\w|Hero\s*→\s*\w|Audit\s*→\s*(?:problem|test|scale|triển|solution|offer)|Campaign \d|Mô tả ngắn|Placeholder diễn giả/i;

const templates = LANDING_PAGE_SYSTEM_TEMPLATES.slice(BATCH * BATCH_SIZE, (BATCH + 1) * BATCH_SIZE);
if (!templates.length) {
  console.error(`No templates for batch ${BATCH} size ${BATCH_SIZE}`);
  process.exit(2);
}

function relLum([r, g, b]) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg, bg) {
  const L1 = relLum(fg);
  const L2 = relLum(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(str) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(str || '');
  if (!m) return [0, 0, 0];
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
}

async function auditPage(page, slug, vp) {
  const url = `${BASE}/lp-template-shot/${encodeURIComponent(slug)}?viewport=${vp.shotVp}`;
  await page.setViewportSize({ width: vp.width, height: vp.height });
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  if (!resp?.ok()) throw new Error(`HTTP ${resp?.status()}`);
  await page.waitForSelector('[data-lp-canvas-root]', { timeout: 30000 });
  await page
    .waitForFunction(
      () => [...document.querySelectorAll('img[data-lp-content-image]')].every((img) => img.complete),
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(300);

  if (CONTACT_SHEET) {
    fs.mkdirSync(path.join(SHOT_DIR, vp.name), { recursive: true });
    await page.screenshot({
      path: path.join(SHOT_DIR, vp.name, `${slug}.png`),
      fullPage: true,
    });
  }

  return page.evaluate(() => {
    const root = document.querySelector('[data-lp-canvas-root]');
    const vw = window.innerWidth;
    const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const text = root?.innerText || '';

    const imgs = Array.from(document.querySelectorAll('img[data-lp-content-image]'));
    const brokenImages = imgs.filter(
      (img) => img.complete && img.naturalWidth === 0 && img.offsetParent !== null,
    ).length;

    const imgFallbacks = document.querySelectorAll('[data-lp-img-fallback]').length;
    const emptyVideoShells = Array.from(document.querySelectorAll('[data-lp-video-shell]')).filter(
      (el) => el.clientHeight < 40 && !el.querySelector('iframe, img, [data-lp-img-fallback]'),
    ).length;

    const image404 = brokenImages;

    const sections = Array.from(
      document.querySelectorAll('[data-lp-canvas-root] section, [data-lp-canvas-root] header'),
    );
    let deadSpace = 0;
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      if (r.height < 200) continue;
      const textLen = (sec.innerText || '').replace(/\s+/g, ' ').trim().length;
      const hasMedia = sec.querySelector(
        'img[data-lp-content-image], [data-lp-img-fallback], iframe, [data-lp-video-shell] iframe, [data-lp-gallery-featured]',
      );
      const emptyVisual = sec.querySelector(
        '[data-lp-hero-visual]:not(:has(img[data-lp-content-image], [data-lp-img-fallback]))',
      );
      if (emptyVisual && emptyVisual.getBoundingClientRect().height > 420) deadSpace += 1;
      if (!hasMedia && textLen < 24 && r.height > 360) deadSpace += 1;
    }

    let lowContrast = 0;
    const samples = [
      ...document.querySelectorAll('[data-lp-hero-copy] h1, [data-lp-hero-copy] p'),
      ...document.querySelectorAll('[data-lp-section-head] h2, [data-lp-section-head] p'),
    ].slice(0, 12);
    for (const el of samples) {
      const cs = getComputedStyle(el);
      const fg = cs.color;
      let bgEl = el.parentElement;
      let bg = 'rgb(255,255,255)';
      for (let i = 0; i < 6 && bgEl; i++) {
        const bcs = getComputedStyle(bgEl);
        if (bcs.backgroundColor && bcs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          bg = bcs.backgroundColor;
          break;
        }
        bgEl = bgEl.parentElement;
      }
      const ratio = (() => {
        const parse = (s) => {
          const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s || '');
          if (!m) return [0, 0, 0];
          return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
        };
        const relLum = ([r, g, b]) => {
          const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        };
        const fgL = relLum(parse(fg));
        const bgL = relLum(parse(bg));
        const lighter = Math.max(fgL, bgL);
        const darker = Math.min(fgL, bgL);
        return (lighter + 0.05) / (darker + 0.05);
      })();
      if (ratio < 3.5) lowContrast += 1;
    }

    let misaligned = 0;
    const containers = Array.from(
      document.querySelectorAll(
        '[data-lp-container-inner], [data-lp-header-inner], [data-lp-footer-inner], [data-lp-canvas-root] .max-w-3xl, [data-lp-canvas-root] .max-w-5xl, [data-lp-canvas-root] .max-w-6xl',
      ),
    ).filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 120 && r.height > 0;
    });
    if (containers.length > 1) {
      const lefts = containers.map((c) => Math.round(c.getBoundingClientRect().left));
      const ref = lefts[0];
      misaligned = lefts.filter((l) => Math.abs(l - ref) > 4).length;
    }

    let textClip = 0;
    for (const el of document.querySelectorAll('[data-lp-hero-copy] h1, [data-lp-section-head] h2, [data-lp-card-item] h3')) {
      if (el.scrollWidth > el.clientWidth + 2) textClip += 1;
    }

    const pageH = root?.scrollHeight || 0;
    const blockCount = sections.length;
    const density = blockCount > 0 ? pageH / blockCount : pageH;
    const densityOutlier = pageH < 320 && blockCount > 2;

    const hasPlaceholder =
      /Placeholder|Thêm ảnh thật trong Builder|Thêm URL video|\[Tên khách\]|\[Nội dung đánh giá|cập nhật liên hệ trong Builder|Portfolio\s*→\s*\w|Hero\s*→\s*\w|Audit\s*→\s*(?:problem|test|scale|triển|solution|offer)|Campaign \d|Mô tả ngắn|Placeholder diễn giả/i.test(
        text,
      );
    const overflowX = docW > vw + 2;

    const form = document.querySelector('[data-lp-form-block], form#lead-form');
    let formOverflow = false;
    if (form) {
      const fr = form.getBoundingClientRect();
      formOverflow = fr.width > vw + 1;
    }

    return {
      brokenImages,
      imgFallbacks,
      emptyVideoShells,
      image404,
      deadSpace,
      lowContrast,
      misaligned,
      densityOutlier,
      density: Math.round(density),
      hasPlaceholder,
      overflowX,
      formOverflow,
      textClip,
      pageH,
      blockCount,
    };
  });
}

function loadSharp() {
  try {
    return require('sharp');
  } catch {
    const candidates = [
      path.join(__dirname, '../apps/web/node_modules/sharp'),
      path.join(__dirname, '../node_modules/sharp'),
    ];
    for (const p of candidates) {
      try {
        return require(p);
      } catch {
        /* try next */
      }
    }
    return null;
  }
}

async function buildContactSheet(vpName) {
  try {
    const sharp = loadSharp();
    if (!sharp) throw new Error('sharp module not found');
    const dir = path.join(SHOT_DIR, vpName);
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
    if (!files.length) return;
    const thumbW = 240;
    const thumbH = 360;
    const cols = 10;
    const rows = Math.ceil(files.length / cols);
    const composites = [];
    for (let i = 0; i < files.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const buf = await sharp(path.join(dir, files[i]))
        .resize(thumbW, thumbH, { fit: 'cover' })
        .toBuffer();
      composites.push({ input: buf, left: col * thumbW, top: row * thumbH });
    }
    const out = path.join(OUT_DIR, `contact-sheet-${vpName}.jpg`);
    await sharp({
      create: {
        width: cols * thumbW,
        height: rows * thumbH,
        channels: 3,
        background: '#0f172a',
      },
    })
      .composite(composites)
      .jpeg({ quality: 82 })
      .toFile(out);
    console.log(`CONTACT_SHEET ${out}`);
  } catch (e) {
    console.warn('CONTACT_SHEET skip:', e.message);
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const gates = {
    BROKEN_IMAGE: 0,
    EMPTY_MEDIA: 0,
    IMAGE_404: 0,
    DEAD_SPACE: 0,
    LOW_CONTRAST: 0,
    MISALIGNED_CONTAINER: 0,
    VISUAL_DENSITY_OUTLIER: 0,
    GENERIC_COPY: 0,
    OVERFLOW: 0,
    TEXT_CLIP: 0,
    RUNTIME_ERROR: 0,
  };
  const failures = [];
  let total = 0;

  let browser = await chromium.launch({ headless: true });
  let page = await browser.newPage();
  let tplCount = 0;

  async function recycleBrowser() {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  }

  try {
    for (const tpl of templates) {
      if (tplCount > 0 && tplCount % 25 === 0) await recycleBrowser();
      tplCount += 1;
      for (const vp of VIEWPORTS) {
        total += 1;
        try {
          const r = await auditPage(page, tpl.slug, vp);
          const issues = [];
          if (r.brokenImages > 0) {
            gates.BROKEN_IMAGE += r.brokenImages;
            issues.push(`broken=${r.brokenImages}`);
          }
          if (r.emptyVideoShells > 0) {
            gates.EMPTY_MEDIA += r.emptyVideoShells;
            issues.push(`emptyMedia=${r.emptyVideoShells}`);
          }
          if (r.image404 > 0) {
            gates.IMAGE_404 += r.image404;
            issues.push(`404=${r.image404}`);
          }
          if (r.deadSpace > 0) {
            gates.DEAD_SPACE += r.deadSpace;
            issues.push(`dead=${r.deadSpace}`);
          }
          if (r.lowContrast > 4) {
            gates.LOW_CONTRAST += r.lowContrast;
            issues.push(`contrast=${r.lowContrast}`);
          }
          if (r.misaligned > 2) {
            gates.MISALIGNED_CONTAINER += r.misaligned;
            issues.push(`align=${r.misaligned}`);
          }
          if (r.densityOutlier) {
            gates.VISUAL_DENSITY_OUTLIER += 1;
            issues.push(`density=${r.density}`);
          }
          if (r.hasPlaceholder) {
            gates.GENERIC_COPY += 1;
            issues.push('placeholder');
          }
          if (r.textClip > 0) {
            gates.TEXT_CLIP += r.textClip;
            issues.push(`textClip=${r.textClip}`);
          }
          if (r.overflowX || r.formOverflow) {
            gates.OVERFLOW += 1;
            issues.push('overflow');
          }

          const ok = issues.length === 0;
          if (!ok) failures.push({ slug: tpl.slug, vp: vp.name, issues, ...r });
          console.log(`${ok ? 'PASS' : 'FAIL'} ${tpl.slug} @${vp.name} ${issues.join(' ') || 'ok'}`);
        } catch (e) {
          const msg = String(e.message || e);
          if (/browser has been closed|Target page|context.*closed/i.test(msg)) {
            gates.RUNTIME_ERROR += 1;
            await recycleBrowser();
          } else {
            gates.OVERFLOW += 1;
          }
          failures.push({ slug: tpl.slug, vp: vp.name, error: msg });
          console.log(`FAIL ${tpl.slug} @${vp.name}: ${msg}`);
        }
      }
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  if (CONTACT_SHEET) {
    for (const vp of VIEWPORTS) await buildContactSheet(vp.name);
  }

  const report = {
    batch: BATCH,
    batchSize: BATCH_SIZE,
    templates: templates.length,
    totalChecks: total,
    gates,
    failCount: failures.length,
    failures: failures.slice(0, 40),
  };
  fs.writeFileSync(path.join(OUT_DIR, `report-batch${BATCH}.json`), JSON.stringify(report, null, 2));

  console.log('\n--- GLOBAL VISUAL QA GATES ---');
  for (const [k, v] of Object.entries(gates)) {
    console.log(`${k}=${v} ${v === 0 ? 'PASS' : 'FAIL'}`);
  }
  console.log(`TOTAL=${total} FAILURES=${failures.length}/${total}`);
  const allPass = Object.entries(gates).every(([k, v]) => k === 'RUNTIME_ERROR' ? v === 0 : v === 0);
  console.log(`GLOBAL_CATALOG_PASS=${allPass ? 'YES' : 'NO'}`);
  process.exitCode = allPass ? 0 : 1;
})();
