# LP07: Trang công khai, preview, tên miền, SEO - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP07-trang-cong-khai-domain-seo.md](../flows/LP07-trang-cong-khai-domain-seo.md). Mức ưu tiên flow: P1. Route giao diện: `/p/[slug]`, `/p/preview/[token]`, `/landing-pages/domain`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** khách xem trang đã xuất bản, SEO, link xem trước bản nháp, tên miền riêng, mã theo dõi, cache. Gửi form ở LP06, xuất bản ở LP05.

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages-public.controller.ts`; `apps/api/src/landing-pages/landing-pages.service.ts` hàm `getPublicBySlug`, `issuePreviewToken`, `revokePreviewToken`, `getPublicByPreviewToken`, `upsertDomain`, `verifyDomain`, `listDomains`, `sanitizeTrackingConfig`; `apps/api/src/landing-pages/landing-page-domain-dns.util.ts`; `apps/web/src/app/p/[slug]/page.tsx`; `apps/web/src/components/landing-pages/lp-tracking.ts`; `apps/web/src/app/(app)/landing-pages/domain/page.tsx`. Thông báo lỗi lấy nguyên văn từ code.

**Case liên quan ở flow khác:** LP05 (xuất bản, hủy xuất bản, cache); LP06 (form); F52 (trang công khai) cho S01, S02, S07; F03 (tách tổ chức) cho S04-TC012, S05-TC013.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP07-F1 | Mã nguồn **không** có chỗ nào phục vụ trang theo tên miền riêng hoặc theo `{subdomainSlug}.lp.aibeego.com`. API công khai chỉ tra theo `slug`, và web chỉ có route `/p/[slug]`. Phần `customDomain` chỉ lưu và kiểm tra DNS; việc chuyển tên miền tới trang do tầng edge bên ngoài (không có trong repo). Phản hồi xác minh ghi "SSL provisioning is architecture-ready". | apps/api/src/landing-pages/landing-pages.service.ts hàm `upsertDomain`, `verifyDomain`, `listDomains`; không có route theo host trong `apps/web/src/middleware.ts` hoặc `apps/api/src/landing-pages` | Cần xác nhận cách phục vụ tên miền riêng trên production. Các case "mở trang bằng tên miền riêng" (LP07-S05-TC010) ghi **chưa thể chạy trong môi trường chỉ có repo**. | LP07-S05-TC010 |
| LP07-F2 | Không có endpoint **gỡ** tên miền riêng. `POST :id/domain` chỉ ghi đè (`customDomain` tối thiểu 3 ký tự). Không có cách đặt lại về trống từ API/giao diện. | `apps/api/src/landing-pages/landing-pages.controller.ts` (chỉ `upsertDomain` và `verifyDomain`); `UpdateLandingPageDto` không có `customDomain` | Cần xác nhận có cần chức năng gỡ tên miền. | LP07-S05-TC009 |
| LP07-F3 | Tên miền đã được trang khác (kể cả tổ chức khác) dùng trả 400 "Domain đã được dùng". Thông báo này cho phép người dùng dò xem một tên miền đã có người đăng ký trên hệ thống hay chưa. | apps/api/src/landing-pages/landing-pages.service.ts hàm `upsertDomain` (truy vấn `customDomain` không lọc tổ chức) | Cần xác nhận mức chấp nhận về lộ thông tin giữa các tổ chức. Xem F03. | LP07-S05-TC006 |
| LP07-F4 | ID theo dõi (`ga4MeasurementId`, `metaPixelId`, `googleAdsId`) được lọc ký tự `<` và `>` rồi đưa vào mã script nội tuyến bằng nối chuỗi (`gtag('config','${ga4}')`). Giá trị chứa dấu nháy đơn có thể thoát khỏi chuỗi và chạy mã tùy ý trên trang công khai. | apps/api/src/landing-pages/landing-pages.service.ts hàm `sanitizeTrackingConfig` (chỉ xóa `<>` và cắt độ dài); apps/web/src/components/landing-pages/lp-tracking.ts hàm `injectTrackingPixels` | Cần xác nhận định dạng ID được kiểm nghiêm (ví dụ chỉ chữ, số, gạch). Nếu không, đây là lỗi bảo mật cần báo. | LP07-S06-TC003 |
| LP07-F5 | Với link xem trước, nội dung lấy từ **bản nháp** (`draftSpec`), gồm cả nội dung chưa xuất bản. Bất kỳ ai có link đều xem được cho tới khi hết hạn (mặc định 72 giờ, tối đa 720 giờ) hoặc bị thu hồi. Phát hành token mới sẽ thay token cũ. | apps/api/src/landing-pages/landing-pages.service.ts hàm `issuePreviewToken`, `getPublicByPreviewToken` | Khớp thiết kế. Cần xác nhận khoảng thời gian mặc định. | LP07-S04-TC001, LP07-S04-TC006 |
| LP07-F6 | `GET /landing-pages/public/preview/:token` chỉ làm sạch token thành các ký tự hex và cắt 64 ký tự. Token ngắn hơn 32 ký tự sau khi làm sạch trả 404 "Preview không hợp lệ hoặc đã hết hạn" trước cả khi đếm giới hạn tần suất. | apps/api/src/landing-pages/landing-pages.service.ts hàm `getPublicByPreviewToken` | Khớp thiết kế, ghi lại để case rate limit chọn token đủ dài. | LP07-S04-TC008 |

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
| LP07-S01 | Xem trang công khai | 10 |
| LP07-S02 | Trạng thái trang và trả về 404 | 6 |
| LP07-S03 | SEO và siêu dữ liệu | 8 |
| LP07-S04 | Link xem trước bản nháp | 12 |
| LP07-S05 | Tên miền riêng và kiểm tra DNS | 14 |
| LP07-S06 | Mã theo dõi (GA4, Meta Pixel, Google Ads) | 5 |
| LP07-S07 | Cache, hiệu năng và an toàn trang công khai | 6 |
| | **Tổng** | **61** |

## LP07-S01. Xem trang công khai

**Mục tiêu:** Khách mở `/p/<slug>` thấy đúng nội dung đã xuất bản.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages-public.controller.ts` `GET :slug`, `LandingPagesService.getPublicBySlug`, `toPublicSpec`, trang `apps/web/src/app/p/[slug]/page.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S01-TC001 | **[SMOKE-4]** Mở trang smoke trên /p/slug | P0 | Trang `PAGE-SMOKE` đã xuất bản (SMOKE-3) với tiêu đề `SMOKE-HEADLINE-20261111`, dòng phụ `SMOKE-SUB-20261111`, có form lead. Cửa sổ ẩn danh. | 1. Mở `https://<domain web>/p/<slug>`.<br>2. Đọc tiêu đề, dòng phụ, sự có mặt của form.<br>3. Mở tab Network, xem mã trả về của `GET /api/v1/landing-pages/public/<slug>`. | HTTP 200, hiển thị đủ tiêu đề và dòng phụ như trong builder, có form. API công khai trả 200. Không thấy thanh công cụ builder hay menu quản trị. Sự kiện `PAGE_VIEW` được ghi (kiểm ở LP08). | Một phần: `scripts/test-landing-page-public-meta-keep.cjs` kiểm: API công khai và xem trước giữ siêu dữ liệu render của canvas (BUG-01). Thiếu: mở trang thật trên trình duyệt và nội dung hiển thị | Chưa chạy |
| LP07-S01-TC002 | Nội dung giống bản trong builder | P0 | Trang đã xuất bản, có nhiều loại phần tử. | 1. So sánh trang công khai với builder (chế độ xem trước toàn màn hình) ở 1440 px. | Vị trí, kích thước, chữ, màu trùng khớp (không lệch quá vài px do phông chữ). | Một phần: `scripts/test-landing-page-builder-preview-public-parity.cjs` kiểm: so khớp mã nguồn builder, xem trước và công khai cho hero, CTA, bảo đảm, form, lợi ích, bảng giá, ảnh (BUG-03/04/05). Thiếu: so khớp pixel trên trình duyệt | Chưa chạy |
| LP07-S01-TC003 | Phần tử vị trí tự do hiển thị đúng | P0 | Trang có phần tử kéo tự do đã xuất bản. | 1. Mở trang công khai.<br>2. Đo vị trí các phần tử so với builder. | Phần tử vị trí tự do không biến mất và không lệch (BUG-02). | Một phần: `scripts/test-landing-page-public-free-position.cjs` kiểm: mã nguồn giữ các section vị trí tự do ở trang công khai. Thiếu: kiểm hiển thị thật | Chưa chạy |
| LP07-S01-TC004 | Phần tử ẩn không hiển thị | P1 | Trong builder ẩn một phần tử (biểu tượng mắt), xuất bản. | 1. Mở trang công khai. | Phần tử ẩn không có trong DOM hoặc không nhìn thấy. Phần tử khóa vẫn hiển thị bình thường. | Một phần: `scripts/test-landing-page-element-visibility-lock.cjs` kiểm: ẩn/khóa ở builder và lưu lại. Thiếu: hiển thị ở trang công khai | Chưa chạy |
| LP07-S01-TC005 | Responsive ba khung hình | P1 | Trang đã xuất bản. | 1. Mở ở 1440, 768, 390 px.<br>2. Đo cuộn ngang. | Không có cuộn ngang, không vỡ bố cục. Xem thêm LP12. | Một phần: `scripts/qa-landing-page-catalog-responsive.cjs` kiểm: 20 danh mục × 3 khung. Thiếu: trang người dùng tự tạo | Chưa chạy |
| LP07-S01-TC006 | Nội dung đã làm sạch, không lộ dữ liệu builder | P0 | Trang đã xuất bản. | 1. Gọi `GET /landing-pages/public/<slug>`.<br>2. Tìm các trường nội bộ trong phản hồi. | Không có thông tin nguồn gốc builder (provenance), token xem trước, `organizationId` của người tạo hay `createdById`. Chỉ có `id`, `slug`, `name`, `theme`, `spec`, `seo`, `trackingConfig`, `subdomainSlug`, `customDomain`, `customDomainStatus`, `publishedAt`. | Chưa có | Chưa chạy |
| LP07-S01-TC007 | Chữ Unicode và emoji | P2 | Tiêu đề `Khuyến mãi 🎉 Tết`. | 1. Xuất bản và mở trang. | Hiển thị đúng, không lỗi font. | Chưa có | Chưa chạy |
| LP07-S01-TC008 | Ảnh tải được, ảnh lỗi không vỡ trang | P1 | Trang có ảnh tải từ `uploads` và một ảnh ngoài hỏng. | 1. Mở trang công khai. | Ảnh trong uploads hiển thị không cần đăng nhập. Ảnh hỏng không làm vỡ bố cục. | Chưa có | Chưa chạy |
| LP07-S01-TC009 | Mở bằng chữ hoa thường khác nhau | P2 | Trang slug `abc-def`. | 1. Mở `/p/ABC-DEF`. | Ghi lại: so khớp slug có phân biệt hoa thường theo cơ sở dữ liệu. Theo code, `findFirst({ slug })` phân biệt nên có thể trả 404. Cần xác nhận mong muốn. | Chưa có | Chưa chạy |
| LP07-S01-TC010 | Slug có ký tự đặc biệt | P2 | Không có trang nào. | 1. Mở `/p/%2e%2e`, `/p/a%2Fb`, `/p/<script>`. | 404 sạch (không 500, không lộ lỗi nội bộ). | Chưa có | Chưa chạy |

