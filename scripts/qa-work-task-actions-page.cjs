// Production page on local server; all API requests intercepted with isolated fixtures.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.LP_PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.LP_CHROME_PATH ? { executablePath: process.env.LP_CHROME_PATH } : {}) });
  let checks = 0;
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const errors = [], calls = [];
      let failDelete = false, failMove = false;
      const columns = [{ id: 'new', key: 'NEW', name: 'Cần làm', sortOrder: 0 }, { id: 'done', key: 'DONE', name: 'Hoàn thành', sortOrder: 1 }];
      const task = { id: 'qa-task', organizationId: 'qa-org', projectId: 'qa-project', columnId: 'new', columnKey: 'NEW', columnName: 'Cần làm', title: 'Chuẩn bị báo cáo', labels: [], checklist: [], assignees: [], watchers: [], priority: 'MEDIUM', progress: 0, sortOrder: 0, isArchived: false, createdAt: '2026-11-14T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z' };
      const project = { id: 'qa-project', name: 'Dự án kiểm thử menu', isArchived: false, columns, tasks: [task], customFieldDefs: [], _count: { tasks: 1 } };
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => localStorage.setItem('ms_access_token', `fixture.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.fixture`));
      await page.route('**/api/v1/**', async route => {
        const request = route.request(), path = new URL(request.url()).pathname.replace('/api/v1', '');
        if (request.method() !== 'GET') {
          calls.push({ path, method: request.method(), body: request.postDataJSON() });
          if (path.endsWith('/move')) {
            if (failMove) return route.fulfill({ status: 403, json: { message: 'Công việc cần được duyệt trước khi hoàn thành.' } });
            Object.assign(task, { columnId: 'done', columnKey: 'DONE', columnName: 'Hoàn thành', completedAt: new Date().toISOString() });
          }
          if (request.method() === 'DELETE') {
            if (failDelete) return route.fulfill({ status: 500, json: { message: 'Không thể xóa công việc thử nghiệm.' } });
            project.tasks = [];
          }
          return route.fulfill({ json: task });
        }
        let json = [];
        if (path === '/auth/me') json = { id: 'qa-user', name: 'QA', email: 'qa@example.test', role: 'OWNER', organizationId: 'qa-org', organization: { id: 'qa-org', name: 'QA', slug: 'qa' }, employee: null, permissions: [] };
        else if (path === '/billing/subscription') json = { hasPlan: true, isExpired: false, status: 'ACTIVE', subscriptionStatus: 'ACTIVE' };
        else if (path === '/work-management/projects') json = [project];
        else if (path === '/work-management/projects/qa-project') json = project;
        else if (path === '/hrm/employees') json = { items: [], total: 0, page: 1, totalPages: 1 };
        else if (path === '/work-management/tasks/qa-task') json = task;
        return route.fulfill({ json });
      });
      await page.goto(`${process.env.WM_QA_BASE || 'http://localhost:8080'}/work-management?projectId=qa-project`, { waitUntil: 'domcontentloaded' });
      const more = () => page.getByRole('button', { name: 'Thao tác với Chuẩn bị báo cáo', exact: true });
      try { await more().click({ timeout: 15000 }); }
      catch (error) { console.error({ url: page.url(), text: (await page.locator('body').innerText()).slice(0, 3500), errors }); throw error; }
      assert.equal(await page.getByRole('menuitem').count(), 5); checks++;
      fs.mkdirSync('.tmp/work-actions', { recursive: true });
      await page.screenshot({ path: `.tmp/work-actions/menu-${width}.png`, fullPage: true });
      await Promise.all([
        page.waitForResponse(response => response.request().method() === 'GET' && response.url().includes('/work-management/projects/qa-project')),
        page.getByRole('menuitem', { name: 'Nhân bản', exact: true }).click(),
      ]);
      assert.ok(calls.some(call => call.path.endsWith('/copy'))); checks++;
      await more().click(); await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click();
      let dialog = page.getByRole('dialog');
      await dialog.getByRole('heading', { name: 'Xóa công việc?' }).waitFor();
      assert.ok((await dialog.innerText()).includes('Chuẩn bị báo cáo'));
      await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();
      assert.equal(calls.filter(call => call.method === 'DELETE').length, 0); checks++;
      failDelete = true;
      await more().click(); await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click();
      await dialog.getByRole('button', { name: 'Xóa công việc', exact: true }).click();
      await dialog.getByRole('alert').waitFor();
      assert.ok((await dialog.getByRole('alert').innerText()).includes('Không thể xóa'));
      await dialog.getByRole('button', { name: 'Hủy', exact: true }).click(); checks++;
      failMove = true;
      await page.getByRole('button', { name: 'Hoàn thành công việc: Chuẩn bị báo cáo', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: 'Công việc cần được duyệt' }).waitFor();
      assert.equal(await page.getByRole('dialog').count(), 0); checks++;
      await page.getByRole('button', { name: 'Đóng thông báo', exact: true }).click();
      failMove = false;
      await page.getByRole('button', { name: 'Hoàn thành công việc: Chuẩn bị báo cáo', exact: true }).click();
      await page.getByRole('button', { name: 'Hoàn thành công việc: Chuẩn bị báo cáo', exact: true }).waitFor({ state: 'detached' });
      assert.equal(calls.filter(call => call.path.endsWith('/move')).length, 2); checks++;
      failDelete = false;
      await more().click(); await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click();
      await dialog.getByRole('button', { name: 'Xóa công việc', exact: true }).click();
      await dialog.waitFor({ state: 'detached' });
      await more().waitFor({ state: 'detached' }); checks++;
      assert.deepEqual(errors, []); checks++;
      await page.close();
    }
    console.log(JSON.stringify({ passed: true, checks, widths: [1440, 390], productionPage: true, APIs: 'intercepted fixtures; no business data changed' }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
