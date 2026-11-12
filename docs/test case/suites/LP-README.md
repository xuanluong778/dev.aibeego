# Landing Page (LP01 đến LP12): bộ test suite

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Bộ tài liệu chỉ mô tả kiểm thử, không thay đổi code sản phẩm.

Mỗi tài liệu gồm: phạm vi và căn cứ code, bảng "điểm lệch tài liệu hoặc cần xác nhận" (hành vi hiện tại, vị trí trong code, kỳ vọng cần xác nhận), các suite theo nhóm hành vi, trong mỗi suite là các test case có mã, ưu tiên, điều kiện trước, các bước, kết quả mong đợi, mức phủ tự động hóa và trạng thái thực thi. Cuối mỗi tài liệu có mục "Chạy lại khi nào".

Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Các flow gốc: [../flows/README.md](../flows/README.md).

## 1. Danh sách tài liệu và thống kê

| Flow | Tài liệu | Ưu tiên flow | Suite | Case | P0 | P1 | P2 | Đã có | Một phần | Chưa có | Điểm cần xác nhận |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LP01 | [LP01-tao-trang-moi-test-suites.md](LP01-tao-trang-moi-test-suites.md) (Tạo landing page mới (từ mẫu, trang trống, AI, URL)) | P1 | 7 | 64 | 13 | 26 | 25 | 2 | 12 | 50 | 7 |
| LP02 | [LP02-thu-vien-templates-test-suites.md](LP02-thu-vien-templates-test-suites.md) (Thư viện Templates (xem, lọc, xem trước, dùng mẫu)) | P1 | 7 | 46 | 16 | 19 | 11 | 5 | 6 | 35 | 5 |
| LP03 | [LP03-builder-chinh-sua-phan-tu-test-suites.md](LP03-builder-chinh-sua-phan-tu-test-suites.md) (Builder: chỉnh sửa nội dung và phần tử) | P1 | 7 | 57 | 15 | 33 | 9 | 30 | 6 | 21 | 4 |
| LP04 | [LP04-builder-section-hang-cot-test-suites.md](LP04-builder-section-hang-cot-test-suites.md) (Builder: section, hàng/cột, thư viện section, thêm thành phần) | P1 | 7 | 49 | 13 | 27 | 9 | 19 | 11 | 19 | 3 |
| LP05 | [LP05-luu-autosave-xuat-ban-test-suites.md](LP05-luu-autosave-xuat-ban-test-suites.md) (Lưu, autosave, lịch sử, khôi phục, xuất bản) | P0 | 8 | 77 | 34 | 30 | 13 | 23 | 10 | 44 | 6 |
| LP06 | [LP06-form-thu-lead-test-suites.md](LP06-form-thu-lead-test-suites.md) (Form thu lead trên trang công khai) | P0 | 7 | 63 | 14 | 30 | 19 | 0 | 6 | 57 | 8 |
| LP07 | [LP07-trang-cong-khai-domain-seo-test-suites.md](LP07-trang-cong-khai-domain-seo-test-suites.md) (Trang công khai, preview, tên miền, SEO) | P1 | 7 | 61 | 18 | 27 | 16 | 0 | 6 | 55 | 6 |
| LP08 | [LP08-trang-cua-toi-analytics-test-suites.md](LP08-trang-cua-toi-analytics-test-suites.md) (Trang của tôi, tổng quan và analytics) | P2 | 5 | 51 | 16 | 19 | 16 | 0 | 4 | 47 | 8 |
| LP09 | [LP09-admin-quan-ly-templates-test-suites.md](LP09-admin-quan-ly-templates-test-suites.md) (Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt)) | P1 | 7 | 67 | 26 | 27 | 14 | 9 | 5 | 53 | 7 |
| LP10 | [LP10-ai-trong-builder-test-suites.md](LP10-ai-trong-builder-test-suites.md) (AI trong builder (viết lại, Page Doctor, hồ sơ doanh nghiệp)) | P2 | 4 | 48 | 19 | 17 | 12 | 6 | 10 | 32 | 5 |
| LP11 | [LP11-hieu-ung-motion-test-suites.md](LP11-hieu-ung-motion-test-suites.md) (Hiệu ứng (motion) cho section và element) | P2 | 4 | 33 | 8 | 21 | 4 | 4 | 10 | 19 | 4 |
| LP12 | [LP12-chat-luong-giao-dien-test-suites.md](LP12-chat-luong-giao-dien-test-suites.md) (Chất lượng giao diện toàn cục (responsive, hình ảnh)) | P1 | 5 | 31 | 4 | 17 | 10 | 6 | 10 | 15 | 4 |
| | **Tổng** | | **75** | **647** | **196** | **293** | **158** | **104** | **96** | **447** | **67** |

