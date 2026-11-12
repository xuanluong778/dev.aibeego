#!/usr/bin/env node
/**
 * LP toolbar — no inner vertical scroll + portal hover labels.
 *   node scripts/test-landing-page-toolbar-no-scroll.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const hover = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/rail-icon-hover-label.tsx'),
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

const railBlock = sidebar.match(
  /data-lp-sidebar-rail[\s\S]*?data-lp-toolbar-icons-scroll[\s\S]*?data-lp-toolbar-no-scroll="1"/,
)?.[0] || '';

gate(
  'NO_VERTICAL_SCROLLBAR',
  sidebar.includes('data-lp-toolbar-no-scroll="1"') &&
    sidebar.includes('data-lp-sidebar-rail-scroll="0"') &&
    !/data-lp-toolbar-icons-scroll[\s\S]{0,300}overflow-y-auto/.test(sidebar) &&
    !/data-lp-sidebar-rail[\s\S]{0,400}overflow-y-auto/.test(sidebar) &&
    railBlock.includes('overflow-visible'),
  'rail has no overflow-y auto/scroll',
);

gate(
  'ALL_ICONS_VISIBLE',
  sidebar.includes('LP_RAIL_QUICK_INSERT.map') &&
    sidebar.includes('RailIcon') &&
    sidebar.includes('data-lp-rail-icon') &&
    sidebar.includes('PlusIcon') &&
    sidebar.includes('h-auto w-14') &&
    sidebar.includes('data-lp-toolbar-height="content"'),
  'all rail icons retained; height fits content',
);

gate(
  'HOVER_TEXT_FULL',
  sidebar.includes('RailIconHoverLabel') &&
    hover.includes('w-max') &&
    hover.includes('whitespace-normal') &&
    hover.includes('data-lp-rail-tooltip-label') &&
    sidebar.includes('w-14') &&
    sidebar.includes('sm:w-16'),
  'wider rail + portal labels with full text width',
);

gate(
  'TOOLTIP_NOT_CLIPPED',
  hover.includes('createPortal') &&
    hover.includes("position: 'fixed'") &&
    hover.includes('document.body') &&
    hover.includes('zIndex: 200') &&
    sidebar.includes('overflow-visible'),
  'fixed portal tooltips; rail overflow visible',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  canvasUx.includes('onSelect') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('pushHistory') &&
    builder.includes('LandingPageRenderer') &&
    builder.includes('LandingPageAiMenu'),
  'canvas/autosave/undo/AI intact',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
console.log(
  failed.length === 0
    ? 'ALL GATES PASS'
    : `FAILED: ${failed.map(([n]) => n).join(', ')}`,
);
process.exit(failed.length === 0 ? 0 : 1);
