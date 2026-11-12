/**
 * Service direction copy — 7 non-gold premium architectures.
 * Local trades / home services; distinct booking conversion flows.
 */

import type { LandingPageBlock } from './landing-page-types';
import type { ServiceGoldDirectionCopy } from './landing-page-service-gold-directions';
import {
  SERVICE_DIRECTION_ARCHITECTURE_IDS,
  resolveServiceDirectionStandard,
} from './landing-page-service-gold-system';

export type ServiceGalleryItem = { title: string; description: string };

const DIRECTIONS: Record<string, ServiceGoldDirectionCopy> = {
  [SERVICE_DIRECTION_ARCHITECTURE_IDS['work-process']]: {
    hero: {
      headline: 'Quy trình làm việc rõ từng bước — đặt lịch sau khi hiểu cách chúng tôi làm',
      subheadline:
        'Process-first: timeline sửa chữa & vệ sinh tại nhà — từ khảo sát đến nghiệm thu. Không nhảy thẳng vào form khi bạn chưa biết thợ làm gì.',
      body: 'Phù hợp khách lần đầu thuê thợ — cần thấy quy trình trước khi cho vào nhà.',
      ctaLabel: 'Xem quy trình & đặt lịch',
      trustPoints: ['4 bước minh bạch', 'Checklist nghiệm thu', 'Bảo hành có biên bản'],
    },
    processHeadline: 'Timeline công việc tại nhà bạn',
    process: [
      { title: 'Bước 1 — Tiếp nhận & lên lịch', description: 'Form hoặc hotline — điều phối xác nhận slot trong 30 phút, ghi nhận loại việc (điện/nước/vệ sinh).' },
      { title: 'Bước 2 — Khảo sát tại chỗ', description: 'Thợ chụp hiện trạng, báo giá cụ thể — bạn đồng ý mới bắt đầu, từ chối không mất phí khảo sát nội thành.' },
      { title: 'Bước 3 — Thi công & giám sát', description: 'Che bảo vệ nội thất, làm theo checklist — supervisor gọi nếu phát sinh ngoài phạm vi đã chốt.' },
      { title: 'Bước 4 — Nghiệm thu & bảo hành', description: 'Ký biên bản, ảnh after gửi Zalo — bảo hành 7–30 ngày, hotline hỗ trợ ca bảo hành ưu tiên.' },
    ],
    featuresHeadline: 'Công cụ hỗ trợ quy trình',
    features: [
      { title: 'Checklist PDF', description: 'Gửi trước khi thợ đến — bạn biết họ sẽ làm gì từng phút.' },
      { title: 'Ảnh tiến độ', description: 'Before/after qua Zalo — minh bạch cho chủ nhà đi vắng.' },
      { title: 'Biên bản điện tử', description: 'Ký trên điện thoại — lưu lịch sử job cho lần gọi sau.' },
    ],
    benefitsHeadline: 'Vì sao xem quy trình trước quan trọng',
    benefits: [
      { title: 'Yên tâm cho người lần đầu', description: 'Biết thợ vào nhà làm gì, bao lâu, dọn ra sao.' },
      { title: 'Giảm tranh chấp giá', description: 'Mọi bước có mốc — phát sinh phải qua bước khảo sát và đồng ý.' },
      { title: 'Tái đặt nhanh', description: 'Lịch sử job lưu sẵn — lần sau không giải thích lại từ đầu.' },
    ],
    galleryHeadline: 'Minh họa từng bước trên công trình thật',
    gallerySub: 'Ảnh hiện trường — che thông tin khách, giữ đúng thứ tự quy trình.',
    galleryItems: [
      { title: 'Khảo sát — chụp hiện trạng', description: 'Rò ống dưới bồn rửa — ghi nhận trước tháo.' },
      { title: 'Che chắn & thi công', description: 'Bạt bảo vệ tủ bếp — hút bụi sau khi khoan.' },
      { title: 'Nghiệm thu — checklist', description: 'Supervisor đối chiếu 12 mục — khách ký trên tablet.' },
      { title: 'After — khu vực sạch', description: 'Cùng góc chụp before — sàn khô, không vụn.' },
    ],
    testimonialsHeadline: 'Khách đánh giá quy trình',
    testimonials: [
      {
        quote: 'Lần đầu mời thợ vào nhà — thấy checklist và từng bước nên yên tâm hơn nhiều.',
        author: 'Chị Uyên M.',
        role: 'Sửa ống nước · Q. 7',
      },
      {
        quote: 'Báo giá ở bước 2, làm ở bước 3 — không có chuyện làm xong mới nói thêm tiền.',
        author: 'Anh Thắng D.',
        role: 'Vệ sinh sâu · Q. Bình Thạnh',
      },
    ],
    formHeadline: 'Đặt lịch — đã xem quy trình',
    formSub: 'Ghi loại việc và khung giờ — điều phối gọi theo đúng bước 1.',
    formSubmit: 'Bắt đầu đặt lịch',
    ctaHeadline: 'Muốn nhận checklist trước khi thợ đến?',
    ctaSub: 'Để lại email — gửi PDF quy trình và checklist nghiệm thu.',
    ctaLabel: 'Nhận checklist →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['job-proof']]: {
    hero: {
      headline: 'Ảnh công trình thật — xem việc đã làm rồi mới đặt lịch',
      subheadline:
        'Gallery-first: before/after sửa điện, vệ sinh, thông cống — job thật tại nhà khách. Chọn thợ sau khi thấy chất lượng, không chỉ nghe cam kết.',
      body: 'Cuộn xem gallery — form đặt lịch ngay dưới ảnh job tương tự nhu cầu bạn.',
      ctaLabel: 'Đặt lịch sau khi xem ảnh',
      trustPoints: ['200+ ảnh job/năm', 'Before / after cùng góc', 'Khách đồng ý mới đăng'],
    },
    galleryHeadline: 'Job gần đây — điện, nước, vệ sinh',
    gallerySub: 'Mỗi ảnh ghi loại việc, quận và thời gian — không stock photo.',
    galleryItems: [
      { title: 'Thay đường ống bếp — before/after', description: 'Inox 304, Q. 3 — rò 3 năm, sửa 1 buổi.' },
      { title: 'Vệ sinh sofa & thảm', description: 'Căn 3PN — máy hút + hơi nước, khô trong 4 giờ.' },
      { title: 'Sửa chập aptomat', description: 'Nhà phố 3 tầng — tìm điểm chập, thay aptomat riêng từng tầng.' },
      { title: 'Thông cống WC tắc', description: 'Camera nội soi — before tắc nghiêm trọng, after thông hoàn toàn.' },
    ],
    benefitsHeadline: 'Những gì ảnh thể hiện',
    benefits: [
      { title: 'Chất lượng finish', description: 'Keo, mối hàn, góc sạch — nhìn ảnh after là thấy tay nghề.' },
      { title: 'Đúng loại việc bạn cần', description: 'Lọc gallery theo điện / nước / vệ sinh — không xem chung chung.' },
      { title: 'Minh bạch khu vực', description: 'Ghi quận — ước lượng thời gian thợ đến realistic.' },
    ],
    processHeadline: 'Từ ảnh job → đặt lịch',
    process: [
      { title: 'Chọn job tương tự', description: 'Xem before/after gần với tình trạng nhà bạn.' },
      { title: 'Gửi ảnh hiện trạng', description: 'Chụp gửi Zalo — báo giá sơ bộ trong 1 giờ làm việc.' },
      { title: 'Chốt lịch & thợ', description: 'Ưu tiên thợ đã làm job cùng loại — giảm thử-sai.' },
      { title: 'Làm & chụp after', description: 'Cùng góc chụp — thêm vào gallery nếu bạn đồng ý.' },
    ],
    testimonialsHeadline: 'Khách book sau khi xem gallery',
    testimonials: [
      {
        quote: 'Thấy ảnh sửa ống giống nhà mình — book luôn, kết quả đúng kỳ vọng từ ảnh mẫu.',
        author: 'Anh Quân V.',
        role: 'Thay ống bếp · Q. 3',
      },
      {
        quote: 'Gallery không phải ảnh mạng — có ghi quận, mình verify được.',
        author: 'Chị Loan T.',
        role: 'Vệ sinh nệm · Q. 10',
      },
    ],
    formHeadline: 'Đặt lịch — tham chiếu job trong gallery',
    formSub: 'Ghi mã job hoặc mô tả ảnh bạn vừa xem — báo giá nhanh hơn.',
    formSubmit: 'Gửi yêu cầu',
    ctaHeadline: 'Có việc giống ảnh trên?',
    ctaSub: 'Chụp hiện trạng gửi kèm form — so sánh với job mẫu.',
    ctaLabel: 'Gửi ảnh & đặt lịch →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['team-video']]: {
    hero: {
      headline: 'Gặp đội thợ qua video — biết mặt, biết cách làm trước khi mời vào nhà',
      subheadline:
        'Video intro: thợ trưởng giới thiệu quy trình an toàn điện nước và vệ sinh tại nhà. Phù hợp khách cần tin cậm trước khi cho người lạ vào cửa.',
      ctaLabel: 'Xem video & đặt lịch',
      trustPoints: ['Video 90 giây', 'Thợ có CMND', 'Đồng phục & thẻ tên'],
    },
    videoHeadline: 'Giới thiệu đội & quy trình an toàn',
    videoSub: 'Thợ trưởng 8 năm — sửa điện, nước và vệ sinh tại nhà TP.HCM.',
    processHeadline: 'Sau khi xem video — bước tiếp theo',
    process: [
      { title: 'Xem giới thiệu đội', description: 'Biết ai sẽ đến, giấy tờ và cách làm việc trong nhà.' },
      { title: 'Đặt lịch online', description: 'Chọn dịch vụ — điều phối xác nhận thợ trong video hoặc cùng team.' },
      { title: 'Thợ đến đúng hẹn', description: 'Đồng phục, thẻ tên, giày bọc — checklist an toàn khi vào nhà.' },
      { title: 'Hoàn thành & đánh giá', description: 'Mời đánh giá video-style — feedback cải thiện dịch vụ.' },
    ],
    benefitsHeadline: 'Lợi ích xem video trước',
    benefits: [
      { title: 'Giảm lo lắng an ninh', description: 'Nhận diện thợ trước — không bất ngờ người lạ.' },
      { title: 'Hiểu quy trình an toàn', description: 'Ngắt điện, chống tràn nước, dọn vụn — thấy trước trên video.' },
      { title: 'Tin vào tay nghề', description: 'Thợ demo kỹ thuật cơ bản — không chỉ nói suông.' },
    ],
    featuresHeadline: 'Dịch vụ trong video',
    features: [
      { title: 'Sửa điện dân dụng', description: 'Aptomat, ổ cắm, đèn — an toàn tiêu chuẩn.' },
      { title: 'Điện nước kết hợp', description: 'Một lần hẹn — hai hạng mục nhỏ, tiết kiệm công đi lại.' },
      { title: 'Vệ sinh sau sửa chữa', description: 'Gói dọn dẹp hiện trường — nhà sạch khi thợ rời đi.' },
    ],
    galleryHeadline: 'Khung hình từ job thực tế',
    gallerySub: 'Still frame từ quay công trình — cùng đội trong video.',
    galleryItems: [
      { title: 'Thợ kiểm tra tủ điện', description: 'Frame từ video training nội bộ — đồng phục, dụng cụ cách ly.' },
      { title: 'Vệ sinh bếp sau sửa ống', description: 'Before/after trong cùng ca — dọn bụi khoan.' },
      { title: 'Thay sen nước nóng', description: 'Close-up mối siết chuẩn — không rò sau 30 ngày.' },
      { title: 'Nghiệm thu với khách', description: 'Ký checklist — mặt thợ trùng video giới thiệu.' },
    ],
    faq: [
      {
        question: 'Thợ trong video có phải người đến nhà mình không?',
        answer: 'Cùng team — thợ trưởng hoặc thợ đã xuất hiện trong video phụ trách khu bạn, trừ khi báo đổi trước.',
      },
      {
        question: 'Video có quay nhà tôi không?',
        answer: 'Chỉ khi bạn đồng ý bằng văn bản — mặc định chỉ ảnh still che thông tin.',
      },
    ],
    formHeadline: 'Đặt lịch sau khi xem video',
    formSub: 'Ghi “đã xem video” — ưu tiên thợ trong clip.',
    formSubmit: 'Đặt lịch với đội video',
    ctaHeadline: 'Sẵn sàng mời đội vào nhà?',
    ctaSub: 'Slot tuần này — xác nhận qua điện thoại trong 30 phút.',
    ctaLabel: 'Đặt lịch ngay →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['faq-booking']]: {
    hero: {
      headline: 'Thuê thợ điện nước — trả lời mọi thắc mắc trước khi đặt lịch',
      subheadline:
        'FAQ-first booking: giá, bảo hành, thời gian đến, an toàn — đọc xong rồi book. Giảm gọi điện hỏi lặp lại cùng câu hỏi.',
      ctaLabel: 'Đọc FAQ & đặt lịch',
      trustPoints: ['12 câu hỏi thường gặp', 'Giá tham khảo công khai', 'Book không cần gọi'],
    },
    benefitsHeadline: 'Dịch vụ chính',
    benefits: [
      { title: 'Sửa chữa điện nước', description: 'Rò, chập, tắc — báo giá theo công + vật tư sau khảo sát.' },
      { title: 'Vệ sinh nhà cửa', description: 'Theo giờ hoặc trọn gói — dụng cụ mang theo.' },
      { title: 'Bảo trì định kỳ', description: 'Gói 6 tháng — kiểm tra điện nước, nhắc lịch tự động.' },
    ],
    faq: [
      {
        question: 'Giá sửa điện nước tính thế nào?',
        answer: 'Công giờ đầu + vật tư thực tế. Bảng giá tham khảo trên web — chốt sau khảo sát, không làm khi chưa đồng ý.',
      },
      {
        question: 'Thợ đến trong bao lâu?',
        answer: 'Nội thành 2–4 giờ (giờ hành chính). Ca gấp tối và CN — phụ phí 20%, xác nhận khi đặt.',
      },
      {
        question: 'Có bảo hành không?',
        answer: '7 ngày sửa chữa thường, 30 ngày thay linh kiện — biên bản ký tay hoặc điện tử.',
      },
      {
        question: 'Thợ có giấy tờ không?',
        answer: 'CMND/CCCD, thẻ nhân viên, bảo hiểm trách nhiệm — xuất trình khi vào nhà nếu bạn yêu cầu.',
      },
      {
        question: 'Thanh toán ra sao?',
        answer: 'Tiền mặt, chuyển khoản, ví điện tử — sau nghiệm thu. Cọc nhỏ chỉ với gói trọn hoặc ca cuối tuần.',
      },
      {
        question: 'Hủy hoặc đổi lịch?',
        answer: 'Miễn phí trước 2 giờ. Trong 2 giờ: phí đi lại 50.000đ nội thành.',
      },
    ],
    guarantee:
      'Cam kết FAQ: mọi phí nói trước · không upsell ép · thợ có giấy tờ · bảo hành có biên bản · hotline T2–CN 7:00–21:00.',
    testimonialsHeadline: 'Khách book sau khi đọc FAQ',
    testimonials: [
      {
        quote: 'Đọc hết FAQ xong book — không phải gọi hỏi giá rồi chờ báo.',
        author: 'Chị Diệp H.',
        role: 'Sửa vòi nước · Q. Phú Nhuận',
      },
      {
        quote: 'Chính sách bảo hành ghi rõ — yên tâm hơn mấy page chỉ có số hotline.',
        author: 'Anh Long K.',
        role: 'Thông cống · Q. 12',
      },
    ],
    formHeadline: 'Đặt lịch — đã đọc FAQ',
    formSub: 'Form ngắn — điều phối gọi xác nhận, không sales dài.',
    formSubmit: 'Xác nhận đặt lịch',
    ctaHeadline: 'Còn câu hỏi ngoài FAQ?',
    ctaSub: 'Nhắn Zalo — trả lời trong giờ làm việc.',
    ctaLabel: 'Nhắn hỏi thêm →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['area-nav']]: {
    hero: {
      headline: 'Thợ điện nước theo quận — chọn khu vực, xem giá, đặt lịch',
      subheadline:
        'Area nav: chọn quận/phường phục vụ — giá di chuyển, thời gian đến và gói ưu đãi theo khu. Self-serve trước khi gọi.',
      ctaLabel: 'Chọn khu vực & báo giá',
      trustPoints: ['15 quận nội thành', 'Phí di chuyển công khai', 'Thợ quen từng quận'],
    },
    featuresHeadline: 'Khu vực phục vụ chính',
    features: [
      { title: 'Quận 1 · 3 · 4 · 5', description: 'Trung tâm — có mặt 1–3 giờ, miễn phí di chuyển ≤ 5 km.' },
      { title: 'Quận Bình Thạnh · Phú Nhuận · Gò Vấp', description: 'Thợ trú khu — ưu tiên ca tối cuối tuần.' },
      { title: 'Quận 7 · 2 · Thủ Đức', description: 'Đội riêng khu Đông — gói vệ sinh căn hộ cao tầng.' },
      { title: 'Ngoại thành', description: 'Bình Chánh, Hóc Môn — phí km báo trước, lịch hẹn sáng sớm.' },
    ],
    processHeadline: 'Luồng chọn khu vực',
    process: [
      { title: 'Chọn quận/phường', description: 'Dropdown trên form — hệ thống gợi thợ gần nhất.' },
      { title: 'Xem bảng giá khu', description: 'Giá tham khảo + phí di chuyển — không surprise khi thợ đến.' },
      { title: 'Chọn gói hoặc theo giờ', description: 'Basic / theo giờ / trọn gói — so sánh trước khi gửi.' },
      { title: 'Xác nhận & dispatch', description: 'Thợ quen khu gọi trong 30 phút — chốt giờ đến.' },
    ],
    benefitsHeadline: 'Lợi ích chọn theo khu',
    benefits: [
      { title: 'Đến nhanh hơn', description: 'Dispatch thợ trú cùng quận — không chờ từ xa.' },
      { title: 'Giá theo vùng rõ', description: 'Một số khu có gói combo — tiết kiệm phí đi lại.' },
      { title: 'Thợ biết loại nhà', description: 'Chung cư vs nhà phố — ước lượng vật tư chính xác hơn.' },
    ],
    galleryHeadline: 'Job theo từng quận',
    gallerySub: 'Lọc ảnh theo khu bạn chọn — tham chiếu giá và thời gian.',
    galleryItems: [
      { title: 'Q. 1 — sửa chập văn phòng', description: 'Ca tối sau giờ — không làm gián đoạn làm việc.' },
      { title: 'Q. 7 — vệ sinh căn hộ', description: 'The Marina — gói 3 giờ, 2 nhân sự.' },
      { title: 'Q. Tân Bình — thông cống', description: 'Nhà phố hẻm — xe mang máy lò xo công nghiệp.' },
      { title: 'Q. 2 — bảo trì điện định kỳ', description: 'Chung cư cao tầng — checklist 18 điểm.' },
    ],
    pricingHeadline: 'Giá theo khu (tham khảo)',
    pricing: [
      {
        name: 'Nội thành gần',
        price: '150.000đ',
        period: 'công/giờ từ',
        features: ['Miễn phí ≤ 5 km', '2–4 giờ có mặt', 'Thợ quen quận'],
        highlighted: false,
      },
      {
        name: 'Combo quận',
        price: '990.000đ',
        period: '/lần',
        features: ['Vệ sinh + kiểm tra điện nước', '≤ 70 m²', 'Ưu đãi tái đặt'],
        highlighted: true,
      },
      {
        name: 'Ngoại thành',
        price: 'Liên hệ',
        features: ['Phí km công khai', 'Lịch sáng sớm', 'Gói định kỳ'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Khách chọn theo quận',
    testimonials: [
      {
        quote: 'Chọn Q. 7 trên web — thợ quen tòa nhà, lên ca nhanh.',
        author: 'Anh Việt N.',
        role: 'Vệ sinh · Q. 7',
      },
      {
        quote: 'Biết trước phí di chuyển sang Bình Chánh — không tranh cãi khi thanh toán.',
        author: 'Chú Ba H.',
        role: 'Sửa điện · Bình Chánh',
      },
    ],
    formHeadline: 'Chọn quận & đặt lịch',
    formSub: 'Dropdown khu vực bắt buộc — báo giá sơ bộ theo quận.',
    formSubmit: 'Nhận báo giá khu vực',
    ctaHeadline: 'Không thấy quận của bạn?',
    ctaSub: 'Ghi địa chỉ — kiểm tra phạm vi phục vụ trong 24h.',
    ctaLabel: 'Kiểm tra khu vực →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['early-book']]: {
    hero: {
      headline: 'Đặt lịch thợ ngay — form dưới đầu trang, xác nhận trong 30 phút',
      subheadline:
        'Early book: high-intent — chọn dịch vụ, giờ và địa chỉ trước khi xem gallery hay FAQ. Dành khách đã biết cần sửa gì.',
      body: 'Sửa điện, vệ sinh, thông cống — một form, không scroll nhiều section.',
      ctaLabel: 'Cuộn xuống — đặt lịch ngay',
      trustPoints: ['Xác nhận 30 phút', 'Không spam', 'Đổi lịch miễn phí 2h'],
    },
    benefitsHeadline: 'Sau khi gửi form',
    benefits: [
      { title: 'Gọi xác nhận nhanh', description: 'Điều phối gọi hoặc Zalo — chốt giờ thợ đến.' },
      { title: 'Báo giá sơ bộ', description: 'Qua mô tả việc — phạm vi và vật tư dự kiến.' },
      { title: 'Nhắc lịch tự động', description: 'SMS trước 1 giờ — link đổi lịch nếu bận.' },
    ],
    processHeadline: 'Form → thợ đến nhà',
    process: [
      { title: 'Gửi form 1 phút', description: 'Loại việc, địa chỉ, SĐT, khung giờ mong muốn.' },
      { title: 'Xác nhận 30 phút', description: 'Điều phối gọi — thợ và giá sơ bộ.' },
      { title: 'Thợ đến & khảo sát', description: 'Chốt giá tại chỗ — làm ngay nếu đồng ý.' },
      { title: 'Thanh toán & xong', description: 'Biên bản ngắn — bảo hành ghi trên biên lai.' },
    ],
    galleryHeadline: 'Job gần đây (teaser)',
    gallerySub: 'Xem thêm sau khi đặt — ưu tiên xác nhận lịch trước.',
    galleryItems: [
      { title: 'Ca sáng — sửa điện', description: 'Q. 10 — thay cầu dao, 45 phút.' },
      { title: 'Ca chiều — vệ sinh', description: 'Căn 2PN — 3 giờ, 2 người.' },
      { title: 'Ca tối — khẩn cấp nước', description: 'Rò sàn — xử lý trong 90 phút.' },
      { title: 'Cuối tuần — combo', description: 'Vệ sinh + kiểm tra điện — một lần hẹn.' },
    ],
    guarantee:
      'Cam kết early book: xác nhận trong 30 phút giờ hành chính · không gọi marketing · đổi lịch trước 2h miễn phí · thợ có giấy tờ.',
    testimonialsHeadline: 'Khách đặt lịch sớm',
    testimonials: [
      {
        quote: 'Biết cần thông cống — form đầu trang, 20 phút có người gọi lại.',
        author: 'Anh Tài P.',
        role: 'Thông cống · Q. 11',
      },
      {
        quote: 'Không phải đọc cả trang — gửi form xong đi làm việc khác.',
        author: 'Chị Hương L.',
        role: 'Vệ sinh · Q. 1',
      },
    ],
    formHeadline: 'Đặt lịch thợ — 1 phút',
    formSub: 'Dịch vụ · địa chỉ · SĐT · khung giờ — ưu tiên xử lý form trên cùng.',
    formSubmit: 'Gửi đặt lịch ngay',
    ctaHeadline: 'Đã gửi form?',
    ctaSub: 'Kiểm tra Zalo/SMS — điều phối sẽ liên hệ sớm.',
    ctaLabel: 'Gửi lại form →',
  },

  [SERVICE_DIRECTION_ARCHITECTURE_IDS['quick-book']]: {
    hero: {
      headline: 'Thợ sửa nhà — gọn, nhanh, đặt lịch',
      subheadline: 'Điện · nước · vệ sinh — form tối giản, xác nhận qua SMS.',
      ctaLabel: 'Đặt lịch',
      trustPoints: ['Có mặt trong ngày', 'Báo giá trước', 'Bảo hành 7 ngày'],
    },
    processHeadline: '3 bước',
    process: [
      { title: 'Gửi form', description: 'Tên, SĐT, việc cần làm — 30 giây.' },
      { title: 'Nhận SMS xác nhận', description: 'Giờ thợ đến và báo giá sơ bộ.' },
      { title: 'Làm & xong', description: 'Thanh toán sau nghiệm thu.' },
    ],
    featuresHeadline: 'Dịch vụ',
    features: [
      { title: 'Sửa điện nước', description: 'Rò, chập, tắc — thợ mang dụng cụ cơ bản.' },
      { title: 'Vệ sinh theo giờ', description: 'Tối thiểu 2 giờ — dụng cụ có sẵn.' },
      { title: 'Sửa nhỏ', description: 'Treo kệ, khóa cửa — báo giá nhanh.' },
    ],
    formHeadline: 'Đặt lịch — 30 giây',
    formSub: 'Tên · SĐT · nhu cầu sửa chữa (30 giây).',
    formSubmit: 'Gửi',
    ctaHeadline: 'Cần thợ hôm nay',
    ctaSub: 'Form trên — hoặc bấm lại.',
    ctaLabel: 'Đặt lịch →',
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

export function patchServiceGalleryItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  galleryItems: ServiceGalleryItem[] | undefined,
) {
  if (!galleryItems?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: galleryItems[i]?.title ?? item.title,
    description: galleryItems[i]?.description ?? item.description,
  }));
}

export function applyServiceDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveServiceDirectionStandard(architectureId);
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
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
          items: (patchServiceGalleryItems(block.items, copy.galleryItems) ||
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
            ...(block.items[i] || block.items[0] || { id: `service_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `service_dir_tm_${architectureId}_${i + 1}`,
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
            id: `service_dir_faq_${architectureId}_${i + 1}`,
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

export function listServiceDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
