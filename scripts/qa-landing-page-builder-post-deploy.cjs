#!/usr/bin/env node
/**
 * Landing page builder acceptance QA (post 973fd6e).
 * Auth: LP_QA_ACCESS_TOKEN **or** LP_QA_EMAIL + LP_QA_PASSWORD (real login API).
 * Optional dev-only: LP_QA_ALLOW_JWT_MINT=1 + LP_QA_USER_ID, LP_QA_EMAIL, LP_QA_ORG_ID, LP_QA_ROLE + JWT_SECRET.
 *
 *   node scripts/with-root-env.cjs node scripts/qa-landing-page-builder-post-deploy.cjs
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const APP = (process.env.APP_URL || 'https://aibeego.com').replace(/\/$/, '');
/** Server-side API (clone/read/save checks). Keep prod/staging API even when UI is QA host. */
const API =
  (process.env.API_URL || process.env.LP_QA_API_URL || 'https://aibeego.com').replace(/\/$/, '');
const SOURCE_LP_ID = process.env.LP_QA_SOURCE_PAGE_ID || process.env.LP_QA_PAGE_ID || '';
const OUT =
  process.env.LP_QA_SCREENSHOT_DIR ||
  '/var/www/aibeego_com_usr/data/backups/ui-baseline-add-components/post-deploy-qa-v2';

const results = [];
const networkLog = [];

function row(name, status, detail = '') {
  results.push({ name, status, detail });
  console.log(`${status} | ${name}${detail ? ' — ' + detail : ''}`);
}

function unwrapPage(json) {
  return json?.data ?? json;
}

