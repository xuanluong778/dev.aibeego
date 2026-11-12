# LP01: Tạo landing page mới (từ mẫu, trang trống, AI, URL) - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP01-tao-trang-moi.md](../flows/LP01-tao-trang-moi.md). Mức ưu tiên flow: P1. Route giao diện: `/landing-pages/create`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** các cách tạo trang: trang trống, từ mẫu, bằng AI (gợi ý brief và sinh bản nháp), từ URL. Không gồm chỉnh sửa trong builder (LP03, LP04) và xuất bản (LP05).

**Căn cứ code:** API `apps/api/src/landing-pages/landing-pages.controller.ts` và `landing-pages.service.ts` (hàm `create`, `uniqueSlug`, `withIdempotency`, `suggestAiBrief`, `generateAi`, `crawlPublicUrl`); DTO `dto/landing-pages.dto.ts`; giao diện `apps/web/src/app/(app)/landing-pages/create/page.tsx`. Các thông báo lỗi, giới hạn tần suất và thời gian trong tài liệu được lấy nguyên từ code.

**Case liên quan ở flow khác:** F03 (phân quyền, tách tổ chức) cho LP01-S07-TC005 đến TC007; F06 (credit AI) cho LP01-S05-TC010; F13 (lead) không liên quan trực tiếp.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP01-F1 | Tạo trang bằng AI (`POST /landing-pages/generate`) không trừ credit. Hàm `generateAi` chỉ gọi AI và lưu, không gọi `CreditService`. Chỉ AI viết lại từng trường trong builder (`suggestInlineField`) trừ 2 credit. | apps/api/src/landing-pages/landing-pages.service.ts hàm `generateAi` (không có credit). Credit nằm ở `suggestInlineField` | Flow gốc ghi "còn credit nếu dùng AI" và case "hết credit khi tạo bằng AI". Cần xác nhận sản phẩm có định tính phí tạo bằng AI hay không. | LP01-S05-TC010 |
| LP01-F2 | Slug trùng trong cùng tổ chức không bị chặn. Hệ thống tự thêm hậu tố `-2` đến `-40`, rồi hậu tố ngẫu nhiên 8 ký tự. Slug còn được so với `subdomainSlug` của mọi tổ chức. | apps/api/src/landing-pages/landing-pages.service.ts hàm `uniqueSlug` | Flow gốc ghi "slug trùng" là trường hợp lỗi. Hành vi thực tế là tự đổi tên, không báo lỗi. Cần xác nhận đây là mong muốn. | LP01-S02-TC006, LP01-S02-TC008 |
| LP01-F3 | Chọn vừa trang trống vừa mẫu: API trả 400 "Chỉ chọn một nguồn bản nháp.". Trường hợp mẫu + `draftSpec` cũng cùng lỗi. | apps/api/src/landing-pages/landing-pages.service.ts hàm `create` (đầu hàm và nhánh `draftSpec`) | Khớp mong đợi của flow gốc ("API phải từ chối"). | LP01-S02-TC010, LP01-S02-TC011 |
| LP01-F4 | `name` chỉ kiểm `MinLength(1)` trước khi `trim()`. Tên toàn khoảng trắng qua được validation và tạo trang có `name` rỗng. Giao diện chặn bằng `disabled={!blankName.trim()}`. | `dto/landing-pages.dto.ts` `CreateLandingPageDto.name`; `apps/api/src/landing-pages/landing-pages.service.ts` hàm `create` dòng gán `name` | Cần xác nhận API có nên từ chối tên rỗng sau khi trim. | LP01-S02-TC005 |
| LP01-F5 | Khóa chống tạo trùng (`idempotencyKey`) lưu trong bộ nhớ tiến trình 15 phút (và Redis nếu có) theo `organizationId` + khóa. Trong 15 phút, gửi lại cùng khóa trả đúng trang cũ kể cả khi trang đó đã bị xóa. | apps/api/src/landing-pages/landing-pages.service.ts hằng `IDEMPOTENCY_TTL_MS`, hàm `withIdempotency` | Cần xác nhận hành vi trả lại trang đã xóa là chấp nhận được. | LP01-S03-TC001, LP01-S03-TC003 |
| LP01-F6 | Tạo từ URL qua `POST /landing-pages/crawl-url` có giới hạn 10 lần/phút/người dùng và 40 lần/phút/tổ chức, cache kết quả 10 phút theo URL. Thông báo lỗi của tầng tải URL (`ssrf-fetch`) chưa đọc nên không ghi nguyên văn. | apps/api/src/landing-pages/landing-pages.service.ts hàm `crawlPublicUrl` | Cần xác nhận thông báo lỗi hiển thị cho người dùng khi URL nội bộ bị chặn. | LP01-S06-TC004, LP01-S06-TC006 |
| LP01-F7 | Tạo từ mẫu chỉ cho mẫu đã xuất bản hoặc mẫu của tổ chức. Mẫu `DRAFT` chưa từng xuất bản trả 404 "Template không tồn tại" cho người thường, SUPER_ADMIN vẫn dùng được. | apps/api/src/landing-pages/landing-pages.service.ts hàm `create` nhánh `templateId/templateSlug` | Khớp thiết kế. Giao diện thư viện mẫu ẩn mẫu nháp (xem LP02). | LP01-S04-TC005, LP01-S04-TC006 |

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
| LP01-S01 | Tạo trang trống từ giao diện | 8 |
| LP01-S02 | API tạo trang: dữ liệu vào và slug | 12 |
| LP01-S03 | Chống tạo trùng (idempotency) | 5 |
| LP01-S04 | Tạo từ mẫu có sẵn | 9 |
| LP01-S05 | Tạo bằng AI và gợi ý brief | 14 |
| LP01-S06 | Tạo từ URL | 8 |
| LP01-S07 | Giữ dữ liệu form, hồ sơ doanh nghiệp, phân quyền và tách tổ chức | 8 |
| | **Tổng** | **64** |

