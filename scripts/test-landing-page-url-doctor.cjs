#!/usr/bin/env node
/**
 * Create-from-URL + AI Page Doctor regression (Landing Page only).
 */
const fs = require('fs');
const path = require('path');
const {
  extractLandingPageUrlSummary,
  analyzeLandingPageHeuristic,
  applyLandingPageDoctorPatches,
  createEmptyLandingPageSpec,
  markLandingPageUserEdits,
  preserveUserEditedFields,
  markLandingPageAiSources,
  applyLandingPageAiCopyToSpec,
  buildFallbackLandingPageAiCopy,
  businessProfileToAiBrief,
} = require('../packages/shared/dist/index.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exitCode = 1;
    return false;
  }
  console.log('PASS', msg);
  return true;
}

const root = path.join(__dirname, '..');
const ssrf = fs.readFileSync(path.join(root, 'packages/shared/src/ssrf-fetch.ts'), 'utf8');
const svc = fs.readFileSync(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'), 'utf8');
const ctrl = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'),
  'utf8',
);
const create = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/create/page.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);

// SECURITY / SSRF
assert(ssrf.includes('assertPublicHttpUrl') && ssrf.includes('isPrivateOrReservedIp'), 'SSRF helpers');
assert(ssrf.includes('169.254') && ssrf.includes('metadata'), 'block metadata/private');
assert(ssrf.includes('timeoutMs') && ssrf.includes('maxBytes'), 'timeout + size limit');
assert(ssrf.includes("protocol !== 'http:'") || ssrf.includes("protocol !== 'http:' &&"), 'http/https only');
assert(ssrf.includes('<script') && ssrf.includes('replace'), 'strip scripts');
assert(svc.includes('crawlPublicUrl') && svc.includes('skipCommerceHostBlock: true'), 'LP crawl SSRF opts');
assert(svc.includes('urlCrawlCache') && svc.includes('URL_CRAWL_TTL'), 'crawl cache');
assert(ctrl.includes("Post('crawl-url')"), 'crawl-url route');
assert(create.includes('Phân tích URL') && create.includes('urlSummary'), 'summary before Generate');
assert(create.includes('!urlSummary'), 'Generate disabled until summary');

// Extract summary
const html = `
<html><head>
<title>Spa Hoa | Liệu trình nám</title>
<meta name="description" content="Spa chăm sóc da chuyên sâu tại Q1"/>
<meta property="og:site_name" content="Spa Hoa"/>
<meta property="og:image" content="https://spa.example/og.jpg"/>
</head><body>
<ul><li>Công nghệ cao</li><li>Cam kết rõ</li><li>Tư vấn tận tâm</li></ul>
<a class="btn-cta">Đăng ký ngay</a>
<details><summary>Giá bao nhiêu?</summary><p>Liên hệ để nhận báo giá phù hợp.</p></details>
Liên hệ 0901234567 — hi@spa.example
<script>alert(1)</script>
</body></html>`;
const summary = extractLandingPageUrlSummary({
  sourceUrl: 'https://spa.example',
  finalUrl: 'https://spa.example/',
  title: 'Spa Hoa | Liệu trình nám',
  text: 'Spa chăm sóc da Công nghệ cao Cam kết rõ 0901234567 hi@spa.example',
  html,
});
assert(summary.brand && /Spa/i.test(summary.brand), 'extract brand');
assert(summary.description && summary.description.includes('Spa'), 'extract description');
assert(summary.benefits.length >= 2, 'extract benefits');
assert(summary.cta && /Đăng ký/i.test(summary.cta), 'extract CTA');
assert(summary.contact?.phone?.includes('0901234567'), 'extract contact phone');
assert(summary.faq.length >= 1, 'extract FAQ');
assert(summary.imageUrl && summary.imageUrl.startsWith('https://'), 'valid image url');
assert(!summary.imageUrl.includes('javascript:'), 'no script urls');

// Page Doctor
const empty = createEmptyLandingPageSpec();
const report = analyzeLandingPageHeuristic(empty);
assert(report.overallScore >= 0 && report.overallScore <= 100, 'doctor score 0-100');
assert(report.findings.length >= 8, 'doctor dimensions');
assert(report.patches.length >= 1, 'doctor patches');
assert(
  report.warnings?.some((w) => /testimonial|tracking|publish/i.test(w)),
  'doctor safety warnings',
);
const aiMenu = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-ai-menu.tsx'),
  'utf8',
);
assert(
  ctrl.includes('page-doctor') &&
    (builder.includes('AI tối ưu trang') || aiMenu.includes('AI tối ưu trang')),
  'doctor UX+API',
);
assert(builder.includes('Apply các thay đổi đã chọn') && builder.includes('selectedPatches'), 'preview before apply');

const ids = report.patches.map((p) => p.id);
const applied = applyLandingPageDoctorPatches(empty, report.patches, ids.slice(0, 3));
assert(JSON.stringify(applied) !== JSON.stringify(empty), 'apply mutates selected');
assert(
  !svc.includes('status: PUBLISHED') || svc.includes('assertMutable'),
  'apply does not auto-publish',
);
assert(svc.includes('tracking|domain|publish') || svc.includes('/tracking|domain|publish/'), 'filter unsafe patches');

// undo / user preserve still works with doctor ai marks
const hero = applied.blocks.find((b) => b.type === 'Hero');
let withUser = markLandingPageUserEdits(
  {
    ...applied,
    blocks: applied.blocks.map((b) =>
      b.type === 'Hero' ? { ...b, headline: 'KEEP USER' } : b,
    ),
  },
  [`${hero.id}.headline`],
);
const aiCopy = buildFallbackLandingPageAiCopy(
  businessProfileToAiBrief({ brandName: 'X', productService: 'Y' }, { pageGoal: 'lead' }),
);
const regen = applyLandingPageAiCopyToSpec(withUser, aiCopy);
const kept = preserveUserEditedFields(withUser, markLandingPageAiSources(regen));
assert(
  kept.blocks.find((b) => b.type === 'Hero')?.headline === 'KEEP USER',
  'version-safe user preserve after doctor',
);

assert(!create.includes('pages_manage') && !builder.includes('pages_'), 'Facebook untouched');

if (process.exitCode) {
  console.error('URL_DOCTOR_LP=FAIL');
  process.exit(1);
}
console.log('URL_DOCTOR_LP=PASS');
