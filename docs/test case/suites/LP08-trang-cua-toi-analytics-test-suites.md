# LP08: Trang của tôi, tổng quan và analytics - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP08-trang-cua-toi-analytics.md](../flows/LP08-trang-cua-toi-analytics.md). Mức ưu tiên flow: P2. Route giao diện: `/landing-pages`, `/landing-pages/pages`, `/landing-pages/analytics`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** danh sách trang, tổng quan, nhân đôi, lưu trữ, xóa, analytics của Landing Page. Không gồm tạo trang (LP01) hay xuất bản (LP05).

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listPages`, `overview`, `duplicate`, `archive`, `delete`, `bulkDelete`, `analytics`; `apps/web/src/app/(app)/landing-pages/pages/page.tsx`; `apps/web/src/app/(app)/landing-pages/analytics/page.tsx`; DTO `ListLandingPagesQueryDto`, `LandingPageAnalyticsQueryDto`; script `test-landing-page-pages-table-redesign.cjs`, `test-landing-page-overview-stats.cjs`.

**Case liên quan ở flow khác:** LP05 (gỡ xuất bản); LP06 (sự kiện và lead); LP09 (workbench); F03 cho tách tổ chức; F13 cho lead của trang đã xóa.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP08-F1 | Các số đếm tổng quan (`total`, `published`, `draft`, `archived`) **không loại** trang tạm sửa mẫu `tpl-edit-*`. Chỉ danh sách `recent` và `GET /landing-pages` loại chúng. Khi SUPER_ADMIN đang có phiên sửa mẫu, số "Nháp" và "Tổng" cao hơn số trang hiển thị trong danh sách. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `overview` (ba lệnh `count` không có điều kiện `NOT slug startsWith tpl-edit-`) | Flow gốc ghi "trang làm việc sửa mẫu không hiện trong danh sách và dashboard". Số đếm là một phần dashboard. Cần xác nhận có phải lỗi. | LP08-S02-TC006 |
| LP08-F2 | Bảng "Trang của tôi" có cột lượt truy cập, leads và tỷ lệ đăng ký, nhưng `GET /landing-pages` (hàm `serializePage`) không trả `visits` hay `leads`. Giao diện hiển thị `—` khi giá trị không có. Theo code API, các cột này luôn là `—`. | `apps/web/src/app/(app)/landing-pages/pages/page.tsx` (dòng hiển thị `p.visits`, `p.leads`); `apps/api/src/landing-pages/landing-pages.service.ts` hàm `serializePage` (không có trường này) | Cần xác nhận cột có chủ đích để trống hay thiếu tính năng. Case LP08-S01-TC006 ghi hiện trạng. | LP08-S01-TC006 |
| LP08-F3 | `GET /landing-pages` giới hạn 100 trang (`take: 100`) và `total` bằng số phần tử trả về, **không** phải tổng số trang của tổ chức. Tổ chức có hơn 100 trang không thấy các trang cũ và không có phân trang. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listPages` | Flow gốc nêu "hơn 100 trang (giới hạn danh sách)". Cần xác nhận hành vi mong muốn (phân trang hay tăng giới hạn). | LP08-S01-TC008 |
| LP08-F4 | `GET /landing-pages` trả cả `draftSpec` và `publishedSpec` đầy đủ cho từng trang. Danh sách 100 trang có thể rất nặng trong khi bảng chỉ cần vài trường. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `serializePage` | Cần xác nhận có muốn rút gọn dữ liệu danh sách. Ảnh hưởng hiệu năng, không ảnh hưởng chức năng. | LP08-S01-TC009 |
| LP08-F5 | `metrics.leads` đếm sự kiện `LEAD`, mà mỗi lần gửi form (kể cả gửi lại cho lead đã tồn tại) đều tạo một sự kiện `LEAD`; `metrics.formSubmits` có thể gấp đôi vì trình duyệt gửi thêm `FORM_SUBMIT` (xem LP06-F5). Vì vậy "leads" và "tỷ lệ chuyển đổi" là số lần gửi, không phải số lead duy nhất. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `analytics`, `submitPublicLead` | Cần xác nhận định nghĩa của "lead" và "chuyển đổi" trong báo cáo. | LP08-S04-TC005, LP08-S04-TC006 |
| LP08-F6 | Analytics đọc tối đa 50.000 dòng xem trang theo ngày, 20.000 dòng CTA/form theo khối và 100.000 dòng cho phễu. Vượt các ngưỡng này số liệu theo ngày, theo khối và phễu bị cắt (ước lượng thấp), còn các tổng `metrics` dùng `groupBy` thì đúng. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `analytics` (các `take`) | Cần xác nhận quy mô dữ liệu mong đợi và cách xử lý khi vượt ngưỡng. | LP08-S04-TC008 |
| LP08-F7 | Tham số `from` và `to` không được kiểm tra định dạng (DTO chỉ `IsString`). Chuỗi không phải ngày tạo `Invalid Date` và truy vấn có thể lỗi 500 thay vì 400. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `analytics` (`new Date(query.from)`); `LandingPageAnalyticsQueryDto` | Cần xác nhận mong muốn trả 400 với ngày sai. | LP08-S04-TC009 |
| LP08-F8 | Xóa trang là xóa vĩnh viễn (`prisma.landingPage.delete`). Không có thùng rác. Hành vi với lead, sự kiện và phiên bản của trang phụ thuộc quan hệ khóa ngoại trong schema (chưa đọc). | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `delete`, `bulkDelete`; schema Prisma | Cần xác nhận lead của trang đã xóa vẫn còn (và `landingPageId` thành rỗng) hay bị xóa theo. | LP08-S03-TC006 |

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
| LP08-S01 | Danh sách Trang của tôi | 11 |
| LP08-S02 | Tổng quan (dashboard Landing Page) | 6 |
| LP08-S03 | Nhân bản, lưu trữ và xóa | 15 |
| LP08-S04 | Analytics | 14 |
| LP08-S05 | Trang tạm sửa mẫu bị ẩn (LP09) | 5 |
| | **Tổng** | **51** |

