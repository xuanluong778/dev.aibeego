/**
 * Client-safe agency-portfolio helpers.
 *
 * Do not import these from the @marketingspa/shared CJS barrel. Webpack star-export
 * of that barrel can leave `isAgencyPortfolioStandard` undefined and crash the
 * builder with: (0 , r.isAgencyPortfolioStandard) is not a function.
 */
import type { LandingPageSpec } from '@marketingspa/shared';

const AGENCY_PORTFOLIO_RENDERER_VERSION = 'agency-portfolio-v2';

export function isAgencyPortfolioStandard(
  spec: Pick<LandingPageSpec, 'meta'> | null | undefined,
): boolean {
  return spec?.meta?.rendererVersion === AGENCY_PORTFOLIO_RENDERER_VERSION;
}

export function agencyPortfolioRenderMeta(
  spec: LandingPageSpec,
  viewport: 'desktop' | 'tablet' | 'mobile',
) {
  const responsive = spec.meta?.responsiveInlineTextStyles;
  if (!isAgencyPortfolioStandard(spec) || !responsive) return spec.meta;
  const inlineTextStyles = { ...spec.meta?.inlineTextStyles };
  for (const key of Object.keys(responsive)) {
    const base = spec.meta?.inlineTextStyles?.[key];
    const override = responsive[key]?.[viewport];
    inlineTextStyles[key] = override ? { ...base, ...override } : base;
  }
  return { ...spec.meta, inlineTextStyles };
}
