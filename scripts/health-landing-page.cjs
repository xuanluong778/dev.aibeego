#!/usr/bin/env node
/**
 * Health / smoke / alert checks for Landing Page public flows.
 *
 * Usage:
 *   node scripts/health-landing-page.cjs
 *   LP_SMOKE_WEB_URL=http://127.0.0.1:3020 LP_SMOKE_API_URL=http://127.0.0.1:4010/api/v1 node scripts/health-landing-page.cjs
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const webBase = process.env.LP_SMOKE_WEB_URL || 'http://127.0.0.1:3020';
const apiBase = process.env.LP_SMOKE_API_URL || 'http://127.0.0.1:4010/api/v1';
const pubSlug = process.env.LP_SMOKE_SLUG || 'agency-portfolio-3';
const alertWebhook = process.env.ALERT_WEBHOOK_URL || '';

const checks = {};

function record(name, ok, detail = '') {
  checks[name] = { ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' HEALTH_' + name + (detail ? ` — ${detail}` : ''));
}

function curl(url, opts = {}) {
  const method = opts.method || 'GET';
  const body = opts.body ? `-d '${JSON.stringify(opts.body).replace(/'/g, "'\\''")}'` : '';
  const headers = opts.json
    ? `-H 'Content-Type: application/json' ${body}`
    : body;
  const r = spawnSync(
    `curl -sS -m ${opts.timeout || 15} -o /tmp/lp-health-body.txt -w "%{http_code}" -X ${method} ${headers} "${url}"`,
    { shell: true, encoding: 'utf8' },
  );
  const code = (r.stdout || '').trim();
  const text = fs.existsSync('/tmp/lp-health-body.txt')
    ? fs.readFileSync('/tmp/lp-health-body.txt', 'utf8')
    : '';
  return { code, text, err: r.stderr || '' };
}

// --- Static gates ---
runStatic('TENANT_ISOLATION', 'scripts/test-landing-page-tenant-isolation.cjs');

function runStatic(name, rel) {
  const r = spawnSync(process.execPath, [path.join(root, rel)], { encoding: 'utf8', cwd: root });
  record(name, r.status === 0, r.status === 0 ? 'static audit ok' : `exit ${r.status}`);
}

// --- Live HTTP ---
const pub = curl(`${webBase}/p/${pubSlug}`);
record(
  'PUBLIC_SSR',
  pub.code === '200' &&
    (pub.text.includes('<title') || pub.text.includes('og:title')) &&
    pub.text.length > 500,
  `HTTP ${pub.code} len=${pub.text.length}`,
);

const prev = curl(`${webBase}/p/preview/notarealtoken00000000000000000000000000000000000000000000000000`);
record('PREVIEW_INVALID', prev.code === '404', `HTTP ${prev.code}`);

const apiPub = curl(`${apiBase}/landing-pages/public/${pubSlug}`);
record('API_PUBLIC', apiPub.code === '200' && apiPub.text.includes('"slug"'), `HTTP ${apiPub.code}`);

const apiPrev = curl(`${apiBase}/landing-pages/public/preview/deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`);
record('API_PREVIEW', apiPrev.code === '404', `HTTP ${apiPrev.code}`);

const honeypotLead = curl(`${apiBase}/landing-pages/public/${pubSlug}/lead`, {
  method: 'POST',
  json: true,
  body: { website: 'http://spam.test', fields: { name: 'bot', email: 'bot@test.com' } },
});
record(
  'LEAD_HONEYPOT',
  honeypotLead.code === '200' || honeypotLead.code === '201',
  `HTTP ${honeypotLead.code}`,
);

const evt = curl(`${apiBase}/landing-pages/public/${pubSlug}/events`, {
  method: 'POST',
  json: true,
  body: {
    eventType: 'PAGE_VIEW',
    visitorId: 'health-check',
    sessionId: 'health-check',
    device: 'server',
  },
});
record('EVENT_TRACK', evt.code === '200' || evt.code === '201', `HTTP ${evt.code}`);

const evtSpam = curl(`${apiBase}/landing-pages/public/${pubSlug}/events`, {
  method: 'POST',
  json: true,
  body: { eventType: 'PAGE_VIEW', website: 'http://spam.test' },
});
record(
  'EVENT_HONEYPOT',
  (evtSpam.code === '200' || evtSpam.code === '201') && evtSpam.text.includes('skipped'),
  `HTTP ${evtSpam.code}`,
);

// Publish path is auth-gated — verify route exists in controller only
const ctrl = fs.readFileSync(path.join(root, 'apps/api/src/landing-pages/landing-pages.controller.ts'), 'utf8');
record('PUBLISH_ROUTE', ctrl.includes('publish') && ctrl.includes("@RequirePermissions('lead.write')"));

const failed = Object.entries(checks).filter(([, v]) => !v.ok);
if (failed.length && alertWebhook) {
  spawnSync(
    `curl -sS -m 10 -X POST -H 'Content-Type: application/json' --data '${JSON.stringify({
      text: `LP health FAIL: ${failed.map(([n]) => n).join(', ')}`,
    })}' "${alertWebhook}"`,
    { shell: true },
  );
}

console.log('\n---');
console.log(`LP_HEALTH = ${failed.length === 0 ? 'PASS' : 'FAIL'} (${Object.keys(checks).length - failed.length}/${Object.keys(checks).length})`);
process.exit(failed.length ? 1 : 0);
