/**
 * Cosmetics direction copy — 7 non-gold premium architectures.
 * Skincare / makeup; routine, lookbook, tutorial, safety FAQ, shop nav, early order, minimal buy.
 */

import type { LandingPageBlock } from './landing-page-types';
import type { CosmeticsGoldDirectionCopy } from './landing-page-cosmetics-gold-directions';
import {
  COSMETICS_DIRECTION_ARCHITECTURE_IDS,
  resolveCosmeticsDirectionStandard,
} from './landing-page-cosmetics-gold-system';

export type CosmeticsGalleryItem = { title: string; description: string };

const DIRECTIONS: Record<string, CosmeticsGoldDirectionCopy> = {
  [COSMETICS_DIRECTION_ARCHITECTURE_IDS.routine]: {
    hero: {
      headline: 'Routine 4 bước — làm đẹp đúng thứ tự, da cải thiện từng tuần',
      subheadline:
        'Process-first skincare: timeline Cleanse → Treat → Moisturize → Protect — xem quy trình trước khi chọn kit. Phù hợp người mới bắt đầu hoặc đang phá routine cũ.',
      body: 'Mỗi bước ghi rõ buổi AM/PM và thời điểm introduce active.',
      ctaLabel: 'Xem routine & chọn kit',
      trustPoints: ['4 bước chuẩn', 'Sticker AM/PM in hộp', 'Video hướng dẫn QR'],
    },
    processHeadline: 'Skincare routine — timeline 4 bước',
    process: [
      {
        title: 'Bước 1 — Cleanse (AM & PM)',
        description: 'Sữa rửa pH 5.5, 60 giây — tẩy SPF/bụi buổi tối, không rửa quá 2 lần/ngày.',
      },
      {
        title: 'Bước 2 — Treat (theo mục tiêu)',
        description: 'Sáng: Vitamin C. Tối: Niacinamide hoặc BHA 2–3x/tuần — không trộn conflict.',
      },
      {
        title: 'Bước 3 — Moisturize',
        description: 'Ceramide cream — khóa ẩm sau serum, đủ trên cổ.',
      },
      {
        title: 'Bước 4 — Protect (chỉ AM)',
        description: 'SPF 50 2mg/cm² — reapply 2–3h ngoài trời; tối bỏ bước này.',
      },
    ],
    galleryHeadline: 'Before / after theo từng bước routine',
    gallerySub: 'Tuần 0 → tuần 2 — cùng ánh sáng, không filter.',
    galleryItems: [
      {
        title: 'Sau bước Cleanse đúng — da ít đỏ',
        description: 'pH balanced — giảm căng sau rửa so với SLS.',
      },
      {
        title: 'Tuần 2 — Treat đúng buổi',
        description: 'Vitamin C sáng + Niacinamide tối — sáng da, ít thâm mụn.',
      },
      {
        title: 'Tuần 3 — Barrier ổn',
        description: 'Ceramide + SPF đủ — TEWL giảm, makeup không mốc.',
      },
      {
        title: 'Routine card — tracking 14 ngày',
        description: 'Khách tick từng buổi AM/PM — tỷ lệ bám routine 78%.',
      },
    ],
    benefitsHeadline: 'Vì sao routine rõ bước quan trọng hơn mua thêm serum',
    benefits: [
      { title: 'Tránh over-exfoliate', description: 'BHA tối 3x/tuần — không dùng mỗi ngày.' },
      { title: 'SPF không bị bỏ', description: 'Bước 4 AM bắt buộc — 80% lão hóa từ UV.' },
      { title: 'Introduce active an toàn', description: 'Tuần 1: 3 đêm/tuần — tăng dần nếu da ổn.' },
    ],
    featuresHeadline: 'Sản phẩm map vào từng bước',
    features: [
      { title: 'Gentle Cleanser', description: 'Bước 1 — mọi loại da.' },
      { title: 'Vitamin C / Niacinamide', description: 'Bước 2 — chọn theo mục tiêu.' },
      { title: 'Ceramide Cream + SPF', description: 'Bước 3 & 4 — khóa ẩm và bảo vệ.' },
    ],
    productHeadline: 'Mua theo bước — hoặc kit đủ 4 bước',
    productSub: 'Kit Routine giảm 20% so với mua lẻ từng chai.',
    productItems: [
      {
        title: 'Routine Step Kit — 4 bước',
        description: 'Cleanser + Treat + Cream + SPF — sticker AM/PM trên nắp.',
        price: '1.190.000đ',
      },
      {
        title: 'Treat Duo — C + Niacinamide',
        description: 'Bước 2 sáng/tối — 2 serum 30ml.',
        price: '790.000đ',
      },
      {
        title: 'AM Essentials',
        description: 'Cleanse + Vitamin C + SPF — 3 bước buổi sáng.',
        price: '890.000đ',
      },
    ],
    pricingHeadline: 'Kit theo routine',
    pricing: [
      {
        name: 'AM Only',
        price: '890.000đ',
        period: '/kit',
        features: ['3 bước sáng', '~30 ngày', 'Thẻ routine AM'],
        highlighted: false,
      },
      {
        name: 'Full 4-Step',
        price: '1.290.000đ',
        period: '/kit',
        features: ['AM + PM đủ', 'Video QR', 'Before/after card'],
        highlighted: true,
      },
      {
        name: 'Acne Routine',
        price: '1.450.000đ',
        period: '/kit',
        features: ['BHA 2% tối', 'Niacinamide AM', 'Consult 10′'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Khách bám routine 14 ngày',
    testimonials: [
      {
        quote: 'Timeline trên web giúp mình không dùng Vitamin C tối nữa — da hết châm chích.',
        author: 'Chị Vy H.',
        role: 'Routine mới · Q. Bình Thạnh',
      },
      {
        quote: 'Sticker AM/PM trên hộp — chồng mình cũng dùng đúng bước.',
        author: 'Chị Hà N.',
        role: 'Full 4-Step · Q. 2',
      },
    ],
    formHeadline: 'Chọn kit routine — giao 24h',
    formSub: 'Ghi loại da và mục tiêu — gợi kit phù hợp trong 1 giờ.',
    formSubmit: 'Đặt kit routine',
    ctaHeadline: 'Tải PDF routine 4 bước?',
    ctaSub: 'Miễn phí — kèm checklist AM/PM in A5.',
    ctaLabel: 'Nhận PDF routine →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS.lookbook]: {
    hero: {
      headline: 'Beauty lookbook — makeup & skincare looks cho từng dịp',
      subheadline:
        'Gallery-first: soft glam office, glass skin weekend, date night glow — xem lookbook before/after, chọn sản phẩm tạo look tương tự.',
      ctaLabel: 'Shop look này',
      trustPoints: ['6 looks cập nhật mùa', 'Product list kèm mỗi look', 'Tutorial 60 giây'],
    },
    galleryHeadline: 'Lookbook — before / after makeup & skin',
    gallerySub: 'MUA thực hiện — sản phẩm brand listed dưới mỗi ảnh.',
    galleryItems: [
      {
        title: 'Glass skin — no makeup base',
        description: 'Skincare only: HA + cream + SPF — glow tự nhiên, không highlight.',
      },
      {
        title: 'Soft office glam',
        description: 'Tint + brow + MLBB — 15 phút, phù hợp đi làm.',
      },
      {
        title: 'Date night dewy',
        description: 'Cushion dewy + cream blush — before matte, after luminous.',
      },
      {
        title: 'Weekend clean girl',
        description: 'Gel brow, lip oil, SPF reapply — minimal product count.',
      },
    ],
    productHeadline: 'Sản phẩm trong từng look',
    productSub: 'Tap look → thêm kit vào giỏ — giảm 10% khi mua đủ list.',
    productItems: [
      {
        title: 'Glass Skin Kit',
        description: 'HA serum + glow cream + SPF fluid — 3 sp tạo base trong veo.',
        price: '950.000đ',
      },
      {
        title: 'Soft Glam Mini',
        description: 'Tint 01 + brow gel + lip velvet — fit trong túi 15cm.',
        price: '620.000đ',
      },
      {
        title: 'Dewy Date Set',
        description: 'Cushion dewy + cream blush + setting spray travel.',
        price: '1.180.000đ',
      },
    ],
    benefitsHeadline: 'Cách dùng lookbook',
    benefits: [
      { title: 'Chọn theo dịp', description: 'Office / weekend / event — filter nhanh trên gallery.' },
      { title: 'List sản phẩm cố định', description: 'Không thiếu sp — add all to cart một lần.' },
      { title: 'Before/after thật', description: 'Cùng model, cùng ánh sáng — không composite.' },
    ],
    processHeadline: 'Từ lookbook → giỏ hàng',
    process: [
      { title: 'Chọn look yêu thích', description: 'Gallery — tap ảnh after xem product breakdown.' },
      { title: 'Thêm kit look', description: 'Bundle giảm 10% — hoặc chọn lẻ từng món.' },
      { title: 'Nhận tutorial QR', description: 'Video 60 giây recreate look — kèm trong hộp.' },
      { title: 'Share #yourlook', description: 'Tag brand — featured trên lookbook tháng sau.' },
    ],
    testimonialsHeadline: 'Beauty creator & khách',
    testimonials: [
      {
        quote: 'Glass skin kit đúng ảnh lookbook — không cần foundation che.',
        author: 'Chị Thảo K.',
        role: 'Glass Skin Kit · Instagram 12K',
      },
      {
        quote: 'Soft glam mini vừa túi xách — touch-up giữa ca làm việc.',
        author: 'Chị Lan M.',
        role: 'Office look · Q. 1',
      },
    ],
    pricingHeadline: 'Look bundles — tiết kiệm 10%',
    pricing: [
      {
        name: 'Single Look',
        price: '620.000đ',
        period: 'từ',
        features: ['3–4 sp/look', 'Tutorial QR', 'Freeship từ 690K'],
        highlighted: false,
      },
      {
        name: '2-Look Bundle',
        price: '1.490.000đ',
        period: '/bộ',
        features: ['Office + weekend', 'Túi makeup', '−10% vs lẻ'],
        highlighted: true,
      },
      {
        name: 'MUA Session',
        price: '2.500.000đ',
        period: '/buổi',
        features: ['90′ tại studio', 'Lookbook personal', 'Sp takeaway'],
        highlighted: false,
      },
    ],
    formHeadline: 'Shop look — đặt hàng',
    formSub: 'Ghi tên look (vd: Glass skin) — pack kit trong 24h.',
    formSubmit: 'Thêm look vào đơn',
    ctaHeadline: 'Muốn look riêng cho event?',
    ctaSub: 'Book MUA session — lookbook cá nhân + sp mang về.',
    ctaLabel: 'Book MUA session →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS.tutorial]: {
    hero: {
      headline: 'Học skincare qua video — apply đúng, không lãng phí serum',
      subheadline:
        'Tutorial-first: xem cách dùng retinol, Vitamin C và SPF — sau đó chọn kit khớp video. Giảm lỗi apply (quá nhiều, sai thứ tự).',
      ctaLabel: 'Xem tutorial & mua kit',
      trustPoints: ['Video 3–8 phút', 'Caption tiếng Việt', 'Kit khớp từng tutorial'],
    },
    videoHeadline: 'Skincare tutorial — apply & liều lượng',
    videoSub: 'BS da liễu host — demo trên da thật, không filter.',
    processHeadline: 'Sau khi xem video',
    process: [
      { title: 'Chọn tutorial theo mục tiêu', description: 'Sáng da / giảm mụn / anti-age — playlist rõ.' },
      { title: 'Mua kit trong video', description: 'SKU hiện góc phải — add cart không sai sp.' },
      { title: 'Apply theo clip', description: 'Pause từng bước — liều 2mg/cm² SPF, 3–4 drop serum.' },
      { title: 'Check-in tuần 2', description: 'Form ngắn — gợi điều chỉnh nếu kích ứng nhẹ.' },
    ],
    benefitsHeadline: 'Lỗi thường gặp video sửa giúp bạn',
    benefits: [
      { title: 'Quá nhiều serum', description: '3–4 drop đủ — thừa không thẩm thấu, bí da.' },
      { title: 'SPF thiếu liều', description: '2mg/cm² ≈ 1/2 thìa cà phê cho mặt + cổ.' },
      { title: 'Retinol quá sớm', description: 'Tuần 1: 2 đêm/tuần — video chỉ ramp-up.' },
    ],
    productHeadline: 'Kit trong video',
    productSub: 'Mua đúng SKU hiển thị — không substitute.',
    productItems: [
      {
        title: 'Vitamin C Tutorial Kit',
        description: 'Serum 15% + SPF + cleanser — như clip “Sáng da 14 ngày”.',
        price: '980.000đ',
      },
      {
        title: 'Retinol Intro Kit',
        description: 'Retinol 0.3% + barrier cream — clip “Retinol không bong da”.',
        price: '1.120.000đ',
      },
      {
        title: 'Acne BHA Kit',
        description: 'BHA 2% + niacinamide — clip “Lỗ chân lông & mụn ẩn”.',
        price: '850.000đ',
      },
    ],
    pricingHeadline: 'Kit kèm tutorial premium',
    pricing: [
      {
        name: 'Video + Starter',
        price: '690.000đ',
        period: '/kit',
        features: ['1 tutorial', '3 sp cơ bản', 'Access playlist 30 ngày'],
        highlighted: false,
      },
      {
        name: 'Video + Full',
        price: '1.290.000đ',
        period: '/kit',
        features: ['Full routine video', '5 sp', 'Check-in tuần 2'],
        highlighted: true,
      },
      {
        name: '1-on-1 Video Call',
        price: '450.000đ',
        period: '/15′',
        features: ['Review routine bạn', 'Screen share apply', 'Ghi chú PDF'],
        highlighted: false,
      },
    ],
    galleryHeadline: 'Frame before / after từ tutorial',
    gallerySub: 'Screenshot từ video — cùng góc quay host.',
    galleryItems: [
      {
        title: 'Clip Vitamin C — ngày 0 vs 14',
        description: 'Frame 04:12 vs 07:45 — tone đều hơn.',
      },
      {
        title: 'Retinol — tuần 1 vs 4',
        description: 'Texture mịn, ít bong — đúng ramp trong video.',
      },
      {
        title: 'SPF apply — đủ vs thiếu liều',
        description: 'UV camera demo — vùng thiếu tia UV xanh.',
      },
      {
        title: 'BHA — blackhead before/after',
        description: '1 lần peel nhẹ — không đầu đen nổi bật sau 7 ngày.',
      },
    ],
    faq: [
      {
        question: 'Video có thay thế bác sĩ không?',
        answer: 'Không — giáo dục apply. Da bệnh lý cần khám trực tiếp.',
      },
      {
        question: 'Kit hết hàng khác SKU video thì sao?',
        answer: 'Thông báo trước — chỉ substitute cùng nồng độ, bạn duyệt trước ship.',
      },
    ],
    formHeadline: 'Mua kit sau khi xem tutorial',
    formSub: 'Ghi mã video (vd: VC-14) — pack đúng SKU clip.',
    formSubmit: 'Đặt kit tutorial',
    ctaHeadline: 'Playlist đầy đủ trên YouTube',
    ctaSub: 'Subscribe — tutorial mới mỗi tuần.',
    ctaLabel: 'Xem playlist →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS['faq-safe']]: {
    hero: {
      headline: 'Mỹ phẩm an toàn — FAQ dị ứng, thai kỳ và da treatment',
      subheadline:
        'Safety-first: đọc FAQ thành phần, patch-test và tương tác thuốc trước khi mua. Giảm hoàn hàng vì kích ứng hoặc sai kỳ vọng.',
      ctaLabel: 'Đọc FAQ & chọn sp an toàn',
      trustPoints: ['12 FAQ cập nhật', 'INCI QR mỗi hộp', 'Hotline da liễu'],
    },
    benefitsHeadline: 'Cam kết an toàn sản phẩm',
    benefits: [
      { title: 'Không paraben · cồn denat', description: 'Formula clean label — list trên FAQ.' },
      { title: 'Patch-test khuyến nghị', description: 'Sample 3ml mọi đơn đầu — cổ tay 24h.' },
      { title: 'Đổi sp nếu kích seal nguyên', description: '7 ngày — đổi sang line sensitive.' },
    ],
    faq: [
      {
        question: 'Da dị ứng mùi hương có dùng được không?',
        answer: 'Chọn line Fragrance-Free — không hương tổng hợp; vẫn patch-test vì tinh dầu gốc có thể có.',
      },
      {
        question: 'Mang thai / cho con bú?',
        answer: 'Tránh retinol, salicylic >2%, essential oil mạnh. Barrier + SPF + Vitamin C thấp OK — consult bác sĩ.',
      },
      {
        question: 'Đang dùng thuốc bác sĩ (tretinoin, isotretinoin)?',
        answer: 'Chỉ dùng cleanser dịu + barrier + SPF — không BHA/AHA/retinol OTC trừ khi BS đồng ý.',
      },
      {
        question: 'Da eczema / rosacea?',
        answer: 'Line Calm — panthenol + madecassoside. Tránh exfoliant mạnh; hotline da liễu trước khi mua treat.',
      },
      {
        question: 'Có comedogenic không?',
        answer: 'Đa số sp rating 0–1 trên scale — bảng chi tiết từng SKU trong FAQ PDF.',
      },
      {
        question: 'Test trên động vật?',
        answer: 'Không — cruelty-free, lab in vitro.',
      },
    ],
    guarantee:
      'Cam kết an toàn: INCI công khai · patch-test khuyến nghị · đổi line sensitive 7 ngày · hotline da liễu T2–CN 9:00–21:00.',
    galleryHeadline: 'Da nhạy cảm — before / after an toàn',
    gallerySub: 'Patch-test pass — routine Fragrance-Free 14 ngày.',
    galleryItems: [
      {
        title: 'Rosacea nhẹ — giảm đỏ',
        description: 'Calm serum + barrier — không AHA 14 ngày.',
      },
      {
        title: 'Eczema patch — không sting',
        description: 'Cream ceramide — stinging score 0/10 sau apply.',
      },
      {
        title: 'Mang thai — routine approved',
        description: 'Cleanser + SPF + HA — consult BS trước khi thêm active.',
      },
      {
        title: 'Patch-test fail → đổi sp',
        description: 'Đỏ cổ tay 24h — đổi sang line simpler, miễn phí ship.',
      },
    ],
    processHeadline: 'Quy trình mua an toàn',
    process: [
      { title: 'Đọc FAQ & INCI', description: 'Scan QR hoặc FAQ web — check allergen của bạn.' },
      { title: 'Patch-test 24h', description: 'Sample 3ml — đỏ/rát thì dừng, liên hệ hotline.' },
      { title: 'Introduce chậm', description: '1 sp mới / tuần — biết chính xác sp gây kích nếu có.' },
      { title: 'Theo dõi & hỗ trợ', description: 'Hotline da liễu — điều chỉnh hoặc đổi sp.' },
    ],
    productHeadline: 'Line an toàn — Fragrance-Free',
    productSub: 'Phù hợp da nhạy cảm, thai kỳ (consult BS), post-treatment.',
    productItems: [
      {
        title: 'Sensitive Cleanser 150ml',
        description: 'Không sulfate, không hương — pH 5.5.',
        price: '295.000đ',
      },
      {
        title: 'Barrier Cream 50ml',
        description: 'Ceramide + panthenol — không retinol, không acid.',
        price: '520.000đ',
      },
      {
        title: 'Mineral SPF 50 50ml',
        description: 'Zinc oxide — không chemical filter nếu bạn dị ứng oxybenzone.',
        price: '410.000đ',
      },
    ],
    testimonialsHeadline: 'Khách da nhạy cảm',
    testimonials: [
      {
        quote: 'FAQ ghi rõ thai kỳ dùng gì — không phải chat hỏi lại.',
        author: 'Chị Ngọc T.',
        role: 'Mang thai 28 tuần · Q. 7',
      },
      {
        quote: 'Patch-test fail — shop đổi barrier cream miễn phí, không tranh cãi.',
        author: 'Chị Phương L.',
        role: 'Da eczema · Q. Gò Vấp',
      },
    ],
    formHeadline: 'Mua sp an toàn — kèm patch-test',
    formSub: 'Ghi allergen đã biết — lọc sp trước khi gửi.',
    formSubmit: 'Đặt hàng an toàn',
    ctaHeadline: 'Không chắc sp nào?',
    ctaSub: 'Hotline da liễu — trả lời trong giờ hành chính.',
    ctaLabel: 'Nhắn tư vấn an toàn →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS['nav-shop']]: {
    hero: {
      headline: 'Shop skincare — chọn dòng sản phẩm, xem giá, đặt hàng',
      subheadline:
        'Shop nav: browse theo concern (mụn, sáng da, anti-age) hoặc theo bước (cleanse, treat, protect) — self-serve trước khi form.',
      ctaLabel: 'Duyệt shop & đặt hàng',
      trustPoints: ['4 dòng sản phẩm', 'Giá hiển thị sẵn', 'Freeship từ 690K'],
    },
    featuresHeadline: 'Duyệt theo concern',
    features: [
      { title: 'Mụn & lỗ chân lông', description: 'BHA + Niacinamide + gel dưỡng nhẹ.' },
      { title: 'Sáng da & thâm', description: 'Vitamin C + Alpha arbutin + SPF.' },
      { title: 'Anti-age & firm', description: 'Retinol 0.3% + peptide cream.' },
      { title: 'Da nhạy cảm', description: 'Fragrance-free line — barrier focus.' },
    ],
    processHeadline: 'Luồng shop nav',
    process: [
      { title: 'Chọn concern hoặc bước', description: 'Header nav — filter sp theo mục tiêu da.' },
      { title: 'Xem giá & dung tích', description: 'Giá/ml công khai — so sánh trước khi thêm giỏ.' },
      { title: 'Thêm kit hoặc lẻ', description: 'Kit concern giảm 15% — hoặc mix tự chọn.' },
      { title: 'Checkout & ship', description: 'COD/chuyển khoản — 24–48h nội thành.' },
    ],
    galleryHeadline: 'Swatch & texture theo dòng',
    gallerySub: 'Serum, cream, SPF — finish trên da Fitzpatrick III–IV.',
    galleryItems: [
      { title: 'Vitamin C — vàng nhạt, thấm 30s', description: 'Không sticky — makeup sau 1 phút.' },
      { title: 'Niacinamide — gel trong', description: 'Matte nhẹ — da dầu ưa chuộng.' },
      { title: 'SPF fluid — không white cast', description: 'Before gray cast sp khác vs ours.' },
      { title: 'Retinol cream — ivory mịn', description: 'Spread dễ — 1 pea-size cho cả mặt.' },
    ],
    productHeadline: 'Bestseller theo concern',
    productSub: 'Top 3 mỗi dòng — cập nhật theo doanh số tháng.',
    productItems: [
      {
        title: 'Clear Skin Trio',
        description: 'BHA + Niacinamide + gel — concern mụn.',
        price: '890.000đ',
      },
      {
        title: 'Bright Duo',
        description: 'Vitamin C + SPF — concern sáng da.',
        price: '720.000đ',
      },
      {
        title: 'Sensitive Set',
        description: 'Cleanser + barrier + mineral SPF.',
        price: '980.000đ',
      },
    ],
    pricingHeadline: 'Kit theo concern — giá shop',
    pricing: [
      {
        name: 'Concern Duo',
        price: '720.000đ',
        period: 'từ',
        features: ['2 sp', '−10% vs lẻ', 'Freeship từ 690K'],
        highlighted: false,
      },
      {
        name: 'Concern Trio',
        price: '990.000đ',
        period: '/kit',
        features: ['3 sp full step', '−15%', 'Túi travel'],
        highlighted: true,
      },
      {
        name: 'Build Your Routine',
        price: 'Liên hệ',
        features: ['4+ sp', 'Giảm theo số lượng', 'Consult miễn phí'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Khách shop theo nav',
    testimonials: [
      {
        quote: 'Filter “da nhạy cảm” ra đúng line — không lẫn retinol.',
        author: 'Chị Oanh V.',
        role: 'Sensitive nav · Q. 10',
      },
      {
        quote: 'Giá/ml so sánh trên trang — biết chai nào value hơn.',
        author: 'Anh Minh D.',
        role: 'Bright Duo · Q. 3',
      },
    ],
    formHeadline: 'Đặt hàng — đã chọn từ shop',
    formSub: 'List sp hoặc kit concern — xác nhận tồn kho qua Zalo.',
    formSubmit: 'Xác nhận đơn',
    ctaHeadline: 'Không tìm thấy concern của bạn?',
    ctaSub: 'Quiz 5 câu — map sang dòng phù hợp.',
    ctaLabel: 'Làm quiz da →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS['early-order']]: {
    hero: {
      headline: 'Đặt mỹ phẩm ngay — form dưới đầu trang, giao 24h nội thành',
      subheadline:
        'Early order: high-intent — chọn kit hoặc sp, SĐT và địa chỉ trước khi xem gallery. Dành khách đã biết cần routine gì.',
      body: 'Serum, kit, SPF — một form, xác nhận Zalo trong 30 phút.',
      ctaLabel: 'Cuộn xuống — đặt hàng ngay',
      trustPoints: ['Xác nhận 30 phút', 'COD OK', 'Đổi 7 ngày seal nguyên'],
    },
    benefitsHeadline: 'Sau khi gửi form',
    benefits: [
      { title: 'Xác nhận nhanh', description: 'Zalo/SMS — chốt sp, phí ship, thời gian giao.' },
      { title: 'COD hoặc chuyển khoản', description: 'Không bắt ví — thanh toán khi nhận nếu COD.' },
      { title: 'Patch-test kèm đơn đầu', description: 'Sample 3ml — test trước khi mở full size.' },
    ],
    processHeadline: 'Form → giao hàng',
    process: [
      { title: 'Gửi form 1 phút', description: 'Kit/sp, SĐT, địa chỉ — ưu tiên xử lý form trên cùng.' },
      { title: 'Xác nhận 30 phút', description: 'CS gọi hoặc Zalo — tồn kho và phí ship.' },
      { title: 'Pack & ship', description: 'Hộp chống vỡ — tracking gửi SMS.' },
      { title: 'Nhận & patch-test', description: 'Test 24h — mở full nếu da ổn.' },
    ],
    galleryHeadline: 'Teaser before / after (sau khi đặt)',
    gallerySub: 'Xem full gallery trong email xác nhận — ưu tiên ship trước.',
    galleryItems: [
      { title: 'Kit Full — glow tuần 2', description: 'Teaser crop — full ảnh trong email.' },
      { title: 'Serum Niacinamide — texture', description: 'Gel trong — thấm nhanh.' },
      { title: 'Unboxing standard', description: 'Hộp cứng + bubble wrap.' },
      { title: 'SPF finish — no cast', description: 'Da medium tone — natural finish.' },
    ],
    productHeadline: 'Đặt nhanh — kit phổ biến',
    productSub: 'Ghi mã kit trong form — CS không hỏi lại.',
    productItems: [
      {
        title: 'Kit Full Routine — mã FR-1290',
        description: '5 sp AM/PM — bestseller 45 ngày.',
        price: '1.290.000đ',
      },
      {
        title: 'Starter — mã ST-690',
        description: '3 sp essentials — thử brand.',
        price: '690.000đ',
      },
      {
        title: 'SPF Restock — mã SPF-329',
        description: 'Chai 50ml — khách tái mua nhiều nhất.',
        price: '329.000đ',
      },
    ],
    pricingHeadline: 'Giá kit — đặt sớm freeship',
    pricing: [
      {
        name: 'Starter ST-690',
        price: '690.000đ',
        period: 'COD OK',
        features: ['3 sp', 'Freeship nội thành', 'Patch-test kèm'],
        highlighted: false,
      },
      {
        name: 'Full FR-1290',
        price: '1.290.000đ',
        period: 'COD OK',
        features: ['5 sp', 'Freeship', 'Routine card'],
        highlighted: true,
      },
      {
        name: 'Pro PR-1890',
        price: '1.890.000đ',
        period: 'COD OK',
        features: ['6 sp + consult', 'Gift box', 'Refill −10%'],
        highlighted: false,
      },
    ],
    guarantee:
      'Cam kết early order: xác nhận 30 phút giờ hành chính · không spam marketing · đổi 7 ngày seal nguyên · COD miễn phí nội thành.',
    testimonialsHeadline: 'Khách đặt form đầu trang',
    testimonials: [
      {
        quote: 'Biết cần kit Full — form đầu trang, 15 phút có Zalo xác nhận.',
        author: 'Chị Thu H.',
        role: 'FR-1290 · Q. 7',
      },
      {
        quote: 'COD tiện — không phải chuyển khoản trước khi biết đúng sp.',
        author: 'Anh Khoa P.',
        role: 'Starter · Q. Bình Thạnh',
      },
    ],
    formHeadline: 'Đặt hàng — 1 phút',
    formSub: 'Kit/sp · SĐT · địa chỉ — ưu tiên form trên cùng trang.',
    formSubmit: 'Gửi đơn ngay',
    ctaHeadline: 'Đã gửi form?',
    ctaSub: 'Kiểm tra Zalo — CS phản hồi sớm nhất.',
    ctaLabel: 'Gửi lại form →',
  },

  [COSMETICS_DIRECTION_ARCHITECTURE_IDS['minimal-buy']]: {
    hero: {
      headline: 'Skincare gọn — serum, SPF, đặt hàng',
      subheadline: 'Serum · SPF · kit 3 món — form tối giản, giao nhanh.',
      ctaLabel: 'Mua ngay',
      trustPoints: ['Freeship từ 690K', 'Đổi 7 ngày', 'INCI QR'],
    },
    processHeadline: '3 bước',
    process: [
      { title: 'Chọn sp/kit', description: 'Starter hoặc 1–2 chai — không quiz dài.' },
      { title: 'Form 30 giây', description: 'SĐT + địa chỉ — COD OK.' },
      { title: 'Nhận hàng', description: '24–48h nội thành — patch-test kèm.' },
    ],
    benefitsHeadline: 'Best seller',
    benefits: [
      { title: 'Niacinamide 10%', description: '389K — sebum & thâm.' },
      { title: 'SPF 50 fluid', description: '329K — không white cast.' },
      { title: 'Starter kit', description: '690K — 3 sp, freeship.' },
    ],
    productHeadline: 'Mua nhanh',
    productSub: 'Giá đã gồm VAT.',
    productItems: [
      {
        title: 'Niacinamide 10% 30ml',
        description: 'Gel thấm nhanh — AM/PM.',
        price: '389.000đ',
      },
      {
        title: 'SPF 50 Fluid 50ml',
        description: 'Finish nhẹ — reapply friendly.',
        price: '329.000đ',
      },
      {
        title: 'Starter Kit 3 món',
        description: 'Cleanse + serum + SPF.',
        price: '690.000đ',
      },
    ],
    formHeadline: 'Đặt hàng — 30 giây',
    formSub: 'SĐT · địa chỉ · sp/kit.',
    formSubmit: 'Gửi',
    ctaHeadline: 'Cần giao hôm nay',
    ctaSub: 'Form trên — nội thành cutoff 15h.',
    ctaLabel: 'Mua ngay →',
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

export function patchCosmeticsGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: CosmeticsGalleryItem[] | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

export function applyCosmeticsDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveCosmeticsDirectionStandard(architectureId);
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
          items: (patchCosmeticsGalleryItems(block.items, copy.galleryItems) ||
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
            ...(block.items[i] || block.items[0] || { id: `cosmetics_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `cosmetics_dir_tm_${architectureId}_${i + 1}`,
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
            id: `cosmetics_dir_faq_${architectureId}_${i + 1}`,
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

export function listCosmeticsDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
