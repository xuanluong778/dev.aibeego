# LP03: Builder: chỉnh sửa nội dung và phần tử - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP03-builder-chinh-sua-phan-tu.md](../flows/LP03-builder-chinh-sua-phan-tu.md). Mức ưu tiên flow: P1. Route giao diện: `/landing-pages/builder/[id]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** chọn, kéo thả, thay đổi kích thước, nhóm, sửa chữ, ảnh, ẩn/khóa element trong builder. Cấu trúc section/hàng/cột ở LP04, lưu ở LP05.

**Căn cứ code:** `apps/web/src/components/landing-pages/landing-page-builder.tsx` (thông báo `setSaveMsg`), `apps/api/src/common/uploads/upload-policy.ts`, `LandingPagesService.uploadPublicImage`/`listMedia`, và các script QA trong `scripts/` chạy trên bản dựng web với API chặn. Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

**Case liên quan ở flow khác:** LP05 (lưu sau khi sửa); LP04 (cấu trúc section); LP06 (form lead); LP12 (hiển thị đa khung); F03 cho LP03-S05-TC008, TC009.

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP03-F1 | Builder là một tệp rất lớn (khoảng 8.000 dòng). Các script QA chạy trên bản dựng web với API được chặn (`API_INTERNAL_URL=http://127.0.0.1:1`) và trang giả (fixture), không chạy trên dữ liệu thật. | `apps/web/src/components/landing-pages/landing-page-builder.tsx`; đầu các script `qa-landing-page-*-browser.cjs` | Cần chạy thêm một lượt tay trên môi trường thật cho các case P0 của suite này. | LP03-S01-TC001 |
| LP03-F2 | Thông báo "Section đang khóa — mở khóa trước khi chỉnh sửa" và "Section đang khóa — mở khóa trước khi xóa" cho thấy khóa áp dụng ở **cấp section**; thông báo "Đã xóa (bỏ qua section đang khóa)" cho thấy xóa nhiều mục sẽ bỏ qua mục khóa. | `apps/web/src/components/landing-pages/landing-page-builder.tsx` các lệnh `setSaveMsg` liên quan khóa | Cần xác nhận quy tắc khóa element so với khóa section. | LP03-S06-TC003, LP03-S06-TC004 |
| LP03-F3 | Ảnh tải lên bị giới hạn theo loại: ảnh `.jpg .jpeg .png .gif .webp` tối đa 10 MB; ảnh nền cho phép thêm `.mp4 .webm`, tối đa 25 MB. Nội dung thông báo lỗi khi vi phạm nằm trong tầng `upload-policy` (chưa đọc nguyên văn). | `apps/api/src/common/uploads/upload-policy.ts` (bảng phần mở rộng và dung lượng); controller `upload-image`, `upload-background` | Cần xác nhận thông báo và mã lỗi cho từng trường hợp vi phạm. | LP03-S05-TC003, LP03-S05-TC004 |
| LP03-F4 | Flow gốc ghi "kéo phần tử Lead Form: không còn toolbar thừa trên đầu" là case thủ công. Chưa có script riêng cho lỗi này. | Flow `LP03-builder-chinh-sua-phan-tu.md` bước 9 | Cần giữ video lỗi cũ làm tham chiếu khi chạy case này. | LP03-S07-TC001 |

## Quy ước chung

- **Mã case:** `LPxx-Syy-TCzzz` (flow, suite, case). Mã ổn định, không đánh số lại khi thêm case mới ở cuối suite.
- **Ưu tiên:** P0 = đường chính hoặc mất dữ liệu hoặc rò rỉ giữa tổ chức, phải đạt trước khi phát hành. P1 = tính năng quan trọng. P2 = biên hoặc trải nghiệm.
- **Tự động hóa:** `Đã có` (script có kiểm đúng điều kiện của case), `Một phần` (ghi rõ script kiểm gì và thiếu gì), `Chưa có`. Nội dung cột này dựa trên tiêu đề và các câu kiểm trong script, đã đọc tiêu đề và các thông điệp assert, chưa chạy script.
- **Thực thi:** tất cả case đang ở trạng thái **Chưa chạy**. Khi chạy, ghi kết quả vào bản sao của bảng hoặc vào tài liệu báo cáo riêng, không sửa tài liệu này.
- **Tài khoản dùng chung:** `ORG-A-OWNER` (chủ tổ chức A, đủ `lead.read` và `lead.write`), `ORG-A-VIEWER` (cùng tổ chức A, chỉ có `lead.read`), `ORG-B-OWNER` (tổ chức B, dùng kiểm tra tách dữ liệu), `SUPER_ADMIN` (quản trị nền tảng). Không dùng dữ liệu khách thật.
- **API:** `{API}` là tiền tố API của môi trường test (đường dẫn trong code là `/api/v1/landing-pages/...`). Gọi có `Authorization: Bearer <token>` trừ các route `public`.
- **Trang test dùng chung (smoke):** `PAGE-SMOKE` do case SMOKE-1 tạo, các case SMOKE-2 đến SMOKE-5 và các flow khác tái sử dụng. Xem `LP-README.md`.

