# Landing Page Builder — Drag / Resize Engine Fix Report

**Date:** 2026-09-13  
**Scope:** Fix overlapping sections, broken text-box corner resize, and jittery drag/resize (root cause in interaction/layout engine — not CSS patches).

---

## Root causes

1. **Mixed coordinate spaces under zoom**  
   `getBoundingClientRect()` returns **screen px**, while `left/top/width/height` are **CSS layout px**. Pointer deltas were divided by scale, but origin/size from `readRect` / surface width were not → jump and wrong resize under device frame scale (tablet/mobile) and any CSS zoom.

2. **React fighting live DOM mid-gesture**  
   `setDragging(true)` re-rendered and `freeLayoutStyle` re-applied committed `left/top/transform`, overwriting live pointer writes → visible jump/jitter.

3. **Text box corners only changed width**  
   `HeadingBoxResizeChrome` used a diagonal “scale” that updated **width only** (`height: auto`), and wrap used `inline-block` + `max-width: 100%` → corners did not grow freely; wrap was layout-locked.

4. **Section overlap**  
   Free sections used `minHeight` + `overflow: visible` without pushing siblings. When one section grew, absolutely positioned sections below kept old `y` → paint overlap. Grow catch-up also created a **second** history entry.

---

## Files changed

| File | Change |
|------|--------|
| `packages/shared/src/landing-page-free-position.ts` | `reflowFreeSectionsAfterChange()` — push siblings, resolve residual overlaps |
| `apps/web/.../landing-page-free-drag.tsx` | Unified CSS-space coords (÷ scale); snapshot+rAF resize; `freeLayoutStyle` omits geometry while dragging; hard section height; content height on commit |
| `apps/web/.../landing-page-canvas-ux.tsx` | Text box 8-handle resize via `applyResizeHandle`; free W×H; `onTextBoxResizeCommit` |
| `apps/web/.../landing-page-builder.tsx` | Section reflow on free-layout commit; `commitTextBoxResize` (1 history entry) |
| `scripts/test-landing-page-drag-resize-engine.cjs` | New engine gates |
| `scripts/test-landing-page-free-drag-move-size.cjs` | Updated for `sess.*` naming |

---

## How resize works now

1. **`pointerdown`** → `setPointerCapture` → snapshot `{ originX, originY, width, height, startClient, canvasScale }` (CSS space).
2. **`pointermove`** → store pending client coords only; **one** `requestAnimationFrame` per frame.
3. Frame: `dx/dy = (client - start) / scale` → inverse-rotate if needed → **`applyResizeHandle(snapshot + delta)`** — never re-read DOM size.
4. Live DOM writes `left/top/width/height` (or translate in offset mode). React style omits geometry while `dragging`.
5. **`pointerup`** → single `onCommit` → one undo entry.

**8 handles:** N/S/E/W/NE/NW/SE/SW — corners change **both** width and height; opposite edge stays anchored (`applyResizeHandle`).

**Text boxes:** same math; commit width + height + free offset via `commitTextBoxResize` (no `fit-content` / `max-width` lock during resize; text wraps with `overflow-wrap: anywhere`).

---

## Section auto-height / reflow

1. Free sections commit **hard `height`** (= painted box / content `scrollHeight` at drop).
2. `reflowFreeSectionsAfterChange`:
   - siblings with `y ≥ previousBottom` shift by `Δy + Δheight`
   - remaining overlaps packed top→bottom
3. Text-box resize that exceeds parent section height grows the parent and reflows siblings — **same history entry**.
4. Canvas `minHeight` during gesture uses screen bottoms **÷ scale**; after commit uses `computeCanvasFreeReserveHeight` (spec).

---

## QA results

| Check | Result |
|-------|--------|
| `node scripts/test-landing-page-drag-resize-engine.cjs` | **PASS** (8/8) |
| `node scripts/test-landing-page-free-drag-move-size.cjs` | **PASS** |
| Unit: SE/NW `applyResizeHandle` | **OK** |
| Unit: reflow pushes section B after A grows | **OK** (`y: 200 → 300`) |
| `pnpm --filter @marketingspa/shared build` | **PASS** |
| `pnpm --filter @marketingspa/web build` + PM2 reload | **PASS** |

### Manual checklist (recommended)

- Zoom / device: desktop + tablet + mobile (device frame scale) — drag + resize track pointer, no jump
- Text box: all 8 handles; corners change W+H; text wraps inside box
- Two free sections: grow top section → bottom section moves down, no overlap
- Undo/redo: one step per gesture; save/reload preserves free layout + text box size

---

## Deploy

Web rebuilt and `dev-mkspa-web` restarted. Hard-refresh builder (`Ctrl+Shift+R`) before testing.
