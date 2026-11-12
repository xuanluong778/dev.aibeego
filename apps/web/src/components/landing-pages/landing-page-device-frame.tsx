'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

export type LandingPageDeviceKind = 'mobile' | 'tablet';

/** Logical CSS px for the device screen (content viewport). */
export const LP_DEVICE_SCREEN = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
} as const;

const BEZEL = {
  mobile: 10,
  tablet: 14,
} as const;

/** Keep device previews compact while preserving their logical viewport sizes. */
const DEVICE_SCALE_MAX = {
  mobile: 1,
  tablet: 0.85,
} as const;

type Props = {
  device: LandingPageDeviceKind;
  children: ReactNode;
  className?: string;
  chrome?: boolean;
};

/**
 * Builder-only device chrome (iPhone Pro–style mobile / slim tablet).
 * Must never wrap public/publish render paths.
 *
 * Fit-scale uses transform:scale + a layout spacer. Scale/contentHeight updates
 * are coalesced on rAF and skip setState when values are unchanged to avoid
 * render loops with ResizeObserver.
 */
export function LandingPageDeviceFrame({ device, children, className, chrome = true }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(1);
  const contentHeightRef = useRef<number>(LP_DEVICE_SCREEN[device].height);
  const applyingRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState<number>(LP_DEVICE_SCREEN[device].height);
  const rafRef = useRef<number | null>(null);

  const screen = LP_DEVICE_SCREEN[device];
  const bezel = chrome ? BEZEL[device] : 0;
  const frameW = screen.width + bezel * 2;
  const frameH = screen.height + bezel * 2;
  const outerRadius = chrome ? (device === 'mobile' ? 44 : 28) : 0;
  const screenRadius = chrome ? (device === 'mobile' ? 36 : 20) : 0;
  const screenHeight = Math.max(screen.height, contentHeight);
  const shellHeight = screenHeight + bezel * 2;

  const applyDomScale = useCallback(
    (nextScale: number, nextContentH: number) => {
      const shell = shellRef.current;
      const slot = slotRef.current;
      if (!shell || !slot) return;
      applyingRef.current = true;
      const sh = Math.max(screen.height, nextContentH) + bezel * 2;
      // Layout spacer = visual size after scale (avoids empty scroll gaps).
      slot.style.width = `${Math.ceil(frameW * nextScale)}px`;
      slot.style.height = `${Math.ceil(sh * nextScale)}px`;
      shell.style.width = `${frameW}px`;
      shell.style.minHeight = `${frameH}px`;
      shell.style.height = `${sh}px`;
      shell.style.transformOrigin = 'top center';
      shell.style.transform = nextScale !== 1 ? `scale(${nextScale})` : '';
      shell.setAttribute('data-lp-device-scale', String(nextScale));
      requestAnimationFrame(() => {
        applyingRef.current = false;
      });
    },
    [bezel, frameH, frameW, screen.height],
  );

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (applyingRef.current) return;
      const host = hostRef.current;
      const content = contentRef.current;
      if (!host) return;

      // Host stays full width of the (stable) zoom layer — scale from that,
      // never from the scaled slot width (that shrinks host → pulse loop).
      const availW = Math.max(0, host.clientWidth - 8);
      let nextScale = 1;
      if (availW >= 40) {
        const capped = Math.min(DEVICE_SCALE_MAX[device], availW / frameW);
        nextScale = Number.isFinite(capped) && capped > 0 ? capped : 1;
      }
      // Hysteresis: ignore sub-pixel scale jitter.
      if (Math.abs(nextScale - scaleRef.current) < 0.004) {
        nextScale = scaleRef.current;
      }

      // Unscaled layout height — NEVER getBoundingClientRect (returns scaled visual px
      // and can feedback-loop with transform scale).
      let nextH = screen.height;
      if (content) {
        nextH = Math.max(screen.height, Math.ceil(content.offsetHeight || 0));
      }

      const scaleChanged = Math.abs(nextScale - scaleRef.current) > 0.001;
      const heightChanged = nextH !== contentHeightRef.current;
      if (!scaleChanged && !heightChanged) return;

      scaleRef.current = nextScale;
      contentHeightRef.current = nextH;
      applyDomScale(nextScale, nextH);
      if (scaleChanged) setScale(nextScale);
      if (heightChanged) setContentHeight(nextH);
    });
  }, [applyDomScale, device, frameW, screen.height]);

  useEffect(() => {
    scaleRef.current = 1;
    contentHeightRef.current = LP_DEVICE_SCREEN[device].height;
    setScale(1);
    setContentHeight(LP_DEVICE_SCREEN[device].height);
    scheduleRecompute();
  }, [device, scheduleRecompute]);

  useEffect(() => {
    scheduleRecompute();
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (applyingRef.current) return;
      scheduleRecompute();
    });
    // Only observe the stable host width — not content height churn from
    // our own scale writes (content RO + setState was feeding zoom pulse).
    ro.observe(host);
    if (content) ro.observe(content);
    window.addEventListener('resize', scheduleRecompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleRecompute);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleRecompute, device]);

  const shellStyle: CSSProperties = {
    width: frameW,
    minHeight: frameH,
    height: shellHeight,
    borderRadius: outerRadius,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top center',
  };

  const layoutStyle: CSSProperties = {
    width: frameW * scale,
    height: shellHeight * scale,
  };

  return (
    <div
      ref={hostRef}
      className={
        'flex min-h-[560px] w-full items-start justify-center py-2 ' +
        (className || '')
      }
      data-lp-device-frame-host="1"
      data-lp-device={device}
    >
      <div
        ref={slotRef}
        style={layoutStyle}
        className="relative mx-auto flex shrink-0 justify-center"
        data-lp-device-scale-slot="1"
      >
        <div
          ref={shellRef}
          className="relative shrink-0 bg-[#1c1c1e] shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
          style={shellStyle}
          data-lp-device-frame="1"
          data-lp-device-kind={device}
          data-lp-device-scale={String(scale)}
          aria-label={device === 'mobile' ? 'Mobile phone preview' : 'Tablet preview'}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/15"
            aria-hidden
          />
          {chrome && device === 'mobile' ? (
            <>
              <span
                className="pointer-events-none absolute -left-[2px] top-[120px] h-7 w-[2px] rounded-l bg-[#3a3a3c]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -left-[2px] top-[168px] h-12 w-[2px] rounded-l bg-[#3a3a3c]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -left-[2px] top-[228px] h-12 w-[2px] rounded-l bg-[#3a3a3c]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -right-[2px] top-[180px] h-16 w-[2px] rounded-r bg-[#3a3a3c]"
                aria-hidden
              />
            </>
          ) : null}

          <div
            className="absolute bg-white"
            style={{
              top: bezel,
              left: bezel,
              width: screen.width,
              minHeight: screen.height,
              height: screenHeight,
              borderRadius: screenRadius,
            }}
            data-lp-device-screen="1"
            data-lp-device-screen-w={screen.width}
            data-lp-device-screen-h={screenHeight}
          >
            {chrome && device === 'mobile' ? (
              <div
                className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black shadow-sm"
                data-lp-device-notch="1"
                aria-hidden
              />
            ) : chrome ? (
              <div
                className="pointer-events-none absolute left-1/2 top-2 z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-black/80"
                data-lp-device-camera="1"
                aria-hidden
              />
            ) : null}

            <div
              className="mx-auto h-auto w-full max-w-full"
              data-lp-device-no-inner-scroll="1"
            >
              <div
                ref={contentRef}
                className="mx-auto min-h-full w-full max-w-full"
                data-lp-device-content="1"
                style={{ width: screen.width, minHeight: screen.height, marginLeft: 'auto', marginRight: 'auto' }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
