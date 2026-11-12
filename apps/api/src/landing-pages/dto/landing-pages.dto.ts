import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const THEMES = ['MODERN', 'PREMIUM', 'MINIMAL', 'BOLD', 'CORPORATE'] as const;
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const EVENT_TYPES = ['PAGE_VIEW', 'CTA_CLICK', 'FORM_START', 'FORM_SUBMIT', 'LEAD'] as const;

export class ListLandingPagesQueryDto {
  @IsOptional()
  @IsIn([...STATUSES, 'ALL'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class ListLandingPageTemplatesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsIn([...THEMES])
  theme?: string;

  /** Free-text search on name / description / tags / slug. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  /** Filter by design family (editorial | minimal | luxury | …). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  designFamily?: string;

  /** Filter by conversion goal (lead | booking | purchase | …). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  conversionGoal?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeSystem?: boolean;
}

export class CreateLandingPageDto {
  /** Explicit blank starter; omitted by template and AI/URL creation. */
  @IsOptional()
  @IsIn(['blank'])
  mode?: 'blank';

  /** Confirmed AI preview, saved atomically with the new draft. */
  @IsOptional()
  @IsObject()
  draftSpec?: Record<string, unknown>;
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  templateSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  templateId?: string;

  @IsOptional()
  @IsIn([...THEMES])
  theme?: string;

  /** Optional client key — retries with same key reuse the same page (no duplicate). */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class UpdateLandingPageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @IsIn([...THEMES])
  theme?: string;

  @IsOptional()
  @IsObject()
  draftSpec?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  seoCanonical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ogImage?: string;

  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  subdomainSlug?: string;

  @IsOptional()
  @IsObject()
  trackingConfig?: Record<string, unknown>;
}

export class AutosaveLandingPageDto {
  @IsObject()
  draftSpec!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  /** Monotonic client revision — stale (lower) saves are rejected. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clientRevision?: number;

  /** Revision this tab last loaded or saved. Must match the stored draft. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseRevision?: number;

  /** Idempotency / trace id from builder (optional). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  requestId?: string;
}

export class PublishLandingPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Draft revision that just autosaved. Publish refuses a different stored revision. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clientRevision?: number;
}

export class UpsertCustomDomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  customDomain!: string;
}

export class SuggestLandingPageBriefDto {
  @IsIn(['targetCustomer', 'painPoint', 'uspBenefits']) field!: 'targetCustomer' | 'painPoint' | 'uspBenefits';
  @IsOptional() @IsString() @MaxLength(80) businessType?: string;
  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(200) productService?: string;
  @IsOptional() @IsString() @MaxLength(400) targetCustomer?: string;
  @IsOptional() @IsString() @MaxLength(400) painPoint?: string;
  @IsOptional() @IsString() @MaxLength(800) uspBenefits?: string;
  @IsOptional() @IsIn(['lead', 'sales', 'signup', 'consult', 'event']) pageGoal?: string;
  @IsString() @MinLength(1) @MaxLength(120) idempotencyKey!: string;
}

export class GenerateLandingPageAiDto {
  @IsOptional() @IsString() @MaxLength(80) ctaLabel?: string;
  @IsOptional() @IsString() @MaxLength(2000) ctaUrl?: string;
  @IsOptional() @IsString() @MaxLength(2000) imageUrl?: string;
  @IsOptional() @IsString() @MaxLength(2000) logoUrl?: string;
  @IsOptional() @IsString() @MaxLength(32) brandColor?: string;
  @IsOptional() @IsString() @MaxLength(400) guarantee?: string;
  @IsOptional() @IsString() @MaxLength(40) contactPhone?: string;
  @IsOptional() @IsString() @MaxLength(160) contactEmail?: string;
  @IsOptional() @IsString() @MaxLength(300) contactAddress?: string;
  /** The UI has already shown and let the user edit extracted/profile data. */
  @IsOptional() @IsBoolean() sourceReviewed?: boolean;
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  productService!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brandName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  price?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(400)
  targetCustomer!: string;

  /** Optional in AI-first create — server derives USP when empty. */
  @IsOptional()
  @IsString()
  @MaxLength(800)
  uspBenefits?: string;

  @IsOptional()
  @IsIn(['lead', 'sales', 'signup', 'consult', 'event'])
  pageGoal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  extraNotes?: string;

  /** Optional public URL — server enriches brief via SSRF-safe fetch. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sourceUrl?: string;

  /** If set, apply AI copy onto this page draft */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  landingPageId?: string;

  /** Optional client key — retries reuse prior generate result for same org/key. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;

  /** Merge tenant BusinessProfile into AI brief context. */
  @IsOptional()
  @IsBoolean()
  useBusinessProfile?: boolean;

  /** Explicit catalog template — AI fills content into this schema. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  templateSlug?: string;

  /** Business type signal for AI template selection (e.g. spa, saas, agency). */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  businessType?: string;

  /** Offer / promotion signal for template selection. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  offer?: string;

  /** Pain point — deepens AI benefits / FAQ. */
  @IsOptional()
  @IsString()
  @MaxLength(400)
  painPoint?: string;

  /** Copy tone. */
  @IsOptional()
  @IsIn(['professional', 'bold', 'friendly'])
  tone?: string;
}

export class UpsertBusinessProfileDto {
  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(160) companyName?: string;
  @IsOptional() @IsString() @MaxLength(2000) website?: string;
  @IsOptional() @IsString() @MaxLength(120) industry?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @IsString() @MaxLength(400) productService?: string;
  @IsOptional() @IsString() @MaxLength(400) targetCustomer?: string;
  @IsOptional() @IsString() @MaxLength(800) usp?: string;
  @IsOptional() @IsString() @MaxLength(40) hotline?: string;
  @IsOptional() @IsString() @MaxLength(160) email?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(2000) logoUrl?: string;
  @IsOptional() @IsString() @MaxLength(32) brandColor?: string;
  @IsOptional() @IsString() @MaxLength(2000) facebookUrl?: string;
  @IsOptional() @IsObject() socialLinks?: Record<string, string>;
  @IsOptional() @IsString() @MaxLength(80) defaultCta?: string;
}

export class ApplyBusinessProfileDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @IsOptional()
  @IsIn(['lead', 'sales', 'signup', 'consult', 'event'])
  pageGoal?: string;
}

export class InlineAiSuggestFieldDto {
  @IsIn([
    'suggest_3',
    'more_engaging',
    'shorter',
    'clearer',
    'more_conversion',
    'more_professional',
    'more_friendly',
    'fix_spelling',
    'rewrite',
  ])
  action!: string;

