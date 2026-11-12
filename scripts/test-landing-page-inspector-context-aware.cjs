#!/usr/bin/env node
/**
 * Gate: LP Builder right inspector — Context-Aware + Advanced accordions
 *   node scripts/test-landing-page-inspector-context-aware.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const design = read('apps/web/src/components/landing-pages/landing-page-inspector-design-tab.tsx');
const ctx = read('apps/web/src/components/landing-pages/landing-page-inspector-context.ts');
const ui = read('apps/web/src/components/landing-pages/landing-page-inspector-ui.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const canvasUx = read('apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx');
const crm = read('apps/web/src/components/landing-pages/lead-form-crm-inspector.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'RIGHT_INSPECTOR_TABS_UNCHANGED',
  builder.includes("label: 'Nội dung'") &&
    builder.includes("label: 'Thiết kế'") &&
    builder.includes("label: 'Nâng cao'") &&
    builder.includes('data-lp-inspector-tabs') &&
    !builder.includes("label: 'Content'") &&
    !builder.includes("label: 'Design'") &&
    !builder.includes("label: 'Advanced'"),
  'tabs remain Nội dung | Thiết kế | Nâng cao',
);

gate(
  'LEFT_SIDEBAR_UNCHANGED',
  sidebar.includes('LP_RAIL_QUICK_INSERT') &&
    sidebar.includes('Thư viện block') &&
    sidebar.includes('data-lp-toolbar-collapse'),
  'left sidebar not the refactor target',
);

gate(
  'CONTEXT_AWARE',
  ctx.includes('resolveInspectorContext') &&
    ctx.includes("'section'") &&
    ctx.includes("'text'") &&
    ctx.includes("'image'") &&
    ctx.includes("'button'") &&
    ctx.includes("'form'") &&
    builder.includes('resolveInspectorContext') &&
    builder.includes('data-lp-context-aware="1"') &&
    design.includes('data-lp-context={ctx.dataAttr}') &&
    design.includes("ctx.kind === 'text'") &&
    design.includes("ctx.kind === 'image'") &&
    design.includes("ctx.kind === 'button'") &&
    design.includes("ctx.kind === 'form'") &&
    design.includes('title="Thiết lập chữ"') &&
    design.includes('title="Kích thước"') &&
    design.includes('title="Viền & bo góc"') &&
    design.includes('title="Đổ bóng"') &&
    design.includes('title="Filter"') &&
    design.includes('title="Transform"') &&
    (design.includes('title="CSS tùy chỉnh"') ||
      design.includes("accordionTitle = 'CSS tùy chỉnh'")) &&
    builder.includes('data-lp-inspector-button-link') &&
    builder.includes('Đổi ảnh') &&
    builder.includes('data-lp-advanced-accordions="1"'),
  'selection drives content/design; design groups context-aware',
);

gate(
  'INLINE_EDIT_UNCHANGED',
  canvasUx.includes('export function InlineEditable') &&
    canvasUx.includes('data-lp-inline-editing') &&
    renderer.includes('InlineEditable'),
  'inline edit on canvas unchanged',
);

gate(
  'CRM_UNCHANGED',
  builder.includes('LeadFormCrmInspector') &&
    builder.includes('data-lp-inspector-crm') &&
    crm.includes('pipeline') &&
    crm.includes('webhook') &&
    (design.includes('data-lp-context="form"') || design.includes("ctx.kind === 'form'")) &&
    (design.includes('CRM nằm tab') || design.includes('CRM ở tab')),
  'FORM → CRM inspector preserved',
);

gate(
  'AUTOSAVE',
  builder.includes('/autosave') &&
    builder.includes('autosaveTimer') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('pushHistory'),
  'autosave wiring intact',
);

gate(
  'UNDO_REDO',
  builder.includes('const undo = useCallback') &&
    builder.includes('Redo') &&
    builder.includes('onClick={undo}') &&
    (builder.includes('historyRef') || builder.includes('setHistory') || builder.includes('pushHistory')),
  'undo/redo intact',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  builder.includes('sanitizeLandingPagePersistSpec') &&
    builder.includes('sanitizeLandingPageDraftSpec') &&
    ctx.includes('Additive') &&
    design.includes('resolveInspectorContext'),
  'sanitize + additive context; no schema break',
);

gate(
  'PREVIEW_PUBLISH',
  builder.includes('LandingPageDraftPreviewPanel') &&
    builder.includes('Publish') &&
    builder.includes('LandingPageVersionHistoryPanel'),
  'preview + publish + versions still wired',
);

gate(
  'NO_OVERFLOW',
  builder.includes('data-lp-inspector-scroll') &&
    builder.includes('overflow-y-auto') &&
    builder.includes('w-[320px]') &&
    builder.includes('data-lp-inspector-sticky'),
  'sticky header + independent scroll ~320px',
);

gate(
  'FIXED_INSPECTOR_WIDTH_X_CLOSE',
  builder.includes('const inspectorPanelWidthPx = INSPECTOR_PANEL_WIDTH') &&
    builder.includes('data-lp-inspector-close') &&
    !builder.includes('if (!primarySelectedId) {\n      setInspectorPanelOpen(false)') &&
    !builder.includes('INSPECTOR_ADD_COMPONENTS_PANEL_WIDTH'),
  'inspector width is constant; X closes; deselect does not',
);

gate(
  'ADVANCED_ACCORDIONS_COLLAPSED',
  builder.includes('title="Responsive"') &&
    builder.includes('title="Vị trí nâng cao"') &&
    builder.includes('title="SEO"') &&
    builder.includes('title="Tracking"') &&
    builder.includes('title="Versions/Preview"') &&
    builder.includes('title="Custom Class/CSS"') &&
    (builder.match(/data-lp="advanced-[^"]+"[\s\S]{0,40}defaultOpen=\{false\}/g) || []).length >= 6 &&
    ui.includes('InspectorAccordion') &&
    ui.includes('defaultOpen = true'),
  '6 advanced accordions default collapsed',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
const core = [
  'RIGHT_INSPECTOR_TABS_UNCHANGED',
  'LEFT_SIDEBAR_UNCHANGED',
  'CONTEXT_AWARE',
  'INLINE_EDIT_UNCHANGED',
  'CRM_UNCHANGED',
  'AUTOSAVE',
  'UNDO_REDO',
  'OLD_PAGE_COMPATIBLE',
  'PREVIEW_PUBLISH',
  'NO_OVERFLOW',
];
const coreFail = core.some((k) => !gates[k]);
console.log('RIGHT_SIDEBAR_OPTIMIZED=' + (coreFail || !gates.ADVANCED_ACCORDIONS_COLLAPSED ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