Ghi chú về cột phủ tự động hóa: "Đã có" nghĩa là một script có kiểm đúng điều kiện của case (đã đọc tiêu đề và các thông điệp assert của script, **chưa chạy**); "Một phần" ghi rõ script kiểm gì và thiếu gì; nhiều script trong `scripts/` là cổng đọc mã nguồn hoặc chỉ chụp và đo, không chứng minh hành vi trên trình duyệt thật. Không có baseline xanh cho các script này. Các số "khoảng N dòng kiểm" là số dòng chứa từ khóa assert/expect/check trong script, chỉ để ước lượng độ dày của test, không phải số phép kiểm chính xác.

## 2. Case smoke dùng chung một trang test

Chạy theo đúng thứ tự dưới đây sau mỗi bản triển khai. Các case dùng chung **một trang test `PAGE-SMOKE`**: trang được tạo ở SMOKE-1, chỉnh ở SMOKE-2, xuất bản ở SMOKE-3, mở công khai ở SMOKE-4 và nhận lead ở SMOKE-5. Một bước lỗi thì dừng chuỗi và báo lỗi, không chạy tiếp các bước sau.

| Thứ tự | Flow | Mã case | Việc cần làm | Dữ liệu dùng chung |
|---|---|---|---|---|
| SMOKE-1 | LP01 | [LP01-S01-TC001](LP01-tao-trang-moi-test-suites.md) | Tạo trang trống và vào builder | Tên trang `SMOKE LP 20261111-01`; ghi lại id và slug của `PAGE-SMOKE` |
| SMOKE-2 | LP03 | [LP03-S01-TC001](LP03-builder-chinh-sua-phan-tu-test-suites.md) | Sửa tiêu đề trong builder, có khối form | Tiêu đề `SMOKE-HEADLINE-20261111` |
| SMOKE-3 | LP05 | [LP05-S05-TC001](LP05-luu-autosave-xuat-ban-test-suites.md) | Lưu, tải lại, xuất bản | Dòng phụ `SMOKE-SUB-20261111` |
| SMOKE-4 | LP07 | [LP07-S01-TC001](LP07-trang-cong-khai-domain-seo-test-suites.md) | Mở `/p/<slug>` ở cửa sổ ẩn danh | Phải thấy tiêu đề và dòng phụ ở trên |
| SMOKE-5 | LP06 | [LP06-S01-TC001](LP06-form-thu-lead-test-suites.md) | Gửi form và xác nhận lead về đúng tổ chức, đúng nguồn | Tên `Smoke Lead 20261111`, SĐT `0900000001`, email `smoke.lead.20261111@example.com` |

Thứ tự luồng: LP01 tạo trang, LP03 chỉnh sửa, LP05 lưu, tải lại và xuất bản, LP07 mở trang công khai, LP06 gửi form và xác nhận lead.

Sau khi smoke xong: xóa trang `PAGE-SMOKE` và lead `0900000001` ở tổ chức test, hoặc đổi chuỗi `20261111` thành ngày chạy để không trùng với lần trước.

## 3. Dữ liệu và môi trường dùng chung

- Tài khoản: `ORG-A-OWNER` (chủ tổ chức A, đủ `lead.read` và `lead.write`), `ORG-A-VIEWER` (cùng tổ chức A, chỉ `lead.read`), `ORG-B-OWNER` (tổ chức B), `SUPER_ADMIN`. Chuẩn bị bốn tài khoản này một lần.
- Chỉ chạy trên môi trường test hoặc dữ liệu thử. Không chạy case phá hủy (xóa hàng loạt, upload hàng loạt, sửa mẫu gốc) trên dữ liệu khách thật.
- Các case chạm tới AI thật (LP01-S05, LP10) tốn credit và kết quả không cố định, chỉ chạy khi chủ động.
- Các case giới hạn tần suất (LP01, LP06, LP07, LP10) cần chạy riêng hoặc khởi động lại API để bộ đếm về 0, vì bộ đếm lưu trong bộ nhớ và dùng chung giữa các case.
- Cách chạy các script QA trình duyệt: xem `docs/test case/REGRESSION_MATRIX.md` (mục chạy L2) và đầu từng script.

