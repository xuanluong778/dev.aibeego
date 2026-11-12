# LP02: Thư viện Templates (xem, lọc, xem trước, dùng mẫu) - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP02-thu-vien-templates.md](../flows/LP02-thu-vien-templates.md). Mức ưu tiên flow: P1. Route giao diện: `/landing-pages/templates`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** thư viện mẫu hệ thống (xem, lọc, tìm, xem trước, dùng mẫu), tính toàn vẹn catalog, đồng bộ catalog khi khởi động. Quản trị mẫu (sửa, tải, upload hàng loạt) ở LP09.

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listTemplates`, `getTemplate`, `ensureSystemTemplates`, `overview`; `apps/api/src/landing-pages/dto/landing-pages.dto.ts`; `apps/api/src/landing-pages/landing-pages-public.controller.ts` (xem trước HTML/ảnh); các script `validate-landing-page-template-catalog.cjs`, `test-landing-page-template-ui.cjs`, `test-landing-page-template-differentiation.cjs`, `qa-landing-page-*-responsive.cjs`.

**Case liên quan ở flow khác:** LP01-S04 (tạo từ mẫu); LP09 (quản trị mẫu); LP12 (chất lượng giao diện); F03 cho LP02-S07.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP02-F1 | Tham số `includeSystem=false` trong query string **không** loại mẫu hệ thống. DTO dùng `@Type(() => Boolean)` nên chuỗi `"false"` được đổi thành `true`, và dịch vụ so sánh `query.includeSystem !== false`. | `apps/api/src/landing-pages/dto/landing-pages.dto.ts` `ListLandingPageTemplatesQueryDto.includeSystem`; `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listTemplates` | Cần xác nhận giao diện có dùng tham số này không. Nếu có, đây là lỗi lọc. | LP02-S02-TC008 |
| LP02-F2 | Khi khởi động hoặc khi phiên bản catalog đổi, `ensureSystemTemplates` **xóa** các mẫu hệ thống không nằm trong catalog và không có tag `pack:managed`. Mẫu do admin tạo/sửa qua LP09 được gắn tag nên được giữ. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `ensureSystemTemplates` (biến `orphanIds`, `packManaged`) | Flow gốc ghi "đổi phiên bản catalog khi có mẫu đã sửa tay". Hành vi: mẫu có `pack:managed` giữ nguyên; mẫu không có thì bị đồng bộ lại hoặc xóa. Cần xác nhận mọi đường tạo mẫu thủ công đều gắn tag. | LP02-S06-TC001, LP02-S06-TC002 |
| LP02-F3 | Không kiểm tra `category` ở API: danh mục lạ trả danh sách rỗng (không lỗi 400). Chỉ `theme` được kiểm bằng danh sách cố định (MODERN, PREMIUM, MINIMAL, BOLD, CORPORATE). | `apps/api/src/landing-pages/dto/landing-pages.dto.ts` `ListLandingPageTemplatesQueryDto` | Khớp mong đợi hiện tại. Ghi lại để tránh nhầm khi viết test. | LP02-S02-TC006 |
| LP02-F4 | Mẫu của tổ chức (không phải hệ thống) cùng `slug` với mẫu hệ thống vẫn cùng xuất hiện trong danh sách; `POST /landing-pages` tra mẫu theo `slug` ưu tiên theo thứ tự truy vấn `findFirst`, không có quy tắc ưu tiên rõ ràng trong code. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `create` (điều kiện `OR` giữa mẫu hệ thống và mẫu của tổ chức) | Flow gốc đưa "mẫu của tổ chức trùng slug với mẫu hệ thống" vào trường hợp biên. Cần xác nhận quy tắc ưu tiên mong muốn. Hiện chưa thấy đường tạo mẫu riêng của tổ chức trong giao diện. | LP02-S05-TC006 |
| LP02-F5 | Số lượng 200 mẫu được ghi trong flow, nhưng con số thực tế do `LANDING_PAGE_SYSTEM_TEMPLATES` và catalog quyết định. Test và tài liệu cần đọc số lượng từ catalog thay vì ghi cứng. | `apps/api/src/landing-pages/landing-pages.service.ts` hằng `LANDING_PAGE_SYSTEM_TEMPLATES`; script `validate-landing-page-template-catalog.cjs` | Cần xác nhận số mẫu mong đợi tại thời điểm chạy. | LP02-S01-TC001 |

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
| LP02-S01 | Danh mục mẫu: tính toàn vẹn của catalog | 6 |
| LP02-S02 | Liệt kê, lọc và tìm kiếm mẫu | 11 |
| LP02-S03 | Xem trước mẫu | 8 |
| LP02-S04 | Responsive và cách ly mẫu pilot | 5 |
| LP02-S05 | Dùng mẫu để tạo trang (không đụng mẫu gốc) | 6 |
| LP02-S06 | Đồng bộ catalog khi đổi phiên bản và mẫu đã sửa tay | 5 |
| LP02-S07 | Phân quyền, tổ chức và phạm vi hiển thị | 5 |
| | **Tổng** | **46** |

## LP02-S01. Danh mục mẫu: tính toàn vẹn của catalog

**Mục tiêu:** Catalog đồng bộ đúng vào cơ sở dữ liệu, không trùng, cấu trúc hợp lệ.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `ensureSystemTemplates` (khử trùng, xóa mẫu mồ côi, nhánh nhanh theo phiên bản catalog), script `validate-landing-page-template-catalog.cjs`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S01-TC001 | Catalog hợp lệ | P0 | Mã nguồn catalog mới nhất đã build (`packages/shared`). | 1. Chạy `node scripts/validate-landing-page-template-catalog.cjs`. | Các bộ kiểm báo `PASS` và dòng cuối `TEMPLATE_CATALOG_VALIDATORS=PASS`. Không có `ERR`. Cảnh báo `WARN` được rà soát và ghi lại. | Đã có: `scripts/validate-landing-page-template-catalog.cjs` kiểm: các bộ kiểm catalog sản xuất (in PASS/FAIL theo tên, ERR/WARN theo mã). Slug không trùng và cấu trúc hợp lệ nằm trong các bộ kiểm này, chưa đọc từng bộ | Chưa chạy |
| LP02-S01-TC002 | Số mẫu trong cơ sở dữ liệu khớp catalog | P0 | API đã khởi động sau khi đổi catalog. | 1. Đếm `landing_page_templates` với `organizationId IS NULL AND isSystem = true`.<br>2. So với số phần tử `LANDING_PAGE_SYSTEM_TEMPLATES`. | Số lượng bằng nhau (cộng các mẫu có tag `pack:managed` thêm bởi admin). Không có `slug` trùng. Mỗi mẫu có `thumbnailUrl` chứa `<slug>-thumb.webp`. | Chưa có | Chưa chạy |
| LP02-S01-TC003 | Đồng bộ lại không ghi lại khi không đổi | P1 | Catalog không đổi. | 1. Khởi động lại API hai lần.<br>2. Xem log và `updatedAt` của vài mẫu. | Lần khởi động sau đi nhánh "idempotent-db-match", không ghi lại dữ liệu, `updatedAt` không đổi. | Chưa có | Chưa chạy |
| LP02-S01-TC004 | Slug mẫu hợp lệ | P1 | Danh sách mẫu. | 1. Lấy toàn bộ `slug` từ `GET /landing-pages/templates`. | Mỗi `slug` khớp `^[a-z0-9-]+$`, không rỗng, không trùng, độ dài không quá 80. | Chưa có | Chưa chạy |
| LP02-S01-TC005 | Mỗi mẫu dùng được để tạo trang | P1 | Danh sách 200 mẫu hoặc mẫu mẫu đại diện từng danh mục. | 1. Với mỗi mẫu (hoặc mẫu đại diện mỗi ngành) gọi `POST /landing-pages` bằng `templateSlug`.<br>2. Xóa các trang thử sau đó. | Tạo thành công, trang có khối bắt buộc và qua `validateLandingPageSpec`. Mẫu có LeadForm hoặc CTA để thu lead. | Một phần: `scripts/qa-landing-page-real-catalog.cjs` kiểm: snapshot catalog thật chỉ đọc (4 dòng, khoảng 2 dòng kiểm). Thiếu: tạo trang thật từ từng mẫu | Chưa chạy |
| LP02-S01-TC006 | Các mẫu không giống nhau về cấu trúc | P1 | Catalog. | 1. Chạy `node scripts/test-landing-page-template-differentiation.cjs`. | Mỗi danh mục có kiến trúc riêng (`CATEGORY_ARCHITECTURE_UNIQUE`) và trong một danh mục không có cấu trúc nào chiếm quá 50% (`TEMPLATE_STRUCTURE_UNIQUE`). | Đã có: `scripts/test-landing-page-template-differentiation.cjs` kiểm: kiến trúc danh mục khác nhau; tỷ trọng cấu trúc tối đa 50% trong danh mục | Chưa chạy |

## LP02-S02. Liệt kê, lọc và tìm kiếm mẫu

**Mục tiêu:** API và giao diện lọc đúng theo ngành, kiểu, họ thiết kế, mục tiêu chuyển đổi và từ khóa.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listTemplates`; `ListLandingPageTemplatesQueryDto` (category ≤64, q ≤120, designFamily ≤32, conversionGoal ≤32).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S02-TC001 | Mở thư viện mẫu | P0 | ORG-A-OWNER (không phải SUPER_ADMIN). | 1. Mở `/landing-pages/templates`. | Hiện danh sách thẻ mẫu với tên, mô tả, ảnh đại diện. Chỉ có mẫu đã xuất bản. Không có nút "Sửa mẫu gốc" (chỉ SUPER_ADMIN, xem LP09). | Một phần: `scripts/test-landing-page-template-ui.cjs` kiểm: cổng giao diện mẫu: hỗ trợ ba khung hình, hero có hình + CTA + form (khoảng 3 dòng kiểm). Thiếu: danh sách thẻ trên trình duyệt thật | Chưa chạy |
| LP02-S02-TC002 | Lọc theo ngành | P0 | Danh sách mẫu. | 1. Chọn một ngành, ví dụ spa.<br>2. `GET /landing-pages/templates?category=<mã ngành>`. | Chỉ có mẫu của ngành đó. Giao diện và API cho cùng kết quả. | Một phần: `scripts/test-landing-page-template-ui.cjs` kiểm: kiểm bộ lọc và giao diện ở mức gate. Thiếu: so sánh kết quả với API | Chưa chạy |
| LP02-S02-TC003 | Lọc theo kiểu (theme) | P1 | Danh sách mẫu. | 1. `GET /templates?theme=BOLD`. | Chỉ có mẫu `theme = BOLD`. | Chưa có | Chưa chạy |
| LP02-S02-TC004 | Theme không hợp lệ | P2 | Token ORG-A-OWNER. | 1. `GET /templates?theme=NEON`. | 400 do `IsIn(THEMES)`. | Chưa có | Chưa chạy |
| LP02-S02-TC005 | Lọc theo họ thiết kế và mục tiêu chuyển đổi | P1 | Danh sách mẫu. | 1. `GET /templates?designFamily=editorial`.<br>2. `GET /templates?conversionGoal=booking`.<br>3. Kết hợp cả hai. | Mỗi kết quả có `designFamily`/`conversionGoal` khớp (không phân biệt hoa thường). Kết hợp là phép giao. | Chưa có | Chưa chạy |
| LP02-S02-TC006 | Danh mục lạ trả danh sách rỗng (LP02-F3) | P2 | Token ORG-A-OWNER. | 1. `GET /templates?category=khong-co`. | 200 với `items: []`, `total: 0`, không lỗi. | Chưa có | Chưa chạy |
| LP02-S02-TC007 | Tìm kiếm từ khóa | P1 | Danh sách mẫu. | 1. Tìm `spa`, `SPA`, tên một mẫu, một thẻ (tag), một slug.<br>2. Tìm chuỗi 121 ký tự. | Tìm không phân biệt hoa thường trong tên, mô tả, slug, ngành, họ thiết kế, mục tiêu, thẻ. 121 ký tự: 400 do `MaxLength(120)`. | Chưa có | Chưa chạy |
| LP02-S02-TC008 | includeSystem=false (LP02-F1) | P2 | Token ORG-A-OWNER. | 1. `GET /templates?includeSystem=false`. | Ghi lại: theo code, kết quả vẫn gồm mẫu hệ thống vì `"false"` thành `true`. Nếu đúng thì báo lỗi lọc. | Chưa có | Chưa chạy |
| LP02-S02-TC009 | Thứ tự sắp xếp | P2 | Danh sách mẫu. | 1. Đọc thứ tự trả về. | Mẫu hệ thống trước, rồi theo danh mục tăng dần, rồi theo tên tăng dần. | Chưa có | Chưa chạy |
| LP02-S02-TC010 | Cấu trúc một mục mẫu | P1 | Danh sách mẫu. | 1. Đọc một phần tử trong `items`. | Có `id, slug, name, category, theme, description, tags, thumbnailUrl, previewLongImage, htmlPreviewUrl, badges, designFamily, conversionGoal, architectureId, isSystem`. Với người thường **không** có `publishStatus` và `hasPublishedVersion`. | Chưa có | Chưa chạy |
| LP02-S02-TC011 | Nhãn danh mục tiếng Việt | P2 | Giao diện danh sách. | 1. Xem bộ lọc danh mục. | Nhãn tiếng Việt đúng, giá trị gửi lên là mã danh mục. | Đã có: `scripts/qa-landing-page-category-labels-browser.cjs` kiểm: nhãn hiển thị và giá trị lọc | Chưa chạy |

