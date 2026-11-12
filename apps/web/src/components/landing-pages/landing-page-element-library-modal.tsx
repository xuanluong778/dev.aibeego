'use client';
import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { LandingPageBlockType, LandingPageCountdownLaunchStyle } from '@marketingspa/shared';
import { LandingPageCountdownLibrary } from './landing-page-countdown-library';
import {
  type LandingPageTitlePreset,
  type LandingPageParagraphPreset,
  type LandingPageListPreset,
  type TextPresetTab,
} from './landing-page-title-presets';
import { LandingPageTextLibrary } from './landing-page-text-library';
import { LandingPageGraphicsLibraryPanel } from './landing-page-graphics-library';
import type { LandingPageBoxPreset } from './landing-page-box-presets';
import type { LandingPageFormPreset } from './landing-page-form-presets';
export type ElementLibraryPicker =
  | { kind: 'text' | 'graphics' | 'icon' | 'social'; initialTab?: TextPresetTab }
  | { kind: 'block'; type: LandingPageBlockType };
export function LandingPageElementLibraryModal({
  picker,
  error,
  onClose,
  onTitle,
  onParagraph,
  onList,
  onBox,
  onForm,
  onBlock,
  onCountdown,
  onMedia,
}: {
  picker: ElementLibraryPicker | null;
  error?: string;
  onClose: () => void;
  onTitle: (p: LandingPageTitlePreset) => void;
  onParagraph: (p: LandingPageParagraphPreset) => void;
  onList: (p: LandingPageListPreset) => void;
  onBox: (p: LandingPageBoxPreset) => void;
  onForm: (p: LandingPageFormPreset) => void;
  onBlock: (type: LandingPageBlockType) => void;
  onCountdown?: (id: LandingPageCountdownLaunchStyle) => void;
  onMedia: () => void;
}) {
  const countdownLibrary = picker?.kind === 'block' && picker.type === 'Countdown';
  const label =
    picker?.kind === 'text'
      ? 'Văn bản'
      : countdownLibrary
        ? 'Bộ hẹn giờ'
        : picker?.kind === 'block'
          ? picker.type
          : picker?.kind === 'social'
            ? 'Social Media'
            : picker?.kind === 'icon'
              ? 'Biểu tượng'
              : 'Đồ họa';
  const textLibrary = picker?.kind === 'text';
  const openStamp = useRef(0);
  useEffect(() => {
    if (picker) openStamp.current = Date.now();
  }, [picker]);
  return (
    <Dialog.Root
      open={Boolean(picker)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[230] bg-black/60" />
        <Dialog.Content
          data-lp-element-library-modal={countdownLibrary ? 'countdown' : picker?.kind}
          className={`fixed left-1/2 top-1/2 z-[231] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden shadow-2xl ${textLibrary ? 'lp-text-library-modal' : countdownLibrary ? 'h-[88vh] w-[min(1240px,96vw)] rounded-2xl border border-white/10 bg-[#07060b] text-zinc-100' : 'h-[85vh] w-[min(1200px,94vw)] rounded-xl bg-white text-zinc-900'}`}
          onPointerDownOutside={(event) => {
            const age = Date.now() - (openStamp.current || 0);
            if (age < 400) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            const age = Date.now() - (openStamp.current || 0);
            if (age < 400) event.preventDefault();
          }}
        >
          <div
            className={
              textLibrary
                ? 'sr-only'
                : `flex items-center justify-between border-b px-5 py-3.5 ${countdownLibrary ? 'border-white/10' : ''}`
            }
          >
            <Dialog.Title className={`font-semibold tracking-tight ${countdownLibrary ? 'text-zinc-50' : ''}`}>
              Thư viện {label}
            </Dialog.Title>
            {!textLibrary ? (
              <Dialog.Close
                aria-label="Đóng thư viện"
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl leading-none ${countdownLibrary ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : ''}`}
              >
                ×
              </Dialog.Close>
            ) : null}
          </div>
          {textLibrary ? (
            <Dialog.Close
              aria-label="Đóng thư viện"
              className="absolute right-1 top-0 z-10 flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-900"
            >
              ×
            </Dialog.Close>
          ) : null}
          <Dialog.Description className="sr-only">
            Chọn một mẫu để chèn vào vị trí đã thả. Đóng cửa sổ để hủy.
          </Dialog.Description>
          {error ? (
            <p role="alert" className="m-4 rounded bg-red-50 p-3 text-red-800">
              {error}
            </p>
          ) : null}
          {picker?.kind === 'text' ? (
            <LandingPageTextLibrary
              initialTab={picker.initialTab}
              onTitle={onTitle}
              onParagraph={onParagraph}
              onList={onList}
            />
          ) : null}
          {picker && ['graphics', 'icon', 'social'].includes(picker.kind) ? (
            <LandingPageGraphicsLibraryPanel
              embedded
              initialCategory="graphics"
              iconsOnly={picker.kind !== 'graphics'}
              initialShapeGroup={picker.kind === 'social' ? 'social' : undefined}
              panelTitle={label}
              onClose={onClose}
              onInsertBox={onBox}
              onInsertForm={onForm}
              onInsertBlockType={onBlock}
              onOpenMediaLibrary={onMedia}
            />
          ) : null}
          {countdownLibrary ? (
            <LandingPageCountdownLibrary
              onSelect={(id) => (onCountdown ? onCountdown(id) : onBlock('Countdown'))}
            />
          ) : picker?.kind === 'block' ? (
            <div className="overflow-auto p-8">
              <button
                data-lp-element-block-template={picker.type}
                className="rounded-xl border border-zinc-300 px-10 py-8 text-left shadow-sm hover:border-sky-500"
                onClick={() => onBlock(picker.type)}
              >
                <strong className="block text-lg">{label}</strong>
                <span className="mt-2 block text-sm text-zinc-600">
                  Chèn mẫu {label} có thể chỉnh sửa
                </span>
              </button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
