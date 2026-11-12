/** Real create/preview/Builder UI; fixture APIs call the actual backend generation/create code. */
import '../apps/api/node_modules/reflect-metadata';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { LandingPagesService } from '../apps/api/src/landing-pages/landing-pages.service';
import { LANDING_PAGE_SYSTEM_TEMPLATES, sanitizeLandingPageSpec } from '../packages/shared/dist';
const base = process.env.LP_AI_QA_URL || 'http://127.0.0.1:3148';
const output = process.env.LP_AI_QA_OUT || '/var/www/aibeego_com_usr/data/backups/ai-landing-upgrade-20261031/browser';

async function main() {
  mkdirSync(output, { recursive: true });
  const courseFixture = process.env.LP_AI_COURSE_FIXTURE ? JSON.parse(readFileSync(process.env.LP_AI_COURSE_FIXTURE, 'utf8')) : null;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
  const actor: any = { id: 'fixture-user', organizationId: 'fixture-org', role: 'SUPER_ADMIN', email: 'fixture@example.invalid', name: 'AI QA', organization: { name: 'AI QA' } };
  let stored: any = null; let generated: any = null; let generatedBody: any = null; let createBodies: any[] = []; let failCreate = true; let autosaves: any[] = [];
  const prisma: any = { landingPage: {
    findFirst: async () => stored,
    create: async ({ data }: any) => { stored = { ...data, id: 'fixture-ai-page', publishedSpec: null, createdAt: new Date(), updatedAt: new Date() }; return stored; },
  } };
  const service = new LandingPagesService(prisma, { assertWithinLimit: () => {} } as any, {} as any, {} as any, new LandingPageAiService({ isConfigured: () => false } as any), {} as any);
  (service as any).ensureSystemTemplates = async () => {};
  (service as any).uniqueSlug = async () => 'fixture-ai-page';
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
  await context.addInitScript((value: string) => localStorage.setItem('ms_access_token', value), token);
  await context.route('**/api/v1/**', async route => {
    const request = route.request(); const pathname = new URL(request.url()).pathname.replace('/api/v1', '');
    const reply = (value: any, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (pathname === '/auth/me') return reply(actor);
    if (pathname === '/billing/subscription') return reply({ hasPlan: true, status: 'ACTIVE', isExpired: false });
    if (pathname === '/landing-pages/business-profile') return reply({ brandName: 'Hồ sơ doanh nghiệp', productService: 'Dịch vụ chăm sóc da', targetCustomer: 'Khách hàng địa phương', industry: 'spa', usp: 'Trao đổi nhu cầu trước khi đặt lịch', logoUrl: '/brand/logo.png', isEmpty: false });
    if (pathname === '/landing-pages/templates') return reply({ items: LANDING_PAGE_SYSTEM_TEMPLATES.map((template: any) => ({ ...template, thumbnailUrl: template.thumbnail, id: template.slug, spec: undefined })) });
    if (pathname === '/landing-pages/generate') {
      if (courseFixture && request.postDataJSON().businessType === 'course') {
        generatedBody = request.postDataJSON(); generated = courseFixture.result; return reply(generated);
      }
      generatedBody = request.postDataJSON(); generated = await service.generateAi(actor, generatedBody); return reply(generated);
    }
    if (pathname === '/landing-pages' && request.method() === 'POST') {
      createBodies.push(request.postDataJSON());
      if (failCreate) { failCreate = false; return reply({ message: 'Fixture: thử lại tạo bản nháp' }, 500); }
      return reply(await service.create(actor, request.postDataJSON()));
    }
    if (pathname === '/landing-pages/crawl-url') return reply({ summary: { schemaVersion: 'landing-page-url-crawl.v1', sourceUrl: 'https://fixture.example/', finalUrl: 'https://fixture.example/', brand: 'Dữ liệu website', title: 'Sản phẩm từ website', productService: 'Phần mềm theo dõi yêu cầu', description: 'Thông tin từ URL', usp: 'Theo dõi tình trạng từng yêu cầu', benefits: ['Nội dung riêng'], cta: 'Trao đổi về phần mềm', imageUrl: null, logoUrl: null, contact: { phone: null, email: null, address: null }, faq: [] } });
    if (pathname === '/landing-pages/fixture-ai-page' && request.method() === 'GET') return reply({ ...stored, draftSpec: stored.draftSpec });
    if (pathname === '/landing-pages/fixture-ai-page/autosave') {
      const body = request.postDataJSON(); autosaves.push(body); stored.draftSpec = sanitizeLandingPageSpec(body.draftSpec); stored.updatedAt = new Date();
      return reply({ ...stored, clientRevision: body.clientRevision, requestId: body.requestId, updatedAt: stored.updatedAt });
    }
    if (pathname === '/landing-pages/fixture-ai-page/preview-token') return reply({ token: 'fixture-token', previewPath: '/p/preview/fixture-token' });
    if (request.method() !== 'GET') return reply({ message: 'Unexpected fixture write' }, 400);
    return reply({ items: [], total: 0, unreadCount: 0, balance: 0, versions: [] });
  });
  const page = await context.newPage(); const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message)); page.setDefaultTimeout(30000);
  const checks: any[] = [];
  async function fillCase(industry: string, product: string) {
    await page.locator('#lp-ai-industry').selectOption(industry);
    await page.locator('#lp-ai-brandName').fill('Thương hiệu riêng');
    await page.locator('#lp-ai-productService').fill(product);
    await page.locator('#lp-ai-targetCustomer').fill('Đội ngũ doanh nghiệp nhỏ');
    await page.locator('#lp-ai-uspBenefits').fill('Theo dõi nhu cầu cụ thể; Chọn phương án sau khi trao đổi đầy đủ');
    await page.locator('#lp-ai-price').fill(''); await page.locator('#lp-ai-offer').fill('');
    await page.locator('details summary').click();
    await page.locator('#lp-ai-brandColor').fill('');
    await page.locator('#lp-ai-extraNotes').fill('Thiết kế thoáng. CTA: NOTES_SENTINEL. Không dùng ghi chú làm ưu đãi.');
  }
  async function audit(name: string) {
    await page.waitForFunction(() => !!document.getElementById('lp-visual-foundation-css'));
    const data = await page.locator('[data-lp-template-preview-shell]').evaluate(shell => {
      const root = shell.querySelector('[data-lp-canvas-root]') as HTMLElement;
      const grids = Array.from(root.querySelectorAll('[data-lp-item-count]')).map(element => ({ count: Number(element.getAttribute('data-lp-item-count')), columns: getComputedStyle(element).gridTemplateColumns.split(' ').length, display: getComputedStyle(element).display, width: element.getBoundingClientRect().width }));
      const h1 = root.querySelector('h1')!.getBoundingClientRect(); const rect = root.getBoundingClientRect();
      const pricing = root.querySelector('[data-lp-pricing-card]') as HTMLElement;
      const color = pricing ? getComputedStyle(pricing).color : '';
      const background = pricing ? getComputedStyle(pricing).backgroundColor : '';
      const buttons = Array.from(root.querySelectorAll('[data-lp-hero-cta] a, [data-lp-header-inner] a, form button[type=submit]')).map(button => ({ text: button.textContent, color: getComputedStyle(button).color }));
      const text = root.innerText;
      return { width: rect.width, scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, h1Inside: h1.left >= rect.left - 1 && h1.right <= rect.right + 1, grids, color, background, text, buttons, viewport: shell.querySelector('[data-lp-viewport]')?.getAttribute('data-lp-viewport') };
    });
    assert.ok(data.scrollWidth <= data.clientWidth + 1, name + ' overflow'); assert.equal(data.h1Inside, true, name + ' headline');
    assert.equal(/Dùng thử miễn phí|Webinar Online — Miễn phí/i.test(data.text), false);
    if (generatedBody.brandColor === '#FACC15') for (const button of data.buttons) assert.equal(button.color, 'rgb(11, 18, 32)', button.text || 'Primary contrast');
    assert.equal(/NOTES_SENTINEL|pain\s*→\s*USP|Ngôn ngữ professional|không bịa/.test(data.text), false);
    for (const grid of data.grids) {
      if (grid.display !== 'grid') continue;
      if (grid.count === 1 || data.viewport === 'mobile') assert.equal(grid.columns, 1, name + ' one/mobile column');
      if ((grid.count === 2 || grid.count === 4) && data.viewport !== 'mobile' && data.width > 640) assert.equal(grid.columns, 2, name + ' two/four balanced columns');
    }
    if (data.background === 'rgb(250, 204, 21)') assert.equal(data.color, 'rgb(11, 18, 32)', 'bright accent requires dark text');
    checks.push({ name, ...data, text: undefined });
    await page.screenshot({ path: `${output}/${name}.png` });
  }
  try {
    await page.goto(`${base}/landing-pages/create`, { waitUntil: 'domcontentloaded' });
    await page.locator('#lp-ai-brandName').waitFor();
    await page.waitForFunction(() => (document.querySelector('#lp-ai-brandName') as HTMLInputElement)?.value === 'Hồ sơ doanh nghiệp');
    await fillCase('saas', 'Phần mềm quản lý công việc');
    await page.locator('#lp-ai-price').fill('199.000 đồng/tháng'); await page.locator('#lp-ai-offer').fill('Tư vấn phạm vi sử dụng trước khi đăng ký');
    await page.locator('#lp-ai-ctaLabel').fill('Đăng ký trao đổi'); await page.locator('#lp-ai-brandColor').fill('#FACC15');
    await page.locator('[data-lp-create-preview-btn]').click(); await page.locator('[data-lp-template-preview-shell]').waitFor();
    assert.equal(stored, null); assert.equal(createBodies.length, 0);
    assert.equal(generatedBody.businessType, 'saas'); assert.equal(generatedBody.offer, 'Tư vấn phạm vi sử dụng trước khi đăng ký'); assert.equal(generatedBody.ctaLabel, 'Đăng ký trao đổi');
    assert.equal(generatedBody.uspBenefits.includes('NOTES_SENTINEL'), false);
    assert.equal(generated.draftSpec.meta.layout, 'saas');
    await page.locator('[data-lp-header-inner] img').waitFor(); assert.equal(generated.source, 'fallback'); assert.ok(generated.warning);
    await audit('saas-desktop');
    for (const viewport of ['Tablet', 'Mobile']) { await page.getByRole('button', { name: viewport, exact: true }).click(); await audit('saas-' + viewport.toLowerCase()); }
    await page.setViewportSize({ width: 320, height: 800 });
    await page.getByRole('button', { name: 'Mobile', exact: true }).click();
    const controls = await page.locator('[data-lp-template-preview-toolbar] button').evaluateAll(buttons => buttons.map(button => ({ label: button.textContent || button.getAttribute('aria-label'), left: button.getBoundingClientRect().left, right: button.getBoundingClientRect().right })));
    for (const control of controls) assert.ok(control.left >= 0 && control.right <= 320, 'Phone preview control must remain reachable: ' + control.label);
    await audit('phone-320');
    await page.getByRole('button', { name: 'Đóng', exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#lp-ai-ctaLabel').fill('Hẹn trao đổi'); assert.equal(await page.locator('[data-lp-create-live-btn]').isDisabled(), true);
    await page.locator('[data-lp-create-preview-btn]').click(); await page.locator('[data-lp-template-preview-shell]').waitFor();
    const confirmed = JSON.parse(JSON.stringify(generated.draftSpec));
    await page.locator('[data-lp-template-preview-toolbar]').getByRole('button', { name: 'Lưu vào Trang của tôi', exact: true }).click();
    await page.locator('[data-lp-template-preview-shell]').getByRole('alert').filter({ hasText: 'Fixture: thử lại' }).waitFor();
    await page.locator('[data-lp-template-preview-toolbar]').getByRole('button', { name: 'Lưu vào Trang của tôi', exact: true }).click();
    await page.locator('[data-lp-template-preview-toolbar]').getByRole('button', { name: 'Mở Trang của tôi', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'Chỉnh sửa trong Builder', exact: true }).click(); await page.waitForURL('**/landing-pages/builder/fixture-ai-page');
    assert.deepEqual(createBodies[0].draftSpec, confirmed); assert.deepEqual(createBodies[1].draftSpec, confirmed); assert.equal(createBodies[0].idempotencyKey, createBodies[1].idempotencyKey);
    assert.deepEqual(JSON.parse(JSON.stringify(stored.draftSpec)), confirmed); assert.equal(stored.status, 'DRAFT'); assert.equal(stored.publishedSpec, null);
    console.log('PASS reviewed inputs, actual preview, no premature create, preview invalidation and exact atomic draft with stable retry');
    await page.locator('[data-lp-canvas-ux="1"] [data-lp-canvas-root]').waitFor();
    const headline = page.locator('[data-lp-canvas-root] h1').first(); await headline.waitFor();
    await headline.dblclick();
    const editable = page.locator('[data-lp-canvas-root] [contenteditable="true"]').first();
    await editable.waitFor(); await editable.fill('Tiêu đề được chỉnh sửa trong Builder'); await editable.press('Tab');
    await page.waitForFunction(() => document.querySelector('[data-lp-canvas-root]')?.textContent?.includes('Tiêu đề được chỉnh sửa trong Builder'));
    await page.waitForTimeout(1200);
    assert.ok(autosaves.length > 0, 'Builder emits autosave for generated draft');
    assert.equal(JSON.stringify(autosaves.at(-1)).includes('Tiêu đề được chỉnh sửa trong Builder'), true);
    await page.screenshot({ path: `${output}/builder-edited.png` });
    console.log('PASS generated structured draft opens in Builder, supports inline edits and autosave');
    const twoPlanPricing = stored.draftSpec.blocks.find((block: any) => block.type === 'Pricing');
    twoPlanPricing.plans.push({ ...structuredClone(twoPlanPricing.plans[0]), id: 'fixture-second-user-plan', name: 'Phương án mở rộng', price: '299.000 đồng/tháng', highlighted: false });
    await page.reload(); await page.locator('[data-lp-pricing-grid]').waitFor({ state: 'attached' });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-lp-pricing-grid]')!).gridTemplateColumns.split(' ').length === 2);
    const columns = await page.locator('[data-lp-pricing-grid]').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(columns, 2); console.log('PASS two user-provided plans render in two columns');

    await page.goto(`${base}/landing-pages/create`, { waitUntil: 'domcontentloaded' }); await page.locator('#lp-ai-brandName').waitFor();
    await fillCase('webinar', 'Hội thảo quản lý công việc');
    await page.locator('#lp-ai-uspBenefits').fill('');
    await page.getByRole('button', { name: 'Sự kiện', exact: true }).click();
    await page.locator('[data-lp-create-preview-btn]').click(); await page.locator('[data-lp-template-preview-shell]').waitFor();
    assert.equal(generated.draftSpec.blocks.some((block: any) => ['Pricing', 'Testimonials', 'Speaker', 'Countdown'].includes(block.type)), false);
    assert.equal(generated.draftSpec.blocks.find((block: any) => block.type === 'Benefits').items.length, 4);
    await audit('webinar-desktop'); await page.getByRole('button', { name: 'Mobile', exact: true }).click(); await audit('webinar-mobile');
    await page.keyboard.press('Escape');
    await page.locator('[data-lp-create-modes] button').filter({ hasText: 'Tạo từ Website/URL' }).click();
    await page.locator('#lp-ai-source-url').fill('https://fixture.example/'); await page.getByRole('button', { name: 'Phân tích URL', exact: true }).click();
    await page.getByRole('button', { name: 'Điền lại thông tin từ website' }).click();
    assert.equal(await page.locator('#lp-ai-uspBenefits').inputValue(), 'Theo dõi tình trạng từng yêu cầu');
    assert.equal(await page.locator('#lp-ai-ctaLabel').inputValue(), 'Trao đổi về phần mềm');
    assert.equal(await page.locator('#lp-ai-offer').inputValue(), '');
    await page.locator('#lp-ai-uspBenefits').fill('Thông tin URL đã được người dùng chỉnh lại');
    await page.locator('[data-lp-create-preview-btn]').click(); await page.locator('[data-lp-template-preview-shell]').waitFor();
    assert.equal(generatedBody.uspBenefits, 'Thông tin URL đã được người dùng chỉnh lại'); assert.equal(generatedBody.sourceReviewed, true);
    assert.equal(generatedBody.extraNotes.includes('CTA: Trao đổi về phần mềm'), false);
    console.log('PASS event-specific architecture and four-benefit grid; URL review preserves edited USP and separate CTA');
    await page.keyboard.press('Escape');
    await page.goto(`${base}/landing-pages/create`, { waitUntil: 'domcontentloaded' }); await page.locator('#lp-ai-brandName').waitFor();
    await fillCase('course', courseFixture?.input.productService || 'Khóa học kinh doanh online');
    if (courseFixture) {
      for (const field of ['brandName', 'targetCustomer', 'painPoint', 'uspBenefits', 'ctaLabel']) await page.locator(`#lp-ai-${field}`).fill(courseFixture.input[field] || '');
    }
    await page.locator('[data-lp-create-preview-btn]').click(); await page.locator('[data-lp-template-preview-shell]').waitFor();
    assert.ok(generated.draftSpec.blocks.some((block: any) => block.type === 'Hero'));
    assert.equal(generated.draftSpec.blocks.some((block: any) => block.type === 'Speaker'), false);
    if (courseFixture) { assert.equal(generated.source, 'ai'); assert.equal(generated.warning, undefined); }
    await audit('course-desktop'); await page.getByRole('button', { name: 'Mobile', exact: true }).click(); await audit('course-mobile');
    console.log('PASS course introduction and actual generated content render on desktop/mobile');
    assert.deepEqual(runtimeErrors, []);
    writeFileSync(`${output}/report.json`, JSON.stringify({ base, checks, createCount: createBodies.length, autosaves: autosaves.length, runtimeErrors, noCustomerWrites: true }, null, 2));
    console.log('AI_CREATE_BROWSER=PASS');
  } catch (error) {
    console.error('PAGE', page.url(), runtimeErrors); await page.screenshot({ path: `${output}/failure.png` }); throw error;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
