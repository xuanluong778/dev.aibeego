'use client';
import {
  isFloatingTextLayerBlock,
  type LandingPageSpec,
  type LandingPageBlock,
} from '@marketingspa/shared';
export type ClearRect = { left: number; top: number; width: number; height: number };
function acceptedFields(block: LandingPageBlock | undefined): Set<string> {
  try {
    const a = JSON.parse(
      String((block?.style as Record<string, unknown> | undefined)?.lpAcceptedLayoutFields || '[]'),
    );
    return new Set(Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}
/** True when the user explicitly moved/resized this field (drag/drop commit). */
export function isUserPlacedLayoutField(block: LandingPageBlock | undefined, field: string): boolean {
  return acceptedFields(block).has(field);
}
export function acceptsTextSize(style: unknown, field: string): boolean {
  return acceptedFields({ style } as LandingPageBlock).has('__size:' + field);
}
export function visibleStoredLayout<T extends { x: number; y: number; rotate?: number }>(
  block: LandingPageBlock | undefined,
  field: string,
  layout: T,
): T {
  const flow =
    block &&
    (block.sectionPlacement ||
      Number(block.style?.lpContentColumns) > 1 ||
      ('items' in block && block.items?.length) ||
      ('plans' in block && block.plans?.length) ||
      isFloatingTextLayerBlock(block));
  return !flow || acceptedFields(block).has(field) ? layout : { ...layout, x: 0, y: 0, rotate: 0 };
}
/** Read-only view projection. The original draft and saved coordinates are never changed. */
export function projectLandingFlow(spec: LandingPageSpec): LandingPageSpec {
  let changed = false;
  const layouts = { ...spec.meta?.elementFreeLayouts };
  const blocks = spec.blocks.map((block) => {
    const flow = Boolean(
      block.sectionPlacement ||
      Number(block.style?.lpContentColumns) > 1 ||
      ('items' in block && block.items?.length) ||
      ('plans' in block && block.plans?.length),
    );
    const floating = !block.sectionPlacement && isFloatingTextLayerBlock(block);
    if (!flow && !floating) return block;
    let next = block;
    for (const key of Object.keys(layouts))
      if (key.startsWith(block.id + '::')) {
        const old = layouts[key]!,
          view = visibleStoredLayout(block, key.slice(block.id.length + 2), old);
        if (old.x !== view.x || old.y !== view.y || old.rotate !== view.rotate) {
          layouts[key] = view;
          changed = true;
        }
      }
    for (const prop of ['items', 'plans'] as const) {
      const rows = (block as unknown as Record<string, unknown>)[prop];
      if (Array.isArray(rows)) {
        const view = rows.map((row) =>
          row.freeLayout
            ? { ...row, freeLayout: visibleStoredLayout(block, row.id, row.freeLayout) }
            : row,
        );
        if (
          view.some(
            (v, i) =>
              v.freeLayout?.x !== rows[i].freeLayout?.x ||
              v.freeLayout?.y !== rows[i].freeLayout?.y ||
              v.freeLayout?.rotate !== rows[i].freeLayout?.rotate,
          )
        ) {
          next = { ...next, [prop]: view } as unknown as LandingPageBlock;
          changed = true;
        }
      }
    }
    if (floating && !acceptedFields(block).has('__section') && block.positionMode === 'free') {
      next = { ...next };
      delete next.positionMode;
      delete next.freeLayout;
      delete next.responsiveFreeLayout;
      changed = true;
    }
    return next;
  });
  return changed ? { ...spec, blocks, meta: { ...spec.meta, elementFreeLayouts: layouts } } : spec;
}
/** Only invoked by an explicit user move/resize. Accept just that edited target. */
export function prepareFlowEdit(
  spec: LandingPageSpec,
  blockId: string,
  field: string,
): LandingPageSpec {
  const block = spec.blocks.find((b) => b.id === blockId);
  if (!block) return spec;
  const fields = acceptedFields(block);
  if (fields.has(field)) return spec;
  const view = projectLandingFlow(spec);
  fields.add(field);
  const projected = view.blocks.find((b) => b.id === blockId)!;
  const layouts = { ...spec.meta?.elementFreeLayouts },
    key = blockId + '::' + field;
  if (view.meta?.elementFreeLayouts?.[key]) layouts[key] = view.meta.elementFreeLayouts[key]!;
  return {
    ...spec,
    meta: { ...spec.meta, elementFreeLayouts: layouts },
    blocks: spec.blocks.map((b) => {
      if (b.id !== blockId) return b;
      let next = {
        ...b,
        style: { ...b.style, lpAcceptedLayoutFields: JSON.stringify([...fields]) },
      } as unknown as LandingPageBlock;
      if (field === '__section') {
        next = { ...projected, style: next.style };
      }
      for (const prop of ['items', 'plans'] as const) {
        const rows = (b as unknown as Record<string, unknown>)[prop],
          v = (projected as unknown as Record<string, unknown>)[prop];
        if (Array.isArray(rows) && Array.isArray(v))
          next = {
            ...next,
            [prop]: rows.map((row) =>
              row.id === field ? v.find((it) => it.id === field) || row : row,
            ),
          } as unknown as LandingPageBlock;
      }
      return next;
    }),
  };
}
export function intersects(a: ClearRect, b: ClearRect, gap = 2) {
  return (
    a.left < b.left + b.width + gap &&
    a.left + a.width > b.left - gap &&
    a.top < b.top + b.height + gap &&
    a.top + a.height > b.top - gap
  );
}
export function elementRect(n: Element): ClearRect {
  const r = n.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}
const ACTORS =
  '[data-lp-item-id],[data-lp-item-id]>:not(button):not([data-lp-transform-chrome]),[data-lp-section-element],[data-lp-free-child],[data-lp-free-box],[data-lp-section-chrome="1"],[data-lp-flow-copy]';
export function collisionNodes(el: HTMLElement, exclude: HTMLElement[] = []): HTMLElement[] {
  const root = el.closest<HTMLElement>('[data-lp-canvas-root]');
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(ACTORS))
    .filter(
      (n) =>
        n !== el &&
        !n.contains(el) &&
        !el.contains(n) &&
        !exclude.some((e) => e === n || e.contains(n) || n.contains(e)) &&
        !n.closest('[data-lp-transform-chrome]') &&
        // Full-width row wrappers are layout containers, not painted obstacles —
        // their children are matched individually.
        !n.matches('[data-lp-flow-copy]') &&
        // Text layout wrappers reserve their old flow slot after a move; only
        // their painted descendants are obstacles. Native boxes stay solid.
        !(
          n.matches('[data-lp-section-element]') &&
          n.querySelector('[data-lp-free-child],[data-lp-free-box]')
        ),
    )
    .filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && getComputedStyle(n).visibility !== 'hidden';
    });
}
export function protectFreeRect(
  el: HTMLElement,
  from: ClearRect,
  to: ClearRect,
  bounds: ClearRect,
  surface: DOMRect,
  scale: number,
  exclude: HTMLElement[] = [],
  intent?: { x: number; y: number },
): ClearRect {
  if (!el.closest('[data-lp-non-overlap="1"]')) return to;
  const resizing = Math.abs(from.width - to.width) > 1 || Math.abs(from.height - to.height) > 1;
  if (!exclude.length && !resizing) {
    // CSS columns can make a box wider than its saved size. Use its painted
    // footprint so the opposite edge also clears the neighbouring box.
    const painted = el.getBoundingClientRect();
    if (painted.width > 1 && painted.height > 1) {
      from = { ...from, width: painted.width / scale, height: painted.height / scale };
      to = { ...to, width: painted.width / scale, height: painted.height / scale };
    }
  }
  const obstacles = collisionNodes(el, exclude).map((n) => {
    const r = n.getBoundingClientRect();
    return {
      left: (r.left - surface.left) / scale,
      top: (r.top - surface.top) / scale,
      width: r.width / scale,
      height: r.height / scale,
    };
  });
  const box = el.closest<HTMLElement>('[data-lp-item-id]');
  if (box && box !== el) {
    const r = box.getBoundingClientRect();
    bounds = {
      left: (r.left - surface.left) / scale,
      top: (r.top - surface.top) / scale,
      width: r.width / scale,
      height: r.height / scale,
    };
  }
  const target = {
    ...to,
    left: Math.max(bounds.left, Math.min(bounds.left + bounds.width - to.width, to.left)),
    top: Math.max(bounds.top, Math.min(bounds.top + bounds.height - to.height, to.top)),
  };
  const valid = (r: ClearRect) => !obstacles.some((o) => intersects(r, o, 2));
  // The desired position may be clear even when the pointer crossed a box.
  // Judge the destination rather than blocking the whole pointer path.
  if (valid(target)) return target;
  if (Math.abs(from.width - target.width) > 1 || Math.abs(from.height - target.height) > 1)
    return from;
  const clampX = (x: number) =>
    Math.max(bounds.left, Math.min(bounds.left + bounds.width - to.width, x));
  const clampY = (y: number) =>
    Math.max(bounds.top, Math.min(bounds.top + bounds.height - to.height, y));
  // Snap to the nearest empty edge while inside an occupied area. Once the
  // pointer passes its midpoint, the opposite edge becomes nearer and wins.
  const gap = 3;
  const nearby = obstacles.filter((o) => intersects(target, o, 2));
  const xs = [
    ...new Set(
      [...nearby.flatMap((o) => [o.left - to.width - gap, o.left + o.width + gap])].map(clampX),
    ),
  ];
  const ys = [
    ...new Set(
      [...nearby.flatMap((o) => [o.top - to.height - gap, o.top + o.height + gap])].map(clampY),
    ),
  ];
  const nearest = (candidates: ClearRect[]) =>
    candidates
      .sort(
        (a, b) =>
          Math.hypot(a.left - target.left, a.top - target.top) -
          Math.hypot(b.left - target.left, b.top - target.top),
      )
      .find(valid);
  const horizontal = xs.map((left) => ({ ...target, left }));
  const vertical = ys.map((top) => ({ ...target, top }));
  const delta = intent || { x: target.left - from.left, y: target.top - from.top };
  const alongX = Math.abs(delta.x) >= Math.abs(delta.y);
  // Keep corrections on the intended axis. Do not jump into a distant row or
  // page corner when the pointer enters a crowded area.
  return nearest(alongX ? horizontal : vertical) || from;
}
