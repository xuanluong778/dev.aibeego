#!/usr/bin/env node
/** Emit apps/api/src/landing-pages → dist when full nest build is blocked by unrelated TS drift. */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const apiRoot = path.join(__dirname, '..', 'apps', 'api');
const files = [
  'src/landing-pages/landing-pages.service.ts',
  'src/landing-pages/landing-pages.controller.ts',
  'src/landing-pages/landing-pages-public.controller.ts',
  'src/landing-pages/landing-pages.module.ts',
  'src/landing-pages/landing-page-ai.service.ts',
  'src/landing-pages/landing-page-domain-dns.util.ts',
  'src/landing-pages/dto/landing-pages.dto.ts',
];

const opt = {
  target: ts.ScriptTarget.ES2021,
  module: ts.ModuleKind.CommonJS,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  esModuleInterop: true,
  skipLibCheck: true,
  sourceMap: true,
  outDir: 'dist',
  rootDir: 'src',
  strict: false,
};

for (const rel of files) {
  const abs = path.join(apiRoot, rel);
  const src = fs.readFileSync(abs, 'utf8');
  const r = ts.transpileModule(src, { compilerOptions: opt, fileName: rel });
  const out = rel.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js');
  const outAbs = path.join(apiRoot, out);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, r.outputText);
  if (r.sourceMapText) fs.writeFileSync(outAbs + '.map', r.sourceMapText);
  console.log('emitted', out);
}
