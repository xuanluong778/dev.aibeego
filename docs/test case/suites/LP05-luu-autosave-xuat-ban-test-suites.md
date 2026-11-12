# LP05: Lưu, autosave, lịch sử, khôi phục, xuất bản - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP05-luu-autosave-xuat-ban.md](../flows/LP05-luu-autosave-xuat-ban.md). Mức ưu tiên flow: P0. Route giao diện: `/landing-pages/builder/[id]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** lưu bản nháp (autosave và lưu thủ công), phát hiện xung đột, khôi phục bản nháp cục bộ, xuất bản, gỡ xuất bản, lịch sử phiên bản. Không gồm nội dung được chỉnh sửa (LP03, LP04) hay hiển thị công khai (LP07).

**Căn cứ code:** `apps/api/src/landing-pages/landing-pages.service.ts` (hàm `autosave`, `recoverDraft`, `publish`, `unpublish`, `listPageVersions`, `getPageVersion`, `restorePageVersion`); `apps/api/src/landing-pages/landing-page-revision.ts` (`decideLandingPageAutosave`, `publishRevisionAllowed`); `apps/api/src/landing-pages/landing-page-autosave-receipt.ts`; `apps/web/src/components/landing-pages/landing-page-builder.tsx` (hẹn giờ 1200 ms, ghi cục bộ 400 ms, timeout 20 giây, thông báo `setSaveMsg`); `apps/web/src/app/api/landing-pages/revalidate/route.ts`. Thông báo lỗi lấy nguyên văn từ code.

**Case liên quan ở flow khác:** F03 (phân quyền, tách tổ chức) cho LP05-S08; F13 (lead) không liên quan trực tiếp; F52 (trang công khai) cho LP05-S05-TC001 và S06.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP05-F1 | Autosave bị từ chối vì bản cũ **không trả lỗi HTTP**. API trả thành công kèm `rejected: true`, `reason: 'STALE_REVISION'` và `clientRevision` của server. Builder đọc cờ này để vào trạng thái xung đột. | apps/api/src/landing-pages/landing-pages.service.ts hàm `autosave` (nhánh `decision.action === 'reject'`); apps/web/src/components/landing-pages/landing-page-builder.tsx dòng đọc `res.rejected` | Flow gốc ghi "bị từ chối". Cần hiểu là từ chối ở tầng dữ liệu, không phải mã lỗi. Người gọi API trực tiếp phải kiểm `rejected`. | LP05-S01-TC004, LP05-S03-TC001 |
| LP05-F2 | Lịch sử phiên bản **không** có một mục cho mỗi lần autosave. Phiên bản chỉ được tạo khi: xuất bản (`Publish vN`), khôi phục (`before-restore-vN\|from=M`), áp Page Doctor (`page-doctor-before-apply`), khôi phục bản nháp cục bộ (`before-local-recovery`). Danh sách trả tối đa 50 bản, mới nhất trước. | apps/api/src/landing-pages/landing-pages.service.ts hàm `listPageVersions`, `publish`, `restorePageVersion`, `recoverDraft`, `applyPageDoctor` | Cần xác nhận người dùng không kỳ vọng thấy từng lần lưu trong lịch sử. | LP05-S07-TC001, LP05-S07-TC002 |
| LP05-F3 | Một số thao tác ghi thẳng `draftSpec` mà **không tăng `clientRevision`**: `PATCH /landing-pages/:id` (có `draftSpec`), `apply-business-profile`, `page-doctor/apply`, `generate` có `landingPageId`. Một tab builder đang mở với cùng revision vẫn được autosave chấp nhận và có thể ghi đè các thay đổi này không báo xung đột. | apps/api/src/landing-pages/landing-pages.service.ts hàm `update`, `applyBusinessProfileToPage`, `applyPageDoctor`, `generateAi` (không gọi `decideLandingPageAutosave`) | Cần xác nhận hành vi mong muốn và xem builder có tự tải lại sau các thao tác này không. | LP05-S03-TC006 |
| LP05-F4 | Hủy xuất bản chỉ đổi `status` về `DRAFT`. `publishedSpec` vẫn còn trong database. Trang công khai trả 404 vì truy vấn lọc `status = PUBLISHED`. | apps/api/src/landing-pages/landing-pages.service.ts hàm `unpublish`, `getPublicBySlug` | Khớp mong đợi "ngừng hiển thị". Cần xác nhận việc giữ lại `publishedSpec` là chủ ý (để xuất bản lại nhanh). | LP05-S06-TC001, LP05-S06-TC004 |
| LP05-F5 | Làm mới cache trang công khai do **trình duyệt** gọi `POST /api/landing-pages/revalidate` sau khi xuất bản hoặc gỡ xuất bản từ giao diện. Route này không yêu cầu đăng nhập. Xuất bản/gỡ qua API trực tiếp không làm mới cache, trang công khai (ISR) có thể cũ tới 60 giây. | `apps/web/src/app/api/landing-pages/revalidate/route.ts`; `apps/web/src/app/p/[slug]/page.tsx` (`revalidate = 60`) | Cần xác nhận mức chậm 60 giây khi gọi API trực tiếp là chấp nhận được. Cần đánh giá route revalidate mở không cần xác thực. | LP05-S06-TC002, LP05-S06-TC003, LP05-S06-TC006 |
| LP05-F6 | Xuất bản truyền `clientRevision`: nếu server lớn hơn giá trị client thì 409 `STALE_REVISION`; nếu nhỏ hơn thì 409 `REVISION_NOT_SAVED`. Nếu client không gửi `clientRevision` thì bỏ qua kiểm tra (gọi API "mù" được phép). | apps/api/src/landing-pages/landing-page-revision.ts hàm `publishRevisionAllowed` | Cần xác nhận có muốn bắt buộc `clientRevision` ở API công khai hay không. | LP05-S05-TC004, LP05-S05-TC005, LP05-S05-TC006 |

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
| LP05-S01 | Autosave API: quyết định theo revision | 13 |
| LP05-S02 | Autosave phía builder | 10 |
| LP05-S03 | Xung đột khi sửa ở nhiều tab hoặc nhiều người | 7 |
| LP05-S04 | Mất mạng và khôi phục bản nháp cục bộ | 8 |
| LP05-S05 | Xuất bản | 15 |
| LP05-S06 | Hủy xuất bản và cache trang công khai | 7 |
| LP05-S07 | Lịch sử phiên bản và khôi phục | 11 |
| LP05-S08 | Quyền, tổ chức và trạng thái trang | 6 |
| | **Tổng** | **77** |

