/**
 * LP11: Hiệu ứng (motion) cho section và element
 * Tài liệu: docs/test case/suites/LP11-hieu-ung-motion-test-suites.md
 * File này được sinh từ tài liệu test suite; mỗi `suite` khớp một Suite, mỗi `tc`/`todo` khớp một Test case (cùng mã).
 * Chạy: xem tests/landing-page/README.md
 */
import assert from 'node:assert/strict';
import { suite, tc, todo } from '../support/harness';
import { actual, expected, fake, sent } from '../support/trace';
import { after } from 'node:test';
import { as } from '../support/api';
import { publishedPage, useCleanup } from '../support/lp';
import { closeBrowser, horizontalOverflow, withPublicPage } from '../support/browser';
useCleanup();
after(closeBrowser);
import {
  LP_MOTION_PRESETS, LP_MOTION_DEFAULTS, isLandingPageMotionElementKey, lpMotionLocalKey, patchLandingPageMotion,
  readLandingPageMotion, remapLandingPageMotion, sanitizeLandingPageMotion, sanitizeLandingPageMotionStyle,
} from '../../../packages/shared/src/landing-page-motion';
import { MOTION_INPUTS, MOTION_KEYS, PRESETS } from '../fixtures/motion';

suite("LP11-S01", "Bật và cấu hình hiệu ứng trong builder", () => {
  todo("LP11-S01-TC001", "Bật hiệu ứng Hiện dần cho một tiêu đề", { prio: 'P0', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S01-TC002", "Toàn bộ 11 kiểu hiệu ứng chọn được (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  fake('11 kiểu hiệu ứng mong đợi', PRESETS);
  assert.deepEqual([...LP_MOTION_PRESETS], [...PRESETS]);
  assert.equal(LP_MOTION_PRESETS.length, 11);
  for (const preset of PRESETS) {
    const out = sanitizeLandingPageMotion({ preset, trigger: 'scroll', duration: 600, delay: 0 });
    assert.equal(out?.preset, preset, `kiểu ${preset} phải được giữ nguyên`);
  }
  });
  tc("LP11-S01-TC003", "Đặt thời lượng và độ trễ (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  for (const key of ['durationThap', 'durationCao', 'delayAm', 'delayCao', 'lamTron'] as const) {
    const { in: input, out } = MOTION_INPUTS[key];
    fake(`đầu vào (${key})`, input);
    sent('sanitizeLandingPageMotion()', input);
    const got = sanitizeLandingPageMotion(input);
    actual('kết quả', got);
    expected('mong đợi', out);
    assert.deepEqual(got, out, key);
  }
  assert.deepEqual(LP_MOTION_DEFAULTS, { trigger: 'scroll', duration: 1200, delay: 0 });
  });
  todo("LP11-S01-TC004", "Hiệu ứng cho section", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S01-TC005", "Hiệu ứng cho từng loại phần tử (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const targets: Array<[{ element?: string; field?: string }, string]> = [
    [{ element: 'section' }, 'section'], [{ element: 'section-background' }, 'section'],
    [{ element: 'headline' }, 'field:headline'], [{ element: 'subheadline' }, 'field:subheadline'],
    [{ element: 'body' }, 'field:body'], [{ element: 'cta' }, 'field:ctaLabel'],
    [{ element: 'image' }, 'image'], [{ element: 'form' }, 'form'],
    [{ field: 'itemTitle:abc' }, 'field:itemTitle:abc'], [{}, 'section'],
  ];
  for (const [target, key] of targets) {
    fake('đối tượng chọn trong builder', target);
    assert.equal(lpMotionLocalKey(target), key);
  }
  });
  todo("LP11-S01-TC006", "Thử hiệu ứng ngay trong builder", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S01-TC007", "Tắt hiệu ứng (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  const motion = { preset: 'fade' as const, trigger: 'scroll' as const, duration: 600, delay: 0 };
  const on = patchLandingPageMotion({ color: 'red' }, 'field:headline', motion);
  actual('style sau khi bật', on);
  assert.deepEqual(readLandingPageMotion(on, 'field:headline'), motion);
  const off = patchLandingPageMotion(on, 'field:headline', undefined);
  actual('style sau khi tắt', off);
  assert.equal(off.lpMotion, undefined, 'tắt phần tử cuối cùng thì xóa hẳn lpMotion');
  assert.equal(off.color, 'red', 'không đụng thuộc tính style khác');
  });
  todo("LP11-S01-TC008", "Undo và Redo thay đổi hiệu ứng", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S01-TC009", "Hiệu ứng không làm tràn ngang trong builder", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S01-TC010", "Người chỉ xem không sửa được", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
});

