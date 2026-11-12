#!/usr/bin/env node
/**
 * Gate: LP Builder right inspector — Canvas First UX
 *   node scripts/test-landing-page-inspector-canvas-first.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const design = read('apps/web/src/components/landing-pages/landing-page-inspector-design-tab.tsx');
const ui = read('apps/web/src/components/landing-pages/landing-page-inspector-ui.tsx');
const image = read('apps/web/src/components/landing-pages/landing-page-image-field.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'THREE_TABS',
  builder.includes("label: 'Nội dung'") &&
    builder.includes("label: 'Thiết kế'") &&
    builder.includes("label: 'Nâng cao'") &&
    builder.includes('data-lp-inspector-tabs'),
  'Nội dung | Thiết kế | Nâng cao intact',
);

gate(
  'STICKY_SCROLL',
  builder.includes('data-lp-inspector-sticky') &&
    builder.includes('data-lp-inspector-scroll') &&
    builder.includes('overflow-hidden') &&
    builder.includes('w-[320px]'),
  'sticky header+tabs; independent scroll; ~320px',
);

gate(
  'CANVAS_FIRST_CONTENT',
  builder.includes('data-lp-canvas-first="1"') &&
    builder.includes('Double-click chữ trên canvas') &&
    !builder.includes("label=\"Headline\"") &&
    !builder.includes('Lead form fields') &&
    builder.includes('LeadFormCrmInspector') &&
    builder.includes('data-lp-inspector-button-link') &&
    builder.includes('data-lp-inspector-video'),
  'no duplicate text inputs; CRM/image/button/video element-aware',
);

gate(
  'DESIGN_GROUPS',
  (design.includes('title="Nền"') || design.includes('title="Background"')) &&
    (design.includes('title="Kích thước"') || design.includes('title="Size"')) &&
    (design.includes('title="Viền & bo góc"') || design.includes('Viền')) &&
    (design.includes('title="Đổ bóng"') || design.includes('Shadow')) &&
    design.includes('Filter') &&
    design.includes('title="Transform"') &&
    (design.includes('title="CSS tùy chỉnh"') ||
      design.includes("accordionTitle = 'CSS tùy chỉnh'")) &&
    design.includes('defaultOpen={false}') &&
    ui.includes('InspectorSegmented') &&
    ui.includes('InspectorSliderNumber') &&
    ui.includes('InspectorAccordion'),
  'design accordion groups + segmented/slider; Filter closed',
);

gate(
  'IMAGE_ALT_LINK',
  image.includes('data-lp-image-alt') && image.includes('data-lp-image-link'),
  'image Alt + Link reused in image field',
);

gate(
  'LEFT_SIDEBAR_UNTOUCHED',
  sidebar.includes('LP_RAIL_QUICK_INSERT') && sidebar.includes('Thư viện block'),
  'left sidebar file still present (not the refactor target)',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('INSPECTOR_CANVAS_FIRST_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
