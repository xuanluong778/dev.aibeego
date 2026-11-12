/**
 * Landing Page — Business Profile types + autofill (tenant-scoped).
 * Does not overwrite user-edited fields unless force=true.
 */

import {
  type LandingPageBlock,
  type LandingPageLeadFormField,
  type LandingPageSpec,
} from './landing-page-types';
import { sanitizeLandingPageSpec } from './landing-page-lifecycle';
import type { LandingPageAiGoal } from './landing-page-generator';
import { LANDING_PAGE_AI_GOAL_LABELS } from './landing-page-generator';

export type LandingPageFieldSource = 'profile' | 'ai' | 'user';

export type LandingPageContentMeta = {
  fieldSources?: Record<string, LandingPageFieldSource>;
  profileAppliedAt?: string | null;
  lastAiAt?: string | null;
};

export type BusinessProfileData = {
  brandName?: string | null;
  companyName?: string | null;
  website?: string | null;
  industry?: string | null;
  description?: string | null;
  productService?: string | null;
  targetCustomer?: string | null;
  usp?: string | null;
  hotline?: string | null;
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  facebookUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  defaultCta?: string | null;
};

export type ApplyBusinessProfileOptions = {
  /** When true, overwrite even user-edited fields ("Điền lại"). */
  force?: boolean;
  pageGoal?: LandingPageAiGoal;
};

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return !v.trim();
  return false;
}

function getMeta(spec: LandingPageSpec): LandingPageContentMeta {
  const raw = (spec as LandingPageSpec & { meta?: LandingPageContentMeta }).meta;
  return raw && typeof raw === 'object'
    ? { ...raw, fieldSources: { ...(raw.fieldSources || {}) } }
    : { fieldSources: {} };
}

function setSource(
  meta: LandingPageContentMeta,
  key: string,
  source: LandingPageFieldSource,
  force: boolean,
) {
  const prev = meta.fieldSources?.[key];
  if (!force && prev === 'user') return;
  meta.fieldSources = { ...(meta.fieldSources || {}), [key]: source };
}

function canWrite(meta: LandingPageContentMeta, key: string, force: boolean): boolean {
  if (force) return true;
  return meta.fieldSources?.[key] !== 'user';
}

export function leadFormFieldsForGoal(goal: LandingPageAiGoal = 'lead'): LandingPageLeadFormField[] {
  const base: LandingPageLeadFormField[] = [
    { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true },
    { id: uid('f'), name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true },
  ];
  if (goal === 'signup' || goal === 'lead' || goal === 'sales' || goal === 'consult' || goal === 'event') {
    base.push({
      id: uid('f'),
      name: 'email',
      label: 'Email',
      fieldType: 'email',
      required: goal === 'signup',
    });
  }
  if (goal === 'sales' || goal === 'consult') {
    base.push({ id: uid('f'), name: 'need', label: 'Nhu cầu', fieldType: 'textarea', required: false });
  }
  if (goal === 'consult') {
    base.push({ id: uid('f'), name: 'note', label: 'Ghi chú', fieldType: 'textarea', required: false });
  }
  if (goal === 'event') {
    base.push({
      id: uid('f'),
      name: 'company',
      label: 'Công ty / đơn vị',
      fieldType: 'text',
      required: false,
    });
  }
  return base;
}

export function resolveDefaultCta(profile: BusinessProfileData): string {
  const custom = profile.defaultCta?.trim();
  if (custom) return custom.slice(0, 80);
  const hotline = profile.hotline?.trim();
  if (hotline) return `Gọi ${hotline}`.slice(0, 80);
  return 'Nhận tư vấn miễn phí';
}

