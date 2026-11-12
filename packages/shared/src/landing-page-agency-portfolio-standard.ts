import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import { isRestaurantMenuRepresentative } from './landing-page-restaurant-representative';
import {isWebsiteRepresentative} from './landing-page-website-representative';
import { isLocalServiceRepresentative } from './landing-page-local-service-representative';

/** Persisted render contract, independent of catalog refreshes. Never inferred from slug/category. */
export const AGENCY_PORTFOLIO_RENDERER_VERSION = 'agency-portfolio-v2' as const;
export function isAgencyPortfolioStandard(spec: LandingPageSpec): boolean {
  return spec.meta?.rendererVersion === AGENCY_PORTFOLIO_RENDERER_VERSION;
}

/** Explicit persisted contracts that share version-safe canvas metadata and clone references. */
export function isVersionedLandingPageCanvasSpec(spec: LandingPageSpec): boolean {
  return isAgencyPortfolioStandard(spec) || isRestaurantMenuRepresentative(spec) || isLocalServiceRepresentative(spec) || isWebsiteRepresentative(spec);
}

/** Creation seed only. Never run against an existing user's draft or published spec. */
export function applyAgencyPortfolioStandard(
  template: LandingPageTemplateDefinition,
): LandingPageTemplateDefinition {
  if (template.slug !== 'agency-portfolio') return template;
  const asset = '/landing-page-assets/agency-portfolio-v2/';
  const blocks: LandingPageBlock[] = [
    {
      id: 'agency-header',
      type: 'Header',
      enabled: true,
      headline: 'Agency Portfolio',
      subheadline: 'CÙNG TRIỂN KHAI DỰ ÁN',
      body: 'Dịch vụ|Đầu ra|Quy trình|Hợp tác|FAQ',
      ctaLabel: 'Trao đổi dự án',
      ctaUrl: '#lead-form',
      background: '#0B1220',
    },
    {
      id: 'agency-hero',
      type: 'Hero',
      enabled: true,
      headline: 'Một đối tác cho website, nội dung và chiến dịch của bạn.',
      subheadline:
        'Cùng xác định phạm vi, đầu ra và cách phối hợp trước khi bắt đầu. Chọn dự án riêng hoặc hợp tác theo tháng.',
      body: 'DEMO · NỘI DUNG MINH HỌA',
      ctaLabel: 'Trao đổi dự án',
      ctaUrl: '#lead-form',
      trustPoints: [
        'Phạm vi thống nhất trước triển khai',
        'Đầu ra và mốc bàn giao rõ ràng',
        'Một đầu mối phối hợp',
      ],
      imageUrl: asset + 'hero-illustration.jpg',
      imageStyle: { alt: 'Ảnh minh họa hoạt động phối hợp.', fit: 'cover', position: '50% 48%' },
      background: '#0B1220',
    },
    {
      id: 'agency-benefits',
      type: 'Benefits',
      enabled: true,
      headline: 'Phối hợp rõ ràng từ brief đến bàn giao.',
      background: '#FAF7F0',
      items: [
        {
          id: 'brief',
          icon: 'brief',
          title: 'Một brief chung',
          description: 'Mục tiêu và thông điệp được dùng xuyên suốt các hạng mục.',
        },
        {
          id: 'scope',
          icon: 'scope',
          title: 'Phạm vi có thể đối chiếu',
          description: 'Hạng mục, đầu ra và mốc rà soát được thống nhất trước khi triển khai.',
        },
        {
          id: 'handoff',
          icon: 'folder',
          title: 'Bàn giao có cấu trúc',
          description: 'File và hướng dẫn được tổ chức để đội ngũ tiếp tục sử dụng.',
        },
      ],
    },
    {
      id: 'agency-services',
      type: 'Features',
      enabled: true,
      headline: 'Chọn hạng mục bạn cần hỗ trợ.',
      background: '#FFFFFF',
      items: [
        {
          id: 'website',
          icon: 'web',
          title: 'Website & landing page',
          description:
            'Xây dựng nội dung và giao diện để khách hiểu đề nghị và biết bước tiếp theo.',
        },
        {
          id: 'content',
          icon: 'pen',
          title: 'Nội dung & thiết kế',
          description: 'Phát triển thông điệp và bộ tài sản phù hợp với kênh sử dụng.',
        },
        {
          id: 'campaign',
          icon: 'campaign',
          title: 'Triển khai chiến dịch',
          description:
            'Phối hợp nội dung, trang đích và kế hoạch đo lường theo phạm vi thống nhất.',
        },
      ],
    },
    {
      id: 'agency-gallery',
      type: 'Gallery',
      enabled: true,
      headline: 'Ví dụ đầu ra có thể triển khai.',
      subheadline: 'Các hình dưới minh họa hạng mục bàn giao, không đại diện cho dự án khách hàng.',
      background: '#F3F5F4',
      items: [
        {
          id: 'demo-web',
          title: 'Trang giới thiệu dịch vụ',
          description: 'Bố cục nội dung và điểm liên hệ trong một trang.',
          role: 'GIAO DIỆN DEMO',
          imageUrl: asset + 'demo-1.png',
          imageStyle: { alt: 'Giao diện demo trang giới thiệu dịch vụ', fit: 'contain' },
        },
        {
          id: 'demo-content',
          title: 'Bộ nội dung chiến dịch',
          description: 'Minh họa thông điệp và các định dạng đầu ra.',
          role: 'MINH HỌA ĐẦU RA',
          imageUrl: asset + 'demo-2.png',
          imageStyle: { alt: 'Minh họa bộ nội dung chiến dịch', fit: 'contain' },
        },
        {
          id: 'demo-measure',
          title: 'Khung đo lường',
          description: 'Minh họa cách tổ chức chỉ số cần theo dõi.',
          role: 'GIAO DIỆN DEMO',
          imageUrl: asset + 'demo-3.png',
          imageStyle: { alt: 'Khung đo lường với dữ liệu demo', fit: 'contain' },
        },
        {
          id: 'demo-doc',
          title: 'Tài liệu bàn giao',
          description: 'Minh họa danh mục file và hướng dẫn sử dụng.',
          role: 'MINH HỌA ĐẦU RA',
          imageUrl: asset + 'demo-4.png',
          imageStyle: { alt: 'Minh họa tài liệu bàn giao', fit: 'contain' },
        },
      ],
    },
    {
      id: 'agency-process',
      type: 'Process',
      enabled: true,
      headline: 'Bốn bước phối hợp.',
      background: '#FFFFFF',
      items: [
        {
          id: 'step-brief',
          title: 'Trao đổi mục tiêu',
          description: 'Làm rõ nhu cầu, đối tượng và điều kiện triển khai.',
        },
        {
          id: 'step-scope',
          title: 'Chốt phạm vi',
          description: 'Thống nhất hạng mục, đầu ra và mốc rà soát.',
        },
        {
          id: 'step-review',
          title: 'Triển khai và rà soát',
          description: 'Phát triển đầu ra và phản hồi theo từng mốc.',
        },
        {
          id: 'step-handoff',
          title: 'Bàn giao và hướng dẫn',
          description: 'Tổng hợp file, tài liệu và bước tiếp theo.',
        },
      ],
    },
    {
      id: 'agency-pricing',
      type: 'Pricing',
      enabled: true,
      headline: 'Chọn cách hợp tác.',
      background: '#FAF7F0',
      plans: [
        {
          id: 'project',
          name: 'Theo dự án',
          period: 'MỘT PHẠM VI CỤ THỂ',
          price: 'Báo giá theo phạm vi',
          features: ['Hạng mục xác định', 'Mốc bàn giao', 'Phạm vi chỉnh sửa thống nhất'],
          ctaLabel: 'Trao đổi gói dự án',
          ctaUrl: '#lead-form',
        },
        {
          id: 'monthly',
          name: 'Theo tháng',
          period: 'PHỐI HỢP THEO KẾ HOẠCH',
          price: 'Báo giá theo kế hoạch',
          features: ['Danh mục công việc ưu tiên', 'Lịch rà soát định kỳ', 'Đầu mối phối hợp'],
          ctaLabel: 'Trao đổi hợp tác theo tháng',
          ctaUrl: '#lead-form',
          highlighted: true,
        },
      ],
    },
    {
      id: 'agency-faq',
      type: 'FAQ',
      enabled: true,
      headline: 'Thông tin trước khi gửi yêu cầu.',
      background: '#FFFFFF',
      items: [
        {
          id: 'faq-item',
          question: 'Có thể thuê riêng một hạng mục không?',
          answer:
            'Có thể bắt đầu từ website, nội dung hoặc chiến dịch. Phạm vi được thống nhất theo nhu cầu cụ thể.',
        },
        {
          id: 'faq-cost',
          question: 'Chi phí được xác định thế nào?',
          answer:
            'Báo giá dựa trên hạng mục, đầu ra, thời gian và cách phối hợp sau khi làm rõ yêu cầu.',
        },
        {
          id: 'faq-start',
          question: 'Khi nào có thể bắt đầu?',
          answer:
            'Thời điểm bắt đầu được xác nhận sau khi thống nhất phạm vi và khả năng tiếp nhận dự án.',
        },
        {
          id: 'faq-handoff',
          question: 'Tôi nhận được gì khi bàn giao?',
          answer:
            'Danh mục file, tài liệu hướng dẫn và quyền sử dụng được ghi rõ trong phạm vi hợp tác.',
        },
      ],
    },
    {
      id: 'agency-cta',
      type: 'CTA',
      enabled: true,
      headline: 'Bạn đang chuẩn bị một dự án mới?',
      subheadline: 'Chia sẻ mục tiêu và hạng mục cần hỗ trợ để bắt đầu trao đổi phạm vi phù hợp.',
      ctaLabel: 'Điền yêu cầu dự án',
      ctaUrl: '#lead-form',
      background: '#0B1220',
    },
    {
      id: 'agency-form',
      type: 'LeadForm',
      enabled: true,
      headline: 'Gửi yêu cầu trao đổi.',
      subheadline: 'Để lại thông tin liên hệ và mô tả nhu cầu dự án.',
      submitLabel: 'Gửi yêu cầu',
      successMessage: 'Đã nhận được yêu cầu của bạn.',
      footerText: 'Thông tin được dùng để liên hệ về yêu cầu này.',
      background: '#FAF7F0',
      formTheme: {
        background: '#FFFFFF',
        border: '1px solid #DDE1DF',
        headlineColor: '#0F172A',
        labelColor: '#0F172A',
        mutedColor: '#536172',
        inputBg: '#FFFFFF',
        inputBorder: '1px solid #B9C3CF',
        inputColor: '#0F172A',
        buttonBg: '#FF6B00',
        buttonColor: '#0B1220',
        radius: '14px',
        inputRadius: '7px',
        buttonRadius: '8px',
      },
      fields: [
        {
          id: 'field-name',
          name: 'name',
          label: 'Họ tên',
          fieldType: 'text',
          required: true,
          placeholder: 'Tên của bạn',
        },
        {
          id: 'field-phone',
          name: 'phone',
          label: 'Số điện thoại',
          fieldType: 'tel',
          required: true,
          placeholder: 'Số điện thoại liên hệ',
        },
        {
          id: 'field-email',
          name: 'email',
          label: 'Email',
          fieldType: 'email',
          required: false,
          placeholder: 'Email để nhận trao đổi',
        },
        {
          id: 'field-need',
          name: 'need',
          label: 'Nhu cầu dự án',
          fieldType: 'textarea',
          required: false,
          placeholder:
            'Mục tiêu, hạng mục cần hỗ trợ, thời điểm dự kiến và ngân sách nếu đã xác định.',
        },
      ],
    },
    {
      id: 'agency-footer',
      type: 'Footer',
      enabled: true,
      headline: 'Agency Portfolio',
      subheadline: 'Bản mẫu demo · Nội dung và đầu ra minh họa',
      body: '© 2026 Agency Portfolio.',
      ctaLabel: 'Về đầu trang',
      ctaUrl: '#top',
      background: '#0B1220',
    },
  ];
  return {
    ...template,
    thumbnail: asset + 'agency-portfolio-thumb.webp',
    previewLongImage: asset + 'agency-portfolio-long.webp',
    spec: {
      ...template.spec,
      seo: {...template.spec.seo, ogImage: asset + 'agency-portfolio-thumb.webp'},
      blocks,
      themeTokens: {
        ...template.spec.themeTokens,
        primary: '#FF6B00',
        button: '#FF6B00',
        secondary: '#0B1220',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        text: '#0F172A',
        muted: '#475569',
        fontFamily: '"Agency Portfolio Be Vietnam Pro", sans-serif',
        radius: '12px',
        containerWidth: '1152px',
      },
      meta: {
        ...template.spec.meta,
        rendererVersion: AGENCY_PORTFOLIO_RENDERER_VERSION,
        gallery: {...template.spec.meta?.gallery, thumbnail: asset + 'agency-portfolio-thumb.webp', previewLongImage: asset + 'agency-portfolio-long.webp'},
        ...(template.spec.meta?.architectureRecipe
          ? {
              architectureRecipe: {
                ...template.spec.meta.architectureRecipe,
                sectionSequence: blocks.map((b) => b.type),
                flowSteps: template.spec.meta.architectureRecipe.flowSteps.filter((step) =>
                  blocks.some((b) => b.type === step.block),
                ),
                formPlacement: 'late',
                proofType: 'illustrative-deliverables',
              },
            }
          : {}),
        layout: 'agency',
        category: 'agency',
      },
    },
  };
}

