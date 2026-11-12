'use client';

/**
 * Floating context toolbar for section-background selection (Canva-like).
 * Portal-based so overflow:hidden on ancestors cannot clip it.
 */

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  LP_BG_PRESET_COLORS,
  loadRecentBgColors,
  pushRecentBgColor,
} from './landing-page-section-surface';
import { cn } from '@/lib/utils';

export type SectionBackgroundToolbarAction =
  | { type: 'edit' }
  | { type: 'remove-bg' }
  | { type: 'remove-bg-image' }
  | { type: 'set-color'; color: string }
  | { type: 'align'; position: string; size?: string }
  | { type: 'z-layer'; z: number }
  | { type: 'flip'; axis: 'x' | 'y' }
  | { type: 'motion'; preset: string }
  | { type: 'replace-image' }
  | { type: 'reset' }
  | { type: 'copy-style' };

/** Alias — content-image toolbar reuses the same action union. */
export type ContentImageToolbarAction = SectionBackgroundToolbarAction;

type Props = {
  blockId: string;
  anchorEl: HTMLElement | null;
  hasImage: boolean;
  hasAnyBg: boolean;
  onAction: (action: SectionBackgroundToolbarAction) => void;
  onDeselect: () => void;
  /** Return to section toolbar (explicit — never auto on empty click). */
  onBackToSection?: () => void;
  /** Delete entire section while Nền toolbar is open. */
  onDeleteSection?: () => void;
  /** section = Nền (default); image = Ảnh toolbar for content images. */
  variant?: 'section' | 'image';
};

const btn =
  'inline-flex h-7 shrink-0 items-center gap-1 rounded px-1.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-40 sm:px-2';

