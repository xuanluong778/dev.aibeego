# Builder: text không đè box hoặc phần tử khác

Release: `lpb-no-text-overlap-20261106`.

## Nguyên nhân và thay đổi

Bản nháp hiện tại giữ các offset cũ, có cả số âm, trên text và native card. Các offset làm phần tử rời khỏi ô bố cục, dù thao tác thả từ thư viện đã được sửa ở bản trước. Khung text khóa chiều rộng/chiều cao cũng có thể vượt khỏi cột.

- Tạo phép chiếu bố cục chỉ dùng để hiển thị: offset cũ trong bố cục chia cột được hiển thị tại vị trí trong luồng. Không ghi lại hoặc tự autosave các tọa độ đã lưu.
- Chỉ khi người dùng kéo/resize đích cụ thể, handler mới nhận vị trí hiển thị làm gốc cho lần chỉnh đó. Các tọa độ khác được giữ nguyên. Marker cho lần chỉnh này đi qua bộ lọc lưu dữ liệu đang chạy trên API.
- Chặn chuyển động theo đường kéo, kể cả bước nhảy con trỏ lớn; chặn resize/xoay gây va chạm. Text trong native box được giới hạn trong chính box đó. Kéo nhóm và phím mũi tên dùng chung ràng buộc.
- Giới hạn chiều rộng khung text theo cột và tăng chiều cao theo nội dung, áp dụng trong Builder và xem trước. Giảm số cột vật lý khi thiếu chỗ để giữ nội dung dễ đọc.
- Bản sao nhóm có vùng giữ chỗ trong luồng và tọa độ thành viên tương đối. Giữ các ô native do React sở hữu; không chuyển card native sang cha DOM khác.
- Có kiểm tra hiển thị khi nội dung/font thay đổi. Đây là hiệu chỉnh DOM, không tự ghi lại bản nháp.

## File chức năng

Trong `apps/web/src/components/landing-pages/`:

| File | Vai trò |
|---|---|
| `landing-page-no-overlap.ts` | Phép chiếu chỉ đọc, chuẩn bị lần chỉnh đích, tìm va chạm và chặn đường kéo |
| `landing-page-render-overlap-guard.tsx` | Kiểm tra hiển thị khi reflow |
| `landing-page-flow-copy.tsx` | Giữ chỗ cho bản sao nhóm |
| `landing-page-builder.tsx` | Dùng vị trí hiển thị trong handler chung, giữ history/autosave |
| `landing-page-renderer.tsx` | Áp dụng bố cục an toàn khi chỉnh và xem trước |
| `landing-page-free-drag.tsx` | Chặn kéo/resize/xoay gây chồng lấn |
| `landing-page-group-selection.tsx` | Ràng buộc khi kéo nhiều phần tử |
| `landing-page-section-elements.tsx` | Cột thích ứng, chiều rộng/chiều cao text và portal bản sao |

Kiểm thử: `scripts/test-landing-page-no-overlap.cjs`, `scripts/qa-landing-page-no-overlap-browser.cjs`; cập nhật fixture của `scripts/test-landing-page-text-center-drag-browser.cjs` để dùng handler thực tế.

## Kiểm chứng

Báo cáo máy và ảnh nằm trong `/var/www/aibeego_com_usr/data/backups/builder-no-text-overlap-20261106/`.

- Trước sửa: tái hiện **18 cặp khung giao nhau** trên bản sao chỉ đọc của bản nháp hiện tại.
- Kiểm thử hình học: phép chiếu không sửa dữ liệu gốc; chỉ chỉnh đích người dùng tác động; giữ tọa độ khác; Undo dùng lại mô hình cũ; chặn kéo xuyên box; vẫn kéo được hướng trống; bộ lọc lưu giữ marker.
- Text component: **16 ca** kéo bằng text/toolbar, căn giữa, guide, zoom, khung rộng, Undo/Redo và lưu/tải lại.
- Builder thật với hai snapshot bản nháp (trước và sau các chỉnh sửa trong khi kiểm thử): **21 lần đo mỗi snapshot**: mở trang, tải lại, **14 khung hình trong lúc kéo**, thả, autosave vào API giả lập dùng bộ lọc thật, tải lại sau lưu, xem trước và cửa sổ hẹp/mobile. Yêu cầu không có cặp khung giao nhau; mở bản nháp không được tự autosave hiệu chỉnh.
- Menu/nhóm: **9 nhóm kịch bản** gồm chọn trong box, nhóm, kéo, Undo/Redo, lưu/tải lại/bỏ nhóm, thuộc tính chung, khóa/ẩn, box lồng, copy/paste/duplicate/xóa/lớp và vị trí menu.
- Thả từ thư viện: **5 hướng** phải/trái/trên/dưới/dưới hàng; kiểm tra box không đổi chủ DOM, duplicate/lớp/xóa/Undo, xem trước và responsive.

Tất cả API request trong kiểm thử trình duyệt đều bị chặn và trả dữ liệu mô phỏng. Không ghi dữ liệu trang thật. Không xóa text ẩn hoặc phần tử nằm ngoài vùng nhìn.

Build production hoàn tất. Typecheck toàn web còn lỗi có sẵn ở các phần khác; không báo typecheck toàn repo thành công. Không có lỗi TypeScript mới trong các module chống chồng lấn.

## Triển khai

Image được tạo từ snapshot bản web đang chạy và chỉ áp dụng phần sửa của nhiệm vụ này; không đưa các thay đổi dở dang khác trong working tree lên production. Chỉ thay image web và reload Nginx; giữ API, biến môi trường và volume. Popup cập nhật tiếp tục bị tắt. Kết quả triển khai và kiểm thử sau triển khai được ghi trong `rollout.json` và `production/`.

Kết quả trên tên miền thật sau triển khai: **21/21** lần đo không có chồng lấn, không có client exception. Kiểm tra thêm hai lần tải Builder: không có cảnh báo CSS preload, không có request sửa bản nháp thật. Hai snapshot trước triển khai đều đạt 21/21; bộ nhóm đạt 9/9 và bộ thả phần tử đạt 5/5.
