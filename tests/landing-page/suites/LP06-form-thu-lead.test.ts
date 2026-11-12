/**
 * LP06: Form thu lead trên trang công khai
 * Tài liệu: docs/test case/suites/LP06-form-thu-lead-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { after } from 'node:test';
import { closeBrowser, horizontalOverflow, withPublicPage } from '../support/browser';
after(closeBrowser);
import { as } from '../support/api';
import { findLeads, publishedPage, submitLead, trackEvent, useCleanup, newPage, newSavedPage, autosave } from '../support/lp';
import { LEAD_CASES, VALID_LEAD, FAKE_EVENT, freshEmail, freshIp, freshPhone, leadWith } from '../fixtures/leads';
import { SMOKE } from '../fixtures/specs';

useCleanup();

suite("LP06-S01", "Gửi form thành công", () => {
  tc("LP06-S01-TC001", "Gửi form trang smoke và xác nhận lead đúng tổ chức, đúng nguồn [SMOKE] (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'], smoke: 'SMOKE-5' }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await publishedPage(a, SMOKE.headline);
  const body = leadWith({ fields: { name: SMOKE.leadName, phone: SMOKE.leadPhone, email: SMOKE.leadEmail } });
  const ip = freshIp();
  fake('IP giả gửi qua X-Forwarded-For', ip);
  const r = await submitLead(page.slug, body, ip);
  assert.ok(r.status < 300, `gửi form phải thành công, nhận ${r.status}`);
  assert.equal(r.body.ok, true);
  const mine = await findLeads(a, SMOKE.leadPhone);
  const lead = mine.find((l) => String(l.phone ?? '').replace(/\D/g, '').endsWith(SMOKE.leadPhone.slice(-9)));
  assert.ok(lead, 'lead phải xuất hiện trong CRM của tổ chức A');
  assert.match(JSON.stringify(lead), /landing[_ -]?page/i, 'nguồn lead là Landing Page');
  assert.match(JSON.stringify(lead), new RegExp(page.id), 'lead gắn đúng trang (landingPageId trong ghi chú/trường)');
  const theirs = await findLeads(b, SMOKE.leadPhone);
  assert.equal(theirs.length, 0, 'tổ chức B không thấy lead của tổ chức A');
  });
  tc("LP06-S01-TC002", "Phản hồi API đúng cấu trúc (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-RESP');
  const r = await submitLead(page.slug, leadWith({ fields: { name: 'Resp', phone: freshPhone() } }), freshIp());
  assert.ok(r.status < 300);
  assert.equal(r.body.ok, true);
  assert.notEqual(r.body.skipped, true, 'gửi hợp lệ không bị coi là spam');
  });
  tc("LP06-S01-TC003", "Chỉ có email (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-EMAIL');
  const email = freshEmail();
  const r = await submitLead(page.slug, { fields: { name: 'Chỉ Email', email } }, freshIp());
  assert.ok(r.status < 300);
  assert.equal(r.body.ok, true);
  assert.ok((await findLeads(c, email)).length >= 1);
  });
  tc("LP06-S01-TC004", "Chỉ có số điện thoại (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-PHONE');
  const phone = freshPhone();
  const r = await submitLead(page.slug, { fields: { name: 'Chỉ SĐT', phone } }, freshIp());
  assert.ok(r.status < 300);
  assert.ok((await findLeads(c, phone)).length >= 1);
  });
  todo("LP06-S01-TC005", "Tên trường thay thế được nhận diện", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC006", "Không có tên", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC007", "Các trường phụ vào ghi chú", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC008", "Thuộc tính truy vết mặc định", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC009", "Thuộc tính truy vết UTM từ link", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC010", "Gửi từ nhiều khối form", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S01-TC011", "Gửi form khi đang xem Preview", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S01-TC012", "Nhấp đúp nút gửi (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-DOUBLE');
  const phone = freshPhone();
  const ip = freshIp();
  const body = { fields: { name: 'Nhấp đúp', phone } };
  const [x, y] = await Promise.all([submitLead(page.slug, body, ip), submitLead(page.slug, body, ip)]);
  fake('2 request y hệt, gửi đồng thời', [x.status, y.status]);
  const leads = await findLeads(c, phone);
  assert.equal(leads.length, 1, 'chỉ có một lead trong CRM dù bấm hai lần');
  });
});

suite("LP06-S02", "Kiểm tra dữ liệu và làm sạch", () => {
  tc("LP06-S02-TC001", "Thiếu cả SĐT và email (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-VALID');
  const r = await submitLead(page.slug, LEAD_CASES.thieuCaHai, freshIp());
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Cần ít nhất Số điện thoại hoặc Email/);
  });
  tc("LP06-S02-TC002", "fields rỗng hoặc sai kiểu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-TYPES');
  for (const [label, body] of [['thiếu fields', {}], ['fields là chuỗi', { fields: 'abc' }], ['fields là null', { fields: null }]] as const) {
    fake(label, body);
    const r = await submitLead(page.slug, body, freshIp());
    assert.equal(r.status, 400, label);
  }
  });
  todo("LP06-S02-TC003", "SĐT và email chỉ gồm khoảng trắng", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC004", "Email sai định dạng (LP06-F1)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC005", "SĐT chứa chữ và ký tự lạ (LP06-F1)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC006", "Trường quá dài", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC007", "Tên trường lạ bị làm sạch", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S02-TC008", "Chèn thẻ HTML (LP06-F4) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-HTML');
  const phone = freshPhone();
  sent('tên chứa HTML', LEAD_CASES.htmlTrongTen.fields.name);
  const r = await submitLead(page.slug, { fields: { ...LEAD_CASES.htmlTrongTen.fields, phone } }, freshIp());
  assert.ok(r.status < 300);
  const lead = (await findLeads(c, phone))[0];
  actual('lead lưu', lead?.name);
  assert.equal(/<[^>]+>/.test(String(lead?.name)), false, 'thẻ HTML bị loại khỏi tên');
  });
  todo("LP06-S02-TC009", "Ký tự < đứng riêng (LP06-F4)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC010", "SQL injection trong trường", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC011", "Unicode và emoji", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S02-TC012", "Giới hạn kích thước body", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP06-S03", "Chống spam, chống trùng và giới hạn tần suất", () => {
  tc("LP06-S03-TC001", "Honeypot (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-HONEYPOT');
  const phone = freshPhone();
  const r = await submitLead(page.slug, { fields: { name: 'Bot', phone }, website: 'http://spam.example' }, freshIp());
  assert.equal(r.body.ok, true, 'bot nhận phản hồi thành công giả');
  assert.equal(r.body.skipped, true);
  assert.equal(r.body.reason, 'spam');
  assert.equal((await findLeads(c, phone)).length, 0, 'không tạo lead');
  });
  todo("LP06-S03-TC002", "Honeypot với trang không tồn tại", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S03-TC003", "Gửi lặp cùng SĐT trong 12 giây (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-DEDUPE');
  const phone = freshPhone();
  const ip = freshIp();
  const first = await submitLead(page.slug, { fields: { name: 'Lần 1', phone } }, ip);
  assert.ok(first.status < 300);
  const second = await submitLead(page.slug, { fields: { name: 'Lần 2', phone } }, ip);
  assert.equal(second.status, 429, 'gửi lại cùng SĐT trong 12 giây bị chặn');
  assert.match(JSON.stringify(second.body), /Vui lòng đợi một lát trước khi gửi lại/);
  });
  todo("LP06-S03-TC004", "Gửi lại sau 12 giây gộp vào lead cũ", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S03-TC005", "Chống lặp cùng email, khác hoa thường", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S03-TC006", "Giới hạn 8 lần mỗi 10 phút cho một trang và một IP (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-RATE');
  const ip = freshIp();
  const results: number[] = [];
  for (let i = 0; i < 9; i++) {
    const r = await submitLead(page.slug, { fields: { name: `Lần ${i + 1}`, phone: freshPhone() } }, ip);
    results.push(r.status);
  }
  actual('mã trạng thái 9 lần gửi', results);
  assert.deepEqual(results.slice(0, 8).every((s) => s < 300), true, '8 lần đầu thành công');
  assert.equal(results[8], 429, 'lần thứ 9 trong 10 phút bị chặn (8 lần/10 phút/trang/IP)');
  });
  todo("LP06-S03-TC007", "Giới hạn 30 lần mỗi giờ cho một IP", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S03-TC008", "Giả IP qua X-Forwarded-For (LP06-F7)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S03-TC009", "Người dùng thật cùng mạng công ty", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP06-S04", "Lead trong CRM: đúng tổ chức, nguồn, gán và thẻ", () => {
  todo("LP06-S04-TC001", "Lead hiển thị ở /leads với nguồn Landing Page", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC002", "Tách dữ liệu giữa hai tổ chức", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC003", "Nguồn lead tự tạo khi chưa có", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC004", "Nguồn lead bị tắt được bật lại", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC005", "Cấu hình CRM của khối form", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC006", "Lead gắn đúng trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC007", "Điểm lead tăng khi gửi form", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S04-TC008", "Xuất lead cho khách agency", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP06-S05", "Theo dõi sự kiện trang công khai", () => {
  tc("LP06-S05-TC001", "Ghi sự kiện xem trang (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'EVENT-VIEW');
  const r = await trackEvent(page.slug, FAKE_EVENT, freshIp());
  assert.ok(r.status < 300);
  });
  todo("LP06-S05-TC002", "Ghi sự kiện bấm CTA và bắt đầu form", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S05-TC003", "eventType không hợp lệ (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'EVENT-INVALID');
  const r = await trackEvent(page.slug, { ...FAKE_EVENT, eventType: 'HACK' }, freshIp());
  assert.equal(r.status, 400, 'eventType ngoài PAGE_VIEW|CTA_CLICK|FORM_START|FORM_SUBMIT|LEAD bị từ chối');
  });
  todo("LP06-S05-TC004", "Gửi form tạo sự kiện lặp (LP06-F5)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S05-TC005", "Giới hạn tần suất sự kiện", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S05-TC006", "Sự kiện honeypot", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S05-TC007", "Sự kiện cho trang chưa xuất bản", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S05-TC008", "Khách giả sự kiện LEAD", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP06-S06", "Trạng thái trang, bản xem trước và định danh tổ chức", () => {
  tc("LP06-S06-TC001", "Trang đã hủy xuất bản không nhận lead (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'LEAD-UNPUBLISHED');
  await c.post(`/landing-pages/${page.id}/unpublish`);
  const phone = freshPhone();
  const r = await submitLead(page.slug, { fields: { name: 'Sau khi gỡ', phone } }, freshIp());
  assert.equal(r.status, 404);
  assert.equal((await findLeads(c, phone)).length, 0);
  });
  tc("LP06-S06-TC002", "Trang nháp chưa từng xuất bản (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'LEAD-DRAFT');
  const r = await submitLead(page.slug, { fields: { name: 'Nháp', phone: freshPhone() } }, freshIp());
  assert.equal(r.status, 404);
  });
  todo("LP06-S06-TC003", "Trang đã lưu trữ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S06-TC004", "Slug không tồn tại (HTTP)", { prio: 'P2', layer: 'api' }, async () => {
  const r = await submitLead('khong-ton-tai-lpt-xyz', { fields: { name: 'X', phone: freshPhone() } }, freshIp());
  assert.equal(r.status, 404);
  });
  todo("LP06-S06-TC005", "Slug trùng giữa hai tổ chức (LP06-F6)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S06-TC006", "Form khi chuyển renderer của trang cũ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S06-TC007", "Mất mạng khi gửi form", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP06-S07", "Hiển thị form, theo ngành và responsive", () => {
  todo("LP06-S07-TC001", "Form khóa học không có Công ty/Quy mô", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S07-TC002", "Form B2B có Công ty", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S07-TC003", "Form trong hero không nhảy vị trí", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP06-S07-TC004", "Form không tràn ngang (HTTP)", { prio: 'P1', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'FORM-KHONG-TRAN');
  for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
    await withPublicPage(page.slug, vp, async (p) => {
      const form = p.locator('form').first();
      assert.ok(await form.isVisible());
      const box = await form.boundingBox();
      actual(`${vp} khung form`, box);
      assert.ok(box && box.x >= 0 && box.x + box.width <= (p.viewportSize()?.width ?? 0) + 1, `${vp}: form nằm trong khung nhìn`);
      assert.equal(await horizontalOverflow(p), 0);
    });
  }
  });
  todo("LP06-S07-TC005", "Thông báo lỗi và thành công hiển thị", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S07-TC006", "Bàn phím và hỗ trợ truy cập", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP06-S07-TC007", "Tự điền của trình duyệt", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
