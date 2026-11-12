/**
 * Structured context for landing-page field AI.
 * Scoped to the selected field + its card/section only — never sibling sections.
 * Website copy is DATA for the model, not instructions.
 */

import type { LandingPageBlock } from './landing-page-types';
import type { LandingPageInlineAiFieldKind } from './landing-page-inline-ai';

export type LandingPageInlineAiPageMeta = {
  category?: string | null;
  conversionGoal?: string | null;
  pageGoal?: string | null;
  tone?: string | null;
  /** User answer to a prior clarify question — stored on the page. */
  aiTopicHint?: string | null;
};

export type LandingPageInlineAiStructuredContext = {
  fieldKind: LandingPageInlineAiFieldKind;
  fieldRole: string;
  currentContent: string;
  sectionType: string;
  sectionHeadline?: string;
  sectionSubheadline?: string;
  /** Title of the card/step that owns the selected field (same item only). */
  cardTitle?: string;
  /** Other text fields on the SAME card/item — never other cards or sections. */
  cardFields?: Record<string, string>;
  pageCategory?: string;
  pageGoal?: string;
  tone?: string;
  topicHint?: string;
};

type FieldMapRow = {
  re: RegExp;
  kind: LandingPageInlineAiFieldKind;
  role: string;
  entity?: 'item' | 'plan' | 'trust' | 'field';
};

const FIELD_KIND_BY_PREFIX: FieldMapRow[] = [
  { re: /^headline$/, kind: 'headline', role: 'Tiêu đề section' },
  { re: /^subheadline$/, kind: 'subheadline', role: 'Phụ đề section' },
  { re: /^body$/, kind: 'body', role: 'Đoạn mô tả section' },
  { re: /^ctaLabel$/, kind: 'ctaLabel', role: 'Nhãn nút CTA' },
  { re: /^planName:(.+)$/, kind: 'item.title', role: 'Tên gói giá', entity: 'plan' },
  { re: /^planPrice:(.+)$/, kind: 'plan.feature', role: 'Giá gói', entity: 'plan' },
  { re: /^planCta:(.+)$/, kind: 'ctaLabel', role: 'CTA gói giá', entity: 'plan' },
  { re: /^itemTitle:(.+)$/, kind: 'item.title', role: 'Tiêu đề card/bước', entity: 'item' },
  { re: /^itemDesc:(.+)$/, kind: 'item.description', role: 'Mô tả card/bước', entity: 'item' },
  { re: /^itemQuestion:(.+)$/, kind: 'item.question', role: 'Câu hỏi FAQ', entity: 'item' },
  { re: /^itemAnswer:(.+)$/, kind: 'item.answer', role: 'Trả lời FAQ', entity: 'item' },
  { re: /^itemQuote:(.+)$/, kind: 'item.quote', role: 'Trích dẫn testimonial', entity: 'item' },
  { re: /^itemAuthor:(.+)$/, kind: 'item.author', role: 'Tên tác giả testimonial', entity: 'item' },
  { re: /^fieldLabel:(.+)$/, kind: 'field.label', role: 'Nhãn trường form', entity: 'field' },
  { re: /^trustPoint:(\d+)$/, kind: 'body', role: 'Điểm tin cậy', entity: 'trust' },
];

export function mapInspectorFieldToInlineAiKind(
  field: string,
): { fieldKind: LandingPageInlineAiFieldKind; role: string; itemId?: string; planId?: string; trustIndex?: number } | null {
  const f = String(field || '').trim();
  if (!f) return null;
  for (const row of FIELD_KIND_BY_PREFIX) {
    const m = row.re.exec(f);
    if (!m) continue;
    if (row.entity === 'item' || row.entity === 'field') {
      return { fieldKind: row.kind, role: row.role, itemId: m[1] };
    }
    if (row.entity === 'plan') {
      return { fieldKind: row.kind, role: row.role, planId: m[1] };
    }
    if (row.entity === 'trust') {
      return { fieldKind: row.kind, role: row.role, trustIndex: Number(m[1]) };
    }
    return { fieldKind: row.kind, role: row.role };
  }
  // Unknown custom string field on block
  if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f)) {
    return { fieldKind: 'body', role: `Trường ${f}` };
  }
  return null;
}

