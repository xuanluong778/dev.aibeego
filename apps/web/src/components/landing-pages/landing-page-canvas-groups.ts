'use client';
import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageFreeLayout,
} from '@marketingspa/shared';
import { FREE_LAYOUT_OFFSET_BOUNDS } from './landing-page-free-drag';
import { isFloatingTextLayerBlock } from '@marketingspa/shared';
import {
  elementFromField,
  lpSelectionKey,
  normalizeLpSelectionTarget,
  parseLpSelectionKey,
  type LpSelectionTarget,
} from './landing-page-canvas-selection';

export type CanvasElementGroup = { id: string; ownerId: string; boxKey: string; members: string[] };
export type CanvasMove = { target: LpSelectionTarget; dx: number; dy: number };
const BOX_SELECTOR =
  '[data-lp-content-column],[data-lp-item-id],[data-lp-box-container],[data-lp-box-block],[data-lp-hero-copy],[data-lp-container-inner],[data-lp-form-copy]';
export function targetKey(target: LpSelectionTarget) {
  return lpSelectionKey(normalizeLpSelectionTarget(target));
}
export function targetField(target: LpSelectionTarget) {
  return normalizeLpSelectionTarget(target).field;
}
export function targetIsLocked(spec: LandingPageSpec, target: LpSelectionTarget): boolean {
  const block = spec.blocks.find((b) => b.id === target.blockId);
  return Boolean(
    block?.locked ||
    (block?.sectionPlacement &&
      spec.blocks.find((b) => b.id === block.sectionPlacement!.sectionId)?.locked) ||
    spec.meta?.elementLocked?.[`${target.blockId}::${targetField(target) || target.element}`],
  );
}
export function targetIsHidden(spec: LandingPageSpec, target: LpSelectionTarget): boolean {
  const block = spec.blocks.find((b) => b.id === target.blockId);
  return (
    !block ||
    !block.enabled ||
    Boolean(
      block.hidden ||
      spec.meta?.elementHidden?.[`${target.blockId}::${targetField(target) || target.element}`],
    )
  );
}
export function findCanvasTargetNode(
  target: LpSelectionTarget | null | undefined,
  root: ParentNode = document,
): HTMLElement | null {
  if (!target) return null;
  const field = targetField(target);
  if (field) {
    const nodes = root.querySelectorAll<HTMLElement>(
      `[data-lp-inline-field="${CSS.escape(field)}"]`,
    );
    for (const node of nodes)
      if (node.getAttribute('data-lp-element-id')?.startsWith(`${target.blockId}::`)) {
        if (target.element === 'cta') {
          const button = node.closest<HTMLElement>(
            '[data-lp-element-kind="button"][data-lp-free-id]',
          );
          if (button) return button;
        }
        return node.closest<HTMLElement>('[data-lp-free-child][data-lp-free-id]') || node;
      }
  }
  const nodes = root.querySelectorAll<HTMLElement>(
    `[data-lp-element-id="${CSS.escape(`${target.blockId}::${target.element}`)}"]`,
  );
  return (
    Array.from(nodes).find((n) => n.hasAttribute('data-lp-free-id')) ||
    nodes[0] ||
    root.querySelector<HTMLElement>(
      `[data-lp-section-chrome="1"][data-lp-block-id="${CSS.escape(target.blockId)}"]`,
    )
  );
}
export function selectionBox(node: HTMLElement | null | undefined): HTMLElement | null {
  let parent = node?.parentElement || null;
  while (parent) {
    if (parent.matches(BOX_SELECTOR)) {
      const implementation = parent.closest('[data-lp-section-element]');
      if (
        !implementation ||
        parent.matches(
          '[data-lp-content-column],[data-lp-item-id],[data-lp-box-container],[data-lp-box-block]',
        )
      )
        return parent;
    }
    if (parent.matches('[data-lp-section-chrome="1"]')) return parent;
    parent = parent.parentElement;
  }
  return null;
}
export function boxIdentity(box: HTMLElement): { ownerId: string; boxKey: string } | null {
  const owner = box.closest<HTMLElement>('[data-lp-section-chrome="1"]');
  const ownerId = owner?.getAttribute('data-lp-block-id');
  if (!owner || !ownerId) return null;
  const path: number[] = [];
  let node: HTMLElement | null = box;
  while (node && node !== owner) {
    path.unshift(Array.from(node.parentElement?.children || []).indexOf(node));
    node = node.parentElement;
  }
  return { ownerId, boxKey: `${ownerId}/${path.join('.')}` };
}
export function collectBoxTargets(spec: LandingPageSpec, box: HTMLElement): LpSelectionTarget[] {
  const result = new Map<string, LpSelectionTarget>();
  for (const node of Array.from(
    box.querySelectorAll<HTMLElement>('[data-lp-inline-field],[data-lp-element-id]'),
  )) {
    if (node.closest('[data-lp-group-selection-hit],[data-lp-transform-chrome]')) continue;
    const eid = node.getAttribute('data-lp-element-id');
    if (!eid?.includes('::')) continue;
    const split = eid.indexOf('::'),
      blockId = eid.slice(0, split),
      raw = eid.slice(split + 2);
    const field =
      node.getAttribute('data-lp-inline-field') ||
      node.getAttribute('data-lp-element-field') ||
      undefined;
    if (!field && node.contains(node.querySelector('[data-lp-inline-field]'))) continue;
    if (
      !field &&
      !['image', 'button', 'box'].includes(node.getAttribute('data-lp-element-kind') || '')
    )
      continue;
    const target = normalizeLpSelectionTarget({
      blockId,
      element: field ? elementFromField(field) : (raw as LpSelectionTarget['element']),
      field,
    });
    if (targetIsHidden(spec, target) || targetIsLocked(spec, target)) continue;
    const shell = findCanvasTargetNode(target, box);
    if (!shell || selectionBox(shell) !== box || !shell.hasAttribute('data-lp-free-id')) continue;
    const r = shell.getBoundingClientRect(),
      style = getComputedStyle(shell);
    if (
      !r.width ||
      !r.height ||
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      shell.closest('[hidden],[data-lp-text-hidden="1"]')
    )
      continue;
    result.set(targetKey(target), target);
  }
  return [...result.values()];
}
export function readCanvasGroups(spec: LandingPageSpec): CanvasElementGroup[] {
  const groups: CanvasElementGroup[] = [];
  for (const block of spec.blocks) {
    try {
      const rows: unknown = JSON.parse(String(block.style?.lpElementGroups || '[]'));
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (
          !row ||
          typeof row.id !== 'string' ||
          typeof row.boxKey !== 'string' ||
          !Array.isArray(row.members)
        )
          continue;
        const members = [
          ...new Set<string>(
            row.members.filter(
              (key: unknown): key is string => typeof key === 'string' && key.length < 320,
            ),
          ),
        ].filter((key) => {
          const target = parseLpSelectionKey(key);
          return target && !targetIsHidden(spec, target);
        });
        if (members.length > 1)
          groups.push({ id: row.id, ownerId: block.id, boxKey: row.boxKey, members });
      }
    } catch {
      /* Ignore malformed legacy style metadata. */
    }
  }
  return groups;
}
export function writeCanvasGroups(
  spec: LandingPageSpec,
  groups: CanvasElementGroup[],
): LandingPageSpec {
  return {
    ...spec,
    blocks: spec.blocks.map((block) => {
      const style = { ...block.style },
        rows = groups.filter((g) => g.ownerId === block.id);
      if (rows.length)
        style.lpElementGroups = JSON.stringify(rows.map(({ ownerId, ...row }) => row));
      else delete style.lpElementGroups;
      return { ...block, style } as LandingPageBlock;
    }),
  };
}
export function groupForSelection(
  spec: LandingPageSpec,
  keys: string[],
): CanvasElementGroup | null {
  return (
    readCanvasGroups(spec).find(
      (group) =>
        group.members.length === keys.length && group.members.every((key) => keys.includes(key)),
    ) || null
  );
}
export function canGroupTargets(spec: LandingPageSpec, targets: LpSelectionTarget[]): boolean {
  if (
    targets.some(
      (target) =>
        !target.field && target.element !== 'image' && !String(target.element).startsWith('grid:'),
    )
  )
    return false;
  if (targets.length < 2 || targets.some((t) => targetIsHidden(spec, t) || targetIsLocked(spec, t)))
    return false;
  const nodes = targets.map((t) => findCanvasTargetNode(t));
  if (nodes.some((n) => !n?.hasAttribute('data-lp-free-id'))) return false;
  const box = selectionBox(nodes[0]);
  return Boolean(
    box &&
    nodes.every((n) => selectionBox(n) === box) &&
    nodes.every(
      (n, i) => !nodes.some((other, j) => i !== j && (n!.contains(other) || other!.contains(n))),
    ),
  );
}
export function applyCanvasMoves(
  spec: LandingPageSpec,
  moves: CanvasMove[],
  placeCopies = false,
): LandingPageSpec {
  const layouts = { ...spec.meta?.elementFreeLayouts };
  let blocks = [...spec.blocks];
  for (const move of moves) {
    const node = findCanvasTargetNode(move.target),
      freeId = node?.getAttribute('data-lp-free-id');
    const block = blocks.find((b) => b.id === move.target.blockId);
    if (!block || targetIsLocked(spec, move.target) || !freeId) continue;
    if (placeCopies && block.style?.lpCanvasAbsolute === '1') {
      blocks = blocks.map((row) =>
        row.id === block.id
          ? ({
              ...row,
              style: {
                ...row.style,
                lpCanvasX: String(Math.round((Number(row.style?.lpCanvasX) || 0) + move.dx)),
                lpCanvasY: String(Math.round((Number(row.style?.lpCanvasY) || 0) + move.dy)),
              },
            } as LandingPageBlock)
          : row,
      );
    } else if (
      !block.sectionPlacement &&
      isFloatingTextLayerBlock(block) &&
      block.positionMode === 'free' &&
      block.freeLayout
    ) {
      blocks = blocks.map((b) =>
        b.id === block.id
          ? ({
              ...b,
              freeLayout: {
                ...block.freeLayout!,
                x: Math.round(block.freeLayout!.x + move.dx),
                y: Math.round(block.freeLayout!.y + move.dy),
              },
            } as LandingPageBlock)
          : b,
      );
    } else {
      const layout: LandingPageFreeLayout = layouts[freeId] || { x: 0, y: 0 };
      layouts[freeId] = {
        ...layout,
        x: Math.max(
          -FREE_LAYOUT_OFFSET_BOUNDS.maxAbsX,
          Math.min(FREE_LAYOUT_OFFSET_BOUNDS.maxAbsX, Math.round(layout.x + move.dx)),
        ),
        y: Math.max(
          -FREE_LAYOUT_OFFSET_BOUNDS.maxAbsPos,
          Math.min(FREE_LAYOUT_OFFSET_BOUNDS.maxAbsPos, Math.round(layout.y + move.dy)),
        ),
      };
    }
  }
  return { ...spec, blocks, meta: { ...spec.meta, elementFreeLayouts: layouts } };
}
export function selectionRect(targets: LpSelectionTarget[]) {
  const rects = targets
    .map((t) => findCanvasTargetNode(t)?.getBoundingClientRect())
    .filter((r): r is DOMRect => Boolean(r?.width && r?.height));
  if (rects.length !== targets.length) return null;
  const left = Math.min(...rects.map((r) => r.left)),
    top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right)),
    bottom = Math.max(...rects.map((r) => r.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

export function readCanvasElementLayer(
  style: Record<string, unknown> | null | undefined,
  blockId: string,
  field: string,
): number | undefined {
  try {
    const value = JSON.parse(String(style?.lpElementLayers || '{}'))[`${blockId}::${field}`];
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function canvasMoveLimits(spec: LandingPageSpec, target: LpSelectionTarget) {
  const node = findCanvasTargetNode(target),
    freeId = node?.getAttribute('data-lp-free-id') || '';
  const block = spec.blocks.find((b) => b.id === target.blockId);
  if (
    block &&
    !block.sectionPlacement &&
    isFloatingTextLayerBlock(block) &&
    block.positionMode === 'free' &&
    block.freeLayout
  )
    return {
      minX: -block.freeLayout.x,
      maxX: 2400 - block.freeLayout.x,
      minY: -block.freeLayout.y,
      maxY: 2400 - block.freeLayout.y,
    };
  const layout = spec.meta?.elementFreeLayouts?.[freeId] || { x: 0, y: 0 };
  return {
    minX: -FREE_LAYOUT_OFFSET_BOUNDS.maxAbsX - layout.x,
    maxX: FREE_LAYOUT_OFFSET_BOUNDS.maxAbsX - layout.x,
    minY: -FREE_LAYOUT_OFFSET_BOUNDS.maxAbsPos - layout.y,
    maxY: FREE_LAYOUT_OFFSET_BOUNDS.maxAbsPos - layout.y,
  };
}
