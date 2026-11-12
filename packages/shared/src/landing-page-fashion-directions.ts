/**
 * Fashion direction copy — 7 non-gold premium architectures.
 * Style guide, lookbook, runway video, size FAQ, collection nav, pre-order, minimal drop.
 */

import type { LandingPageBlock } from './landing-page-types';
import type { FashionGoldDirectionCopy, FashionProductItem } from './landing-page-fashion-gold-directions';
import {
  FASHION_DIRECTION_ARCHITECTURE_IDS,
  resolveFashionDirectionStandard,
} from './landing-page-fashion-gold-system';

export type FashionGalleryItem = { title: string; description: string };

const DIRECTIONS: Record<string, FashionGoldDirectionCopy> = {
  [FASHION_DIRECTION_ARCHITECTURE_IDS['style-guide']]: {
    hero: {
      headline: 'Style guide Drop 04 — mặc sao cho đúng form, chọn size theo số đo',
      subheadline:
        'Process-first editorial: timeline styling từ flat lay đến on-body, size chart từng item, rồi product grid. Dành khách muốn hiểu look trước khi mua.',
      body: 'Oversized tee · wide leg · layer tank — palette đen/trắng kem, limited 280 bộ.',
      ctaLabel: 'Xem style guide & shop',
      trustPoints: ['4 bước styling', 'Size chart cm', 'Lookbook editorial'],
    },
    processHeadline: 'Style guide — 4 bước mặc drop này',
    process: [
      {
        title: 'Bước 1 — Chọn palette',
        description: 'Bone white tee + ink black trouser — contrast tối giản, dễ layer thêm outer.',
      },
      {
        title: 'Bước 2 — Proportion',
        description: 'Tee oversized tuck nhẹ trước · wide leg high waist — balance shoulder drop và hem break.',
      },
      {
        title: 'Bước 3 — Layer & phụ kiện',
        description: 'Rib tank stone grey bên trong · canvas tote natural — không quá 3 tone.',
      },
      {
        title: 'Bước 4 — Size theo số đo',
        description: 'Đo ngực/ eo/ dài quần — đối chiếu chart, +1 size nếu prefer loose oversized.',
      },
    ],
    productHeadline: 'Item trong style guide',
    productSub: 'SKU khớp lookbook — size chart link từng card.',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: 'Layer trong/out · relaxed fit · organic cotton 240gsm',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'High waist · hem break 1 lần · wool blend 30%',
        price: '1.290.000đ',
      },
      {
        title: 'Rib Tank — Stone Grey',
        description: 'Base layer · body-skimming · cotton rib XS–L',
        price: '390.000đ',
      },
    ],
    benefitsHeadline: 'Lợi ích đọc style guide trước',
    benefits: [
      {
        title: 'Giảm đổi size',
        description: 'Thấy proportion on-body nhiều chiều cao — chọn size chính xác hơn mua mù.',
      },
      {
        title: 'Mix đồ sẵn có',
        description: 'Gợi cách phối với sneaker/ boot trong tủ — không bắt mua thêm phụ kiện brand.',
      },
      {
        title: 'Care theo fabric',
        description: 'Giặt lạnh, phơi ngang — giữ form tee và drape trouser lâu dài.',
      },
    ],
    galleryHeadline: 'Lookbook styling — studio & street',
    gallerySub: 'Editorial sequence — cùng item, 3 cách phối.',
    galleryItems: [
      {
        title: 'Look 1 — Monochrome minimal',
        description: 'Tee bone + trouser ink · white sneaker · tote natural.',
      },
      {
        title: 'Look 2 — Layer open',
        description: 'Tank stone under tee unbuttoned · trouser cuff 1 fold.',
      },
      {
        title: 'Look 3 — Evening smart',
        description: 'Tee tuck full · trouser + leather loafer · bỏ tote.',
      },
      {
        title: 'Flat lay — size chart visual',
        description: 'Đo flat lay kèm thước — đối chiếu số liệu trên chart.',
      },
    ],
    formHeadline: 'Shop the look — chọn size',
    formSub: 'Ghi look số (1–3) nếu muốn — gợi size theo chiều cao bạn.',
    formSubmit: 'Thêm giỏ style guide',
    ctaHeadline: 'Cần gợi size theo look?',
    ctaSub: 'Gửi chiều cao + look yêu thích — chat trả lời trong 30 phút.',
    ctaLabel: 'Nhận gợi size →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS.lookbook]: {
    hero: {
      headline: 'Lookbook Drop 04 — cuộn gallery editorial, chọn piece yêu thích',
      subheadline:
        'Gallery-first luxury: full-bleed campaign shoot mở đầu — hero copy ngắn giữa lookbook, product grid dưới testimonial stylist. Cảm giác magazine, không catalog.',
      ctaLabel: 'Shop từ lookbook',
      trustPoints: ['12 look editorial', 'Stylist note', 'Limited 280 bộ'],
    },
    galleryHeadline: 'Lookbook — Campaign Drop 04',
    gallerySub: 'Studio + location — natural light, không retouch form body.',
    galleryItems: [
      {
        title: 'Cover look — wide angle',
        description: 'Full drop kit · concrete backdrop · tone đen/trắng kem.',
      },
      {
        title: 'Detail — woven label',
        description: 'Macro stitch · French seam · tem chống giả.',
      },
      {
        title: 'Movement — walk sequence',
        description: 'Trouser drape khi đi — wool blend giữ form.',
      },
      {
        title: 'Portrait — tee shoulder drop',
        description: 'Close-up vai rơi · cotton texture 240gsm.',
      },
      {
        title: 'Street — tote carry',
        description: 'Canvas natural · inner pocket · daily carry scale.',
      },
      {
        title: 'Group — couple palette',
        description: 'Unisex sizing · cùng drop, khác proportion.',
      },
    ],
    productHeadline: 'Shop the lookbook',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: 'Cover look 01 & 04 · unisex XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'Look 01 & 03 · size 26–34',
        price: '1.290.000đ',
      },
      {
        title: 'Canvas Tote — Natural',
        description: 'Look 05 · limited 280 pcs',
        price: '390.000đ',
      },
    ],
    testimonialsHeadline: 'Stylist & editor pick',
    testimonials: [
      {
        quote: 'Drop này proportion chuẩn editorial — wide leg không cần tailor thêm với size chart đúng.',
        author: 'Quỳnh Anh',
        role: 'Stylist · Campaign Drop 04',
      },
      {
        quote: 'Lookbook chụp đủ góc — mua online mà thấy drape trouser như mặc thử.',
        author: 'Khách hàng K.T.',
        role: 'Mua bundle · Q. 1',
      },
    ],
    formHeadline: 'Đặt hàng từ lookbook',
    formSub: 'Ghi số look (01–06) — ưu tiên allocate size hot.',
    formSubmit: 'Checkout lookbook',
    ctaHeadline: 'Look yêu thích sắp hết size',
    ctaSub: '280 bộ toàn drop — lookbook không restock cùng giá.',
    ctaLabel: 'Shop lookbook →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS['runway-video']]: {
    hero: {
      headline: 'Runway Drop 04 — xem show 60 giây, chọn size, checkout',
      subheadline:
        'Video-first campaign: clip runway/editorial walk — thấy movement, drape và styling trước gallery và bảng giá drop.',
      ctaLabel: 'Xem runway & shop',
      trustPoints: ['Video 60s', '4K campaign', 'Giá drop công khai'],
    },
    videoHeadline: 'Runway Drop 04 — full look walk',
    videoSub: 'Campaign video 60 giây · tee, trouser, tote · palette đen/trắng kem.',
    galleryHeadline: 'Still frame từ runway',
    gallerySub: 'Keyframe gallery — pause video tại moment yêu thích.',
    galleryItems: [
      {
        title: 'Opening — wide shot',
        description: 'Model walk-in · full drop kit · studio light.',
      },
      {
        title: 'Mid — turn detail',
        description: 'Trouser drape pivot · tee shoulder line.',
      },
      {
        title: 'Close — fabric macro',
        description: 'Cotton weave · label shot · 240gsm texture.',
      },
      {
        title: 'Closing — group walk',
        description: 'Unisex cast · limited 280 narrative end card.',
      },
    ],
    pricingHeadline: 'Giá drop sau runway',
    pricing: [
      {
        name: 'Tee runway',
        price: '590.000đ',
        features: ['Bone white', 'XS–XXL', 'Limited drop'],
        highlighted: false,
      },
      {
        name: 'Full runway look',
        price: '1.990.000đ',
        period: '/bộ',
        features: ['Tee + trouser + tote', '−15% bundle', 'Free ship nội thành'],
        highlighted: true,
      },
      {
        name: 'Trouser only',
        price: '1.290.000đ',
        features: ['Ink black', 'Size 26–34', 'Wool blend 30%'],
        highlighted: false,
      },
    ],
    productHeadline: 'Item xuất hiện trên runway',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: 'Opening look · video 0:08 · XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'Mid-turn highlight · size 26–34',
        price: '1.290.000đ',
      },
      {
        title: 'Canvas Tote — Natural',
        description: 'Closing frame · 280 pcs',
        price: '390.000đ',
      },
    ],
    formHeadline: 'Shop sau runway — chọn size',
    formSub: 'Đã xem video — ghi size từng SKU, xác nhận tồn kho qua SMS.',
    formSubmit: 'Mua drop runway',
    ctaHeadline: 'Xem runway xong — sẵn sàng checkout?',
    ctaSub: 'Bundle full look −15% · ship nội thành 24h.',
    ctaLabel: 'Shop runway look →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS['faq-size']]: {
    hero: {
      headline: 'Size chart & đổi trả — đọc FAQ, chọn đúng size, mua yên tâm',
      subheadline:
        'FAQ-first: true to size, đo như thế nào, đổi/trả, pre-order — giải đáp hết trước product grid. Phù hợp mua online lần đầu hoặc giữa hai size.',
      ctaLabel: 'Đọc FAQ size & shop',
      trustPoints: ['Size chart cm/inch', 'Đổi size 7 ngày', 'Chat tư vấn size'],
    },
    productHeadline: 'SKU có size chart chi tiết',
    productItems: [
      {
        title: 'Oversized Tee — Bone White',
        description: 'Relaxed fit · đo ngực flat · XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Ink Black',
        description: 'Đo eo + hip + inseam · size 26–34',
        price: '1.290.000đ',
      },
      {
        title: 'Rib Tank — Stone Grey',
        description: 'Body-skimming · true to size · XS–L',
        price: '390.000đ',
      },
    ],
    faq: [
      {
        question: 'Oversized tee true to size không?',
        answer:
          'Relaxed fit — nếu thích oversized rõ, +1 size. 168cm/58kg thường M. Đo ngực flat lay, đối chiếu chart không theo size áo thun thường.',
      },
      {
        question: 'Wide leg đo thế nào?',
        answer: 'Đo eo tự nhiên, mông rộng nhất, inseam từ háng — chart ghi cm/inch. High waist — không order theo size jean low rise.',
      },
      {
        question: 'Giữa 2 size chọn sao?',
        answer: 'Tee: size lớn hơn nếu vai rộng. Trouser: size theo eo — eo lệch >2cm giữa 2 size thì chat gợi size.',
      },
      {
        question: 'Đổi size mất phí không?',
        answer: '1 lần miễn phí 7 ngày nội thành (còn tag, chưa giặt). Ngoại thành khách trả ship 2 chiều lần 2.',
      },
      {
        question: 'Pre-order bao lâu?',
        answer: '10–14 ngày làm việc — ghi trên checkout. Hủy trước khi vào sản xuất hoàn 100%.',
      },
      {
        question: 'Hàng lỗi form?',
        answer: 'Đổi miễn phí hoặc hoàn full — chụp tag + mặc thử gửi Zalo trong 48h nhận hàng.',
      },
    ],
    benefitsHeadline: 'Chính sách size & chăm sóc',
    benefits: [
      {
        title: 'Size chart công khai',
        description: 'Cm/inch + ảnh đo flat — cập nhật mỗi drop.',
      },
      {
        title: 'Chat tư vấn size',
        description: 'Gửi chiều cao/cân nặng/số đo — gợi size 30 phút giờ hành chính.',
      },
      {
        title: 'Care theo fabric',
        description: 'Giặt lạnh 30°C · không sấy nhiệt cao · phơi ngang wool blend.',
      },
    ],
    guarantee:
      'Cam kết size: chart cm/inch minh bạch · đổi 1 lần miễn phí 7 ngày · pre-order hủy trước SX hoàn 100% · chat size T2–CN 9:00–21:00.',
    formHeadline: 'Mua sau FAQ — ghi size rõ',
    formSub: 'Nếu giữa 2 size — ghi số đo, team xác nhận trước ship.',
    formSubmit: 'Xác nhận đơn & size',
    ctaHeadline: 'Vẫn phân vân size?',
    ctaSub: 'Chat Zalo — gợi size miễn phí, không bắt buộc mua.',
    ctaLabel: 'Chat tư vấn size →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS['nav-collection']]: {
    hero: {
      headline: 'Collection nav — chọn line, xem lookbook, so giá drop',
      subheadline:
        'Collection-first: header nav Essentials / Drop 04 / Archive — hero split giới thiệu line active, gallery theo collection, pricing tier rõ.',
      ctaLabel: 'Duyệt collection',
      trustPoints: ['3 collection lines', 'Archive sale', 'Drop pricing'],
    },
    featuresHeadline: 'Collection lines',
    features: [
      {
        title: 'Essentials',
        description: 'Tee, tank, sock — core palette, restock định kỳ, giá ổn định.',
      },
      {
        title: 'Drop 04 — Active',
        description: 'Limited 280 bộ · tee + trouser + tote · countdown drop window.',
      },
      {
        title: 'Archive',
        description: 'Drop cũ còn size — giảm 20–40%, không restock, final sale.',
      },
      {
        title: 'Pre-order queue',
        description: 'Size hot hết — pre-order 10–14 ngày, giá drop giữ đến ship.',
      },
    ],
    galleryHeadline: 'Drop 04 — collection gallery',
    gallerySub: 'Nav Essentials · Drop 04 · Archive — gallery này là line active.',
    galleryItems: [
      {
        title: 'Drop 04 — hero collection',
        description: 'Full kit campaign · limited narrative.',
      },
      {
        title: 'Essentials — tee core',
        description: 'Bone white restock · giá retail ổn định.',
      },
      {
        title: 'Archive — Drop 02 remnant',
        description: 'Final sizes · −30% · no return except defect.',
      },
      {
        title: 'Pre-order — size XXL tee',
        description: 'Queue open · ship 12 ngày · giá drop locked.',
      },
    ],
    pricingHeadline: 'Giá theo collection',
    pricing: [
      {
        name: 'Essentials tee',
        price: '490.000đ',
        features: ['Core restock', 'Đổi size 7 ngày', 'Free ship đơn 1,5tr'],
        highlighted: false,
      },
      {
        name: 'Drop 04 bundle',
        price: '1.990.000đ',
        period: '/bộ',
        features: ['Active drop', 'Limited 280', '−15% vs lẻ'],
        highlighted: true,
      },
      {
        name: 'Archive sale',
        price: '350.000đ',
        period: 'từ',
        features: ['Final sale', 'Còn size lẻ', 'Không đổi trừ lỗi'],
        highlighted: false,
      },
    ],
    productHeadline: 'Drop 04 — collection active',
    productItems: [
      {
        title: 'Oversized Tee — Drop 04',
        description: 'Collection active · bone white · XS–XXL',
        price: '590.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Drop 04',
        description: 'Ink black · size 26–34 · wool blend',
        price: '1.290.000đ',
      },
      {
        title: 'Essentials Rib Tank',
        description: 'Core line · stone grey · restock tuần',
        price: '390.000đ',
      },
    ],
    formHeadline: 'Order từ collection nav',
    formSub: 'Ghi collection (Essentials / Drop 04 / Archive) + SKU + size.',
    formSubmit: 'Thêm giỏ collection',
    ctaHeadline: 'Không thấy size trong Archive?',
    ctaSub: 'Join pre-order queue — giá drop giữ đến khi ship.',
    ctaLabel: 'Pre-order size hot →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS['early-preorder']]: {
    hero: {
      headline: 'Pre-order Drop 04 — form sớm, giữ giá early bird, ship 10–14 ngày',
      subheadline:
        'Early pre-order: form ngay dưới hero — chọn SKU + size trước gallery. Giá early bird lock, cọc 30% giữ slot sản xuất.',
      body: 'Size hot (M tee, 28 trouser) — pre-order tránh hết hàng khi drop mở rộng.',
      ctaLabel: 'Pre-order ngay',
      trustPoints: ['Early bird lock', 'Cọc 30%', 'Hủy trước SX hoàn 100%'],
    },
    benefitsHeadline: 'Lợi ích pre-order sớm',
    benefits: [
      {
        title: 'Giá early bird cố định',
        description: '519.000đ tee · lock tại form — không tăng khi ship.',
      },
      {
        title: 'Ưu tiên size hot',
        description: 'Queue FIFO — form sớm allocate trước public drop.',
      },
      {
        title: 'Hủy linh hoạt',
        description: 'Trước khi vào sản xuất — hoàn 100% cọc, không phí.',
      },
    ],
    galleryHeadline: 'Preview Drop 04 — pre-order trước khi ship',
    gallerySub: 'Sample shoot — màu và form final, label có thể tinh chỉnh minor.',
    galleryItems: [
      {
        title: 'Sample tee — bone white',
        description: 'Pre-production · 240gsm organic · label placement final.',
      },
      {
        title: 'Sample trouser — ink black',
        description: 'High waist wide leg · wool blend 30% · inseam confirmed.',
      },
      {
        title: 'Packaging preview',
        description: 'Kraft box · care card · size guide insert.',
      },
      {
        title: 'Timeline — 10–14 ngày',
        description: 'Cut → sew → QC → ship — SMS update từng giai đoạn.',
      },
    ],
    productHeadline: 'SKU mở pre-order',
    productItems: [
      {
        title: 'Oversized Tee — Pre-order',
        description: 'Early bird 519.000đ · ship 10–14 ngày · XS–XXL',
        price: '519.000đ',
      },
      {
        title: 'Wide-Leg Trouser — Pre-order',
        description: 'Early bird 1.290.000đ · size 26–34 · cọc 30%',
        price: '1.290.000đ',
      },
      {
        title: 'Drop bundle — Pre-order',
        description: '1.690.000đ lock · tee + trouser + tote · free ship',
        price: '1.690.000đ',
      },
    ],
    formHeadline: 'Pre-order Drop 04 — cọc 30% giữ slot',
    formSub: 'SKU · size · SĐT · email — xác nhận queue trong 1 giờ làm việc.',
    formSubmit: 'Gửi pre-order',
    ctaHeadline: 'Queue size M đang đầy',
    ctaSub: 'Form sớm — early bird lock trước public drop 48h.',
    ctaLabel: 'Pre-order sớm →',
  },

  [FASHION_DIRECTION_ARCHITECTURE_IDS['minimal-drop']]: {
    hero: {
      headline: 'Drop 04 — tee. trouser. tote.',
      subheadline: '280 bộ · 7 ngày · giá trên ảnh.',
      ctaLabel: 'Mua',
      trustPoints: ['Limited', 'Ship 24h', 'Đổi size 7 ngày'],
    },
    galleryHeadline: 'Drop 04',
    gallerySub: 'Bone · ink · natural.',
    galleryItems: [
      {
        title: 'Tee — 590k',
        description: 'Bone white · XS–XXL.',
      },
      {
        title: 'Trouser — 1,290k',
        description: 'Ink black · 26–34.',
      },
      {
        title: 'Tote — 390k',
        description: 'Natural canvas · 280 pcs.',
      },
      {
        title: 'Bundle — 1,990k',
        description: '−15% · free ship nội thành.',
      },
    ],
    formHeadline: 'Order',
    formSub: 'Size · SĐT.',
    formSubmit: 'Gửi',
    ctaHeadline: 'Hết drop = hết giá',
    ctaSub: '280 bộ.',
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

export function patchFashionGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: FashionGalleryItem[] | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

export function applyFashionDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveFashionDirectionStandard(architectureId);
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
          items: (patchProductItems(block.items, copy.productItems) ||
            block.items) as typeof block.items,
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
          items: (patchFashionGalleryItems(block.items, copy.galleryItems) ||
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
            ...(block.items[i] || block.items[0] || { id: `fashion_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `fashion_dir_tm_${architectureId}_${i + 1}`,
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
            id: `fashion_dir_faq_${architectureId}_${i + 1}`,
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

export function listFashionDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
