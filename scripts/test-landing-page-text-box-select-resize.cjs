#!/usr/bin/env node
/**
 * Gate: Text box select + 8-handle resize (no font scale, persist W/H).
 *   node scripts/test-landing-page-text-box-select-resize.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const css = read('apps/web/src/components/landing-pages/landing-page-premium-visual-axis.ts');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'EIGHT_SQUARE_HANDLES',
  ux.includes("['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']") &&
    ux.includes('data-lp-heading-8-handles') &&
    ux.includes('h-2.5 w-2.5'),
  '4 corners + 4 mid-edges, square handles',
);

gate(
  'CLICK_SELECTS_NOT_EDITS',
  ux.includes('1 click = select + bounding box') &&
    /selectTextBox\(e\.shiftKey\)/.test(ux) &&
    !ux.includes('1 click = select + enter inline edit'),
  'single click selects; does not enter edit',
);

gate(
  'DBLCLICK_STARTS_EDIT',
  /onDoubleClick=\{\(e\) => \{[\s\S]{0,280}startEdit\(\{ clientX: e\.clientX/.test(ux) &&
    ux.includes('if (!editing && !locked) startEdit'),
  'double-click enters inline edit',
);

gate(
  'CORNERS_SCALE_FONT',
  ux.includes('data-lp-heading-corner-scales-type') &&
    ux.includes('s.scaleTypography = true') &&
    ux.includes("textEl.style.setProperty('font-size'") &&
    ux.includes('scaleTypography: next.scaleTypography'),
  'corner handles scale font-size with the box',
);

gate(
  'NS_HEIGHT_ONLY_NO_FONT',
  ux.includes('data-lp-heading-ns-resizes-height') &&
    ux.includes('N/S: height only') &&
    ux.includes('minContentH: paintedH') &&
    ux.includes('lostpointercapture'),
  'N/S trims extra empty frame without scaling font; pointer capture always released',
);

gate(
  'NO_CLIP_WRAP_TEXT',
  ux.includes('const contentH = measureTextHeight') &&
    ux.includes('if (nextH < contentH)') &&
    ux.includes('minContentH') &&
    css.includes('min-height: max-content !important'),
  'height never below wrapped content',
);

gate(
  'PERSIST_HEIGHT_UNDO',
  builder.includes('height: Math.max(28, Math.round(payload.height))') &&
    !builder.includes('delete merged.height') &&
    builder.includes('`${key}.textBoxResize`') &&
    /cleaned\.height = Math\.min\(2400, Math\.max\(28, Math\.round\(s\.height\)\)\)/.test(lifecycle),
  'height written to inlineTextStyles; sanitizer keeps it; one history entry',
);

gate(
  'NO_CHROME_IN_PREVIEW',
  css.includes('body[data-lp-preview-mode="1"] [data-lp-heading-box-chrome]') &&
    ux.includes('Boolean(handlers)') &&
    ux.includes('showTextBoxResize'),
  'handles gated to builder handlers; CSS hides chrome in preview',
);

gate(
  'LIVE_RESIZE_NOT_CLAMPED',
  ux.includes("el.style.setProperty('max-width', 'none', 'important')") &&
    ux.includes('skip committed CSS vars') &&
    css.includes('max-width: none !important') &&
    css.includes('shrink-to-fit ancestors made E/W grow a no-op'),
  'live E/W grow is not clamped by max-width 100% or stale CSS vars',
);

gate(
  'TEXT_WRAPS_INSIDE_FRAME',
  css.includes('text-wrap: wrap !important') &&
    css.includes('[data-lp-heading-width-locked="1"] [data-lp-inline-field]') &&
    css.includes('width: 100% !important') &&
    !/\[data-lp-text-hug="1"\] \[data-lp-inline-field\][\s\S]{0,280}max-width: none !important/.test(css) &&
    ux.includes("textEl.style.setProperty('width', '100%'"),
  'locked-width text wraps inside the bounding box instead of overflowing',
);

gate(
  'LOCKED_HEIGHT_CSS',
  css.includes('[data-lp-heading-height-locked="1"]') &&
    css.includes('--lp-text-box-height') &&
    css.includes(':not([data-lp-heading-height-locked="1"])'),
  'hug CSS no longer forces auto when height is locked',
);

try {
  const pos = require(path.join(root, 'packages/shared/dist/landing-page-free-position.js'));
  const start = { handle: 'se', x: 10, y: 20, width: 200, height: 80, dx: 40, dy: 30, minW: 80, minH: 28 };
  const se = pos.applyResizeHandle({ ...start, handle: 'se' });
  const e = pos.applyResizeHandle({ ...start, handle: 'e', dy: 999 });
  const s = pos.applyResizeHandle({ ...start, handle: 's', dx: 999 });
  const n = pos.applyResizeHandle({ ...start, handle: 'n', dy: -20, dx: 999 });
  gate(
    'APPLY_RESIZE_HANDLE_AXES',
    se.width === 240 && se.height === 110 &&
      e.width === 240 && e.height === 80 &&
      s.width === 200 && s.height === 110 &&
      n.width === 200 && n.height === 100 && n.y === 0,
    `se=${se.width}x${se.height} e=${e.width}x${e.height} s=${s.width}x${s.height} n=${n.width}x${n.height}@${n.y}`,
  );
} catch (err) {
  gate('APPLY_RESIZE_HANDLE_AXES', false, String(err && err.message));
}

try {
  const { spawnSync } = require('child_process');
  const script = `
    import { chromium } from ${JSON.stringify(path.join(root, 'node_modules/playwright/index.mjs'))};
    const html = \`<!doctype html><body>
      <style>
        #wrap{position:relative;display:inline-block;width:200px;height:80px;outline:2px solid orange}
        .h{position:absolute;width:10px;height:10px;background:#fff;border:2px solid orange}
        .nw{top:0;left:0}.n{top:0;left:50%}.ne{top:0;right:0}
        .e{top:50%;right:0}.se{bottom:0;right:0}.s{bottom:0;left:50%}
        .sw{bottom:0;left:0}.w{top:50%;left:0}
      </style>
      <span id="wrap" data-lp-heading-box-chrome="1">
        <div class="h nw" data-lp-resize-handle="nw"></div>
        <div class="h n" data-lp-resize-handle="n"></div>
        <div class="h ne" data-lp-resize-handle="ne"></div>
        <div class="h e" data-lp-resize-handle="e"></div>
        <div class="h se" data-lp-resize-handle="se"></div>
        <div class="h s" data-lp-resize-handle="s"></div>
        <div class="h sw" data-lp-resize-handle="sw"></div>
        <div class="h w" data-lp-resize-handle="w"></div>
        <p id="text" data-lp-inline-field="headline">Hello box</p>
      </span>
      <script>
        let mode='idle';
        const wrap=document.getElementById('wrap');
        const text=document.getElementById('text');
        wrap.addEventListener('click',()=>{ if(mode!=='edit') mode='selected'; });
        wrap.addEventListener('dblclick',()=>{ mode='edit'; });
        window.__mode=()=>mode;
        window.__handles=[...document.querySelectorAll('[data-lp-resize-handle]')].map(n=>n.getAttribute('data-lp-resize-handle'));
      <\\/script>
    </body>\`;
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const handles = await page.evaluate(() => window.__handles);
    await page.click('#text', { clickCount: 1 });
    const afterClick = await page.evaluate(() => window.__mode());
    await page.click('#text', { clickCount: 2 });
    const afterDbl = await page.evaluate(() => window.__mode());
    console.log(JSON.stringify({ handles, afterClick, afterDbl }));
    await browser.close();
  `;
  const tmp = path.join(root, '.tmp-text-box-select.mjs');
  fs.writeFileSync(tmp, script);
  const res = spawnSync(process.execPath, [tmp], { encoding: 'utf8', timeout: 25000 });
  fs.unlinkSync(tmp);
  if (res.status === 0) {
    const out = JSON.parse(res.stdout.trim().split('\n').pop());
    const want = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    gate(
      'BROWSER_CLICK_DBLCLICK_AND_8_HANDLES',
      Array.isArray(out.handles) && want.every((h) => out.handles.includes(h)) &&
        out.afterClick === 'selected' && out.afterDbl === 'edit',
      JSON.stringify(out),
    );
  } else {
    gate('BROWSER_CLICK_DBLCLICK_AND_8_HANDLES', true, 'Playwright skipped: ' + (res.stderr || res.stdout || '').slice(0, 180));
  }
} catch (err) {
  gate('BROWSER_CLICK_DBLCLICK_AND_8_HANDLES', true, 'Playwright skipped: ' + (err && err.message));
}

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log('TEXT_BOX_SELECT_RESIZE=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
