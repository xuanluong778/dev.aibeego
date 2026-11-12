#!/usr/bin/env node
/**
 * Visual diversity QA per category — canvas/hero/form/family uniqueness.
 *   node scripts/qa-landing-page-visual-diversity.cjs [category]
 */
const shared = require('../packages/shared/dist/index.js');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = shared;

const filter = (process.argv[2] || process.env.LP_QA_CATEGORY || '').trim().toLowerCase();

function uniq(values) {
  return new Set(values.filter(Boolean)).size;
}

function analyzeCategory(category) {
  const templates = LANDING_PAGE_SYSTEM_TEMPLATES.filter((t) => t.category === category);
  if (!templates.length) return null;

  const canvas = [];
  const hero = [];
  const form = [];
  const family = [];
  const cta = [];

  for (const t of templates) {
    const tokens = t.spec.themeTokens || {};
    canvas.push(`${tokens.canvas || tokens.background}|${tokens.primary}`);
    const recipe = t.spec.meta?.architectureRecipe;
    const bv = recipe?.blockVariants || {};
    hero.push(bv.Hero || t.spec.blocks.find((b) => b.type === 'Hero')?.variant);
    form.push(bv.LeadForm);
    family.push(t.designFamily || recipe?.designFamily || t.spec.meta?.designFamily);
    cta.push(bv.CTA);
  }

  return {
    category,
    count: templates.length,
    canvasUnique: uniq(canvas),
    heroUnique: uniq(hero),
    formUnique: uniq(form),
    familyUnique: uniq(family),
    ctaUnique: uniq(cta),
    pass:
      uniq(canvas) >= 6 &&
      uniq(hero) >= 5 &&
      uniq(form) >= 2 &&
      uniq(family) >= 5,
  };
}

const categories = filter
  ? [filter]
  : [...new Set(LANDING_PAGE_SYSTEM_TEMPLATES.map((t) => t.category))];

let fail = 0;
for (const cat of categories) {
  const r = analyzeCategory(cat);
  if (!r) {
    console.error(`No templates for category=${cat}`);
    fail += 1;
    continue;
  }
  const status = r.pass ? 'PASS' : 'WARN';
  if (!r.pass) fail += 1;
  console.log(
    `${status} ${r.category}: canvas=${r.canvasUnique}/10 hero=${r.heroUnique}/10 form=${r.formUnique}/10 family=${r.familyUnique}/10 cta=${r.ctaUnique}/10`,
  );
}

console.log(`DIVERSITY_QA categories=${categories.length} fail=${fail}`);
process.exitCode = fail > 0 ? 1 : 0;
