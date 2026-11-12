# LP06: Form thu lead trên trang công khai - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP06-form-thu-lead.md](../flows/LP06-form-thu-lead.md). Mức ưu tiên flow: P0. Route giao diện: `/p/[slug]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** khách gửi form trên trang công khai, tạo lead trong CRM, chống spam và trùng, ghi sự kiện, hiển thị form. Không gồm xử lý lead sau đó trong CRM (F13) hay tự động hóa (xem S04).

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages-public.controller.ts` (`POST :slug/lead`, `POST :slug/events`, hàm `clientIp`); `apps/api/src/landing-pages/landing-pages.service.ts` hàm `submitPublicLead`, `trackPublicEvent`, `resolvePublishedPage`, `ensureLeadSource`; `apps/api/src/landing-pages/dto/landing-pages.dto.ts` (`SubmitLandingPageLeadDto`, `TrackLandingPageEventDto`); `apps/web/src/components/landing-pages/public-landing-page-client.tsx`. Thông báo lỗi và giới hạn tần suất lấy nguyên văn từ code.

**Case liên quan ở flow khác:** F13 (quản lý lead) cho LP06-S04; F03 (tách dữ liệu tổ chức) cho LP06-S04-TC002; F52 (trang công khai) cho LP06-S06, LP06-S07.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP06-F1 | Server chỉ yêu cầu **Số điện thoại hoặc Email** (ít nhất một). Không kiểm định dạng email hay độ dài số điện thoại. Các trường "bắt buộc" khác do giao diện (renderer) quyết định, API công khai không ép. | apps/api/src/landing-pages/landing-pages.service.ts hàm `submitPublicLead` (`if (!phone && !email) throw BadRequestException('Cần ít nhất Số điện thoại hoặc Email')`) | Flow gốc ghi "thiếu trường bắt buộc báo lỗi theo trường". Hành vi API: lỗi chung một thông báo, không theo trường. Cần xác nhận có muốn kiểm định dạng ở server. | LP06-S02-TC001, LP06-S02-TC004, LP06-S02-TC005 |
| LP06-F2 | Chống gửi lặp: cùng trang + cùng (số điện thoại chỉ gồm chữ số \| email chữ thường) chỉ 1 lần mỗi 12 giây. Vượt thì lỗi giới hạn (429). Sau 12 giây gửi lại **không** bị chặn ở lớp này mà do dịch vụ lead gộp/cập nhật lead cũ (`updated: true`). | apps/api/src/landing-pages/landing-pages.service.ts dòng `lp:lead:once:...` (1 lần, 12.000 ms) và biến `isUpdate` | Flow gốc ghi "bị chống spam hoặc chống trùng". Cần xác nhận với F13 cách gộp lead trùng (theo số điện thoại hay email). | LP06-S03-TC003, LP06-S03-TC004 |
| LP06-F3 | Honeypot (`website` có giá trị) trả `{ok:true, skipped:true, reason:'spam'}` như thành công, không tạo lead. Việc kiểm tra trang tồn tại diễn ra **trước** honeypot nên slug sai vẫn 404. | apps/api/src/landing-pages/landing-pages.service.ts hàm `submitPublicLead` (thứ tự: tìm trang, rồi honeypot, rồi giới hạn tần suất) | Khớp thiết kế. Giao diện công khai luôn gửi `website: ''`. | LP06-S03-TC001 |
| LP06-F4 | Làm sạch nội dung chỉ bằng cách **xóa thẻ HTML** (`<[^>]+>`) và cắt 2000 ký tự mỗi trường; không escape. Ký tự `<` đứng riêng hoặc dạng `<<` không bị xóa hết. | apps/api/src/landing-pages/landing-pages.service.ts vòng lặp tạo `fields` | Cần xác nhận nơi hiển thị lead (CRM, email, webhook) escape đúng, vì dữ liệu lưu là văn bản thô sau khi xóa thẻ. | LP06-S02-TC008, LP06-S02-TC009 |
| LP06-F5 | Mỗi lần gửi thành công, server ghi **hai** sự kiện (`FORM_SUBMIT`, `LEAD`), còn trình duyệt khách gửi thêm một sự kiện `FORM_SUBMIT` qua `/events`. Số `formSubmits` trong analytics có thể gấp đôi số lead. | apps/api/src/landing-pages/landing-pages.service.ts hàm `submitPublicLead`; apps/web/src/components/landing-pages/public-landing-page-client.tsx dòng `await track('FORM_SUBMIT', { blockId })` | Cần xác nhận cách tính mong muốn cho số lượt gửi form (LP08). | LP06-S05-TC004 |
| LP06-F6 | Trang công khai tìm theo `slug` và **không** gửi `organizationId`. Nếu hai tổ chức cùng có slug đã xuất bản thì lấy bản xuất bản mới nhất, lead vào tổ chức của trang đó. Khi tạo/đổi tên trang, `uniqueSlug` chặn trùng với `subdomainSlug` của tổ chức khác nên thường không xảy ra. | apps/api/src/landing-pages/landing-pages.service.ts hàm `resolvePublishedPage`, `uniqueSlug`; apps/web/src/components/landing-pages/public-landing-page-client.tsx (URL gọi API không có `organizationId`) | Cần xác nhận không còn đường nào tạo hai slug trùng giữa các tổ chức (vd. đổi `subdomainSlug` bằng PATCH rồi tạo trang trùng slug). | LP06-S06-TC005 |
| LP06-F7 | Địa chỉ IP lấy từ phần tử đầu của header `X-Forwarded-For`. Nếu proxy phía trước không ghi đè header này, người gọi có thể giả IP để né giới hạn tần suất. | apps/api/src/landing-pages/landing-pages-public.controller.ts hàm `clientIp` | Cần xác nhận cấu hình nginx đặt lại `X-Forwarded-For`. | LP06-S03-TC008 |
| LP06-F8 | `test-landing-page-public-lead.ts` chỉ kiểm hàm giao diện `interpretPublicLeadResponse` (thông báo cảm ơn hoặc lỗi), **không** tạo lead trong cơ sở dữ liệu. `test-leads-ux.ts` kiểm hình dạng kanban và bộ lọc, không kiểm nguồn lead từ landing page. | `scripts/test-landing-page-public-lead.ts`, `scripts/test-leads-ux.ts` | Flow gốc ghép hai script này với "tạo lead đúng tổ chức và nguồn". Điều kiện đó hiện chưa có test tự động. | LP06-S01-TC001, LP06-S04-TC001 |

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
| LP06-S01 | Gửi form thành công | 12 |
| LP06-S02 | Kiểm tra dữ liệu và làm sạch | 12 |
| LP06-S03 | Chống spam, chống trùng và giới hạn tần suất | 9 |
| LP06-S04 | Lead trong CRM: đúng tổ chức, nguồn, gán và thẻ | 8 |
| LP06-S05 | Theo dõi sự kiện trang công khai | 8 |
| LP06-S06 | Trạng thái trang, bản xem trước và định danh tổ chức | 7 |
| LP06-S07 | Hiển thị form, theo ngành và responsive | 7 |
| | **Tổng** | **63** |

## LP06-S01. Gửi form thành công

**Mục tiêu:** Form hợp lệ tạo lead gắn đúng trang và tổ chức, khách thấy lời cảm ơn.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages-public.controller.ts` (`POST :slug/lead`), `apps/api/src/landing-pages/landing-pages.service.ts` hàm `submitPublicLead`, `apps/web/src/components/landing-pages/public-landing-page-client.tsx` (`onLeadSubmit`).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S01-TC001 | **[SMOKE-5]** Gửi form trang smoke và xác nhận lead đúng tổ chức, đúng nguồn | P0 | Trang `PAGE-SMOKE` đã xuất bản (SMOKE-3) và mở được ở `/p/<slug>` (SMOKE-4), có form. ORG-A-OWNER đang đăng nhập ở cửa sổ khác. Dữ liệu: tên `Smoke Lead 20261111`, SĐT `0900000001`, email `smoke.lead.20261111@example.com`. | 1. Mở `/p/<slug>` ở cửa sổ ẩn danh.<br>2. Điền tên, SĐT, email như trên.<br>3. Bấm gửi.<br>4. Ở cửa sổ ORG-A-OWNER mở `/leads` và tìm theo SĐT `0900000001`.<br>5. Mở chi tiết lead, đọc nguồn, trang, ghi chú. | Khách thấy "Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.". Phản hồi API `ok: true`, `leadId`, `updated: false`, `landingPageId` = id của `PAGE-SMOKE`. Lead có trong `/leads` của tổ chức A, nguồn "Landing Page" (mã `landing_page`), gắn `landingPageId`, ghi chú chứa `landingPageId=<id>`. Tổ chức B không thấy lead này. | Một phần: `scripts/test-landing-page-public-lead.ts` kiểm: chỉ hàm diễn giải phản hồi: thông báo cảm ơn, thông báo lỗi, phản hồi rỗng, 429. Thiếu: tạo lead thật, đúng tổ chức và nguồn (LP06-F8) | Chưa chạy |
| LP06-S01-TC002 | Phản hồi API đúng cấu trúc | P0 | Trang PUBLISHED slug `S`. | 1. `POST {API}/landing-pages/public/S/lead` body `{"fields":{"name":"Lan","phone":"0911111111"}}`. | Thành công, body `{ok:true, leadId, updated:false, landingPageId}`. Không có trường nhạy cảm (token, dữ liệu tổ chức). | Chưa có | Chưa chạy |
| LP06-S01-TC003 | Chỉ có email | P0 | Trang PUBLISHED. | 1. Gửi `fields: {name, email}` không có SĐT. | Tạo lead thành công, lead có email, không có SĐT. | Chưa có | Chưa chạy |
| LP06-S01-TC004 | Chỉ có số điện thoại | P0 | Trang PUBLISHED. | 1. Gửi `fields: {name, phone}` không có email. | Tạo lead thành công. | Chưa có | Chưa chạy |
| LP06-S01-TC005 | Tên trường thay thế được nhận diện | P1 | Trang PUBLISHED. | 1. Gửi lần lượt `fields` với `{Name, tel}`, `{fullName, sdt}`, `{name, dien_thoai}`, `{name, mobile}`, `{name, mail}`, `{name, email_address}`. | Server nhận ra SĐT/email/tên từ các tên trường trên. Mỗi lần tạo một lead (dùng dữ liệu khác nhau để tránh gộp). | Chưa có | Chưa chạy |
| LP06-S01-TC006 | Không có tên | P2 | Trang PUBLISHED. | 1. Gửi `fields: {phone: "0922222222"}`. | Lead tạo với tên mặc định `Landing lead`. | Chưa có | Chưa chạy |
| LP06-S01-TC007 | Các trường phụ vào ghi chú | P1 | Trang PUBLISHED. | 1. Gửi `fields: {name, phone, company: "ACME", need: "Tư vấn SEO", note: "Gọi sau 5h"}`.<br>2. Mở lead. | Ghi chú có các dòng `Công ty: ACME`, `Nhu cầu: Tư vấn SEO`, `Ghi chú: Gọi sau 5h`, `landingPageId=<id>` và `fields={...}` (tối đa 1500 ký tự cho phần JSON, ghi chú tối đa 4000). | Chưa có | Chưa chạy |
| LP06-S01-TC008 | Thuộc tính truy vết mặc định | P1 | Trang slug `S`, gửi không kèm `attribution`. | 1. Gửi lead đơn giản.<br>2. Xem trường attribution của lead. | `utmSource = landing_page`, `utmMedium = lead_form`, `utmCampaign = S`, `landingPage = /p/S`. | Chưa có | Chưa chạy |
| LP06-S01-TC009 | Thuộc tính truy vết UTM từ link | P1 | Mở `/p/S?utm_source=facebook&utm_medium=cpc&utm_campaign=tet2026`. | 1. Điền và gửi form.<br>2. Xem attribution của lead và sự kiện. | Lead giữ `utmSource = facebook`, `utmMedium = cpc`, `utmCampaign = tet2026`. Sự kiện `FORM_SUBMIT` và `LEAD` mang cùng UTM. | Chưa có | Chưa chạy |
| LP06-S01-TC010 | Gửi từ nhiều khối form | P2 | Trang có hai khối LeadForm A và B. | 1. Gửi form ở khối A và khối B (dữ liệu khác nhau).<br>2. Xem `landingPageBlockId` của hai lead. | Mỗi lead mang đúng `blockId` của khối đã gửi (`rawPayload.blockId`). | Chưa có | Chưa chạy |
| LP06-S01-TC011 | Gửi form khi đang xem Preview | P1 | Mở `/p/preview/<token>` của trang nháp. | 1. Điền và gửi form. | Hiện "Preview: form không gửi lead thật.". Không có request tới `/lead`. Không tạo lead. | Chưa có | Chưa chạy |
| LP06-S01-TC012 | Nhấp đúp nút gửi | P0 | Trang PUBLISHED, mở `/p/<slug>`. | 1. Điền form hợp lệ.<br>2. Nhấp đúp nhanh nút gửi. | Chỉ một request được gửi (`leadInflight`). Chỉ có một lead. Nếu có request thứ hai thì bị chặn 12 giây (`Thông tin vừa được gửi...`). | Chưa có | Chưa chạy |