## LP05-S01. Autosave API: quyết định theo revision

**Mục tiêu:** `POST /landing-pages/:id/autosave` chấp nhận, bỏ qua hoặc từ chối đúng theo `baseRevision`, `clientRevision`, `requestId`.

**Căn cứ:** `decideLandingPageAutosave` trong `apps/api/src/landing-pages/landing-page-revision.ts`, `LandingPagesService.autosave` (khóa hàng `FOR UPDATE` trong giao dịch), biên nhận `landing-page-autosave-receipt.ts`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S01-TC001 | Lưu lần đầu với baseRevision khớp | P0 | Trang T mới tạo, `draftSpec.meta.clientRevision` là 0 hoặc không có. Token ORG-A-OWNER. Lấy `draftSpec` bằng `GET`. | 1. Sửa tiêu đề trong `draftSpec` thành `AS-01`.<br>2. `POST {API}/landing-pages/<T>/autosave` body `{draftSpec, baseRevision: 0, clientRevision: 1, requestId: "req-0001"}`. | Phản hồi `rejected: false`, `clientRevision: 1`, `requestId: "req-0001"`, có `updatedAt`. `GET` lại thấy tiêu đề `AS-01` và `meta.clientRevision = 1`. | Một phần: `scripts/test-landing-page-revision.ts` kiểm: chính sách revision ở mức mã nguồn (khoảng 18 dòng kiểm). Thiếu: gọi HTTP thật và kiểm dữ liệu sau `GET` | Chưa chạy |
| LP05-S01-TC002 | Lưu tiếp theo, revision tăng đơn điệu | P0 | Sau TC001, revision 1. | 1. Autosave với `baseRevision: 1`, `clientRevision: 2`, `requestId: "req-0002"`, tiêu đề `AS-02`.<br>2. Autosave `baseRevision: 2`, `clientRevision: 3`, `requestId: "req-0003"`. | Cả hai `rejected: false`, revision lần lượt 2 và 3. Tiêu đề cuối `AS-02` hoặc nội dung đã gửi gần nhất. | Chưa có | Chưa chạy |
| LP05-S01-TC003 | Gửi lại đúng request vì mất phản hồi (idempotent) | P0 | Revision 3 từ TC002, đã lưu bằng `requestId: "req-0003"`. | 1. Gửi lại **nguyên văn** body của `req-0003` (cùng draftSpec, base, client, requestId). | `rejected: false`, `clientRevision: 3`. Revision không tăng. Nội dung không đổi. | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "server accepts an exact retry once"; "retry after lost response keeps byte-identical ID and payload" | Chưa chạy |
| LP05-S01-TC004 | Dùng lại requestId với nội dung khác | P0 | Revision 3, `requestId` `req-0003` đã dùng. | 1. Gửi `requestId: "req-0003"` nhưng đổi tiêu đề sang `KHAC`, base 3, client 4. | `rejected: true`, `reason: 'STALE_REVISION'`, `clientRevision: 3`. Dữ liệu và revision trên server không đổi. | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "server rejects same ID with another draft and leaves revision/data untouched" | Chưa chạy |
| LP05-S01-TC005 | Base revision cũ bị từ chối (tab thứ hai) | P0 | Server revision 3. | 1. Autosave với `baseRevision: 2`, `clientRevision: 3`, `requestId` mới, tiêu đề `TAB2`. | `rejected: true`, `reason: 'STALE_REVISION'`, `clientRevision: 3`. Tiêu đề trên server không phải `TAB2`. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "second tab does not overwrite"; test-landing-page-autosave-identity.cjs "two independent tabs never share a save request ID" | Chưa chạy |
| LP05-S01-TC006 | Lưu lại đúng bản đang có không tăng revision | P1 | Server revision 3, nội dung N. | 1. Autosave với `baseRevision: 3`, `clientRevision: 3`, nội dung giống hệt N, `requestId` mới. | `rejected: false`, `clientRevision: 3` (hành động `unchanged`). Revision không tăng. | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "legitimate no-edit flush is unchanged and does not bump revision" | Chưa chạy |
| LP05-S01-TC007 | Cùng revision nhưng nội dung khác | P0 | Server revision 3. | 1. Autosave với `baseRevision: 3`, `clientRevision: 3`, nội dung **khác** N. | `rejected: true`, `reason: 'STALE_REVISION'`. Không thể xác nhận "không đổi" cho nội dung khác. | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "same revision with different content cannot be acknowledged as unchanged" | Chưa chạy |
| LP05-S01-TC008 | Không gửi baseRevision, clientRevision nhỏ hơn server | P1 | Server revision 3. | 1. Autosave không có `baseRevision`, `clientRevision: 2`. | `rejected: true`, `STALE_REVISION`. | Chưa có | Chưa chạy |
| LP05-S01-TC009 | Không gửi baseRevision, clientRevision lớn hơn server | P2 | Server revision 3. | 1. Autosave không có `baseRevision`, `clientRevision: 10`. | Chấp nhận và đặt revision 10 (theo `decideLandingPageAutosave`). Ghi lại; đây là đường cũ, không dùng bởi builder hiện tại. | Chưa có | Chưa chạy |
| LP05-S01-TC010 | Revision không phải số hữu hạn | P2 | Server revision 3. | 1. Gửi `clientRevision: "abc"`.<br>2. Gửi `baseRevision: 1e999`. | Giá trị không hợp lệ bị bỏ qua (coi như không gửi) hoặc 400 do `@Type(()=>Number)`. Ghi lại hành vi thực tế; không được ghi dữ liệu với revision `NaN`. | Chưa có | Chưa chạy |
| LP05-S01-TC011 | Thiếu draftSpec hoặc sai kiểu | P1 | Token ORG-A-OWNER. | 1. Gửi body `{}`.<br>2. Gửi `{"draftSpec": "chuoi"}`.<br>3. Gửi `{"draftSpec": []}`. | Cả ba 400 (`draftSpec` phải là object). Không đổi dữ liệu. | Chưa có | Chưa chạy |
| LP05-S01-TC012 | Tên trang qua autosave | P2 | Server revision 3. | 1. Autosave kèm `name` 120 ký tự rồi 121 ký tự. | 120 ký tự được lưu. 121 ký tự trả 400 (`MaxLength(120)`). | Chưa có | Chưa chạy |
| LP05-S01-TC013 | Autosave cập nhật SEO và theme của bản ghi | P2 | Trang có `spec.seo.title = "SEO-X"` và `spec.theme = "BOLD"`. | 1. Autosave nội dung có `seo.title` mới và theme mới.<br>2. Gọi `GET` trang. | `seoTitle`, `seoDescription`, `theme` của bản ghi khớp spec vừa lưu (cắt 200/500 ký tự). | Chưa có | Chưa chạy |

