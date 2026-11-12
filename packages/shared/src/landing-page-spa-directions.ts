/**
 * SPA / Beauty direction copy — tone + content overlays per architectureId.
 * Applied only when category === 'spa' during architecture expand.
 * Keeps one seed template; differentiates conversion copy without per-slug renderers.
 */

import type { LandingPageBlock } from './landing-page-types';

export type SpaDirectionCopy = {
  hero: { headline: string; subheadline: string; body?: string; ctaLabel: string };
  featuresHeadline: string;
  features: Array<{ title: string; description: string }>;
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  pricingHeadline?: string;
  pricing?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>;
  galleryHeadline?: string;
  gallerySub?: string;
  testimonialsHeadline?: string;
  guarantee?: string;
  faq?: Array<{ question: string; answer: string }>;
  formHeadline: string;
  formSubmit: string;
  ctaHeadline: string;
  ctaLabel: string;
  countdownHeadline?: string;
  countdownSub?: string;
};

const DIRECTIONS: Record<string, SpaDirectionCopy> = {
  'spa-luxury-editorial': {
    hero: {
      headline: 'Không gian spa dành riêng cho bạn',
      subheadline: 'Ritual chăm da & body theo nhịp chậm — đặt lịch riêng tư, đúng giờ.',
      body: 'Phòng VIP · therapist chứng chỉ · tư vấn liệu trình trước khi bắt đầu.',
      ctaLabel: 'Đặt lịch tư vấn premium',
    },
    featuresHeadline: 'Liệu trình signature',
    features: [
      { title: 'Facial Editorial 75′', description: 'Làm sạch sâu, massage nâng, đắp mặt nạ dưỡng ẩm.' },
      { title: 'Body Ritual 90′', description: 'Massage toàn thân kết hợp tinh dầu thư giãn.' },
      { title: 'Membership Quiet Hours', description: 'Khung giờ ưu tiên và ưu đãi liệu trình định kỳ.' },
    ],
    benefitsHeadline: 'Trải nghiệm khác biệt',
    benefits: [
      { title: 'Whitespace & riêng tư', description: 'Không gian yên, ánh sáng dịu, không gian chờ riêng.' },
      { title: 'Consultation trước liệu trình', description: 'Hiểu da / cơ thể trước khi chọn gói.' },
      { title: 'Booking có xác nhận', description: 'Nhắc lịch SMS / Zalo trước buổi hẹn.' },
    ],
    processHeadline: 'Hành trình một buổi spa',
    process: [
      { title: 'Tư vấn ngắn', description: 'Chọn mục tiêu: da, thư giãn, hoặc recovery.' },
      { title: 'Ritual chính', description: 'Therapist thực hiện theo protocol đã thống nhất.' },
      { title: 'Aftercare', description: 'Gợi ý chăm sóc tại nhà và lịch tái khám.' },
    ],
    galleryHeadline: 'Không gian & mood',
    gallerySub: 'Phòng trị liệu · vật liệu · ánh sáng',
    testimonialsHeadline: 'Khách nói về trải nghiệm',
    guarantee: 'Không hài lòng về không gian hoặc dịch vụ — ưu đãi buổi tiếp theo.',
    faq: [
      { question: 'Có cần đến sớm?', answer: 'Nên đến trước 10–15 phút để check-in và thư giãn.' },
      { question: 'Đổi / hủy lịch?', answer: 'Miễn phí trước 6 giờ; sát giờ vui lòng gọi lễ tân.' },
    ],
    formHeadline: 'Đặt lịch premium',
    formSubmit: 'Giữ chỗ tư vấn',
    ctaHeadline: 'Dành một buổi chỉ cho bạn',
    ctaLabel: 'Đặt lịch tư vấn',
  },
  'spa-soft-minimal': {
    hero: {
      headline: 'Spa nhẹ nhàng, lịch rõ ràng',
      subheadline: 'Facial & massage ngắn — đặt lịch online, xác nhận nhanh.',
      ctaLabel: 'Đặt lịch / để lại SĐT',
    },
    featuresHeadline: 'Dịch vụ gọn',
    features: [
      { title: 'Facial 60′', description: 'Làm sạch + dưỡng ẩm cơ bản.' },
      { title: 'Massage vai cổ 45′', description: 'Giảm căng cứng sau giờ làm việc.' },
      { title: 'Skincare consult 20′', description: 'Tư vấn sản phẩm phù hợp da.' },
    ],
    benefitsHeadline: 'Vì sao đơn giản vẫn hiệu quả',
    benefits: [
      { title: 'Ít bước, rõ giá', description: 'Không upsell phức tạp.' },
      { title: 'Phòng sạch, sáng', description: 'Không gian tối giản, dễ chịu.' },
      { title: 'Form ngắn', description: 'Tên + SĐT + khung giờ mong muốn.' },
    ],
    formHeadline: 'Liên hệ đặt lịch',
    formSubmit: 'Gửi yêu cầu',
    ctaHeadline: 'Đặt lịch trong một bước',
    ctaLabel: 'Gửi yêu cầu đặt lịch',
    faq: [
      { question: 'Thời gian phản hồi?', answer: 'Trong giờ mở cửa, thường dưới 30 phút.' },
    ],
  },
  'spa-clinic-clean': {
    hero: {
      headline: 'Spa thẩm mỹ chuyên nghiệp',
      subheadline: 'Quy trình rõ — therapist có chứng chỉ — đặt lịch khám da / liệu trình.',
      body: 'Ưu tiên an toàn, vệ sinh, và tư vấn trung thực trước khi điều trị.',
      ctaLabel: 'Đặt lịch tư vấn',
    },
    featuresHeadline: 'Dịch vụ & liệu trình',
    features: [
      { title: 'Khám da & consultation', description: 'Đánh giá tình trạng da, đề xuất lộ trình.' },
      { title: 'Facial chuyên sâu', description: 'Làm sạch, chăm sóc theo protocol chuẩn.' },
      { title: 'Body treatment', description: 'Massage / chăm sóc body có quy trình ghi nhận.' },
      { title: 'Theo dõi sau liệu trình', description: 'Nhắc lịch và lưu ý aftercare.' },
    ],
    processHeadline: 'Quy trình tại spa',
    process: [
      { title: 'Tiếp nhận', description: 'Khai báo ngắn + mục tiêu chăm sóc.' },
      { title: 'Tư vấn', description: 'Giải thích bước làm và mức kỳ vọng hợp lý.' },
      { title: 'Thực hiện', description: 'Therapist theo checklist.' },
      { title: 'Follow-up', description: 'Gợi ý lịch tái khám nếu cần.' },
    ],
    testimonialsHeadline: 'Phản hồi từ khách đã đến',
    guarantee: 'Cam kết vệ sinh dụng cụ, phòng riêng, và giải thích rõ trước khi làm.',
    faq: [
      { question: 'Có phải bác sĩ da liễu?', answer: 'Spa thẩm mỹ — tư vấn chăm sóc da; trường hợp bệnh lý nên gặp bác sĩ.' },
      { question: 'Cần chuẩn bị gì?', answer: 'Đến đúng giờ, tránh makeup dày nếu làm facial.' },
      { question: 'Hủy lịch?', answer: 'Miễn phí trước 4 giờ làm việc.' },
    ],
    formHeadline: 'Đặt lịch hẹn',
    formSubmit: 'Xác nhận đặt lịch',
    ctaHeadline: 'Đặt lịch tư vấn hôm nay',
    ctaLabel: 'Đặt lịch ngay',
  },
  'spa-dark-premium': {
    hero: {
      headline: 'Đêm spa — ánh sáng thấp, cảm giác cao cấp',
      subheadline: 'Cinematic room · signature massage · VIP booking.',
      body: 'Dành cho buổi tối muốn tách biệt hoàn toàn khỏi nhịp ngày.',
      ctaLabel: 'Đặt VIP tối nay',
    },
    featuresHeadline: 'Signature night menu',
    features: [
      { title: 'Noir Facial 80′', description: 'Chăm da trong không gian tối, nhạc ambient.' },
      { title: 'Deep Tissue Night 90′', description: 'Massage sâu, phục hồi sau tuần dài.' },
      { title: 'Couple Suite', description: 'Phòng đôi, đồ uống nhẹ, lịch riêng.' },
    ],
    pricingHeadline: 'Gói trải nghiệm',
    pricing: [
      { name: 'Noir 80′', price: '1.190.000đ', features: ['Facial đêm', 'Đồ uống'], highlighted: false },
      { name: 'VIP Night 120′', price: '2.490.000đ', features: ['Full body', 'Phòng VIP', 'Aftercare kit'], highlighted: true },
      { name: 'Couple Suite', price: '3.890.000đ', features: ['2 người', 'Suite riêng'], highlighted: false },
    ],
    galleryHeadline: 'Look & ambiance',
    gallerySub: 'Ánh sáng · texture · phòng VIP',
    formHeadline: 'Giữ chỗ VIP',
    formSubmit: 'Đặt lịch VIP',
    ctaHeadline: 'Một buổi tối chỉ dành cho bạn',
    ctaLabel: 'Đặt VIP ngay',
  },
  'spa-organic-wellness': {
    hero: {
      headline: 'Wellness chậm — da, hơi thở, và nhịp cơ thể',
      subheadline: 'Liệu trình tự nhiên: massage, herbal compress, skincare dịu nhẹ.',
      body: 'Câu chuyện chăm sóc dài hạn, không ép liệu trình cứng.',
      ctaLabel: 'Đăng ký tư vấn wellness',
    },
    featuresHeadline: 'Ritual organic',
    features: [
      { title: 'Herbal body wrap', description: 'Chườm thảo mộc, thư giãn cơ.' },
      { title: 'Gentle facial', description: 'Chăm da nhạy cảm, sản phẩm dịu.' },
      { title: 'Breath & stretch 30′', description: 'Khởi động nhẹ trước massage.' },
    ],
    benefitsHeadline: 'Lợi ích cảm nhận được',
    benefits: [
      { title: 'Ít kích ứng', description: 'Ưu tiên công thức dịu, patch test khi cần.' },
      { title: 'Nhịp chậm', description: 'Không gian ấm, mùi nhẹ, không ồn.' },
      { title: 'Lộ trình mềm', description: 'Gợi ý tuần/tháng thay vì “liệu trình cứng”.' },
    ],
    processHeadline: 'Một buổi organic',
    process: [
      { title: 'Check-in ấm', description: 'Trà thảo mộc, trao đổi ngắn.' },
      { title: 'Ritual', description: 'Massage / wrap / facial theo nhu cầu.' },
      { title: 'Aftercare', description: 'Gợi ý thói quen ngủ, nước, skincare tại nhà.' },
    ],
    galleryHeadline: 'Chất liệu & không gian',
    testimonialsHeadline: 'Câu chuyện khách hàng',
    formHeadline: 'Đăng ký tư vấn',
    formSubmit: 'Nhận tư vấn',
    ctaHeadline: 'Bắt đầu lộ trình wellness của bạn',
    ctaLabel: 'Nhận tư vấn nhẹ nhàng',
  },
  'spa-offer-conversion': {
    hero: {
      headline: 'Combo facial + body tháng này',
      subheadline: 'Giá trọn gói rõ ràng — đặt lịch giữ chỗ trong tuần ưu đãi.',
      body: 'Phù hợp khách mới muốn thử đủ 2 liệu trình với ngân sách kiểm soát.',
      ctaLabel: 'Nhận combo ưu đãi',
    },
    featuresHeadline: 'Trong combo gồm',
    features: [
      { title: 'Facial 60′', description: 'Làm sạch + dưỡng.' },
      { title: 'Body 60′', description: 'Massage thư giãn.' },
      { title: 'Skincare mini kit', description: 'Sản phẩm dùng thử tại nhà.' },
    ],
    benefitsHeadline: 'Vì sao chọn combo',
    benefits: [
      { title: 'Tiết kiệm hơn mua lẻ', description: 'Giá niêm yết combo thấp hơn tách gói.' },
      { title: 'Lịch linh hoạt', description: 'Có thể tách 2 buổi trong 30 ngày.' },
      { title: 'Hỗ trợ chọn giờ', description: 'Lễ tân gọi xác nhận khung trống.' },
    ],
    pricingHeadline: 'Gói ưu đãi',
    pricing: [
      { name: 'New Guest', price: '790.000đ', features: ['Facial 60′', 'Body 45′'], highlighted: false },
      { name: 'Combo tháng này', price: '1.190.000đ', features: ['Facial 60′', 'Body 60′', 'Mini kit'], highlighted: true },
      { name: 'Membership 4 buổi', price: '3.960.000đ', features: ['4× combo', 'Ưu tiên lịch'], highlighted: false },
    ],
    testimonialsHeadline: 'Khách đã nhận combo',
    faq: [
      { question: 'Ưu đãi kéo dài bao lâu?', answer: 'Theo countdown trên trang — hết hạn sẽ về giá niêm yết.' },
      { question: 'Có hoàn tiền?', answer: 'Đổi lịch miễn phí trước 4 giờ; không hoàn tiền sau khi đã sử dụng.' },
    ],
    countdownHeadline: 'Ưu đãi combo kết thúc sau',
    countdownSub: 'Giữ chỗ trước khi hết suất tuần này',
    formHeadline: 'Giữ chỗ combo',
    formSubmit: 'Giữ chỗ ngay',
    ctaHeadline: 'Giữ suất combo trước khi hết',
    ctaLabel: 'Nhận combo ưu đãi',
  },
  'spa-booking-first': {
    hero: {
      headline: 'Chọn liệu trình — đặt lịch ngay',
      subheadline: 'Form đặt lịch ở đầu trang. Xác nhận qua Zalo / điện thoại.',
      body: 'Phù hợp khi bạn đã biết muốn facial, massage, hoặc consultation.',
      ctaLabel: 'Đặt lịch ngay bên dưới',
    },
    featuresHeadline: 'Menu dịch vụ',
    features: [
      { title: '1. Facial cơ bản / chuyên sâu', description: '60–90 phút tùy gói.' },
      { title: '2. Massage thư giãn / sâu', description: '45–90 phút.' },
      { title: '3. Body scrub + wrap', description: 'Làm sạch da body.' },
      { title: '4. Consultation da', description: '20 phút, có thể cộng vào liệu trình.' },
    ],
    guarantee: 'Xác nhận lịch trong giờ mở cửa · đổi lịch miễn phí trước 4 giờ.',
    faq: [
      { question: 'Đặt lịch xong bao lâu được gọi?', answer: 'Thường trong 15–60 phút (giờ mở cửa).' },
      { question: 'Đến muộn?', answer: 'Muộn quá 15 phút có thể rút ngắn liệu trình để không ảnh hưởng khách sau.' },
      { question: 'Thanh toán?', answer: 'Tiền mặt / chuyển khoản / thẻ tại quầy.' },
    ],
    testimonialsHeadline: 'Khách đặt lịch online',
    formHeadline: 'Form đặt lịch',
    formSubmit: 'Gửi đặt lịch',
    ctaHeadline: 'Còn suất trống hôm nay?',
    ctaLabel: 'Kiểm tra & đặt lịch',
  },
  'spa-gallery-first': {
    hero: {
      headline: 'Nhìn không gian — rồi đặt lịch',
      subheadline: 'Ít chữ. Nhiều ảnh thật: phòng, liệu trình, kết quả chăm sóc.',
      ctaLabel: 'Đặt lịch xem phòng / liệu trình',
    },
    featuresHeadline: 'Liệu trình nổi bật trong ảnh',
    features: [
      { title: 'Facial glow', description: 'Nhìn da sáng hơn sau buổi chăm sóc.' },
      { title: 'Massage room', description: 'Phòng riêng, ánh sáng ấm.' },
      { title: 'Body care', description: 'Scrub & wrap — hình trước/sau mang tính minh họa.' },
    ],
    galleryHeadline: 'Gallery spa',
    gallerySub: 'Vuốt xem không gian & liệu trình',
    testimonialsHeadline: 'Khách gửi ảnh cảm nhận',
    formHeadline: 'Đặt lịch nhanh',
    formSubmit: 'Đặt lịch',
    ctaHeadline: 'Thích không gian? Giữ một suất',
    ctaLabel: 'Đặt lịch',
  },
  'spa-local-business': {
    hero: {
      headline: 'Spa gần bạn — mở cửa hôm nay',
      subheadline: 'Địa chỉ rõ · giờ mở cửa · đặt lịch hoặc gọi trực tiếp.',
      body: 'Ưu tiên khách khu vực — walk-in theo chỗ trống, đặt trước để chắc suất.',
      ctaLabel: 'Đặt lịch / gọi ngay',
    },
    featuresHeadline: 'Dịch vụ tại chỗ',
    features: [
      { title: 'Facial & skincare', description: 'Các gói phổ biến trong tuần.' },
      { title: 'Massage thư giãn', description: 'Sau giờ làm, cuối tuần.' },
      { title: 'Gói couple / nhóm nhỏ', description: 'Đặt trước để chuẩn bị phòng.' },
    ],
    benefitsHeadline: 'Thông tin cần biết',
    benefits: [
      { title: 'Địa chỉ', description: 'Cập nhật địa chỉ đầy đủ trên Google Maps / footer.' },
      { title: 'Giờ mở cửa', description: '9:00–21:00 (T2–CN) — lễ có thể điều chỉnh.' },
      { title: 'Liên hệ', description: 'Hotline / Zalo trên form và header.' },
    ],
    faq: [
      { question: 'Có chỗ đậu xe?', answer: 'Có hướng dẫn đậu xe / gửi xe gần spa — hỏi lễ tân khi đặt lịch.' },
      { question: 'Thanh toán?', answer: 'Tiền mặt, chuyển khoản, thẻ.' },
    ],
    testimonialsHeadline: 'Đánh giá khách địa phương',
    formHeadline: 'Đặt lịch tại spa',
    formSubmit: 'Đặt lịch',
    ctaHeadline: 'Gọi hoặc để lại SĐT — chúng tôi gọi lại',
    ctaLabel: 'Đặt lịch ngay',
  },
  'spa-social-proof': {
    hero: {
      headline: 'Hàng nghìn buổi chăm sóc đã được đặt',
      subheadline: 'Đánh giá thật từ khách — rồi mới chốt lịch của bạn.',
      body: 'Xem cảm nhận về therapist, không gian và liệu trình trước khi đặt.',
      ctaLabel: 'Xem đánh giá & đặt lịch',
    },
    featuresHeadline: 'Điều khách hay khen',
    features: [
      { title: 'Therapist ổn định', description: 'Được book lại theo tên.' },
      { title: 'Đúng giờ', description: 'Nhắc lịch và check-in rõ.' },
      { title: 'Tư vấn không ép', description: 'Giải thích gói trước khi làm.' },
    ],
    benefitsHeadline: 'Số liệu & cam kết',
    benefits: [
      { title: '4.9★ trung bình', description: 'Từ đánh giá trên kênh của spa (cập nhật định kỳ).' },
      { title: '85% khách quay lại', description: 'Trong vòng 90 ngày (nội bộ spa).' },
      { title: 'Xác nhận < 1 giờ', description: 'Trong giờ mở cửa.' },
    ],
    galleryHeadline: 'Ảnh từ khách & không gian',
    testimonialsHeadline: 'Đánh giá nổi bật',
    guarantee: 'Cam kết phản hồi đánh giá và hỗ trợ đổi lịch khi therapist bận đột xuất.',
    formHeadline: 'Đặt lịch sau khi xem review',
    formSubmit: 'Đặt lịch',
    ctaHeadline: 'Đã xem đủ proof? Giữ suất của bạn',
    ctaLabel: 'Đặt lịch ngay',
  },
};

function patchItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  next: Array<{ title: string; description: string }> | undefined,
) {
  if (!items?.length || !next?.length) return items;
  return items.map((it, i) => {
    const src = next[i % next.length]!;
    return { ...it, title: src.title, description: src.description };
  });
}

function patchPlans(
  plans: Array<{ id: string; name?: string; price?: string; features?: string[]; highlighted?: boolean }> | undefined,
  next: SpaDirectionCopy['pricing'] | undefined,
) {
  if (!plans?.length || !next?.length) return plans;
  return plans.map((p, i) => {
    const src = next[Math.min(i, next.length - 1)]!;
    return {
      ...p,
      name: src.name,
      price: src.price,
      features: src.features,
      highlighted: src.highlighted ?? p.highlighted,
    };
  });
}

/** Overlay SPA direction copy onto architecture-built blocks. */
export function applySpaDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const copy = DIRECTIONS[architectureId];
  if (!copy) return blocks;

  let ctaIndex = 0;
  return blocks.map((block): LandingPageBlock => {
    switch (block.type) {
      case 'Hero':
        return {
          ...block,
          headline: copy.hero.headline,
          subheadline: copy.hero.subheadline,
          body: copy.hero.body ?? block.body,
          ctaLabel: copy.hero.ctaLabel,
          spacing: architectureId === 'spa-luxury-editorial' ? 'lg' : block.spacing,
        };
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline,
          items: (patchItems(block.items, copy.features) || block.items) as typeof block.items,
        };
      case 'Benefits':
        return {
          ...block,
          headline: copy.benefitsHeadline || block.headline,
          items: (patchItems(block.items, copy.benefits) || block.items) as typeof block.items,
        };
      case 'Process':
        return {
          ...block,
          headline: copy.processHeadline || block.headline,
          items: (patchItems(block.items, copy.process) || block.items) as typeof block.items,
        };
      case 'Pricing':
        return {
          ...block,
          headline: copy.pricingHeadline || block.headline,
          plans: (patchPlans(block.plans, copy.pricing) || block.plans) as typeof block.plans,
        };
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
        };
      case 'Testimonials':
        return {
          ...block,
          headline: copy.testimonialsHeadline || block.headline,
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: 'Cam kết của spa', body: copy.guarantee, subheadline: copy.guarantee }
          : block;
      case 'FAQ':
        if (!copy.faq?.length) return block;
        return {
          ...block,
          items: copy.faq.map((f, i) => ({
            id: `spa_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'LeadForm':
        return {
          ...block,
          headline: copy.formHeadline,
          submitLabel: copy.formSubmit,
        };
      case 'CTA': {
        ctaIndex += 1;
        const second = ctaIndex > 1;
        return {
          ...block,
          headline: second ? `${copy.ctaHeadline} — chốt lịch` : copy.ctaHeadline,
          ctaLabel: copy.ctaLabel,
        };
      }
      case 'Countdown':
        return {
          ...block,
          headline: copy.countdownHeadline || block.headline,
          subheadline: copy.countdownSub || block.subheadline,
        };
      case 'Header':
        return {
          ...block,
          headline:
            architectureId === 'spa-local-business'
              ? 'Spa · Đặt lịch · Hotline'
              : block.headline,
        };
      case 'Footer':
        return {
          ...block,
          headline: 'Spa & Beauty',
          body:
            architectureId === 'spa-local-business'
              ? 'Địa chỉ · Giờ mở cửa · Hotline — cập nhật trong Builder'
              : 'Đặt lịch · Tư vấn liệu trình · Chăm sóc sau buổi',
        };
      default:
        return block;
    }
  });
}

export function listSpaDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
