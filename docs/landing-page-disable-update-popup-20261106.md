# Tắt popup cập nhật Builder

Đã gỡ mount `LandingPageBuilderVersionNotice` và callback tải lại dành riêng cho popup trong `landing-page-builder.tsx`. Component cũ giữ export tương thích và trả `null`; không còn fetch, interval, listener focus hoặc giao diện nhắc cập nhật. Autosave và khôi phục bản nháp hiện có tiếp tục hoạt động.

Hai gate hiện có đã cập nhật: `scripts/assert-landing-page-builder-release.cjs` và `scripts/test-landing-page-column-split.cjs`, để không buộc các bản build tương lai đưa popup trở lại. Cả kiểm tra source và bundle production đều đạt, kiểm thử column split đạt, Next production build thành công.

Chromium trên route Builder: giả lập endpoint phiên bản có ID khác, mở trang, phát sự kiện focus/visibility, tiến đồng hồ trình duyệt 65 giây. Kết quả: không popup, không request kiểm tra phiên bản, không tự reload, không lỗi JavaScript. API QA được chặn trong trình duyệt, không ghi bản nháp production. Tải bản sao bản nháp trước đây hai lần: đủ 11 phần tử gắn trong section, không có client exception hoặc cảnh báo preload CSS.

Release `lpb-no-update-popup-20261106`. Candidate dùng snapshot của bản đang triển khai trước đó cộng thay đổi tắt popup; các chỉnh sửa khác đang có trong working tree được giữ nguyên và không đưa vào lần triển khai này. Backup, patch, build log, kết quả trình duyệt và rollout ở `/var/www/aibeego_com_usr/data/backups/disable-builder-update-20261106/`.

Tab đã mở với JavaScript cũ cần tải lại một lần để nhận bản sửa.

Đã triển khai và kiểm tra lại trên `https://aibeego.com` lúc 17:48 ngày 06/11/2026 (Asia/Ho_Chi_Minh): tất cả kịch bản tắt popup đạt; 0 request kiểm tra phiên bản, 0 lỗi JavaScript, không tự reload. Chỉ khởi động lại web và reload Nginx; API, biến môi trường và mounts được giữ nguyên.
