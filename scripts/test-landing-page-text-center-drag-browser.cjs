const fs = require('fs'),
  path = require('path'),
  assert = require('assert/strict'),
  { createRequire } = require('module');
const root = path.resolve(__dirname, '..'),
  wr = createRequire(root + '/apps/web/package.json'),
  nr = createRequire(root + '/package.json');
// Uses the real text/toolbar components, pointer engine and builder commit handler.
// Node-only modules re-exported by shared are unused here and stubbed for bundling.
const ts = nr('typescript'),
  esbuild = createRequire(
    path.join(
      root,
      'node_modules/.pnpm',
      fs.readdirSync(path.join(root, 'node_modules/.pnpm')).find((n) => n.startsWith('tsx@')),
      'node_modules/tsx/package.json',
    ),
  )('esbuild');
const source = ts.createSourceFile(
  'builder.tsx',
  fs.readFileSync(root + '/apps/web/src/components/landing-pages/landing-page-builder.tsx', 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
function def(name) {
  let result;
  function visit(n) {
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) result = n.getText(source);
    ts.forEachChild(n, visit);
  }
  visit(source);
  assert(result, name);
  return result;
}
const out =
  process.env.LP_TEXT_CENTER_QA_OUT ||
  fs.mkdtempSync(path.join(require('os').tmpdir(), 'lp-text-center-'));
fs.mkdirSync(out, { recursive: true });
(async () => {
  const entry = `import React,{useState,useRef,useLayoutEffect}from'react';import{createRoot}from'react-dom/client';import{InlineEditable}from'${root}/apps/web/src/components/landing-pages/landing-page-canvas-ux';import{FreeGuidesProvider,readCanvasPointerScale,measureSectionContentHeightCss,clampAbsoluteFreeLayout}from'${root}/apps/web/src/components/landing-pages/landing-page-free-drag';import{LandingPageElementVerticalToolbar}from'${root}/apps/web/src/components/landing-pages/landing-page-element-vertical-toolbar';import{sanitizeLandingPagePersistSpec,createBlankLandingPageSpec,markLandingPageUserEdits,isFloatingTextLayerBlock,resolveFreeLayoutForViewport,reflowFreeSectionsAfterChange,ELEMENT_FREE_MAX_X_PX}from'@marketingspa/shared';
import{prepareFlowEdit}from'${root}/apps/web/src/components/landing-pages/landing-page-no-overlap';
const params=new URLSearchParams(location.search),zoom=Number(params.get('zoom'))||1,floating=params.has('floating'),wide=params.has('wide'),canvasW=wide?2000:1200,startX=wide?1600:850;const initial={...createBlankLandingPageSpec(),blocks:[{id:'host',type:'Hero',enabled:true,headline:'host'},{id:'text',type:'Benefits',enabled:true,headline:'ADD YOUR TITLE',subheadline:'',items:[],...(floating?{positionMode:'free',freeLayout:{x:startX,y:250,width:300,height:90}}:{sectionPlacement:{sectionId:'host',anchor:{kind:'end'},edge:'after'}})}],meta:{inlineTextStyles:{'text::headline':{width:280,fontSize:28,lineHeight:1.3}}}};
function App(){const[spec,setSpec]=useState(()=>JSON.parse(localStorage.getItem('draft')||'null')||initial),specRef=useRef(spec),hist=useRef([]),future=useRef([]),canvasRootRef=useRef(null);const target={blockId:'text',element:'headline',field:'headline'};const guardSectionUnlocked=()=>true;function isLpTextLayerBlock(b){return !b.sectionPlacement&&isFloatingTextLayerBlock(b)}function pushHistory(next){hist.current.push(specRef.current);future.current=[];specRef.current=next;setSpec(next)}${def('commitElementFreeLayout')}
const handlers={selection:target,primarySelectedId:'text::headline',selectedElementIds:['text::headline'],viewport:'desktop',isSelected:t=>t.blockId==='text',isPrimarySelected:t=>t.blockId==='text',onSelect:()=>{},onDeselect:()=>{},getTextStyle:()=>spec.meta.inlineTextStyles['text::headline'],getElementFreeLayout:(id,field)=>floating?null:spec.meta.elementFreeLayouts?.[id+'::'+field]||null,onElementFreeLayoutCommit:commitElementFreeLayout,onFieldCommit:()=>{},onFieldLive:()=>{}};
const b=spec.blocks[1];const node=<InlineEditable blockId="text" field="headline" element="headline" value="ADD YOUR TITLE" as="h2" textRole="heading" handlers={handlers}/>;useLayoutEffect(()=>{window.editor={spec,history:hist.current.length,save:()=>localStorage.setItem('draft',JSON.stringify(sanitizeLandingPagePersistSpec(specRef.current)))}});
return <><button id="undo" onClick={()=>{const prev=hist.current.pop();future.current.push(specRef.current);specRef.current=prev;setSpec(prev)}}>Undo</button><button id="redo" onClick={()=>{const next=future.current.pop();hist.current.push(specRef.current);specRef.current=next;setSpec(next)}}>Redo</button><div data-lp-canvas-scroll style={{overflow:'auto',height:650}}><div style={{transform:'scale('+zoom+')',transformOrigin:'top left',width:canvasW}}><FreeGuidesProvider><article ref={canvasRootRef} data-lp-canvas-root style={{position:'relative',width:canvasW,height:500}}>{floating?<div data-lp-section-chrome="1" data-lp-block-id="text" data-lp-floating-text-section="1" style={{position:'absolute',left:b.freeLayout.x,top:250,width:300,height:90}}><div data-lp-free-surface="1" style={{width:280}}>{node}</div></div>:<section data-lp-section-chrome="1" data-lp-block-id="host" style={{position:'relative',width:canvasW,height:500,paddingTop:60,boxSizing:'border-box'}}><div data-lp-free-surface="1" style={{marginLeft:startX,width:300,position:'relative'}}><div data-lp-section-element="1" data-lp-block-id="text">{node}</div></div></section>}</article></FreeGuidesProvider></div></div><LandingPageElementVerticalToolbar enabled canvasRootRef={canvasRootRef} primaryTarget={target} onSelect={()=>{}} onSave={()=>{}} onDuplicate={()=>{}} onDelete={()=>{}}/></>};createRoot(document.getElementById('root')).render(<App/>);`;
  const b = await esbuild.build({
    stdin: { contents: entry, resolveDir: root + '/apps/web', loader: 'tsx' },
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    jsx: 'automatic',
    plugins: [
      {
        name: 'unused-server-modules',
        setup(build) {
          build.onResolve({ filter: /^(crypto|node:.*)$/ }, (args) => ({
            path: args.path,
            namespace: 'unused-server',
          }));
          build.onLoad({ filter: /.*/, namespace: 'unused-server' }, () => ({
            contents: 'module.exports = {}',
            loader: 'js',
          }));
        },
      },
    ],
    alias: {
      '@marketingspa/shared': root + '/packages/shared/src/index.ts',
      '@': root + '/apps/web/src',
      react: path.dirname(wr.resolve('react/package.json')),
      'react-dom': path.dirname(wr.resolve('react-dom/package.json')),
    },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  fs.writeFileSync(out + '/component.js', b.outputFiles[0].contents);
  fs.writeFileSync(
    out + '/component.html',
    '<html><style>body{margin:0}h2{margin:0}button{height:30px}*{box-sizing:border-box}.absolute{position:absolute}.fixed{position:fixed}.inset-0{inset:0}.pointer-events-none{pointer-events:none}.pointer-events-auto{pointer-events:auto}[data-lp-resize-handle]{width:10px;height:10px;padding:0}.hidden{display:none}[data-lp-element-vertical-toolbar]{width:44px;display:flex;flex-direction:column}[data-lp-vertical-tool]{width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center}[data-lp-vertical-tool] svg{width:20px;height:20px}</style><div id="root"></div><script src="./component.js"></script></html>',
  );
  const browser = await nr('playwright').chromium.launch({
    executablePath:
      process.env.LP_QA_BROWSER || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const results = [];
  try {
    for (const control of ['text', 'toolbar'])
      for (const floating of [false, true])
        for (const wide of [false, true])
          for (const zoom of [1, 0.75]) {
            const page = await browser.newPage({ viewport: { width: 2300, height: 800 } });
            const errors = [];
            page.on('pageerror', (e) => {
              errors.push(e.message);
              console.error(e.message);
            });
            await page.goto(
              'file://' +
                out +
                '/component.html?zoom=' +
                zoom +
                (floating ? '&floating=1' : '') +
                (wide ? '&wide=1' : ''),
            );
            await page.waitForFunction(() => window.editor);
            const box = page.locator('[data-lp-free-id="text::headline"]');
            const before = await box.boundingBox(),
              target = ((wide ? 2000 : 1200) - before.width / zoom) / 2;
            if (control === 'toolbar') await page.locator('[data-lp-vertical-tool="move"]').hover();
            const handle =
              control === 'toolbar'
                ? await page.locator('[data-lp-vertical-tool="move"]').boundingBox()
                : null;
            const start = handle
              ? { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 }
              : { x: before.x + 40 * zoom, y: before.y + 20 * zoom };
            await page.mouse.move(start.x, start.y);
            await page.mouse.down();
            await page.mouse.move(start.x + target * zoom - before.x, start.y, { steps: 20 });
            await page.waitForTimeout(70);
            const during = await box.boundingBox();
            assert(
              Math.abs(during.x / zoom - target) < 2,
              'center during ' + JSON.stringify({ control, floating, wide, zoom, during, target }),
            );
            assert(
              (await page.locator('[data-lp-guide="v"][data-lp-guide-kind="center"]').count()) > 0,
              'center guide',
            );
            await page.mouse.up();
            await page.waitForTimeout(70);
            const after = await box.boundingBox();
            assert(
              Math.abs(after.x - during.x) < 2,
              'drop must not jump ' + JSON.stringify({ floating, wide, zoom, after, during }),
            );
            assert.equal(await page.evaluate(() => window.editor.history), 1);
            await page.locator('#undo').click();
            const undo = await box.boundingBox();
            assert(Math.abs(undo.x - before.x) < 2, 'undo');
            await page.locator('#redo').click();
            const redo = await box.boundingBox();
            assert(Math.abs(redo.x - after.x) < 2, 'redo');
            await page.evaluate(() => window.editor.save());
            await page.reload();
            await page.waitForFunction(() => window.editor);
            const reload = await box.boundingBox();
            assert(Math.abs(reload.x - after.x) < 2, 'reload');
            assert.deepEqual(errors, []);
            results.push({
              control,
              floating,
              wide,
              zoom,
              before: before.x,
              during: during.x,
              after: after.x,
              reload: reload.x,
            });
            await page.close();
          }
    fs.writeFileSync(
      out + '/component-results.json',
      JSON.stringify({ passed: true, results }, null, 2),
    );
    console.log(
      'PASS ' +
        results.length +
        ' real text component cases: center, guides, drop, Undo/Redo, sanitize/reload; wide offsets exceed 640px',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