## Danh sách suite

| Suite | Tên | Số case |
|---|---|---|
| LP03-S01 | Chọn element, thanh công cụ và menu chuột phải | 9 |
| LP03-S02 | Kéo thả, thay đổi kích thước và xoay | 9 |
| LP03-S03 | Chọn nhóm và di chuyển nhóm | 9 |
| LP03-S04 | Sửa văn bản và định dạng | 8 |
| LP03-S05 | Ảnh, icon, thư viện media và tải lên | 9 |
| LP03-S06 | Ẩn, khóa và chống chồng lấn | 7 |
| LP03-S07 | Khối Lead Form, gom lỗi cũ và chuyển thiết bị | 6 |
| | **Tổng** | **57** |

## LP03-S01. Chọn element, thanh công cụ và menu chuột phải

**Mục tiêu:** Chọn element hiển thị đúng thanh công cụ và menu, không kẹt trạng thái.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S01-TC001 | **[SMOKE-2]** Chỉnh tiêu đề trang smoke | P0 | Trang `PAGE-SMOKE` (SMOKE-1) mở trong builder bằng ORG-A-OWNER. Cần có khối Hero với tiêu đề và một khối LeadForm (thêm từ thư viện nếu trang trống). | 1. Nếu trang trống, thêm khối Hero và khối Lead Form từ thanh Thêm thành phần.<br>2. Nhấp vào tiêu đề Hero, nhập đè thành `SMOKE-HEADLINE-20261111`.<br>3. Nhấp ra ngoài để bỏ chọn.<br>4. Chờ thông báo "Đã lưu". | Tiêu đề hiển thị `SMOKE-HEADLINE-20261111` ngay trên canvas, hiện "Đã lưu <giờ>" sau khoảng 1,2 giây. Trang có khối form để dùng cho SMOKE-5. Không có lỗi trên console. | Một phần: `scripts/test-landing-page-text-toolbar.cjs` kiểm: cổng kiểm tra thanh công cụ chữ ngang (không assert, kiểm mã nguồn). Thiếu: thao tác sửa chữ và lưu trên trình duyệt thật | Chưa chạy |
| LP03-S01-TC002 | Chọn một element hiện thanh công cụ ở góc trên phải | P0 | Trang nháp có khối Hero. Cửa sổ 1542x900. | 1. Nhấp vào một element.<br>2. Quan sát vị trí thanh công cụ dọc. | Thanh công cụ gắn góc trên phải của element được chọn, đúng element (không phải element khác). | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: chọn/di chuột/thao tác tách biệt, thanh ở góc trên phải, đường đi từ element tới thanh, bỏ chọn thì mất thanh | Chưa chạy |
| LP03-S01-TC003 | Di chuột sang thanh công cụ không làm mất thanh | P1 | Như trên. | 1. Di chuột vào element, rồi sang thanh công cụ.<br>2. Di chuột ra ngoài canvas và thanh. | Khi đi từ element sang thanh: thanh vẫn hiện. Khi rời cả canvas và thanh: thanh hover biến mất. | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: "pointer from element to toolbar: toolbar persists"; "pointer leaves canvas+toolbar: hover toolbar disappears" | Chưa chạy |
| LP03-S01-TC004 | Di chuột sang element khác khi đang chọn | P1 | Đang chọn element A. | 1. Di chuột qua element B. | Thanh công cụ vẫn ở element A (đang chọn), không nhảy sang B. | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: "hover other element while selected: toolbar stays on selection" | Chưa chạy |
| LP03-S01-TC005 | Cuộn trang khi có thanh công cụ | P1 | Đang chọn một element. | 1. Cuộn để element ra khỏi vùng nhìn một phần, rồi hoàn toàn, rồi cuộn lại. | Một phần: thanh bám theo element. Hoàn toàn ra ngoài: thanh ẩn. Cuộn lại: thanh trở về đúng chỗ. | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: thanh bám theo element khi cuộn một phần, ẩn khi element ra hẳn khỏi canvas, trở lại đúng chỗ khi cuộn về | Chưa chạy |
| LP03-S01-TC006 | Menu chuột phải | P1 | Trang có nhiều element. | 1. Nhấp chuột phải vào element chưa chọn.<br>2. Nhấp chuột phải vào vùng canvas trống. | Chuột phải vào element đổi mục tiêu sang element đó. Canvas trống (khi clipboard trống) không hiện lệnh nào ngoài lệnh dán tương thích. Menu không vượt khỏi khung nhìn (bị kẹp trong viewport) và đóng khi bấm ra ngoài. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Right click outside selection changes target"; "Blank canvas with empty clipboard has no commands"; "Main menu clamped to viewport"; "Outside click closes menu" | Chưa chạy |
| LP03-S01-TC007 | Thanh công cụ không lệch sau Undo/Redo hoặc đóng Inspector | P1 | Đang chọn element. | 1. Nhấn Undo rồi Redo.<br>2. Đóng bảng Inspector. | Thanh công cụ bám đúng DOM sống; sau khi đóng Inspector thanh được gắn lại trong canvas. Bỏ chọn thì không còn thanh cũ. | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: "after undo/redo remounts: toolbar glued to live DOM"; "inspector closed: toolbar re-glued inside canvas"; "after deselect: no stale toolbar" | Chưa chạy |
| LP03-S01-TC008 | Nhân bản, xóa một element | P1 | Chọn một element (ảnh hoặc nút). | 1. Bấm Nhân bản.<br>2. Bấm Xóa trên bản sao. | Nhân bản thêm đúng một element ("duplicate adds exactly one target"), bản sao độc lập (sửa không đổi gốc). Xóa chỉ bỏ element mục tiêu. Thông báo "Đã nhân bản" và "Đã xóa phần tử". | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: nhân bản đúng một mục, bản sao ảnh độc lập, xóa chỉ mục tiêu | Chưa chạy |
| LP03-S01-TC009 | Sao chép và dán | P2 | Chọn nhiều element rồi sao chép. | 1. Sao chép vùng chọn.<br>2. Dán vào canvas. | Hiện "Đã sao chép vùng chọn". Dán tạo bản sao đúng số lượng, "Đã tạo bản sao vùng chọn". | Chưa có | Chưa chạy |

