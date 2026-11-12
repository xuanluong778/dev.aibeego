# LP10: AI trong builder (viết lại, Page Doctor, hồ sơ doanh nghiệp) - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP10-ai-trong-builder.md](../flows/LP10-ai-trong-builder.md). Mức ưu tiên flow: P2. Route giao diện: `/landing-pages/builder/[id]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** AI viết lại tại chỗ (inline), hồ sơ doanh nghiệp và áp vào trang, Page Doctor. Tạo trang bằng AI ở LP01.

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `suggestInlineField`, `getBusinessProfile`, `upsertBusinessProfile`, `applyBusinessProfileToPage`, `runPageDoctor`, `applyPageDoctor`; `apps/api/src/landing-pages/dto/landing-pages.dto.ts`; `LandingPageAiService`; `CreditService.runPaidFeature`. Case gọi nhà cung cấp AI thật tốn credit và không ổn định, chỉ chạy khi chủ động.

**Case liên quan ở flow khác:** F06 (credit AI); F03 (tách tổ chức); LP01-S05 (tạo bằng AI); LP05-F3 (ghi nháp không tăng revision).

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP10-F1 | Page Doctor là **phân tích theo quy tắc** (`analyzeLandingPageHeuristic`), không gọi AI và không trừ credit. Flow gốc ghi điều kiện "đủ credit AI" chung cho cả LP10. Chỉ "AI viết lại tại chỗ" (`suggestInlineField`) trừ 2 credit mỗi lần gọi nhà cung cấp AI. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `runPageDoctor`, `suggestInlineField` (`amount: 2`) | Cần xác nhận chính sách tính phí. Case hết credit chỉ áp dụng cho AI viết lại. | LP10-S01-TC007, LP10-S03-TC001 |
| LP10-F2 | Khi nhà cung cấp AI lỗi (không phải lỗi thiếu credit), hệ thống chuyển sang gợi ý dự phòng và trả thêm `warning` thay vì báo lỗi. Gợi ý dự phòng và đường bỏ qua OpenAI (nội dung quá ngắn, không có ngữ cảnh) **không trừ credit**. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `suggestInlineField` (`skipOpenAi`, khối `catch`) | Cần xác nhận người dùng thấy rõ đây là gợi ý dự phòng (không phải AI) qua `source: 'fallback'` và `warning`. | LP10-S01-TC006, LP10-S01-TC008 |
| LP10-F3 | `POST /landing-pages/:id/page-doctor/apply` nhận **báo cáo do client gửi** (`report`) và áp các bản vá trong đó, chỉ lọc bỏ vá có đường dẫn hoặc loại khớp `tracking\|domain\|publish\|pixel\|ga4\|metaPixel`. Server không chạy lại phân tích để đối chiếu với `report`. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `applyPageDoctor` | Cần xác nhận rủi ro người gọi API tự soạn bản vá tùy ý lên chính trang của mình (không ảnh hưởng tổ chức khác). | LP10-S03-TC007 |
| LP10-F4 | `apply-business-profile`, `page-doctor/apply` ghi trực tiếp `draftSpec` mà không tăng `clientRevision`; một tab builder đang mở có thể ghi đè các thay đổi đó mà không báo xung đột (xem LP05-F3). | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `applyBusinessProfileToPage`, `applyPageDoctor` | Cần xác nhận builder tự tải lại bản nháp sau khi áp. | LP10-S02-TC010, LP10-S03-TC006 |
| LP10-F5 | `GET /landing-pages/business-profile` **tạo** hồ sơ nếu chưa có (điền từ thông tin tổ chức). Một lệnh GET có tác dụng ghi. | `apps/api/src/landing-pages/landing-pages.service.ts` hàm `getBusinessProfile` | Cần xác nhận chấp nhận được. Khi tổ chức không tồn tại trả 404 "Organization không tồn tại". | LP10-S02-TC001 |

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
| LP10-S01 | AI viết lại tại chỗ (inline AI) | 16 |
| LP10-S02 | Hồ sơ doanh nghiệp và áp vào trang | 13 |
| LP10-S03 | Page Doctor | 14 |
| LP10-S04 | Tạo trang bằng AI và hồ sơ (liên kết với LP01) | 5 |
| | **Tổng** | **48** |

