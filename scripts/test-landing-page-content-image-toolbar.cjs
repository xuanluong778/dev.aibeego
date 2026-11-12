#!/usr/bin/env node
/** Gate: content-image toolbar (ẢNH) mirrors section Nền toolbar */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const canvas = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const toolbar = read('apps/web/src/components/landing-pages/landing-page-section-background-toolbar.tsx');
const types = read('packages/shared/src/landing-page-types.ts');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'IMAGE_TOOLBAR_UI',
  toolbar.includes("variant?: 'section' | 'image'") &&
    toolbar.includes("isImage ? 'Ảnh' : 'Nền'") &&
    toolbar.includes('data-lp-image-toolbar') &&
    canvas.includes("variant=\"image\"") &&
    canvas.includes('showImageToolbar'),
  'ẢNH portal toolbar on content image select',
);

gate(
  'IMAGE_ACTIONS',
  builder.includes('handleContentImageAction') &&
    builder.includes('onContentImageAction') &&
    builder.includes('getContentImageMeta'),
  'actions wired through history updateBlock',
);

gate(
  'IMAGE_STYLE_FIELDS',
  types.includes('bgColor?: string') &&
    types.includes('flip?: string') &&
    types.includes('motion?: string') &&
    renderer.includes('lpImgMotionAttr') &&
    renderer.includes('data-lp-img-motion'),
  'flip/motion/bgColor on LandingPageImageStyle',
);

gate(
  'SECTION_BG_INTACT',
  canvas.includes('showBgToolbar') &&
    builder.includes('handleSectionBackgroundAction') &&
    toolbar.includes("variant = 'section'"),
  'section Nền toolbar unchanged',
);

const failed = Object.values(gates).filter((v) => !v).length;
console.log('CONTENT_IMAGE_TOOLBAR_READY=' + (failed ? 'FAIL' : 'PASS'));
process.exit(failed ? 1 : 0);
