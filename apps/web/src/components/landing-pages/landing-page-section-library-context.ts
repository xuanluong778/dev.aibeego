import type {
  LandingPageBlock,
  LandingPageTheme,
  LandingPageThemeTokens,
} from '@marketingspa/shared';
import { LANDING_PAGE_THEME_PRESETS, normalizeLandingPageThemeTokens } from '@marketingspa/shared';

export type SectionLibraryPresentation = {
  revision: 2;
  category: string;
  layout: string;
  columns: number;
  sourceVariant?: string;
  tone: 'light' | 'dark';
};

/** Stored in block.style so the existing autosave/publish contract retains it. */
export type SectionLibraryContext = {
  version: 1 | 2;
  presentation?: SectionLibraryPresentation;
  templateId: string;
  theme: LandingPageTheme;
  themeTokens: LandingPageThemeTokens;
  designFamily: string;
};

export function readSectionLibraryContext(block: LandingPageBlock): SectionLibraryContext | null {
  const value = (block.style as Record<string, unknown> | undefined)?.lpSectionLibrary;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Partial<SectionLibraryContext>;
  if (
    (data.version !== 1 && data.version !== 2) ||
    typeof data.templateId !== 'string' ||
    !data.theme ||
    !Object.hasOwn(LANDING_PAGE_THEME_PRESETS, data.theme) ||
    !data.themeTokens ||
    typeof data.themeTokens !== 'object'
  )
    return null;
  const raw = data.presentation && typeof data.presentation === 'object' ? data.presentation : null;
  const presentation: SectionLibraryPresentation | null =
    data.version === 2
      ? {
          revision: 2,
          category:
            typeof raw?.category === 'string' && /^[a-z-]{1,40}$/.test(raw.category)
              ? raw.category
              : 'content',
          layout:
            typeof raw?.layout === 'string' && /^[a-z-]{1,40}$/.test(raw.layout)
              ? raw.layout
              : 'default',
          columns: [1, 2, 3, 4].includes(Number(raw?.columns)) ? Number(raw?.columns) : 3,
          ...(typeof raw?.sourceVariant === 'string' && /^[a-z-]{1,40}$/.test(raw.sourceVariant)
            ? { sourceVariant: raw.sourceVariant }
            : {}),
          tone: raw?.tone === 'dark' ? 'dark' : 'light',
        }
      : null;
  return {
    version: data.version,
    ...(presentation ? { presentation } : {}),
    templateId: data.templateId,
    theme: data.theme,
    themeTokens: normalizeLandingPageThemeTokens(data.themeTokens, data.theme),
    designFamily: typeof data.designFamily === 'string' ? data.designFamily : 'conversion',
  };
}
