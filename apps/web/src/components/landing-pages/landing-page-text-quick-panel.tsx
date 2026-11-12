'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ImagePlus, Lock, LockOpen, Monitor, Smartphone, TabletSmartphone, X } from 'lucide-react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  defaultTextBoxBorder,
  defaultTextBoxPadding,
  defaultTextBoxRadius,
  defaultTextBoxShadow,
  hexWithAlpha,
  parseHexAlpha,
  safeTextBoxMediaUrl,
  type LandingPageInlineAiPageMeta,
  type LandingPageTextBoxChrome,
  type LandingPageTextBoxVisibility,
} from '@marketingspa/shared';
import type { LandingPageInlineTextStyle } from './landing-page-canvas-ux';
import {
  readCanvasInlineWrapBackgroundHex,
  readCanvasItemBoxBackgroundHex,
  resolveBoxBackgroundDisplayHex,
} from './landing-page-item-box';
import { LandingPageInspectorTextContent } from './landing-page-inspector-text-content';

type BoxPatch = (next: LandingPageTextBoxChrome) => void;

function Toggle({
  on,
  label,
  onChange,
  testId,
}: {
  on: boolean;
  label: string;
  onChange: (next: boolean) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        data-lp-text-box-toggle={testId}
        className={
          'relative h-6 w-11 shrink-0 rounded-full transition ' +
          (on ? 'bg-sky-500' : 'bg-slate-300')
        }
        onClick={() => onChange(!on)}
      >
        <span
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ' +
            (on ? 'left-5' : 'left-0.5')
          }
        />
      </button>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n))));
  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm"
      data-lp-text-box-stepper={label}
    >
      <button type="button" className="h-8 w-7 text-slate-500 hover:bg-slate-50" aria-label={`Giảm ${label}`} onClick={() => set(value - 1)}>
        −
      </button>
      <input
        aria-label={label}
        className="w-9 border-0 bg-transparent text-center text-sm text-slate-800 outline-none"
        value={Number.isFinite(value) ? String(value) : '0'}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) set(n);
        }}
      />
      <button type="button" className="h-8 w-7 text-slate-500 hover:bg-slate-50" aria-label={`Tăng ${label}`} onClick={() => set(value + 1)}>
        +
      </button>
    </div>
  );
}

function SliderNumber({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n * 10) / 10)));
  return (
    <label className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-2 text-xs text-slate-600">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={`${label} kéo`}
        onChange={(e) => set(Number(e.target.value))}
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={`${label} số`}
        className="w-full rounded-md border border-slate-200 bg-white px-1 py-1 text-right text-sm text-slate-800"
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) set(n);
        }}
      />
    </label>
  );
}

function ColorRow({
  label,
  value,
  onChange,
  onClear,
  testId,
}: {
  label: string;
  value: string;
  onChange: (hex8: string) => void;
  /** X — bỏ màu nền, trả về nền mặc định của theme. */
  onClear?: () => void;
  testId: string;
}) {
  const parsed = parseHexAlpha(value || '#00000000');
  const hasFill = parsed.alpha > 0 && Boolean(value) && value !== '#00000000';
  return (
    <div className="space-y-1.5" data-lp-text-box-color={testId}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="flex items-center gap-2">
        {onClear ? (
          <button
            type="button"
            title="Không màu nền"
            aria-label="Không màu nền"
            data-lp-text-box-color-clear="1"
            className={
              'relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border ' +
              (hasFill ? 'border-slate-300 bg-white text-slate-400 hover:bg-slate-50' : 'border-sky-500 bg-sky-50 text-sky-600 ring-1 ring-sky-200')
            }
            onClick={onClear}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        <label
          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-300"
          style={{
            background: hasFill ? parsed.hex : 'linear-gradient(135deg,#fff 46%,#cbd5e1 46%,#cbd5e1 54%,#fff 54%)',
          }}
        >
          <input
            type="color"
            aria-label={`${label} chọn`}
            className="absolute inset-0 cursor-pointer opacity-0"
            value={parsed.hex}
            onChange={(e) => onChange(hexWithAlpha(e.target.value, parsed.alpha > 0 ? parsed.alpha : 1))}
          />
        </label>
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs uppercase text-slate-800"
          value={parsed.hex8}
          spellCheck={false}
          aria-label={`${label} mã`}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(next)) onChange(parseHexAlpha(next).hex8);
          }}
        />
      </div>
      <SliderNumber
        label="Độ phủ"
        value={Math.round(parsed.alpha * 100)}
        min={0}
        max={100}
        onChange={(n) => {
          if (n <= 0 && onClear) {
            onClear();
            return;
          }
          onChange(hexWithAlpha(parsed.hex, n / 100));
        }}
      />
    </div>
  );
}

