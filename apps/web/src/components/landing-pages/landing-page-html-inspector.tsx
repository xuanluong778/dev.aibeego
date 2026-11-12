'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LP_HEADING_LEVEL_PRESETS,
  LP_TEXT_COLOR_PRESETS,
  LP_TEXT_FONT_OPTIONS,
} from './landing-page-canvas-ux';
import {
  InspectorAccordion,
  InspectorFieldLabel,
  InspectorSegmented,
  InspectorSliderNumber,
} from './landing-page-inspector-ui';
import {
  htmlNodeLabel,
  type HtmlNodePatch,
  type HtmlNodeSnapshot,
} from './landing-page-html-nodes';

const FONTS = [{ label: 'Inter', value: 'Inter, system-ui, sans-serif' }, ...LP_TEXT_FONT_OPTIONS];
const SWATCHES = ['#F0EDE6', '#C9A84C', '#0A0A0A', ...LP_TEXT_COLOR_PRESETS];

function hexOr(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.slice(0, 7) : fallback;
}

function fontValue(computed: string): string {
  const hit = FONTS.find((font) => {
    const name = font.value.split(',')[0]?.replace(/"/g, '').trim() || '';
    return name && computed.toLowerCase().includes(name.toLowerCase());
  });
  return hit?.value || '';
}

function toggleDecoration(current: string, token: 'underline' | 'line-through'): string {
  const set = new Set(
    current
      .split(/\s+/)
      .filter((part) => part && part !== 'none'),
  );
  if (set.has(token)) set.delete(token);
  else set.add(token);
  return set.size ? [...set].join(' ') : 'none';
}

export function LandingPageHtmlInspector({
  node,
  onLive,
  onCommit,
}: {
  node: HtmlNodeSnapshot;
  tab?: string;
  onLive: (patch: HtmlNodePatch) => void;
  onCommit: (patch: HtmlNodePatch) => void;
}) {
  const [text, setText] = useState(node.text);
  const focusedRef = useRef(false);
  const color = hexOr(node.color, '#F0EDE6');
  const background = hexOr(node.background, '#111111');
  const borderColor = hexOr(node.borderColor, '#C9A84C');
  const headingLevel = /^h([1-6])$/.exec(node.tag)?.[1];
  const bold = Number(node.fontWeight) >= 600;
  const italic = node.fontStyle === 'italic';
  const showType = node.kind !== 'image';

  useEffect(() => {
    void import('./landing-page-title-presets').then((mod) => mod.ensureLandingPageTitleFonts());
  }, []);

  useEffect(() => {
    if (focusedRef.current) return;
    setText(node.text);
  }, [node.id, node.text]);

  return (
    <div
      className="space-y-2"
      data-lp-html-inspector="1"
      data-lp-html-node={node.id}
      data-lp-html-kind={node.kind}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="text-[11px] uppercase tracking-wide text-white/50">{htmlNodeLabel(node.kind)}</div>

      {node.kind === 'image' ? (
        <InspectorAccordion title="Ảnh" data-lp="html-image" defaultOpen>
          <InspectorFieldLabel>URL ảnh</InspectorFieldLabel>
          <input
            className="mb-2 w-full rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1.5 text-xs text-white"
            value={node.src}
            data-lp-html-image-src
            onChange={(event) => onLive({ src: event.target.value })}
            onBlur={(event) => onCommit({ src: event.target.value })}
          />
          <InspectorFieldLabel>Mô tả ảnh</InspectorFieldLabel>
          <input
            className="w-full rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1.5 text-xs text-white"
            value={node.alt}
            onChange={(event) => onLive({ alt: event.target.value })}
            onBlur={(event) => onCommit({ alt: event.target.value })}
          />
        </InspectorAccordion>
      ) : (
        <InspectorAccordion title={node.kind === 'button' ? 'Nhãn nút' : 'Nội dung chữ'} data-lp="html-text" defaultOpen>
          <InspectorFieldLabel>{node.kind === 'button' ? 'Nhãn nút' : 'Nội dung chữ'}</InspectorFieldLabel>
          <textarea
            className="min-h-[72px] w-full resize-y rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1.5 text-xs text-white"
            value={text}
            data-lp-inspector-text-content
            onFocus={() => {
              focusedRef.current = true;
            }}
            onBlur={() => {
              focusedRef.current = false;
              onCommit({ text });
            }}
            onChange={(event) => {
              const value = event.target.value;
              setText(value);
              onLive({ text: value });
            }}
          />
        </InspectorAccordion>
      )}

      {showType ? (
        <InspectorAccordion title="Thiết lập chữ" data-lp="typography" defaultOpen>
          {node.kind !== 'button' ? (
            <>
              <InspectorFieldLabel>Cấp heading</InspectorFieldLabel>
              <div className="mb-2 flex flex-wrap gap-1" data-lp-design-heading-level>
                {([1, 2, 3, 4, 5, 6] as const).map((level) => {
                  const preset = LP_HEADING_LEVEL_PRESETS[level];
                  const active = headingLevel === String(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      className={`h-8 min-w-8 rounded border px-2 text-xs font-semibold ${
                        active
                          ? 'border-emerald-400/50 bg-emerald-500/20 text-white'
                          : 'border-white/10 text-white/70 hover:bg-white/5'
                      }`}
                      onClick={() =>
                        onCommit({
                          tag: `h${level}`,
                          fontSize: preset.fontSize,
                          fontWeight: String(preset.fontWeight),
                        })
                      }
                    >
                      H{level}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={`h-8 rounded border px-2 text-[10px] ${
                    node.tag === 'p'
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-white'
                      : 'border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                  onClick={() => onCommit({ tag: 'p', fontWeight: '400' })}
                >
                  P
                </button>
              </div>
            </>
          ) : null}

          <InspectorFieldLabel>Font</InspectorFieldLabel>
          <select
            className="mb-2 w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
            data-lp-design-font-family
            value={fontValue(node.fontFamily)}
            onChange={(event) => onCommit({ fontFamily: event.target.value })}
          >
            <option value="">Mặc định</option>
            {FONTS.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>

          <InspectorSliderNumber
            label="Cỡ chữ"
            value={node.fontSize}
            min={10}
            max={96}
            onLiveChange={(fontSize) => onLive({ fontSize })}
            onChange={(fontSize) => onCommit({ fontSize })}
          />

          <InspectorFieldLabel>Định dạng</InspectorFieldLabel>
          <div className="mb-2 flex flex-wrap gap-1" data-lp-design-text-format>
            {(
              [
                ['B', bold, () => onCommit({ fontWeight: bold ? '400' : '700' })],
                ['I', italic, () => onCommit({ fontStyle: italic ? 'normal' : 'italic' })],
                ['U', node.textDecoration.includes('underline'), () => onCommit({ textDecoration: toggleDecoration(node.textDecoration, 'underline') })],
                ['S', node.textDecoration.includes('line-through'), () => onCommit({ textDecoration: toggleDecoration(node.textDecoration, 'line-through') })],
              ] as const
            ).map(([label, on, apply]) => (
              <button
                key={label}
                type="button"
                className={`h-8 min-w-8 rounded border px-2 text-xs font-semibold ${
                  on ? 'border-emerald-400/50 bg-emerald-500/20 text-white' : 'border-white/10 text-white/70 hover:bg-white/5'
                }`}
                onClick={apply}
              >
                {label === 'I' ? <em>{label}</em> : label === 'U' ? <span className="underline">{label}</span> : label === 'S' ? <span className="line-through">{label}</span> : label}
              </button>
            ))}
          </div>

          <InspectorFieldLabel>Kiểu chữ</InspectorFieldLabel>
          <InspectorSegmented
            data-lp="text-transform"
            value={(node.textTransform === 'uppercase' || node.textTransform === 'lowercase' || node.textTransform === 'capitalize' ? node.textTransform : 'none') as 'none' | 'uppercase' | 'lowercase' | 'capitalize'}
            options={[
              { value: 'none', label: 'Aa' },
              { value: 'uppercase', label: 'AA' },
              { value: 'capitalize', label: 'Aa*' },
              { value: 'lowercase', label: 'aa' },
            ]}
            onChange={(textTransform) => onCommit({ textTransform })}
          />

          <div className="pt-1">
            <InspectorFieldLabel>Căn chữ</InspectorFieldLabel>
            <InspectorSegmented
              data-lp="text-align"
              value={(node.textAlign === 'center' || node.textAlign === 'right' || node.textAlign === 'justify' ? node.textAlign : 'left') as 'left' | 'center' | 'right' | 'justify'}
              options={[
                { value: 'left', label: 'Trái' },
                { value: 'center', label: 'Giữa' },
                { value: 'right', label: 'Phải' },
                { value: 'justify', label: 'Đều' },
              ]}
              onChange={(textAlign) => onCommit({ textAlign })}
            />
          </div>

          <div className="pt-1">
            <InspectorFieldLabel>Màu chữ</InspectorFieldLabel>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                value={color}
                data-lp-design-text-color
                onChange={(event) => onCommit({ color: event.target.value })}
              />
              <input
                className="min-w-0 flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-white"
                value={color}
                spellCheck={false}
                data-lp-design-text-color-hex
                onChange={(event) => {
                  const value = event.target.value.trim();
                  if (/^#[0-9a-fA-F]{6}$/.test(value)) onCommit({ color: value });
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1" data-lp-design-color-swatches>
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  title={swatch}
                  className={`h-6 w-6 rounded border ${swatch.toLowerCase() === color.toLowerCase() ? 'border-emerald-400' : 'border-white/20'}`}
                  style={{ background: swatch }}
                  data-lp-design-color-swatch={swatch}
                  onClick={() => onCommit({ color: swatch })}
                />
              ))}
            </div>
          </div>

          <InspectorSliderNumber
            label="Letter spacing"
            value={node.letterSpacing}
            min={-2}
            max={12}
            step={0.5}
            onChange={(letterSpacing) => onCommit({ letterSpacing })}
          />
          <InspectorSliderNumber
            label="Line height"
            value={Math.round(node.lineHeight * 100)}
            min={80}
            max={220}
            unit="%"
            onChange={(value) => onCommit({ lineHeight: value / 100 })}
          />
        </InspectorAccordion>
      ) : null}

      {node.kind === 'button' ? (
        <InspectorAccordion title="Liên kết" data-lp="html-href" defaultOpen>
          <InspectorFieldLabel>Đường dẫn</InspectorFieldLabel>
          <input
            className="w-full rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1.5 text-xs text-white"
            value={node.href}
            data-lp-html-href
            onChange={(event) => onLive({ href: event.target.value })}
            onBlur={(event) => onCommit({ href: event.target.value })}
          />
        </InspectorAccordion>
      ) : null}

      <InspectorAccordion title="Nền" data-lp="html-bg" defaultOpen>
        <InspectorFieldLabel>Màu nền</InspectorFieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
            value={background}
            data-lp-html-background
            onChange={(event) => onCommit({ background: event.target.value })}
          />
          <input
            className="min-w-0 flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-white"
            value={background}
            spellCheck={false}
            onChange={(event) => {
              const value = event.target.value.trim();
              if (/^#[0-9a-fA-F]{6}$/.test(value)) onCommit({ background: value });
            }}
          />
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Viền & bo góc" data-lp="html-border" defaultOpen>
        <InspectorSliderNumber
          label="Độ dày viền"
          value={node.borderWidth}
          min={0}
          max={12}
          onChange={(borderWidth) => onCommit({ borderWidth })}
        />
        <InspectorFieldLabel>Màu viền</InspectorFieldLabel>
        <input
          type="color"
          className="mb-2 h-8 w-full rounded border border-white/10 bg-transparent"
          value={borderColor}
          onChange={(event) => onCommit({ borderColor: event.target.value })}
        />
        <InspectorSliderNumber
          label="Bo góc"
          value={node.radius}
          min={0}
          max={48}
          onLiveChange={(radius) => onLive({ radius })}
          onChange={(radius) => onCommit({ radius })}
        />
      </InspectorAccordion>

      <InspectorAccordion title="Padding" data-lp="html-padding" defaultOpen>
        <InspectorSliderNumber
          label="Đệm trong"
          value={node.padding}
          min={0}
          max={80}
          onLiveChange={(padding) => onLive({ padding })}
          onChange={(padding) => onCommit({ padding })}
        />
      </InspectorAccordion>

      <InspectorAccordion title="Hiển thị" data-lp="html-visibility" defaultOpen={false}>
        <label className="flex items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            checked={!node.hidden}
            onChange={(event) => onCommit({ hidden: !event.target.checked })}
          />
          Hiện trên trang
        </label>
      </InspectorAccordion>
    </div>
  );
}