## LP07-S02. Trạng thái trang và trả về 404

**Mục tiêu:** Chỉ trang đang xuất bản hiển thị cho khách.

**Căn cứ:** `getPublicBySlug` (`status = PUBLISHED` và có `publishedSpec`), hàm `fetchPublic` trong trang web.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S02-TC001 | Trang nháp chưa xuất bản trả 404 | P0 | Trang T ở trạng thái DRAFT, chưa từng xuất bản. | 1. Mở `/p/<slug của T>`.<br>2. `GET {API}/landing-pages/public/<slug>`. | Giao diện hiện trang 404. API 404 "Landing page không tồn tại hoặc chưa publish". Thẻ title của trang lỗi là `Landing page` với `robots: noindex, nofollow`. | Chưa có | Chưa chạy |
| LP07-S02-TC002 | Trang bị gỡ xuất bản trả 404 | P0 | Trang T đã xuất bản rồi gỡ (LP05-S06). | 1. Mở `/p/<slug>` (sau tối đa 60 giây cache). | 404. Trang không còn trong kết quả tìm kiếm của khách. | Chưa có | Chưa chạy |
| LP07-S02-TC003 | Trang đã lưu trữ trả 404 | P1 | Trang PUBLISHED sau đó lưu trữ (LP08). | 1. Mở `/p/<slug>`. | 404 (trạng thái ARCHIVED không phải PUBLISHED). | Chưa có | Chưa chạy |
| LP07-S02-TC004 | Trang bị xóa trả 404 | P1 | Trang đã xóa vĩnh viễn. | 1. Mở `/p/<slug>`. | 404. | Chưa có | Chưa chạy |
| LP07-S02-TC005 | Trang tạm sửa mẫu không công khai | P0 | Workbench `tpl-edit-<slug>` (LP09). | 1. Mở `/p/tpl-edit-<slug>`. | 404, vì trang này luôn DRAFT và không thể xuất bản. | Chưa có | Chưa chạy |
| LP07-S02-TC006 | Lỗi API làm trang trả 404 thay vì 500 | P2 | Dừng API (môi trường test). | 1. Mở `/p/<slug>`. | Trang 404 hoặc thông báo lỗi sạch (hàm `fetchPublic` bắt lỗi và trả `null`). Ghi lại: lỗi mạng bị hiểu thành "không tồn tại", cần xác nhận có chấp nhận (khách có thể thấy 404 khi hệ thống đang lỗi). | Chưa có | Chưa chạy |

