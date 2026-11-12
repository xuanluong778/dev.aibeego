/**
 * Clinic gold-standard copy — trust-clinical / care-warm / premium-medical.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  CLINIC_GOLD_ARCHITECTURE_IDS,
  type ClinicGoldStandard,
  resolveClinicGoldStandard,
} from './landing-page-clinic-gold-system';

export type ClinicGoldDirectionCopy = {
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
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  galleryHeadline?: string;
  gallerySub?: string;
  galleryItems?: Array<{ title: string; description: string }>;
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

const DIRECTIONS: Record<string, ClinicGoldDirectionCopy> = {
  [CLINIC_GOLD_ARCHITECTURE_IDS['trust-clinical']]: {
    hero: {
      headline: 'Phòng khám nha khoa — bác sĩ chuyên khoa I, quy trình minh bạch',
      subheadline:
        'Khám, chẩn đoán và lộ trình điều trị rõ ràng trước khi bạn quyết định. Thông tin được bảo mật theo quy định y tế.',
      body: 'Đặt lịch tư vấn miễn phí 15 phút — không ép mua gói, không gọi quấy rối.',
      ctaLabel: 'Đặt lịch khám',
      trustPoints: [
        'Bác sĩ CK I · 12+ năm kinh nghiệm',
        'Giờ mở cửa: T2–T7 · 8:00–20:00',
        'Quận 1, TP.HCM · Bãi xe miễn phí 2h',
      ],
    },
    speakerHeadline: 'Đội ngũ bác sĩ & chứng chỉ hành nghề',
    speaker: [
      {
        title: 'BS. Nguyễn Minh Anh',
        role: 'Răng Hàm Mặt · CK I · 12 năm',
        description:
          'Tốt nghiệp ĐH Y Dược TP.HCM. Chứng chỉ Implant Straumann, Invisalign Diamond. Hơn 3.200 ca điều trị an toàn.',
      },
    ],
    benefitsHeadline: 'Dịch vụ nha khoa tổng quát & thẩm mỹ',
    benefits: [
      { title: 'Khám & chẩn đoán số', description: 'Panorama, scan 3D — giải thích kết quả trước khi đề xuất phác đồ.' },
      { title: 'Implant & phục hình', description: 'Vật liệu có nguồn gốc, bảo hành theo tiêu chuẩn phòng khám.' },
      { title: 'Chỉnh nha trong suốt', description: 'Lộ trình rõ từng giai đoạn, theo dõi định kỳ, điều chỉnh khi cần.' },
    ],
    galleryHeadline: 'Before / after — case thật (đã che thông tin)',
    gallerySub: 'Hình ảnh minh họa quy trình và kết quả sau điều trị — không chỉnh sửa quá mức.',
    galleryItems: [
      { title: 'Phòng tiếp đón & vô trùng', description: 'Khu vực sạch, quy trình khử khuẩn ghi nhận hàng ngày.' },
      { title: 'Thiết bị chẩn đoán 3D', description: 'Scan và panorama — giải thích kết quả trước phác đồ.' },
      { title: 'Before / after — implant', description: 'Case thật, che thông tin — timeline điều trị rõ.' },
      { title: 'Tái khám & theo dõi', description: 'Follow-up theo lịch — không bỏ qua bước chăm sóc.' },
    ],
    processHeadline: 'Quy trình khám 4 bước',
    process: [
      { title: 'Đặt lịch & hồ sơ', description: 'Điền form ngắn — chúng tôi xác nhận slot trong 2 giờ làm việc.' },
      { title: 'Khám & chẩn đoán', description: 'Bác sĩ trực tiếp khám, giải thích và trả lời mọi thắc mắc.' },
      { title: 'Phác đồ & báo giá', description: 'Chi phí từng hạng mục, không phát sinh ngoài thỏa thuận.' },
      { title: 'Điều trị & tái khám', description: 'Theo dõi sau điều trị theo lịch hẹn — hotline hỗ trợ trong giờ hành chính.' },
    ],
    faq: [
      {
        question: 'Thông tin của tôi có được bảo mật không?',
        answer: 'Có. Hồ sơ bệnh án và form đặt lịch chỉ dùng cho mục đích khám chữa, không chia sẻ cho bên thứ ba.',
      },
      {
        question: 'Tôi có bắt buộc mua gói điều trị khi tư vấn không?',
        answer: 'Không. Buổi tư vấn giúp bạn hiểu tình trạng và lựa chọn — quyết định hoàn toàn thuộc về bạn.',
      },
      {
        question: 'Phòng khám ở đâu và giờ làm việc?',
        answer: '123 Nguyễn Huệ, Q.1, TP.HCM. T2–T7: 8:00–20:00 · CN: 9:00–17:00. Hotline: 1900 xxxx.',
      },
    ],
    guarantee:
      'Cam kết minh bạch: bác sĩ trực tiếp khám · báo giá trước khi điều trị · vật liệu có chứng nhận · quyền riêng tư được tôn trọng.',
    formHeadline: 'Đặt lịch khám & tư vấn',
    formSub: 'Điền form — chúng tôi gọi xác nhận trong giờ hành chính. Không spam.',
    formSubmit: 'Xác nhận đặt lịch',
    ctaHeadline: 'Cần tư vấn trước khi quyết định?',
    ctaSub: '15 phút với bác sĩ — miễn phí, không ràng buộc.',
    ctaLabel: 'Đặt lịch khám →',
  },

  [CLINIC_GOLD_ARCHITECTURE_IDS['care-warm']]: {
    hero: {
      headline: 'Chăm sóc da nhẹ nhàng — lộ trình cá nhân hóa, không vội vàng',
      subheadline:
        'Chúng tôi lắng nghe làn da của bạn trước khi đề xuất liệu trình. Mỗi bước được giải thích — bạn luôn biết mình đang làm gì.',
      ctaLabel: 'Đặt lịch tư vấn da',
      trustPoints: ['Da nhạy cảm · an toàn', 'BS Da liễu trực tiếp', 'Không upsell ép buộc'],
    },
    speakerHeadline: 'Bác sĩ da liễu đồng hành cùng bạn',
    speaker: [
      {
        title: 'BS. Trần Thu Hà',
        role: 'Da liễu · Thẩm mỹ y khoa',
        description:
          '15 năm điều trị mụn, nám, lão hóa. Phương châm: ít can thiệp hơn khi da cần thời gian phục hồi.',
      },
    ],
    processHeadline: 'Hành trình chăm sóc — từng bước rõ ràng',
    process: [
      { title: 'Lắng nghe & soi da', description: 'Phân tích tình trạng, thói quen skincare và mục tiêu của bạn.' },
      { title: 'Phác đồ nhẹ nhàng', description: 'Ưu tiên phục hồi trước — điều trị mạnh chỉ khi da sẵn sàng.' },
      { title: 'Theo dõi định kỳ', description: 'Tái khám 2–4 tuần, điều chỉnh theo phản ứng thực tế của da.' },
      { title: 'Chăm sóc tại nhà', description: 'Hướng dẫn routine đơn giản — không bắt buộc mua sản phẩm tại phòng khám.' },
    ],
    benefitsHeadline: 'Điều trị phổ biến',
    benefits: [
      { title: 'Mụn & thâm', description: 'Điều trị theo mức độ — tránh làm da barrier yếu đi.' },
      { title: 'Nám & tàn nhang', description: 'Kết hợp nội khoa và ngoại khoa khi cần, có timeline thực tế.' },
      { title: 'Trẻ hóa nhẹ', description: 'Laser, peel có kiểm soát — luôn test patch trước với da nhạy cảm.' },
    ],
    galleryHeadline: 'Kết quả thực tế — case đã được phép chia sẻ',
    gallerySub: 'Mỗi làn da khác nhau; chúng tôi không hứa kết quả giống hệt — chỉ cam kết quy trình chuẩn.',
    galleryItems: [
      { title: 'Phòng tư vấn da', description: 'Không gian riêng tư — trao đổi thoải mái trước liệu trình.' },
      { title: 'Soi da & phân tích', description: 'Đánh giá barrier và mục tiêu — không đoán mò.' },
      { title: 'Before / after — mụn/nám', description: 'Case consent — che danh tính, timeline thực tế.' },
      { title: 'Chăm sóc sau liệu trình', description: 'Hướng dẫn routine tại nhà — tái khám định kỳ.' },
    ],
    testimonialsHeadline: 'Bệnh nhân chia sẻ',
    testimonials: [
      {
        quote: 'Bác sĩ giải thích kỹ, không ép mua thêm liệu trình. Da mình cải thiện từ từ nhưng bền.',
        author: 'Chị Lan V.',
        role: 'Điều trị mụn · 4 tháng',
      },
      {
        quote: 'Lần đầu đi phòng khám mà cảm thấy được lắng nghe thật sự.',
        author: 'Anh Đức P.',
        role: 'Tư vấn da nhạy cảm',
      },
    ],
    faq: [
      {
        question: 'Liệu trình có đau không?',
        answer: 'Tùy phương pháp. Chúng tôi luôn giải thích cảm giác trước khi bắt đầu và có thể điều chỉnh cường độ.',
      },
      {
        question: 'Tôi có cần mua sản phẩm tại phòng khám không?',
        answer: 'Không bắt buộc. Bạn có thể dùng sản phẩm đang có nếu phù hợp — bác sĩ sẽ tư vấn cụ thể.',
      },
      {
        question: 'Bao lâu thì thấy cải thiện?',
        answer: 'Da cần 4–8 tuần cho nhiều liệu trình. Chúng tôi đặt kỳ vọng thực tế ngay buổi đầu.',
      },
    ],
    guarantee:
      'Cam kết chăm sóc: bác sĩ trực tiếp theo dõi · không upsell · thông tin bệnh án bảo mật · hủy/đổi lịch trước 24h.',
    formHeadline: 'Đặt lịch tư vấn da',
    formSub: 'Chọn khung giờ phù hợp — chúng tôi xác nhận qua điện thoại hoặc Zalo (nếu bạn đồng ý).',
    formSubmit: 'Gửi yêu cầu tư vấn',
    ctaHeadline: 'Bắt đầu với một buổi tư vấn nhẹ nhàng',
    ctaSub: '30 phút — hiểu làn da của bạn trước khi quyết định liệu trình.',
    ctaLabel: 'Đặt lịch tư vấn →',
  },

  [CLINIC_GOLD_ARCHITECTURE_IDS['premium-medical']]: {
    hero: {
      headline: 'Phẫu thuật thẩm mỹ chuyên sâu — tiêu chuẩn bệnh viện, trải nghiệm riêng tư',
      subheadline:
        'Phòng mổ vô trùng · bác sĩ phẫu thuật chính quy · hồi phục theo protocol quốc tế. Tư vấn kín đáo, không công khai hình ảnh khi chưa được phép.',
      ctaLabel: 'Đặt lịch tư vấn riêng',
      trustPoints: [
        'JCI-aligned protocol',
        'BS Phẫu thuật TM · 18 năm',
        'Phòng hồi sức riêng · 24/7 on-call',
      ],
    },
    speakerHeadline: 'Bác sĩ phẫu thuật & credentials',
    speaker: [
      {
        title: 'PGS.TS. Lê Hoàng Nam',
        role: 'Phẫu thuật TM · Bệnh viện tuyến TW',
        description:
          'Fellowship Hàn Quốc · 4.800+ ca an toàn · Thành viên ISAPS. Tư vấn trung thực về rủi ro và thời gian hồi phục.',
      },
    ],
    galleryHeadline: 'Case study — kết quả sau phẫu thuật (đã che danh tính)',
    gallerySub: 'Hình ảnh chỉ hiển thị khi bệnh nhân đồng ý bằng văn bản.',
    galleryItems: [
      { title: 'Phòng mổ vô trùng', description: 'Tiêu chuẩn bệnh viện — monitor đầy đủ trong gây mê.' },
      { title: 'Phòng hồi sức riêng', description: 'Theo dõi 24h sau thủ thuật lớn — bác sĩ on-call.' },
      { title: 'Before / after — phẫu thuật', description: 'Consent bằng văn bản — che thông tin nhận dạng.' },
      { title: 'Follow-up 12 tháng', description: 'Tái khám 1–3–6–12 tháng theo protocol.' },
    ],
    processHeadline: 'Quy trình an toàn 5 bước',
    process: [
      { title: 'Tư vấn riêng tư', description: 'Buổi 1:1 — nghe mong muốn, đánh giá sức khỏe và contraindication.' },
      { title: 'Khám tiền phẫu', description: 'Xét nghiệm, chụp chiếu theo chỉ định — không bỏ qua bước an toàn.' },
      { title: 'Phẫu thuật', description: 'Phòng mổ vô trùng, gây mê có monitor — bác sĩ chính trực tiếp thực hiện.' },
      { title: 'Hồi sức & xuất viện', description: 'Theo dõi 24h, hướng dẫn chăm sóc vết mổ chi tiết.' },
      { title: 'Tái khám định kỳ', description: 'Lịch follow-up 1–3–6–12 tháng — hotline on-call ngoài giờ khẩn cấp.' },
    ],
    testimonialsHeadline: 'Phản hồi từ bệnh nhân',
    testimonials: [
      {
        quote: 'Quy trình rất chuyên nghiệp — mọi rủi ro được giải thích rõ trước khi ký cam kết.',
        author: 'Bệnh nhân A.',
        role: 'Nâng ngực · 2024',
      },
      {
        quote: 'Cảm giác được tôn trọng quyền riêng tư suốt quá trình.',
        author: 'Bệnh nhân B.',
        role: 'Tái cấu trúc mũi',
      },
    ],
    faq: [
      {
        question: 'Thông tin và hình ảnh của tôi có được giữ kín không?',
        answer: 'Có. Chúng tôi không sử dụng hình ảnh cho marketing nếu không có consent bằng văn bản.',
      },
      {
        question: 'Thời gian nghỉ dưỡng bao lâu?',
        answer: 'Tùy thủ thuật — bác sĩ sẽ đưa timeline cụ thể sau khám tiền phẫu, không hứa chung chung.',
      },
      {
        question: 'Chi phí có phát sinh không?',
        answer: 'Báo giá chi tiết sau khám — bao gồm phẫu thuật, gây mê, nội trú và tái khám theo gói đã thỏa thuận.',
      },
    ],
    guarantee:
      'Tiêu chuẩn premium: phòng mổ vô trùng · bác sĩ chính trực tiếp · protocol hồi phục · bảo mật tuyệt đối · không quảng cáo phóng đại.',
    formHeadline: 'Đặt lịch tư vấn riêng tư',
    formSub: 'Thông tin chỉ dùng để xếp lịch — không gửi cho bên thứ ba.',
    formSubmit: 'Yêu cầu tư vấn kín',
    ctaHeadline: 'Sẵn sàng trao đổi trung thực về mong muốn của bạn?',
    ctaSub: 'Buổi tư vấn 1:1 — không áp lực quyết định trong ngày.',
    ctaLabel: 'Đặt lịch tư vấn riêng →',
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

export function applyClinicGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveClinicGoldStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `clinic_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `clinic_gold_tm_${i + 1}`,
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
            id: `clinic_gold_faq_${i + 1}`,
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

export function clinicGoldLabel(gold: ClinicGoldStandard): string {
  const labels: Record<ClinicGoldStandard, string> = {
    'trust-clinical': 'Trust Clinical',
    'care-warm': 'Care Warm',
    'premium-medical': 'Premium Medical',
  };
  return labels[gold];
}