function clip(s: string, n: number): string {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function readItem(
  block: LandingPageBlock,
  itemId: string,
): Record<string, unknown> | null {
  const items = (block as { items?: Array<Record<string, unknown>> }).items;
  if (!Array.isArray(items)) return null;
  return items.find((it) => String(it.id) === itemId) || null;
}

function readPlan(
  block: LandingPageBlock,
  planId: string,
): Record<string, unknown> | null {
  const plans = (block as { plans?: Array<Record<string, unknown>> }).plans;
  if (!Array.isArray(plans)) return null;
  return plans.find((it) => String(it.id) === planId) || null;
}

/**
 * Build scoped AI context for the selected inspector field.
 * Never includes content from other blocks/sections.
 */
export function buildLandingPageInlineAiContext(input: {
  block: LandingPageBlock;
  field: string;
  pageMeta?: LandingPageInlineAiPageMeta | null;
}): LandingPageInlineAiStructuredContext | null {
  const mapped = mapInspectorFieldToInlineAiKind(input.field);
  if (!mapped) return null;

  const block = input.block;
  const rec = block as unknown as Record<string, unknown>;
  const sectionHeadline = clip(typeof rec.headline === 'string' ? rec.headline : '', 160);
  const sectionSubheadline = clip(
    typeof rec.subheadline === 'string' ? rec.subheadline : '',
    200,
  );

  let currentContent = '';
  let cardTitle: string | undefined;
  const cardFields: Record<string, string> = {};

  if (mapped.itemId) {
    const row = readItem(block, mapped.itemId);
    if (row) {
      const title = clip(typeof row.title === 'string' ? row.title : '', 120);
      const description = clip(typeof row.description === 'string' ? row.description : '', 400);
      const question = clip(typeof row.question === 'string' ? row.question : '', 200);
      const answer = clip(typeof row.answer === 'string' ? row.answer : '', 400);
      const quote = clip(typeof row.quote === 'string' ? row.quote : '', 400);
      const author = clip(typeof row.author === 'string' ? row.author : '', 80);
      const role = clip(typeof row.role === 'string' ? row.role : '', 80);
      cardTitle = title || question || undefined;
      if (title) cardFields.title = title;
      if (description) cardFields.description = description;
      if (question) cardFields.question = question;
      if (answer) cardFields.answer = answer;
      if (quote) cardFields.quote = quote;
      if (author) cardFields.author = author;
      if (role) cardFields.role = role;
      if (mapped.fieldKind === 'item.title') currentContent = title;
      else if (mapped.fieldKind === 'item.description') currentContent = description;
      else if (mapped.fieldKind === 'item.question') currentContent = question;
      else if (mapped.fieldKind === 'item.answer') currentContent = answer;
      else if (mapped.fieldKind === 'item.quote') currentContent = quote;
      else if (mapped.fieldKind === 'item.author') currentContent = author;
      else if (mapped.fieldKind === 'item.role') currentContent = role;
    }
  } else if (mapped.planId) {
    const row = readPlan(block, mapped.planId);
    if (row) {
      const name = clip(typeof row.name === 'string' ? row.name : '', 120);
      const price = clip(typeof row.price === 'string' ? row.price : '', 80);
      const cta = clip(typeof row.ctaLabel === 'string' ? row.ctaLabel : '', 80);
      cardTitle = name || undefined;
      if (name) cardFields.name = name;
      // Only include price when editing that plan — still same card, not other sections.
      if (price) cardFields.price = price;
      if (cta) cardFields.ctaLabel = cta;
      if (input.field.startsWith('planName:')) currentContent = name;
      else if (input.field.startsWith('planPrice:')) currentContent = price;
      else if (input.field.startsWith('planCta:')) currentContent = cta;
    }
  } else if (mapped.trustIndex != null) {
    const arr = Array.isArray(rec.trustPoints) ? (rec.trustPoints as string[]) : [];
    currentContent = clip(arr[mapped.trustIndex] || '', 200);
  } else {
    const key = mapped.fieldKind === 'ctaLabel' ? 'ctaLabel' : mapped.fieldKind;
    currentContent = clip(typeof rec[key] === 'string' ? String(rec[key]) : '', 800);
  }

  const pageGoal =
    clip(input.pageMeta?.pageGoal || input.pageMeta?.conversionGoal || '', 40) || undefined;
  const pageCategory = clip(input.pageMeta?.category || '', 60) || undefined;
  const tone = clip(input.pageMeta?.tone || '', 40) || undefined;
  const topicHint = clip(input.pageMeta?.aiTopicHint || '', 240) || undefined;

  return {
    fieldKind: mapped.fieldKind,
    fieldRole: mapped.role,
    currentContent,
    sectionType: String(block.type || 'Hero'),
    ...(sectionHeadline ? { sectionHeadline } : null),
    ...(sectionSubheadline ? { sectionSubheadline } : null),
    ...(cardTitle ? { cardTitle } : null),
    ...(Object.keys(cardFields).length ? { cardFields } : null),
    ...(pageCategory ? { pageCategory } : null),
    ...(pageGoal ? { pageGoal } : null),
    ...(tone ? { tone } : null),
    ...(topicHint ? { topicHint } : null),
  };
}

/** Serialize for API blockContext — still scoped; no sibling sections. */
export function serializeInlineAiContextForApi(
  ctx: LandingPageInlineAiStructuredContext,
): string {
  const lines: string[] = [
    `FIELD_ROLE=${ctx.fieldRole}`,
    `FIELD_KIND=${ctx.fieldKind}`,
    `SECTION_TYPE=${ctx.sectionType}`,
  ];
  if (ctx.sectionHeadline) lines.push(`SECTION_HEADLINE=${ctx.sectionHeadline}`);
  if (ctx.sectionSubheadline) lines.push(`SECTION_SUBHEADLINE=${ctx.sectionSubheadline}`);
  if (ctx.cardTitle) lines.push(`CARD_TITLE=${ctx.cardTitle}`);
  if (ctx.cardFields) {
    for (const [k, v] of Object.entries(ctx.cardFields)) {
      // Skip echoing the field being rewritten as "other" when identical key — still OK as topic anchor.
      lines.push(`CARD_${k.toUpperCase()}=${v}`);
    }
  }
  if (ctx.pageCategory) lines.push(`PAGE_CATEGORY=${ctx.pageCategory}`);
  if (ctx.pageGoal) lines.push(`PAGE_GOAL=${ctx.pageGoal}`);
  if (ctx.tone) lines.push(`PAGE_TONE=${ctx.tone}`);
  if (ctx.topicHint) lines.push(`TOPIC_HINT=${ctx.topicHint}`);
  lines.push('SCOPE=current_field_and_card_and_section_header_only');
  lines.push('DO_NOT_USE_OTHER_SECTIONS=1');
  return lines.join('\n').slice(0, 2000);
}

/**
 * When there is truly no topic signal, ask ONE clarifying question.
 * Returns null when enough context exists to suggest without asking.
 */
export function detectInlineAiMissingTopic(
  ctx: LandingPageInlineAiStructuredContext,
  profileHasProduct = false,
): string | null {
  if (ctx.topicHint) return null;
  if (profileHasProduct) return null;
  const hasTopic =
    Boolean(ctx.currentContent.trim()) ||
    Boolean(ctx.cardTitle?.trim()) ||
    Boolean(ctx.sectionHeadline?.trim()) ||
    Boolean(ctx.sectionSubheadline?.trim()) ||
    Boolean(ctx.pageCategory?.trim());
  if (hasTopic) return null;
  return 'Website này bán gì / phục vụ ai? (trả lời 1 câu ngắn)';
}
