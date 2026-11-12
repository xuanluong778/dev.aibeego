'use client';

/**
 * GetResponse-style Section Library modal — production visual previews.
 * Cards + right panel use lazy scaled LandingPageRenderer (not wireframes).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import type { LandingPageTheme, LandingPageThemeTokens } from '@marketingspa/shared';
import {
  LP_SECTION_LIBRARY_CATEGORIES,
  LP_SECTION_LIBRARY_TEMPLATES,
  searchSectionLibraryTemplates,
  type LpSectionLibraryCategoryId,
  type LpSectionLibraryTemplate,
} from './landing-page-section-library-catalog';
import { LandingPageSectionLibraryPreview } from './landing-page-section-library-preview';
import { cn } from '@/lib/utils';

export type LandingPageSectionLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onInsertTemplate: (templateId: string) => void;
  onInsertBlank: () => void;
  /** Page theme is retained for compatibility; library sections keep their own design. */
  pageTheme?: LandingPageTheme | null;
  pageThemeTokens?: LandingPageThemeTokens | null;
};

const PAGE_SIZE = 18;

export function LandingPageSectionLibraryModal({
  open,
  onClose,
  onInsertTemplate,
  onInsertBlank,
}: LandingPageSectionLibraryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<LpSectionLibraryCategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const lightboxIdRef = useRef<string | null>(null);
  lightboxIdRef.current = lightboxId;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listEl, setListEl] = useState<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setVisibleCount(PAGE_SIZE);
    setPreviewId(LP_SECTION_LIBRARY_TEMPLATES[0]?.id ?? null);
    setLightboxId(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (lightboxIdRef.current) {
        e.preventDefault();
        e.stopPropagation();
        setLightboxId(null);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const filtered = useMemo(
    () => searchSectionLibraryTemplates(query, category),
    [query, category],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    listRef.current?.scrollTo({ top: 0 });
    if (filtered[0]) setPreviewId(filtered[0].id);
  }, [query, category, filtered]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((n) => Math.min(filtered.length, n + PAGE_SIZE));
        }
      },
      { root: listRef.current, rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, filtered.length, visible.length]);

  const preview = previewId
    ? LP_SECTION_LIBRARY_TEMPLATES.find((t) => t.id === previewId) || null
    : null;
  const lightbox = lightboxId
    ? LP_SECTION_LIBRARY_TEMPLATES.find((t) => t.id === lightboxId) || null
    : null;

  const insert = useCallback(
    (id: string) => {
      onInsertTemplate(id);
      onClose();
    },
    [onInsertTemplate, onClose],
  );

  const openLightbox = useCallback((id: string) => {
    setPreviewId(id);
    setLightboxId(id);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/55 p-3 sm:p-5"
      data-lp-section-library-modal="1"
      data-lp-section-library-production="1"
      role="dialog"
      aria-modal="true"
      aria-label="Thư viện Section"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-[1240px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
        data-lp-section-library-shell
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold tracking-wide text-zinc-900 sm:text-lg">
              THƯ VIỆN SECTION
            </h2>
            <p className="text-[11px] text-zinc-500">
              {LP_SECTION_LIBRARY_TEMPLATES.length} mẫu thiết kế · {filtered.length} đang lọc · preview
              thật (lazy)
            </p>
          </div>
          <div className="relative hidden min-w-[220px] flex-1 max-w-sm sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm section, style, layout…"
              data-lp-section-library-search
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm text-zinc-800 outline-none ring-orange-400/40 placeholder:text-zinc-400 focus:border-orange-300 focus:ring-2"
            />
          </div>
          <button
            type="button"
            data-lp-section-library-blank
            className="hidden shrink-0 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 sm:inline-flex"
            onClick={() => {
              onInsertBlank();
              onClose();
            }}
          >
            + Thêm phần trống
          </button>
          <button
            type="button"
            data-lp-section-library-close
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            title="Đóng"
            aria-label="Đóng"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="border-b border-zinc-100 px-4 py-2 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm section…"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-400/40"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside
            className="hidden w-48 shrink-0 overflow-y-auto border-r border-zinc-100 bg-zinc-50/80 p-2 md:block"
            data-lp-section-library-cats
          >
            <CatBtn
              active={category === 'all'}
              onClick={() => setCategory('all')}
              label="Tất cả"
              count={LP_SECTION_LIBRARY_TEMPLATES.length}
            />
            {LP_SECTION_LIBRARY_CATEGORIES.map((c) => (
              <CatBtn
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
                label={c.label}
                count={c.count}
              />
            ))}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-2 py-2 md:hidden">
              <Chip active={category === 'all'} onClick={() => setCategory('all')} label="Tất cả" />
              {LP_SECTION_LIBRARY_CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  label={c.label}
                />
              ))}
            </div>

            <div
              ref={(node) => {
                listRef.current = node;
                setListEl(node);
              }}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4"
              data-lp-section-library-gallery
            >
              {visible.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                  Không tìm thấy mẫu phù hợp.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      rootEl={listEl}
                      selected={previewId === tpl.id}
                      onSelect={() => setPreviewId(tpl.id)}
                      onOpenPreview={() => openLightbox(tpl.id)}
                      onInsert={() => insert(tpl.id)}
                    />
                  ))}
                </div>
              )}
              <div ref={sentinelRef} className="h-8" aria-hidden />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2.5 md:hidden">
              <button
                type="button"
                className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                onClick={() => {
                  onInsertBlank();
                  onClose();
                }}
              >
                + Phần trống
              </button>
            </div>
          </div>

          {preview ? (
            <aside
              className="hidden w-[300px] shrink-0 flex-col border-l border-zinc-100 bg-zinc-50 xl:flex"
              data-lp-section-library-preview-pane
            >
              <div className="border-b border-zinc-100 px-3 py-2.5">
                <div className="text-sm font-semibold text-zinc-900">{preview.label}</div>
                <div className="mt-0.5 text-[11px] text-zinc-500">{preview.description}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Tag>{preview.blockType}</Tag>
                  {preview.designFamily ? <Tag>{preview.designFamily}</Tag> : null}
                  {preview.previewTheme ? <Tag>{preview.previewTheme}</Tag> : null}
                </div>
                <button
                  type="button"
                  data-lp-section-library-pane-preview
                  className="mt-2 text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                  onClick={() => openLightbox(preview.id)}
                >
                  Xem trước lớn
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <LandingPageSectionLibraryPreview
                  template={preview}
                  size="panel"
                  eager
                />
                <p className="mt-3 text-[10px] leading-relaxed text-zinc-400">
                  Khi <strong>Thêm section</strong>, bố cục, nội dung và màu sắc của mẫu được giữ nguyên.
                </p>
              </div>
              <div className="border-t border-zinc-100 p-3">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#F97316] px-3 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                  onClick={() => insert(preview.id)}
                >
                  Thêm section
                </button>
              </div>
            </aside>
          ) : null}
        </div>

        {lightbox ? (
          <div
            className="absolute inset-0 z-50 flex flex-col bg-white"
            data-lp-section-library-lightbox="1"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trước ${lightbox.label}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-900">{lightbox.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-zinc-500">{lightbox.description}</div>
              </div>
              <button
                type="button"
                data-lp-section-library-lightbox-insert
                className="shrink-0 rounded-lg bg-[#F97316] px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 sm:text-sm"
                onClick={() => insert(lightbox.id)}
              >
                Thêm section
              </button>
              <button
                type="button"
                data-lp-section-library-lightbox-close
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                title="Đóng preview"
                aria-label="Đóng preview"
                onClick={() => setLightboxId(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-100 p-3 sm:p-5"
              data-lp-section-library-lightbox-canvas
            >
              <div className="mx-auto max-w-[1100px] overflow-hidden rounded-xl bg-white shadow-lg">
                <LandingPageSectionLibraryPreview template={lightbox} size="full" eager />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-zinc-200">
      {children}
    </span>
  );
}

function CatBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      data-lp-section-library-cat={label}
      className={cn(
        'mb-0.5 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition',
        active
          ? 'bg-white font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200'
          : 'text-zinc-600 hover:bg-white/70 hover:text-zinc-900',
      )}
      onClick={onClick}
    >
      <span className="truncate">{label}</span>
      <span className="tabular-nums text-[10px] text-zinc-400">{count}</span>
    </button>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium',
        active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TemplateCard({
  template,
  rootEl,
  selected,
  onSelect,
  onOpenPreview,
  onInsert,
}: {
  template: LpSectionLibraryTemplate;
  rootEl: HTMLElement | null;
  selected: boolean;
  onSelect: () => void;
  onOpenPreview: () => void;
  onInsert: () => void;
}) {
  return (
    <article
      data-lp-section-library-card={template.id}
      className={cn(
        'group relative isolate overflow-hidden rounded-xl border bg-white shadow-sm transition',
        selected
          ? 'border-orange-400 ring-2 ring-orange-200'
          : 'border-zinc-200 hover:border-orange-300 hover:shadow-md',
      )}
      onMouseEnter={onSelect}
      onFocus={onSelect}
    >
      <LandingPageSectionLibraryPreview
        template={template}
        rootEl={rootEl}
        size="card"
      />
      <div className="space-y-0.5 px-2.5 py-2">
        <div className="truncate text-[12px] font-semibold text-zinc-900">{template.label}</div>
        <div className="truncate text-[10px] text-zinc-500">
          {template.blockType}
          {template.designFamily ? ` · ${template.designFamily}` : ''}
          {template.previewTheme ? ` · ${template.previewTheme}` : ''}
        </div>
      </div>
      <div
        className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-zinc-900/50 opacity-0 transition pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
        data-lp-section-library-card-actions
        onClick={(e) => {
          if (e.target === e.currentTarget) onOpenPreview();
        }}
      >
        <button
          type="button"
          data-lp-section-library-preview-btn="1"
          className="pointer-events-auto rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-800 shadow"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenPreview();
          }}
        >
          Xem trước
        </button>
        <button
          type="button"
          data-lp-section-library-insert-btn="1"
          className="pointer-events-auto rounded-lg bg-[#F97316] px-3 py-1.5 text-[11px] font-semibold text-white shadow"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onInsert();
          }}
        >
          Thêm section
        </button>
      </div>
    </article>
  );
}
