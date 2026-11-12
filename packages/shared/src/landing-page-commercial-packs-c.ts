import { F, type CommercialPack } from './landing-page-commercial-types';

/** Education & knowledge products: course, webinar, coaching, ebook, lead_magnet. */
export const COMMERCIAL_PACKS_C: Record<string, CommercialPack> = {
  course: {
    brand: 'Học viện Kỹ năng Số',
    nav: ['Nội dung', 'Lộ trình', 'Học phí', 'Đăng ký'],
    noun: 'khóa học',
    verb: 'đăng ký học',
    heroAlt: 'Học viên cùng làm việc nhóm trên máy tính trong lớp học',
    description:
      'Trang đăng ký khóa học online: nội dung, lộ trình từng tuần, học phí và biểu mẫu đăng ký tư vấn.',
    hero: {
      h: 'Học một kỹ năng mới theo lộ trình rõ ràng, có người đồng hành',
      s: 'Khóa học thực hành theo từng tuần, có bài tập, giải đáp thắc mắc và tài liệu để bạn áp dụng ngay vào công việc.',
      cta: 'Đăng ký học thử',
      trust: ['Lộ trình theo từng tuần', 'Bài tập thực hành có nhận xét', 'Giải đáp thắc mắc trong nhóm học'],
    },
    angles: {
      trust: ['Học thực hành, có người hướng dẫn và nhận xét bài làm', 'Nội dung được chia nhỏ, mỗi buổi có bài tập để bạn áp dụng và nhận phản hồi.'],
      price: ['Chọn hình thức học phù hợp với bạn', 'Học phí rõ ràng cho từng lựa chọn, bạn xem trước những gì được bao gồm.'],
      process: ['Lộ trình học theo từng tuần', 'Biết trước mỗi tuần học gì, làm gì và bạn sẽ đạt được gì.'],
      proof: ['Một buổi học diễn ra như thế nào', 'Hình ảnh lớp học và cách chúng tôi hướng dẫn thực hành.'],
    },
    benefits: {
      h: 'Bạn sẽ nhận được gì từ khóa học',
      s: 'Thiết kế cho người đi làm muốn học nhanh và áp dụng được ngay.',
      items: [
        ['Học theo lộ trình', 'Nội dung sắp xếp từ cơ bản đến thực hành, không bị rối.'],
        ['Thực hành có phản hồi', 'Mỗi bài tập đều được giảng viên xem và góp ý.'],
        ['Học linh hoạt', 'Xem lại bài ghi hình bất cứ lúc nào phù hợp với lịch của bạn.'],
        ['Cộng đồng học viên', 'Trao đổi, hỏi đáp và chia sẻ kinh nghiệm cùng nhau.'],
      ],
    },
    features: {
      h: 'Nội dung khóa học',
      s: 'Từng học phần tập trung vào một kỹ năng cụ thể.',
      items: [
        ['Nền tảng kiến thức', 'Hiểu đúng khái niệm cốt lõi trước khi bắt tay làm.'],
        ['Thực hành theo tình huống', 'Làm bài tập dựa trên tình huống công việc thực tế.'],
        ['Công cụ và mẫu biểu', 'Nhận tài liệu, mẫu và checklist để dùng lại.'],
        ['Dự án cuối khóa', 'Áp dụng toàn bộ kiến thức vào một sản phẩm của riêng bạn.'],
      ],
    },
    process: {
      h: 'Lộ trình học',
      s: 'Từ khi đăng ký đến khi hoàn thành khóa học.',
      items: [
        ['Đăng ký & định hướng', 'Chọn lớp, nhận hướng dẫn tham gia và tài liệu đầu khóa.'],
        ['Học theo tuần', 'Mỗi tuần một chủ đề, có video bài giảng và bài tập.'],
        ['Thực hành & nhận xét', 'Nộp bài, nhận góp ý từ giảng viên và trợ giảng.'],
        ['Hoàn thành dự án', 'Bảo vệ dự án cuối khóa và nhận phản hồi tổng kết.'],
      ],
    },
    gallery: {
      h: 'Lớp học của chúng tôi',
      s: 'Không khí học tập tập trung và thân thiện.',
      items: [
        ['Buổi học trực tiếp', 'Giảng viên hướng dẫn và giải đáp ngay tại lớp.'],
        ['Làm việc nhóm', 'Thảo luận và làm bài cùng nhau.'],
        ['Hướng dẫn thao tác', 'Trợ giảng hỗ trợ từng bước trên máy tính.'],
        ['Góc tự học', 'Không gian yên tĩnh để ôn bài và làm bài tập.'],
        ['Ghi chép & lên kế hoạch', 'Luyện cách tổ chức công việc học tập.'],
        ['Thảo luận cuối buổi', 'Tổng kết điều đã học và giải đáp thắc mắc.'],
      ],
    },
    pricing: {
      h: 'Học phí',
      s: 'Học phí tham khảo — liên hệ để biết lịch khai giảng gần nhất.',
      plans: [
        { name: 'Học cùng lớp', price: '3.900.000đ', features: ['Học theo lịch lớp', 'Bài tập có nhận xét', 'Tài liệu khóa học'], cta: 'Đăng ký lớp' },
        { name: 'Học kèm riêng', price: '6.900.000đ', features: ['Bao gồm gói Học cùng lớp', 'Buổi kèm 1:1 hàng tuần', 'Hỗ trợ dự án cá nhân'], highlighted: true, cta: 'Đăng ký học kèm' },
        { name: 'Cho doanh nghiệp', price: 'Liên hệ', features: ['Đào tạo theo nhu cầu nhóm', 'Lịch học linh hoạt', 'Báo cáo tiến độ'], cta: 'Liên hệ tư vấn' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi chưa có kinh nghiệm có học được không?', 'Được. Khóa học bắt đầu từ nền tảng và tăng dần độ khó theo từng tuần.'],
        ['Mỗi tuần tôi cần dành bao nhiêu thời gian?', 'Khoảng 4–6 giờ cho bài giảng và bài tập. Bạn có thể sắp xếp linh hoạt trong tuần.'],
        ['Nếu bỏ lỡ buổi học thì sao?', 'Mọi buổi học đều được ghi hình để bạn xem lại.'],
        ['Có được hoàn học phí không?', 'Chính sách hoàn học phí được thông báo rõ trước khi bạn thanh toán.'],
      ],
    },
    guarantee: ['Cam kết với học viên', 'Nội dung, lịch học và chính sách học phí được thông báo rõ ràng trước khi bạn đăng ký.'],
    cta: { h: 'Bắt đầu hành trình học cùng chúng tôi', b: 'Để lại thông tin, tư vấn viên sẽ gọi hướng dẫn chọn lớp phù hợp.', label: 'Đăng ký tư vấn' },
    form: {
      h: 'Đăng ký tư vấn khóa học',
      s: 'Tư vấn viên sẽ liên hệ giải đáp và hướng dẫn chọn lớp.',
      submit: 'Đăng ký ngay',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ tư vấn sớm.',
      footer: 'Thông tin chỉ dùng để tư vấn khóa học.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.select('level', 'Trình độ hiện tại', ['Mới bắt đầu', 'Đã biết cơ bản', 'Đang làm nghề'], true), F.note('Bạn muốn đạt điều gì sau khóa học?', 'Chia sẻ ngắn mục tiêu của bạn', 'goal')],
    },
    footer: 'Học viện Kỹ năng Số — khóa học thực hành cho người đi làm.',
  },

  webinar: {
    brand: 'Hội thảo Trực tuyến',
    nav: ['Chủ đề', 'Chương trình', 'Quyền lợi', 'Đăng ký'],
    noun: 'buổi hội thảo',
    verb: 'đăng ký tham dự',
    heroAlt: 'Khán giả theo dõi buổi chia sẻ chuyên môn trên màn hình lớn',
    eventMeta: ['Lịch chính thức gửi qua email', 'Khoảng 90 phút', 'Trực tuyến'],
    description:
      'Trang đăng ký hội thảo trực tuyến: chủ đề, chương trình chi tiết, quyền lợi người tham dự và biểu mẫu giữ chỗ.',
    hero: {
      h: 'Buổi chia sẻ trực tuyến giúp bạn áp dụng ngay vào công việc',
      s: 'Nghe chuyên gia trình bày, xem ví dụ thực tế và đặt câu hỏi trực tiếp trong buổi chia sẻ.',
      cta: 'Giữ chỗ miễn phí',
      trust: ['Tham dự trực tuyến từ mọi nơi', 'Có phần hỏi đáp trực tiếp', 'Nhận tài liệu sau buổi chia sẻ'],
    },
    angles: {
      trust: ['Nội dung được chuẩn bị kỹ, tập trung vào điều bạn áp dụng được', 'Diễn giả chia sẻ từ kinh nghiệm thực tế, kèm ví dụ và tài liệu để bạn làm theo.'],
      price: ['Chọn hình thức tham gia phù hợp với bạn', 'Từ tham dự trực tiếp đến nhận bản ghi hình và tài liệu đầy đủ.'],
      process: ['Chương trình buổi chia sẻ', 'Biết trước từng phần để chọn nội dung bạn quan tâm nhất.'],
      proof: ['Không khí của những buổi chia sẻ trước đây', 'Người tham dự trao đổi trực tiếp với diễn giả và nhau.'],
    },
    benefits: {
      h: 'Quyền lợi khi tham dự',
      s: 'Điều bạn nhận được sau buổi chia sẻ.',
      items: [
        ['Nội dung thực tế', 'Ví dụ và quy trình có thể áp dụng ngay.'],
        ['Hỏi đáp trực tiếp', 'Đặt câu hỏi và nhận trả lời từ diễn giả.'],
        ['Tài liệu đi kèm', 'Nhận slide và biểu mẫu sau buổi chia sẻ.'],
        ['Xem lại khi cần', 'Bản ghi hình gửi đến người đã đăng ký.'],
      ],
    },
    features: {
      h: 'Nội dung chính',
      s: 'Bốn phần trình bày theo thứ tự dễ theo dõi.',
      items: [
        ['Vấn đề thường gặp', 'Những khó khăn phổ biến mà người làm nghề gặp phải.'],
        ['Cách tiếp cận', 'Khung làm việc từng bước để giải quyết.'],
        ['Ví dụ minh họa', 'Phân tích tình huống để dễ hình dung.'],
        ['Kế hoạch hành động', 'Danh sách việc cần làm ngay sau buổi chia sẻ.'],
      ],
    },
    process: {
      h: 'Chương trình',
      s: 'Thời gian cụ thể sẽ được gửi qua email khi bạn đăng ký.',
      items: [
        ['Mở đầu', 'Giới thiệu chủ đề và mục tiêu buổi chia sẻ.'],
        ['Chia sẻ chính', 'Diễn giả trình bày nội dung và ví dụ.'],
        ['Hỏi đáp trực tiếp', 'Giải đáp câu hỏi của người tham dự.'],
        ['Tổng kết', 'Nhắc lại điểm chính và hướng dẫn nhận tài liệu.'],
      ],
    },
    gallery: {
      h: 'Hình ảnh từ các buổi chia sẻ',
      s: 'Không khí tương tác và trao đổi cởi mở.',
      items: [
        ['Khán phòng', 'Người tham dự theo dõi phần trình bày.'],
        ['Trình bày với slide', 'Nội dung được minh họa trực quan.'],
        ['Thảo luận nhóm', 'Chia sẻ kinh nghiệm cùng diễn giả.'],
      ],
    },
    pricing: {
      h: 'Hình thức tham gia',
      s: 'Quyền lợi áp dụng cho từng hình thức.',
      plans: [
        { name: 'Tham dự trực tuyến', price: 'Miễn phí', features: ['Xem trực tiếp', 'Hỏi đáp cùng diễn giả'], cta: 'Giữ chỗ' },
        { name: 'Kèm tài liệu & ghi hình', price: '199.000đ', features: ['Bao gồm tham dự trực tuyến', 'Bản ghi hình', 'Bộ tài liệu đầy đủ'], highlighted: true, cta: 'Đăng ký gói đầy đủ' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi tham dự bằng cách nào?', 'Sau khi đăng ký, đường dẫn tham gia sẽ được gửi qua email trước buổi chia sẻ.'],
        ['Tôi không tham dự được trực tiếp thì sao?', 'Bản ghi hình sẽ được gửi đến email của người đã đăng ký.'],
        ['Có cần chuẩn bị gì trước không?', 'Bạn chỉ cần máy tính hoặc điện thoại có kết nối internet.'],
        ['Tôi có thể đặt câu hỏi không?', 'Có. Phần hỏi đáp trực tiếp được dành cho người tham dự.'],
      ],
    },
    guarantee: ['Thông tin rõ ràng', 'Thời gian, nội dung và đường dẫn tham dự được gửi qua email sau khi bạn đăng ký.'],
    cta: { h: 'Giữ chỗ cho buổi chia sẻ sắp tới', b: 'Đăng ký để nhận đường dẫn tham gia và tài liệu.', label: 'Giữ chỗ miễn phí' },
    form: {
      h: 'Đăng ký tham dự',
      s: 'Chúng tôi sẽ gửi đường dẫn tham gia qua email.',
      submit: 'Giữ chỗ cho tôi',
      success: 'Cảm ơn bạn! Thông tin tham dự sẽ được gửi qua email.',
      footer: 'Thông tin chỉ dùng để gửi lịch và tài liệu.',
      fields: [F.NAME, F.EMAIL_REQ, F.ZALO, F.note('Câu hỏi bạn muốn gửi cho diễn giả (nếu có)', 'VD: Tôi nên bắt đầu từ đâu?', 'question')],
    },
    footer: 'Hội thảo Trực tuyến — chia sẻ chuyên môn và kinh nghiệm thực tế.',
  },

  coaching: {
    brand: 'Hành trình Đồng hành',
    nav: ['Phương pháp', 'Tiến trình', 'Chương trình', 'Đăng ký'],
    noun: 'chương trình đồng hành',
    verb: 'đăng ký trao đổi',
    heroAlt: 'Hai người trao đổi mục tiêu cá nhân tại bàn làm việc',
    description:
      'Trang giới thiệu chương trình huấn luyện cá nhân: phương pháp, tiến trình đồng hành và đăng ký buổi trao đổi đầu tiên.',
    hero: {
      h: 'Có người đồng hành để bạn làm rõ mục tiêu và bắt tay thực hiện',
      s: 'Qua các buổi trao đổi 1:1, bạn xác định điều quan trọng, đặt kế hoạch cụ thể và duy trì thói quen để tiến bộ đều đặn.',
      cta: 'Đặt buổi trao đổi đầu tiên',
      trust: ['Buổi đầu giúp hai bên hiểu nhau', 'Kế hoạch được cá nhân hóa', 'Giữ kín thông tin chia sẻ'],
    },
    angles: {
      trust: ['Phương pháp rõ ràng, tôn trọng tốc độ của bạn', 'Mỗi buổi tập trung vào một điều bạn muốn thay đổi, với những bước nhỏ có thể làm ngay.'],
      price: ['Chọn chương trình đồng hành phù hợp', 'Từ một buổi định hướng đến lộ trình nhiều tuần — nội dung và chi phí ghi rõ.'],
      process: ['Hành trình đồng hành từng bước', 'Từ làm rõ mục tiêu, lập kế hoạch đến rà soát và điều chỉnh.'],
      proof: ['Những hoạt động trong chương trình', 'Trao đổi 1:1, bài tập tự phản chiếu và theo dõi tiến độ.'],
    },
    benefits: {
      h: 'Bạn sẽ nhận được gì',
      s: 'Tập trung vào thay đổi nhỏ nhưng bền vững.',
      items: [
        ['Làm rõ mục tiêu', 'Xác định điều bạn thực sự muốn và vì sao.'],
        ['Kế hoạch từng bước', 'Chia mục tiêu lớn thành việc nhỏ làm được mỗi tuần.'],
        ['Có người đồng hành', 'Được lắng nghe, đặt câu hỏi và nhắc bạn đi đúng hướng.'],
        ['Tiến bộ nhìn thấy được', 'Theo dõi kết quả để điều chỉnh kịp thời.'],
      ],
    },
    features: {
      h: 'Chương trình bao gồm',
      s: 'Các hoạt động chính trong quá trình đồng hành.',
      items: [
        ['Buổi trao đổi 1:1', 'Trò chuyện riêng tư, tập trung vào vấn đề của bạn.'],
        ['Bài tập giữa các buổi', 'Những việc nhỏ để thực hành giữa hai buổi gặp.'],
        ['Theo dõi tiến độ', 'Cập nhật mục tiêu và điều chỉnh kế hoạch.'],
        ['Nhắn tin hỗ trợ', 'Trao đổi nhanh khi bạn cần định hướng.'],
      ],
    },
    process: {
      h: 'Tiến trình đồng hành',
      s: 'Bốn giai đoạn từ làm rõ đến duy trì.',
      items: [
        ['Làm rõ', 'Xác định mục tiêu, giá trị và những điều đang cản trở.'],
        ['Lập kế hoạch', 'Đặt các bước hành động cụ thể và mốc thời gian.'],
        ['Thực hành', 'Áp dụng kế hoạch và ghi lại điều học được mỗi tuần.'],
        ['Rà soát & duy trì', 'Đánh giá kết quả, điều chỉnh và xây thói quen lâu dài.'],
      ],
    },
    gallery: {
      h: 'Hoạt động trong chương trình',
      s: 'Không gian yên tĩnh để bạn nói điều mình thực sự nghĩ.',
      items: [
        ['Trao đổi 1:1', 'Trò chuyện cởi mở và không phán xét.'],
        ['Lập kế hoạch bằng sơ đồ', 'Hình dung mục tiêu và các bước thực hiện.'],
        ['Viết và tự phản chiếu', 'Ghi lại suy nghĩ để nhìn rõ điều quan trọng.'],
      ],
    },
    pricing: {
      h: 'Chương trình đồng hành',
      s: 'Chi phí tham khảo — buổi trao đổi đầu tiên giúp chọn chương trình phù hợp.',
      plans: [
        { name: 'Buổi định hướng', price: '690.000đ', features: ['1 buổi 60 phút', 'Làm rõ mục tiêu', 'Kế hoạch 30 ngày'], cta: 'Đặt buổi định hướng' },
        { name: 'Đồng hành 8 tuần', price: '5.900.000đ', features: ['8 buổi trao đổi 1:1', 'Bài tập giữa buổi', 'Nhắn tin hỗ trợ'], highlighted: true, cta: 'Đăng ký 8 tuần' },
        { name: 'Đồng hành 12 tuần', price: 'Liên hệ', features: ['Lộ trình dài hơn', 'Rà soát định kỳ', 'Điều chỉnh theo tiến độ'], cta: 'Liên hệ tư vấn' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Coaching khác gì tư vấn hay dạy kèm?', 'Coach không đưa lời khuyên làm thay bạn, mà đặt câu hỏi giúp bạn tự tìm ra hướng đi phù hợp.'],
        ['Tôi có phải chia sẻ chuyện riêng tư không?', 'Bạn chỉ chia sẻ những gì bạn thấy thoải mái. Thông tin được giữ kín.'],
        ['Mỗi buổi kéo dài bao lâu?', 'Khoảng 60 phút, trực tiếp hoặc qua video.'],
        ['Bao lâu thì thấy thay đổi?', 'Mỗi người một khác. Thường bạn nhận ra sự khác biệt trong vài tuần nếu thực hành đều đặn.'],
      ],
    },
    guarantee: ['Cam kết bảo mật', 'Mọi điều bạn chia sẻ trong buổi trao đổi được giữ kín và chỉ dùng cho mục đích đồng hành.'],
    cta: { h: 'Bạn đã sẵn sàng bắt đầu?', b: 'Đặt buổi trao đổi đầu tiên để xem hướng đồng hành có phù hợp với bạn không.', label: 'Đặt buổi trao đổi' },
    form: {
      h: 'Đặt buổi trao đổi đầu tiên',
      s: 'Chia sẻ ngắn về điều bạn muốn thay đổi, chúng tôi sẽ liên hệ xếp lịch.',
      submit: 'Gửi đăng ký',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xếp lịch trao đổi.',
      footer: 'Thông tin được giữ kín và chỉ dùng để liên hệ.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.note('Điều bạn muốn thay đổi hoặc đạt được', 'Chia sẻ ngắn gọn mục tiêu hiện tại của bạn', 'goal'), F.select('format', 'Hình thức mong muốn', ['Gặp trực tiếp', 'Gặp qua video'])],
    },
    footer: 'Hành trình Đồng hành — huấn luyện cá nhân giúp bạn làm rõ mục tiêu và hành động.',
  },

  ebook: {
    brand: 'Thư viện Kiến thức',
    nav: ['Nội dung', 'Dành cho ai', 'Câu hỏi', 'Tải tài liệu'],
    noun: 'tài liệu',
    verb: 'tải tài liệu',
    heroAlt: 'Sách mở trên bàn gỗ cùng ghi chú',
    description:
      'Trang tải tài liệu miễn phí: nội dung chính, đối tượng phù hợp và biểu mẫu nhận tài liệu qua email.',
    hero: {
      h: 'Tải miễn phí cẩm nang giúp bạn bắt đầu đúng hướng',
      s: 'Tài liệu tổng hợp các bước cần làm, ví dụ và biểu mẫu có thể dùng lại — đọc trong khoảng 20 phút.',
      cta: 'Tải tài liệu miễn phí',
      trust: ['Nhận ngay qua email', 'Đọc trong khoảng 20 phút', 'Có biểu mẫu để áp dụng'],
    },
    angles: {
      trust: ['Nội dung được biên soạn từ kinh nghiệm thực tế', 'Mỗi chương trình bày ngắn gọn, có ví dụ và danh sách việc cần làm.'],
      price: ['Tài liệu miễn phí và các tài nguyên mở rộng', 'Bắt đầu với bản miễn phí, bổ sung tài liệu chuyên sâu khi bạn cần.'],
      process: ['Cách đọc và áp dụng tài liệu', 'Đọc, làm theo checklist và ghi lại kết quả để điều chỉnh.'],
      proof: ['Xem trước nội dung tài liệu', 'Một số trang minh họa cho cách trình bày và ví dụ.'],
    },
    benefits: {
      h: 'Bên trong tài liệu có gì',
      s: 'Ngắn gọn, thực tế và dễ áp dụng.',
      items: [
        ['Các bước cần làm', 'Danh sách việc theo thứ tự để bạn không bỏ sót.'],
        ['Ví dụ minh họa', 'Tình huống cụ thể để dễ hiểu và làm theo.'],
        ['Biểu mẫu sử dụng lại', 'Mẫu có sẵn để điền theo trường hợp của bạn.'],
        ['Lỗi thường gặp', 'Những điều nên tránh khi bắt đầu.'],
      ],
    },
    features: {
      h: 'Nội dung chính',
      s: 'Các chương được trình bày theo thứ tự dễ theo dõi.',
      items: [
        ['Chương 1: Hiểu đúng vấn đề', 'Khung nhìn tổng quan để bạn xác định mình đang ở đâu.'],
        ['Chương 2: Lập kế hoạch', 'Cách đặt mục tiêu và ưu tiên công việc.'],
        ['Chương 3: Thực hiện', 'Các bước cụ thể kèm checklist.'],
        ['Chương 4: Đo lường', 'Theo dõi kết quả và điều chỉnh.'],
      ],
    },
    process: {
      h: 'Cách nhận tài liệu',
      s: 'Chỉ mất vài giây.',
      items: [
        ['Điền thông tin', 'Nhập tên và email nhận tài liệu.'],
        ['Kiểm tra email', 'Liên kết tải sẽ gửi đến hộp thư của bạn.'],
        ['Đọc và áp dụng', 'Làm theo checklist trong tài liệu.'],
      ],
    },
    gallery: {
      h: 'Xem trước tài liệu',
      s: 'Một vài hình ảnh minh họa cho cách trình bày.',
      items: [
        ['Mục lục & hướng dẫn', 'Tổng quan nội dung và cách sử dụng.'],
        ['Trang ví dụ', 'Tình huống minh họa và cách làm.'],
        ['Biểu mẫu thực hành', 'Phần bạn điền theo trường hợp của mình.'],
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tài liệu có thực sự miễn phí không?', 'Có. Bạn chỉ cần để lại email để nhận liên kết tải.'],
        ['Tôi sẽ nhận tài liệu bằng cách nào?', 'Liên kết tải gửi qua email. Nếu chưa thấy, hãy kiểm tra thư mục spam.'],
        ['Tài liệu dành cho ai?', 'Dành cho người mới bắt đầu và người muốn hệ thống lại kiến thức.'],
        ['Tôi có bị gửi thư quảng cáo không?', 'Bạn chỉ nhận email liên quan đến tài liệu và có thể hủy đăng ký bất cứ lúc nào.'],
      ],
    },
    guarantee: ['Tôn trọng quyền riêng tư', 'Email của bạn chỉ dùng để gửi tài liệu và nội dung liên quan; có thể hủy nhận bất cứ lúc nào.'],
    cta: { h: 'Nhận tài liệu và bắt đầu ngay hôm nay', b: 'Điền email để nhận liên kết tải miễn phí.', label: 'Tải tài liệu miễn phí' },
    form: {
      h: 'Nhận tài liệu miễn phí',
      s: 'Liên kết tải sẽ được gửi đến email của bạn.',
      submit: 'Gửi cho tôi tài liệu',
      success: 'Cảm ơn bạn! Hãy kiểm tra email để tải tài liệu.',
      footer: 'Bạn có thể hủy nhận email bất cứ lúc nào.',
      fields: [F.NAME, F.EMAIL_REQ, F.select('role', 'Bạn đang quan tâm vì', ['Tự học', 'Phục vụ công việc', 'Cho doanh nghiệp của tôi', 'Khác'])],
    },
    footer: 'Thư viện Kiến thức — tài liệu thực tế, đọc nhanh và dễ áp dụng.',
  },

  lead_magnet: {
    brand: 'Bộ Công cụ Miễn phí',
    nav: ['Bên trong có gì', 'Cách dùng', 'Câu hỏi', 'Nhận ngay'],
    noun: 'bộ công cụ',
    verb: 'nhận bộ công cụ',
    heroAlt: 'Nhóm làm việc cùng xem danh sách việc cần làm trên máy tính',
    description:
      'Trang nhận checklist và biểu mẫu miễn phí: nội dung bộ công cụ, cách sử dụng và biểu mẫu nhận qua email.',
    hero: {
      h: 'Nhận checklist giúp bạn làm đúng ngay từ lần đầu',
      s: 'Bộ công cụ gồm danh sách việc cần làm và biểu mẫu có sẵn — tải về là dùng được ngay, không cần chuẩn bị gì thêm.',
      cta: 'Nhận bộ công cụ miễn phí',
      trust: ['Miễn phí, nhận qua email', 'Dùng được ngay', 'Không cần cài đặt'],
    },
    angles: {
      trust: ['Rút gọn từ cách làm thực tế thành các bước dễ theo', 'Mỗi mục trong checklist đều có hướng dẫn ngắn để bạn hiểu và làm đúng.'],
      price: ['Miễn phí — kèm hướng dẫn sử dụng', 'Bạn chỉ cần để lại email, bộ công cụ gửi ngay trong vài phút.'],
      process: ['Dùng checklist trong ba bước', 'In ra hoặc dùng trực tuyến, đánh dấu từng mục khi hoàn thành.'],
      proof: ['Xem trước bộ công cụ', 'Một vài trang minh họa cho cách trình bày checklist và biểu mẫu.'],
    },
    benefits: {
      h: 'Vì sao nên dùng bộ công cụ này',
      s: 'Tiết kiệm thời gian tìm hiểu và tránh bỏ sót.',
      items: [
        ['Không bỏ sót bước nào', 'Danh sách đầy đủ theo thứ tự thực hiện.'],
        ['Tiết kiệm thời gian', 'Không phải tự soạn lại từ đầu.'],
        ['Dễ chỉnh theo nhu cầu', 'Có thể sửa và in theo trường hợp của bạn.'],
        ['Dùng được ngay', 'Tải về và bắt đầu trong vài phút.'],
      ],
    },
    features: {
      h: 'Bên trong bộ công cụ',
      s: 'Ba phần chính, gọn và dễ dùng.',
      items: [
        ['Checklist từng bước', 'Danh sách việc cần làm có thể đánh dấu.'],
        ['Biểu mẫu điền sẵn khung', 'Điền thông tin của bạn vào mẫu có sẵn.'],
        ['Hướng dẫn nhanh', 'Giải thích ngắn cho từng mục.'],
      ],
    },
    process: {
      h: 'Cách sử dụng',
      s: 'Ba bước đơn giản.',
      items: [
        ['Nhận bộ công cụ', 'Điền email để nhận liên kết tải.'],
        ['Làm theo checklist', 'Đánh dấu từng mục khi hoàn thành.'],
        ['Điều chỉnh theo bạn', 'Sửa biểu mẫu cho phù hợp với trường hợp của bạn.'],
      ],
    },
    gallery: {
      h: 'Xem trước bộ công cụ',
      s: 'Minh họa cách trình bày checklist và biểu mẫu.',
      items: [
        ['Trang checklist', 'Danh sách việc cần làm theo thứ tự.'],
        ['Biểu mẫu lập kế hoạch', 'Phần ghi chú và mục tiêu.'],
        ['Bảng theo dõi', 'Theo dõi tiến độ từng mục.'],
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Bộ công cụ có miễn phí không?', 'Có. Bạn chỉ cần để lại email để nhận.'],
        ['Tôi nhận ở đâu?', 'Liên kết tải được gửi đến email; hãy kiểm tra cả thư mục spam.'],
        ['Có dùng được trên điện thoại không?', 'Có. Bạn có thể xem trên điện thoại hoặc in ra giấy.'],
        ['Tôi có thể hủy nhận email không?', 'Có, bất cứ lúc nào bằng liên kết hủy trong email.'],
      ],
    },
    guarantee: ['Quyền riêng tư của bạn', 'Email chỉ dùng để gửi bộ công cụ và nội dung liên quan; có thể hủy nhận bất cứ lúc nào.'],
    cta: { h: 'Tải bộ công cụ và bắt đầu ngay', b: 'Chỉ cần email để nhận bộ công cụ miễn phí.', label: 'Nhận bộ công cụ miễn phí' },
    form: {
      h: 'Nhận bộ công cụ miễn phí',
      s: 'Chúng tôi gửi liên kết tải ngay vào email của bạn.',
      submit: 'Gửi cho tôi bộ công cụ',
      success: 'Cảm ơn bạn! Hãy kiểm tra email để tải bộ công cụ.',
      footer: 'Bạn có thể hủy nhận email bất cứ lúc nào.',
      fields: [F.NAME, F.EMAIL_REQ, F.select('role', 'Bạn làm việc trong lĩnh vực', ['Kinh doanh / bán hàng', 'Marketing', 'Vận hành', 'Khác'])],
    },
    footer: 'Bộ Công cụ Miễn phí — checklist và biểu mẫu dùng được ngay.',
  },
};
