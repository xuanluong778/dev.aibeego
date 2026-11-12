# LP12: Chất lượng giao diện toàn cục (responsive, hình ảnh) - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP12-chat-luong-giao-dien.md](../flows/LP12-chat-luong-giao-dien.md). Mức ưu tiên flow: P1. Route giao diện: Mọi trang landing page. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** chất lượng hiển thị chung của trang công khai và mẫu: responsive, hình ảnh, chữ dài, audit catalog, cách ly CSS mẫu pilot, cổng kiểm tra giao diện. Không có API riêng.

**Căn cứ code:** `apps/web/src/components/landing-pages/landing-page-responsive-foundation.ts` (mốc 767/768/1023/1024/1439/1440), các script `qa-landing-page-*-responsive.cjs`, `qa-landing-page-global-visual.cjs`, `qa-agency-portfolio-isolation.cjs`, `test-landing-page-design-audit.cjs`. Phần lớn script chỉ chụp và đo (LP12-F3), nên cần đọc báo cáo, và case ghi rõ phần chưa tự động.

**Case liên quan ở flow khác:** LP02 (catalog); LP11 (hiệu ứng không tràn ngang); LP03, LP04 (trang người dùng sửa); F52 (trang công khai).

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP12-F1 | Mốc responsive thực tế trong CSS: dưới 768 px (mobile), 768 đến 1023 px (tablet), 1024 đến 1439 px, từ 1440 px trở lên. Hero chuyển thành cột dưới 768 px; lưới bảng giá và thẻ về 1 cột dưới 768 px, 2 cột ở khoảng tablet. Trang công khai và route chụp mẫu dùng thuộc tính `data-lp-public-root` và `data-lp-template-shot`. | `apps/web/src/components/landing-pages/landing-page-responsive-foundation.ts` các khối `@media` | Khớp ba khung hình 1440/768/390 mà flow gốc đưa ra. Các script chạy thêm 1024 và 375 px. | LP12-S01-TC001 |
| LP12-F2 | `test-landing-page-design-audit.cjs` là cổng **UX của builder** (chọn, kéo, xóa, thanh công cụ) đọc mã nguồn, không phải kiểm tra thiết kế hiển thị của mẫu. Flow gốc ghép nó với "Kiểm tra thiết kế" của chất lượng giao diện. | `scripts/test-landing-page-design-audit.cjs` (tiêu đề và danh sách tệp mã nguồn được đọc) | Cần xác nhận cách hiểu "kiểm tra thiết kế" của LP12; case LP12-S05-TC001 ghi rõ phạm vi thực của script. | LP12-S05-TC001 |
| LP12-F3 | Hầu hết script LP12 (`qa-landing-page-agency-responsive`, `spa-responsive`, `batch1-responsive`, `catalog-responsive`, `global-visual`) **chụp và đo** nhưng không tự kết luận Đạt/Không đạt bằng `assert` (số assert bằng 0 hoặc rất ít); `global-visual` đo `overflowX`, `formOverflow`, `textClip` và ghi vào danh sách `issues`. Cần đọc báo cáo, không chỉ mã thoát. | Các script nêu trên (đã đọc tiêu đề và đoạn đo cuộn ngang trong `global-visual`) | Cần quy định ngưỡng Đạt/Không đạt và biến mã thoát khác 0 khi có `issues`. | LP12-S02-TC001, LP12-S03-TC001 |
| LP12-F4 | Con số 200 mẫu của flow là số lượng catalog tại thời điểm viết; số thực tế lấy từ catalog (LP02-F5). Audit "200 mẫu × 3 khung hình" trong flow là script ngoài repo trước đây; trong repo, `qa-landing-page-global-visual.cjs` làm việc tương tự (chia lô bằng `LP_GLOBAL_BATCH`, `LP_GLOBAL_BATCH_SIZE`). | `scripts/qa-landing-page-global-visual.cjs` phần chú thích đầu tệp | Cần xác nhận script nào là nguồn chuẩn của audit 200 mẫu. | LP12-S03-TC001 |

