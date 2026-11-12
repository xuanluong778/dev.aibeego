# CODE-COVERAGE: case nào đã có code

Sinh tự động từ `suites/*.test.ts`. Tổng **647 case** (mã duy nhất), **654 khối test** (một số case có hai biến thể logic + HTTP).

Cột *Lớp*: `unit` = chạy ngay, không cần máy chủ; `api` = gọi HTTP tới stack test (tự bỏ qua nếu thiếu `LP_API_BASE`); `e2e` = mở trình duyệt Chromium (cần thêm `LP_WEB_BASE`). `todo` = chưa có code, giữ mã để không mất dấu.

| Flow | Suite | Case | Có code (case) | unit | api | e2e | todo | Suite có ≥1 case có code |
|---|---|---|---|---|---|---|---|---|
| [LP01](suites/LP01-tao-trang-moi.test.ts) Tạo landing page mới (từ mẫu, trang trống, AI, URL) | 7 | 64 | 24 | 0 | 24 | 0 | 40 | 7/7 |
| [LP02](suites/LP02-thu-vien-templates.test.ts) Thư viện Templates (xem, lọc, xem trước, dùng mẫu) | 7 | 46 | 8 | 0 | 8 | 0 | 38 | 3/7 |
| [LP03](suites/LP03-builder-chinh-sua-phan-tu.test.ts) Builder: chỉnh sửa nội dung và phần tử | 7 | 57 | 5 | 5 | 0 | 0 | 52 | 2/7 |
| [LP04](suites/LP04-builder-section-hang-cot.test.ts) Builder: section, hàng/cột, thư viện section, thêm thành phần | 7 | 49 | 0 | 0 | 0 | 0 | 49 | 0/7 |
| [LP05](suites/LP05-luu-autosave-xuat-ban.test.ts) Lưu, autosave, lịch sử, khôi phục, xuất bản | 8 | 77 | 35 | 19 | 22 | 0 | 42 | 7/8 |
| [LP06](suites/LP06-form-thu-lead.test.ts) Form thu lead trên trang công khai | 7 | 63 | 17 | 0 | 16 | 1 | 46 | 6/7 |
| [LP07](suites/LP07-trang-cong-khai-domain-seo.test.ts) Trang công khai, preview, tên miền, SEO | 7 | 61 | 27 | 3 | 23 | 1 | 34 | 7/7 |
| [LP08](suites/LP08-trang-cua-toi-analytics.test.ts) Trang của tôi, tổng quan và analytics | 5 | 51 | 18 | 0 | 18 | 0 | 33 | 5/5 |
| [LP09](suites/LP09-admin-quan-ly-templates.test.ts) Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt) | 7 | 67 | 25 | 16 | 10 | 0 | 42 | 6/7 |
| [LP10](suites/LP10-ai-trong-builder.test.ts) AI trong builder (viết lại, Page Doctor, hồ sơ doanh nghiệp) | 4 | 48 | 6 | 0 | 6 | 0 | 42 | 3/4 |
| [LP11](suites/LP11-hieu-ung-motion.test.ts) Hiệu ứng (motion) cho section và element | 4 | 33 | 11 | 10 | 0 | 1 | 22 | 3/4 |
| [LP12](suites/LP12-chat-luong-giao-dien.test.ts) Chất lượng giao diện toàn cục (responsive, hình ảnh) | 5 | 31 | 3 | 0 | 0 | 3 | 28 | 1/5 |
| **Tổng** | **75** | **647** | **179** | **53** | **127** | **6** | **468** | **50/75** |

Suite chưa có case nào có code: LP02-S01, LP02-S04, LP02-S05, LP02-S06, LP03-S01, LP03-S02, LP03-S04, LP03-S05, LP03-S07, LP04-S01, LP04-S02, LP04-S03, LP04-S04, LP04-S05, LP04-S06, LP04-S07, LP05-S02, LP06-S04, LP09-S07, LP10-S04, LP11-S03, LP12-S02, LP12-S03, LP12-S04, LP12-S05.

## Danh sách chi tiết

