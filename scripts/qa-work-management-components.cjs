const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.LP_PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.LP_CHROME_PATH ? { executablePath: process.env.LP_CHROME_PATH } : {}) });
  let checks = 0;
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({ content: fs.readFileSync(process.argv[2] || '.tmp/work-ui/bundle.js', 'utf8') });
      const employees = page.locator('#employees');
      await employees.getByRole('button', { name: 'Nguyễn An', exact: true }).click();
      await employees.getByLabel('Người thực hiện').fill('Nhân viên 20');
      await employees.getByRole('button', { name: 'Nhân viên 20', exact: true }).click();
      assert.equal(await employees.getByText('Nguyễn An', { exact: true }).count(), 1);
      await employees.getByRole('button', { name: 'Xóa từ khóa tìm nhân viên' }).click();
      assert.equal(await employees.getByLabel('Người thực hiện').inputValue(), '');
      assert.ok(await employees.getByText('Nhân viên 20', { exact: true }).count()); checks++;
      const custom = page.locator('#custom');
      await custom.getByRole('button', { name: 'Lưu thông tin bổ sung' }).click();
      assert.match(await custom.innerText(), /Vui lòng nhập Ngân sách/); checks++;
      await custom.getByLabel('Ngân sách').fill('1200');
      await custom.getByLabel('Loại việc').selectOption('Khách hàng');
      await custom.getByRole('button', { name: 'Lưu thông tin bổ sung' }).click();
      const saved = await page.evaluate(() => window.__wmCalls.find(call => call.name === 'update'));
      assert.deepEqual(saved.body.customFields, { budget: '1200', kind: 'Khách hàng' }); checks++;
      await page.evaluate(() => window.__wmFail = true);
      await custom.getByRole('button', { name: 'Lưu thông tin bổ sung' }).click();
      assert.match(await custom.innerText(), /Không thể lưu/); checks++;
      await page.evaluate(() => window.__wmFail = false);
      const timer = page.locator('#time');
      assert.equal(await timer.getByRole('button', { name: 'Bắt đầu', exact: true }).isEnabled(), true);
      await timer.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
      await timer.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
      await timer.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
      await timer.getByRole('button', { name: 'Kết thúc', exact: true }).click();
      assert.equal(await timer.getByRole('button', { name: 'Kết thúc', exact: true }).isDisabled(), true); checks++;
      for (const invalid of ['', '0', '1441']) {
        await timer.locator('input[type="number"]').fill(invalid);
        assert.equal(await timer.getByRole('button', { name: 'Lưu', exact: true }).isDisabled(), true);
      }
      await timer.locator('input[type="number"]').fill('30');
      await timer.getByRole('button', { name: 'Lưu', exact: true }).click();
      assert.ok(await page.evaluate(() => window.__wmCalls.some(call => call.name === 'manual' && call.body.durationMinutes === 30))); checks++;
      assert.deepEqual(errors, []); await page.close();
    }
    console.log(JSON.stringify({ passed: true, checks, widths: [1280, 390], productionComponents: true, networkHooks: 'mocked' }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