## LP02-S03. Xem trước mẫu

**Mục tiêu:** Xem trước đúng nội dung ở ba khung hình và an toàn.

**Căn cứ:** `getTemplate`, `apps/api/src/landing-pages/landing-pages-public.controller.ts` (`template-html`, `template-assets`), `LandingPageTemplatePackService.openPublicHtml`/`openPublicAsset`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S03-TC001 | Xem chi tiết một mẫu | P0 | Một mẫu đã xuất bản. | 1. `GET /landing-pages/templates/<slug>`.<br>2. Mở xem trước từ giao diện. | Trả `definition` đầy đủ và `thumbnailUrl`. Với người thường là bản đã xuất bản (`publishedDefinition`, nếu thiếu thì `definition`). | Chưa có | Chưa chạy |
| LP02-S03-TC002 | Xem trước ba khung hình | P1 | Mẫu bất kỳ. | 1. Chuyển Desktop, Tablet, Mobile.<br>2. Đo cuộn ngang. | Nội dung đúng ở cả ba khung, không tràn ngang. | Đã có: `scripts/qa-landing-page-real-catalog.cjs` kiểm: snapshot catalog thật (chỉ GET ảnh công khai) | Chưa chạy |
| LP02-S03-TC003 | Mẫu không tồn tại | P1 | Token ORG-A-OWNER. | 1. `GET /templates/khong-co`. | 404 "Template không tồn tại". | Chưa có | Chưa chạy |
| LP02-S03-TC004 | Mẫu nháp ẩn với người thường | P0 | Mẫu `DRAFT` chưa từng xuất bản. | 1. Người thường `GET /templates/<slug>`.<br>2. SUPER_ADMIN `GET` cùng slug. | Người thường 404 "Template không tồn tại". SUPER_ADMIN 200 và có `publishStatus`, `hasPublishedVersion`. | Chưa có | Chưa chạy |
| LP02-S03-TC005 | Xem trước HTML công khai của mẫu | P1 | Mẫu có `htmlPreviewUrl`. | 1. Mở `GET /landing-pages/public/template-html/<templateId>` không đăng nhập. | Mẫu đã xuất bản: 200 `text/html`, có tiêu đề bảo mật `Content-Security-Policy` cấm script (`script-src 'none'`), `X-Content-Type-Options: nosniff`. | Chưa có | Chưa chạy |
| LP02-S03-TC006 | Bản nháp HTML cần khóa | P0 | Mẫu chưa xuất bản có `assetKey`. | 1. Mở `template-html/<id>` không có `k`.<br>2. Mở với `k` sai.<br>3. Mở với `k` đúng. | Không `k` và `k` sai: 404. `k` đúng: 200. | Chưa có | Chưa chạy |
| LP02-S03-TC007 | Id mẫu sai định dạng khi mở HTML hoặc ảnh | P1 | Không cần đăng nhập. | 1. Mở `template-html/abc`, `template-assets/<id>/../../etc/passwd`, `template-assets/<id>/x.exe`. | Tất cả 404 (id phải khớp `^[0-9a-f-]{16,40}$`, tên tệp phải thuộc phần mở rộng cho phép, chặn thoát thư mục). | Chưa có | Chưa chạy |
| LP02-S03-TC008 | Ảnh mẫu tải được hoặc hỏng không vỡ trang | P2 | Mẫu có ảnh bị lỗi (URL chết). | 1. Xem trước mẫu. | Ảnh lỗi không làm vỡ bố cục xem trước. | Chưa có | Chưa chạy |

