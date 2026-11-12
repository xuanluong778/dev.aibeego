#!/usr/bin/env node
/**
 * Landing Page Builder — mobile/tablet device frame gates.
 *   node scripts/test-landing-page-device-frame.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const frame = read('apps/web/src/components/landing-pages/landing-page-device-frame.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const renderer = read('apps/web/src/components/landing-pages/landing-page-renderer.tsx');
const publicClient = read('apps/web/src/components/landing-pages/public-landing-page-client.tsx');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'MOBILE_DEVICE_FRAME',
  frame.includes('data-lp-device-frame') &&
    frame.includes('data-lp-device-notch') &&
    frame.includes('data-lp-device-screen') &&
    frame.includes('390') &&
    frame.includes('844') &&
    builder.includes('LandingPageDeviceFrame') &&
    builder.includes('device={viewport}') &&
    builder.includes("viewport === 'desktop'"),
  'Builder wraps mobile/tablet in iPhone-style frame 390x844 + notch',
);

gate(
  'MOBILE_REAL_VIEWPORT',
  renderer.includes('LP_VIEWPORT_SIM_CSS') &&
    renderer.includes('lp-viewport-sim-css') &&
    renderer.includes('grid-template-columns: minmax(0, 1fr)') &&
    renderer.includes('[data-lp-viewport="mobile"]') &&
    renderer.includes("mobile: '390px'"),
  'Viewport sim CSS forces real mobile breakpoint (1-col), not desktop scale-down',
);

gate(
  'MOBILE_SCROLL',
  frame.includes('data-lp-device-no-inner-scroll') &&
    !frame.includes('data-lp-device-scroll="1"') &&
    !frame.includes('overflow-y-auto') &&
    frame.includes('overflow-y-visible') &&
    builder.includes('data-lp-canvas-scroll') &&
    builder.includes('overflow-y-auto'),
  'No inner device scroll; outer canvas scrolls vertically',
);

gate(
  'NO_HORIZONTAL_OVERFLOW',
  frame.includes('overflow-x-hidden') &&
    renderer.includes('overflow-x: hidden') &&
    renderer.includes('max-width: 100%'),
  'No horizontal overflow guards on frame + sim CSS',
);

gate(
  'TEXT_WRAP',
  renderer.includes('overflow-wrap: anywhere') &&
    renderer.includes('word-break: break-word'),
  'Headings/text wrap on mobile viewport sim',
);

gate(
  'PUBLISH_NO_DEVICE_FRAME',
  !publicClient.includes('LandingPageDeviceFrame') &&
    !publicClient.includes('data-lp-device-frame') &&
    publicClient.includes('LandingPageRenderer') &&
    !/viewport=\{['"]mobile['"]\}/.test(publicClient),
  'Public/publish client has no device frame chrome',
);

gate(
  'DESKTOP_TABLET_UNCHANGED',
  builder.includes("viewport === 'desktop'") &&
    builder.includes('<LandingPageDeviceFrame device={viewport}>') &&
    renderer.includes("tablet: '768px'") &&
    frame.includes('tablet: { width: 768') &&
    frame.includes('data-lp-device-camera') &&
    frame.includes("'mobile' | 'tablet'"),
  'Desktop keeps bare canvas; tablet uses device frame + 768 width',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('\nFAILED:', failed.join(', '));
  process.exit(1);
}
console.log('\nALL_DEVICE_FRAME_GATES_PASS');
process.exit(0);