## LP06-S02. Kiểm tra dữ liệu và làm sạch

**Mục tiêu:** Dữ liệu sai bị từ chối đúng, dữ liệu nguy hiểm không gây hại.

**Căn cứ:** `SubmitLandingPageLeadDto`, vòng lặp tạo `fields` và kiểm tra `!phone && !email` trong `submitPublicLead`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S02-TC001 | Thiếu cả SĐT và email | P0 | Trang PUBLISHED. | 1. Gửi `fields: {name: "Lan"}`. | 400 "Cần ít nhất Số điện thoại hoặc Email". Không tạo lead, không ghi sự kiện `FORM_SUBMIT`. | Chưa có | Chưa chạy |
| LP06-S02-TC002 | fields rỗng hoặc sai kiểu | P1 | Trang PUBLISHED. | 1. Gửi `fields: {}`.<br>2. Gửi `fields: "abc"`.<br>3. Gửi body `{}`. | `{}` trả 400 "Cần ít nhất...". Hai trường hợp còn lại 400 do `IsObject`. | Chưa có | Chưa chạy |
| LP06-S02-TC003 | SĐT và email chỉ gồm khoảng trắng | P2 | Trang PUBLISHED. | 1. Gửi `fields: {name, phone: "   ", email: "  "}`. | Ghi lại hành vi thực tế. Theo code, chuỗi khoảng trắng là giá trị "có" nên có thể qua kiểm tra. Nếu tạo được lead không liên hệ được thì báo lỗi (LP06-F1). | Chưa có | Chưa chạy |
| LP06-S02-TC004 | Email sai định dạng (LP06-F1) | P1 | Trang PUBLISHED. | 1. Gửi `fields: {name, email: "abc"}`. | Ghi lại: theo code, server không kiểm định dạng nên có thể tạo lead với email `abc`. Cần xác nhận kỳ vọng. | Chưa có | Chưa chạy |
| LP06-S02-TC005 | SĐT chứa chữ và ký tự lạ (LP06-F1) | P1 | Trang PUBLISHED. | 1. Gửi `phone: "abc-xyz"` kèm `email` hợp lệ.<br>2. Gửi `phone: "+84 90 000 0002"`. | Ghi lại hành vi. Theo code, không kiểm định dạng số. SĐT `+84...` được gộp theo chuỗi chữ số cho chống lặp 12 giây. | Chưa có | Chưa chạy |
| LP06-S02-TC006 | Trường quá dài | P1 | Trang PUBLISHED. | 1. Gửi `fields.note` 3000 ký tự.<br>2. Gửi `fields.name` 500 ký tự. | `note` bị cắt 2000 ký tự. Tên bị cắt 200 ký tự. Không lỗi. | Chưa có | Chưa chạy |
| LP06-S02-TC007 | Tên trường lạ bị làm sạch | P2 | Trang PUBLISHED. | 1. Gửi `fields` có khóa `"na me!<x>"`, khóa 100 ký tự, khóa rỗng `""`. | Khóa chỉ giữ ký tự chữ, số, gạch dưới, chấm, gạch ngang và cắt 64 ký tự. Khóa rỗng sau khi làm sạch bị bỏ. | Chưa có | Chưa chạy |
| LP06-S02-TC008 | Chèn thẻ HTML (LP06-F4) | P0 | Trang PUBLISHED. | 1. Gửi `name: "<script>alert(1)</script>Lan"`, `note: "<img src=x onerror=alert(1)>Hi"`.<br>2. Xem lead trong `/leads` và chi tiết lead. | Thẻ bị xóa: tên là `alert(1)Lan` (phần chữ giữa thẻ còn lại), ghi chú là `Hi`. Không có script chạy khi xem lead ở CRM. | Chưa có | Chưa chạy |
| LP06-S02-TC009 | Ký tự < đứng riêng (LP06-F4) | P1 | Trang PUBLISHED. | 1. Gửi `note: "a < b << c"`.<br>2. Xem lead. | Ghi lại giá trị lưu và cách hiển thị ở CRM, email thông báo, webhook. Giá trị phải được escape khi hiển thị. | Chưa có | Chưa chạy |
| LP06-S02-TC010 | SQL injection trong trường | P1 | Trang PUBLISHED. | 1. Gửi `name: "'; DROP TABLE leads;--"`. | Lưu như chuỗi thường, không lỗi 500, các bảng còn nguyên. | Chưa có | Chưa chạy |
| LP06-S02-TC011 | Unicode và emoji | P2 | Trang PUBLISHED. | 1. Gửi `name: "Nguyễn Thị Hương 🌸"`. | Lưu và hiển thị đúng, không mất dấu. | Chưa có | Chưa chạy |
| LP06-S02-TC012 | Giới hạn kích thước body | P2 | Trang PUBLISHED. | 1. Gửi body JSON 5 MB. | Bị từ chối bởi giới hạn body của server (kỳ vọng 413). Không treo dịch vụ. Ghi lại mã thực tế. | Chưa có | Chưa chạy |