## LP07-S03. SEO và siêu dữ liệu

**Mục tiêu:** Tiêu đề, mô tả, canonical, robots và Open Graph đúng và nằm trong HTML.

**Căn cứ:** `generateMetadata` trong trang `/p/[slug]`, `getPublicBySlug` (ghép `seo`), `UpdateLandingPageDto`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S03-TC001 | Tiêu đề và mô tả trong HTML | P1 | Trang có `seoTitle = "SEO Title 20261111"`, `seoDescription = "Mo ta 20261111"` đã xuất bản. | 1. Tải HTML của `/p/<slug>` bằng `curl`.<br>2. Tìm `<title>` và `<meta name="description">`. | `<title>` là `SEO Title 20261111`, mô tả khớp. Nếu bản ghi không có `seoTitle` thì dùng `spec.seo.title`, rồi tới tên trang. | Chưa có | Chưa chạy |
| LP07-S03-TC002 | Canonical | P1 | `seoCanonical = https://example.com/trang`. | 1. Xem `<link rel="canonical">`. | Có canonical đúng giá trị. Nếu để trống thì không có thẻ canonical. | Chưa có | Chưa chạy |
| LP07-S03-TC003 | Robots index/noindex | P1 | Trang A `robotsIndex = true`, trang B `robotsIndex = false`. | 1. Xem `<meta name="robots">` của hai trang. | A: `index, follow`. B: `noindex, nofollow`. | Chưa có | Chưa chạy |
| LP07-S03-TC004 | Open Graph và Twitter card | P2 | Trang có `ogImage` và không có `ogImage`. | 1. Xem thẻ `og:title`, `og:description`, `og:image`, `twitter:card`. | Có `og:image` thì `twitter:card = summary_large_image`, không có thì `summary`. | Chưa có | Chưa chạy |
| LP07-S03-TC005 | JSON-LD | P2 | Trang đã xuất bản. | 1. Tìm `<script type="application/ld+json">`. | Có `@type: WebPage`, `name` và `description` đúng, `url` là canonical nếu có. | Chưa có | Chưa chạy |
| LP07-S03-TC006 | Lưu SEO qua autosave đồng bộ vào bản ghi | P1 | Trong builder sửa SEO title. | 1. Chờ lưu, xuất bản.<br>2. `GET {API}/landing-pages/public/<slug>`, đọc `seo`. | `seo.title` là giá trị mới. Giá trị bị cắt: title 200, description 500 ký tự. | Chưa có | Chưa chạy |
| LP07-S03-TC007 | Giới hạn độ dài SEO qua PATCH | P2 | Token ORG-A-OWNER. | 1. `PATCH /landing-pages/<id>` với `seoTitle` 201 ký tự, `seoDescription` 501, `seoCanonical` 2001, `ogImage` 2001. | Cả bốn trả 400 do `MaxLength`. | Chưa có | Chưa chạy |
| LP07-S03-TC008 | Ký tự đặc biệt trong SEO | P1 | `seoTitle = "A \"B\" <i>C</i> & D"`. | 1. Xuất bản và xem HTML. | Giá trị được escape đúng trong thẻ, không phá cấu trúc HTML hay chèn thẻ. | Chưa có | Chưa chạy |

