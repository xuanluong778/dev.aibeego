/**
 * LP03: Builder: chỉnh sửa nội dung và phần tử
 * Tài liệu: docs/test case/suites/LP03-builder-chinh-sua-phan-tu-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import {
  targetIsHidden, targetIsLocked, readCanvasGroups, writeCanvasGroups, targetKey,
} from '../../../apps/web/src/components/landing-pages/landing-page-canvas-groups';
import { makeSpec } from '../fixtures/specs';

/** Spec có thêm khối con để thử ẩn/khóa. meta.elementHidden / elementLocked dùng khóa "<blockId>::<field|element>". */
const specWith = (meta: Record<string, unknown> = {}, blockPatch: Record<string, unknown> = {}) => {
  const s: any = makeSpec({ headline: 'LOCK-HIDE' });
  s.blocks[0] = { ...s.blocks[0], ...blockPatch };
  s.meta = { ...(s.meta || {}), ...meta };
  return s;
};
const T = (extra: Record<string, unknown> = {}) => ({ blockId: 'p0_hero', element: 'headline', field: 'headline', ...extra }) as any;

suite("LP03-S01", "Chọn element, thanh công cụ và menu chuột phải", () => {
  todo("LP03-S01-TC001", "Chỉnh tiêu đề trang smoke [SMOKE]", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC002", "Chọn một element hiện thanh công cụ ở góc trên phải", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC003", "Di chuột sang thanh công cụ không làm mất thanh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC004", "Di chuột sang element khác khi đang chọn", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC005", "Cuộn trang khi có thanh công cụ", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC006", "Menu chuột phải", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC007", "Thanh công cụ không lệch sau Undo/Redo hoặc đóng Inspector", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC008", "Nhân bản, xóa một element", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S01-TC009", "Sao chép và dán", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S02", "Kéo thả, thay đổi kích thước và xoay", () => {
  todo("LP03-S02-TC001", "Kéo element theo con trỏ trong không gian trống", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC002", "Resize bằng tay nắm cạnh phải", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC003", "Resize dừng trước element kề bên", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC004", "Nhấn Escape để hủy thao tác", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC005", "Thả chuột ngoài cửa sổ trình duyệt", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC006", "Kéo ra ngoài khung canvas", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC007", "Resize sau khi xoay", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC008", "Kéo element không chồng lên element khác", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S02-TC009", "Cấu trúc kéo thả giữ khi tải lại", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S03", "Chọn nhóm và di chuyển nhóm", () => {
  todo("LP03-S03-TC001", "Chọn nhiều và tạo nhóm", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S03-TC002", "Di chuyển nhóm giữ khoảng cách tương đối", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S03-TC003", "Nhóm hỗn hợp có ảnh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  tc("LP03-S03-TC004", "Lưu và tải lại nhóm (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const s = specWith();
  const k1 = targetKey(T()), k2 = targetKey(T({ element: 'subheadline', field: 'subheadline' }));
  fake('khóa phần tử', [k1, k2]);
  const written = writeCanvasGroups(s, [{ id: 'g1', ownerId: 'p0_hero', boxKey: 'hero-copy', members: [k1, k2] }]);
  assert.ok(String((written.blocks[0] as any).style?.lpElementGroups).includes('g1'), 'nhóm được ghi vào style của khối chủ');
  const roundTrip = JSON.parse(JSON.stringify(written)); // giống lưu rồi tải lại
  const read = readCanvasGroups(roundTrip);
  actual('nhóm đọc lại', read);
  assert.equal(read.length, 1);
  assert.deepEqual(read[0]!.members, [k1, k2]);
  const cleared = writeCanvasGroups(roundTrip, []);
  assert.equal((cleared.blocks[0] as any).style?.lpElementGroups, undefined, 'bỏ nhóm thì xóa thuộc tính');
  });
  todo("LP03-S03-TC005", "Undo một bước cho mỗi thao tác nhóm", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S03-TC006", "Chuột không bị dính sau khi thả nhóm", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  tc("LP03-S03-TC007", "Nhóm có phần tử khóa (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  // nhóm chỉ giữ thành viên còn hiển thị (≥2) — ẩn bớt còn 1 thì nhóm biến mất
  const k1 = targetKey(T()), k2 = targetKey(T({ element: 'subheadline', field: 'subheadline' }));
  const s = writeCanvasGroups(specWith(), [{ id: 'g1', ownerId: 'p0_hero', boxKey: 'b', members: [k1, k2] }]);
  assert.equal(readCanvasGroups(s).length, 1);
  (s as any).meta = { elementHidden: { 'p0_hero::subheadline': true } };
  assert.equal(readCanvasGroups(s).length, 0, 'còn 1 thành viên hiển thị thì không còn là nhóm');
  });
  todo("LP03-S03-TC008", "Nhân bản nhóm lưu đúng", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S03-TC009", "Menu nhóm vừa khung nhìn", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S04", "Sửa văn bản và định dạng", () => {
  todo("LP03-S04-TC001", "Gõ có dấu cách đầu cuối", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC002", "Phím Space khi đang sửa chữ không bị chặn", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC003", "Thanh công cụ chữ nhanh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC004", "Hộp chữ và định dạng giữ sau lưu", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC005", "Không vòng lặp con trỏ khi gõ", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC006", "Undo/Redo khi đang sửa chữ", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC007", "Dán văn bản có định dạng", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S04-TC008", "Chữ rất dài", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S05", "Ảnh, icon, thư viện media và tải lên", () => {
  todo("LP03-S05-TC001", "Thay ảnh từ thư viện", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC002", "Tải ảnh lên hợp lệ", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC003", "Định dạng không cho phép", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC004", "Ảnh quá lớn", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC005", "Ảnh nền cho phép video", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC006", "Tên tệp nguy hiểm", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC007", "Phần mở rộng giả (nội dung không phải ảnh)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC008", "Ảnh của tổ chức khác không lộ trong thư viện", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S05-TC009", "Tải ảnh lên trang của tổ chức khác", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S06", "Ẩn, khóa và chống chồng lấn", () => {
  tc("LP03-S06-TC001", "Ẩn element và giữ sau reload (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const visible = specWith();
  assert.equal(targetIsHidden(visible, T()), false);
  const hidden = specWith({ elementHidden: { 'p0_hero::headline': true } });
  fake('meta.elementHidden', hidden.meta.elementHidden);
  assert.equal(targetIsHidden(hidden, T()), true, 'element bị ghi ẩn trong meta thì được coi là ẩn');
  assert.equal(targetIsHidden(hidden, T({ field: 'subheadline', element: 'subheadline' })), false, 'element khác không bị ảnh hưởng');
  assert.equal(targetIsHidden(specWith({}, { hidden: true }), T()), true, 'ẩn cả khối');
  assert.equal(targetIsHidden(specWith({}, { enabled: false }), T()), true, 'khối tắt = ẩn');
  assert.equal(targetIsHidden(visible, T({ blockId: 'khong-co' })), true, 'khối không tồn tại = ẩn');
  });
  tc("LP03-S06-TC002", "Khóa element và giữ sau reload (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  assert.equal(targetIsLocked(specWith(), T()), false);
  const locked = specWith({ elementLocked: { 'p0_hero::headline': true } });
  assert.equal(targetIsLocked(locked, T()), true);
  assert.equal(targetIsLocked(locked, T({ field: 'subheadline', element: 'subheadline' })), false);
  });
  tc("LP03-S06-TC003", "Section đang khóa: không sửa (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const s = specWith();
  s.blocks.push({ id: 'child1', type: 'Text', enabled: true, sectionPlacement: { sectionId: 'p0_hero' } });
  assert.equal(targetIsLocked(s, T({ blockId: 'child1', element: 'body', field: undefined })), false, 'section chưa khóa');
  s.blocks[0].locked = true;
  assert.equal(targetIsLocked(s, T({ blockId: 'child1', element: 'body', field: undefined })), true, 'phần tử con của section khóa cũng bị khóa');
  assert.equal(targetIsLocked(s, T()), true, 'chính section khóa');
  });
  todo("LP03-S06-TC004", "Section đang khóa: không xóa", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S06-TC005", "Xóa nhiều bỏ qua mục khóa", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S06-TC006", "Menu cho section khóa", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S06-TC007", "Hành động bị chặn không xóa nhánh Redo", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP03-S07", "Khối Lead Form, gom lỗi cũ và chuyển thiết bị", () => {
  todo("LP03-S07-TC001", "Kéo khối Lead Form tự do, không toolbar thừa", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S07-TC002", "Sửa nhãn và placeholder của form", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S07-TC003", "Cấu hình CRM của form", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S07-TC004", "Chuyển sang Mobile không đổi layout Desktop", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S07-TC005", "Element không có thiết kế Mobile", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP03-S07-TC006", "Lỗi console khi dùng builder", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});
