/**
 * LP04: Builder: section, hàng/cột, thư viện section, thêm thành phần
 * Tài liệu: docs/test case/suites/LP04-builder-section-hang-cot-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';

suite("LP04-S01", "Hàng và cột trong section", () => {
  todo("LP04-S01-TC001", "Thả element xuống dưới tạo hàng mới", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC002", "Thả vào cột có sẵn để xếp chồng", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC003", "Chỉ báo vị trí thả đúng kiểu", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC004", "Xóa element cuối của một cột", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC005", "Xóa element khi cột còn element khác", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC006", "Di chuyển element giữa các hàng cân bằng lại", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC007", "Undo và Redo với thao tác hàng/cột", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC008", "Trang cũ không có hàng vẫn hiển thị nguyên", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC009", "Element của section khác không bị ảnh hưởng", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S01-TC010", "Section bị khóa không hiện chỉ báo cột", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S02", "Chia cột khi thả", () => {
  todo("LP04-S02-TC001", "Từ 1 cột chia thành 2", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC002", "Từ 2 chia thành 3", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC003", "Từ 3 chia thành 4, thả bên trái cột đầu", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC004", "Giới hạn cột (LP04-F1)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC005", "Cổng kiểm chia cột bằng mã nguồn", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC006", "Cột trên Mobile xếp dọc đúng thứ tự", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S02-TC007", "Chia cột không làm thay đổi Desktop khi sửa ở Mobile", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S03", "Cài đặt section: nền, khoảng cách, nội dung dài", () => {
  todo("LP04-S03-TC001", "Section tự giãn theo nội dung", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S03-TC002", "Đổi nền section", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S03-TC003", "Khoảng đệm (padding) và chiều cao tối thiểu", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S03-TC004", "Section rất cao hoặc nhiều phần tử", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S03-TC005", "Ảnh nền video", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S03-TC006", "Tràn nội dung trên Mobile", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S04", "Thư viện section và thêm thành phần", () => {
  todo("LP04-S04-TC001", "Thư viện section đủ mẫu và dựng được (LP04-F2)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC002", "Xem trước section khớp trang thật", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC003", "Thêm section bằng nhấp", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC004", "Thêm section bằng kéo thả", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC005", "Thêm element vào ô lưới", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC006", "Thêm đoạn văn, danh sách, nhóm nút, thư viện ảnh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC007", "Thêm phần trống", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC008", "Chèn nội dung không chồng lên tiêu đề hay hộp", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC009", "Thêm section khi ở chế độ vị trí tự do", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S04-TC010", "Xóa native box giữ quyền sở hữu React", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S05", "Inspector và theme", () => {
  todo("LP04-S05-TC001", "Chế độ Inspector (thu gọn, nổi, kéo)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S05-TC002", "Tab thiết kế theo ngữ cảnh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S05-TC003", "Đổi theme nhanh", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S05-TC004", "Theme giữ sau reload", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S05-TC005", "CSS tùy biến", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S05-TC006", "Màu thương hiệu từ hồ sơ doanh nghiệp", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S06", "Khung thiết bị và xem trước toàn màn hình", () => {
  todo("LP04-S06-TC001", "Chuyển khung thiết bị", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S06-TC002", "Chỉnh riêng bố cục Mobile", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S06-TC003", "Xem trước toàn màn hình giống bản công khai", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S06-TC004", "Xem trước không gửi lead thật", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S06-TC005", "Xoay thiết bị và cỡ cửa sổ rất nhỏ", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP04-S07", "Trường hợp biên", () => {
  todo("LP04-S07-TC001", "Xóa cột đang có nội dung", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S07-TC002", "Thêm section khi đang chọn element", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S07-TC003", "Nhân bản section", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S07-TC004", "Xóa section và Undo", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP04-S07-TC005", "Sắp xếp lại thứ tự section", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});