## LP08-S01. Danh sách Trang của tôi

**Mục tiêu:** Danh sách, lọc, tìm kiếm hiển thị đúng và chỉ trang của tổ chức.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `listPages` (lọc `organizationId`, loại `tpl-edit-`, `take 100`), trang `apps/web/src/app/(app)/landing-pages/pages/page.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP08-S01-TC001 | Mở danh sách trang | P0 | ORG-A-OWNER có 5 trang gồm Nháp, Đã xuất bản, Lưu trữ. | 1. Mở `/landing-pages/pages`. | Bảng có cột ảnh, tên, trạng thái, ngày chỉnh sửa, lượt truy cập, leads, tỷ lệ đăng ký, nút thao tác. Có nút "Tạo landing page". Chỉ thấy trang của tổ chức A. | Một phần: `scripts/test-landing-page-pages-table-redesign.cjs` kiểm: cổng bố cục bảng, tên nút "Tạo landing page", địa phương hóa tiếng Việt (khoảng 2 dòng kiểm). Thiếu: dữ liệu thật và quyền | Chưa chạy |
| LP08-S01-TC002 | Lọc theo trạng thái | P0 | Như trên. | 1. Chọn bộ lọc Nháp, Đã xuất bản, Lưu trữ, Tất cả.<br>2. `GET /landing-pages?status=DRAFT\|PUBLISHED\|ARCHIVED\|ALL`. | Mỗi bộ lọc chỉ trả đúng trạng thái, URL giao diện đổi sang `?status=...`. `ALL` hoặc bỏ trống trả tất cả. | Một phần: `scripts/test-landing-page-overview-stats.cjs` kiểm: cổng: ô số liệu bấm được và bộ lọc trạng thái ở danh sách (không assert). Thiếu: kết quả lọc thật | Chưa chạy |
| LP08-S01-TC003 | Trạng thái không hợp lệ | P2 | Token ORG-A-OWNER. | 1. `GET /landing-pages?status=XYZ`. | 400 do `IsIn(['DRAFT','PUBLISHED','ARCHIVED','ALL'])`. | Chưa có | Chưa chạy |
| LP08-S01-TC004 | Tìm kiếm theo tên hoặc slug | P1 | Trang tên `Khuyến mãi Hè`, slug `khuyen-mai-he`. | 1. Tìm `khuyến`, `KHUYEN`, `he`.<br>2. Tìm chuỗi 101 ký tự. | Tìm không phân biệt hoa thường trong tên và slug (tìm `khuyến` có dấu khớp tên; `khuyen` khớp slug). 101 ký tự: 400 do `MaxLength(100)`. | Chưa có | Chưa chạy |
| LP08-S01-TC005 | Sắp xếp theo cập nhật mới nhất | P1 | Sửa trang cũ nhất. | 1. Mở danh sách. | Trang vừa sửa lên đầu (`updatedAt` giảm dần). | Chưa có | Chưa chạy |
| LP08-S01-TC006 | Cột lượt truy cập và leads (LP08-F2) | P1 | Trang có sự kiện và lead thật. | 1. Xem cột lượt truy cập, leads, tỷ lệ. | Ghi lại hiện trạng: theo code, API không trả `visits` và `leads` nên các cột hiển thị `—`. Nếu sản phẩm muốn có số, đây là tính năng thiếu. | Chưa có | Chưa chạy |
| LP08-S01-TC007 | Tổ chức mới chưa có trang | P1 | Tổ chức vừa đăng ký. | 1. Mở `/landing-pages/pages` và `/landing-pages`. | Hiện trạng thái rỗng thân thiện kèm nút tạo trang, số liệu bằng 0, không lỗi. | Chưa có | Chưa chạy |
| LP08-S01-TC008 | Hơn 100 trang (LP08-F3) | P1 | Tạo 105 trang (script) cho tổ chức thử. | 1. `GET /landing-pages`.<br>2. Mở danh sách trên giao diện. | Trả đúng 100 trang mới nhất, `total = 100`. Ghi lại: không có phân trang, 5 trang cũ không truy cập được từ danh sách. | Chưa có | Chưa chạy |
| LP08-S01-TC009 | Kích thước phản hồi danh sách (LP08-F4) | P2 | 100 trang có nội dung đầy đủ. | 1. Đo kích thước và thời gian phản hồi `GET /landing-pages`. | Ghi lại số đo. Không có ngưỡng chính thức; báo nếu trên vài MB. | Chưa có | Chưa chạy |
| LP08-S01-TC010 | Xem ảnh đại diện hỏng | P2 | Trang có ảnh đại diện lỗi. | 1. Mở danh sách. | Hiện biểu tượng thay thế, không vỡ bảng. | Chưa có | Chưa chạy |
| LP08-S01-TC011 | Không có quyền | P0 | Không token, và token tổ chức khác. | 1. `GET /landing-pages` không token.<br>2. ORG-B gọi và tìm trang ORG-A. | 401 cho không token. ORG-B không thấy trang của A. Xem F03. | Chưa có | Chưa chạy |

## LP08-S02. Tổng quan (dashboard Landing Page)

**Mục tiêu:** Số liệu tổng quan khớp dữ liệu thật.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `overview`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP08-S02-TC001 | Số liệu tổng quan | P1 | Tổ chức có 2 nháp, 1 đã xuất bản, 1 lưu trữ. | 1. Mở `/landing-pages`.<br>2. `GET /landing-pages/overview`. | `total = 3` (không tính lưu trữ), `published = 1`, `draft = 2`, `archived = 1`, `templates` là số mẫu thấy được, `recent` tối đa 8 trang mới nhất, `defaultSubdomainHint = {slug}.lp.aibeego.com`. | Một phần: `scripts/test-landing-page-overview-stats.cjs` kiểm: cổng: ô số liệu hiển thị số đếm và bấm được. Thiếu: đối chiếu số liệu với cơ sở dữ liệu | Chưa chạy |
| LP08-S02-TC002 | Bấm ô số liệu chuyển tới danh sách đã lọc | P2 | Tổng quan mở. | 1. Bấm ô "Đã xuất bản".<br>2. Bấm ô "Nháp". | Chuyển tới `/landing-pages/pages?status=PUBLISHED` và `?status=DRAFT`. | Một phần: `scripts/test-landing-page-overview-stats.cjs` kiểm: cổng: các ô bấm được. Thiếu: đích chuyển hướng | Chưa chạy |
| LP08-S02-TC003 | Trang gần đây | P1 | Sửa vài trang. | 1. Xem phần "gần đây". | Tối đa 8 trang, sắp theo cập nhật mới nhất, có tên, trạng thái, ngày. Không có trang `tpl-edit-*`. | Chưa có | Chưa chạy |
| LP08-S02-TC004 | Số mẫu cho người thường và quản trị | P2 | ORG-A-OWNER và SUPER_ADMIN. | 1. `GET /overview` hai tài khoản. | `templates` đếm mẫu hệ thống và mẫu riêng đã xuất bản (hoặc có bản đã xuất bản). Ghi lại số cho từng tài khoản. | Chưa có | Chưa chạy |
| LP08-S02-TC005 | Tổng quan tách theo tổ chức | P0 | ORG-A và ORG-B có số trang khác nhau. | 1. Mỗi tổ chức gọi `GET /overview`. | Mỗi bên chỉ thấy số liệu của mình. | Chưa có | Chưa chạy |
| LP08-S02-TC006 | Trang sửa mẫu làm lệch số đếm (LP08-F1) | P1 | SUPER_ADMIN mở phiên sửa mẫu (LP09) để tạo một workbench `tpl-edit-*`. | 1. `GET /overview` trước và sau khi mở phiên.<br>2. Đếm số trang trong `GET /landing-pages`. | Theo code: `draft` và `total` tăng 1 sau khi mở phiên nhưng danh sách và `recent` không thấy. Ghi lại để quyết định có là lỗi. | Chưa có | Chưa chạy |

## LP08-S03. Nhân bản, lưu trữ và xóa

**Mục tiêu:** Thao tác hàng loạt và từng trang chỉ ảnh hưởng đúng trang đã chọn.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `duplicate`, `archive`, `delete`, `bulkDelete`; xử lý thao tác trong `apps/web/src/app/(app)/landing-pages/pages/page.tsx` (hộp thoại xác nhận, nhánh dự phòng xóa tuần tự).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP08-S03-TC001 | Nhân đôi một trang | P0 | Trang T đã xuất bản với tên `Gốc`, slug `goc`. | 1. Menu thao tác chọn "Nhân đôi".<br>2. Mở trang mới. | Có trang tên `Gốc (copy)`, slug `goc-copy` (hoặc `goc-copy-2` nếu trùng), trạng thái Nháp. Nội dung giống nháp của T nhưng id block mới. Không sao chép bản đã xuất bản, canonical (`seoCanonical = null`), tên miền, mã theo dõi. | Chưa có | Chưa chạy |
| LP08-S03-TC002 | Bản nhân đôi độc lập với bản gốc | P0 | Sau TC001. | 1. Sửa tiêu đề bản sao, chờ lưu.<br>2. Mở bản gốc. | Bản gốc không đổi. Hai trang không dùng chung id phần tử. | Chưa có | Chưa chạy |
| LP08-S03-TC003 | Nhân đôi nhiều lần | P2 | Trang `goc`. | 1. Nhân đôi 3 lần liên tiếp. | Tên `Gốc (copy)` lặp lại, slug khác nhau (`goc-copy`, `goc-copy-2`, `goc-copy-3`). Tên bị cắt 120 ký tự nếu dài. | Chưa có | Chưa chạy |
| LP08-S03-TC004 | Lưu trữ một trang đã xuất bản | P0 | Trang PUBLISHED. | 1. Menu chọn "Lưu trữ".<br>2. Mở `/p/<slug>`. | Trạng thái Lưu trữ, `archivedAt` có giá trị. Trang công khai 404. Builder không cho sửa ("Trang đã archive — duplicate để chỉnh sửa"). Có thể nhân đôi. | Chưa có | Chưa chạy |
| LP08-S03-TC005 | Xóa một trang có xác nhận | P0 | Trang T. | 1. Bấm Xóa.<br>2. Hủy hộp thoại.<br>3. Bấm Xóa lần nữa và đồng ý. | Hộp thoại: "Bạn có chắc chắn muốn xóa vĩnh viễn landing page "<tên>"? Thao tác này không thể hoàn tác.". Hủy: không xóa. Đồng ý: trang biến mất, `DELETE /landing-pages/<id>` trả `{success:true,id}`. Trang công khai 404 (sau tối đa 60 giây nếu cache). | Chưa có | Chưa chạy |
| LP08-S03-TC006 | Xóa trang đã có lead (LP08-F8) | P0 | Trang T có 2 lead (LP06). | 1. Xóa T.<br>2. Mở `/leads` tìm 2 lead. | Ghi lại: lead còn hay mất, `landingPageId` thế nào. Kỳ vọng an toàn: lead không mất. Nếu bị xóa theo, báo lỗi nghiêm trọng. | Chưa có | Chưa chạy |
| LP08-S03-TC007 | Xóa hàng loạt | P0 | Chọn 3 trong 5 trang. | 1. Chọn ô "Chọn tất cả" hoặc từng ô.<br>2. Bấm Xóa (3).<br>3. Đồng ý. | Hộp thoại ghi số lượng. Chỉ 3 trang bị xóa, 2 trang còn nguyên. `POST /landing-pages/bulk-delete` trả `{success:true, deletedCount:3}`. | Chưa có | Chưa chạy |
| LP08-S03-TC008 | Xóa hàng loạt: id của tổ chức khác | P0 | Token ORG-B-OWNER. Danh sách id gồm trang của ORG-A. | 1. `POST /landing-pages/bulk-delete` body `{"ids":["<id ORG-A>"]}`. | `deletedCount = 0`. Trang của ORG-A còn nguyên (lọc `organizationId`). Xem F03. | Chưa có | Chưa chạy |
| LP08-S03-TC009 | Xóa hàng loạt: dữ liệu sai | P2 | Token ORG-A-OWNER. | 1. Gửi `{}`, `{"ids":[]}`, `{"ids":"abc"}`. | `deletedCount = 0`, không lỗi 500. | Chưa có | Chưa chạy |
| LP08-S03-TC010 | Xóa hàng loạt thất bại thì xóa tuần tự | P2 | Giả lập `bulk-delete` lỗi 500. | 1. Chọn 2 trang và bấm Xóa. | Giao diện thử xóa từng trang qua `DELETE /landing-pages/<id>`. Kết quả cuối: cả hai bị xóa hoặc hiện "Xóa thất bại". | Chưa có | Chưa chạy |
| LP08-S03-TC011 | Gỡ xuất bản từ menu | P1 | Trang PUBLISHED. | 1. Menu chọn "Gỡ xuất bản". | Trạng thái Nháp, `/p/<slug>` 404. Chi tiết ở LP05-S06. | Chưa có | Chưa chạy |
| LP08-S03-TC012 | Xem trang công khai và chỉnh sửa thiết kế từ menu | P1 | Trang PUBLISHED. | 1. Chọn "Xem trang công khai".<br>2. Chọn "Chỉnh sửa thiết kế". | Mở `/p/<slug>` (tab mới) và `/landing-pages/builder/<id>`. Trang nháp không có "Xem trang công khai" hoạt động hoặc dẫn tới 404. | Chưa có | Chưa chạy |
| LP08-S03-TC013 | Người chỉ xem không có thao tác ghi | P0 | Token ORG-A-VIEWER. | 1. `POST /duplicate`, `POST /archive`, `DELETE /:id`, `POST /:id/delete`, `POST /bulk-delete`. | Tất cả 403. Dữ liệu không đổi. | Chưa có | Chưa chạy |
| LP08-S03-TC014 | Xóa trang qua POST thay thế | P2 | Trang T. | 1. `POST /landing-pages/<id>/delete`. | Hoạt động giống `DELETE`. Trả `{success:true,id}`. | Chưa có | Chưa chạy |
| LP08-S03-TC015 | Id không tồn tại | P2 | Token ORG-A-OWNER. | 1. `POST /landing-pages/khong-co/duplicate`, `/archive`, `DELETE /landing-pages/khong-co`. | 404 "Landing page không tồn tại". | Chưa có | Chưa chạy |

## LP08-S04. Analytics

**Mục tiêu:** Số liệu xem trang, bấm CTA, gửi form, chuyển đổi và phễu khớp sự kiện thật.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `analytics` (groupBy theo loại sự kiện, `findMany` có `take`), trang `apps/web/src/app/(app)/landing-pages/analytics/page.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP08-S04-TC001 | Mở trang analytics | P1 | Tổ chức có sự kiện 30 ngày qua. | 1. Mở `/landing-pages/analytics`.<br>2. Chọn một trang, một nguồn UTM, một thiết bị. | Hiện các chỉ số tổng, phễu, biểu đồ theo ngày. Bộ lọc theo trang, UTM source và thiết bị hoạt động (đổi truy vấn `pageId`, `utmSource`, `device`). | Chưa có | Chưa chạy |
| LP08-S04-TC002 | Số liệu khớp sự kiện (đối chiếu) | P0 | Trang T mới. Tạo đúng: 10 lượt xem từ 4 visitorId, 3 CTA, 2 FORM_START, 2 lead khác nhau (qua LP06). | 1. `GET /landing-pages/analytics?pageId=<T>`.<br>2. So với dữ liệu đã tạo. | `pageViews = 10`, `uniqueVisitors = 4`, `ctaClicks = 3`, `formStarts = 2`. Ghi lại `formSubmits` và `leads` (xem LP08-F5, LP06-F5). | Chưa có | Chưa chạy |
| LP08-S04-TC003 | Tỷ lệ chuyển đổi | P1 | Như trên. | 1. Đọc `conversionRate`. | `conversionRate = leads / pageViews × 100`, làm tròn 2 chữ số. Không chia cho 0 khi chưa có lượt xem (trả 0). | Chưa có | Chưa chạy |
| LP08-S04-TC004 | Khoảng thời gian | P1 | Sự kiện rải 60 ngày. | 1. Không truyền `from`, `to`.<br>2. Truyền `from`/`to` ISO tuỳ chọn. | Mặc định 30 ngày gần nhất. Khoảng tùy chọn chỉ tính sự kiện trong khoảng (gồm cả hai đầu). | Chưa có | Chưa chạy |
| LP08-S04-TC005 | Lead đếm theo lần gửi (LP08-F5) | P1 | Một người gửi form hai lần cách nhau 15 giây cùng SĐT. | 1. Đọc `leads`, `formSubmits` và đếm lead trong `/leads`. | Ghi lại: `leads` tăng 2 trong khi CRM chỉ có 1 lead (lần 2 là cập nhật). Báo để quyết định định nghĩa. | Chưa có | Chưa chạy |
| LP08-S04-TC006 | FORM_SUBMIT tính hai lần (LP08-F5, LP06-F5) | P1 | Một lần gửi form thành công. | 1. Đọc `formSubmits`. | Ghi lại số thực tế (kỳ vọng theo code: 2 cho một lần gửi). | Chưa có | Chưa chạy |
| LP08-S04-TC007 | Phễu theo khách truy cập | P1 | Dữ liệu có khách A (xem, bấm CTA, lead), khách B (chỉ xem). | 1. Đọc `funnel`. | `views = 2`, `cta = 1`, `leads = 1`; các tỷ lệ `viewToCta = 50`, `ctaToLead = 100`, `viewToLead = 50`. `sales` tính khách có lead ở trạng thái BOOKED hoặc PURCHASED. | Chưa có | Chưa chạy |
| LP08-S04-TC008 | Dữ liệu lớn bị cắt (LP08-F6) | P2 | Tạo 60.000 sự kiện xem trang trong DB test. | 1. Đọc `metrics.pageViews` và tổng `viewsByDay`. | `metrics.pageViews` đúng 60.000. Tổng `viewsByDay` chỉ 50.000. Ghi lại chênh lệch. | Chưa có | Chưa chạy |
| LP08-S04-TC009 | Ngày sai định dạng (LP08-F7) | P2 | Token ORG-A-OWNER. | 1. `GET /analytics?from=abc`. | Ghi lại mã trả về (kỳ vọng an toàn là 400; theo code có thể 500). | Chưa có | Chưa chạy |
| LP08-S04-TC010 | Lọc trang của tổ chức khác | P0 | Token ORG-B-OWNER, `pageId` là trang của ORG-A. | 1. `GET /analytics?pageId=<ORG-A page>`. | Số liệu rỗng (không rò rỉ). Xem F03. | Chưa có | Chưa chạy |
| LP08-S04-TC011 | Phân rã theo thiết bị và UTM | P2 | Dữ liệu có thiết bị mobile/desktop và nhiều UTM. | 1. Đọc `byDevice`, `byUtm`. | `byDevice` tính theo lượt xem, giá trị rỗng gom `unknown`. `byUtm` tối đa 20 dòng sắp giảm dần. | Chưa có | Chưa chạy |
| LP08-S04-TC012 | Số liệu theo khối form và CTA | P2 | Trang có hai form và hai nút CTA. | 1. Gửi và bấm ở các khối khác nhau.<br>2. Đọc `ctaByBlock`, `formByBlock`. | Mỗi khối có số đúng, tối đa 30 dòng. Sự kiện không có `blockId` gom vào `unknown` (hoặc `href:...` cho CTA). | Chưa có | Chưa chạy |
| LP08-S04-TC013 | Quyền xem analytics | P1 | Token ORG-A-VIEWER. | 1. `GET /analytics`. | 200 (cần `lead.read`). Không có token: 401. | Chưa có | Chưa chạy |
| LP08-S04-TC014 | Tổ chức chưa có sự kiện | P2 | Tổ chức mới. | 1. Mở analytics. | Tất cả số 0, biểu đồ trống, không lỗi chia cho 0. | Chưa có | Chưa chạy |

