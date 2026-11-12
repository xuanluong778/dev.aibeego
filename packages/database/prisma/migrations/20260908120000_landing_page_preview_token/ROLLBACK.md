# Rollback: landing_page_preview_token

```sql
DROP INDEX IF EXISTS "landing_pages_preview_expires_at_idx";
DROP INDEX IF EXISTS "landing_pages_preview_token_key";
ALTER TABLE "landing_pages" DROP COLUMN IF EXISTS "preview_expires_at";
ALTER TABLE "landing_pages" DROP COLUMN IF EXISTS "preview_token";
```

Safe: columns are nullable; dropping removes draft-preview only. Published pages unaffected.
