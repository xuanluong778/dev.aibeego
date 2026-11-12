#!/usr/bin/env node
/**
 * Gate: prevent ChunkLoadError / HTTP 400 after next build on PM2 web.
 *   node scripts/test-landing-page-next-chunk-reload.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const pkg = read('apps/web/package.json');
const reload = read('scripts/reload-dev-web-after-build.cjs');
const guard = read('scripts/guard-web-build.cjs');
const nginx = fs.existsSync('/etc/nginx/fastpanel2-sites/dev_marketin_usr/dev.marketingautoaz.com.conf')
  ? fs.readFileSync(
      '/etc/nginx/fastpanel2-sites/dev_marketin_usr/dev.marketingautoaz.com.conf',
      'utf8',
    )
  : '';

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

gate(
  'POSTBUILD_RELOADS_PM2_WEB',
  pkg.includes('reload-dev-web-after-build.cjs') &&
    /"postbuild"\s*:\s*"node \.\.\/\.\.\/scripts\/reload-dev-web-after-build\.cjs"/.test(pkg),
  'apps/web postbuild restarts PM2 after next build',
);

gate(
  'RELOAD_SCRIPT_TARGETS_DEV_MKSPA_WEB',
  reload.includes("PM2_WEB_PROCESS || 'dev-mkspa-web'") &&
    reload.includes('pm2 restart') &&
    reload.includes('SKIP_PM2_WEB_RELOAD'),
  'reload script targets dev-mkspa-web and is skippable',
);

gate(
  'GUARD_WARNS_PM2_WEB',
  guard.includes('warnIfPm2WebOnline') && guard.includes('ChunkLoadError'),
  'prebuild warns when PM2 web is online',
);

gate(
  'NGINX_NEXT_STATIC_PROXY',
  !nginx ||
    (nginx.includes('location ^~ /_next/') &&
      nginx.includes('proxy_pass http://dev_marketingspa_web')),
  'nginx ^~ /_next/ proxies to Next (skip if conf absent)',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(failed.length ? 'NEXT_CHUNK_RELOAD=FAIL' : 'NEXT_CHUNK_RELOAD=PASS');
process.exit(failed.length ? 1 : 0);
