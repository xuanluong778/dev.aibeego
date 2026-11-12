#!/usr/bin/env node
/**
 * Save vs Xem live look-parity.
 *   node scripts/test-landing-page-live-parity.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');
const toolbar = read('apps/web/src/components/landing-pages/landing-page-builder-toolbar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const publicPage = read('apps/web/src/app/p/[slug]/page.tsx');
const previewPage = read('apps/web/src/app/p/preview/[token]/page.tsx');
const publicApi = read('apps/web/src/lib/landing-page-public-api.ts');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const svc = read('apps/api/src/landing-pages/landing-pages.service.ts');

gate(
  'PERSIST_FULL_THEME_TOKENS',
  lifecycle.includes('function sanitizePersistedThemeTokens') &&
    lifecycle.includes('sanitizePersistedThemeTokens(tokensIn, preset, theme)') &&
    lifecycle.includes('density') &&
    lifecycle.includes('imageTreatment') &&
    lifecycle.includes('containerWidth') &&
    lifecycle.includes('fontSizeHero'),
  'persist keeps catalog visual tokens, not only 12 color fields',
);

gate(
  'XEM_LIVE_PUBLISHES_FIRST',
  toolbar.includes('onViewLive') &&
    toolbar.includes('data-lp-public-link') &&
    !toolbar.includes('href={`/p/${publicSlug}`}') &&
    builder.includes('async function viewLive()') &&
    builder.includes('const slug = await publish()') &&
    builder.includes('onViewLive={() => void viewLive()}'),
  'Xem live persist+publish then opens /p/slug instead of stale publishedSpec',
);

gate(
  'PUBLIC_API_INTERNAL',
  publicApi.includes('API_INTERNAL_URL') &&
    publicApi.includes("'http://127.0.0.1:4000'") &&
    publicPage.includes('landingPagePublicApiBase()') &&
    previewPage.includes('landingPagePublicApiBase()') &&
    !publicPage.includes('127.0.0.1:4010') &&
    !previewPage.includes('127.0.0.1:4010'),
  'public SSR fetches docker API, not leftover host Next :4010',
);

gate(
  'PUBLIC_TITLE_FONTS',
  /useEffect\(\(\) => \{\s*const styles = \(spec\.meta/.test(renderer) &&
    !renderer.includes('if (!interactive && mode !== \'preview\') return;'),
  'public mode loads custom title fonts like the builder',
);

gate(
  'PUBLIC_KEEPS_THEME_PRESET',
  svc.includes('themePreset') &&
    !/themePreset:\s*_themePreset/.test(svc) &&
    !/themeUserLocked:\s*_themeUserLocked/.test(svc),
  'toPublicSpec keeps themePreset / themeUserLocked',
);

let runtimeOk = false;
let runtimeDetail = 'shared dist not loaded';
try {
  const shared = require(path.join(root, 'packages/shared/dist/index.js'));
  const spec = shared.createEmptyLandingPageSpec('MODERN');
  spec.themeTokens = {
    ...spec.themeTokens,
    density: 'spacious',
    imageTreatment: 'editorial',
    containerWidth: '68rem',
    fontSizeHero: 'clamp(2rem, 5vw, 4rem)',
    buttonStyle: 'outline',
  };
  const out = shared.sanitizeLandingPagePersistSpec(spec);
  runtimeOk =
    out.themeTokens.density === 'spacious' &&
    out.themeTokens.imageTreatment === 'editorial' &&
    out.themeTokens.containerWidth === '68rem' &&
    out.themeTokens.fontSizeHero === 'clamp(2rem, 5vw, 4rem)' &&
    out.themeTokens.buttonStyle === 'outline';
  runtimeDetail = runtimeOk
    ? 'persist round-trip keeps visual tokens'
    : JSON.stringify({
        density: out.themeTokens.density,
        imageTreatment: out.themeTokens.imageTreatment,
        containerWidth: out.themeTokens.containerWidth,
        fontSizeHero: out.themeTokens.fontSizeHero,
        buttonStyle: out.themeTokens.buttonStyle,
      });
} catch (e) {
  runtimeDetail = e instanceof Error ? e.message : String(e);
}

gate('PERSIST_RUNTIME_TOKENS', runtimeOk, runtimeDetail);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of Object.keys(gates)) {
  console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'LIVE_PARITY=FAIL' : 'LIVE_PARITY=PASS');
process.exit(failed.length ? 1 : 0);
