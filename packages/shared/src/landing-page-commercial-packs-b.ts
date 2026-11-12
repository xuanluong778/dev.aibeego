import { F, type CommercialPack } from './landing-page-commercial-types';

const BOOKING_SLOT = ['Sáng (8–11h)', 'Trưa (11–14h)', 'Chiều (14–17h)', 'Tối (17–20h)'];

/** Health, beauty & product: clinic, spa, cosmetics, fashion, product. */
export const COMMERCIAL_PACKS_B: Record<string, CommercialPack> = {
  clinic: {
    brand: 'Phòng khám Đa khoa An Tâm',
    nav: ['Chuyên khoa', 'Quy trình khám', 'Câu hỏi', 'Đặt lịch'],
    noun: 'dịch vụ khám',
    verb: 'đặt lịch khám',
    heroAlt: 'Bác sĩ trao đổi với bệnh nhân tại phòng khám',
    description:
      'Trang đặt lịch khám cho phòng khám: chuyên khoa, quy trình thăm khám, câu hỏi thường gặp và biểu mẫu đặt lịch.',
    hero: {
      h: 'Đặt lịch khám dễ dàng, được lắng nghe và giải thích rõ ràng',
      s: 'Đội ngũ bác sĩ thăm khám tận tình, tư vấn hướng điều trị phù hợp và theo dõi sức khỏe của bạn sau khám.',
      cta: 'Đặt lịch khám',
      trust: ['Bác sĩ có chứng chỉ hành nghề', 'Tư vấn rõ chi phí trước khi thực hiện', 'Bảo mật hồ sơ sức khỏe'],
    },
    angles: {
      trust: ['Thăm khám cẩn thận, thông tin minh bạch', 'Bác sĩ giải thích tình trạng và các lựa chọn để bạn chủ động quyết định.'],
      price: ['Gói khám rõ ràng, chi phí báo trước', 'Chọn gói khám phù hợp độ tuổi và nhu cầu, không phát sinh khi chưa được đồng ý.'],
      process: ['Một lần đi khám diễn ra như thế nào', 'Từ đặt lịch, thăm khám đến nhận kết quả — mỗi bước đều có người hướng dẫn.'],
      proof: ['Không gian và trang thiết bị của phòng khám', 'Môi trường sạch sẽ, thoải mái giúp bạn yên tâm khi đến khám.'],
    },
    benefits: {
      h: 'Vì sao bạn có thể yên tâm khi đến khám',
      s: 'Chúng tôi đặt sự thoải mái và thông tin rõ ràng của bệnh nhân lên hàng đầu.',
      items: [
        ['Đặt lịch trước, không chờ lâu', 'Chọn khung giờ phù hợp để hạn chế thời gian chờ đợi.'],
        ['Bác sĩ giải thích rõ ràng', 'Bạn hiểu tình trạng của mình và các lựa chọn điều trị.'],
        ['Chi phí báo trước', 'Bảng giá được thông báo rõ trước khi thực hiện dịch vụ.'],
        ['Hồ sơ được bảo mật', 'Thông tin sức khỏe chỉ được sử dụng cho việc chăm sóc của bạn.'],
      ],
    },
    features: {
      h: 'Các dịch vụ khám phổ biến',
      s: 'Liên hệ để được tư vấn dịch vụ phù hợp với tình trạng của bạn.',
      items: [
        ['Khám tổng quát', 'Kiểm tra sức khỏe định kỳ theo độ tuổi và nhu cầu.'],
        ['Khám chuyên khoa', 'Bác sĩ chuyên khoa thăm khám và tư vấn hướng điều trị.'],
        ['Xét nghiệm & chẩn đoán hình ảnh', 'Thực hiện ngay tại phòng khám, trả kết quả rõ ràng.'],
        ['Tái khám & theo dõi', 'Nhắc lịch và theo dõi tiến triển sau điều trị.'],
      ],
    },
    process: {
      h: 'Quy trình thăm khám',
      s: 'Bốn bước đơn giản từ lúc đặt lịch đến khi nhận kết quả.',
      items: [
        ['Đặt lịch', 'Gửi thông tin và chọn khung giờ, nhân viên sẽ gọi xác nhận.'],
        ['Tiếp nhận', 'Làm thủ tục nhanh gọn và hướng dẫn đến phòng khám.'],
        ['Thăm khám', 'Bác sĩ hỏi bệnh, khám và chỉ định xét nghiệm nếu cần.'],
        ['Tư vấn & theo dõi', 'Nhận kết quả, đơn thuốc và lịch tái khám.'],
      ],
    },
    gallery: {
      h: 'Không gian phòng khám',
      s: 'Khu vực tiếp đón và phòng khám được bố trí sạch sẽ, riêng tư.',
      items: [
        ['Khu vực tiếp đón', 'Làm thủ tục nhanh, có người hướng dẫn.'],
        ['Phòng tư vấn', 'Không gian riêng tư để bác sĩ trao đổi với bạn.'],
        ['Phòng chẩn đoán', 'Trang thiết bị phục vụ thăm khám và xét nghiệm.'],
      ],
    },
    pricing: {
      h: 'Gói khám tham khảo',
      s: 'Giá có thể thay đổi theo chỉ định của bác sĩ.',
      plans: [
        { name: 'Khám cơ bản', price: 'Từ 350.000đ', features: ['Khám lâm sàng', 'Tư vấn kết quả', 'Hồ sơ sức khỏe'] },
        { name: 'Khám tổng quát', price: 'Từ 1.200.000đ', features: ['Xét nghiệm máu, nước tiểu', 'Chẩn đoán hình ảnh cơ bản', 'Tư vấn chuyên khoa'], highlighted: true },
        { name: 'Khám chuyên sâu', price: 'Liên hệ', features: ['Theo chuyên khoa', 'Gói xét nghiệm mở rộng', 'Theo dõi sau khám'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi có cần nhịn ăn trước khi khám không?', 'Tùy loại xét nghiệm. Nhân viên sẽ hướng dẫn cụ thể khi xác nhận lịch của bạn.'],
        ['Tôi cần mang theo những gì?', 'Giấy tờ tùy thân, thẻ bảo hiểm (nếu có) và các kết quả khám, đơn thuốc cũ.'],
        ['Có thể đổi hoặc hủy lịch hẹn không?', 'Có. Vui lòng báo trước để chúng tôi sắp xếp lại khung giờ cho bạn.'],
        ['Thông tin sức khỏe của tôi có được bảo mật không?', 'Có. Hồ sơ chỉ được sử dụng cho mục đích chăm sóc sức khỏe của bạn.'],
      ],
    },
    guarantee: ['Cam kết với người bệnh', 'Tư vấn trung thực, báo trước chi phí và bảo mật thông tin sức khỏe của bạn.'],
    cta: { h: 'Đặt lịch khám để được tư vấn phù hợp', b: 'Chọn khung giờ thuận tiện, nhân viên sẽ gọi xác nhận trong giờ làm việc.', label: 'Đặt lịch khám' },
    form: {
      h: 'Đặt lịch khám',
      s: 'Nhân viên sẽ liên hệ xác nhận lịch của bạn.',
      submit: 'Gửi yêu cầu đặt lịch',
      success: 'Cảm ơn bạn! Chúng tôi sẽ gọi xác nhận lịch khám sớm.',
      footer: 'Thông tin chỉ dùng để xác nhận lịch khám.',
      fields: [F.NAME, F.PHONE, F.text('date', 'Ngày muốn khám', 'VD: Thứ Năm tuần này', true), F.select('slot', 'Khung giờ', BOOKING_SLOT, true), F.note('Triệu chứng hoặc nhu cầu khám (nếu có)', 'Mô tả ngắn để chúng tôi sắp xếp bác sĩ phù hợp', 'symptom')],
    },
    footer: 'Phòng khám Đa khoa An Tâm — thăm khám tận tình, thông tin rõ ràng. Liên hệ để đặt lịch.',
  },

  spa: {
    brand: 'Lá Spa & Wellness',
    nav: ['Liệu trình', 'Không gian', 'Ưu đãi', 'Đặt lịch'],
    noun: 'liệu trình spa',
    verb: 'đặt lịch',
    heroAlt: 'Khăn tắm, hoa và nến trong không gian spa thư giãn',
    description:
      'Trang đặt lịch cho spa: liệu trình thư giãn, không gian, bảng giá tham khảo và biểu mẫu đặt lịch nhanh.',
    hero: {
      h: 'Dành cho mình một buổi thư giãn thật sự',
      s: 'Liệu trình chăm sóc cơ thể và da mặt trong không gian yên tĩnh, kỹ thuật viên lắng nghe nhu cầu và điều chỉnh theo bạn.',
      cta: 'Đặt lịch thư giãn',
      trust: ['Kỹ thuật viên được đào tạo bài bản', 'Sản phẩm rõ nguồn gốc', 'Không gian riêng tư, yên tĩnh'],
    },
    angles: {
      trust: ['Chăm sóc tận tâm, sạch sẽ và riêng tư', 'Dụng cụ được vệ sinh sau mỗi lần dùng, liệu trình được tư vấn phù hợp tình trạng của bạn.'],
      price: ['Chọn liệu trình phù hợp với thời gian và ngân sách', 'Bảng giá rõ ràng cho từng liệu trình, không phát sinh khi chưa được bạn đồng ý.'],
      process: ['Một buổi spa diễn ra như thế nào', 'Từ tư vấn, thư giãn đến lời khuyên chăm sóc tại nhà.'],
      proof: ['Không gian thư giãn của chúng tôi', 'Ánh sáng dịu, hương thơm nhẹ và âm nhạc êm giúp bạn thả lỏng.'],
    },
    benefits: {
      h: 'Điều bạn cảm nhận được khi đến với chúng tôi',
      s: 'Mỗi liệu trình được điều chỉnh theo cảm giác của riêng bạn.',
      items: [
        ['Thư giãn sâu', 'Kỹ thuật xoa bóp nhẹ nhàng giúp cơ thể thả lỏng sau ngày dài.'],
        ['Tư vấn trước khi làm', 'Kỹ thuật viên hỏi về tình trạng da, sức khỏe và mong muốn của bạn.'],
        ['Sản phẩm dịu nhẹ', 'Ưu tiên sản phẩm thân thiện với làn da, có thể thay đổi nếu bạn nhạy cảm.'],
        ['Không gian riêng tư', 'Phòng riêng, yên tĩnh để bạn hoàn toàn thư giãn.'],
      ],
    },
    features: {
      h: 'Liệu trình nổi bật',
      s: 'Chọn một liệu trình hoặc để kỹ thuật viên gợi ý.',
      items: [
        ['Massage thư giãn toàn thân', 'Giảm căng cơ, hỗ trợ ngủ ngon hơn.'],
        ['Chăm sóc da mặt', 'Làm sạch, dưỡng ẩm và phục hồi theo loại da.'],
        ['Gội đầu dưỡng sinh', 'Kết hợp massage đầu, cổ vai gáy.'],
        ['Liệu trình đôi', 'Dành cho hai người cùng thư giãn trong một phòng.'],
      ],
    },
    process: {
      h: 'Quy trình một buổi spa',
      s: 'Nhẹ nhàng và không vội vàng.',
      items: [
        ['Đón tiếp & tư vấn', 'Thưởng thức trà ấm và trao đổi về nhu cầu của bạn.'],
        ['Thay đồ & chuẩn bị', 'Không gian riêng để bạn thoải mái.'],
        ['Thực hiện liệu trình', 'Kỹ thuật viên thực hiện theo mức độ bạn chọn.'],
        ['Nghỉ ngơi & dặn dò', 'Nghỉ ngơi sau liệu trình và nhận lời khuyên chăm sóc.'],
      ],
    },
    gallery: {
      h: 'Không gian spa',
      s: 'Nơi bạn có thể tạm rời khỏi nhịp sống bận rộn.',
      items: [
        ['Phòng liệu trình', 'Ánh sáng dịu, giường massage êm ái.'],
        ['Khu thư giãn', 'Nghỉ ngơi và thưởng thức trà sau liệu trình.'],
        ['Góc yoga & thiền', 'Không gian tĩnh để cân bằng cơ thể và tinh thần.'],
      ],
    },
    pricing: {
      h: 'Bảng giá tham khảo',
      s: 'Giá có thể thay đổi theo thời lượng và kỹ thuật.',
      plans: [
        { name: 'Thư giãn 60 phút', price: '450.000đ', features: ['Massage thư giãn', 'Trà thảo mộc', 'Phòng riêng'] },
        { name: 'Chăm sóc toàn diện 90 phút', price: '690.000đ', features: ['Massage + chăm sóc da mặt', 'Gội đầu dưỡng sinh', 'Phòng riêng'], highlighted: true },
        { name: 'Liệu trình đôi', price: '1.190.000đ', features: ['Cho 2 người', 'Phòng đôi riêng tư', 'Trà & trái cây'] },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi cần chuẩn bị gì trước khi đến?', 'Bạn chỉ cần đến sớm 10 phút. Spa chuẩn bị sẵn khăn, đồ thay và trà.'],
        ['Tôi có làn da nhạy cảm, có làm được không?', 'Được. Hãy cho kỹ thuật viên biết để chọn sản phẩm và kỹ thuật phù hợp.'],
        ['Có thể đổi lịch hẹn không?', 'Có, vui lòng báo trước ít nhất 4 giờ để chúng tôi sắp xếp.'],
        ['Có phục vụ phụ nữ mang thai không?', 'Có liệu trình riêng, bạn nên trao đổi trước và hỏi ý kiến bác sĩ nếu cần.'],
      ],
    },
    guarantee: ['Cam kết trải nghiệm', 'Nếu bạn chưa hài lòng với liệu trình, hãy cho chúng tôi biết ngay để được điều chỉnh trong buổi đó.'],
    cta: { h: 'Đặt cho mình một khoảng thời gian thư giãn', b: 'Chọn ngày và khung giờ thuận tiện, nhân viên sẽ liên hệ xác nhận.', label: 'Đặt lịch thư giãn' },
    form: {
      h: 'Đặt lịch spa',
      s: 'Chúng tôi sẽ gọi xác nhận trong giờ làm việc.',
      submit: 'Đặt lịch ngay',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận lịch sớm.',
      footer: 'Thông tin chỉ dùng để xác nhận lịch hẹn.',
      fields: [F.NAME, F.PHONE, F.text('date', 'Ngày muốn đến', 'VD: Thứ Bảy này', true), F.select('slot', 'Khung giờ', BOOKING_SLOT, true), F.select('service', 'Liệu trình quan tâm', ['Massage thư giãn', 'Chăm sóc da mặt', 'Liệu trình đôi', 'Nhờ tư vấn'])],
    },
    footer: 'Lá Spa & Wellness — không gian thư giãn và chăm sóc cơ thể. Liên hệ để đặt lịch.',
  },

  cosmetics: {
    brand: 'Làn Da Thuần',
    nav: ['Sản phẩm', 'Cách dùng', 'Bộ sản phẩm', 'Đặt hàng'],
    noun: 'sản phẩm chăm sóc da',
    verb: 'đặt hàng',
    heroAlt: 'Bộ mỹ phẩm chăm sóc da bày trên nền màu pastel',
    description:
      'Trang bán mỹ phẩm chăm sóc da: thành phần, cách dùng, bộ sản phẩm và đặt hàng nhanh.',
    hero: {
      h: 'Chăm sóc da nhẹ nhàng, rõ thành phần và dễ áp dụng mỗi ngày',
      s: 'Bộ sản phẩm được chọn cho làn da nhạy cảm và hỗn hợp, kèm hướng dẫn từng bước sáng – tối.',
      cta: 'Đặt hàng ngay',
      trust: ['Công bố thành phần đầy đủ', 'Hướng dẫn sử dụng từng bước', 'Đổi trả theo chính sách cửa hàng'],
    },
    angles: {
      trust: ['Thành phần minh bạch, công thức dịu nhẹ', 'Chúng tôi công bố đầy đủ thành phần để bạn tự kiểm tra và chọn đúng loại da.'],
      price: ['Chọn bộ sản phẩm tiết kiệm hơn mua lẻ', 'Các bộ được kết hợp theo nhu cầu: làm sạch, dưỡng ẩm, chống nắng.'],
      process: ['Quy trình chăm sóc da gọn trong 4 bước', 'Làm sạch, cân bằng, dưỡng ẩm và bảo vệ — áp dụng sáng và tối.'],
      proof: ['Từng sản phẩm trong bộ chăm sóc', 'Xem kết cấu, dung tích và cách dùng của từng sản phẩm.'],
    },
    benefits: {
      h: 'Vì sao bạn sẽ thích bộ sản phẩm này',
      s: 'Tập trung vào những điều làn da cần mỗi ngày.',
      items: [
        ['Công thức dịu nhẹ', 'Hạn chế hương liệu mạnh, phù hợp làn da dễ kích ứng.'],
        ['Dễ áp dụng', 'Chỉ vài bước mỗi ngày, không cần nhớ nhiều sản phẩm.'],
        ['Kết cấu dễ thẩm thấu', 'Lên da mỏng nhẹ, không để lại cảm giác bết dính.'],
        ['Có thể thử trước', 'Khuyến nghị thử trên vùng da nhỏ trước khi dùng toàn mặt.'],
      ],
    },
    features: {
      h: 'Sản phẩm trong bộ',
      s: 'Mỗi sản phẩm đảm nhận một vai trò trong quy trình.',
      items: [
        ['Sữa rửa mặt dịu nhẹ', 'Làm sạch bụi bẩn và dầu thừa mà không làm khô da.'],
        ['Toner cân bằng', 'Giúp da sẵn sàng hấp thụ dưỡng chất.'],
        ['Serum cấp ẩm', 'Bổ sung độ ẩm cho da mềm mịn hơn.'],
        ['Kem chống nắng', 'Bảo vệ da khi ra ngoài mỗi ngày.'],
      ],
    },
    process: {
      h: 'Cách sử dụng',
      s: 'Áp dụng đều đặn mỗi ngày để làn da quen dần.',
      items: [
        ['Làm sạch', 'Rửa mặt với nước mát, massage nhẹ nhàng 30 giây.'],
        ['Cân bằng', 'Thấm toner lên da bằng tay hoặc bông.'],
        ['Cấp ẩm', 'Thoa vài giọt serum, vỗ nhẹ cho thấm.'],
        ['Bảo vệ', 'Buổi sáng thoa kem chống nắng trước khi ra ngoài.'],
      ],
    },
    gallery: {
      h: 'Hình ảnh sản phẩm',
      s: 'Bao bì và kết cấu thật của từng sản phẩm.',
      items: [
        ['Bộ chăm sóc da cơ bản', 'Đầy đủ các bước làm sạch và dưỡng ẩm.'],
        ['Bảng màu trang điểm nhẹ', 'Tông màu tự nhiên cho ngày thường.'],
        ['Bộ sản phẩm quà tặng', 'Đóng hộp gọn gàng, thích hợp để tặng.'],
      ],
    },
    pricing: {
      h: 'Chọn bộ sản phẩm',
      s: 'Giá tham khảo, có thể thay đổi theo chương trình của cửa hàng.',
      plans: [
        { name: 'Bộ khởi đầu', price: '490.000đ', features: ['Sữa rửa mặt', 'Toner', 'Hướng dẫn sử dụng'], cta: 'Đặt bộ khởi đầu' },
        { name: 'Bộ đầy đủ', price: '890.000đ', features: ['Sữa rửa mặt + Toner', 'Serum cấp ẩm', 'Kem chống nắng'], highlighted: true, cta: 'Đặt bộ đầy đủ' },
        { name: 'Bộ quà tặng', price: '1.250.000đ', features: ['Bộ đầy đủ', 'Hộp quà & thiệp', 'Túi đựng'], cta: 'Đặt bộ quà tặng' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Sản phẩm có phù hợp da nhạy cảm không?', 'Sản phẩm được thiết kế dịu nhẹ, nhưng bạn nên thử trên vùng da nhỏ trước khi dùng toàn mặt.'],
        ['Bao lâu thì thấy hiệu quả?', 'Mỗi làn da phản ứng khác nhau. Nên dùng đều đặn ít nhất 4 tuần để đánh giá.'],
        ['Có thể dùng chung với sản phẩm khác không?', 'Có thể, nhưng bạn nên nhắn cho chúng tôi để được tư vấn thứ tự phù hợp.'],
        ['Chính sách đổi trả thế nào?', 'Đổi trả theo chính sách của cửa hàng; vui lòng liên hệ khi nhận hàng nếu có vấn đề.'],
      ],
    },
    guarantee: ['Mua hàng yên tâm', 'Sản phẩm có nguồn gốc rõ ràng; hỗ trợ đổi trả nếu sản phẩm lỗi hoặc giao sai.'],
    cta: { h: 'Bắt đầu với bộ chăm sóc da phù hợp', b: 'Đặt hàng và nhận hướng dẫn sử dụng chi tiết kèm theo.', label: 'Đặt hàng ngay' },
    form: {
      h: 'Đặt hàng',
      s: 'Chúng tôi sẽ liên hệ xác nhận đơn và giao hàng.',
      submit: 'Đặt hàng',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đơn hàng.',
      footer: 'Thông tin chỉ dùng để xử lý đơn hàng.',
      fields: [F.NAME, F.PHONE, F.select('set', 'Bộ sản phẩm', ['Bộ khởi đầu', 'Bộ đầy đủ', 'Bộ quà tặng'], true), F.text('address', 'Địa chỉ nhận hàng', 'Số nhà, đường, quận/huyện, tỉnh/thành', true), F.select('skin', 'Loại da của bạn', ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm', 'Chưa rõ'])],
    },
    footer: 'Làn Da Thuần — mỹ phẩm chăm sóc da dịu nhẹ, thành phần rõ ràng.',
  },

  fashion: {
    brand: 'Mộc Atelier',
    nav: ['Bộ sưu tập', 'Chất liệu', 'Bảng size', 'Đặt hàng'],
    noun: 'bộ sưu tập',
    verb: 'đặt trước',
    heroAlt: 'Trang phục màu trung tính treo trên giá đồ',
    description:
      'Trang giới thiệu bộ sưu tập thời trang: phong cách, chất liệu, bảng size và đặt hàng.',
    hero: {
      h: 'Bộ sưu tập mới: tối giản, dễ phối và mặc được cả tuần',
      s: 'Chất liệu thoáng, form dáng gọn và bảng màu trung tính giúp bạn dễ phối đồ từ đi làm đến dạo phố.',
      cta: 'Xem và đặt hàng',
      trust: ['Chất liệu ghi rõ trên từng mẫu', 'Có bảng size chi tiết', 'Hỗ trợ đổi size'],
    },
    angles: {
      trust: ['Chất liệu và đường may được kiểm tra kỹ', 'Chúng tôi ghi rõ thành phần vải, cách bảo quản và bảng size để bạn mua tự tin.'],
      price: ['Mua theo set tiết kiệm hơn mua lẻ', 'Kết hợp áo, quần và phụ kiện theo bộ để mặc đẹp mà vẫn tiết kiệm.'],
      process: ['Cách chọn size và phối đồ cho bạn', 'Làm theo bốn bước để chọn đúng size và hoàn thiện outfit.'],
      proof: ['Xem trang phục lên dáng thực tế', 'Hình ảnh phối đồ thực tế giúp bạn hình dung khi mặc.'],
    },
    benefits: {
      h: 'Điều làm nên bộ sưu tập',
      s: 'Thiết kế để mặc thoải mái và dễ kết hợp.',
      items: [
        ['Dễ phối mỗi ngày', 'Bảng màu trung tính, kết hợp được với tủ đồ sẵn có.'],
        ['Chất liệu thoáng mát', 'Vải mềm, thấm hút tốt, phù hợp khí hậu nóng ẩm.'],
        ['Form dáng gọn gàng', 'Cắt may chuẩn, tôn dáng mà vẫn thoải mái vận động.'],
        ['Đổi size dễ dàng', 'Hỗ trợ đổi size trong thời gian quy định.'],
      ],
    },
    features: {
      h: 'Chi tiết sản phẩm',
      s: 'Những điều bạn nên biết trước khi chọn mua.',
      items: [
        ['Chất liệu', 'Ghi rõ thành phần vải và cách giặt bảo quản.'],
        ['Bảng size', 'Số đo chi tiết từng size để dễ chọn.'],
        ['Màu sắc', 'Các màu cơ bản dễ phối với nhau.'],
        ['Đóng gói', 'Đóng gói gọn gàng, thích hợp tặng.'],
      ],
    },
    process: {
      h: 'Chọn size và đặt hàng',
      s: 'Chỉ vài bước để có bộ đồ vừa vặn.',
      items: [
        ['Xem bảng size', 'Đối chiếu số đo của bạn với bảng size.'],
        ['Chọn mẫu và màu', 'Chọn trang phục bạn thích trong bộ sưu tập.'],
        ['Xác nhận đơn', 'Nhân viên liên hệ xác nhận size và địa chỉ.'],
        ['Nhận hàng & thử đồ', 'Cần đổi size, liên hệ trong thời gian đổi trả.'],
      ],
    },
    gallery: {
      h: 'Phối đồ thực tế',
      s: 'Gợi ý kết hợp từ bộ sưu tập.',
      items: [
        ['Phong cách thanh lịch', 'Tông trắng – be nhẹ nhàng cho ngày làm việc.'],
        ['Phong cách năng động', 'Màu nổi bật cho những ngày muốn tươi mới.'],
        ['Phong cách cá tính', 'Phụ kiện kính mát tạo điểm nhấn.'],
      ],
    },
    pricing: {
      h: 'Chọn theo set',
      s: 'Giá tham khảo, có thể thay đổi theo từng đợt.',
      plans: [
        { name: 'Một món', price: 'Từ 390.000đ', features: ['Chọn mẫu và size', 'Hỗ trợ đổi size'], cta: 'Đặt một món' },
        { name: 'Set 3 món', price: 'Từ 990.000đ', features: ['Áo + quần + phụ kiện', 'Tiết kiệm hơn mua lẻ', 'Hỗ trợ phối đồ'], highlighted: true, cta: 'Đặt set 3 món' },
        { name: 'Set quà tặng', price: 'Từ 1.390.000đ', features: ['Đóng hộp & thiệp', 'Hỗ trợ chọn size', 'Giao nhanh'], cta: 'Đặt set quà' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Tôi không chắc về size thì làm thế nào?', 'Bạn gửi chiều cao, cân nặng, chúng tôi sẽ gợi ý size phù hợp.'],
        ['Có được đổi size không?', 'Có, trong thời gian quy định và sản phẩm còn nguyên tem, chưa giặt.'],
        ['Chất liệu có bị co khi giặt không?', 'Hướng dẫn giặt được ghi trên nhãn. Làm theo sẽ hạn chế co rút.'],
        ['Thời gian giao hàng bao lâu?', 'Thông thường 2–5 ngày tùy khu vực; chúng tôi sẽ báo khi xác nhận đơn.'],
      ],
    },
    guarantee: ['Mua sắm yên tâm', 'Hỗ trợ đổi size và đổi sản phẩm lỗi theo chính sách rõ ràng của cửa hàng.'],
    cta: { h: 'Chọn trang phục hợp với phong cách của bạn', b: 'Đặt hàng và nhận tư vấn size từ nhân viên.', label: 'Đặt hàng ngay' },
    form: {
      h: 'Đặt hàng',
      s: 'Nhân viên sẽ liên hệ xác nhận size và giao hàng.',
      submit: 'Đặt hàng',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đơn hàng.',
      footer: 'Thông tin chỉ dùng để xử lý đơn hàng.',
      fields: [F.NAME, F.PHONE, F.text('item', 'Mẫu quan tâm', 'VD: Áo sơ mi trắng', true), F.select('size', 'Size', ['S', 'M', 'L', 'XL', 'Cần tư vấn'], true), F.text('address', 'Địa chỉ nhận hàng', 'Số nhà, đường, quận/huyện, tỉnh/thành')],
    },
    footer: 'Mộc Atelier — thời trang tối giản, chất liệu rõ ràng.',
  },

  product: {
    brand: 'Cửa hàng Thiết bị Số',
    nav: ['Sản phẩm', 'Điểm nổi bật', 'Mua hàng', 'Hỗ trợ'],
    noun: 'sản phẩm',
    verb: 'đặt mua',
    heroAlt: 'Đồng hồ thông minh màu trắng đặt trên nền sáng',
    description:
      'Trang giới thiệu và bán sản phẩm: điểm nổi bật, thông tin chi tiết, lựa chọn và đặt mua nhanh.',
    hero: {
      h: 'Sản phẩm gọn gàng, dễ dùng và đồng hành cùng bạn mỗi ngày',
      s: 'Thiết kế tối giản, thông tin rõ ràng và chính sách mua hàng minh bạch để bạn yên tâm chọn mua.',
      cta: 'Đặt mua ngay',
      trust: ['Hàng chính hãng, có hóa đơn', 'Đổi trả theo chính sách', 'Hỗ trợ qua Zalo giờ hành chính'],
    },
    angles: {
      trust: ['Mua hàng minh bạch, bảo hành rõ ràng', 'Thông tin sản phẩm, bảo hành và đổi trả được công bố đầy đủ trước khi bạn đặt mua.'],
      price: ['So sánh các lựa chọn và chọn phiên bản phù hợp', 'Mỗi phiên bản có thông tin và mức giá rõ ràng để bạn dễ quyết định.'],
      process: ['Sản phẩm hoạt động như thế nào', 'Làm quen nhanh với các bước sử dụng cơ bản.'],
      proof: ['Nhìn kỹ sản phẩm từ nhiều góc', 'Hình ảnh thực tế giúp bạn hình dung khi sử dụng.'],
    },
    benefits: {
      h: 'Vì sao nên chọn sản phẩm này',
      s: 'Những điều người dùng quan tâm nhất.',
      items: [
        ['Thiết kế gọn nhẹ', 'Dễ mang theo, phù hợp nhiều hoàn cảnh sử dụng.'],
        ['Dễ sử dụng', 'Thao tác đơn giản, có hướng dẫn kèm theo.'],
        ['Chất lượng ổn định', 'Được kiểm tra trước khi giao đến tay khách hàng.'],
        ['Hỗ trợ sau mua', 'Có kênh hỗ trợ khi bạn cần hướng dẫn hoặc bảo hành.'],
      ],
    },
    features: {
      h: 'Thông tin chi tiết',
      s: 'Điểm nổi bật bạn nên biết trước khi mua.',
      items: [
        ['Thiết kế', 'Chất liệu và hoàn thiện được chăm chút.'],
        ['Tính năng', 'Các chức năng chính phục vụ nhu cầu hằng ngày.'],
        ['Bảo hành', 'Thời hạn và điều kiện bảo hành ghi rõ.'],
        ['Phụ kiện đi kèm', 'Danh sách phụ kiện trong hộp.'],
      ],
    },
    process: {
      h: 'Mua hàng thế nào',
      s: 'Từ đặt hàng đến khi nhận sản phẩm.',
      items: [
        ['Chọn phiên bản', 'Xem thông tin và chọn phiên bản phù hợp.'],
        ['Điền thông tin', 'Gửi tên, số điện thoại và địa chỉ nhận hàng.'],
        ['Xác nhận đơn', 'Nhân viên gọi xác nhận và báo thời gian giao.'],
        ['Nhận hàng', 'Kiểm tra sản phẩm khi nhận, hỗ trợ đổi trả nếu có lỗi.'],
      ],
    },
    gallery: {
      h: 'Hình ảnh sản phẩm',
      s: 'Xem sản phẩm từ nhiều góc nhìn.',
      items: [
        ['Mặt trước', 'Thiết kế gọn gàng, hoàn thiện cẩn thận.'],
        ['Chi tiết thiết kế', 'Chất liệu và đường nét rõ ràng.'],
        ['Phối cùng phụ kiện', 'Gợi ý kết hợp khi sử dụng.'],
      ],
    },
    pricing: {
      h: 'Chọn phiên bản',
      s: 'Giá tham khảo, có thể thay đổi theo chương trình.',
      plans: [
        { name: 'Tiêu chuẩn', price: '1.290.000đ', features: ['Sản phẩm + phụ kiện cơ bản', 'Bảo hành 12 tháng'], cta: 'Đặt bản tiêu chuẩn' },
        { name: 'Nâng cao', price: '1.890.000đ', features: ['Thêm tính năng nâng cao', 'Phụ kiện đầy đủ', 'Bảo hành 12 tháng'], highlighted: true, cta: 'Đặt bản nâng cao' },
        { name: 'Bộ quà tặng', price: '2.290.000đ', features: ['Hộp quà & thiệp', 'Phụ kiện đầy đủ'], cta: 'Đặt bộ quà tặng' },
      ],
    },
    faq: {
      h: 'Câu hỏi thường gặp',
      items: [
        ['Sản phẩm có bảo hành không?', 'Có. Thời hạn và điều kiện bảo hành được ghi trong phiếu đi kèm.'],
        ['Bao lâu thì nhận được hàng?', 'Thường 2–5 ngày tùy khu vực, nhân viên sẽ báo thời gian cụ thể khi xác nhận đơn.'],
        ['Tôi có thể đổi trả không?', 'Có, trong thời gian quy định nếu sản phẩm lỗi hoặc giao sai.'],
        ['Thanh toán bằng cách nào?', 'Có thể thanh toán khi nhận hàng hoặc chuyển khoản, tùy lựa chọn của bạn.'],
      ],
    },
    guarantee: ['Cam kết mua hàng', 'Hàng chính hãng, có hóa đơn; hỗ trợ đổi trả theo chính sách đã công bố.'],
    cta: { h: 'Sẵn sàng sở hữu sản phẩm?', b: 'Đặt hàng và nhận xác nhận từ nhân viên trong giờ làm việc.', label: 'Đặt mua ngay' },
    form: {
      h: 'Đặt mua sản phẩm',
      s: 'Nhân viên sẽ gọi xác nhận đơn hàng của bạn.',
      submit: 'Đặt mua',
      success: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đơn hàng.',
      footer: 'Thông tin chỉ dùng để xử lý đơn hàng.',
      fields: [F.NAME, F.PHONE, F.select('version', 'Phiên bản', ['Tiêu chuẩn', 'Nâng cao', 'Bộ quà tặng'], true), F.select('qty', 'Số lượng', ['1', '2', '3–5', '6 trở lên']), F.text('address', 'Địa chỉ nhận hàng', 'Số nhà, đường, quận/huyện, tỉnh/thành', true)],
    },
    footer: 'Cửa hàng Thiết bị Số — hàng chính hãng, hỗ trợ đổi trả rõ ràng.',
  },
};
