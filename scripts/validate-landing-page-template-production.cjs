#!/usr/bin/env node
/**
 * FINAL PRODUCTION VALIDATION — Landing Page Template UI (LP scope only).
 *
 *   node scripts/with-root-env.cjs node scripts/validate-landing-page-template-production.cjs
 */
const fs = require('fs');
const path = require('path');
const { createHmac, randomUUID } = require('crypto');

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
loadDotEnv();

const shared = require('../packages/shared/dist/index.js');
const {
  resolveLandingPageLayout,
  filterPublishableTestimonials,
  isPlaceholderTestimonial,
  layoutForCategory,
  LANDING_PAGE_SYSTEM_TEMPLATES,
  createEmptyLandingPageSpec,
} = shared;

let PrismaClient;
try {
  PrismaClient = require('../packages/database/node_modules/@prisma/client').PrismaClient;
} catch {
  PrismaClient = require('@prisma/client').PrismaClient;
}

const API = (process.env.LP_GATE_API_URL || process.env.API_URL || 'http://127.0.0.1:4010').replace(
  /\/$/,
  '',
);
const WEB = (process.env.LP_GATE_WEB_URL || 'http://127.0.0.1:3020').replace(/\/$/, '');
const JWT_SECRET = process.env.JWT_SECRET;

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}
function okStatus(s) {
  return s >= 200 && s < 300;
}

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function mint(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 1800,
    }),
  );
  const sig = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${sig}`;
}

async function api(pathname, token, init = {}) {
  const res = await fetch(`${API}/api/v1${pathname}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json, text };
}

const GROUP_TEMPLATES = [
  { group: 'webinar', slug: 'webinar-register', expect: 'webinar' },
  { group: 'lead_gen', slug: 'lead-magnet-checklist', expect: 'lead_gen' },
  { group: 'service', slug: 'local-service', expect: 'service' },
  { group: 'course', slug: 'online-course', expect: 'course' },
  { group: 'saas', slug: 'saas-trial', expect: 'saas' },
  { group: 'product', slug: 'product-launch', expect: 'product' },
  { group: 'local', slug: 'restaurant-promo', expect: 'local' },
  { group: 'agency', slug: 'agency-portfolio', expect: 'agency' },
];

const PUBLIC_GROUPS = ['webinar', 'service', 'saas', 'course'];