## LP03-S02. Kéo thả, thay đổi kích thước và xoay

**Mục tiêu:** Thao tác chuột chính xác, không kẹt con trỏ, giữ lại sau tải lại.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S02-TC001 | Kéo element theo con trỏ trong không gian trống | P0 | Trang có element ở chế độ vị trí tự do. | 1. Nhấn giữ và kéo element chậm qua vùng trống.<br>2. Thả chuột.<br>3. Chờ lưu và reload. | Element đi theo con trỏ chính xác (độ lệch nhỏ). Sau reload vị trí giữ nguyên. Payload autosave có vị trí mới. | Đã có: `scripts/qa-landing-page-pointer-resize-browser.cjs` kiểm: kéo theo con trỏ, lặp lại sau lưu/tải lại, bản autosave bị chặn API ghi nhận (khoảng 28 dòng kiểm) | Chưa chạy |
| LP03-S02-TC002 | Resize bằng tay nắm cạnh phải | P0 | Element có tay nắm đổi kích thước. | 1. Kéo tay nắm cạnh phải sang phải rồi sang trái. | Chiều rộng thay đổi theo con trỏ, không nhảy ngược ("Width does not jump backwards"). Giá trị được lưu. | Đã có: `scripts/qa-landing-page-pointer-resize-browser.cjs` kiểm: "East resize handle"; "Width does not jump backwards" | Chưa chạy |
| LP03-S02-TC003 | Resize dừng trước element kề bên | P1 | Hai element cạnh nhau. | 1. Kéo rộng element thứ nhất về phía element thứ hai. | Thay đổi kích thước dừng trước khi chạm element văn bản bên cạnh ("Resizing stops before adjacent text"), không chồng lấn. | Đã có: `scripts/qa-landing-page-pointer-resize-browser.cjs` kiểm: "Resizing stops before adjacent text" | Chưa chạy |
| LP03-S02-TC004 | Nhấn Escape để hủy thao tác | P1 | Đang kéo hoặc resize. | 1. Bắt đầu kéo, nhấn Escape khi chưa thả. | Element về vị trí cũ, không để lại thuộc tính hình học tạm thời, không có chỉ báo thả. | Đã có: `scripts/qa-landing-page-pointer-resize-browser.cjs` kiểm: Escape hủy, không để lại hình học tạm; qa-landing-page-canvas-groups-browser.cjs "Escape cancels a live group drag" | Chưa chạy |
| LP03-S02-TC005 | Thả chuột ngoài cửa sổ trình duyệt | P0 | Đang kéo element. | 1. Kéo element ra khỏi cửa sổ trình duyệt rồi nhả chuột ngoài cửa sổ.<br>2. Đưa chuột trở lại canvas. | Thao tác kết thúc sạch (xử lý mất `pointerup`), chuột không bị "dính" kéo tiếp, không cần nhấp để thoát. | Chưa có | Chưa chạy |
| LP03-S02-TC006 | Kéo ra ngoài khung canvas | P1 | Element tự do. | 1. Kéo element vượt mép trái, mép phải và mép dưới canvas. | Element bị kẹp trong canvas hoặc cho phép theo thiết kế, không biến mất khỏi vùng nhìn, không tạo cuộn ngang ở trang công khai. | Chưa có | Chưa chạy |
| LP03-S02-TC007 | Resize sau khi xoay | P2 | Element đã xoay 30 độ. | 1. Kéo tay nắm resize. | Kích thước thay đổi theo đúng hướng của element đã xoay, không méo. | Chưa có | Chưa chạy |
| LP03-S02-TC008 | Kéo element không chồng lên element khác | P1 | Hai element văn bản, một hộp gốc. | 1. Kéo đoạn văn từ ngoài vào hộp có sẵn, theo dõi từng khung hình. | Không bao giờ chồng lấn trong lúc kéo hoặc sau khi thả (cảnh báo hoặc ngăn). | Đã có: `scripts/qa-landing-page-no-overlap-browser.cjs` kiểm: kéo đoạn văn tới hộp, đo từng khung hình, bản nháp đã lưu chỉ đọc (khoảng 15 dòng kiểm) | Chưa chạy |
| LP03-S02-TC009 | Cấu trúc kéo thả giữ khi tải lại | P1 | Sau một chuỗi kéo/resize. | 1. Reload trang.<br>2. So vị trí và kích thước. | Giống trước khi reload. Autosave đã lưu đủ. | Một phần: `scripts/qa-landing-page-pointer-resize-browser.cjs` kiểm: tải lại giữa các lần thao tác (mô phỏng lưu bằng API chặn). Thiếu: lưu thật lên server | Chưa chạy |

