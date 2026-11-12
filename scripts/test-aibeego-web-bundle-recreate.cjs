#!/usr/bin/env node
/**
 * QA: bundle + web-start survive fresh container (not production marketingspa-web).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const compose = path.join(root, 'deploy/aibeego-vps/docker-compose.qa-recreate.yml');
const current = path.join(root, 'deploy/aibeego-vps/bundles/current/BUILD_ID');

if (!fs.existsSync(current)) {
  console.error('FAIL | missing bundles/current — run aibeego-web-bundle-link-current.cjs');
  process.exit(1);
}
const buildId = fs.readFileSync(current, 'utf8').trim();
const cmd = `docker compose -p marketingaz-qa -f "${compose}" run --rm web-qa-smoke`;
const out = execSync(cmd, { encoding: 'utf8', cwd: path.join(root, 'deploy/aibeego-vps') });
const ok = out.includes('QA_RECREATE_OK') && out.includes(buildId);
console.log(ok ? 'PASS' : 'FAIL', 'BUNDLE_RECREATE_QA', buildId);
if (!ok) process.exit(1);
