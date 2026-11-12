# Giao diện Hiệu ứng chuyển động theo ảnh — 10/11/2026

Đã cập nhật tại https://aibeego.com, bản `lpb-motion-ui-20261110`.

- Lưới 8 preset, 2 cột: Không hiệu ứng, Hiện dần, bốn hướng trượt, Phóng to và Thu nhỏ. Icon dùng bộ Lucide hiện có.
- Ô được chọn có viền và dấu tick màu mint; thao tác chọn dùng radio native để hỗ trợ bàn phím.
- “Kích hoạt” thành hai lựa chọn cạnh nhau; lựa chọn hiện tại có nền mint.
- Thời lượng/Độ trễ nằm cùng hàng, có đơn vị ms; nút Chạy thử toàn chiều ngang.
- Hiển thị ngữ cảnh dễ đọc như “Hero / Tiêu đề”, không đưa ID kỹ thuật vào nội dung giao diện.
- Accordion hiệu ứng mở sẵn; kiểu hiển thị mặc định của các accordion khác được giữ nguyên.
- Không hiệu ứng vẫn xóa cấu hình; timing và chạy thử bị vô hiệu hóa khi chưa có preset. Lock, commit số khi blur/Enter, Undo/Redo và cơ chế chạy thử được giữ nguyên.

## Kiểm tra thực tế

- Panel Chromium: lưới hai cột, một trạng thái chọn, timing cùng hàng, keyboard radio, khóa, không tràn ở bề rộng 320/280 px: PASS.
- Hồi quy dữ liệu motion: 8 nhóm hành vi sanitize/lưu/nhân bản/Undo/publish/import: PASS.
- Build Next production và gate source/bundle Builder: PASS. Dùng cấu hình build hiện có.
- Builder đầy đủ trên container QA và domain production với API fixture: PASS cho tiêu đề/ảnh/thẻ/nút/icon, Inspector riêng của nút/icon, chạy thử không autosave, xóa/Undo/Redo và mở lại; không có lỗi JavaScript.
- Trang public trước/sau deploy: ảnh 1440 × 5113 trùng pixel sau khi cố định thời gian/animation và giải mã ảnh lazy-load.
- Fingerprint 27 landing page và 200 template trước/sau khớp; không ghi draft/publishedSpec thật, không migration.
- Chỉ deploy web; API, environment và mount giữ nguyên.

## File thay đổi

- `apps/web/src/components/landing-pages/landing-page-motion-panel.tsx`
- `apps/web/src/components/landing-pages/landing-page-inspector-ui.tsx` — thêm tùy chọn style/chevron, giữ default cho nơi dùng khác.
- `scripts/qa-landing-page-motion-browser.cjs` — kiểm tra radio cards và hỗ trợ chạy riêng panel.
- `docs/landing-page-motion-ui-20261110.md` — báo cáo này.

[Ảnh giao diện trên production](/var/www/aibeego_com_usr/data/backups/landing-page-motion-ui-20261110/production-ui/motion-panel.png).

Evidence: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-ui-20261110/` gồm `final-summary.json`, `production-ui/report.json`, `production-http.json`, `public-parity.json`, log build/test và ảnh trước/sau. Source release đầy đủ ở `release-source/` trong cùng thư mục.

Rollback web: image `marketingaz-web:lp-motion-20261110`, compose trước đổi ở `compose-before.yml` trong evidence. Safari/Firefox và so khớp screenshot trên toàn bộ template catalog chưa được kiểm tra trong thay đổi UI này.
