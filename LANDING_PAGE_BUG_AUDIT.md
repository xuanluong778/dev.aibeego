# Landing Page Module — Bug Audit Report

**Environment:** `dev.marketingautoaz.com` (local build: `dev-mkspa-web` @ `:3020`)  
**Audit date:** 2026-09-09  
**Method:** Read-only — source code review, TypeScript check (`tsc --noEmit`), 52 gate scripts, HTTP smoke (`curl` 200 on `/landing-pages`). **No code changes, no deploy, no DB access.**  
**Scope:** Builder/Canvas, Sidebar, Inspector, Selection, Toolbars, Drag/Resize, Elements, Custom CSS, Scroll/Z-index, Undo/Redo, Autosave, Preview/Publish, Responsive, AI, Templates, Build/TS errors.

---

## Executive Summary

Landing Page core canvas flows (single select, single text toolbar host, autosave mutex, free-drag listener cleanup) are **mostly stable** after recent selection refactor — **36/52 gate scripts PASS**, including all selection/toolbar/autosave/drag gates.

However, **critical data-path bugs** remain around **Publish + stale React state**, plus **inspector field resolution for nested text**, **shift multi-select section chrome**, and **mobile text toolbar placement**. **16 gate scripts FAIL**, many reflecting real layout/mobile regressions; some are stale string-matching gates (noted separately).

**Verdict:** `LANDING_PAGE_CURRENT_STATUS = UNSTABLE`

---

## Bug Register