## LP05-S02. Autosave phía builder

**Mục tiêu:** Builder tự lưu đúng lúc, báo trạng thái đúng và không kẹt.

**Căn cứ:** `apps/web/src/components/landing-pages/landing-page-builder.tsx`: hẹn giờ autosave 1200 ms, ghi cục bộ 400 ms, timeout 20 giây, thông báo `setSaveMsg`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S02-TC001 | Tự lưu sau khi dừng gõ | P0 | Mở builder trang T, mạng bình thường. | 1. Sửa một đoạn văn.<br>2. Dừng thao tác và đo thời gian tới khi hiện thông báo lưu.<br>3. Reload trang. | Sau khoảng 1,2 giây không thao tác, builder gửi autosave (hẹn giờ 1200 ms). Thông báo "Đã lưu <giờ>". Reload thấy nội dung mới. | Một phần: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: chạy callback thật với bộ hẹn giờ giả và mạng giả (khoảng 36 dòng kiểm). Thiếu: chạy trên trình duyệt thật và kiểm dữ liệu sau reload | Chưa chạy |
| LP05-S02-TC002 | Gõ liên tục không gây lưu liên tục | P1 | Mở builder. | 1. Gõ 10 giây liên tục, mỗi phím cách dưới 1 giây.<br>2. Quan sát số request autosave (DevTools). | Không có request nào trong lúc đang gõ liên tục (mỗi phím làm lại bộ hẹn). Chỉ có request sau khi dừng. Con trỏ không nhảy. | Một phần: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: "INLINE_EDIT_NO_VALUE_CARET_LOOP". Thiếu: đếm request thật | Chưa chạy |
| LP05-S02-TC003 | Nút Lưu thủ công | P1 | Có thay đổi chưa lưu. | 1. Bấm nút Lưu. | Hiện "Đang chờ lưu…" nếu đang có lưu khác, sau đó "Đã lưu <giờ>". Nút không bị khóa vĩnh viễn. | Đã có: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: "AUTOSAVE_NO_BUTTON_LOCK"; nút Lưu thật gọi flush trước khi lưu | Chưa chạy |
| LP05-S02-TC004 | Hai lần lưu chồng nhau xếp hàng | P0 | Mạng chậm (giả lập 3 giây). | 1. Sửa A, chờ autosave bắt đầu.<br>2. Trong lúc request chưa xong, sửa B. | Không có hai request đồng thời cho cùng trang. Sau request đầu, một lần lưu tiếp theo mang cả A và B. Kết quả cuối có A và B. | Một phần: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: mutex nối tiếp với mạng giả. Thiếu: mạng chậm thật | Chưa chạy |
| LP05-S02-TC005 | Lưu quá 20 giây thì hủy và báo | P1 | Chặn hoặc làm treo request autosave. | 1. Sửa nội dung.<br>2. Đợi quá 20 giây. | Request bị hủy (AbortController 20 giây). Thông báo "Lưu quá lâu — bấm Lưu để thử lại". Builder vẫn đánh dấu chưa lưu (dirty) và ghi bản nháp cục bộ. | Chưa có | Chưa chạy |
| LP05-S02-TC006 | Lỗi server khi lưu | P1 | Giả lập API trả 500 cho autosave. | 1. Sửa nội dung.<br>2. Quan sát thông báo.<br>3. Khôi phục API và đợi lần lưu kế tiếp. | Hiện thông báo lỗi từ server hoặc "Lưu thất bại". Dữ liệu vẫn ở bản nháp cục bộ. Khi API về lại, lần lưu sau thành công và xóa bản nháp cục bộ. | Chưa có | Chưa chạy |
| LP05-S02-TC007 | Lưu khi vừa thoát trang | P0 | Có thay đổi chưa lưu (còn dưới 1,2 giây). | 1. Đóng tab hoặc chuyển trang ngay sau khi sửa.<br>2. Mở lại builder. | Bản nháp cục bộ được ghi lúc `pagehide`/`beforeunload`. Khi mở lại, builder khôi phục (xem LP05-S04). | Một phần: `scripts/test-landing-page-draft-recovery.ts` kiểm: "exercise local debounce and page-exit effects". Thiếu: đóng tab thật | Chưa chạy |
| LP05-S02-TC008 | Ghi nháp cục bộ sau 400 ms | P2 | Mở builder, có thay đổi. | 1. Sửa nội dung, sau 0,5 giây xem localStorage khóa bản nháp của trang. | Có bản nháp cục bộ gồm `spec`, `baseRevision`, `clientRevision`, `savedAt`. Sau khi server xác nhận lưu, bản nháp cục bộ bị xóa nếu trùng đúng nội dung đã gửi. | Đã có: `scripts/test-landing-page-draft-recovery.ts` kiểm: ghi và xóa nháp cục bộ theo xác nhận (khoảng 34 dòng kiểm) | Chưa chạy |
| LP05-S02-TC009 | Lưu một trang đã lưu trữ | P1 | Trang T chuyển ARCHIVED (xem LP08), builder còn mở. | 1. Sửa nội dung trong builder.<br>2. Quan sát thông báo. | Server trả 400 "Trang đã archive — duplicate để chỉnh sửa". Builder hiện lỗi này, không báo "Đã lưu". | Chưa có | Chưa chạy |
| LP05-S02-TC010 | Lưu khi mất phiên đăng nhập | P1 | Token hết hạn hoặc đăng xuất ở tab khác. | 1. Sửa nội dung trong builder.<br>2. Quan sát. | Hiện lỗi xác thực hoặc chuyển về đăng nhập. Nội dung chưa lưu vẫn còn trong bản nháp cục bộ. Xem F02. | Chưa có | Chưa chạy |

