'use client';

import type { ReactNode, WheelEvent as ReactWheelEvent } from 'react';
import {
  ArrowLeft,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  SlidersHorizontal,
  Tablet,
  Undo2,
  Upload,
} from 'lucide-react';

export type LandingPageBuilderViewport = 'desktop' | 'tablet' | 'mobile';

type Props = {
  viewport: LandingPageBuilderViewport;
  previewOn: boolean;
  saving?: boolean;
  /** Preview shell: hide Back; only preview/device/history/save/publish. */
  hideBack?: boolean;
  /**
   * Edit mode: center controls in the canvas column (exclude docked inspector),
   * so the cluster lines up with the device frame. Preview keeps viewport center.
   */
  alignToCanvas?: boolean;
  /** Docked inspector is in the right grid column (lg+). */
  inspectorDocked?: boolean;
  onBack: () => void;
  onPreviewChange: (on: boolean) => void;
  onViewportChange: (v: LandingPageBuilderViewport) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  /**
   * Persist + publish current canvas, then open the public URL.
   * A plain /p/slug link would show the last publishedSpec, not the look just saved.
   */
  onViewLive?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** In-flight publish request — disables double submit. */
  publishing?: boolean;
  /** Server page status after last load/publish. */
  pageStatus?: string | null;
  /** Public slug for post-publish affordance. */
  publicSlug?: string | null;
  onOpenPanel?: () => void;
};

function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-[70] -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

function IconBtn({
  label,
  active,
  disabled,
  onClick,
  children,
  testId,
  className = '',
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <Tip label={label}>
      <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        data-lp-toolbar-btn={testId}
        className={
          'inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[10px] text-white transition ' +
          'hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ' +
          (active ? 'bg-white/15 text-white ring-1 ring-emerald-300/50' : 'text-white/95') +
          ' ' + className
        }
      >
        {children}
      </button>
    </Tip>
  );
}

/**
 * Fixed builder chrome row — sits under the app header, above the canvas.
 * 3-column flex: Back | Preview+Devices | Undo/Redo/Save+Publish — never overlap.
 */
