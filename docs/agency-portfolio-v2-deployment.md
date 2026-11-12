# Agency Portfolio — production deployment

Đã triển khai lên https://aibeego.com ngày 01/11/2026. Phạm vi: mẫu chuẩn `agency-portfolio`; không mở rộng biến thể.

- Xem mẫu: https://aibeego.com/lp-template-shot/agency-portfolio
- Mobile: https://aibeego.com/lp-template-shot/agency-portfolio?viewport=mobile
- Source triển khai: `f883aad6a04b2d4a5a6f950f3672a45935a5a6da`; canonical checkout `/var/www/marketingaut_usr/data/www/marketingautoaz.com`.
- Web BUILD_ID: `X-Mlpw34_-Cd5WGvdrD4M`. Trước deploy: `ylqwkoyFe-wXoslxdS819`.
- Bundle: `release-agency-f883aad-X-Mlpw34_-Cd`. Giữ các chunk hash cũ để giảm lỗi cho phiên đang mở.
- API image: `marketingaz-api:agency-portfolio-f883aad` — full shared/database/Nest build qua.
- Web production build qua với cấu hình dự án hiện hành. Cấu hình này bỏ qua kiểm tra type/lint khi build; không coi build thành bằng chứng typecheck PASS. Lần typecheck trước: 94 diagnostic, baseline 102; không thêm cặp file/mã lỗi.

## Xác minh sau deploy

- HTTPS `/login`, mẫu Agency và `/api/v1/health` trả 200.
- Chromium tại 375, 390, 768, 1024, 1440, 1920px: không tràn ngang; 4 gallery, 4 bước, 2 cách hợp tác, 4 trường; ảnh tải đủ.
- Desktop/mobile: top, width, height của cả 11 vùng khớp tham chiếu duyệt, sai số dưới 0,02 CSS px. Ảnh trong thư mục này lấy trực tiếp từ production.
- Menu mobile mở dọc và đóng khi chọn; CTA đưa tới form. Preview validation + thành công mô phỏng, không phát request lead/event.
- Foundation legacy không match mẫu mới. Bốn mẫu `agency-portfolio-form`, `clinic-booking`, `saas-trial`, `spa-wellness` vẫn chọn legacy.
- Route QA `/lp-agency-pilot` trả 404 trong production.
- Database read-only: cả 16 trang giữ nguyên hash của id/draftSpec/publishedSpec/updatedAt tại thời điểm đối chiếu. Không migration, không publish, không ghi đè spec trang người dùng.
- Helper thực tế trong API mới, dùng hàng template hệ thống hiện có: chọn `agency-portfolio-v2`; clone → sanitize → JSON mở lại giữ marker và 11 block. Không thay definition/publishedDefinition nguồn trong phép kiểm tra.
- Đã giữ web release image `marketingaz-web:agency-portfolio-f883aad` và tag `marketingaz-web:latest` để lần recreate tiếp theo có artifact mới.

## Giới hạn

Chưa có phiên đăng nhập QA thật để chạy create/autosave/clone/publish qua tenant production; chưa gửi lead thật hoặc xác minh CRM/email. Các kiểm tra builder và public form HTTP contract trước deploy dùng fixture. Chưa kiểm tra Safari/Firefox/thiết bị vật lý. Các gate tĩnh builder cũ có cùng lỗi trên baseline và bản triển khai; không báo những gate đó PASS, không sửa ngoài phạm vi để đổi kết quả. Nội dung vẫn là demo, ảnh minh họa không phải bằng chứng khách hàng.

## Hoàn tác

Backup riêng: `/var/www/aibeego_com_usr/data/backups/agency-portfolio-deploy-20261101T115057Z`. Có web bundle trước deploy, API dist/shared, image API runtime trước deploy và trạng thái release. Không đưa các hash theo ID trang vào gói bàn giao công khai.

Trước rollback cần ngừng lượt tạo mới trong cửa sổ bảo trì. Nếu chưa có trang nào lưu `agency-portfolio-v2`, có thể chạy:

```bash
node /var/www/aibeego_com_usr/data/backups/agency-portfolio-deploy-20261101T115057Z/rollback.cjs --apply --include-web
```

Script được kiểm tra cú pháp, chưa chạy rollback. Script kiểm tra marker trong các trang đã lưu và từ chối nếu đã có trang v2. Không restore DB hoặc sửa publishedSpec. Sau rollback cần xác minh health, BUILD_ID và ảnh.

Nếu đã có trang v2, phải giữ API sanitizer và renderer đọc được marker. Dừng tạo mới bằng một patch riêng đã review; không hạ toàn bộ API cũ vì sanitizer cũ có thể làm mất marker khi đọc/lưu. Không dùng git revert source như một thay thế cho kế hoạch rollback dữ liệu/render.