## LP01-S01. Tạo trang trống từ giao diện

**Mục tiêu:** Người dùng có quyền tạo được trang trống, vào đúng builder, và dữ liệu khởi tạo đúng.

**Căn cứ:** Giao diện `apps/web/src/app/(app)/landing-pages/create/page.tsx` (hàm `createBlankDraft`, `body = { name: name.slice(0,120), mode: 'blank', idempotencyKey }`); API `LandingPagesService.create`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S01-TC001 | **[SMOKE-1]** Tạo trang trống thành công và vào builder | P0 | Đăng nhập ORG-A-OWNER. Mở `/landing-pages/create`. Tên trang: `SMOKE LP 20261111-01`. | 1. Chọn cách tạo trang trống (nút tạo trang trống).<br>2. Nhập tên `SMOKE LP 20261111-01`.<br>3. Bấm nút xác nhận tạo (`createBlankDraft`).<br>4. Ghi lại id trang trong URL. | Chuyển tới `/landing-pages/builder/<id>`, builder mở không lỗi 400 và không lỗi client. Canvas là trang trống (chỉ gồm khối mặc định của `createBlankLandingPageSpec`). Reload builder: tên trang và nội dung giữ nguyên. Trang xuất hiện trong `/landing-pages/pages` với trạng thái Nháp. | Một phần: `scripts/test-landing-page-blank-create.cjs` kiểm: tạo qua dịch vụ API biên dịch, không mạng (khoảng 21 dòng kiểm) và so sánh với các chế độ tạo khác. Thiếu: luồng giao diện thật, reload builder, hiển thị trong danh sách | Chưa chạy |
| LP01-S01-TC002 | Nút tạo bị khóa khi tên trống | P1 | Ở `/landing-pages/create`, chế độ trang trống. | 1. Để trống ô tên, quan sát nút tạo.<br>2. Nhập 3 khoảng trắng, quan sát nút.<br>3. Nhập `A`, quan sát nút. | Nút tạo bị vô hiệu với tên trống và tên toàn khoảng trắng. Có tên hợp lệ thì bấm được. Không có request `POST /landing-pages` khi nút bị khóa. | Chưa có | Chưa chạy |
| LP01-S01-TC003 | Tên dài đúng 120 ký tự được lưu nguyên | P2 | Tên gồm 120 ký tự `a`. | 1. Nhập tên 120 ký tự.<br>2. Tạo trang.<br>3. Mở danh sách trang và đọc tên. | Trang tạo thành công, tên lưu đủ 120 ký tự. | Chưa có | Chưa chạy |
| LP01-S01-TC004 | Tên dài hơn 120 ký tự bị cắt ở giao diện | P2 | Tên 130 ký tự. | 1. Nhập tên 130 ký tự vào ô tên.<br>2. Bấm tạo.<br>3. Đọc tên trang đã lưu. | Giao diện cắt `name.slice(0, 120)` trước khi gửi (đúng như `body` trong code tạo). Trang tạo thành công với 120 ký tự, không lỗi 400. | Chưa có | Chưa chạy |
| LP01-S01-TC005 | Tên có ký tự Unicode tiếng Việt và emoji | P2 | Tên `Spa Hoa Sen - Khuyến mãi 🎉`. | 1. Tạo trang trống với tên này.<br>2. Mở builder và danh sách trang. | Tên hiển thị đúng đủ dấu. Slug sinh ra khớp `^[a-z0-9-]+$` (không có dấu, không có emoji). Slug không rỗng. | Chưa có | Chưa chạy |
| LP01-S01-TC006 | Cấu trúc dữ liệu trang trống | P1 | Đã có trang từ LP01-S01-TC001. | 1. Gọi `GET {API}/landing-pages/<id>` với ORG-A-OWNER.<br>2. Đọc `status`, `slug`, `draftSpec.meta.clientRevision`, `publishedSpec`. | `status = DRAFT`, `slug` khác rỗng và khớp `^[a-z0-9-]+$`, `subdomainSlug = slug`, `robotsIndex = true`, không có `publishedSpec`, `organizationId` đúng tổ chức A. | Chưa có | Chưa chạy |
| LP01-S01-TC007 | Nhấp đúp nút tạo chỉ sinh một trang | P0 | Mở `/landing-pages/create`. Tên `DBLCLICK 20261111`. | 1. Nhập tên.<br>2. Nhấp đúp nhanh vào nút tạo (hai lần trong dưới 300 ms).<br>3. Mở `/landing-pages/pages`, tìm `DBLCLICK 20261111`. | Chỉ có đúng một trang tên này. Nút đã bị khóa trong lúc chờ (`busy`) hoặc request thứ hai dùng cùng khóa chống trùng và trả lại trang cũ. | Chưa có | Chưa chạy |
| LP01-S01-TC008 | Mất mạng khi tạo trang | P1 | Mở `/landing-pages/create`, chế độ trang trống, tên `OFFLINE 20261111`. | 1. Bật chế độ offline của trình duyệt.<br>2. Bấm tạo.<br>3. Tắt offline, bấm tạo lại. | Khi offline: hiện lỗi, không chuyển trang, nút bấm lại được. Sau khi có mạng: tạo thành công đúng một trang (dùng lại khóa chống trùng nếu request đầu đã tới server). | Chưa có | Chưa chạy |