## Quy ước chung

- **Mã case:** `LPxx-Syy-TCzzz` (flow, suite, case). Mã ổn định, không đánh số lại khi thêm case mới ở cuối suite.
- **Ưu tiên:** P0 = đường chính hoặc mất dữ liệu hoặc rò rỉ giữa tổ chức, phải đạt trước khi phát hành. P1 = tính năng quan trọng. P2 = biên hoặc trải nghiệm.
- **Tự động hóa:** `Đã có` (script có kiểm đúng điều kiện của case), `Một phần` (ghi rõ script kiểm gì và thiếu gì), `Chưa có`. Nội dung cột này dựa trên tiêu đề và các câu kiểm trong script, đã đọc tiêu đề và các thông điệp assert, chưa chạy script.
- **Thực thi:** tất cả case đang ở trạng thái **Chưa chạy**. Khi chạy, ghi kết quả vào bản sao của bảng hoặc vào tài liệu báo cáo riêng, không sửa tài liệu này.
- **Tài khoản dùng chung:** `ORG-A-OWNER` (chủ tổ chức A, đủ `lead.read` và `lead.write`), `ORG-A-VIEWER` (cùng tổ chức A, chỉ có `lead.read`), `ORG-B-OWNER` (tổ chức B, dùng kiểm tra tách dữ liệu), `SUPER_ADMIN` (quản trị nền tảng). Không dùng dữ liệu khách thật.
- **API:** `{API}` là tiền tố API của môi trường test (đường dẫn trong code là `/api/v1/landing-pages/...`). Gọi có `Authorization: Bearer <token>` trừ các route `public`.
- **Trang test dùng chung (smoke):** `PAGE-SMOKE` do case SMOKE-1 tạo, các case SMOKE-2 đến SMOKE-5 và các flow khác tái sử dụng. Xem `LP-README.md`.

## Danh sách suite

| Suite | Tên | Số case |
|---|---|---|
| LP12-S01 | Responsive: ba khung hình chuẩn và mốc chuyển | 8 |
| LP12-S02 | Hình ảnh và nội dung trong mẫu | 7 |
| LP12-S03 | Audit toàn bộ catalog | 5 |
| LP12-S04 | Cách ly mẫu pilot và CSS dùng chung | 5 |
| LP12-S05 | Cổng kiểm tra thiết kế builder và hồi quy giao diện | 6 |
| | **Tổng** | **31** |

## LP12-S01. Responsive: ba khung hình chuẩn và mốc chuyển

**Mục tiêu:** Không tràn ngang, không vỡ ở 1440, 1024, 768, 390 và 375 px.

