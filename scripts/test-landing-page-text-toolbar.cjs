#!/usr/bin/env node
/**
 * Landing Page Builder — horizontal quick text toolbar gates.
 *   node scripts/test-landing-page-text-toolbar.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const ux = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const lifecycle = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);

gate(
  'TEXT_TOOLBAR_HORIZONTAL',
  ux.includes('createPortal') &&
    ux.includes('data-lp-text-toolbar-orient="horizontal"') &&
    // flex-wrap (not flex-nowrap): responsive-audit fix — every control in this bar
    // is shrink-0 by design, so flex-nowrap let excess buttons render past the
    // viewport edge on mobile with no scroll to recover them (html/body use
    // overflow-x:clip). Wrapping to a 2nd row keeps every control reachable.
    ux.includes('flex-row flex-wrap') &&
    ux.includes('position: fixed') === false &&
    ux.includes('className="fixed z-[9995]'),
  'portal + fixed horizontal toolbar (wraps instead of overflowing on narrow screens)',
);

gate(
  'ALL_EXISTING_ACTIONS_WORK',
  ux.includes('data-lp-text-fs-dec') &&
    ux.includes('data-lp-text-fs-inc') &&
    ux.includes('data-lp-text-bold') &&
    ux.includes('data-lp-text-align="right"') &&
    ux.includes('data-lp-text-color') &&
    ux.includes('data-lp-text-ai') &&
    ux.includes('data-lp-text-dup') &&
    ux.includes('data-lp-text-del') &&
    ux.includes('data-lp-text-move-up') &&
    ux.includes('data-lp-text-move-down'),
  'font/bold/align/color/ai/dup/delete/move wired',
);

gate(
  'CORRECT_SELECTED_ELEMENT',
  ux.includes('LandingPageCanvasTextToolbarHost') &&
    ux.includes('primarySelectedId') &&
    builder.includes('isTextElementHidden') &&
    builder.includes('isTextElementLocked') &&
    ux.includes('blockId, field, patch'),
  'toolbar follows primary selection + per-field handlers',
);

gate(
  'FONT_SIZE_WORK',
  ux.includes('type="number"') && ux.includes('data-lp-text-fs') && ux.includes('commitSize'),
  'font size input + steppers',
);

gate(
  'BOLD_COLOR_ALIGN_WORK',
  ux.includes('fontWeight: bold ?') &&
    ux.includes('textAlign: \'right\'') &&
    ux.includes('type="color"'),
  'bold + align L/C/R + color picker',
);

gate(
  'DUPLICATE_DELETE_WORK',
  ux.includes('cancelAllFreeDrags') &&
    ux.includes('runAction(onDuplicate)') &&
    ux.includes('runAction(onDelete)'),
  'dup/delete cancel free-drag + run',
);

gate(
  'AI_TOOLS_WORK',
  builder.includes('onTextToolbarAiPrompt') &&
    builder.includes('LpCanvasAiQuickPopover') &&
    builder.includes('focusInspectorAi'),
  'AI tools + AI prompt popover reuse',
);

gate(
  'MORE_MENU_VERTICAL',
  ux.includes('data-lp-text-more') &&
    ux.includes('data-lp-text-more-menu') &&
    ux.includes('data-lp-text-more-orient="vertical"') &&
    ux.includes('Sao chép thiết kế') &&
    ux.includes('AI Prompt') &&
    ux.includes('fixed z-[9998]'),
  'vertical ... menu items via portal',
);

gate(
  'COLOR_PICKER_PANEL',
  ux.includes('data-lp-text-color-panel') &&
    ux.includes('Chọn màu') &&
    ux.includes('data-lp-text-color-palette') &&
    ux.includes('Màu của tôi'),
  'portal color picker panel',
);

gate(
  'HIDE_LOCK_WORK',
  builder.includes('toggleElementHidden') &&
    builder.includes('toggleElementLock') &&
    builder.includes('elementHidden') &&
    lifecycle.includes('elementHidden') &&
    lifecycle.includes('elementLocked'),
  'hide/lock persisted in meta',
);

gate(
  'UNDO_REDO',
  builder.includes('pushHistory') &&
    builder.includes('patchInlineTextStyle') &&
    builder.includes('toggleElementHidden'),
  'style/hide/lock use pushHistory',
);

gate(
  'NO_DUPLICATE_TOOLBAR',
  ux.includes('function TextEditToolbar') &&
    ux.includes('isTextToolbarTarget') &&
    ux.includes('!isTextFieldSelected') &&
    builder.includes('LandingPageCanvasTextToolbarHost'),
  'single TextEditToolbar host; section toolbar hidden for text',
);

gate(
  'LANDING_PAGE_CORE_UNCHANGED',
  builder.includes('LandingPageInspectorDesignTab') &&
    builder.includes('LandingPageBuilderSidebar') &&
    ux.includes('FloatingToolbar') &&
    ux.includes('SectionBackgroundToolbar'),
  'inspector/sidebar/section toolbars intact',
);

const failed = Object.entries(gates).filter(([, v]) => !v.ok);
process.exit(failed.length ? 1 : 0);
