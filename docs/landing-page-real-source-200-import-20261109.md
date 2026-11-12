# Nhập thực tế source new.zip — 09/11/2026

Đã nhận file thật tại `/var/www/aibeego_com_usr/data/www/aibeego.com/docs/source new.zip`, 191.473.921 byte, SHA-256 b5b8fcf0fb475643933b8fcaf1b9715e09ed9ee233b18e9b6654b838b5aefd3b. Archive có 1.411 file, 201 ZIP con, 201 thư mục mẫu, 200 slug duy nhất. online-course.zip và online-course-dark-emerald-v3.zip có cùng slug online-course nhưng khác nội dung. README gốc cũng nêu phải chọn một bản.

Người dùng đã chọn online-course-dark-emerald-v3, headline “Học bài bản để tự tin hoàn thiện một dự án của bạn.” Đã tạo ZIP sạch đúng 200 gói từ các thư mục nguồn trong file gốc, giữ lựa chọn này, giữ nguyên slug/name/category. Gốc không bị thay đổi. File sạch `/var/www/aibeego_com_usr/data/www/aibeego.com/docs/source-new-200-ready.zip`, 98.826.120 byte, chỉ có packs/<slug>.zip. Các asset được thêm content hash vào tên và cập nhật reference trong spec để không ghi đè ảnh mà trang đã tạo trước đó đang dùng.

Đã sao lưu đầy đủ 200 template và 3 phiên bản cũ trước thao tác, kèm hash của 25 customer landing pages. Backup riêng tư before-template-state.json, quyền 0600. Chạy bộ ZIP sạch qua toàn bộ importBulk/importUpdate/applyAssets/snapshot/publish thật trong container không network, với persistence database giả và filesystem QA riêng: 200 cập nhật, 0 tạo mới, 0 lỗi; 200 snapshot; các spec hợp lệ; lựa chọn online-course được xác nhận.

## Nhập production

Đã áp dụng bộ đã kiểm tra bằng cùng service, trong một transaction cho cả 200 template. Khóa row template, đối chiếu updatedAt với backup trước khi ghi để tránh đè thay đổi đồng thời. Audit actor `codex:source-new-200:20261109`, note ghi rõ job nguồn; không giả danh tài khoản người dùng. Mọi bản trước sửa được lưu vào lịch sử. Hoàn thành lúc 20:11:45 ngày 09/11/2026 (Asia/Ho_Chi_Minh): 200 cập nhật, 0 tạo mới, 0 lỗi, đều PUBLISHED và pack:managed. Không migration schema. Hash của toàn bộ 25 customer pages (draft/published/updatedAt) giữ nguyên.

Đối chiếu sau nhập: spec production của cả 200 mẫu khớp kết quả dry-run; luồng list/getTemplate cho khách hàng trả đúng các block và themeTokens đã xuất bản. Cả 200 thumbnail dùng ảnh API mới có tên content hash; tất cả reference ảnh đã được rewrite sang template-assets. Đường ảnh cũ còn nguyên.

## Sửa preview cũ trên thẻ mẫu

Phát hiện thêm frontend tự dùng /landing-pages/templates/<slug>-long.webp khi pack mới không có previewLongImage. Điều này làm hover hiển thị screenshot catalog cũ dù spec đã nhập thành công. Đã tái hiện trên website. Sửa riêng imagePaths của trang template: pack:managed dùng thumbnail/preview do pack cung cấp; khi không có ảnh dài thì giữ thumbnail mới. Không có thumbnail thì dùng fallback trống của thẻ, không lấy screenshot catalog cũ. Các template không managed giữ fallback cũ. Cùng bản vá nhỏ đã áp dụng vào mirror, không thay toàn file khác phiên bản.

Next build đạt, candidate browser kiểm tra media/preview desktop/mobile đạt. Đã triển khai image marketingaz-web:template-real-source-200-20261109 trên đúng image web trước đó; API container không đổi, env/mounts giữ nguyên. Endpoint phiên bản công khai xác nhận lpb-template-real-source-200-20261109. Không sửa toolbar, engine hoặc giao diện Builder.

Báo cáo, script dry-run/maintenance/restore, snapshot source, screenshots và hashes nằm tại /var/www/aibeego_com_usr/data/backups/template-real-source-import-20261109/. File restore chỉ được chuẩn bị, chưa chạy. Gốc ZIP 201 gói vẫn được giữ; dùng file sạch 200 gói cho lần upload tiếp theo.

Hoàn tất kiểm tra browser: 200/200 preview desktop đạt, thêm 20 danh mục trên mobile; không tràn ngang, không ảnh hỏng, không JavaScript/asset HTTP error. Preview nhận đúng headline mới. Browser dùng snapshot dữ liệu thật qua luồng list/getTemplate khách hàng và tải ảnh thật từ production, API dữ liệu khác dùng fixture để không tạo trang mới. Đã xem thủ công ảnh agency, khóa học được chọn và fashion. Sau rollout web, kiểm tra lại media/preview production đạt; hover không tải screenshot cũ. Các test đã buộc tải ảnh lazy để kiểm tra toàn bộ URL, và giới hạn thời gian chờ font bên thứ ba.

200 history snapshot mới được xác nhận trong database; tổng template vẫn 200, cả 200 đã xuất bản. Các file tạm của job trong API container đã được xóa; backup ở host và ZIP sạch vẫn giữ. Container QA đã được dọn sau kiểm tra.