## LP06-S03. Chống spam, chống trùng và giới hạn tần suất

**Mục tiêu:** Bot và gửi lặp bị chặn, người dùng thật không bị chặn oan.

**Căn cứ:** `rateLimit.assertWithinLimit` trong `submitPublicLead`: `lp:lead:global` (40/giờ), `lp:lead:<page>:<ip>` (8/10 phút), `lp:lead:ip` (30/giờ), `lp:lead:once` (1/12 giây).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S03-TC001 | Honeypot | P0 | Trang PUBLISHED. | 1. Gửi body hợp lệ nhưng thêm `website: "http://spam"`. | Thành công giả: `{ok:true, skipped:true, reason:'spam'}`. Không tạo lead, không có sự kiện. | Chưa có | Chưa chạy |
| LP06-S03-TC002 | Honeypot với trang không tồn tại | P2 | Slug `khong-co`. | 1. Gửi body có `website` khác rỗng. | 404 "Landing page không tồn tại" (kiểm trang trước honeypot). | Chưa có | Chưa chạy |
| LP06-S03-TC003 | Gửi lặp cùng SĐT trong 12 giây | P0 | Trang PUBLISHED. Dữ liệu SĐT `0933333333`. | 1. Gửi form lần 1.<br>2. Trong 12 giây, gửi lần 2 cùng SĐT. | Lần 1 thành công. Lần 2 báo "Thông tin vừa được gửi. Vui lòng đợi một lát trước khi gửi lại." (HTTP 429). Giao diện hiện đúng thông báo này, không hiện "Cảm ơn". | Một phần: `scripts/test-landing-page-public-lead.ts` kiểm: giao diện hiểu 429 và hiện thông báo có chữ "đợi". Thiếu: server chặn thật sự | Chưa chạy |
| LP06-S03-TC004 | Gửi lại sau 12 giây gộp vào lead cũ | P0 | Sau TC003, đợi trên 12 giây. | 1. Gửi lần 3 cùng SĐT, khác tên.<br>2. Đếm lead theo SĐT trong `/leads`. | Phản hồi `updated: true` (hoặc tạo mới tùy luật gộp ở F13). Không có hai lead trùng SĐT nếu F13 quy định gộp. Ghi lại hành vi thực tế. | Chưa có | Chưa chạy |
| LP06-S03-TC005 | Chống lặp cùng email, khác hoa thường | P1 | Trang PUBLISHED. | 1. Gửi `email: "A@Example.com"`.<br>2. Ngay sau gửi `email: "a@example.com"`. | Lần 2 bị chặn 12 giây (email chuẩn hóa chữ thường). | Chưa có | Chưa chạy |
| LP06-S03-TC006 | Giới hạn 8 lần mỗi 10 phút cho một trang và một IP | P1 | Trang PUBLISHED, một IP, dữ liệu mỗi lần khác nhau. | 1. Gửi 9 lần, mỗi lần cách nhau trên 12 giây hoặc dữ liệu khác. | Lần thứ 9 báo "Gửi form quá nhanh — thử lại sau". Chạy riêng để không ảnh hưởng case khác. | Chưa có | Chưa chạy |
| LP06-S03-TC007 | Giới hạn 30 lần mỗi giờ cho một IP | P2 | Một IP, nhiều trang. | 1. Gửi 31 lần khác nhau trong 1 giờ trên nhiều trang. | Lần 31 báo "Quá nhiều yêu cầu từ IP này". (Giới hạn 40 lần/giờ cũng dùng thông báo này.) | Chưa có | Chưa chạy |
| LP06-S03-TC008 | Giả IP qua X-Forwarded-For (LP06-F7) | P1 | Môi trường qua nginx như production. | 1. Gửi 9 lần với header `X-Forwarded-For` khác nhau mỗi lần. | Nếu nginx đặt lại header thì vẫn bị chặn ở lần 9. Nếu không, giới hạn bị vô hiệu: báo lỗi cấu hình. | Chưa có | Chưa chạy |
| LP06-S03-TC009 | Người dùng thật cùng mạng công ty | P2 | Hai khách khác nhau chung một IP. | 1. Khách 1 và khách 2 gửi form cách nhau 1 phút, dữ liệu khác nhau. | Cả hai thành công (không bị chặn bởi chống lặp theo SĐT/email). | Chưa có | Chưa chạy |

