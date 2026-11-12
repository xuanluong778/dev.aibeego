#!/usr/bin/env node
const {
  assert,
  vm,
  ts,
  path,
  root,
  webRequire,
  builder,
  parse,
  find,
  definition,
  evaluate,
  harness,
  snapshot,
} = require('./helpers/landing-page-source-harness.cjs');
async function main() {
  const page = parse(path.join(root, 'apps/web/src/app/(app)/landing-pages/builder/[id]/page.tsx'));
  const ctx = vm.createContext({
    require: webRequire,
    exports: {},
    LandingPageBuilder: () => null,
    useParams: () => ({ id: ctx.id }),
  });
  const render = evaluate(definition(page, 'LandingPageBuilderPage'), ctx);
  const elements = [];
  for (const id of ['page-a', 'page-b']) {
    ctx.id = id;
    const element = render().props.children;
    assert.equal(element.props.pageId, id);
    assert.equal(element.key, id, 'actual page output keys builder by route id');
    elements.push(element);
  }
  assert.notEqual(elements[0].key, elements[1].key);
  console.log('PASS REMOUNT_ON_PAGE_ID / NO_SHARED_INSTANCE_ACROSS_PAGES');
  const first = harness(),
    second = harness();
  for (const name of ['historyRef', 'futureRef', 'blockClipboardRef', 'styleClipboardRef']) {
    const nodes = find(
      builder,
      (node) => ts.isVariableDeclaration(node) && node.name.getText(builder) === name,
    );
    assert.equal(nodes.length, 1);
    for (const editor of [first, second]) {
      editor.useRef = (value) => ({ current: value });
      editor[name] = evaluate(nodes[0].initializer.getText(builder), editor);
    }
    assert.notEqual(first[name], second[name]);
  }
  const original = snapshot(first.specRef.current);
  first.toggleElementHidden('hero', 'headline');
  assert.equal(first.historyRef.current.length, 1);
  assert.equal(second.historyRef.current.length, 0);
  first.undo();
  assert.deepEqual(snapshot(first.specRef.current), original);
  assert.equal(first.futureRef.current.length, 1);
  assert.equal(second.futureRef.current.length, 0);
  first.redo();
  assert.equal(first.specRef.current.meta.elementHidden['hero::headline'], true);
  await first.load();
  assert.equal(first.historyRef.current.length, 0);
  assert.equal(first.futureRef.current.length, 0);
  assert.equal(first.historyNav.undo, false);
  assert.equal(first.historyNav.redo, false);
  console.log(
    'PASS UNDO_USES_LOCAL_HISTORY / load resets navigation history (source execution, not browser navigation)',
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
