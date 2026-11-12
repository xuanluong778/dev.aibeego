import type { LandingPageBlock } from './landing-page-types';
import type { LandingPageSectionPlacement } from './landing-page-section-elements';

/**
 * Opt-in row/column layout for section elements.
 *
 * A row is a set of section elements that share one slot (same sectionId/anchor/edge) and the
 * same `row.id`. `row.c` is the column; column widths are always equal (1 → 100%, 2 → 50/50 …).
 * Elements in the same column stack vertically in `spec.blocks` order; rows inside one slot are
 * ordered by their first member in `spec.blocks`. Elements without `row` keep the legacy flow.
 */
export const LP_ROW_MAX_COLUMNS = 4;

export type LandingPageSectionRowRef = { id: string; c: number };

export type LandingPageSectionRowOp =
  /** New column on the left/right of `refId`, inside refId's row. */
  | { kind: 'column'; refId: string; side: 'left' | 'right' }
  /** Same column as `refId`, directly before/after it. */
  | { kind: 'stack'; refId: string; edge: 'before' | 'after' }
  /** New full-width row before/after refId's row. */
  | { kind: 'row'; refId: string; edge: 'before' | 'after' };

const ROW_ID = /^[\w-]{1,40}$/;

export function sanitizeSectionRowRef(input: unknown): LandingPageSectionRowRef | undefined {
  if (!input || typeof input !== 'object') return;
  const r = input as Record<string, unknown>;
  const c = Number(r.c);
  if (typeof r.id !== 'string' || !ROW_ID.test(r.id) || !Number.isFinite(c)) return;
  return { id: r.id, c: Math.max(0, Math.min(LP_ROW_MAX_COLUMNS - 1, Math.round(c))) };
}

export function sanitizeSectionRowOp(input: unknown): LandingPageSectionRowOp | undefined {
  if (!input || typeof input !== 'object') return;
  const o = input as Record<string, unknown>;
  if (typeof o.refId !== 'string' || !/^[\w:.-]{1,120}$/.test(o.refId)) return;
  if (o.kind === 'column' && (o.side === 'left' || o.side === 'right'))
    return { kind: 'column', refId: o.refId, side: o.side };
  if ((o.kind === 'stack' || o.kind === 'row') && (o.edge === 'before' || o.edge === 'after'))
    return { kind: o.kind, refId: o.refId, edge: o.edge };
}

/** Slot identity: everything but the row (legacy key == JSON of the whole placement). */
export function sectionSlotKey(p: LandingPageSectionPlacement): string {
  if (!p.row) return JSON.stringify(p);
  const { row: _row, ...rest } = p;
  return JSON.stringify(rest);
}

function sameRow(b: LandingPageBlock, slot: string, rowId: string): boolean {
  const p = b.sectionPlacement;
  return Boolean(p?.row && p.row.id === rowId && sectionSlotKey(p) === slot);
}

/** Distinct used columns of a row, ascending — the rendered column order. */
export function sectionRowColumns(
  blocks: LandingPageBlock[],
  placement: LandingPageSectionPlacement,
): number[] {
  if (!placement.row) return [0];
  const slot = sectionSlotKey(placement);
  const cols = new Set<number>();
  for (const b of blocks) if (sameRow(b, slot, placement.row.id)) cols.add(b.sectionPlacement!.row!.c);
  return [...cols].sort((a, b) => a - b);
}

function newRowId(blocks: LandingPageBlock[]): string {
  const used = new Set(blocks.map((b) => b.sectionPlacement?.row?.id).filter(Boolean));
  for (;;) {
    const id = 'row_' + Math.random().toString(36).slice(2, 10);
    if (!used.has(id)) return id;
  }
}

function stripFree(block: LandingPageBlock): LandingPageBlock {
  const { freeLayout: _f, responsiveFreeLayout: _r, positionMode: _m, ...rest } = block;
  const style = { ...(rest.style || {}) } as Record<string, unknown>;
  for (const k of ['lpCanvasAbsolute', 'lpCanvasX', 'lpCanvasY']) delete style[k];
  return { ...rest, style } as LandingPageBlock;
}

/**
 * Place `block` (new or moved; must NOT be in `blocks`) relative to `op.refId`.
 * Pure: returns a new array; only the target row's members change. Throws a user-facing
 * Vietnamese message when the drop is not allowed.
 */
export function placeInSectionRow(
  blocks: LandingPageBlock[],
  block: LandingPageBlock,
  op: LandingPageSectionRowOp,
): LandingPageBlock[] {
  if (blocks.some((b) => b.id === block.id)) throw Error('Element đã tồn tại ở vị trí khác.');
  const refIndex = blocks.findIndex((b) => b.id === op.refId);
  const ref = blocks[refIndex];
  if (!ref?.sectionPlacement) throw Error('Vị trí thả không còn tồn tại. Hãy kéo lại.');
  let list = blocks.slice();
  let refPlacement = ref.sectionPlacement;
  // Opt-in: the reference element joins a row only when the user builds one next to it.
  if (!refPlacement.row) {
    refPlacement = { ...refPlacement, row: { id: newRowId(list), c: 0 } };
    list[refIndex] = { ...ref, sectionPlacement: refPlacement };
  }
  const slot = sectionSlotKey(refPlacement);
  const rowId = refPlacement.row!.id;
  const { row: _row, ...base } = refPlacement;
  const memberIdx = list
    .map((b, i) => (sameRow(b, slot, rowId) ? i : -1))
    .filter((i) => i >= 0);
  const first = memberIdx[0]!;
  const last = memberIdx[memberIdx.length - 1]!;
  let row: LandingPageSectionRowRef;
  let at: number;
  if (op.kind === 'column') {
    const cols = sectionRowColumns(list, refPlacement);
    if (cols.length >= LP_ROW_MAX_COLUMNS)
      throw Error(`Hàng này đã đủ ${LP_ROW_MAX_COLUMNS} cột.`);
    const rank = cols.indexOf(refPlacement.row!.c);
    const insertAt = op.side === 'left' ? rank : rank + 1;
    // Compact to 0..n-1 and open a gap at insertAt — only this row's members change.
    list = list.map((b) => {
      if (!sameRow(b, slot, rowId)) return b;
      const p = b.sectionPlacement!;
      const r = cols.indexOf(p.row!.c);
      const c = r >= insertAt ? r + 1 : r;
      return c === p.row!.c ? b : { ...b, sectionPlacement: { ...p, row: { id: rowId, c } } };
    });
    row = { id: rowId, c: insertAt };
    at = last + 1;
  } else if (op.kind === 'stack') {
    row = { id: rowId, c: refPlacement.row!.c };
    at = op.edge === 'before' ? refIndex : refIndex + 1;
  } else {
    row = { id: newRowId(list), c: 0 };
    at = op.edge === 'before' ? first : last + 1;
  }
  const placed = { ...stripFree(block), sectionPlacement: { ...base, row } } as LandingPageBlock;
  list.splice(at, 0, placed);
  return list;
}

/** Move an existing section element into a row position (one transaction for undo/redo). */
export function moveIntoSectionRow(
  blocks: LandingPageBlock[],
  id: string,
  op: LandingPageSectionRowOp,
): LandingPageBlock[] {
  const el = blocks.find((b) => b.id === id);
  if (!el?.sectionPlacement) throw Error('Element không còn tồn tại.');
  if (op.refId === id) return blocks;
  return placeInSectionRow(
    blocks.filter((b) => b.id !== id),
    el,
    op,
  );
}
