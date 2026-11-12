# Danh sách flow và test case

Tổng cộng 64 flow (52 flow F và 12 flow Landing Page). Mỗi file gồm: điều kiện trước, sơ đồ sequence (Mermaid), các bước test, trường hợp biên.

Xem sơ đồ: mở file trong VS Code/Cursor và bật Markdown Preview (cần phần mở rộng hỗ trợ Mermaid), hoặc dán khối mermaid vào https://mermaid.live.

Liên quan: `docs/test case/REGRESSION_MATRIX.md` (sửa X thì chạy test nào), `docs/test case/APP_FLOWS_TEST_CASES.md` (bản tổng hợp một file).


## A. Tài khoản và gói

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F01](F01-dang-ky.md) | Đăng ký tài khoản (OTP email) | P0 | 2 |
| [F02](F02-dang-nhap.md) | Đăng nhập, Google, làm mới phiên, đăng xuất | P0 | 2 |
| [F03](F03-phan-quyen-tach-to-chuc.md) | Phân quyền và tách dữ liệu giữa các tổ chức | P0 | 8 |
| [F04](F04-cai-dat.md) | Cài đặt (tài khoản, ngôn ngữ, kiến thức, kết nối, API, hệ thống) | P1 | 1 |
| [F05](F05-goi-thanh-toan.md) | Gói dịch vụ, dùng thử và thanh toán | P0 | 7 |
| [F06](F06-credit-ai.md) | Credit AI (số dư, trừ credit, nạp) | P0 | 4 |
| [F07](F07-affiliate.md) | Chương trình affiliate | P1 | 3 |

## B. Tổng quan và AI

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F08](F08-tong-quan.md) | Tổng quan và trung tâm module | P2 | 5 |
| [F09](F09-marketing-autopilot.md) | Marketing Autopilot | P1 | 9 |
| [F10](F10-tro-ly-ai.md) | Trợ lý AI (chat, công cụ, hành động ghi dữ liệu) | P1 | 8 |
| [F11](F11-kho-kien-thuc-rag.md) | Kho kiến thức (RAG) | P1 | 4 |

## C. CRM

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F12](F12-khach-hang-360.md) | Khách hàng 360 | P0 | 5 |
| [F13](F13-lead.md) | Quản lý lead | P1 | 5 |
| [F14](F14-funnel.md) | Funnel (xây dựng, xuất bản, thu lead) | P1 | 9 |
| [F15](F15-lich-hen-dich-vu.md) | Lịch hẹn và dịch vụ | P1 | 2 |

## D. Landing Page

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [LP01](LP01-tao-trang-moi.md) | Tạo landing page mới (từ mẫu, trang trống, AI, URL) | P1 | 7 |
| [LP02](LP02-thu-vien-templates.md) | Thư viện Templates (xem, lọc, xem trước, dùng mẫu) | P1 | 6 |
| [LP03](LP03-builder-chinh-sua-phan-tu.md) | Builder: chỉnh sửa nội dung và phần tử | P1 | 9 |
| [LP04](LP04-builder-section-hang-cot.md) | Builder: section, hàng/cột, thư viện section, thêm thành phần | P1 | 9 |
| [LP05](LP05-luu-autosave-xuat-ban.md) | Lưu, autosave, lịch sử, khôi phục, xuất bản | P0 | 9 |
| [LP06](LP06-form-thu-lead.md) | Form thu lead trên trang công khai | P0 | 3 |
| [LP07](LP07-trang-cong-khai-domain-seo.md) | Trang công khai, preview, tên miền, SEO | P1 | 3 |
| [LP08](LP08-trang-cua-toi-analytics.md) | Trang của tôi, tổng quan và analytics | P2 | 2 |
| [LP09](LP09-admin-quan-ly-templates.md) | Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt) | P1 | 6 |
| [LP10](LP10-ai-trong-builder.md) | AI trong builder (viết lại, Page Doctor, hồ sơ doanh nghiệp) | P2 | 4 |
| [LP11](LP11-hieu-ung-motion.md) | Hiệu ứng (motion) cho section và element | P2 | 3 |
| [LP12](LP12-chat-luong-giao-dien.md) | Chất lượng giao diện toàn cục (responsive, hình ảnh) | P1 | 5 |

