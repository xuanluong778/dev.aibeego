/**
 * Landing Page Auto Phase 2 — AI structured copy (Zod validated, fallback-safe).
 * Additive: brand / pageGoal / theme / guarantee — still schemaVersion landing-page-generator.v1.
 */

import { z } from 'zod';
import {
  LANDING_PAGE_THEME_PRESETS,
  LANDING_PAGE_THEMES,
  type LandingPageSpec,
  type LandingPageTheme,
} from './landing-page-types';
import { sanitizeLandingPageSpec } from './landing-page-lifecycle';
import {
  buildDeepFallbackNarrative,
  deepenBenefitPairs,
  deepenFeaturePairs,
  deepenProcessPairs,
} from './landing-page-content-depth';
import {
  applyQuickThemeToSpecTokens,
  suggestLandingPageQuickTheme,
} from './landing-page-theme-presets';

export const LANDING_PAGE_AI_GOALS = [
  'lead',
  'sales',
  'signup',
  'consult',
  'event',
] as const;
export type LandingPageAiGoal = (typeof LANDING_PAGE_AI_GOALS)[number];

export const LANDING_PAGE_AI_GOAL_LABELS: Record<LandingPageAiGoal, string> = {
  lead: 'Thu lead',
  sales: 'Bán hàng',
  signup: 'Đăng ký',
  consult: 'Tư vấn',
  event: 'Sự kiện',
};

export const landingPageAiBriefSchema = z.object({
  productService: z.string().min(1).max(200),
  brandName: z.string().max(120).optional().default(''),
  price: z.string().max(80).optional().default(''),
  targetCustomer: z.string().min(1).max(400),
  /** Optional — derived from brand/goal/notes when empty (AI-first create). */
  uspBenefits: z.string().max(800).optional().default(''),
  pageGoal: z.enum(LANDING_PAGE_AI_GOALS).optional().default('lead'),
  extraNotes: z.string().max(1200).optional().default(''),
  sourceUrl: z.string().max(2000).optional().default(''),
  /** Industry / business type — deepens copy (spa, saas, agency…). */
  businessType: z.string().max(80).optional().default(''),
  /** Explicit pain — mapped into benefits / FAQ. */
  painPoint: z.string().max(400).optional().default(''),
  /** Offer / promotion — only when real (never invent %). */
  offer: z.string().max(200).optional().default(''),
  tone: z.enum(['professional', 'bold', 'friendly']).optional().default('professional'),
  ctaLabel: z.string().max(80).optional().default(''),
  ctaUrl: z.string().max(2000).optional().default(''),
  imageUrl: z.string().max(2000).optional().default(''),
  logoUrl: z.string().max(2000).optional().default(''),
  brandColor: z.string().max(32).optional().default(''),
  guarantee: z.string().max(400).optional().default(''),
  contactPhone: z.string().max(40).optional().default(''),
  contactEmail: z.string().max(160).optional().default(''),
  contactAddress: z.string().max(300).optional().default(''),
});

export type LandingPageAiBrief = z.infer<typeof landingPageAiBriefSchema>;

export const landingPageAiCopySchema = z.object({
  schemaVersion: z.literal('landing-page-generator.v1'),
  headline: z.string().min(1).max(160),
  subheadline: z.string().min(1).max(320),
  painPoints: z.array(z.string().min(1).max(200)).min(1).max(8),
  usp: z.string().min(1).max(240),
  benefits: z.array(z.string().min(1).max(200)).min(1).max(10),
  /** Per-benefit descriptions — required for premium depth when provided. */
  benefitDetails: z.array(z.string().min(1).max(320)).max(10).optional().default([]),
  /** Additive — features row; falls back to painPoints when empty. */
  features: z.array(z.string().min(1).max(200)).max(10).optional().default([]),
  featureDetails: z.array(z.string().min(1).max(320)).max(10).optional().default([]),
  processSteps: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(320),
      }),
    )
    .max(8)
    .optional()
    .default([]),
  cta: z.string().min(1).max(80),
  pricingCopy: z.string().min(1).max(400),
  guarantee: z.string().max(400).optional().default(''),
  faq: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(600),
      }),
    )
    .min(1)
    .max(10),
  seoTitle: z.string().min(1).max(120),
  metaDescription: z.string().min(1).max(320),
  theme: z.preprocess((v) => {
    if (typeof v === 'string' && (LANDING_PAGE_THEMES as readonly string[]).includes(v)) return v;
    return 'MODERN';
  }, z.enum(LANDING_PAGE_THEMES).default('MODERN')),
  footerBody: z.string().max(400).optional().default(''),
  leadFormHeadline: z.string().max(160).optional().default(''),
  mode: z.enum(['ai', 'fallback']).default('ai'),
});

