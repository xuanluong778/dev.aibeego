'use client';

/**
 * Canva-style «Đồ họa» library for Landing Page Builder.
 * Home = category grid → drill-in asset list (search + scroll + back).
 * Reuses existing box presets + sidebar DnD / free-drag / resize / rotate.
 */

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { LandingPageBlockType } from '@marketingspa/shared';
import {
  LP_BOX_PRESETS,
  boxPreviewStyle,
  isLandingPageFramePreset,
  isLandingPageGridPreset,
  type LandingPageBoxPreset,
} from './landing-page-box-presets';
import {
  LP_SHAPE_GROUPS,
  LP_SHAPE_SILHOUETTES,
  type LandingPageShapeGroupId,
} from './landing-page-shape-silhouettes';
import {
  LP_GRAPHICS_ICON_ASSETS,
  LP_GRAPHICS_ICON_GROUPS,
  type LandingPageGraphicsIconGroupId,
} from './landing-page-graphics-icons';
import {
  LP_PHOTO_GROUPS,
  LP_PHOTO_PRESETS,
  type LandingPagePhotoGroupId,
} from './landing-page-photo-presets';
import {
  LP_CHART_GROUPS,
  LP_CHART_PRESETS,
  type LandingPageChartGroupId,
} from './landing-page-chart-presets';
import {
  LP_FORM_GROUPS,
  LP_FORM_PRESETS,
  type LandingPageFormGroupId,
  type LandingPageFormPreset,
} from './landing-page-form-presets';
import { beginSidebarPresetDrag, suppressClickAfterSidebarDrag } from './landing-page-sidebar-dnd';
import { cn } from '@/lib/utils';

export type LandingPageGraphicsCategoryId =
  | 'shapes'
  | 'boxes'
  | 'graphics'
  | 'effects'
  | 'photos'
  | 'video'
  | 'audio'
  | 'charts'
  | 'forms'
  | 'sheets'
  | 'tables'
  | 'frames'
  | 'grids'
  | 'mockup'
  | 'threed';

export type LandingPageGraphicsCategory = {
  id: LandingPageGraphicsCategoryId;
  label: string;
  /** Tailwind-ish gradient for the tile face. */
  tileClass: string;
  icon: ReactNode;
};

export type LandingPageGraphicsAsset =
  | {
      kind: 'box';
      id: string;
      label: string;
      category: LandingPageGraphicsCategoryId;
      keywords?: string;
      subgroup?:
        | LandingPageShapeGroupId
        | LandingPageGraphicsIconGroupId
        | LandingPagePhotoGroupId
        | LandingPageChartGroupId
        | LandingPageFormGroupId;
      premium?: boolean;
      preset: LandingPageBoxPreset;
    }
  | {
      kind: 'form';
      id: string;
      label: string;
      category: LandingPageGraphicsCategoryId;
      keywords?: string;
      subgroup?: LandingPageFormGroupId;
      formPreset: LandingPageFormPreset;
      preview: { bg: string; accent: string };
    }
  | {
      kind: 'block';
      id: string;
      label: string;
      category: LandingPageGraphicsCategoryId;
      keywords?: string;
      subgroup?: LandingPagePhotoGroupId;
      premium?: boolean;
      blockType: LandingPageBlockType;
      previewStyle?: CSSProperties;
      previewLabel?: string;
    }
  | {
      kind: 'media';
      id: string;
      label: string;
      category: LandingPageGraphicsCategoryId;
      keywords?: string;
      subgroup?: LandingPagePhotoGroupId;
      premium?: boolean;
      action: 'open-library';
      previewStyle?: CSSProperties;
      previewLabel?: string;
    };

const LANDSCAPE = 'linear-gradient(180deg, #7dd3fc 0%, #7dd3fc 42%, #86efac 42%, #4ade80 100%)';

const GRAPHICS_CLIP_IDS = new Set([
  'clip-star4',
  'clip-star5',
  'clip-star6',
  'clip-star8',
  'clip-burst',
  'clip-burst24',
  'clip-shield-wide',
  'clip-scallop',
  'clip-callout-r',
  'clip-callout-l',
  'clip-arrow-up',
  'clip-arrow-down',
  'clip-arrow-h',
  'clip-arrow-v',
  'clip-tag',
  'clip-chevron',
  'clip-banner',
  'clip-speech',
  'clip-speech-round',
  'clip-heart',
  'clip-cross',
  'clip-cloud',
  'clip-shield',
  'clip-ribbon',
  'clip-scallop-sq',
  'clip-peak',
  'clip-capsule',
]);

/** Map every existing box preset into a graphics category — never drop presets.
 * Former «Hình dạng» bucket is now «Hình Hộp» (`boxes`). */
