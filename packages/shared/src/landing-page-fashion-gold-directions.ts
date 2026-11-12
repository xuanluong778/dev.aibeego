/**
 * Fashion gold-standard copy — drop-buy / trust-fit / price-drop.
 * Editorial luxury tone; limited drops, fit reviews, drop pricing.
 */

import type { LandingPageBlock } from './landing-page-types';
import {
  FASHION_GOLD_ARCHITECTURE_IDS,
  type FashionGoldStandard,
  resolveFashionGoldStandard,
} from './landing-page-fashion-gold-system';

export type FashionProductItem = {
  title: string;
  description: string;
  price?: string;
};

export type FashionGoldDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  productHeadline?: string;
  productSub?: string;
  productItems?: FashionProductItem[];
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  featuresHeadline?: string;
  features?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
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

const DIRECTIONS: Record<string, FashionGoldDirectionCopy> = {
  [FASHION_GOLD_ARCHITECTURE_IDS['drop-buy']]: {
    hero: {
      headline: 'Drop 04 — Gallery trước, chọn size, checkout trong một luồng',
      subheadline:
        'Limited run 280 bộ — lookbook editorial mở đầu, product grid ngay dưới, giá drop công khai. Không chờ flash sale, không ẩn giá.',
      body: 'Oversized tee · wide-leg trouser · canvas tote — cùng palette đen/trắng kem, số lượng có hạn đến hết tuần.',
      ctaLabel: 'Mua drop ngay',
      trustPoints: ['280 bộ limited', 'Size chart cm/inch', 'Ship nội thành 24h'],
    },
    galleryHeadline: 'Campaign Drop 04 — editorial trước khi chọn size',
    gallerySub: 'Lookbook studio + on-body — chụp cùng ánh sáng để thấy drape và texture thật.',
    galleryItems: [
      {
        title: 'Hero look — oversized tee + wide leg',
        description: 'Regular fit tee tuck nhẹ — wide leg dài chạm giày, palette đen/trắng kem.',
      },
      {
        title: 'Detail stitch — French seam',
        description: 'Đường may kép, label woven — close-up vải organic cotton 240gsm.',
      },
      {
        title: 'On body — 168cm · size M',
        description: 'Model 168cm/52kg mặc M relaxed — xem drop length trên thân thật.',
      },
      {
        title: 'Flat lay — full drop kit',
        description: 'Tee + trouser + tote — packaging kraft, care card kèm size guide.',
      },
    ],
    productHeadline: 'Drop 04 — chọn item',
    productSub: 'Mỗi SKU có size chart riêng — đối chiếu số đo ngực/ eo/ dài quần trước khi thêm giỏ.',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: '100% organic cotton 240gsm · relaxed fit · unisex XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'Wool blend 30% · high waist · hidden zip · size 26–34',
        price: '1.290.000đ',
      },
      {
        title: 'Canvas Tote — Natural',
        description: 'Heavy canvas · inner pocket · limited 280 pcs',
        price: '390.000đ',
      },
    ],
    benefitsHeadline: 'Vì sao mua trong drop window',
    benefits: [
      {
        title: 'Giá drop cố định',
        description: 'Không flash sale ẩn — giá trên trang là giá checkout, hết drop về giá retail.',
      },
      {
        title: 'Đổi size 7 ngày',
        description: 'Còn tag & stock — đổi 1 lần miễn phí nội thành, 2 lần ngoại thành (phí ship).',
      },
      {
        title: 'Authentic & care card',
        description: 'Tem woven chống giả + hướng dẫn giặt theo fabric — bảo quản form lâu dài.',
      },
    ],
    pricingHeadline: 'Giá drop — mua lẻ hoặc bundle',
    pricing: [
      {
        name: 'Single item',
        price: '590.000đ',
        period: 'từ',
        features: ['1 SKU bất kỳ', 'Giá drop', 'Đổi size 7 ngày'],
        highlighted: false,
      },
      {
        name: 'Drop bundle',
        price: '1.990.000đ',
        period: '/bộ',
        features: ['Tee + trouser + tote', 'Tiết kiệm 15%', 'Free ship nội thành'],
        highlighted: true,
      },
      {
        name: 'Early restock alert',
        price: '0đ',
        features: ['Nhận SMS khi restock', 'Ưu tiên size hot', 'Không spam'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Drop còn bao lâu?',
        answer: 'Drop 04 mở 7 ngày hoặc đến khi hết 280 bộ — counter realtime trên trang, không gia hạn.',
      },
      {
        question: 'Size chart ở đâu?',
        answer: 'Mỗi product card link size chart cm/inch — đo ngực/ eo/ dài quần, chọn theo số đo không theo size thường mặc.',
      },
      {
        question: 'Pre-order item hết size?',
        answer: 'Một số size chuyển pre-order 10–14 ngày — ghi rõ trên checkout, hủy trước khi vào sản xuất hoàn 100%.',
      },
    ],
    guarantee:
      'Cam kết drop: hàng chính hãng tem woven · đổi size 7 ngày (còn tag) · ship nội thành 24h · COD/ card · hỗ trợ size qua chat T2–CN 9:00–21:00.',
    formHeadline: 'Đặt hàng drop — chọn size & thanh toán',
    formSub: 'Ghi SKU + size — xác nhận tồn kho qua SMS/Zalo trong 15 phút giờ hành chính.',
    formSubmit: 'Hoàn tất đơn drop',
    ctaHeadline: 'Drop 04 sắp đóng — còn slot size M & L',
    ctaSub: '280 bộ toàn drop — không restock cùng giá sau khi đóng.',
    ctaLabel: 'Mua drop ngay →',
  },

  [FASHION_GOLD_ARCHITECTURE_IDS['trust-fit']]: {
    hero: {
      headline: 'Fit thật từ khách — review ảnh, size chart, fabric trước khi mua',
      subheadline:
        'Trust-fit: testimonial có ảnh on-body, số đo cm và size đã chọn — không chỉ quote marketing. Phù hợp mua online lần đầu hoặc da nhạy cảm với form.',
      ctaLabel: 'Xem fit review & shop',
      trustPoints: ['4.9★ fit accuracy', '500+ ảnh khách', 'Đổi size 1 lần miễn phí'],
    },
    featuresHeadline: 'Fabric & cut — biết trước khi thêm giỏ',
    features: [
      {
        title: 'Organic cotton 240gsm',
        description: 'Mềm, ít co — pre-washed, không phai sau 20 lần giặt theo care card.',
      },
      {
        title: 'Relaxed fit có cấu trúc',
        description: 'Drop shoulder tee · wide leg có nếp — không bí, không quá rộng trên vai.',
      },
      {
        title: 'Size chart cm/inch',
        description: 'Đo flat lay + on-body — khuyến nghị +1 size nếu prefer oversized.',
      },
    ],
    testimonialsHeadline: 'Fit review từ khách — có size & số đo',
    testimonials: [
      {
        quote: '168cm/58kg — chọn M relaxed đúng như size chart. Vai rơi vừa, không bó nách.',
        author: 'Lan P.',
        role: 'Oversized Tee · M · 168cm/58kg',
      },
      {
        quote: 'Wide leg size 28 — eo 68cm vừa khít, dài chạm giày sneaker. Ảnh review giống thật 95%.',
        author: 'Minh T.',
        role: 'Wide-Leg Trouser · 28 · eo 68cm',
      },
      {
        quote: 'Đổi từ S lên M miễn phí — support gợi size qua chat nhanh, không ép mua thêm.',
        author: 'Hương N.',
        role: 'Đổi size · Drop 03',
      },
    ],
    benefitsHeadline: 'Chính sách fit & đổi trả',
    benefits: [
      {
        title: 'Fit guarantee',
        description: 'Size không vừa — đổi 1 lần miễn phí trong 7 ngày, còn tag và chưa giặt.',
      },
      {
        title: 'Ảnh review verified',
        description: 'Khách gửi ảnh + số đo — team duyệt trước khi hiển thị, không stock.',
      },
      {
        title: 'Chat tư vấn size',
        description: 'Gửi chiều cao/cân nặng/số đo — gợi size trong 30 phút giờ hành chính.',
      },
    ],
    galleryHeadline: 'Fit pics từ khách — cùng item, nhiều body type',
    gallerySub: 'On-body thật — ghi size và số đo để bạn đối chiếu.',
    galleryItems: [
      {
        title: 'Tee Bone — 160cm · size S',
        description: 'Khách 160cm/48kg · S oversized nhẹ — length đến mid-hip.',
      },
      {
        title: 'Tee Bone — 175cm · size L',
        description: 'Khách 175cm/72kg · L relaxed — shoulder drop rõ, không trễ vai.',
      },
      {
        title: 'Trouser Ink — 165cm · size 27',
        description: 'High waist, hem break 1 lần — ảnh side profile thấy drape.',
      },
      {
        title: 'Full look — couple styling',
        description: 'Tee + trouser cùng drop — palette đen/trắng, ảnh ngoài trời natural light.',
      },
    ],
    productHeadline: 'Best fit sellers — size chart kèm từng SKU',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: 'Fit accuracy 4.9★ · 180+ ảnh khách · XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'True to waist · size 26–34 · wool blend 30%',
        price: '1.290.000đ',
      },
      {
        title: 'Rib Tank — Stone Grey',
        description: 'Body-skimming layer · size XS–L · cotton rib',
        price: '390.000đ',
      },
    ],
    guarantee:
      'Cam kết fit: size chart cm/inch công khai · đổi size 1 lần miễn phí 7 ngày · review ảnh verified · chat tư vấn size T2–CN 9:00–21:00.',
    formHeadline: 'Shop với fit guarantee',
    formSub: 'Ghi chiều cao/cân nặng nếu cần gợi size — xác nhận tồn kho qua SMS.',
    formSubmit: 'Thêm giỏ & checkout',
    ctaHeadline: 'Không chắc size?',
    ctaSub: 'Gửi số đo — team gợi size trong 30 phút, không bắt buộc mua.',
    ctaLabel: 'Nhận gợi size →',
  },

  [FASHION_GOLD_ARCHITECTURE_IDS['price-drop']]: {
    hero: {
      headline: 'Giá drop công khai — early bird, bundle, hết hạn rõ trên trang',
      subheadline:
        'Price-drop first: bảng giá mở đầu — early bird −12% 48h đầu, bundle 3 item −15%, countdown đến khi về retail. Không mã giảm ẩn.',
      ctaLabel: 'Chọn gói giá drop',
      trustPoints: ['Early bird 48h', 'Bundle −15%', 'Countdown realtime'],
    },
    pricingHeadline: 'Bảng giá Drop 04 — early bird & bundle',
    pricing: [
      {
        name: 'Early bird',
        price: '519.000đ',
        period: '/item · 48h',
        features: ['−12% vs retail', 'Mọi SKU drop', 'Hết hạn countdown'],
        highlighted: true,
      },
      {
        name: 'Drop bundle',
        price: '1.690.000đ',
        period: '/bộ 3 item',
        features: ['Tee + trouser + tote', '−15% vs lẻ', 'Free ship nội thành'],
        highlighted: false,
      },
      {
        name: 'Retail sau drop',
        price: '690.000đ',
        period: '/item từ',
        features: ['Sau khi đóng drop', 'Restock không giảm', 'Đổi size 7 ngày'],
        highlighted: false,
      },
    ],
    galleryHeadline: 'Item trong bảng giá — preview trước checkout',
    gallerySub: 'Ảnh sản phẩm tương ứng từng tier — không ảnh minh họa chung.',
    galleryItems: [
      {
        title: 'Early bird — Oversized Tee',
        description: '519.000đ · 48h đầu · Bone White · limited colorway.',
      },
      {
        title: 'Bundle — full drop kit',
        description: '1.690.000đ · tee + trouser + tote · tiết kiệm 300.000đ vs lẻ retail.',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'Retail 1.490.000đ · early bird 1.290.000đ trong window.',
      },
      {
        title: 'Canvas Tote — Natural',
        description: 'Retail 450.000đ · early bird 390.000đ · 280 pcs.',
      },
    ],
    productHeadline: 'SKU áp dụng early bird',
    productItems: [
      {
        title: 'Oversized Tee — Early bird',
        description: '519.000đ (48h) → 590.000đ drop → 690.000đ retail',
        price: '519.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Early bird',
        description: '1.290.000đ (48h) → 1.390.000đ drop → 1.490.000đ retail',
        price: '1.290.000đ',
      },
      {
        title: 'Drop bundle 3 item',
        description: '1.690.000đ cố định · không stack thêm mã',
        price: '1.690.000đ',
      },
    ],
    faq: [
      {
        question: 'Early bird có stack mã giảm không?',
        answer: 'Không — giá drop đã tối ưu. Early bird và bundle không cộng thêm voucher.',
      },
      {
        question: 'Countdown hết thì sao?',
        answer: 'Early bird về giá drop thường — counter trên hero. Hết drop window về retail, không thông báo riêng.',
      },
      {
        question: 'Bundle có chọn size riêng từng item?',
        answer: 'Có — checkout từng SKU chọn size. Một item hết chuyển pre-order, bundle vẫn giữ giá nếu đủ 3 SKU.',
      },
      {
        question: 'Thanh toán trả góp?',
        answer: 'Card 0% 3 tháng đối tác — áp dụng đơn từ 2.000.000đ, không áp early bird single item.',
      },
    ],
    guarantee:
      'Cam kết giá drop: bảng giá công khai · early bird countdown minh bạch · không phí ẩn checkout · hóa đơn VAT khi yêu cầu.',
    formHeadline: 'Checkout giá drop — chọn tier & size',
    formSub: 'Early bird áp tự động trong 48h — ghi size từng SKU trước khi thanh toán.',
    formSubmit: 'Thanh toán drop',
    ctaHeadline: 'Early bird còn 36 giờ',
    ctaSub: 'Sau countdown về giá drop thường — bundle vẫn −15% đến hết tuần.',
    ctaLabel: 'Chọn gói giá drop →',
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

function patchProductItems(
  items: Array<{ id: string; title?: string; description?: string; role?: string }> | undefined,
  productItems: FashionProductItem[] | undefined,
) {
  if (!productItems?.length || !items?.length) return items;
  return items.map((item, i) => {
    const src = productItems[i];
    if (!src) return item;
    return {
      ...item,
      title: src.title,
      description: src.description,
      role: src.price ?? item.role,
    };
  });
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
  src: FashionGoldDirectionCopy['pricing'] | undefined,
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

export function applyFashionGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveFashionGoldStandard(architectureId);
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
          items: (patchProductItems(block.items, copy.productItems) ||
            block.items) as typeof block.items,
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
            ...(block.items[i] || block.items[0] || { id: `fashion_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `fashion_gold_tm_${i + 1}`,
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
            id: `fashion_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết thương hiệu', body: copy.guarantee }
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

export function fashionGoldLabel(gold: FashionGoldStandard): string {
  const labels: Record<FashionGoldStandard, string> = {
    'drop-buy': 'Drop Buy',
    'trust-fit': 'Trust Fit',
    'price-drop': 'Price Drop',
  };
  return labels[gold];
}
