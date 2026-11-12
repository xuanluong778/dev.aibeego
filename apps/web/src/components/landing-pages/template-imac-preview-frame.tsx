'use client';

import type { ComponentProps } from 'react';
import { TemplateHoverPreview } from '@/components/landing-pages/template-hover-preview';

/** Public asset — transparent screen cutout; width/height match imac-frame.png. */
export const IMAC_FRAME_SRC = '/landing-pages/imac-frame.png';
const IMAC_FRAME_WIDTH = 644;
const IMAC_FRAME_HEIGHT = 512;

/** Screen inset (% of frame) tuned for imac-frame.png — preview stays inside bezels, above chin. */
const SCREEN_INSET = {
  top: '1.4%',
  left: '1.25%',
  right: '1.25%',
  bottom: '30.6%',
} as const;

type HoverPreviewProps = ComponentProps<typeof TemplateHoverPreview>;

export function TemplateImacPreviewFrame(props: HoverPreviewProps) {
  return (
    <div
      className="relative w-full max-w-full"
      style={{ aspectRatio: `${IMAC_FRAME_WIDTH} / ${IMAC_FRAME_HEIGHT}` }}
      data-lp-imac-preview
    >
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          top: SCREEN_INSET.top,
          left: SCREEN_INSET.left,
          right: SCREEN_INSET.right,
          bottom: SCREEN_INSET.bottom,
        }}
      >
        <TemplateHoverPreview {...props} fitContainer hideBottomFade className="h-full w-full bg-black" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAC_FRAME_SRC}
        alt=""
        aria-hidden
        width={IMAC_FRAME_WIDTH}
        height={IMAC_FRAME_HEIGHT}
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-fill"
      />
    </div>
  );
}

export function TemplateImacPreviewSkeleton() {
  return (
    <div className="relative w-full" style={{ aspectRatio: '644 / 517' }}>
      <div
        className="absolute animate-pulse bg-white/10"
        style={{
          top: SCREEN_INSET.top,
          left: SCREEN_INSET.left,
          right: SCREEN_INSET.right,
          bottom: SCREEN_INSET.bottom,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAC_FRAME_SRC}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain opacity-40"
      />
    </div>
  );
}
