/**
 * Commercial content layer for the system template catalog (gallery-v22).
 *
 * Applied once, at the very end of catalog expansion, to NEW catalog definitions only.
 * It never runs when a saved page is loaded, so customer pages are never rewritten.
 *
 *  - Customer-facing Vietnamese copy per industry (no design/technical meta sentences).
 *  - Industry-correct lead forms (no "Công ty / Quy mô team" on course/coaching/etc.).
 *  - No invented reviews, statistics, countdowns, or "[Tên]" placeholders: those sections are
 *    removed instead of being filled with fake data.
 *  - Section order, variants, slugs and block ids come from the architecture and are untouched.
 */
import type {
  LandingPageBlock,
  LandingPageLeadFormField,
  LandingPageListItem,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import { verifiedBackdropUrl, getVerifiedBackdropPhotoIds } from './landing-page-verified-backdrops';
import { COMMERCIAL_PACKS_A } from './landing-page-commercial-packs-a';
import { COMMERCIAL_PACKS_B } from './landing-page-commercial-packs-b';
import { COMMERCIAL_PACKS_C } from './landing-page-commercial-packs-c';
import { COMMERCIAL_PACKS_D } from './landing-page-commercial-packs-d';
import type { CommercialPack, FieldSpec, Pair } from './landing-page-commercial-types';

export type { CommercialPack, FieldSpec, Pair } from './landing-page-commercial-types';

const PACKS: Record<string, CommercialPack> = {
  ...COMMERCIAL_PACKS_A,
  ...COMMERCIAL_PACKS_B,
  ...COMMERCIAL_PACKS_C,
  ...COMMERCIAL_PACKS_D,
};

export function listCommercialPackCategories(): string[] {
  return Object.keys(PACKS);
}

type Angle = 'primary' | 'trust' | 'price' | 'process' | 'proof' | 'faq' | 'direct' | 'minimal';

/** Flow id (from the architecture) → the conversion angle the Hero should lead with. */
function angleOf(flowId: string): Angle {
  const f = flowId.toLowerCase();
  if (f === 'primary' || !f) return 'primary';
  if (/faq/.test(f)) return 'faq';
  if (/pric|kit|package|retainer|compare|fee|offer|plan|cost|ticket/.test(f)) return 'price';
  if (/process|step|how|routine|roadmap|journey|timeline|build|story|work-process|engagement/.test(f))
    return 'process';
  if (/gallery|lookbook|showcase|portfolio|case|job-proof|proof|reel|video|demo|tutorial|runway|trailer|thought|visual|social/.test(f))
    return 'proof';
  if (/form|early|booking-first|book|reserve|preorder|quick|audit/.test(f)) return 'direct';
  if (/minimal|clean|soft/.test(f)) return 'minimal';
  return 'trust';
}

function slug(prefix: string, i: number): string {
  return `${prefix}_${i + 1}`;
}

function items(prefix: string, pairs: Pair[], count?: number): LandingPageListItem[] {
  return pairs.slice(0, count ?? pairs.length).map(([title, description], i) => ({
    id: slug(prefix, i),
    title,
    description,
  }));
}

function fieldsFrom(specs: FieldSpec[]): LandingPageLeadFormField[] {
  return specs.map((s, i) => ({
    id: `f_${s.name}_${i + 1}`,
    name: s.name,
    label: s.label,
    fieldType: s.type,
    required: Boolean(s.required),
    ...(s.placeholder ? { placeholder: s.placeholder } : null),
    ...(s.options ? { options: s.options } : null),
  }));
}

function heroCopy(pack: CommercialPack, angle: Angle) {
  const base = pack.hero;
  switch (angle) {
    case 'primary':
    case 'minimal':
      return { h: base.h, s: base.s, cta: base.cta };
    case 'faq':
      return {
        h: `Giải đáp trước khi bạn ${pack.verb}`,
        s: `Những câu hỏi thường gặp về ${pack.noun}, trả lời ngắn gọn và rõ ràng.`,
        cta: base.cta,
      };
    case 'direct':
      return {
        h: base.h,
        s: 'Để lại thông tin ngay bên dưới — chúng tôi liên hệ lại và tư vấn đúng nhu cầu của bạn.',
        cta: pack.form.submit,
      };
    default: {
      const a = pack.angles[angle];
      return { h: a[0], s: a[1], cta: base.cta };
    }
  }
}

function heroImage(category: string, variantIndex: number): string {
  return verifiedBackdropUrl(category, variantIndex);
}

function imageUrlAt(category: string, index: number): string {
  const ids = getVerifiedBackdropPhotoIds(category);
  return `https://images.unsplash.com/${ids[Math.abs(index) % ids.length]}?auto=format&fit=crop&w=900&h=640&q=70`;
}

/** Items with a photo (used by image-card variants; icon variants ignore imageUrl). */
function itemsWithImages(
  prefix: string,
  pairs: Pair[],
  category: string,
  variantIndex: number,
  count?: number,
): LandingPageListItem[] {
  return items(prefix, pairs, count).map((it, i) => ({
    ...it,
    imageUrl: imageUrlAt(category, variantIndex + 1 + i),
    imageStyle: { alt: it.title, fit: 'cover' as const },
  }));
}

function galleryItems(
  pack: CommercialPack,
  category: string,
  variantIndex: number,
  max?: number,
): LandingPageListItem[] {
  const pool = getVerifiedBackdropPhotoIds(category).length;
  // Avoid repeating photos inside one gallery; tiny pools still show 3 cards so no card is left alone.
  const unique = Math.max(3, pool - 1);
  const count = Math.min(max ?? pack.gallery.items.length, pack.gallery.items.length, unique);
  const even = count > 4 ? 6 : count;
  return pack.gallery.items.slice(0, Math.min(count, even)).map(([title, description], i) => ({
    id: slug('gal', i),
    title,
    description,
    imageUrl: imageUrlAt(category, variantIndex + 1 + i),
    imageStyle: { alt: title, fit: 'cover' as const },
  }));
}

function newBlock<T extends LandingPageBlock>(b: T): LandingPageBlock {
  return b;
}

/** Rewrite one block with commercial copy. Returns null to drop it. */
function rewriteBlock(
  block: LandingPageBlock,
  ctx: {
    pack: CommercialPack;
    category: string;
    variantIndex: number;
    angle: Angle;
    seen: Record<string, number>;
    hasGallery: boolean;
    hasHeroImageDefault: boolean;
  },
): LandingPageBlock | null {
  const { pack, category, variantIndex, angle } = ctx;
  ctx.seen[block.type] = (ctx.seen[block.type] || 0) + 1;
  const n = ctx.seen[block.type]!;
  const b = block as Record<string, unknown> & LandingPageBlock;
  switch (block.type) {
    case 'Testimonials':
    case 'Countdown':
    case 'Speaker':
      return null;
    case 'Video': {
      if (ctx.hasGallery) return null;
      return newBlock({
        id: block.id,
        type: 'Gallery',
        enabled: true,
        spacing: block.spacing,
        variant: 'featured',
        style: block.style,
        headline: pack.gallery.h,
        subheadline: pack.gallery.s,
        items: galleryItems(pack, category, variantIndex, 3),
      } as LandingPageBlock);
    }
    case 'Header':
      return { ...b, headline: pack.brand, body: pack.nav.join(' | '), ctaLabel: pack.hero.cta } as LandingPageBlock;
    case 'Hero': {
      const c = heroCopy(pack, angle);
      return {
        ...b,
        headline: c.h,
        subheadline: c.s,
        ctaLabel: c.cta,
        ctaUrl: '#lead-form',
        body: undefined,
        trustPoints: pack.hero.trust,
        imageUrl: heroImage(category, variantIndex),
        imageStyle: { ...(b as { imageStyle?: object }).imageStyle, alt: pack.heroAlt, fit: 'cover' },
        eventDate: pack.eventMeta?.[0],
        eventTime: pack.eventMeta?.[1],
        eventFormat: pack.eventMeta?.[2],
      } as unknown as LandingPageBlock;
    }
    case 'Benefits':
      return {
        ...b,
        headline: n === 1 ? pack.benefits.h : pack.features.h,
        subheadline: n === 1 ? pack.benefits.s : pack.features.s,
        items: itemsWithImages('ben', n === 1 ? pack.benefits.items : pack.features.items, category, variantIndex, 4),
      } as LandingPageBlock;
    case 'Features':
      return {
        ...b,
        headline: pack.features.h,
        subheadline: pack.features.s,
        items: itemsWithImages('fea', pack.features.items, category, variantIndex, 4),
      } as LandingPageBlock;
    case 'Product':
      return {
        ...b,
        headline: pack.features.h,
        subheadline: pack.features.s,
        items: itemsWithImages('prd', pack.features.items, category, variantIndex, 4),
      } as LandingPageBlock;
    case 'Process':
      return {
        ...b,
        headline: pack.process.h,
        subheadline: pack.process.s,
        items: items('step', pack.process.items, 4),
      } as LandingPageBlock;
    case 'Gallery':
      return {
        ...b,
        headline: pack.gallery.h,
        subheadline: pack.gallery.s,
        items: galleryItems(pack, category, variantIndex, 6),
      } as LandingPageBlock;
    case 'Pricing': {
      if (!pack.pricing) return null;
      return {
        ...b,
        headline: pack.pricing.h,
        subheadline: pack.pricing.s,
        plans: pack.pricing.plans.map((p, i) => ({
          id: slug('plan', i),
          name: p.name,
          price: p.price,
          period: p.period,
          features: p.features,
          highlighted: Boolean(p.highlighted),
          ctaLabel: p.cta || pack.hero.cta,
        })),
      } as LandingPageBlock;
    }
    case 'FAQ':
      return {
        ...b,
        headline: pack.faq.h,
        items: pack.faq.items.map(([question, answer], i) => ({ id: slug('faq', i), question, answer })),
      } as LandingPageBlock;
    case 'Guarantee':
      return { ...b, headline: pack.guarantee[0], body: pack.guarantee[1], subheadline: undefined } as LandingPageBlock;
    case 'CTA':
      return {
        ...b,
        headline: n === 1 ? pack.cta.h : 'Sẵn sàng bắt đầu?',
        body: n === 1 ? pack.cta.b : 'Để lại thông tin, chúng tôi sẽ liên hệ lại trong giờ làm việc.',
        subheadline: undefined,
        ctaLabel: pack.cta.label,
        ctaUrl: '#lead-form',
      } as LandingPageBlock;
    case 'LeadForm':
      return {
        ...b,
        headline: pack.form.h,
        subheadline: pack.form.s,
        submitLabel: pack.form.submit,
        successMessage: pack.form.success,
        footerText: pack.form.footer,
        fields: fieldsFrom(pack.form.fields),
      } as LandingPageBlock;
    case 'Footer':
      return { ...b, headline: pack.brand, body: pack.footer, subheadline: undefined } as LandingPageBlock;
    default:
      return block;
  }
}

function heroBlock(pack: CommercialPack, category: string, variantIndex: number, angle: Angle): LandingPageBlock {
  const c = heroCopy(pack, angle);
  return {
    id: 'hero_commercial',
    type: 'Hero',
    enabled: true,
    spacing: 'lg',
    variant: 'centered',
    headline: c.h,
    subheadline: c.s,
    ctaLabel: c.cta,
    ctaUrl: '#lead-form',
    trustPoints: pack.hero.trust,
    imageUrl: heroImage(category, variantIndex),
    imageStyle: { alt: pack.heroAlt, fit: 'cover' },
  } as LandingPageBlock;
}

export function applyCommercialContent(
  def: LandingPageTemplateDefinition,
  variantIndex: number,
): LandingPageTemplateDefinition {
  const pack = PACKS[def.category];
  if (!pack) return def;
  const flowId = String(def.spec.meta?.gallery?.flowId || 'primary');
  const angle = angleOf(flowId);
  const ctx = {
    pack,
    category: def.category,
    variantIndex,
    angle,
    seen: {} as Record<string, number>,
    hasGallery: def.spec.blocks.some((b) => b.type === 'Gallery'),
    hasHeroImageDefault: true,
  };
  let blocks = def.spec.blocks
    .map((b) => rewriteBlock(structuredClone(b), ctx))
    .filter((b): b is LandingPageBlock => Boolean(b));
  if (!blocks.some((b) => b.type === 'Hero')) {
    const at = blocks[0]?.type === 'Header' ? 1 : 0;
    blocks.splice(at, 0, heroBlock(pack, def.category, variantIndex, angle));
  }
  // Two CTA/Guarantee/FAQ-heavy flows may end up with a LeadForm-less page; keep one form always.
  if (!blocks.some((b) => b.type === 'LeadForm')) {
    const footerAt = blocks.findIndex((b) => b.type === 'Footer');
    const form = rewriteBlock(
      {
        id: 'lead_commercial',
        type: 'LeadForm',
        enabled: true,
        spacing: 'lg',
        variant: 'split',
        fields: [],
      } as unknown as LandingPageBlock,
      ctx,
    )!;
    blocks.splice(footerAt < 0 ? blocks.length : footerAt, 0, form);
  }
  const hint: Record<Angle, string> = {
    primary: '',
    trust: 'Mở đầu bằng thông tin giúp khách yên tâm. ',
    price: 'Đưa lựa chọn và mức giá lên sớm. ',
    process: 'Dẫn khách đi qua từng bước làm việc. ',
    proof: 'Hình ảnh thực tế làm điểm nhấn. ',
    faq: 'Giải đáp thắc mắc trước khi đăng ký. ',
    direct: 'Biểu mẫu đăng ký ngay đầu trang. ',
    minimal: 'Gọn nhẹ, tập trung vào một hành động. ',
  };
  const description = `${hint[angle]}${pack.description}`.slice(0, 280);
  return {
    ...def,
    description,
    spec: {
      ...def.spec,
      seo: {
        ...def.spec.seo,
        metaDescription: description.slice(0, 160),
      },
      blocks,
      meta: {
        ...def.spec.meta,
        templateCopyVersion: 'vi-VN-v1',
      },
    },
  };
}
