'use client';

/**
 * GetResponse-style Button Inspector — single focused panel for CTA buttons.
 * Updates existing block.style / ctaLabel / ctaUrl / meta (hide/lock) / responsiveStyle.
 * Does not introduce a new Button data model.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type ChangeEvent,
  type CompositionEvent,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  LP_TEXT_FONT_OPTIONS,
  type LandingPageInlineTextStyle,
} from './landing-page-canvas-ux';
import {
  parseBorderParts,
  parseBoxShadow,
  parsePx,
  serializeBorder,
  serializeBoxShadow,
} from './landing-page-block-design-style';
import {
  InspectorAccordion,
  InspectorFieldLabel,
  InspectorSegmented,
  InspectorSliderNumber,
} from './landing-page-inspector-ui';
import { previewBtnStyle } from './landing-page-button-presets';
import { readBlockFieldString } from './landing-page-inspector-text-content';
import { cn } from '@/lib/utils';

function blurCanvasInlineEdit() {
  if (typeof document === 'undefined') return;
  const el = document.querySelector('[data-lp-inline-editing="1"]') as HTMLElement | null;
  el?.blur();
}

type ButtonTextTransformMode = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

const BUTTON_TEXT_TRANSFORM_OPTIONS: Array<{
  value: ButtonTextTransformMode;
  label: string;
  title: string;
}> = [
  { value: 'none', label: 'Aa', title: 'Bình thường' },
  { value: 'uppercase', label: 'AA', title: 'CHỮ HOA' },
  { value: 'lowercase', label: 'aa', title: 'chữ thường' },
  { value: 'capitalize', label: 'Aa*', title: 'Viết hoa đầu từ' },
];

function resolveButtonTextTransform(
  textStyle: LandingPageInlineTextStyle | undefined,
  style: Record<string, unknown>,
): ButtonTextTransformMode {
  const raw = textStyle?.textTransform ?? style.textTransform;
  if (raw === 'uppercase' || raw === 'lowercase' || raw === 'capitalize') return raw;
  return 'none';
}

function stopInspectorFieldPointer(e: { stopPropagation: () => void }) {
  e.stopPropagation();
}

type InspectorTextDraftLiveMode = 'blur' | 'immediate' | 'debounced';

/** Local draft + IME-safe updates. `blur` = no canvas/spec churn while caret is in the field. */
function useInspectorTextDraft(
  external: string,
  resetKey: string,
  onLive: (value: string) => void,
  onCommit: (value: string) => void,
  options?: { liveMode?: InspectorTextDraftLiveMode; debounceLiveMs?: number },
) {
  const liveMode = options?.liveMode ?? 'immediate';
  const debounceLiveMs = options?.debounceLiveMs ?? 350;
  const [draft, setDraft] = useState(external);
  const focusedRef = useRef(false);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDraftRef = useRef(external);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  function rememberSelection(el: HTMLInputElement) {
    try {
      selectionRef.current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
    } catch {
      selectionRef.current = null;
    }
  }

  function restoreInputFocus() {
    const el = inputRef.current;
    if (!el || !focusedRef.current) return;
    if (document.activeElement === el) return;
    el.focus({ preventScroll: true });
    const sel = selectionRef.current;
    if (sel) {
      try {
        const len = el.value.length;
        const start = Math.min(sel.start, len);
        const end = Math.min(sel.end, len);
        el.setSelectionRange(start, end);
      } catch {
        /* ignore */
      }
    }
  }

  function clearLiveTimer() {
    if (liveTimerRef.current) {
      clearTimeout(liveTimerRef.current);
      liveTimerRef.current = null;
    }
  }

  function pushLive(v: string) {
    if (composingRef.current) return;
    onLive(v);
  }

  function flushLive(v: string) {
    clearLiveTimer();
    pushLive(v);
  }

  function scheduleLive(v: string) {
    if (composingRef.current || liveMode === 'blur') return;
    if (liveMode === 'immediate') {
      pushLive(v);
      requestAnimationFrame(() => restoreInputFocus());
      return;
    }
    clearLiveTimer();
    liveTimerRef.current = setTimeout(() => {
      liveTimerRef.current = null;
      if (composingRef.current) return;
      pushLive(latestDraftRef.current);
      requestAnimationFrame(() => restoreInputFocus());
    }, debounceLiveMs);
  }

  useEffect(() => {
    return () => clearLiveTimer();
  }, []);

  useEffect(() => {
    clearLiveTimer();
    setDraft(external);
    latestDraftRef.current = external;
    focusedRef.current = false;
    composingRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (focusedRef.current || composingRef.current) return;
    setDraft(external);
    latestDraftRef.current = external;
  }, [external]);

  return {
    draft,
    inputRef,
    inputProps: {
      ref: inputRef,
      value: draft,
      onFocus: (e: FocusEvent<HTMLInputElement>) => {
        focusedRef.current = true;
        rememberSelection(e.currentTarget);
        requestAnimationFrame(() => {
          blurCanvasInlineEdit();
          restoreInputFocus();
        });
      },
      onBlur: (e: FocusEvent<HTMLInputElement>) => {
        focusedRef.current = false;
        composingRef.current = false;
        selectionRef.current = null;
        const v = e.target.value;
        latestDraftRef.current = v;
        flushLive(v);
        onCommit(v);
      },
      onCompositionStart: (_e: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = true;
        clearLiveTimer();
      },
      onCompositionEnd: (e: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = false;
        const v = e.currentTarget.value;
        latestDraftRef.current = v;
        setDraft(v);
        if (liveMode !== 'blur') flushLive(v);
      },
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        latestDraftRef.current = v;
        rememberSelection(e.target);
        setDraft(v);
        scheduleLive(v);
      },
      onSelect: (e: ChangeEvent<HTMLInputElement>) => {
        rememberSelection(e.target);
      },
      onKeyUp: (e: KeyboardEvent<HTMLInputElement>) => {
        rememberSelection(e.currentTarget);
      },
      onPointerDown: (e: PointerEvent<HTMLInputElement>) => {
        stopInspectorFieldPointer(e);
        inputRef.current?.focus();
      },
      onMouseDown: stopInspectorFieldPointer,
      onClick: stopInspectorFieldPointer,
    } as const,
  };
}

