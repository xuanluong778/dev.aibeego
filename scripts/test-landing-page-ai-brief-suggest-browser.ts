import '../apps/api/node_modules/reflect-metadata';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { LandingPagesService } from '../apps/api/src/landing-pages/landing-pages.service';
const base = process.env.LP_BRIEF_QA_URL || 'http://127.0.0.1:3149';
const out = process.env.LP_BRIEF_QA_OUT || '/var/www/aibeego_com_usr/data/backups/ai-brief-suggestions-20261031/browser';
async function main() {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
  const actor: any = { id: 'fixture-user', organizationId: 'fixture-org', role: 'SUPER_ADMIN', name: 'Brief QA', email: 'fixture@example.invalid', organization: { name: 'Brief QA' } };
  const service = new LandingPagesService({} as any, { assertWithinLimit: () => {} } as any, {} as any, {} as any, new LandingPageAiService({ isConfigured: () => false } as any), {} as any);
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
  await context.addInitScript((value: string) => localStorage.setItem('ms_access_token', value), token);
  const requests: any[] = []; let fail = false;
  await context.route('**/api/v1/**', async route => {
    const request = route.request(); const path = new URL(request.url()).pathname.replace('/api/v1', '');
    const reply = (value: any, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (path === '/auth/me') return reply(actor);
    if (path === '/billing/subscription') return reply({ hasPlan: true, status: 'ACTIVE', isExpired: false });
    if (path === '/landing-pages/business-profile') return reply({ isEmpty: true });
    if (path === '/landing-pages/templates') return reply({ items: [] });
    if (path === '/landing-pages/ai-suggest-brief') {
      const body = request.postDataJSON(); requests.push(body);
      await new Promise(resolve => setTimeout(resolve, 250));
      if (fail) { fail = false; return reply({ message: 'Fixture: mất kết nối tạm thời' }, 500); }
      return reply(await service.suggestAiBrief(actor, body));
    }
    assert.equal(request.method(), 'GET', 'Unexpected page mutation');
    return reply({ items: [], total: 0, unreadCount: 0, balance: 0 });
  });
  const page = await context.newPage(); const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(25000);
  const panel = (field: string) => page.locator(`[data-lp-brief-suggest="${field}"]`);
  try {
    const initial = await page.goto(`${base}/landing-pages/create`, { waitUntil: 'domcontentloaded' }); assert.equal(initial?.status(), 200);
    await page.locator('#lp-ai-productService').waitFor();
    assert.equal(await page.getByRole('button', { name: /^Gợi ý AI cho/ }).count(), 3);
    for (const trigger of await page.getByRole('button', { name: /^Gợi ý AI cho/ }).all()) assert.equal(await trigger.isDisabled(), true);
    await page.locator('#lp-ai-productService').fill('Phần mềm quản lý công việc');
    await page.locator('#lp-ai-industry').selectOption('saas');
    const before = await page.locator('#lp-ai-targetCustomer').inputValue();
    await panel('targetCustomer').getByRole('button', { name: /^Gợi ý AI/ }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await panel('targetCustomer').getByRole('button', { name: /^Áp dụng gợi ý 1/ }).waitFor();
    assert.equal(requests.filter(body => body.field === 'targetCustomer').length, 1);
    assert.equal(await page.locator('#lp-ai-targetCustomer').inputValue(), before);
    assert.equal(await panel('targetCustomer').getByRole('button', { name: /^Áp dụng gợi ý/ }).count(), 3);
    await panel('targetCustomer').getByRole('button', { name: /^Áp dụng gợi ý 1/ }).click();
    assert.match(await page.locator('#lp-ai-targetCustomer').inputValue(), /Chủ doanh nghiệp/);
    assert.equal(await page.locator('#lp-ai-painPoint').inputValue(), '');
    console.log('PASS all three fields offer suggestions, empty field supported, no automatic overwrite, double-click guarded');

    await panel('painPoint').getByRole('button', { name: /^Gợi ý AI/ }).click();
    await page.locator('#lp-ai-painPoint').fill('Nội dung người dùng vừa sửa');
    await panel('painPoint').getByText('Thông tin đã thay đổi.', { exact: false }).waitFor();
    assert.equal(await panel('painPoint').getByRole('button', { name: /^Áp dụng gợi ý 1/ }).isDisabled(), true);
    await panel('painPoint').getByRole('button', { name: 'Lấy gợi ý mới', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[data-lp-brief-suggest="painPoint"] button[aria-label^="Áp dụng gợi ý 1"]')?.hasAttribute('disabled'));
    await panel('painPoint').getByRole('button', { name: /^Áp dụng gợi ý 2/ }).click();
    assert.notEqual(await page.locator('#lp-ai-painPoint').inputValue(), 'Nội dung người dùng vừa sửa');
    console.log('PASS edits while AI loads are preserved; stale options cannot overwrite current text');

    fail = true;
    await panel('uspBenefits').getByRole('button', { name: /^Gợi ý AI/ }).click();
    await panel('uspBenefits').getByRole('alert').waitFor();
    const failed = requests.at(-1);
    await panel('uspBenefits').getByRole('button', { name: 'Thử lại', exact: true }).click();
    await panel('uspBenefits').getByRole('button', { name: /^Áp dụng gợi ý 1/ }).waitFor();
    assert.equal(requests.at(-1).idempotencyKey, failed.idempotencyKey);
    assert.equal(await page.locator('#lp-ai-uspBenefits').inputValue(), '');
    assert.ok(requests.at(-1).targetCustomer); assert.ok(requests.at(-1).painPoint);
    assert.equal('extraNotes' in requests.at(-1), false); assert.equal('ctaLabel' in requests.at(-1), false);
    fail = true;
    await panel('uspBenefits').getByRole('button', { name: 'Gợi ý khác', exact: true }).click();
    await panel('uspBenefits').getByRole('alert').waitFor();
    const regenerationKey = requests.at(-1).idempotencyKey;
    assert.notEqual(regenerationKey, failed.idempotencyKey);
    const beforeRetry = requests.length;
    await panel('uspBenefits').getByRole('button', { name: 'Thử lại', exact: true }).click();
    await panel('uspBenefits').getByRole('alert').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => !document.querySelector('[data-lp-brief-suggest="uspBenefits"] button[aria-label^="Gợi ý AI"]')?.hasAttribute('disabled'));
    assert.equal(requests.length, beforeRetry + 1);
    assert.equal(requests.at(-1).idempotencyKey, regenerationKey);
    await page.screenshot({ path: `${out}/desktop.png` });
    await page.setViewportSize({ width: 320, height: 800 });
    await panel('uspBenefits').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const button of await panel('uspBenefits').getByRole('button', { name: /^Áp dụng gợi ý/ }).all()) {
      const rect = await button.boundingBox(); assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= 320);
    }
    await page.screenshot({ path: `${out}/phone-320.png` });
    await panel('uspBenefits').getByRole('button', { name: /^Áp dụng gợi ý 1/ }).click();
    assert.ok((await page.locator('#lp-ai-uspBenefits').inputValue()).includes('Phần mềm quản lý công việc'));
    assert.deepEqual(errors, []);
    writeFileSync(`${out}/report.json`, JSON.stringify({ base, fields: 3, requests: requests.length, errors, noPageWrites: true }, null, 2));
    console.log('PASS contextual USP, stable retry, responsive 320px and no page writes/runtime errors');
    console.log('BRIEF_SUGGEST_BROWSER=PASS');
  } catch (error) {
    console.error('PAGE', page.url(), errors); await page.screenshot({ path: `${out}/failure.png` }); throw error;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
