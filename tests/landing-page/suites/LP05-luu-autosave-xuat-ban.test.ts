/**
 * LP05: Lưu, autosave, lịch sử, khôi phục, xuất bản
 * Tài liệu: docs/test case/suites/LP05-luu-autosave-xuat-ban-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import {
  decideLandingPageAutosave, publishRevisionAllowed, readLandingPageRevision,
} from '../../../apps/api/src/landing-pages/landing-page-revision';
import {
  hashLandingPageAutosaveRequest, landingPageAutosaveContentKey,
} from '../../../apps/api/src/landing-pages/landing-page-autosave-receipt';
import { autosave, getPage, newPage, newSavedPage, publicGet, publish, revisionOf, useCleanup } from '../support/lp';
import { as, pub } from '../support/api';
import { makeSpec } from '../fixtures/specs';
import {
  decideDraftRecovery, readLocalLandingDraft, writeLocalLandingDraft, clearLocalLandingDraft,
} from '../../../apps/web/src/components/landing-pages/landing-page-draft-recovery';

useCleanup();

/** Dữ liệu giả dùng chung cho nhóm quyết định autosave. */
const spec = (headline: string) => makeSpec({ headline });
const hashOf = (headline: string, base: number | null, rev: number | null) =>
  hashLandingPageAutosaveRequest({ draftSpec: spec(headline), baseRevision: base, clientRevision: rev });

