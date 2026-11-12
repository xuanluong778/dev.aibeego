# Sửa luồng AI chuyển sang bản nháp mẫu

Đã triển khai API/shared ngày 31/10/2026. Giao diện đang mở cần bấm **Tạo lại nội dung** để nhận kết quả mới.

## Phát hiện và thay đổi

- Log trước sửa chỉ ghi AI_UNKNOWN, không chỉ ra trường nội dung bị từ chối. Thử trực tiếp với provider đang cấu hình tái hiện nội dung tự thêm “đảm bảo” ở Process và “cam kết” ở Features dù đầu vào không cung cấp.
- Bộ kiểm tra cũ dừng ở lỗi đầu tiên. Đã chuyển sang thu thập đầy đủ lỗi schema, section, nội dung lặp, số liệu/cam kết và SEO kèm vị trí trường. Một lần yêu cầu sửa nhận toàn bộ lỗi cùng hướng xử lý cụ thể. Vẫn giữ kiểm tra nội dung và giới hạn tối đa một lần sửa; không bỏ kiểm tra để ép source=ai.
- Mẫu Khóa học Online mở đầu bằng Speaker chứa dữ liệu giảng viên mẫu. Sau khi loại thông tin này, trang thiếu Hero. Đã bổ sung Hero nếu kiến trúc không còn phần mở đầu, với ảnh thật nếu có hoặc bố cục không ảnh.
- Phân loại lỗi kiểm tra thành AI_MALFORMED; ghi mã lỗi và vị trí vào log, không ghi toàn bộ nội dung khách hàng. Phản hồi fallback phân biệt timeout, giới hạn tốc độ, lỗi dịch vụ và nội dung chưa hợp lệ.
- Tái sử dụng template, spec, renderer và Builder hiện có. Không thay đổi trang đã lưu; giữ cơ chế idempotency và bước xác nhận lưu nháp.

## Kết quả kiểm tra

- Shared TypeScript và API Nest build: đạt.
- Hồi quy 200 template, chống dữ liệu mẫu/lời hướng dẫn, bảo vệ sửa tay, preview/lưu nháp, Redis idempotency: đạt.
- Kiểm thử mới: course luôn có Hero; nhiều lỗi cam kết/giá/SEO được báo cùng lúc và sửa trong một lượt; phân loại đúng AI_MALFORMED.
- Hai trường hợp khóa học gọi AI thật sau sửa: cả hai source=ai ngay lượt đầu, có Hero và 7 section.
- Gọi AI thật qua module đã triển khai trong container: source=ai, 7 section, Page Doctor không phát hiện lỗi nội dung. Không ghi trang hay cơ sở dữ liệu.
- Browser QA trên aibeego.com dùng API fixture/service thật: desktop/mobile, hiển thị chính nội dung course từ provider thật, preview/lưu nháp khớp nhau, Builder sửa nội dung/autosave, grid, URL review: đạt; không lỗi JavaScript và không ghi trang khách hàng.
- Health API sau triển khai HTTP 200.

Thông báo dự phòng vẫn được sử dụng khi provider lỗi hoặc nội dung tiếp tục không hợp lệ sau lần sửa. Đây là cơ chế bảo vệ; thông báo không bị ẩn để giả lập thành công. Bộ kiểm tra không thay thế xác minh độc lập các tuyên bố kinh doanh.

Log, ảnh QA, kết quả provider và bản sao trước sửa: /var/www/aibeego_com_usr/data/backups/ai-course-fallback-20261031.
