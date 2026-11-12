#!/usr/bin/env node
/**
 * BUG-03/04/05 — Builder / Preview / Public parity
 *   node scripts/test-landing-page-builder-preview-public-parity.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const svc = read('apps/api/src/landing-pages/landing-pages.service.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'PUBLIC_META_KEPT',
  svc.includes('toPublicSpec') &&
    svc.includes('inlineTextStyles') &&
    svc.includes('elementFreeLayouts') &&
    svc.includes('responsiveInlineTextStyles'),
  'API keeps render-critical meta for public/preview',
);

gate(
  'PUBLIC_META_PROVIDER',
  ux.includes('LandingPagePublicMetaProvider') &&
    ux.includes('readInlineTextStyles') &&
    ux.includes('readElementFreeLayouts') &&
    renderer.includes('LandingPagePublicMetaProvider') &&
    renderer.includes('meta={(spec.meta || null)'),
  'shared meta provider wraps public/preview/canvas render tree',
);

gate(
  'BUG03_INLINE_TEXT_PUBLIC',
  /const textStyle\s*=\s*handlers\?\.getTextStyle[\s\S]*?\?\? publicMeta\?\.inlineTextStyles\[styleKey\]/.test(
    ux,
  ) &&
    /if\s*\(!handlers\)\s*\{[\s\S]*mergeFieldStyle\(\)/.test(ux),
  'InlineEditable !handlers merges toolbar textStyle from public meta',
);

gate(
  'BUG04_ELEMENT_FREE_PUBLIC',
  /useCanvasElementFreeDrag[\s\S]*publicMeta\?\.elementFreeLayouts/.test(ux) &&
    /if\s*\(!handlers\)\s*\{[\s\S]*data-lp-element-id=\{\`\$\{blockId\}::\$\{element\}\`\}[\s\S]*shellStyle/.test(
      ux,
    ) &&
    /if\s*\(!handlers\)\s*\{[\s\S]*elementFreeDrag\.shellStyle/.test(ux),
  'ElementChrome + InlineEditable apply offset freeLayoutStyle without handlers',
);

gate(
  'BUG05_HEADLINES_INLINE_EDITABLE',
  /function SectionHead[\s\S]*blockId \? \([\s\S]*<InlineEditable[\s\S]*handlers=\{canvas\}/.test(
    renderer,
  ) &&
    /const renderHeadline[\s\S]*<InlineEditable[\s\S]*field="headline"/.test(renderer) &&
    /const renderSub[\s\S]*<InlineEditable[\s\S]*field="subheadline"/.test(renderer) &&
    !/function SectionHead[\s\S]*blockId && canvas \?/.test(renderer) &&
    !/const renderHeadline[\s\S]*canvas \? \([\s\S]*<InlineEditable[\s\S]*\) : \(\s*<h1/.test(
      renderer,
    ),
  'SectionHead + Hero headlines always use InlineEditable (data-lp-element-id)',
);

gate(
  'BLOCKS_COVERED',
  // Hero / CTA / Guarantee / LeadForm / Benefits(SectionHead) / Pricing / Image(ElementChrome)
  renderer.includes("field=\"headline\"") &&
    renderer.includes('case \'CTA\'') &&
    renderer.includes('case \'Guarantee\'') &&
    renderer.includes('case \'LeadForm\'') &&
    renderer.includes('case \'Pricing\'') &&
    renderer.includes('ListCards') &&
    /wrapVisual[\s\S]*<ElementChrome[\s\S]*element="image"/.test(renderer) &&
    /case 'LeadForm'[\s\S]*<ElementChrome[\s\S]*handlers=\{null\}/.test(renderer),
  'Hero, Benefits/List, Pricing, CTA, Guarantee, LeadForm, Image use shared primitives',
);

gate(
  'NO_NEW_RENDERER',
  !fs.existsSync(path.join(root, 'apps/web/src/components/landing-pages/landing-page-public-renderer.tsx')) &&
    renderer.includes('export function LandingPageRenderer') &&
    ux.includes('export function InlineEditable') &&
    ux.includes('export function ElementChrome'),
  'reuses LandingPageRenderer + InlineEditable + ElementChrome',
);

gate(
  'CUSTOM_CSS_SELECTOR_ATTR',
  ux.includes('data-lp-element-id={`${blockId}::${element}`}') &&
    renderer.includes('buildPageCustomCssBlocks') &&
    /if\s*\(!handlers\)\s*\{[\s\S]*data-lp-element-id=\{\`\$\{blockId\}::\$\{element\}\`\}/.test(ux),
  'public nodes expose data-lp-element-id for injected custom CSS',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of Object.keys(gates)) {
  console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'BUILDER_PREVIEW_PUBLIC_PARITY=FAIL' : 'BUILDER_PREVIEW_PUBLIC_PARITY=PASS');
process.exit(failed.length ? 1 : 0);
