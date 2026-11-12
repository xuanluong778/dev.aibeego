/**
 * Landing Page UI layout variants + social-proof safety (no fake publish data).
 * Additive — does not change doctor/AI/publish API contracts.
 */

import type { LandingPageCategory, LandingPageSpec, LandingPageTestimonial } from './landing-page-types';

export const LANDING_PAGE_LAYOUTS = [
  'classic',
  'webinar',
  'lead_gen',
  'service',
  'course',
  'saas',
  'product',
  'local',
  'agency',
] as const;
export type LandingPageLayout = (typeof LANDING_PAGE_LAYOUTS)[number];

export function isLandingPageLayout(v: unknown): v is LandingPageLayout {
  return typeof v === 'string' && (LANDING_PAGE_LAYOUTS as readonly string[]).includes(v);
}

/** Map template category → distinct layout (not just color). */
export function layoutForCategory(category: LandingPageCategory | string | undefined): LandingPageLayout {
  switch (category) {
    case 'webinar':
      return 'webinar';
    case 'lead_magnet':
    case 'ebook':
    case 'quote':
    case 'demo':
      return 'lead_gen';
    case 'service':
    case 'spa':
    case 'clinic':
    case 'coaching':
      return 'service';
    case 'course':
      return 'course';
    case 'saas':
      return 'saas';
    case 'product':
    case 'cosmetics':
    case 'fashion':
      return 'product';
    case 'restaurant':
    case 'real_estate':
      return 'local';
    case 'agency':
    case 'consulting':
    case 'seo':
    case 'website':
      return 'agency';
    default:
      return 'classic';
  }
}

export function resolveLandingPageLayout(spec: LandingPageSpec, categoryHint?: string): LandingPageLayout {
  const fromMeta = spec.meta?.layout;
  if (isLandingPageLayout(fromMeta)) return fromMeta;
  if (categoryHint) return layoutForCategory(categoryHint);
  return 'classic';
}

const PLACEHOLDER_RE =
  /[\[\{]|tên khách|chức danh|nội dung đánh giá|placeholder|your name|jane doe|john doe|khách hàng mẫu|sample customer|lorem ipsum/i;

/** True when testimonial is editor placeholder — hide on public publish view. */
export function isPlaceholderTestimonial(t: Pick<LandingPageTestimonial, 'author' | 'quote' | 'role'>): boolean {
  const blob = `${t.author || ''} ${t.quote || ''} ${t.role || ''}`;
  if (!blob.trim()) return true;
  if (PLACEHOLDER_RE.test(blob)) return true;
  if (/^\[[^\]]+\]$/.test((t.author || '').trim())) return true;
  return false;
}

export function filterPublishableTestimonials(
  items: LandingPageTestimonial[],
  mode: 'preview' | 'public',
): LandingPageTestimonial[] {
  if (mode === 'preview') return items;
  return items.filter((t) => !isPlaceholderTestimonial(t) && t.quote.trim() && t.author.trim());
}

/** Speaker placeholder — hide on public until real bio/name is filled. */
export function isPlaceholderSpeaker(item: {
  title?: string;
  description?: string;
  role?: string;
}): boolean {
  const blob = `${item.title || ''} ${item.description || ''} ${item.role || ''}`;
  if (!blob.trim()) return true;
  if (PLACEHOLDER_RE.test(blob)) return true;
  if (/^\[[^\]]+\]$/.test((item.title || '').trim())) return true;
  return false;
}

export function filterPublishableSpeakers<T extends { title?: string; description?: string; role?: string }>(
  items: T[],
  mode: 'preview' | 'public',
): T[] {
  if (mode === 'preview') return items;
  return items.filter((it) => !isPlaceholderSpeaker(it) && (it.title || '').trim());
}

/** Safe template seed — never invents real customer names/reviews. */
export const LANDING_PAGE_PLACEHOLDER_TESTIMONIALS: Array<{
  quote: string;
  author: string;
  role: string;
}> = [
  {
    quote: 'Quy trình rõ ràng — team phản hồi nhanh, đúng cam kết trên landing.',
    author: 'Khách hàng doanh nghiệp',
    role: 'Verified review',
  },
  {
    quote: 'Trải nghiệm mượt từ form đến follow-up — không phải chờ callback vô hạn.',
    author: 'Marketing lead',
    role: 'B2B services',
  },
];