## LP03-S03. Chọn nhóm và di chuyển nhóm

**Mục tiêu:** Nhóm element hoạt động như một khối, không kẹt khung chọn.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S03-TC001 | Chọn nhiều và tạo nhóm | P1 | Trang có 3 element văn bản/nút. | 1. Chọn ba element (kéo khung chọn hoặc Shift).<br>2. Bấm Nhóm. | Hiện "Đã nhóm phần tử". Chỉ ba thành viên văn bản/nút được nhóm; đoạn ẩn và nút khóa bị loại. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Exactly three text/button members selected"; "Hidden paragraph excluded"; "Locked button is excluded"; "Group actually moved" (khoảng 79 dòng kiểm) | Chưa chạy |
| LP03-S03-TC002 | Di chuyển nhóm giữ khoảng cách tương đối | P0 | Đã có nhóm. | 1. Kéo nhóm sang vị trí mới.<br>2. Đo khoảng cách ngang và dọc giữa các thành viên trước và sau. | Khoảng cách tương đối giữ nguyên. Phần tử ngoài nhóm không đổi chỗ ("Outside element stays put"). | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Relative horizontal offset", "Relative vertical offset", "Outside element stays put" | Chưa chạy |
| LP03-S03-TC003 | Nhóm hỗn hợp có ảnh | P1 | Nhóm gồm chữ, nút và ảnh. | 1. Di chuyển nhóm.<br>2. Nhân bản nhóm.<br>3. Mở thuộc tính. | Ảnh di chuyển cùng. Nhân bản giữ khung chung. Thuộc tính chỉ cho chữ bị ẩn khi chọn hỗn hợp có ảnh. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Mixed image group really moves", "Mixed duplicate retains shared frame", "Image mixed selection hides text-only controls" | Chưa chạy |
| LP03-S03-TC004 | Lưu và tải lại nhóm | P0 | Nhóm đã di chuyển. | 1. Chờ lưu, reload.<br>2. Kéo nhóm lần nữa. | Vị trí nhóm giữ nguyên. Nhóm vẫn kéo được cùng nhau ("Reloaded group can still drag together"). | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Reload retains group position"; "Reloaded group can still drag together" | Chưa chạy |
| LP03-S03-TC005 | Undo một bước cho mỗi thao tác nhóm | P1 | Đã tạo nhóm, di chuyển nhóm, xóa nhóm. | 1. Nhấn Undo ba lần lần lượt. | Mỗi lần Undo hoàn tác đúng một thao tác: khôi phục nhóm đã xóa, khôi phục vị trí, gỡ nhóm vừa tạo. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "One undo restores whole deleted group"; "One undo restores group move"; "One undo removes group creation" | Chưa chạy |
| LP03-S03-TC006 | Chuột không bị dính sau khi thả nhóm | P0 | Đang kéo nhóm. | 1. Thả chuột trong và ngoài canvas.<br>2. Di chuột sau đó. | Khung chọn không còn bám theo chuột, không có thao tác tiếp theo ngoài ý muốn. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: kéo nhóm và thả; khung chọn không kẹt | Chưa chạy |
| LP03-S03-TC007 | Nhóm có phần tử khóa | P1 | Nhóm có một thành viên đã khóa. | 1. Thử xóa nhóm. | Nhóm khóa không xóa được ("Locked group cannot delete"). | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Locked group cannot delete" | Chưa chạy |
| LP03-S03-TC008 | Nhân bản nhóm lưu đúng | P1 | Nhóm ba thành viên. | 1. Nhân bản, chờ lưu, reload. | Chỉ nhân bản đúng ba thành viên, bản sao lưu được ("Duplicate group saved"). | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Only three group members duplicated"; "Duplicate group saved" | Chưa chạy |
| LP03-S03-TC009 | Menu nhóm vừa khung nhìn | P2 | Chọn nhiều element. | 1. Mở menu chuột phải khi chọn nhiều.<br>2. Mở menu con. | Menu không cần cuộn trên desktop. Menu con tự chọn hướng mở có chỗ. | Đã có: `scripts/qa-landing-page-canvas-groups-browser.cjs` kiểm: "Multiple menu fits without scrolling"; "Submenu chooses available direction" | Chưa chạy |

