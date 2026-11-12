import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import { buildArchitectureRecipe } from './landing-page-template-foundation';

export const RESTAURANT_MENU_RENDERER_VERSION = 'restaurant-menu-v2';
export function isRestaurantMenuRepresentative(spec: LandingPageSpec): boolean {
  return spec.meta?.rendererVersion === RESTAURANT_MENU_RENDERER_VERSION;
}

/** Approved base design. Used for new template seeds only; never migrates saved pages. */
export function buildRestaurantRepresentative(
  seed: LandingPageTemplateDefinition,
): LandingPageSpec {
  const asset = '/landing-page-assets/restaurant-menu-v2/';
  const blocks: LandingPageBlock[] = [
    {
      id: 'restaurant-header',
      type: 'Header',
      enabled: true,
      headline: 'Bếp & Bàn',
      subheadline: 'KHÔNG GIAN CHO NHỮNG CUỘC GẶP',
      body: 'Thực đơn|Không gian|Đặt bàn',
      ctaLabel: 'Yêu cầu đặt bàn',
      ctaUrl: '#restaurant-booking',
    },
    {
      id: 'restaurant-hero',
      type: 'Hero',
      enabled: true,
      variant: 'split-left',
      headline: 'Một bữa ngon. Một cuộc gặp đáng nhớ.',
      subheadline:
        'Cùng nhau chọn món, dành thời gian trò chuyện và tận hưởng bữa ăn theo cách của bạn.',
      body: 'BẢN MẪU NHÀ HÀNG · NỘI DUNG MINH HỌA',
      ctaLabel: 'Gửi yêu cầu đặt bàn',
      ctaUrl: '#restaurant-booking',
      imageUrl: asset + 'dining.jpg',
      imageStyle: {
        alt: 'Ảnh minh họa không gian ăn uống, không phải nhà hàng đang nhận đặt bàn.',
        fit: 'cover',
      },
      trustPoints: [
        'Xem món trước khi chọn',
        'Trao đổi nhu cầu của nhóm',
        'Chờ xác nhận tình trạng bàn',
      ],
    },
    {
      id: 'restaurant-menu',
      type: 'Product',
      enabled: true,
      variant: 'editorial-list',
      headline: 'Chọn một hương vị cho cuộc hẹn.',
      subheadline:
        'Gợi ý cấu trúc thực đơn. Món, thành phần và giá cần được nhà hàng cập nhật trước khi sử dụng.',
      items: [
        {
          id: 'menu-seasonal',
          title: 'Món theo mùa',
          description:
            'Giới thiệu nguyên liệu và cách chế biến của món đang phục vụ. Giá theo thực đơn được xác nhận.',
        },
        {
          id: 'menu-sharing',
          title: 'Món cùng chia sẻ',
          description:
            'Dành cho bàn ăn nhiều người; trao đổi khẩu phần và số lượng món trước khi gọi.',
        },
        {
          id: 'menu-vegetarian',
          title: 'Lựa chọn thực vật',
          description:
            'Hỏi trước về thành phần, nước dùng và khả năng chuẩn bị theo nhu cầu ăn uống.',
        },
        {
          id: 'menu-drinks',
          title: 'Đồ uống & món kết',
          description:
            'Bổ sung đồ uống và món tráng miệng phù hợp với bữa ăn; danh mục tùy thời điểm.',
        },
      ],
    },
    {
      id: 'restaurant-space',
      type: 'Gallery',
      enabled: true,
      variant: 'grid',
      headline: 'Chọn góc gặp gỡ của bạn.',
      subheadline:
        'Ảnh minh họa không gian và cách trình bày; không đại diện cho địa điểm hoặc thực đơn đang kinh doanh.',
      items: [
        {
          id: 'space-table',
          title: 'Bữa tối cùng nhau',
          description: 'Một gợi ý về cách sắp xếp bàn và trải nghiệm bữa ăn.',
          imageUrl: asset + 'plate.jpg',
          imageStyle: { alt: 'Ảnh minh họa cách trình bày bữa ăn.', fit: 'cover' },
        },
        {
          id: 'space-room',
          title: 'Không gian trò chuyện',
          description: 'Trao đổi trước nếu cần bàn cho nhóm hoặc một dịp đặc biệt.',
          imageUrl: asset + 'room.jpg',
          imageStyle: { alt: 'Ảnh minh họa không gian nhà hàng.', fit: 'cover' },
        },
      ],
    },
    {
      id: 'restaurant-process',
      type: 'Process',
      enabled: true,
      variant: 'steps',
      headline: 'Một yêu cầu, ba bước rõ ràng.',
      items: [
        {
          id: 'booking-request',
          title: 'Chia sẻ kế hoạch',
          description: 'Cho biết ngày, giờ mong muốn, số khách và nhu cầu của bàn.',
        },
        {
          id: 'booking-confirm',
          title: 'Chờ nhà hàng xác nhận',
          description: 'Tình trạng bàn, điều kiện và yêu cầu đặc biệt được trao đổi trực tiếp.',
        },
        {
          id: 'booking-visit',
          title: 'Đến theo lịch đã xác nhận',
          description:
            'Liên hệ nhà hàng nếu cần đổi giờ hoặc số khách; xem điều kiện đã được thống nhất.',
        },
      ],
    },
    {
      id: 'restaurant-faq',
      type: 'FAQ',
      enabled: true,
      variant: 'accordion',
      headline: 'Trước khi bạn gửi yêu cầu.',
      items: [
        {
          id: 'faq-confirm',
          question: 'Gửi form có nghĩa là bàn đã được giữ chưa?',
          answer:
            'Chưa. Đây là yêu cầu liên hệ; nhà hàng cần xác nhận tình trạng bàn và điều kiện đặt chỗ.',
        },
        {
          id: 'faq-diet',
          question: 'Có thể báo dị ứng hoặc nhu cầu ăn uống không?',
          answer:
            'Hãy ghi rõ để nhà hàng kiểm tra khả năng đáp ứng và trao đổi thành phần. Không mặc định mọi món đều đáp ứng yêu cầu của bạn.',
        },
        {
          id: 'faq-group',
          question: 'Có thể đặt bàn cho nhóm không?',
          answer:
            'Cho biết số khách và dịp gặp mặt. Không gian, thực đơn và điều kiện dành cho nhóm được xác nhận riêng.',
        },
        {
          id: 'faq-location',
          question: 'Địa chỉ, giờ mở cửa và giá ở đâu?',
          answer:
            'Đây là bản mẫu minh họa. Cần thay bằng địa chỉ, giờ phục vụ và thực đơn thực tế trước khi nhận yêu cầu từ khách.',
        },
      ],
    },
    {
      id: 'restaurant-booking',
      type: 'LeadForm',
      enabled: true,
      variant: 'booking',
      headline: 'Hẹn nhau bên bàn ăn.',
      subheadline: 'Gửi kế hoạch của bạn. Bàn chỉ được giữ sau khi nhà hàng xác nhận trực tiếp.',
      submitLabel: 'Gửi yêu cầu đặt bàn',
      successMessage: 'Đã nhận yêu cầu. Vui lòng chờ xác nhận tình trạng bàn.',
      footerText: 'Thông tin chỉ dùng để trao đổi về yêu cầu đặt bàn này.',
      fields: [
        {
          id: 'booking-name',
          name: 'name',
          label: 'Tên liên hệ',
          fieldType: 'text',
          required: true,
          placeholder: 'Tên để nhà hàng liên hệ',
        },
        {
          id: 'booking-phone',
          name: 'phone',
          label: 'Số điện thoại',
          fieldType: 'tel',
          required: true,
          placeholder: 'Số điện thoại liên hệ',
        },
        {
          id: 'booking-date',
          name: 'preferred_date',
          label: 'Ngày mong muốn',
          fieldType: 'text',
          required: true,
          placeholder: 'Ví dụ: 15/11/2026',
        },
        {
          id: 'booking-time',
          name: 'preferred_time',
          label: 'Giờ mong muốn',
          fieldType: 'text',
          required: true,
          placeholder: 'Ví dụ: 19:00',
        },
        {
          id: 'booking-guests',
          name: 'guests',
          label: 'Số khách',
          fieldType: 'select',
          required: true,
          options: ['1–2 khách', '3–4 khách', '5–8 khách', 'Từ 9 khách — cần trao đổi'],
        },
        {
          id: 'booking-note',
          name: 'note',
          label: 'Nhu cầu của bàn',
          fieldType: 'textarea',
          required: false,
          placeholder: 'Dịp gặp mặt, nhu cầu ăn uống hoặc thông tin cần trao đổi.',
        },
      ],
      formTheme: {
        border: '1px solid #c8cdbb',
        background: '#fffaf0',
        headlineColor: '#263e32',
        labelColor: '#263e32',
        mutedColor: '#5b665d',
        inputBg: '#fffdf8',
        inputColor: '#253d32',
        inputBorder: '1px solid #abb6aa',
        buttonBg: '#294b38',
        buttonColor: '#fffaf0',
        radius: '8px',
      },
    },
    {
      id: 'restaurant-footer',
      type: 'Footer',
      enabled: true,
      headline: 'Bếp & Bàn',
      subheadline: 'BẢN MẪU · CHƯA NHẬN ĐẶT BÀN THỰC TẾ',
      body: 'Thay địa chỉ, giờ phục vụ và thông tin liên hệ đã xác nhận tại đây.',
      ctaLabel: 'Về đầu trang',
      ctaUrl: '#restaurant-header',
    },
  ];
  const recipe = buildArchitectureRecipe({
    architectureId: 'restaurant_menu_pilot_v2',
    purpose: 'Thực đơn → không gian → yêu cầu đặt bàn; chờ xác nhận',
    sectionSequence: blocks.map((b) => b.type),
    designFamily: 'organic',
    conversionGoal: 'booking',
    layout: 'product',
    proofType: 'illustrative-dining',
    formPlacement: 'late',
    ctaStrategy: 'reserve',
    blockVariants: {
      Hero: 'split-left',
      Product: 'editorial-list',
      Gallery: 'grid',
      Process: 'steps',
      FAQ: 'accordion',
      LeadForm: 'booking',
    },
  });
  return {
    version: 1,
    theme: 'MINIMAL',
    themeTokens: {
      primary: '#294b38',
      button: '#294b38',
      secondary: '#263e32',
      background: '#fffaf0',
      surface: '#fffdf8',
      text: '#263e32',
      muted: '#5b665d',
      fontFamily: '"Dining Be Vietnam Pro", sans-serif',
      radius: '8px',
      containerWidth: '1180px',
    },
    seo: {
      title: 'Bếp & Bàn — bản xem nhà hàng',
      metaDescription: 'Mẫu đại diện nhà hàng để duyệt nội dung, thực đơn và yêu cầu đặt bàn.',
      robotsIndex: false,
    },
    blocks,
    meta: {
      catalogVersion: seed.spec.meta?.catalogVersion,
      rendererVersion: RESTAURANT_MENU_RENDERER_VERSION,
      category: 'restaurant',
      layout: 'product',
      designFamily: 'organic',
      conversionGoal: 'booking',
      architectureRecipe: recipe,
    },
  };
}
