-- Schema drift sync (ADD-ONLY): guardrail emergency/cooldown + activation events
-- Work/time/teleprompter tables already created by prior migrations; Prisma schema sync only.

ALTER TABLE "marketing_autopilot_guardrails"
  ADD COLUMN IF NOT EXISTS "emergency_stop" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "cooldown_minutes" INTEGER NOT NULL DEFAULT 60;

CREATE TABLE IF NOT EXISTS "organization_activation_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "event_type" VARCHAR(64) NOT NULL,
    "source" VARCHAR(120),
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organization_activation_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "organization_activation_events_organization_id_event_type_key"
  ON "organization_activation_events"("organization_id", "event_type");

CREATE INDEX IF NOT EXISTS "organization_activation_events_organization_id_occurred_at_idx"
  ON "organization_activation_events"("organization_id", "occurred_at");

DO $$ BEGIN
  ALTER TABLE "organization_activation_events" ADD CONSTRAINT "organization_activation_events_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
