#!/usr/bin/env node
/**
 * Row/column layout for section elements — behaviour QA on the REAL builder route.
 * API is intercepted (no real writes); autosave payloads are sanitized with the shared package
 * exactly like the API does, and reload serves the last saved spec.
 *
 *   docker run -d -p 127.0.0.1:13041:3000 -e API_INTERNAL_URL=http://127.0.0.1:1 <web image>
 *   LP_ROWS_QA_ORIGIN=http://127.0.0.1:13041 node scripts/qa-landing-page-section-rows-browser.cjs
 *
 * LP_ROWS_QA_MODE=legacy-snapshot prints layout of a legacy-only page (run on old + new image and
 * compare) to prove old pages render unchanged.
 */
const REPO = require('path').resolve(__dirname, '..');
const { chromium } = require(REPO + '/node_modules/playwright');
const shared = require(REPO + '/packages/shared/dist');
const origin = process.env.LP_ROWS_QA_ORIGIN || 'http://127.0.0.1:13041';
const OUT = process.env.LP_ROWS_QA_OUT || '/tmp/lp-rows-qa';
require('fs').mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' — ' + detail : ''}`);
};
const TEXT = 'Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point.';
function fixture() {
  const base = shared.createBlankLandingPageSpec();
  const host = { id: 'host', type: 'Benefits', enabled: true, headline: 'Lợi ích của chúng tôi', subheadline: '', items: [], background: '#3a2a10' };
  const c1 = { id: 'c1', type: 'Benefits', enabled: true, headline: '', subheadline: TEXT, items: [], spacing: 'none',
    sectionPlacement: { sectionId: 'host', anchor: { kind: 'end' }, edge: 'after' } };
  const other = { id: 'o', type: 'Benefits', enabled: true, headline: 'Section khác', subheadline: 'Không được đổi', items: [{ id: 'o-i1', title: 'Mục A', description: 'Mô tả A' }] };
  const ox = { id: 'ox', type: 'Benefits', enabled: true, headline: '', subheadline: 'Element cũ của section khác', items: [], spacing: 'none',
    sectionPlacement: { sectionId: 'o', anchor: { kind: 'end' }, edge: 'after' } };
  const lk = { id: 'lk', type: 'Benefits', enabled: true, locked: true, headline: 'Section khóa', subheadline: '', items: [] };
  const lkx = { id: 'lkx', type: 'Benefits', enabled: true, headline: '', subheadline: 'Element trong section khóa', items: [], spacing: 'none',
    sectionPlacement: { sectionId: 'lk', anchor: { kind: 'end' }, edge: 'after' } };
  return { ...base, blocks: [base.blocks[0], host, c1, other, ox, lk, lkx], meta: { ...base.meta, layout: 'classic', clientRevision: 10 } };
}
async function launch() {
  return chromium.launch({ executablePath: process.env.LP_QA_CHROME || '/snap/chromium/current/usr/lib/chromium-browser/chrome', args: ['--no-sandbox'] });
}
async function open(browser, state, { width = 1542, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => state.errors.push(String(e.stack || e)));
  await p.addInitScript(() => localStorage.setItem('ms_access_token', 'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa'));
  await p.route('**/api/v1/**', (route) => {
    const q = route.request(), u = new URL(q.url()).pathname; let body = {};
    if (u.endsWith('/auth/me')) body = { id: 'qa', name: 'QA', email: 'qa@example.invalid', role: 'SUPER_ADMIN', permissions: [], organizationId: 'qa' };
    else if (u.endsWith('/rows-qa/autosave')) {
      const d = q.postDataJSON(); state.stored = shared.sanitizeLandingPagePersistSpec(d.draftSpec); state.saves++;
      body = { clientRevision: d.clientRevision, requestId: d.requestId, updatedAt: new Date().toISOString() };
    } else if (u.endsWith('/rows-qa')) body = { id: 'rows-qa', name: 'Rows QA', status: 'DRAFT', draftSpec: state.stored };
    else if (u.includes('subscription')) body = { hasPlan: true, status: 'ACTIVE', subscriptionStatus: 'ACTIVE', isExpired: false };
    else if (u.includes('/templates')) body = [];
    return route.fulfill({ json: body });
  });
  await p.goto(origin + '/landing-pages/builder/rows-qa', { waitUntil: 'domcontentloaded' });
  await p.locator('[data-lp-section-element][data-lp-block-id="c1"]').first().waitFor({ timeout: 90000 });
  const discard = p.getByRole('button', { name: 'Tải bản mới nhất', exact: true });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  await p.waitForTimeout(1200);
  return { p, ctx };
}
const el = (p, id) => p.locator(`[data-lp-section-element][data-lp-block-id="${id}"]`).first();
async function rowInfo(p, id) {
  return p.evaluate((id) => {
    const e = document.querySelector(`[data-lp-section-element][data-lp-block-id="${id}"]`);
    const row = e && e.closest('[data-lp-section-row]');
    if (!row) return null;
    const R = (n) => { const r = n.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width }; };
    const cols = [...row.querySelectorAll(':scope > [data-lp-row-column]')].map((c) => ({ ...R(c), ids: [...c.querySelectorAll(':scope > [data-lp-section-element]')].map((n) => n.dataset.lpBlockId) }));
    const parent = row.parentElement;
    const els = [...row.querySelectorAll('[data-lp-section-element]')].map((n) => ({ id: n.dataset.lpBlockId, ...R(n) }));
    const scale = row.getBoundingClientRect().width / (row.offsetWidth || 1);
    return { id: row.dataset.lpSectionRow, n: Number(row.dataset.lpRowColumns), row: R(row), parent: R(parent), cols, els, gap: (parseFloat(getComputedStyle(row).columnGap) || 0) * scale };
  }, id);
}
const sectionIds = (p) => p.evaluate(() => [...document.querySelectorAll('[data-lp-section-element][data-lp-block-id]')].map((n) => n.dataset.lpBlockId));
async function ensureAddPanel(p) {
  const tile = p.locator('[data-lp-add-component-card="text"]');
  if (!(await tile.isVisible().catch(() => false))) await p.locator('[data-lp-inspector-rail-btn="add-components"]').click();
  const tab = p.locator('[data-lp-add-root-tab="add"]'); if (await tab.isVisible().catch(() => false)) await tab.click();
  await tile.waitFor();
  return tile;
}
async function indicator(p) {
  return p.evaluate(() => {
    const m = document.querySelector('[data-lp-sidebar-drop-indicator]'); if (!m) return null;
    const l = m.querySelector('[data-lp-drop-line]'); if (!l) return { mode: m.dataset.lpDropMode };
    const r = l.getBoundingClientRect(), cs = getComputedStyle(l);
    return { mode: m.dataset.lpDropMode, orient: m.dataset.lpDropOrientation, l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height, bg: cs.backgroundColor, border: cs.borderTopStyle + ' ' + cs.borderTopColor };
  });
}
/** Point inside element `id`: where = right|left|lower|upper|bottomEdge|topEdge. */
async function pointAt(p, id, where) {
  await el(p, id).evaluate((n) => n.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(150);
  const r = await el(p, id).boundingBox();
  const y = r.y + r.height / 2;
  return {
    right: { x: r.x + r.width - 6, y }, left: { x: r.x + 6, y },
    lower: { x: r.x + r.width / 2, y: r.y + r.height * 0.7 }, upper: { x: r.x + r.width / 2, y: r.y + r.height * 0.3 },
    bottomEdge: { x: r.x + r.width / 2, y: r.y + r.height - 4 }, topEdge: { x: r.x + r.width / 2, y: r.y + 3 },
    center: { x: r.x + r.width / 2, y },
  }[where];
}
/** Sidebar drag of the Text tile; returns the indicator seen before drop. */
async function sidebarDrop(p, id, where, { cancel = false, pick = true, shot } = {}) {
  await p.keyboard.press('Escape');
  const tile = await ensureAddPanel(p);
  const s = await tile.boundingBox();
  await p.mouse.move(s.x + s.width / 2, s.y + s.height / 2); await p.mouse.down();
  await p.mouse.move(s.x + s.width / 2 - 25, s.y + s.height / 2, { steps: 6 });
  const pt = await pointAt(p, id, where);
  await p.mouse.move(pt.x, pt.y, { steps: 18 }); await p.mouse.move(pt.x + 1, pt.y);
  await p.waitForTimeout(250);
  const ind = await indicator(p);
  if (shot) await p.screenshot({ path: `${OUT}/${shot}.png` });
  if (cancel) { await p.keyboard.press('Escape'); await p.mouse.up(); await p.waitForTimeout(400); return ind; }
  await p.mouse.up();
  await p.waitForTimeout(500);
  if (pick) {
    const card = p.locator('[data-lp-element-library-modal] [data-lp-paragraph-preset]').first();
    await card.waitFor({ timeout: 10000 });
    await card.click();
    await p.waitForTimeout(900);
  }
  return ind;
}
async function undo(p) { await p.keyboard.press('Escape'); await p.keyboard.press('Control+z'); await p.waitForTimeout(600); }
async function redo(p) { await p.keyboard.press('Escape'); await p.keyboard.press('Control+Shift+z'); await p.waitForTimeout(600); }
function equalCols(info, n) {
  if (!info || info.n !== n || info.cols.length !== n) return false;
  const w = info.cols.map((c) => c.w), avg = w.reduce((a, b) => a + b, 0) / n;
  const fits = info.row.l >= info.parent.l - 1 && info.row.r <= info.parent.r + 1 && info.els.every((e) => e.l >= info.row.l - 1 && e.r <= info.row.r + 1);
  return w.every((x) => Math.abs(x - avg) <= 1.5) && fits && Math.abs(info.cols.reduce((a, c) => a + c.w, 0) + info.gap * (n - 1) - info.row.w) <= 2;
}
const fmt = (info) => info ? `n=${info.n} widths=${info.cols.map((c) => c.w.toFixed(1)).join('/')} gap=${info.gap} row=${info.row.w.toFixed(1)} parent=${info.parent.w.toFixed(1)}` : 'no-row';
const newId = (before, after) => after.find((x) => !before.includes(x));
async function waitSaved(p, state, pred) { for (let i = 0; i < 60; i++) { if (pred(state.stored)) return true; await p.waitForTimeout(250); } return false; }

async function legacySnapshot() {
  const browser = await launch();
  // Rich legacy page: full blank starter (deterministic ids) + legacy split columns + old flow elements.
  const base = shared.createBlankLandingPageSpec();
  base.blocks = base.blocks.map((b, i) => ({ ...b, id: 'legacy' + i }));
  const hero = base.blocks[1];
  hero.style = { ...(hero.style || {}), lpContentColumns: 3, lpNativeColumnIndices: [0] };
  const col = (id, c) => ({ id, type: 'Benefits', enabled: true, headline: '', subheadline: 'Cột cũ ' + c, items: [], spacing: 'none', sectionPlacement: { sectionId: hero.id, anchor: { kind: 'end' }, edge: 'after', columnIndex: c } });
  const spec = { ...fixture(), blocks: [...base.blocks, col('lc1', 1), col('lc2', 2), ...fixture().blocks.slice(1)] };
  const state = { stored: shared.sanitizeLandingPagePersistSpec(spec), saves: 0, errors: [] };
  const { p } = await open(browser, state, { height: 4000 });
  const snap = await p.evaluate(() => [...document.querySelectorAll('[data-lp-block-id]')].map((n) => { const r = n.getBoundingClientRect(); return [n.dataset.lpBlockId, n.tagName, Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)].join(','); }).join('\n'));
  console.log(snap);
  console.log('errors', state.errors.length, 'rows', await p.locator('[data-lp-section-row]').count());
  await browser.close();
}

(async () => {
  if (process.env.LP_ROWS_QA_MODE === 'legacy-snapshot') return legacySnapshot();
  const browser = await launch();
  const state = { stored: shared.sanitizeLandingPagePersistSpec(fixture()), saves: 0, errors: [] };
  let { p, ctx } = await open(browser, state);

  // 0. Legacy page: no row markup until the user opts in.
  check('legacy page renders without row markup', (await p.locator('[data-lp-section-row]').count()) === 0);

  // 1. 1 → 2 columns (right of legacy element)
  let ids0 = await sectionIds(p);
  let ind = await sidebarDrop(p, 'c1', 'right', { shot: '1-indicator-col' });
  check('column indicator: vertical, white bg, dashed blue', ind && ind.orient === 'vertical' && ind.bg === 'rgb(255, 255, 255)' && /dashed rgb\(37, 99, 235\)/.test(ind.border) && ind.h > ind.w, JSON.stringify(ind));
  check('indicator cleared after drop', (await indicator(p)) === null);
  let ids1 = await sectionIds(p);
  const a2 = newId(ids0, ids1);
  let info = await rowInfo(p, 'c1');
  check('1 → 2 columns: 50/50 inside container', equalCols(info, 2) && info.cols[0].ids[0] === 'c1' && info.cols[1].ids[0] === a2, fmt(info));
  await waitSaved(p, state, (st) => st.blocks.filter((b) => b.sectionPlacement?.row?.id === info?.id).length === 2);
  check('drop saved with row in spec (autosave payload, sanitized)', state.stored.blocks.filter((b) => b.sectionPlacement?.row?.id === info?.id).length === 2);
  await p.screenshot({ path: `${OUT}/1-two-cols.png` });

  // 2. 2 → 3 → 4 columns
  ind = await sidebarDrop(p, a2, 'right');
  let ids2 = await sectionIds(p); const a3 = newId(ids1, ids2);
  info = await rowInfo(p, 'c1');
  check('2 → 3 columns: equal thirds', equalCols(info, 3) && info.cols[2].ids[0] === a3, fmt(info));
  ind = await sidebarDrop(p, 'c1', 'left');
  let ids3 = await sectionIds(p); const a4 = newId(ids2, ids3);
  info = await rowInfo(p, 'c1');
  check('3 → 4 columns (left of first): equal quarters', equalCols(info, 4) && info.cols[0].ids[0] === a4 && info.cols[1].ids[0] === 'c1', fmt(info));
  await p.screenshot({ path: `${OUT}/2-four-cols.png` });
  ind = await sidebarDrop(p, a3, 'right', { cancel: true });
  check('5th column not offered (no vertical indicator)', !ind || ind.orient !== 'vertical', JSON.stringify(ind));
  check('cancel (Escape) leaves no indicator and no change', (await indicator(p)) === null && (await sectionIds(p)).length === ids3.length);

  // 3. stack inside a column
  ind = await sidebarDrop(p, a2, 'lower', { shot: '3-indicator-stack' });
  check('stack indicator: horizontal', ind && ind.orient === 'horizontal' && ind.w > ind.h, JSON.stringify(ind));
  let ids4 = await sectionIds(p); const s1 = newId(ids3, ids4);
  info = await rowInfo(p, 'c1');
  const colOf = (inf, id) => inf.cols.findIndex((c) => c.ids.includes(id));
  check('stack in column: same column, below, still 4 equal columns', equalCols(info, 4) && colOf(info, s1) === colOf(info, a2) && info.cols[colOf(info, a2)].ids.indexOf(s1) === info.cols[colOf(info, a2)].ids.indexOf(a2) + 1, fmt(info));

  // 4. new row below
  const rb = info.row;
  await el(p, 'c1').evaluate((n) => n.scrollIntoView({ block: 'center' }));
  // Bottom edge of the row: below the tallest column's content.
  ind = await (async () => {
    await p.keyboard.press('Escape');
    const tile = await ensureAddPanel(p); const s = await tile.boundingBox();
    await p.mouse.move(s.x + s.width / 2, s.y + s.height / 2); await p.mouse.down();
    await p.mouse.move(s.x + s.width / 2 - 25, s.y + s.height / 2, { steps: 6 });
    const r = await rowInfo(p, 'c1');
    const x = r.cols[0].l + r.cols[0].w / 2, y = r.row.b - 4;
    await p.mouse.move(x, y, { steps: 18 }); await p.mouse.move(x + 1, y); await p.waitForTimeout(250);
    const i = await indicator(p); await p.screenshot({ path: `${OUT}/4-indicator-row.png` });
    await p.mouse.up(); await p.waitForTimeout(500);
    await p.locator('[data-lp-element-library-modal] [data-lp-paragraph-preset]').first().click(); await p.waitForTimeout(900);
    return i;
  })();
  let ids5 = await sectionIds(p); const r2 = newId(ids4, ids5);
  const info2 = await rowInfo(p, r2); info = await rowInfo(p, 'c1');
  check('new-row indicator: horizontal across the row', ind && ind.orient === 'horizontal' && ind.w >= rb.w - 2, JSON.stringify(ind));
  check('new row: separate 1-column row below, old row unchanged', info2 && info2.id !== info.id && equalCols(info2, 1) && info2.row.t >= info.row.b - 1 && equalCols(info, 4), fmt(info2));

  // 5. undo / redo — each drop is exactly one transaction
  await undo(p);
  check('undo removes only the last drop', (await sectionIds(p)).length === ids4.length && !(await sectionIds(p)).includes(r2) && equalCols(await rowInfo(p, 'c1'), 4));
  await redo(p);
  check('redo restores it', (await sectionIds(p)).includes(r2) && equalCols(await rowInfo(p, r2), 1));
  await undo(p); await undo(p);
  check('second undo removes the stacked element only', !(await sectionIds(p)).includes(s1) && equalCols(await rowInfo(p, 'c1'), 4));
  await redo(p); await redo(p);
  check('redo ×2 back to 4 columns + stacked + new row', (await sectionIds(p)).includes(s1) && (await sectionIds(p)).includes(r2));

  // 6. move an existing element (toolbar Move) from the 4-col row to the right of r2
  await el(p, a3).locator('[data-lp-inline-field]').first().click();
  await p.waitForTimeout(400);
  const mv = p.locator('[data-lp-element-vertical-toolbar] [data-lp-vertical-tool="move"]');
  const mb = await mv.boundingBox();
  await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2); await p.mouse.down();
  await p.mouse.move(mb.x + mb.width / 2 - 20, mb.y + mb.height / 2, { steps: 4 });
  const tp = await pointAt(p, r2, 'right');
  await p.mouse.move(tp.x, tp.y, { steps: 16 }); await p.waitForTimeout(200);
  const mind = await indicator(p);
  await p.mouse.up(); await p.waitForTimeout(800);
  info = await rowInfo(p, 'c1'); const info3 = await rowInfo(p, r2);
  const all = await sectionIds(p);
  check('move: vertical indicator during move', mind && mind.orient === 'vertical', JSON.stringify(mind));
  check('move: source row rebalances 4 → 3, target row 1 → 2', equalCols(info, 3) && equalCols(info3, 2) && info3.cols[1].ids[0] === a3, fmt(info) + ' | ' + fmt(info3));
  check('move: no duplicate or lost element', all.length === new Set(all).size && all.length === ids5.length);
  await undo(p);
  check('undo move restores 4 columns', equalCols(await rowInfo(p, 'c1'), 4) && equalCols(await rowInfo(p, r2), 1));
  await redo(p);

  // 7. delete a column element (toolbar) → row rebalances; other sections untouched
  await el(p, a2).locator('[data-lp-inline-field]').first().click(); await p.waitForTimeout(300);
  await p.locator('[data-lp-element-vertical-toolbar] [data-lp-vertical-tool="delete"]').click(); await p.waitForTimeout(700);
  info = await rowInfo(p, 'c1');
  // a2's column still has the stacked s1, so 3 columns remain
  check('delete in column with stacked sibling keeps column', info && info.n === 3 && (await sectionIds(p)).includes(s1) && !(await sectionIds(p)).includes(a2), fmt(info));
  await el(p, s1).locator('[data-lp-inline-field]').first().click(); await p.waitForTimeout(300);
  await p.locator('[data-lp-element-vertical-toolbar] [data-lp-vertical-tool="delete"]').click(); await p.waitForTimeout(700);
  info = await rowInfo(p, 'c1');
  check('delete last element of a column → 2 equal columns', equalCols(info, 2), fmt(info));
  const ox = state.stored.blocks.find((b) => b.id === 'ox');
  check('other section element untouched (no row, same anchor)', ox && !ox.sectionPlacement.row && ox.sectionPlacement.sectionId === 'o');

  // 8. locked section: no row/column target
  ind = await sidebarDrop(p, 'lkx', 'right', { cancel: true });
  check('locked section: no column indicator', !ind || ind.orient !== 'vertical', JSON.stringify(ind));

  // 9. zoom: indicator sits in the column gap after ctrl+wheel zoom-out
  const beforeZoomW = (await rowInfo(p, 'c1')).row.w;
  {
    const cb = await el(p, 'c1').boundingBox();
    await p.mouse.move(cb.x + cb.width / 2, cb.y + 10);
    await p.keyboard.down('Control'); await p.mouse.wheel(0, 300); await p.keyboard.up('Control'); await p.waitForTimeout(700);
    const z = await rowInfo(p, 'c1');
    await p.keyboard.press('Escape');
    const tile = await ensureAddPanel(p); const s = await tile.boundingBox();
    await p.mouse.move(s.x + s.width / 2, s.y + s.height / 2); await p.mouse.down();
    await p.mouse.move(s.x + s.width / 2 - 25, s.y + s.height / 2, { steps: 6 });
    const firstId = (await rowInfo(p, 'c1')).cols[0].ids[0];
    const pt = await pointAt(p, firstId, 'right');
    const zz = await rowInfo(p, 'c1');
    await p.mouse.move(pt.x, pt.y, { steps: 16 }); await p.mouse.move(pt.x + 1, pt.y); await p.waitForTimeout(250);
    const zi = await indicator(p);
    await p.keyboard.press('Escape'); await p.mouse.up(); await p.waitForTimeout(300);
    const c0 = zz.cols[0], next = zz.cols[1];
    const mid = next ? (c0.r + next.l) / 2 : c0.r + 12;
    check('zoom: indicator centred on the column gap', zi && Math.abs((zi.l + zi.r) / 2 - mid) <= 3 && zi.t >= zz.row.t - 2 && z.row.w < beforeZoomW - 20, `mid=${mid.toFixed(1)} line=${zi && ((zi.l + zi.r) / 2).toFixed(1)} rowW ${beforeZoomW.toFixed(1)}→${z && z.row.w.toFixed(1)}`);
    await p.keyboard.down('Control'); await p.mouse.wheel(0, -300); await p.keyboard.up('Control'); await p.waitForTimeout(700);
  }

  // 10. reload: saved layout renders identically
  await p.waitForTimeout(2500);
  const beforeReload = await rowInfo(p, 'c1');
  const rowsBefore = await p.locator('[data-lp-section-row]').count();
  await ctx.close();
  ({ p, ctx } = await open(browser, state));
  const afterReload = await rowInfo(p, 'c1');
  check('reload: same rows, columns and widths', (await p.locator('[data-lp-section-row]').count()) === rowsBefore && afterReload && afterReload.n === beforeReload.n && afterReload.cols.every((c, i) => Math.abs(c.w - beforeReload.cols[i].w) <= 1 && c.ids.join() === beforeReload.cols[i].ids.join()), fmt(afterReload));
  check('editor-only guides: dashed outline on hover', await (async () => {
    await el(p, 'c1').hover(); await p.waitForTimeout(150);
    return p.evaluate(() => { const c = document.querySelector('[data-lp-row-guide] > [data-lp-row-column]'); const s = getComputedStyle(c); return s.outlineStyle === 'dashed' && s.outlineColor !== 'rgba(0, 0, 0, 0)'; });
  })());

  // 11. preview: same layout, no editor guides
  const prev = p.locator('[data-lp-preview-switch]').first();
  await prev.click(); await p.waitForTimeout(1200);
  const pv = await p.evaluate(() => { const r = document.querySelector('[data-lp-preview-canvas] [data-lp-section-row]'); if (!r) return null; return { n: Number(r.dataset.lpRowColumns), guide: r.hasAttribute('data-lp-row-guide'), cols: getComputedStyle(r).gridTemplateColumns.split(' ').length }; });
  check('preview: same columns, no editor guide attribute', pv && pv.n === afterReload.n && pv.cols === afterReload.n && !pv.guide, JSON.stringify(pv));
  await p.screenshot({ path: `${OUT}/11-preview.png` });
  await prev.click(); await p.waitForTimeout(800);

  // 12. mobile device: stacked single column; desktop data unchanged
  await p.waitForTimeout(3000);
  const savedBefore = JSON.stringify(state.stored.blocks.map((b) => [b.id, b.sectionPlacement]));
  const mobileBtn = p.locator('[data-lp-device-switcher] [aria-label="Mobile"],[data-lp-device-switcher] [title="Mobile"]').first();
  if (await mobileBtn.isVisible().catch(() => false)) {
    await mobileBtn.click(); await p.waitForTimeout(1200);
    const m = await p.evaluate(() => { const r = document.querySelector('[data-lp-section-row]'); if (!r) return null; const cs = getComputedStyle(r).gridTemplateColumns.split(' ').length; const cols = [...r.querySelectorAll(':scope>[data-lp-row-column]')].map((c) => c.getBoundingClientRect()); return { tracks: cs, stacked: cols.every((c, i) => i === 0 || c.top >= cols[i - 1].bottom - 1), w: r.getBoundingClientRect().width }; });
    await p.screenshot({ path: `${OUT}/12-mobile.png` });
    check('mobile: columns stack vertically', m && m.tracks === 1 && m.stacked, JSON.stringify(m));
    const desk = p.locator('[data-lp-device-switcher] [aria-label="Desktop"],[data-lp-device-switcher] [title="Desktop"]').first();
    if (await desk.isVisible().catch(() => false)) { await desk.click(); await p.waitForTimeout(800); }
    check('mobile view does not rewrite desktop layout', JSON.stringify(state.stored.blocks.map((b) => [b.id, b.sectionPlacement])) === savedBefore && equalCols(await rowInfo(p, 'c1'), afterReload.n));
  } else check('mobile device toggle found', false, 'skip');

  // 13. legacy drop (center of a legacy element) keeps the old flow behaviour
  const before13 = await sectionIds(p);
  await sidebarDrop(p, 'ox', 'lower');
  const n13 = newId(before13, await sectionIds(p));
  const nb = state.stored.blocks.find((b) => b.id === n13) || (await p.waitForTimeout(2500), state.stored.blocks.find((b) => b.id === n13));
  check('legacy flow drop unchanged: no row created', n13 && nb && !nb.sectionPlacement?.row && (await p.locator('[data-lp-section-row]').count()) === rowsBefore, JSON.stringify(nb && nb.sectionPlacement));

  check('no page errors', state.errors.length === 0, state.errors.slice(0, 2).join(' | '));
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nSUMMARY ${passed}/${results.length} passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
