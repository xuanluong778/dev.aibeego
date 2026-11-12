# P0 Landing Page Builder — autosave identity (30/10/2026)

Đã sửa trùng requestId/ACK nhầm trong phạm vi autosave. **14/14 regression mới PASS; 10 suite nguồn liên quan PASS; 6 ca E2E browser toàn app + 1 ca API/DB thật PASS. 0 lỗi TypeScript mới so với baseline.** Không sửa mobile, không deploy hoặc gọi production.

## Nguyên nhân được xác nhận

Đã đọc [báo cáo E2E trước](/tmp/lp-full-app-e2e-5ah7i7qs/report.md), hai `result.json` và network events trong cả hai trace:

- [Lượt mất local](/tmp/lp-full-app-e2e-5ah7i7qs/evidence/4-two-tabs-aVcNWb/trace.zip): A/B cùng `lp-as-1`, base1/client25 nhưng text khác; B nhận `rejected:false`, không conflict, local bị xóa dù DB giữ A.
- [Lượt ghi đè server](/tmp/lp-full-app-e2e-5ah7i7qs/evidence/4-two-tabs-8l4OzJ/trace.zip): ACK nhầm nâng base B lên revision của A; B tiếp tục flush và thay server bằng draft B.
- [Đối chiếu trace](/tmp/lp-request-id-fix-qj6bsv79/evidence/previous-trace-review.json). SHA-256 của builder/service/revision trước sửa khớp nguồn trong lượt E2E cũ, [bằng chứng](/tmp/lp-request-id-fix-qj6bsv79/evidence/preserved-and-baseline.json).

Client dùng counter riêng mỗi instance nên mọi tab mới đều bắt đầu `lp-as-1`. Server nhận trùng ID là idempotent trước khi kiểm tra base, không ràng buộc payload. Client tin ACK đó để cập nhật base/xóa local hoặc flush tiếp. Ngoài ra, retry sau khi hết hai attempt tạo thao tác mới thay vì giữ request chưa được xác nhận.

## Thay đổi sản phẩm — 5 file

- [landing-page-autosave-request.ts](/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/web/src/components/landing-pages/landing-page-autosave-request.ts): UUID ngẫu nhiên bằng Web Crypto cho mỗi thao tác; fallback getRandomValues khi randomUUID chưa có; ID dưới giới hạn 64 ký tự.
- [landing-page-builder.tsx](/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/web/src/components/landing-pages/landing-page-builder.tsx:772): giữ ID, revision/base, body đã serialize và snapshot local của request đang chờ. Retry trong vòng lặp hoặc lần gọi persist tiếp theo dùng nguyên body, kể cả khi người dùng sửa tiếp. Chỉ sau ACK đúng ID và revision mới dùng base mới/flush edit tiếp. ACK sai hoặc stale giữ local và đi qua conflict có sẵn. ACK thành công chỉ xóa local có cùng base, revision **và nội dung** với snapshot gửi lên; không xóa bản khác nội dung của tab kia.
- [landing-page-autosave-receipt.ts](/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/api/src/landing-pages/landing-page-autosave-receipt.ts): fingerprint SHA-256 từ payload gửi lên, base/client revision và tên; canonical JSON ổn định theo thứ tự key. Dùng payload gốc để sanitizer tự cấp ID cho dữ liệu cũ không phá exact retry.
- [landing-page-revision.ts](/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/api/src/landing-pages/landing-page-revision.ts:35): ID trùng chỉ idempotent khi fingerprint receipt cũng khớp. Receipt cũ thiếu hash hoặc ID tái sử dụng cho operation khác bị từ chối qua `STALE_REVISION`.
- [landing-pages.service.ts](/var/www/marketingaut_usr/data/www/marketingautoaz.com/apps/api/src/landing-pages/landing-pages.service.ts:835): lưu receipt server trong JSON meta, dưới row lock hiện có. Nhánh no-edit flush so sánh nội dung/tên thật trước ACK; revision bằng nhau không đủ. Không tăng revision cho no-op hợp lệ, không migration DB.

