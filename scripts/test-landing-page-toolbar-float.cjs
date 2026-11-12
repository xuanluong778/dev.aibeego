#!/usr/bin/env node
/**
 * Landing Page Builder — floating draggable toolbar gates.
 *   node scripts/test-landing-page-toolbar-float.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
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
  'HEIGHT_400',
  sidebar.includes('h-auto w-14') &&
    sidebar.includes('data-lp-toolbar-height="content"') &&
    !sidebar.includes('max-h-[400px]'),
  'vertical rail auto height — wraps all icons',
);

gate(
  'DRAG_XY',
  sidebar.includes('data-lp-toolbar-drag-handle') &&
    sidebar.includes('setPointerCapture') &&
    sidebar.includes('onToolbarDragPointerDown') &&
    sidebar.includes('clampToolbarPosition') &&
    sidebar.includes("position: 'fixed'") &&
    sidebar.includes('createPortal'),
  'pointer drag + fixed portal toolbar',
);

gate(
  'NO_STUCK_DRAG',
  sidebar.includes('endToolbarDrag') &&
    sidebar.includes('releasePointerCapture') &&
    sidebar.includes('toolbarDragRef.current = null') &&
    sidebar.includes('lostpointercapture') &&
    sidebar.includes('ev.buttons === 0'),
  'drag stops on pointerup/cancel/lostcapture',
);

gate(
  'VERTICAL_HORIZONTAL',
  sidebar.includes("ToolbarOrientation = 'vertical' | 'horizontal'") &&
    sidebar.includes('data-lp-toolbar-orient') &&
    sidebar.includes('setOrientation') &&
    sidebar.includes('h-auto w-auto max-w-none flex-row'),
  'vertical ↔ horizontal orientation toggle',
);

gate(
  'COLLAPSE_EXPAND',
  sidebar.includes('data-lp-toolbar-collapse') &&
    sidebar.includes('data-lp-left-sidebar-expand') &&
    sidebar.includes('railCollapsed') &&
    sidebar.includes('h-10 w-10 flex-col') &&
    sidebar.includes('setRailCollapsed') &&
    !/if \(collapsed\)[\s\S]*return null/.test(sidebar),
  'collapse shrinks toolbar; expand restores icons',
);

gate(
  'VIEWPORT_CLAMP',
  sidebar.includes('clampToolbarPosition') &&
    sidebar.includes('getToolbarTopMin') &&
    sidebar.includes('LP_TOOLBAR_STORAGE_KEY') &&
    sidebar.includes('localStorage.setItem'),
  'position clamped + persisted in localStorage',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  canvasUx.includes('onSelect') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('pushHistory') &&
    builder.includes('LandingPageRenderer') &&
    builder.includes('LandingPageAiMenu') &&
    !builder.includes('leftSidebarCollapsed'),
  'canvas/autosave/undo/AI intact; no grid slot for toolbar',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
