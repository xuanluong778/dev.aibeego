/** Optional live provider check. Uses configured provider only; never touches pages, credits or DB. */
import '../apps/api/node_modules/reflect-metadata';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { LandingPageAiService } from '../apps/api/src/landing-pages/landing-page-ai.service';
import { OpenAiService } from '../apps/api/src/openai/openai.service';
import { normalizeLandingPageAiBrief, findLandingPageContentIssues, validateLandingPageAiContent, prepareLandingPageAiPlan, selectLandingPageTemplate, extractJsonObject } from '../packages/shared/dist';

async function main() {
  let settings: Record<string, string | undefined> = process.env;
  if (process.env.LP_AI_CANARY_USE_DOCKER === '1') {
    // Credential output is captured inside this process, never printed or written to disk.
    settings = JSON.parse(execFileSync('docker', ['exec', 'marketingspa-api', 'node', '-e', 'process.stdout.write(JSON.stringify(Object.fromEntries(["OPENAI_API_KEY","OPENAI_MODEL","OPENAI_BASE_URL"].map(key=>[key,process.env[key]]))))'], { encoding: 'utf8' }));
  }
  const provider = new OpenAiService({ get: (key: string) => settings[key] } as any);
  if (!provider.isConfigured()) { console.log('LIVE_AI_NOT_CONFIGURED'); return; }
  const output = process.env.LP_AI_CANARY_OUT || '/var/www/aibeego_com_usr/data/backups/ai-landing-upgrade-20261031/live-ai';
  mkdirSync(output, { recursive: true });
  const cases = [
    { businessType: 'spa', brandName: 'An Nhiên', productService: 'Chăm sóc da nhạy cảm', targetCustomer: 'Người muốn tìm dịch vụ phù hợp cho làn da dễ kích ứng', uspBenefits: 'Trao đổi về tình trạng da trước khi chọn dịch vụ; Cho khách kiểm tra danh sách sản phẩm sử dụng', ctaLabel: 'Đặt lịch trao đổi', pageGoal: 'consult' },
    { businessType: 'saas', brandName: 'Minh An', productService: 'Phần mềm quản lý công việc', targetCustomer: 'Nhóm vận hành doanh nghiệp nhỏ', uspBenefits: 'Giao việc theo nhóm; Xem trạng thái công việc trên một bảng; Lưu nội dung trao đổi theo đầu việc', price: '199.000 đồng/tháng', ctaLabel: 'Nhận thông tin giải pháp', pageGoal: 'signup', brandColor: '#FACC15' },
  ];
  for (const [index, input] of cases.entries()) {
    const raw: string[] = [];
    const ai = new LandingPageAiService({ isConfigured: () => provider.isConfigured(), chatCompletion: async (params: any) => { const response = await provider.chatCompletion(params); raw.push(response); return response; } } as any);
    const started = Date.now();
    const brief = normalizeLandingPageAiBrief(input);
    const result = await ai.generate(brief);
    const issues = findLandingPageContentIssues(result.draftSpec);
    writeFileSync(`${output}/${index}-${input.businessType}.json`, JSON.stringify({ result, issues, elapsedMs: Date.now() - started, calls: raw.length }, null, 2));
    if (result.source !== 'ai' && raw.length) {
      try { validateLandingPageAiContent(extractJsonObject(raw.at(-1)!), brief, prepareLandingPageAiPlan(brief, selectLandingPageTemplate(brief))); }
      catch (error) { console.log('LIVE_VALIDATION', input.businessType, error instanceof Error ? error.message.slice(0, 500) : 'invalid content'); }
    }
    console.log(JSON.stringify({ industry: input.businessType, source: result.source, calls: raw.length, sections: result.draftSpec.blocks.length, issues: issues.length, elapsedMs: Date.now() - started }));
    if (result.source !== 'ai' || issues.length) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message.replace(/sk-[\w-]+/g, '[redacted]') : 'Live check failed'); process.exitCode = 1; });
