#!/usr/bin/env node
/**
 * Gate: Landing Page Builder shell responsive audit/fix.
 *   node scripts/test-landing-page-builder-responsive.cjs
 *
 * Breakpoint model (Tailwind defaults, unchanged): Desktop >= 1024 (`lg`),
 * Tablet 768-1023 (`md` but below `lg`), Mobile < 768 (below `md`).
 *
 * Fixes covered here (each independently confirmed by reading the actual source,
 * not inferred from this gate):
 *  1. Inspector panel was 100% non-interactive + aria-hidden on tablet/mobile
 *     (<1024px) — the portal host it's mounted into on those widths always
 *     carried `pointer-events-none` (a class meant only for the DESKTOP DOCKED
 *     layout spacer role) and a static `aria-hidden`. Every field/button/slider
 *     inside the panel was unclickable.
 *  2. The left toolbar rail + its flyout overlay panels (Layers/Theme/Add
 *     elements/...) rendered at `top-16` (64px) on mobile — inside the fixed
 *     action bar's 56-111px span — and at a LOWER z-index (30/40) than the
 *     action bar (45), so they were hidden/unclickable behind it.
 *  3. The rich-text floating toolbar used `flex-nowrap` with every child
 *     `shrink-0` — on mobile its real content width (~450-700px) exceeded the
 *     viewport, and since html/body use `overflow-x: clip`, the excess trailing
 *     buttons (align/color/AI/move/duplicate/delete/more) were rendered past the
 *     viewport edge with no way to scroll to them.
 *  4. The Hero block's date/time inspector grid used a raw viewport breakpoint
 *     (`sm:grid-cols-3`) inside a panel whose own rendered width (240-360px) is
 *     independent of viewport — the 3-column squeeze fired at any browser width
 *     >= 640px regardless of the panel's real (narrow) width, cramping inputs.
 *
 * Explicitly NOT changed (desktop must stay pixel-identical, per requirement):
 *  - Action-bar spacer height (h-11 / lg:h-12) and the two builder offset CSS
 *    vars (--builder-top-offset, --builder-chrome-offset) are a separate, minor
 *    (~8-11px) under-reservation present on EVERY width including desktop — left
 *    untouched/undocumented-fix here specifically to guarantee DESKTOP_UNCHANGED;
 *    see the audit report for the finding.
 *
 * Also documented, NOT fixed in this pass (too broad/risky for "no rewrite"):
 *  - The in-canvas Desktop/Tablet/Mobile PREVIEW buttons change only a CSS
 *    `width` on the canvas container; ~77 `sm:`/`md:`/`lg:` classes inside
 *    landing-page-renderer.tsx (shared with the PUBLIC page) are real Tailwind
 *    viewport media queries, which do not respond to that simulated container
 *    width. Fixing this needs a container-query migration or an iframe-based
 *    preview — both larger, riskier changes than this pass's scope.
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
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');

// --- Finding 1: Inspector interactive on tablet/mobile -----------------------

gate(
  'INSPECTOR_HOST_NOT_UNCONDITIONALLY_INERT',
  // The old bug: `inspectorMode === 'docked' || !inspectorDesktop` always matched
  // pointer-events-none below 1024px regardless of role. Must no longer exist.
  !/inspectorMode === 'docked' \|\| !inspectorDesktop\s*\n\s*\? \/\/ Spacer/.test(builder) &&
    builder.includes('!inspectorDesktop') &&
    /!inspectorDesktop\s*\n\s*\? \/\/ Tablet\/mobile: this IS the real portal host/.test(builder),
  'mobile/tablet portal host branch is distinct from the desktop-docked spacer branch',
);

gate(
  'INSPECTOR_HOST_MOBILE_BRANCH_HAS_NO_POINTER_EVENTS_NONE',
  builder.includes("'relative min-h-0 min-w-0 h-[70vh] max-h-[70vh]'"),
  "the tablet/mobile branch's className string ('relative min-h-0 min-w-0 h-[70vh] max-h-[70vh]') does not include pointer-events-none",
);

gate(
  'INSPECTOR_HOST_ARIA_HIDDEN_CONDITIONAL',
  builder.includes('aria-hidden={!inspectorDesktop ? undefined : true}'),
  'aria-hidden is no longer a static/unconditional attribute — only true for the desktop-docked spacer role',
);

gate(
  'INSPECTOR_MOBILE_HOST_HAS_BOUNDED_HEIGHT',
  builder.includes("'relative min-h-0 min-w-0 h-[70vh] max-h-[70vh]'"),
  'mobile/tablet host has an explicit, bounded height so the portaled panel (height:100%) resolves correctly and can scroll internally instead of forcing the page to full-viewport height',
);

// --- Finding 2: sidebar rail + overlay panel not hidden behind the action bar -

gate(
  'SIDEBAR_RAIL_BELOW_ACTION_BAR_ON_MOBILE',
  sidebar.includes('max-md:fixed max-md:left-3 max-md:top-[7rem] max-md:z-[46]') &&
    !sidebar.includes('max-md:fixed max-md:left-3 max-md:top-16'),
  'rail moved from top-16 (inside the ~56-111px action bar span) to top-[7rem] (112px, below it), z-index raised above the action bar (45)',
);

gate(
  'SIDEBAR_OVERLAY_PANEL_BELOW_ACTION_BAR_AND_SCROLLABLE',
  sidebar.includes('max-md:top-[7rem] max-md:z-[46]') &&
    sidebar.includes('max-md:max-h-[calc(100dvh-8rem)] max-md:overflow-y-auto') &&
    !sidebar.includes('max-md:fixed max-md:left-3 max-md:right-3 max-md:top-16'),
  'flyout panels (Layers/Theme/Add elements/...) moved below the action bar, raised z-index, and capped+scrollable so tall panels cannot run off-screen with no way to reach lower content',
);

// --- Finding 3: floating text toolbar wraps instead of overflowing -----------

gate(
  'TEXT_TOOLBAR_WRAPS_ON_NARROW_SCREENS',
  ux.includes('flex-row flex-wrap items-center gap-0.5 overflow-visible') &&
    !ux.includes('flex-row flex-nowrap items-center gap-0.5 overflow-visible'),
  'every child is shrink-0 by design (icon buttons/selects must not squash) — flex-wrap lets the 2nd row of controls become reachable instead of rendering past the (overflow-x:clip) viewport edge',
);

// --- Finding 4: Hero date/time grid no longer keyed off a viewport breakpoint -

gate(
  'HERO_META_GRID_NOT_VIEWPORT_KEYED',
  builder.includes('<div className="grid gap-2 rounded border border-white/10 p-2" data-lp-hero-meta>') &&
    !builder.includes('<div className="grid gap-2 rounded border border-white/10 p-2 sm:grid-cols-3" data-lp-hero-meta>'),
  'removed sm:grid-cols-3 — a viewport media query has no relationship to this panel\'s own (240-360px) rendered width, so it squeezed date/time inputs at any browser width >= 640px regardless of the panel\'s real width',
);

// --- Desktop must stay pixel-identical (explicit hard requirement) ----------

gate(
  'DESKTOP_OFFSETS_UNTOUCHED',
  builder.includes("['--builder-chrome-offset' as string]: '7.25rem'") &&
    builder.includes("['--builder-top-offset' as string]: '6.75rem'") &&
    builder.includes('<div className="h-11 shrink-0 lg:h-12" aria-hidden data-lp-action-bar-spacer />') &&
    builder.includes('var(--builder-chrome-offset,7.25rem)') &&
    builder.includes('var(--builder-top-offset,6.75rem)') &&
    builder.includes('var(--builder-top-offset, 6.75rem)'),
  'action-bar spacer height and both CSS offset vars kept at their original values — desktop (>=1024) layout math is byte-identical to before this pass',
);

gate(
  'DESKTOP_INSPECTOR_DOCKED_SPACER_STILL_INERT',
  /inspectorMode === 'docked'\s*\n\s*\? \/\/ Desktop docked: pure layout spacer[\s\S]{0,300}?'pointer-events-none relative min-h-0 min-w-0 h-\[calc\(100dvh-var\(--builder-top-offset,6\.75rem\)-0\.5rem\)\]'/.test(
    builder,
  ),
  'the desktop-docked spacer role (pointer-events-none, original offset var) is preserved exactly — only the tablet/mobile branch changed behavior',
);

gate(
  'DESKTOP_VIEWPORT_SIMULATOR_WIDTHS_UNCHANGED',
  (() => {
    const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
    return (
      renderer.includes("desktop: '100%'") &&
      renderer.includes("tablet: '768px'") &&
      renderer.includes("mobile: '390px'")
    );
  })(),
  'in-canvas Desktop/Tablet/Mobile preview container widths (100%/768px/390px) already matched real device breakpoints — left untouched',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const ready = failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log(
  'FILES_CHANGED=landing-page-builder.tsx,landing-page-builder-sidebar.tsx,landing-page-canvas-ux.tsx,scripts/test-landing-page-text-toolbar.cjs,scripts/test-landing-page-builder-responsive.cjs',
);
console.log('BUILDER_RESPONSIVE=' + ready);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
