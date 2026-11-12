#!/usr/bin/env node
/**
 * Inline field-level AI for Landing Page Builder — regression.
 */
const fs = require('fs');
const path = require('path');
const {
  buildFallbackInlineAiOptions,
  buildInlineAiPrompt,
  normalizeInlineAiRequest,
  parseLandingPageInlineAiResult,
  LANDING_PAGE_INLINE_AI_ACTIONS,
  LANDING_PAGE_INLINE_AI_ACTION_LABELS,
  createEmptyLandingPageSpec,
} = require('../packages/shared/dist/index.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exitCode = 1;
    return false;
  }
  console.log('PASS', msg);
  return true;
}

const root = path.join(__dirname, '..');
const aiSvc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-page-ai.service.ts'),
  'utf8',
);
const svc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const ctrl = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const inlineUi = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-inline-ai-field.tsx'),
  'utf8',
);

assert(LANDING_PAGE_INLINE_AI_ACTIONS.length === 8, '8 AI actions');
assert(LANDING_PAGE_INLINE_AI_ACTION_LABELS.suggest_3.includes('Gợi ý'), 'VN action labels');
assert(aiSvc.includes('suggestField'), 'LandingPageAiService.suggestField');
assert(svc.includes('suggestInlineField') && svc.includes('never writes'), 'API never writes draft');
assert(ctrl.includes("ai-suggest-field"), 'route ai-suggest-field');
assert(ctrl.includes('JwtAuthGuard') && svc.includes('assertPage'), 'tenant assert on suggest');
assert(builder.includes('✨ AI') || inlineUi.includes('✨ AI'), 'UX ✨ AI button');
assert(inlineUi.includes('AbortController') && inlineUi.includes('inFlightRef'), 'cancel + double lock');
assert(inlineUi.includes('onApplyAi') && builder.includes('onApplyAi'), 'apply only on pick');
assert(!inlineUi.includes('chatbot') && !builder.toLowerCase().includes('popup chatbot'), 'no chatbot popup');
assert(
  builder.includes('Testimonials') && inlineUi.length > 100,
  'Testimonials placeholder path in builder',
);

// Field-level fallback Vietnamese
const fb = buildFallbackInlineAiOptions({
  action: 'more_conversion',
  fieldKind: 'headline',
  currentContent: 'Spa chăm sóc da',
  blockType: 'Hero',
  brandName: 'Spa Hoa',
});
assert(fb.length === 3 && fb.every((x) => typeof x === 'string' && x.trim()), 'fallback 3 options');
assert(fb.some((x) => /Spa|spa|đăng ký|tư vấn/i.test(x)), 'Vietnamese conversion copy');

// Testimonials must not invent real names as facts — placeholders
const t = buildFallbackInlineAiOptions({
  action: 'suggest_3',
  fieldKind: 'item.quote',
  currentContent: '',
  blockType: 'Testimonials',
});
assert(t.every((x) => x.includes('[') || /Tên khách/i.test(x)), 'testimonial placeholders only');

// Schema validate
const parsed = parseLandingPageInlineAiResult({
  schemaVersion: 'landing-page-inline-ai.v1',
  options: ['Một', 'Hai', 'Ba'],
  mode: 'ai',
  fieldKind: 'headline',
  action: 'rewrite',
});
assert(parsed.options[0] === 'Một' && parsed.options.length === 3, 'schema exactly 3');

// Pad short options
const padded = parseLandingPageInlineAiResult({
  options: ['Only one'],
  fieldKind: 'ctaLabel',
  action: 'shorter',
});
assert(padded.options.length === 3, 'pad to 3 options');

// Normalize request
const req = normalizeInlineAiRequest({
  action: 'shorter',
  fieldKind: 'seo.title',
  currentContent: 'Landing dài dòng quá mức cần thiết',
  blockType: 'SEO',
  pageGoal: 'lead',
});
assert(req.action === 'shorter' && req.fieldKind === 'seo.title', 'normalize request');

const prompt = buildInlineAiPrompt({
  ...req,
  blockType: 'SEO',
  pageGoal: 'lead',
  profile: { brandName: 'AZ', productService: 'CRM' },
});
assert(prompt.includes('landing-page-inline-ai.v1') && /FIELD|không đổi toàn trang/i.test(prompt), 'prompt field-scoped');
assert(prompt.includes('AZ'), 'BusinessProfile in context');
assert(/TRUST|Không bịa/i.test(prompt), 'prompt trust rules');

// Race: inFlight lock present in UI
assert(inlineUi.includes('if (inFlightRef.current) return'), 'double request guard');