## LP07-S04. Link xem trước bản nháp

**Mục tiêu:** Chủ trang chia sẻ bản nháp bằng link có hạn, không lộ cho người ngoài.

**Căn cứ:** `issuePreviewToken` (`randomBytes(32)`, mặc định 72 giờ, tối đa 720), `revokePreviewToken`, `getPreviewTokenStatus`, `getPublicByPreviewToken`, route web `p/preview/[token]`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S04-TC001 | Tạo link xem trước | P0 | Trang T có nháp chưa xuất bản. Token ORG-A-OWNER. | 1. `POST {API}/landing-pages/<T>/preview-token` body `{}`.<br>2. Mở `previewPath` trong cửa sổ ẩn danh. | Trả `token` (64 ký tự hex), `expiresAt` khoảng 72 giờ sau, `previewPath: /p/preview/<token>`, `robotsIndex: false`. Link mở được bản nháp, tiêu đề tab có tiền tố `[Preview]`, thẻ robots noindex nocache. | Chưa có | Chưa chạy |
| LP07-S04-TC002 | Chọn thời hạn | P1 | Trang T. | 1. Tạo token với `expiresInHours` = 1, 0, -5, 5000, "abc". | 1: hết hạn sau 1 giờ. 0, -5, "abc": dùng mặc định 72. 5000: cắt còn 720 giờ. | Chưa có | Chưa chạy |
| LP07-S04-TC003 | Token mới thay token cũ | P1 | Đã có token A. | 1. Tạo token B.<br>2. Mở link A, rồi link B. | Link A 404 "Preview không hợp lệ hoặc đã hết hạn". Link B mở được. | Chưa có | Chưa chạy |
| LP07-S04-TC004 | Thu hồi link | P0 | Token đang hiệu lực. | 1. `POST /landing-pages/<T>/preview-token/revoke`.<br>2. Mở link.<br>3. `GET /preview-token` xem trạng thái. | Thu hồi trả `{ok:true}`. Link 404. Trạng thái `{active:false, previewPath:null}`. | Chưa có | Chưa chạy |
| LP07-S04-TC005 | Link hết hạn | P0 | Đặt `previewExpiresAt` về quá khứ trong DB test. | 1. Mở link. | 404 "Preview không hợp lệ hoặc đã hết hạn". | Chưa có | Chưa chạy |
| LP07-S04-TC006 | Xem trước hiển thị bản nháp mới nhất | P1 | Token đang hiệu lực. Nháp có tiêu đề `P1`. | 1. Sửa tiêu đề thành `P2`, chờ lưu.<br>2. Tải lại link xem trước. | Hiển thị `P2` (đọc từ `draftSpec`). Trang công khai chính thức không đổi. Có thể chậm do cache của trình duyệt. | Chưa có | Chưa chạy |
| LP07-S04-TC007 | Trạng thái token | P2 | Trang T. | 1. `GET /preview-token` khi chưa có token, khi còn hiệu lực, khi hết hạn. | `active` lần lượt `false`, `true`, `false`. `previewPath` chỉ có khi hiệu lực. | Chưa có | Chưa chạy |
| LP07-S04-TC008 | Token sai hoặc quá ngắn (LP07-F6) | P1 | Không cần đăng nhập. | 1. Mở `/p/preview/abc`, `/p/preview/zzzz`, `/p/preview/<64 ký tự hex ngẫu nhiên>`. | Cả ba 404 "Preview không hợp lệ hoặc đã hết hạn". | Chưa có | Chưa chạy |
| LP07-S04-TC009 | Giới hạn thử token | P2 | Một IP. | 1. Gửi 61 yêu cầu trong 1 phút tới `/landing-pages/public/preview/<token hợp lệ về độ dài>`.<br>2. Dùng cùng một token gửi 41 lần/phút từ IP khác nhau. | Yêu cầu thứ 61 từ một IP báo "Quá nhiều yêu cầu preview". Yêu cầu thứ 41 cho cùng token báo "Preview token bị thử quá nhiều". | Chưa có | Chưa chạy |
| LP07-S04-TC010 | Link xem trước của trang đã lưu trữ | P2 | Trang có token rồi bị lưu trữ. | 1. Mở link.<br>2. Tạo token mới cho trang đã lưu trữ. | Mở link: 404 (trạng thái ARCHIVED bị loại). Tạo mới: 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |
| LP07-S04-TC011 | Người chỉ xem không tạo được link | P0 | Token ORG-A-VIEWER. | 1. `POST /preview-token`.<br>2. `POST /preview-token/revoke`.<br>3. `GET /preview-token`. | Hai lệnh ghi trả 403, lệnh đọc trả 200 (cần `lead.read`). | Chưa có | Chưa chạy |
| LP07-S04-TC012 | Tổ chức khác không tạo hoặc thu hồi được | P0 | Trang T của ORG-A. Token ORG-B-OWNER. | 1. ORG-B gọi các lệnh preview-token trên T. | 404 "Landing page không tồn tại". Xem F03. | Chưa có | Chưa chạy |