suite("LP05-S01", "Autosave API: quyết định theo revision", () => {
  tc("LP05-S01-TC001", "Lưu lần đầu với baseRevision khớp (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const input = { storedRevision: 0, storedRequestId: null, baseRevision: 0, incomingRevision: 1, requestId: 'req-0001' };
  sent('decideLandingPageAutosave()', input);
  const d = decideLandingPageAutosave(input);
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'accept', nextRevision: 1 });
  });
  tc("LP05-S01-TC001", "Lưu lần đầu với baseRevision khớp (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const body = makeSpec({ headline: 'AS-01' });
  const r = await autosave(c, page.id, { spec: body, base: 0, revision: 1, requestId: 'req-0001' });
  assert.equal(r.status < 300, true);
  assert.equal(r.body.rejected, false);
  assert.equal(r.body.clientRevision, 1);
  assert.equal(r.body.requestId, 'req-0001');
  const after = await getPage(c, page.id);
  assert.equal(revisionOf(after), 1);
  assert.equal((after.draftSpec.blocks[0] as any).headline, 'AS-01');
  });
  tc("LP05-S01-TC002", "Lưu tiếp theo, revision tăng đơn điệu (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  let stored = 1;
  for (const [base, rev, id] of [[1, 2, 'req-0002'], [2, 3, 'req-0003']] as const) {
    const input = { storedRevision: stored, storedRequestId: null, baseRevision: base, incomingRevision: rev, requestId: id };
    sent('decideLandingPageAutosave()', input);
    const d = decideLandingPageAutosave(input);
    actual('quyết định', d);
    assert.deepEqual(d, { action: 'accept', nextRevision: rev });
    stored = rev;
  }
  });
  tc("LP05-S01-TC003", "Gửi lại đúng request vì mất phản hồi (idempotent) (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const hash = hashOf('AS-03', 3, 3);
  fake('hash của request req-0003 (sha256 trên JSON chuẩn hóa)', hash);
  const input = { storedRevision: 3, storedRequestId: 'req-0003', baseRevision: 3, incomingRevision: 3, requestId: 'req-0003', storedRequestHash: hash, requestHash: hash };
  sent('gửi lại đúng request', input);
  const d = decideLandingPageAutosave(input);
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'idempotent', nextRevision: 3 });
  assert.equal(hashOf('AS-03', 3, 3), hash, 'cùng nội dung phải ra cùng hash (ổn định)');
  });
  tc("LP05-S01-TC003", "Gửi lại đúng request vì mất phản hồi (idempotent) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const first = await autosave(c, page.id, { spec: makeSpec({ headline: 'AS-03' }), base: 0, revision: 1, requestId: 'req-retry' });
  assert.equal(first.body.rejected, false);
  const retry = await autosave(c, page.id, { spec: makeSpec({ headline: 'AS-03' }), base: 0, revision: 1, requestId: 'req-retry' });
  assert.equal(retry.body.rejected, false, 'gửi lại y nguyên phải được xác nhận, không bị coi là xung đột');
  assert.equal(retry.body.clientRevision, 1, 'revision không tăng');
  });
  tc("LP05-S01-TC004", "Dùng lại requestId với nội dung khác (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const stored = hashOf('AS-03', 3, 3), other = hashOf('KHAC', 3, 4);
  assert.notEqual(stored, other);
  const input = { storedRevision: 3, storedRequestId: 'req-0003', baseRevision: 3, incomingRevision: 4, requestId: 'req-0003', storedRequestHash: stored, requestHash: other };
  sent('cùng requestId, khác nội dung', input);
  const d = decideLandingPageAutosave(input);
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'reject', storedRevision: 3 });
  // thiếu receipt cũ cũng không được coi là "đã lưu"
  assert.deepEqual(decideLandingPageAutosave({ ...input, storedRequestHash: null }).action, 'reject');
  });
  tc("LP05-S01-TC004", "Dùng lại requestId với nội dung khác (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  await autosave(c, page.id, { spec: makeSpec({ headline: 'GOC' }), base: 0, revision: 1, requestId: 'req-dup' });
  const r = await autosave(c, page.id, { spec: makeSpec({ headline: 'KHAC' }), base: 1, revision: 2, requestId: 'req-dup' });
  // LP05-F1: bị từ chối nhưng HTTP vẫn là thành công, phân biệt bằng rejected:true
  assert.equal(r.status < 300, true);
  assert.equal(r.body.rejected, true);
  assert.equal(r.body.reason, 'STALE_REVISION');
  const after = await getPage(c, page.id);
  assert.equal((after.draftSpec.blocks[0] as any).headline, 'GOC', 'dữ liệu không bị ghi đè');
  });
  tc("LP05-S01-TC005", "Base revision cũ bị từ chối (tab thứ hai) (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const input = { storedRevision: 3, storedRequestId: 'req-0003', baseRevision: 2, incomingRevision: 3, requestId: 'req-tab2' };
  sent('tab thứ hai còn giữ base cũ', input);
  const d = decideLandingPageAutosave(input);
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'reject', storedRevision: 3 });
  });
  tc("LP05-S01-TC005", "Base revision cũ bị từ chối (tab thứ hai) (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'TAB1-REV1');
  const second = await autosave(c, page.id, { spec: makeSpec({ headline: 'TAB1-REV2' }), base: 1, revision: 2, requestId: 'req-tab1-2' });
  assert.equal(second.body.rejected, false);
  // tab 2 vẫn tin base = 1
  const stale = await autosave(c, page.id, { spec: makeSpec({ headline: 'TAB2' }), base: 1, revision: 2, requestId: 'req-tab2-2' });
  assert.equal(stale.body.rejected, true);
  assert.equal(stale.body.clientRevision, 2);
  const after = await getPage(c, page.id);
  assert.equal((after.draftSpec.blocks[0] as any).headline, 'TAB1-REV2');
  });
  tc("LP05-S01-TC006", "Lưu lại đúng bản đang có không tăng revision (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const d = decideLandingPageAutosave({ storedRevision: 3, storedRequestId: null, baseRevision: 3, incomingRevision: 3, requestId: 'req-flush' });
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'unchanged', nextRevision: 3 });
  });
  tc("LP05-S01-TC007", "Cùng revision nhưng nội dung khác (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const a = spec('NOI-DUNG-A'), b = spec('NOI-DUNG-B');
  assert.notEqual(landingPageAutosaveContentKey(a), landingPageAutosaveContentKey(b), 'khóa nội dung phải khác khi nội dung khác');
  // receipt (clientRevision, requestId, hash) không được ảnh hưởng khóa nội dung
  const withMeta = { ...a, meta: { clientRevision: 9, lastAutosaveRequestId: 'x', lastAutosaveRequestHash: 'y' } };
  assert.equal(landingPageAutosaveContentKey(withMeta), landingPageAutosaveContentKey(a));
  const d = decideLandingPageAutosave({ storedRevision: 3, storedRequestId: null, baseRevision: 3, incomingRevision: 3, requestId: 'r' });
  assert.equal(d.action, 'unchanged'); // service so khóa nội dung để chuyển unchanged -> reject (landing-pages.service.ts differentUnchangedDraft)
  });
  tc("LP05-S01-TC008", "Không gửi baseRevision, clientRevision nhỏ hơn server (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const d = decideLandingPageAutosave({ storedRevision: 5, storedRequestId: null, baseRevision: null, incomingRevision: 3, requestId: 'r' });
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'reject', storedRevision: 5 });
  });
  tc("LP05-S01-TC009", "Không gửi baseRevision, clientRevision lớn hơn server (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  const d = decideLandingPageAutosave({ storedRevision: 5, storedRequestId: null, baseRevision: null, incomingRevision: 8, requestId: 'r' });
  actual('quyết định', d);
  assert.deepEqual(d, { action: 'accept', nextRevision: 8 });
  });
  tc("LP05-S01-TC010", "Revision không phải số hữu hạn (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  const cases: Array<[string, unknown, number]> = [
    ['NaN', { meta: { clientRevision: NaN } }, 0],
    ['Infinity', { meta: { clientRevision: Infinity } }, 0],
    ['số âm', { meta: { clientRevision: -5 } }, 0],
    ['số thập phân 2.7', { meta: { clientRevision: 2.7 } }, 2],
    ['chuỗi "3"', { meta: { clientRevision: '3' } }, 0],
    ['không có meta', {}, 0],
    ['null', null, 0],
    ['hợp lệ 7', { meta: { clientRevision: 7 } }, 7],
  ];
  for (const [label, input, want] of cases) {
    fake(`draftSpec (${label})`, input);
    const got = readLandingPageRevision(input);
    actual('revision đọc được', got);
    assert.equal(got, want, label);
  }
  });
  tc("LP05-S01-TC011", "Thiếu draftSpec hoặc sai kiểu (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  for (const [label, body] of [['thiếu draftSpec', { baseRevision: 0 }], ['draftSpec là chuỗi', { draftSpec: 'abc' }], ['draftSpec là mảng', { draftSpec: [] }]] as const) {
    fake(label, body);
    const r = await c.post(`/landing-pages/${page.id}/autosave`, body);
    assert.equal(r.status, 400, label);
  }
  });
  tc("LP05-S01-TC012", "Tên trang qua autosave (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const r = await autosave(c, page.id, { spec: makeSpec({ headline: 'TEN' }), base: 0, revision: 1, requestId: 'req-name', name: 'Tên mới sau autosave' });
  assert.equal(r.body.rejected, false);
  assert.equal((await getPage(c, page.id)).name, 'Tên mới sau autosave');
  const long = await c.post(`/landing-pages/${page.id}/autosave`, { draftSpec: makeSpec(), name: 'N'.repeat(121), baseRevision: 1, clientRevision: 2 });
  assert.equal(long.status, 400, 'name > 120 ký tự bị DTO từ chối');
  });
  tc("LP05-S01-TC013", "Autosave cập nhật SEO và theme của bản ghi (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c);
  const s = makeSpec({ headline: 'SEO-SYNC', seoTitle: 'SEO Title Đồng bộ' });
  s.seo.robotsIndex = false;
  const r = await autosave(c, page.id, { spec: s, base: 0, revision: 1, requestId: 'req-seo' });
  assert.equal(r.body.rejected, false);
  const row = await getPage(c, page.id);
  assert.equal(row.draftSpec.seo.title, 'SEO Title Đồng bộ');
  assert.equal(row.draftSpec.seo.robotsIndex, false);
  });
});