## LP06-S04. Lead trong CRM: đúng tổ chức, nguồn, gán và thẻ

**Mục tiêu:** Lead xuất hiện ở đúng nơi với đúng thông tin; tích hợp F13.

**Căn cứ:** `LeadsService.create`, `ensureLeadSource`, `mergeLeadFormTags`, `resolveLeadFormBlockFromSpec`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S04-TC001 | Lead hiển thị ở /leads với nguồn Landing Page | P0 | Lead từ LP06-S01-TC001. | 1. Mở `/leads` bằng ORG-A-OWNER, lọc nguồn "Landing Page".<br>2. Mở chi tiết lead. | Thấy lead, nguồn "Landing Page", liên kết tới trang nguồn nếu giao diện có. Thông tin tên, SĐT, email đúng. | Một phần: `scripts/test-leads-ux.ts` kiểm: hình dạng kanban, bộ lọc, con trỏ phân trang, hoàn tác lạc quan (khoảng 12 dòng kiểm). Thiếu: nguồn lead từ landing page và lead thật tạo từ form | Chưa chạy |
| LP06-S04-TC002 | Tách dữ liệu giữa hai tổ chức | P0 | Lead của ORG-A. Token ORG-B-OWNER. | 1. ORG-B gọi `GET /leads` và tìm lead của ORG-A.<br>2. ORG-B gọi `GET /leads/<id>` bằng id lead của A. | Không thấy lead. Truy cập theo id trả 404. Xem F03 và F13. | Chưa có | Chưa chạy |
| LP06-S04-TC003 | Nguồn lead tự tạo khi chưa có | P1 | Tổ chức mới chưa từng nhận lead từ landing page. | 1. Gửi lead đầu tiên.<br>2. Xem danh sách nguồn lead của tổ chức. | Có nguồn `landing_page` tên "Landing Page", `isActive = true`. | Chưa có | Chưa chạy |
| LP06-S04-TC004 | Nguồn lead bị tắt được bật lại | P2 | Nguồn `landing_page` của tổ chức A đang `isActive = false`. | 1. Gửi lead mới. | Lead tạo thành công và nguồn được bật lại (`isActive = true`). | Chưa có | Chưa chạy |
| LP06-S04-TC005 | Cấu hình CRM của khối form | P1 | Khối LeadForm cấu hình `crm`: pipeline, giai đoạn, người phụ trách, tự phân công, thẻ. | 1. Gửi form ở khối đó.<br>2. Xem lead. | Lead nằm đúng pipeline/giai đoạn, được gán người phụ trách (hoặc tự phân công), có thẻ gồm slug trang và thẻ cấu hình (`mergeLeadFormTags`). | Chưa có | Chưa chạy |
| LP06-S04-TC006 | Lead gắn đúng trang | P1 | Hai trang P1 và P2 cùng tổ chức, đều có form. | 1. Gửi lead qua P1 và qua P2 (dữ liệu khác).<br>2. Lọc lead theo trang. | Lead 1 gắn `landingPageId = P1`, lead 2 gắn `P2`. Chỉ số lead theo trang trong `/landing-pages/analytics` (LP08) khớp. | Chưa có | Chưa chạy |
| LP06-S04-TC007 | Điểm lead tăng khi gửi form | P2 | Tổ chức có luật chấm điểm cho sự kiện form. | 1. Gửi lead.<br>2. Xem điểm lead. | Điểm theo luật `FORM_SUBMITTED`. Nếu chấm điểm lỗi, lead vẫn được tạo (lỗi chỉ ghi log). | Chưa có | Chưa chạy |
| LP06-S04-TC008 | Xuất lead cho khách agency | P2 | Mẫu agency có xuất lead cho khách. | 1. Xuất lead theo chức năng của mẫu agency. | Tệp xuất đúng định dạng, đúng tổ chức. | Một phần: `scripts/test-landing-page-agency-client-export.cjs` kiểm: renderer/client không gọi `isAgencyPortfolioStandard` từ barrel CJS gây lỗi builder (khoảng 6 dòng kiểm). Thiếu: nội dung và định dạng tệp xuất | Chưa chạy |

