/** Catalog-backed generation: the model supplies text; trusted code owns layout and facts. */
import { z } from 'zod';
import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageThemeTokens,
} from './landing-page-types';
import { getLandingPageSystemTemplate } from './landing-page-templates';
import { sanitizeLandingPageSpec } from './landing-page-lifecycle';
import {
  buildFallbackLandingPageAiCopy,
  normalizeLandingPageAiBrief,
  type LandingPageAiBrief,
} from './landing-page-generator';
import type { LandingPageTemplateSelectResult } from './landing-page-template-select';
import {
  markLandingPageAiSources,
  type BusinessProfileData,
} from './landing-page-business-profile';
import type { LandingPageUrlSummary } from './landing-page-url-crawl';

const sectionTypes = [
  'Header',
  'Hero',
  'Benefits',
  'Features',
  'Product',
  'Process',
  'Gallery',
  'Pricing',
  'Guarantee',
  'FAQ',
  'CTA',
  'LeadForm',
  'Footer',
] as const;
const text = (max: number) => z.string().max(max);
export const landingPageAiSectionSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: z.enum(sectionTypes),
    headline: text(100).optional().default(''),
    subheadline: text(280).optional().default(''),
    body: text(600).optional().default(''),
    items: z
      .array(
        z.object({
          title: z.string().min(1).max(100),
          description: text(280).optional().default(''),
        }),
      )
      .max(6)
      .optional()
      .default([]),
    faq: z
      .array(z.object({ question: z.string().min(1).max(160), answer: z.string().min(1).max(500) }))
      .max(6)
      .optional()
      .default([]),
  })
  .strict();
export const landingPageAiPageContentSchema = z
  .object({
    schemaVersion: z.literal('landing-page-generator.v2'),
    seoTitle: z.string().min(1).max(100),
    metaDescription: z.string().min(1).max(260),
    sections: z.array(landingPageAiSectionSchema).min(3).max(30),
  })
  .strict();
export type LandingPageAiPageContent = z.infer<typeof landingPageAiPageContentSchema>;
export type LandingPageAiSectionContent = z.infer<typeof landingPageAiSectionSchema>;
export type LandingPageAiPlan = {
  template: LandingPageSpec;
  blocks: LandingPageBlock[];
  selection: LandingPageTemplateSelectResult;
};

/** Explicit form values win. Notes, CTA, industry and commercial facts never share a field. */
export function mergeLandingPageAiBrief(
  input: unknown,
  profile?: BusinessProfileData | null,
  url?: LandingPageUrlSummary | null,
): LandingPageAiBrief {
  const row = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const pick = (key: string, fallback?: string | null) =>
    typeof row[key] === 'string' && String(row[key]).trim()
      ? String(row[key]).trim()
      : fallback || '';
  return normalizeLandingPageAiBrief({
    ...row,
    productService: pick('productService', profile?.productService || url?.productService).slice(
      0,
      200,
    ),
    brandName: pick('brandName', profile?.brandName || profile?.companyName || url?.brand).slice(
      0,
      120,
    ),
    targetCustomer: pick('targetCustomer', profile?.targetCustomer).slice(0, 400),
    businessType: pick('businessType', profile?.industry).slice(0, 80),
    uspBenefits: pick('uspBenefits', profile?.usp || url?.usp).slice(0, 800),
    ctaLabel: pick('ctaLabel', profile?.defaultCta || url?.cta).slice(0, 80),
    imageUrl: pick('imageUrl', url?.imageUrl),
    logoUrl: pick('logoUrl', profile?.logoUrl || url?.logoUrl),
    brandColor: pick('brandColor', profile?.brandColor),
    contactPhone: pick('contactPhone', profile?.hotline || url?.contact?.phone),
    contactEmail: pick('contactEmail', profile?.email || url?.contact?.email),
    contactAddress: pick('contactAddress', profile?.address || url?.contact?.address),
    extraNotes: pick('extraNotes'),
    offer: pick('offer'),
    price: pick('price'),
  });
}

