#!/usr/bin/env node
/**
 * Gate: add-components panel cards for section blocks are HTML5-draggable (block-type).
 * Footer renderer must not duplicate data-lp-block-id inside chrome.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const panel = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx'),
  'utf8',
);
const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);

let fail = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fail += 1;
}

gate(
  'BLOCK_TYPE_DRAG',
  panel.includes("kind: 'block-type'") &&
    panel.includes("dragKind === 'block-type'") &&
    panel.includes("data-lp-sidebar-block-type") &&
    panel.includes("blockDragType"),
  'Header/Footer/Speaker/LeadForm cards drag via block-type payload',
);

gate(
  'FOOTER_NO_DUP_BLOCK_ID',
  renderer.includes('data-lp-footer-root="1"') &&
    !/Footer[\s\S]{0,400}data-lp-block-id=\{block\.id\}/.test(renderer),
  'Footer uses chrome id only; no nested data-lp-block-id',
);

if (fail) process.exit(1);
console.log('\nadd-components DnD gates OK');