## 4. Sửa gì thì chạy lại gì

| Khu vực sửa | Chạy lại |
|---|---|
| Tạo trang (`create`, `uniqueSlug`, chống tạo trùng, trang tạo) | LP01 (S01 đến S04, S07); smoke SMOKE-1 |
| Thư viện và catalog mẫu, đồng bộ catalog khi khởi động | LP02; LP09-S06-TC005; LP12-S03 |
| Builder: thao tác phần tử, kéo thả, nhóm, văn bản, ảnh | LP03; smoke SMOKE-2; LP05-S02 |
| Builder: section, hàng, cột, thư viện section, Inspector, theme, khung thiết bị | LP04; LP03-S02; LP12-S01 |
| Lưu, autosave, revision, khôi phục nháp, xuất bản, lịch sử | LP05 (toàn bộ); smoke SMOKE-3; F03 cho tách tổ chức |
| Form lead công khai, chống spam, sự kiện, lead trong CRM | LP06 (toàn bộ); smoke SMOKE-5; F13; LP08-S04 |
| Trang công khai, SEO, link xem trước, tên miền, mã theo dõi, cache | LP07 (toàn bộ); smoke SMOKE-4; F52; LP05-S06 |
| Danh sách trang, tổng quan, nhân bản, lưu trữ, xóa, analytics | LP08; LP06-S05 |
| Quản trị mẫu: phiên sửa mẫu, tải, upload hàng loạt, quyền SUPER_ADMIN | LP09 (toàn bộ); LP02-S06; LP08-S05; LP05-S05-TC014; nginx giới hạn upload |
| AI: viết lại, hồ sơ doanh nghiệp, Page Doctor, credit | LP10; LP01-S05; F06 |
| Hiệu ứng (motion) | LP11; LP12-S01; LP07-S01 |
| CSS dùng chung, renderer, ảnh mẫu, responsive | LP12; LP02-S04; LP07-S01; LP11-S04-TC004 |
| Phân quyền (`lead.read`, `lead.write`, PlatformAdminGuard), tách tổ chức | S08 của LP05; S07 của LP01; LP09-S01; LP08-S03; F03 |
| Triển khai bản web hoặc API mới | Toàn bộ smoke SMOKE-1 đến SMOKE-5; LP05-S06; LP07-S07; LP12-S05 |

## 5. Điểm cần xác nhận (tổng hợp)

Chi tiết (vị trí code, kỳ vọng cần xác nhận, case liên quan) nằm ở bảng "Điểm lệch tài liệu hoặc cần xác nhận" đầu mỗi tài liệu. Dưới đây là các điểm quan trọng nhất:

