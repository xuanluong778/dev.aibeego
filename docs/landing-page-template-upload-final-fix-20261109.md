# Sửa lỗi upload 413 và ổn định tải về/upload lại — 09/11/2026

Request lúc 21:20:51 trả 413, body JSON 100 byte với “File too large”; Nginx không ghi lỗi body-too-large mới. Đây là lỗi nhận file ở API, khác lần Nginx 100 MiB trước đó. Controller đang chạy giới hạn 200 MiB/file, proxy 210 MiB/request. Người dùng cho biết chọn ZIP tải qua “Tải tất cả mẫu”. Kiểm tra read-only bản export hiện tại cho 200 mẫu: 77.335.238 byte (~73,75 MiB) trước sửa giữ màu. Không có bản file cục bộ của đúng lần request lỗi, nên không khẳng định byte size thực tế của request đó. Đã bổ sung log tên file/request bytes/limit ở đầu bộ nhận file bulk để các lỗi sau có thể đối chiếu trực tiếp, không ghi nội dung file hay credential.

## Thay đổi

- Đồng bộ ZIP tổng 256 MiB/file trong hằng template-pack và multipart interceptor; Nginx host + Docker chỉ nâng exact location bulk lên 270 MiB để chừa framing. Giữ ZIP đơn 20 MiB, tối đa 300 mẫu khác nhau, giới hạn giải nén 400 MiB và các limit upload khác.
- UI kiểm tra dung lượng trước khi gửi, báo tên và số MiB thực tế nếu vượt 256 MiB. Nhiều file tự chia thành các request tuần tự, mỗi request tối đa 256 MiB dữ liệu/300 file. Cộng báo cáo từng đợt, giữ kết quả đợt đã xử lý, không tự retry để tránh ghi lặp khi lỗi mạng. Thông báo 413 được Việt hóa.
- Lưu lựa chọn người dùng đã xác nhận bằng cấu hình LP_TEMPLATE_BULK_PREFERRED_SOURCES={"online-course":"online-course-dark-emerald-v3"}. Bộ gộp trùng áp lựa chọn này trước ưu tiên thư mục nguồn. Chỉ giải quyết slug đã cấu hình; xung đột slug khác vẫn báo rõ. Nếu chỉ có một bản thì vẫn nhập bản người dùng gửi. Không cần hỏi lại cùng lựa chọn ở các lần upload ZIP gốc.
- Sửa exporter: themeTokens là dữ liệu thiết kế, không phải secret. Giữ trường này, vẫn loại password/accessToken và secret lồng bên trong. Gói cũ thiếu themeTokens nhưng cùng theme khi update sẽ giữ bảng màu hiện tại; gói có tokens cụ thể vẫn được ưu tiên. Import mới và update đổi theme không bị buộc dùng màu cũ.

## Kiểm tra

Test bằng HTTP multipart thật qua FilesInterceptor và handler của LandingPagesController trong API image candidate, Nest server độc lập, persistence giả và asset read-only. Bao gồm:
- ZIP xuất từ 200 mẫu hiện tại: 77.624.599 byte, HTTP 201, 200 updated, 0 failed; các themeTokens xuất ra khớp từng mẫu.
- File thật source new.zip: 191.473.921 byte, HTTP 201, 200 updated, 0 failed; lựa chọn khóa học Dark Emerald v3 được xác nhận.
- ZIP tổng hợp lệ 214.958.186 byte (>200 MiB): HTTP 201, 200 updated, 0 failed.
- File vượt 256 MiB một byte: HTTP 413.

Bộ regression gộp trùng đạt: ZIP/thư mục/preview của 200 mẫu chỉ nhập một lần, nguồn sửa được chọn, bản sao giữa inputs gộp đúng, xung đột chưa có lựa chọn vẫn chặn trước ghi, 301 mẫu khác nhau vẫn bị chặn, HTML-only giữ hành vi cũ. Test legacy export giữ màu, explicit colors thắng và secret vẫn bị loại đều đạt. Type check các module upload/parser/controller không lỗi; 48 handler controller có body khớp bản trước sửa, không thay logic endpoint khác. Next production build đạt.

Browser candidate và frontend production với API fixtures: file quá lớn bị chặn trước network, báo filename/size; lỗi import theo file vẫn rõ; hai file lớn được gửi thành hai request rồi cộng kết quả; 413 server hiện tiếng Việt; desktop/mobile, không JS error.

## Triển khai và xác nhận

Images marketingaz-api:template-upload-final-fix-20261109 và marketingaz-web:template-upload-final-fix-20261109 dựa trên đúng image trước đó, chỉ overlay upload modules/artifact web. Mounts giữ nguyên; env chỉ thêm mapping lựa chọn đã được người dùng xác nhận. Không migration hoặc thay template/customer page. Đối chiếu sau rollout: cả 200 template rows khớp trước sửa.

Probe production chỉ gửi header/Expect, không credential/không nhập dữ liệu: body khai báo 256 MiB + multipart qua proxy và nhận 401 từ auth API; vượt 270 MiB vẫn 413; đường import đơn khác giữ limit cũ. Đây là kiểm tra đường proxy/auth, không thay cho kiểm thử file upload thật; file thật được kiểm qua HTTP ở môi trường độc lập như trên. Public build ID lpb-template-upload-final-fix-20261109. Browser production đạt. Có backup và script rollback cho compose và hai proxy.

Script tests: test-landing-page-template-upload-http.cjs, test-landing-page-template-export-colors.cjs, qa-landing-page-upload-limits.cjs. Artifact/backup/report tại /var/www/aibeego_com_usr/data/backups/template-upload-final-fix-20261109/. Source canonical đã lưu fix; hai bản nginx nguồn cũng giữ limit endpoint mới. Không sửa Builder hoặc template đang xuất bản trong lần này.
