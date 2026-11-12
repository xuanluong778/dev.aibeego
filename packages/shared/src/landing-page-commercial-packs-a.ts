import { F, type CommercialPack } from './landing-page-commercial-types';

/** B2B / digital services: agency, saas, seo, website, consulting. */
export const COMMERCIAL_PACKS_A: Record<string, CommercialPack> = {
  agency: {
    brand: 'Studio Tăng Trưởng',
    nav: ['Dịch vụ', 'Dự án', 'Quy trình', 'Liên hệ'],
    noun: 'dịch vụ marketing',
    verb: 'gửi brief',
    heroAlt: 'Nhóm marketing cùng thảo luận chiến dịch trong phòng họp',
    description:
      'Trang giới thiệu agency marketing: dịch vụ, dự án tiêu biểu, quy trình làm việc và biểu mẫu gửi brief để nhận đề xuất.',
    hero: {
      h: 'Đội ngũ marketing đồng hành cùng bạn từ chiến lược đến kết quả',
      s: 'Chúng tôi xây chiến dịch quảng cáo, nội dung và CRM theo mục tiêu kinh doanh của bạn — báo cáo rõ ràng mỗi tuần.',
      cta: 'Nhận đề xuất miễn phí',
      trust: ['Một đầu mối phụ trách', 'Báo cáo hàng tuần', 'Phạm vi rõ trước khi bắt đầu'],
    },
    angles: {
      trust: ['Làm việc minh bạch, đo lường bằng mục tiêu của bạn', 'Mỗi đề xuất ghi rõ phạm vi, thời gian và cách đo hiệu quả để bạn quyết định dễ dàng.'],
      price: ['Chọn gói hợp tác phù hợp với giai đoạn của doanh nghiệp', 'Từ tư vấn nhanh đến đồng hành dài hạn — phạm vi và chi phí được thống nhất trước khi triển khai.'],
      process: ['Từ buổi trao đổi đầu tiên đến chiến dịch chạy thật', 'Bốn bước rõ ràng giúp bạn biết mình đang ở đâu và bước tiếp theo là gì.'],
      proof: ['Những gì chúng tôi đã thực hiện cho khách hàng', 'Xem cách chúng tôi tiếp cận từng ngành và loại chiến dịch khác nhau.'],
    },
    benefits: {
      h: 'Vì sao doanh nghiệp chọn làm việc cùng chúng tôi',
      s: 'Tập trung vào mục tiêu kinh doanh, không chạy theo con số hào nhoáng.',
      items: [
        ['Chiến lược trước, quảng cáo sau', 'Bắt đầu từ mục tiêu và khách hàng mục tiêu rồi mới chọn kênh phù hợp.'],
        ['Đội ngũ đa kênh', 'Quảng cáo, nội dung, thiết kế và CRM cùng một nhóm, không phải phối hợp nhiều bên.'],
        ['Báo cáo dễ hiểu', 'Mỗi tuần có bản tóm tắt: đã làm gì, kết quả ra sao, tuần tới thử gì.'],
        ['Phản hồi nhanh', 'Một đầu mối phụ trách trả lời trong giờ làm việc.'],
      ],
    },
    features: {
      h: 'Dịch vụ chúng tôi cung cấp',
      s: 'Chọn từng hạng mục hoặc kết hợp thành một gói trọn vẹn.',
      items: [
        ['Quảng cáo hiệu suất', 'Thiết lập, tối ưu và đo lường chiến dịch trên Facebook, Google và TikTok.'],
        ['Nội dung & sáng tạo', 'Ý tưởng, kịch bản, hình ảnh và video phù hợp từng kênh.'],
        ['Landing page & chuyển đổi', 'Thiết kế trang đích và biểu mẫu để biến khách truy cập thành khách hàng tiềm năng.'],
        ['CRM & tự động hóa', 'Gắn tag, chăm sóc khách tự động và theo dõi toàn bộ hành trình mua.'],
      ],
    },
    process: {
      h: 'Quy trình làm việc',
      s: 'Từng bước được thống nhất với bạn trước khi triển khai.',
      items: [
        ['Trao đổi mục tiêu', 'Tìm hiểu sản phẩm, khách hàng, ngân sách và điều bạn muốn đạt được.'],
        ['Đề xuất phạm vi', 'Gửi kế hoạch, hạng mục, thời gian và cách đo hiệu quả để bạn xem xét.'],
        ['Triển khai', 'Cài đặt, chạy thử và tối ưu theo dữ liệu thực tế mỗi tuần.'],
        ['Báo cáo & mở rộng', 'Tổng kết kết quả, giữ lại điều hiệu quả và đề xuất bước tiếp theo.'],
      ],
    },
    gallery: {
      h: 'Dự án tiêu biểu',
      s: 'Một số hướng triển khai chúng tôi thường thực hiện.',
      items: [
        ['Chiến dịch ra mắt sản phẩm', 'Kết hợp quảng cáo, nội dung và trang đích trong giai đoạn đầu.'],
        ['Tăng trưởng khách hàng tiềm năng', 'Tối ưu chi phí mỗi khách hàng tiềm năng cho dịch vụ B2B.'],
        ['Xây dựng thương hiệu cho doanh nghiệp nhỏ', 'Bộ nhận diện và nội dung nhất quán trên mọi kênh.'],
        ['Chăm sóc khách hàng cũ', 'Chuỗi email và tin nhắn tự động giúp khách quay lại.'],
        ['Chiến dịch mùa cao điểm', 'Lên kế hoạch ngân sách và thông điệp cho dịp bán hàng lớn.'],
        ['Báo cáo và tối ưu liên tục', 'Bảng theo dõi giúp quyết định tăng hay giảm ngân sách.'],
      ],
    },
    pricing: {
      h: 'Gói hợp tác',
      s: 'Mức giá tham khảo — phạm vi cụ thể được thống nhất sau buổi trao đổi.',
      plans: [
        { name: 'Khởi động', price: 'Từ 15.000.000đ', period: '/tháng', features: ['Rà soát kênh hiện tại', 'Kế hoạch 30 ngày', 'Báo cáo hàng tuần'] },
        { name: 'Đồng hành', price: 'Từ 30.000.000đ', period: '/tháng', features: ['Quảng cáo + nội dung', 'Tối ưu liên tục', 'Họp tiến độ hàng tuần'], highlighted: true },
        { name: 'Toàn diện', price: 'Liên hệ', features: ['Chiến lược + triển khai', 'CRM và tự động hóa', 'Đội ngũ chuyên trách'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Ngân sách tối thiểu để bắt đầu là bao nhiêu?', 'Tùy mục tiêu và ngành. Sau buổi trao đổi chúng tôi sẽ đề xuất mức ngân sách quảng cáo và phí dịch vụ phù hợp.'],
        ['Bao lâu thì thấy kết quả?', 'Thường cần vài tuần để thu thập dữ liệu và tối ưu. Chúng tôi sẽ nói rõ kỳ vọng thực tế trước khi bắt đầu.'],
        ['Tôi có được xem báo cáo thường xuyên không?', 'Có. Bạn nhận báo cáo hàng tuần và có thể xem số liệu bất cứ lúc nào.'],
        ['Có ràng buộc hợp đồng dài hạn không?', 'Hợp đồng được thỏa thuận theo từng giai đoạn; điều khoản chấm dứt được ghi rõ ngay từ đầu.'],
      ],
    },
    guarantee: ['Cam kết làm việc minh bạch', 'Phạm vi, chi phí và cách đo hiệu quả được ghi rõ trong đề xuất trước khi bạn quyết định hợp tác.'],
    cta: { h: 'Bạn đã có mục tiêu? Hãy kể cho chúng tôi nghe', b: 'Gửi brief ngắn, chúng tôi phản hồi đề xuất sơ bộ trong giờ làm việc.', label: 'Gửi brief ngay' },
    form: {
      h: 'Gửi brief cho chúng tôi',
      s: 'Chỉ mất 2 phút. Chúng tôi sẽ liên hệ để trao đổi thêm.',
      submit: 'Gửi brief',
      success: 'Cảm ơn bạn! Chúng tôi đã nhận brief và sẽ liên hệ sớm.',
      footer: 'Thông tin của bạn chỉ được dùng để liên hệ về yêu cầu này.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.text('website', 'Website / fanpage (nếu có)', 'https://'), F.note('Mục tiêu và ngân sách dự kiến', 'Bạn muốn đạt điều gì trong 3 tháng tới?', 'brief')],
    },
    footer: 'Studio Tăng Trưởng — đồng hành cùng doanh nghiệp từ chiến lược đến triển khai. Liên hệ qua biểu mẫu để nhận đề xuất.',
  },

  saas: {
    brand: 'Nền tảng Vận hành',
    nav: ['Tính năng', 'Cách hoạt động', 'Bảng giá', 'Dùng thử'],
    noun: 'phần mềm',
    verb: 'dùng thử',
    heroAlt: 'Bảng điều khiển phần mềm quản lý hiển thị trên máy tính xách tay',
    description:
      'Trang giới thiệu phần mềm SaaS: lợi ích chính, tính năng, bảng giá và đăng ký dùng thử hoặc xem demo.',
    hero: {
      h: 'Quản lý công việc kinh doanh trên một nền tảng, rõ ràng và gọn gàng',
      s: 'Gom khách hàng, đơn hàng và báo cáo về một nơi để cả nhóm cùng làm việc, thay vì rải rác trong nhiều bảng tính.',
      cta: 'Dùng thử miễn phí',
      trust: ['Không cần thẻ tín dụng', 'Thiết lập trong ít phút', 'Hỗ trợ tiếng Việt'],
    },
    angles: {
      trust: ['Dữ liệu của bạn luôn được bảo vệ và thuộc về bạn', 'Phân quyền theo vai trò, sao lưu định kỳ và xuất dữ liệu bất cứ lúc nào.'],
      price: ['Bảng giá đơn giản, nâng cấp khi doanh nghiệp lớn lên', 'Bắt đầu miễn phí, chỉ trả thêm khi bạn cần thêm người dùng hoặc tính năng.'],
      process: ['Bắt đầu sử dụng chỉ trong ba bước', 'Tạo tài khoản, nhập dữ liệu và mời đồng đội — không cần cài đặt phức tạp.'],
      proof: ['Xem phần mềm hoạt động như thế nào', 'Giao diện trực quan giúp nhóm của bạn làm quen nhanh chóng.'],
    },
    benefits: {
      h: 'Những gì bạn nhận được',
      s: 'Thiết kế cho đội ngũ nhỏ và vừa muốn làm việc gọn hơn.',
      items: [
        ['Mọi thông tin ở một nơi', 'Khách hàng, lịch sử trao đổi và công việc được lưu cùng nhau, ai cũng tìm thấy.'],
        ['Tiết kiệm thao tác lặp lại', 'Tự động hóa nhắc việc, gửi tin và cập nhật trạng thái.'],
        ['Báo cáo dễ đọc', 'Nắm tình hình kinh doanh qua biểu đồ thay vì tổng hợp thủ công.'],
        ['Dễ dùng với cả nhóm', 'Giao diện tiếng Việt, không cần đào tạo dài.'],
      ],
    },
    features: {
      h: 'Tính năng chính',
      s: 'Đủ dùng cho công việc hằng ngày, không rườm rà.',
      items: [
        ['Quản lý khách hàng', 'Lưu thông tin, phân loại và theo dõi quá trình chăm sóc.'],
        ['Tự động hóa quy trình', 'Thiết lập kịch bản gửi tin, nhắc việc và chuyển giai đoạn.'],
        ['Báo cáo trực quan', 'Theo dõi doanh số, nguồn khách và hiệu suất từng nhân viên.'],
        ['Phân quyền & bảo mật', 'Cấp quyền theo vai trò, lưu nhật ký thao tác.'],
      ],
    },
    process: {
      h: 'Bắt đầu như thế nào',
      s: 'Ba bước để chạy thử trên dữ liệu thật của bạn.',
      items: [
        ['Tạo tài khoản', 'Đăng ký bằng email, không cần thẻ.'],
        ['Nhập dữ liệu', 'Tải lên danh sách khách hàng từ file có sẵn hoặc thêm thủ công.'],
        ['Mời đồng đội', 'Phân quyền và bắt đầu làm việc cùng nhau.'],
      ],
    },
    gallery: {
      h: 'Giao diện làm việc',
      s: 'Màn hình quen thuộc, dễ thao tác trên cả máy tính và điện thoại.',
      items: [
        ['Bảng điều khiển tổng quan', 'Nắm nhanh tình hình trong ngày.'],
        ['Báo cáo theo thời gian', 'So sánh kết quả giữa các giai đoạn.'],
        ['Không gian làm việc nhóm', 'Phân việc và theo dõi tiến độ cùng nhau.'],
      ],
    },
    pricing: {
      h: 'Bảng giá',
      s: 'Giá tham khảo — bạn có thể bắt đầu miễn phí và nâng cấp sau.',
      plans: [
        { name: 'Cơ bản', price: '0đ', period: '/tháng', features: ['Tối đa 2 người dùng', 'Quản lý khách hàng', 'Báo cáo cơ bản'], cta: 'Bắt đầu miễn phí' },
        { name: 'Nhóm', price: '299.000đ', period: '/người/tháng', features: ['Không giới hạn khách hàng', 'Tự động hóa', 'Báo cáo nâng cao'], highlighted: true, cta: 'Dùng thử 14 ngày' },
        { name: 'Doanh nghiệp', price: 'Liên hệ', features: ['Phân quyền nâng cao', 'Hỗ trợ triển khai', 'Tích hợp theo yêu cầu'], cta: 'Liên hệ tư vấn' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Dùng thử có mất phí không?', 'Không. Bạn dùng thử miễn phí và không cần nhập thẻ.'],
        ['Dữ liệu của tôi có an toàn không?', 'Dữ liệu được mã hóa khi truyền tải, sao lưu định kỳ và bạn có thể xuất ra bất cứ lúc nào.'],
        ['Tôi có thể chuyển dữ liệu từ bảng tính sang không?', 'Có. Bạn có thể nhập từ file Excel hoặc CSV chỉ với vài thao tác.'],
        ['Có hỗ trợ khi tôi gặp khó khăn không?', 'Có. Đội hỗ trợ trả lời qua chat và email trong giờ làm việc.'],
      ],
    },
    guarantee: ['Dùng thử trước, quyết định sau', 'Bạn có thể xuất toàn bộ dữ liệu và ngừng sử dụng bất cứ lúc nào, không bị ràng buộc.'],
    cta: { h: 'Thử trên dữ liệu của chính bạn', b: 'Tạo tài khoản miễn phí và xem phần mềm có phù hợp với cách làm việc của nhóm không.', label: 'Dùng thử miễn phí' },
    form: {
      h: 'Đăng ký dùng thử',
      s: 'Điền thông tin để nhận tài khoản dùng thử.',
      submit: 'Tạo tài khoản dùng thử',
      success: 'Đã nhận đăng ký! Chúng tôi sẽ gửi hướng dẫn truy cập qua email.',
      footer: 'Không cần thẻ tín dụng. Bạn có thể ngừng bất cứ lúc nào.',
      fields: [F.NAME, { ...F.EMAIL_REQ, label: 'Email công việc', placeholder: 'ban@congty.com' }, F.text('company', 'Tên công ty (không bắt buộc)', 'Tên công ty'), F.text('need', 'Bạn muốn quản lý điều gì?', 'VD: khách hàng, đơn hàng, công việc nhóm')],
    },
    footer: 'Nền tảng Vận hành — công cụ quản lý khách hàng và công việc cho doanh nghiệp vừa và nhỏ.',
  },

  seo: {
    brand: 'Dịch vụ SEO Website',
    nav: ['Dịch vụ', 'Quy trình', 'Gói SEO', 'Nhận tư vấn'],
    noun: 'dịch vụ SEO',
    verb: 'đăng ký audit',
    heroAlt: 'Biểu đồ phân tích lượng truy cập website trên màn hình',
    description:
      'Trang dịch vụ SEO: kiểm tra website, lộ trình tối ưu theo từ khóa, báo cáo minh bạch và đăng ký audit.',
    hero: {
      h: 'Giúp website của bạn xuất hiện khi khách hàng tìm kiếm',
      s: 'Chúng tôi kiểm tra website, xây lộ trình từ khóa và nội dung phù hợp ngành của bạn, báo cáo thứ hạng theo từng tháng.',
      cta: 'Nhận audit website',
      trust: ['Phân tích theo từ khóa của bạn', 'Báo cáo hàng tháng', 'Không cam kết thứ hạng ảo'],
    },
    angles: {
      trust: ['SEO làm đúng cách, không đi đường tắt', 'Chúng tôi chỉ dùng phương pháp bền vững, giải thích rõ từng thay đổi trên website của bạn.'],
      price: ['Chọn gói SEO phù hợp với quy mô website', 'Phạm vi công việc, số từ khóa và nội dung được ghi rõ trong từng gói.'],
      process: ['Lộ trình SEO từ kiểm tra đến tăng trưởng', 'Mỗi giai đoạn có mục tiêu và đầu việc cụ thể để bạn theo dõi.'],
      proof: ['Những hạng mục chúng tôi thường tối ưu', 'Từ kỹ thuật website đến nội dung và liên kết, mỗi phần đều được báo cáo.'],
    },
    benefits: {
      h: 'Lợi ích khi làm SEO cùng chúng tôi',
      s: 'Tập trung vào khách hàng thực sự tìm kiếm sản phẩm của bạn.',
      items: [
        ['Khách tìm đến bạn chủ động', 'Xuất hiện đúng lúc khách đang cần, không phải trả tiền cho từng lượt nhấp.'],
        ['Tối ưu theo từ khóa thực tế', 'Chọn từ khóa dựa trên nhu cầu tìm kiếm và khả năng cạnh tranh của ngành.'],
        ['Báo cáo minh bạch', 'Bạn xem được những gì đã thay đổi và tác động đến thứ hạng.'],
        ['Hiệu quả lâu dài', 'Nội dung và nền tảng kỹ thuật tốt tiếp tục mang lại khách sau khi hoàn thành.'],
      ],
    },
    features: {
      h: 'Chúng tôi làm gì cho website của bạn',
      s: 'Bốn nhóm công việc chính trong mọi gói SEO.',
      items: [
        ['Kiểm tra kỹ thuật', 'Tốc độ tải, cấu trúc trang, lỗi lập chỉ mục và hiển thị trên di động.'],
        ['Nghiên cứu từ khóa', 'Xác định nhóm từ khóa mang lại khách hàng tiềm năng.'],
        ['Nội dung chuẩn SEO', 'Lên kế hoạch và tối ưu bài viết, trang dịch vụ, trang sản phẩm.'],
        ['Xây dựng uy tín', 'Liên kết và thương hiệu cùng hỗ trợ thứ hạng.'],
      ],
    },
    process: {
      h: 'Lộ trình thực hiện',
      s: 'Mỗi giai đoạn có kết quả bàn giao rõ ràng.',
      items: [
        ['Kiểm tra website', 'Rà soát kỹ thuật và nội dung hiện tại, chỉ ra những điểm cần sửa.'],
        ['Lập kế hoạch từ khóa', 'Chọn nhóm từ khóa ưu tiên và cấu trúc lại trang.'],
        ['Tối ưu & sản xuất nội dung', 'Cập nhật trang hiện có và xây thêm nội dung mới.'],
        ['Theo dõi & báo cáo', 'Cập nhật thứ hạng, lượng truy cập và đề xuất bước tiếp theo.'],
      ],
    },
    gallery: {
      h: 'Báo cáo bạn sẽ nhận',
      s: 'Dữ liệu rõ ràng để bạn nắm được SEO đang tiến triển ra sao.',
      items: [
        ['Báo cáo thứ hạng từ khóa', 'Theo dõi vị trí từng từ khóa theo tháng.'],
        ['Phân tích lượng truy cập', 'Nguồn khách, trang được xem nhiều và hành vi.'],
        ['Danh sách việc cần làm', 'Các đầu việc ưu tiên theo mức tác động.'],
      ],
    },
    pricing: {
      h: 'Gói dịch vụ SEO',
      s: 'Giá tham khảo, được điều chỉnh sau khi kiểm tra website của bạn.',
      plans: [
        { name: 'Kiểm tra & tư vấn', price: 'Từ 3.000.000đ', features: ['Audit kỹ thuật toàn website', 'Báo cáo chi tiết', 'Danh sách việc ưu tiên'] },
        { name: 'SEO tăng trưởng', price: 'Từ 9.000.000đ', period: '/tháng', features: ['Tối ưu theo nhóm từ khóa', 'Nội dung hàng tháng', 'Báo cáo thứ hạng'], highlighted: true },
        { name: 'SEO toàn diện', price: 'Liên hệ', features: ['Nhiều nhóm từ khóa/dịch vụ', 'Đội chuyên trách', 'Họp định kỳ'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp về SEO',
      items: [
        ['Bao lâu thì website lên được trang đầu?', 'Tùy mức cạnh tranh của từ khóa và tình trạng website, thường cần từ 3–6 tháng. Chúng tôi không hứa thứ hạng cố định.'],
        ['Tôi có phải ngừng quảng cáo khi làm SEO không?', 'Không. SEO và quảng cáo bổ trợ cho nhau, bạn có thể giảm dần quảng cáo khi organic ổn định.'],
        ['Chi phí SEO được tính thế nào?', 'Dựa trên số nhóm từ khóa, tình trạng website và khối lượng nội dung cần xây dựng.'],
        ['Tôi có được xem những thay đổi trên website không?', 'Có. Mọi thay đổi được ghi lại trong báo cáo và bạn được duyệt trước khi áp dụng.'],
      ],
    },
    guarantee: ['Cam kết phương pháp minh bạch', 'Chúng tôi chỉ áp dụng kỹ thuật được khuyến nghị và báo cáo đầy đủ để bạn kiểm tra.'],
    cta: { h: 'Bạn muốn biết website đang gặp vấn đề gì?', b: 'Để lại địa chỉ website, chúng tôi gửi bản đánh giá ban đầu trong giờ làm việc.', label: 'Nhận audit website' },
    form: {
      h: 'Nhận đánh giá website miễn phí',
      s: 'Cho chúng tôi biết website và mục tiêu của bạn.',
      submit: 'Gửi yêu cầu audit',
      success: 'Cảm ơn bạn! Chúng tôi sẽ gửi đánh giá ban đầu qua email.',
      footer: 'Thông tin chỉ dùng để gửi bản đánh giá.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.text('website', 'Địa chỉ website', 'https://tenmien.vn', true), F.text('keywords', 'Từ khóa muốn lên top (nếu có)', 'VD: thiết kế nội thất Hà Nội')],
    },
    footer: 'Dịch vụ SEO Website — kiểm tra, tối ưu và báo cáo minh bạch cho website doanh nghiệp.',
  },

  website: {
    brand: 'Xưởng Thiết Kế Web',
    nav: ['Mẫu website', 'Quy trình', 'Gói thiết kế', 'Báo giá'],
    noun: 'dịch vụ thiết kế website',
    verb: 'nhận báo giá',
    heroAlt: 'Giao diện website đang được thiết kế trên máy tính xách tay',
    description:
      'Trang dịch vụ thiết kế website: mẫu giao diện, quy trình làm việc, gói thiết kế và biểu mẫu nhận báo giá.',
    hero: {
      h: 'Website đẹp, tải nhanh và sẵn sàng nhận khách hàng',
      s: 'Chúng tôi thiết kế website bán hàng và giới thiệu doanh nghiệp, chuẩn di động, có sẵn biểu mẫu thu khách hàng tiềm năng.',
      cta: 'Nhận báo giá thiết kế',
      trust: ['Giao diện hiển thị tốt trên điện thoại', 'Bàn giao trang quản trị dễ dùng', 'Hỗ trợ sau bàn giao'],
    },
    angles: {
      trust: ['Website được làm để bán hàng, không chỉ để trưng bày', 'Mỗi trang đều có mục tiêu chuyển đổi rõ ràng và được kiểm thử trên nhiều thiết bị.'],
      price: ['Chọn gói thiết kế phù hợp với ngân sách', 'Từ trang giới thiệu gọn nhẹ đến website bán hàng đầy đủ — phạm vi ghi rõ trong từng gói.'],
      process: ['Từ ý tưởng đến website chạy thật', 'Bốn bước làm việc rõ ràng, bạn duyệt trước mỗi giai đoạn.'],
      proof: ['Một số giao diện chúng tôi đã thiết kế', 'Mỗi ngành có cách trình bày riêng, nhưng đều hướng đến trải nghiệm dễ mua, dễ liên hệ.'],
    },
    benefits: {
      h: 'Điều bạn nhận được khi làm website cùng chúng tôi',
      s: 'Từ giao diện đến công cụ để bạn tự quản lý nội dung.',
      items: [
        ['Giao diện riêng cho doanh nghiệp', 'Thiết kế theo nhận diện thương hiệu, không dùng lại một khuôn mẫu cho mọi khách.'],
        ['Chuẩn di động và tốc độ', 'Tối ưu hình ảnh và mã nguồn để trang tải nhanh trên điện thoại.'],
        ['Tự cập nhật nội dung', 'Trang quản trị đơn giản để bạn tự sửa bài viết, sản phẩm.'],
        ['Sẵn sàng thu khách hàng', 'Biểu mẫu và nút liên hệ được đặt đúng vị trí.'],
      ],
    },
    features: {
      h: 'Gói thiết kế bao gồm',
      s: 'Những hạng mục chính trong mọi dự án.',
      items: [
        ['Thiết kế giao diện', 'Bố cục, màu sắc và hình ảnh phù hợp thương hiệu.'],
        ['Lập trình & tích hợp', 'Biểu mẫu, bản đồ, mạng xã hội và công cụ theo dõi.'],
        ['Nội dung cơ bản', 'Hỗ trợ sắp xếp và chỉnh sửa nội dung các trang chính.'],
        ['Hướng dẫn sử dụng', 'Bàn giao tài liệu và hướng dẫn cách cập nhật website.'],
      ],
    },
    process: {
      h: 'Quy trình thiết kế',
      s: 'Bạn xem và duyệt sau mỗi giai đoạn.',
      items: [
        ['Trao đổi yêu cầu', 'Tìm hiểu doanh nghiệp, khách hàng và các trang cần có.'],
        ['Thiết kế bản mẫu', 'Gửi bản thiết kế để bạn góp ý trước khi lập trình.'],
        ['Xây dựng & kiểm thử', 'Lập trình, nhập nội dung và kiểm tra trên nhiều thiết bị.'],
        ['Bàn giao & hỗ trợ', 'Chạy chính thức, hướng dẫn quản trị và hỗ trợ sau bàn giao.'],
      ],
    },
    gallery: {
      h: 'Mẫu giao diện tham khảo',
      s: 'Một số hướng thiết kế phổ biến cho từng nhu cầu.',
      items: [
        ['Website giới thiệu doanh nghiệp', 'Trình bày dịch vụ, đội ngũ và thông tin liên hệ rõ ràng.'],
        ['Website bán hàng', 'Danh mục sản phẩm, giỏ hàng và thanh toán thuận tiện.'],
        ['Trang đích chạy quảng cáo', 'Một mục tiêu duy nhất, tối ưu cho chuyển đổi.'],
      ],
    },
    pricing: {
      h: 'Gói thiết kế website',
      s: 'Giá tham khảo, báo giá chính xác sau khi trao đổi yêu cầu.',
      plans: [
        { name: 'Trang đích', price: 'Từ 3.000.000đ', features: ['1 trang chuyển đổi', 'Biểu mẫu liên hệ', 'Chuẩn di động'] },
        { name: 'Website giới thiệu', price: 'Từ 8.000.000đ', features: ['5–8 trang nội dung', 'Trang quản trị', 'Tối ưu tốc độ'], highlighted: true },
        { name: 'Website bán hàng', price: 'Từ 15.000.000đ', features: ['Danh mục & giỏ hàng', 'Thanh toán trực tuyến', 'Báo cáo đơn hàng'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Thời gian hoàn thành website là bao lâu?', 'Trang đích khoảng 1–2 tuần, website nhiều trang khoảng 3–6 tuần tùy khối lượng nội dung.'],
        ['Tôi có tự sửa nội dung được không?', 'Có. Chúng tôi bàn giao trang quản trị và hướng dẫn bạn cách cập nhật.'],
        ['Chi phí đã bao gồm tên miền và hosting chưa?', 'Tùy gói. Chúng tôi ghi rõ từng khoản trong báo giá để bạn dễ so sánh.'],
        ['Sau bàn giao có được hỗ trợ không?', 'Có thời gian hỗ trợ sửa lỗi sau bàn giao, thời hạn được ghi trong báo giá.'],
      ],
    },
    guarantee: ['Báo giá rõ ràng từ đầu', 'Phạm vi công việc, thời gian và chi phí được thống nhất bằng văn bản trước khi bắt đầu.'],
    cta: { h: 'Bạn cần một website mới?', b: 'Gửi yêu cầu ngắn, chúng tôi phản hồi báo giá sơ bộ trong giờ làm việc.', label: 'Nhận báo giá thiết kế' },
    form: {
      h: 'Gửi yêu cầu thiết kế website',
      s: 'Mô tả ngắn về nhu cầu, chúng tôi sẽ liên hệ báo giá.',
      submit: 'Gửi yêu cầu báo giá',
      success: 'Cảm ơn bạn! Chúng tôi đã nhận yêu cầu và sẽ liên hệ sớm.',
      footer: 'Thông tin chỉ dùng để liên hệ báo giá.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.select('type', 'Loại website', ['Giới thiệu doanh nghiệp', 'Bán hàng', 'Trang đích quảng cáo', 'Khác']), F.note('Mô tả nhu cầu', 'Ngành nghề, số trang dự kiến, website tham khảo…', 'brief')],
    },
    footer: 'Xưởng Thiết Kế Web — thiết kế website chuẩn di động cho doanh nghiệp nhỏ và vừa.',
  },

  consulting: {
    brand: 'Tư Vấn Doanh Nghiệp',
    nav: ['Lĩnh vực', 'Cách làm việc', 'Gói tư vấn', 'Đặt lịch'],
    noun: 'dịch vụ tư vấn',
    verb: 'đặt lịch tư vấn',
    heroAlt: 'Chuyên gia tư vấn trình bày kế hoạch cho nhóm quản lý',
    description:
      'Trang dịch vụ tư vấn doanh nghiệp: lĩnh vực chuyên môn, cách làm việc, gói đồng hành và đặt lịch trao đổi.',
    hero: {
      h: 'Tư vấn chiến lược để ban lãnh đạo ra quyết định chắc chắn hơn',
      s: 'Chúng tôi làm việc cùng đội ngũ của bạn để làm rõ mục tiêu, tìm điểm nghẽn và xây kế hoạch hành động có thể thực hiện ngay.',
      cta: 'Đặt lịch trao đổi',
      trust: ['Buổi trao đổi đầu tiên không ràng buộc', 'Giữ bí mật thông tin', 'Kế hoạch hành động cụ thể'],
    },
    angles: {
      trust: ['Kinh nghiệm thực chiến, cách làm minh bạch', 'Mỗi đề xuất đều có cơ sở, phạm vi và tiêu chí đánh giá để ban lãnh đạo dễ thẩm định.'],
      price: ['Chọn hình thức đồng hành phù hợp', 'Từ buổi tư vấn đơn lẻ đến chương trình đồng hành theo quý — phạm vi và phí được thống nhất trước.'],
      process: ['Một cuộc tư vấn diễn ra như thế nào', 'Từ chẩn đoán, đề xuất đến triển khai — mỗi giai đoạn có sản phẩm bàn giao rõ ràng.'],
      proof: ['Những bài toán chúng tôi thường giải', 'Tăng trưởng doanh thu, tối ưu vận hành và xây dựng đội ngũ cho doanh nghiệp vừa và nhỏ.'],
    },
    benefits: {
      h: 'Giá trị bạn nhận được',
      s: 'Tập trung vào kết quả kinh doanh, không phải báo cáo dày.',
      items: [
        ['Nhìn rõ vấn đề gốc', 'Chẩn đoán dựa trên dữ liệu và phỏng vấn nội bộ, không chỉ xử lý triệu chứng.'],
        ['Kế hoạch có thể thực hiện', 'Mỗi đề xuất kèm người phụ trách, mốc thời gian và cách đo.'],
        ['Góc nhìn độc lập', 'Ý kiến khách quan từ bên ngoài giúp thống nhất nội bộ nhanh hơn.'],
        ['Đồng hành khi triển khai', 'Hỗ trợ đội ngũ áp dụng thay vì chỉ bàn giao tài liệu.'],
      ],
    },
    features: {
      h: 'Lĩnh vực tư vấn',
      s: 'Chọn một hoặc kết hợp nhiều lĩnh vực theo nhu cầu.',
      items: [
        ['Chiến lược kinh doanh', 'Xác định thị trường mục tiêu, mô hình doanh thu và ưu tiên đầu tư.'],
        ['Vận hành & quy trình', 'Chuẩn hóa quy trình, giảm lãng phí và rõ vai trò.'],
        ['Marketing & bán hàng', 'Xây phễu khách hàng, đo lường và tối ưu chuyển đổi.'],
        ['Tổ chức & nhân sự', 'Cơ cấu đội ngũ, mục tiêu và cách đánh giá hiệu quả.'],
      ],
    },
    process: {
      h: 'Cách chúng tôi làm việc',
      s: 'Bốn giai đoạn, mỗi giai đoạn có kết quả bàn giao.',
      items: [
        ['Trao đổi ban đầu', 'Hiểu bối cảnh, mục tiêu và giới hạn nguồn lực của doanh nghiệp.'],
        ['Chẩn đoán', 'Phân tích số liệu, phỏng vấn các bên liên quan và xác định vấn đề trọng tâm.'],
        ['Đề xuất & thống nhất', 'Trình bày phương án, ưu tiên và lộ trình để ban lãnh đạo chọn.'],
        ['Triển khai & rà soát', 'Đồng hành cùng đội ngũ và đánh giá kết quả theo mốc đã đặt.'],
      ],
    },
    gallery: {
      h: 'Các tình huống chúng tôi thường hỗ trợ',
      s: 'Mỗi doanh nghiệp một bối cảnh, nhưng cách tiếp cận đều bắt đầu từ lắng nghe.',
      items: [
        ['Xây kế hoạch tăng trưởng năm', 'Thống nhất mục tiêu và nguồn lực cho cả đội.'],
        ['Chuẩn hóa quy trình bán hàng', 'Từ tiếp nhận khách đến chốt đơn và chăm sóc.'],
        ['Họp chiến lược cùng ban lãnh đạo', 'Làm rõ ưu tiên và phân công trách nhiệm.'],
      ],
    },
    pricing: {
      h: 'Hình thức đồng hành',
      s: 'Phí được báo cụ thể sau buổi trao đổi đầu tiên.',
      plans: [
        { name: 'Buổi tư vấn chuyên sâu', price: 'Từ 5.000.000đ', features: ['Họp 2–3 giờ', 'Tóm tắt khuyến nghị', 'Giải đáp tiếp sau buổi họp'] },
        { name: 'Đồng hành theo quý', price: 'Từ 30.000.000đ', period: '/quý', features: ['Chẩn đoán & đề xuất', 'Họp rà soát hàng tháng', 'Hỗ trợ triển khai'], highlighted: true },
        { name: 'Dự án riêng', price: 'Liên hệ', features: ['Phạm vi theo yêu cầu', 'Đội ngũ chuyên trách', 'Báo cáo theo giai đoạn'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Buổi trao đổi đầu tiên có mất phí không?', 'Buổi trao đổi ban đầu giúp hai bên đánh giá mức độ phù hợp và không ràng buộc.'],
        ['Thông tin doanh nghiệp có được bảo mật không?', 'Có. Chúng tôi ký thỏa thuận bảo mật trước khi tiếp nhận dữ liệu nội bộ.'],
        ['Tư vấn kéo dài bao lâu?', 'Từ một buổi đến vài tháng, tùy mục tiêu. Thời gian cụ thể nằm trong đề xuất.'],
        ['Chúng tôi có phải thay đổi đội ngũ không?', 'Không nhất thiết. Mục tiêu là giúp đội ngũ hiện tại làm tốt hơn.'],
      ],
    },
    guarantee: ['Cam kết bảo mật và rõ ràng', 'Thông tin của doanh nghiệp được giữ kín; phạm vi và phí được thống nhất bằng văn bản.'],
    cta: { h: 'Trao đổi 30 phút về bài toán của bạn', b: 'Cho chúng tôi biết bối cảnh, chúng tôi sẽ đề xuất hướng làm việc phù hợp.', label: 'Đặt lịch trao đổi' },
    form: {
      h: 'Đặt lịch trao đổi',
      s: 'Chia sẻ ngắn gọn về bài toán, chúng tôi sẽ xác nhận lịch qua điện thoại.',
      submit: 'Gửi yêu cầu',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận lịch trao đổi.',
      footer: 'Thông tin được bảo mật và chỉ dùng cho mục đích liên hệ.',
      fields: [F.NAME, F.ZALO, F.EMAIL, F.text('company', 'Doanh nghiệp / chức danh', 'VD: Giám đốc, Công ty ABC'), F.note('Vấn đề bạn muốn trao đổi', 'Mô tả ngắn bối cảnh và mục tiêu', 'topic')],
    },
    footer: 'Tư Vấn Doanh Nghiệp — đồng hành cùng ban lãnh đạo từ chẩn đoán đến triển khai.',
  },
};
