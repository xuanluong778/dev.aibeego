# Landing Page Builder: văn bản, cột và vạch thả — 05/11/2026

Nguồn: branch `feature/rebrand-aibeego`, commit gốc `576b6b1`, repo `xuanluong778/aibeego`; sửa trong worktree `/var/www/aibeego_com_usr/landing-text-worktree`, branch `fix/landing-page-text-columns-20261105`. Tham chiếu video `docs/landing page text.wmv` tại mirror aibeego.com. Đã triển khai web và API lên https://aibeego.com ngày 05/11/2026 theo yêu cầu người dùng. Không sửa draft hoặc publish trang production để nghiệm thu.

## Nguyên nhân và cách sửa

**Canvas trống ở 00:15–00:24.** Hero đã ẩn trường `subheadline`. Quy tắc cũ `[data-lp-block-id="hero"] [data-lp-inline-field="subheadline"]{display:none!important}` áp dụng cho cả các đoạn văn con có ID khác, vì chúng được render bằng portal vào DOM của Hero. Node chữ vẫn có nội dung và khung chọn vẫn có kích thước, nhưng computed style của node chữ là `display:none`, bounding rect bằng 0. Màu chữ vẫn hợp lệ, opacity 1, visibility visible, overflow visible; việc nâng z-index hoặc đổi màu chữ không giải quyết nguyên nhân. Đối chiếu read-only dữ liệu trang được chỉ ra trong video, rồi tái hiện trên bản QA rút gọn có cùng điều kiện ẩn. Bản sửa ràng buộc selector bằng `data-lp-element-id` của đúng block sở hữu. Trường gốc vẫn ẩn; đoạn văn mới xuất hiện và dùng trình sửa trực tiếp hiện có.

[Bằng chứng DOM và computed style](evidence/landing-text-columns-20261105/hidden-text-diagnosis.json), [trước sửa](evidence/landing-text-columns-20261105/hidden-text-before.png), [sau sửa](evidence/landing-text-columns-20261105/hidden-text-after.png). Hai ảnh này dùng fixture Chromium để tái hiện riêng selector cũ/mới; nghiệm thu kéo thả và sửa trực tiếp dùng Builder thật như phần dưới.

**Kéo thẻ Văn bản.** `insertSidebarPreset` dùng ngay `LP_PARAGRAPH_PRESETS[0]` và `insertParagraphPreset` qua `consumeDropChoice`. Không mở thư viện trước khi chèn. Giữ đúng một bước history, selection và autosave sẵn có. Nút riêng “Chọn mẫu văn bản” trong Thêm thành phần mở thư viện để kéo preset hoặc bấm chọn mẫu; click lên thẻ kéo không tự chèn thêm.

**Dịch sai cột.** `attachNewSectionElement` trước đây gắn phần tử mới vào section rồi gọi `applySplitColumnsToBlocks` trên cả danh sách, khiến phần tử mới cũng bị tăng `columnIndex`. Bản sửa dịch trên `previous.blocks`, sau đó gắn phần tử mới vào chỉ số cột nhận thả. Chỉ số của các nhóm nội dung gốc trong bố cục chia đôi được lưu bằng `lpNativeColumnIndices`, tránh dồn cả hai nhóm về cùng một phía khi thêm cột vào khe giữa.

**Thả lên chữ có sẵn.** Sự kiện của phần tử portal đi qua cây React của renderer, không qua handler của section trong DOM. Handler canvas trước đây bỏ qua mọi node có `data-lp-block-id`, nên thả lên đoạn văn con có thể không tạo nội dung. Canvas nay tìm section trong DOM và dùng cùng resolver với section shell.

**DOM cột và cột trống.** `ensureSectionColumns` đồng bộ vị trí nội dung gốc và số ô theo spec ở cả chiều tăng/giảm. Undo trả lại node gốc khi trở về một cột; Redo tạo lại đúng ô. Cột có vùng tối thiểu 64 CSS px và giãn theo hàng. Cột native có ảnh bị ẩn được resolver đo vùng cột dự kiến, thay vì lấy rect 0 của ảnh. Khi thả vào thân bố cục chia đôi sẵn, lưu số cột hiện hữu mà không tạo thêm cột. Mobile dùng thứ tự DOM theo chỉ số cột và xếp dọc.