**Căn cứ:** `apps/web/src/components/landing-pages/landing-page-responsive-foundation.ts`, các script QA responsive.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP12-S01-TC001 | Trang người dùng tạo từ mẫu ở ba khung | P0 | Trang đã xuất bản từ một mẫu bất kỳ. | 1. Mở `/p/<slug>` ở 1440, 768 và 390 px.<br>2. Đo `document.documentElement.scrollWidth` và `window.innerWidth`. | Ở cả ba khung `scrollWidth <= innerWidth + 2`. Hero thành một cột ở 390 px. Bảng giá và thẻ: 1 cột ở 390 px, 2 cột ở 768 px. Không có chữ bị cắt đột ngột. | Một phần: `scripts/qa-landing-page-catalog-responsive.cjs` kiểm: smoke 1 mẫu × 20 danh mục × 3 khung hình (chụp, không assert). Thiếu: ngưỡng Đạt/Không đạt tự động (LP12-F3) | Chưa chạy |
| LP12-S01-TC002 | Mốc 767/768 và 1023/1024 | P1 | Trang có hero, bảng giá, FAQ. | 1. Đặt rộng 767 rồi 768 px, và 1023 rồi 1024 px.<br>2. So bố cục. | Chuyển đúng mốc: 767 mobile, 768 tablet, 1023 tablet, 1024 desktop. Không có khoảng chết (nội dung dư thừa hoặc thiếu khoảng cách) tại mốc. | Chưa có | Chưa chạy |
| LP12-S01-TC003 | Các khung rất nhỏ 320 px | P2 | Trang bất kỳ. | 1. Mở ở 320 px. | Không cuộn ngang. Nút và ô nhập vẫn dùng được. | Chưa có | Chưa chạy |
| LP12-S01-TC004 | Nhóm agency ở 5 khung | P1 | Môi trường chạy trình duyệt, cổng chụp mẫu. | 1. Chạy `node scripts/qa-landing-page-agency-responsive.cjs`. | 10 mẫu agency × 1440/1024/768/390/375 px: không tràn ngang, không vỡ. Mỗi mẫu dùng trình duyệt mới để tránh hết bộ nhớ. | Một phần: `scripts/qa-landing-page-agency-responsive.cjs` kiểm: chụp 10 mẫu × 5 khung. Thiếu: ngưỡng tự động báo FAIL | Chưa chạy |
| LP12-S01-TC005 | Nhóm spa ở 3 khung | P1 | Như trên. | 1. Chạy `node scripts/qa-landing-page-spa-responsive.cjs`. | Mẫu spa ở 1440/768/390 px không lỗi. Dùng route kết xuất thật nếu `LP_SHOT_BASE_URL` chạy, nếu không dùng dự phòng HTML. | Một phần: `scripts/qa-landing-page-spa-responsive.cjs` kiểm: chụp mẫu spa 3 khung. Thiếu: ngưỡng tự động | Chưa chạy |
| LP12-S01-TC006 | Lô 1 và lô 2 | P1 | Như trên. | 1. Chạy `LP_BATCH1_CATEGORY=service node scripts/qa-landing-page-batch1-responsive.cjs`, rồi lần lượt `consulting`, `seo`, `website`. | 10 mẫu mỗi danh mục × 5 khung không tràn ngang. | Một phần: `scripts/qa-landing-page-batch1-responsive.cjs` kiểm: chụp lô 1 (dịch vụ, tư vấn, SEO, website) × 5 khung. Thiếu: ngưỡng tự động; lô 2 chưa thấy script riêng | Chưa chạy |
| LP12-S01-TC007 | Responsive trang người dùng đã sửa mạnh | P1 | Trang có section vị trí tự do, hộp, chia cột (LP03, LP04). | 1. Xuất bản, mở ở 390 px. | Không tràn ngang, các cột xếp dọc theo thứ tự logic, phần tử vị trí tự do không đè nhau. | Chưa có | Chưa chạy |
| LP12-S01-TC008 | Xoay màn hình và đổi cỡ động | P2 | Trang bất kỳ. | 1. Kéo thay đổi cỡ cửa sổ từ 1440 xuống 320 px liên tục. | Không có khung hình trung gian bị tràn nghiêm trọng hay chữ chồng lên nhau lâu. | Chưa có | Chưa chạy |

## LP12-S02. Hình ảnh và nội dung trong mẫu

**Mục tiêu:** Ảnh đúng ngành, tải được, không vỡ bố cục khi lỗi; chữ dài không làm vỡ thẻ.

