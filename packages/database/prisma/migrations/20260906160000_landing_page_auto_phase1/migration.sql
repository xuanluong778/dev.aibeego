-- Landing Page Auto Phase 1 — additive tables (independent of Funnel / Facebook)

DO $$ BEGIN
  CREATE TYPE "LandingPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LandingPageTheme" AS ENUM ('MODERN', 'PREMIUM', 'MINIMAL', 'BOLD', 'CORPORATE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LandingPageDomainStatus" AS ENUM ('PENDING', 'VERIFYING', 'ACTIVE', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "landing_page_templates" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "theme" "LandingPageTheme" NOT NULL DEFAULT 'MODERN',
  "description" TEXT NOT NULL DEFAULT '',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "thumbnail_url" VARCHAR(2000),
  "definition" JSONB NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_page_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "landing_page_templates_organization_id_updated_at_idx"
  ON "landing_page_templates"("organization_id", "updated_at");
CREATE INDEX IF NOT EXISTS "landing_page_templates_slug_idx"
  ON "landing_page_templates"("slug");
CREATE INDEX IF NOT EXISTS "landing_page_templates_is_system_slug_idx"
  ON "landing_page_templates"("is_system", "slug");
CREATE INDEX IF NOT EXISTS "landing_page_templates_is_system_category_idx"
  ON "landing_page_templates"("is_system", "category");

CREATE UNIQUE INDEX IF NOT EXISTS "landing_page_templates_system_slug_key"
  ON "landing_page_templates"("slug")
  WHERE "organization_id" IS NULL AND "is_system" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "landing_page_templates_org_slug_key"
  ON "landing_page_templates"("organization_id", "slug")
  WHERE "organization_id" IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE "landing_page_templates"
    ADD CONSTRAINT "landing_page_templates_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "landing_pages" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "created_by_id" TEXT,
  "template_id" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "LandingPageStatus" NOT NULL DEFAULT 'DRAFT',
  "theme" "LandingPageTheme" NOT NULL DEFAULT 'MODERN',
  "draft_spec" JSONB NOT NULL,
  "published_spec" JSONB,
  "seo_title" VARCHAR(200),
  "seo_description" VARCHAR(500),
  "seo_canonical" VARCHAR(2000),
  "og_image" VARCHAR(2000),
  "robots_index" BOOLEAN NOT NULL DEFAULT true,
  "subdomain_slug" TEXT,
  "custom_domain" VARCHAR(255),
  "custom_domain_status" "LandingPageDomainStatus",
  "custom_domain_error" VARCHAR(500),
  "published_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landing_pages_organization_id_slug_key"
  ON "landing_pages"("organization_id", "slug");
CREATE INDEX IF NOT EXISTS "landing_pages_organization_id_status_updated_at_idx"
  ON "landing_pages"("organization_id", "status", "updated_at");
CREATE INDEX IF NOT EXISTS "landing_pages_organization_id_subdomain_slug_idx"
  ON "landing_pages"("organization_id", "subdomain_slug");
CREATE INDEX IF NOT EXISTS "landing_pages_custom_domain_idx"
  ON "landing_pages"("custom_domain");

DO $$ BEGIN
  ALTER TABLE "landing_pages"
    ADD CONSTRAINT "landing_pages_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "landing_pages"
    ADD CONSTRAINT "landing_pages_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "landing_page_templates"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "landing_page_versions" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "landing_page_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "note" VARCHAR(500),
  "created_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "landing_page_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landing_page_versions_landing_page_id_version_key"
  ON "landing_page_versions"("landing_page_id", "version");
CREATE INDEX IF NOT EXISTS "landing_page_versions_organization_id_landing_page_id_created_at_idx"
  ON "landing_page_versions"("organization_id", "landing_page_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "landing_page_versions"
    ADD CONSTRAINT "landing_page_versions_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "landing_page_versions"
    ADD CONSTRAINT "landing_page_versions_landing_page_id_fkey"
    FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
