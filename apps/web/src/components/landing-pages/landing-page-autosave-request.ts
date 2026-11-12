/** One identity per save operation, independent of tab/session-local counters. */
export function createLandingPageAutosaveRequestId(): string {
  if (typeof globalThis.crypto.randomUUID === 'function') {
    return `lp-as-${globalThis.crypto.randomUUID()}`;
  }
  // getRandomValues also works where randomUUID requires a secure context.
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return `lp-as-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}
