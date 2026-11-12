/**
 * Responsive + typography foundation for LandingPageRenderer.
 * Attribute-based viewport sim (preview/shot) — does NOT rely on browser @media alone.
 */

export const LP_RESPONSIVE_FOUNDATION_CSS = `
/* —— Container & content width —— */
[data-lp-canvas-root] [data-lp-container-inner] {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  box-sizing: border-box;
}
[data-lp-canvas-root] section[class*="px-"] {
  box-sizing: border-box;
}

/* —— Typography hierarchy (clamp scale) —— */
[data-lp-canvas-root] {
  font-size: var(--lp-fs-md, 1rem);
  line-height: var(--lp-lh-body, 1.6);
}
[data-lp-canvas-root] h1,
[data-lp-canvas-root] [data-lp-hero-copy] [data-lp-inline-field="headline"] {
  font-size: var(--lp-fs-hero, clamp(1.85rem, 4.2vw, 3.15rem));
  font-weight: var(--lp-fw-heading, 800);
  line-height: var(--lp-lh-heading, 1.12);
  letter-spacing: -0.03em;
  max-width: 100%;
}
[data-lp-canvas-root] h2,
[data-lp-canvas-root] [data-lp-section-head] h2 {
  font-size: clamp(1.35rem, 2.8vw, 1.85rem);
  font-weight: var(--lp-fw-heading, 800);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
[data-lp-canvas-root] h3 {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  line-height: 1.25;
}
[data-lp-canvas-root] [data-lp-hero-copy] p,
[data-lp-canvas-root] [data-lp-hero-copy] [data-lp-inline-field="subheadline"] {
  font-size: clamp(0.95rem, 2.2vw, 1.125rem);
  line-height: 1.55;
  max-width: var(--lp-text-width, 42rem);
}
[data-lp-canvas-root] p,
[data-lp-canvas-root] li {
  font-size: clamp(0.9375rem, 1.8vw, 1rem);
}

/* —— Forms: full width, no overflow —— */
[data-lp-canvas-root] [data-lp-form-block],
[data-lp-canvas-root] form#lead-form,
[data-lp-canvas-root] [data-lp-form-card] {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
[data-lp-canvas-root] input,
[data-lp-canvas-root] textarea,
[data-lp-canvas-root] select,
[data-lp-canvas-root] [data-lp-form-card] button[type="submit"] {
  max-width: 100%;
  box-sizing: border-box;
}

/* —— Gallery visual fallback —— */
[data-lp-gallery-fallback] {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--lp-image-radius, var(--lp-radius));
  background: linear-gradient(145deg, color-mix(in srgb, var(--lp-primary) 18%, var(--lp-surface)) 0%, var(--lp-surface-alt, var(--lp-surface)) 100%);
}

/* —— Simulated viewport shell widths (preview + shot; any mode) ——
 * Never target builder [data-lp-canvas-scroll] — that chrome must stay full
 * width; device bezels (390+20 / 768+28) would overflow a 390/768 scrollport
 * and create a horizontal scrollbar with left-biased preview.
 */
[data-lp-viewport="mobile"]:not([data-lp-canvas-scroll]) {
  width: 100% !important;
  max-width: min(100%, 390px) !important;
  margin-inline: auto !important;
  box-sizing: border-box !important;
}
[data-lp-viewport="tablet"]:not([data-lp-canvas-scroll]) {
  width: 100% !important;
  max-width: min(100%, 768px) !important;
  margin-inline: auto !important;
  box-sizing: border-box !important;
}
[data-lp-viewport="desktop"]:not([data-lp-canvas-scroll]) {
  width: 100% !important;
  max-width: 100% !important;
}

/* Builder device preview: no horizontal scroll; keep chrome centered */
[data-lp-canvas-scroll][data-lp-viewport="mobile"],
[data-lp-canvas-scroll][data-lp-viewport="tablet"] {
  overflow-x: hidden !important;
}
[data-lp-canvas-scroll][data-lp-viewport="mobile"] [data-lp-canvas-zoom-slot],
[data-lp-canvas-scroll][data-lp-viewport="tablet"] [data-lp-canvas-zoom-slot],
[data-lp-canvas-scroll][data-lp-viewport="mobile"] [data-lp-device-frame-host],
[data-lp-canvas-scroll][data-lp-viewport="tablet"] [data-lp-device-frame-host],
[data-lp-canvas-scroll][data-lp-viewport="mobile"] [data-lp-device-scale-slot],
[data-lp-canvas-scroll][data-lp-viewport="tablet"] [data-lp-device-scale-slot] {
  margin-left: auto !important;
  margin-right: auto !important;
}

/* —— Mobile reflow (attribute sim — NOT browser width) —— */
[data-lp-viewport="mobile"] [data-lp-canvas-root] {
  overflow-x: hidden !important;
  max-width: 100% !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Builder device chrome only: pin free sections to full screen width so
 * inner containers (margin:auto) center and nothing overflows horizontally. */
[data-lp-device-content] [data-lp-canvas-root] {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
[data-lp-device-content] [data-lp-section-chrome="1"][data-lp-position-mode="free"] {
  left: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] * {
  max-width: 100%;
  box-sizing: border-box;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] h1,
[data-lp-viewport="mobile"] [data-lp-canvas-root] h2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] h3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] p,
[data-lp-viewport="mobile"] [data-lp-canvas-root] li,
[data-lp-viewport="mobile"] [data-lp-canvas-root] span,
[data-lp-viewport="mobile"] [data-lp-canvas-root] a,
[data-lp-viewport="mobile"] [data-lp-canvas-root] button,
[data-lp-viewport="mobile"] [data-lp-canvas-root] label {
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}
[data-lp-viewport="mobile"] [data-lp-hero-copy] h1,
[data-lp-viewport="mobile"] [data-lp-hero-copy] [data-lp-inline-field="headline"] {
  font-size: clamp(1.6rem, 7vw, 2.05rem) !important;
  line-height: 1.14 !important;
}
[data-lp-viewport="mobile"] [data-lp-hero-copy] p,
[data-lp-viewport="mobile"] [data-lp-hero-copy] [data-lp-inline-field="subheadline"] {
  font-size: clamp(0.9375rem, 3.8vw, 1.0625rem) !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] img,
[data-lp-viewport="mobile"] [data-lp-canvas-root] video,
[data-lp-viewport="mobile"] [data-lp-canvas-root] iframe {
  max-width: 100% !important;
  width: 100% !important;
  height: auto !important;
}
[data-lp-viewport="mobile"] [data-lp-hero-grid],
[data-lp-viewport="mobile"] [data-lp-variant="split-left"] [data-lp-hero-grid],
[data-lp-viewport="mobile"] [data-lp-variant="split-right"] [data-lp-hero-grid],
[data-lp-viewport="mobile"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
  display: flex !important;
  flex-direction: column !important;
  gap: 1.25rem !important;
  grid-template-areas: unset !important;
}
[data-lp-viewport="mobile"][data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
  display: flex !important;
  flex-direction: column !important;
  grid-template-columns: unset !important;
  grid-template-areas: unset !important;
}
[data-lp-viewport="mobile"][data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-float] {
  justify-self: stretch !important;
  max-width: 100% !important;
}
[data-lp-viewport="mobile"] [data-lp-variant="split-right"] [data-lp-hero-visual] {
  order: -1;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .grid,
[data-lp-viewport="mobile"] [data-lp-pricing-grid],
[data-lp-viewport="mobile"] [data-lp-stats-grid],
[data-lp-viewport="mobile"] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-testimonials-grid],
[data-lp-viewport="mobile"] [data-lp-faq-grid],
[data-lp-viewport="mobile"] [data-lp-process-grid],
[data-lp-viewport="mobile"] [data-lp-form-split],
[data-lp-viewport="mobile"] [data-lp-cta-split],
[data-lp-viewport="mobile"] [data-lp-content-columns] {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .sm\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-12,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:col-span-3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:col-span-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:col-span-5 {
  grid-template-columns: minmax(0, 1fr) !important;
  grid-column: span 1 / span 1 !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:flex-row,
[data-lp-viewport="mobile"] [data-lp-list-variant="alternating"] [data-lp-alt-row] {
  flex-direction: column !important;
}
[data-lp-viewport="mobile"] [data-lp-hero-cta] a,
[data-lp-viewport="mobile"] [data-lp-cta-band] a,
[data-lp-viewport="mobile"] [data-lp-form-card] button[type="submit"] {
  width: 100% !important;
  justify-content: center !important;
  display: flex !important;
}
[data-lp-viewport="mobile"] [data-lp-form-block],
[data-lp-viewport="mobile"] form#lead-form {
  width: 100% !important;
  max-width: 100% !important;
  padding-inline: 0 !important;
}
[data-lp-viewport="mobile"] [data-lp-pricing-card],
[data-lp-viewport="mobile"] [data-lp-card-item] {
  min-width: 0 !important;
  max-width: 100% !important;
  transform: none !important;
}
[data-lp-viewport="mobile"] [data-lp-variant="editorial-overlay"] {
  min-height: min(72vh, 520px) !important;
  padding-block: 2.5rem !important;
}
[data-lp-viewport="mobile"] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-gallery-variant="featured-plus-grid"] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-list-variant="masonry"] [data-lp-cards-grid] {
  columns: 1 !important;
  display: grid !important;
  grid-template-columns: 1fr !important;
}
[data-lp-viewport="mobile"] [data-lp-cta-variant="split"] [data-lp-cta-split],
[data-lp-viewport="mobile"] [data-lp-form-variant="split"] [data-lp-form-split] {
  grid-template-columns: minmax(0, 1fr) !important;
  display: grid !important;
}
[data-lp-viewport="mobile"] [data-lp-cta-band] {
  flex-direction: column !important;
  align-items: stretch !important;
}
[data-lp-viewport="mobile"] [data-lp-cta-band] a,
[data-lp-viewport="mobile"] [data-lp-cta-action-panel] a {
  width: 100% !important;
  justify-content: center !important;
}
[data-lp-viewport="mobile"] footer[data-lp-footer-variant="columns"] > div,
[data-lp-viewport="mobile"] footer .md\\:flex-row {
  grid-template-columns: minmax(0, 1fr) !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 1rem !important;
}
[data-lp-viewport="mobile"] [data-lp-faq-grid]:not([data-lp-faq-grid="accordion"]) {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="mobile"] [data-lp-testimonials-variant="portrait-quotes"] [data-lp-testimonial-portrait] {
  flex-direction: column !important;
  align-items: flex-start !important;
}
/* 375px — tighter horizontal padding, readable min type */
[data-lp-viewport="mobile"] [data-lp-canvas-root] .px-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .sm\\:px-6 {
  padding-left: max(1rem, env(safe-area-inset-left, 0px)) !important;
  padding-right: max(1rem, env(safe-area-inset-right, 0px)) !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] {
  font-size: clamp(0.9375rem, 2.8vw, 1rem);
}

/* —— Tablet reflow (attribute sim — overrides Tailwind @media on wide preview browser) —— */
[data-lp-viewport="tablet"] [data-lp-canvas-root] {
  overflow-x: hidden !important;
  max-width: 100% !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] .md\\:grid-cols-2,
[data-lp-viewport="tablet"] [data-lp-canvas-root] .sm\\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-pricing-grid] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-stats-grid],
[data-lp-viewport="tablet"] [data-lp-process-grid],
[data-lp-viewport="tablet"] [data-lp-cards-grid]:not([data-lp-process-grid]),
[data-lp-viewport="tablet"] [data-lp-testimonials-grid] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-hero-grid].lg\\:grid-cols-12,
[data-lp-viewport="tablet"] [data-lp-hero-grid] {
  grid-template-columns: 1fr !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
}
[data-lp-viewport="tablet"] [data-lp-variant="split-right"] [data-lp-hero-visual] {
  order: -1;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] .lg\\:grid-cols-3,
[data-lp-viewport="tablet"] [data-lp-canvas-root] .lg\\:grid-cols-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-hero-copy] h1 {
  font-size: clamp(1.75rem, 4.5vw, 2.45rem) !important;
}
[data-lp-viewport="tablet"] [data-lp-cta-variant="split"] [data-lp-cta-split],
[data-lp-viewport="tablet"] [data-lp-form-variant="split"] [data-lp-form-split] {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="desktop"] [data-lp-cta-variant="split"] [data-lp-cta-split] {
  grid-template-columns: 1.2fr 0.8fr !important;
}
[data-lp-viewport="desktop"] [data-lp-form-variant="split"] [data-lp-form-split] {
  grid-template-columns: 1fr 1fr !important;
}
[data-lp-viewport="desktop"] [data-lp-variant="split-left"] [data-lp-hero-grid],
[data-lp-viewport="desktop"] [data-lp-variant="split-right"] [data-lp-hero-grid] {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  flex-direction: unset !important;
}
[data-lp-viewport="tablet"] [data-lp-cta-band] {
  flex-direction: column !important;
  align-items: stretch !important;
}
[data-lp-viewport="tablet"] footer[data-lp-footer-variant="columns"] > div {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-faq-grid]:not([data-lp-faq-grid="accordion"]) {
  grid-template-columns: minmax(0, 1fr) !important;
}

/* —— Public real breakpoints (375–767 / 768–1023 / 1440+) —— */
@media (max-width: 767px) {
  [data-lp-public-root] [data-lp-canvas-root],
  [data-lp-template-shot="1"] [data-lp-canvas-root] {
    overflow-x: hidden;
    width: 100%;
    max-width: 100%;
  }
  [data-lp-public-root] [data-lp-hero-grid],
  [data-lp-template-shot="1"] [data-lp-hero-grid] {
    display: flex !important;
    flex-direction: column !important;
  }
  [data-lp-public-root] [data-lp-pricing-grid],
  [data-lp-public-root] [data-lp-cards-grid],
  [data-lp-template-shot="1"] [data-lp-pricing-grid],
  [data-lp-template-shot="1"] [data-lp-cards-grid] {
    grid-template-columns: 1fr !important;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  [data-lp-public-root] [data-lp-pricing-grid],
  [data-lp-template-shot="1"] [data-lp-pricing-grid] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  [data-lp-public-root] [data-lp-hero-grid],
  [data-lp-template-shot="1"] [data-lp-hero-grid] {
    grid-template-columns: 1fr !important;
  }
  [data-lp-public-root] [data-lp-variant="split-left"] [data-lp-hero-grid],
  [data-lp-public-root] [data-lp-variant="split-right"] [data-lp-hero-grid],
  [data-lp-template-shot="1"] [data-lp-variant="split-left"] [data-lp-hero-grid],
  [data-lp-template-shot="1"] [data-lp-variant="split-right"] [data-lp-hero-grid] {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5rem !important;
  }
  [data-lp-public-root] [data-lp-cta-variant="split"] [data-lp-cta-split],
  [data-lp-template-shot="1"] [data-lp-cta-variant="split"] [data-lp-cta-split],
  [data-lp-public-root] [data-lp-form-variant="split"] [data-lp-form-split],
  [data-lp-template-shot="1"] [data-lp-form-variant="split"] [data-lp-form-split] {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
@media (min-width: 1024px) and (max-width: 1439px) {
  [data-lp-canvas-root] [data-lp-container-inner] {
    max-width: min(var(--lp-container, 68rem), calc(100% - 2.5rem));
  }
}
@media (min-width: 1440px) {
  [data-lp-canvas-root] [data-lp-container-inner] {
    max-width: min(var(--lp-container, 68rem), calc(100% - 2rem));
  }
}

/* —— Per-block responsive visibility (responsiveStyle → data-lp-hide-*) —— */
[data-lp-viewport="desktop"] [data-lp-hide-desktop="1"],
[data-lp-viewport="tablet"] [data-lp-hide-tablet="1"],
[data-lp-viewport="mobile"] [data-lp-hide-mobile="1"] {
  display: none !important;
}
@media (max-width: 767px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-hide-mobile="1"] {
    display: none !important;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-hide-tablet="1"] {
    display: none !important;
  }
}
@media (min-width: 1024px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-hide-desktop="1"] {
    display: none !important;
  }
}

/* Text-box visibility uses the same breakpoints. Selected text stays visible in the editor. */
[data-lp-viewport="desktop"] [data-lp-text-hide-desktop="1"]:not([data-lp-element-primary="1"]),
[data-lp-viewport="tablet"] [data-lp-text-hide-tablet="1"]:not([data-lp-element-primary="1"]),
[data-lp-viewport="mobile"] [data-lp-text-hide-mobile="1"]:not([data-lp-element-primary="1"]) {
  display: none !important;
}
@media (max-width: 767px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-text-hide-mobile="1"] {
    display: none !important;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-text-hide-tablet="1"] {
    display: none !important;
  }
}
@media (min-width: 1024px) {
  [data-lp-canvas-root]:not([data-lp-viewport]) [data-lp-text-hide-desktop="1"] {
    display: none !important;
  }
}
`.trim();

/** Load Google Font families referenced in theme tokens (catalog preview). */
export function ensureLandingPageCatalogFonts(fontFamilyRaw?: string): void {
  if (typeof document === 'undefined' || !fontFamilyRaw) return;
  const families = new Set<string>();
  const matches = fontFamilyRaw.match(/"([^"]+)"/g);
  if (matches) {
    for (const m of matches) {
      const name = m.replace(/"/g, '').trim();
      if (name && !/system-ui|Segoe UI|sans-serif|serif|monospace/i.test(name)) {
        families.add(name);
      }
    }
  }
  for (const family of families) {
    const id = `lp-font-${family.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }
}
