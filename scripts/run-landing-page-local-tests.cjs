#!/usr/bin/env node
// Read-only source/unit checks plus existing standalone browser fixtures. Does
// not run the Doctor integration suite or the aggregate script that builds API.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const { spawn } = require('node:child_process');
const reviewedMatchers = require('./helpers/landing-page-legacy-matchers.json');
const root = path.resolve(__dirname, '..');
const reportDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : fs.mkdtempSync(path.join(os.tmpdir(), 'lp-local-tests-'));
fs.mkdirSync(reportDir, { recursive: true });
const skip = {
  'test-landing-page-autosave-identity-e2e.cjs':
    'Chạy riêng với LP_E2E_CONFIG trỏ tới toàn app/API/DB test Docker internal; local runner chặn network/DB.',
  'test-landing-page-doctor-gates.cjs':
    'Thiếu API/DB test cô lập; script tải .env, ghi/xóa DB và gọi URL ngoài. Không chạy.',
  'test-landing-page-saas-ready.cjs':
    'Thiếu workspace build cô lập; script tự build API và chạy các suite con. Không chạy trên workspace đang dùng.',
};
const behavioral = new Set(
  [
    'autosave-stuck.cjs',
    'autosave-identity.cjs',
    'publish-flush.cjs',
    'version-restore-revision.cjs',
    'undo-page-isolation.cjs',
    'lock-and-advanced-position.cjs',
    'draft-recovery.ts',
    'revision.ts',
    'element-visibility-lock.cjs',
    'history-live-edit.cjs',
  ].map((name) => 'test-landing-page-' + name),
);
const files = fs
  .readdirSync(__dirname)
  .filter((name) => /^test-landing-page-.*\.(cjs|mjs|ts|mts)$/.test(name))
  .sort();
const results = [];
function run(file) {
  if (skip[file])
    return Promise.resolve({
      file,
      status: 'BLOCKED',
      classification: 'BLOCKED',
      reason: skip[file],
    });
  return new Promise((resolve) => {
    const args = /\.(ts|mts)$/.test(file)
      ? [
          '--import',
          path.join(root, 'packages/database/node_modules/tsx/dist/loader.mjs'),
          path.join(__dirname, file),
        ]
      : [path.join(__dirname, file)];
    const child = spawn(process.execPath, args, {
      cwd: root,
      env: {
        ...process.env,
        NODE_OPTIONS:
          '--require=' + JSON.stringify(path.join(__dirname, 'helpers/landing-page-offline.cjs')),
        TSX_DISABLE_CACHE: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '',
      timedOut = false;
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, 70000);
    child.on('close', (code) => {
      clearTimeout(timer);
      fs.writeFileSync(path.join(reportDir, file + '.log'), output);
      const failures = output
        .split('\n')
        .filter((line) => /^FAIL\b|Error:|AssertionError/.test(line));
      const blocked =
        timedOut ||
        /Cannot find module|ERR_MODULE_NOT_FOUND|OFFLINE_TEST_BLOCKED|Playwright not available|browser.*not installed/i.test(
          output,
        );
      const status = blocked ? 'BLOCKED' : code === 0 ? 'PASS' : 'FAIL';
      const gateNames = failures
        .filter((line) => /^FAIL\s+/.test(line))
        .map((line) => /^FAIL\s+(\S+)/.exec(line)[1]);
      // Only the reviewed legacy failures are matcher failures. A new exception
      // or a new failing assertion remains a product failure requiring review.
      const knownMatcher =
        reviewedMatchers[file] &&
        createHash('sha256')
          .update(fs.readFileSync(path.join(__dirname, file)))
          .digest('hex') === reviewedMatchers[file].sha256 &&
        gateNames.length > 0 &&
        gateNames.every((name) => reviewedMatchers[file].gates.includes(name)) &&
        !/AssertionError|TypeError|ReferenceError/.test(output);
      const classification =
        status === 'FAIL' ? (knownMatcher ? 'MATCHER_OUTDATED' : 'PRODUCT_FAILURE') : status;
      resolve({
        file,
        status,
        classification,
        exitCode: code,
        kind: behavioral.has(file)
          ? 'source behavior with mocked I/O'
          : 'legacy checks / standalone fixture; not app browser E2E',
        reason: timedOut
          ? 'timeout 70s'
          : failures.join('; ') ||
            (status === 'PASS' ? 'Assertions đã chạy; không suy ra PASS UI.' : output.slice(-1000)),
        failures,
      });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ file, status: 'BLOCKED', classification: 'BLOCKED', reason: error.message });
    });
  });
}
async function main() {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < files.length) results.push(await run(files[cursor++]));
    }),
  );
  results.sort((a, b) => a.file.localeCompare(b.file));
  const counts = Object.fromEntries(
    ['PASS', 'PRODUCT_FAILURE', 'MATCHER_OUTDATED', 'BLOCKED'].map((type) => [
      type,
      results.filter((row) => row.classification === type).length,
    ]),
  );
  fs.writeFileSync(
    path.join(reportDir, 'results.json'),
    JSON.stringify({ counts, results }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        reportDir,
        counts,
        nonpass: results
          .filter((row) => row.status !== 'PASS')
          .map(({ file, status, classification }) => ({ file, status, classification })),
      },
      null,
      2,
    ),
  );
  process.exitCode = results.some((row) => row.status === 'FAIL')
    ? 1
    : results.some((row) => row.status === 'BLOCKED')
      ? 2
      : 0;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
