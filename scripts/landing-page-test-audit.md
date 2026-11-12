# Landing Page Builder — audit test cục bộ (30/10/2026)

**Cập nhật sau audit — lỗi reorder đã sửa:** cả ba đường đổi thứ tự nay dùng handler theo ID trên `specRef.current`; sidebar chỉ lấy ID từ danh sách đang hiển thị. Regression nguồn kiểm tra giữ nguyên nội dung/meta, đúng hai bước lịch sử (text rồi reorder), Undo/Redo, autosave đang chờ phản hồi và reload. Chromium cũng PASS cả ba đường trong fixture React cục bộ dùng callback nguồn thật, Suspense giữ transition và API giả lập; chưa phải E2E toàn bộ app Builder. Không gọi production/DB thật hoặc deploy. Các số liệu và bảng dưới đây là snapshot audit **trước** bản sửa này, không phải một lượt chạy lại toàn bộ danh mục.

File của bản sửa reorder: `landing-page-builder.tsx`, `scripts/test-landing-page-history-live-edit.cjs`, `scripts/test-landing-page-history-live-edit-browser.cjs`, helper nguồn và ghi chú audit này. Test history/recovery/revision/autosave/publish/visibility liên quan đều PASS. TypeScript: trước 16 lỗi có sẵn, sau 16, mới 0; chi tiết `/tmp/lp-reorder-fix-jg6gjy9w/typescript.json`. Lỗi similarity catalog vẫn chưa sửa.

Đã rà 99 script. Kết quả: **34 PASS, 2 FAIL do lỗi sản phẩm, 61 FAIL do matcher lỗi thời, 2 BLOCKED**. Bộ test chưa xanh toàn bộ. Tám suite ưu tiên đã cập nhật đều PASS; không xóa assertion để lấy PASS. Các mục FAIL từ matcher ngoài phạm vi ưu tiên vẫn giữ nguyên assertion và exit code FAIL để tiếp tục thay bằng kiểm tra hành vi.

Không gọi production, không ghi DB, không deploy và không sửa code sản phẩm. 1.321 file nguồn/cấu hình trong apps/packages giữ nguyên SHA-256 so với đầu lượt audit; ba bản sửa draft recovery, Undo sau restore và visibility lock được giữ nguyên. Service API chỉ được thực thi qua method nguồn với transaction/model giả lập, không import Prisma/Nest service đang chạy.

PASS có nghĩa các assertion của script đã chạy. Các suite cũ vẫn có matcher static hoặc fixture HTML tự dựng; không suy ra PASS giao diện Builder. Ba fixture Chromium cũ chạy riêng không tương đương browser E2E của app. Chưa kiểm tra UI Builder bằng trình duyệt.

## File thay đổi

- `scripts/test-landing-page-draft-recovery.ts`
- `scripts/test-landing-page-revision.ts`
- `scripts/test-landing-page-autosave-stuck.cjs`
- `scripts/test-landing-page-version-restore-revision.cjs`
- `scripts/test-landing-page-undo-page-isolation.cjs`
- `scripts/test-landing-page-publish-flush.cjs`
- `scripts/test-landing-page-lock-and-advanced-position.cjs`
- `scripts/test-landing-page-element-visibility-lock.cjs`

File mới hỗ trợ audit/regression:

- `scripts/test-landing-page-history-live-edit.cjs`
- `scripts/helpers/landing-page-source-harness.cjs`
- `scripts/helpers/landing-page-offline.cjs`
- `scripts/helpers/landing-page-legacy-matchers.json`
- `scripts/run-landing-page-local-tests.cjs`
- `scripts/landing-page-test-audit.md`

## Kiểm tra hành vi ưu tiên

