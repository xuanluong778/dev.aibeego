/** Regression for POST /landing-pages: blank mode and existing creation sources.
 * Run inside the API image with no network: node /qa/test-landing-page-blank-create.cjs
 * LP_BLANK_API_ROOT selects a compiled API root (default /app).
 * LP_BLANK_QA_OUT selects the report directory. --baseline records pre-fix behavior.
 * LP_BLANK_BASELINE_REPORT optionally compares other creation modes to a baseline JSON.
 * Database operations use fixtures only; no credentials or customer writes.
 */
const {createRequire}=require('module');
const path=require('node:path');
const apiRoot=process.env.LP_BLANK_API_ROOT || '/app';
const out=process.env.LP_BLANK_QA_OUT;
const req=createRequire(path.join(apiRoot,'package.json'));
req('reflect-metadata');
const assert=require('node:assert/strict');
const fs=require('fs');
const {ValidationPipe,Controller,Post,Body,Module}=req('@nestjs/common');
const {NestFactory}=req('@nestjs/core');
const {LandingPagesService}=req(path.join(apiRoot,'dist/landing-pages/landing-pages.service'));
const {CreateLandingPageDto}=req(path.join(apiRoot,'dist/landing-pages/dto/landing-pages.dto'));
const shared=req('@marketingspa/shared');
const baseline=process.argv.includes('--baseline');
const user={id:'qa-user',organizationId:'qa-org',role:'OWNER'};
let writes=[];
let templateLookups=0;
const templateSpec=shared.createEmptyLandingPageSpec('PREMIUM');
templateSpec.blocks[0].headline='Fixture template content';
const template={id:'qa-template',slug:'qa-template',organizationId:null,isSystem:true,theme:'PREMIUM',publishStatus:'PUBLISHED',tags:[],definition:templateSpec,publishedDefinition:templateSpec};
const prisma={landingPage:{findFirst:async()=>null,create:async({data})=>{writes.push(data);return {...data,id:'qa-page-'+writes.length,publishedSpec:null,createdAt:new Date('2026-01-01'),updatedAt:new Date('2026-01-01')}}},landingPageTemplate:{findFirst:async()=>{templateLookups++;return template;}}};
const service=new LandingPagesService(prisma,{}, {}, {}, {}, {}, undefined);
service.ensureSystemTemplates=async()=>{};
service.uniqueSlug=async()=> 'qa-page';
let calls=0;
class FixtureController{async create(dto){calls++;return service.create(user,dto);}}
Controller('landing-pages')(FixtureController);
Post()(FixtureController.prototype,'create',Object.getOwnPropertyDescriptor(FixtureController.prototype,'create'));
Body()(FixtureController.prototype,'create',0);
Reflect.defineMetadata('design:paramtypes',[CreateLandingPageDto],FixtureController.prototype,'create');
class FixtureModule{}
Module({controllers:[FixtureController]})(FixtureModule);
const stripIds=value=>Array.isArray(value)?value.map(stripIds):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>k!=='id').map(([k,v])=>[k,stripIds(v)])):value;
async function main(){
 const app=await NestFactory.create(FixtureModule,{logger:['error']});
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
 await app.listen(0,'127.0.0.1');
 const url=await app.getUrl();
 async function post(body){const r=await fetch(url+'/landing-pages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
 try{
  const request={name:'Landing Page mới',mode:'blank',idempotencyKey:'qa-blank'};
  const blank=await post(request);
  if(baseline){assert.equal(blank.status,400);assert.ok(blank.body.message.some(m=>m.includes('mode')));console.log('PASS reproduced production 400: property mode should not exist');}
  else{
   assert.equal(blank.status,201,JSON.stringify(blank));
   assert.equal(blank.body.status,'DRAFT');assert.equal(blank.body.templateId,null);assert.equal(blank.body.publishedSpec,null);
   assert.equal(blank.body.theme,'MINIMAL');assert.equal(blank.body.draftSpec.theme,'MINIMAL');
   assert.equal(blank.body.draftSpec.meta.rendererVersion,'blank-starter-v1');
   assert.deepEqual(blank.body.draftSpec.blocks.map(b=>b.type),['Header','Hero','LeadForm','Features','CTA','Footer']);
   assert.equal(shared.validateLandingPageSpec(blank.body.draftSpec).ok,true);
   const before=writes.length;
   const replay=await post(request);assert.equal(replay.status,201);assert.deepEqual(replay.body,blank.body);assert.equal(writes.length,before);
   const both=await Promise.all([post({...request,idempotencyKey:'qa-concurrent'}),post({...request,idempotencyKey:'qa-concurrent'})]);
   assert.equal(both[0].status,201);assert.deepEqual(both[0],both[1]);assert.equal(writes.length,before+1);
   const ids1=blank.body.draftSpec.blocks.map(b=>b.id),ids2=both[0].body.draftSpec.blocks.map(b=>b.id);assert.ok(ids1.every(id=>!ids2.includes(id)));
   assert.equal(templateLookups,0);
   console.log('PASS blank HTTP 201, persisted six-section draft, matching theme, distinct IDs, sequential and concurrent retry deduplication');
   for(const source of [{templateSlug:'qa-template'},{templateId:'qa-template'},{draftSpec:templateSpec}]){const before=writes.length;const result=await post({name:'Mixed sources',mode:'blank',...source});assert.equal(result.status,400);assert.equal(writes.length,before);}
   console.log('PASS blank cannot override template or AI/URL sources');
  }
  const before=calls;
  for(const payload of [{name:'Invalid',mode:'ai'},{name:'Invalid',mode:1},{name:'Invalid',unknownField:true},{name:'',mode:'blank'},{name:'a'.repeat(121),mode:'blank'}])assert.equal((await post(payload)).status,400);
  assert.equal(calls,before);console.log('PASS strict validation still rejects invalid modes, unknown fields and invalid names');
  const aiSpec=shared.createEmptyLandingPageSpec('BOLD');aiSpec.meta={aiGenerationId:'qa-ai-generation',aiSource:'ai'};aiSpec.blocks[0].headline='Exact confirmed AI preview';
  const urlSpec=shared.createEmptyLandingPageSpec('CORPORATE');urlSpec.meta={aiGenerationId:'qa-url-generation',aiSource:'fallback'};urlSpec.blocks[0].headline='Exact reviewed URL preview';
  const cases={legacy:{name:'Legacy no mode'},legacyTheme:{name:'Legacy theme',theme:'BOLD'},templateSlug:{name:'Template slug',templateSlug:'qa-template'},templateId:{name:'Template ID',templateId:'qa-template'},ai:{name:'AI preview',draftSpec:aiSpec},url:{name:'URL preview',draftSpec:urlSpec}};
  const outputs={};
  for(const [name,body]of Object.entries(cases)){
   const result=await post(body);assert.equal(result.status,201,name+': '+JSON.stringify(result));
   assert.notEqual(result.body.draftSpec.meta?.rendererVersion,'blank-starter-v1');
   if(body.draftSpec)assert.deepEqual(result.body.draftSpec,JSON.parse(JSON.stringify(shared.sanitizeLandingPageSpec(body.draftSpec))));
   if(body.templateId||body.templateSlug){assert.equal(result.body.templateId,template.id);assert.equal(result.body.theme,'PREMIUM');assert.equal(result.body.draftSpec.blocks[0].headline,'Fixture template content');assert.notEqual(result.body.draftSpec.blocks[0].id,templateSpec.blocks[0].id);}
   outputs[name]=stripIds(result.body);
  }
  assert.deepEqual(template.definition,templateSpec);
  if(baseline && out)fs.writeFileSync(path.join(out,'baseline-results.json'),JSON.stringify(outputs,null,2));
  if(!baseline && process.env.LP_BLANK_BASELINE_REPORT)assert.deepEqual(outputs,JSON.parse(fs.readFileSync(process.env.LP_BLANK_BASELINE_REPORT,'utf8')));
  console.log('PASS legacy/default, explicit theme, template slug/ID, AI and URL exact preview persistence'+(baseline?' baseline':' passed'));
  if(out)fs.writeFileSync(path.join(out,(baseline?'baseline':'candidate')+'-report.json'),JSON.stringify({passed:true,noCustomerWrites:true,blankStatus:blank.status,regressionModes:Object.keys(cases),writes:writes.length},null,2));
 }finally{await app.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