suite("LP05-S02", "Autosave phía builder", () => {
  todo("LP05-S02-TC001", "Tự lưu sau khi dừng gõ", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC002", "Gõ liên tục không gây lưu liên tục", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC003", "Nút Lưu thủ công", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC004", "Hai lần lưu chồng nhau xếp hàng", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC005", "Lưu quá 20 giây thì hủy và báo", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC006", "Lỗi server khi lưu", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC007", "Lưu khi vừa thoát trang", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC008", "Ghi nháp cục bộ sau 400 ms", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC009", "Lưu một trang đã lưu trữ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S02-TC010", "Lưu khi mất phiên đăng nhập", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP05-S03", "Xung đột khi sửa ở nhiều tab hoặc nhiều người", () => {
  tc("LP05-S03-TC001", "Hai tab, tab sau bị từ chối (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'BASE');
  const tabA = await autosave(c, page.id, { spec: makeSpec({ headline: 'TAB-A' }), base: 1, revision: 2, requestId: 'tabA-1' });
  const tabB = await autosave(c, page.id, { spec: makeSpec({ headline: 'TAB-B' }), base: 1, revision: 2, requestId: 'tabB-1' });
  assert.equal(tabA.body.rejected, false);
  assert.equal(tabB.body.rejected, true, 'tab sau phải bị từ chối');
  assert.equal(tabB.body.clientRevision, 2, 'trả về revision của server để builder tải lại');
  });
  todo("LP05-S03-TC002", "Tab thua giữ bản của mình ở máy", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S03-TC003", "Tải bản mới nhất sau xung đột", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S03-TC004", "Xuất bản bị chặn khi đang xung đột", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S03-TC005", "Mất phản hồi sau khi server đã lưu (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  // mất phản hồi sau khi server đã lưu: lần mở lại thấy server đã có đúng nội dung → không coi là xung đột
  const content = makeSpec({ headline: 'DA-LUU-NHUNG-MAT-PHAN-HOI' }) as any;
  const local = { pageId: 'p3', spec: content, baseRevision: 2, clientRevision: 3, savedAt: '2026-11-11T10:00:00Z' };
  assert.equal(decideDraftRecovery({ serverRevision: 3, serverSpec: structuredClone(content), local }), 'use-server');
  });
  todo("LP05-S03-TC006", "Người khác đổi trang bằng AI/Page Doctor trong lúc tab mở (LP05-F3)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S03-TC007", "Ghi đồng thời hai request lên cùng trang (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'CONCURRENT');
  fake('2 request cùng base=1, gửi đồng thời', ['race-A', 'race-B']);
  const [a, b] = await Promise.all(['race-A', 'race-B'].map((id) =>
    autosave(c, page.id, { spec: makeSpec({ headline: id }), base: 1, revision: 2, requestId: id })));
  const accepted = [a, b].filter((r) => r.body.rejected === false).length;
  assert.equal(accepted, 1, 'đúng một request được chấp nhận, request còn lại bị từ chối');
  assert.equal(revisionOf(await getPage(c, page.id)), 2, 'revision chỉ tăng một lần');
  });
});

