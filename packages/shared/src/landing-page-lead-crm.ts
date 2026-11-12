import type {
  LandingPageLeadFormBlock,
  LandingPageLeadFormCrmConfig,
  LandingPageSpec,
} from './landing-page-types';

/** Resolve LeadForm block from published spec by canvas block id. */
export function resolveLeadFormBlockFromSpec(
  spec: LandingPageSpec | null | undefined,
  blockId?: string | null,
): LandingPageLeadFormBlock | null {
  if (!spec?.blocks?.length) return null;
  const blocks = spec.blocks.filter((b) => b.type === 'LeadForm') as LandingPageLeadFormBlock[];
  if (!blocks.length) return null;
  if (blockId) {
    const hit = blocks.find((b) => b.id === blockId);
    if (hit) return hit;
  }
  return blocks.find((b) => b.enabled !== false) ?? blocks[0] ?? null;
}

export function mergeLeadFormTags(
  pageSlug: string,
  crm?: LandingPageLeadFormCrmConfig | null,
): string[] {
  return Array.from(
    new Set([
      `landing_page:${pageSlug}`,
      'landing_page',
      ...((crm?.tags ?? []).map((t) => String(t).trim()).filter(Boolean) as string[]),
    ]),
  );
}

export type LandingPageLeadWebhookPayload = {
  event: 'landing_page.lead.created' | 'landing_page.form.submitted';
  organizationId: string;
  landingPageId: string;
  landingPageSlug: string;
  blockId: string | null;
  leadId: string;
  isUpdate: boolean;
  source: string;
  device?: string | null;
  referrer?: string | null;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
  fields: Record<string, string>;
  submittedAt: string;
};

export function buildLandingPageLeadWebhookPayload(input: {
  event: LandingPageLeadWebhookPayload['event'];
  organizationId: string;
  landingPageId: string;
  landingPageSlug: string;
  blockId?: string | null;
  leadId: string;
  isUpdate: boolean;
  source?: string;
  device?: string | null;
  referrer?: string | null;
  utm?: LandingPageLeadWebhookPayload['utm'];
  fields: Record<string, string>;
  submittedAt?: string;
}): LandingPageLeadWebhookPayload {
  return {
    event: input.event,
    organizationId: input.organizationId,
    landingPageId: input.landingPageId,
    landingPageSlug: input.landingPageSlug,
    blockId: input.blockId ?? null,
    leadId: input.leadId,
    isUpdate: input.isUpdate,
    source: input.source ?? 'landing_page_form',
    device: input.device ?? null,
    referrer: input.referrer ?? null,
    utm: input.utm,
    fields: input.fields,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  };
}
