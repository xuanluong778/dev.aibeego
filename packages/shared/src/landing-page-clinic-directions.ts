/**
 * Clinic direction copy — per architectureId (non-gold 7 + shared gallery helpers).
 * Data-driven; no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';

export type ClinicGalleryItem = { title: string; description: string };

export type ClinicDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  speakerHeadline?: string;
  speaker?: Array<{ title: string; role: string; description: string }>;
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  featuresHeadline?: string;
  features?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  galleryHeadline?: string;
  gallerySub?: string;
  galleryItems?: ClinicGalleryItem[];
  testimonialsHeadline?: string;
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  faq?: Array<{ question: string; answer: string }>;
  guarantee?: string;
  formHeadline: string;
  formSub?: string;
  formSubmit: string;
  ctaHeadline: string;
  ctaSub?: string;
  ctaLabel: string;
};

const DIRECTIONS: Record<string, ClinicDirectionCopy> = {
  clinic_trust_cert: {
    hero: {
      headline: 'Chứng chỉ hành nghề & cam kết an toàn — đặt lịch với tâm an',
      subheadline:
        'Giấy phép, chứng chỉ và quy trình vô trùng được công khai trước khi bạn quyết định. Không hứa hẹn quá mức.',
      ctaLabel: 'Đặt lịch khám',
      trustPoints: ['GP đầy đủ · ISO phòng khám', 'Bác sĩ CK I trực tiếp', 'Bảo mật hồ sơ bệnh án'],
    },
    guarantee:
      'Cam kết: vật liệu có nguồn gốc · phác đồ rõ trước điều trị · tái khám theo lịch · hotline hỗ trợ T2–CN 8:00–20:00.',
    speakerHeadline: 'Bác sĩ trưởng khoa & chứng chỉ',
    speaker: [
      {
        title: 'BS. Phạm Quốc Bình',
        role: 'Nội khoa · CK I · 14 năm',
        description:
          'Chứng chỉ JCI patient safety · 2.800 ca điều trị nội trú/ngoại trú · không outsource khám.',
      },
    ],
    benefitsHeadline: 'Vì sao chọn phòng khám có chứng chỉ rõ',
    benefits: [
      { title: 'Giấy phép minh bạch', description: 'Treo tại quầy tiếp đón — scan QR tra cứu khi cần.' },
      { title: 'Quy trình vô trùng', description: 'Khử khuẩn dụng cụ theo chuẩn Bộ Y tế.' },
      { title: 'Báo giá trước điều trị', description: 'Không phát sinh ngoài thỏa thuận bằng văn bản.' },
    ],
    galleryHeadline: 'Cơ sở vật chất & chứng nhận',
    gallerySub: 'Phòng khám · thiết bị · giấy phép — minh bạch trước khi đặt lịch.',
    galleryItems: [
      { title: 'Phòng khám & giấy phép', description: 'Không gian tiếp đón, giấy phép treo tường, khu vực chờ sạch.' },
      { title: 'Thiết bị chẩn đoán', description: 'Máy siêu âm, X-quang số — bảo trì định kỳ, có log kiểm tra.' },
      { title: 'Phòng điều trị vô trùng', description: 'Khử khuẩn sau mỗi ca — protocol ghi nhận hàng ngày.' },
      { title: 'Chứng chỉ đào tạo', description: 'Chứng chỉ chuyên khoa và CME của đội ngũ bác sĩ.' },
    ],
    testimonialsHeadline: 'Bệnh nhân đánh giá',
    testimonials: [
      {
        quote: 'Thấy rõ giấy phép và quy trình trước khi khám — yên tâm hơn nhiều.',
        author: 'Anh Tuấn L.',
        role: 'Khám tổng quát · Q.3',
      },
      {
        quote: 'Bác sĩ giải thích phác đồ, không ép làm thêm xét nghiệm không cần.',
        author: 'Chị Mai H.',
        role: 'Tái khám định kỳ',
      },
    ],
    faq: [
      { question: 'Phòng khám có giấy phép không?', answer: 'Có — giấy phép hoạt động và chứng chỉ bác sĩ được công khai tại quầy lễ tân.' },
      { question: 'Tôi có được xem phác đồ trước?', answer: 'Có. Bác sĩ trình bày phác đồ và chi phí trước khi bạn đồng ý điều trị.' },
    ],
    formHeadline: 'Đặt lịch khám — xác nhận trong giờ hành chính',
    formSub: 'Thông tin chỉ dùng để xếp lịch, không chia sẻ bên thứ ba.',
    formSubmit: 'Xác nhận đặt lịch',
    ctaHeadline: 'Sẵn sàng khám với phòng khám minh bạch?',
    ctaSub: '15 phút tư vấn — không ràng buộc mua gói.',
    ctaLabel: 'Đặt lịch khám →',
  },

  clinic_treatment_flow: {
    hero: {
      headline: 'Lộ trình khám → chẩn đoán → điều trị — từng bước rõ ràng',
      subheadline:
        'Không nhảy cóc sang điều trị. Bạn luôn biết bước tiếp theo là gì và vì sao cần làm.',
      ctaLabel: 'Bắt đầu đặt lịch',
      trustPoints: ['Timeline rõ trước khi bắt đầu', 'Bác sĩ giải thích từng bước', 'Tái khám theo lịch'],
    },
    processHeadline: 'Hành trình bệnh nhân 4 giai đoạn',
    process: [
      { title: 'Đặt lịch & intake', description: 'Form ngắn — lễ tân gọi xác nhận slot trong 2 giờ làm việc.' },
      { title: 'Khám & chẩn đoán', description: 'Bác sĩ trực tiếp khám, giải thích kết quả xét nghiệm/chụp chiếu.' },
      { title: 'Phác đồ điều trị', description: 'Timeline, chi phí từng hạng mục — ký đồng thuận khi sẵn sàng.' },
      { title: 'Theo dõi & tái khám', description: 'Nhắc lịch SMS/Zalo · hotline hỗ trợ trong giờ hành chính.' },
    ],
    speakerHeadline: 'Bác sĩ điều trị chính',
    speaker: [
      {
        title: 'BS. Lê Thị Ngọc',
        role: 'Điều trị nội khoa · 11 năm',
        description: 'Chuyên lộ trình điều trị mạn tính — giải thích rõ từng giai đoạn cho bệnh nhân và người nhà.',
      },
    ],
    galleryHeadline: 'Hành trình điều trị (minh họa)',
    gallerySub: 'Tiếp đón → khám → theo dõi — quy trình chuẩn, thông tin đã che khi cần.',
    galleryItems: [
      { title: 'Tiếp đón & khai báo', description: 'Quầy lễ tân hướng dẫn khai báo sức khỏe và mục tiêu khám.' },
      { title: 'Phòng khám & thăm khám', description: 'Bác sĩ trực tiếp khám, không chuyển cho kỹ thuật viên thay thế.' },
      { title: 'Cận lâm sàng', description: 'Xét nghiệm/chụp chiếu theo chỉ định — kết quả giải thích trước điều trị.' },
      { title: 'Tái khám định kỳ', description: 'Theo dõi tiến triển, điều chỉnh phác đồ khi cần.' },
    ],
    benefitsHeadline: 'Lợi ích lộ trình có cấu trúc',
    benefits: [
      { title: 'Giảm lo lắng', description: 'Biết trước từng bước — không bất ngờ chi phí hay thủ tục.' },
      { title: 'Theo dõi liên tục', description: 'Hồ sơ điện tử — bác sĩ nắm lịch sử mỗi lần tái khám.' },
      { title: 'Người nhà đồng hành', description: 'Có thể tham gia buổi giải thích phác đồ khi bạn đồng ý.' },
    ],
    formHeadline: 'Đặt lịch bắt đầu lộ trình',
    formSubmit: 'Gửi yêu cầu đặt lịch',
    ctaHeadline: 'Bắt đầu với buổi khám đầu tiên',
    ctaLabel: 'Đặt lịch khám',
  },

  clinic_before_after: {
    hero: {
      headline: 'Kết quả điều trị thực tế — case đã được phép chia sẻ',
      subheadline:
        'Before/after chỉ hiển thị khi bệnh nhân đồng ý bằng văn bản. Không chỉnh sửa quá mức, không hứa kết quả giống hệt.',
      ctaLabel: 'Đặt lịch tư vấn',
      trustPoints: ['Consent bằng văn bản', 'Che thông tin nhận dạng', 'Bác sĩ giải thích case'],
    },
    galleryHeadline: 'Before / after — kết quả thực tế',
    gallerySub: 'Case đã che danh tính · góc chụp chuẩn · không filter quá mức.',
    galleryItems: [
      { title: 'Before — tình trạng ban đầu', description: 'Ghi nhận trước điều trị — ánh sáng và góc chụp chuẩn.' },
      { title: 'After — sau liệu trình', description: 'Kết quả sau phác đồ đã thỏa thuận — timeline thực tế.' },
      { title: 'Tái khám & duy trì', description: 'Theo dõi dài hạn — không chỉ chụp ngay sau điều trị.' },
      { title: 'Không gian điều trị', description: 'Phòng thủ thuật/điều trị sạch, thiết bị hiện đại.' },
    ],
    speakerHeadline: 'Bác sĩ phụ trách case',
    speaker: [
      {
        title: 'BS. Đặng Hoài Phương',
        role: 'Thẩm mỹ y khoa · 9 năm',
        description: 'Trình bày trung thực giới hạn và thời gian hồi phục — không cam kết kết quả ảo.',
      },
    ],
    processHeadline: 'Quy trình chia sẻ case minh bạch',
    process: [
      { title: 'Tư vấn & chụp chuẩn', description: 'Chụp before theo protocol — giải thích kỳ vọng thực tế.' },
      { title: 'Điều trị theo phác đồ', description: 'Thực hiện đúng lộ trình đã thỏa thuận.' },
      { title: 'After & consent', description: 'Chỉ public khi bệnh nhân ký consent — che thông tin nhận dạng.' },
    ],
    guarantee:
      'Cam kết hình ảnh: consent bằng văn bản · che danh tính · không photoshop kết quả · bác sĩ giải thích từng case.',
    formHeadline: 'Đặt lịch xem case tương tự',
    formSubmit: 'Yêu cầu tư vấn',
    ctaHeadline: 'Muốn trao đổi case gần với tình trạng của bạn?',
    ctaLabel: 'Đặt lịch tư vấn →',
  },

  clinic_faq_care: {
    hero: {
      headline: 'Chăm sóc sau điều trị — FAQ rõ ràng, không để bạn tự tìm',
      subheadline:
        'Câu hỏi về chăm sóc tại nhà, tái khám và dấu hiệu cần gọi bác sĩ — trả lời thẳng, không né tránh.',
      ctaLabel: 'Đặt lịch tư vấn',
      trustPoints: ['Hotline care T2–CN', 'Hướng dẫn viết tay + digital', 'Tái khám theo lịch'],
    },
    benefitsHeadline: 'Chăm sóc sau điều trị gồm gì',
    benefits: [
      { title: 'Hướng dẫn tại nhà', description: 'Checklist chăm sóc vết/ vùng điều trị — gửi qua Zalo/email.' },
      { title: 'Tái khám định kỳ', description: 'Lịch follow-up rõ — nhắc trước 24h.' },
      { title: 'Hotline care', description: 'Gọi trong giờ hành chính khi có dấu hiệu bất thường.' },
    ],
    faq: [
      {
        question: 'Sau điều trị cần kiêng gì?',
        answer: 'Tùy thủ thuật — bạn nhận checklist cụ thể trước khi về. Không dùng chung một list cho mọi case.',
      },
      {
        question: 'Khi nào cần gọi bác sĩ gấp?',
        answer: 'Sốt cao, chảy máu bất thường, đau tăng dần — gọi hotline care hoặc đến cấp cứu nếu ngoài giờ.',
      },
      {
        question: 'Tái khám bao lâu một lần?',
        answer: 'Thường 1–2 tuần sau điều trị, sau đó theo phác đồ — lịch cụ thể ghi trên phiếu hẹn.',
      },
      {
        question: 'Có hỗ trợ online không?',
        answer: 'Có thể gửi ảnh follow-up qua kênh bảo mật — bác sĩ phản hồi trong giờ hành chính.',
      },
    ],
    guarantee:
      'Cam kết chăm sóc: hướng dẫn rõ ràng · hotline care · tái khám không phát sinh phí ngoài thỏa thuận (trừ xét nghiệm thêm nếu cần).',
    testimonialsHeadline: 'Bệnh nhân về chăm sóc sau điều trị',
    testimonials: [
      {
        quote: 'FAQ và hotline giúp mình bớt lo sau khi về — được trả lời nhanh.',
        author: 'Chị Hương T.',
        role: 'Sau điều trị da',
      },
      {
        quote: 'Checklist chăm sóc tại nhà rõ ràng — biết khi nào cần tái khám.',
        author: 'Anh Phúc N.',
        role: 'Sau điều trị nha khoa',
      },
    ],
    formHeadline: 'Đặt lịch tư vấn chăm sóc',
    formSub: 'Hỏi trước khi điều trị — biết cách chăm sóc tại nhà.',
    formSubmit: 'Gửi câu hỏi & đặt lịch',
    ctaHeadline: 'Còn thắc mắc về chăm sóc sau điều trị?',
    ctaLabel: 'Tư vấn miễn phí 15 phút',
  },

  clinic_nav_services: {
    hero: {
      headline: 'Dịch vụ phòng khám — chọn chuyên khoa và đặt lịch nhanh',
      subheadline:
        'Menu dịch vụ rõ giá khám, thời gian và bác sĩ phụ trách. Đặt lịch online — xác nhận qua điện thoại.',
      ctaLabel: 'Xem dịch vụ & đặt lịch',
      trustPoints: ['Giá khám công khai', 'Nhiều chuyên khoa', 'Bãi xe · Q.1'],
    },
    featuresHeadline: 'Dịch vụ chính',
    features: [
      { title: 'Khám tổng quát', description: 'Đánh giá sức khỏe, chỉ định cận lâm sàng khi cần.' },
      { title: 'Nha khoa', description: 'Khám, cạo vôi, implant — báo giá trước điều trị.' },
      { title: 'Da liễu', description: 'Mụn, nám, laser — phác đồ cá nhân hóa.' },
      { title: 'Chẩn đoán hình ảnh', description: 'Siêu âm, X-quang — kết quả trong ngày (tùy ca).' },
    ],
    speakerHeadline: 'Đội ngũ theo chuyên khoa',
    speaker: [
      {
        title: 'BS. CKI. Võ Minh Đức',
        role: 'Giám đốc chuyên môn',
        description: 'Phụ trách phân luồng bệnh nhân đúng chuyên khoa — không khám tràn gói.',
      },
    ],
    galleryHeadline: 'Cơ sở & phòng chuyên khoa',
    gallerySub: 'Khu tiếp đón · phòng khám · lab — phục vụ đa chuyên khoa.',
    galleryItems: [
      { title: 'Sảnh tiếp đón', description: 'Quầy đa chuyên khoa — phân luồng rõ, thời gian chờ minh bạch.' },
      { title: 'Phòng nha khoa', description: 'Ghế nha hiện đại, vô trùng theo ca.' },
      { title: 'Phòng da liễu', description: 'Thiết bị soi da, laser có kiểm định.' },
      { title: 'Khu cận lâm sàng', description: 'Xét nghiệm & chụp chiếu liên thông hồ sơ điện tử.' },
    ],
    formHeadline: 'Đặt lịch theo dịch vụ',
    formSub: 'Chọn chuyên khoa — lễ tân gọi xác nhận slot.',
    formSubmit: 'Xác nhận đặt lịch',
    ctaHeadline: 'Chưa chọn được dịch vụ?',
    ctaSub: 'Gọi lễ tân — tư vấn phân luồng miễn phí.',
    ctaLabel: 'Gọi / đặt lịch →',
  },

  clinic_early_booking: {
    hero: {
      headline: 'Đặt lịch ngay — giữ slot khám trong 2 giờ làm việc',
      subheadline:
        'Form ngắn ngay dưới hero. Không cần gọi nhiều lần — chúng tôi xác nhận qua SĐT hoặc Zalo (nếu bạn đồng ý).',
      body: 'Thông tin được mã hóa và chỉ dùng để xếp lịch.',
      ctaLabel: 'Cuộn xuống đặt lịch',
      trustPoints: ['Xác nhận nhanh', 'Không spam', 'Đổi lịch trước 24h'],
    },
    speakerHeadline: 'Bác sĩ sẽ trực tiếp khám',
    speaker: [
      {
        title: 'BS. Trương Kiều My',
        role: 'Đa khoa · 8 năm',
        description: 'Khám và giải thích trước khi đề xuất bất kỳ thủ thuật nào — không ép quyết định trong ngày.',
      },
    ],
    benefitsHeadline: 'Sau khi đặt lịch',
    benefits: [
      { title: 'SMS / Zalo xác nhận', description: 'Nhận mã lịch hẹn và hướng dẫn chuẩn bị.' },
      { title: 'Nhắc trước buổi khám', description: 'Nhắc 24h — giảm trễ và hủy sát giờ.' },
      { title: 'Chuẩn bị tài liệu', description: 'Gợi ý mang theo kết quả cũ nếu có.' },
    ],
    galleryHeadline: 'Không gian phòng khám',
    gallerySub: 'Tiếp đón thân thiện · phòng khám sạch · đậu xe thuận tiện.',
    galleryItems: [
      { title: 'Quầy tiếp đón', description: 'Check-in nhanh với mã lịch hẹn.' },
      { title: 'Phòng chờ', description: 'Ghế ngồi thoải mái, wifi, nước uống.' },
      { title: 'Phòng khám', description: 'Riêng tư — bác sĩ trực tiếp thăm khám.' },
      { title: 'Bãi xe & địa chỉ', description: 'Hỗ trợ gửi xe 2h — Q.1, TP.HCM.' },
    ],
    guarantee: 'Cam kết đặt lịch: xác nhận trong giờ hành chính · không bán data · đổi/hủy trước 24h miễn phí.',
    formHeadline: 'Form đặt lịch — điền 1 phút',
    formSubmit: 'Gửi & giữ slot',
    ctaHeadline: 'Cần hỗ trợ điền form?',
    ctaLabel: 'Gọi lễ tân',
  },

  clinic_minimal_book: {
    hero: {
      headline: 'Đặt lịch khám — gọn, nhanh, bảo mật',
      subheadline: 'Tên · SĐT · khung giờ. Xác nhận trong giờ hành chính.',
      ctaLabel: 'Đặt lịch',
      trustPoints: ['Form 3 trường', 'Không spam', 'Bảo mật thông tin'],
    },
    speakerHeadline: 'Bác sĩ khám',
    speaker: [
      {
        title: 'BS. Huỳnh An Khang',
        role: 'Đa khoa',
        description: 'Khám và tư vấn ngắn gọn — phù hợp lịch bận, cần slot nhanh.',
      },
    ],
    formHeadline: 'Đặt lịch',
    formSub: 'Chúng tôi gọi xác nhận — không chia sẻ SĐT cho bên thứ ba.',
    formSubmit: 'Gửi đặt lịch',
    ctaHeadline: 'Giữ slot tuần này',
    ctaSub: 'Slot có hạn — đặt trước để chọn giờ phù hợp.',
    ctaLabel: 'Đặt lịch ngay',
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

export function patchClinicGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: ClinicGalleryItem[] | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

export function isClinicDirectionArchitecture(architectureId: string | undefined): boolean {
  if (!architectureId) return false;
  return architectureId in DIRECTIONS;
}

export function applyClinicDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
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
      case 'Speaker': {
        const items = copy.speaker;
        if (!items?.length) {
          return { ...block, headline: copy.speakerHeadline || block.headline };
        }
        return {
          ...block,
          headline: copy.speakerHeadline || block.headline,
          items: block.items.map((item, i) => ({
            ...item,
            title: items[i]?.title ?? item.title,
            role: items[i]?.role ?? item.role,
            description: items[i]?.description ?? item.description,
          })),
        };
      }
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline || block.headline,
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
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
          items: (patchClinicGalleryItems(block.items, copy.galleryItems) ||
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
            ...(block.items[i] || block.items[0] || { id: `clinic_tm_${i + 1}` }),
            id: block.items[i]?.id || `clinic_tm_${architectureId}_${i + 1}`,
            quote: t.quote,
            author: t.author,
            role: t.role,
          })),
        };
      }
      case 'FAQ':
        if (!copy.faq?.length) return block;
        return {
          ...block,
          items: copy.faq.map((f, i) => ({
            id: `clinic_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết & tiêu chuẩn', body: copy.guarantee }
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

export function listClinicDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