  @IsIn([
    'seo.title',
    'seo.metaDescription',
    'headline',
    'subheadline',
    'body',
    'ctaLabel',
    'item.title',
    'item.description',
    'item.question',
    'item.answer',
    'item.quote',
    'item.author',
    'item.role',
    'field.label',
    'field.placeholder',
    'plan.subheadline',
    'plan.feature',
  ])
  fieldKind!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  currentContent?: string;

  @IsOptional()
  @IsIn([
    'Hero',
    'Benefits',
    'Features',
    'Product',
    'Pricing',
    'Testimonials',
    'Gallery',
    'Video',
    'Process',
    'Guarantee',
    'FAQ',
    'LeadForm',
    'CTA',
    'Footer',
    'SEO',
  ])
  blockType?: string;

  @IsOptional()
  @IsIn(['lead', 'sales', 'signup', 'consult', 'event'])
  pageGoal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  blockContext?: string;

  @IsOptional()
  @IsBoolean()
  useBusinessProfile?: boolean;
}

export class CrawlLandingPageUrlDto {
  @IsString()
  @MinLength(8)
  @MaxLength(2000)
  url!: string;
}

export class ApplyPageDoctorDto {
  @IsObject()
  report!: Record<string, unknown>;

  /** Patch ids user selected to apply. */
  @IsArray()
  @IsString({ each: true })
  selectedPatchIds!: string[];

  /** Idempotent Apply — retries must not create duplicate versions / double-charge. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}

export class RestoreLandingPageVersionDto {
  /** Optional note for the new “before restore” snapshot. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class LandingPageAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  pageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  device?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class SubmitLandingPageLeadDto {
  @IsObject()
  fields!: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  blockId?: string;

  /** Honeypot — must be empty */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  website?: string;

  @IsOptional()
  @IsObject()
  attribution?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  landingPageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  visitorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  device?: string;
}

export class TrackLandingPageEventDto {
  @IsIn([...EVENT_TYPES])
  eventType!: (typeof EVENT_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  visitorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  device?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  utmContent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  utmTerm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  referrer?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  /** Honeypot — bots only */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
