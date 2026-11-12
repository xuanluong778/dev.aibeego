#!/usr/bin/env node
/**
 * BUG-08 empty-canvas context menu must not keep prior selectedBlock
 * BUG-09 marquee pointercancel must clear isLpMarqueeSelecting
 *   node scripts/test-landing-page-interaction-p1.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const menu = read('apps/web/src/components/landing-pages/landing-page-canvas-context-menu.tsx');
const ux = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const selection = read('apps/web/src/components/landing-pages/landing-page-canvas-selection.ts');
const drag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

// --- BUG-08 ---
gate(
  'EMPTY_HIT_CLEARS_SELECTION',
  menu.includes('onClearSelection') &&
    /if\s*\(\s*hit\.blockId\s*\)[\s\S]*else\s*\{[\s\S]*onClearSelection\(\)/.test(menu) &&
    builder.includes('onClearSelection: () => deselectCanvas()'),
  'right-click empty canvas calls onClearSelection/deselectCanvas',
);

gate(
  'MENU_ACTIONS_USE_HIT_NOT_STALE_BLOCK',
  menu.includes('menuHit') &&
    menu.includes('menuBlockId') &&
    menu.includes('actBlockId') &&
    /data-lp-cm="delete"[\s\S]*?actBlockId\(\)/.test(menu) &&
    /data-lp-cm="duplicate"[\s\S]*?actBlockId\(\)/.test(menu) &&
    menu.includes('disabled={!menuBlockId}') &&
    !/onSelect=\{\(\)\s*=>\s*block\s*&&\s*actions\.onDelete\(block\.id\)\}/.test(menu) &&
    !/onSelect=\{\(\)\s*=>\s*block\s*&&\s*actions\.onDuplicate\(block\.id\)\}/.test(menu),
  'Delete/Duplicate bind to this-open menuHit, not prior selectedBlock',
);

gate(
  'PARSE_EMPTY_RETURNS_NULL_BLOCK',
  menu.includes('function parseContextTarget') &&
    menu.includes("closest('[data-lp-block-id]')") &&
    /return\s*\{\s*blockId,\s*element:\s*'section'\s*\}/.test(menu),
  'parseContextTarget yields blockId null off-block',
);

// --- BUG-09 ---
const attachSlice = (() => {
  const start = ux.indexOf('const attachMarqueeWin = () =>');
  if (start < 0) return '';
  const end = ux.indexOf('useEffect(', start);
  return end > start ? ux.slice(start, end) : ux.slice(start, start + 1200);
})();

gate(
  'MARQUEE_POINTERCANCEL_CLEARS',
  attachSlice.includes("addEventListener('pointercancel', onUp)") &&
    attachSlice.includes("removeEventListener('pointercancel', onUp)") &&
    attachSlice.includes("addEventListener('pointerup', onUp)") &&
    /onUp[\s\S]*handleSectionPointerUp/.test(attachSlice),
  'attachMarqueeWin treats pointercancel like pointerup',
);

gate(
  'MARQUEE_FLAG_CLEARED_ON_END',
  ux.includes('clearMarquee') &&
    /const clearMarquee = \(\) => \{[\s\S]*setLpMarqueeSelecting\(false\)/.test(ux) &&
    /handleSectionPointerUp[\s\S]*clearMarquee\(\)/.test(ux) &&
    selection.includes('setLpMarqueeSelecting') &&
    drag.includes('isLpMarqueeSelecting()'),
  'clearMarquee resets global flag used by free-drag/select gates',
);

gate(
  'SECTION_SHELL_POINTERCANCEL',
  ux.includes('onPointerCancel={(e) => {\n        handleSectionPointerUp(e.clientX, e.clientY);\n      }}') ||
    /onPointerCancel=\{\(e\)\s*=>\s*\{\s*handleSectionPointerUp\(e\.clientX,\s*e\.clientY\);\s*\}\}/.test(
      ux,
    ),
  'section shell also clears marquee on pointercancel (touch scroll)',
);

gate(
  'REGRESSION_SELECTION_DRAG_INTACT',
  ux.includes('onMarqueeSelect') &&
    ux.includes('armSectionPointer') &&
    ux.includes('isLpMarqueeSelecting()') &&
    builder.includes('onMarqueeSelect') &&
    builder.includes('applyMarqueeSelection') &&
    drag.includes('beginDrag') &&
    menu.includes('onSelectFromTarget'),
  'marquee multi-select + free-drag + context select still wired',
);

const bug08Keys = [
  'EMPTY_HIT_CLEARS_SELECTION',
  'MENU_ACTIONS_USE_HIT_NOT_STALE_BLOCK',
  'PARSE_EMPTY_RETURNS_NULL_BLOCK',
];
const bug09Keys = [
  'MARQUEE_POINTERCANCEL_CLEARS',
  'MARQUEE_FLAG_CLEARED_ON_END',
  'SECTION_SHELL_POINTERCANCEL',
  'REGRESSION_SELECTION_DRAG_INTACT',
];

console.log('');
for (const k of Object.keys(gates)) {
  console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL'));
}
const fail08 = bug08Keys.some((k) => !gates[k].ok);
const fail09 = bug09Keys.some((k) => !gates[k].ok);
console.log(fail08 ? 'BUG_08=FAIL' : 'BUG_08=PASS');
console.log(fail09 ? 'BUG_09=FAIL' : 'BUG_09=PASS');
process.exit(fail08 || fail09 ? 1 : 0);
