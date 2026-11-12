import { landingPageUrlSummarySchema, validateLandingPageSpec } from '@marketingspa/shared';
import type {
  LandingPageSpec,
  LandingPageDoctorReport,
  LandingPageUrlSummary,
} from '@marketingspa/shared';
import type { LandingPageAiFormFields } from './landing-page-ai-brief-fields';

export type LandingPageCreateMode = 'ai' | 'url' | 'template' | 'blank';
export type LandingPageCreateGoal = 'lead' | 'sales' | 'signup' | 'consult' | 'event';
export type LandingPageCreatePreview = {
  draftSpec: LandingPageSpec;
  source: 'ai' | 'fallback';
  warning?: string;
  qualityReport?: LandingPageDoctorReport;
  templateSelection: { templateSlug: string; category: string };
  name: string;
};
export type LandingPageCreateSetup = {
  version: 1;
  fields: LandingPageAiFormFields;
  mode: LandingPageCreateMode;
  pageGoal: LandingPageCreateGoal;
  tone: string;
  useBizProfile: boolean;
  sourceUrl: string;
  urlSummary: LandingPageUrlSummary | null;
  templateSlug: string;
  blankName: string;
  aiPreview: LandingPageCreatePreview | null;
  previewFingerprint: string;
  generateRequest: { fingerprint: string; key: string } | null;
  createdPage: { id: string; name: string; generationId?: string } | null;
};
const limits: Record<keyof LandingPageAiFormFields, number> = {
  businessType: 80,
  brandName: 120,
  productService: 200,
  targetCustomer: 400,
  painPoint: 400,
  uspBenefits: 800,
  price: 80,
  offer: 200,
  ctaLabel: 80,
  ctaUrl: 2000,
  extraNotes: 1200,
  imageUrl: 2000,
  logoUrl: 2000,
  brandColor: 32,
  guarantee: 400,
  contactPhone: 40,
  contactEmail: 160,
  contactAddress: 300,
};
export function landingPageCreateStorageKey(organizationId: string, userId: string) {
  return `lp:create-setup:v1:${encodeURIComponent(organizationId)}:${encodeURIComponent(userId)}`;
}
export function emptyLandingPageCreateSetup(): LandingPageCreateSetup {
  return {
    version: 1,
    fields: Object.fromEntries(
      Object.keys(limits).map((key) => [key, '']),
    ) as LandingPageAiFormFields,
    mode: 'ai',
    pageGoal: 'lead',
    tone: 'professional',
    useBizProfile: true,
    sourceUrl: '',
    urlSummary: null,
    templateSlug: '',
    blankName: 'Landing Page mới',
    aiPreview: null,
    previewFingerprint: '',
    generateRequest: null,
    createdPage: null,
  };
}
export function landingPageCreateBrief(
  setup: Pick<
    LandingPageCreateSetup,
    'fields' | 'pageGoal' | 'tone' | 'sourceUrl' | 'useBizProfile'
  >,
) {
  return {
    ...Object.fromEntries(Object.entries(setup.fields).map(([key, value]) => [key, value.trim()])),
    pageGoal: setup.pageGoal,
    tone: setup.tone,
    sourceUrl: setup.sourceUrl.trim(),
    useBusinessProfile: setup.useBizProfile,
    sourceReviewed: true,
  };
}
export function landingPageCreateFingerprint(setup: Parameters<typeof landingPageCreateBrief>[0]) {
  return JSON.stringify(landingPageCreateBrief(setup));
}
/** Whitelist local data, keep deliberately empty fields, and never restore a stale preview. */
function validStoredSpec(spec: LandingPageSpec): boolean {
  try {
    return validateLandingPageSpec(spec).ok;
  } catch {
    return false;
  }
}
export function parseLandingPageCreateSetup(raw: string): LandingPageCreateSetup {
  if (raw.length > 2_000_000) throw new Error('Thiết lập lưu trên trình duyệt vượt giới hạn.');
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !value.fields || typeof value.fields !== 'object')
    throw new Error('Thiết lập lưu không hợp lệ.');
  const setup = emptyLandingPageCreateSetup();
  for (const key of Object.keys(limits) as (keyof LandingPageAiFormFields)[]) {
    if (typeof value.fields[key] === 'string')
      setup.fields[key] = value.fields[key].slice(0, limits[key]);
  }
  if (['ai', 'url', 'template', 'blank'].includes(value.mode)) setup.mode = value.mode;
  if (['lead', 'sales', 'signup', 'consult', 'event'].includes(value.pageGoal))
    setup.pageGoal = value.pageGoal;
  if (['professional', 'friendly', 'bold'].includes(value.tone)) setup.tone = value.tone;
  if (typeof value.useBizProfile === 'boolean') setup.useBizProfile = value.useBizProfile;
  for (const key of ['sourceUrl', 'templateSlug', 'blankName'] as const) {
    if (typeof value[key] === 'string')
      setup[key] = value[key].slice(0, key === 'sourceUrl' ? 2000 : 120);
  }
  const summary = landingPageUrlSummarySchema.safeParse(value.urlSummary);
  setup.urlSummary = summary.success ? summary.data : null;
  const fingerprint = landingPageCreateFingerprint(setup);
  if (
    /^[a-zA-Z0-9_-]{1,128}$/.test(value.createdPage?.id || '') &&
    typeof value.createdPage?.name === 'string'
  ) {
    setup.createdPage = { id: value.createdPage.id, name: value.createdPage.name.slice(0, 120) };
    if (
      typeof value.createdPage.generationId === 'string' &&
      value.createdPage.generationId.length <= 120
    )
      setup.createdPage.generationId = value.createdPage.generationId;
  }
  const preview = value.aiPreview;
  if (
    value.previewFingerprint === fingerprint &&
    preview &&
    ['ai', 'fallback'].includes(preview.source) &&
    typeof preview.name === 'string' &&
    typeof preview.templateSelection?.templateSlug === 'string' &&
    typeof preview.templateSelection?.category === 'string' &&
    typeof preview.draftSpec?.meta?.aiGenerationId === 'string' &&
    validStoredSpec(preview.draftSpec)
  ) {
    setup.aiPreview = {
      draftSpec: preview.draftSpec,
      source: preview.source,
      name: preview.name.slice(0, 120),
      templateSelection: {
        templateSlug: preview.templateSelection.templateSlug,
        category: preview.templateSelection.category,
      },
      ...(typeof preview.warning === 'string' ? { warning: preview.warning.slice(0, 2000) } : {}),
    };
    setup.previewFingerprint = fingerprint;
  }
  if (
    value.generateRequest?.fingerprint === fingerprint &&
    typeof value.generateRequest.key === 'string' &&
    value.generateRequest.key.length <= 120
  ) {
    setup.generateRequest = { fingerprint, key: value.generateRequest.key };
  }
  return setup;
}
