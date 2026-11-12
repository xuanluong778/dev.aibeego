# LP09: Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt) - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP09-admin-quan-ly-templates.md](../flows/LP09-admin-quan-ly-templates.md). Mức ưu tiên flow: P1. Route giao diện: `/landing-pages/manage-templates`, `/landing-pages/templates`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** các chức năng của SUPER_ADMIN trên mẫu hệ thống: chế độ 2 sửa trực tiếp mẫu gốc (phiên sửa mẫu), tải một mẫu và tất cả, upload một mẫu và hàng loạt, xuất bản, lịch sử và khôi phục. Chế độ 1 (tạo trang từ mẫu không đụng mẫu gốc) nằm ở LP01-S04 và LP02-S05.

**Căn cứ code:** `apps/api/src/landing-pages/landing-page-template-pack.service.ts` (`openEditSession`, `saveFromSession`, `exportPack`, `exportAll`, `importBulk`, `importNew`, `importUpdate`, `publish`, `listVersions`, `restore`), `apps/api/src/landing-pages/template-pack.ts`, `apps/api/src/landing-pages/template-pack-bulk.ts`, `apps/api/src/landing-pages/landing-pages.controller.ts` (route dùng `PlatformAdminGuard`), `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx`, `apps/web/src/components/landing-pages/landing-page-builder.tsx` (thanh "Đang sửa MẪU GỐC"). Có sự chồng lấn với phần upload hàng loạt do phiên làm việc khác bổ sung, được ghi ở LP09-F5 và LP09-F6.

**Case liên quan ở flow khác:** LP02 (thư viện mẫu, đồng bộ catalog); LP01-S04 (tạo từ mẫu); LP05-S05-TC014 (xuất bản trang làm việc); LP08-S05 (trang làm việc bị ẩn); F03 (phân quyền) cho S01.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP09-F1 | `scripts/test-platform-admin-rbac.ts` kiểm các route quản trị nền tảng `/api/v1/admin/*`, **không** kiểm các route mẫu admin của Landing Page (`/landing-pages/templates/...`). Bước 1 của flow gốc ("người không phải SUPER_ADMIN gọi endpoint mẫu admin bị chặn") hiện chưa có test tự động. | `scripts/test-platform-admin-rbac.ts` (đầu tệp); `apps/api/src/landing-pages/landing-pages.controller.ts` các route dùng `PlatformAdminGuard` | Cần bổ sung test phân quyền cho nhóm route mẫu admin. | LP09-S01-TC001, LP09-S01-TC002 |
| LP09-F2 | Phiên sửa mẫu dùng **một trang làm việc cho mỗi mẫu trong mỗi tổ chức** (slug `tpl-edit-<slug-mẫu>`). Hai SUPER_ADMIN cùng thuộc một tổ chức cùng sửa một trang làm việc; hai admin ở tổ chức khác nhau có hai trang riêng. Mở lại phiên (không `reset`) giữ nguyên bản nháp cũ **dù mẫu đã thay đổi** (ví dụ do upload) trong lúc đó. | `apps/api/src/landing-pages/landing-page-template-pack.service.ts` hàm `openEditSession` (nhánh `existing`, tham số `reset`) | Cần xác nhận hành vi: hiện không có cảnh báo khi bản nháp làm việc lệch với mẫu hiện tại. Giao diện hiện không truyền `reset`. | LP09-S02-TC003, LP09-S02-TC004, LP09-S02-TC015 |
| LP09-F3 | Nút "Thoát" của thanh "Đang sửa MẪU GỐC" chỉ điều hướng tới `/landing-pages/templates`. Không có bước hỏi lưu vào mẫu. Thay đổi đã autosave nằm ở trang làm việc nhưng **chưa vào mẫu gốc** cho tới khi bấm "Lưu vào mẫu". | `apps/web/src/components/landing-pages/landing-page-builder.tsx` (nút Thoát: `router.push('/landing-pages/templates')`) | Cần xác nhận mong muốn (cảnh báo khi còn thay đổi chưa lưu vào mẫu). | LP09-S02-TC009 |
| LP09-F4 | `saveFromSession` ghi `definition` (bản nháp) và gắn tag `pack:managed`; **không** cập nhật `thumbnailUrl` khi chỉ lưu nháp. Ảnh đại diện chỉ được tính lại khi xuất bản (`publish`). Ảnh đại diện trong thư viện có thể cũ so với nội dung. | `apps/api/src/landing-pages/landing-page-template-pack.service.ts` hàm `saveFromSession`, `publish` (`thumbFromSpec`) | Cần xác nhận. Ảnh xem trước và ảnh thu nhỏ của mẫu vẫn là ảnh cũ nếu không có bước tạo lại (đã ghi nhận là việc còn tồn đọng). | LP09-S02-TC007 |
| LP09-F5 | Giới hạn upload hàng loạt hiện tại trong code: tối đa 300 tệp mỗi lần, mỗi tệp tối đa 256 MB (`TEMPLATE_BULK_MAX_ZIP_BYTES`), ZIP tổng tối đa 16.000 tệp bên trong và 400 MB sau giải nén, tối đa 300 mẫu sau khi gộp trùng; ZIP đơn một mẫu tối đa 20 MB, 40 tệp, 40 MB giải nén, ảnh 8 MB. Nginx có thể có giới hạn thấp hơn (`client_max_body_size`) nên cần đo ở tầng nginx. | `apps/api/src/landing-pages/template-pack.ts` (các hằng `TEMPLATE_*`), `apps/api/src/landing-pages/template-pack-bulk.ts`, `apps/api/src/landing-pages/landing-page-template-pack.service.ts` hàm `importBulk`, `apps/api/src/landing-pages/landing-pages.controller.ts` `FilesInterceptor` | Cần xác nhận giá trị `client_max_body_size` của vhost trên production. Thiết lập chung trước đây là 100m, thấp hơn tệp tổng 191 MB đã được test. | LP09-S05-TC008, LP09-S05-TC009 |
| LP09-F6 | Cách gộp trùng và chọn nguồn khi upload hàng loạt có thêm cấu hình môi trường `LP_TEMPLATE_BULK_PREFERRED_SOURCES` (JSON ánh xạ slug sang tên tệp nguồn ưu tiên). Giá trị sai báo "Cấu hình chọn bản template không hợp lệ". Logic này do phiên làm việc khác bổ sung và tài liệu của nó nằm ở `docs/landing-page-template-bulk-*`. | `apps/api/src/landing-pages/template-pack-bulk.ts` hàm `parseTemplateBulkPreferences`, `deduplicateTemplateBulkFiles` | Cần xác nhận chính sách ưu tiên nguồn mong muốn với chủ sản phẩm. | LP09-S05-TC004, LP09-S05-TC005 |
| LP09-F7 | Khôi phục phiên bản mẫu (`restore`) ghi lại `definition` và chuyển trạng thái mẫu về nháp (theo flow gốc). `restore` không kiểm tra mẫu còn bản đã xuất bản hay không: người dùng vẫn thấy `publishedDefinition` cũ cho tới khi xuất bản lại. | `apps/api/src/landing-pages/landing-page-template-pack.service.ts` hàm `restore` | Cần xác nhận mong muốn: khôi phục có nên tự đưa bản khôi phục cho người dùng hay chỉ về nháp. | LP09-S06-TC003 |

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
| LP09-S01 | Phân quyền quản trị mẫu | 6 |
| LP09-S02 | Chế độ 2: sửa trực tiếp mẫu gốc (phiên sửa mẫu) | 15 |
| LP09-S03 | Cách ly trang làm việc khỏi người dùng | 6 |
| LP09-S04 | Tải mẫu (một mẫu và tất cả) | 8 |
| LP09-S05 | Upload mẫu (một mẫu và hàng loạt) | 19 |
| LP09-S06 | Xuất bản mẫu, lịch sử và khôi phục | 7 |
| LP09-S07 | Giao diện trang Quản lý Templates | 6 |
| | **Tổng** | **67** |

