/**
 * Landing Page Auto — Phase 1 shared types (block + JSON config engine).
 * Additive module; independent from Funnel / Facebook App Review surfaces.
 */

import type { LandingPageTextBoxChrome } from './landing-page-text-box';

export const LANDING_PAGE_THEMES = [
  'MODERN',
  'PREMIUM',
  'MINIMAL',
  'BOLD',
  'CORPORATE',
] as const;
export type LandingPageTheme = (typeof LANDING_PAGE_THEMES)[number];

export const LANDING_PAGE_BLOCK_TYPES = [
  'Header',
  'Hero',
  'Benefits',
  'Features',
  'Product',
  'Pricing',
  'Testimonials',
  'Gallery',
  'Video',
  'Process',
  'Speaker',
  'Guarantee',
  'FAQ',
  'LeadForm',
  'CTA',
  'Footer',
  'Countdown',
] as const;
export type LandingPageBlockType = (typeof LANDING_PAGE_BLOCK_TYPES)[number];

/** Optional image presentation — additive; old pages omit safely. */
export type LandingPageImageFit = 'cover' | 'contain';
export type LandingPageImageStyle = {
  alt?: string;
  fit?: LandingPageImageFit;
  position?: string;
  borderRadius?: string;
  /** Letterbox / matte behind object-fit:contain. */
  bgColor?: string;
  /** Flip axes: "x" | "y" | "xy". */
  flip?: string;
  /** Motion preset id (fade-in | ken-burns | pan-slow). */
  motion?: string;
  /** Relative z-index for the image chrome. */
  zIndex?: string;
  /** Optional click-through link (builder Image settings). */
  href?: string;
};

export const LANDING_PAGE_COUNTDOWN_EXPIRE = [
  'zero',
  'hide',
  'message',
  'cta',
] as const;
export type LandingPageCountdownExpire = (typeof LANDING_PAGE_COUNTDOWN_EXPIRE)[number];

export const LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS = [
  'amethyst-flip',
  'champagne-editorial',
  'cyan-grid',
  'emerald-halo',
  'copper-ember',
  'rose-glass',
  'silver-minimal',
  'cobalt-orbit',
  'lime-terminal',
  'opal-ribbon',
] as const;

export const LANDING_PAGE_COUNTDOWN_STYLES = [
  'boxes',
  'inline',
  'minimal',
  ...LANDING_PAGE_COUNTDOWN_LAUNCH_STYLE_IDS,
] as const;
export type LandingPageCountdownStyle = (typeof LANDING_PAGE_COUNTDOWN_STYLES)[number];

export const LANDING_PAGE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type LandingPageStatus = (typeof LANDING_PAGE_STATUSES)[number];

export const LANDING_PAGE_DOMAIN_STATUSES = [
  'PENDING',
  'VERIFYING',
  'ACTIVE',
  'FAILED',
] as const;
export type LandingPageDomainStatus = (typeof LANDING_PAGE_DOMAIN_STATUSES)[number];

export const LANDING_PAGE_CATEGORIES = [
  'product',
  'cosmetics',
  'fashion',
  'spa',
  'real_estate',
  'seo',
  'website',
  'service',
  'course',
  'webinar',
  'coaching',
  'consulting',
  'quote',
  'ebook',
  'demo',
  'lead_magnet',
  'saas',
  'clinic',
  'restaurant',
  'agency',
] as const;
export type LandingPageCategory = (typeof LANDING_PAGE_CATEGORIES)[number];

export type LandingPageSeo = {
  title: string;
  metaDescription: string;
  canonical?: string | null;
  ogImage?: string | null;
  robotsIndex: boolean;
};

