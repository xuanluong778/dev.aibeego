#!/usr/bin/env node
/**
 * Grid vs thư viện Phần — every live block type must be insertable from
 * add-components panel and/or section library catalog.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const types = [
  'Header',
  'Hero',
  'Benefits',
  'Features',
  'Product',
  'Pricing',
  'Testimonials',
  'Gallery',
  'Video',
  'Process',
  'Speaker',
  'Guarantee',
  'FAQ',
  'LeadForm',
  'CTA',
  'Footer',
  'Countdown',
];

const panel = read('apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx');
const catalog = read('apps/web/src/components/landing-pages/landing-page-section-library-catalog.ts');

const gridBlockTypes = new Set();
const re = /blockType:\s*'([A-Za-z]+)'/g;
let m;
while ((m = re.exec(panel))) {
  if (panel.slice(Math.max(0, m.index - 80), m.index).includes('QuickCard')) continue;
  gridBlockTypes.add(m[1]);
}
// also match blockType in card arrays
for (const t of types) {
  if (panel.includes(`blockType: '${t}'`)) gridBlockTypes.add(t);
}

const catalogTypes = new Set();
const re2 = /blockType:\s*'([A-Za-z]+)'/g;
while ((m = re2.exec(catalog))) catalogTypes.add(m[1]);

let fail = 0;
for (const t of types) {
  const inGrid = gridBlockTypes.has(t);
  const inLib = catalogTypes.has(t);
  const ok = inGrid || inLib;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${t} grid=${inGrid ? 'Y' : 'n'} sectionLib=${inLib ? 'Y' : 'n'}`);
  if (!ok) fail += 1;
}

if (!panel.includes('data-lp-form-insert-empty')) {
  console.log('FAIL empty LeadForm control missing');
  fail += 1;
} else {
  console.log('PASS empty LeadForm control present');
}

if (!panel.includes('initialShapeGroup="social"')) {
  console.log('FAIL social deep-link');
  fail += 1;
} else {
  console.log('PASS social deep-link');
}

if (fail) {
  console.error(`\nadd-components grid: ${fail} failure(s)`);
  process.exit(1);
}
console.log('\nadd-components grid OK');
