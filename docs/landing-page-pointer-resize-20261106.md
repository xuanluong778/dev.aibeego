# Kéo giãn tiêu đề và giữ vị trí element

Release: `lpb-pointer-resize-20261106`.

## Nguyên nhân

- Bộ giới hạn cột áp lại chiều rộng tối đa sau khi resize, khiến tiêu đề rộng ra lúc kéo nhưng co lại khi thả.
- Resize/move khởi tạo từ kích thước đã lưu (ví dụ 820px), trong khi CSS thực tế chỉ hiển thị 352px.
- Tiêu đề nằm trong vùng căn giữa đổi gốc tự nhiên khi rộng ra, làm mép khung trượt theo.
- Hoàn tất resize cạnh xóa inline font-size dù không đổi typography, làm font và chiều cao nhảy về theme.
- Khi gặp vùng bị chiếm, cơ chế tìm chỗ trống có thể đổi hướng hoặc chọn một hàng ở xa con trỏ.

## Thay đổi

| File trong `apps/web/src/components/landing-pages/` | Thay đổi |
|---|---|
| `landing-page-canvas-ux.tsx` | Resize từ khung thực tế, giữ mép được neo trong vùng căn giữa, giới hạn trong section/box chứa và kiểm tra va chạm. Kéo cạnh giữ cỡ chữ; kích thước live ở góc khớp sau thả tay. Escape khôi phục hình học trước thao tác. |
| `landing-page-builder.tsx` | Lưu kích thước do người dùng resize và offset trong cùng một bước history. |
| `landing-page-section-elements.tsx` | Giữ giới hạn cho dữ liệu cũ; kích thước mới do resize có kiểm tra va chạm được phép vượt chiều rộng cột. |
| `landing-page-free-drag.tsx` | Dùng kích thước đang vẽ, giữ margin, dùng cùng hệ tọa độ của section và truyền hướng kéo thực tế. |
| `landing-page-no-overlap.ts` | Chỉ hiệu chỉnh ở mép vật cản gần đích trên đúng hướng kéo; không tự nhảy sang hàng/cạnh trang xa. Vẫn cho phép đi qua box tới đích trống. |
| `landing-page-render-overlap-guard.tsx` | Không can thiệp transform khi resize text đang diễn ra. |

Mở trang không tự sửa hay autosave lại dữ liệu. Chỉ đích người dùng trực tiếp kéo/resize được cập nhật. Popup cập nhật tiếp tục tắt.

## Kiểm thử

- `scripts/qa-landing-page-pointer-resize-browser.cjs`: Builder thật, hai kích thước màn hình, trường hợp có phần tử cản bên cạnh và kéo ở góc. Kiểm tra pointerdown không nhảy, mép trái được giữ khi kéo cạnh phải, chiều rộng không co lại khi thả, cỡ chữ giữ nguyên, một bước Undo/Redo, autosave/tải lại, xem trước, kéo theo con trỏ và Escape hủy resize.
- `scripts/qa-landing-page-box-pass-browser.cjs`: 3 trường hợp nút kéo/toolbar/cột, qua hai chiều, Undo/Redo, lưu/tải lại; 180 mẫu không chồng lấn.
- `scripts/qa-landing-page-canvas-groups-browser.cjs`: 9 nhóm kịch bản chọn/nhóm/kéo/lưu/clipboard/lớp/menu.
- `scripts/test-landing-page-text-center-drag-browser.cjs`: 16 trường hợp text/toolbar/zoom/căn giữa/history/lưu lại.
- `scripts/test-landing-page-no-overlap.cjs`: phép chiếu không sửa dữ liệu gốc, đi qua box, không giao nhau và không nhảy sang hàng xa khi bị cản.
- `scripts/qa-landing-page-client-route-browser.cjs`: mở và tải lại snapshot bản nháp hiện tại; kiểm tra attached elements, client exception và CSS preload.

Toàn bộ request API trong QA trình duyệt được chặn. Lưu dữ liệu chỉ diễn ra trong bản sao bộ nhớ dùng bộ lọc lưu thật, không ghi bản nháp production. Báo cáo và ảnh: `/var/www/aibeego_com_usr/data/backups/builder-pointer-resize-20261106/`.

Build production hoàn tất. Typecheck toàn web vẫn có lỗi nền ở phần khác; không có lỗi mới được ghi nhận trong các module hình học/resize đã sửa.

Release được tạo từ snapshot web đang chạy và chỉ nhận các thay đổi thuộc nhiệm vụ này. Giữ các thay đổi dở dang khác trong working tree. Triển khai chỉ đổi image web và nạp lại Nginx, giữ API, môi trường và volume.

Trước triển khai: 4/4 trường hợp resize đạt. Hai khung màn hình cho phép kéo cạnh từ 352 lên 772px, giữ mép trái và cỡ chữ. Trường hợp có vật cản dừng ở 785px khi yêu cầu rộng hơn, không chồng lên phần tử bên cạnh. Kéo góc giữ nguyên hình học live khi thả. Sáu lần kéo thử giữ kích thước và vị trí sau thả; kiểm tra vị trí theo con trỏ có tính dung sai của guide căn chỉnh hiện có. Undo/Redo, autosave/tải lại, xem trước và Escape đều đạt.

Các bộ hồi quy: nhóm 9/9; native box 3/3 với 180 mẫu không chồng lấn; text component 16/16. Snapshot bản nháp hiện tại tải lại hai lần không có client exception hoặc cảnh báo CSS preload và không có request sửa trang thật.

Sau triển khai trên **aibeego.com**: 4/4 trường hợp resize/kéo đạt, bao gồm kéo cạnh, kéo góc, ngăn chồng lấn, Undo/Redo, lưu/tải lại, xem trước và Escape. Sáu lần kéo thử giữ nguyên kích thước và giữ vị trí sau thả. Snapshot bản nháp thật tải lại hai lần: không có client exception, không có cảnh báo CSS preload, không gửi request sửa bản nháp production. Version công khai: `lpb-pointer-resize-20261106`.
