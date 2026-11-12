/**
 * Landing Page Auto — system template seeds (1/category) expanded to 10 layout variants each.
 * Engine: shared block JSON + catalog expand — no per-page source.
 */

import { LANDING_PAGE_THEME_PRESETS, type LandingPageTemplateDefinition } from './landing-page-types';
import { defaultLeadFormFields } from './landing-page-lifecycle';
import {
  LANDING_PAGE_PLACEHOLDER_TESTIMONIALS,
  layoutForCategory,
} from './landing-page-ui';
import { expandLandingPageTemplateCatalog } from './landing-page-template-expand';

function id(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

function buildTemplate(input: {
  slug: string;
  name: string;
  category: LandingPageTemplateDefinition['category'];
  theme: LandingPageTemplateDefinition['theme'];
  description: string;
  tags: string[];
  hero: { headline: string; subheadline: string; cta: string; body?: string };
  benefits: Array<{ title: string; description: string }>;
  features?: Array<{ title: string; description: string }>;
  pricing?: Array<{ name: string; price: string; period?: string; features: string[]; highlighted?: boolean }>;
  /** Ignored for fake names — templates always seed placeholders (NO_FAKE_DATA). */
  testimonials?: boolean;
  process?: Array<{ title: string; description: string }>;
  faq?: Array<{ question: string; answer: string }>;
  guarantee?: string;
  formHeadline?: string;
  formSubheadline?: string;
}): LandingPageTemplateDefinition {
  const themeTokens = { ...LANDING_PAGE_THEME_PRESETS[input.theme] };
  const layout = layoutForCategory(input.category);
  const embedForm = layout === 'webinar' || layout === 'lead_gen';
  const blocks: LandingPageTemplateDefinition['spec']['blocks'] = [
    {
      id: id('hero', 1),
      type: 'Hero',
      enabled: true,
      spacing: 'lg',
      headline: input.hero.headline,
      subheadline: input.hero.subheadline,
      body: input.hero.body,
      ctaLabel: input.hero.cta,
      ctaUrl: '#lead-form',
      imageUrl: null,
    },
    {
      id: id('benefits', 1),
      type: 'Benefits',
      enabled: true,
      spacing: 'md',
      headline:
        layout === 'webinar'
          ? 'Vì sao nên tham gia?'
          : layout === 'agency'
            ? 'Giá trị mang lại'
            : 'Lợi ích nổi bật',
      items: input.benefits.map((b, i) => ({ id: id('ben', i + 1), ...b })),
    },
  ];
  if (input.features?.length) {
    blocks.push({
      id: id('features', 1),
      type: 'Features',
      enabled: true,
      spacing: 'md',
      headline:
        layout === 'saas'
          ? 'Tính năng nổi bật'
          : layout === 'course'
            ? 'Bạn sẽ học được gì'
            : 'Tính năng / Điểm khác biệt',
      items: input.features.map((f, i) => ({ id: id('feat', i + 1), ...f })),
    });
  }
  if (input.process?.length) {
    blocks.push({
      id: id('process', 1),
      type: 'Process',
      enabled: true,
      spacing: 'md',
      headline:
        layout === 'webinar'
          ? 'Nội dung chương trình'
          : layout === 'service' || layout === 'local'
            ? 'Quy trình làm việc'
            : 'Quy trình',
      items: input.process.map((p, i) => ({ id: id('step', i + 1), ...p })),
    });
  }
  if (input.pricing?.length) {
    blocks.push({
      id: id('pricing', 1),
      type: 'Pricing',
      enabled: true,
      spacing: 'md',
      headline: 'Bảng giá',
      plans: input.pricing.map((p, i) => ({ id: id('plan', i + 1), ctaLabel: 'Chọn gói', ...p })),
    });
  }
  if (input.testimonials) {
    blocks.push({
      id: id('testimonials', 1),
      type: 'Testimonials',
      enabled: true,
      spacing: 'md',
      headline: 'Khách hàng nói gì',
      items: LANDING_PAGE_PLACEHOLDER_TESTIMONIALS.map((t, i) => ({
        id: id('tm', i + 1),
        avatarUrl: null,
        ...t,
      })),
    });
  }
  if (input.guarantee) {
    blocks.push({
      id: id('guarantee', 1),
      type: 'Guarantee',
      enabled: true,
      spacing: 'sm',
      headline: 'Cam kết',
      body: input.guarantee,
    });
  }
  if (input.faq?.length) {
    blocks.push({
      id: id('faq', 1),
      type: 'FAQ',
      enabled: true,
      spacing: 'md',
      headline: 'Câu hỏi thường gặp',
      items: input.faq.map((q, i) => ({ id: id('faq', i + 1), ...q })),
    });
  }
  blocks.push({
    id: 'lead-form',
    type: 'LeadForm',
    enabled: true,
    spacing: embedForm ? 'sm' : 'md',
    headline:
      input.formHeadline ??
      (layout === 'webinar' ? 'Giữ chỗ miễn phí' : 'Để lại thông tin tư vấn'),
    subheadline:
      input.formSubheadline ??
      (layout === 'webinar'
        ? 'Đăng ký để nhận link Zoom và tài liệu.'
        : 'Chúng tôi phản hồi trong 24 giờ làm việc.'),
    submitLabel: layout === 'webinar' ? 'Giữ chỗ ngay' : 'Gửi thông tin',
    successMessage: 'Cảm ơn bạn! Đội ngũ sẽ liên hệ sớm.',
    fields:
      layout === 'webinar' || layout === 'lead_gen'
        ? [
            ...defaultLeadFormFields(),
            {
              id: id('f', 90),
              name: 'company',
              label: 'Công ty',
              fieldType: 'text' as const,
              required: false,
              placeholder: 'Tên công ty (nếu có)',
            },
          ]
        : defaultLeadFormFields(),
  });
  blocks.push({
    id: id('cta', 1),
    type: 'CTA',
    enabled: true,
    spacing: 'md',
    headline: layout === 'webinar' ? 'Sẵn sàng tăng trưởng với AI?' : 'Sẵn sàng bắt đầu?',
    subheadline: 'Chỉ mất 1 phút để đăng ký.',
    ctaLabel: input.hero.cta,
    ctaUrl: '#lead-form',
  });
  blocks.push({
    id: id('footer', 1),
    type: 'Footer',
    enabled: true,
    spacing: 'sm',
    headline: input.name,
    body: `© ${new Date().getFullYear()} ${input.name} — Powered by Ai Bee Go`,
  });
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    theme: input.theme,
    description: input.description,
    tags: input.tags,
    spec: {
      version: 1,
      theme: input.theme,
      themeTokens,
      seo: {
        title: `${input.name} | Landing Page`,
        metaDescription: input.description.slice(0, 160),
        canonical: null,
        ogImage: null,
        robotsIndex: true,
      },
      blocks,
      meta: {
        layout,
        category: input.category,
      },
    },
  };
}

