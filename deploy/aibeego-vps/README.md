# aibeego.com VPS Docker overlay

Canonical copies of files under `/opt/marketingaz` that are **not** in the monorepo root by default.

## Sync to VPS runtime

```bash
REPO=/var/www/marketingaut_usr/data/www/marketingautoaz.com
rsync -a "$REPO/deploy/aibeego-vps/docker/web-start.sh" /opt/marketingaz/docker/web-start.sh
rsync -a "$REPO/deploy/aibeego-vps/docker/web-api-proxy.js" /opt/marketingaz/docker/web-api-proxy.js
rsync -a "$REPO/deploy/aibeego-vps/docker-compose.vps.yml" /opt/marketingaz/docker-compose.vps.yml
chmod +x /opt/marketingaz/docker/web-start.sh
```

After sync, recreate **web** only if entrypoint/volumes changed (not required for `web-start.sh` content-only edits — remount needs recreate).

## Web bundle (`tmp/aibeego-next`) — managed artifacts

Build on host:

```bash
cd "$REPO"
SKIP_PM2_WEB_RELOAD=1 NEXT_DIST_DIR=tmp/aibeego-next pnpm --filter @marketingspa/web build
```

**Archive (versioned rollback, no DB):**

```bash
node scripts/aibeego-web-bundle-archive.cjs --label release-973fd6e
node scripts/aibeego-web-bundle-link-current.cjs --bundle release-973fd6e-<BUILD_PREFIX>
node scripts/test-aibeego-web-bundle-recreate.cjs
```

Bundles live under `deploy/aibeego-vps/bundles/` (gitignored trees; `manifest.json` tracked).

**Promote to production web (manual until bind mount approved):**

```bash
docker cp "$REPO/apps/web/tmp/aibeego-next" marketingspa-web:/app/apps/web/tmp/aibeego-next
docker exec -u root marketingspa-web chown -R nextjs:nodejs /app/apps/web/tmp/aibeego-next
docker restart marketingspa-web
```

**QA recreate (not production):** `deploy/aibeego-vps/docker-compose.qa-recreate.yml` + `marketingaz-qa` project.

Rollback: activate previous bundle dir + promote; see `bundles/manifest.json` and `ROLLBACK-WEB-973fd6e.md` in aibeego backups.

## Work management: tạo dự án 500 trên VPS

Triệu chứng: `POST /api/v1/work-management/projects` trả **500**, local OK.

Nguyên nhân thường gặp: DB production thiếu cột `work_projects.custom_field_defs` (và có thể `work_tasks.custom_fields`) — code Prisma mới hơn migration đã chạy trên VPS.

**Cách 1 — migrate chính thức (khuyến nghị):** trên server, trong repo đã pull bản mới:

```bash
cd "$REPO"
pnpm db:migrate:deploy
docker compose -f docker-compose.yml -f deploy/aibeego-vps/docker-compose.vps.yml up -d api web
```

Migration: `20261113100000_work_management_custom_fields`.

**Cách 2 — SQL khẩn (nếu chưa deploy code migration):**

```sql
ALTER TABLE work_projects ADD COLUMN IF NOT EXISTS custom_field_defs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE work_tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
```

Sau đó vẫn nên chạy `migrate deploy` để `_prisma_migrations` khớp.