## LP02-S04. Responsive và cách ly mẫu pilot

**Mục tiêu:** Mẫu không tràn ngang; mẫu Agency Portfolio không bị CSS chung ảnh hưởng.

**Căn cứ:** Các script QA responsive trong `scripts/`; chi tiết ở LP12.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S04-TC001 | Một mẫu mỗi ngành ở ba khung | P1 | Môi trường chạy trình duyệt, route chụp mẫu (`lp-template-shot`). | 1. Chạy `qa-landing-page-catalog-responsive.cjs`. | Mỗi ngành × 3 khung không lỗi, không cuộn ngang. | Một phần: `scripts/qa-landing-page-catalog-responsive.cjs` kiểm: smoke 1 mẫu × 20 danh mục × 3 khung (không assert, chỉ đo/chụp). Thiếu: ngưỡng tự động báo FAIL | Chưa chạy |
| LP02-S04-TC002 | Kiểm toàn bộ 200 mẫu × 3 khung | P1 | Môi trường chụp ảnh đủ RAM. | 1. Chạy `qa-landing-page-global-visual.cjs` (có thể chia lô `LP_GLOBAL_BATCH`). | Không có mẫu tràn ngang, đủ form, không có câu thiết kế rò rỉ trong nội dung. | Một phần: `scripts/qa-landing-page-global-visual.cjs` kiểm: chụp toàn bộ 200 mẫu × 3 khung, có tờ tổng hợp ảnh (không assert). Thiếu: tự động đánh giá đạt/không đạt | Chưa chạy |
| LP02-S04-TC003 | Mẫu pilot Agency Portfolio được cách ly | P0 | Bản dựng web hiện tại. | 1. Chạy `qa-agency-portfolio-isolation.cjs`. | Giao diện mẫu pilot giữ nguyên, CSS dùng chung không tác động. | Đã có: `scripts/qa-agency-portfolio-isolation.cjs` kiểm: cách ly CSS của mẫu pilot (khoảng 4 dòng kiểm) | Chưa chạy |
| LP02-S04-TC004 | Khách hàng cũ không bị đổi giao diện | P0 | Trang cũ của khách tạo từ mẫu trước thay đổi. | 1. Mở trang cũ trước và sau khi triển khai CSS mới. | Không đổi bố cục, không thêm cuộn ngang. Đối chiếu ảnh chụp. | Chưa có | Chưa chạy |
| LP02-S04-TC005 | Nhóm agency, spa, lô 1 | P1 | Môi trường trình duyệt. | 1. Chạy `qa-landing-page-agency-responsive.cjs`, `qa-landing-page-spa-responsive.cjs`, `qa-landing-page-batch1-responsive.cjs`. | Không tràn ngang ở 1440/1024/768/390/375 px cho các nhóm tương ứng. Xem thêm LP12. | Một phần: `scripts/qa-landing-page-agency-responsive.cjs` kiểm: 10 mẫu agency × 5 khung (không assert). Thiếu: ngưỡng FAIL tự động | Chưa chạy |

