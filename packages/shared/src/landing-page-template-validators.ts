/**
 * Landing Page template catalog validators — shared production checks.
 * Used by scripts + optional API health; no side effects.
 */

import {
  LANDING_PAGE_BLOCK_VARIANTS,
  architectureFingerprint,
  isLandingPageConversionGoal,
  isLandingPageDesignFamily,
  resolveBlockVariant,
  type LandingPageConversionGoal,
  type LandingPageDesignFamily,
} from './landing-page-template-foundation';
import type { LandingPageBlock, LandingPageTemplateDefinition } from './landing-page-types';
import { sanitizeLandingPageSpec } from './landing-page-lifecycle';

export type TemplateCatalogIssue = {
  level: 'error' | 'warning';
  code: string;
  slug?: string;
  category?: string;
  message: string;
};

export type TemplateCatalogValidationResult = {
  ok: boolean;
  errors: TemplateCatalogIssue[];
  warnings: TemplateCatalogIssue[];
  stats: {
    total: number;
    categories: number;
    uniqueSlugs: number;
    uniqueFingerprints: number;
  };
};

function hasConversionPath(blocks: LandingPageBlock[]): boolean {
  return blocks.some((b) => b.type === 'LeadForm' || b.type === 'CTA');
}

function blockIdsUnique(blocks: LandingPageBlock[]): boolean {
  const ids = blocks.map((b) => b.id);
  return new Set(ids).size === ids.length;
}

function variantsValid(blocks: LandingPageBlock[]): string[] {
  const bad: string[] = [];
  for (const b of blocks) {
    const raw = b.variant;
    if (raw == null || raw === '') continue;
    const allowed = LANDING_PAGE_BLOCK_VARIANTS[b.type] as readonly string[] | undefined;
    const resolved = resolveBlockVariant(b.type, raw);
    if (!allowed?.includes(resolved)) {
      bad.push(`${b.type}:${String(raw)}`);
    }
  }
  return bad;
}

function fingerprintForTemplate(t: LandingPageTemplateDefinition): string {
  const recipe = t.spec.meta?.architectureRecipe;
  const types = t.spec.blocks.map((b) => b.type);
  const blockVariants: Record<string, string> = {};
  for (const b of t.spec.blocks) {
    if (typeof b.variant === 'string') blockVariants[b.type] = b.variant;
  }
  if (recipe?.blockVariants) {
    for (const [k, v] of Object.entries(recipe.blockVariants)) {
      if (typeof v === 'string') blockVariants[k] = v;
    }
  }
  return architectureFingerprint({
    designFamily: (recipe?.designFamily || t.designFamily || t.spec.meta?.designFamily) as string,
    conversionGoal: (recipe?.conversionGoal || t.conversionGoal || t.spec.meta?.conversionGoal) as string,
    heroVariant: recipe?.heroVariant || blockVariants.Hero,
    sectionSequence: recipe?.sectionSequence || types,
    blockVariants,
  });
}

/** Structure signature for similarity warnings (types only). */
export function templateStructureSignature(t: LandingPageTemplateDefinition): string {
  return t.spec.blocks
    .filter((b) => b.enabled !== false)
    .map((b) => b.type)
    .join('>');
}

/**
 * Rich structural fingerprint for pairwise similarity (Phase 2).
 * Includes section order, per-block variants, designFamily, conversionGoal, theme.
 */
export function templateRichStructuralSignature(t: LandingPageTemplateDefinition): string[] {
  const recipe = t.spec.meta?.architectureRecipe;
  const tokens: string[] = [];
  tokens.push(`family:${t.designFamily || t.spec.meta?.designFamily || recipe?.designFamily || ''}`);
  tokens.push(`goal:${t.conversionGoal || t.spec.meta?.conversionGoal || recipe?.conversionGoal || ''}`);
  tokens.push(`theme:${t.theme || t.spec.theme || ''}`);
  tokens.push(`layout:${recipe?.layout || t.spec.meta?.layout || ''}`);
  for (const b of t.spec.blocks.filter((x) => x.enabled !== false)) {
    const v = resolveBlockVariant(b.type, b.variant ?? recipe?.blockVariants?.[b.type]);
    tokens.push(`${b.type}:${v}`);
  }
  tokens.push(`seq:${templateStructureSignature(t)}`);
  return tokens;
}