/** Media is rendered only, never fetched by this module. Server also DNS-checks external sources. */
export function safeLandingPageAiMedia(raw: string | null | undefined): string | null {
  const value = (raw || '').trim();
  if (/^\/(?:uploads|landing-pages|brand)\/[\w/%.?=&+\-]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (
      /^(?:localhost|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|\[)|\.local$|\.internal$/.test(
        host,
      )
    )
      return null;
    if (/example\.(?:com|org|net)|placeholder|via\.placeholder/i.test(host)) return null;
    return url.toString().slice(0, 2000);
  } catch {
    return null;
  }
}
export function landingPageAiCtaUrl(brief: LandingPageAiBrief): string {
  const raw = brief.ctaUrl.trim();
  if (/^(?:tel:\+?[\d ().-]{6,40}|mailto:[^\s@]+@[^\s@]+\.[^\s@]+)$/i.test(raw)) return raw;
  const url = safeLandingPageAiMedia(raw);
  return url && /^https?:/.test(url) ? url : '#lead-form';
}

export function prepareLandingPageAiPlan(
  brief: LandingPageAiBrief,
  selection: LandingPageTemplateSelectResult,
): LandingPageAiPlan {
  const selected = getLandingPageSystemTemplate(selection.templateSlug);
  if (!selected) throw new Error('AI_TEMPLATE_NOT_IN_CATALOG');
  const template = structuredClone(selected.spec);
  const image = safeLandingPageAiMedia(brief.imageUrl);
  const blocks: LandingPageBlock[] = [];
  for (const source of template.blocks) {
    if (!source.enabled || source.hidden) continue;
    if (['Testimonials', 'Speaker', 'Countdown', 'Video'].includes(source.type)) continue;
    if (source.type === 'Gallery' && !image) continue;
    if (source.type === 'Guarantee' && !brief.guarantee.trim()) continue;
    if (!(sectionTypes as readonly string[]).includes(source.type)) continue;
    let block: LandingPageBlock = { ...source };
    if (source.type === 'Pricing' && !brief.price.trim()) {
      block = { id: source.id, type: 'CTA', enabled: true, variant: 'split', spacing: 'lg' };
    }
    if (block.type === 'Hero') {
      block = {
        ...block,
        variant: image
          ? block.variant === 'minimal-copy'
            ? 'split-left'
            : block.variant
          : 'minimal-copy',
      };
    }
    blocks.push(block);
  }
  // Some catalog recipes open with a Speaker block. Removing unverified bios must
  // still leave a real introduction to the customer's product.
  if (!blocks.some((block) => block.type === 'Hero')) {
    const header = blocks.findIndex((block) => block.type === 'Header');
    blocks.splice(header < 0 ? 0 : header + 1, 0, {
      id: 'ai-hero', type: 'Hero', enabled: true,
      variant: image ? 'split-left' : 'minimal-copy', spacing: 'lg',
      headline: '', subheadline: '', ctaLabel: '', ctaUrl: '',
    });
  }
  if (safeLandingPageAiMedia(brief.logoUrl) && !blocks.some(block => block.type === 'Header')) {
    blocks.unshift({ id: 'ai-brand-header', type: 'Header', enabled: true, variant: 'minimal', spacing: 'sm' });
  }
  if (!blocks.some((b) => b.type === 'LeadForm')) {
    const position = blocks.findIndex((b) => b.type === 'Footer');
    blocks.splice(position < 0 ? blocks.length : position, 0, {
      id: 'ai-lead-form',
      type: 'LeadForm',
      enabled: true,
      variant: 'card',
      spacing: 'lg',
      fields: [],
      submitLabel: '',
    });
  }
  return { template, blocks, selection };
}

export function fallbackLandingPageAiContent(
  brief: LandingPageAiBrief,
  plan: LandingPageAiPlan,
): LandingPageAiPageContent {
  const copy = buildFallbackLandingPageAiCopy(brief);
  const seen: Record<string, number> = {};
  let detailIndex = 0;
  const sections = plan.blocks.map((block) => {
    const n = seen[block.type] || 0;
    seen[block.type] = n + 1;
    const base: LandingPageAiSectionContent = {
      id: block.id,
      type: block.type as LandingPageAiSectionContent['type'],
      headline: '',
      subheadline: '',
      body: '',
      items: [],
      faq: [],
    };
    switch (block.type) {
      case 'Header':
        return { ...base, headline: brief.brandName || brief.productService };
      case 'Hero':
        return { ...base, headline: copy.headline, subheadline: copy.subheadline };
      case 'Benefits':
        return {
          ...base,
          headline: 'Điều bạn đang quan tâm',
          items: copy.benefits.map((title, i) => ({
            title: title.slice(0, 100),
            description: copy.benefitDetails[i] || '',
          })),
        };
      case 'Product':
      case 'Features': {
        const ordinal = detailIndex++;
        if (ordinal === 0)
          return {
            ...base,
            headline: 'Tìm hiểu ' + brief.productService.slice(0, 70),
            items: copy.features.map((title, i) => ({
              title: title.slice(0, 100),
              description: copy.featureDetails[i] || '',
            })),
          };
        return {
          ...base,
          headline: ordinal === 1 ? 'Trước khi lựa chọn' : 'Thông tin cần trao đổi',
          items:
            ordinal === 1
              ? [
                  {
                    title: 'Yêu cầu cụ thể của bạn',
                    description:
                      'Nêu rõ hạng mục quan tâm để trao đổi về phạm vi và điều kiện phù hợp.',
                  },
                  {
                    title: 'Cân nhắc phương án',
                    description: 'Hỏi thêm những điểm bạn cần làm rõ trước khi đưa ra quyết định.',
                  },
                ]
              : [
                  {
                    title: 'Điều bạn muốn làm rõ',
                    description: 'Gửi câu hỏi về sản phẩm và cách bắt đầu để tiếp tục trao đổi.',
                  },
                ],
        };
      }
      case 'Process':
        return {
          ...base,
          headline: n ? 'Cách gửi yêu cầu' : 'Bắt đầu như thế nào?',
          items: n
            ? [
                {
                  title: 'Chọn thông tin cần trao đổi',
                  description: 'Cho biết sản phẩm hoặc dịch vụ bạn đang quan tâm.',
                },
                {
                  title: 'Để lại cách liên hệ',
                  description: 'Điền thông tin cần thiết để tiếp tục trao đổi.',
                },
              ]
            : copy.processSteps,
        };
      case 'Pricing':
        return { ...base, headline: 'Thông tin chi phí', subheadline: brief.offer };
      case 'Guarantee':
        return { ...base, headline: 'Cam kết được cung cấp', body: brief.guarantee };
      case 'FAQ':
        return { ...base, headline: 'Bạn có thể muốn biết', faq: copy.faq };
      case 'Gallery':
        return {
          ...base,
          headline: brief.productService.slice(0, 100),
          items: [{ title: 'Hình ảnh ' + brief.productService.slice(0, 80), description: '' }],
        };
      case 'CTA':
        return {
          ...base,
          headline: [
            'Trao đổi về phương án phù hợp',
            'Bạn muốn tìm hiểu thêm?',
            'Câu hỏi của bạn là gì?',
            'Kết nối cùng chúng tôi',
          ][n % 4]!,
          subheadline: [
            copy.pricingCopy,
            'Chọn cách liên hệ để trao đổi thêm về nhu cầu của bạn.',
            'Gửi câu hỏi cụ thể để làm rõ những thông tin bạn còn băn khoăn.',
            'Chia sẻ cách liên hệ thuận tiện để tiếp tục trao đổi.',
          ][n % 4]!,
        };
      case 'LeadForm':
        return {
          ...base,
          headline: copy.leadFormHeadline,
          subheadline: 'Để lại thông tin để tiếp tục trao đổi về nhu cầu của bạn.',
        };
      case 'Footer':
        return {
          ...base,
          body: [
            '© ' + (brief.brandName || brief.productService),
            brief.contactPhone,
            brief.contactEmail,
            brief.contactAddress,
          ]
            .filter(Boolean)
            .join(' · '),
        };
      default:
        return base;
    }
  });
  return landingPageAiPageContentSchema.parse({
    schemaVersion: 'landing-page-generator.v2',
    seoTitle: copy.seoTitle.slice(0, 100),
    metaDescription: copy.metaDescription.slice(0, 260),
    sections: sections.map((section) => ({
      ...section,
      headline: section.headline.slice(0, 100),
      subheadline: section.subheadline.slice(0, 280),
      body: section.body.slice(0, 600),
    })),
  });
}

export const LP_INTERNAL_COPY_PATTERN =
  /\bCTA\s*:|pain\s*(?:→|->)\s*USP|USP\s*(?:→|->)\s*CTA|ngôn ngữ\s*(?:professional|friendly|bold)|thu lead|không bịa|không dùng (?:đánh giá|testimonial).*giả|fallback copy|schemaVersion|conversion.focused|objection.handling|điểm khác biệt gắn với offer|giá trị \d+: rõ ràng|momentum/i;
export const LP_PLACEHOLDER_PATTERN =
  /\[(?:tên|thương hiệu|hình|ảnh|bio|nội dung|headline|mô tả)[^\]]*\]|lorem ipsum|add your title|your (?:brand|title)|^(?:item|case|feature|benefit)\s*#?\d+$/i;