## LP05-S03. Xung đột khi sửa ở nhiều tab hoặc nhiều người

**Mục tiêu:** Không bao giờ ghi đè bản mới hơn một cách im lặng.

**Căn cứ:** `LandingPagesService.autosave` dùng `SELECT ... FOR UPDATE` trong giao dịch; builder dùng `saveConflictRef`, `resolveSaveConflict`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S03-TC001 | Hai tab, tab sau bị từ chối | P0 | Mở cùng trang T ở tab 1 và tab 2 (ORG-A-OWNER), cùng revision R. | 1. Tab 1 sửa tiêu đề thành `TAB1`, chờ "Đã lưu".<br>2. Tab 2 (chưa tải lại) sửa tiêu đề thành `TAB2`, chờ autosave. | Tab 2 hiện "Có người khác vừa lưu bản mới hơn — bấm "Tải bản mới nhất" để tiếp tục". Server giữ `TAB1`. Autosave của tab 2 dừng (không tự thử lại). | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "two real persist callbacks with common server preserve loser local and conflict" | Chưa chạy |
| LP05-S03-TC002 | Tab thua giữ bản của mình ở máy | P0 | Sau TC001. | 1. Kiểm tra localStorage của trang trên tab 2.<br>2. Gõ thêm chữ ở tab 2. | Bản `TAB2` còn trong bản nháp cục bộ. Gõ thêm không làm gửi request autosave nào ("conflict must stop all writes"). | Đã có: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: "conflict must stop all writes"; "STALE_NEVER_FORCE_OVERWRITES" | Chưa chạy |
| LP05-S03-TC003 | Tải bản mới nhất sau xung đột | P0 | Tab 2 đang xung đột. | 1. Bấm "Tải bản mới nhất". | Hiện "Đã tải bản mới nhất từ server — chỉnh sửa chưa lưu trước đó (nếu có) đã bị bỏ qua". Tiêu đề là `TAB1`. Autosave hoạt động lại và lưu được thay đổi mới. | Một phần: `scripts/test-landing-page-draft-recovery.ts` kiểm: quyết định khi tải và giải quyết xung đột. Thiếu: bấm nút thật trên trình duyệt | Chưa chạy |
| LP05-S03-TC004 | Xuất bản bị chặn khi đang xung đột | P0 | Tab 2 đang xung đột. | 1. Bấm Xuất bản ở tab 2. | Hiện "Có bản mới hơn ở nơi khác — bấm "Tải bản mới nhất" trước khi publish". Không gửi `POST /publish`. | Chưa có | Chưa chạy |
| LP05-S03-TC005 | Mất phản hồi sau khi server đã lưu | P1 | Giả lập mất response của autosave (chặn sau khi request tới server). | 1. Tab sửa nội dung, request đến server nhưng phản hồi không về.<br>2. Để builder thử lại. | Builder gửi lại **cùng requestId và cùng payload**. Server nhận lại như idempotent, không báo xung đột giả, revision không tăng thêm. | Đã có: `scripts/test-landing-page-autosave-identity.cjs` kiểm: "response lost after commit"; "A response lost after commit" | Chưa chạy |
| LP05-S03-TC006 | Người khác đổi trang bằng AI/Page Doctor trong lúc tab mở (LP05-F3) | P1 | Tab 1 mở T. Tab 2 chạy Page Doctor Apply (LP10) hoặc `PATCH` có `draftSpec`. | 1. Ở tab 2 áp Page Doctor và ghi.<br>2. Ở tab 1 (không tải lại) sửa chữ và chờ autosave. | Ghi lại: theo code, autosave tab 1 được chấp nhận vì revision không đổi và có thể ghi đè kết quả Page Doctor. Đây là điểm cần xác nhận (LP05-F3). | Chưa có | Chưa chạy |
| LP05-S03-TC007 | Ghi đồng thời hai request lên cùng trang | P0 | Hai script gọi autosave cùng lúc với `baseRevision` giống nhau, nội dung A và B. | 1. Gửi đồng thời hai request. | Đúng một request được chấp nhận. Request còn lại `rejected: true`. Dữ liệu cuối là A hoặc B nguyên vẹn, không trộn lẫn (khóa hàng `FOR UPDATE`). | Chưa có | Chưa chạy |

## LP05-S04. Mất mạng và khôi phục bản nháp cục bộ

**Mục tiêu:** Không mất chỉnh sửa khi mất mạng, đóng tab hoặc sập trình duyệt.