Receipt hash là metadata server; sanitizer chung không tin/copy hash từ client. Cơ chế base revision, row lock, publish revision gate và các action giải quyết conflict được giữ lại. Khi đóng/mở lại mà request cũ chưa được xác nhận, recovery vẫn giữ local và hiển thị conflict nếu server đã thay đổi.

Các callback reorder, visibility guard, live text, Undo/Redo giữ nguyên; callback restore chỉ bổ sung reset request pending khi nhận snapshot server đã xác nhận, phần historyNav trước đó giữ nguyên. [Kiểm chứng phạm vi nguồn](/tmp/lp-request-id-fix-qj6bsv79/evidence/source-scope.json); [hash mã thực sự chạy](/tmp/lp-request-id-fix-qj6bsv79/evidence/executed-source.json). Trong 2.408 file nguồn/cấu hình đã theo dõi từ lượt E2E trước, chỉ builder/service/revision thay đổi, cộng hai file sản phẩm mới nêu trên. Các file recovery và giao diện mobile không đổi.

## Regression FAIL trước / PASS sau

[Test nguồn mới](/var/www/marketingaut_usr/data/www/marketingautoaz.com/scripts/test-landing-page-autosave-identity.cjs) thực thi `persist`, service `autosave` và policy/fingerprint từ nguồn thực; transport/state/transaction là test doubles, không sao chép thuật toán.

- **Trước sửa: 7/10 ca FAIL**, [log nguyên trạng](/tmp/lp-request-id-fix-qj6bsv79/logs/regression-before.log). FAIL gồm ID hai tab, pending request sau hết retry, server ACK nhầm payload/base/name, no-op khác nội dung, ACK sai danh tính/revision và hai persist dùng chung server.
- **Sau sửa: 14/14 PASS**, [log](/tmp/lp-request-id-fix-qj6bsv79/logs/regression-identity-final14.log). Bốn ca bổ sung kiểm tra legacy input thiếu ID phần tử, writer khác chen giữa commit/retry, xóa local theo đúng snapshot và fallback Web Crypto.
- **10 suite nguồn liên quan PASS**: identity, autosave-stuck, draft-recovery, revision, history-live-edit, version-restore-revision, undo-page-isolation, publish-flush, element-visibility-lock, lock-and-advanced-position. [Chỉ mục](/tmp/lp-request-id-fix-qj6bsv79/regression-final-results.json). Entry identity trong chỉ mục là lượt 13 ca trước khi thêm ca writer chen giữa; log 14 ca ở trên là kết quả cuối.
- Fixture browser history-live-edit đã sửa phần dependency/ACK contract và chạy lại **PASS cả ba đường**. [Log](/tmp/lp-request-id-fix-qj6bsv79/logs/history-browser-supplement-final.log), artifact `/tmp/lp-reorder-browser-QtbiiO`. Kết quả fixture này được giữ tách khỏi E2E app bên dưới.

## E2E toàn app sau sửa

Môi trường: snapshot nguồn đầy đủ tại `/tmp/lp-request-id-fix-qj6bsv79/repo`; Next **15.5.21 dev**, Nest AppModule thật (490 TS files được transpile với decorator metadata), Prisma, PostgreSQL **16**, Redis **7**, Playwright **1.63.0** / Chromium **153.0.8010.12**, desktop 1440×1000. Các ca UI dùng Builder thật và API thật; không dùng fixture React thay thế.

Origin `http://127.0.0.1:18181` proxy tới năm container riêng trên mạng Docker **internal** `lp-e2e-id-qj6b-net`; DB `lp_e2e` mới trên tmpfs, một OWNER/organization/subscription test. Không copy `.env*`; bootstrap xóa env kế thừa và dùng secret test sinh riêng. Browser chặn outbound ngoài origin; Google Fonts bị chặn và dùng fallback. [Runtime](/tmp/lp-request-id-fix-qj6bsv79/evidence/runtime.json), [network](/tmp/lp-request-id-fix-qj6bsv79/evidence/network.txt).