export type LandingPageAiContentIssue = { code: string; path: string };
/** Collect all violations so a bounded repair can fix the page in one attempt. */
export class LandingPageAiContentValidationError extends Error {
  constructor(public readonly issues: LandingPageAiContentIssue[]) {
    super(issues.map((issue) => `${issue.code} at ${issue.path}`).join('; '));
    this.name = 'LandingPageAiContentValidationError';
  }
}

/** The catalog owns layout. Extra model sections are never rendered; conflicting
 * copies of a required section must be repaired rather than chosen arbitrarily. */
function reconcileLandingPageAiSections(raw: unknown, plan: LandingPageAiPlan) {
  const issues: LandingPageAiContentIssue[] = [];
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as any).sections))
    return { raw, issues };
  const page = raw as Record<string, unknown> & { sections: unknown[] };
  const sections: unknown[] = [];
  for (const block of plan.blocks) {
    const matches = page.sections.filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === 'object' &&
        (entry as any).id === block.id && (entry as any).type === block.type));
    if (!matches.length) continue;
    if (matches.length > 1) {
      const signatures = matches.map((entry) => {
        const parsed = landingPageAiSectionSchema.safeParse(entry);
        return JSON.stringify(parsed.success ? parsed.data : entry);
      });
      if (new Set(signatures).size > 1)
        issues.push({ code: 'AI_SECTION_AMBIGUOUS', path: block.id });
    }
    sections.push(matches[0]);
  }
  return { raw: { ...page, sections }, issues };
}

