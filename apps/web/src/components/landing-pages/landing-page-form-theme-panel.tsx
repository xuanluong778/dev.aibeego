'use client';

/**
 * Simple LeadForm color / chrome inspector — Design tab.
 * Edits block.formTheme only (no CRM / field CRUD).
 */

import type { LandingPageFormTheme, LandingPageLeadFormBlock } from '@marketingspa/shared';
import { InspectorFieldLabel } from './landing-page-inspector-ui';
import { Input } from '@/components/ui/input';

type Props = {
  block: LandingPageLeadFormBlock;
  onChange: (formTheme: LandingPageFormTheme) => void;
};

function ColorRow({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  const raw = (value || '').trim();
  const hex =
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw) ? raw.slice(0, 7) : fallback;
  return (
    <label className="flex items-center gap-2">
      <span className="min-w-0 flex-1 text-[11px] text-white/70">{label}</span>
      <input
        type="color"
        className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </label>
  );
}

export function LandingPageFormThemePanel({ block, onChange }: Props) {
  const theme = block.formTheme || {};

  function patch(partial: Partial<LandingPageFormTheme>) {
    const next: LandingPageFormTheme = { ...theme, ...partial };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined && v !== ''),
    ) as LandingPageFormTheme;
    onChange(cleaned);
  }

  return (
    <div className="space-y-3" data-lp-form-theme-panel>
      <p className="text-[10px] leading-snug text-white/45">
        Đổi màu form tại đây. Trường / CRM: tab <strong className="text-white/70">Nội dung</strong>.
      </p>

      <div className="space-y-1.5 rounded-lg border border-white/10 p-2.5">
        <InspectorFieldLabel>Màu form</InspectorFieldLabel>
        <ColorRow
          label="Nền form"
          value={theme.background}
          fallback="#ffffff"
          onChange={(v) => patch({ background: v })}
        />
        <ColorRow
          label="Tiêu đề"
          value={theme.headlineColor}
          fallback="#0f172a"
          onChange={(v) => patch({ headlineColor: v })}
        />
        <ColorRow
          label="Nhãn trường"
          value={theme.labelColor}
          fallback="#334155"
          onChange={(v) => patch({ labelColor: v })}
        />
        <ColorRow
          label="Chữ phụ"
          value={theme.mutedColor}
          fallback="#64748b"
          onChange={(v) => patch({ mutedColor: v })}
        />
      </div>

      <div className="space-y-1.5 rounded-lg border border-white/10 p-2.5">
        <InspectorFieldLabel>Ô nhập</InspectorFieldLabel>
        <ColorRow
          label="Nền ô"
          value={theme.inputBg}
          fallback="#ffffff"
          onChange={(v) => patch({ inputBg: v })}
        />
        <ColorRow
          label="Chữ trong ô"
          value={theme.inputColor}
          fallback="#171717"
          onChange={(v) => patch({ inputColor: v })}
        />
        <label className="block space-y-1">
          <span className="text-[11px] text-white/70">Viền ô</span>
          <Input
            className="h-8 border-white/10 bg-zinc-900 text-xs text-white"
            value={theme.inputBorder || ''}
            placeholder="1px solid rgba(0,0,0,0.1)"
            onChange={(e) => patch({ inputBorder: e.target.value || undefined })}
          />
        </label>
      </div>

      <div className="space-y-1.5 rounded-lg border border-white/10 p-2.5">
        <InspectorFieldLabel>Nút gửi</InspectorFieldLabel>
        <ColorRow
          label="Nền nút"
          value={theme.buttonBg}
          fallback="#F97316"
          onChange={(v) => patch({ buttonBg: v })}
        />
        <ColorRow
          label="Chữ nút"
          value={theme.buttonColor}
          fallback="#ffffff"
          onChange={(v) => patch({ buttonColor: v })}
        />
      </div>

      <div className="space-y-1.5 rounded-lg border border-white/10 p-2.5">
        <InspectorFieldLabel>Bo góc</InspectorFieldLabel>
        <Input
          className="h-8 border-white/10 bg-zinc-900 text-xs text-white"
          value={theme.radius || ''}
          placeholder="16px"
          onChange={(e) => patch({ radius: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