## LP01-S02. API tạo trang: dữ liệu vào và slug

**Mục tiêu:** `POST /landing-pages` kiểm tra dữ liệu đúng và sinh slug duy nhất.

**Căn cứ:** `CreateLandingPageDto`, `LandingPagesService.create`, `uniqueSlug`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S02-TC001 | Tạo trang trống qua API | P0 | Token ORG-A-OWNER. | 1. `POST {API}/landing-pages` body `{"name":"API Blank 01","mode":"blank"}`. | Thành công, trả trang có `id`, `status = DRAFT`, `slug = api-blank-01`. | Một phần: `scripts/test-landing-page-blank-create.cjs` kiểm: chế độ blank qua service. Thiếu: gọi qua HTTP và guard quyền | Chưa chạy |
| LP01-S02-TC002 | Thiếu tên | P1 | Token ORG-A-OWNER. | 1. `POST {API}/landing-pages` body `{"mode":"blank"}`.<br>2. Thử `{"name":"","mode":"blank"}`. | Cả hai trả 400 do `name` là chuỗi có `MinLength(1)`. Không tạo bản ghi. | Chưa có | Chưa chạy |
| LP01-S02-TC003 | Tên 120 và 121 ký tự | P2 | Token ORG-A-OWNER. | 1. Gửi `name` 120 ký tự rồi 121 ký tự. | 120 ký tự: thành công. 121 ký tự: 400 vì `MaxLength(120)`. | Chưa có | Chưa chạy |
| LP01-S02-TC004 | Theme không hợp lệ | P2 | Token ORG-A-OWNER. | 1. Gửi `theme` lần lượt `MODERN`, `PREMIUM`, `MINIMAL`, `BOLD`, `CORPORATE`, `NEON`. | 5 giá trị đầu thành công và trang có theme tương ứng. `NEON` trả 400 do `IsIn`. | Chưa có | Chưa chạy |
| LP01-S02-TC005 | Tên toàn khoảng trắng qua API (LP01-F4) | P2 | Token ORG-A-OWNER. | 1. `POST {API}/landing-pages` body `{"name":"   ","mode":"blank"}`. | Ghi lại hành vi thực tế: theo code, validation cho qua và trang có `name` rỗng, slug dạng `lp-<mã>`. Nếu sản phẩm muốn từ chối thì đây là lỗi cần báo. | Chưa có | Chưa chạy |
| LP01-S02-TC006 | Trùng tên trong cùng tổ chức | P1 | Đã có trang `Dup Name`. | 1. Tạo trang thứ hai tên `Dup Name`.<br>2. Tạo trang thứ ba tên `Dup Name`.<br>3. Đọc slug của ba trang. | Cả hai lần đều thành công. Slug lần lượt `dup-name`, `dup-name-2`, `dup-name-3`. | Chưa có | Chưa chạy |
| LP01-S02-TC007 | Slug do người dùng đặt | P2 | Token ORG-A-OWNER. | 1. Gửi `slug = "Khuyen Mai 2026"` cùng `name = "X"`. | Slug được chuẩn hóa thành chuỗi chỉ gồm chữ thường, số, gạch ngang (không dấu, không khoảng trắng). | Chưa có | Chưa chạy |
| LP01-S02-TC008 | Slug đã dùng bởi tổ chức khác (subdomain) | P0 | ORG-A-OWNER đã có trang slug `shared-slug`. Token ORG-B-OWNER. | 1. ORG-B tạo trang với `slug = "shared-slug"`.<br>2. Đọc slug và subdomainSlug của trang ORG-B. | Tạo thành công nhưng slug của ORG-B là `shared-slug-2` (vì `subdomainSlug` của ORG-A đã chiếm). Hai tổ chức không có hai trang cùng slug công khai. | Chưa có | Chưa chạy |
| LP01-S02-TC009 | Slug quá 80 ký tự | P2 | Token ORG-A-OWNER. | 1. Gửi `slug` 81 ký tự. | 400 do `MaxLength(80)`. | Chưa có | Chưa chạy |
| LP01-S02-TC010 | Chọn vừa trang trống vừa mẫu | P1 | Biết một `templateSlug` hợp lệ. | 1. `POST` body `{"name":"X","mode":"blank","templateSlug":"<slug>"}`. | 400 "Chỉ chọn một nguồn bản nháp.". Không tạo trang. | Chưa có | Chưa chạy |
| LP01-S02-TC011 | Chọn vừa mẫu vừa draftSpec | P1 | Biết một `templateSlug` hợp lệ và một `draftSpec` hợp lệ. | 1. `POST` body có cả `templateSlug` và `draftSpec`. | 400 "Chỉ chọn một nguồn bản nháp.". | Chưa có | Chưa chạy |
| LP01-S02-TC012 | draftSpec không hợp lệ | P1 | Token ORG-A-OWNER. | 1. `POST` body `{"name":"X","draftSpec":{"blocks":"sai"}}`. | 400 với `code = INVALID_SPEC`, `message` liệt kê lỗi. Không tạo trang. | Chưa có | Chưa chạy |