## LP09-S01. Phân quyền quản trị mẫu

**Mục tiêu:** Chỉ SUPER_ADMIN dùng được các chức năng mẫu admin; không lộ cho người khác.

**Căn cứ:** `PlatformAdminGuard` trong `apps/api/src/landing-pages/landing-pages.controller.ts`, `assertAdmin` trong `apps/api/src/landing-pages/landing-page-template-pack.service.ts`, `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx` (biến `isAdmin = user?.role === 'SUPER_ADMIN'`).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S01-TC001 | Chủ tổ chức bị chặn ở mọi route mẫu admin | P0 | Token ORG-A-OWNER (không phải SUPER_ADMIN). Một mẫu `M`. | 1. Gọi lần lượt: `GET /landing-pages/templates/packs/export-all`, `POST /templates/packs/bulk`, `POST /templates/packs`, `GET /templates/M/pack`, `POST /templates/M/pack`, `POST /templates/M/edit-session`, `POST /templates/M/save-from-session`, `POST /templates/M/publish`, `GET /templates/M/versions`, `POST /templates/M/versions/1/restore`. | Cả 10 lệnh bị từ chối (403) bởi `PlatformAdminGuard`. Không có thay đổi dữ liệu, không tạo trang `tpl-edit-*`. (Tầng dịch vụ cũng có kiểm tra thứ hai: "Chỉ quản trị hệ thống mới được tải hoặc cập nhật mẫu.") | Một phần: `scripts/test-landing-page-template-bulk-upload.cjs` kiểm: dịch vụ `importBulk` từ chối vai trò OWNER bằng thông báo chứa "quản trị". Thiếu: 10 route HTTP qua `PlatformAdminGuard` | Chưa chạy |
| LP09-S01-TC002 | Người chỉ xem bị chặn | P0 | Token ORG-A-VIEWER. | 1. Gọi `GET /templates/M/versions` và `GET /templates/packs/export-all`. | 403. Quyền `lead.read` không đủ để vào route admin. | Chưa có | Chưa chạy |
| LP09-S01-TC003 | Không có token | P0 | Không Authorization. | 1. Gọi `GET /templates/packs/export-all`. | 401. | Chưa có | Chưa chạy |
| LP09-S01-TC004 | SUPER_ADMIN thuộc tổ chức nào cũng dùng được | P1 | Token SUPER_ADMIN. | 1. Gọi `GET /templates/M/versions`. | 200. Vai trò xác định theo `role` hoặc `platformRole` là `SUPER_ADMIN`. | Chưa có | Chưa chạy |
| LP09-S01-TC005 | Menu Quản lý Templates chỉ hiện cho SUPER_ADMIN | P0 | Hai tài khoản: ORG-A-OWNER và SUPER_ADMIN. | 1. Đăng nhập từng tài khoản, xem thanh bên nhóm Landing Page.<br>2. ORG-A-OWNER mở trực tiếp `/landing-pages/manage-templates`. | SUPER_ADMIN thấy mục "Quản lý Templates". ORG-A-OWNER không thấy mục này, mở trực tiếp thấy "Chỉ quản trị hệ thống mới dùng được trang này.", không có nút nào gọi API. | Chưa có | Chưa chạy |
| LP09-S01-TC006 | Nút Sửa mẫu gốc chỉ hiện cho SUPER_ADMIN | P0 | Như trên. | 1. Mở `/landing-pages/templates` bằng hai tài khoản. | Chỉ SUPER_ADMIN có nút "Sửa mẫu gốc" trên thẻ mẫu và thấy cả mẫu nháp. | Chưa có | Chưa chạy |

