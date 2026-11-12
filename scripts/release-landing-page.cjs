#!/usr/bin/env node
/**
 * Landing Page release pipeline:
 *   1) Guard shared dist freshness vs source
 *   2) Build @marketingspa/shared
 *   3) Build @marketingspa/web (and optionally api)
 *   4) Restart PM2 api/web
 *   5) Smoke: builder route, draft preview path shape, /p/[slug] SSR markers
 *
 * Usage:
 *   node scripts/release-landing-page.cjs
 *   node scripts/release-landing-page.cjs --skip-restart
 *   node scripts/release-landing-page.cjs --skip-build
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = new Set(process.argv.slice(2));
const skipRestart = args.has('--skip-restart');
const skipBuild = args.has('--skip-build');
const skipGates = args.has('--skip-gates');

function run(cmd, cwd = root) {
  console.log(`\n>> ${cmd}`);
  const r = spawnSync(cmd, {
    shell: true,
    cwd,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    console.error(`FAIL command (${r.status}): ${cmd}`);
    process.exit(r.status || 1);
  }
  return r;
}

function newestMtime(dir, filter) {
  let newest = 0;
  if (!fs.existsSync(dir)) return 0;
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === '.git') continue;
        walk(p);
      } else if (!filter || filter(p)) {
        newest = Math.max(newest, st.mtimeMs);
      }
    }
  };
  walk(dir);
  return newest;
}

// --- 0) Critical gates first (fail build/deploy) ---
if (!skipGates) {
  run(`${process.execPath} scripts/test-landing-page-saas-ready.cjs`);
}

// --- 1) Shared freshness ---
const sharedSrc = path.join(root, 'packages/shared/src');
const sharedDist = path.join(root, 'packages/shared/dist');
const srcMt = newestMtime(sharedSrc, (p) => /\.(ts|tsx|js)$/.test(p));
const distMt = newestMtime(sharedDist, (p) => /\.(js|d\.ts|mjs|cjs)$/.test(p));
if (srcMt > distMt + 1000) {
  console.log('WARN shared source newer than dist — will rebuild shared');
} else {
  console.log('OK shared dist looks fresh vs source');
}

if (!skipBuild) {
  // --- 2) shared build ---
  run('pnpm --filter @marketingspa/shared build');

  // Re-check: dist must be >= source after build
  const distMt2 = newestMtime(sharedDist, (p) => /\.(js|d\.ts|mjs|cjs)$/.test(p));
  const srcMt2 = newestMtime(sharedSrc, (p) => /\.(ts|tsx|js)$/.test(p));
  if (srcMt2 > distMt2 + 2000) {
    console.error('FAIL shared dist still older than source after build');
    process.exit(1);
  }
  console.log('PASS SHARED_DIST_FRESH');

  // --- 3) database generate (prisma client for API) ---
  run('pnpm --filter @marketingspa/database generate');

  // --- 4) api build (full nest; fallback: emit landing-pages only) ---
  const apiBuild = spawnSync('pnpm --filter @marketingspa/api build', {
    shell: true,
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  });
  if (apiBuild.stdout) process.stdout.write(apiBuild.stdout);
  if (apiBuild.stderr) process.stderr.write(apiBuild.stderr);
  if (apiBuild.status !== 0) {
    console.error('FAIL full API nest build — fix TS drift before release');
    process.exit(apiBuild.status || 1);
  }
  console.log('PASS API_NEST_BUILD');

  // --- 5) web build ---
  run('pnpm --filter @marketingspa/web build');
}

if (!skipRestart) {
  run('pm2 restart dev-mkspa-api --update-env');
  run('pm2 restart dev-mkspa-web --update-env');
  // wait for listen
  spawnSync('sleep 3', { shell: true });
}

// --- 6) Smoke ---
const webBase = process.env.LP_SMOKE_WEB_URL || 'http://127.0.0.1:3020';
const apiBase = process.env.LP_SMOKE_API_URL || 'http://127.0.0.1:4010/api/v1';

function curlCode(url) {
  const r = spawnSync(`curl -s -o /tmp/lp-smoke-body.txt -w "%{http_code}" "${url}"`, {
    shell: true,
    encoding: 'utf8',
  });
  return { code: (r.stdout || '').trim(), body: fs.existsSync('/tmp/lp-smoke-body.txt') ? fs.readFileSync('/tmp/lp-smoke-body.txt', 'utf8') : '' };
}

const smoke = {};
function s(name, ok, detail) {
  smoke[name] = ok;
  console.log((ok ? 'PASS' : 'FAIL') + ' SMOKE_' + name + (detail ? ` — ${detail}` : ''));
}

const home = curlCode(`${webBase}/`);
s('WEB_UP', home.code === '200' || home.code === '307' || home.code === '302', `HTTP ${home.code}`);

// builder requires auth — expect redirect to login, not 500
const builder = curlCode(`${webBase}/landing-pages/builder/smoke-check-id`);
s(
  'BUILDER_ROUTE',
  builder.code === '200' || builder.code === '307' || builder.code === '302' || builder.code === '404',
  `HTTP ${builder.code} (auth redirect OK)`,
);

// public SSR page — unknown slug → 404 is fine; check HTML path exists
const pub = curlCode(`${webBase}/p/__saas_smoke_missing__`);
s(
  'PUBLIC_ROUTE',
  pub.code === '404' || pub.code === '200',
  `HTTP ${pub.code}`,
);

// preview missing token
const prev = curlCode(`${webBase}/p/preview/notarealtoken00000000000000000000000000000000000000000000000000`);
s(
  'PREVIEW_ROUTE',
  prev.code === '404' || prev.code === '200',
  `HTTP ${prev.code}`,
);

// API health-ish: public preview endpoint responds (404 expected)
const apiPrev = curlCode(`${apiBase}/landing-pages/public/preview/deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`);
s(
  'API_PREVIEW',
  apiPrev.code === '404' || apiPrev.code === '200',
  `HTTP ${apiPrev.code}`,
);

// SSR markers in built page source
const pageSrc = fs.readFileSync(path.join(root, 'apps/web/src/app/p/[slug]/page.tsx'), 'utf8');
s('SSR_SOURCE', pageSrc.includes('generateMetadata') && !pageSrc.includes("'use client'"));

// Extended health (public SSR, API public, honeypot, preview)
const health = spawnSync(process.execPath, [path.join(root, 'scripts/health-landing-page.cjs')], {
  encoding: 'utf8',
  cwd: root,
  env: { ...process.env, LP_SMOKE_WEB_URL: webBase, LP_SMOKE_API_URL: apiBase },
});
if (health.stdout) process.stdout.write(health.stdout);
if (health.stderr) process.stderr.write(health.stderr);
s('HEALTH_SCRIPT', health.status === 0, health.status === 0 ? 'LP_HEALTH PASS' : `exit ${health.status}`);

const failed = Object.entries(smoke).filter(([, ok]) => !ok);
console.log('\n---');
console.log(`RELEASE_LANDING_PAGE ${failed.length === 0 ? 'PASS' : 'FAIL'}`);
if (failed.length) {
  console.log('SMOKE_FAILS:', failed.map(([n]) => n).join(', '));
  process.exit(1);
}
process.exit(0);
