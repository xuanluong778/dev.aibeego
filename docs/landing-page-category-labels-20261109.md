# Nhãn danh mục template tiếng Việt — 09/11/2026

Nguồn của trang `/landing-pages/templates` được dùng để build vẫn render `{c}` trực tiếp từ `LANDING_PAGE_CATEGORIES`. Đoạn này không có bảng nhãn tiếng Việt, vì vậy bản phát hành hiển thị key tiếng Anh. Hai bản source canonical và mirror có những khác biệt cũ ở các tính năng template khác; lần sửa này chỉ áp dụng cùng bản vá nhãn/layout lên từng bản, không ghi đè toàn bộ file từ bản này sang bản kia. Không đủ bằng chứng để xác định thời điểm hoặc tác giả của bản dịch trước đây mà người dùng nhớ.

Đã thêm đủ 20 nhãn theo yêu cầu tại trang templates. Nút “Tất cả” giữ nguyên. Bảng nhãn chỉ phục vụ hiển thị nút và tên bộ lọc đang chọn; key, slug, URL, thứ tự/category discovery, selected state và API parameters giữ nguyên. Nút dùng `w-auto flex-none whitespace-nowrap`, nhóm nút giữ `flex flex-wrap gap-2` để tự xếp nhiều hàng. Không sửa component Button dùng chung, Builder, API hay template data.

Bản vá được đối chiếu với hai source trước sửa: sau khi đảo ngược chính xác các thay đổi nhãn và class của nút, file khớp nguyên bản từng byte (`scope-report.json`). Snapshot build giữ nguyên các sửa Section Library v2 đã triển khai; chỉ trang template thay đổi. Đóng gói dựa trên image web đang chạy, giữ asset và dependency hiện có.

Browser QA dùng API fixtures, không ghi dữ liệu khách hàng: desktop 1550 px, điện thoại 390 px và 320 px. Kiểm tra đủ 21 nút (Tất cả + 20 danh mục), nhãn chính xác, từng nút không xuống dòng, chiều rộng theo nội dung, không co nút, nhóm nhiều hàng và không tràn ngang. Bấm từng danh mục để đối chiếu `category` trong GET request với key gốc; kiểm tra Tất cả bỏ tham số category, tìm kiếm giữ tham số q và URL trang giữ nguyên. Next production build đạt.

Image `marketingaz-web:template-category-labels-20261109`, build ID `lpb-template-category-labels-20261109`. Rollout giữ nguyên container API, mounts và environment; chỉ đổi image web và reload nginx. Có backup cấu hình và kiểm tra rollback tự động. Artifact và screenshots: `/var/www/aibeego_com_usr/data/backups/template-category-labels-20261109/`. Script kiểm tra: `scripts/qa-landing-page-category-labels-browser.cjs`.

Xác nhận sau triển khai trên frontend production: đủ 20 danh mục ở cả ba kích thước đạt; không JavaScript error. API dữ liệu được chặn vào fixture. Endpoint phiên bản công khai xác nhận đúng build ID. Container QA đã được dọn sau kiểm tra.
