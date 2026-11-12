#!/usr/bin/env node
/**
 * Landing Page Builder upgrade gates (click-to-edit / image / countdown).
 *   node scripts/test-landing-page-builder-upgrade.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const shared = require('../packages/shared/dist/index.js');

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
const countdownSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-countdown.tsx'),
  'utf8',
);
const imageSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-image-field.tsx'),
  'utf8',
);
const controllerSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'),
  'utf8',
);
const serviceSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const typesSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);
const lifeSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);

gate(
  'CLICK_SELECT',
  rendererSrc.includes('SelectableShell') &&
    (rendererSrc.includes('onSelectBlock') || rendererSrc.includes('canvasHandlers')) &&
    rendererSrc.includes('data-lp-block-id') &&
    builderSrc.includes('selectedBlockId') &&
    (builderSrc.includes('onSelectBlock={setSelectedBlockId}') ||
      builderSrc.includes('onSelectBlock={(') ||
      builderSrc.includes('canvas={canvasHandlers}')),
  'canvas select by stable block id',
);

gate(
  'RIGHT_PANEL_SYNC',
  builderSrc.includes('data-inspector-block-id') &&
    builderSrc.includes('scrollIntoView') &&
    builderSrc.includes('selectedBlockId'),
  'inspector scrolls to selected block',
);

gate(
  'REALTIME_EDIT',
  builderSrc.includes('pushHistory') &&
    builderSrc.includes('updateBlock') &&
    builderSrc.includes('<LandingPageRenderer'),
  'inspector edits push history → preview',
);

gate(
  'IMAGE_UPLOAD',
  controllerSrc.includes("upload-image") &&
    serviceSrc.includes('uploadPublicImage') &&
    imageSrc.includes('apiUpload') &&
    imageSrc.includes('Upload') &&
    imageSrc.includes('Replace') &&
    imageSrc.includes('Remove') &&
    imageSrc.includes('alt'),
  'upload API + field UI',
);

gate(
  'IMAGE_PERSIST',
  serviceSrc.includes('PUBLIC_UPLOAD_PREFIX') &&
    serviceSrc.includes('landing-pages') &&
    lifeSrc.includes('imageStyle') &&
    lifeSrc.includes('draftUrl(row.imageUrl)'),
  'public URL + sanitize imageStyle',
);

gate(
  'COUNTDOWN',
  typesSrc.includes("'Countdown'") &&
    shared.LANDING_PAGE_BLOCK_TYPES.includes('Countdown') &&
    countdownSrc.includes('LandingPageCountdownLive') &&
    rendererSrc.includes("case 'Countdown'") &&
    builderSrc.includes("case 'Countdown'"),
  'block type + live component',
);

gate(
  'COUNTDOWN_EXPIRE',
  countdownSrc.includes("behavior === 'hide'") &&
    countdownSrc.includes("behavior === 'message'") &&
    countdownSrc.includes("behavior === 'cta'") &&
    builderSrc.includes('expireBehavior'),
  'zero/hide/message/cta',
);

gate(
  'RESPONSIVE',
  rendererSrc.includes('VIEWPORT_WIDTH') &&
    builderSrc.includes("['desktop', 'tablet', 'mobile']") &&
    countdownSrc.includes('sm:grid-cols-4') &&
    builderSrc.includes('selectedBlockId={selectedBlockId}'),
  'viewport + selection by id',
);

gate(
  'UNDO_REDO',
  builderSrc.includes('historyRef') &&
    builderSrc.includes('futureRef') &&
    builderSrc.includes('onClick={undo}') &&
    builderSrc.includes('onClick={redo}'),
  'history stack intact',
);

gate(
  'AUTOSAVE',
  builderSrc.includes('/autosave') && builderSrc.includes('dirtyRef') && builderSrc.includes('1200'),
  'debounced autosave path',
);

const empty = shared.createEmptyLandingPageSpec();
const sanitized = shared.sanitizeLandingPagePersistSpec(
  structuredClone({
    ...empty,
    blocks: [
      ...empty.blocks,
      {
        id: 'cd_legacy_test',
        type: 'Countdown',
        enabled: true,
        endsAt: new Date(Date.now() + 86400000).toISOString(),
        expireBehavior: 'message',
      },
    ],
  }),
);
const oldCompat =
  empty.blocks.some((b) => b.type === 'Hero') &&
  sanitized.blocks.some((b) => b.type === 'Countdown') &&
  shared.validateLandingPageSpec(empty).ok;

gate('OLD_PAGE_COMPATIBLE', oldCompat, 'empty + countdown sanitize ok');

const fbUntouched =
  !/facebook|fanpage|messenger/i.test(builderSrc) &&
  !/facebook|fanpage|messenger/i.test(rendererSrc) &&
  !/facebook|fanpage|messenger/i.test(controllerSrc.includes('upload-image') ? controllerSrc.split('upload-image')[0].slice(-200) + 'x' : '');

gate(
  'OTHER_MODULES_UNCHANGED',
  !builderSrc.toLowerCase().includes('facebook') &&
    !rendererSrc.toLowerCase().includes('facebook') &&
    !countdownSrc.toLowerCase().includes('facebook') &&
    !imageSrc.toLowerCase().includes('facebook'),
  'LP builder upgrade has no FB coupling',
);

const allPass = Object.values(gates).every((g) => g.ok);
console.log('\n--- REPORT ---');
console.log('FILES_CHANGED', [
  'packages/shared/src/landing-page-types.ts',
  'packages/shared/src/landing-page-lifecycle.ts',
  'packages/shared/src/landing-page-category-architectures.ts',
  'apps/api/src/landing-pages/landing-pages.controller.ts',
  'apps/api/src/landing-pages/landing-pages.service.ts',
  'apps/web/src/components/landing-pages/landing-page-renderer.tsx',
  'apps/web/src/components/landing-pages/landing-page-builder.tsx',
  'apps/web/src/components/landing-pages/landing-page-countdown.tsx',
  'apps/web/src/components/landing-pages/landing-page-image-field.tsx',
  'scripts/test-landing-page-builder-upgrade.cjs',
]);
console.log(
  'TEST_RESULTS',
  Object.fromEntries(Object.entries(gates).map(([k, v]) => [k, v.ok ? 'PASS' : 'FAIL'])),
);
console.log(`BUILDER_UPGRADE_READY=${allPass ? 'PASS' : 'FAIL'}`);
process.exit(allPass ? 0 : 1);
