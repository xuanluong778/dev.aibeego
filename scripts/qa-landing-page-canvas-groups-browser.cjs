// Real Builder route + mouse/keyboard. All API calls are isolated in this test;
// persistence uses the real shared sanitizer and in-memory revision receipts.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
const origin = process.env.LP_GROUP_QA_ORIGIN || 'http://127.0.0.1:13008';
const out = process.env.LP_GROUP_QA_OUT || fs.mkdtempSync('/tmp/lp-group-browser-');
fs.mkdirSync(out, { recursive: true });
const report = { passed: false, steps: [], errors: [], origin, realApiWrites: 0 };
function fixture() {
  const base = shared.createBlankLandingPageSpec();
  const hero = {
    ...base.blocks.find((b) => b.type === 'Hero'),
    id: 'group-box',
    variant: 'minimal-copy',
    headline: 'Nội dung bên ngoài box',
    subheadline: 'Nội dung gốc ở cột khác không được chọn cùng.',
    ctaLabel: 'Nút bên ngoài',
    trustPoints: [],
    style: {
      lpAiGenerated: '1',
      lpContentColumns: 2,
      lpNativeColumnIndices: [1, 1],
      minHeight: '560px',
      background: '#fffaf2',
    },
  };
  const placement = {
    sectionId: 'group-box',
    anchor: { kind: 'end' },
    edge: 'after',
    columnIndex: 0,
  };
  const title = {
    id: 'box-title',
    type: 'Benefits',
    enabled: true,
    headline: 'Giới thiệu ý tưởng',
    subheadline: '',
    items: [],
    spacing: 'none',
    sectionPlacement: placement,
  };
  const body = {
    id: 'box-body',
    type: 'Benefits',
    enabled: true,
    headline: '',
    subheadline:
      'Biến ý tưởng của bạn thành một landing page ấn tượng, nhanh chóng và chuyên nghiệp ngay trên Builder.',
    items: [],
    spacing: 'none',
    sectionPlacement: placement,
  };
  const button = {
    id: 'box-button',
    type: 'CTA',
    enabled: true,
    headline: '',
    subheadline: '',
    body: '',
    ctaLabel: 'Khám phá ngay',
    ctaUrl: '#lead-form',
    spacing: 'none',
    sectionPlacement: placement,
    style: { background: '#0563ff', borderRadius: '12px', padding: '12px 20px' },
  };
  const outside = {
    id: 'outside-box',
    type: 'Benefits',
    enabled: true,
    headline: 'PHẦN TỬ NGOÀI BOX',
    subheadline: '',
    items: [],
    spacing: 'none',
  };
  return {
    ...base,
    blocks: [hero, title, body, button, outside],
    meta: {
      layout: 'classic',
      clientRevision: 10,
      inlineTextStyles: {
        'box-title::headline': {
          width: 300,
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.25,
          color: '#172033',
        },
        'box-body::subheadline': { width: 280, fontSize: 18, lineHeight: 1.5, color: '#172033' },
        'box-button::ctaLabel': { width: 220, fontSize: 18, fontWeight: 700 },
        'outside-box::headline': { width: 300, fontSize: 20 },
      },
    },
  };
}

const field = (
  p,
  f,
  block = f === 'headline' ? 'box-title' : f === 'subheadline' ? 'box-body' : 'box-button',
) =>
  p.locator(
    `[data-lp-element-kind="text"][data-lp-element-id="${block}::${f === 'ctaLabel' ? 'cta' : f}"][data-lp-inline-field="${f}"]`,
  );
