#!/usr/bin/env node
/**
 * Render REAL template screenshots from catalog specs → WebP thumb + long.
 * Uses Playwright Chromium + sharp. Source of truth = LANDING_PAGE_SYSTEM_TEMPLATES.spec
 *
 *   node scripts/generate-landing-page-template-screenshots.cjs
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'apps/web/public/landing-pages/templates');
const tmpDir = path.join(root, '.tmp/lp-template-screenshots');
const shared = require('../packages/shared/dist/index.js');
const sharp = require(path.join(
  root,
  'node_modules/.pnpm/sharp@0.35.4_@types+node@22.20.0/node_modules/sharp',
));

const { LANDING_PAGE_SYSTEM_TEMPLATES, LANDING_PAGE_THEME_PRESETS } = shared;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

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

function renderBlock(block, tokens, layout) {
  const primary = tokens.primary;
  const secondary = tokens.secondary;
  const muted = tokens.muted;
  const surface = tokens.surface;
  const h = block.headline ? `<h2 style="margin:0 0 8px;font-size:22px;color:${esc(secondary)}">${esc(block.headline)}</h2>` : '';
  const sh = block.subheadline
    ? `<p style="margin:0 0 12px;color:${esc(muted)};font-size:14px;line-height:1.5">${esc(block.subheadline)}</p>`
    : '';

  switch (block.type) {
    case 'Header': {
      const links = String(block.body || '')
        .split('|')
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 5);
      return `<header style="display:flex;justify-content:space-between;align-items:center;padding:14px 28px;background:${esc(
        surface,
      )};border-bottom:1px solid rgba(0,0,0,.06)">
        <strong style="color:${esc(secondary)};font-size:14px">${esc(block.headline || 'Brand')}</strong>
        <nav style="display:flex;gap:14px;font-size:12px;color:${esc(muted)}">${links
          .map((l) => `<span>${esc(l)}</span>`)
          .join('')}</nav>
        ${
          block.ctaLabel
            ? `<span style="background:${esc(primary)};color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700">${esc(
                block.ctaLabel,
              )}</span>`
            : ''
        }
      </header>`;
    }
    case 'Hero': {
      const trust = (block.trustPoints || []).slice(0, 4);
      const meta = [block.eventDate, block.eventTime, block.eventFormat].filter(Boolean);
      const twoCol = ['webinar', 'product', 'saas', 'service', 'local', 'agency', 'course', 'lead_gen'].includes(
        layout,
      );
      return `<section style="padding:40px 28px;background:${esc(tokens.background)}">
        <div class="lp-hero-grid" style="display:grid;grid-template-columns:${twoCol ? '1.1fr .9fr' : '1fr'};gap:28px;align-items:center;max-width:960px;margin:0 auto">
          <div>
            <h1 style="margin:0;font-size:34px;line-height:1.15;color:${esc(secondary)};letter-spacing:-.02em">${esc(
              block.headline || 'Headline',
            )}</h1>
            ${
              block.subheadline
                ? `<p style="margin:14px 0 0;font-size:16px;color:${esc(muted)};line-height:1.55">${esc(
                    block.subheadline,
                  )}</p>`
                : ''
            }
            ${
              meta.length
                ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">${meta
                    .map(
                      (m) =>
                        `<span style="background:${esc(surface)};border:1px solid rgba(0,0,0,.06);padding:8px 10px;border-radius:8px;font-size:12px;font-weight:600;color:${esc(
                          secondary,
                        )}">${esc(m)}</span>`,
                    )
                    .join('')}</div>`
                : ''
            }
            ${
              trust.length
                ? `<ul style="margin:18px 0 0;padding:0;list-style:none">${trust
                    .map(
                      (t) =>
                        `<li style="display:flex;gap:8px;align-items:center;margin:6px 0;font-size:13px;color:${esc(
                          secondary,
                        )}"><span style="width:16px;height:16px;border-radius:50%;background:${esc(
                          primary,
                        )};display:inline-block"></span>${esc(t)}</li>`,
                    )
                    .join('')}</ul>`
                : ''
            }
            ${
              block.ctaLabel
                ? `<div style="margin-top:22px"><span style="display:inline-block;background:${esc(
                    primary,
                  )};color:#fff;padding:12px 18px;border-radius:10px;font-weight:700;font-size:14px">${esc(
                    block.ctaLabel,
                  )} →</span></div>`
                : ''
            }
          </div>
          ${
            twoCol
              ? `<div style="height:280px;border-radius:16px;background:linear-gradient(145deg, ${esc(
                  primary,
                )}33, ${esc(secondary)}22);border:1px solid rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center;color:${esc(
                  secondary,
                )};font-size:13px;font-weight:600">Speaker / Event visual</div>`
              : ''
          }
        </div>
      </section>`;
    }
    case 'Benefits':
    case 'Features':
    case 'Process':
    case 'Gallery':
    case 'Product':
    case 'Speaker': {
      const items = (block.items || []).slice(0, 6);
      const cols = block.type === 'Process' ? Math.min(items.length, 4) : Math.min(items.length, 3) || 3;
      return `<section style="padding:36px 28px;background:${block.type === 'Features' ? '#fff' : esc(tokens.background)}">
        <div style="max-width:960px;margin:0 auto">${h}${sh}
          <div class="lp-grid" style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:14px">
            ${items
              .map((it, i) => {
                const role = it.role
                  ? `<div style="color:${esc(primary)};font-size:12px;font-weight:600;margin-top:4px">${esc(
                      it.role,
                    )}</div>`
                  : '';
                return `<div style="background:${esc(surface)};border-radius:12px;padding:16px;box-shadow:0 8px 24px rgba(15,23,42,.06)">
                  ${
                    block.type === 'Process'
                      ? `<div style="width:28px;height:28px;border-radius:50%;background:${esc(
                          primary,
                        )};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-bottom:8px">${String(
                          i + 1,
                        ).padStart(2, '0')}</div>`
                      : ''
                  }
                  <div style="font-weight:700;color:${esc(secondary)};font-size:14px">${esc(it.title || '')}</div>
                  ${role}
                  ${
                    it.description
                      ? `<p style="margin:8px 0 0;font-size:12px;color:${esc(muted)};line-height:1.45">${esc(
                          it.description,
                        )}</p>`
                      : ''
                  }
                </div>`;
              })
              .join('')}
          </div>
        </div>
      </section>`;
    }
    case 'Pricing': {
      const plans = (block.plans || []).slice(0, 3);
      return `<section style="padding:36px 28px;background:${esc(tokens.background)}">
        <div style="max-width:960px;margin:0 auto">${h}${sh}
          <div class="lp-grid" style="display:grid;grid-template-columns:repeat(${Math.max(plans.length, 1)},minmax(0,1fr));gap:14px">
            ${plans
              .map(
                (p) => `<div style="background:${esc(surface)};border-radius:12px;padding:18px;border:${
                  p.highlighted ? `2px solid ${esc(primary)}` : '1px solid rgba(0,0,0,.06)'
                }">
                <div style="font-weight:700;color:${esc(secondary)}">${esc(p.name)}</div>
                <div style="font-size:24px;font-weight:800;color:${esc(primary)};margin:8px 0">${esc(p.price)}</div>
                <ul style="margin:0;padding-left:16px;color:${esc(muted)};font-size:12px">${(p.features || [])
                  .slice(0, 4)
                  .map((f) => `<li>${esc(f)}</li>`)
                  .join('')}</ul>
              </div>`,
              )
              .join('')}
          </div>
        </div>
      </section>`;
    }
    case 'Testimonials': {
      const items = (block.items || []).slice(0, 3);
      return `<section style="padding:36px 28px;background:${esc(surface)}">
        <div style="max-width:960px;margin:0 auto">${h}
          <div class="lp-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">
            ${items
              .map(
                (t) => `<blockquote style="margin:0;background:${esc(tokens.background)};border-radius:12px;padding:16px">
                <p style="margin:0;font-size:13px;color:${esc(tokens.text)};line-height:1.5">"${esc(
                  (t.quote || '').slice(0, 120),
                )}"</p>
                <footer style="margin-top:12px;font-size:12px;font-weight:700;color:${esc(secondary)}">${esc(
                  t.author || '',
                )}</footer>
              </blockquote>`,
              )
              .join('')}
          </div>
        </div>
      </section>`;
    }
    case 'FAQ': {
      const items = (block.items || []).slice(0, 4);
      return `<section style="padding:36px 28px;background:${esc(tokens.background)}">
        <div style="max-width:800px;margin:0 auto">${h}
          ${items
            .map(
              (q) => `<div style="background:${esc(surface)};border-radius:10px;padding:14px 16px;margin-bottom:10px;box-shadow:0 4px 14px rgba(15,23,42,.04)">
              <div style="font-weight:700;font-size:13px;color:${esc(secondary)}">${esc(q.question || '')}</div>
              <div style="margin-top:6px;font-size:12px;color:${esc(muted)};line-height:1.45">${esc(
                (q.answer || '').slice(0, 160),
              )}</div>
            </div>`,
            )
            .join('')}
        </div>
      </section>`;
    }
    case 'LeadForm': {
      const fields = (block.fields || []).slice(0, 4);
      return `<section id="lead-form" style="padding:40px 28px;background:${esc(tokens.background)}">
        <div style="max-width:420px;margin:0 auto;background:${esc(surface)};border:2px solid ${esc(
          primary,
        )}33;border-radius:16px;padding:22px;box-shadow:0 16px 40px rgba(15,23,42,.12)">
          <h3 style="margin:0 0 6px;font-size:20px;color:${esc(secondary)}">${esc(block.headline || 'Form')}</h3>
          ${
            block.subheadline
              ? `<p style="margin:0 0 14px;font-size:13px;color:${esc(muted)}">${esc(block.subheadline)}</p>`
              : ''
          }
          ${fields
            .map(
              (f) => `<div style="margin-bottom:10px">
              <div style="font-size:12px;font-weight:600;margin-bottom:4px;color:${esc(tokens.text)}">${esc(
                f.label,
              )}${f.required ? ' *' : ''}</div>
              <div style="height:40px;border:1px solid rgba(0,0,0,.1);border-radius:8px;background:#fff"></div>
            </div>`,
            )
            .join('')}
          <div style="margin-top:8px;background:${esc(primary)};color:#fff;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:14px">${esc(
            block.submitLabel || 'Gửi',
          )}</div>
        </div>
      </section>`;
    }
    case 'CTA':
      return `<section style="padding:42px 28px;background:${esc(primary)};text-align:center">
        <h2 style="margin:0;color:#fff;font-size:26px">${esc(block.headline || 'CTA')}</h2>
        ${
          block.subheadline
            ? `<p style="margin:10px 0 0;color:rgba(255,255,255,.85);font-size:14px">${esc(block.subheadline)}</p>`
            : ''
        }
        ${
          block.ctaLabel
            ? `<div style="margin-top:18px"><span style="display:inline-block;background:#fff;color:${esc(
                secondary,
              )};padding:12px 18px;border-radius:10px;font-weight:800;font-size:14px">${esc(
                block.ctaLabel,
              )}</span></div>`
            : ''
        }
      </section>`;
    case 'Guarantee':
      return `<section style="padding:28px;background:${esc(tokens.background)}">
        <div style="max-width:800px;margin:0 auto;background:${esc(surface)};border-left:4px solid ${esc(
          primary,
        )};border-radius:12px;padding:18px">
          ${h}<p style="margin:0;color:${esc(muted)};font-size:13px;line-height:1.5">${esc(block.body || '')}</p>
        </div>
      </section>`;
    case 'Video':
      return `<section style="padding:36px 28px;background:${esc(tokens.background)}">
        <div style="max-width:800px;margin:0 auto">${h}
          <div style="height:220px;border-radius:14px;background:linear-gradient(135deg, ${esc(secondary)}, ${esc(
            primary,
          )});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">▶ Video</div>
        </div>
      </section>`;
    case 'Footer':
      return `<footer style="padding:22px 28px;background:${esc(secondary)};color:rgba(255,255,255,.8);font-size:12px;text-align:center">
        <div style="font-weight:700;color:#fff;margin-bottom:4px">${esc(block.headline || '')}</div>
        ${esc(block.body || '')}
      </footer>`;
    default:
      return '';
  }
}

function renderTemplateHtml(tpl) {
  const tokens = tokensFor(tpl);
  const layout = tpl.spec.meta?.layout || 'classic';
  const blocks = (tpl.spec.blocks || []).filter((b) => b.enabled !== false);
  const body = blocks.map((b) => renderBlock(b, tokens, layout)).join('\n');
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(tpl.name)}</title>
<style>
  html,body{margin:0;padding:0;background:${esc(tokens.background)};color:${esc(tokens.text)};
  font-family:${esc(tokens.fontFamily || 'system-ui,sans-serif')};}
  *{box-sizing:border-box}
  img,svg,video{max-width:100%;height:auto}
  h1,h2,h3{overflow-wrap:anywhere;word-break:break-word}
  .lp-grid{width:100%}
  @media (max-width: 768px) {
    .lp-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    .lp-hero-grid{grid-template-columns:1fr !important}
  }
  @media (max-width: 480px) {
    .lp-grid{grid-template-columns:minmax(0,1fr) !important}
    .lp-hero-grid{grid-template-columns:1fr !important}
  }
</style>
</head>
<body data-slug="${esc(tpl.slug)}" data-layout="${esc(layout)}" data-category="${esc(tpl.category)}">
${body}
</body>
</html>`;
}

async function probeRendererBase(base) {
  if (!base) return false;
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/lp-template-shot/spa-wellness`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    });
    return res.ok || res.status === 404; // 404 means route not built yet
  } catch {
    return false;
  }
}

async function main() {
  const { chromium } = require('playwright');
  const categoryFilter = (process.env.LP_SCREENSHOT_CATEGORY || process.argv[2] || '')
    .trim()
    .toLowerCase();
  const templates = categoryFilter
    ? LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === categoryFilter)
    : LANDING_PAGE_SYSTEM_TEMPLATES;

  if (!templates.length) {
    console.error(`No templates for filter category="${categoryFilter}"`);
    process.exitCode = 1;
    return;
  }

  const shotBase = (process.env.LP_SHOT_BASE_URL || process.env.LP_WEB_ORIGIN || 'http://127.0.0.1:3020')
    .trim()
    .replace(/\/$/, '');
  const shotViewport = (process.env.LP_SHOT_VIEWPORT || 'desktop').trim().toLowerCase();
  const VIEWPORT_SIZES = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 },
  };
  const vpSize = VIEWPORT_SIZES[shotViewport] || VIEWPORT_SIZES.desktop;
  const vpSuffix = shotViewport === 'desktop' ? '' : `-${shotViewport}`;
  const qaDir = process.env.LP_SHOT_QA_DIR ? path.resolve(process.env.LP_SHOT_QA_DIR) : null;
  if (qaDir) fs.mkdirSync(qaDir, { recursive: true });
  const forceHtml = process.env.LP_SHOT_FORCE_HTML === '1';
  let useRenderer = !forceHtml && (await probeRendererBase(shotBase));
  // Confirm a known slug actually has the shot marker when possible
  if (useRenderer) {
    try {
      const res = await fetch(`${shotBase}/lp-template-shot/${encodeURIComponent(templates[0].slug)}`, {
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      useRenderer = res.ok && /data-lp-template-shot|data-lp-canvas-root|LandingPage/i.test(html);
    } catch {
      useRenderer = false;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: vpSize,
    deviceScaleFactor: 1,
  });

  let done = 0;
  let errors = 0;
  const total = templates.length;
  const source = useRenderer ? 'landing-page-renderer-route' : 'html-fallback';
  console.log(
    `Rendering ${total} template screenshots via ${source}${
      categoryFilter ? ` (category=${categoryFilter})` : ''
    } viewport=${shotViewport}…`,
  );

  for (const tpl of templates) {
    try {
      if (useRenderer) {
        const url = `${shotBase}/lp-template-shot/${encodeURIComponent(tpl.slug)}?viewport=${encodeURIComponent(shotViewport)}`;
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
        if (!resp || !resp.ok()) {
          throw new Error(`HTTP ${resp ? resp.status() : 'no-response'} for ${tpl.slug}`);
        }
        await page.waitForSelector(
          '[data-lp-template-shot], [data-lp-canvas-root], h1, [data-lp-hero-copy], [data-lp-block-id]',
          {
            timeout: 20000,
          },
        );
        const qa = await page.evaluate(() => {
          const root =
            document.querySelector('[data-lp-template-shot]') ||
            document.querySelector('[data-lp-canvas-root]') ||
            document.body;
          // Some Phase 3 heroes use styled text nodes without a literal <h1>.
          const hasHeroCopy = !!(
            document.querySelector('h1') ||
            document.querySelector('[data-lp-hero-copy]') ||
            document.querySelector('[data-lp-element-kind="text"]') ||
            document.querySelector('[data-lp-block-id]')
          );
          const height = Math.max(
            root?.scrollHeight || 0,
            document.documentElement.scrollHeight || 0,
          );
          const overflowX =
            Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) >
            Math.ceil(window.innerWidth) + 1;
          return {
            hasRoot: !!root,
            hasHeroCopy,
            height,
            overflowX,
          };
        });
        if (!qa.hasRoot || !qa.hasHeroCopy || qa.height < 80) {
          throw new Error(
            `QA fail ${tpl.slug}: root=${qa.hasRoot} hero=${qa.hasHeroCopy} h=${qa.height} overflowX=${qa.overflowX}`,
          );
        }
      } else {
        const html = renderTemplateHtml(tpl);
        const htmlPath = path.join(tmpDir, `${tpl.slug}.html`);
        fs.writeFileSync(htmlPath, html);
        await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
        await page.waitForTimeout(40);
      }

      const pngBuf = await page.screenshot({
        fullPage: true,
        type: 'png',
        animations: 'disabled',
      });

      const targetDir = qaDir || outDir;
      const longPath = path.join(targetDir, `${tpl.slug}${vpSuffix}-long.webp`);
      const thumbPath = path.join(targetDir, `${tpl.slug}${vpSuffix}-thumb.webp`);

      const longMeta = await sharp(pngBuf).metadata();
      if (!longMeta.height || longMeta.height < 40) {
        throw new Error(`zero-height screenshot ${tpl.slug}`);
      }
      await sharp(pngBuf).webp({ quality: 72, effort: 4 }).toFile(longPath);

      const tw = longMeta.width || 1200;
      const th = Math.round((tw * 10) / 16);
      await sharp(pngBuf)
        .extract({ left: 0, top: 0, width: tw, height: Math.min(th, longMeta.height || th) })
        .resize(640, 400, { fit: 'cover', position: 'top' })
        .webp({ quality: 70, effort: 4 })
        .toFile(thumbPath);

      done += 1;
      if (done % 25 === 0 || done === total) {
        console.log(`  ${done}/${total}`);
      }
    } catch (err) {
      errors += 1;
      console.error(`FAIL ${tpl.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  await browser.close();

  console.log(`SCREENSHOT_SOURCE=${source}`);
  console.log(`WEBP_STATUS=generated ${done} thumb + ${done} long in ${outDir}`);
  console.log(`TOTAL_TEMPLATES=${total} ERRORS=${errors}`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