**Căn cứ:** `scripts/qa-landing-page-global-visual.cjs` (đo `overflowX`, `formOverflow`, `textClip`), catalog mẫu.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP12-S02-TC001 | Ảnh toàn catalog đúng và tải được | P1 | Catalog 200 mẫu. | 1. Chạy `node scripts/qa-landing-page-global-visual.cjs` (có thể chia lô). | Báo cáo liệt kê mẫu có ảnh lỗi, ảnh không đúng ngành (đánh giá mắt thường trên tờ tổng hợp ảnh `LP_GLOBAL_CONTACT_SHEET=1`). | Một phần: `scripts/qa-landing-page-global-visual.cjs` kiểm: chụp 200 mẫu × 3 khung, tờ tổng hợp ảnh. Thiếu: tự động phát hiện ảnh sai ngành | Chưa chạy |
| LP12-S02-TC002 | Ảnh hotlink không tải được | P1 | Chặn mạng ra miền ảnh ngoài. | 1. Mở một mẫu dùng ảnh ngoài. | Vùng ảnh có nền thay thế, bố cục giữ nguyên, không có biểu tượng ảnh hỏng chồng lên chữ. | Chưa có | Chưa chạy |
| LP12-S02-TC003 | Ảnh quá lớn | P2 | Ảnh 8 MB trong trang. | 1. Mở ở mạng chậm. | Trang hiển thị chữ trước; ảnh tải dần (lười tải). Không chặn hiển thị. | Chưa có | Chưa chạy |
| LP12-S02-TC004 | Chữ dài làm vỡ thẻ | P1 | Thẻ lợi ích có tiêu đề 200 ký tự và một từ 60 ký tự không dấu cách. | 1. Mở ở 390 px và 1440 px. | Chữ xuống dòng hoặc cắt có dấu `...` đúng thiết kế, không tràn ra ngoài thẻ, không gây cuộn ngang. `textClip` bằng 0 trong kết quả đo. | Một phần: `scripts/qa-landing-page-global-visual.cjs` kiểm: đo `textClip`, `overflowX` mỗi mẫu. Thiếu: ngưỡng Đạt/Không đạt | Chưa chạy |
| LP12-S02-TC005 | Không có câu thiết kế rò rỉ trong nội dung | P1 | Catalog. | 1. Tìm trong chữ hiển thị các cụm hướng dẫn thiết kế (ví dụ ghi chú nội bộ, lorem ipsum, `TODO`). | Không có cụm nào xuất hiện trong nội dung khách thấy. | Chưa có | Chưa chạy |
| LP12-S02-TC006 | Phông chữ tiếng Việt | P1 | Mẫu bất kỳ. | 1. Kiểm tra chữ có dấu ở tiêu đề, đoạn văn, nút, biểu mẫu. | Dấu hiển thị đúng, không bị cắt phần trên/dưới (chiều cao dòng đủ). | Chưa có | Chưa chạy |
| LP12-S02-TC007 | Độ tương phản và cỡ chữ | P2 | Mẫu bất kỳ. | 1. Đo tương phản chữ/nền cho tiêu đề, đoạn văn, nút. | Đoạn văn đạt tối thiểu tỷ lệ tương phản 4,5:1; chữ trên mobile không nhỏ hơn 14 px. (Ngưỡng này là đề xuất, repo chưa quy định.) | Chưa có | Chưa chạy |

## LP12-S03. Audit toàn bộ catalog

**Mục tiêu:** Không mẫu nào tràn ngang, đều có form, theo cùng một tiêu chuẩn.

