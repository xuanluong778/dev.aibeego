const assert = require('node:assert/strict');
const fs = require('fs');
const ts = require('typescript');
const path = require('path');
const shared = require('../packages/shared/dist');
const crypto = require('crypto');
const baseline = require('./fixtures/agency-portfolio/catalog-hashes.json');
const legacyExpected = require('./fixtures/agency-portfolio/legacy-normalized-spec.json');
const pilot = shared.getLandingPageSystemTemplate('agency-portfolio');
const normalize = (t) =>
  JSON.stringify(t, (k, v) =>
    k === 'endsAt'
      ? 'generated-countdown-date'
      : k === 'fields' && Array.isArray(v)
        ? v.map((f) => ({ ...f, id: 'generated-field-id' }))
        : v,
  );
const results = [];
const test = (name, run) => {
  run();
  results.push(name);
  console.log('PASS', name);
};
test('Only agency-portfolio changes in the catalog (199 other templates preserved)', () => {
  const changed = shared.LANDING_PAGE_SYSTEM_TEMPLATES.filter(
    (t) =>
      crypto.createHash('sha256').update(normalize(t)).digest('hex') !== baseline.hashes[t.slug],
  ).map((t) => t.slug);
  assert.deepEqual(changed, ['agency-portfolio']);
});
test('Missing/unknown render version always falls back to legacy; catalogVersion is not a renderer gate', () => {
  for (const version of [undefined, 'future', 'gallery-v21-production-visual-axis'])
    assert.equal(
      shared.isAgencyPortfolioStandard({
        ...pilot.spec,
        meta: { ...pilot.spec.meta, rendererVersion: version },
      }),
      false,
    );
  assert.equal(shared.isAgencyPortfolioStandard(pilot.spec), true);
});
test('Draft, persisted JSON, save/reopen sanitizers preserve the pilot version', () => {
  let copy = JSON.parse(JSON.stringify(pilot.spec));
  for (const f of [
    shared.sanitizeLandingPageDraftSpec,
    shared.sanitizeLandingPagePersistSpec,
    shared.sanitizeLandingPageSpec,
  ]) {
    copy = f(copy);
    assert.equal(copy.meta.rendererVersion, 'agency-portfolio-v2');
  }
  assert.equal(copy.blocks.length, 11);
});
test('Old saved page normalization matches the pre-change source exactly', () => {
  const fixture = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'fixtures/agency-portfolio/legacy-spec.json')),
  );
  fixture.meta.inlineTextStyles = {
    [fixture.blocks[0].id + '::headline']: { color: '#123456', fontSize: 47 },
  };
  assert.deepEqual(
    JSON.parse(JSON.stringify(shared.sanitizeLandingPagePersistSpec(fixture))),
    legacyExpected,
  );
  assert.equal(fixture.meta.rendererVersion, undefined);
});
test('Creation seed excludes tenant templates, managed packs, unknown catalogs and HTML', () => {
  const old = require('./fixtures/agency-portfolio/legacy-spec.json');
  const row = { slug: 'agency-portfolio', isSystem: true, organizationId: null };
  assert.equal(
    shared.agencyPortfolioCreationSeed(row, old, pilot.spec).meta.rendererVersion,
    'agency-portfolio-v2',
  );
  for (const identity of [
    { ...row, isSystem: false },
    { ...row, organizationId: 'tenant' },
    { ...row, managed: true },
    { ...row, slug: 'agency-portfolio-gallery' },
  ])
    assert.equal(shared.agencyPortfolioCreationSeed(identity, old, pilot.spec), old);
  for (const spec of [
    { ...old, meta: { ...old.meta, catalogVersion: 'unknown' } },
    { ...old, meta: { ...old.meta, htmlSource: '<html></html>' } },
  ])
    assert.equal(shared.agencyPortfolioCreationSeed(row, spec, pilot.spec), spec);
});
test('Clone keeps copy/media, block/item customizations, responsive styles and CTA references with fresh IDs', () => {
  const spec = structuredClone(pilot.spec);
  spec.meta.fieldSources = { 'agency-hero.headline': 'user' };
  spec.meta.inlineTextStyles = { 'agency-hero::headline': { color: '#123456' } };
  spec.meta.responsiveInlineTextStyles = { 'agency-hero::headline': { mobile: { fontSize: 31 } } };
  spec.meta.elementFreeLayouts = {
    'agency-gallery::item:demo-web': { x: 4, y: 7, width: 200, height: 100 },
  };
  spec.blocks[1].ctaUrl = '#agency-form';
  spec.blocks[4].style = {
    elementCustomCss: { 'itemTitle:demo-web': 'color: #ff0000;' },
    lpItemBoxes: { 'demo-web': { backgroundOn: true, background: '#ffeeee' } },
  };
  const before = JSON.stringify(spec);
  const copy = shared.cloneLandingPageSpecWithNewIds(spec);
  assert.equal(JSON.stringify(spec), before);
  assert.notEqual(copy.blocks[1].id, spec.blocks[1].id);
  assert.equal(copy.blocks[1].headline, spec.blocks[1].headline);
  assert.equal(copy.blocks[1].imageUrl, spec.blocks[1].imageUrl);
  assert.equal(copy.blocks[1].ctaUrl, '#' + copy.blocks[9].id);
  assert.ok(copy.meta.inlineTextStyles[copy.blocks[1].id + '::headline']);
  assert.ok(copy.meta.responsiveInlineTextStyles[copy.blocks[1].id + '::headline']);
  assert.ok(copy.blocks[4].style.elementCustomCss['itemTitle:' + copy.blocks[4].items[0].id]);
  assert.ok(copy.blocks[4].style.lpItemBoxes[copy.blocks[4].items[0].id]);
  assert.equal(copy.meta.rendererVersion, 'agency-portfolio-v2');
  assert.equal(copy.meta.fieldSources[copy.blocks[1].id + '.headline'], 'user');
});
test('Approved item counts and demo copy are complete', () => {
  for (const [type, count] of [
    ['Benefits', 3],
    ['Features', 3],
    ['Gallery', 4],
    ['Process', 4],
    ['FAQ', 4],
  ])
    assert.equal(pilot.spec.blocks.find((b) => b.type === type).items.length, count);
  assert.equal(pilot.spec.blocks.find((b) => b.type === 'Pricing').plans.length, 2);
  assert.equal(pilot.spec.blocks.find((b) => b.type === 'LeadForm').fields.length, 4);
  assert.match(
    pilot.spec.blocks.find((b) => b.type === 'Gallery').subheadline,
    /không đại diện cho dự án khách hàng/,
  );
});
require.extensions['.ts'] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    file,
  );