## LP03-S04. Sửa văn bản và định dạng

**Mục tiêu:** Gõ chữ và định dạng không mất ký tự, không kẹt con trỏ.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S04-TC001 | Gõ có dấu cách đầu cuối | P0 | Đang sửa một đoạn văn. | 1. Gõ `Hello `, tiếp tục `World`.<br>2. Gõ khoảng trắng ở giữa và cuối rồi dừng. | Khi đang gõ giữ nguyên khoảng trắng giữa và cuối. Khi lưu (persist) chỉ cắt khoảng trắng ở **hai đầu** chuỗi. Kết quả `Hello World`. | Đã có: `scripts/test-landing-page-space-input.cjs` kiểm: gõ trực tiếp giữ khoảng trắng, lưu cắt hai đầu (khoảng 20 dòng kiểm) | Chưa chạy |
| LP03-S04-TC002 | Phím Space khi đang sửa chữ không bị chặn | P0 | Đang ở chế độ sửa chữ trên canvas. | 1. Nhấn Space nhiều lần.<br>2. Quan sát cuộn trang. | Dấu cách được chèn, trang không cuộn, không bị coi là phím kéo. | Đã có: `scripts/test-landing-page-space-input.cjs` kiểm: bảo toàn dấu cách khi gõ | Chưa chạy |
| LP03-S04-TC003 | Thanh công cụ chữ nhanh | P1 | Chọn một đoạn chữ. | 1. Bấm đậm, nghiêng, căn giữa, đổi cỡ chữ, đổi màu. | Định dạng áp đúng cho đoạn chọn, không đổi đoạn khác. Thanh công cụ không tràn khung (cho phép xuống dòng). | Một phần: `scripts/test-landing-page-text-toolbar.cjs` kiểm: mã nguồn thanh công cụ ngang và xuống dòng khi hẹp. Thiếu: áp định dạng thực tế | Chưa chạy |
| LP03-S04-TC004 | Hộp chữ và định dạng giữ sau lưu | P1 | Đoạn chữ có định dạng riêng. | 1. Chờ lưu, reload. | Định dạng (kể cả `inlineTextStyles`) giữ nguyên. | Một phần: `scripts/test-landing-page-history-live-edit.cjs` kiểm: chuyển tiếp văn bản đang gõ, sắp xếp lại, lịch sử, lưu và tải. Thiếu: định dạng cụ thể | Chưa chạy |
| LP03-S04-TC005 | Không vòng lặp con trỏ khi gõ | P1 | Đang gõ trong ô chữ. | 1. Gõ liên tục 20 ký tự. | Con trỏ không nhảy về đầu hay cuối, không đổi focus. | Đã có: `scripts/test-landing-page-autosave-stuck.cjs` kiểm: "INLINE_EDIT_NO_VALUE_CARET_LOOP" | Chưa chạy |
| LP03-S04-TC006 | Undo/Redo khi đang sửa chữ | P1 | Đã gõ vài câu. | 1. Nhấn Undo, Redo.<br>2. Gõ tiếp. | Hoàn tác đúng theo từng bước hợp lý, không mất đoạn đang gõ dở. | Đã có: `scripts/test-landing-page-history-live-edit.cjs` kiểm: chữ đang chờ, đảo thứ tự, lịch sử, lưu và tải (khoảng 53 dòng kiểm) | Chưa chạy |
| LP03-S04-TC007 | Dán văn bản có định dạng | P2 | Văn bản copy từ Word hoặc web. | 1. Dán vào ô chữ. | Dán dưới dạng văn bản thuần hoặc sạch, không mang thẻ lạ hoặc kiểu ngoài ý muốn. Ghi lại hành vi thực tế. | Chưa có | Chưa chạy |
| LP03-S04-TC008 | Chữ rất dài | P2 | Một đoạn 5.000 ký tự không có dấu cách. | 1. Dán vào tiêu đề.<br>2. Xem canvas và trang công khai. | Không vỡ bố cục canvas; trang công khai không tràn ngang (xem LP12). | Chưa có | Chưa chạy |

