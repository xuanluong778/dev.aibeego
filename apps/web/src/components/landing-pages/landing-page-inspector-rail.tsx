'use client';

import { Paintbrush, FileText, LayoutTemplate, SlidersHorizontal, Plus } from 'lucide-react';
import type { ReactNode } from 'react';

export type InspectorRailId = 'design' | 'content' | 'page-theme' | 'advanced' | 'add-components';

export const INSPECTOR_PANEL_WIDTH = 320;
/** Same as the inspector dock — width must not change per element / rail surface. */
export const INSPECTOR_ADD_COMPONENTS_PANEL_WIDTH = INSPECTOR_PANEL_WIDTH;
export const INSPECTOR_RAIL_WIDTH = 44;
/** Matches portal shell `right: 0.75rem`. */
export const INSPECTOR_SHELL_RIGHT_PX = 12;
/** Matches portal shell `gap-2` between rail and panel. */
export const INSPECTOR_SHELL_GAP_PX = 8;

/** Editor-only dock width — never written into draftSpec / freeLayout. */
export function inspectorDockReservePx(
  panelOpen: boolean,
  panelWidthPx: number = INSPECTOR_PANEL_WIDTH,
): number {
  const base = INSPECTOR_SHELL_RIGHT_PX + INSPECTOR_RAIL_WIDTH;
  if (!panelOpen) return base;
  return base + INSPECTOR_SHELL_GAP_PX + panelWidthPx;
}

const RAIL_ITEMS: { id: InspectorRailId; label: string; Icon: typeof Paintbrush }[] = [
  { id: 'design', label: 'Thiết kế', Icon: Paintbrush },
  { id: 'content', label: 'Nội dung', Icon: FileText },
  { id: 'page-theme', label: 'Thiết kế tổng thể', Icon: LayoutTemplate },
  { id: 'advanced', label: 'Nâng cao', Icon: SlidersHorizontal },
  { id: 'add-components', label: '+ Thành phần', Icon: Plus },
];

type RailProps = {
  active: InspectorRailId;
  onSelect: (id: InspectorRailId) => void;
};

export function LandingPageInspectorRail({ active, onSelect }: RailProps) {
  return (
    <nav
      className="flex shrink-0 flex-col items-center gap-2 py-2"
      data-lp-inspector-rail="1"
      aria-label="Inspector"
    >
      {RAIL_ITEMS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            data-lp-inspector-rail-btn={id}
            title={label}
            aria-label={label}
            aria-current={isActive ? 'true' : undefined}
            className={
              'flex h-10 w-10 items-center justify-center rounded-full border transition ' +
              (isActive
                ? 'border-white/35 bg-white/20 text-white shadow-sm ring-2 ring-white/25'
                : 'border-white/15 bg-[#0A3D30]/90 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white')
            }
            onClick={() => onSelect(id)}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
        );
      })}
    </nav>
  );
}

type ChromeProps = {
  panelOpen: boolean;
  panelTitle: string;
  activeRail: InspectorRailId;
  onRailSelect: (id: InspectorRailId) => void;
  onClosePanel: () => void;
  headerExtra?: ReactNode;
  onHeaderPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  headerDragHandle?: boolean;
  children: ReactNode;
};

export function LandingPageInspectorRailChrome({
  panelOpen,
  panelTitle,
  activeRail,
  onRailSelect,
  onClosePanel,
  headerExtra,
  onHeaderPointerDown,
  headerDragHandle,
  children,
}: ChromeProps) {
  return (
    <div
      className="pointer-events-auto flex flex-row-reverse items-stretch gap-2"
      data-lp-inspector-rail-chrome="1"
      data-lp-inspector-panel-open={panelOpen ? '1' : '0'}
    >
      <LandingPageInspectorRail active={activeRail} onSelect={onRailSelect} />
      {panelOpen ? (
        <aside
          className="flex w-[320px] min-w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A3D30] shadow-2xl"
          data-lp-inspector
          data-lp-inspector-panel="1"
        >
          <div
            className="z-10 shrink-0 border-b border-white/10 bg-[#0A3D30]/95 px-3 py-2 backdrop-blur-sm"
            data-lp-inspector-sticky
          >
            <div
              data-lp-inspector-header
              data-lp-inspector-drag-handle={headerDragHandle ? '1' : undefined}
              className={
                'flex min-w-0 items-center gap-2 ' +
                (headerDragHandle ? 'cursor-grab select-none active:cursor-grabbing' : '')
              }
              onPointerDown={onHeaderPointerDown}
            >
              <div
                className="min-w-0 flex-1 truncate text-sm font-semibold text-white"
                data-lp-inspector-title
                title={panelTitle}
              >
                {panelTitle}
              </div>
              {headerExtra}
              <button
                type="button"
                data-lp-inspector-close
                title="Đóng panel"
                aria-label="Đóng panel"
                className="shrink-0 rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onClosePanel();
                }}
              >
                ✕
              </button>
            </div>
          </div>
          {children}
        </aside>
      ) : null}
    </div>
  );
}