| Mã case | Ưu tiên | Lớp | Trạng thái code | Tên |
|---|---|---|---|---|
| LP01-S01-TC001 | P0 | api | có code | Tạo trang trống thành công và vào builder (HTTP) |
| LP01-S01-TC002 | P1 | - | chưa có code | Nút tạo bị khóa khi tên trống |
| LP01-S01-TC003 | P2 | api | có code | Tên dài đúng 120 ký tự được lưu nguyên (HTTP) |
| LP01-S01-TC004 | P2 | - | chưa có code | Tên dài hơn 120 ký tự bị cắt ở giao diện |
| LP01-S01-TC005 | P2 | api | có code | Tên có ký tự Unicode tiếng Việt và emoji (HTTP) |
| LP01-S01-TC006 | P1 | api | có code | Cấu trúc dữ liệu trang trống (HTTP) |
| LP01-S01-TC007 | P0 | api | có code | Nhấp đúp nút tạo chỉ sinh một trang (HTTP) |
| LP01-S01-TC008 | P1 | - | chưa có code | Mất mạng khi tạo trang |
| LP01-S02-TC001 | P0 | api | có code | Tạo trang trống qua API (HTTP) |
| LP01-S02-TC002 | P1 | api | có code | Thiếu tên (HTTP) |
| LP01-S02-TC003 | P2 | api | có code | Tên 120 và 121 ký tự (HTTP) |
| LP01-S02-TC004 | P2 | api | có code | Theme không hợp lệ (HTTP) |
| LP01-S02-TC005 | P2 | - | chưa có code | Tên toàn khoảng trắng qua API (LP01-F4) |
| LP01-S02-TC006 | P1 | api | có code | Trùng tên trong cùng tổ chức (HTTP) |
| LP01-S02-TC007 | P2 | api | có code | Slug do người dùng đặt (HTTP) |
| LP01-S02-TC008 | P0 | - | chưa có code | Slug đã dùng bởi tổ chức khác (subdomain) |
| LP01-S02-TC009 | P2 | api | có code | Slug quá 80 ký tự (HTTP) |
| LP01-S02-TC010 | P1 | api | có code | Chọn vừa trang trống vừa mẫu (HTTP) |
| LP01-S02-TC011 | P1 | - | chưa có code | Chọn vừa mẫu vừa draftSpec |
| LP01-S02-TC012 | P1 | - | chưa có code | draftSpec không hợp lệ |
| LP01-S03-TC001 | P0 | api | có code | Hai request cùng khóa đồng thời (HTTP) |
| LP01-S03-TC002 | P1 | api | có code | Khóa khác nhau thì tạo hai trang (HTTP) |
| LP01-S03-TC003 | P2 | - | chưa có code | Cùng khóa sau khi xóa trang (LP01-F5) |
| LP01-S03-TC004 | P1 | api | có code | Khóa theo tổ chức (HTTP) |
| LP01-S03-TC005 | P2 | api | có code | Không gửi khóa (HTTP) |
| LP01-S04-TC001 | P0 | - | chưa có code | Tạo từ mẫu qua trang chọn mẫu |
| LP01-S04-TC002 | P0 | api | có code | Sửa trang không làm đổi mẫu gốc (HTTP) |
| LP01-S04-TC003 | P1 | - | chưa có code | Hai trang từ cùng một mẫu độc lập nhau |
| LP01-S04-TC004 | P1 | api | có code | Mẫu không tồn tại (HTTP) |
| LP01-S04-TC005 | P1 | - | chưa có code | Mẫu nháp chưa xuất bản với người thường (LP01-F7) |
| LP01-S04-TC006 | P2 | - | chưa có code | Mẫu nháp với SUPER_ADMIN |
| LP01-S04-TC007 | P0 | - | chưa có code | Mẫu của tổ chức khác |
| LP01-S04-TC008 | P2 | - | chưa có code | Tạo từ mẫu bằng id thay vì slug |
| LP01-S04-TC009 | P2 | - | chưa có code | Mẫu có import HTML |
| LP01-S05-TC001 | P1 | - | chưa có code | Gợi ý brief thành công |
| LP01-S05-TC002 | P1 | api | có code | Thiếu ngành và sản phẩm (HTTP) |
| LP01-S05-TC003 | P2 | - | chưa có code | Thiếu khóa yêu cầu |
| LP01-S05-TC004 | P2 | - | chưa có code | Trường field không hợp lệ |
| LP01-S05-TC005 | P2 | - | chưa có code | Giới hạn gợi ý 12 lần mỗi phút |
| LP01-S05-TC006 | P1 | - | chưa có code | Sinh bản nháp AI hợp lệ |
| LP01-S05-TC007 | P1 | - | chưa có code | Thiếu sản phẩm hoặc khách hàng mục tiêu |
| LP01-S05-TC008 | P2 | - | chưa có code | Giá trị vượt giới hạn trường |
| LP01-S05-TC009 | P0 | - | chưa có code | Lưu bản AI thành trang (xác nhận xem trước) |
| LP01-S05-TC010 | P1 | - | chưa có code | Không trừ credit khi sinh bằng AI (LP01-F1) |
| LP01-S05-TC011 | P1 | - | chưa có code | AI lỗi vẫn có bản nháp dự phòng |
| LP01-S05-TC012 | P1 | - | chưa có code | Áp bản AI lên trang có sẵn không ghi đè nội dung người dùng |
| LP01-S05-TC013 | P2 | - | chưa có code | Trang đổi trong lúc AI chạy |
| LP01-S05-TC014 | P2 | - | chưa có code | Sinh AI trên trang đã lưu trữ |
| LP01-S06-TC001 | P1 | - | chưa có code | Phân tích URL công khai |
| LP01-S06-TC002 | P2 | - | chưa có code | Gọi lại cùng URL trong 10 phút |
| LP01-S06-TC003 | P2 | - | chưa có code | URL quá ngắn hoặc quá dài |
| LP01-S06-TC004 | P0 | api | có code | Chặn địa chỉ nội bộ (SSRF) (HTTP) |
| LP01-S06-TC005 | P2 | - | chưa có code | URL không tải được hoặc quá lớn |
| LP01-S06-TC006 | P2 | - | chưa có code | Giới hạn 10 lần mỗi phút |
| LP01-S06-TC007 | P1 | - | chưa có code | Giao diện Phân tích URL |
| LP01-S06-TC008 | P1 | - | chưa có code | URL lỗi vẫn tạo được bản nháp từ form |
| LP01-S07-TC001 | P1 | - | chưa có code | Điền form tạo rồi tải lại trang |
| LP01-S07-TC002 | P2 | - | chưa có code | LocalStorage bị chặn |
| LP01-S07-TC003 | P2 | - | chưa có code | Nhãn danh mục tiếng Việt |
| LP01-S07-TC004 | P1 | - | chưa có code | Dùng hồ sơ doanh nghiệp để điền form |
| LP01-S07-TC005 | P0 | api | có code | Người chỉ có quyền đọc không tạo được (HTTP) |
| LP01-S07-TC006 | P0 | api | có code | Không có token (HTTP) |
| LP01-S07-TC007 | P0 | api | có code | Trang tạo thuộc đúng tổ chức (HTTP) |
| LP01-S07-TC008 | P1 | - | chưa có code | Người dùng chưa đăng nhập vào trang tạo |
| LP02-S01-TC001 | P0 | - | chưa có code | Catalog hợp lệ |
| LP02-S01-TC002 | P0 | - | chưa có code | Số mẫu trong cơ sở dữ liệu khớp catalog |
| LP02-S01-TC003 | P1 | - | chưa có code | Đồng bộ lại không ghi lại khi không đổi |
| LP02-S01-TC004 | P1 | - | chưa có code | Slug mẫu hợp lệ |
| LP02-S01-TC005 | P1 | - | chưa có code | Mỗi mẫu dùng được để tạo trang |
| LP02-S01-TC006 | P1 | - | chưa có code | Các mẫu không giống nhau về cấu trúc |
| LP02-S02-TC001 | P0 | api | có code | Mở thư viện mẫu (HTTP) |
| LP02-S02-TC002 | P0 | api | có code | Lọc theo ngành (HTTP) |
| LP02-S02-TC003 | P1 | - | chưa có code | Lọc theo kiểu (theme) |
| LP02-S02-TC004 | P2 | api | có code | Theme không hợp lệ (HTTP) |
| LP02-S02-TC005 | P1 | - | chưa có code | Lọc theo họ thiết kế và mục tiêu chuyển đổi |
| LP02-S02-TC006 | P2 | api | có code | Danh mục lạ trả danh sách rỗng (LP02-F3) (HTTP) |
| LP02-S02-TC007 | P1 | - | chưa có code | Tìm kiếm từ khóa |
| LP02-S02-TC008 | P2 | - | chưa có code | includeSystem=false (LP02-F1) |
| LP02-S02-TC009 | P2 | - | chưa có code | Thứ tự sắp xếp |
| LP02-S02-TC010 | P1 | api | có code | Cấu trúc một mục mẫu (HTTP) |
| LP02-S02-TC011 | P2 | - | chưa có code | Nhãn danh mục tiếng Việt |
| LP02-S03-TC001 | P0 | - | chưa có code | Xem chi tiết một mẫu |
| LP02-S03-TC002 | P1 | - | chưa có code | Xem trước ba khung hình |
| LP02-S03-TC003 | P1 | api | có code | Mẫu không tồn tại (HTTP) |
| LP02-S03-TC004 | P0 | - | chưa có code | Mẫu nháp ẩn với người thường |
| LP02-S03-TC005 | P1 | - | chưa có code | Xem trước HTML công khai của mẫu |
| LP02-S03-TC006 | P0 | - | chưa có code | Bản nháp HTML cần khóa |
| LP02-S03-TC007 | P1 | - | chưa có code | Id mẫu sai định dạng khi mở HTML hoặc ảnh |
| LP02-S03-TC008 | P2 | - | chưa có code | Ảnh mẫu tải được hoặc hỏng không vỡ trang |
| LP02-S04-TC001 | P1 | - | chưa có code | Một mẫu mỗi ngành ở ba khung |
| LP02-S04-TC002 | P1 | - | chưa có code | Kiểm toàn bộ 200 mẫu × 3 khung |
| LP02-S04-TC003 | P0 | - | chưa có code | Mẫu pilot Agency Portfolio được cách ly |
| LP02-S04-TC004 | P0 | - | chưa có code | Khách hàng cũ không bị đổi giao diện |
| LP02-S04-TC005 | P1 | - | chưa có code | Nhóm agency, spa, lô 1 |
| LP02-S05-TC001 | P0 | - | chưa có code | Bấm Sử dụng mẫu |
| LP02-S05-TC002 | P0 | - | chưa có code | Sửa trang không đổi mẫu gốc |
| LP02-S05-TC003 | P0 | - | chưa có code | Trang khách cũ không đổi khi mẫu được sửa (LP09) |
| LP02-S05-TC004 | P1 | - | chưa có code | Mẫu nháp chưa xuất bản không tạo được |
| LP02-S05-TC005 | P1 | - | chưa có code | Hai trang cùng mẫu độc lập |
| LP02-S05-TC006 | P2 | - | chưa có code | Mẫu của tổ chức trùng slug với mẫu hệ thống (LP02-F4) |
| LP02-S06-TC001 | P0 | - | chưa có code | Mẫu có pack:managed không bị ghi đè (LP02-F2) |
| LP02-S06-TC002 | P1 | - | chưa có code | Mẫu mồ côi không có tag bị xóa (LP02-F2) |
| LP02-S06-TC003 | P2 | - | chưa có code | Slug trùng trong DB được khử |
| LP02-S06-TC004 | P2 | - | chưa có code | Lỗi đồng bộ không chặn khởi động |
| LP02-S06-TC005 | P2 | - | chưa có code | Gọi danh sách khi chưa đồng bộ |
| LP02-S07-TC001 | P0 | api | có code | Người thường không thấy mẫu nháp, SUPER_ADMIN thấy (HTTP) |
| LP02-S07-TC002 | P1 | - | chưa có code | Người chỉ xem có thể xem mẫu |
| LP02-S07-TC003 | P0 | api | có code | Không có token (HTTP) |
| LP02-S07-TC004 | P0 | - | chưa có code | Mẫu riêng của tổ chức không lộ cho tổ chức khác |
| LP02-S07-TC005 | P2 | - | chưa có code | Đếm mẫu ở tổng quan |
| LP03-S01-TC001 | P0 | - | chưa có code | Chỉnh tiêu đề trang smoke [SMOKE] |
| LP03-S01-TC002 | P0 | - | chưa có code | Chọn một element hiện thanh công cụ ở góc trên phải |
| LP03-S01-TC003 | P1 | - | chưa có code | Di chuột sang thanh công cụ không làm mất thanh |
| LP03-S01-TC004 | P1 | - | chưa có code | Di chuột sang element khác khi đang chọn |
| LP03-S01-TC005 | P1 | - | chưa có code | Cuộn trang khi có thanh công cụ |
| LP03-S01-TC006 | P1 | - | chưa có code | Menu chuột phải |
| LP03-S01-TC007 | P1 | - | chưa có code | Thanh công cụ không lệch sau Undo/Redo hoặc đóng Inspector |
| LP03-S01-TC008 | P1 | - | chưa có code | Nhân bản, xóa một element |
| LP03-S01-TC009 | P2 | - | chưa có code | Sao chép và dán |
| LP03-S02-TC001 | P0 | - | chưa có code | Kéo element theo con trỏ trong không gian trống |
| LP03-S02-TC002 | P0 | - | chưa có code | Resize bằng tay nắm cạnh phải |
| LP03-S02-TC003 | P1 | - | chưa có code | Resize dừng trước element kề bên |
| LP03-S02-TC004 | P1 | - | chưa có code | Nhấn Escape để hủy thao tác |
| LP03-S02-TC005 | P0 | - | chưa có code | Thả chuột ngoài cửa sổ trình duyệt |
| LP03-S02-TC006 | P1 | - | chưa có code | Kéo ra ngoài khung canvas |
| LP03-S02-TC007 | P2 | - | chưa có code | Resize sau khi xoay |
| LP03-S02-TC008 | P1 | - | chưa có code | Kéo element không chồng lên element khác |
| LP03-S02-TC009 | P1 | - | chưa có code | Cấu trúc kéo thả giữ khi tải lại |
| LP03-S03-TC001 | P1 | - | chưa có code | Chọn nhiều và tạo nhóm |
| LP03-S03-TC002 | P0 | - | chưa có code | Di chuyển nhóm giữ khoảng cách tương đối |
| LP03-S03-TC003 | P1 | - | chưa có code | Nhóm hỗn hợp có ảnh |
| LP03-S03-TC004 | P0 | unit | có code | Lưu và tải lại nhóm (logic) |
| LP03-S03-TC005 | P1 | - | chưa có code | Undo một bước cho mỗi thao tác nhóm |
| LP03-S03-TC006 | P0 | - | chưa có code | Chuột không bị dính sau khi thả nhóm |
| LP03-S03-TC007 | P1 | unit | có code | Nhóm có phần tử khóa (logic) |
| LP03-S03-TC008 | P1 | - | chưa có code | Nhân bản nhóm lưu đúng |
| LP03-S03-TC009 | P2 | - | chưa có code | Menu nhóm vừa khung nhìn |
| LP03-S04-TC001 | P0 | - | chưa có code | Gõ có dấu cách đầu cuối |
| LP03-S04-TC002 | P0 | - | chưa có code | Phím Space khi đang sửa chữ không bị chặn |
| LP03-S04-TC003 | P1 | - | chưa có code | Thanh công cụ chữ nhanh |
| LP03-S04-TC004 | P1 | - | chưa có code | Hộp chữ và định dạng giữ sau lưu |
| LP03-S04-TC005 | P1 | - | chưa có code | Không vòng lặp con trỏ khi gõ |
| LP03-S04-TC006 | P1 | - | chưa có code | Undo/Redo khi đang sửa chữ |
| LP03-S04-TC007 | P2 | - | chưa có code | Dán văn bản có định dạng |
| LP03-S04-TC008 | P2 | - | chưa có code | Chữ rất dài |
| LP03-S05-TC001 | P1 | - | chưa có code | Thay ảnh từ thư viện |
| LP03-S05-TC002 | P0 | - | chưa có code | Tải ảnh lên hợp lệ |
| LP03-S05-TC003 | P1 | - | chưa có code | Định dạng không cho phép |
| LP03-S05-TC004 | P1 | - | chưa có code | Ảnh quá lớn |
| LP03-S05-TC005 | P2 | - | chưa có code | Ảnh nền cho phép video |
| LP03-S05-TC006 | P0 | - | chưa có code | Tên tệp nguy hiểm |
| LP03-S05-TC007 | P1 | - | chưa có code | Phần mở rộng giả (nội dung không phải ảnh) |
| LP03-S05-TC008 | P0 | - | chưa có code | Ảnh của tổ chức khác không lộ trong thư viện |
| LP03-S05-TC009 | P0 | - | chưa có code | Tải ảnh lên trang của tổ chức khác |
| LP03-S06-TC001 | P1 | unit | có code | Ẩn element và giữ sau reload (logic) |
| LP03-S06-TC002 | P1 | unit | có code | Khóa element và giữ sau reload (logic) |
| LP03-S06-TC003 | P1 | unit | có code | Section đang khóa: không sửa (logic) |
| LP03-S06-TC004 | P1 | - | chưa có code | Section đang khóa: không xóa |
| LP03-S06-TC005 | P1 | - | chưa có code | Xóa nhiều bỏ qua mục khóa |
| LP03-S06-TC006 | P2 | - | chưa có code | Menu cho section khóa |
| LP03-S06-TC007 | P2 | - | chưa có code | Hành động bị chặn không xóa nhánh Redo |
| LP03-S07-TC001 | P0 | - | chưa có code | Kéo khối Lead Form tự do, không toolbar thừa |
| LP03-S07-TC002 | P1 | - | chưa có code | Sửa nhãn và placeholder của form |
| LP03-S07-TC003 | P1 | - | chưa có code | Cấu hình CRM của form |
| LP03-S07-TC004 | P1 | - | chưa có code | Chuyển sang Mobile không đổi layout Desktop |
| LP03-S07-TC005 | P2 | - | chưa có code | Element không có thiết kế Mobile |
| LP03-S07-TC006 | P1 | - | chưa có code | Lỗi console khi dùng builder |
| LP04-S01-TC001 | P0 | - | chưa có code | Thả element xuống dưới tạo hàng mới |
| LP04-S01-TC002 | P0 | - | chưa có code | Thả vào cột có sẵn để xếp chồng |
| LP04-S01-TC003 | P1 | - | chưa có code | Chỉ báo vị trí thả đúng kiểu |
| LP04-S01-TC004 | P1 | - | chưa có code | Xóa element cuối của một cột |
| LP04-S01-TC005 | P1 | - | chưa có code | Xóa element khi cột còn element khác |
| LP04-S01-TC006 | P1 | - | chưa có code | Di chuyển element giữa các hàng cân bằng lại |
| LP04-S01-TC007 | P1 | - | chưa có code | Undo và Redo với thao tác hàng/cột |
| LP04-S01-TC008 | P0 | - | chưa có code | Trang cũ không có hàng vẫn hiển thị nguyên |
| LP04-S01-TC009 | P1 | - | chưa có code | Element của section khác không bị ảnh hưởng |
| LP04-S01-TC010 | P2 | - | chưa có code | Section bị khóa không hiện chỉ báo cột |
| LP04-S02-TC001 | P0 | - | chưa có code | Từ 1 cột chia thành 2 |
| LP04-S02-TC002 | P1 | - | chưa có code | Từ 2 chia thành 3 |
| LP04-S02-TC003 | P1 | - | chưa có code | Từ 3 chia thành 4, thả bên trái cột đầu |
| LP04-S02-TC004 | P1 | - | chưa có code | Giới hạn cột (LP04-F1) |
| LP04-S02-TC005 | P2 | - | chưa có code | Cổng kiểm chia cột bằng mã nguồn |
| LP04-S02-TC006 | P0 | - | chưa có code | Cột trên Mobile xếp dọc đúng thứ tự |
| LP04-S02-TC007 | P1 | - | chưa có code | Chia cột không làm thay đổi Desktop khi sửa ở Mobile |
| LP04-S03-TC001 | P0 | - | chưa có code | Section tự giãn theo nội dung |
| LP04-S03-TC002 | P1 | - | chưa có code | Đổi nền section |
| LP04-S03-TC003 | P1 | - | chưa có code | Khoảng đệm (padding) và chiều cao tối thiểu |
| LP04-S03-TC004 | P1 | - | chưa có code | Section rất cao hoặc nhiều phần tử |
| LP04-S03-TC005 | P2 | - | chưa có code | Ảnh nền video |
| LP04-S03-TC006 | P1 | - | chưa có code | Tràn nội dung trên Mobile |
| LP04-S04-TC001 | P1 | - | chưa có code | Thư viện section đủ mẫu và dựng được (LP04-F2) |
| LP04-S04-TC002 | P1 | - | chưa có code | Xem trước section khớp trang thật |
| LP04-S04-TC003 | P0 | - | chưa có code | Thêm section bằng nhấp |
| LP04-S04-TC004 | P0 | - | chưa có code | Thêm section bằng kéo thả |
| LP04-S04-TC005 | P1 | - | chưa có code | Thêm element vào ô lưới |
| LP04-S04-TC006 | P1 | - | chưa có code | Thêm đoạn văn, danh sách, nhóm nút, thư viện ảnh |
| LP04-S04-TC007 | P2 | - | chưa có code | Thêm phần trống |
| LP04-S04-TC008 | P0 | - | chưa có code | Chèn nội dung không chồng lên tiêu đề hay hộp |
| LP04-S04-TC009 | P1 | - | chưa có code | Thêm section khi ở chế độ vị trí tự do |
| LP04-S04-TC010 | P2 | - | chưa có code | Xóa native box giữ quyền sở hữu React |
| LP04-S05-TC001 | P1 | - | chưa có code | Chế độ Inspector (thu gọn, nổi, kéo) |
| LP04-S05-TC002 | P1 | - | chưa có code | Tab thiết kế theo ngữ cảnh |
| LP04-S05-TC003 | P0 | - | chưa có code | Đổi theme nhanh |
| LP04-S05-TC004 | P1 | - | chưa có code | Theme giữ sau reload |
| LP04-S05-TC005 | P2 | - | chưa có code | CSS tùy biến |
| LP04-S05-TC006 | P2 | - | chưa có code | Màu thương hiệu từ hồ sơ doanh nghiệp |
| LP04-S06-TC001 | P0 | - | chưa có code | Chuyển khung thiết bị |
| LP04-S06-TC002 | P1 | - | chưa có code | Chỉnh riêng bố cục Mobile |
| LP04-S06-TC003 | P0 | - | chưa có code | Xem trước toàn màn hình giống bản công khai |
| LP04-S06-TC004 | P0 | - | chưa có code | Xem trước không gửi lead thật |
| LP04-S06-TC005 | P2 | - | chưa có code | Xoay thiết bị và cỡ cửa sổ rất nhỏ |
| LP04-S07-TC001 | P1 | - | chưa có code | Xóa cột đang có nội dung |
| LP04-S07-TC002 | P2 | - | chưa có code | Thêm section khi đang chọn element |
| LP04-S07-TC003 | P1 | - | chưa có code | Nhân bản section |
| LP04-S07-TC004 | P1 | - | chưa có code | Xóa section và Undo |
| LP04-S07-TC005 | P1 | - | chưa có code | Sắp xếp lại thứ tự section |
| LP05-S01-TC001 | P0 | unit | có code | Lưu lần đầu với baseRevision khớp (logic) |
| LP05-S01-TC001 | P0 | api | có code | Lưu lần đầu với baseRevision khớp (HTTP) |
| LP05-S01-TC002 | P0 | unit | có code | Lưu tiếp theo, revision tăng đơn điệu (logic) |
| LP05-S01-TC003 | P0 | unit | có code | Gửi lại đúng request vì mất phản hồi (idempotent) (logic) |
| LP05-S01-TC003 | P0 | api | có code | Gửi lại đúng request vì mất phản hồi (idempotent) (HTTP) |
| LP05-S01-TC004 | P0 | unit | có code | Dùng lại requestId với nội dung khác (logic) |
| LP05-S01-TC004 | P0 | api | có code | Dùng lại requestId với nội dung khác (HTTP) |
| LP05-S01-TC005 | P0 | unit | có code | Base revision cũ bị từ chối (tab thứ hai) (logic) |
| LP05-S01-TC005 | P0 | api | có code | Base revision cũ bị từ chối (tab thứ hai) (HTTP) |
| LP05-S01-TC006 | P1 | unit | có code | Lưu lại đúng bản đang có không tăng revision (logic) |
| LP05-S01-TC007 | P0 | unit | có code | Cùng revision nhưng nội dung khác (logic) |
| LP05-S01-TC008 | P1 | unit | có code | Không gửi baseRevision, clientRevision nhỏ hơn server (logic) |
| LP05-S01-TC009 | P2 | unit | có code | Không gửi baseRevision, clientRevision lớn hơn server (logic) |
| LP05-S01-TC010 | P2 | unit | có code | Revision không phải số hữu hạn (logic) |
| LP05-S01-TC011 | P1 | api | có code | Thiếu draftSpec hoặc sai kiểu (HTTP) |
| LP05-S01-TC012 | P2 | api | có code | Tên trang qua autosave (HTTP) |
| LP05-S01-TC013 | P2 | api | có code | Autosave cập nhật SEO và theme của bản ghi (HTTP) |
| LP05-S02-TC001 | P0 | - | chưa có code | Tự lưu sau khi dừng gõ |
| LP05-S02-TC002 | P1 | - | chưa có code | Gõ liên tục không gây lưu liên tục |
| LP05-S02-TC003 | P1 | - | chưa có code | Nút Lưu thủ công |
| LP05-S02-TC004 | P0 | - | chưa có code | Hai lần lưu chồng nhau xếp hàng |
| LP05-S02-TC005 | P1 | - | chưa có code | Lưu quá 20 giây thì hủy và báo |
| LP05-S02-TC006 | P1 | - | chưa có code | Lỗi server khi lưu |
| LP05-S02-TC007 | P0 | - | chưa có code | Lưu khi vừa thoát trang |
| LP05-S02-TC008 | P2 | - | chưa có code | Ghi nháp cục bộ sau 400 ms |
| LP05-S02-TC009 | P1 | - | chưa có code | Lưu một trang đã lưu trữ |
| LP05-S02-TC010 | P1 | - | chưa có code | Lưu khi mất phiên đăng nhập |
| LP05-S03-TC001 | P0 | api | có code | Hai tab, tab sau bị từ chối (HTTP) |
| LP05-S03-TC002 | P0 | - | chưa có code | Tab thua giữ bản của mình ở máy |
| LP05-S03-TC003 | P0 | - | chưa có code | Tải bản mới nhất sau xung đột |
| LP05-S03-TC004 | P0 | - | chưa có code | Xuất bản bị chặn khi đang xung đột |
| LP05-S03-TC005 | P1 | unit | có code | Mất phản hồi sau khi server đã lưu (logic) |
| LP05-S03-TC006 | P1 | - | chưa có code | Người khác đổi trang bằng AI/Page Doctor trong lúc tab mở (LP05-F3) |
| LP05-S03-TC007 | P0 | api | có code | Ghi đồng thời hai request lên cùng trang (HTTP) |
| LP05-S04-TC001 | P0 | unit | có code | Khôi phục bản nháp khi server chưa đổi (logic) |
| LP05-S04-TC002 | P0 | unit | có code | Server đã đổi so với bản nháp cục bộ (logic) |
| LP05-S04-TC003 | P0 | - | chưa có code | Chọn khôi phục bản máy |
| LP05-S04-TC004 | P1 | - | chưa có code | recover-draft khi base khớp |
| LP05-S04-TC005 | P0 | - | chưa có code | recover-draft không bao giờ ghi bản đã xuất bản |
| LP05-S04-TC006 | P1 | unit | có code | Nháp cục bộ đã được server xác nhận thì bị xóa (logic) |
| LP05-S04-TC007 | P1 | - | chưa có code | Chỉnh sửa tiếp trong lúc đang chờ quyết định khôi phục |
| LP05-S04-TC008 | P2 | unit | có code | Trình duyệt chặn localStorage (logic) |
| LP05-S05-TC001 | P0 | api | có code | Lưu, tải lại và xuất bản trang [SMOKE] (HTTP) |
| LP05-S05-TC002 | P0 | - | chưa có code | Xuất bản kèm thay đổi chưa lưu |
| LP05-S05-TC003 | P0 | - | chưa có code | Xuất bản khi đang có autosave chạy |
| LP05-S05-TC004 | P0 | unit | có code | clientRevision cũ bị từ chối (logic) |
| LP05-S05-TC004 | P0 | api | có code | clientRevision cũ bị từ chối (HTTP) |
| LP05-S05-TC005 | P1 | unit | có code | clientRevision lớn hơn server (logic) |
| LP05-S05-TC005 | P1 | api | có code | clientRevision lớn hơn server (HTTP) |
| LP05-S05-TC006 | P1 | unit | có code | Xuất bản không gửi clientRevision (LP05-F6) (logic) |
| LP05-S05-TC007 | P1 | unit | có code | Xuất bản không đổi revision khi không sửa gì (logic) |
| LP05-S05-TC008 | P0 | - | chưa có code | Nội dung xuất bản sao chép từ bản nháp đã làm sạch |
| LP05-S05-TC009 | P1 | - | chưa có code | Spec không hợp lệ không xuất bản được |
| LP05-S05-TC010 | P1 | - | chưa có code | Xuất bản tạo phiên bản và ghi chú |
| LP05-S05-TC011 | P2 | api | có code | Ghi chú xuất bản 501 ký tự (HTTP) |
| LP05-S05-TC012 | P0 | api | có code | Xuất bản lại sau khi sửa (HTTP) |
| LP05-S05-TC013 | P1 | - | chưa có code | Xuất bản trang đã lưu trữ |
| LP05-S05-TC014 | P0 | - | chưa có code | Xuất bản trang tạm sửa mẫu (LP09) |
| LP05-S05-TC015 | P1 | - | chưa có code | Lỗi xuất bản giữ nguyên bản công khai |
| LP05-S06-TC001 | P0 | - | chưa có code | Gỡ xuất bản từ danh sách trang |
| LP05-S06-TC002 | P0 | api | có code | Gỡ xuất bản qua API (HTTP) |
| LP05-S06-TC003 | P1 | - | chưa có code | Cache công khai sau khi gỡ qua API (LP05-F5) |
| LP05-S06-TC004 | P1 | - | chưa có code | Gỡ xuất bản một trang chưa xuất bản |
| LP05-S06-TC005 | P2 | - | chưa có code | Gỡ xuất bản trang đã lưu trữ |
| LP05-S06-TC006 | P2 | - | chưa có code | Làm mới cache với slug sai |
| LP05-S06-TC007 | P1 | api | có code | Xuất bản lại sau khi gỡ (HTTP) |
| LP05-S07-TC001 | P1 | api | có code | Danh sách phiên bản (HTTP) |
| LP05-S07-TC002 | P2 | - | chưa có code | Phân loại kind theo ghi chú |
| LP05-S07-TC003 | P1 | - | chưa có code | Đọc một phiên bản |
| LP05-S07-TC004 | P0 | - | chưa có code | Khôi phục phiên bản cũ |
| LP05-S07-TC005 | P0 | - | chưa có code | Khôi phục không đổi bản đã xuất bản |
| LP05-S07-TC006 | P0 | - | chưa có code | Revision sau khôi phục đơn điệu |
| LP05-S07-TC007 | P2 | - | chưa có code | Ghi chú tùy chọn khi khôi phục |
| LP05-S07-TC008 | P0 | api | có code | Khôi phục phiên bản không tồn tại hoặc của trang khác (HTTP) |
| LP05-S07-TC009 | P2 | - | chưa có code | Khôi phục khi trang đã lưu trữ |
| LP05-S07-TC010 | P1 | - | chưa có code | Giao diện lịch sử phiên bản |
| LP05-S07-TC011 | P1 | - | chưa có code | Undo và Redo không đụng lịch sử server |
| LP05-S08-TC001 | P0 | api | có code | Người chỉ xem không lưu và không xuất bản (HTTP) |
| LP05-S08-TC002 | P1 | - | chưa có code | Người chỉ xem mở builder |
| LP05-S08-TC003 | P0 | api | có code | Tổ chức khác không thao tác được (HTTP) |
| LP05-S08-TC004 | P0 | api | có code | Không có token (HTTP) |
| LP05-S08-TC005 | P2 | api | có code | Id không tồn tại (HTTP) |
| LP05-S08-TC006 | P1 | - | chưa có code | Trang tạm sửa mẫu không có trong danh sách (LP08, LP09) |
| LP06-S01-TC001 | P0 | api | có code | Gửi form trang smoke và xác nhận lead đúng tổ chức, đúng nguồn [SMOKE] (HTTP) |
| LP06-S01-TC002 | P0 | api | có code | Phản hồi API đúng cấu trúc (HTTP) |
| LP06-S01-TC003 | P0 | api | có code | Chỉ có email (HTTP) |
| LP06-S01-TC004 | P0 | api | có code | Chỉ có số điện thoại (HTTP) |
| LP06-S01-TC005 | P1 | - | chưa có code | Tên trường thay thế được nhận diện |
| LP06-S01-TC006 | P2 | - | chưa có code | Không có tên |
| LP06-S01-TC007 | P1 | - | chưa có code | Các trường phụ vào ghi chú |
| LP06-S01-TC008 | P1 | - | chưa có code | Thuộc tính truy vết mặc định |
| LP06-S01-TC009 | P1 | - | chưa có code | Thuộc tính truy vết UTM từ link |
| LP06-S01-TC010 | P2 | - | chưa có code | Gửi từ nhiều khối form |
| LP06-S01-TC011 | P1 | - | chưa có code | Gửi form khi đang xem Preview |
| LP06-S01-TC012 | P0 | api | có code | Nhấp đúp nút gửi (HTTP) |
| LP06-S02-TC001 | P0 | api | có code | Thiếu cả SĐT và email (HTTP) |
| LP06-S02-TC002 | P1 | api | có code | fields rỗng hoặc sai kiểu (HTTP) |
| LP06-S02-TC003 | P2 | - | chưa có code | SĐT và email chỉ gồm khoảng trắng |
| LP06-S02-TC004 | P1 | - | chưa có code | Email sai định dạng (LP06-F1) |
| LP06-S02-TC005 | P1 | - | chưa có code | SĐT chứa chữ và ký tự lạ (LP06-F1) |
| LP06-S02-TC006 | P1 | - | chưa có code | Trường quá dài |
| LP06-S02-TC007 | P2 | - | chưa có code | Tên trường lạ bị làm sạch |
| LP06-S02-TC008 | P0 | api | có code | Chèn thẻ HTML (LP06-F4) (HTTP) |
| LP06-S02-TC009 | P1 | - | chưa có code | Ký tự < đứng riêng (LP06-F4) |
| LP06-S02-TC010 | P1 | - | chưa có code | SQL injection trong trường |
| LP06-S02-TC011 | P2 | - | chưa có code | Unicode và emoji |
| LP06-S02-TC012 | P2 | - | chưa có code | Giới hạn kích thước body |
| LP06-S03-TC001 | P0 | api | có code | Honeypot (HTTP) |
| LP06-S03-TC002 | P2 | - | chưa có code | Honeypot với trang không tồn tại |
| LP06-S03-TC003 | P0 | api | có code | Gửi lặp cùng SĐT trong 12 giây (HTTP) |
| LP06-S03-TC004 | P0 | - | chưa có code | Gửi lại sau 12 giây gộp vào lead cũ |
| LP06-S03-TC005 | P1 | - | chưa có code | Chống lặp cùng email, khác hoa thường |
| LP06-S03-TC006 | P1 | api | có code | Giới hạn 8 lần mỗi 10 phút cho một trang và một IP (HTTP) |
| LP06-S03-TC007 | P2 | - | chưa có code | Giới hạn 30 lần mỗi giờ cho một IP |
| LP06-S03-TC008 | P1 | - | chưa có code | Giả IP qua X-Forwarded-For (LP06-F7) |
| LP06-S03-TC009 | P2 | - | chưa có code | Người dùng thật cùng mạng công ty |
| LP06-S04-TC001 | P0 | - | chưa có code | Lead hiển thị ở /leads với nguồn Landing Page |
| LP06-S04-TC002 | P0 | - | chưa có code | Tách dữ liệu giữa hai tổ chức |
| LP06-S04-TC003 | P1 | - | chưa có code | Nguồn lead tự tạo khi chưa có |
| LP06-S04-TC004 | P2 | - | chưa có code | Nguồn lead bị tắt được bật lại |
| LP06-S04-TC005 | P1 | - | chưa có code | Cấu hình CRM của khối form |
| LP06-S04-TC006 | P1 | - | chưa có code | Lead gắn đúng trang |
| LP06-S04-TC007 | P2 | - | chưa có code | Điểm lead tăng khi gửi form |
| LP06-S04-TC008 | P2 | - | chưa có code | Xuất lead cho khách agency |
| LP06-S05-TC001 | P1 | api | có code | Ghi sự kiện xem trang (HTTP) |
| LP06-S05-TC002 | P1 | - | chưa có code | Ghi sự kiện bấm CTA và bắt đầu form |
| LP06-S05-TC003 | P1 | api | có code | eventType không hợp lệ (HTTP) |
| LP06-S05-TC004 | P1 | - | chưa có code | Gửi form tạo sự kiện lặp (LP06-F5) |
| LP06-S05-TC005 | P2 | - | chưa có code | Giới hạn tần suất sự kiện |
| LP06-S05-TC006 | P2 | - | chưa có code | Sự kiện honeypot |
| LP06-S05-TC007 | P1 | - | chưa có code | Sự kiện cho trang chưa xuất bản |
| LP06-S05-TC008 | P1 | - | chưa có code | Khách giả sự kiện LEAD |
| LP06-S06-TC001 | P0 | api | có code | Trang đã hủy xuất bản không nhận lead (HTTP) |
| LP06-S06-TC002 | P1 | api | có code | Trang nháp chưa từng xuất bản (HTTP) |
| LP06-S06-TC003 | P2 | - | chưa có code | Trang đã lưu trữ |
| LP06-S06-TC004 | P2 | api | có code | Slug không tồn tại (HTTP) |
| LP06-S06-TC005 | P0 | - | chưa có code | Slug trùng giữa hai tổ chức (LP06-F6) |
| LP06-S06-TC006 | P1 | - | chưa có code | Form khi chuyển renderer của trang cũ |
| LP06-S06-TC007 | P1 | - | chưa có code | Mất mạng khi gửi form |
| LP06-S07-TC001 | P1 | - | chưa có code | Form khóa học không có Công ty/Quy mô |
| LP06-S07-TC002 | P2 | - | chưa có code | Form B2B có Công ty |
| LP06-S07-TC003 | P1 | - | chưa có code | Form trong hero không nhảy vị trí |
| LP06-S07-TC004 | P1 | e2e | có code | Form không tràn ngang (HTTP) |
| LP06-S07-TC005 | P1 | - | chưa có code | Thông báo lỗi và thành công hiển thị |
| LP06-S07-TC006 | P2 | - | chưa có code | Bàn phím và hỗ trợ truy cập |
| LP06-S07-TC007 | P2 | - | chưa có code | Tự điền của trình duyệt |
| LP07-S01-TC001 | P0 | api | có code | Mở trang smoke trên /p/slug [SMOKE] (HTTP) |
| LP07-S01-TC002 | P0 | - | chưa có code | Nội dung giống bản trong builder |
| LP07-S01-TC003 | P0 | - | chưa có code | Phần tử vị trí tự do hiển thị đúng |
| LP07-S01-TC004 | P1 | - | chưa có code | Phần tử ẩn không hiển thị |
| LP07-S01-TC005 | P1 | e2e | có code | Responsive ba khung hình (HTTP) |
| LP07-S01-TC006 | P0 | api | có code | Nội dung đã làm sạch, không lộ dữ liệu builder (HTTP) |
| LP07-S01-TC007 | P2 | - | chưa có code | Chữ Unicode và emoji |
| LP07-S01-TC008 | P1 | - | chưa có code | Ảnh tải được, ảnh lỗi không vỡ trang |
| LP07-S01-TC009 | P2 | - | chưa có code | Mở bằng chữ hoa thường khác nhau |
| LP07-S01-TC010 | P2 | - | chưa có code | Slug có ký tự đặc biệt |
| LP07-S02-TC001 | P0 | api | có code | Trang nháp chưa xuất bản trả 404 (HTTP) |
| LP07-S02-TC002 | P0 | api | có code | Trang bị gỡ xuất bản trả 404 (HTTP) |
| LP07-S02-TC003 | P1 | api | có code | Trang đã lưu trữ trả 404 (HTTP) |
| LP07-S02-TC004 | P1 | api | có code | Trang bị xóa trả 404 (HTTP) |
| LP07-S02-TC005 | P0 | - | chưa có code | Trang tạm sửa mẫu không công khai |
| LP07-S02-TC006 | P2 | - | chưa có code | Lỗi API làm trang trả 404 thay vì 500 |
| LP07-S03-TC001 | P1 | - | chưa có code | Tiêu đề và mô tả trong HTML |
| LP07-S03-TC002 | P1 | - | chưa có code | Canonical |
| LP07-S03-TC003 | P1 | - | chưa có code | Robots index/noindex |
| LP07-S03-TC004 | P2 | - | chưa có code | Open Graph và Twitter card |
| LP07-S03-TC005 | P2 | - | chưa có code | JSON-LD |
| LP07-S03-TC006 | P1 | api | có code | Lưu SEO qua autosave đồng bộ vào bản ghi (HTTP) |
| LP07-S03-TC007 | P2 | api | có code | Giới hạn độ dài SEO qua PATCH (HTTP) |
| LP07-S03-TC008 | P1 | - | chưa có code | Ký tự đặc biệt trong SEO |
| LP07-S04-TC001 | P0 | api | có code | Tạo link xem trước (HTTP) |
| LP07-S04-TC002 | P1 | - | chưa có code | Chọn thời hạn |
| LP07-S04-TC003 | P1 | api | có code | Token mới thay token cũ (HTTP) |
| LP07-S04-TC004 | P0 | api | có code | Thu hồi link (HTTP) |
| LP07-S04-TC005 | P0 | - | chưa có code | Link hết hạn |
| LP07-S04-TC006 | P1 | - | chưa có code | Xem trước hiển thị bản nháp mới nhất |
| LP07-S04-TC007 | P2 | - | chưa có code | Trạng thái token |
| LP07-S04-TC008 | P1 | api | có code | Token sai hoặc quá ngắn (LP07-F6) (HTTP) |
| LP07-S04-TC009 | P2 | - | chưa có code | Giới hạn thử token |
| LP07-S04-TC010 | P2 | - | chưa có code | Link xem trước của trang đã lưu trữ |
| LP07-S04-TC011 | P0 | api | có code | Người chỉ xem không tạo được link (HTTP) |
| LP07-S04-TC012 | P0 | api | có code | Tổ chức khác không tạo hoặc thu hồi được (HTTP) |
| LP07-S05-TC001 | P1 | api | có code | Gắn tên miền hợp lệ (HTTP) |
| LP07-S05-TC002 | P1 | unit | có code | Chuẩn hóa tên miền (logic) |
| LP07-S05-TC003 | P1 | unit | có code | Tên miền không hợp lệ (logic) |
| LP07-S05-TC004 | P0 | api | có code | Chặn tên miền nội bộ (HTTP) |
| LP07-S05-TC005 | P2 | - | chưa có code | Gắn lại ghi đè và đặt về PENDING |
| LP07-S05-TC006 | P0 | api | có code | Tên miền đã dùng bởi trang khác (LP07-F3) (HTTP) |
| LP07-S05-TC007 | P1 | api | có code | Xác minh khi chưa gắn tên miền (HTTP) |
| LP07-S05-TC008 | P1 | unit | có code | Xác minh CNAME đúng (logic) |
| LP07-S05-TC009 | P1 | - | chưa có code | Xác minh CNAME sai hoặc chưa trỏ |
| LP07-S05-TC010 | P2 | - | chưa có code | CNAME dạng phụ của đích |
| LP07-S05-TC011 | P2 | - | chưa có code | Không có cách gỡ tên miền (LP07-F2) |
| LP07-S05-TC012 | P2 | - | chưa có code | Truy cập trang bằng tên miền riêng (LP07-F1) |
| LP07-S05-TC013 | P0 | api | có code | Phân quyền và tách tổ chức (HTTP) |
| LP07-S05-TC014 | P1 | - | chưa có code | Danh sách tên miền |
| LP07-S06-TC001 | P1 | api | có code | Lưu và nạp ID theo dõi (HTTP) |
| LP07-S06-TC002 | P1 | api | có code | Lọc ký tự < và > khi lưu (HTTP) |
| LP07-S06-TC003 | P0 | api | có code | ID chứa dấu nháy đơn (LP07-F4) (HTTP) |
| LP07-S06-TC004 | P2 | - | chưa có code | Ép kiểu dữ liệu theo dõi |
| LP07-S06-TC005 | P1 | - | chưa có code | Không nạp mã theo dõi khi xem trước |
| LP07-S07-TC001 | P0 | - | chưa có code | Cache làm mới sau khi xuất bản từ builder |
| LP07-S07-TC002 | P1 | - | chưa có code | Cache sau khi xuất bản qua API (LP05-F5) |
| LP07-S07-TC003 | P1 | - | chưa có code | Trang công khai không nạp mã builder |
| LP07-S07-TC004 | P2 | - | chưa có code | Tải trang trong ngưỡng chấp nhận |
| LP07-S07-TC005 | P0 | api | có code | Khách không đăng nhập vẫn xem được (HTTP) |
| LP07-S07-TC006 | P1 | - | chưa có code | Lỗi tải mẫu cũ sau khi triển khai bản mới |
| LP08-S01-TC001 | P0 | api | có code | Mở danh sách trang (HTTP) |
| LP08-S01-TC002 | P0 | api | có code | Lọc theo trạng thái (HTTP) |
| LP08-S01-TC003 | P2 | api | có code | Trạng thái không hợp lệ (HTTP) |
| LP08-S01-TC004 | P1 | api | có code | Tìm kiếm theo tên hoặc slug (HTTP) |
| LP08-S01-TC005 | P1 | - | chưa có code | Sắp xếp theo cập nhật mới nhất |
| LP08-S01-TC006 | P1 | - | chưa có code | Cột lượt truy cập và leads (LP08-F2) |
| LP08-S01-TC007 | P1 | - | chưa có code | Tổ chức mới chưa có trang |
| LP08-S01-TC008 | P1 | - | chưa có code | Hơn 100 trang (LP08-F3) |
| LP08-S01-TC009 | P2 | - | chưa có code | Kích thước phản hồi danh sách (LP08-F4) |
| LP08-S01-TC010 | P2 | - | chưa có code | Xem ảnh đại diện hỏng |
| LP08-S01-TC011 | P0 | api | có code | Không có quyền (HTTP) |
| LP08-S02-TC001 | P1 | - | chưa có code | Số liệu tổng quan |
| LP08-S02-TC002 | P2 | - | chưa có code | Bấm ô số liệu chuyển tới danh sách đã lọc |
| LP08-S02-TC003 | P1 | - | chưa có code | Trang gần đây |
| LP08-S02-TC004 | P2 | - | chưa có code | Số mẫu cho người thường và quản trị |
| LP08-S02-TC005 | P0 | api | có code | Tổng quan tách theo tổ chức (HTTP) |
| LP08-S02-TC006 | P1 | - | chưa có code | Trang sửa mẫu làm lệch số đếm (LP08-F1) |
| LP08-S03-TC001 | P0 | api | có code | Nhân đôi một trang (HTTP) |
| LP08-S03-TC002 | P0 | api | có code | Bản nhân đôi độc lập với bản gốc (HTTP) |
| LP08-S03-TC003 | P2 | - | chưa có code | Nhân đôi nhiều lần |
| LP08-S03-TC004 | P0 | api | có code | Lưu trữ một trang đã xuất bản (HTTP) |
| LP08-S03-TC005 | P0 | api | có code | Xóa một trang có xác nhận (HTTP) |
| LP08-S03-TC006 | P0 | - | chưa có code | Xóa trang đã có lead (LP08-F8) |
| LP08-S03-TC007 | P0 | api | có code | Xóa hàng loạt (HTTP) |
| LP08-S03-TC008 | P0 | api | có code | Xóa hàng loạt: id của tổ chức khác (HTTP) |
| LP08-S03-TC009 | P2 | api | có code | Xóa hàng loạt: dữ liệu sai (HTTP) |
| LP08-S03-TC010 | P2 | - | chưa có code | Xóa hàng loạt thất bại thì xóa tuần tự |
| LP08-S03-TC011 | P1 | - | chưa có code | Gỡ xuất bản từ menu |
| LP08-S03-TC012 | P1 | - | chưa có code | Xem trang công khai và chỉnh sửa thiết kế từ menu |
| LP08-S03-TC013 | P0 | api | có code | Người chỉ xem không có thao tác ghi (HTTP) |
| LP08-S03-TC014 | P2 | - | chưa có code | Xóa trang qua POST thay thế |
| LP08-S03-TC015 | P2 | api | có code | Id không tồn tại (HTTP) |
| LP08-S04-TC001 | P1 | - | chưa có code | Mở trang analytics |
| LP08-S04-TC002 | P0 | - | chưa có code | Số liệu khớp sự kiện (đối chiếu) |
| LP08-S04-TC003 | P1 | - | chưa có code | Tỷ lệ chuyển đổi |
| LP08-S04-TC004 | P1 | - | chưa có code | Khoảng thời gian |
| LP08-S04-TC005 | P1 | - | chưa có code | Lead đếm theo lần gửi (LP08-F5) |
| LP08-S04-TC006 | P1 | - | chưa có code | FORM_SUBMIT tính hai lần (LP08-F5, LP06-F5) |
| LP08-S04-TC007 | P1 | - | chưa có code | Phễu theo khách truy cập |
| LP08-S04-TC008 | P2 | - | chưa có code | Dữ liệu lớn bị cắt (LP08-F6) |
| LP08-S04-TC009 | P2 | api | có code | Ngày sai định dạng (LP08-F7) (HTTP) |
| LP08-S04-TC010 | P0 | api | có code | Lọc trang của tổ chức khác (HTTP) |
| LP08-S04-TC011 | P2 | - | chưa có code | Phân rã theo thiết bị và UTM |
| LP08-S04-TC012 | P2 | - | chưa có code | Số liệu theo khối form và CTA |
| LP08-S04-TC013 | P1 | - | chưa có code | Quyền xem analytics |
| LP08-S04-TC014 | P2 | - | chưa có code | Tổ chức chưa có sự kiện |
| LP08-S05-TC001 | P0 | api | có code | Không hiện trong danh sách (HTTP) |
| LP08-S05-TC002 | P0 | - | chưa có code | Không hiện ở trang gần đây |
| LP08-S05-TC003 | P1 | - | chưa có code | Vẫn mở được bằng id |
| LP08-S05-TC004 | P1 | - | chưa có code | Số đếm tổng quan (LP08-F1) |
| LP08-S05-TC005 | P2 | - | chưa có code | Nhân đôi hoặc xóa workbench |
| LP09-S01-TC001 | P0 | unit | có code | Chủ tổ chức bị chặn ở mọi route mẫu admin (logic) |
| LP09-S01-TC001 | P0 | api | có code | Chủ tổ chức bị chặn ở mọi route mẫu admin (HTTP) |
| LP09-S01-TC002 | P0 | api | có code | Người chỉ xem bị chặn (HTTP) |
| LP09-S01-TC003 | P0 | api | có code | Không có token (HTTP) |
| LP09-S01-TC004 | P1 | api | có code | SUPER_ADMIN thuộc tổ chức nào cũng dùng được (HTTP) |
| LP09-S01-TC005 | P0 | - | chưa có code | Menu Quản lý Templates chỉ hiện cho SUPER_ADMIN |
| LP09-S01-TC006 | P0 | - | chưa có code | Nút Sửa mẫu gốc chỉ hiện cho SUPER_ADMIN |
| LP09-S02-TC001 | P0 | api | có code | Mở phiên sửa mẫu lần đầu (HTTP) |
| LP09-S02-TC002 | P1 | - | chưa có code | API edit-session trả đủ thông tin |
| LP09-S02-TC003 | P0 | api | có code | Mở lại phiên dùng lại cùng trang (LP09-F2) (HTTP) |
| LP09-S02-TC004 | P1 | - | chưa có code | Mở lại phiên giữ bản nháp cũ dù mẫu đã đổi (LP09-F2) |
| LP09-S02-TC005 | P2 | - | chưa có code | Đặt lại phiên về mẫu hiện tại |
| LP09-S02-TC006 | P0 | - | chưa có code | Lưu vào mẫu (bản nháp) |
| LP09-S02-TC007 | P2 | - | chưa có code | Ảnh đại diện không đổi khi chỉ lưu nháp (LP09-F4) |
| LP09-S02-TC008 | P0 | - | chưa có code | Lưu và xuất bản mẫu |
| LP09-S02-TC009 | P1 | - | chưa có code | Thoát không lưu vào mẫu (LP09-F3) |
| LP09-S02-TC010 | P1 | - | chưa có code | Lưu khi builder đang xung đột hoặc chưa lưu kịp |
| LP09-S02-TC011 | P1 | - | chưa có code | Lưu mẫu khi chưa mở phiên |
| LP09-S02-TC012 | P1 | - | chưa có code | Không lưu mẫu trống |
| LP09-S02-TC013 | P1 | - | chưa có code | Mẫu chưa từng xuất bản giữ trạng thái nháp |
| LP09-S02-TC014 | P2 | api | có code | Slug mẫu không tồn tại (HTTP) |
| LP09-S02-TC015 | P1 | - | chưa có code | Hai admin cùng tổ chức sửa một mẫu |
| LP09-S03-TC001 | P0 | api | có code | Xuất bản trang làm việc bằng API thường bị chặn (HTTP) |
| LP09-S03-TC002 | P0 | - | chưa có code | Trang làm việc không hiện trong danh sách và tổng quan |
| LP09-S03-TC003 | P0 | - | chưa có code | Trang làm việc không mở được ở /p/slug |
| LP09-S03-TC004 | P0 | - | chưa có code | Trang khách tạo từ mẫu trước đó không đổi |
| LP09-S03-TC005 | P1 | - | chưa có code | Chỉ ghi vào bảng mẫu, không ghi vào trang người dùng |
| LP09-S03-TC006 | P2 | - | chưa có code | Tên trang làm việc quá dài |
| LP09-S04-TC001 | P0 | - | chưa có code | Tải một mẫu |
| LP09-S04-TC002 | P1 | - | chưa có code | Manifest đúng |
| LP09-S04-TC003 | P0 | unit | có code | Khóa nhạy cảm bị loại khỏi gói (logic) |
| LP09-S04-TC004 | P0 | - | chưa có code | Tải tất cả mẫu |
| LP09-S04-TC005 | P1 | unit | có code | Mỗi gói bên trong mở lại được (logic) |
| LP09-S04-TC006 | P2 | - | chưa có code | Tải tất cả khi danh sách trống |
| LP09-S04-TC007 | P2 | - | chưa có code | Tải khi mạng lỗi |
| LP09-S04-TC008 | P2 | unit | có code | Gói chỉ chứa HTML nguồn (logic) |
| LP09-S05-TC001 | P0 | - | chưa có code | Upload hàng loạt: tạo mới và cập nhật |
| LP09-S05-TC002 | P0 | unit | có code | Lỗi một tệp không dừng cả lô (logic) |
| LP09-S05-TC003 | P0 | unit | có code | ZIP tổng chứa nhiều gói (logic) |
| LP09-S05-TC004 | P1 | unit | có code | Gộp trùng cùng slug (logic) |
| LP09-S05-TC005 | P2 | unit | có code | Cấu hình ưu tiên nguồn (logic) |
| LP09-S05-TC006 | P1 | unit | có code | Vượt 300 mẫu (logic) |
| LP09-S05-TC007 | P1 | - | chưa có code | Không chọn tệp nào |
| LP09-S05-TC008 | P1 | - | chưa có code | Giới hạn dung lượng giao diện |
| LP09-S05-TC009 | P0 | unit | có code | Giới hạn nginx (LP09-F5) (logic) |
| LP09-S05-TC010 | P1 | unit | có code | Định dạng tệp không hỗ trợ (logic) |
| LP09-S05-TC011 | P1 | unit | có code | HTML quá lớn, ZIP quá lớn (một mẫu) (logic) |
| LP09-S05-TC012 | P1 | unit | có code | Gói thiếu thành phần hoặc sai (logic) |
| LP09-S05-TC013 | P0 | unit | có code | Mẫu phải giữ khối thu lead (logic) |
| LP09-S05-TC014 | P1 | unit | có code | Category và theme hợp lệ (logic) |
| LP09-S05-TC015 | P1 | - | chưa có code | Slug mẫu mới đã tồn tại (một mẫu) |
| LP09-S05-TC016 | P1 | - | chưa có code | Cập nhật mẫu: slug trong gói phải khớp |
| LP09-S05-TC017 | P0 | - | chưa có code | Cập nhật mẫu đã xuất bản |
| LP09-S05-TC018 | P2 | unit | có code | Tệp HTML được chuyển thành mẫu chỉnh sửa được (logic) |
| LP09-S05-TC019 | P1 | - | chưa có code | Giao diện báo cáo kết quả |
| LP09-S06-TC001 | P0 | - | chưa có code | Xuất bản mẫu từ trang quản lý |
| LP09-S06-TC002 | P1 | api | có code | Danh sách phiên bản của mẫu (HTTP) |
| LP09-S06-TC003 | P0 | - | chưa có code | Khôi phục phiên bản mẫu cũ (LP09-F7) |
| LP09-S06-TC004 | P1 | api | có code | Khôi phục phiên bản không tồn tại (HTTP) |
| LP09-S06-TC005 | P0 | - | chưa có code | Khởi động lại API không ghi đè mẫu đã sửa |
| LP09-S06-TC006 | P0 | - | chưa có code | Thay đổi mẫu không lan sang trang khách |
| LP09-S06-TC007 | P2 | - | chưa có code | Hai admin cùng thao tác trên một mẫu |
| LP09-S07-TC001 | P1 | - | chưa có code | Danh sách mẫu và số liệu |
| LP09-S07-TC002 | P1 | - | chưa có code | Nút Sửa dẫn vào builder |
| LP09-S07-TC003 | P2 | - | chưa có code | Trạng thái bận khóa các nút |
| LP09-S07-TC004 | P2 | - | chưa có code | Lỗi tải danh sách |
| LP09-S07-TC005 | P2 | - | chưa có code | Giao diện tiếng Anh và Việt |
| LP09-S07-TC006 | P2 | - | chưa có code | Responsive |
| LP10-S01-TC001 | P0 | - | chưa có code | Gợi ý 3 phương án cho tiêu đề |
| LP10-S01-TC002 | P0 | - | chưa có code | Chọn đoạn chữ và bấm AI viết lại trong builder |
| LP10-S01-TC003 | P1 | - | chưa có code | Ngữ cảnh gửi cho AI |
| LP10-S01-TC004 | P1 | - | chưa có code | Tất cả action và fieldKind hợp lệ |
| LP10-S01-TC005 | P1 | api | có code | Giá trị action hoặc fieldKind sai (HTTP) |
| LP10-S01-TC006 | P1 | - | chưa có code | Nội dung quá ngắn dùng gợi ý dự phòng, không tốn credit (LP10-F2) |
| LP10-S01-TC007 | P0 | - | chưa có code | Trừ credit cho mỗi lần gọi AI (LP10-F1) |
| LP10-S01-TC008 | P1 | - | chưa có code | Nhà cung cấp AI lỗi: dự phòng kèm cảnh báo, không trừ credit (LP10-F2) |
| LP10-S01-TC009 | P0 | - | chưa có code | Hết credit |
| LP10-S01-TC010 | P2 | - | chưa có code | Giới hạn 20 lần mỗi phút mỗi người |
| LP10-S01-TC011 | P1 | - | chưa có code | Chống gửi trùng trong 3 giây |
| LP10-S01-TC012 | P2 | - | chưa có code | Không dùng hồ sơ doanh nghiệp khi tắt |
| LP10-S01-TC013 | P0 | api | có code | Trang của tổ chức khác (HTTP) |
| LP10-S01-TC014 | P0 | api | có code | Người chỉ xem không gọi được (HTTP) |
| LP10-S01-TC015 | P2 | - | chưa có code | Nội dung dài và ký tự đặc biệt |
| LP10-S01-TC016 | P2 | - | chưa có code | Gợi ý sai ngôn ngữ |
| LP10-S02-TC001 | P1 | - | chưa có code | Đọc hồ sơ lần đầu tự tạo từ thông tin tổ chức (LP10-F5) |
| LP10-S02-TC002 | P0 | - | chưa có code | Cập nhật hồ sơ |
| LP10-S02-TC003 | P1 | api | có code | Làm sạch và giới hạn trường hồ sơ (HTTP) |
| LP10-S02-TC004 | P2 | - | chưa có code | Xóa một trường hồ sơ |
| LP10-S02-TC005 | P0 | - | chưa có code | Áp hồ sơ vào trang |
| LP10-S02-TC006 | P0 | - | chưa có code | Áp hồ sơ rồi sửa bằng tay và áp lại, không ép |
| LP10-S02-TC007 | P1 | - | chưa có code | Áp hồ sơ với force |
| LP10-S02-TC008 | P0 | - | chưa có code | Hồ sơ trống |
| LP10-S02-TC009 | P2 | - | chưa có code | Áp hồ sơ vào trang đã lưu trữ |
| LP10-S02-TC010 | P1 | - | chưa có code | Builder đang mở khi áp hồ sơ (LP10-F4) |
| LP10-S02-TC011 | P0 | api | có code | Tổ chức khác không đọc hoặc sửa hồ sơ (HTTP) |
| LP10-S02-TC012 | P1 | - | chưa có code | Người chỉ xem |
| LP10-S02-TC013 | P2 | - | chưa có code | Màu thương hiệu thay đổi theme |
| LP10-S03-TC001 | P0 | - | chưa có code | Chạy Page Doctor |
| LP10-S03-TC002 | P0 | - | chưa có code | Áp dụng đề xuất đã chọn |
| LP10-S03-TC003 | P0 | - | chưa có code | Hoàn tác bằng phiên bản |
| LP10-S03-TC004 | P1 | - | chưa có code | Không chọn đề xuất nào |
| LP10-S03-TC005 | P1 | - | chưa có code | Báo cáo hỏng |
| LP10-S03-TC006 | P0 | - | chưa có code | Áp dụng lặp với cùng khóa không nhân đôi |
| LP10-S03-TC007 | P0 | - | chưa có code | Vá nhắm vào theo dõi, tên miền, xuất bản bị loại (LP10-F3) |
| LP10-S03-TC008 | P2 | - | chưa có code | Nhiều hơn 20 đề xuất |
| LP10-S03-TC009 | P2 | - | chưa có code | Giới hạn 15 lần mỗi phút |
| LP10-S03-TC010 | P2 | - | chưa có code | Trang rất dài |
| LP10-S03-TC011 | P2 | - | chưa có code | Page Doctor trên trang đã lưu trữ |
| LP10-S03-TC012 | P0 | api | có code | Trang của tổ chức khác và quyền (HTTP) |
| LP10-S03-TC013 | P1 | - | chưa có code | Bản vá và an toàn SSRF |
| LP10-S03-TC014 | P1 | - | chưa có code | Phân tích URL và Page Doctor chung |
| LP10-S04-TC001 | P0 | - | chưa có code | AI không ghi đè trường người dùng sửa |
| LP10-S04-TC002 | P1 | - | chưa có code | Gợi ý không bịa lời chứng thực thật |
| LP10-S04-TC003 | P1 | - | chưa có code | AI trả dữ liệu sai cấu trúc |
| LP10-S04-TC004 | P0 | - | chưa có code | Rò rỉ dữ liệu giữa tổ chức qua hồ sơ |
| LP10-S04-TC005 | P2 | - | chưa có code | Ghi nhật ký sử dụng AI |
| LP11-S01-TC001 | P0 | - | chưa có code | Bật hiệu ứng Hiện dần cho một tiêu đề |
| LP11-S01-TC002 | P1 | unit | có code | Toàn bộ 11 kiểu hiệu ứng chọn được (logic) |
| LP11-S01-TC003 | P1 | unit | có code | Đặt thời lượng và độ trễ (logic) |
| LP11-S01-TC004 | P1 | - | chưa có code | Hiệu ứng cho section |
| LP11-S01-TC005 | P1 | unit | có code | Hiệu ứng cho từng loại phần tử (logic) |
| LP11-S01-TC006 | P1 | - | chưa có code | Thử hiệu ứng ngay trong builder |
| LP11-S01-TC007 | P0 | unit | có code | Tắt hiệu ứng (logic) |
| LP11-S01-TC008 | P1 | - | chưa có code | Undo và Redo thay đổi hiệu ứng |
| LP11-S01-TC009 | P1 | - | chưa có code | Hiệu ứng không làm tràn ngang trong builder |
| LP11-S01-TC010 | P1 | - | chưa có code | Người chỉ xem không sửa được |
| LP11-S02-TC001 | P0 | - | chưa có code | Motion đi theo autosave và xuất bản |
| LP11-S02-TC002 | P1 | unit | có code | Kiểu hiệu ứng lạ bị loại (LP11-F1) (logic) |
| LP11-S02-TC003 | P1 | unit | có code | Thời lượng và độ trễ ngoài khoảng (LP11-F1) (logic) |
| LP11-S02-TC004 | P1 | unit | có code | Trigger load được đổi thành scroll (LP11-F1) (logic) |
| LP11-S02-TC005 | P2 | unit | có code | Khóa phần tử không hợp lệ (LP11-F3) (logic) |
| LP11-S02-TC006 | P1 | - | chưa có code | Gói mẫu có chứa motion |
| LP11-S02-TC007 | P1 | unit | có code | Nhân bản section hoặc trang giữ hiệu ứng (logic) |
| LP11-S03-TC001 | P0 | - | chưa có code | Hiệu ứng chạy khi phần tử vào khung nhìn |
| LP11-S03-TC002 | P1 | - | chưa có code | Độ trễ được áp dụng |
| LP11-S03-TC003 | P1 | - | chưa có code | Hiệu ứng nối tiếp (cascade) |
| LP11-S03-TC004 | P2 | - | chưa có code | Hiệu ứng chạy một lần khi cuộn qua lại |
| LP11-S03-TC005 | P0 | - | chưa có code | Giảm chuyển động tắt hiệu ứng |
| LP11-S03-TC006 | P1 | - | chưa có code | Không bật giảm chuyển động |
| LP11-S03-TC007 | P0 | - | chưa có code | JavaScript lỗi hoặc bị chặn (LP11-F2) |
| LP11-S03-TC008 | P2 | - | chưa có code | Hiệu ứng nằm trong khung cuộn nội bộ |
| LP11-S03-TC009 | P1 | - | chưa có code | Hiệu ứng khớp giữa xem trước và công khai |
| LP11-S03-TC010 | P1 | - | chưa có code | Ảnh hưởng đến lead form |
| LP11-S04-TC001 | P0 | unit | có code | Hiệu ứng mặc định tắt (logic) |
| LP11-S04-TC002 | P1 | - | chưa có code | Mẫu hệ thống không có hiệu ứng tự động |
| LP11-S04-TC003 | P1 | - | chưa có code | Nhiều hiệu ứng cùng lúc trên Mobile |
| LP11-S04-TC004 | P0 | e2e | có code | Hiệu ứng không gây tràn ngang trang (HTTP) |
| LP11-S04-TC005 | P1 | - | chưa có code | Phần tử có hiệu ứng vẫn bấm được |
| LP11-S04-TC006 | P2 | - | chưa có code | Lỗi khi vài phần tử không tìm thấy |
| LP12-S01-TC001 | P0 | e2e | có code | Trang người dùng tạo từ mẫu ở ba khung (HTTP) |
| LP12-S01-TC002 | P1 | e2e | có code | Mốc 767/768 và 1023/1024 (HTTP) |
| LP12-S01-TC003 | P2 | e2e | có code | Các khung rất nhỏ 320 px (HTTP) |
| LP12-S01-TC004 | P1 | - | chưa có code | Nhóm agency ở 5 khung |
| LP12-S01-TC005 | P1 | - | chưa có code | Nhóm spa ở 3 khung |
| LP12-S01-TC006 | P1 | - | chưa có code | Lô 1 và lô 2 |
| LP12-S01-TC007 | P1 | - | chưa có code | Responsive trang người dùng đã sửa mạnh |
| LP12-S01-TC008 | P2 | - | chưa có code | Xoay màn hình và đổi cỡ động |
| LP12-S02-TC001 | P1 | - | chưa có code | Ảnh toàn catalog đúng và tải được |
| LP12-S02-TC002 | P1 | - | chưa có code | Ảnh hotlink không tải được |
| LP12-S02-TC003 | P2 | - | chưa có code | Ảnh quá lớn |
| LP12-S02-TC004 | P1 | - | chưa có code | Chữ dài làm vỡ thẻ |
| LP12-S02-TC005 | P1 | - | chưa có code | Không có câu thiết kế rò rỉ trong nội dung |
| LP12-S02-TC006 | P1 | - | chưa có code | Phông chữ tiếng Việt |
| LP12-S02-TC007 | P2 | - | chưa có code | Độ tương phản và cỡ chữ |
| LP12-S03-TC001 | P1 | - | chưa có code | Audit 200 mẫu × 3 khung hình (LP12-F3, F4) |
| LP12-S03-TC002 | P0 | - | chưa có code | Mỗi mẫu có form ở ba khung |
| LP12-S03-TC003 | P1 | - | chưa có code | Tính toàn vẹn catalog trước khi audit |
| LP12-S03-TC004 | P2 | - | chưa có code | Khác biệt giữa các mẫu |
| LP12-S03-TC005 | P2 | - | chưa có code | Tờ tổng hợp ảnh để người xem soát |
| LP12-S04-TC001 | P0 | - | chưa có code | Mẫu Agency Portfolio không bị CSS chung ảnh hưởng |
| LP12-S04-TC002 | P0 | - | chưa có code | Thay đổi CSS dùng chung không làm hỏng mẫu cũ |
| LP12-S04-TC003 | P1 | - | chưa có code | Lớp CSS theo phiên bản catalog |
| LP12-S04-TC004 | P1 | - | chưa có code | Trang công khai và xem trước dùng cùng CSS |
| LP12-S04-TC005 | P2 | - | chưa có code | Bundle CSS không phình quá mức |
| LP12-S05-TC001 | P1 | - | chưa có code | Cổng UX thiết kế của builder (LP12-F2) |
| LP12-S05-TC002 | P1 | - | chưa có code | Không lỗi tải mã sau khi triển khai |
| LP12-S05-TC003 | P1 | - | chưa có code | Route builder thật không lỗi client |
| LP12-S05-TC004 | P2 | - | chưa có code | Nhãn danh mục tiếng Việt |
| LP12-S05-TC005 | P2 | - | chưa có code | Truy cập: phím Tab và nhãn |
| LP12-S05-TC006 | P2 | - | chưa có code | Chế độ tối và độ phóng 200% |