## LP08-S05. Trang tạm sửa mẫu bị ẩn (LP09)

**Mục tiêu:** Workbench `tpl-edit-*` không lộ cho người dùng thường.

**Căn cứ:** Điều kiện `NOT { slug: { startsWith: TEMPLATE_EDIT_SLUG_PREFIX } }` trong `listPages` và `overview.recent`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP08-S05-TC001 | Không hiện trong danh sách | P0 | SUPER_ADMIN mở phiên sửa mẫu (LP09-S01). | 1. `GET /landing-pages` và mở `/landing-pages/pages` bằng tài khoản đó. | Không có trang tên `[Sửa mẫu] ...`. Tìm theo `tpl-edit` cũng không ra (`NOT slug startsWith`). | Chưa có | Chưa chạy |
| LP08-S05-TC002 | Không hiện ở trang gần đây | P0 | Như trên. | 1. `GET /landing-pages/overview`, đọc `recent`. | Không có workbench trong `recent`. | Chưa có | Chưa chạy |
| LP08-S05-TC003 | Vẫn mở được bằng id | P1 | Biết `pageId` của workbench. | 1. Mở `/landing-pages/builder/<pageId>`. | Mở builder với thanh "Đang sửa MẪU GỐC" (LP09). Dữ liệu tách khỏi trang khách. | Chưa có | Chưa chạy |
| LP08-S05-TC004 | Số đếm tổng quan (LP08-F1) | P1 | Như S02-TC006. | 1. Đối chiếu `overview` và danh sách. | Ghi lại chênh lệch (đã mô tả ở S02-TC006). | Chưa có | Chưa chạy |
| LP08-S05-TC005 | Nhân đôi hoặc xóa workbench | P2 | Biết `pageId` workbench. | 1. `POST /duplicate` và `DELETE` trên workbench. | Ghi lại: code không chặn các thao tác này. Nhân đôi tạo một trang tên `[Sửa mẫu] ... (copy)` với slug `tpl-edit-...-copy` cũng bị ẩn khỏi danh sách. Xóa workbench làm mất phiên sửa đang dở. Cần xác nhận có muốn chặn. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `listPages`, `overview` hoặc trang danh sách: chạy S01, S02, S05.
- Sửa `duplicate`, `archive`, `delete`, `bulkDelete`: chạy S03.
- Sửa `analytics` hoặc cách ghi sự kiện (LP06): chạy S04.
- Sửa phiên sửa mẫu (LP09): chạy S05.
