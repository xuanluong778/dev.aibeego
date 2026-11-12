import { lookupCname, normalizeSenderDomain, isValidSenderDomain } from '../email-marketing/email-domain-dns.util';

/** Default CNAME target for Ai Bee Go landing pages. Override via LANDING_PAGE_CNAME_TARGET. */
export function landingPageCnameTarget(): string {
  const fromEnv = process.env.LANDING_PAGE_CNAME_TARGET?.trim().toLowerCase();
  return (fromEnv || 'lp-edge.aibeego.com').replace(/\.$/, '');
}

export function normalizeLandingCustomDomain(input: string): string {
  return normalizeSenderDomain(input);
}

export function isValidLandingCustomDomain(domain: string): boolean {
  return isValidSenderDomain(domain);
}

export async function verifyLandingPageCname(domain: string): Promise<{
  ok: boolean;
  expected: string;
  found: string[];
  error?: string;
}> {
  const expected = landingPageCnameTarget();
  const host = normalizeLandingCustomDomain(domain);
  if (!isValidLandingCustomDomain(host)) {
    return { ok: false, expected, found: [], error: 'Domain không hợp lệ' };
  }
  const found = await lookupCname(host);
  const ok = found.some((v) => v === expected || v.endsWith(`.${expected}`));
  return {
    ok,
    expected,
    found,
    error: ok ? undefined : `CNAME chưa trỏ tới ${expected}`,
  };
}
