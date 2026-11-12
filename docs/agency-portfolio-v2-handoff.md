# Agency Portfolio — bàn giao mẫu chuẩn

Triển khai riêng `agency-portfolio` trên nhánh `feat/agency-portfolio-v2`, checkout `/var/www/aibeego_com_usr/agency-portfolio-worktree`. Nguồn bắt đầu: Git `1c4d882`. Không deploy, chạy migration, ghi trang người dùng, publish template/page hoặc gửi lead thật trong lượt này.

## Bản xem và ảnh

Chạy trong checkout trên:

```bash
node scripts/start-agency-portfolio-preview.cjs
```

Mở `http://127.0.0.1:32941/lp-template-shot/agency-portfolio`. Nếu IDE kết nối SSH, forward cổng 32941 trong tab Ports. Đây là renderer React hiện có của dự án, không phải HTML thiết kế được nhúng. Form trên đường dẫn này chỉ mô phỏng. Preview server được dừng sau QA; chạy lại lệnh trên khi cần xem.

Bảng xem ảnh độc lập: `/mnt/data/agency-portfolio-implementation/review.html`. Ảnh thực tế: `implemented-1440.png` và `implemented-390.png` trong cùng thư mục. Bảng này là đối chiếu ảnh; bản tương tác chạy bằng lệnh phía trên. Các ảnh builder, preview, public, JSON kết quả và log typecheck cũng nằm trong thư mục bàn giao.

Route `/lp-agency-pilot` phục vụ QA, chỉ hoạt động khi `NODE_ENV=development` và `LP_AGENCY_PILOT_QA=1`. Builder trên route QA dùng API fixture do script Playwright cung cấp; không phải backend vận hành. Không dùng route này để kiểm chứng lưu database thật.

## Thay đổi

| Phần | File chính | Kết quả |
|---|---|---|
| Dữ liệu mẫu mới | `packages/shared/src/landing-page-agency-portfolio-standard.ts`, `landing-page-template-expand.ts` | 11 block: Header, Hero, Benefits, Features, Gallery, Process, Pricing, FAQ, CTA, LeadForm, Footer. Nội dung demo tiếng Việt theo bản duyệt; 3 lợi ích, 3 dịch vụ, 4 ảnh minh họa, 4 bước, 2 cách hợp tác, 4 FAQ, 4 trường form. Không ép ba gói. |
| Phiên bản | `landing-page-types.ts`, `landing-page-lifecycle.ts` | `meta.rendererVersion = agency-portfolio-v2` là hợp đồng render riêng. Thiếu/không nhận diện phiên bản dùng legacy. `catalogVersion` vẫn là phiên bản catalog, không làm gate renderer. |
| Tạo trang mới | `apps/api/src/landing-pages/landing-pages.service.ts` | Preview template và tạo draft mới dùng canonical seed cho đúng mẫu hệ thống, catalog đã nhận diện; loại trừ template tenant, managed pack, HTML import và phiên bản lạ. Không ghi đè master published hoặc chạy lại seed trên trang đã lưu. |
| Component | `landing-page-agency-portfolio-blocks.tsx`, `landing-page-renderer.tsx` | Nhánh trình bày cho đúng phiên bản; tái sử dụng SelectableShell, InlineEditable, ElementChrome, ItemReorderChrome, LeadFormCard, LpContentImage. Không sao chép toàn renderer và không dùng iframe/htmlSource thay template. Section reorder vẫn theo khả năng của shell hiện có. |
| CSS | `landing-page-agency-portfolio.css`, `landing-page-legacy-css-scope.ts` | CSS mới scoped vào phiên bản. Foundation legacy được thêm điều kiện loại trừ có specificity bằng 0 vào **selector subject**, giữ ancestor selector của builder/body và pseudo-element. Không chỉ thêm override để đè CSS legacy. Container queries theo chiều rộng canvas thực tế. |
| Khả năng đọc | CSS và form theme | Chữ trên card sáng, FAQ, gói tối, form và CTA dùng cặp màu rõ. Font tiếng Việt được phục vụ local, đặt tên family riêng để không thay font của trang legacy. Không cắt chữ/line-clamp hay xuống dòng cứng để ép bố cục. |
| Builder | `landing-page-builder.tsx`, primitives hiện có | Chỉnh nội dung, selection, drag/resize, history và lưu vẫn dùng handler cũ. Ẩn phần tử và responsive visibility dùng protocol hiện có; PublicMeta chỉ bổ sung field attribute cho đúng phiên bản mới. Responsive text overrides được đọc/merge riêng cho phiên bản mới ở cả builder và public. Custom CSS và formTheme tiếp tục đi qua cơ chế hiện có. |
| Clone | `landing-page-lifecycle.ts`, helper mẫu chuẩn | Đổi ID block/item/plan/field và remap tham chiếu render, style, responsive style, item box, hidden/locked, free layout, provenance và anchor. Chỉ áp dụng remap bổ sung cho mẫu mới; không viết lại copy, media hay CSS người dùng. |
| Form | LeadFormCard + `public-landing-page-client.tsx` | Preview mô phỏng; public dùng endpoint lead, attribution, CRM và chống gửi trùng hiện có. Chỉ nhận thành công khi HTTP hợp lệ và API trả `ok: true`. Lỗi giữ nội dung; có pending, thông báo trường, aria-invalid và lỗi dài có dấu. Không thêm tích hợp/lời hứa email. |
| Media | `landing-page-content-image-style.ts`, assets | Tách helper style ảnh hiện có để tái sử dụng fit, position, flip, radius, motion và z-index. Gallery dùng PNG 2× xuất trực tiếp từ SVG đã duyệt với font gốc. Hero và Gallery ghi rõ minh họa/demo, không được trình bày như dự án khách hàng. |
| Picker | `apps/web/public/landing-page-assets/agency-portfolio-v2/agency-portfolio-{thumb,long}.webp` | Hai ảnh phiên bản mới lấy từ screenshot renderer thực tế. Giữ nguyên URL và byte ảnh cũ, kể cả khi trang đã lưu dùng thumbnail catalog làm OG image. Các biến thể giữ nguyên. |

