import {
  sanitizeTextBoxChrome,
  textBoxChromeCss,
  textBoxHideAttrs,
} from '../packages/shared/dist/landing-page-text-box.js';
import { sanitizeLandingPagePersistSpec } from '../packages/shared/dist/landing-page-lifecycle.js';

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exitCode = 1;
  } else {
    console.log('PASS', msg);
  }
}

const kept = sanitizeTextBoxChrome({
  background: '#292020ff',
  paddingOn: false,
  padding: { t: 6, r: 8, b: 0, l: 4, linked: false },
  borderOn: false,
  border: { width: 4, style: 'dashed', color: '#ffc700' },
  radiusOn: true,
  radius: { tl: 40, tr: 10, br: 8, bl: 2, linked: false },
  shadowOn: true,
  shadow: { x: -12, y: 6, blur: 20, spread: 2, color: '#000000', opacity: 0.4 },
  mediaOn: false,
  mediaUrl: 'https://cdn.example.com/a.png',
  mediaFit: 'contain',
  mediaPosition: 'top',
  visibility: 'mobile',
});

assert(kept.paddingOn === false && kept.padding.l === 4, 'padding toggle off keeps sides');
assert(kept.border.style === 'dashed' && kept.border.width === 4, 'border config kept while off');
assert(kept.shadow.x === -12, 'shadow X can be negative');
assert(kept.mediaUrl.startsWith('https://'), 'media url kept while toggle off');

const cssOff = textBoxChromeCss(kept);
assert(!cssOff.padding && !cssOff.border && !cssOff.backgroundImage, 'off toggles do not paint');
assert(cssOff.borderRadius.includes('40px'), 'radius still paints when on');
assert(cssOff.boxShadow.startsWith('-12px'), 'shadow css uses negative X');

const cssOn = textBoxChromeCss({ ...kept, paddingOn: true, borderOn: true, mediaOn: true });
assert(cssOn.padding === '6px 8px 0px 4px', 'unlinked padding');
assert(cssOn.border.includes('dashed'), 'dashed border');
assert(cssOn.backgroundImage.includes('https://cdn.example.com/a.png'), 'background image on the box');
assert(!('color' in cssOn) && !('fontSize' in cssOn), 'box css does not set text properties');

const mobile = textBoxHideAttrs({ visibility: 'mobile' });
assert(mobile['data-lp-text-hide-desktop'] === '1' && mobile['data-lp-text-hide-mobile'] === undefined, 'mobile uses desktop+tablet hide');
const desktop = textBoxHideAttrs({ visibility: 'desktop' });
assert(desktop['data-lp-text-hide-mobile'] === '1' && !desktop['data-lp-text-hide-desktop'], 'desktop hides mobile+tablet');

const round = sanitizeLandingPagePersistSpec({
  theme: 'MODERN',
  blocks: [
    {
      id: 'hero1',
      type: 'Hero',
      enabled: true,
      headline: 'Xin chào',
    },
  ],
  meta: {
    inlineTextStyles: {
      'hero1::headline': {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#111111',
        box: kept,
      },
    },
  },
});
const saved = round.meta.inlineTextStyles['hero1::headline'];
assert(saved.fontSize === 36 && saved.fontWeight === 'bold' && saved.color === '#111111', 'font fields survive save');
assert(saved.box.shadow.x === -12 && saved.box.padding.l === 4 && saved.box.visibility === 'mobile', 'box survives save');
const sized = sanitizeLandingPagePersistSpec({
  theme: 'MODERN',
  blocks: [{ id: 'hero1', type: 'Hero', enabled: true, headline: 'Xin chào' }],
  meta: { inlineTextStyles: { 'hero1::headline': { width: 320, height: 140, fontSize: 24 } } },
});
assert(
  sized.meta.inlineTextStyles['hero1::headline'].width === 320 &&
    sized.meta.inlineTextStyles['hero1::headline'].height === 140,
  'text box width/height survive persist sanitizer',
);
assert(sanitizeTextBoxChrome({ mediaUrl: 'javascript:alert(1)' })?.mediaUrl == null, 'reject script urls');

if (process.exitCode) process.exit(process.exitCode);
console.log('text box OK');