export type LandingPageAiCopy = z.infer<typeof landingPageAiCopySchema>;

export function parseLandingPageAiCopy(raw: unknown): LandingPageAiCopy {
  return landingPageAiCopySchema.parse(raw);
}

export function extractJsonObject(text: string): unknown {
  const cleaned = String(text || '')
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object in AI response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export function deriveLandingPageAiUsp(brief: LandingPageAiBrief): string {
  return `${brief.productService} dành cho ${brief.targetCustomer}.`.slice(0, 800);
}

/** Normalize brief: fill USP when AI-first create omits it. */
export function normalizeLandingPageAiBrief(input: unknown): LandingPageAiBrief {
  const brief = landingPageAiBriefSchema.parse(input);
  if (!brief.uspBenefits.trim()) {
    return { ...brief, uspBenefits: deriveLandingPageAiUsp(brief) };
  }
  return brief;
}

function ctaForGoal(goal: LandingPageAiGoal): string {
  switch (goal) {
    case 'sales':
      return 'Mua ngay';
    case 'signup':
      return 'Đăng ký ngay';
    case 'consult':
      return 'Nhận tư vấn miễn phí';
    case 'event':
      return 'Đăng ký tham dự';
    case 'lead':
    default:
      return 'Để lại thông tin';
  }
}

function pickThemeForBrief(brief: LandingPageAiBrief): LandingPageTheme {
  const g = brief.pageGoal || 'lead';
  if (g === 'sales') return 'BOLD';
  if (g === 'event') return 'PREMIUM';
  if (g === 'consult') return 'CORPORATE';
  if (g === 'signup') return 'MODERN';
  return 'MINIMAL';
}

export function buildFallbackLandingPageAiCopy(brief: LandingPageAiBrief): LandingPageAiCopy {
  const normalized = normalizeLandingPageAiBrief(brief);
  const deep = buildDeepFallbackNarrative(normalized);
  const product = normalized.productService.trim() || 'Sản phẩm / dịch vụ';
  const brand = normalized.brandName?.trim() || product;
  return {
    schemaVersion: 'landing-page-generator.v1',
    headline: deep.headline,
    subheadline: deep.subheadline,
    painPoints: deep.painPoints,
    usp: deep.usp,
    benefits: deep.benefits,
    benefitDetails: deep.benefitDetails,
    features: deep.features,
    featureDetails: deep.featureDetails,
    processSteps: deep.processSteps,
    cta: deep.cta,
    pricingCopy: deep.pricingCopy,
    guarantee: deep.guarantee,
    faq: deep.faq,
    seoTitle: `${brand} | ${product}`.slice(0, 120),
    metaDescription: `${deep.usp} — ${deep.pricingCopy}`.slice(0, 320),
    theme: pickThemeForBrief(normalized),
    footerBody: `© ${brand} · ${product}`.slice(0, 400),
    leadFormHeadline: deep.leadFormHeadline,
    mode: 'fallback',
  };
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Merge AI copy into an existing LandingPageSpec (blocks + SEO + theme). Never injects HTML. */
export function applyLandingPageAiCopyToSpec(
  spec: LandingPageSpec,
  copy: LandingPageAiCopy,
): LandingPageSpec {
  const base = sanitizeLandingPageSpec(structuredClone(spec));
  const userLocked = base.meta?.themeUserLocked === true;
  let theme: LandingPageTheme =
    copy.theme && (LANDING_PAGE_THEMES as readonly string[]).includes(copy.theme)
      ? copy.theme
      : base.theme;
  let themeTokens = { ...LANDING_PAGE_THEME_PRESETS[theme] };
  let themePreset = base.meta?.themePreset;
  if (!userLocked) {
    const suggested = suggestLandingPageQuickTheme({
      pageGoal: undefined,
      category: typeof base.meta?.category === 'string' ? base.meta.category : undefined,
      productService: copy.headline,
      businessType: typeof base.meta?.category === 'string' ? base.meta.category : undefined,
    });
    const applied = applyQuickThemeToSpecTokens(suggested);
    theme = applied.theme;
    themeTokens = applied.themeTokens;
    themePreset = applied.themePreset;
  } else {
    theme = base.theme;
    themeTokens = { ...base.themeTokens };
    themePreset = base.meta?.themePreset;
  }
  const featureItems = (copy.features?.length ? copy.features : copy.painPoints).slice(0, 8);
  const audienceHint = copy.subheadline.slice(0, 80);
  const benefitPairs = deepenBenefitPairs(
    copy.benefits,
    copy.benefitDetails,
    copy.painPoints,
    audienceHint,
    copy.usp,
  );
  const featurePairs = deepenFeaturePairs(
    featureItems,
    copy.featureDetails,
    copy.usp,
    copy.pricingCopy,
  );
  const guaranteeText = copy.guarantee?.trim() || '';
  const leadHeadline = copy.leadFormHeadline?.trim() || 'Đăng ký nhận tư vấn';
  const footerBody =
    copy.footerBody?.trim() || `© ${copy.seoTitle.split('|')[0]?.trim() || 'Landing Page'}`;

  // Preserve template layout / structure: fill content into existing blocks.
  // Never rebuild a classic stack over webinar/saas/etc. schemas.
  if (base.meta?.layout && base.meta.layout !== 'classic' && base.blocks.length >= 4) {
    const blocks = base.blocks.map((block) => {
      if (!block.enabled) return block;
      switch (block.type) {
        case 'Header':
          return {
            ...block,
            headline: block.headline || copy.seoTitle.split('|')[0]?.trim() || block.headline,
            ctaLabel: copy.cta || block.ctaLabel,
          };
        case 'Hero':
          return {
            ...block,
            headline: copy.headline,
            subheadline: copy.subheadline,
            ctaLabel: copy.cta,
            ctaUrl: block.ctaUrl || '#lead-form',
            trustPoints:
              block.trustPoints?.length
                ? block.trustPoints
                : copy.benefits.slice(0, 3),
            body: block.body || copy.usp,
          };
        case 'Benefits':
          return {
            ...block,
            items: benefitPairs.map((pair, i) => ({
              id: block.items[i]?.id || uid('b'),
              title: pair.title,
              description: pair.description,
              imageUrl: block.items[i]?.imageUrl ?? null,
            })),
          };
        case 'Features':
        case 'Product':
          return {
            ...block,
            items: featurePairs.map((pair, i) => ({
              id: block.items[i]?.id || uid('f'),
              title: pair.title,
              description: pair.description,
              imageUrl: block.items[i]?.imageUrl ?? null,
              role: block.items[i]?.role,
            })),
          };
        case 'Speaker':
          return {
            ...block,
            // Keep speaker identity placeholders — never invent real names/reviews.
            items: (block.items.length ? block.items : [{ id: uid('sp'), title: '[Tên diễn giả]' }]).map(
              (it) => ({
                ...it,
                description:
                  it.description && !/usp|giải pháp chung/i.test(it.description)
                    ? it.description
                    : it.description ||
                      '[Bio ngắn — thay bằng thông tin thật trước khi publish]',
              }),
            ),
          };
        case 'Process': {
          const processPairs = deepenProcessPairs(
            block.items.map((it) => it.title),
            copy.processSteps,
            featureItems,
            'lead',
            audienceHint,
          );
          return {
            ...block,
            items: processPairs.map((pair, i) => ({
              id: block.items[i]?.id || uid('step'),
              title: pair.title,
              description: pair.description,
              imageUrl: block.items[i]?.imageUrl ?? null,
            })),
          };
        }
        case 'Guarantee':
          return { ...block, enabled: Boolean(guaranteeText), body: guaranteeText, ctaLabel: copy.cta || block.ctaLabel };
        case 'FAQ':
          return {
            ...block,
            items: (copy.faq.length
              ? copy.faq
              : block.items.map((q) => ({
                  question: 'question' in q ? (q as { question: string }).question : '',
                  answer: 'answer' in q ? (q as { answer: string }).answer : '',
                }))
            )
              .slice(0, 12)
              .map((f, i) => ({
                id: block.items[i]?.id || uid('q'),
                question: 'question' in f ? f.question : String(f),
                answer: 'answer' in f ? f.answer : copy.usp,
              })),
          };
        case 'CTA':
          return {
            ...block,
            headline: copy.headline.slice(0, 120) || block.headline,
            subheadline: copy.usp || block.subheadline,
            ctaLabel: copy.cta,
            ctaUrl: block.ctaUrl || '#lead-form',
          };
        case 'LeadForm':
          return {
            ...block,
            headline: leadHeadline,
            subheadline: copy.subheadline.slice(0, 200) || block.subheadline,
            submitLabel: copy.cta || block.submitLabel,
          };
        case 'Footer':
          return { ...block, body: footerBody, headline: block.headline };
        case 'Testimonials':
          return block; // never invent reviews
        case 'Pricing':
          return {
            ...block,
            subheadline: copy.pricingCopy || block.subheadline,
            plans: block.plans.map((p, i) =>
              i === 0
                ? {
                    ...p,
                    // Keep existing price unless placeholder-like; put offer text in features.
                    features: copy.benefits.slice(0, 4).length
                      ? copy.benefits.slice(0, 4)
                      : p.features,
                    ctaLabel: copy.cta || p.ctaLabel,
                  }
                : p,
            ),
          };
        default:
          return block;
      }
    });

    return sanitizeLandingPageSpec({
      ...base,
      theme,
      themeTokens,
      seo: {
        ...base.seo,
        title: copy.seoTitle,
        metaDescription: copy.metaDescription,
      },
      meta: {
        ...base.meta,
        ...(themePreset ? { themePreset } : {}),
        ...(userLocked ? { themeUserLocked: true } : {}),
      },
      blocks,
    });
  }

  const existingByType = new Map<string, string>();
  for (const b of base.blocks) {
    if (!existingByType.has(b.type)) existingByType.set(b.type, b.id);
  }
  const reuseId = (type: string, prefix: string) => existingByType.get(type) || uid(prefix);

  const blocks: LandingPageSpec['blocks'] = [
    {
      id: reuseId('Hero', 'hero'),
      type: 'Hero',
      enabled: true,
      spacing: 'lg',
      headline: copy.headline,
      subheadline: copy.subheadline,
      ctaLabel: copy.cta,
      ctaUrl: '#lead-form',
      trustPoints: copy.benefits.slice(0, 3),
    },
    {
      id: reuseId('Benefits', 'benefits'),
      type: 'Benefits',
      enabled: true,
      spacing: 'md',
      headline: 'Lợi ích nổi bật',
      items: benefitPairs.map((pair) => ({
        id: uid('b'),
        title: pair.title,
        description: pair.description,
      })),
    },
    {
      id: reuseId('Features', 'features'),
      type: 'Features',
      enabled: true,
      spacing: 'md',
      headline: 'Điểm nổi bật',
      items: featurePairs.map((pair) => ({
        id: uid('f'),
        title: pair.title,
        description: pair.description,
      })),
    },
    {
      id: reuseId('Pricing', 'pricing'),
      type: 'Pricing',
      enabled: true,
      spacing: 'md',
      headline: 'Gói & ưu đãi',
      subheadline: copy.pricingCopy,
      plans: [
        {
          id: uid('plan'),
          name: 'Gói đề xuất',
          price: 'Liên hệ',
          features: copy.benefits.slice(0, 4),
          ctaLabel: copy.cta,
          highlighted: true,
        },
      ],
    },
    {
      id: reuseId('Guarantee', 'guarantee'),
      type: 'Guarantee',
      enabled: Boolean(guaranteeText),
      spacing: 'md',
      headline: 'Cam kết của chúng tôi',
      body: guaranteeText,
      ctaLabel: copy.cta,
      ctaUrl: '#lead-form',
    },
    {
      id: reuseId('FAQ', 'faq'),
      type: 'FAQ',
      enabled: true,
      spacing: 'md',
      headline: 'Câu hỏi thường gặp',
      items: copy.faq.map((f) => ({
        id: uid('q'),
        question: f.question,
        answer: f.answer,
      })),
    },
    {
      id: reuseId('CTA', 'cta'),
      type: 'CTA',
      enabled: true,
      spacing: 'md',
      headline: copy.headline.slice(0, 120),
      subheadline: copy.usp,
      ctaLabel: copy.cta,
      ctaUrl: '#lead-form',
    },
    {
      id: reuseId('LeadForm', 'lead'),
      type: 'LeadForm',
      enabled: true,
      spacing: 'md',
      headline: leadHeadline,
      subheadline: copy.subheadline.slice(0, 200),
      submitLabel: copy.cta,
      fields: [
        { id: uid('fld'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true },
        { id: uid('fld'), name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true },
        { id: uid('fld'), name: 'email', label: 'Email', fieldType: 'email', required: false },
        { id: uid('fld'), name: 'company', label: 'Công ty', fieldType: 'text', required: false },
        { id: uid('fld'), name: 'need', label: 'Nhu cầu', fieldType: 'textarea', required: false },
        { id: uid('fld'), name: 'note', label: 'Ghi chú', fieldType: 'textarea', required: false },
      ],
    },
    {
      id: reuseId('Footer', 'footer'),
      type: 'Footer',
      enabled: true,
      spacing: 'sm',
      body: footerBody,
    },
  ];

  return sanitizeLandingPageSpec({
    ...base,
    theme,
    themeTokens,
    seo: {
      ...base.seo,
      title: copy.seoTitle,
      metaDescription: copy.metaDescription,
    },
    meta: {
      ...base.meta,
      ...(themePreset ? { themePreset } : {}),
      ...(userLocked ? { themeUserLocked: true } : {}),
    },
    blocks,
  });
}
