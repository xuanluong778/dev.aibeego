import { sanitizeLandingPagePersistSpec } from '@marketingspa/shared';
import type { LandingPageSpec } from '@marketingspa/shared';

export type LocalLandingDraft = {
  pageId: string;
  spec: LandingPageSpec;
  /** Last server revision this tab loaded or successfully saved. */
  baseRevision: number;
  clientRevision: number;
  savedAt: string;
};

const keyFor = (pageId: string) => `lp-draft-recovery:${pageId}`;

export type DraftRecoveryDecision = 'use-server' | 'restore-local' | 'conflict';

function isLocalLandingDraft(value: unknown): value is LocalLandingDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const draft = value as LocalLandingDraft;
  return (
    typeof draft.pageId === 'string' &&
    draft.pageId.length > 0 &&
    Number.isSafeInteger(draft.baseRevision) &&
    draft.baseRevision >= 0 &&
    Number.isSafeInteger(draft.clientRevision) &&
    draft.clientRevision >= 0 &&
    typeof draft.savedAt === 'string' &&
    !!draft.spec &&
    typeof draft.spec === 'object' &&
    !Array.isArray(draft.spec) &&
    draft.spec.version === 1 &&
    Array.isArray(draft.spec.blocks) &&
    draft.spec.blocks.every(
      (block) =>
        !!block &&
        typeof block === 'object' &&
        !Array.isArray(block) &&
        typeof block.id === 'string' &&
        typeof block.type === 'string',
    )
  );
}

/** Compare persisted content, ignoring only concurrency receipts and object key order. */
export function landingDraftContentKey(spec: LandingPageSpec): string {
  const normalized = sanitizeLandingPagePersistSpec(spec);
  const meta = { ...normalized.meta } as Record<string, unknown>;
  delete meta.clientRevision;
  delete meta.lastAutosaveRequestId;
  delete meta.lastAutosaveRequestHash;
  return JSON.stringify(
    { ...normalized, meta: Object.keys(meta).length ? meta : undefined },
    (_key, value) =>
      value && typeof value === 'object' && !Array.isArray(value)
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((key) => [key, value[key]]),
          )
        : value,
  );
}

export function landingDraftsHaveSameContent(a: LandingPageSpec, b: LandingPageSpec): boolean {
  try {
    return landingDraftContentKey(a) === landingDraftContentKey(b);
  } catch {
    return false;
  }
}

/** Local draft is restored only when the server has not moved since this tab's last ack. */
export function decideDraftRecovery(input: {
  serverRevision: number;
  serverSpec?: LandingPageSpec;
  local: LocalLandingDraft | null;
}): DraftRecoveryDecision {
  const local = input.local;
  if (!isLocalLandingDraft(local)) return 'use-server';
  // A lost ACK after a successful commit is not a conflict. Never overwrite; use the matching server copy.
  if (input.serverSpec && landingDraftsHaveSameContent(local.spec, input.serverSpec))
    return 'use-server';
  // Only this tab's own acknowledgement can cover its edits. Another writer can
  // reach the same (or a higher) server revision with entirely different content.
  if (local.clientRevision <= local.baseRevision) {
    return 'use-server';
  }
  if (local.baseRevision === input.serverRevision) return 'restore-local';
  return 'conflict';
}

export function readLocalLandingDraft(pageId: string): LocalLandingDraft | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(pageId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isLocalLandingDraft(parsed) || parsed.pageId !== pageId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalLandingDraft(draft: LocalLandingDraft) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(keyFor(draft.pageId), JSON.stringify(draft));
  } catch {
    /* quota or private mode — server autosave remains the source of truth */
  }
}

export function clearLocalLandingDraft(pageId: string) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(keyFor(pageId));
  } catch {
    /* ignore */
  }
}
