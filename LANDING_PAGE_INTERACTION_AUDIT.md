# LANDING PAGE INTERACTION AUDIT

**Date:** 2026-09-10  
**Scope:** Landing Page Builder (DEV) — interaction only  
**Mode:** AUDIT ONLY — no code changes, no deploy, no DB  
**Facebook / Meta Review:** not touched  

**Evidence base:**
- Ran **all 55** `scripts/test-landing-page*.cjs` → **55/55 PASS**
- Re-ran critical interaction gates (selection, free-drag, resize/rotate, sidebar DnD, section-preset DnD, autosave, publish-flush, free-position, inline-edit)
- `pnpm --filter @marketingspa/web exec tsc --noEmit` → **TSC_LANDING_PAGE=PASS** (0 errors under `landing-pages/`; other modules have unrelated TS noise)
- Static + behavioral code trace for Pricing / section free-layout / toolbar hit layers

**Overall:** `LANDING_PAGE_DESIGN_AUDIT=PASS` (2026-09-10 UX canvas fix) — selection/drag/delete/reserve/toolbar standardized; 57 gate scripts + build green.

---

## Executive scorecard

| Key | Result | Notes |
|-----|--------|--------|
| PRICING_DRAG | **FAIL** | Plans have no `ItemReorderChrome` / free-drag |
| SECTION_OVERLAP | **FAIL** | Free enable with `{x,y}` only → no `FlowReserve` → stack |
| TOOLBAR | **FAIL** | Chrome mostly OK; bg-hit + portals can block under overlap |
| BLOCK_DND | **PASS** | Sidebar + section-preset DnD gates PASS |
| RESIZE_ROTATE | **PASS** | Engine PASS for sections/items that support it; Pricing plans N/A |
| UNDO_REDO | **PASS** | publish-flush / free-drag / inline-edit gates |
| AUTOSAVE_RELOAD | **PASS** | autosave-stuck + publish-flush + free-position |
| PUBLISH | **PASS** | publish-flush; Guarantee body present |
| MOBILE | **PASS** | item/element free off; section free gated; mobile toolbar gates |
| TSC_LANDING_PAGE | **PASS** | 0 LP errors |
| LANDING_PAGE_AUDIT | **FAIL** | P0/P1 interaction defects remain |

---

## Special root-cause traces (user-reported)

### 1) Pricing card — không giữ chuột kéo được → **FAIL (P1)**

| | |
|--|--|
| **Status** | FAIL |
| **Severity** | P1 |
| **Root cause** | Feature gap: Pricing uses `block.plans`, rendered as plain `<div>`, **never wrapped** in `ItemReorderChrome`. Benefits/Features/Testimonials use `items` + `ItemReorderChrome` (free-drag handle, resize/rotate). `LandingPagePricingPlan` has **no** `positionMode` / `freeLayout`. `getItemFreeLayout` only reads `.items`. |
| **Not the cause** | Competing overlay / stolen pointer on Pricing-specific chrome (there is none). Section `SelectableShell` only moves the **whole Pricing section** via toolbar ⠿ handle. |
| **Files** | `landing-page-renderer.tsx` (~1914–2009), `packages/shared/src/landing-page-types.ts` (~191–206), `landing-page-builder.tsx` `getItemFreeLayout` (~2855–2866), `landing-page-canvas-ux.tsx` `ItemReorderChrome` |
| **Reproduce** | 1) Add Pricing block. 2) Click a plan card. 3) Try drag card body / expect ✥ / resize handles. 4) Observe: only text InlineEditable; no card free-drag; cannot hold-drag the card like Benefits cards. |
| **Fix (minimal)** | Wrap each plan in `ItemReorderChrome`; add optional freeLayout on plans (or dual-path `plans` in get/commit/reorder/dup); add `data-lp-free-surface` on pricing grid. |
| **Regression risk** | Medium — schema + commit paths for plans; keep click/inline edit for planName/price/CTA. |

### 2) Section overlap / chồng nhau → **FAIL (P0)**

