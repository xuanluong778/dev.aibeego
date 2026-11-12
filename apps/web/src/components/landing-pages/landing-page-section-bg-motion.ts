/** Shared section surface CSS + motion (additive). */

export const LP_SECTION_BG_MOTION_CSS = `
@keyframes lp-bg-fade-in {
  from { opacity: 0.35; }
  to { opacity: 1; }
}
@keyframes lp-bg-ken-burns {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}
@keyframes lp-bg-pan-slow {
  from { background-position: 0% 50%; }
  to { background-position: 100% 50%; }
}
[data-lp-bg-motion="fade-in"] {
  animation: lp-bg-fade-in 1.2s ease-out both;
}
[data-lp-bg-motion="ken-burns"] {
  animation: lp-bg-ken-burns 18s ease-in-out infinite alternate;
  transform-origin: center;
}
/* When image is on ::before underlay, animate that layer only */
[style*="--lp-bg-image"][data-lp-bg-motion="ken-burns"] {
  animation: none;
}
[style*="--lp-bg-image"][data-lp-bg-motion="ken-burns"]::before {
  animation: lp-bg-ken-burns 18s ease-in-out infinite alternate;
  transform-origin: center;
  transform: var(--lp-bg-flip, none);
}
[style*="--lp-bg-image"][data-lp-bg-motion="fade-in"] {
  animation: none;
}
[style*="--lp-bg-image"][data-lp-bg-motion="fade-in"]::before {
  animation: lp-bg-fade-in 1.2s ease-out both;
}
[style*="--lp-bg-image"][data-lp-bg-motion="pan-slow"] {
  animation: none;
}
[style*="--lp-bg-image"][data-lp-bg-motion="pan-slow"]::before {
  animation: lp-bg-pan-slow 24s linear infinite alternate;
  background-size: 120% auto !important;
}
[data-lp-bg-motion="pan-slow"] {
  animation: lp-bg-pan-slow 24s linear infinite alternate;
  background-size: 120% auto !important;
}
/* Content <img> motion (reuse keyframes) */
img[data-lp-img-motion="fade-in"] {
  animation: lp-bg-fade-in 1.2s ease-out both;
}
img[data-lp-img-motion="ken-burns"] {
  animation: lp-bg-ken-burns 18s ease-in-out infinite alternate;
  transform-origin: center;
}
img[data-lp-img-motion="pan-slow"] {
  animation: lp-bg-pan-slow 24s linear infinite alternate;
  object-fit: cover;
}
/* Flip / ken-burns underlay via CSS vars — does not transform section children */
[style*="--lp-bg-image"] {
  position: relative;
  isolation: isolate;
}
[style*="--lp-bg-image"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: var(--lp-bg-image);
  background-size: var(--lp-bg-size, cover);
  background-position: var(--lp-bg-pos, center);
  background-repeat: no-repeat;
  transform: var(--lp-bg-flip, none);
}
[style*="--lp-bg-image"] > * {
  position: relative;
  z-index: 1;
}
`;
