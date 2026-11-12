# Menu chuột phải và nhóm phần tử trên Landing Page Builder

Nguồn triển khai: repo Linux `/var/www/marketingaut_usr/data/www/marketingautoaz.com`, nền `c670b57`, giữ các bản sửa kéo text và lỗi DOM đã có. Đường dẫn Windows trong yêu cầu không được mount trong phiên làm việc này.

## Thay đổi

- Menu tối, hàng đồng nhất, lệnh đầu màu cam theo ảnh: chọn phần tử trong box / Nhóm / Bỏ nhóm. Lớp và Căn chỉnh dùng submenu. Xóa nằm cuối, có phân cách và màu đỏ. Dán chỉ xuất hiện khi clipboard tương thích.
- Chọn đúng box gần nhất, loại box chứa và phần tử ngoài box, khóa hoặc ẩn. Chuột phải giữ vùng chọn khi bấm thành viên; chuyển vùng chọn khi bấm phần tử khác.
- Nhóm có ID và danh sách thành viên ổn định; một khung chung. Kéo cập nhật cùng một độ dịch cho các thành viên, giữ giới hạn box và giới hạn tọa độ hiện có. Escape hủy kéo. Nhóm/Bỏ nhóm/kết thúc kéo/thay đổi thuộc tính chung dùng history của Builder.
- Sidebar chỉ hiện thuộc tính chung. Hai văn bản có thể đổi màu, cỡ chữ và căn chữ cùng lúc. Nhóm có ảnh/nút không hiện các thuộc tính chỉ dành cho văn bản.
- AI nhập nhanh, AI viết lại, Sửa text, Sao chép kiểu và Dán kiểu chuyển sang sidebar trong ngữ cảnh văn bản. Dán kiểu không sao chép metadata nhóm, thứ tự lớp hoặc tọa độ của bản sao.
- Nhóm, lớp và tọa độ bản sao lưu qua style metadata hiện có; không đổi API hay cơ sở dữ liệu. Nhóm hỗ trợ các phần tử có cơ chế kéo tự do hiện có trong cùng box; container/card không có khả năng này không được gán lệnh Nhóm giả.

## File chính

| File | Nội dung |
| --- | --- |
| `apps/web/src/components/landing-pages/landing-page-canvas-context-menu.tsx` | Menu theo vùng chọn, chọn đúng field, bỏ lệnh trùng, popover AI dùng chung |
| `apps/web/src/components/landing-pages/landing-page-builder.tsx` | Handler chọn, nhóm, clipboard, lớp, thuộc tính chung, history, inspector |
| `apps/web/src/components/landing-pages/landing-page-canvas-groups.ts` (mới) | Box gần nhất, lọc phần tử, metadata nhóm, tọa độ và giới hạn |
| `apps/web/src/components/landing-pages/landing-page-group-selection.tsx` (mới) | Khung chung, kéo nhóm, hủy kéo, inspector vùng chọn |
| `apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx` | Selection chrome, khóa, layer, ẩn toolbar riêng khi chọn nhiều |
| `apps/web/src/components/landing-pages/landing-page-section-elements.tsx` | Bản sao không làm xô lệch luồng bố cục; giữ ảnh có thể kéo |
| `apps/web/src/components/landing-pages/landing-page-blank-starter-block.tsx` | Chrome cho toàn bộ nút để nền và chữ di chuyển cùng nhau |
| `apps/web/src/components/landing-pages/landing-page-section-insert-target.ts` | Neo bản sao sau toàn bộ chrome của nút, không trở thành con của nút gốc |
| `apps/web/src/components/ui/context-menu.tsx` | Portal submenu để tránh bị cắt, collision của Radix |
| `packages/shared/src/landing-page-canvas.ts` | Khai báo metadata bổ sung, không đổi schema runtime |
| `scripts/test-landing-page-canvas-context-menu.cjs` | Kiểm thử field, metadata, sanitizer, AI contract |
| `scripts/helpers/landing-page-source-harness.cjs` | Cập nhật harness Undo cho pending clone |
| `scripts/qa-landing-page-canvas-groups-browser.cjs` (mới) | Kịch bản Chromium trên route Builder thật |