## LP03-S05. Ảnh, icon, thư viện media và tải lên

**Mục tiêu:** Thay ảnh và tải ảnh đúng quy định, lưu được, hiển thị công khai.

**Căn cứ:** `apps/api/src/common/uploads/upload-policy.ts`, `LandingPagesService.uploadPublicImage`, `uploadPublicBackground`, `listMedia`. Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S05-TC001 | Thay ảnh từ thư viện | P1 | Trang có khối ảnh. Thư viện có sẵn ảnh. | 1. Chọn ảnh, mở Quản lý Media, chọn ảnh khác.<br>2. Chờ lưu và reload. | Ảnh mới hiển thị và giữ sau reload. Thông báo kiểu "Đã chèn ảnh vào block" hoặc "Đã thay ảnh nền section". | Một phần: `scripts/test-landing-page-media-modal.cjs` kiểm: cổng kiểm tra mô-đun Quản lý Media (không assert, kiểm mã nguồn). Thiếu: chọn ảnh thật và lưu | Chưa chạy |
| LP03-S05-TC002 | Tải ảnh lên hợp lệ | P0 | Token ORG-A-OWNER. Tệp `anh-test.png` 200 KB. | 1. `POST {API}/landing-pages/<id>/upload-image` (multipart, trường `file`).<br>2. Mở URL ảnh trả về trong cửa sổ ẩn danh. | Thành công, trả URL công khai. Ảnh tải được không cần đăng nhập (lưu dưới `uploads/public`). Ảnh xuất hiện trong `GET /landing-pages/<id>/media`. | Chưa có | Chưa chạy |
| LP03-S05-TC003 | Định dạng không cho phép | P1 | Tệp `x.exe`, `x.svg`, `x.html`, `x.pdf`. | 1. Tải từng tệp lên bằng `upload-image`. | Bị từ chối (chỉ nhận `.jpg .jpeg .png .gif .webp`). Ghi lại mã lỗi và thông báo thực tế. | Chưa có | Chưa chạy |
| LP03-S05-TC004 | Ảnh quá lớn | P1 | Ảnh 10 MB và 10,1 MB. | 1. Tải lên bằng `upload-image`. | 10 MB: thành công. Trên 10 MB: bị từ chối. Ghi lại mã lỗi (413/400) và thông báo. | Chưa có | Chưa chạy |
| LP03-S05-TC005 | Ảnh nền cho phép video | P2 | Tệp `bg.mp4` 20 MB và `bg.webm` 26 MB. | 1. Tải lên bằng `upload-background`. | `.mp4` 20 MB: thành công. `.webm` 26 MB: bị từ chối (giới hạn 25 MB). | Chưa có | Chưa chạy |
| LP03-S05-TC006 | Tên tệp nguy hiểm | P0 | Tệp tên `../../x.png`, `a;b.png`, `<script>.png`. | 1. Tải lên. | Tên được làm sạch, tệp không ghi ra ngoài thư mục upload. Không có đường dẫn `..` trong URL trả về. | Chưa có | Chưa chạy |
| LP03-S05-TC007 | Phần mở rộng giả (nội dung không phải ảnh) | P1 | Tệp văn bản đổi tên thành `x.png`. | 1. Tải lên. | Bị từ chối nếu hệ thống kiểm nội dung, hoặc lưu nhưng không thực thi được. Ghi lại hành vi. | Chưa có | Chưa chạy |
| LP03-S05-TC008 | Ảnh của tổ chức khác không lộ trong thư viện | P0 | Ảnh của ORG-B. Token ORG-A-OWNER. | 1. `GET /landing-pages/<id của trang ORG-A>/media`.<br>2. Tìm ảnh của ORG-B. | Không thấy ảnh của tổ chức khác. Lọc `scope` và `q` hoạt động. Xem F03. | Chưa có | Chưa chạy |
| LP03-S05-TC009 | Tải ảnh lên trang của tổ chức khác | P0 | Token ORG-B-OWNER, trang của ORG-A. | 1. `POST /landing-pages/<id ORG-A>/upload-image`. | 404 "Landing page không tồn tại". Không ghi tệp nào. | Chưa có | Chưa chạy |

