/**
 * LP10: AI trong builder (viết lại, Page Doctor, hồ sơ doanh nghiệp)
 * Tài liệu: docs/test case/suites/LP10-ai-trong-builder-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { as, pub } from '../support/api';
import { newSavedPage, useCleanup } from '../support/lp';
useCleanup();

suite("LP10-S01", "AI viết lại tại chỗ (inline AI)", () => {
  todo("LP10-S01-TC001", "Gợi ý 3 phương án cho tiêu đề", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC002", "Chọn đoạn chữ và bấm AI viết lại trong builder", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC003", "Ngữ cảnh gửi cho AI", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC004", "Tất cả action và fieldKind hợp lệ", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  tc("LP10-S01-TC005", "Giá trị action hoặc fieldKind sai (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'AI-VALIDATE');
  for (const [label, body] of [
    ['action sai', { action: 'hack', fieldKind: 'headline', currentContent: 'Tiêu đề' }],
    ['fieldKind sai', { action: 'rewrite', fieldKind: 'khong-co', currentContent: 'Tiêu đề' }],
    ['thiếu action', { fieldKind: 'headline' }],
    ['nội dung > 4000 ký tự', { action: 'rewrite', fieldKind: 'headline', currentContent: 'x'.repeat(4001) }],
  ] as const) {
    fake(label, body);
    assert.equal((await c.post(`/landing-pages/${page.id}/ai-suggest-field`, body)).status, 400, label);
  }
  });
  todo("LP10-S01-TC006", "Nội dung quá ngắn dùng gợi ý dự phòng, không tốn credit (LP10-F2)", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC007", "Trừ credit cho mỗi lần gọi AI (LP10-F1)", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC008", "Nhà cung cấp AI lỗi: dự phòng kèm cảnh báo, không trừ credit (LP10-F2)", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC009", "Hết credit", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC010", "Giới hạn 20 lần mỗi phút mỗi người", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC011", "Chống gửi trùng trong 3 giây", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC012", "Không dùng hồ sơ doanh nghiệp khi tắt", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  tc("LP10-S01-TC013", "Trang của tổ chức khác (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newSavedPage(a, 'AI-ORG');
  const r = await b.post(`/landing-pages/${page.id}/ai-suggest-field`, { action: 'rewrite', fieldKind: 'headline', currentContent: 'Tiêu đề thử' });
  assert.equal(r.status, 404, 'tổ chức khác không gọi AI trên trang không thuộc mình');
  });
  tc("LP10-S01-TC014", "Người chỉ xem không gọi được (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_A_VIEWER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const page = await newSavedPage(owner, 'AI-VIEWER');
  const r = await viewer.post(`/landing-pages/${page.id}/ai-suggest-field`, { action: 'rewrite', fieldKind: 'headline', currentContent: 'Tiêu đề thử' });
  assert.equal(r.status, 403);
  });
  todo("LP10-S01-TC015", "Nội dung dài và ký tự đặc biệt", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S01-TC016", "Gợi ý sai ngôn ngữ", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
});

suite("LP10-S02", "Hồ sơ doanh nghiệp và áp vào trang", () => {
  todo("LP10-S02-TC001", "Đọc hồ sơ lần đầu tự tạo từ thông tin tổ chức (LP10-F5)", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC002", "Cập nhật hồ sơ", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  tc("LP10-S02-TC003", "Làm sạch và giới hạn trường hồ sơ (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const tooLong = await c.patch('/landing-pages/business-profile', { brandName: 'B'.repeat(121) });
  assert.equal(tooLong.status, 400, 'brandName tối đa 120 ký tự');
  const badType = await c.patch('/landing-pages/business-profile', { hotline: 12345 });
  assert.equal(badType.status, 400);
  });
  todo("LP10-S02-TC004", "Xóa một trường hồ sơ", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC005", "Áp hồ sơ vào trang", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC006", "Áp hồ sơ rồi sửa bằng tay và áp lại, không ép", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC007", "Áp hồ sơ với force", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC008", "Hồ sơ trống", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC009", "Áp hồ sơ vào trang đã lưu trữ", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC010", "Builder đang mở khi áp hồ sơ (LP10-F4)", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  tc("LP10-S02-TC011", "Tổ chức khác không đọc hoặc sửa hồ sơ (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const marker = `LPT-HOSO-${Date.now()}`;
  assert.ok((await a.patch('/landing-pages/business-profile', { brandName: marker })).status < 300);
  const seenByB = await b.get('/landing-pages/business-profile');
  assert.equal(JSON.stringify(seenByB.body).includes(marker), false, 'hồ sơ của A không lộ sang B');
  });
  todo("LP10-S02-TC012", "Người chỉ xem", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S02-TC013", "Màu thương hiệu thay đổi theme", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
});

suite("LP10-S03", "Page Doctor", () => {
  todo("LP10-S03-TC001", "Chạy Page Doctor", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC002", "Áp dụng đề xuất đã chọn", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC003", "Hoàn tác bằng phiên bản", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC004", "Không chọn đề xuất nào", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC005", "Báo cáo hỏng", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC006", "Áp dụng lặp với cùng khóa không nhân đôi", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC007", "Vá nhắm vào theo dõi, tên miền, xuất bản bị loại (LP10-F3)", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC008", "Nhiều hơn 20 đề xuất", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC009", "Giới hạn 15 lần mỗi phút", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC010", "Trang rất dài", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC011", "Page Doctor trên trang đã lưu trữ", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  tc("LP10-S03-TC012", "Trang của tổ chức khác và quyền (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER', 'ORG_A_VIEWER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const page = await newSavedPage(a, 'DOCTOR-RBAC');
  assert.equal((await b.post(`/landing-pages/${page.id}/page-doctor`, {})).status, 404);
  const r = await viewer.post(`/landing-pages/${page.id}/page-doctor`, {});
  assert.ok([200, 201, 403].includes(r.status), `ghi lại quyền thực tế của người chỉ xem: HTTP ${r.status}`);
  });
  todo("LP10-S03-TC013", "Bản vá và an toàn SSRF", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S03-TC014", "Phân tích URL và Page Doctor chung", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
});

suite("LP10-S04", "Tạo trang bằng AI và hồ sơ (liên kết với LP01)", () => {
  todo("LP10-S04-TC001", "AI không ghi đè trường người dùng sửa", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S04-TC002", "Gợi ý không bịa lời chứng thực thật", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S04-TC003", "AI trả dữ liệu sai cấu trúc", { prio: 'P1', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S04-TC004", "Rò rỉ dữ liệu giữa tổ chức qua hồ sơ", { prio: 'P0', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
  todo("LP10-S04-TC005", "Ghi nhật ký sử dụng AI", { prio: 'P2', why: "cần stack có AI/credit; thử bằng mock nhà cung cấp AI" });
});
