#!/usr/bin/env node
/**
 * Gate: LP overview stat cards clickable + show counts; pages list status filter.
 *   node scripts/test-landing-page-overview-stats.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const overview = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/page.tsx'),
  'utf8',
);
const pages = fs.readFileSync(
  path.join(root, 'apps/web/src/app/(app)/landing-pages/pages/page.tsx'),
  'utf8',
);
const service = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const vi = fs.readFileSync(path.join(root, 'apps/web/src/i18n/dictionaries/vi.ts'), 'utf8');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' ' + detail : ''));
}

gate(
  'STATS_CLICKABLE',
  overview.includes('data-lp-overview-stats') &&
    overview.includes('data-lp-overview-stat=') &&
    overview.includes('/landing-pages/pages?status=PUBLISHED') &&
    overview.includes('/landing-pages/pages?status=DRAFT') &&
    overview.includes('href="/landing-pages/templates"') &&
    overview.includes('<Link'),
  '4 stat cards are Links to pages/templates filters',
);

gate(
  'STATS_SHOW_COUNTS',
  overview.includes('Number(res?.total)') &&
    overview.includes('Number(res?.published)') &&
    overview.includes('Number(res?.draft)') &&
    overview.includes('Number(res?.templates)') &&
    overview.includes('tabular-nums') &&
    overview.includes('data-lp-overview-stats-loading'),
  'counts coerced to number; loading skeleton while fetch',
);

gate(
  'PAGES_STATUS_FILTER',
  pages.includes('data-lp-pages-status-filters') &&
    pages.includes('useSearchParams') &&
    pages.includes('/landing-pages?status=') &&
    pages.includes("normalizeStatus(searchParams.get('status'))") &&
    pages.includes("'PUBLISHED'") &&
    pages.includes("'DRAFT'"),
  'my pages reads ?status= and calls list API with filter',
);

gate(
  'API_OVERVIEW_COUNTS',
  service.includes('async overview(') &&
    service.includes('LandingPageStatus.PUBLISHED') &&
    service.includes('LandingPageStatus.DRAFT') &&
    service.includes('landingPageTemplate.count'),
  'overview API still returns total/published/draft/templates',
);

gate(
  'I18N_KEYS',
  vi.includes('statTotal:') &&
    vi.includes('statPublished:') &&
    vi.includes('statDraft:') &&
    vi.includes('statTemplates:') &&
    vi.includes('filterAll:'),
  'vi dictionary has stat/filter labels',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=landing-pages/page.tsx,landing-pages/pages/page.tsx,vi.ts,en.ts,scripts/test-landing-page-overview-stats.cjs',
);
console.log('LOGIC_CHANGED_YES_NO=YES');
console.log('OVERVIEW_STATS_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);