## LP10-S01. AI viết lại tại chỗ (inline AI)

**Mục tiêu:** Gợi ý ngắn đúng ngữ cảnh, không tự ghi vào trang, đúng giới hạn tần suất và credit.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `suggestInlineField`, `InlineAiSuggestFieldDto`, `CreditService.runPaidFeature` (2 credit), `shouldSkipOpenAiInlineSuggest`. Các case gọi AI thật chỉ chạy khi chủ động.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP10-S01-TC001 | Gợi ý 3 phương án cho tiêu đề | P0 | Token ORG-A-OWNER, trang T, hồ sơ doanh nghiệp đủ thông tin, đủ credit. Nội dung: `Dịch vụ spa chăm sóc da mặt tại nhà`. | 1. `POST {API}/landing-pages/<T>/ai-suggest-field` body `{"action":"suggest_3","fieldKind":"headline","currentContent":"Dịch vụ spa chăm sóc da mặt tại nhà","blockType":"Hero","pageGoal":"lead"}`. | Thành công, trả 3 gợi ý tiếng Việt (`source: ai`). **Không** ghi gì vào `draftSpec` của T (kiểm bằng `GET` trước và sau). | Một phần: `scripts/test-landing-page-inline-ai.cjs` kiểm: gợi ý theo trường, dự phòng tiếng Việt, kiểm tra schema, không bịa tên người trong lời chứng thực (khoảng 40 dòng kiểm). Thiếu: gọi API thật và đảm bảo không ghi trang | Chưa chạy |
| LP10-S01-TC002 | Chọn đoạn chữ và bấm AI viết lại trong builder | P0 | Builder mở trang T. | 1. Chọn đoạn chữ trong tiêu đề.<br>2. Bấm AI viết lại, chọn một phương án. | Chỉ đoạn được chọn bị thay bằng phương án chọn; phần còn lại giữ nguyên. Chưa chọn thì không đổi. Thay đổi đi vào autosave bình thường. | Một phần: `scripts/test-landing-page-inline-ai.cjs` kiểm: logic gợi ý ở mức dịch vụ và schema. Thiếu: thao tác chọn đoạn và thay thế trên giao diện | Chưa chạy |
| LP10-S01-TC003 | Ngữ cảnh gửi cho AI | P1 | Trang có tiêu đề, đoạn lân cận, khối Execute. | 1. Gọi gợi ý cho một mục thuộc khối con.<br>2. Xem `blockContext` và nội dung gửi tới nhà cung cấp (log). | Ngữ cảnh chỉ gồm khối chứa trường (không lẫn khối khác), có ngành và tiêu đề. Độ dài `blockContext` tối đa 2000 ký tự. | Đã có: `scripts/test-landing-page-inline-ai-context.cjs` kiểm: cô lập ngữ cảnh theo khối và kiểm tra hợp lệ (khoảng 22 dòng kiểm) | Chưa chạy |
| LP10-S01-TC004 | Tất cả action và fieldKind hợp lệ | P1 | Token ORG-A-OWNER. | 1. Gọi với từng `action`: `suggest_3, more_engaging, shorter, clearer, more_conversion, more_professional, more_friendly, fix_spelling, rewrite`.<br>2. Gọi với vài `fieldKind`: `seo.title, headline, ctaLabel, item.question, field.placeholder`. | Tất cả thành công. Mỗi gợi ý phù hợp loại trường (SEO title ngắn gọn, nhãn nút ngắn). | Một phần: `scripts/test-landing-page-inline-ai.cjs` kiểm: schema và dự phòng cho các loại trường. Thiếu: toàn bộ tổ hợp qua HTTP | Chưa chạy |
| LP10-S01-TC005 | Giá trị action hoặc fieldKind sai | P1 | Token ORG-A-OWNER. | 1. Gửi `action: "hack"`.<br>2. Gửi `fieldKind: "x"`.<br>3. Gửi `blockType: "Foo"`, `pageGoal: "x"`. | Cả bốn trả 400 do `IsIn`. Không trừ credit. | Chưa có | Chưa chạy |
| LP10-S01-TC006 | Nội dung quá ngắn dùng gợi ý dự phòng, không tốn credit (LP10-F2) | P1 | Ghi lại số dư credit. Hồ sơ doanh nghiệp trống. | 1. Gọi gợi ý với `currentContent = ""` và không có `blockContext`. | Trả gợi ý dự phòng (`source: fallback`) bằng tiếng Việt. Số dư credit không đổi. | Một phần: `scripts/test-landing-page-inline-ai.cjs` kiểm: "Field-level fallback Vietnamese". Thiếu: kiểm số dư credit | Chưa chạy |
| LP10-S01-TC007 | Trừ credit cho mỗi lần gọi AI (LP10-F1) | P0 | Đủ credit. Hồ sơ doanh nghiệp có thông tin. Số dư ban đầu N. | 1. Gọi gợi ý với nội dung đủ dài.<br>2. Xem số dư và sổ cái credit. | Số dư giảm 2 credit (giá trị mặc định, có thể bị bảng giá `CreditFeaturePricing` ghi đè). Có một mục sổ cái có `referenceId` dạng `lp.inline-ai:<pageId>:<userId>:<uuid>` và `reason` "Landing page field AI suggest". Xem F06. | Chưa có | Chưa chạy |
| LP10-S01-TC008 | Nhà cung cấp AI lỗi: dự phòng kèm cảnh báo, không trừ credit (LP10-F2) | P1 | Giả lập AI lỗi (khóa API sai). | 1. Gọi gợi ý nội dung đủ dài. | Trả gợi ý dự phòng kèm `warning`. Số dư không đổi (credit được hoàn hoặc không bị trừ). | Chưa có | Chưa chạy |
| LP10-S01-TC009 | Hết credit | P0 | Tổ chức có 0 credit. | 1. Gọi gợi ý nội dung đủ dài.<br>2. Trong builder bấm AI viết lại. | API trả lỗi thiếu credit (không trả gợi ý dự phòng). Builder hiện thông báo rõ và đường dẫn nạp credit nếu có; **trang không bị hỏng**, nội dung đang chọn giữ nguyên. Thông báo nguyên văn do `CreditService` (chưa đọc), ghi lại khi chạy. | Chưa có | Chưa chạy |
| LP10-S01-TC010 | Giới hạn 20 lần mỗi phút mỗi người | P2 | Nội dung khác nhau mỗi lần để tránh chặn trùng. | 1. Gửi 21 yêu cầu trong 1 phút. | Yêu cầu thứ 21 báo "Quá nhiều yêu cầu AI field — thử lại sau 1 phút". Chạy riêng. (Giới hạn tổ chức: 80 lần/phút với thông báo "Tổ chức đang gửi quá nhiều AI field — thử lại sau".) | Chưa có | Chưa chạy |
| LP10-S01-TC011 | Chống gửi trùng trong 3 giây | P1 | Cùng trang, cùng `action`, cùng `fieldKind`, cùng nội dung. | 1. Gửi hai lần trong vòng 3 giây. | Lần hai báo "Đang xử lý — tránh gửi trùng". Chỉ trừ credit một lần. | Chưa có | Chưa chạy |
| LP10-S01-TC012 | Không dùng hồ sơ doanh nghiệp khi tắt | P2 | Hồ sơ có nội dung đặc trưng. | 1. Gọi với `useBusinessProfile: false`.<br>2. Gọi với `useBusinessProfile` không gửi. | Tắt: gợi ý không dùng dữ liệu hồ sơ. Không gửi: mặc định dùng (nếu hồ sơ không trống). | Chưa có | Chưa chạy |
| LP10-S01-TC013 | Trang của tổ chức khác | P0 | Token ORG-B-OWNER, trang của ORG-A. | 1. Gọi gợi ý cho trang đó. | 404 "Landing page không tồn tại". Không trừ credit của ORG-B. Hồ sơ của ORG-A không bị đọc. Xem F03. | Chưa có | Chưa chạy |
| LP10-S01-TC014 | Người chỉ xem không gọi được | P0 | Token ORG-A-VIEWER. | 1. Gọi gợi ý. | 403 (cần `lead.write`). Không trừ credit. | Chưa có | Chưa chạy |
| LP10-S01-TC015 | Nội dung dài và ký tự đặc biệt | P2 | Token ORG-A-OWNER. | 1. Gửi `currentContent` 4000 ký tự rồi 4001 ký tự.<br>2. Gửi nội dung chứa `<script>` và dấu ngoặc. | 4000: thành công. 4001: 400. Gợi ý không chứa thẻ script, không lặp nguyên văn mã độc. | Chưa có | Chưa chạy |
| LP10-S01-TC016 | Gợi ý sai ngôn ngữ | P2 | Nội dung tiếng Việt. | 1. Gọi gợi ý nhiều lần. | Gợi ý bằng tiếng Việt. Nếu lệch sang tiếng Anh thì ghi nhận (AI không cố định), kiểm tra yêu cầu ngôn ngữ trong lời nhắc. | Chưa có | Chưa chạy |