function buildWebinarTemplate(): LandingPageTemplateDefinition {
  const theme = 'BOLD' as const;
  const themeTokens = { ...LANDING_PAGE_THEME_PRESETS[theme] };
  const fields = [
    ...defaultLeadFormFields(),
    {
      id: id('f', 90),
      name: 'company',
      label: 'Công ty',
      fieldType: 'text' as const,
      required: false,
      placeholder: 'Tên công ty (nếu có)',
    },
  ];
  return {
    slug: 'webinar-register',
    name: 'Đăng ký Webinar',
    category: 'webinar',
    theme,
    description:
      'Webinar conversion-first: Header → Hero 2 cột → Trust → Benefits → Agenda → Speaker → Quy trình → Social proof → Cam kết → FAQ → Form → CTA → Footer',
    tags: ['webinar', 'event', 'bold', 'conversion', 'ai-layout'],
    spec: {
      version: 1,
      theme,
      themeTokens,
      seo: {
        title: 'Webinar AI & Automation | Ai Bee Go',
        metaDescription:
          'Đăng ký webinar miễn phí: framework AI/Automation tăng doanh thu bền vững — nhận slide & checklist.',
        canonical: null,
        ogImage: null,
        robotsIndex: true,
      },
      meta: { layout: 'webinar', category: 'webinar' },
      blocks: [
        {
          id: 'header_1',
          type: 'Header',
          enabled: true,
          spacing: 'none',
          headline: 'Ai Bee Go',
          body: 'Trang chủ|Webinar|Tài nguyên|Liên hệ',
          ctaLabel: 'Đăng ký ngay',
          ctaUrl: '#lead-form',
        },
        {
          id: 'hero_1',
          type: 'Hero',
          enabled: true,
          spacing: 'lg',
          headline: 'Ứng dụng AI & Automation để tăng doanh thu bền vững cho doanh nghiệp',
          subheadline:
            'Webinar thực chiến — nhận framework, case study và checklist áp dụng ngay sau buổi học.',
          eventDate: 'Thứ 5 · 18/09/2026',
          eventTime: '19:30 – 21:00 (GMT+7)',
          eventFormat: 'Online · Zoom',
          trustPoints: [
            'Framework áp dụng ngay',
            'Case study thực tế',
            'Tài liệu + checklist kèm theo',
          ],
          ctaLabel: 'Giữ chỗ miễn phí',
          ctaUrl: '#lead-form',
          imageUrl: null,
        },
        {
          id: 'trust_usp',
          type: 'Features',
          enabled: true,
          spacing: 'sm',
          headline: 'Điểm khác biệt',
          subheadline: 'USP rõ ràng — không lý thuyết suông',
          items: [
            {
              id: id('usp', 1),
              title: 'Thực chiến',
              description: 'Demo trên funnel & automation thật.',
            },
            {
              id: id('usp', 2),
              title: 'Đo được',
              description: 'Gắn KPI lead / chi phí / doanh thu.',
            },
            {
              id: id('usp', 3),
              title: 'Nhận tài liệu',
              description: 'Slide + checklist sau sự kiện.',
            },
          ],
        },
        {
          id: 'benefits_1',
          type: 'Benefits',
          enabled: true,
          spacing: 'md',
          headline: 'Vì sao nên tham gia?',
          items: [
            {
              id: id('ben', 1),
              title: 'Framework rõ ràng',
              description: 'Lộ trình AI/Automation theo giai đoạn kinh doanh.',
            },
            {
              id: id('ben', 2),
              title: 'Case study thật',
              description: 'Bài học từ chiến dịch đã chạy.',
            },
            {
              id: id('ben', 3),
              title: 'Tăng trưởng đo được',
              description: 'Chỉ số lead, chi phí và doanh thu theo dõi được.',
            },
            {
              id: id('ben', 4),
              title: 'Quà tặng kèm',
              description: 'Slide, checklist và template sau sự kiện.',
            },
          ],
        },
        {
          id: 'program_agenda',
          type: 'Process',
          enabled: true,
          spacing: 'md',
          headline: 'Nội dung chương trình',
          subheadline: '90 phút — đúng giờ, đúng agenda',
          items: [
            {
              id: id('ag', 1),
              title: '00–15′ Mở đầu',
              description: 'Bối cảnh AI trong marketing SME Việt Nam.',
            },
            {
              id: id('ag', 2),
              title: '15–40′ Framework',
              description: 'Mô hình tăng trưởng bền vững với automation.',
            },
            {
              id: id('ag', 3),
              title: '40–70′ Demo',
              description: 'Live demo funnel + AI apply thực tế.',
            },
            {
              id: id('ag', 4),
              title: '70–90′ Q&A',
              description: 'Giải đáp & nhận tài liệu.',
            },
          ],
        },
        {
          id: 'speaker_1',
          type: 'Speaker',
          enabled: true,
          spacing: 'md',
          headline: 'Diễn giả',
          subheadline: 'Thêm ảnh & bio thật trong Builder — không dùng ảnh giả',
          items: [
            {
              id: id('sp', 1),
              title: '[Tên diễn giả]',
              role: '[Chức danh / công ty]',
              description:
                '[Bio ngắn: kinh nghiệm vận hành marketing, AI & automation. Thay bằng thông tin thật trước khi publish.]',
              imageUrl: null,
            },
          ],
        },
        {
          id: 'process_steps',
          type: 'Process',
          enabled: true,
          spacing: 'md',
          headline: 'Quy trình tham dự',
          items: [
            { id: id('st', 1), title: '1. Đăng ký', description: 'Điền form giữ chỗ miễn phí.' },
            { id: id('st', 2), title: '2. Nhận link', description: 'Email/Zalo gửi link Zoom.' },
            { id: id('st', 3), title: '3. Tham dự', description: 'Đúng giờ — máy tính hoặc điện thoại.' },
            { id: id('st', 4), title: '4. Nhận quà', description: 'Slide + checklist trong 24 giờ.' },
          ],
        },
        {
          id: 'testimonials_1',
          type: 'Testimonials',
          enabled: true,
          spacing: 'md',
          headline: 'Social proof',
          items: LANDING_PAGE_PLACEHOLDER_TESTIMONIALS.map((t, i) => ({
            id: id('tm', i + 1),
            avatarUrl: null,
            ...t,
          })),
        },
        {
          id: 'guarantee_1',
          type: 'Guarantee',
          enabled: true,
          spacing: 'sm',
          headline: 'Cam kết',
          body: 'Đúng giờ bắt đầu — agenda công bố trước. Bản ghi gửi cho người đã đăng ký.',
        },
        {
          id: 'faq_1',
          type: 'FAQ',
          enabled: true,
          spacing: 'md',
          headline: 'Câu hỏi thường gặp',
          items: [
            {
              id: id('faq', 1),
              question: 'Webinar có mất phí không?',
              answer: 'Miễn phí khi đăng ký trước. Bạn nhận link và tài liệu qua email/Zalo.',
            },
            {
              id: id('faq', 2),
              question: 'Có bản ghi không?',
              answer: 'Có — gửi cho người đã đăng ký trong 24 giờ sau sự kiện.',
            },
            {
              id: id('faq', 3),
              question: 'Phù hợp ai?',
              answer: 'Chủ DN, marketing lead và đội ngũ muốn áp dụng AI/automation.',
            },
            {
              id: id('faq', 4),
              question: 'Cần chuẩn bị gì?',
              answer: 'Máy tính/điện thoại + Zoom. Không cần kiến thức kỹ thuật sâu.',
            },
          ],
        },
        {
          id: 'lead-form',
          type: 'LeadForm',
          enabled: true,
          spacing: 'md',
          headline: 'Đăng ký giữ chỗ miễn phí',
          subheadline: 'Điền form để nhận link Zoom và tài liệu sau webinar.',
          submitLabel: 'Giữ chỗ ngay',
          successMessage: 'Cảm ơn bạn! Kiểm tra email/Zalo để nhận link.',
          fields,
        },
        {
          id: 'cta_1',
          type: 'CTA',
          enabled: true,
          spacing: 'md',
          headline: 'Sẵn sàng tăng trưởng với AI?',
          subheadline: 'Chỉ mất 1 phút để giữ chỗ.',
          ctaLabel: 'Đăng ký ngay',
          ctaUrl: '#lead-form',
        },
        {
          id: 'footer_1',
          type: 'Footer',
          enabled: true,
          spacing: 'sm',
          headline: 'Ai Bee Go',
          body: `© ${new Date().getFullYear()} Ai Bee Go — Webinar AI & Automation`,
        },
      ],
    },
  };
}