## LP02-S05. Dùng mẫu để tạo trang (không đụng mẫu gốc)

**Mục tiêu:** Dùng mẫu tạo bản sao độc lập; mẫu gốc và trang khách cũ không đổi.

**Căn cứ:** `LandingPagesService.create` nhánh mẫu, `cloneLandingPageSpecWithNewIds`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S05-TC001 | Bấm Sử dụng mẫu | P0 | ORG-A-OWNER ở `/landing-pages/templates`. | 1. Bấm "Sử dụng mẫu" ở một mẫu, đặt tên.<br>2. Mở builder. | Tạo trang DRAFT mới có nội dung mẫu. Chuyển vào builder. Xem LP01-S04. | Chưa có | Chưa chạy |
| LP02-S05-TC002 | Sửa trang không đổi mẫu gốc | P0 | Trang vừa tạo. | 1. Sửa tiêu đề trang, chờ lưu.<br>2. Mở lại mẫu ở thư viện và xem chi tiết. | Mẫu giữ nguyên. Chỉ trang đổi. | Chưa có | Chưa chạy |
| LP02-S05-TC003 | Trang khách cũ không đổi khi mẫu được sửa (LP09) | P0 | Trang T tạo từ mẫu M hôm qua. SUPER_ADMIN sửa và xuất bản M. | 1. Mở T. | T giữ nội dung lúc tạo, không bị cập nhật theo M. | Chưa có | Chưa chạy |
| LP02-S05-TC004 | Mẫu nháp chưa xuất bản không tạo được | P1 | Mẫu DRAFT, ORG-A-OWNER. | 1. Tạo trang từ mẫu bằng API. | 404 "Template không tồn tại". | Chưa có | Chưa chạy |
| LP02-S05-TC005 | Hai trang cùng mẫu độc lập | P1 | Mẫu M. | 1. Tạo T1 và T2 từ M.<br>2. Sửa T1. | T2 không đổi, id block khác nhau. | Chưa có | Chưa chạy |
| LP02-S05-TC006 | Mẫu của tổ chức trùng slug với mẫu hệ thống (LP02-F4) | P2 | Tạo trực tiếp trong DB test một mẫu của ORG-A có cùng slug với mẫu hệ thống. | 1. ORG-A gọi `GET /templates` và `POST /landing-pages` với slug đó. | Ghi lại: cả hai xuất hiện; tạo trang lấy mẫu nào. Báo nếu quy tắc ưu tiên không rõ. | Chưa có | Chưa chạy |

