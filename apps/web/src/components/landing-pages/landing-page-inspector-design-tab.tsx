'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  LP_HEADING_LEVEL_PRESETS,
  LP_TEXT_COLOR_PRESETS,
  LP_TEXT_FONT_OPTIONS,
  LP_TEXT_SCALE_FONT_MAX,
  LP_TEXT_SCALE_FONT_MIN,
  isButtonLikeTextField,
  loadLpTextMyColors,
  readCanvasInlineTextColorHex,
  rememberLpTextMyColor,
  type LandingPageCanvasElementKey,
  type LandingPageInlineTextStyle,
} from './landing-page-canvas-ux';
import { resolveInspectorContext } from './landing-page-inspector-context';
import { LandingPageFormThemePanel } from './landing-page-form-theme-panel';
import { LandingPageItemBoxPanel } from './landing-page-item-box-panel';
import { LandingPageTextQuickPanel } from './landing-page-text-quick-panel';
import type { LandingPageLeadFormBlock } from '@marketingspa/shared';
import {
  composeDesignTransformCss,
  parseBorderParts,
  parseBoxShadow,
  parseCornerRadii,
  parseCssFilter,
  parsePx,
  patchCustomCssFields,
  readCustomCssFields,
  readDesignTransform,
  resolveCustomCssTargetKey,
  serializeBorder,
  serializeBoxShadow,
  serializeCssFilter,
  type ParsedBoxShadow,
  type ParsedCssFilter,
} from './landing-page-block-design-style';
import {
  InspectorAccordion,
  InspectorEmptyHint,
  InspectorFieldLabel,
  InspectorSegmented,
  InspectorSliderNumber,
} from './landing-page-inspector-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BgMode = 'color' | 'image' | 'gradient';
type SizeMode = 'auto' | 'full' | 'custom';

const FONT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'system-ui, sans-serif', label: 'System' },
  { value: '"Plus Jakarta Sans", "Segoe UI", sans-serif', label: 'Plus Jakarta' },
  { value: '"Manrope", "Segoe UI", sans-serif', label: 'Manrope' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
  { value: '"Playfair Display", Georgia, serif', label: 'Playfair' },
  { value: '"Oswald", "Arial Narrow", sans-serif', label: 'Oswald' },
  { value: 'monospace', label: 'Mono' },
];

function detectBgMode(block: LandingPageBlock): BgMode {
  const style = (block.style || {}) as Record<string, unknown>;
  const bgImg = String(style.backgroundImage || '');
  const bg = String(block.background || '');
  if (bgImg.includes('url(') || bg.includes('url(')) return 'image';
  if (bg.includes('gradient') || bgImg.includes('gradient')) return 'gradient';
  return 'color';
}

function extractColor(block: LandingPageBlock): string {
  const bg = String(block.background || '').trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(bg)) {
    return bg.length === 4
      ? `#${bg[1]}${bg[1]}${bg[2]}${bg[2]}${bg[3]}${bg[3]}`
      : bg.slice(0, 7);
  }
  return '#0A3D30';
}

function extractGradientStops(block: LandingPageBlock): [string, string] {
  const bg = String(block.background || '');
  const colors = bg.match(/#[0-9a-fA-F]{3,8}/g);
  if (colors && colors.length >= 2) {
    return [colors[0]!.slice(0, 7), colors[1]!.slice(0, 7)];
  }
  return ['#0A3D30', '#145C45'];
}

function detectSizeMode(style: Record<string, unknown>): SizeMode {
  const w = String(style.width || '');
  if (!w || w === 'auto') return 'auto';
  if (w === '100%') return 'full';
  return 'custom';
}

function toggleDecoration(
  current: string | undefined,
  token: 'underline' | 'line-through',
): string | undefined {
  const set = new Set(
    String(current || 'none')
      .split(/\s+/)
      .filter((t) => t && t !== 'none'),
  );
  if (set.has(token)) set.delete(token);
  else set.add(token);
  if (!set.size) return undefined;
  return Array.from(set).join(' ');
}

function BackgroundPanel({
  selected,
  style,
  bgMode,
  setBgModeOverride,
  onUpdateBlock,
  patchStyle,
  onPickBackgroundImage,
}: {
  selected: LandingPageBlock;
  style: Record<string, unknown>;
  bgMode: BgMode;
  setBgModeOverride: (m: BgMode) => void;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
  patchStyle: (p: Record<string, unknown>) => void;
  onPickBackgroundImage: () => void;
}) {
  const [g1, g2] = extractGradientStops(selected);
  return (
    <InspectorAccordion title="Nền" data-lp="bg" defaultOpen>
      <InspectorSegmented
        data-lp="bg-mode"
        value={bgMode}
        options={[
          { value: 'color', label: 'Màu' },
          { value: 'image', label: 'Ảnh' },
          { value: 'gradient', label: 'Gradient' },
        ]}
        onChange={(mode) => {
          setBgModeOverride(mode);
          if (mode === 'color') {
            onUpdateBlock(selected.id, {
              background: extractColor(selected),
              style: { ...style, backgroundImage: undefined },
            } as Partial<LandingPageBlock>);
          }
        }}
      />
      {bgMode === 'color' ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="color"
            data-lp-inspector-background
            className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            value={extractColor(selected)}
            onChange={(e) =>
              onUpdateBlock(selected.id, {
                background: e.target.value,
                style: { ...style, backgroundImage: undefined },
              } as Partial<LandingPageBlock>)
            }
          />
          <Input
            className="h-9 text-xs"
            value={String(selected.background || '')}
            onChange={(e) => onUpdateBlock(selected.id, { background: e.target.value || null })}
            placeholder="#0A3D30"
          />
        </div>
      ) : null}
      {bgMode === 'image' ? (
        <div className="space-y-2 pt-1">
          <Input
            data-lp-inspector-background-image
            className="h-9 text-xs"
            value={String(style.backgroundImage || '')}
            onChange={(e) => {
              const v = e.target.value;
              patchStyle({
                backgroundImage: v || undefined,
                backgroundSize: style.backgroundSize || 'cover',
                backgroundPosition: style.backgroundPosition || 'center',
                backgroundRepeat: 'no-repeat',
              });
            }}
            placeholder="url(https://…)"
          />
          <Button type="button" size="sm" variant="secondary" className="h-8 w-full text-xs" onClick={onPickBackgroundImage}>
            Chọn ảnh nền
          </Button>
        </div>
      ) : null}
      {bgMode === 'gradient' ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="color"
            className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            value={g1}
            onChange={(e) =>
              onUpdateBlock(selected.id, {
                background: `linear-gradient(135deg, ${e.target.value}, ${g2})`,
                style: { ...style, backgroundImage: undefined },
              } as Partial<LandingPageBlock>)
            }
          />
          <input
            type="color"
            className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            value={g2}
            onChange={(e) =>
              onUpdateBlock(selected.id, {
                background: `linear-gradient(135deg, ${g1}, ${e.target.value})`,
                style: { ...style, backgroundImage: undefined },
              } as Partial<LandingPageBlock>)
            }
          />
        </div>
      ) : null}
    </InspectorAccordion>
  );
}

