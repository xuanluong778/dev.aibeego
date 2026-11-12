#!/usr/bin/env node
/**
 * Context isolation + validation checks for landing-page inline AI.
 * Run: node scripts/test-landing-page-inline-ai-context.cjs
 * (requires packages/shared build)
 */
const path = require('path');
const shared = require(path.join(__dirname, '../packages/shared/dist'));

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log('OK:', msg);
}

const processBlock = {
  id: 'proc1',
  type: 'Process',
  enabled: true,
  headline: 'Quy trình hợp tác',
  subheadline: '3 bước rõ ràng',
  items: [
    {
      id: 'step-discover',
      title: 'Discover',
      description: 'Lắng nghe mục tiêu và audit hiện trạng.',
    },
    {
      id: 'step-execute',
      title: 'Execute',
      description: 'Triển khai chiến dịch và tối ưu hàng tuần.',
    },
  ],
};

const pricingBlock = {
  id: 'price1',
  type: 'Pricing',
  enabled: true,
  headline: 'Bảng giá',
  plans: [{ id: 'p1', name: 'Pro', price: '15.000.000đ', ctaLabel: 'Chọn Pro' }],
};

// --- Context scoped to Execute card only ---
const ctx = shared.buildLandingPageInlineAiContext({
  block: processBlock,
  field: 'itemDesc:step-execute',
  pageMeta: { category: 'agency', aiPageGoal: 'lead', tone: 'professional' },
});
assert(ctx, 'context built for Execute description');
assert(ctx.cardTitle === 'Execute', 'card title is Execute');
assert(/triển khai/i.test(ctx.currentContent), 'current content from Execute card');
assert(!/15\.000\.000|Bảng giá|Chọn Pro/.test(JSON.stringify(ctx)), 'no pricing section leaked into context object');
assert(!ctx.cardFields || !/Discover/.test(JSON.stringify(ctx.cardFields)), 'sibling Discover card not in cardFields');

const serialized = shared.serializeInlineAiContextForApi(ctx);
assert(serialized.includes('CARD_TITLE=Execute'), 'serialized has Execute title');
assert(serialized.includes('DO_NOT_USE_OTHER_SECTIONS=1'), 'serialized has scope flag');
assert(!serialized.includes('15.000'), 'serialized has no price from other section');
assert(!/Discover/.test(serialized), 'serialized does not include sibling step Discover');
// Explicit: Process description context must not be built from Pricing block
const wrong = shared.buildLandingPageInlineAiContext({
  block: pricingBlock,
  field: 'itemDesc:step-execute',
});
assert(!wrong || !wrong.currentContent, 'pricing block has no Execute itemDesc');

// Pricing context stays on pricing block only
const priceCtx = shared.buildLandingPageInlineAiContext({
  block: pricingBlock,
  field: 'planPrice:p1',
});
assert(priceCtx && priceCtx.currentContent.includes('15.000'), 'plan price context reads own price');
assert(priceCtx.sectionType === 'Pricing', 'plan price section type Pricing');

// Missing topic → clarify
const empty = shared.buildLandingPageInlineAiContext({
  block: { id: 'x', type: 'Hero', enabled: true, headline: '', items: [] },
  field: 'body',
  pageMeta: {},
});
assert(empty, 'empty hero body context');
const q = shared.detectInlineAiMissingTopic(empty, false);
assert(typeof q === 'string' && q.length > 10, 'asks one clarify question when topic missing');
assert(shared.detectInlineAiMissingTopic(empty, true) == null, 'skip clarify when business profile has product');

// Validation: novel price scrubbed / duplicates
const validated = shared.validateInlineAiOptions(
  [
    'Triển khai campaign và báo cáo tuần',
    'Tối ưu media + báo cáo rõ',
    'Triển khai campaign và báo cáo tuần',
  ],
  {
    action: 'suggest_3',
    fieldKind: 'item.description',
    currentContent: processBlock.items[1].description,
    blockContext: serialized,
    cardTitle: 'Execute',
  },
);
assert(validated && validated.options.length === 3, 'validate returns 3 options');
assert(validated.warnings.includes('dropped_duplicate'), 'flags duplicate option');

const withPrice = shared.validateInlineAiOptions(
  ['Gói chỉ 9.999.000đ', 'Triển khai đúng tiến độ', 'Báo cáo KPI tuần'],
  {
    action: 'suggest_3',
    fieldKind: 'item.description',
    currentContent: 'Triển khai chiến dịch',
    blockContext: serialized,
    cardTitle: 'Execute',
  },
);
assert(withPrice, 'validate accepts options with novel price after scrub');
assert(
  !/9\.999\.000/.test(withPrice.options.join(' ')) || withPrice.warnings.includes('novel_facts_scrubbed'),
  'novel price scrubbed or flagged',
);

// Stale hash changes when content edits mid-flight
const h1 = shared.hashInlineAiFieldContent('abc');
const h2 = shared.hashInlineAiFieldContent('abc ');
const h3 = shared.hashInlineAiFieldContent('abcd');
assert(h1 !== h3, 'hash changes when user edits content');
assert(h1 !== h2 || h1 === shared.hashInlineAiFieldContent('abc'), 'hash stable for same content');

console.log('\nAll landing-page inline AI context checks passed.');