## LP02-S06. Đồng bộ catalog khi đổi phiên bản và mẫu đã sửa tay

**Mục tiêu:** Mẫu admin đã sửa không bị ghi đè; mẫu thừa được dọn; không ghi hàng loạt khi không cần.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `ensureSystemTemplates`, `onModuleInit`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S06-TC001 | Mẫu có pack:managed không bị ghi đè (LP02-F2) | P0 | Mẫu M đã sửa qua LP09 (có tag `pack:managed`) và `definition` khác catalog. | 1. Tăng `LANDING_PAGE_TEMPLATE_CATALOG_VERSION` (môi trường test), khởi động lại API.<br>2. Đọc `definition` của M. | `definition` của M giữ nguyên bản đã sửa. Các mẫu không có tag được đồng bộ theo catalog. | Chưa có | Chưa chạy |
| LP02-S06-TC002 | Mẫu mồ côi không có tag bị xóa (LP02-F2) | P1 | Thêm trong DB test một mẫu hệ thống `zz-orphan` không có tag và không thuộc catalog. | 1. Khởi động lại API.<br>2. Tìm `zz-orphan`. | Mẫu `zz-orphan` bị xóa. Mẫu có `pack:managed` và không thuộc catalog (do upload hàng loạt) còn nguyên. | Chưa có | Chưa chạy |
| LP02-S06-TC003 | Slug trùng trong DB được khử | P2 | Thêm hai hàng hệ thống cùng slug (DB test). | 1. Khởi động lại API. | Giữ một hàng, xóa hàng còn lại, log có cảnh báo "LP templates deduped". | Chưa có | Chưa chạy |
| LP02-S06-TC004 | Lỗi đồng bộ không chặn khởi động | P2 | Giả lập lỗi DB khi khởi động. | 1. Khởi động API. | API vẫn khởi động, log cảnh báo "ensureSystemTemplates skipped". | Chưa có | Chưa chạy |
| LP02-S06-TC005 | Gọi danh sách khi chưa đồng bộ | P2 | Xóa trắng mẫu trong DB test. | 1. `GET /templates`. | Dịch vụ đồng bộ rồi trả danh sách, không trả rỗng. | Chưa có | Chưa chạy |

