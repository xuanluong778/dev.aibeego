/** Reproduce course generation with the configured provider; no DB or page writes. */
import '../apps/api/node_modules/reflect-metadata';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { OpenAiService } from '../apps/api/src/openai/openai.service';
import { normalizeLandingPageAiBrief, prepareLandingPageAiPlan, selectLandingPageTemplate, validateLandingPageAiContent, extractJsonObject } from '../packages/shared/dist';
async function main() {
 const settings=JSON.parse(execFileSync('docker',['exec','marketingspa-api','node','-e','process.stdout.write(JSON.stringify(Object.fromEntries(["OPENAI_API_KEY","OPENAI_MODEL","OPENAI_BASE_URL"].map(k=>[k,process.env[k]]))))'],{encoding:'utf8'}));
 const provider=new OpenAiService({get:(key:string)=>settings[key]} as any);
 const out=process.env.LP_AI_COURSE_OUT || '/var/www/aibeego_com_usr/data/backups/ai-course-fallback-20261031/before-live';mkdirSync(out,{recursive:true});
 const cases=[
  {businessType:'course',productService:'Khóa học kinh doanh online',targetCustomer:'Chủ doanh nghiệp và các shop bán hàng online',pageGoal:'signup'},
  {businessType:'course',brandName:'Minh An',productService:'Khóa học ứng dụng AI trong kinh doanh',targetCustomer:'Chủ doanh nghiệp, các shop bán hàng online',painPoint:'Mất nhiều thời gian viết bài và xử lý công việc lặp lại',uspBenefits:'Học qua bài tập gắn với công việc thực tế; Hướng dẫn xây dựng nội dung theo sản phẩm đang bán',ctaLabel:'Nhận tư vấn khóa học',pageGoal:'consult'},
  {businessType:'course',brandName:'Thương hiệu kiểm tra',productService:'Khóa học kinh doanh online',targetCustomer:'Chủ shop và doanh nghiệp nhỏ',ctaLabel:'Đăng ký Ngay',ctaUrl:'https:thegioidigi.com',pageGoal:'lead'},
 ];
 for(const [index,input]of cases.entries()){
  const brief=normalizeLandingPageAiBrief(input);const plan=prepareLandingPageAiPlan(brief,selectLandingPageTemplate(brief));const attempts:any[]=[];
  const ai=new LandingPageAiService({isConfigured:()=>provider.isConfigured(),chatCompletion:async(params:any)=>{const raw=await provider.chatCompletion(params);let issue='';try{validateLandingPageAiContent(extractJsonObject(raw),brief,plan)}catch(e){issue=e instanceof Error?e.message:'unknown'}attempts.push({raw,issue});console.log('ATTEMPT',index,attempts.length,issue||'valid');return raw;}}as any);
  const started=Date.now();const result=await ai.generate(brief);writeFileSync(`${out}/${index}.json`,JSON.stringify({input,attempts,result,elapsedMs:Date.now()-started},null,2));console.log('RESULT',index,result.source,plan.blocks.map(b=>b.type).join(','));if(result.source!=='ai')process.exitCode=1;
 }
}
main().catch(e=>{console.error(e instanceof Error?e.message.replace(/sk-[\w-]+/g,'[redacted]'):'Canary failed');process.exitCode=1});
