/**
 * AI template + architecture selection — deterministic ranking over canonical catalog.
 * Picks shared template slug + architecture; never invents unknown slugs.
 */

import type { LandingPageCategory } from './landing-page-types';
import { layoutForCategory, type LandingPageLayout } from './landing-page-ui';
import {
  CATEGORY_ARCHITECTURES,
  type CategoryArchitectureVariant,
  type CtaStrategy,
  type FormPlacement,
} from './landing-page-category-architectures';
import {
  isLandingPageConversionGoal,
  isLandingPageDesignFamily,
  mapCtaStrategyToConversionGoal,
  type LandingPageConversionGoal,
  type LandingPageDesignFamily,
} from './landing-page-template-foundation';
import {
  getLandingPageSystemTemplate,
  LANDING_PAGE_SYSTEM_TEMPLATES,
} from './landing-page-templates';
import { isCanonicalTemplateSlug } from './landing-page-template-validators';

export type LandingPageConversionType =
  | 'audit'
  | 'booking'
  | 'trial'
  | 'enroll'
  | 'buy'
  | 'reserve'
  | 'register'
  | 'quote'
  | 'consult'
  | 'viewing'
  | 'download'
  | 'demo'
  | 'lead';

export type LandingPageTemplateSelectInput = {
  businessType?: string;
  pageGoal?: string;
  offer?: string;
  audience?: string;
  productService?: string;
  conversionType?: LandingPageConversionType | string;
  /** Preferred design family (editorial | minimal | luxury | …). */
  designFamily?: LandingPageDesignFamily | string;
  /** Preferred conversion goal (lead | booking | purchase | …). */
  conversionGoal?: LandingPageConversionGoal | string;
  /** Extra tags / keywords for ranking. */
  tags?: string[];
  /** Explicit override — wins over heuristics when slug is canonical. */
  templateSlug?: string;
};

export type LandingPageTemplateSelectResult = {
  templateSlug: string;
  category: LandingPageCategory | string;
  layout: LandingPageLayout;
  reason: string;
  themeHint?: string;
  architectureId: string;
  heroVariant: string;
  ctaStrategy: CtaStrategy;
  formPlacement: FormPlacement;
  conversionType: LandingPageConversionType | string;
  conversionGoal: LandingPageConversionGoal;
  designFamily: LandingPageDesignFamily;
  sectionSequence: string[];
  score?: number;
};

const SLUG_BY_CATEGORY: Record<string, string> = {
  webinar: 'webinar-register',
  lead_magnet: 'lead-magnet-checklist',
  ebook: 'ebook-magnet',
  quote: 'quote-request',
  demo: 'product-demo',
  service: 'local-service',
  spa: 'spa-wellness',
  clinic: 'clinic-booking',
  coaching: 'coaching-1on1',
  course: 'online-course',
  saas: 'saas-trial',
  product: 'product-launch',
  cosmetics: 'cosmetics-skincare',
  fashion: 'fashion-drop',
  restaurant: 'restaurant-promo',
  real_estate: 'real-estate-project',
  agency: 'agency-portfolio',
  consulting: 'consulting-b2b',
  seo: 'seo-service',
  website: 'website-build',
};

const DEFAULT_CTA_BY_CATEGORY: Record<string, CtaStrategy> = {
  seo: 'audit',
  agency: 'consult',
  clinic: 'booking',
  spa: 'booking',
  course: 'enroll',
  coaching: 'enroll',
  saas: 'trial',
  demo: 'demo',
  product: 'buy',
  cosmetics: 'buy',
  fashion: 'buy',
  restaurant: 'reserve',
  real_estate: 'viewing',
  webinar: 'register',
  website: 'quote',
  service: 'booking',
  consulting: 'consult',
  quote: 'quote',
  ebook: 'download',
  lead_magnet: 'download',
};

const FALLBACK_SLUG = 'lead-magnet-checklist';

