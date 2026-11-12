'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import { apiUpload } from '@/lib/api-client';
import {
  applySectionSettingsChange,
  parseHexAlpha,
  readSectionSettings,
  safeSectionMediaUrl,
  sectionTitle,
  type SectionBgKind,
  type SectionBorderStyle,
  type SectionSettingsChange,
  type SectionVisibility,
} from './landing-page-section-settings';

const ACCENT = '#2F80ED';
const POSITIONS = [
  ['left top', 'center top', 'right top'],
  ['left center', 'center center', 'right center'],
  ['left bottom', 'center bottom', 'right bottom'],
] as const;

type Props = {
  block: LandingPageBlock;
  pageId: string;
  /** Inside the right inspector. The inspector header already names the section and closes the panel. */
  embedded?: boolean;
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onClose?: () => void;
  onUpdateBlock: (
    id: string,
    patch: Partial<LandingPageBlock>,
    opts?: { coalesce?: boolean },
  ) => void;
  /** Close a coalesce gesture (slider/color drag) so the next edit is a new undo step. */
  onEndGesture?: () => void;
  onPickImage: () => void;
};

function commit(
  block: LandingPageBlock,
  change: SectionSettingsChange,
  onUpdateBlock: Props['onUpdateBlock'],
  opts?: { coalesce?: boolean },
) {
  onUpdateBlock(block.id, applySectionSettingsChange(block, change), opts);
}

