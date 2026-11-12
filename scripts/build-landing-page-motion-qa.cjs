/** Build the real renderer/panel fixture without deploying the application. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dependencies = process.env.LP_MOTION_QA_DEPS || root;
const output = process.env.LP_MOTION_QA_BUILD || '/tmp/aibeego-lp-motion-qa-build';
const modules = [
  path.join(dependencies, 'node_modules'),
  path.join(dependencies, 'apps/web/node_modules'),
  path.join(dependencies, 'packages/shared/node_modules'),
];
function bundler() {
  if (process.env.LP_MOTION_ESBUILD) return require(process.env.LP_MOTION_ESBUILD);
  try {
    return require(require.resolve('esbuild', { paths: modules }));
  } catch {}
  const store = path.join(dependencies, 'node_modules/.pnpm');
  const entry =
    fs.existsSync(store) && fs.readdirSync(store).find((name) => /^esbuild@/.test(name));
  if (entry) return require(path.join(store, entry, 'node_modules/esbuild'));
  throw new Error(
    'esbuild is required for this QA bundle. Set LP_MOTION_ESBUILD to an installed esbuild module.',
  );
}
async function build(before) {
  const outfile = path.join(output, before ? 'baseline.js' : 'motion.js');
  await bundler().build({
    absWorkingDir: root,
    entryPoints: ['scripts/fixtures/landing-page-motion-browser.tsx'],
    outfile,
    bundle: true,
    platform: 'browser',
    format: 'iife',
    jsx: 'automatic',
    tsconfig: 'apps/web/tsconfig.json',
    nodePaths: modules,
    external: ['crypto', 'node:*', '/landing-page-assets/*'],
    plugins: [
      {
        name: 'landing-page-source',
        setup(builder) {
          // Use the actual landing-page exports, excluding unrelated server-only barrel exports.
          builder.onResolve({ filter: /^@marketingspa\/shared$/ }, () => ({
            path: 'landing-page-shared',
            namespace: 'qa-shared',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'qa-shared' }, () => ({
            contents: fs
              .readFileSync(path.join(root, 'packages/shared/src/index.ts'), 'utf8')
              .split('\n')
              .filter((line) => line.startsWith('export *') && line.includes("'./landing-page"))
              .join('\n'),
            loader: 'ts',
            resolveDir: path.join(root, 'packages/shared/src'),
          }));
          if (before)
            builder.onLoad({ filter: /landing-page-(renderer|canvas-ux)\.tsx$/ }, (args) => ({
              contents: fs.readFileSync(path.join(before, path.relative(root, args.path)), 'utf8'),
              loader: 'tsx',
            }));
        },
      },
    ],
  });
  return outfile;
}
(async () => {
  const bundle = await build();
  const baselineBundle = process.env.LP_MOTION_QA_BASELINE_SOURCE
    ? await build(process.env.LP_MOTION_QA_BASELINE_SOURCE)
    : undefined;
  console.log(
    JSON.stringify({ bundle, css: bundle.replace(/\.js$/, '.css'), baselineBundle }, null, 2),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
