#!/usr/bin/env node
/**
 * Gate: 10 countdown launch templates in Bộ hẹn giờ library + insert path.
 *   node scripts/test-landing-page-countdown-library.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const types = read('packages/shared/src/landing-page-types.ts');
const presets = read('packages/shared/src/landing-page-countdown-presets.ts');
const life = read('packages/shared/src/landing-page-lifecycle.ts');
const foundation = read('packages/shared/src/landing-page-template-foundation.ts');
const clock = read('apps/web/src/components/landing-pages/landing-page-countdown.tsx');
const launch = read('apps/web/src/components/landing-pages/landing-page-countdown-launch.tsx');
const library = read('apps/web/src/components/landing-pages/landing-page-countdown-library.tsx');
const modal = read('apps/web/src/components/landing-pages/landing-page-element-library-modal.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const panel = read('apps/web/src/components/landing-pages/landing-page-add-components-panel.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const css = read('apps/web/src/components/landing-pages/landing-page-countdown.css');

const IDS = [
  'amethyst-flip',
  'champagne-editorial',
  'cyan-grid',
  'emerald-halo',
  'copper-ember',
  'rose-glass',
  'silver-minimal',
  'cobalt-orbit',
  'lime-terminal',
  'opal-ribbon',
];

let fail = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fail += 1;
}

gate(
  'TEN_STYLE_IDS',
  IDS.every((id) => types.includes(`'${id}'`)) &&
    types.includes('LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS') &&
    IDS.every((id) => presets.includes(`id: '${id}'`)),
  'types + preset catalog list all 10 mockup ids',
);

gate(
  'SANITIZE_KEEPS_LAUNCH',
  life.includes('LANDING_PAGE_COUNTDOWN_STYLES') &&
    life.includes('showSignup') &&
    life.includes('formHeadline') &&
    life.includes('kicker'),
  'draft sanitize persists launch countdown fields',
);

gate(
  'VARIANT_REGISTRY',
  IDS.every((id) => foundation.includes(`'${id}'`)),
  'block variant registry accepts launch skins',
);

gate(
  'CLOCK_SKINS',
  clock.includes('LaunchClock') &&
    css.includes("data-clock='amethyst-flip'") &&
    css.includes("data-clock='lime-terminal'") &&
    css.includes("data-clock='opal-ribbon'") &&
    css.includes('lp-cd-flip') &&
    css.includes('lp-cd-halo') &&
    css.includes('lp-cd-led'),
  'live clock faces match 10 mockup skins',
);

gate(
  'LAUNCH_SECTION',
  launch.includes('data-lp-countdown-launch') &&
    launch.includes('data-lp-countdown-form') &&
    launch.includes('Đăng ký nhận thông báo') &&
    renderer.includes('LandingPageCountdownLaunch') &&
    renderer.includes('isCountdownLaunchStyle'),
  'inserted section is split copy + clock + signup',
);

gate(
  'LIBRARY_PICKER',
  library.includes('data-lp-countdown-library') &&
    library.includes('data-lp-countdown-template') &&
    library.includes('LP_COUNTDOWN_PRESETS') &&
    modal.includes('LandingPageCountdownLibrary') &&
    modal.includes("picker.type === 'Countdown'") &&
    modal.includes('Thư viện {label}'),
  'drop popup lists the 10 countdown templates',
);

gate(
  'INSERT_PATH',
  builder.includes('function insertCountdownPreset') &&
    builder.includes('function insertCountdownFromLibrary') &&
    builder.includes('function openCountdownLibrary') &&
    builder.includes('onCountdown={(id)=>insertCountdownFromLibrary(id)}') &&
    builder.includes('countdownLaunchInsertPatch') &&
    panel.includes('onOpenCountdownLibrary') &&
    panel.includes("card.blockType === 'Countdown'"),
  'drag or click Bộ hẹn giờ opens library then inserts chosen preset',
);

const thumbsOk = IDS.every((id, i) => {
  const n = String(i + 1).padStart(2, '0');
  const file = path.join(
    root,
    'apps/web/public/landing-page-assets/countdown-library',
    `${n}-${id}.jpg`,
  );
  return fs.existsSync(file) && fs.statSync(file).size > 8_000;
});
gate('LIBRARY_THUMBS', thumbsOk, 'compressed mockup thumbs in public assets');

const dist = path.join(root, 'packages/shared/dist/landing-page-countdown-presets.js');
if (fs.existsSync(dist)) {
  const shared = require(dist);
  gate(
    'PRESET_RUNTIME',
    Array.isArray(shared.LP_COUNTDOWN_PRESETS) &&
      shared.LP_COUNTDOWN_PRESETS.length === 10 &&
      typeof shared.countdownLaunchInsertPatch === 'function' &&
      shared.isCountdownLaunchStyle('amethyst-flip') &&
      !shared.isCountdownLaunchStyle('boxes'),
    'shared preset helpers',
  );
  const sample = shared.countdownLaunchInsertPatch(shared.LP_COUNTDOWN_PRESETS[0], {});
  gate(
    'INSERT_PATCH',
    sample.styleVariant === 'amethyst-flip' &&
      sample.showSignup === true &&
      sample.headline === 'Đếm ngược đến ngày ra mắt',
    'library insert patch copies mockup copy',
  );
}

if (fail) process.exit(1);
console.log('\ncountdown library gates OK');
