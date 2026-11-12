'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LandingPageCountdownBlock } from '@marketingspa/shared';
import { isCountdownLaunchStyle } from '@marketingspa/shared';
import {
  useCanvasElementFreeDrag,
  type LandingPageCanvasElementKey,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import {
  FreeTransformChrome,
  type FreeResizeHandle,
} from './landing-page-free-drag';
import './landing-page-countdown.css';

type Parts = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

function calcParts(endsAt: string, nowMs: number): Parts {
  const end = Date.parse(endsAt);
  if (Number.isNaN(end)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const diff = Math.max(0, end - nowMs);
  const expired = diff <= 0;
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, expired };
}

const TAP_MOVE_PX = 6;

function CountdownCellChrome({
  blockId,
  label,
  handlers,
  className,
  style,
  children,
}: {
  blockId: string;
  label: string;
  handlers: LandingPageCanvasHandlers;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const field = `countdownCell:${label}`;
  const element = `countdown:${label.toLowerCase()}` as LandingPageCanvasElementKey;
  const selected =
    handlers.selection?.blockId === blockId && handlers.selection.element === element;
  const {
    freeDrag,
    bindShellRef,
    shellStyle,
    consumePointerUpForDrag,
    showTransformChrome,
  } = useCanvasElementFreeDrag({
    blockId,
    field,
    handlers,
    selected: Boolean(selected),
  });
  const pointerRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  return (
    <div
      ref={bindShellRef}
      data-lp-element-id={`${blockId}::${element}`}
      data-lp-element-kind="box"
      data-lp-element-selected={selected ? '1' : '0'}
      data-lp-free-child="1"
      data-lp-free-id={`${blockId}::${field}`}
      data-lp-free-mode="offset"
      data-lp-bounding-box={selected ? '1' : '0'}
      style={{ ...shellStyle, ...style }}
      className={`${className || ''} cursor-pointer outline-offset-2 ${
        selected
          ? 'z-[1] outline outline-2 outline-[#F97316]/85 data-[lp-free-dragging=1]:outline-dashed data-[lp-free-dragging=1]:outline-blue-700'
          : '[@media(hover:hover)]:hover:outline [@media(hover:hover)]:hover:outline-1 [@media(hover:hover)]:hover:outline-dashed [@media(hover:hover)]:hover:outline-[#F97316]/40'
      }`}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement | null)?.closest?.('[data-lp-resize-handle],[data-lp-rotate-handle]')) {
          return;
        }
        if (e.button !== 0) return;
        // Body never arms free-drag — Move toolbar icon only.
        pointerRef.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        const p = pointerRef.current;
        if (!p) return;
        if (Math.abs(e.clientX - p.x) > TAP_MOVE_PX || Math.abs(e.clientY - p.y) > TAP_MOVE_PX) {
          p.moved = true;
        }
      }}
      onPointerUp={(e) => {
        if (consumePointerUpForDrag()) return;
        const p = pointerRef.current;
        pointerRef.current = null;
        if (!p || p.moved) return;
        e.preventDefault();
        e.stopPropagation();
        handlers.onSelect({ blockId, element }, { shiftKey: e.shiftKey });
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {showTransformChrome ? (
        <FreeTransformChrome
          visible={showTransformChrome}
          hideHandles={freeDrag.dragging}
          liveAngle={freeDrag.liveAngle}
          onResizePointerDown={(handle: FreeResizeHandle, e) => {
            handlers.onSelect({ blockId, element });
            freeDrag.beginResize(handle, e);
          }}
          onRotatePointerDown={(e) => {
            handlers.onSelect({ blockId, element });
            freeDrag.beginRotate(e);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

function wrapCell(
  blockId: string,
  canvas: LandingPageCanvasHandlers | null | undefined,
  label: string,
  className: string,
  style: React.CSSProperties | undefined,
  children: ReactNode,
) {
  if (!canvas) {
    return (
      <div className={className} style={style} data-lp-motion-key={`countdown:${label.toLowerCase()}`} data-lp-motion-field={`countdownCell:${label}`}>
        {children}
      </div>
    );
  }
  return (
    <CountdownCellChrome blockId={blockId} label={label} handlers={canvas} className={className} style={style}>
      {children}
    </CountdownCellChrome>
  );
}

/**
 * Isolated countdown ticker — interval state lives here so parent LP does not re-render.
 */
export type CountdownPreviewParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function LandingPageCountdownLive({
  block,
  primary,
  blockId,
  canvas,
  previewParts,
}: {
  block: LandingPageCountdownBlock;
  primary: string;
  blockId?: string;
  canvas?: LandingPageCanvasHandlers | null;
  previewParts?: CountdownPreviewParts;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (previewParts) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [previewParts]);

  const live = calcParts(block.endsAt, nowMs);
  const parts: Parts = previewParts
    ? { ...previewParts, expired: false }
    : live;
  const style = block.styleVariant || 'boxes';
  const cellBlockId = blockId || block.id;

  if (parts.expired) {
    const behavior = block.expireBehavior || 'zero';
    if (behavior === 'hide') return null;
    if (behavior === 'message') {
      return (
        <div className="text-center text-base font-semibold" style={{ color: 'var(--lp-secondary)' }}>
          {block.expireMessage || 'Đã kết thúc'}
        </div>
      );
    }
    if (behavior === 'cta') {
      return (
        <div className="flex justify-center">
          <a
            href={block.expireCtaUrl || '#lead-form'}
            className="inline-flex min-h-[44px] items-center px-6 py-2.5 text-sm font-bold text-white"
            style={{ background: primary, borderRadius: 'var(--lp-radius)' }}
          >
            {block.expireCtaLabel || 'Đăng ký ngay'}
          </a>
        </div>
      );
    }
    // zero — fall through with zeros
  }

  const cells: Array<{ label: string; value: number; show: boolean }> = [
    { label: 'Ngày', value: parts.days, show: block.showDays !== false },
    { label: 'Giờ', value: parts.hours, show: block.showHours !== false },
    { label: 'Phút', value: parts.minutes, show: block.showMinutes !== false },
    { label: 'Giây', value: parts.seconds, show: block.showSeconds !== false },
  ].filter((c) => c.show);

  if (style === 'inline') {
    return (
      <div
        className="flex flex-wrap items-center justify-center gap-2 text-center text-2xl font-extrabold tabular-nums sm:text-3xl"
        style={{ color: 'var(--lp-secondary)' }}
        aria-live="polite"
      >
        {cells.map((c, i) => (
          <span key={c.label} className="inline-flex items-center">
            {wrapCell(
              cellBlockId,
              canvas,
              c.label,
              'px-1',
              undefined,
              String(c.value).padStart(2, '0'),
            )}
            {i < cells.length - 1 ? <span className="mx-1 opacity-40">:</span> : null}
          </span>
        ))}
      </div>
    );
  }

  if (style === 'minimal') {
    return (
      <p className="text-center text-sm tabular-nums" style={{ color: 'var(--lp-muted)' }} aria-live="polite">
        {cells.map((c, i) => (
          <span key={c.label}>
            {wrapCell(
              cellBlockId,
              canvas,
              c.label,
              'inline-block px-0.5',
              undefined,
              <>
                {String(c.value).padStart(2, '0')} {c.label}
              </>,
            )}
            {i < cells.length - 1 ? ' · ' : null}
          </span>
        ))}
      </p>
    );
  }

  if (isCountdownLaunchStyle(style)) {
    return (
      <LaunchClock
        styleId={style}
        cells={cells}
        cellBlockId={cellBlockId}
        canvas={canvas}
      />
    );
  }

  return (
    <div
      className="mx-auto grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      aria-live="polite"
    >
      {cells.map((c) =>
        wrapCell(
          cellBlockId,
          canvas,
          c.label,
          'px-2 py-3 text-center sm:py-4',
          {
            background: 'var(--lp-surface)',
            borderRadius: 'var(--lp-radius)',
            boxShadow: 'var(--lp-shadow)',
            border: `1px solid ${primary}33`,
          },
          <>
            <div
              className="text-2xl font-extrabold tabular-nums sm:text-3xl"
              style={{ color: primary }}
            >
              {String(c.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
              {c.label}
            </div>
          </>,
        ),
      )}
    </div>
  );
}

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

const SEG_ON: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abcdg',
  '4': 'bcfg',
  '5': 'acdfg',
  '6': 'acdefg',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
};

function SevenSegDigit({ d }: { d: string }) {
  const on = SEG_ON[d] || '';
  const fill = (id: string) => (on.includes(id) ? 'var(--cd-digit, #d6f25c)' : 'rgba(214,242,92,.07)');
  const bars: Array<[string, number, number, number, number]> = [
    ['a', 8, 2, 20, 6],
    ['f', 2, 9, 6, 18],
    ['b', 28, 9, 6, 18],
    ['g', 8, 28, 20, 6],
    ['e', 2, 35, 6, 18],
    ['c', 28, 35, 6, 18],
    ['d', 8, 54, 20, 6],
  ];
  return (
    <svg className="lp-cd-seg" viewBox="0 0 36 62" aria-hidden>
      {bars.map(([id, x, y, w, h]) => (
        <rect key={id} x={x} y={y} width={w} height={h} rx="1.6" fill={fill(id)} />
      ))}
    </svg>
  );
}

function SevenSeg({ value }: { value: string }) {
  return (
    <span className="lp-cd-seg-row">
      <span className="lp-cd-sr">{value}</span>
      {value.split('').map((d, i) => (
        <SevenSegDigit key={`${d}-${i}`} d={d} />
      ))}
    </span>
  );
}

function haloOffset(value: number, max: number) {
  const c = 2 * Math.PI * 42;
  const pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  return c * (1 - pct);
}

function LaunchClock({
  styleId,
  cells,
  cellBlockId,
  canvas,
}: {
  styleId: string;
  cells: Array<{ label: string; value: number; show: boolean }>;
  cellBlockId: string;
  canvas?: LandingPageCanvasHandlers | null;
}) {
  const maxFor = (label: string) => {
    if (label === 'Ngày') return 30;
    if (label === 'Giờ') return 24;
    return 60;
  };

  const digit = (value: number) => (
    <span className="lp-cd-digit" style={{ flexShrink: 0, textTransform: 'none' }}>{pad2(value)}</span>
  );
  const labelEl = (label: string) => (
    <div className="lp-cd-unit-label" style={{ textTransform: 'none', letterSpacing: '0.01em', wordBreak: 'normal' }}>{label}</div>
  );
  const lock = (size: string): React.CSSProperties => ({
    width: size,
    height: size,
    flexShrink: 0,
    aspectRatio: '1',
    boxSizing: 'border-box',
  });

  const unit = (
    cell: { label: string; value: number },
    className: string,
    inner: ReactNode,
  ) =>
    wrapCell(cellBlockId, canvas, cell.label, className, undefined, inner);

  if (styleId === 'silver-minimal') {
    return (
      <div className="lp-cd-clock" data-clock={styleId} aria-live="polite">
        <div className="lp-cd-bar">
          {cells.map((c) =>
            unit(
              c,
              'lp-cd-bar-cell',
              <>
                {digit(c.value)}
                {labelEl(c.label)}
              </>,
            ),
          )}
        </div>
      </div>
    );
  }

  if (styleId === 'opal-ribbon') {
    return (
      <div className="lp-cd-clock" data-clock={styleId} aria-live="polite">
        <div className="lp-cd-capsule">
          {cells.map((c) =>
            unit(
              c,
              'lp-cd-cap-cell',
              <>
                {digit(c.value)}
                {labelEl(c.label)}
              </>,
            ),
          )}
        </div>
      </div>
    );
  }

  if (styleId === 'cobalt-orbit') {
    return (
      <div className="lp-cd-clock" data-clock={styleId} aria-live="polite">
        <div className="lp-cd-units">
          {cells.map((c, i) => (
            <span key={c.label} className="inline-flex items-end">
              {unit(
                c,
                'lp-cd-orbit',
                <>
                  {digit(c.value)}
                  {labelEl(c.label)}
                </>,
              )}
              {i < cells.length - 1 ? <span className="lp-cd-dot">·</span> : null}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lp-cd-clock" data-clock={styleId} aria-live="polite">
      <div className="lp-cd-units">
        {cells.map((c) => {
          if (styleId === 'amethyst-flip') {
            return unit(
              c,
              '',
              <div className="lp-cd-flip" style={{ flexShrink: 0, minWidth: '4.7rem' }}>
                <div className="lp-cd-flip-face">{digit(c.value)}</div>
                {labelEl(c.label)}
              </div>,
            );
          }
          if (styleId === 'champagne-editorial') {
            return unit(
              c,
              'lp-cd-champ',
              <>
                {digit(c.value)}
                {labelEl(c.label)}
              </>,
            );
          }
          if (styleId === 'cyan-grid') {
            return unit(
              c,
              '',
              <div className="lp-cd-oct" style={lock('5.35rem')}>
                <div className="lp-cd-oct-inner">
                  {digit(c.value)}
                  {labelEl(c.label)}
                </div>
              </div>,
            );
          }
          if (styleId === 'emerald-halo') {
            const circ = 2 * Math.PI * 42;
            return unit(
              c,
              '',
              <>
                <div className="lp-cd-halo" style={lock('5.35rem')}>
                  <svg viewBox="0 0 100 100" aria-hidden>
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(156,244,201,.18)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#9cf4c9"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={haloOffset(c.value, maxFor(c.label))}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  {digit(c.value)}
                </div>
                {labelEl(c.label)}
              </>,
            );
          }
          if (styleId === 'copper-ember') {
            return unit(
              c,
              '',
              <div className="lp-cd-ember" style={{ flexShrink: 0, minWidth: '4.55rem' }}>
                {digit(c.value)}
                {labelEl(c.label)}
              </div>,
            );
          }
          if (styleId === 'rose-glass') {
            return unit(
              c,
              '',
              <div className="lp-cd-glass" style={{ flexShrink: 0, minWidth: '4.6rem' }}>
                {digit(c.value)}
                {labelEl(c.label)}
              </div>,
            );
          }
          return unit(
            c,
            '',
            <>
              <div className="lp-cd-led" style={{ flexShrink: 0, minWidth: '4.7rem' }}>
                <SevenSeg value={pad2(c.value)} />
              </div>
              {labelEl(c.label)}
            </>,
          );
        })}
      </div>
    </div>
  );
}
