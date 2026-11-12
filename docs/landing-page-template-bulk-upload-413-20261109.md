# Sửa HTTP 413 khi upload template hàng loạt — 09/11/2026

Log Nginx host xác nhận request POST `/api/v1/landing-pages/templates/packs/bulk` bị chặn với body 191,474,115 byte, do server HTTPS giới hạn 100 MiB. Nginx Docker còn giới hạn mặc định 1 MiB; test trước sửa tại cổng 3999 với body 2 MiB cũng trả 413. API hiện hành đã cho phép ZIP tổng 200 MiB, tối đa 300 mẫu, mỗi pack con 20 MiB và tổng giải nén 400 MiB.

Đã thêm exact location riêng cho endpoint bulk ở hai proxy: `client_max_body_size 210m` (200 MiB cộng multipart overhead), `proxy_request_buffering off`, body/send/read timeout 600 giây. Host dùng file include HTTPS có sẵn, không sửa file vhost do FASTPANEL sinh. Không đổi limit của các endpoint khác, không sửa auth, API, database, template history, trang đã lưu, Builder hoặc web image. Reload Nginx sau khi cả hai `nginx -t` đạt. Lưu cùng cấu hình trong docker/nginx/nginx.dev.conf, nginx.conf và snippet host aibeego-template-bulk-upload.inc ở cả hai bản source; chỉ thêm location mới, giữ các khác biệt cấu hình sẵn có.

Kiểm tra sau sửa:
- Probe HTTP Expect/Content-Length qua domain công khai: kích thước file lỗi 191,474,115 byte và 200 MiB + 4 KiB đều qua giới hạn proxy, tới auth API và trả 401 khi không có token. Đây là kiểm tra header không upload dữ liệu thật, không phải xác nhận đã nhập file của người dùng.
- Request vượt 210 MiB vẫn trả 413. Đường import đơn khác vẫn giữ giới hạn cũ ở cả host và Docker.
- Chạy parser ZIP và importBulk của API image đang chạy với dependency ghi dữ liệu giả: ZIP 191,911,182 byte chứa 200 pack hợp lệ, 100 nhánh tạo mới và 100 nhánh cập nhật đều đạt; lỗi một file không dừng lô; quyền admin giữ nguyên. Không ghi database hoặc file template khách hàng.
- Trang quản lý và API health HTTP 200. Container ID, image và thời điểm khởi động API/web giữ nguyên.

Cảnh báo preload không dùng ngay là cảnh báo trình duyệt, không gây HTTP 413. Root layout khai báo Inter latin/vietnamese preload; đã kiểm tra các preload HTML có `as` tương ứng. Không thay font/preload toàn ứng dụng vì không liên quan tới lỗi upload.

Backup, config trước/sau, probes và báo cáo: `/var/www/aibeego_com_usr/data/backups/template-bulk-upload-413-20261109/`. Test API fixture: scripts/test-landing-page-template-bulk-upload.cjs. File người dùng chưa được tự upload lại để tránh cập nhật mẫu thật ngoài ý muốn; người dùng có thể chọn lại ZIP trong trang Quản lý Templates.
