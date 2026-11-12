import type { LandingPageBlock, LandingPageSpec } from './landing-page-types';
import { buildArchitectureRecipe } from './landing-page-template-foundation';

export const LOCAL_SERVICE_RENDERER_VERSION = 'local-service-v2';
export const isLocalServiceRepresentative = (spec: LandingPageSpec) =>
  spec.meta?.rendererVersion === LOCAL_SERVICE_RENDERER_VERSION;

/** Approved base design. Used for new template seeds only; never migrates saved pages. */
export function buildLocalServiceRepresentative(): LandingPageSpec {
  const blocks: LandingPageBlock[] = [
    {
      id: 'service-header',
      type: 'Header',
      enabled: true,
      headline: 'Gần Nhà',
      subheadline: 'DỊCH VỤ CHO KHÔNG GIAN SỐNG',
      body: 'Hạng mục|Phạm vi|Cách làm|Hỏi đáp',
      ctaLabel: 'Trao đổi nhu cầu',
      ctaUrl: '#service-request',
    },
    {
      id: 'service-hero',
      type: 'Hero',
      enabled: true,
      headline: 'Việc trong nhà, trao đổi cho rõ.',
      subheadline:
        'Chia sẻ hạng mục và khu vực của bạn. Cùng xác định phạm vi, chi phí và thời gian phù hợp trước khi bắt đầu.',
      body: 'MẪU DỊCH VỤ ĐỊA PHƯƠNG · NỘI DUNG MINH HỌA',
      ctaLabel: 'Gửi yêu cầu tư vấn',
      ctaUrl: '#service-request',
      imageUrl: '/landing-page-assets/local-service-v2/home-service.svg',
      imageStyle: {
        alt: 'Minh họa hạng mục sửa chữa, lắp đặt và bảo trì tại nhà; không phải ảnh đội ngũ thực tế.',
        fit: 'contain',
      },
      trustPoints: ['Thống nhất phạm vi', 'Xác nhận chi phí', 'Hẹn lịch phù hợp'],
    },
    {
      id: 'service-offers',
      type: 'Features',
      enabled: true,
      headline: 'Bạn cần hỗ trợ việc gì?',
      subheadline:
        'Danh mục minh họa để bắt đầu trao đổi. Đơn vị cung cấp cần xác nhận hạng mục được nhận trước khi sử dụng mẫu.',
      items: [
        {
          id: 'service-repair',
          title: 'Sửa chữa nhỏ',
          description:
            'Mô tả hiện trạng và phần việc cần xem xét; phương án cụ thể được đề xuất sau khi làm rõ yêu cầu.',
          icon: 'repair',
        },
        {
          id: 'service-install',
          title: 'Lắp đặt thiết bị',
          description:
            'Cho biết thiết bị, điều kiện vị trí và việc đã chuẩn bị để kiểm tra khả năng nhận việc.',
          icon: 'install',
        },
        {
          id: 'service-maintain',
          title: 'Bảo trì định kỳ',
          description:
            'Trao đổi danh mục thiết bị, tình trạng sử dụng và lịch dự kiến để thống nhất đầu việc.',
          icon: 'maintain',
        },
      ],
    },
    {
      id: 'service-scope',
      type: 'Benefits',
      enabled: true,
      headline: 'Những điều cần rõ trước khi hẹn.',
      subheadline:
        'Bản mẫu chưa xác nhận khu vực phục vụ, bảng giá hay lịch trống của một đơn vị cụ thể.',
      items: [
        {
          id: 'scope-area',
          title: 'Khu vực phục vụ',
          description:
            'Nêu quận/huyện hoặc khu vực cần hỗ trợ. Khả năng di chuyển và phí đi lại, nếu có, cần được xác nhận.',
        },
        {
          id: 'scope-price',
          title: 'Phạm vi & chi phí',
          description:
            'Làm rõ công việc, vật tư, hạng mục loại trừ và chi phí khảo sát trước khi đồng ý thực hiện.',
        },
        {
          id: 'scope-time',
          title: 'Lịch hẹn & điều kiện',
          description:
            'Thời gian dự kiến, điều kiện đổi lịch và nội dung bảo hành chỉ áp dụng theo thỏa thuận được xác nhận.',
        },
      ],
    },
    {
      id: 'service-process',
      type: 'Process',
      enabled: true,
      headline: 'Từ yêu cầu đến đầu việc rõ ràng.',
      items: [
        {
          id: 'process-request',
          title: 'Chia sẻ nhu cầu',
          description: 'Chọn hạng mục, khu vực và mô tả ngắn hiện trạng cần hỗ trợ.',
        },
        {
          id: 'process-confirm',
          title: 'Thống nhất đề xuất',
          description: 'Trao đổi khả năng nhận việc, phạm vi, chi phí và lịch phù hợp.',
        },
        {
          id: 'process-handoff',
          title: 'Thực hiện & đối chiếu',
          description:
            'Chỉ triển khai sau khi thống nhất; đối chiếu đầu việc và hướng dẫn tiếp theo khi bàn giao.',
        },
      ],
    },
    {
      id: 'service-faq',
      type: 'FAQ',
      enabled: true,
      headline: 'Câu hỏi trước khi gửi yêu cầu.',
      items: [
        {
          id: 'faq-booking',
          question: 'Gửi form có phải đã đặt lịch không?',
          answer:
            'Chưa. Đơn vị cung cấp cần liên hệ xác nhận khả năng nhận việc, thời gian và các điều kiện liên quan.',
        },
        {
          id: 'faq-price',
          question: 'Có báo giá ngay trên trang không?',
          answer:
            'Bản mẫu không có bảng giá đã xác nhận. Chi phí phụ thuộc phạm vi, hiện trạng và vật tư; cần thống nhất trước khi thực hiện.',
        },
        {
          id: 'faq-area',
          question: 'Có phục vụ khu vực của tôi không?',
          answer:
            'Hãy nêu khu vực cần hỗ trợ. Đơn vị vận hành trang cần cập nhật danh sách địa bàn và kiểm tra khả năng nhận từng yêu cầu.',
        },
        {
          id: 'faq-warranty',
          question: 'Chính sách bảo hành và đổi lịch thế nào?',
          answer:
            'Nội dung bảo hành, điều kiện đổi lịch và các trường hợp loại trừ cần được xác nhận trong thỏa thuận; không mặc định áp dụng từ bản mẫu.',
        },
      ],
    },
    {
      id: 'service-request',
      type: 'LeadForm',
      enabled: true,
      headline: 'Nói rõ việc bạn cần.',
      subheadline: 'Điền thông tin để trao đổi. Yêu cầu chưa xác nhận lịch hẹn hoặc chi phí.',
      submitLabel: 'Gửi yêu cầu trao đổi',
      successMessage: 'Đã nhận yêu cầu trao đổi. Lịch hẹn và chi phí cần được xác nhận riêng.',
      footerText: 'Thông tin được dùng để liên hệ về yêu cầu này.',
      formTheme: {
        background: '#fff',
        border: '1px solid #cbd7e2',
        labelColor: '#15334b',
        mutedColor: '#4d6477',
        inputBg: '#fff',
        inputBorder: '1px solid #9cb0c2',
        inputColor: '#15334b',
        buttonBg: '#115b8a',
        buttonColor: '#fff',
        radius: '12px',
        buttonRadius: '8px',
      },
      fields: [
        {
          id: 'request-name',
          name: 'name',
          label: 'Tên liên hệ',
          fieldType: 'text',
          required: true,
          placeholder: 'Tên để đơn vị liên hệ',
        },
        {
          id: 'request-phone',
          name: 'phone',
          label: 'Số điện thoại',
          fieldType: 'tel',
          required: true,
          placeholder: 'Số điện thoại liên hệ',
        },
        {
          id: 'request-service',
          name: 'service',
          label: 'Hạng mục cần hỗ trợ',
          fieldType: 'select',
          required: true,
          options: ['Sửa chữa nhỏ', 'Lắp đặt thiết bị', 'Bảo trì định kỳ', 'Cần trao đổi thêm'],
        },
        {
          id: 'request-area',
          name: 'area',
          label: 'Khu vực cần hỗ trợ',
          fieldType: 'text',
          required: true,
          placeholder: 'Quận/huyện hoặc khu vực — chưa cần địa chỉ chi tiết',
        },
        {
          id: 'request-time',
          name: 'preferred_time',
          label: 'Thời gian mong muốn',
          fieldType: 'text',
          required: false,
          placeholder: 'Ví dụ: chiều thứ Bảy',
        },
        {
          id: 'request-note',
          name: 'note',
          label: 'Mô tả nhu cầu',
          fieldType: 'textarea',
          required: false,
          placeholder: 'Hạng mục, hiện trạng và điều cần trao đổi.',
        },
      ],
    },
    {
      id: 'service-footer',
      type: 'Footer',
      enabled: true,
      headline: 'Gần Nhà',
      subheadline: 'BẢN MẪU · CHƯA NHẬN LỊCH THỰC TẾ',
      body: 'Cập nhật tên đơn vị, khu vực, giờ làm việc và thông tin liên hệ đã xác nhận trước khi xuất bản.',
      ctaLabel: 'Về đầu trang',
      ctaUrl: '#service-header',
    },
  ];
  return {
    version: 1,
    theme: 'CORPORATE',
    themeTokens: {
      primary: '#115b8a',
      button: '#115b8a',
      secondary: '#15334b',
      background: '#f5f8fb',
      surface: '#fff',
      text: '#15334b',
      muted: '#4d6477',
      fontFamily: '"Local Service Be Vietnam Pro", sans-serif',
      radius: '12px',
      containerWidth: '1160px',
    },
    seo: {
      title: 'Gần Nhà — mẫu dịch vụ địa phương',
      metaDescription: 'Bản đại diện để duyệt hạng mục, khu vực và yêu cầu tư vấn dịch vụ.',
      robotsIndex: false,
    },
    blocks,
    meta: {
      rendererVersion: LOCAL_SERVICE_RENDERER_VERSION,
      category: 'service',
      layout: 'service',
      designFamily: 'local',
      conversionGoal: 'lead',
      architectureRecipe: buildArchitectureRecipe({
        architectureId: 'local_service_review_v2',
        purpose: 'Hạng mục → khu vực/phạm vi → yêu cầu trao đổi',
        sectionSequence: blocks.map((b) => b.type),
        layout: 'service',
        designFamily: 'local',
        conversionGoal: 'lead',
        ctaStrategy: 'quote',
        proofType: 'illustrative-service',
        formPlacement: 'late',
        blockVariants: {
          Hero: 'split-left',
          Features: 'icon-grid',
          Benefits: 'editorial-list',
          Process: 'steps',
          FAQ: 'accordion',
          LeadForm: 'card',
        },
      }),
    },
  };
}
