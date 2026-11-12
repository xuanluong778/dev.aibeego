/**
 * Product direction copy — 7 non-gold premium architectures.
 * Ecommerce / physical SKU; distinct buy conversion flows.
 */

import type { LandingPageBlock } from './landing-page-types';
import type { ProductGoldDirectionCopy } from './landing-page-product-gold-directions';
import {
  PRODUCT_DIRECTION_ARCHITECTURE_IDS,
  resolveProductDirectionStandard,
} from './landing-page-product-gold-system';

export type ProductGalleryItem = { title: string; description: string };

const DIRECTIONS: Record<string, ProductGoldDirectionCopy> = {
  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['how-it-works']]: {
    hero: {
      headline: 'Aura Pro X hoạt động thế nào — từ pairing đến ANC trong 60 giây',
      subheadline:
        'Process-first: xem 4 bước sử dụng thực tế trước khi chọn màu. Phù hợp khách lần đầu mua tai nghe ANC cao cấp.',
      body: 'Không cần app để nghe — app Aura EQ là tùy chọn nâng cao.',
      ctaLabel: 'Xem cách dùng & đặt mua',
      trustPoints: ['Pairing 30 giây', 'Hướng dẫn tiếng Việt', 'Video 90 giây'],
    },
    processHeadline: '4 bước bắt đầu với Aura Pro X',
    process: [
      { title: 'Mở case — tự pairing', description: 'Bluetooth 5.3 — pop-up trên iOS/Android, không vào Settings.' },
      { title: 'Chọn size tips', description: 'Thử S/M/L — seal tốt giúp ANC và bass rõ hơn 30%.' },
      { title: 'Bật ANC hoặc Transparency', description: 'Chạm 2 giây tai phải — chuyển chế độ không cần app.' },
      { title: 'Sạc & cập nhật firmware', description: 'App Aura EQ — OTA qua case, 5 phút/lần.' },
    ],
    benefitsHeadline: 'Vì sao nên hiểu cách dùng trước',
    benefits: [
      { title: 'ANC hiệu quả hơn', description: 'Tips đúng size — giảm ồn thật, không chỉ marketing spec.' },
      { title: 'Pin tối ưu', description: 'Tắt ANC khi không cần — thêm 2 giờ mỗi lần sạc.' },
      { title: 'Bảo hành dễ', description: 'Serial trong app — kích hoạt bảo hành 12 tháng 1 chạm.' },
    ],
    featuresHeadline: 'Specs liên quan quy trình',
    features: [
      { title: 'Multipoint', description: 'Giữ kết nối laptop + phone — chuyển cuộc gọi tự động.' },
      { title: 'Gesture tùy chỉnh', description: 'App đổi chạm 1/2/3 lần — mặc định play/pause & ANC.' },
      { title: 'Find my buds', description: 'App phát tiếng beep — tìm tai nghe lẻ trong phòng.' },
    ],
    galleryHeadline: 'Minh họa từng bước',
    gallerySub: 'Ảnh hướng dẫn in trong hộp — quét QR xem video tiếng Việt.',
    galleryItems: [
      { title: 'Bước 1 — pairing', description: 'Screenshot pop-up iOS — thời gian thực 28 giây.' },
      { title: 'Bước 2 — thử tips', description: '3 size foam — khách chọn M phổ biến nhất.' },
      { title: 'Bước 3 — ANC ON', description: 'App đo mức giảm ồn quanh bạn (demo).' },
      { title: 'Bước 4 — sạc case', description: 'LED 4 mức — đầy case trong 1,5 giờ USB-C.' },
    ],
    testimonialsHeadline: 'Khách lần đầu dùng ANC',
    testimonials: [
      {
        quote: 'Video 4 bước trong hộp — 5 phút là nghe nhạc, không nhờ con setup.',
        author: 'Chú Ba H.',
        role: 'Mua Pro X · 58 tuổi',
      },
      {
        quote: 'Tips M seal đúng — ANC trên xe bus khác hẳn tips S ban đầu.',
        author: 'Chị Vy T.',
        role: 'Đổi tips miễn phí · Q. 10',
      },
    ],
    formHeadline: 'Đặt mua — đã xem cách dùng',
    formSub: 'Ghi màu và size tips dự kiến — kèm tips dự phòng trong hộp.',
    formSubmit: 'Đặt Aura Pro X',
    ctaHeadline: 'Muốn video hướng dẫn qua Zalo?',
    ctaSub: 'Gửi SĐT — clip 90 giây tiếng Việt trước khi giao.',
    ctaLabel: 'Nhận video hướng dẫn →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS.lookbook]: {
    hero: {
      headline: 'Lookbook Aura Pro X — Graphite & Sand trên phố, café và studio',
      subheadline:
        'Visual-first: cuộn lookbook lifestyle trước headline — thấy tai nghe trên thực tế, không render 3D. Limited Sand kèm case da vegan.',
      ctaLabel: 'Cuộn lookbook & chọn màu',
      trustPoints: ['Shoot thật TP.HCM', '2 palette màu', 'Quà case da Sand'],
    },
    galleryHeadline: 'Lookbook SS25 — street & desk',
    gallerySub: 'Photographer @studio Aura — natural light, không filter màu quá mức.',
    galleryItems: [
      { title: 'Graphite — rooftop golden hour', description: 'Phối áo linen — tai nghe là điểm nhấn matte.' },
      { title: 'Sand — café sáng', description: 'Cùng tông ly sữa — case da vegan beige.' },
      { title: 'Desk setup WFH', description: 'MacBook + stand sạc Qi — cable management gọn.' },
      { title: 'Commute xe đạp', description: 'Transparency mode — nghe còi xe an toàn.' },
    ],
    productHeadline: 'Featured SKU — Sand limited',
    productSub: 'Restock 800 bộ — kèm case da, hết không tái bản màu này.',
    productItems: [
      { title: 'Aura Pro X Sand', description: 'Be cát matte — case da vegan, tặng túi đựng canvas.' },
      { title: 'Aura Pro X Graphite', description: 'Xám than everyday — luôn có hàng, giao 24h.' },
      { title: 'Lookbook bundle', description: 'Sand + stand sạc + poster A3 lookbook — giảm 250K tháng này.' },
    ],
    benefitsHeadline: 'Chi tiết thẩm mỹ & chất liệu',
    benefits: [
      { title: 'Vỏ nhám chống vân', description: 'Graphite không bóng dầu — lau khăn micro là sạch.' },
      { title: 'Case da vegan', description: 'Chỉ Sand — may tay, không PVC, mùi nhẹ tan sau 2 ngày.' },
      { title: 'Hinge ẩn', description: 'Gập phẳng vào túi — lookbook có shot cận bản lề.' },
    ],
    formHeadline: 'Chọn màu từ lookbook',
    formSub: 'Sand limited — form hiển thị tồn realtime.',
    formSubmit: 'Đặt màu lookbook',
    ctaHeadline: 'Sand sắp hết — giữ slot 24h',
    ctaSub: 'Cọc 200K hoàn trừ vào đơn — hoặc COD full.',
    ctaLabel: 'Giữ Sand limited →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['demo-reel']]: {
    hero: {
      headline: 'Xem Aura Pro X trong 90 giây — ANC, mic gọi và sạc nhanh trên video',
      subheadline:
        'Demo reel: quay thật trên bàn test — máy đo dB, cuộc gọi Zoom và drop test case 80cm. Xem xong chọn gói mua.',
      ctaLabel: 'Xem demo & mua',
      trustPoints: ['Video 4K thực tế', 'Không CGI', 'So sánh Lite vs Pro'],
    },
    videoHeadline: 'Demo reel — Aura Pro X lab test',
    videoSub: 'Quay tại studio Q. 4 — mic ENC, ANC 40dB và sạc 10 phút = 2 giờ.',
    featuresHeadline: 'Điểm nhấn trong video',
    features: [
      { title: 'ANC trước/sau', description: 'Máy đo 38–42dB — quạt server văn phòng.' },
      { title: 'Mic Zoom 3 người', description: 'Không headset rời — đối phương nghe rõ tiếng Việt có dấu.' },
      { title: 'Drop test case', description: 'Rơi 80cm x 3 — hinge vẫn gập mượt.' },
      { title: 'So sánh Lite', description: 'Cùng bài nhạc — Pro X bass sâu hơn ~15% đo SPL.' },
    ],
    pricingHeadline: 'Giá sau khi xem demo',
    pricing: [
      {
        name: 'Pro X',
        price: '2.490.000đ',
        features: ['Như video demo', 'Bảo hành 12 tháng', 'Tips foam tặng'],
        highlighted: true,
      },
      {
        name: 'Demo combo',
        price: '2.790.000đ',
        features: ['Stand Qi', 'Case da Sand', 'Free ship'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Khách mua sau khi xem reel',
    testimonials: [
      {
        quote: 'Video drop test case — quyết định mua vì hay rơi túi balo.',
        author: 'Anh Phong D.',
        role: 'Xem demo · Mua Pro X',
      },
      {
        quote: 'So sánh Lite trong clip — chọn Pro vì ANC open office thật sự cần.',
        author: 'Chị Trang N.',
        role: 'WFH · Q. Binh Thanh',
      },
    ],
    formHeadline: 'Đặt hàng sau demo',
    formSub: 'Ghi “đã xem video” — ưu tiên lô hàng đã quay trong clip.',
    formSubmit: 'Mua như demo',
    ctaHeadline: 'Clip dài 8 phút — unboxing full?',
    ctaSub: 'Để email — gửi link YouTube unboxing chi tiết.',
    ctaLabel: 'Nhận link unboxing →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['faq-buy']]: {
    hero: {
      headline: 'Mua Aura Pro X — FAQ giao hàng, bảo hành và đổi trả trước khi checkout',
      subheadline:
        'FAQ-first buy: 12 câu trả lời về COD, serial chính hãng và nâng cấp SKU — đọc xong đặt hàng, không chat hỏi lặp.',
      ctaLabel: 'Đọc FAQ & đặt mua',
      trustPoints: ['12 FAQ mua hàng', 'COD toàn quốc', 'Serial tra cứu online'],
    },
    benefitsHeadline: 'Tóm tắt lợi ích chính',
    benefits: [
      { title: 'ANC 40dB hybrid', description: 'Đủ cho máy bay và open office — chi tiết trong FAQ specs.' },
      { title: 'Pin 36 giờ', description: '8h tai + 28h case — FAQ có bảng sạc thực tế.' },
      { title: 'Multipoint', description: '2 thiết bị — FAQ hướng dẫn laptop + iPhone.' },
    ],
    faq: [
      {
        question: 'Giao COD mất bao lâu?',
        answer: 'Nội thành 24–48h, tỉnh 2–4 ngày — ship GHN/J&T, kiểm tra hàng trước khi trả tiền.',
      },
      {
        question: 'Làm sao kiểm tra chính hãng?',
        answer: 'Quét QR trong hộp — website hiển thị serial, ngày kích hoạt bảo hành.',
      },
      {
        question: 'Đổi trả 7 ngày điều kiện gì?',
        answer: 'Seal nguyên, chưa qua sử dụng cá nhân — đổi màu/size tips OK, trừ case da khắc tên.',
      },
      {
        question: 'Bảo hành 12 tháng gồm gì?',
        answer: 'Pin phồng, ANC mất, sạc lỗi — 1 đổi 1 lỗi NSX. Hư hỏng do nước ngâm loại trừ.',
      },
      {
        question: 'Có trả góp không?',
        answer: 'Shopee/Kredivo 0% 3 tháng — chọn trên sàn; website chính hãng chuyển khoản hoặc COD.',
      },
      {
        question: 'Sand limited còn hàng không?',
        answer: 'Cập nhật cuối trang — thường restock thứ 6, 800 bộ/lần.',
      },
    ],
    guarantee:
      'Cam kết FAQ: trả lời đúng specs · không phí ẩn COD · serial công khai · đổi trả 7 ngày minh bạch · Zalo support 8:00–22:00.',
    pricingHeadline: 'Giá tham khảo sau FAQ',
    pricing: [
      {
        name: 'Pro X',
        price: '2.490.000đ',
        features: ['FAQ specs đầy đủ', 'Bảo hành 12 tháng', 'COD OK'],
        highlighted: true,
      },
      {
        name: 'Combo FAQ',
        price: '2.790.000đ',
        features: ['Stand Qi', 'Tips foam', 'Free ship nội thành'],
        highlighted: false,
      },
    ],
    formHeadline: 'Đặt mua — đã đọc FAQ',
    formSub: 'Form ngắn — xác nhận COD hoặc chuyển khoản qua Zalo.',
    formSubmit: 'Xác nhận đơn',
    ctaHeadline: 'Còn thắc mắc ngoài FAQ?',
    ctaSub: 'Nhắn Zalo @AuraSupport — trả lời trong 15 phút giờ hành chính.',
    ctaLabel: 'Hỏi thêm trước mua →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['nav-shop']]: {
    hero: {
      headline: 'Aura Shop — chọn tai nghe, phụ kiện và combo, xem giá từng dòng',
      subheadline:
        'Shop nav: header rõ Earbuds · Phụ kiện · Combo · Hỗ trợ — split hero featured Pro X Sand limited + giá Pro X / Lite.',
      ctaLabel: 'Xem shop & giá',
      trustPoints: ['Menu SKU rõ', 'Tồn kho live', 'Free ship combo'],
    },
    featuresHeadline: 'Danh mục shop',
    features: [
      { title: 'Earbuds Pro X', description: 'Graphite & Sand — ANC 40dB, từ 2.490.000đ.' },
      { title: 'Earbuds Lite', description: 'Entry dòng Aura — 1.290.000đ, 4 màu pastel.' },
      { title: 'Phụ kiện', description: 'Stand Qi, tips foam, case da — ship lẻ hoặc bundle.' },
      { title: 'Combo tiết kiệm', description: 'Pro X + stand −250K — Lite đôi −150K.' },
    ],
    galleryHeadline: 'Featured & bestseller tuần',
    gallerySub: 'Sand limited #1 · Graphite #2 · Combo stand #3 doanh số.',
    galleryItems: [
      { title: 'Bestseller Sand', description: 'Restock thứ 6 — 800 bộ, case da kèm.' },
      { title: 'Graphite everyday', description: 'Luôn có hàng — giao 24h nội thành.' },
      { title: 'Stand sạc Qi', description: 'Bán lẻ 390K — combo giảm còn 290K.' },
      { title: 'Tips memory foam', description: '99K/bộ 3 size — addon trên form.' },
    ],
    pricingHeadline: 'Bảng giá shop (tóm tắt)',
    pricing: [
      {
        name: 'Lite',
        price: '1.290.000đ',
        features: ['4 màu', 'Pin 24h', 'Không ANC'],
        highlighted: false,
      },
      {
        name: 'Pro X',
        price: '2.490.000đ',
        features: ['ANC 40dB', 'Pin 36h', '2 màu + Sand limited'],
        highlighted: true,
      },
      {
        name: 'Combo Pro + Stand',
        price: '2.790.000đ',
        features: ['−250K', 'Free ship', 'Túi canvas'],
        highlighted: false,
      },
    ],
    formHeadline: 'Chọn SKU từ menu shop',
    formSub: 'Ghi mã SP nếu có — ví dụ AURA-PRO-SAND.',
    formSubmit: 'Thêm vào đơn',
    ctaHeadline: 'Không tìm thấy phụ kiện?',
    ctaSub: 'Nhắn mã tương thích — tư vấn tips/stand đúng model.',
    ctaLabel: 'Hỏi phụ kiện →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['early-order']]: {
    hero: {
      headline: 'Đặt Aura Pro X ngay — form dưới hero, xác nhận tồn trong 15 phút',
      subheadline:
        'Early order: chọn màu, số lượng và COD trước khi xem gallery dài. Dành khách đã research, cần giữ Sand limited.',
      body: 'Graphite giao 24h · Sand theo batch restock thứ 6.',
      ctaLabel: 'Cuộn xuống — đặt hàng',
      trustPoints: ['Xác nhận 15 phút', 'COD OK', 'Giữ Sand 24h'],
    },
    benefitsHeadline: 'Sau khi gửi form',
    benefits: [
      { title: 'SMS/Zalo xác nhận', description: 'Tồn kho màu bạn chọn — nếu hết, gợi Graphite hoặc đợi batch.' },
      { title: 'COD hoặc CK', description: 'Chọn trên form — không thu phí COD nội thành.' },
      { title: 'Ship trong ngày', description: 'Đơn trước 14h nội thành — GHN same-day zone 1.' },
    ],
    galleryHeadline: 'Teaser sản phẩm (sau form)',
    gallerySub: 'Gallery đầy đủ bên dưới — ưu tiên xác nhận đơn trước.',
    galleryItems: [
      { title: 'Sand limited', description: '800 bộ/batch — form hiển thị số còn lại.' },
      { title: 'Graphite', description: 'Tồn ổn định — giao nhanh nhất.' },
      { title: 'Combo stand', description: 'Addon trên form — giảm 250K.' },
      { title: 'Unboxing box', description: 'Seal chính hãng — QR bảo hành trong hộp.' },
    ],
    pricingHeadline: 'Giá khi đặt sớm',
    pricing: [
      {
        name: 'Pro X',
        price: '2.490.000đ',
        features: ['Một màu', 'Tips S/M/L', 'Bảo hành 12 tháng'],
        highlighted: true,
      },
      {
        name: 'Early combo',
        price: '2.790.000đ',
        features: ['Stand Qi', 'Free ship', 'Giữ Sand 24h'],
        highlighted: false,
      },
    ],
    guarantee:
      'Cam kết early order: xác nhận 15 phút giờ hành chính · giữ Sand 24h sau cọc · hủy trước ship miễn phí · serial gửi kèm Zalo.',
    formHeadline: 'Đặt hàng ngay — 1 phút',
    formSub: 'Màu · số lượng · SĐT · địa chỉ COD — xử lý form trên cùng trước.',
    formSubmit: 'Gửi đơn đặt hàng',
    ctaHeadline: 'Đã gửi form?',
    ctaSub: 'Kiểm tra Zalo @AuraSupport — mã đơn trong 15 phút.',
    ctaLabel: 'Gửi lại form →',
  },

  [PRODUCT_DIRECTION_ARCHITECTURE_IDS['minimal-buy']]: {
    hero: {
      headline: 'Aura Pro X — 2.490.000đ · ANC · giao 24h',
      subheadline: 'Graphite hoặc Sand — một form, COD toàn quốc.',
      ctaLabel: 'Mua',
      trustPoints: ['4.8★', 'Đổi 7 ngày', 'Bảo hành 12 tháng'],
    },
    productHeadline: 'Chọn biến thể',
    productSub: 'Pro X — không Lite, không Max. Đúng SKU, đúng giá.',
    productItems: [
      { title: 'Graphite', description: '2.490.000đ — giao 24h nội thành.' },
      { title: 'Sand limited', description: '2.490.000đ + case da — batch thứ 6.' },
      { title: 'Thêm stand Qi', description: '+290K combo — tick trên form.' },
    ],
    formHeadline: 'Đặt mua — 30 giây',
    formSub: 'Màu · SĐT · địa chỉ.',
    formSubmit: 'Gửi',
    ctaHeadline: 'Cần giao hôm nay',
    ctaSub: 'Form trên — đơn trước 14h zone 1.',
    ctaLabel: 'Mua →',
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

export function patchProductGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: ProductGalleryItem[] | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

export function applyProductDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveProductDirectionStandard(architectureId);
  if (!dir) return blocks;
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
      case 'Video':
        return {
          ...block,
          headline: copy.videoSub
            ? `${copy.videoHeadline || block.headline || ''} — ${copy.videoSub}`.replace(/^ — /, '')
            : copy.videoHeadline || block.headline,
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
          items: (patchProductGalleryItems(block.items, copy.galleryItems) ||
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
            ...(block.items[i] || block.items[0] || { id: `product_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `product_dir_tm_${architectureId}_${i + 1}`,
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
            id: `product_dir_faq_${architectureId}_${i + 1}`,
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

export function listProductDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