## LP01-S03. Chống tạo trùng (idempotency)

**Mục tiêu:** Cùng khóa trong 15 phút thì chỉ có một trang.

**Căn cứ:** `withIdempotency`, `IDEMPOTENCY_TTL_MS = 15 phút`, khóa dạng `lp:create:<org>:<key>`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S03-TC001 | Hai request cùng khóa đồng thời | P0 | Token ORG-A-OWNER. Khóa `idem-20261111-a`. | 1. Gửi đồng thời 2 request `POST /landing-pages` cùng `idempotencyKey` và cùng body.<br>2. Đếm số trang tên đó. | Cả hai trả cùng một `id`. Chỉ có một bản ghi trang. | Chưa có | Chưa chạy |
| LP01-S03-TC002 | Khóa khác nhau thì tạo hai trang | P1 | Cùng tên trang. | 1. Gửi hai request tuần tự với `idempotencyKey` khác nhau. | Hai trang khác nhau (slug có hậu tố `-2`). | Chưa có | Chưa chạy |
| LP01-S03-TC003 | Cùng khóa sau khi xóa trang (LP01-F5) | P2 | Đã tạo trang bằng khóa `idem-20261111-c` rồi xóa trang đó. | 1. Trong vòng 15 phút, gửi lại cùng khóa.<br>2. Gọi `GET` trang theo id nhận được. | Ghi lại hành vi thực tế: theo code API trả lại đối tượng cũ từ cache, nhưng `GET` theo id trả 404 "Landing page không tồn tại". Nếu đúng như vậy cần xác nhận với sản phẩm. | Chưa có | Chưa chạy |
| LP01-S03-TC004 | Khóa theo tổ chức | P1 | Cùng khóa `idem-20261111-d` dùng bởi ORG-A và ORG-B. | 1. ORG-A tạo trang với khóa. ORG-B tạo trang với cùng khóa. | Hai tổ chức nhận hai trang khác nhau. ORG-B không nhận trang của ORG-A (khóa cache có `organizationId`). | Chưa có | Chưa chạy |
| LP01-S03-TC005 | Không gửi khóa | P2 | Token ORG-A-OWNER. | 1. Gửi hai request giống nhau không có `idempotencyKey`. | Tạo hai trang (slug hậu tố `-2`). Không có chống trùng khi không có khóa. | Chưa có | Chưa chạy |

## LP01-S04. Tạo từ mẫu có sẵn

**Mục tiêu:** Trang mới là bản sao độc lập của mẫu, không đụng mẫu gốc.

