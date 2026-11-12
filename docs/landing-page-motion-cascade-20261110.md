# Chuyển động nối đuôi theo viewport — 10/11/2026

Đã deploy tại https://aibeego.com. Build `lpb-motion-cascade-20261110`.

## Thay đổi

- Thay việc IO gọi chạy ngay từng target bằng hàng đợi riêng cho từng vùng cuộn. Gộp thông báo IO trong một frame rồi xếp thứ tự theo vị trí thiết kế thực tế: trên xuống dưới; cùng hàng thì trái sang phải. Không phụ thuộc thứ tự lưu JSON/ID hay thứ tự DOM.
- Các phần tử cùng hàng có khoảng lệch nhịp theo thời lượng; hàng dưới chỉ nối vào đoạn cuối của hàng trên. Không bắt đầu tất cả trong cùng một frame và không kết thúc đồng loạt.
- Tính lại thời điểm chạy tiếp theo từng bước, giữ khoảng cách giữa các lần kết thúc kể cả khi người dùng đặt thời lượng/độ trễ khác nhau. Giữ nguyên thanh Nhanh–Chậm, duration/delay đã lưu và biên độ 56–96 px.
- Dùng opacity với nhịp ease nhẹ và chuyển động với `cubic-bezier(.22,1,.36,1)` để phần di chuyển có đoạn giảm tốc dài hơn. Không thêm wrapper hoặc thay đổi transform thiết kế.
- Phần tử đang chờ mà rời viewport vẫn được theo dõi và chưa bị đánh dấu đã chạy. Khi cuộn trở lại mới tiếp tục; không chạy dồn những target đã cuộn qua. Chuyển động ở viewport cũ không giữ chân viewport mới.
- Kiểm tra phần tử đang chạy còn trong viewport bằng vị trí thiết kế, tránh việc chính translation của hiệu ứng làm mất khoảng lệch nhịp ở mép màn hình.
- Nếu cả section/thẻ và chữ bên trong đều có cấu hình, target con chờ target cha hoàn tất; tránh hai chuyển động cùng cộng dồn lên chữ.
- Control đã có focus không vào hàng đợi. Focus/click vào target đang chờ sẽ hiện ngay và bỏ qua lượt chạy đó. Reduced motion, đóng preview hoặc unmount dọn timer/frame/observer và khôi phục mọi target đang chờ.
- Chỉ preview/public tự chạy theo hàng đợi. Thao tác nhấp preset hoặc xác nhận tốc độ trong Inspector vẫn chạy thử riêng target ngay, không phát sinh history ngoài thao tác thay đổi cấu hình đã có.
- Không đổi schema, API, dữ liệu draft/publishedSpec, template JSON, clone/remap, lock, revision, autosave hay Undo/Redo. Luồng HTML import và các animation cũ giữ riêng.

## Kiểm thử thực tế

- Strict TypeScript cho runtime với type shared thật: PASS (`runtime-typecheck.log`). Next production build và source/bundle gate: PASS. Next vẫn dùng cấu hình release sẵn có, bỏ qua lint/typecheck toàn bộ web; không tuyên bố hai kiểm tra đó đã pass.
- 9 nhóm hồi quy lưu/sanitize/clone/remap, Undo/Redo/revision/lock/autosave, publish và template JSON import/export: PASS.
- 19 nhóm browser hiện có: PASS; gồm 11 preset × 3 màn hình (1440/820/390), 26 target native, tốc độ, viewport window/scroller lồng, giảm chuyển động, form focus, cleanup, giữ transform/timeline cũ, không tràn ngang và ảnh thiết kế khôi phục đúng.
- 9 nhóm kiểm thử mới cho cascade: PASS:
  - Đảo thứ tự DOM và JSON nhưng thứ tự chạy/kết thúc vẫn đúng vị trí trên trang.
  - Các thời điểm bắt đầu/kết thúc khác nhau; hàng sau nối vào đoạn cuối của hàng trên.
  - Target gần mép viewport vẫn giữ lệch nhịp khi translation tạm thời đưa hình vẽ ra ngoài vị trí gốc.
  - Duration/delay khác nhau vẫn giữ thứ tự kết thúc.
  - Cuộn nhanh không tiêu tốn target ngoài viewport; quay lại chạy đúng một lần, không chạy bù đồng loạt.
  - Focus vào control đang chờ hiện ngay; control đã focus từ trước không bị đưa vào hàng đợi.
  - Section và chữ lồng nhau không chạy chồng transform.
  - Cleanup/reduced motion hủy lịch còn chờ và khôi phục hiển thị.
  - Renderer public và preview thật: sáu thẻ chạy nối đuôi; ảnh sau khi kết thúc trùng pixel với thiết kế không hiệu ứng.
- Builder đầy đủ trên container QA và domain thật: 12 nhóm kiểm tra PASS, gồm 19 target, lưu/mở lại, sửa chữ, xóa/Undo/Redo, slider một commit/autosave mỗi thao tác; fullscreen preview bản compiled có các lần bắt đầu lệch nhau, không sửa draft/history và dọn sạch hàng đợi khi đóng. Không lỗi JavaScript. API fixture được intercept; không sửa draft thật.
- Production: 7 endpoint và 47 tài nguyên trả trạng thái mong đợi; Google client config được giữ. Chỉ thay image web; API không restart, environment/mount không đổi; không migration.
- Trang public mẫu: đối chiếu image trước deploy và image mới trên cùng dữ liệu hiện tại, cố định thời gian/animation và chờ font/ảnh, trùng byte ở 1440 × 5113.

## File thay đổi

- `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts`
- `scripts/qa-landing-page-motion-cascade-browser.cjs`
- `docs/landing-page-motion-cascade-20261110.md`

Mã đã đồng bộ giữa repository đang mở, nguồn release và canonical; các file chức năng khác được giữ nguyên.

## Giới hạn

Chưa đo FPS trên thiết bị thật, chưa kiểm tra Safari/Firefox, toàn bộ catalog template cũ hoặc gửi form thật. Không thay đổi logic kéo/resize/xoay; kiểm thử motion xác nhận khôi phục hình học/transform, chưa bao phủ toàn bộ gesture trên mọi loại phần tử.

## Evidence và rollback

Evidence: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-cascade-20261110/`.

Kết quả chính: `motion-tests.log`, `runtime-typecheck.log`, `browser-final/results.json`, `cascade-qa/results.json`, `cascade-qa/visual-order.json`, `ui-qa/report.json`, `production-ui/report.json`, `production-http.json`, `public-parity.json`, `rollout.json`. Ảnh fullscreen đang chạy: `production-ui/fullscreen-cascade.png`.

Rollback riêng web: `marketingaz-web:lp-motion-smooth-20261110`; compose trước thay đổi ở `compose-before.yml`. API giữ `marketingaz-api:lp-motion-compact-20261110`.
