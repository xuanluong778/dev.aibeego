'use client';

import type { ReactNode } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  sectionLayerBoxStyle,
  sectionMediaPaint,
  sectionSettingsActive,
  sectionSettingsInsets,
} from './landing-page-section-settings';

/**
 * Paints section color, image, and video behind the copy.
 * Media opacity is on this layer only — children are not faded.
 */
export function SectionSettingsStack({
  block,
  fallback,
  children,
}: {
  block?: Pick<LandingPageBlock, 'background' | 'style'> | null;
  fallback?: string;
  children: ReactNode;
}) {
  if (!block || !sectionSettingsActive(block.style)) return <>{children}</>;
  const insets = sectionSettingsInsets(block);
  const media = sectionMediaPaint(block as LandingPageBlock);
  return (
    <>
      <div
        data-lp-section-bg-layer="1"
        className="pointer-events-none absolute z-0 overflow-hidden"
        style={sectionLayerBoxStyle(block, fallback)}
      >
        {media?.kind === 'image' ? (
          <div
            data-lp-section-bg-media="image"
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${media.url}")`,
              backgroundSize: media.size,
              backgroundPosition: media.position,
              backgroundRepeat: media.repeat,
              opacity: media.opacity,
            }}
          />
        ) : null}
        {media?.kind === 'video' ? (
          <video
            data-lp-section-bg-media="video"
            className="absolute inset-0 h-full w-full"
            src={media.url}
            muted
            loop
            autoPlay
            playsInline
            style={{
              opacity: media.opacity,
              objectFit: media.size.startsWith('100') ? 'cover' : 'contain',
              objectPosition: media.position,
            }}
          />
        ) : null}
      </div>
      <div
        data-lp-section-bg-content="1"
        className="relative z-[1] min-w-0"
        style={{
          paddingTop: insets.contentTop,
          paddingRight: insets.contentRight,
          paddingBottom: insets.contentBottom,
          paddingLeft: insets.contentLeft,
        }}
      >
        {children}
      </div>
    </>
  );
}
