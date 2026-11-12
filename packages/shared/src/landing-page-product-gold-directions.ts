/**
 * Product gold-standard copy — buy-path / trust-reviews / price-compare.
 */

import type { LandingPageBlock } from './landing-page-types';
import {
  PRODUCT_GOLD_ARCHITECTURE_IDS,
  type ProductGoldStandard,
  resolveProductGoldStandard,
} from './landing-page-product-gold-system';

export type ProductGoldDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  featuresHeadline?: string;
  features?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  productHeadline?: string;
  productSub?: string;
  productItems?: Array<{ title: string; description: string }>;
  galleryHeadline?: string;
  gallerySub?: string;
  galleryItems?: Array<{ title: string; description: string }>;
  testimonialsHeadline?: string;
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  pricingHeadline?: string;
  pricing?: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
  }>;
  faq?: Array<{ question: string; answer: string }>;
  guarantee?: string;
  formHeadline: string;
  formSub?: string;
  formSubmit: string;
  ctaHeadline: string;
  ctaSub?: string;
  ctaLabel: string;
  videoHeadline?: string;
  videoSub?: string;
};

const DIRECTIONS: Record<string, ProductGoldDirectionCopy> = {
  [PRODUCT_GOLD_ARCHITECTURE_IDS['buy-path']]: {
    hero: {
      headline: 'Tai nghe Aura Pro X — ANC 40dB, pin 36 giờ, giao trong 24h',
      subheadline:
        'Gallery-first: xem chi tiết thiết kế, chất liệu và phụ kiện đi kèm trước khi chọn màu. SKU bán chạy nhất Q3 — tồn kho thật, không pre-order ảo.',
      body: 'Chọn màu Graphite hoặc Sand — form đặt hàng cuối trang, COD toàn quốc.',
      ctaLabel: 'Xem gallery & đặt mua',
      trustPoints: ['4.8★ 2.400+ đánh giá', 'Đổi trả 7 ngày', 'Bảo hành 12 tháng chính hãng'],
    },
    galleryHeadline: 'Unboxing & lifestyle — Aura Pro X trên thực tế',
    gallerySub: 'Ảnh chụp studio và khách hàng — tai nghe, case sạc, cáp USB-C và tips size S/M/L.',
    galleryItems: [
      { title: 'Graphite — góc 45°', description: 'Vỏ nhám chống vân tay, logo khắc chìm, hinge gập 180°.' },
      { title: 'Case sạc wireless', description: 'Qi 15W — 3 lần sạc đầy, LED báo pin 4 mức.' },
      { title: 'Lifestyle café', description: 'ANC bật — vẫn nghe order barista, pin cả buổi làm việc.' },
      { title: 'Commute xe bus', description: 'Chế độ Transparency — nghe loa thông báo an toàn.' },
    ],
    benefitsHeadline: 'Vì sao chọn Aura Pro X',
    benefits: [
      { title: 'ANC hybrid 40dB', description: 'Mic ngoài + trong — giảm ồn máy bay, quạt, điều hòa văn phòng.' },
      { title: 'Pin 36 giờ tổng', description: '8h tai nghe + 28h case — sạc nhanh 10 phút nghe thêm 2 giờ.' },
      { title: 'Multipoint Bluetooth 5.3', description: 'Laptop + điện thoại cùng lúc — chuyển cuộc gọi tự động.' },
    ],
    featuresHeadline: 'Thông số kỹ thuật',
    features: [
      { title: 'Driver 11mm titanium', description: 'Dải tần 20Hz–40kHz — bass sâu, treble không chói.' },
      { title: 'IPX4 chống mồ hôi', description: 'Tập gym, đi mưa nhẹ — không ngâm nước.' },
      { title: 'App Aura EQ', description: '5 preset + tùy chỉnh — lưu profile theo thiết bị.' },
      { title: 'Trọng lượng 5,2g/bên', description: 'Eartip memory foam — đeo 4 giờ không đau tai.' },
    ],
    productHeadline: 'Biến thể đang có hàng',
    productSub: 'Chọn màu và size tips — giao từ kho TP.HCM.',
    productItems: [
      { title: 'Aura Pro X Graphite', description: 'Màu xám than — phổ biến nhất, giao trong 24h nội thành.' },
      { title: 'Aura Pro X Sand', description: 'Be cát — limited restock, kèm case da vegan tặng tháng này.' },
      { title: 'Combo phụ kiện', description: 'Thêm stand sạc để bàn + tips silicone size L — giảm 15% khi mua kèm.' },
    ],
    testimonialsHeadline: 'Khách đã mua & đánh giá',
    testimonials: [
      {
        quote: 'ANC trên máy bay tốt hơn tai nghe cũ giá gấp đôi — pin đủ chuyến SGN-HAN khứ hồi.',
        author: 'Anh Minh K.',
        role: 'Mua Graphite · Shopee Verified',
      },
      {
        quote: 'Case sạc wireless tiện bàn làm việc — multipoint laptop + iPhone không phải re-pair.',
        author: 'Chị Lan P.',
        role: 'Mua Sand · Website chính hãng',
      },
      {
        quote: 'Đổi size tips miễn phí qua Zalo — support phản hồi 10 phút.',
        author: 'Anh Tuấn H.',
        role: 'Combo phụ kiện · Q. 7',
      },
    ],
    pricingHeadline: 'Giá & combo tiết kiệm',
    pricing: [
      {
        name: 'Aura Pro X',
        price: '2.490.000đ',
        period: '/bộ',
        features: ['Tai nghe + case', 'Tips S/M/L', 'Cáp USB-C', 'Bảo hành 12 tháng'],
        highlighted: false,
      },
      {
        name: 'Combo Pro + Stand',
        price: '2.790.000đ',
        period: '/bộ',
        features: ['Stand sạc Qi', 'Tips memory foam', 'Free ship nội thành', 'Tặng túi đựng'],
        highlighted: true,
      },
      {
        name: 'Đôi (2 bộ)',
        price: '4.690.000đ',
        period: '/2 bộ',
        features: ['−6% so lẻ', '2 màu tùy chọn', '1 stand sạc', 'Gói quà kèm'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Aura Pro X có tương thích iPhone/Android không?',
        answer: 'Có — Bluetooth 5.3, codec AAC/SBC. Android hỗ trợ LDAC trên một số dòng flagship.',
      },
      {
        question: 'Thời gian giao hàng?',
        answer: 'Nội thành TP.HCM/Hà Nội: 24–48h. Tỉnh khác: 2–4 ngày qua GHN/J&T — COD hoặc chuyển khoản.',
      },
      {
        question: 'Chính sách đổi trả?',
        answer: '7 ngày — seal nguyên, chưa qua sử dụng cá nhân. Lỗi NSX: đổi mới trong 30 ngày.',
      },
    ],
    guarantee:
      'Cam kết mua hàng: hàng chính hãng · serial tra cứu · đổi trả 7 ngày · bảo hành 12 tháng 1 đổi 1 lỗi NSX · hỗ trợ Zalo 8:00–22:00.',
    formHeadline: 'Đặt mua Aura Pro X',
    formSub: 'Chọn màu, số lượng và địa chỉ — xác nhận qua Zalo/SMS trong 30 phút giờ hành chính.',
    formSubmit: 'Xác nhận đơn hàng',
    ctaHeadline: 'Flash sale cuối tuần — giảm 200K combo Pro + Stand',
    ctaSub: 'Tồn kho cập nhật realtime — hết màu Sand sẽ thông báo trên form.',
    ctaLabel: 'Đặt mua ngay →',
  },

  [PRODUCT_GOLD_ARCHITECTURE_IDS['trust-reviews']]: {
    hero: {
      headline: '4.8★ từ 2.400 khách — Aura Pro X được tin trước khi bạn bấm mua',
      subheadline:
        'Review-first: đọc trải nghiệm thật về ANC, pin và độ bền trước khi chọn SKU. Không seed review — mọi đánh giá có đơn hàng verified.',
      ctaLabel: 'Đọc review & mua',
      trustPoints: ['98% hài lòng pin', 'Đổi tips miễn phí', 'Video unboxing từ khách'],
    },
    testimonialsHeadline: 'Review verified — Shopee & website',
    testimonials: [
      {
        quote: 'Dùng 6 tháng — ANC vẫn ổn, pin case còn ~90% dung lượng theo app.',
        author: 'Chị Hương N.',
        role: '★★★★★ · Mua tháng 3/2025',
      },
      {
        quote: 'So với tai nghe văn phòng cũ 1,5 triệu — bass và mic gọi Zoom rõ hơn hẳn.',
        author: 'Anh Đức T.',
        role: '★★★★★ · Graphite · IT Manager',
      },
      {
        quote: 'Con 12 tuổi học online — Transparency mode nghe thầy mà không bỏ tai nghe.',
        author: 'Chị Mai L.',
        role: '★★★★☆ · Sand · Phụ huynh',
      },
      {
        quote: 'Đổi trả vì chọn nhầm size — shop gửi tips L express, không mất phí.',
        author: 'Anh Khôi V.',
        role: '★★★★★ · Hỗ trợ đổi size',
      },
    ],
    benefitsHeadline: 'Điểm được khen nhiều nhất',
    benefits: [
      { title: 'Pin trâu thực tế', description: 'Trung bình 7–8h/tai + 3 lần sạc case — khách WFH phản hồi 2 ngày/lần sạc.' },
      { title: 'Mic gọi rõ', description: 'ENC 3 mic — review ghi nhận ít bị “tiếng quạt” khi họp ngoài trời.' },
      { title: 'Đeo êm lâu', description: '5,2g/bên — nhiều review nữ giới đeo 3–4h không rơi.' },
    ],
    featuresHeadline: 'Specs tóm tắt sau review',
    features: [
      { title: 'ANC 40dB', description: 'Đủ cho open office và xe máy có kính chắn gió.' },
      { title: 'Sạc nhanh', description: '10 phút = 2 giờ — review du lịch hay nhắc điểm này.' },
      { title: 'App EQ', description: 'Khách audiophile tùy bass — preset Balanced được vote cao nhất.' },
    ],
    galleryHeadline: 'Ảnh review từ khách',
    gallerySub: 'Khách đồng ý chia sẻ — che thông tin cá nhân trên vận đơn.',
    galleryItems: [
      { title: 'Unboxing trên bàn WFH', description: 'Review video 2 phút — đủ phụ kiện như quảng cáo.' },
      { title: 'So sánh size case', description: 'Case nhỏ hơn AirPods Pro ~15% — review ví nữ.' },
      { title: 'After 100 giờ sử dụng', description: 'Không xước vỏ — ảnh chụp dưới đèn bàn.' },
      { title: 'Đi gym IPX4', description: 'Mồ hôi nhẹ OK — review khuyên không bơi.' },
    ],
    pricingHeadline: 'Giá sau khi đọc review',
    pricing: [
      {
        name: 'Standard',
        price: '2.490.000đ',
        features: ['Chính hãng', 'Review 4.8★', 'Đổi trả 7 ngày'],
        highlighted: false,
      },
      {
        name: 'Review combo',
        price: '2.790.000đ',
        features: ['Stand sạc Qi', 'Tips foam', 'Free ship', 'Quà tặng túi da'],
        highlighted: true,
      },
    ],
    faq: [
      {
        question: 'Review trên web có mua không?',
        answer: 'Không. Chỉ hiển thị đơn verified — Shopee Mall hoặc website với mã đơn che bớt.',
      },
      {
        question: 'Sao có review 1 sao?',
        answer: 'Hiển thị công khai — thường do chọn nhầm size; team hỗ trợ đổi tips trong 24h.',
      },
    ],
    guarantee:
      'Cam kết review: minh bạch verified · phản hồi review 1–2 sao trong 24h · đổi tips/size miễn phí lần đầu · bảo hành 12 tháng.',
    formHeadline: 'Mua sau khi đọc review',
    formSub: 'Ghi màu ưa thích — gửi link review Shopee nếu bạn mua từ sàn để đồng bộ bảo hành.',
    formSubmit: 'Hoàn tất đặt hàng',
    ctaHeadline: 'Tin review — thử 7 ngày đổi trả',
    ctaSub: '2.400+ khách trước bạn — form mua nhanh bên dưới.',
    ctaLabel: 'Mua Aura Pro X →',
  },

  [PRODUCT_GOLD_ARCHITECTURE_IDS['price-compare']]: {
    hero: {
      headline: 'So sánh Aura Pro X vs Lite vs Max — chọn đúng SKU, không trả thừa',
      subheadline:
        'Bảng giá và tính năng ngay đầu trang — biết trước bạn cần ANC full hay bản Lite tiết kiệm. Bundle đôi giảm thêm 6%.',
      ctaLabel: 'Xem bảng so sánh',
      trustPoints: ['3 SKU cùng dòng', 'Giá cố định', 'Nâng cấp trong 30 ngày'],
    },
    pricingHeadline: 'Bảng so sánh giá & tính năng',
    pricing: [
      {
        name: 'Aura Lite',
        price: '1.290.000đ',
        period: '/bộ',
        features: ['ENC cơ bản', 'Pin 24h tổng', 'Không ANC', 'Bluetooth 5.2'],
        highlighted: false,
      },
      {
        name: 'Aura Pro X',
        price: '2.490.000đ',
        period: '/bộ',
        features: ['ANC 40dB', 'Pin 36h', 'Multipoint', 'LDAC/AAC', 'IPX4'],
        highlighted: true,
      },
      {
        name: 'Aura Max',
        price: '3.490.000đ',
        period: '/bộ',
        features: ['ANC adaptive', 'Pin 48h', 'Head tracking', 'Case sạc nhanh 30W'],
        highlighted: false,
      },
    ],
    productHeadline: 'SKU nào hợp bạn?',
    productSub: 'So sánh nhanh — form đặt hàng chọn đúng biến thể.',
    productItems: [
      { title: 'Chọn Lite nếu…', description: 'Nghe podcast, gọi Zoom — không cần ANC, budget dưới 1,5 triệu.' },
      { title: 'Chọn Pro X nếu…', description: 'WFH + commute — cân bằng ANC, pin và giá; SKU bán chạy nhất.' },
      { title: 'Chọn Max nếu…', description: 'Bay thường xuyên, cần adaptive ANC và pin dài nhất dòng Aura.' },
    ],
    featuresHeadline: 'Chi tiết so sánh specs',
    features: [
      { title: 'ANC', description: 'Lite: không · Pro X: 40dB hybrid · Max: adaptive + wind cut.' },
      { title: 'Pin (tai + case)', description: 'Lite: 6+18h · Pro X: 8+28h · Max: 10+38h.' },
      { title: 'Trọng lượng', description: 'Lite: 4,8g · Pro X: 5,2g · Max: 5,8g (driver lớn hơn).' },
      { title: 'Phụ kiện kèm', description: 'Cả 3: tips S/M/L, cáp C — Max thêm stand sạc nhanh.' },
    ],
    faq: [
      {
        question: 'Có nâng cấp từ Lite lên Pro X không?',
        answer: 'Trong 30 ngày — trả Lite, bù chênh lệch + 100K phí đổi, máy không trầy xước.',
      },
      {
        question: 'Bundle đôi áp dụng SKU nào?',
        answer: 'Pro X và Lite — mix 2 màu OK. Max giảm 400K khi mua 2 cùng đơn.',
      },
      {
        question: 'Giá có thay theo màu không?',
        answer: 'Không — Sand và Graphite cùng giá; quà tặng case da chỉ Pro X Sand tháng này.',
      },
    ],
    guarantee:
      'Cam kết so sánh: bảng giá công khai · không upsell ẩn · nâng cấp SKU trong 30 ngày · bảo hành theo từng dòng — Lite 6 tháng, Pro/Max 12 tháng.',
    formHeadline: 'Đặt hàng — chọn SKU trên bảng',
    formSub: 'Ghi rõ Lite / Pro X / Max và màu — xác nhận tồn kho qua Zalo.',
    formSubmit: 'Đặt SKU đã chọn',
    ctaHeadline: 'Vẫn phân vân Lite hay Pro X?',
    ctaSub: 'Nhắn nhu cầu — tư vấn 5 phút, không ép nâng Max.',
    ctaLabel: 'Nhận tư vấn chọn SKU →',
  },
};

function patchItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  src: Array<{ title: string; description: string }> | undefined,
) {
  if (!src?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: src[i]?.title ?? item.title,
    description: src[i]?.description ?? item.description,
  }));
}

function patchGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: Array<{ title: string; description: string }> | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

function patchPlans(
  plans: Array<{
    id: string;
    name?: string;
    price?: string;
    period?: string;
    features?: string[];
    highlighted?: boolean;
  }> | undefined,
  src: ProductGoldDirectionCopy['pricing'] | undefined,
) {
  if (!plans?.length || !src?.length) return plans;
  return plans.map((p, i) => {
    const s = src[Math.min(i, src.length - 1)]!;
    return {
      ...p,
      name: s.name,
      price: s.price,
      period: s.period,
      features: s.features,
      highlighted: s.highlighted ?? p.highlighted,
    };
  });
}

export function applyProductGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveProductGoldStandard(architectureId);
  if (!gold) return blocks;
  const copy = DIRECTIONS[architectureId];
  if (!copy) return blocks;

  return blocks.map((block): LandingPageBlock => {
    switch (block.type) {
      case 'Hero':
        return {
          ...block,
          headline: copy.hero.headline,
          subheadline: copy.hero.subheadline,
          body: copy.hero.body ?? block.body,
          ctaLabel: copy.hero.ctaLabel,
          trustPoints: copy.hero.trustPoints ?? block.trustPoints,
        };
      case 'Product':
        return {
          ...block,
          headline: copy.productHeadline || block.headline,
          subheadline: copy.productSub || block.subheadline,
          items: (patchItems(block.items, copy.productItems) || block.items) as typeof block.items,
        };
      case 'Benefits':
        return {
          ...block,
          headline: copy.benefitsHeadline || block.headline,
          items: (patchItems(block.items, copy.benefits) || block.items) as typeof block.items,
        };
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline || block.headline,
          items: (patchItems(block.items, copy.features) || block.items) as typeof block.items,
        };
      case 'Process':
        return {
          ...block,
          headline: copy.processHeadline || block.headline,
          items: (patchItems(block.items, copy.process) || block.items) as typeof block.items,
        };
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
          items: (patchGalleryItems(block.items, copy.galleryItems) ||
            block.items) as typeof block.items,
        };
      case 'Testimonials': {
        const items = copy.testimonials;
        if (!items?.length) {
          return { ...block, headline: copy.testimonialsHeadline || block.headline };
        }
        return {
          ...block,
          headline: copy.testimonialsHeadline || block.headline,
          items: items.map((t, i) => ({
            ...(block.items[i] || block.items[0] || { id: `product_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `product_gold_tm_${i + 1}`,
            quote: t.quote,
            author: t.author,
            role: t.role,
          })),
        };
      }
      case 'Pricing':
        return {
          ...block,
          headline: copy.pricingHeadline || block.headline,
          plans: (patchPlans(block.plans, copy.pricing) || block.plans) as typeof block.plans,
        };
      case 'FAQ':
        if (!copy.faq?.length) return block;
        return {
          ...block,
          items: copy.faq.map((f, i) => ({
            id: `product_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết mua hàng', body: copy.guarantee }
          : block;
      case 'LeadForm':
        return {
          ...block,
          headline: copy.formHeadline,
          subheadline: copy.formSub || block.subheadline,
          submitLabel: copy.formSubmit,
        };
      case 'CTA':
        return {
          ...block,
          headline: copy.ctaHeadline,
          subheadline: copy.ctaSub || block.subheadline,
          ctaLabel: copy.ctaLabel,
        };
      default:
        return block;
    }
  });
}

export function productGoldLabel(gold: ProductGoldStandard): string {
  const labels: Record<ProductGoldStandard, string> = {
    'buy-path': 'Buy Path',
    'trust-reviews': 'Trust Reviews',
    'price-compare': 'Price Compare',
  };
  return labels[gold];
}
