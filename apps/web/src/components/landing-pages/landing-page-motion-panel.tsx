'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpLeft,
  Ban,
  Check,
  ChevronRight,
  Expand,
  Layers,
  Shrink,
  SquareDashed,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  LandingPageBlock,
  LandingPageMotion,
  LandingPageMotionPreset,
} from '@marketingspa/shared';
import {
  LP_MOTION_DEFAULTS,
  lpMotionLocalKey,
  readLandingPageMotion,
  isLandingPageMotionElementKey,
} from '@marketingspa/shared';
import type { LpSelectionTarget } from './landing-page-canvas-selection';
import { InspectorAccordion } from './landing-page-inspector-ui';
import { tryLpMotion } from './landing-page-motion-runtime';

const PRESETS: Array<[LandingPageMotionPreset | 'none', string, LucideIcon]> = [
  ['none', 'Không hiệu ứng', Ban],
  ['fade', 'Hiện dần', SquareDashed],
  ['slide-down', 'Từ trên xuống', ArrowDown],
  ['slide-up', 'Từ dưới lên', ArrowUp],
  ['slide-right', 'Từ trái sang phải', ArrowRight],
  ['slide-left', 'Từ phải sang trái', ArrowLeft],
  ['zoom-in', 'Phóng to', Expand],
  ['zoom-out', 'Thu nhỏ', Shrink],
  ['slide-down-right', 'Từ góc trên trái', ArrowDownRight],
  ['slide-down-left', 'Từ góc trên phải', ArrowDownLeft],
  ['slide-up-right', 'Từ góc dưới trái', ArrowUpRight],
  ['slide-up-left', 'Từ góc dưới phải', ArrowUpLeft],
];
const SECTION_LABELS: Partial<Record<LandingPageBlock['type'], string>> = {
  Hero: 'Hero',
  Benefits: 'Lợi ích',
  Features: 'Tính năng',
  CTA: 'CTA',
  Pricing: 'Bảng giá',
  Gallery: 'Thư viện ảnh',
  Testimonials: 'Đánh giá',
  FAQ: 'Câu hỏi thường gặp',
  Video: 'Video',
  Countdown: 'Đếm ngược',
  LeadForm: 'Form',
  Header: 'Header',
};
function targetLabel(target: LpSelectionTarget, block: LandingPageBlock): string {
  if (
    lpMotionLocalKey(target) === 'section' &&
    block.type === 'CTA' &&
    block.style?.lpBox &&
    !block.style?.lpFrame &&
    !block.style?.lpGrid
  )
    return 'Icon / Đồ họa';
  const field = target.field;
  if (field?.startsWith('itemTitle:') || field?.startsWith('planName:')) return 'Tiêu đề trong thẻ';
  if (field?.startsWith('itemDesc:')) return 'Mô tả trong thẻ';
  if (field?.startsWith('itemImage:')) return 'Ảnh trong thẻ';
  if (field?.startsWith('fieldLabel:')) return 'Nhãn trường nhập liệu';
  if (field?.startsWith('countdownCell:') || target.element.startsWith('countdown:'))
    return 'Ô đếm ngược';
  if (field?.startsWith('trustPoint:')) return 'Nội dung tin cậy';
  if (field === 'submitLabel') return 'Nút gửi';
  if (target.element === 'form') return 'Form';
  if (target.element.startsWith('item:trust-icon-')) return 'Icon';
  if (field?.startsWith('planCta:') || target.element === 'cta') return 'Nút';
  if (field)
    return (
      (
        { headline: 'Tiêu đề', subheadline: 'Mô tả', body: 'Nội dung', ctaLabel: 'Nút' } as Record<
          string,
          string
        >
      )[field] || 'Chữ trong thẻ'
    );
  if (target.element.startsWith('item:')) return 'Thẻ nội dung';
  if (target.element === 'image' || target.element.startsWith('grid:')) return 'Ảnh';
  return 'Section';
}

