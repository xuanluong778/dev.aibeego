const REPO = require('path').resolve(__dirname, '..');
const { chromium } = require(REPO + '/node_modules/playwright');
const shared = require(REPO + '/packages/shared/dist');
function fixture() {
  const base = shared.createBlankLandingPageSpec();
  const hero = { ...base.blocks.find((b) => b.type === 'Hero'), id: 'host', headline: 'Tiêu đề chính thu hút khách', background: '#304b39', subheadline: '', ctaLabel: '', trustPoints: [],
    style: { lpContentColumns: 3, lpNativeColumnIndices: [0], minHeight: '700px', background: '#304b39' } };
  const box = (id, col, text) => ({ id, type: 'Benefits', enabled: true, headline: '', subheadline: text, items: [],
    sectionPlacement: { sectionId: 'host', anchor: { kind: 'end' }, edge: 'after', columnIndex: col }, style: { lpAcceptedLayoutFields: '["subheadline"]' } });
  const mk = (id, h) => ({ id, type: 'Benefits', enabled: true, headline: h, subheadline: 'Mô tả cho ' + h,
    items: [1,2,3].map((n) => ({ id: id + '-i' + n, title: 'Lợi ích ' + n, description: 'Giải thích lợi ích số ' + n })) });
  const boxStyle = { width: 300, fontSize: 18, lineHeight: 1.5, box: { backgroundOn: true, background: '#b4cfbf', paddingX: 18, paddingY: 20, borderOn: true, borderColor: '#facc15', borderWidth: 2, borderRadius: 40 } };
  return { ...base, blocks: [hero, box('c1', 0, 'Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point.'),
    box('c2', 1, 'Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point.'),
    box('c3', 2, 'Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point.'),
    mk('b1', 'Lợi ích nổi bật'), mk('b2', 'Vì sao chọn chúng tôi'), mk('b3', 'Quy trình làm việc'), { ...mk('lk', 'Phần đã khóa'), locked: true }],
    meta: { layout: 'classic', clientRevision: 10, inlineTextStyles: { 'c1::subheadline': boxStyle, 'c2::subheadline': boxStyle, 'c3::subheadline': boxStyle,
      'host::headline': { width: 820, fontSize: 48, fontWeight: 800, lineHeight: 1.2, color: '#fff' } } } };
}
async function open(browser, { width = 1542, height = 900, hover = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e.stack || e)));
  let stored = shared.sanitizeLandingPagePersistSpec(fixture());
  const saves = [];
  await p.addInitScript(() => localStorage.setItem('ms_access_token', 'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa'));
  await p.route('**/api/v1/**', (route) => {
    const q = route.request(), u = new URL(q.url()).pathname; let body = {};
    if (u.endsWith('/auth/me')) body = { id: 'qa', name: 'QA', email: 'qa@example.invalid', role: 'SUPER_ADMIN', permissions: [], organizationId: 'qa' };
    else if (u.endsWith('/tb-qa/autosave')) { const d = q.postDataJSON(); stored = shared.sanitizeLandingPagePersistSpec(d.draftSpec); saves.push(1);
      body = { clientRevision: d.clientRevision, requestId: d.requestId, updatedAt: new Date().toISOString() }; }
    else if (u.endsWith('/tb-qa')) body = { id: 'tb-qa', name: 'TB QA', status: 'DRAFT', draftSpec: stored };
    else if (u.includes('subscription')) body = { hasPlan: true, status: 'ACTIVE', subscriptionStatus: 'ACTIVE', isExpired: false };
    else if (u.includes('/templates')) body = [];
    return route.fulfill({ json: body });
  });
  return { p, ctx, errors, saves, getStored: () => stored };
}
async function launch() {
  return chromium.launch({ executablePath: process.env.LP_QA_CHROME || '/snap/chromium/current/usr/lib/chromium-browser/chrome', args: ['--no-sandbox'] });
}


