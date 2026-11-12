# Chất lượng Section Library v2 — 08/11/2026

100 section mẫu được hoàn thiện về nội dung, hình ảnh, màu sắc và bố cục. Bản sửa trước giải quyết khác biệt giữa preview và section đã chèn; lần này xử lý chất lượng thiết kế của chính catalog và các lỗi trong editor được phát hiện khi rà soát toàn bộ mẫu.

## Thay đổi

- Dùng năm bảng màu có chủ đích theo nhóm nội dung: indigo, forest, warm, slate, dark. Hero premium dùng nền xanh đậm, chữ sáng và CTA mint. Font tiếng Việt được phục vụ từ asset nội bộ bằng tên riêng, không thay đổi font của trang cũ.
- Viết lại nội dung mẫu tiếng Việt, bỏ copy hướng dẫn nội bộ như “Hook ngắn”, “Tính năng 1”, “Mô tả ngắn”. Phản hồi khách hàng ghi rõ là minh họa; các chỉ số chưa được xác minh được thay bằng các trụ cột hành trình.
- Bổ sung 14 ảnh cục bộ theo chủ đề; giữ tỷ lệ ảnh rõ ràng, tránh ảnh co thành dải mỏng. Video mẫu 12 giây và poster được tạo bằng đồ họa, phục vụ cục bộ; catalog/editor dùng poster, page preview/public dùng video có điều khiển.
- Hoàn thiện bố cục Hero, intro, lợi ích, tính năng, gallery/masonry/ảnh nổi bật, dịch vụ, sản phẩm, pricing, testimonials, stats, quy trình, FAQ, form, CTA, cam kết, video và countdown. Layout ảnh xen kẽ luôn có ảnh; item nổi bật dùng index ổn định qua wrapper kéo thả.
- Sửa form v2 bị co hẹp bởi shell `w-fit`, chữ trong các cột dùng kích thước intrinsic của editor, và vùng copy cam kết bị tràn ở chế độ mobile.

## Giới hạn phạm vi và tương thích

Catalog mới lưu `style.lpSectionLibrary.version = 2` và presentation/tokens riêng. Renderer/CSS v2 chỉ được kích hoạt bởi marker này; section version 1 và trang không có marker giữ nhánh cũ. Không tự sửa hay chuyển đổi section/trang khách hàng đã lưu. Không thay theme toàn trang, giao diện toolbar/inspector hoặc engine kéo thả/resize/group. Tiếp tục sử dụng InlineEditable, ElementChrome, ItemReorderChrome, LeadFormCard và countdown hiện có.

Không sửa API, database, AI/URL generation, catalog template toàn trang hoặc quy trình publish trong lần cập nhật này. Chỉ rollout web image; giữ image API sửa lỗi tạo Trang trống trước đó. Nội dung, ảnh, màu và CTA mẫu vẫn chỉnh được bằng các công cụ hiện có.

## Kiểm tra

- Unit: 100 mẫu qua draft/persist sanitizers, duplicate và JSON roundtrip; ID độc lập, snapshot giữ nguyên. Materialize catalog version 1 được lưu trước sửa vẫn giữ version 1/tokens cũ.
- Tương phản text chính >= 7:1, text phụ >= 4.5:1 trên nền/surface của từng palette; CTA có màu chữ tương phản. Kiểm tra copy hoàn chỉnh và tất cả đường dẫn media cục bộ tồn tại.
- Browser trên image cuối: 100 preview thực, desktop và mobile, 200 ảnh chụp; không tràn ngang, không ảnh lỗi/co hẹp, không text bị clip, không section lặp và không JavaScript/asset HTTP error. Kiểm tra riêng gallery nổi bật chỉ item đầu span hai cột. Xem thủ công contact sheets của cả 100 mẫu ở hai kích thước.
- Browser editor: 100 mẫu trong hai lô 50, desktop/mobile, một canvas root; không section tràn ngang hay co hẹp. Bao gồm toàn bộ mẫu form/cam kết.
- Luồng thực: 9 loại mẫu qua mở preview, thêm, sửa chữ, undo/redo, lưu, tải lại từ server fixture, mở inspector video, nhân bản và page preview desktop/tablet/mobile. So sánh typography, CTA và nguồn ảnh giữa preview và section chèn.
- So sánh 6 section Trang trống cùng 4 section version 1 với frontend production trước rollout: cùng nội dung/font/màu, kích thước sai khác tối đa 1 px; dữ liệu cũ không bị thay đổi sau khi thêm mẫu mới.
- Regression Builder hiện có: pointer resize (4 tình huống), groups/context menu (9 bước), sidebar drop/row layout (5 bước) đạt. Unit hợp đồng agency/CSS scope đạt; 199 template toàn trang khác được giữ nguyên.
- Sanitizer API đang chạy giữ snapshot version 2 của cả 100 mẫu. Regression HTTP tạo Trang trống đạt 201, idempotency, strict validation và giữ nguyên các nguồn tạo AI/URL/template.
- Type check riêng năm module catalog/context/quality/preview/v2 không có lỗi; Next production build đạt. Không coi đây là xác nhận toàn bộ repo sạch type errors, vì build hiện có cấu hình bỏ qua lỗi type toàn repo.

Toàn bộ browser API được chặn vào fixture, kiểm tra API dùng dependency giả; không ghi dữ liệu khách hàng. Source canonical, mirror và snapshot build của tám file component khớp SHA-256 (`source-hashes.json`). Các báo cáo, 200 screenshots và bản sao trước sửa nằm tại `/var/www/aibeego_com_usr/data/backups/section-library-quality-20261108/`. Các file `*-previous`, `form-debug` và `guarantee-diagnostic` là kết quả trung gian trước khi sửa lỗi; gate triển khai chỉ dùng báo cáo cuối.

Image phát hành: `marketingaz-web:section-library-quality-v2-20261108`; build ID `lpb-section-library-quality-v2-20261108`. Script rollout đối chiếu image đã QA, cấu hình/mount/env hiện tại và API container ID; có rollback nếu kiểm tra không đạt. Thư viện mẫu mới được áp dụng khi người dùng thêm section mới.

Đã triển khai thành công và xác nhận lại ngày 09/11/2026 (Asia/Ho_Chi_Minh). Endpoint phiên bản công khai trả đúng build ID; route tạo trang, API health, ảnh và video HTTP 200. Browser trên frontend production đạt 8 mẫu/16 ảnh chụp và toàn bộ 9 luồng thêm mẫu, chỉnh chữ, undo/redo, lưu, mở lại, nhân bản, inspector video và preview 3 thiết bị. Không JavaScript error, không ghi dữ liệu khách hàng. API container, environment và mounts giữ nguyên. Container QA và các preview server đã được dừng sau kiểm tra.