| BUG_ID | Severity | Khu vực | Mô tả lỗi | Cách tái hiện | Root cause | File liên quan | Mức ảnh hưởng | Đề xuất cách sửa | Test cần chạy |
|--------|----------|---------|-----------|--------------|------------|----------------|----------------|------------------|---------------|
| LP-PUB-001 | **P0** | Autosave / Publish | Publish có thể chạy khi autosave đang in-flight; `persist()` return sớm, không đợi queue drain | 1) Sửa text nhanh 2) Bấm Publish ngay khi thấy autosave đang chạy 3) Reload trang published → thiếu edit mới nhất | Mutex early-return khi `autosaveInflightRef.current === true`; `publish()` không await completion | `landing-page-builder.tsx` L654–658, L2849–2856 | **Publish sai nội dung / mất edit** | `persist()` trả về Promise resolve khi queue xong; `publish()` block đến khi `dirtyRef === false` | E2E: edit → publish during autosave → compare published spec |
| LP-PUB-002 | **P0** | Publish | `publish()` gọi `persist(spec, …)` với `spec` từ React closure, không phải `specRef.current` | Sửa nhanh rồi publish trước re-render | Stale closure; payload có thể cũ hơn canvas thực tế | `landing-page-builder.tsx` L2849–2850 (`persist(spec,…)`) vs L666 (`nextSpec ?? specRef.current`) | Publish lưu/publish bản cũ | Luôn `persist(specRef.current, …)` | Unit: mutate ref → publish → server nhận latest |
| LP-SEL-001 | **P1** | Selection / Inspector | Chọn mô tả card (`itemDesc`) nhưng Inspector Design/Typography target `itemTitle` | Gallery/Benefits → click mô tả card → mở Design tab typography | `inspectorTextFieldKey()` map mọi `item:*` → `itemTitle:{id}`; bỏ qua `primaryTarget.field` | `landing-page-inspector-design-tab.tsx` L1127; `landing-page-builder.tsx` L1848+ (dùng `inspectorTextFieldKey(selectedElement)`) | Style/color/align áp vào **sai field** | Dùng `primaryTarget.field` khi có; mở rộng `inspectorTextFieldKey` nhận `field?` | Select itemDesc → patch color → chỉ desc đổi |
| LP-MS-001 | **P1** | Shift multi-select | Shift+click section thứ 2 → vào `selectedElementIds` nhưng **không có outline/toolbar** | Shift+click section A, rồi section B | `SelectableShell.selected` chỉ dùng `isSectionPrimary()` (primary-only), không check `isSelected()` | `landing-page-builder.tsx` L2613–2618; `landing-page-renderer.tsx` L2481–2484 | Multi-select section trông như không hoạt động | `selected={handlers.isSelected({blockId, element:'section'})}` + visual primary vs secondary | Extend `test-landing-page-canvas-selection.cjs` |
| LP-THEME-001 | **P1** | Theme / Autosave | Đổi theme preset có thể **ghi đè edits** chưa re-render | Gõ headline → ngay lập tức click theme preset | `LandingPageThemeSwitcher.applyPreset` spread `...spec` từ props stale | `landing-page-theme-switcher.tsx` L59–75, L88–97 | **Mất nội dung** khi đổi theme | Parent merge vào `specRef.current`; hoặc switcher nhận `getSpec()` | Edit + theme switch same tick → content preserved |
| LP-AI-001 | **P1** | AI Tools | AI block patch dùng `...spec` stale tương tự theme | AI menu apply field patch ngay sau edit | Stale closure trong `onApplyBlockFields` | `landing-page-builder.tsx` L3089–3097 | AI ghi đè edits gần đây | Dùng `specRef.current` làm base | AI patch after rapid edit |
| LP-HIST-001 | **P1** | Undo/Redo | `pushHistory` snapshot `cloneSpec(spec)` từ closure, không phải `specRef.current` | Hai thao tác sync trong 1 event (insert preset + style) → undo skip state | Stale snapshot trong history stack | `landing-page-builder.tsx` L382–390 | Undo stack sai thứ tự / skip bước | `cloneSpec(specRef.current)` trong `pushHistory` | Double sync pushHistory → undo twice |
| LP-CSS-001 | **P1** | Custom CSS / Undo | Mỗi keystroke Custom CSS = 1 `pushHistory` + 1 autosave dirty | Gõ 20 ký tự trong Custom CSS → Undo 20 lần | `onChange` gọi thẳng `onPatchStyle` → `updateBlock` → `pushHistory` | `landing-page-inspector-design-tab.tsx` L918–924; `landing-page-builder.tsx` L820–827 | Undo CSS vô dụng; autosave storm | Debounce hoặc live patch không history đến blur | Type sentence → 1 undo reverts all |
| LP-MEDIA-001 | **P1** | Image / Media | `applyMediaToSelection` spread `it.imageStyle` lên union items (FAQ/Testimonial) — TS error, runtime risk | Chọn FAQ item → chèn ảnh qua media modal | Union type không có `imageStyle`; patch không narrowed theo block type | `landing-page-builder.tsx` L1332–1352 (TS2339/TS2322) | Runtime error hoặc corrupt items trên FAQ | Narrow theo `block.type`; chỉ patch image fields trên Gallery/Product | Media insert on FAQ vs Gallery |
| LP-MOB-001 | **P1** | Quick Toolbar / Mobile | Text Quick Toolbar **không có** mobile placement below-anchor (section toolbar có) | Mobile viewport → select text → toolbar clip trên/dưới viewport | `TextEditToolbar` fixed above anchor only; thiếu `max-[767px]:bottom-0` như `FloatingToolbar` | `landing-page-canvas-ux.tsx` L957 (section) vs L1949 (text) | Toolbar text **khó/không dùng** trên mobile | Mirror mobile placement từ `FloatingToolbar` | `test-landing-page-inline-edit-ready.cjs` MOBILE_INLINE_EDIT |
| LP-TS-001 | **P1** | Build / TypeScript | 20+ TS errors trong landing-page files (build skip typecheck) | `npx tsc --noEmit` trong `apps/web` | Type drift, missing exports, union narrowing | `landing-page-builder.tsx`, `landing-page-canvas-ux.tsx`, `landing-page-theme-switcher.tsx`, etc. | Latent runtime bugs; CI risk nếu bật typecheck | Fix union types; export `LandingPageCanvasStyle`; clean dead branches | Enable tsc in CI |
| LP-UNDO-001 | **P2** | Undo / Selection | Undo/redo restore spec nhưng **không reset** `canvasSelection` | Delete block → Undo → selection trỏ block đã xóa | `undo`/`redo` chỉ `setSpec` | `landing-page-builder.tsx` L776–792 | Inspector/canvas context sai sau undo | Store selection in history hoặc re-resolve sau undo | Delete → undo → selection valid |
| LP-BP-001 | **P2** | AI / Business Profile | Apply Business Profile không qua `pushHistory` | Apply profile → Ctrl+Z | `setSpec` trực tiếp | `landing-page-builder.tsx` L2859–2877 | Không undo được profile apply | Wrap `pushHistory(sanitize…)` | Apply profile → undo |
| LP-REST-001 | **P2** | Versions / Autosave | Version restore qua `pushHistory` nhưng không seed `revisionRef` từ restored meta | Restore version → edit → autosave STALE loop | Missing revision seed như `load()` | `landing-page-builder.tsx` L4155–4163 vs L399–404 (load seeds revision) | Autosave fail / "Lưu bị lệch phiên bản" | Seed `revisionRef` from restored `meta.clientRevision` | Restore → edit → autosave OK |
| LP-MS-002 | **P2** | Shift multi-select | Multi-select stored nhưng delete/duplicate/align chỉ dùng primary | Shift-select 3 text fields → Delete | Actions không đọc `selectedElementIds` | `landing-page-builder.tsx` canvas handlers + context menu | Shift multi-select **cosmetic** | Bulk ops hoặc document primary-only | Multi-select delete behavior |
| LP-CSS-002 | **P2** | Custom CSS / Publish | Builder preview: inline styles; Publish: scoped `<style>` + `!important` — WYSIWYG gap | Custom CSS conflict với theme token → so sánh builder vs `/p/[slug]` | Dual rendering paths | `landing-page-canvas-ux.tsx` (inline); `landing-page-block-design-style.ts` L394+ (publish) | Published page khác builder | Inject same scoped CSS in builder interactive mode | Visual diff builder vs public |
| LP-MOB-002 | **P2** | Inline edit / Touch | Tap-to-edit on touch cần `!p.moved`; scroll micro-movement block edit | Mobile: tap text → không vào edit | Strict movement threshold | `landing-page-canvas-ux.tsx` L1419–1430 | Edit khó trên touch | Time-based tap vs scroll detection | Mobile tap-edit flow |
| LP-TOOL-001 | **P2** | Quick Toolbar / Z-index | AI quick popover `z-[90]` dưới text toolbar `z-[9995]` | Mở text toolbar → trigger AI prompt popover | Z-index stack mismatch | `landing-page-canvas-context-menu.tsx` L218 vs `landing-page-canvas-ux.tsx` L1949 | Popover bị che / click miss | Raise popover z-index hoặc dismiss toolbars | Toolbar + AI popover overlap test |
| LP-SEL-002 | **P2** | Selection | Click padding `<section>` trong content → select `section-background` thay vì `section` | Click vùng padding section (không phải bg-hit) | PointerUp handler map SECTION tag → background | `landing-page-canvas-ux.tsx` L586–591 | Toolbar/inspector chuyển sang BG mode ngoài ý muốn | Chỉ bg-hit layer → background; padding → section | Click padding → section selected |
| LP-INSP-001 | **P2** | Inspector / Selection | Mỗi lần đổi selection, inspector auto-scroll + focus input | Select element trên canvas | `useEffect` focus first input | `landing-page-builder.tsx` L622–648 | Focus nhảy khỏi canvas; keyboard shortcuts interrupted | Focus chỉ khi selection từ sidebar/inspector | Canvas select → activeElement unchanged |
| LP-RESP-001 | **P2** | Responsive / Free-drag | Mobile/tablet viewport: `getBlockFreeLayout` / `getElementFreeLayout` return `null` | Switch Mobile → free-positioned elements snap to flow | Explicit `viewport === 'mobile' return null` | `landing-page-builder.tsx` L2784, L2797–2798 | Free layout **không edit được** trên mobile | Document or implement responsive free layout | Mobile viewport free drag |
| LP-VID-001 | **P2** | Video | Video block không có canvas element selection / quick toolbar | Add Video block → click iframe area | No `ElementChrome` / `onSelect` on video container | `landing-page-renderer.tsx` L2197–2226 | Video chỉ edit qua Inspector, không canvas-first | Wrap video in selectable chrome | Video block canvas select |
| LP-THEME-002 | **P2** | Theme / Undo | Theme panel có undo stack riêng, tách khỏi builder Ctrl+Z | Theme change → Ctrl+Z (builder) không revert theme | Dual undo systems | `landing-page-theme-switcher.tsx` L38–98 | Confusing undo UX | Route theme via `pushHistory` only | Theme → Ctrl+Z |
| LP-DRAG-001 | **P2** | Free-drag | Legacy free coords `\|x\|>640` hoặc `\|y\|>640` silently dropped → elements "vanish" | Load old page with large free coords | Guard rejects layout | `landing-page-builder.tsx` L2792, L2804; `landing-page-free-drag.tsx` L1214+ | Cards/elements invisible on canvas | Migrate coords or show warning + reset UI | Load legacy free layout page |
| LP-LAY-001 | **P2** | Sidebar / Layout / Scroll | 16 gate scripts fail on fixed panels, sidebar overlap, inspector scroll | Desktop builder: sidebar rail overlaps canvas; inspector scroll | Layout refactor (floating sidebar, fixed inspector portal) | `landing-page-builder-sidebar.tsx` L733+, L1178+; gates: `builder-fixed-panels`, `sidebar-height-upgrade`, `canvas-full-scroll` | Canvas bị che; scrollbar thừa; mobile sidebar overlap | Reconcile layout with gate spec or update UX spec | Failed layout gate scripts |
| LP-AUT-001 | **P2** | Autosave | `undo`/`redo` bump `revisionRef` but don't set `dirtyRef` consistently with content-only undo expectations | Undo after autosave completed → unexpected re-save | Revision increment on undo always sets dirty | `landing-page-builder.tsx` L776–792 | Extra autosave after undo (may be intended) | Clarify undo/autosave contract | Undo → autosave behavior |
| LP-INSP-002 | **P2** | Inspector auto-focus | Auto-focus effect không cover `item:*` / nested fields — chỉ headline/subheadline/body/cta/image | Select itemDesc → inspector không scroll tới field | Hardcoded field list | `landing-page-builder.tsx` L628–637 | Inspector không sync với nested selection | Map `primaryTarget.field` → inspector field | Select itemDesc → inspector scroll |
| LP-GATE-001 | **P3** | QA / Gates | 16/52 gate scripts FAIL — mix of real regressions + stale string matchers | `node scripts/test-landing-page-*.cjs` | Gates not updated after refactors | `scripts/test-landing-page-*.cjs` | CI noise; hides real bugs | Triage: fix real issues, update stale gates | Full gate suite |
| LP-GATE-002 | **P3** | Template gallery | `CATEGORY_FILTER_WORKS` fails — gate expects literal `?category=` string | Run template gallery gate | Gate checks `page.tsx` for `?category=` but code uses `` `?${params}` `` | `scripts/test-landing-page-template-gallery.cjs` L112–115; `templates/page.tsx` L95–98 | False CI fail; filter **works** in app | Update gate string match | Manual: filter templates by category |
| LP-GATE-003 | **P3** | URL Doctor | Gate expects `'AI tối ưu trang'` in `builder.tsx` — string moved to `landing-page-ai-menu.tsx` | Run url-doctor gate | Stale gate location | `scripts/test-landing-page-url-doctor.cjs` L98; `landing-page-ai-menu.tsx` L327 | False CI fail; doctor **exists** | Update gate to check ai-menu or builder import | Manual: run page doctor |
| LP-GATE-004 | **P3** | Business Profile | Gate expects comment `'Never expose builder meta'` — code strips meta without that comment | Run business-profile gate | Stale gate string | `landing-pages.service.ts` L1547, L2035 (`meta: _meta`) | False CI fail; strip **likely works** | Update gate; verify public API response | API test: public slug has no builder meta |
| LP-CSS-003 | **P3** | Custom CSS | Custom Class cũng pushHistory mỗi keystroke (giống CSS) | Gõ class name liên tục → undo từng ký tự | Same as LP-CSS-001 | `landing-page-inspector-design-tab.tsx` L909–912 | Minor undo annoyance | Debounce on blur | Class name edit undo |

