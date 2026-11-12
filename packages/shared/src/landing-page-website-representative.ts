import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import { buildArchitectureRecipe } from './landing-page-template-foundation';
export const WEBSITE_BRIEF_RENDERER_VERSION = 'website-brief-v2' as const;
export const isWebsiteRepresentative = (spec: LandingPageSpec) =>
  spec.meta?.rendererVersion === WEBSITE_BRIEF_RENDERER_VERSION;
/** Review representative only. Does not replace any of the ten Website catalog entries. */
export function buildWebsiteRepresentative(seed: LandingPageTemplateDefinition): LandingPageSpec {
  const blocks: LandingPageBlock[] = [
    {
      id: 'website-header',
      type: 'Header',
      enabled: true,
      headline: 'Nếp Web',
      subheadline: 'WEBSITE STUDIO · BẢN MẪU',
      body: 'Phạm vi|Bàn giao|Lựa chọn',
      ctaLabel: 'Gửi brief',
      ctaUrl: '#website-brief',
    },
    {
      id: 'website-hero',
      type: 'Hero',
      enabled: true,
      variant: 'split-left',
      headline: 'Xây website từ cấu trúc đến bàn giao.',
      subheadline:
        'Bắt đầu bằng mục tiêu, nội dung và phạm vi. Cùng thống nhất cách quản trị, kiểm thử và tiếp quản trước khi triển khai.',
      body: '01 / WEBSITE CÓ KẾ HOẠCH',
      ctaLabel: 'Trao đổi yêu cầu website',
      ctaUrl: '#website-brief',
      imageUrl: '/landing-page-assets/website-brief-v2/blueprint.svg',
      imageStyle: {
        alt: 'Minh họa cấu trúc website, không phải dự án khách hàng đã bàn giao.',
        fit: 'contain',
      },
      trustPoints: [
        'Cấu trúc có thể đối chiếu',
        'Phạm vi được xác nhận',
        'Quyền quản trị được làm rõ',
      ],
    },
    {
      id: 'website-deliverables',
      type: 'Features',
      enabled: true,
      variant: 'editorial-list',
      headline: 'Đầu ra để cùng đối chiếu.',
      subheadline:
        'Danh mục minh họa. Hạng mục và tiêu chí nghiệm thu cần được thống nhất theo từng dự án.',
      items: [
        {
          id: 'web-map',
          title: 'Sơ đồ nội dung',
          description:
            'Danh sách trang, đường đi và hành động chính để khách tìm được điều cần biết.',
        },
        {
          id: 'web-interface',
          title: 'Giao diện & nội dung',
          description:
            'Bố cục phù hợp thương hiệu, cách trình bày trên mobile và trách nhiệm cung cấp nội dung.',
        },
        {
          id: 'web-ownership',
          title: 'Tài liệu tiếp quản',
          description:
            'Làm rõ quyền quản trị, tên miền, hosting, mã nguồn và hướng dẫn trong phạm vi bàn giao.',
        },
      ],
    },
    {
      id: 'website-workflow',
      type: 'Process',
      enabled: true,
      variant: 'steps',
      headline: 'Ba mốc làm rõ trước khi phát hành.',
      items: [
        {
          id: 'web-brief',
          title: 'Chốt brief & phạm vi',
          description: 'Xác nhận mục tiêu, người dùng, danh sách trang và các tích hợp cần thiết.',
        },
        {
          id: 'web-check',
          title: 'Thiết kế & kiểm tra',
          description: 'Rà nội dung, responsive, form, liên kết và các tiêu chí đã thống nhất.',
        },
        {
          id: 'web-handover',
          title: 'Bàn giao & vận hành',
          description:
            'Đối chiếu đầu ra, quyền truy cập và trách nhiệm bảo trì; thống nhất kế hoạch phát hành.',
        },
      ],
    },
    {
      id: 'website-scope',
      type: 'Pricing',
      enabled: true,
      variant: 'comparison',
      headline: 'Chọn cách bắt đầu để nhận đề xuất.',
      subheadline:
        'Không phải bảng giá đã xác nhận. Chi phí và tiến độ phụ thuộc brief và phạm vi.',
      plans: [
        {
          id: 'web-single',
          name: 'Một trang tập trung',
          price: 'Xác nhận sau brief',
          features: [
            'Một mục tiêu chuyển đổi',
            'Cấu trúc nội dung của một trang',
            'Thống nhất form và bước tiếp theo',
          ],
          ctaLabel: 'Trao đổi phạm vi một trang',
          ctaUrl: '#website-brief',
        },
        {
          id: 'web-multi',
          name: 'Nhiều trang nội dung',
          price: 'Xác nhận sau brief',
          features: [
            'Sơ đồ trang và điều hướng',
            'Thống nhất CMS và quyền quản trị',
            'Đối chiếu nội dung, tích hợp và bàn giao',
          ],
          ctaLabel: 'Trao đổi phạm vi nhiều trang',
          ctaUrl: '#website-brief',
          highlighted: true,
        },
      ],
    },
    {
      id: 'website-faq',
      type: 'FAQ',
      enabled: true,
      variant: 'accordion',
      headline: 'Làm rõ các phần thường bị bỏ sót.',
      items: [
        {
          id: 'web-hosting',
          question: 'Tên miền và hosting đã được bao gồm chưa?',
          answer:
            'Cần xác nhận riêng chi phí, chủ sở hữu, tài khoản quản lý và thời hạn gia hạn trong đề xuất.',
        },
        {
          id: 'web-content',
          question: 'Ai chuẩn bị nội dung và hình ảnh?',
          answer:
            'Thống nhất phần được cung cấp, phần cần biên soạn và quyền sử dụng tài nguyên trước khi triển khai.',
        },
        {
          id: 'web-cms',
          question: 'Có thể tự cập nhật sau bàn giao không?',
          answer:
            'Khả năng cập nhật, CMS, phân quyền và hướng dẫn sử dụng cần được ghi rõ trong phạm vi dự án.',
        },
        {
          id: 'web-seo',
          question: 'SEO và hiệu suất được đánh giá thế nào?',
          answer:
            'Thống nhất tiêu chí đo và cách kiểm tra theo dự án; bản mẫu không cam kết thứ hạng tìm kiếm hoặc một điểm hiệu suất cố định.',
        },
      ],
    },
    {
      id: 'website-brief',
      type: 'LeadForm',
      enabled: true,
      headline: 'Mô tả website bạn cần.',
      subheadline: 'Chọn loại website và nêu mục tiêu để bắt đầu trao đổi phạm vi.',
      submitLabel: 'Gửi yêu cầu trao đổi',
      successMessage: 'Đã nhận yêu cầu. Báo giá, phạm vi và tiến độ cần được xác nhận riêng.',
      footerText: 'Thông tin được dùng để trao đổi về yêu cầu website này.',
      formTheme: {
        background: '#fff',
        border: '1px solid #b7c2ba',
        labelColor: '#183330',
        mutedColor: '#506461',
        inputBg: '#fff',
        inputBorder: '1px solid #a5b2a9',
        inputColor: '#183330',
        buttonBg: '#b84721',
        buttonColor: '#fff',
        radius: '8px',
      },
      fields: [
        { id: 'web-name', name: 'name', label: 'Tên liên hệ', fieldType: 'text', required: true },
        {
          id: 'web-phone',
          name: 'phone',
          label: 'Số điện thoại',
          fieldType: 'tel',
          required: true,
        },
        {
          id: 'web-type',
          name: 'project_type',
          label: 'Loại website',
          fieldType: 'select',
          required: true,
          options: [
            'Trang giới thiệu',
            'Landing page',
            'Website nhiều nội dung',
            'Cần trao đổi thêm',
          ],
        },
        {
          id: 'web-current',
          name: 'current_url',
          label: 'Website hiện tại',
          fieldType: 'text',
          required: false,
          placeholder: 'URL nếu có',
        },
        {
          id: 'web-goal',
          name: 'goal',
          label: 'Mục tiêu chính',
          fieldType: 'textarea',
          required: true,
          placeholder: 'Khách cần hiểu hoặc thực hiện điều gì trên website?',
        },
        {
          id: 'web-note',
          name: 'note',
          label: 'Phạm vi cần trao đổi',
          fieldType: 'textarea',
          required: false,
        },
      ],
    },
    {
      id: 'website-footer',
      type: 'Footer',
      enabled: true,
      headline: 'Nếp Web',
      subheadline: 'BẢN MẪU MINH HỌA · CHƯA NHẬN DỰ ÁN THỰC TẾ',
      body: 'Cập nhật tên đơn vị, năng lực, điều kiện và thông tin liên hệ được xác nhận trước khi sử dụng.',
      ctaLabel: 'Về đầu trang',
      ctaUrl: '#website-header',
    },
  ];
  return {
    version: 1,
    theme: 'MINIMAL',
    themeTokens: {
      primary: '#b84721',
      button: '#b84721',
      secondary: '#183330',
      background: '#f5f3ed',
      surface: '#fff',
      text: '#183330',
      muted: '#506461',
      fontFamily: '"Website Be Vietnam Pro", sans-serif',
      radius: '8px',
      containerWidth: '1120px',
    },
    seo: {
      title: 'Nếp Web — mẫu đại diện dịch vụ website',
      metaDescription: 'Cấu trúc, phạm vi, kiểm thử và bàn giao website; bản mẫu để duyệt.',
      robotsIndex: false,
    },
    blocks,
    meta: {
      rendererVersion: WEBSITE_BRIEF_RENDERER_VERSION,
      catalogVersion: seed.spec.meta?.catalogVersion,
      category: 'website',
      layout: 'classic',
      designFamily: 'editorial',
      conversionGoal: 'lead',
      architectureRecipe: buildArchitectureRecipe({
        architectureId: 'website_brief_pilot_v2',
        purpose: 'Brief → đầu ra → kiểm thử/bàn giao → phạm vi → yêu cầu website',
        sectionSequence: blocks.map((b) => b.type),
        layout: 'classic',
        designFamily: 'editorial',
        conversionGoal: 'lead',
        ctaStrategy: 'quote',
        proofType: 'illustrative-blueprint',
        formPlacement: 'late',
        blockVariants: {
          Hero: 'split-left',
          Features: 'editorial-list',
          Process: 'steps',
          Pricing: 'comparison',
          FAQ: 'accordion',
          LeadForm: 'card',
        },
      }),
    },
  };
}
