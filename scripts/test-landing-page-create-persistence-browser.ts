/** Real UI + actual backend services with fixture APIs. No customer page writes. */
import '../apps/api/node_modules/reflect-metadata';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { LandingPagesService } from '../apps/api/src/landing-pages/landing-pages.service';
import { prepareLandingPageAiPlan, selectLandingPageTemplate, fallbackLandingPageAiContent } from '../packages/shared/dist';
const base = process.env.LP_SETUP_QA_URL || 'http://127.0.0.1:3150';
const out = process.env.LP_SETUP_QA_OUT || '/var/www/aibeego_com_usr/data/backups/ai-create-persistence-20261031/browser';
async function main() {
 mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true});
 let actor:any={id:'setup-user-a',organizationId:'setup-org-a',role:'SUPER_ADMIN',name:'Setup QA',email:'fixture@example.invalid',organization:{name:'Fixture'}};
 let stored:any=null;const prisma:any={landingPage:{findFirst:async()=>stored,findMany:async({where}:any)=>stored&&stored.organizationId===where.organizationId&&(!where.status||stored.status===where.status)?[stored]:[],create:async({data}:any)=>(stored={...data,id:'fixture-setup-page',publishedSpec:null,createdAt:new Date(),updatedAt:new Date()})}};
 let nextFallback=false;
 const generator={generate:async(brief:any,selection:any)=>{const plan=prepareLandingPageAiPlan(brief,selection||selectLandingPageTemplate(brief));return new LandingPageAiService({isConfigured:()=>!nextFallback,chatCompletion:async()=>JSON.stringify(fallbackLandingPageAiContent(brief,plan))}as any).generate(brief,selection);}};
 const service=new LandingPagesService(prisma,{assertWithinLimit:()=>{}}as any,{}as any,{}as any,generator as any,{}as any);(service as any).ensureSystemTemplates=async()=>{};(service as any).uniqueSlug=async()=> 'fixture-setup-page';
 const token=`e30.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
 await context.addInitScript(value=>localStorage.setItem('ms_access_token',value),token);
 const generations:any[]=[];const creates:any[]=[];let failGenerate=true,failCreate=true,previewCalls=0;let generated:any;
 const summary={schemaVersion:'landing-page-url-crawl.v1',sourceUrl:'https://fixture.example/',finalUrl:'https://fixture.example/',brand:'Thương hiệu từ URL',title:'Thông tin website',description:'Nội dung website',productService:'Sản phẩm từ URL',benefits:[],usp:'USP từ URL',contact:{phone:null,email:null,address:null},faq:[],cta:'Trao đổi',imageUrl:null,logoUrl:null};
 await context.route('**/p/preview/fixture-setup-token',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="vi"><title>Trang landing page</title><h1>Landing page đã tạo</h1></html>'}));
 await context.route('**/api/v1/**',async route=>{
  const request=route.request();const path=new URL(request.url()).pathname.replace('/api/v1','');const reply=(body:any,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path==='/auth/me')return reply(actor);
  if(path==='/billing/subscription')return reply({hasPlan:true,status:'ACTIVE',isExpired:false});
  if(path==='/landing-pages/templates')return reply({items:[]});
  if(path==='/landing-pages/business-profile'){await new Promise(resolve=>setTimeout(resolve,180));return reply({brandName:'Profile mặc định',productService:'Dịch vụ trong profile',industry:'spa',targetCustomer:'Khách trong profile',usp:'Không tự điền lại USP này sau reload',website:'https://profile.example/',isEmpty:false});}
  if(path==='/landing-pages/crawl-url')return reply({summary});
  if(path==='/landing-pages/generate'){const body=request.postDataJSON();generations.push(body);if(failGenerate){failGenerate=false;return reply({message:'Fixture: lỗi mạng khi tạo nội dung'},500)}generated=await service.generateAi(actor,body);return reply(generated);}
  if(path==='/landing-pages'&&request.method()==='GET')return reply(await service.listPages(actor.organizationId,{status:new URL(request.url()).searchParams.get('status')||'ALL'}as any));
  if(path==='/landing-pages'&&request.method()==='POST'){creates.push(request.postDataJSON());if(failCreate){failCreate=false;return reply({message:'Fixture: thử lại lưu cùng bản thiết kế'},500)}return reply(await service.create(actor,request.postDataJSON()));}
  if(path==='/landing-pages/fixture-setup-page/preview-token'){previewCalls++;return reply({previewPath:'/p/preview/fixture-setup-token',token:'fixture-setup-token'});}
  assert.equal(request.method(),'GET','Unexpected fixture mutation: '+path);return reply({items:[],total:0,unreadCount:0,balance:0});
 });
 const page=await context.newPage();page.setDefaultTimeout(25000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const bar=()=>page.locator('[data-lp-create-actions]');const create=()=>page.locator('[data-lp-create-preview-btn]');const live=()=>page.locator('[data-lp-create-live-btn]');const toolbar=()=>page.locator('[data-lp-template-preview-toolbar]');
 const keyA='lp:create-setup:v1:setup-org-a:setup-user-a';
 async function ready(){await page.locator('[data-lp-create-actions][data-lp-setup-ready="1"]').waitFor();}
 async function geometry(name:string){const result=await bar().evaluate(node=>{const r=node.getBoundingClientRect();const side=document.querySelector('[data-app-shell-sidebar]')!.getBoundingClientRect();return{position:getComputedStyle(node).position,left:r.left,right:r.right,bottom:r.bottom,top:r.top,sideRight:side.right,overflow:document.documentElement.scrollWidth>innerWidth,buttons:Array.from(node.querySelectorAll('button')).map(b=>{const rect=b.getBoundingClientRect();return{left:rect.left,right:rect.right,bottom:rect.bottom}})}});assert.equal(result.position,'fixed');assert.equal(result.overflow,false);assert.equal(result.buttons.length,3);assert.ok(Math.abs(result.bottom-page.viewportSize()!.height)<2);if(page.viewportSize()!.width>=1024)assert.ok(Math.abs(result.left-result.sideRight)<2);for(const b of result.buttons)assert.ok(b.left>=0&&b.right<=page.viewportSize()!.width&&b.bottom<=page.viewportSize()!.height);await page.screenshot({path:`${out}/${name}.png`});return result;}
 try{
  await page.goto(`${base}/landing-pages/create`);await ready();await page.waitForFunction(()=>(document.querySelector('#lp-ai-brandName')as HTMLInputElement)?.value==='Profile mặc định');
  assert.deepEqual((await bar().locator('button').allTextContents()).map(text=>text.trim()),['Tạo landing Page','Xem live','Làm mới']);
  await page.locator('[data-lp-create-modes] button').filter({hasText:'Tạo từ Website/URL'}).click();
  const values:Record<string,string>={businessType:'course',brandName:'Thương hiệu riêng A',productService:'Khóa học kinh doanh online',targetCustomer:'Chủ shop bán hàng online',painPoint:'Thiếu kế hoạch nội dung',uspBenefits:'',price:'',offer:'',ctaLabel:'Nhận thông tin',ctaUrl:'',extraNotes:'F5_SENTINEL',imageUrl:'',logoUrl:'',brandColor:'#2563EB',guarantee:'',contactPhone:'0901234567',contactEmail:'fixture@example.invalid',contactAddress:'Địa chỉ doanh nghiệp'};
  await page.locator('#lp-ai-industry').selectOption('course');await page.locator('details summary').click();
  for(const [key,value]of Object.entries(values))if(key!=='businessType')await page.locator(`#lp-ai-${key}`).fill(value);
  await page.locator('#lp-ai-source-url').fill('https://fixture.example/');await page.getByRole('button',{name:'Phân tích URL',exact:true}).click();await page.getByText('Đã đọc: Thông tin website.',{exact:false}).waitFor();
  // Deliberately clear fields that the Business Profile and URL would otherwise refill.
  await page.locator('#lp-ai-uspBenefits').fill('');await page.locator('#lp-ai-tone').selectOption('friendly');await page.getByRole('button',{name:'Tư vấn / đặt lịch',exact:true}).click();
  await page.getByRole('checkbox',{name:'Sử dụng Business Profile'}).uncheck();await page.locator('#lp-ai-extraNotes').fill('F5_SENTINEL cuối cùng');values.extraNotes='F5_SENTINEL cuối cùng';
  await page.reload();await ready();await page.getByRole('button',{name:'Dùng thông tin doanh nghiệp',exact:true}).waitFor();
  for(const [key,value]of Object.entries(values))assert.equal(await page.locator(key==='businessType'?'#lp-ai-industry':`#lp-ai-${key}`).inputValue(),value,key);
  assert.equal(await page.locator('#lp-ai-tone').inputValue(),'friendly');assert.equal(await page.getByRole('checkbox',{name:'Sử dụng Business Profile'}).isChecked(),false);await page.getByText('Đã đọc: Thông tin website.',{exact:false}).waitFor();
  assert.equal(generations.length,0);console.log('PASS complete setup survives immediate F5; reviewed URL, goal/tone and deliberately empty fields restored without profile overwrites');
  await create().click();await page.getByRole('alert').filter({hasText:'Fixture: lỗi mạng'}).waitFor();const firstKey=generations[0].idempotencyKey;
  await page.reload();await ready();await create().click();await toolbar().waitFor();assert.equal(generations[1].idempotencyKey,firstKey);const exact=JSON.parse(JSON.stringify(generated.draftSpec));
  await page.keyboard.press('Escape');await page.reload();await ready();assert.equal(generations.length,2);assert.equal(await live().isDisabled(),true);
  // The primary action reopens the saved design for confirmation without another AI call.
  await create().click();await toolbar().waitFor();assert.equal(generations.length,2);
  await toolbar().getByRole('button',{name:'Lưu vào Trang của tôi',exact:true}).click();await page.locator('[data-lp-template-preview-shell]').getByRole('alert').filter({hasText:'Fixture: thử lại'}).waitFor();
  await toolbar().getByRole('button',{name:'Lưu vào Trang của tôi',exact:true}).evaluate((button:HTMLButtonElement)=>{button.click();button.click()});await toolbar().getByRole('button',{name:'Mở Trang của tôi',exact:true}).waitFor();
  assert.equal(creates.length,2);assert.deepEqual(creates[0],creates[1]);assert.deepEqual(JSON.parse(JSON.stringify(stored.draftSpec)),exact);assert.equal(stored.status,'DRAFT');assert.equal(stored.publishedSpec,null);assert.equal(page.url().endsWith('/landing-pages/create'),true);
  await page.locator('[data-lp-template-preview-shell]').getByText('Đã lưu vào Trang của tôi',{exact:true}).waitFor();
  await page.screenshot({path:`${out}/saved-preview.png`});
  await toolbar().getByRole('button',{name:'Mở Trang của tôi',exact:true}).click();await page.waitForURL('**/landing-pages/pages');
  await page.locator('[data-lp-pages-list]').getByText(values.brandName,{exact:true}).waitFor();await page.reload();await page.locator('[data-lp-pages-list]').getByText(values.brandName,{exact:true}).waitFor();
  await page.screenshot({path:`${out}/saved-my-pages.png`});
  assert.equal(creates.length,2);assert.equal(stored.draftSpec.meta.aiSource,'ai');
  await page.goto(`${base}/landing-pages/create`);await ready();await create().click();await toolbar().getByRole('button',{name:'Mở Trang của tôi',exact:true}).waitFor();await page.keyboard.press('Escape');
  console.log('PASS explicit save confirmation, authoritative saved status and My Pages row survive F5 without duplicate inserts');
  await page.reload();await ready();assert.equal(await live().isEnabled(),true);assert.equal(generations.length,2);const popupPromise=context.waitForEvent('page');await live().click();const popup=await popupPromise;await popup.waitForURL('**/p/preview/fixture-setup-token');await popup.close();assert.equal(previewCalls,1);
  console.log('PASS stable generation/create retry after F5; exact draft and created-page reference restored; Xem live opens actual preview URL in a new tab');
  await page.locator('details summary').click();
  await page.locator('#lp-ai-extraNotes').fill('Thông tin vẫn được giữ khi thử lại AI');
  nextFallback=true;
  await create().click();await toolbar().waitFor();assert.equal(generated.source,'fallback');const fallbackKey=generations.at(-1).idempotencyKey;
  await page.keyboard.press('Escape');await page.reload();await ready();nextFallback=false;const beforeFallbackRetry=generations.length;
  await create().evaluate((button:HTMLButtonElement)=>{button.click();button.click()});await toolbar().waitFor();
  assert.equal(generations.length,beforeFallbackRetry+1);assert.notEqual(generations.at(-1).idempotencyKey,fallbackKey);assert.equal(generated.source,'ai');
  assert.equal(await page.locator('#lp-ai-extraNotes').inputValue(),'Thông tin vẫn được giữ khi thử lại AI');assert.equal(creates.length,2);await page.keyboard.press('Escape');
  console.log('PASS restored fallback explicitly retries AI with a new key, preserves entered data and guards double click');
  await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await geometry('desktop-expanded');await page.getByRole('button',{name:'Đóng sidebar chính',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-lp-create-actions]')!.getBoundingClientRect().left<60);await geometry('desktop-collapsed');
  for(const width of [820,390,320]){await page.setViewportSize({width,height:850});await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));const rect=await geometry(`responsive-${width}`);const tone=await page.locator('#lp-ai-tone').boundingBox();assert.ok(tone&&tone.y+tone.height<=rect.top,'Last input must clear fixed toolbar');}
  await page.setViewportSize({width:1440,height:1000});
  actor={...actor,id:'setup-user-b',organizationId:'setup-org-b'};await page.reload();await ready();await page.waitForFunction(()=>(document.querySelector('#lp-ai-brandName')as HTMLInputElement)?.value==='Profile mặc định');assert.equal(await live().isDisabled(),true);await page.locator('#lp-ai-brandName').fill('Thiết lập riêng B');
  actor={...actor,id:'setup-user-a',organizationId:'setup-org-a'};await page.reload();await ready();assert.equal(await page.locator('#lp-ai-brandName').inputValue(),values.brandName);assert.equal(await live().isEnabled(),true);
  await page.locator('[data-lp-create-reset-btn]').click();await page.getByRole('button',{name:'Giữ thông tin',exact:true}).click();assert.equal(await page.locator('#lp-ai-brandName').inputValue(),values.brandName);
  await page.locator('[data-lp-create-reset-btn]').click();await page.getByRole('button',{name:'Làm mới thiết lập',exact:true}).click();await page.reload();await ready();
  await page.waitForFunction(()=>!(document.querySelector('button')as HTMLButtonElement)?.disabled);await page.waitForTimeout(300);
  for(const key of Object.keys(values))assert.equal(await page.locator(key==='businessType'?'#lp-ai-industry':`#lp-ai-${key}`).inputValue(),'','Reset '+key);
  assert.equal(await page.locator('#lp-ai-source-url').inputValue(),'');assert.equal(await live().isDisabled(),true);const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),keyA);assert.ok(Object.values(saved.fields).every(v=>v===''));assert.equal(saved.aiPreview,null);assert.equal(saved.createdPage,null);assert.equal(stored.id,'fixture-setup-page');assert.equal(creates.length,2);assert.deepEqual(errors,[]);
  console.log('PASS fixed actions follow sidebar; desktop/mobile no overflow/content overlap; accounts isolated; reset cancellation preserves form and confirmed reset stays blank after F5 without deleting pages');
  writeFileSync(`${out}/report.json`,JSON.stringify({base,errors,generationRequests:generations.length,createRequests:creates.length,previewCalls,noCustomerWrites:true},null,2));console.log('CREATE_PERSISTENCE_BROWSER=PASS');
 }catch(error){console.error('PAGE',page.url(),errors);await page.screenshot({path:`${out}/failure.png`});throw error}finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
