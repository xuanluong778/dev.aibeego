#!/usr/bin/env node
/**
 * Regression: draft vs persist sanitize for Landing Page text input.
 * Live typing must keep trailing/mid spaces; persist trims edges only.
 */
const {
  createEmptyLandingPageSpec,
  sanitizeLandingPageDraftSpec,
  sanitizeLandingPagePersistSpec,
  sanitizeLandingPageSpec,
} = require('../packages/shared/dist/index.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exitCode = 1;
    return false;
  }
  console.log('PASS', msg);
  return true;
}

// Simulate live typing: raw state then optional draft sanitize (structural)
function typeSequence(start, chunks) {
  let text = start;
  for (const c of chunks) text += c;
  return text;
}

const base = createEmptyLandingPageSpec();

// 1) "Hello " → continue "World" → "Hello World"
{
  let live = { ...base, blocks: base.blocks.map((b, i) => (i === 0 ? { ...b, headline: 'Hello ' } : b)) };
  assert(
    sanitizeLandingPageDraftSpec(live).blocks[0].headline === 'Hello ',
    '1a draft keeps trailing space after Hello',
  );
  live = {
    ...live,
    blocks: live.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: typeSequence('Hello ', ['W', 'o', 'r', 'l', 'd']) } : b,
    ),
  };
  assert(live.blocks[0].headline === 'Hello World', '1b live typing Hello World');
  assert(
    sanitizeLandingPagePersistSpec(live).blocks[0].headline === 'Hello World',
    '1c persist keeps mid spaces',
  );
}

// 2) Vietnamese with trailing space then continue
{
  const mid = {
    ...base,
    blocks: base.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: 'dịch vụ SEO ' } : b,
    ),
  };
  assert(
    sanitizeLandingPageDraftSpec(mid).blocks[0].headline === 'dịch vụ SEO ',
    '2a draft keeps Vietnamese + trailing space',
  );
  mid.blocks[0].headline = 'dịch vụ SEO chuyên nghiệp';
  assert(
    sanitizeLandingPagePersistSpec(mid).blocks[0].headline === 'dịch vụ SEO chuyên nghiệp',
    '2b Vietnamese diacritics preserved on persist',
  );
}

// 3) Multiple mid spaces must not glue words
{
  const multi = {
    ...base,
    blocks: base.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: 'Hello   World' } : b,
    ),
  };
  assert(
    sanitizeLandingPageDraftSpec(multi).blocks[0].headline === 'Hello   World',
    '3a draft keeps multi mid-spaces',
  );
  assert(
    sanitizeLandingPagePersistSpec(multi).blocks[0].headline === 'Hello   World',
    '3b persist does not collapse mid-spaces',
  );
}

// 4) Autosave response must not overwrite typing (contract: persist != live when trailing space)
{
  const typing = {
    ...base,
    blocks: base.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: 'Xin chào ' } : b,
    ),
  };
  const wire = sanitizeLandingPagePersistSpec(typing);
  assert(wire.blocks[0].headline === 'Xin chào', '4a persist trims edge for DB');
  assert(typing.blocks[0].headline === 'Xin chào ', '4b live draft unchanged after persist clone');
  // Simulated: editor keeps `typing`, never setSpec(wire)
  assert(
    typing.blocks[0].headline !== wire.blocks[0].headline,
    '4c autosave payload differs from live — client must not overwrite caret/text',
  );
}

// 5) Reload / persist removes edge junk, keeps content
{
  const dirty = {
    ...base,
    seo: {
      ...base.seo,
      title: '  Landing  Page  ',
      metaDescription: '  Mô tả có dấu  ',
    },
    blocks: base.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: '  Tiêu đề chính  ' } : b,
    ),
  };
  const reloaded = sanitizeLandingPagePersistSpec(dirty);
  assert(reloaded.seo.title === 'Landing  Page', '5a reload SEO title edge-trimmed, mid spaces kept');
  assert(reloaded.seo.metaDescription === 'Mô tả có dấu', '5b reload meta edge-trimmed');
  assert(reloaded.blocks[0].headline === 'Tiêu đề chính', '5c reload headline edge-trimmed');
}

// 6) Publish path = default sanitize = persist (public render gets clean edges)
{
  const pubIn = {
    ...base,
    blocks: base.blocks.map((b, i) =>
      i === 0 ? { ...b, headline: ' Publish me ', subheadline: 'OK ' } : b,
    ),
  };
  const published = sanitizeLandingPageSpec(pubIn); // default persist
  assert(published.blocks[0].headline === 'Publish me', '6a default sanitize is persist trim');
  assert(published.blocks[0].subheadline === 'OK', '6b publish subheadline trimmed');
  assert(
    sanitizeLandingPagePersistSpec(pubIn).blocks[0].headline === published.blocks[0].headline,
    '6c persist alias matches default',
  );
}

// URL draft/persist still usable
{
  base.blocks[0].ctaUrl = 'https://';
  assert(
    sanitizeLandingPageDraftSpec(base).blocks[0].ctaUrl === 'https://',
    'URL in-progress kept on draft',
  );
  assert(
    sanitizeLandingPagePersistSpec(base).blocks[0].ctaUrl === 'https://',
    'URL in-progress kept on persist (no block wipe)',
  );
  base.blocks[0].ctaUrl = '#lead-form';
  assert(sanitizeLandingPagePersistSpec(base).blocks[0].ctaUrl === '#lead-form', 'hash URL kept');
}

if (process.exitCode) {
  console.error('SPACE_INPUT_REGRESSION=FAIL');
  process.exit(1);
}
console.log('SPACE_INPUT_REGRESSION=PASS');