export type LpButtonLinkKind =
  | 'url'
  | 'landing'
  | 'email'
  | 'phone'
  | 'anchor'
  | 'document'
  | 'none';

export type LandingPageButtonInspectorProps = {
  motionPanel?: ReactNode;
  block: LandingPageBlock;
  textStyle?: LandingPageInlineTextStyle | null;
  isHidden: boolean;
  isLocked: boolean;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
  onPatchTextStyle: (patch: Partial<LandingPageInlineTextStyle>) => void;
  onLiveLabel: (value: string) => void;
  onCommitLabel: (value: string) => void;
  /** Canvas inline field key (usually `ctaLabel`). */
  labelField?: string;
  onToggleHidden: () => void;
  onToggleLock: () => void;
};

type ButtonKind = 'filled' | 'outline';
type ButtonShape = 'sharp' | 'soft' | 'pill';
type ButtonSize = 's' | 'm' | 'l' | 'custom';
type ButtonAlign = 'left' | 'center' | 'right';

const SIZE_PRESETS: Record<
  Exclude<ButtonSize, 'custom'>,
  { padding: string; fontSize: string }
> = {
  s: { padding: '8px 16px', fontSize: '12px' },
  m: { padding: '10px 22px', fontSize: '14px' },
  l: { padding: '14px 28px', fontSize: '16px' },
};

const LINK_KIND_OPTIONS: Array<{ value: LpButtonLinkKind; label: string }> = [
  { value: 'url', label: 'Website / URL' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Số điện thoại' },
  { value: 'anchor', label: 'Neo (anchor)' },
  { value: 'document', label: 'Tài liệu' },
  { value: 'none', label: 'Không liên kết' },
];

function asStyle(block: LandingPageBlock): Record<string, unknown> {
  return { ...((block.style || {}) as Record<string, unknown>) };
}

function detectLinkKind(url: string, stored?: string): LpButtonLinkKind {
  if (stored === 'url' || stored === 'landing' || stored === 'email' || stored === 'phone' || stored === 'anchor' || stored === 'document' || stored === 'none') {
    return stored;
  }
  const u = (url || '').trim();
  if (!u || u === '#' || u === 'none') return 'none';
  if (u.startsWith('mailto:')) return 'email';
  if (u.startsWith('tel:')) return 'phone';
  if (u.startsWith('#')) return 'anchor';
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)(\?|$)/i.test(u)) return 'document';
  if (u.startsWith('/p/') || u.startsWith('/lp') || u.includes('landing')) return 'landing';
  return 'url';
}

