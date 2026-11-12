# Sửa nhận diện ZIP tổng gồm thư mục template — 09/11/2026

Ảnh người dùng cho thấy `source new.zip` bị trả “ZIP vượt dung lượng 20MB”, 0 tạo mới, 0 cập nhật, 1 lỗi. Đợt sửa Nginx 413 trước đó đã cho request lớn đi tới API; lỗi lần này ở importer. API cũ chỉ tách ZIP tổng chứa ZIP con, giới hạn thư mục trung tâm 400 entry và nuốt lỗi đọc ZIP tổng trước khi thử lại dưới dạng pack đơn 20 MiB. ZIP được giải nén/chỉnh sửa rồi nén lại thành nhiều thư mục mẫu (hoặc thêm wrapper/metadata) có thể rơi vào nhánh lỗi này.

Đã tái hiện đúng thông báo bằng fixture ZIP 191,918,942 byte, 200 thư mục, 600 file, không dùng file riêng của người dùng. Trên image cũ: total 1, created 0, updated 0, failed 1, “ZIP vượt dung lượng 20MB”. Trên image sửa: đủ 200 mẫu qua parser và importBulk với dependency ghi dữ liệu giả, 100 tạo mới và 100 cập nhật. Không ghi dữ liệu khách hàng trong QA.

## Thay đổi

- Thêm template-pack-bulk.ts để tách ZIP chứa ZIP con hoặc thư mục manifest.json + template.json/index.html/source.html, kể cả thư mục bọc ngoài và metadata __MACOSX/.DS_Store. Collection có manifest/index ở root vẫn ưu tiên các template con xác định rõ. HTML-only folder giữ hành vi cũ: tạo nháp, không suy đoán slug để ghi đè mẫu khác.
- ZIP tổng được đọc tối đa 200 MiB, 400 MiB giải nén và 16.000 entry (đủ 300 mẫu x 40 file cùng entry thư mục/metadata). Tối đa 300 template mỗi lần. Mỗi template vẫn đi qua parser cũ: ZIP đơn 20 MiB, 40 file, 40 MiB giải nén, asset 8 MiB; không tăng giới hạn mẫu đơn để lách lỗi.
- Giữ nguyên lỗi đọc ZIP tổng thay vì che bằng “20MB”. Chặn đầu ra giải nén theo dung lượng còn lại và đối chiếu kích thước thực với central directory.
- UI: không có mẫu nào nhập được thì hiển thị lỗi màu đỏ; nhập một phần và thành công được thông báo riêng, vẫn giữ báo cáo từng file. Lỗi HTTP 413 có thông báo dung lượng cụ thể. Mô tả định dạng ZIP tổng/thư mục mẫu và giới hạn ngay trang upload.
- Sidebar ngừng prefetch trên riêng trang manage-templates, kế thừa cách làm đã có ở Builder. Stylesheet 6cfaccbc836e26aa.css là CSS của trang tạo landing page; không tải trước trang đó khi đang quản lý upload. Không xóa CSS hoặc thay giao diện Builder.

## Phạm vi và kiểm tra

- Bộ test fixture gồm ZIP 192 MB/200 thư mục, ZIP con định dạng export cũ, wrapper một thư mục, collection có root manifest/index, HTML-only folder, lỗi một mẫu không dừng mẫu khác, lỗi ZIP được giữ đúng, giới hạn 300 mẫu, giới hạn 20 MiB/mẫu và quyền admin. Đều đạt, không truy cập database thật.
- Test template-pack hiện có đạt; type check riêng template-pack và helper mới không lỗi. Next production build đạt theo cấu hình hiện có của repo.
- Browser trên image phát hành, API fixtures: báo cáo thất bại/nhập một phần/thành công 200 mẫu, desktop/mobile, không JavaScript error. Không có preload stylesheet không được sử dụng, không prefetch route create khi đang manage-templates.
- Không đổi code importNew/importUpdate, snapshot lịch sử, publish, tạo trang hoặc engine Builder. Không migration database, không tự chạy lại file upload của người dùng. API/web image mới xây trên đúng image đang chạy và chỉ cập nhật ba module API cùng artifact web; env/mounts giữ nguyên. Nginx 210 MiB của bản sửa 413 giữ nguyên.

Source phát hành là repo canonical `/var/www/marketingaut_usr/data/www/marketingautoaz.com`. Mirror cũ chưa có trang manage-templates/bulk feature, nên không ghi đè các file mirror khác phiên bản bằng cả file canonical. Snapshot, hash source, image, backup cấu hình và rollback: `/var/www/aibeego_com_usr/data/backups/template-bulk-folders-fix-20261109/`.

Các test tái chạy: scripts/test-landing-page-template-bulk-folders.cjs và scripts/qa-landing-page-template-bulk-ui.cjs. Test API chạy trong API image với dependency ghi dữ liệu giả; browser chặn API vào fixture. Không nên coi QA là xác nhận ZIP riêng chưa được cung cấp đã nhập vào production.

Đã triển khai lên aibeego.com, build `lpb-template-bulk-folders-fix-20261109`. Kiểm tra frontend production với API fixtures đạt các luồng báo lỗi/nhập một phần/thành công 200 mẫu và kiểm tra stylesheet không tải trước dư. API health, trang manage-templates và URL CSS cũ đều HTTP 200; ba module API đang chạy khớp bản đã kiểm tra. Env/mounts giữ nguyên, không migration. Kiểm tra chỉ đọc sau rollout: vẫn 200 template, không có snapshot mới do QA tạo. Người dùng cần upload lại file ZIP để cập nhật dữ liệu thật. Container QA đã được dọn.
