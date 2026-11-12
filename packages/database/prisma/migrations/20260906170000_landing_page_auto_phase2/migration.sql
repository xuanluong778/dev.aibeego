-- Landing Page Auto Phase 2 — AI/CRM/Automation/Analytics/Domain (additive)

ALTER TYPE "AutomationTriggerType" ADD VALUE IF NOT EXISTS 'LANDING_PAGE_FORM_SUBMITTED';

DO $$ BEGIN
  CREATE TYPE "LandingPageEventType" AS ENUM ('PAGE_VIEW', 'CTA_CLICK', 'FORM_START', 'FORM_SUBMIT', 'LEAD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "landing_pages"
  ADD COLUMN IF NOT EXISTS "custom_domain_verified_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "tracking_config" JSONB;

ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS "landing_page_id" TEXT;

CREATE INDEX IF NOT EXISTS "leads_landing_page_id_idx" ON "leads"("landing_page_id");

DO $$ BEGIN
  ALTER TABLE "leads"
    ADD CONSTRAINT "leads_landing_page_id_fkey"
    FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "landing_page_events" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "landing_page_id" TEXT NOT NULL,
  "lead_id" TEXT,
  "event_type" "LandingPageEventType" NOT NULL,
  "visitor_id" VARCHAR(80),
  "session_id" VARCHAR(80),
  "device" VARCHAR(40),
  "utm_source" VARCHAR(120),
  "utm_medium" VARCHAR(120),
  "utm_campaign" VARCHAR(160),
  "utm_content" VARCHAR(160),
  "utm_term" VARCHAR(160),
  "referrer" VARCHAR(2000),
  "meta" JSONB,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_page_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "landing_page_events_org_page_type_occurred_idx"
  ON "landing_page_events"("organization_id", "landing_page_id", "event_type", "occurred_at");
CREATE INDEX IF NOT EXISTS "landing_page_events_org_occurred_idx"
  ON "landing_page_events"("organization_id", "occurred_at");
CREATE INDEX IF NOT EXISTS "landing_page_events_org_utm_idx"
  ON "landing_page_events"("organization_id", "utm_source", "utm_campaign");
CREATE INDEX IF NOT EXISTS "landing_page_events_org_visitor_idx"
  ON "landing_page_events"("organization_id", "visitor_id");

DO $$ BEGIN
  ALTER TABLE "landing_page_events"
    ADD CONSTRAINT "landing_page_events_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "landing_page_events"
    ADD CONSTRAINT "landing_page_events_landing_page_id_fkey"
    FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