export type LandingPageThemeTokens = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  fontFamily: string;
  radius: string;
  /** Extended quick-theme tokens (optional on old pages — normalized at render). */
  accent?: string;
  border?: string;
  button?: string;
  gradient?: string;
  shadow?: string;
  /** Semantic design-system extensions — optional; normalize fills defaults. */
  canvas?: string;
  surfaceAlt?: string;
  textMuted?: string;
  containerWidth?: string;
  textWidth?: string;
  sectionSpacing?: string;
  /** Typography scale (CSS length). */
  fontSizeSm?: string;
  fontSizeMd?: string;
  fontSizeLg?: string;
  fontSizeXl?: string;
  fontSize2xl?: string;
  fontSizeHero?: string;
  imageRadius?: string;
  imageAspect?: string;
  buttonRadius?: string;
  buttonStyle?: string;
  /**
   * Additive V2 design-system slots — optional; normalize fills defaults.
   * Old pages without these fields keep previous look.
   */
  density?: 'compact' | 'comfortable' | 'spacious';
  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;
  radiusPill?: string;
  shadowSm?: string;
  shadowMd?: string;
  shadowLg?: string;
  fontWeightHeading?: number;
  fontWeightBody?: number;
  lineHeightHeading?: number;
  lineHeightBody?: number;
  imageTreatment?: 'editorial' | 'product-flat' | 'illustration' | 'photo-real';
  iconSurface?: string;
  iconColor?: string;
};

export type LandingPageBlockBase = {
  /** Native element inserted in a section flow; absent on legacy page blocks. */
  sectionPlacement?: import('./landing-page-section-elements').LandingPageSectionPlacement;
  id: string;
  type: LandingPageBlockType;
  enabled: boolean;
  /**
   * Presentation variant id (type-scoped). Omit / unknown → resolved as `default`
   * via resolveBlockVariant() — old DB specs stay valid.
   */
  variant?: string;
  /** Spacing: none | sm | md | lg */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: string | null;
  /** Canvas-first extras — optional on old pages. */
  locked?: boolean;
  hidden?: boolean;
  layerName?: string;
  style?: import('./landing-page-canvas').LandingPageCanvasStyle;
  responsiveStyle?: {
    tablet?: import('./landing-page-canvas').LandingPageCanvasStyle;
    mobile?: import('./landing-page-canvas').LandingPageCanvasStyle;
  };
  /**
   * Free-drag mode. Omit / 'flow' = document stack (default for old pages).
   * Only set to 'free' after the user free-drags this block.
   */
  positionMode?: import('./landing-page-free-position').LandingPagePositionMode;
  /** Desktop free coords (px) relative to canvas article. */
  freeLayout?: import('./landing-page-free-position').LandingPageFreeLayout;
  /** Optional per-viewport free coords; missing mobile → flow fallback. */
  responsiveFreeLayout?: import('./landing-page-free-position').LandingPageResponsiveFreeLayout;
};

export type LandingPageTextBlock = LandingPageBlockBase & {
  type: 'Hero' | 'CTA' | 'Guarantee' | 'Footer' | 'Header';
  headline?: string;
  subheadline?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string | null;
  imageStyle?: LandingPageImageStyle;
  videoUrl?: string | null;
  /** Hero / webinar event meta (optional — old pages omit). */
  eventDate?: string;
  eventTime?: string;
  eventFormat?: string;
  /** Explicit trust bullets (preferred over pipe-split body). */
  trustPoints?: string[];
};

export type LandingPageListItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string | null;
  imageUrl?: string | null;
  imageStyle?: LandingPageImageStyle;
  role?: string;
  /** Opt-in free drag within parent section. */
  positionMode?: import('./landing-page-free-position').LandingPagePositionMode;
  freeLayout?: import('./landing-page-free-position').LandingPageFreeLayout;
};

export type LandingPageListBlock = LandingPageBlockBase & {
  type: 'Benefits' | 'Features' | 'Process' | 'Gallery' | 'Product' | 'Speaker';
  headline?: string;
  subheadline?: string;
  items: LandingPageListItem[];
};

export type LandingPagePricingPlan = {
  id: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  highlighted?: boolean;
  /** Opt-in free drag within Pricing section (parity with list items). */
  positionMode?: import('./landing-page-free-position').LandingPagePositionMode;
  freeLayout?: import('./landing-page-free-position').LandingPageFreeLayout;
};

export type LandingPagePricingBlock = LandingPageBlockBase & {
  type: 'Pricing';
  headline?: string;
  subheadline?: string;
  plans: LandingPagePricingPlan[];
};

export type LandingPageTestimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string | null;
};

export type LandingPageTestimonialsBlock = LandingPageBlockBase & {
  type: 'Testimonials';
  headline?: string;
  items: LandingPageTestimonial[];
};

