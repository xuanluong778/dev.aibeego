/**
 * Sidebar → canvas drag payload helpers for Landing Page Builder.
 * Additive MIME alongside LP_BLOCK_MIME / LP_ITEM_MIME (reorder).
 */

import type { DragEvent as ReactDragEvent } from 'react';
import type { SidebarDropTarget } from './landing-page-section-insert-target';
import type { LandingPageSectionPlacement, LandingPageSectionRowOp } from '@marketingspa/shared';
import { LANDING_PAGE_BLOCK_TYPES } from '@marketingspa/shared';
import type { LandingPageBlockType } from '@marketingspa/shared';
import type {
  LandingPageButtonGroupPreset,
  LandingPageButtonPreset,
} from './landing-page-button-presets';
import type { LandingPageBoxPreset } from './landing-page-box-presets';
import type {
  LandingPageListPreset,
  LandingPageParagraphPreset,
  LandingPageTitlePreset,
} from './landing-page-title-presets';
import type { LandingPageFormPreset } from './landing-page-form-presets';

export const LP_SIDEBAR_PRESET_MIME = 'application/x-lp-sidebar-preset';

/**
 * Fired after a sidebar preset is inserted (click) or a preset drag ends.
 * Left-rail overlay panels (text / button / graphics) must close so they stop
 * intercepting pointer events over the newly created canvas element.
 */
export const LP_SIDEBAR_CLOSE_OVERLAY_EVENT = 'lp-sidebar-close-overlay';

export function requestCloseSidebarOverlay() {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent(LP_SIDEBAR_CLOSE_OVERLAY_EVENT));
}

/** True when this click is the ghost click after an HTML5 drag — skip insert. */
export function suppressClickAfterSidebarDrag(e: {
  currentTarget: EventTarget | null;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}): boolean {
  const el = e.currentTarget as HTMLElement | null;
  if (!el || el.dataset.lpDidDrag !== '1') return false;
  delete el.dataset.lpDidDrag;
  e.preventDefault?.();
  e.stopPropagation?.();
  return true;
}

export type LpSidebarPresetPayload =
  | { kind: 'title'; preset: LandingPageTitlePreset }
  | { kind: 'paragraph'; preset: LandingPageParagraphPreset }
  | { kind: 'list'; preset: LandingPageListPreset }
  | { kind: 'button'; preset: LandingPageButtonPreset }
  | { kind: 'button-group'; preset: LandingPageButtonGroupPreset }
  | { kind: 'box'; preset: LandingPageBoxPreset }
  | { kind: 'form'; preset: LandingPageFormPreset }
  | { kind: 'block-type'; type: LandingPageBlockType }
  | { kind: 'media'; url: string; name: string }
  | { kind: 'section-preset'; presetId: string; types: LandingPageBlockType[] }
  /** Open Section Library modal — insert position resolved on drop / click. */
  | { kind: 'section-library-open' }
  /** Open Button Library modal — insert position resolved on drop / click. */
  | { kind: 'button-library-open' }
  /** Open Form Library modal — insert position resolved on drop / click. */
  | { kind: 'form-library-open' }
  /** Open right-rail picker (presets) after drop so user can click a template. */
  | {
      kind: 'add-picker-open';
      picker: 'text' | 'button' | 'forms' | 'graphics' | 'icon' | 'social' | 'media';
      initialTab?: 'title' | 'paragraph' | 'list';
    };

export type LpSidebarInsertPos =
  | {
      mode: 'image-target';
      blockId: string;
      gridIndex?: number;
      clientX?: number;
      clientY?: number;
    }
    | {
      mode: 'section-element';
      blockId: string;
      anchor: LandingPageSectionPlacement['anchor'];
      edge: 'before' | 'after';
      columnIndex?: number;
      splitColumns?: number;
      /** Existing native layout count; initializes persistence without adding a column. */
      columnCount?: number;
      nativeColumnIndices?: number[];
      nativeItemIds?: string[];
      /** Opt-in row/column layout op (column / stack / new row) relative to an element. */
      rowOp?: LandingPageSectionRowOp;
      clientX?: number;
      clientY?: number;
    }
  | { mode: 'after-selected'; clientX?: number; clientY?: number }
  | { mode: 'before'; blockId: string; clientX?: number; clientY?: number }
  | { mode: 'after'; blockId: string; clientX?: number; clientY?: number }
  /** Drop onto section body — place free content at pointer (not a new flow row). */
  | { mode: 'inside'; blockId: string; clientX?: number; clientY?: number }
  | { mode: 'start'; clientX?: number; clientY?: number }
  | { mode: 'end'; clientX?: number; clientY?: number };

