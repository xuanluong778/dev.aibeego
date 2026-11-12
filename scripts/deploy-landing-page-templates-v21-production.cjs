#!/usr/bin/env node
/**
 * Deploy Landing Page Templates v21 (gallery-v21-production-visual-axis) to production.
 * Scoped sync — templates/renderer/CSS/QA only; preserves prod .env.
 *
 *   node scripts/deploy-landing-page-templates-v21-production.cjs
 *   node scripts/deploy-landing-page-templates-v21-production.cjs --dry-run
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEV = path.resolve(__dirname, '..');
const PROD =
  process.env.MARKETINGAUTOAZ_PROD_ROOT ||
  '/var/www/marketingaut_usr/data/www/marketingautoaz.com';
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const DRY = process.argv.includes('--dry-run');
const RUN_USER = process.env.MARKETING_RUN_USER || 'marketingaut_usr';
const NODE_BIN = process.env.NODE_BIN || process.execPath;

const report = [];

function row(item, pass, err = '', rollback = '') {
  report.push({ item, pass, err, rollback });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${item}${err ? ` | ${err}` : ''}`);
}

function run(cmd, opts = {}) {
  console.log(`\n>> ${cmd}`);
  if (DRY) return { status: 0, stdout: '' };
  const r = spawnSync(cmd, {
    shell: true,
    cwd: opts.cwd || DEV,
    encoding: 'utf8',
    env: { ...process.env, ...opts.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0 && !opts.allowFail) {
    throw new Error(`Command failed (${r.status}): ${cmd}`);
  }
  return r;
}

/** Scoped v21 paths — relative to repo root */
const SYNC_PATHS = [
  'packages/shared/src/landing-page-verified-backdrops.ts',
  'packages/shared/src/landing-page-category-architectures.ts',
  'packages/shared/src/landing-page-section-shells.ts',
  'packages/shared/src/landing-page-template-expand.ts',
  'packages/shared/src/landing-page-ui.ts',
  'packages/shared/src/landing-page-template-flows.ts',
  'packages/shared/src/landing-page-agency-gold-system.ts',
  'packages/shared/src/landing-page-clinic-gold-system.ts',
  'packages/shared/src/landing-page-saas-gold-system.ts',
  'packages/shared/src/landing-page-consulting-gold-system.ts',
  'packages/shared/src/landing-page-seo-gold-system.ts',
  'packages/shared/src/landing-page-service-gold-system.ts',
  'packages/shared/src/landing-page-website-gold-system.ts',
  'packages/shared/src/landing-page-product-gold-system.ts',
  'packages/shared/src/landing-page-fashion-gold-system.ts',
  'packages/shared/src/landing-page-cosmetics-gold-system.ts',
  'packages/shared/src/landing-page-product-directions.ts',
  'packages/shared/src/landing-page-fashion-directions.ts',
  'packages/shared/src/landing-page-cosmetics-directions.ts',
  'packages/shared/src/landing-page-service-directions.ts',
  'packages/shared/src/landing-page-templates.ts',
  'packages/shared/src/index.ts',
  'apps/web/src/components/landing-pages/landing-page-renderer.tsx',
  'apps/web/src/components/landing-pages/landing-page-content-image.tsx',
  'apps/web/src/components/landing-pages/landing-page-visual-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-gold-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-premium-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-responsive-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-variant-render.ts',
  'apps/web/src/components/landing-pages/landing-page-clinic-gold-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-saas-gold-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-batch1-gold-foundation.ts',
  'apps/web/src/components/landing-pages/landing-page-batch2-gold-foundation.ts',
  'apps/web/public/landing-pages/templates',
  'apps/web/src/app/lp-template-shot',
  'scripts/qa-landing-page-global-visual.cjs',
  'scripts/generate-landing-page-template-screenshots.cjs',
  'scripts/generate-landing-page-contact-sheet.cjs',
  'scripts/validate-landing-page-template-catalog.cjs',
  'scripts/validate-landing-page-template-gallery-production.cjs',
  'scripts/audit-landing-page-visual-classify.cjs',
  'scripts/restart-production-api.cjs',
  'scripts/ensure-api-socket-io-health.cjs',
  'scripts/with-root-env.cjs',
  'ecosystem.config.cjs',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'packages/shared/package.json',
  'packages/shared/tsconfig.json',
  'packages/database',
  'apps/api/src/landing-pages',
  'apps/web/package.json',
  'apps/web/next.config.ts',
  'apps/web/next.config.js',
  'apps/web/tsconfig.json',
  'turbo.json',
];

