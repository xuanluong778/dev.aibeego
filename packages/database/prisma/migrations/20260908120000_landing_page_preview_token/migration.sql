-- Additive: draft preview token for Landing Pages (nullable, backward-compatible).
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "preview_token" VARCHAR(64);
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "preview_expires_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "landing_pages_preview_token_key" ON "landing_pages"("preview_token");
CREATE INDEX IF NOT EXISTS "landing_pages_preview_expires_at_idx" ON "landing_pages"("preview_expires_at");