export function LandingPageBuilderToolbar({
  viewport,
  previewOn,
  saving,
  hideBack = false,
  alignToCanvas = false,
  inspectorDocked = false,
  onBack,
  onPreviewChange,
  onViewportChange,
  onUndo,
  onRedo,
  onSave,
  onPublish,
  onViewLive,
  canUndo = true,
  canRedo = true,
  publishing = false,
  pageStatus = null,
  publicSlug = null,
  onOpenPanel,
}: Props) {
  const centerInCanvas = alignToCanvas && !hideBack && !previewOn && inspectorDocked;
  const isPublished = (pageStatus || '').toUpperCase() === 'PUBLISHED';
  const publishLabel = publishing ? 'Đang publish…' : isPublished ? 'Đã xuất bản' : 'Publish';
  const publishTitle = publishing
    ? 'Đang publish…'
    : isPublished && publicSlug
      ? `Đã xuất bản — /p/${publicSlug}`
      : 'Publish';

  const blockToolbarWheel = (e: ReactWheelEvent) => {
    // Never let wheel over the toolbar scroll the page/canvas (buttons slide under header).
    e.stopPropagation();
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.preventDefault();
  };

  return (
    <div
      data-lp-compact-toolbar="1"
      data-lp-toolbar-fixed="1"
      data-lp-toolbar-centered="1"
      data-lp-toolbar-no-scroll="1"
      data-lp-toolbar-align={centerInCanvas ? 'canvas' : 'viewport'}
      data-lp-toolbar-preview-chrome={hideBack || previewOn ? '1' : '0'}
      onWheel={blockToolbarWheel}
      onWheelCapture={blockToolbarWheel}
      className={
        'sticky top-0 z-40 grid h-24 w-full min-w-0 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-1 border-b border-white/10 bg-[#0A3D30] px-1.5 sm:flex sm:h-12 sm:gap-1 sm:px-2 ' +
        (previewOn ? 'z-[200] ' : '') +
        ''
      }
      role="toolbar"
      aria-label="Landing page builder toolbar"
    >
      {/* Left: back */}
      <div className="col-start-1 row-start-1 flex shrink-0 items-center" data-lp-toolbar-back>
        {!hideBack ? (
          <IconBtn label="Quay lại" onClick={onBack} testId="back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </IconBtn>
        ) : (
          <span className="inline-block w-9" aria-hidden />
        )}
      </div>

      {/* Center: preview + devices */}
      <div
        className="col-span-3 col-start-1 row-start-2 flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1"
        data-lp-toolbar-center
      >
        <div
          className="flex h-9 shrink-0 items-center gap-1.5 px-1 sm:gap-2 sm:px-1.5"
          data-lp-preview-toggle
          data-lp-preview-on={previewOn ? '1' : '0'}
        >
          <span className="hidden whitespace-nowrap text-[13px] font-medium text-white/90 sm:inline">
            Xem trước
          </span>
          <button
            type="button"
            role="switch"
            dir="ltr"
            aria-checked={previewOn}
            aria-label="Xem trước"
            title={previewOn ? 'Xem trước: Bật' : 'Xem trước: Tắt'}
            data-lp-preview-switch
            data-state={previewOn ? 'on' : 'off'}
            onClick={() => onPreviewChange(!previewOn)}
            className={
              'relative my-3 h-[22px] w-[40px] shrink-0 rounded-full transition-colors before:absolute before:-inset-y-3 before:inset-x-0 ' +
              (previewOn ? 'bg-emerald-400' : 'bg-zinc-400/80')
            }
          >
            <span
              data-lp-preview-knob={previewOn ? 'right' : 'left'}
              aria-hidden
              className={
                'pointer-events-none absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-[left] duration-150 ease-out ' +
                (previewOn ? 'left-[20px]' : 'left-[2px]')
              }
            />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5" data-lp-device-switcher>
          <IconBtn
            label="Desktop"
            active={viewport === 'desktop'}
            onClick={() => onViewportChange('desktop')}
            testId="desktop"
          >
            <Monitor className="h-4 w-4" strokeWidth={1.75} />
          </IconBtn>
          <IconBtn
            label="Tablet"
            active={viewport === 'tablet'}
            onClick={() => onViewportChange('tablet')}
            testId="tablet"
          >
            <Tablet className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </IconBtn>
          <IconBtn
            label="Mobile"
            active={viewport === 'mobile'}
            onClick={() => onViewportChange('mobile')}
            testId="mobile"
          >
            <Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
          </IconBtn>
        </div>
      </div>

      {/* Right: history + save + publish — never absolute-overlaid */}
      <div
        className="col-span-2 col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-0.5 sm:gap-1"
        data-lp-toolbar-actions
      >
        {onOpenPanel && !previewOn ? (
          <IconBtn label="Mở bảng thuộc tính" onClick={onOpenPanel} testId="inspector" className="xl:hidden">
            <SlidersHorizontal className="h-4 w-4" />
          </IconBtn>
        ) : null}
        <div className="flex shrink-0 items-center gap-0.5" data-lp-toolbar-history>
          <IconBtn
            label="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={onUndo}
            testId="undo"
          >
            <Undo2 className="h-4 w-4" strokeWidth={2} />
          </IconBtn>
          <IconBtn
            label="Redo (Ctrl+Y)"
            disabled={!canRedo}
            onClick={onRedo}
            testId="redo"
          >
            <Redo2 className="h-4 w-4" strokeWidth={2} />
          </IconBtn>
          <IconBtn
            label="Lưu"
            disabled={saving}
            onClick={onSave}
            testId="save"
            className="enabled:hover:text-[#FF6B00] enabled:focus-visible:text-[#FF6B00]"
          >
            <Save className="h-4 w-4" strokeWidth={1.75} />
          </IconBtn>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pl-0.5" data-lp-toolbar-publish>
          {isPublished && publicSlug && !publishing ? (
            <button
              type="button"
              onClick={() => onViewLive?.()}
              className="hidden h-11 items-center rounded-[10px] border border-white/20 px-2.5 text-[12px] font-medium text-white/90 transition hover:bg-white/10 xl:inline-flex"
              data-lp-public-link
              title="Xuất bản bản đang lưu rồi mở trang công khai"
            >
              Xem live
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            className={
              'inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-semibold text-white transition sm:px-3 disabled:cursor-wait disabled:opacity-70 ' +
              (isPublished && !publishing
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-[#F97316] hover:bg-[#ea6c0c]')
            }
            data-lp-publish-btn
            data-lp-publish-state={publishing ? 'busy' : isPublished ? 'published' : 'draft'}
            title={publishTitle}
            aria-label={publishLabel}
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{publishLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