export function boxPresetGraphicsCategory(
  preset: LandingPageBoxPreset,
): LandingPageGraphicsCategoryId {
  if (isLandingPageGridPreset(preset)) return 'grids';
  if (isLandingPageFramePreset(preset)) return 'frames';
  if (GRAPHICS_CLIP_IDS.has(preset.id)) return 'graphics';
  if (preset.category === 'clip') {
    return 'boxes';
  }
  return 'boxes';
}

function extraBox(
  id: string,
  label: string,
  category: LandingPageGraphicsCategoryId,
  style: LandingPageBoxPreset['style'],
  subgroup?:
    | LandingPageShapeGroupId
    | LandingPageGraphicsIconGroupId
    | LandingPagePhotoGroupId
    | LandingPageChartGroupId
    | LandingPageFormGroupId,
): LandingPageGraphicsAsset {
  const preset: LandingPageBoxPreset = {
    id,
    label,
    category: 'clip',
    style: { ...style, lpBox: style.lpBox || id },
  };
  return {
    kind: 'box',
    id,
    label,
    category,
    subgroup,
    preset,
    keywords: `${label} ${id} ${category} ${subgroup || ''}`,
  };
}

/** Starter assets for categories beyond the inherited shape catalog. */
const LP_GRAPHICS_EXTRA_ASSETS: LandingPageGraphicsAsset[] = [
  // Stickers / effects
  extraBox('sticker-smile', 'Sticker cười', 'effects', {
    lpBox: 'sticker-smile',
    width: '88px',
    height: '88px',
    background: '#fde047',
    borderRadius: '999px',
    boxShadow: '0 6px 0 rgba(15,23,42,0.12)',
  }),
  extraBox('sticker-star', 'Sticker sao', 'effects', {
    lpBox: 'sticker-star',
    width: '88px',
    height: '88px',
    background: '#fb923c',
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  }),
  extraBox('sticker-heart', 'Sticker tim', 'effects', {
    lpBox: 'sticker-heart',
    width: '88px',
    height: '88px',
    background: '#fb7185',
    clipPath:
      'polygon(50% 92%, 8% 55%, 8% 32%, 22% 18%, 38% 18%, 50% 30%, 62% 18%, 78% 18%, 92% 32%, 92% 55%)',
  }),
  extraBox('sticker-burst', 'Sticker burst', 'effects', {
    lpBox: 'sticker-burst',
    width: '88px',
    height: '88px',
    background: '#a78bfa',
    clipPath:
      'polygon(50% 0%, 58% 18%, 78% 8%, 72% 28%, 95% 35%, 75% 48%, 90% 68%, 68% 65%, 65% 90%, 50% 72%, 35% 90%, 32% 65%, 10% 68%, 25% 48%, 5% 35%, 28% 28%, 22% 8%, 42% 18%)',
  }),

  // Graphics illustrations
  extraBox(
    'illust-sunflower',
    'Hoa',
    'graphics',
    {
      lpBox: 'illust-sunflower',
      width: '88px',
      height: '88px',
      background: '#f59e0b',
      borderRadius: '999px',
      boxShadow: '0 0 0 10px #fde68a, 0 0 0 18px #fbbf24',
    },
    'scrapbook',
  ),
  extraBox(
    'illust-leaf',
    'Lá',
    'graphics',
    {
      lpBox: 'illust-leaf',
      width: '72px',
      height: '100px',
      background: '#22c55e',
      borderRadius: '80% 0 80% 0',
    },
    'scrapbook',
  ),

  // Tables / sheets look
  extraBox('table-simple', 'Bảng đơn', 'tables', {
    lpBox: 'table-simple',
    width: '140px',
    height: '88px',
    background:
      'linear-gradient(#fff 0 22%, #fdba74 22% 24%, #fff 24% 46%, #e2e8f0 46% 48%, #fff 48% 70%, #e2e8f0 70% 72%, #fff 72% 100%)',
    border: '1.5px solid #fb923c',
    borderRadius: '6px',
  }),
  extraBox('sheet-fx', 'Sheet f(x)', 'sheets', {
    lpBox: 'sheet-fx',
    width: '140px',
    height: '88px',
    background:
      'linear-gradient(#2563eb 0 22%, #fff 22% 24%, #eff6ff 24% 46%, #fff 46% 48%, #eff6ff 48% 70%, #fff 70% 72%, #eff6ff 72% 100%)',
    border: '1.5px solid #3b82f6',
    borderRadius: '6px',
  }),

  // Audio
  extraBox('audio-note', 'Nốt nhạc', 'audio', {
    lpBox: 'audio-note',
    width: '72px',
    height: '72px',
    background: '#ef4444',
    borderRadius: '18px',
    clipPath: 'polygon(35% 10%, 70% 5%, 70% 55%, 55% 58%, 55% 85%, 30% 90%, 30% 58%, 35% 56%)',
  }),
  extraBox('audio-wave', 'Sóng âm', 'audio', {
    lpBox: 'audio-wave',
    width: '120px',
    height: '48px',
    background:
      'linear-gradient(90deg, #f87171 0 8%, transparent 8% 12%, #ef4444 12% 20%, transparent 20% 24%, #dc2626 24% 32%, transparent 32% 36%, #ef4444 36% 44%, transparent 44% 48%, #f87171 48% 56%, transparent 56% 60%, #ef4444 60% 68%, transparent 68% 72%, #dc2626 72% 80%, transparent 80% 84%, #ef4444 84% 92%, transparent 92% 96%, #f87171 96% 100%)',
    borderRadius: '8px',
  }),

  // Mockup / 3D
  extraBox('mockup-tee', 'Mockup áo', 'mockup', {
    lpBox: 'mockup-tee',
    width: '100px',
    height: '110px',
    background: LANDSCAPE,
    clipPath:
      'polygon(20% 12%, 35% 8%, 42% 18%, 58% 18%, 65% 8%, 80% 12%, 88% 28%, 82% 100%, 18% 100%, 12% 28%)',
  }),
  extraBox('mockup-phone', 'Mockup điện thoại', 'mockup', {
    lpBox: 'mockup-phone',
    width: '64px',
    height: '110px',
    background: LANDSCAPE,
    borderRadius: '12px',
    border: '3px solid #0f172a',
    lpFrame: true,
  }),
  extraBox('threed-cube', 'Khối 3D', 'threed', {
    lpBox: 'threed-cube',
    width: '88px',
    height: '88px',
    background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 45%, #312e81 100%)',
    borderRadius: '8px',
    boxShadow: '10px 10px 0 rgba(79,70,229,0.35)',
  }),
  extraBox('threed-pyramid', 'Tháp 3D', 'threed', {
    lpBox: 'threed-pyramid',
    width: '88px',
    height: '88px',
    background: '#7c3aed',
    clipPath: 'polygon(50% 8%, 92% 88%, 8% 88%)',
  }),

  // Photos / video / forms — block or media actions
  {
    kind: 'media',
    id: 'photo-library',
    label: 'Thư viện ảnh',
    category: 'photos',
    subgroup: 'suggested',
    keywords: 'ảnh photo image thư viện',
    action: 'open-library',
    previewLabel: 'Ảnh',
    previewStyle: {
      width: 88,
      height: 72,
      borderRadius: 10,
      background: LANDSCAPE,
      boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
    },
  },
  {
    kind: 'block',
    id: 'photo-gallery',
    label: 'Gallery ảnh',
    category: 'photos',
    subgroup: 'suggested',
    keywords: 'gallery album ảnh',
    blockType: 'Gallery',
    previewLabel: 'Gallery',
    previewStyle: {
      width: 88,
      height: 72,
      borderRadius: 10,
      background: 'linear-gradient(135deg,#93c5fd,#60a5fa)',
    },
  },
  {
    kind: 'block',
    id: 'video-block',
    label: 'Khối Video',
    category: 'video',
    keywords: 'video youtube',
    blockType: 'Video',
    previewLabel: '▶',
    previewStyle: {
      width: 88,
      height: 56,
      borderRadius: 12,
      background: 'linear-gradient(135deg,#c084fc,#a855f7)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: 22,
    },
  },
];

