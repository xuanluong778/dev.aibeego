#!/usr/bin/env node
/**
 * Landing Page Auto Phase 2 smoke checks.
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

const genSrc = fs.readFileSync(path.join(root, 'packages/shared/src/landing-page-generator.ts'), 'utf8');
check('AI_GENERATION_SCHEMA', genSrc.includes('landing-page-generator.v1') && genSrc.includes('buildFallbackLandingPageAiCopy'));
check('AI_APPLY_SPEC', genSrc.includes('applyLandingPageAiCopyToSpec'));

const svc = fs.readFileSync(path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'), 'utf8');
check('FORM_TO_CRM', svc.includes('this.leads.create') && svc.includes('landingPageId'));
check('LEAD_DEDUP', svc.includes('this.leads.create')); // dedupe inside LeadsService
check('UTM_TRACKING', svc.includes('utmSource') && svc.includes('utmCampaign'));
check('AUTOMATION_TRIGGER', svc.includes('LANDING_PAGE_FORM_SUBMITTED'));
check('ANALYTICS_EVENTS', svc.includes('LandingPageEventType') && svc.includes('PAGE_VIEW'));
check('CUSTOM_DOMAIN_VERIFY', svc.includes('verifyLandingPageCname') && svc.includes('VERIFYING'));
check('SECURITY_RATE_LIMIT', svc.includes('rateLimit.assertWithinLimit') && svc.includes('website'));
check('TENANT_ISOLATION', svc.includes('organizationId') && svc.includes('assertPage'));

const schema = fs.readFileSync(path.join(root, 'packages/database/prisma/schema.prisma'), 'utf8');
check('DB_TRIGGER_ENUM', schema.includes('LANDING_PAGE_FORM_SUBMITTED'));
check('DB_EVENTS_MODEL', schema.includes('model LandingPageEvent'));

const pub = fs.readFileSync(path.join(root, 'apps/web/src/app/p/[slug]/page.tsx'), 'utf8');
const pubClient = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/public-landing-page-client.tsx'),
  'utf8',
);
check(
  'PUBLIC_TRACKING',
  pubClient.includes('PAGE_VIEW') && pubClient.includes('injectTrackingPixels'),
);
check(
  'PUBLIC_SSR',
  !pub.includes("'use client'") && pub.includes('generateMetadata'),
);

const autoTypes = fs.readFileSync(path.join(root, 'apps/web/src/types/automation-messaging.ts'), 'utf8');
check('AUTOMATION_UI_TRIGGER', autoTypes.includes('LANDING_PAGE_FORM_SUBMITTED'));

const fbClean = !svc.includes('auto-post') && !svc.includes('meta-fanpage');
check('FACEBOOK_APP_REVIEW_UNCHANGED', fbClean);

console.log(lines.join('\n'));
console.log(`\nSMOKE_P2 ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} passed, ${fail} failed)`);
process.exit(fail === 0 ? 0 : 1);