---

## Gate Script Results (52 total)

| Result | Count |
|--------|-------|
| PASS | 36 |
| FAIL | 16 |

### Failed scripts (evidence)

| Script | Failed gate(s) | Assessment |
|--------|----------------|------------|
| `test-landing-page-builder-fixed-panels.cjs` | INSPECTOR_FIXED, INSPECTOR_INNER_SCROLL, CANVAS_NO_OVERLAP | **Real layout regression** (LP-LAY-001) |
| `test-landing-page-builder-library.cjs` | NEW_BLOCK_SELECT | Possible stale gate / selection API change |
| `test-landing-page-business-profile.cjs` | public getBySlug strips meta | **Stale gate** (LP-GATE-004) — code strips meta |
| `test-landing-page-canvas-full-scroll.cjs` | INSPECTOR_SCROLL_UNCHANGED | **Real regression** (LP-LAY-001) |
| `test-landing-page-free-position-canvas.cjs` | BOUNDARY_SAFE | **Stale gate** — clamp moved to `landing-page-free-drag.tsx` |
| `test-landing-page-inline-edit-ready.cjs` | MOBILE_INLINE_EDIT | **Real bug** (LP-MOB-001, LP-MOB-002) |
| `test-landing-page-inspector-canvas-first.cjs` | DESIGN_GROUPS | Inspector accordion defaults drift |
| `test-landing-page-inspector-context-aware.cjs` | CONTEXT_AWARE, RIGHT_SIDEBAR_OPTIMIZED | Inspector UX drift |
| `test-landing-page-pro.cjs` | RIGHT_PANEL_SIMPLE | Advanced tab default changed |
| `test-landing-page-sidebar-compact.cjs` | SIDEBAR_COLLAPSED, NEW_ELEMENT_SELECTED, CANVAS_UI_UNCHANGED | Sidebar refactor drift |
| `test-landing-page-sidebar-height-upgrade.cjs` | 5 gates (TOOLTIP, NO_CANVAS_OVERLAP, …) | **Real overlap/tooltip gaps** (LP-LAY-001) |
| `test-landing-page-template-gallery.cjs` | CATEGORY_FILTER_WORKS | **Stale gate** (LP-GATE-002) |
| `test-landing-page-template-ui.cjs` | NO_FAKE_DATA | **Stale gate** — checks wrong file for `mode="public"` |
| `test-landing-page-theme-switcher.cjs` | THEME_SWITCH_INSTANT, THEME_AUTOSAVE | Theme in sidebar not builder.tsx |
| `test-landing-page-title-presets.cjs` | PARAGRAPH_PRESETS | Preset count/ wiring drift |
| `test-landing-page-url-doctor.cjs` | doctor UX+API | **Stale gate** (LP-GATE-003) |

