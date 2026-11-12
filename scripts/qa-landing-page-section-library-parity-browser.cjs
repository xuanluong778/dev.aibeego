// Real Builder UI. Every API request is intercepted; no credentials or customer writes.
const {chromium}=require('playwright'),shared=require('../packages/shared/dist'),fs=require('fs'),assert=require('assert/strict');
const origin=process.env.LP_SECTION_QA_ORIGIN||'http://127.0.0.1:13023',out=process.env.LP_SECTION_QA_OUT||fs.mkdtempSync('/tmp/lp-section-parity-');
const sleep=p=>p.waitForTimeout(350);
function visual(node){
 const fields=[...node.querySelectorAll('[data-lp-inline-field], [data-lp-hero-copy] h1:not([data-lp-inline-field]), [data-lp-hero-copy] p:not([data-lp-inline-field])')].filter(n=>!n.closest('[data-lp-floating-toolbar]')).map(n=>({field:n.dataset.lpInlineField||(n.tagName==='H1'?'headline':n.tagName==='P'?'subheadline':null),text:n.textContent.trim(),font:getComputedStyle(n).fontFamily,size:getComputedStyle(n).fontSize,color:getComputedStyle(n).color}));
 const cta=node.querySelector('[data-lp-hero-cta] a')||node.querySelector('[data-lp-cta-band] a');
 const grid=node.querySelector('[data-lp-hero-grid]');
 return {fields,trust:[...node.querySelectorAll('[data-lp-trust-row]')].map(n=>n.textContent.trim()),images:[...node.querySelectorAll('img')].map(n=>n.getAttribute('src')),cta:cta?{background:getComputedStyle(cta).backgroundImage,color:getComputedStyle(cta).backgroundColor,radius:getComputedStyle(cta).borderRadius,text:cta.innerText.replace('→','').trim(),after:getComputedStyle(cta,'::after').content}:null,grid:grid?{display:getComputedStyle(grid).display,cols:getComputedStyle(grid).gridTemplateColumns.split(' ').length}:null};
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({executablePath:'/snap/chromium/current/usr/lib/chromium-browser/chrome',args:['--no-sandbox']});const page=await b.newPage({viewport:{width:1550,height:1000}});
 let spec=shared.sanitizeLandingPagePersistSpec(shared.createBlankLandingPageSpec()),saves=0;const original=JSON.parse(JSON.stringify(spec.blocks)),report={passed:false,origin,steps:[],errors:[],noCustomerWrites:true};
 await page.addInitScript(()=>localStorage.setItem('ms_access_token','qa.'+btoa(JSON.stringify({exp:Date.now()/1000+3600}))+'.qa'));
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.route('**/api/v1/**',async route=>{const p=new URL(route.request().url()).pathname,m=route.request().method();let body={};
  if(p.endsWith('/auth/me'))body={id:'qa-parity',role:'OWNER',name:'QA',organizationId:'qa-parity',organization:{id:'qa-parity',name:'QA'}};
  else if(p.includes('subscription'))body={hasPlan:true,status:'ACTIVE',isExpired:false};
  else if(p.endsWith('/landing-pages/qa-parity'))body={id:'qa-parity',name:'QA Parity',status:'DRAFT',draftSpec:spec};
  else if(p.endsWith('/autosave')){const payload=route.request().postDataJSON();spec=shared.sanitizeLandingPagePersistSpec(payload.draftSpec);spec.meta={...spec.meta,clientRevision:payload.clientRevision};body={updatedAt:new Date().toISOString(),requestId:payload.requestId,clientRevision:payload.clientRevision};saves++;}
  else if(p.includes('templates'))body={items:[]};else if(!['GET','HEAD'].includes(m))throw Error('Unexpected fixture mutation '+p);
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 async function save(){await page.locator('[data-lp-toolbar-btn="save"]').click();await page.waitForTimeout(2200);}
 async function openLibrary(){await page.locator('[data-lp-section-chrome]').first().evaluate(el=>{const r=el.getBoundingClientRect(),dt=new DataTransfer();dt.setData('application/x-lp-sidebar-preset',JSON.stringify({kind:'section-library-open'}));for(const type of ['dragover','drop'])el.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+r.width/2,clientY:r.bottom-3}));});await page.locator('[data-lp-section-library-modal]').waitFor();}
 async function preview(label){await openLibrary();await page.locator('[data-lp-section-library-search]').fill(label);await page.locator('[data-lp-section-library-preview-btn]').first().click();await page.locator('[data-lp-section-library-lightbox]').waitFor();await sleep(page);return page.locator('[data-lp-section-library-lightbox-canvas] [data-lp-library-canvas]');}
 const root=id=>page.locator(`[data-lp-block-slot="${id}"] [data-lp-library-canvas]`);
 try{
  await page.goto(origin+'/landing-pages/builder/qa-parity');await page.locator('[data-lp-canvas-root]').first().waitFor();
  const prev=await preview('Hero split trái');const before=await prev.evaluate(visual);await page.screenshot({path:out+'/hero-preview.png'});
  await page.locator('[data-lp-section-library-lightbox-insert]').click();await save();
  const hero=spec.blocks.find(x=>x.style?.lpSectionLibrary?.templateId==='hero-02');assert.ok(hero);const inserted=await root(hero.id).evaluate(visual);
  assert.equal(before.grid.cols,2);assert.equal(inserted.grid.cols,2);
  assert.deepEqual(inserted.trust,before.trust);assert.equal(inserted.trust.length,3);assert.deepEqual(inserted.images,before.images);
  for(const key of ['background','color','radius','text'])assert.equal(inserted.cta[key],before.cta[key],'CTA '+key);
  assert.equal(inserted.cta.after,'"→"');
  fs.writeFileSync(out+'/visual-metrics.json',JSON.stringify({before,inserted},null,2));
  for(const field of ['headline','subheadline']){const a=before.fields.find(x=>x.field===field),c=inserted.fields.find(x=>x.field===field);assert.equal(a.text,c.text);assert.equal(a.font,c.font);assert.equal(a.size,c.size);assert.equal(a.color,c.color);}
  assert.equal(await page.locator('[data-lp-canvas-root]').count(),1,'Only the original canvas owns drag coordinates');
  report.steps.push('Hero split: layout, text, trust icons, image, button gradient/radius match preview');
  for(const originalBlock of original){const stored=spec.blocks.find(x=>x.id===originalBlock.id);assert.deepEqual(JSON.parse(JSON.stringify(stored)),originalBlock,'Original section changed');}
  report.steps.push('Original six sections unchanged');
  await page.locator('[data-lp-toolbar-btn="undo"]').click();await sleep(page);assert.equal(await root(hero.id).count(),0);
  await page.locator('[data-lp-toolbar-btn="redo"]').click();await sleep(page);assert.equal(await root(hero.id).count(),1);report.steps.push('Insert undo/redo');
  const title=root(hero.id).locator('[data-lp-inline-field="headline"]').first();await title.dblclick();await title.fill('Nội dung được chỉnh sửa sau khi thêm');await page.keyboard.press('Tab');await save();assert.equal(spec.blocks.find(x=>x.id===hero.id).headline,'Nội dung được chỉnh sửa sau khi thêm');report.steps.push('Inline text editing and autosave');
  // Reload from the acknowledged fixture server, without a local recovery copy.
  await page.evaluate(()=>{const token=localStorage.getItem('ms_access_token');localStorage.clear();if(token)localStorage.setItem('ms_access_token',token);});
  await page.reload();await root(hero.id).waitFor();assert.ok(await root(hero.id).getByText('Nội dung được chỉnh sửa sau khi thêm',{exact:true}).count());assert.deepEqual((await root(hero.id).evaluate(visual)).cta,inserted.cta);report.steps.push('Saved design and edited text survive reload');
  await root(hero.id).locator('[data-lp-section-chrome]').click({position:{x:10,y:10}});
  await sleep(page);await page.getByRole('button',{name:'Nhân bản',exact:true}).last().click();await page.waitForTimeout(1000);await save();const copies=spec.blocks.filter(x=>x.style?.lpSectionLibrary?.templateId==='hero-02');assert.equal(copies.length,2);assert.notEqual(copies[0].id,copies[1].id);assert.deepEqual(copies[0].style.lpSectionLibrary,copies[1].style.lpSectionLibrary);report.steps.push('Duplicate retains design with fresh ID');
  await page.locator('[data-lp-preview-switch]').click();await page.locator('[data-lp-preview-canvas]').waitFor();
  const liveRoot=page.locator(`[data-lp-preview-canvas] [data-lp-block-slot="${hero.id}"] [data-lp-library-canvas]`);const live=await liveRoot.evaluate(visual);assert.deepEqual(live.trust,before.trust);assert.equal(live.cta.background,before.cta.background);assert.equal(live.grid.cols,2);report.steps.push('Page preview retains section appearance');
  for(const device of ['tablet','mobile']){await page.locator(`[data-lp-toolbar-btn="${device}"]`).click();await sleep(page);const info=await liveRoot.evaluate(node=>{const r=node.getBoundingClientRect();return{width:r.width,scroll:node.scrollWidth,client:node.clientWidth,display:getComputedStyle(node.querySelector('[data-lp-hero-grid]')).display,direction:getComputedStyle(node.querySelector('[data-lp-hero-grid]')).flexDirection,cols:getComputedStyle(node.querySelector('[data-lp-hero-grid]')).gridTemplateColumns.split(' ').length}});assert.ok(info.display==='flex'?info.direction==='column':info.cols===1,device+' stacks columns');assert.ok(info.scroll<=info.client+2,device+' no horizontal overflow');report.steps.push(device+' stacks columns without overflow');}
  await page.screenshot({path:out+'/hero-mobile.png'});
  await page.locator('[data-lp-toolbar-btn="desktop"]').click();await page.locator('[data-lp-preview-switch]').click();await root(hero.id).waitFor();
  await page.screenshot({path:out+'/hero-inserted.png'});
  assert.deepEqual(report.errors,[]);report.saves=saves;report.passed=true;console.log(JSON.stringify(report));
 }catch(e){await page.screenshot({path:out+'/failure.png'});fs.writeFileSync(out+'/failure-spec.json',JSON.stringify(spec,null,2));console.error('steps',report.steps,'errors',report.errors);throw e;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
