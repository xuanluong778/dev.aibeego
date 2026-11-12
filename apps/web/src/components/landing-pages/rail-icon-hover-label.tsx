'use client';

import { createPortal } from 'react-dom';
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type RailIconHoverLabelProps = {
  label: string;
  children: ReactNode;
};

/** LP toolbar rail: hover icon → full label slides right via fixed portal (never clipped). */
export function RailIconHoverLabel({ label, children }: RailIconHoverLabelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  const updatePos = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.top + r.height / 2,
      left: r.right + 10,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const hide = () => {
      setShown(false);
      setOpen(false);
    };
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open, updatePos]);

  const show = () => {
    updatePos();
    setOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });
  };

  const hide = () => {
    setShown(false);
    setOpen(false);
  };

  const child =
    isValidElement(children) &&
    cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': open ? tooltipId : undefined,
    });

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      data-lp-rail-hover-wrap
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {child || children}
      {mounted && open
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              data-lp-rail-tooltip
              data-lp-rail-tooltip-label={label}
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                transform: `translateY(-50%) translateX(${shown ? '0' : '-6px'})`,
                opacity: shown ? 1 : 0,
                zIndex: 200,
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
              }}
              className={cn(
                'pointer-events-none w-max max-w-[min(320px,calc(100vw-2rem))] whitespace-normal rounded-md px-3 py-1.5',
                'bg-zinc-900 text-xs font-medium leading-snug text-white shadow-lg shadow-black/25',
              )}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