## LP07-S05. Tên miền riêng và kiểm tra DNS

**Mục tiêu:** Gắn tên miền hợp lệ, kiểm tra CNAME, chặn địa chỉ nội bộ.

**Căn cứ:** `upsertDomain`, `verifyDomain`, `listDomains`, `apps/api/src/landing-pages/landing-page-domain-dns.util.ts` (đích CNAME mặc định `lp-edge.aibeego.com`, ghi đè bằng `LANDING_PAGE_CNAME_TARGET`), `isValidSenderDomain`, trang web `landing-pages/domain/page.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S05-TC001 | Gắn tên miền hợp lệ | P1 | Trang T, ORG-A-OWNER. Tên miền `lp.test-aibeego.example`. | 1. Ở `/landing-pages/domain` chọn trang, nhập `lp.test-aibeego.example`, bấm "Gắn domain".<br>2. Đọc thông báo và trạng thái. | Thông báo "Đã lưu domain (PENDING) — bấm Verify DNS". Trang có `customDomain` đúng, `customDomainStatus = PENDING`, lỗi và ngày xác minh được xóa. | Chưa có | Chưa chạy |
| LP07-S05-TC002 | Chuẩn hóa tên miền | P1 | Trang T. | 1. Gắn `HTTPS://WWW.Lp.Test-Aibeego.example:8443/duong/dan/`. | Lưu thành `lp.test-aibeego.example` (bỏ giao thức, đường dẫn, cổng, dấu chấm cuối, tiền tố `www.`, chữ thường). | Chưa có | Chưa chạy |
| LP07-S05-TC003 | Tên miền không hợp lệ | P1 | Trang T. | 1. Gắn `abc`, `a..b.com`, `-x.com`, `x.c`, `exa mple.com`, `ab` (2 ký tự), chuỗi 256 ký tự. | `ab` và 256 ký tự: 400 do DTO (3 đến 255). Các giá trị còn lại: 400 "Domain không hợp lệ". | Chưa có | Chưa chạy |
| LP07-S05-TC004 | Chặn tên miền nội bộ | P0 | Trang T. | 1. Gắn `localhost`, `my.local`, `10.0.0.1`, `192.168.1.5`, `172.16.0.9`, `127.0.0.1`. | Các giá trị tên chữ như `localhost`, `my.local`: 400 "Domain nội bộ bị chặn (SSRF)" (hoặc "Domain không hợp lệ" nếu bị loại ở bước kiểm tra định dạng, vì biểu thức tên miền yêu cầu đuôi chữ). Địa chỉ IP: 400 (hợp lệ hoặc chặn). Ghi lại thông báo thực tế. | Chưa có | Chưa chạy |
| LP07-S05-TC005 | Gắn lại ghi đè và đặt về PENDING | P2 | Trang T đang ACTIVE với tên miền A. | 1. Gắn tên miền B cho T. | `customDomain = B`, trạng thái về `PENDING`, `customDomainVerifiedAt = null`. | Chưa có | Chưa chạy |
| LP07-S05-TC006 | Tên miền đã dùng bởi trang khác (LP07-F3) | P0 | Trang T1 (ORG-A) gắn `used.test-aibeego.example`. | 1. T2 cùng tổ chức gắn tên miền đó.<br>2. Trang của ORG-B gắn tên miền đó. | Cả hai báo 400 "Domain đã được dùng". Dữ liệu T1 không đổi. | Chưa có | Chưa chạy |
| LP07-S05-TC007 | Xác minh khi chưa gắn tên miền | P1 | Trang T chưa có tên miền. | 1. `POST /landing-pages/<T>/domain/verify`. | 400 "Chưa gắn custom domain". | Chưa có | Chưa chạy |
| LP07-S05-TC008 | Xác minh CNAME đúng | P1 | Tên miền thử có CNAME trỏ tới `lp-edge.aibeego.com` (hoặc giá trị của biến `LANDING_PAGE_CNAME_TARGET`). | 1. Bấm "Verify DNS" hoặc `POST /domain/verify`. | Trạng thái qua `VERIFYING` rồi `ACTIVE`, `customDomainVerifiedAt` có giá trị, lỗi trống. Giao diện hiện `ACTIVE — CNAME OK → lp-edge.aibeego.com`. Trả thêm `dns` và `sslNote`. | Chưa có | Chưa chạy |
| LP07-S05-TC009 | Xác minh CNAME sai hoặc chưa trỏ | P1 | Tên miền có CNAME trỏ nơi khác hoặc không có. | 1. Bấm xác minh. | Trạng thái `FAILED`, `customDomainError = "CNAME chưa trỏ tới <đích>"`. Giao diện hiện `FAILED — CNAME chưa trỏ tới ... (found: ...)`. Sửa DNS rồi xác minh lại thì lên `ACTIVE`. | Chưa có | Chưa chạy |
| LP07-S05-TC010 | CNAME dạng phụ của đích | P2 | CNAME trỏ tới `x.lp-edge.aibeego.com`. | 1. Xác minh. | Được chấp nhận vì khớp `endsWith('.' + đích)`. Ghi lại để xác nhận có chủ ý. | Chưa có | Chưa chạy |
| LP07-S05-TC011 | Không có cách gỡ tên miền (LP07-F2) | P2 | Trang T đã gắn tên miền. | 1. Tìm chức năng gỡ trong giao diện và API. | Không có. Ghi nhận yêu cầu chức năng nếu cần. | Chưa có | Chưa chạy |
| LP07-S05-TC012 | Truy cập trang bằng tên miền riêng (LP07-F1) | P2 | Tên miền ACTIVE và tầng edge đã cấu hình. | 1. Mở `https://<tên miền>/` trong trình duyệt. | **Chưa thể chạy trong môi trường chỉ có repo**: mã nguồn không có xử lý theo host. Chỉ kiểm được trên môi trường có tầng edge. Kỳ vọng sản phẩm: hiển thị đúng nội dung trang. | Chưa có | Chưa chạy |
| LP07-S05-TC013 | Phân quyền và tách tổ chức | P0 | Token ORG-A-VIEWER và ORG-B-OWNER. | 1. Viewer gọi `POST /domain` và `POST /domain/verify`.<br>2. ORG-B gọi trên trang của ORG-A.<br>3. Viewer và ORG-B gọi `GET /landing-pages/domains`. | Viewer ghi: 403. ORG-B: 404. `GET /domains` chỉ trả trang của tổ chức gọi. | Chưa có | Chưa chạy |
| LP07-S05-TC014 | Danh sách tên miền | P1 | Tổ chức có 3 trang, 1 trang có tên miền. | 1. Mở `/landing-pages/domain`.<br>2. `GET /landing-pages/domains`. | Danh sách có các trang có `customDomain` hoặc `subdomainSlug` với trạng thái. Có mô tả `architecture`: `{subdomainSlug}.lp.aibeego.com`, `CNAME → lp-edge.aibeego.com`, các trạng thái `PENDING, VERIFYING, ACTIVE, FAILED`. | Chưa có | Chưa chạy |

