# Nút tạo Landing Page và lưu thiết lập qua F5

Đã triển khai web build `RQHlnIs_ALp8PG8vXXryN` lên https://aibeego.com ngày 31/10/2026. API không thay đổi trong bản này.

## Hành vi

- Ba nút cuối màn hình: **Tạo landing Page**, **Xem live**, **Làm mới**. Thanh thao tác dùng position: fixed, tự co theo sidebar và responsive; có safe area và khoảng trống cuối trang để không che nội dung.
- Tạo landing Page dựng bản thiết kế bằng backend hiện có, mở bản xem trước để người dùng xác nhận lưu. Khi đã có bản thiết kế hợp lệ thì mở lại để xác nhận, không gọi AI thêm. Sau khi tạo thành công, giữ người dùng ở form, có link chỉnh sửa trong Builder.
- Xem live mở trang đã tạo ở tab mới qua endpoint preview-token và đường dẫn thực `/p/preview/...`. Đây là link xem trước riêng cho bản nháp; không tự xuất bản. Nếu browser chặn tab mới, mở đường dẫn trên tab hiện tại; form đã được lưu.
- Tự lưu form, ngành, mục tiêu, giọng văn, lựa chọn Business Profile, URL đã phân tích, bản thiết kế, mã chống gọi trùng và trang đã tạo. Khóa lưu tách theo tổ chức và tài khoản. Khôi phục cả các ô cố ý để trống; profile trả về trễ không ghi đè dữ liệu đã lưu.
- Làm mới có bước xác nhận. Xóa toàn bộ nội dung form, URL, thiết kế và tham chiếu trang; lưu trạng thái trống để F5 không tự điền lại Business Profile. Không gửi yêu cầu xóa landing page đã tạo.
- Thử lại sau lỗi lưu dùng đúng spec và idempotency key. Khi API lỗi lưu, modal hiện lỗi và cho xác nhận lại cùng bản thiết kế.

## Kiểm tra

- Production Next build: đạt.
- Kiểm thử storage: phục hồi đúng nội dung/spec, giữ ô trống, tách tài khoản, bỏ preview sai/hết khớp, trạng thái reset vẫn trống: đạt.
- Browser QA local và sau triển khai trên aibeego.com: F5 ngay sau khi nhập, dữ liệu URL/giọng văn/mục tiêu, không bị profile điền lại, retry giữ key, tạo nháp chính xác, Xem live mở tab mới đúng URL, reset/hủy reset, tách tài khoản: đạt.
- Hình học desktop với sidebar mở/đóng và màn hình 820/390/320px: thanh fixed đúng đáy, không overflow, ô nhập cuối không bị che: đạt.
- Hồi quy tạo AI/URL/course, nội dung trong Builder và autosave, grid/phối màu, gợi ý AI ở ba ô: đạt.
- Browser QA dùng fixture API và service backend thật, không tạo/sửa/xóa trang khách hàng. Link trang trong tab QA được giả lập để kiểm tra điều hướng, không dùng token của khách hàng.
- Web TypeScript toàn dự án vẫn báo 102 lỗi tồn tại ngoài các file của tính năng. Không có lỗi được báo ở page tạo, helper lưu hoặc fullscreen preview. Next build giữ cấu hình kiểm tra hiện tại của dự án.

## Giới hạn

Dữ liệu lưu trên cùng trình duyệt theo tài khoản; không đồng bộ sang thiết bị khác. Khi trình duyệt chặn/hết dung lượng lưu, form hiện thông báo thay vì khẳng định đã lưu. Tab vẫn đang chạy phiên bản cũ trước triển khai chưa có cơ chế lưu form này; dữ liệu chưa lưu của phiên bản cũ không thể tự chuyển sang phiên bản mới.

Bản sao trước sửa, release, log và ảnh QA: /var/www/aibeego_com_usr/data/backups/ai-create-persistence-20261031.
