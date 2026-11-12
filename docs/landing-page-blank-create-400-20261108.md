# Sửa lỗi 400 khi tạo Trang trống — 08/11/2026

Nguyên nhân: giao diện gửi `mode: "blank"` nhưng `CreateLandingPageDto` chưa khai báo trường này. Validation toàn cục dùng `forbidNonWhitelisted`, nên yêu cầu bị từ chối trước khi đến service. Service cũng chưa chọn bộ khởi tạo 6 section.

Bổ sung trường optional chỉ chấp nhận `blank`; service chỉ chọn `createBlankLandingPageSpec()` khi có mode này, đồng bộ theme MINIMAL và từ chối kết hợp với template/draftSpec. Yêu cầu không có mode tiếp tục dùng nguyên luồng trước đó. Không sửa frontend, generator AI, URL crawler, template catalog, draft hiện có hay validation toàn cục.

Image đã triển khai: `marketingaz-api:blank-create-400-20261108`, dựa trên snapshot `marketingaz-api:rows-qa2`. Chỉ thay hai JS artifact và hai source tương ứng, bảo toàn các xử lý template release đang chạy. Docker Compose giữ image mới. Web, environment và mounts được đối chiếu và giữ nguyên.

Kiểm tra:
- Tái hiện HTTP 400 với thông báo `property mode should not exist` trên image cũ.
- HTTP Nest thật + ValidationPipe + LandingPagesService thật với database fixture: Trang trống trả 201, tạo DRAFT gồm Header/Hero/LeadForm/Features/CTA/Footer, theme khớp, ID độc lập, retry tuần tự và đồng thời không tạo trùng.
- Validation tiếp tục từ chối mode sai, trường lạ, tên không hợp lệ và nguồn bản nháp xung đột.
- Legacy/default, theme tùy chọn, template ID/slug, lưu preview AI và URL cho kết quả JSON giống baseline cũ sau khi chuẩn hóa ID ngẫu nhiên.
- Chromium trên frontend `https://aibeego.com`: chọn Trang trống, nhập tên, bấm tạo, gọi fixture backend dùng image API mới, nhận 201 và chuyển Builder; hiển thị bản nháp 6 section, không lỗi JavaScript. Mọi API ghi của trình duyệt đã được chặn vào fixture; không tạo bản nháp khách hàng.
- Sau rollout, API health, trang tạo và placeholder asset đều HTTP 200. Hai artifact đang chạy khớp byte với candidate đã kiểm thử.

Bài kiểm tra có thể chạy lại: `scripts/test-landing-page-blank-create.cjs` (chạy trong image API với `--network none`, database fixture, không cần credentials). Backup, báo cáo, ảnh Builder và rollback compose: `/var/www/aibeego_com_usr/data/backups/blank-create-400-20261108/`.