- Recovery: base10/rev11 so với server10 phục hồi; server11/12 giữ local và conflict; ack/invalid/absent an toàn; tải server lỗi giữ local; chọn server thành công mới bỏ local; debounce/exit không ghi đè pending local.
- Restore/history: chạy source service transaction với fresh revision42 + snapshot5 => revision43; snapshot bảo vệ trước restore; publishedSpec không bị ghi; Undo/Redo enable và callback nút/phím Ctrl/Cmd nhất quán trên hai toolbar; page key và refs tách biệt.
- Autosave/conflict: source persist/load, timer giả lập, nút Save manual/background, stale không tăng revision hay retry, abort truyền nguyên lỗi, caret không bị focus lại khi gõ, source API từ chối stale trước mọi write.
- Publish: chờ autosave đang chạy, flush live edit tiếp theo trước publish; conflict cấm publish; theme/AI/Undo đọc live ref; source CSS debounce/blur, mobile positioning và multi-select được thực thi thay vì dò comment.
- Lock: bốn nút/callback Ẩn/Hiện đều bị chặn khi section khóa; draft/history/revision bất biến; mở khóa vẫn được; Undo/Redo và source persist/load giữ visibility; clamp dùng hàm nguồn, không mô phỏng thuật toán.
- Mutation checks trong bộ nhớ/temp: bỏ guard visibility, bỏ cập nhật historyNav sau restore, hoặc đưa comparator recovery cũ trở lại đều khiến assertion tương ứng thất bại. Không thay source sản phẩm.

## Phát hiện sản phẩm trong audit và trạng thái hiện tại

1. **Đã sửa sau audit: mất live text khi reorder section trong lúc transition chờ render.** `updateBlockFieldLive` ghi text mới vào specRef và xếp transition; `moveBlock`, `reorderBlockById` và callback sidebar dựng bản mới từ closure `spec` cũ. Source regression `test-landing-page-history-live-edit.cjs` tái hiện cả ba đường: `Live text waiting for React` trở về `Headline`, thứ tự đổi thành `[cta, hero]`, revision tăng 11 → 12. Đây là lỗi hành vi qua callback thật, không phải matcher hay lỗi do ba bản sửa mới.
2. **Hai cặp template vi phạm chính similarity gate của sản phẩm.** Đã chạy trực tiếp `packages/shared/src/index.ts` (không chỉ dist): `evaluateTemplatePairSimilarity(...).ok === false`, `failCount === 2`, score đều 88,235%: `website-build-build-steps` ↔ `consulting-b2b-engagement-process`; `website-build-nav-services` ↔ `agency-portfolio-split`. Không sửa catalog hoặc ngưỡng để lấy PASS.

`phase3-catalog` còn hai gate conversion bị giả định catalog cũ: enterprise/process SaaS hiện có goal `contact`, agency modern-SaaS có `signup`; catalog validator nguồn vẫn hợp lệ. Ghi riêng các matcher này, không coi chúng là bằng chứng độc lập của lỗi sản phẩm mới.

## Matcher cũ và BLOCKED

61 script còn FAIL được phân loại matcher cấu trúc/comment/tên phiên bản/số lượng cũ. Đây là phân loại nguyên nhân assertion, không khẳng định UI tương ứng hoạt động đúng. Runner chỉ nhận diện gate đã rà và đúng SHA-256 của script trong `landing-page-legacy-matchers.json`; exception hoặc gate thất bại mới vẫn được báo lỗi sản phẩm để kiểm tra, không tự đưa vào danh sách matcher.

Ví dụ đã đối chiếu bằng nguồn: inline AI hiện có 9 action (thêm `rewrite`) trong khi test đòi đúng 8; catalog hiện `gallery-v21-production-visual-axis` trong khi hai test đòi v7; selector SaaS trả architecture `saas_product_led` nhưng sectionSequence vẫn có `Pricing` — assertion theo substring tên architecture đã lỗi thời. Nhiều test layout còn đòi scroll/page/toolbar cũ khác với cấu trúc hiện tại; chưa kiểm chứng UI bằng browser.

- `doctor-gates`: BLOCKED vì không có API/DB test cô lập; script đọc .env, tạo/xóa dữ liệu và gọi URL ngoài. Không chạy.
- `saas-ready`: BLOCKED vì cần build workspace/API cô lập; không chạy build trên workspace đang dùng.

## TypeScript

Nguồn sản phẩm không đổi: **0 lỗi TypeScript mới**. Kiểm tra 5 file liên quan ghi nhận **16 lỗi có sẵn**: builder 4, canvas-ux 12, ba file còn lại 0. Chi tiết diagnostic lưu tại `/tmp/lp-test-audit-scxkk52j/typescript.json`. Các lỗi có sẵn không được sửa trong lượt audit test. Hai test TypeScript đã thay đổi cũng được kiểm tra riêng với strict + Node types sẵn có: trước 0, sau 0, mới 0 (`/tmp/lp-test-audit-scxkk52j/test-typescript.json`).

