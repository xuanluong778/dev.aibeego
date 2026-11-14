// Real Radix menu and card components, isolated from business data/API mutations.
// Bundle scripts/fixtures/work-task-actions.tsx with esbuild before running.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.LP_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.LP_CHROME_PATH ? { executablePath: process.env.LP_CHROME_PATH } : {}) });
  let checks = 0;
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('http://task-actions.test/**', route => route.fulfill({ contentType: 'text/html', body: '<div id="root"></div>' }));
      const load = async (readonly = false) => {
        await page.goto(`http://task-actions.test/${readonly ? '?readonly' : ''}`);
        await page.addScriptTag({ content: fs.readFileSync(process.argv[2] || '.tmp/work-actions/bundle.js', 'utf8') });
        if (fs.existsSync('.tmp/work-actions/style.css')) await page.addStyleTag({ content: fs.readFileSync('.tmp/work-actions/style.css', 'utf8') });
      };
      await load();
      await page.getByRole('button', { name: 'Hoàn thành công việc: Chuẩn bị báo cáo', exact: true }).click();
      assert.deepEqual(await page.evaluate(() => window.__taskActionCalls), ['complete']); checks++;
      await page.getByRole('button', { name: 'Mở công việc: Chuẩn bị báo cáo', exact: true }).focus();
      await page.keyboard.press('Enter');
      assert.deepEqual(await page.evaluate(() => window.__taskActionCalls), ['complete', 'open']); checks++;
      const openMenu = async () => page.getByRole('button', { name: 'Thao tác với Chuẩn bị báo cáo', exact: true }).click();
      await openMenu();
      assert.equal(await page.getByRole('menuitem').count(), 5);
      assert.equal(await page.getByRole('menuitem', { name: 'Chi tiết', exact: true }).count(), 0); checks++;
      const switchStatus = page.getByRole('menuitem', { name: 'Chuyển trạng thái', exact: true });
      if (width < 640) await switchStatus.click();
      else { await switchStatus.focus(); await page.keyboard.press('ArrowRight'); }
      assert.equal(await page.getByRole('menuitem', { name: 'Cần làm (hiện tại)', exact: true }).getAttribute('aria-disabled'), 'true'); checks++;
      await page.getByRole('menuitem', { name: 'Hoàn thành', exact: true }).click();
      assert.equal(await page.getByRole('menu').count(), 0);
      assert.ok(await page.evaluate(() => window.__taskActionCalls.includes('move:done'))); checks++;
      for (const [label, call] of [['Chỉnh sửa', 'edit'], ['Nhân bản', 'copy'], ['Lưu trữ', 'archive'], ['Xóa', 'delete']]) {
        await openMenu(); await page.getByRole('menuitem', { name: label, exact: true }).click();
        assert.equal(await page.evaluate(() => window.__taskActionCalls.at(-1)), call); checks++;
      }
      if (width < 640) {
        await openMenu(); await page.getByRole('menuitem', { name: 'Chuyển trạng thái', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Chuyển trạng thái', exact: true }).click();
        assert.equal(await page.getByRole('menuitem').count(), 5); checks++;
        await page.keyboard.press('Escape');
        await openMenu(); assert.equal(await page.getByRole('menuitem').count(), 5); checks++;
      }
      await load(true); await openMenu();
      for (const item of await page.getByRole('menuitem').all()) assert.equal(await item.getAttribute('aria-disabled'), 'true');
      assert.equal(await page.getByRole('button', { name: 'Hoàn thành công việc: Chuẩn bị báo cáo', exact: true }).count(), 0); checks++;
      assert.deepEqual(errors, []); checks++;
      await page.close();
    }
    console.log(JSON.stringify({ passed: true, checks, widths: [1280, 390], realRadixComponents: true }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
