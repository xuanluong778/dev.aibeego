#!/usr/bin/env node
/**
 * Gate: LP Inspector Design tab — typography / size / border / shadow / filter / transform / CSS
 *   node scripts/test-landing-page-inspector-design-tab.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const design = read('apps/web/src/components/landing-pages/landing-page-inspector-design-tab.tsx');
const helper = read('apps/web/src/components/landing-pages/landing-page-block-design-style.ts');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const canvasUx = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const ctx = read('apps/web/src/components/landing-pages/landing-page-inspector-context.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'DESIGN_TAB_UNCHANGED_NAME',
  builder.includes("label: 'Thiết kế'") &&
    builder.includes("label: 'Nội dung'") &&
    builder.includes("label: 'Nâng cao'") &&
    !builder.includes("label: 'Design'"),
  'tab name remains Thiết kế',
);

gate(
  'TYPOGRAPHY',
  design.includes('title="Thiết lập chữ"') &&
    design.includes('data-lp-design-font-family') &&
    design.includes('data-lp-design-font-unit') &&
    design.includes('data-lp-design-text-format') &&
    design.includes('text-transform') &&
    design.includes('justify') &&
    design.includes('Letter spacing') &&
    design.includes('Line height') &&
    canvasUx.includes('textDecoration') &&
    canvasUx.includes("fontSizeUnit === 'rem'"),
  'typography controls + inline style apply',
);

gate(
  'SIZE',
  design.includes('title="Kích thước"') &&
    design.includes("label: 'Auto'") &&
    design.includes("label: 'Full'") &&
    design.includes("label: 'Custom'") &&
    design.includes('data-lp="size"'),
  'size Auto/Full/Custom',
);

gate(
  'BORDER_RADIUS',
  design.includes('title="Viền & bo góc"') &&
    design.includes('Border width') &&
    design.includes('Border style') &&
    design.includes('Border color') &&
    design.includes('data-lp-radius-link') &&
    design.includes('Tách 4 góc'),
  'border + linked/unlinked radii',
);

gate(
  'SHADOW',
  design.includes('title="Đổ bóng"') &&
    design.includes('data-lp-design-shadow-toggle') &&
    design.includes('data-lp-design-shadow-controls') &&
    helper.includes('serializeBoxShadow') &&
    helper.includes('parseBoxShadow'),
  'shadow toggle + X/Y/Blur/Spread/Color/Opacity',
);

gate(
  'FILTER',
  design.includes('title="Filter"') &&
    design.includes('defaultOpen={false}') &&
    design.includes('Blend Mode') &&
    design.includes('Contrast') &&
    design.includes('Brightness') &&
    design.includes('Saturation') &&
    design.includes('Grayscale') &&
    design.includes('Hue Rotate') &&
    helper.includes('serializeCssFilter'),
  'filter accordion collapsed by default',
);

gate(
  'TRANSFORM',
  design.includes('title="Transform"') &&
    design.includes('data-lp="transform"') &&
    design.includes('Translate X') &&
    design.includes('Scale X') &&
    design.includes('Skew X') &&
    design.includes('freeLayout') &&
    helper.includes('composeDesignTransformCss'),
  'transform syncs free-layout; no new engine',
);

gate(
  'CUSTOM_CLASS',
  (design.includes('title="CSS tùy chỉnh"') || design.includes("accordionTitle = 'CSS tùy chỉnh'")) &&
    design.includes('data-lp-design-custom-class') &&
    helper.includes('safeCustomClassName') &&
    renderer.includes('designClassName') &&
    canvasUx.includes('designClassName'),
  'custom class on design shell',
);

gate(
  'CUSTOM_CSS',
  design.includes('data-lp-design-custom-css-textarea') &&
    design.includes('font-mono') &&
    helper.includes('sanitizeLandingPageCustomCss') &&
    helper.includes('buildPageCustomCssBlocks') &&
    renderer.includes('data-lp-custom-css') &&
    renderer.includes('buildPageCustomCssBlocks') &&
    !helper.includes('eval('),
  'sanitized CSS scoped to block; no JS eval',
);

gate(
  'CONTEXT_AWARE',
  design.includes('resolveInspectorContext') &&
    design.includes("ctx.kind === 'text'") &&
    design.includes('showTypography') &&
    ctx.includes('resolveInspectorContext') &&
    design.includes("ctx.kind === 'form'"),
  'design panels follow selection',
);

gate(
  'AUTOSAVE',
  builder.includes('/autosave') && builder.includes('pushHistory'),
  'autosave untouched',
);

gate(
  'UNDO_REDO',
  builder.includes('const undo = useCallback') && builder.includes('onClick={undo}'),
  'undo/redo untouched',
);

gate(
  'PREVIEW_PUBLISH',
  builder.includes('LandingPageDraftPreviewPanel') && builder.includes('Publish'),
  'preview/publish untouched',
);

gate(
  'LEFT_SIDEBAR_UNCHANGED',
  sidebar.includes('LP_RAIL_QUICK_INSERT') && sidebar.includes('Thư viện block'),
  'left sidebar not modified for this task',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('DESIGN_TAB_OPTIMIZED=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
