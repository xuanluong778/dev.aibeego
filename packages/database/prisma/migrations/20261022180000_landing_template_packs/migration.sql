-- Landing template packs: draft/publish + version history. Additive only.

DO $$ BEGIN
  CREATE TYPE "LandingPageTemplatePublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "landing_page_templates"
  ADD COLUMN IF NOT EXISTS "publish_status" "LandingPageTemplatePublishStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS "published_definition" JSONB,
  ADD COLUMN IF NOT EXISTS "asset_key" VARCHAR(64);

CREATE INDEX IF NOT EXISTS "landing_page_templates_publish_status_idx"
  ON "landing_page_templates"("publish_status");

CREATE TABLE IF NOT EXISTS "landing_page_template_versions" (
  "id" TEXT NOT NULL,
  "template_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "note" VARCHAR(500),
  "created_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_page_template_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landing_page_template_versions_template_id_version_key"
  ON "landing_page_template_versions"("template_id", "version");

CREATE INDEX IF NOT EXISTS "landing_page_template_versions_template_id_created_at_idx"
  ON "landing_page_template_versions"("template_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "landing_page_template_versions"
    ADD CONSTRAINT "landing_page_template_versions_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "landing_page_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