## Kiểm thử

Chạy Chromium bằng chuột/bàn phím trên route Builder và bundle production. API trong bộ kiểm thử được chặn và giả lập tại trình duyệt; lưu/tải lại dùng sanitizer thật và revision receipts trong bộ nhớ. Không gửi bản nháp hoặc lệnh ghi QA đến API production. Kiểm tra bổ sung trực tiếp sanitizer đang chạy trong container API production cho cả `sanitizeLandingPageSpec` và `sanitizeLandingPagePersistSpec`: giữ nguyên nhóm, lớp và tọa độ.

Kết quả cuối cùng và ảnh nằm trong thư mục backup `context-menu-groups-20261106/acceptance-browser` và `production-browser` trên máy chủ. Các lần thử trước đó chỉ là lịch sử gỡ lỗi; dùng kết quả cuối để nghiệm thu.

Kết quả cuối trên `https://aibeego.com`: **9/9 kịch bản đạt, 0 lỗi JavaScript**.

| Kịch bản chạy thực tế | Kết quả |
| --- | --- |
| Box có tiêu đề, đoạn văn, nút; phần tử bên ngoài | Chọn đúng 3 phần tử, không chọn box chứa hoặc phần tử ngoài |
| Nhóm đầu menu, kéo, Undo/Redo, lưu/tải lại, kéo tiếp, Escape hủy kéo, bỏ nhóm | Đạt; lần kéo đầu dịch khoảng 50 × 15 px; khoảng cách tương đối và phần tử ngoài giữ nguyên |
| Hai văn bản đổi màu chung | Cả hai đổi màu, một Undo khôi phục cả hai, Redo áp dụng lại |
| Lệnh chuyển sang sidebar | Cả 5 lệnh truy cập được; chạy sửa text, sao chép/dán kiểu và gợi ý AI giả lập đúng schema |
| Phần tử khóa/ẩn; chuột phải thành viên hoặc phần tử ngoài | Lọc đúng; khóa/mở khóa cả nhóm; giữ hoặc chuyển vùng chọn đúng đối tượng |
| Box lồng nhau | Chỉ chọn 2 phần tử trong card gần nhất, bỏ card chứa và card bên cạnh |
| Lớp, bản sao, copy/paste, xóa cả nhóm | Giữ lớp khi bỏ nhóm; chỉ nhân bản thành viên đã chọn; một Undo khôi phục nhóm bị xóa |
| Vùng trống, clipboard và nhóm có ảnh/chữ/nút | Clipboard rỗng không có Dán; vùng trống chỉ có Dán phù hợp; nhóm hỗn hợp không hiện typography; ảnh và cả nền nút kéo cùng nhau; bản sao ảnh độc lập với nút gốc |
| Menu sát mép dưới/phải, submenu, Escape, click ngoài | Trong viewport ở 1542 × 550 và 1060 × 700; không cần cuộn menu |

Kiểm tra thêm bản sao của bản nháp đã báo lỗi: tải hai lần, mỗi lần đủ **11 phần tử gắn trong section**, không có client exception hoặc cảnh báo preload CSS.

![Menu một phần tử](artifacts/landing-page-context-menu-single.png)

![Menu vùng chọn nhiều](artifacts/landing-page-context-menu-multiple.png)

![Menu nhóm](artifacts/landing-page-context-menu-group.png)

Triển khai lúc **15:26 ngày 06/11/2026 (Asia/Ho_Chi_Minh)**, release `lpb-context-menu-groups-20261106`. Chỉ thay image web, giữ nguyên container API, biến môi trường và mounts; Nginx kiểm tra cấu hình và reload thành công. Có bản image và compose cũ để hoàn tác trong backup trên máy chủ.

Kiểm thử hồi quy: `test-landing-page-canvas-context-menu.cjs`, `test-landing-page-section-elements.cjs`, và 16 ca `test-landing-page-text-center-drag-browser.cjs` đều chạy. Build Next production thành công. Typecheck toàn repo còn các lỗi nền có sẵn (bao gồm InspectorRailId, ép kiểu block và generated route types); không báo toàn bộ typecheck đã xanh.
