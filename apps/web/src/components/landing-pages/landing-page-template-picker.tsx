'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CheckCircle2, Eye, ImageOff, Loader2, Search } from 'lucide-react';
import { LANDING_PAGE_TEMPLATE_CATALOG_VERSION, type LandingPageSpec } from '@marketingspa/shared';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TemplateViewport } from './template-viewport-switcher';
import styles from './landing-page-template-picker.module.css';

// Load the renderer only when a user opens a full preview.
const TemplateFullscreenPreview = dynamic(() =>
  import('./template-fullscreen-preview').then((module) => module.TemplateFullscreenPreview),
);

export type LandingPagePickerTemplate = {
  id: string;
  slug: string;
  name: string;
  category: string;
  theme: string;
  description: string;
  thumbnailUrl?: string | null;
  previewLongImage?: string | null;
};

type Props = {
  templates: LandingPagePickerTemplate[];
  loading: boolean;
  loadError: string | null;
  actionError: string | null;
  selectedSlug: string;
  busy: boolean;
  onSelect: (slug: string) => void;
  onUse: (slug: string) => void;
  onRetry: () => void;
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function TemplateImage({ template }: { template: LandingPagePickerTemplate }) {
  const sources = useMemo(
    () =>
      Array.from(
        new Set(
          [
            template.previewLongImage,
            template.thumbnailUrl,
            `/landing-pages/templates/${encodeURIComponent(template.slug)}-long.webp`,
            `/landing-pages/templates/${encodeURIComponent(template.slug)}-thumb.webp`,
          ].filter((src): src is string => Boolean(src)),
        ),
      ),
    [template.slug, template.thumbnailUrl, template.previewLongImage],
  );
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
  }, [sources]);

  const source = sources[index];
  const src =
    source && !source.startsWith('data:') && !source.startsWith('blob:')
      ? `${source}${source.includes('?') ? '&' : '?'}v=${encodeURIComponent(LANDING_PAGE_TEMPLATE_CATALOG_VERSION)}`
      : source;

  return (
    <div className={styles.imageFrame}>
      {src ? (
        <>
          {!loaded ? <div className={styles.imageLoading} aria-hidden="true" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Giao diện ${template.name}`}
            width={640}
            height={800}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={styles.image}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(false);
              setIndex((current) => current + 1);
            }}
          />
        </>
      ) : (
        <div className={styles.imageMissing}>
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <span>Ảnh xem trước chưa có</span>
          <span className="text-xs">Bấm Xem trước để xem mẫu đầy đủ</span>
        </div>
      )}
    </div>
  );
}

export function LandingPageTemplatePicker({
  templates,
  loading,
  loadError,
  actionError,
  selectedSlug,
  busy,
  onSelect,
  onUse,
  onRetry,
}: Props) {
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<LandingPagePickerTemplate | null>(null);
  const [previewSpec, setPreviewSpec] = useState<LandingPageSpec | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<TemplateViewport>('desktop');
  const previewRequest = useRef(0);
  const selected = templates.find((template) => template.slug === selectedSlug);
  const filtered = useMemo(() => {
    const query = normalizeSearch(search);
    return templates.filter(
      (template) =>
        !query ||
        normalizeSearch(
          `${template.name} ${template.category} ${template.theme} ${template.description}`,
        ).includes(query),
    );
  }, [search, templates]);

  useEffect(
    () => () => {
      previewRequest.current += 1;
    },
    [],
  );

  function closePreview() {
    previewRequest.current += 1;
    setPreview(null);
    setPreviewSpec(null);
    setPreviewLoading(false);
  }

  async function openPreview(template: LandingPagePickerTemplate) {
    const request = ++previewRequest.current;
    setPreview(template);
    setPreviewSpec(null);
    setPreviewError(null);
    setPreviewLoading(true);
    setViewport('desktop');
    try {
      const row = await apiClient<{ definition: LandingPageSpec }>(
        `/landing-pages/templates/${encodeURIComponent(template.slug)}`,
      );
      if (previewRequest.current === request) setPreviewSpec(row.definition);
    } catch (error) {
      if (previewRequest.current === request) {
        setPreview(null);
        setPreviewError(
          error instanceof Error
            ? error.message
            : 'Không tải được bản xem trước. Vui lòng thử lại.',
        );
      }
    } finally {
      if (previewRequest.current === request) setPreviewLoading(false);
    }
  }

  return (
    <section
      className={styles.picker}
      aria-labelledby="lp-template-picker-title"
      data-lp-template-picker
    >
      <div className={styles.heading}>
        <div>
          <h2 id="lp-template-picker-title" className="text-lg font-semibold">
            Chọn Template
          </h2>
          <p className="mt-1 text-sm opacity-65">
            Xem trước giao diện, chọn mẫu phù hợp rồi chỉnh sửa trong Builder.
          </p>
        </div>
        <div className={styles.search}>
          <Search
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 opacity-50"
            aria-hidden="true"
          />
          <Input
            aria-label="Lọc template theo tên hoặc ngành"
            placeholder="Lọc theo tên / ngành…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={busy}
            className="pl-9"
          />
        </div>
      </div>

      <p className="mb-5 text-xs opacity-60" role="status">
        {loading
          ? 'Đang tải thư viện mẫu…'
          : `${filtered.length} template${search.trim() ? ` / ${templates.length} mẫu` : ' có sẵn'}`}
      </p>
      {loadError ? (
        <div
          className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-red-400/30 p-4"
          role="alert"
        >
          <span className="text-sm">{loadError}</span>
          <Button variant="outline" size="sm" onClick={onRetry} disabled={loading}>
            Thử lại
          </Button>
        </div>
      ) : null}
      {previewError ? (
        <p className="mb-4 text-sm text-red-300" role="alert">
          {previewError}
        </p>
      ) : null}

      <div className={styles.grid} data-lp-template-grid aria-busy={loading}>
        {loading
          ? Array.from({ length: 8 }, (_, index) => (
              <div key={index} className={styles.skeleton} aria-hidden="true" />
            ))
          : filtered.map((template) => {
              const active = selectedSlug === template.slug;
              return (
                <article
                  key={template.id}
                  className={`${styles.card} ${active ? styles.selected : ''}`}
                  data-lp-template-card={template.slug}
                >
                  <button
                    type="button"
                    className={styles.selectCard}
                    aria-label={`Chọn mẫu ${template.name}`}
                    aria-pressed={active}
                    disabled={busy}
                    onClick={() => onSelect(template.slug)}
                  >
                    <TemplateImage template={template} />
                    <div className={styles.cardInfo}>
                      <div className="mb-1 text-[10px] uppercase tracking-wide opacity-55">
                        {template.category} · {template.theme}
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {template.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed opacity-60">
                        {template.description}
                      </p>
                    </div>
                    {active ? (
                      <span className={styles.selectionBadge}>
                        <CheckCircle2 className="h-4 w-4" />
                        Đã chọn
                      </span>
                    ) : null}
                  </button>
                  <div className={styles.cardActions}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={busy}
                      onClick={() => void openPreview(template)}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Xem trước
                    </Button>
                  </div>
                </article>
              );
            })}
      </div>

      {!loading && !loadError && !filtered.length ? (
        <div className="py-14 text-center text-sm opacity-70">
          <p>
            {search.trim() ? 'Không có template khớp bộ lọc.' : 'Chưa có template trong thư viện.'}
          </p>
          {search.trim() ? (
            <Button variant="ghost" className="mt-2" onClick={() => setSearch('')}>
              Xóa bộ lọc
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.actionBar} data-lp-template-actions>
        {actionError ? (
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
        ) : null}
        <div className={styles.selectionInfo} aria-live="polite">
          <span className="text-xs opacity-60">
            {selected ? 'Template đã chọn' : 'Chọn một mẫu để bắt đầu'}
          </span>
          {selected ? (
            <span className="truncate text-sm font-semibold" title={selected.name}>
              {selected.name}
            </span>
          ) : null}
        </div>
        <div className={styles.primaryActions}>
          <Button
            size="lg"
            disabled={busy || !selected}
            onClick={() => selected && onUse(selected.slug)}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo…
              </>
            ) : (
              'Dùng template này'
            )}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link
              href="/landing-pages/templates"
              aria-disabled={busy}
              tabIndex={busy ? -1 : undefined}
              onClick={(event) => {
                if (busy) event.preventDefault();
              }}
            >
              Xem tất cả Templates
            </Link>
          </Button>
        </div>
      </div>

      {preview ? (
        <TemplateFullscreenPreview
          open
          title={preview.name}
          subtitle={`${preview.category} · ${preview.theme}`}
          spec={previewSpec}
          loading={previewLoading}
          viewport={viewport}
          onViewportChange={setViewport}
          onClose={closePreview}
          using={busy || previewLoading || !previewSpec}
          onUseTemplate={() => {
            const slug = preview.slug;
            closePreview();
            onSelect(slug);
            onUse(slug);
          }}
        />
      ) : null}
    </section>
  );
}
