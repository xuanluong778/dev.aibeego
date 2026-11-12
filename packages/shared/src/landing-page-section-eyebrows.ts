/**
 * Category-level section eyebrow labels (kicker above h2).
 * Data-driven — not per-slug.
 */

import type { LandingPageBlock, LandingPageCategory } from './landing-page-types';

const AGENCY_EYEBROWS: Partial<Record<LandingPageBlock['type'], string>> = {
  Features: 'Dịch vụ',
  Benefits: 'Lợi ích',
  Gallery: 'Portfolio',
  Process: 'Quy trình',
  Pricing: 'Đầu tư',
  Testimonials: 'Khách hàng',
  FAQ: 'Hỏi đáp',
  LeadForm: 'Bắt đầu',
  CTA: 'Tiếp theo',
  Video: 'Showreel',
  Guarantee: 'Cam kết',
};

export function resolveSectionEyebrow(
  category: LandingPageCategory | string | undefined,
  blockType: LandingPageBlock['type'],
): string | undefined {
  if (category === 'agency') return AGENCY_EYEBROWS[blockType];
  return undefined;
}
