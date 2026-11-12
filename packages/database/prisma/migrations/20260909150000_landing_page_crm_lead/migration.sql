-- Landing Page → CRM Lead: block id + new automation trigger (additive)

ALTER TYPE "AutomationTriggerType" ADD VALUE IF NOT EXISTS 'LANDING_PAGE_LEAD_CREATED';

ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS "landing_page_block_id" VARCHAR(64);

CREATE INDEX IF NOT EXISTS "leads_landing_page_block_id_idx" ON "leads"("landing_page_block_id");
