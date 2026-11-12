/** Server-only payload receipts for landing-page autosave. No database I/O. */
import { createHash } from 'crypto';

function canonicalAutosaveJson(value: unknown): string {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}

/** Bind a receipt to the operation's base, revision, name and submitted payload. */
export function hashLandingPageAutosaveRequest(input: {
  draftSpec: unknown;
  name?: string;
  baseRevision: number | null;
  clientRevision: number | null;
}): string {
  return createHash('sha256').update(canonicalAutosaveJson(input)).digest('hex');
}

/** Content equality for a no-edit flush, excluding server receipt metadata. */
export function landingPageAutosaveContentKey(spec: unknown): string {
  const record = (spec || {}) as Record<string, unknown>;
  const meta = { ...((record.meta || {}) as Record<string, unknown>) };
  delete meta.clientRevision;
  delete meta.lastAutosaveRequestId;
  delete meta.lastAutosaveRequestHash;
  return canonicalAutosaveJson({ ...record, meta: Object.keys(meta).length ? meta : undefined });
}
