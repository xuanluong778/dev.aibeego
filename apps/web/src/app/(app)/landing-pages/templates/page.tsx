'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import { useCurrentUser } from '@/hooks/use-auth';
import { useT } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { TemplateHoverPreview } from '@/components/landing-pages/template-hover-preview';
import { TemplateFullscreenPreview } from '@/components/landing-pages/template-fullscreen-preview';
import type { TemplateViewport } from '@/components/landing-pages/template-viewport-switcher';
import type { LandingPageSpec } from '@marketingspa/shared';
import {
  LANDING_PAGE_CATEGORIES,
  LANDING_PAGE_TEMPLATE_CATALOG_VERSION,
} from '@marketingspa/shared';

type TemplateBadge = 'new' | 'popular' | 'high_conversion';

type Template = {
  id: string;
  slug: string;
  name: string;
  category: string;
  theme: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string | null;
  previewLongImage?: string | null;
  htmlPreviewUrl?: string | null;
  badges?: TemplateBadge[];
  designFamily?: string | null;
  conversionGoal?: string | null;
  architectureId?: string | null;
  isSystem: boolean;
  publishStatus?: 'DRAFT' | 'PUBLISHED';
  hasPublishedVersion?: boolean;
};

const PAGE_SIZE = 12;

// Display labels only: category keys remain the API/filter contract.
const CATEGORY_LABEL: Record<string, string> = {
  product: 'Sản phẩm',
  cosmetics: 'Mỹ phẩm',
  fashion: 'Thời trang',
  spa: 'Spa',
  real_estate: 'Bất động sản',
  seo: 'SEO',
  website: 'Website',
  service: 'Dịch vụ',
  course: 'Khóa học',
  webinar: 'Hội thảo',
  coaching: 'Huấn luyện',
  consulting: 'Tư vấn',
  quote: 'Báo giá',
  ebook: 'Sách điện tử',
  demo: 'Demo',
  lead_magnet: 'Quà tặng',
  saas: 'SaaS',
  clinic: 'Phòng khám',
  restaurant: 'Nhà hàng',
  agency: 'Agency',
};

const BADGE_LABEL: Record<TemplateBadge, string> = {
  new: 'Mới',
  popular: 'Phổ biến',
  high_conversion: 'Tỉ lệ chuyển đổi cao',
};

const BADGE_CLASS: Record<TemplateBadge, string> = {
  new: 'bg-sky-500/90 text-white',
  popular: 'bg-amber-500/90 text-white',
  high_conversion: 'bg-emerald-600/90 text-white',
};

const FAMILY_LABEL: Record<string, string> = {
  editorial: 'Editorial',
  minimal: 'Minimal',
  luxury: 'Luxury',
  bold: 'Bold',
  organic: 'Organic',
  corporate: 'Corporate',
  conversion: 'Conversion',
  portfolio: 'Portfolio',
  local: 'Local',
  product: 'Product',
};

const GOAL_LABEL: Record<string, string> = {
  lead: 'Lead',
  booking: 'Booking',
  purchase: 'Purchase',
  signup: 'Signup',
  download: 'Download',
  contact: 'Contact',
};