**Căn cứ:** `recoverDraft` trong service, hàm `load` và `writeLocalLandingDraft` trong builder.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S04-TC001 | Khôi phục bản nháp khi server chưa đổi | P0 | Trang T ở revision R. Có bản nháp cục bộ `baseRevision = R` mới hơn server (tạo bằng cách sửa khi offline rồi đóng tab). | 1. Mở lại builder của T. | Hiện "Đã khôi phục bản nháp chưa kịp lưu (mất mạng hoặc đóng tab)". Canvas là bản cục bộ và được lưu lên server sau đó. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "unsaved local draft restores when the server has not moved"; test-landing-page-draft-recovery.ts quyết định khi tải trang (khoảng 34 dòng kiểm) | Chưa chạy |
| LP05-S04-TC002 | Server đã đổi so với bản nháp cục bộ | P0 | Bản nháp cục bộ `baseRevision = R`; trong lúc đó tab khác lưu lên revision R+2. | 1. Mở lại builder. | Hiện "Có bản nháp chưa được xác nhận lưu trên máy này và server đã thay đổi. Bản server đang mở.". Bản cục bộ **không** tự ghi đè server; người dùng chọn khôi phục hay bỏ. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "local draft does not auto-replace a newer server draft"; test-landing-page-draft-recovery.ts "server upgrade must not overwrite recovery storage" | Chưa chạy |
| LP05-S04-TC003 | Chọn khôi phục bản máy | P0 | Sau TC002. | 1. Chọn khôi phục bản trên máy. | Gọi `POST /recover-draft`. Hiện "Đã khôi phục bản máy vào nháp. Bản server trước đó nằm trong lịch sử phiên bản.". Có một phiên bản ghi chú bắt đầu bằng `before-local-recovery\|base=R\|stored=R+2`. Revision mới = max(server, local)+1. | Một phần: `scripts/test-landing-page-draft-recovery.ts` kiểm: luồng khôi phục ở builder. Thiếu: tạo phiên bản bảo vệ trong DB và revision sau khôi phục | Chưa chạy |
| LP05-S04-TC004 | recover-draft khi base khớp | P1 | Revision server R, gửi `baseRevision = R`. | 1. `POST {API}/landing-pages/<T>/recover-draft` với `baseRevision = R` và `draftSpec` bản cục bộ. | Đi theo nhánh autosave thường (không tạo phiên bản bảo vệ). `rejected: false`. | Chưa có | Chưa chạy |
| LP05-S04-TC005 | recover-draft không bao giờ ghi bản đã xuất bản | P0 | Trang đang PUBLISHED với `publishedSpec` S. | 1. Thực hiện recover-draft (base khác server).<br>2. Gọi `GET /landing-pages/public/<slug>`. | Trang công khai vẫn trả S. Chỉ `draftSpec` đổi. | Chưa có | Chưa chạy |
| LP05-S04-TC006 | Nháp cục bộ đã được server xác nhận thì bị xóa | P1 | Đã sửa và thấy "Đã lưu". | 1. Kiểm tra localStorage khóa bản nháp của trang. | Không còn bản nháp cục bộ (hoặc nội dung trùng đã được xóa). | Đã có: `scripts/test-landing-page-draft-recovery.ts` kiểm: xác nhận đúng nội dung/revision mới xóa nháp cục bộ | Chưa chạy |
| LP05-S04-TC007 | Chỉnh sửa tiếp trong lúc đang chờ quyết định khôi phục | P1 | Đang hiện câu hỏi khôi phục. | 1. Gõ thêm ở canvas.<br>2. Thoát trang. | Bản nháp chờ khôi phục được giữ nguyên ("pending local is preserved during edits and exit"), không bị chỉnh sửa mới thay thế. | Đã có: `scripts/test-landing-page-draft-recovery.ts` kiểm: "pending local is preserved during edits and exit" | Chưa chạy |
| LP05-S04-TC008 | Trình duyệt chặn localStorage | P2 | Chặn lưu trữ trình duyệt. | 1. Sửa nội dung và lưu bình thường. | Autosave lên server vẫn hoạt động. Không có lỗi trắng trang. Không khôi phục được khi offline (chấp nhận). | Chưa có | Chưa chạy |

## LP05-S05. Xuất bản

**Mục tiêu:** Xuất bản chỉ phát hành bản đã lưu, đúng revision, và tạo phiên bản.

