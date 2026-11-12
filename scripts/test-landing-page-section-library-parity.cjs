/** Pure catalog/persistence regression; no server or customer data access. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loadTs(rel,stubs={}){const file=path.join(root,rel),m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));const originalRequire=m.require.bind(m);m.require=name=>Object.hasOwn(stubs,name)?stubs[name]:name.startsWith('.')&&fs.existsSync(path.resolve(path.dirname(file),name+'.ts'))?loadTs(path.relative(root,path.resolve(path.dirname(file),name+'.ts')),stubs):originalRequire(name);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);return m.exports;}
const dir='apps/web/src/components/landing-pages/';
const catalog=loadTs(dir+'landing-page-section-library-catalog.ts');
const {LP_SECTION_LIBRARY_TEMPLATES,materializeSectionLibraryTemplate}=catalog;
const {readSectionLibraryContext}=loadTs(dir+'landing-page-section-library-context.ts');
const shared=require('../packages/shared/dist');
const unchanged=JSON.stringify(LP_SECTION_LIBRARY_TEMPLATES);let seq=0;const uid=p=>p+'_'+(++seq);
const stripIds=x=>Array.isArray(x)?x.map(stripIds):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>k!=='id').map(([k,v])=>[k,stripIds(v)])):x;
assert.equal(LP_SECTION_LIBRARY_TEMPLATES.length,100);
for(const template of LP_SECTION_LIBRARY_TEMPLATES){
 const raw=materializeSectionLibraryTemplate(template,uid);
 const parent=shared.createBlankLandingPageSpec(),snapshot=JSON.stringify(parent);
 const initial=shared.sanitizeLandingPageDraftSpec({...parent,blocks:[...parent.blocks,raw]});
 const persisted=shared.sanitizeLandingPagePersistSpec(JSON.parse(JSON.stringify(initial)));
 const saved=persisted.blocks.find(b=>b.id===raw.id);assert.ok(saved,template.id+' survives save');
 assert.deepEqual(readSectionLibraryContext(saved),readSectionLibraryContext(raw),template.id+' keeps section design');
 assert.equal(readSectionLibraryContext(saved).templateId,template.id);
 assert.equal(JSON.stringify(parent),snapshot,'Existing page was mutated');
 for(const key of ['headline','subheadline','body','ctaLabel','submitLabel','successMessage'])if(typeof saved[key]==='string'&&typeof raw[key]==='string')assert.equal(saved[key],raw[key],template.id+' '+key);
 const again=materializeSectionLibraryTemplate(template,uid);assert.notEqual(again.id,raw.id);
 for(const key of ['items','plans','fields'])if(raw[key]){assert.equal(saved[key].length,raw[key].length,template.id+' '+key+' length');assert.ok(raw[key].every((row,i)=>row.id!==again[key][i].id));}
 const clone=shared.cloneLandingPageSpecWithNewIds({...parent,blocks:[saved]}).blocks[0];
 assert.deepEqual(readSectionLibraryContext(clone),readSectionLibraryContext(saved),template.id+' duplicate preserves design');
 assert.deepEqual(stripIds(shared.sanitizeLandingPagePersistSpec({...parent,blocks:[saved]}).blocks[0]),stripIds(saved));
}
assert.equal(JSON.stringify(LP_SECTION_LIBRARY_TEMPLATES),unchanged,'Catalog mutated');
assert.equal(readSectionLibraryContext(shared.createEmptyLandingPageSpec().blocks[0]),null);
assert.equal(readSectionLibraryContext({style:{lpSectionLibrary:{version:9}}}),null);
console.log('PASS 100 templates: unique block/item IDs, save/reload and duplicate retain section design, text and collection sizes; old pages and catalog unchanged');

const {buildSectionLibraryPreviewSpec}=loadTs(dir+'landing-page-section-library-preview.tsx',{
  './landing-page-renderer':{LandingPageRenderer:()=>null},
  './landing-page-section-library-catalog':catalog,
  '@/lib/utils':{cn:()=>''},
});
for(const template of LP_SECTION_LIBRARY_TEMPLATES){
 const preview=buildSectionLibraryPreviewSpec(template),block=preview.blocks[0];
 assert.ok(block,template.id+' preview survives sanitizer');
 const ids=[block.id,...['items','plans','fields'].flatMap(k=>(block[k]||[]).map(x=>x.id))];
 assert.equal(new Set(ids).size,ids.length,template.id+' preview IDs unique');
 assert.deepEqual(buildSectionLibraryPreviewSpec(template).blocks,preview.blocks,template.id+' preview IDs stable');
 const custom=buildSectionLibraryPreviewSpec(template,{theme:'BOLD',themeTokens:{...shared.LANDING_PAGE_THEME_PRESETS.BOLD,button:'#7c3aed'}});
 assert.equal(readSectionLibraryContext(custom.blocks[0]).theme,'BOLD');
 assert.equal(readSectionLibraryContext(custom.blocks[0]).themeTokens.button,'#7c3aed');
}
console.log('PASS 100 real preview specs: sanitized data, stable unique IDs, custom preview theme preserved');