**Vạch thả.** Vạch ngang/dọc dùng chung màu tương phản theo luminance của nền đã composite: chỉ `#000000`/`#ffffff`; nền trắng, xám sáng và xanh sáng dùng đen, nền tối dùng trắng. Xóa yêu cầu `#00E174` khỏi regression gate. Không đổi màu thiết kế trang hoặc các control khác. Vạch tiếp tục dùng resolver và tọa độ canvas để theo cuộn/zoom, dọn khi drop/Escape/thả ra ngoài.

## File sửa

| File | Nội dung |
|---|---|
| `apps/web/src/components/landing-pages/landing-page-builder.tsx` | Chèn preset đoạn văn mặc định ngay khi thả Văn bản |
| `landing-page-add-components-panel.tsx` cùng thư mục | Nút mở thư viện chủ động, gợi ý kéo phù hợp |
| `landing-page-renderer.tsx` cùng thư mục | CSS ẩn theo đúng owner; nhận drop từ portal |
| `landing-page-section-elements.tsx` cùng thư mục | Tách dịch cột cũ/chèn mới; đồng bộ DOM khi Undo/Redo và reload |
| `landing-page-section-insert-target.ts` cùng thư mục | Cột trống/native, đích trong cột, mobile, tương phản chung |
| `landing-page-sidebar-dnd.ts` cùng thư mục | Thông tin số cột hiện hữu và vị trí nhóm native trong đích thả |
| `packages/shared/src/landing-page-section-elements.ts` | Đọc/lưu/dịch từng nhóm nội dung native |
| `packages/shared/src/landing-page-canvas.ts` | Kiểu dữ liệu `lpNativeColumnIndices` |
| `scripts/test-landing-page-column-split.cjs` | Bỏ gate yêu cầu màu xanh |
| `scripts/test-landing-page-section-elements.cjs` | Regression trái/phải/khe giữa, history, persist, native split |
| `scripts/test-landing-page-hidden-text.cjs` | Tái hiện CSS cũ và kiểm tra CSS hiện tại trong Chromium |
| `scripts/test-landing-page-drop-indicator.cjs` và các fixture/helper | 40 tổ hợp ngang/dọc × desktop/mobile × zoom × nền |
| `scripts/qa-landing-page-text-columns.cjs` | Nghiệm thu Builder, API, PostgreSQL bằng kéo chuột thật |

## Nghiệm thu

Kết quả cuối: **8/8 nhóm nghiệm thu đạt**, không có lỗi runtime trang; **40/40 tổ hợp vạch thả đạt**. Xem [results.json](evidence/landing-text-columns-20261105/results.json). Dùng Next Builder, Nest API và PostgreSQL thật trong Docker network QA `internal`, tài khoản `@example.invalid`; không mock autosave hoặc persistence. Kéo thả dùng `page.mouse` của Chromium, không phát `DragEvent` giả. Public là route `/p/...` được publish trong stack QA riêng.

| Trường hợp | Kiểm tra |
|---|---|
| Hero xanh có `subheadline` bị ẩn | Kéo Văn bản → một đoạn văn có nội dung; node chữ hiện trong khung; double-click sửa, autosave và reload giữ nội dung |
| Một cột, thả trái | Chữ mới cột 0; nội dung gốc cột 1; Undo/Redo và hai lần reload |
| Một cột, thả phải | Chữ mới cột 1; nội dung gốc cột 0; Undo/Redo và hai lần reload |
| Benefits trắng, thả khe giữa | Hai cột → đúng ba cột; nội dung bên phải dịch sang cột 2, chữ mới ở cột 1 |
| Thả lên thân cột có chữ | Chèn vào chính cột đó, không tăng số cột; sự kiện portal được nhận |
| Cột giữa trống | Tạo dữ liệu có cột trống, tải lại, kéo vào cột đó, giữ nguyên số cột và reload |
| Thư viện | Kéo một preset cụ thể và bấm chọn mẫu đều chèn đúng một block |
| Hủy kéo | Escape và thả ngoài canvas không thêm block, không còn vạch |
| Hero chia đôi sẵn | Thả vào cột phải có ảnh bị ẩn không thêm cột; thêm cột cạnh phải và khe giữa giữ vị trí hai nhóm native; reload |
| Preview/public/mobile | Nút Lưu, mobile ngay trong Builder, Preview và public giữ nội dung/chỉ số/style; mobile xếp dọc, không tràn ngang |
| Vạch ngang/dọc | 40 tổ hợp tương phản, zoom 100%/75%, desktop/mobile, cuộn trong khi kéo; đúng đích và mất sau drop |

## Chạy lại

Build shared trước: `node node_modules/typescript/bin/tsc -p packages/shared/tsconfig.json`.

