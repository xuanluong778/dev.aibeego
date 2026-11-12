#!/usr/bin/env node
// Real Next UI, with all API requests fulfilled by fixtures. Never writes customer data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = require('../packages/shared/dist');

const base = process.env.LP_PICKER_QA_URL || 'http://127.0.0.1:3128';
const out = process.env.LP_PICKER_QA_OUT || '/var/www/aibeego_com_usr/data/backups/template-picker-20261031/qa';
const catalog = LANDING_PAGE_SYSTEM_TEMPLATES;
const items = catalog.map((template) => ({
  id: template.slug, slug: template.slug, name: template.name, category: template.category,
  theme: template.theme, description: template.description,
  thumbnailUrl: template.thumbnail, previewLongImage: template.previewLongImage,
}));
items[0] = { ...items[0], name: 'Thiết kế Đẹp · Mẫu sản phẩm' };
items[1] = { ...items[1], previewLongImage: '/fixture-missing-long.webp' };
items.push({ ...items[0], id: 'missing', slug: 'fixture-no-image', name: 'Mẫu chưa có ảnh', thumbnailUrl: null, previewLongImage: null });

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
  await context.addInitScript((value) => {
    localStorage.setItem('ms_access_token', value);
    localStorage.setItem('mkspa.mainSidebarCollapsed', '0');
  }, token);
  let failList = true;
  let creates = [];
  let previews = [];
  await context.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname.replace('/api/v1', '');
    const respond = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (pathname === '/auth/me') return respond({ id: 'fixture-user', name: 'Template QA', role: 'SUPER_ADMIN', email: 'fixture@example.invalid', organizationId: 'fixture-org', organization: { name: 'Template QA' } });
    if (pathname === '/billing/subscription') return respond({ hasPlan: true, status: 'ACTIVE', isExpired: false });
    if (pathname === '/landing-pages/business-profile') return respond({ isEmpty: true });
    if (pathname === '/landing-pages/templates') return failList ? respond({ message: 'Fixture temporary error' }, 500) : respond({ items });
    if (pathname.startsWith('/landing-pages/templates/')) {
      const slug = decodeURIComponent(pathname.split('/').pop());
      previews.push(slug);
      return respond({ slug, definition: catalog.find((template) => template.slug === slug)?.spec || catalog[0].spec });
    }
    if (pathname === '/landing-pages' && request.method() === 'POST') {
      creates.push(request.postDataJSON());
      await new Promise((resolve) => setTimeout(resolve, 300));
      return respond({ message: 'Fixture: kiểm tra lỗi tạo mẫu' }, 500);
    }
    if (request.method() !== 'GET') return respond({ message: 'Unexpected fixture write' }, 400);
    return respond({ items: [], total: 0, unreadCount: 0, balance: 0 });
  });
  await context.route('**/fixture-missing-long.webp*', (route) => route.fulfill({ status: 404 }));
  await context.route('**/landing-pages/templates/fixture-no-image-*', (route) => route.fulfill({ status: 404 }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('/_next/')) console.log('ASSET_ERROR', response.status(), response.url()); });
  page.setDefaultTimeout(25000);
  try {
    await page.goto(`${base}/landing-pages/create`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-lp-create-modes] button').filter({ hasText: 'Chọn Template' }).click();
    await page.getByText('Không tải được thư viện template. Vui lòng thử lại.').waitFor();
    failList = false;
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.locator('[data-lp-template-card]').first().waitFor();
    assert.equal(await page.locator('[data-lp-template-card]').count(), items.length);
    const use = page.locator('[data-lp-template-actions]').getByRole('button', { name: 'Dùng template này' });
    assert.equal(await use.isDisabled(), true);

    async function geometry(expectedColumns) {
      const result = await page.evaluate(() => {
        const grid = document.querySelector('[data-lp-template-grid]');
        const picker = document.querySelector('[data-lp-template-picker]');
        const bar = document.querySelector('[data-lp-template-actions]');
        const cards = Array.from(document.querySelectorAll('[data-lp-template-card]')).slice(0, 4).map((card) => {
          const rect = card.getBoundingClientRect();
          const img = card.querySelector('img');
          return { width: rect.width, top: rect.top, imageWidth: img?.getBoundingClientRect().width, imageHeight: img?.getBoundingClientRect().height };
        });
        const innerScroll = [picker, grid].some((node) => /auto|scroll/.test(getComputedStyle(node).overflowY));
        const main = document.querySelector('[data-app-shell-main]').getBoundingClientRect();
        return {
          columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          bar: { left: bar.getBoundingClientRect().left, right: bar.getBoundingClientRect().right, bottom: bar.getBoundingClientRect().bottom, position: getComputedStyle(bar).position },
          mainWidth: main.width, pickerWidth: picker.getBoundingClientRect().width,
          innerScroll, cards, overflow: document.documentElement.scrollWidth > innerWidth,
          sidebar: document.querySelector('[data-app-shell-sidebar]').getBoundingClientRect().right,
        };
      });
      assert.equal(result.columns, expectedColumns);
      assert.equal(result.bar.position, 'fixed');
      assert.equal(result.innerScroll, false);
      assert.equal(result.overflow, false);
      const viewport = page.viewportSize();
      assert.ok(Math.abs(result.bar.right - viewport.width) < 2);
      assert.ok(Math.abs(result.bar.bottom - viewport.height) < 2);
      if (viewport.width >= 1024) {
        assert.ok(Math.abs(result.bar.left - result.sidebar) < 2);
        assert.ok(Math.abs(result.pickerWidth - (result.mainWidth - 48)) < 2);
      }
      return result;
    }
    await page.locator('[data-lp-template-card] img').first().evaluate((img) => img.decode());
    const expanded = await geometry(4);
    await page.screenshot({ path: path.join(out, 'desktop-expanded.png') });
    await page.getByRole('button', { name: 'Đóng sidebar chính', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-lp-template-actions]').getBoundingClientRect().left < 60);
    const collapsed = await geometry(4);
    assert.ok(collapsed.cards[0].width > expanded.cards[0].width);
    assert.ok(Math.abs(collapsed.cards[0].imageWidth / collapsed.cards[0].imageHeight - .8) < .01);
    await page.screenshot({ path: path.join(out, 'desktop-collapsed.png') });
    console.log('PASS desktop: four proportional columns, full width, sidebar and fixed bar synchronized');

    const filter = page.getByRole('textbox', { name: 'Lọc template theo tên hoặc ngành' });
    await filter.fill('thiet ke dep');
    assert.equal(await page.locator('[data-lp-template-card]').count(), 1);
    await page.locator('[data-lp-template-card]').first().getByRole('button', { name: /^Chọn mẫu/ }).click();
    assert.equal(await use.isEnabled(), true);
    await filter.fill('no-such-template');
    await page.getByText('Không có template khớp bộ lọc.').waitFor();
    assert.equal(await use.isEnabled(), true);
    await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
    assert.equal(await page.locator('[data-lp-template-card]').count(), items.length);
    console.log('PASS accent-insensitive filter, empty state, persistent selection');

    await page.locator('[data-lp-template-card]').nth(1).locator('img').evaluate((img) => img.decode().catch(() => {}));
    await page.waitForFunction(() => {
      const img = document.querySelectorAll('[data-lp-template-card] img')[1];
      return img.complete && img.naturalWidth > 0 && !img.src.includes('fixture-missing-long');
    });
    await page.locator('[data-lp-template-card]').last().scrollIntoViewIfNeeded();
    await page.getByText('Ảnh xem trước chưa có', { exact: true }).waitFor();
    await geometry(4);
    const lastCard = await page.locator('[data-lp-template-card]').last().boundingBox();
    const footer = await page.locator('[data-lp-template-actions]').boundingBox();
    assert.ok(lastCard.y + lastCard.height <= footer.y);
    console.log('PASS missing-image fallback, page scroll and last card clear of fixed actions');

    for (const width of [1024, 820, 640, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => scrollTo(0, 0));
      await geometry(width >= 1024 ? 4 : width >= 480 ? 2 : 1);
      await page.screenshot({ path: path.join(out, `responsive-${width}.png`) });
    }
    console.log('PASS responsive widths: 1024, 820, 640, 390, 320; no horizontal overflow');

    await page.setViewportSize({ width: 1440, height: 1000 });
    const second = page.locator('[data-lp-template-card]').nth(1);
    await second.getByRole('button', { name: 'Xem trước', exact: true }).click();
    await page.locator('[data-lp-template-preview-shell]').waitFor();
    await page.locator('[data-lp-template-preview-shell]').getByRole('button', { name: 'Sử dụng mẫu', exact: true }).waitFor({ state: 'visible' });
    const previewUse = page.locator('[data-lp-template-preview-shell]').getByRole('button', { name: 'Sử dụng mẫu', exact: true });
    await previewUse.click();
    await page.waitForFunction(() => document.body.textContent.includes('Fixture: kiểm tra lỗi tạo mẫu'));
    assert.equal(previews.at(-1), items[1].slug);
    assert.equal(creates.at(-1).templateSlug, items[1].slug);
    assert.ok(creates.at(-1).idempotencyKey);
    await page.locator('[data-lp-template-preview-shell]').waitFor({ state: 'detached' });
    await page.locator('[data-lp-template-actions]').getByRole('alert').waitFor();
    assert.equal(await use.isEnabled(), true);
    const before = creates.length;
    await use.evaluate((button) => { button.click(); button.click(); });
    await page.waitForTimeout(500);
    assert.equal(creates.length, before + 1);
    assert.equal(creates.at(-1).templateSlug, items[1].slug);
    console.log('PASS real preview, use correct previewed template, idempotency, double-submit guard and creation error recovery');
    assert.equal(await page.locator('[data-lp-template-actions] a').getAttribute('href'), '/landing-pages/templates');
    assert.deepEqual(errors, []);
    console.log('PASS no browser runtime errors; every API request mocked');
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ base, expanded, collapsed, widths: [1440, 1024, 820, 640, 390, 320], templates: items.length, creates, errors }, null, 2));
  } catch (error) {
    console.error('PAGE', page.url(), 'ERRORS', errors, 'TEXT', (await page.locator('body').innerText()).slice(0, 3000));
    await page.screenshot({ path: path.join(out, 'failure.png') });
    throw error;
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