## LP10-S02. Hồ sơ doanh nghiệp và áp vào trang

**Mục tiêu:** Hồ sơ lưu đúng, áp vào trang không ghi đè nội dung người dùng bừa bãi.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `getBusinessProfile`, `upsertBusinessProfile`, `applyBusinessProfileToPage`; `UpsertBusinessProfileDto`, `ApplyBusinessProfileDto`; `applyBusinessProfileToSpec`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP10-S02-TC001 | Đọc hồ sơ lần đầu tự tạo từ thông tin tổ chức (LP10-F5) | P1 | Tổ chức mới chưa có hồ sơ, có tên, điện thoại, email, địa chỉ. | 1. `GET {API}/landing-pages/business-profile`. | Trả hồ sơ với `brandName`, `companyName`, `hotline`, `email`, `address` điền từ tổ chức (tên cắt 120/160 ký tự), `isEmpty` tính theo các trường chính. Hồ sơ được tạo trong DB. | Chưa có | Chưa chạy |
| LP10-S02-TC002 | Cập nhật hồ sơ | P0 | Token ORG-A-OWNER. | 1. `PATCH /landing-pages/business-profile` với `productService`, `targetCustomer`, `usp`, `hotline`, `email`, `brandColor`.<br>2. `GET` lại. | Giá trị lưu đúng. `isEmpty = false` nếu có trường chính. | Chưa có | Chưa chạy |
| LP10-S02-TC003 | Làm sạch và giới hạn trường hồ sơ | P1 | Token ORG-A-OWNER. | 1. Gửi `brandName: "<b>Spa</b> "` và `description` 4001 ký tự, `usp` 801 ký tự, `hotline` 41 ký tự. | `brandName` thành `bSpa/b` hoặc `Spa` (bỏ `<` `>` và cắt khoảng trắng). Các trường vượt giới hạn trả 400 do `MaxLength`. | Chưa có | Chưa chạy |
| LP10-S02-TC004 | Xóa một trường hồ sơ | P2 | Hồ sơ đã có `website`. | 1. `PATCH` với `website: "   "`. | `website` thành rỗng (`null`). Các trường không gửi giữ nguyên. | Chưa có | Chưa chạy |
| LP10-S02-TC005 | Áp hồ sơ vào trang | P0 | Hồ sơ đầy đủ; trang T có nội dung mặc định. | 1. `POST /landing-pages/<T>/apply-business-profile` body `{"pageGoal":"lead"}`. | Trang cập nhật liên hệ, tên thương hiệu, USP, SEO theo hồ sơ. Trả trang đã cập nhật. | Một phần: `scripts/test-landing-page-business-profile.cjs` kiểm: tự điền từ hồ sơ vào bản nháp, giữ siêu dữ liệu sau làm sạch (khoảng 35 dòng kiểm). Thiếu: gọi qua HTTP | Chưa chạy |
| LP10-S02-TC006 | Áp hồ sơ rồi sửa bằng tay và áp lại, không ép | P0 | Trang T đã áp hồ sơ. Người dùng sửa tiêu đề thành `Tiêu đề của tôi`. | 1. Áp hồ sơ lại với `force` không gửi hoặc `false`. | Tiêu đề `Tiêu đề của tôi` giữ nguyên. Chỉ trường còn trống hoặc mặc định được điền. | Đã có: `scripts/test-landing-page-business-profile.cjs` kiểm: "User override then profile apply without force keeps user text" | Chưa chạy |
| LP10-S02-TC007 | Áp hồ sơ với force | P1 | Như trên. | 1. Áp với `force: true`. | Ghi đè các trường theo hồ sơ. Cần xác nhận giao diện có cảnh báo trước khi ép. | Chưa có | Chưa chạy |
| LP10-S02-TC008 | Hồ sơ trống | P0 | Hồ sơ không có trường chính nào. | 1. `POST /apply-business-profile`. | 400 với `code: BUSINESS_PROFILE_EMPTY`, `message: "Chưa có thông tin doanh nghiệp — hãy bổ sung Business Profile trước"`. Trang không đổi. | Chưa có | Chưa chạy |
| LP10-S02-TC009 | Áp hồ sơ vào trang đã lưu trữ | P2 | Trang ARCHIVED. | 1. `POST /apply-business-profile`. | 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |
| LP10-S02-TC010 | Builder đang mở khi áp hồ sơ (LP10-F4) | P1 | Tab 1 mở T. Tab 2 gọi áp hồ sơ. | 1. Sửa tiêu đề ở tab 1 và chờ autosave. | Ghi lại: theo code, autosave tab 1 được chấp nhận và có thể ghi đè thay đổi do áp hồ sơ. Báo để xác nhận. | Chưa có | Chưa chạy |
| LP10-S02-TC011 | Tổ chức khác không đọc hoặc sửa hồ sơ | P0 | Token ORG-B-OWNER. | 1. `GET /business-profile` và `PATCH`. | Chỉ thấy và sửa hồ sơ của ORG-B (khóa theo `organizationId` của người gọi). Xem F03. | Chưa có | Chưa chạy |
| LP10-S02-TC012 | Người chỉ xem | P1 | Token ORG-A-VIEWER. | 1. `GET /business-profile`, `PATCH /business-profile`. | GET: 200. PATCH: 403. | Chưa có | Chưa chạy |
| LP10-S02-TC013 | Màu thương hiệu thay đổi theme | P2 | Hồ sơ có `brandColor`. | 1. Áp hồ sơ.<br>2. Xem theme và màu trang. | Theme/màu cập nhật theo màu thương hiệu (nếu hàm áp dụng làm vậy). Ghi lại màu thực tế. | Chưa có | Chưa chạy |

