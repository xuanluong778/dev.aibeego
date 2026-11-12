'use client';

/**
 * GetResponse-style Button Library modal.
 * Dark left nav + 3-col dark preview cards. Insert via existing button presets.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  LP_BUTTON_LIBRARY_CATEGORIES,
  LP_BUTTON_LIBRARY_TEMPLATES,
  countButtonLibraryByCategory,
  searchButtonLibraryTemplates,
  type LpButtonLibraryCategoryId,
  type LpButtonLibraryTemplate,
} from './landing-page-button-library-catalog';
import { previewBtnStyle } from './landing-page-button-presets';
import { ensureLandingPageTitleFonts } from './landing-page-title-presets';
import { cn } from '@/lib/utils';

export type LandingPageButtonLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onInsertTemplate: (templateId: string) => void;
};

type CatFilter = LpButtonLibraryCategoryId | 'all';

export function LandingPageButtonLibraryModal({
  open,
  onClose,
  onInsertTemplate,
}: LandingPageButtonLibraryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<CatFilter>('all');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    ensureLandingPageTitleFonts();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const filtered = useMemo(
    () => searchButtonLibraryTemplates('', category),
    [category],
  );

  const themed = useMemo(
    () => filtered.filter((t) => t.category === 'themed'),
    [filtered],
  );
  const text = useMemo(
    () => filtered.filter((t) => t.category === 'text'),
    [filtered],
  );

  const insert = useCallback(
    (id: string) => {
      onInsertTemplate(id);
      onClose();
    },
    [onInsertTemplate, onClose],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-stretch justify-center bg-black/55 p-3 sm:p-5"
      data-lp-button-library-modal="1"
      role="dialog"
      aria-modal="true"
      aria-label="Thư viện Nút"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-[1100px] flex-col rounded-xl border border-zinc-700/40 bg-[#1a1d24] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:flex-row"
        data-lp-button-library-shell
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Left sidebar — matches GetResponse dark nav */}
        <aside
          className="flex w-full shrink-0 flex-col border-r border-white/5 bg-[#14171e] sm:w-[220px] sm:overflow-y-auto"
          data-lp-button-library-nav
        >
          <div className="px-4 py-2 sm:pb-3 sm:pt-5">
            <h2 className="text-sm font-bold tracking-[0.14em] text-white">NÚT</h2>
            <p className="mt-1 text-[10px] text-white/40">
              {LP_BUTTON_LIBRARY_TEMPLATES.length} mẫu · kéo thả hoặc chọn
            </p>
          </div>
          <nav className="flex min-w-0 gap-1 overflow-x-auto px-2 pb-2 sm:flex-1 sm:flex-col sm:space-y-0.5 sm:pb-4">
            <NavItem
              active={category === 'all'}
              label="Tất cả các danh mục"
              onClick={() => setCategory('all')}
            />
            {LP_BUTTON_LIBRARY_CATEGORIES.map((c) => (
              <NavItem
                key={c.id}
                active={category === c.id}
                label={c.label}
                count={countButtonLibraryByCategory(c.id)}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Gallery */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#eceef2]">
          <button
            type="button"
            data-lp-button-library-close
            className="absolute right-2 top-1 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/80 hover:text-zinc-800"
            title="Đóng"
            aria-label="Đóng"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
            data-lp-button-library-gallery
          >
            {filtered.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                Không tìm thấy mẫu phù hợp.
              </div>
            ) : (
              <div className="space-y-8">
                {(category === 'all' || category === 'themed') && themed.length > 0 ? (
                  <GallerySection title="Có chủ đề" templates={themed} onInsert={insert} />
                ) : null}
                {(category === 'all' || category === 'text') && text.length > 0 ? (
                  <GallerySection title="Văn bản" templates={text} onInsert={insert} />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NavItem({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-lp-button-library-cat={label}
      data-lp-button-library-cat-active={active ? '1' : undefined}
      className={cn(
        'relative flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-3 py-2.5 text-left text-[13px] transition sm:w-full',
        active
          ? 'bg-white/10 font-semibold text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' ? (
        <span className="ml-2 shrink-0 text-[10px] text-white/35">{count}</span>
      ) : null}
      {active ? (
        <span
          className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#eceef2]"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function GallerySection({
  title,
  templates,
  onInsert,
}: {
  title: string;
  templates: LpButtonLibraryTemplate[];
  onInsert: (id: string) => void;
}) {
  return (
    <section data-lp-button-library-section={title}>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="shrink-0 text-[13px] font-semibold tracking-wide text-zinc-700">{title}</h3>
        <div className="h-px flex-1 bg-zinc-300/80" aria-hidden />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            data-lp-button-library-card={tpl.id}
            className="group flex min-h-[88px] items-center justify-center rounded-md bg-[#0a0a0a] px-4 py-6 transition ring-1 ring-black/20 hover:ring-2 hover:ring-orange-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            title={`Chèn «${tpl.label}»`}
            onClick={() => onInsert(tpl.id)}
          >
            <span
              className="pointer-events-none max-w-full transition group-hover:scale-[1.02]"
              style={previewBtnStyle(tpl.style)}
            >
              {tpl.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
