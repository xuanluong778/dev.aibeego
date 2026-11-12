# Kéo box qua nhau, không chồng lấn

Release: `lpb-box-pass-20261106`.

Bản trước kiểm tra cả đường đi của con trỏ và dừng box trước vật cản. Bản này kiểm tra vị trí đích: vị trí trống ở phía bên kia được phép tới ngay; khi con trỏ ở trong vùng đã có box, box đang kéo chọn mép trống gần nhất theo hướng kéo. Khi đi qua trung điểm, box chuyển sang phía bên kia. Nếu không có vị trí trống phù hợp trong vùng cho phép, giữ vị trí an toàn.

Không di chuyển box hàng xóm, không thay thứ tự lớp và không sửa bản nháp khi mở trang. Text nằm trong native box tiếp tục được giới hạn trong box chứa nó. Chặn resize/xoay gây chồng lấn được giữ nguyên.

File chức năng:

- `apps/web/src/components/landing-pages/landing-page-no-overlap.ts`: bỏ chặn đường đi liên tục; chọn vị trí đích không giao nhau, theo kích thước box đang hiển thị thực tế (kể cả khi CSS cột khác kích thước đã lưu).
- `apps/web/src/components/landing-pages/landing-page-builder.tsx`: bản triển khai dùng cùng giới hạn tọa độ ngang được Builder hỗ trợ, tránh mất vị trí khi box đi xa hơn 640px. Dòng này đã có ở working tree; chỉ đưa đúng dòng xác thực cần thiết vào snapshot triển khai.
- `scripts/test-landing-page-no-overlap.cjs`: kiểm tra đi qua hai chiều, vị trí trong vật cản, hướng trống và bảo toàn dữ liệu gốc.
- `scripts/qa-landing-page-box-pass-browser.cjs`: chạy Builder thật với native box, nút kéo/toolbar, bố cục cột, Undo/Redo, autosave và tải lại. Đo va chạm ở từng bước kéo.

Kiểm thử trình duyệt chặn toàn bộ API request và dùng bộ lọc lưu dữ liệu thật trên bản sao trong bộ nhớ. Không sửa trang production. Báo cáo/ảnh: `/var/www/aibeego_com_usr/data/backups/builder-box-pass-20261106/`.

Image được dựng từ snapshot release đang chạy, chỉ thêm logic của nhiệm vụ này. Triển khai chỉ đổi image web và nạp lại Nginx; giữ nguyên API, môi trường, volume và trạng thái tắt popup cập nhật.

Kết quả trước triển khai: 3/3 trường hợp native box đạt; tổng 180 mẫu trong lúc kéo, không chồng lấn; qua cả hai chiều, Undo/Redo và autosave/tải lại. 21/21 kiểm tra trên snapshot bản nháp hiện tại cũng đạt, gồm xem trước và cửa sổ hẹp/mobile. Mở bản nháp không tự ghi lại tọa độ. Phép đo chỉ tính phần tử được vẽ; bỏ qua wrapper bố cục rỗng vốn giữ chỗ tại gốc sau khi text dịch chuyển.

Sau triển khai trên **aibeego.com**: 3/3 trường hợp kéo box đạt, 180 mẫu trong khi kéo không có chồng lấn, không có lỗi JavaScript. 21/21 kiểm tra bản nháp trên tên miền thật đạt. Thao tác kéo được lưu, Undo/Redo đúng và tải lại giữ được vị trí phía bên kia box. Version công khai: `lpb-box-pass-20261106`.
