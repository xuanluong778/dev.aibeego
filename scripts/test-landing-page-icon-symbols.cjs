#!/usr/bin/env node
/**
 * Gate: Biểu tượng rail + icon symbol packs
 *   node scripts/test-landing-page-icon-symbols.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const icons = read('apps/web/src/components/landing-pages/landing-page-graphics-icons.tsx');
const symbols = read('apps/web/src/components/landing-pages/landing-page-icon-symbol-presets.tsx');
const library = read('apps/web/src/components/landing-pages/landing-page-graphics-library.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const symbolCount = (symbols.match(/\bicon\('/g) || []).length;

gate(
  'RAIL_ICON_PANEL',
  sidebar.includes("label: 'Biểu tượng'") &&
    sidebar.includes("id: 'icon'") &&
    sidebar.includes("toggle('icon')") &&
    sidebar.includes("panel === 'icon'") &&
    sidebar.includes('iconsOnly') &&
    sidebar.includes('panelTitle="Biểu tượng"'),
  'Biểu tượng opens icon library panel',
);

gate(
  'ICON_GROUPS',
  icons.includes("id: 'social'") &&
    icons.includes("id: 'solid'") &&
    icons.includes("id: 'material'") &&
    icons.includes("id: 'arrows'") &&
    icons.includes("id: 'pattern'") &&
    icons.includes("id: 'background'") &&
    icons.includes("label: 'Socials'") &&
    icons.includes("label: 'Icons'") &&
    icons.includes("label: 'Material Icons'") &&
    icons.includes("label: 'Arrows'") &&
    icons.includes("label: 'Pattern'") &&
    icons.includes("label: 'Background'"),
  'reference sheet groups present',
);

gate(
  'ICON_ASSETS',
  symbolCount >= 100 &&
    symbols.includes('ico-fb') &&
    symbols.includes('ico-zalo') &&
    symbols.includes('ico-martini') &&
    symbols.includes('mat-search') &&
    symbols.includes('arr-right') &&
    symbols.includes('pat-wave') &&
    symbols.includes('bg-hill') &&
    icons.includes('LP_ICON_SYMBOL_ASSETS'),
  `${symbolCount} symbol assets merged into graphics icons`,
);

gate(
  'INSERT_PATH',
  library.includes('iconsOnly') &&
    library.includes('initialCategory') &&
    library.includes('onInsertBox') &&
    library.includes("kind: 'box'") || library.includes("asset.kind === 'box'"),
  'icons reuse box insert + DnD path',
);

gate(
  'NO_FEATURES_HIJACK',
  !sidebar.includes("item.id === 'video' || item.id === 'icon'") &&
    sidebar.includes("item.id === 'video' ? item.type"),
  'Biểu tượng no longer drag-inserts Features block',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL')));
console.log('ICON_SYMBOLS_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
