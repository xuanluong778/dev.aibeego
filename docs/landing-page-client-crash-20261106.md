# Builder client exception và CSS preload — 06/11/2026

Nguồn phát hành: canonical `/var/www/marketingaut_usr/data/www/marketingautoaz.com`, HEAD `c670b57`, cộng bản sửa kéo text và điều kiện prefetch menu của Builder. Không build từ worktree text-columns cũ chưa chứa commit `c670b57`.

## Nguyên nhân

Tái hiện bằng các bundle production và bản đọc riêng draft được người dùng chỉ ra (17 block, 11 section element). Toàn bộ request API của trình duyệt QA được intercept, không dùng tài khoản production hoặc ghi draft.

- Lỗi thật: `HierarchyRequestError: Failed to execute 'insertBefore' on 'Node': The new child element contains the parent.` Phát sinh khi portal/slot của section lồng nhau được đưa vào hậu duệ của chính nó.
- Build trước lấy nguồn từ worktree cũ, bỏ sót các guard DOM/ownership/observer đã có trong canonical `c670b57`. Builder source canonical cũng bị chép lùi; đã khôi phục đúng HEAD rồi áp lại riêng giới hạn offset text ngang. Bản sửa kéo text vẫn giữ nguyên.
- CSS `6cfaccbc836e26aa.css` thuộc route `/landing-pages/create`, được menu Next Link prefetch trong lúc đang sửa Builder. Sidebar hiện dùng `prefetch={false}` trong route `/landing-pages/builder/`; các route khác giữ mặc định.

## Kiểm tra

- Production Next build từ canonical đạt. Test section ownership/column/history/persist và HierarchyRequestError guard đạt; menu collapse regression đạt.
- 16/16 ca Chromium kéo text trực tiếp/toolbar, zoom 100%/75%, canvas thường/rộng, căn tâm, thả, Undo/Redo và sanitize/reload đạt.
- Candidate chạy đúng image production mới. Hai lần tải đúng cấu trúc draft bị lỗi: đủ 11/11 attached element, 0 client exception, 0 CSS preload warning; 10 request API được intercept, 0 mutation.
- Script kiểm tra route thật: `scripts/qa-landing-page-client-route-browser.cjs`. Cấu hình `LP_CLIENT_QA_ORIGIN`, `LP_CLIENT_QA_PAGE_FILE`, `LP_CLIENT_QA_OUT`. File draft private chỉ dùng tại máy kiểm tra; không đưa nội dung vào repo.

## Phát hành

- Web: `marketingaz-web:builder-client-crash-20261106`.
- BUILD_ID: `lpb-builder-client-crash-20261106`.
- Chỉ recreate web và reload Nginx theo quyền triển khai đã được người dùng xác nhận. API image giữ `marketingaz-api:text-center-fix-20261106`.
- Đồng bộ 15 file mirror với canonical có backup/hash. Các thay đổi UI đã có ở `c670b57` được giữ đầy đủ.
- Backup, image context, build log, candidate/production browser report và kiểm tra HTTP nằm tại `/var/www/aibeego_com_usr/data/backups/builder-client-crash-20261106/`.
- Rollback web nếu cần: `marketingaz-web:text-center-fix-20261106` và compose backup; không restore DB.

Kiểm tra sau triển khai trên https://aibeego.com đạt: đúng BUILD_ID tại 3 route, 45 JS/CSS HTTP200, API health200, runtime env giữ nguyên. Chromium tải đúng draft qua hai lượt, đủ 11 attached element mỗi lượt, không có exception hoặc cảnh báo preload CSS; 0 mutation.