| Mã | Nội dung | Ảnh hưởng |
|---|---|---|
| LP06-F8 | Test "lead đúng tổ chức, đúng nguồn" chưa có: `test-landing-page-public-lead.ts` chỉ kiểm hàm diễn giải phản hồi của giao diện | Smoke SMOKE-5 chỉ làm tay |
| LP07-F4 | ID theo dõi (GA4, Meta Pixel, Google Ads) chỉ lọc `<` và `>` rồi nối vào mã script nội tuyến; dấu nháy đơn có thể thoát chuỗi | Nguy cơ chèn mã lên trang công khai (bảo mật) |
| LP07-F1 | Không có xử lý phục vụ trang theo tên miền riêng hoặc subdomain trong repo | Case tên miền riêng chưa chạy được ngoài môi trường có tầng edge |
| LP06-F6 | Trang công khai tìm theo slug, không gửi `organizationId`; nếu hai tổ chức trùng slug thì lấy trang xuất bản mới nhất | Nguy cơ lead nhầm tổ chức |
| LP06-F7 | Địa chỉ IP lấy từ phần tử đầu của `X-Forwarded-For` | Có thể né giới hạn tần suất nếu nginx không đặt lại header |
| LP05-F3 / LP10-F4 | Một số thao tác ghi nháp (PATCH có `draftSpec`, áp hồ sơ, áp Page Doctor, AI vào trang có sẵn) không tăng revision | Một tab builder cũ có thể ghi đè mà không báo xung đột |
| LP05-F1 | Autosave bị từ chối trả HTTP thành công kèm `rejected: true` | Người gọi API trực tiếp phải kiểm cờ này |
| LP05-F5 | Làm mới cache công khai do trình duyệt gọi; xuất bản qua API trực tiếp có thể cũ tới 60 giây; route làm mới không cần đăng nhập | Trang gỡ xuất bản vẫn hiện tối đa 60 giây |
| LP06-F5 / LP08-F5 | Số lần gửi form (FORM_SUBMIT) bị tính hai lần; "leads" trong analytics đếm số lần gửi, không phải số lead duy nhất | Số liệu báo cáo sai lệch |
| LP08-F1 | Số đếm tổng quan không loại trang tạm sửa mẫu `tpl-edit-*` | Số "Nháp" và "Tổng" lệch số trang trong danh sách |
| LP08-F2 | Cột lượt truy cập, leads, tỷ lệ trong bảng "Trang của tôi" luôn là `—` vì API không trả số này | Tính năng thiếu hoặc cột chưa dùng |
| LP08-F8 | Xóa trang là xóa vĩnh viễn; chưa xác định số phận lead, sự kiện, phiên bản (phụ thuộc khóa ngoại) | Có thể mất dữ liệu lead |
| LP09-F1 | `test-platform-admin-rbac.ts` không kiểm các route mẫu admin của Landing Page | Chưa có test phân quyền cho nhóm route này |
| LP09-F5 | Giới hạn upload hàng loạt trong code (256 MB mỗi tệp, 300 mẫu) cao hơn `client_max_body_size` chung 100m của nginx đã ghi nhận | Upload tệp lớn có thể bị nginx chặn |
| LP01-F1 / LP10-F1 | Tạo trang bằng AI và Page Doctor không trừ credit; chỉ AI viết lại từng trường trừ 2 credit | Khác flow gốc ("còn credit nếu dùng AI") |
| LP02-F1 | `includeSystem=false` trong query không có tác dụng vì `@Type(() => Boolean)` | Lọc không đúng nếu giao diện dùng tham số này |
| LP11-F2 | CSS ẩn phần tử đang chờ hiệu ứng (`opacity: 0`) có thể làm nội dung biến mất nếu JavaScript không chạy | Khách mất nội dung nếu mã hiệu ứng lỗi |
| LP12-F3 | Hầu hết script responsive/visual chỉ chụp và đo, không tự kết luận Đạt/Không đạt | Cần đọc báo cáo; mã thoát không phản ánh chất lượng |

Ngoài ra, [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md) ghi nhận form OTP đăng ký ở giao diện đang là bản giữ chỗ (không thuộc Landing Page).

## 6. Hạn chế của bộ tài liệu

- Chưa chạy bất kỳ case hay script nào. Cột "Mức phủ tự động hóa" dựa trên tiêu đề, chú thích và thông điệp assert của script. Một script "Đã có" vẫn có thể đang FAIL (chưa có baseline xanh; xem `scripts/landing-page-test-audit.md`: nhiều matcher cũ).
- LP03, LP04, LP11, LP12 dựa nhiều vào tên điều kiện trong các script QA và mô tả flow; chưa đối chiếu từng nhãn nút trong code giao diện nên cần ghi lại nhãn thực tế khi chạy. LP01, LP02, LP05 đến LP10 đã đối chiếu với code API (thông báo lỗi, giới hạn, thứ tự kiểm tra).
- Một số hành vi trong cơ sở dữ liệu (khóa ngoại khi xóa trang, luật gộp lead trùng ở F13) chưa đọc; các case liên quan ghi "ghi lại hành vi thực tế".
- Mã nguồn đang được nhiều phiên làm việc cùng sửa; hằng số và thông báo trong tài liệu đúng theo mã nguồn tại thời điểm 11/11/2026.

