'use client';
import { protectFreeRect } from './landing-page-no-overlap';
import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import type { LandingPageSpec } from '@marketingspa/shared';
import { readCanvasPointerScale } from './landing-page-free-drag';
import {
  findCanvasTargetNode,
  canvasMoveLimits,
  selectionBox,
  selectionRect,
  targetIsLocked,
  targetKey,
  type CanvasMove,
} from './landing-page-canvas-groups';
import type { LpSelectionTarget } from './landing-page-canvas-selection';

export function LandingPageGroupSelection({
  targets,
  spec,
  grouped,
  canGroup,
  onCommit,
  onGroup,
  onUngroup,
}: {
  targets: LpSelectionTarget[];
  spec: LandingPageSpec;
  grouped: boolean;
  canGroup: boolean;
  onCommit: (moves: CanvasMove[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
}) {
  const [rect, setRect] = useState<ReturnType<typeof selectionRect>>(null);
  const dragging = useRef(false),
    cleanup = useRef<(() => void) | null>(null);
  const keys = targets.map(targetKey).join('|');
  const locked = targets.some((t) => targetIsLocked(spec, t));
  useLayoutEffect(() => {
    const nodes = targets
      .map((t) => findCanvasTargetNode(t))
      .filter((n): n is HTMLElement => Boolean(n));
    const sync = () => {
      if (!dragging.current) setRect(selectionRect(targets));
    };
    for (const node of nodes)
      node.setAttribute('data-lp-group-member-selected', grouped ? 'group' : 'multiple');
    sync();
    const ro = new ResizeObserver(sync);
    nodes.forEach((node) => ro.observe(node));
    window.addEventListener('scroll', sync, true);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', sync, true);
      window.removeEventListener('resize', sync);
      nodes.forEach((node) => node.removeAttribute('data-lp-group-member-selected'));
    };
  }, [keys, spec, grouped]);
  useLayoutEffect(() => () => cleanup.current?.(), []);
  const beginMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || locked || !rect) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget,
      pointerId = event.pointerId;
    const snapshots = targets.map((target) => {
      const node = findCanvasTargetNode(target)!;
      return {
        target,
        node,
        transform: node.style.transform,
        computed: getComputedStyle(node).transform,
        scale: readCanvasPointerScale(node),
        limit: canvasMoveLimits(spec, target),
      };
    });
    const box = selectionBox(snapshots[0]?.node),
      bounds = box?.getBoundingClientRect();
    if (!bounds || snapshots.some((s) => selectionBox(s.node) !== box)) return;
    const startX = event.clientX,
      startY = event.clientY,
      start = rect;
    let dx = 0,
      dy = 0,
      raf: number | null = null,
      ended = false;
    const frame = () => {
      raf = null;
      for (const s of snapshots)
        s.node.style.transform = `translate3d(${dx / s.scale}px,${dy / s.scale}px,0) ${s.computed === 'none' ? '' : s.computed}`;
      setRect({
        ...start,
        left: start.left + dx,
        right: start.right + dx,
        top: start.top + dy,
        bottom: start.bottom + dy,
      });
    };
    const update = (x: number, y: number) => {
      const previous = { ...start, left: start.left + dx, top: start.top + dy };
      dx = Math.round(
        Math.min(
          Math.max(0, bounds.right - start.right),
          Math.max(Math.min(0, bounds.left - start.left), x - startX),
        ),
      );
      dy = Math.round(
        Math.min(
          Math.max(0, bounds.bottom - start.bottom),
          Math.max(Math.min(0, bounds.top - start.top), y - startY),
        ),
      );
      for (const s of snapshots) {
        dx = Math.max(s.limit.minX * s.scale, Math.min(s.limit.maxX * s.scale, dx));
        dy = Math.max(s.limit.minY * s.scale, Math.min(s.limit.maxY * s.scale, dy));
      }
      const safe = protectFreeRect(
        snapshots[0]!.node,
        previous,
        { ...start, left: start.left + dx, top: start.top + dy },
        { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
        new DOMRect(0, 0, 0, 0),
        1,
        snapshots.map((s) => s.node),
      );
      dx = safe.left - start.left;
      dy = safe.top - start.top;
      if (raf == null) raf = requestAnimationFrame(frame);
    };
    const finish = (commit: boolean) => {
      if (ended) return;
      ended = true;
      if (raf != null) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('keydown', key, true);
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        /* capture already released */
      }
      snapshots.forEach((s) => {
        s.node.style.transform = s.transform;
      });
      document.documentElement.removeAttribute('data-lp-group-dragging');
      dragging.current = false;
      cleanup.current = null;
      if (commit && (dx || dy))
        onCommit(snapshots.map((s) => ({ target: s.target, dx: dx / s.scale, dy: dy / s.scale })));
      setRect(selectionRect(targets));
    };
    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) {
        e.preventDefault();
        update(e.clientX, e.clientY);
      }
    };
    const up = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) {
        update(e.clientX, e.clientY);
        finish(true);
      }
    };
    const cancel = () => finish(false);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      }
    };
    document.documentElement.setAttribute('data-lp-group-dragging', '1');
    dragging.current = true;
    cleanup.current = cancel;
    handle.setPointerCapture(pointerId);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', key, true);
  };
  if (!rect || typeof document === 'undefined') return null;
  const primary = targets[0]!;
  return createPortal(
    <>
      <style>{`[data-lp-group-member-selected="group"]{outline:none!important}[data-lp-group-member-selected] [data-lp-transform-chrome]{display:none!important}`}</style>
      <div
        data-lp-group-frame="1"
        data-lp-grouped={grouped ? '1' : '0'}
        style={{
          position: 'fixed',
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          border: '2px solid #f97316',
          zIndex: 45,
          pointerEvents: 'none',
        }}
      >
        {grouped ? (
          <div
            data-lp-group-selection-hit="1"
            data-lp-block-id={primary.blockId}
            data-lp-element-id={`${primary.blockId}::${primary.element}`}
            data-lp-inline-field={primary.field}
            onPointerDown={beginMove}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'auto',
              cursor: locked ? 'not-allowed' : 'grab',
              touchAction: 'none',
            }}
          />
        ) : null}
        {[
          ['0', '0'],
          ['100%', '0'],
          ['0', '100%'],
          ['100%', '100%'],
        ].map(([left, top]) => (
          <span
            key={`${left}:${top}`}
            style={{
              position: 'absolute',
              left,
              top,
              width: 9,
              height: 9,
              background: 'white',
              border: '2px solid #f97316',
              transform: 'translate(-50%,-50%)',
            }}
          />
        ))}
        <div
          data-lp-group-toolbar="1"
          style={{
            position: 'absolute',
            left: 0,
            top: rect.top > 100 ? -37 : rect.height + 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 9px',
            background: '#18181b',
            color: 'white',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <span>
            {grouped ? 'Nhóm' : 'Đã chọn'} · {targets.length}
          </span>
          {!locked && (grouped || canGroup) ? (
            <button
              type="button"
              data-lp-group-toolbar-action
              onClick={grouped ? onUngroup : onGroup}
              style={{ color: '#fdba74' }}
            >
              {grouped ? 'Bỏ nhóm' : 'Nhóm'}
            </button>
          ) : locked ? (
            <span>Đã khóa</span>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function CanvasMultiInspector({
  count,
  allText,
  grouped,
  canGroup,
  locked,
  onGroup,
  onUngroup,
  onStyle,
  onMove,
}: {
  count: number;
  allText: boolean;
  grouped: boolean;
  canGroup: boolean;
  locked: boolean;
  onGroup: () => void;
  onUngroup: () => void;
  onStyle: (patch: {
    color?: string;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
  }) => void;
  onMove: (dx: number, dy: number) => void;
}) {
  return (
    <div
      data-lp-multi-inspector
      className="space-y-4 rounded-lg border border-white/10 p-3 text-sm"
    >
      <p className="font-semibold">
        {grouped ? 'Nhóm' : 'Vùng chọn'} · {count} phần tử
      </p>
      {!locked && (grouped || canGroup) && (
        <button
          type="button"
          className="rounded bg-orange-500 px-3 py-2 text-white"
          onClick={grouped ? onUngroup : onGroup}
        >
          {grouped ? 'Bỏ nhóm' : 'Nhóm'}
        </button>
      )}
      <fieldset disabled={locked} className="space-y-3">
        <legend className="mb-2 text-xs text-white/60">Thuộc tính chung</legend>
        {(canGroup || grouped) &&
          (['x', 'y'] as const).map((axis) => (
            <label key={axis} className="flex items-center justify-between gap-2 text-xs">
              {axis === 'x' ? 'Dịch ngang (px)' : 'Dịch dọc (px)'}
              <input
                data-lp-multi-move={axis}
                type="number"
                defaultValue="0"
                className="w-24 rounded border border-white/20 bg-transparent p-2"
                onBlur={(e) => {
                  const value = Number(e.currentTarget.value);
                  if (Number.isFinite(value) && value)
                    onMove(axis === 'x' ? value : 0, axis === 'y' ? value : 0);
                  e.currentTarget.value = '0';
                }}
              />
            </label>
          ))}
        {allText && (
          <div data-lp-multi-text-controls className="space-y-3 border-t border-white/10 pt-3">
            <label className="flex items-center justify-between text-xs">
              Màu chữ
              <input
                data-lp-multi-color
                type="color"
                onChange={(e) => onStyle({ color: e.target.value })}
              />
            </label>
            <label className="flex items-center justify-between text-xs">
              Cỡ chữ
              <select
                data-lp-multi-font-size
                defaultValue=""
                className="rounded bg-zinc-900 p-2"
                onChange={(e) => onStyle({ fontSize: Number(e.target.value) })}
              >
                <option value="" disabled>
                  Chọn cỡ chữ
                </option>
                {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map((n) => (
                  <option key={n} value={n}>
                    {n}px
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((align, i) => (
                <button
                  key={align}
                  type="button"
                  data-lp-multi-text-align={align}
                  className="rounded border border-white/20 px-2 py-1"
                  onClick={() => onStyle({ textAlign: align })}
                >
                  {['Trái', 'Giữa', 'Phải'][i]}
                </button>
              ))}
            </div>
          </div>
        )}
      </fieldset>
      {locked && <p className="text-xs text-amber-200">Mở khóa vùng chọn trước khi chỉnh sửa.</p>}
    </div>
  );
}
