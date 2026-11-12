'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Compact accordion group for inspector design sections. */
export function InspectorAccordion({
  title,
  defaultOpen = true,
  children,
  className,
  headerClassName,
  bodyClassName,
  chevronPosition = 'end',
  'data-lp': dataLp,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  chevronPosition?: 'start' | 'end';
  'data-lp'?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn('overflow-hidden rounded-lg border border-white/10', className)}
      data-lp-inspector-accordion={dataLp || title}
      data-open={open ? '1' : '0'}
    >
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-white/80 hover:bg-white/5',
          headerClassName,
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {chevronPosition === 'start' ? (
          <span aria-hidden="true" className="text-base font-normal">
            {open ? '⌄' : '›'}
          </span>
        ) : null}
        <span className="flex-1">{title}</span>
        {chevronPosition === 'end' ? (
          <span className="text-[10px] opacity-50">{open ? '▾' : '▸'}</span>
        ) : null}
      </button>
      {open ? (
        <div className={cn('space-y-2 border-t border-white/5 px-2.5 py-2.5', bodyClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Segmented control (2–4 options). */
export function InspectorSegmented<T extends string>({
  value,
  options,
  onChange,
  'data-lp': dataLp,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  'data-lp'?: string;
}) {
  return (
    <div
      className="flex gap-0.5 rounded-lg border border-white/10 bg-black/20 p-0.5"
      data-lp-inspector-segmented={dataLp || '1'}
      role="tablist"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={cn(
            'flex-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition',
            value === opt.value
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-white/50 hover:bg-white/5 hover:text-white/80',
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Slider + number for px values. */
export function InspectorSliderNumber({
  label,
  value,
  min = 0,
  max = 120,
  step = 1,
  onChange,
  unit = 'px',
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <label className="block text-[11px]" data-lp-inspector-slider={label}>
      <span className="mb-1 flex items-center justify-between opacity-60">
        <span>{label}</span>
        <span className="tabular-nums text-white/70">
          {value}
          {unit}
        </span>
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="h-1.5 flex-1 accent-emerald-400"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-14 rounded border border-white/10 bg-transparent px-1.5 py-1 text-xs tabular-nums"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
        />
      </div>
    </label>
  );
}

export function InspectorFieldLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-[11px] opacity-60">{children}</div>;
}

export function InspectorEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-[11px] leading-relaxed text-white/50">
      {children}
    </p>
  );
}
