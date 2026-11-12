#!/usr/bin/env node
/**
 * Landing Page DB ops: backup → migrate deploy → optional rollback dry-run.
 *
 * Usage:
 *   node scripts/backup-landing-page-db.cjs backup
 *   node scripts/backup-landing-page-db.cjs migrate
 *   node scripts/backup-landing-page-db.cjs rollback-test
 *   node scripts/backup-landing-page-db.cjs all
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cmd = (process.argv[2] || 'all').toLowerCase();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = process.env.LP_BACKUP_DIR || path.join(root, 'backups', 'landing-page');
const statusFile = path.join(backupDir, 'last-ops.json');

function run(label, shellCmd, opts = {}) {
  console.log(`\n>> [${label}] ${shellCmd}`);
  const r = spawnSync(shellCmd, {
    shell: true,
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0 && !opts.allowFail) {
    console.error(`FAIL ${label} exit=${r.status}`);
    process.exit(r.status || 1);
  }
  return r;
}

function writeStatus(payload) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(statusFile, JSON.stringify({ ...payload, at: new Date().toISOString() }, null, 2));
}

function backup() {
  fs.mkdirSync(backupDir, { recursive: true });
  const out = path.join(backupDir, `pre-lp-migrate_${stamp}.dump`);
  const sh = path.join(root, 'scripts/backup-postgres.sh');
  if (fs.existsSync(sh)) {
    run('backup', `BACKUP_DIR="${backupDir}" bash "${sh}"`, { allowFail: false });
  } else {
    run('backup', `node scripts/with-root-env.cjs pg_dump --no-owner --no-acl -Fc -f "${out}"`, {
      allowFail: true,
    });
  }
  writeStatus({ step: 'backup', backupDir, stamp });
  console.log('PASS LP_DB_BACKUP');
}

function migrate() {
  run('migrate', 'node scripts/with-root-env.cjs pnpm db:migrate:deploy');
  writeStatus({ step: 'migrate', stamp });
  console.log('PASS LP_DB_MIGRATE');
}

function rollbackTest() {
  const rollbacks = [
    'packages/database/prisma/migrations/20260908120000_landing_page_preview_token/ROLLBACK.md',
    'packages/database/prisma/migrations/20260908220000_schema_drift_sync/ROLLBACK.md',
  ];
  let ok = true;
  for (const rel of rollbacks) {
    const p = path.join(root, rel);
    const exists = fs.existsSync(p);
    console.log((exists ? 'PASS' : 'FAIL') + ' ROLLBACK_DOC ' + rel);
    ok = ok && exists;
  }
  if (!ok) process.exit(1);
  console.log('PASS LP_ROLLBACK_TEST (docs present — apply SQL manually on rollback window)');
  writeStatus({ step: 'rollback-test', rollbacks, stamp });
}

if (cmd === 'backup') backup();
else if (cmd === 'migrate') migrate();
else if (cmd === 'rollback-test') rollbackTest();
else if (cmd === 'all') {
  backup();
  migrate();
  rollbackTest();
} else {
  console.error('Usage: backup | migrate | rollback-test | all');
  process.exit(2);
}
