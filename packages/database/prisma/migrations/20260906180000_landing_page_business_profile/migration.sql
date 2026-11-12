-- Landing Page Business Profile (org-scoped 1:1)
CREATE TABLE IF NOT EXISTS "business_profiles" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "brand_name" VARCHAR(120),
  "company_name" VARCHAR(160),
  "website" VARCHAR(2000),
  "industry" VARCHAR(120),
  "description" TEXT,
  "product_service" VARCHAR(400),
  "target_customer" VARCHAR(400),
  "usp" VARCHAR(800),
  "hotline" VARCHAR(40),
  "email" VARCHAR(160),
  "address" VARCHAR(500),
  "logo_url" VARCHAR(2000),
  "brand_color" VARCHAR(32),
  "facebook_url" VARCHAR(2000),
  "social_links" JSONB,
  "default_cta" VARCHAR(80),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_profiles_organization_id_key" ON "business_profiles"("organization_id");

DO $$ BEGIN
  ALTER TABLE "business_profiles"
    ADD CONSTRAINT "business_profiles_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
