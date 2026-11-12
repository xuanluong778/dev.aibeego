#!/usr/bin/env node
/**
 * Renderer/public client must not call isAgencyPortfolioStandard from the
 * @marketingspa/shared CJS barrel — that export can be undefined in the
 * webpack namespace and crash the builder.
 */
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const lp = path.join(root, 'apps/web/src/components/landing-pages');

const helper = fs.readFileSync(path.join(lp, 'agency-portfolio-client.ts'), 'utf8');
assert.match(helper, /export function isAgencyPortfolioStandard\s*\(/);
assert.match(helper, /rendererVersion === AGENCY_PORTFOLIO_RENDERER_VERSION/);
assert.doesNotMatch(helper, /import\s*\{[^}]*isAgencyPortfolioStandard[^}]*\}\s*from\s*['"]@marketingspa\/shared['"]/);

for (const file of ['landing-page-renderer.tsx', 'public-landing-page-client.tsx']) {
  const src = fs.readFileSync(path.join(lp, file), 'utf8');
  assert.match(
    src,
    /import\s*\{[^}]*isAgencyPortfolioStandard[^}]*\}\s*from\s*['"]\.\/agency-portfolio-client['"]/,
    `${file} must import isAgencyPortfolioStandard from ./agency-portfolio-client`,
  );
  assert.doesNotMatch(
    src,
    /import\s*\{[^}]*isAgencyPortfolioStandard[^}]*\}\s*from\s*['"]@marketingspa\/shared['"]/,
    `${file} must not import isAgencyPortfolioStandard from the shared barrel`,
  );
}

console.log('PASS CLIENT_AGENCY_HELPER_NOT_SHARED_BARREL');