## LP07-S06. Mã theo dõi (GA4, Meta Pixel, Google Ads)

**Mục tiêu:** ID theo dõi được lưu, hiển thị và không thể dùng để chèn mã.

**Căn cứ:** `sanitizeTrackingConfig`, apps/web/src/components/landing-pages/lp-tracking.ts `injectTrackingPixels`, `getPublicByPreviewToken` (trả `trackingConfig: null`).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S06-TC001 | Lưu và nạp ID theo dõi | P1 | Trang T. Trong builder nhập GA4 `G-TEST12345`. | 1. Lưu, xuất bản.<br>2. Mở trang công khai, kiểm tra thẻ script `lp-ga4`. | Có script tải `googletagmanager.com/gtag/js?id=G-TEST12345` và đoạn `gtag('config','G-TEST12345')`. Không nạp khi để trống. | Chưa có | Chưa chạy |
| LP07-S06-TC002 | Lọc ký tự < và > khi lưu | P1 | Token ORG-A-OWNER. | 1. `PATCH /landing-pages/<id>` với `trackingConfig: {ga4MeasurementId: "G-<x>1"}`. | Lưu thành `G-x1` (đã bỏ `<` và `>`), tối đa 32 ký tự (GA4), 40 (Meta, Ads). | Chưa có | Chưa chạy |
| LP07-S06-TC003 | ID chứa dấu nháy đơn (LP07-F4) | P0 | Token ORG-A-OWNER. | 1. `PATCH` với `ga4MeasurementId: "G-1');window.__x=1;//"`.<br>2. Xuất bản, mở trang công khai, đọc `window.__x`. | Kỳ vọng an toàn: giá trị bị từ chối hoặc được escape, `window.__x` không được đặt. Theo code hiện tại, dấu nháy không bị lọc nên có thể `window.__x = 1`. Nếu xảy ra, báo lỗi bảo mật. | Chưa có | Chưa chạy |
| LP07-S06-TC004 | Ép kiểu dữ liệu theo dõi | P2 | Token ORG-A-OWNER. | 1. `PATCH` với `trackingConfig` có số, mảng, đối tượng ở các trường. | Giá trị không phải chuỗi bị bỏ qua (`null`). Cờ `metaCapiReady`, `tiktokPixelReady` chỉ nhận đúng `true`. | Chưa có | Chưa chạy |
| LP07-S06-TC005 | Không nạp mã theo dõi khi xem trước | P1 | Trang có ID theo dõi. | 1. Mở link xem trước. | Phản hồi `trackingConfig = null`, không nạp script theo dõi. | Chưa có | Chưa chạy |

