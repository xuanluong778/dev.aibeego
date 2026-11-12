'use client';

/**
 * Per-viewport visibility for a block (Desktop / Tablet / Mobile).
 * Writes block.responsiveStyle.{desktop|tablet|mobile}.display — applied via
 * data-lp-hide-* attrs + LP_RESPONSIVE_FOUNDATION_CSS / SelectableShell.
 */

import type { LandingPageBlock } from '@marketingspa/shared';
import { InspectorFieldLabel } from './landing-page-inspector-ui';
import { cn } from '@/lib/utils';

export type LpViewportKey = 'desktop' | 'tablet' | 'mobile';

type RsBucket = { display?: string };

function readBucket(block: LandingPageBlock, vp: LpViewportKey): RsBucket {
  const rs = (block.responsiveStyle || {}) as Record<string, RsBucket | undefined>;
  return { ...(rs[vp] || {}) };
}

export function isViewportHidden(block: LandingPageBlock, vp: LpViewportKey): boolean {
  return readBucket(block, vp).display === 'none';
}

/** Attr map for SelectableShell / public render. */
export function responsiveHideAttrs(block: LandingPageBlock): Record<string, string | undefined> {
  return {
    'data-lp-hide-desktop': isViewportHidden(block, 'desktop') ? '1' : undefined,
    'data-lp-hide-tablet': isViewportHidden(block, 'tablet') ? '1' : undefined,
    'data-lp-hide-mobile': isViewportHidden(block, 'mobile') ? '1' : undefined,
  };
}

export function patchResponsiveViewportDisplay(
  block: LandingPageBlock,
  vp: LpViewportKey,
  hidden: boolean,
): Partial<LandingPageBlock> {
  const prev = { ...((block.responsiveStyle || {}) as Record<string, unknown>) };
  const bucket = { ...((prev[vp] as Record<string, unknown>) || {}) };
  if (hidden) bucket.display = 'none';
  else delete bucket.display;
  const next = {
    ...prev,
    [vp]: Object.keys(bucket).length ? bucket : undefined,
  };
  for (const [k, v] of Object.entries(next)) {
    if (v === undefined) delete next[k];
  }
  return {
    responsiveStyle: Object.keys(next).length ? next : undefined,
  } as Partial<LandingPageBlock>;
}

const VP_LABELS: Array<{ id: LpViewportKey; label: string }> = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Mobile' },
];

type Props = {
  block: LandingPageBlock;
  /** Active canvas viewport — highlight only; edits still per-checkbox. */
  activeViewport?: LpViewportKey;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
};

export function LandingPageInspectorResponsiveVisibility({
  block,
  activeViewport,
  onUpdateBlock,
}: Props) {
  return (
    <div className="space-y-2" data-lp-inspector-responsive-visibility>
      <InspectorFieldLabel>Hiện trên thiết bị</InspectorFieldLabel>
      <p className="text-[10px] leading-snug text-white/45">
        Bỏ tick để ẩn section trên viewport đó. Chỉnh viewport khác không ghi đè
        viewport còn lại.
        {activeViewport ? (
          <>
            {' '}
            Đang xem canvas: <strong className="text-white/70">{activeViewport}</strong>.
          </>
        ) : null}
      </p>
      <div className="flex flex-col gap-1.5">
        {VP_LABELS.map(({ id, label }) => {
          const hidden = isViewportHidden(block, id);
          return (
            <label
              key={id}
              className={cn(
                'flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition',
                activeViewport === id
                  ? 'border-orange-400/40 bg-orange-400/10'
                  : 'border-white/10',
              )}
            >
              <input
                type="checkbox"
                checked={!hidden}
                onChange={(e) =>
                  onUpdateBlock(
                    block.id,
                    patchResponsiveViewportDisplay(block, id, !e.target.checked),
                  )
                }
              />
              <span className="flex-1">{label}</span>
              <span className="text-[10px] opacity-40">{hidden ? 'Ẩn' : 'Hiện'}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
