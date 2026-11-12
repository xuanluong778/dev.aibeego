import { F, type CommercialPack } from './landing-page-commercial-types';

const SLOT = ['Sáng (8–11h)', 'Trưa (11–14h)', 'Chiều (14–17h)', 'Tối (17–20h)'];

/** Local & project businesses: real_estate, restaurant, service, quote, demo. */
export const COMMERCIAL_PACKS_D: Record<string, CommercialPack> = {
  real_estate: {
    brand: 'Dự án Nhà ở Xanh',
    nav: ['Tổng quan', 'Tiện ích', 'Chính sách', 'Đăng ký tham quan'],
    noun: 'dự án',
    verb: 'đăng ký tham quan',
    heroAlt: 'Nhà ở hiện đại có hồ bơi và sân vườn',
    description:
      'Trang giới thiệu dự án bất động sản: tổng quan, tiện ích, chính sách bán hàng và đăng ký tư vấn, tham quan nhà mẫu.',
    hero: {
      h: 'Không gian sống thoáng đãng, sẵn sàng cho gia đình bạn',
      s: 'Tìm hiểu vị trí, loại hình căn hộ, tiện ích và chính sách bán hàng. Đăng ký để được tư vấn và sắp xếp lịch tham quan nhà mẫu.',
      cta: 'Đăng ký tham quan',
      trust: ['Thông tin dự án minh bạch', 'Tư vấn không ràng buộc', 'Hỗ trợ đặt lịch xem nhà mẫu'],
    },
    angles: {
      trust: ['Thông tin dự án rõ ràng để bạn yên tâm quyết định', 'Tài liệu pháp lý, tiến độ và chính sách thanh toán được cung cấp đầy đủ khi tư vấn.'],
      price: ['Chính sách giá và phương án thanh toán rõ ràng', 'Tham khảo các phương án thanh toán và liên hệ để nhận bảng giá cập nhật.'],
      process: ['Từ tìm hiểu đến sở hữu căn nhà', 'Các bước tư vấn, tham quan, đặt chỗ và ký hợp đồng được hướng dẫn rõ ràng.'],
      proof: ['Không gian sống và tiện ích nội khu', 'Hình ảnh giúp bạn hình dung cuộc sống tại dự án.'],
    },
    benefits: {
      h: 'Điểm nổi bật của dự án',
      s: 'Những điều gia đình bạn quan tâm khi chọn nơi an cư.',
      items: [
        ['Vị trí thuận tiện', 'Kết nối dễ dàng đến trường học, bệnh viện và khu mua sắm.'],
        ['Không gian xanh', 'Cây xanh, sân vườn và khu vực thư giãn trong khuôn viên.'],
        ['Thiết kế hợp lý', 'Căn hộ nhiều ánh sáng, thông gió tự nhiên.'],
        ['Hỗ trợ tài chính', 'Tư vấn các phương án thanh toán phù hợp khả năng của bạn.'],
      ],
    },
    features: {
      h: 'Tiện ích và loại hình',
      s: 'Liên hệ để nhận mặt bằng chi tiết từng loại căn.',
      items: [
        ['Hồ bơi & khu thư giãn', 'Không gian thể thao và nghỉ ngơi trong khu dân cư.'],
        ['Khu vui chơi trẻ em', 'An toàn và gần gũi cho các gia đình có con nhỏ.'],
        ['An ninh 24/7', 'Hệ thống bảo vệ và kiểm soát ra vào.'],
        ['Chỗ đỗ xe', 'Bố trí chỗ đỗ xe cho cư dân và khách.'],
      ],
    },
    process: {
      h: 'Các bước tìm hiểu và sở hữu',
      s: 'Nhân viên tư vấn đồng hành ở từng bước.',
      items: [
        ['Đăng ký tư vấn', 'Để lại thông tin để nhận tài liệu và báo giá.'],
        ['Tham quan nhà mẫu', 'Xem thực tế căn hộ và tiện ích.'],
        ['Chọn căn & đặt chỗ', 'Chọn căn phù hợp và thỏa thuận phương án thanh toán.'],
        ['Ký hợp đồng', 'Hoàn tất thủ tục theo quy định.'],
      ],
    },
    gallery: {
      h: 'Hình ảnh dự án',
      s: 'Hình ảnh minh họa không gian sống tại dự án.',
      items: [
        ['Căn nhà mặt tiền', 'Thiết kế hiện đại, nhiều ánh sáng tự nhiên.'],
        ['Không gian sân vườn', 'Cây xanh và khoảng sân rộng rãi.'],
        ['Phòng khách', 'Bố trí thoáng và dễ trang trí.'],
        ['Kiến trúc hiện đại', 'Đường nét gọn gàng, vật liệu bền vững.'],
        ['Hồ bơi', 'Khu thư giãn dành cho cư dân.'],
        ['Khu nhà ở', 'Không gian sống yên tĩnh, an toàn.'],
      ],
    },
    pricing: {
      h: 'Phương án thanh toán',
      s: 'Thông tin tham khảo; vui lòng liên hệ để nhận bảng giá chính thức.',
      plans: [
        { name: 'Thanh toán theo tiến độ', price: 'Liên hệ', features: ['Chia thành nhiều đợt', 'Phù hợp dòng tiền hàng tháng'] },
        { name: 'Vay hỗ trợ ngân hàng', price: 'Liên hệ', features: ['Tư vấn hồ sơ vay', 'Ngân hàng đối tác'], highlighted: true },
        { name: 'Thanh toán sớm', price: 'Liên hệ', features: ['Ưu đãi theo chính sách từng đợt', 'Tư vấn chi tiết'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Pháp lý của dự án như thế nào?', 'Tài liệu pháp lý sẽ được cung cấp đầy đủ khi bạn đăng ký tư vấn để bạn có thể tự kiểm tra.'],
        ['Tôi có thể xem nhà mẫu khi nào?', 'Bạn đặt lịch qua biểu mẫu, nhân viên sẽ xác nhận khung giờ phù hợp.'],
        ['Có hỗ trợ vay ngân hàng không?', 'Có, chúng tôi tư vấn các phương án vay và hồ sơ cần chuẩn bị.'],
        ['Tiến độ bàn giao dự kiến?', 'Tiến độ được thông báo cụ thể trong hợp đồng và tài liệu dự án.'],
      ],
    },
    guarantee: ['Thông tin minh bạch', 'Mọi thông tin về dự án, giá và chính sách được cung cấp bằng văn bản khi bạn yêu cầu.'],
    cta: { h: 'Xem tận nơi để cảm nhận không gian sống', b: 'Đăng ký tham quan, nhân viên sẽ sắp xếp lịch phù hợp với bạn.', label: 'Đăng ký tham quan' },
    form: {
      h: 'Đăng ký tư vấn & tham quan',
      s: 'Nhân viên sẽ liên hệ gửi tài liệu và sắp xếp lịch.',
      submit: 'Gửi đăng ký',
      success: 'Cảm ơn bạn! Nhân viên tư vấn sẽ liên hệ sớm.',
      footer: 'Thông tin chỉ dùng để tư vấn dự án.',
      fields: [F.NAME, F.PHONE, F.EMAIL, F.select('type', 'Loại hình quan tâm', ['Căn hộ', 'Nhà phố', 'Biệt thự', 'Chưa xác định']), F.select('budget', 'Ngân sách dự kiến', ['Dưới 2 tỷ', '2–4 tỷ', '4–8 tỷ', 'Trên 8 tỷ'])],
    },
    footer: 'Dự án Nhà ở Xanh — thông tin tham khảo; vui lòng liên hệ để nhận tài liệu chính thức.',
  },

  restaurant: {
    brand: 'Nhà hàng Hương Quê',
    nav: ['Thực đơn', 'Không gian', 'Ưu đãi', 'Đặt bàn'],
    noun: 'nhà hàng',
    verb: 'đặt bàn',
    heroAlt: 'Không gian nhà hàng ấm cúng với bàn ghế gỗ',
    description:
      'Trang giới thiệu nhà hàng: món nổi bật, không gian, ưu đãi và đặt bàn trực tuyến.',
    hero: {
      h: 'Bữa ăn ngon bên người thân, trong không gian ấm cúng',
      s: 'Món ăn chế biến từ nguyên liệu tươi mỗi ngày, phục vụ tận tình. Đặt bàn trước để giữ chỗ đẹp cho cả nhóm.',
      cta: 'Đặt bàn ngay',
      trust: ['Nguyên liệu tươi mỗi ngày', 'Phục vụ nhóm và gia đình', 'Giữ bàn theo giờ bạn chọn'],
    },
    angles: {
      trust: ['Bếp mở, nguyên liệu rõ nguồn', 'Món ăn được chế biến theo ngày, thực đơn thay đổi theo mùa để giữ độ tươi.'],
      price: ['Set menu cho nhóm, dễ chọn và tiết kiệm', 'Mỗi set được ghi rõ món và số người để bạn dễ cân đối chi phí.'],
      process: ['Đặt bàn chỉ trong ba bước', 'Chọn thời gian, số người và chúng tôi giữ bàn cho bạn.'],
      proof: ['Món ăn và không gian của nhà hàng', 'Hình ảnh thật giúp bạn hình dung buổi ăn của mình.'],
    },
    benefits: {
      h: 'Vì sao bạn sẽ muốn quay lại',
      s: 'Từ món ăn đến cách phục vụ đều được chăm chút.',
      items: [
        ['Món ăn đậm vị', 'Công thức giữ hương vị quen thuộc, nêm nếm vừa miệng.'],
        ['Không gian ấm cúng', 'Phù hợp cho bữa cơm gia đình và gặp gỡ bạn bè.'],
        ['Phục vụ nhanh', 'Nhân viên chu đáo, lên món đúng thứ tự.'],
        ['Đặt bàn dễ dàng', 'Giữ chỗ trước, không phải chờ khi đông khách.'],
      ],
    },
    features: {
      h: 'Món nổi bật',
      s: 'Những món được gọi nhiều nhất tại nhà hàng.',
      items: [
        ['Món khai vị', 'Nhẹ nhàng để bắt đầu bữa ăn.'],
        ['Món chính', 'Đậm đà, phù hợp ăn cùng cơm hoặc bún.'],
        ['Món lẩu & nướng', 'Dành cho nhóm bạn và gia đình.'],
        ['Tráng miệng & đồ uống', 'Kết thúc bữa ăn trọn vẹn.'],
      ],
    },
    process: {
      h: 'Cách đặt bàn',
      s: 'Nhân viên sẽ gọi xác nhận trong giờ mở cửa.',
      items: [
        ['Chọn thời gian', 'Cho chúng tôi biết ngày, giờ và số người.'],
        ['Xác nhận', 'Nhân viên liên hệ xác nhận và ghi chú yêu cầu đặc biệt.'],
        ['Đến nhà hàng', 'Bàn đã được giữ sẵn cho bạn.'],
      ],
    },
    gallery: {
      h: 'Không gian & món ăn',
      s: 'Một vài hình ảnh tại nhà hàng.',
      items: [
        ['Khu vực chính', 'Bàn ghế gỗ, ánh sáng ấm.'],
        ['Món ăn bày biện', 'Trình bày gọn gàng, dễ chia sẻ.'],
        ['Khu vực thoáng', 'Phù hợp nhóm đông và dịp sinh nhật.'],
      ],
    },
    pricing: {
      h: 'Set menu gợi ý',
      s: 'Giá tham khảo, có thể thay đổi theo mùa.',
      plans: [
        { name: 'Set 2 người', price: '399.000đ', features: ['3 món chính', '1 món khai vị', '2 đồ uống'], cta: 'Đặt set 2 người' },
        { name: 'Set gia đình 4 người', price: '799.000đ', features: ['5 món chính', '2 món khai vị', 'Tráng miệng'], highlighted: true, cta: 'Đặt set gia đình' },
        { name: 'Set nhóm 8 người', price: '1.499.000đ', features: ['8 món', 'Lẩu hoặc nướng', 'Đồ uống'], cta: 'Đặt set nhóm' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi cần đặt bàn trước bao lâu?', 'Nên đặt trước ít nhất vài giờ, cuối tuần và ngày lễ nên đặt sớm hơn.'],
        ['Nhà hàng có phòng riêng không?', 'Có khu vực dành cho nhóm, vui lòng ghi chú khi đặt bàn để được sắp xếp.'],
        ['Có thể hủy hoặc đổi giờ không?', 'Có, bạn vui lòng báo trước để nhà hàng giữ bàn cho khách khác.'],
        ['Có món cho người ăn chay không?', 'Có một số món chay, bạn có thể ghi chú khi đặt bàn.'],
      ],
    },
    guarantee: ['Cam kết bữa ăn', 'Nếu có vấn đề với món ăn hoặc cách phục vụ, hãy báo ngay để nhà hàng điều chỉnh.'],
    cta: { h: 'Giữ bàn cho bữa ăn sắp tới', b: 'Cho chúng tôi biết thời gian và số người, chúng tôi sẽ lo phần còn lại.', label: 'Đặt bàn ngay' },
    form: {
      h: 'Đặt bàn',
      s: 'Nhân viên sẽ gọi xác nhận trong giờ mở cửa.',
      submit: 'Giữ bàn cho tôi',
      success: 'Cảm ơn bạn! Nhà hàng sẽ liên hệ xác nhận bàn.',
      footer: 'Thông tin chỉ dùng để xác nhận đặt bàn.',
      fields: [F.NAME, F.PHONE, F.text('date', 'Ngày đến', 'VD: Tối thứ Bảy', true), F.select('time', 'Giờ đến', ['11:00–13:00', '17:00–19:00', '19:00–21:00'], true), F.select('guests', 'Số người', ['1–2', '3–4', '5–8', 'Trên 8'], true), F.note('Ghi chú (sinh nhật, ăn chay…)', 'Yêu cầu đặc biệt nếu có', 'note')],
    },
    footer: 'Nhà hàng Hương Quê — món ngon từ nguyên liệu tươi. Liên hệ để đặt bàn.',
  },

  service: {
    brand: 'Dịch vụ Sửa chữa Tại Nhà',
    nav: ['Dịch vụ', 'Cách làm việc', 'Khu vực', 'Đặt lịch'],
    noun: 'dịch vụ',
    verb: 'đặt lịch',
    heroAlt: 'Thợ kỹ thuật đang kiểm tra công trình',
    description:
      'Trang dịch vụ tại nhà: danh mục dịch vụ, quy trình làm việc, khu vực phục vụ và đặt lịch.',
    hero: {
      h: 'Dịch vụ tại nhà: đến đúng giờ, báo giá trước và làm việc gọn gàng',
      s: 'Đội ngũ kỹ thuật kiểm tra, báo giá rõ ràng trước khi thực hiện, dọn dẹp sau khi hoàn thành.',
      cta: 'Đặt lịch ngay',
      trust: ['Báo giá trước khi làm', 'Kỹ thuật viên có tay nghề', 'Bảo hành công việc'],
    },
    angles: {
      trust: ['Làm đúng hẹn, báo giá rõ và có bảo hành', 'Mọi hạng mục được thống nhất trước; chúng tôi không phát sinh khi chưa được bạn đồng ý.'],
      price: ['Chọn gói dịch vụ phù hợp nhu cầu', 'Giá từng hạng mục được công bố để bạn dễ so sánh.'],
      process: ['Từ lúc gọi đến khi hoàn thành', 'Mỗi bước đều có thông báo để bạn chủ động theo dõi.'],
      proof: ['Hình ảnh công việc thực tế', 'Cách chúng tôi kiểm tra, xử lý và hoàn thiện công việc.'],
    },
    benefits: {
      h: 'Vì sao khách hàng chọn chúng tôi',
      s: 'Làm nhanh, sạch sẽ và minh bạch.',
      items: [
        ['Đúng giờ hẹn', 'Báo trước khi đến và gọi nếu có thay đổi.'],
        ['Báo giá trước', 'Bạn biết chi phí trước khi thợ bắt đầu làm việc.'],
        ['Làm việc gọn gàng', 'Che chắn và vệ sinh sau khi hoàn thành.'],
        ['Có bảo hành', 'Hỗ trợ xử lý lại nếu có lỗi trong thời gian bảo hành.'],
      ],
    },
    features: {
      h: 'Dịch vụ phổ biến',
      s: 'Liên hệ nếu bạn cần dịch vụ khác.',
      items: [
        ['Sửa chữa điện nước', 'Khắc phục sự cố điện, nước trong nhà.'],
        ['Vệ sinh nhà cửa', 'Làm sạch định kỳ hoặc sau sửa chữa.'],
        ['Cải tạo nhỏ', 'Sơn sửa, thay thiết bị, chống thấm.'],
        ['Bảo trì định kỳ', 'Kiểm tra thiết bị để phòng ngừa hỏng hóc.'],
      ],
    },
    process: {
      h: 'Cách chúng tôi làm việc',
      s: 'Bốn bước rõ ràng.',
      items: [
        ['Tiếp nhận yêu cầu', 'Mô tả vấn đề qua điện thoại hoặc biểu mẫu.'],
        ['Khảo sát & báo giá', 'Kỹ thuật viên kiểm tra và báo giá trước khi làm.'],
        ['Thực hiện', 'Làm việc theo phạm vi đã thống nhất.'],
        ['Nghiệm thu & bảo hành', 'Bạn kiểm tra kết quả và nhận phiếu bảo hành.'],
      ],
    },
    gallery: {
      h: 'Công việc thực tế',
      s: 'Một số hạng mục chúng tôi thường thực hiện.',
      items: [
        ['Thi công công trình', 'Làm việc theo bản vẽ và tiến độ.'],
        ['Khảo sát bản vẽ', 'Đo đạc và lên phương án trước khi làm.'],
        ['Xử lý kỹ thuật', 'Hàn, cắt, gia công theo yêu cầu.'],
        ['Vệ sinh sau thi công', 'Làm sạch và hoàn thiện.'],
        ['Kiểm tra thiết bị', 'Đảm bảo vận hành ổn định.'],
        ['Hoàn thiện & bàn giao', 'Nghiệm thu cùng chủ nhà.'],
      ],
    },
    pricing: {
      h: 'Giá tham khảo',
      s: 'Giá cuối cùng được báo sau khi khảo sát.',
      plans: [
        { name: 'Khảo sát & kiểm tra', price: 'Từ 150.000đ', features: ['Kiểm tra vấn đề', 'Báo giá chi tiết'] },
        { name: 'Sửa chữa nhỏ', price: 'Từ 300.000đ', features: ['Công thợ', 'Bảo hành công việc'], highlighted: true },
        { name: 'Hạng mục lớn', price: 'Liên hệ', features: ['Khảo sát tại chỗ', 'Báo giá theo phạm vi'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Phí khảo sát có tính vào chi phí không?', 'Nếu bạn đồng ý thực hiện, phí khảo sát được trừ vào chi phí công việc.'],
        ['Bao lâu thì có người đến?', 'Chúng tôi xác nhận khung giờ khi nhận yêu cầu, thường trong ngày hoặc hôm sau.'],
        ['Có bảo hành không?', 'Có, thời gian bảo hành tùy hạng mục và được ghi rõ khi báo giá.'],
        ['Chi phí có phát sinh không?', 'Chỉ phát sinh khi bạn đồng ý sau khi được thông báo.'],
      ],
    },
    guarantee: ['Cam kết dịch vụ', 'Báo giá trước, làm đúng phạm vi và bảo hành công việc theo thỏa thuận.'],
    cta: { h: 'Cần xử lý vấn đề trong nhà?', b: 'Đặt lịch, kỹ thuật viên sẽ liên hệ xác nhận giờ đến.', label: 'Đặt lịch ngay' },
    form: {
      h: 'Đặt lịch dịch vụ',
      s: 'Mô tả vấn đề, chúng tôi gọi lại để xác nhận.',
      submit: 'Gửi yêu cầu',
      success: 'Cảm ơn bạn! Chúng tôi sẽ gọi xác nhận lịch sớm.',
      footer: 'Thông tin chỉ dùng để liên hệ dịch vụ.',
      fields: [F.NAME, F.PHONE, F.text('address', 'Địa chỉ', 'Số nhà, đường, quận/huyện', true), F.select('slot', 'Khung giờ mong muốn', SLOT), F.note('Mô tả vấn đề', 'VD: Vòi nước bị rò rỉ ở bếp', 'issue')],
    },
    footer: 'Dịch vụ Sửa chữa Tại Nhà — báo giá rõ ràng, làm việc gọn gàng.',
  },

  quote: {
    brand: 'Báo giá Công trình',
    nav: ['Hạng mục', 'Quy trình báo giá', 'Câu hỏi', 'Gửi yêu cầu'],
    noun: 'báo giá',
    verb: 'gửi yêu cầu báo giá',
    heroAlt: 'Bản vẽ và máy tính trên bàn làm việc của kỹ sư',
    description:
      'Trang nhận yêu cầu báo giá: hạng mục thực hiện, quy trình báo giá và biểu mẫu gửi yêu cầu.',
    hero: {
      h: 'Gửi yêu cầu, nhận báo giá chi tiết cho công trình của bạn',
      s: 'Mô tả hạng mục và khu vực thi công, chúng tôi khảo sát, đề xuất phương án và báo giá rõ từng khoản.',
      cta: 'Gửi yêu cầu báo giá',
      trust: ['Khảo sát trước khi báo giá', 'Báo giá chi tiết từng hạng mục', 'Không phát sinh khi chưa đồng ý'],
    },
    angles: {
      trust: ['Báo giá chi tiết, dễ so sánh', 'Từng khoản được ghi rõ vật tư, nhân công và thời gian để bạn dễ cân nhắc.'],
      price: ['Các mức đầu tư theo quy mô công trình', 'Tham khảo mức giá theo từng loại hạng mục trước khi gửi yêu cầu.'],
      process: ['Quy trình từ yêu cầu đến báo giá', 'Bốn bước rõ ràng để bạn biết khi nào nhận báo giá.'],
      proof: ['Hạng mục chúng tôi thường thực hiện', 'Một số loại công việc phổ biến mà chúng tôi nhận báo giá.'],
    },
    benefits: {
      h: 'Điều bạn nhận được khi gửi yêu cầu',
      s: 'Nhanh, rõ ràng và không ràng buộc.',
      items: [
        ['Khảo sát thực tế', 'Đo đạc và xem hiện trạng trước khi báo giá.'],
        ['Báo giá minh bạch', 'Ghi rõ vật tư, nhân công và thời gian thực hiện.'],
        ['Có phương án lựa chọn', 'Đề xuất nhiều mức vật tư để bạn chọn phù hợp ngân sách.'],
        ['Không ràng buộc', 'Báo giá không bắt buộc bạn phải thực hiện.'],
      ],
    },
    features: {
      h: 'Hạng mục nhận báo giá',
      s: 'Liên hệ nếu hạng mục của bạn không có trong danh sách.',
      items: [
        ['Thi công xây dựng', 'Xây mới, cải tạo, mở rộng.'],
        ['Hoàn thiện nội thất', 'Sơn, ốp lát, trần, sàn.'],
        ['Hệ thống điện nước', 'Lắp đặt, thay mới và sửa chữa.'],
        ['Gia công cơ khí', 'Khung, cửa, lan can theo kích thước.'],
      ],
    },
    process: {
      h: 'Quy trình báo giá',
      s: 'Thời gian phản hồi cụ thể được thông báo khi xác nhận yêu cầu.',
      items: [
        ['Gửi yêu cầu', 'Điền hạng mục, địa điểm và mô tả công việc.'],
        ['Liên hệ xác nhận', 'Nhân viên gọi lại để hỏi thêm chi tiết.'],
        ['Khảo sát', 'Đến xem hiện trạng và đo đạc.'],
        ['Gửi báo giá', 'Nhận báo giá chi tiết để bạn xem xét.'],
      ],
    },
    gallery: {
      h: 'Công việc thường nhận',
      s: 'Một số hạng mục tiêu biểu.',
      items: [
        ['Lập kế hoạch công việc', 'Thống nhất phạm vi và tiến độ.'],
        ['Công trình đang thi công', 'Quản lý hiện trường và an toàn.'],
        ['Bản vẽ & thiết kế', 'Đo đạc, vẽ và tính khối lượng.'],
        ['Gia công kỹ thuật', 'Cắt, hàn, lắp theo bản vẽ.'],
        ['Vệ sinh & hoàn thiện', 'Làm sạch và bàn giao.'],
        ['Kiểm tra cuối cùng', 'Nghiệm thu cùng khách hàng.'],
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Gửi yêu cầu báo giá có mất phí không?', 'Không. Báo giá sơ bộ miễn phí; khảo sát chi tiết có thể được thông báo phí trước nếu cần.'],
        ['Bao lâu thì tôi nhận được báo giá?', 'Sau khi khảo sát, thường trong vài ngày làm việc tùy quy mô công trình.'],
        ['Báo giá có thay đổi sau đó không?', 'Chỉ thay đổi khi bạn yêu cầu điều chỉnh phạm vi, và chúng tôi sẽ báo trước.'],
        ['Tôi có thể yêu cầu nhiều phương án không?', 'Có, chúng tôi đề xuất các mức vật tư khác nhau để bạn lựa chọn.'],
      ],
    },
    guarantee: ['Báo giá không ràng buộc', 'Bạn nhận báo giá chi tiết để cân nhắc, không bắt buộc phải ký hợp đồng.'],
    cta: { h: 'Nhận báo giá cho công trình của bạn', b: 'Điền thông tin, nhân viên sẽ liên hệ trao đổi và khảo sát.', label: 'Gửi yêu cầu báo giá' },
    form: {
      h: 'Gửi yêu cầu báo giá',
      s: 'Mô tả ngắn công việc, chúng tôi sẽ liên hệ lại.',
      submit: 'Gửi yêu cầu',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ để trao đổi và báo giá.',
      footer: 'Thông tin chỉ dùng để liên hệ báo giá.',
      fields: [F.NAME, F.PHONE, F.select('type', 'Hạng mục cần báo giá', ['Thi công xây dựng', 'Hoàn thiện nội thất', 'Điện nước', 'Gia công cơ khí', 'Khác'], true), F.text('area', 'Địa điểm', 'Quận/huyện, tỉnh/thành', true), F.note('Mô tả công việc', 'Diện tích, yêu cầu, thời gian mong muốn…', 'brief')],
    },
    footer: 'Báo giá Công trình — khảo sát thực tế, báo giá minh bạch.',
  },

  demo: {
    brand: 'Phần mềm Quản lý Bán hàng',
    nav: ['Tính năng', 'Demo', 'Câu hỏi', 'Đăng ký demo'],
    noun: 'phần mềm',
    verb: 'đăng ký demo',
    heroAlt: 'Màn hình bảng điều khiển hiển thị biểu đồ bán hàng',
    description:
      'Trang đăng ký xem demo phần mềm: tính năng chính, quy trình demo và biểu mẫu đặt lịch.',
    hero: {
      h: 'Xem phần mềm vận hành thật trong buổi demo 30 phút',
      s: 'Chuyên viên trình diễn bằng dữ liệu gần giống doanh nghiệp bạn và trả lời mọi thắc mắc trong buổi demo.',
      cta: 'Đặt lịch xem demo',
      trust: ['Demo theo ngành của bạn', 'Không ràng buộc mua', 'Có phần hỏi đáp trực tiếp'],
    },
    angles: {
      trust: ['Demo theo đúng quy trình của doanh nghiệp bạn', 'Bạn cho biết cách đang làm, chúng tôi trình bày phần mềm giải quyết điều đó thế nào.'],
      price: ['Gói sử dụng minh bạch, nâng cấp khi cần', 'Trao đổi trong buổi demo để chọn gói phù hợp số lượng người dùng.'],
      process: ['Buổi demo diễn ra như thế nào', 'Từ tìm hiểu nhu cầu, trình diễn đến đề xuất bước tiếp theo.'],
      proof: ['Những màn hình bạn sẽ được xem', 'Giao diện chính phục vụ công việc hằng ngày.'],
    },
    benefits: {
      h: 'Buổi demo giúp bạn điều gì',
      s: 'Quyết định dựa trên điều bạn thấy, không chỉ lời giới thiệu.',
      items: [
        ['Thấy ngay cách hoạt động', 'Xem thao tác thật thay vì tài liệu quảng cáo.'],
        ['Đặt câu hỏi trực tiếp', 'Hỏi về tính năng, dữ liệu và chi phí.'],
        ['Đánh giá mức phù hợp', 'Biết phần mềm có đáp ứng quy trình của bạn không.'],
        ['Không áp lực', 'Bạn quyết định sau buổi demo.'],
      ],
    },
    features: {
      h: 'Tính năng sẽ được trình diễn',
      s: 'Tùy nhu cầu, chúng tôi tập trung vào phần bạn quan tâm.',
      items: [
        ['Quản lý đơn hàng', 'Theo dõi đơn từ lúc tạo đến khi giao.'],
        ['Quản lý khách hàng', 'Lưu thông tin và lịch sử mua hàng.'],
        ['Báo cáo doanh thu', 'Biểu đồ và số liệu theo thời gian.'],
        ['Phân quyền nhân viên', 'Mỗi người chỉ thấy phần việc của mình.'],
      ],
    },
    process: {
      h: 'Các bước của buổi demo',
      s: 'Khoảng 30 phút, trực tuyến hoặc trực tiếp.',
      items: [
        ['Tìm hiểu nhu cầu', 'Bạn chia sẻ cách đang làm việc và vấn đề gặp phải.'],
        ['Trình diễn', 'Xem các tính năng gắn với nhu cầu của bạn.'],
        ['Hỏi đáp', 'Giải đáp thắc mắc về dữ liệu, chi phí và triển khai.'],
        ['Đề xuất tiếp theo', 'Chọn dùng thử hoặc trao đổi thêm.'],
      ],
    },
    gallery: {
      h: 'Giao diện phần mềm',
      s: 'Một số màn hình chính.',
      items: [
        ['Bảng điều khiển', 'Tổng quan doanh thu và đơn hàng.'],
        ['Báo cáo chi tiết', 'Phân tích theo thời gian và nhóm khách.'],
        ['Làm việc nhóm', 'Phân việc và theo dõi tiến độ.'],
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Buổi demo có mất phí không?', 'Không. Buổi demo miễn phí và không bắt buộc mua.'],
        ['Tôi cần chuẩn bị gì?', 'Chỉ cần mô tả ngắn quy trình hiện tại, chúng tôi sẽ chuẩn bị phần còn lại.'],
        ['Có thể demo cho cả nhóm không?', 'Có, bạn có thể mời đồng nghiệp cùng tham gia.'],
        ['Sau demo tôi có thể dùng thử không?', 'Có, chúng tôi hướng dẫn tạo tài khoản dùng thử nếu bạn muốn.'],
      ],
    },
    guarantee: ['Không ràng buộc', 'Bạn xem demo và quyết định sau; chúng tôi không gây áp lực mua hàng.'],
    cta: { h: 'Đặt lịch xem demo theo nhu cầu của bạn', b: 'Chọn thời gian thuận tiện, chuyên viên sẽ liên hệ xác nhận.', label: 'Đặt lịch xem demo' },
    form: {
      h: 'Đặt lịch demo',
      s: 'Chuyên viên sẽ liên hệ xác nhận thời gian.',
      submit: 'Đặt lịch demo',
      success: 'Cảm ơn bạn! Chuyên viên sẽ liên hệ xác nhận lịch demo.',
      footer: 'Thông tin chỉ dùng để sắp xếp buổi demo.',
      fields: [F.NAME, F.ZALO, { ...F.EMAIL_REQ, label: 'Email công việc' }, F.text('company', 'Doanh nghiệp (không bắt buộc)', 'Tên doanh nghiệp'), F.select('slot', 'Khung giờ mong muốn', SLOT)],
    },
    footer: 'Phần mềm Quản lý Bán hàng — xem demo theo đúng nhu cầu của doanh nghiệp bạn.',
  },
};
