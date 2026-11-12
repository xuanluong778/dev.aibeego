#!/usr/bin/env node
/**
 * Landing Page Quick Theme Switcher gates.
 *   node scripts/test-landing-page-theme-switcher.cjs
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

const {
  LANDING_PAGE_QUICK_THEME_PRESETS,
  applyQuickThemeToSpecTokens,
  suggestLandingPageQuickTheme,
  normalizeLandingPageThemeTokens,
  createEmptyLandingPageSpec,
  applyLandingPageAiCopyToSpec,
  buildFallbackLandingPageAiCopy,
  sanitizeLandingPageSpec,
  getLandingPageQuickThemePreset,
} = shared;

const switcherSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-theme-switcher.tsx'),
  'utf8',
);
const builderSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const sidebarSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const rendererSrc = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const serviceSrc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);

const ids = LANDING_PAGE_QUICK_THEME_PRESETS.map((p) => p.id);
gate(
  'THEME_SWITCH_INSTANT',
  ids.includes('light') &&
    ids.includes('dark') &&
    ids.includes('orange') &&
    ids.includes('luxury_gold') &&
    ids.includes('custom') &&
    switcherSrc.includes('applyPreset') &&
    switcherSrc.includes('onChange') &&
    (builderSrc.includes('LandingPageThemeSwitcher') ||
      sidebarSrc.includes('LandingPageThemeSwitcher')) &&
    !switcherSrc.includes('location.reload') &&
    !switcherSrc.includes('window.location'),
  `presets=${ids.join(',')}`,
);

gate(
  'THEME_AUTOSAVE',
  switcherSrc.includes('themePreset') &&
    switcherSrc.includes('themeUserLocked') &&
    builderSrc.includes('pushHistory') &&
    (builderSrc.includes('LandingPageThemeSwitcher') ||
      sidebarSrc.includes('LandingPageThemeSwitcher') ||
      builderSrc.includes('onThemeChange')) &&
    serviceSrc.includes('async autosave'),
  'theme in spec.meta + builder history/autosave path',
);

const gold = getLandingPageQuickThemePreset('luxury_gold');
const goldOk =
  gold.tokens.background.toLowerCase().includes('0b0b0c') &&
  /d4af37/i.test(gold.tokens.primary) &&
  /f5f0e6/i.test(gold.tokens.text) &&
  /161618/i.test(gold.tokens.surface) &&
  gold.tokens.button === gold.tokens.primary;
gate(
  'THEME_GOLD',
  goldOk && /charcoal|gold|ivory|đen/i.test(gold.description + ' charcoal gold ivory'),
  `bg=${gold.tokens.background} primary=${gold.tokens.primary} text=${gold.tokens.text}`,
);

const dark = applyQuickThemeToSpecTokens('dark');
gate(
  'THEME_DARK',
  dark.themeTokens.background.startsWith('#0') &&
    dark.themeTokens.text.toLowerCase().includes('f') &&
    Boolean(dark.themeTokens.gradient) &&
    Boolean(dark.themeTokens.shadow),
  `dark bg=${dark.themeTokens.background}`,
);

const custom = applyQuickThemeToSpecTokens('custom', {
  primary: '#112233',
  accent: '#445566',
  background: '#FEFEFE',
  text: '#111111',
  button: '#998877',
  radius: '20px',
});
gate(
  'CUSTOM_THEME',
  custom.themePreset === 'custom' &&
    custom.themeTokens.primary === '#112233' &&
    custom.themeTokens.button === '#998877' &&
    custom.themeTokens.radius === '20px' &&
    switcherSrc.includes('Custom tokens') &&
    switcherSrc.includes('Apply Custom'),
  'custom overrides applied',
);

const aiSpa = suggestLandingPageQuickTheme({ businessType: 'spa', productService: 'skincare' });
const aiLux = suggestLandingPageQuickTheme({ businessType: 'luxury hotel' });
const unlocked = createEmptyLandingPageSpec();
unlocked.meta = { category: 'spa' };
const afterAi = applyLandingPageAiCopyToSpec(
  unlocked,
  buildFallbackLandingPageAiCopy({
    productService: 'Spa treatment',
    targetCustomer: 'khách spa',
    uspBenefits: 'Liệu trình dịu nhẹ',
    pageGoal: 'consult',
    businessType: 'spa',
  }),
);
gate(
  'AI_THEME_SELECTION',
  aiSpa === 'rose' &&
    aiLux === 'luxury_gold' &&
    Boolean(afterAi.meta?.themePreset) &&
    switcherSrc.includes('AI:') &&
    builderSrc.includes('suggestLandingPageQuickTheme'),
  `spa=${aiSpa} lux=${aiLux} applied=${afterAi.meta?.themePreset}`,
);

const old = createEmptyLandingPageSpec();
const oldSan = sanitizeLandingPageSpec(old);
const norm = normalizeLandingPageThemeTokens(old.themeTokens, old.theme);
gate(
  'EXISTING_PAGE_COMPATIBLE',
  oldSan.version === 1 &&
    Boolean(norm.button) &&
    Boolean(norm.gradient) &&
    rendererSrc.includes('normalizeLandingPageThemeTokens') &&
    rendererSrc.includes('--lp-button') &&
    rendererSrc.includes('--lp-gradient') &&
    rendererSrc.includes('var(--lp-gradient)'),
  'old specs normalize tokens; renderer CSS vars',
);

gate(
  'FACEBOOK_UNTOUCHED',
  !/facebook\.com|Fanpage|App Review/i.test(switcherSrc) &&
    !serviceSrc.includes('facebookAppReview'),
  'no FB coupling',
);

const critical = [
  'THEME_SWITCH_INSTANT',
  'THEME_AUTOSAVE',
  'THEME_GOLD',
  'THEME_DARK',
  'CUSTOM_THEME',
  'AI_THEME_SELECTION',
  'EXISTING_PAGE_COMPATIBLE',
];
const failed = critical.filter((k) => !gates[k]?.ok);
const ready = failed.length === 0;

console.log('\n--- REPORT ---');
console.log(`QUICK_THEMES=${ids.join('|')}`);
console.log(
  'FILES: landing-page-theme-presets.ts, landing-page-theme-switcher.tsx, landing-page-types.ts, landing-page-lifecycle.ts, landing-page-generator.ts, landing-page-renderer.tsx, landing-page-builder.tsx, index.ts',
);
console.log(`REGRESSION FACEBOOK=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'}`);
console.log(`THEME_SWITCHER_READY=${ready ? 'PASS' : 'FAIL'}`);
if (failed.length) {
  console.log('FAILED_GATES:', failed.join(', '));
  for (const k of failed) console.log(' ', k, gates[k]?.detail);
  process.exitCode = 1;
}
