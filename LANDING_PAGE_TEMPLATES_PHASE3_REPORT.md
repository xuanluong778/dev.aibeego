# Landing Page Templates — Phase 3 Report

**Date:** 2026-09-13  
**Catalog version:** `gallery-v8-phase3-full-catalog`  
**Scope:** Scale production-ready template system from SPA → 19 remaining categories (200 total)

---

## Summary

Phase 3 stamps **structural `blockVariants`** and **config-driven direction copy** for all 20 categories × 10 templates. Phase 2 renderer/variant engine unchanged.

| Gate | Result |
|------|--------|
| 200 templates | PASS |
| 20 categories × 10 | PASS |
| Variant stamping (≥3 major blocks / template) | PASS 20/20 categories |
| Similarity (≥85% FAIL, same-cat >75% FAIL) | **PASS** fail=0, warn=8 |
| Catalog validators | PASS (9 warnings: gallery-first openers) |
| Phase 2 SPA regression | PASS |
| SPA responsive QA (1440/768/390) | PASS |
| Catalog responsive QA (20 primaries × 3 VP) | PASS |
| Web build | PASS |

---

## Architecture / Implementation

### New files

| File | Role |
|------|------|
| `packages/shared/src/landing-page-category-variant-presets.ts` | Index-aligned variant profiles + category nudges + per-index overrides |
| `packages/shared/src/landing-page-category-directions.ts` | Category lexicons + `applyCategoryDirectionCopy()` |
| `packages/shared/src/landing-page-cta-copy.ts` | Shared CTA/form labels (breaks circular imports) |
| `scripts/test-landing-page-phase3-catalog.cjs` | Full-catalog gates + similarity + conversion map |
| `scripts/qa-landing-page-catalog-responsive.cjs` | 20 primary templates × desktop/tablet/mobile smoke |

### Wiring

- `CATEGORY_ARCHITECTURES` → `stampCategoryArchitectures()` merges presets into every variant (SPA hand-stamped variants preserved).
- `buildBlocksFromArchitecture()` → `applyCategoryDirectionCopy()` for all categories (SPA still uses hand-tuned `landing-page-spa-directions.ts`).
- Conversion-flow fixes on selected architectures (cosmetics buy, real estate viewing, website/coaching/agency/consulting/service goals).

### Block variant coverage (Phase 2 renderer)

Stamped across catalog for blocks present in each architecture:

- **Hero** — legacy heroVariant → foundation id (6+ shells)
- **Features / Benefits** — icon-grid, editorial-list, numbered, alternating, image-cards, minimal-list
- **Process** — timeline, steps
- **Gallery** — masonry, editorial-mosaic, featured-plus-grid, grid
- **Testimonials** — cards, quote-centered, editorial, portrait-quotes, metric-plus-quote
- **Pricing** — cards, comparison, minimal
- **CTA** — default, centered, split, banner, minimal, image-background, floating-card
- **LeadForm** — split, booking, compact, inline, card, minimal, floating-card (by `ctaStrategy`)

---

## Similarity (200 templates)

- **FAIL pairs:** 0
- **WARN pairs:** 8 (cross-category video/split flows at 83–85%, acceptable)
- Same-category max share: within gate (>75% would FAIL — none)

Top WARN (non-blocking):

- `seo-service-video` ↔ `saas-trial-video` (84.6%)
- `online-course-video` ↔ `webinar-register-video` (84.6%)
- `ebook-magnet-split` ↔ `lead-magnet-checklist-split` (84.6%)

---

## Conversion flow map (verified)

| Category | Goals |
|----------|-------|
| SaaS / Course / Webinar / Demo / Coaching | signup |
| Product / Fashion / Cosmetics | purchase |
| Clinic / Restaurant / Service (booking paths) | booking |
| Real estate | booking, lead |
| SEO / Agency / Website / Quote / Consulting | lead, contact |
| Ebook / Lead magnet | download, lead |
| Spa | booking, contact, lead |

---

## Responsive QA

- **SPA:** 10 templates × 3 viewports via live renderer route — **PASS**, no horizontal overflow
- **Catalog primaries:** 20 categories × 3 viewports — **PASS**

---

## Build / Test commands

```bash
pnpm --filter @marketingspa/shared build
node scripts/test-landing-page-phase2-engine.cjs
node scripts/test-landing-page-phase3-catalog.cjs
node scripts/validate-landing-page-template-catalog.cjs
PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright node scripts/qa-landing-page-spa-responsive.cjs
PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright node scripts/qa-landing-page-catalog-responsive.cjs
```

CI: `.github/workflows/landing-page-saas.yml` now runs Phase 2 + Phase 3 + catalog validators.

---

## Catalog version & DB sync

- **Version bumped:** `gallery-v8-phase3-full-catalog` in `landing-page-template-expand.ts`
- **DB sync:** Restart `dev-mkspa-api` (PM2) so `ensureSystemTemplates()` picks up new catalog version and stamped specs.
- **Web:** Rebuilt + `dev-mkspa-web` restarted via postbuild hook.

---

## Screenshots

Pipeline: `node scripts/generate-landing-page-template-screenshots.cjs [category]`

- **SaaS batch (pilot):** 9/10 OK; `saas-trial` QA flag `h1=false` — expected (primary flow opens with **Video**, not Hero).
- **Full 200 regen:** run per category or omit filter for all:

```bash
PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright node scripts/generate-landing-page-template-screenshots.cjs
```

---

## Known warnings / blockers

1. **8 gallery/video-first templates** — validator WARN `HERO_ABSENT_ALT_OPENER` (by design: Gallery/Speaker/Video leads).
2. **Screenshot QA** — templates without Hero in first screen may fail `h1` check in screenshot script (cosmetic gate, not layout break).
3. **API restart** — required once on dev for DB template sync (not run automatically in this session).
4. **WARN similarity 83–85%** — cross-category video/split siblings; monitor if catalog grows.

---

## Go / No-Go

**GO** — 200 templates meet Phase 3 quality bar: structural variants, industry copy, conversion mapping, similarity gates, responsive smoke. Ready for SaaS customers to pick template → swap branding/content → publish.