## Bảo toàn trang cũ

Luồng đã kiểm tra từ source: tạo từ template → clone ID → sanitize draft/persist → JSON → mở lại; public/preview dùng `toPublicSpec` giữ render-critical meta. Nhánh chọn renderer đọc phiên bản đã lưu trong **spec**, không suy từ slug, category, templateId hoặc catalog hiện tại.

Không thêm SQL schema/migration. Không có chức năng tự nâng cấp trang cũ. Một đợt nâng cấp trang cũ sau này phải là bản nháp riêng, có diff và hoàn tác; không được chạy seed này trên publishedSpec.

Unit test đối chiếu 199 mẫu khác với hash baseline, chỉ chuẩn hóa ID form/ngày countdown vốn sinh động. Đây là bằng chứng dữ liệu catalog không đổi; không phải kết luận tất cả giao diện legacy đã được QA. Các phép đo UI legacy thực tế được liệt kê bên dưới.

## Kết quả kiểm tra

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| API syntax | Transpile service có thay đổi không báo lỗi cú pháp; không thay thế typecheck/build toàn API. |
| Shared TypeScript | `tsc -p packages/shared/tsconfig.json` qua. |
| Unit | 8 nhóm qua: gate phiên bản, vòng đời JSON, legacy snapshot, nguồn template hợp lệ, clone + tùy chỉnh, số item, phạm vi catalog và parser CSS. Baseline được lưu trong fixtures, không phụ thuộc checkout production khi chạy lại. |
| Renderer / preview / public | Mỗi bề mặt ở 375, 390, 768, 1024, 1440, 1920px; không tràn ngang, ảnh mặc định tải đủ, đủ item và trường. Có ảnh 1440/390. |
| Menu / CTA | Menu đóng ban đầu, mở dọc trên mobile, chọn link đóng menu, Escape đưa focus về nút, đổi sang desktop đóng menu. CTA chính tới form; CTA phụ tới dịch vụ; chọn hợp tác giữ ngữ cảnh trong payload. |
| Preview form | Validation và thành công mô phỏng; không request lead hoặc analytics. |
| Public form | API fixture kiểm tra: HTTP 500 với lỗi dài, 429, `ok:false`, JSON hỏng, mất mạng, HTTP 200 thiếu `ok`, pending và `ok:true` trả chậm. Không hiện thành công trước xác nhận; giữ input khi lỗi. Đây là kiểm tra HTTP contract, chưa xác minh tạo lead trong database/CRM thật. |
| Builder | Sáu kích thước màn hình; canvas dùng preset riêng nên JSON ghi cả viewport ngoài và chiều rộng canvas. Chỉnh chữ có dấu, selection, undo/redo, lưu–reload, resize và kéo tiêu đề qua gesture thật, responsive font và Custom CSS qua handler thật. Autosave fixture phản hồi requestId/clientRevision đúng giao thức; không ghi DB. |
| Nội dung dài / thiếu ảnh | Chữ tiếng Việt dài ở 375/390/1920; ảnh lỗi dùng fallback giữ khung; lỗi form dài không gây tràn ngang. Thêm item quy trình khi headline còn là mặc định làm số bước hiển thị cập nhật; không cắt item và không ghi đè headline người dùng đã đổi. |
| Visibility | Ẩn field lồng nhau, text-box theo viewport, section theo viewport và remap tham chiếu ẩn khi clone đều qua trên DOM public mẫu mới. |
| CSS isolation | 685 selector foundation legacy, 0 selector match mẫu mới. So sánh computed style trước/sau guard trên fixture Agency cũ, agency-portfolio-form, clinic-booking, saas-trial, spa-wellness ở 1440 và 390px: không đổi. Tắt transition/animation **trong phép đo tĩnh** để tránh so sánh trạng thái hover đang chuyển tiếp. Không suy rộng kết quả 10 case này thành QA toàn catalog. |
| Tương phản thực đo | Card/dịch vụ/FAQ 7,58:1; gói tối 12,61:1; label form 17,85:1; privacy form 6,32:1; CTA cam 6,56:1; placeholder và nhãn không bắt buộc 4,76:1. Lấy computed foreground và nền đặc từ DOM; không phải suy luận CSS tĩnh. Chỉ xác nhận các cặp đã đo, không coi là audit accessibility đầy đủ. |
| Đối chiếu thiết kế | 1440×5457 và 390×7656. Top, width và height của cả 11 vùng khớp bản HTML duyệt trong cùng Chromium. Mean absolute RGB difference khoảng 0,42/255 desktop, 0,53/255 mobile; vẫn có khác biệt raster/antialiasing và DOM shared form. Không tuyên bố pixel-identical. Đã xem ảnh thực tế. |
| Toàn web TypeScript | Không PASS: baseline có 102 diagnostic, checkout có 94 ở lần đo cuối; không thêm cặp file/mã lỗi so với baseline. Số giảm có phần do generated route types khác nhau, không phải đã sửa 8 lỗi. Log và so sánh được bàn giao. Không dùng cấu hình ignoreBuildErrors để coi kiểm tra đạt. |