/** Payloads that become free-floating layers on canvas (not full-width section rows). */
export function isSidebarFreeLayerPayload(payload: LpSidebarPresetPayload): boolean {
  return (
    payload.kind === 'title' ||
    payload.kind === 'paragraph' ||
    payload.kind === 'list' ||
    payload.kind === 'button' ||
    payload.kind === 'button-group' ||
    payload.kind === 'box' ||
    payload.kind === 'form' ||
    payload.kind === 'add-picker-open' ||
    payload.kind === 'media' ||
    payload.kind === 'button-library-open'
  );
}

/** Edge band (px) for before/after section row insert; middle = inside. */
export const LP_SECTION_DROP_EDGE_PX = 18;

export function resolveSectionDropMode(
  clientY: number,
  sectionRect: DOMRect,
  preferInside: boolean,
): 'before' | 'after' | 'inside' {
  const topBand = sectionRect.top + LP_SECTION_DROP_EDGE_PX;
  const bottomBand = sectionRect.bottom - LP_SECTION_DROP_EDGE_PX;
  if (clientY <= topBand) return 'before';
  if (clientY >= bottomBand) return 'after';
  if (preferInside) return 'inside';
  // Full section inserts (Gallery / Video / …): mid → nearer edge.
  return clientY < sectionRect.top + sectionRect.height / 2 ? 'before' : 'after';
}

export function isSidebarPresetDrag(types: readonly string[] | DOMStringList): boolean {
  const list = Array.from(types as ArrayLike<string>);
  return list.includes(LP_SIDEBAR_PRESET_MIME);
}

