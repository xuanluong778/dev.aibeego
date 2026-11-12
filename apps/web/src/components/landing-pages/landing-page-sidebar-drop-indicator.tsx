'use client';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { getSidebarDropTarget, subscribeSidebarDrop } from './landing-page-sidebar-dnd';

export function LandingPageSidebarDropIndicator() {
  const target = useSyncExternalStore(subscribeSidebarDrop, getSidebarDropTarget, () => null);
  if (!target || typeof document === 'undefined') return null;
  const canvas = document.querySelector('[data-lp-canvas-root]') as HTMLElement | null;
  if (!canvas) return null;
  const bar = target.line;
  const vertical = target.orientation === 'vertical';
  const box = bar ?? target.region;
  return createPortal(
    <div
      data-lp-sidebar-drop-indicator="1"
      data-lp-drop-section={target.sectionId}
      data-lp-drop-mode={target.position.mode}
      data-lp-drop-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
    >
      <style>{`
        [data-lp-drop-line],[data-lp-drop-image-target]{
          background:#ffffff!important;
          box-sizing:border-box!important;
          border:2px dashed #2563EB!important;
        }
        [data-lp-drop-plus]{
          color:#2563EB!important;
          font-size:14px;
          font-weight:700;
          line-height:1;
          pointer-events:none;
          user-select:none;
        }
      `}</style>
      {bar ? (
        <div
          data-lp-drop-line
          data-lp-drop-bar={vertical ? 'column' : '20'}
          style={{
            position: 'fixed',
            overflow: 'hidden',
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            boxSizing: 'border-box',
            border: '2px dashed #2563EB',
            borderRadius: 4,
            boxShadow: '0 0 0 1px rgba(37,99,235,0.22)',
          }}
        >
          <span data-lp-drop-plus aria-hidden>+</span>
        </div>
      ) : (
        <div
          data-lp-drop-image-target
          style={{
            position: 'fixed',
            overflow: 'hidden',
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            boxSizing: 'border-box',
            border: '2px dashed #2563EB',
          }}
        >
          <span data-lp-drop-plus aria-hidden>+</span>
        </div>
      )}
    </div>,
    document.body,
  );
}