Lệnh tái kiểm tra (chạy preview trong terminal riêng trước các script browser):

```bash
node scripts/test-agency-portfolio-standard.cjs
node scripts/qa-agency-portfolio-standard.cjs
node scripts/qa-agency-portfolio-builder.cjs
node scripts/qa-agency-portfolio-isolation.cjs
node scripts/qa-agency-portfolio-visibility.cjs
node scripts/qa-agency-portfolio-visual.cjs
```

Script visual cần HTML tham chiếu ở `/mnt/data/agency-portfolio-design/agency-portfolio.html`. Output QA mặc định trong `/mnt/data/agency-portfolio-implementation`; đây là tài sản kiểm tra, không phải dữ liệu ứng dụng.

## Điểm khác và chưa xác minh

- Form là component dùng chung: validation, pending, lỗi và thành công hoạt động theo dữ liệu/API; không dùng script demo nguyên trang. Builder có thêm chrome chọn/chỉnh/kéo theo hệ thống. Preview public có banner nháp hiện có.
- Chưa chạy lead/CRM, clone/create/autosave/publish với database thật hoặc phiên đăng nhập tenant thật. Những thao tác này dùng fixture HTTP và kiểm tra pure function/source; không coi đó là xác minh DB transaction, webhook hay quyền tenant.
- Các layout variant/preset khác được chèn thêm từ thư viện chưa thuộc phạm vi nghiệm thu của pilot chuẩn; chưa mở rộng các biến thể sang v2.
- Chưa kiểm tra Safari, Firefox, thiết bị vật lý, browser zoom và screen reader. CSS container queries, :has/:where phải được xác nhận theo browser support mà dự án cam kết trước release.
- Chưa build toàn bộ production app/API hoặc deploy. Các route liên quan đã compile và chạy trong Next dev. Typecheck toàn web còn lỗi cũ cần gate release riêng.
- Không chứng minh 5 ảnh audit ban đầu cùng build với source. Ảnh bàn giao mới được render từ checkout triển khai và có manifest/hash riêng.
- Nội dung vẫn là demo trung tính. Trước xuất bản thật cần định vị, khách hàng mục tiêu, phạm vi/giá thực tế, đầu mối liên hệ, bằng chứng có quyền sử dụng, chính sách dữ liệu và các cam kết doanh nghiệp đã xác nhận.

## Hoàn tác

Hiện chưa có dữ liệu người dùng nào chuyển sang phiên bản mới. Có thể bỏ checkout/nhánh triển khai và quay về source `1c4d882`; production không cần hoàn tác vì chưa thay đổi.

Nếu đã commit phần bàn giao vào một nhánh kiểm thử, dùng `git revert <commit triển khai>` trên nhánh đó rồi build lại môi trường kiểm thử. Không xóa spec, không chạy UPDATE hàng loạt và không thay publishedSpec bằng template seed.

Sau một lần phát hành tương lai đã có trang mới thật dùng `agency-portfolio-v2`, muốn dừng tạo mới thì tắt áp dụng seed cho lượt tạo tiếp theo nhưng giữ renderer đọc được phiên bản đã lưu. Không xóa hợp đồng render hoặc tự đổi marker của những trang đã lưu. Một rollback toàn bộ khi đó cần kế hoạch riêng và backup dữ liệu đã kiểm chứng.
