#!/usr/bin/env node
/**
 * Landing Page — Section mẫu production readiness (stale addBlocks + Guarantee body + overlay z).
 *   node scripts/test-landing-page-section-presets-fix.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const canvas = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

const addBlocksFn = builder.match(/function addBlocks\([\s\S]*?\n  function addBlock/);
const addSrc = addBlocksFn ? addBlocksFn[0] : '';

gate(
  'CLICK_INSERT_SPEC_REF',
  addSrc.includes('const current = specRef.current') &&
    addSrc.includes('const blocks = [...current.blocks]') &&
    addSrc.includes('sanitizeLandingPageDraftSpec({ ...current, blocks })') &&
    !addSrc.includes('[...spec.blocks]') &&
    !addSrc.includes('{ ...spec, blocks }'),
  'addBlocks uses specRef.current — no stale closure spec',
);

gate(
  'TEN_PRESETS',
  [
    'hero-cta',
    'hero-benefits-cta',
    'benefits-features',
    'pricing-testimonials',
    'faq-leadform',
    'product-pricing-cta',
    'video-cta',
    'countdown-leadform',
    'social-proof-cta',
    'conversion-core',
  ].every((id) => sidebar.includes(`id: '${id}'`)) &&
    sidebar.includes('social-proof-cta') &&
    /types:\s*\['Testimonials',\s*'Guarantee',\s*'CTA'\]/.test(sidebar),
  '10 presets present; social-proof-cta = Testimonials+Guarantee+CTA',
);

gate(
  'GUARANTEE_DEFAULT_BODY',
  /type === 'Guarantee'[\s\S]{0,200}body:/.test(builder) ||
    (builder.includes("type === 'Guarantee'") &&
      builder.includes('Đảm bảo chất lượng dịch vụ') &&
      builder.includes("type === 'Guarantee' ? 'Cam kết của chúng tôi'")),
  'defaultBlock(Guarantee) has non-empty body',
);

gate(
  'GUARANTEE_PUBLIC_RENDER',
  renderer.includes("case 'Guarantee':") &&
    renderer.includes("mode === 'public' && !(block.body || '').trim()") &&
    builder.includes('Đảm bảo chất lượng dịch vụ') &&
    /case 'Guarantee':[\s\S]{0,800}InlineEditable/.test(renderer),
  'Guarantee has body default + editable; public only hides empty body',
);

gate(
  'OVERLAY_NOT_COVER_INSPECTOR',
  /zIndex:\s*56/.test(builder) &&
    /zIndex:\s*55/.test(sidebar) &&
    /zIndex:\s*60/.test(builder),
  'docked inspector z=56 > toolbar portal 55; floating stays 60',
);

gate(
  'ONE_HISTORY_ENTRY',
  addSrc.includes('pushHistory(sanitizeLandingPageDraftSpec({ ...current, blocks })') &&
    (addSrc.match(/pushHistory/g) || []).length === 1,
  'one pushHistory per addBlocks call',
);

gate(
  'ORDER_PRESERVED',
  addSrc.includes('insertAt += 1') && addSrc.includes('blocks.splice(insertAt, 0, block)'),
  'preset types inserted in order',
);

gate(
  'SECTION_PRESET_DND',
  sidebar.includes("kind: 'section-preset'") &&
    sidebar.includes('data-lp-sidebar-draggable="section-preset"') &&
    builder.includes("case 'section-preset':") &&
    builder.includes("select: 'first'") &&
    canvas.includes('data-lp-drop-edge'),
  'Section mẫu supports drag & drop with drop-edge index',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  failed.length ? 'SECTION_PRESET_PROD_READY=FAIL' : 'SECTION_PRESET_PROD_READY=PASS',
);
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + g.detail);
}
process.exit(failed.length ? 1 : 0);
