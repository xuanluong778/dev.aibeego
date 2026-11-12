/**
 * Service gold-standard copy — local-book / neighborhood-trust / package-pro.
 */

import type { LandingPageBlock } from './landing-page-types';
import {
  SERVICE_GOLD_ARCHITECTURE_IDS,
  type ServiceGoldStandard,
  resolveServiceGoldStandard,
} from './landing-page-service-gold-system';

export type ServiceGoldDirectionCopy = {
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

const DIRECTIONS: Record<string, ServiceGoldDirectionCopy> = {
  [SERVICE_GOLD_ARCHITECTURE_IDS['local-book']]: {
    hero: {
      headline: 'Thợ sửa điện nước & vệ sinh nhà — đặt lịch trong 2 phút, có mặt trong ngày',
      subheadline:
        'Booking-first cho dịch vụ tại nhà: chọn khung giờ, báo giá sơ bộ qua điện thoại, thợ đến đúng giờ. Phục vụ quận nội thành TP.HCM.',
      body: 'Sửa chữa, vệ sinh, điện nước — một form, một lần xác nhận, không gọi quấy rối.',
      ctaLabel: 'Đặt lịch ngay',
      trustPoints: ['Có mặt trong 2–4 giờ', 'Báo giá trước khi làm', 'Thợ có CMND & bảo hiểm'],
    },
    processHeadline: 'Quy trình đặt lịch 4 bước',
    process: [
      { title: 'Chọn dịch vụ & giờ', description: 'Điện, nước, vệ sinh hoặc sửa chữa — chọn slot phù hợp lịch bạn.' },
      { title: 'Xác nhận qua Zalo/SMS', description: 'Đội điều phối gọi trong 30 phút — báo giá sơ bộ và thời gian đến.' },
      { title: 'Thợ đến & khảo sát', description: 'Kiểm tra hiện trạng, chốt phí trước khi bắt đầu — không làm thêm khi chưa đồng ý.' },
      { title: 'Hoàn thành & bảo hành', description: 'Biên bản nghiệm thu, bảo hành 7–30 ngày tùy hạng mục.' },
    ],
    benefitsHeadline: 'Dịch vụ tại nhà phổ biến',
    benefits: [
      { title: 'Sửa điện & ống nước', description: 'Rò rỉ, chập điện, tắc cống — thợ có dụng cụ, vật tư phổ thông sẵn trên xe.' },
      { title: 'Vệ sinh nhà & văn phòng', description: 'Vệ sinh theo giờ hoặc trọn gói — checklist rõ từng khu vực.' },
      { title: 'Sửa chữa nhỏ lẻ', description: 'Treo kệ, lắp rèm, sơn vá — báo giá theo công + vật tư minh bạch.' },
    ],
    featuresHeadline: 'Vì sao đặt lịch online tiện hơn gọi điện',
    features: [
      { title: 'Slot thật, không chờ', description: 'Lịch thợ cập nhật theo ca — bạn thấy khung giờ còn trống trước khi gửi.' },
      { title: 'Nhắc lịch tự động', description: 'SMS/Zalo trước 1 giờ — đổi lịch miễn phí trước 2 giờ.' },
      { title: 'Thanh toán linh hoạt', description: 'Tiền mặt, chuyển khoản hoặc ví điện tử — hóa đơn VAT khi cần.' },
    ],
    galleryHeadline: 'Công việc thực tế tại nhà khách',
    gallerySub: 'Trước / sau sửa chữa — ảnh chụp tại hiện trường, đã được khách đồng ý chia sẻ.',
    galleryItems: [
      { title: 'Sửa rò rỉ ống nước bếp', description: 'Thay khớp nối, kiểm tra áp lực — hoàn thành 45 phút, Q.7.' },
      { title: 'Vệ sinh căn hộ 2PN', description: '3 giờ, 2 nhân sự — bếp, WC, sàn và ban công theo checklist.' },
      { title: 'Thay aptomat & ổ cắm', description: 'An toàn điện, test dò rò — biên bản nghiệm thu ký tay.' },
      { title: 'Thông cống WC', description: 'Máy lò xo + hóa chất an toàn — bảo hành tắc lại 7 ngày.' },
    ],
    testimonialsHeadline: 'Khách hàng khu vực nội thành',
    testimonials: [
      {
        quote: 'Đặt lịch sáng, thợ đến trưa đúng giờ. Báo giá trước khi sửa — không phát sinh.',
        author: 'Anh Hùng T.',
        role: 'Sửa điện · Q. Bình Thạnh',
      },
      {
        quote: 'Vệ sinh nhà cuối tuần — checklist rõ, nhân viên lịch sự.',
        author: 'Chị Ngọc P.',
        role: 'Vệ sinh 3 giờ · Q. 3',
      },
    ],
    pricingHeadline: 'Bảng giá tham khảo',
    pricing: [
      {
        name: 'Sửa nhanh',
        price: '150.000đ',
        period: 'từ',
        features: ['30 phút đầu', 'Vật tư cơ bản', 'Bảo hành 7 ngày'],
        highlighted: false,
      },
      {
        name: 'Vệ sinh theo giờ',
        price: '120.000đ',
        period: '/giờ',
        features: ['Tối thiểu 2 giờ', '2 nhân sự từ 4 giờ', 'Dụng cụ mang theo'],
        highlighted: true,
      },
      {
        name: 'Trọn gói căn hộ',
        price: 'Liên hệ',
        features: ['Khảo sát miễn phí', 'Combo điện nước + vệ sinh', 'Hợp đồng định kỳ'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Thợ có mặt trong bao lâu sau khi đặt lịch?',
        answer: 'Nội thành: thường 2–4 giờ trong giờ hành chính. Ca tối và cuối tuần — xác nhận khi gọi lại.',
      },
      {
        question: 'Phí có phát sinh khi thợ đến không?',
        answer: 'Không. Thợ khảo sát, báo giá — bạn đồng ý mới làm. Từ chối không mất phí đi lại trong nội thành.',
      },
      {
        question: 'Có bảo hành công việc không?',
        answer: 'Có — 7 ngày cho sửa chữa thông thường, 30 ngày cho thay thế linh kiện chính hãng.',
      },
    ],
    guarantee:
      'Cam kết đặt lịch: thợ đúng giờ · báo giá trước khi làm · CMND & bảo hiểm trách nhiệm · bảo hành có biên bản · hỗ trợ T2–CN 7:00–21:00.',
    formHeadline: 'Đặt lịch thợ — xác nhận trong 30 phút',
    formSub: 'Chọn dịch vụ, địa chỉ và khung giờ — đội điều phối gọi lại sớm nhất.',
    formSubmit: 'Gửi yêu cầu đặt lịch',
    ctaHeadline: 'Cần thợ gấp hôm nay?',
    ctaSub: 'Ca còn trống — gửi form, chúng tôi ưu tiên sắp lịch.',
    ctaLabel: 'Đặt lịch ngay →',
  },

  [SERVICE_GOLD_ARCHITECTURE_IDS['neighborhood-trust']]: {
    hero: {
      headline: 'Thợ điện nước uy tín khu phố — hàng xóm tin, làm việc minh bạch',
      subheadline:
        'Neighborhood trust: thợ quen khu vực, đánh giá thật từ khách cùng phường, không quảng cáo phóng đại. Phục vụ lâu năm tại Q. Tân Bình & lân cận.',
      ctaLabel: 'Đặt lịch thợ quen khu',
      trustPoints: ['500+ job cùng quận', '4.9★ Google Maps', 'Thợ cố định, không đổi người'],
    },
    processHeadline: 'Cách chúng tôi làm việc với cư dân địa phương',
    process: [
      { title: 'Giới thiệu qua hàng xóm', description: 'Nhiều khách đến từ referral — chúng tôi ghi nhận khu vực ưu tiên phục vụ.' },
      { title: 'Khảo sát tại nhà', description: 'Thợ quen mặt, biết loại nhà phổ biến trong phường — ước lượng nhanh, chính xác.' },
      { title: 'Làm việc & dọn dẹp', description: 'Che bảo vệ nội thất, thu gom rác thải — để nhà sạch như lúc đến.' },
      { title: 'Theo dõi sau việc', description: 'Gọi hỏi thăm 24h — hỗ trợ bảo hành không cần gọi tổng đài.' },
    ],
    benefitsHeadline: 'Điểm khác biệt khi chọn thợ khu phố',
    benefits: [
      { title: 'Quen đường, đến nhanh', description: 'Thợ trú cùng quận — không chờ cả buổi vì kẹt xa.' },
      { title: 'Giá ổn định theo khu', description: 'Bảng giá tham khảo công khai — khách quen được ưu đãi nhỏ.' },
      { title: 'Một thợ phụ trách', description: 'Cùng người từ lần đầu — nhớ lịch sử nhà bạn, không phải giải thích lại.' },
    ],
    featuresHeadline: 'Dịch vụ thường gọi tại khu dân cư',
    features: [
      { title: 'Điện dân dụng', description: 'Sửa quạt, đèn, ổ cắm, aptomat — an toàn theo tiêu chuẩn.' },
      { title: 'Nước & vệ sinh', description: 'Rò rỉ, thay sen, vệ sinh bồn nước, thông cống nhà phố.' },
      { title: 'Bảo trì định kỳ', description: 'Gói kiểm tra điện nước 6 tháng/lần — nhắc lịch qua Zalo.' },
    ],
    galleryHeadline: 'Việc đã làm gần khu bạn',
    gallerySub: 'Ảnh thực tế tại nhà khách — nhiều job cách bạn vài đường.',
    galleryItems: [
      { title: 'Sửa bình nóng lạnh — Phường 4', description: 'Thay thanh magie, kiểm tra rò — khách hàng 3 năm liền.' },
      { title: 'Vệ sinh máy lạnh dãy trọ', description: '12 máy, 1 ngày — chủ nhà trọ Q. Tân Bình giới thiệu sang hàng xóm.' },
      { title: 'Thay đường ống bếp nhà phố', description: 'Inox 304, bảo hành 12 tháng — before/after cùng góc chụp.' },
      { title: 'Sửa khóa cửa khẩn cấp', description: 'Ca tối — thợ quen tòa nhà, không đụng phá cửa.' },
    ],
    testimonialsHeadline: 'Hàng xóm & khách quen khu',
    testimonials: [
      {
        quote: 'Thợ nhà cạnh giới thiệu — đến nhanh, giá như hàng xóm nói, không chém.',
        author: 'Chú Minh V.',
        role: 'Sửa ống nước · P. 4, Q. Tân Bình',
      },
      {
        quote: 'Lần thứ năm gọi cùng anh thợ — nhớ luôn chỗ hay hỏng ở nhà mình.',
        author: 'Chị Thảo L.',
        role: 'Bảo trì điện nước · Q. Phú Nhuận',
      },
      {
        quote: 'Đánh giá Google thật — mình check trước khi nhắn, yên tâm mời vào nhà.',
        author: 'Anh Kiên H.',
        role: 'Vệ sinh máy lạnh · Q. Gò Vấp',
      },
    ],
    pricingHeadline: 'Giá tham khảo khu vực',
    pricing: [
      {
        name: 'Gọi thường',
        price: '180.000đ',
        period: 'từ',
        features: ['Công 1 giờ đầu', 'Vật tư báo riêng', 'Khách quen −10%'],
        highlighted: false,
      },
      {
        name: 'Gói hàng xóm',
        price: '890.000đ',
        period: '/năm',
        features: ['2 lần kiểm tra', 'Ưu tiên ca gấp', 'Một thợ phụ trách'],
        highlighted: true,
      },
      {
        name: 'Doanh nghiệp nhỏ',
        price: 'Liên hệ',
        features: ['Văn phòng / shophouse', 'Hóa đơn VAT', 'Hợp đồng bảo trì'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Làm sao biết đánh giá là thật?',
        answer: 'Link Google Maps công khai — bạn xem review có ảnh, có phản hồi của shop. Không mua review.',
      },
      {
        question: 'Thợ có cố định không hay mỗi lần một người?',
        answer: 'Cùng khu vực: ưu tiên một thợ phụ trách. Nếu bận, báo trước và giới thiệu thợ cùng team quen tay nghề.',
      },
      {
        question: 'Có phục vụ ngoài quận quen không?',
        answer: 'Có — phí di chuyển báo trước. Khách trong bán kính 5 km thường miễn phí đi lại.',
      },
    ],
    guarantee:
      'Cam kết khu phố: thợ có CMND · giá nói trước làm sau · dọn sạch hiện trường · bảo hành có biên bản · số hotline thợ trực tiếp, không trung gian.',
    formHeadline: 'Đặt lịch thợ khu vực',
    formSub: 'Ghi rõ phường/quận — ưu tiên thợ quen địa bàn gần bạn.',
    formSubmit: 'Gửi yêu cầu',
    ctaHeadline: 'Muốn thợ quen như hàng xóm giới thiệu?',
    ctaSub: 'Để lại SĐT — thợ khu bạn gọi lại trong giờ hành chính.',
    ctaLabel: 'Đặt lịch thợ quen khu →',
  },

  [SERVICE_GOLD_ARCHITECTURE_IDS['package-pro']]: {
    hero: {
      headline: 'Gói vệ sinh & sửa chữa trọn gói — giá công khai, không phát sinh',
      subheadline:
        'Package-first: chọn gói theo diện tích và nhu cầu — biết trước việc gì, bao nhiêu tiền. Phù hợp căn hộ, văn phòng nhỏ và chủ nhà bận rộn.',
      ctaLabel: 'Chọn gói phù hợp',
      trustPoints: ['3 gói cố định', 'Không phí ẩn', 'Đổi lịch trước 24h'],
    },
    processHeadline: 'Chọn gói — làm xong — nghiệm thu',
    process: [
      { title: 'Chọn gói online', description: 'Basic / Standard / Pro — mỗi gói liệt kê công việc và thời lượng cụ thể.' },
      { title: 'Xác nhận & cọc nhỏ', description: 'Cọc 20% giữ slot — hoàn hoặc chuyển sang lịch khác nếu hủy trước 24h.' },
      { title: 'Triển khai theo checklist', description: 'Supervisor ký checklist từng hạng mục — ảnh before/after gửi qua Zalo.' },
      { title: 'Thanh toán & tái đặt', description: 'Thanh toán phần còn lại sau nghiệm thu — gói định kỳ giảm 15%.' },
    ],
    benefitsHeadline: 'Lợi ích gói trọn so với báo giá từng việc',
    benefits: [
      { title: 'Biết trước tổng chi phí', description: 'Không lo thêm giờ công hay phụ phí — ngoại lệ chỉ khi phát sinh ngoài phạm vi gói.' },
      { title: 'Đội làm theo checklist', description: 'Không bỏ sót góc — supervisor đối chiếu trước khi rời đi.' },
      { title: 'Gói định kỳ tiết kiệm', description: 'Vệ sinh tuần / tháng — cùng đội quen, giá ưu đãi lâu dài.' },
    ],
    featuresHeadline: 'Nội dung từng gói (tóm tắt)',
    features: [
      { title: 'Basic — căn studio', description: 'Vệ sinh 2 giờ hoặc 1 hạng mục sửa nhỏ — phù hợp ≤ 45 m².' },
      { title: 'Standard — căn 2PN', description: 'Vệ sinh sâu + kiểm tra điện nước cơ bản — ≤ 80 m².' },
      { title: 'Pro — nhà phố / VP', description: 'Full vệ sinh, máy lạnh, thông cống nhẹ — ≤ 120 m² hoặc theo thỏa thuận.' },
    ],
    galleryHeadline: 'Kết quả gói trọn gói',
    gallerySub: 'Before / after theo checklist — cùng gói, cùng tiêu chuẩn nghiệm thu.',
    galleryItems: [
      { title: 'Gói Standard — căn hộ 2PN', description: '4 giờ, 3 nhân sự — bếp, WC, sàn, ban công theo list.' },
      { title: 'Gói Pro — vệ sinh máy lạnh', description: '4 máy treo tường, gas bổ sung báo riêng nếu thiếu.' },
      { title: 'Combo điện nước Basic+', description: 'Kiểm tra 12 điểm + thay 2 ổ cắm hỏng — trong phạm vi gói.' },
      { title: 'Gói định kỳ văn phòng', description: 'Mỗi tuần 3 giờ — cùng team, log ảnh gửi quản lý building.' },
    ],
    testimonialsHeadline: 'Khách chọn gói cố định',
    testimonials: [
      {
        quote: 'Biết trước 1,2 triệu cho cả buổi vệ sinh — không lo thêm giờ như lần trước thuê theo giờ.',
        author: 'Chị Hạnh N.',
        role: 'Gói Standard · Căn hộ Q. 2',
      },
      {
        quote: 'VP đặt gói tháng — checklist gửi email, kế toán duyệt chi dễ.',
        author: 'Anh Phúc T.',
        role: 'Gói Pro định kỳ · Quận 1',
      },
    ],
    pricingHeadline: 'So sánh gói dịch vụ',
    pricing: [
      {
        name: 'Basic',
        price: '590.000đ',
        period: '/lần',
        features: ['≤ 45 m²', 'Vệ sinh 2h hoặc sửa nhỏ', 'Checklist 8 mục'],
        highlighted: false,
      },
      {
        name: 'Standard',
        price: '1.190.000đ',
        period: '/lần',
        features: ['≤ 80 m²', 'Vệ sinh sâu + điện nước', 'Ảnh nghiệm thu'],
        highlighted: true,
      },
      {
        name: 'Pro',
        price: '2.490.000đ',
        period: '/lần',
        features: ['≤ 120 m²', 'Full + máy lạnh', 'Supervisor ký checklist'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Gói có bao gồm vật tư không?',
        answer: 'Hóa chất vệ sinh và dụng cụ cơ bản có sẵn. Linh kiện điện nước thay mới — liệt kê trong bảng giá kèm gói Pro.',
      },
      {
        question: 'Nhà lớn hơn diện tích gói thì sao?',
        answer: 'Phụ thu theo m² hoặc nâng gói — báo trước khi làm, không tự ý thêm.',
      },
      {
        question: 'Hủy hoặc đổi lịch gói đã cọc?',
        answer: 'Trước 24h: hoàn cọc hoặc chuyển slot. Trong 24h: cọc giữ lại 50% phí đi lại đội.',
      },
    ],
    guarantee:
      'Cam kết gói trọn: checklist công khai · giá gói cố định · supervisor nghiệm thu · ảnh before/after · bảo hành 14 ngày hạng mục trong gói.',
    formHeadline: 'Chọn gói & đặt lịch',
    formSub: 'Ghi gói quan tâm — xác nhận slot và tổng tiền qua Zalo trong 1 giờ làm việc.',
    formSubmit: 'Đặt gói này',
    ctaHeadline: 'Chưa chắc gói nào?',
    ctaSub: 'Nhắn diện tích nhà — tư vấn gói phù hợp, không ép nâng cấp.',
    ctaLabel: 'Chọn gói phù hợp →',
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
  src: ServiceGoldDirectionCopy['pricing'] | undefined,
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

export function applyServiceGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveServiceGoldStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `service_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `service_gold_tm_${i + 1}`,
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
            id: `service_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết dịch vụ', body: copy.guarantee }
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

export function serviceGoldLabel(gold: ServiceGoldStandard): string {
  const labels: Record<ServiceGoldStandard, string> = {
    'local-book': 'Local Book',
    'neighborhood-trust': 'Neighborhood Trust',
    'package-pro': 'Package Pro',
  };
  return labels[gold];
}
