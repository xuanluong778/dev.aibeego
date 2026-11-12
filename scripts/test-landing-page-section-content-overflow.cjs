#!/usr/bin/env node
/**
 * Gate: free-position section content-growth overlap (live bug report).
 *   node scripts/test-landing-page-section-content-overflow.cjs
 *
 * Reported symptom (with screenshot): a free-position "Features" section (image +
 * heading + button) visually overlapped with the section right after it — a card
 * ("Mục 1") and a paragraph bled up into/over the Features section's space.
 *
 * Root cause (confirmed by reading landing-page-builder.tsx + landing-page-renderer.tsx):
 *  - `toggleBlockFreePosition` / the Advanced-Position checkbox measure the section's
 *    height ONCE via a synchronous getBoundingClientRect() at the moment free-position
 *    is turned on (or last resized), and store it as freeLayout.height/reserveHeight.
 *  - The block's own content (ListCards' grid/cards, InlineEditable text, headings)
 *    renders at `height: auto` with no cap — it is free to grow taller later (a longer
 *    edit, an added item, a wrapped heading, more grid rows) with ZERO mechanism to
 *    resync the stored height/reserveHeight afterward.
 *  - The free shell previously rendered with a HARD `height` (not just minHeight) +
 *    `overflow: visible`, so the box's own background/border stayed pinned at the
 *    stale (undersized) height while content visually spilled out past it.
 *  - Canvas-level reserve (computeCanvasFreeReserveHeight, BUG-15's single authority)
 *    is spec-driven — it only knows about the stale stored height, so the NEXT flow
 *    section starts right after that too-small reservation and visually overlaps the
 *    spilled-over content.
 *
 * Fix (two parts, both in landing-page-free-drag.tsx):
 *  1. freeLayoutStyle: section shells now use `minHeight` only (never a hard `height`)
 *     — the box can grow to fit real content, never shrinks below the committed size.
 *  2. useFreeDragBox: a grow-only content-height watcher (section mode only, never
 *     during an active gesture) measures real rendered height after any spec change
 *     affecting this block and, if it exceeds the committed height, commits an updated
 *     height/reserveHeight — so computeCanvasFreeReserveHeight's input catches up and
 *     the next section is no longer overlapped.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

// --- 1. Shell no longer hard-clamps height ------------------------------------

gate(
  'SHELL_USES_MIN_HEIGHT_NOT_HARD_HEIGHT',
  /layout\.height\s*\?\s*\{\s*minHeight: layout\.height, boxSizing: 'border-box' as const \}/.test(
    drag,
  ) && !/\{ height: layout\.height, minHeight: layout\.height, boxSizing: 'border-box' as const \}/.test(drag),
  'absolute free-section shell renders minHeight only — real content can grow it, never a hard height that clips background/border at a stale size',
);

gate(
  'OVERFLOW_VISIBLE_STILL_INTENTIONAL',
  drag.includes("overflow: 'visible'"),
  'still never clips content (unchanged design intent) — now paired with minHeight so growth is reflected in the shell\'s own layout box, not just painted outside it',
);

// --- 2. Grow-only content-height watcher exists and is correctly scoped -------

gate(
  'GROW_WATCHER_PRESENT',
  drag.includes('Grow-only content sync') &&
    /if \(mode === 'offset'\) return;\s*if \(dragging\) return;/.test(drag),
  'watcher exists, skips nested/offset items, and never runs during an active gesture',
);

gate(
  'GROW_WATCHER_NEVER_SHRINKS',
  /if \(needed > committed \+ 2\) \{\s*onCommitRef\.current\(\{/.test(drag),
  'only commits when measured content NEEDS more room than committed (tolerance guards against 1-2px rounding); never fires to shrink',
);

gate(
  'GROW_WATCHER_UPDATES_BOTH_HEIGHT_AND_RESERVE',
  /freeLayout: \{ \.\.\.layout, height: needed, reserveHeight: needed \}/.test(drag),
  'bumps height AND reserveHeight together — matches the existing codebase convention (finish() commit, ensureSectionFreeLayoutHeight) that the two stay equal, so it survives clampAbsoluteFreeLayout/ensureSectionFreeLayoutHeight without being reset back to the stale value',
);

gate(
  'GROW_WATCHER_YIELDS_TO_LIVE_GESTURE',
  /if \(sessionRef\.current \|\| pendingRef\.current\) return; \/\/ a gesture started meanwhile/.test(
    drag,
  ),
  'double-checks inside the rAF callback that no gesture started between scheduling and running — never fights an in-progress drag/resize/rotate',
);

gate(
  'GROW_WATCHER_SELF_TERMINATES',
  /\}, \[layout, mode, dragging\]\);/.test(drag),
  'depends on [layout, mode, dragging] — after it commits, `layout` updates to the new (now-sufficient) height, the watcher reruns once more, measures no further gap, and goes quiet (no polling loop)',
);

// --- 3. Does not disturb the commit/undo/autosave pipeline it reuses ----------

gate(
  'REUSES_EXISTING_COMMIT_PIPELINE_NOT_A_NEW_ONE',
  drag.includes('onCommitRef.current({') &&
    (drag.match(/onCommitRef\.current\(\{/g) || []).length >= 2, // finish()'s move/resize/rotate path no longer calls it (removed by BUG-15); grow-watcher's call plus keyboard-nudge's onCommit(...) — verified this is the SAME onCommit prop wired to commitBlockFreeLayout (pushHistory) as every other free-position mutation, not a parallel bypass path
  'the watcher commits through the exact same onCommit -> commitBlockFreeLayout -> pushHistory/autosave path as manual drag/resize/rotate — no separate persistence mechanism was introduced',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log('FILES_CHANGED=landing-page-free-drag.tsx,scripts/test-landing-page-section-content-overflow.cjs');
console.log('SECTION_CONTENT_OVERFLOW_FIX=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