## LP10-S03. Page Doctor

**Mục tiêu:** Kiểm tra trang, đề xuất vá, áp dụng an toàn và hoàn tác được.

**Căn cứ:** `apps/api/src/landing-pages/landing-pages.service.ts` hàm `runPageDoctor`, `applyPageDoctor`, `restorePageVersion`; `ApplyPageDoctorDto`; `analyzeLandingPageHeuristic`, `applyLandingPageDoctorPatches`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP10-S03-TC001 | Chạy Page Doctor | P0 | Trang T có vài lỗi (thiếu CTA, tiêu đề dài, ảnh thiếu alt). | 1. `POST /landing-pages/<T>/page-doctor`. | Trả `report` có `overallScore` và danh sách vá (`patches`). Không đổi trang. Không trừ credit (LP10-F1). | Một phần: `scripts/test-landing-page-doctor-gates.cjs` kiểm: bộ cổng kiểm tra Page Doctor/AI Apply cho sản xuất (khoảng 18 dòng kiểm, gồm SSRF IPv6). Thiếu: gọi HTTP và nội dung báo cáo cụ thể | Chưa chạy |
| LP10-S03-TC002 | Áp dụng đề xuất đã chọn | P0 | Báo cáo từ TC001. | 1. Chọn 2 đề xuất và `POST /page-doctor/apply` với `selectedPatchIds`, `report`, `idempotencyKey`. | Trang cập nhật đúng 2 vá. Trả trang kèm `undoVersion` và `canUndo: true`. Có phiên bản "page-doctor-before-apply\|v=<n>\|patches=..." chứa bản trước khi áp. | Một phần: `scripts/test-landing-page-doctor-gates.cjs` kiểm: cổng áp dụng (toàn-hoặc-không, idempotent). Thiếu: kiểm tra qua HTTP | Chưa chạy |
| LP10-S03-TC003 | Hoàn tác bằng phiên bản | P0 | Sau TC002. | 1. `POST /versions/<undoVersion>/restore`.<br>2. Đọc nháp. | Nháp về lại nội dung trước khi áp. Có phiên bản bảo vệ mới (LP05-S07). Trang công khai không đổi. | Chưa có | Chưa chạy |
| LP10-S03-TC004 | Không chọn đề xuất nào | P1 | Token ORG-A-OWNER. | 1. Apply với `selectedPatchIds: []`. | 400 với `code: NO_PATCHES`, `message: "Chọn ít nhất 1 đề xuất để Apply"`. | Chưa có | Chưa chạy |
| LP10-S03-TC005 | Báo cáo hỏng | P1 | Token ORG-A-OWNER. | 1. Apply với `report: {"x":1}`. | 400 với `code: AI_MALFORMED`, `message: "Report Page Doctor không hợp lệ — không Apply. Bản nháp không đổi."`. Nháp không đổi. | Chưa có | Chưa chạy |
| LP10-S03-TC006 | Áp dụng lặp với cùng khóa không nhân đôi | P0 | Cùng `idempotencyKey` trong 15 phút. | 1. Gửi Apply hai lần liên tiếp. | Lần hai trả lại kết quả lần một. Chỉ có một phiên bản bảo vệ, không áp hai lần (LP10-F4 về revision: ghi lại). | Một phần: `scripts/test-landing-page-doctor-gates.cjs` kiểm: cổng `IDEMPOTENT_APPLY` (DTO có `idempotencyKey` và dùng bản đồ chống trùng) và gửi `idempotencyKey` khi áp. Thiếu: kiểm lần gọi lặp trả kết quả cũ, không nhân đôi phiên bản | Chưa chạy |
| LP10-S03-TC007 | Vá nhắm vào theo dõi, tên miền, xuất bản bị loại (LP10-F3) | P0 | Báo cáo tự soạn có vá với `path` `trackingConfig.ga4MeasurementId`, `kind` `publish`. | 1. Apply các vá đó. | Các vá khớp `tracking\|domain\|publish\|pixel\|ga4\|metaPixel` bị lọc bỏ, không áp. Trang công khai và cấu hình theo dõi không đổi. | Một phần: `scripts/test-landing-page-doctor-gates.cjs` kiểm: cổng an toàn của vá. Thiếu: tình huống soạn tay qua HTTP | Chưa chạy |
| LP10-S03-TC008 | Nhiều hơn 20 đề xuất | P2 | Chọn 25 `selectedPatchIds`. | 1. Apply. | Chỉ 20 id đầu được xét (`slice(0, 20)`). Ghi lại. | Chưa có | Chưa chạy |
| LP10-S03-TC009 | Giới hạn 15 lần mỗi phút | P2 | Một người dùng. | 1. Chạy Page Doctor 16 lần trong 1 phút. | Lần 16 báo "Quá nhiều lần Page Doctor — thử lại sau". | Chưa có | Chưa chạy |
| LP10-S03-TC010 | Trang rất dài | P2 | Trang 60 section. | 1. Chạy Page Doctor. | Hoàn tất trong thời gian hợp lý (ghi số đo), không lỗi 500. | Chưa có | Chưa chạy |
| LP10-S03-TC011 | Page Doctor trên trang đã lưu trữ | P2 | Trang ARCHIVED. | 1. Chạy Page Doctor.<br>2. Apply. | Chạy được (chỉ đọc). Apply: 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |
| LP10-S03-TC012 | Trang của tổ chức khác và quyền | P0 | ORG-B-OWNER và ORG-A-VIEWER. | 1. ORG-B chạy Page Doctor trên trang ORG-A.<br>2. ORG-A-VIEWER chạy và apply. | ORG-B: 404. VIEWER: 403 cho cả hai (cần `lead.write`). | Chưa có | Chưa chạy |
| LP10-S03-TC013 | Bản vá và an toàn SSRF | P1 | Mã nguồn hiện tại. | 1. Chạy `node scripts/with-root-env.cjs node scripts/test-landing-page-doctor-gates.cjs`. | Các cổng quan trọng đều PASS trước khi triển khai (tệp ghi "Critical gates must PASS before production deploy"). | Đã có: `scripts/test-landing-page-doctor-gates.cjs` kiểm: bộ cổng sản xuất Page Doctor/AI Apply, gồm dải IPv6 và IP riêng | Chưa chạy |
| LP10-S03-TC014 | Phân tích URL và Page Doctor chung | P1 | Mã nguồn hiện tại. | 1. Chạy `node scripts/test-landing-page-url-doctor.cjs`. | PASS các nhóm: bảo mật/SSRF, trích tóm tắt URL, Page Doctor (khoảng 31 dòng kiểm). | Đã có: `scripts/test-landing-page-url-doctor.cjs` kiểm: SSRF, trích tóm tắt, Page Doctor | Chưa chạy |

