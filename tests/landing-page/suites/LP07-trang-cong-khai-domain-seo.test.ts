/**
 * LP07: Trang công khai, preview, tên miền, SEO
 * Tài liệu: docs/test case/suites/LP07-trang-cong-khai-domain-seo-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { after } from 'node:test';
import { closeBrowser, horizontalOverflow, withPublicPage, VIEWPORTS, type ViewportName } from '../support/browser';
after(closeBrowser);
import {
  landingPageCnameTarget, normalizeLandingCustomDomain, isValidLandingCustomDomain,
} from '../../../apps/api/src/landing-pages/landing-page-domain-dns.util';
import { as, pub } from '../support/api';
import { autosave, getPage, newPage, newSavedPage, publicGet, publish, useCleanup } from '../support/lp';
import { makeSpec, SMOKE } from '../fixtures/specs';
import { DOMAIN_INPUTS, INTERNAL_DOMAINS } from '../fixtures/domains';
import { uniqSlug } from '../fixtures/run';

useCleanup();

suite("LP07-S01", "Xem trang công khai", () => {
  tc("LP07-S01-TC001", "Mở trang smoke trên /p/slug [SMOKE] (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'], smoke: 'SMOKE-4' }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c, SMOKE.pageName);
  await autosave(c, page.id, { spec: makeSpec({ headline: SMOKE.headline, sub: SMOKE.sub }), base: 0, revision: 1, requestId: 'smoke-lp07' });
  assert.ok((await publish(c, page.id, 1)).status < 300);
  const r = await publicGet(page.slug);
  assert.equal(r.status, 200);
  const text = JSON.stringify(r.body);
  assert.ok(text.includes(SMOKE.headline) && text.includes(SMOKE.sub), 'trang công khai trả đúng tiêu đề và phụ đề đã xuất bản');
  assert.equal(r.body.slug, page.slug);
  });
  todo("LP07-S01-TC002", "Nội dung giống bản trong builder", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S01-TC003", "Phần tử vị trí tự do hiển thị đúng", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S01-TC004", "Phần tử ẩn không hiển thị", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S01-TC005", "Responsive ba khung hình (HTTP)", { prio: 'P1', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'PUBLIC-3-KHUNG');
  await publish(c, page.id, 1);
  for (const vp of ['mobile', 'tablet', 'desktop'] as ViewportName[]) {
    await withPublicPage(page.slug, vp, async (p, errors) => {
      assert.equal(await horizontalOverflow(p), 0, `${vp}: không tràn ngang`);
      assert.deepEqual(errors, [], `${vp}: không lỗi console`);
      const text = await p.locator('body').innerText();
      assert.ok(text.includes('PUBLIC-3-KHUNG'), `${vp}: hiển thị tiêu đề đã xuất bản`);
    });
  }
  });
  tc("LP07-S01-TC006", "Nội dung đã làm sạch, không lộ dữ liệu builder (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'SANITIZE');
  await publish(c, page.id, 1);
  const r = await publicGet(page.slug);
  const text = JSON.stringify(r.body);
  for (const leaked of ['lastAutosaveRequestHash', 'lastAutosaveRequestId', 'draftSpec', 'organizationId']) {
    assert.equal(text.includes(leaked), false, `không được lộ "${leaked}" ra trang công khai`);
  }
  });
  todo("LP07-S01-TC007", "Chữ Unicode và emoji", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S01-TC008", "Ảnh tải được, ảnh lỗi không vỡ trang", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S01-TC009", "Mở bằng chữ hoa thường khác nhau", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S01-TC010", "Slug có ký tự đặc biệt", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP07-S02", "Trạng thái trang và trả về 404", () => {
  tc("LP07-S02-TC001", "Trang nháp chưa xuất bản trả 404 (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'CHUA-XUAT-BAN');
  const r = await publicGet(page.slug);
  assert.equal(r.status, 404);
  });
  tc("LP07-S02-TC002", "Trang bị gỡ xuất bản trả 404 (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'SE-BI-GO');
  await publish(c, page.id, 1);
  assert.equal((await publicGet(page.slug)).status, 200);
  await c.post(`/landing-pages/${page.id}/unpublish`);
  assert.equal((await publicGet(page.slug)).status, 404);
  });
  tc("LP07-S02-TC003", "Trang đã lưu trữ trả 404 (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'SE-LUU-TRU');
  await publish(c, page.id, 1);
  const r = await c.post(`/landing-pages/${page.id}/archive`);
  assert.ok(r.status < 300);
  assert.equal((await publicGet(page.slug)).status, 404);
  });
  tc("LP07-S02-TC004", "Trang bị xóa trả 404 (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'SE-BI-XOA');
  await publish(c, page.id, 1);
  const del = await c.post(`/landing-pages/${page.id}/delete`);
  assert.ok(del.status < 300);
  assert.equal((await publicGet(page.slug)).status, 404);
  });
  todo("LP07-S02-TC005", "Trang tạm sửa mẫu không công khai", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S02-TC006", "Lỗi API làm trang trả 404 thay vì 500", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP07-S03", "SEO và siêu dữ liệu", () => {
  todo("LP07-S03-TC001", "Tiêu đề và mô tả trong HTML", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S03-TC002", "Canonical", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S03-TC003", "Robots index/noindex", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S03-TC004", "Open Graph và Twitter card", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S03-TC005", "JSON-LD", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S03-TC006", "Lưu SEO qua autosave đồng bộ vào bản ghi (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const s = makeSpec({ headline: 'SEO', seoTitle: 'Tiêu đề SEO đồng bộ' });
  s.seo.canonical = 'https://example.com/trang-chinh';
  s.seo.robotsIndex = false;
  await autosave(c, page.id, { spec: s, base: 0, revision: 1, requestId: 'seo-sync' });
  await publish(c, page.id, 1);
  const r = await publicGet(page.slug);
  assert.equal(r.body.seo.title, 'Tiêu đề SEO đồng bộ');
  assert.equal(r.body.seo.canonical, 'https://example.com/trang-chinh');
  assert.equal(r.body.seo.robotsIndex, false);
  });
  tc("LP07-S03-TC007", "Giới hạn độ dài SEO qua PATCH (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const ok = await c.patch(`/landing-pages/${page.id}`, { seoTitle: 'T'.repeat(200) });
  assert.ok(ok.status < 300, 'seoTitle 200 ký tự được nhận');
  const bad = await c.patch(`/landing-pages/${page.id}`, { seoTitle: 'T'.repeat(201) });
  assert.equal(bad.status, 400, 'seoTitle 201 ký tự bị từ chối (UpdateLandingPageDto)');
  });
  todo("LP07-S03-TC008", "Ký tự đặc biệt trong SEO", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP07-S04", "Link xem trước bản nháp", () => {
  tc("LP07-S04-TC001", "Tạo link xem trước (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'XEM-TRUOC-NHAP');
  const t = await c.post(`/landing-pages/${page.id}/preview-token`, {});
  assert.ok(t.status < 300);
  const path = t.body.previewPath ?? `/p/preview/${t.body.token}`;
  const token = String(path).split('/').pop()!;
  assert.match(token, /^[a-f0-9]{64}$/, 'token 32 byte hex');
  const view = await pub.get(`/landing-pages/public/preview/${token}`);
  assert.equal(view.status, 200);
  assert.ok(JSON.stringify(view.body).includes('XEM-TRUOC-NHAP'), 'xem được bản nháp dù chưa xuất bản');
  });
  todo("LP07-S04-TC002", "Chọn thời hạn", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S04-TC003", "Token mới thay token cũ (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'TOKEN-MOI');
  const t1 = await c.post(`/landing-pages/${page.id}/preview-token`, {});
  const t2 = await c.post(`/landing-pages/${page.id}/preview-token`, {});
  const tok = (r: any) => String(r.body.previewPath ?? r.body.token).split('/').pop()!;
  assert.notEqual(tok(t1), tok(t2));
  assert.equal((await pub.get(`/landing-pages/public/preview/${tok(t1)}`)).status, 404, 'token cũ vô hiệu');
  assert.equal((await pub.get(`/landing-pages/public/preview/${tok(t2)}`)).status, 200);
  });
  tc("LP07-S04-TC004", "Thu hồi link (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'THU-HOI');
  const t = await c.post(`/landing-pages/${page.id}/preview-token`, {});
  const token = String(t.body.previewPath ?? t.body.token).split('/').pop()!;
  const rv = await c.post(`/landing-pages/${page.id}/preview-token/revoke`);
  assert.ok(rv.status < 300);
  assert.equal((await pub.get(`/landing-pages/public/preview/${token}`)).status, 404);
  });
  todo("LP07-S04-TC005", "Link hết hạn", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S04-TC006", "Xem trước hiển thị bản nháp mới nhất", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S04-TC007", "Trạng thái token", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S04-TC008", "Token sai hoặc quá ngắn (LP07-F6) (HTTP)", { prio: 'P1', layer: 'api' }, async () => {
  for (const bad of ['abc', '0'.repeat(63), 'g'.repeat(64), '../../etc/passwd']) {
    fake('token sai', bad);
    const r = await pub.get(`/landing-pages/public/preview/${encodeURIComponent(bad)}`);
    assert.equal(r.status, 404, bad);
  }
  });
  todo("LP07-S04-TC009", "Giới hạn thử token", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S04-TC010", "Link xem trước của trang đã lưu trữ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S04-TC011", "Người chỉ xem không tạo được link (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_A_VIEWER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const page = await newSavedPage(owner, 'VIEWER-PREVIEW');
  assert.equal((await viewer.post(`/landing-pages/${page.id}/preview-token`, {})).status, 403);
  assert.equal((await viewer.post(`/landing-pages/${page.id}/preview-token/revoke`)).status, 403);
  });
  tc("LP07-S04-TC012", "Tổ chức khác không tạo hoặc thu hồi được (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newSavedPage(a, 'ORG-A-PREVIEW');
  assert.equal((await b.post(`/landing-pages/${page.id}/preview-token`, {})).status, 404);
  assert.equal((await b.post(`/landing-pages/${page.id}/preview-token/revoke`)).status, 404);
  });
});

suite("LP07-S05", "Tên miền riêng và kiểm tra DNS", () => {
  tc("LP07-S05-TC001", "Gắn tên miền hợp lệ (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'DOMAIN');
  const host = `${uniqSlug('lpt')}.example.com`;
  const r = await c.post(`/landing-pages/${page.id}/domain`, { customDomain: host });
  assert.ok(r.status < 300, `gắn tên miền hợp lệ phải thành công, nhận ${r.status}`);
  assert.equal(JSON.stringify(r.body).includes(host), true);
  });
  tc("LP07-S05-TC002", "Chuẩn hóa tên miền (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  for (const d of DOMAIN_INPUTS.filter((x) => x.valid)) {
    sent('normalizeLandingCustomDomain()', d.in);
    const got = normalizeLandingCustomDomain(d.in);
    actual('chuẩn hóa', got);
    assert.equal(got, d.normalized, d.note);
  }
  });
  tc("LP07-S05-TC003", "Tên miền không hợp lệ (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  for (const d of DOMAIN_INPUTS) {
    const norm = normalizeLandingCustomDomain(d.in);
    assert.equal(isValidLandingCustomDomain(norm), d.valid, `${JSON.stringify(d.in)} → ${JSON.stringify(norm)} ${d.note ?? ''}`);
  }
  assert.equal(isValidLandingCustomDomain(`${'a'.repeat(240)}.example.com`), false, 'vượt 253 ký tự hoặc nhãn quá dài');
  });
  tc("LP07-S05-TC004", "Chặn tên miền nội bộ (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'DOMAIN-NOI-BO');
  for (const host of [...INTERNAL_DOMAINS, '10.0.0.5', '192.168.1.10', '127.0.0.1']) {
    fake('tên miền nội bộ', host);
    const r = await c.post(`/landing-pages/${page.id}/domain`, { customDomain: host });
    assert.equal(r.status, 400, host);
  }
  });
  todo("LP07-S05-TC005", "Gắn lại ghi đè và đặt về PENDING", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S05-TC006", "Tên miền đã dùng bởi trang khác (LP07-F3) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const p1 = await newSavedPage(a, 'DOMAIN-1');
  const p2 = await newSavedPage(b, 'DOMAIN-2');
  const host = `${uniqSlug('lpt-dup')}.example.com`;
  assert.ok((await a.post(`/landing-pages/${p1.id}/domain`, { customDomain: host })).status < 300);
  const r = await b.post(`/landing-pages/${p2.id}/domain`, { customDomain: host });
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Domain đã được dùng/);
  });
  tc("LP07-S05-TC007", "Xác minh khi chưa gắn tên miền (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'CHUA-GAN-DOMAIN');
  const r = await c.post(`/landing-pages/${page.id}/domain/verify`, {});
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Chưa gắn custom domain/);
  });
  tc("LP07-S05-TC008", "Xác minh CNAME đúng (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  assert.equal(landingPageCnameTarget(), 'lp-edge.aibeego.com', 'đích CNAME mặc định (khi không đặt LANDING_PAGE_CNAME_TARGET)');
  });
  todo("LP07-S05-TC009", "Xác minh CNAME sai hoặc chưa trỏ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S05-TC010", "CNAME dạng phụ của đích", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S05-TC011", "Không có cách gỡ tên miền (LP07-F2)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S05-TC012", "Truy cập trang bằng tên miền riêng (LP07-F1)", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S05-TC013", "Phân quyền và tách tổ chức (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_A_VIEWER', 'ORG_B_OWNER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const other = await as('ORG_B_OWNER');
  const page = await newSavedPage(owner, 'DOMAIN-RBAC');
  const host = `${uniqSlug('lpt-rbac')}.example.com`;
  assert.equal((await viewer.post(`/landing-pages/${page.id}/domain`, { customDomain: host })).status, 403);
  assert.equal((await other.post(`/landing-pages/${page.id}/domain`, { customDomain: host })).status, 404);
  assert.equal((await pub.post(`/landing-pages/${page.id}/domain`, { customDomain: host })).status, 401);
  });
  todo("LP07-S05-TC014", "Danh sách tên miền", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP07-S06", "Mã theo dõi (GA4, Meta Pixel, Google Ads)", () => {
  tc("LP07-S06-TC001", "Lưu và nạp ID theo dõi (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'TRACKING');
  const cfg = { ga4MeasurementId: 'G-ABC1234567', metaPixelId: '1234567890123456' };
  fake('trackingConfig', cfg);
  const r = await c.patch(`/landing-pages/${page.id}`, { trackingConfig: cfg });
  assert.ok(r.status < 300);
  const row = await c.get(`/landing-pages/${page.id}`);
  assert.deepEqual(row.body.trackingConfig, cfg);
  });
  tc("LP07-S06-TC002", "Lọc ký tự < và > khi lưu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'TRACKING-XSS');
  const dirty = { ga4MeasurementId: 'G-<script>alert(1)</script>' };
  sent('trackingConfig có thẻ', dirty);
  const r = await c.patch(`/landing-pages/${page.id}`, { trackingConfig: dirty });
  assert.ok(r.status < 300);
  const saved = (await c.get(`/landing-pages/${page.id}`)).body.trackingConfig;
  assert.equal(JSON.stringify(saved).includes('<'), false);
  assert.equal(JSON.stringify(saved).includes('>'), false);
  });
  tc("LP07-S06-TC003", "ID chứa dấu nháy đơn (LP07-F4) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  // LP07-F4: hiện chỉ lọc < và >; dấu nháy đơn vẫn được lưu. Test GHI NHẬN hành vi hiện tại.
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'TRACKING-QUOTE');
  const payload = { ga4MeasurementId: "G-X');alert(1);//" };
  sent('trackingConfig có dấu nháy đơn', payload);
  const r = await c.patch(`/landing-pages/${page.id}`, { trackingConfig: payload });
  assert.ok(r.status < 300);
  const saved = (await c.get(`/landing-pages/${page.id}`)).body.trackingConfig;
  actual('ID đã lưu', saved);
  const stored = JSON.stringify(saved);
  // Kỳ vọng AN TOÀN: dấu nháy phải bị loại/từ chối. Nếu dòng dưới FAIL nghĩa là lỗ hổng LP07-F4 còn tồn tại.
  assert.equal(stored.includes("'"), false, 'ID theo dõi không được chứa dấu nháy đơn (LP07-F4)');
  });
  todo("LP07-S06-TC004", "Ép kiểu dữ liệu theo dõi", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S06-TC005", "Không nạp mã theo dõi khi xem trước", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP07-S07", "Cache, hiệu năng và an toàn trang công khai", () => {
  todo("LP07-S07-TC001", "Cache làm mới sau khi xuất bản từ builder", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S07-TC002", "Cache sau khi xuất bản qua API (LP05-F5)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S07-TC003", "Trang công khai không nạp mã builder", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP07-S07-TC004", "Tải trang trong ngưỡng chấp nhận", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP07-S07-TC005", "Khách không đăng nhập vẫn xem được (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'KHACH-VANG-LAI');
  await publish(c, page.id, 1);
  const r = await pub.get(`/landing-pages/public/${page.slug}`); // không kèm token
  assert.equal(r.status, 200, 'khách chưa đăng nhập xem được trang đã xuất bản');
  });
  todo("LP07-S07-TC006", "Lỗi tải mẫu cũ sau khi triển khai bản mới", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
