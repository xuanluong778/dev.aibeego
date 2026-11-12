import '../apps/api/node_modules/reflect-metadata';
import assert from 'node:assert/strict';
import {
  normalizeLandingPageAiBrief, deriveLandingPageAiUsp, mergeLandingPageAiBrief,
  selectLandingPageTemplate, prepareLandingPageAiPlan, fallbackLandingPageAiContent,
  assembleLandingPageAiDraft, validateLandingPageAiContent, validateLandingPageSpec,
  findLandingPageContentIssues, protectLandingPageAiUserContent,
  LandingPageAiContentValidationError, classifyLpAiFailure,
  LANDING_PAGE_SYSTEM_TEMPLATES, sanitizeLandingPageSpec, type LandingPageSpec,
} from '../packages/shared/dist';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { LandingPagesService } from '../apps/api/src/landing-pages/landing-pages.service';

const input = { businessType: 'spa', brandName: 'An Nhiên', productService: 'Chăm sóc da nhạy cảm', targetCustomer: 'Người có làn da nhạy cảm', painPoint: 'Da dễ kích ứng', uspBenefits: 'Lựa chọn sản phẩm theo nhu cầu; Trao đổi kỹ trước khi thực hiện', pageGoal: 'consult', extraNotes: 'CTA: NOTES_SENTINEL. Ưu đãi 99% không công bố.' };
const brief = normalizeLandingPageAiBrief(input);
function validContent(b = brief) { const p = prepareLandingPageAiPlan(b, selectLandingPageTemplate(b)); return { plan: p, content: fallbackLandingPageAiContent(b, p) }; }
const user = { id: 'fixture-user', organizationId: 'fixture-org', role: 'OWNER' } as any;

