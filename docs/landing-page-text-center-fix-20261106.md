# Sửa box text bị kéo trở lại bên phải — 06/11/2026

Trạng thái: **đã triển khai production https://aibeego.com** sau khi người dùng xác nhận “Cho phép triển khai ngay”. Web/API đã ready, Nginx kiểm tra và reload thành công. Kiểm tra live: 3 route HTML đúng BUILD_ID, 45 JS/CSS HTTP200, API health200, API sanitizer giữ offset -740px và runtime env web/API giữ nguyên. Bằng chứng: `production-deployment.json` trong thư mục backup.

Nguyên nhân: `resolveFreeSurface` chọn free-surface con trước khi xét text layer tự do. Text trong cột phải bị clamp vào chính cột; text layer tự do cũng bị giới hạn bởi container của nó. Giới hạn offset ngang 640px ở renderer/getter/sanitizer tiếp tục làm mất vị trí hợp lệ khi di chuyển trên canvas rộng.

Bản sửa:

- Text layer tự do ưu tiên canvas chứa nó; text trong section dùng section làm vùng kéo và gióng. Offset vẫn tính từ vị trí flow gốc.
- Element offset ngang được lưu/render nhất quán tới ±2400px qua `ELEMENT_FREE_MAX_X_PX`. Giữ giới hạn dọc hiện hữu và getter riêng cho card.
- Đồng bộ bốn file source vào canonical `/var/www/marketingaut_usr/data/www/marketingautoaz.com` và mirror `/var/www/aibeego_com_usr/data/www/aibeego.com`.

Kiểm tra:

- Tái hiện trước sửa: kéo box từ x850 về x460 ở zoom 100%/75% vẫn bị ép trở lại x850. Sau sửa giữ đúng x460.
- 16/16 ca Chromium đạt, kéo trực tiếp và bằng nút Di chuyển; dùng `InlineEditable`, toolbar, hook kéo và handler commit thật; text trong cột/text layer tự do, canvas 1200/2000px, zoom 100%/75%; căn tâm và guide, thả, một bước history, Undo/Redo, sanitize/lưu/reload. Script: `scripts/test-landing-page-text-center-drag-browser.cjs`.
- Shared TypeScript build và section ownership/column/history/persist regression đạt. Production Next build đạt.
- Web typecheck toàn dự án vẫn lỗi nền: 101 diagnostic so với log nền 97; bốn diagnostic thêm đều thuộc generated Next route types. Không có cặp file source/error-code mới. Chi tiết `typecheck-comparison.json`.
- Test chuỗi cũ `test-landing-page-free-drag-move-size.cjs` có gate `CHILD_LAYOUT_PRESERVED` lỗi cả trên HEAD trước sửa do thiếu chuỗi comment; không xem gate này là đạt. Kiểm tra kích thước/vị trí dùng component Chromium thật.
- Web candidate khởi động network none, đúng BUILD_ID và 41 JS/CSS trả HTTP200; API candidate network none giữ offset -740px qua persist sanitizer. Không sửa/publish draft production.

Artifact/backup: `/var/www/aibeego_com_usr/data/backups/text-center-fix-20261106/`.

- Web image: `marketingaz-web:text-center-fix-20261106`.
- API image: `marketingaz-api:text-center-fix-20261106` (kế thừa image hiện hành, chỉ thay hai module shared).
- BUILD_ID: `lpb-text-center-fix-20261106`.
- Production trước sửa/rollback: web/API `text-columns-3836ab4-20261105`.
- Có backup compose và source, runtime snapshot private, browser results và log build. Đã đổi đúng hai image, recreate riêng web/API, kiểm tra health rồi reload Nginx; kiểm tra HTML/build manifest/assets/API và runtime env không đổi. Nếu không ready, khôi phục compose cũ và hai image cũ; không restore DB.
