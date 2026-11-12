#!/usr/bin/env node
/** Local preview only: compile shared, start isolated Next dev; no API/DB/deploy hooks. */
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const root = path.join(__dirname, '..'),
  web = path.join(root, 'apps/web');
const tsc = require.resolve('typescript/bin/tsc');
const result = spawnSync(
  process.execPath,
  [tsc, '-p', path.join(root, 'packages/shared/tsconfig.json')],
  { cwd: root, stdio: 'inherit' },
);
if (result.status !== 0) process.exit(result.status || 1);
const port = process.env.AGENCY_PREVIEW_PORT || '32941';
console.log(
  `Agency Portfolio local preview: http://127.0.0.1:${port}/lp-template-shot/agency-portfolio`,
);
console.log(
  'If using a remote IDE, forward this port to your computer. Ctrl+C stops only this preview.',
);
const child = spawn(
  process.execPath,
  [
    require.resolve('next/dist/bin/next', { paths: [web] }),
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    port,
  ],
  {
    cwd: web,
    stdio: 'inherit',
    env: {
      ...process.env,
      LP_AGENCY_PILOT_QA: '1',
      NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=3072',
    },
  },
);
child.on('exit', (code) => process.exit(code || 0));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
