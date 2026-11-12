/**
 * LP08: Trang của tôi, tổng quan và analytics
 * Tài liệu: docs/test case/suites/LP08-trang-cua-toi-analytics-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { as, pub } from '../support/api';
import { getPage, newPage, newSavedPage, publicGet, publish, useCleanup } from '../support/lp';
import { uniq } from '../fixtures/run';

useCleanup();
const itemsOf = (b: any): any[] => (Array.isArray(b) ? b : b.items ?? b.data ?? b.pages ?? []);

suite("LP08-S01", "Danh sách Trang của tôi", () => {
  tc("LP08-S01-TC001", "Mở danh sách trang (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c, uniq('LIST'));
  const r = await c.get('/landing-pages');
  assert.equal(r.status, 200);
  assert.ok(itemsOf(r.body).some((p) => p.id === page.id), 'trang vừa tạo xuất hiện trong danh sách');
  });
  tc("LP08-S01-TC002", "Lọc theo trạng thái (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const draft = await newSavedPage(c, 'LOC-NHAP');
  const live = await newSavedPage(c, 'LOC-XB');
  await publish(c, live.id, 1);
  const onlyPublished = itemsOf((await c.get('/landing-pages', { query: { status: 'PUBLISHED' } })).body);
  assert.ok(onlyPublished.some((p) => p.id === live.id));
  assert.equal(onlyPublished.some((p) => p.id === draft.id), false);
  const onlyDraft = itemsOf((await c.get('/landing-pages', { query: { status: 'DRAFT' } })).body);
  assert.ok(onlyDraft.some((p) => p.id === draft.id));
  });
  tc("LP08-S01-TC003", "Trạng thái không hợp lệ (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages', { query: { status: 'KHONG_CO' } });
  assert.equal(r.status, 400);
  });
  tc("LP08-S01-TC004", "Tìm kiếm theo tên hoặc slug (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const name = uniq('TIM-KIEM-DOC-NHAT');
  const page = await newPage(c, name);
  const hit = itemsOf((await c.get('/landing-pages', { query: { q: name } })).body);
  assert.ok(hit.some((p) => p.id === page.id));
  const miss = itemsOf((await c.get('/landing-pages', { query: { q: 'KHONG-TON-TAI-LPT-QQQ' } })).body);
  assert.equal(miss.length, 0);
  assert.equal((await c.get('/landing-pages', { query: { q: 'x'.repeat(101) } })).status, 400, 'q tối đa 100 ký tự');
  });
  todo("LP08-S01-TC005", "Sắp xếp theo cập nhật mới nhất", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S01-TC006", "Cột lượt truy cập và leads (LP08-F2)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S01-TC007", "Tổ chức mới chưa có trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S01-TC008", "Hơn 100 trang (LP08-F3)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S01-TC009", "Kích thước phản hồi danh sách (LP08-F4)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S01-TC010", "Xem ảnh đại diện hỏng", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S01-TC011", "Không có quyền (HTTP)", { prio: 'P0', layer: 'api' }, async () => {
  const r = await pub.get('/landing-pages');
  assert.equal(r.status, 401);
  });
});

suite("LP08-S02", "Tổng quan (dashboard Landing Page)", () => {
  todo("LP08-S02-TC001", "Số liệu tổng quan", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S02-TC002", "Bấm ô số liệu chuyển tới danh sách đã lọc", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S02-TC003", "Trang gần đây", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S02-TC004", "Số mẫu cho người thường và quản trị", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S02-TC005", "Tổng quan tách theo tổ chức (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newPage(a, uniq('A-ONLY-OVERVIEW'));
  const ovB = await b.get('/landing-pages/overview');
  assert.equal(ovB.status, 200);
  assert.equal(JSON.stringify(ovB.body).includes(page.id), false, 'tổng quan của B không chứa trang của A');
  });
  todo("LP08-S02-TC006", "Trang sửa mẫu làm lệch số đếm (LP08-F1)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP08-S03", "Nhân bản, lưu trữ và xóa", () => {
  tc("LP08-S03-TC001", "Nhân đôi một trang (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const src = await newSavedPage(c, 'NHAN-DOI');
  const r = await c.post(`/landing-pages/${src.id}/duplicate`);
  assert.ok(r.status < 300);
  assert.notEqual(r.body.id, src.id);
  assert.notEqual(r.body.slug, src.slug);
  assert.equal(r.body.status, 'DRAFT');
  await c.post(`/landing-pages/${r.body.id}/delete`);
  });
  tc("LP08-S03-TC002", "Bản nhân đôi độc lập với bản gốc (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const src = await newSavedPage(c, 'GOC');
  const copy = (await c.post(`/landing-pages/${src.id}/duplicate`)).body;
  const { autosave } = await import('../support/lp');
  const { makeSpec } = await import('../fixtures/specs');
  const rev = (await getPage(c, copy.id)).draftSpec.meta?.clientRevision ?? 0;
  await autosave(c, copy.id, { spec: makeSpec({ headline: 'BAN-SAO-DA-SUA' }), base: rev, revision: rev + 1, requestId: 'dup-edit' });
  const orig = await getPage(c, src.id);
  assert.equal((orig.draftSpec.blocks[0] as any).headline, 'GOC', 'sửa bản sao không đổi bản gốc');
  await c.post(`/landing-pages/${copy.id}/delete`);
  });
  todo("LP08-S03-TC003", "Nhân đôi nhiều lần", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S03-TC004", "Lưu trữ một trang đã xuất bản (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'LUU-TRU');
  await publish(c, page.id, 1);
  const r = await c.post(`/landing-pages/${page.id}/archive`);
  assert.ok(r.status < 300);
  assert.equal((await getPage(c, page.id)).status, 'ARCHIVED');
  assert.equal((await publicGet(page.slug)).status, 404);
  });
  tc("LP08-S03-TC005", "Xóa một trang có xác nhận (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c, uniq('XOA'));
  const r = await c.del(`/landing-pages/${page.id}`);
  assert.ok(r.status < 300);
  assert.equal((await c.get(`/landing-pages/${page.id}`)).status, 404);
  });
  todo("LP08-S03-TC006", "Xóa trang đã có lead (LP08-F8)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S03-TC007", "Xóa hàng loạt (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const [p1, p2] = [await newPage(c, uniq('BULK-1')), await newPage(c, uniq('BULK-2'))];
  const r = await c.post('/landing-pages/bulk-delete', { ids: [p1.id, p2.id] });
  assert.ok(r.status < 300);
  assert.equal(r.body.deletedCount, 2);
  for (const p of [p1, p2]) assert.equal((await c.get(`/landing-pages/${p.id}`)).status, 404);
  });
  tc("LP08-S03-TC008", "Xóa hàng loạt: id của tổ chức khác (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const pa = await newPage(a, uniq('BULK-A'));
  const attempt = await b.post('/landing-pages/bulk-delete', { ids: [pa.id] });
  assert.equal(attempt.body.deletedCount, 0, 'deleteMany bị giới hạn theo organizationId của người gọi');
  assert.equal((await a.get(`/landing-pages/${pa.id}`)).status, 200, 'tổ chức B không xóa được trang của A');
  });
  tc("LP08-S03-TC009", "Xóa hàng loạt: dữ liệu sai (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  // Code: bulkDelete trả {success:true, deletedCount:0} khi ids thiếu/rỗng/không phải mảng (không báo 400)
  for (const [label, body] of [['thiếu ids', {}], ['ids là chuỗi', { ids: 'abc' }], ['ids rỗng', { ids: [] }]] as const) {
    fake(label, body);
    const r = await c.post('/landing-pages/bulk-delete', body);
    assert.ok(r.status < 300, `${label}: HTTP ${r.status}`);
    assert.equal(r.body.deletedCount, 0, label);
  }
  });
  todo("LP08-S03-TC010", "Xóa hàng loạt thất bại thì xóa tuần tự", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S03-TC011", "Gỡ xuất bản từ menu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S03-TC012", "Xem trang công khai và chỉnh sửa thiết kế từ menu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S03-TC013", "Người chỉ xem không có thao tác ghi (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_A_VIEWER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const page = await newSavedPage(owner, 'VIEWER-WRITE');
  for (const [label, r] of [
    ['duplicate', await viewer.post(`/landing-pages/${page.id}/duplicate`)],
    ['archive', await viewer.post(`/landing-pages/${page.id}/archive`)],
    ['delete', await viewer.del(`/landing-pages/${page.id}`)],
    ['bulk-delete', await viewer.post('/landing-pages/bulk-delete', { ids: [page.id] })],
    ['unpublish', await viewer.post(`/landing-pages/${page.id}/unpublish`)],
  ] as const) assert.equal(r.status, 403, label);
  assert.equal((await viewer.get('/landing-pages')).status, 200, 'người chỉ xem vẫn xem được danh sách');
  });
  todo("LP08-S03-TC014", "Xóa trang qua POST thay thế", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S03-TC015", "Id không tồn tại (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const missing = '00000000-0000-0000-0000-000000000000';
  assert.ok([400, 404].includes((await c.post(`/landing-pages/${missing}/duplicate`)).status));
  assert.ok([400, 404].includes((await c.del(`/landing-pages/${missing}`)).status));
  });
});

suite("LP08-S04", "Analytics", () => {
  todo("LP08-S04-TC001", "Mở trang analytics", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC002", "Số liệu khớp sự kiện (đối chiếu)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC003", "Tỷ lệ chuyển đổi", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC004", "Khoảng thời gian", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC005", "Lead đếm theo lần gửi (LP08-F5)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC006", "FORM_SUBMIT tính hai lần (LP08-F5, LP06-F5)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC007", "Phễu theo khách truy cập", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC008", "Dữ liệu lớn bị cắt (LP08-F6)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP08-S04-TC009", "Ngày sai định dạng (LP08-F7) (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.get('/landing-pages/analytics', { query: { from: 'không-phải-ngày', to: '2026-13-45' } });
  actual('HTTP khi ngày sai (LP08-F7: ghi nhận hành vi thực tế)', r.status);
  assert.ok([200, 400].includes(r.status));
  });
  tc("LP08-S04-TC010", "Lọc trang của tổ chức khác (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newPage(a, uniq('ANALYTICS-A'));
  const r = await b.get('/landing-pages/analytics', { query: { landingPageId: page.id } });
  assert.ok([200, 400, 404].includes(r.status));
  assert.equal(JSON.stringify(r.body).includes(page.id), false, 'tổ chức B không thấy số liệu của trang tổ chức A');
  });
  todo("LP08-S04-TC011", "Phân rã theo thiết bị và UTM", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC012", "Số liệu theo khối form và CTA", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC013", "Quyền xem analytics", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S04-TC014", "Tổ chức chưa có sự kiện", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP08-S05", "Trang tạm sửa mẫu bị ẩn (LP09)", () => {
  tc("LP08-S05-TC001", "Không hiện trong danh sách (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'SUPER_ADMIN'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const slug = itemsOf(list.body)[0].slug as string;
  const session = await admin.post(`/landing-pages/templates/${slug}/edit-session`, {});
  const workId = session.body.pageId;
  const own = await admin.get('/landing-pages');
  assert.equal(itemsOf(own.body).some((p) => p.id === workId), false, 'trang làm việc không hiện trong danh sách');
  assert.equal(JSON.stringify((await c.get('/landing-pages')).body).includes('tpl-edit-'), false);
  });
  todo("LP08-S05-TC002", "Không hiện ở trang gần đây", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S05-TC003", "Vẫn mở được bằng id", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S05-TC004", "Số đếm tổng quan (LP08-F1)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP08-S05-TC005", "Nhân đôi hoặc xóa workbench", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
