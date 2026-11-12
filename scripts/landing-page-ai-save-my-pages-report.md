# Kiểm tra AI tạo trang và lưu vào Trang của tôi

Đã triển khai web build `ylqwkoyFe-wXoslxdS819` ngày 31/10/2026. API và database schema không thay đổi.

## Kết quả kiểm tra ban đầu

- Kết quả sinh nội dung đang lưu tạm cho thương hiệu trong ảnh có source=ai, 7 section và chưa có pageId. Đây là nội dung AI hợp lệ, không phải fallback.
- Truy vấn chỉ đọc database theo tên có “digi” chưa tìm thấy trang đã lưu tại thời điểm kiểm tra ban đầu. Cache tương ứng chỉ có kết quả generate, không có kết quả create cho trang này.
- Giao diện đang dừng ở bước xem trước. Nút tạo ở form và nút xác nhận trong preview cùng tên “Tạo landing Page” gây nhầm đã lưu. Subtitle của preview cũng luôn ghi chưa tạo bản nháp kể cả khi mở lại một thiết kế đã lưu.

## Thay đổi

- Giữ bước xác nhận trước khi tạo bản ghi. Nút trong bản xem trước đổi thành **Lưu vào Trang của tôi**.
- Khi API lưu trả về đúng id và aiGenerationId của thiết kế, ghi nhận trạng thái đã lưu, giữ preview đang mở và đổi nút thành **Mở Trang của tôi**. Subtitle hiển thị **Đã lưu vào Trang của tôi**.
- Nút mở danh sách tới `/landing-pages/pages` để thấy cả bản nháp mới, không giữ bộ lọc chỉ trang đã xuất bản.
- Thêm link danh sách tại thẻ trang đã tạo; vẫn có Builder và Xem live. Giữ nguyên ba nút cố định gọn ở đáy form.
- Lưu generationId của trang đã lưu cùng thiết lập để F5 không báo sai là chưa lưu; tương thích dữ liệu thiết lập cũ chưa có generationId.
- Thử lưu lại cùng thiết kế giữ cùng idempotency key, không gọi AI thêm hay tạo trùng. Lỗi API vẫn hiển thị trong preview và có thể thử lại.

## Kiểm tra thực tế

Script `scripts/canary-landing-page-ai-save-rollback.cjs` chạy với module đang triển khai, provider AI đang cấu hình và database thật:

1. Sinh nội dung AI cho một ca khóa học SEO: source=ai, 7 section.
2. Tạo tổ chức QA tạm trong một transaction, gọi chính LandingPagesService.create.
3. Đọc lại trang từ database và so sánh đúng spec AI; trạng thái DRAFT, chưa xuất bản.
4. Gọi listPages đúng tổ chức: thấy trang trong Trang của tôi.
5. Thử tạo lại cùng key: vẫn chỉ một trang.
6. Chủ động rollback, xác minh cả tổ chức QA và trang thử không còn trong database. Không tạo/sửa/xóa trang khách hàng hoặc đăng ký người dùng/gửi email.

Kết quả: saveReadback=true, myPagesList=true, retrySinglePage=true, rolledBack=true.

Browser QA local và sau triển khai trên aibeego.com: nút Lưu, trạng thái Đã lưu, nút Mở danh sách, hàng bản nháp còn sau F5, thử lại không trùng, form vẫn được giữ, fallback retry, Xem live, tách tài khoản, reset, sidebar và desktop/mobile: đạt. Browser dùng fixture APIs gọi service thật; phần database thật được kiểm tra độc lập bằng transaction rollback nói trên.

Hồi quy Builder, sửa nội dung/autosave, preview/spec, grid, URL review và course từ provider: đạt. Unit storage với generationId và dữ liệu cũ: đạt. Next production build: đạt. TypeScript toàn web còn 102 lỗi tồn tại ngoài các file thay đổi; không có lỗi ở page tạo hoặc helper lưu.

## Thao tác cho bản trong ảnh

F5 để tải giao diện mới, bấm **Tạo landing Page** để mở lại bản thiết kế đã lưu trên trình duyệt, rồi bấm **Lưu vào Trang của tôi** ở góc phải. Khi hiện **Đã lưu vào Trang của tôi**, bấm **Mở Trang của tôi** để xem bản nháp trong danh sách. Hệ thống không tự xuất bản.

Không tự lưu thay bản đang xem của khách hàng khi chưa xác nhận. Bản sao trước sửa, release, log database rollback và ảnh QA ở /var/www/aibeego_com_usr/data/backups/ai-save-my-pages-20261031.