function stripLinkPrefix(url: string, kind: LpButtonLinkKind): string {
  const u = (url || '').trim();
  if (kind === 'email') return u.replace(/^mailto:/i, '');
  if (kind === 'phone') return u.replace(/^tel:/i, '');
  if (kind === 'anchor') return u.replace(/^#/, '');
  if (kind === 'none') return '';
  return u;
}

function composeLinkValue(kind: LpButtonLinkKind, raw: string): string {
  const v = raw.trim();
  if (kind === 'none') return '';
  if (kind === 'email') return v ? (v.startsWith('mailto:') ? v : `mailto:${v}`) : '';
  if (kind === 'phone') return v ? (v.startsWith('tel:') ? v : `tel:${v}`) : '';
  if (kind === 'anchor') {
    if (!v) return '#';
    return v.startsWith('#') ? v : `#${v}`;
  }
  return v;
}

function detectKind(style: Record<string, unknown>): ButtonKind {
  const bg = String(style.background || '').toLowerCase();
  const border = String(style.border || '');
  const transparent =
    !bg ||
    bg === 'transparent' ||
    bg === 'none' ||
    bg.startsWith('rgba(0,0,0,0') ||
    bg === 'rgba(0, 0, 0, 0)';
  if (transparent && border && !/none/i.test(border)) return 'outline';
  return 'filled';
}

function detectShape(style: Record<string, unknown>): ButtonShape {
  const r = parsePx(style.borderRadius, 8);
  if (r >= 40 || String(style.borderRadius || '').includes('999')) return 'pill';
  if (r <= 2) return 'sharp';
  return 'soft';
}

function detectSize(style: Record<string, unknown>): ButtonSize {
  const pad = String(style.padding || '');
  const fs = String(style.fontSize || '');
  for (const key of ['s', 'm', 'l'] as const) {
    if (pad === SIZE_PRESETS[key].padding && fs === SIZE_PRESETS[key].fontSize) return key;
  }
  return 'custom';
}

function detectAlign(style: Record<string, unknown>): ButtonAlign {
  const stored = String(style.lpAlign || style.textAlign || 'center');
  if (stored === 'left' || stored === 'right' || stored === 'center') return stored;
  return 'center';
}

function hexOrFallback(raw: unknown, fallback: string): string {
  const s = String(raw || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return fallback;
}

export function LandingPageButtonInspector({
  motionPanel,
  block,
  textStyle,
  isHidden,
  isLocked,
  onUpdateBlock,
  onPatchTextStyle,
  onLiveLabel,
  onCommitLabel,
  labelField = 'ctaLabel',
  onToggleHidden,
  onToggleLock,
}: LandingPageButtonInspectorProps) {
  const style = useMemo(() => asStyle(block), [block]);
  const externalLabel = readBlockFieldString(block, labelField);
  const labelResetKey = `${block.id}::${labelField}`;
  const labelFieldState = useInspectorTextDraft(
    externalLabel,
    labelResetKey,
    onLiveLabel,
    onCommitLabel,
    { liveMode: 'debounced', debounceLiveMs: 280 },
  );
  const labelDraft = labelFieldState.draft;

  const ctaUrl = 'ctaUrl' in block ? String(block.ctaUrl || '') : '';
  const linkKind = detectLinkKind(ctaUrl, String(style.lpLinkKind || ''));
  const externalLinkValue = stripLinkPrefix(ctaUrl, linkKind);
  const linkResetKey = `${block.id}::link::${linkKind}`;
  const commitLinkValueRef = useRef<(raw: string) => void>(() => {});
  const linkFieldState = useInspectorTextDraft(
    externalLinkValue,
    linkResetKey,
    (v) => commitLinkValueRef.current(v),
    (v) => commitLinkValueRef.current(v),
  );
  const linkDraft = linkFieldState.draft;
  const openNewTab = String(style.lpCtaTarget || '') === '_blank';

  const kind = detectKind(style);
  const shape = detectShape(style);
  const size = detectSize(style);
  const align = detectAlign(style);

  const border = parseBorderParts(style);
  const shadow = parseBoxShadow(style.boxShadow);
  const hasShadow = Boolean(shadow);
  const hoverBg = hexOrFallback(style.lpHoverBackground, hexOrFallback(style.background, '#0f172a'));
  const hoverColor = hexOrFallback(style.lpHoverColor, hexOrFallback(style.color, '#ffffff'));
  const textColor = hexOrFallback(
    textStyle?.color || style.color,
    kind === 'outline' ? '#0f172a' : '#ffffff',
  );
  const btnBg = hexOrFallback(style.background, kind === 'outline' ? '#000000' : '#0f172a');

  const [hoverPreview, setHoverPreview] = useState(false);

  function patchStyle(patch: Record<string, unknown>) {
    const next = { ...style, ...patch };
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '' || v === null) delete next[k];
    }
    onUpdateBlock(block.id, { style: next } as Partial<LandingPageBlock>);
  }

  const textTransformMode = resolveButtonTextTransform(textStyle || undefined, style);

  function applyButtonTextTransform(mode: ButtonTextTransformMode) {
    onPatchTextStyle({
      textTransform: mode === 'none' ? undefined : mode,
    });
    if (style.textTransform != null && String(style.textTransform) !== '') {
      patchStyle({ textTransform: undefined });
    }
  }

  function setLinkKind(next: LpButtonLinkKind) {
    const value = composeLinkValue(next, linkDraft);
    onUpdateBlock(block.id, {
      ctaUrl: value,
      style: { ...style, lpLinkKind: next },
    } as Partial<LandingPageBlock>);
  }

  function setLinkValue(raw: string) {
    onUpdateBlock(block.id, {
      ctaUrl: composeLinkValue(linkKind, raw),
    } as Partial<LandingPageBlock>);
  }
  commitLinkValueRef.current = setLinkValue;

  function applyKind(next: ButtonKind) {
    if (next === 'outline') {
      const color = hexOrFallback(style.color, '#f5c518');
      patchStyle({
        background: 'transparent',
        border: serializeBorder(2, 'solid', color),
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: color,
        color,
      });
      return;
    }
    const bg = hexOrFallback(style.background, '#f5c518');
    const solidBg = bg === '#000000' && kind === 'outline' ? '#f5c518' : bg === '#000000' ? '#0f172a' : bg;
    patchStyle({
      background: solidBg === 'transparent' ? '#0f172a' : solidBg,
      border: 'none',
      borderWidth: undefined,
      borderStyle: undefined,
      borderColor: undefined,
      color: hexOrFallback(style.color, '#ffffff'),
    });
  }

  function applyShape(next: ButtonShape) {
    const radius = next === 'sharp' ? '0' : next === 'pill' ? '999px' : '8px';
    patchStyle({ borderRadius: radius });
  }

  function applySize(next: ButtonSize) {
    if (next === 'custom') return;
    const preset = SIZE_PRESETS[next];
    patchStyle({
      padding: preset.padding,
      paddingTop: undefined,
      paddingRight: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
      fontSize: preset.fontSize,
    });
    const n = parseInt(preset.fontSize, 10);
    if (Number.isFinite(n)) onPatchTextStyle({ fontSize: n, fontSizeUnit: 'px' });
  }

  function applyAlign(next: ButtonAlign) {
    patchStyle({
      lpAlign: next,
      textAlign: next,
      marginLeft: next === 'right' ? 'auto' : next === 'center' ? 'auto' : '0',
      marginRight: next === 'left' ? 'auto' : next === 'center' ? 'auto' : '0',
      width: next === 'left' ? undefined : '100%',
    });
  }

  const previewStyle: CSSProperties = {
    ...previewBtnStyle({
      background: hoverPreview
        ? String(style.lpHoverBackground || style.background || '#0f172a')
        : String(style.background || '#0f172a'),
      color: hoverPreview
        ? String(style.lpHoverColor || style.color || '#fff')
        : String(textStyle?.color || style.color || '#fff'),
      border: String(style.border || 'none'),
      borderRadius: String(style.borderRadius || '8px'),
      padding: String(
        style.padding ||
          `${style.paddingTop || '10px'} ${style.paddingRight || '22px'} ${style.paddingBottom || '10px'} ${style.paddingLeft || '22px'}`,
      ),
      fontFamily: textStyle?.fontFamily || (style.fontFamily as string | undefined),
      fontSize: textStyle?.fontSize
        ? `${textStyle.fontSize}px`
        : String(style.fontSize || '14px'),
      fontWeight: (textStyle?.fontWeight as number | string | undefined) || (style.fontWeight as number | undefined) || 700,
      fontStyle: textStyle?.fontStyle || (style.fontStyle as 'normal' | 'italic' | undefined),
      textDecoration: textStyle?.textDecoration || (style.textDecoration as string | undefined),
      textTransform: (textStyle?.textTransform ||
        (style.textTransform as ButtonTextTransformMode | undefined) ||
        undefined) as ButtonTextTransformMode | undefined,
      letterSpacing: textStyle?.letterSpacing || (style.letterSpacing as string | undefined),
      boxShadow: style.boxShadow as string | undefined,
      textAlign: align,
    }),
  };

  const fontWeightBold =
    textStyle?.fontWeight === 'bold' ||
    textStyle?.fontWeight === 700 ||
    Number(style.fontWeight) >= 700;
  const isItalic = textStyle?.fontStyle === 'italic' || style.fontStyle === 'italic';
  const isUnderline = String(textStyle?.textDecoration || style.textDecoration || '').includes(
    'underline',
  );

  const padT = parsePx(style.paddingTop, parsePx(style.padding, 10));
  const padR = parsePx(style.paddingRight, parsePx(style.padding, 22));
  const padB = parsePx(style.paddingBottom, parsePx(style.padding, 10));
  const padL = parsePx(style.paddingLeft, parsePx(style.padding, 22));
  // When shorthand padding is set, parse roughly
  const padParts = String(style.padding || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const resolvedPad = {
    t: padParts.length === 1 ? parsePx(padParts[0], padT) : padParts.length >= 3 ? parsePx(padParts[0], padT) : padT,
    r: padParts.length === 1 ? parsePx(padParts[0], padR) : padParts.length === 2 ? parsePx(padParts[1], padR) : padParts.length >= 4 ? parsePx(padParts[1], padR) : padR,
    b: padParts.length === 1 ? parsePx(padParts[0], padB) : padParts.length >= 3 ? parsePx(padParts[2] || padParts[0], padB) : padB,
    l: padParts.length === 1 ? parsePx(padParts[0], padL) : padParts.length === 2 ? parsePx(padParts[1], padL) : padParts.length >= 4 ? parsePx(padParts[3], padL) : padL,
  };

  function setPad(side: 't' | 'r' | 'b' | 'l', n: number) {
    const next = { ...resolvedPad, [side]: n };
    patchStyle({
      padding: undefined,
      paddingTop: `${next.t}px`,
      paddingRight: `${next.r}px`,
      paddingBottom: `${next.b}px`,
      paddingLeft: `${next.l}px`,
    });
  }

  const linkPlaceholder =
    linkKind === 'email'
      ? 'name@example.com'
      : linkKind === 'phone'
        ? '+84…'
        : linkKind === 'anchor'
          ? 'lead-form'
          : linkKind === 'landing'
            ? '/p/slug hoặc URL landing'
            : linkKind === 'document'
              ? 'https://…/file.pdf'
              : 'https://…';

  return (
    <div
      className="space-y-2.5"
      data-lp-button-inspector="1"
      data-lp-simple-button-inspector="1"
      data-lp-context="button"
    >
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="text-sm font-semibold tracking-wide text-white">NÚT</div>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/50">
          Button
        </span>
      </div>

      {/* Live preview */}
      <div
        className="flex min-h-[72px] items-center justify-center rounded-lg bg-[#0a0a0a] px-3 py-4 ring-1 ring-white/10"
        data-lp-button-inspector-preview
        onMouseEnter={() => setHoverPreview(true)}
        onMouseLeave={() => setHoverPreview(false)}
        title="Hover để xem màu hover"
      >
        <span style={previewStyle}>{labelDraft || 'Nút bấm'}</span>
      </div>

      <InspectorAccordion title="CTA & Liên kết" data-lp="btn-cta-link" defaultOpen>
        <InspectorFieldLabel>Văn bản nút</InspectorFieldLabel>
        <input
          type="text"
          data-lp-button-label
          data-lp-no-drag
          className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-sm normal-case text-white outline-none focus:border-orange-400/50"
          disabled={isLocked}
          spellCheck
          autoComplete="off"
          {...labelFieldState.inputProps}
        />

        <InspectorFieldLabel>Kiểu chữ</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-text-transform"
          value={textTransformMode}
          options={BUTTON_TEXT_TRANSFORM_OPTIONS}
          onChange={applyButtonTextTransform}
        />

        <InspectorFieldLabel>Loại liên kết</InspectorFieldLabel>
        <select
          data-lp-button-link-kind
          className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
          value={linkKind}
          onChange={(e) => setLinkKind(e.target.value as LpButtonLinkKind)}
        >
          {LINK_KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {linkKind !== 'none' ? (
          <>
            <InspectorFieldLabel>
              {linkKind === 'email'
                ? 'Email'
                : linkKind === 'phone'
                  ? 'Số điện thoại'
                  : linkKind === 'anchor'
                    ? 'Neo (anchor)'
                    : 'URL / giá trị'}
            </InspectorFieldLabel>
            <input
              type="text"
              data-lp-button-link-value
              data-lp-no-drag
              className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-sm text-white outline-none focus:border-orange-400/50"
              placeholder={linkPlaceholder}
              autoComplete="off"
              {...linkFieldState.inputProps}
            />
          </>
        ) : null}

        <InspectorFieldLabel>Mở liên kết</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-target"
          value={openNewTab ? 'blank' : 'self'}
          options={[
            { value: 'self', label: 'Cùng tab' },
            { value: 'blank', label: 'Tab mới' },
          ]}
          onChange={(v) =>
            patchStyle({ lpCtaTarget: v === 'blank' ? '_blank' : '_self' })
          }
        />
      </InspectorAccordion>

      {motionPanel}
      <InspectorAccordion title="Thiết kế nút" data-lp="btn-design" defaultOpen>
        <InspectorFieldLabel>Kiểu</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-kind"
          value={kind}
          options={[
            { value: 'filled', label: 'Nét liền' },
            { value: 'outline', label: 'Có đường viền' },
          ]}
          onChange={(v) => applyKind(v)}
        />

        <InspectorFieldLabel>Hình dạng</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-shape"
          value={shape}
          options={[
            { value: 'sharp', label: 'Sắc nét' },
            { value: 'soft', label: 'Soft' },
            { value: 'pill', label: 'Làm tròn' },
          ]}
          onChange={(v) => applyShape(v)}
        />

        <InspectorFieldLabel>Kích thước</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-size"
          value={size}
          options={[
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
            { value: 'custom', label: 'Custom' },
          ]}
          onChange={(v) => applySize(v)}
        />

        <InspectorFieldLabel>Căn chỉnh</InspectorFieldLabel>
        <InspectorSegmented
          data-lp="btn-align"
          value={align}
          options={[
            { value: 'left', label: 'Trái' },
            { value: 'center', label: 'Giữa' },
            { value: 'right', label: 'Phải' },
          ]}
          onChange={(v) => applyAlign(v)}
        />
      </InspectorAccordion>

      <InspectorAccordion title="Cài đặt nâng cao" data-lp="btn-advanced" defaultOpen={false}>
        <InspectorFieldLabel>Font</InspectorFieldLabel>
        <select
          data-lp-button-font
          className="lp-dark-select w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
          value={textStyle?.fontFamily || String(style.fontFamily || '')}
          onChange={(e) => {
            const fontFamily = e.target.value;
            patchStyle({ fontFamily: fontFamily || undefined });
            onPatchTextStyle({ fontFamily: fontFamily || undefined });
          }}
        >
          <option value="">Mặc định</option>
          {LP_TEXT_FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <InspectorSliderNumber
          label="Font size"
          value={textStyle?.fontSize || parsePx(style.fontSize, 14)}
          min={10}
          max={48}
          onChange={(n) => {
            patchStyle({ fontSize: `${n}px` });
            onPatchTextStyle({ fontSize: n, fontSizeUnit: 'px' });
          }}
        />

        <InspectorFieldLabel>Định dạng</InspectorFieldLabel>
        <div className="flex gap-1">
          <FormatToggle
            active={fontWeightBold}
            label="B"
            title="Bold"
            className="font-bold"
            onClick={() => {
              const next = fontWeightBold ? 500 : 700;
              patchStyle({ fontWeight: next });
              onPatchTextStyle({ fontWeight: next });
            }}
          />
          <FormatToggle
            active={isItalic}
            label="I"
            title="Italic"
            className="italic"
            onClick={() => {
              const next = isItalic ? 'normal' : 'italic';
              patchStyle({ fontStyle: next });
              onPatchTextStyle({ fontStyle: next });
            }}
          />
          <FormatToggle
            active={isUnderline}
            label="U"
            title="Underline"
            className="underline"
            onClick={() => {
              const next = isUnderline ? 'none' : 'underline';
              patchStyle({ textDecoration: next });
              onPatchTextStyle({ textDecoration: next });
            }}
          />
        </div>

        <ColorRow
          label="Màu chữ"
          value={textColor}
          onChange={(c) => {
            patchStyle({ color: c });
            onPatchTextStyle({ color: c });
          }}
        />
        <ColorRow
          label="Màu nút"
          value={btnBg === 'transparent' ? '#0f172a' : btnBg}
          onChange={(c) => {
            if (kind === 'outline') {
              patchStyle({
                background: 'transparent',
                color: c,
                border: serializeBorder(border.width || 2, border.style || 'solid', c),
                borderColor: c,
              });
              onPatchTextStyle({ color: c });
            } else {
              patchStyle({ background: c });
            }
          }}
        />
        <ColorRow
          label="Hover màu chữ"
          value={hoverColor}
          onChange={(c) => patchStyle({ lpHoverColor: c })}
        />
        <ColorRow
          label="Hover màu nút"
          value={hoverBg}
          onChange={(c) => patchStyle({ lpHoverBackground: c })}
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <InspectorFieldLabel>Border</InspectorFieldLabel>
          <label className="flex items-center gap-1.5 text-[11px] text-white/70">
            <input
              type="checkbox"
              checked={border.width > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  const color = border.color || textColor || '#ffffff';
                  patchStyle({
                    border: serializeBorder(2, 'solid', color),
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: color,
                  });
                } else {
                  patchStyle({
                    border: 'none',
                    borderWidth: undefined,
                    borderStyle: undefined,
                    borderColor: undefined,
                  });
                }
              }}
            />
            Bật
          </label>
        </div>
        {border.width > 0 ? (
          <div className="space-y-2">
            <ColorRow
              label="Màu viền"
              value={hexOrFallback(border.color, '#ffffff')}
              onChange={(c) => {
                const w = border.width || 1;
                patchStyle({
                  border: serializeBorder(w, border.style || 'solid', c),
                  borderWidth: `${w}px`,
                  borderStyle: border.style || 'solid',
                  borderColor: c,
                });
              }}
            />
            <InspectorSliderNumber
              label="Độ dày"
              value={border.width}
              min={1}
              max={12}
              onChange={(n) => {
                patchStyle({
                  border: serializeBorder(n, border.style || 'solid', border.color || '#fff'),
                  borderWidth: `${n}px`,
                  borderStyle: border.style || 'solid',
                  borderColor: border.color || '#fff',
                });
              }}
            />
          </div>
        ) : null}

        <InspectorSliderNumber
          label="Border radius"
          value={parsePx(style.borderRadius, 8)}
          min={0}
          max={999}
          onChange={(n) => patchStyle({ borderRadius: `${n}px` })}
        />

        <div className="flex items-center justify-between gap-2">
          <InspectorFieldLabel>Shadow</InspectorFieldLabel>
          <label className="flex items-center gap-1.5 text-[11px] text-white/70">
            <input
              type="checkbox"
              checked={hasShadow}
              onChange={(e) => {
                if (e.target.checked) {
                  patchStyle({
                    boxShadow: serializeBoxShadow({
                      x: 0,
                      y: 8,
                      blur: 20,
                      spread: 0,
                      color: '#000000',
                      opacity: 0.25,
                    }),
                  });
                } else {
                  patchStyle({ boxShadow: undefined });
                }
              }}
            />
            Bật
          </label>
        </div>
        {hasShadow && shadow ? (
          <div className="grid grid-cols-2 gap-2">
            <InspectorSliderNumber
              label="Y"
              value={shadow.y}
              min={-40}
              max={40}
              onChange={(n) => patchStyle({ boxShadow: serializeBoxShadow({ ...shadow, y: n }) })}
            />
            <InspectorSliderNumber
              label="Blur"
              value={shadow.blur}
              min={0}
              max={80}
              onChange={(n) => patchStyle({ boxShadow: serializeBoxShadow({ ...shadow, blur: n }) })}
            />
          </div>
        ) : null}

        <InspectorFieldLabel>Padding</InspectorFieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <InspectorSliderNumber label="Trên" value={resolvedPad.t} min={0} max={64} onChange={(n) => setPad('t', n)} />
          <InspectorSliderNumber label="Phải" value={resolvedPad.r} min={0} max={80} onChange={(n) => setPad('r', n)} />
          <InspectorSliderNumber label="Dưới" value={resolvedPad.b} min={0} max={64} onChange={(n) => setPad('b', n)} />
          <InspectorSliderNumber label="Trái" value={resolvedPad.l} min={0} max={80} onChange={(n) => setPad('l', n)} />
        </div>
      </InspectorAccordion>

      <InspectorAccordion title="Hiển thị" data-lp="btn-visibility" defaultOpen={false}>
        <InspectorFieldLabel>Thiết bị</InspectorFieldLabel>
        <div className="space-y-1.5" data-lp-button-device-vis>
          {(
            [
              ['desktop', 'Desktop'],
              ['tablet', 'Tablet'],
              ['mobile', 'Mobile'],
            ] as const
          ).map(([vp, label]) => {
            const rs = (block.responsiveStyle || {}) as Record<
              string,
              { display?: string } | undefined
            >;
            const hidden = rs[vp]?.display === 'none';
            return (
              <label
                key={vp}
                className="flex items-center gap-2 rounded-md border border-white/10 px-2 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={!hidden}
                  onChange={(e) => {
                    const prev = { ...((block.responsiveStyle || {}) as Record<string, unknown>) };
                    const bucket = { ...((prev[vp] as Record<string, unknown>) || {}) };
                    if (!e.target.checked) bucket.display = 'none';
                    else delete bucket.display;
                    const next = {
                      ...prev,
                      [vp]: Object.keys(bucket).length ? bucket : undefined,
                    };
                    for (const [k, v] of Object.entries(next)) {
                      if (v === undefined) delete next[k];
                    }
                    onUpdateBlock(block.id, {
                      responsiveStyle: Object.keys(next).length ? next : undefined,
                    } as Partial<LandingPageBlock>);
                  }}
                />
                {label}
              </label>
            );
          })}
        </div>
        <p className="text-[10px] leading-snug text-white/40">
          Bỏ tick để ẩn nút trên viewport tương ứng — không ghi đè viewport khác.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            data-lp-button-hide
            disabled={block.locked === true}
            className={cn(
              'rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
              isHidden
                ? 'border-amber-400/40 bg-amber-400/15 text-amber-100'
                : 'border-white/10 text-white/75 hover:bg-white/5',
            )}
            onClick={onToggleHidden}
          >
            {isHidden ? 'Đang ẩn — Hiện lại' : 'Ẩn element'}
          </button>
          <button
            type="button"
            data-lp-button-lock
            className={cn(
              'rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition',
              isLocked
                ? 'border-orange-400/40 bg-orange-400/15 text-orange-100'
                : 'border-white/10 text-white/75 hover:bg-white/5',
            )}
            onClick={onToggleLock}
          >
            {isLocked ? 'Đang khóa — Mở khóa' : 'Khóa element'}
          </button>
        </div>
      </InspectorAccordion>
    </div>
  );
}

function FormatToggle({
  active,
  label,
  title,
  className,
  onClick,
}: {
  active: boolean;
  label: string;
  title: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      className={cn(
        'h-8 w-8 rounded-md border text-xs transition',
        className,
        active
          ? 'border-orange-400/50 bg-orange-400/20 text-white'
          : 'border-white/10 text-white/70 hover:bg-white/5',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <InspectorFieldLabel>{label}</InspectorFieldLabel>
      <input
        type="color"
        className="ml-auto h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="w-[78px] rounded border border-white/10 bg-zinc-900 px-1.5 py-1 text-[11px] text-white/80"
        value={value}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (/^#[0-9a-fA-F]{3,8}$/.test(v)) onChange(v.length === 4 ? hexOrFallback(v, value) : v.slice(0, 7));
        }}
      />
    </div>
  );
}

/** Type-only re-export helper for callers that need ReactNode. */
export type ButtonInspectorSlot = ReactNode;