## LP10-S04. Tạo trang bằng AI và hồ sơ (liên kết với LP01)

**Mục tiêu:** AI không phá nội dung người dùng; lỗi AI không làm hỏng trang.

**Căn cứ:** Liên quan LP01-S05 (tạo bằng AI).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP10-S04-TC001 | AI không ghi đè trường người dùng sửa | P0 | Trang có tiêu đề do người dùng sửa. | 1. Sinh lại AI vào chính trang đó (`landingPageId`). | Tiêu đề người dùng giữ nguyên. | Đã có: `scripts/test-landing-page-business-profile.cjs` kiểm: "AI regenerate preserves user fields" | Chưa chạy |
| LP10-S04-TC002 | Gợi ý không bịa lời chứng thực thật | P1 | Khối lời chứng thực rỗng. | 1. Gọi AI viết cho trường `item.quote`, `item.author`. | Dùng chỗ giữ (placeholder), không bịa tên người thật và coi như sự thật. | Đã có: `scripts/test-landing-page-inline-ai.cjs` kiểm: "Testimonials must not invent real names as facts — placeholders" | Chưa chạy |
| LP10-S04-TC003 | AI trả dữ liệu sai cấu trúc | P1 | Giả lập AI trả JSON hỏng. | 1. Sinh bản nháp hoặc gợi ý. | Hệ thống dùng dự phòng/bỏ qua, nháp không hỏng. Dữ liệu qua kiểm tra schema. | Một phần: `scripts/test-landing-page-inline-ai.cjs` kiểm: "Schema validate". Thiếu: đường lỗi nhà cung cấp | Chưa chạy |
| LP10-S04-TC004 | Rò rỉ dữ liệu giữa tổ chức qua hồ sơ | P0 | Hai tổ chức có hồ sơ khác nhau. | 1. ORG-A gọi gợi ý/áp hồ sơ.<br>2. Kiểm tra nội dung chứa thông tin ORG-B hay không. | Không có thông tin của tổ chức khác trong gợi ý hoặc trang. | Chưa có | Chưa chạy |
| LP10-S04-TC005 | Ghi nhật ký sử dụng AI | P2 | Gọi gợi ý. | 1. Xem log API. | Có bản ghi `lp_inline_ai_usage` ghi tổ chức, người dùng, loại trường, thời gian, nguồn. Không ghi nội dung nhạy cảm đầy đủ. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `suggestInlineField`, lời nhắc AI hoặc bảng giá credit: chạy S01 và F06.
- Sửa hồ sơ doanh nghiệp hoặc `applyBusinessProfileToSpec`: chạy S02, S04.
- Sửa Page Doctor hoặc `applyLandingPageDoctorPatches`: chạy S03.
- Sửa lưu phiên bản hoặc revision (LP05): chạy S03-TC003 và S02-TC010.
