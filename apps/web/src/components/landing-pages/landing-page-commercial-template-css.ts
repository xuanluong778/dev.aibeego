/**
 * Layout corrections for catalog templates stamped `gallery-v22-*` (data-lp-catalog="v22").
 *
 * Root causes fixed here (instead of piling overrides onto the shared foundations):
 *  - The agency floating-card Hero declared `grid-template-areas` for [data-lp-hero-copy] /
 *    [data-lp-hero-visual], which are grandchildren of the grid. Only the form (a direct child)
 *    received a grid-area, so the form jumped to the top-right and copy/visual were auto-placed
 *    below it. Areas are now assigned to the three real grid children.
 *  - Centered Hero trust list kept a left check column next to centered text.
 *
 * Everything is scoped to v22 catalog roots, so pages saved from older templates are untouched.
 * Desktop/mobile switches use container queries, which follow the renderer width (real or simulated
 * builder viewport) instead of the browser window.
 */
export const LP_COMMERCIAL_TEMPLATE_CSS = `
[data-lp-catalog="v22"] {
  --lp-v22-radius: var(--lp-radius-lg, 16px);
}

/* —— Hero: copy | form with visual underneath (floating-card) —— */
[data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-areas: "copy" "form" "visual" !important;
  align-items: start !important;
  gap: clamp(1.25rem, 3vw, 2rem) !important;
}
[data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] > :nth-child(1) {
  grid-area: copy !important;
  grid-column: auto !important;
}
[data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] > :nth-child(2) {
  grid-area: visual !important;
  grid-column: auto !important;
  order: 0 !important;
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
}
[data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] > [data-lp-hero-float] {
  grid-area: form !important;
  grid-column: auto !important;
  justify-self: stretch !important;
  width: 100% !important;
  max-width: 28rem !important;
  margin-inline: auto !important;
}
[data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-visual] {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
}
@container (min-width: 960px) {
  [data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr) !important;
    grid-template-areas: "copy form" "visual form" !important;
    column-gap: clamp(2rem, 4vw, 3.5rem) !important;
    align-items: start !important;
  }
  [data-lp-catalog="v22"] [data-lp-variant="floating-card"] [data-lp-hero-grid] > [data-lp-hero-float] {
    max-width: none !important;
    margin-inline: 0 !important;
    position: sticky;
    top: 1.5rem;
  }
}

/* —— Hero: trust points as aligned inline chips (any composition) —— */
[data-lp-catalog="v22"] [data-lp-hero-trust] {
  display: flex !important;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 1.25rem;
  padding: 0;
}
[data-lp-catalog="v22"] [data-lp-hero-trust] > li {
  display: inline-flex !important;
  align-items: center;
  gap: 0.5rem;
  width: auto !important;
  margin: 0 !important;
}
[data-lp-catalog="v22"] [data-lp-hero-trust] > li > :last-child {
  flex: 0 1 auto !important;
  text-align: left !important;
}
[data-lp-catalog="v22"] .text-center [data-lp-hero-trust] {
  justify-content: center;
}
[data-lp-catalog="v22"] [data-lp-variant="centered"] [data-lp-hero-copy] p {
  margin-inline: auto;
}
[data-lp-catalog="v22"] [data-lp-variant="centered"] [data-lp-hero-cta] {
  justify-content: center;
}
/* Hero visual must never sit flush against the next section. */
[data-lp-catalog="v22"] section[aria-label="Hero"] {
  padding-bottom: clamp(2rem, 5vw, 4rem);
}

/* —— Pricing: featured card text must stay readable on the brand colour —— */
[data-lp-catalog="v22"] [data-lp-pricing-card] > ul {
  margin-bottom: 1.25rem;
}
[data-lp-catalog="v22"] [data-lp-pricing-card][data-lp-featured="1"] :is(ul, li, li span) {
  color: inherit !important;
  opacity: 1;
}

/* —— Cards and galleries: one aligned grid, one image ratio (no staggered masonry) —— */
[data-lp-catalog="v22"] :is([data-lp-gallery-variant="masonry"], [data-lp-list-variant="masonry"]) [data-lp-cards-grid] {
  columns: auto !important;
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
  align-items: stretch;
}
[data-lp-catalog="v22"] :is([data-lp-gallery-variant="masonry"], [data-lp-list-variant="masonry"]) [data-lp-card-item] {
  display: flex !important;
  flex-direction: column;
  margin-bottom: 0 !important;
  width: auto !important;
  break-inside: auto;
}
[data-lp-catalog="v22"] [data-lp-card-item] img {
  height: auto !important;
  aspect-ratio: 16 / 10 !important;
  object-fit: cover;
  width: 100%;
}

/* —— Exactly three cards/plans: one row on tablet and up (no 2 + 1 orphan) —— */
@container (min-width: 640px) {
  [data-lp-catalog="v22"] :is([data-lp-cards-grid], [data-lp-pricing-grid])[data-lp-item-count="3"].grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}
`.trim();
