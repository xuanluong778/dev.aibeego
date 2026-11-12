# Deploy local bằng Docker — đồng bộ giao diện + database với aibeego.com

Hướng dẫn này dựng **cả stack** (Postgres, Redis, API, Worker, Web, Nginx) trên máy bạn, restore **đúng database production**, build **đúng mã nguồn đang chạy trên GitHub `main`**. Mục tiêu: mở `http://localhost:8080` là thấy cùng giao diện và cùng dữ liệu với [https://aibeego.com](https://aibeego.com), ít bước dễ sai.

**Không chạy các lệnh trong file này trên VPS production.** Container name (`marketingspa-postgres`, `marketingspa-web`, …) trùng với site đang live — `docker compose up` nhầm trên VPS sẽ đè production.

---

## 0. Bạn sẽ có gì khi xong

| Trên production | Trên local |
| --- | --- |
| `https://aibeego.com` | `http://localhost:8080` (một origin, Nginx proxy web + `/api` + `/uploads`) |
| PostgreSQL `marketingspa` ~85 MB / 228 bảng / 19 130 dòng | Cùng dump đã verify (file zip ~22 MB vì đã nén) |
| Giao diện Next.js + thư viện Bộ hẹn giờ 10 mẫu | Build từ `main` (cùng commit với GitHub) |
| Ảnh user upload (`apps/api/uploads`, ~495 MB) | Copy thêm thư mục uploads (không nằm trong dump SQL) |

Dump zip **22 MB ≠ thiếu data**. Database trên đĩa là 85 MB (kèm index); zip nén dump 13 MB + SQL 117 MB. Restore đã đối chiếu **228 bảng / 19 130 dòng, lệch 0**.

---

## 1. Máy cần có

- Docker Desktop (Windows/macOS) hoặc Docker Engine + Compose v2 (Linux)
- RAM **16 GB** khuyến nghị (tối thiểu 8 GB; build 3 image Node rất nặng)
- Ổ trống **15 GB+** (image + `uploads`)
- Git
- Cổng **8080, 3000, 4000** chưa bị chiếm

Kiểm tra:

```bash
docker version
docker compose version
git --version
```

Windows: bật **WSL2 backend** trong Docker Desktop. Git Bash hoặc PowerShell đều được; lệnh dưới là bash.

---

## 2. Lấy mã nguồn đúng bản đang live

Repo: `git@github.com:xuanluong778/aibeego.git` — nhánh **`main`**.

```bash
git clone -b main git@github.com:xuanluong778/aibeego.git aibeego
cd aibeego
git status
git log -1 --oneline
```

HTTPS nếu chưa có SSH key:

```bash
git clone -b main https://github.com/xuanluong778/aibeego.git aibeego
cd aibeego
```

`HEAD` phải là commit đã đẩy production (ví dụ `305077d` trở đi). Đừng checkout nhánh cũ, đừng `git pull` giữa chừng khi đang build.

---

## 3. Chuẩn bị dump database + (nên có) uploads

### 3.1 Database (bắt buộc)

Giải nén zip dump đã xuất từ VPS vào repo:

```bash
mkdir -p backups/local-sync
# Copy file zip vào đây rồi:
unzip -o /đường-dẫn/marketingspa-db-full-YYYYMMDD_HHMMSS.zip -d backups/local-sync
ls -lh backups/local-sync/marketingspa.dump
```

Dùng **`marketingspa.dump`** (pg_restore). Không cần `marketingspa.sql` trừ khi `.dump` lỗi.

### 3.2 Uploads (nên có — ảnh landing page, file user)

Dump SQL **không** chứa file trong `apps/api/uploads` (~495 MB trên VPS). Không copy thì trang vẫn chạy, nhưng ảnh đã upload trên aibeego.com sẽ vỡ.

Trên máy local, sau khi copy từ VPS (scp / FastPanel / zip):

```text
aibeego/apps/api/uploads/
  public/ ...
  landing-template-packs/ ...
  work/ ...
```

Ví dụ từ máy bạn (thay user/host):

```bash
scp -r USER@VPS:/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/api/uploads ./apps/api/uploads
```

---

## 4. File `.env` — chỗ dễ sai nhất

```bash
cp .env.example .env
```

Sửa **đúng các dòng dưới**. Giữ `POSTGRES_*` khớp nhau. **Không** để `NEXT_PUBLIC_*` trỏ `https://aibeego.com` — web Dockerfile sẽ bake URL đó vào JS, trình duyệt local sẽ gọi nhầm production.

```env
NODE_ENV=production

APP_URL=http://localhost:8080
API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

POSTGRES_USER=marketingspa
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=marketingspa
DATABASE_URL=postgresql://marketingspa:change_me_strong_password@postgres:5432/marketingspa?schema=public

REDIS_URL=redis://redis:6379

JWT_SECRET=change_me_jwt_secret_min_32_chars_long
JWT_REFRESH_SECRET=change_me_refresh_secret_min_32_chars
ENCRYPTION_KEY=change_me_encryption_key_min_32_chars

MESSAGING_LIVE_SEND=false
ADS_ACTIONS_LIVE=false
ADS_ACTIONS_PROVIDER_WRITE=false
```

Ghi chú:

- Đăng nhập bằng **email + mật khẩu tài khoản trên aibeego.com**. `JWT_SECRET` khác production vẫn login được (token mới). Session cũ trên web production không mang sang.
- Token Meta/Google đã lưu trong DB chỉ giải mã được nếu `ENCRYPTION_KEY` **trùng production**. Copy key đó từ `.env` trên VPS vào local nếu cần OAuth chạy. **Không commit `.env`.**
- Overlay `docker-compose.local.yml` còn ghi đè `APP_URL` / CORS / tắt gửi tin nhắn live — kể cả khi `.env` sót.

---

## 5. Lệnh tắt / alias (dùng suốt hướng dẫn)

```bash
export DC='docker compose -f docker-compose.yml -f docker-compose.local.yml'
```

Windows PowerShell:

```powershell
$DC = "docker compose -f docker-compose.yml -f docker-compose.local.yml"
# rồi gọi: Invoke-Expression "$DC up -d postgres"
```

`docker-compose.local.yml` bắt buộc. Nếu chỉ `docker compose up`, image web mặc định bake `https://aibeego.com`.

---

## 6. Build (một lần, 10–25 phút)

Cấp Docker ít nhất **6 GB RAM**. Lần đầu tải image Node/Postgres.

```bash
$DC build
```

Chỉ rebuild web sau khi đổi `NEXT_PUBLIC_*`:

```bash
$DC build web --no-cache
```

---

## 7. Bật Postgres + Redis, restore database

```bash
$DC up -d postgres redis
$DC exec postgres pg_isready -U marketingspa
```

Đợi `accepting connections`. Restore **đè** DB trống do Postgres khởi tạo:

```bash
docker cp backups/local-sync/marketingspa.dump marketingspa-postgres:/tmp/marketingspa.dump

$DC exec postgres pg_restore \
  -U marketingspa \
  -d marketingspa \
  --no-owner --no-acl --clean --if-exists \
  /tmp/marketingspa.dump
```

`pg_restore` có thể in vài `WARNING` (role không tồn tại) — bình thường vì dump `--no-owner`. **Không được có `ERROR` hàng loạt rồi dừng giữa chừng.**

**Không** chạy `pnpm db:seed` — seed sẽ trộn data demo vào data production.

Kiểm tra khớp production (số lúc dump 2026-11-11):

```bash
$DC exec postgres psql -U marketingspa -d marketingspa -c "\
SELECT
  (SELECT count(*) FROM organizations) AS organizations,
  (SELECT count(*) FROM users) AS users,
  (SELECT count(*) FROM landing_pages) AS landing_pages,
  (SELECT count(*) FROM landing_page_templates) AS templates,
  (SELECT count(*) FROM leads) AS leads;"
```

Kỳ vọng khoảng: **47 org / 41 user / 27 landing page / 200 template / 23 lead**.

---

## 8. Bật toàn bộ stack

```bash
$DC up -d
$DC ps
```

Phải `Up`: `postgres`, `redis`, `api`, `worker`, `web`, `nginx`. Không cần `backup`.

Đợi API/web healthy (~20–40 giây lần đầu):

```bash
curl -sS http://localhost:4000/api/v1/health
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080
```

Health API cần DB + Redis OK. Web trả `200`.

Mở **duy nhất**:

```text
http://localhost:8080
```

Đăng nhập bằng tài khoản đang dùng trên aibeego.com.

---

## 9. Checklist đồng bộ với website hiện tại

Làm trên `http://localhost:8080` (cùng account production):

1. Login vào được, đúng tổ chức / menu.
2. **Landing page → Trang của tôi**: đủ trang (production có 27).
3. Mở builder một trang đã có — layout, chữ, cột giống aibeego.com.
4. Kéo **Bộ hẹn giờ** vào canvas → popup **Thư viện Bộ hẹn giờ** đủ 10 mẫu.
5. **Thư viện templates** ~200 mẫu.
6. Ảnh trong trang: hiện nếu đã copy `apps/api/uploads`; vỡ 404 nếu chưa copy.
7. DevTools → Network: request API phải là `http://localhost:8080/api/...`, **không** gọi `https://aibeego.com`.

Sai bước 7 = quên overlay / quên `--no-cache` khi build web. Sửa: `$DC build web --no-cache && $DC up -d web nginx`.

---

## 10. Tắt / xóa / restore lại

Dừng, giữ data:

```bash
$DC stop
```

Xóa container, **giữ volume Postgres**:

```bash
$DC down
```

Xóa luôn database local (mất data máy bạn, không đụng production):

```bash
$DC down -v
```

Restore lại từ đầu: `down -v` → mục 7 → mục 8.

---

## 11. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử |
| --- | --- | --- |
| Login xong data lạ / gọi nhầm aibeego.com | Web bake `NEXT_PUBLIC_API_URL=https://aibeego.com` | `$DC build web --no-cache` rồi `up -d web` |
| CORS / login fail trên `:8080` | `APP_URL` không phải `http://localhost:8080` | Kiểm tra overlay + `.env`, `up -d api` |
| `port is already allocated` 8080/3000/4000 | App khác đang giữ cổng | Đổi cổng Nginx trong overlay, hoặc tắt process cũ (`docker ps`, Laragon, IIS) |
| `container name ... already in use` | Trùng `marketingspa-*` | `docker rm -f` container cũ **chỉ trên máy local** |
| `pg_restore` failed / DB trống | Restore lúc Postgres chưa ready, hoặc copy nhầm `.sql` | `pg_isready` rồi restore `.dump` |
| API 500 sau restore | Schema code mới hơn dump | Từ máy có pnpm: `pnpm db:migrate:deploy` trỏ `DATABASE_URL` vào container (xem dưới). Không seed |
| Ảnh landing vỡ | Chưa copy `uploads` | Mục 3.2 + volume `./apps/api/uploads:/app/uploads` |
| Build chết / `Killed` | Hết RAM | Tăng RAM Docker Desktop, đóng app khác, build từng service: `$DC build api` rồi `web` |
| Windows `pnpm`/`unzip` không có | Chưa cài | Dump chỉ cần Docker + `unzip`; không bắt buộc pnpm |
| OAuth Meta/Google local lỗi | Redirect URI localhost chưa khai trên Meta/Google | Bình thường; local chủ yếu xem UI + data. Đừng trỏ OAuth production về máy bạn |

Migration tùy chọn (khi API kêu thiếu cột, **sau** restore, **không** seed). Cần Node/pnpm trên host, Postgres published — overlay hiện **không** mở cổng 5432 ra host (tránh đụng Postgres máy bạn). Cách an toàn:

```bash
$DC exec postgres psql -U marketingspa -d marketingspa -c \
  "SELECT count(*) FROM _prisma_migrations;"
```

Dump production đã có 66 migration. Nếu API vẫn lỗi schema, chạy migrate bằng one-off cùng image api (image runner có thể không có CLI Prisma — khi đó hỏi người giữ VPS dump mới sau khi migrate production).

---

## 12. Việc local **cố ý không** giống 100% production

- Domain/SSL: `http://localhost:8080` chứ không phải `https://aibeego.com`.
- Gửi tin nhắn / ads write: overlay **tắt** (`MESSAGING_LIVE_SEND=false`, `ADS_ACTIONS_LIVE=false`) để máy bạn không bắn chiến dịch thật.
- Thanh toán SePay, webhook Meta: URL callback vẫn là production — đừng test thanh toán thật trên local.
- Worker hàng đợi chạy, nhưng job backup bị tắt (`profiles: ops`).
- File zip dump không gồm Redis / file upload; Redis local bắt đầu trống (đăng nhập tạo session mới).

---

## 13. Cập nhật sau này cho khớp site mới

```bash
git checkout main
git pull origin main
# Lấy dump mới từ VPS (lặp mục 3 + 7) nếu cần data mới
$DC build
$DC up -d
```

Mỗi lần đổi `NEXT_PUBLIC_*` phải **build lại web**. Chỉ `up -d` không đổi URL đã bake.

---

## File liên quan

| File | Việc |
| --- | --- |
| `docker-compose.yml` | Stack gốc |
| `docker-compose.local.yml` | Overlay local (bắt buộc) |
| `docker/nginx/nginx.local.conf` | Proxy một origin `:8080` + `/uploads` |
| `apps/web/Dockerfile` | Bake `NEXT_PUBLIC_*` lúc **build** |
| `.env.example` | Mẫu biến môi trường |
| `backups/local-sync/marketingspa.dump` | Dump production (không commit) |
