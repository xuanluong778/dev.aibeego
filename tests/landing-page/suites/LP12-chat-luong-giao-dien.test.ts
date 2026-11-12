/**
 * LP12: Chất lượng giao diện toàn cục (responsive, hình ảnh)
 * Tài liệu: docs/test case/suites/LP12-chat-luong-giao-dien-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { after } from 'node:test';
import { publishedPage, useCleanup } from '../support/lp';
import { as } from '../support/api';
import { closeBrowser, horizontalOverflow, withPublicPage, VIEWPORTS, type ViewportName } from '../support/browser';
useCleanup();
after(closeBrowser);

suite("LP12-S01", "Responsive: ba khung hình chuẩn và mốc chuyển", () => {
  tc("LP12-S01-TC001", "Trang người dùng tạo từ mẫu ở ba khung (HTTP)", { prio: 'P0', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'RESPONSIVE-3-KHUNG');
  for (const vp of ['mobile', 'tablet', 'desktop'] as ViewportName[]) {
    await withPublicPage(page.slug, vp, async (p, errors) => {
      const overflow = await horizontalOverflow(p);
      actual(`${vp} ${VIEWPORTS[vp].width}px`, { tràn_ngang_px: overflow, lỗi_console: errors });
      assert.equal(overflow, 0, `${vp}: không được tràn ngang`);
      assert.deepEqual(errors, [], `${vp}: không lỗi console`);
      assert.ok(await p.locator('form').first().isVisible(), `${vp}: form thu lead hiển thị`);
    });
  }
  });
  tc("LP12-S01-TC002", "Mốc 767/768 và 1023/1024 (HTTP)", { prio: 'P1', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'MOC-767-768');
  for (const vp of ['below768', 'tablet', 'below1024', 'desktop'] as ViewportName[]) {
    await withPublicPage(page.slug, vp, async (p) => {
      assert.equal(await horizontalOverflow(p), 0, `${vp} (${VIEWPORTS[vp].width}px)`);
    });
  }
  });
  tc("LP12-S01-TC003", "Các khung rất nhỏ 320 px (HTTP)", { prio: 'P2', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'KHUNG-320');
  await withPublicPage(page.slug, 'tiny', async (p) => {
    assert.equal(await horizontalOverflow(p), 0);
  });
  });
  todo("LP12-S01-TC004", "Nhóm agency ở 5 khung", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S01-TC005", "Nhóm spa ở 3 khung", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S01-TC006", "Lô 1 và lô 2", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S01-TC007", "Responsive trang người dùng đã sửa mạnh", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S01-TC008", "Xoay màn hình và đổi cỡ động", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP12-S02", "Hình ảnh và nội dung trong mẫu", () => {
  todo("LP12-S02-TC001", "Ảnh toàn catalog đúng và tải được", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC002", "Ảnh hotlink không tải được", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC003", "Ảnh quá lớn", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC004", "Chữ dài làm vỡ thẻ", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC005", "Không có câu thiết kế rò rỉ trong nội dung", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC006", "Phông chữ tiếng Việt", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S02-TC007", "Độ tương phản và cỡ chữ", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP12-S03", "Audit toàn bộ catalog", () => {
  todo("LP12-S03-TC001", "Audit 200 mẫu × 3 khung hình (LP12-F3, F4)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S03-TC002", "Mỗi mẫu có form ở ba khung", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S03-TC003", "Tính toàn vẹn catalog trước khi audit", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S03-TC004", "Khác biệt giữa các mẫu", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S03-TC005", "Tờ tổng hợp ảnh để người xem soát", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP12-S04", "Cách ly mẫu pilot và CSS dùng chung", () => {
  todo("LP12-S04-TC001", "Mẫu Agency Portfolio không bị CSS chung ảnh hưởng", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S04-TC002", "Thay đổi CSS dùng chung không làm hỏng mẫu cũ", { prio: 'P0', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S04-TC003", "Lớp CSS theo phiên bản catalog", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S04-TC004", "Trang công khai và xem trước dùng cùng CSS", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S04-TC005", "Bundle CSS không phình quá mức", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});

suite("LP12-S05", "Cổng kiểm tra thiết kế builder và hồi quy giao diện", () => {
  todo("LP12-S05-TC001", "Cổng UX thiết kế của builder (LP12-F2)", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S05-TC002", "Không lỗi tải mã sau khi triển khai", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S05-TC003", "Route builder thật không lỗi client", { prio: 'P1', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S05-TC004", "Nhãn danh mục tiếng Việt", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S05-TC005", "Truy cập: phím Tab và nhãn", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
  todo("LP12-S05-TC006", "Chế độ tối và độ phóng 200%", { prio: 'P2', why: "thao tác trong trình duyệt (builder chưa có data-testid; tham khảo scripts/qa-landing-page-*-browser.cjs làm khung Playwright)" });
});