/** One seed per category — expanded to 10 distinct flows below. */
const LANDING_PAGE_TEMPLATE_SEEDS: LandingPageTemplateDefinition[] = [
  buildTemplate({
    slug: 'product-launch',
    name: 'Ra mắt sản phẩm',
    category: 'product',
    theme: 'MODERN',
    description: 'Landing giới thiệu sản phẩm mới + form đăng ký quan tâm',
    tags: ["product", "modern", "landing", "conversion"],
    hero: { headline: 'Ra mắt sản phẩm đột phá', subheadline: 'Trải nghiệm thế hệ mới — đăng ký nhận ưu đãi early bird.', cta: 'Nhận ưu đãi' },
    benefits: [
      { title: 'Ưu đãi mở bán', description: 'Giảm giá dành riêng khách đăng ký sớm.' },
      { title: 'Giao hàng nhanh', description: 'Đóng gói chuẩn, theo dõi đơn realtime.' },
      { title: 'Hỗ trợ 1:1', description: 'Đội ngũ CSKH đồng hành sau mua.' },
    ],
    features: [
      { title: 'Thiết kế tinh gọn', description: 'Dễ dùng ngay từ lần đầu.' },
      { title: 'Chất liệu cao cấp', description: 'Bền bỉ theo thời gian.' },
      { title: 'Bảo hành rõ ràng', description: 'Cam kết đổi trả minh bạch.' },
    ],
    pricing: [
      { name: 'Standard', price: '990.000đ', period: '/sp', features: ["1 sản phẩm", "Bảo hành 12 tháng"], highlighted: false },
      { name: 'Premium', price: '1.490.000đ', period: '/sp', features: ["Bundle phụ kiện", "Bảo hành 24 tháng", "Ưu tiên hỗ trợ"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Đăng ký', description: 'Để lại SĐT nhận mã ưu đãi.' },
      { title: 'Xác nhận', description: 'CSKH gọi trong 24h.' },
      { title: 'Nhận hàng', description: 'Giao tận nơi.' },
    ],
    faq: [
      { question: 'Có đổi trả không?', answer: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất.' },
      { question: 'Ship toàn quốc?', answer: 'Có, phí ship theo khu vực.' },
    ],
    guarantee: 'Cam kết hoàn tiền nếu sản phẩm lỗi kỹ thuật trong 30 ngày.',
  }),
  buildTemplate({
    slug: 'cosmetics-skincare',
    name: 'Mỹ phẩm / Skincare',
    category: 'cosmetics',
    theme: 'PREMIUM',
    description: 'Landing mỹ phẩm: lợi ích, quy trình, chứng thực, form mua/đăng ký',
    tags: ["cosmetics", "premium", "landing", "conversion"],
    hero: { headline: 'Làn da sáng khỏe sau 14 ngày', subheadline: 'Công thức dịu nhẹ — phù hợp da nhạy cảm Việt Nam.', cta: 'Đặt liệu trình' },
    benefits: [
      { title: 'Dịu nhẹ', description: 'Không cồn, ít kích ứng.' },
      { title: 'Thẩm thấu nhanh', description: 'Không bết dính.' },
      { title: 'Liệu trình rõ', description: 'Hướng dẫn dùng từng bước.' },
    ],
    features: [
      { title: 'Chiết xuất thiên nhiên', description: 'Thành phần kiểm chứng.' },
      { title: 'Dermatologist tested', description: 'An toàn lâm sàng.' },
      { title: 'Trước/sau', description: 'Hình ảnh khách thật.' },
    ],
    pricing: [
      { name: 'Starter', price: '450.000đ', features: ["Serum 30ml", "Sample cleanser"], highlighted: false },
      { name: 'Glow Set', price: '890.000đ', features: ["Full routine", "Tư vấn da 1:1"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Chẩn đoán', description: 'Form nhu cầu da.' },
      { title: 'Gợi ý', description: 'Liệu trình phù hợp.' },
      { title: 'Theo dõi', description: 'Check-in tuần 2.' },
    ],
    faq: [
      { question: 'Dùng được cho da dầu?', answer: 'Có dòng riêng cho da dầu/mụn.' },
    ],
    guarantee: 'Đổi sản phẩm nếu dị ứng trong 7 ngày (còn seal).',
  }),
  buildTemplate({
    slug: 'fashion-drop',
    name: 'Thời trang Drop',
    category: 'fashion',
    theme: 'BOLD',
    description: 'Landing BST thời trang: gallery, lookbook, CTA mua',
    tags: ["fashion", "bold", "landing", "conversion"],
    hero: { headline: 'New Drop — Limited Edition', subheadline: 'Số lượng có hạn. Pre-order hôm nay.', cta: 'Pre-order ngay' },
    benefits: [
      { title: 'Limited', description: 'Chỉ 200 chiếc.' },
      { title: 'Fit chuẩn', description: 'Size guide chi tiết.' },
      { title: 'Free ship', description: 'Đơn từ 799k.' },
    ],
    features: [
      { title: 'Lookbook', description: '5 phối đồ gợi ý.' },
      { title: 'Chất liệu', description: 'Cotton cao cấp.' },
      { title: 'Gallery', description: 'Ảnh studio + street.' },
    ],
    pricing: [
      { name: 'Tee Drop', price: '399.000đ', features: ["1 áo", "Free ship nội thành"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Chọn size', description: 'Xem size chart.' },
      { title: 'Pre-order', description: 'Giữ chỗ 24h.' },
      { title: 'Nhận hàng', description: 'Ship theo đợt.' },
    ],
    faq: [
      { question: 'Đổi size?', answer: 'Đổi 1 lần trong 7 ngày.' },
    ],
    guarantee: 'Cam kết đúng mẫu lookbook.',
  }),
  buildTemplate({
    slug: 'spa-wellness',
    name: 'Spa & Wellness',
    category: 'spa',
    theme: 'PREMIUM',
    description:
      'Spa / Beauty professional templates: facial, massage, skincare, booking — 10 art directions',
    tags: ['spa', 'beauty', 'wellness', 'booking', 'premium', 'landing'],
    hero: {
      headline: 'Không gian spa dành riêng cho bạn',
      subheadline: 'Ritual chăm da & body theo nhịp chậm — đặt lịch riêng tư, đúng giờ.',
      body: 'Phòng VIP · therapist chứng chỉ · tư vấn liệu trình trước khi bắt đầu.',
      cta: 'Đặt lịch tư vấn premium',
    },
    benefits: [
      { title: 'Therapist chứng chỉ', description: 'Tay nghề ổn định, book theo tên được.' },
      { title: 'Không gian riêng tư', description: 'Phòng VIP, ánh sáng dịu, ít tiếng ồn.' },
      { title: 'Gói liệu trình rõ giá', description: 'Facial, body, membership — không ẩn phí.' },
      { title: 'Aftercare tại nhà', description: 'Gợi ý skincare và lịch tái khám hợp lý.' },
    ],
    features: [
      { title: 'Facial Editorial 75′', description: 'Làm sạch sâu, massage nâng, đắp mặt nạ dưỡng ẩm.' },
      { title: 'Body Ritual 90′', description: 'Massage toàn thân kết hợp tinh dầu thư giãn.' },
      { title: 'Skincare consultation', description: 'Tư vấn da 20 phút trước hoặc kèm liệu trình.' },
      { title: 'Membership Quiet Hours', description: 'Khung giờ ưu tiên và ưu đãi định kỳ.' },
    ],
    pricing: [
      {
        name: 'Facial 60′',
        price: '450.000đ',
        features: ['Làm sạch', 'Đắp mặt nạ', 'Aftercare tip'],
        highlighted: false,
      },
      {
        name: 'VIP Body 90′',
        price: '890.000đ',
        features: ['Full body', 'Phòng VIP', 'Đồ uống'],
        highlighted: true,
      },
      {
        name: 'Combo Facial + Body',
        price: '1.190.000đ',
        features: ['2 liệu trình', 'Mini kit', 'Đổi lịch linh hoạt'],
        highlighted: false,
      },
    ],
    testimonials: true,
    process: [
      { title: 'Tư vấn ngắn', description: 'Chọn mục tiêu: da, thư giãn, hoặc recovery.' },
      { title: 'Ritual chính', description: 'Therapist thực hiện theo protocol đã thống nhất.' },
      { title: 'Aftercare', description: 'Gợi ý chăm sóc tại nhà và lịch tái khám.' },
    ],
    faq: [
      { question: 'Hủy / đổi lịch?', answer: 'Miễn phí trước 4–6 giờ tùy gói; sát giờ vui lòng gọi lễ tân.' },
      { question: 'Cần đến sớm?', answer: 'Nên đến trước 10–15 phút để check-in và thư giãn.' },
      {
        question: 'Spa có thay thế phòng khám da liễu?',
        answer: 'Không — spa chăm sóc và thư giãn; bệnh lý da nên gặp bác sĩ.',
      },
    ],
    guarantee: 'Hài lòng về không gian và dịch vụ — ưu đãi buổi tiếp theo nếu trải nghiệm chưa đạt.',
    formHeadline: 'Đặt lịch spa',
    formSubheadline: 'Để lại SĐT — lễ tân xác nhận khung giờ trống.',
  }),
  buildTemplate({
    slug: 'real-estate-project',
    name: 'Dự án BĐS',
    category: 'real_estate',
    theme: 'CORPORATE',
    description: 'Landing dự án bất động sản: tiện ích, giá, form tư vấn',
    tags: ["real_estate", "corporate", "landing", "conversion"],
    hero: { headline: 'Dự án căn hộ trung tâm', subheadline: 'Vị trí vàng — sổ hồng riêng — hỗ trợ vay.', cta: 'Nhận bảng giá' },
    benefits: [
      { title: 'Vị trí', description: 'Gần metro & tiện ích.' },
      { title: 'Pháp lý', description: 'Minh bạch.' },
      { title: 'Tiến độ', description: 'Bàn giao đúng cam kết.' },
    ],
    features: [
      { title: 'Tiện ích', description: 'Hồ bơi, gym, kidsclub.' },
      { title: 'Mặt bằng', description: 'Nhiều loại căn.' },
      { title: 'Ưu đãi', description: 'Chiết khấu đợt 1.' },
    ],
    pricing: [
      { name: 'Căn 2PN', price: 'từ 2.9 tỷ', features: ["56–68m²", "View nội khu"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Nhận tư vấn', description: 'Form + gọi lại.' },
      { title: 'Tham quan', description: 'Nhà mẫu.' },
      { title: 'Giữ chỗ', description: 'Ký thỏa thuận.' },
    ],
    faq: [
      { question: 'Có hỗ trợ vay?', answer: 'Hỗ trợ hồ sơ với ngân hàng đối tác.' },
    ],
    guarantee: 'Cam kết thông tin pháp lý công khai.',
  }),
  buildTemplate({
    slug: 'seo-service',
    name: 'Dịch vụ SEO',
    category: 'seo',
    theme: 'CORPORATE',
    description: 'Landing dịch vụ SEO: quy trình, case, báo giá',
    tags: ["seo", "corporate", "landing", "conversion"],
    hero: { headline: 'SEO tăng trưởng organic bền vững', subheadline: 'Audit → triển khai → đo lường hàng tuần.', cta: 'Nhận audit miễn phí' },
    benefits: [
      { title: 'Technical SEO', description: 'Core Web Vitals.' },
      { title: 'Content', description: 'Topic cluster.' },
      { title: 'Reporting', description: 'Dashboard rõ KPI.' },
    ],
    features: [
      { title: 'Keyword research', description: 'Ưu tiên conversion.' },
      { title: 'On-page', description: 'Schema & internal link.' },
      { title: 'Off-page', description: 'Backlink chất lượng.' },
    ],
    pricing: [
      { name: 'Growth', price: '8tr', period: '/tháng', features: ["10 từ khóa", "Báo cáo tuần"], highlighted: false },
      { name: 'Scale', price: '15tr', period: '/tháng', features: ["30 từ khóa", "Content 8 bài"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Audit', description: 'Chẩn đoán site.' },
      { title: 'Roadmap', description: 'Ưu tiên 90 ngày.' },
      { title: 'Optimize', description: 'Triển khai + đo.' },
    ],
    faq: [
      { question: 'Cam kết top 1?', answer: 'Không cam kết ảo — tối ưu theo KPI thực.' },
    ],
    guarantee: 'Báo cáo minh bạch hoặc hoàn tháng đầu nếu không bàn giao đúng scope.',
  }),
  buildTemplate({
    slug: 'website-build',
    name: 'Thiết kế Website',
    category: 'website',
    theme: 'MODERN',
    description: 'Landing dịch vụ làm web: gói, demo, form báo giá',
    tags: ["website", "modern", "landing", "conversion"],
    hero: { headline: 'Website chuyên nghiệp trong 14 ngày', subheadline: 'Landing + CMS — tối ưu chuyển đổi.', cta: 'Nhận báo giá web' },
    benefits: [
      { title: 'Nhanh', description: 'Timeline rõ.' },
      { title: 'SEO-ready', description: 'Schema & tốc độ.' },
      { title: 'Handover', description: 'Đào tạo sử dụng.' },
    ],
    features: [
      { title: 'UI/UX', description: 'Chuẩn conversion.' },
      { title: 'Responsive', description: 'Mobile-first.' },
      { title: 'Tích hợp', description: 'Form → CRM.' },
    ],
    pricing: [
      { name: 'Landing', price: '6tr', features: ["1 trang", "Form lead"], highlighted: false },
      { name: 'Business', price: '18tr', features: ["5–8 trang", "Blog", "SEO cơ bản"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Brief', description: 'Nhu cầu & brand.' },
      { title: 'Design', description: 'Mockup.' },
      { title: 'Launch', description: 'Go-live + training.' },
    ],
    faq: [
      { question: 'Có hosting?', answer: 'Hỗ trợ setup hosting/domain.' },
    ],
    guarantee: 'Sửa UI 2 vòng trong scope.',
  }),
  buildTemplate({
    slug: 'local-service',
    name: 'Dịch vụ địa phương',
    category: 'service',
    theme: 'MINIMAL',
    description: 'Landing dịch vụ tại chỗ: lợi ích, quy trình, hotline form',
    tags: ["service", "minimal", "landing", "conversion"],
    hero: { headline: 'Dịch vụ tận nơi — đặt lịch nhanh', subheadline: 'Có mặt đúng giờ, minh bạch giá.', cta: 'Đặt lịch ngay' },
    benefits: [
      { title: 'Đúng giờ', description: 'Check-in realtime.' },
      { title: 'Giá cố định', description: 'Không phát sinh ẩn.' },
      { title: 'Bảo hiểm', description: 'An tâm khi làm việc.' },
    ],
    features: [
      { title: 'Khu vực phục vụ', description: 'Nội thành.' },
      { title: 'Gói theo giờ', description: 'Linh hoạt.' },
      { title: 'Đánh giá', description: 'Sau mỗi job.' },
    ],
    pricing: [
      { name: '2 giờ', price: '350.000đ', features: ["1 kỹ thuật viên"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Chọn dịch vụ', description: 'Xem bảng giá.' },
      { title: 'Đặt lịch', description: 'Chọn khung giờ.' },
      { title: 'Thanh toán', description: 'Sau hoàn thành.' },
    ],
    faq: [
      { question: 'Huỷ lịch?', answer: 'Miễn phí trước 2 giờ.' },
    ],
    guarantee: 'Không hài lòng — làm lại miễn phí.',
  }),
  buildTemplate({
    slug: 'online-course',
    name: 'Khóa học Online',
    category: 'course',
    theme: 'MODERN',
    description: 'Landing khóa học: chương trình, testimonials, đăng ký',
    tags: ["course", "modern", "landing", "conversion"],
    hero: { headline: 'Khoá học thực chiến — học là làm được', subheadline: 'Video + worksheet + community.', cta: 'Đăng ký khoá học' },
    benefits: [
      { title: 'Thực hành', description: 'Bài tập tuần.' },
      { title: 'Mentor', description: 'Q&A live.' },
      { title: 'Chứng chỉ', description: 'Hoàn thành module.' },
    ],
    features: [
      { title: 'Module rõ', description: 'Lộ trình 6 tuần.' },
      { title: 'Template', description: 'File làm việc.' },
      { title: 'Cộng đồng', description: 'Nhóm học viên.' },
    ],
    pricing: [
      { name: 'Self-pace', price: '1.990.000đ', features: ["Trọn đời video"], highlighted: false },
      { name: 'Mentored', price: '3.990.000đ', features: ["Live Q&A", "Review bài"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Đăng ký', description: 'Chọn gói.' },
      { title: 'Vào lớp', description: 'Nhận tài liệu.' },
      { title: 'Hoàn thành', description: 'Nhận chứng chỉ.' },
    ],
    faq: [
      { question: 'Có hoàn tiền?', answer: '7 ngày nếu chưa học quá 20%.' },
    ],
    guarantee: 'Cam kết lộ trình rõ ràng.',
  }),
  buildWebinarTemplate(),
  buildTemplate({
    slug: 'coaching-1on1',
    name: 'Coaching 1:1',
    category: 'coaching',
    theme: 'MINIMAL',
    description: 'Landing coaching: hành trình, bảo chứng, book call',
    tags: ["coaching", "minimal", "landing", "conversion"],
    hero: { headline: 'Coaching 1:1 — rõ mục tiêu, có deadline', subheadline: 'Buổi discovery miễn phí 20 phút.', cta: 'Book discovery call' },
    benefits: [
      { title: 'Cá nhân hoá', description: 'Lộ trình riêng.' },
      { title: 'Accountability', description: 'Check-in tuần.' },
      { title: 'Công cụ', description: 'Worksheet thực chiến.' },
    ],
    features: [
      { title: 'Session 60\'', description: 'Deep work.' },
      { title: 'Async support', description: 'Chat giữa buổi.' },
      { title: 'Goal tracking', description: 'KPI cá nhân.' },
    ],
    pricing: [
      { name: '4 buổi', price: '6.000.000đ', features: ["1 tháng", "Chat support"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Discovery', description: 'Hiểu mục tiêu.' },
      { title: 'Plan', description: 'Chốt KPI.' },
      { title: 'Coach', description: 'Triển khai tuần.' },
    ],
    faq: [
      { question: 'Online hay offline?', answer: 'Online Zoom / Google Meet.' },
    ],
    guarantee: 'Không fit sau buổi 1 — hoàn 50% gói.',
  }),
  buildTemplate({
    slug: 'consulting-b2b',
    name: 'Tư vấn B2B',
    category: 'consulting',
    theme: 'CORPORATE',
    description: 'Landing tư vấn doanh nghiệp: USP, process, form',
    tags: ["consulting", "corporate", "landing", "conversion"],
    hero: { headline: 'Tư vấn tăng trưởng B2B', subheadline: 'Chẩn đoán funnel → ưu tiên 90 ngày.', cta: 'Nhận tư vấn' },
    benefits: [
      { title: 'Data-driven', description: 'Dựa trên số liệu.' },
      { title: 'Workshop', description: 'Team alignment.' },
      { title: 'Playbook', description: 'Bàn giao tài liệu.' },
    ],
    features: [
      { title: 'Audit', description: 'Marketing + Sales.' },
      { title: 'ICP', description: 'Định vị khách.' },
      { title: 'Ops', description: 'Quy trình CRM.' },
    ],
    pricing: [
      { name: 'Diagnostic', price: '15tr', features: ["2 tuần", "Báo cáo"], highlighted: false },
      { name: 'Retainer', price: '35tr', period: '/tháng', features: ["Weekly sync", "Execution support"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Kickoff', description: 'Thu thập data.' },
      { title: 'Workshop', description: 'Ưu tiên.' },
      { title: 'Delivery', description: 'Playbook.' },
    ],
    faq: [
      { question: 'Làm remote?', answer: 'Có, toàn quốc.' },
    ],
    guarantee: 'Bàn giao đúng deliverable trong SOW.',
  }),
  buildTemplate({
    slug: 'quote-request',
    name: 'Yêu cầu báo giá',
    category: 'quote',
    theme: 'MINIMAL',
    description: 'Landing thu lead báo giá nhanh',
    tags: ["quote", "minimal", "landing", "conversion"],
    hero: { headline: 'Nhận báo giá trong 24 giờ', subheadline: 'Mô tả nhu cầu — nhận đề xuất phù hợp ngân sách.', cta: 'Yêu cầu báo giá' },
    benefits: [
      { title: 'Nhanh', description: 'Phản hồi 24h.' },
      { title: 'Minh bạch', description: 'Hạng mục rõ.' },
      { title: 'Tuỳ chọn', description: 'Nhiều gói.' },
    ],
    features: [
      { title: 'Scope', description: 'Khảo sát nhu cầu.' },
      { title: 'Estimate', description: 'Chi phí + timeline.' },
      { title: 'Next step', description: 'Kickoff.' },
    ],
    testimonials: true,
    process: [
      { title: 'Gửi nhu cầu', description: 'Form ngắn.' },
      { title: 'Tư vấn', description: 'Làm rõ scope.' },
      { title: 'Báo giá', description: 'File PDF.' },
    ],
    faq: [
      { question: 'Có phí tư vấn?', answer: 'Miễn phí lần đầu.' },
    ],
    guarantee: 'Báo giá giữ giá 14 ngày.',
    formHeadline: 'Gửi yêu cầu báo giá',
  }),
  buildTemplate({
    slug: 'ebook-magnet',
    name: 'Tặng Ebook',
    category: 'ebook',
    theme: 'MODERN',
    description: 'Lead magnet ebook: lợi ích + form tải',
    tags: ["ebook", "modern", "landing", "conversion"],
    hero: { headline: 'Tải ebook miễn phí', subheadline: 'Checklist 25 trang — áp dụng ngay hôm nay.', cta: 'Tải ebook' },
    benefits: [
      { title: 'Miễn phí', description: 'Đổi email/SĐT.' },
      { title: 'Thực dụng', description: 'Template sẵn.' },
      { title: 'Cập nhật', description: 'Bản mới mỗi quý.' },
    ],
    features: [
      { title: 'PDF HD', description: 'Dễ in.' },
      { title: 'Bonus', description: 'Sheet theo dõi.' },
      { title: 'Community', description: 'Group đọc chung.' },
    ],
    testimonials: true,
    process: [
      { title: 'Đăng ký', description: 'Form.' },
      { title: 'Nhận link', description: 'Email tức thì.' },
      { title: 'Áp dụng', description: 'Theo checklist.' },
    ],
    faq: [
      { question: 'Spam?', answer: 'Không — chỉ gửi tài liệu liên quan.' },
    ],
    guarantee: 'Huỷ đăng ký 1 click.',
    formHeadline: 'Nhận link tải ebook',
  }),
  buildTemplate({
    slug: 'product-demo',
    name: 'Đăng ký Demo',
    category: 'demo',
    theme: 'CORPORATE',
    description: 'Landing demo SaaS/product: features + form',
    tags: ["demo", "corporate", "landing", "conversion"],
    hero: { headline: 'Đặt lịch demo sản phẩm 20 phút', subheadline: 'Xem live — hỏi đáp trực tiếp với chuyên viên.', cta: 'Đặt demo' },
    benefits: [
      { title: 'Cá nhân hoá', description: 'Theo use-case.' },
      { title: 'Q&A', description: 'Hỏi thoải mái.' },
      { title: 'Trial', description: 'Mở trial sau demo.' },
    ],
    features: [
      { title: 'Walkthrough', description: 'Toàn bộ flow.' },
      { title: 'ROI', description: 'Tính toán nhanh.' },
      { title: 'Security', description: 'FAQ bảo mật.' },
    ],
    testimonials: true,
    process: [
      { title: 'Book', description: 'Chọn slot.' },
      { title: 'Demo', description: 'Meet 20\'.' },
      { title: 'Trial', description: 'Nhận account.' },
    ],
    faq: [
      { question: 'Cần chuẩn bị gì?', answer: 'Brief use-case và mục tiêu buổi demo — team sẽ gửi checklist trước call.' },
    ],
    guarantee: 'Không bán hàng ép — đúng 20 phút.',
    formHeadline: 'Đặt lịch demo',
  }),
  buildTemplate({
    slug: 'lead-magnet-checklist',
    name: 'Lead Magnet Checklist',
    category: 'lead_magnet',
    theme: 'BOLD',
    description: 'Checklist miễn phí đổi lead',
    tags: ["lead_magnet", "bold", "landing", "conversion"],
    hero: { headline: 'Checklist miễn phí — chốt deal nhanh hơn', subheadline: 'In ra dùng ngay cho team sales.', cta: 'Nhận checklist' },
    benefits: [
      { title: '1 trang', description: 'Dễ dùng.' },
      { title: 'KPI', description: 'Theo dõi bước.' },
      { title: 'Template', description: 'Copy được.' },
    ],
    features: [
      { title: 'PDF', description: 'In A4.' },
      { title: 'Notion', description: 'Bản digital.' },
      { title: 'Tips', description: 'Ghi chú thực chiến.' },
    ],
    testimonials: true,
    process: [
      { title: 'Đăng ký', description: 'Form.' },
      { title: 'Nhận file', description: 'Zalo/Email.' },
      { title: 'Dùng ngay', description: 'Trong pipeline.' },
    ],
    faq: [
      { question: 'Có bản Word?', answer: 'Có kèm file chỉnh sửa.' },
    ],
    guarantee: 'Không chia sẻ SĐT cho bên thứ ba.',
    formHeadline: 'Nhận checklist ngay',
  }),
  buildTemplate({
    slug: 'saas-trial',
    name: 'SaaS Trial',
    category: 'saas',
    theme: 'MODERN',
    description: 'Landing dùng thử SaaS: pricing + CTA',
    tags: ["saas", "modern", "landing", "conversion"],
    hero: { headline: 'Dùng thử 14 ngày — không cần thẻ', subheadline: 'Setup trong 5 phút, onboard có hướng dẫn.', cta: 'Bắt đầu trial' },
    benefits: [
      { title: 'No card', description: 'Huỷ mọi lúc.' },
      { title: 'Templates', description: 'Sẵn use-case.' },
      { title: 'Support', description: 'Chat trong giờ hành chính.' },
    ],
    features: [
      { title: 'Workspace', description: 'Đa thành viên.' },
      { title: 'Integrations', description: 'CRM & Ads.' },
      { title: 'Analytics', description: 'Dashboard realtime.' },
    ],
    pricing: [
      { name: 'Starter', price: '499k', period: '/tháng', features: ["3 seats", "Basic reports"], highlighted: false },
      { name: 'Pro', price: '1.299k', period: '/tháng', features: ["Unlimited seats", "Automation"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Sign up', description: 'Tạo workspace.' },
      { title: 'Import', description: 'Dữ liệu mẫu.' },
      { title: 'Invite', description: 'Mời team.' },
    ],
    faq: [
      { question: 'Trial bao lâu?', answer: '14 ngày đầy đủ tính năng Pro.' },
    ],
    guarantee: 'Huỷ trước khi hết trial — không bị tính phí.',
  }),
  buildTemplate({
    slug: 'clinic-booking',
    name: 'Phòng khám / Clinic',
    category: 'clinic',
    theme: 'PREMIUM',
    description: 'Landing phòng khám: dịch vụ, bác sĩ, đặt lịch',
    tags: ["clinic", "premium", "landing", "conversion"],
    hero: { headline: 'Đặt lịch khám nhanh — bác sĩ chuyên khoa', subheadline: 'Lịch trống realtime, nhắc lịch tự động.', cta: 'Đặt lịch khám' },
    benefits: [
      { title: 'Đúng giờ', description: 'Giảm chờ.' },
      { title: 'Hồ sơ', description: 'Lưu lịch sử.' },
      { title: 'Nhắc lịch', description: 'SMS/Zalo.' },
    ],
    features: [
      { title: 'Chuyên khoa', description: 'Nhiều bác sĩ.' },
      { title: 'Gói khám', description: 'Combo tiết kiệm.' },
      { title: 'Sau khám', description: 'Theo dõi.' },
    ],
    pricing: [
      { name: 'Khám thường', price: '300.000đ', features: ["30 phút"], highlighted: false },
      { name: 'Chuyên sâu', price: '650.000đ', features: ["60 phút", "Kèm xét nghiệm cơ bản"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Chọn dịch vụ', description: 'Xem bác sĩ.' },
      { title: 'Đặt lịch', description: 'Form.' },
      { title: 'Check-in', description: 'Đến đúng giờ.' },
    ],
    faq: [
      { question: 'Có bảo hiểm?', answer: 'Hỗ trợ xuất hoá đơn.' },
    ],
    guarantee: 'Dời lịch miễn phí trước 6 giờ.',
  }),
  buildTemplate({
    slug: 'restaurant-promo',
    name: 'Nhà hàng / F&B',
    category: 'restaurant',
    theme: 'BOLD',
    description: 'Landing khuyến mãi F&B: menu highlight + đặt bàn',
    tags: ["restaurant", "bold", "landing", "conversion"],
    hero: { headline: 'Ưu đãi set menu cuối tuần', subheadline: 'Giữ bàn online — nhận quà khai vị.', cta: 'Giữ bàn ngay' },
    benefits: [
      { title: 'Giữ chỗ', description: 'Không xếp hàng.' },
      { title: 'Set tiết kiệm', description: 'Combo rõ.' },
      { title: 'Không gian', description: 'View đẹp.' },
    ],
    features: [
      { title: 'Menu highlight', description: 'Món best-seller.' },
      { title: 'Happy hour', description: 'Giờ vàng.' },
      { title: 'Event', description: 'Sinh nhật.' },
    ],
    pricing: [
      { name: 'Set 2 người', price: '499.000đ', features: ["4 món", "2 đồ uống"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Chọn set', description: 'Xem menu.' },
      { title: 'Giữ bàn', description: 'Form + giờ.' },
      { title: 'Thưởng thức', description: 'Check-in.' },
    ],
    faq: [
      { question: 'Huỷ bàn?', answer: 'Trước 2 giờ — không phí.' },
    ],
    guarantee: 'Đúng set đã đặt hoặc đổi món tương đương.',
  }),
  buildTemplate({
    slug: 'agency-portfolio',
    name: 'Agency Portfolio',
    category: 'agency',
    theme: 'CORPORATE',
    description: 'Landing agency: dịch vụ, case, liên hệ',
    tags: ["agency", "corporate", "landing", "conversion"],
    hero: { headline: 'Agency tăng trưởng hiệu suất marketing', subheadline: 'Case study thật — KPI rõ — triển khai nhanh.', cta: 'Liên hệ agency' },
    benefits: [
      { title: 'Full-funnel', description: 'Ads → CRM → Automation.' },
      { title: 'Squad', description: 'Chuyên gia đa kênh.' },
      { title: 'Reporting', description: 'Tuần/tháng.' },
    ],
    features: [
      { title: 'Branding', description: 'Nhận diện.' },
      { title: 'Performance', description: 'Ads & SEO.' },
      { title: 'Martech', description: 'Stack tự động.' },
    ],
    pricing: [
      { name: 'Sprint 30 ngày', price: '25tr', features: ["Audit + Quick wins"], highlighted: false },
      { name: 'Retainer', price: '45tr', period: '/tháng', features: ["Ads + Content + CRM"], highlighted: true },
    ],
    testimonials: true,
    process: [
      { title: 'Discovery', description: 'Hiểu mục tiêu.' },
      { title: 'Proposal', description: 'Scope & KPI.' },
      { title: 'Launch', description: 'War-room tuần 1.' },
    ],
    faq: [
      { question: 'Ngành nào?', answer: 'Ecom, dịch vụ, giáo dục, B2B.' },
    ],
    guarantee: 'Kickoff trong 5 ngày làm việc sau ký HĐ.',
  }),
];

/** Full catalog: 20 categories × 10 flows = 200 templates. */
export const LANDING_PAGE_SYSTEM_TEMPLATES: LandingPageTemplateDefinition[] =
  expandLandingPageTemplateCatalog(LANDING_PAGE_TEMPLATE_SEEDS);

export function getLandingPageSystemTemplate(slug: string) {
  return LANDING_PAGE_SYSTEM_TEMPLATES.find((t) => t.slug === slug) ?? null;
}

export function listLandingPageSystemTemplates(filter?: {
  category?: string;
  theme?: string;
  q?: string;
}) {
  const q = (filter?.q || '').trim().toLowerCase();
  return LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => {
    if (filter?.category && t.category !== filter.category) return false;
    if (filter?.theme && t.theme !== filter.theme) return false;
    if (!q) return true;
    const hay = `${t.name} ${t.description} ${t.tags.join(' ')}`.toLowerCase();
    return hay.includes(q);
  });
}