suite("LP05-S04", "Mất mạng và khôi phục bản nháp cục bộ", () => {
  tc("LP05-S04-TC001", "Khôi phục bản nháp khi server chưa đổi (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const local = { pageId: 'p1', spec: makeSpec({ headline: 'GÕ-DỞ' }) as any, baseRevision: 3, clientRevision: 4, savedAt: '2026-11-11T10:00:00Z' };
  const server = makeSpec({ headline: 'BAN-CU' }) as any;
  sent('decideDraftRecovery()', { serverRevision: 3, local: { ...local, spec: '(spec)' } });
  const d = decideDraftRecovery({ serverRevision: 3, serverSpec: server, local });
  actual('quyết định', d);
  assert.equal(d, 'restore-local', 'server chưa đổi từ lúc tab này lưu → cho khôi phục bản trên máy');
  });
  tc("LP05-S04-TC002", "Server đã đổi so với bản nháp cục bộ (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const local = { pageId: 'p1', spec: makeSpec({ headline: 'TREN-MAY' }) as any, baseRevision: 3, clientRevision: 4, savedAt: '2026-11-11T10:00:00Z' };
  const d = decideDraftRecovery({ serverRevision: 5, serverSpec: makeSpec({ headline: 'NGUOI-KHAC-DA-SUA' }) as any, local });
  actual('quyết định', d);
  assert.equal(d, 'conflict', 'server đã đổi sang revision khác → phải để người dùng chọn, không tự ghi đè');
  });
  todo("LP05-S04-TC003", "Chọn khôi phục bản máy", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S04-TC004", "recover-draft khi base khớp", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S04-TC005", "recover-draft không bao giờ ghi bản đã xuất bản", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S04-TC006", "Nháp cục bộ đã được server xác nhận thì bị xóa (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const same = makeSpec({ headline: 'DA-DUOC-XAC-NHAN' }) as any;
  const local = { pageId: 'p1', spec: same, baseRevision: 3, clientRevision: 4, savedAt: '2026-11-11T10:00:00Z' };
  const d = decideDraftRecovery({ serverRevision: 4, serverSpec: structuredClone(same), local });
  assert.equal(d, 'use-server', 'server đã có đúng nội dung này → dùng bản server, bản máy bị bỏ');
  assert.equal(decideDraftRecovery({ serverRevision: 3, local: null }), 'use-server', 'không có bản nháp máy');
  const notEdited = { ...local, clientRevision: 3 };
  assert.equal(decideDraftRecovery({ serverRevision: 3, serverSpec: makeSpec({ headline: 'KHAC' }) as any, local: notEdited }), 'use-server', 'chưa sửa gì thêm so với lần lưu cuối');
  });
  todo("LP05-S04-TC007", "Chỉnh sửa tiếp trong lúc đang chờ quyết định khôi phục", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S04-TC008", "Trình duyệt chặn localStorage (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  const original = (globalThis as any).localStorage;
  const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceeded'); }, removeItem() { throw new Error('SecurityError'); } };
  (globalThis as any).localStorage = blocked;
  try {
    const draft = { pageId: 'p2', spec: makeSpec() as any, baseRevision: 0, clientRevision: 1, savedAt: '2026-11-11T10:00:00Z' };
    assert.doesNotThrow(() => writeLocalLandingDraft(draft));
    assert.equal(readLocalLandingDraft('p2'), null);
    assert.doesNotThrow(() => clearLocalLandingDraft('p2'));
  } finally {
    (globalThis as any).localStorage = original;
  }
  });
});