## LP06-S05. Theo dõi sự kiện trang công khai

**Mục tiêu:** Sự kiện xem trang, bấm CTA, bắt đầu form được ghi đúng, chống lạm dụng.

**Căn cứ:** `trackPublicEvent` và `TrackLandingPageEventDto`; giao diện `track(...)` trong `public-landing-page-client.tsx`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S05-TC001 | Ghi sự kiện xem trang | P1 | Trang PUBLISHED. | 1. Mở `/p/<slug>`.<br>2. Xem `landingPageEvent` hoặc analytics. | Có sự kiện `PAGE_VIEW` kèm `visitorId`, `device`, UTM nếu có. | Chưa có | Chưa chạy |
| LP06-S05-TC002 | Ghi sự kiện bấm CTA và bắt đầu form | P1 | Trang có nút CTA và form. | 1. Bấm nút CTA.<br>2. Nhấp vào ô đầu tiên của form. | Có `CTA_CLICK` (kèm `meta.blockId` hoặc `href`) và `FORM_START`. | Chưa có | Chưa chạy |
| LP06-S05-TC003 | eventType không hợp lệ | P1 | Trang PUBLISHED. | 1. `POST /landing-pages/public/<slug>/events` body `{"eventType":"HACK"}`. | 400 do `IsIn(EVENT_TYPES)`. Không ghi sự kiện. | Chưa có | Chưa chạy |
| LP06-S05-TC004 | Gửi form tạo sự kiện lặp (LP06-F5) | P1 | Trang có form, không có sự kiện trước đó. | 1. Gửi form thành công.<br>2. Đếm sự kiện `FORM_SUBMIT` và `LEAD` của trang. | Ghi lại số thực tế: server ghi 1 `FORM_SUBMIT` và 1 `LEAD`, trình duyệt gửi thêm 1 `FORM_SUBMIT`, tổng `FORM_SUBMIT` = 2. Báo nếu khác kỳ vọng sản phẩm. | Chưa có | Chưa chạy |
| LP06-S05-TC005 | Giới hạn tần suất sự kiện | P2 | Một IP và một trang. | 1. Gửi 121 sự kiện trong 1 phút cho một trang.<br>2. Gửi 241 sự kiện trong 1 phút tổng cộng. | Sự kiện thứ 121 (cùng trang) và thứ 241 (tổng) báo "Quá nhiều sự kiện tracking". | Chưa có | Chưa chạy |
| LP06-S05-TC006 | Sự kiện honeypot | P2 | Trang PUBLISHED. | 1. Gửi sự kiện có `website` khác rỗng. | `{ok:true, skipped:true, reason:'spam'}`, không ghi sự kiện. | Chưa có | Chưa chạy |
| LP06-S05-TC007 | Sự kiện cho trang chưa xuất bản | P1 | Trang DRAFT. | 1. Gửi sự kiện `PAGE_VIEW`. | 404 "Landing page không tồn tại". | Chưa có | Chưa chạy |
| LP06-S05-TC008 | Khách giả sự kiện LEAD | P1 | Trang PUBLISHED. | 1. Gửi trực tiếp `eventType: "LEAD"` tới `/events`, 20 lần. | Ghi lại: server cho phép (kể cả `LEAD`, `FORM_SUBMIT`) nên khách có thể làm sai lệch analytics trong giới hạn tần suất. Báo rủi ro nếu cần chặn (LP08). | Chưa có | Chưa chạy |

