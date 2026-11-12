/**
 * LP09: Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt)
 * Tài liệu: docs/test case/suites/LP09-admin-quan-ly-templates-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import {
  TemplatePackError, parseTemplatePack, parseHtmlDocument, readZip, stripSensitiveKeys, isPlatformAdmin,
  TEMPLATE_PACK_MAX_ZIP_BYTES, TEMPLATE_PACK_MAX_FILES, TEMPLATE_BULK_MAX_ZIP_BYTES, TEMPLATE_EDIT_SLUG_PREFIX,
} from '../../../apps/api/src/landing-pages/template-pack';
import {
  deduplicateTemplateBulkFiles, expandTemplateBulkFile, parseTemplateBulkPreferences,
} from '../../../apps/api/src/landing-pages/template-pack-bulk';
import { as, pub } from '../support/api';
import { HTML_SAMPLE, PNG_1PX, manifestOf, templateOf, validPack, zip } from '../fixtures/packs';

const throwsPack = (fn: () => unknown, re: RegExp) =>
  assert.throws(fn, (e: unknown) => e instanceof TemplatePackError && re.test(e.message), String(re));

suite("LP09-S01", "Phân quyền quản trị mẫu", () => {
  tc("LP09-S01-TC001", "Chủ tổ chức bị chặn ở mọi route mẫu admin (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  assert.equal(isPlatformAdmin({ role: 'OWNER' }), false);
  assert.equal(isPlatformAdmin({ role: 'ADMIN', platformRole: 'MEMBER' }), false);
  assert.equal(isPlatformAdmin(null), false);
  assert.equal(isPlatformAdmin({ role: 'SUPER_ADMIN' }), true);
  assert.equal(isPlatformAdmin({ role: 'OWNER', platformRole: 'SUPER_ADMIN' }), true);
  });
  tc("LP09-S01-TC001", "Chủ tổ chức bị chặn ở mọi route mẫu admin (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const routes = [
    ['GET', '/landing-pages/templates/packs/export-all'],
    ['POST', '/landing-pages/templates/packs'],
    ['POST', '/landing-pages/templates/packs/bulk'],
    ['GET', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/edit-session'],
    ['POST', '/landing-pages/templates/any-slug/save-from-session'],
    ['POST', '/landing-pages/templates/any-slug/publish'],
    ['GET', '/landing-pages/templates/any-slug/versions'],
    ['POST', '/landing-pages/templates/any-slug/versions/1/restore'],
  ] as const;
  for (const [method, path] of routes) {
    const r = method === 'GET' ? await owner.get(path) : await owner.post(path, {});
    assert.equal(r.status, 403, `${method} ${path}: chủ tổ chức thường phải bị chặn`);
  }
  });
  tc("LP09-S01-TC002", "Người chỉ xem bị chặn (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_VIEWER'] }, async () => {
  const viewer = await as('ORG_A_VIEWER');
  const routes = [
    ['GET', '/landing-pages/templates/packs/export-all'],
    ['POST', '/landing-pages/templates/packs'],
    ['POST', '/landing-pages/templates/packs/bulk'],
    ['GET', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/edit-session'],
    ['POST', '/landing-pages/templates/any-slug/save-from-session'],
    ['POST', '/landing-pages/templates/any-slug/publish'],
    ['GET', '/landing-pages/templates/any-slug/versions'],
    ['POST', '/landing-pages/templates/any-slug/versions/1/restore'],
  ] as const;
  for (const [method, path] of routes) {
    const r = method === 'GET' ? await viewer.get(path) : await viewer.post(path, {});
    assert.equal(r.status, 403, `${method} ${path}`);
  }
  });
  tc("LP09-S01-TC003", "Không có token (HTTP)", { prio: 'P0', layer: 'api' }, async () => {
  const routes = [
    ['GET', '/landing-pages/templates/packs/export-all'],
    ['POST', '/landing-pages/templates/packs'],
    ['POST', '/landing-pages/templates/packs/bulk'],
    ['GET', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/pack'],
    ['POST', '/landing-pages/templates/any-slug/edit-session'],
    ['POST', '/landing-pages/templates/any-slug/save-from-session'],
    ['POST', '/landing-pages/templates/any-slug/publish'],
    ['GET', '/landing-pages/templates/any-slug/versions'],
    ['POST', '/landing-pages/templates/any-slug/versions/1/restore'],
  ] as const;
  for (const [method, path] of routes) {
    const r = method === 'GET' ? await pub.get(path) : await pub.post(path, {});
    assert.equal(r.status, 401, `${method} ${path}: không token phải 401`);
  }
  });
  tc("LP09-S01-TC004", "SUPER_ADMIN thuộc tổ chức nào cũng dùng được (HTTP)", { prio: 'P1', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const r = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body) || Array.isArray(r.body.items));
  });
  todo("LP09-S01-TC005", "Menu Quản lý Templates chỉ hiện cho SUPER_ADMIN", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S01-TC006", "Nút Sửa mẫu gốc chỉ hiện cho SUPER_ADMIN", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP09-S02", "Chế độ 2: sửa trực tiếp mẫu gốc (phiên sửa mẫu)", () => {
  tc("LP09-S02-TC001", "Mở phiên sửa mẫu lần đầu (HTTP)", { prio: 'P0', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const slug = (Array.isArray(list.body) ? list.body : list.body.items)[0].slug as string;
  const r = await admin.post(`/landing-pages/templates/${slug}/edit-session`, {});
  assert.ok(r.status < 300, `HTTP ${r.status}`);
  assert.ok(r.body.pageId, 'trả pageId của trang làm việc');
  assert.equal(r.body.slug, slug);
  assert.equal(typeof r.body.reused, 'boolean');
  });
  todo("LP09-S02-TC002", "API edit-session trả đủ thông tin", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S02-TC003", "Mở lại phiên dùng lại cùng trang (LP09-F2) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const slug = (Array.isArray(list.body) ? list.body : list.body.items)[0].slug as string;
  const first = await admin.post(`/landing-pages/templates/${slug}/edit-session`, {});
  const second = await admin.post(`/landing-pages/templates/${slug}/edit-session`, {});
  assert.equal(second.body.pageId, first.body.pageId, 'mở lại dùng đúng trang làm việc cũ');
  assert.equal(second.body.reused, true);
  });
  todo("LP09-S02-TC004", "Mở lại phiên giữ bản nháp cũ dù mẫu đã đổi (LP09-F2)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC005", "Đặt lại phiên về mẫu hiện tại", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC006", "Lưu vào mẫu (bản nháp)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC007", "Ảnh đại diện không đổi khi chỉ lưu nháp (LP09-F4)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC008", "Lưu và xuất bản mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC009", "Thoát không lưu vào mẫu (LP09-F3)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC010", "Lưu khi builder đang xung đột hoặc chưa lưu kịp", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC011", "Lưu mẫu khi chưa mở phiên", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC012", "Không lưu mẫu trống", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S02-TC013", "Mẫu chưa từng xuất bản giữ trạng thái nháp", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S02-TC014", "Slug mẫu không tồn tại (HTTP)", { prio: 'P2', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const r = await admin.post('/landing-pages/templates/khong-ton-tai-lpt-xyz/edit-session', {});
  assert.equal(r.status, 404);
  });
  todo("LP09-S02-TC015", "Hai admin cùng tổ chức sửa một mẫu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP09-S03", "Cách ly trang làm việc khỏi người dùng", () => {
  tc("LP09-S03-TC001", "Xuất bản trang làm việc bằng API thường bị chặn (HTTP)", { prio: 'P0', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const items = Array.isArray(list.body) ? list.body : list.body.items;
  const slug = items[0].slug as string;
  fake('slug mẫu dùng để mở phiên', slug);
  const session = await admin.post(`/landing-pages/templates/${slug}/edit-session`, {});
  assert.ok(session.status < 300, `mở phiên phải thành công, nhận ${session.status}`);
  const workId = session.body.pageId;
  const r = await admin.post(`/landing-pages/${workId}/publish`, {});
  assert.equal(r.status, 400, 'xuất bản trang làm việc bằng API thường phải bị chặn');
  assert.match(JSON.stringify(r.body), /phiên sửa mẫu gốc/);
  });
  todo("LP09-S03-TC002", "Trang làm việc không hiện trong danh sách và tổng quan", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S03-TC003", "Trang làm việc không mở được ở /p/slug", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S03-TC004", "Trang khách tạo từ mẫu trước đó không đổi", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S03-TC005", "Chỉ ghi vào bảng mẫu, không ghi vào trang người dùng", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S03-TC006", "Tên trang làm việc quá dài", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP09-S04", "Tải mẫu (một mẫu và tất cả)", () => {
  todo("LP09-S04-TC001", "Tải một mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S04-TC002", "Manifest đúng", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S04-TC003", "Khóa nhạy cảm bị loại khỏi gói (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const dirty = {
    name: 'Mẫu', password: 'p', apiKey: 'k', nested: { clientSecret: 's', Authorization: 'Bearer x', keep: 1 },
    list: [{ access_token: 't', ok: true }], themeTokens: { primary: '#2563eb' },
  };
  fake('dữ liệu có khóa nhạy cảm', dirty);
  const clean = stripSensitiveKeys(dirty) as Record<string, any>;
  actual('sau khi lọc', clean);
  assert.equal('password' in clean, false);
  assert.equal('apiKey' in clean, false);
  assert.equal('clientSecret' in clean.nested, false);
  assert.equal('Authorization' in clean.nested, false);
  assert.equal(clean.nested.keep, 1);
  assert.equal('access_token' in clean.list[0], false);
  assert.equal(clean.list[0].ok, true);
  assert.deepEqual(clean.themeTokens, { primary: '#2563eb' }, 'khóa themeTokens (tên chứa "token") là ngoại lệ có chủ đích, màu sắc được giữ');
  });
  todo("LP09-S04-TC004", "Tải tất cả mẫu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S04-TC005", "Mỗi gói bên trong mở lại được (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const buf = validPack('lpt-roundtrip');
  fake('gói ZIP tự dựng', { bytes: buf.length });
  const entries = readZip(buf);
  assert.deepEqual([...entries.keys()].sort(), ['manifest.json', 'template.json']);
  const parsed = parseTemplatePack(buf);
  actual('manifest sau khi đọc', parsed.manifest);
  assert.equal(parsed.manifest.slug, 'lpt-roundtrip');
  assert.equal(parsed.manifest.format, 'aibeego.landing-template');
  assert.equal(parsed.htmlOnly, false);
  });
  todo("LP09-S04-TC006", "Tải tất cả khi danh sách trống", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S04-TC007", "Tải khi mạng lỗi", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S04-TC008", "Gói chỉ chứa HTML nguồn (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  const parsed = parseTemplatePack(zip({ 'index.html': HTML_SAMPLE }));
  actual('gói chỉ có HTML', { slug: parsed.manifest.slug, name: parsed.manifest.name, htmlOnly: parsed.htmlOnly, tags: parsed.manifest.tags });
  assert.equal(parsed.htmlOnly, true);
  assert.equal(parsed.manifest.name, 'LPT HTML');
  assert.equal(parsed.manifest.slug, 'lpt-html');
  assert.ok(parsed.manifest.tags.includes('source:html'));
  });
});

suite("LP09-S05", "Upload mẫu (một mẫu và hàng loạt)", () => {
  todo("LP09-S05-TC001", "Upload hàng loạt: tạo mới và cập nhật", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S05-TC002", "Lỗi một tệp không dừng cả lô (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const good = { originalname: 'tot.zip', buffer: validPack('lpt-tot') };
  const bad = { originalname: 'hong.zip', buffer: Buffer.from('rác') };
  const out = deduplicateTemplateBulkFiles([good, bad]);
  assert.equal(out.length, 2, 'tệp hỏng được giữ lại để báo lỗi riêng, không làm dừng cả lô');
  });
  tc("LP09-S05-TC003", "ZIP tổng chứa nhiều gói (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const inner = (slug: string) => ({ name: `${slug}.zip`, data: validPack(slug) });
  const bundle = zip({ 'tong/a.zip': inner('lpt-a').data, 'tong/b.zip': inner('lpt-b').data });
  fake('ZIP tổng chứa 2 gói', ['tong/a.zip', 'tong/b.zip']);
  const out = expandTemplateBulkFile({ originalname: 'tong.zip', buffer: bundle });
  actual('các gói tách ra', out.map((f) => f.originalname));
  assert.equal(out.length, 2);
  });
  tc("LP09-S05-TC004", "Gộp trùng cùng slug (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const a = { originalname: 'a.zip', buffer: validPack('lpt-trung'), bulkSource: 'zip' as const };
  const b = { originalname: 'b.zip', buffer: validPack('lpt-trung'), bulkSource: 'zip' as const };
  assert.equal(deduplicateTemplateBulkFiles([a, b]).length, 1, 'cùng slug + cùng nội dung → giữ một bản');
  const diff = { originalname: 'c.zip', buffer: zip({ 'manifest.json': JSON.stringify(manifestOf({ slug: 'lpt-trung' })), 'template.json': JSON.stringify(templateOf([{ id: 'x', type: 'CTA', enabled: true, headline: 'Khác' }])) }), bulkSource: 'zip' as const };
  assert.throws(() => deduplicateTemplateBulkFiles([a, diff]), (e: unknown) => e instanceof TemplatePackError && /có nhiều bản khác nhau/.test((e as Error).message));
  const folder = { originalname: 'thu-muc.zip', buffer: diff.buffer, bulkSource: 'folder' as const };
  const kept = deduplicateTemplateBulkFiles([a, folder]);
  assert.equal(kept.length, 1);
  assert.equal(kept[0]!.bulkSource, 'folder', 'ưu tiên bản thư mục nguồn');
  });
  tc("LP09-S05-TC005", "Cấu hình ưu tiên nguồn (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  assert.deepEqual(parseTemplateBulkPreferences(undefined), {});
  assert.deepEqual(parseTemplateBulkPreferences('{"lpt-a":"ban-nguon"}'), { 'lpt-a': 'ban-nguon' });
  for (const bad of ['khong json', '[]', '"x"', '{"Sai Slug":"a"}', '{"lpt-a":5}', `{"lpt-a":"${'a'.repeat(121)}"}`]) {
    throwsPack(() => parseTemplateBulkPreferences(bad), /Cấu hình chọn bản template không hợp lệ/);
  }
  });
  tc("LP09-S05-TC006", "Vượt 300 mẫu (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const files = Array.from({ length: 301 }, (_, i) => ({
    originalname: `m${i}.zip`, buffer: validPack(`lpt-m${i}`), bulkSource: 'zip' as const,
  }));
  const entries: Record<string, Buffer> = {};
  for (const f of files) entries[`bo/${f.originalname}`] = f.buffer!;
  const big = zip(entries);
  fake('ZIP tổng 301 mẫu khác nhau', { bytes: big.length });
  assert.throws(() => expandTemplateBulkFile({ originalname: 'ba-tram-mot.zip', buffer: big }), (e: unknown) => e instanceof TemplatePackError && /tối đa 300 mẫu/.test((e as Error).message));
  });
  todo("LP09-S05-TC007", "Không chọn tệp nào", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S05-TC008", "Giới hạn dung lượng giao diện", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S05-TC009", "Giới hạn nginx (LP09-F5) (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  // LP09-F5: giới hạn của code là 256 MB; nginx phía trước phải cho phép tương ứng (kiểm tra cấu hình thủ công)
  assert.equal(TEMPLATE_BULK_MAX_ZIP_BYTES, 256 * 1024 * 1024);
  assert.equal(TEMPLATE_PACK_MAX_ZIP_BYTES, 20 * 1024 * 1024);
  });
  tc("LP09-S05-TC010", "Định dạng tệp không hỗ trợ (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  throwsPack(() => parseTemplatePack(Buffer.from('không phải zip')), /ZIP|Dung lượng|hỏng/i);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': '{}', 'template.json': '{}', 'virus.exe': 'x' })), /File không được phép trong gói: virus\.exe/);
  // tệp trong assets/: chỉ nhận png, jpg, jpeg, webp, gif; tên 1–81 ký tự an toàn
  const asset = (name: string) => validPack('lpt-asset', { [`assets/${name}`]: PNG_1PX });
  assert.doesNotThrow(() => parseTemplatePack(asset('anh.png')));
  throwsPack(() => parseTemplatePack(asset('anh.exe')), /Loại file không được phép/);
  throwsPack(() => parseTemplatePack(asset('.an')), /Tên file không được phép/);
  });
  tc("LP09-S05-TC011", "HTML quá lớn, ZIP quá lớn (một mẫu) (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const tooBig = Buffer.alloc(TEMPLATE_PACK_MAX_ZIP_BYTES + 1);
  fake('ZIP 20 MB + 1 byte', { bytes: tooBig.length });
  throwsPack(() => readZip(tooBig), /Dung lượng ZIP không hợp lệ/);
  throwsPack(() => parseHtmlDocument('lon.html', Buffer.alloc(1_500_001, 97)), /Dung lượng file HTML không hợp lệ/);
  throwsPack(() => parseHtmlDocument('rong.html', Buffer.alloc(0)), /Dung lượng file HTML không hợp lệ/);
  assert.equal(TEMPLATE_PACK_MAX_ZIP_BYTES, 20 * 1024 * 1024);
  assert.equal(TEMPLATE_PACK_MAX_FILES, 40);
  });
  tc("LP09-S05-TC012", "Gói thiếu thành phần hoặc sai (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  throwsPack(() => parseTemplatePack(zip({ 'readme.md': 'x' })), /ZIP cần manifest\.json và template\.json|file index\.html/);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf()) })), /ZIP cần template\.json/);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': 'khong phai json', 'template.json': '{}' })), /manifest\.json không phải JSON hợp lệ/);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf({ format: 'sai' })), 'template.json': JSON.stringify(templateOf()) })), /Định dạng gói không hỗ trợ/);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf({ formatVersion: 2 })), 'template.json': JSON.stringify(templateOf()) })), /Định dạng gói không hỗ trợ/);
  });
  tc("LP09-S05-TC013", "Mẫu phải giữ khối thu lead (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const noLead = templateOf([{ id: 'h', type: 'Hero', enabled: true, headline: 'Không có form' }]);
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf()), 'template.json': JSON.stringify(noLead) })), /Mẫu phải giữ block LeadForm hoặc CTA/);
  const withCta = templateOf([{ id: 'c', type: 'CTA', enabled: true, headline: 'CTA' }]);
  assert.doesNotThrow(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf()), 'template.json': JSON.stringify(withCta) })));
  throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf()), 'template.json': JSON.stringify(templateOf([])) })), /danh sách blocks hợp lệ/);
  });
  tc("LP09-S05-TC014", "Category và theme hợp lệ (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const bad: Array<[string, Record<string, unknown>, RegExp]> = [
    ['slug viết hoa', { slug: 'Sai-Slug' }, /slug không hợp lệ/],
    ['slug có khoảng trắng', { slug: 'sai slug' }, /slug không hợp lệ/],
    ['slug 81 ký tự', { slug: 'a'.repeat(81) }, /slug không hợp lệ/],
    ['tên rỗng', { name: '' }, /Tên mẫu không hợp lệ/],
    ['tên 121 ký tự', { name: 'N'.repeat(121) }, /Tên mẫu không hợp lệ/],
    ['category rỗng', { category: '' }, /Category không hợp lệ/],
    ['category 41 ký tự', { category: 'c'.repeat(41) }, /Category không hợp lệ/],
    ['theme chữ thường', { theme: 'modern' }, /Theme không hợp lệ/],
  ];
  for (const [label, over, re] of bad) {
    fake(label, over);
    throwsPack(() => parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf(over)), 'template.json': JSON.stringify(templateOf()) })), re);
  }
  const edge = parseTemplatePack(zip({ 'manifest.json': JSON.stringify(manifestOf({ slug: 'a'.repeat(80), name: 'N'.repeat(120), category: 'c'.repeat(40) })), 'template.json': JSON.stringify(templateOf()) }));
  assert.equal(edge.manifest.slug.length, 80);
  });
  todo("LP09-S05-TC015", "Slug mẫu mới đã tồn tại (một mẫu)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S05-TC016", "Cập nhật mẫu: slug trong gói phải khớp", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S05-TC017", "Cập nhật mẫu đã xuất bản", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S05-TC018", "Tệp HTML được chuyển thành mẫu chỉnh sửa được (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  const parsed = parseHtmlDocument('Trang Chu Dep.html', Buffer.from(HTML_SAMPLE));
  const blocks = (parsed.template as any).blocks as Array<{ type: string }>;
  actual('các block tạo ra từ HTML', blocks.map((b) => b.type));
  assert.ok(blocks.length >= 1);
  assert.ok((parsed.template as any).meta.isolatedScriptCount >= 1, 'script trong HTML được đếm (cách ly)');
  assert.equal(parsed.htmlOnly, true);
  });
  todo("LP09-S05-TC019", "Giao diện báo cáo kết quả", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP09-S06", "Xuất bản mẫu, lịch sử và khôi phục", () => {
  todo("LP09-S06-TC001", "Xuất bản mẫu từ trang quản lý", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S06-TC002", "Danh sách phiên bản của mẫu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const slug = (Array.isArray(list.body) ? list.body : list.body.items)[0].slug as string;
  const r = await admin.get(`/landing-pages/templates/${slug}/versions`);
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body) || Array.isArray(r.body.items));
  });
  todo("LP09-S06-TC003", "Khôi phục phiên bản mẫu cũ (LP09-F7)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP09-S06-TC004", "Khôi phục phiên bản không tồn tại (HTTP)", { prio: 'P1', layer: 'api', accounts: ['SUPER_ADMIN'] }, async () => {
  const admin = await as('SUPER_ADMIN');
  const list = await admin.get('/landing-pages/templates', { query: { includeSystem: true } });
  const slug = (Array.isArray(list.body) ? list.body : list.body.items)[0].slug as string;
  const r = await admin.post(`/landing-pages/templates/${slug}/versions/999999/restore`, {});
  assert.equal(r.status, 404);
  });
  todo("LP09-S06-TC005", "Khởi động lại API không ghi đè mẫu đã sửa", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S06-TC006", "Thay đổi mẫu không lan sang trang khách", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S06-TC007", "Hai admin cùng thao tác trên một mẫu", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP09-S07", "Giao diện trang Quản lý Templates", () => {
  todo("LP09-S07-TC001", "Danh sách mẫu và số liệu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S07-TC002", "Nút Sửa dẫn vào builder", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S07-TC003", "Trạng thái bận khóa các nút", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S07-TC004", "Lỗi tải danh sách", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S07-TC005", "Giao diện tiếng Anh và Việt", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP09-S07-TC006", "Responsive", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