**Căn cứ:** `scripts/qa-landing-page-global-visual.cjs` (chú thích đầu tệp: 200 mẫu × desktop/tablet/mobile, chia lô, tờ tổng hợp).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP12-S03-TC001 | Audit 200 mẫu × 3 khung hình (LP12-F3, F4) | P1 | Môi trường có trình duyệt và đủ RAM, API/route chụp mẫu chạy, catalog đã đồng bộ. | 1. Chạy `node scripts/qa-landing-page-global-visual.cjs` (hoặc chia lô `LP_GLOBAL_BATCH=0 LP_GLOBAL_BATCH_SIZE=30`).<br>2. Đọc danh sách `issues`. | `issues` rỗng: không mẫu nào có `overflowX`, `formOverflow`. Mỗi mẫu có form lead hiển thị. Nếu có lỗi, ghi danh sách mẫu và khung hình. | Một phần: `scripts/qa-landing-page-global-visual.cjs` kiểm: chụp và đo toàn bộ 200 mẫu. Thiếu: tự động hóa kết luận Đạt/Không đạt | Chưa chạy |
| LP12-S03-TC002 | Mỗi mẫu có form ở ba khung | P0 | Catalog. | 1. Với mỗi mẫu đo sự có mặt của khối form trong khung nhìn sau khi cuộn. | Form có trong DOM và hiển thị, nằm trong khung nhìn ngang (`formOverflow = false`). | Một phần: `scripts/qa-landing-page-global-visual.cjs` kiểm: đo `formOverflow` mỗi mẫu. Thiếu: tồn tại và nhìn thấy được form | Chưa chạy |
| LP12-S03-TC003 | Tính toàn vẹn catalog trước khi audit | P1 | Catalog. | 1. Chạy `validate-landing-page-template-catalog.cjs` (LP02-S01). | PASS. Audit hình ảnh chỉ có ý nghĩa khi catalog hợp lệ. | Đã có: `scripts/validate-landing-page-template-catalog.cjs` kiểm: các bộ kiểm catalog | Chưa chạy |
| LP12-S03-TC004 | Khác biệt giữa các mẫu | P2 | Catalog. | 1. Chạy `test-landing-page-template-differentiation.cjs`. | Mỗi danh mục có kiến trúc riêng, không cấu trúc nào chiếm quá 50%. | Đã có: `scripts/test-landing-page-template-differentiation.cjs` kiểm: kiến trúc danh mục khác nhau; tỷ trọng cấu trúc | Chưa chạy |
| LP12-S03-TC005 | Tờ tổng hợp ảnh để người xem soát | P2 | `LP_GLOBAL_CONTACT_SHEET=1`. | 1. Chạy và mở tờ ảnh tổng hợp. | Có tờ ảnh gồm các mẫu để rà soát bằng mắt về ảnh sai ngành và phong cách. | Chưa có | Chưa chạy |

## LP12-S04. Cách ly mẫu pilot và CSS dùng chung

**Mục tiêu:** Mẫu pilot giữ nguyên giao diện; CSS dùng chung không phá mẫu khác.

**Căn cứ:** Script cách ly và CSS nền chung.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP12-S04-TC001 | Mẫu Agency Portfolio không bị CSS chung ảnh hưởng | P0 | Bản dựng web hiện tại. | 1. Chạy `qa-agency-portfolio-isolation.cjs`. | PASS các điều kiện cách ly CSS của mẫu pilot (khoảng 4 dòng kiểm). | Đã có: `scripts/qa-agency-portfolio-isolation.cjs` kiểm: cách ly CSS của mẫu pilot | Chưa chạy |
| LP12-S04-TC002 | Thay đổi CSS dùng chung không làm hỏng mẫu cũ | P0 | Trước và sau khi đổi `landing-page-responsive-foundation.ts`. | 1. Chụp 1 mẫu mỗi danh mục (20 mẫu) × 3 khung trước và sau.<br>2. So ảnh. | Không khác biệt ngoài ý muốn. Trang khách cũ không đổi bố cục. | Chưa có | Chưa chạy |
| LP12-S04-TC003 | Lớp CSS theo phiên bản catalog | P1 | Hai phiên bản catalog khác nhau. | 1. Mở một mẫu của mỗi phiên bản. | Mỗi mẫu dùng đúng lớp CSS nền chung cộng lớp riêng của phiên bản; không rò rỉ giữa các phiên bản. | Chưa có | Chưa chạy |
| LP12-S04-TC004 | Trang công khai và xem trước dùng cùng CSS | P1 | Trang có hiệu ứng và vị trí tự do. | 1. So `/p/<slug>`, link xem trước, và xem trước toàn màn hình. | Cùng bố cục. | Một phần: `scripts/test-landing-page-builder-preview-public-parity.cjs` kiểm: so khớp mã nguồn builder/xem trước/công khai. Thiếu: so ảnh | Chưa chạy |
| LP12-S04-TC005 | Bundle CSS không phình quá mức | P2 | Bản dựng web. | 1. Đo kích thước CSS tải cho một trang công khai. | Ghi số đo. Chưa có ngưỡng trong repo; đề xuất đặt ngưỡng. | Chưa có | Chưa chạy |