/** One commit per choice. Auditions wait for the committed canvas render and never enter history. */
export function LandingPageMotionPanel({
  block,
  target,
  disabled,
  onChange,
}: {
  block: LandingPageBlock;
  target: LpSelectionTarget;
  disabled?: boolean;
  onChange: (target: LpSelectionTarget, value?: LandingPageMotion) => void;
}) {
  const id = useId(),
    key = lpMotionLocalKey(target);
  const value = readLandingPageMotion(block.style, key);
  const [duration, setDuration] = useState(String(value?.duration ?? LP_MOTION_DEFAULTS.duration));
  const [delay, setDelay] = useState(String(value?.delay ?? 0));
  const previewFrame = useRef<number | null>(null);
  useEffect(() => {
    setDuration(String(value?.duration ?? LP_MOTION_DEFAULTS.duration));
    setDelay(String(value?.delay ?? 0));
  }, [block.id, key, value?.duration, value?.delay]);
  useEffect(
    () => () => {
      if (previewFrame.current !== null) cancelAnimationFrame(previewFrame.current);
    },
    [block.id, key],
  );
  function preview(motion?: LandingPageMotion) {
    if (disabled) return;
    if (previewFrame.current !== null) cancelAnimationFrame(previewFrame.current);
    previewFrame.current = requestAnimationFrame(() => {
      previewFrame.current = requestAnimationFrame(() => {
        previewFrame.current = null;
        tryLpMotion(target, motion ? { ...motion, delay: 0 } : undefined);
      });
    });
  }
  function select(preset: LandingPageMotionPreset | 'none') {
    const motion =
      preset === 'none'
        ? undefined
        : { ...LP_MOTION_DEFAULTS, ...value, preset, trigger: 'scroll' as const };
    onChange(target, motion);
    preview(motion);
  }
  function confirmNumber(name: 'duration' | 'delay', raw: string) {
    if (!value) return;
    const n = Number(raw);
    const number =
      Number.isFinite(n) && raw.trim()
        ? Math.round(
            Math.max(name === 'duration' ? 150 : 0, Math.min(name === 'duration' ? 1200 : 400, n)),
          )
        : value[name];
    (name === 'duration' ? setDuration : setDelay)(String(number));
    if (number !== value[name]) {
      const motion = { ...value, [name]: number, trigger: 'scroll' as const };
      onChange(target, motion);
      preview(motion);
    }
  }
  if (key !== 'section' && !isLandingPageMotionElementKey(key)) return null;
  const selectedPreset = value?.preset || 'none';
  const sectionLabel = block.layerName || SECTION_LABELS[block.type] || 'Section';
  const numberControl =
    'h-9 w-full min-w-0 rounded-lg border border-white/35 bg-transparent py-1.5 pl-3 pr-11 text-[13px] font-medium tabular-nums text-white outline-none focus:border-[#9cf0cc] focus:ring-1 focus:ring-[#9cf0cc] disabled:cursor-not-allowed';
  return (
    <div className="min-w-0 space-y-3 text-white" data-lp-motion-panel>
      <div
        id={`${id}-target`}
        className="flex min-h-9 min-w-0 items-center gap-2.5 border-b border-white/15 pb-2 text-[13px]"
        data-lp-motion-target={key}
        data-lp-motion-block={block.id}
        aria-label={`Đang chỉnh: ${sectionLabel} / ${targetLabel(target, block)}`}
      >
        <Layers
          aria-hidden="true"
          className="h-[18px] w-[18px] shrink-0 text-white/85"
          strokeWidth={1.6}
        />
        <span className="min-w-0 flex-1 truncate">
          <span className="text-white/75">{sectionLabel}</span>
          <span className="px-2 text-white/40">/</span>
          <span className="font-medium">{targetLabel(target, block)}</span>
        </span>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-white/75" />
      </div>
      <InspectorAccordion
        title="Hiệu ứng chuyển động"
        data-lp="motion"
        defaultOpen
        chevronPosition="start"
        className="overflow-visible rounded-none border-0"
        headerClassName="gap-2.5 px-0 pb-3 pt-0 text-[15px] normal-case tracking-normal text-white hover:bg-transparent"
        bodyClassName="border-0 p-0"
      >
        <fieldset
          disabled={disabled}
          aria-label="Hiệu ứng chuyển động"
          aria-describedby={`${id}-target`}
          className="min-w-0 space-y-4"
        >
          <div className="grid grid-cols-4 gap-2" data-lp-motion-preset-grid>
            {PRESETS.map(([preset, label, Icon], index) => {
              const selected = selectedPreset === preset;
              return (
                <label
                  key={preset}
                  className="group relative min-w-0 cursor-pointer"
                  data-lp-motion-choice={preset}
                >
                  <input
                    type="radio"
                    name={`${id}-preset`}
                    aria-label={label}
                    className="peer sr-only"
                    data-lp-motion-preset={preset}
                    checked={selected}
                    onChange={() => select(preset)}
                    onClick={() => {
                      if (selected) preview(preset === 'none' ? undefined : value);
                    }}
                  />
                  <span
                    className={cn(
                      'relative flex h-12 min-w-0 items-center justify-center rounded-lg border transition-[border-color,background-color,box-shadow] duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#9cf0cc] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0A3D30] peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                      selected
                        ? 'border-[#9cf0cc] bg-[#9cf0cc]/[0.07] ring-1 ring-[#9cf0cc]'
                        : 'border-white/30 bg-white/[0.025] hover:border-white/55 hover:bg-white/[0.06]',
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-[22px] w-[22px] shrink-0"
                      strokeWidth={1.7}
                    />
                    {selected ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#9cf0cc] text-[#073c2e]"
                        data-lp-motion-selected
                      >
                        <Check className="h-2 w-2" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span
                    role="tooltip"
                    className={cn(
                      'pointer-events-none invisible absolute bottom-full z-50 mb-2 whitespace-nowrap rounded-md bg-zinc-950 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:visible group-hover:opacity-100 peer-focus-visible:visible peer-focus-visible:opacity-100',
                      index % 4 === 0
                        ? 'left-0'
                        : index % 4 === 3
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2',
                    )}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
          <label className="block min-w-0 space-y-2" data-lp-motion-speed-control>
            <span className="flex items-center justify-between text-[13px] font-semibold">
              <span>Tốc độ</span>
              <span className="font-normal tabular-nums text-white/75">{duration} ms</span>
            </span>
            <input
              type="range"
              min={150}
              max={1200}
              step={1}
              value={Math.max(150, Math.min(1200, Number(duration) || LP_MOTION_DEFAULTS.duration))}
              disabled={!value}
              aria-label="Tốc độ hiệu ứng"
              aria-valuetext={`${duration} mili giây; số lớn hơn chạy chậm hơn`}
              data-lp-motion-speed
              className="block h-5 w-full cursor-pointer accent-[#9cf0cc] disabled:cursor-not-allowed disabled:opacity-40"
              onChange={(e) => setDuration(e.target.value)}
              onPointerUp={(e) => confirmNumber('duration', e.currentTarget.value)}
              onKeyUp={(e) => {
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key))
                  confirmNumber('duration', e.currentTarget.value);
              }}
              onBlur={(e) => confirmNumber('duration', e.currentTarget.value)}
            />
            <span className="flex justify-between text-[11px] text-white/70">
              <span>Nhanh</span>
              <span>Chậm</span>
            </span>
          </label>
          <fieldset
            disabled={!value}
            aria-label="Thời gian hiệu ứng"
            className="grid min-w-0 grid-cols-2 gap-4 disabled:opacity-50"
            data-lp-motion-timing
          >
            {(
              [
                ['duration', 'Thời lượng', duration, setDuration, 150, 1200],
                ['delay', 'Độ trễ', delay, setDelay, 0, 400],
              ] as const
            ).map(([name, label, draft, setDraft, min, max]) => (
              <label key={name} className="min-w-0 space-y-2">
                <span className="block text-[13px] font-semibold">{label}</span>
                <span className="relative block">
                  <input
                    aria-label={`${label} hiệu ứng (ms)`}
                    data-lp-motion-duration={name === 'duration' ? '' : undefined}
                    data-lp-motion-delay={name === 'delay' ? '' : undefined}
                    type="number"
                    min={min}
                    max={max}
                    step={1}
                    style={{ colorScheme: 'dark' }}
                    className={numberControl}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={(e) => confirmNumber(name, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-7 flex items-center text-xs text-white/75"
                  >
                    ms
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </fieldset>
      </InspectorAccordion>
    </div>
  );
}
