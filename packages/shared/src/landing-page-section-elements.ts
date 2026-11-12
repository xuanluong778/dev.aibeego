import type { LandingPageBlock } from './landing-page-types';
import { sanitizeSectionRowRef, type LandingPageSectionRowRef } from './landing-page-section-rows';

export const LP_CONTENT_COLUMNS_MAX = 12;

/** A flow element retains its native block/field IDs, but belongs to a section. */
export type LandingPageSectionPlacement = {
  sectionId: string;
  anchor:
    | { kind: 'field'; blockId: string; field: string }
    | { kind: 'submit'; blockId: string }
    | { kind: 'end' };
  edge: 'before' | 'after';
  /** 0-based column inside the host section when lpContentColumns >= 2. */
  columnIndex?: number;
  /** Opt-in row/column layout (see landing-page-section-rows). Absent on legacy elements. */
  row?: LandingPageSectionRowRef;
};

export function readContentColumns(style?: { lpContentColumns?: unknown } | null): number {
  const n = Number(style?.lpContentColumns);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(LP_CONTENT_COLUMNS_MAX, Math.round(n)));
}

export function readNativeColumnIndex(style?: { lpNativeColumnIndex?: unknown } | null): number {
  const n = Number(style?.lpNativeColumnIndex);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(LP_CONTENT_COLUMNS_MAX - 1, Math.round(n)));
}

export function readNativeColumnIndices(
  style?: { lpNativeColumnIndices?: unknown; lpNativeColumnIndex?: unknown } | null,
): number[] {
  const indices = style?.lpNativeColumnIndices;
  return Array.isArray(indices) &&
    indices.length &&
    indices.every((n) => Number.isInteger(n) && n >= 0 && n < LP_CONTENT_COLUMNS_MAX)
    ? [...indices]
    : [readNativeColumnIndex(style)];
}

function withColumnIndex(
  placement: LandingPageSectionPlacement,
  input: Record<string, unknown>,
): LandingPageSectionPlacement {
  const row = sanitizeSectionRowRef(input.row);
  const withRow = row ? { ...placement, row } : placement;
  const n = Number(input.columnIndex);
  if (!Number.isFinite(n)) return withRow;
  const columnIndex = Math.max(0, Math.min(LP_CONTENT_COLUMNS_MAX - 1, Math.round(n)));
  return { ...placement, columnIndex, ...(row ? { row } : {}) };
}

export function sanitizeSectionPlacement(input: unknown): LandingPageSectionPlacement | undefined {
  if (!input || typeof input !== 'object') return;
  const p = input as Record<string, unknown>;
  const id = (v: unknown) => (typeof v === 'string' && /^[\w:.-]{1,120}$/.test(v) ? v : undefined);
  const sectionId = id(p.sectionId);
  if (
    !sectionId ||
    (p.edge !== 'before' && p.edge !== 'after') ||
    !p.anchor ||
    typeof p.anchor !== 'object'
  )
    return;
  const a = p.anchor as Record<string, unknown>;
  if (a.kind === 'end')
    return withColumnIndex({ sectionId, anchor: { kind: 'end' }, edge: 'after' }, p);
  const blockId = id(a.blockId);
  if (!blockId) return;
  if (a.kind === 'submit') {
    return withColumnIndex({ sectionId, anchor: { kind: 'submit', blockId }, edge: p.edge }, p);
  }
  if (a.kind === 'field' && typeof a.field === 'string' && /^[\w:-]{1,180}$/.test(a.field)) {
    return withColumnIndex(
      { sectionId, anchor: { kind: 'field', blockId, field: a.field }, edge: p.edge },
      p,
    );
  }
}

/** Grow a section to N equal columns and shift occupants when inserting a new column. */
export function applySplitColumnsToBlocks(
  blocks: LandingPageBlock[],
  hostId: string,
  splitColumns: number,
  insertIndex: number,
  nativeColumns?: number[],
): LandingPageBlock[] {
  const host = blocks.find((b) => b.id === hostId && !b.sectionPlacement);
  if (!host) return blocks;
  const indices = nativeColumns || readNativeColumnIndices(host.style);
  const current = Math.max(readContentColumns(host.style), ...indices.map((n) => n + 1));
  const want = Math.round(Number(splitColumns));
  const at = Math.max(
    0,
    Math.min(LP_CONTENT_COLUMNS_MAX - 1, Math.round(Number(insertIndex) || 0)),
  );
  if (!Number.isFinite(want) || want < 2) return blocks;
  const nextCount = Math.min(LP_CONTENT_COLUMNS_MAX, Math.max(current, want, at + 1));
  const creating = nextCount > current;
  const nextIndices = indices.map((n) => (creating && at <= n ? n + 1 : n));
  return blocks.map((b) => {
    if (b.id === hostId) {
      return {
        ...b,
        style: {
          ...(b.style || {}),
          lpContentColumns: nextCount,
          lpNativeColumnIndex: nextIndices[0],
          lpNativeColumnIndices: nextIndices,
        },
      };
    }
    const p = b.sectionPlacement;
    if (!creating || !p || p.sectionId !== hostId) return b;
    const idx = p.columnIndex ?? 0;
    if (idx < at) return b;
    return { ...b, sectionPlacement: { ...p, columnIndex: idx + 1 } };
  });
}

export function isSectionElement(block: LandingPageBlock): boolean {
  return Boolean(block.sectionPlacement);
}

/** Remove children with their section; never promote an orphan to a page section. */
export function sectionElementDeletionIds(
  blocks: LandingPageBlock[],
  selected: string[],
): Set<string> {
  const ids = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const b of blocks)
      if (b.sectionPlacement && ids.has(b.sectionPlacement.sectionId) && !ids.has(b.id)) {
        ids.add(b.id);
        changed = true;
      }
  }
  return ids;
}

/** Deleting an anchor element keeps following elements at that same section slot. */
export function removeSectionElements(
  blocks: LandingPageBlock[],
  selected: string[],
): LandingPageBlock[] {
  const removed = sectionElementDeletionIds(blocks, selected);
  const byId = new Map(blocks.map((b) => [b.id, b]));
  return blocks
    .filter((b) => !removed.has(b.id))
    .map((block) => {
      const initial = block.sectionPlacement;
      if (!initial) return block;
      let p: LandingPageSectionPlacement = initial;
      const visited = new Set<string>();
      while (p.anchor.kind !== 'end' && removed.has(p.anchor.blockId)) {
        const id: string = p.anchor.blockId;
        if (visited.has(id)) {
          p = { ...p, anchor: { kind: 'end' }, edge: 'after' };
          break;
        }
        visited.add(id);
        const original: LandingPageSectionPlacement | undefined = byId.get(id)?.sectionPlacement;
        p =
          original?.sectionId === p.sectionId
            ? original
            : { ...p, anchor: { kind: 'end' }, edge: 'after' };
      }
      return p === block.sectionPlacement ? block : { ...block, sectionPlacement: p };
    });
}
