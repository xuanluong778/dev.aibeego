# Sửa vùng thả và thanh thao tác không đè lên box

Đã xem video `docs/keo-element.wmv` (33,3 giây), đối chiếu ảnh nâu với ảnh xanh. Thay đổi tập trung vào bố cục thả element và thanh thao tác của Builder.

## Hành vi mới

- Vạch thả chỉ được vẽ ở khoảng trống, nằm ngoài các box và element đang hiển thị; dấu cộng được giới hạn trong vạch. Vùng đánh dấu và thao tác thả dùng cùng một bộ xác định đích.
- Thả bên trái/phải hàng thẻ tạo cột ở đúng thứ tự, giữ tiêu đề phía trên hàng. Các thẻ chia lại chiều rộng, văn bản xuống dòng, chiều cao thích nghi với nội dung.
- Thả phía trên/dưới một box chèn element trong luồng bên ngoài box đó. Thả dưới toàn bộ hàng tạo nội dung ngang dưới hàng. Thả tiếp vào một element đã chèn dùng chính element đó làm điểm neo.
- Box không chặn mất sự kiện thả từ sidebar. Luồng kéo “Văn bản” rồi chọn mẫu trong thư viện tiếp tục sử dụng điểm thả đã chọn.
- Thanh thao tác tìm khoảng trống bên phải, trái, dưới hoặc trên trong vùng canvas nhìn thấy, tránh cả box được chọn lẫn element lân cận. Khi không có vùng trống đủ chỗ, không ép thanh vào nội dung.
- Các ô native do React dựng được giữ nguyên cha–con. Không chuyển các node native sang cha khác khi chia cột, để nhân bản/xóa không gây `NotFoundError`. ID native và chỉ số cột được lưu cùng nhau; khi đổi thứ tự, vị trí hiển thị cập nhật tương ứng.
- Giữ history/autosave hiện có. Các điểm neo cũ được xử lý tương thích để không làm biến mất element khi bố cục chia lại cột. Preview có cùng định danh box để dựng đúng luồng.

## File sửa

| File trong repo | Thay đổi |
| --- | --- |
| `apps/web/src/components/landing-pages/landing-page-section-insert-target.ts` | Điểm neo toàn box/hàng/element, vùng thả tránh vật cản, tìm vị trí thanh thao tác |
| `apps/web/src/components/landing-pages/landing-page-section-elements.tsx` | Chia hàng thẻ thành cột, giữ tiêu đề ngoài hàng, giới hạn chiều rộng và cho nội dung tăng chiều cao |
| `apps/web/src/components/landing-pages/landing-page-element-vertical-toolbar.tsx` | Dùng vật cản và vùng canvas nhìn thấy để đặt thanh thao tác |
| `apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx` | Chuyển tiếp sự kiện sidebar qua box; giữ định danh box khi xem trước |
| `apps/web/src/components/landing-pages/landing-page-sidebar-drop-indicator.tsx` | Giới hạn dấu cộng trong vạch thả |
| `apps/web/src/components/landing-pages/landing-page-sidebar-dnd.ts` | Truyền ID native cùng vị trí cột trong luồng thả |
| `packages/shared/src/landing-page-canvas.ts` | Khai báo metadata ID native tùy chọn; dùng sanitizer style hiện có |
| `scripts/assert-landing-page-builder-release.cjs` | Cập nhật gate cho quy tắc đặt thanh thao tác mới |
| `scripts/test-landing-page-column-split.cjs` | Kiểm tra thanh tránh nội dung, đổi phía, không đè khi hết chỗ |
| `scripts/qa-landing-page-drop-layout-browser.cjs` | Kiểm thử trên route Builder thật với dragover/drop, history, save/reload, preview và mobile |

## Kiểm chứng

Chromium chạy trên bundle production. API QA được chặn và giả lập trong trình duyệt, lưu/tải lại dùng sanitizer thật; không ghi lên bản nháp production. Sanitizer đang chạy trong container API cũng đã được kiểm tra trực tiếp, giữ nguyên các điểm neo mới; không cần đổi API hoặc database.

- 5 vị trí: trái, phải, trên, dưới một box và dưới toàn bộ hàng. Có cả chữ, box hình và kéo mở thư viện rồi chọn mẫu như video.
- Đo hình học để xác nhận vạch, thanh thao tác, nội dung mới và các box không giao nhau; tiêu đề vẫn ngoài hàng thẻ.
- Thả tiếp dưới element đã chèn; Undo một bước chỉ bỏ lần thả sau. Undo/Redo lần thả đầu, lưu và tải lại giữ luồng; preview và mobile không đè box.
- 9 kịch bản hồi quy vùng chọn/nhóm đạt; 16 ca kéo text, căn giữa, đường gióng, Undo/Redo, sanitize/reload đạt.
- Kiểm thử column split và section elements đạt. Build Next production thành công. Typecheck toàn dự án vẫn còn lỗi nền có sẵn; không báo toàn bộ typecheck đã xanh.
- Bản sao của bản nháp cũ được tải hai lần, đủ 11 element gắn trong section, không có client exception hoặc cảnh báo preload CSS.

Release cuối: `lpb-drop-layout-safe-20261106`. Bản build dùng snapshot đang chạy cộng các file sửa trong phạm vi này; giữ nguyên những chỉnh sửa khác đang có trong working tree. Backup, patch, build log và ảnh QA: `/var/www/aibeego_com_usr/data/backups/builder-drop-layout-20261106/`.

## Kết quả cuối trên aibeego.com

Triển khai lúc **19:28 ngày 06/11/2026 (Asia/Ho_Chi_Minh)**. Chỉ thay web và reload Nginx; API, môi trường và mounts giữ nguyên.

**5/5 luồng kéo thả và 9/9 luồng hồi quy nhóm đạt, 0 lỗi JavaScript trên bản đang phục vụ từ tên miền thật.** Bộ dữ liệu kéo thả gồm bốn box đã lưu kích thước 340 × 286; chia cột không làm chữ tràn khỏi box. Nhân bản native box, đưa lên, xóa, Undo/Redo và xóa box được dùng làm điểm neo đều đã thử; element nằm ngoài box được giữ lại. Mobile xếp các cột có quản lý theo một cột đúng thứ tự.

Tải bản sao bản nháp cũ hai lần: đủ 11 element, 0 client exception và 0 cảnh báo preload CSS. Kết quả ở `production-browser/results.json`, `production-groups/results.json`, `production-legacy/results.json` trong backup. Các lần chạy trước chỉ là lịch sử gỡ lỗi; dùng những kết quả cuối này để nghiệm thu.

![Vạch thả ngoài box](artifacts/landing-page-drop-marker.png)

![Element mới và thanh thao tác nằm ngoài các box](artifacts/landing-page-drop-inserted.png)
