# Landing Page Template Engine — Phase 2 Report

**Date:** 2026-09-13  
**Scope:** Renderer + Variant Engine + Design Tokens (SPA reference only)  
**Catalog version:** unchanged `gallery-v7-spa-offer-booking` (no mass template rewrite)

---

## A. Audit nhanh (root cause Phase 1 → trạng thái Phase 2)

| Block | Trước Phase 2 | Sau Phase 2 |
|---|---|---|
| **Hero** | 6 nhánh JSX thật | Giữ nguyên (không refactor) |
| **Pricing** | Không đọc `variant` (DEAD) | `cards` / `comparison` (table) / `minimal` — DOM khác |
| **Testimonials** | Chủ yếu CSS | `editorial` + `portrait-quotes` DOM riêng; `quote-centered` / `metric-plus-quote` / `cards` |
| **Gallery** | CSS mosaic/masonry | + `featured-plus-grid` DOM (featured figure + grid) |
| **Features/Benefits** | ListCards + list variants | Giữ + `alternating` / `editorial-list` / `numbered` / `image-cards` |
| **Process** | Phụ thuộc layout | `timeline` (vertical spine) + `steps` (horizontal) theo variant |
| **CTA** | `split`/`floating-card` DEAD | `split` 2-col + `floating-card` wrap — DOM thật |
| **LeadForm** | `split` chỉ max-width | `split` copy\|form + `booking` header strip |

---

## B. Files đã sửa / thêm

| File | Thay đổi |
|---|---|
| `apps/web/.../landing-page-renderer.tsx` | Structural shells Pricing/Process/CTA/LeadForm/Testimonials/Gallery + canvas token attrs |
| `apps/web/.../landing-page-variant-render.ts` | Additive CSS vars (density/typography/radius/shadow/button/image) + designFamily density overlays |
| `packages/shared/src/landing-page-types.ts` | Additive optional tokens: density, radiusSm/Md/Lg/Pill, shadowSm/Md/Lg, fontWeight*, lineHeight*, imageTreatment |
| `packages/shared/src/landing-page-theme-presets.ts` | `normalizeLandingPageThemeTokens` defaults cho field mới |
| `packages/shared/src/landing-page-block-variant-registry.ts` | **NEW** — registry `hasRendererImplementation` |
| `packages/shared/src/landing-page-template-validators.ts` | Pairwise Jaccard similarity (`evaluateTemplatePairSimilarity`) |
| `packages/shared/src/index.ts` | Export registry |
| `scripts/test-landing-page-phase2-engine.cjs` | **NEW** — Phase 2 gates |

**Không đổi:** Prisma schema, API response shape, 19 category khác, 200 screenshots, hardcode slug.

---

## C. Variant đã implement thật (composition/DOM)

### Pricing
- `cards` / `default` — card grid
- `comparison` — `<table data-lp-pricing-table>` feature × plan
- `minimal` — stacked list không card chrome

### Testimonials
- `editorial` — `data-lp-testimonial-editorial` (pull-quote border-left)
- `portrait-quotes` — flex avatar | quote
- `quote-centered`, `metric-plus-quote`, `cards` — giữ + marker

### Gallery
- `featured-plus-grid` — `data-lp-gallery-featured` + remaining grid
- `masonry` / `editorial-mosaic` / `grid` — layout shells

### Process
- `timeline` — vertical spine + nodes
- `steps` — numbered horizontal connector

### CTA
- `split` — `data-lp-cta-split` copy | action panel
- `floating-card` — `data-lp-cta-float-wrap` + elevated band
- `centered` / `banner` / `minimal` / `image-background` / `default`

### LeadForm
- `split` — `data-lp-form-split` copy | form
- `booking` — booking strip + form
- `compact` / `inline` / `floating-card` / `minimal` / `card`

### Design tokens (additive + normalize)
- typography scale vars + fontWeight/lineHeight
- section spacing + density multiplier
- radius Sm/Md/Lg/Pill, shadow Sm/Md/Lg
- buttonStyle (`solid`/`outline`/`pill`) via `data-lp-btn-style`
- imageTreatment via `data-lp-image-treatment`
- canvas: `data-lp-density`

---

## D. Kết quả 10 SPA (live markers sau rebuild)

| Architecture | Structural proof (live shot) |
|---|---|
| spa-luxury-editorial | density=spacious, Process **timeline** |
| spa-soft-minimal | short flow + split-left hero (giữ) |
| spa-clinic-clean | Process steps + booking form |
| spa-dark-premium | Gallery **featured**, Pricing **cards** |
| spa-organic-wellness | masonry / alternating |
| spa-offer-conversion | Pricing **comparison table** |
| spa-booking-first | CTA **split** |
| spa-gallery-first | Testimonials **portrait** |
| spa-local-business | local tokens + booking |
| spa-social-proof | metric testimonials early |

- Distinct sequences: **10/10**
- Distinct heroes: **≥5**
- Distinct designFamily: **9**
- Similarity pairwise (SPA): **fail=0, warn=0** (`SPA_SIMILARITY_GATES=PASS`)
- Responsive QA 1440/768/390 × 10: **VISUAL_QA_SPA=PASS**

---

## E. QA / lỗi còn lại

| Item | Status |
|---|---|
| `test-landing-page-phase2-engine.cjs` | PASS |
| `test-landing-page-spa-templates.cjs` | PASS |
| SPA responsive Playwright | PASS |
| Web full `tsc` | Pre-existing errors ngoài LP (sales, zalo, i18n…) — **0 error mới trong renderer/variant-render** |
| FAQ / Header / Footer variants | Vẫn chưa structural (ngoài scope Phase 2 major list) |
| Screenshot regen 200 | Không chạy (đúng yêu cầu) |
| DB sync catalog | Không bump version — SPA đã stamp variants; renderer đọc runtime |

---

## F. Go / No-go Phase 3 (scale 19 category)

### **CONDITIONAL GO** — đủ tốt để sang Phase 3 **nếu** Phase 3 chỉ:

1. Stamp `blockVariants` + copy-bank cho 19 category (data layer), **không** cần đụng lại Pricing/CTA/LeadForm/Process shells.
2. Chạy similarity gates trên từng category (threshold Phase 2).
3. Bump `LANDING_PAGE_TEMPLATE_CATALOG_VERSION` + `ensureSystemTemplates`.

### Chưa GO nếu Phase 3 kỳ vọng:
- FAQ/Header/Footer cũng phải đa dạng structural trước khi scale (nên làm nhanh trước Phase 3 hoặc trong Phase 3 early).
- Screenshot gallery đồng bộ 100% với renderer mới (có thể làm sau scale data).

**Khuyến nghị:** Phase 3 = generalize copy-bank + stamp variants 19 category + CI similarity; giữ renderer hiện tại làm nền.

---

## G. Cách verify nhanh

```bash
pnpm --filter @marketingspa/shared build
node scripts/test-landing-page-phase2-engine.cjs
node scripts/test-landing-page-spa-templates.cjs
PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright node scripts/qa-landing-page-spa-responsive.cjs
# Live markers:
curl -sS http://127.0.0.1:3020/lp-template-shot/spa-wellness-offer-conversion | grep pricing-table
```