export function validateLandingPageAiContent(
  raw: unknown,
  brief: LandingPageAiBrief,
  plan: LandingPageAiPlan,
): LandingPageAiPageContent {
  const reconciled = reconcileLandingPageAiSections(raw, plan);
  const parsed = landingPageAiPageContentSchema.safeParse(reconciled.raw);
  if (!parsed.success) {
    throw new LandingPageAiContentValidationError([...reconciled.issues, ...parsed.error.issues.map((issue) => ({
      code: `AI_SCHEMA_${issue.code.toUpperCase()}`, path: issue.path.join('.') || 'page',
    }))]);
  }
  const content = parsed.data;
  const issues: LandingPageAiContentIssue[] = [...reconciled.issues];
  const invalid = (code: string, path: string) => { issues.push({ code, path }); };
  const ids = new Set(content.sections.map((s) => s.id));
  if (ids.size !== plan.blocks.length || content.sections.length !== plan.blocks.length)
    invalid('AI_SECTION_COUNT_MISMATCH', 'sections');
  const facts = [
    brief.brandName,
    brief.productService,
    brief.targetCustomer,
    brief.uspBenefits,
    brief.price,
    brief.offer,
    brief.guarantee,
    brief.ctaLabel,
    brief.contactPhone,
    brief.contactEmail,
    brief.contactAddress,
  ]
    .join(' ')
    .toLowerCase();
  const phrases = new Set<string>();
  for (const block of plan.blocks) {
    const section = content.sections.find((s) => s.id === block.id && s.type === block.type);
    if (!section) { invalid('AI_SECTION_MISSING', block.id); continue; }
    if (
      ['Benefits', 'Features', 'Product', 'Process', 'Gallery'].includes(block.type) &&
      !section.items.length
    )
      invalid('AI_SECTION_ITEMS_EMPTY', `${block.id}.items`);
    if (block.type === 'FAQ' && !section.faq.length)
      invalid('AI_SECTION_FAQ_EMPTY', `${block.id}.faq`);
    if (['Hero', 'CTA', 'LeadForm'].includes(block.type) && !section.headline.trim())
      invalid('AI_SECTION_HEADLINE_EMPTY', `${block.id}.headline`);
    const values = [
      { path: 'headline', value: section.headline },
      { path: 'subheadline', value: section.subheadline },
      { path: 'body', value: section.body },
      ...section.items.flatMap((item, index) => [
        { path: `items.${index}.title`, value: item.title },
        { path: `items.${index}.description`, value: item.description },
      ]),
      ...section.faq.flatMap((item, index) => [
        { path: `faq.${index}.question`, value: item.question },
        { path: `faq.${index}.answer`, value: item.answer },
      ]),
    ];
    for (const entry of values) {
      const { value } = entry;
      const path = `${block.id}.${entry.path}`;
      if (
        LP_INTERNAL_COPY_PATTERN.test(value) ||
        LP_PLACEHOLDER_PATTERN.test(value) ||
        /<\/?[a-z][^>]*>/i.test(value)
      )
        invalid('AI_INTERNAL_OR_PLACEHOLDER', path);
      const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalized.length >= 45 && block.type !== 'Footer' && block.type !== 'Header') {
        if (phrases.has(normalized)) invalid('AI_REPEATED_COPY', path);
        phrases.add(normalized);
      }
      for (const match of value.matchAll(
        /\d[\d.,]*\s*(?:%|₫|đồng|vnđ|vnd|usd|triệu|tỷ|sao|ngày|giờ|năm|khách hàng|học viên)/gi,
      )) {
        if (!facts.includes(match[0].toLowerCase()))
          invalid(`AI_UNSUPPORTED_NUMBER:${match[0]}`, path);
      }
      for (const match of value.matchAll(
        /miễn phí|hoàn tiền|bảo hành|chứng nhận|chứng chỉ|đảm bảo|cam kết|đã phục vụ|ISO\s*\d*|FDA/gi,
      )) {
        if (
          !facts.includes(match[0].toLowerCase()) &&
          !(brief.guarantee && /cam kết/i.test(match[0]))
        )
          invalid(`AI_UNSUPPORTED_CLAIM:${match[0]}`, path);
      }
    }
  }
  for (const field of ['seoTitle', 'metaDescription'] as const) {
    const value = content[field];
    if (LP_INTERNAL_COPY_PATTERN.test(value) || LP_PLACEHOLDER_PATTERN.test(value))
      invalid('AI_INVALID_SEO', field);
    for (const match of value.matchAll(/\d[\d.,]*\s*(?:%|₫|đồng|vnđ|vnd|usd|triệu|tỷ|sao|ngày|giờ|năm|khách hàng|học viên)/gi)) {
      if (!facts.includes(match[0].toLowerCase())) invalid(`AI_UNSUPPORTED_SEO_NUMBER:${match[0]}`, field);
    }
    for (const match of value.matchAll(/miễn phí|hoàn tiền|bảo hành|chứng nhận|chứng chỉ|đảm bảo|cam kết|đã phục vụ|ISO\s*\d*|FDA/gi)) {
      if (!facts.includes(match[0].toLowerCase())) invalid(`AI_UNSUPPORTED_SEO_CLAIM:${match[0]}`, field);
    }
  }
  if (issues.length) throw new LandingPageAiContentValidationError(issues);
  return content;
}

