import '../apps/api/node_modules/reflect-metadata';
import assert from 'node:assert/strict';
import { normalizeLandingPageBriefSuggestInput, validateLandingPageBriefSuggestions, fallbackLandingPageBriefSuggestions, LANDING_PAGE_BRIEF_SUGGEST_FIELDS } from '../packages/shared/dist';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { LandingPagesService } from '../apps/api/src/landing-pages/landing-pages.service';

const base = { businessType: 'saas', brandName: 'Minh An', productService: 'Phần mềm quản lý công việc', targetCustomer: '', painPoint: '', uspBenefits: '', pageGoal: 'lead' };
async function main() {
  for (const field of LANDING_PAGE_BRIEF_SUGGEST_FIELDS) {
    const input = normalizeLandingPageBriefSuggestInput({ ...base, field, extraNotes: 'CTA: NOTES_SENTINEL', ctaLabel: 'CTA_SENTINEL', offer: '50% không được sử dụng' });
    assert.equal('extraNotes' in input, false); assert.equal('ctaLabel' in input, false); assert.equal('offer' in input, false);
    const options = fallbackLandingPageBriefSuggestions(input); assert.equal(options.length, 3); assert.equal(new Set(options).size, 3);
    assert.deepEqual(validateLandingPageBriefSuggestions({ options }, input), options);
    assert.equal(options.some(option => /SENTINEL|miễn phí|cam kết|chứng nhận|\d+%/.test(option)), false);
  }
  console.log('PASS empty fields get contextual, distinct suggestions without CTA/notes/offer leakage');
  const input = normalizeLandingPageBriefSuggestInput({ ...base, field: 'targetCustomer' });
  assert.throws(() => validateLandingPageBriefSuggestions({ options: ['Khách hàng mới', 'Khách hàng mới', 'Khách hàng mới'] }, input));
  assert.throws(() => validateLandingPageBriefSuggestions({ options: ['Tăng doanh thu 300%', 'Nhóm doanh nghiệp nhỏ', 'Nhóm vận hành sản phẩm'] }, input));
  assert.throws(() => validateLandingPageBriefSuggestions({ options: ['Đảm bảo doanh thu cao', 'Nhóm doanh nghiệp nhỏ', 'Nhóm vận hành sản phẩm'] }, input));
  assert.throws(() => validateLandingPageBriefSuggestions({ options: ['Tích hợp công cụ quản lý và tiết kiệm thời gian.', 'Phần mềm dành cho doanh nghiệp.', 'Quản lý công việc cho các shop.'] }, { ...input, field: 'uspBenefits' }));
  let calls = 0;
  const options = ['Chủ doanh nghiệp nhỏ cần quản lý công việc theo nhóm.', 'Đội ngũ vận hành muốn tìm hiểu phần mềm quản lý công việc.', 'Nhóm kinh doanh cần theo dõi các đầu việc đang xử lý.'];
  let prompt = '';
  const ai = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async (request: any) => { calls++; prompt = JSON.stringify(request.messages); return JSON.stringify({ options }); } } as any);
  const result = await ai.suggestBriefField(input); assert.equal(result.source, 'ai'); assert.deepEqual(result.options, options); assert.equal(calls, 1);
  assert.equal(prompt.includes('Phần mềm quản lý công việc'), true);
  const bad = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => '{"options":["Miễn phí trọn đời","Tăng 300%","Cam kết thành công"]}' } as any);
  const fallback = await bad.suggestBriefField(input); assert.equal(fallback.source, 'fallback'); assert.ok(fallback.warning); assert.deepEqual(fallback.options, fallbackLandingPageBriefSuggestions(input));
  const absent = await new LandingPageAiService({ isConfigured: () => false } as any).suggestBriefField(input); assert.equal(absent.source, 'fallback');
  let repairs = 0;
  const repaired = await new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => ++repairs === 1 ? '{"options":[]}' : JSON.stringify({ options }) } as any).suggestBriefField(input);
  assert.equal(repaired.source, 'ai'); assert.equal(repairs, 2);
  console.log('PASS real AI path, schema validation and honest fallback without fabricated facts');

  const prisma = new Proxy({}, { get() { throw Error('Suggestions must not access customer page data'); } });
  const actor: any = { id: 'fixture-user', organizationId: 'fixture-org' };
  const service = new LandingPagesService(prisma as any, { assertWithinLimit: () => {} } as any, {} as any, {} as any, ai, {} as any);
  calls = 0;
  const dto: any = { ...input, idempotencyKey: 'fixture-repeat' };
  const [first, second] = await Promise.all([service.suggestAiBrief(actor, dto), service.suggestAiBrief(actor, dto)]);
  assert.equal(calls, 1); assert.deepEqual(first, second);
  await service.suggestAiBrief({ ...actor, organizationId: 'another-org' }, dto); assert.equal(calls, 2);
  await assert.rejects(service.suggestAiBrief(actor, { ...dto, productService: '', businessType: '' }), /Nhập ngành/);
  await assert.rejects(service.suggestAiBrief(actor, { ...dto, field: 'price' }));
  assert.equal(calls, 2);
  console.log('PASS no page reads/writes, double-submit dedupe, tenant separation and empty-context guard');

  const cache = new Map<string, string>();
  const redis: any = { status: 'ready', get: async (key: string) => cache.get(key) || null,
    set: async (key: string, value: string, _mode: string, _ttl: number, nx?: string) => { if (nx && cache.has(key)) return null; cache.set(key, value); return 'OK'; },
    eval: async (_script: string, _count: number, key: string, token: string) => { if (cache.get(key) === token) cache.delete(key); return 1; } };
  const worker = () => new LandingPagesService(prisma as any, { assertWithinLimit: () => {} } as any, {} as any, {} as any, ai, {} as any, redis);
  calls = 0;
  await Promise.all([worker().suggestAiBrief(actor, dto), worker().suggestAiBrief(actor, dto)]);
  assert.equal(calls, 1);
  console.log('PASS shared Redis dedupe across API workers');
  console.log('BRIEF_SUGGEST_REGRESSION=PASS');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
