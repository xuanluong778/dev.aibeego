// Production integration check: real configured AI + real DB transaction, always rolled back.
// Creates only a temporary QA organization inside the uncommitted transaction.
const { spawnSync } = require('node:child_process');
const code = String.raw`
const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');
const {PrismaClient}=require('@marketingspa/database');
const {LandingPagesService}=require('/app/dist/landing-pages/landing-pages.service.js');
const {LandingPageAiService}=require('/app/dist/landing-pages/landing-page-ai.service.js');
const {OpenAiService}=require('/app/dist/openai/openai.service.js');
const s=require('/app/node_modules/.pnpm/@marketingspa+shared@file+packages+shared/node_modules/@marketingspa/shared/dist');
const p=new PrismaClient();
(async()=>{
 const ai=new LandingPageAiService(new OpenAiService({get:key=>process.env[key]}));
 const generated=await ai.generate(s.normalizeLandingPageAiBrief({businessType:'course',brandName:'QA kiểm tra lưu trang',productService:'Khóa học SEO',targetCustomer:'Doanh nghiệp nhỏ cần tìm hiểu SEO',uspBenefits:'Bài tập viết nội dung theo sản phẩm; Rà soát cấu trúc từng trang',ctaLabel:'Nhận thông tin',pageGoal:'lead'}));
 assert.equal(generated.source,'ai','Provider must generate actual AI content');
 const slug='qa-ai-save-'+randomUUID();let orgId=null;let pageId=null;let result=null;
 try{
  await p.$transaction(async tx=>{
   const org=await tx.organization.create({data:{name:'QA AI save rollback',slug}});orgId=org.id;
   const actor={id:randomUUID(),organizationId:org.id,role:'OWNER'};
   const service=new LandingPagesService(tx,{assertWithinLimit:()=>{}},{},{},ai,{});
   service.ensureSystemTemplates=async()=>{};
   const dto={name:'QA AI save rollback',draftSpec:generated.draftSpec,idempotencyKey:'qa-save-'+randomUUID()};
   const created=await service.create(actor,dto);pageId=created.id;
   assert.equal(created.status,'DRAFT');assert.equal(created.publishedSpec,null);assert.equal(created.draftSpec.meta.aiSource,'ai');
   assert.deepEqual(JSON.parse(JSON.stringify(created.draftSpec)),JSON.parse(JSON.stringify(generated.draftSpec)));
   const second=await service.create(actor,dto);assert.equal(second.id,created.id);
   assert.equal(await tx.landingPage.count({where:{organizationId:org.id}}),1);
   const pages=await service.listPages(org.id,{status:'DRAFT'});
   assert.equal(pages.total,1);assert.equal(pages.items[0].id,created.id);
   const read=await tx.landingPage.findUnique({where:{id:created.id}});assert.ok(read);assert.equal(read.organizationId,org.id);
   result={source:'ai',sections:created.draftSpec.blocks.length,saveReadback:true,myPagesList:true,status:created.status,retrySinglePage:true};
   throw new Error('QA_FORCE_ROLLBACK');
  },{timeout:30000});
 }catch(error){if(error.message!=='QA_FORCE_ROLLBACK')throw error;}
 assert.equal(await p.organization.count({where:{slug}}),0);assert.equal(await p.landingPage.count({where:{id:pageId}}),0);
 console.log(JSON.stringify({...result,rolledBack:true,noCustomerChanges:true}));
})().catch(error=>{console.error(error.message.replace(/(?:postgres(?:ql)?|redis):\/\/\S+/gi,'[redacted]').replace(/sk-[\w-]+/g,'[redacted]'));process.exitCode=1}).finally(()=>p.$disconnect());
`;
const result=spawnSync('docker',['exec','-i','marketingspa-api','node'],{input:code,stdio:['pipe','inherit','inherit']});
if(result.error) throw result.error;
process.exitCode=result.status ?? 1;
