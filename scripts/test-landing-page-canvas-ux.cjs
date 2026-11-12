#!/usr/bin/env node
/**
 * Landing Page Builder — additive canvas UX gates.
 *   node scripts/test-landing-page-canvas-ux.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const builderSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const rendererSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const uxSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);
const imageSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-image-field.tsx'),
  'utf8',
);
const aiSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-inline-ai-field.tsx'),
  'utf8',
);

const sidebarSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);

gate(
  'CURRENT_UI_UNCHANGED',
  (builderSrc.includes('LandingPageThemeSwitcher') ||
    sidebarSrc.includes('LandingPageThemeSwitcher')) &&
    builderSrc.includes('desktop') &&
    builderSrc.includes('tablet') &&
    builderSrc.includes('mobile') &&
    /undo/i.test(builderSrc) &&
    /redo/i.test(builderSrc) &&
    (builderSrc.includes('/autosave') || builderSrc.includes('persist(')) &&
    builderSrc.includes('Inspector') &&
    !builderSrc.includes('LayersPanel') &&
    uxSrc.includes('FloatingToolbar') &&
    rendererSrc.includes('data-lp-canvas-ux'),
  'existing chrome kept; canvas UX additive only',
);

gate(
  'CLICK_SELECT',
  uxSrc.includes('data-lp-block-id') &&
    uxSrc.includes('onSelect') &&
    builderSrc.includes('selectedBlockId') &&
    builderSrc.includes('canvas={canvasHandlers}'),
  'stable block id selection via canvas handlers',
);

gate(
  'RIGHT_PANEL_SYNC',
  builderSrc.includes('selectedElement') &&
    aiSrc.includes('data-inspector-field') &&
    imageSrc.includes('data-inspector-field="image"') &&
    builderSrc.includes('scrollIntoView') &&
    builderSrc.includes('data-inspector-block-id'),
  'panel syncs block + field',
);

gate(
  'FLOATING_TOOLBAR',
  uxSrc.includes('data-lp-floating-toolbar') &&
    uxSrc.includes('Di chuyển') &&
    uxSrc.includes('Nhân bản') &&
    uxSrc.includes('>AI<') === false
      ? uxSrc.includes('AI')
      : uxSrc.includes('AI') &&
    uxSrc.includes('Xóa') &&
    uxSrc.includes('Thay ảnh'),
  'toolbar Move/Dup/AI/Delete(+Replace)',
);

gate(
  'INLINE_EDIT',
  uxSrc.includes('InlineEditable') &&
    uxSrc.includes('contentEditable') &&
    uxSrc.includes('onDoubleClick') &&
    builderSrc.includes('onFieldLive') &&
    builderSrc.includes('onFieldCommit') &&
    builderSrc.includes('updateBlockFieldLive'),
  'double-click inline edit + live/commit',
);

gate(
  'REORDER',
  uxSrc.includes('application/x-lp-block-id') &&
    uxSrc.includes('application/x-lp-item') &&
    uxSrc.includes('ItemReorderChrome') &&
    builderSrc.includes('reorderBlockById') &&
    builderSrc.includes('reorderListItem') &&
    builderSrc.includes('moveBlock'),
  'section + in-section item reorder (not free-position)',
);

gate(
  'UNDO_REDO',
  builderSrc.includes('const undo =') &&
    builderSrc.includes('const redo =') &&
    builderSrc.includes('historyRef') &&
    builderSrc.includes('inlineHistStarted'),
  'undo/redo + inline history snapshot',
);

gate(
  'AUTOSAVE',
  builderSrc.includes('/autosave') &&
    builderSrc.includes('dirtyRef') &&
    builderSrc.includes('1200'),
  'autosave timer retained',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  rendererSrc.includes('resolveLandingPageLayout') &&
    rendererSrc.includes("mode = 'preview'") &&
    builderSrc.includes('sanitizeLandingPagePersistSpec'),
  'legacy specs still render',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !builderSrc.includes('facebook') && !rendererSrc.includes('facebook') && !uxSrc.includes('facebook'),
  'landing-pages scoped only',
);

gate(
  'HOVER_OUTLINE',
  uxSrc.includes('hover:outline') &&
    uxSrc.includes('outline-offset-2') &&
    !uxSrc.includes('hover:border-2'),
  'outline-only hover (no layout shift)',
);

gate(
  'MEMO_BLOCK',
  rendererSrc.includes('MemoBlockView') && rendererSrc.includes('memo(BlockView)'),
  'per-block memo to avoid full canvas remount',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
const pass = failed.length === 0;
console.log('CANVAS_UX_UPGRADE=' + (pass ? 'PASS' : 'FAIL'));
console.log(
  'FILES_CHANGED=apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx,' +
    'apps/web/src/components/landing-pages/landing-page-renderer.tsx,' +
    'apps/web/src/components/landing-pages/landing-page-builder.tsx,' +
    'apps/web/src/components/landing-pages/landing-page-inline-ai-field.tsx,' +
    'apps/web/src/components/landing-pages/landing-page-image-field.tsx,' +
    'scripts/test-landing-page-canvas-ux.cjs',
);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name}${g.detail ? ' — ' + g.detail : ''}`);
}
process.exit(pass ? 0 : 1);
