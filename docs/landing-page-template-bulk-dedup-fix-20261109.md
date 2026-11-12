# Sửa đếm trùng template trong ZIP tổng — 09/11/2026

Người dùng báo source new.zip vẫn lỗi “Tối đa 300 mẫu mỗi lần upload” sau bản sửa nhận diện thư mục. Bản trước cộng số ZIP con và thư mục mẫu, đồng thời thêm mọi thư mục index/source.html làm ứng viên. Không đối chiếu slug nên một ZIP gồm 200 pack cùng thư mục nguồn và preview có thể thành 600 ứng viên.

Tái hiện bằng fixture ZIP 191.865.152 byte: 200 template có manifest, mỗi mẫu có ZIP cũ, thư mục nguồn đã sửa và HTML preview. Chạy trên API image trước sửa trả đúng total 1, updated 0, failed 1, “Tối đa 300 mẫu mỗi lần upload”. File ZIP riêng của người dùng chưa có trên server; đã hỏi đường dẫn để có thể đối chiếu trực tiếp nếu được cung cấp. Không khẳng định đã nhập file riêng đó.

## Bản sửa

- Phân biệt template có manifest với HTML preview/gallery/tài liệu. Khi archive đã có các template tường minh, HTML phụ không được tính thành template mới. ZIP nằm trong chính thư mục template là bản đóng gói phụ, không phải mẫu thứ hai.
- Nhận diện logic bằng slug trong manifest đúng định dạng/version; gộp ZIP và thư mục của cùng mẫu. Thư mục nguồn được ưu tiên hơn bản ZIP đi kèm. Bản sao giống nội dung chỉ nhập một lần, kể cả chọn cùng file qua nhiều input.
- Hai nguồn cùng slug, cùng loại nhưng khác nội dung được báo lỗi rõ ràng trước khi ghi; không tự chọn ngẫu nhiên rồi ghi đè. Fingerprint dựa trên tên/nội dung file, không dựa vào thứ tự/timestamp ZIP.
- Áp giới hạn 300 sau khi gộp trùng. Thông báo quá giới hạn có số mẫu đã nhận diện thực tế. Giữ nguyên giới hạn 200 MiB ZIP tổng, 20 MiB/mẫu, đường Nginx, quyền admin và parser nhập mẫu hiện có.
- Chỉ đổi helper và importBulk service. Không đổi importNew/importUpdate, snapshot, publish, trang khách hàng, source/interface Builder hoặc container web. Không migration database.

## Kiểm tra và triển khai

Fixture hỗn hợp nói trên đạt 200 logical templates, 200 cập nhật, 0 lỗi với dependency persistence giả; mọi nội dung được chọn là bản sửa trong thư mục nguồn. Kiểm tra thêm: ZIP trùng giữa các thư mục, ZIP trùng giữa nhiều input, ZIP nằm trong thư mục nguồn, hai nguồn xung đột không ghi dữ liệu, 301 mẫu khác nhau vẫn bị chặn, HTML-only folder giữ hành vi tạo nháp. Bộ regression ZIP tổng 191.918.942 byte/200 thư mục thuần vẫn đạt, cùng ZIP con, wrapper, partial failure, lỗi ZIP, giới hạn 20 MiB và quyền admin. Type check helper không lỗi.

Image phát hành marketingaz-api:template-bulk-dedup-fix-20261109 xây trên đúng API image đang chạy, chỉ overlay hai module JS. Gate triển khai đối chiếu image đã kiểm thử; có rollback. Sau rollout, API health và manage-templates HTTP 200; module đang chạy khớp image đã QA. Container web, env và mounts giữ nguyên. Các kiểm tra không ghi dữ liệu khách hàng. ZIP thật cần được người dùng upload lại để cập nhật dữ liệu production.

Test tái chạy: scripts/test-landing-page-template-bulk-dedup.cjs; regression: scripts/test-landing-page-template-bulk-folders.cjs. Cả hai chạy trong API image với database/filesystem persistence giả. Artifact, source trước sửa, hashes, baseline reproduction, báo cáo QA và rollout ở /var/www/aibeego_com_usr/data/backups/template-bulk-dedup-fix-20261109/.
