'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Pipette } from 'lucide-react';
import { parseHexAlpha, hexWithAlpha } from '@marketingspa/shared';
import { cn } from '@/lib/utils';

// Theme preset colors matching reference UI and video
const THEME_PRESETS = [
  '#000000FF',
  '#FFFFFFFF',
  '#F5B301FF',
  '#332211FF',
  '#C67D15FF',
  '#00000000', // transparent checkerboard
] as const;

// Default recent colors matching reference image/video
const DEFAULT_RECENTS = [
  '#B8B4C9FF',
  '#D9D1CEFF',
  '#876B66FF',
  '#3B4E3EFF',
  '#171515FF',
  '#D01E1EFF',
];

const RECENT_COLORS_STORAGE_KEY = 'lp_builder_recent_colors';

// Checkerboard pattern for alpha transparency
const CHECKERBOARD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".15"><rect x="0" width="8" height="8" fill="%23888"/><rect x="8" width="8" height="8" fill="%23fff"/><rect y="8" width="8" height="8" fill="%23fff"/><rect x="8" y="8" width="8" height="8" fill="%23888"/></svg>`;

// Color Space Math: HSV <-> RGB <-> Hex8
export type HsvColor = { h: number; s: number; v: number; a: number };

export function hex8ToHsv(hex8: string): HsvColor {
  const p = parseHexAlpha(hex8);
  const r = parseInt(p.hex.slice(1, 3), 16) / 255;
  const g = parseInt(p.hex.slice(3, 5), 16) / 255;
  const b = parseInt(p.hex.slice(5, 7), 16) / 255;
  const a = p.alpha;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v, a };
}

export function hsvToHex8(h: number, s: number, v: number, a: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));
  a = Math.max(0, Math.min(1, a));

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  const aa = Math.round(a * 255);

  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  const hexA = aa.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase();
}

export function hsvToRgbString(h: number, s: number, v: number): string {
  const hex = hsvToHex8(h, s, v, 1);
  const p = parseHexAlpha(hex);
  return `rgb(${parseInt(p.hex.slice(1, 3), 16)}, ${parseInt(p.hex.slice(3, 5), 16)}, ${parseInt(p.hex.slice(5, 7), 16)})`;
}

export interface LandingPageColorPickerPopoverProps {
  children?: React.ReactNode;
  /** Active mode: 'solid' (Màu đơn) or 'gradient' (Màu tán sắc) */
  mode?: 'solid' | 'gradient';
  onModeChange?: (mode: 'solid' | 'gradient') => void;
  /** Whether gradient mode is enabled/allowed (set false for borders/shadows) */
  allowGradient?: boolean;
  /** Solid color in hex6 or hex8 */
  color?: string;
  onColorChange?: (hex8: string) => void;
  /** Gradient attributes */
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  onGradientChange?: (patch: { from?: string; to?: string; angle?: number }) => void;
  /** Clear background action */
  onClear?: () => void;
  /** Popover placement */
  side?: 'left' | 'right' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  onGestureEnd?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  testId?: string;
}

export function LandingPageColorPickerPopover({
  children,
  mode = 'solid',
  onModeChange,
  allowGradient = true,
  color = '#000000FF',
  onColorChange,
  gradientFrom = '#1A1717FF',
  gradientTo = '#B89C94FF',
  gradientAngle = 135,
  onGradientChange,
  onClear,
  side = 'left',
  align = 'start',
  onGestureEnd,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  testId,
}: LandingPageColorPickerPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  // Active stop in gradient mode: 1 = start (from), 2 = end (to)
  const [activeStop, setActiveStop] = useState<1 | 2>(1);

  // Stop positions in gradient mode (0% to 100%)
  const [stop1Percent, setStop1Percent] = useState(0);
  const [stop2Percent, setStop2Percent] = useState(100);

  // Recent colors persisted in localStorage
  const [recents, setRecents] = useState<string[]>(DEFAULT_RECENTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COLORS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecents(parsed.slice(0, 6));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const pushRecentColor = useCallback((hex8: string) => {
    if (!hex8 || hex8 === '#00000000') return;
    setRecents((prev) => {
      const filtered = prev.filter((c) => c.toUpperCase() !== hex8.toUpperCase());
      const updated = [hex8.toUpperCase(), ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Determine which color is currently being actively edited
  const currentColorHex8 = useMemo(() => {
    if (mode === 'gradient' && allowGradient) {
      return activeStop === 1 ? (gradientFrom || '#1A1717FF') : (gradientTo || '#B89C94FF');
    }
    return color || '#000000FF';
  }, [mode, allowGradient, activeStop, gradientFrom, gradientTo, color]);

  // HSV representation of currently edited color
  const [hsv, setHsv] = useState<HsvColor>(() => hex8ToHsv(currentColorHex8));

  // Sync HSV when external color prop changes and not dragging
  useEffect(() => {
    setHsv(hex8ToHsv(currentColorHex8));
  }, [currentColorHex8]);

  // Hex drafts for editable inputs
  const [hexDraft1, setHexDraft1] = useState(() => (mode === 'gradient' ? gradientFrom : currentColorHex8));
  const [hexDraft2, setHexDraft2] = useState(() => gradientTo);

  useEffect(() => {
    if (mode === 'gradient') {
      setHexDraft1(gradientFrom);
      setHexDraft2(gradientTo);
    } else {
      setHexDraft1(currentColorHex8);
    }
  }, [mode, gradientFrom, gradientTo, currentColorHex8]);

  // Handle committing new color value to parent
  const commitHsv = useCallback(
    (nextHsv: HsvColor) => {
      setHsv(nextHsv);
      const nextHex8 = hsvToHex8(nextHsv.h, nextHsv.s, nextHsv.v, nextHsv.a);

      if (mode === 'gradient' && allowGradient) {
        if (activeStop === 1) {
          setHexDraft1(nextHex8);
          onGradientChange?.({ from: nextHex8 });
        } else {
          setHexDraft2(nextHex8);
          onGradientChange?.({ to: nextHex8 });
        }
      } else {
        setHexDraft1(nextHex8);
        onColorChange?.(nextHex8);
      }
    },
    [mode, allowGradient, activeStop, onGradientChange, onColorChange],
  );

  // Directly set a full hex8 color (e.g. from swatches or eyedropper)
  const applyHex8 = useCallback(
    (nextHex8: string) => {
      const parsed = parseHexAlpha(nextHex8);
      const newHsv = hex8ToHsv(parsed.hex8);
      setHsv(newHsv);
      pushRecentColor(parsed.hex8);

      if (mode === 'gradient' && allowGradient) {
        if (activeStop === 1) {
          setHexDraft1(parsed.hex8);
          onGradientChange?.({ from: parsed.hex8 });
        } else {
          setHexDraft2(parsed.hex8);
          onGradientChange?.({ to: parsed.hex8 });
        }
      } else {
        setHexDraft1(parsed.hex8);
        onColorChange?.(parsed.hex8);
      }
      onGestureEnd?.();
    },
    [mode, allowGradient, activeStop, pushRecentColor, onGradientChange, onColorChange, onGestureEnd],
  );

  // Eyedropper API
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          applyHex8(hexWithAlpha(result.sRGBHex, hsv.a));
        }
      } catch {
        // User cancelled eyedropper
      }
    } else {
      const manual = window.prompt('Nhập mã màu HEX (ví dụ #FF5500 hoặc #FF5500FF):', currentColorHex8);
      if (manual && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(manual.trim())) {
        applyHex8(parseHexAlpha(manual.trim()).hex8);
      }
    }
  };

  // 2D Saturation / Value Canvas interaction
  const canvasRef = useRef<HTMLDivElement>(null);
  const handleCanvasPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = x / rect.width;
    const v = 1 - y / rect.height;

    commitHsv({ ...hsv, s, v });
  };

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    handleCanvasPointer(e);
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      handleCanvasPointer(e);
    }
  };

  const onCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    pushRecentColor(hsvToHex8(hsv.h, hsv.s, hsv.v, hsv.a));
    onGestureEnd?.();
  };

  // Rainbow Hue Slider interaction
  const hueRef = useRef<HTMLDivElement>(null);
  const handleHuePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const h = Math.round((x / rect.width) * 360) % 360;
    commitHsv({ ...hsv, h });
  };

  const onHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    hueRef.current?.setPointerCapture(e.pointerId);
    handleHuePointer(e);
  };

  const onHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      handleHuePointer(e);
    }
  };

  const onHuePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    hueRef.current?.releasePointerCapture(e.pointerId);
    pushRecentColor(hsvToHex8(hsv.h, hsv.s, hsv.v, hsv.a));
    onGestureEnd?.();
  };

  // Opacity / Alpha Slider interaction
  const alphaRef = useRef<HTMLDivElement>(null);
  const handleAlphaPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const a = Math.round((x / rect.width) * 100) / 100;
    commitHsv({ ...hsv, a });
  };

  const onAlphaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    alphaRef.current?.setPointerCapture(e.pointerId);
    handleAlphaPointer(e);
  };

  const onAlphaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      handleAlphaPointer(e);
    }
  };

  const onAlphaPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    alphaRef.current?.releasePointerCapture(e.pointerId);
    pushRecentColor(hsvToHex8(hsv.h, hsv.s, hsv.v, hsv.a));
    onGestureEnd?.();
  };

  // "Thanh kéo màu đậm nhạt" (Tone / Shade / Dual-Stop Slider) interaction
  const toneRef = useRef<HTMLDivElement>(null);
  const [isDraggingStop, setIsDraggingStop] = useState<1 | 2 | null>(null);

  const handleTonePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!toneRef.current) return;
    const rect = toneRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = Math.max(0, Math.min(1, x / rect.width));

    if (mode === 'gradient' && allowGradient) {
      if (isDraggingStop === 1) {
        setStop1Percent(Math.round(ratio * 100));
      } else if (isDraggingStop === 2) {
        setStop2Percent(Math.round(ratio * 100));
      }
    } else {
      // In solid mode: sliding left-to-right smoothly adjusts tone (đậm nhạt):
      // Left (0.0): dark deep shade (v = 0.15)
      // Middle (0.5): current color saturation & value
      // Right (1.0): light pastel tint (s = 0.1, v = 1)
      if (ratio < 0.5) {
        const factor = ratio / 0.5;
        const v = 0.15 + factor * 0.85;
        commitHsv({ ...hsv, v });
      } else {
        const factor = (ratio - 0.5) / 0.5;
        const s = 1 - factor * 0.85;
        commitHsv({ ...hsv, s, v: 1 });
      }
    }
  };

  const onTonePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    toneRef.current?.setPointerCapture(e.pointerId);
    handleTonePointer(e);
  };

  const onTonePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      handleTonePointer(e);
    }
  };

  const onTonePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    toneRef.current?.releasePointerCapture(e.pointerId);
    setIsDraggingStop(null);
    pushRecentColor(hsvToHex8(hsv.h, hsv.s, hsv.v, hsv.a));
    onGestureEnd?.();
  };

  // Colors for rendering Tone / Dual-Stop track
  const toneTrackGradient = useMemo(() => {
    if (mode === 'gradient' && allowGradient) {
      const fromPaint = parseHexAlpha(gradientFrom, '#1A1717FF');
      const toPaint = parseHexAlpha(gradientTo, '#B89C94FF');
      return `linear-gradient(to right, ${fromPaint.css} ${stop1Percent}%, ${toPaint.css} ${stop2Percent}%)`;
    }
    // Solid mode: dark shade to pure hue to light tint
    const darkShade = hsvToRgbString(hsv.h, 1, 0.15);
    const midHue = hsvToRgbString(hsv.h, hsv.s, hsv.v);
    const lightTint = hsvToRgbString(hsv.h, 0.15, 0.98);
    return `linear-gradient(to right, ${darkShade}, ${midHue}, ${lightTint})`;
  }, [mode, allowGradient, gradientFrom, gradientTo, stop1Percent, stop2Percent, hsv.h, hsv.s, hsv.v]);

  // Current color preview for the trigger
  const triggerPreviewStyle = useMemo(() => {
    if (mode === 'gradient' && allowGradient) {
      const fromPaint = parseHexAlpha(gradientFrom, '#1A1717FF');
      const toPaint = parseHexAlpha(gradientTo, '#B89C94FF');
      return {
        background: `linear-gradient(${gradientAngle}deg, ${fromPaint.css}, ${toPaint.css})`,
      };
    }
    const paint = parseHexAlpha(color);
    if (paint.alpha <= 0) {
      return {
        backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        backgroundColor: '#ffffff',
      };
    }
    return {
      background: paint.css,
    };
  }, [mode, allowGradient, color, gradientFrom, gradientTo, gradientAngle]);

  const triggerLabel = useMemo(() => {
    if (mode === 'gradient' && allowGradient) return 'Màu tán sắc';
    const paint = parseHexAlpha(color);
    if (paint.alpha <= 0) return 'Không màu';
    return paint.hex8;
  }, [mode, allowGradient, color]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            data-testid={testId}
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-slate-300 shadow-inner"
              style={triggerPreviewStyle}
            />
            <span className="font-mono text-[11px] uppercase tracking-wide">{triggerLabel}</span>
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-[280px] overflow-hidden rounded-xl border border-slate-200/90 bg-[#F7F8FA] p-0 shadow-2xl"
      >
        {/* TOP TABS: Bên trái "Màu đơn" | Bên phải "Màu tán sắc" */}
        {allowGradient ? (
          <div className="grid grid-cols-2 border-b border-slate-200/90 bg-white">
            <button
              type="button"
              onClick={() => {
                onModeChange?.('solid');
                onGestureEnd?.();
              }}
              className={cn(
                'h-10 text-xs font-semibold tracking-wide transition-all',
                mode === 'solid'
                  ? 'bg-gradient-to-b from-[#cfcfcf] to-[#9e9e9e] text-slate-900 shadow-inner'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              Màu đơn
            </button>

            <button
              type="button"
              onClick={() => {
                onModeChange?.('gradient');
                onGestureEnd?.();
              }}
              className={cn(
                'h-10 text-xs font-semibold tracking-wide transition-all',
                mode === 'gradient'
                  ? 'bg-gradient-to-b from-[#cfcfcf] to-[#9e9e9e] text-slate-900 shadow-inner'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              Màu tán sắc
            </button>
          </div>
        ) : (
          <div className="border-b border-slate-200/90 bg-gradient-to-b from-[#cfcfcf] to-[#9e9e9e] px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-900 shadow-inner">
            Màu đơn
          </div>
        )}

        <div className="space-y-3.5 p-3.5">
          {/* CHỦ ĐỀ (Theme Presets) */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-700">CHỦ ĐỀ</div>
            <div className="flex items-center justify-between">
              {THEME_PRESETS.map((preset, idx) => {
                const isClear = preset === '#00000000';
                return (
                  <button
                    key={idx}
                    type="button"
                    title={isClear ? 'Không màu (Trong suốt)' : preset}
                    onClick={() => {
                      if (isClear && onClear) {
                        onClear();
                      } else {
                        applyHex8(preset);
                      }
                    }}
                    className="relative h-6 w-6 rounded-full border border-slate-300 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    style={
                      isClear
                        ? {
                            backgroundImage: `url('${CHECKERBOARD_SVG}')`,
                            backgroundColor: '#fff',
                          }
                        : { backgroundColor: parseHexAlpha(preset).hex }
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* MÀU GẦN ĐÂY (Recent Colors) */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-700">MÀU GẦN ĐÂY</div>
            <div className="flex items-center justify-between">
              {recents.map((rc, idx) => {
                const paint = parseHexAlpha(rc);
                return (
                  <button
                    key={idx}
                    type="button"
                    title={rc}
                    onClick={() => applyHex8(rc)}
                    className="relative h-6 w-6 rounded-full border border-slate-300 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    style={{
                      backgroundImage: paint.alpha < 1 ? `url('${CHECKERBOARD_SVG}')` : undefined,
                      backgroundColor: paint.hex,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* 2D SATURATION & VALUE CANVAS */}
          <div
            ref={canvasRef}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            className="relative h-[135px] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md shadow-inner"
            style={{
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              backgroundImage: `linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%), linear-gradient(to top, #000 0%, rgba(0,0,0,0) 100%)`,
            }}
          >
            {/* White ring handle */}
            <div
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              style={{
                left: `${Math.round(hsv.s * 100)}%`,
                top: `${Math.round((1 - hsv.v) * 100)}%`,
              }}
            />
          </div>

          {/* RAINBOW HUE SLIDER */}
          <div
            ref={hueRef}
            onPointerDown={onHuePointerDown}
            onPointerMove={onHuePointerMove}
            onPointerUp={onHuePointerUp}
            className="relative h-3.5 w-full cursor-pointer touch-none select-none rounded-full shadow-inner"
            style={{
              background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
            }}
          >
            {/* Thumb */}
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              style={{ left: `${Math.round((hsv.h / 360) * 100)}%` }}
            />
          </div>

          {/* OPACITY / ALPHA SLIDER */}
          <div
            ref={alphaRef}
            onPointerDown={onAlphaPointerDown}
            onPointerMove={onAlphaPointerMove}
            onPointerUp={onAlphaPointerUp}
            className="relative h-3.5 w-full cursor-pointer touch-none select-none rounded-full shadow-inner"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${hsvToRgbString(hsv.h, hsv.s, hsv.v)}), url('${CHECKERBOARD_SVG}')`,
            }}
          >
            {/* Thumb */}
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              style={{ left: `${Math.round(hsv.a * 100)}%` }}
            />
          </div>

          {/* "Ở DƯỚI CÓ THANH KÉO MÀU ĐẬM NHẠT" (Tone / Shade / Dual-Stop Slider) */}
          <div className="relative py-1">
            <div
              ref={toneRef}
              onPointerDown={onTonePointerDown}
              onPointerMove={onTonePointerMove}
              onPointerUp={onTonePointerUp}
              className="relative h-3.5 w-full cursor-pointer touch-none select-none rounded-full shadow-inner"
              style={{ background: toneTrackGradient }}
            >
              {mode === 'gradient' && allowGradient ? (
                <>
                  {/* Stop 1 (Left handle) */}
                  <div
                    role="button"
                    tabIndex={0}
                    title="Điểm màu đầu"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setActiveStop(1);
                      setIsDraggingStop(1);
                      toneRef.current?.setPointerCapture(e.pointerId);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStop(1);
                    }}
                    className={cn(
                      'absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300 shadow-md transition-all cursor-pointer',
                      activeStop === 1
                        ? 'z-10 ring-2 ring-white ring-offset-2 ring-offset-slate-500 scale-110'
                        : 'opacity-90 hover:scale-105',
                    )}
                    style={{
                      left: `${stop1Percent}%`,
                      backgroundColor: parseHexAlpha(gradientFrom).hex,
                      backgroundImage: parseHexAlpha(gradientFrom).alpha < 1 ? `url('${CHECKERBOARD_SVG}')` : undefined,
                    }}
                  />

                  {/* Stop 2 (Right handle) */}
                  <div
                    role="button"
                    tabIndex={0}
                    title="Điểm màu cuối"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setActiveStop(2);
                      setIsDraggingStop(2);
                      toneRef.current?.setPointerCapture(e.pointerId);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStop(2);
                    }}
                    className={cn(
                      'absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300 shadow-md transition-all cursor-pointer',
                      activeStop === 2
                        ? 'z-10 ring-2 ring-white ring-offset-2 ring-offset-slate-500 scale-110'
                        : 'opacity-90 hover:scale-105',
                    )}
                    style={{
                      left: `${stop2Percent}%`,
                      backgroundColor: parseHexAlpha(gradientTo).hex,
                      backgroundImage: parseHexAlpha(gradientTo).alpha < 1 ? `url('${CHECKERBOARD_SVG}')` : undefined,
                    }}
                  />
                </>
              ) : (
                /* Solid mode: Tone / shade draggable thumb ("thanh kéo màu đậm nhạt") */
                <div
                  className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                  style={{
                    left: `${Math.round(hsv.v * (1 - hsv.s * 0.45) * 100)}%`,
                    backgroundColor: hsvToHex8(hsv.h, hsv.s, hsv.v, 1),
                  }}
                />
              )}
            </div>
          </div>

          {/* GRADIENT ANGLE PRESETS (when in gradient mode) */}
          {mode === 'gradient' && allowGradient ? (
            <div className="flex items-center justify-between gap-1 pt-0.5 text-[11px] text-slate-600">
              <span className="text-[10px] font-medium text-slate-500">Hướng:</span>
              {[
                { deg: 0, label: 'Lên' },
                { deg: 90, label: 'Phải' },
                { deg: 135, label: 'Chéo' },
                { deg: 180, label: 'Xuống' },
              ].map(({ deg, label }) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    onGradientChange?.({ angle: deg });
                    onGestureEnd?.();
                  }}
                  className={cn(
                    'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                    gradientAngle === deg
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {/* BOTTOM ROW: Hex inputs + Pipette */}
          <div className="flex items-center gap-1.5 pt-1">
            {/* Hex Input 1 */}
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                spellCheck={false}
                value={hexDraft1}
                aria-label="Mã màu 1"
                onChange={(e) => {
                  const val = e.target.value.trim().toUpperCase();
                  setHexDraft1(val);
                  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)) {
                    if (mode === 'gradient' && allowGradient) {
                      onGradientChange?.({ from: parseHexAlpha(val).hex8 });
                    } else {
                      onColorChange?.(parseHexAlpha(val).hex8);
                    }
                  }
                }}
                onBlur={() => {
                  if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hexDraft1.trim())) {
                    setHexDraft1(mode === 'gradient' ? gradientFrom : currentColorHex8);
                  } else {
                    applyHex8(hexDraft1.trim());
                  }
                }}
                className={cn(
                  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-xs uppercase text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                  mode === 'gradient' && allowGradient && activeStop === 1 && 'border-sky-500 ring-1 ring-sky-500/30',
                )}
              />
            </div>

            {/* Pipette (Eyedropper) Button */}
            <button
              type="button"
              title="Lấy màu từ màn hình"
              aria-label="Lấy màu từ màn hình"
              onClick={handleEyedropper}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <Pipette className="h-4 w-4" />
            </button>

            {/* Hex Input 2 (in Gradient mode) */}
            {mode === 'gradient' && allowGradient ? (
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  spellCheck={false}
                  value={hexDraft2}
                  aria-label="Mã màu 2"
                  onChange={(e) => {
                    const val = e.target.value.trim().toUpperCase();
                    setHexDraft2(val);
                    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)) {
                      onGradientChange?.({ to: parseHexAlpha(val).hex8 });
                    }
                  }}
                  onBlur={() => {
                    if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hexDraft2.trim())) {
                      setHexDraft2(gradientTo);
                    } else {
                      onGradientChange?.({ to: parseHexAlpha(hexDraft2.trim()).hex8 });
                    }
                  }}
                  className={cn(
                    'h-8 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-xs uppercase text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                    activeStop === 2 && 'border-sky-500 ring-1 ring-sky-500/30',
                  )}
                />
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