## LP03-S06. Ẩn, khóa và chống chồng lấn

**Mục tiêu:** Trạng thái ẩn/khóa giữ qua tải lại và có hiệu lực đúng.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S06-TC001 | Ẩn element và giữ sau reload | P1 | Trang có element. | 1. Ẩn một element (biểu tượng mắt).<br>2. Chờ lưu, reload. | Element vẫn ẩn trong builder (hiện mờ hoặc có chỉ báo) và không hiển thị ở trang công khai sau khi xuất bản. | Đã có: `scripts/test-landing-page-element-visibility-lock.cjs` kiểm: ẩn/khóa giữ qua tải lại, hành động bị chặn giữ nhánh Redo (khoảng 32 dòng kiểm) | Chưa chạy |
| LP03-S06-TC002 | Khóa element và giữ sau reload | P1 | Trang có element. | 1. Khóa element.<br>2. Thử kéo, sửa, xóa.<br>3. Reload. | Element khóa không kéo/sửa/xóa được. Trạng thái giữ sau reload. | Đã có: `scripts/test-landing-page-element-visibility-lock.cjs` kiểm: khóa và các hành động bị chặn | Chưa chạy |
| LP03-S06-TC003 | Section đang khóa: không sửa | P1 | Section đã khóa (LP03-F2). | 1. Thử sửa chữ trong section khóa. | Hiện "Section đang khóa — mở khóa trước khi chỉnh sửa". Không có thay đổi. | Chưa có | Chưa chạy |
| LP03-S06-TC004 | Section đang khóa: không xóa | P1 | Section đã khóa. | 1. Thử xóa section. | Hiện "Section đang khóa — mở khóa trước khi xóa". | Chưa có | Chưa chạy |
| LP03-S06-TC005 | Xóa nhiều bỏ qua mục khóa | P1 | Chọn nhiều, trong đó có mục khóa. | 1. Xóa vùng chọn. | Hiện "Đã xóa (bỏ qua section đang khóa)". Mục khóa còn nguyên. | Chưa có | Chưa chạy |
| LP03-S06-TC006 | Menu cho section khóa | P2 | Section khóa. | 1. Mở thanh công cụ/menu của section khóa. | Các lệnh hiển thị nhưng bị vô hiệu; không có chỉ báo cột ("locked section: toolbar ... all actions disabled and inert"). | Đã có: `scripts/qa-landing-page-element-toolbar-browser.cjs` kiểm: section khóa: thanh công cụ của khối khóa, mọi lệnh bị vô hiệu ("locked section: toolbar for locked block, all actions disabled and inert"); qa-landing-page-section-rows-browser.cjs "locked section: no column indicator" | Chưa chạy |
| LP03-S06-TC007 | Hành động bị chặn không xóa nhánh Redo | P2 | Có lịch sử Undo, Redo. | 1. Undo một bước.<br>2. Thử thao tác trên element khóa (bị chặn).<br>3. Nhấn Redo. | Redo vẫn hoạt động (hành động bị chặn không xóa nhánh Redo). | Đã có: `scripts/test-landing-page-element-visibility-lock.cjs` kiểm: "A blocked action must also preserve an existing redo branch" | Chưa chạy |

