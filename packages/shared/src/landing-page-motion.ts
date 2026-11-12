/** Opt-in entrance motion. Keys are local LpSelectionTarget element/field keys. */
export const LP_MOTION_PRESETS = [
  'fade',
  'slide-down',
  'slide-up',
  'slide-right',
  'slide-left',
  'zoom-in',
  'zoom-out',
  'slide-down-right',
  'slide-down-left',
  'slide-up-right',
  'slide-up-left',
] as const;
export type LandingPageMotionPreset = (typeof LP_MOTION_PRESETS)[number];
export type LandingPageMotion = {
  preset: LandingPageMotionPreset;
  trigger: 'load' | 'scroll';
  duration: number;
  delay: number;
};
export type LandingPageMotionStyle = {
  section?: LandingPageMotion;
  elements?: Record<string, LandingPageMotion>;
};
export const LP_MOTION_DEFAULTS = { trigger: 'scroll', duration: 1200, delay: 0 } as const;

export function lpMotionLocalKey(target: {
  element?: string | null;
  field?: string | null;
}): string {
  if (target.field) return `field:${target.field}`;
  const element = target.element || 'section';
  if (element === 'section' || element === 'section-background') return 'section';
  if (element === 'headline' || element === 'subheadline' || element === 'body')
    return `field:${element}`;
  if (element === 'cta') return 'field:ctaLabel';
  return element;
}

const localKeyPattern =
  /^(?:image|form|grid:[0-9]+|(?:countdown|item|field):[^\u0000-\u001f\u007f]+)$/;
export function isLandingPageMotionElementKey(key: string): boolean {
  return key.length <= 200 && localKeyPattern.test(key);
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export function sanitizeLandingPageMotion(input: unknown): LandingPageMotion | undefined {
  if (!record(input) || !LP_MOTION_PRESETS.includes(input.preset as LandingPageMotionPreset))
    return undefined;
  if (input.trigger !== 'load' && input.trigger !== 'scroll') return undefined;
  const number = (value: unknown, fallback: number, min: number, max: number) =>
    typeof value === 'number' && Number.isFinite(value)
      ? Math.round(Math.max(min, Math.min(max, value)))
      : fallback;
  return {
    preset: input.preset as LandingPageMotionPreset,
    // Accept legacy load payloads, but all native entrance motion now uses viewport entry.
    trigger: 'scroll',
    duration: number(input.duration, LP_MOTION_DEFAULTS.duration, 150, 1200),
    delay: number(input.delay, 0, 0, 400),
  };
}
export function sanitizeLandingPageMotionStyle(input: unknown): LandingPageMotionStyle | undefined {
  if (!record(input)) return undefined;
  const section = sanitizeLandingPageMotion(input.section);
  const elements: Record<string, LandingPageMotion> = {};
  if (record(input.elements)) {
    for (const [key, value] of Object.entries(input.elements).slice(0, 500)) {
      if (!isLandingPageMotionElementKey(key)) continue;
      const motion = sanitizeLandingPageMotion(value);
      if (motion) elements[key] = motion;
    }
  }
  return section || Object.keys(elements).length
    ? {
        ...(section ? { section } : {}),
        ...(Object.keys(elements).length ? { elements } : {}),
      }
    : undefined;
}
export function readLandingPageMotion(style: unknown, key: string): LandingPageMotion | undefined {
  const config = record(style) ? sanitizeLandingPageMotionStyle(style.lpMotion) : undefined;
  return key === 'section' ? config?.section : config?.elements?.[key];
}
/** Copy style first so changing one target never overwrites a sibling or another style. */
export function patchLandingPageMotion(
  style: Record<string, unknown> | undefined,
  key: string,
  value?: LandingPageMotion,
): Record<string, unknown> {
  const next = { ...style };
  const config = { ...sanitizeLandingPageMotionStyle(next.lpMotion) };
  if (key === 'section') {
    if (value) config.section = value;
    else delete config.section;
  } else {
    const elements = { ...config.elements };
    if (value) elements[key] = value;
    else delete elements[key];
    config.elements = elements;
  }
  const cleaned = sanitizeLandingPageMotionStyle(config);
  if (cleaned) next.lpMotion = cleaned;
  else delete next.lpMotion;
  return next;
}
/** Exact ID suffix match: item:a, field:itemTitle:a and field:itemDesc:a stay distinct. */
export function remapLandingPageMotion(
  input: unknown,
  ids: ReadonlyMap<string, string>,
  keepOriginal = false,
): LandingPageMotionStyle | undefined {
  const config = sanitizeLandingPageMotionStyle(input);
  if (!config?.elements) return config;
  const elements = keepOriginal ? { ...config.elements } : {};
  for (const [key, value] of Object.entries(config.elements)) {
    const nested =
      /^(item:|field:(?:itemTitle|itemDesc|itemImage|itemQuestion|itemAnswer|itemQuote|itemAuthor|planName|planPrice|planCta|fieldLabel):)(.+)$/.exec(
        key,
      );
    const mapped = nested ? ids.get(nested[2]!) : undefined;
    const nextKey = mapped ? nested![1]! + mapped : key;
    elements[nextKey] = { ...value };
  }
  return { ...config, elements };
}