/** Typography controls (color, align, size…) — also mounted on Content tab for text. */
export function LandingPageInspectorTypographyPanel({
  textStyle,
  textField,
  canvasBlockId,
  onPatchTextStyle,
}: {
  textStyle?: LandingPageInlineTextStyle | null;
  /** Inline field key — enables H1–H6 when not button-like. */
  textField?: string | null;
  canvasBlockId?: string | null;
  onPatchTextStyle?: (patch: Partial<LandingPageInlineTextStyle>) => void;
}) {
  const unit = textStyle?.fontSizeUnit === 'rem' ? 'rem' : 'px';
  const fontSizePx = typeof textStyle?.fontSize === 'number' ? textStyle.fontSize : 16;
  const displaySize = unit === 'rem' ? Math.round((fontSizePx / 16) * 100) / 100 : fontSizePx;
  const letter = parsePx(textStyle?.letterSpacing, 0);
  const lineHeight =
    typeof textStyle?.lineHeight === 'number'
      ? textStyle.lineHeight
      : parsePx(textStyle?.lineHeight, 1.4) || 1.4;
  const deco = String(textStyle?.textDecoration || '');
  const bold =
    textStyle?.fontWeight === 'bold' || textStyle?.fontWeight === 700 || textStyle?.fontWeight === 800;
  const italic = textStyle?.fontStyle === 'italic';
  const showHeadingLevels = Boolean(textField && !isButtonLikeTextField(textField));
  const headingLevel = textStyle?.headingLevel ?? 0;
  const [liveFontSize, setLiveFontSize] = useState<number | null>(null);
  const [myColors, setMyColors] = useState<string[]>(() =>
    typeof window !== 'undefined' ? loadLpTextMyColors() : LP_TEXT_COLOR_PRESETS.slice(0, 12),
  );
  const sizePx = liveFontSize ?? fontSizePx;
  const storedColorHex =
    textStyle?.color && /^#[0-9a-fA-F]{6}$/i.test(textStyle.color)
      ? textStyle.color.toLowerCase()
      : textStyle?.color && /^#[0-9a-fA-F]{8}$/i.test(textStyle.color)
        ? `#${textStyle.color.slice(1, 7).toLowerCase()}`
        : null;
  const [sampledColorHex, setSampledColorHex] = useState<string | null>(null);
  const colorHex = storedColorHex ?? sampledColorHex ?? '#475569';

  useEffect(() => {
    if (!canvasBlockId || !textField || storedColorHex) {
      setSampledColorHex(null);
      return;
    }
    let cancelled = false;
    const sample = () => {
      if (cancelled) return;
      setSampledColorHex(readCanvasInlineTextColorHex(canvasBlockId, textField));
    };
    sample();
    const raf = requestAnimationFrame(sample);
    const timer = window.setTimeout(sample, 100);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [canvasBlockId, textField, storedColorHex]);

  useEffect(() => {
    if (showHeadingLevels) {
      void import('./landing-page-title-presets').then((m) => m.ensureLandingPageTitleFonts());
    }
  }, [showHeadingLevels, textStyle?.fontFamily]);

  useEffect(() => {
    const onLive = (ev: Event) => {
      const detail = (ev as CustomEvent<{ fontSize?: number }>).detail;
      if (typeof detail?.fontSize === 'number' && detail.fontSize > 0) {
        setLiveFontSize(detail.fontSize);
      }
    };
    const onEnd = () => {
      requestAnimationFrame(() => setLiveFontSize(null));
    };
    window.addEventListener('lp-text-box-live-type', onLive);
    window.addEventListener('lp-heading-box-resize-end', onEnd);
    return () => {
      window.removeEventListener('lp-text-box-live-type', onLive);
      window.removeEventListener('lp-heading-box-resize-end', onEnd);
    };
  }, [textField]);

  const patchColor = (hex: string) => {
    onPatchTextStyle?.({
      color: hex,
      backgroundImage: undefined,
      backgroundClip: undefined,
      webkitTextFillColor: undefined,
    });
    rememberLpTextMyColor(hex);
    setMyColors(loadLpTextMyColors());
  };

  const bumpSize = (delta: number) => {
    const next = Math.min(
      LP_TEXT_SCALE_FONT_MAX,
      Math.max(LP_TEXT_SCALE_FONT_MIN, Math.round(sizePx + delta)),
    );
    onPatchTextStyle?.({ fontSize: next, fontSizeUnit: 'px' });
  };

  return (
    <InspectorAccordion title="Thiết lập chữ" data-lp="typography" defaultOpen>
      {showHeadingLevels ? (
        <>
          <InspectorFieldLabel>Cấp heading</InspectorFieldLabel>
          <div className="flex flex-wrap gap-1" data-lp-design-heading-level>
            {([1, 2, 3, 4, 5, 6] as const).map((level) => {
              const preset = LP_HEADING_LEVEL_PRESETS[level];
              const active = headingLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  className={`h-8 min-w-8 rounded border px-2 text-xs font-semibold ${
                    active
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-white'
                      : 'border-white/10 text-white/70 hover:bg-white/5'
                  }`}
                  title={`H${level}`}
                  onClick={() =>
                    onPatchTextStyle?.({
                      headingLevel: level,
                      fontSize: preset.fontSize,
                      fontWeight: preset.fontWeight,
                    })
                  }
                >
                  H{level}
                </button>
              );
            })}
            {headingLevel ? (
              <button
                type="button"
                className="h-8 rounded border border-white/10 px-2 text-[10px] text-white/60 hover:bg-white/5"
                onClick={() => onPatchTextStyle?.({ headingLevel: undefined })}
              >
                P
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <InspectorFieldLabel>Font family</InspectorFieldLabel>
      <select
        className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
        value={
          textStyle?.fontFamily &&
          LP_TEXT_FONT_OPTIONS.some((f) => f.value === textStyle.fontFamily)
            ? textStyle.fontFamily
            : textStyle?.fontFamily || ''
        }
        onChange={(e) =>
          onPatchTextStyle?.({ fontFamily: e.target.value || undefined })
        }
        data-lp-design-font-family
      >
        <option value="">Mặc định</option>
        {LP_TEXT_FONT_OPTIONS.map((o) => (
          <option key={o.label} value={o.value}>
            {o.label}
          </option>
        ))}
        {textStyle?.fontFamily &&
        !LP_TEXT_FONT_OPTIONS.some((f) => f.value === textStyle.fontFamily) ? (
          <option value={textStyle.fontFamily}>Custom</option>
        ) : null}
      </select>

      <div className="flex flex-wrap items-end gap-1.5">
        <button
          type="button"
          className="h-8 min-w-8 rounded border border-white/10 text-xs hover:bg-white/5"
          title="Giảm cỡ chữ"
          data-lp-design-font-minus
          onClick={() => bumpSize(-1)}
        >
          A−
        </button>
        <button
          type="button"
          className="h-8 min-w-8 rounded border border-white/10 text-xs hover:bg-white/5"
          title="Tăng cỡ chữ"
          data-lp-design-font-plus
          onClick={() => bumpSize(1)}
        >
          A+
        </button>
        <label className="flex flex-1 min-w-[4rem] flex-col text-[11px]">
          <span className="mb-1 opacity-60">Cỡ ({unit})</span>
          <input
            type="number"
            className="rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white"
            data-lp-design-font-size-input
            min={LP_TEXT_SCALE_FONT_MIN}
            max={LP_TEXT_SCALE_FONT_MAX}
            value={unit === 'rem' ? displaySize : sizePx}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              if (unit === 'rem') {
                onPatchTextStyle?.({ fontSize: Math.round(n * 16), fontSizeUnit: 'rem' });
              } else {
                onPatchTextStyle?.({
                  fontSize: Math.min(LP_TEXT_SCALE_FONT_MAX, Math.max(LP_TEXT_SCALE_FONT_MIN, n)),
                  fontSizeUnit: 'px',
                });
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </label>
      </div>

      <div className="grid grid-cols-[1fr_72px] gap-2">
        <InspectorSliderNumber
          label="Cỡ chữ (slider)"
          value={unit === 'rem' ? displaySize * 100 : sizePx}
          min={unit === 'rem' ? 50 : LP_TEXT_SCALE_FONT_MIN}
          max={unit === 'rem' ? 450 : LP_TEXT_SCALE_FONT_MAX}
          step={unit === 'rem' ? 5 : 1}
          unit={unit === 'rem' ? '%' : 'px'}
          onChange={(n) => {
            if (unit === 'rem') {
              onPatchTextStyle?.({ fontSize: Math.round((n / 100) * 16), fontSizeUnit: 'rem' });
            } else {
              onPatchTextStyle?.({
                fontSize: Math.min(LP_TEXT_SCALE_FONT_MAX, Math.max(LP_TEXT_SCALE_FONT_MIN, n)),
                fontSizeUnit: 'px',
              });
            }
          }}
        />
        <label className="pt-5 text-[11px]">
          <span className="mb-1 block opacity-60">Đơn vị</span>
          <select
            className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-1 py-1.5 text-xs text-white"
            value={unit}
            onChange={(e) =>
              onPatchTextStyle?.({
                fontSizeUnit: e.target.value === 'rem' ? 'rem' : 'px',
                fontSize: fontSizePx,
              })
            }
            data-lp-design-font-unit
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
          </select>
        </label>
      </div>

      <InspectorFieldLabel>Định dạng</InspectorFieldLabel>
      <div className="flex flex-wrap gap-1" data-lp-design-text-format>
        {(
          [
            ['B', bold, () => onPatchTextStyle?.({ fontWeight: bold ? 'normal' : 'bold' })],
            ['I', italic, () => onPatchTextStyle?.({ fontStyle: italic ? 'normal' : 'italic' })],
            [
              'U',
              deco.includes('underline'),
              () => onPatchTextStyle?.({ textDecoration: toggleDecoration(deco, 'underline') }),
            ],
            [
              'S',
              deco.includes('line-through'),
              () => onPatchTextStyle?.({ textDecoration: toggleDecoration(deco, 'line-through') }),
            ],
          ] as const
        ).map(([label, on, fn]) => (
          <button
            key={label}
            type="button"
            className={`h-8 min-w-8 rounded border px-2 text-xs font-semibold ${
              on ? 'border-emerald-400/50 bg-emerald-500/20 text-white' : 'border-white/10 text-white/70 hover:bg-white/5'
            }`}
            onClick={fn}
          >
            {label === 'I' ? <em>{label}</em> : label === 'U' ? <span className="underline">{label}</span> : label === 'S' ? <span className="line-through">{label}</span> : label}
          </button>
        ))}
      </div>

      <InspectorFieldLabel>Kiểu chữ</InspectorFieldLabel>
      <InspectorSegmented
        data-lp="text-transform"
        value={(textStyle?.textTransform || 'none') as 'none' | 'uppercase' | 'capitalize' | 'lowercase'}
        options={[
          { value: 'none', label: 'Aa' },
          { value: 'uppercase', label: 'AA' },
          { value: 'capitalize', label: 'Aa*' },
          { value: 'lowercase', label: 'aa' },
        ]}
        onChange={(textTransform) =>
          onPatchTextStyle?.({ textTransform: textTransform === 'none' ? undefined : textTransform })
        }
      />

      <InspectorFieldLabel>Căn chữ</InspectorFieldLabel>
      <InspectorSegmented
        data-lp="text-align"
        value={(textStyle?.textAlign || 'left') as 'left' | 'center' | 'right' | 'justify'}
        options={[
          { value: 'left', label: 'Trái' },
          { value: 'center', label: 'Giữa' },
          { value: 'right', label: 'Phải' },
          { value: 'justify', label: 'Đều' },
        ]}
        onChange={(textAlign) => onPatchTextStyle?.({ textAlign })}
      />

      <InspectorFieldLabel>Màu chữ</InspectorFieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
          value={colorHex}
          onChange={(e) => patchColor(e.target.value)}
          data-lp-design-text-color
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <input
          type="text"
          className="min-w-0 flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-white"
          value={colorHex}
          spellCheck={false}
          data-lp-design-text-color-hex
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(v)) patchColor(v);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="flex flex-wrap gap-1" data-lp-design-color-swatches>
        {[...new Set([...myColors, ...LP_TEXT_COLOR_PRESETS])].slice(0, 20).map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            className={`h-6 w-6 rounded border ${
              c.toLowerCase() === colorHex.toLowerCase() ? 'border-emerald-400' : 'border-white/20'
            }`}
            style={{ background: c }}
            data-lp-design-color-swatch={c}
            onClick={() => patchColor(c)}
          />
        ))}
      </div>

      <InspectorSliderNumber
        label="Letter spacing"
        value={letter}
        min={-2}
        max={12}
        step={0.5}
        onChange={(n) =>
          onPatchTextStyle?.({ letterSpacing: n === 0 ? undefined : `${n}px` })
        }
      />
      <InspectorSliderNumber
        label="Line height"
        value={Math.round(lineHeight * 100)}
        min={80}
        max={220}
        unit="%"
        onChange={(n) => onPatchTextStyle?.({ lineHeight: n / 100 })}
      />
      <p className="text-[10px] leading-snug opacity-40">Nội dung: double-click trên canvas.</p>
    </InspectorAccordion>
  );
}

export function LandingPageInspectorTextBoxSizePanel({
  textStyle,
  onPatchTextStyle,
}: {
  textStyle?: LandingPageInlineTextStyle | null;
  onPatchTextStyle?: (patch: Partial<LandingPageInlineTextStyle>) => void;
}) {
  const width = typeof textStyle?.width === 'number' && textStyle.width > 0 ? textStyle.width : 320;
  return (
    <InspectorAccordion title="Khung chữ" data-lp="text-box-size" defaultOpen>
      <InspectorSliderNumber
        label="Chiều rộng (px)"
        value={width}
        min={80}
        max={1200}
        onChange={(n) => onPatchTextStyle?.({ width: n })}
      />
      <p className="text-[10px] opacity-40">
        Chỉ đổi inline width — không ghi đè free x/y section. Kéo handle trên canvas để resize trực tiếp.
      </p>
    </InspectorAccordion>
  );
}

function SpacingPanel({
  style,
  patchStyle,
}: {
  style: Record<string, unknown>;
  patchStyle: (p: Record<string, unknown>) => void;
}) {
  const pad = parsePx(style.padding, parsePx(style.paddingTop, 0));
  const padX = parsePx(style.paddingLeft, pad);
  const padY = parsePx(style.paddingTop, pad);
  return (
    <InspectorAccordion title="Padding" data-lp="spacing" defaultOpen={false}>
      <InspectorSliderNumber
        label="Padding dọc"
        value={padY}
        min={0}
        max={120}
        onChange={(n) =>
          patchStyle({
            paddingTop: `${n}px`,
            paddingBottom: `${n}px`,
            padding: undefined,
          })
        }
      />
      <InspectorSliderNumber
        label="Padding ngang"
        value={padX}
        min={0}
        max={120}
        onChange={(n) =>
          patchStyle({
            paddingLeft: `${n}px`,
            paddingRight: `${n}px`,
            padding: undefined,
          })
        }
      />
    </InspectorAccordion>
  );
}

function SizePanel({
  style,
  width,
  height,
  imageFit,
  showFit,
  patchStyle,
  patchImageStyle,
}: {
  style: Record<string, unknown>;
  width: number;
  height: number;
  imageFit?: string;
  showFit?: boolean;
  patchStyle: (p: Record<string, unknown>) => void;
  patchImageStyle?: (p: Record<string, unknown>) => void;
}) {
  const mode = detectSizeMode(style);
  return (
    <InspectorAccordion title="Kích thước" data-lp="size" defaultOpen>
      <InspectorFieldLabel>Chế độ</InspectorFieldLabel>
      <InspectorSegmented
        data-lp="size-mode"
        value={mode}
        options={[
          { value: 'auto', label: 'Auto' },
          { value: 'full', label: 'Full' },
          { value: 'custom', label: 'Custom' },
        ]}
        onChange={(next) => {
          if (next === 'auto') {
            patchStyle({ width: undefined, maxWidth: undefined, height: undefined, minHeight: undefined });
          } else if (next === 'full') {
            patchStyle({ width: '100%', maxWidth: '100%' });
          } else {
            patchStyle({
              width: width > 0 ? `${width}px` : '320px',
              height: height > 0 ? `${height}px` : undefined,
            });
          }
        }}
      />
      {showFit ? (
        <>
          <InspectorFieldLabel>Fit ảnh</InspectorFieldLabel>
          <InspectorSegmented
            data-lp="fit"
            value={imageFit === 'contain' ? 'contain' : 'cover'}
            options={[
              { value: 'cover', label: 'Cover' },
              { value: 'contain', label: 'Contain' },
            ]}
            onChange={(fit) => {
              patchImageStyle?.({ fit });
              patchStyle({ objectFit: fit });
            }}
          />
        </>
      ) : null}
      {mode === 'custom' ? (
        <>
          <InspectorSliderNumber
            label="Width"
            value={width || 320}
            min={40}
            max={1200}
            onChange={(n) => patchStyle({ width: `${n}px` })}
          />
          <InspectorSliderNumber
            label="Height"
            value={height || 0}
            min={0}
            max={1200}
            onChange={(n) =>
              patchStyle({
                height: n > 0 ? `${n}px` : undefined,
                minHeight: n > 0 ? `${n}px` : undefined,
              })
            }
          />
        </>
      ) : (
        <p className="text-[10px] opacity-40">
          {mode === 'full' ? 'Rộng 100% container.' : 'Kích thước theo nội dung / canvas.'}
        </p>
      )}
    </InspectorAccordion>
  );
}

function BorderRadiusPanel({
  style,
  patchStyle,
  syncImageRadius,
}: {
  style: Record<string, unknown>;
  patchStyle: (p: Record<string, unknown>) => void;
  syncImageRadius?: (radius: string) => void;
}) {
  const border = parseBorderParts(style);
  const corners = parseCornerRadii(style);

  function applyCorners(next: typeof corners) {
    if (next.linked) {
      const v = `${next.tl}px`;
      patchStyle({
        borderRadius: v,
        borderTopLeftRadius: undefined,
        borderTopRightRadius: undefined,
        borderBottomRightRadius: undefined,
        borderBottomLeftRadius: undefined,
        lpRadiusLinked: true,
      });
      syncImageRadius?.(v);
    } else {
      patchStyle({
        borderRadius: undefined,
        borderTopLeftRadius: `${next.tl}px`,
        borderTopRightRadius: `${next.tr}px`,
        borderBottomRightRadius: `${next.br}px`,
        borderBottomLeftRadius: `${next.bl}px`,
        lpRadiusLinked: false,
      });
    }
  }

  return (
    <InspectorAccordion title="Viền & bo góc" data-lp="border-radius" defaultOpen>
      <InspectorSliderNumber
        label="Border width"
        value={border.width}
        min={0}
        max={16}
        onChange={(n) => {
          const borderCss = serializeBorder(n, border.style, border.color);
          patchStyle({
            border: borderCss,
            borderWidth: n > 0 ? `${n}px` : undefined,
            borderStyle: n > 0 ? border.style : undefined,
            borderColor: n > 0 ? border.color : undefined,
          });
        }}
      />
      <InspectorFieldLabel>Kiểu viền</InspectorFieldLabel>
      <select
        className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
        value={border.style}
        onChange={(e) => {
          const borderStyle = e.target.value;
          const borderCss = serializeBorder(border.width || 1, borderStyle, border.color);
          patchStyle({
            border: border.width > 0 ? borderCss : serializeBorder(1, borderStyle, border.color),
            borderWidth: `${border.width || 1}px`,
            borderStyle,
            borderColor: border.color,
          });
        }}
        data-lp-design-border-style
      >
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
        <option value="double">Double</option>
      </select>
      <div className="flex items-center gap-2">
        <InspectorFieldLabel>Border color</InspectorFieldLabel>
        <input
          type="color"
          className="ml-auto h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
          value={border.color}
          onChange={(e) => {
            const color = e.target.value;
            const w = border.width || 1;
            patchStyle({
              border: serializeBorder(w, border.style, color),
              borderWidth: `${w}px`,
              borderStyle: border.style,
              borderColor: color,
            });
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <InspectorFieldLabel>Bo góc</InspectorFieldLabel>
        <button
          type="button"
          className="rounded border border-white/15 px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/5"
          data-lp-radius-link={corners.linked ? '1' : '0'}
          onClick={() =>
            applyCorners({
              ...corners,
              linked: !corners.linked,
              tr: corners.linked ? corners.tl : corners.tr,
              br: corners.linked ? corners.tl : corners.br,
              bl: corners.linked ? corners.tl : corners.bl,
            })
          }
        >
          {corners.linked ? 'Liên kết 4 góc' : 'Tách 4 góc'}
        </button>
      </div>
      {corners.linked ? (
        <InspectorSliderNumber
          label="Radius"
          value={corners.tl}
          min={0}
          max={64}
          onChange={(n) => applyCorners({ tl: n, tr: n, br: n, bl: n, linked: true })}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['tl', 'TL'],
              ['tr', 'TR'],
              ['bl', 'BL'],
              ['br', 'BR'],
            ] as const
          ).map(([key, label]) => (
            <InspectorSliderNumber
              key={key}
              label={label}
              value={corners[key]}
              min={0}
              max={64}
              onChange={(n) => applyCorners({ ...corners, [key]: n, linked: false })}
            />
          ))}
        </div>
      )}
    </InspectorAccordion>
  );
}

function ShadowPanel({
  style,
  patchStyle,
}: {
  style: Record<string, unknown>;
  patchStyle: (p: Record<string, unknown>) => void;
}) {
  const parsed = parseBoxShadow(style.boxShadow);
  const enabled = Boolean(parsed);
  const shadow: ParsedBoxShadow = parsed || {
    x: 0,
    y: 8,
    blur: 24,
    spread: 0,
    color: '#000000',
    opacity: 0.25,
  };

  function setShadow(next: ParsedBoxShadow) {
    patchStyle({ boxShadow: serializeBoxShadow(next) });
  }

  return (
    <InspectorAccordion title="Đổ bóng" data-lp="shadow" defaultOpen>
      <label className="flex items-center justify-between gap-2 text-[11px]">
        <span className="opacity-60">Bật đổ bóng</span>
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-400"
          checked={enabled}
          data-lp-design-shadow-toggle
          onChange={(e) =>
            patchStyle({
              boxShadow: e.target.checked ? serializeBoxShadow(shadow) : 'none',
            })
          }
        />
      </label>
      {enabled ? (
        <div className="space-y-2" data-lp-design-shadow-controls>
          <InspectorSliderNumber label="X" value={shadow.x} min={-40} max={40} onChange={(n) => setShadow({ ...shadow, x: n })} />
          <InspectorSliderNumber label="Y" value={shadow.y} min={-40} max={40} onChange={(n) => setShadow({ ...shadow, y: n })} />
          <InspectorSliderNumber label="Blur" value={shadow.blur} min={0} max={80} onChange={(n) => setShadow({ ...shadow, blur: n })} />
          <InspectorSliderNumber label="Spread" value={shadow.spread} min={-20} max={40} onChange={(n) => setShadow({ ...shadow, spread: n })} />
          <div className="flex items-center gap-2">
            <InspectorFieldLabel>Màu bóng</InspectorFieldLabel>
            <input
              type="color"
              className="ml-auto h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              value={shadow.color}
              onChange={(e) => setShadow({ ...shadow, color: e.target.value })}
            />
          </div>
          <InspectorSliderNumber
            label="Opacity"
            value={Math.round(shadow.opacity * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(n) => setShadow({ ...shadow, opacity: n / 100 })}
          />
        </div>
      ) : null}
    </InspectorAccordion>
  );
}

function FilterPanel({
  style,
  patchStyle,
}: {
  style: Record<string, unknown>;
  patchStyle: (p: Record<string, unknown>) => void;
}) {
  const f: ParsedCssFilter = parseCssFilter(style.filter);
  const blend = typeof style.mixBlendMode === 'string' ? style.mixBlendMode : 'normal';

  function setFilter(next: ParsedCssFilter) {
    patchStyle({ filter: serializeCssFilter(next) });
  }

  return (
    <InspectorAccordion title="Filter" data-lp="filter" defaultOpen={false}>
      <InspectorFieldLabel>Chế độ hòa trộn</InspectorFieldLabel>
      <select
        className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
        value={blend}
        onChange={(e) => patchStyle({ mixBlendMode: e.target.value === 'normal' ? undefined : e.target.value })}
        data-lp-design-blend-mode
      >
        {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion'].map(
          (m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ),
        )}
      </select>
      <InspectorSliderNumber label="Contrast" value={f.contrast} min={0} max={200} unit="%" onChange={(n) => setFilter({ ...f, contrast: n })} />
      <InspectorSliderNumber label="Brightness" value={f.brightness} min={0} max={200} unit="%" onChange={(n) => setFilter({ ...f, brightness: n })} />
      <InspectorSliderNumber label="Saturation" value={f.saturate} min={0} max={200} unit="%" onChange={(n) => setFilter({ ...f, saturate: n })} />
      <InspectorSliderNumber label="Grayscale" value={f.grayscale} min={0} max={100} unit="%" onChange={(n) => setFilter({ ...f, grayscale: n })} />
      <InspectorSliderNumber label="Blur" value={f.blur} min={0} max={24} onChange={(n) => setFilter({ ...f, blur: n })} />
      <InspectorSliderNumber label="Invert" value={f.invert} min={0} max={100} unit="%" onChange={(n) => setFilter({ ...f, invert: n })} />
      <InspectorSliderNumber label="Sepia" value={f.sepia} min={0} max={100} unit="%" onChange={(n) => setFilter({ ...f, sepia: n })} />
      <InspectorSliderNumber label="Hue Rotate" value={f.hueRotate} min={0} max={360} unit="°" onChange={(n) => setFilter({ ...f, hueRotate: n })} />
    </InspectorAccordion>
  );
}

function TransformPanel({
  selected,
  style,
  patchStyle,
  onUpdateBlock,
  resolvedFreeLayout,
  onPatchFreeLayout,
}: {
  selected: LandingPageBlock;
  style: Record<string, unknown>;
  patchStyle: (p: Record<string, unknown>) => void;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
  resolvedFreeLayout?: LandingPageBlock['freeLayout'] | null;
  onPatchFreeLayout?: (layout: NonNullable<LandingPageBlock['freeLayout']>) => void;
}) {
  const extras = readDesignTransform(style);
  const free = resolvedFreeLayout ?? selected.freeLayout;
  const isFree = selected.positionMode === 'free' && free && onPatchFreeLayout;
  const rotate = isFree ? free!.rotate ?? 0 : extras.rotate;
  const tx = isFree ? free!.x : extras.translateX;
  const ty = isFree ? free!.y : extras.translateY;
  const liveRaf = useRef<number | null>(null);
  const liveStyleRef = useRef({ ...style });

  useEffect(() => {
    liveStyleRef.current = { ...style };
  }, [style]);

  function applyLiveTransformDom(nextStyle: Record<string, unknown>) {
    const css = composeDesignTransformCss(nextStyle);
    const opacity = typeof nextStyle.opacity === 'number' ? String(nextStyle.opacity) : '';
    const apply = () => {
      liveRaf.current = null;
      const host = document.querySelector(
        `[data-lp-block-id="${CSS.escape(selected.id)}"]`,
      ) as HTMLElement | null;
      if (!host) return;
      // Prefer the visual surface that already carries design chrome.
      const surface =
        (host.querySelector('[data-lp-section-surface="1"]') as HTMLElement | null) || host;
      if (css) surface.style.transform = css;
      else surface.style.removeProperty('transform');
      if (opacity) surface.style.opacity = opacity;
    };
    if (liveRaf.current != null) return;
    liveRaf.current = requestAnimationFrame(apply);
  }

  function patchLive(patch: Record<string, unknown>) {
    const next = { ...liveStyleRef.current, ...patch };
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '' || v === null) delete next[k];
    }
    liveStyleRef.current = next;
    applyLiveTransformDom(next);
  }

  function applyFreeShellRotate(deg: number) {
    const host = document.querySelector(
      `[data-lp-block-id="${CSS.escape(selected.id)}"]`,
    ) as HTMLElement | null;
    if (!host) return;
    const n = Math.round(deg * 10) / 10;
    host.style.transform = n ? `rotate(${n}deg)` : '';
  }

  function patchFree(partial: Partial<NonNullable<LandingPageBlock['freeLayout']>>) {
    const base = free || { x: 0, y: 0 };
    onPatchFreeLayout?.({ ...base, ...partial });
  }

  return (
    <InspectorAccordion title="Transform" data-lp="transform" defaultOpen={false}>
      <InspectorSliderNumber
        label="Opacity"
        value={Math.round(extras.opacity * 100)}
        min={0}
        max={100}
        unit="%"
        onLiveChange={(n) => patchLive({ opacity: n / 100 })}
        onChange={(n) => patchStyle({ opacity: n / 100 })}
      />
      <InspectorSliderNumber
        label="Rotate"
        value={rotate}
        min={-180}
        max={180}
        unit="°"
        onLiveChange={(n) => {
          if (isFree) {
            applyFreeShellRotate(n);
            return;
          }
          patchLive({ lpRotate: n, transform: undefined });
        }}
        onChange={(n) => {
          if (isFree) {
            applyFreeShellRotate(n);
            patchFree({ rotate: n === 0 ? undefined : n });
          } else patchStyle({ lpRotate: n, transform: undefined });
        }}
      />
      <InspectorSliderNumber
        label="Translate X"
        value={tx}
        min={-400}
        max={400}
        onLiveChange={(n) => {
          if (isFree) return;
          patchLive({ lpTranslateX: n });
        }}
        onChange={(n) => {
          if (isFree) patchFree({ x: n });
          else patchStyle({ lpTranslateX: n });
        }}
      />
      <InspectorSliderNumber
        label="Translate Y"
        value={ty}
        min={-400}
        max={400}
        onLiveChange={(n) => {
          if (isFree) return;
          patchLive({ lpTranslateY: n });
        }}
        onChange={(n) => {
          if (isFree) patchFree({ y: n });
          else patchStyle({ lpTranslateY: n });
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <InspectorFieldLabel>Scale</InspectorFieldLabel>
        <label className="flex items-center gap-1.5 text-[10px] opacity-60">
          <input
            type="checkbox"
            checked={extras.linkedScale}
            onChange={(e) => patchStyle({ lpScaleLinked: e.target.checked })}
          />
          Liên kết X/Y
        </label>
      </div>
      {extras.linkedScale ? (
        <InspectorSliderNumber
          label="Scale"
          value={Math.round(extras.scale * 100)}
          min={10}
          max={300}
          unit="%"
          onLiveChange={(n) => {
            const s = n / 100;
            patchLive({ lpScale: s, lpScaleX: s, lpScaleY: s, lpScaleLinked: true });
          }}
          onChange={(n) => {
            const s = n / 100;
            patchStyle({ lpScale: s, lpScaleX: s, lpScaleY: s, lpScaleLinked: true });
          }}
        />
      ) : (
        <>
          <InspectorSliderNumber
            label="Scale X"
            value={Math.round(extras.scaleX * 100)}
            min={10}
            max={300}
            unit="%"
            onLiveChange={(n) =>
              patchLive({ lpScaleX: n / 100, lpScaleLinked: false, lpScale: undefined })
            }
            onChange={(n) =>
              patchStyle({ lpScaleX: n / 100, lpScaleLinked: false, lpScale: undefined })
            }
          />
          <InspectorSliderNumber
            label="Scale Y"
            value={Math.round(extras.scaleY * 100)}
            min={10}
            max={300}
            unit="%"
            onLiveChange={(n) =>
              patchLive({ lpScaleY: n / 100, lpScaleLinked: false, lpScale: undefined })
            }
            onChange={(n) =>
              patchStyle({ lpScaleY: n / 100, lpScaleLinked: false, lpScale: undefined })
            }
          />
        </>
      )}
      <InspectorSliderNumber
        label="Skew X"
        value={extras.skewX}
        min={-45}
        max={45}
        unit="°"
        onLiveChange={(n) => patchLive({ lpSkewX: n })}
        onChange={(n) => patchStyle({ lpSkewX: n })}
      />
      <InspectorSliderNumber
        label="Skew Y"
        value={extras.skewY}
        min={-45}
        max={45}
        unit="°"
        onLiveChange={(n) => patchLive({ lpSkewY: n })}
        onChange={(n) => patchStyle({ lpSkewY: n })}
      />
      <p className="text-[10px] opacity-40">
        Rotate / Translate đồng bộ free-layout canvas khi đang Free. Scale / Skew lưu trên style (không tạo engine mới).
        {composeDesignTransformCss(style) ? '' : ''}
      </p>
    </InspectorAccordion>
  );
}

export function CustomCssPanel({
  blockId,
  selectedElement,
  style,
  onPatchStyle,
  accordionTitle = 'CSS tùy chỉnh',
  dataLp = 'custom-css',
  /** When true, render fields only (parent already provides accordion). */
  bare = false,
}: {
  blockId: string;
  selectedElement?: LandingPageCanvasElementKey;
  style: Record<string, unknown>;
  onPatchStyle: (nextStyle: Record<string, unknown>) => void;
  accordionTitle?: string;
  dataLp?: string;
  bare?: boolean;
}) {
  const targetKey = resolveCustomCssTargetKey(selectedElement);
  const selectionKey = `${blockId}::${targetKey}`;
  const saved = readCustomCssFields(style, targetKey);
  const [draftClass, setDraftClass] = useState(saved.className);
  const [draftCss, setDraftCss] = useState(saved.customCss);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleRef = useRef(style);
  styleRef.current = style;

  // Reset local drafts ONLY when selection changes — never keep previous element's CSS.
  // Do not depend on `style` (would reset cursor on every keystroke after autosave/history).
  useEffect(() => {
    const next = readCustomCssFields(style, targetKey);
    setDraftClass(next.className);
    setDraftCss(next.customCss);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectionKey is the sync trigger
  }, [selectionKey]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const commitPatch = (patch: { className?: string; customCss?: string }) => {
    onPatchStyle(patchCustomCssFields(styleRef.current, targetKey, patch));
  };

  const scheduleCommit = (patch: { className?: string; customCss?: string }) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      commitPatch(patch);
    }, 450);
  };

  const fields = (
    <div
      key={selectionKey}
      className="min-w-0 space-y-2 overflow-hidden"
      data-lp-design-custom-css
      data-lp-inspector-custom-css
      data-lp-custom-css-selection={selectionKey}
    >
      <Label className="text-xs">Custom Class</Label>
      <Input
        className="h-8 text-xs"
        value={draftClass}
        onChange={(e) => {
          const className = e.target.value;
          setDraftClass(className);
          scheduleCommit({ className, customCss: draftCss });
        }}
        onBlur={() => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
          }
          commitPatch({ className: draftClass, customCss: draftCss });
        }}
        placeholder="my-section hero-alt"
        data-lp-design-custom-class
      />
      <Label className="text-xs">Custom CSS</Label>
      <textarea
        className="max-h-40 min-h-[88px] w-full max-w-full resize-y overflow-auto break-all rounded-md border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[11px] leading-snug text-white/90"
        value={draftCss}
        onChange={(e) => {
          const customCss = e.target.value;
          setDraftCss(customCss);
          scheduleCommit({ className: draftClass, customCss });
        }}
        onBlur={() => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
          }
          commitPatch({ className: draftClass, customCss: draftCss });
        }}
        placeholder={'border: 2px solid red;'}
        spellCheck={false}
        data-lp-design-custom-css-textarea
      />
      <p className="text-[10px] opacity-40">
        CSS gắn theo phần tử đang chọn ({targetKey}) — không dùng chung giữa Box A/B. Không eval JS.
      </p>
    </div>
  );

  if (bare) return fields;

  return (
    <InspectorAccordion title={accordionTitle} data-lp={dataLp} defaultOpen={false}>
      {fields}
    </InspectorAccordion>
  );
}

