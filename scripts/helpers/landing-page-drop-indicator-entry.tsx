import React from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPageSidebarDropIndicator } from '../../apps/web/src/components/landing-pages/landing-page-sidebar-drop-indicator';
import {
  beginSidebarPresetDrag,
  readSidebarDragPayload,
  showSidebarDropTarget,
} from '../../apps/web/src/components/landing-pages/landing-page-sidebar-dnd';
import { resolveSidebarDropTarget } from '../../apps/web/src/components/landing-pages/landing-page-section-insert-target';
const state = window as any;
state.__background = (color: string, layer = false) => {
  const host = document.querySelector<HTMLElement>('[data-lp-block-id="form"]')!;
  host.querySelector('[data-lp-section-bg-layer]')?.remove();
  host.style.background = layer ? '#212830' : color;
  host.style.color = color === '#ffffff' || color === '#f7f7f7' ? '#212830' : '#ffffff';
  if (layer) {
    const paint = document.createElement('div');
    paint.dataset.lpSectionBgLayer = '1';
    Object.assign(paint.style, {
      position: 'absolute',
      inset: '0',
      background: color,
      pointerEvents: 'none',
    });
    host.prepend(paint);
  }
};
state.__drops = [];
state.__zoom = (scale: number) => {
  const e = document.querySelector<HTMLElement>('[data-lp-canvas-root]')!;
  e.style.transform = `scale(${scale})`;
};
function over(e: React.DragEvent<HTMLElement>, drop = false) {
  const payload = readSidebarDragPayload(e.dataTransfer),
    root = e.currentTarget.closest<HTMLElement>('[data-lp-canvas-root]')!;
  const target = payload ? resolveSidebarDropTarget(root, e.currentTarget, payload, e) : null;
  e.stopPropagation();
  if (target) e.preventDefault();
  state.__target = target;
  if (drop) {
    if (target) state.__drops.push(target.position);
    showSidebarDropTarget(null);
  } else showSidebarDropTarget(target);
}
function App() {
  return (
    <>
      <div style={{ height: 70, padding: '12px 20px', background: '#182431', color: '#fff' }}>
        <button
          id="text-tile"
          draggable
          onDragStart={(e) =>
            beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'text' }, 'Văn bản')
          }
          style={{ padding: '8px 20px', background: '#e2e8f0', color: '#17212b', borderRadius: 6 }}
        >
          Văn bản
        </button>
      </div>
      <main data-lp-canvas-root style={{ margin: 20, transformOrigin: 'top left' }}>
        <div
          data-lp-section-chrome="1"
          data-lp-block-id="hero"
          data-lp-block-type="Hero"
          onDragOver={(e) => over(e)}
          onDrop={(e) => over(e, true)}
          style={{ height: 200, background: '#ffffff', padding: 24 }}
        >
          <section>
            <h1 data-lp-inline-field="headline" style={{ fontSize: 26, margin: 0 }}>
              Giới thiệu ý tưởng của bạn
            </h1>
            <p>Thanh ngang báo chính xác vị trí chèn.</p>
          </section>
        </div>
        <div
          data-lp-section-chrome="1"
          data-lp-block-id="form"
          data-lp-block-type="LeadForm"
          onDragOver={(e) => over(e)}
          onDrop={(e) => over(e, true)}
          style={{
            height: 340,
            background: '#212830',
            padding: 24,
            color: '#fff',
            position: 'relative',
          }}
        >
          <section style={{ position: 'relative' }}>
            <h2 data-lp-inline-field="headline" style={{ margin: '0 0 32px', fontSize: 24 }}>
              <span>Kết nối với chúng tôi</span>
            </h2>
            <form
              data-lp-form-block
              style={{ width: 'min(340px,100%)' }}
              onSubmit={(e) => e.preventDefault()}
            >
              <button
                type="submit"
                style={{ height: 44, width: 150, background: '#00418e', color: '#fff' }}
              >
                <span data-lp-inline-field="submitLabel">Đăng ký ngay</span>
              </button>
            </form>
          </section>
        </div>
      </main>
      <LandingPageSidebarDropIndicator />
    </>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