## LP09-S02. Chế độ 2: sửa trực tiếp mẫu gốc (phiên sửa mẫu)

**Mục tiêu:** Admin sửa mẫu trong builder, chỉ vào mẫu khi bấm lưu, và người dùng chỉ thấy khi xuất bản.

**Căn cứ:** `openEditSession`, `saveFromSession` trong `apps/api/src/landing-pages/landing-page-template-pack.service.ts`; thanh trạng thái và `saveToTemplate` trong `apps/web/src/components/landing-pages/landing-page-builder.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S02-TC001 | Mở phiên sửa mẫu lần đầu | P0 | SUPER_ADMIN, mẫu thử `zz-test-tpl` đã xuất bản (tạo bằng upload). | 1. Ở `/landing-pages/templates` bấm "Sửa mẫu gốc" ở `zz-test-tpl`.<br>2. Quan sát builder. | Mở builder của trang làm việc `[Sửa mẫu] <tên mẫu>` có slug `tpl-edit-zz-test-tpl`, nội dung là bản nháp của mẫu. Có thanh màu hổ phách "Đang sửa MẪU GỐC: zz-test-tpl" với các nút "Lưu vào mẫu", "Lưu & xuất bản mẫu", "Thoát". `robotsIndex = false`. | Chưa có | Chưa chạy |
| LP09-S02-TC002 | API edit-session trả đủ thông tin | P1 | Token SUPER_ADMIN. | 1. `POST /landing-pages/templates/zz-test-tpl/edit-session` body `{}`. | Trả `{pageId, slug, name, reused:false}` lần đầu. | Chưa có | Chưa chạy |
| LP09-S02-TC003 | Mở lại phiên dùng lại cùng trang (LP09-F2) | P0 | Đã có phiên của TC001. | 1. Gọi `edit-session` lần hai, và lần ba.<br>2. So `pageId`. | `pageId` giống nhau, `reused: true`. Không tạo thêm trang làm việc. | Chưa có | Chưa chạy |
| LP09-S02-TC004 | Mở lại phiên giữ bản nháp cũ dù mẫu đã đổi (LP09-F2) | P1 | Phiên đã mở và sửa dở. Sau đó mẫu được upload bản mới (S04). | 1. Mở lại phiên (không `reset`).<br>2. Đối chiếu nội dung với mẫu hiện tại. | Theo code: vẫn là bản nháp cũ của phiên. Ghi lại để xác nhận. | Chưa có | Chưa chạy |
| LP09-S02-TC005 | Đặt lại phiên về mẫu hiện tại | P2 | Phiên có nháp cũ. | 1. `POST /templates/zz-test-tpl/edit-session` body `{"reset":true}`. | Nháp làm việc được ghi đè bằng `definition` hiện tại của mẫu, `reused: false`. | Chưa có | Chưa chạy |
| LP09-S02-TC006 | Lưu vào mẫu (bản nháp) | P0 | Trong phiên, đổi tiêu đề hero thành `ĐÃ SỬA MẪU 20261111`, chờ "Đã lưu". | 1. Bấm "Lưu vào mẫu".<br>2. Đọc thông báo.<br>3. `GET /templates/zz-test-tpl` bằng SUPER_ADMIN.<br>4. `GET` cùng mẫu bằng ORG-A-OWNER. | Thông báo "Đã lưu vào mẫu gốc (bản nháp). Bấm "Lưu & xuất bản mẫu" để người dùng thấy.". SUPER_ADMIN thấy tiêu đề mới trong `definition`; mẫu có tag `pack:managed`. Người dùng thường vẫn thấy bản cũ (`publishedDefinition`). Có một phiên bản lịch sử "Trước khi lưu từ builder" chứa bản cũ. | Chưa có | Chưa chạy |
| LP09-S02-TC007 | Ảnh đại diện không đổi khi chỉ lưu nháp (LP09-F4) | P2 | Sau TC006. | 1. So `thumbnailUrl` trước và sau khi lưu nháp. | Không đổi. Ghi lại để xác nhận. | Chưa có | Chưa chạy |
| LP09-S02-TC008 | Lưu và xuất bản mẫu | P0 | Phiên với thay đổi mới. | 1. Bấm "Lưu & xuất bản mẫu".<br>2. Đọc thông báo.<br>3. ORG-A-OWNER tạo trang mới từ mẫu. | Thông báo "Đã lưu và xuất bản mẫu gốc. Người dùng sẽ thấy bản mới khi tạo trang.". `publishedDefinition` bằng `definition`, `publishStatus = PUBLISHED`. Trang mới của ORG-A-OWNER có nội dung mới. Có lịch sử "Trước khi sửa và xuất bản từ builder". | Chưa có | Chưa chạy |
| LP09-S02-TC009 | Thoát không lưu vào mẫu (LP09-F3) | P1 | Phiên có thay đổi đã autosave nhưng chưa bấm Lưu vào mẫu. | 1. Bấm "Thoát".<br>2. Xem mẫu trong thư viện (SUPER_ADMIN). | Về `/landing-pages/templates`. Mẫu **không** thay đổi. Mở lại phiên thì thấy nháp làm việc còn đó. | Chưa có | Chưa chạy |
| LP09-S02-TC010 | Lưu khi builder đang xung đột hoặc chưa lưu kịp | P1 | Phiên đang ở trạng thái xung đột (LP05-S03) hoặc mạng chậm. | 1. Bấm "Lưu vào mẫu". | Xung đột: "Có bản mới hơn ở nơi khác — bấm "Tải bản mới nhất" trước khi lưu mẫu" và không gọi API. Chưa lưu kịp: "Không lưu kịp bản nháp — thử lại". | Chưa có | Chưa chạy |
| LP09-S02-TC011 | Lưu mẫu khi chưa mở phiên | P1 | Token SUPER_ADMIN, mẫu chưa từng có phiên. | 1. `POST /templates/<slug>/save-from-session` body `{}`. | 404 "Chưa mở phiên sửa mẫu. Hãy bấm "Sửa mẫu gốc" trước.". | Chưa có | Chưa chạy |
| LP09-S02-TC012 | Không lưu mẫu trống | P1 | Phiên mà nháp đã xóa hết khối. | 1. Bấm "Lưu vào mẫu". | 400 "Mẫu đang trống, không thể lưu vào mẫu gốc." hiển thị trên thanh trạng thái. Mẫu không đổi. | Chưa có | Chưa chạy |
| LP09-S02-TC013 | Mẫu chưa từng xuất bản giữ trạng thái nháp | P1 | Mẫu `DRAFT` chưa có `publishedDefinition`. | 1. Lưu vào mẫu (không xuất bản). | `publishStatus` vẫn `DRAFT`. Người thường không thấy mẫu. | Chưa có | Chưa chạy |
| LP09-S02-TC014 | Slug mẫu không tồn tại | P2 | Token SUPER_ADMIN. | 1. `POST /templates/khong-co/edit-session`. | 404 (mẫu hệ thống không có). Không tạo trang làm việc. | Chưa có | Chưa chạy |
| LP09-S02-TC015 | Hai admin cùng tổ chức sửa một mẫu | P1 | SUPER_ADMIN-1 và SUPER_ADMIN-2 cùng tổ chức, cùng mở phiên. | 1. Mỗi người sửa một chỗ khác nhau, đợi lưu.<br>2. Mỗi người bấm "Lưu vào mẫu". | Cùng một trang làm việc: người sau bị xung đột phiên bản (LP05-S03) và phải tải bản mới nhất. Mẫu nhận bản của người lưu sau cùng sau khi xử lý xung đột. Ghi lại hành vi (LP09-F2). | Chưa có | Chưa chạy |

## LP09-S03. Cách ly trang làm việc khỏi người dùng

**Mục tiêu:** Trang `tpl-edit-*` không lộ, không xuất bản được, không ảnh hưởng trang khách.

**Căn cứ:** `TEMPLATE_EDIT_SLUG_PREFIX = 'tpl-edit-'` trong `template-pack.ts`; kiểm tra trong `LandingPagesService.publish`, `listPages`, `overview`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S03-TC001 | Xuất bản trang làm việc bằng API thường bị chặn | P0 | Trang làm việc `tpl-edit-zz-test-tpl`. | 1. `POST /landing-pages/<pageId>/publish` body `{}`. | 400 "Đây là phiên sửa mẫu gốc. Dùng "Lưu vào mẫu" hoặc "Lưu & xuất bản mẫu".". Trạng thái vẫn DRAFT. | Chưa có | Chưa chạy |
| LP09-S03-TC002 | Trang làm việc không hiện trong danh sách và tổng quan | P0 | Phiên đã mở. | 1. Mở `/landing-pages/pages` và `/landing-pages`. | Không thấy trang `[Sửa mẫu] ...`. Xem thêm LP08-S05. | Chưa có | Chưa chạy |
| LP09-S03-TC003 | Trang làm việc không mở được ở /p/slug | P0 | Như trên. | 1. Mở `/p/tpl-edit-zz-test-tpl`. | 404. | Chưa có | Chưa chạy |
| LP09-S03-TC004 | Trang khách tạo từ mẫu trước đó không đổi | P0 | Trang T tạo từ mẫu `zz-test-tpl` trước khi sửa. | 1. Sửa và xuất bản mẫu.<br>2. Mở T. | T không đổi. | Chưa có | Chưa chạy |
| LP09-S03-TC005 | Chỉ ghi vào bảng mẫu, không ghi vào trang người dùng | P1 | Mã nguồn hiện tại. | 1. Chạy `scripts/test-landing-page-revision.ts` hoặc kiểm tra thủ công khi lưu mẫu. | Lưu mẫu và xuất bản mẫu chỉ ghi các bản ghi mẫu, không ghi trang của người dùng nào (trang làm việc được đọc, không bị ghi lại khi lưu). | Một phần: `scripts/test-landing-page-revision.ts` kiểm: "template update and publish write template rows only"; "template operation wrote a user page" (mô hình giả). Thiếu: kiểm tra trên cơ sở dữ liệu thật | Chưa chạy |
| LP09-S03-TC006 | Tên trang làm việc quá dài | P2 | Mẫu có slug 80 ký tự. | 1. Mở phiên sửa. | Slug trang làm việc bị cắt ở 120 ký tự, vẫn nhận ra qua tiền tố `tpl-edit-`. Lưu vào mẫu vẫn tìm đúng trang (cùng cách cắt). | Chưa có | Chưa chạy |

## LP09-S04. Tải mẫu (một mẫu và tất cả)

**Mục tiêu:** Tải về ZIP đúng định dạng, đầy đủ, tải lại được.

**Căn cứ:** `exportPack`, `exportAll` trong `apps/api/src/landing-pages/landing-page-template-pack.service.ts`; `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx` hàm `downloadAll`, `downloadOne`; `apps/api/src/landing-pages/template-pack.ts`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S04-TC001 | Tải một mẫu | P0 | SUPER_ADMIN. Mẫu `zz-test-tpl`. | 1. Ở `/landing-pages/manage-templates` bấm "Tải" ở dòng mẫu đó.<br>2. Mở tệp ZIP. | Tải về `<slug>.zip` (qua `GET /templates/zz-test-tpl/pack`, `Cache-Control: no-store`). ZIP có `manifest.json`, `template.json`, thư mục `assets/` nếu có ảnh, `README.md`. | Một phần: `scripts/test-landing-page-template-pack.ts` kiểm: cấu trúc ZIP, an toàn đường dẫn, phiên bản định dạng, khứ hồi (khoảng 32 dòng kiểm). Thiếu: tải qua HTTP và giao diện | Chưa chạy |
| LP09-S04-TC002 | Manifest đúng | P1 | ZIP từ TC001. | 1. Đọc `manifest.json`. | Có `format`, `formatVersion`, `slug`, `name`, `category`, `theme`, `description`, `tags`. `slug` khớp mẫu. | Đã có: `scripts/test-landing-page-template-pack.ts` kiểm: manifest và định dạng; khứ hồi | Chưa chạy |
| LP09-S04-TC003 | Khóa nhạy cảm bị loại khỏi gói | P0 | Mẫu có trường dạng `password`, `assetKey` trong dữ liệu. | 1. Tải mẫu, đọc `template.json`. | Không có `password`, `assetKey` hay khóa nhạy cảm. Kiểm bằng hàm `stripSensitiveKeys`. | Đã có: `scripts/test-landing-page-template-pack.ts` kiểm: mẫu thử có trường `password` và kiểm trường này không còn sau khi đóng gói (hàm `stripSensitiveKeys`) | Chưa chạy |
| LP09-S04-TC004 | Tải tất cả mẫu | P0 | SUPER_ADMIN, catalog có 200 mẫu hệ thống. | 1. Bấm "Tải tất cả mẫu (N)".<br>2. Mở ZIP tổng. | Tệp `all-landing-templates-YYYY-MM-DD.zip` (`application/zip`, `no-store`). Chứa `packs/<slug>.zip` cho từng mẫu hệ thống (số tệp bằng số mẫu). Nút đổi nhãn "Đang đóng gói…" trong lúc chạy và bị khóa. Kích thước khoảng 3 MB với catalog hiện tại (đo lại). | Chưa có | Chưa chạy |
| LP09-S04-TC005 | Mỗi gói bên trong mở lại được | P1 | ZIP tổng từ TC004. | 1. Giải nén vài gói `packs/*.zip`.<br>2. Upload từng gói qua đường một mẫu hoặc hàng loạt (S05). | Mỗi gói hợp lệ, tải lại được và cho kết quả "cập nhật" (S05-TC001). | Chưa có | Chưa chạy |
| LP09-S04-TC006 | Tải tất cả khi danh sách trống | P2 | Môi trường không có mẫu. | 1. Mở trang quản lý. | Nút "Tải tất cả mẫu (0)" bị khóa. | Chưa có | Chưa chạy |
| LP09-S04-TC007 | Tải khi mạng lỗi | P2 | Chặn request tải. | 1. Bấm tải. | Hiện lỗi "Không tải được" (hoặc thông báo từ server), nút bấm lại được. | Chưa có | Chưa chạy |
| LP09-S04-TC008 | Gói chỉ chứa HTML nguồn | P2 | Mẫu được tạo từ HTML. | 1. Tải mẫu. | Gói chứa HTML gốc và đủ tệp để tải lại. | Chưa có | Chưa chạy |

## LP09-S05. Upload mẫu (một mẫu và hàng loạt)

**Mục tiêu:** Upload tạo mới hoặc cập nhật đúng, lỗi một tệp không làm hỏng cả lô, giới hạn rõ ràng.

**Căn cứ:** `importBulk`, `importNew`, `importUpdate`, `parseUpload` trong `apps/api/src/landing-pages/landing-page-template-pack.service.ts`; `apps/api/src/landing-pages/template-pack-bulk.ts`; `apps/api/src/landing-pages/template-pack.ts`; `FilesInterceptor('files', 300)` trong `apps/api/src/landing-pages/landing-pages.controller.ts`; `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S05-TC001 | Upload hàng loạt: tạo mới và cập nhật | P0 | SUPER_ADMIN. Hai tệp ZIP: gói của mẫu có sẵn (`slug` đã tồn tại) và gói mẫu mới `zz-new-1`. | 1. Ở trang quản lý bấm "Upload hàng loạt" và chọn hai tệp.<br>2. Xem bảng kết quả. | Phản hồi `{total:2, created:1, updated:1, failed:0, results:[...]}`. Mẫu mới `zz-new-1` được tạo ở trạng thái nháp; mẫu có sẵn được cập nhật và xuất bản. Bảng kết quả theo từng tệp. | Một phần: `scripts/test-landing-page-template-bulk-upload.cjs` kiểm: bộ máy `importBulk` thật với lưu trữ giả: 200 mẫu (100 tạo, 100 cập nhật) trong ZIP tổng, đơn lẻ lỗi cô lập, bảo vệ quản trị (khoảng 7 dòng kiểm). Thiếu: cơ sở dữ liệu và giao diện thật | Chưa chạy |
| LP09-S05-TC002 | Lỗi một tệp không dừng cả lô | P0 | Một tệp hợp lệ và một tệp `bad.zip` hỏng. | 1. Upload cả hai. | Tệp hợp lệ `created`, tệp hỏng `error` kèm thông báo; tổng `failed = 1`. Giao diện hiện "Chưa nhập được mẫu nào: N lỗi. Xem chi tiết bên dưới." chỉ khi không có tệp nào thành công. | Đã có: `scripts/test-landing-page-template-bulk-upload.cjs` kiểm: "partialFailureIsolated": một HTML hợp lệ tạo, một ZIP hỏng báo lỗi | Chưa chạy |
| LP09-S05-TC003 | ZIP tổng chứa nhiều gói | P0 | ZIP tổng từ "Tải tất cả" (S04-TC004). | 1. Upload ZIP tổng.<br>2. Xem kết quả. | Tách thành từng mẫu theo `packs/*.zip`, mỗi mẫu một dòng kết quả. Số mẫu khớp. Dữ liệu không đổi nếu nội dung gói giống mẫu hiện có. | Đã có: `scripts/test-landing-page-template-bulk-upload.cjs` kiểm: ZIP tổng 191 MB, 200 mẫu | Chưa chạy |
| LP09-S05-TC004 | Gộp trùng cùng slug | P1 | Hai tệp khác nhau cùng `slug` (LP09-F6). | 1. Upload cả hai. | Báo "Mẫu "<slug>" có nhiều bản khác nhau: <tệp A> và <tệp B>. Chỉ giữ một bản nguồn cho slug này." (trừ khi cấu hình ưu tiên chọn một bản). Nếu hai tệp giống hệt nhau thì gộp thành một. | Đã có: `scripts/test-landing-page-template-bulk-dedup.cjs` kiểm: loại trùng, HTML đơn lẻ không bị loại bởi trùng gói lưu trữ (khoảng 11 dòng kiểm) | Chưa chạy |
| LP09-S05-TC005 | Cấu hình ưu tiên nguồn | P2 | Biến môi trường `LP_TEMPLATE_BULK_PREFERRED_SOURCES` hợp lệ và không hợp lệ. | 1. Đặt JSON hợp lệ `{"slug-a":"file-a.zip"}`, upload hai bản của `slug-a`.<br>2. Đặt giá trị hỏng `abc`. | Hợp lệ: chọn bản ưu tiên. Hỏng: 400 "Cấu hình chọn bản template không hợp lệ". | Một phần: `scripts/test-landing-page-template-bulk-dedup.cjs` kiểm: gộp trùng với ưu tiên (chưa đọc chi tiết). Thiếu: giá trị cấu hình hỏng | Chưa chạy |
| LP09-S05-TC006 | Vượt 300 mẫu | P1 | Chuẩn bị 301 gói khác slug. | 1. Upload trong một lần. | 400 "Tối đa 300 mẫu mỗi lần upload" (hoặc "Đã nhận diện N mẫu khác nhau sau khi gộp trùng; tối đa 300 mẫu mỗi lần upload."). Không tệp nào được xử lý. | Chưa có | Chưa chạy |
| LP09-S05-TC007 | Không chọn tệp nào | P1 | Token SUPER_ADMIN. | 1. `POST /templates/packs/bulk` không đính kèm tệp. | 400 "Chưa chọn file nào". | Đã có: `scripts/test-landing-page-template-bulk-upload.cjs` kiểm: "Chưa chọn" | Chưa chạy |
| LP09-S05-TC008 | Giới hạn dung lượng giao diện | P1 | Tệp vượt giới hạn. | 1. Upload tệp vượt ngưỡng cho phép. | Giao diện từ chối và báo rõ, không gửi quá nhiều dữ liệu. | Đã có: `scripts/qa-landing-page-upload-limits.cjs` kiểm: giao diện trình duyệt thật với chế độ API giả (khoảng 2 dòng kiểm) | Chưa chạy |
| LP09-S05-TC009 | Giới hạn nginx (LP09-F5) | P0 | Môi trường có nginx như production. | 1. Upload ZIP tổng 150 MB.<br>2. Upload ZIP tổng 260 MB. | 150 MB: phải qua được nginx (cần `client_max_body_size` >= kích thước). 260 MB: bị từ chối ở API (256 MB) hoặc nginx với thông báo rõ. Ghi lại mã lỗi (413) và thông báo người dùng thấy. | Chưa có | Chưa chạy |
| LP09-S05-TC010 | Định dạng tệp không hỗ trợ | P1 | Tệp `x.exe`, `x.txt`, `x.docx`. | 1. Upload từng tệp bằng "Upload hàng loạt" và bằng `POST /templates/packs`. | Giao diện chỉ cho chọn `.zip, .html, .htm`. API: 400 "Chỉ nhận file .zip, .html hoặc .htm". | Chưa có | Chưa chạy |
| LP09-S05-TC011 | HTML quá lớn, ZIP quá lớn (một mẫu) | P1 | HTML 1,6 MB và ZIP đơn 21 MB. | 1. Upload qua `POST /templates/packs`. | 400 "File HTML vượt dung lượng 1.5MB" và 400 "ZIP vượt dung lượng 20MB". | Chưa có | Chưa chạy |
| LP09-S05-TC012 | Gói thiếu thành phần hoặc sai | P1 | Gói thiếu `template.json`; gói `formatVersion` lạ; gói có đường dẫn `../x`; gói có ảnh thiếu. | 1. Upload từng gói. | Mỗi gói báo lỗi tương ứng, không ghi dữ liệu. Đường dẫn thoát thư mục bị chặn. Ảnh thiếu: "Thiếu file assets/<tên> trong ZIP". | Đã có: `scripts/test-landing-page-template-pack.ts` kiểm: an toàn đường dẫn, phiên bản định dạng, cấu trúc | Chưa chạy |
| LP09-S05-TC013 | Mẫu phải giữ khối thu lead | P0 | Gói không có LeadForm và CTA. | 1. Upload. | 400 "Mẫu phải giữ block LeadForm hoặc CTA để thu thập lead". | Chưa có | Chưa chạy |
| LP09-S05-TC014 | Category và theme hợp lệ | P1 | Gói có `category` lạ, `theme` lạ. | 1. Upload từng gói. | 400 "Category không thuộc danh mục mẫu" và 400 "Theme không hợp lệ". | Chưa có | Chưa chạy |
| LP09-S05-TC015 | Slug mẫu mới đã tồn tại (một mẫu) | P1 | Gói có slug đã có, upload qua `POST /templates/packs`. | 1. Upload. | 400 "Slug đã có. Dùng Upload bản cập nhật trên thẻ mẫu đó.". | Chưa có | Chưa chạy |
| LP09-S05-TC016 | Cập nhật mẫu: slug trong gói phải khớp | P1 | Gói slug `b` upload vào mẫu `a` qua `POST /templates/a/pack`. | 1. Upload. | 400 "Slug trong gói phải là a". | Chưa có | Chưa chạy |
| LP09-S05-TC017 | Cập nhật mẫu đã xuất bản | P0 | Gói hợp lệ cho mẫu đang xuất bản. | 1. Upload cập nhật.<br>2. Tạo trang mới từ mẫu. | Mẫu được cập nhật, xuất bản ngay (`publishStatus = PUBLISHED`), gắn tag `pack:managed`, lưu phiên bản cũ. Trang mới có nội dung mới. Trang cũ không đổi. | Chưa có | Chưa chạy |
| LP09-S05-TC018 | Tệp HTML được chuyển thành mẫu chỉnh sửa được | P2 | Tệp `landing.html` đơn giản. | 1. Upload qua "Upload hàng loạt".<br>2. Tạo trang từ mẫu mới (nháp, SUPER_ADMIN). | Tạo mẫu mới với ảnh tĩnh và nội dung; trang tạo ra có section chỉnh sửa được. Mẫu ở trạng thái nháp tới khi xuất bản. | Chưa có | Chưa chạy |
| LP09-S05-TC019 | Giao diện báo cáo kết quả | P1 | Ba kịch bản: toàn thành công, một phần, toàn lỗi. | 1. Chạy `qa-landing-page-template-bulk-ui.cjs` hoặc làm tay với dữ liệu giả. | Bảng kết quả ghi đúng số tạo/cập nhật/lỗi và nội dung lỗi từng tệp. Có thông báo "Chưa nhập được mẫu nào: N lỗi..." khi toàn lỗi. | Đã có: `scripts/qa-landing-page-template-bulk-ui.cjs` kiểm: báo cáo thất bại/một phần/thành công và prefetch CSS (khoảng 2 dòng kiểm, API giả) | Chưa chạy |

## LP09-S06. Xuất bản mẫu, lịch sử và khôi phục

**Mục tiêu:** Người dùng thấy bản mẫu đúng; khôi phục an toàn.

**Căn cứ:** `publish`, `listVersions`, `restore`, `snapshot` trong `apps/api/src/landing-pages/landing-page-template-pack.service.ts`; `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx` hàm `publishOne`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S06-TC001 | Xuất bản mẫu từ trang quản lý | P0 | Mẫu nháp có `hasPublishedVersion = false`. | 1. Bấm "Xuất bản" ở dòng mẫu.<br>2. ORG-A-OWNER xem thư viện. | `publishStatus = PUBLISHED`, `publishedDefinition` bằng `definition`. ORG-A-OWNER thấy mẫu. Số "mẫu nháp" ở đầu trang giảm 1. | Chưa có | Chưa chạy |
| LP09-S06-TC002 | Danh sách phiên bản của mẫu | P1 | Mẫu đã lưu/xuất bản vài lần. | 1. `GET /templates/M/versions`. | Trả `slug`, `publishStatus` và tối đa 30 phiên bản mới nhất, mỗi phiên bản có `version`, `note`, `createdAt`. | Chưa có | Chưa chạy |
| LP09-S06-TC003 | Khôi phục phiên bản mẫu cũ (LP09-F7) | P0 | Mẫu có phiên bản 1. | 1. `POST /templates/M/versions/1/restore`.<br>2. Xem `definition`, `publishStatus`, `publishedDefinition`. | `definition` về nội dung phiên bản 1 và có phiên bản mới "Trước khi khôi phục v1". Ghi lại: trạng thái chuyển về nháp (flow gốc) nhưng người dùng vẫn thấy `publishedDefinition` cũ cho tới khi xuất bản lại. | Chưa có | Chưa chạy |
| LP09-S06-TC004 | Khôi phục phiên bản không tồn tại | P1 | Token SUPER_ADMIN. | 1. `POST /templates/M/versions/999/restore`.<br>2. `POST /templates/M/versions/abc/restore`.<br>3. `POST /templates/M/versions/0/restore`. | 999: 404 "Không có phiên bản này". `abc` và `0`: 400 "Version không hợp lệ". | Chưa có | Chưa chạy |
| LP09-S06-TC005 | Khởi động lại API không ghi đè mẫu đã sửa | P0 | Mẫu `M` đã sửa tay (có `pack:managed`). | 1. Khởi động lại API.<br>2. Đọc `definition` của M. | Giữ nguyên bản đã sửa. Xem LP02-S06-TC001. | Chưa có | Chưa chạy |
| LP09-S06-TC006 | Thay đổi mẫu không lan sang trang khách | P0 | Trang khách T tạo từ M. | 1. Sửa và xuất bản M.<br>2. Mở T và gọi `GET /landing-pages/<T>`. | Nội dung T giữ nguyên. | Chưa có | Chưa chạy |
| LP09-S06-TC007 | Hai admin cùng thao tác trên một mẫu | P2 | Hai SUPER_ADMIN khác tổ chức. | 1. Cả hai mở phiên sửa M (hai trang làm việc riêng).<br>2. Cả hai bấm Lưu & xuất bản. | Hai lần ghi tuần tự; mẫu nhận bản của người sau cùng, cả hai bản đều nằm trong lịch sử phiên bản. Không có cơ chế khóa lạc quan ở mức mẫu. Ghi lại. | Chưa có | Chưa chạy |

## LP09-S07. Giao diện trang Quản lý Templates

**Mục tiêu:** Trang quản lý hiển thị và thao tác đúng.

**Căn cứ:** `apps/web/src/app/(app)/landing-pages/manage-templates/page.tsx`, `apps/web/src/config/navigation.ts` (mục `adminOnly`), `apps/web/src/components/layout/sidebar.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP09-S07-TC001 | Danh sách mẫu và số liệu | P1 | SUPER_ADMIN. | 1. Mở `/landing-pages/manage-templates`. | Bảng liệt kê mẫu với trạng thái nháp/đã xuất bản, số mẫu nháp ở đầu trang. Có "Tải tất cả mẫu (N)" và "Upload hàng loạt". Mỗi dòng có "Sửa", "Tải", và "Xuất bản" (chỉ ở dòng nháp). | Chưa có | Chưa chạy |
| LP09-S07-TC002 | Nút Sửa dẫn vào builder | P1 | Danh sách mẫu. | 1. Bấm "Sửa" ở một dòng. | Gọi `edit-session` rồi mở builder của trang làm việc (như S02-TC001). | Chưa có | Chưa chạy |
| LP09-S07-TC003 | Trạng thái bận khóa các nút | P2 | Đang tải hoặc upload. | 1. Bấm "Tải tất cả" rồi cố bấm các nút khác. | Các nút khác bị khóa trong lúc `busy`, nhãn đổi "Đang đóng gói…" hoặc "Đang upload…". | Chưa có | Chưa chạy |
| LP09-S07-TC004 | Lỗi tải danh sách | P2 | API lỗi. | 1. Mở trang. | Hiện "Không tải được danh sách mẫu" hoặc thông báo từ server, không trắng trang. | Chưa có | Chưa chạy |
| LP09-S07-TC005 | Giao diện tiếng Anh và Việt | P2 | Chuyển ngôn ngữ. | 1. Xem nhãn menu "Quản lý Templates" / "Manage templates". | Nhãn menu đổi theo ngôn ngữ. (Các nhãn nút trong trang hiện viết cứng tiếng Việt, ghi lại.) | Chưa có | Chưa chạy |
| LP09-S07-TC006 | Responsive | P2 | SUPER_ADMIN ở 390 px. | 1. Mở trang. | Bảng cuộn trong vùng của nó, không cuộn ngang cả trang, các nút bấm được. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `PlatformAdminGuard` hoặc route mẫu admin: chạy S01.
- Sửa `openEditSession`, `saveFromSession` hoặc thanh sửa mẫu trong builder: chạy S02, S03.
- Sửa đóng gói/ZIP (`template-pack.ts`): chạy S04, S05-TC011 đến TC014 và `test-landing-page-template-pack.ts`.
- Sửa `importBulk`, `template-pack-bulk.ts` hoặc cấu hình nginx/upload: chạy S05.
- Sửa `ensureSystemTemplates` (LP02): chạy S06-TC005 và LP02-S06.
- Sửa trang `manage-templates` hoặc điều hướng: chạy S07, S01-TC005.