export type LandingPageFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type LandingPageFaqBlock = LandingPageBlockBase & {
  type: 'FAQ';
  headline?: string;
  items: LandingPageFaqItem[];
};

export type LandingPageVideoBlock = LandingPageBlockBase & {
  type: 'Video';
  headline?: string;
  videoUrl: string;
  posterUrl?: string | null;
};

export type LandingPageLeadFormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export type LandingPageLeadFormOptionsLayout =
  | 'select'
  | 'buttons'
  | 'checkboxes'
  | 'emoji'
  | 'scale'
  | 'stars';

/** Optional Canva-style card chrome for LeadForm presets. */
export type LandingPageFormTheme = {
  background?: string;
  border?: string;
  headlineColor?: string;
  labelColor?: string;
  mutedColor?: string;
  inputBg?: string;
  inputBorder?: string;
  inputColor?: string;
  buttonBg?: string;
  buttonColor?: string;
  optionBg?: string;
  optionBorder?: string;
  radius?: string;
  /** serif titles like Canva form cards */
  titleFont?: 'serif' | 'sans';
  inputRadius?: string;
  inputUnderline?: boolean;
  inputBorderBottom?: string;
  buttonRadius?: string;
};

export type LandingPageLeadFormField = {
  id: string;
  name: string;
  label: string;
  fieldType: LandingPageLeadFormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  /** How select/checkbox/radio options render in the card. */
  optionsLayout?: LandingPageLeadFormOptionsLayout;
};

/** Optional CRM routing — omit on old pages; org defaults apply at submit. */
export type LandingPageLeadFormCrmConfig = {
  pipelineId?: string;
  stageId?: string;
  assignedToId?: string;
  tags?: string[];
  /** When false and no assignedToId, skip org auto-assign. Default: auto-assign when no owner. */
  autoAssign?: boolean;
  /** Immediate outbound webhook on successful submit (HTTPS). */
  webhookUrl?: string;
  webhookSecret?: string;
};

export type LandingPageLeadFormBlock = LandingPageBlockBase & {
  type: 'LeadForm';
  headline?: string;
  subheadline?: string;
  submitLabel?: string;
  successMessage?: string;
  /** Privacy / disclaimer under the submit button (editable). */
  footerText?: string;
  formTheme?: LandingPageFormTheme;
  fields: LandingPageLeadFormField[];
  /** Per-form CRM pipeline / owner / tags (additive). */
  crm?: LandingPageLeadFormCrmConfig;
};

export type LandingPageCountdownBlock = LandingPageBlockBase & {
  type: 'Countdown';
  headline?: string;
  subheadline?: string;
  /** Brand / eyebrow above the headline (launch templates). */
  kicker?: string;
  /** ISO-8601 end datetime (preferred). */
  endsAt: string;
  /** IANA timezone label for display (e.g. Asia/Ho_Chi_Minh). */
  timezone?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  expireBehavior?: LandingPageCountdownExpire;
  expireMessage?: string;
  expireCtaLabel?: string;
  expireCtaUrl?: string;
  styleVariant?: LandingPageCountdownStyle;
  /** Split signup card on the 10 launch-countdown templates. */
  showSignup?: boolean;
  formHeadline?: string;
  submitLabel?: string;
};

export type LandingPageBlock =
  | LandingPageTextBlock
  | LandingPageListBlock
  | LandingPagePricingBlock
  | LandingPageTestimonialsBlock
  | LandingPageFaqBlock
  | LandingPageVideoBlock
  | LandingPageLeadFormBlock
  | LandingPageCountdownBlock;

