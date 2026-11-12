import { randomUUID } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

export const ACTIVATION_EVENT = {
  SIGNUP: 'signup',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_CHANNEL_CONNECTED: 'first_channel_connected',
  FIRST_CUSTOMER_SYNCED: 'first_customer_synced',
  FIRST_AUTOPILOT_ANALYSIS: 'first_autopilot_analysis',
  FIRST_RECOMMENDATION_ACCEPTED: 'first_recommendation_accepted',
  FIRST_AUTOMATION_ACTIVATED: 'first_automation_activated',
  FIRST_BOOKING: 'first_booking',
  FIRST_SALE: 'first_sale',
} as const;

export type ActivationEventType = (typeof ACTIVATION_EVENT)[keyof typeof ACTIVATION_EVENT];

export type RecordActivationEventInput = {
  organizationId: string;
  eventType: ActivationEventType | string;
  source?: string;
  metadata?: Prisma.InputJsonValue;
};

type PrismaLike = Pick<PrismaClient, 'organizationActivationEvent'>;

/** Idempotent: first occurrence per org+eventType wins. */
export async function recordActivationEvent(
  prisma: PrismaLike,
  input: RecordActivationEventInput,
): Promise<void> {
  const eventType = String(input.eventType || '').trim();
  if (!eventType || !input.organizationId) return;

  try {
    await prisma.organizationActivationEvent.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        eventType,
        source: input.source?.slice(0, 120) ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'P2002') return;
    throw err;
  }
}