export function LandingPageInspectorDesignTab({
  motionPanel,
  selected,
  selectedElement,
  selectedField,
  textStyle,
  textField,
  themePrimary,
  onUpdateBlock,
  onPatchTextStyle,
  onThemePrimary,
  onPickBackgroundImage,
  onPickTextBoxMedia,
  hidePageTheme,
  hideElementCustomCss,
  viewport,
  resolvedFreeLayout,
  onPatchFreeLayout,
}: {
  motionPanel?: ReactNode;
  selected: LandingPageBlock | null;
  selectedElement?: LandingPageCanvasElementKey;
  /** Raw canvas selection field (e.g. itemImage:…) — used for inspector context. */
  selectedField?: string | null;
  textStyle?: LandingPageInlineTextStyle | null;
  textField?: string | null;
  themePrimary: string;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
  onPatchTextStyle?: (patch: Partial<LandingPageInlineTextStyle>) => void;
  onThemePrimary: (color: string) => void;
  onPickBackgroundImage: () => void;
  onPickTextBoxMedia?: () => void;
  /** Global theme lives on rail «Thiết kế tổng thể». */
  hidePageTheme?: boolean;
  /** Custom class/CSS lives on tab Nâng cao. */
  hideElementCustomCss?: boolean;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  resolvedFreeLayout?: LandingPageBlock['freeLayout'] | null;
  onPatchFreeLayout?: (layout: NonNullable<LandingPageBlock['freeLayout']>) => void;
}) {
  const [bgModeOverride, setBgModeOverride] = useState<BgMode | null>(null);
  const ctx = resolveInspectorContext(
    selected,
    selectedElement,
    selectedField ?? textField,
  );

  const style = useMemo(
    () => ({ ...((selected?.style || {}) as Record<string, unknown>) }),
    [selected],
  );

  if (!selected || ctx.kind === 'none') {
    return (
      <div className="space-y-3" data-lp-inspector-design data-lp-context="none">
        <InspectorEmptyHint>Chọn section hoặc phần tử trên canvas để chỉnh thiết kế.</InspectorEmptyHint>
      </div>
    );
  }

  const bgMode = bgModeOverride ?? detectBgMode(selected);
  const width = parsePx(style.width, selected.freeLayout?.width ?? 0);
  const height = parsePx(style.height ?? style.minHeight, selected.freeLayout?.height ?? 0);
  const imageFit =
    ((selected as { imageStyle?: { fit?: string } }).imageStyle?.fit as string) ||
    String(style.objectFit || 'cover');

  function patchStyle(patch: Record<string, unknown>) {
    const next = { ...style, ...patch };
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '' || v === null) delete next[k];
    }
    onUpdateBlock(selected!.id, { style: next } as Partial<LandingPageBlock>);
  }

  function patchImageStyle(patch: Record<string, unknown>) {
    const prev = {
      ...(((selected as { imageStyle?: Record<string, unknown> }).imageStyle || {}) as Record<
        string,
        unknown
      >),
    };
    onUpdateBlock(selected!.id, {
      imageStyle: { ...prev, ...patch },
    } as Partial<LandingPageBlock>);
  }

  const header = (
    <div className="flex items-center justify-between gap-2 px-0.5" data-lp-context={ctx.dataAttr}>
      <div className="truncate text-sm font-medium">{ctx.label}</div>
      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase opacity-60">
        {ctx.dataAttr}
      </span>
    </div>
  );

  const isCard = ctx.kind === 'card';
  const showTypography = ctx.kind === 'text';
  const showTextBoxSize = ctx.kind === 'text' && Boolean(textField);
  const showBackground =
    !isCard && (ctx.kind === 'section' || ctx.kind === 'video' || ctx.kind === 'countdown');
  const showSpacing =
    !isCard && (ctx.kind === 'section' || ctx.kind === 'image' || ctx.kind === 'video');
  const showBorderShadow =
    !isCard &&
    ctx.kind !== 'form' &&
    ctx.kind !== 'button' &&
    ctx.kind !== 'icon' &&
    ctx.kind !== 'text';
  const showFilterTransform =
    !isCard && ctx.kind !== 'form' && ctx.kind !== 'button' && ctx.kind !== 'icon';
  const showBlockSize =
    !isCard &&
    (ctx.kind === 'section' ||
      ctx.kind === 'image' ||
      ctx.kind === 'video' ||
      ctx.kind === 'countdown');

  if (ctx.kind === 'icon') {
    return (
      <div className="space-y-2" data-lp-inspector-design data-lp-context="icon" data-lp-icon-via-dedicated="1">
        <InspectorEmptyHint>
          Chỉnh icon bằng Inspector <strong>ICON</strong> (chọn icon, kích thước, màu, nền, viền,
          bo góc, padding, căn, đổ bóng).
        </InspectorEmptyHint>
      </div>
    );
  }

  if (ctx.kind === 'button') {
    return (
      <div className="space-y-2" data-lp-inspector-design data-lp-context="button" data-lp-old-button-ui="removed">
        <InspectorEmptyHint>
          Chỉnh nút bằng Inspector <strong>NÚT</strong> mới (CTA, thiết kế, nâng cao, hiển thị).
        </InspectorEmptyHint>
      </div>
    );
  }

  if (ctx.kind === 'form') {
    const formBlock = selected as LandingPageLeadFormBlock;
    return (
      <div className="space-y-2.5" data-lp-inspector-design data-lp-context="form" data-lp-design-tab="1">
        {header}
        <LandingPageFormThemePanel
          block={formBlock}
          onChange={(formTheme) =>
            onUpdateBlock(selected.id, { formTheme } as Partial<LandingPageBlock>)
          }
        />
        {!hidePageTheme ? (
          <InspectorAccordion title="Màu chủ đạo trang" data-lp="theme" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                value={themePrimary}
                onChange={(e) => onThemePrimary(e.target.value)}
              />
            </div>
          </InspectorAccordion>
        ) : null}
        {!hideElementCustomCss ? (
          <CustomCssPanel
            blockId={selected.id}
            selectedElement={selectedElement}
            style={style}
            onPatchStyle={(nextStyle) => {
              onUpdateBlock(selected.id, { style: nextStyle } as Partial<LandingPageBlock>);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="min-w-0 space-y-2.5 overflow-x-hidden"
      data-lp-inspector-design
      data-lp-design-tab="1"
      data-lp-context={ctx.dataAttr}
    >
      {header}
      {motionPanel}
      {isCard && typeof selectedElement === 'string' && selectedElement.startsWith('item:') ? (
        <LandingPageItemBoxPanel
          block={selected}
          itemId={selectedElement.slice('item:'.length)}
          onUpdateBlock={onUpdateBlock}
          onPickMedia={onPickTextBoxMedia}
        />
      ) : null}
      {showTypography ? (
        <LandingPageInspectorTypographyPanel
          textStyle={textStyle}
          textField={textField}
          canvasBlockId={selected.id}
          onPatchTextStyle={onPatchTextStyle}
        />
      ) : null}
      {showTextBoxSize ? (
        <LandingPageInspectorTextBoxSizePanel textStyle={textStyle} onPatchTextStyle={onPatchTextStyle} />
      ) : null}
      {ctx.kind === 'text' && textField && selected ? (
        <LandingPageTextQuickPanel
          embedded
          open
          block={selected}
          field={textField}
          textStyle={textStyle}
          onLive={() => undefined}
          onCommit={() => undefined}
          onPatchBox={(box) => onPatchTextStyle?.({ box })}
          onPickMedia={() => onPickTextBoxMedia?.()}
          onClose={() => undefined}
        />
      ) : null}
      {showBackground ? (
        <BackgroundPanel
          selected={selected}
          style={style}
          bgMode={bgMode}
          setBgModeOverride={setBgModeOverride}
          onUpdateBlock={onUpdateBlock}
          patchStyle={patchStyle}
          onPickBackgroundImage={onPickBackgroundImage}
        />
      ) : null}
      {showSpacing ? <SpacingPanel style={style} patchStyle={patchStyle} /> : null}
      {showBlockSize ? (
        <SizePanel
          style={style}
          width={width}
          height={height}
          imageFit={imageFit}
          showFit={ctx.kind === 'image'}
          patchStyle={patchStyle}
          patchImageStyle={patchImageStyle}
        />
      ) : null}
      {showBorderShadow ? (
        <BorderRadiusPanel
          style={style}
          patchStyle={patchStyle}
          syncImageRadius={
            ctx.kind === 'image' ? (radius) => patchImageStyle({ borderRadius: radius }) : undefined
          }
        />
      ) : null}
      {showBorderShadow ? <ShadowPanel style={style} patchStyle={patchStyle} /> : null}
      {showFilterTransform ? <FilterPanel style={style} patchStyle={patchStyle} /> : null}
      {showFilterTransform ? (
        <TransformPanel
          selected={selected}
          style={style}
          patchStyle={patchStyle}
          onUpdateBlock={onUpdateBlock}
          resolvedFreeLayout={resolvedFreeLayout}
          onPatchFreeLayout={onPatchFreeLayout}
        />
      ) : null}
      {viewport && viewport !== 'desktop' && selected.positionMode === 'free' ? (
        <p className="text-[10px] opacity-45">
          Transform free-layout đang chỉnh cho <strong>{viewport}</strong>.
        </p>
      ) : null}
      {!hideElementCustomCss ? (
        <CustomCssPanel
          blockId={selected.id}
          selectedElement={selectedElement}
          style={style}
          onPatchStyle={(nextStyle) => {
            onUpdateBlock(selected.id, { style: nextStyle } as Partial<LandingPageBlock>);
          }}
        />
      ) : null}
    </div>
  );
}

/** Resolve text style field key for design typography when an element is selected. */
export function inspectorTextFieldKey(
  selectedElement: LandingPageCanvasElementKey | undefined,
  selectedField?: string | null,
): string | null {
  // Prefer explicit canvas field (itemDesc vs itemTitle) when available.
  if (selectedField && typeof selectedField === 'string' && selectedField.trim()) {
    // Card/gallery image field is not a text style key.
    if (/^itemImage:/.test(selectedField)) return null;
    return selectedField;
  }
  if (!selectedElement || selectedElement === 'section' || selectedElement === 'section-background') {
    return null;
  }
  if (selectedElement === 'image') return null;
  if (selectedElement === 'headline') return 'headline';
  if (selectedElement === 'subheadline') return 'subheadline';
  if (selectedElement === 'body') return 'body';
  if (selectedElement === 'cta') return 'ctaLabel';
  // Hero trust check icons are box chrome (item:trust-icon-N) — not itemTitle text fields.
  if (selectedElement.startsWith('item:trust-icon-')) return null;
  // Bare item:id is the large card. Nested text must pass its own field.
  if (selectedElement.startsWith('item:')) return null;
  if (selectedElement.startsWith('grid:')) return null;
  if (selectedElement.startsWith('countdown:')) return null;
  return null;
}