Network barrier chỉ giữ/release request để tạo thứ tự hoặc concurrency. Ca mất response gọi `route.fetch()` tới backend thật, đợi DB commit rồi abort việc giao response; retry sau đó vẫn tới backend thật. Không giả lập response thành công/rejection. Mỗi ca đọc cả GET API và SELECT trực tiếp DB test; assert text, revision, local body/base/revision và trạng thái sau mở lại, không chỉ toast.

| Ca | Loại | Kết quả và dữ liệu xác nhận | Bằng chứng |
| --- | --- | --- | --- |
| `same-revision-tabs` | UI E2E | **PASS** — Cùng base1/client3, ID khác; DB giữ winner rev3, loser local base1/rev3; winner Save no-op không xóa loser; reopen vẫn conflict. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/same-revision-tabs-nIBVHX/trace.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/same-revision-tabs-nIBVHX/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/same-revision-tabs-nIBVHX/loser-conflict.png) |
| `concurrent-tabs` | UI E2E | **PASS** — Release hai request cùng lúc; row lock nhận đúng một writer, một stale; DB rev3; loser local base1/rev3 và reopen giữ nguyên. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/concurrent-tabs-krHexP/trace.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/concurrent-tabs-krHexP/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/concurrent-tabs-krHexP/loser-conflict.png) |
| `separate-sessions` | UI E2E | **PASS** — Hai BrowserContext đăng nhập thật riêng; không chung ID, không ACK nhầm; DB/local/conflict/reopen đúng. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/separate-sessions-JFJDpP/trace.zip) · [trace 2](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/separate-sessions-JFJDpP/trace-context-1.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/separate-sessions-JFJDpP/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/separate-sessions-JFJDpP/loser-conflict.png) |
| `lost-response-retry` | UI E2E | **PASS** — Commit rồi mất response; hai attempt cùng ID/body; local giữ trước ACK và xóa sau ACK; reopen không restore nhầm, operation tiếp theo ID mới. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-retry-M2fFJG/trace.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-retry-M2fFJG/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-retry-M2fFJG/final-0-0.png) |
| `exhausted-response-retry` | UI E2E | **PASS** — Cả hai response bị mất; sửa tiếp rồi Save vẫn retry request cũ đúng body; ACK xong mới flush edit mới; reopen và operation tiếp theo đúng, DB cuối rev7. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/exhausted-response-retry-QUD8IX/trace.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/exhausted-response-retry-QUD8IX/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/exhausted-response-retry-QUD8IX/final-0-0.png) |
| `lost-response-other-writer` | UI E2E | **PASS** — A commit mất ACK, B reload/lưu rev5; retry A bị stale, không rebase/ghi đè; local A base1/rev3 vẫn giữ khi server5 và sau reopen. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-other-writer-7xkNVi/trace.zip) · [trace 2](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-other-writer-7xkNVi/trace-context-1.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-other-writer-7xkNVi/result.json) · [ảnh](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/lost-response-other-writer-7xkNVi/old-retry-conflict.png) |
| `legacy-id-collision-api` | API/DB thật | **PASS** — ID cũ lp-as-1 khác payload bị từ chối; exact retry không tăng revision; request ID mới nhưng cùng revision/khác nội dung cũng không được ACK; DB rev2 đúng A. | [trace 1](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/legacy-id-collision-api-BBcWWm/trace.zip) · [console/network/assertions](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/legacy-id-collision-api-BBcWWm/result.json) |

[Chỉ mục E2E cuối](/tmp/lp-request-id-fix-qj6bsv79/e2e-final-results.json), [snapshot DB 7 page cuối](/tmp/lp-request-id-fix-qj6bsv79/evidence/final-db-snapshot.csv), [revision/local tổng hợp](/tmp/lp-request-id-fix-qj6bsv79/evidence/final-assertion-summary.json). Không có pageerror JS ở các ca cuối. Các lỗi network do drop response và chặn font là fault/environment đã chủ động tạo.

Một lượt sau cập nhật snapshot có static resource 502/reset upstream trước khi Builder load, [artifact](/tmp/lp-request-id-fix-qj6bsv79/evidence/e2e/same-revision-tabs-DP97Tf/result.json). Lượt này chưa vào test steps, được phân loại lỗi môi trường và giữ nguyên raw FAIL; chạy lại cùng assertion đã PASS, không tăng timeout để lấy PASS. Hai lỗi harness lúc đầu (login thực trả 201 và page mới chưa có meta revision) được sửa theo contract API. Recovery test harness được bổ sung pending ref; toàn bộ assertion giữ nguyên. Không còn ca BLOCKED trong kết quả E2E cuối.