function formFields(goal: string, category: string, id: string) {
  const fields = [
    { id: `${id.slice(0, 48)}-name`, name: 'name', label: 'Họ tên', fieldType: 'text' as const, required: true },
  ];
  const contact = goal === 'signup' || goal === 'event' || category === 'saas' ? 'email' : 'phone';
  return [
    ...fields,
    {
      id: `${id.slice(0, 48)}-contact`,
      name: contact,
      label: contact === 'email' ? 'Email' : 'Số điện thoại',
      fieldType: contact === 'email' ? ('email' as const) : ('tel' as const),
      required: true,
    },
  ];
}

export function assembleLandingPageAiDraft(
  brief: LandingPageAiBrief,
  plan: LandingPageAiPlan,
  content: LandingPageAiPageContent,
  source: 'ai' | 'fallback',
  generationId: string,
): LandingPageSpec {
  const copy = buildFallbackLandingPageAiCopy(brief);
  const image = safeLandingPageAiMedia(brief.imageUrl);
  const logo = safeLandingPageAiMedia(brief.logoUrl);
  const ctaUrl = landingPageAiCtaUrl(brief);
  const cta = brief.ctaLabel || copy.cta;
  const blocks = plan.blocks.map((original, index): LandingPageBlock => {
    const section = content.sections.find((s) => s.id === original.id)!;
    // Whitelist presentation fields. No template copy, assets, forms, CRM or tracking survive.
    const tone =
      original.type === 'CTA' || original.type === 'Footer'
        ? 'dark'
        : original.type === 'LeadForm' ? 'editorial'
        : index % 2
          ? 'canvas'
          : 'surface';
    const base = {
      id: original.id,
      type: original.type,
      enabled: true,
      variant: original.variant,
      spacing: original.spacing || ('lg' as const),
      background:
        tone === 'dark'
          ? '#0F172A'
          : tone === 'editorial' ? '#F8FAFC'
          : tone === 'canvas'
            ? 'var(--lp-canvas, var(--lp-bg))'
            : 'var(--lp-surface)',
      style: {
        color: tone === 'dark' ? '#F8FAFC' : undefined,
        lpSectionTone: tone,
        lpAiGenerated: '1',
      },
    };
    const common = { ...base, headline: section.headline, subheadline: section.subheadline };
    switch (original.type) {
      case 'Header':
        return {
          ...common,
          type: 'Header',
          headline: brief.brandName || brief.productService,
          ctaLabel: cta,
          ctaUrl,
          imageUrl: logo,
        };
      case 'Hero':
        return {
          ...common,
          type: 'Hero',
          body: '',
          ctaLabel: cta,
          ctaUrl,
          trustPoints: [],
          imageUrl: image,
        };
      case 'CTA':
        return {
          ...common,
          type: 'CTA',
          body: section.body,
          ctaLabel: cta,
          ctaUrl,
          imageUrl: null,
        };
      case 'Footer':
        return {
          ...common,
          type: 'Footer',
          headline: '',
          body: [
            brief.brandName || brief.productService,
            brief.contactPhone,
            brief.contactEmail,
            brief.contactAddress,
          ]
            .filter(Boolean)
            .join(' · '),
          ctaLabel: '',
          ctaUrl: '',
        };
      case 'Guarantee':
        return { ...common, type: 'Guarantee', body: brief.guarantee, ctaLabel: cta, ctaUrl };
      case 'Benefits':
      case 'Features':
      case 'Process':
      case 'Gallery':
      case 'Product':
        return {
          ...common,
          type: original.type,
          ...(original.type === 'Benefits' && section.items.length === 4
            ? { variant: 'icon-grid' }
            : {}),
          items: section.items.map((item, i) => ({
            id: `${original.id.slice(0, 48)}-i${i + 1}`,
            title: item.title,
            description: item.description,
            imageUrl: original.type === 'Gallery' ? image : null,
          })),
        };
      case 'Pricing':
        return {
          ...common,
          type: 'Pricing',
          variant: 'cards',
          plans: [
            {
              id: `${original.id.slice(0, 48)}-price`,
              name: brief.productService.slice(0, 80),
              price: brief.price,
              features: brief.offer ? [brief.offer] : [],
              ctaLabel: cta,
              ctaUrl,
              highlighted: true,
            },
          ],
        };
      case 'FAQ':
        return {
          ...common,
          type: 'FAQ',
          items: section.faq.map((item, i) => ({
            id: `${original.id.slice(0, 48)}-q${i + 1}`,
            ...item,
          })),
        };
      case 'LeadForm':
        return {
          ...common,
          type: 'LeadForm',
          fields: formFields(brief.pageGoal, plan.selection.category, original.id),
          submitLabel: ctaUrl === '#lead-form' ? cta : 'Gửi yêu cầu liên hệ',
          successMessage: 'Đã nhận thông tin của bạn. Cảm ơn bạn đã liên hệ.',
        };
      default:
        throw new Error(`UNSUPPORTED_AI_SECTION:${original.type}`);
    }
  });
  const tokens: LandingPageThemeTokens = { ...plan.template.themeTokens };
  if (/^#[\da-f]{6}$/i.test(brief.brandColor)) {
    tokens.primary = brief.brandColor;
    tokens.button = brief.brandColor;
  }
  const templateMeta = plan.template.meta || {};
  return markLandingPageAiSources(
    sanitizeLandingPageSpec({
      version: 1,
      theme: plan.template.theme,
      themeTokens: tokens,
      seo: {
        title: content.seoTitle,
        metaDescription: content.metaDescription,
        canonical: null,
        ogImage: image,
        robotsIndex: true,
      },
      meta: {
        layout: templateMeta.layout || plan.selection.layout,
        category: plan.selection.category,
        designFamily: templateMeta.designFamily || plan.selection.designFamily,
        conversionGoal: templateMeta.conversionGoal || plan.selection.conversionGoal,
        goldStandard: templateMeta.goldStandard,
        architectureRecipe: templateMeta.architectureRecipe
          ? {
              ...templateMeta.architectureRecipe,
              sectionSequence: blocks.map((b) => b.type),
              flowSteps: templateMeta.architectureRecipe.flowSteps.filter((step) =>
                blocks.some((b) => b.type === step.block),
              ),
            }
          : undefined,
        aiGenerationId: generationId,
        aiTemplateSlug: plan.selection.templateSlug,
        aiSource: source,
      },
      blocks,
    }),
  );
}

