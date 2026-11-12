#!/usr/bin/env node
/**
 * Landing Page SaaS readiness gates (static + structural).
 * Critical gates fail the process (exit 1) — wire into CI / release.
 *
 * Usage: node scripts/test-landing-page-saas-ready.cjs
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

const publicPage = read('apps/web/src/app/p/[slug]/page.tsx');
const previewPage = read('apps/web/src/app/p/preview/[token]/page.tsx');
const publicClient = read('apps/web/src/components/landing-pages/public-landing-page-client.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const versionUi = read('apps/web/src/components/landing-pages/landing-page-version-history.tsx');
const svc = read('apps/api/src/landing-pages/landing-pages.service.ts');
const pubCtrl = read('apps/api/src/landing-pages/landing-pages-public.controller.ts');
const ctrl = read('apps/api/src/landing-pages/landing-pages.controller.ts');
const analyticsUi = read('apps/web/src/app/(app)/landing-pages/analytics/page.tsx');
const schema = read('packages/database/prisma/schema.prisma');
const freeDrag = read('apps/web/src/components/landing-pages/landing-page-free-drag.tsx');
const migrationSql = exists(
  'packages/database/prisma/migrations/20260908120000_landing_page_preview_token/migration.sql',
)
  ? read(
      'packages/database/prisma/migrations/20260908120000_landing_page_preview_token/migration.sql',
    )
  : '';

// --- Critical SaaS gates ---
gate(
  'SSR_SEO',
  !publicPage.includes("'use client'") &&
    publicPage.includes('generateMetadata') &&
    publicPage.includes('revalidate') &&
    publicPage.includes('application/ld+json') &&
    publicClient.includes('PublicLandingPageClient'),
  ' /p/[slug] is RSC with generateMetadata + JSON-LD',
);

gate(
  'PUBLIC_NO_BUILDER_BUNDLE',
  !publicPage.includes('landing-page-builder') &&
    !publicPage.includes('landing-page-free-drag') &&
    !publicClient.includes('landing-page-builder') &&
    !publicClient.includes('landing-page-free-drag') &&
    publicClient.includes('LandingPageRenderer'),
  'public route does not import builder/free-drag',
);

gate(
  'PREVIEW_TOKEN',
  previewPage.includes("robots: { index: false") &&
    previewPage.includes('force-dynamic') &&
    pubCtrl.includes("Get('preview/:token')") &&
    svc.includes('getPublicByPreviewToken') &&
    svc.includes('issuePreviewToken') &&
    schema.includes('previewToken') &&
    migrationSql.includes('preview_token') &&
    versionUi.includes('data-lp-draft-preview'),
  'draft preview token + noindex + migration',
);

gate(
  'VERSION_RESTORE',
  svc.includes('restorePageVersion') &&
    svc.includes('guardVersion') &&
    ctrl.includes("versions/:version/restore") &&
    versionUi.includes('data-lp-version-history') &&
    versionUi.includes('window.confirm') &&
    versionUi.includes('không mất lịch sử'),
  'restore UI + append-only guard revision',
);

gate(
  'PUBLISH_PUBLIC',
  svc.includes('async publish') &&
    svc.includes('publishedSpec') &&
    svc.includes('getPublicBySlug') &&
    publicClient.includes("eventType: 'PAGE_VIEW'") &&
    publicClient.includes('isPreview'),
  'publish + public client tracks only when not preview',
);

gate(
  'AUTOSAVE_REVISION',
  builder.includes('clientRevision') &&
    builder.includes("reason === 'STALE_REVISION'") &&
    svc.includes("reason: 'STALE_REVISION'"),
  'autosave revision protocol intact',
);

gate(
  'UNDO_REDO',
  builder.includes('historyRef') &&
    builder.includes('futureRef') &&
    builder.includes('pushHistory') &&
    /undo|redo/i.test(builder),
  'undo/redo history stack present',
);

gate(
  'FREE_DRAG_SIZE',
  freeDrag.includes('preserveBoxSize: true') &&
    !/function\s+measureTightFreeSize/.test(freeDrag) &&
    !/const\s+measureTightFreeSize\s*=/.test(freeDrag),
  'move preserves box size (no shrink helper)',
);

gate(
  'MOVE_NO_REFLOW',
  freeDrag.includes('preserveBoxSize: true') &&
    (freeDrag.includes("mode === 'move'") || freeDrag.includes("kind === 'move'") || freeDrag.includes('move')),
  'move path keeps size',
);

gate(
  'RESIZE',
  freeDrag.includes('resize') || freeDrag.includes('Resize'),
  'resize handlers present',
);

gate(
  'ROTATE',
  freeDrag.includes('rotation') || freeDrag.includes('rotate'),
  'rotate handlers present',
);

gate(
  'GUIDES',
  exists('scripts/test-landing-page-free-drag-center-guides.cjs'),
  'center guides gate script exists',
);

gate(
  'SECTION_BG',
  exists('scripts/test-landing-page-section-background.cjs'),
  'section background gate exists',
);

gate(
  'IMAGE_TOOLBAR',
  exists('scripts/test-landing-page-content-image-toolbar.cjs'),
  'image toolbar gate exists',
);

gate(
  'GRAPHICS',
  exists('scripts/test-landing-page-graphics-library.cjs'),
  'graphics library gate exists',
);

gate(
  'ICONS',
  exists('scripts/test-landing-page-icon-symbols.cjs'),
  'icon symbols gate exists',
);

gate(
  'ANALYTICS_AGG',
  svc.includes('viewsByDay') &&
    svc.includes('ctaByBlock') &&
    analyticsUi.includes('viewsByDay') &&
    analyticsUi.includes('ctaByBlock'),
  'viewsByDay + ctaByBlock aggregates',
);

gate(
  'MOBILE_OVERFLOW_GUARD',
  builder.includes('data-lp-mobile-overflow-guard') &&
    builder.includes('data-lp-mobile-touch-safe') &&
    builder.includes('touch-pan-y'),
  'mobile overflow/touch guards',
);

gate(
  'RELEASE_SCRIPT',
  exists('scripts/release-landing-page.cjs'),
  'shared→web→restart→smoke release script',
);

gate(
  'TENANT_ISOLATION_SCRIPT',
  exists('scripts/test-landing-page-tenant-isolation.cjs'),
  'tenant/auth audit gate',
);

gate(
  'HEALTH_SCRIPT',
  exists('scripts/health-landing-page.cjs'),
  'public/publish/preview/lead health checks',
);

gate(
  'DB_BACKUP_SCRIPT',
  exists('scripts/backup-landing-page-db.cjs'),
  'backup→migrate→rollback-test ops script',
);

// Full NestJS build must pass (no LP-only emit fallback)
const nestBuild = spawnSync('pnpm --filter @marketingspa/api build', {
  shell: true,
  cwd: root,
  encoding: 'utf8',
  env: process.env,
});
gate(
  'API_NEST_BUILD',
  nestBuild.status === 0,
  nestBuild.status === 0 ? 'nest build PASS' : (nestBuild.stderr || nestBuild.stdout || '').split('\n').slice(-3).join(' | '),
);

// Run nested critical gate scripts (fail-fast on critical)
const nested = [
  ['FREE_DRAG_SIZE_SCRIPT', 'scripts/test-landing-page-free-drag-move-size.cjs'],
  ['RESIZE_ROTATE_SCRIPT', 'scripts/test-landing-page-resize-rotate.cjs'],
  ['GUIDES_SCRIPT', 'scripts/test-landing-page-free-drag-center-guides.cjs'],
  ['SECTION_BG_SCRIPT', 'scripts/test-landing-page-section-background.cjs'],
  ['IMAGE_TOOLBAR_SCRIPT', 'scripts/test-landing-page-content-image-toolbar.cjs'],
  ['GRAPHICS_SCRIPT', 'scripts/test-landing-page-graphics-library.cjs'],
  ['ICONS_SCRIPT', 'scripts/test-landing-page-icon-symbols.cjs'],
  ['AUTOSAVE_SCRIPT', 'scripts/test-landing-page-autosave-stuck.cjs'],
];

const criticalNames = new Set([
  'SSR_SEO',
  'PUBLIC_NO_BUILDER_BUNDLE',
  'PREVIEW_TOKEN',
  'VERSION_RESTORE',
  'PUBLISH_PUBLIC',
  'AUTOSAVE_REVISION',
  'UNDO_REDO',
  'FREE_DRAG_SIZE',
  'MOVE_NO_REFLOW',
  'RESIZE',
  'ROTATE',
  'GUIDES',
  'SECTION_BG',
  'IMAGE_TOOLBAR',
  'GRAPHICS',
  'ICONS',
  'FREE_DRAG_SIZE_SCRIPT',
  'RESIZE_ROTATE_SCRIPT',
  'GUIDES_SCRIPT',
  'SECTION_BG_SCRIPT',
  'IMAGE_TOOLBAR_SCRIPT',
  'GRAPHICS_SCRIPT',
  'ICONS_SCRIPT',
  'AUTOSAVE_SCRIPT',
  'API_NEST_BUILD',
  'TENANT_ISOLATION_SCRIPT',
]);

for (const [name, rel] of nested) {
  const r = spawnSync(process.execPath, [path.join(root, rel)], {
    encoding: 'utf8',
    cwd: root,
  });
  const ok = r.status === 0;
  gate(name, ok, ok ? 'nested exit 0' : (r.stdout || r.stderr || '').split('\n').filter((l) => l.includes('FAIL')).slice(0, 3).join(' | ') || `exit ${r.status}`);
}

const tenantIso = spawnSync(process.execPath, [path.join(root, 'scripts/test-landing-page-tenant-isolation.cjs')], {
  encoding: 'utf8',
  cwd: root,
});
gate('TENANT_ISOLATION_RUN', tenantIso.status === 0, tenantIso.status === 0 ? 'audit PASS' : 'audit FAIL');

const failed = Object.entries(gates).filter(([, v]) => !v.ok);
const criticalFailed = failed.filter(([n]) => criticalNames.has(n));

console.log('\n---');
console.log(
  `LANDING_PAGE_SAAS_READY = ${criticalFailed.length === 0 ? 'PASS' : 'FAIL'} (${Object.keys(gates).length - failed.length}/${Object.keys(gates).length} gates, critical fails=${criticalFailed.length})`,
);

if (criticalFailed.length) {
  console.log('CRITICAL_FAILS:', criticalFailed.map(([n]) => n).join(', '));
  process.exit(1);
}
process.exit(0);
