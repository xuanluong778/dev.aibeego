# Deploy plan — DnD + Footer ID + autosave tx (commit `585279d`)

**Đã duyệt triển khai production (2026-10-27).** Chỉ web bundle versioned + rebuild API. Không đổi schema, không restore DB, không publish/sửa trang khách hàng.

## Artifacts (đúng commit/bundle QA)

| Vai trò | Giá trị |
|---------|---------|
| Git tip (QA’d) | `585279d` (`fix(lp): enable block DnD…`) trên `feature/rebrand-aibeego` |
| Base merge | `main` @ `973fd6e` (3 commits: `1817cda`, `0abe265`, `585279d`) |
| Web release | `release-dnd-fix-K_XJRJ7p_Pa5` — BUILD_ID `K_XJRJ7p_Pa5YPWLsijae` |
| Web rollback (bundle đã archive) | `rollback-1b5032b-cb7dOatf6l-M` — BUILD_ID `cb7dOatf6l-MUfKOMGBfy` |
| Web prod trước promote | `release-973fd6e-nohCJ_P34fZa` — BUILD_ID `nohCJ_P34fZaEe_lVZjrp` (live container) |
| API fix | `landing-pages.service.ts`: `sanitizeLandingPageSpec` **ngoài** `$transaction` (từ `0abe265`) |
| QA evidence | `/var/www/aibeego_com_usr/data/backups/ui-baseline-add-components/ACCEPTANCE-20261027-v3.md` |
| Clone source (không đụng trang KH) | `LP_QA_SOURCE_PAGE_ID=1f07a824-f288-4150-a54d-ccf6df6f0269` |

Bundle `release-dnd-fix-K_XJRJ7p_Pa5` chứa artifact build đã QA (có `data-lp-footer-root` + HTML5 DnD). Manifest ghi `gitSha: 585279d`.

## Backup trước promote (không đụng DB)

```bash
REPO=/var/www/marketingaut_usr/data/www/marketingautoaz.com
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BK=/var/www/aibeego_com_usr/data/backups/web-promote-$STAMP
mkdir -p "$BK"

# Snapshot bundle đang chạy trong container (điểm rollback tức thì)
docker cp marketingspa-web:/app/apps/web/tmp/aibeego-next \
  "$BK/aibeego-next-live"
docker exec marketingspa-web cat /app/apps/web/tmp/aibeego-next/BUILD_ID \
  > "$BK/BUILD_ID.txt"

# Tag image API hiện tại để rollback binary (không restore DB)
API_IMG=$(docker inspect marketingspa-api --format '{{.Image}}')
echo "$API_IMG" > "$BK/api-image.txt"
docker inspect marketingspa-api --format '{{.Created}} {{.Id}}' > "$BK/api-meta.txt"
docker tag "$API_IMG" "marketingaz-api:pre-585279d-$STAMP"
echo "marketingaz-api:pre-585279d-$STAMP" > "$BK/api-rollback-tag.txt"

# Ghi nhận symlink current + manifest
readlink -f "$REPO/deploy/aibeego-vps/bundles/current" > "$BK/bundle-current.txt"
cp "$REPO/deploy/aibeego-vps/bundles/manifest.json" "$BK/manifest.json"
```

## Promote web (versioned bundle)

```bash
cd "$REPO"
node scripts/aibeego-web-bundle-link-current.cjs --bundle release-dnd-fix-K_XJRJ7p_Pa5
SRC="$REPO/deploy/aibeego-vps/bundles/current"
docker exec -u root marketingspa-web rm -rf /app/apps/web/tmp/aibeego-next
docker cp "$SRC/." marketingspa-web:/app/apps/web/tmp/aibeego-next
docker exec -u root marketingspa-web chown -R nextjs:nodejs /app/apps/web/tmp/aibeego-next
# Đồng bộ host copy (survive recreate)
rsync -a --delete "$SRC/" "$REPO/apps/web/tmp/aibeego-next/"
docker restart marketingspa-web
# Chờ health
for i in $(seq 1 30); do
  code=$(curl -sk -o /dev/null -w "%{http_code}" https://aibeego.com/login || true)
  [ "$code" = "200" ] && break
  sleep 2
done
docker exec marketingspa-web cat /app/apps/web/tmp/aibeego-next/BUILD_ID
# expect: K_XJRJ7p_Pa5YPWLsijae
```

## Promote API (autosave sanitize ngoài tx)

```bash
cd /opt/marketingaz
# Build context = repo (docker-compose.vps.yml) — source đã có fix tại 585279d/0abe265
docker compose -p marketingaz -f docker-compose.yml -f docker-compose.vps.yml build api
docker compose -p marketingaz -f docker-compose.yml -f docker-compose.vps.yml up -d --no-deps api
curl -sk https://aibeego.com/api/v1/health
# Tag image mới để đối chiếu
docker tag marketingaz-api:latest "marketingaz-api:post-585279d"
```

## Rollback web

```bash
# Ưu tiên: snapshot backup vừa tạo
docker exec -u root marketingspa-web rm -rf /app/apps/web/tmp/aibeego-next
docker cp "$BK/aibeego-next-live/." marketingspa-web:/app/apps/web/tmp/aibeego-next
docker exec -u root marketingspa-web chown -R nextjs:nodejs /app/apps/web/tmp/aibeego-next
# hoặc bundle archive prod trước promote:
# node scripts/aibeego-web-bundle-link-current.cjs --bundle release-973fd6e-nohCJ_P34fZa
# docker cp deploy/aibeego-vps/bundles/current/. marketingspa-web:/app/apps/web/tmp/aibeego-next
docker restart marketingspa-web
```

## Rollback API

```bash
TAG=$(cat "$BK/api-rollback-tag.txt")
docker tag "$TAG" marketingaz-api:latest
cd /opt/marketingaz
docker compose -p marketingaz -f docker-compose.yml -f docker-compose.vps.yml \
  up -d --no-deps --no-build api
# Không restore DB — chỉ đổi binary API.
```

## Kiểm tra sau promote (clone draft riêng)

```bash
cd "$REPO"
LP_QA_SOURCE_PAGE_ID=1f07a824-f288-4150-a54d-ccf6df6f0269 \
  APP_URL=https://aibeego.com API_URL=https://aibeego.com \
  node scripts/with-root-env.cjs node scripts/qa-landing-page-builder-post-deploy.cjs
# Smoke pages/templates nằm trong QA script (SMOKE__landing-pages_*)
```

Gate: DnD Header, undo/redo, autosave 2xx, reload, canvas block count = API; không publish trang KH.