/** Preserve complete edited/locked blocks, including nested content and custom sections. */
export function protectLandingPageAiUserContent(
  previous: LandingPageSpec,
  generated: LandingPageSpec,
): LandingPageSpec {
  const result = structuredClone(generated);
  const sources = previous.meta?.fieldSources || {};
  for (const old of previous.blocks) {
    const edited =
      old.locked ||
      Object.entries(sources).some(
        ([key, value]) =>
          value === 'user' && (key.startsWith(old.id + '.') || key.startsWith(old.id + '::')),
      );
    if (!edited) continue;
    let index = result.blocks.findIndex((b) => b.id === old.id);
    if (index < 0) {
      const ordinal = previous.blocks
        .slice(0, previous.blocks.indexOf(old))
        .filter((b) => b.type === old.type).length;
      const sameType = result.blocks
        .map((b, i) => ({ b, i }))
        .filter((entry) => entry.b.type === old.type);
      index = sameType[ordinal]?.i ?? -1;
    }
    if (index >= 0) result.blocks[index] = structuredClone(old);
    else
      result.blocks.splice(
        Math.min(previous.blocks.indexOf(old), result.blocks.length),
        0,
        structuredClone(old),
      );
  }
  for (const key of ['title', 'metaDescription'] as const)
    if (sources[`seo.${key}`] === 'user') result.seo[key] = previous.seo[key];
  if (
    previous.meta?.themeUserLocked ||
    Object.entries(sources).some(
      ([key, value]) => value === 'user' && key.startsWith('themeTokens.'),
    )
  ) {
    result.theme = previous.theme;
    result.themeTokens = structuredClone(previous.themeTokens);
  }
  result.meta = {
    ...previous.meta,
    ...result.meta,
    fieldSources: { ...result.meta?.fieldSources, ...sources },
    clientRevision: (previous.meta?.clientRevision || 0) + 1,
    lastAutosaveRequestId: `ai-${result.meta?.aiGenerationId || 'generation'}`.slice(0, 64),
  };
  return result;
}
