/**
 * Landing Page template section-flow recipes — distinct layouts per variant.
 * Used by catalog expander; does not touch doctor/publish/Facebook.
 */

import type { LandingPageBlock, LandingPageTheme } from './landing-page-types';
import { LANDING_PAGE_THEME_PRESETS } from './landing-page-types';
import {
  LANDING_PAGE_PLACEHOLDER_TESTIMONIALS,
  type LandingPageLayout,
} from './landing-page-ui';
import { defaultLeadFormFields } from './landing-page-lifecycle';
import { verifiedBackdropUrl } from './landing-page-verified-backdrops';

export const LANDING_PAGE_TEMPLATE_FLOW_IDS = [
  'full_conversion',
  'trust_usp_first',
  'pricing_forward',
  'process_story',
  'gallery_showcase',
  'video_lead',
  'faq_authority',
  'header_split',
  'early_form',
  'minimal_cta',
] as const;

export type LandingPageTemplateFlowId = (typeof LANDING_PAGE_TEMPLATE_FLOW_IDS)[number];

export type LandingPageTemplateBadge = 'new' | 'popular' | 'high_conversion';

export type TemplateFlowMeta = {
  id: LandingPageTemplateFlowId;
  label: string;
  /** Suffix for slug when index > 0; empty for primary (legacy slug). */
  slugSuffix: string;
  nameSuffix: string;
  descriptionHint: string;
  theme: LandingPageTheme;
  /** Override layout (else keep category default). */
  layout?: LandingPageLayout;
  badges: LandingPageTemplateBadge[];
};

/** 10 distinct flows — different section order / hero / CTA / form placement. */
export const LANDING_PAGE_TEMPLATE_FLOWS: TemplateFlowMeta[] = [
  {
    id: 'full_conversion',
    label: 'Full conversion',
    slugSuffix: '',
    nameSuffix: '',
    descriptionHint: 'Đầy đủ sections: hero → lợi ích → tính năng → quy trình → social → FAQ → form',
    theme: 'MODERN',
    badges: ['popular', 'high_conversion'],
  },
  {
    id: 'trust_usp_first',
    label: 'Trust first',
    slugSuffix: 'trust',
    nameSuffix: '· Trust First',
    descriptionHint: 'USP & trust lên đầu; form sau cam kết',
    theme: 'PREMIUM',
    layout: 'service',
    badges: ['high_conversion'],
  },
  {
    id: 'pricing_forward',
    label: 'Pricing forward',
    slugSuffix: 'pricing',
    nameSuffix: '· Pricing First',
    descriptionHint: 'Bảng giá sớm + FAQ xử lý objection',
    theme: 'CORPORATE',
    layout: 'saas',
    badges: ['popular'],
  },
  {
    id: 'process_story',
    label: 'Process story',
    slugSuffix: 'process',
    nameSuffix: '· Process Story',
    descriptionHint: 'Kể chuyện bằng quy trình trước lợi ích',
    theme: 'MINIMAL',
    layout: 'agency',
    badges: [],
  },
  {
    id: 'gallery_showcase',
    label: 'Gallery',
    slugSuffix: 'gallery',
    nameSuffix: '· Gallery',
    descriptionHint: 'Hero + gallery/lookbook trước CTA',
    theme: 'BOLD',
    layout: 'product',
    badges: ['new'],
  },
  {
    id: 'video_lead',
    label: 'Video lead',
    slugSuffix: 'video',
    nameSuffix: '· Video',
    descriptionHint: 'Video demo ngay dưới hero',
    theme: 'MODERN',
    layout: 'lead_gen',
    badges: ['new'],
  },
  {
    id: 'faq_authority',
    label: 'FAQ authority',
    slugSuffix: 'faq',
    nameSuffix: '· FAQ Heavy',
    descriptionHint: 'FAQ dày + guarantee trước form',
    theme: 'CORPORATE',
    layout: 'classic',
    badges: [],
  },
  {
    id: 'header_split',
    label: 'Header split',
    slugSuffix: 'split',
    nameSuffix: '· Split Hero',
    descriptionHint: 'Header nav + hero 2 cột chuyên nghiệp',
    theme: 'PREMIUM',
    layout: 'agency',
    badges: ['popular'],
  },
  {
    id: 'early_form',
    label: 'Early form',
    slugSuffix: 'form',
    nameSuffix: '· Early Form',
    descriptionHint: 'Form đăng ký sớm ngay sau hero/benefits',
    theme: 'BOLD',
    layout: 'lead_gen',
    badges: ['high_conversion'],
  },
  {
    id: 'minimal_cta',
    label: 'Minimal CTA',
    slugSuffix: 'minimal',
    nameSuffix: '· Minimal',
    descriptionHint: 'Ít section, CTA mạnh, tập trung chuyển đổi',
    theme: 'MINIMAL',
    layout: 'classic',
    badges: ['new'],
  },
];

