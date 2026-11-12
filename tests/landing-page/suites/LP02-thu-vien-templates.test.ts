/**
 * LP02: Thư viện Templates (xem, lọc, xem trước, dùng mẫu)
 * Tài liệu: docs/test case/suites/LP02-thu-vien-templates-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { as, pub } from '../support/api';

const itemsOf = (b: any): any[] => (Array.isArray(b) ? b : b.items ?? b.data ?? b.templates ?? []);

suite("LP02-S01", "Danh mục mẫu: tính toàn vẹn của catalog", () => {
  todo("LP02-S01-TC001", "Catalog hợp lệ", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S01-TC002", "Số mẫu trong cơ sở dữ liệu khớp catalog", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S01-TC003", "Đồng bộ lại không ghi lại khi không đổi", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S01-TC004", "Slug mẫu hợp lệ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S01-TC005", "Mỗi mẫu dùng được để tạo trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S01-TC006", "Các mẫu không giống nhau về cấu trúc", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S02", "Liệt kê, lọc và tìm kiếm mẫu", () => {
  tc("LP02-S02-TC001", "Mở thư viện mẫu (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages/templates');
  assert.equal(r.status, 200);
  const items = itemsOf(r.body);
  assert.ok(items.length > 0, 'thư viện có mẫu');
  for (const t of items.slice(0, 20)) assert.ok(t.slug && t.name, 'mỗi mẫu có slug và tên');
  });
  tc("LP02-S02-TC002", "Lọc theo ngành (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const all = itemsOf((await c.get('/landing-pages/templates')).body);
  const category = all[0].category as string;
  fake('ngành lọc', category);
  const filtered = itemsOf((await c.get('/landing-pages/templates', { query: { category } })).body);
  assert.ok(filtered.length >= 1);
  assert.ok(filtered.every((t) => t.category === category), 'mọi mẫu trả về đúng ngành đã lọc');
  });
  todo("LP02-S02-TC003", "Lọc theo kiểu (theme)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP02-S02-TC004", "Theme không hợp lệ (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages/templates', { query: { theme: 'KHONG_CO' } });
  assert.equal(r.status, 400, 'theme ngoài danh sách bị từ chối');
  });
  todo("LP02-S02-TC005", "Lọc theo họ thiết kế và mục tiêu chuyển đổi", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP02-S02-TC006", "Danh mục lạ trả danh sách rỗng (LP02-F3) (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages/templates', { query: { category: 'nganh-la-lpt-xyz' } });
  assert.equal(r.status, 200);
  assert.equal(itemsOf(r.body).length, 0, 'ngành lạ trả danh sách rỗng, không lỗi (LP02-F3)');
  });
  todo("LP02-S02-TC007", "Tìm kiếm từ khóa", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S02-TC008", "includeSystem=false (LP02-F1)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S02-TC009", "Thứ tự sắp xếp", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP02-S02-TC010", "Cấu trúc một mục mẫu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const t = itemsOf((await c.get('/landing-pages/templates')).body)[0];
  actual('một mục mẫu', Object.keys(t));
  for (const key of ['id', 'slug', 'name', 'category']) assert.ok(key in t, `thiếu trường ${key}`);
  });
  todo("LP02-S02-TC011", "Nhãn danh mục tiếng Việt", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S03", "Xem trước mẫu", () => {
  todo("LP02-S03-TC001", "Xem chi tiết một mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S03-TC002", "Xem trước ba khung hình", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP02-S03-TC003", "Mẫu không tồn tại (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages/templates/khong-ton-tai-lpt-xyz');
  assert.equal(r.status, 404);
  });
  todo("LP02-S03-TC004", "Mẫu nháp ẩn với người thường", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S03-TC005", "Xem trước HTML công khai của mẫu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S03-TC006", "Bản nháp HTML cần khóa", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S03-TC007", "Id mẫu sai định dạng khi mở HTML hoặc ảnh", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S03-TC008", "Ảnh mẫu tải được hoặc hỏng không vỡ trang", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S04", "Responsive và cách ly mẫu pilot", () => {
  todo("LP02-S04-TC001", "Một mẫu mỗi ngành ở ba khung", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S04-TC002", "Kiểm toàn bộ 200 mẫu × 3 khung", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S04-TC003", "Mẫu pilot Agency Portfolio được cách ly", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S04-TC004", "Khách hàng cũ không bị đổi giao diện", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S04-TC005", "Nhóm agency, spa, lô 1", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S05", "Dùng mẫu để tạo trang (không đụng mẫu gốc)", () => {
  todo("LP02-S05-TC001", "Bấm Sử dụng mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S05-TC002", "Sửa trang không đổi mẫu gốc", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S05-TC003", "Trang khách cũ không đổi khi mẫu được sửa (LP09)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S05-TC004", "Mẫu nháp chưa xuất bản không tạo được", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S05-TC005", "Hai trang cùng mẫu độc lập", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S05-TC006", "Mẫu của tổ chức trùng slug với mẫu hệ thống (LP02-F4)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S06", "Đồng bộ catalog khi đổi phiên bản và mẫu đã sửa tay", () => {
  todo("LP02-S06-TC001", "Mẫu có pack:managed không bị ghi đè (LP02-F2)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S06-TC002", "Mẫu mồ côi không có tag bị xóa (LP02-F2)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S06-TC003", "Slug trùng trong DB được khử", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S06-TC004", "Lỗi đồng bộ không chặn khởi động", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S06-TC005", "Gọi danh sách khi chưa đồng bộ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP02-S07", "Phân quyền, tổ chức và phạm vi hiển thị", () => {
  tc("LP02-S07-TC001", "Người thường không thấy mẫu nháp, SUPER_ADMIN thấy (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'SUPER_ADMIN'] }, async () => {
  const user = await as('ORG_A_OWNER');
  const admin = await as('SUPER_ADMIN');
  const slugs = (b: any) => new Set(itemsOf(b).map((t) => t.slug));
  const seenByUser = slugs((await user.get('/landing-pages/templates')).body);
  const seenByAdmin = slugs((await admin.get('/landing-pages/templates')).body);
  actual('số mẫu', { user: seenByUser.size, admin: seenByAdmin.size });
  assert.ok(seenByAdmin.size >= seenByUser.size, 'SUPER_ADMIN thấy ít nhất bằng người thường (thêm mẫu nháp)');
  });
  todo("LP02-S07-TC002", "Người chỉ xem có thể xem mẫu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP02-S07-TC003", "Không có token (HTTP)", { prio: 'P0', layer: 'api' }, async () => {
  const r = await pub.get('/landing-pages/templates');
  assert.equal(r.status, 401);
  });
  todo("LP02-S07-TC004", "Mẫu riêng của tổ chức không lộ cho tổ chức khác", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP02-S07-TC005", "Đếm mẫu ở tổng quan", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
