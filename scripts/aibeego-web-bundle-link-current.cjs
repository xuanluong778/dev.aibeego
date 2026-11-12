#!/usr/bin/env node
/** Symlink deploy/aibeego-vps/bundles/current → named bundle dir */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bundlesRoot = path.join(root, 'deploy/aibeego-vps/bundles');
const args = process.argv.slice(2);
let bundle = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bundle') bundle = args[++i];
}
if (!bundle) {
  console.error('Usage: --bundle <dir-name under bundles/>');
  process.exit(1);
}
const target = path.join(bundlesRoot, bundle);
if (!fs.existsSync(path.join(target, 'BUILD_ID'))) {
  console.error('Not a bundle:', target);
  process.exit(1);
}
const link = path.join(bundlesRoot, 'current');
fs.rmSync(link, { recursive: true, force: true });
fs.symlinkSync(bundle, link, 'dir');
console.log('current →', bundle);