export function LandingPageSectionSettingsPanel({
  block,
  pageId,
  embedded = false,
  pinned = false,
  onPinnedChange,
  onClose,
  onUpdateBlock,
  onEndGesture,
  onPickImage,
}: Props) {
  const view = readSectionSettings(block);
  const [advanced, setAdvanced] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(view.color.hex8);
  const [hexFocused, setHexFocused] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlOpen, setUrlOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const colorPop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hexFocused) setHexDraft(view.color.hex8);
  }, [view.color.hex8, hexFocused, block.id]);

  useEffect(() => {
    setUrlDraft(view.kind === 'video' ? view.videoUrl || '' : view.imageUrl || '');
    setUrlOpen(false);
    setUploadError('');
  }, [block.id, view.kind, view.imageUrl, view.videoUrl]);

  useEffect(() => {
    if (!colorOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!colorPop.current?.contains(event.target as Node)) setColorOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [colorOpen]);

  const applyUrl = () => {
    const safe = safeSectionMediaUrl(urlDraft);
    if (!safe) {
      setUploadError('Chỉ nhận URL http(s) hoặc đường dẫn trên site.');
      return;
    }
    setUploadError('');
    if (view.kind === 'video') commit(block, { videoUrl: safe, mediaOn: true, kind: 'video' }, onUpdateBlock);
    else commit(block, { imageUrl: safe, mediaOn: true, kind: 'image' }, onUpdateBlock);
  };

  const uploadFile = async (file: File) => {
    setUploadError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await apiUpload<{ url?: string; message?: string }>(
        `/landing-pages/${pageId}/upload-background`,
        form,
      );
      if (!res.url) {
        setUploadError('Không nhận được đường dẫn file.');
        return;
      }
      if (view.kind === 'video') {
        commit(block, { videoUrl: res.url, mediaOn: true, kind: 'video' }, onUpdateBlock);
      } else {
        commit(block, { imageUrl: res.url, mediaOn: true, kind: 'image' }, onUpdateBlock);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Tải file không thành công.');
    }
  };

  const preview = view.kind === 'video' ? view.videoUrl : view.imageUrl;

  const body = (
      <div className={embedded ? 'space-y-4' : 'min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3'}>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600">Màu nền</span>
          <div className="relative flex items-center gap-2" ref={colorPop}>
            <button
              type="button"
              data-lp-section-color-swatch="1"
              className="h-7 w-7 shrink-0 rounded-full border border-slate-300"
              style={{ background: view.color.hex }}
              onClick={() => setColorOpen((v) => !v)}
            />
            <input
              data-lp-section-color-hex="1"
              className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs uppercase"
              value={hexDraft}
              spellCheck={false}
              onFocus={() => setHexFocused(true)}
              onBlur={() => {
                setHexFocused(false);
                onEndGesture?.();
                // Valid hex is already committed in onChange. Never re-commit on blur:
                // after Ctrl+Z the input can still hold the old draft and would overwrite
                // the restored background. Just resync the display to live view.
                const trimmed = hexDraft.trim();
                if (
                  !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(trimmed) ||
                  parseHexAlpha(trimmed).hex8 !== view.color.hex8
                ) {
                  setHexDraft(view.color.hex8);
                }
              }}
              onChange={(e) => {
                const value = e.target.value;
                setHexDraft(value);
                if (/^#[0-9a-fA-F]{8}$/.test(value.trim()) || /^#[0-9a-fA-F]{6}$/.test(value.trim())) {
                  commit(block, { background: parseHexAlpha(value).hex8 }, onUpdateBlock, {
                    coalesce: true,
                  });
                }
              }}
            />
            {colorOpen ? (
              <div className="absolute left-0 top-9 z-20 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                <input
                  type="color"
                  aria-label="Chọn màu nền"
                  className="h-9 w-full cursor-pointer"
                  value={view.color.hex}
                  onPointerUp={() => onEndGesture?.()}
                  onBlur={() => onEndGesture?.()}
                  onChange={(e) => {
                    const picked = parseHexAlpha(e.target.value);
                    const alpha = view.color.alpha > 0 ? view.color.alpha : 1;
                    const aa = Math.round(alpha * 255)
                      .toString(16)
                      .padStart(2, '0');
                    commit(block, { background: `${picked.hex}${aa}` }, onUpdateBlock, {
                      coalesce: true,
                    });
                  }}
                />
                <SliderNumber
                  label="Độ trong suốt"
                  min={0}
                  max={100}
                  value={Math.round(view.color.alpha * 100)}
                  suffix="%"
                  onGestureEnd={onEndGesture}
                  onChange={(n) =>
                    commit(
                      block,
                      {
                        background: parseHexAlpha(
                          view.color.hex +
                            Math.round((n / 100) * 255)
                              .toString(16)
                              .padStart(2, '0'),
                        ).hex8,
                      },
                      onUpdateBlock,
                      { coalesce: true },
                    )
                  }
                />
              </div>
            ) : null}
          </div>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Phương tiện nền</span>
            <Toggle on={view.mediaOn} label="Phương tiện nền" onChange={(on) => commit(block, { mediaOn: on }, onUpdateBlock)} />
          </div>
          {view.mediaOn ? (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-200/70 p-1" data-lp-section-media-tabs="1">
                {(['image', 'video'] as SectionBgKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    data-lp-section-media-tab={kind}
                    className="rounded px-2 py-1 text-xs font-medium"
                    style={view.kind === kind ? { background: '#fff', color: ACCENT } : { color: '#64748b' }}
                    onClick={() => commit(block, { kind }, onUpdateBlock)}
                  >
                    {kind === 'image' ? 'Ảnh' : 'Video'}
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                {preview ? (
                  view.kind === 'video' ? (
                    <video src={preview} muted className="h-28 w-full object-cover" />
                  ) : (
                    <img src={preview} alt="" className="h-28 w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-28 items-center justify-center text-[11px] text-slate-400">Chưa có media</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-8 flex-1 rounded-md border border-slate-200 bg-white text-xs font-medium"
                  onClick={() => {
                    if (view.kind === 'image') onPickImage();
                    else fileRef.current?.click();
                  }}
                >
                  {preview ? 'Thay thế' : 'Chọn hoặc tải file'}
                </button>
                <button
                  type="button"
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                  onClick={() => setUrlOpen((v) => !v)}
                >
                  URL
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept={view.kind === 'video' ? 'video/mp4,video/webm,.mp4,.webm' : 'image/jpeg,image/png,image/webp,image/gif'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) {
                    if (view.kind === 'image') {
                      const formWait = file;
                      void uploadFile(formWait);
                    } else void uploadFile(file);
                  }
                }}
              />
              {view.kind === 'image' ? (
                <button type="button" className="text-[11px] underline" style={{ color: ACCENT }} onClick={() => fileRef.current?.click()}>
                  Tải ảnh từ máy
                </button>
              ) : null}
              {urlOpen ? (
                <div className="flex gap-1">
                  <input
                    data-lp-section-media-url="1"
                    className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs"
                    placeholder="https://… hoặc /uploads/…"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                  />
                  <button type="button" className="h-8 rounded-md px-2 text-xs text-white" style={{ background: ACCENT }} onClick={applyUrl}>
                    Dùng
                  </button>
                </div>
              ) : null}
              {uploadError ? <p className="text-[11px] text-red-600">{uploadError}</p> : null}
              <SliderNumber
                label={view.kind === 'video' ? 'Video độ đậm nhạt' : 'Ảnh độ đậm nhạt'}
                min={0}
                max={100}
                value={view.opacity}
                suffix="%"
                onGestureEnd={onEndGesture}
                onChange={(opacity) => commit(block, { opacity }, onUpdateBlock, { coalesce: true })}
              />
              {view.kind === 'image' ? (
                <label className="block space-y-1">
                  <span className="text-xs text-slate-600">Lặp</span>
                  <select
                    data-lp-section-bg-repeat="1"
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                    value={view.repeat}
                    onChange={(e) => commit(block, { repeat: e.target.value }, onUpdateBlock)}
                  >
                    <option value="no-repeat">Không lặp lại</option>
                    <option value="repeat">Lặp lại</option>
                    <option value="repeat-x">Lặp ngang</option>
                    <option value="repeat-y">Lặp dọc</option>
                  </select>
                </label>
              ) : null}
              <SliderNumber
                label="Kích thước"
                min={1}
                max={100}
                value={view.size}
                suffix="%"
                onGestureEnd={onEndGesture}
                onChange={(size) => commit(block, { size }, onUpdateBlock, { coalesce: true })}
              />
              <div className="space-y-1">
                <span className="text-xs text-slate-600">Vị trí</span>
                <div className="grid w-fit grid-cols-3 gap-1 rounded-md border border-slate-200 bg-white p-2" data-lp-section-bg-position="1">
                  {POSITIONS.flat().map((pos) => {
                    const on = view.position === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        aria-label={pos}
                        data-lp-section-bg-pos={pos}
                        className="flex h-7 w-7 items-center justify-center rounded border border-slate-200"
                        onClick={() => commit(block, { position: pos }, onUpdateBlock)}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: on ? ACCENT : 'transparent' }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-600">Độ rộng nền</span>
          <div className="flex gap-2" data-lp-section-bg-span="1">
            <IconChoice on={view.span === 'full'} label="Toàn chiều rộng" onClick={() => commit(block, { span: 'full' }, onUpdateBlock)}>
              <FullWidthIcon />
            </IconChoice>
            <IconChoice on={view.span === 'frame'} label="Theo khung nội dung" onClick={() => commit(block, { span: 'frame' }, onUpdateBlock)}>
              <FrameWidthIcon />
            </IconChoice>
          </div>
          <SliderNumber
            label="Trên và dưới"
            min={0}
            max={100}
            value={view.padY}
            suffix="%"
            onGestureEnd={onEndGesture}
            onChange={(padY) => commit(block, { padY }, onUpdateBlock, { coalesce: true })}
          />
          <SliderNumber
            label="Trái và phải"
            min={0}
            max={100}
            value={view.padX}
            suffix="%"
            onGestureEnd={onEndGesture}
            onChange={(padX) => commit(block, { padX }, onUpdateBlock, { coalesce: true })}
          />
        </div>

        <div className="border-t border-slate-200 pt-2">
          <button
            type="button"
            data-lp-section-advanced={advanced ? 'open' : 'closed'}
            className="flex w-full items-center justify-between py-1 text-xs font-medium text-slate-600"
            onClick={() => setAdvanced((v) => !v)}
          >
            Cài đặt nâng cao
            <span aria-hidden>{advanced ? '▴' : '▾'}</span>
          </button>
          {advanced ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Viền</span>
                <Toggle on={view.borderOn} label="Viền" onChange={(borderOn) => commit(block, { borderOn }, onUpdateBlock)} />
              </div>
              {view.borderOn ? (
                <div className="space-y-2">
                  <SliderNumber
                    label="Độ dày"
                    min={0}
                    max={40}
                    value={view.borderWidth}
                    suffix="px"
                    onGestureEnd={onEndGesture}
                    onChange={(borderWidth) =>
                      commit(block, { borderWidth }, onUpdateBlock, { coalesce: true })
                    }
                  />
                  <select
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                    value={view.borderStyle}
                    onChange={(e) => commit(block, { borderStyle: e.target.value as SectionBorderStyle }, onUpdateBlock)}
                  >
                    <option value="solid">Liền</option>
                    <option value="dashed">Đứt</option>
                    <option value="dotted">Chấm</option>
                    <option value="double">Đôi</option>
                  </select>
                  <HexField
                    value={view.borderColor}
                    onChange={(borderColor) => commit(block, { borderColor }, onUpdateBlock)}
                  />
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="text-xs">Bán kính</span>
                <Toggle on={view.radiusOn} label="Bán kính" onChange={(radiusOn) => commit(block, { radiusOn }, onUpdateBlock)} />
              </div>
              {view.radiusOn ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Corner value={view.radius.tl} onChange={(tl) => commit(block, { radius: { tl } }, onUpdateBlock)} />
                    <span />
                    <Corner value={view.radius.tr} onChange={(tr) => commit(block, { radius: { tr } }, onUpdateBlock)} />
                    <button
                      type="button"
                      data-lp-section-radius-lock={view.radius.linked ? '1' : '0'}
                      className="col-start-2 h-7 w-7 rounded border border-slate-200 bg-white text-xs"
                      title={view.radius.linked ? 'Mở khóa 4 góc' : 'Khóa 4 góc'}
                      onClick={() => commit(block, { radius: { linked: !view.radius.linked, tl: view.radius.tl } }, onUpdateBlock)}
                    >
                      {view.radius.linked ? '🔒' : '🔓'}
                    </button>
                    <Corner value={view.radius.bl} onChange={(bl) => commit(block, { radius: { bl } }, onUpdateBlock)} />
                    <span />
                    <Corner value={view.radius.br} onChange={(br) => commit(block, { radius: { br } }, onUpdateBlock)} />
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="text-xs">Bóng</span>
                <Toggle on={view.shadowOn} label="Bóng" onChange={(shadowOn) => commit(block, { shadowOn }, onUpdateBlock)} />
              </div>
              {view.shadowOn ? (
                <div className="space-y-2">
                  <SliderNumber
                    label="Vị trí X"
                    min={-200}
                    max={200}
                    value={view.shadow.x}
                    suffix="px"
                    onGestureEnd={onEndGesture}
                    onChange={(x) => commit(block, { shadow: { x } }, onUpdateBlock, { coalesce: true })}
                  />
                  <SliderNumber
                    label="Vị trí Y"
                    min={-200}
                    max={200}
                    value={view.shadow.y}
                    suffix="px"
                    onGestureEnd={onEndGesture}
                    onChange={(y) => commit(block, { shadow: { y } }, onUpdateBlock, { coalesce: true })}
                  />
                  <SliderNumber
                    label="Trải"
                    min={0}
                    max={80}
                    value={view.shadow.spread}
                    suffix="px"
                    onGestureEnd={onEndGesture}
                    onChange={(spread) =>
                      commit(block, { shadow: { spread } }, onUpdateBlock, { coalesce: true })
                    }
                  />
                  <SliderNumber
                    label="Mờ"
                    min={0}
                    max={120}
                    value={view.shadow.blur}
                    suffix="px"
                    onGestureEnd={onEndGesture}
                    onChange={(blur) =>
                      commit(block, { shadow: { blur } }, onUpdateBlock, { coalesce: true })
                    }
                  />
                  <HexField value={view.shadow.color} onChange={(color) => commit(block, { shadow: { color: color.slice(0, 7) } }, onUpdateBlock)} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-3">
          <span className="text-xs font-medium text-slate-600">Tính năng hiển thị</span>
          <div className="grid grid-cols-3 gap-1.5" data-lp-section-visibility="1">
            {(
              [
                ['all', 'Tất cả thiết bị'],
                ['mobile', 'Chỉ dành cho di động'],
                ['desktop', 'Chỉ dành cho desktop'],
              ] as Array<[SectionVisibility, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                data-lp-section-visibility-mode={id}
                className="flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-center text-[10px] leading-tight"
                style={
                  view.visibility === id
                    ? { borderColor: ACCENT, color: ACCENT, background: '#eff6ff' }
                    : { borderColor: '#e2e8f0', background: '#fff' }
                }
                onClick={() => commit(block, { visibility: id }, onUpdateBlock)}
              >
                {id === 'mobile' ? <PhoneIcon /> : id === 'desktop' ? <DesktopIcon /> : <DevicesIcon />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return (
      <div data-lp-section-settings="1" data-lp-section-settings-dock="inspector" className="rounded-lg bg-[#f7f8fa] p-3 text-slate-800">
        {body}
      </div>
    );
  }

  return (
    <aside
      data-lp-section-settings="1"
      data-lp-section-settings-dock="left"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#f7f8fa] text-slate-800 shadow-sm"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold uppercase tracking-wide text-slate-600">
          {sectionTitle(block)}
        </h2>
        <button
          type="button"
          data-lp-section-settings-pin={pinned ? '1' : '0'}
          aria-pressed={pinned}
          title={pinned ? 'Bỏ ghim' : 'Ghim bảng'}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
          style={pinned ? { color: ACCENT } : undefined}
          onClick={() => onPinnedChange?.(!pinned)}
        >
          <PinIcon filled={pinned} />
        </button>
        <button
          type="button"
          data-lp-section-settings-close="1"
          title="Đóng"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
          onClick={() => onClose?.()}
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
      </header>
      {body}
    </aside>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="relative h-5 w-9 rounded-full transition"
      style={{ background: on ? ACCENT : '#cbd5e1' }}
      onClick={() => onChange(!on)}
    >
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" style={{ left: on ? '18px' : '2px' }} />
    </button>
  );
}

function SliderNumber({
  label,
  min,
  max,
  value,
  suffix,
  onChange,
  onGestureEnd,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix: string;
  onChange: (n: number) => void;
  onGestureEnd?: () => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between text-xs text-slate-600">
        {label}
        <span className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            className="h-6 w-14 rounded border border-slate-200 bg-white px-1 text-right text-[11px]"
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={() => onGestureEnd?.()}
          />
          <span>{suffix}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ accentColor: ACCENT }}
        className="w-full"
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => onGestureEnd?.()}
        onPointerCancel={() => onGestureEnd?.()}
        onBlur={() => onGestureEnd?.()}
      />
    </label>
  );
}

function HexField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const parsed = parseHexAlpha(value);
  return (
    <div className="flex items-center gap-2">
      <input type="color" className="h-7 w-9 cursor-pointer" value={parsed.hex} onChange={(e) => onChange(parseHexAlpha(e.target.value).hex8)} />
      <input
        className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs uppercase"
        value={parsed.hex8}
        onChange={(e) => {
          if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(e.target.value.trim())) onChange(parseHexAlpha(e.target.value).hex8);
        }}
      />
    </div>
  );
}

function Corner({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex h-8 items-center justify-between rounded-md border border-slate-200 bg-white px-1">
      <button type="button" className="h-6 w-6 text-slate-500" onClick={() => onChange(Math.max(0, value - 1))}>
        −
      </button>
      <input
        type="number"
        className="w-10 bg-transparent text-center text-xs"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
      />
      <button type="button" className="h-6 w-6 text-slate-500" onClick={() => onChange(Math.min(200, value + 1))}>
        +
      </button>
    </div>
  );
}

function IconChoice({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white"
      style={on ? { borderColor: ACCENT, color: ACCENT, background: '#eff6ff' } : { borderColor: '#e2e8f0' }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M9 4h6l-1 6h4l-7 10 1-6H8l1-10z" />
    </svg>
  );
}
function FullWidthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="18" height="12" rx="1" />
    </svg>
  );
}
function FrameWidthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}
function DevicesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2" y="5" width="14" height="10" rx="1" />
      <rect x="14" y="9" width="8" height="10" rx="1" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="7" y="2" width="10" height="20" rx="2" />
    </svg>
  );
}
function DesktopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