suite("LP05-S05", "Xuất bản", () => {
  tc("LP05-S05-TC001", "Lưu, tải lại và xuất bản trang [SMOKE] (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'], smoke: 'SMOKE-3' }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newPage(c, 'SMOKE LP 20261111-01');
  const s = makeSpec({ headline: 'SMOKE-HEADLINE-20261111', sub: 'SMOKE-SUB-20261111' });
  const saved = await autosave(c, page.id, { spec: s, base: 0, revision: 1, requestId: 'smoke-save-1' });
  assert.equal(saved.body.rejected, false);
  const reloaded = await getPage(c, page.id);
  assert.equal((reloaded.draftSpec.blocks[0] as any).headline, 'SMOKE-HEADLINE-20261111', 'tải lại vẫn còn nội dung đã lưu');
  const pub1 = await publish(c, page.id, revisionOf(reloaded), 'smoke publish');
  assert.ok(pub1.status < 300, `xuất bản phải thành công, nhận ${pub1.status}`);
  const live = await publicGet(reloaded.slug);
  assert.equal(live.status, 200);
  assert.equal(JSON.stringify(live.body).includes('SMOKE-HEADLINE-20261111'), true, 'trang công khai hiển thị đúng nội dung');
  });
  todo("LP05-S05-TC002", "Xuất bản kèm thay đổi chưa lưu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S05-TC003", "Xuất bản khi đang có autosave chạy", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S05-TC004", "clientRevision cũ bị từ chối (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  assert.equal(publishRevisionAllowed(5, 3), 'stale', 'client giữ revision cũ hơn server');
  assert.equal(publishRevisionAllowed(5, 0), 'stale');
  });
  tc("LP05-S05-TC004", "clientRevision cũ bị từ chối (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'REV1');
  await autosave(c, page.id, { spec: makeSpec({ headline: 'REV2' }), base: 1, revision: 2, requestId: 'pub-r2' });
  const r = await publish(c, page.id, 1);
  assert.equal(r.status, 409);
  assert.equal(r.body.code ?? r.body.message?.code, 'STALE_REVISION');
  });
  tc("LP05-S05-TC005", "clientRevision lớn hơn server (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  assert.equal(publishRevisionAllowed(3, 5), 'not_saved', 'client có revision mới hơn server: chưa lưu xong');
  });
  tc("LP05-S05-TC005", "clientRevision lớn hơn server (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'REV1');
  const r = await publish(c, page.id, 5);
  assert.equal(r.status, 409);
  assert.equal(r.body.code ?? r.body.message?.code, 'REVISION_NOT_SAVED');
  });
  tc("LP05-S05-TC006", "Xuất bản không gửi clientRevision (LP05-F6) (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  // LP05-F6: không gửi clientRevision thì bỏ qua kiểm tra revision
  assert.equal(publishRevisionAllowed(9, null), 'ok');
  });
  tc("LP05-S05-TC007", "Xuất bản không đổi revision khi không sửa gì (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  assert.equal(publishRevisionAllowed(4, 4), 'ok');
  assert.equal(publishRevisionAllowed(0, 0), 'ok');
  assert.equal(publishRevisionAllowed(4.9 as number, 4), 'ok', 'làm tròn xuống');
  });
  todo("LP05-S05-TC008", "Nội dung xuất bản sao chép từ bản nháp đã làm sạch", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S05-TC009", "Spec không hợp lệ không xuất bản được", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S05-TC010", "Xuất bản tạo phiên bản và ghi chú", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S05-TC011", "Ghi chú xuất bản 501 ký tự (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'NOTE');
  const r = await c.post(`/landing-pages/${page.id}/publish`, { note: 'N'.repeat(501), clientRevision: 1 });
  assert.equal(r.status, 400, 'ghi chú tối đa 500 ký tự (PublishLandingPageDto)');
  const ok = await c.post(`/landing-pages/${page.id}/publish`, { note: 'N'.repeat(500), clientRevision: 1 });
  assert.ok(ok.status < 300);
  });
  tc("LP05-S05-TC012", "Xuất bản lại sau khi sửa (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'V1');
  assert.ok((await publish(c, page.id, 1)).status < 300);
  await autosave(c, page.id, { spec: makeSpec({ headline: 'V2' }), base: 1, revision: 2, requestId: 'repub-2' });
  const stillV1 = await publicGet(page.slug);
  assert.equal(JSON.stringify(stillV1.body).includes('"V2"'), false, 'chưa xuất bản lại thì công khai vẫn là V1');
  assert.ok((await publish(c, page.id, 2)).status < 300);
  assert.equal(JSON.stringify((await publicGet(page.slug)).body).includes('V2'), true);
  });
  todo("LP05-S05-TC013", "Xuất bản trang đã lưu trữ", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S05-TC014", "Xuất bản trang tạm sửa mẫu (LP09)", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S05-TC015", "Lỗi xuất bản giữ nguyên bản công khai", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP05-S06", "Hủy xuất bản và cache trang công khai", () => {
  todo("LP05-S06-TC001", "Gỡ xuất bản từ danh sách trang", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S06-TC002", "Gỡ xuất bản qua API (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'UNPUB');
  assert.ok((await publish(c, page.id, 1)).status < 300);
  assert.equal((await publicGet(page.slug)).status, 200);
  const r = await c.post(`/landing-pages/${page.id}/unpublish`);
  assert.ok(r.status < 300);
  assert.equal((await getPage(c, page.id)).status, 'DRAFT');
  assert.equal((await publicGet(page.slug)).status, 404, 'trang công khai trả 404 sau khi gỡ');
  });
  todo("LP05-S06-TC003", "Cache công khai sau khi gỡ qua API (LP05-F5)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S06-TC004", "Gỡ xuất bản một trang chưa xuất bản", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S06-TC005", "Gỡ xuất bản trang đã lưu trữ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S06-TC006", "Làm mới cache với slug sai", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S06-TC007", "Xuất bản lại sau khi gỡ (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'REPUB');
  await publish(c, page.id, 1);
  await c.post(`/landing-pages/${page.id}/unpublish`);
  const r = await publish(c, page.id, 1);
  assert.ok(r.status < 300);
  assert.equal((await publicGet(page.slug)).status, 200);
  });
});