## LP02-S07. Phân quyền, tổ chức và phạm vi hiển thị

**Mục tiêu:** Đúng người thấy đúng mẫu.

**Căn cứ:** `isPlatformAdmin(user)`, điều kiện `publishStatus` và `publishedDefinition` trong `listTemplates`, `getTemplate`, `overview`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP02-S07-TC001 | Người thường không thấy mẫu nháp, SUPER_ADMIN thấy | P0 | Một mẫu DRAFT chưa xuất bản (tạo bằng LP09). Hai tài khoản. | 1. ORG-A-OWNER và SUPER_ADMIN gọi `GET /templates`. | Người thường không thấy mẫu nháp. SUPER_ADMIN thấy và có trường `publishStatus`, `hasPublishedVersion`. | Chưa có | Chưa chạy |
| LP02-S07-TC002 | Người chỉ xem có thể xem mẫu | P1 | Token ORG-A-VIEWER (`lead.read`). | 1. `GET /templates`, `GET /templates/<slug>`.<br>2. `POST /landing-pages` từ mẫu. | Hai lệnh đọc trả 200. Tạo trang trả 403 (cần `lead.write`). | Chưa có | Chưa chạy |
| LP02-S07-TC003 | Không có token | P0 | Không Authorization. | 1. `GET /landing-pages/templates`. | 401. Riêng `template-html` và `template-assets` công khai theo quy tắc ở S03. | Chưa có | Chưa chạy |
| LP02-S07-TC004 | Mẫu riêng của tổ chức không lộ cho tổ chức khác | P0 | Mẫu riêng của ORG-B. | 1. ORG-A gọi `GET /templates` và `GET /templates/<slug mẫu ORG-B>`. | ORG-A không thấy mẫu của ORG-B. Truy cập trực tiếp trả 404. | Chưa có | Chưa chạy |
| LP02-S07-TC005 | Đếm mẫu ở tổng quan | P2 | ORG-A-OWNER. | 1. `GET /landing-pages/overview` và đọc `templates`. | Số mẫu bằng số mẫu hệ thống đã xuất bản cộng mẫu riêng của tổ chức. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Đổi catalog hoặc `LANDING_PAGE_TEMPLATE_CATALOG_VERSION`: chạy S01, S06.
- Sửa `listTemplates`, `getTemplate` hoặc DTO truy vấn: chạy S02, S03, S07.
- Sửa CSS dùng chung hoặc renderer mẫu: chạy S04 và LP12.
- Sửa luồng tạo trang từ mẫu (LP01) hoặc sửa mẫu gốc (LP09): chạy S05.
- Trước khi phát hành catalog mới: chạy toàn bộ S01 và S04.