**Căn cứ:** `LandingPagesService.create` nhánh `templateId/templateSlug`, `cloneLandingPageSpecWithNewIds`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S04-TC001 | Tạo từ mẫu qua trang chọn mẫu | P0 | Đăng nhập ORG-A-OWNER. Catalog mẫu đã đồng bộ (xem LP02). | 1. Mở `/landing-pages/create`, chọn cách bắt đầu từ mẫu.<br>2. Chọn một mẫu đã xuất bản, đặt tên `FromTpl 20261111`.<br>3. Tạo trang và mở builder. | Builder mở với nội dung giống mẫu. Trang có `templateId` = id mẫu. ID các block khác ID trong mẫu (bản sao có id mới). | Một phần: `scripts/test-landing-page-create-template-picker.cjs` kiểm: giao diện thật với API giả (fixture), không ghi dữ liệu khách. Thiếu: tạo bản ghi thật và kiểm tra id block mới | Chưa chạy |
| LP01-S04-TC002 | Sửa trang không làm đổi mẫu gốc | P0 | Trang từ LP01-S04-TC001 và tài khoản SUPER_ADMIN xem được mẫu. | 1. Trong builder đổi tiêu đề hero thành `ĐÃ SỬA 20261111`, chờ lưu.<br>2. Gọi `GET {API}/landing-pages/templates/<slug>` và đọc tiêu đề hero. | Mẫu gốc vẫn giữ tiêu đề cũ. Chỉ trang của khách đổi. | Chưa có | Chưa chạy |
| LP01-S04-TC003 | Hai trang từ cùng một mẫu độc lập nhau | P1 | Mẫu `M`. | 1. Tạo trang T1 và T2 từ mẫu `M`.<br>2. Sửa T1.<br>3. Mở T2. | T2 không đổi. Không có block dùng chung id giữa T1 và T2. | Chưa có | Chưa chạy |
| LP01-S04-TC004 | Mẫu không tồn tại | P1 | Token ORG-A-OWNER. | 1. `POST` body `{"name":"X","templateSlug":"khong-co-mau-nay"}`. | 404 "Template không tồn tại". Không tạo trang. | Chưa có | Chưa chạy |
| LP01-S04-TC005 | Mẫu nháp chưa xuất bản với người thường (LP01-F7) | P1 | Có mẫu hệ thống ở trạng thái DRAFT và chưa từng xuất bản. Token ORG-A-OWNER (không phải SUPER_ADMIN). | 1. `POST` tạo trang với `templateSlug` của mẫu đó. | 404 "Template không tồn tại". | Chưa có | Chưa chạy |
| LP01-S04-TC006 | Mẫu nháp với SUPER_ADMIN | P2 | Như trên nhưng token SUPER_ADMIN. | 1. `POST` tạo trang với `templateSlug` mẫu nháp. | Thành công, dùng bản `definition` (bản nháp) của mẫu. | Chưa có | Chưa chạy |
| LP01-S04-TC007 | Mẫu của tổ chức khác | P0 | Mẫu riêng của ORG-B (nếu có, `organizationId = B`). | 1. Token ORG-A-OWNER tạo trang với `templateId` của mẫu ORG-B. | 404 "Template không tồn tại". Không rò rỉ nội dung mẫu của tổ chức khác. | Chưa có | Chưa chạy |
| LP01-S04-TC008 | Tạo từ mẫu bằng id thay vì slug | P2 | Id của một mẫu hệ thống. | 1. `POST` với `templateId`. | Thành công, kết quả giống tạo bằng slug. | Chưa có | Chưa chạy |
| LP01-S04-TC009 | Mẫu có import HTML | P2 | Một mẫu có `meta.htmlConverted` (mẫu từ HTML). | 1. Tạo trang từ mẫu này.<br>2. Mở builder. | Trang có các section chỉnh sửa được (hàm `editableCopyFromImportedHtml`), không phải một khối HTML nguyên bản không sửa được. | Chưa có | Chưa chạy |

## LP01-S05. Tạo bằng AI và gợi ý brief

**Mục tiêu:** Gợi ý brief và sinh bản nháp AI hoạt động, an toàn khi lỗi, đúng giới hạn tần suất.

