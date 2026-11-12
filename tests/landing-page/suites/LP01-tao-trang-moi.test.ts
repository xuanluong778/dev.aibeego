/**
 * LP01: Tạo landing page mới (từ mẫu, trang trống, AI, URL)
 * Tài liệu: docs/test case/suites/LP01-tao-trang-moi-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { as, pub } from '../support/api';
import { getPage, newPage, publicGet, useCleanup, revisionOf } from '../support/lp';
import { newPageBody } from '../fixtures/specs';
import { uniq, uniqSlug } from '../fixtures/run';

useCleanup();

suite("LP01-S01", "Tạo trang trống từ giao diện", () => {
  tc("LP01-S01-TC001", "Tạo trang trống thành công và vào builder (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'], smoke: 'SMOKE-1' }, async () => {
  const c = await as('ORG_A_OWNER');
  const body = { mode: 'blank', name: 'SMOKE LP 20261111-01', idempotencyKey: 'smoke-lp01-20261111' };
  const r = await c.post('/landing-pages', body);
  assert.ok(r.status < 300, `tạo trang phải thành công, nhận ${r.status}`);
  const created = r.body;
  assert.ok(created.id && created.slug, 'có id và slug');
  assert.equal(created.status, 'DRAFT');
  assert.equal(created.name, 'SMOKE LP 20261111-01');
  const row = await getPage(c, created.id);
  assert.ok(Array.isArray(row.draftSpec.blocks), 'draftSpec có danh sách block');
  await c.post(`/landing-pages/${created.id}/delete`);
  });
  todo("LP01-S01-TC002", "Nút tạo bị khóa khi tên trống", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S01-TC003", "Tên dài đúng 120 ký tự được lưu nguyên (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const name = 'T'.repeat(120);
  const page = await newPage(c, name);
  assert.equal(page.name, name, 'tên 120 ký tự được lưu nguyên');
  });
  todo("LP01-S01-TC004", "Tên dài hơn 120 ký tự bị cắt ở giao diện", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S01-TC005", "Tên có ký tự Unicode tiếng Việt và emoji (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const name = 'Trần Thị Ánh Nguyệt — Khai trương 😀';
  const page = await newPage(c, name);
  assert.equal(page.name, name);
  assert.equal((await getPage(c, page.id)).name, name);
  });
  tc("LP01-S01-TC006", "Cấu trúc dữ liệu trang trống (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const row = await getPage(c, page.id);
  actual('draftSpec của trang trống', { version: row.draftSpec.version, blocks: row.draftSpec.blocks?.length, theme: row.draftSpec.theme });
  assert.equal(row.draftSpec.version, 1);
  assert.ok(Array.isArray(row.draftSpec.blocks));
  assert.equal(row.publishedSpec ?? null, null, 'chưa xuất bản thì chưa có publishedSpec');
  });
  tc("LP01-S01-TC007", "Nhấp đúp nút tạo chỉ sinh một trang (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const body = newPageBody(uniq('LPT double'));
  const [x, y] = await Promise.all([c.post('/landing-pages', body), c.post('/landing-pages', body)]);
  fake('2 request cùng idempotencyKey', body.idempotencyKey);
  assert.ok(x.status < 300 && y.status < 300);
  assert.equal(x.body.id, y.body.id, 'cùng một trang, không tạo trùng');
  await c.post(`/landing-pages/${x.body.id}/delete`);
  });
  todo("LP01-S01-TC008", "Mất mạng khi tạo trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP01-S02", "API tạo trang: dữ liệu vào và slug", () => {
  tc("LP01-S02-TC001", "Tạo trang trống qua API (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c, uniq('API blank'));
  assert.equal(page.status, 'DRAFT');
  assert.match(page.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
  tc("LP01-S02-TC002", "Thiếu tên (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  for (const [label, body] of [['thiếu name', { mode: 'blank' }], ['name rỗng', { mode: 'blank', name: '' }], ['name là số', { mode: 'blank', name: 123 }]] as const) {
    fake(label, body);
    assert.equal((await c.post('/landing-pages', body)).status, 400, label);
  }
  });
  tc("LP01-S02-TC003", "Tên 120 và 121 ký tự (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const ok = await c.post('/landing-pages', { mode: 'blank', name: 'N'.repeat(120) });
  assert.ok(ok.status < 300);
  await c.post(`/landing-pages/${ok.body.id}/delete`);
  const bad = await c.post('/landing-pages', { mode: 'blank', name: 'N'.repeat(121) });
  assert.equal(bad.status, 400);
  });
  tc("LP01-S02-TC004", "Theme không hợp lệ (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.post('/landing-pages', { name: uniq('theme'), theme: 'KHONG_CO' });
  assert.equal(r.status, 400, 'theme ngoài danh sách bị DTO từ chối');
  });
  todo("LP01-S02-TC005", "Tên toàn khoảng trắng qua API (LP01-F4)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S02-TC006", "Trùng tên trong cùng tổ chức (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const name = uniq('LPT trùng tên');
  const a = await c.post('/landing-pages', { mode: 'blank', name });
  const b = await c.post('/landing-pages', { mode: 'blank', name });
  assert.ok(a.status < 300 && b.status < 300, 'trùng tên vẫn tạo được');
  assert.notEqual(a.body.id, b.body.id);
  assert.notEqual(a.body.slug, b.body.slug, 'slug tự thêm hậu tố để không trùng');
  for (const p of [a, b]) await c.post(`/landing-pages/${p.body.id}/delete`);
  });
  tc("LP01-S02-TC007", "Slug do người dùng đặt (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const slug = uniqSlug('lpt-slug');
  fake('slug người dùng đặt', slug);
  const r = await c.post('/landing-pages', { mode: 'blank', name: uniq('slug'), slug });
  assert.ok(r.status < 300);
  assert.equal(r.body.slug, slug);
  await c.post(`/landing-pages/${r.body.id}/delete`);
  });
  todo("LP01-S02-TC008", "Slug đã dùng bởi tổ chức khác (subdomain)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S02-TC009", "Slug quá 80 ký tự (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.post('/landing-pages', { mode: 'blank', name: uniq('slug dài'), slug: 'a'.repeat(81) });
  assert.equal(r.status, 400, 'slug > 80 ký tự bị từ chối');
  });
  tc("LP01-S02-TC010", "Chọn vừa trang trống vừa mẫu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.post('/landing-pages', { mode: 'blank', name: uniq('xung đột'), templateSlug: 'bat-ky' });
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Chỉ chọn một nguồn bản nháp/);
  });
  todo("LP01-S02-TC011", "Chọn vừa mẫu vừa draftSpec", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S02-TC012", "draftSpec không hợp lệ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP01-S03", "Chống tạo trùng (idempotency)", () => {
  tc("LP01-S03-TC001", "Hai request cùng khóa đồng thời (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const body = newPageBody(uniq('LPT idem'));
  const [x, y] = await Promise.all([c.post('/landing-pages', body), c.post('/landing-pages', body)]);
  assert.equal(x.body.id, y.body.id);
  await c.post(`/landing-pages/${x.body.id}/delete`);
  });
  tc("LP01-S03-TC002", "Khóa khác nhau thì tạo hai trang (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const a = await c.post('/landing-pages', { mode: 'blank', name: uniq('khóa A'), idempotencyKey: 'key-A-lpt' });
  const b = await c.post('/landing-pages', { mode: 'blank', name: uniq('khóa B'), idempotencyKey: 'key-B-lpt' });
  assert.notEqual(a.body.id, b.body.id);
  for (const p of [a, b]) await c.post(`/landing-pages/${p.body.id}/delete`);
  });
  todo("LP01-S03-TC003", "Cùng khóa sau khi xóa trang (LP01-F5)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S03-TC004", "Khóa theo tổ chức (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const key = 'chung-khoa-lpt';
  const pa = await a.post('/landing-pages', { mode: 'blank', name: uniq('A'), idempotencyKey: key });
  const pb = await b.post('/landing-pages', { mode: 'blank', name: uniq('B'), idempotencyKey: key });
  assert.notEqual(pa.body.id, pb.body.id, 'khóa chống trùng tách theo tổ chức');
  await a.post(`/landing-pages/${pa.body.id}/delete`);
  await b.post(`/landing-pages/${pb.body.id}/delete`);
  });
  tc("LP01-S03-TC005", "Không gửi khóa (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const name = uniq('không khóa');
  const x = await c.post('/landing-pages', { mode: 'blank', name });
  const y = await c.post('/landing-pages', { mode: 'blank', name });
  assert.notEqual(x.body.id, y.body.id, 'không gửi khóa thì mỗi lần là một trang mới');
  for (const p of [x, y]) await c.post(`/landing-pages/${p.body.id}/delete`);
  });
});

suite("LP01-S04", "Tạo từ mẫu có sẵn", () => {
  todo("LP01-S04-TC001", "Tạo từ mẫu qua trang chọn mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S04-TC002", "Sửa trang không làm đổi mẫu gốc (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const list = await c.get('/landing-pages/templates');
  const tpl = (Array.isArray(list.body) ? list.body : list.body.items)[0];
  const before = JSON.stringify((await c.get(`/landing-pages/templates/${tpl.slug}`)).body);
  const created = await c.post('/landing-pages', { name: uniq('từ mẫu'), templateSlug: tpl.slug });
  assert.ok(created.status < 300, `HTTP ${created.status}`);
  const { autosave } = await import('../support/lp');
  const { makeSpec } = await import('../fixtures/specs');
  const row = await getPage(c, created.body.id);
  await autosave(c, row.id, { spec: makeSpec({ headline: 'DA-SUA-TRANG-KHACH' }), base: revisionOf(row), revision: revisionOf(row) + 1, requestId: 'tpl-edit-1' });
  const after = JSON.stringify((await c.get(`/landing-pages/templates/${tpl.slug}`)).body);
  assert.equal(after, before, 'sửa trang không làm đổi mẫu gốc');
  await c.post(`/landing-pages/${created.body.id}/delete`);
  });
  todo("LP01-S04-TC003", "Hai trang từ cùng một mẫu độc lập nhau", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S04-TC004", "Mẫu không tồn tại (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.post('/landing-pages', { name: uniq('mẫu ma'), templateSlug: 'khong-ton-tai-lpt-xyz' });
  assert.ok([400, 404].includes(r.status), `mẫu không tồn tại phải bị từ chối, nhận ${r.status}`);
  });
  todo("LP01-S04-TC005", "Mẫu nháp chưa xuất bản với người thường (LP01-F7)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S04-TC006", "Mẫu nháp với SUPER_ADMIN", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S04-TC007", "Mẫu của tổ chức khác", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S04-TC008", "Tạo từ mẫu bằng id thay vì slug", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S04-TC009", "Mẫu có import HTML", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP01-S05", "Tạo bằng AI và gợi ý brief", () => {
  todo("LP01-S05-TC001", "Gợi ý brief thành công", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S05-TC002", "Thiếu ngành và sản phẩm (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const r = await c.post('/landing-pages/ai-suggest-brief', { field: 'headline' });
  assert.equal(r.status, 400, 'thiếu ngành và sản phẩm');
  });
  todo("LP01-S05-TC003", "Thiếu khóa yêu cầu", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC004", "Trường field không hợp lệ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC005", "Giới hạn gợi ý 12 lần mỗi phút", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC006", "Sinh bản nháp AI hợp lệ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC007", "Thiếu sản phẩm hoặc khách hàng mục tiêu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC008", "Giá trị vượt giới hạn trường", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC009", "Lưu bản AI thành trang (xác nhận xem trước)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC010", "Không trừ credit khi sinh bằng AI (LP01-F1)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC011", "AI lỗi vẫn có bản nháp dự phòng", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC012", "Áp bản AI lên trang có sẵn không ghi đè nội dung người dùng", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC013", "Trang đổi trong lúc AI chạy", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S05-TC014", "Sinh AI trên trang đã lưu trữ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP01-S06", "Tạo từ URL", () => {
  todo("LP01-S06-TC001", "Phân tích URL công khai", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S06-TC002", "Gọi lại cùng URL trong 10 phút", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S06-TC003", "URL quá ngắn hoặc quá dài", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S06-TC004", "Chặn địa chỉ nội bộ (SSRF) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  for (const url of ['http://127.0.0.1/', 'http://localhost:3000/', 'http://169.254.169.254/latest/meta-data/', 'http://10.0.0.5/', 'http://192.168.1.1/', 'file:///etc/passwd']) {
    fake('URL nội bộ/nguy hiểm', url);
    const r = await c.post('/landing-pages/crawl-url', { url });
    assert.ok(r.status >= 400 && r.status < 500, `${url} phải bị chặn, nhận HTTP ${r.status}`);
  }
  });
  todo("LP01-S06-TC005", "URL không tải được hoặc quá lớn", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S06-TC006", "Giới hạn 10 lần mỗi phút", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S06-TC007", "Giao diện Phân tích URL", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S06-TC008", "URL lỗi vẫn tạo được bản nháp từ form", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP01-S07", "Giữ dữ liệu form, hồ sơ doanh nghiệp, phân quyền và tách tổ chức", () => {
  todo("LP01-S07-TC001", "Điền form tạo rồi tải lại trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S07-TC002", "LocalStorage bị chặn", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S07-TC003", "Nhãn danh mục tiếng Việt", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP01-S07-TC004", "Dùng hồ sơ doanh nghiệp để điền form", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP01-S07-TC005", "Người chỉ có quyền đọc không tạo được (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_VIEWER'] }, async () => {
  const viewer = await as('ORG_A_VIEWER');
  const r = await viewer.post('/landing-pages', newPageBody(uniq('viewer')));
  assert.equal(r.status, 403, 'người chỉ có lead.read không tạo được trang');
  });
  tc("LP01-S07-TC006", "Không có token (HTTP)", { prio: 'P0', layer: 'api' }, async () => {
  const r = await pub.post('/landing-pages', newPageBody(uniq('no-token')));
  assert.equal(r.status, 401);
  });
  tc("LP01-S07-TC007", "Trang tạo thuộc đúng tổ chức (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newPage(a, uniq('thuộc A'));
  assert.equal((await b.get(`/landing-pages/${page.id}`)).status, 404, 'tổ chức B không thấy trang vừa tạo ở A');
  const listB = await b.get('/landing-pages');
  assert.equal(JSON.stringify(listB.body).includes(page.id), false);
  });
  todo("LP01-S07-TC008", "Người dùng chưa đăng nhập vào trang tạo", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