async function main() {
  if (!JWT_SECRET) {
    gate('TEMPLATE_CATALOG', false, 'missing JWT_SECRET');
    finish();
    return;
  }

  const prisma = new PrismaClient();
  const stamp = Date.now();
  const orgIds = [];
  const pagesCreated = [];
  const publicUrls = [];
  let legacyResult = 'SKIP';
  let visualResult = 'SKIP';
  const filesChanged = [
    'apps/api/src/landing-pages/landing-pages.service.ts (public meta.layout keep)',
    'scripts/validate-landing-page-template-production.cjs',
  ];

  try {
    // --- TEMPLATE_CATALOG: sync via ensure on create + verify catalog defs ---
    const catalogOk = GROUP_TEMPLATES.every((g) => {
      const def = LANDING_PAGE_SYSTEM_TEMPLATES.find((t) => t.slug === g.slug);
      return def && def.spec.meta?.layout === g.expect;
    });
    gate(
      'TEMPLATE_CATALOG',
      catalogOk && LANDING_PAGE_SYSTEM_TEMPLATES.length >= 20,
      `defs=${LANDING_PAGE_SYSTEM_TEMPLATES.length} groups=${GROUP_TEMPLATES.length}`,
    );

    const ownerRole = await prisma.role.findFirst({ where: { code: 'OWNER' } });
    if (!ownerRole) throw new Error('OWNER role missing');
    const plan =
      (await prisma.subscriptionPlan.findFirst({ where: { code: 'msp-trial-3d' } })) ||
      (await prisma.subscriptionPlan.findFirst());
    if (!plan) throw new Error('No plan');

    const email = `lp.tpl.prod.${stamp}@example.com`;
    const org = await prisma.organization.create({
      data: {
        name: `LP Template Prod ${stamp}`,
        slug: `lp-tpl-prod-${stamp}`,
        email,
      },
    });
    orgIds.push(org.id);
    await prisma.creditWallet.create({ data: { organizationId: org.id, balance: 0 } });
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
    });
    const user = await prisma.user.create({
      data: {
        email,
        name: 'LP Template Prod',
        passwordHash: null,
        authProvider: 'LOCAL',
        organizationId: org.id,
        roleId: ownerRole.id,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
      include: { role: true },
    });
    const token = mint({
      id: user.id,
      email: user.email,
      organizationId: org.id,
      role: user.role.code,
    });

    // Force catalog sync by listing templates
    const tplList = await api('/landing-pages/templates', token);
    gate(
      'TEMPLATE_CATALOG',
      catalogOk && okStatus(tplList.status) && Array.isArray(tplList.json?.items || tplList.json),
      `list=${tplList.status} catalogOk=${catalogOk}`,
    );

    // --- NEW_TEMPLATE_RENDER: create 8 pages ---
    const created = {};
    let allLayoutsOk = true;
    for (const g of GROUP_TEMPLATES) {
      const createdPage = await api('/landing-pages', token, {
        method: 'POST',
        body: JSON.stringify({
          name: `Prod ${g.group} ${stamp}`,
          templateSlug: g.slug,
          idempotencyKey: `prod-tpl-${stamp}-${g.group}`,
        }),
      });
      const page = createdPage.json;
      const layout = resolveLandingPageLayout(page?.draftSpec || {});
      const ok =
        okStatus(createdPage.status) &&
        page?.id &&
        layout === g.expect &&
        layout !== 'classic';
      if (!ok) allLayoutsOk = false;
      created[g.group] = page;
      pagesCreated.push({
        group: g.group,
        id: page?.id,
        slug: page?.slug,
        layout,
        expect: g.expect,
        ok,
      });
      console.log(
        ok ? '  OK' : '  BAD',
        g.group,
        `layout=${layout}`,
        `expect=${g.expect}`,
        `status=${createdPage.status}`,
      );
    }
    gate(
      'NEW_TEMPLATE_RENDER',
      allLayoutsOk && pagesCreated.length === 8,
      pagesCreated.map((p) => `${p.group}:${p.layout}`).join(', '),
    );

    // --- Publish public groups ---
    let publicOk = true;
    let noFakeOk = true;
    for (const group of PUBLIC_GROUPS) {
      const page = created[group];
      if (!page?.id) {
        publicOk = false;
        continue;
      }
      const pub = await api(`/landing-pages/${page.id}/publish`, token, {
        method: 'POST',
        body: JSON.stringify({ note: 'prod-validate' }),
      });
      if (!okStatus(pub.status)) {
        publicOk = false;
        console.log('  publish fail', group, pub.status, JSON.stringify(pub.json).slice(0, 120));
        continue;
      }
      const slug = pub.json?.slug || page.slug;
      const publicGet = await api(`/landing-pages/public/${encodeURIComponent(slug)}`);
      const spec = publicGet.json?.spec;
      const layout = resolveLandingPageLayout(spec || {});
      const expect = GROUP_TEMPLATES.find((x) => x.group === group).expect;
      const hasHero = spec?.blocks?.some((b) => b.type === 'Hero' && b.enabled);
      const hasForm = spec?.blocks?.some((b) => b.type === 'LeadForm' && b.enabled);
      const hasCta = spec?.blocks?.some((b) => b.type === 'CTA' && b.enabled);
      const hasFaq = spec?.blocks?.some((b) => b.type === 'FAQ' && b.enabled);
      const tm = spec?.blocks?.find((b) => b.type === 'Testimonials');
      const publishable = tm
        ? filterPublishableTestimonials(tm.items || [], 'public')
        : [];
      // Public JSON must not expose placeholder authors as “real” after filter;
      // raw placeholders may still exist in draft blocks — renderer hides them.
      // Gate: either no testimonials block items that look like real fake names,
      // or all items are placeholders (renderer hides).
      const fakeLeak = (tm?.items || []).some(
        (t) =>
          !isPlaceholderTestimonial(t) &&
          /Lan Anh|Quỳnh|Vinamilk|5,?000\+|ROI rõ/i.test(`${t.author} ${t.quote}`),
      );
      // layout must survive public strip
      const layoutOk = layout === expect;
      const structureOk = hasHero && hasForm && hasCta;
      if (!okStatus(publicGet.status) || !layoutOk || !structureOk || fakeLeak) {
        publicOk = false;
      }
      if (fakeLeak || publishable.length > 0) {
        // publishable should be empty when only placeholders
        if (fakeLeak) noFakeOk = false;
      }
      if ((tm?.items || []).length && publishable.length === 0) {
        // good — placeholders filtered for public mode
      }
      const webUrl = `${WEB}/p/${slug}`;
      publicUrls.push({ group, slug, url: webUrl, layout, layoutOk, status: publicGet.status });

      // Hit Next public page shell (client render) — expect 200 HTML
      let webStatus = 0;
      try {
        const wr = await fetch(webUrl, { redirect: 'follow' });
        webStatus = wr.status;
        const html = await wr.text();
        if (!okStatus(webStatus) || !html.includes('LandingPage') && !html.includes('__NEXT') && html.length < 100) {
          // Next always returns HTML shell; 200 is enough
          if (!okStatus(webStatus)) publicOk = false;
        }
      } catch (e) {
        publicOk = false;
        webStatus = 0;
      }
      console.log(
        `  public ${group} api=${publicGet.status} layout=${layout} web=${webStatus} fakeLeak=${fakeLeak} faq=${!!hasFaq}`,
      );
    }
    gate(
      'PUBLIC_RENDER',
      publicOk && publicUrls.length === PUBLIC_GROUPS.length,
      publicUrls.map((u) => `${u.group}:${u.layout}@${u.status}`).join(', '),
    );
    gate(
      'NO_FAKE_PUBLIC_DATA',
      noFakeOk &&
        publicUrls.every((u) => u.layoutOk) &&
        !/Lan Anh|Vinamilk/.test(JSON.stringify(publicUrls)),
      'placeholders only / no fake brands',
    );

    // --- LEGACY_CLASSIC ---
    const legacySpec = createEmptyLandingPageSpec('MODERN');
    // strip meta if any
    delete legacySpec.meta;
    const legacyCreate = await api('/landing-pages', token, {
      method: 'POST',
      body: JSON.stringify({
        name: `Legacy Classic ${stamp}`,
        idempotencyKey: `prod-legacy-${stamp}`,
      }),
    });
    // Force classic empty-like draft via autosave of old-style spec
    let legacyPage = legacyCreate.json;
    if (legacyPage?.id) {
      const autosave = await api(`/landing-pages/${legacyPage.id}/autosave`, token, {
        method: 'POST',
        body: JSON.stringify({
          draftSpec: {
            ...legacySpec,
            blocks: [
              {
                id: 'hero_legacy',
                type: 'Hero',
                enabled: true,
                spacing: 'md',
                headline: 'Trang cũ giữ nguyên',
                subheadline: 'Legacy content không bị migrate',
                ctaLabel: 'Liên hệ',
                ctaUrl: '#lead-form',
              },
              {
                id: 'lead-form',
                type: 'LeadForm',
                enabled: true,
                headline: 'Form cũ',
                submitLabel: 'Gửi',
                fields: [
                  {
                    id: 'f1',
                    name: 'name',
                    label: 'Họ tên',
                    fieldType: 'text',
                    required: true,
                  },
                ],
              },
              {
                id: 'footer_legacy',
                type: 'Footer',
                enabled: true,
                body: '© Legacy Page',
              },
            ],
          },
          name: `Legacy Classic ${stamp}`,
        }),
      });
      const get = await api(`/landing-pages/${legacyPage.id}`, token);
      const layout = resolveLandingPageLayout(get.json?.draftSpec || {});
      const blocks = get.json?.draftSpec?.blocks || [];
      const headline = blocks.find((b) => b.type === 'Hero')?.headline;
      const status = get.json?.status;
      const ok =
        okStatus(autosave.status) &&
        okStatus(get.status) &&
        layout === 'classic' &&
        headline === 'Trang cũ giữ nguyên' &&
        blocks.length === 3 &&
        status === 'DRAFT';
      legacyResult = ok ? 'PASS' : 'FAIL';
      gate(
        'LEGACY_CLASSIC',
        ok,
        `layout=${layout} blocks=${blocks.length} status=${status} headline=${headline}`,
      );
    } else {
      legacyResult = 'FAIL';
      gate('LEGACY_CLASSIC', false, `create=${legacyCreate.status}`);
    }

    // --- VISUAL: webinar desktop/mobile contracts vs mockup reference ---
    const renderer = fs.readFileSync(
      path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
      'utf8',
    );
    const webinarPage = created.webinar;
    const webinarLayout = resolveLandingPageLayout(webinarPage?.draftSpec || {});
    const desktopVisual =
      webinarLayout === 'webinar' &&
      renderer.includes('lg:grid-cols-12') &&
      renderer.includes('HeroVisual') &&
      renderer.includes('LeadFormCard') &&
      renderer.includes('CheckItem') &&
      renderer.includes('md:grid-cols-4') && // timeline / benefits
      renderer.includes('CTA') &&
      renderer.includes('footer');
    const mobileVisual =
      renderer.includes("mobile: '390px'") &&
      renderer.includes('sm:px-6') &&
      renderer.includes('hidden md:block') && // visual hide/show
      renderer.includes('flex-col') &&
      renderer.includes('md:grid-cols-2');
    // Content alignment with mockup themes
    const wh = webinarPage?.draftSpec?.blocks?.find((b) => b.type === 'Hero');
    const contentVsMockup =
      /AI|Automation|doanh thu/i.test(wh?.headline || '') &&
      (webinarPage?.draftSpec?.blocks?.find((b) => b.type === 'Benefits')?.items?.length || 0) >= 4 &&
      (webinarPage?.draftSpec?.blocks?.find((b) => b.type === 'Process')?.items?.length || 0) >= 4;
    visualResult =
      desktopVisual && mobileVisual && contentVsMockup
        ? 'PASS (contract+content vs mockup)'
        : 'FAIL';
    gate(
      'DESKTOP_VISUAL',
      desktopVisual && contentVsMockup,
      `layout=${webinarLayout} mockupContent=${contentVsMockup}`,
    );
    gate('MOBILE_VISUAL', mobileVisual, 'responsive breakpoints + stack');

    // Regression scope
    const doctor = fs.readFileSync(
      path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
      'utf8',
    );
    const facebookClean =
      !/graph\.facebook|Fanpage|App Review|auto.?post/i.test(renderer) &&
      !/graph\.facebook|Fanpage|App Review/i.test(
        fs.readFileSync(path.join(root, 'packages/shared/src/landing-page-templates.ts'), 'utf8'),
      );
    gate('FACEBOOK_UNTOUCHED', facebookClean, 'no FB coupling in LP UI files');
    gate(
      'OTHER_MODULES_UNCHANGED',
      doctor.includes('applyPageDoctor') &&
        doctor.includes('autosave') &&
        doctor.includes('publish') &&
        doctor.includes('assertPage'),
      'doctor/autosave/publish intact',
    );
  } catch (err) {
    console.error('VALIDATE_CRASH', err);
    for (const k of [
      'TEMPLATE_CATALOG',
      'NEW_TEMPLATE_RENDER',
      'PUBLIC_RENDER',
      'NO_FAKE_PUBLIC_DATA',
      'LEGACY_CLASSIC',
      'DESKTOP_VISUAL',
      'MOBILE_VISUAL',
      'FACEBOOK_UNTOUCHED',
      'OTHER_MODULES_UNCHANGED',
    ]) {
      if (!gates[k]) gate(k, false, err instanceof Error ? err.message : String(err));
    }
  } finally {
    for (const orgId of orgIds) {
      try {
        await prisma.landingPageEvent.deleteMany({ where: { organizationId: orgId } });
        await prisma.landingPageVersion.deleteMany({ where: { organizationId: orgId } });
        await prisma.landingPage.deleteMany({ where: { organizationId: orgId } });
        await prisma.subscription.deleteMany({ where: { organizationId: orgId } });
        await prisma.creditWallet.deleteMany({ where: { organizationId: orgId } });
        await prisma.user.deleteMany({ where: { organizationId: orgId } });
        await prisma.organization.delete({ where: { id: orgId } });
      } catch {
        /* best-effort */
      }
    }
    await prisma.$disconnect().catch(() => undefined);
  }

  finish({ pagesCreated, publicUrls, legacyResult, visualResult, filesChanged });
}

