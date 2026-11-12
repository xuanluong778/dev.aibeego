# Nâng cấp chuyển động rõ và mềm hơn — 10/11/2026

Đã deploy tại https://aibeego.com, build `lpb-motion-smooth-20261110`.

## Hành vi mới

- Trượt từ 14 px lên 56–96 px theo bề rộng canvas/vùng nhìn thực tế; hướng chéo có cùng tổng biên độ. Phóng to từ 82% về 100%; Thu nhỏ từ 118% về 100%.
- Nhịp `cubic-bezier(.22,.1,.22,1)` bắt đầu nhẹ và giảm tốc về vị trí thiết kế, không nảy quá đích. Chỉ animate opacity/translate/scale, không animate kích thước hoặc transform thiết kế.
- Thêm thanh Tốc độ với hai đầu Nhanh–Chậm. Phạm vi 150–1.200 ms, đồng bộ ô Thời lượng, giữ độ chính xác 1 ms. Thời lượng càng lớn càng chậm. Có thể thử khoảng 700–1.000 ms để thấy chuyển động thong thả hơn.
- Giữ mặc định 450 ms, trễ 0 ms và mọi thời lượng đã lưu. Không đổi schema, không tự ghi lại cấu hình cũ.
- Kéo slider chỉ đổi state của panel; xác nhận khi thả chuột/nhả phím/rời control. Mỗi thao tác tạo một bước Undo và một lần autosave, sau đó chạy thử tốc độ mới. Focus/blur không làm tròn hoặc sửa giá trị nhập tay như 957 ms.
- Giữ 12 icon/4 cột, tooltip và cơ chế nhấp preset để chạy lại; không thêm lại nút Chạy thử hoặc nút kích hoạt.
- Observer theo vùng cuộn thực của preview/public; chừa khoảng 10% chiều cao ở mép dưới (16–80 px) để không tiêu tốn hiệu ứng ngay khi phần tử mới chạm mép màn hình. Chạy một lần mỗi lượt xem.
- Chỉ sau khi JS và IO hoạt động, target có cấu hình mới được đặt vào trạng thái chờ bằng opacity. Giữ nguyên hình học để observer đo đúng vị trí, bỏ trạng thái chờ trước khi đọc opacity thiết kế và chạy. Không còn nháy hiện sẵn rồi đột ngột biến mất khi cuộn tới.
- Focus hoặc tương tác vào CTA/form khôi phục hiển thị ngay; reduced motion, thiếu IO và cleanup vẫn giữ nội dung bình thường. SSR không xuất trạng thái chờ nên HTML vẫn hiện khi JS chưa chạy.
- Clip phần tràn tạm thời trong lúc chạy để chuyển động lớn của section cuối không kéo dài document rồi làm thanh cuộn giật khi kết thúc. Header sticky giữ nguyên vị trí. Khi kết thúc khôi phục animation/style cũ, gồm transform kéo/resize/xoay/lật và `animation-timeline: view()`.

## Kiểm thử thực tế

- 9 nhóm hồi quy lưu cấu hình, sanitize, clone/remap, Undo/Redo, revision/lock/autosave, publish và template JSON import/export: PASS.
- 19 nhóm browser: PASS. Gồm 11 preset × desktop/tablet/mobile (1440/820/390), 26 target native, ảnh fixture trước/sau/fullscreen/public trùng pixel, không tràn ngang, keyboard/form/reduced motion/thiếu IO/cleanup và tương thích animation timeline cũ.
- Đo vị trí DOM ở các thời điểm animation: biên độ 56–96 px; cùng một thời điểm thì cấu hình chậm còn quãng đường lớn hơn; tiến về đích đơn điệu, không vượt đích và không lệch bố cục sau khi kết thúc: PASS.
- Cuộn trong scroller lồng và window: mới vào 20 px ở mép dưới chưa chạy, cuộn sâu hơn mới bắt đầu; không flash trước entry; sau khi chạy nội dung hiện đúng và cuộn lại không chạy lần hai: PASS.
- Thay reduced-motion khi đang chờ hoặc unmount: gỡ opacity chờ: PASS.
- Hiệu ứng lớn ở section cuối: scrollHeight trước/trong/sau không đổi; vị trí header sticky không đổi: PASS. Probe ban đầu đã phát hiện và sửa lỗi tăng scrollHeight tạm thời.
- Slider chuột/bàn phím: đồng bộ số, chạy thử tự động, không tạo history trong khi đang kéo, commit một lần, giữ giá trị lẻ khi focus/blur: PASS. Panel 320/280 px không tràn ngang.
- Full Builder trên container QA và domain thật: 19 target độc lập, autosave, xóa/Undo/Redo, mở lại và sửa chữ: PASS. Kiểm tra mới cho slider gồm End → 1.200 ms, Undo về 950 ms, Redo, kéo chuột chỉ autosave một lần và mở lại giữ đúng tốc độ: PASS. Không lỗi JavaScript. API fixture được intercept; không sửa draft thật.
- Next production build và source/bundle gate: PASS. Build dùng cấu hình release sẵn có, bỏ qua lint/typecheck toàn bộ web; không tuyên bố hai kiểm tra này pass.
- Production: 7 endpoint và 47 tài nguyên trả trạng thái mong đợi; Google client build config được giữ; API không restart, environment và mount không đổi; không migration.
- Đối chiếu public mẫu bằng image production cũ và image mới trên cùng dữ liệu hiện tại, cố định thời gian/animation, chờ fonts và decode ảnh: trùng byte ở 1440 × 5113. Ảnh live chụp đầu tiên khác một số card; cả ảnh đầu và phép đối chiếu có kiểm soát được giữ làm evidence, không quy kết nguyên nhân của khác biệt ban đầu.

## File thay đổi

- `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts`
- `apps/web/src/components/landing-pages/landing-page-motion-panel.tsx`
- `scripts/qa-landing-page-motion-browser.cjs`
- `docs/landing-page-motion-smooth-20261110.md`

Ba file motion được đồng bộ vào repository đang mở, bản nguồn release và canonical; không ghi đè các file chức năng khác. Luồng HTML import, shared schema và API giữ nguyên.

## Giới hạn kiểm tra

Chưa đo FPS trên thiết bị thật, chưa kiểm tra Safari/Firefox, toàn bộ catalog template cũ hoặc gửi form thật. Đã kiểm tra bề mặt transform và khôi phục trạng thái thiết kế; chưa nghiệm thu toàn bộ thao tác kéo/resize/xoay bằng chuột trên mọi loại phần tử.

## Evidence và rollback

Evidence: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-smooth-20261110/`.

Các kết quả cuối: `motion-tests.log`, `browser-final/results.json`, `ui-qa/report.json`, `production-ui/report.json`, `production-http.json`, `public-parity.json`, `rollout.json`. Ảnh giao diện: `production-ui/motion-panel.png`.

Rollback riêng web bằng image `marketingaz-web:lp-motion-compact-20261110-v2`, compose trước deploy ở `compose-before.yml`. API giữ `marketingaz-api:lp-motion-compact-20261110`.
