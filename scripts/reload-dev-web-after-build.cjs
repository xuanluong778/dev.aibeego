/**
 * After `next build`, reload PM2 `dev-mkspa-web` if it is online.
 *
 * Why: rebuilding replaces hashed `/_next/static/*` files while a long-lived
 * `next start` process still emits HTML that references the previous hashes.
 * Browsers then get HTTP 400 (ChunkLoadError) for missing chunks.
 *
 * Skip: SKIP_PM2_WEB_RELOAD=1, or when pm2 / process is absent (local CI).
 * Run: node scripts/reload-dev-web-after-build.cjs
 */
const { execSync } = require('child_process');

const PROCESS = process.env.PM2_WEB_PROCESS || 'dev-mkspa-web';

if (process.env.SKIP_PM2_WEB_RELOAD === '1') {
  console.log(`[reload-web] skipped (SKIP_PM2_WEB_RELOAD=1)`);
  process.exit(0);
}

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

const pm2Bin = sh('command -v pm2') || sh('which pm2');
if (!pm2Bin) {
  console.log('[reload-web] pm2 not found — skip');
  process.exit(0);
}

const list = sh('pm2 jlist') || '[]';
let apps = [];
try {
  apps = JSON.parse(list);
} catch {
  console.log('[reload-web] could not parse pm2 jlist — skip');
  process.exit(0);
}

const app = apps.find((a) => a && a.name === PROCESS);
if (!app) {
  console.log(`[reload-web] ${PROCESS} not in pm2 — skip`);
  process.exit(0);
}

/** Orphan `next start` can keep :3020 after pm2 restart — browsers then get stale chunk hashes. */
const webPort = process.env.WEB_PORT || '3020';
const portPids = sh(`ss -tlnp 'sport = :${webPort}' 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u`);
const pm2Pid = String(app.pid || '');
for (const pid of portPids.split(/\s+/).filter(Boolean)) {
  if (pid && pid !== pm2Pid) {
    console.log(`[reload-web] killing orphan next-server on :${webPort} (pid=${pid})`);
    sh(`kill ${pid} 2>/dev/null || true`);
  }
}

console.log(`[reload-web] restarting ${PROCESS} (pid=${app.pid || '?'}) so /_next chunks match this build…`);
try {
  execSync(`pm2 restart ${PROCESS} --update-env`, { stdio: 'inherit' });
  console.log(`[reload-web] ${PROCESS} restarted OK`);
} catch (err) {
  console.error(`[reload-web] failed to restart ${PROCESS}:`, err && err.message ? err.message : err);
  process.exit(1);
}
