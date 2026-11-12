const fs = require('fs'),
  assert = require('node:assert/strict');
const { chromium } = require('playwright');
const shared = require('../packages/shared/dist');
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', (e) => console.log('BROWSER ERROR', e.message));
  await p.route('https://**/*', (r) => r.abort());
  await p.route('**/api/v1/**', (r) => r.fulfill({ status: 200, json: { ok: true, items: [] } }));
  await p.goto('http://127.0.0.1:32941/lp-agency-pilot?surface=renderer', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await p.waitForFunction(() => typeof window.agencyPilotSetSpec === 'function');
  const spec = structuredClone(shared.getLandingPageSystemTemplate('agency-portfolio').spec);
  spec.meta.elementHidden = { 'agency-benefits::itemTitle:brief': true };
  spec.meta.inlineTextStyles = { 'agency-hero::headline': { box: { visibility: 'desktop' } } };
  spec.blocks.find((b) => b.id === 'agency-services').responsiveStyle = {
    mobile: { display: 'none' },
  };
  await p.evaluate((s) => window.agencyPilotSetSpec(s), spec);
  await p.waitForTimeout(100);
  assert(await p.locator('.benefit-card h3').first().isHidden());
  assert(await p.locator('h1').isHidden());
  assert(await p.locator('.services').isHidden());
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(100);
  assert(await p.locator('h1').isVisible());
  assert(await p.locator('.services').isVisible());
  const untouched = JSON.stringify(spec);
  const clone = shared.cloneLandingPageSpecWithNewIds(spec);
  await p.evaluate((s) => window.agencyPilotSetSpec(s), clone);
  await p.waitForTimeout(100);
  assert(await p.locator('.benefit-card h3').first().isHidden());
  assert.equal(JSON.stringify(spec), untouched);
  fs.writeFileSync(
    '/mnt/data/agency-portfolio-implementation/visibility-results.json',
    JSON.stringify(
      {
        hiddenNestedField: true,
        responsiveTextBox: true,
        responsiveSection: true,
        clonePreservesHiddenReferences: true,
        legacy: 'no new field attribute for missing/unknown renderer versions',
      },
      null,
      2,
    ),
  );
  await b.close();
  console.log('PASS hidden fields, responsive box/section visibility, cloned references');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
