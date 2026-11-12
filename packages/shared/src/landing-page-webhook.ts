import { isSafeWebhookUrl } from './funnel-automation';
import type { LandingPageLeadWebhookPayload } from './landing-page-lead-crm';

/** POST JSON payload to an outbound webhook (automation or per-form). */
export async function postOutboundWebhook(
  url: string,
  payload: unknown,
  secretHeader?: string,
  timeoutMs = 8_000,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!isSafeWebhookUrl(url)) {
    return { ok: false, error: 'unsafe_url' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MarketingSPA-LandingPage/1.0',
    };
    if (secretHeader?.trim()) {
      headers['X-LP-Webhook-Secret'] = secretHeader.trim().slice(0, 256);
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export function postLandingPageLeadWebhook(
  url: string,
  payload: LandingPageLeadWebhookPayload,
  secretHeader?: string,
  timeoutMs = 8_000,
) {
  return postOutboundWebhook(url, payload, secretHeader, timeoutMs);
}