### Passing critical paths

- `test-landing-page-canvas-selection.cjs` — single select, shift, one toolbar
- `test-landing-page-text-toolbar.cjs` — quick text toolbar
- `test-landing-page-autosave-stuck.cjs` — autosave mutex / stale revision handling
- `test-landing-page-free-drag-*`, `resize-rotate`, `element-free-drag`
- `test-landing-page-custom-css-per-element.cjs`
- `test-landing-page-inspector-modes.cjs` (13/13)
- `test-landing-page-doctor-gates.cjs`, `tenant-isolation`, `saas-ready`

---

## TypeScript Errors (sample — full list via `tsc --noEmit`)

| File | Error | Risk |
|------|-------|------|
| `landing-page-builder.tsx:1348` | `imageStyle` on FAQ/testimonial union | Runtime on media insert (LP-MEDIA-001) |
| `landing-page-builder.tsx:3962–3963` | `width`/`height` on `never` | Inspector edge case |
| `landing-page-canvas-ux.tsx` | Event type mismatches, possibly undefined regex groups | Latent runtime |
| `landing-page-theme-switcher.tsx:111` | Dead `id === 'custom'` branch | Logic smell |
| `landing-page-section-surface.ts:10` | Missing export `LandingPageCanvasStyle` | Import failure if enforced |
| `landing-page-builder-sidebar.tsx:83,98` | Block type union mismatch | Sidebar type safety |

