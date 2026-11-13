'use client';

import { useEffect, useState } from 'react';
import { contrastStopHex8, parseHexAlpha } from '@marketingspa/shared';
import { LandingPageColorPickerPopover } from './landing-page-color-picker-popover';

const ACCENT = '#2F80ED';

export const LP_GRADIENT_PRESETS = [
  { id: 'forest', label: 'Rừng', from: '#0F3D34FF', to: '#7DFFC3FF', angle: 160 },
  { id: 'ocean', label: 'Biển', from: '#0F172AFF', to: '#38BDF8FF', angle: 135 },
  { id: 'sunset', label: 'Hoàng hôn', from: '#7C2D12FF', to: '#FDBA74FF', angle: 120 },
  { id: 'violet', label: 'Tím', from: '#312E81FF', to: '#E879F9FF', angle: 135 },
  { id: 'gold', label: 'Vàng', from: '#78350FFF', to: '#FDE68AFF', angle: 90 },
] as const;

const ANGLES = [
  [0, 'Lên'],
  [90, 'Phải'],
  [180, 'Xuống'],
  [135, 'Chéo'],
] as const;

export function seedGradientStops(currentHex8: string | null | undefined, stored?: { from?: string; to?: string; angle?: number }) {
  const from = stored?.from || (currentHex8 && parseHexAlpha(currentHex8).alpha > 0 ? parseHexAlpha(currentHex8).hex8 : '#0F3D34FF');
  return {
    from,
    to: stored?.to || contrastStopHex8(from),
    angle: stored?.angle ?? 135,
  };
}

export function GradientModeSwitch({
  gradient,
  onChange,
}: {
  gradient: boolean;
  onChange: (gradient: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-md bg-slate-200/80 p-0.5" data-lp-fill-mode="1">
      {(
        [
          [false, 'Một màu'],
          [true, 'Gradient'],
        ] as const
      ).map(([on, label]) => (
        <button
          key={label}
          type="button"
          data-lp-fill-mode-value={on ? 'gradient' : 'solid'}
          className="rounded px-2 py-1 text-[11px] font-medium"
          style={gradient === on ? { background: '#fff', color: ACCENT } : { color: '#64748b' }}
          onClick={() => onChange(on)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function GradientFillEditor({
  angle,
  from,
  to,
  onChange,
  onGestureEnd,
}: {
  angle: number;
  from: string;
  to: string;
  onChange: (patch: { angle?: number; from?: string; to?: string }) => void;
  onGestureEnd?: () => void;
}) {
  const fromPaint = parseHexAlpha(from, '#0F3D34FF');
  const toPaint = parseHexAlpha(to, '#7DFFC3FF');
  const preview = `linear-gradient(${angle}deg, ${fromPaint.css}, ${toPaint.css})`;
  return (
    <div className="space-y-2" data-lp-gradient-fill="1">
      <div className="h-8 rounded-md border border-slate-200" style={{ background: preview }} data-lp-gradient-preview="1" />
      <div className="flex flex-wrap gap-1.5" data-lp-gradient-presets="1">
        {LP_GRADIENT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.label}
            aria-label={`Mẫu gradient ${preset.label}`}
            data-lp-gradient-preset={preset.id}
            className="h-6 w-6 rounded-full border border-slate-300"
            style={{ background: `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})` }}
            onClick={() => {
              onChange({ from: preset.from, to: preset.to, angle: preset.angle });
              onGestureEnd?.();
            }}
          />
        ))}
      </div>
      <GradientStop label="Màu đầu" value={fromPaint.hex8} onChange={(hex8) => onChange({ from: hex8 })} onGestureEnd={onGestureEnd} />
      <GradientStop label="Màu cuối" value={toPaint.hex8} onChange={(hex8) => onChange({ to: hex8 })} onGestureEnd={onGestureEnd} />
      <label className="block space-y-1">
        <span className="flex items-center justify-between text-xs text-slate-600">
          Góc
          <span>{angle}°</span>
        </span>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          aria-label="Góc gradient"
          data-lp-gradient-angle="1"
          className="w-full accent-sky-600"
          onChange={(e) => onChange({ angle: Number(e.target.value) })}
          onPointerUp={() => onGestureEnd?.()}
          onBlur={() => onGestureEnd?.()}
        />
      </label>
      <div className="grid grid-cols-4 gap-1">
        {ANGLES.map(([deg, label]) => (
          <button
            key={deg}
            type="button"
            data-lp-gradient-angle-preset={deg}
            className="rounded border px-1 py-1 text-[10px]"
            style={
              angle === deg
                ? { borderColor: ACCENT, color: ACCENT, background: '#eff6ff' }
                : { borderColor: '#e2e8f0', background: '#fff', color: '#475569' }
            }
            onClick={() => {
              onChange({ angle: deg });
              onGestureEnd?.();
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GradientStop({
  label,
  value,
  onChange,
  onGestureEnd,
}: {
  label: string;
  value: string;
  onChange: (hex8: string) => void;
  onGestureEnd?: () => void;
}) {
  const parsed = parseHexAlpha(value);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="w-14 shrink-0 text-[11px] text-slate-500">{label}</span>
      <LandingPageColorPickerPopover
        allowGradient={false}
        color={parsed.hex8}
        onColorChange={(hex8) => {
          onChange(hex8);
          onGestureEnd?.();
        }}
        onGestureEnd={onGestureEnd}
        side="left"
        align="start"
      />
    </div>
  );
}