/** Jaccard similarity of rich structural token sets — 0..1. */
export function templatePairSimilarity(
  a: LandingPageTemplateDefinition,
  b: LandingPageTemplateDefinition,
): number {
  const sa = new Set(templateRichStructuralSignature(a));
  const sb = new Set(templateRichStructuralSignature(b));
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter += 1;
  const union = sa.size + sb.size - inter;
  if (union <= 0) return 1;
  return inter / union;
}

export type TemplateSimilarityPair = {
  a: string;
  b: string;
  categoryA: string;
  categoryB: string;
  score: number;
  level: 'ok' | 'warn' | 'fail';
};

/**
 * Pairwise similarity gates (Phase 2):
 * - score >= 0.85 → FAIL
 * - 0.75–0.85 → WARN
 * - same category and score > 0.75 → FAIL
 */
export function evaluateTemplatePairSimilarity(
  templates: LandingPageTemplateDefinition[],
): { pairs: TemplateSimilarityPair[]; failCount: number; warnCount: number; ok: boolean } {
  const pairs: TemplateSimilarityPair[] = [];
  let failCount = 0;
  let warnCount = 0;
  for (let i = 0; i < templates.length; i++) {
    for (let j = i + 1; j < templates.length; j++) {
      const a = templates[i]!;
      const b = templates[j]!;
      const score = templatePairSimilarity(a, b);
      const sameCat = a.category === b.category;
      let level: 'ok' | 'warn' | 'fail' = 'ok';
      if (score >= 0.85 || (sameCat && score > 0.75)) {
        level = 'fail';
        failCount += 1;
      } else if (score >= 0.75) {
        level = 'warn';
        warnCount += 1;
      }
      if (level !== 'ok') {
        pairs.push({
          a: a.slug,
          b: b.slug,
          categoryA: a.category,
          categoryB: b.category,
          score,
          level,
        });
      }
    }
  }
  return { pairs, failCount, warnCount, ok: failCount === 0 };
}

/**
 * Validate full system template catalog.
 * @param similarityWarnShare — warn if > this share of a category share the same structure (default 0.35)
 */
