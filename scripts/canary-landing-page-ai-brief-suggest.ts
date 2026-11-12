import '../apps/api/node_modules/reflect-metadata';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { OpenAiService } from '../apps/api/src/openai/openai.service';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { normalizeLandingPageBriefSuggestInput, LANDING_PAGE_BRIEF_SUGGEST_FIELDS } from '../packages/shared/dist';
async function main() {
  const settings = JSON.parse(execFileSync('docker', ['exec', 'marketingspa-api', 'node', '-e', 'process.stdout.write(JSON.stringify(Object.fromEntries(["OPENAI_API_KEY","OPENAI_MODEL","OPENAI_BASE_URL"].map(key=>[key,process.env[key]]))))'], { encoding: 'utf8' }));
  const provider = new OpenAiService({ get: (key: string) => settings[key] } as any);
  if (!provider.isConfigured()) { console.log('LIVE_AI_NOT_CONFIGURED'); return; }
  const ai = new LandingPageAiService(provider);
  const output = '/var/www/aibeego_com_usr/data/backups/ai-brief-suggestions-20261031/live'; mkdirSync(output, { recursive: true });
  for (const field of LANDING_PAGE_BRIEF_SUGGEST_FIELDS) {
    const result = await ai.suggestBriefField(normalizeLandingPageBriefSuggestInput({ field, businessType: 'saas', productService: 'Phần mềm quản lý công việc', targetCustomer: field === 'targetCustomer' ? '' : 'Chủ doanh nghiệp nhỏ và các shop bán hàng online', painPoint: '', uspBenefits: '', pageGoal: 'consult' }));
    writeFileSync(`${output}/${field}.json`, JSON.stringify(result, null, 2));
    console.log(field, result.source, result.options.length);
    if (result.source !== 'ai') process.exitCode = 1;
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message.replace(/sk-[\w-]+/g, '[redacted]') : 'Live check failed'); process.exitCode = 1; });
