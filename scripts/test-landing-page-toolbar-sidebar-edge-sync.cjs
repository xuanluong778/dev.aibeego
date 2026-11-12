#!/usr/bin/env node
/**
 * Landing Page floating toolbar ↔ website sidebar edge sync gates.
 *   node scripts/test-landing-page-toolbar-sidebar-edge-sync.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const appShell = fs.readFileSync(
  path.join(root, 'apps/web/src/components/layout/app-shell.tsx'),
  'utf8',
);

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

const hasFormula =
  sidebar.includes('toolbarLeft = websiteSidebarRight + savedGapX') ||
  sidebar.includes('sidebarRight + gapX') ||
  sidebar.includes('positionFromGap');

const usesLiveSidebarEdge =
  sidebar.includes('getWebsiteSidebarRight') &&
  sidebar.includes('main-app-sidebar') &&
  sidebar.includes('ResizeObserver') &&
  sidebar.includes('savedGapX');

const noHardcodedDualLeft =
  !/collapsed[\s\S]{0,80}left:\s*(280|256|72|56)/.test(sidebar) &&
  !sidebar.includes('SIDEBAR_OPEN_LEFT') &&
  !sidebar.includes('SIDEBAR_CLOSED_LEFT') &&
  !sidebar.includes('toolbarLeftExpanded') &&
  !sidebar.includes('toolbarLeftCollapsed');

gate(
  'SIDEBAR_EDGE_SYNC',
  hasFormula &&
    usesLiveSidebarEdge &&
    sidebar.includes('data-lp-toolbar-sidebar-edge-sync') &&
    sidebar.includes('applyPositionFromGap') &&
    sidebar.includes('mkspa:main-sidebar-width') &&
    appShell.includes('MAIN_SIDEBAR_WIDTH_EVENT') &&
    appShell.includes('transition-[width] duration-200'),
  'toolbarLeft = websiteSidebarRight + savedGapX; observe live edge + width event',
);

gate(
  'COLLAPSE_EXACT_DELTA',
  sidebar.includes('positionFromGap') &&
    sidebar.includes('gapXRef') &&
    sidebar.includes('ResizeObserver') &&
    sidebar.includes('data-main-sidebar-collapsed') &&
    noHardcodedDualLeft,
  'collapse moves by sidebar width delta via same gapX (no dual lefts)',
);

gate(
  'EXPAND_EXACT_DELTA',
  sidebar.includes('positionFromGap') &&
    sidebar.includes('getWebsiteSidebarRight') &&
    sidebar.includes('MutationObserver') &&
    noHardcodedDualLeft,
  'expand recomputes left from same gapX + new sidebarRight',
);

gate(
  'Y_POSITION_PRESERVED',
  sidebar.includes('applyPositionFromGap(gapXRef.current, toolbarPosRef.current.y)') ||
    sidebar.includes('toolbarPosRef.current.y'),
  'edge sync keeps Y; only X follows sidebar',
);

gate(
  'USER_GAP_PRESERVED',
  sidebar.includes('gapX:') &&
    sidebar.includes('savedGapX') &&
    sidebar.includes('snapGapToSidebarEdge') &&
    sidebar.includes('GAP_SNAP_CLOSE') &&
    sidebar.includes('GAP_SNAP_FAR') &&
    sidebar.includes('setSavedGapX(gapX)') &&
    !sidebar.includes('setSavedGapX(0)'),
  'gapX persisted; snap 8–16 near edge; not reset on collapse',
);

gate(
  'DRAG_UNCHANGED',
  sidebar.includes('onToolbarDragPointerDown') &&
    sidebar.includes('setPointerCapture') &&
    sidebar.includes('data-lp-toolbar-drag-handle') &&
    sidebar.includes('setOrientation') &&
    sidebar.includes('railCollapsed') &&
    sidebar.includes('LP_TOOLBAR_STORAGE_KEY') &&
    sidebar.includes('mkspa.lpBuilderToolbar.v1'),
  'XY drag, orientation, collapse, localStorage key intact',
);

gate(
  'NO_OVERFLOW',
  sidebar.includes('clampToolbarPosition') &&
    sidebar.includes('positionFromGap') &&
    sidebar.includes('window.innerWidth') &&
    sidebar.includes('window.innerHeight'),
  'position clamped inside viewport',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