## LP12-S05. Cổng kiểm tra thiết kế builder và hồi quy giao diện

**Mục tiêu:** Các cổng mã nguồn bảo vệ khỏi mất tính năng; hỗ trợ khi phát hành.

**Căn cứ:** Các cổng kiểm tra mã nguồn và QA trình duyệt trong `scripts/`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP12-S05-TC001 | Cổng UX thiết kế của builder (LP12-F2) | P1 | Mã nguồn hiện tại. | 1. Chạy `node scripts/test-landing-page-design-audit.cjs`. | Các cổng chọn/kéo/xóa/dự phòng chỗ/thanh công cụ báo PASS. Phạm vi là builder, không phải ảnh hưởng thị giác của mẫu công khai. | Đã có: `scripts/test-landing-page-design-audit.cjs` kiểm: các cổng UX builder đọc từ mã nguồn (canvas, chọn, free-drag, thanh nền section) | Chưa chạy |
| LP12-S05-TC002 | Không lỗi tải mã sau khi triển khai | P1 | Sau khi build và triển khai web mới. | 1. Chạy `node scripts/test-landing-page-next-chunk-reload.cjs`.<br>2. Mở trang builder và trang công khai đã mở từ trước. | Không lỗi tải chunk (HTTP 400/ChunkLoadError). Tải lại tự động hoặc báo rõ. | Một phần: `scripts/test-landing-page-next-chunk-reload.cjs` kiểm: cổng mã nguồn tránh ChunkLoadError. Thiếu: xác minh sau triển khai thật | Chưa chạy |
| LP12-S05-TC003 | Route builder thật không lỗi client | P1 | Bản dựng web. | 1. Chạy `node scripts/qa-landing-page-client-route-browser.cjs`. | Tải đúng bó mã builder sản xuất, mọi API bị chặn, không lỗi client (khoảng 5 dòng kiểm). | Đã có: `scripts/qa-landing-page-client-route-browser.cjs` kiểm: tải bó builder thật không lỗi trang | Chưa chạy |
| LP12-S05-TC004 | Nhãn danh mục tiếng Việt | P2 | Giao diện thư viện/tạo trang. | 1. Chạy `qa-landing-page-category-labels-browser.cjs`. | Nhãn hiển thị và giá trị lọc đúng. | Đã có: `scripts/qa-landing-page-category-labels-browser.cjs` kiểm: nhãn và giá trị lọc | Chưa chạy |
| LP12-S05-TC005 | Truy cập: phím Tab và nhãn | P2 | Trang công khai có form. | 1. Dùng Tab qua toàn trang.<br>2. Dùng trình đọc màn hình đọc tiêu đề và nhãn. | Thứ tự Tab theo thứ tự đọc, có chỉ báo focus, ảnh có `alt`, nút có tên. Repo chưa có test tự động cho phần này. | Chưa có | Chưa chạy |
| LP12-S05-TC006 | Chế độ tối và độ phóng 200% | P2 | Trình duyệt. | 1. Bật chế độ tối của hệ điều hành.<br>2. Phóng 200%. | Trang công khai giữ màu theo thiết kế (không bị đảo màu), ở 200% không vỡ và không mất nội dung. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa CSS dùng chung hoặc renderer: chạy S01, S04 và LP12-S03-TC001.
- Đổi catalog hoặc ảnh mẫu: chạy S02, S03 và LP02-S01.
- Thêm mẫu mới: chạy S03-TC001, S03-TC002 và S04-TC001.
- Sau mỗi bản triển khai: chạy S05-TC002 và S01-TC001 (trang smoke).
- Đổi hiệu ứng (LP11) hoặc vị trí tự do (LP03): chạy S01-TC007 và LP11-S04-TC004.
