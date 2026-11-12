const fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  ts = require('../apps/web/node_modules/typescript');
const temp = fs.mkdtempSync('/tmp/lp-no-overlap-unit-'),
  outfile = path.join(temp, 'helper.cjs');
const source = fs.readFileSync(
  'apps/web/src/components/landing-pages/landing-page-no-overlap.ts',
  'utf8',
);
fs.writeFileSync(
  outfile,
  ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replaceAll(
      '"@marketingspa/shared"',
      JSON.stringify(path.resolve('packages/shared/dist')),
    ),
);
const { projectLandingFlow, prepareFlowEdit, protectFreeRect } = require(outfile);
const spec = {
  version: 1,
  blocks: [
    {
      id: 'boxes',
      type: 'Benefits',
      enabled: true,
      headline: 'Title',
      items: [
        {
          id: 'a',
          title: 'A',
          positionMode: 'free',
          freeLayout: { x: 350, y: -100, width: 240, height: 200 },
        },
      ],
      style: { lpContentColumns: 3 },
    },
    {
      id: 'text',
      type: 'Benefits',
      enabled: true,
      headline: '',
      subheadline: 'text',
      items: [],
      sectionPlacement: {
        sectionId: 'boxes',
        anchor: { kind: 'end' },
        edge: 'after',
        columnIndex: 1,
      },
    },
  ],
  meta: {
    elementFreeLayouts: {
      'text::subheadline': { x: -200, y: 180, width: 260 },
      'boxes::itemDesc:a': { x: 40, y: 30 },
    },
  },
};
const original = JSON.stringify(spec),
  view = projectLandingFlow(spec);
assert.equal(JSON.stringify(spec), original, 'Read-only view must not mutate saved data');
assert.equal(view.blocks[0].items[0].freeLayout.x, 0);
assert.equal(view.meta.elementFreeLayouts['text::subheadline'].x, 0);
assert.equal(view.meta.elementFreeLayouts['text::subheadline'].width, 260);
const edited = prepareFlowEdit(spec, 'text', 'subheadline');
assert.equal(edited.meta.elementFreeLayouts['text::subheadline'].x, 0);
assert.equal(
  edited.blocks[0].items[0].freeLayout.x,
  350,
  'Unselected saved box must remain unchanged',
);
assert.equal(edited.meta.elementFreeLayouts['boxes::itemDesc:a'].x, 40);
edited.meta.elementFreeLayouts['text::subheadline'].x = 12;
assert.equal(
  projectLandingFlow(edited).meta.elementFreeLayouts['text::subheadline'].x,
  12,
  'Explicit user position persists',
);
assert.equal(JSON.stringify(spec), original);
assert.equal(
  projectLandingFlow(spec).meta.elementFreeLayouts['text::subheadline'].x,
  0,
  'Undo to old model gives safe view',
);
// Crossing is allowed; only painted destinations must remain clear.
const obstacle = {
  getBoundingClientRect: () => ({ left: 200, top: 20, width: 100, height: 150 }),
  contains: () => false,
  closest: () => null,
  matches: () => false,
};
const root = { querySelectorAll: () => [obstacle] };
const actor = {
  getBoundingClientRect:()=>({width:80,height:60}),
  closest: (s) =>
    s === '[data-lp-canvas-root]' ? root : s === '[data-lp-non-overlap="1"]' ? {} : null,
  contains: () => false,
};
global.getComputedStyle = () => ({ visibility: 'visible' });
const from = { left: 10, top: 40, width: 80, height: 60 },
  bounds = { left: 0, top: 0, width: 700, height: 500 };
const stopped = protectFreeRect(
  actor,
  from,
  { ...from, left: 450 },
  bounds,
  { left: 0, top: 0 },
  1,
);
assert.equal(stopped.left, 450, 'A clear destination beyond a box must be reachable');
for (const x of [120, 160, 200, 240, 280, 320, 400]) {
  const r = protectFreeRect(actor, from, { ...from, left: x }, bounds, { left: 0, top: 0 }, 1);
  assert(
    !require(outfile).intersects(r, { left: 200, top: 20, width: 100, height: 150 }, 1),
    'No overlap during crossing at ' + x,
  );
}
const far = protectFreeRect(actor, from, { ...from, left: 240 }, bounds, { left: 0, top: 0 }, 1);
assert(far.left >= 303, 'Pointer past middle snaps to opposite side');
const back = protectFreeRect(
  actor,
  { ...from, left: 450 },
  { ...from, left: 10 },
  bounds,
  { left: 0, top: 0 },
  1,
);
assert.equal(back.left, 10, 'Reverse crossing also works');
const clear = protectFreeRect(actor, from, { ...from, top: 250 }, bounds, { left: 0, top: 0 }, 1);
assert.equal(clear.top, 250, 'Free direction remains movable');
const savedObstacle=obstacle.getBoundingClientRect;
obstacle.getBoundingClientRect=()=>({left:0,top:100,width:200,height:100});
const held=protectFreeRect(actor,{left:0,top:0,width:80,height:60},{left:100,top:120,width:80,height:60},{left:0,top:0,width:200,height:500},{left:0,top:0},1,[],{x:100,y:0});
assert.equal(held.top,0,'Crowded horizontal drag must not jump into a remote row');
obstacle.getBoundingClientRect=savedObstacle;
const shared = require('../packages/shared/dist'),
  base = shared.createBlankLandingPageSpec(),
  hero = base.blocks.find((b) => b.type === 'Hero');
hero.style = { ...hero.style, lpContentColumns: 2 };
const persisted = shared.sanitizeLandingPagePersistSpec(prepareFlowEdit(base, hero.id, 'headline'));
assert.equal(
  persisted.blocks.find((b) => b.id === hero.id).style.lpAcceptedLayoutFields,
  '["headline"]',
  'Shared sanitizer retains explicit position acceptance',
);
console.log(
  'PASS: read-only projection; selected edits; saved coordinates preserved; undo view; crossing both directions; collision-free destinations; free movement',
);
fs.rmSync(temp, { recursive: true, force: true });
