# Hiệu ứng chuyển động — 10/11/2026

Source: `/var/www/aibeego_com_usr/data/www/aibeego.com`.

## Hành vi đã triển khai

- Panel chung **Hiệu ứng chuyển động** trong tab **Thiết kế**, qua `InspectorAccordion`. Panel được truyền vào cả Inspector thường, `LandingPageButtonInspector` và `LandingPageIconInspector`.
- Nhãn đối tượng gồm loại, block ID và khóa cục bộ. Thẻ, tiêu đề, mô tả và ảnh trong thẻ có khóa riêng. CTA chạy trên toàn bộ bề mặt liên kết/nút.
- Không cấu hình mặc định. Có Không hiệu ứng, Hiện dần, bốn hướng trượt, Phóng to `.96 → 1`, Thu nhỏ `1.04 → 1`. Kích hoạt khi mở trang hoặc khi cuộn tới; chọn preset mới mặc định khi cuộn tới, 450 ms, trễ 0 ms. Thời lượng 150–1.200 ms; trễ 0–400 ms.
- Thay preset/trigger xác nhận ngay; số giữ draft cục bộ đến blur/Enter. Một xác nhận tạo một bước Undo. Thao tác không đổi giá trị không thêm lịch sử. Cập nhật đọc `specRef.current`, kiểm tra khóa phần tử/section cha, rồi đi qua `updateBlock → pushHistory` và autosave hiện có.
- Không hiệu ứng xóa đúng target; khi không còn cấu hình thì xóa `lpMotion`. Chạy thử phát sự kiện tạm thời đến renderer của canvas, không cập nhật spec hoặc gọi history. Canvas bình thường giữ nguyên vị trí; pointer/focus dừng chạy thử trên đối tượng đang tương tác.

## Dữ liệu và renderer

```json
{
  "style": {
    "lpMotion": {
      "section": { "preset": "fade", "trigger": "scroll", "duration": 450, "delay": 0 },
      "elements": {
        "field:headline": { "preset": "slide-up", "trigger": "load", "duration": 450, "delay": 0 },
        "image": { "preset": "zoom-in", "trigger": "scroll", "duration": 450, "delay": 0 },
        "item:card-a": { "preset": "fade", "trigger": "scroll", "duration": 450, "delay": 0 },
        "field:itemTitle:card-a": { "preset": "slide-right", "trigger": "scroll", "duration": 450, "delay": 0 },
        "field:ctaLabel": { "preset": "zoom-out", "trigger": "load", "duration": 450, "delay": 0 }
      }
    }
  }
}
```

`sanitizeLandingPageSpec` chuẩn hóa riêng `lpMotion`, chỉ nhận preset/trigger cho phép, giới hạn số và loại mục sai cấu trúc. Các style khác được giữ nguyên. Remap chính xác ID của item/plan khi nhân bản item, block, cả trang/template; clipboard chuyển đổi phần tử chỉ mang theo cấu hình của target được sao chép. Hỗ trợ ID Unicode và ID có dấu `:`. Dùng `draftSpec`, `publishedSpec`, version và template JSON hiện có; không có migration.

`LandingPageRenderer` dùng chung runtime cho preview/public. Runtime tìm các lớp DOM đã có của `SelectableShell`, `ElementChrome`, `InlineEditable`, card và section portal; không thêm wrapper hoặc đổi `display`. Keyframe có namespace `aibeego-lpm-*`, dùng opacity và các thuộc tính riêng `translate`/`scale`, giữ `transform` thiết kế. Danh sách animation cũ, composition, timeline và range được bảo toàn rồi khôi phục. Chỉ clip ngang tạm thời lúc chạy.

IntersectionObserver dùng ancestor thực sự cuộn, unobserve sau lần chạy đầu. Các target portal chưa mount được phát hiện bằng MutationObserver; observer này dừng khi đã tìm đủ target. Observer, timer, RAF và listener được dọn khi unmount. Load dùng RAF để hoạt động cả trong React StrictMode. Mỗi target chạy một lần trong vòng đời lượt xem.

Nội dung chờ cuộn vẫn hiển thị; thiếu JavaScript/IntersectionObserver không tạo trạng thái ẩn. Reduced motion bỏ qua hoặc dừng hiệu ứng. Focus vào CTA/form dừng hiệu ứng liên quan. Header và LeadForm không được tự gắn hiệu ứng mới. Luồng HTML import được loại khỏi panel/runtime mới.

## Kết quả kiểm thử thực tế

Môi trường QA tách biệt: `/tmp/aibeego-lp-motion-check`, tái sử dụng dependency đã có tại `landing-text-worktree`; source production không có `node_modules`. Không ghi database thật hay deploy ứng dụng.