export type LandingPageSpec = {
  version: 1;
  theme: LandingPageTheme;
  themeTokens: LandingPageThemeTokens;
  seo: LandingPageSeo;
  blocks: LandingPageBlock[];
  /** Content provenance: profile | ai | user — preserved across sanitize/autosave. */
  meta?: {
    /** Stamped catalog generation id — drives ensureSystemTemplates DB sync. */
    catalogVersion?: string;
    /** Creation-only Vietnamese copy edition; absent on existing saved pages. */
    templateCopyVersion?: 'vi-VN-v1';
    /** Persisted rendering contract; missing/unknown values use legacy. */
    rendererVersion?: string;
    /**
     * Original uploaded HTML, kept for version history and re-export.
     * Visual sections live in htmlSections when the page was imported.
     */
    htmlSource?: string;
    /** One isolated section per editable block. Scripts are not included. */
    htmlSections?: Array<{ blockId: string; html: string; label?: string }>;
    /** Shown in the builder when part of an upload could not be kept. */
    htmlImportNotes?: string[];
    /** HTML was turned into editable blocks. Scripts were not executed. */
    htmlConverted?: boolean;
    /** CSS from the upload, selectors scoped to the landing page. */
    scopedCss?: string;
    /** Number of script tags removed during import. */
    isolatedScriptCount?: number;
    /** Google Fonts stylesheet URL only. */
    fontHref?: string;
    fieldSources?: Record<string, 'profile' | 'ai' | 'user'>;
    profileAppliedAt?: string | null;
    lastAiAt?: string | null;
    /** A single generated spec is shared by preview, draft and Builder. */
    aiGenerationId?: string;
    aiTemplateSlug?: string;
    aiSource?: 'ai' | 'fallback';
    /** Visual layout variant — independent of theme colors. */
    layout?: import('./landing-page-ui').LandingPageLayout;
    /** Optional category hint for layout resolution on older pages. */
    category?: LandingPageCategory | string;
    /** Design family (editorial | minimal | luxury | …). Optional on old specs. */
    designFamily?: import('./landing-page-template-foundation').LandingPageDesignFamily | string;
    /** Primary conversion goal (lead | booking | purchase | …). Optional on old specs. */
    conversionGoal?: import('./landing-page-template-foundation').LandingPageConversionGoal | string;
    /** Gold-standard preset id (agency or clinic benchmark directions). */
    goldStandard?:
      | import('./landing-page-agency-gold-system').AgencyPremiumStandard
      | import('./landing-page-clinic-gold-system').ClinicGoldStandard
      | import('./landing-page-saas-gold-system').SaasPremiumStandard
      | import('./landing-page-service-gold-system').ServicePremiumStandard
      | import('./landing-page-consulting-gold-system').ConsultingPremiumStandard
      | import('./landing-page-seo-gold-system').SeoPremiumStandard
      | import('./landing-page-website-gold-system').WebsitePremiumStandard
      | import('./landing-page-product-gold-system').ProductPremiumStandard
      | import('./landing-page-fashion-gold-system').FashionPremiumStandard
      | import('./landing-page-cosmetics-gold-system').CosmeticsPremiumStandard
      | string;
    /**
     * Canonical architecture recipe snapshot (SoT for template DNA on a page).
     * Prefer this over duplicating fields under gallery.architecture.
     */
    architectureRecipe?: import('./landing-page-template-foundation').LandingPageArchitectureRecipe;
    /** Gallery / preview metadata for template picker. */
    gallery?: {
      thumbnail?: string;
      previewLongImage?: string;
      badges?: Array<'new' | 'popular' | 'high_conversion'>;
      flowId?: string;
      /** @deprecated Prefer meta.architectureRecipe — kept for old drafts. */
      architecture?: {
        id?: string;
        heroVariant?: string;
        sectionSequence?: string[];
        ctaStrategy?: string;
        formPlacement?: string;
        proofType?: string;
        visualComposition?: string;
        designFamily?: string;
        conversionGoal?: string;
        purpose?: string;
      };
    };
    /** Quick Theme Switcher preset id (light|dark|luxury_gold|…|custom). */
    themePreset?: string;
    /** When true, AI must not overwrite user's theme choice. */
    themeUserLocked?: boolean;
    /**
     * One-line topic hint for field AI when the page otherwise lacks product/topic signal.
     * Set from the “Gợi ý AI” clarify prompt — scoped to this website.
     */
    aiTopicHint?: string;
    /** Optional copy tone for inline AI (professional | bold | friendly). */
    aiTone?: 'professional' | 'bold' | 'friendly' | string;
    /** Optional page goal override for inline AI (lead | sales | …). */
    aiPageGoal?: 'lead' | 'sales' | 'signup' | 'consult' | 'event' | string;
    /**
     * Monotonic client autosave revision (builder concurrency).
     * Server rejects autosaves with a lower revision than stored.
     */
    clientRevision?: number;
    /** Last autosave request that landed. Retries with the same id do not overwrite. */
    lastAutosaveRequestId?: string;
    /**
     * Canvas inline text styles keyed by `${blockId}::${field}`.
     * Additive plain CSS props only (never HTML) — preserved across sanitize/autosave.
     */
    inlineTextStyles?: Record<
      string,
      {
        fontSize?: number;
        fontSizeUnit?: 'px' | 'rem';
        fontWeight?: 'normal' | 'bold' | number;
        textAlign?: 'left' | 'center' | 'right' | 'justify';
        color?: string;
        fontFamily?: string;
        fontStyle?: 'normal' | 'italic';
        textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
        textDecoration?: string;
        letterSpacing?: string;
        lineHeight?: number | string;
        backgroundImage?: string;
        backgroundClip?: 'text';
        webkitTextFillColor?: string;
        /** Semantic heading level for canvas InlineEditable (h1–h6). */
        headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
        /** Horizontal text box width (px) — enables reflow on L/R resize. */
        width?: number;
        /** Text box height (px) — corner resize. */
        height?: number;
        /** Wrapper chrome (fill, padding, border, radius, shadow, media, visibility). */
        box?: LandingPageTextBoxChrome;
      }
    >;
    /**
     * Per-element free offsets keyed by `${blockId}::${field}` (offset mode within section).
     */
    elementFreeLayouts?: Record<string, import('./landing-page-free-position').LandingPageFreeLayout>;
    /** Builder: hide inline field on canvas + publish (`${blockId}::${field}`). */
    elementHidden?: Record<string, boolean>;
    /** Builder: lock inline field from edit/drag (`${blockId}::${field}`). */
    elementLocked?: Record<string, boolean>;
    /** Per-viewport inline text styles for sync-from-mobile (`${blockId}::${field}`). */
    responsiveInlineTextStyles?: Record<
      string,
      Partial<
        Record<
          'desktop' | 'tablet' | 'mobile',
          {
            fontSize?: number;
            fontSizeUnit?: 'px' | 'rem';
            fontWeight?: 'normal' | 'bold' | number;
            textAlign?: 'left' | 'center' | 'right' | 'justify';
            color?: string;
            fontFamily?: string;
            box?: LandingPageTextBoxChrome;
          }
        >
      >
    >;
  };
};