export function validateLandingPageTemplateCatalog(
  templates: LandingPageTemplateDefinition[],
  opts?: { similarityWarnShare?: number },
): TemplateCatalogValidationResult {
  const errors: TemplateCatalogIssue[] = [];
  const warnings: TemplateCatalogIssue[] = [];
  const similarityWarnShare = opts?.similarityWarnShare ?? 0.35;

  const slugSet = new Set<string>();
  const fingerprintsByCat = new Map<string, Map<string, string[]>>();
  const structureByCat = new Map<string, Map<string, string[]>>();

  for (const t of templates) {
    if (!t.slug) {
      errors.push({ level: 'error', code: 'SLUG_MISSING', message: 'Template missing slug' });
      continue;
    }
    if (slugSet.has(t.slug)) {
      errors.push({
        level: 'error',
        code: 'SLUG_DUPLICATE',
        slug: t.slug,
        message: `Duplicate slug ${t.slug}`,
      });
    }
    slugSet.add(t.slug);

    const recipe = t.spec.meta?.architectureRecipe;
    const architectureId = recipe?.architectureId || t.spec.meta?.gallery?.architecture?.id;
    if (!architectureId || typeof architectureId !== 'string') {
      errors.push({
        level: 'error',
        code: 'ARCHITECTURE_ID_MISSING',
        slug: t.slug,
        category: t.category,
        message: 'Missing architectureId',
      });
    }

    const family = (t.designFamily || t.spec.meta?.designFamily || recipe?.designFamily) as
      | LandingPageDesignFamily
      | string
      | undefined;
    const goal = (t.conversionGoal || t.spec.meta?.conversionGoal || recipe?.conversionGoal) as
      | LandingPageConversionGoal
      | string
      | undefined;

    if (!isLandingPageDesignFamily(family)) {
      errors.push({
        level: 'error',
        code: 'DESIGN_FAMILY_INVALID',
        slug: t.slug,
        message: `Invalid designFamily: ${String(family)}`,
      });
    }
    if (!isLandingPageConversionGoal(goal)) {
      errors.push({
        level: 'error',
        code: 'CONVERSION_GOAL_INVALID',
        slug: t.slug,
        message: `Invalid conversionGoal: ${String(goal)}`,
      });
    }

    const blocks = t.spec.blocks || [];
    const hasHero = blocks.some((b) => b.type === 'Hero');
    const hasAltOpener = blocks.some((b) =>
      b.type === 'Gallery' || b.type === 'Speaker' || b.type === 'Video' || b.type === 'Header',
    );
    if (!hasHero && !hasAltOpener) {
      errors.push({
        level: 'error',
        code: 'OPENER_MISSING',
        slug: t.slug,
        message: 'No Hero / Gallery / Speaker / Video / Header opener',
      });
    } else if (!hasHero) {
      warnings.push({
        level: 'warning',
        code: 'HERO_ABSENT_ALT_OPENER',
        slug: t.slug,
        message: 'No Hero — uses Gallery/Speaker/Video/Header opener',
      });
    }
    if (!hasConversionPath(blocks)) {
      errors.push({
        level: 'error',
        code: 'CONVERSION_PATH_MISSING',
        slug: t.slug,
        message: 'No LeadForm or CTA',
      });
    }
    if (!blockIdsUnique(blocks)) {
      errors.push({
        level: 'error',
        code: 'BLOCK_IDS_DUPLICATE',
        slug: t.slug,
        message: 'Duplicate block ids',
      });
    }

    const badVariants = variantsValid(blocks);
    if (badVariants.length) {
      errors.push({
        level: 'error',
        code: 'VARIANT_INVALID',
        slug: t.slug,
        message: badVariants.slice(0, 4).join(', '),
      });
    }

    try {
      sanitizeLandingPageSpec(structuredClone(t.spec));
    } catch (e) {
      errors.push({
        level: 'error',
        code: 'SANITIZE_FAIL',
        slug: t.slug,
        message: e instanceof Error ? e.message : 'sanitize failed',
      });
    }

    const fp = fingerprintForTemplate(t);
    if (!fingerprintsByCat.has(t.category)) fingerprintsByCat.set(t.category, new Map());
    const fpMap = fingerprintsByCat.get(t.category)!;
    const fpList = fpMap.get(fp) || [];
    fpList.push(t.slug);
    fpMap.set(fp, fpList);

    const sig = templateStructureSignature(t);
    if (!structureByCat.has(t.category)) structureByCat.set(t.category, new Map());
    const stMap = structureByCat.get(t.category)!;
    const stList = stMap.get(sig) || [];
    stList.push(t.slug);
    stMap.set(sig, stList);
  }

  for (const [cat, fpMap] of fingerprintsByCat) {
    for (const [fp, slugs] of fpMap) {
      if (slugs.length > 1) {
        errors.push({
          level: 'error',
          code: 'FINGERPRINT_COLLISION',
          category: cat,
          message: `${slugs.join(',')} share fingerprint`,
        });
      }
    }
  }

  for (const [cat, stMap] of structureByCat) {
    const total = [...stMap.values()].reduce((n, arr) => n + arr.length, 0) || 1;
    for (const [sig, slugs] of stMap) {
      if (slugs.length >= 2 && slugs.length / total > similarityWarnShare) {
        warnings.push({
          level: 'warning',
          code: 'STRUCTURE_SIMILARITY',
          category: cat,
          message: `${slugs.join(',')} share structure ${sig.slice(0, 80)}`,
        });
      }
    }
  }

  const allFp = new Set<string>();
  for (const fpMap of fingerprintsByCat.values()) {
    for (const fp of fpMap.keys()) allFp.add(fp);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: templates.length,
      categories: fingerprintsByCat.size,
      uniqueSlugs: slugSet.size,
      uniqueFingerprints: allFp.size,
    },
  };
}

/** True when slug exists in the provided catalog (canonical). */
export function isCanonicalTemplateSlug(
  slug: string,
  templates: Array<{ slug: string }>,
): boolean {
  return templates.some((t) => t.slug === slug);
}