function Menu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" className={btn} onClick={() => setOpen((v) => !v)}>
        {label} ▾
      </button>
      {open ? (
        <div
          className="absolute left-1/2 top-full z-50 mt-1 min-w-[160px] -translate-x-1/2 rounded-md border border-zinc-200 bg-white p-1 shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function SectionBackgroundToolbar({
  blockId,
  anchorEl,
  hasImage,
  hasAnyBg,
  onAction,
  onDeselect,
  onBackToSection,
  onDeleteSection,
  variant = 'section',
}: Props) {
  const isImage = variant === 'image';
  const barRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; placement: 'above' | 'below' } | null>(
    null,
  );
  const [recent, setRecent] = useState<string[]>([]);
  const [colorOpen, setColorOpen] = useState(false);

  useEffect(() => {
    setRecent(loadRecentBgColors());
  }, []);

  useLayoutEffect(() => {
    if (!anchorEl) return;
    const update = () => {
      const r = anchorEl.getBoundingClientRect();
      const barH = barRef.current?.offsetHeight || 40;
      const gap = 8;
      const preferAbove = r.top >= barH + gap + 8;
      const placement: 'above' | 'below' = preferAbove ? 'above' : 'below';
      const top = preferAbove ? r.top - barH - gap : r.bottom + gap;
      const left = Math.min(
        Math.max(r.left + r.width / 2, 120),
        (typeof window !== 'undefined' ? window.innerWidth : 1200) - 120,
      );
      setPos({ left, top, placement });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorEl, blockId]);

  if (typeof document === 'undefined' || !pos) return null;

  const run = (action: SectionBackgroundToolbarAction) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction(action);
  };

  return createPortal(
    <div
      ref={barRef}
      data-lp-floating-toolbar
      data-lp-bg-toolbar={isImage ? undefined : '1'}
      data-lp-image-toolbar={isImage ? '1' : undefined}
      data-lp-toolbar-for={blockId}
      data-lp-toolbar-placement={pos.placement}
      data-lp-selection-target={isImage ? 'image' : 'section-background'}
      className="pointer-events-none fixed z-[9990] flex max-w-[min(96vw,560px)] -translate-x-1/2 flex-wrap items-center justify-center gap-0.5 rounded-md border border-violet-200 bg-white px-1 py-0.5 shadow-lg [&_button]:pointer-events-auto"
      style={{ left: pos.left, top: pos.top }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="px-1.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
        {isImage ? 'Ảnh' : 'Nền'}
      </span>
      <button
        type="button"
        className={btn}
        title={isImage ? 'Mở panel Ảnh' : 'Mở panel Background'}
        onClick={run({ type: 'edit' })}
      >
        Chỉnh sửa
      </button>
      <button
        type="button"
        className={btn}
        title={isImage ? 'Bỏ màu nền sau ảnh' : 'Bỏ toàn bộ nền visual'}
        disabled={!hasAnyBg}
        onClick={run({ type: 'remove-bg' })}
      >
        Xóa nền
      </button>
      <button
        type="button"
        className={btn}
        title={isImage ? 'Xóa ảnh (giữ style)' : 'Chỉ bỏ background-image'}
        disabled={!hasImage}
        onClick={run({ type: 'remove-bg-image' })}
      >
        Xóa ảnh
      </button>

      <div className="relative">
        <button type="button" className={btn} onClick={() => setColorOpen((v) => !v)}>
          Màu nền
        </button>
        {colorOpen ? (
          <div className="absolute left-1/2 top-full z-50 mt-1 w-48 -translate-x-1/2 rounded-md border border-zinc-200 bg-white p-2 shadow-lg">
            <input
              type="color"
              className="mb-2 h-8 w-full cursor-pointer rounded border border-zinc-200"
              defaultValue="#ffffff"
              onChange={(e) => {
                const c = e.target.value;
                pushRecentBgColor(c);
                setRecent(loadRecentBgColors());
                onAction({ type: 'set-color', color: c });
              }}
            />
            <div className="mb-1 text-[10px] font-medium text-zinc-500">Mẫu</div>
            <div className="mb-2 flex flex-wrap gap-1">
              {LP_BG_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-5 w-5 rounded border border-zinc-200"
                  style={{ background: c }}
                  title={c}
                  onClick={() => {
                    pushRecentBgColor(c);
                    setRecent(loadRecentBgColors());
                    onAction({ type: 'set-color', color: c });
                  }}
                />
              ))}
            </div>
            {recent.length ? (
              <>
                <div className="mb-1 text-[10px] font-medium text-zinc-500">Gần đây</div>
                <div className="flex flex-wrap gap-1">
                  {recent.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="h-5 w-5 rounded border border-zinc-200"
                      style={{ background: c }}
                      title={c}
                      onClick={() => onAction({ type: 'set-color', color: c })}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <Menu label="Căn chỉnh ảnh">
        {(
          [
            ['center', 'cover'],
            ['top', 'cover'],
            ['bottom', 'cover'],
            ['left', 'cover'],
            ['right', 'cover'],
            ['center', 'contain'],
          ] as const
        ).map(([position, size]) => (
          <button
            key={`${position}-${size}`}
            type="button"
            className={cn(btn, 'w-full justify-start')}
            disabled={!hasImage}
            onClick={run({ type: 'align', position, size })}
          >
            {position} · {size}
          </button>
        ))}
      </Menu>

      <Menu label="Lật">
        <button type="button" className={cn(btn, 'w-full justify-start')} disabled={!hasImage} onClick={run({ type: 'flip', axis: 'x' })}>
          Lật ngang
        </button>
        <button type="button" className={cn(btn, 'w-full justify-start')} disabled={!hasImage} onClick={run({ type: 'flip', axis: 'y' })}>
          Lật dọc
        </button>
      </Menu>

      <Menu label="Chuyển động">
        {['none', 'fade-in', 'ken-burns', 'pan-slow'].map((preset) => (
          <button
            key={preset}
            type="button"
            className={cn(btn, 'w-full justify-start')}
            onClick={run({ type: 'motion', preset })}
          >
            {preset}
          </button>
        ))}
      </Menu>

      <Menu label="Vị trí">
        {(
          [
            ['0% 0%', 'cover'],
            ['50% 50%', 'cover'],
            ['100% 100%', 'cover'],
            ['50% 50%', 'contain'],
            ['50% 50%', '100% 100%'],
          ] as const
        ).map(([position, size]) => (
          <button
            key={`${position}-${size}`}
            type="button"
            className={cn(btn, 'w-full justify-start')}
            disabled={!hasImage}
            onClick={run({
              type: 'align',
              position,
              size,
            })}
          >
            {position} · {size}
          </button>
        ))}
        <div className="my-1 border-t border-zinc-100" />
        {(
          [
            [0, 'Mặc định (0)'],
            [-1, 'Sau nội dung (−1)'],
            [1, 'Trước nhẹ (+1)'],
          ] as const
        ).map(([z, label]) => (
          <button
            key={z}
            type="button"
            className={cn(btn, 'w-full justify-start')}
            onClick={run({ type: 'z-layer', z })}
          >
            {label}
          </button>
        ))}
      </Menu>

      <Menu label="⋯">
        <button type="button" className={cn(btn, 'w-full justify-start')} onClick={run({ type: 'replace-image' })}>
          Replace image
        </button>
        <button type="button" className={cn(btn, 'w-full justify-start')} onClick={run({ type: 'reset' })}>
          {isImage ? 'Reset image' : 'Reset background'}
        </button>
        <button type="button" className={cn(btn, 'w-full justify-start')} onClick={run({ type: 'copy-style' })}>
          Copy style
        </button>
      </Menu>

      {!isImage && onBackToSection ? (
        <button
          type="button"
          className={btn}
          title="Quay lại toolbar section"
          data-lp-back-to-section
          onClick={(e) => {
            e.stopPropagation();
            onBackToSection();
          }}
        >
          Section
        </button>
      ) : null}
      {!isImage && onDeleteSection ? (
        <button
          type="button"
          className={`${btn} text-red-600 hover:bg-red-50`}
          title="Xóa section"
          data-lp-delete-section-from-bg
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSection();
          }}
        >
          Xóa section
        </button>
      ) : null}
      <button type="button" className={btn} title="Bỏ chọn" onClick={(e) => { e.stopPropagation(); onDeselect(); }}>
        ✕
      </button>
    </div>,
    document.body,
  );
}