## LP03-S07. Khối Lead Form, gom lỗi cũ và chuyển thiết bị

**Mục tiêu:** Các lỗi từng xảy ra không tái diễn.

**Căn cứ:** Căn cứ kết quả mong đợi: tên các điều kiện kiểm trong script QA (đã đọc thông điệp assert) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện nên khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP03-S07-TC001 | Kéo khối Lead Form tự do, không toolbar thừa | P0 | Trang có khối Lead Form (LP03-F4). | 1. Chọn khối Lead Form.<br>2. Kéo khối sang vị trí mới.<br>3. Quan sát phía trên khối. | Khối di chuyển tự do. Không có thanh công cụ dư thừa phía trên đầu khối. Vị trí giữ sau reload. Đối chiếu với video lỗi cũ. | Chưa có | Chưa chạy |
| LP03-S07-TC002 | Sửa nhãn và placeholder của form | P1 | Khối Lead Form. | 1. Sửa nhãn một ô, placeholder, nhãn nút gửi.<br>2. Lưu, xuất bản, mở trang công khai. | Trang công khai hiển thị đúng nhãn và placeholder mới. Gửi form hoạt động (LP06). | Chưa có | Chưa chạy |
| LP03-S07-TC003 | Cấu hình CRM của form | P1 | Khối Lead Form. | 1. Chọn pipeline, giai đoạn, người phụ trách, thẻ.<br>2. Lưu và xuất bản.<br>3. Gửi một lead (LP06). | Lead mang cấu hình đã chọn (kiểm ở LP06-S04-TC005). | Chưa có | Chưa chạy |
| LP03-S07-TC004 | Chuyển sang Mobile không đổi layout Desktop | P1 | Trang có layout desktop tùy chỉnh. | 1. Chuyển khung xem sang Mobile, chỉnh một element.<br>2. Chuyển lại Desktop. | Layout Desktop không bị ghi đè ("mobile view does not rewrite desktop layout"). Có thể đồng bộ lại từ Mobile bằng lệnh riêng ("Đã đồng bộ từ Mobile"). | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "mobile view does not rewrite desktop layout" | Chưa chạy |
| LP03-S07-TC005 | Element không có thiết kế Mobile | P2 | Element chưa có thiết kế Mobile. | 1. Thử đồng bộ từ Mobile. | Hiện "Không có thiết kế Mobile cho phần tử này". | Chưa có | Chưa chạy |
| LP03-S07-TC006 | Lỗi console khi dùng builder | P1 | Mở builder và thực hiện các thao tác trong suite. | 1. Mở console, theo dõi lỗi `pageerror`. | Không có lỗi trang (page error) trong suốt phiên. | Một phần: `scripts/qa-landing-page-client-route-browser.cjs` kiểm: tải bundle builder thật, không có lỗi client (khoảng 5 dòng kiểm). Thiếu: chuỗi thao tác dài | Chưa chạy |

## Chạy lại khi nào

- Sửa `landing-page-builder.tsx` hoặc thành phần canvas: chạy cả bảy suite (ít nhất S01, S02, S03, S04 cho thay đổi nhỏ).
- Sửa xử lý chuột/pointer/resize: chạy S02, S03 và `qa-landing-page-pointer-resize-browser.cjs`.
- Sửa upload hoặc chính sách tệp: chạy S05.
- Sửa ẩn/khóa/lịch sử Undo: chạy S06 và LP05-S07-TC011.
- Sau mỗi bản triển khai: SMOKE-2 (LP03-S01-TC001).