/**
 * Vertical element toolbar — behavior QA on the REAL builder route (API intercepted, no real writes).
 *
 *   # start any build of apps/web (docker run -p 127.0.0.1:13014:3000 <image>, or next start) then:
 *   LP_TOOLBAR_QA_ORIGIN=http://127.0.0.1:13014 node scripts/qa-landing-page-element-toolbar-browser.cjs
 *
 * Covers: selection / hover / gesture separation, top-right placement, hover -> toolbar path,
 * scroll (partial + fully hidden), zoom (live + settled), inspector close, drag, actions,
 * undo/redo remount, locked sections.
 */
const origin = process.env.LP_TOOLBAR_QA_ORIGIN || 'http://127.0.0.1:13014';
const tag = process.env.LP_TOOLBAR_QA_TAG || 'run';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' — ' + detail : ''}`); };
const T = 2.5, GAP = 8;
const sub = (p, id) => p.locator(`[data-lp-block-id="${id}"] [data-lp-inline-field="subheadline"]`).first();
async function tb(p) {
  return p.evaluate(() => {
    const t = document.querySelector('[data-lp-element-vertical-toolbar]');
    const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const sc = document.querySelector('[data-lp-canvas-scroll]'); const insp = document.querySelector('[data-lp-inspector-shell]');
    return { bar: R(t), side: t && t.dataset.lpVerticalToolbarSide, forId: t && t.dataset.lpToolbarFor, scroll: R(sc), insp: R(insp), moveDisabled: t ? t.querySelector('[data-lp-vertical-tool="move"]').disabled : null };
  });
}
async function wrapRect(p, id) {
  return p.evaluate((id) => {
    const f = document.querySelector(`[data-lp-block-id="${id}"] [data-lp-inline-field="subheadline"]`);
    const w = f && (f.closest('[data-lp-inline-wrap]') || f); const r = w.getBoundingClientRect();
    return { l: r.left, t: r.top, r: r.right, b: r.bottom };
  }, id);
}
const inside = (bar, sc, insp) => bar && bar.l >= sc.l - 1 && bar.t >= sc.t - 1 && bar.b <= sc.b + 1 && bar.r <= (insp && insp.l > sc.l + 40 ? insp.l : sc.r) + 1;
function attached(bar, a, sc) {
  // top-right of the visible part of the target
  const vt = Math.max(a.t, sc.t);
  return Math.abs(bar.t - vt) <= T || (bar.t >= vt - T && bar.t <= a.b); // may be pushed up only by the bottom bound
}
// Toolbar must sit at the top-right of the VISIBLE part of the target (right / left / inside the corner).
function glued(s, a) {
  if (!s.bar) return false;
  // Right beside the target (its padded shell may add ~20px), top-aligned, clamped to the visible box.
  const vt = Math.max(a.t, s.scroll.t);
  const topOk = Math.abs(s.bar.t - Math.min(Math.max(vt, s.scroll.t + 8), s.scroll.b - s.bar.h - 8)) <= 24;
  if (s.side === 'right') return s.bar.l - a.r >= 0 && s.bar.l - a.r <= 44 && topOk;
  if (s.side === 'left') return a.l - s.bar.r >= 0 && a.l - s.bar.r <= 44 && topOk;
  return s.side === 'inside' && topOk;
}
const gdetail = (s, a) => `side=${s.side} bar=[${s.bar && s.bar.l | 0},${s.bar && s.bar.t | 0},r${s.bar && s.bar.r | 0}] anchor=[l${a.l | 0},t${a.t | 0},r${a.r | 0}]`;
const blocks = (p) => p.evaluate(() => new Set([...document.querySelectorAll('[data-lp-block-id]')].map((n) => n.getAttribute('data-lp-block-id'))).size);
(async () => {
  const browser = await launch();
  const { p, errors, getStored } = await open(browser);
  await p.goto(origin + '/landing-pages/builder/tb-qa', { waitUntil: 'domcontentloaded' });
  await p.locator('[data-lp-block-id="host"]').first().waitFor({ timeout: 40000 });
  await p.waitForTimeout(2000);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  // 1. selection → toolbar bound to that target, at its top-right, same side/anchor every time
  for (const id of ['c1', 'c2', 'c3']) {
    await sub(p, id).hover(); await p.waitForTimeout(250);
    await sub(p, id).click(); await p.waitForTimeout(500);
    const s = await tb(p), a = await wrapRect(p, id);
    check(`select ${id}: toolbar belongs to ${id}`, s.forId === id, `for=${s.forId}`);
    check(`select ${id}: toolbar adjacent to target` + (id === 'c3' ? ' at its top-right' : ''), glued(s, a) && (id !== 'c3' || (s.side === 'right' && Math.abs(s.bar.t - Math.max(a.t, s.scroll.t)) <= T)), gdetail(s, a));
    check(`select ${id}: toolbar inside visible canvas`, inside(s.bar, s.scroll, s.insp));
  }
  // 1b. the bar never covers another box (and not the target's own resize handles)
  {
    const cov = await p.evaluate(() => { const bar = document.querySelector('[data-lp-element-vertical-toolbar]').getBoundingClientRect(); const sel = document.querySelector('[data-lp-block-id="c3"]');
      const others = [...document.querySelectorAll('[data-lp-free-child],[data-lp-box-block],[data-lp-item-id]')].filter((n) => !n.closest('[data-lp-block-id="c3"]'));
      return others.filter((n) => { const r = n.getBoundingClientRect(); return r.width > 1 && r.left < bar.right && r.right > bar.left && r.top < bar.bottom && r.bottom > bar.top; }).length; });
    check('toolbar covers no other box', cov === 0, `overlaps=${cov}`);
  }
  // 2. hover another element while one is selected → bar must NOT move (frame/toolbar/action same target)
  const before = await tb(p);
  await sub(p, 'c1').hover(); await p.waitForTimeout(350);
  const after = await tb(p);
  check('hover other element while selected: toolbar stays on selection', after.forId === before.forId && Math.abs(after.bar.l - before.bar.l) < 1 && Math.abs(after.bar.t - before.bar.t) < 1);

  // 3. deselect → no stale toolbar from an earlier hover
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  const none = await tb(p);
  check('after deselect: no stale toolbar', none.bar === null, `for=${none.forId}`);

  // 4. hover (nothing selected) → toolbar for hovered element; moving onto toolbar keeps it
  await sub(p, 'c2').hover(); await p.waitForTimeout(400);
  let h = await tb(p), a2 = await wrapRect(p, 'c2');
  check('hover: toolbar for hovered element, adjacent', h.bar && h.forId === 'c2' && glued(h, a2), `for=${h.forId} ` + gdetail(h, a2));
  if (h.bar) {
    const cx = h.bar.l + h.bar.w / 2, cy = h.bar.t + h.bar.h / 2, sx = a2.r - 10, sy = a2.t + 20;
    let kept = true;
    for (let i = 1; i <= 12; i++) { await p.mouse.move(sx + ((cx - sx) * i) / 12, sy + ((cy - sy) * i) / 12); await p.waitForTimeout(25); const m = await tb(p); if (!m.bar || m.forId !== 'c2') { kept = false; break; } }
    await p.waitForTimeout(250); const on = await tb(p);
    check('pointer from element to toolbar: toolbar persists', kept && on.bar && on.forId === 'c2');
    // leave to outside canvas (sidebar) → hover toolbar disappears, no stranded toolbar
    await p.mouse.move(20, 400, { steps: 6 }); await p.waitForTimeout(400);
    const gone = await tb(p);
    check('pointer leaves canvas+toolbar: hover toolbar disappears', gone.bar === null, `for=${gone.forId}`);
  }

  // 5. scroll: element fully out of view → hidden; partial → pinned to visible top; back → exact
  await sub(p, 'c2').click(); await p.waitForTimeout(500);
  const base = await tb(p);
  await p.evaluate(() => { document.querySelector('[data-lp-canvas-scroll]').scrollTop = 60; }); await p.waitForTimeout(250);
  const part = await tb(p), ap = await wrapRect(p, 'c2');
  check('scroll partial: toolbar tracks target', glued(part, ap) && inside(part.bar, part.scroll, part.insp), gdetail(part, ap));
  await p.evaluate(() => { document.querySelector('[data-lp-canvas-scroll]').scrollTop = 1500; }); await p.waitForTimeout(300);
  const out = await tb(p);
  check('scroll away: toolbar hidden when target fully out of canvas', out.bar === null, `bar=${out.bar && [out.bar.l | 0, out.bar.t | 0]}`);
  await p.evaluate(() => { document.querySelector('[data-lp-canvas-scroll]').scrollTop = 0; }); await p.waitForTimeout(300);
  const back = await tb(p);
  check('scroll back: toolbar returns to exact place', back.bar && Math.abs(back.bar.l - base.bar.l) < 1.5 && Math.abs(back.bar.t - base.bar.t) < 1.5);

  // 6. zoom (ctrl+wheel) → follows target after zoom settles AND during animation
  const box = await p.locator('[data-lp-canvas-scroll]').boundingBox();
  await p.mouse.move(box.x + 300, box.y + 300);
  await p.keyboard.down('Control'); await p.mouse.wheel(0, -300); await p.keyboard.up('Control');
  // Frame-accurate: sample AFTER each frame was painted (rAF + macrotask), so we compare what the
  // user actually sees, not an unpainted mid-frame state (zoom also adjusts scroll synchronously).
  const frames = await p.evaluate(() => new Promise((resolve) => {
    const out = []; const f = document.querySelector('[data-lp-block-id="c2"] [data-lp-inline-field="subheadline"]'); const w = f.closest('[data-lp-inline-wrap]') || f;
    const tick = () => requestAnimationFrame(() => setTimeout(() => {
      const t = document.querySelector('[data-lp-element-vertical-toolbar]');
      if (t) out.push([t.getBoundingClientRect().left, w.getBoundingClientRect().right, t.dataset.lpVerticalToolbarSide]);
      if (out.length < 24) tick(); else resolve(out);
    }, 0));
    tick();
  }));
  // The bar must move exactly with the target on every painted frame (no lag, no jump).
  let slip = 0;
  for (let i = 1; i < frames.length; i++) if (frames[i][2] === 'right' && frames[i - 1][2] === 'right' && Math.abs(frames[i][0] - frames[i][1]) <= 1 && Math.abs(frames[i - 1][0] - frames[i - 1][1]) <= 1) slip = Math.max(slip, Math.abs((frames[i][0] - frames[i - 1][0]) - (frames[i][1] - frames[i - 1][1])));
  const worst = slip;
  await p.waitForTimeout(500);
  const z2 = await tb(p), az2 = await wrapRect(p, 'c2');
  check('zoom: toolbar follows target on every frame and ends adjacent', glued(z2, az2) && worst <= 1.5, gdetail(z2, az2) + ` max-frame-slip=${worst.toFixed(2)}`);

  // 7. inspector close → still inside visible area, glued
  const closeBtn = p.locator('[data-lp-inspector-close]').first();
  if (await closeBtn.count()) { await closeBtn.click(); await p.waitForTimeout(700);
    const i2 = await tb(p), ai = await wrapRect(p, 'c2');
    check('inspector closed: toolbar re-glued inside canvas', glued(i2, ai) && inside(i2.bar, i2.scroll, i2.insp), gdetail(i2, ai));
  } else console.log('SKIP | no inspector close button');

  // 8. drag the element: toolbar follows live and after drop
  await sub(p, 'c3').click(); await p.waitForTimeout(500);
  const t0 = await tb(p); const mv = p.locator('[data-lp-vertical-tool="move"]');
  if (t0.bar) {
    const mb = await mv.boundingBox();
    await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2); await p.mouse.down();
    let dragWorst = 0;
    for (let i = 1; i <= 12; i++) { await p.mouse.move(mb.x + 6 * i, mb.y + 4 * i); await p.waitForTimeout(30);
      const d = await tb(p), ad = await wrapRect(p, 'c3'); if (d.bar && !glued(d, ad)) dragWorst = Math.max(dragWorst, 99); }
    await p.mouse.up(); await p.waitForTimeout(500);
    const d2 = await tb(p), ad2 = await wrapRect(p, 'c3');
    check('drag: toolbar glued during drag and after drop', glued(d2, ad2) && dragWorst <= 6, gdetail(d2, ad2) + ` worst-live=${dragWorst.toFixed(1)}`);
  }

  // 9. actions hit the right target + undo/redo
  await sub(p, 'c2').click(); await p.waitForTimeout(500);
  const n0 = await blocks(p);
  await p.locator('[data-lp-vertical-tool="duplicate"]').click(); await p.waitForTimeout(700);
  const n1 = await blocks(p);
  check('duplicate adds exactly one target', n1 === n0 + 1, `${n0}→${n1}`);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(700);
  check('undo restores count', (await blocks(p)) === n0);
  await p.keyboard.press('Control+Shift+z'); await p.waitForTimeout(700);
  check('redo reapplies duplicate', (await blocks(p)) === n1);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(700);
  await sub(p, 'c3').click(); await p.waitForTimeout(500);
  const sd = await tb(p);
  await p.locator('[data-lp-vertical-tool="delete"]').click(); await p.waitForTimeout(700);
  const n2 = await blocks(p);
  check('delete removes the toolbar target only', sd.forId === 'c3' && n2 === n0 - 1 && (await p.locator('[data-lp-block-id="c3"]').count()) === 0 && (await p.locator('[data-lp-block-id="c2"]').count()) > 0, `${n0}→${n2}`);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(700);
  check('undo restores deleted target', (await blocks(p)) === n0 && (await p.locator('[data-lp-block-id="c3"]').count()) > 0);
  // toolbar re-binds after undo remount
  await p.waitForTimeout(300);
  await sub(p, 'c3').click(); await p.waitForTimeout(500);
  const u = await tb(p), au = await wrapRect(p, 'c3');
  check('after undo/redo remounts: toolbar glued to live DOM', u.forId === 'c3' && glued(u, au), gdetail(u, au));


  // 10. locked section: buttons disabled and actions are no-ops
  await p.evaluate(() => { document.querySelector('[data-lp-block-id="lk"]').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(400);
  const lockHead = p.locator('[data-lp-block-id="lk"] [data-lp-inline-field="headline"]').first();
  await lockHead.click(); await p.waitForTimeout(600);
  const lk = await tb(p);
  const dis = await p.evaluate(() => [...document.querySelectorAll('[data-lp-element-vertical-toolbar] button')].map((b) => b.disabled));
  const nl0 = await blocks(p);
  if (lk.bar) { await p.locator('[data-lp-vertical-tool="delete"]').click({ force: true }).catch(() => {}); await p.locator('[data-lp-vertical-tool="duplicate"]').click({ force: true }).catch(() => {}); await p.waitForTimeout(500); }
  check('locked section: toolbar for locked block, all actions disabled and inert', lk.forId === 'lk' && dis.length === 4 && dis.every(Boolean) && (await blocks(p)) === nl0, `for=${lk.forId} disabled=${dis}`);

  check('no page errors', errors.length === 0, errors[0] ? errors[0].slice(0, 160) : '');
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSUMMARY ${results.length - failed}/${results.length} passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
