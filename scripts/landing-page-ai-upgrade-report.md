# Nâng cấp tạo landing page bằng AI — 31/10/2026

Đã triển khai tại https://aibeego.com/landing-pages/create.
Build frontend: `yh1aJ2wPqb9wxIDahiESk`. Backend đã cập nhật shared runtime, AI service, landing-pages service và DTO.

## Thay đổi

- Backend chọn kiến trúc từ catalog theo ngành và mục tiêu, dựng `draftSpec` hoàn chỉnh. Frontend hiển thị spec đó bằng renderer hiện tại và lưu nguyên spec trong một lần tạo bản nháp sau xác nhận. Không tự xuất bản.
- Biểu mẫu tách ngành, thương hiệu, sản phẩm/dịch vụ, khách hàng, vấn đề, USP, giá, ưu đãi, CTA/đích CTA, ghi chú, ảnh, logo và màu thương hiệu. Business Profile/URL điền vào các ô có thể kiểm tra và sửa; dữ liệu đã duyệt không bị backend tự ghép lại từ nguồn.
- Schema nội dung v2 gắn với id/type từng section của mẫu. Model không được dựng HTML, URL ảnh, giá/gói hay form tùy ý. Kiểm tra section thiếu, nội dung lặp, placeholder, chỉ dẫn nội bộ, số liệu và cam kết không có trong đầu vào. Thử sửa một lần khi sai schema/nội dung, sau đó dùng fallback từ mẫu có cảnh báo.
- Spec được tạo bằng danh sách trường cho phép; loại bỏ nội dung mẫu, ảnh mẫu, đánh giá/diễn giả và chứng nhận chưa được cung cấp. Không có giá thì dùng lời mời trao đổi; không ép bảng giá. Form mặc định 2 trường phù hợp mục tiêu. CTA tới đúng form hoặc URL/tel/mailto đã chỉ định.
- Tái sử dụng variant, palette và tokens của mẫu; nhận màu thương hiệu hợp lệ. Ảnh/logo dùng nguồn người dùng/profile/URL được kiểm tra; thiếu ảnh dùng bố cục không ảnh. Logo được render ở header. Có dải section sáng/tối, grid một item căn giữa, hai item hai cột và bốn lợi ích 2×2; sửa tương phản nút và số thứ tự trên màu nhấn sáng.
- Renderer không tự chèn nhãn dùng thử miễn phí vào trang AI mới. Toolbar xem trước co dòng trên điện thoại để mọi nút còn truy cập được.
- Idempotency dùng Redis có sẵn để phối hợp giữa API workers; output từ nhà cung cấp được giữ lại cả khi lưu gặp xung đột. Tạo lại cùng preview không tạo trang trùng. Khi tái tạo trang hiện có, giữ block/nội dung đã được đánh dấu user hoặc khóa, giữ theme người dùng và tăng revision; cập nhật đồng thời trả lỗi xung đột thay vì ghi đè.
- Mở rộng Page Doctor với lỗi lặp nội dung, placeholder, ngôn ngữ nội bộ, CTA sai đích và section thiếu dữ liệu. Định dạng spec vẫn là version 1, tương thích Builder/public/preview hiện tại.

## Kết quả kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| Build shared TypeScript | PASS |
| Build Nest API đầy đủ | PASS |
| Build Next production | PASS |
| Catalog 200 mẫu | PASS; 131 chuỗi cấu trúc khác nhau sau điều kiện dữ liệu |
| Schema, sửa có giới hạn, lỗi AI/fallback, CTA/ghi chú không bị ghép vào USP/offer | PASS |
| Preview không ghi DB, xác nhận lưu cùng spec, retry không tạo trùng | PASS |
| Redis hai API worker, retry sau xung đột không gọi provider thêm | PASS |
| Bảo vệ nội dung user/theme/revision, Page Doctor | PASS |
| Playwright trên localhost và aibeego.com | PASS; desktop/tablet/mobile, cả viewport thực 320px |
| Một gói căn giữa, hai gói hai cột, bốn lợi ích 2×2 | PASS |
| Mở draft trong Builder, chỉnh inline, gửi autosave | PASS |
| Public payload giữ blocks và metadata phục vụ render | PASS |
| Bộ chọn template từ yêu cầu trước | PASS; 4 cột, sidebar, fixed actions, ảnh/fallback và responsive |
| Hồi quy autosave identity / publish flush / restore revision / tenant isolation | PASS; kiểm thử nguồn/fixture tương ứng |
| AI thật với cấu hình hiện có | SaaS: AI thành công; spa: cam kết chưa được cung cấp bị chặn, fallback sạch có cảnh báo |

