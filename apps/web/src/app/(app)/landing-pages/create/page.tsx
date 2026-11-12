'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Globe2, LayoutTemplate, FilePlus2, Eye, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient } from '@/lib/api-client';
import { useT } from '@/i18n/i18n-provider';
import { useCurrentUser } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  emptyLandingPageCreateSetup,
  landingPageCreateStorageKey,
  parseLandingPageCreateSetup,
  landingPageCreateBrief,
  landingPageCreateFingerprint,
  type LandingPageCreateSetup,
  type LandingPageCreatePreview as AiPreview,
} from '@/components/landing-pages/landing-page-create-storage';
import actionStyles from '@/components/landing-pages/landing-page-create-actions.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LandingPageTemplatePicker,
  type LandingPagePickerTemplate,
} from '@/components/landing-pages/landing-page-template-picker';
import {
  LandingPageAiBriefFields,
  EMPTY_LANDING_PAGE_AI_FIELDS,
  type LandingPageAiFormFields,
} from '@/components/landing-pages/landing-page-ai-brief-fields';
import type { LandingPageUrlSummary, BusinessProfileData } from '@marketingspa/shared';
import type { TemplateViewport } from '@/components/landing-pages/template-viewport-switcher';
const TemplateFullscreenPreview = dynamic(() =>
  import('@/components/landing-pages/template-fullscreen-preview').then(
    (module) => module.TemplateFullscreenPreview,
  ),
);
type CreateMode = 'ai' | 'url' | 'template' | 'blank';
type PageGoal = 'lead' | 'sales' | 'signup' | 'consult' | 'event';
const PAGE_GOALS: { value: PageGoal; label: string }[] = [
  { value: 'lead', label: 'Nhận liên hệ' },
  { value: 'sales', label: 'Bán hàng' },
  { value: 'signup', label: 'Đăng ký' },
  { value: 'consult', label: 'Tư vấn / đặt lịch' },
  { value: 'event', label: 'Sự kiện' },
];
function requestKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
function profileFields(profile: BusinessProfileData): Partial<LandingPageAiFormFields> {
  return {
    businessType: profile.industry || '',
    brandName: profile.brandName || profile.companyName || '',
    productService: profile.productService || '',
    targetCustomer: profile.targetCustomer || '',
    uspBenefits: profile.usp || '',
    ctaLabel: profile.defaultCta || '',
    logoUrl: profile.logoUrl || '',
    brandColor: profile.brandColor || '',
    contactPhone: profile.hotline || '',
    contactEmail: profile.email || '',
    contactAddress: profile.address || '',
  };
}
const MODES: {
  id: CreateMode;
  title: string;
  desc: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: 'ai',
    title: 'Tạo nhanh bằng AI',
    desc: 'Trả lời vài câu — AI dựng sẵn toàn bộ landing page',
    icon: Sparkles,
  },
  {
    id: 'template',
    title: 'Chọn Template',
    desc: 'Bắt đầu từ mẫu sẵn, chỉnh trong Builder',
    icon: LayoutTemplate,
  },
  {
    id: 'url',
    title: 'Tạo từ Website/URL',
    desc: 'Dán link website — AI đọc nội dung công khai và dựng trang',
    icon: Globe2,
  },
  {
    id: 'blank',
    title: 'Trang trống',
    desc: 'Bắt đầu với 6 section có thể chỉnh sửa trong Builder',
    icon: FilePlus2,
  },
];

