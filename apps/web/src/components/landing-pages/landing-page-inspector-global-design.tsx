'use client';

import type { LandingPageSpec } from '@marketingspa/shared';
import {
  normalizeLandingPageThemeTokens,
  suggestLandingPageQuickTheme,
  type LandingPageQuickThemeId,
  type LandingPageThemeTokenSet,
} from '@marketingspa/shared';
import { LandingPageThemeSwitcher } from './landing-page-theme-switcher';
import { InspectorAccordion, InspectorFieldLabel } from './landing-page-inspector-ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FONT_PRESETS = [
  { value: '', label: 'Theo theme preset' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: '"Plus Jakarta Sans", "Segoe UI", sans-serif', label: 'Plus Jakarta Sans' },
  { value: '"Manrope", "Segoe UI", sans-serif', label: 'Manrope' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
  { value: '"Playfair Display", Georgia, serif', label: 'Playfair Display' },
  { value: '"Oswald", "Arial Narrow", sans-serif', label: 'Oswald' },
];

type Props = {
  spec: LandingPageSpec;
  productName?: string | null;
  aiSuggested?: LandingPageQuickThemeId | null;
  onChange: (next: LandingPageSpec) => void;
};

function withCustomTokens(
  spec: LandingPageSpec,
  patch: Partial<LandingPageThemeTokenSet>,
): LandingPageSpec {
  const tokens = normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme);
  return {
    ...spec,
    themeTokens: { ...tokens, ...patch },
    meta: {
      ...spec.meta,
      themePreset: 'custom',
      themeUserLocked: true,
    },
  };
}

/** Page-level theme — reuses Quick Theme + token editors (does not touch inlineTextStyles). */
export function LandingPageInspectorGlobalDesign({
  spec,
  productName,
  aiSuggested,
  onChange,
}: Props) {
  const tokens = normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme);
  const suggested =
    aiSuggested ??
    suggestLandingPageQuickTheme({
      category: typeof spec.meta?.category === 'string' ? spec.meta.category : undefined,
      productService: productName ?? undefined,
    });

  return (
    <div className="space-y-3" data-lp-inspector-page-theme data-lp-inspector-global-design="1">
      <p className="text-[11px] leading-snug opacity-60">
        Thiết kế toàn trang qua <strong className="text-white/80">themeTokens</strong>. Inline /
        local style trên từng phần tử vẫn ưu tiên như trước.
      </p>
      <LandingPageThemeSwitcher spec={spec} aiSuggested={suggested} onChange={onChange} />

      <InspectorAccordion title="Font toàn website" data-lp="global-font" defaultOpen>
        <div className="space-y-2">
          <InspectorFieldLabel>Gia đình font (body &amp; heading)</InspectorFieldLabel>
          <select
            className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm text-white"
            value={
              FONT_PRESETS.some((p) => p.value && p.value === tokens.fontFamily)
                ? tokens.fontFamily
                : '__custom__'
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__custom__') return;
              onChange(withCustomTokens(spec, { fontFamily: v }));
            }}
          >
            {FONT_PRESETS.filter((p) => p.value).map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
            <option value="__custom__">Tuỳ chỉnh (ô bên dưới)</option>
          </select>
          <Label className="text-[10px] opacity-60">Font tùy chỉnh (CSS)</Label>
          <Input
            className="h-8 text-xs"
            value={tokens.fontFamily || ''}
            onChange={(e) => onChange(withCustomTokens(spec, { fontFamily: e.target.value }))}
            placeholder='"Inter", system-ui, sans-serif'
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px]">
              <span className="mb-0.5 block opacity-60">Weight heading</span>
              <Input
                type="number"
                className="h-8 text-xs"
                value={tokens.fontWeightHeading ?? 800}
                onChange={(e) =>
                  onChange(
                    withCustomTokens(spec, {
                      fontWeightHeading: Number(e.target.value) || 800,
                    }),
                  )
                }
              />
            </label>
            <label className="text-[10px]">
              <span className="mb-0.5 block opacity-60">Weight body</span>
              <Input
                type="number"
                className="h-8 text-xs"
                value={tokens.fontWeightBody ?? 400}
                onChange={(e) =>
                  onChange(
                    withCustomTokens(spec, {
                      fontWeightBody: Number(e.target.value) || 400,
                    }),
                  )
                }
              />
            </label>
          </div>
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Cỡ chữ heading (H1–H3)" data-lp="global-heading-scale" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-2">
          {(
            [
              ['fontSizeHero', 'Hero / H1'],
              ['fontSize2xl', 'H2'],
              ['fontSizeXl', 'H3'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-[10px]">
              <span className="mb-0.5 block opacity-60">{label}</span>
              <Input
                className="h-8 text-xs"
                value={String(tokens[key] || '')}
                onChange={(e) => onChange(withCustomTokens(spec, { [key]: e.target.value }))}
                placeholder="clamp(1.85rem, 4vw, 3.15rem)"
              />
            </label>
          ))}
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Body (md)</span>
            <Input
              className="h-8 text-xs"
              value={tokens.fontSizeMd || ''}
              onChange={(e) => onChange(withCustomTokens(spec, { fontSizeMd: e.target.value }))}
            />
          </label>
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Màu toàn trang" data-lp="global-colors" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['primary', 'Thương hiệu / primary'],
              ['text', 'Màu body text'],
              ['background', 'Nền trang'],
              ['surface', 'Surface'],
              ['button', 'Nút (global)'],
              ['muted', 'Muted'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-[10px]">
              <span className="mb-0.5 block opacity-60">{label}</span>
              <Input
                type="color"
                className="h-8 w-full cursor-pointer p-0.5"
                value={(tokens[key] as string)?.slice(0, 7) || '#000000'}
                onChange={(e) => onChange(withCustomTokens(spec, { [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Nút &amp; bo góc global" data-lp="global-button" defaultOpen={false}>
        <div className="space-y-2">
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Button style</span>
            <select
              className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm text-white"
              value={tokens.buttonStyle || 'solid'}
              onChange={(e) =>
                onChange(withCustomTokens(spec, { buttonStyle: e.target.value as 'solid' | 'outline' | 'ghost' }))
              }
            >
              <option value="solid">solid</option>
              <option value="outline">outline</option>
              <option value="ghost">ghost</option>
            </select>
          </label>
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Button radius</span>
            <Input
              className="h-8 text-xs"
              value={tokens.buttonRadius || ''}
              onChange={(e) => onChange(withCustomTokens(spec, { buttonRadius: e.target.value }))}
            />
          </label>
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Radius chung</span>
            <Input
              className="h-8 text-xs"
              value={tokens.radius || ''}
              onChange={(e) => onChange(withCustomTokens(spec, { radius: e.target.value }))}
            />
          </label>
        </div>
      </InspectorAccordion>
    </div>
  );
}