- `node scripts/test-landing-page-section-elements.cjs`
- `node scripts/test-landing-page-column-split.cjs`
- `node scripts/test-landing-page-hidden-text.cjs`
- `node scripts/test-landing-page-drop-indicator.cjs`
- `node scripts/test-landing-page-autosave-identity.cjs`
- `node scripts/test-landing-page-autosave-stuck.cjs`

Nghiệm thu đầy đủ: `LP_TEXT_QA_CONFIG=/path/to/private-config.json node scripts/qa-landing-page-text-columns.cjs`. Config cung cấp `origin` localhost của Next, `api` địa chỉ API QA, `network` Docker internal, `pageId` của trang QA riêng, `authFile` chứa tài khoản QA, `browser` và `out`. Đặt `LANDING_PAGE_API_INTERNAL_URL` của Next về API QA để kiểm tra SSR public. Script đăng nhập tài khoản QA, reset/publish đúng trang QA trong config; không dùng config trỏ đến production. Không commit mật khẩu/token.

## Kết quả kiểm tra mã nguồn

Regression ownership/column/history/persist/native split và gate column-split đạt; autosave/identity đạt 14/14. Shared TypeScript build đạt. `git diff --check` đạt. Web typecheck toàn repo còn 97 lỗi nền (95 lỗi source và 2 diagnostic route public do Next sinh); so sánh checkout gốc cùng generated types không có file/error-code mới: [comparison](evidence/landing-text-columns-20261105/typecheck-comparison.json), [baseline](evidence/landing-text-columns-20261105/typecheck-baseline.log), [hiện tại](evidence/landing-text-columns-20261105/typecheck.log). Không coi web typecheck toàn repo là đạt. Lượt kiểm tra đầu chạy Next dev. Sau yêu cầu deploy, production build đạt và cả 8/8 nhóm nghiệm thu được chạy lại trên chính hai image production trong QA riêng trước khi chuyển production.

API QA dùng Nest image có sẵn với module shared sanitizer của branch hiện tại để giữ `sectionPlacement.columnIndex`. Khi triển khai, web và API/shared cần cùng model cột; API cũ xóa `columnIndex` khi sanitize sẽ làm mất bố cục sau reload. Bản sửa không thay dữ liệu production.

## Triển khai production

- Source sửa: `3836ab4`. Đã fast-forward branch `feature/rebrand-aibeego` của nguồn canonical và đồng bộ đúng 8 file source sang mirror aibeego.com.
- Web: `marketingaz-web:text-columns-3836ab4-20261105`.
- API: `marketingaz-api:text-columns-3836ab4-20261105`.
- BUILD_ID: `lpb-text-columns-3836ab4-20261105`.
- API mới kế thừa image đang chạy, chỉ cập nhật module shared `landing-page-section-elements.js`; không thay catalog template, schema hay cấu hình runtime. API cũ đã được xác nhận bỏ `columnIndex`; API mới giữ chỉ số và style cột qua sanitizer.
- Production build giữ các biến public của runtime đang chạy, gồm đăng nhập Google. 8/8 nhóm kéo thả/lưu/reload/Undo/Redo/preset/Preview/public/mobile đã đạt trên image production trong Docker network QA internal: [kết quả](evidence/landing-text-columns-20261105/production-images/results.json), [log](evidence/landing-text-columns-20261105/production-images/browser.log).
- Sau chuyển production: `/login`, `/landing-pages/create`, route Builder trả 200 và đúng BUILD_ID; 45 tài nguyên JS/CSS trả 200. Version manifest khớp BUILD_ID và `no-store`. API health 200. Hash module cột của API live khớp artifact; sanitizer live giữ `columnIndex` và `lpNativeColumnIndices`; env runtime của cả web/API khớp snapshot trước deploy. [Bằng chứng live](evidence/landing-text-columns-20261105/production-deployment.json).
- Không tạo/sửa draft hay publish trang production để kiểm tra. Public và thao tác kéo thả được nghiệm thu bằng dữ liệu QA riêng; kiểm tra website live dùng HTTP GET và kiểm tra module trong container.

Backup, image context, source snapshot, compose trước deploy và log nằm tại `/var/www/aibeego_com_usr/data/backups/text-columns-3836ab4-20261105/`. Rollback image: web `marketingaz-web:text-move-guides-20261105`, API `marketingaz-api:element-drag-20261104`; dùng compose đã backup, recreate riêng api/web rồi reload Nginx. Không restore DB. Sau deploy, đã dừng các dịch vụ QA còn lại.
