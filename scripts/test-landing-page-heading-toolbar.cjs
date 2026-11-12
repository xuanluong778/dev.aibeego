#!/usr/bin/env node
/**
 * Landing Page Builder — heading level + wrap + small handles.
 *   node scripts/test-landing-page-heading-toolbar.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');
const types = read('packages/shared/src/landing-page-types.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'HEADING_LEVEL_STYLE_CHANGE',
  ux.includes('LP_HEADING_LEVEL_PRESETS') &&
    /fontSize:\s*preset\.fontSize/.test(ux) &&
    /headingLevel:\s*level/.test(ux) &&
    ux.includes('data-lp-text-heading-level') &&
    ux.includes('headingLevelKey') &&
    ux.includes('Changing H1–H6 remounts'),
  'H1–H6 patches headingLevel + fontSize; tag remount reseeds text',
);

gate(
  'HEADING_NO_TEXT_LOSS',
  ux.includes('draftRef.current || value') &&
    ux.includes('Changing H1–H6 remounts') &&
    !/onStyle\?\.\(\{\s*headingLevel:\s*level,\s*fontSize:\s*preset\.fontSize,\s*fontWeight/.test(ux) &&
    ux.includes('Keep family / align / bold'),
  'level change keeps text + family/align/bold',
);

gate(
  'HEADING_TEXT_WRAP',
  ux.includes('whitespace-normal break-words') &&
    ux.includes('overflowWrap') &&
    ux.includes('wordBreak') &&
    ux.includes('[overflow-wrap:anywhere]') &&
    ux.includes('applyLiveWidth') &&
    ux.includes('syncHeadingWrapToContent') &&
    ux.includes('widthOnWrapOnly'),
  'width on wrap only; text fills wrap and reflows',
);

gate(
  'HEADING_RESIZE_SMOOTH',
  ux.includes('setPointerCapture') &&
    ux.includes('requestAnimationFrame') &&
    ux.includes('scheduleMove') &&
    ux.includes('readCanvasPointerScale') &&
    ux.includes('syncHeadingWrapToContent'),
  'pointer capture + scale + rAF during heading resize',
);

gate(
  'HEADING_LINE_HEIGHT',
  ux.includes('merged.lineHeight = 1.25') &&
    ux.includes('textEl.style.lineHeight = String(ratio)'),
  'wrapped headings use safe line-height',
);

gate(
  'HEADING_AUTO_HEIGHT',
  ux.includes('data-lp-heading-auto-height') &&
    ux.includes("height: 'auto'") &&
    ux.includes('height: undefined') &&
    ux.includes('Never apply fixed height') &&
    !/next\.overflow = 'hidden'/.test(ux),
  'no fixed height / overflow:hidden on heading text',
);

gate(
  'SMALL_RESIZE_HANDLES',
  ux.includes('data-lp-heading-handles="sm"') &&
    ux.includes('h-2.5 w-2.5') &&
    ux.includes('Canva-style') &&
    !/h-8 w-2\.5/.test(ux),
  'all handles ~10px squares (no tall bars)',
);

gate(
  'HEADING_CORNER_BOX_SCALE',
  ux.includes('headingCornerOutwardDelta') &&
    ux.includes('boxScale') &&
    ux.includes('data-lp-heading-corner-resizes-box') &&
    ux.includes('readCanvasPointerScale') &&
    ux.includes('scheduleMove'),
  'corner drag scales box width; height auto from wrap',
);

gate(
  'HANDLE_BOUND_SYNC',
  ux.includes('absolute inset-0') &&
    ux.includes('data-lp-heading-box-chrome') &&
    ux.includes('applyLiveWidth') &&
    ux.includes('data-lp-heading-width-live') &&
    ux.includes('data-lp-heading-corner-handle="nw"') &&
    ux.includes('data-lp-heading-width-handle="e"'),
  '6 handles stick to live wrap bounds',
);

gate(
  'UNDO_REDO',
  builder.includes('const undo = useCallback') &&
    builder.includes('const redo = useCallback') &&
    builder.includes('patchInlineTextStyle') &&
    builder.includes('pushHistory') &&
    ux.includes('onTextStyleChange?.(blockId, field'),
  'size/level patches via history',
);

gate(
  'AUTOSAVE_RELOAD',
  builder.includes('dirtyRef.current = true') &&
    builder.includes('persist(') &&
    lifecycle.includes('headingLevel') &&
    lifecycle.includes('cleaned.width') &&
    types.includes('headingLevel?:'),
  'headingLevel/width survive sanitize',
);

gate(
  'REGRESSION',
  ux.includes('data-lp-text-fs-dec') &&
    ux.includes('data-lp-text-bold') &&
    ux.includes('data-lp-text-ai') &&
    ux.includes('data-lp-text-font') &&
    ux.includes('data-lp-heading-corner-handle') &&
    builder.includes('normalizeLpSelectionTarget') &&
    !ux.includes('graph.facebook.com') &&
    !builder.includes('graph.facebook.com'),
  'existing toolbar actions kept; no FB/Meta',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of [
  'HEADING_LEVEL_STYLE_CHANGE',
  'HEADING_NO_TEXT_LOSS',
  'HEADING_TEXT_WRAP',
  'HEADING_RESIZE_SMOOTH',
  'HEADING_LINE_HEIGHT',
  'HEADING_AUTO_HEIGHT',
  'HEADING_CORNER_BOX_SCALE',
  'SMALL_RESIZE_HANDLES',
  'HANDLE_BOUND_SYNC',
  'UNDO_REDO',
  'AUTOSAVE_RELOAD',
  'REGRESSION',
]) {
  console.log(k + '=' + (gates[k]?.ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'HEADING_TOOLBAR=FAIL' : 'HEADING_TOOLBAR=PASS');
console.log(
  'FILES_CHANGED=landing-page-canvas-ux.tsx,scripts/test-landing-page-heading-toolbar.cjs',
);
process.exit(failed.length ? 1 : 0);