suite("LP11-S02", "Lưu, làm sạch và xuất bản cấu hình hiệu ứng", () => {
  todo("LP11-S02-TC001", "Motion đi theo autosave và xuất bản", { prio: 'P0', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S02-TC002", "Kiểu hiệu ứng lạ bị loại (LP11-F1) (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const { in: input, out } = MOTION_INPUTS.presetLa;
  sent('sanitizeLandingPageMotion()', input);
  assert.equal(sanitizeLandingPageMotion(input), out, 'kiểu hiệu ứng lạ bị loại (undefined)');
  const style = sanitizeLandingPageMotionStyle({ elements: { 'field:headline': input, image: MOTION_INPUTS.hopLe.in } });
  actual('style sau làm sạch', style);
  assert.deepEqual(Object.keys(style?.elements || {}), ['image'], 'chỉ giữ phần tử hợp lệ');
  });
  tc("LP11-S02-TC003", "Thời lượng và độ trễ ngoài khoảng (LP11-F1) (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  assert.equal(sanitizeLandingPageMotion(MOTION_INPUTS.durationThap.in)?.duration, 150);
  assert.equal(sanitizeLandingPageMotion(MOTION_INPUTS.durationCao.in)?.duration, 1200);
  assert.equal(sanitizeLandingPageMotion(MOTION_INPUTS.delayAm.in)?.delay, 0);
  assert.equal(sanitizeLandingPageMotion(MOTION_INPUTS.delayCao.in)?.delay, 400);
  assert.deepEqual(sanitizeLandingPageMotion(MOTION_INPUTS.khongPhaiSo.in), MOTION_INPUTS.khongPhaiSo.out);
  assert.deepEqual(sanitizeLandingPageMotion(MOTION_INPUTS.thieuSo.in), MOTION_INPUTS.thieuSo.out);
  });
  tc("LP11-S02-TC004", "Trigger load được đổi thành scroll (LP11-F1) (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  // LP11-F1: trigger "load" được chấp nhận nhưng luôn đổi thành "scroll"
  assert.deepEqual(sanitizeLandingPageMotion(MOTION_INPUTS.triggerLoad.in), MOTION_INPUTS.triggerLoad.out);
  // trigger không thuộc {load, scroll} thì loại cả cấu hình
  assert.equal(sanitizeLandingPageMotion(MOTION_INPUTS.triggerLa.in), undefined);
  });
  tc("LP11-S02-TC005", "Khóa phần tử không hợp lệ (LP11-F3) (logic)", { prio: 'P2', layer: 'unit' }, async () => {
  for (const k of MOTION_KEYS.hopLe) assert.equal(isLandingPageMotionElementKey(k), true, `hợp lệ: ${k}`);
  for (const k of MOTION_KEYS.khongHopLe) assert.equal(isLandingPageMotionElementKey(k), false, `không hợp lệ: ${JSON.stringify(k).slice(0, 40)}`);
  // tối đa 500 phần tử được xét
  const many: Record<string, unknown> = {};
  for (let i = 0; i < 600; i++) many[`grid:${i}`] = MOTION_INPUTS.hopLe.in;
  const out = sanitizeLandingPageMotionStyle({ elements: many });
  assert.equal(Object.keys(out?.elements || {}).length, 500);
  });
  todo("LP11-S02-TC006", "Gói mẫu có chứa motion", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S02-TC007", "Nhân bản section hoặc trang giữ hiệu ứng (logic)", { prio: 'P1', layer: 'unit' }, async () => {
  const m = MOTION_INPUTS.hopLe.out;
  const ids = new Map([['old1', 'new1']]);
  const input = { elements: { 'item:old1': m, 'field:itemTitle:old1': m, 'field:itemDesc:old1': m, 'item:other': m } };
  fake('lpMotion của section gốc', input);
  const copied = remapLandingPageMotion(input, ids, false);
  actual('sau khi nhân bản (id mới)', copied);
  assert.deepEqual(Object.keys(copied!.elements!).sort(), ['field:itemDesc:new1', 'field:itemTitle:new1', 'item:new1', 'item:other'].sort());
  const keep = remapLandingPageMotion(input, ids, true);
  assert.equal(Object.keys(keep!.elements!).length, 7, 'keepOriginal giữ cả khóa cũ');
  });
});

suite("LP11-S03", "Chạy hiệu ứng trên trang công khai", () => {
  todo("LP11-S03-TC001", "Hiệu ứng chạy khi phần tử vào khung nhìn", { prio: 'P0', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC002", "Độ trễ được áp dụng", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC003", "Hiệu ứng nối tiếp (cascade)", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC004", "Hiệu ứng chạy một lần khi cuộn qua lại", { prio: 'P2', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC005", "Giảm chuyển động tắt hiệu ứng", { prio: 'P0', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC006", "Không bật giảm chuyển động", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC007", "JavaScript lỗi hoặc bị chặn (LP11-F2)", { prio: 'P0', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC008", "Hiệu ứng nằm trong khung cuộn nội bộ", { prio: 'P2', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC009", "Hiệu ứng khớp giữa xem trước và công khai", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S03-TC010", "Ảnh hưởng đến lead form", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
});

suite("LP11-S04", "Mặc định tắt, tương thích trang cũ và hiệu năng", () => {
  tc("LP11-S04-TC001", "Hiệu ứng mặc định tắt (logic)", { prio: 'P0', layer: 'unit' }, async () => {
  assert.equal(readLandingPageMotion(undefined, 'section'), undefined);
  assert.equal(readLandingPageMotion({}, 'field:headline'), undefined);
  assert.equal(readLandingPageMotion({ lpMotion: {} }, 'section'), undefined, 'trang cũ không có motion thì mặc định tắt');
  });
  todo("LP11-S04-TC002", "Mẫu hệ thống không có hiệu ứng tự động", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S04-TC003", "Nhiều hiệu ứng cùng lúc trên Mobile", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  tc("LP11-S04-TC004", "Hiệu ứng không gây tràn ngang trang (HTTP)", { prio: 'P0', layer: 'e2e', accounts: ['ORG_A_OWNER'] }, async () => {
  const c = await as('ORG_A_OWNER');
  const page = await publishedPage(c, 'MOTION-KHONG-TRAN');
  for (const vp of ['mobile', 'desktop'] as const) {
    await withPublicPage(page.slug, vp, async (p) => {
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(1500);
      assert.equal(await horizontalOverflow(p), 0, `${vp}: sau khi cuộn hết trang vẫn không tràn ngang`);
    });
  }
  });
  todo("LP11-S04-TC005", "Phần tử có hiệu ứng vẫn bấm được", { prio: 'P1', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
  todo("LP11-S04-TC006", "Lỗi khi vài phần tử không tìm thấy", { prio: 'P2', why: "cần trình duyệt thật để đo hiệu ứng/viewport" });
});