**Căn cứ:** `LandingPagesService.suggestAiBrief`, `generateAi`, `LandingPageAiService`. Case dùng AI thật chỉ chạy khi chủ động, vì tốn tiền và kết quả không cố định.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S05-TC001 | Gợi ý brief thành công | P1 | Token ORG-A-OWNER. Khóa `brief-20261111-1`. | 1. `POST {API}/landing-pages/ai-suggest-brief` body `{"field":"targetCustomer","businessType":"spa","productService":"Chăm sóc da","idempotencyKey":"brief-20261111-1"}`. | Thành công, trả gợi ý cho trường `targetCustomer`. Gợi ý bằng tiếng Việt. | Một phần: `scripts/test-landing-page-ai-brief-suggest.ts` kiểm: chuẩn hóa đầu vào và định dạng gợi ý (khoảng 22 dòng kiểm). Thiếu: gọi qua HTTP và AI thật | Chưa chạy |
| LP01-S05-TC002 | Thiếu ngành và sản phẩm | P1 | Token ORG-A-OWNER. | 1. Gửi `field` và `idempotencyKey` nhưng không có `businessType` và `productService`. | 400 "Nhập ngành hoặc sản phẩm / dịch vụ trước khi lấy gợi ý.". | Chưa có | Chưa chạy |
| LP01-S05-TC003 | Thiếu khóa yêu cầu | P2 | Token ORG-A-OWNER. | 1. Gửi thiếu `idempotencyKey`. | 400 do validation (`idempotencyKey` bắt buộc, `MinLength(1)`). | Chưa có | Chưa chạy |
| LP01-S05-TC004 | Trường field không hợp lệ | P2 | Token ORG-A-OWNER. | 1. Gửi `field = "abc"`. | 400 do `IsIn(['targetCustomer','painPoint','uspBenefits'])`. | Chưa có | Chưa chạy |
| LP01-S05-TC005 | Giới hạn gợi ý 12 lần mỗi phút | P2 | Token ORG-A-OWNER, khóa khác nhau mỗi lần. | 1. Gửi 13 yêu cầu gợi ý trong 1 phút. | Yêu cầu thứ 13 báo "Bạn đang lấy gợi ý quá nhanh. Vui lòng thử lại sau một phút.". Chạy riêng để không ảnh hưởng case khác. | Chưa có | Chưa chạy |
| LP01-S05-TC006 | Sinh bản nháp AI hợp lệ | P1 | Token ORG-A-OWNER. Khóa `gen-20261111-1`. | 1. `POST {API}/landing-pages/generate` với `productService`, `targetCustomer`, `pageGoal = lead`, `idempotencyKey`. | Thành công. Trả `draftSpec` hợp lệ (qua `validateLandingPageSpec`), `templateSelection` và `normalizedBrief`. Chưa tạo trang nếu không có `landingPageId`. | Một phần: `scripts/test-landing-page-ai-generation.ts` kiểm: cấu trúc kết quả và kiểm tra hợp lệ (khoảng 64 dòng kiểm). Thiếu: gọi API thật, khả năng chọn mẫu theo ngành | Chưa chạy |
| LP01-S05-TC007 | Thiếu sản phẩm hoặc khách hàng mục tiêu | P1 | Token ORG-A-OWNER. | 1. Gửi thiếu `productService`.<br>2. Gửi thiếu `targetCustomer`. | Cả hai trả 400 (hai trường bắt buộc, `MinLength(1)`). | Chưa có | Chưa chạy |
| LP01-S05-TC008 | Giá trị vượt giới hạn trường | P2 | Token ORG-A-OWNER. | 1. Gửi `productService` 201 ký tự.<br>2. Gửi `targetCustomer` 401 ký tự.<br>3. Gửi `tone = "angry"`. | Cả ba trả 400. | Chưa có | Chưa chạy |
| LP01-S05-TC009 | Lưu bản AI thành trang (xác nhận xem trước) | P0 | Đã có `draftSpec` từ LP01-S05-TC006. | 1. Từ giao diện tạo AI, bấm xác nhận để lưu.<br>2. Hoặc `POST /landing-pages` với `draftSpec` và `idempotencyKey = lp-ai-draft-<aiGenerationId>`. | Tạo một trang DRAFT với nội dung AI. Gọi lại cùng `aiGenerationId` thì trả trang cũ, không tạo trang thứ hai. | Một phần: `scripts/test-landing-page-create-ai-first.cjs` kiểm: chuẩn hóa và tương thích ngược của dữ liệu AI (khoảng 25 dòng kiểm). Thiếu: lưu trang thật và chống tạo trùng theo `aiGenerationId` | Chưa chạy |
| LP01-S05-TC010 | Không trừ credit khi sinh bằng AI (LP01-F1) | P1 | Ghi lại số dư credit tổ chức A. | 1. Sinh bản nháp AI một lần.<br>2. So sánh số dư credit trước và sau. | Theo code: số dư không đổi. Nếu sản phẩm muốn tính phí thì đây là chênh lệch cần báo. | Chưa có | Chưa chạy |
| LP01-S05-TC011 | AI lỗi vẫn có bản nháp dự phòng | P1 | Giả lập nhà cung cấp AI lỗi (khóa API sai hoặc chặn mạng ra ngoài). | 1. Sinh bản nháp AI. | Vẫn trả bản nháp hợp lệ kèm `warning`. Không trả 500. | Một phần: `scripts/test-landing-page-create-ai-first.cjs` kiểm: "URL fail still produces usable brief/fallback". Thiếu: lỗi nhà cung cấp AI | Chưa chạy |
| LP01-S05-TC012 | Áp bản AI lên trang có sẵn không ghi đè nội dung người dùng | P1 | Trang có tiêu đề do người dùng sửa. | 1. Sinh AI với `landingPageId` của trang đó. | Phần người dùng đã sửa được giữ (`protectLandingPageAiUserContent`). Trang được lưu với bản AI cho phần còn lại. | Một phần: `scripts/test-landing-page-business-profile.cjs` kiểm: "AI regenerate preserves user fields". Thiếu: gọi qua API sinh với `landingPageId` | Chưa chạy |
| LP01-S05-TC013 | Trang đổi trong lúc AI chạy | P2 | Trang T. Làm chậm AI hoặc sửa T ngay sau khi gửi. | 1. Gửi sinh AI với `landingPageId = T`.<br>2. Trước khi AI trả, sửa T ở tab khác và lưu. | 409 "Trang đã thay đổi trong khi AI chạy. Nội dung mới của bạn được giữ nguyên; hãy tải lại trước khi thử lại.". Nội dung người dùng không bị ghi đè. | Chưa có | Chưa chạy |
| LP01-S05-TC014 | Sinh AI trên trang đã lưu trữ | P2 | Trang ở trạng thái ARCHIVED. | 1. Sinh AI với `landingPageId` của trang này. | 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |

## LP01-S06. Tạo từ URL

**Mục tiêu:** Phân tích URL an toàn (chặn mạng nội bộ), có giới hạn tần suất và cache.

**Căn cứ:** `crawlPublicUrl`, `fetchPublicHtmlSafe`, giao diện `create/page.tsx` (`crawling`, nút "Phân tích URL").

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S06-TC001 | Phân tích URL công khai | P1 | Token ORG-A-OWNER. URL `https://example.com`. | 1. `POST {API}/landing-pages/crawl-url` body `{"url":"https://example.com"}`. | Thành công, trả `summary` (tiêu đề, văn bản tóm tắt) và `cached = false`. | Một phần: `scripts/test-landing-page-url-doctor.cjs` kiểm: tách tóm tắt từ HTML, các tình huống SSRF (khoảng 31 dòng kiểm). Thiếu: tải URL thật | Chưa chạy |
| LP01-S06-TC002 | Gọi lại cùng URL trong 10 phút | P2 | Sau LP01-S06-TC001. | 1. Gửi lại cùng URL (khác chữ hoa thường cũng được). | Trả `cached = true`, không tải lại website. | Chưa có | Chưa chạy |
| LP01-S06-TC003 | URL quá ngắn hoặc quá dài | P2 | Token ORG-A-OWNER. | 1. Gửi `url = "http://a"` (dưới 8 ký tự).<br>2. Gửi URL 2001 ký tự. | Cả hai trả 400 do `MinLength(8)` và `MaxLength(2000)`. | Chưa có | Chưa chạy |
| LP01-S06-TC004 | Chặn địa chỉ nội bộ (SSRF) | P0 | Token ORG-A-OWNER. | 1. Gửi `http://localhost`, `http://127.0.0.1`, `http://10.0.0.1`, `http://169.254.169.254/latest/meta-data`, `ftp://example.com`. | Mỗi lần trả 400 với `code = SSRF_BLOCKED` (hoặc mã tương ứng của thư viện). Không có request nào ra mạng nội bộ. | Một phần: `scripts/test-landing-page-url-doctor.cjs` kiểm: nhóm "SECURITY / SSRF". Thiếu: gọi qua endpoint HTTP, kiểm mã `SSRF_BLOCKED` đầu cuối | Chưa chạy |
| LP01-S06-TC005 | URL không tải được hoặc quá lớn | P2 | Một URL trả 404, một URL trả trên 1 MB. | 1. Phân tích từng URL. | Báo lỗi có `code` và `message`, không treo. Giới hạn tải: 12 giây và 1.000.000 byte. | Chưa có | Chưa chạy |
| LP01-S06-TC006 | Giới hạn 10 lần mỗi phút | P2 | Token ORG-A-OWNER. | 1. Gửi 11 yêu cầu phân tích với 11 URL khác nhau trong 1 phút. | Yêu cầu thứ 11 báo "Quá nhiều lần phân tích URL — thử lại sau". Chạy riêng. | Chưa có | Chưa chạy |
| LP01-S06-TC007 | Giao diện Phân tích URL | P1 | Ở `/landing-pages/create`. | 1. Nhập `abc` vào ô URL, quan sát nút.<br>2. Nhập `https://example.com`, bấm Phân tích URL.<br>3. Quan sát nút trong lúc chờ. | Nút "Phân tích URL" bị khóa khi URL không bắt đầu bằng `http://` hoặc `https://`. Khi chạy, nhãn là "Đang đọc website…" và các nút khác bị khóa. Kết quả điền vào form để người dùng rà soát trước khi tạo. | Chưa có | Chưa chạy |
| LP01-S06-TC008 | URL lỗi vẫn tạo được bản nháp từ form | P1 | Điền form brief hợp lệ và một URL không đọc được. | 1. Bấm sinh bản nháp. | Có bản nháp dựa trên form, kèm cảnh báo "Không đọc được website tham khảo. Bản nháp sử dụng thông tin trong biểu mẫu.". | Một phần: `scripts/test-landing-page-create-ai-first.cjs` kiểm: "URL fail still produces usable brief/fallback". Thiếu: thông báo hiển thị trên giao diện | Chưa chạy |

## LP01-S07. Giữ dữ liệu form, hồ sơ doanh nghiệp, phân quyền và tách tổ chức

