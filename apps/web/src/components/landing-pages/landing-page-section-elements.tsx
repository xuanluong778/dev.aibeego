'use client';
import { LandingPageFlowCopy } from './landing-page-flow-copy';
import { readCanvasGroups } from './landing-page-canvas-groups';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { LandingPageBlock, LandingPageSpec } from '@marketingspa/shared';
import {
  applySplitColumnsToBlocks,
  placeInSectionRow,
  readContentColumns,
  readNativeColumnIndices,
  sectionSlotKey,
} from '@marketingspa/shared';
import {
  ElementChrome,
  InlineEditable,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import {
  sectionAnchor,
  sectionHost,
  nativeItemBoxes,
  nativeItemRow,
  sectionPlacementFromInsertPos,
} from './landing-page-section-insert-target';
import type { LpSidebarInsertPos } from './landing-page-sidebar-dnd';

/** Keep native block/field IDs so inspector, history and autosave remain shared. */
export function attachNewSectionElement(
  previous: LandingPageSpec,
  next: LandingPageSpec,
  pos: LpSidebarInsertPos,
): LandingPageSpec {
  const placement = sectionPlacementFromInsertPos(pos);
  if (!placement) return next;
  if (pos.mode === 'section-element' && pos.rowOp) return attachRowElement(previous, next, pos.rowOp);
  const host = previous.blocks.find((b) => b.id === placement.sectionId && !b.sectionPlacement);
  if (!host || host.locked)
    throw Error('Section đích không còn tồn tại hoặc đang khóa. Chưa chèn element.');
  const oldIds = new Set(previous.blocks.map((b) => b.id));
  const added = next.blocks.filter((b) => !oldIds.has(b.id));
  if (added.length !== 1) throw Error('Loại element này không hỗ trợ vị trí đã thả.');
  const allowed = ['Benefits', 'CTA', 'Gallery', 'LeadForm', 'Video', 'Countdown'];
  if (!allowed.includes(added[0]!.type) && typeof placement.columnIndex !== 'number')
    throw Error('Loại element này không hỗ trợ vị trí đã thả.');
  // Shift only existing occupants. The new element already owns the new column.
  const existing =
    pos.mode === 'section-element' && (pos.splitColumns ?? pos.columnCount ?? 1) >= 2
      ? applySplitColumnsToBlocks(
          previous.blocks,
          pos.blockId,
          (pos.splitColumns ?? pos.columnCount)!,
          pos.columnIndex ?? 0,
          pos.nativeColumnIndices,
        )
      : previous.blocks;
  const shifted = new Map(existing.map((b) => [b.id, b]));
  const attached = next.blocks.map((b) => {
    if (oldIds.has(b.id)) {
      const old = shifted.get(b.id)!;
      return {
        ...b,
        style:
          pos.mode === 'section-element' && b.id === pos.blockId && pos.nativeItemIds
            ? { ...old.style, lpNativeItemIds: JSON.stringify(pos.nativeItemIds) }
            : old.style,
        sectionPlacement: old.sectionPlacement,
      };
    }
    if (b.id !== added[0]!.id) return b;
    const { freeLayout, responsiveFreeLayout, positionMode, ...rest } = b;
    return { ...rest, sectionPlacement: placement, spacing: 'none' } as LandingPageBlock;
  });
  return { ...next, blocks: attached };
}

/** Row/column drop: the new element is positioned by the shared row model (one history entry). */
function attachRowElement(
  previous: LandingPageSpec,
  next: LandingPageSpec,
  op: NonNullable<Extract<LpSidebarInsertPos, { mode: 'section-element' }>['rowOp']>,
): LandingPageSpec {
  const ref = previous.blocks.find((b) => b.id === op.refId);
  const host = ref?.sectionPlacement
    ? previous.blocks.find((b) => b.id === ref.sectionPlacement!.sectionId && !b.sectionPlacement)
    : undefined;
  if (!ref || !host || host.locked)
    throw Error('Section đích không còn tồn tại hoặc đang khóa. Chưa chèn element.');
  const oldIds = new Set(previous.blocks.map((b) => b.id));
  const added = next.blocks.filter((b) => !oldIds.has(b.id));
  if (added.length !== 1) throw Error('Loại element này không hỗ trợ vị trí đã thả.');
  const before = new Map(previous.blocks.map((b) => [b.id, b]));
  // Existing blocks keep their previous placement; only the target row changes below.
  const rest = next.blocks
    .filter((b) => b.id !== added[0]!.id)
    .map((b) => {
      const old = before.get(b.id);
      return old && old.sectionPlacement !== b.sectionPlacement
        ? { ...b, sectionPlacement: old.sectionPlacement }
        : b;
    });
  const blocks = placeInSectionRow(rest, { ...added[0]!, spacing: 'none' } as LandingPageBlock, op);
  return { ...next, blocks };
}

function SectionRow({
  rowId,
  blocks,
  canvas,
  renderNative,
}: {
  rowId: string;
  blocks: LandingPageBlock[];
  canvas: LandingPageCanvasHandlers | null;
  renderNative: (b: LandingPageBlock) => ReactNode;
}) {
  // Equal columns from the used column indices (1 → 100%, 2 → 50/50, …); gap is inside the grid.
  const cols = [...new Set(blocks.map((b) => b.sectionPlacement!.row!.c))].sort((a, b) => a - b);
  return (
    <div
      data-lp-section-row={rowId}
      data-lp-row-columns={cols.length}
      {...(canvas ? { 'data-lp-row-guide': '1' } : {})}
      style={{ gridTemplateColumns: `repeat(${cols.length},minmax(0,1fr))` }}
    >
      {cols.map((c, i) => (
        <div key={c} data-lp-row-column={i}>
          {blocks
            .filter((b) => b.sectionPlacement!.row!.c === c)
            .map((b) => (
              <InsertedElement key={b.id} block={b} canvas={canvas} renderNative={renderNative} />
            ))}
        </div>
      ))}
    </div>
  );
}

function InsertedElement({
  block,
  canvas,
  renderNative,
  copyOrigin,
}: {
  copyOrigin?: { x: number; y: number };
  block: LandingPageBlock;
  canvas: LandingPageCanvasHandlers | null;
  renderNative: (b: LandingPageBlock) => ReactNode;
}) {
  const text = (field: string, value: string | undefined, as: 'h2' | 'p' | 'span') => (
    <InlineEditable
      blockId={block.id}
      field={field}
      value={value || ''}
      as={as}
      handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}
      textRole={as === 'h2' ? 'heading' : 'paragraph'}
      multiline
    />
  );
  return (
    <div
      data-lp-section-element="1"
      data-lp-block-id={block.id}
      style={{
        maxWidth: '100%',
        minWidth: 0,
        margin: '12px 0',
        position: block.style?.lpCanvasAbsolute === '1' ? 'absolute' : 'relative',
        ...(block.style?.lpCanvasAbsolute === '1'
          ? {
              left: (Number(block.style?.lpCanvasX) || 0) - (copyOrigin?.x || 0),
              top: (Number(block.style?.lpCanvasY) || 0) - (copyOrigin?.y || 0),
            }
          : {}),
        zIndex: Number(block.style?.lpZIndex) || 0,
      }}
    >
      {block.type === 'Benefits' ? (
        <div>
          {block.headline ? (
            text('headline', block.headline, 'h2')
          ) : (
            <span hidden data-lp-field-anchor="headline" />
          )}
          {block.subheadline ? (
            text('subheadline', block.subheadline, 'p')
          ) : (
            <span hidden data-lp-field-anchor="subheadline" />
          )}
          {block.items.length ? (
            <ul>
              {block.items.map((item, index) => (
                <li key={item.id}>
                  <ItemReorderChrome
                    itemId={item.id}
                    blockId={block.id}
                    index={index}
                    handlers={canvas}
                  >
                    {text(`itemTitle:${item.id}`, item.title, 'span')}
                  </ItemReorderChrome>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : block.type === 'CTA' &&
        block.style?.lpCanvasAbsolute === '1' &&
        block.imageUrl &&
        !block.headline &&
        !block.subheadline &&
        !block.ctaLabel ? (
        <ElementChrome
          blockId={block.id}
          element="image"
          kind="image"
          handlers={canvas}
          blockStyle={block.style as Record<string, unknown>}
        >
          {renderNative(block)}
        </ElementChrome>
      ) : (
        renderNative(block)
      )}
    </div>
  );
}

type ColumnState = { inner: HTMLElement; grid: HTMLElement; groups: ChildNode[][] };
const columnStates = new WeakMap<HTMLElement, ColumnState>();

const FOREIGN_SLOT =
  '[data-lp-section-element-slot],[data-lp-sidebar-drop-indicator],[data-lp-drop-line],[data-lp-drop-image-target]';

function isForeignSlot(n: Node) {
  return n instanceof HTMLElement && n.matches(FOREIGN_SLOT);
}

/** Move a node without throwing HierarchyRequestError when it currently wraps `parent`. */
function moveNode(parent: Node | null | undefined, node: Node, before: Node | null = null) {
  if (!parent || node === parent || before === node) return;
  try {
    if (node.contains(parent)) {
      const liftInto = node.parentNode;
      if (!liftInto) return;
      while (node.firstChild) liftInto.insertBefore(node.firstChild, node);
    }
    if (before && !parent.contains(before)) {
      if (node.parentNode !== parent) parent.appendChild(node);
      return;
    }
    if (node.contains(parent)) return;
    parent.insertBefore(node, before);
  } catch {
    /* HierarchyRequestError: the new child still contains the parent — skip this frame. */
  }
}

function hostOwnedInner(host: HTMLElement): HTMLElement | null {
  const owned = (n: HTMLElement) =>
    n.closest('[data-lp-section-chrome="1"]') === host &&
    !n.closest('[data-lp-section-element],[data-lp-section-element-slot]');
  const inner = Array.from(
    host.querySelectorAll<HTMLElement>(
      '[data-lp-container-inner],[data-lp-cta-split],[data-lp-form-split],.blank-container',
    ),
  ).find(owned);
  if (inner) return inner;
  return (
    Array.from(host.querySelectorAll<HTMLElement>('section,footer,header')).find(owned) || null
  );
}

const nativeGridStyles = new WeakMap<HTMLElement, { columns: string; gap: string }>();
function ensureNativeColumns(
  host: HTMLElement,
  count: number,
  indices: number[],
  ids: string[],
): boolean {
  const boxes = nativeItemBoxes(host);
  if (!boxes.length) return false;
  const row = nativeItemRow(boxes[0]!);
  if (!row) return false;
  const css = getComputedStyle(row);
  if (
    !row.hasAttribute('data-lp-native-flow-grid') &&
    !css.display.includes('grid') &&
    !(css.display.includes('flex') && !css.flexDirection.startsWith('column'))
  )
    return false;
  const cells = boxes.map((n) => n.closest<HTMLElement>('[data-lp-native-item-cell]'));
  if (cells.some((n) => !n || n.parentElement !== row)) return false;
  row.dataset.lpNativeFlowGrid = '1';
  if (count < 2) {
    const saved = nativeGridStyles.get(row);
    if (saved) {
      row.style.gridTemplateColumns = saved.columns;
      row.style.gap = saved.gap;
      nativeGridStyles.delete(row);
    }
    row.removeAttribute('data-lp-content-columns');
    row.style.removeProperty('--lp-content-column-count');
    for (const cell of cells) {
      cell!.style.display = '';
      cell!.style.gridColumn = '';
      cell!.style.gridRow = '';
      cell!.style.order = '';
      cell!.removeAttribute('data-lp-content-column');
      cell!.removeAttribute('data-lp-native-group');
    }
    row.querySelectorAll(':scope > [data-lp-native-empty-column]').forEach((n) => n.remove());
    return true;
  }
  if (!nativeGridStyles.has(row))
    nativeGridStyles.set(row, { columns: row.style.gridTemplateColumns, gap: row.style.gap });
  row.dataset.lpContentColumns = String(count);
  const physical = Math.min(count, Math.max(1, Math.floor((row.clientWidth + 24) / 344)));
  row.style.setProperty('--lp-content-column-count', String(physical));
  row.style.gridTemplateColumns = `repeat(${physical},minmax(0,1fr))`;
  const occupied = new Set<number>(),
    ranks = new Map<number, number>();
  const present = new Set(boxes.map((box) => box.dataset.lpItemId!));
  const positions = ids
    .filter((id) => present.has(id))
    .map((id) => indices[ids.indexOf(id)] ?? ids.indexOf(id));
  let previous = positions[0] ?? 0,
    knownCursor = 0;
  cells.forEach((cell, i) => {
    const itemId = boxes[i]!.dataset.lpItemId!,
      savedIndex = ids.indexOf(itemId);
    const index = Math.max(
      0,
      Math.min(
        count - 1,
        savedIndex >= 0
          ? (positions[knownCursor++] ?? indices[savedIndex] ?? savedIndex)
          : positions.length
            ? previous
            : (indices[i] ?? i),
      ),
    );
    previous = index;
    occupied.add(index);
    const rank = (ranks.get(index) || 0) + 1;
    ranks.set(index, rank);
    cell!.dataset.lpContentColumn = String(index);
    cell!.dataset.lpNativeGroup = String(i);
    cell!.style.display = 'block';
    cell!.style.gridColumn = String((index % physical) + 1);
    cell!.style.gridRow = String(rank);
    cell!.style.order = String(index);
  });
  for (const old of Array.from(
    row.querySelectorAll<HTMLElement>(':scope > [data-lp-native-empty-column]'),
  ))
    if (
      occupied.has(Number(old.dataset.lpContentColumn)) ||
      Number(old.dataset.lpContentColumn) >= count
    )
      old.remove();
  for (let i = 0; i < count; i++)
    if (
      !occupied.has(i) &&
      !row.querySelector(`:scope > [data-lp-native-empty-column][data-lp-content-column="${i}"]`)
    ) {
      const cell = document.createElement('div');
      cell.dataset.lpNativeEmptyColumn = '1';
      cell.dataset.lpContentColumn = String(i);
      cell.style.gridColumn = String((i % physical) + 1);
      cell.style.gridRow = '1';
      cell.style.order = String(i);
      row.appendChild(cell);
    }
  const spans = new Map<number, number>();
  for (const [column, n] of ranks) {
    const group = Math.floor(column / physical);
    spans.set(group, Math.max(spans.get(group) || 1, n));
  }
  for (const cell of Array.from(row.children) as HTMLElement[]) {
    const column = Number(cell.dataset.lpContentColumn);
    if (!Number.isFinite(column)) continue;
    const group = Math.floor(column / physical);
    let base = 0;
    for (let i = 0; i < group; i++) base += spans.get(i) || 1;
    const rank = cell.hasAttribute('data-lp-native-empty-column')
      ? 1
      : Number(cell.style.gridRow) || 1;
    cell.style.gridRow = String(base + rank);
  }
  return true;
}

function ensureSectionColumns(
  host: HTMLElement,
  count: number,
  nativeIndices: number[],
  nativeIds: string[] = [],
) {
  if (ensureNativeColumns(host, count, nativeIndices, nativeIds)) return;
  let state = columnStates.get(host);
  if (state && !host.contains(state.inner)) {
    columnStates.delete(host);
    state = undefined;
  }
  if (!state && count < 2) {
    const split = Array.from(
      host.querySelectorAll<HTMLElement>(
        '[data-lp-hero-grid],[data-lp-cta-split],[data-lp-form-split]',
      ),
    ).find(
      (n) =>
        n.closest('[data-lp-section-chrome="1"]') === host &&
        !n.closest('[data-lp-section-element],[data-lp-section-element-slot]'),
    );
    if (split)
      Array.from(split.children).forEach((node, i) => {
        if (node instanceof HTMLElement) {
          node.dataset.lpContentColumn = String(i);
          node.dataset.lpNativeGroup = String(i);
        }
      });
    return;
  }
  if (!state) {
    // Use the actual content container, above the section background and inside its copy.
    // Never pick a nested section-element's inner — that wraps the slot into its own parent.
    const inner = hostOwnedInner(host);
    if (!inner) return;
    const kids = Array.from(inner.childNodes).filter((n) => !isForeignSlot(n));
    const splitHost = inner.matches(
      '[data-lp-native-flow-grid],[data-lp-hero-grid],[data-lp-cta-split],[data-lp-form-split]',
    );
    const groups =
      splitHost && kids.filter((n) => n instanceof HTMLElement).length >= 2
        ? kids.filter((n) => n instanceof HTMLElement).map((n) => [n])
        : [kids];
    if (splitHost)
      for (const node of kids)
        if (node instanceof HTMLElement) {
          node.removeAttribute('data-lp-content-column');
          node.removeAttribute('data-lp-native-group');
        }
    const grid = document.createElement('div');
    grid.dataset.lpContentColumns = String(count);
    grid.style.gridColumn = '1 / -1';
    inner.appendChild(grid);
    state = { inner, grid, groups };
    columnStates.set(host, state);
  }
  const { inner, grid, groups } = state;
  if (count < 2) {
    // Undo must restore the original React-owned nodes and remove all generated cells.
    for (const group of groups) for (const node of group) moveNode(inner, node, grid);
    grid.remove();
    columnStates.delete(host);
    ensureSectionColumns(host, count, nativeIndices);
    return;
  }
  grid.dataset.lpContentColumns = String(count);
  grid.style.setProperty(
    '--lp-content-column-count',
    String(Math.min(count, Math.max(1, Math.floor((inner.clientWidth + 24) / 344)))),
  );
  for (let i = 0; i < count; i++) {
    if (grid.querySelector(`:scope > [data-lp-content-column="${i}"]`)) continue;
    const cell = document.createElement('div');
    cell.dataset.lpContentColumn = String(i);
    grid.appendChild(cell);
  }
  groups.forEach((nodes, i) => {
    const index = Math.max(0, Math.min(count - 1, nativeIndices[i] ?? i));
    const cell = grid.querySelector<HTMLElement>(`:scope > [data-lp-content-column="${index}"]`)!;
    cell.dataset.lpNativeGroup = String(i);
    for (const node of nodes) if (node.parentNode !== cell) moveNode(cell, node, null);
  });
  for (const cell of Array.from(grid.children)) {
    if (Number((cell as HTMLElement).dataset.lpContentColumn) >= count) cell.remove();
    else if (
      !groups.some(
        (_, i) => (nativeIndices[i] ?? i) === Number((cell as HTMLElement).dataset.lpContentColumn),
      )
    )
      cell.removeAttribute('data-lp-native-group');
  }
}

/** Portals participate in the host's normal flow, including inside a form column. */
export function LandingPageSectionElements({
  spec,
  canvas,
  renderNative,
}: {
  spec: LandingPageSpec;
  canvas: LandingPageCanvasHandlers | null;
  renderNative: (b: LandingPageBlock) => ReactNode;
}) {
  const marker = useRef<HTMLSpanElement>(null);
  const containers = useRef(new Map<string, HTMLDivElement>());
  const [slots, setSlots] = useState<
    Array<{ key: string; node: HTMLDivElement; blocks: LandingPageBlock[] }>
  >([]);
  const entries = spec.blocks.filter((b) => b.enabled && !b.hidden && b.sectionPlacement);
  const signature = JSON.stringify(entries.map((b) => [b.id, b.sectionPlacement]));
  const columnSig = JSON.stringify(
    spec.blocks
      .filter((b) => !b.sectionPlacement)
      .map((b) => [
        b.id,
        readContentColumns(b.style),
        readNativeColumnIndices(b.style),
        b.style?.lpNativeItemIds,
      ]),
  );
  useLayoutEffect(() => {
    const root = marker.current?.closest<HTMLElement>('[data-lp-canvas-root]');
    if (!root) return;
    let raf = 0;
    let observer: MutationObserver | undefined;
    let sizeObserver: ResizeObserver | undefined;
    const sync = () => {
      observer?.disconnect();
      try {
        for (const hostBlock of spec.blocks) {
          if (hostBlock.sectionPlacement) continue;
          const count = readContentColumns(hostBlock.style);
          const host = sectionHost(root, hostBlock.id);
          if (host) {
            let nativeIds: string[] = [];
            try {
              const ids = JSON.parse(String(hostBlock.style?.lpNativeItemIds || '[]'));
              if (Array.isArray(ids))
                nativeIds = ids.filter((id: unknown): id is string => typeof id === 'string');
            } catch {}
            ensureSectionColumns(host, count, readNativeColumnIndices(hostBlock.style), nativeIds);
          }
        }
        const groups = new Map<string, LandingPageBlock[]>();
        for (const b of entries) {
          const key = sectionSlotKey(b.sectionPlacement!);
          groups.set(key, [...(groups.get(key) || []), b]);
        }
        const next: Array<{ key: string; node: HTMLDivElement; blocks: LandingPageBlock[] }> = [];
        for (const [key, blocks] of groups) {
          const p = blocks[0]!.sectionPlacement!,
            host = sectionHost(root, p.sectionId),
            anchor = host ? sectionAnchor(host, p) : null;
          if (!anchor) continue;
          let node = containers.current.get(key);
          if (!node) {
            node = document.createElement('div');
            node.dataset.lpSectionElementSlot = '1';
            node.style.minWidth = '0';
            node.style.maxWidth = '100%';
            containers.current.set(key, node);
          }
          node.style.display = '';
          // Nested element inside this slot — moving the slot into its own descendant
          // throws HierarchyRequestError and crashes the whole builder.
          if (node === anchor.node || node.contains(anchor.node)) {
            next.push({ key, node, blocks });
            continue;
          }
          if (anchor.end) {
            if (node.parentNode !== anchor.node || anchor.node.lastChild !== node)
              moveNode(anchor.node, node, null);
          } else if (p.edge === 'before') {
            if (node.nextSibling !== anchor.node)
              moveNode(anchor.node.parentNode, node, anchor.node);
          } else if (node.previousSibling !== anchor.node)
            moveNode(anchor.node.parentNode, node, anchor.node.nextSibling);
          next.push({ key, node, blocks });
        }
        for (const [key, node] of containers.current)
          if (!groups.has(key)) {
            node.remove();
            containers.current.delete(key);
          }
        setSlots((old) =>
          old.length === next.length &&
          old.every(
            (s, i) =>
              s.key === next[i]?.key &&
              s.node === next[i]?.node &&
              s.blocks.map((b) => b.id).join(',') === next[i]?.blocks.map((b) => b.id).join(','),
          )
            ? old
            : next,
        );
      } catch {
        /* Keep the builder mounted if a one-frame DOM cycle is still settling. */
      } finally {
        if (root.isConnected) observer?.observe(root, { childList: true, subtree: true });
      }
    };
    observer = new MutationObserver(() => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
    });
    sync();
    sizeObserver = new ResizeObserver(() => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
    });
    sizeObserver.observe(root);
    return () => {
      sizeObserver?.disconnect();
      observer?.disconnect();
      cancelAnimationFrame(raf);
    };
    // Text/style updates render through current spec below; only ownership changes relocate slots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, columnSig, canvas]);
  useLayoutEffect(
    () => () => {
      for (const node of containers.current.values()) node.remove();
      containers.current.clear();
    },
    [],
  );
  const renderSlot = (blocks: LandingPageBlock[]) => {
    const rendered = new Set<string>(),
      groups = readCanvasGroups(spec);
    const live = blocks
      .map((old) => spec.blocks.find((b) => b.id === old.id))
      .filter((b): b is LandingPageBlock => Boolean(b && b.enabled && !b.hidden));
    return blocks.map((old) => {
      const block = spec.blocks.find((b) => b.id === old.id);
      if (!block || !block.enabled || block.hidden || rendered.has(block.id)) return null;
      const row = block.sectionPlacement?.row;
      if (row) {
        // The whole row renders once, at its first member; members never render twice.
        const members = live.filter((b) => b.sectionPlacement?.row?.id === row.id);
        members.forEach((b) => rendered.add(b.id));
        return (
          <SectionRow
            key={'row:' + row.id}
            rowId={row.id}
            blocks={members}
            canvas={canvas}
            renderNative={renderNative}
          />
        );
      }
      if (block.style?.lpCanvasAbsolute !== '1')
        return (
          <InsertedElement
            key={block.id}
            block={block}
            canvas={canvas}
            renderNative={renderNative}
          />
        );
      const group = groups.find((g) => g.members.some((key) => key.split('::')[0] === block.id));
      const ids = new Set(group?.members.map((key) => key.split('::')[0]) || [block.id]);
      const copies = blocks
        .map((row) => spec.blocks.find((b) => b.id === row.id)!)
        .filter(
          (b) => b && ids.has(b.id) && b.style?.lpCanvasAbsolute === '1' && b.enabled && !b.hidden,
        );
      copies.forEach((b) => rendered.add(b.id));
      const origin = {
        x: Math.min(...copies.map((b) => Number(b.style?.lpCanvasX) || 0)),
        y: Math.min(...copies.map((b) => Number(b.style?.lpCanvasY) || 0)),
      };
      return (
        <LandingPageFlowCopy key={block.id}>
          {copies.map((b) => (
            <InsertedElement
              key={b.id}
              block={b}
              canvas={canvas}
              renderNative={renderNative}
              copyOrigin={origin}
            />
          ))}
        </LandingPageFlowCopy>
      );
    });
  };
  return (
    <>
      <style>{`[data-lp-canvas-root]{container-type:inline-size}[data-lp-content-columns]{display:grid;grid-template-columns:repeat(var(--lp-content-column-count),minmax(0,1fr));align-items:stretch;width:100%;gap:1.5rem;position:relative;z-index:1}[data-lp-content-column]{min-width:0;min-height:64px}[data-lp-canvas-root][data-lp-non-overlap="1"] [data-lp-content-column] [data-lp-text-hug="1"]:not([data-lp-size-accepted="1"]){max-width:100%!important;min-width:0!important;height:auto!important;min-height:min-content!important;overflow-wrap:anywhere}[data-lp-native-flow-grid] [data-lp-item-id]{min-height:min-content!important}[data-lp-native-flow-grid] [data-lp-item-id]>:not(button):not([data-lp-transform-chrome]){min-height:min-content!important;height:100%!important}[data-lp-native-flow-grid][data-lp-content-columns] [data-lp-item-id]{width:100%!important;max-width:100%!important;min-width:0!important;min-height:min-content!important}[data-lp-native-flow-grid][data-lp-content-columns] [data-lp-item-id]>:not(button):not([data-lp-transform-chrome]){max-width:100%!important;min-width:0!important;height:100%!important;box-sizing:border-box}[data-lp-native-flow-grid][data-lp-content-columns] [data-lp-inline-wrap]{max-width:100%!important;min-width:0;overflow-wrap:anywhere}@container(max-width:767px){[data-lp-content-columns]{grid-template-columns:minmax(0,1fr)}[data-lp-native-flow-grid][data-lp-content-columns]{grid-template-columns:minmax(0,1fr)!important}[data-lp-native-flow-grid][data-lp-content-columns]>[data-lp-content-column]{grid-column:1!important;grid-row:auto!important}}[data-lp-section-element] [data-lp-inline-wrap]:is([data-lp-inline-wrap="heading"],[data-lp-inline-wrap="paragraph"]):not([data-lp-heading-width-locked="1"]):not([data-lp-heading-width-live]){max-width:100%!important;width:100%!important;box-sizing:border-box}[data-lp-section-row]{display:grid;column-gap:24px;row-gap:0;width:100%;max-width:100%;box-sizing:border-box;align-items:start;margin:0}[data-lp-row-column]{min-width:0;display:flex;flex-direction:column;box-sizing:border-box}[data-lp-row-column]>[data-lp-section-element]{width:100%;max-width:100%!important;box-sizing:border-box}[data-lp-row-column] [data-lp-inline-wrap],[data-lp-row-column] img{max-width:100%!important}[data-lp-row-guide]>[data-lp-row-column]{outline:1px dashed transparent;outline-offset:2px}[data-lp-row-guide]:hover>[data-lp-row-column],body:has([data-lp-sidebar-drop-indicator]) [data-lp-row-guide]>[data-lp-row-column]{outline-color:rgba(37,99,235,.55)}[data-lp-row-moving="1"][data-lp-section-element]{opacity:.45}@container(max-width:767px){[data-lp-section-row]{grid-template-columns:minmax(0,1fr)!important;row-gap:12px}}`}</style>
      <span hidden ref={marker} data-lp-section-element-mount />
      {slots.map((slot) => createPortal(renderSlot(slot.blocks), slot.node, slot.key))}
    </>
  );
}