## Chạy lại

```sh
node scripts/run-landing-page-local-tests.cjs
```

Runner dùng Node + loader tsx sẵn có cho .ts/.mts, chặn outbound HTTP/TCP và Prisma, bỏ hai suite integration/build nêu trên. Test nguồn dùng API/mock in-memory; không dùng .env. Báo cáo JSON và log từng script được ghi trong thư mục temp trả về. Exit code 1 khi còn FAIL, 2 khi chỉ còn BLOCKED.

Lượt xác minh: `/tmp/lp-test-audit-scxkk52j/verified/results.json`; log đầy đủ: `/tmp/lp-test-audit-scxkk52j/verified/`. Các script đều đã được đọc để rà side effect trước khi chạy; không dùng runner này cho script mới chưa rà.

## Kết quả từng script (snapshot audit trước sửa reorder)

| Script | Kết quả | Phân loại / bằng chứng |
| --- | --- | --- |
| `test-landing-page-add-components-dnd.cjs` | FAIL | MATCHER_OUTDATED: FAIL BLOCK_TYPE_DRAG — Header/Footer/Speaker/LeadForm cards drag via block-type payload |
| `test-landing-page-add-components-grid.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-autosave-stuck.cjs` | PASS | source behavior with mocked I/O |
| `test-landing-page-box-presets.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-builder-fixed-panels.cjs` | FAIL | MATCHER_OUTDATED: FAIL INSPECTOR_FIXED inspector docked column / floating portal; tabs retained; FAIL CANVAS_NO_OVERLAP canvas full column; toolbar floats above; FAIL DESKTOP_SCROLL page scroll + floating toolbar + inspector scroll; FAIL MOBILE_UNCHANGED mobile overflow/touch behavior kept; FAIL CANVAS_CORE_UNCHANGED canvas/autosave/AI/compact sidebar untouched |
| `test-landing-page-builder-library.cjs` | FAIL | MATCHER_OUTDATED: FAIL TEMPLATE_PREVIEW preview modal retained; FAIL TEMPLATE_CLONE use template clones draft with new IDs; FAIL RESPONSIVE viewport switch keeps selection; no overflow |
| `test-landing-page-builder-preview-public-parity.cjs` | FAIL | MATCHER_OUTDATED: FAIL BLOCKS_COVERED — Hero, Benefits/List, Pricing, CTA, Guarantee, LeadForm, Image use shared primitives |
| `test-landing-page-builder-responsive.cjs` | FAIL | MATCHER_OUTDATED: FAIL INSPECTOR_HOST_NOT_UNCONDITIONALLY_INERT — mobile/tablet portal host branch is distinct from the desktop-docked spacer branch; FAIL INSPECTOR_HOST_MOBILE_BRANCH_HAS_NO_POINTER_EVENTS_NONE — the tablet/mobile branch's className string ('relative min-h-0 min-w-0 h-[70vh] max-h-[70vh]') does not include pointer-events-none; FAIL INSPECTOR_MOBILE_HOST_HAS_BOUNDED_HEIGHT — mobile/tablet host has an explicit, bounded height so the portaled panel (height:100%) resolves correctly and can scroll internally instead of forcing the page to full-viewport height; FAIL SIDEBAR_RAIL_BELOW_ACTION_BAR_ON_MOBILE — rail moved from top-16 (inside the ~56-111px action bar span) to top-[7rem] (112px, below it), z-index raised above the action bar (45); FAIL DESKTOP_OFFSETS_UNTOUCHED — action-bar spacer height and both CSS offset vars kept at their original values — desktop (>=1024) layout math is byte-identical to before this pass; FAIL DESKTOP_INSPECTOR_DOCKED_SPACER_STILL_INERT — the desktop-docked spacer role (pointer-events-none, original offset var) is preserved exactly — only the tablet/mobile branch changed behavior; FAIL DESKTOP_VIEWPORT_SIMULATOR_WIDTHS_UNCHANGED — in-canvas Desktop/Tablet/Mobile preview container widths (100%/768px/390px) already matched real device breakpoints — left untouched |
| `test-landing-page-builder-toolbar.cjs` | FAIL | MATCHER_OUTDATED: FAIL NO_DOUBLE_SCROLL — Viewport locked to 100dvh; no page-level scroll competing with canvas; FAIL TOOLBAR_NO_WHEEL_SCROLL — Toolbar blocks wheel scroll and stays sticky under app header; FAIL RESPONSIVE — Device switch + compact overflow-safe toolbar row; FAIL COMPACT_TOOLBAR — Compact icon buttons + orange Publish; FAIL DEVICE_SWITCH — Icon-only device switch; FAIL SAVE — Save wired; FAIL TOOLBAR_CANVAS_ALIGN — Edit mode centers toolbar in canvas column; preview keeps viewport center |
| `test-landing-page-builder-upgrade.cjs` | FAIL | MATCHER_OUTDATED: FAIL RESPONSIVE viewport + selection by id; FAIL UNDO_REDO history stack intact |
| `test-landing-page-business-profile.cjs` | FAIL | MATCHER_OUTDATED: FAIL Builder UX |
| `test-landing-page-button-presets.cjs` | FAIL | MATCHER_OUTDATED: FAIL RAIL_OPENS_PANEL — Nút bấm rail opens button presets overlay |
| `test-landing-page-canvas-context-menu.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-canvas-full-scroll.cjs` | FAIL | MATCHER_OUTDATED: FAIL CANVAS_HEIGHT_AUTO — canvas height auto + min-height from viewport chrome; FAIL CONTENT_MOVED_UP — reduced top padding + tighter chrome offset; FAIL PAGE_SCROLL_FULL_CONTENT — desktop canvas overflow visible — page scrolls full content; FAIL LANDING_PAGE_CORE_UNCHANGED — canvas/autosave/undo/publish core intact |
| `test-landing-page-canvas-production.cjs` | FAIL | MATCHER_OUTDATED: FAIL TOOLBAR_NO_OVERLAY mobile toolbar below section, canvas padding; FAIL STALE_SAVE_BLOCKED server rejects lower clientRevision |
| `test-landing-page-canvas-reserve-height.cjs` | FAIL | MATCHER_OUTDATED: FAIL LIVE_RESERVE_STILL_SERVES_ACTIVE_GESTURE — all 6 legitimate during-gesture call sites (cancel-cleanup, rotate/resize/move rAF, 2 gesture-start sites) are intact; FAIL CONTENT_OVERFLOW_VISIBLE_BY_DESIGN — free sections use overflow:visible + a spec-committed height (border-box) — organic content growth (e.g. a slow-loading image) intentionally does not auto-grow the canvas reserve; this predates and is unchanged by the BUG-15 fix — only an explicit resize (which does commit a new height) changes the reserve |
| `test-landing-page-canvas-selection.cjs` | FAIL | MATCHER_OUTDATED: FAIL SHIFT_MULTI_SELECT shift+click appends to selection; FAIL SHIFT_TOGGLE shift+click selected item removes it; FAIL ONLY_ONE_TOOLBAR single toolbar host; InlineEditable does not render toolbar; FAIL SECTION_DRAG_ONLY_BY_HANDLE flow: reorder ⠿ only; free mode: body drag + Tự do toggle (not drag-on-click) |
| `test-landing-page-canvas-ux.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-content-image-toolbar.cjs` | FAIL | MATCHER_OUTDATED: FAIL IMAGE_TOOLBAR_UI — ẢNH portal toolbar on content image select |
| `test-landing-page-content-safe-area.cjs` | FAIL | MATCHER_OUTDATED: FAIL DRAG_BOUNDARY — content drag clamps to safe-area; sections stay full-width; FAIL RESIZE_BOUNDARY — content resize clamped inside safe-area width |
| `test-landing-page-create-ai-first.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-custom-css-per-element.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-design-audit.cjs` | FAIL | MATCHER_OUTDATED: FAIL FREE_BODY_DRAG — free mode: body drag armed; Tự do is toggle not drag-only handle; FAIL CTA_BODY_SELECTS_CTA — CTA text body selects cta; not stolen by section free drag |
| `test-landing-page-device-frame.cjs` | FAIL | MATCHER_OUTDATED: FAIL MOBILE_REAL_VIEWPORT — Viewport sim CSS forces real mobile breakpoint (1-col), not desktop scale-down; FAIL MOBILE_SCROLL — No inner device scroll; outer canvas scrolls vertically; FAIL NO_HORIZONTAL_OVERFLOW — No horizontal overflow guards on frame + sim CSS; FAIL DESKTOP_TABLET_UNCHANGED — Desktop keeps bare canvas; tablet uses device frame + 768 width |
| `test-landing-page-doctor-gates.cjs` | BLOCKED | BLOCKED: Thiếu API/DB test cô lập; script tải .env, ghi/xóa DB và gọi URL ngoài. Không chạy. |
| `test-landing-page-draft-recovery.ts` | PASS | source behavior with mocked I/O |
| `test-landing-page-drag-resize-engine.cjs` | FAIL | MATCHER_OUTDATED: FAIL NO_REACT_FIGHT_WHILE_DRAGGING — freeLayoutStyle omits geometry while dragging; FAIL TEXT_BOX_WH — corners set W+H; no max-width lock; old width-only scale removed |
| `test-landing-page-element-free-drag.cjs` | FAIL | MATCHER_OUTDATED: FAIL INLINE_TEXT_DRAG — InlineEditable arms offset drag when selected; FAIL SECTION_DOES_NOT_STEAL — section free-drag blocked on inline/box/cta child hits; FAIL ELEMENT_CHROME_DRAG — ElementChrome (image/button) supports free drag |
| `test-landing-page-element-visibility-lock.cjs` | PASS | source behavior with mocked I/O |
| `test-landing-page-free-drag-center-guides.cjs` | FAIL | MATCHER_OUTDATED: FAIL FREE_DRAG_XY_ROOM — expand canvas for X/Y room; preserve box size (no shrink-on-move) |
| `test-landing-page-free-drag-move-size.cjs` | FAIL | MATCHER_OUTDATED: FAIL CHILD_LAYOUT_PRESERVED — section size from shell rect, not text-node union |
| `test-landing-page-free-position-canvas.cjs` | FAIL | MATCHER_OUTDATED: FAIL RESPONSIVE_SAFE mobile without free layout falls back to flow |
| `test-landing-page-free-toggle-content-rect-and-drag-handle.cjs` | FAIL | MATCHER_OUTDATED: FAIL MEASURES_CHILDREN_UNION_NOT_SHELL — a dedicated helper unions the section's direct children's boxes instead of trusting the (always-100%-wide) <section> shell itself; FAIL TOGGLE_USES_CONTENT_RECT_FOR_XY — x/y are derived from the measured visible content box, not shell.getBoundingClientRect() |
| `test-landing-page-free-toggle-no-collision.cjs` | FAIL | MATCHER_OUTDATED: FAIL BUILDER_IMPORTS_MEASURING_HELPERS — landing-page-builder.tsx imports readRect/resolveFreeSurface; FAIL SHARED_MEASURE_HELPER_PRESENT — a single measureFreeToggleLayout() computes real on-screen x/y instead of a hardcoded corner |
| `test-landing-page-graphics-library.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-heading-box-resize-shrink.cjs` | FAIL | MATCHER_OUTDATED: FAIL CHROME_FIRES_FALSE_BEFORE_COMMIT_SAME_BATCH — onResizingChange(false) fires in the same synchronous handler as onCommitBox — both land in one React batch, so the next render never shows the pre-drag stale size even for a frame; FAIL DECLARATIVE_OVERRIDE_SKIPPED_WHILE_RESIZING — the wrap span's width/height/overflow object is entirely omitted while boxResizing is true, instead of being unconditionally recomputed from (stale, pre-drag) boxWidth/boxHeight on every render — same 'let the live gesture own the DOM' pattern already used by freeLayoutStyle's dragging branch |
| `test-landing-page-heading-toolbar.cjs` | FAIL | MATCHER_OUTDATED: FAIL HEADING_NO_TEXT_LOSS — level change keeps text + family/align/bold; FAIL HEADING_TEXT_WRAP — width on wrap only; text fills wrap and reflows; FAIL HEADING_RESIZE_SMOOTH — pointer capture + scale + rAF during heading resize; FAIL HEADING_LINE_HEIGHT — wrapped headings use safe line-height; FAIL HEADING_AUTO_HEIGHT — no fixed height / overflow:hidden on heading text; FAIL SMALL_RESIZE_HANDLES — all handles ~10px squares (no tall bars); FAIL HEADING_CORNER_BOX_SCALE — corner drag scales box width; height auto from wrap; FAIL HANDLE_BOUND_SYNC — 6 handles stick to live wrap bounds |
| `test-landing-page-history-live-edit.cjs` | FAIL | PRODUCT_FAILURE: FAIL LIVE_EDIT_PRESERVED_moveBlock {"action":"moveBlock","expected":"Live text waiting for React","actual":"Headline","revision":12}; FAIL LIVE_EDIT_PRESERVED_reorderBlockById {"action":"reorderBlockById","expected":"Live text waiting for React","actual":"Headline","revision":12}; FAIL LIVE_EDIT_PRESERVED_sidebar {"action":"sidebar","expected":"Live text waiting for React","actual":"Headline","revision":12};   throw new AssertionError(obj);; AssertionError [ERR_ASSERTION]: reordering sections must preserve text from the live draft during a pending transition |
| `test-landing-page-html-sections.ts` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-icon-symbols.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-inline-ai-context.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-inline-ai.cjs` | FAIL | MATCHER_OUTDATED: FAIL 8 AI actions |
| `test-landing-page-inline-edit-ready.cjs` | FAIL | MATCHER_OUTDATED: FAIL MOBILE_INLINE_EDIT tap-to-edit + toolbar below + scroll does not edit |
| `test-landing-page-inspector-canvas-first.cjs` | FAIL | MATCHER_OUTDATED: FAIL STICKY_SCROLL — sticky header+tabs; independent scroll; ~240px; FAIL CANVAS_FIRST_CONTENT — no duplicate text inputs; CRM/image/button/video element-aware |
| `test-landing-page-inspector-context-aware.cjs` | FAIL | MATCHER_OUTDATED: FAIL CONTEXT_AWARE — selection drives content/design; design groups context-aware; FAIL CRM_UNCHANGED — FORM → CRM inspector preserved; FAIL UNDO_REDO — undo/redo intact; FAIL NO_OVERFLOW — sticky header + independent scroll ~240px; FAIL ADVANCED_ACCORDIONS_COLLAPSED — 6 advanced accordions default collapsed |
| `test-landing-page-inspector-design-tab.cjs` | FAIL | MATCHER_OUTDATED: FAIL BORDER_RADIUS — border + linked/unlinked radii; FAIL FILTER — filter accordion collapsed by default; FAIL UNDO_REDO — undo/redo untouched |
| `test-landing-page-inspector-modes.cjs` | FAIL | MATCHER_OUTDATED: FAIL CANVAS_EXPAND — canvas full width — floating toolbar outside grid; FAIL MOBILE_UNCHANGED — mobile rail in-flow; floating toolbar desktop-only; FAIL DOCKED_CANVAS_SCROLL_INDEPENDENT — docked desktop uses page scroll, not inner canvas frame; FAIL FLOATING_PAGE_BROWSER_SCROLL — floating + docked share page-level scroll |
| `test-landing-page-interaction-fixes.cjs` | FAIL | MATCHER_OUTDATED: FAIL SECTION_OVERLAP — free enable measures height; canvas-level reserve prevents overlap stack; FAIL HERO_FREE_SYNC — Hero slot + canvas-level free reserve sync; FAIL EMPTY_SECTION_CLICK — canvas-level free reserve; empty padding selects section |
| `test-landing-page-interaction-p1.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-item-resize-shrink.cjs` | FAIL | MATCHER_OUTDATED: FAIL OFFSET_SHELL_GETS_OVERFLOW_HIDDEN_AND_MIN_HEIGHT_0 — freeLayoutStyle's offset branch sets minHeight:0 + overflow:hidden alongside height — the actual fix, one shared function benefiting items AND free-dragged elements; FAIL FLOW_MODE_STILL_UNTOUCHED — when layout.height is unset (never resized), the offset branch adds nothing extra — no behavior change for the common flow case |
| `test-landing-page-live-parity.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-lock-and-advanced-position.cjs` | PASS | source behavior with mocked I/O |
| `test-landing-page-media-modal.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-next-chunk-reload.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-overview-stats.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-phase2-engine.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-phase3-catalog.cjs` | FAIL | PRODUCT_FAILURE: FAIL SIMILARITY_GATES — fail=2 warn=17 \| top:website-build-build-steps↔consulting-b2b-engagement-process=88.2%; website-build-nav-services↔agency-portfolio-split=88.2%; FAIL CAT_saas_CONVERSION_GOAL — bad=saas-trial-enterprise,saas-trial-process; FAIL CAT_agency_CONVERSION_GOAL — bad=agency-portfolio-modern-saas |
| `test-landing-page-premium.cjs` | FAIL | MATCHER_OUTDATED: FAIL TEMPLATE_PREMIUM_UI dense spacing + strong hero/CTA + mobile visual; FAIL NO_FAKE_DATA testimonials/speakers hidden on public; AI skip invent; FAIL MOBILE_RESPONSIVE viewport + grids + touch CTA |
| `test-landing-page-preview-mode.cjs` | FAIL | MATCHER_OUTDATED: FAIL PREVIEW_HIDE_ALL_EDITOR_UI — Preview ON: body flag + AppShell hides header/sidebar; builder chrome gated off; FAIL RESTORE_BUILDER — OFF clears body flag, remounts builder chrome; undo/redo/save/publish/autosave unchanged |
| `test-landing-page-preview-toggle.cjs` | FAIL | MATCHER_OUTDATED: FAIL BUILDER_PREVIEW_BEHAVIOR — OFF shows builder chrome; ON shows preview surface; ESC exits preview |
| `test-landing-page-pro.cjs` | FAIL | MATCHER_OUTDATED: FAIL AI_GENERATE AI generate form + preview before Apply via pushHistory; FAIL AI_SELECTED_BLOCK rewrite selected block by type via ai-suggest-field; FAIL AI_UNDO AI Apply goes through pushHistory / Undo; FAIL PREVIEW_PUBLISH Publish stays manual; AI stays draft; FAIL AI_MENU_COMPACT topbar AI menu 4 actions |
| `test-landing-page-public-free-position.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-public-lead.ts` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-public-meta-keep.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-publish-flush.cjs` | PASS | source behavior with mocked I/O |
| `test-landing-page-resize-after-rotate.cjs` | FAIL | MATCHER_OUTDATED: FAIL ROTATION_PROJECTION_PRESENT — inverse-rotation projection (by -s.rotate) applied to resize pointer delta |
| `test-landing-page-resize-rotate.cjs` | FAIL | MATCHER_OUTDATED: FAIL UNDO_KEEP_SELECT — move/resize/rotate commit via history; no auto-deselect |
| `test-landing-page-revision.ts` | PASS | source behavior with mocked I/O |
| `test-landing-page-saas-ready.cjs` | BLOCKED | BLOCKED: Thiếu workspace build cô lập; script tự build API và chạy các suite con. Không chạy trên workspace đang dùng. |
| `test-landing-page-section-background.cjs` | FAIL | MATCHER_OUTDATED: FAIL BACKGROUND_SELECT — empty click=section; Nền only via explicit button |
| `test-landing-page-section-content-overflow.cjs` | FAIL | MATCHER_OUTDATED: FAIL SHELL_USES_MIN_HEIGHT_NOT_HARD_HEIGHT — absolute free-section shell renders minHeight only — real content can grow it, never a hard height that clips background/border at a stale size; FAIL GROW_WATCHER_NEVER_SHRINKS — only commits when measured content NEEDS more room than committed (tolerance guards against 1-2px rounding); never fires to shrink; FAIL GROW_WATCHER_YIELDS_TO_LIVE_GESTURE — double-checks inside the rAF callback that no gesture started between scheduling and running — never fights an in-progress drag/resize/rotate |
| `test-landing-page-section-overlap.cjs` | FAIL | MATCHER_OUTDATED: FAIL RESIZE_4_CORNERS — 4 corner handles resize box proportionally; FAIL TEXT_WRAP — width on wrap; text reflow; no clip |
| `test-landing-page-section-preset-dnd.cjs` | FAIL | MATCHER_OUTDATED: FAIL PRESET_DND_REGRESSION — click-add kept; free-drag/resize/inspector/FB untouched |
| `test-landing-page-section-presets-fix.cjs` | FAIL | MATCHER_OUTDATED: FAIL GUARANTEE_PUBLIC_RENDER — Guarantee has body default + editable; public only hides empty body |
| `test-landing-page-section-settings.mts` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-sections-responsive.cjs` | FAIL | MATCHER_OUTDATED: FAIL ALL_SECTIONS_RESPONSIVE — Shared grids + public viewport + form full-width mobile |
| `test-landing-page-sidebar-compact.cjs` | FAIL | MATCHER_OUTDATED: FAIL SIDEBAR_COLLAPSED icon rail ~48–56px, white, compact grid; FAIL ADD_ELEMENT click adds after selected / append; FAIL CANVAS_UI_UNCHANGED canvas handlers/toolbar untouched |
| `test-landing-page-sidebar-dnd.cjs` | FAIL | MATCHER_OUTDATED: FAIL CLICK_PRESERVED — click-to-add callbacks remain |
| `test-landing-page-sidebar-height-upgrade.cjs` | FAIL | MATCHER_OUTDATED: FAIL NO_CANVAS_OVERLAP grid slot + fixed offset; canvas/inspector clear; FAIL EXISTING_LOGIC_PRESERVED add/layers/theme/dnd/autosave path untouched; LP-only |
| `test-landing-page-spa-templates.cjs` | FAIL | MATCHER_OUTDATED: FAIL CATALOG_VERSION_V7 — gallery-v21-production-visual-axis |
| `test-landing-page-space-input.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-template-differentiation.cjs` | FAIL | MATCHER_OUTDATED: FAIL AI_ARCHITECTURE_SELECTION seo=seo_audit_kpi clinic=clinic_trust_clinical webinar=webinar_register_path pricing=saas_product_led |
| `test-landing-page-template-engine.cjs` | FAIL | MATCHER_OUTDATED: FAIL PREVIEW_RESPONSIVE gallery + viewport preview |
| `test-landing-page-template-foundation.cjs` | FAIL | MATCHER_OUTDATED: FAIL CATALOG_VERSION_V7 — gallery-v21-production-visual-axis |
| `test-landing-page-template-gallery.cjs` | FAIL | MATCHER_OUTDATED: FAIL PREVIEW_OPEN_WORKS modal + API fetch definition; FAIL DESIGN_FAMILY_GOAL_FILTERS UI hides Style/Goal filters; API still returns summary meta; FAIL PREVIEW_USES_REAL_RENDERER modal uses LandingPageRenderer only |
| `test-landing-page-template-pack.ts` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-template-ui.cjs` | FAIL | MATCHER_OUTDATED: FAIL DESKTOP viewport desktop width; FAIL TABLET viewport tablet; FAIL MOBILE viewport mobile + responsive grids; FAIL NO_FAKE_DATA fakeNames=false placeholders=false publicHidden=2 |
| `test-landing-page-tenant-isolation.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-text-box-select-resize.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-text-box.mjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-text-toolbar.cjs` | FAIL | MATCHER_OUTDATED: FAIL TEXT_TOOLBAR_HORIZONTAL portal + fixed horizontal toolbar (wraps instead of overflowing on narrow screens); FAIL NO_DUPLICATE_TOOLBAR single TextEditToolbar host; section toolbar hidden for text; FAIL LANDING_PAGE_CORE_UNCHANGED inspector/sidebar/section toolbars intact |
| `test-landing-page-theme-switcher.cjs` | FAIL | MATCHER_OUTDATED: FAIL AI_THEME_SELECTION spa=rose lux=luxury_gold applied=rose |
| `test-landing-page-title-presets.cjs` | FAIL | MATCHER_OUTDATED: FAIL INSERT_REUSES_ENGINE — click preset → Benefits title-only + inlineTextStyles + history |
| `test-landing-page-toolbar-float.cjs` | FAIL | MATCHER_OUTDATED: FAIL LANDING_PAGE_CORE_UNCHANGED — canvas/autosave/undo/AI intact; no grid slot for toolbar |
| `test-landing-page-toolbar-no-scroll.cjs` | FAIL | MATCHER_OUTDATED: FAIL LANDING_PAGE_CORE_UNCHANGED — canvas/autosave/undo/AI intact |
| `test-landing-page-toolbar-sidebar-edge-sync.cjs` | FAIL | MATCHER_OUTDATED: FAIL SIDEBAR_EDGE_SYNC — toolbarLeft = websiteSidebarRight + savedGapX; observe live edge + width event |
| `test-landing-page-undo-page-isolation.cjs` | PASS | source behavior with mocked I/O |
| `test-landing-page-url-doctor.cjs` | PASS | legacy checks / standalone fixture; not app browser E2E |
| `test-landing-page-version-restore-revision.cjs` | PASS | source behavior with mocked I/O |
