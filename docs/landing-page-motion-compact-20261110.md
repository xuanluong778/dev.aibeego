# Hiệu ứng chuyển động gọn — 10/11/2026

Đã deploy tại https://aibeego.com. Build `lpb-motion-compact-20261110-v2`.

## Kết quả

- 12 lựa chọn tổng cộng: Không hiệu ứng, Hiện dần, bốn hướng trượt, Phóng to, Thu nhỏ và bốn hướng trượt từ góc. Lưới 4 cột, 3 hàng; ô cao 48 px, chỉ có icon. Tên hiện khi hover hoặc dùng bàn phím.
- Bỏ nút Chạy thử và hai nút kích hoạt. Chọn preset tự chạy thử đúng đối tượng; nhấp lại preset đang chọn chạy lại mà không ghi draft hay tạo Undo. Chạy thử dùng độ trễ 0, không đổi độ trễ đã lưu.
- Public và fullscreen preview mặc định chạy một lần khi đối tượng đi vào viewport của vùng cuộn thực tế. Dữ liệu trigger `load` cũ được chuẩn hóa thành `scroll`.
- Panel chung theo selection hiện tại, gồm các nhánh Inspector riêng của nút và icon. Hỗ trợ section, chữ, ảnh, thẻ và chữ trong thẻ, nút, icon, ô lưới, khung ảnh, video, ô đếm ngược và form. Header/form/nút chỉ chạy nếu người dùng cấu hình rõ ràng. HTML import giữ luồng riêng.
- Thời lượng mặc định 450 ms, trễ 0 ms; giới hạn 150–1.200 và 0–400 ms. Commit số bằng Enter/blur một lần. Không hiệu ứng xóa đúng target. Giữ lock, revision, autosave, Undo/Redo và remap ID khi nhân bản.
- Chữ inline trên public bám vào khung chữ hiện có (kể cả DIV), không kéo theo icon hoặc field khác. Chuyển động dùng opacity/translate/scale, không thêm wrapper hoặc đổi bố cục. Đọc toàn bộ computed animation trước khi ghi style để tránh tính lại style từng thuộc tính. Khôi phục khai báo animation cũ sau khi chạy, gồm `animation-timeline: view()`.
- Không có IO hoặc bật giảm chuyển động: nội dung vẫn hiện bình thường. Focus vào CTA/form hủy chuyển động đang chạy để thao tác ngay.

## Kiểm thử thực tế

- Shared TypeScript build, Next production build, source/bundle gate Builder: PASS. Next dùng cấu hình release hiện có, bỏ qua lint và kiểm tra type toàn bộ web; không tuyên bố hai kiểm tra đó đã pass.
- 9 nhóm hồi quy: local key, sanitize, 11 preset, target native, giới hạn số, style cũ, lưu/mở lại, remap clone, Undo/Redo/revision/lock, publish/version và template JSON ZIP export/import: PASS.
- Chromium: 11 preset × 3 bề rộng 1440/820/390 px; không tràn ngang; ảnh ban đầu/sau hiệu ứng/fullscreen/public của fixture trùng pixel: PASS.
- 26 target native được tìm và chạy độc lập, đồng thời kiểm tra bề mặt DOM hỗ trợ translate/scale (gồm chữ tin cậy và tên/giá gói); viewport vùng cuộn, chạy một lần, reduced motion, thiếu IO, focus form, cleanup observer và transform/timeline cũ: PASS.
- Panel tại bề rộng 320/280 px: 12 icon/4 cột, tooltip, keyboard, khóa, timing commit, replay không phát sinh history: PASS.
- Builder đầy đủ trên container QA và domain production: 19 target, không cần đổi tab để thấy panel, hiệu ứng độc lập được autosave, xóa/Undo/Redo, mở lại và sửa chữ: PASS. API được intercept bằng fixture; không sửa draft thật. Không có lỗi JavaScript.
- Production: 7 endpoint và 47 tài nguyên JS/CSS trả trạng thái mong đợi. Google client build config được giữ. API health 200; assistant vẫn yêu cầu đăng nhập (401). Environment và mount web/API không đổi; không migration.
- Trang public `phan-mem-truc-tuyen`: ảnh từ image production cũ và image mới, cùng dữ liệu hiện tại, cố định thời gian/animation và decode ảnh lazy-load, trùng byte (1440 × 5113). Ảnh live chụp ban đầu có ngắt dòng tiêu đề khác, nên giữ lại làm evidence và dùng phép đối chiếu có kiểm soát này để nghiệm thu.
- Số lượng 27 landing page / 200 template giữ nguyên. Các bài QA không ghi dữ liệu thật. Hash dữ liệu trước/sau chưa đối chiếu được vì phép fingerprint ban đầu chưa tái lập; không tuyên bố hash khớp.

## File thay đổi

- `scripts/qa-landing-page-motion-browser.cjs`
- `scripts/test-landing-page-motion.cjs`
- `apps/web/src/components/landing-pages/landing-page-motion-panel.tsx`
- `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts`
- `apps/web/src/components/landing-pages/landing-page-builder.tsx`
- `apps/web/src/components/landing-pages/landing-page-countdown.tsx`
- `packages/shared/src/landing-page-motion.ts`
- `apps/web/src/components/landing-pages/landing-page-renderer.tsx`
- `docs/landing-page-motion-compact-20261110.md`

Mã motion đã đồng bộ vào repository đang mở và bản nguồn canonical. Thay đổi kéo ô đếm ngược có sẵn trong canonical được giữ nguyên khi ghép metadata motion; không ghi đè thay đổi đó.

## Chưa xác minh

Safari/Firefox, thiết bị thật/FPS, toàn bộ catalog template cũ có lpBgMotion/imageStyle.motion/Custom CSS và gửi form thật. Đã xác minh transform/timeline được giữ, phần tử đứng yên khi chỉnh bình thường và kéo card bằng chuột có hiệu ứng. Probe resize/xoay bổ sung chưa đạt assertion về kích thước trong fixture, nên chưa nghiệm thu đầy đủ luồng resize/xoay; kết quả probe được giữ ở `gesture-qa/report.json`. Các file xử lý kéo/resize/xoay không được chỉnh trong thay đổi này.

## Evidence và rollback

Evidence: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-compact-20261110/`.

Các file chính: `motion-tests.log`, `browser-v2/results.json`, `ui-final/report.json`, `production-final/report.json`, `production-http-final.json`, `public-parity.json`, `rollout-final.json`; ảnh panel ở `production-final/motion-panel.png`. Log failed đầu tiên được giữ cùng các lần chạy pass cuối để truy vết.

Rollback web: `marketingaz-web:lp-motion-ui-20261110`; API: `marketingaz-api:lp-motion-20261110`. Compose trước deploy ở `compose-before.yml`. Chỉ hai image web/API được thay; không thay schema hoặc dữ liệu.

Bước cập nhật cuối chỉ thay web sang image `marketingaz-web:lp-motion-compact-20261110-v2`, API giữ image compact đã kiểm thử. Có thể rollback riêng bước này bằng `compose-before-final.yml`; bản trước bước cuối vẫn được giữ.