| Kiểm tra | Kết quả |
| --- | --- |
| Shared TypeScript build | PASS, exit 0 |
| `test-landing-page-motion.cjs` | PASS: 8 nhóm hành vi |
| Khóa target, clamp/sanitizer, xóa riêng và giữ style cũ | PASS |
| Hàm builder thật: một Undo/xác nhận, không đổi giá trị, lock, Undo/Redo, revision, receipt autosave/mở lại | PASS với I/O giả lập |
| `dupItem` thật cho card/plan: remap cấu hình và một Undo | PASS |
| Publish method thật, `publishedSpec` và version snapshot | PASS với transaction/database trong bộ nhớ; không kiểm tra concurrency production |
| Template JSON qua ZIP parser và `acceptSpec` thật | PASS |
| Chromium, renderer/panel thật | PASS: 18 nhóm, không có page error |
| 7 preset × 1440/820/390 px | PASS; phóng/thu đúng hướng, card/chữ tách biệt, giữ lật ảnh, không tràn ngang |
| Ảnh trước/sau source, preview/public và trạng thái kết thúc | PASS: PNG trùng byte ở cả 3 kích thước trên fixture classic |
| 4 preset khác nhau trên tiêu đề/ảnh/thẻ/nút trong cùng section | PASS |
| Cuộn trong preview, chạy một lần, unmount observer | PASS |
| Reduced motion, thiếu IntersectionObserver, StrictMode, portal | PASS |
| Bàn phím, CTA tới form, nhập form, chạy thử/pointer | PASS |
| `lpBgMotion`, `imageStyle.motion`, CSS transform + `animation-timeline: view()` | PASS trên fixture kiểm thử |
| `test-landing-page-undo-page-isolation.cjs` | PASS |
| `test-landing-page-template-pack.ts` | PASS |
| Typecheck toàn web | FAIL: 146 diagnostics; baseline trước sửa 164. Không có diagnostic trong các module motion mới. Hợp đồng props và nhiều export của checkout còn thiếu từ trước. |
| 5 gate source cũ: Design, context, preview/public, background, icon | Vẫn FAIL tại các gate đã FAIL trước sửa; đã chạy đối chiếu baseline. Ví dụ gate Undo tìm chuỗi `onClick={undo}` dù callback hiện có được nối qua toolbar. |

Ảnh dùng nội dung cố định, SVG cục bộ, font Arial, DPR 1; tạm pause animation cũ/transition trong **fixture QA** để ảnh có cùng thời điểm. Runtime mới vẫn được chạy và kiểm tra trước khi chụp trạng thái cuối. Baseline bundle dùng source renderer/canvas trước sửa; selection helper hiện tại bổ sung các export bị thiếu sẵn để baseline có thể bundle.

Artifact của lần QA trong phiên này:

- [Log browser](/tmp/aibeego-lp-motion-browser-final.log), [log interaction bổ sung](/tmp/aibeego-lp-motion-interactions-final.log).
- [Kết quả browser JSON](/tmp/aibeego-lp-motion-browser/results.json).
- 30 ảnh: `/tmp/aibeego-lp-motion-browser/{1440,820,390}-{baseline,none,preview,fade-finished,slide-down-finished,slide-up-finished,slide-right-finished,slide-left-finished,zoom-in-finished,zoom-out-finished}.png`.
- [Typecheck web](/tmp/aibeego-lp-motion-web-final-tsc.log), [baseline web](/tmp/aibeego-lp-motion-web-baseline-tsc.log), [shared build](/tmp/aibeego-lp-motion-shared-final-tsc.log).

## Tái chạy

Sau khi cài dependencies của repo và build shared:

```bash
node scripts/test-landing-page-motion.cjs
node scripts/test-landing-page-undo-page-isolation.cjs
node --experimental-strip-types scripts/test-landing-page-template-pack.ts
node scripts/build-landing-page-motion-qa.cjs
```

Bundler QA dùng esbuild đã được cài. Có thể chỉ định `LP_MOTION_ESBUILD` hoặc `LP_MOTION_QA_DEPS` đến dependency tree có sẵn. `LP_MOTION_QA_BASELINE_SOURCE` là thư mục chứa source trước sửa nếu cần so ảnh baseline. Script in đường dẫn bundle và CSS.

```bash
LP_MOTION_QA_BUNDLE=/tmp/aibeego-lp-motion-qa-build/motion.js \
LP_MOTION_QA_BASELINE_BUNDLE=/tmp/aibeego-lp-motion-qa-build/baseline.js \
LP_MOTION_QA_CSS=/path/to/apps/web/.next/static/css/app/layout.css \
node scripts/qa-landing-page-motion-browser.cjs
```

`LP_MOTION_QA_BASELINE_BUNDLE` là tùy chọn; bỏ biến này nếu không build baseline. `LP_QA_CHROME` chọn Chromium executable, `LP_MOTION_QA_OUT` chọn thư mục artifact. Style component được bundle riêng tại `motion.css`; có thể bổ sung qua danh sách đường dẫn `LP_MOTION_QA_CSS` phân cách bằng dấu `:` trên Linux khi kiểm thử các renderer khác.

## Chưa xác minh