/** Resolve only the canonical creation seed. Saved pages never pass through this function.
 * Do not reinterpret tenant templates, HTML imports, managed packs or unknown catalog snapshots.
 */
export function agencyPortfolioCreationSeed(
  identity: { slug: string; isSystem: boolean; organizationId: string | null; managed?: boolean },
  stored: LandingPageSpec,
  canonical: LandingPageSpec,
): LandingPageSpec {
  const architectureBySlug: Record<string, string> = {
    'agency-portfolio-form': 'agency_brief_form',
    'agency-portfolio-faq': 'agency_faq_pitch',
    'agency-portfolio-gallery': 'agency_work_gallery',
    'agency-portfolio-minimal': 'agency_minimal_pitch',
    'agency-portfolio-trust': 'agency_trust_case',
    'agency-portfolio-process': 'agency_process_sprint',
    'agency-portfolio-cream-editorial': 'agency_cream_editorial',
    'agency-portfolio-modern-saas': 'agency_modern_saas',
    'agency-portfolio-split': 'agency_nav_services',
  };
  const recognized = identity.slug === 'agency-portfolio'
    ? canonical.meta?.architectureRecipe?.architectureId === 'agency_dark_direct'
    : architectureBySlug[identity.slug] !== undefined &&
      architectureBySlug[identity.slug] === canonical.meta?.architectureRecipe?.architectureId;
  return recognized && isAgencyPortfolioStandard(canonical) &&
    identity.isSystem &&
    identity.organizationId === null &&
    !identity.managed &&
    stored.meta?.catalogVersion === canonical.meta?.catalogVersion &&
    (!stored.meta?.rendererVersion ||
      stored.meta.rendererVersion === canonical.meta?.rendererVersion) &&
    !stored.meta?.htmlSource
    ? structuredClone(canonical)
    : stored;
}

