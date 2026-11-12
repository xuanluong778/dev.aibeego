/**
 * ZIP pack checks: structure, path safety, format version, round-trip.
 * Run: node --experimental-strip-types scripts/test-landing-page-template-pack.ts
 */
import assert from 'node:assert/strict';
import {
  TEMPLATE_PACK_FORMAT,
  TEMPLATE_PACK_FORMAT_VERSION,
  TemplatePackError,
  buildStoredZip,
  isPlatformAdmin,
  parseTemplatePack,
  stripSensitiveKeys,
} from '../apps/api/src/landing-pages/template-pack.ts';

function pack(files: Record<string, string | Buffer>) {
  return buildStoredZip(
    Object.entries(files).map(([name, data]) => ({
      name,
      data: Buffer.isBuffer(data) ? data : Buffer.from(data),
    })),
  );
}

const manifest = {
  format: TEMPLATE_PACK_FORMAT,
  formatVersion: TEMPLATE_PACK_FORMAT_VERSION,
  slug: 'agency-cursor-demo',
  name: 'Agency Cursor Demo',
  category: 'agency',
  theme: 'MODERN',
  description: 'Demo',
  tags: ['badge:new'],
};

const template = {
  version: 1,
  theme: 'MODERN',
  blocks: [
    { id: 'hero-1', type: 'Hero', enabled: true, headline: 'Xin chào' },
    {
      id: 'form-1',
      type: 'LeadForm',
      enabled: true,
      fields: [{ id: 'email', type: 'email', label: 'Email', required: true }],
    },
  ],
  password: 'must-not-survive',
};

function okPack() {
  return pack({
    'manifest.json': JSON.stringify(manifest),
    'template.json': JSON.stringify(template),
    'README.md': '# hi',
    'assets/hero.png': Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  });
}

function expectThrow(fn: () => unknown, part: string) {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof TemplatePackError, String(err));
    assert.match(err.message, new RegExp(part));
    return true;
  });
}

const parsed = parseTemplatePack(okPack());
assert.equal(parsed.manifest.slug, 'agency-cursor-demo');
assert.equal(parsed.assets.length, 1);
assert.equal(parsed.assets[0]?.name, 'hero.png');
assert.equal((stripSensitiveKeys(parsed.template) as { password?: string }).password, undefined);
assert.equal((parsed.template.blocks as Array<{ id: string }>)[1]?.id, 'form-1');

expectThrow(() => parseTemplatePack(pack({ 'template.json': '{}' })), 'manifest.json');
expectThrow(
  () =>
    parseTemplatePack(
      pack({
        'manifest.json': JSON.stringify({ ...manifest, formatVersion: 2 }),
        'template.json': JSON.stringify(template),
      }),
    ),
  'Định dạng',
);
expectThrow(
  () =>
    parseTemplatePack(
      pack({
        'manifest.json': JSON.stringify(manifest),
        'template.json': JSON.stringify({ blocks: [{ id: 'a', type: 'Hero' }] }),
      }),
    ),
  'LeadForm',
);
expectThrow(
  () =>
    parseTemplatePack(
      pack({
        'manifest.json': JSON.stringify(manifest),
        'template.json': JSON.stringify(template),
        'assets/../../etc/passwd': 'x',
      }),
    ),
  'nguy hiểm',
);
expectThrow(
  () =>
    parseTemplatePack(
      pack({
        'manifest.json': JSON.stringify(manifest),
        'template.json': JSON.stringify(template),
        'assets/run.js': 'alert(1)',
      }),
    ),
  'không được phép',
);
expectThrow(
  () =>
    parseTemplatePack(
      pack({
        'manifest.json': JSON.stringify(manifest),
        'template.json': JSON.stringify(template),
        'note.html': '<script>',
      }),
    ),
  'không được phép',
);

const htmlZip = parseTemplatePack(
  pack({
    'index.html': '<html><head><title>Mau moi</title></head><body><h1>Giao dien moi</h1><script>alert(1)</script></body></html>',
  }),
);
assert.equal(htmlZip.htmlOnly, true);
assert.equal(htmlZip.manifest.name, 'Mau moi');
assert.match(String((htmlZip.template.meta as { htmlSource: string }).htmlSource), /Giao dien moi/);
assert.doesNotMatch(String((htmlZip.template.meta as { htmlSource: string }).htmlSource), /<script/i);
assert.equal((htmlZip.template.meta as { htmlConverted?: boolean }).htmlConverted, true);
assert.equal((htmlZip.template.meta as { isolatedScriptCount?: number }).isolatedScriptCount, 1);
assert.ok(
  ((htmlZip.template.meta as { htmlImportNotes?: string[] }).htmlImportNotes || []).some((note) =>
    /JavaScript/.test(note),
  ),
);
assert.equal(
  ((htmlZip.template.meta as { htmlSections?: unknown[] }).htmlSections || []).length > 0,
  true,
);
assert.doesNotMatch(
  ((htmlZip.template.meta as { htmlSections?: Array<{ html: string }> }).htmlSections || [])
    .map((row) => row.html)
    .join('\n'),
  /<script/i,
);
assert.ok((htmlZip.template.blocks as Array<{ type: string }>).some((b) => b.type === 'Hero'));
assert.ok((htmlZip.template.blocks as Array<{ type: string }>).some((b) => b.type === 'LeadForm'));

assert.equal(isPlatformAdmin({ role: 'SUPER_ADMIN' }), true);
assert.equal(isPlatformAdmin({ role: 'OWNER', platformRole: 'SUPER_ADMIN' }), true);
assert.equal(isPlatformAdmin({ role: 'OWNER' }), false);
assert.equal(isPlatformAdmin({ role: 'ADMIN' }), false);
assert.equal(isPlatformAdmin(null), false);

console.log('PASS landing template pack');