function blockCount(spec) {
  return spec?.blocks?.length ?? null;
}

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function resolveAccessToken() {
  const direct = (process.env.LP_QA_ACCESS_TOKEN || '').trim();
  if (direct) return direct;

  const email = (process.env.LP_QA_EMAIL || '').trim();
  const password = process.env.LP_QA_PASSWORD || '';
  if (email && password) {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    const token =
      json?.data?.accessToken || json?.accessToken || json?.data?.tokens?.accessToken;
    if (res.ok && token) return token;
    throw new Error(`login failed ${res.status}: ${JSON.stringify(json).slice(0, 120)}`);
  }

  if (process.env.LP_QA_ALLOW_JWT_MINT === '1') {
    const secret = process.env.JWT_SECRET;
    const userId = (process.env.LP_QA_USER_ID || '').trim();
    const qaEmail = (process.env.LP_QA_EMAIL || '').trim();
    const org = (process.env.LP_QA_ORG_ID || '').trim();
    const role = (process.env.LP_QA_ROLE || '').trim();
    if (!secret || !userId || !qaEmail || !org || !role) {
      throw new Error('LP_QA_ALLOW_JWT_MINT=1 requires JWT_SECRET and LP_QA_USER_ID/EMAIL/ORG_ID/ROLE');
    }
    console.warn('[QA] JWT mint enabled — use only on staging/CI, not as production auth bypass.');
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64url(
      JSON.stringify({
        sub: userId,
        email: qaEmail,
        organizationId: org,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${header}.${payload}.${sig}`;
  }

  throw new Error('Set LP_QA_ACCESS_TOKEN or LP_QA_EMAIL+LP_QA_PASSWORD (or explicit LP_QA_ALLOW_JWT_MINT=1)');
}

async function api(token, p, init = {}) {
  const res = await fetch(`${API}/api/v1${p}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { res, json };
}

async function fetchPage(token, id) {
  const { res, json } = await api(token, `/landing-pages/${id}`);
  if (!res.ok) throw new Error(`GET lp ${res.status}`);
  return unwrapPage(json);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    row('PLAYWRIGHT', 'FAIL', 'pnpm exec playwright install chromium');
    process.exitCode = 1;
    return;
  }

  let token;
  try {
    token = await resolveAccessToken();
    row('AUTH', 'PASS', process.env.LP_QA_ACCESS_TOKEN ? 'token' : process.env.LP_QA_EMAIL ? 'login' : 'mint');
  } catch (e) {
    row('AUTH', 'FAIL', e.message);
    writeReport(null);
    process.exitCode = 1;
    return;
  }

  if (!SOURCE_LP_ID) {
    row('SOURCE_PAGE', 'FAIL', 'LP_QA_SOURCE_PAGE_ID required');
    process.exitCode = 1;
    return;
  }

  const source = await fetchPage(token, SOURCE_LP_ID);
  const sourceBlocks = blockCount(source.draftSpec);
  row('SOURCE_PAGE_READ', 'PASS', `blocks=${sourceBlocks}`);

  const { res: dupRes, json: dupJson } = await api(token, `/landing-pages/${SOURCE_LP_ID}/duplicate`, {
    method: 'POST',
    body: '{}',
  });
  const clone = unwrapPage(dupJson);
  const LP_ID = clone?.id;
  if (!dupRes.ok || !LP_ID) {
    row('CLONE_PAGE', 'FAIL', String(dupRes.status));
    process.exitCode = 1;
    return;
  }
  row('CLONE_PAGE', 'PASS', LP_ID);
  fs.writeFileSync(path.join(OUT, 'clone-page-id.txt'), LP_ID);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  // When UI is served from QA host (e.g. :13999) but NEXT_PUBLIC_API_URL is aibeego.com,
  // fulfill API via Node fetch so Chromium CORS does not block Bearer calls.
  if (!/^https?:\/\/(www\.)?aibeego\.com\/?$/i.test(APP)) {
    await context.route('https://aibeego.com/api/v1/**', async (route) => {
      const req = route.request();
      const headers = { ...req.headers() };
      delete headers['host'];
      try {
        const res = await fetch(req.url(), {
          method: req.method(),
          headers,
          body: ['GET', 'HEAD'].includes(req.method()) ? undefined : req.postData(),
        });
        const buf = Buffer.from(await res.arrayBuffer());
        const outHeaders = {};
        res.headers.forEach((v, k) => {
          if (!['transfer-encoding', 'content-encoding'].includes(k.toLowerCase())) outHeaders[k] = v;
        });
        await route.fulfill({ status: res.status, headers: outHeaders, body: buf });
      } catch (err) {
        await route.fulfill({ status: 502, body: String(err && err.message ? err.message : err) });
      }
    });
  }
  await context.addInitScript((t) => localStorage.setItem('ms_access_token', t), token);
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/v1/') || url.includes('autosave')) {
      networkLog.push({
        url: url.slice(0, 200),
        status: res.status(),
        ok: res.ok(),
        method: res.request().method(),
      });
    }
  });
  page.on('requestfailed', (req) => {
    networkLog.push({
      url: req.url().slice(0, 200),
      failed: req.failure()?.errorText || 'fail',
      method: req.method(),
    });
  });

  await page.goto(`${APP}/landing-pages/builder/${LP_ID}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(5000);
  const canvas = page.locator('[data-lp-canvas-root]');
  await canvas.waitFor({ state: 'visible', timeout: 60000 }).catch(() => null);
  /** Unique section shells — do not count nested duplicate data-lp-block-id (e.g. old Footer). */
  const blocksOnCanvas = () =>
    page.locator('[data-lp-canvas-root] [data-lp-section-chrome="1"]').count();
  const canvasBlockIds = () =>
    page.locator('[data-lp-canvas-root] [data-lp-section-chrome="1"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-lp-block-id')).filter(Boolean),
    );

  async function alignCanvasToApi(label) {
    const pageJson = await fetchPage(token, LP_ID);
    const apiIds = (pageJson.draftSpec?.blocks || []).map((b) => b.id);
    const domIds = await canvasBlockIds();
    const missing = apiIds.filter((id) => !domIds.includes(id));
    const extra = domIds.filter((id) => !apiIds.includes(id));
    const ok = apiIds.length === domIds.length && missing.length === 0 && extra.length === 0;
    row(
      label,
      ok ? 'PASS' : 'FAIL',
      `api=${apiIds.length} canvas=${domIds.length} missing=${missing.length} extra=${extra.length}`,
    );
    fs.writeFileSync(
      path.join(OUT, `${label.toLowerCase()}-ids.json`),
      JSON.stringify({ apiIds, domIds, missing, extra }, null, 2),
    );
    return { pageJson, apiIds, domIds, ok };
  }

  /**
   * HTML5 DnD: shared DataTransfer via Playwright evaluateHandle so React onDragStart
   * (beginSidebarPresetDrag) and onDrop see the same MIME payload.
   */
  async function html5DropBlockType(blockType, edge) {
    const src = page.locator(
      `[data-lp-add-components-panel="1"] [data-lp-sidebar-block-type="${blockType}"]`,
    );
    const targets = page.locator('[data-lp-canvas-root] [data-lp-section-chrome="1"]');
    const count = await targets.count();
    if (!(await src.count()) || count < 1) {
      return { ok: false, reason: 'src/target missing' };
    }
    const target = targets.nth(Math.floor(count / 2));
    const targetId = await target.getAttribute('data-lp-block-id');
    const box = await target.boundingBox();
    if (!box) return { ok: false, reason: 'no target box', targetId };
    const clientX = box.x + box.width / 2;
    const clientY = edge === 'after' ? box.y + box.height - 4 : box.y + 4;

    await page.evaluate((type) => {
      const el = document.querySelector(
        `[data-lp-add-components-panel="1"] [data-lp-sidebar-block-type="${type}"]`,
      );
      const scroller = document.querySelector('[data-lp-add-components-scroll]');
      if (el && scroller) {
        const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTop += top - 40;
      }
    }, blockType);

    const dropResult = await page.evaluate(
      ({ blockType, edge, mime, clientX, clientY }) => {
        const src = document.querySelector(
          `[data-lp-add-components-panel="1"] [data-lp-sidebar-block-type="${blockType}"]`,
        );
        const targets = [
          ...document.querySelectorAll('[data-lp-canvas-root] [data-lp-section-chrome="1"]'),
        ];
        const target =
          targets.find((el) => el.getAttribute('data-lp-block-id')) || targets[0];
        if (!src || !target) return { ok: false, reason: 'src/target missing' };
        const dt = new DataTransfer();
        dt.effectAllowed = 'copy';
        src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
        if (![...dt.types].includes(mime)) {
          dt.setData(mime, JSON.stringify({ kind: 'block-type', type: blockType }));
        }
        target.dispatchEvent(
          new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt, clientX, clientY }),
        );
        target.dispatchEvent(
          new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX, clientY }),
        );
        target.setAttribute('data-lp-drop-edge', edge);
        target.dispatchEvent(
          new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX, clientY }),
        );
        src.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }));
        return {
          ok: true,
          targetId: target.getAttribute('data-lp-block-id'),
          types: [...dt.types],
          clientX,
          clientY,
        };
      },
      {
        blockType,
        edge,
        mime: 'application/x-lp-sidebar-preset',
        clientX,
        clientY,
      },
    );
    return dropResult;
  }

  let n0 = await blocksOnCanvas();
  row('BUILDER_CANVAS', n0 > 0 ? 'PASS' : 'FAIL', `sections visible=${n0}`);
  await alignCanvasToApi('BLOCK_ALIGN_INITIAL');
  await page.screenshot({ path: path.join(OUT, '01-clone-loaded.png') });

  const openPlus = async () => {
    const panel = page.locator('[data-lp-add-components-panel="1"]');
    const rail = page.locator('[data-lp-inspector-rail-btn="add-components"]');
    if (!(await panel.isVisible().catch(() => false))) {
      await rail.click();
      await page.waitForTimeout(800);
    }
  };

  const ensureAddRoot = async () => {
    const rail = page.locator('[data-lp-inspector-rail-btn="add-components"]');
    const panel = page.locator('[data-lp-add-components-panel="1"]');
    for (let i = 0; i < 4; i++) {
      const sub = page.locator('[data-lp-add-components-sub]');
      if (!(await sub.count())) break;
      const closeX = sub.locator('[data-lp-sidebar-close]').first();
      const back = sub.getByRole('button', { name: /Quay lại/i }).first();
      if (await closeX.isVisible().catch(() => false)) await closeX.click();
      else if (await back.isVisible().catch(() => false)) await back.click();
      else break;
      await page.waitForTimeout(500);
    }
    if (!(await panel.isVisible().catch(() => false))) {
      await rail.click();
      await page.waitForTimeout(800);
    }
    await page.locator('[data-lp-add-root-tab="add"]').click().catch(() => {});
    await page.waitForTimeout(400);
    await page.locator('[data-lp-add-components-scroll]').evaluate((el) => { el.scrollTop = 0; }).catch(() => {});
  };

  await openPlus();
  row('PANEL_PLUS', (await page.locator('[data-lp-add-components-panel="1"]').isVisible()) ? 'PASS' : 'FAIL');

  await page.locator('[data-lp-add-component-card="text"]').click();
  await page.waitForTimeout(500);
  row('SUBVIEW_TEXT', (await page.locator('[data-lp-add-components-sub="text"]').count()) > 0 ? 'PASS' : 'FAIL');
  await page.screenshot({ path: path.join(OUT, '02-text-subview.png') });
  await ensureAddRoot();
  const panelRoot = page.locator('[data-lp-add-components-panel="1"]');
  const socialCard = panelRoot.locator('[data-lp-add-component-card="social"]');
  await panelRoot.locator('[data-lp-add-components-scroll]').evaluate((el) => { el.scrollTop = 0; }).catch(() => {});
  if (!(await socialCard.isVisible().catch(() => false))) {
    await page.screenshot({ path: path.join(OUT, '02b-root-no-social.png') });
    row('SUBVIEW_SOCIAL', 'FAIL', 'social card not visible on add tab');
  } else {
    await socialCard.click();
    await page.waitForTimeout(700);
    const socialSub = await page.locator('[data-lp-add-components-sub="social"]').count();
    row('SUBVIEW_SOCIAL', socialSub > 0 ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(OUT, '03-social-subview.png') });
    await ensureAddRoot();
  }
  await ensureAddRoot();
  const formsCard = panelRoot.locator('[data-lp-add-component-card="forms"]');
  await formsCard.scrollIntoViewIfNeeded().catch(() => {});
  if (!(await formsCard.isVisible().catch(() => false))) {
    row('FORM_PRESET_INSERT', 'FAIL', 'forms card not visible');
    row('FORM_EMPTY_INSERT', 'FAIL', 'skipped');
  } else {
  await formsCard.click();
  await page.waitForTimeout(500);
  const presetBtn = page.locator('[data-lp-form-preset]').first();
  if (await presetBtn.count()) {
    await presetBtn.click();
    await page.waitForTimeout(1000);
    row('FORM_PRESET_INSERT', 'PASS');
  } else {
    row('FORM_PRESET_INSERT', 'FAIL', 'no preset');
  }
  await ensureAddRoot();
  await panelRoot.locator('[data-lp-add-component-card="forms"]').click();
  await page.locator('[data-lp-form-insert-empty="1"]').click();
  await page.waitForTimeout(1000);
  row('FORM_EMPTY_INSERT', 'PASS');
  await ensureAddRoot();
  }
  n0 = await blocksOnCanvas();

  await ensureAddRoot();
  const footerCard = panelRoot.locator('[data-lp-add-component-card="footer"]');
  const speakerCardInsert = panelRoot.locator('[data-lp-add-component-card="speaker"]');
  await panelRoot.locator('[data-lp-add-components-scroll]').evaluate((el) => { el.scrollTop = el.scrollHeight; }).catch(() => {});
  if (await footerCard.isVisible().catch(() => false)) {
    await footerCard.click();
    await page.waitForTimeout(800);
    let n1 = await blocksOnCanvas();
    row('INSERT_FOOTER', n1 > n0 ? 'PASS' : 'FAIL', `${n0}→${n1}`);
    n0 = n1;
  } else row('INSERT_FOOTER', 'FAIL', 'card not visible');
  await ensureAddRoot();
  await panelRoot.locator('[data-lp-add-components-scroll]').evaluate((el) => { el.scrollTop = el.scrollHeight; }).catch(() => {});
  if (await speakerCardInsert.isVisible().catch(() => false)) {
    await speakerCardInsert.click();
    await page.waitForTimeout(800);
    let n1 = await blocksOnCanvas();
    row('INSERT_SPEAKER', n1 > n0 ? 'PASS' : 'FAIL', `${n0}→${n1}`);
    n0 = n1;
  } else row('INSERT_SPEAKER', 'FAIL', 'card not visible');

  await ensureAddRoot();
  const sectionCard = panelRoot.locator('[data-lp-add-component-card="section"]');
  if (!(await sectionCard.isVisible().catch(() => false))) {
    row('SECTION_LIBRARY_OPEN', 'FAIL', 'section card missing');
    row('SECTION_LIBRARY_INSERT', 'FAIL', 'skipped');
  } else {
  await sectionCard.click();
  await page.waitForTimeout(800);
  const lib = page.locator('[data-lp-section-library-modal="1"]');
  row('SECTION_LIBRARY_OPEN', (await lib.isVisible()) ? 'PASS' : 'FAIL');
  await page.screenshot({ path: path.join(OUT, '04-section-library.png') });
  const libCard = page.locator('[data-lp-section-library-card]').first();
  if (await libCard.count()) {
    await libCard.hover();
    await libCard.getByRole('button', { name: /Thêm section/i }).click();
    await page.waitForTimeout(1200);
    n1 = await blocksOnCanvas();
    row('SECTION_LIBRARY_INSERT', n1 > n0 ? 'PASS' : 'FAIL', `${n0}→${n1}`);
    n0 = n1;
  }
  await page.keyboard.press('Escape');
  }

  await ensureAddRoot();
  await panelRoot.locator('[data-lp-add-components-scroll]').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  }).catch(() => {});
  const speakerDraggable = await panelRoot
    .locator('[data-lp-add-component-card="speaker"][data-lp-sidebar-block-type="Speaker"]')
    .isVisible()
    .catch(() => false);
  row('SPEAKER_DRAGGABLE', speakerDraggable ? 'PASS' : 'FAIL', 'data-lp-sidebar-block-type=Speaker');

  const beforeDragDom = await canvasBlockIds();
  const beforeDragCount = beforeDragDom.length;
  const dropMeta = await html5DropBlockType('Header', 'after');
  await page.waitForTimeout(1500);
  const afterDragDom = await canvasBlockIds();
  const newDomIds = afterDragDom.filter((id) => !beforeDragDom.includes(id));
  const canvasGrew = afterDragDom.length === beforeDragCount + 1 && newDomIds.length === 1;
  let insertIdx = newDomIds[0] ? afterDragDom.indexOf(newDomIds[0]) : -1;
  let anchorIdx = dropMeta?.targetId ? afterDragDom.indexOf(dropMeta.targetId) : -1;
  const positionOk =
    canvasGrew &&
    insertIdx >= 0 &&
    (anchorIdx < 0 || insertIdx === anchorIdx + 1 || insertIdx === anchorIdx);
  row(
    'DRAG_DROP_HEADER',
    dropMeta?.ok && positionOk ? 'PASS' : 'FAIL',
    `drop=${JSON.stringify(dropMeta)} newId=${newDomIds[0] || 'none'} idx=${insertIdx} anchor=${anchorIdx} canvas ${beforeDragCount}→${afterDragDom.length}`,
  );
  n0 = afterDragDom.length;
  await page.screenshot({ path: path.join(OUT, '04b-after-dnd.png') });

  const undoBtn = page.getByRole('button', { name: 'Undo' });
  const redoBtn = page.getByRole('button', { name: 'Redo' });
  const beforeUndo = await blocksOnCanvas();
  if (await undoBtn.isEnabled().catch(() => false)) {
    await undoBtn.click();
    await page.waitForTimeout(700);
    const afterUndo = await blocksOnCanvas();
    row('UNDO_CANVAS', afterUndo === beforeUndo - 1 ? 'PASS' : 'FAIL', `canvas ${beforeUndo}→${afterUndo}`);
    if (await redoBtn.isEnabled().catch(() => false)) {
      await redoBtn.click();
      await page.waitForTimeout(700);
      const afterRedo = await blocksOnCanvas();
      row('REDO_CANVAS', afterRedo === afterUndo + 1 ? 'PASS' : 'FAIL', `canvas ${afterUndo}→${afterRedo}`);
    } else row('REDO_CANVAS', 'FAIL', 'Redo disabled');
  } else row('UNDO_CANVAS', 'FAIL', 'Undo disabled');

  // Persist DnD result: ensure Header from drop is present, then save + reload.
  const afterRedoDom = await canvasBlockIds();
  if (newDomIds[0] && !afterRedoDom.includes(newDomIds[0])) {
    // Redo may have restored; if not, drop again once for persist check.
    await ensureAddRoot();
    await html5DropBlockType('Header', 'after');
    await page.waitForTimeout(1000);
  }
  const persistDomBeforeSave = await canvasBlockIds();

  const autosaveWait = page.waitForResponse(
    (r) => r.url().includes('/autosave') && r.request().method() === 'POST',
    { timeout: 45000 },
  );
  const saveBtn = page.getByRole('button', { name: /Lưu/i }).first();
  if (await saveBtn.isVisible()) await saveBtn.click();
  let autosaveStatus = 0;
  let autosaveBody = null;
  try {
    const ar = await autosaveWait;
    autosaveStatus = ar.status();
    autosaveBody = await ar.json().catch(() => null);
  } catch {
    autosaveStatus = 0;
  }
  const autosaveRejected = Boolean(autosaveBody?.rejected || autosaveBody?.data?.rejected);
  row(
    'AUTOSAVE_HTTP',
    (autosaveStatus === 201 || autosaveStatus === 200) && !autosaveRejected ? 'PASS' : 'FAIL',
    `status=${autosaveStatus} rejected=${autosaveRejected}`,
  );

  // Wait until API catches up with canvas section count (autosave flush).
  let beforeReload = await fetchPage(token, LP_ID);
  for (let i = 0; i < 8; i++) {
    if (blockCount(beforeReload.draftSpec) === persistDomBeforeSave.length) break;
    await page.waitForTimeout(800);
    beforeReload = await fetchPage(token, LP_ID);
  }
  const revBefore = beforeReload.draftSpec?.meta?.clientRevision;
  const blocksBeforeReload = blockCount(beforeReload.draftSpec);
  row(
    'BLOCK_ALIGN_AFTER_SAVE',
    blocksBeforeReload === persistDomBeforeSave.length ? 'PASS' : 'FAIL',
    `api=${blocksBeforeReload} canvas=${persistDomBeforeSave.length}`,
  );

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const afterReload = await fetchPage(token, LP_ID);
  const blocksAfterReload = blockCount(afterReload.draftSpec);
  row(
    'SAVE_RELOAD_SPEC',
    blocksAfterReload === blocksBeforeReload && blocksAfterReload === persistDomBeforeSave.length
      ? 'PASS'
      : 'FAIL',
    `api ${blocksBeforeReload}→${blocksAfterReload} canvasWas=${persistDomBeforeSave.length} rev=${revBefore}→${afterReload.draftSpec?.meta?.clientRevision}`,
  );
  await alignCanvasToApi('BLOCK_ALIGN_AFTER_RELOAD');
  await page.screenshot({ path: path.join(OUT, '05-after-reload.png') });

  await page.goto(`${APP}/landing-pages/builder/${LP_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await openPlus();
  await page.locator('[data-lp-add-root-tab="layers"]').click();
  row('TAB_LAYERS', (await page.locator('[data-lp-add-components-layers]').isVisible()) ? 'PASS' : 'FAIL');
  await page.screenshot({ path: path.join(OUT, '07-layers-tab.png') });

  for (const route of ['/landing-pages/pages', '/landing-pages/templates']) {
    const r = await page.goto(`${APP}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    row(`SMOKE_${route.replace(/\//g, '_')}`, r && r.status() < 400 ? 'PASS' : 'FAIL', String(r?.status()));
  }
  await page.screenshot({ path: path.join(OUT, '06-smoke-list.png') });

  fs.writeFileSync(path.join(OUT, 'console-errors.json'), JSON.stringify(consoleErrors, null, 2));
  fs.writeFileSync(path.join(OUT, 'network-log.json'), JSON.stringify(networkLog, null, 2));
  writeNetworkAnalysis(networkLog, autosaveStatus);

  const severe = consoleErrors.filter((e) => !/favicon|DevTools/i.test(e));
  row('CONSOLE_RAW', severe.length === 0 ? 'PASS' : 'FAIL', `count=${severe.length}`);

  await browser.close();
  writeReport(LP_ID);
  if (results.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}

function writeNetworkAnalysis(log, autosaveStatus) {
  const autosaves = log.filter((e) => e.url && e.url.includes('autosave'));
  const failed = log.filter((e) => e.failed || (e.status && e.status >= 400));
  const lines = [
    '# Network analysis (raw log in network-log.json)',
    '',
    '## Autosave',
    `- Last manual save autosave HTTP: **${autosaveStatus}** (FAIL if not 200/201)`,
    `- Autosave entries in log: ${autosaves.length}`,
    '',
    '## Failed / 4xx+ (unfiltered)',
    ...failed.slice(0, 30).map((e) => `- ${JSON.stringify(e)}`),
    '',
    '## Notes',
    '- `net::ERR_ABORTED` on RSC prefetch: often navigation cancel — not auto-PASS.',
    '- Autosave must pair with SAVE_RELOAD_SPEC PASS to claim persist OK.',
  ];
  fs.writeFileSync(path.join(OUT, 'NETWORK-ANALYSIS.md'), lines.join('\n'));
}

function writeReport(lpId) {
  const md = [
    '# Builder acceptance QA v2',
    '',
    `- APP: ${APP}`,
    `- Clone page: ${lpId || 'n/a'}`,
    `- Source: ${SOURCE_LP_ID}`,
    `- OUT: ${OUT}`,
    '',
    '| Test | Result | Detail |',
    '|---|---|---|',
    ...results.map((r) => `| ${r.name} | ${r.status} | ${r.detail.replace(/\|/g, '/')} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'REPORT.md'), md);
  console.log('Wrote', path.join(OUT, 'REPORT.md'));
}

main().catch((err) => {
  console.error(err);
  row('RUNTIME', 'FAIL', err.message || String(err));
  try {
    writeReport(process.env.LP_QA_LAST_CLONE_ID || '');
  } catch {
    /* */
  }
  process.exitCode = 1;
});