/** Remap only references on pilot clones. Preserve text, media, CSS declarations and other values. */
export function remapAgencyPortfolioCloneIds(
  spec: LandingPageSpec,
  ids: Map<string, string>,
): LandingPageSpec {
  if (!isVersionedLandingPageCanvasSpec(spec)) return spec;
  const key = (s: string) =>
    s
      .split(/(::|:|\.)/)
      .map((p) => ids.get(p) || p)
      .join('');
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [
          key(k),
          (k === 'ctaUrl' || k === 'href') && typeof v === 'string' && v.startsWith('#')
            ? '#' + (ids.get(v.slice(1)) || v.slice(1))
            : visit(v),
        ]),
      );
    return value;
  }
  return visit(spec) as LandingPageSpec;
}

export function agencyPortfolioInlineStyle(
  spec: LandingPageSpec,
  key: string,
  viewport: 'desktop' | 'tablet' | 'mobile',
) {
  const base = spec.meta?.inlineTextStyles?.[key];
  const override = isVersionedLandingPageCanvasSpec(spec)
    ? spec.meta?.responsiveInlineTextStyles?.[key]?.[viewport]
    : undefined;
  return override ? { ...base, ...override } : base;
}
export function agencyPortfolioRenderMeta(
  spec: LandingPageSpec,
  viewport: 'desktop' | 'tablet' | 'mobile',
) {
  if (!isVersionedLandingPageCanvasSpec(spec) || !spec.meta?.responsiveInlineTextStyles) return spec.meta;
  const styles = { ...spec.meta.inlineTextStyles };
  for (const key of Object.keys(spec.meta.responsiveInlineTextStyles))
    styles[key] = agencyPortfolioInlineStyle(spec, key, viewport)!;
  return { ...spec.meta, inlineTextStyles: styles };
}