## LP07-S07. Cache, hiệu năng và an toàn trang công khai

**Mục tiêu:** Cache làm mới đúng lúc; trang công khai không nạp mã builder.

**Căn cứ:** `revalidate = 60` ở trang `/p/[slug]`, route `revalidate`, thành phần `PublicLandingPageClient`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP07-S07-TC001 | Cache làm mới sau khi xuất bản từ builder | P0 | Trang đang hiển thị `V1` (đã mở, có cache). | 1. Sửa thành `V2` và xuất bản từ builder.<br>2. Tải lại `/p/<slug>` ngay. | Hiển thị `V2` ngay (builder gọi `/api/landing-pages/revalidate`). Nếu thông báo ghi "Cache trang công khai chưa làm mới" thì chấp nhận chờ tối đa 60 giây. | Chưa có | Chưa chạy |
| LP07-S07-TC002 | Cache sau khi xuất bản qua API (LP05-F5) | P1 | Như trên nhưng xuất bản bằng `POST /publish`. | 1. Tải lại ngay và sau 70 giây. | Ngay: có thể còn `V1`. Sau 70 giây: `V2`. | Chưa có | Chưa chạy |
| LP07-S07-TC003 | Trang công khai không nạp mã builder | P1 | Trang đã xuất bản. | 1. Mở DevTools Network, tải `/p/<slug>`.<br>2. Tìm tệp JS của builder (canvas kéo thả, thanh bên). | Không tải mô-đun builder. Chỉ tải client công khai. | Chưa có | Chưa chạy |
| LP07-S07-TC004 | Tải trang trong ngưỡng chấp nhận | P2 | Trang trung bình (10 section). | 1. Đo thời gian tải khi cache nóng và cache lạnh. | Ghi lại số đo. Không có ngưỡng chính thức trong code; đề xuất ngưỡng với chủ sản phẩm. | Chưa có | Chưa chạy |
| LP07-S07-TC005 | Khách không đăng nhập vẫn xem được | P0 | Cửa sổ ẩn danh, không cookie. | 1. Mở `/p/<slug>` và gọi API công khai. | 200, không chuyển hướng đăng nhập. API công khai không yêu cầu token. | Chưa có | Chưa chạy |
| LP07-S07-TC006 | Lỗi tải mẫu cũ sau khi triển khai bản mới | P1 | Khách mở trang trước khi triển khai, rồi tải lại sau triển khai. | 1. Triển khai bản web mới.<br>2. Tải lại trang công khai đang mở. | Không lỗi tải tệp tĩnh (chunk). Xem thêm builder ở LP05. | Một phần: `scripts/test-landing-page-next-chunk-reload.cjs` kiểm: cổng kiểm tra mã nguồn tránh lỗi chunk sau khi build (không có assert). Thiếu: kiểm tra thực tế sau khi triển khai | Chưa chạy |

## Chạy lại khi nào

- Sửa `getPublicBySlug`, `toPublicSpec` hoặc trang `/p/[slug]`: chạy S01, S02, S03 và smoke SMOKE-4.
- Sửa renderer hoặc CSS dùng chung: chạy S01-TC002 đến TC005 và LP12.
- Sửa preview-token: chạy S04.
- Sửa domain/DNS: chạy S05.
- Sửa `sanitizeTrackingConfig` hoặc `lp-tracking.ts`: chạy S06 (đặc biệt S06-TC003).
- Sửa xuất bản, hủy xuất bản hoặc `revalidate`: chạy S07 và LP05-S06.