export function uid(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

export function pickBlock(blocks: LandingPageBlock[], type: LandingPageBlock['type']): LandingPageBlock | undefined {
  return blocks.find((b) => b.type === type);
}

export function cloneBlock(b: LandingPageBlock, idSuffix: string): LandingPageBlock {
  return { ...structuredClone(b), id: `${b.id}_${idSuffix}` } as LandingPageBlock;
}

export function ensureGallery(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Gallery') || pickBlock(from, 'Product');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('gallery', 1),
    type: 'Gallery',
    enabled: true,
    spacing: 'md',
    headline: 'Hình ảnh nổi bật',
    subheadline: 'Campaign highlights & visual proof',
    items: [1, 2, 3, 4].map((i) => ({
      id: uid('g', i),
      title: `Campaign ${i}`,
      description: 'Case visual — performance & creative direction.',
      imageUrl: null,
    })),
  };
}

export function ensureVideo(flowId: string): LandingPageBlock {
  return {
    id: uid('video', 1),
    type: 'Video',
    enabled: true,
    spacing: 'lg',
    headline: 'Xem giới thiệu nhanh',
    // Empty URL → renderer shows poster shell (avoid broken embed placeholders).
    videoUrl: '',
    posterUrl: verifiedBackdropUrl('webinar', 0),
  };
}

export function ensurePricing(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Pricing');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('pricing', 1),
    type: 'Pricing',
    enabled: true,
    spacing: 'md',
    headline: 'Bảng giá',
    plans: [
      {
        id: uid('plan', 1),
        name: 'Starter',
        price: 'Liên hệ',
        features: ['Gói cơ bản', 'Hỗ trợ email'],
        ctaLabel: 'Chọn gói',
      },
      {
        id: uid('plan', 2),
        name: 'Pro',
        price: 'Liên hệ',
        features: ['Đầy đủ tính năng', 'Hỗ trợ ưu tiên', 'Onboarding'],
        ctaLabel: 'Chọn gói',
        highlighted: true,
      },
    ],
  };
}

export function ensureFeatures(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Features');
  if (existing) return cloneBlock(existing, flowId);
  const benefits = pickBlock(from, 'Benefits') as
    | { items?: Array<{ title: string; description?: string }> }
    | undefined;
  const benefitItems = Array.isArray(benefits?.items) ? benefits!.items! : [];
  const mapped = benefitItems.slice(0, 3).map((it, i) => ({
    id: uid('feat', i + 1),
    title: it.title,
    description: it.description || 'Điểm khác biệt',
  }));
  const items =
    mapped.length > 0
      ? mapped
      : [
        { id: uid('feat', 1), title: 'Cam kết chất lượng', description: 'Quy trình chuẩn, minh bạch từng bước triển khai.' },
        { id: uid('feat', 2), title: 'Phản hồi nhanh', description: 'Team hỗ trợ trong giờ làm việc — không để lead nguội.' },
        { id: uid('feat', 3), title: 'Kết quả đo được', description: 'KPI và milestone rõ trước khi bắt đầu hợp tác.' },
      ];
  return {
    id: uid('features', 1),
    type: 'Features',
    enabled: true,
    spacing: 'md',
    headline: 'Điểm khác biệt',
    items,
  };
}

export function ensureProcess(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Process');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('process', 1),
    type: 'Process',
    enabled: true,
    spacing: 'md',
    headline: 'Quy trình',
    items: [
      { id: uid('st', 1), title: 'Bước 1', description: 'Đăng ký / liên hệ' },
      { id: uid('st', 2), title: 'Bước 2', description: 'Tư vấn & đề xuất' },
      { id: uid('st', 3), title: 'Bước 3', description: 'Triển khai / nhận kết quả' },
    ],
  };
}

export function ensureTestimonials(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Testimonials');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('tm', 1),
    type: 'Testimonials',
    enabled: true,
    spacing: 'md',
    headline: 'Social proof',
    items: LANDING_PAGE_PLACEHOLDER_TESTIMONIALS.map((t, i) => ({
      id: uid('t', i + 1),
      avatarUrl: null,
      ...t,
    })),
  };
}

export function ensureFaq(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'FAQ');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('faq', 1),
    type: 'FAQ',
    enabled: true,
    spacing: 'md',
    headline: 'Câu hỏi thường gặp',
    items: [
      { id: uid('q', 1), question: 'Bắt đầu như thế nào?', answer: 'Điền form — đội ngũ liên hệ trong 24h.' },
      { id: uid('q', 2), question: 'Có hỗ trợ sau bán?', answer: 'Có — kênh hỗ trợ rõ ràng trên trang.' },
      { id: uid('q', 3), question: 'Chi phí ra sao?', answer: 'Xem bảng giá hoặc nhận báo giá qua form.' },
    ],
  };
}