export function businessProfileToAiBrief(
  profile: BusinessProfileData,
  overrides?: Partial<{
    productService: string;
    brandName: string;
    targetCustomer: string;
    pageGoal: LandingPageAiGoal;
    extraNotes: string;
  }>,
): {
  productService: string;
  brandName: string;
  targetCustomer: string;
  uspBenefits: string;
  pageGoal: LandingPageAiGoal;
  extraNotes: string;
  sourceUrl: string;
} {
  const brand =
    overrides?.brandName?.trim() || profile.brandName?.trim() || profile.companyName?.trim() || '';
  const product =
    overrides?.productService?.trim() ||
    profile.productService?.trim() ||
    profile.description?.trim() ||
    brand ||
    'Sản phẩm / dịch vụ';
  const audience =
    overrides?.targetCustomer?.trim() || profile.targetCustomer?.trim() || 'khách hàng mục tiêu';
  const usp = profile.usp?.trim() || profile.description?.trim() || '';
  const notes = [
    overrides?.extraNotes?.trim(),
    profile.industry ? `Ngành: ${profile.industry}` : '',
    profile.website ? `Website: ${profile.website}` : '',
    profile.hotline ? `Hotline: ${profile.hotline}` : '',
    profile.address ? `Địa chỉ: ${profile.address}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return {
    productService: product.slice(0, 200),
    brandName: brand.slice(0, 120),
    targetCustomer: audience.slice(0, 400),
    uspBenefits: usp.slice(0, 800),
    pageGoal: overrides?.pageGoal || 'lead',
    extraNotes: notes.slice(0, 1200),
    sourceUrl: (profile.website || '').slice(0, 2000),
  };
}

/**
 * Apply BusinessProfile onto LandingPageSpec.
 * Overwrites empty / template / AI / prior-profile fields.
 * Skips fields already marked `user` unless force=true ("Điền lại").
 */
export function applyBusinessProfileToSpec(
  spec: LandingPageSpec,
  profile: BusinessProfileData,
  options: ApplyBusinessProfileOptions = {},
): LandingPageSpec {
  const force = options.force === true;
  const goal = options.pageGoal || 'lead';
  const base = sanitizeLandingPageSpec(structuredClone(spec)) as LandingPageSpec & {
    meta?: LandingPageContentMeta;
  };
  const meta = getMeta(base);
  const brand = profile.brandName?.trim() || profile.companyName?.trim() || '';
  const cta = resolveDefaultCta(profile);
  const hotline = profile.hotline?.trim() || '';
  const email = profile.email?.trim() || '';
  const address = profile.address?.trim() || '';
  const website = profile.website?.trim() || '';
  const usp = profile.usp?.trim() || profile.description?.trim() || '';

  if (profile.brandColor?.trim() && canWrite(meta, 'themeTokens.primary', force)) {
    base.themeTokens = { ...base.themeTokens, primary: profile.brandColor.trim().slice(0, 32) };
    setSource(meta, 'themeTokens.primary', 'profile', force);
  }

  if (brand && canWrite(meta, 'seo.title', force)) {
    base.seo.title = `${brand}${profile.productService ? ` | ${profile.productService}` : ''}`.slice(
      0,
      120,
    );
    setSource(meta, 'seo.title', 'profile', force);
  }
  if ((usp || brand) && canWrite(meta, 'seo.metaDescription', force)) {
    base.seo.metaDescription = (usp || `${brand} — ${LANDING_PAGE_AI_GOAL_LABELS[goal]}`).slice(
      0,
      320,
    );
    setSource(meta, 'seo.metaDescription', 'profile', force);
  }

  const blocks = base.blocks.map((block) => {
    const next = { ...block } as LandingPageBlock & Record<string, unknown>;
    const key = (field: string) => `${block.id}.${field}`;

    if (block.type === 'Hero' || block.type === 'CTA') {
      if (brand && canWrite(meta, key('headline'), force)) {
        next.headline =
          block.type === 'Hero'
            ? `${brand}${profile.productService ? ` — ${profile.productService}` : ''}`.slice(0, 200)
            : (usp || brand).slice(0, 200);
        setSource(meta, key('headline'), 'profile', force);
      }
      if (usp && canWrite(meta, key('subheadline'), force)) {
        next.subheadline = usp.slice(0, 400);
        setSource(meta, key('subheadline'), 'profile', force);
      }
      if (canWrite(meta, key('ctaLabel'), force)) {
        next.ctaLabel = cta;
        setSource(meta, key('ctaLabel'), 'profile', force);
      }
      if (hotline && canWrite(meta, key('ctaUrl'), force)) {
        next.ctaUrl = `tel:${hotline.replace(/\s+/g, '')}`;
        setSource(meta, key('ctaUrl'), 'profile', force);
      }
      if (profile.logoUrl && block.type === 'Hero' && canWrite(meta, key('imageUrl'), force)) {
        next.imageUrl = profile.logoUrl;
        setSource(meta, key('imageUrl'), 'profile', force);
      }
    }

    if (block.type === 'Footer') {
      const parts = [brand || profile.companyName, hotline, email, address, website].filter(Boolean);
      if (parts.length && canWrite(meta, key('body'), force)) {
        next.body = parts.join(' · ').slice(0, 2000);
        setSource(meta, key('body'), 'profile', force);
      }
    }

    if (block.type === 'LeadForm') {
      if (canWrite(meta, key('fields'), force)) {
        next.fields = leadFormFieldsForGoal(goal);
        next.submitLabel = cta;
        if (force || isEmpty(next.headline) || meta.fieldSources?.[key('headline')] !== 'user') {
          next.headline =
            goal === 'event'
              ? 'Đăng ký tham dự'
              : goal === 'sales'
                ? 'Nhận báo giá / đặt mua'
                : 'Đăng ký nhận tư vấn';
          setSource(meta, key('headline'), 'profile', force);
        }
        setSource(meta, key('fields'), 'profile', force);
      }
    }

    if (block.type === 'Guarantee' && usp && canWrite(meta, key('body'), force)) {
      next.body = usp.slice(0, 2000);
      setSource(meta, key('body'), 'profile', force);
    }

    return next as LandingPageBlock;
  });

  let ensured = [...blocks];
  if (!ensured.some((b) => b.type === 'Footer')) {
    ensured.push({
      id: uid('footer'),
      type: 'Footer',
      enabled: true,
      spacing: 'sm',
      body: [brand, hotline, email, address].filter(Boolean).join(' · ') || '© Landing Page',
    });
    setSource(meta, 'footer.created', 'profile', force);
  }
  if (!ensured.some((b) => b.type === 'LeadForm')) {
    ensured.push({
      id: uid('lead'),
      type: 'LeadForm',
      enabled: true,
      spacing: 'md',
      headline: 'Đăng ký nhận tư vấn',
      submitLabel: cta,
      fields: leadFormFieldsForGoal(goal),
    });
    setSource(meta, 'lead.created', 'profile', force);
  }

  meta.profileAppliedAt = new Date().toISOString();
  const out = sanitizeLandingPageSpec({
    ...base,
    blocks: ensured,
  }) as LandingPageSpec & { meta?: LandingPageContentMeta };
  out.meta = meta;
  return out;
}

export function markLandingPageUserEdits(spec: LandingPageSpec, keys: string[]): LandingPageSpec {
  const next = structuredClone(spec) as LandingPageSpec & { meta?: LandingPageContentMeta };
  const meta = getMeta(next);
  for (const key of keys) {
    setSource(meta, key, 'user', true);
  }
  next.meta = meta;
  return next;
}

/** Mark fields as profile | ai | user (force). Used when user picks an Inline AI option. */
export function markLandingPageFieldSources(
  spec: LandingPageSpec,
  keys: string[],
  source: LandingPageFieldSource,
): LandingPageSpec {
  const next = structuredClone(spec) as LandingPageSpec & { meta?: LandingPageContentMeta };
  const meta = getMeta(next);
  for (const key of keys) {
    setSource(meta, key, source, true);
  }
  next.meta = meta;
  return next;
}

export function markLandingPageAiSources(spec: LandingPageSpec): LandingPageSpec {
  const next = structuredClone(spec) as LandingPageSpec & { meta?: LandingPageContentMeta };
  const meta = getMeta(next);
  meta.lastAiAt = new Date().toISOString();
  for (const block of next.blocks) {
    for (const field of ['headline', 'subheadline', 'body', 'ctaLabel'] as const) {
      const k = `${block.id}.${field}`;
      if (meta.fieldSources?.[k] === 'user') continue;
      if ((block as unknown as Record<string, unknown>)[field]) setSource(meta, k, 'ai', false);
    }
  }
  if (meta.fieldSources?.['seo.title'] !== 'user') setSource(meta, 'seo.title', 'ai', false);
  if (meta.fieldSources?.['seo.metaDescription'] !== 'user') {
    setSource(meta, 'seo.metaDescription', 'ai', false);
  }
  next.meta = meta;
  return next;
}

export function isBusinessProfileEmpty(profile: BusinessProfileData | null | undefined): boolean {
  if (!profile) return true;
  return ![
    profile.brandName,
    profile.companyName,
    profile.website,
    profile.productService,
    profile.targetCustomer,
    profile.usp,
    profile.hotline,
    profile.email,
  ].some((v) => typeof v === 'string' && v.trim());
}

/**
 * After AI regenerate: restore any fields the user previously customized.
 * Prefer stable block id; type fallback uses same-type ordinal (never first-CTA-wins).
 */
export function preserveUserEditedFields(
  previous: LandingPageSpec,
  next: LandingPageSpec,
): LandingPageSpec {
  const prevMeta = getMeta(previous);
  const sources = prevMeta.fieldSources || {};
  const userKeys = Object.entries(sources)
    .filter(([, v]) => v === 'user')
    .map(([k]) => k);
  if (!userKeys.length) {
    const marked = markLandingPageAiSources(next);
    return {
      ...marked,
      meta: {
        ...getMeta(marked),
        fieldSources: { ...sources, ...(getMeta(marked).fieldSources || {}) },
      },
    };
  }

  const out = structuredClone(next) as LandingPageSpec & { meta?: LandingPageContentMeta };
  const prevBlocks = new Map(previous.blocks.map((b) => [b.id, b]));
  /** Cache prev block id → next index so multi-field edits on one block stay glued. */
  const prevIdToNextIdx = new Map<string, number>();
  const usedNextIdx = new Set<number>();
  const remappedSources: Record<string, LandingPageFieldSource> = { ...sources };

  const sameTypeOrdinal = (blocks: LandingPageBlock[], id: string, type: string): number => {
    let n = 0;
    for (const b of blocks) {
      if (b.type !== type) continue;
      if (b.id === id) return n;
      n += 1;
    }
    return -1;
  };

  const resolveNextIdx = (prevBlock: LandingPageBlock): number => {
    const cached = prevIdToNextIdx.get(prevBlock.id);
    if (cached !== undefined) return cached;

    const byId = out.blocks.findIndex((b) => b.id === prevBlock.id);
    if (byId >= 0) {
      prevIdToNextIdx.set(prevBlock.id, byId);
      usedNextIdx.add(byId);
      return byId;
    }

    const ordinal = sameTypeOrdinal(previous.blocks, prevBlock.id, prevBlock.type);
    if (ordinal >= 0) {
      let seen = 0;
      for (let i = 0; i < out.blocks.length; i++) {
        if (out.blocks[i]!.type !== prevBlock.type) continue;
        if (seen === ordinal && !usedNextIdx.has(i)) {
          prevIdToNextIdx.set(prevBlock.id, i);
          usedNextIdx.add(i);
          return i;
        }
        seen += 1;
      }
    }

    // Last resort: first unused same-type block (still type-scoped — never cross CTA↔FAQ).
    const byType = out.blocks.findIndex((b, i) => b.type === prevBlock.type && !usedNextIdx.has(i));
    if (byType >= 0) {
      prevIdToNextIdx.set(prevBlock.id, byType);
      usedNextIdx.add(byType);
    }
    return byType;
  };

  for (const key of userKeys) {
    if (key === 'seo.title') {
      out.seo.title = previous.seo.title;
      continue;
    }
    if (key === 'seo.metaDescription') {
      out.seo.metaDescription = previous.seo.metaDescription;
      continue;
    }
    if (key === 'themeTokens.primary') {
      out.themeTokens.primary = previous.themeTokens.primary;
      continue;
    }
    const m = /^(.+)\.(headline|subheadline|body|ctaLabel|ctaUrl|imageUrl|fields|submitLabel)$/.exec(
      key,
    );
    if (!m) continue;
    const [, blockId, field] = m;
    const prevBlock = prevBlocks.get(blockId!);
    if (!prevBlock) continue;
    const idx = resolveNextIdx(prevBlock);
    if (idx < 0) {
      out.blocks.push(structuredClone(prevBlock));
      continue;
    }
    (out.blocks[idx] as unknown as Record<string, unknown>)[field!] = (
      prevBlock as unknown as Record<string, unknown>
    )[field!];
    const newKey = `${out.blocks[idx]!.id}.${field}`;
    if (newKey !== key) {
      remappedSources[newKey] = 'user';
      delete remappedSources[key];
    }
  }

  out.meta = {
    ...getMeta(out),
    fieldSources: {
      ...getMeta(markLandingPageAiSources(out)).fieldSources,
      ...remappedSources,
    },
    lastAiAt: new Date().toISOString(),
    profileAppliedAt: prevMeta.profileAppliedAt,
  };
  return out;
}