Build currently **skips type validation** (`next build` → "Skipping validation of types").

---

## Areas Verified Stable (no bug filed)

| Area | Evidence |
|------|----------|
| Single text toolbar | `LandingPageCanvasTextToolbarHost` — gate PASS ONLY_ONE_TOOLBAR |
| Child click stopPropagation | Guards on `[data-lp-inline-field]`, `[data-lp-element-id]`, etc. |
| Autosave serial mutex + STALE retry | `persist()` mutex, revision stamping, queue follow-up |
| Free-drag listener cleanup | `removeEventListener` on pointerup/cancel/blur in `landing-page-free-drag.tsx` |
| Custom CSS sanitization (no eval) | `landing-page-block-design-style.ts` |
| Public page SSR | `/p/[slug]` → `PublicLandingPageClient` with `mode="public"` |
| Testimonial placeholder filtering | `filterPublishableTestimonials(block.items, mode)` in renderer |
| HTTP availability | `curl` 200 on `dev.marketingautoaz.com/landing-pages` |

---

## TOP 10 Critical Bugs

1. **LP-PUB-001** — Publish không đợi autosave in-flight (P0)
2. **LP-PUB-002** — Publish dùng stale `spec` closure (P0)
3. **LP-SEL-001** — itemDesc selection → inspector targets itemTitle (P1)
4. **LP-THEME-001** — Theme preset overwrite stale edits (P1)
5. **LP-AI-001** — AI patch stale spec closure (P1)
6. **LP-HIST-001** — pushHistory stale snapshot (P1)
7. **LP-CSS-001** — Custom CSS per-keystroke undo/autosave (P1)
8. **LP-MOB-001** — Mobile text toolbar clipping (P1)
9. **LP-MEDIA-001** — Media insert type unsafe on FAQ items (P1)
10. **LP-MS-001** — Shift multi-select section invisible (P1)

---

## Summary Counts

| Metric | Value |
|--------|-------|
| **TOTAL_BUGS** | **28** |
| **P0_COUNT** | **2** |
| **P1_COUNT** | **10** |
| **P2_COUNT** | **13** |
| **P3_COUNT** | **3** |
| Gate scripts PASS / FAIL | 36 / 16 |
| TypeScript errors (landing-page files) | 20+ |

---

## LANDING_PAGE_CURRENT_STATUS

### **UNSTABLE**

**Rationale:** Two P0 publish/data-integrity paths, ten P1 functional bugs (selection/inspector mismatch, stale state, mobile toolbar, TS/runtime risks), and sixteen failing regression gates (several confirm real layout/mobile regressions). Core canvas selection refactor is improved but insufficient for production confidence until publish/autosave and inspector field resolution are fixed.

---

*Audit performed read-only. No source files, database, or deployment were modified.*