function Section({
  title,
  children,
  openDefault = true,
  testId,
}: {
  title: string;
  children: ReactNode;
  openDefault?: boolean;
  testId: string;
}) {
  const [open, setOpen] = useState(openDefault);
  return (
    <section className="border-t border-slate-200" data-lp-text-box-section={testId}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-700"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>
      {open ? <div className="space-y-3 px-3 pb-3">{children}</div> : null}
    </section>
  );
}

export function LandingPageTextQuickPanel({
  open,
  block,
  field,
  textStyle,
  onLive,
  onCommit,
  onPatchBox,
  onPickMedia,
  onClose,
  embedded = false,
  pageId,
  pageMeta,
  onSaveTopicHint,
}: {
  open: boolean;
  block: LandingPageBlock;
  field: string;
  textStyle?: LandingPageInlineTextStyle | null;
  onLive: (value: string) => void;
  onCommit: (value: string) => void;
  onPatchBox: (box: LandingPageTextBoxChrome) => void;
  onPickMedia: () => void;
  onClose: () => void;
  /** Show Cài đặt khối inside the right inspector. */
  embedded?: boolean;
  pageId?: string;
  pageMeta?: LandingPageInlineAiPageMeta | null;
  onSaveTopicHint?: (hint: string) => void;
}) {
  const box: LandingPageTextBoxChrome = { ...(textStyle?.box || {}) };
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState('');

  function patch(partial: LandingPageTextBoxChrome) {
    onPatchBox({ ...box, ...partial });
  }

  const itemBoxId = field.startsWith('itemBox:') ? field.slice('itemBox:'.length) : null;
  const storedFillHex = useMemo(() => {
    if (box.backgroundOn === false) return null;
    if (!box.background) return null;
    const paint = parseHexAlpha(box.background);
    return paint.alpha > 0 ? paint.hex8 : null;
  }, [box.background, box.backgroundOn]);
  const [sampledBgHex, setSampledBgHex] = useState<string | null>(null);
  /** User chose “no custom fill” — do not re-show theme-sampled color in the picker. */
  const [backgroundCleared, setBackgroundCleared] = useState(false);

  function clearBoxBackground() {
    setBackgroundCleared(true);
    setSampledBgHex(null);
    const next = { ...box };
    delete next.background;
    next.backgroundOn = false;
    onPatchBox(next);
  }

  function commitBoxBackground(hex8: string) {
    const paint = parseHexAlpha(hex8);
    if (paint.alpha <= 0) {
      clearBoxBackground();
      return;
    }
    setBackgroundCleared(false);
    patch({ backgroundOn: true, background: paint.hex8 });
  }

  useEffect(() => {
    setBackgroundCleared(false);
    setSampledBgHex(null);
  }, [block.id, field]);

  useEffect(() => {
    if (storedFillHex) {
      setSampledBgHex(null);
      setBackgroundCleared(false);
      return;
    }
    if (backgroundCleared) {
      setSampledBgHex(null);
      return;
    }
    let cancelled = false;
    const sample = () => {
      if (cancelled || backgroundCleared) return;
      const hex = itemBoxId
        ? readCanvasItemBoxBackgroundHex(block.id, itemBoxId)
        : readCanvasInlineWrapBackgroundHex(block.id, field);
      setSampledBgHex(hex);
    };
    sample();
    const raf1 = requestAnimationFrame(() => {
      sample();
      requestAnimationFrame(sample);
    });
    const timer = window.setTimeout(sample, 120);
    const timer2 = window.setTimeout(sample, 320);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [block.id, field, itemBoxId, storedFillHex, backgroundCleared]);

  const backgroundDisplayHex =
    backgroundCleared || box.backgroundOn === false
      ? '#00000000'
      : resolveBoxBackgroundDisplayHex(block.id, field, box, sampledBgHex);

  const padding = box.padding || defaultTextBoxPadding();
  const border = box.border || defaultTextBoxBorder();
  const radius = box.radius || defaultTextBoxRadius();
  const shadow = box.shadow || defaultTextBoxShadow();
  const visibility: LandingPageTextBoxVisibility = box.visibility || 'all';

  function setPad(edge: 't' | 'r' | 'b' | 'l', n: number) {
    if (padding.linked) {
      patch({ paddingOn: box.paddingOn, padding: { t: n, r: n, b: n, l: n, linked: true } });
      return;
    }
    patch({ paddingOn: box.paddingOn, padding: { ...padding, [edge]: n, linked: false } });
  }

  function setRadius(corner: 'tl' | 'tr' | 'br' | 'bl', n: number) {
    if (radius.linked) {
      patch({ radiusOn: box.radiusOn, radius: { tl: n, tr: n, br: n, bl: n, linked: true } });
      return;
    }
    patch({ radiusOn: box.radiusOn, radius: { ...radius, [corner]: n, linked: false } });
  }

  const Shell = embedded ? 'div' : 'aside';
  return (
    <Shell
      data-lp-quick-text={embedded ? undefined : '1'}
      data-lp-quick-text-open={embedded ? undefined : open ? '1' : '0'}
      data-lp-text-box-dock={embedded ? 'inspector' : 'drawer'}
      data-lp-quick-text-field={field}
      data-lp-quick-text-block={block.id}
      aria-hidden={embedded || open ? undefined : true}
      className={
        embedded
          ? 'overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-800'
          : 'fixed z-[55] flex w-[min(100vw-1.5rem,320px)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl transition-transform duration-200 ease-out ' +
            'max-lg:bottom-3 max-lg:left-3 max-lg:top-auto max-lg:h-[min(70dvh,640px)] ' +
            'lg:top-[var(--builder-top-offset,6.75rem)] lg:h-[calc(100dvh-var(--builder-top-offset,6.75rem)-0.75rem)] lg:left-[calc(var(--app-sidebar-width,16rem)+0.75rem)] ' +
            (open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none -translate-x-[120%]')
      }
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {embedded ? null : (
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">Nội dung sửa nhanh</h2>
        <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Đóng nội dung sửa nhanh" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </header>
      )}
      <div className={embedded ? 'max-h-[70vh] overflow-y-auto' : 'min-h-0 flex-1 overflow-y-auto'}>
        {embedded ? null : (
        <div className="space-y-2 bg-white px-3 py-3">
          <LandingPageInspectorTextContent
            key={`${block.id}::${field}`}
            block={block}
            field={field}
            tone="light"
            pageId={pageId}
            pageMeta={pageMeta}
            onSaveTopicHint={onSaveTopicHint}
            onLive={onLive}
            onCommit={onCommit}
          />
        </div>
        )}

        <Section title="Cài đặt khối" testId="chrome">
          <div data-lp-text-box-settings="1" className="space-y-3">
            <ColorRow
              label="Màu nền"
              testId="background"
              value={backgroundDisplayHex}
              onChange={commitBoxBackground}
              onClear={clearBoxBackground}
            />

            <Toggle
              label="Lớp đệm"
              testId="padding"
              on={box.paddingOn === true}
              onChange={(paddingOn) => patch({ paddingOn, padding: box.padding || defaultTextBoxPadding() })}
            />
            {box.paddingOn ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-2" data-lp-text-box-padding="1">
                <span />
                <Stepper label="trên" value={padding.t} min={0} max={240} onChange={(n) => setPad('t', n)} />
                <span />
                <Stepper label="trái" value={padding.l} min={0} max={240} onChange={(n) => setPad('l', n)} />
                <button
                  type="button"
                  className={
                    'flex h-8 w-8 items-center justify-center rounded-full text-white ' +
                    (padding.linked ? 'bg-sky-500' : 'bg-slate-300')
                  }
                  aria-pressed={padding.linked}
                  aria-label={padding.linked ? 'Mở khóa lớp đệm' : 'Khóa lớp đệm'}
                  data-lp-text-box-padding-link={padding.linked ? '1' : '0'}
                  onClick={() => {
                    if (padding.linked) {
                      patch({ padding: { ...padding, linked: false } });
                    } else {
                      patch({ padding: { t: padding.t, r: padding.t, b: padding.t, l: padding.t, linked: true } });
                    }
                  }}
                >
                  {padding.linked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                </button>
                <Stepper label="phải" value={padding.r} min={0} max={240} onChange={(n) => setPad('r', n)} />
                <span />
                <Stepper label="dưới" value={padding.b} min={0} max={240} onChange={(n) => setPad('b', n)} />
                <span />
              </div>
            ) : null}

            <Toggle
              label="Viền"
              testId="border"
              on={box.borderOn === true}
              onChange={(borderOn) => patch({ borderOn, border: box.border || defaultTextBoxBorder() })}
            />
            {box.borderOn ? (
              <div className="space-y-2" data-lp-text-box-border="1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stepper
                    label="độ dày"
                    value={border.width}
                    min={0}
                    max={32}
                    onChange={(width) => patch({ border: { ...border, width } })}
                  />
                  <select
                    aria-label="Kiểu viền"
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700"
                    value={border.style}
                    onChange={(e) =>
                      patch({ border: { ...border, style: e.target.value === 'dashed' ? 'dashed' : 'solid' } })
                    }
                  >
                    <option value="solid">Liền</option>
                    <option value="dashed">Đứt</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    data-lp-text-box-border-preset="thin"
                    onClick={() => patch({ border: { ...border, width: 1, style: 'solid' } })}
                  >
                    Liền nhỏ
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    data-lp-text-box-border-preset="thick"
                    onClick={() => patch({ border: { ...border, width: 4, style: 'solid' } })}
                  >
                    Liền đậm
                  </button>
                </div>
                <ColorRow
                  label="Màu viền"
                  testId="border"
                  value={border.color}
                  onChange={(color) => patch({ border: { ...border, color } })}
                />
              </div>
            ) : null}

            <Toggle
              label="Bán kính"
              testId="radius"
              on={box.radiusOn === true}
              onChange={(radiusOn) => patch({ radiusOn, radius: box.radius || defaultTextBoxRadius() })}
            />
            {box.radiusOn ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-2" data-lp-text-box-radius="1">
                <Stepper label="góc trên trái" value={radius.tl} min={0} max={240} onChange={(n) => setRadius('tl', n)} />
                <span />
                <Stepper label="góc trên phải" value={radius.tr} min={0} max={240} onChange={(n) => setRadius('tr', n)} />
                <span />
                <button
                  type="button"
                  className={
                    'flex h-8 w-8 items-center justify-center rounded-full text-white ' +
                    (radius.linked ? 'bg-sky-500' : 'bg-slate-300')
                  }
                  aria-pressed={radius.linked}
                  aria-label={radius.linked ? 'Mở khóa bán kính' : 'Khóa bán kính'}
                  data-lp-text-box-radius-link={radius.linked ? '1' : '0'}
                  onClick={() => {
                    if (radius.linked) patch({ radius: { ...radius, linked: false } });
                    else patch({ radius: { tl: radius.tl, tr: radius.tl, br: radius.tl, bl: radius.tl, linked: true } });
                  }}
                >
                  {radius.linked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                </button>
                <span />
                <Stepper label="góc dưới trái" value={radius.bl} min={0} max={240} onChange={(n) => setRadius('bl', n)} />
                <span />
                <Stepper label="góc dưới phải" value={radius.br} min={0} max={240} onChange={(n) => setRadius('br', n)} />
              </div>
            ) : null}

            <Toggle
              label="Đổ bóng"
              testId="shadow"
              on={box.shadowOn === true}
              onChange={(shadowOn) => patch({ shadowOn, shadow: box.shadow || defaultTextBoxShadow() })}
            />
            {box.shadowOn ? (
              <div className="space-y-2" data-lp-text-box-shadow="1">
                <SliderNumber label="X" value={shadow.x} min={-200} max={200} onChange={(x) => patch({ shadow: { ...shadow, x } })} />
                <SliderNumber label="Y" value={shadow.y} min={-200} max={200} onChange={(y) => patch({ shadow: { ...shadow, y } })} />
                <SliderNumber label="Độ lan" value={shadow.spread} min={-80} max={80} onChange={(spread) => patch({ shadow: { ...shadow, spread } })} />
                <SliderNumber label="Độ mờ" value={shadow.blur} min={0} max={120} onChange={(blur) => patch({ shadow: { ...shadow, blur } })} />
                <ColorRow
                  label="Màu bóng"
                  testId="shadow"
                  value={hexWithAlpha(shadow.color, shadow.opacity)}
                  onChange={(hex8) => {
                    const parsed = parseHexAlpha(hex8);
                    patch({ shadow: { ...shadow, color: parsed.hex, opacity: parsed.alpha } });
                  }}
                />
              </div>
            ) : null}
          </div>
        </Section>

        <Section title="Phương tiện nền" testId="media" openDefault={box.mediaOn === true}>
          <Toggle
            label="Phương tiện nền"
            testId="media"
            on={box.mediaOn === true}
            onChange={(mediaOn) => patch({ mediaOn })}
          />
          {box.mediaOn ? (
            <div className="space-y-2" data-lp-text-box-media="1">
              {box.mediaUrl ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={box.mediaUrl} alt="" className="h-28 w-full object-cover" />
                  <div className="flex gap-2 p-2">
                    <button type="button" className="text-xs font-medium text-sky-600" onClick={onPickMedia}>
                      Thay
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-rose-600"
                      onClick={() => patch({ mediaUrl: undefined, mediaOn: false })}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white py-6 text-sm text-sky-600"
                  onClick={onPickMedia}
                >
                  <ImagePlus className="h-6 w-6" />
                  Thêm hình ảnh
                </button>
              )}
              <button type="button" className="text-xs text-sky-600" onClick={() => setUrlOpen((v) => !v)}>
                Nhúng một tệp từ URL {urlOpen ? '▴' : '▾'}
              </button>
              {urlOpen ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const url = safeTextBoxMediaUrl(urlDraft);
                    if (!url) {
                      setUrlError('Chỉ nhận URL http(s) hoặc đường dẫn trên site.');
                      return;
                    }
                    setUrlError('');
                    patch({ mediaOn: true, mediaUrl: url });
                  }}
                >
                  <input
                    className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                    placeholder="https://"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    aria-label="URL ảnh nền"
                  />
                  <button type="submit" className="rounded-md bg-sky-500 px-2 text-xs text-white">
                    Dùng
                  </button>
                </form>
              ) : null}
              {urlError ? <p className="text-[11px] text-rose-600">{urlError}</p> : null}
              <div className="flex gap-2">
                {(['cover', 'contain'] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    className={
                      'rounded-md border px-2 py-1 text-xs ' +
                      ((box.mediaFit || 'cover') === fit
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600')
                    }
                    onClick={() => patch({ mediaFit: fit })}
                  >
                    {fit === 'cover' ? 'Phủ' : 'Vừa'}
                  </button>
                ))}
              </div>
              <label className="block text-xs text-slate-500">
                Vị trí
                <select
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
                  value={box.mediaPosition || 'center'}
                  onChange={(e) =>
                    patch({
                      mediaPosition: e.target.value as LandingPageTextBoxChrome['mediaPosition'],
                    })
                  }
                >
                  <option value="center">Giữa</option>
                  <option value="top">Trên</option>
                  <option value="bottom">Dưới</option>
                  <option value="left">Trái</option>
                  <option value="right">Phải</option>
                </select>
              </label>
            </div>
          ) : null}
        </Section>

        <Section title="Hiển thị" testId="visibility">
          <div className="text-xs text-slate-500">Tính năng hiển thị</div>
          <div className="grid grid-cols-3 gap-2" data-lp-text-box-visibility="1">
            {(
              [
                ['all', 'Tất cả thiết bị', TabletSmartphone],
                ['mobile', 'Chỉ di động', Smartphone],
                ['desktop', 'Chỉ desktop', Monitor],
              ] as const
            ).map(([id, label, Icon]) => {
              const active = visibility === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-lp-text-box-visibility-mode={id}
                  aria-pressed={active}
                  className={
                    'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight ' +
                    (active
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-slate-200 bg-white text-slate-600')
                  }
                  onClick={() => patch({ visibility: id })}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </Shell>
  );
}