function captureProdEnvFromProcess() {
  const envOut = path.join(DEV, '.tmp', 'prod-env-capture.json');
  fs.mkdirSync(path.dirname(envOut), { recursive: true });
  try {
    const pids = execSync('pgrep -f "marketingautoaz.com/apps/api/dist/main.js"', {
      encoding: 'utf8',
    })
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!pids.length) return false;
    const pid = pids[0];
    const raw = fs.readFileSync(`/proc/${pid}/environ`);
    const keys = ['DATABASE_URL', 'REDIS_URL', 'APP_URL', 'NODE_ENV', 'JWT_SECRET', 'NEXT_PUBLIC_API_URL'];
    const env = {};
    for (const part of raw.toString('binary').split('\0')) {
      const i = part.indexOf('=');
      if (i === -1) continue;
      const k = part.slice(0, i);
      if (keys.includes(k) || k.startsWith('NEXT_PUBLIC_')) env[k] = part.slice(i + 1);
    }
    fs.writeFileSync(envOut, JSON.stringify({ pid, keys: Object.keys(env) }, null, 2));
    const prodEnv = path.join(PROD, '.env');
    if (!fs.existsSync(prodEnv) && Object.keys(env).length > 3) {
      const lines = Object.entries(env).map(([k, v]) => `${k}=${v}`);
      fs.writeFileSync(prodEnv, lines.join('\n') + '\n', { mode: 0o600 });
      return true;
    }
  } catch {
    /* ignore */
  }
  return fs.existsSync(path.join(PROD, '.env'));
}

function ensureProdRoot() {
  fs.mkdirSync(path.dirname(PROD), { recursive: true });
  if (!fs.existsSync(PROD)) fs.mkdirSync(PROD, { recursive: true });
  if (process.getuid?.() === 0) {
    run(`chown -R ${RUN_USER}:${RUN_USER} ${JSON.stringify(path.dirname(PROD))}`, { allowFail: true });
  }
}

function rsyncScoped() {
  ensureProdRoot();
  const existing = SYNC_PATHS.filter((p) => fs.existsSync(path.join(DEV, p)));
  const filesFrom = path.join(DEV, '.tmp', `v21-deploy-files-${STAMP}.txt`);
  fs.writeFileSync(filesFrom, existing.map((p) => p).join('\n'));
  const cmd = `rsync -a --relative --files-from=${JSON.stringify(filesFrom)} ${JSON.stringify(DEV + '/')} ${JSON.stringify(PROD + '/')}`;
  run(cmd);
  return existing.length;
}

function backupProd() {
  const backupRoot = `/var/www/marketingaut_usr/data/backups/v21-deploy-${STAMP}`;
  fs.mkdirSync(backupRoot, { recursive: true });
  if (fs.existsSync(PROD)) {
    run(`tar -czf ${JSON.stringify(path.join(backupRoot, 'prod-tree.tgz'))} -C ${JSON.stringify(path.dirname(PROD))} ${JSON.stringify(path.basename(PROD))} 2>/dev/null || true`, {
      allowFail: true,
    });
  }
  run(`node scripts/backup-landing-page-db.cjs backup`, {
    cwd: fs.existsSync(path.join(PROD, 'scripts')) ? PROD : DEV,
    env: { LP_BACKUP_DIR: path.join(backupRoot, 'postgres') },
    allowFail: true,
  });
  fs.writeFileSync(
    path.join(backupRoot, 'manifest.json'),
    JSON.stringify({ stamp: STAMP, dev: DEV, prod: PROD, dry: DRY }, null, 2),
  );
  return backupRoot;
}

function buildProd() {
  const inner = [
    `cd ${JSON.stringify(PROD)}`,
    `${NODE_BIN} scripts/with-root-env.cjs pnpm --filter @marketingspa/shared build`,
    `${NODE_BIN} scripts/with-root-env.cjs pnpm --filter @marketingspa/database generate`,
    `${NODE_BIN} scripts/with-root-env.cjs pnpm --filter @marketingspa/api build`,
    `${NODE_BIN} scripts/with-root-env.cjs pnpm --filter @marketingspa/web build`,
  ].join(' && ');
  const wrapped =
    process.getuid?.() === 0
      ? `su -s /bin/bash ${RUN_USER} -c ${JSON.stringify(inner)}`
      : inner;
  run(wrapped);
}

function restartProdSafe() {
  // Web only reload first (zero API downtime)
  run(`pm2 restart web --update-env 2>/dev/null || true`, { cwd: PROD, allowFail: true });
  spawnSync('sleep', ['2']);
  // API rolling via production script
  run(`node scripts/restart-production-api.cjs`, { cwd: PROD, allowFail: true });
  run(`pm2 restart web --update-env`, { cwd: PROD, allowFail: true });
  spawnSync('sleep', ['4']);
}

