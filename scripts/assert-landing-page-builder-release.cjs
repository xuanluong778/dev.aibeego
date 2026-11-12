const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
function assertLandingPageBuilderSource(root = path.join(__dirname, '..')) {
  const base = path.join(root, 'apps/web/src/components/landing-pages');
  for (const [file, markers] of Object.entries({
    'landing-page-builder.tsx': [
      'LandingPageElementLibraryModal',
      'sectionInsertCommitRef',
      'openLibraryAfterDrop',
      "case 'add-picker-open':",
      'const inspectorPanelWidthPx = INSPECTOR_PANEL_WIDTH',
      'w-[320px]',
      'Paragraph / title text layers and section-inserted elements',
    ],
    'landing-page-section-library-modal.tsx': [
      'data-lp-section-library-lightbox',
      'data-lp-section-library-preview-btn',
    ],
    'landing-page-text-library.tsx': ['data-lp-text-library-card', 'data-lp-text-category'],
    'landing-page-sidebar-drop-indicator.tsx': [
      'data-lp-drop-bar',
      'data-lp-drop-orientation',
      'data-lp-drop-plus',
      '2px dashed #2563EB',
    ],
    'landing-page-draft-recovery.ts': ['landingDraftsHaveSameContent', 'serverSpec'],
    'landing-page-section-insert-target.ts': ['never clamp a toolbar into content'],
    'landing-page-canvas-zoom.tsx': ['DESKTOP_FIT_SCALE = 1', 'DESKTOP_SCROLL_PAD_PX = 0'],
    'landing-page-inspector-rail.tsx': ['INSPECTOR_PANEL_WIDTH = 320'],
    'landing-page-countdown-library.tsx': [
      'data-lp-countdown-library',
      'data-lp-countdown-template',
    ],
  })) {
    const source = fs.readFileSync(path.join(base, file), 'utf8');
    for (const marker of markers)
      assert(
        source.includes(marker),
        `Builder release missing ${file}: ${marker}. Sync current Builder source before building.`,
      );
  }
  const builder = fs.readFileSync(path.join(base, 'landing-page-builder.tsx'), 'utf8');
  assert(!builder.includes('LandingPageBuilderVersionNotice'), 'Builder update popup must remain disabled');
  assert(
    !builder.includes('Chọn một mẫu bên phải để chèn vào vị trí thả'),
    'Refusing old sidebar-only picker implementation',
  );
  assert(
    !builder.includes("insertParagraphPreset(LP_PARAGRAPH_PRESETS[0]!, pos)"),
    'Text drop must open the template popup instead of auto-inserting a paragraph',
  );
  assert(
    builder.includes("openAddPickerFromDrop(payload.picker, pos, payload.initialTab)"),
    'Element drop must open the library picker',
  );
}
function assertLandingPageBuilderBundle(dir) {
  const chunks = [];
  function walk(p) {
    for (const f of fs.readdirSync(p, { withFileTypes: true })) {
      const n = path.join(p, f.name);
      if (f.isDirectory()) walk(n);
      else if (n.endsWith('.js')) chunks.push(fs.readFileSync(n, 'utf8'));
    }
  }
  walk(path.join(dir, 'static/chunks'));
  const code = chunks.join('\n');
  assert(!code.includes('data-lp-builder-version-notice'), 'Builder update popup must not ship');
  assert(!code.includes('lp-builder-version-dismissed'), 'Builder version polling must not ship');
  for (const marker of [
    'data-lp-element-library-modal',
    'data-lp-text-library-card',
    'data-lp-drop-bar',
    'data-lp-native-item-cell',
    'data-lp-native-empty-column',
    'grid-row:auto!important',
    ':not(button):not([data-lp-transform-chrome])',
    'min-height:min-content!important',
    'data-lp-countdown-library',
    'data-lp-countdown-template',
    'data-lp-countdown-launch',
  ])
    assert(code.includes(marker), `Release artifact missing Builder marker ${marker}`);
}
module.exports = { assertLandingPageBuilderSource, assertLandingPageBuilderBundle };
if (require.main === module) {
  assertLandingPageBuilderSource();
  if (process.argv[2]) assertLandingPageBuilderBundle(path.resolve(process.argv[2]));
  console.log('PASS current Builder source/release features');
}
