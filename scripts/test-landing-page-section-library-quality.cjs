/** Catalog quality + version isolation, independent from any customer database. */
const assert = require('node:assert/strict'),
  fs = require('fs'),
  path = require('path'),
  Module = require('module'),
  ts = require('typescript');
const root = path.resolve(__dirname, '..'),
  cache = new Map();
function load(rel) {
  const file = path.resolve(root, rel);
  if (cache.has(file)) return cache.get(file);
  const m = new Module(file, module);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  const original = m.require.bind(m);
  m.require = (n) =>
    n.startsWith('.') && fs.existsSync(path.resolve(path.dirname(file), n + '.ts'))
      ? load(path.relative(root, path.resolve(path.dirname(file), n + '.ts')))
      : original(n);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    file,
  );
  cache.set(file, m.exports);
  return m.exports;
}
const dir = 'apps/web/src/components/landing-pages/',
  catalog = load(dir + 'landing-page-section-library-catalog.ts'),
  context = load(dir + 'landing-page-section-library-context.ts'),
  shared = require('../packages/shared/dist');
function luminance(hex) {
  return hex
    .match(/[0-9a-f]{2}/gi)
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
}
const ratio = (a, b) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
let seq = 0;
const uid = (p) => p + '_' + ++seq,
  fixtures = [];
for (const template of catalog.LP_SECTION_LIBRARY_TEMPLATES) {
  const block = catalog.materializeSectionLibraryTemplate(template, uid),
    ctx = context.readSectionLibraryContext(block),
    tokens = ctx.themeTokens;
  assert.equal(ctx.version, 2);
  assert.equal(ctx.presentation.revision, 2);
  assert.ok(ctx.presentation.columns >= 1 && ctx.presentation.columns <= 4);
  for (const bg of [tokens.background, tokens.surface]) {
    assert.ok(ratio(tokens.text, bg) >= 7, template.id + ' body text contrast');
    assert.ok(ratio(tokens.muted, bg) >= 4.5, template.id + ' muted text contrast');
  }
  const black = ratio(tokens.button, '#102a2c'),
    white = ratio(tokens.button, '#ffffff');
  assert.ok(Math.max(black, white) >= 4.5, template.id + ' button contrast');
  if(['alternating','image-left','image-right'].includes(ctx.presentation.layout) && template.blockType !== 'Hero') assert.ok(template.patch.items.every(x=>x.imageUrl),template.id+' image layout must include images');
  const copy = JSON.stringify(template.patch);
  assert.ok(
    !/Tính năng \d|Dịch vụ \d|Ý chính \d|Mô tả ngắn|Hook ngắn|Inspector|Full viewport|CTA rõ|hierarchy|brand color|dQw4w9WgXcQ|\bLorem\b/i.test(
      copy,
    ),
    template.id + ' finished copy',
  );
  const spec = shared.sanitizeLandingPagePersistSpec({
    ...shared.createBlankLandingPageSpec(),
    blocks: [block],
  });
  assert.equal(spec.blocks.length, 1, template.id + ' valid block');
  assert.deepEqual(
    context.readSectionLibraryContext(spec.blocks[0]),
    ctx,
    template.id + ' context roundtrip',
  );
  const media = [
    template.patch.imageUrl,
    template.patch.posterUrl,
    ...(template.patch.items || []).map((x) => x.imageUrl),
  ].filter(Boolean);
  for (const url of media) {
    assert.ok(url.startsWith('/landing-page-assets/section-library-v2/'));
    assert.ok(fs.existsSync(path.join(root, 'apps/web/public', url)));
  }
  if (block.type === 'Video')
    assert.ok(fs.existsSync(path.join(root, 'apps/web/public', block.videoUrl)));
  const duplicate = shared.duplicateBlock(spec.blocks[0]);
  assert.notEqual(duplicate.id, block.id);
  assert.deepEqual(duplicate.style.lpSectionLibrary, block.style.lpSectionLibrary);
  fixtures.push({ id: template.id, label: template.label, category: template.category, spec });
}
const hero = catalog.LP_SECTION_LIBRARY_TEMPLATES.find((t) => t.id === 'hero-10');
assert.equal(hero.presentation.tone, 'dark');
assert.ok(ratio(hero.previewTokens.text, hero.patch.background) > 10);
const oldPath = process.env.LP_SECTION_OLD_CATALOG;
if (oldPath) {
  const old = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  for (const t of old) {
    const b = catalog.materializeSectionLibraryTemplate(t, uid);
    assert.equal(context.readSectionLibraryContext(b).version, 1);
    assert.equal(b.style.lpSectionLibrary.presentation, undefined);
    assert.deepEqual(b.style.lpSectionLibrary.themeTokens, t.previewTokens);
  }
}
assert.equal(
  context.readSectionLibraryContext(shared.createBlankLandingPageSpec().blocks[0]),
  null,
);
assert.equal(catalog.LP_SECTION_LIBRARY_TEMPLATES.length, 100);
if (process.env.LP_SECTION_QUALITY_FIXTURES)
  fs.writeFileSync(process.env.LP_SECTION_QUALITY_FIXTURES, JSON.stringify(fixtures));
console.log(
  'PASS 100 finished templates, text contrast >= 4.5/7, local image/video assets, correct dark hero, save/duplicate and v1 isolation',
);
