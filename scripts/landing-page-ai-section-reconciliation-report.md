# Sửa lỗi section AI và thử lại bản dự phòng đã lưu

Đã triển khai shared, API và web build `trmaq5DpNm4tojTFchAq1` lên aibeego.com ngày 31/10/2026.

## Nguyên nhân có bằng chứng

Log sản xuất 16:00:00 UTC ghi `AI_MALFORMED [AI_SECTION_COUNT_MISMATCH@sections]`. Bộ kiểm tra đếm toàn bộ section do model trả về, dù các section của mẫu đã có đủ. Section thừa hoặc bản lặp làm toàn bộ kết quả chuyển sang mẫu dự phòng.

Frontend còn có lỗi thử lại: nếu đã có aiPreview thì nút Tạo landing Page chỉ mở lại bản xem trước. Bản dự phòng được lưu qua F5 vì vậy có thể lặp lại mà không gọi AI mới.

## Sửa ở nguyên nhân

- Bộ nhận AI chọn và sắp xếp section theo đúng cặp id/type từ catalog. Section ngoài kiến trúc không được đưa vào trang. Bản lặp có cùng nội dung được gộp sau chuẩn hóa schema; các bản cùng id nhưng nội dung mâu thuẫn vẫn bị đánh dấu AI_SECTION_AMBIGUOUS để yêu cầu sửa.
- Section bắt buộc bị thiếu, sai schema, nội dung lặp, số liệu/cam kết chưa được cung cấp vẫn bị từ chối. Không tự chèn nội dung mẫu rồi gắn nhãn AI.
- Phản hồi sửa cấu trúc nêu rõ toàn bộ id/type dự kiến. Giữ giới hạn một lượt sửa và idempotency hiện có.
- Nút Tạo landing Page gọi AI mới với mã yêu cầu mới khi kết quả hiện tại là fallback, kể cả sau F5. Kết quả AI hợp lệ vẫn được mở lại để xác nhận lưu, tránh gọi provider thêm.
- Nội dung thông báo hiện tại và thông báo dự phòng đã lưu được đổi sang đúng tên nút đang có. Không cần xóa form hoặc bấm Làm mới để thử lại.

## Kiểm tra

- Shared TypeScript, API Nest và Next production build: đạt.
- Hồi quy 200 mẫu: đạt. Kiểm thử mới tái hiện AI trả 8 section cho mẫu 7 section: source=ai ngay lượt đầu; section thừa chứa thương hiệu khác/cam kết 300% không có trong spec đầu ra. Các bản trùng mâu thuẫn và section bắt buộc thiếu vẫn bị từ chối.
- Ba ca khóa học gọi provider thật: cả ba source=ai. Có ca dùng CTA/URL nhìn thấy trong ảnh; đây là dữ liệu mẫu kiểm tra, không phải toàn bộ dữ liệu riêng của người dùng.
- Kiểm tra module đã triển khai với provider thật và chủ động thêm một section thừa để tái hiện: nhận 8, dùng đúng 7, source=ai, một provider call, Page Doctor không báo lỗi; CTA được chuẩn hóa thành https://thegioidigi.com/.
- Browser QA local và trên website sau triển khai: bản dự phòng qua F5 thực sự gọi lại AI với key mới; double click chỉ gửi một lần; form giữ nguyên; preview/lưu nháp, retry, Xem live, tách tài khoản, reset và giao diện desktop/mobile: đạt.
- UI QA dùng fixture API và service thật; các phép kiểm tra provider chỉ dựng spec trong bộ nhớ. Không tạo/sửa/xóa/xuất bản trang khách hàng.
- Hash API đang chạy khớp bản build; web BUILD_ID khớp release; API health HTTP 200.

## Sử dụng sau cập nhật

F5 để tải giao diện mới, sau đó bấm **Tạo landing Page** khi đang có bản dự phòng. Không cần Làm mới; form đã nhập được giữ nguyên. F5 tự nó không gọi AI hoặc phát sinh yêu cầu tạo trang.

Fallback vẫn có thể xuất hiện khi provider gặp lỗi hoặc nội dung thực sự không đạt sau lượt sửa; các trường hợp này vẫn được ghi mã nguyên nhân. Bản sửa không khẳng định mọi phản hồi AI đều hợp lệ.

Bản sao trước sửa, release, log, kết quả provider và ảnh QA: /var/www/aibeego_com_usr/data/backups/ai-section-reconciliation-20261031.