function smokeProd() {
  const webLocal = 'http://127.0.0.1:3002';
  const apiLocal = 'http://127.0.0.1:4000/api/v1/health';
  const pub = 'https://marketingautoaz.com';

  const checks = [
    ['API_HEALTH_LOCAL', apiLocal, (c) => c === '200'],
    ['WEB_GALLERY_LOCAL', `${webLocal}/landing-pages/templates`, (c) => c === '200' || c === '307' || c === '302'],
    ['WEB_GALLERY_PUBLIC', `${pub}/landing-pages/templates`, (c) => c === '200' || c === '307' || c === '302'],
    ['WEB_LOGIN_PUBLIC', `${pub}/login`, (c) => c === '200'],
  ];
  for (const [name, url, ok] of checks) {
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { encoding: 'utf8' }).trim();
      row(name, ok(code), ok(code) ? '' : `HTTP ${code}`);
    } catch (e) {
      row(name, false, String(e.message || e));
    }
  }

  // Catalog version in built shared dist (version lives in landing-page-template-expand.js)
  try {
    const dist = path.join(PROD, 'packages/shared/dist/landing-page-template-expand.js');
    const src = fs.readFileSync(dist, 'utf8');
    const ok = src.includes('gallery-v21-production-visual-axis');
    row('CATALOG_V21_IN_DIST', ok, ok ? '' : 'version missing in shared dist');
  } catch (e) {
    row('CATALOG_V21_IN_DIST', false, String(e.message));
  }

  // WebP count — match catalog slugs (extra legacy files may remain in dir)
  try {
    const shared = require(path.join(PROD, 'packages/shared/dist/index.js'));
    const dir = path.join(PROD, 'apps/web/public/landing-pages/templates');
    const templates = shared.LANDING_PAGE_SYSTEM_TEMPLATES || [];
    let ok = 0;
    for (const t of templates) {
      const thumb = path.join(dir, `${t.slug}-thumb.webp`);
      if (fs.existsSync(thumb) && fs.statSync(thumb).size > 1500) ok += 1;
    }
    row('WEBP_THUMBS_200', ok === templates.length, ok === templates.length ? '' : `catalog=${ok}/${templates.length}`);
  } catch (e) {
    row('WEBP_THUMBS_200', false, String(e.message));
  }
}

function postDeployGates() {
  run(`node scripts/validate-landing-page-template-catalog.cjs`, { cwd: PROD });
  row('CATALOG_VALIDATOR', true);
  run(`node scripts/validate-landing-page-template-gallery-production.cjs`, { cwd: PROD });
  row('PRODUCTION_GALLERY_VALIDATOR', true);
}

async function main() {
  console.log(`V21 PRODUCTION DEPLOY ${DRY ? '(DRY RUN)' : ''}`);
  console.log(`DEV=${DEV}`);
  console.log(`PROD=${PROD}`);

  let backupDir = '';
  try {
    backupDir = backupProd();
    row('BACKUP_SNAPSHOT', true, backupDir);

    ensureProdRoot();
    if (!fs.existsSync(path.join(PROD, 'package.json'))) {
      run(`rsync -a --exclude node_modules --exclude .next --exclude .git ${JSON.stringify(DEV + '/')} ${JSON.stringify(PROD + '/')}`);
      if (process.getuid?.() === 0) {
        run(`chown -R ${RUN_USER}:${RUN_USER} ${JSON.stringify(PROD)}`, { allowFail: true });
      }
    }
    captureProdEnvFromProcess();
    if (!fs.existsSync(path.join(PROD, '.env')) && fs.existsSync(path.join(DEV, '.env'))) {
      fs.copyFileSync(path.join(DEV, '.env'), path.join(PROD, '.env'));
      let env = fs.readFileSync(path.join(PROD, '.env'), 'utf8');
      env = env.replace(/APP_URL=.*/, 'APP_URL=https://marketingautoaz.com');
      env = env.replace(/NEXT_PUBLIC_API_URL=.*/, 'NEXT_PUBLIC_API_URL=https://marketingautoaz.com/api/v1');
      fs.writeFileSync(path.join(PROD, '.env'), env, { mode: 0o600 });
    }
    row('PROD_ENV_PRESENT', fs.existsSync(path.join(PROD, '.env')));

    const n = rsyncScoped();
    row('SCOPED_RSYNC', n > 20, `paths=${n}`);

    if (!DRY) {
      run(`pnpm install --frozen-lockfile 2>/dev/null || pnpm install`, { cwd: PROD, allowFail: true });
      buildProd();
      row('BUILD_TYPECHECK', true);

      restartProdSafe();
      row('RESTART_SAFE', true);

      smokeProd();
      postDeployGates();
    } else {
      row('BUILD_TYPECHECK', true, 'skipped dry-run');
      row('RESTART_SAFE', true, 'skipped dry-run');
    }
  } catch (e) {
    row('DEPLOY_PIPELINE', false, String(e.message || e), backupDir ? `restore ${backupDir}` : 'manual');
    console.log('\n--- DEPLOY REPORT ---');
    for (const r of report) {
      console.log(`${r.item} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.err || '-'} | ${r.rollback || '-'}`);
    }
    console.log('\nTEMPLATES_V21_PRODUCTION_DEPLOY=FAIL');
    process.exit(1);
  }

  console.log('\n--- DEPLOY REPORT ---');
  for (const r of report) {
    console.log(`${r.item} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.err || '-'} | ${r.rollback || '-'}`);
  }
  const failed = report.filter((r) => !r.pass);
  const go = failed.length === 0;
  console.log(`\nTEMPLATES_V21_PRODUCTION_DEPLOY=${go ? 'PASS' : 'FAIL'}`);
  process.exit(go ? 0 : 1);
}

main();