export const LP_GRAPHICS_CATEGORIES: LandingPageGraphicsCategory[] = [
  {
    id: 'shapes',
    label: 'Hình dạng',
    tileClass: 'from-slate-200 to-slate-700',
    icon: (
      <span className="relative block h-12 w-12">
        <span className="absolute left-0 top-2 h-7 w-7 rounded-sm bg-white shadow" />
        <span
          className="absolute bottom-0 right-0 h-8 w-8 bg-white/90 shadow"
          style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
        />
        <span className="absolute right-1 top-0 h-5 w-5 rounded-full bg-white/80 shadow" />
      </span>
    ),
  },
  {
    id: 'boxes',
    label: 'Hình Hộp',
    tileClass: 'from-sky-300 to-cyan-500',
    icon: (
      <span className="relative block h-12 w-12">
        <span className="absolute left-1 top-2 h-7 w-9 rotate-[-8deg] rounded-sm bg-white/90 shadow" />
        <span
          className="absolute bottom-1 right-0 h-8 w-8 bg-sky-100 shadow"
          style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
        />
      </span>
    ),
  },
  {
    id: 'graphics',
    label: 'Đồ họa',
    tileClass: 'from-orange-300 to-amber-500',
    icon: (
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute h-10 w-10 rounded-full bg-yellow-300 shadow" />
        <span className="absolute h-4 w-4 rounded-full bg-amber-700" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <span
            key={deg}
            className="absolute h-3 w-3 rounded-full bg-yellow-200"
            style={{ transform: `rotate(${deg}deg) translateY(-18px)` }}
          />
        ))}
      </span>
    ),
  },
  {
    id: 'effects',
    label: 'Hiệu ứng động',
    tileClass: 'from-lime-300 to-green-500',
    icon: (
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300 text-2xl shadow-md">
          ☺
        </span>
      </span>
    ),
  },
  {
    id: 'photos',
    label: 'Ảnh',
    tileClass: 'from-blue-300 to-blue-600',
    icon: (
      <span
        className="block h-12 w-12 rounded-xl bg-cover bg-center shadow-md"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(15,23,42,0.15), rgba(15,23,42,0.05)), radial-gradient(circle at 40% 35%, #fda4af 0 18%, transparent 19%), linear-gradient(180deg,#7dd3fc 45%,#86efac 45%)',
        }}
      />
    ),
  },
  {
    id: 'video',
    label: 'Video',
    tileClass: 'from-fuchsia-300 to-purple-600',
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 shadow-inner">
        <span
          className="h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white drop-shadow"
          aria-hidden
        />
      </span>
    ),
  },
  {
    id: 'audio',
    label: 'Âm thanh',
    tileClass: 'from-rose-400 to-red-600',
    icon: (
      <span className="flex h-12 w-12 items-center justify-center text-3xl text-white drop-shadow">
        ♪
      </span>
    ),
  },
  {
    id: 'charts',
    label: 'Biểu đồ',
    tileClass: 'from-indigo-200 to-violet-400',
    icon: (
      <span className="relative block h-12 w-12">
        <span className="absolute bottom-2 left-1 h-4 w-2 rounded-sm bg-white/90" />
        <span className="absolute bottom-2 left-4 h-7 w-2 rounded-sm bg-white/90" />
        <span className="absolute bottom-2 left-7 h-5 w-2 rounded-sm bg-white/90" />
        <span className="absolute bottom-2 right-1 h-8 w-2 rounded-sm bg-white/90" />
      </span>
    ),
  },
  {
    id: 'forms',
    label: 'Biểu mẫu',
    tileClass: 'from-emerald-300 to-green-600',
    icon: (
      <span className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl bg-white/30 p-1">
        <span className="h-3 w-8 rounded-full bg-white shadow-sm" />
        <span className="h-3 w-3 rounded bg-white shadow-sm" />
      </span>
    ),
  },
  {
    id: 'sheets',
    label: 'Sheets',
    tileClass: 'from-sky-200 to-blue-500',
    icon: (
      <span className="flex h-12 w-12 flex-col overflow-hidden rounded-lg bg-white shadow">
        <span className="bg-blue-600 px-1 py-0.5 text-[8px] font-bold text-white">f(x)</span>
        <span className="grid flex-1 grid-cols-3 gap-px bg-slate-200 p-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="bg-white" />
          ))}
        </span>
      </span>
    ),
  },
  {
    id: 'tables',
    label: 'Bảng',
    tileClass: 'from-orange-200 to-orange-500',
    icon: (
      <span className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-0.5 rounded-lg bg-orange-100 p-1 shadow">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={i < 3 ? 'rounded-sm bg-orange-400' : 'rounded-sm bg-white'} />
        ))}
      </span>
    ),
  },
  {
    id: 'frames',
    label: 'Khung',
    tileClass: 'from-teal-200 to-emerald-500',
    icon: (
      <span
        className="block h-12 w-12 shadow-md"
        style={{
          backgroundImage: LANDSCAPE,
          backgroundSize: 'cover',
          clipPath:
            'polygon(10% 20%, 20% 8%, 35% 14%, 50% 6%, 65% 14%, 80% 8%, 90% 20%, 92% 85%, 8% 85%)',
        }}
      />
    ),
  },
  {
    id: 'grids',
    label: 'Lưới',
    tileClass: 'from-violet-300 to-purple-600',
    icon: (
      <span className="grid h-12 w-12 grid-cols-2 grid-rows-2 gap-1 rounded-xl bg-white/25 p-1">
        <span className="rounded-md bg-white/90" />
        <span className="rounded-md bg-white/70" />
        <span className="rounded-md bg-white/70" />
        <span className="rounded-md bg-white/90" />
      </span>
    ),
  },
  {
    id: 'mockup',
    label: 'Mockup',
    tileClass: 'from-cyan-200 to-teal-500',
    icon: (
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="h-10 w-9 bg-white shadow"
          style={{
            clipPath:
              'polygon(18% 10%, 35% 6%, 42% 18%, 58% 18%, 65% 6%, 82% 10%, 90% 28%, 84% 95%, 16% 95%, 10% 28%)',
          }}
        />
        <span
          className="absolute top-[38%] h-4 w-5 rounded-sm"
          style={{ backgroundImage: LANDSCAPE, backgroundSize: 'cover' }}
        />
      </span>
    ),
  },
  {
    id: 'threed',
    label: '3D',
    tileClass: 'from-purple-300 to-indigo-700',
    icon: (
      <span className="relative flex h-12 w-12 items-end justify-center pb-1">
        <span
          className="absolute inset-x-2 bottom-2 h-6 opacity-40"
          style={{
            background:
              'repeating-linear-gradient(90deg, transparent, transparent 6px, #fff 6px, #fff 7px), repeating-linear-gradient(0deg, transparent, transparent 6px, #fff 6px, #fff 7px)',
          }}
        />
        <span className="relative h-8 w-8 rounded-md bg-gradient-to-br from-indigo-300 to-indigo-700 shadow-lg" />
      </span>
    ),
  },
];