## LP06-S06. Trạng thái trang, bản xem trước và định danh tổ chức

**Mục tiêu:** Chỉ trang đã xuất bản nhận lead, và lead về đúng tổ chức.

**Căn cứ:** `resolvePublishedPage` (lọc `status = PUBLISHED`, sắp theo `publishedAt` giảm dần), tham số truy vấn `organizationId`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S06-TC001 | Trang đã hủy xuất bản không nhận lead | P0 | Trang đã gỡ xuất bản (LP05-S06). | 1. `POST /landing-pages/public/<slug>/lead` body hợp lệ. | 404 "Landing page không tồn tại". Không tạo lead. Khách đang mở trang cũ khi gửi form thấy thông báo lỗi chung. | Chưa có | Chưa chạy |
| LP06-S06-TC002 | Trang nháp chưa từng xuất bản | P1 | Trang DRAFT. | 1. Gửi lead. | 404. | Chưa có | Chưa chạy |
| LP06-S06-TC003 | Trang đã lưu trữ | P2 | Trang ARCHIVED. | 1. Gửi lead. | 404 (trạng thái không phải PUBLISHED). | Chưa có | Chưa chạy |
| LP06-S06-TC004 | Slug không tồn tại | P2 | Slug `khong-co-trang-nay`. | 1. Gửi lead. | 404. | Chưa có | Chưa chạy |
| LP06-S06-TC005 | Slug trùng giữa hai tổ chức (LP06-F6) | P0 | Dữ liệu thử: hai trang cùng slug `dup-slug` ở ORG-A và ORG-B, cùng PUBLISHED (tạo trực tiếp trong DB test). | 1. Gửi lead tới `/landing-pages/public/dup-slug/lead` không kèm `organizationId`.<br>2. Gửi tiếp kèm `?organizationId=<A>` rồi `?organizationId=<B>`. | Không kèm tham số: lead vào tổ chức của trang xuất bản mới nhất. Kèm tham số: vào đúng tổ chức được chỉ định. Ghi lại để xác nhận nguy cơ nhầm tổ chức (LP06-F6). | Chưa có | Chưa chạy |
| LP06-S06-TC006 | Form khi chuyển renderer của trang cũ | P1 | Trang cũ đã xuất bản trước thay đổi renderer. | 1. Mở `/p/<slug>` của trang cũ.<br>2. Gửi form. | Form hiển thị và gửi được. Lead đúng tổ chức. Không lỗi client. | Chưa có | Chưa chạy |
| LP06-S06-TC007 | Mất mạng khi gửi form | P1 | Trang PUBLISHED, mở `/p/<slug>`. | 1. Điền form.<br>2. Bật offline và bấm gửi.<br>3. Tắt offline và gửi lại. | Khi offline: hiện lỗi "Không gửi được. Thử lại." (hoặc thông báo tương đương), dữ liệu form còn nguyên. Sau khi có mạng: gửi thành công một lần, không tạo lead trùng. | Chưa có | Chưa chạy |

