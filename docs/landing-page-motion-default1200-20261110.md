# Mặc định hiệu ứng 1.200 ms — 10/11/2026

Đã deploy tại https://aibeego.com. Build `lpb-motion-default1200-20261110`.

- Mọi hiệu ứng được chọn mới mặc định 1.200 ms; thanh Tốc độ và ô Thời lượng cùng lấy giá trị từ `LP_MOTION_DEFAULTS`.
- Khi cấu hình hợp lệ thiếu duration hoặc duration sai kiểu/không hữu hạn, shared sanitizer mặc định về 1.200 ms. Web và API dùng cùng mặc định.
- Giữ các duration hợp lệ đã lưu, kể cả 450 ms từ bản cũ. Không cập nhật hàng loạt dữ liệu. Người dùng có thể kéo về Nhanh hoặc nhập 150–1.200 ms; đổi preset vẫn giữ tốc độ đã tự chỉnh.
- Chọn Không hiệu ứng xóa đúng cấu hình; khi chọn mới lại sẽ dùng 1.200 ms. Không đổi độ trễ, nhịp nối đuôi, viewport, lock, Undo/Redo, autosave hoặc thiết kế landing page.

## Kiểm thử

- Shared TypeScript build: PASS.
- 10 nhóm unit/hồi quy: PASS, gồm mặc định 1.200 ms, thiếu timing, giữ giá trị nhanh hơn và các luồng lưu/clone/Undo/publish/template import/export.
- API image thật, chạy offline không network: mặc định 1.200 ms và fallback đúng; giá trị hợp lệ 150/450/650/957/1.200 ms được giữ: PASS.
- Next production build và source/bundle gate Builder: PASS. Dùng cấu hình release hiện có, không chạy lint/typecheck toàn bộ web.
- Full Builder trên container QA: 19 đối tượng chưa cấu hình đều hiện 1.200 ms ở hai control và lưu đúng; xóa/Undo/Redo, slider, mở lại, sửa chữ và fullscreen chạy nối đuôi: PASS, không lỗi JavaScript.
- Smoke trên domain thật: hiệu ứng mới hiện/lưu 1.200 ms; chỉnh 600 ms rồi đổi preset, lưu và mở lại vẫn 600 ms: PASS. API fixture được intercept, không ghi draft thật.
- 7 endpoint, 47 tài nguyên và builder build ID: PASS. Environment và mount giữ nguyên; không migration. Chỉ thay hai image web/API, API chỉ cập nhật module shared motion.

## File thay đổi

- `packages/shared/src/landing-page-motion.ts`
- `apps/web/src/components/landing-pages/landing-page-motion-panel.tsx`
- `scripts/test-landing-page-motion.cjs`
- `docs/landing-page-motion-default1200-20261110.md`

Nguồn được đồng bộ giữa repository đang mở, release và canonical. Chưa kiểm tra lại Safari/Firefox hay thiết bị thật trong thay đổi mặc định này; runtime chuyển động không được sửa.

Evidence: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-default1200-20261110/`, gồm `motion-tests.log`, `api-default-qa.json`, `ui-qa/report.json`, `production-ui/report.json`, `production-http.json`, `rollout.json` và log build.

Rollback: web `marketingaz-web:lp-motion-cascade-20261110`; API `marketingaz-api:lp-motion-compact-20261110`. Compose trước triển khai ở `compose-before.yml`.
