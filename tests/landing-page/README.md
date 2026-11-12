# Bộ code test Landing Page (LP01–LP12)

Thư mục này chứa **code kiểm thử** tương ứng với tài liệu `docs/test case/suites/LP*-test-suites.md`.
Mỗi tệp `suites/LPxx-*.test.ts` ứng với một flow; mỗi `suite(...)` ứng với một Suite trong tài liệu; mỗi `tc(...)` hoặc `todo(...)` mang **đúng mã case** trong tài liệu (ví dụ `LP05-S01-TC004`).

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `suites/` | 12 tệp test, 75 suite, 647 case (mã giống tài liệu) |
| `fixtures/` | **Dữ liệu giả**: tài khoản, trang mẫu, lead, motion, tên miền, gói ZIP mẫu, dữ liệu smoke |
| `support/` | Hạ tầng: `api.ts` (gọi HTTP), `lp.ts` (tạo/lưu/xuất bản trang, dọn dẹp), `browser.ts` (Playwright), `trace.ts` (in dữ liệu vào/ra), `harness.ts` (`suite`/`tc`/`todo`), `env.ts` |
| `tools/show-data.ts` | In toàn bộ dữ liệu giả ra màn hình |
| `DATA-CATALOG.md` | Danh mục dữ liệu giả, dữ liệu hệ thống nhận vào, ví dụ nhật ký chạy thật, biến môi trường |
| `CODE-COVERAGE.md` | Case nào đã có code, thuộc lớp nào |
| `artifacts/` | Nhật ký lần chạy lớp unit gần nhất (`last-unit-run.txt`, `trace.jsonl`, `fake-data.md`) |

## Ba lớp test

| Lớp | Gọi | Cần gì | Khi thiếu |
|---|---|---|---|
| `unit` | Hàm thuần của code sản phẩm (quyết định autosave, đọc gói ZIP, làm sạch motion, chuẩn hóa tên miền, khôi phục bản nháp, ẩn/khóa phần tử, nhóm phần tử) | Chỉ cần Node và `tsx` | Chạy được ngay |
| `api` | HTTP thật tới API của **môi trường test** | `LP_API_BASE` và tài khoản test | **Tự bỏ qua** kèm lý do |
| `e2e` | Chromium mở trang công khai `/p/<slug>` và đo bố cục | `LP_WEB_BASE`, `LP_API_BASE`, tài khoản, và `npx playwright install chromium` | **Tự bỏ qua** |

Case chưa có code là `todo(...)` kèm lý do; node hiển thị chúng là `todo`, không phải lỗi. Mã case vẫn nằm trong code để không mất dấu.

## Chạy

```bash
# Chạy ngay, không cần máy chủ (lớp unit; lớp api/e2e tự bỏ qua):
tests/landing-page/run.sh unit

# Một flow:
tests/landing-page/run.sh unit LP05

# Kiểm tra kiểu:
cd packages/database && npx tsc -p ../../tests/landing-page/tsconfig.json

# In dữ liệu giả:
cd packages/database && npx tsx ../../tests/landing-page/tools/show-data.ts
```

Chạy lớp api/e2e (CHỈ trên stack test, không phải production):

```bash
export LP_API_BASE=http://127.0.0.1:4000/api/v1
export LP_WEB_BASE=http://127.0.0.1:3000          # chỉ cần cho lớp e2e
export LP_ORG_A_OWNER_EMAIL=...   LP_ORG_A_OWNER_PASSWORD=...
export LP_ORG_A_VIEWER_EMAIL=...  LP_ORG_A_VIEWER_PASSWORD=...
export LP_ORG_B_OWNER_EMAIL=...   LP_ORG_B_OWNER_PASSWORD=...
export LP_SUPER_ADMIN_EMAIL=...   LP_SUPER_ADMIN_PASSWORD=...
tests/landing-page/run.sh all
```

Bảo vệ: nếu host của `LP_API_BASE` hoặc `LP_WEB_BASE` không phải localhost, bộ test **từ chối chạy** trừ khi đặt `LP_ALLOW_REMOTE=1`. Mọi trang test tạo ra đều có tên chứa `LPT` và `RUN_ID`, và được xóa ở cuối lần chạy.

## Dữ liệu giả và dữ liệu hệ thống nhận vào

Mỗi case in nhật ký có nhãn `[FAKE]`, `[SYSTEM]`, `[ACTUAL]`, `[EXPECT]` (tắt bằng `LP_TRACE=0`, ghi ra tệp bằng `LP_TRACE_FILE`). Xem `DATA-CATALOG.md`.

## Trạng thái thực tế (11/11/2026)

- Lớp **unit đã chạy thật**: 53 khối test PASS, 0 lỗi, 133 khối api/e2e tự bỏ qua, 468 `todo` (xem `artifacts/last-unit-run.txt`).
- Lớp **api và e2e CHƯA được chạy**: chưa có stack test. Chúng đã qua kiểm tra kiểu (`tsc`) nhưng **chưa thực thi**. Các giả định về hình dạng phản hồi (xem bên dưới) cần xác nhận ở lần chạy đầu tiên.
- Mới 179/647 case có code (kể cả các case chỉ chạy được khi có stack test); 468 case còn là `todo`, và 25/75 suite chưa có case nào có code: xem `CODE-COVERAGE.md`.

### Giả định cần xác nhận ở lần chạy API đầu tiên

- Phản hồi tạo trang (`POST /landing-pages`) có `id`, `slug`, `name`, `status`; `GET /landing-pages/:id` có `draftSpec`, `publishedSpec`, `trackingConfig`.
- `GET /landing-pages` và `GET /landing-pages/templates` trả mảng hoặc `{items}`; `GET /leads?search=` trả mảng hoặc `{items|data|leads}`.
- Lỗi xuất bản 409 có `code` ở cấp ngoài hoặc trong `message`.
- Đăng nhập trả `accessToken`.
- Các giá trị bị giới hạn tần suất (8 lần/10 phút/trang/IP, 12 giây/SĐT) dựa trên code ngày 11/11/2026.

### Case cố ý sẽ FAIL khi chạy API cho tới khi sản phẩm được sửa

- `LP07-S06-TC003`: ID theo dõi chứa dấu nháy đơn vẫn được lưu (điểm cần xác nhận LP07-F4). Test mô tả hành vi **an toàn mong đợi**, nên sẽ đỏ nếu lỗ hổng còn tồn tại.

### Case ghi lại hành vi hiện tại (không khẳng định đúng/sai)

- `LP07-S05-TC003`: tên miền punycode (`xn--...`) hiện bị coi là không hợp lệ.
- `LP08-S04-TC009`, `LP08-S04-TC010`, `LP10-S03-TC012`: chấp nhận nhiều mã HTTP, ghi lại giá trị thực tế.

## Thêm hoặc sửa case

Các tệp `suites/*.test.ts` là mã nguồn chính thức, sửa tay trực tiếp. Giữ nguyên mã case; thay `todo(...)` bằng `tc(...)` khi viết xong. Sau khi sửa, chạy lại `tsc` và `run.sh unit`, rồi cập nhật `CODE-COVERAGE.md` (tệp này sinh từ mã quét; hiện chưa có công cụ sinh lại đi kèm trong repo).
