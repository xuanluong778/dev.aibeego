#!/usr/bin/env node
/**
 * Landing Page Auto Phase 1 — smoke checks (no network required for shared catalog).
 */
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
let pass = 0;
let fail = 0;
const lines = [];

function check(name, ok, detail = '') {
  if (ok) {
    pass++;
    lines.push(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail++;
    lines.push(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// Shared catalog
let templates;
try {
  const mod = require(path.join(root, 'packages/shared/dist/landing-page-templates.js'));
  templates = mod.LANDING_PAGE_SYSTEM_TEMPLATES || [];
} catch (e) {
  // fallback compile-less: read source count via regex
  const src = fs.readFileSync(
    path.join(root, 'packages/shared/src/landing-page-templates.ts'),
    'utf8',
  );
  const slugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
  templates = slugs.map((slug) => ({ slug }));
  check('SHARED_DIST', false, String(e.message || e));
}

check('20_TEMPLATES', templates.length === 20, `count=${templates.length}`);

const requiredBlocks = [
  'Hero',
  'Benefits',
  'Features',
  'Product',
  'Pricing',
  'Testimonials',
  'Gallery',
  'Video',
  'Process',
  'Guarantee',
  'FAQ',
  'LeadForm',
  'CTA',
  'Footer',
];
const typesSrc = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);
check(
  'TEMPLATE_ENGINE_BLOCKS',
  requiredBlocks.every((b) => typesSrc.includes(`'${b}'`)),
  '14 block types in shared types',
);

const themes = ['MODERN', 'PREMIUM', 'MINIMAL', 'BOLD', 'CORPORATE'];
check(
  'TEMPLATE_ENGINE_THEMES',
  themes.every((t) => typesSrc.includes(`'${t}'`)),
);

const apiFiles = [
  'apps/api/src/landing-pages/landing-pages.module.ts',
  'apps/api/src/landing-pages/landing-pages.service.ts',
  'apps/api/src/landing-pages/landing-pages.controller.ts',
  'apps/api/src/landing-pages/landing-pages-public.controller.ts',
];
check(
  'API_MODULE',
  apiFiles.every((f) => fs.existsSync(path.join(root, f))),
);

const webFiles = [
  'apps/web/src/app/(app)/landing-pages/page.tsx',
  'apps/web/src/app/(app)/landing-pages/pages/page.tsx',
  'apps/web/src/app/(app)/landing-pages/create/page.tsx',
  'apps/web/src/app/(app)/landing-pages/templates/page.tsx',
  'apps/web/src/app/(app)/landing-pages/domain/page.tsx',
  'apps/web/src/app/(app)/landing-pages/analytics/page.tsx',
  'apps/web/src/app/(app)/landing-pages/builder/[id]/page.tsx',
  'apps/web/src/app/p/[slug]/page.tsx',
  'apps/web/src/components/landing-pages/landing-page-builder.tsx',
  'apps/web/src/components/landing-pages/landing-page-renderer.tsx',
];
check(
  'WEB_ROUTES',
  webFiles.every((f) => fs.existsSync(path.join(root, f))),
);

const nav = fs.readFileSync(path.join(root, 'apps/web/src/config/navigation.ts'), 'utf8');
check(
  'NAV_MENU',
  nav.includes("title: 'nav.landingPages'") &&
    nav.includes('/landing-pages/templates') &&
    nav.includes('/landing-pages/domain') &&
    nav.includes('/landing-pages/analytics'),
);

const migration = path.join(
  root,
  'packages/database/prisma/migrations/20260906160000_landing_page_auto_phase1/migration.sql',
);
check('DB_MIGRATION', fs.existsSync(migration));

const schema = fs.readFileSync(
  path.join(root, 'packages/database/prisma/schema.prisma'),
  'utf8',
);
check(
  'DB_MODELS',
  schema.includes('model LandingPageTemplate') &&
    schema.includes('model LandingPage') &&
    schema.includes('model LandingPageVersion'),
);

const lifecycle = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);
check(
  'SECURITY_SANITIZE',
  lifecycle.includes('stripHtml') && lifecycle.includes('safeUrl') && lifecycle.includes('169.254'),
);

const appModule = fs.readFileSync(path.join(root, 'apps/api/src/app.module.ts'), 'utf8');
check('APP_MODULE_WIRED', appModule.includes('LandingPagesModule'));

// Facebook protected — ensure we did not touch key FB files in this phase (mtime optional;
// content markers: no landing-pages imports in auto-post)
const fbFiles = [
  'apps/api/src/auto-post/auto-post.module.ts',
  'apps/api/src/meta-fanpage/meta-fanpage.module.ts',
];
let fbClean = true;
for (const f of fbFiles) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  const c = fs.readFileSync(p, 'utf8');
  if (c.includes('landing-pages') || c.includes('LandingPages')) fbClean = false;
}
check('FACEBOOK_APP_REVIEW_UNCHANGED', fbClean);

console.log(lines.join('\n'));
console.log(`\nSMOKE ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} passed, ${fail} failed)`);
process.exit(fail === 0 ? 0 : 1);