const menu = (p) => p.locator('[data-lp-canvas-context-menu-content]');
async function settled(p) {
  await p.waitForTimeout(300);
}
async function open(p, target) {
  await target.click({ button: 'right' });
  await menu(p).waitFor();
}
async function choose(p, action) {
  await p.locator(`[data-lp-cm="${action}"]`).click();
  await settled(p);
}
async function positions(p) {
  return p.evaluate(() => {
    const result = {};
    for (const [key, bid, field] of [
      ['title', 'box-title', 'headline'],
      ['body', 'box-body', 'subheadline'],
      ['button', 'box-button', 'ctaLabel'],
      ['outside', 'outside-box', 'headline'],
    ]) {
      const node = Array.from(document.querySelectorAll('[data-lp-inline-field]')).find(
        (n) =>
          n.getAttribute('data-lp-element-id')?.startsWith(bid + '::') &&
          n.getAttribute('data-lp-inline-field') === field,
      );
      const r = node.closest('[data-lp-free-child][data-lp-free-id]').getBoundingClientRect();
      result[key] = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return result;
  });
}
async function waitUntil(p, test, description) {
  for (let i = 0; i < 70; i++) {
    if (test()) return;
    await p.waitForTimeout(100);
  }
  throw Error('Timeout: ' + description);
}
function groups(spec) {
  return spec.blocks.flatMap((b) => JSON.parse(b.style?.lpElementGroups || '[]'));
}
async function main() {
  const browser = await chromium.launch({
    executablePath:
      process.env.LP_QA_BROWSER || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  let currentPage, env, p;
  async function session(spec = fixture(), viewport = { width: 1542, height: 1000 }) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    currentPage = page;
    let stored = shared.sanitizeLandingPagePersistSpec(spec),
      aiRequests = [];
    page.on('pageerror', (e) => {
      report.errors.push(e.stack);
      console.error(e.stack);
    });
    await page.addInitScript(() =>
      localStorage.setItem(
        'ms_access_token',
        'qa.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.qa',
      ),
    );
    await page.route('**/api/v1/**', (route) => {
      const url = new URL(route.request().url()),
        p = url.pathname,
        method = route.request().method();
      let body = {};
      if (p.endsWith('/auth/me'))
        body = {
          id: 'qa',
          name: 'QA',
          email: 'qa@example.invalid',
          role: 'SUPER_ADMIN',
          permissions: [],
          organizationId: 'qa',
        };
      else if (p.endsWith('/canvas-group-qa/autosave')) {
        const req = route.request().postDataJSON();
        stored = shared.sanitizeLandingPagePersistSpec(req.draftSpec);
        body = {
          clientRevision: req.clientRevision,
          requestId: req.requestId,
          updatedAt: new Date().toISOString(),
        };
      } else if (p.endsWith('/canvas-group-qa')) {
        if (method === 'PATCH') {
          const req = route.request().postDataJSON();
          if (req.draftSpec) stored = shared.sanitizeLandingPagePersistSpec(req.draftSpec);
        }
        body = {
          id: 'canvas-group-qa',
          name: 'Canvas group QA',
          status: 'DRAFT',
          draftSpec: stored,
        };
      } else if (p.endsWith('/ai-suggest-field')) {
        const req = route.request().postDataJSON();
        const parsed = shared.landingPageInlineAiRequestSchema.safeParse(req);
        assert(parsed.success, 'AI request schema');
        aiRequests.push(req);
        body = { options: ['Gợi ý QA một', 'Gợi ý QA hai', 'Gợi ý QA ba'] };
      } else if (p.includes('subscription'))
        body = { hasPlan: true, status: 'ACTIVE', subscriptionStatus: 'ACTIVE', isExpired: false };
      else if (p.includes('/templates')) body = [];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.goto(origin + '/landing-pages/builder/canvas-group-qa', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    if (spec.blocks.some((b) => b.id === 'group-box'))
      await field(page, 'headline').waitFor({ timeout: 120000 });
    else
      await page.locator('[data-lp-canvas-root]').waitFor({ state: 'attached', timeout: 120000 });
    await settled(page);
    return { page, context, stored: () => stored, aiRequests };
  }
  try {
    if (!process.env.LP_GROUP_QA_ONLY_EXTRA) {
      console.log('QA: select-box / group / drag / history / reload');
      env = await session();
      p = env.page;
      await open(p, field(p, 'subheadline'));
      assert.equal(
        await menu(p).getByRole('menuitem').first().getAttribute('data-lp-cm'),
        'select-box',
      );
      assert.equal(await p.locator('[data-lp-cm="paste"]').count(), 0, 'Empty clipboard is hidden');
      assert(
        !/AI|Sửa text|Sao chép kiểu|Dán kiểu/.test(await menu(p).innerText()),
        'Compact menu has no moved commands',
      );
      await p.screenshot({ path: path.join(out, 'single-menu.png') });
      assert(
        await menu(p).evaluate((n) => n.scrollHeight <= n.clientHeight + 1),
        'Single menu fits without scrolling',
      );
      await choose(p, 'select-box');
      assert.equal(
        await p.locator('[data-lp-inline-field][data-lp-element-selected="1"]').count(),
        3,
        'Exactly three text/button members selected',
      );
      assert.match(
        await p.locator('[data-lp-group-toolbar]').innerText(),
        /3/,
        'Total selection count is exactly three, including non-text objects',
      );
      assert.equal(
        await field(p, 'headline', 'outside-box').getAttribute('data-lp-element-selected'),
        '0',
      );
      await open(p, field(p, 'subheadline'));
      assert.equal(await menu(p).getByRole('menuitem').first().getAttribute('data-lp-cm'), 'group');
      await p.screenshot({ path: path.join(out, 'multiple-menu.png') });
      assert(
        await menu(p).evaluate((n) => n.scrollHeight <= n.clientHeight + 1),
        'Multiple menu fits without scrolling',
      );
      await choose(p, 'group');
      await p.locator('[data-lp-grouped="1"]').waitFor();
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await settled(p);
      assert.equal(
        await p.locator('[data-lp-grouped="1"]').count(),
        0,
        'One undo removes group creation',
      );
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await settled(p);
      assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 1, 'Redo restores group');
      const before = await positions(p),
        hit = p.locator('[data-lp-group-selection-hit]'),
        r = await hit.boundingBox();
      await p.mouse.move(r.x + 20, r.y + 20);
      await p.mouse.down();
      await p.mouse.move(r.x + 70, r.y + 35, { steps: 15 });
      await p.mouse.up();
      await settled(p);
      const after = await positions(p),
        dx = after.title.x - before.title.x,
        dy = after.title.y - before.title.y;
      assert(Math.abs(dx) > 5 || Math.abs(dy) > 5, 'Group actually moved');
      for (const k of ['body', 'button']) {
        assert(Math.abs(after[k].x - before[k].x - dx) < 2, 'Relative horizontal offset ' + k);
        assert(Math.abs(after[k].y - before[k].y - dy) < 2, 'Relative vertical offset ' + k);
      }
      assert(
        Math.abs(after.outside.x - before.outside.x) < 1 &&
          Math.abs(after.outside.y - before.outside.y) < 1,
        'Outside element stays put',
      );
      assert.equal(
        await p.locator('[data-lp-multi-text-controls]').count(),
        0,
        'Mixed group hides text-only properties',
      );
      await p.screenshot({ path: path.join(out, 'group-dragged.png') });
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await settled(p);
      let undone = await positions(p);
      assert(Math.abs(undone.title.x - before.title.x) < 2, 'One undo restores group move');
      assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 1);
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await settled(p);
      assert(Math.abs((await positions(p)).title.x - after.title.x) < 2);
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(
        p,
        () =>
          groups(env.stored()).length === 1 &&
          groups(env.stored())[0].members.length === 3 &&
          Object.keys(env.stored().meta?.elementFreeLayouts || {}).length >= 3,
        'Group persistence',
      );
      await p.reload({ waitUntil: 'domcontentloaded' });
      await field(p, 'headline').waitFor();
      await settled(p);
      await field(p, 'headline').click();
      await p.locator('[data-lp-grouped="1"]').waitFor();
      await settled(p);
      const restored = await positions(p);
      assert(Math.abs(restored.title.x - after.title.x) < 2, 'Reload retains group position');
      const reloadHit = await p.locator('[data-lp-group-selection-hit]').boundingBox();
      await p.mouse.move(reloadHit.x + 15, reloadHit.y + 15);
      await p.mouse.down();
      await p.mouse.move(reloadHit.x + 35, reloadHit.y + 25, { steps: 8 });
      await p.keyboard.press('Escape');
      await p.mouse.up();
      await settled(p);
      assert(
        Math.abs((await positions(p)).title.x - restored.title.x) < 2,
        'Escape cancels a live group drag',
      );
      await p.mouse.move(reloadHit.x + 15, reloadHit.y + 15);
      await p.mouse.down();
      await p.mouse.move(reloadHit.x + 25, reloadHit.y + 20, { steps: 8 });
      await p.mouse.up();
      await settled(p);
      const loaded = await positions(p);
      assert(loaded.title.x - restored.title.x > 5, 'Reloaded group can still drag together');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      assert.equal(
        await menu(p).getByRole('menuitem').first().getAttribute('data-lp-cm'),
        'ungroup',
      );
      await p.screenshot({ path: path.join(out, 'group-menu.png') });
      await choose(p, 'ungroup');
      assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 0);
      const ungrouped = await positions(p);
      assert(
        Math.abs(ungrouped.title.x - loaded.title.x) < 1 &&
          Math.abs(ungrouped.button.y - loaded.button.y) < 1,
        'Ungroup preserves each position',
      );
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await settled(p);
      assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 1, 'Undo ungroup');
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await settled(p);
      assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 0, 'Redo ungroup');
      report.steps.push({
        name: 'box-three-elements-group-drag-undo-redo-persist-ungroup',
        passed: true,
        dx,
        dy,
      });
      await env.context.close();
      console.log('QA: common text style');
      env = await session();
      p = env.page;
      await field(p, 'headline').click();
      await field(p, 'subheadline').click({ modifiers: ['Shift'] });
      await settled(p);
      assert.equal(
        await p.locator('[data-lp-inline-field][data-lp-element-selected="1"]').count(),
        2,
      );
      await p.locator('[data-lp-multi-color]').fill('#dc2626');
      await settled(p);
      for (const f of ['headline', 'subheadline'])
        assert.equal(
          await field(p, f).evaluate((n) => getComputedStyle(n).color),
          'rgb(220, 38, 38)',
        );
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await settled(p);
      for (const f of ['headline', 'subheadline'])
        assert.notEqual(
          await field(p, f).evaluate((n) => getComputedStyle(n).color),
          'rgb(220, 38, 38)',
          'One undo restores both fields',
        );
      await p.locator('[data-lp-toolbar-btn="redo"]').click();
      await settled(p);
      for (const f of ['headline', 'subheadline'])
        assert.equal(
          await field(p, f).evaluate((n) => getComputedStyle(n).color),
          'rgb(220, 38, 38)',
        );
      report.steps.push({ name: 'two-texts-common-color-one-undo-redo', passed: true });
      await env.context.close();
      console.log('QA: single commands moved to inspector');
      env = await session();
      p = env.page;
      await field(p, 'headline').click();
      await settled(p);
      for (const action of ['ai-quick', 'ai-rewrite', 'edit', 'copy-style'])
        assert.equal(await p.locator(`[data-lp-text-action="${action}"]`).count(), 1);
      await p.locator('[data-lp-text-action="copy-style"]').click();
      await field(p, 'subheadline').click();
      await settled(p);
      assert.equal(await p.locator('[data-lp-text-action="paste-style"]').count(), 1);
      await p.locator('[data-lp-text-action="paste-style"]').click();
      await settled(p);
      assert.equal(
        await field(p, 'subheadline').evaluate((n) => getComputedStyle(n).fontSize),
        '30px',
      );
      await p.locator('[data-lp-text-action="edit"]').click();
      await settled(p);
      assert.equal(await field(p, 'subheadline').getAttribute('contenteditable'), 'true');
      await p.keyboard.press('Escape');
      await field(p, 'headline').click();
      await p.locator('[data-lp-text-action="ai-quick"]').click();
      await p.locator('[data-lp-ai-apply-replace]').waitFor();
      await settled(p);
      assert.equal(
        await p
          .locator('[data-lp-ai-quick-popover]')
          .evaluate((n) => n.parentElement === document.body),
        true,
      );
      await p.locator('[data-lp-ai-regenerate]').click();
      await settled(p);
      await p.locator('[data-lp-ai-apply-replace]').click();
      await settled(p);
      assert.equal(await field(p, 'headline').innerText(), 'Gợi ý QA một');
      assert(env.aiRequests.every((r) => ['suggest_3', 'rewrite'].includes(r.action)));
      report.steps.push({ name: 'all-five-moved-actions-accessible-edit-style-ai', passed: true });
      await env.context.close();
      console.log('QA: locked/hidden members and context selection');
      const lockedSpec = fixture();
      lockedSpec.meta.elementLocked = { 'box-button::ctaLabel': true };
      env = await session(lockedSpec);
      p = env.page;
      await open(p, field(p, 'subheadline'));
      await choose(p, 'select-box');
      assert.match(
        await p.locator('[data-lp-group-toolbar]').innerText(),
        /2/,
        'Locked button is excluded',
      );
      assert.equal(await field(p, 'ctaLabel').getAttribute('data-lp-element-selected'), '0');
      await open(p, field(p, 'headline'));
      assert.equal(await menu(p).getByRole('menuitem').first().getAttribute('data-lp-cm'), 'group');
      await choose(p, 'group');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await choose(p, 'lock');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      assert.match(await p.locator('[data-lp-cm="lock"]').innerText(), /Mở khóa/);
      assert.equal(
        await p.locator('[data-lp-cm="delete"]').count(),
        0,
        'Locked group cannot delete',
      );
      await choose(p, 'lock');
      await open(p, field(p, 'headline', 'outside-box'));
      assert.equal(
        await p.locator('[data-lp-group-frame]').count(),
        0,
        'Right click outside selection changes target',
      );
      await p.keyboard.press('Escape');
      assert.equal(await menu(p).count(), 0);
      report.steps.push({
        name: 'locked-excluded-group-lock-unlock-outside-context',
        passed: true,
      });
      await env.context.close();
      const hiddenSpec = fixture();
      hiddenSpec.meta.elementHidden = { 'box-body::subheadline': true };
      env = await session(hiddenSpec);
      p = env.page;
      await open(p, field(p, 'headline'));
      await choose(p, 'select-box');
      assert.match(
        await p.locator('[data-lp-group-toolbar]').innerText(),
        /2/,
        'Hidden paragraph excluded',
      );
      report.steps.push({ name: 'hidden-member-excluded', passed: true });
      await env.context.close();

      console.log('QA: nearest nested box');
      const nested = fixture();
      nested.blocks.unshift({
        id: 'nested-box',
        type: 'Benefits',
        enabled: true,
        headline: 'BOX CHA NGOÀI',
        items: [
          { id: 'card-one', title: 'Tiêu đề card một', description: 'Đoạn văn card một' },
          { id: 'card-two', title: 'Tiêu đề card hai', description: 'Đoạn văn card hai' },
        ],
      });
      env = await session(nested);
      p = env.page;
      const cardTitle = p.locator('[data-lp-inline-field="itemTitle:card-one"]');
      await open(p, cardTitle);
      await choose(p, 'select-box');
      assert.equal(
        await p.locator('[data-lp-inline-field][data-lp-element-selected="1"]').count(),
        2,
      );
      assert.match(await p.locator('[data-lp-group-toolbar]').innerText(), /2/);
      assert.equal(
        await p
          .locator('[data-lp-inline-field="itemTitle:card-two"]')
          .getAttribute('data-lp-element-selected'),
        '0',
      );
      assert.equal(
        await p.locator('[data-lp-item-id="card-one"]').getAttribute('data-lp-bounding-box'),
        '0',
        'Box itself excluded',
      );
      report.steps.push({ name: 'nearest-nested-box-only-two-children', passed: true });
      await env.context.close();

      console.log('QA: group duplicate/copy/paste/delete and layers');
      env = await session();
      p = env.page;
      await open(p, field(p, 'subheadline'));
      await choose(p, 'select-box');
      await open(p, field(p, 'headline'));
      await choose(p, 'group');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await p.locator('[data-lp-cm="layer"]').hover();
      await p.locator('[data-lp-cm="layer-up"]').click();
      await settled(p);
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(
        p,
        () => Boolean(env.stored().blocks.find((b) => b.id === 'box-title').style.lpElementLayers),
        'Group layer saved',
      );
      const layersBefore = env.stored().blocks.find((b) => b.id === 'box-title')
        .style.lpElementLayers;
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await choose(p, 'ungroup');
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(p, () => groups(env.stored()).length === 0, 'Ungroup saved');
      assert.equal(
        env.stored().blocks.find((b) => b.id === 'box-title').style.lpElementLayers,
        layersBefore,
        'Ungroup keeps paint order',
      );
      await open(p, field(p, 'headline'));
      await choose(p, 'group');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await choose(p, 'duplicate');
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(p, () => groups(env.stored()).length === 2, 'Duplicate group saved');
      assert.equal(env.stored().blocks.length, 8, 'Only three group members duplicated');
      assert(groups(env.stored()).every((g) => g.members.length === 3));
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await choose(p, 'copy');
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      assert.equal(await p.locator('[data-lp-cm="paste"]').count(), 1);
      await choose(p, 'paste');
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(p, () => groups(env.stored()).length === 3, 'Pasted group saved');
      assert.equal(env.stored().blocks.length, 11);
      await open(p, p.locator('[data-lp-group-selection-hit]'));
      await choose(p, 'delete');
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(p, () => env.stored().blocks.length === 8, 'Whole group delete');
      assert.equal(groups(env.stored()).length, 2);
      await p.locator('[data-lp-toolbar-btn="undo"]').click();
      await settled(p);
      await p.locator('[data-lp-toolbar-btn="save"]').click();
      await waitUntil(
        p,
        () => env.stored().blocks.length === 11,
        'One undo restores whole deleted group',
      );
      report.steps.push({
        name: 'group-layer-preserved-duplicate-copy-paste-delete-one-undo',
        passed: true,
      });
      await env.context.close();
    }
    console.log('QA: blank canvas menu and mixed image group');
    env = await session();
    p = env.page;
    const blankPoint = async () => {
      const r = await p.locator('[data-lp-canvas-context-menu]').boundingBox();
      return { x: r.x + 12, y: Math.min(970, r.y + r.height - 10) };
    };
    let bp = await blankPoint();
    await p.mouse.click(bp.x, bp.y, { button: 'right' });
    await settled(p);
    assert.equal(await menu(p).count(), 0, 'Blank canvas with empty clipboard has no commands');
    await p.keyboard.press('Escape');
    await open(p, field(p, 'headline'));
    await choose(p, 'copy');
    bp = await blankPoint();
    await p.mouse.click(bp.x, bp.y, { button: 'right' });
    await menu(p).waitFor();
    assert.equal(
      await menu(p).getByRole('menuitem').count(),
      1,
      'Blank canvas has only compatible Paste',
    );
    assert.equal(await menu(p).getByRole('menuitem').first().getAttribute('data-lp-cm'), 'paste');
    await choose(p, 'paste');
    await env.context.close();
    const mixed = shared.createBlankLandingPageSpec(),
      mixedHero = { ...mixed.blocks.find((b) => b.type === 'Hero'), id: 'mixed-box' };
    mixed.blocks = [mixedHero];
    mixed.meta = { ...mixed.meta, clientRevision: 10 };
    env = await session(mixed);
    p = env.page;
    const mixedTitle = field(p, 'headline', 'mixed-box');
    await mixedTitle.waitFor();
    await open(p, mixedTitle);
    await choose(p, 'select-box');
    assert.match(
      await p.locator('[data-lp-group-toolbar]').innerText(),
      /4/,
      'Image, title, paragraph and button selected',
    );
    assert.equal(
      await p.locator('[data-lp-multi-text-controls]').count(),
      0,
      'Image mixed selection hides text-only controls',
    );
    await open(p, mixedTitle);
    await choose(p, 'group');
    assert.equal(await p.locator('[data-lp-grouped="1"]').count(), 1);
    const mixedPositions = async () =>
      p.evaluate(() => {
        const read = (n) => {
          const r = n.getBoundingClientRect();
          return { x: r.x, y: r.y };
        };
        return {
          image: read(
            document.querySelector(
              '[data-lp-element-kind="image"][data-lp-element-id="mixed-box::image"]',
            ),
          ),
          button: read(document.querySelector('.blank-button')),
          title: read(
            document.querySelector(
              '[data-lp-element-id="mixed-box::headline"][data-lp-inline-field]',
            ),
          ),
        };
      });
    const mixedBefore = await mixedPositions(),
      mixedHit = await p.locator('[data-lp-group-selection-hit]').boundingBox();
    await p.mouse.move(mixedHit.x + 18, Math.max(130, mixedHit.y + 18));
    await p.mouse.down();
    await p.mouse.move(mixedHit.x + 32, Math.max(130, mixedHit.y + 18) + 7, { steps: 8 });
    await p.mouse.up();
    await settled(p);
    const mixedAfter = await mixedPositions(),
      mx = mixedAfter.image.x - mixedBefore.image.x,
      my = mixedAfter.image.y - mixedBefore.image.y;
    assert(Math.abs(mx) > 2 || Math.abs(my) > 2, 'Mixed image group really moves');
    for (const k of ['button', 'title']) {
      assert(
        Math.abs(mixedAfter[k].x - mixedBefore[k].x - mx) < 2,
        'Whole button/image move together horizontally',
      );
      assert(
        Math.abs(mixedAfter[k].y - mixedBefore[k].y - my) < 2,
        'Whole button/image move together vertically',
      );
    }
    await p.locator('[data-lp-toolbar-btn="save"]').click();
    await waitUntil(p, () => groups(env.stored()).length === 1, 'Mixed group persisted');
    assert(
      groups(env.stored())[0].members.some((key) => key === 'mixed-box::image'),
      'Image member persists',
    );
    await open(p, p.locator('[data-lp-group-selection-hit]'));
    await choose(p, 'duplicate');
    await p.locator('[data-lp-toolbar-btn="save"]').click();
    await waitUntil(
      p,
      () => groups(env.stored()).length === 2,
      'Mixed image group duplicate saved',
    );
    assert.equal(env.stored().blocks.length, 5, 'All four mixed members duplicated');
    assert.equal(
      await p.locator('[data-lp-grouped="1"]').count(),
      1,
      'Mixed duplicate retains shared frame',
    );
    const imageClone = env.stored().blocks.find((b) => b.id !== 'mixed-box' && b.imageUrl);
    assert.equal(imageClone.imageUrl, mixedHero.imageUrl, 'Image URL preserved');
    const clonedImage = p.locator(
      `[data-lp-element-kind="image"][data-lp-element-id="${imageClone.id}::image"]`,
    );
    await clonedImage.waitFor();
    assert(await clonedImage.getAttribute('data-lp-free-id'), 'Duplicated image remains movable');
    assert.equal(await clonedImage.evaluate(n=>Boolean(n.closest('[data-lp-element-kind="button"]'))),false,'Cloned image is independent of the source button');
    await p.screenshot({path:path.join(out,'mixed-image-group.png')});
    await env.context.close();
    report.steps.push({
      name: 'empty-canvas-compatible-paste-only-mixed-image-text-button-group',
      passed: true,
    });

    console.log('QA: menu viewport collision and outside close');
    for (const viewport of [
      { width: 1542, height: 550 },
      { width: 1060, height: 700 },
    ]) {
      env = await session(fixture(), viewport);
      p = env.page;
      await field(p, 'ctaLabel').scrollIntoViewIfNeeded();
      const br = await field(p, 'ctaLabel').boundingBox();
      await field(p, 'ctaLabel').click({
        button: 'right',
        position: { x: Math.max(2, br.width - 3), y: Math.max(2, br.height - 3) },
      });
      await menu(p).waitFor();
      await p.keyboard.press('Escape');
      await field(p, 'ctaLabel').dispatchEvent('contextmenu', {
        bubbles: true,
        clientX: viewport.width - 3,
        clientY: viewport.height - 3,
        button: 2,
      });
      await menu(p).waitFor();
      const mr = await menu(p).boundingBox();
      assert(
        mr.x >= 0 &&
          mr.y >= 0 &&
          mr.x + mr.width <= viewport.width + 1 &&
          mr.y + mr.height <= viewport.height + 1,
        'Main menu clamped to viewport',
      );
      assert(
        await menu(p).evaluate((n) => n.scrollHeight <= n.clientHeight + 1),
        'No desktop menu scrolling',
      );
      await p.locator('[data-lp-cm="layer"]').hover();
      const sub = p.locator('[data-lp-cm="layer-up"]');
      await sub.waitFor();
      const sr = await sub.boundingBox();
      assert(
        sr.x >= 0 && sr.x + sr.width <= viewport.width + 1,
        'Submenu chooses available direction',
      );
      await p.keyboard.press('Escape');
      await p.keyboard.press('Escape');
      assert.equal(await menu(p).count(), 0);
      await open(p, field(p, 'headline'));
      await p.locator('[data-lp-toolbar-btn="undo"]').click({ force: true });
      await settled(p);
      assert.equal(await menu(p).count(), 0, 'Outside click closes menu');
      await env.context.close();
    }
    report.steps.push({ name: 'viewport-bottom-right-submenus-escape-outside', passed: true });
    assert.deepEqual(report.errors, []);
    report.passed = true;
  } finally {
    if (!report.passed && currentPage && !currentPage.isClosed())
      await currentPage.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(
    JSON.stringify({
      passed: report.passed,
      steps: report.steps.length,
      errors: report.errors.length,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
