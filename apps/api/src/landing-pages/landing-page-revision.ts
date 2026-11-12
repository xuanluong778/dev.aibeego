/** Optimistic concurrency for landing-page drafts. No I/O. */
export function readLandingPageRequestHash(spec: unknown): string | null {
  const hash = (spec as { meta?: { lastAutosaveRequestHash?: unknown } } | null)?.meta
    ?.lastAutosaveRequestHash;
  return typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash) ? hash : null;
}

export type AutosaveDecision =
  | { action: 'idempotent'; nextRevision: number }
  | { action: 'unchanged'; nextRevision: number }
  | { action: 'reject'; storedRevision: number }
  | { action: 'accept'; nextRevision: number };

export function readLandingPageRevision(spec: unknown): number {
  if (!spec || typeof spec !== 'object') return 0;
  const meta = (spec as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return 0;
  const rev = (meta as { clientRevision?: unknown }).clientRevision;
  return typeof rev === 'number' && Number.isFinite(rev) ? Math.max(0, Math.floor(rev)) : 0;
}

export function readLandingPageRequestId(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return null;
  const meta = (spec as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return null;
  const id = (meta as { lastAutosaveRequestId?: unknown }).lastAutosaveRequestId;
  return typeof id === 'string' && id.trim() ? id.slice(0, 64) : null;
}

/**
 * baseRevision is the revision the client last loaded or saved.
 * A second tab with the same base loses. Only an identical request is a no-op.
 * Re-saving the current revision (publish flush with no new edits) does not bump.
 */
export function decideLandingPageAutosave(input: {
  storedRevision: number;
  storedRequestId: string | null;
  baseRevision: number | null;
  incomingRevision: number | null;
  requestId: string | null;
  storedRequestHash?: string | null;
  requestHash?: string | null;
}): AutosaveDecision {
  const stored = Math.max(0, Math.floor(input.storedRevision) || 0);
  if (input.requestId && input.storedRequestId && input.requestId === input.storedRequestId) {
    // Old/colliding IDs without a matching receipt cannot acknowledge this draft.
    return input.requestHash && input.storedRequestHash === input.requestHash
      ? { action: 'idempotent', nextRevision: stored }
      : { action: 'reject', storedRevision: stored };
  }
  if (input.baseRevision == null) {
    if (input.incomingRevision != null && input.incomingRevision < stored) {
      return { action: 'reject', storedRevision: stored };
    }
    const incoming = input.incomingRevision == null ? stored : Math.max(0, Math.floor(input.incomingRevision));
    if (incoming <= stored) return { action: 'unchanged', nextRevision: stored };
    return { action: 'accept', nextRevision: incoming };
  }
  const base = Math.max(0, Math.floor(input.baseRevision));
  if (base !== stored) return { action: 'reject', storedRevision: stored };
  const incoming = input.incomingRevision == null ? stored + 1 : Math.max(0, Math.floor(input.incomingRevision));
  if (incoming <= stored) return { action: 'unchanged', nextRevision: stored };
  return { action: 'accept', nextRevision: Math.max(stored + 1, incoming) };
}

export function publishRevisionAllowed(
  storedRevision: number,
  expectedRevision: number | null,
): 'ok' | 'not_saved' | 'stale' {
  if (expectedRevision == null) return 'ok';
  const stored = Math.max(0, Math.floor(storedRevision) || 0);
  const expected = Math.max(0, Math.floor(expectedRevision));
  if (stored === expected) return 'ok';
  if (stored < expected) return 'not_saved';
  return 'stale';
}
