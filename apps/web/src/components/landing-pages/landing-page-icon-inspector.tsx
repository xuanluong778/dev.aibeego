'use client';

/**
 * Icon Inspector — trust-check icons (Hero) + shape-only box/graphics CTA.
 * Trust icons: style via elementCustomCss + elementIconIds (glyph).
 * Box icons: patch block.style directly (existing lpBox chrome).
 */

import { useMemo, type ReactNode } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  InspectorAccordion,
  InspectorFieldLabel,
  InspectorSegmented,
  InspectorSliderNumber,
} from './landing-page-inspector-ui';
import {
  parseBorderParts,
  parseBoxShadow,
  parsePx,
  patchCustomCssFields,
  readCustomCssFields,
  serializeBorder,
  serializeBoxShadow,
} from './landing-page-block-design-style';
import { isLandingPageBoxStyle } from './landing-page-box-presets';
import { cn } from '@/lib/utils';

export const LP_TRUST_ICON_GLYPHS: Array<{ id: string; label: string; preview: string }> = [
  { id: 'check', label: 'Tick', preview: '✓' },
  { id: 'star', label: 'Sao', preview: '★' },
  { id: 'heart', label: 'Tim', preview: '♥' },
  { id: 'bolt', label: 'Sét', preview: '⚡' },
  { id: 'plus', label: 'Cộng', preview: '+' },
  { id: 'arrow', label: 'Mũi tên', preview: '→' },
  { id: 'dot', label: 'Chấm', preview: '●' },
  { id: 'shield', label: 'Khiên', preview: '🛡' },
];

export function trustIconGlyphChar(iconId: string | undefined): string {
  const hit = LP_TRUST_ICON_GLYPHS.find((g) => g.id === iconId);
  return hit?.preview || '✓';
}

function readElementIconId(
  style: Record<string, unknown>,
  elementKey: string,
): string {
  const map = (style.elementIconIds || {}) as Record<string, unknown>;
  const raw = String(map[elementKey] || 'check');
  return LP_TRUST_ICON_GLYPHS.some((g) => g.id === raw) ? raw : 'check';
}

function patchElementIconId(
  style: Record<string, unknown>,
  elementKey: string,
  iconId: string,
): Record<string, unknown> {
  const map = { ...((style.elementIconIds || {}) as Record<string, string>) };
  if (iconId === 'check') delete map[elementKey];
  else map[elementKey] = iconId;
  const next = { ...style };
  if (Object.keys(map).length) next.elementIconIds = map;
  else delete next.elementIconIds;
  return next;
}

function cssDeclsToRecord(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chunk of css.split(';')) {
    const part = chunk.trim();
    if (!part) continue;
    const idx = part.indexOf(':');
    if (idx < 0) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 1).trim();
    if (prop && val) out[prop] = val;
  }
  return out;
}

