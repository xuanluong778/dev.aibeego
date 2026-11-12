/**
 * Chặn `next build` khi Next.js dev server đang chạy trên port 3000.
 * Tránh ghi đè .next cache → lỗi MODULE_NOT_FOUND / Internal Server Error.
 * Bỏ qua listener không phải Node/Next (vd. docker-proxy).
 */
const { execSync } = require('child_process');

function isNextDevOnPort3000() {
  try {
    if (process.platform === 'win32') {
      const out = execSync('netstat -ano | findstr ":3000" | findstr "LISTENING"', {
        encoding: 'utf8',
      });
      return out.trim().length > 0;
    }
    let out = '';
    try {
      out = execSync('ss -lntp 2>/dev/null | grep \':3000\' || true', {
        encoding: 'utf8',
        shell: '/bin/bash',
      });
    } catch {
      out = '';
    }
    if (!out.trim()) {
      // fallback lsof
      try {
        out = execSync('lsof -i:3000 -sTCP:LISTEN 2>/dev/null || true', {
          encoding: 'utf8',
          shell: '/bin/bash',
        });
      } catch {
        return false;
      }
    }
    const lower = out.toLowerCase();
    // Real Next/Node app on 3000 — block build
    if (/next-server|next-dev|"next"|node.*3000/.test(lower) && !/docker-proxy/.test(lower)) {
      return true;
    }
    if (/node/.test(lower) && /:3000/.test(lower) && !/docker-proxy/.test(lower)) {
      return true;
    }
    // docker-proxy / unrelated → allow build (prod/dev next uses 3020 here)
    return false;
  } catch {
    return false;
  }
}

if (isNextDevOnPort3000()) {
  console.error(
    '\n❌ Web dev server đang chạy trên port 3000.\n' +
      '   Dừng dev server trước khi build, hoặc dùng: pnpm dev:web:clean\n' +
      '   (Build song song dev gây corrupt .next → Internal Server Error)\n',
  );
  process.exit(1);
}

/** Warn when production-style next start (PM2 :3020) is online — postbuild will reload it. */
function warnIfPm2WebOnline() {
  try {
    const { execSync } = require('child_process');
    const list = execSync('pm2 jlist 2>/dev/null || true', {
      encoding: 'utf8',
      shell: '/bin/bash',
    });
    if (!list.trim() || list.trim() === '[]') return;
    const apps = JSON.parse(list);
    const app = apps.find((a) => a && a.name === 'dev-mkspa-web' && a.pm2_env && a.pm2_env.status === 'online');
    if (!app) return;
    console.warn(
      '\n⚠  PM2 dev-mkspa-web đang online. Sau build, postbuild sẽ restart process này\n' +
        '   để tránh ChunkLoadError / HTTP 400 trên /_next/static (hash cũ).\n' +
        '   Bỏ restart: SKIP_PM2_WEB_RELOAD=1\n',
    );
  } catch {
    /* ignore */
  }
}

warnIfPm2WebOnline();

/** Stale @marketingspa/shared dist drops named exports and crashes the builder. */
function assertSharedAgencyPortfolioExport() {
  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '..');
  const indexJs = path.join(root, 'packages/shared/dist/index.js');
  const implJs = path.join(root, 'packages/shared/dist/landing-page-agency-portfolio-standard.js');
  const indexSrc = fs.existsSync(indexJs) ? fs.readFileSync(indexJs, 'utf8') : '';
  const implSrc = fs.existsSync(implJs) ? fs.readFileSync(implJs, 'utf8') : '';
  const ok =
    indexSrc.includes('landing-page-agency-portfolio-standard') &&
    /function isAgencyPortfolioStandard\s*\(/.test(implSrc);
  if (ok) return;
  console.error(
    '\n❌ packages/shared/dist thiếu isAgencyPortfolioStandard.\n' +
      '   Chạy: pnpm --filter @marketingspa/shared build\n' +
      '   rồi mới build web — nếu không, builder sẽ trắng màn hình.\n',
  );
  process.exit(1);
}

assertSharedAgencyPortfolioExport();

require('./assert-landing-page-builder-release.cjs').assertLandingPageBuilderSource();
