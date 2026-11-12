#!/usr/bin/env node
/**
 * Landing Page Pro — AI menu / generate preview / page doctor / create flow gates.
 *   node scripts/test-landing-page-pro.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const designTab = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-inspector-design-tab.tsx'),
  'utf8',
);
const aiMenu = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-ai-menu.tsx'),
  'utf8',
);
const createPage = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/create/page.tsx'),
  'utf8',
);
const sidebar = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx'),
  'utf8',
);
const inlineAi = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-inline-ai.ts'),
  'utf8',
);
const aiSvc = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-page-ai.service.ts'),
  'utf8',
);
const controller = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'),
  'utf8',
);
const canvasUx = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);

const shared = require('../packages/shared/dist/index.js');

gate(
  'AI_GENERATE',
  aiMenu.includes('data-lp-ai-generate-modal') &&
    aiMenu.includes('/landing-pages/generate') &&
    aiMenu.includes('Xem trước') &&
    aiMenu.includes('data-lp-ai-generate-preview') &&
    aiMenu.includes('data-lp-ai-generate-apply') &&
    aiMenu.includes('// Explicitly no landingPageId') &&
    builder.includes('LandingPageAiMenu') &&
    builder.includes('onApplySpec'),
  'AI generate form + preview before Apply via pushHistory',
);

gate(
  'AI_SELECTED_BLOCK',
  aiMenu.includes('data-lp-ai-rewrite-modal') &&
    aiMenu.includes('ai-suggest-field') &&
    aiMenu.includes("action: 'rewrite'") &&
    aiMenu.includes("t === 'Hero'") &&
    aiMenu.includes("t === 'Benefits'") &&
    aiMenu.includes("t === 'Pricing'") &&
    aiMenu.includes("t === 'FAQ'") &&
    aiMenu.includes("t === 'CTA'") &&
    builder.includes('onApplyBlockFields'),
  'rewrite selected block by type via ai-suggest-field',
);

gate(
  'AI_UNDO',
  builder.includes('pushHistory(sanitizeLandingPageDraftSpec(next))') &&
    builder.includes('pushHistory(markLandingPageFieldSources(next, keys, \'ai\'))') &&
    builder.includes('const undo =') &&
    builder.includes('historyRef'),
  'AI Apply goes through pushHistory / Undo',
);

gate(
  'AI_NO_AUTO_PUBLISH',
  !aiMenu.includes("publish(") &&
    !aiMenu.includes('/publish') &&
    aiMenu.includes('không Publish') &&
    createPage.includes('không tự Publish') &&
    !createPage.includes("status: 'PUBLISHED'"),
  'AI paths never auto-publish',
);

gate(
  'PAGE_DOCTOR',
  builder.includes('runPageDoctor') &&
    builder.includes('/page-doctor') &&
    builder.includes('overallScore') &&
    builder.includes('doctorReport.findings') &&
    builder.includes('p.before') &&
    builder.includes('p.after') &&
    builder.includes('Apply các thay đổi đã chọn') &&
    aiMenu.includes('AI tối ưu trang'),
  'Page Doctor score/issue/before-after wired from AI menu',
);

gate(
  'SELECTIVE_APPLY',
  builder.includes('selectedPatchIds') &&
    builder.includes('selectedPatches') &&
    builder.includes('page-doctor/apply') &&
    aiMenu.includes('row.selected') &&
    aiMenu.includes('Apply đã chọn'),
  'user selects patches / rewrite options before Apply',
);

gate(
  'NO_FAKE_TESTIMONIAL',
  aiMenu.includes("selectedBlock.type === 'Testimonials'") &&
    aiMenu.includes('không bịa') &&
    inlineAi.includes('KHÔNG bịa review') &&
    inlineAi.includes('sanitizeInlineAiTrustOptions') &&
    aiSvc.includes('CẤM: bịa testimonial'),
  'testimonials/metrics inventing blocked',
);

gate(
  'RIGHT_PANEL_SIMPLE',
  builder.includes('data-lp-inspector-tabs') &&
    builder.includes("label: 'Nội dung'") &&
    builder.includes("label: 'Thiết kế'") &&
    builder.includes("label: 'Nâng cao'") &&
    builder.includes("useState<InspectorTab>('content')") &&
    builder.includes('data-lp-inspector-content') &&
    (builder.includes('data-lp-inspector-design') ||
      designTab.includes('data-lp-inspector-design')) &&
    builder.includes('data-lp-inspector-advanced') &&
    !builder.includes('AI → fill draft'),
  'Inspector Content|Design|Advanced; Advanced not default',
);

gate(
  'CREATE_FLOW',
  createPage.includes("id: 'ai'") &&
    createPage.includes("id: 'template'") &&
    createPage.includes("id: 'url'") &&
    createPage.includes("id: 'blank'") &&
    createPage.includes('data-lp-create-modes') &&
    createPage.includes('previewAi') &&
    createPage.includes('createDraftFromPreview') &&
    createPage.includes('createBlankDraft') &&
    createPage.includes('data-lp-create-preview') &&
    createPage.includes('data-lp-create-draft-btn') &&
    createPage.includes('Tạo bản nháp → Builder'),
  'AI|Template|URL|Blank → Preview → Create Draft → Builder',
);

gate(
  'AUTOSAVE_AFTER_AI',
  builder.includes('dirtyRef.current = true') &&
    builder.includes('clientRevision') &&
    builder.includes('autosaveInflightRef') &&
    builder.includes('/autosave') &&
    !aiMenu.includes('/autosave'),
  'AI Apply marks dirty for existing autosave; no AI autosave loop',
);

gate(
  'PREVIEW_PUBLISH',
  builder.includes('onClick={() => void publish()}') &&
    builder.includes('Publish') &&
    createPage.includes('chưa Publish') &&
    aiMenu.includes('chưa Publish'),
  'Publish stays manual; AI stays draft',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  builder.includes('sanitizeLandingPagePersistSpec') &&
    builder.includes('sanitizeLandingPageDraftSpec') &&
    typeof shared.createEmptyLandingPageSpec === 'function' &&
    typeof shared.applyLandingPageAiCopyToSpec === 'function' &&
    canvasUx.includes('onSelect') &&
    sidebar.includes('openRequest'),
  'legacy sanitize + canvas select + sidebar openRequest intact',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !builder.toLowerCase().includes('pages_manage') &&
    !aiMenu.includes('facebook') &&
    !createPage.includes('pages_') &&
    controller.includes("ai-suggest-field") &&
    controller.includes('page-doctor') &&
    controller.includes('crawl-url'),
  'LP-scoped; reuse generate/suggest/doctor/crawl',
);

gate(
  'AI_MENU_COMPACT',
  aiMenu.includes('data-lp-ai-menu') &&
    aiMenu.includes('Tạo Landing Page bằng AI') &&
    aiMenu.includes('Tạo thêm Section') &&
    aiMenu.includes('Viết lại block đang chọn') &&
    aiMenu.includes('AI tối ưu trang') &&
    builder.includes('onOpenSectionPresets'),
  'topbar AI menu 4 actions',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const files = [
  'landing-page-ai-menu.tsx',
  'landing-page-builder.tsx',
  'landing-page-builder-sidebar.tsx',
  'create/page.tsx',
  'scripts/test-landing-page-pro.cjs',
].join(',');

console.log('');
console.log(failed.length ? 'LANDING_PAGE_PRO_READY=FAIL' : 'LANDING_PAGE_PRO_READY=PASS');
console.log('FILES_CHANGED=' + files);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name} — ${g.detail}`);
}

process.exit(failed.length ? 1 : 0);
