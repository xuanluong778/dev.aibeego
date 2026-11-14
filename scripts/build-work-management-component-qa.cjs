const fs = require('node:fs'), path = require('node:path');
const pnpm = process.env.WM_QA_PNPM || '/app/node_modules/.pnpm';
const packages = fs.readdirSync(pnpm);
const esbuildBase = path.join(pnpm, packages.find(p => p.startsWith('esbuild@')), 'node_modules');
const reactBase = process.env.WM_QA_REACT || path.join(pnpm, packages.find(p => p.startsWith('react-dom@')), 'node_modules');
const esbuild = require(require.resolve('esbuild', { paths: [esbuildBase] }));
const root = path.resolve(__dirname, '..');
const ui = `import React from 'react';
export const Input=React.forwardRef((props,ref)=><input {...props} ref={ref}/>);
export const Label=props=><label {...props}/>;
export const Badge=({variant,...props})=><span {...props}/>;
export const Button=({variant,size,...props})=><button type="button" {...props}/>;
export const Dialog=({open,children})=>open?<div role="dialog">{children}</div>:null;
export const DialogContent=({closeOnlyWithButton,...props})=><div {...props}/>;
export const DialogFooter=props=><div {...props}/>; export const DialogHeader=DialogFooter;export const DialogTitle=props=><h2 {...props}/>;
export const Select=({children})=><div>{children}</div>;export const SelectContent=Select;export const SelectTrigger=Select;export const SelectValue=()=>null;export const SelectItem=Select;`;
(async () => {
  await esbuild.build({ absWorkingDir: root, entryPoints: ['scripts/fixtures/work-management-components.tsx'], outfile: 'bundle.js', bundle: true, platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' }, plugins: [{ name: 'fixture-network-and-primitives', setup(build) {
    build.onResolve({ filter: /^react(?:\/.*)?$|^react-dom(?:\/.*)?$/ }, args => ({ path: require.resolve(args.path, { paths: [reactBase] }) }));
    build.onResolve({ filter: /^@\/hooks\// }, () => ({ path: path.join(root, 'scripts/fixtures/work-management-hooks.tsx') }));
    build.onResolve({ filter: /^@\/components\/ui\// }, () => ({ path: 'ui', namespace: 'fixture' }));
    build.onResolve({ filter: /^lucide-react$/ }, () => ({ path: 'icons', namespace: 'fixture' }));
    build.onResolve({ filter: /^@\/lib\/utils$/ }, () => ({ path: 'utils', namespace: 'fixture' }));
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'tsx', resolveDir: root, contents: args.path === 'ui' ? ui : args.path === 'utils' ? 'export const cn=(...values)=>values.filter(Boolean).join(" ");' : `import React from 'react';const Icon=()=> <span aria-hidden="true"/>;export {Icon as Check,Icon as Plus,Icon as Search,Icon as UserPlus,Icon as X,Icon as Clock,Icon as Pause,Icon as Play,Icon as Square};` }));
  } }] });
  console.log('Built production component interaction fixture');
})().catch(error => { console.error(error); process.exitCode = 1; });
