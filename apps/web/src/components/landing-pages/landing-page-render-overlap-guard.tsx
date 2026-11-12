'use client';
import { useLayoutEffect, useRef } from 'react';
import type { LandingPageSpec } from '@marketingspa/shared';
import { collisionNodes, elementRect, intersects, isUserPlacedLayoutField } from './landing-page-no-overlap';
/** Render-only safety net for inspector edits / later text reflow. Never writes draft data. */
export function LandingPageRenderOverlapGuard({ spec }: { spec: LandingPageSpec }) {
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = marker.current?.closest<HTMLElement>('[data-lp-canvas-root]');
    if (!root) return;
    let raf = 0;
    let mo: MutationObserver | undefined;
    const check = () => {
      raf = 0;
      if (
        root.querySelector(
          '[data-lp-free-dragging="1"],[data-lp-free-resizing="1"],[data-lp-free-rotating="1"],[data-lp-heading-resizing="1"]',
        ) ||
        document.documentElement.hasAttribute('data-lp-group-dragging')
      )
        return;
      mo?.disconnect();
      try {
        const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-lp-free-id]'));
        for (const n of nodes) {
          if (n.dataset.lpOverlapBase !== undefined) {
            if (n.style.transform === n.dataset.lpOverlapOverride)
              n.style.transform = n.dataset.lpOverlapBase;
            delete n.dataset.lpOverlapBase;
            delete n.dataset.lpOverlapOverride;
          }
        }
        for (const n of nodes) {
          const key = n.dataset.lpFreeId || '',
            split = key.indexOf('::');
          if (split < 1) continue;
          const block = spec.blocks.find((b) => b.id === key.slice(0, split)),
            field = key.slice(split + 2),
            fl = spec.meta?.elementFreeLayouts?.[key];
          const items = ((block &&
            ('items' in block ? block.items : 'plans' in block ? block.plans : [])) ||
            []) as Array<{ id: string; freeLayout?: { x: number; y: number; rotate?: number } }>;
          const item = items.find((i) => i.id === field);
          // Never undo a position the user just dropped: resetting transform to
          // 'none' threw the box back to its old flow slot (the "jump" on drop).
          if (isUserPlacedLayoutField(block, field)) continue;
          if (
            !fl?.x &&
            !fl?.y &&
            !fl?.rotate &&
            !item?.freeLayout?.x &&
            !item?.freeLayout?.y &&
            !item?.freeLayout?.rotate
          )
            continue;
          const r = elementRect(n);
          if (!r.width || !r.height) continue;
          if (collisionNodes(n).some((o) => intersects(r, elementRect(o), 1))) {
            n.dataset.lpOverlapBase = n.style.transform;
            n.dataset.lpOverlapOverride = 'none';
            n.style.transform = 'none';
          }
        }
      } finally {
        mo?.observe(root, { subtree: true, childList: true, characterData: true });
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    const ro = new ResizeObserver(queue);
    ro.observe(root);
    root.querySelectorAll('[data-lp-free-id]').forEach((n) => ro.observe(n));
    mo = new MutationObserver(queue);
    mo.observe(root, { subtree: true, childList: true, characterData: true });
    window.addEventListener('resize', queue);
    document.addEventListener('pointerup', queue, true);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo?.disconnect();
      window.removeEventListener('resize', queue);
      document.removeEventListener('pointerup', queue, true);
    };
  }, [spec]);
  return <span hidden ref={marker} data-lp-render-overlap-guard />;
}