## E. Nội dung

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F16](F16-tao-noi-dung-quang-cao.md) | Tạo nội dung quảng cáo | P1 | 4 |
| [F17](F17-xay-dung-thuong-hieu.md) | Xây dựng thương hiệu cá nhân và nội dung quan điểm | P2 | 6 |
| [F18](F18-kiem-tra-chinh-sach-quang-cao.md) | Kiểm tra chính sách quảng cáo Facebook | P1 | 3 |
| [F19](F19-video-transcript.md) | Video transcript (chuyển video thành văn bản) | P1 | 4 |
| [F20](F20-thu-vien-noi-dung.md) | Thư viện nội dung | P2 | chưa có |
| [F21](F21-dang-bai-tu-dong-lich.md) | Đăng bài tự động và lên lịch | P0 | 3 |
| [F22](F22-ket-noi-fanpage.md) | Kết nối fanpage (Meta OAuth) | P0 | 7 |
| [F23](F23-teleprompter.md) | Teleprompter (kịch bản, cuộn, ghi hình) | P2 | 7 |

## F. Quảng cáo

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F24](F24-ads-meta.md) | Quảng cáo Meta (kết nối, đồng bộ, hành động) | P0 | 9 |
| [F25](F25-ads-google.md) | Quảng cáo Google Ads | P0 | 9 |
| [F26](F26-attribution-roas.md) | Attribution và ROAS | P1 | 2 |

## G. Nhắn tin

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F27](F27-chien-dich-nhan-hang-loat.md) | Chiến dịch nhắn tin hàng loạt | P0 | 8 |
| [F28](F28-file-doi-tuong.md) | File đối tượng (audience) | P1 | 1 |
| [F29](F29-tin-nhan-tu-dong.md) | Tin nhắn tự động (flow tự động) | P1 | 1 |
| [F30](F30-chatbot-cskh.md) | Chatbot CSKH (bot, kênh, hộp thư) | P1 | 4 |
| [F31](F31-email-marketing.md) | Email marketing | P1 | 8 |
| [F32](F32-zalo-marketing.md) | Zalo marketing (OA, ZBS, chiến dịch) | P1 | 8 |
| [F33](F33-hop-thu-messages.md) | Hộp thư hợp nhất (messages) | P1 | 3 |

## H. Nhân sự

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F34](F34-nhan-vien.md) | Quản lý nhân viên (hồ sơ, hợp đồng, tài khoản) | P1 | 1 |
| [F35](F35-ca-lam.md) | Ca làm việc và phân ca | P1 | 1 |
| [F36](F36-cham-cong.md) | Chấm công | P1 | 1 |
| [F37](F37-nghi-phep-ot.md) | Nghỉ phép và làm thêm giờ (OT) | P1 | 1 |

## I. Quản lý công việc

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F38](F38-du-an-cong-viec.md) | Dự án và bảng công việc | P1 | 3 |
| [F39](F39-viec-cua-toi.md) | Việc của tôi, chi tiết việc, bình luận | P1 | 3 |
| [F40](F40-dashboard-cong-viec.md) | Dashboard công việc | P2 | 1 |
| [F41](F41-lich-cong-viec.md) | Lịch công việc | P2 | chưa có |

## J. Bán hàng

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F42](F42-don-hang.md) | Đơn hàng bán | P0 | 1 |
| [F43](F43-san-pham.md) | Sản phẩm và danh mục | P1 | chưa có |
| [F44](F44-ton-kho.md) | Tồn kho (số lượng, lô, hạn dùng, cảnh báo) | P0 | 1 |
| [F45](F45-nhap-xuat-kho.md) | Nhập, xuất, điều chỉnh kho | P0 | 1 |
| [F46](F46-kiem-ke.md) | Kiểm kê kho | P1 | chưa có |
| [F47](F47-mua-hang.md) | Mua hàng (đơn mua, nhận hàng) | P1 | chưa có |
| [F48](F48-bao-cao-ban-hang.md) | Báo cáo bán hàng | P1 | chưa có |

## K. Tài chính

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F49](F49-doanh-thu-pnl.md) | Doanh thu, chi phí và lãi lỗ (P&L) | P1 | 1 |
| [F50](F50-muc-tieu-kinh-doanh.md) | Mục tiêu kinh doanh | P2 | 1 |

## L. Quản trị nền tảng

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F51](F51-admin-nen-tang.md) | Admin nền tảng (người dùng, tổ chức, gói, thanh toán, credit, audit, jobs, tích hợp) | P0 | 5 |

## M. Trang công khai

| Flow | Tên | Ưu tiên | Test tự động |
|---|---|---|---|
| [F52](F52-trang-cong-khai.md) | Trang công khai (landing page, form funnel, hủy đăng ký, callback) | P0 | 3 |