- Full Builder E2E cho kéo thả, resize, xoay và sửa chữ với mọi mẫu; checkout đang có lỗi build/export từ trước, bao gồm export Inspector typography/size, `previewBtnStyle`, và module API revision/receipt thiếu trong source. Đã xác minh runtime không ghi `transform`, ảnh lật giữ nguyên, canvas không tự chạy và pointer dừng audition; đây không thay cho kiểm thử gesture đầy đủ.
- Lưu/mở lại/publish qua API và database thật; kiểm thử persistence hiện dùng hàm thật với I/O giả lập.
- Toàn bộ template catalog, tất cả Custom CSS bên ngoài fixture, Safari/Firefox và chế độ tắt JavaScript trên trang production.
- Build/deploy production và kiểm tra public URL thật.

## Danh sách file thay đổi

Shared:

- `packages/shared/src/landing-page-motion.ts` — mới, types/khóa/sanitize/patch/remap.
- `packages/shared/src/landing-page-canvas.ts` — type `style.lpMotion`.
- `packages/shared/src/landing-page-lifecycle.ts` — sanitize và clone ID.
- `packages/shared/src/index.ts` — export API motion.

Builder/renderer, trong `apps/web/src/components/landing-pages/`:

- `landing-page-motion-panel.tsx` — mới, panel chung.
- `landing-page-motion-runtime.ts` — mới, keyframe/runtime/observer/audition.
- `landing-page-builder.tsx` — update từ specRef, slot Inspector, remap duplicate/clipboard.
- `landing-page-inspector-design-tab.tsx` — panel slot và field context.
- `landing-page-button-inspector.tsx` — panel slot.
- `landing-page-icon-inspector.tsx` — panel slot.
- `landing-page-inspector-context.ts` — icon/card và field lồng nhau.
- `landing-page-canvas-selection.ts` — helper lựa chọn ảnh trong thẻ còn thiếu ở checkout.
- `landing-page-canvas-ux.tsx` — field anchor public của ElementChrome.
- `landing-page-renderer.tsx` — runtime chung preview/public.

Kiểm thử/bàn giao:

- `scripts/test-landing-page-motion.cjs` — mới.
- `scripts/helpers/landing-page-motion-harness.cjs` — mới.
- `scripts/qa-landing-page-motion-browser.cjs` — mới.
- `scripts/build-landing-page-motion-qa.cjs` — mới.
- `scripts/fixtures/landing-page-motion-browser.tsx` — mới.
- `docs/landing-page-motion-20261110.md` — báo cáo này.

## Cập nhật deploy production — 10/11/2026

Đã deploy tại **https://aibeego.com**, release **`lpb-motion-20261110`** (web và API).

Đã ghép thay đổi motion vào source đầy đủ của bản production `restore-assistant-widget-20261109`, giữ các sửa lỗi Inspector, typography, card và template import đang chạy. Source đã ghép được đồng bộ về repository mở và source canonical. Build shared, build Next production và gate source/bundle Builder đều PASS. Build Next dùng cấu hình release hiện có; không thay cấu hình kiểm tra type.

Kiểm tra sau deploy:

- Health API và manifest build ID qua domain: PASS.
- Builder thật trên container QA và trên domain production, dùng API intercepted để không sửa dữ liệu thật: PASS cho tiêu đề/ảnh/thẻ/nút/icon, hai nhánh Inspector riêng, chạy thử không autosave, xóa đúng target, Undo/Redo và mở lại. Không có page error.
- Shared sanitizer/remap được chạy trực tiếp trong API image mới với network tắt: PASS. API image chỉ overlay `landing-page-motion.js`, `landing-page-lifecycle.js` và bổ sung export trong `index.js`.
- Ảnh trang public `phan-mem-truc-tuyen` trước/sau deploy: **trùng pixel hoàn toàn**, kích thước 1440 × 5113. Đã cố định thời gian/animation và chờ giải mã tất cả ảnh lazy-load.
- 27 landing page và 200 template giữ nguyên; hash toàn bộ `draftSpec`/`publishedSpec` trước/sau khớp. Không migration.
- Environment, mount và cấu hình Google giữ nguyên; assistant API vẫn trả 401 khi chưa đăng nhập.

Evidence release: [`final-summary.json`](/var/www/aibeego_com_usr/data/backups/landing-page-motion-20261110/final-summary.json), [`production-http.json`](/var/www/aibeego_com_usr/data/backups/landing-page-motion-20261110/production-http.json), [`production-ui/report.json`](/var/www/aibeego_com_usr/data/backups/landing-page-motion-20261110/production-ui/report.json). Source/artifact tái build: `/var/www/aibeego_com_usr/data/backups/landing-page-motion-20261110/release-source`.

Rollback image được giữ: `marketingaz-web:restore-assistant-widget-20261109` và `marketingaz-api:restore-assistant-widget-20261109`; compose trước deploy ở thư mục evidence release.

Các giới hạn về thao tác kéo/resize/xoay đầy đủ, Safari/Firefox, mọi template và lưu/publish vào database thật vẫn chưa được bổ sung kiểm thử trong lần deploy này. Các kết quả “chưa deploy/build” ở phần báo cáo triển khai ban đầu bên trên là trạng thái lịch sử, đã được thay thế bởi cập nhật này.