export default function LandingPagesCreatePage() {
  const t = useT();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const storageKey =
    user?.organizationId && user?.id
      ? landingPageCreateStorageKey(user.organizationId, user.id)
      : null;
  const [readyScope, setReadyScope] = useState<string | null>(null);
  const setupReady = Boolean(storageKey && readyScope === storageKey);
  const allowProfileAutofill = useRef(false);
  const storedSnapshot = useRef<{ key: string; setup: LandingPageCreateSetup } | null>(null);
  const lastBriefFingerprint = useRef('');
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [previewFingerprint, setPreviewFingerprint] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const submitLock = useRef(false);
  const generateRequest = useRef<{ fingerprint: string; key: string } | null>(null);
  const [mode, setMode] = useState<CreateMode>('ai');
  const [fields, setFields] = useState<LandingPageAiFormFields>({
    ...EMPTY_LANDING_PAGE_AI_FIELDS,
  });
  const [pageGoal, setPageGoal] = useState<PageGoal>('lead');
  const [tone, setTone] = useState('professional');
  const [useBizProfile, setUseBizProfile] = useState(true);
  const [bizProfile, setBizProfile] = useState<
    (BusinessProfileData & { isEmpty?: boolean }) | null
  >(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [urlSummary, setUrlSummary] = useState<LandingPageUrlSummary | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [templates, setTemplates] = useState<LandingPagePickerTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateSlug, setTemplateSlug] = useState('');
  const [blankName, setBlankName] = useState('Landing Page mới');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'previewing' | 'creating' | 'viewing'>('idle');
  const [createdPage, setCreatedPage] = useState<LandingPageCreateSetup['createdPage']>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewport, setViewport] = useState<TemplateViewport>('desktop');
  const [retryCreate, setRetryCreate] = useState<{ fingerprint: string; key: string } | null>(null);

  const currentFingerprint = landingPageCreateFingerprint({
    fields,
    pageGoal,
    tone,
    sourceUrl,
    useBizProfile,
  });
  const previewSaved = Boolean(
    aiPreview &&
    createdPage?.generationId &&
    createdPage.generationId === aiPreview.draftSpec.meta?.aiGenerationId,
  );
  storedSnapshot.current =
    setupReady && storageKey
      ? {
          key: storageKey,
          setup: {
            version: 1,
            fields,
            mode,
            pageGoal,
            tone,
            sourceUrl,
            useBizProfile,
            urlSummary,
            templateSlug,
            blankName,
            aiPreview: previewFingerprint === currentFingerprint ? aiPreview : null,
            previewFingerprint,
            generateRequest: generateRequest.current,
            createdPage,
          },
        }
      : null;

  function applyStoredSetup(setup: LandingPageCreateSetup) {
    lastBriefFingerprint.current = landingPageCreateFingerprint(setup);
    setFields(setup.fields);
    setMode(setup.mode);
    setPageGoal(setup.pageGoal);
    setTone(setup.tone);
    setSourceUrl(setup.sourceUrl);
    setUseBizProfile(setup.useBizProfile);
    setUrlSummary(setup.urlSummary);
    setTemplateSlug(setup.templateSlug);
    setBlankName(setup.blankName);
    setAiPreview(setup.aiPreview);
    setCreatedPage(setup.createdPage);
    setPreviewFingerprint(setup.previewFingerprint);
    generateRequest.current = setup.generateRequest;
    setPreviewOpen(false);
    setError(null);
    setNote(null);
  }
  useEffect(() => {
    if (!storageKey) return;
    setBizProfile(null);
    let setup = emptyLandingPageCreateSetup();
    allowProfileAutofill.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setup = parseLandingPageCreateSetup(saved);
        allowProfileAutofill.current = false;
      }
    } catch {
      setStorageWarning('Không đọc được thiết lập đã lưu. Trình duyệt có thể đang chặn lưu trữ.');
    }
    applyStoredSetup(setup);
    setReadyScope(storageKey);
  }, [storageKey]);

  function persistSetup(reportError = true) {
    const snapshot = storedSnapshot.current;
    if (!snapshot) return;
    try {
      localStorage.setItem(snapshot.key, JSON.stringify(snapshot.setup));
      if (reportError) setStorageWarning(null);
    } catch {
      if (reportError)
        setStorageWarning(
          'Chưa lưu được thiết lập trên trình duyệt. Kiểm tra quyền lưu trữ trước khi tải lại trang.',
        );
    }
  }
  useEffect(() => {
    persistSetup();
  }, [
    setupReady,
    storageKey,
    fields,
    mode,
    pageGoal,
    tone,
    sourceUrl,
    useBizProfile,
    urlSummary,
    templateSlug,
    blankName,
    aiPreview,
    previewFingerprint,
    busy,
    createdPage,
  ]);
  useEffect(() => {
    const flush = () => persistSetup(false);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, []);

  function resetSetup() {
    if (!storageKey || busy || crawling) return;
    const setup = { ...emptyLandingPageCreateSetup(), useBizProfile: false };
    allowProfileAutofill.current = false;
    // Persist the blank state, too: a delayed profile or F5 must not refill cleared fields.
    storedSnapshot.current = { key: storageKey, setup };
    persistSetup();
    applyStoredSetup(setup);
    setRetryCreate(null);
    setViewport('desktop');
    setResetOpen(false);
    setNote('Đã làm mới thông tin thiết lập.');
  }

  async function loadTemplates() {
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      const result = await apiClient<{ items: LandingPagePickerTemplate[] }>(
        '/landing-pages/templates',
      );
      setTemplates(result.items);
    } catch {
      setTemplatesError('Không tải được thư viện template. Vui lòng thử lại.');
    } finally {
      setTemplatesLoading(false);
    }
  }
  useEffect(() => {
    void loadTemplates();
  }, []);
  useEffect(() => {
    if (!setupReady) return;
    let active = true;
    void apiClient<BusinessProfileData & { isEmpty?: boolean }>('/landing-pages/business-profile')
      .then((profile) => {
        if (!active) return;
        setBizProfile(profile);
        if (profile.isEmpty || !allowProfileAutofill.current) return;
        allowProfileAutofill.current = false;
        const supplied = profileFields(profile);
        setFields(
          (previous) =>
            Object.fromEntries(
              Object.entries(previous).map(([key, value]) => [
                key,
                value || supplied[key as keyof LandingPageAiFormFields] || '',
              ]),
            ) as LandingPageAiFormFields,
        );
        setSourceUrl((previous) => previous || profile.website || '');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setupReady, storageKey]);

  // Editing a reviewed brief invalidates confirmation of the prior preview.
  useEffect(() => {
    if (!setupReady || lastBriefFingerprint.current === currentFingerprint) return;
    lastBriefFingerprint.current = currentFingerprint;
    setAiPreview(null);
    setPreviewFingerprint('');
    setPreviewOpen(false);
  }, [setupReady, currentFingerprint]);
  const aiReady = Boolean(
    fields.productService.trim() && fields.brandName.trim() && fields.targetCustomer.trim(),
  );

  async function analyzeUrl() {
    setCrawling(true);
    setError(null);
    try {
      const result = await apiClient<{ summary: LandingPageUrlSummary }>(
        '/landing-pages/crawl-url',
        { method: 'POST', body: JSON.stringify({ url: sourceUrl.trim() }) },
      );
      setUrlSummary(result.summary);
      applyUrlSummary(result.summary, false);
      setNote('Đã điền thông tin từ website. Kiểm tra và chỉnh sửa các ô bên dưới trước khi tạo.');
    } catch (failure) {
      setUrlSummary(null);
      setError(
        failure instanceof Error
          ? failure.message
          : 'Không đọc được website. Bạn có thể nhập thông tin thủ công.',
      );
    } finally {
      setCrawling(false);
    }
  }
  function applyUrlSummary(summary: LandingPageUrlSummary, replace: boolean) {
    const values: Partial<LandingPageAiFormFields> = {
      brandName: summary.brand || '',
      productService: (summary.productService || '').slice(0, 200),
      uspBenefits: summary.usp || '',
      ctaLabel: summary.cta || '',
      imageUrl: summary.imageUrl || '',
      logoUrl: summary.logoUrl || '',
      contactPhone: summary.contact?.phone || '',
      contactEmail: summary.contact?.email || '',
      contactAddress: summary.contact?.address || '',
    };
    setFields((previous) => ({
      ...previous,
      ...Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          replace ? value : previous[key as keyof LandingPageAiFormFields] || value,
        ]),
      ),
    }));
  }

  async function previewAi(forceNew = false) {
    if (submitLock.current || !aiReady || !setupReady) return;
    submitLock.current = true;
    setBusy(true);
    setPhase('previewing');
    setError(null);
    setNote(null);
    setAiPreview(null);
    const brief = landingPageCreateBrief({ fields, pageGoal, tone, sourceUrl, useBizProfile });
    const fingerprint = JSON.stringify(brief);
    if (forceNew || generateRequest.current?.fingerprint !== fingerprint)
      generateRequest.current = { fingerprint, key: requestKey('lp-ai-preview') };
    try {
      const result = await apiClient<Omit<AiPreview, 'name'> & { page?: { id: string } }>(
        '/landing-pages/generate',
        {
          method: 'POST',
          body: JSON.stringify({ ...brief, idempotencyKey: generateRequest.current!.key }),
        },
      );
      if (
        result.page?.id ||
        !result.draftSpec?.blocks?.length ||
        !result.draftSpec.meta?.aiGenerationId
      )
        throw new Error('Bản xem trước chưa hợp lệ. Vui lòng thử lại.');
      setAiPreview({ ...result, name: (fields.brandName || fields.productService).slice(0, 120) });
      setPreviewFingerprint(fingerprint);
      setViewport('desktop');
      setPreviewOpen(true);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Chưa tạo được bản xem trước. Vui lòng thử lại.',
      );
    } finally {
      setBusy(false);
      setPhase('idle');
      submitLock.current = false;
    }
  }
  async function createDraftFromPreview() {
    if (
      !aiPreview ||
      submitLock.current ||
      !setupReady ||
      previewFingerprint !== currentFingerprint
    )
      return;
    submitLock.current = true;
    setBusy(true);
    setPhase('creating');
    setError(null);
    try {
      // Persist the exact server preview in ONE create, with a stable retry key.
      const page = await apiClient<{ id: string; name: string; draftSpec: AiPreview['draftSpec'] }>(
        '/landing-pages',
        {
          method: 'POST',
          body: JSON.stringify({
            name: aiPreview.name,
            draftSpec: aiPreview.draftSpec,
            idempotencyKey: `lp-ai-draft-${aiPreview.draftSpec.meta!.aiGenerationId}`,
          }),
        },
      );
      if (
        !page.id ||
        page.draftSpec?.meta?.aiGenerationId !== aiPreview.draftSpec.meta?.aiGenerationId
      )
        throw new Error('Máy chủ chưa xác nhận lưu đúng bản thiết kế. Vui lòng thử lưu lại.');
      setCreatedPage({
        id: page.id,
        name: page.name || aiPreview.name,
        generationId: aiPreview.draftSpec.meta!.aiGenerationId,
      });
      setNote('Đã lưu Landing Page vào Trang của tôi.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Tạo bản nháp thất bại. Có thể thử lại với bản xem trước hiện tại.',
      );
      setPreviewOpen(true);
    } finally {
      setBusy(false);
      setPhase('idle');
      submitLock.current = false;
    }
  }
  async function openLive() {
    if (!createdPage || busy || !setupReady) return;
    persistSetup();
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    setBusy(true);
    setPhase('viewing');
    setError(null);
    try {
      const result = await apiClient<{ previewPath: string }>(
        `/landing-pages/${encodeURIComponent(createdPage.id)}/preview-token`,
        { method: 'POST' },
      );
      const url = new URL(result.previewPath, window.location.origin);
      if (url.origin !== window.location.origin || !url.pathname.startsWith('/p/preview/'))
        throw new Error('Chưa nhận được link xem trang hợp lệ.');
      if (tab && !tab.closed) tab.location.replace(url.href);
      else window.location.assign(url.href);
    } catch (failure) {
      tab?.close();
      setError(
        failure instanceof Error ? failure.message : 'Chưa mở được trang. Vui lòng thử lại.',
      );
    } finally {
      setBusy(false);
      setPhase('idle');
    }
  }
  const createBlankDraft = () => createSimpleDraft();
  async function createSimpleDraft(slug?: string) {
    if (submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    setPhase('creating');
    setError(null);
    const name = slug
      ? templates.find((template) => template.slug === slug)?.name || 'Landing Page mới'
      : blankName.trim() || 'Landing Page mới';
    const body = { name: name.slice(0, 120), ...(slug ? { templateSlug: slug } : { mode: 'blank' as const }) };
    const fingerprint = JSON.stringify(body);
    const key =
      retryCreate?.fingerprint === fingerprint ? retryCreate.key : requestKey('lp-create');
    setRetryCreate({ fingerprint, key });
    try {
      const page = await apiClient<{ id: string }>('/landing-pages', {
        method: 'POST',
        body: JSON.stringify({ ...body, idempotencyKey: key }),
      });
      router.push(`/landing-pages/builder/${page.id}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Chưa tạo được bản nháp. Vui lòng thử lại.',
      );
      setBusy(false);
      setPhase('idle');
      submitLock.current = false;
    }
  }

  return (
    <div
      className={
        mode === 'template'
          ? 'w-full min-w-0 max-w-none pb-40'
          : `mx-auto w-full max-w-4xl ${mode === 'ai' || mode === 'url' ? 'pb-24' : ''}`
      }
    >
      <PageHeader
        title={t('landingPages.create')}
        description="Chọn cách bắt đầu, xem trước giao diện rồi xác nhận tạo bản nháp để chỉnh sửa trong Builder."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-lp-create-modes>
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={busy || crawling || !setupReady}
              onClick={() => {
                setMode(item.id);
                setError(null);
                setNote(null);
                setPreviewOpen(false);
              }}
              className={`rounded-xl border p-4 text-left transition ${active ? 'border-orange-400/60 bg-white/10' : 'border-white/10 bg-black/20 hover:border-white/25'}`}
            >
              <Icon className={`mb-2 h-5 w-5 ${active ? 'text-orange-400' : 'opacity-70'}`} />
              <div className="text-sm font-semibold">{item.title}</div>
              <p className="mt-1 text-xs leading-relaxed opacity-65">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {mode === 'ai' || mode === 'url' ? (
        <section
          onChangeCapture={() => {
            allowProfileAutofill.current = false;
          }}
          className="space-y-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 sm:p-6"
        >
          <div>
            <h2 className="text-lg font-semibold">
              {mode === 'url' ? 'Tạo từ Website / URL' : 'Tạo Landing Page bằng AI'}
            </h2>
            <p className="mt-1 text-sm opacity-65">
              Thông tin càng cụ thể, nội dung càng sát nhu cầu. Chỉ tạo bản nháp sau khi bạn xác
              nhận; không tự xuất bản.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy || !setupReady || !bizProfile || bizProfile.isEmpty}
              onClick={() => {
                if (bizProfile) {
                  setFields((previous) => ({ ...previous, ...profileFields(bizProfile) }));
                  setUseBizProfile(true);
                }
              }}
            >
              Dùng thông tin doanh nghiệp
            </Button>
            <label className="flex items-center gap-2 text-xs opacity-70">
              <input
                type="checkbox"
                checked={useBizProfile}
                disabled={busy || !setupReady}
                onChange={(event) => setUseBizProfile(event.target.checked)}
              />
              Sử dụng Business Profile
            </label>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <Label htmlFor="lp-ai-source-url">
              Website tham khảo {mode === 'ai' ? '(tuỳ chọn)' : ''}
            </Label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                id="lp-ai-source-url"
                placeholder="https://…"
                value={sourceUrl}
                disabled={busy || crawling || !setupReady}
                onChange={(event) => {
                  setSourceUrl(event.target.value);
                  setUrlSummary(null);
                }}
              />
              <Button
                variant="outline"
                disabled={
                  busy || crawling || !setupReady || !/^https?:\/\//i.test(sourceUrl.trim())
                }
                onClick={() => void analyzeUrl()}
              >
                {crawling ? 'Đang đọc website…' : 'Phân tích URL'}
              </Button>
            </div>
            {urlSummary ? (
              <div className="mt-3 space-y-2 text-xs opacity-75">
                <p>
                  Đã đọc: {urlSummary.title}. Dữ liệu đã điền vào các ô bên dưới để bạn kiểm tra.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy || !setupReady}
                  onClick={() => applyUrlSummary(urlSummary, true)}
                >
                  Điền lại thông tin từ website
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-xs opacity-55">
                Bấm Phân tích URL để lấy thông tin công khai; bạn có thể sửa mọi dữ liệu trước khi
                tạo.
              </p>
            )}
          </div>
          <LandingPageAiBriefFields
            value={fields}
            onChange={setFields}
            disabled={busy || crawling || !setupReady}
            pageGoal={pageGoal}
          />
          <div>
            <Label>Mục tiêu trang</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PAGE_GOALS.map((goal) => (
                <Button
                  key={goal.value}
                  size="sm"
                  variant={pageGoal === goal.value ? 'default' : 'outline'}
                  disabled={busy || !setupReady}
                  onClick={() => setPageGoal(goal.value)}
                >
                  {goal.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="lp-ai-tone">Giọng văn</Label>
            <select
              id="lp-ai-tone"
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={tone}
              disabled={busy || !setupReady}
              onChange={(event) => setTone(event.target.value)}
            >
              <option value="professional">Chuyên nghiệp, dễ hiểu</option>
              <option value="friendly">Gần gũi</option>
              <option value="bold">Ngắn gọn, trực tiếp</option>
            </select>
          </div>
          {aiPreview ? (
            <div
              className="space-y-3 rounded-xl border border-orange-400/30 bg-orange-500/10 p-4 text-sm"
              data-lp-create-preview
            >
              <div className="font-semibold">
                {aiPreview.source === 'ai'
                  ? 'Bản thiết kế với nội dung AI'
                  : 'Bản nháp từ mẫu phù hợp'}
              </div>
              {aiPreview.warning ? (
                <p role="alert" className="text-amber-100">
                  {aiPreview.warning.replace(
                    'chọn Tạo lại nội dung',
                    'bấm Tạo landing Page để thử lại AI',
                  )}
                </p>
              ) : null}
              <p className="opacity-75">
                {aiPreview.draftSpec.blocks.filter((block) => block.enabled).length} section · Mẫu:{' '}
                {templates.find(
                  (template) => template.slug === aiPreview.templateSelection.templateSlug,
                )?.name || aiPreview.templateSelection.category}
              </p>
              <p className="text-xs opacity-65">
                Bản xem trước và bản nháp sử dụng cùng một thiết kế. Bạn có thể chỉnh sửa mọi
                section trong Builder.
              </p>
            </div>
          ) : null}
          {createdPage ? (
            <div
              className="space-y-2 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-4 text-sm"
              data-lp-created-page
            >
              <p>
                Đã lưu vào Trang của tôi: <strong>{createdPage.name}</strong>
              </p>
              <p className="text-xs opacity-70">
                Xem live mở trang này ở tab mới. Trang chưa xuất bản sử dụng link xem trước riêng.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="inline-block text-orange-300 underline underline-offset-4"
                  href="/landing-pages/pages"
                >
                  Mở Trang của tôi
                </Link>
                <Link
                  className="inline-block text-orange-300 underline underline-offset-4"
                  href={`/landing-pages/builder/${createdPage.id}`}
                >
                  Chỉnh sửa trong Builder
                </Link>
              </div>
            </div>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}
          {storageWarning ? (
            <p role="alert" className="text-sm text-amber-100">
              {storageWarning}
            </p>
          ) : null}
          <div
            className={actionStyles.bar}
            data-lp-create-actions
            data-lp-setup-ready={setupReady ? '1' : '0'}
          >
            <div className={actionStyles.inner}>
              <div className={actionStyles.buttons}>
                <Button
                  size="lg"
                  className={actionStyles.button}
                  disabled={busy || crawling || !aiReady || !setupReady}
                  data-lp-create-preview-btn
                  onClick={() => {
                    if (aiPreview?.source === 'fallback') void previewAi(true);
                    else if (aiPreview) setPreviewOpen(true);
                    else void previewAi();
                  }}
                >
                  {phase === 'previewing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Tạo landing Page
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={actionStyles.button}
                  disabled={busy || crawling || !createdPage || !setupReady}
                  data-lp-create-live-btn
                  onClick={() => void openLive()}
                >
                  {phase === 'viewing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}{' '}
                  {phase === 'viewing' ? 'Đang mở…' : 'Xem live'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={actionStyles.button}
                  disabled={busy || crawling || !setupReady}
                  data-lp-create-reset-btn
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw className="h-4 w-4" /> Làm mới
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {mode === 'template' ? (
        <LandingPageTemplatePicker
          templates={templates}
          loading={templatesLoading}
          loadError={templatesError}
          actionError={error}
          selectedSlug={templateSlug}
          busy={busy}
          onSelect={setTemplateSlug}
          onUse={(slug) => void createSimpleDraft(slug)}
          onRetry={() => void loadTemplates()}
        />
      ) : null}
      {mode === 'blank' ? (
        <section className="space-y-4 rounded-2xl border border-white/10 p-6" data-lp-create-blank>
          <h2 className="text-lg font-semibold">Trang trống</h2>
          <Label htmlFor="lp-blank-name">Tên trang</Label>
          <Input
            id="lp-blank-name"
            value={blankName}
            disabled={busy}
            onChange={(event) => setBlankName(event.target.value)}
          />
          <Button disabled={busy || !blankName.trim()} onClick={() => void createBlankDraft()}>
            Tạo bản nháp → Builder
          </Button>
        </section>
      ) : null}
      {mode === 'blank' && error ? (
        <p role="alert" className="mt-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {note ? (
        <p className="mt-3 text-xs opacity-70" role="status">
          {note}
        </p>
      ) : null}
      {previewOpen && aiPreview ? (
        <TemplateFullscreenPreview
          open
          title={aiPreview.name}
          subtitle={
            previewSaved
              ? 'Đã lưu vào Trang của tôi'
              : aiPreview.source === 'ai'
                ? 'AI đã tạo nội dung · Chưa lưu vào Trang của tôi'
                : 'Nội dung từ mẫu · Chưa lưu vào Trang của tôi'
          }
          spec={aiPreview.draftSpec}
          loading={false}
          viewport={viewport}
          onViewportChange={setViewport}
          onClose={() => setPreviewOpen(false)}
          onUseTemplate={() => {
            if (previewSaved) {
              persistSetup();
              router.push('/landing-pages/pages');
            } else void createDraftFromPreview();
          }}
          using={busy}
          actionError={error}
          useLabel={
            phase === 'creating'
              ? 'Đang lưu…'
              : previewSaved
                ? 'Mở Trang của tôi'
                : 'Lưu vào Trang của tôi'
          }
        />
      ) : null}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Làm mới thiết lập?</DialogTitle>
            <DialogDescription>
              Xóa thông tin đã nhập và bản xem trước đang lưu trên trình duyệt này để bắt đầu lại.
              Các Landing Page đã lưu trong hệ thống vẫn được giữ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Giữ thông tin
            </Button>
            <Button onClick={resetSetup} disabled={busy || crawling}>
              Làm mới thiết lập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