export type LandingPageTemplateDefinition = {
  slug: string;
  name: string;
  category: LandingPageCategory;
  theme: LandingPageTheme;
  description: string;
  tags: string[];
  spec: LandingPageSpec;
  /** Grid thumbnail (light). Prefer WebP later — same basename. */
  thumbnail?: string;
  /** Full-page long preview for hover-scroll. */
  previewLongImage?: string;
  badges?: Array<'new' | 'popular' | 'high_conversion'>;
  /** Design family — stamped by catalog expand; optional on handcrafted seeds. */
  designFamily?: import('./landing-page-template-foundation').LandingPageDesignFamily | string;
  /** Conversion goal — stamped by catalog expand; optional on handcrafted seeds. */
  conversionGoal?: import('./landing-page-template-foundation').LandingPageConversionGoal | string;
};

export const LANDING_PAGE_THEME_PRESETS: Record<LandingPageTheme, LandingPageThemeTokens> = {
  MODERN: {
    primary: '#F97316',
    secondary: '#0F172A',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    radius: '12px',
  },
  PREMIUM: {
    primary: '#C2410C',
    secondary: '#1E293B',
    background: '#FAFAF9',
    surface: '#FFFFFF',
    text: '#1C1917',
    muted: '#78716C',
    fontFamily: '"Fraunces", "Palatino Linotype", serif',
    radius: '14px',
  },
  MINIMAL: {
    primary: '#0F172A',
    secondary: '#334155',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    muted: '#64748B',
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    radius: '8px',
  },
  BOLD: {
    primary: '#F97316',
    secondary: '#0B1F3A',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#0B1F3A',
    muted: '#64748B',
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    radius: '10px',
  },
  CORPORATE: {
    primary: '#2563EB',
    secondary: '#0F172A',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    radius: '8px',
  },
};
