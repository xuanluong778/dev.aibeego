#!/usr/bin/env node
// Isolated real React/Chromium fixture using current source callbacks. No app
// server, production origin, network transport, or real database is used.
const {
  assert,
  fs,
  path,
  root,
  builder,
  parse,
  find,
  calls,
  definition,
  jsxCallback,
  shared,
} = require('./helpers/landing-page-source-harness.cjs');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const os = require('node:os');

async function main() {
  const webRequire = createRequire(path.join(root, 'apps/web/package.json'));
  const buildRequire = createRequire(
    fs.realpathSync(path.join(root, 'packages/database/node_modules/tsx/package.json')),
  );
  const esbuild = buildRequire('esbuild');
  const { chromium } = require('playwright');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lp-reorder-browser-'));
  const business = parse(path.join(root, 'packages/shared/src/landing-page-business-profile.ts'));
  const syncRef = find(
    builder,
    (node) =>
      require('typescript').isCallExpression(node) &&
      node.expression.getText(builder) === 'useLayoutEffect' &&
      find(
        node,
        (child) =>
          require('typescript').isBinaryExpression(child) &&
          child.left.getText(builder) === 'specRef.current',
      ).length > 0,
  );
  assert.equal(syncRef.length, 1);
  const functions = [
    'cloneSpec',
    'readClientRevision',
    'isSectionLocked',
    'guardSectionUnlocked',
    'applyNestedBlockField',
    'updateBlockFieldLive',
    'moveBlock',
    'reorderBlockById',
    'blurInspectorEditors',
  ]
    .map((name) => definition(builder, name))
    .join('\n');
  const initial = shared.sanitizeLandingPagePersistSpec({
    ...shared.createEmptyLandingPageSpec(),
    blocks: [
      { id: 'hero', type: 'Hero', enabled: true, headline: 'Headline' },
      { id: 'cta', type: 'CTA', enabled: true, headline: 'Second section' },
    ],
    meta: { clientRevision: 10 },
  });
  const entry = `
    import React, { useState, useRef, useCallback, useEffect, useLayoutEffect, startTransition, Suspense } from 'react';
    import { createRoot } from 'react-dom/client';
    import { createEmptyLandingPageSpec, sanitizeLandingPagePersistSpec, sanitizeLandingPageDraftSpec, sanitizeLandingPageSpec, reorderBlocks } from ${JSON.stringify(path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'))};
    import { createLandingPageAutosaveRequestId } from ${JSON.stringify(path.join(root, 'apps/web/src/components/landing-pages/landing-page-autosave-request.ts'))};
    import { decideDraftRecovery, readLocalLandingDraft, writeLocalLandingDraft, clearLocalLandingDraft } from ${JSON.stringify(path.join(root, 'apps/web/src/components/landing-pages/landing-page-draft-recovery.ts'))};
    import { decideLandingPageAutosave, readLandingPageRevision, readLandingPageRequestId } from ${JSON.stringify(path.join(root, 'apps/api/src/landing-pages/landing-page-revision.ts'))};
    ${['getMeta', 'setSource', 'markLandingPageUserEdits'].map((name) => definition(business, name)).join('\n')}
    const initial = ${JSON.stringify(initial)};
    const storageKey = 'isolated-reorder-server';
    let stored = JSON.parse(localStorage.getItem(storageKey) || 'null') || initial;
    window.fetch = () => { throw new Error('Network forbidden in isolated fixture'); };
    window.__gate = {};
    window.__gate.promise = new Promise(resolve => { window.__gate.release = () => { window.__gate.blocked = false; resolve(); }; });
    function Preview({ spec }) {
      return <div id="preview">{spec.blocks.map(block => <section key={block.id} data-section={block.id}>{block.headline}</section>)}</div>;
    }
    function Fixture() {
      const pageId = 'isolated-reorder';
      const [spec, setSpec] = useState(initial);
      const [page, setPage] = useState({ id: pageId, name: 'Fixture', status: 'DRAFT' });
      const [historyNav, setHistoryNav] = useState({ undo: false, redo: false });
      const [saveMsg, setSaveMsg] = useState('');
      const [, setSaving] = useState(false);
      const [, setSaveConflict] = useState(false);
      const [, setPendingLocalDraft] = useState(null);
      const historyRef = useRef([]), futureRef = useRef([]), dirtyRef = useRef(false);
      const inlineHistStarted = useRef(false), gestureHistStarted = useRef(false);
      const revisionRef = useRef(10), ackedRevisionRef = useRef(10);
      const autosaveInflightRef = useRef(false), autosaveQueuedRef = useRef(false), pendingAutosaveRef = useRef(null);
      const autosaveTimer = useRef(null), persistWaitersRef = useRef([]), saveConflictRef = useRef(false);
      const inspectorSuppressOpenRef = useRef(false), specRef = useRef(spec), canvasActionRef = useRef({});
      const setError = () => {}, setHtmlNode = () => {}, setInspectorPanelOpen = () => {}, selectCanvas = () => {}, setCanvasSelection = () => {};
      const healTextLayerCoordinates = value => value, specWithEditableHtmlSections = () => null, healFreeSectionFramesToContent = () => {};
      ${syncRef[0].getText(builder)};
      ${functions}
      const pushHistory = useCallback(${definition(builder, 'pushHistory')}, []);
      const undo = useCallback(${definition(builder, 'undo')}, []);
      const redo = useCallback(${definition(builder, 'redo')}, []);
      const apiClient = async (url, options) => {
        if (url !== '/landing-pages/' + pageId && url !== '/landing-pages/' + pageId + '/autosave') throw new Error('Unknown fixture API');
        if (!options) return { id: pageId, name: 'Fixture', status: 'DRAFT', draftSpec: structuredClone(stored) };
        const body = JSON.parse(options.body);
        const decision = decideLandingPageAutosave({ storedRevision: readLandingPageRevision(stored), storedRequestId: readLandingPageRequestId(stored), baseRevision: body.baseRevision, incomingRevision: body.clientRevision, requestId: body.requestId });
        if (decision.action === 'reject') return { rejected: true, reason: 'STALE_REVISION', clientRevision: decision.storedRevision };
        if (decision.action === 'accept') { stored = body.draftSpec; localStorage.setItem(storageKey, JSON.stringify(stored)); }
        return { requestId: body.requestId, clientRevision: decision.nextRevision, updatedAt: new Date().toISOString() };
      };
      const persist = useCallback(${definition(builder, 'persist')}, [pageId, page?.name]);
      const load = useCallback(${definition(builder, 'load')}, [pageId]);
      canvasActionRef.current = { reorderBlockById };
      const sidebar = ${jsxCallback(builder, 'LandingPageAddComponentsPanel', 'onReorderBlocks')};
      useEffect(() => { load().then(() => { window.__loaded = true; }).catch(error => { window.__error = error.message; }); }, [load]);
      useLayoutEffect(() => {
        window.__editor = { get: () => ({ draft: structuredClone(specRef.current), rendered: structuredClone(spec), history: historyRef.current.length, future: futureRef.current.length, revision: revisionRef.current, acked: ackedRevisionRef.current, dirty: dirtyRef.current }), persist };
      });
      if (window.__gate.blocked && spec.blocks.find(b => b.id === 'hero').headline !== 'Headline') {
        window.__gate.suspended = true;
        throw window.__gate.promise;
      }
      return <main>
        <input id="text" aria-label="Headline" defaultValue="Headline" onInput={event => updateBlockFieldLive('hero', 'headline', event.currentTarget.value)} />
        <button id="move" onClick={() => moveBlock('hero', 'down')}>Move down</button>
        <button id="by-id" onClick={() => reorderBlockById('hero', 'cta')}>Reorder by ID</button>
        <button id="sidebar" onClick={() => sidebar(0, 1)}>Sidebar reorder</button>
        <button id="undo" disabled={!historyNav.undo} onClick={undo}>Undo</button>
        <button id="redo" disabled={!historyNav.redo} onClick={redo}>Redo</button>
        <button id="save" onClick={async () => { await persist(specRef.current, page.name, { manual: true }); window.__saved = !dirtyRef.current; }}>Save</button>
        <Preview spec={spec} />
        <output>{saveMsg}</output>
      </main>;
    }
    createRoot(document.getElementById('root')).render(<Suspense fallback={<p id="pending">Render suspended</p>}><Fixture /></Suspense>);
  `;
  const bundle = await esbuild.build({
    stdin: { contents: entry, resolveDir: path.join(root, 'apps/web'), loader: 'tsx' },
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    define: { 'process.env.NODE_ENV': '"production"' },
    alias: {
      react: path.dirname(webRequire.resolve('react/package.json')),
      'react-dom': path.dirname(webRequire.resolve('react-dom/package.json')),
    },
  });
  fs.writeFileSync(path.join(dir, 'fixture.js'), bundle.outputFiles[0].contents);
  fs.writeFileSync(
    path.join(dir, 'fixture.html'),
    '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src file:; style-src \'unsafe-inline\'; connect-src \'none\'"><div id="root"></div><script src="./fixture.js"></script>',
  );
  const browser = await chromium.launch({ headless: true });
  try {
    for (const control of ['move', 'by-id', 'sidebar']) {
      const context = await browser.newContext();
      const forbidden = [];
      await context.route('**/*', (route) => {
        if (
          route
            .request()
            .url()
            .startsWith(pathToFileURL(dir + path.sep).href)
        )
          return route.continue();
        forbidden.push(route.request().url());
        return route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(dir, 'fixture.html')).href);
      await page.waitForFunction(() => window.__loaded && window.__editor);
      await page.evaluate(() => {
        window.__gate.blocked = true;
      });
      await page.locator('#text').fill('');
      await page.locator('#text').pressSequentially('Live text waiting for React');
      await page.waitForFunction(() => window.__gate.suspended);
      const pending = await page.evaluate(() => window.__editor.get());
      assert.equal(pending.draft.blocks[0].headline, 'Live text waiting for React');
      assert.equal(pending.rendered.blocks[0].headline, 'Headline');
      assert.equal(pending.history, 1);
      await page.locator('#' + control).click();
      const ordered = await page.evaluate(() => window.__editor.get());
      assert.deepEqual(
        ordered.draft.blocks.map((block) => block.id),
        ['cta', 'hero'],
      );
      assert.equal(ordered.draft.blocks[1].headline, 'Live text waiting for React');
      assert.equal(ordered.history, 2);
      await page.evaluate(() => window.__gate.release());
      const check = async (order, text, history, future) => {
        await page.waitForFunction(
          ({ order, text }) => {
            const state = window.__editor.get();
            return (
              state.rendered.blocks.map((block) => block.id).join(',') === order &&
              state.rendered.blocks.find((block) => block.id === 'hero').headline === text
            );
          },
          { order: order.join(','), text },
        );
        const state = await page.evaluate(() => window.__editor.get());
        assert.deepEqual(
          state.draft.blocks.map((block) => block.id),
          order,
        );
        assert.equal(state.draft.blocks.find((block) => block.id === 'hero').headline, text);
        assert.equal(state.history, history);
        assert.equal(state.future, future);
      };
      await check(['cta', 'hero'], 'Live text waiting for React', 2, 0);
      await page.locator('#undo').click();
      await check(['hero', 'cta'], 'Live text waiting for React', 1, 1);
      await page.locator('#undo').click();
      await check(['hero', 'cta'], 'Headline', 0, 2);
      await page.locator('#redo').click();
      await check(['hero', 'cta'], 'Live text waiting for React', 1, 1);
      await page.locator('#redo').click();
      await check(['cta', 'hero'], 'Live text waiting for React', 2, 0);
      await page.locator('#save').click();
      await page.waitForFunction(() => window.__saved === true);
      await page.reload();
      await page.waitForFunction(() => window.__loaded && window.__editor);
      await check(['cta', 'hero'], 'Live text waiting for React', 0, 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(forbidden, []);
      console.log(
        `PASS Chromium ${control}: pending React transition, immediate reorder, Undo/Redo, source save and browser reload`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Fixture artifacts: ' + dir + ' (source callbacks + real React; not full Builder app E2E)',
  );
}
main().catch((error) => {
  if (error.code === 'MODULE_NOT_FOUND' || /Executable doesn't exist/.test(error.message)) {
    console.error('BLOCKED browser dependency: ' + error.message);
    process.exitCode = 2;
  } else {
    console.error(error);
    process.exitCode = 1;
  }
});