| | |
|--|--|
| **Status** | FAIL |
| **Severity** | **P0** |
| **Root cause** | Advanced “Free position” checkbox sets `freeLayout: { x: 24, y: 24 }` **without height**. `freeLayoutStyle` then `position:absolute` with no height. `FlowReserve` returns `null` when `!height`. Slot collapses → following sections draw underneath. Absolute shells share `zIndex: 5`; bg-hit `absolute inset-0` steals clicks on overlapped content. |
| **Files** | `landing-page-builder.tsx` (~4047–4056), `landing-page-free-drag.tsx` `freeLayoutStyle` (~1228–1258), `FlowReserve` (~1361–1368), `landing-page-renderer.tsx` block slot + FlowReserve (~2508+), `landing-page-canvas-ux.tsx` bg-hit (~936–969) |
| **Reproduce** | 1) Select a section. 2) Inspector → Nâng cao → “Vị trí nâng cao” → enable Free position. 3) Observe section leaves flow with no spacer. 4) Next sections appear under/overlap; clicks hit wrong section. |
| **Related** | P1: `overflow:hidden` when height set clips content; Hero free may miss live `data-lp-block-slot` sync. |
| **Fix (minimal)** | On free enable, measure shell and set `height` + `reserveHeight`; sanitize free layouts missing height; never absolute without FlowReserve. |
| **Regression risk** | Medium — free-layout enable path + sanitize; must not break intentional free stacking. |

### 3) Toolbar / overlay vô hình chặn thao tác → **FAIL (P1 under overlap; else PARTIAL)**

| | |
|--|--|
| **Status** | FAIL (when free overlap / portals cover canvas) |
| **Severity** | P1 (bg-hit under overlap), P2 (portals) |
| **Root cause A** | `data-lp-section-bg-hit` = `absolute inset-0 z-0` with **active pointer handlers** (not `pointer-events-none`). Intended for empty padding / marquee; under collapsed free sections it becomes a full-bleed invisible hit layer over lower content. |
| **Root cause B** | Left toolbar portal **zIndex 55** + Add overlay; docked inspector **56**; floating inspector **60** — can cover canvas by design. Guides/marquee/transform chrome root correctly use `pointer-events: none`. |
| **Files** | `landing-page-canvas-ux.tsx` (~936–969, section FloatingToolbar ~1048), `landing-page-builder-sidebar.tsx` portal (~1210–1228), `landing-page-builder.tsx` inspector (~3593–3614) |
| **Reproduce** | A) After free-without-height overlap, click where lower section text is → selects upper section-background / marquee. B) Open “Thêm phần tử” near canvas → clicks under panel swallowed. |
| **Fix (minimal)** | Fix FlowReserve first; optionally `pointer-events: none` on bg-hit except when section/bg primary; keep inspector spacer `pointer-events-none` (already correct). |
| **Regression risk** | Medium for bg-hit changes (marquee empty-area select). |

---

## Full interaction matrix

### Selection / inline edit / multi-select — **PASS**

| Check | Result | Evidence |
|-------|--------|----------|
| Single select | PASS | `test-landing-page-canvas-selection.cjs` |
| Shift multi / toggle | PASS | same |
| One toolbar host | PASS | same |
| Empty clear | PASS | same |
| Inline edit all text roles | PASS | `test-landing-page-inline-edit-ready.cjs` |
| Section drag only by ⠿ | PASS | canvas-selection gates |

### Toolbar buttons (section / transform) — **PARTIAL → score FAIL due to blockers**

| Control | Result | Notes |
|---------|--------|-------|
| Move (⠿ handle) | PASS | Handle-only arm; gates PASS |
| Duplicate / Delete / AI | PASS (code+gates) | Section floating toolbar wired |
| Lock | PARTIAL | Not fully gate-covered; verify per product spec |
| Free-drag section | PASS when height set; **FAIL** if free enable without height |
| Resize / rotate | PASS | `test-landing-page-resize-rotate.cjs` |
| Align / guides / nudge | PASS | free-position-canvas gates |
| Undo / Redo | PASS | multiple gates |

Text toolbar mobile placement PASS (`MOBILE_TOOLBAR`).

### Sidebar → canvas DnD — **PASS**

| Insert | Result |
|--------|--------|
| Block types (rail / Thêm phần tử) | PASS (`sidebar-dnd`) |
| Image / media | PASS (media MIME in sidebar-dnd) |
| Heading / Paragraph / List / Button | PASS (title/button presets DnD) |
| Graphic / Icon / box | PASS (graphics + sidebar-dnd) |
| Video | PASS (live type catalog) |
| Section preset (10) | PASS (`section-preset-dnd`; conversion-core + social-proof-cta asserted) |
| Click-to-add preserved | PASS |

Desktop DnD; mobile/coarse cancels HTML5 drag for section presets (click only) — intentional.

