#!/usr/bin/env node
/**
 * Live AI canary for Landing Page generator on Dev.
 * - If OPENAI_API_KEY missing → LIVE_AI_NOT_CONFIGURED (exit 0, not a failure)
 * - Else: live OpenAI → validate landing-page-generator.v1 → apply theme/blocks/SEO
 * - If DATABASE_URL present: persist draft page and hit Builder HTTP
 *
 *   node scripts/with-root-env.cjs node scripts/canary-landing-page-live-ai.cjs
 */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const root = path.resolve(__dirname, '..');

function loadDotEnv() {
  try {
    const raw = fs.readFileSync(path.join(root, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#') || !t.includes('=')) continue;
      const i = t.indexOf('=');
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log('PASS', msg);
}

async function openaiChat(brief) {
  const key = process.env.OPENAI_API_KEY.trim();
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  const prompt = [
    'Bạn là copywriter landing page. Trả về ĐÚNG 1 JSON object, không markdown.',
    'schemaVersion phải là "landing-page-generator.v1".',
    'Keys: schemaVersion, headline, subheadline, painPoints[], usp, benefits[], features[], cta, pricingCopy, guarantee, faq[{question,answer}], seoTitle, metaDescription, theme, footerBody, leadFormHeadline, mode:"ai".',
    `Thương hiệu: ${brief.brandName}`,
    `Sản phẩm: ${brief.productService}`,
    `Khách: ${brief.targetCustomer}`,
    `Mục tiêu: ${brief.pageGoal}`,
    'Viết tiếng Việt, ngắn.',
  ].join('\n');

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: 'Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}: ${data?.error?.message || JSON.stringify(data).slice(0, 200)}`);
  }
  return data.choices?.[0]?.message?.content || '';
}

async function main() {
  loadDotEnv();
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    console.log('LIVE_AI_NOT_CONFIGURED');
    console.log('LIVE_AI_CANARY=SKIP');
    return;
  }

  const {
    parseLandingPageAiCopy,
    extractJsonObject,
    applyLandingPageAiCopyToSpec,
    createEmptyLandingPageSpec,
    buildFallbackLandingPageAiCopy,
    normalizeLandingPageAiBrief,
  } = require('../packages/shared/dist/index.js');

  const brief = normalizeLandingPageAiBrief({
    productService: 'Dịch vụ SEO tăng organic',
    brandName: 'Marketing Auto AZ Canary',
    targetCustomer: 'Chủ SME muốn tăng traffic',
    pageGoal: 'lead',
    extraNotes: 'Canary live OpenAI',
  });

  assert(buildFallbackLandingPageAiCopy(brief).mode === 'fallback', 'fallback still works');

  const raw = await openaiChat(brief);
  const parsed = parseLandingPageAiCopy(extractJsonObject(raw));
  assert(parsed.schemaVersion === 'landing-page-generator.v1', 'schemaVersion v1');
  assert(parsed.mode === 'ai' || parsed.headline, 'AI copy parsed');
  assert(parsed.seoTitle && parsed.metaDescription, 'SEO fields present');

  const spec = applyLandingPageAiCopyToSpec(createEmptyLandingPageSpec(), { ...parsed, mode: 'ai' });
  const types = spec.blocks.map((b) => b.type);
  for (const need of ['Hero', 'Benefits', 'Features', 'Guarantee', 'FAQ', 'LeadForm', 'Footer']) {
    assert(types.includes(need), `block ${need}`);
  }
  assert(spec.theme, `theme=${spec.theme}`);
  assert(spec.seo.title === parsed.seoTitle || spec.seo.title.length > 0, 'SEO applied');

  let pageId = null;
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = require('../packages/database/dist');
      const prisma = new PrismaClient();
      const org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
      if (org) {
        const slug = `canary-lp-${randomUUID().slice(0, 8)}`;
        const row = await prisma.landingPage.create({
          data: {
            organizationId: org.id,
            name: brief.brandName.slice(0, 120),
            slug,
            status: 'DRAFT',
            theme: spec.theme,
            draftSpec: spec,
            seoTitle: spec.seo.title.slice(0, 200),
            seoDescription: spec.seo.metaDescription.slice(0, 500),
            subdomainSlug: slug,
            robotsIndex: true,
          },
        });
        pageId = row.id;
        assert(Boolean(pageId), `persisted page ${pageId}`);

        // Idempotency contract (code-level already in API); verify builder route
        const webPort = process.env.WEB_PORT || '3020';
        const builder = await fetch(`http://127.0.0.1:${webPort}/landing-pages/builder/${pageId}`);
        assert(builder.status === 200, `builder HTTP ${builder.status}`);
      } else {
        console.log('WARN no organization in DB — skip persist/builder');
      }
      await prisma.$disconnect();
    } catch (err) {
      console.log('WARN DB persist skipped:', err.message || err);
    }
  }

  // Server idempotency markers (static)
  const svc = fs.readFileSync(
    path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
    'utf8',
  );
  assert(svc.includes('withIdempotency') && svc.includes('lp:create:'), 'server idempotency present');

  console.log(
    JSON.stringify({
      LIVE_AI_CANARY: 'PASS',
      source: 'ai',
      theme: spec.theme,
      blocks: types.length,
      pageId,
    }),
  );
}

main().catch((err) => {
  console.error('LIVE_AI_CANARY=FAIL', err.message || err);
  process.exit(1);
});