suite("LP05-S07", "Lịch sử phiên bản và khôi phục", () => {
  tc("LP05-S07-TC001", "Danh sách phiên bản (HTTP)", { prio: 'P1', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'VER');
  await publish(c, page.id, 1, 'ghi chú v1');
  const r = await c.get(`/landing-pages/${page.id}/versions`);
  assert.equal(r.status, 200);
  const list = Array.isArray(r.body) ? r.body : r.body.items;
  assert.ok(list.length >= 1, 'có ít nhất phiên bản do publish tạo');
  assert.equal(list[0].version, Math.max(...list.map((v: any) => v.version)), 'mới nhất đứng đầu');
  });
  todo("LP05-S07-TC002", "Phân loại kind theo ghi chú", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC003", "Đọc một phiên bản", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC004", "Khôi phục phiên bản cũ", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC005", "Khôi phục không đổi bản đã xuất bản", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC006", "Revision sau khôi phục đơn điệu", { prio: 'P0', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC007", "Ghi chú tùy chọn khi khôi phục", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S07-TC008", "Khôi phục phiên bản không tồn tại hoặc của trang khác (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await newSavedPage(c, 'RESTORE-404');
  const r = await c.post(`/landing-pages/${page.id}/versions/9999/restore`, {});
  assert.equal(r.status, 404);
  });
  todo("LP05-S07-TC009", "Khôi phục khi trang đã lưu trữ", { prio: 'P2', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC010", "Giao diện lịch sử phiên bản", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  todo("LP05-S07-TC011", "Undo và Redo không đụng lịch sử server", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});

suite("LP05-S08", "Quyền, tổ chức và trạng thái trang", () => {
  tc("LP05-S08-TC001", "Người chỉ xem không lưu và không xuất bản (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_A_VIEWER'] }, async () => {
  const owner = await as('ORG_A_OWNER');
  const viewer = await as('ORG_A_VIEWER');
  const page = await newSavedPage(owner, 'RBAC');
  const save = await autosave(viewer, page.id, { spec: makeSpec({ headline: 'VIEWER' }), base: 1, revision: 2, requestId: 'viewer-1' });
  assert.equal(save.status, 403, 'người chỉ xem không được lưu');
  const pub1 = await publish(viewer, page.id, 1);
  assert.equal(pub1.status, 403, 'người chỉ xem không được xuất bản');
  assert.equal((await getPage(owner, page.id)).status, 'DRAFT');
  });
  todo("LP05-S08-TC002", "Người chỉ xem mở builder", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
  tc("LP05-S08-TC003", "Tổ chức khác không thao tác được (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER', 'ORG_B_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const b = await as('ORG_B_OWNER');
  const page = await newSavedPage(a, 'ORG-A-ONLY');
  for (const [label, r] of [
    ['GET', await b.get(`/landing-pages/${page.id}`)],
    ['autosave', await autosave(b, page.id, { spec: makeSpec(), base: 1, revision: 2, requestId: 'b-1' })],
    ['publish', await publish(b, page.id, 1)],
    ['unpublish', await b.post(`/landing-pages/${page.id}/unpublish`)],
  ] as const) {
    assert.equal(r.status, 404, `${label}: tổ chức B không được thấy trang của A (404, không lộ sự tồn tại)`);
  }
  });
  tc("LP05-S08-TC004", "Không có token (HTTP)", { prio: 'P0', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const page = await newPage(a);
  for (const [label, r] of [
    ['autosave', await pub.post(`/landing-pages/${page.id}/autosave`, { draftSpec: makeSpec() })],
    ['publish', await pub.post(`/landing-pages/${page.id}/publish`, {})],
  ] as const) assert.equal(r.status, 401, label);
  });
  tc("LP05-S08-TC005", "Id không tồn tại (HTTP)", { prio: 'P2', layer: 'api', accounts: ['ORG_A_OWNER'] }, async () => {
  const a = await as('ORG_A_OWNER');
  const r = await a.post('/landing-pages/00000000-0000-0000-0000-000000000000/autosave', { draftSpec: makeSpec() });
  assert.ok([400, 404].includes(r.status), `id không tồn tại phải 404/400, nhận ${r.status}`);
  });
  todo("LP05-S08-TC006", "Trang tạm sửa mẫu không có trong danh sách (LP08, LP09)", { prio: 'P1', why: "cần stack API+DB test hoặc giao diện thật; chưa viết code" });
});
