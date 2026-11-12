#!/usr/bin/env node
/** Local Builder QA with intercepted fixture APIs. Never writes to customer pages. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist/index.js');
const base = process.env.LP_QA_URL || 'http://127.0.0.1:3067';
const output = process.env.LP_QA_OUT || '/tmp/aibeego-builder-responsive';
const sizes = [
  [1280,800], [1440,900], [1920,1080],
  [768,1024], [820,1180], [1024,1366], [1024,768], [1180,820], [1366,1024],
  [320,568], [375,667], [390,844], [430,932],
  [568,320], [667,375], [844,390], [932,430],
];

async function fixture(browser, width, height) {
  const context = await browser.newContext({viewport:{width,height}, isMobile:width<768, hasTouch:width<1200});
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  let draft = structuredClone(shared.LANDING_PAGE_SYSTEM_TEMPLATES.find(t=>t.slug==='agency-portfolio').spec);
  const saves = [], errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  await page.route('**/api/v1/**', async route=>{
    const p = new URL(route.request().url()).pathname;
    let data = [];
    if (p.endsWith('/auth/me')) data={id:'qa-local',name:'Builder QA',email:'qa@example.test',role:'SUPER_ADMIN',locale:'vi'};
    else if (p==='/api/v1/landing-pages/responsive-qa') data={id:'responsive-qa',name:'Responsive QA',slug:'responsive-qa',status:process.env.LP_QA_PUBLISHED?'PUBLISHED':'DRAFT',draftSpec:draft};
    else if (p.endsWith('/autosave')) {
      const body=route.request().postDataJSON();
      draft=body.draftSpec; saves.push(body);
      data={updatedAt:new Date().toISOString(),clientRevision:body.clientRevision,requestId:body.requestId};
    } else if (p.includes('/publish')) throw new Error('QA must never publish');
    else if (p.includes('/billing/')) data={hasPlan:true,isExpired:false,status:'ACTIVE'};
    else if (p.includes('/media')) data={items:[],total:0};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.route('**/socket.io/**',route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('ms_access_token','local.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.fixture'));
  await page.goto(`${base}/landing-pages/builder/responsive-qa`,{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('[data-lp-canvas-root]').waitFor({state:'visible',timeout:30000});
  await page.waitForTimeout(300);
  return {context,page,saves,errors,getDraft:()=>draft};
}

async function measure(page) {
  return page.evaluate(()=>{
    const rect=selector=>{
      const e=document.querySelector(selector); if(!e)return null;
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);
      return {x:r.x,y:r.y,w:r.width,h:r.height,visible:s.display!=='none'&&r.width>0&&r.height>0,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth};
    };
    return {window:{w:innerWidth,h:innerHeight},viewport:document.querySelector('[data-lp-canvas-scroll]')?.getAttribute('data-lp-viewport'),documentWidth:document.documentElement.scrollWidth,
      toolbar:rect('[data-lp-toolbar-fixed]'),canvas:rect('[data-lp-canvas-scroll]'),
      inspector:rect('[data-lp-inspector]'),preview:rect('[data-lp-canvas-root]'),
      deviceButtons:[...document.querySelectorAll('[data-lp-device-switcher] button')].map(e=>{const r=e.getBoundingClientRect();return {label:e.title,x:r.x,y:r.y,w:r.width,h:r.height}})};
  });
}

async function runMatrix(browser) {
  const rows=[];
  for(const [w,h] of sizes) {
    if(process.env.LP_QA_WIDTHS && !process.env.LP_QA_WIDTHS.split(',').map(Number).includes(w)) continue;
    const {context,page,errors}=await fixture(browser,w,h);
    try {
      const metrics=await measure(page);
      metrics.errors=errors;
      assert(metrics.documentWidth<=w+1, 'Document overflows horizontally');
      assert(metrics.canvas.h>=h-metrics.toolbar.y-metrics.toolbar.h-2, 'Inspector consumes the canvas height');
      assert(metrics.canvas.y>=metrics.toolbar.y+metrics.toolbar.h-1, 'Canvas overlaps toolbar');
      if(metrics.viewport!=='desktop') assert(metrics.canvas.scrollWidth<=metrics.canvas.clientWidth+1,'Device fit adds unnecessary horizontal scroll');
      for(const button of metrics.deviceButtons) {
        assert(button.x>=0&&button.x+button.w<=w+1,'Device button is clipped');
        assert(button.w>=44&&button.h>=44,'Device button is too small');
      }
      assert.equal(errors.length,0,'Browser runtime errors');
      await page.screenshot({path:path.join(output,`${w}x${h}.png`)});
      rows.push(metrics);
      console.log(`${w}x${h}`,JSON.stringify(metrics));
    } finally {await context.close();}
  }
  fs.writeFileSync(path.join(output,'matrix.json'),JSON.stringify(rows,null,2));
}

async function openPanel(page, width, tab='add') {
  if(width>=1280) {
    const rail=tab==='add'?'add-components':tab;
    if(!(await page.locator('[data-lp-inspector]').isVisible()) || await page.locator(`[data-lp-inspector-rail-btn="${rail}"]`).getAttribute('aria-current')!=='true') {
      await page.locator(`[data-lp-inspector-rail-btn="${rail}"]`).click();
    }
  } else {
    if(!(await page.locator('[data-lp-inspector-drawer]').count())) await page.locator('[data-lp-toolbar-btn="inspector"]').click();
    await page.locator(`[data-lp-inspector-tab-btn="${tab}"]`).click();
  }
}

async function closePanel(page,width) {
  if(width<1280&&await page.locator('[data-lp-inspector-drawer]').count()) await page.keyboard.press('Escape');
}

async function runInteractions(browser) {
  for(const [width,height] of [[1440,900],[820,1180],[375,667],[844,390]]) {
    const {context,page,saves,errors,getDraft}=await fixture(browser,width,height);
    try {
      const count=()=>page.locator('[data-lp-section-chrome="1"]').count();
      const initial=await count();
      await openPanel(page,width,'add');
      await page.locator('[data-lp-add-component-card="video"]').click();
      assert.equal(await count(),initial+1,'Add block failed');
      await openPanel(page,width,'add');
      await page.locator('[data-lp-add-root-tab="layers"]').click();
      const videoRow=page.locator('[data-lp-layer-type="Video"]');
      await videoRow.getByRole('button',{name:'Đưa block lên',exact:true}).click();
      await closePanel(page,width);
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      await page.waitForTimeout(300);
      assert.equal(getDraft().blocks[0].type,'Video','Touch reorder was not saved');
      await openPanel(page,width,'add');
      await page.locator('[data-lp-add-root-tab="layers"]').click();
      await page.locator('[data-lp-layer-type="Video"]').getByRole('button',{name:'Xóa',exact:true}).click();
      assert.equal(await count(),initial,'Delete block failed');
      await closePanel(page,width);
      await page.locator('[data-lp-toolbar-btn="undo"]').click();
      assert.equal(await count(),initial+1,'Undo delete failed');
      await page.locator('[data-lp-toolbar-btn="redo"]').click();
      assert.equal(await count(),initial,'Redo delete failed');
      const field=page.locator('[data-lp-inline-field="headline"]').first();
      await field.dispatchEvent('dblclick',{button:0,bubbles:true});
      await field.fill('Responsive QA edited');
      await field.evaluate(el=>el.blur());
      for(const mode of ['mobile','tablet','desktop']) {
        await page.locator(`[data-lp-toolbar-btn="${mode}"]`).click();
        await page.waitForTimeout(180);
        assert.equal(await field.innerText(),'Responsive QA edited','Device switch lost text');
        assert.equal(await count(),initial,'Device switch lost blocks');
        const logical=await page.locator('[data-lp-preview-viewport]').evaluate(el=>el.offsetWidth);
        assert(mode==='desktop'?logical>=1280:logical===(mode==='tablet'?768:390),'Incorrect logical preview width');
      }
      await closePanel(page,width);
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      await page.waitForTimeout(300);
      assert(saves.length>0&&getDraft().blocks.some(b=>b.headline==='Responsive QA edited'),'Draft request lost edited text');
      // Native CSS media and Tailwind breakpoints must follow preview width, independently of host.
      await page.addStyleTag({content:'.qa-width-probe{width:13px}@media(min-width:700px){.qa-width-probe{width:29px}}'});
      for(const mode of ['mobile','tablet','desktop']) {
        await page.locator(`[data-lp-toolbar-btn="${mode}"]`).click();
        await page.evaluate(()=>{
          const p=document.createElement('div');p.className='qa-width-probe grid grid-cols-1 md:grid-cols-2';p.innerHTML='<i></i><i></i>';
          document.querySelector('[data-lp-preview-viewport]').appendChild(p);
        });
        const actual=await page.locator('.qa-width-probe').evaluate(el=>({width:getComputedStyle(el).width,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length}));
        assert.equal(actual.width,mode==='mobile'?'13px':'29px','CSS breakpoint follows host instead of preview');
        assert.equal(actual.columns,mode==='mobile'?1:2,'Tailwind breakpoint follows host instead of preview');
        await page.locator('.qa-width-probe').evaluate(el=>el.remove());
      }
      // Modal controls must remain inside the viewport and accept focus above the drawer.
      for(const [card,modal] of [['image','[data-lp-media-dialog]'],['section','[data-lp-section-library-shell]'],['button','[data-lp-button-library-shell]']]) {
        await openPanel(page,width,'add');
        await page.locator('[data-lp-add-root-tab="add"]').click();
        await page.locator(`[data-lp-add-component-card="${card}"]`).click();
        await page.locator(modal).waitFor({state:'visible'});
        const r=await page.locator(modal).boundingBox();
        assert(r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1,`${card} modal outside viewport`);
        if(card==='image') {await page.locator('[data-lp-media-search]').fill('QA'); assert.equal(await page.locator('[data-lp-media-search]').inputValue(),'QA');}
        await page.screenshot({path:path.join(output,`${width}x${height}-${card}-modal.png`)});
        await page.keyboard.press('Escape');
      }
      await page.locator('[data-lp-toolbar-btn="mobile"]').click();
      await page.locator('[data-lp-preview-switch]').click();
      await page.locator('[data-lp-fullscreen-preview-surface]').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-lp-preview-viewport]').evaluate(el=>el.offsetWidth),390,'Fullscreen mobile preview uses host width');
      await page.locator('[data-lp-preview-switch]').click();
      await page.locator('[data-lp-canvas-context-menu]').click({button:'right',position:{x:24,y:96}});
      const menu=page.locator('[data-lp-canvas-context-menu-content]');
      await menu.waitFor({state:'visible'});
      const menuRect=await menu.boundingBox();
      assert(menuRect.x>=0&&menuRect.y>=0&&menuRect.x+menuRect.width<=width+1&&menuRect.y+menuRect.height<=height+1,'Context menu is clipped');
      await page.keyboard.press('Escape');
      await page.setViewportSize({width:height,height:width});
      assert.equal(await field.innerText(),'Responsive QA edited','Rotation lost edited text');
      await page.setViewportSize({width,height});
      await page.locator(`[data-lp-toolbar-btn="${width>=1280?'desktop':width<768?'mobile':'tablet'}"]`).click();
      await field.dispatchEvent('dblclick',{button:0,bubbles:true});
      await field.evaluate(el=>el.blur());
      await openPanel(page,width,'content');
      await page.waitForTimeout(400);
      const panelMetrics=await measure(page);
      if(width>=1280) {
        assert(panelMetrics.canvas.x+panelMetrics.canvas.w<=panelMetrics.inspector.x+1,'Inspector overlaps the canvas column');
        assert(panelMetrics.preview.x+panelMetrics.preview.w<=panelMetrics.canvas.x+panelMetrics.canvas.w+1,'Preview is clipped behind inspector');
      } else {
        const drawer=await page.locator('[data-lp-inspector-drawer]').boundingBox();
        assert(drawer.x>=0&&drawer.x+drawer.width<=width+1&&drawer.y+drawer.height<=height+1,'Inspector drawer is clipped');
      }
      await page.screenshot({path:path.join(output,`${width}x${height}-panel.png`)});
      assert.equal(errors.length,0,errors.join('\n'));
      if(width===1440) {
        await page.locator('[data-lp-toolbar-btn="back"]').click();
        await page.locator('[data-lp-builder-root]').waitFor({state:'detached'});
        const leftovers=await page.evaluate(()=>{
          let count=0;
          const visit=rules=>{for(const rule of rules){if(rule.selectorText?.includes(':where(:not([data-lp-preview-viewport] *))'))count++;if(rule.cssRules)visit(rule.cssRules);}};
          for(const sheet of document.styleSheets){try{visit(sheet.cssRules)}catch{}}
          return count;
        });
        assert.equal(leftovers,0,'Builder preview leaked CSS changes after navigation');
      }
      console.log(`PASS ${width}x${height}: add/edit/delete/reorder, undo/redo, draft payload, device modes, breakpoints, modals, preview, rotation`);
    } finally {await context.close();}
  }
}

async function runGeometry(browser) {
  for(const [width,height,mode] of [[1440,900,'desktop'],[820,1180,'tablet'],[375,667,'mobile']]) {
    if(process.env.LP_QA_GEOMETRY_WIDTH && width!==Number(process.env.LP_QA_GEOMETRY_WIDTH)) continue;
    const {context,page,errors,getDraft}=await fixture(browser,width,height);
    try {
      const touchSession=process.env.LP_QA_TOUCH==='1'?await context.newCDPSession(page):null;
      const pointerDown=async(x,y)=>{
        if(touchSession) await touchSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
        else {await page.mouse.move(x,y);await page.mouse.down();}
      };
      const pointerMove=async(x,y)=>{
        if(touchSession) await touchSession.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
        else await page.mouse.move(x,y,{steps:8});
      };
      const pointerUp=async()=>{
        if(touchSession) await touchSession.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        else await page.mouse.up();
      };
      await page.locator(`[data-lp-toolbar-btn="${mode}"]`).click();
      const field=page.locator('[data-lp-inline-field="headline"]').first();
      await field.dispatchEvent('dblclick',{button:0,bubbles:true});
      await field.evaluate(el=>el.blur());
      const scroll=page.locator('[data-lp-canvas-scroll]');
      for(let i=0;i<10;i++) {
        await scroll.dispatchEvent('wheel',{deltaY:-100,ctrlKey:true,bubbles:true,cancelable:true,clientX:width/2,clientY:height/2});
      }
      await page.waitForFunction(()=>Number(document.querySelector('[data-lp-canvas-zoom-layer]')?.getAttribute('data-lp-canvas-zoom-user'))>=1.499);
      await page.waitForTimeout(400);
      await page.locator('[data-lp-canvas-scroll]').evaluate((el,left)=>el.scrollTo({top:0,left}),width<500?100:0);
      await page.waitForTimeout(150);
      const wrap=field.locator('xpath=..');
      const scale=await wrap.evaluate(el=>{
        let scale=1;
        for(let node=el;node;node=node.parentElement){const t=getComputedStyle(node).transform;if(t!=='none'){const m=new DOMMatrixReadOnly(t);scale*=Math.hypot(m.a,m.b);}}
        return scale;
      });
      const before=await wrap.boundingBox();
      const move=page.locator('[data-lp-vertical-tool="move"]');
      const handle=await move.boundingBox();
      if(process.env.LP_QA_DEBUG) console.log('GEOMETRY', {width,scale,before,handle,draggable:await move.getAttribute('draggable'),target:await page.locator('[data-lp-element-primary="1"]').evaluateAll(es=>es.map(e=>({tag:e.tagName,field:e.getAttribute('data-lp-inline-field'),id:e.getAttribute('data-lp-free-id')})))});
      assert(handle&&handle.y>=0&&handle.y+handle.height<=height,'Move handle is clipped');
      await pointerDown(handle.x+handle.width/2,handle.y+handle.height/2);
      if(process.env.LP_QA_DEBUG) console.log('POINTER DOWN',await page.evaluate(()=>document.querySelector('[data-lp-free-dragging="1"]')?.getAttribute('data-lp-free-id')));
      await pointerMove(handle.x+handle.width/2+96,handle.y+handle.height/2);
      if(process.env.LP_QA_DEBUG) console.log('LIVE MOVE',await wrap.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),style:el.getAttribute('style'),dragging:el.getAttribute('data-lp-free-dragging')})));
      await pointerUp();
      await page.waitForTimeout(300);
      const moved=await wrap.boundingBox();
      if(process.env.LP_QA_DEBUG) console.log('AFTER MOVE',await wrap.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),style:el.getAttribute('style'),dragging:el.getAttribute('data-lp-free-dragging')})));
      assert(Math.abs((moved.x-before.x)-96)<=12,`Drag at combined scale ${scale}: moved ${moved.x-before.x}, expected 96px (snap tolerance 12px)`);
      const east=wrap.locator('[data-lp-resize-handle="e"]');
      const e=await east.boundingBox();
      assert(e,'Resize handle missing');
      const textBefore=await field.boundingBox();
      await pointerDown(e.x+e.width/2,e.y+e.height/2);
      await pointerMove(e.x+e.width/2+32,e.y+e.height/2);
      await pointerUp();
      await page.waitForTimeout(300);
      const textAfter=await field.boundingBox();
      assert(Math.abs(textAfter.width-textBefore.width-32)<=3,`Resize at combined scale ${scale}: changed ${textAfter.width-textBefore.width}, expected 32px`);
      const after=await wrap.boundingBox();
      assert(Math.abs(after.width-textAfter.width-8*scale)<=3,'Selection border no longer hugs the text box');
      const freeId=await wrap.getAttribute('data-lp-free-id');
      await page.locator('[data-lp-toolbar-btn="save"]').click();
      await page.waitForTimeout(200);
      assert(getDraft().meta?.elementFreeLayouts?.[freeId]?.x>0,'Draft payload lost dragged coordinates');
      assert(getDraft().meta?.inlineTextStyles?.[freeId]?.width>0,'Draft payload lost resized width');
      assert.equal(errors.length,0,errors.join('\n'));
      await page.screenshot({path:path.join(output,`${width}x${height}-zoom-drag-resize.png`)});
      console.log(`PASS ${width}x${height}: zoom 150%, cumulative scale ${scale.toFixed(3)}, drag 96px, resize 32px, selection bounds, saved geometry${touchSession?', emulated touch':''}`);
    } finally {await context.close();}
  }
}

async function main(){
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true});
  try{
    if(process.argv.includes('--interactions')) await runInteractions(browser);
    else if(process.argv.includes('--geometry')) await runGeometry(browser);
    else await runMatrix(browser);
  }finally{await browser.close();}
}
module.exports={fixture,measure};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