export function parseSidebarPresetPayload(raw: string): LpSidebarPresetPayload | null {
  try {
    const data = JSON.parse(raw) as LpSidebarPresetPayload;
    if (!data || typeof data !== 'object' || !('kind' in data)) return null;
    if (
      ![
        'title',
        'paragraph',
        'list',
        'button',
        'button-group',
        'box',
        'form',
        'block-type',
        'media',
        'section-preset',
        'section-library-open',
        'button-library-open',
        'form-library-open',
        'add-picker-open',
      ].includes(data.kind)
    )
      return null;
    if (data.kind === 'block-type' && !LANDING_PAGE_BLOCK_TYPES.includes(data.type)) return null;
    if (data.kind === 'media' && (typeof data.url !== 'string' || typeof data.name !== 'string'))
      return null;
    if (data.kind === 'section-preset') {
      if (!data.presetId || !Array.isArray(data.types) || data.types.length === 0) return null;
    }
    if (data.kind === 'section-library-open' || data.kind === 'button-library-open') return data;
    if (data.kind === 'add-picker-open') {
      const p = (data as { picker?: string }).picker;
      if (
        p === 'text' ||
        p === 'button' ||
        p === 'forms' ||
        p === 'graphics' ||
        p === 'icon' ||
        p === 'social' ||
        p === 'media'
      ) {
        return data;
      }
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

let activePayload: LpSidebarPresetPayload | null = null;
let dropTarget: SidebarDropTarget | null = null;
const dragListeners = new Set<() => void>();
export function subscribeSidebarDrop(listener: () => void) {
  dragListeners.add(listener);
  return () => {
    dragListeners.delete(listener);
  };
}
export function getSidebarDropTarget() {
  return dropTarget;
}
export function showSidebarDropTarget(next: SidebarDropTarget | null) {
  if (JSON.stringify(next) === JSON.stringify(dropTarget)) return;
  dropTarget = next;
  for (const listener of dragListeners) listener();
}
export function readSidebarDragPayload(dt: DataTransfer): LpSidebarPresetPayload | null {
  let raw = '';
  try {
    raw = dt.getData(LP_SIDEBAR_PRESET_MIME);
  } catch {}
  return raw ? parseSidebarPresetPayload(raw) : activePayload;
}
export function cancelSidebarDrag() {
  activePayload = null;
  showSidebarDropTarget(null);
}
export function ignoreSidebarElementClick(e: { preventDefault(): void; stopPropagation(): void }) {
  e.preventDefault();
  e.stopPropagation();
}

/** Start a drag session; protected MIME is read from the session during dragover. */
export function beginSidebarPresetDrag(
  e: ReactDragEvent,
  payload: LpSidebarPresetPayload,
  previewLabel: string,
  opts?: { subtitle?: string },
) {
  e.stopPropagation();
  activePayload = payload;
  showSidebarDropTarget(null);
  const json = JSON.stringify(payload);
  e.dataTransfer.setData(LP_SIDEBAR_PRESET_MIME, json);
  e.dataTransfer.setData('text/plain', previewLabel.slice(0, 80));
  e.dataTransfer.effectAllowed = 'copy';

  if (typeof document === 'undefined') return;

  const isLibraryOpen =
    payload.kind === 'section-library-open' ||
    payload.kind === 'button-library-open' ||
    payload.kind === 'add-picker-open';
  if (payload.kind === 'media') document.body.setAttribute('data-lp-dragging-media', '1');
  if (payload.kind === 'section-library-open') {
    document.body.setAttribute('data-lp-dragging-section-library', '1');
  }
  if (payload.kind === 'button-library-open') {
    document.body.setAttribute('data-lp-dragging-button-library', '1');
  }
  if (payload.kind === 'add-picker-open') {
    document.body.setAttribute('data-lp-dragging-add-picker', payload.picker);
  }

  // Mark source so the post-drag synthetic click does not double-insert / double-open.
  const src = e.currentTarget as HTMLElement | null;
  if (src) {
    src.dataset.lpDidDrag = '1';
    const onDragEnd = () => {
      cancelSidebarDrag();
      document.removeEventListener('dragover', outside, true);
      document.removeEventListener('drop', finish, true);
      document.removeEventListener('keydown', escape, true);
      src.removeEventListener('dragend', onDragEnd);
      document.body.removeAttribute('data-lp-dragging-media');
      document.body.removeAttribute('data-lp-dragging-section-library');
      document.body.removeAttribute('data-lp-dragging-button-library');
      document.body.removeAttribute('data-lp-dragging-add-picker');
      // Close left overlays AFTER drop handlers finish.
      // Libraries / pickers open on DROP only — never close/open them from dragend.
      if (!isLibraryOpen) {
        window.setTimeout(() => requestCloseSidebarOverlay(), 120);
      }
      // Keep lpDidDrag through the trailing click (often after dragend).
      window.setTimeout(() => {
        if (src.dataset.lpDidDrag === '1') delete src.dataset.lpDidDrag;
      }, 400);
    };
    const outside = (event: DragEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-lp-canvas-root]'))
        showSidebarDropTarget(null);
    };
    const finish = () => {
      window.setTimeout(onDragEnd, 0);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDragEnd();
    };
    document.addEventListener('dragover', outside, true);
    document.addEventListener('drop', finish, true);
    document.addEventListener('keydown', escape, true);
    src.addEventListener('dragend', onDragEnd);
  }

  // Keep the canvas insertion bar as the only drag feedback; no floating text card.
  const ghost = document.createElement('canvas');
  ghost.width = 1;
  ghost.height = 1;
  ghost.setAttribute('data-lp-sidebar-transparent-drag-image', '1');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '-10px',
    top: '-10px',
    width: '1px',
    height: '1px',
    pointerEvents: 'none',
  });
  document.body.appendChild(ghost);
  try {
    e.dataTransfer.setDragImage(ghost, 0, 0);
  } catch {
    /* native drag remains usable */
  }
  window.setTimeout(() => ghost.remove(), 0);
}
