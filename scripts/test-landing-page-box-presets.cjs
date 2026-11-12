#!/usr/bin/env node
/**
 * Compatibility gate: former Hình hộp suite now asserts Đồ họa keeps all boxes.
 *   node scripts/test-landing-page-box-presets.cjs
 */
const { spawnSync } = require('child_process');
const path = require('path');

const r = spawnSync(process.execPath, [path.join(__dirname, 'test-landing-page-graphics-library.cjs')], {
  stdio: 'inherit',
});
process.exit(r.status || 0);