export function ensureGuarantee(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'Guarantee');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('guar', 1),
    type: 'Guarantee',
    enabled: true,
    spacing: 'sm',
    headline: 'Cam kết',
    body: 'Cam kết minh bạch — hỗ trợ rõ ràng, không phát sinh phí ẩn.',
  };
}

export function ensureHeader(brand: string, flowId: string): LandingPageBlock {
  return {
    id: uid('header', 1),
    type: 'Header',
    enabled: true,
    spacing: 'none',
    headline: brand,
    body: 'Trang chủ|Dịch vụ|Bảng giá|Liên hệ',
    ctaLabel: 'Liên hệ ngay',
    ctaUrl: '#lead-form',
  };
}

export function ensureLeadForm(from: LandingPageBlock[], flowId: string, early: boolean): LandingPageBlock {
  const existing = pickBlock(from, 'LeadForm');
  if (existing) {
    const c = cloneBlock(existing, flowId);
    return { ...c, spacing: early ? 'sm' : c.spacing || 'md' };
  }
  return {
    id: 'lead-form',
    type: 'LeadForm',
    enabled: true,
    spacing: early ? 'sm' : 'md',
    headline: 'Đăng ký nhận tư vấn',
    subheadline: 'Để lại thông tin — phản hồi trong 24 giờ.',
    submitLabel: 'Gửi thông tin',
    successMessage: 'Cảm ơn bạn! Đội ngũ sẽ liên hệ sớm.',
    fields: defaultLeadFormFields(),
  };
}

export function ensureCta(from: LandingPageBlock[], flowId: string): LandingPageBlock {
  const existing = pickBlock(from, 'CTA');
  if (existing) return cloneBlock(existing, flowId);
  const hero = pickBlock(from, 'Hero') as { ctaLabel?: string } | undefined;
  const ctaLabel = hero?.ctaLabel?.trim() || 'Đăng ký ngay';
  return {
    id: uid('cta', 1),
    type: 'CTA',
    enabled: true,
    spacing: 'md',
    headline: 'Sẵn sàng bắt đầu?',
    subheadline: 'Chỉ mất 1 phút để đăng ký.',
    ctaLabel,
    ctaUrl: '#lead-form',
  };
}

export function ensureFooter(from: LandingPageBlock[], flowId: string, name: string): LandingPageBlock {
  const existing = pickBlock(from, 'Footer');
  if (existing) return cloneBlock(existing, flowId);
  return {
    id: uid('footer', 1),
    type: 'Footer',
    enabled: true,
    spacing: 'sm',
    headline: name,
    body: `© ${new Date().getFullYear()} ${name}`,
  };
}

export function tuneHero(
  from: LandingPageBlock[],
  flow: TemplateFlowMeta,
  category: string,
): LandingPageBlock {
  const hero = pickBlock(from, 'Hero');
  const base = hero
    ? cloneBlock(hero, flow.id)
    : ({
        id: uid('hero', 1),
        type: 'Hero' as const,
        enabled: true,
        spacing: 'lg' as const,
        headline: 'Headline mạnh mẽ',
        subheadline: 'Subheadline chuyển đổi',
        ctaLabel: 'Đăng ký ngay',
        ctaUrl: '#lead-form',
        imageUrl: null,
      } satisfies LandingPageBlock);

  if (category === 'webinar' || flow.layout === 'webinar') {
    return {
      ...base,
      type: 'Hero',
      eventDate: (base as { eventDate?: string }).eventDate || 'Thứ 5 · tuần này',
      eventTime: (base as { eventTime?: string }).eventTime || '19:30 – 21:00',
      eventFormat: (base as { eventFormat?: string }).eventFormat || 'Online · Zoom',
      trustPoints:
        (base as { trustPoints?: string[] }).trustPoints ||
        ['Framework áp dụng ngay', 'Case study thực tế', 'Tài liệu kèm theo'],
    };
  }
  if (flow.id === 'trust_usp_first') {
    return {
      ...base,
      type: 'Hero',
      trustPoints: ['Uy tín rõ ràng', 'Quy trình minh bạch', 'Hỗ trợ nhanh'],
      body: (base as { body?: string }).body || 'Trust · USP · Kết quả đo được',
    };
  }
  if (flow.id === 'minimal_cta') {
    return {
      ...base,
      type: 'Hero',
      spacing: 'lg',
      subheadline: ((base as { subheadline?: string }).subheadline || '').slice(0, 120),
    };
  }
  return { ...base, type: 'Hero' };
}

/**
 * Rebuild block stack for a flow — different order & composition than siblings.
 */
