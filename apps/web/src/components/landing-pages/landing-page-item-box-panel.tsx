'use client';

import type { LandingPageBlock, LandingPageTextBoxChrome } from '@marketingspa/shared';
import { LandingPageTextQuickPanel } from './landing-page-text-quick-panel';
import { readLpItemBoxes, withLpItemBox } from './landing-page-item-box';

/** Cài đặt khối for the large card, stored on block.style.lpItemBoxes. */
export function LandingPageItemBoxPanel({
  block,
  itemId,
  onUpdateBlock,
  resolveBlock,
  onPickMedia,
}: {
  block: LandingPageBlock;
  itemId: string;
  onUpdateBlock: (id: string, patch: Partial<LandingPageBlock>) => void;
  /** Latest block from spec ref — avoids stale lpItemBoxes when patching. */
  resolveBlock?: () => LandingPageBlock | null | undefined;
  onPickMedia?: () => void;
}) {
  const live = resolveBlock?.() ?? block;
  const box = readLpItemBoxes((live.style || {}) as Record<string, unknown>)[itemId];
  return (
    <LandingPageTextQuickPanel
      embedded
      open
      block={live}
      field={`itemBox:${itemId}`}
      textStyle={box ? { box } : null}
      onLive={() => undefined}
      onCommit={() => undefined}
      onPatchBox={(next: LandingPageTextBoxChrome) => {
        const current = resolveBlock?.() ?? block;
        onUpdateBlock(current.id, withLpItemBox(current, itemId, next));
      }}
      onPickMedia={() => onPickMedia?.()}
      onClose={() => undefined}
    />
  );
}
