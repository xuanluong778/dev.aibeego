/**
 * HTML import becomes one editable section per top-level element.
 * Scripts are stripped. Width queries follow the landing column.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { landingSpecFromHtml, specWithEditableHtmlSections } from '../packages/shared/dist/landing-page-html-import.js';
import {
  cloneLandingPageSpecWithNewIds,
  sanitizeLandingPagePersistSpec,
} from '../packages/shared/dist/landing-page-lifecycle.js';
import { isolateHtmlDocument } from '../apps/web/src/components/landing-pages/landing-page-html-isolate.ts';

const agency = readFileSync('/tmp/agency-html.html', 'utf8');
const imported = landingSpecFromHtml(agency, 'Agency');
const sections = imported.meta.htmlSections || [];
assert.ok(sections.length >= 12, `expected agency sections, got ${sections.length}`);
assert.equal(imported.blocks[0]?.type, 'Header');
assert.match(sections[0]?.html || '', /navbar/);
assert.match(sections.map((row) => row.html).join('\n'), /id="hero"/);
assert.ok(imported.blocks.some((block) => block.type === 'LeadForm'));
assert.equal(imported.blocks.some((block) => block.id === 'html-hero'), false);
for (const row of sections) {
  assert.equal(imported.blocks.some((block) => block.id === row.blockId), true);
  assert.doesNotMatch(row.html, /<script/i);
}

const hostile = `<html><head><title>X</title></head><body>
<section id="a"><h1>A</h1><script>document.cookie</script><img src="https://cdn.example.com/a.jpg"></section>
<iframe src="https://evil.example"></iframe>
<button onclick="alert(1)">Go</button>
</body></html>`;
const danger = landingSpecFromHtml(hostile, 'X');
const notes = danger.meta.htmlImportNotes || [];
assert.ok(notes.some((note) => /JavaScript/.test(note)));
assert.ok(notes.some((note) => /iframe/.test(note)));
assert.ok(notes.some((note) => /onclick/.test(note)));
const markup = (danger.meta.htmlSections || []).map((row) => row.html).join('\n');
assert.doesNotMatch(markup, /<script/i);
assert.doesNotMatch(markup, /onclick/i);
assert.doesNotMatch(markup, /<iframe/i);

const spec = sanitizeLandingPagePersistSpec({
  version: 1,
  theme: 'MODERN',
  themeTokens: danger.themeTokens,
  seo: {
    title: danger.seo.title,
    metaDescription: danger.seo.metaDescription,
    canonical: null,
    ogImage: null,
    robotsIndex: true,
  },
  blocks: danger.blocks,
  meta: { ...danger.meta, htmlSource: hostile },
});
const copy = cloneLandingPageSpecWithNewIds(spec);
assert.notEqual(copy.blocks[0]?.id, spec.blocks[0]?.id);
for (const row of copy.meta?.htmlSections || []) {
  assert.equal(copy.blocks.some((block) => block.id === row.blockId), true);
  assert.equal(spec.blocks.some((block) => block.id === row.blockId), false);
}
const sourceHtml = spec.meta?.htmlSections?.[0]?.html || '';
if (copy.meta?.htmlSections?.[0]) copy.meta.htmlSections[0].html = 'changed';
assert.equal(spec.meta?.htmlSections?.[0]?.html, sourceHtml);
assert.equal(specWithEditableHtmlSections(copy), null);

const legacy = sanitizeLandingPagePersistSpec({
  ...spec,
  meta: { ...(spec.meta || {}), htmlSections: undefined },
});
const rebuilt = specWithEditableHtmlSections(legacy);
assert.ok(rebuilt?.meta?.htmlSections && rebuilt.meta.htmlSections.length > 0);
assert.equal(rebuilt?.meta?.htmlSource, legacy.meta?.htmlSource);

const css = isolateHtmlDocument('<html><head><style>@media (max-width: 768px) { nav { display: none; } } @media (prefers-reduced-motion: reduce) { * { animation: none; } }</style></head><body><p>Hi</p></body></html>');
assert.match(css.css, /@container lp\s*\(\s*max-width:\s*768px\s*\)/);
assert.match(css.css, /@media\s*\(\s*prefers-reduced-motion/);
assert.doesNotMatch(css.bodyHtml, /<script/i);

console.log(`html sections OK (${sections.length} agency sections)`);
