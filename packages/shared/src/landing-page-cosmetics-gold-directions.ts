/**
 * Cosmetics gold-standard copy — buy-path / trust-skin / kit-pricing.
 * Beauty · clinical · luxury · result-driven; routines, kits, before/after.
 */

import type { LandingPageBlock } from './landing-page-types';
import {
  COSMETICS_GOLD_ARCHITECTURE_IDS,
  type CosmeticsGoldStandard,
  resolveCosmeticsGoldStandard,
} from './landing-page-cosmetics-gold-system';

export type CosmeticsGoldDirectionCopy = {
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
  productItems?: Array<{ title: string; description: string; price?: string }>;
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

const DIRECTIONS: Record<string, CosmeticsGoldDirectionCopy> = {
  [COSMETICS_GOLD_ARCHITECTURE_IDS['buy-path']]: {
    hero: {
      headline: 'Da sáng khỏe sau 14 ngày — xem kết quả thật, mua routine phù hợp',
      subheadline:
        'Result-driven: gallery before/after từ khách thật → lợi ích từng bước → demo texture → kit giá rõ. Serum, cleanser và SPF trong một luồng mua nhanh.',
      body: 'Không stock photo — ảnh da thật sau 2 tuần dùng đúng routine AM/PM.',
      ctaLabel: 'Chọn kit & đặt hàng',
      trustPoints: ['Before/after có timestamp', 'Ship trong 24h nội thành', 'Đổi trả 7 ngày seal nguyên'],
    },
    galleryHeadline: 'Before / after — da thật sau 14 ngày',
    gallerySub: 'Cùng góc chụp, ánh sáng tự nhiên — khách đồng ý chia sẻ kết quả.',
    galleryItems: [
      {
        title: 'Mụn viêm & thâm đỏ — tuần 0 vs tuần 2',
        description: 'Routine: Gentle Cleanser + Niacinamide 10% AM/PM — giảm đỏ rõ, thâm mờ dần.',
      },
      {
        title: 'Da xỉn màu — sau 10 ngày glow',
        description: 'Vitamin C 15% buổi sáng + SPF 50 — tone đều hơn, không filter.',
      },
      {
        title: 'Lỗ chân lông & dầu thừa — tuần 3',
        description: 'BHA 2% tối 3x/tuần + gel dưỡng nhẹ — da matte nhưng không căng.',
      },
      {
        title: 'Texture & mảng da khô — sau 14 ngày',
        description: 'Ceramide Moisturizer + HA serum — bề mặt mịn, makeup bám đều hơn.',
      },
    ],
    benefitsHeadline: 'Vì sao da cải thiện nhanh hơn khi mua đúng bộ',
    benefits: [
      {
        title: 'Actives tương thích',
        description: 'Niacinamide + Vitamin C tách buổi — tránh kích ứng, tối ưu hiệu quả.',
      },
      {
        title: 'Hướng dẫn AM/PM in hộp',
        description: 'Sticker 4 bước trên nắp — không đoán liều lượng hay thứ tự.',
      },
      {
        title: 'Sample patch-test kèm',
        description: 'Gói 3ml cho da nhạy cảm — test cổ tay 24h trước khi dùng full.',
      },
    ],
    processHeadline: 'Routine 4 bước — mua một lần, dùng đúng ngay',
    process: [
      { title: 'Cleanse', description: 'Sữa rửa pH 5.5 — làm sạch dầu makeup, không stripping.' },
      { title: 'Treat', description: 'Serum theo mục tiêu: sáng da, giảm mụn hoặc cấp ẩm sâu.' },
      { title: 'Moisturize', description: 'Kem dưỡng ceramide — khóa ẩm, phục hồi hàng rào da.' },
      { title: 'Protect (AM)', description: 'SPF 50 PA++++ finish nhẹ — reapply mỗi 2–3 giờ ngoài trời.' },
    ],
    productHeadline: 'Bestseller trong bộ result-driven',
    productSub: 'Chọn lẻ hoặc combo — giá hiển thị đã gồm VAT.',
    productItems: [
      {
        title: 'Niacinamide 10% Serum 30ml',
        description: 'Giảm thâm đỏ, se lỗ chân lông — texture gel thấm nhanh, không bí.',
        price: '389.000đ',
      },
      {
        title: 'Vitamin C 15% Bright Serum',
        description: 'Sáng da, đều màu — dùng buổi sáng trước SPF, tránh dùng chung BHA tối.',
        price: '459.000đ',
      },
      {
        title: 'Daily SPF 50 Fluid 50ml',
        description: 'Không trắng bệch, không bết — nền makeup mỏng vẫn ổn.',
        price: '329.000đ',
      },
    ],
    pricingHeadline: 'Kit tiết kiệm — so với mua lẻ',
    pricing: [
      {
        name: 'Glow Starter',
        price: '690.000đ',
        period: '/bộ',
        features: ['Cleanser 100ml', 'Niacinamide 30ml', 'SPF 50 50ml', 'Túi travel'],
        highlighted: false,
      },
      {
        name: 'Full Routine 14-Day',
        price: '1.290.000đ',
        period: '/bộ',
        features: ['5 sản phẩm AM/PM', 'Hướng dẫn 14 ngày', 'Before/after card', 'Freeship'],
        highlighted: true,
      },
      {
        name: 'Dermatologist Kit',
        price: '1.890.000đ',
        period: '/bộ',
        features: ['Routine tùy da', 'Consult 15′ online', 'Patch-test set', 'Đổi 1 sp nếu kích'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Khách sau 14 ngày dùng đúng routine',
    testimonials: [
      {
        quote: 'Ảnh before/after trên web đúng với da mình — thâm mụn mờ sau 2 tuần, không breakout.',
        author: 'Chị Linh T.',
        role: 'Da dầu nhạy cảm · Q. 3',
      },
      {
        quote: 'Mua Full Routine — sticker AM/PM trên hộp giúp không bỏ bước SPF.',
        author: 'Chị Mai P.',
        role: 'Combo office · Q. 7',
      },
    ],
    videoHeadline: 'Texture & cách apply — 60 giây',
    videoSub: 'Demo serum và SPF trên da thật — không filter, ánh sáng tự nhiên.',
    faq: [
      {
        question: 'Before/after có retouch không?',
        answer: 'Không — chỉ crop và che thông tin cá nhân. Cùng điện thoại, cùng góc chụp.',
      },
      {
        question: 'Bao lâu thấy kết quả?',
        answer: 'Đa số khách thấy da sáng và mịn hơn sau 10–14 ngày dùng đủ AM/PM + SPF.',
      },
      {
        question: 'Da mụn viêm có dùng được không?',
        answer: 'Có — chọn kit giảm mụn. Tránh active mạnh nếu đang dùng thuốc bác sĩ; nhắn tư vấn trước.',
      },
    ],
    guarantee:
      'Cam kết result-driven: ảnh before/after thật · hướng dẫn routine in hộp · đổi trả 7 ngày seal nguyên · hotline da liễu T2–CN 9:00–21:00.',
    formHeadline: 'Đặt kit — giao trong 24h nội thành',
    formSub: 'Chọn kit, SĐT và địa chỉ — xác nhận qua Zalo trong 30 phút.',
    formSubmit: 'Đặt hàng ngay',
    ctaHeadline: 'Sẵn sàng bắt đầu 14 ngày?',
    ctaSub: 'Chọn Full Routine — freeship và thẻ theo dõi before/after.',
    ctaLabel: 'Mua kit bestseller →',
  },

  [COSMETICS_GOLD_ARCHITECTURE_IDS['trust-skin']]: {
    hero: {
      headline: 'Dermatologist-tested — thành phần công bố, an toàn cho da nhạy cảm',
      subheadline:
        'Clinical trust: mỗi active có nồng độ rõ, test patch khuyến nghị, không paraben và không hương liệu tổng hợp. Phù hợp da treatment và phụ nữ mang thai (consult bác sĩ).',
      ctaLabel: 'Xem bảng thành phần',
      trustPoints: ['Dermatologist-tested', 'INCI đầy đủ', 'Không paraben · không cồn'],
    },
    featuresHeadline: 'Thành phần chính — nồng độ & vai trò',
    features: [
      {
        title: 'Niacinamide 10% + Zinc 1%',
        description: 'Sebum, thâm đỏ — pH 5.5, không conflict với retinol cách buổi.',
      },
      {
        title: 'Ceramide NP + Cholesterol',
        description: 'Phục hồi hàng rào — kem dưỡng clinical, không silicone nặng.',
      },
      {
        title: 'Panthenol 5% + Allantoin',
        description: 'Làm dịu sau laser/nhiệt — dùng được ngay sau treatment nhẹ.',
      },
    ],
    benefitsHeadline: 'Chứng nhận & kiểm nghiệm',
    benefits: [
      {
        title: 'Dermatologist-tested',
        description: 'Patch test 50 người da nhạy cảm — 0 phản ứng nghiêm trọng trong 72h.',
      },
      {
        title: 'Công bố mỹ phẩm đầy đủ',
        description: 'Số công bố Bộ Y tế — QR truy xuất lô trên mỗi hộp.',
      },
      {
        title: 'Không test trên động vật',
        description: 'Cruelty-free — lab in vitro thay thế.',
      },
    ],
    processHeadline: 'Quy trình an toàn trước khi lên da bạn',
    process: [
      { title: 'Chọn formula theo da', description: 'Quiz 5 câu — gợi routine không active conflict.' },
      { title: 'Patch-test 24h', description: 'Sample 3ml cổ tay — đỏ/rát thì dừng, đổi sp miễn phí.' },
      { title: 'Introduce từ từ', description: 'Tuần 1: 3 đêm/tuần — tăng dần nếu da ổn.' },
      { title: 'Theo dõi & điều chỉnh', description: 'Hotline da liễu — đổi bước treat nếu kích ứng nhẹ.' },
    ],
    galleryHeadline: 'Kết quả lâm sàng — texture & độ ẩm',
    gallerySub: 'Đo corneometer trước/sau 7 ngày — không chỉ cảm quan.',
    galleryItems: [
      {
        title: 'Độ ẩm +18% sau 7 ngày',
        description: 'Ceramide cream — da khô treatment, n=32 volunteer.',
      },
      {
        title: 'Giảm erythema score 23%',
        description: 'Niacinamide serum — da rosacea nhẹ, under dermatologist supervision.',
      },
      {
        title: 'TEWL giảm sau 14 ngày',
        description: 'Barrier repair routine — corneometer + TEWL probe.',
      },
      {
        title: 'Patch-test pass rate 98%',
        description: '50 subjects da nhạy cảm — 72h observation.',
      },
    ],
    productHeadline: 'Sản phẩm clinical — formula minh bạch',
    productSub: 'Scan QR trên hộp xem INCI và số lô.',
    productItems: [
      {
        title: 'Barrier Repair Cream 50ml',
        description: 'Ceramide 3% + cholesterol — dùng sau treatment, không hương.',
        price: '520.000đ',
      },
      {
        title: 'Calm Serum 30ml',
        description: 'Panthenol 5% + madecassoside — làm dịu đỏ trong 15 phút.',
        price: '445.000đ',
      },
      {
        title: 'Gentle Cleanser 150ml',
        description: 'Không SLS — pH 5.5, không bong tróc sau rửa.',
        price: '285.000đ',
      },
    ],
    testimonialsHeadline: 'Bác sĩ da liễu & khách da treatment',
    testimonials: [
      {
        quote: 'Thành phần list rõ — tôi cho bệnh nhân sau laser dùng Barrier Repair an toàn.',
        author: 'BS. Hương N.',
        role: 'Da liễu · TP.HCM',
      },
      {
        quote: 'Da retinol bong tróc — Calm Serum + cream giúp da ổn lại sau 5 ngày.',
        author: 'Chị Trang L.',
        role: 'Da treatment · Q. Phú Nhuận',
      },
      {
        quote: 'QR công bố trên hộp — check Bộ Y tế trước khi mua, yên tâm.',
        author: 'Anh Đức K.',
        role: 'Mua cho vợ mang thai · Q. 2',
      },
    ],
    pricingHeadline: 'Kit clinical — tiết kiệm so với mua lẻ',
    pricing: [
      {
        name: 'Sensitive Starter',
        price: '750.000đ',
        period: '/bộ',
        features: ['Cleanser + Calm Serum', 'Patch-test 3ml', 'Hướng dẫn introduce'],
        highlighted: false,
      },
      {
        name: 'Barrier Complete',
        price: '1.350.000đ',
        period: '/bộ',
        features: ['Full 4 bước clinical', 'Consult da liễu 15′', 'Đổi 1 sp nếu kích'],
        highlighted: true,
      },
      {
        name: 'Post-Treatment',
        price: '980.000đ',
        period: '/bộ',
        features: ['Calm + Barrier cream', 'Không active mạnh', 'Dùng 14 ngày post-laser'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Có paraben, cồn, hương liệu không?',
        answer: 'Không paraben, không cồn denat, không hương tổng hợp — mùi nhẹ từ nguyên liệu gốc nếu có.',
      },
      {
        question: 'Mang thai / cho con bú dùng được không?',
        answer: 'Routine Sensitive/Barrier an toàn thông thường — vẫn consult bác sĩ nếu đang thuốc hoặc treatment.',
      },
      {
        question: 'Dùng chung retinol / BHA được không?',
        answer: 'Cách buổi: retinol/BHA tối, Vitamin C sáng — hoặc nhắn hotline da liễu để map conflict.',
      },
    ],
    guarantee:
      'Cam kết clinical: INCI & công bố QR · dermatologist-tested · patch-test khuyến nghị · đổi sp nếu kích trong 7 ngày (seal nguyên) · hotline da liễu miễn phí.',
    formHeadline: 'Nhận tư vấn formula an toàn',
    formSub: 'Mô tả da và treatment đang dùng — gợi routine không conflict trong 1 giờ.',
    formSubmit: 'Gửi yêu cầu tư vấn',
    ctaHeadline: 'Cần bảng thành phần chi tiết?',
    ctaSub: 'Tải PDF INCI — hoặc scan QR trên bất kỳ hộp nào.',
    ctaLabel: 'Xem formula & đặt hàng →',
  },

  [COSMETICS_GOLD_ARCHITECTURE_IDS['kit-pricing']]: {
    hero: {
      headline: 'Chọn kit skincare — giá công khai, tiết kiệm đến 25% so với mua lẻ',
      subheadline:
        'Luxury kit pricing: so sánh Starter / Full / Pro — mỗi kit liệt kê sản phẩm, ml và thời lượng dùng. Không phí ẩn, freeship nội thành từ 990K.',
      ctaLabel: 'Chọn kit phù hợp',
      trustPoints: ['3 kit cố định', 'Tiết kiệm 15–25%', 'Túi đựng cao cấp kèm Pro'],
    },
    processHeadline: 'Chọn kit → nhận hàng → routine 14 ngày',
    process: [
      { title: 'Chọn kit online', description: 'Starter / Full Routine / Pro — xem breakdown từng chai trong bảng.' },
      { title: 'Thanh toán & ship', description: 'COD hoặc chuyển khoản — giao 24–48h, hộp chống vỡ.' },
      { title: 'Mở hộp & scan QR', description: 'Video hướng dẫn AM/PM theo kit — sticker trên nắp từng bước.' },
      { title: 'Theo dõi & refill', description: 'Nhắc refill trước 7 ngày hết — giá kit tái mua giảm 10%.' },
    ],
    productHeadline: 'Sản phẩm trong từng kit',
    productSub: 'Full Routine gồm 5 chai — đủ 45–60 ngày dùng AM/PM.',
    productItems: [
      {
        title: 'Kit Starter — 3 sản phẩm',
        description: 'Cleanser 100ml + Niacinamide 30ml + SPF 50ml — ~30 ngày.',
        price: '690.000đ',
      },
      {
        title: 'Kit Full Routine — 5 sản phẩm',
        description: 'Thêm Vitamin C sáng + Ceramide cream tối — ~45 ngày, túi travel.',
        price: '1.290.000đ',
      },
      {
        title: 'Kit Pro — 6 sản phẩm + consult',
        description: 'Full + BHA 2% tối + consult da 15′ — routine tùy mục tiêu.',
        price: '1.890.000đ',
      },
    ],
    pricingHeadline: 'So sánh kit — tiết kiệm & quà tặng',
    pricing: [
      {
        name: 'Starter',
        price: '690.000đ',
        period: '/kit',
        features: ['3 sp · ~30 ngày', 'Tiết kiệm 15% vs lẻ', 'Freeship từ 690K'],
        highlighted: false,
      },
      {
        name: 'Full Routine',
        price: '1.290.000đ',
        period: '/kit',
        features: ['5 sp · ~45 ngày', 'Tiết kiệm 22%', 'Túi travel + thẻ 14 ngày'],
        highlighted: true,
      },
      {
        name: 'Pro + Consult',
        price: '1.890.000đ',
        period: '/kit',
        features: ['6 sp + consult 15′', 'Tiết kiệm 25%', 'Hộp gift + refill −10%'],
        highlighted: false,
      },
    ],
    galleryHeadline: 'Unboxing kit — luxury packaging',
    gallerySub: 'Hộp cứng chống vỡ, túi travel và thẻ routine — ảnh thật từ kho.',
    galleryItems: [
      {
        title: 'Full Routine — layout trong hộp',
        description: '5 chai cố định vị trí — không lẫn lộn AM/PM.',
      },
      {
        title: 'Pro kit — hộp gift matte',
        description: 'Ribbon + thẻ consult QR — phù hợp tặng.',
      },
      {
        title: 'Before / after card kèm kit',
        description: 'Khách dán ảnh tuần 0 & 2 — theo dõi tiến trình.',
      },
      {
        title: 'Túi travel water-resistant',
        description: 'Đựng 3 sp essentials — cabin-friendly.',
      },
    ],
    benefitsHeadline: 'Lợi ích mua kit thay vì lẻ',
    benefits: [
      {
        title: 'Giá cố định, không upsell',
        description: 'Breakdown từng chai trên web — tổng kit = sum lẻ trừ discount.',
      },
      {
        title: 'Actives không conflict',
        description: 'Combo đã map AM/PM — tránh mua trùng hoặc sai thứ tự.',
      },
      {
        title: 'Refill nhắc tự động',
        description: 'SMS trước 7 ngày hết — tái mua kit giảm 10%.',
      },
    ],
    featuresHeadline: 'Breakdown Full Routine (5 chai)',
    features: [
      { title: 'Gentle Cleanser 100ml', description: '~60 lần rửa — AM & PM.' },
      { title: 'Vitamin C 15% 30ml', description: '~30 buổi sáng — dùng trước SPF.' },
      { title: 'Niacinamide 10% 30ml', description: 'AM hoặc PM — sebum & thâm.' },
      { title: 'Ceramide Cream 50ml', description: 'Khóa ẩm tối — ~45 ngày.' },
      { title: 'SPF 50 Fluid 50ml', description: '~30 ngày mặt + cổ — reapply trưa tự mua thêm.' },
    ],
    faq: [
      {
        question: 'Kit khác mua lẻ bao nhiêu?',
        answer: 'Starter −15%, Full −22%, Pro −25% so với tổng giá lẻ cùng dung tích trên web.',
      },
      {
        question: 'Hết một chai giữa chừng thì sao?',
        answer: 'Mua lẻ chai đó — hoặc refill kit (giảm 10%) khi gần hết cả bộ.',
      },
      {
        question: 'Đổi trả kit nguyên seal?',
        answer: '7 ngày — miễn phí đổi kit khác nếu chưa mở seal bất kỳ chai nào.',
      },
    ],
    guarantee:
      'Cam kết kit pricing: giá web = giá thanh toán · breakdown công khai · hộp chống vỡ · đổi kit 7 ngày seal nguyên · refill kit −10%.',
    formHeadline: 'Đặt kit — xác nhận trong 30 phút',
    formSub: 'Chọn Starter / Full / Pro — COD hoặc chuyển khoản.',
    formSubmit: 'Đặt kit này',
    ctaHeadline: 'Chưa chắc kit nào?',
    ctaSub: 'Quiz 5 câu — gợi kit phù hợp, không ép nâng Pro.',
    ctaLabel: 'Chọn kit phù hợp →',
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

function patchProductItems(
  items: Array<{ id: string; title?: string; description?: string; price?: string }> | undefined,
  src: CosmeticsGoldDirectionCopy['productItems'] | undefined,
) {
  if (!src?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: src[i]?.title ?? item.title,
    description: src[i]?.description ?? item.description,
    price: src[i]?.price ?? item.price,
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
  src: CosmeticsGoldDirectionCopy['pricing'] | undefined,
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

export function applyCosmeticsGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveCosmeticsGoldStandard(architectureId);
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
      case 'Product':
        return {
          ...block,
          headline: copy.productHeadline || block.headline,
          subheadline: copy.productSub || block.subheadline,
          items: (patchProductItems(block.items, copy.productItems) ||
            block.items) as typeof block.items,
        };
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
          items: (patchGalleryItems(block.items, copy.galleryItems) ||
            block.items) as typeof block.items,
        };
      case 'Video':
        return {
          ...block,
          headline: copy.videoSub
            ? `${copy.videoHeadline || block.headline || ''} — ${copy.videoSub}`.replace(/^ — /, '')
            : copy.videoHeadline || block.headline,
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
            ...(block.items[i] || block.items[0] || { id: `cosmetics_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `cosmetics_gold_tm_${i + 1}`,
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
            id: `cosmetics_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết chất lượng', body: copy.guarantee }
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

export function cosmeticsGoldLabel(gold: CosmeticsGoldStandard): string {
  const labels: Record<CosmeticsGoldStandard, string> = {
    'buy-path': 'Buy Path',
    'trust-skin': 'Trust & Skin',
    'kit-pricing': 'Kit Pricing',
  };
  return labels[gold];
}