**Căn cứ:** `LandingPagesService.publish` (giao dịch + khóa hàng, tạo `landingPageVersion`), `publishRevisionAllowed` trong `apps/api/src/landing-pages/landing-page-revision.ts`, hàm `publish()` trong builder.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S05-TC001 | **[SMOKE-3]** Lưu, tải lại và xuất bản trang | P0 | Trang `PAGE-SMOKE` từ SMOKE-1 và SMOKE-2 (có tiêu đề `SMOKE-HEADLINE-20261111` và form lead). ORG-A-OWNER. | 1. Trong builder sửa thêm dòng phụ thành `SMOKE-SUB-20261111`.<br>2. Chờ "Đã lưu", bấm F5 và xác nhận tiêu đề, dòng phụ còn.<br>3. Bấm Xuất bản.<br>4. Đọc thông báo và đường dẫn công khai `/p/<slug>`.<br>5. Gọi `GET {API}/landing-pages/public/<slug>`. | Thông báo "Đã xuất bản thành công". `status = PUBLISHED`, `publishedAt` có giá trị. API công khai trả đúng `SMOKE-HEADLINE-20261111` và `SMOKE-SUB-20261111`. Có phiên bản `Publish v1` trong lịch sử. | Một phần: `scripts/test-landing-page-publish-flush.cjs` kiểm: xuất bản chờ autosave và bản mới nhất (khoảng 27 dòng kiểm). Thiếu: luồng đầy đủ trên môi trường thật với dữ liệu thật | Chưa chạy |
| LP05-S05-TC002 | Xuất bản kèm thay đổi chưa lưu | P0 | Mở builder, vừa sửa tiêu đề (chưa quá 1,2 giây). | 1. Bấm Xuất bản ngay. | Builder lưu hết trước, rồi mới gọi `/publish` với `clientRevision` đã xác nhận. Trang công khai có nội dung vừa sửa. | Đã có: `scripts/test-landing-page-publish-flush.cjs` kiểm: "PASS PUBLISH_LATEST_SPEC / AUTOSAVE_PUBLISH_RACE"; "publish waits for the existing autosave" | Chưa chạy |
| LP05-S05-TC003 | Xuất bản khi đang có autosave chạy | P0 | Mạng chậm 3 giây. | 1. Sửa nội dung để autosave khởi động.<br>2. Bấm Xuất bản trong lúc request chưa xong. | Xuất bản chờ autosave xong rồi lưu thêm phần còn lại, sau đó mới publish. Không phát hành bản thiếu. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "publish waits until autosave lands" | Chưa chạy |
| LP05-S05-TC004 | clientRevision cũ bị từ chối | P0 | Server revision 5. | 1. `POST /publish` body `{"clientRevision": 4}`. | 409 với `code: STALE_REVISION`, `message: "Có bản mới hơn — tải bản mới nhất rồi publish"`, `clientRevision: 5`. Trang không đổi trạng thái. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "publish does not ship another tab" | Chưa chạy |
| LP05-S05-TC005 | clientRevision lớn hơn server | P1 | Server revision 5. | 1. `POST /publish` body `{"clientRevision": 7}`. | 409 với `code: REVISION_NOT_SAVED`, `message: "Bản nháp chưa lưu xong — lưu lại rồi publish"`. | Một phần: `scripts/test-landing-page-revision.ts` kiểm: "publish the saved revision". Thiếu: mã `REVISION_NOT_SAVED` qua HTTP | Chưa chạy |
| LP05-S05-TC006 | Xuất bản không gửi clientRevision (LP05-F6) | P1 | Server revision 5. | 1. `POST /publish` body `{}`. | Thành công, dùng bản nháp đang lưu ("legacy publish uses the stored draft"). | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "legacy publish uses the stored draft" | Chưa chạy |
| LP05-S05-TC007 | Xuất bản không đổi revision khi không sửa gì | P1 | Đã lưu xong, không sửa thêm. | 1. Bấm Xuất bản. | Autosave flush không tăng revision ("publish flush does not bump"). Xuất bản thành công với revision hiện có. | Đã có: `scripts/test-landing-page-revision.ts` kiểm: "publish flush does not bump" | Chưa chạy |
| LP05-S05-TC008 | Nội dung xuất bản sao chép từ bản nháp đã làm sạch | P0 | Nháp có HTML trong chữ, vd `<img onerror=alert(1)>`. | 1. Nhập vào ô văn bản, lưu, xuất bản.<br>2. Mở `/p/<slug>` và xem nguồn HTML. | Không có thẻ hoặc thuộc tính gây chạy script. Spec đã qua `sanitizeLandingPageSpec`. Xem thêm LP06 và LP07. | Chưa có | Chưa chạy |
| LP05-S05-TC009 | Spec không hợp lệ không xuất bản được | P1 | Ghi trực tiếp vào DB một `draftSpec` thiếu khối bắt buộc (môi trường test). | 1. `POST /publish`. | 400 với `code: INVALID_SPEC` và danh sách lỗi. Trạng thái không đổi, `publishedSpec` giữ nguyên. | Chưa có | Chưa chạy |
| LP05-S05-TC010 | Xuất bản tạo phiên bản và ghi chú | P1 | Trang có 0 phiên bản. | 1. Xuất bản với body `{"note": "Phát hành đợt 1"}`.<br>2. `GET /versions`. | Có phiên bản số 1, `note = "Phát hành đợt 1"`, `kind = published`. Xuất bản không ghi chú tạo `Publish v2`. | Chưa có | Chưa chạy |
| LP05-S05-TC011 | Ghi chú xuất bản 501 ký tự | P2 | Token ORG-A-OWNER. | 1. Gửi `note` 501 ký tự. | 400 do `MaxLength(500)`. | Chưa có | Chưa chạy |
| LP05-S05-TC012 | Xuất bản lại sau khi sửa | P0 | Trang đang PUBLISHED với tiêu đề `V1`. | 1. Sửa tiêu đề thành `V2`, chờ lưu (chưa xuất bản).<br>2. Mở `/p/<slug>`.<br>3. Bấm Xuất bản.<br>4. Mở lại `/p/<slug>`. | Trước khi xuất bản lại: trang công khai vẫn `V1`. Sau: `V2`. Sửa bản nháp không ảnh hưởng trang công khai. | Chưa có | Chưa chạy |
| LP05-S05-TC013 | Xuất bản trang đã lưu trữ | P1 | Trang ARCHIVED. | 1. `POST /publish`. | 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |
| LP05-S05-TC014 | Xuất bản trang tạm sửa mẫu (LP09) | P0 | Một trang workbench `tpl-edit-<slug>` của SUPER_ADMIN. | 1. `POST /landing-pages/<id>/publish`. | 400 "Đây là phiên sửa mẫu gốc. Dùng "Lưu vào mẫu" hoặc "Lưu & xuất bản mẫu".". Tham chiếu LP09. | Chưa có | Chưa chạy |
| LP05-S05-TC015 | Lỗi xuất bản giữ nguyên bản công khai | P1 | Trang PUBLISHED. Giả lập `/publish` lỗi 500. | 1. Bấm Xuất bản. | Hiện "Publish thất bại — bản công khai chưa đổi" hoặc thông báo từ server. Trang công khai vẫn là bản cũ. | Chưa có | Chưa chạy |

## LP05-S06. Hủy xuất bản và cache trang công khai

**Mục tiêu:** Gỡ xuất bản làm trang biến khỏi khách, và cache không giữ bản cũ quá lâu.