## LP06-S07. Hiển thị form, theo ngành và responsive

**Mục tiêu:** Form đúng trường theo ngành và ổn định ở mọi khung hình.

**Căn cứ:** Renderer `LandingPageRenderer`, `public-landing-page-client.tsx`. Các kết quả mong đợi về giao diện lấy từ flow gốc và tên các script QA; chưa đọc từng ô trong renderer.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP06-S07-TC001 | Form khóa học không có Công ty/Quy mô | P1 | Mẫu ngành khóa học (education). | 1. Mở `/p/<slug>` của trang tạo từ mẫu khóa học.<br>2. Đọc các trường của form. | Chỉ có các trường phù hợp (tên, liên hệ, nhu cầu). Không có "Công ty" và "Quy mô". | Chưa có | Chưa chạy |
| LP06-S07-TC002 | Form B2B có Công ty | P2 | Mẫu ngành dịch vụ B2B (agency, SaaS). | 1. Mở trang và đọc trường form. | Có trường Công ty nếu mẫu thiết kế như vậy. | Chưa có | Chưa chạy |
| LP06-S07-TC003 | Form trong hero không nhảy vị trí | P1 | Mẫu có form trong hero. | 1. Mở ở 1440, 768 và 390 px.<br>2. Cuộn lên xuống và đợi 5 giây. | Form hiển thị đúng chỗ, không biến mất, không nhảy vị trí khi tải thêm ảnh. | Chưa có | Chưa chạy |
| LP06-S07-TC004 | Form không tràn ngang | P1 | Mẫu có form. | 1. Mở ở 390 px rộng, đo `document.documentElement.scrollWidth`. | Không có cuộn ngang. Ô nhập đủ lớn để chạm (cao tối thiểu khoảng 40 px). | Một phần: `scripts/qa-landing-page-catalog-responsive.cjs` kiểm: smoke 20 danh mục × 3 khung (không có assert, chỉ chụp/đo). Thiếu: đo cuộn ngang và kích thước ô nhập | Chưa chạy |
| LP06-S07-TC005 | Thông báo lỗi và thành công hiển thị | P1 | Trang PUBLISHED. | 1. Gửi form thiếu SĐT và email (API trả 400).<br>2. Gửi form hợp lệ. | Lỗi: hiện thông báo lỗi từ server, không hiện "Cảm ơn". Thành công: hiện "Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm." (trừ mẫu agency không hiện thông báo này). | Một phần: `scripts/test-landing-page-public-lead.ts` kiểm: diễn giải phản hồi thành công/thất bại/rỗng. Thiếu: hiển thị thật trong trang | Chưa chạy |
| LP06-S07-TC006 | Bàn phím và hỗ trợ truy cập | P2 | Trang có form. | 1. Dùng Tab để đi qua các ô.<br>2. Bấm Enter để gửi.<br>3. Dùng trình đọc màn hình đọc nhãn. | Thứ tự Tab hợp lý, Enter gửi được, mỗi ô có nhãn. | Chưa có | Chưa chạy |
| LP06-S07-TC007 | Tự điền của trình duyệt | P2 | Trình duyệt có dữ liệu tự điền. | 1. Dùng tự điền cho tên, email, SĐT. | Giá trị tự điền được gửi đúng (sự kiện thay đổi được kích hoạt). | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `submitPublicLead`, `LeadsService.create` hoặc `ensureLeadSource`: chạy S01, S02, S04 và smoke SMOKE-5.
- Sửa chống spam hoặc giới hạn tần suất: chạy S03.
- Sửa `trackPublicEvent` hoặc `track()` ở trang công khai: chạy S05 và LP08.
- Sửa `resolvePublishedPage`, xuất bản/gỡ xuất bản (LP05) hoặc `uniqueSlug` (LP01): chạy S06.
- Sửa renderer form hoặc mẫu: chạy S07 và LP12.
- SMOKE-5 phải chạy sau SMOKE-4 (trang công khai đang hiển thị) trên cùng `PAGE-SMOKE`.
