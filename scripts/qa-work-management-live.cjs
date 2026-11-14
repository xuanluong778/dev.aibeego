// Browser smoke on an explicitly prepared, isolated QA account. Uses live APIs.
const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require(process.env.LP_PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const fixture = JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''));
  const browser = await chromium.launch({ headless: true, ...(process.env.LP_CHROME_PATH ? { executablePath: process.env.LP_CHROME_PATH } : {}) });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(token => localStorage.setItem('ms_access_token', token), fixture.token);
    const base = process.env.WM_QA_BASE || 'http://localhost:8080';
    await page.goto(`${base}/work-management`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tạo dự án', exact: true }).click();
    let dialog = page.getByRole('dialog');
    await dialog.locator('input').first().fill('QA - Dự án kiểm thử giao diện');
    const projectResponse = page.waitForResponse(r => r.request().method() === 'POST' && /\/work-management\/projects$/.test(r.url()));
    await dialog.getByRole('button', { name: 'Tạo', exact: true }).click();
    const createdProject = await projectResponse;
    assert.ok(createdProject.ok(), `createProject HTTP ${createdProject.status()}`);
    const project = await createdProject.json();
    results.push('Tạo dự án từ giao diện qua API thật');
    await page.getByRole('button', { name: 'Tạo công việc', exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.locator('input').first().fill('QA - Chuẩn bị báo cáo tháng');
    await dialog.locator('textarea').first().fill('Kiểm thử mô tả tiếng Việt và lưu dữ liệu.');
    await dialog.locator('input[type="date"]').nth(0).fill('2026-11-14');
    await dialog.locator('input[type="date"]').nth(1).fill('2026-12-01');
    await dialog.getByRole('button', { name: 'Nhân viên QA', exact: true }).nth(1).click();
    await dialog.locator('textarea').last().fill('Chuẩn bị tài liệu\n[x] Xác nhận đầu việc');
    const taskResponse = page.waitForResponse(r => r.request().method() === 'POST' && /\/work-management\/tasks$/.test(r.url()));
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    const createdTask = await taskResponse;
    assert.ok(createdTask.ok(), `createTask HTTP ${createdTask.status()}`);
    const task = await createdTask.json();
    assert.equal(task.assignees.length, 1); assert.equal(task.checklist.length, 2); assert.equal(task.deadline, '2026-12-01');
    results.push('Tạo việc: tên, mô tả, ngày, người thực hiện và checklist');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText('QA - Chuẩn bị báo cáo tháng', { exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('Viết bình luận...').fill('QA: Đã kiểm tra thông tin công việc.');
    const commentResponse = page.waitForResponse(r => r.request().method() === 'POST' && /\/comments$/.test(r.url()));
    await dialog.getByRole('button', { name: 'Gửi', exact: true }).click();
    assert.ok((await commentResponse).ok());
    await dialog.getByText('QA: Đã kiểm tra thông tin công việc.', { exact: true }).waitFor();
    results.push('Tải lại việc đã lưu, mở chi tiết và gửi bình luận');
    await page.screenshot({ path: '.tmp/work-qa/live-task-detail.png', fullPage: true });
    for (const route of ['/work-management/my', '/work-management/dashboard', '/work-management/calendar']) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('main').waitFor();
      await page.waitForTimeout(700);
      assert.ok(!/Không thể tải|Có lỗi xảy ra/.test(await page.locator('main').innerText()), route);
      assert.ok(page.url().includes(route), route);
      results.push(`Mở trang ${route}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/work-management?projectId=${project.id}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('QA - Chuẩn bị báo cáo tháng', { exact: true }).waitFor();
    await page.screenshot({ path: '.tmp/work-qa/live-board-mobile.png', fullPage: true });
    results.push('Hiển thị bảng việc trên màn hình 390px');
    assert.deepEqual(errors, []);
    fs.writeFileSync('.tmp/work-qa/live-browser-results.json', JSON.stringify({ passed: true, liveApi: true, results }, null, 2));
    console.log(JSON.stringify({ passed: true, checks: results.length, liveApi: true }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
