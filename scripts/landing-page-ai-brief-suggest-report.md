# Gợi ý AI cho biểu mẫu tạo landing page

Ngày cập nhật: 31/10/2026.

Đã thêm “Gợi ý AI” cho Khách hàng mục tiêu, Vấn đề khách hàng cần giải quyết và Điểm khác biệt / lợi ích thực tế. Mỗi ô có ba phương án, Áp dụng, Gợi ý khác và thử lại khi lỗi. Người dùng cần nhập ngành hoặc sản phẩm trước; ô cần gợi ý có thể để trống. Dữ liệu đã kiểm tra từ Business Profile/URL trong biểu mẫu được sử dụng làm ngữ cảnh.

API riêng trước khi tạo nháp, dùng OpenAiService và Redis hiện có. Có xác thực, quyền lead.write, giới hạn tần suất và chống gọi trùng theo người dùng/tổ chức/ô/mã yêu cầu. Không đọc hoặc ghi trang của khách hàng. Không truyền ghi chú/CTA/ưu đãi vào ngữ cảnh USP. Kiểm tra schema, số liệu, lời cam kết và một số tính năng chưa được cung cấp; tối đa một lần sửa kết quả trước khi trả gợi ý tham khảo được ghi rõ nguồn.

Giao diện không tự điền nội dung. Nếu người dùng sửa dữ liệu trong khi đang chờ, phương án cũ không thể áp dụng. Thử lại lỗi mạng giữ mã yêu cầu; lấy gợi ý khác tạo mã mới. Giữ theme xanh đậm/cam của trang quản trị.

## Kết quả kiểm tra

- Shared TypeScript và API Nest build thành công.
- Next production build thành công.
- Kiểm thử hồi quy dữ liệu, schema, fallback, một lần sửa có giới hạn, chống gọi trùng và Redis nhiều worker: đạt.
- Kiểm thử trình duyệt: ba ô, ô trống, chọn áp dụng, chỉnh sửa trong khi chờ, double click, retry, desktop và 320px: đạt.
- Hồi quy luồng tạo bằng AI: template, xem trước bằng spec backend, xác nhận/lưu nháp, Builder/autosave, grid và URL review: đạt.
- Gọi provider AI đang cấu hình: cả ba trường trả về source=ai và ba lựa chọn.
- Kiểm thử trình duyệt dùng API fixture gọi service thật; không tạo/sửa/xuất bản trang khách hàng.

## Giới hạn

Gợi ý là phương án để người dùng kiểm tra trước khi áp dụng, không phải xác minh độc lập các tuyên bố kinh doanh. Khi thiếu USP thực tế, hệ thống chỉ gợi ý cách định vị theo sản phẩm/đối tượng. Khi AI không sẵn sàng hoặc kết quả không hợp lệ sau lần sửa, giao diện ghi rõ gợi ý tham khảo.

Kiểm tra TypeScript toàn bộ web vẫn có các lỗi tồn tại trước trong những phần khác (log web-types.log); không có lỗi được báo ở các file tính năng này. Production build dùng cấu hình kiểm tra hiện tại của dự án.

Bản sao trước triển khai, log, ảnh QA và release: /var/www/aibeego_com_usr/data/backups/ai-brief-suggestions-20261031.

Đã triển khai API/shared và web build `qz06JT0X23_uqa3069LDy` lên https://aibeego.com. Browser QA sau triển khai: đạt, 7 yêu cầu gợi ý, không lỗi JavaScript, không ghi trang khách hàng. Health API và trang tạo trả HTTP 200; endpoint gợi ý yêu cầu đăng nhập (HTTP 401 khi không có phiên).