**Mục tiêu:** Không mất dữ liệu đã nhập; không ai tạo trang thay tổ chức khác; người chỉ xem không tạo được.

**Căn cứ:** `LandingPagesController` guard `JwtAuthGuard, TenantGuard, PermissionsGuard` và `@RequirePermissions('lead.write')`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP01-S07-TC001 | Điền form tạo rồi tải lại trang | P1 | Ở `/landing-pages/create`, chế độ AI. | 1. Nhập sản phẩm, khách hàng, USP, URL.<br>2. Reload trình duyệt.<br>3. Mở lại `/landing-pages/create`. | Dữ liệu đã nhập vẫn còn (lưu theo `storageKey` trong localStorage). Có nút đặt lại (`resetSetup`) để xóa. | Đã có: `scripts/test-landing-page-create-persistence-browser.ts` kiểm: giữ dữ liệu sau reload; thao tác chính mở lại thiết kế đã lưu mà không gọi AI lần nữa; xóa trường không bị hồ sơ/URL điền lại | Chưa chạy |
| LP01-S07-TC002 | LocalStorage bị chặn | P2 | Trình duyệt chặn lưu trữ (chế độ riêng tư nghiêm ngặt). | 1. Mở `/landing-pages/create` và điền form. | Trang vẫn hoạt động, chỉ không giữ dữ liệu sau reload. Không văng lỗi trắng trang. | Chưa có | Chưa chạy |
| LP01-S07-TC003 | Nhãn danh mục tiếng Việt | P2 | Mở `/landing-pages/create` hoặc thư viện mẫu. | 1. Mở danh sách danh mục/ngành.<br>2. Đọc nhãn hiển thị và giá trị lọc gửi đi. | Nhãn là tiếng Việt đúng, giá trị gửi lên API là mã danh mục (wire value) không đổi. | Đã có: `scripts/qa-landing-page-category-labels-browser.cjs` kiểm: nhãn hiển thị và giá trị lọc, API được chặn, không ghi dữ liệu | Chưa chạy |
| LP01-S07-TC004 | Dùng hồ sơ doanh nghiệp để điền form | P1 | Tổ chức A có Business Profile đủ thông tin. | 1. Ở bước AI, bấm dùng hồ sơ doanh nghiệp.<br>2. Quan sát các ô. | Điền đúng sản phẩm/dịch vụ, khách hàng, USP, liên hệ từ hồ sơ. Nút dùng hồ sơ bị khóa khi hồ sơ trống (`bizProfile.isEmpty`). | Một phần: `scripts/test-landing-page-business-profile.cjs` kiểm: áp hồ sơ vào bản nháp, không ghi đè nội dung người dùng khi không ép (khoảng 35 dòng kiểm). Thiếu: nút giao diện ở trang tạo | Chưa chạy |
| LP01-S07-TC005 | Người chỉ có quyền đọc không tạo được | P0 | Token ORG-A-VIEWER (chỉ `lead.read`). | 1. `POST {API}/landing-pages` body hợp lệ.<br>2. `POST /landing-pages/generate`.<br>3. `POST /landing-pages/crawl-url`. | Cả ba trả 403. Không tạo bản ghi. Xem thêm F03. | Chưa có | Chưa chạy |
| LP01-S07-TC006 | Không có token | P0 | Không gửi Authorization. | 1. `POST {API}/landing-pages`. | 401. | Chưa có | Chưa chạy |
| LP01-S07-TC007 | Trang tạo thuộc đúng tổ chức | P0 | Token ORG-A-OWNER, sau đó ORG-B-OWNER. | 1. ORG-A tạo trang P.<br>2. ORG-B gọi `GET {API}/landing-pages/<id của P>`.<br>3. ORG-B gọi `GET {API}/landing-pages` và tìm P. | ORG-B nhận 404 "Landing page không tồn tại" và không thấy P trong danh sách. Xem F03. | Chưa có | Chưa chạy |
| LP01-S07-TC008 | Người dùng chưa đăng nhập vào trang tạo | P1 | Trình duyệt chưa đăng nhập. | 1. Mở `/landing-pages/create`. | Chuyển về trang đăng nhập (kỳ vọng theo layout `(app)`), không hiện form tạo. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `LandingPagesService.create`, `uniqueSlug`, `withIdempotency` hoặc DTO tạo: chạy S01, S02, S03, S04 và S07.
- Sửa luồng AI (`generateAi`, `LandingPageAiService`, `suggestAiBrief`): chạy S05 và S06.
- Sửa trang `create/page.tsx` hoặc mô-đun lưu localStorage: chạy S01, S06, S07.
- Sửa catalog hoặc trạng thái xuất bản mẫu (LP02, LP09): chạy S04.
- Case SMOKE-1 (LP01-S01-TC001) chạy sau mọi lần phát hành vì các smoke còn lại dùng trang do case này tạo.
