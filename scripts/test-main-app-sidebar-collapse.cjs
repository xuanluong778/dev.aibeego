#!/usr/bin/env node
/**
 * Main App Sidebar — collapsed hover labels + collapse gates.
 *   node scripts/test-main-app-sidebar-collapse.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const appShell = fs.readFileSync(
  path.join(root, 'apps/web/src/components/layout/app-shell.tsx'),
  'utf8',
);
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/layout/sidebar.tsx'),
  'utf8',
);
const hoverLabel = fs.readFileSync(
  path.join(root, 'apps/web/src/components/layout/collapsed-nav-hover-label.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const lpSidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const globals = fs.readFileSync(path.join(root, 'apps/web/src/app/globals.css'), 'utf8');

const gates = {};
function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

gate(
  'MAIN_APP_SIDEBAR_COLLAPSE',
  appShell.includes('mainSidebarCollapsed') &&
    appShell.includes('onToggleCollapsed') &&
    sidebar.includes('data-testid="main-app-sidebar-toggle"') &&
    sidebar.includes("collapsed ? '→' : '←'") &&
    sidebar.includes('data-main-sidebar-overview-row="collapsed"') &&
    appShell.includes('SIDEBAR_COLLAPSED') &&
    appShell.includes('3.5rem'),
  '← closes to ~56px rail; toggle above overview icon when collapsed',
);

gate(
  'BUILDER_DEFAULT_COLLAPSED',
  appShell.includes('isLandingPageBuilderPath') &&
    appShell.includes('builderLeftExpanded') &&
    appShell.includes('lpBuilderActive ? !builderLeftExpanded') &&
    appShell.includes('setBuilderLeftExpanded(false)') &&
    appShell.includes("pathname.includes('/landing-pages/builder/')"),
  'landing-page design mode starts with the main left sidebar collapsed',
);

gate(
  'NON_BUILDER_ALWAYS_EXPANDED',
  appShell.includes('collapse-on-builder-only') &&
    appShell.includes('setMainSidebarCollapsed(false)') &&
    !appShell.includes('mkspa.mainSidebarCollapsed') &&
    appShell.includes('[pathname, lpBuilderActive]'),
  'Overview / Trang của tôi / every other tab expand; collapse is not persisted',
);

gate(
  'MAIN_APP_SIDEBAR_EXPAND',
  appShell.includes('setMainSidebarCollapsed') &&
    sidebar.includes('data-main-sidebar-overview-row="expanded"') &&
    sidebar.includes('openGroups'),
  '→ restores full sidebar; toggle aligned with Tổng quan row',
);

gate(
  'CANVAS_WIDTH_EXPANDS',
  appShell.includes('--app-sidebar-width') &&
    builder.includes('var(--app-sidebar-width, 16rem)') &&
    builder.includes('calc(var(--app-sidebar-width, 16rem) + 1.5rem)') &&
    lpSidebar.includes('createPortal') &&
    builder.includes('--lp-inspector-dock-w') &&
    builder.includes('w-[320px]') &&
    globals.includes('--app-sidebar-width'),
  'canvas full width; LP toolbar floats (no grid slot)',
);

gate(
  'NO_EMPTY_GAP',
  appShell.includes("lg:pl-[var(--app-sidebar-width,16rem)]") &&
    appShell.includes('transition-[width]') &&
    appShell.includes('transition-[padding]') &&
    builder.includes('calc(var(--app-sidebar-width, 16rem) + 1.5rem)') &&
    !appShell.includes('lg:pl-64'),
  'content padding + LP action bar use CSS var (no fixed 16rem gap)',
);

gate(
  'ACTIVE_MENU_PRESERVED',
  sidebar.includes('isNavItemActive') &&
    sidebar.includes('isGroupActive') &&
    sidebar.includes('openGroups') &&
    /if \(collapsed\)[\s\S]*CollapsedNavHoverLabel[\s\S]*active \|\| isHubExact/.test(sidebar),
  'active styles + openGroups survive collapse (submenus reappear on expand)',
);

gate(
  'LANDING_PAGE_TOOLBAR_UNCHANGED',
  lpSidebar.includes('data-lp-toolbar-float') &&
    lpSidebar.includes('data-lp-left-sidebar-collapse') &&
    !lpSidebar.includes('mainSidebarCollapsed') &&
    !appShell.includes('leftSidebarCollapsed') &&
    !builder.includes('leftSidebarCollapsed'),
  'LP floating toolbar independent from main app sidebar',
);

gate(
  'INSPECTOR_UNCHANGED',
  builder.includes("useState<'docked' | 'floating'>('docked')") &&
    builder.includes('toggleInspectorMode') &&
    builder.includes('data-lp-inspector-mode'),
  'inspector dock/float API untouched',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !fs
    .readFileSync(
      path.join(root, 'apps/web/src/components/content-marketing/content-marketing-studio.tsx'),
      'utf8',
    )
    .includes('mainSidebarCollapsed') &&
    !fs
      .readFileSync(
        path.join(root, 'apps/web/src/components/content-auto-post/content-auto-post-shell.tsx'),
        'utf8',
      )
      .includes('mainSidebarCollapsed') &&
    !hoverLabel.includes('leftSidebarCollapsed') &&
    appShell.includes('duration-200'),
  'other modules not wired to mainSidebarCollapsed; transition 200ms',
);

gate(
  'COLLAPSED_MENU_HOVER_LABEL',
  sidebar.includes('CollapsedNavHoverLabel') &&
    sidebar.includes('enabled={collapsed}') &&
    hoverLabel.includes('data-collapsed-menu-hover-label') &&
    hoverLabel.includes('createPortal') &&
    hoverLabel.includes('onMouseEnter') &&
    hoverLabel.includes('onMouseLeave'),
  'hover label only via CollapsedNavHoverLabel when collapsed',
);

gate(
  'LABEL_SLIDE_RIGHT',
  hoverLabel.includes('150ms') &&
    hoverLabel.includes("shown ? '0' : '-6px'") &&
    hoverLabel.includes('opacity') &&
    hoverLabel.includes('opacity 150ms ease-out') &&
    hoverLabel.includes('transform 150ms ease-out'),
  'fade + slide L→R ~150ms',
);

gate(
  'LABEL_NOT_CLIPPED',
  hoverLabel.includes("createPortal") &&
    hoverLabel.includes("document.body") &&
    hoverLabel.includes("position: 'fixed'") &&
    hoverLabel.includes('zIndex: 200'),
  'fixed portal to body; z-index above canvas',
);

gate(
  'CORRECT_MENU_NAME',
  sidebar.includes('label={t(group.title)}') &&
    /CollapsedNavHoverLabel[\s\S]*label=\{t\(group\.title\)\}/.test(sidebar),
  'label uses translated group.title (menu name)',
);

gate(
  'NO_LAYOUT_SHIFT',
  hoverLabel.includes('pointer-events-none') &&
    !hoverLabel.includes('setMainSidebarCollapsed') &&
    appShell.includes('SIDEBAR_COLLAPSED') &&
    !/CollapsedNavHoverLabel[\s\S]{0,200}width:\s*['"]/.test(hoverLabel),
  'tooltip does not resize sidebar rail',
);

gate(
  'EXPANDED_SIDEBAR_UNCHANGED',
  hoverLabel.includes('if (!enabled) return') &&
    sidebar.includes('enabled={collapsed}') &&
    sidebar.includes('data-main-sidebar-overview-row="expanded"') &&
    sidebar.includes('openGroups[group.title]'),
  'hover labels disabled when expanded; submenu UI intact',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