function withCatalogCacheBust(path: string) {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}v=${encodeURIComponent(LANDING_PAGE_TEMPLATE_CATALOG_VERSION)}`;
}

function imagePaths(slug: string, thumb?: string | null, long?: string | null, managed = false) {
  const fallbackThumb = `/landing-pages/templates/${slug}-thumb.webp`;
  const fallbackLong = `/landing-pages/templates/${slug}-long.webp`;
  // Uploaded packs own their media. Falling back to catalog screenshots shows an older design.
  const thumbnail = thumb || (managed ? '' : fallbackThumb);
  const preview = long || (managed ? thumbnail : fallbackLong);
  return {
    thumbnail: thumbnail ? withCatalogCacheBust(thumbnail) : '',
    previewLongImage: preview ? withCatalogCacheBust(preview) : '',
  };
}

function parseBadges(t: Template): TemplateBadge[] {
  if (t.badges?.length) return t.badges;
  const fromTags = (t.tags || [])
    .filter((x) => x.startsWith('badge:'))
    .map((x) => x.slice(6))
    .filter((b): b is TemplateBadge => b === 'new' || b === 'popular' || b === 'high_conversion');
  return fromTags;
}

async function packRequest(path: string, init: RequestInit = {}) {
  const token = authStorage.getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
    throw new Error(message || 'Không thực hiện được');
  }
  return res;
}

function usePrefersHover() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setOk(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);
  return ok;
}

export default function LandingPagesTemplatesPage() {
  const t = useT();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);
  const hoverOk = usePrefersHover();
  const [items, setItems] = useState<Template[]>([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewSpec, setPreviewSpec] = useState<LandingPageSpec | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [viewport, setViewport] = useState<TemplateViewport>('desktop');
  const [using, setUsing] = useState(false);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [versionsFor, setVersionsFor] = useState<string | null>(null);
  const [versions, setVersions] = useState<Array<{ version: number; note: string | null; createdAt: string }>>([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search.trim()) params.set('q', search.trim());
    const q = params.toString() ? `?${params.toString()}` : '';
    void apiClient<{ items: Template[] }>(`/landing-pages/templates${q}`)
      .then((r) => {
        setItems(r.items);
        setPage(1);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [category, search]);

  const openPreview = useCallback(async (slug: string) => {
    setPreviewSlug(slug);
    setViewport('desktop');
    setPreviewSpec(null);
    setPreviewLoading(true);
    try {
      const row = await apiClient<{ definition: LandingPageSpec; slug: string }>(
        `/landing-pages/templates/${encodeURIComponent(slug)}`,
      );
      setPreviewSpec(row.definition);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được preview');
      setPreviewSlug(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  async function reloadTemplates() {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search.trim()) params.set('q', search.trim());
    const q = params.toString() ? `?${params.toString()}` : '';
    const r = await apiClient<{ items: Template[] }>(`/landing-pages/templates${q}`);
    setItems(r.items);
  }

  async function downloadPack(slug: string) {
    setBusy(`download:${slug}`);
    setError(null);
    setNotice(null);
    try {
      const res = await packRequest(`/landing-pages/templates/${encodeURIComponent(slug)}/pack`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-template.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được mẫu');
    } finally {
      setBusy(null);
    }
  }

  function pickZip(slug: string | null) {
    uploadTarget.current = slug;
    fileRef.current?.click();
  }

  async function onZipChosen(file: File | undefined) {
    if (!file) return;
    const target = uploadTarget.current;
    setBusy(target ? `upload:${target}` : 'upload-new');
    setError(null);
    setNotice(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const path = target
        ? `/landing-pages/templates/${encodeURIComponent(target)}/pack`
        : '/landing-pages/templates/packs';
      await packRequest(path, { method: 'POST', body });
      await reloadTemplates();
      setNotice(target ? t('landingPages.packUpdatedLive') : t('landingPages.packUploaded'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function publishPack(slug: string) {
    setBusy(`publish:${slug}`);
    setError(null);
    try {
      await packRequest(`/landing-pages/templates/${encodeURIComponent(slug)}/publish`, { method: 'POST' });
      await reloadTemplates();
      setNotice(t('landingPages.packPublished'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xuất bản được');
    } finally {
      setBusy(null);
    }
  }

  async function toggleVersions(slug: string) {
    if (versionsFor === slug) {
      setVersionsFor(null);
      return;
    }
    setBusy(`versions:${slug}`);
    setError(null);
    try {
      const res = await packRequest(`/landing-pages/templates/${encodeURIComponent(slug)}/versions`);
      const body = (await res.json()) as { versions: Array<{ version: number; note: string | null; createdAt: string }> };
      setVersions(body.versions || []);
      setVersionsFor(slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được phiên bản');
    } finally {
      setBusy(null);
    }
  }

  async function restoreVersion(slug: string, version: number) {
    setBusy(`restore:${slug}`);
    setError(null);
    try {
      await packRequest(`/landing-pages/templates/${encodeURIComponent(slug)}/versions/${version}/restore`, {
        method: 'POST',
      });
      await reloadTemplates();
      setNotice(t('landingPages.packRestored'));
      setVersionsFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không khôi phục được');
    } finally {
      setBusy(null);
    }
  }

  async function useTemplate(slug: string, name: string) {
    setUsing(true);
    try {
      const pageRow = await apiClient<{ id: string }>('/landing-pages', {
        method: 'POST',
        body: JSON.stringify({ name, templateSlug: slug }),
      });
      router.push(`/landing-pages/builder/${pageRow.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được trang');
      setUsing(false);
    }
  }

  /** Chế độ admin: sửa trực tiếp mẫu gốc (khác "Sử dụng mẫu" là tạo bản sao riêng). */
  async function editTemplateSource(slug: string) {
    setUsing(true);
    try {
      const session = await apiClient<{ pageId: string }>(
        `/landing-pages/templates/${encodeURIComponent(slug)}/edit-session`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      router.push(`/landing-pages/builder/${session.pageId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không mở được mẫu để sửa');
      setUsing(false);
    }
  }

  const categories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return LANDING_PAGE_CATEGORIES.filter((c) => present.has(c));
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const previewMeta = items.find((i) => i.slug === previewSlug);

  return (
    <div>
      <PageHeader
        title={t('landingPages.templates')}
        description="Chọn mẫu theo ngành — hover xem nhanh, Xem trước full màn hình như builder."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2" data-lp-template-search>
        <input
          type="search"
          value={searchDraft}
          placeholder="Tìm mẫu theo tên, mô tả, tag…"
          className="min-w-[200px] flex-1 rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#F97316]/60"
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setSearch(searchDraft.trim());
          }}
        />
        <Button size="sm" variant="outline" onClick={() => setSearch(searchDraft.trim())}>
          Tìm
        </Button>
        {isAdmin ? (
          <Button size="sm" disabled={Boolean(busy)} onClick={() => pickZip(null)} data-lp-upload-new>
            {busy === 'upload-new' ? t('landingPages.packWorking') : t('landingPages.packUploadNew')}
          </Button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept=".zip,.html,.htm,application/zip,text/html"
          className="hidden"
          onChange={(e) => void onZipChosen(e.target.files?.[0])}
        />
        {search || category ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setSearchDraft('');
              setCategory('');
            }}
          >
            Xóa lọc
          </Button>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap gap-2" data-lp-template-categories>
        <Button size="sm" className="w-auto flex-none whitespace-nowrap" variant={category === '' ? 'default' : 'outline'} onClick={() => setCategory('')}>
          Tất cả
        </Button>
        {(category ? LANDING_PAGE_CATEGORIES : categories).map((c) => (
          <Button
            key={c}
            className="w-auto flex-none whitespace-nowrap"
            size="sm"
            variant={category === c ? 'default' : 'outline'}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_LABEL[c] || c}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs opacity-60">
        <span>
          {loading ? 'Đang tải…' : `${items.length} mẫu`}
          {category ? ` · ${CATEGORY_LABEL[category] || category}` : ' · mọi category'}
        </span>
        <span className="hidden sm:inline">
          {hoverOk ? 'Rê chuột vào ảnh để xem toàn trang' : 'Chạm Xem trước để xem đầy đủ trên mobile'}
        </span>
      </div>

      {isAdmin ? <p className="mb-3 text-xs text-amber-100/80">{t('landingPages.packDraftHint')}</p> : null}
      {notice ? <p className="mb-3 text-sm text-emerald-200">{notice}</p> : null}
      {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="aspect-[16/10] animate-pulse bg-white/10" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((tpl) => {
            const imgs = imagePaths(tpl.slug, tpl.thumbnailUrl, tpl.previewLongImage, tpl.tags.includes('pack:managed'));
            const badges = parseBadges(tpl);
            const family = tpl.designFamily || '';
            const goal = tpl.conversionGoal || '';
            return (
              <article
                key={tpl.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="relative overflow-hidden">
                  {imgs.thumbnail ? (
                    <TemplateHoverPreview
                      thumbnail={imgs.thumbnail}
                      previewLongImage={imgs.previewLongImage}
                      alt={tpl.name}
                      enableHoverScroll={hoverOk}
                    />
                  ) : (
                    <div className="flex aspect-[16/10] items-end overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-amber-900 p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{tpl.name}</p>
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {badges.map((b) => (
                      <span
                        key={b}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_CLASS[b]}`}
                      >
                        {BADGE_LABEL[b]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-2.5">
                  <div className="truncate text-[10px] font-semibold uppercase tracking-wide opacity-50">
                    {tpl.category}
                    {family ? ` · ${FAMILY_LABEL[family] || family}` : ''}
                    {goal ? ` · ${GOAL_LABEL[goal] || goal}` : ''}
                  </div>
                  <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">{tpl.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-[2rem] flex-1 text-xs leading-relaxed opacity-65">
                    {tpl.description}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2" data-lp-template-actions>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => void openPreview(tpl.slug)}>
                      Xem trước
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={using}
                      data-lp-use-template
                      onClick={() => void useTemplate(tpl.slug, tpl.name)}
                    >
                      Sử dụng mẫu
                    </Button>
                  </div>
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full border-amber-400/50 text-amber-100"
                      disabled={using}
                      data-lp-edit-template-source
                      title="Sửa trực tiếp mẫu gốc. Người dùng sẽ thấy thay đổi sau khi bạn xuất bản mẫu."
                      onClick={() => void editTemplateSource(tpl.slug)}
                    >
                      Sửa mẫu gốc
                    </Button>
                  ) : null}
                  {isAdmin ? (
                    <details className="relative mt-2" data-lp-template-more>
                      <summary className="cursor-pointer list-none text-center text-xs text-white/70 [&::-webkit-details-marker]:hidden">
                        Khác
                      </summary>
                      <div className="absolute bottom-7 right-0 z-20 flex w-44 flex-col gap-1 rounded-md border border-white/15 bg-zinc-950 p-1 shadow-lg">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start"
                          disabled={Boolean(busy)}
                          data-lp-download-template
                          onClick={() => void downloadPack(tpl.slug)}
                        >
                          {busy === `download:${tpl.slug}` ? t('landingPages.packWorking') : t('landingPages.packDownload')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start"
                          disabled={Boolean(busy)}
                          data-lp-upload-update
                          onClick={() => pickZip(tpl.slug)}
                        >
                          {busy === `upload:${tpl.slug}` ? t('landingPages.packWorking') : t('landingPages.packUploadUpdate')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start"
                          disabled={Boolean(busy)}
                          onClick={() => void toggleVersions(tpl.slug)}
                        >
                          {t('landingPages.packVersions')}
                        </Button>
                      </div>
                    </details>
                  ) : null}
                  {isAdmin && tpl.publishStatus === 'DRAFT' ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        {t('landingPages.packDraft')}
                      </span>
                      <Button size="sm" disabled={Boolean(busy)} onClick={() => void publishPack(tpl.slug)}>
                        {busy === `publish:${tpl.slug}` ? t('landingPages.packWorking') : t('landingPages.packPublish')}
                      </Button>
                    </div>
                  ) : null}
                  {isAdmin && versionsFor === tpl.slug ? (
                    <ul className="mt-2 space-y-1 text-xs">
                      {versions.length === 0 ? <li className="opacity-60">Chưa có phiên bản.</li> : null}
                      {versions.map((v) => (
                        <li key={v.version} className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            v{v.version}
                            {v.note ? ` · ${v.note}` : ''}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={Boolean(busy)}
                            onClick={() => void restoreVersion(tpl.slug, v.version)}
                          >
                            {t('landingPages.packRestore')}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <span className="text-xs opacity-60">
            Trang {page}/{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau
          </Button>
        </div>
      ) : null}

      <TemplateFullscreenPreview
        open={Boolean(previewSlug)}
        title={previewMeta?.name || previewSlug || 'Template'}
        subtitle={[previewMeta?.designFamily, previewMeta?.conversionGoal, previewMeta?.description]
          .filter(Boolean)
          .join(' · ')}
        spec={previewSpec}
        loading={previewLoading}
        viewport={viewport}
        onViewportChange={setViewport}
        onClose={() => {
          setPreviewSlug(null);
          setPreviewSpec(null);
        }}
        onUseTemplate={() => {
          if (!previewSlug) return;
          void useTemplate(previewSlug, previewMeta?.name || previewSlug);
        }}
        using={using}
      />
    </div>
  );
}