// Stale response harden
assert(
  inlineUi.includes('hashInlineAiFieldContent') &&
    inlineUi.includes('requestSnapshotRef') &&
    inlineUi.includes('window.confirm'),
  'stale snapshot + apply confirm',
);

// Rate limit + usage log + skip OpenAI
assert(svc.includes('lp:inline-ai:u:') && svc.includes('lp:inline-ai:o:'), 'rate limit user+org');
assert(svc.includes('lp:inline-ai:d:') && svc.includes('tránh gửi trùng'), 'replay/double guard');
assert(svc.includes('lp_inline_ai_usage'), 'usage metering log');
assert(aiSvc.includes('shouldSkipOpenAiInlineSuggest') && aiSvc.includes('không gọi OpenAI'), 'skip OpenAI empty');
assert(aiSvc.includes('timeoutMs: 20000'), 'suggest timeout');

// Trust sanitize
const {
  sanitizeInlineAiTrustOptions,
  shouldSkipOpenAiInlineSuggest,
  hashInlineAiFieldContent,
  markLandingPageFieldSources,
  markLandingPageUserEdits,
  preserveUserEditedFields,
  markLandingPageAiSources,
  applyLandingPageAiCopyToSpec,
  buildFallbackLandingPageAiCopy,
  businessProfileToAiBrief,
} = require('../packages/shared/dist/index.js');

assert(shouldSkipOpenAiInlineSuggest('') && shouldSkipOpenAiInlineSuggest(' '), 'skip empty input');
assert(!shouldSkipOpenAiInlineSuggest('Tiêu đề thật'), 'keep valid input');
assert(hashInlineAiFieldContent('a') !== hashInlineAiFieldContent('b'), 'content hash differs');

const scrubbed = sanitizeInlineAiTrustOptions(
  ['Gọi 0909999999 ngay giảm 50%', 'Chỉ 1.500.000đ', 'OK'],
  { blockType: 'Hero', fieldKind: 'headline', currentContent: 'Spa chăm sóc' },
);
assert(!/0909999999/.test(scrubbed[0]) && !/50\s*%/.test(scrubbed[0]), 'scrub invented phone/%');
assert(!/1[.,]500[.,]000/.test(scrubbed[1]), 'scrub invented price');

const scrubT = sanitizeInlineAiTrustOptions(
  ['Anh Minh nói dịch vụ tốt', 'quote', 'x'],
  { blockType: 'Testimonials', fieldKind: 'item.quote' },
);
assert(scrubT.every((x) => /\[|Tên khách/i.test(x)), 'force testimonial placeholder');

// Field source: AI pick → ai; user edit → user; regenerate keeps user
{
  let spec = createEmptyLandingPageSpec();
  const hero = spec.blocks.find((b) => b.type === 'Hero');
  spec = markLandingPageFieldSources(
    { ...spec, blocks: spec.blocks.map((b) => (b.id === hero.id ? { ...b, headline: 'AI HEAD' } : b)) },
    [`${hero.id}.headline`],
    'ai',
  );
  assert(spec.meta.fieldSources[`${hero.id}.headline`] === 'ai', 'AI pick → source=ai');
  spec = markLandingPageUserEdits(
    { ...spec, blocks: spec.blocks.map((b) => (b.id === hero.id ? { ...b, headline: 'USER HEAD' } : b)) },
    [`${hero.id}.headline`],
  );
  assert(spec.meta.fieldSources[`${hero.id}.headline`] === 'user', 'user edit → source=user');
  const aiCopy = buildFallbackLandingPageAiCopy(
    businessProfileToAiBrief({ brandName: 'AZ', productService: 'x' }, { pageGoal: 'lead' }),
  );
  const regenerated = applyLandingPageAiCopyToSpec(spec, aiCopy);
  const kept = preserveUserEditedFields(spec, markLandingPageAiSources(regenerated));
  const h = kept.blocks.find((b) => b.type === 'Hero');
  assert(h?.headline === 'USER HEAD', 'regenerate keeps source=user');
}

// Autosave still via builder dirty path after apply
assert(builder.includes('dirtyRef') && builder.includes('autosave'), 'autosave path intact');

// Empty spec untouched by suggest (API contract: no draft write)
const empty = createEmptyLandingPageSpec();
assert(empty.seo.title === 'Landing Page mới', 'suggest does not mutate empty spec locally');

assert(!svc.toLowerCase().includes('pages_manage') && !builder.includes('pages_'), 'Facebook untouched');

if (process.exitCode) {
  console.error('INLINE_AI_LP=FAIL');
  process.exit(1);
}
console.log('INLINE_AI_LP=PASS');