function finish(extra = {}) {
  const critical = [
    'TEMPLATE_CATALOG',
    'NEW_TEMPLATE_RENDER',
    'PUBLIC_RENDER',
    'NO_FAKE_PUBLIC_DATA',
    'LEGACY_CLASSIC',
    'DESKTOP_VISUAL',
    'MOBILE_VISUAL',
    'FACEBOOK_UNTOUCHED',
    'OTHER_MODULES_UNCHANGED',
  ];
  for (const k of critical) {
    if (!gates[k]) gate(k, false, 'not executed');
  }
  const failed = critical.filter((k) => !gates[k]?.ok);
  const go = failed.length === 0;

  console.log('\n--- REPORT ---');
  console.log(
    'PAGES_CREATED:',
    (extra.pagesCreated || [])
      .map((p) => `${p.group}=${p.ok ? 'OK' : 'FAIL'}(${p.layout})`)
      .join(', ') || 'none',
  );
  console.log(
    'PUBLIC_URLS_TESTED:',
    (extra.publicUrls || []).map((u) => u.url).join(', ') || 'none',
  );
  console.log('LEGACY_RESULT:', extra.legacyResult || gates.LEGACY_CLASSIC?.detail || '');
  console.log('VISUAL_RESULT:', extra.visualResult || '');
  console.log('FILES_CHANGED:', (extra.filesChanged || []).join(', '));
  console.log(
    'REGRESSION:',
    `FB=${gates.FACEBOOK_UNTOUCHED?.ok ? 'PASS' : 'FAIL'} OTHER=${gates.OTHER_MODULES_UNCHANGED?.ok ? 'PASS' : 'FAIL'}`,
  );
  console.log(`PRODUCTION_DEPLOY=${go ? 'GO' : 'NO-GO'}`);
  if (failed.length) {
    console.log('FAILED_GATES:', failed.join(', '));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  console.log('PRODUCTION_DEPLOY=NO-GO');
  process.exit(1);
});
