'use client';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
/** A copied group reserves its own flow row; member offsets stay local to that row. */
export function LandingPageFlowCopy({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const sync = () => {
      const top = root.getBoundingClientRect().top;
      const scale = root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth : 1;
      const nodes = Array.from(root.children) as HTMLElement[];
      const height = Math.max(
        1,
        ...nodes.map((n) => (n.getBoundingClientRect().bottom - top) / Math.max(0.05, scale)),
      );
      const next = Math.ceil(height + 12);
      if (Math.abs(root.offsetHeight - next) > 1) root.style.height = next + 'px';
    };
    const ro = new ResizeObserver(sync);
    Array.from(root.children).forEach((n) => ro.observe(n));
    sync();
    return () => ro.disconnect();
  }, [children]);
  return (
    <div
      ref={ref}
      data-lp-flow-copy="1"
      style={{ position: 'relative', width: '100%', minWidth: 0, minHeight: 1, margin: '12px 0' }}
    >
      {children}
    </div>
  );
}