**Căn cứ:** `LandingPagesService.unpublish`, route `apps/web/src/app/api/landing-pages/revalidate/route.ts`, `pages/page.tsx` hàm xử lý thao tác.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S06-TC001 | Gỡ xuất bản từ danh sách trang | P0 | Trang đang PUBLISHED, ORG-A-OWNER. | 1. Ở `/landing-pages/pages` mở menu thao tác của trang, chọn "Gỡ xuất bản".<br>2. Mở `/p/<slug>` ở cửa sổ ẩn danh. | Trang chuyển Nháp. `/p/<slug>` trả 404 (có thể chậm tối đa 60 giây nếu cache chưa làm mới). Trình duyệt gọi `/api/landing-pages/revalidate`. | Chưa có | Chưa chạy |
| LP05-S06-TC002 | Gỡ xuất bản qua API | P0 | Trang PUBLISHED. | 1. `POST {API}/landing-pages/<id>/unpublish`.<br>2. `GET {API}/landing-pages/public/<slug>`. | Phản hồi trang với `status = DRAFT`. API công khai trả 404 "Landing page không tồn tại hoặc chưa publish". | Chưa có | Chưa chạy |
| LP05-S06-TC003 | Cache công khai sau khi gỡ qua API (LP05-F5) | P1 | Trang PUBLISHED, đã mở `/p/<slug>` (có cache). | 1. Gỡ xuất bản bằng API (không qua giao diện).<br>2. Mở lại `/p/<slug>` trong vòng 60 giây rồi sau 70 giây. | Ghi lại: trong 60 giây có thể vẫn thấy bản cũ; sau đó 404. Cần xác nhận mức chấp nhận. | Chưa có | Chưa chạy |
| LP05-S06-TC004 | Gỡ xuất bản một trang chưa xuất bản | P1 | Trang DRAFT. | 1. `POST /unpublish`. | 400 "Trang chưa published". | Chưa có | Chưa chạy |
| LP05-S06-TC005 | Gỡ xuất bản trang đã lưu trữ | P2 | Trang ARCHIVED. | 1. `POST /unpublish`. | 400 "Trang chưa published" (vì trạng thái không phải PUBLISHED). | Chưa có | Chưa chạy |
| LP05-S06-TC006 | Làm mới cache với slug sai | P2 | Không cần đăng nhập. | 1. `POST /api/landing-pages/revalidate` body `{"slug":"../x"}`.<br>2. Gửi `{"slug":""}`.<br>3. Gửi body không phải JSON. | Cả ba trả 400 `{ok:false}`. Slug hợp lệ (`^[a-z0-9][a-z0-9-]{0,79}$`, không phân biệt hoa thường) trả `{ok:true, slug}`. | Chưa có | Chưa chạy |
| LP05-S06-TC007 | Xuất bản lại sau khi gỡ | P1 | Trang vừa được gỡ. | 1. Xuất bản lại.<br>2. Mở `/p/<slug>`. | Trang công khai trở lại với nội dung bản nháp hiện tại. Có thêm phiên bản `Publish`. | Chưa có | Chưa chạy |

## LP05-S07. Lịch sử phiên bản và khôi phục

**Mục tiêu:** Danh sách phiên bản đúng, khôi phục an toàn và không đụng bản đã xuất bản.

**Căn cứ:** `listPageVersions`, `getPageVersion`, `restorePageVersion`, controller kiểm số version nguyên >= 1.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S07-TC001 | Danh sách phiên bản | P1 | Trang đã xuất bản 2 lần. | 1. `GET {API}/landing-pages/<id>/versions`. | Trả `pageStatus`, `publishedAt`, `versions` giảm dần theo số phiên bản. Mỗi mục có `kind` là `published`, `restore_guard` hoặc `draft`, `editorName` và `editorEmail` của người tạo cùng tổ chức. Tối đa 50 mục. | Chưa có | Chưa chạy |
| LP05-S07-TC002 | Phân loại kind theo ghi chú | P2 | Có phiên bản ghi chú `Publish v1`, `before-restore-v1\|from=2`, `page-doctor-before-apply\|...`. | 1. Đọc `kind` của từng phiên bản. | `Publish...` là `published`. Có chữ `restore` là `restore_guard`. Còn lại (kể cả Page Doctor) là `draft`. | Chưa có | Chưa chạy |
| LP05-S07-TC003 | Đọc một phiên bản | P1 | Phiên bản số 1 tồn tại. | 1. `GET /versions/1`.<br>2. `GET /versions/999`.<br>3. `GET /versions/abc`.<br>4. `GET /versions/0`.<br>5. `GET /versions/1.5`. | Số 1: trả `snapshot` và `readOnly: true`. 999: 404 "Version không tồn tại". `abc`, `0`, `1.5`: 400 "Version không hợp lệ". | Chưa có | Chưa chạy |
| LP05-S07-TC004 | Khôi phục phiên bản cũ | P0 | Trang T: v1 (tiêu đề `A`), đã sửa thành `B` và xuất bản v2. | 1. `POST /versions/1/restore` body `{}`.<br>2. Gọi `GET /landing-pages/<id>` và đọc `draftSpec`.<br>3. Gọi `GET /versions`. | Trả `restoredFromVersion: 1`, `guardVersion` mới, `clientRevision` mới. Nháp là nội dung `A`. Có phiên bản bảo vệ chứa nội dung `B` ngay trước khi khôi phục, ghi chú `before-restore-v1\|from=<guardVersion>`. | Đã có: `scripts/test-landing-page-version-restore-revision.cjs` kiểm: khôi phục dùng revision mới từ hàng đã khóa, không dùng revision cũ trước giao dịch (khoảng 31 dòng kiểm) | Chưa chạy |
| LP05-S07-TC005 | Khôi phục không đổi bản đã xuất bản | P0 | Trang PUBLISHED hiển thị `B`. | 1. Khôi phục phiên bản `A`.<br>2. Mở `/p/<slug>`. | Trang công khai vẫn `B`. `status`, tên miền, tracking không đổi. Chỉ nháp đổi (xuất bản lại mới phát hành `A`). | Đã có: `scripts/test-landing-page-revision.ts` kiểm: cách ly `publishedSpec` khi khôi phục (đối với chính sách mã nguồn) | Chưa chạy |
| LP05-S07-TC006 | Revision sau khôi phục đơn điệu | P0 | Server revision 8, phiên bản cũ có revision 3. | 1. Khôi phục phiên bản có snapshot revision 3.<br>2. Autosave tiếp với `baseRevision` = revision trả về. | `clientRevision` mới = max(8, 3) + 1 = 9. Autosave tiếp theo với base 9 được chấp nhận. Tab cũ còn base 8 bị từ chối. | Đã có: `scripts/test-landing-page-version-restore-revision.cjs` kiểm: revision mới lấy từ bản khóa | Chưa chạy |
| LP05-S07-TC007 | Ghi chú tùy chọn khi khôi phục | P2 | Phiên bản tồn tại. | 1. Khôi phục với `note` "Hoàn tác thử nghiệm". | Phiên bản bảo vệ có ghi chú đúng `Hoàn tác thử nghiệm`. Ghi chú 501 ký tự trả 400. | Chưa có | Chưa chạy |
| LP05-S07-TC008 | Khôi phục phiên bản không tồn tại hoặc của trang khác | P0 | Phiên bản 3 thuộc trang T2, gọi trên trang T1. | 1. `POST /landing-pages/<T1>/versions/3/restore`. | 404 "Version không tồn tại trong tổ chức này". T1 không đổi. | Chưa có | Chưa chạy |
| LP05-S07-TC009 | Khôi phục khi trang đã lưu trữ | P2 | Trang ARCHIVED. | 1. `POST /versions/1/restore`. | 400 "Trang đã archive — duplicate để chỉnh sửa". | Chưa có | Chưa chạy |
| LP05-S07-TC010 | Giao diện lịch sử phiên bản | P1 | Trang có vài phiên bản. Mở builder. | 1. Mở bảng lịch sử phiên bản (`LandingPageVersionHistoryPanel`).<br>2. Xem một phiên bản.<br>3. Khôi phục. | Danh sách đúng thứ tự. Xem phiên bản ở chế độ chỉ đọc. Sau khôi phục canvas hiển thị nội dung cũ và trạng thái được lưu. | Một phần: `scripts/test-landing-page-version-restore-revision.cjs` kiểm: có kiểm sự hiện diện của `LandingPageVersionHistoryPanel` và thanh công cụ. Thiếu: thao tác thật trên giao diện | Chưa chạy |
| LP05-S07-TC011 | Undo và Redo không đụng lịch sử server | P1 | Builder với vài thay đổi. | 1. Nhấn Undo 2 lần rồi Redo 1 lần.<br>2. Chờ lưu.<br>3. `GET /versions`. | Canvas đúng thứ tự Undo/Redo. Không phát sinh phiên bản mới ở server chỉ vì Undo/Redo. | Đã có: `scripts/test-landing-page-history-live-edit.cjs` kiểm: thứ tự lịch sử, sửa văn bản dở, sắp xếp lại, lưu và tải (khoảng 53 dòng kiểm) | Chưa chạy |

