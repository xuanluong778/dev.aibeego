# Section Library: preview và section sau chèn — 08/11/2026

Lỗi được tái hiện trên bản web `marketingaz-web:mq-fix1`: mẫu “Hero split trái” trong preview có hai cột, ba dòng cam kết và icon, nhưng sau chèn vào trang trống bị dựng bằng BlankStarterBlock, mất cam kết/icon và đổi màu nút. Preview cũng dùng theme/designFamily riêng trong khi section sau chèn dùng theme/renderer của toàn trang.

Bản sửa lưu ngữ cảnh hiển thị có version trên `block.style.lpSectionLibrary` khi materialize section. Preview và section đã chèn dùng chung nhánh renderer, đồng thời CSS foundation được áp dụng trong scope riêng của section. Giữ đúng layout/variant, theme và designFamily của mẫu mà không đổi theme trang. Không thêm canvas root; toàn bộ thao tác kéo thả/resize dùng canvas cũ. CTA chỉnh sửa dùng cùng selector style với CTA preview để khớp gradient, radius và mũi tên. Ảnh Hero không tự thêm lớp “Xem giới thiệu” riêng của editor. Preview đi qua sanitizer như bản nháp, và ID item/plan/field ổn định, duy nhất để tránh React key trùng.

Không sửa generator AI, template catalog landing page, publish workflow, database hay API. API hiện hành giữ nguyên image sửa lỗi tạo Trang trống. Không tự nhận dạng hay ghi đè section đã lưu trước đây: thiết kế riêng áp dụng khi chèn section mẫu bằng luồng mới.

Validation:
- 100 mẫu qua sanitizer draft/persist, JSON reload, clone: giữ ngữ cảnh mẫu, nội dung và collection; ID block/item độc lập; catalog/trang gốc không bị mutate.
- 100 preview thực: dữ liệu hợp lệ sau sanitizer, ID ổn định và duy nhất, giữ tùy chọn theme preview hiện có.
- Sanitizer của API production giữ context của cả 100 mẫu, gọi thuần với fixture không có database writes.
- Browser: 100 mẫu, hai lô 50, trong trang thường có theme khác, trang trống và agency. Đối chiếu màu/font, heading, CTA, icon, số cột và thứ tự hiển thị; chỉ một canvas root.
- Browser Hero split: đối chiếu preview với section chèn về text, icon, ảnh, typography, gradient/radius nút; kiểm tra chỉnh text, autosave, tải lại từ server fixture, nhân bản, undo/redo, page preview và tablet/mobile không tràn ngang. Sáu section gốc giữ nguyên dữ liệu.
- Browser regression hiện có: pointer resize (4 tình huống), groups/context menu (9 bước), sidebar drop/row layout (5 bước) đạt, không lỗi JavaScript và không ghi bản nháp khách hàng.
- Unit: section rows, canvas context menu, section library preview, hợp đồng agency và CSS scope đạt. Bài kiểm tra CSS agency được cập nhật để xác nhận cả scope trang cũ lẫn scope section mới giữ nguyên declarations.
- Hai static source matcher cũ (`test-landing-page-section-preset-dnd.cjs`, `test-landing-page-preview-mode.cjs`) có một số assertion lỗi sẵn; đã đối chiếu source trước bản vá và xác nhận output/exit code giống hệt. Kết quả được lưu trong `legacy-static-checks.json`.

Build được tạo trong snapshot độc lập của source hiện tại, giữ các sửa đổi Builder đã có. Source canonical, mirror và build source của bảy tệp component được đối chiếu byte. Image candidate dựa trên đúng image web đang chạy và chỉ cập nhật artifact web, giữ dependency/config runtime.

Artifacts, patch, source hash, báo cáo browser và rollback: `/var/www/aibeego_com_usr/data/backups/section-library-parity-20261108/`. Bài kiểm tra có thể chạy lại ở `scripts/test-landing-page-section-library-parity.cjs`, `scripts/qa-landing-page-section-library-parity-browser.cjs` và `scripts/qa-landing-page-section-library-matrix-browser.cjs`. Các bài browser luôn chặn API vào fixture.

Đã triển khai lên `https://aibeego.com` lúc 22:14 ngày 08/11/2026 (Asia/Ho_Chi_Minh), image `marketingaz-web:section-library-parity-20261108`, build `lpb-section-library-parity-20261108`. Phiên bản công khai xác nhận đúng; route tạo và API health HTTP 200. API container, environment và mounts giữ nguyên. Sau rollout, chạy lại browser acceptance trên frontend production: đủ 9 bước đạt, không JavaScript error; toàn bộ API dữ liệu dùng fixture, không có customer writes. Container QA và preview server đã được dọn.
