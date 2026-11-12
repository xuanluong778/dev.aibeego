#!/usr/bin/env node
/**
 * Gate: LeadForm-style "form nằm ngoài khung nội dung" + "Tự do vẫn không kéo được".
 *   node scripts/test-landing-page-free-toggle-content-rect-and-drag-handle.cjs
 *
 * Bug 1 (screenshot): a LeadForm section switched to free position rendered as a
 * narrow card pinned to the far-left edge of a much wider, mostly-empty canvas —
 * "outside the content frame". Root cause: the default LeadForm section is
 * `<section class="flex justify-center ..."><div class="max-w-lg">card</div></section>`
 * — the outer <section> always reports 100% canvas width via
 * getBoundingClientRect(), regardless of its narrower centered content. The
 * free-position toggle measured THAT outer box for x/width, so once the section
 * went position:absolute (shrink-to-fit, nothing left for flex to center within)
 * the visible card rendered pinned to the stale x=0 left edge of an invisible
 * full-width box. Fix: measure the union of the section's DIRECT CHILDREN
 * (measureVisibleContentRect) instead of the shell itself, and capture that as
 * both x/y AND width on first toggle.
 *
 * Bug 2: after toggling "Tự do", the section still couldn't be dragged by
 * clicking its body. Root cause: for a section whose entire visible content is a
 * `data-lp-form-hit` (or similarly fully "interactive") zone, every point inside
 * it is excluded from body-drag by isFreeDragBlockedTarget — by design, so
 * clicking a form field doesn't accidentally drag the whole section. But there
 * was no OTHER way to grab it: `armSectionPointer` already special-cases an
 * `onFreeHandle` (`[data-lp-free-drag-handle]`) to bypass that exclusion, yet no
 * section-level element ever carried that attribute — only per-ITEM chrome did.
 * Fix: render an always-available grip button (only while already in free mode)
 * carrying `data-lp-free-drag-handle`, wired to beginDrag(e, {force, immediate}).
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

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');

// --- Bug 1: content-rect measurement, not the full-bleed shell ---------------

gate(
  'MEASURES_CHILDREN_UNION_NOT_SHELL',
  builder.includes('function measureVisibleContentRect(') &&
    /for \(const child of Array\.from\(shell\.children\)\) \{/.test(builder),
  'a dedicated helper unions the section\'s direct children\'s boxes instead of trusting the (always-100%-wide) <section> shell itself',
);

gate(
  'TOGGLE_USES_CONTENT_RECT_FOR_XY',
  /const content = measureVisibleContentRect\(shell\);[\s\S]{0,200}if \(x == null \|\| y == null\) \{\s*x = Math\.max\(0, Math\.round\(content\.left - surfaceRect\.left\)\);\s*y = Math\.max\(0, Math\.round\(content\.top - surfaceRect\.top\)\);/.test(
    builder,
  ),
  'x/y are derived from the measured visible content box, not shell.getBoundingClientRect()',
);

gate(
  'TOGGLE_CAPTURES_WIDTH_ON_FIRST_TOGGLE',
  /if \(width == null && content\.width > 0\) \{\s*width = Math\.round\(content\.width\);\s*\}/.test(builder) &&
    builder.includes('width: number | undefined; height: number }'),
  'width is now explicitly captured from the visible content on first toggle (previously always omitted unless a prior freeLayout.width existed), preventing shrink-to-fit under position:absolute from collapsing a flex-centered card back to the left edge',
);

gate(
  'BOTH_CALL_SITES_USE_MEASURED_WIDTH',
  (builder.match(/const \{ x, y, width, height \} = measureFreeToggleLayout\(/g) || []).length === 2 &&
    (builder.match(/\.\.\.\(width \? \{ width \} : \{\}\)/g) || []).length === 2,
  'toggleBlockFreePosition and the "Vị trí nâng cao" checkbox handler both use the returned width',
);

// --- Bug 2: section-level always-available drag grip -------------------------

gate(
  'SECTION_DRAG_GRIP_RENDERED_WHEN_FREE',
  /\{layout \? \(\s*<button\s*type="button"\s*data-lp-free-drag-handle/.test(ux),
  'a section-level element now actually carries data-lp-free-drag-handle (previously only per-item chrome did — the section-level check in armSectionPointer/isFreeDragBlockedTarget existed but had no matching DOM element to find)',
);

gate(
  'GRIP_STARTS_DRAG_IMMEDIATELY_VIA_POINTERDOWN',
  /onPointerDown=\{\(e\) => \{\s*if \(sectionLocked\) return;\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*handlers\.onSelect\(\{ blockId, element: 'section' \}\);\s*freeDrag\.beginDrag\(e, \{ force: true, immediate: true \}\);/.test(
    ux,
  ),
  'grip is wired to a real pointerdown (not click) so setPointerCapture works, and bypasses the selected/blocked-target gate via force+immediate — same pattern already used by the onFreeHandle fast path in armSectionPointer',
);

gate(
  'EXISTING_TOGGLE_BUTTON_UNCHANGED',
  ux.includes("data-lp-free-toggle") &&
    ux.includes("handlers.onToggleFreePosition?.(blockId);"),
  'the original Tự do on/off toggle button is untouched — the grip is additive, not a replacement',
);

gate(
  'ARM_SECTION_POINTER_ALREADY_HONORS_THE_HANDLE',
  ux.includes("const onFreeHandle = Boolean(t?.closest?.('[data-lp-free-drag-handle]'));") &&
    ux.includes('freeDrag.beginDrag(e, { force: true, immediate: true });'),
  'confirms the consuming logic (armSectionPointer) already special-cased this attribute — this fix only had to supply the missing DOM element, not new drag-arming logic',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log(
  'FILES_CHANGED=landing-page-builder.tsx,landing-page-canvas-ux.tsx,scripts/test-landing-page-free-toggle-content-rect-and-drag-handle.cjs',
);
console.log('FREE_SECTION_OUTSIDE_FRAME_AND_UNDRAGGABLE_FIX=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