## LP05-S08. Quyền, tổ chức và trạng thái trang

**Mục tiêu:** Chỉ đúng người, đúng tổ chức, đúng trạng thái được lưu và xuất bản.

**Căn cứ:** `PermissionsGuard` với `lead.read`/`lead.write`, `assertPage(organizationId, id)`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP05-S08-TC001 | Người chỉ xem không lưu và không xuất bản | P0 | Token ORG-A-VIEWER (chỉ `lead.read`). | 1. `POST /autosave`, `POST /publish`, `POST /unpublish`, `POST /versions/1/restore`, `POST /recover-draft`. | Cả năm trả 403. Không đổi dữ liệu. Nhưng `GET /versions` và `GET /:id` trả 200 (có `lead.read`). | Chưa có | Chưa chạy |
| LP05-S08-TC002 | Người chỉ xem mở builder | P1 | ORG-A-VIEWER mở `/landing-pages/builder/<id>`. | 1. Sửa nội dung và quan sát. | Ghi lại hành vi: builder hiện nhưng các lần lưu bị 403 hiển thị lỗi. Kỳ vọng cần xác nhận (nên khóa chỉnh sửa trên giao diện). | Chưa có | Chưa chạy |
| LP05-S08-TC003 | Tổ chức khác không thao tác được | P0 | Trang T của ORG-A. Token ORG-B-OWNER. | 1. ORG-B gọi `autosave`, `publish`, `unpublish`, `versions`, `versions/1/restore`, `recover-draft` trên T. | Tất cả 404 "Landing page không tồn tại". Không lộ sự tồn tại hay nội dung của T. Xem F03. | Chưa có | Chưa chạy |
| LP05-S08-TC004 | Không có token | P0 | Không Authorization. | 1. `POST /landing-pages/<id>/autosave`. | 401. | Chưa có | Chưa chạy |
| LP05-S08-TC005 | Id không tồn tại | P2 | Token ORG-A-OWNER. | 1. `POST /landing-pages/khong-co-id/autosave` và `/publish`. | 404 "Landing page không tồn tại". | Chưa có | Chưa chạy |
| LP05-S08-TC006 | Trang tạm sửa mẫu không có trong danh sách (LP08, LP09) | P1 | Có workbench `tpl-edit-*` của SUPER_ADMIN. | 1. `GET /landing-pages` và `GET /landing-pages/overview` với tổ chức đó. | Không thấy trang `tpl-edit-*`. Tham chiếu LP08 và LP09. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `autosave`, `decideLandingPageAutosave`, biên nhận hoặc `recoverDraft`: chạy S01, S03, S04.
- Sửa hàm lưu/hẹn giờ trong `landing-page-builder.tsx`: chạy S02, S03, S04 và S05-TC002, TC003.
- Sửa `publish`, `unpublish`, `revalidate` hoặc trang `/p/[slug]`: chạy S05, S06 và smoke SMOKE-3, SMOKE-4.
- Sửa lịch sử hoặc khôi phục phiên bản: chạy S07.
- Sửa guard quyền hoặc `assertPage`: chạy S08 và F03.
- Sau mỗi bản triển khai: chạy SMOKE-3 (LP05-S05-TC001).