function blob(input: LandingPageTemplateSelectInput): string {
  return [
    input.businessType,
    input.pageGoal,
    input.offer,
    input.audience,
    input.productService,
    input.conversionType,
    input.designFamily,
    input.conversionGoal,
    ...(input.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function inferConversionType(
  input: LandingPageTemplateSelectInput,
  category: string,
): LandingPageConversionType {
  if (input.conversionType) {
    return input.conversionType as LandingPageConversionType;
  }
  const text = blob(input);
  const goal = (input.pageGoal || '').toLowerCase();
  if (/audit|seo audit/.test(text)) return 'audit';
  if (/đặt bàn|reserve|reservation/.test(text)) return 'reserve';
  if (/xem nhà|viewing|open house/.test(text)) return 'viewing';
  if (/trial|dùng thử/.test(text)) return 'trial';
  if (/demo/.test(text)) return 'demo';
  if (/enroll|đăng ký học|khóa học/.test(text)) return 'enroll';
  if (/webinar|đăng ký webinar|register/.test(text) || goal === 'event') return 'register';
  if (/báo giá|quote/.test(text)) return 'quote';
  if (/đặt lịch|booking|book/.test(text)) return 'booking';
  if (/tư vấn|consult/.test(text) || goal === 'consult') {
    if (category === 'clinic' || category === 'spa' || category === 'service') return 'booking';
    if (category === 'seo') return 'audit';
    if (category === 'course' || category === 'coaching') return 'enroll';
    return 'consult';
  }
  if (/mua|buy|sales/.test(text) || goal === 'sales') return 'buy';
  if (/download|tài liệu|checklist|ebook/.test(text)) return 'download';
  return (DEFAULT_CTA_BY_CATEGORY[category] || 'lead') as LandingPageConversionType;
}

function inferPreferredDesignFamily(input: LandingPageTemplateSelectInput): LandingPageDesignFamily | null {
  if (isLandingPageDesignFamily(input.designFamily)) return input.designFamily;
  const text = blob(input);
  if (/luxury|premium|editorial|sang trọng/.test(text)) return 'luxury';
  if (/minimal|tối giản|clean|soft/.test(text)) return 'minimal';
  if (/organic|wellness|tự nhiên|warm/.test(text)) return 'organic';
  if (/bold|dark|cinematic|mạnh/.test(text)) return 'bold';
  if (/corporate|clinic|chuyên nghiệp|clinical/.test(text)) return 'corporate';
  if (/portfolio|gallery|lookbook/.test(text)) return 'portfolio';
  if (/local|địa phương|gần bạn/.test(text)) return 'local';
  if (/conversion|offer|ưu đãi|combo/.test(text)) return 'conversion';
  if (/editorial|story|review|social proof/.test(text)) return 'editorial';
  return null;
}

function inferPreferredConversionGoal(
  input: LandingPageTemplateSelectInput,
  category: string,
): LandingPageConversionGoal | null {
  if (isLandingPageConversionGoal(input.conversionGoal)) return input.conversionGoal;
  return mapCtaStrategyToConversionGoal(inferConversionType(input, category));
}

function slugWithSuffix(baseSlug: string, suffix: string): string {
  if (!suffix) return baseSlug;
  return `${baseSlug}-${suffix}`;
}

function slugForMatch(base: string, variant: CategoryArchitectureVariant): string {
  if (variant.variantIndex === 0 || !variant.flowSlugSuffix) return base;
  return slugWithSuffix(base, variant.flowSlugSuffix);
}

function ensureCanonicalSlug(slug: string, category: string): string {
  if (isCanonicalTemplateSlug(slug, LANDING_PAGE_SYSTEM_TEMPLATES)) return slug;
  const base = SLUG_BY_CATEGORY[category] || FALLBACK_SLUG;
  if (isCanonicalTemplateSlug(base, LANDING_PAGE_SYSTEM_TEMPLATES)) return base;
  const anyCat = LANDING_PAGE_SYSTEM_TEMPLATES.find((t) => t.category === category);
  if (anyCat) return anyCat.slug;
  return (
    getLandingPageSystemTemplate(FALLBACK_SLUG)?.slug ||
    LANDING_PAGE_SYSTEM_TEMPLATES[0]?.slug ||
    FALLBACK_SLUG
  );
}

function scoreVariant(
  variant: CategoryArchitectureVariant,
  input: LandingPageTemplateSelectInput,
  category: string,
): number {
  let score = 0;
  const conversion = inferConversionType(input, category);
  const preferredGoal = inferPreferredConversionGoal(input, category);
  const preferredFamily = inferPreferredDesignFamily(input);
  const text = blob(input);

  if (variant.ctaStrategy === conversion) score += 40;
  if (preferredGoal && variant.conversionGoal === preferredGoal) score += 35;
  if (preferredFamily && variant.designFamily === preferredFamily) score += 30;

  if (/giá|pricing|package|gói|retainer|offer|combo|ưu đãi/.test(text)) {
    if (variant.visualComposition === 'pricing_forward') score += 20;
    if (variant.architectureId.includes('offer')) score += 15;
  }
  if (/video|demo reel|trailer|showreel/.test(text) && variant.visualComposition === 'video_demo') {
    score += 18;
  }
  if (/gallery|portfolio|before.?after|lookbook|ảnh/.test(text)) {
    if (variant.visualComposition === 'gallery_heavy') score += 18;
    if (variant.flowSlugSuffix.includes('gallery')) score += 12;
  }
  if (/faq|câu hỏi|objection/.test(text) && variant.sectionSequence.includes('FAQ')) score += 10;
  if (/form sớm|early form|booking first|đặt lịch đầu/.test(text)) {
    if (variant.formPlacement === 'early_after_hero') score += 22;
  }
  if (/tối giản|minimal|soft minimal/.test(text)) {
    if (variant.designFamily === 'minimal' || variant.flowSlugSuffix.includes('minimal')) score += 18;
  }
  if (/trust|uy tín|chứng chỉ|clinic/.test(text)) {
    if (variant.proofType === 'certificate' || variant.architectureId.includes('clinic')) score += 16;
  }
  if (/local|địa chỉ|gần bạn|hours/.test(text) && variant.designFamily === 'local') score += 16;
  if (/review|testimonial|social proof|đánh giá/.test(text)) {
    if (variant.architectureId.includes('social-proof') || variant.proofType === 'reviews') score += 16;
  }
  if (/luxury|premium|editorial/.test(text) && variant.designFamily === 'luxury') score += 14;
  if (/organic|wellness/.test(text) && variant.designFamily === 'organic') score += 14;

  // Prefer primary lightly when tied
  if (variant.variantIndex === 0) score += 2;

  // Audience / tags soft match against architecture id + purpose
  const tagBlob = `${variant.architectureId} ${variant.purpose || ''} ${variant.descriptionHint || ''}`.toLowerCase();
  for (const tag of input.tags || []) {
    const t = tag.toLowerCase();
    if (t && tagBlob.includes(t)) score += 6;
  }
  if (input.audience && tagBlob.includes(input.audience.toLowerCase())) score += 5;

  return score;
}

/**
 * Pick architecture variant within category by conversionGoal + designFamily + signals.
 */
export function selectArchitectureVariant(
  category: LandingPageCategory | string,
  input: LandingPageTemplateSelectInput,
): CategoryArchitectureVariant {
  const variants =
    CATEGORY_ARCHITECTURES[category as LandingPageCategory] ||
    CATEGORY_ARCHITECTURES.product;

  let best = variants[0]!;
  let bestScore = -1;
  for (const v of variants) {
    const s = scoreVariant(v, input, category);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

function categoryFromSlug(slug: string): string {
  const template = getLandingPageSystemTemplate(slug);
  if (template) return template.category;
  const found = Object.entries(SLUG_BY_CATEGORY).find(
    ([, s]) => slug === s || slug.startsWith(`${s}-`),
  );
  return found?.[0] || 'product';
}

function resultFromVariant(
  category: string,
  variant: CategoryArchitectureVariant,
  input: LandingPageTemplateSelectInput,
  reason: string,
  score?: number,
): LandingPageTemplateSelectResult {
  const baseSlug = SLUG_BY_CATEGORY[category] || FALLBACK_SLUG;
  const rawSlug = slugForMatch(baseSlug, variant);
  const templateSlug = ensureCanonicalSlug(rawSlug, category);
  const conversion = inferConversionType(input, category);
  return {
    templateSlug,
    category,
    layout: variant.layout || layoutForCategory(category),
    reason: `${reason} → architecture:${variant.architectureId}`,
    architectureId: variant.architectureId,
    heroVariant: variant.heroVariant,
    ctaStrategy: variant.ctaStrategy,
    formPlacement: variant.formPlacement,
    conversionType: conversion,
    conversionGoal: variant.conversionGoal || mapCtaStrategyToConversionGoal(variant.ctaStrategy),
    designFamily: variant.designFamily || 'conversion',
    sectionSequence: variant.sectionSequence,
    themeHint: variant.theme,
    score,
  };
}

function finalizeSelection(
  category: string,
  input: LandingPageTemplateSelectInput,
  reason: string,
): LandingPageTemplateSelectResult {
  const variant = selectArchitectureVariant(category, input);
  const score = scoreVariant(variant, input, category);
  return resultFromVariant(category, variant, input, reason, score);
}

/** Heuristic AI template + architecture picker — deterministic, catalog-safe. */
export function selectLandingPageTemplate(
  input: LandingPageTemplateSelectInput,
): LandingPageTemplateSelectResult {
  if (input.templateSlug?.trim()) {
    const slug = input.templateSlug.trim();
    if (!isCanonicalTemplateSlug(slug, LANDING_PAGE_SYSTEM_TEMPLATES)) {
      return finalizeSelection('lead_magnet', input, `unknown slug:${slug} → fallback`);
    }
    const category = categoryFromSlug(slug);
    const variants =
      CATEGORY_ARCHITECTURES[category as LandingPageCategory] ||
      CATEGORY_ARCHITECTURES.product;
    const baseSlug = SLUG_BY_CATEGORY[category] || '';
    const suffix =
      baseSlug && slug.startsWith(`${baseSlug}-`) ? slug.slice(baseSlug.length + 1) : '';
    const variant: CategoryArchitectureVariant =
      variants.find((v) => slugForMatch(baseSlug, v) === slug) ||
      variants.find((v) => v.flowSlugSuffix === suffix) ||
      variants[0]!;
    const conversion = inferConversionType(input, category);
    return {
      templateSlug: slug,
      category,
      layout: variant.layout || layoutForCategory(category),
      reason: 'explicit templateSlug',
      architectureId: variant.architectureId,
      heroVariant: variant.heroVariant,
      ctaStrategy: variant.ctaStrategy,
      formPlacement: variant.formPlacement,
      conversionType: conversion,
      conversionGoal: variant.conversionGoal || mapCtaStrategyToConversionGoal(variant.ctaStrategy),
      designFamily: variant.designFamily || 'conversion',
      sectionSequence: variant.sectionSequence,
      themeHint: variant.theme,
      score: 100,
    };
  }

  const text = blob(input);
  const goal = (input.pageGoal || '').toLowerCase();

  // An explicitly selected industry takes precedence over audience/product keywords.
  const industry = (input.businessType || '').trim().toLowerCase();
  if (industry in SLUG_BY_CATEGORY && goal !== 'event') {
    return finalizeSelection(industry, input, 'explicit business industry');
  }

  const rules: Array<{ test: () => boolean; category: string; reason: string }> = [
    {
      test: () => goal !== 'event' && /thiết kế (?:web|website)|website development|web design/.test(text),
      category: 'website', reason: 'website design signals',
    },
    {
      test: () => goal !== 'event' && /coaching|huấn luyện cá nhân|mentor/.test(text),
      category: 'coaching', reason: 'coaching signals',
    },
    {
      test: () =>
        goal === 'event' ||
        /webinar|hội thảo|seminar|workshop|live session|zoom meetup/.test(text),
      category: 'webinar',
      reason: 'goal/event or webinar keywords',
    },
    {
      test: () => /saas|phần mềm|software|trial|subscription|crm|platform/.test(text),
      category: 'saas',
      reason: 'saas / software signals',
    },
    {
      test: () => /khóa học|course|học online|đào tạo|training|academy/.test(text),
      category: 'course',
      reason: 'course / training signals',
    },
    {
      test: () => /seo|search engine|tối ưu seo|organic|seo agency/.test(text),
      category: 'seo',
      reason: 'seo signals',
    },
    {
      test: () =>
        /marketing agency|creative agency|branding agency|đại lý marketing|\bagency\b/.test(text) &&
        !/seo/.test(text),
      category: 'agency',
      reason: 'agency signals',
    },
    {
      test: () => /clinic|phòng khám|nha khoa|bác sĩ|thẩm mỹ viện|dental/.test(text),
      category: 'clinic',
      reason: 'clinic / medical',
    },
    {
      test: () => /spa|wellness|massage|nail salon|beauty salon/.test(text),
      category: 'spa',
      reason: 'spa / wellness',
    },
    {
      test: () => /nhà hàng|restaurant|fnb|cafe|quán ăn|ẩm thực/.test(text),
      category: 'restaurant',
      reason: 'F&B / local',
    },
    {
      test: () => /bất động sản|real estate|căn hộ|dự án|nhà đất/.test(text),
      category: 'real_estate',
      reason: 'real estate',
    },
    {
      test: () => /ebook|checklist|lead magnet|tặng tài liệu|download/.test(text),
      category: 'lead_magnet',
      reason: 'lead magnet / ebook',
    },
    {
      test: () => /demo|dùng thử|product demo/.test(text),
      category: 'demo',
      reason: 'product demo',
    },
    {
      test: () => /báo giá|quote|b2b|tư vấn doanh nghiệp|consulting/.test(text),
      category: 'consulting',
      reason: 'B2B / quote',
    },
    {
      test: () => /mỹ phẩm|skincare|làm đẹp|cosmetics/.test(text),
      category: 'cosmetics',
      reason: 'cosmetics',
    },
    {
      test: () => /thời trang|fashion|apparel|streetwear/.test(text),
      category: 'fashion',
      reason: 'fashion',
    },
    {
      test: () => goal === 'sales' || /sản phẩm|product launch|ra mắt|mua ngay/.test(text),
      category: 'product',
      reason: 'sales / product',
    },
    {
      test: () => /dịch vụ|service|sửa chữa|vệ sinh|local service/.test(text),
      category: 'service',
      reason: 'local service',
    },
  ];

  for (const rule of rules) {
    if (rule.test()) {
      return finalizeSelection(rule.category, input, rule.reason);
    }
  }

  return finalizeSelection('service', input, 'general service fallback');
}
