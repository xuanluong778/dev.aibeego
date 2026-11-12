/**
 * Server-side API origin for public / preview landing pages.
 * Prefer docker-internal API so SSR does not hit a leftover host Next process
 * (127.0.0.1:4010) or a stale public hop.
 */
export function landingPagePublicApiBase(): string {
  const raw =
    process.env.LANDING_PAGE_API_INTERNAL_URL?.trim() ||
    process.env.API_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://127.0.0.1:4000';
  return raw.replace(/\/$/, '');
}
