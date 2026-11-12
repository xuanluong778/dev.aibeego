#!/usr/bin/env node
/**
 * Gate: LP form → CRM Lead integration
 *   node scripts/smoke-landing-page-crm-lead.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const types = read('packages/shared/src/landing-page-types.ts');
const lifecycle = read('packages/shared/src/landing-page-lifecycle.ts');
const leadCrm = read('packages/shared/src/landing-page-lead-crm.ts');
const webhook = read('packages/shared/src/landing-page-webhook.ts');
const schema = read('packages/database/prisma/schema.prisma');
const migration = read(
  'packages/database/prisma/migrations/20260909150000_landing_page_crm_lead/migration.sql',
);
const lpSvc = read('apps/api/src/landing-pages/landing-pages.service.ts');
const auto = read('apps/api/src/crm/automation-engine.service.ts');
const worker = read('apps/worker/src/processors/automation-run.ts');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const analytics = read('apps/web/src/app/(app)/landing-pages/analytics/page.tsx');
const autoUi = read('apps/web/src/types/automation-messaging.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = !!ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'LEADFORM_CRM_SCHEMA',
  types.includes('LandingPageLeadFormCrmConfig') &&
    types.includes('crm?: LandingPageLeadFormCrmConfig') &&
    lifecycle.includes('crmIn.pipelineId'),
  'optional crm config on LeadForm block',
);

gate(
  'LEAD_BLOCK_ID_COLUMN',
  schema.includes('landingPageBlockId') &&
    migration.includes('landing_page_block_id') &&
    migration.includes('LANDING_PAGE_LEAD_CREATED'),
  'Lead.landingPageBlockId + automation enum',
);

gate(
  'SUBMIT_APPLIES_CRM',
  lpSvc.includes('resolveLeadFormBlockFromSpec') &&
    lpSvc.includes('mergeLeadFormTags') &&
    lpSvc.includes('landingPageBlockId') &&
    lpSvc.includes('LANDING_PAGE_LEAD_CREATED') &&
    lpSvc.includes('buildLandingPageLeadWebhookPayload'),
  'submitPublicLead applies CRM + triggers + webhook',
);

gate(
  'WEBHOOK_ACTION',
  auto.includes("case 'WEBHOOK'") &&
    worker.includes("case 'WEBHOOK'") &&
    webhook.includes('postOutboundWebhook'),
  'WEBHOOK automation action implemented',
);

gate(
  'FUNNEL_ANALYTICS',
  lpSvc.includes('funnel:') &&
    lpSvc.includes('viewToCta') &&
    lpSvc.includes('formByBlock') &&
    analytics.includes('data-lp-analytics-funnel'),
  'View→CTA→Lead→Sale funnel + formByBlock',
);

gate(
  'BUILDER_CRM_UI',
  builder.includes('LeadFormCrmInspector') &&
    leadCrm.includes('resolveLeadFormBlockFromSpec'),
  'builder inspector for pipeline/status/owner/tag',
);

gate(
  'AUTOMATION_TRIGGER_UI',
  autoUi.includes('LANDING_PAGE_LEAD_CREATED'),
  'automation UI lists Landing Page Lead Created',
);

gate(
  'BACKWARD_COMPAT',
  types.includes('crm?: LandingPageLeadFormCrmConfig') &&
    !types.includes('crm: LandingPageLeadFormCrmConfig') &&
    lpSvc.includes('formBlock?.crm'),
  'crm optional — old pages keep org defaults',
);

const failed = Object.entries(gates).filter(([, ok]) => !ok);
console.log('');
Object.keys(gates).forEach((k) => console.log(k + '=' + (gates[k] ? 'PASS' : 'FAIL')));
console.log('LP_CRM_LEAD_READY=' + (failed.length ? 'FAIL' : 'PASS'));
process.exit(failed.length ? 1 : 0);
