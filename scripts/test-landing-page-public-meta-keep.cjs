#!/usr/bin/env node
/**
 * BUG-01 public-api-strips-meta — keep canvas render meta on public/preview.
 *   node scripts/test-landing-page-public-meta-keep.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

const hasHelper = svc.includes('private toPublicSpec(');
const usesInSlug =
  /getPublicBySlug[\s\S]{0,800}?this\.toPublicSpec\(parsed\)/.test(svc);
const usesInPreview =
  /getPublicByPreviewToken[\s\S]{0,1400}?this\.toPublicSpec\(parsed\)/.test(svc);

gate(
  'SHARED_TO_PUBLIC_SPEC',
  hasHelper && usesInSlug && usesInPreview,
  'getPublicBySlug + getPublicByPreviewToken share toPublicSpec',
);

gate(
  'STRIP_PROVENANCE_ONLY',
  hasHelper &&
    svc.includes('fieldSources:') &&
    svc.includes('profileAppliedAt:') &&
    svc.includes('lastAiAt:') &&
    svc.includes('clientRevision:') &&
    svc.includes('gallery:') &&
    svc.includes('...safeMeta') &&
    !/themePreset:\s*_themePreset/.test(svc) &&
    !/themeUserLocked:\s*_themeUserLocked/.test(svc),
  'blocklist strips builder provenance keys only — keep themePreset for live look',
);

gate(
  'KEEP_CANVAS_META',
  hasHelper &&
    !/meta:\s*\{\s*\.\.\.\(layout\s*\?\s*\{\s*layout/.test(svc) &&
    svc.includes('keep inlineTextStyles') &&
    svc.includes('safeMeta'),
  'no longer allowlists only layout/category',
);

gate(
  'NO_ALLOWLIST_REGRESSION',
  (svc.match(/this\.toPublicSpec\(parsed\)/g) || []).length >= 2 &&
    !svc.includes('KEEP layout +\n    // category so public render'),
  'both public entrypoints use shared helper',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
for (const k of Object.keys(gates)) {
  console.log(k + '=' + (gates[k].ok ? 'PASS' : 'FAIL'));
}
console.log(failed.length ? 'BUG_01=FAIL' : 'BUG_01=PASS');
console.log(
  'FILES_CHANGED=apps/api/src/landing-pages/landing-pages.service.ts,scripts/test-landing-page-business-profile.cjs,scripts/test-landing-page-public-meta-keep.cjs',
);
process.exit(failed.length ? 1 : 0);