function recordToCssDecls(rec: Record<string, string>): string {
  return Object.entries(rec)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

type Props = {
  motionPanel?: ReactNode;
  block: LandingPageBlock;
  /** Canvas element key, e.g. item:trust-icon-0 — omit for box/graphics block. */
  elementKey?: string | null;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
};

export function LandingPageIconInspector({ block, elementKey, onUpdateBlock, motionPanel }: Props) {
  const style = useMemo(
    () => ({ ...((block.style || {}) as Record<string, unknown>) }),
    [block],
  );
  const isBox = isLandingPageBoxStyle(style);
  const isTrust = Boolean(elementKey && String(elementKey).startsWith('item:trust-icon-'));

  const trustCss = isTrust && elementKey ? readCustomCssFields(style, elementKey).customCss : '';
  const trustDecls = useMemo(() => cssDeclsToRecord(trustCss), [trustCss]);

  const chromeSource = isTrust
    ? {
        width: trustDecls.width || trustDecls['min-width'] || '20px',
        height: trustDecls.height || trustDecls['min-height'] || '20px',
        color: trustDecls.color || '#ffffff',
        background: trustDecls.background || trustDecls['background-color'] || '',
        border: trustDecls.border || '',
        borderRadius: trustDecls['border-radius'] || '999px',
        padding: trustDecls.padding || '0px',
        boxShadow: trustDecls['box-shadow'] || '',
        justifyContent: trustDecls['justify-content'] || 'center',
      }
    : {
        width: String(style.width || '72px'),
        height: String(style.height || style.width || '72px'),
        color: String(style.color || '#0f172a'),
        background: String(style.background || 'transparent'),
        border: String(style.border || 'none'),
        borderRadius: String(style.borderRadius || '0'),
        padding: String(style.padding || '0'),
        boxShadow: String(style.boxShadow || ''),
        justifyContent: String(style.justifyContent || 'center'),
      };

  const size = parsePx(chromeSource.width, isBox ? 72 : 20);
  const radius = parsePx(chromeSource.borderRadius, isTrust ? 999 : 0);
  const pad = parsePx(chromeSource.padding, 0);
  const border = parseBorderParts({ border: chromeSource.border });
  const shadow = parseBoxShadow(chromeSource.boxShadow);
  const hasShadow = Boolean(shadow);
  const iconId = isTrust && elementKey ? readElementIconId(style, elementKey) : '';
  const align =
    chromeSource.justifyContent === 'flex-start'
      ? 'left'
      : chromeSource.justifyContent === 'flex-end'
        ? 'right'
        : 'center';

  function patchTrustDecls(patch: Record<string, string | undefined>) {
    if (!elementKey) return;
    const next = { ...trustDecls };
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') delete next[k];
      else next[k] = v;
    }
    // Keep flex centering for glyph
    next.display = 'inline-flex';
    next['align-items'] = 'center';
    if (!next['justify-content']) next['justify-content'] = 'center';
    next['box-sizing'] = 'border-box';
    const customCss = recordToCssDecls(next);
    const nextStyle = patchCustomCssFields(style, elementKey, { customCss });
    onUpdateBlock(block.id, { style: nextStyle } as Partial<LandingPageBlock>);
  }

  function patchBox(patch: Record<string, unknown>) {
    const next = { ...style, ...patch };
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '' || v === null) delete next[k];
    }
    onUpdateBlock(block.id, { style: next } as Partial<LandingPageBlock>);
  }

  function setSize(n: number) {
    const px = `${n}px`;
    if (isTrust) patchTrustDecls({ width: px, height: px, 'min-width': px, 'min-height': px });
    else patchBox({ width: px, height: px });
  }

  function setColor(c: string) {
    if (isTrust) patchTrustDecls({ color: c });
    else patchBox({ color: c });
  }

  function setBackground(c: string) {
    if (isTrust) patchTrustDecls({ background: c, 'background-color': c });
    else patchBox({ background: c });
  }

  function setRadius(n: number) {
    const px = `${n}px`;
    if (isTrust) patchTrustDecls({ 'border-radius': px });
    else patchBox({ borderRadius: px });
  }

  function setPadding(n: number) {
    const px = `${n}px`;
    if (isTrust) patchTrustDecls({ padding: px });
    else patchBox({ padding: px });
  }

  function setAlign(next: 'left' | 'center' | 'right') {
    const jc =
      next === 'left' ? 'flex-start' : next === 'right' ? 'flex-end' : 'center';
    if (isTrust) patchTrustDecls({ 'justify-content': jc });
    else patchBox({ justifyContent: jc, display: 'inline-flex', alignItems: 'center' });
  }

  function setBorderEnabled(on: boolean) {
    if (on) {
      const color = border.color || chromeSource.color || '#ffffff';
      const b = serializeBorder(2, 'solid', color);
      if (isTrust) patchTrustDecls({ border: b });
      else
        patchBox({
          border: b,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: color,
        });
    } else if (isTrust) {
      patchTrustDecls({ border: undefined });
    } else {
      patchBox({
        border: 'none',
        borderWidth: undefined,
        borderStyle: undefined,
        borderColor: undefined,
      });
    }
  }

  function setBorderColor(c: string) {
    const w = border.width || 2;
    const b = serializeBorder(w, 'solid', c);
    if (isTrust) patchTrustDecls({ border: b });
    else patchBox({ border: b, borderWidth: `${w}px`, borderStyle: 'solid', borderColor: c });
  }

  function setShadow(on: boolean) {
    if (on) {
      const s = serializeBoxShadow({
        x: 0,
        y: 4,
        blur: 12,
        spread: 0,
        color: '#000000',
        opacity: 0.25,
      });
      if (isTrust) patchTrustDecls({ 'box-shadow': s });
      else patchBox({ boxShadow: s });
    } else if (isTrust) {
      patchTrustDecls({ 'box-shadow': undefined });
    } else {
      patchBox({ boxShadow: undefined });
    }
  }

  return (
    <div className="space-y-2.5" data-lp-icon-inspector="1" data-lp-context="icon">
      {motionPanel}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="text-sm font-semibold tracking-wide text-white">ICON</div>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/50">
          {isTrust ? 'Trust' : isBox ? 'Đồ họa' : 'Icon'}
        </span>
      </div>

      {isTrust && elementKey ? (
        <InspectorAccordion title="Chọn icon" data-lp="icon-glyph" defaultOpen>
          <div className="grid grid-cols-4 gap-1.5" data-lp-icon-glyph-grid>
            {LP_TRUST_ICON_GLYPHS.map((g) => (
              <button
                key={g.id}
                type="button"
                title={g.label}
                className={cn(
                  'flex h-9 items-center justify-center rounded-md border text-base transition',
                  iconId === g.id
                    ? 'border-orange-400/60 bg-orange-400/15 text-white'
                    : 'border-white/10 text-white/70 hover:bg-white/5',
                )}
                onClick={() => {
                  onUpdateBlock(block.id, {
                    style: patchElementIconId(style, elementKey, g.id),
                  } as Partial<LandingPageBlock>);
                }}
              >
                {g.preview}
              </button>
            ))}
          </div>
        </InspectorAccordion>
      ) : null}

      <InspectorAccordion title="Kích thước & căn" data-lp="icon-size" defaultOpen>
        <InspectorSliderNumber
          label="Kích thước"
          value={size}
          min={12}
          max={isBox ? 320 : 64}
          onChange={setSize}
        />
        <InspectorFieldLabel>Căn chỉnh</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="icon-align"
          value={align}
          options={[
            { value: 'left', label: 'Trái' },
            { value: 'center', label: 'Giữa' },
            { value: 'right', label: 'Phải' },
          ]}
          onChange={(v) => setAlign(v)}
        />
      </InspectorAccordion>

      <InspectorAccordion title="Màu & nền" data-lp="icon-color" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Màu icon</span>
            <input
              type="color"
              className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
              value={/^#[0-9a-fA-F]{6}$/.test(chromeSource.color) ? chromeSource.color : '#ffffff'}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Nền</span>
            <input
              type="color"
              className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
              value={
                /^#[0-9a-fA-F]{6}$/.test(chromeSource.background)
                  ? chromeSource.background
                  : '#0f172a'
              }
              onChange={(e) => setBackground(e.target.value)}
            />
          </label>
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Viền & bo góc" data-lp="icon-border" defaultOpen={false}>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={border.width > 0}
            onChange={(e) => setBorderEnabled(e.target.checked)}
          />
          Bật viền
        </label>
        {border.width > 0 ? (
          <label className="text-[10px]">
            <span className="mb-0.5 block opacity-60">Màu viền</span>
            <input
              type="color"
              className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
              value={/^#[0-9a-fA-F]{6}$/.test(border.color) ? border.color : '#ffffff'}
              onChange={(e) => setBorderColor(e.target.value)}
            />
          </label>
        ) : null}
        <InspectorSliderNumber label="Bo góc" value={radius} min={0} max={999} onChange={setRadius} />
        <InspectorSliderNumber label="Padding" value={pad} min={0} max={48} onChange={setPadding} />
      </InspectorAccordion>

      <InspectorAccordion title="Đổ bóng" data-lp="icon-shadow" defaultOpen={false}>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={hasShadow} onChange={(e) => setShadow(e.target.checked)} />
          Bật đổ bóng
        </label>
      </InspectorAccordion>
    </div>
  );
}