export function buildGraphicsAssets(): LandingPageGraphicsAsset[] {
  const fromBoxes: LandingPageGraphicsAsset[] = LP_BOX_PRESETS.map((preset) => {
    const category = boxPresetGraphicsCategory(preset);
    return {
      kind: 'box' as const,
      id: preset.id,
      label: preset.label,
      category,
      subgroup: category === 'graphics' ? ('clipart' as const) : undefined,
      keywords: `${preset.label} ${preset.id} ${preset.category} ${category}`,
      preset: isLandingPageFramePreset(preset)
        ? { ...preset, style: { ...preset.style, lpFrame: true } }
        : preset,
    };
  });
  const fromSilhouettes: LandingPageGraphicsAsset[] = LP_SHAPE_SILHOUETTES.map((row) => ({
    kind: 'box' as const,
    id: row.id,
    label: row.label,
    category: 'shapes' as const,
    subgroup: row.group,
    keywords: `${row.label} ${row.id} ${row.group} hình dạng`,
    preset: row.preset,
  }));
  const fromIcons: LandingPageGraphicsAsset[] = LP_GRAPHICS_ICON_ASSETS.map((row) => ({
    kind: 'box' as const,
    id: row.id,
    label: row.label,
    category: 'graphics' as const,
    subgroup: row.group,
    keywords: `${row.label} ${row.id} ${row.group} đồ họa icon`,
    preset: row.preset,
  }));
  const fromPhotos: LandingPageGraphicsAsset[] = LP_PHOTO_PRESETS.map((row) => ({
    kind: 'box' as const,
    id: row.id,
    label: row.label,
    category: 'photos' as const,
    subgroup: row.group,
    premium: row.premium,
    keywords: `${row.label} ${row.id} ${row.group} ảnh texture watercolor`,
    preset: row.preset,
  }));
  const fromCharts: LandingPageGraphicsAsset[] = LP_CHART_PRESETS.map((row) => ({
    kind: 'box' as const,
    id: row.id,
    label: row.label,
    category: 'charts' as const,
    subgroup: row.group,
    keywords: `${row.label} ${row.id} ${row.group} biểu đồ chart`,
    preset: row.preset,
  }));
  const fromForms: LandingPageGraphicsAsset[] = LP_FORM_PRESETS.map((row) => ({
    kind: 'form' as const,
    id: row.id,
    label: row.label,
    category: 'forms' as const,
    subgroup: row.group,
    keywords: `${row.label} ${row.id} ${row.group} biểu mẫu form lead survey`,
    formPreset: row,
    preview: row.preview,
  }));
  return [
    ...fromBoxes,
    ...fromSilhouettes,
    ...fromIcons,
    ...fromPhotos,
    ...fromCharts,
    ...fromForms,
    ...LP_GRAPHICS_EXTRA_ASSETS,
  ];
}

