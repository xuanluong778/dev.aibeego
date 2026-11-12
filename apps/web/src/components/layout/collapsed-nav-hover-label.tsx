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

type CollapsedNavHoverLabelProps = {
  /** Translated menu title shown on hover */
  label: string;
  /** Only render hover label when collapsed rail is active */
  enabled: boolean;
  children: ReactNode;
};

/**
 * Collapsed Main App Sidebar: hover icon → slide-right label via fixed portal
 * (avoids overflow clipping; does not change sidebar width).
 */
export function CollapsedNavHoverLabel({
  label,
  enabled,
  children,
}: CollapsedNavHoverLabelProps) {
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
    const onScrollOrResize = () => {
      // Hide immediately if layout moves (scroll/rail) — avoids stale floating label
      setShown(false);
      setOpen(false);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePos]);

  const show = () => {
    if (!enabled) return;
    updatePos();
    setOpen(true);
    // next frame → fade+slide in (150ms)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });
  };

  const hide = () => {
    setShown(false);
    setOpen(false);
  };

  if (!enabled) return <>{children}</>;

  const child =
    isValidElement(children) &&
    cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': open ? tooltipId : undefined,
    });

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      data-collapsed-nav-hover
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
              data-collapsed-menu-hover-label
              data-label={label}
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
                'pointer-events-none whitespace-nowrap rounded-md px-3 py-1.5',
                'bg-[#0A3D30] text-sm font-medium text-white',
                'border border-white/15 shadow-lg shadow-black/25',
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
