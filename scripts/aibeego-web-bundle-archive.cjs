#!/usr/bin/env node
/**
 * Archive apps/web/tmp/aibeego-next → deploy/aibeego-vps/bundles/<label>-<BUILD_ID>/
 * Updates deploy/aibeego-vps/bundles/manifest.json (tracked in git).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const bundlesRoot = path.join(root, 'deploy/aibeego-vps/bundles');
const defaultSrc = path.join(root, 'apps/web/tmp/aibeego-next');

const args = process.argv.slice(2);
let label = 'release';
let source = defaultSrc;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--label') label = args[++i];
  else if (args[i] === '--source') source = path.resolve(args[++i]);
}

if (!fs.existsSync(path.join(source, 'BUILD_ID'))) {
  console.error('Missing BUILD_ID in', source);
  process.exit(1);
}

function assertAgencyPortfolioChunkExport(dir) {
  const chunksDir = path.join(dir, 'static/chunks');
  if (!fs.existsSync(chunksDir)) {
    console.error('Missing static/chunks in', dir);
    process.exit(1);
  }
  let hasFn = false;
  let callsNamed = false;
  for (const name of fs.readdirSync(chunksDir)) {
    if (!name.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(chunksDir, name), 'utf8');
    if (
      /\w\.isAgencyPortfolioStandard=/.test(src) ||
      src.includes('function isAgencyPortfolioStandard') ||
      src.includes('rendererVersion)==="agency-portfolio-v2"')
    ) {
      hasFn = true;
    }
    if (/\(0\s*,\s*\w+\.isAgencyPortfolioStandard\)/.test(src)) callsNamed = true;
  }
  if (callsNamed && !hasFn) {
    console.error(
      '❌ Client bundle calls isAgencyPortfolioStandard but no chunk defines the function.\n' +
        '   Rebuild @marketingspa/shared then web — otherwise the builder crashes.',
    );
    process.exit(1);
  }
}
assertAgencyPortfolioChunkExport(source);
require('./assert-landing-page-builder-release.cjs').assertLandingPageBuilderBundle(source);

const versionJson = path.join(root, 'apps/web/public/landing-page-builder-version.json');
if (fs.existsSync(versionJson)) {
  fs.copyFileSync(versionJson, path.join(source, 'landing-page-builder-version.json'));
}

const buildId = fs.readFileSync(path.join(source, 'BUILD_ID'), 'utf8').trim();
const dirName = `${label}-${buildId.slice(0, 12)}`;
const dest = path.join(bundlesRoot, dirName);

if (fs.existsSync(dest)) {
  console.log('Bundle already archived:', dest);
} else {
  fs.mkdirSync(bundlesRoot, { recursive: true });
  execSync(`rsync -a --delete --exclude='cache' "${source}/" "${dest}/"`, { stdio: 'inherit' });
  console.log('Archived →', dest);
}

let gitSha = 'unknown';
try {
  gitSha = execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const manifestPath = path.join(bundlesRoot, 'manifest.json');
let manifest = { bundles: [] };
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}
const entry = {
  id: dirName,
  buildId,
  gitSha,
  label,
  path: `deploy/aibeego-vps/bundles/${dirName}`,
  archivedAt: new Date().toISOString(),
};
manifest.bundles = [entry, ...manifest.bundles.filter((b) => b.id !== dirName)].slice(0, 5);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Updated manifest.json');

// Auto-prune physical old bundles to prevent disk exhaustion
try {
  const currentLink = path.join(bundlesRoot, 'current');
  let currentTarget = '';
  if (fs.existsSync(currentLink)) {
    try {
      currentTarget = path.basename(fs.readlinkSync(currentLink));
    } catch {}
  }
  const keepIds = new Set(manifest.bundles.map((b) => b.id));
  if (currentTarget) keepIds.add(currentTarget);

  const existingEntries = fs.readdirSync(bundlesRoot);
  for (const item of existingEntries) {
    const fullItem = path.join(bundlesRoot, item);
    if (fs.existsSync(fullItem) && fs.statSync(fullItem).isDirectory() && (item.startsWith('release-') || item.startsWith('rollback-')) && !keepIds.has(item)) {
      console.log('Pruning physical old bundle:', item);
      fs.rmSync(fullItem, { recursive: true, force: true });
    }
  }
} catch (e) {
  console.warn('Bundle cleanup warning:', e.message);
}