export const LP_GRAPHICS_ASSETS = buildGraphicsAssets();

function assetPreview(asset: LandingPageGraphicsAsset, compact?: boolean): ReactNode {
  if (asset.kind === 'form') {
    const frameW = compact ? 56 : 88;
    const frameH = compact ? 64 : 80;
    return (
      <span
        className="relative flex flex-col overflow-hidden rounded-md border border-zinc-200 shadow-sm"
        style={{
          width: frameW,
          height: frameH,
          background: asset.preview.bg,
          padding: 6,
        }}
        aria-hidden
      >
        <span className="mb-1 h-1.5 rounded-sm bg-black/25" style={{ width: '75%' }} />
        <span className="mb-1 h-1 w-full rounded-sm bg-black/10" />
        <span className="mb-1 h-1 w-full rounded-sm bg-black/10" />
        <span
          className="mt-auto h-2.5 w-full rounded-sm"
          style={{ background: asset.preview.accent }}
        />
      </span>
    );
  }
  if (asset.kind === 'box') {
    const style = boxPreviewStyle(asset.preset.style);
    const isPhoto = asset.category === 'photos';
    const isChart = asset.category === 'charts';
    // Photos/charts: fixed framed thumbnail so assets stay visible in the rail
    if (isPhoto || isChart) {
      const frameW = compact ? 56 : 88;
      const frameH = compact ? 56 : 72;
      return (
        <span
          className="block overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
          style={{
            width: frameW,
            height: frameH,
            background: style.background || '#fff',
            backgroundImage: style.backgroundImage,
            backgroundSize:
              style.backgroundSize ||
              (isChart ? '72% 72%' : style.backgroundImage ? 'cover' : undefined),
            backgroundRepeat: style.backgroundRepeat || 'no-repeat',
            backgroundPosition: style.backgroundPosition || 'center',
            borderRadius: 8,
          }}
          aria-hidden
        />
      );
    }
    const scale =
      Math.min(
        1,
        72 / (parseFloat(String(style.width)) || 88),
        56 / (parseFloat(String(style.height)) || 56),
      ) || 0.7;
    return (
      <span
        className="origin-center"
        style={{
          ...style,
          width: `calc(${style.width} * ${scale})`,
          height: `calc(${style.height} * ${scale})`,
          maxWidth: 96,
          maxHeight: 72,
        }}
        aria-hidden
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-semibold text-slate-700"
      style={asset.previewStyle}
      aria-hidden
    >
      {asset.previewLabel || asset.label}
    </span>
  );
}

export function LandingPageGraphicsLibraryPanel({
  onClose,
  onInsertBox,
  onInsertForm,
  onInsertBlockType,
  onOpenMediaLibrary,
  onOpenFormLibrary,
  initialCategory = null,
  initialShapeGroup = null,
  iconsOnly = false,
  panelTitle,
  embedded = false,
  className,
}: {
  onClose: () => void;
  onInsertBox: (preset: LandingPageBoxPreset) => void;
  onInsertForm?: (preset: LandingPageFormPreset) => void;
  onInsertBlockType?: (type: LandingPageBlockType) => void;
  onOpenMediaLibrary?: () => void;
  onOpenFormLibrary?: () => void;
  /** Open directly into a category (e.g. Biểu tượng → graphics groups). */
  initialCategory?: LandingPageGraphicsCategoryId | null;
  /** Open inside category at icon/shape group (e.g. social). */
  initialShapeGroup?: string | null;
  /** Skip top category grid; stay inside graphics icon groups. */
  iconsOnly?: boolean;
  panelTitle?: string;
  /** Render in normal flow inside an existing library dialog. */
  embedded?: boolean;
  /** Optional class merge (e.g. right-rail embedded). */
  className?: string;
}) {
  const [categoryId, setCategoryId] = useState<LandingPageGraphicsCategoryId | null>(
    initialCategory || (iconsOnly ? 'graphics' : null),
  );
  const [shapeGroupId, setShapeGroupId] = useState<string | null>(initialShapeGroup || null);
  const [query, setQuery] = useState('');

  const category = LP_GRAPHICS_CATEGORIES.find((c) => c.id === categoryId) || null;
  const shapeGroup =
    LP_SHAPE_GROUPS.find((g) => g.id === shapeGroupId) ||
    LP_GRAPHICS_ICON_GROUPS.find((g) => g.id === shapeGroupId) ||
    LP_PHOTO_GROUPS.find((g) => g.id === shapeGroupId) ||
    LP_CHART_GROUPS.find((g) => g.id === shapeGroupId) ||
    LP_FORM_GROUPS.find((g) => g.id === shapeGroupId) ||
    null;

  const assets = useMemo(() => {
    if (!categoryId) return [];
    const q = query.trim().toLowerCase();
    return LP_GRAPHICS_ASSETS.filter((a) => {
      if (a.category !== categoryId) return false;
      if (
        (categoryId === 'shapes' ||
          categoryId === 'graphics' ||
          categoryId === 'photos' ||
          categoryId === 'charts' ||
          categoryId === 'forms') &&
        shapeGroupId
      ) {
        if (a.subgroup !== shapeGroupId) return false;
      }
      if (!q) return true;
      return `${a.label} ${a.keywords || ''} ${a.id}`.toLowerCase().includes(q);
    });
  }, [categoryId, shapeGroupId, query]);

  function activateAsset(asset: LandingPageGraphicsAsset) {
    if (asset.kind === 'box') {
      onInsertBox(asset.preset);
      return;
    }
    if (asset.kind === 'form') {
      onInsertForm?.(asset.formPreset);
      return;
    }
    if (asset.kind === 'block') {
      onInsertBlockType?.(asset.blockType);
      return;
    }
    onOpenMediaLibrary?.();
  }

  function renderAssetButton(asset: LandingPageGraphicsAsset, compact?: boolean) {
    return (
      <button
        key={asset.id}
        type="button"
        draggable={asset.kind !== 'media'}
        data-lp-graphics-asset={asset.id}
        data-lp-graphics-asset-kind={asset.kind}
        data-lp-graphics-premium={asset.kind === 'box' && asset.premium ? '1' : undefined}
        data-lp-shape-group={'subgroup' in asset ? asset.subgroup : undefined}
        data-lp-box-preset={asset.kind === 'box' ? asset.id : undefined}
        data-lp-form-preset={asset.kind === 'form' ? asset.id : undefined}
        data-lp-sidebar-draggable={
          asset.kind === 'box'
            ? 'box'
            : asset.kind === 'form'
              ? 'form'
              : asset.kind === 'block'
                ? 'block-type'
                : undefined
        }
        className={cn(
          'relative flex cursor-grab flex-col items-center gap-1 transition hover:bg-zinc-100 active:cursor-grabbing',
          compact
            ? 'min-w-[64px] shrink-0 rounded-lg px-1.5 py-2'
            : 'rounded-xl bg-zinc-50/90 px-2 py-3',
        )}
        title={`${asset.label} — kéo thả hoặc click để chèn`}
        onClick={(e) => {
          if (suppressClickAfterSidebarDrag(e)) return;
          activateAsset(asset);
        }}
        onDragStart={(e) => {
          if (asset.kind === 'box') {
            beginSidebarPresetDrag(e, { kind: 'box', preset: asset.preset }, asset.label);
          } else if (asset.kind === 'form') {
            beginSidebarPresetDrag(e, { kind: 'form', preset: asset.formPreset }, asset.label);
          } else if (asset.kind === 'block') {
            beginSidebarPresetDrag(e, { kind: 'block-type', type: asset.blockType }, asset.label);
          } else {
            e.preventDefault();
          }
        }}
      >
        {asset.kind === 'box' && asset.premium ? (
          <span
            className="absolute bottom-1.5 right-1.5 z-10 inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 text-[8px] text-white shadow"
            title="Premium"
            aria-label="Premium"
          >
            ♛
          </span>
        ) : null}
        <span
          className={cn(
            'flex w-full items-center justify-center',
            compact ? 'h-14' : 'min-h-[72px]',
          )}
        >
          {assetPreview(asset, compact)}
        </span>
        {!compact ? (
          <span className="line-clamp-1 text-[10px] font-medium text-zinc-600">{asset.label}</span>
        ) : (
          <span className="line-clamp-1 max-w-[68px] text-center text-[9px] font-medium leading-tight text-zinc-600">
            {asset.label}
          </span>
        )}
      </button>
    );
  }

  const title = shapeGroup
    ? shapeGroup.label
    : category
      ? iconsOnly && !shapeGroupId
        ? panelTitle || 'Biểu tượng'
        : category.label
      : panelTitle || 'Đồ họa';

  const subtitle = shapeGroup
    ? `${assets.length} hình · click hoặc kéo thả`
    : category
      ? categoryId === 'shapes' && !query
        ? `${LP_SHAPE_GROUPS.length} nhóm · ${LP_SHAPE_SILHOUETTES.length} hình`
        : categoryId === 'graphics' && !query
          ? `${LP_GRAPHICS_ICON_GROUPS.length} nhóm · đồ họa & icon`
          : categoryId === 'photos' && !query
            ? `${LP_PHOTO_GROUPS.length} nhóm · ${LP_PHOTO_PRESETS.length} ảnh`
            : categoryId === 'charts' && !query
              ? `${LP_CHART_GROUPS.length} nhóm · ${LP_CHART_PRESETS.length} biểu đồ`
              : categoryId === 'forms' && !query
                ? `${LP_FORM_GROUPS.length} nhóm · ${LP_FORM_PRESETS.length} biểu mẫu`
                : `${assets.length} mục · click hoặc kéo thả`
      : `${LP_GRAPHICS_CATEGORIES.length} danh mục · ${LP_GRAPHICS_ASSETS.length} asset`;

  return (
    <div
      data-lp-graphics-library
      data-lp-library-embedded={embedded ? '1' : undefined}
      data-lp-box-presets-panel
      data-lp-icons-only={iconsOnly ? '1' : undefined}
      data-lp-graphics-view={categoryId ? (shapeGroupId ? 'shape-group' : 'assets') : 'categories'}
      className={cn(
        'flex flex-col overflow-hidden bg-white',
        embedded
          ? 'relative min-h-0 min-w-0 w-full flex-1'
          : 'absolute left-full top-0 z-40 ml-2 h-[min(82vh,680px)] w-[min(360px,calc(100vw-5rem))] rounded-xl border border-zinc-200 shadow-xl',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
        {category && (!iconsOnly || shapeGroupId) ? (
          <button
            type="button"
            data-lp-graphics-back
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            title="Quay lại"
            onClick={() => {
              if (shapeGroupId) {
                setShapeGroupId(null);
                setQuery('');
                return;
              }
              if (iconsOnly) {
                return;
              }
              setCategoryId(null);
              setQuery('');
            }}
          >
            ←
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-zinc-900">{title}</div>
          <div className="truncate text-[10px] text-zinc-400">{subtitle}</div>
        </div>
        <button
          type="button"
          data-lp-sidebar-close
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          onClick={onClose}
          title="Đóng"
        >
          ✕
        </button>
      </div>

      {category ? (
        <div className="border-b border-zinc-100 px-3 py-2">
          <input
            data-lp-graphics-search
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Tìm trong ${title}…`}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[12px] text-zinc-800 outline-none ring-violet-500/30 placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:ring-2"
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3" data-lp-graphics-scroll>
        {!category ? (
          <div
            className="grid grid-cols-3 gap-3"
            data-lp-graphics-category-grid
            data-lp-graphics-category-count={LP_GRAPHICS_CATEGORIES.length}
          >
            {LP_GRAPHICS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-lp-graphics-category={cat.id}
                draggable={cat.id === 'forms'}
                onDragStart={
                  cat.id === 'forms'
                    ? (e) => {
                        beginSidebarPresetDrag(e, { kind: 'form-library-open' }, cat.label, {
                          subtitle: 'Thả vào canvas để chọn dạng biểu mẫu',
                        });
                      }
                    : undefined
                }
                className="group flex flex-col items-center gap-1.5 text-center cursor-grab active:cursor-grabbing"
                onClick={() => {
                  if (cat.id === 'forms') {
                    onOpenFormLibrary?.();
                    return;
                  }
                  setCategoryId(cat.id);
                  setShapeGroupId(null);
                  setQuery('');
                }}
              >
                <span
                  className={cn(
                    'flex h-[72px] w-full items-center justify-center rounded-2xl bg-gradient-to-br shadow-md transition group-hover:scale-[1.03] group-hover:shadow-lg',
                    cat.tileClass,
                  )}
                >
                  {cat.icon}
                </span>
                <span className="line-clamp-2 px-0.5 text-[11px] font-medium leading-tight text-zinc-800">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        ) : (categoryId === 'shapes' ||
            categoryId === 'graphics' ||
            categoryId === 'photos' ||
            categoryId === 'charts' ||
            categoryId === 'forms') &&
          !shapeGroupId &&
          !query.trim() ? (
          <div
            className="space-y-4"
            data-lp-shape-groups={categoryId === 'shapes' ? '1' : undefined}
            data-lp-graphics-groups={categoryId === 'graphics' ? '1' : undefined}
            data-lp-photo-groups={categoryId === 'photos' ? '1' : undefined}
            data-lp-chart-groups={categoryId === 'charts' ? '1' : undefined}
            data-lp-form-groups={categoryId === 'forms' ? '1' : undefined}
            data-lp-shape-group-count={
              categoryId === 'shapes'
                ? LP_SHAPE_GROUPS.length
                : categoryId === 'graphics'
                  ? LP_GRAPHICS_ICON_GROUPS.length
                  : categoryId === 'photos'
                    ? LP_PHOTO_GROUPS.length
                    : categoryId === 'charts'
                      ? LP_CHART_GROUPS.length
                      : LP_FORM_GROUPS.length
            }
          >
            {(categoryId === 'shapes'
              ? LP_SHAPE_GROUPS
              : categoryId === 'graphics'
                ? LP_GRAPHICS_ICON_GROUPS
                : categoryId === 'photos'
                  ? LP_PHOTO_GROUPS
                  : categoryId === 'charts'
                    ? LP_CHART_GROUPS
                    : LP_FORM_GROUPS
            ).map((group) => {
              const rows = LP_GRAPHICS_ASSETS.filter(
                (a) => a.category === categoryId && a.subgroup === group.id,
              );
              if (rows.length === 0) return null;
              const preview = rows.slice(0, 5);
              return (
                <section key={group.id} data-lp-shape-group-row={group.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-zinc-900">{group.label}</h3>
                    <button
                      type="button"
                      data-lp-shape-see-all={group.id}
                      className="text-[11px] font-medium text-zinc-500 hover:text-violet-700"
                      onClick={() => setShapeGroupId(group.id)}
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="relative">
                    <div className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {preview.map((asset) => renderAssetButton(asset, true))}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-white to-transparent">
                      <span className="pointer-events-auto mr-0.5 text-zinc-400" aria-hidden>
                        ›
                      </span>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-3"
            data-lp-graphics-asset-list
            data-lp-graphics-asset-count={assets.length}
            data-lp-box-preset-list
            data-lp-box-preset-count={assets.filter((a) => a.kind === 'box').length}
            data-lp-box-preset-total={LP_BOX_PRESETS.length}
          >
            {assets.length === 0 ? (
              <div className="col-span-2 rounded-lg border border-dashed border-zinc-200 px-3 py-8 text-center text-[12px] text-zinc-400">
                Không có asset khớp «{query}»
              </div>
            ) : (
              assets.map((asset) => renderAssetButton(asset))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
