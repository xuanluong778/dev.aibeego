// Run in the current API container: docker exec -i marketingspa-api node < this-file.
// Uses the real ZIP parser/importBulk with fixture persistence only; no database or disk writes.
const assert=require('node:assert/strict'),{createRequire}=require('node:module');
const req=createRequire('/app/package.json'),p=req('/app/dist/landing-pages/template-pack'),{LandingPageTemplatePackService}=req('/app/dist/landing-pages/landing-page-template-pack.service');
const shared=req('@marketingspa/shared');
(async()=>{
 const user={id:'bulk-qa',role:'SUPER_ADMIN',organizationId:'bulk-qa'},saved=[];
 const service=new LandingPageTemplatePackService({landingPageTemplate:{findFirst:async({where})=>Number(where.slug.split('-').at(-1))%2?{id:'fixture'}:null}});
 service.importNew=async(_,file)=>{const pack=service.parseUpload(file);saved.push({slug:pack.manifest.slug,kind:'created'});return{slug:pack.manifest.slug}};
 service.importUpdate=async(_,slug,file)=>{assert.equal(service.parseUpload(file).manifest.slug,slug);saved.push({slug,kind:'updated'});return{slug}};
 const spec=shared.createBlankLandingPageSpec();const padding=Buffer.alloc(955000,0x61),entries=[];
 for(let i=0;i<200;i++){
  const manifest={format:p.TEMPLATE_PACK_FORMAT,formatVersion:p.TEMPLATE_PACK_FORMAT_VERSION,slug:'bulk-fixture-'+i,name:'Mẫu kiểm tra '+i,category:'agency',theme:'MODERN',description:'Fixture',tags:[]};
  const data=p.buildStoredZip([{name:'manifest.json',data:Buffer.from(JSON.stringify(manifest))},{name:'template.json',data:Buffer.from(JSON.stringify(spec))},{name:'assets/photo.png',data:padding}]);
  entries.push({name:'packs/'+manifest.slug+'.zip',data});
 }
 let bundle=p.buildStoredZip(entries);entries.length=0;
 assert.ok(bundle.length>191474115&&bundle.length<200*1024*1024,'Reproduce the real 191 MB upload range');
 const result=await service.importBulk(user,[{originalname:'all-landing-templates.zip',buffer:bundle,size:bundle.length}]);
 assert.equal(result.total,200);assert.equal(result.created,100);assert.equal(result.updated,100);assert.equal(result.failed,0);assert.equal(saved.length,200);
 const byteLength=bundle.length;bundle=null;
 const partial=await service.importBulk(user,[{originalname:'ok.html',buffer:Buffer.from('<!doctype html><html><head><title>Fixture</title></head><body><h1>Xin chào</h1><p>Nội dung kiểm tra</p></body></html>')},{originalname:'bad.zip',buffer:Buffer.from('not a zip')}]);
 assert.equal(partial.created,1);assert.equal(partial.failed,1);
 await assert.rejects(service.importBulk({...user,role:'OWNER'},[]),/quản trị/);
 await assert.rejects(service.importBulk(user,[]),/Chưa chọn/);
 console.log(JSON.stringify({passed:true,bundleBytes:byteLength,templates:200,created:100,updated:100,partialFailureIsolated:true,adminGuardPreserved:true,noCustomerWrites:true}));
})().catch(e=>{console.error(e);process.exitCode=1});
