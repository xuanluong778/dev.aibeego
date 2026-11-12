/** Behavior tests use real shared code and real builder methods with mocked I/O. */
const {
  assert,
  shared,
  snapshot,
  harness,
  state,
  evaluate,
  definition,
  builder,
  parse,
  path,
  root,
  method,
  vm,
} = require('./helpers/landing-page-motion-harness.cjs');
const motion = (preset = 'fade', trigger = 'scroll') => ({
  preset,
  trigger,
  duration: 450,
  delay: 0,
});
const check = (label, fn) => {
  fn();
  console.log('PASS', label);
};
const {
  lpMotionLocalKey: key,
  patchLandingPageMotion: patch,
  readLandingPageMotion: read,
} = shared;
const targets = [
  { blockId: 'hero', element: 'headline', field: 'headline' },
  { blockId: 'hero', element: 'image' },
  { blockId: 'hero', element: 'item:card-a' },
  { blockId: 'hero', element: 'item:card-a', field: 'itemTitle:card-a' },
  { blockId: 'hero', element: 'item:card-a', field: 'itemDesc:card-a' },
  { blockId: 'hero', element: 'cta', field: 'ctaLabel' },
  { blockId: 'hero', element: 'item:trust-icon-0' },
];
check('local keys distinguish card, title, description, image, button, icon', () => {
  assert.equal(new Set(targets.map(key)).size, targets.length);
  assert.equal(key({ element: 'headline' }), key(targets[0]));
  assert.equal(key({ element: 'section-background' }), 'section');
});
check('sanitizer clamps numbers, drops malformed/unknown entries and preserves other style', () => {
  const input = shared.createEmptyLandingPageSpec();
  input.blocks = [
    {
      id: 'hero',
      type: 'Hero',
      enabled: true,
      headline: 'Title',
      style: {
        color: '#123456',
        lpBgMotion: 'ken-burns',
        customCss: 'animation-timeline:view()',
        lpMotion: {
          section: { ...motion(), duration: 2000, delay: -2 },
          elements: {
            'field:headline': { ...motion(), duration: NaN, delay: Infinity },
            image: { ...motion('zoom-in'), duration: 1, delay: 900 },
            'item:card-a': motion('zoom-out'),
            'field:body': { ...motion(), preset: 'evil' },
            'field:subheadline': { ...motion(), trigger: 'evil' },
            form: motion(),
            arbitrary: motion(),
            'field:ctaLabel': [],
          },
        },
      },
    },
  ];
  const before = snapshot(input);
  const block = shared.sanitizeLandingPagePersistSpec(input).blocks[0];
  assert.equal(block.style.color, '#123456');
  assert.equal(block.style.lpBgMotion, 'ken-burns');
  assert.equal(block.style.customCss, 'animation-timeline:view()');
  assert.deepEqual(block.style.lpMotion.section, { ...motion(), duration: 1200 });
  assert.deepEqual(block.style.lpMotion.elements.image, {
    ...motion('zoom-in'),
    duration: 150,
    delay: 400,
  });
  assert.deepEqual(block.style.lpMotion.elements['field:headline'], { ...motion(), duration: 1200 });
  assert.equal(Object.keys(block.style.lpMotion.elements).length, 4);
  assert.deepEqual(snapshot(input), before);
  for (const value of [
    null,
    [],
    'css',
    { section: [] },
    { section: { preset: 'none', trigger: 'load' } },
  ])
    assert.equal(shared.sanitizeLandingPageMotionStyle(value), undefined);
});
check('1200ms defaults apply to missing timing while explicit faster values are preserved', () => {
  assert.equal(shared.LP_MOTION_DEFAULTS.duration, 1200);
  assert.equal(shared.sanitizeLandingPageMotion({ preset: 'fade', trigger: 'scroll' }).duration, 1200);
  assert.equal(shared.sanitizeLandingPageMotion(motion()).duration, 450);
  assert.equal(read(patch({}, 'image', { ...shared.LP_MOTION_DEFAULTS, preset: 'zoom-in' }), 'image').duration, 1200);
});
check(
  'all native targets and eleven presets persist, legacy load normalizes to viewport, field ids remap',
  () => {
    assert.equal(shared.LP_MOTION_PRESETS.length, 11);
    const keys = [
      'form',
      'countdown:ngày',
      'field:countdownCell:Ngày',
      'field:fieldLabel:email',
      'field:submitLabel',
      'field:footerText',
      'field:trustPoint:0',
      'grid:2',
    ];
    for (const preset of shared.LP_MOTION_PRESETS) {
      for (const target of keys) {
        const style = patch({}, target, motion(preset, 'load'));
        assert.deepEqual(read(style, target), motion(preset));
      }
    }
    const remapped = shared.remapLandingPageMotion(
      { elements: { 'field:fieldLabel:email': motion() } },
      new Map([['email', 'new-email']]),
    );
    assert.deepEqual(remapped.elements['field:fieldLabel:new-email'], motion());
  },
);
check('patch/remove affects only the exact target and leaves legacy styles intact', () => {
  let style = { color: '#123', lpBgMotion: 'ken-burns' };
  targets.forEach(
    (target, index) => (style = patch(style, key(target), motion(shared.LP_MOTION_PRESETS[index]))),
  );
  const original = snapshot(style);
  const next = patch(style, key(targets[3]));
  assert.equal(read(next, key(targets[3])), undefined);
  for (const target of targets.filter((_, i) => i !== 3))
    assert.deepEqual(read(next, key(target)), read(original, key(target)));
  let empty = next;
  targets.forEach((target) => (empty = patch(empty, key(target))));
  assert.deepEqual(empty, { color: '#123', lpBgMotion: 'ken-burns' });
  assert.deepEqual(style, original);
});
function fixture() {
  const spec = shared.createEmptyLandingPageSpec();
  spec.blocks = [
    {
      id: 'cards',
      type: 'Benefits',
      enabled: true,
      headline: 'Benefits',
      items: [
        { id: 'card-a', title: 'Title', description: 'Description' },
        { id: 'card-a-extra', title: 'Other' },
      ],
      style: {
        color: '#abc',
        lpMotion: {
          section: motion(),
          elements: {
            'item:card-a': motion('zoom-in'),
            'field:itemTitle:card-a': motion('slide-up'),
            'field:itemDesc:card-a': motion('slide-left'),
            'item:card-a-extra': motion('fade'),
          },
        },
      },
    },
    {
      id: 'plans',
      type: 'Pricing',
      enabled: true,
      headline: 'Plans',
      plans: [{ id: 'p', name: 'Pro', price: '100', ctaLabel: 'Buy' }],
      style: {
        lpMotion: { elements: { 'item:p': motion(), 'field:planCta:p': motion('slide-down') } },
      },
    },
    {
      id: 'form',
      type: 'LeadForm',
      enabled: true,
      headline: 'Contact',
      fields: [{ id: 'email', type: 'email', label: 'Email', required: true }],
    },
  ];
  return shared.sanitizeLandingPagePersistSpec(spec);
}
check('save, reopen, block/page/template clone remap exact nested IDs', () => {
  const spec = fixture();
  const saved = shared.sanitizeLandingPagePersistSpec(
    JSON.parse(JSON.stringify(shared.sanitizeLandingPageDraftSpec(spec))),
  );
  assert.deepEqual(saved.blocks[0].style.lpMotion, spec.blocks[0].style.lpMotion);
  for (const clone of [
    shared.duplicateBlock(saved.blocks[0]),
    shared.cloneLandingPageSpecWithNewIds(saved).blocks[0],
  ]) {
    const a = clone.items[0].id,
      b = clone.items[1].id;
    assert.notEqual(a, 'card-a');
    assert.deepEqual(read(clone.style, `item:${a}`), motion('zoom-in'));
    assert.deepEqual(read(clone.style, `field:itemTitle:${a}`), motion('slide-up'));
    assert.deepEqual(read(clone.style, `field:itemDesc:${a}`), motion('slide-left'));
    assert.deepEqual(read(clone.style, `item:${b}`), motion('fade'));
    assert.equal(read(clone.style, 'item:card-a'), undefined);
    assert.deepEqual(clone.style.lpMotion.section, motion());
  }
  const copied = shared.remapLandingPageMotion(
    spec.blocks[0].style.lpMotion,
    new Map([['card-a', 'new-a']]),
    true,
  );
  assert.deepEqual(copied.elements['field:itemTitle:new-a'], motion('slide-up'));
  assert.deepEqual(copied.elements['item:card-a-extra'], motion('fade'));
  const unicode = shared.remapLandingPageMotion(
    { elements: { 'field:itemTitle:thẻ:a': motion() } },
    new Map([['thẻ:a', 'new']]),
  );
  assert.deepEqual(unicode.elements['field:itemTitle:new'], motion());
});
(async () => {
  const ctx = harness();
  ctx.targetIsLocked = (spec, target) =>
    !!spec.blocks.find((block) => block.id === target.blockId)?.locked;
  ctx.updateMotion = evaluate(definition(builder, 'updateMotion'), ctx);
  for (let i = 0; i < targets.length; i++)
    ctx.updateMotion(targets[i], motion(shared.LP_MOTION_PRESETS[i]));
  assert.equal(ctx.historyRef.current.length, targets.length);
  const expected = snapshot(ctx.specRef.current);
  ctx.updateMotion(targets[0], motion());
  assert.equal(ctx.historyRef.current.length, targets.length);
  ctx.updateMotion(targets[3], undefined);
  assert.equal(read(ctx.specRef.current.blocks[0].style, key(targets[3])), undefined);
  ctx.undo();
  assert.deepEqual(snapshot(ctx.specRef.current.blocks[0].style), expected.blocks[0].style);
  ctx.redo();
  assert.equal(read(ctx.specRef.current.blocks[0].style, key(targets[3])), undefined);
  ctx.undo();
  await ctx.persist(ctx.specRef.current, 'Motion QA', { manual: true, wait: true });
  assert.equal(ctx.requests.length, 1);
  assert.equal(ctx.requests[0].url, '/landing-pages/motion-qa/autosave');
  const receipt = JSON.parse(ctx.requests[0].options.body);
  assert.equal(receipt.baseRevision, 10);
  assert.equal(receipt.clientRevision, ctx.revisionRef.current);
  assert.equal(ctx.ackedRevisionRef.current, receipt.clientRevision);
  assert.equal(ctx.dirtyRef.current, false);
  const reopened = shared.sanitizeLandingPagePersistSpec(
    JSON.parse(ctx.requests.find((r) => r.url.includes('autosave')).options.body).draftSpec,
  );
  assert.deepEqual(reopened.blocks[0].style, expected.blocks[0].style);
  const locked = harness(true);
  locked.targetIsLocked = ctx.targetIsLocked;
  locked.updateMotion = evaluate(definition(builder, 'updateMotion'), locked);
  const before = state(locked);
  locked.updateMotion(targets[0], motion());
  assert.deepEqual(state(locked), before);
  console.log('PASS real builder Undo/Redo, revision, lock and autosave/reopen');

  const nested = harness();
  nested.specRef.current = fixture();
  nested.document.querySelector = () => null;
  nested.selectCanvas = () => {};
  nested.dupItem = evaluate(definition(builder, 'dupItem'), nested);
  nested.dupItem('cards', 'card-a');
  assert.equal(nested.historyRef.current.length, 1);
  const cards = nested.specRef.current.blocks[0];
  const copiedCard = cards.items[1].id;
  assert.deepEqual(read(cards.style, `item:${copiedCard}`), motion('zoom-in'));
  assert.deepEqual(read(cards.style, `field:itemTitle:${copiedCard}`), motion('slide-up'));
  assert.deepEqual(read(cards.style, 'item:card-a-extra'), motion('fade'));
  nested.dupItem('plans', 'p');
  assert.equal(nested.historyRef.current.length, 2);
  const plans = nested.specRef.current.blocks[1];
  assert.deepEqual(read(plans.style, `field:planCta:${plans.plans[1].id}`), motion('slide-down'));
  nested.undo();
  assert.equal(nested.specRef.current.blocks[1].plans.length, 1);
  console.log('PASS real builder nested card/plan duplication remaps motion in one Undo step');

  // Real publish method + in-memory transaction: no network/database writes.
  const spec = fixture();
  let row = { id: 'page', slug: 'motion-qa', draftSpec: spec, status: 'DRAFT' };
  let version;
  const api = vm.createContext({
    ...shared,
    readLandingPageRevision: () => 10,
    publishRevisionAllowed: () => 'ok',
    LandingPageStatus: { PUBLISHED: 'PUBLISHED' },
    THEME_MAP: {},
    TEMPLATE_EDIT_SLUG_PREFIX: '__template-edit-',
    Date,
    BadRequestException: Error,
    ConflictException: Error,
    NotFoundException: Error,
  });
  const publish = method(
    parse(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts')),
    'publish',
    api,
  );
  const tx = {
    $queryRaw: () => {},
    landingPage: {
      findFirst: async () => row,
      update: async ({ data }) => (row = { ...row, ...data }),
    },
    landingPageVersion: {
      findFirst: async () => null,
      create: async ({ data }) => {
        version = data;
      },
    },
  };
  await publish.call(
    {
      assertPage: async () => row,
      assertMutable: () => {},
      prisma: { $transaction: (fn) => fn(tx) },
      serializePage: (x) => x,
    },
    { id: 'u', organizationId: 'org' },
    'page',
    { clientRevision: 10 },
  );
  assert.deepEqual(
    snapshot(row.publishedSpec.blocks[0].style.lpMotion),
    spec.blocks[0].style.lpMotion,
  );
  assert.deepEqual(
    snapshot(version.snapshot.blocks[0].style.lpMotion),
    spec.blocks[0].style.lpMotion,
  );
  console.log('PASS real publish method preserves lpMotion in publishedSpec and version');

  // Real template pack parser and service acceptSpec method.
  const ts = require('typescript'),
    fs = require('fs'),
    Module = require('module');
  const file = path.join(root, 'apps/api/src/landing-pages/template-pack.ts');
  const compiled = new Module(file, module);
  compiled.filename = file;
  compiled.paths = module.paths;
  compiled._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  const pack = compiled.exports;
  const body = pack.buildStoredZip([
    {
      name: 'manifest.json',
      data: Buffer.from(
        JSON.stringify({
          format: pack.TEMPLATE_PACK_FORMAT,
          formatVersion: pack.TEMPLATE_PACK_FORMAT_VERSION,
          slug: 'motion-qa',
          name: 'Motion QA',
          category: 'agency',
          theme: 'MODERN',
        }),
      ),
    },
    { name: 'template.json', data: Buffer.from(JSON.stringify(spec)) },
  ]);
  const parsed = pack.parseTemplatePack(body);
  const accept = method(
    parse(path.join(root, 'apps/api/src/landing-pages/landing-page-template-pack.service.ts')),
    'acceptSpec',
    api,
  );
  const imported = accept(parsed.template);
  assert.deepEqual(snapshot(imported.blocks[0].style.lpMotion), spec.blocks[0].style.lpMotion);
  console.log('PASS template JSON ZIP export/import parser and acceptSpec preserve lpMotion');
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
