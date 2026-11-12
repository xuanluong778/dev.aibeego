#!/usr/bin/env node
/**
 * Gate: LP Nút bấm rail → button presets panel
 *   node scripts/test-landing-page-button-presets.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const presets = read('apps/web/src/components/landing-pages/landing-page-button-presets.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const nextCfg = read('apps/web/next.config.js');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'PANEL_TABS',
  presets.includes("label: 'Nút bấm'") &&
    presets.includes("label: 'Nhóm nút bấm'") &&
    presets.includes('LandingPageButtonPresetsPanel') &&
    presets.includes('data-lp-button-presets-panel') &&
    presets.includes('overflow-y-auto'),
  'panel has Buttons | Groups tabs + scroll',
);

gate(
  'BUTTON_CATALOG',
  presets.includes('LP_BUTTON_PRESETS') &&
    presets.includes('pill-orange') &&
    presets.includes('Mua Ngay') &&
    presets.includes('ico-star') &&
    /data-lp-button-preset-count=\{textButtons\.length\}/.test(presets),
  'single + icon button presets catalog',
);

gate(
  'GROUP_CATALOG',
  presets.includes('LP_BUTTON_GROUP_PRESETS') &&
    presets.includes('Giới thiệu') &&
    presets.includes('Products') &&
    presets.includes('col-teal') &&
    /data-lp-button-group-count=\{LP_BUTTON_GROUP_PRESETS\.length\}/.test(presets),
  'button group presets (EN + VI layouts)',
);

gate(
  'RAIL_OPENS_PANEL',
  sidebar.includes("item.id === 'button'") &&
    sidebar.includes("toggle('button')") &&
    sidebar.includes('LandingPageButtonPresetsPanel') &&
    sidebar.includes('onInsertButtonPreset') &&
    builder.includes('onInsertButtonPreset={insertButtonPreset}'),
  'Nút bấm rail opens button presets overlay',
);

gate(
  'INSERT_REUSES_ENGINE',
  builder.includes('function insertButtonPreset') &&
    builder.includes("defaultBlock('CTA')") &&
    builder.includes('function insertButtonGroupPreset') &&
    builder.includes('navIconForVariant') &&
    builder.includes("defaultBlock('Benefits')") &&
    builder.includes('pushHistory'),
  'click → CTA button-only or Benefits nav group + history',
);

gate(
  'RENDER_PATHS',
  renderer.includes('data-lp-button-block') &&
    renderer.includes('buttonOnly') &&
    renderer.includes('data-lp-button-group-block') &&
    renderer.includes('parseNavVariant') &&
    renderer.includes('navGroupItemStyle'),
  'CTA button-only + Benefits nav-group render paths',
);

gate(
  'NEXT_CONFIG_EXPORT',
  nextCfg.includes('module.exports = nextConfig') &&
    nextCfg.includes("source: '/uploads/:path*'"),
  'next.config still exports + uploads rewrite intact',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const btnCount = (presets.match(/btn\('/g) || []).length;
const groupCount = (presets.match(/group\('/g) || []).length;

console.log('');
console.log(
  'FILES_CHANGED=landing-page-button-presets.tsx,landing-page-builder-sidebar.tsx,landing-page-builder.tsx,landing-page-renderer.tsx,scripts/test-landing-page-button-presets.cjs',
);
console.log('PRESETS_ADDED=buttons:' + btnCount + '+groups:' + groupCount);
console.log('BUTTON_PRESETS_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
