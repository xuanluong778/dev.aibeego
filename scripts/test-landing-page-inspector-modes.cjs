#!/usr/bin/env node
/**
 * Landing Page Builder — left sidebar collapse + inspector float/drag gates.
 *   node scripts/test-landing-page-inspector-modes.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

gate(
  'SIDEBAR_COLLAPSE_EXPAND',
  sidebar.includes('data-lp-toolbar-collapse') &&
    sidebar.includes('data-lp-left-sidebar-expand') &&
    sidebar.includes('railCollapsed') &&
    sidebar.includes('setRailCollapsed') &&
    sidebar.includes('data-lp-toolbar-float={desktopFloating ?'),
  '← collapse / → expand on floating toolbar; no grid slot',
);

gate(
  'CANVAS_EXPAND',
  builder.includes('lg:grid-cols-[minmax(0,1fr)_240px]') &&
    builder.includes('lg:grid-cols-[minmax(0,1fr)]') &&
    !builder.includes('lg:grid-cols-[56px_minmax(0,1fr)_320px]') &&
    !/canvas[\s\S]{0,80}transform:\s*scale|data-lp-canvas-scroll[\s\S]{0,200}scale\(/.test(builder),
  'canvas full width — floating toolbar outside grid',
);

gate(
  'THIN_SCROLLBAR',
  builder.includes('LP_THIN_SCROLL') &&
    builder.includes('[&::-webkit-scrollbar]:w-[5px]') &&
    builder.includes('[scrollbar-width:thin]'),
  '~5px thin scrollbar on canvas + inspector',
);

gate(
  'INSPECTOR_DOCK_FLOAT',
  builder.includes("useState<'docked' | 'floating'>('docked')") &&
    builder.includes('toggleInspectorMode') &&
    builder.includes('data-lp-inspector-expand') &&
    builder.includes('createPortal') &&
    builder.includes('document.body'),
  'Phóng/Gắn docked ↔ floating',
);

gate(
  'DRAG_NO_JUMP',
  builder.includes('getBoundingClientRect') &&
    builder.includes('offsetX: e.clientX - start.x') &&
    builder.includes('offsetY: e.clientY - start.y') &&
    !/transform:\s*'translate3d/.test(builder) &&
    !/transform:\s*"translate3d/.test(builder),
  'drag from live rect + client offset; no left/top+transform mix',
);

gate(
  'DRAG_STOPS_ON_MOUSE_UP',
  builder.includes('endInspectorDrag') &&
    builder.includes("window.addEventListener('pointerup'") &&
    builder.includes("window.addEventListener('pointercancel'") &&
    builder.includes('lostpointercapture') &&
    builder.includes("ev.buttons === 0"),
  'pointerup/cancel/lostcapture + buttons===0 stop drag',
);

gate(
  'NO_STUCK_DRAG',
  builder.includes('detachInspectorDragRef') &&
    builder.includes('releasePointerCapture') &&
    builder.includes('inspectorDragRef.current = null') &&
    builder.includes("if (inspectorMode !== 'floating')") &&
    builder.includes('endInspectorDrag()'),
  'cleanup on mode change / unmount / mouse up',
);

gate(
  'NO_DUPLICATE_LISTENER',
  builder.includes('detachInspectorDragRef.current?.()') &&
    builder.includes('window.removeEventListener') &&
    builder.includes('// Detach any previous listeners before attaching'),
  'detach before attach; single active drag listener set',
);

gate(
  'NO_STATE_LOSS',
  builder.includes('selectedBlockId') &&
    builder.includes('pushHistory') &&
    builder.includes('const undo =') &&
    builder.includes('toggleInspectorMode') &&
    !/setSelectedId\(null\).*toggleInspectorMode|toggleInspectorMode[\s\S]*setSpec\(createEmpty/.test(
      builder,
    ),
  'toggle/collapse does not reset selection/history',
);

gate(
  'MOBILE_UNCHANGED',
  builder.includes('max-[767px]:overflow-y-auto') &&
    builder.includes('!inspectorDesktop') &&
    sidebar.includes('max-md:fixed') &&
    sidebar.includes('desktopFloating') &&
    sidebar.includes('data-lp-left-sidebar-slot'),
  'mobile rail in-flow; floating toolbar desktop-only',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  canvasUx.includes('onSelect') &&
    canvasUx.includes('onReorderBlock') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('STALE_REVISION') &&
    builder.includes('LandingPageRenderer') &&
    builder.includes('pushHistory'),
  'canvas/autosave/undo core intact',
);

// Page scroll (desktop canvas no longer has inner scroll frame)
gate(
  'DOCKED_CANVAS_SCROLL_INDEPENDENT',
  builder.includes('data-lp-canvas-scroll-mode="page"') &&
    builder.includes('lg:overflow-visible') &&
    !builder.includes('el.scrollTop += e.deltaY'),
  'docked desktop uses page scroll, not inner canvas frame',
);

gate(
  'FLOATING_PAGE_BROWSER_SCROLL',
  builder.includes('lg:overflow-visible lg:overscroll-auto') &&
    builder.includes('data-lp-canvas-scroll-mode="page"'),
  'floating + docked share page-level scroll',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('\n---');
console.log(
  `LP_INSPECTOR_MODES = ${failed.length === 0 ? 'PASS' : 'FAIL'} (${Object.keys(gates).length - failed.length}/${Object.keys(gates).length})`,
);
if (failed.length) {
  console.log('FAILS:', failed.map(([n]) => n).join(', '));
}
process.exit(failed.length ? 1 : 0);