## TypeScript và giới hạn

- Web toàn project: **110 lỗi trước → 110 sau, 0 mới**, so theo file/code/message và số lượng, bỏ qua dịch dòng. Trong đó Builder 4 và canvas-ux 12 là lỗi cũ đã biết; 110 là phạm vi rộng hơn con số 16 của audit trước, không phải 94 lỗi mới.
- Service/revision/receipt API liên quan: **0 trước → 0 sau, 0 mới** (receipt là file mới, sau check cùng hai file cũ). [Diff diagnostic cuối](/tmp/lp-request-id-fix-qj6bsv79/typescript-comparison-final.json), [baseline web](/tmp/lp-request-id-fix-qj6bsv79/before-web-typescript.json), [sau web](/tmp/lp-request-id-fix-qj6bsv79/after-web-typescript.json), [API cuối](/tmp/lp-request-id-fix-qj6bsv79/after-api-typescript.json).
- Type-check toàn API lần đầu vượt heap 1300 MB, **BLOCKED do tài nguyên**, [log](/tmp/lp-request-id-fix-qj6bsv79/logs/typescript-before.log). Đã hoàn tất semantic/syntax check các file API liên quan với heap 1700 MB; không tuyên bố toàn API type-check PASS. Runtime E2E dùng full API transpilation, không dùng kết quả transpile để coi type-check sạch.
- Không chạy lại toàn bộ 99 suite legacy/catalog; các matcher lỗi thời và lỗi similarity từ audit trước chưa được xử lý trong lượt P0 này.
- Hai lỗi mobile (notch che chữ/toolbar che resize) trong báo cáo trước vẫn mở, không sửa và không kết luận lại smoke mobile.

## File test/harness thay đổi

Mới: `scripts/test-landing-page-autosave-identity.cjs`, `scripts/test-landing-page-autosave-identity-e2e.cjs`, báo cáo này.

Cập nhật theo dependency/ACK contract mới, không bỏ assertion: `scripts/helpers/landing-page-source-harness.cjs`, `scripts/test-landing-page-autosave-stuck.cjs`, `scripts/test-landing-page-draft-recovery.ts`, `scripts/test-landing-page-publish-flush.cjs`, `scripts/test-landing-page-revision.ts`, `scripts/test-landing-page-history-live-edit-browser.cjs`. `scripts/run-landing-page-local-tests.cjs` nhận diện identity là behavioral và luôn đánh dấu full-app E2E BLOCKED trong local runner chặn mạng/DB.

## Chạy lại

```sh
node scripts/test-landing-page-autosave-identity.cjs
LP_E2E_CONFIG=/path/to/isolated-test-config.json node scripts/test-landing-page-autosave-identity-e2e.cjs
```

E2E config cần `origin` HTTP loopback, `prefix` dạng `lp-e2e-*`, `network=<prefix>-net` Docker internal, `postgresContainer=<prefix>-pg`, `seedFile` chứa credential test `<prefix>@example.invalid`, `artifactDir`. DB/user cố định `lp_e2e`, schema thật, app/API trỏ đúng DB đó; seed org/OWNER/subscription test. Script không đọc `.env`, không có origin mặc định. Thiếu config trả exit2/BLOCKED trước khi gọi app. [Kiểm tra default an toàn](/tmp/lp-request-id-fix-qj6bsv79/logs/default-e2e-blocked.log). Config/credential thực của lượt chạy được giữ private trong thư mục artifact, không commit.

Stack vừa chạy đã được dọn: năm container test, network, proxy loopback và DB tmpfs đều xóa, [cleanup](/tmp/lp-request-id-fix-qj6bsv79/evidence/cleanup.json). Artifact/trace/log giữ lại tại `/tmp/lp-request-id-fix-qj6bsv79`. Không restart, ghi DB hoặc deploy production.
