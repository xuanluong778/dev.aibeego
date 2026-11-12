/**
 * Move session for section elements that live in a row/column layout.
 * Pointer moves only show the shared drop indicator (no spec writes); the drop dispatches one
 * `lp-section-row-move` event that the builder commits as a single undo/redo transaction.
 */
import { resolveSectionRowDrop, type SidebarDropTarget } from './landing-page-section-insert-target';
import { showSidebarDropTarget } from './landing-page-sidebar-dnd';

export const LP_SECTION_ROW_MOVE_EVENT = 'lp-section-row-move';

/** The in-flow row element owning `node`, or null (legacy / free elements keep their drag). */
export function sectionRowElementOf(node: Element | null | undefined): HTMLElement | null {
  const el = node?.closest<HTMLElement>('[data-lp-section-element][data-lp-block-id]') || null;
  return el && el.parentElement?.closest('[data-lp-row-column]') ? el : null;
}

export function beginSectionRowMove(
  e: { clientX: number; clientY: number; pointerId: number },
  el: HTMLElement,
): void {
  const id = el.dataset.lpBlockId;
  if (!id) return;
  const startX = e.clientX,
    startY = e.clientY;
  let active = false;
  let target: SidebarDropTarget | null = null;
  const resolve = (x: number, y: number) => {
    const hit = document.elementFromPoint(x, y);
    const host = hit?.closest<HTMLElement>('[data-lp-section-chrome="1"]') || null;
    if (!hit || !host) return null;
    const t = resolveSectionRowDrop(host, { clientX: x, clientY: y, target: hit }, id);
    return t?.position.mode === 'section-element' && t.position.rowOp ? t : null;
  };
  let lastX = startX,
    lastY = startY;
  // Scroll / zoom under a still pointer: re-resolve so the marker stays on the real target.
  const onScroll = () => {
    if (!active) return;
    target = resolve(lastX, lastY);
    showSidebarDropTarget(target);
  };
  const onMove = (ev: PointerEvent) => {
    lastX = ev.clientX;
    lastY = ev.clientY;
    if (!active) {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
      active = true;
      el.setAttribute('data-lp-row-moving', '1');
      document.body.setAttribute('data-lp-row-moving', '1');
    }
    ev.preventDefault();
    target = resolve(ev.clientX, ev.clientY);
    showSidebarDropTarget(target);
  };
  const cleanup = () => {
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerup', onUp, true);
    window.removeEventListener('pointercancel', onCancel, true);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('lp-canvas-zoom-change', onScroll);
    el.removeAttribute('data-lp-row-moving');
    document.body.removeAttribute('data-lp-row-moving');
    showSidebarDropTarget(null);
  };
  const onUp = (ev: PointerEvent) => {
    const final = active ? resolve(ev.clientX, ev.clientY) || target : null;
    cleanup();
    if (final?.position.mode !== 'section-element' || !final.position.rowOp) return;
    window.dispatchEvent(
      new CustomEvent(LP_SECTION_ROW_MOVE_EVENT, { detail: { id, op: final.position.rowOp } }),
    );
  };
  const onCancel = () => cleanup();
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      cleanup();
    }
  };
  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('pointerup', onUp, true);
  window.addEventListener('pointercancel', onCancel, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('lp-canvas-zoom-change', onScroll);
}