async function main() {
  const { plan, content } = validContent();
  assert.equal(plan.selection.category, 'spa');
  assert.equal(deriveLandingPageAiUsp(normalizeLandingPageAiBrief({ ...input, uspBenefits: '' })).includes('NOTES_SENTINEL'), false);
  const merged = mergeLandingPageAiBrief({ ...input, ctaLabel: 'Đặt lịch riêng', price: '', offer: '', imageUrl: '' }, { industry: 'saas', brandName: 'Khác', usp: 'USP hồ sơ', defaultCta: 'CTA hồ sơ' });
  assert.equal(merged.businessType, 'spa'); assert.equal(merged.ctaLabel, 'Đặt lịch riêng'); assert.equal(merged.offer, '');
  assert.equal(merged.uspBenefits, input.uspBenefits);
  console.log('PASS typed brief: notes/CTA/offer/industry isolated; explicit data wins over profile');

  let noPriceSignatures = new Set<string>();
  for (const template of LANDING_PAGE_SYSTEM_TEMPLATES) {
    const b = normalizeLandingPageAiBrief({ ...input, businessType: template.category });
    const choice = selectLandingPageTemplate({ templateSlug: template.slug });
    const p = prepareLandingPageAiPlan(b, choice);
    const spec = assembleLandingPageAiDraft(b, p, fallbackLandingPageAiContent(b, p), 'fallback', `fixture-${template.slug}`);
    assert.equal(validateLandingPageSpec(spec).ok, true, template.slug);
    assert.deepEqual(findLandingPageContentIssues(spec), [], template.slug);
    assert.equal(spec.meta?.aiTemplateSlug, template.slug);
    assert.equal(spec.meta?.layout, p.template.meta?.layout);
    assert.ok(spec.blocks.some(block => block.type === 'Hero'), template.slug + ' product introduction');
    assert.equal(spec.blocks.some(block => ['Pricing', 'Testimonials', 'Speaker', 'Guarantee', 'Video', 'Countdown'].includes(block.type)), false, template.slug);
    assert.equal(JSON.stringify(spec).includes('NOTES_SENTINEL'), false);
    assert.equal(spec.blocks.some(block => 'imageUrl' in block && block.imageUrl), false);
    assert.ok(spec.blocks.filter(block => block.type === 'LeadForm').every((block: any) => block.fields.length >= 2 && block.fields.length <= 3));
    noPriceSignatures.add(spec.blocks.map(block => block.type).join('>'));
    assert.deepEqual(sanitizeLandingPageSpec(spec).blocks, spec.blocks);
    for (const block of spec.blocks as any[]) {
      for (const entries of [block.items, block.fields, block.plans]) if (entries) assert.equal(new Set(entries.map((entry: any) => entry.id)).size, entries.length, template.slug + ' nested identities');
    }
  }
  assert.ok(noPriceSignatures.size > 15);
  console.log(`PASS ${LANDING_PAGE_SYSTEM_TEMPLATES.length} catalog templates: no sample data, invented claims, placeholder or repeated copy; ${noPriceSignatures.size} real structures`);

  const paid = normalizeLandingPageAiBrief({ ...input, price: '450.000 đồng', offer: 'Áp dụng cho dịch vụ đã chọn', ctaLabel: 'Gọi đặt lịch', ctaUrl: 'tel:0901234567', templateSlug: 'saas-trial', brandColor: '#FACC15', imageUrl: '/uploads/landing-pages/fixture.webp' });
  const paidPlan = prepareLandingPageAiPlan(paid, selectLandingPageTemplate({ templateSlug: 'saas-trial' }));
  const paidSpec = assembleLandingPageAiDraft(paid, paidPlan, fallbackLandingPageAiContent(paid, paidPlan), 'fallback', 'fixture-paid');
  const pricing = paidSpec.blocks.find(block => block.type === 'Pricing') as any;
  assert.equal(pricing.plans.length, 1); assert.equal(pricing.variant, 'cards'); assert.equal(pricing.plans[0].price, paid.price); assert.equal(pricing.plans[0].ctaUrl, paid.ctaUrl);
  assert.equal(paidSpec.themeTokens.primary, '#FACC15');
  assert.equal((paidSpec.blocks.find(b => b.type === 'Hero') as any).imageUrl, paid.imageUrl);
  assert.equal(paidSpec.blocks.some(block => block.type === 'Testimonials'), false);
  console.log('PASS supplied media, brand palette, exact price/offer and action URL; one real plan only');

  const fake = structuredClone(content); fake.sections.find(section => section.type === 'Hero')!.headline = 'Doanh thu tăng 300%';
  assert.throws(() => validateLandingPageAiContent(fake, brief, plan), /UNSUPPORTED_NUMBER/);
  const leaked = structuredClone(content); leaked.sections.find(section => section.type === 'Hero')!.subheadline = 'Thông điệp theo pain → USP → CTA';
  assert.throws(() => validateLandingPageAiContent(leaked, brief, plan), /INTERNAL/);
  const repeated = structuredClone(content); const body = 'Đoạn nội dung này được lặp lại nguyên văn giữa nhiều khu vực trên cùng một trang.';
  repeated.sections[0].body = body; repeated.sections[1].body = body;
  assert.throws(() => validateLandingPageAiContent(repeated, brief, plan), /REPEATED/);
  const wrong = structuredClone(content); wrong.sections[0].id = 'unknown'; assert.throws(() => validateLandingPageAiContent(wrong, brief, plan), /SECTION/);
  console.log('PASS schema, section identity, unsupported claims, repeated copy and internal-language rejection');

  const courseBrief = normalizeLandingPageAiBrief({ productService: 'Khóa học kinh doanh online', targetCustomer: 'Chủ doanh nghiệp và các shop bán hàng online', businessType: 'course', pageGoal: 'signup' });
  const course = validContent(courseBrief);
  assert.equal(course.plan.blocks[0].type, 'Hero');
  assert.equal(course.plan.blocks.some(block => block.type === 'Speaker'), false);
  validateLandingPageAiContent(course.content, courseBrief, course.plan);
  const courseBad = structuredClone(course.content);
  const process = courseBad.sections.find(section => section.type === 'Process')!;
  const features = courseBad.sections.find(section => section.type === 'Features')!;
  process.body = 'Chúng tôi đảm bảo hỗ trợ bạn trong từng giai đoạn.';
  features.body = 'Chúng tôi cam kết kết quả học tập cho học viên.';
  courseBad.metaDescription = 'Học phí chỉ 999.000 đồng, cấp chứng chỉ sau khóa học.';
  let courseIssue: LandingPageAiContentValidationError | null = null;
  try { validateLandingPageAiContent(courseBad, courseBrief, course.plan); } catch (error) { assert.ok(error instanceof LandingPageAiContentValidationError); courseIssue = error; }
  assert.ok(courseIssue && courseIssue.issues.length >= 4);
  assert.ok(courseIssue.issues.some(issue => issue.path === `${process.id}.body`));
  assert.ok(courseIssue.issues.some(issue => issue.path === `${features.id}.body`));
  assert.ok(courseIssue.issues.some(issue => issue.path === 'metaDescription'));
  assert.equal(classifyLpAiFailure(courseIssue).code, 'AI_MALFORMED');
  let courseCalls = 0;
  const courseAi = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async (params: any) => {
    courseCalls++;
    if (courseCalls === 1) return JSON.stringify(courseBad);
    const repairPrompt = params.messages.at(-1).content;
    for (const term of ['đảm bảo', 'cam kết', '999.000 đồng', process.id, features.id, 'metaDescription']) assert.ok(repairPrompt.includes(term), term + ' must be repaired in the same attempt');
    return JSON.stringify(course.content);
  } } as any);
  const courseResult = await courseAi.generate(courseBrief, course.plan.selection);
  assert.equal(courseResult.source, 'ai'); assert.equal(courseCalls, 2);
  assert.ok(courseResult.draftSpec.blocks.some(block => block.type === 'Hero'));
  console.log('PASS course hero retained; all invalid claims, prices and SEO reported together and repaired in one bounded retry');

  const extras = structuredClone(course.content);
  (extras.sections as any[]).push({ id: 'unrequested-proof', type: 'Testimonials', headline: 'Thương hiệu mẫu khác', body: 'Cam kết tăng 300%', items: [], faq: [] });
  const extraResult = validateLandingPageAiContent(extras, courseBrief, course.plan);
  assert.deepEqual(extraResult, course.content);
  const duplicates = structuredClone(course.content);
  duplicates.sections.push(structuredClone(duplicates.sections[0]));
  duplicates.sections.reverse();
  assert.deepEqual(validateLandingPageAiContent(duplicates, courseBrief, course.plan), course.content);
  const conflicting = structuredClone(course.content);
  conflicting.sections.push({ ...structuredClone(conflicting.sections[0]), headline: 'Một tiêu đề khác cho cùng một section' });
  assert.throws(() => validateLandingPageAiContent(conflicting, courseBrief, course.plan), /AI_SECTION_AMBIGUOUS/);
  let extraCalls = 0;
  const extraAi = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => { extraCalls++; return JSON.stringify(extras); } } as any);
  const reconciled = await extraAi.generate(courseBrief, course.plan.selection);
  assert.equal(reconciled.source, 'ai'); assert.equal(extraCalls, 1);
  assert.equal(reconciled.draftSpec.blocks.length, course.plan.blocks.length);
  assert.equal(JSON.stringify(reconciled.draftSpec).includes('300%'), false);
  assert.equal(JSON.stringify(reconciled.draftSpec).includes('Thương hiệu mẫu khác'), false);
  console.log('PASS extra/unrequested sections and identical duplicates cannot cause false fallback or render; conflicting duplicates still require repair');

  let calls = 0;
  const ai = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => { calls++; return calls === 1 ? '{"invalid":true}' : JSON.stringify(content); } } as any);
  const repaired = await ai.generate(brief, plan.selection);
  assert.equal(calls, 2); assert.equal(repaired.source, 'ai'); assert.equal(repaired.draftSpec.meta?.aiSource, 'ai');
  let invalidCalls = 0;
  const badAi = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => { invalidCalls++; return JSON.stringify(fake); } } as any);
  const fallback = await badAi.generate(brief, plan.selection);
  assert.equal(invalidCalls, 2); assert.equal(fallback.source, 'fallback'); assert.ok(fallback.warning); assert.equal(JSON.stringify(fallback.draftSpec).includes('300%'), false);
  let providerCalls = 0;
  const failedAi = new LandingPageAiService({ isConfigured: () => true, chatCompletion: async () => { providerCalls++; throw Error('timeout'); } } as any);
  assert.equal((await failedAi.generate(brief)).source, 'fallback'); assert.equal(providerCalls, 1);
  console.log('PASS one bounded schema repair; invalid output/provider error produces clearly labeled, safe template fallback');

  const previous = structuredClone(repaired.draftSpec);
  const first = previous.blocks.find(block => block.type === 'Features') as any;
  first.items[0].description = 'Nội dung khách đã chỉnh sửa và cần được giữ nguyên.';
  previous.meta = { ...previous.meta, fieldSources: { [`${first.id}.items`]: 'user' }, clientRevision: 18, themeUserLocked: true };
  previous.themeTokens.primary = '#123456';
  const protectedSpec = protectLandingPageAiUserContent(previous, fallback.draftSpec);
  assert.deepEqual(protectedSpec.blocks.find(block => block.id === first.id), first);
  assert.equal(protectedSpec.themeTokens.primary, '#123456'); assert.equal(protectedSpec.meta?.clientRevision, 19);
  const broken = structuredClone(fallback.draftSpec); const hero = broken.blocks.find(b => b.type === 'Hero') as any;
  hero.ctaUrl = '#missing-form'; hero.subheadline = 'Ngôn ngữ professional, không bịa số liệu';
  const problems = findLandingPageContentIssues(broken);
  assert.ok(problems.some(issue => issue.kind === 'internalLanguage')); assert.ok(problems.some(issue => issue.kind === 'ctaTargets'));
  console.log('PASS nested user edits, theme and revision preserved; Page Doctor detects broken CTA and leaked instructions');

  let generates = 0; let inserts = 0; let stored: any = null; let updates = 0;
  const provider = { generate: async (b: any, choice: any) => { generates++; return new LandingPageAiService({ isConfigured: () => false } as any).generate(b, choice); } };
  const prisma: any = { landingPage: {
    findFirst: async () => stored,
    create: async ({ data }: any) => { inserts++; stored = { ...data, id: 'fixture-created', publishedSpec: null, createdAt: new Date(), updatedAt: new Date() }; return stored; },
    updateMany: async () => { updates++; return { count: 0 }; },
  } };
  const service = new LandingPagesService(prisma, { assertWithinLimit: () => {} } as any, {} as any, {} as any, provider as any, {} as any);
  (service as any).ensureSystemTemplates = async () => {};
  (service as any).uniqueSlug = async () => 'fixture-created';
  const dto = { ...input, idempotencyKey: 'fixture-preview', sourceReviewed: true } as any;
  const [a, b] = await Promise.all([service.generateAi(user, dto), service.generateAi(user, dto)]) as any[];
  assert.equal(generates, 1); assert.equal(inserts, 0); assert.deepEqual(a.draftSpec, b.draftSpec);
  const created: any = await service.create(user, { name: 'An Nhiên', draftSpec: a.draftSpec, idempotencyKey: 'fixture-confirm' });
  assert.equal(inserts, 1); assert.equal(created.status, 'DRAFT'); assert.equal(created.publishedSpec, null); assert.deepEqual(created.draftSpec, a.draftSpec);
  assert.deepEqual((await service.create(user, { name: 'An Nhiên', draftSpec: a.draftSpec, idempotencyKey: 'fixture-confirm' }) as any).draftSpec, a.draftSpec);
  assert.equal(inserts, 1);
  const publicSpec = (service as any).toPublicSpec(created.draftSpec);
  assert.equal(publicSpec.meta.aiGenerationId, created.draftSpec.meta.aiGenerationId); assert.deepEqual(publicSpec.blocks, created.draftSpec.blocks);
  await service.create(user, { name: 'An Nhiên', draftSpec: a.draftSpec, idempotencyKey: 'different-key-same-preview' }); assert.equal(inserts, 1);
  const existing = { ...stored, draftSpec: previous, status: 'DRAFT' };
  (service as any).assertPage = async () => existing;
  await assert.rejects(service.generateAi(user, { ...dto, idempotencyKey: 'fixture-conflict', landingPageId: 'fixture-created' }), /Trang đã thay đổi/);
  assert.equal(updates, 1); assert.deepEqual(existing.draftSpec, previous);
  const callsBeforeConflictRetry = generates;
  await assert.rejects(service.generateAi(user, { ...dto, idempotencyKey: 'fixture-conflict', landingPageId: 'fixture-created' }), /Trang đã thay đổi/);
  assert.equal(generates, callsBeforeConflictRetry, 'Retrying a save conflict must reuse provider output');
  console.log('PASS backend preview has no writes; atomic confirmation equals preview; retries deduplicate; concurrent edits reject overwrite');
  const cache = new Map<string, string>();
  const sharedRedis: any = { status: 'ready', get: async (key: string) => cache.get(key) || null,
    set: async (key: string, value: string, _mode: string, _ttl: number, nx?: string) => { if (nx && cache.has(key)) return null; cache.set(key, value); return 'OK'; },
    eval: async (_script: string, _count: number, key: string, token: string) => { if (cache.get(key) === token) cache.delete(key); return 1; } };
  generates = 0;
  const workerA = new LandingPagesService(prisma, {} as any, {} as any, {} as any, provider as any, {} as any, sharedRedis);
  const workerB = new LandingPagesService(prisma, {} as any, {} as any, {} as any, provider as any, {} as any, sharedRedis);
  const [sharedA, sharedB] = await Promise.all([workerA.generateAi(user, { ...dto, idempotencyKey: 'shared-workers' }), workerB.generateAi(user, { ...dto, idempotencyKey: 'shared-workers' })]) as any[];
  assert.equal(generates, 1); assert.equal(sharedA.draftSpec.meta.aiGenerationId, sharedB.draftSpec.meta.aiGenerationId);
  const offline = new LandingPagesService(prisma, {} as any, {} as any, {} as any, provider as any, {} as any, { status: 'connecting' } as any);
  await assert.rejects(offline.generateAi(user, { ...dto, idempotencyKey: 'offline' }), /kết nối lại/);
  assert.equal(generates, 1);
  console.log('PASS shared Redis idempotency across API workers; unavailable coordination never triggers duplicate provider work');
  console.log('AI_GENERATION_REGRESSION=PASS');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