export function buildBlocksForFlow(input: {
  sourceBlocks: LandingPageBlock[];
  flow: TemplateFlowMeta;
  category: string;
  brandName: string;
}): LandingPageBlock[] {
  const { sourceBlocks, flow, category, brandName } = input;
  const hero = tuneHero(sourceBlocks, flow, category);
  const benefits = pickBlock(sourceBlocks, 'Benefits')
    ? cloneBlock(pickBlock(sourceBlocks, 'Benefits')!, flow.id)
    : {
        id: uid('ben', 1),
        type: 'Benefits' as const,
        enabled: true,
        spacing: 'md' as const,
        headline: 'Lợi ích nổi bật',
        items: [
          { id: uid('b', 1), title: 'Tiết kiệm thời gian', description: 'Quy trình gọn — giảm back-and-forth không cần thiết.' },
          { id: uid('b', 2), title: 'Rõ ràng chi phí', description: 'Phạm vi và báo giá minh bạch trước khi bắt đầu.' },
          { id: uid('b', 3), title: 'Hỗ trợ tận tâm', description: 'Team phản hồi nhanh trong giờ làm việc.' },
        ],
      };

  const speaker =
    category === 'webinar'
      ? pickBlock(sourceBlocks, 'Speaker')
        ? cloneBlock(pickBlock(sourceBlocks, 'Speaker')!, flow.id)
        : ({
            id: uid('sp', 1),
            type: 'Speaker' as const,
            enabled: true,
            spacing: 'md' as const,
            headline: 'Diễn giả',
            items: [
              {
                id: uid('spitem', 1),
                title: '[Tên diễn giả]',
                role: '[Chức danh]',
                description: '[Bio ngắn — thay bằng thông tin thật]',
              },
            ],
          } satisfies LandingPageBlock)
      : null;

  switch (flow.id) {
    case 'full_conversion':
      return [
        hero,
        benefits,
        ensureFeatures(sourceBlocks, flow.id),
        ensureProcess(sourceBlocks, flow.id),
        ...(speaker ? [speaker] : []),
        ensureTestimonials(sourceBlocks, flow.id),
        ensureGuarantee(sourceBlocks, flow.id),
        ensureFaq(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'trust_usp_first':
      return [
        ensureHeader(brandName, flow.id),
        hero,
        ensureFeatures(sourceBlocks, flow.id),
        benefits,
        ensureTestimonials(sourceBlocks, flow.id),
        ensureGuarantee(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureFaq(sourceBlocks, flow.id),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'pricing_forward':
      return [
        hero,
        benefits,
        ensurePricing(sourceBlocks, flow.id),
        ensureFeatures(sourceBlocks, flow.id),
        ensureFaq(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'process_story':
      return [
        hero,
        ensureProcess(sourceBlocks, flow.id),
        benefits,
        ensureFeatures(sourceBlocks, flow.id),
        ensureTestimonials(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'gallery_showcase':
      return [
        hero,
        ensureGallery(sourceBlocks, flow.id),
        benefits,
        ensurePricing(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureFaq(sourceBlocks, flow.id),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'video_lead':
      return [
        hero,
        ensureVideo(flow.id),
        benefits,
        ensureProcess(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureTestimonials(sourceBlocks, flow.id),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'faq_authority':
      return [
        hero,
        benefits,
        ensureFaq(sourceBlocks, flow.id),
        ensureFeatures(sourceBlocks, flow.id),
        ensureGuarantee(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'header_split':
      return [
        ensureHeader(brandName, flow.id),
        hero,
        ensureFeatures(sourceBlocks, flow.id),
        ensureProcess(sourceBlocks, flow.id),
        ensurePricing(sourceBlocks, flow.id),
        ensureTestimonials(sourceBlocks, flow.id),
        ensureLeadForm(sourceBlocks, flow.id, false),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'early_form':
      return [
        hero,
        benefits,
        ensureLeadForm(sourceBlocks, flow.id, true),
        ensureFeatures(sourceBlocks, flow.id),
        ensureTestimonials(sourceBlocks, flow.id),
        ensureFaq(sourceBlocks, flow.id),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    case 'minimal_cta':
      return [
        hero,
        benefits,
        ensureLeadForm(sourceBlocks, flow.id, true),
        ensureGuarantee(sourceBlocks, flow.id),
        ensureCta(sourceBlocks, flow.id),
        ensureFooter(sourceBlocks, flow.id, brandName),
      ];
    default:
      return sourceBlocks;
  }
}

export function applyThemeTokens(theme: LandingPageTheme) {
  return { ...LANDING_PAGE_THEME_PRESETS[theme] };
}

/** Public asset paths — WebP preferred; SVG fallback during generation. */
export function landingPageTemplateImagePaths(slug: string): {
  thumbnail: string;
  previewLongImage: string;
} {
  return {
    thumbnail: `/landing-pages/templates/${slug}-thumb.webp`,
    previewLongImage: `/landing-pages/templates/${slug}-long.webp`,
  };
}