Kiểm thử trình duyệt dùng API fixture và chạy thuật toán backend thật trên dữ liệu giả lập; không tạo, sửa hoặc publish trang khách hàng. Lượt AI thật chỉ gọi provider, không lưu trang hoặc ghi credit ledger của ứng dụng.

## Giới hạn kiểm chứng

- Typecheck toàn bộ web vẫn báo lỗi sẵn có ngoài các file thay đổi của tính năng, gồm types route params cũ và các phần Builder khác. Build web hiện dùng cấu hình skip type validation có sẵn. Các file tạo AI/renderer sửa trong lần này không xuất hiện trong danh sách lỗi đã thu thập.
- Gate tích hợp Doctor cũ không hoàn tất auth/tenant/reload vì DB test `127.0.0.1:5433` không kết nối được. Kiểm thử mới dùng fixture và kiểm tra trực tiếp service; chưa thay thế kiểm thử tích hợp DB đầy đủ.
- Một số assertion nguồn cũ trong bộ inline AI / preview-public parity đã lỗi thời (số action/cấu trúc JSX); chúng không phải bằng chứng E2E. Các đường preview, public payload và Builder được kiểm tra thêm bằng bộ mới.
- Bộ lọc nội dung chủ động từ chối kết quả có số liệu/cam kết thiếu căn cứ; trong trường hợp đó người dùng nhận bản nháp từ mẫu và cần kiểm tra trước khi xác nhận. Đây là nhánh fallback đã kiểm chứng, không gắn nhãn là kết quả AI thành công.

## Chạy lại

Từ checkout build `/var/www/marketingaut_usr/data/www/marketingautoaz.com`:

```bash
node packages/database/node_modules/tsx/dist/cli.mjs --tsconfig apps/api/tsconfig.json scripts/test-landing-page-ai-generation.ts
LP_AI_QA_URL=https://aibeego.com node packages/database/node_modules/tsx/dist/cli.mjs --tsconfig apps/api/tsconfig.json scripts/test-landing-page-ai-create-browser.ts
node scripts/test-landing-page-create-ai-first.cjs
```

Canary provider thật chỉ chạy khi có chủ đích; dùng cấu hình hiện có, không khởi tạo dịch vụ mới:

```bash
LP_AI_CANARY_USE_DOCKER=1 node packages/database/node_modules/tsx/dist/cli.mjs --tsconfig apps/api/tsconfig.json scripts/canary-landing-page-ai-draft.ts
```

## Artifact và rollback

- Toàn bộ log, ảnh QA, source trước sửa, bản API/shared trước và sau, frontend trước và sau: `/var/www/aibeego_com_usr/data/backups/ai-landing-upgrade-20261031`.
- Bundle frontend quản lý: `deploy/aibeego-vps/bundles/release-ai-landing-yh1aJ2wPqb9w`, symlink `current` đã trỏ vào bản này.
- Bản frontend trước nâng cấp: `web-live-before`, BUILD_ID `-baW-m9GNVZHaIvpUsszw`.
- Rollback backend dùng `api-live-before` và `shared-live-before`; chỉ phục hồi file runtime rồi restart API. Không cần đổi schema hoặc phục hồi DB.
- File nguồn tính năng đã đồng bộ về workspace `/var/www/aibeego_com_usr/data/www/aibeego.com`.