const {
  scopeLegacyLandingPageCss: scope,
} = require('../apps/web/src/components/landing-pages/landing-page-legacy-css-scope.ts');
const postcss = require('../apps/web/node_modules/postcss');
test('Scoped CSS preserves declarations, media/keyframes, selector lists and specificity', () => {
  const input =
    '/* a */ [data-lp-layout="agency"] :is(h1,h2),[data-lp-canvas-root]{color:red} @media(max-width:767px){[data-x="a,b"]{display:grid}} @keyframes spin{from{opacity:0}to{opacity:1}}';
  const css = scope(input);
  postcss.parse(css);
  assert.ok(css.includes(':not(:where([data-lp-style-scope="agency-portfolio-v2"]'));
  assert.match(css, /@keyframes spin\{from\{opacity:0\}to\{opacity:1\}\}/);
  assert.equal(scope(input), css);
  const a = postcss.parse(input),
    b = postcss.parse(css);
  const declarations = (r) => {
    let v = [];
    r.walkDecls((d) => v.push([d.prop, d.value, d.important]));
    return v;
  };
  const library = b.nodes.find((node) => node.type === 'atrule' && node.name === 'scope');
  assert.ok(library, 'Library gets an independent CSS scope');
  assert.equal(library.params, '([data-lp-section-library-scope]) to ([data-lp-library-v2])');
  assert.deepEqual(declarations(a), declarations(library), 'Library preserves the same declarations');
  library.remove();
  assert.deepEqual(declarations(a), declarations(b), 'Existing page declarations remain unchanged');
  assert.ok(b.toString().includes(':not(:where([data-lp-section-library-scope]'));
  assert.ok(css.includes('[data-lp-library-canvas]'));
});
fs.writeFileSync(
  process.env.LP_AGENCY_UNIT_REPORT || '/mnt/data/agency-portfolio-implementation/unit-results.json',
  JSON.stringify(results, null, 2),
);