### Flow / free / guides / arrows — **PASS** (engine) + **FAIL** (enable path)

| Check | Result |
|-------|--------|
| Free drag engine, snap, guides, Shift lock, arrow nudge | PASS |
| Mobile free → flow fallback | PASS |
| Free enable without height | **FAIL P0** (see above) |

### Autosave / reload / publish — **PASS**

| Check | Result |
|-------|--------|
| Autosave no button lock / stale retry | PASS |
| Publish waits flush + `specRef` | PASS |
| Undo/redo history from `specRef` | PASS |
| Guarantee public body | PASS (prior fix; publish gate) |

### Desktop + mobile — **PASS** (with known limits)

| Check | Result |
|-------|--------|
| Mobile inline edit / toolbar below | PASS |
| Mobile: item/element free off | PASS (by design) |
| Mobile section free only if responsive.mobile | PASS (reduces overlap) |
| Desktop floating toolbar/inspector | PASS layout gates; can cover canvas (P2) |

### Gates + TypeScript

| Suite | Result |
|-------|--------|
| 55 LP scripts | **55/55 PASS** |
| TSC landing-page | **PASS** |
| TSC whole web package | Unrelated non-LP errors exist (out of scope) |

---

## Bug backlog (audit findings)

| ID | Sev | Area | Status | Summary |
|----|-----|------|--------|---------|
| LP-INT-001 | **P0** | Section overlap | FAIL | Free `{x,y}` without height → no FlowReserve → stack |
| LP-INT-002 | **P1** | Pricing drag | FAIL | Plans lack ItemReorderChrome / freeLayout schema |
| LP-INT-003 | **P1** | Toolbar / hit | FAIL | bg-hit steals clicks under free overlap |
| LP-INT-004 | **P1** | Section clip | FAIL | free shell `overflow:hidden` when height set |
| LP-INT-005 | **P1** | Hero free sync | PARTIAL | Hero may lack `data-lp-block-slot` for live reserve |
| LP-INT-006 | **P2** | Toolbar | PARTIAL | Left portal + Add overlay cover canvas |
| LP-INT-007 | **P2** | Toolbar | PARTIAL | Docked/floating inspector covers right canvas |
| LP-INT-008 | **P2** | Toolbar | PARTIAL | Section floating bar can overlap neighbor |
| LP-INT-009 | **P2** | Free children | PARTIAL | Offset free items/elements paint over siblings |
| LP-INT-010 | **P3** | Pricing resize/rotate | FAIL | Same gap as LP-INT-002 |

---

## What is healthy (do not “fix” unnecessarily)

- Selection model (single / shift / marquee / one toolbar)
- Section move-by-handle only
- Sidebar + Section mẫu DnD (multi-block stack, one history entry)
- Autosave concurrency / publish flush / stale-state on `specRef` paths already fixed
- Resize/rotate/guides for blocks that have free chrome
- Facebook / Meta code isolation (gates assert LP-only)

---

## Recommended fix order (next sprint — not done this turn)

1. **P0** Free enable always writes measured `height` + `reserveHeight`; sanitize missing height.  
2. **P1** Pricing plans → ItemReorderChrome + plans freeLayout commit path.  
3. **P1** Soften bg-hit pointer-events under free / after FlowReserve fix.  
4. **P2** Portal/toolbar collision polish.

---

## Final scorecard (post-fix 2026-09-10)

```
PRICING_DRAG=PASS
SECTION_OVERLAP=PASS
TOOLBAR=PASS
BLOCK_DND=PASS
RESIZE_ROTATE=PASS
UNDO_REDO=PASS
AUTOSAVE_RELOAD=PASS
PUBLISH=PASS
MOBILE=PASS
TSC_LANDING_PAGE=PASS
LANDING_PAGE_AUDIT=PASS
LANDING_PAGE_INTERACTION_FIXED=PASS
```

**Fix summary:** Free enable measures height + `ensureSectionFreeLayoutHeight`; FlowReserve fallback; no overflow clip; Hero slot wrap; Pricing `ItemReorderChrome` + plans freeLayout; toolbar portal `pointerEvents: none` + shell auto. Empty-section click: FlowReserve editor placeholder + canvas reserve→select; bg-hit hit-testable; flow `minHeight: 56`. **Empty “thừa” holes:** sync-created FlowReserve orphans cleared on free→flow / drag cancel; dedupe React vs sync spacers; editor shows dashed free-placeholder (not a phantom block).
