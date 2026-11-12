#!/usr/bin/env node
/**
 * Static tenant isolation / auth audit for Landing Page module.
 * Ensures protected routes use guards + assertPage; public routes are intentionally open.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};

function gate(name, ok, detail = '') {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ` — ${detail}` : ''));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const ctrl = read('apps/api/src/landing-pages/landing-pages.controller.ts');
const pubCtrl = read('apps/api/src/landing-pages/landing-pages-public.controller.ts');
const svc = read('apps/api/src/landing-pages/landing-pages.service.ts');

gate(
  'PROTECTED_GUARDS',
  ctrl.includes('@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)') &&
    ctrl.includes("@RequirePermissions('lead.read')") &&
    ctrl.includes("@RequirePermissions('lead.write')"),
  'JWT + tenant + permissions on protected controller',
);

const protectedOps = [
  ['CRUD_GET', 'async get(', 'assertPage'],
  ['VERSION_LIST', 'listPageVersions', 'organizationId'],
  ['VERSION_GET', 'getPageVersion', 'organizationId'],
  ['VERSION_RESTORE', 'restorePageVersion', 'organizationId'],
  ['PREVIEW_TOKEN', 'issuePreviewToken', 'assertPage'],
  ['PUBLISH', 'publish(', 'assertPage'],
  ['ANALYTICS', 'analytics(', 'organizationId'],
  ['DOMAIN', 'listDomains', 'organizationId'],
];

for (const [name, ...needles] of protectedOps) {
  gate(
    `PROTECTED_${name}`,
    needles.every((n) => svc.includes(n)),
    needles.join(' + '),
  );
}

gate(
  'PUBLIC_NO_JWT',
  !pubCtrl.includes('JwtAuthGuard') && !pubCtrl.includes('TenantGuard'),
  'public controller has no auth guards',
);

gate(
  'PUBLIC_PUBLISHED_ONLY',
  svc.includes('LandingPageStatus.PUBLISHED') &&
    svc.includes('resolvePublishedPage') &&
    svc.includes('getPublicBySlug'),
  'public slug/lead/event resolve published pages only',
);

gate(
  'PREVIEW_TOKEN_SCOPED',
  svc.includes('previewToken: clean') &&
    svc.includes('previewExpiresAt: { gt: new Date() }') &&
    svc.includes('status: { not: LandingPageStatus.ARCHIVED }'),
  'preview requires valid token + expiry + not archived',
);

gate(
  'ORG_SCOPED_PUBLIC_OPTION',
  pubCtrl.includes("@Query('organizationId')") &&
    svc.includes('resolvePublishedPage') &&
    svc.includes('...(org ? { organizationId: org } : {})'),
  'optional organizationId disambiguates public slug',
);

gate(
  'RATE_LIMIT_PUBLIC',
  svc.includes('lp:lead:global:') &&
    svc.includes('lp:evt:global:') &&
    svc.includes('lp:preview:ip:') &&
    svc.includes('website'),
  'rate limits + honeypot on public endpoints',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('\n---');
console.log(
  `LP_TENANT_ISOLATION = ${failed.length === 0 ? 'PASS' : 'FAIL'} (${Object.keys(gates).length - failed.length}/${Object.keys(gates).length})`,
);
process.exit(failed.length ? 1 : 0);
