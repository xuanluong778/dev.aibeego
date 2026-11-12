'use client';

import { useRef, useState } from 'react';
import type { LandingPageImageStyle } from '@marketingspa/shared';
import { apiUpload } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  pageId: string;
  label?: string;
  imageUrl?: string | null;
  imageStyle?: LandingPageImageStyle;
  onChange: (next: { imageUrl: string | null; imageStyle?: LandingPageImageStyle }) => void;
  disabled?: boolean;
};

export function LandingPageImageField({
  pageId,
  label = 'Ảnh',
  imageUrl,
  imageStyle,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr('');
    const ext = file.name.toLowerCase();
    if (
      !ALLOWED.has(file.type) &&
      !/\.(jpe?g|png|webp|gif)$/i.test(ext)
    ) {
      setErr('Chỉ JPG/PNG/WebP (GIF ok)');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr('File tối đa 10MB');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>(`/landing-pages/${pageId}/upload-image`, fd);
      onChange({
        imageUrl: res.url,
        imageStyle: {
          ...imageStyle,
          alt: imageStyle?.alt || file.name.replace(/\.[^.]+$/, '').slice(0, 80),
        },
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function patchStyle(patch: Partial<LandingPageImageStyle>) {
    onChange({
      imageUrl: imageUrl ?? null,
      imageStyle: { ...imageStyle, ...patch },
    });
  }

  return (
    <div className="space-y-2 rounded border border-white/10 p-2" data-lp-image-field data-inspector-field="image">
      <div className="text-[10px] font-semibold uppercase opacity-60">{label}</div>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageStyle?.alt || ''}
          className="h-28 w-full rounded object-cover"
          style={{
            objectFit: imageStyle?.fit || 'cover',
            objectPosition: imageStyle?.position || 'center',
            borderRadius: imageStyle?.borderRadius || undefined,
          }}
        />
      ) : (
        <div className="flex h-20 items-center justify-center rounded border border-dashed border-white/20 text-[11px] opacity-50">
          Chưa có ảnh
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px]"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Đang tải…' : imageUrl ? 'Replace' : 'Upload'}
        </Button>
        {imageUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[10px] text-red-300"
            disabled={disabled || busy}
            onClick={() => onChange({ imageUrl: null, imageStyle })}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {err ? <p className="text-[10px] text-amber-300">{err}</p> : null}
      <Label className="text-[10px]">Alt text</Label>
      <Input
        className="h-8 text-xs"
        value={imageStyle?.alt || ''}
        disabled={disabled}
        onChange={(e) => patchStyle({ alt: e.target.value })}
        placeholder="Mô tả ảnh"
        data-lp-image-alt
      />
      <Label className="text-[10px]">Link</Label>
      <Input
        className="h-8 text-xs"
        value={imageStyle?.href || ''}
        disabled={disabled}
        onChange={(e) => patchStyle({ href: e.target.value || undefined })}
        placeholder="https://… hoặc #lead-form"
        data-lp-image-link
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10px]">
          <span className="mb-0.5 block opacity-60">Fit</span>
          <select
            className="lp-dark-select w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
            value={imageStyle?.fit || 'cover'}
            disabled={disabled}
            onChange={(e) =>
              patchStyle({ fit: e.target.value === 'contain' ? 'contain' : 'cover' })
            }
          >
            <option value="cover">cover</option>
            <option value="contain">contain</option>
          </select>
        </label>
        <label className="text-[10px]">
          <span className="mb-0.5 block opacity-60">Position</span>
          <select
            className="lp-dark-select w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white"
            value={imageStyle?.position || 'center'}
            disabled={disabled}
            onChange={(e) => patchStyle({ position: e.target.value })}
          >
            <option value="center">center</option>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
        </label>
      </div>
      <Label className="text-[10px]">Border radius</Label>
      <Input
        className="h-8 text-xs"
        value={imageStyle?.borderRadius || ''}
        disabled={disabled}
        onChange={(e) => patchStyle({ borderRadius: e.target.value })}
        placeholder="12px / 50% / var(--lp-radius)"
      />
    </div>
  );
}
