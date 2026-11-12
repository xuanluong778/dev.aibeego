# LP04: Builder: section, hàng/cột, thư viện section, thêm thành phần - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP04-builder-section-hang-cot.md](../flows/LP04-builder-section-hang-cot.md). Mức ưu tiên flow: P1. Route giao diện: `/landing-pages/builder/[id]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** cấu trúc trang trong builder: section, hàng, cột, thư viện section, thanh Thêm thành phần, Inspector, theme, khung thiết bị, xem trước. Thao tác trên từng element ở LP03, lưu ở LP05.

**Căn cứ code:** `apps/web/src/components/landing-pages/landing-page-builder.tsx` và các script `qa-landing-page-section-rows-browser.cjs`, `qa-landing-page-drop-layout-browser.cjs`, `test-landing-page-column-split.cjs`, `test-landing-page-section-library-parity.cjs`, `test-landing-page-add-components-dnd.cjs`, `test-landing-page-inspector-modes.cjs`, `test-landing-page-device-frame.cjs`, `test-landing-page-theme-switcher.cjs`. Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

**Case liên quan ở flow khác:** LP03 (thao tác element); LP05 (lưu và xuất bản sau khi sửa); LP12 (giao diện đa khung).

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP04-F1 | Số cột tối đa không thống nhất giữa các test: cổng `test-landing-page-column-split.cjs` mô tả "kéo element tới mép/khe section chia 2 đến 12 cột", trong khi `qa-landing-page-section-rows-browser.cjs` kiểm "5th column not offered (no vertical indicator)" (không có chỉ báo cột thứ 5 trong một hàng). | `scripts/test-landing-page-column-split.cjs` (dòng đầu), `scripts/qa-landing-page-section-rows-browser.cjs` | Cần xác nhận giới hạn số cột trên một hàng và số cột của section. Đề xuất ghi vào đặc tả sản phẩm. | LP04-S02-TC004 |
| LP04-F2 | Thư viện section có 100 mẫu (`assert.equal(LP_SECTION_LIBRARY_TEMPLATES.length, 100)` trong script). Test này kiểm "catalog/persistence thuần", không mở giao diện thư viện section. | `scripts/test-landing-page-section-library-parity.cjs` | Số 100 cần cập nhật khi thêm mẫu section. Xác nhận ngưỡng này là có chủ ý. | LP04-S04-TC001 |
| LP04-F3 | Nhiều cổng kiểm (`test-landing-page-inspector-modes.cjs`, `device-frame`, `theme-switcher`, `add-components-dnd`, `section-content-overflow`) đọc **mã nguồn** tìm chuỗi/hàm mà không chạy giao diện. Chúng bảo vệ khỏi việc mất mã, không chứng minh hành vi trên trình duyệt. | Các script tương ứng trong `scripts/` | Cần xem các case phủ "Một phần" như cổng mã nguồn, vẫn phải chạy tay hoặc viết Playwright khi sửa. | LP04-S05-TC001, LP04-S06-TC001 |

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
| LP04-S01 | Hàng và cột trong section | 10 |
| LP04-S02 | Chia cột khi thả | 7 |
| LP04-S03 | Cài đặt section: nền, khoảng cách, nội dung dài | 6 |
| LP04-S04 | Thư viện section và thêm thành phần | 10 |
| LP04-S05 | Inspector và theme | 6 |
| LP04-S06 | Khung thiết bị và xem trước toàn màn hình | 5 |
| LP04-S07 | Trường hợp biên | 5 |
| | **Tổng** | **49** |

## LP04-S01. Hàng và cột trong section

**Mục tiêu:** Thêm, di chuyển, thay đổi hàng/cột giữ nội dung, thứ tự hợp lý, không làm hỏng trang cũ.

**Căn cứ:** Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S01-TC001 | Thả element xuống dưới tạo hàng mới | P0 | Section có một hàng 3 cột. Cửa sổ 1542x900. | 1. Kéo một element từ thanh Thêm thành phần tới vùng dưới hàng hiện có.<br>2. Thả. | Tạo một hàng 1 cột mới nằm dưới, hàng cũ không đổi. Payload autosave có hàng mới trong spec. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "new row: separate 1-column row below, old row unchanged"; "drop saved with row in spec" (khoảng 34 dòng kiểm) | Chưa chạy |
| LP04-S01-TC002 | Thả vào cột có sẵn để xếp chồng | P0 | Hàng 4 cột. | 1. Thả element vào giữa một cột (chỉ báo ngang).<br>2. Xem kết quả. | Element xếp bên dưới trong cùng cột, vẫn 4 cột đều nhau. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "stack in column: same column, below, still 4 equal columns" | Chưa chạy |
| LP04-S01-TC003 | Chỉ báo vị trí thả đúng kiểu | P1 | Hàng nhiều cột. | 1. Rê element qua mép cột, qua khoảng giữa cột.<br>2. Nhấn Escape. | Mép cột: chỉ báo dọc nền trắng viền đứt xanh. Giữa cột: chỉ báo ngang. Escape: không còn chỉ báo, không đổi gì. Sau khi thả chỉ báo biến mất. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "column indicator: vertical, white bg, dashed blue"; "stack indicator: horizontal"; "cancel (Escape) leaves no indicator and no change"; qa-landing-page-drop-layout-browser.cjs "indicator cleared after drop" | Chưa chạy |
| LP04-S01-TC004 | Xóa element cuối của một cột | P1 | Hàng 3 cột, cột giữa có một element. | 1. Xóa element đó. | Còn 2 cột đều nhau (cột trống bị bỏ). | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "delete last element of a column → 2 equal columns" | Chưa chạy |
| LP04-S01-TC005 | Xóa element khi cột còn element khác | P1 | Cột có hai element xếp chồng. | 1. Xóa một element. | Cột còn lại giữ nguyên cùng element kia. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "delete in column with stacked sibling keeps column" | Chưa chạy |
| LP04-S01-TC006 | Di chuyển element giữa các hàng cân bằng lại | P1 | Hàng A có 4 cột, hàng B có 1 cột. | 1. Kéo một element từ hàng A sang hàng B. | Hàng A cân bằng lại thành 3 cột, hàng B thành 2 cột. Không mất hay nhân đôi element. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "move: source row rebalances 4 → 3, target row 1 → 2"; "move: no duplicate or lost element" | Chưa chạy |
| LP04-S01-TC007 | Undo và Redo với thao tác hàng/cột | P1 | Đã thực hiện: thêm cột, xếp chồng, tạo hàng mới. | 1. Undo ba lần.<br>2. Redo hai lần. | Mỗi lần Undo gỡ đúng một thao tác (lần 2 chỉ gỡ element xếp chồng). Redo về "4 cột + xếp chồng + hàng mới". | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "second undo removes the stacked element only"; "redo ×2 back to 4 columns + stacked + new row" | Chưa chạy |
| LP04-S01-TC008 | Trang cũ không có hàng vẫn hiển thị nguyên | P0 | Trang cũ lưu trước khi có tính năng hàng/cột. | 1. Mở trang trong builder và công khai.<br>2. Thả một element theo cách cũ. | Không có markup hàng cho trang cũ ("legacy page renders without row markup"). Thả theo cách cũ không tạo hàng ("legacy flow drop unchanged"). | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: chế độ `LP_ROWS_QA_MODE=legacy-snapshot` để so sánh ảnh cũ và mới | Chưa chạy |
| LP04-S01-TC009 | Element của section khác không bị ảnh hưởng | P1 | Hai section. | 1. Thao tác hàng/cột trong section 1. | Section 2 không đổi ("other section element untouched"). | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "other section element untouched (no row, same anchor)" | Chưa chạy |
| LP04-S01-TC010 | Section bị khóa không hiện chỉ báo cột | P2 | Section khóa. | 1. Rê element qua section khóa. | Không có chỉ báo cột; không thả được vào. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "locked section: no column indicator" | Chưa chạy |

## LP04-S02. Chia cột khi thả

**Mục tiêu:** Kéo element tới mép hoặc khe section tạo số cột đúng, chia đều.

**Căn cứ:** Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S02-TC001 | Từ 1 cột chia thành 2 | P0 | Section 1 cột trong container. | 1. Kéo element tới mép phải của cột. | Hai cột 50/50 trong container. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "1 → 2 columns: 50/50 inside container" | Chưa chạy |
| LP04-S02-TC002 | Từ 2 chia thành 3 | P1 | Hàng 2 cột. | 1. Thả ở mép phải cột 2. | Ba cột bằng nhau. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "2 → 3 columns: equal thirds" | Chưa chạy |
| LP04-S02-TC003 | Từ 3 chia thành 4, thả bên trái cột đầu | P1 | Hàng 3 cột. | 1. Thả vào mép trái cột đầu. | Bốn cột bằng nhau, element mới ở cột đầu. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "3 → 4 columns (left of first): equal quarters" | Chưa chạy |
| LP04-S02-TC004 | Giới hạn cột (LP04-F1) | P1 | Hàng đã có 4 cột. | 1. Rê element tới mép để thêm cột thứ 5. | Theo script QA: không có chỉ báo cột dọc cho cột thứ 5. Đối chiếu với mô tả cổng "2–12 cột" và ghi lại giới hạn thực tế. | Một phần: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "5th column not offered (no vertical indicator)". Thiếu: xác nhận giới hạn trong đặc tả | Chưa chạy |
| LP04-S02-TC005 | Cổng kiểm chia cột bằng mã nguồn | P2 | Mã nguồn hiện tại. | 1. Chạy `node scripts/test-landing-page-column-split.cjs`. | Các cổng (thanh dọc, chỉ báo thả, thanh công cụ, thông báo phiên bản) báo PASS. | Một phần: `scripts/test-landing-page-column-split.cjs` kiểm: cổng đọc mã nguồn cho chỉ báo và logic chia cột (khoảng 1 dòng kiểm). Thiếu: hành vi trên trình duyệt | Chưa chạy |
| LP04-S02-TC006 | Cột trên Mobile xếp dọc đúng thứ tự | P0 | Hàng nhiều cột. | 1. Chuyển sang khung Mobile.<br>2. Quan sát thứ tự. | Các cột xếp dọc theo thứ tự logic, không chồng lấn. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "mobile: columns stack vertically"; qa-landing-page-drop-layout-browser.cjs "Managed columns stack in logical order on mobile" | Chưa chạy |
| LP04-S02-TC007 | Chia cột không làm thay đổi Desktop khi sửa ở Mobile | P1 | Trang đã chia cột. | 1. Sửa ở Mobile, chuyển lại Desktop. | Desktop không bị ghi đè. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "mobile view does not rewrite desktop layout" | Chưa chạy |

## LP04-S03. Cài đặt section: nền, khoảng cách, nội dung dài

**Mục tiêu:** Section tự giãn đủ nội dung và không chồng lấn.

**Căn cứ:** Gồm `test-landing-page-section-content-overflow.cjs` (báo cáo lỗi: thẻ Features vị trí tự do chồng lên section kế tiếp). Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S03-TC001 | Section tự giãn theo nội dung | P0 | Section vị trí tự do có ảnh, tiêu đề, nút. | 1. Thêm nhiều chữ vào tiêu đề để dài ra.<br>2. Xem section kế tiếp. | Section giãn cao, không đè lên section phía dưới (lỗi từng gặp: thẻ Features đè section sau). | Một phần: `scripts/test-landing-page-section-content-overflow.cjs` kiểm: cổng kiểm "content-growth overlap" ở mức mã nguồn (không assert). Thiếu: đo hình học thực tế trên trình duyệt | Chưa chạy |
| LP04-S03-TC002 | Đổi nền section | P1 | Section có nền màu. | 1. Đổi màu nền, ảnh nền, ảnh nền có lớp phủ. | Nền đổi đúng và lưu. Trang công khai giống builder. | Chưa có | Chưa chạy |
| LP04-S03-TC003 | Khoảng đệm (padding) và chiều cao tối thiểu | P1 | Một section. | 1. Đặt khoảng đệm trên/dưới, chiều cao tối thiểu 700 px. | Giá trị áp đúng, không cắt nội dung (không `overflow: hidden` làm mất chữ). | Chưa có | Chưa chạy |
| LP04-S03-TC004 | Section rất cao hoặc nhiều phần tử | P1 | Section có 60 phần tử. | 1. Mở và kéo thả trong section.<br>2. Xuất bản. | Builder vẫn mượt (không treo), lưu thành công trong thời gian 20 giây của autosave, trang công khai hiển thị đủ. | Chưa có | Chưa chạy |
| LP04-S03-TC005 | Ảnh nền video | P2 | Tệp `bg.mp4` hợp lệ. | 1. Đặt video làm nền section (upload-background). | Video phát tự động tắt tiếng (hoặc theo thiết kế) và có hình thay thế khi không tải được. | Chưa có | Chưa chạy |
| LP04-S03-TC006 | Tràn nội dung trên Mobile | P1 | Section có chữ dài. | 1. Xem ở 390 px. | Không cuộn ngang, chữ xuống dòng. | Chưa có | Chưa chạy |

## LP04-S04. Thư viện section và thêm thành phần

**Mục tiêu:** Thêm section từ thư viện và thanh Thêm thành phần đúng chỗ.

**Căn cứ:** Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S04-TC001 | Thư viện section đủ mẫu và dựng được (LP04-F2) | P1 | Mã nguồn hiện tại. | 1. Chạy `node scripts/test-landing-page-section-library-parity.cjs`. | Đúng 100 mẫu section. Mỗi mẫu dựng thành khối hợp lệ, qua `sanitizeLandingPageDraftSpec` rồi `sanitizeLandingPagePersistSpec` mà không mất dữ liệu, không làm thay đổi trang cha (khoảng 19 dòng kiểm). | Đã có: `scripts/test-landing-page-section-library-parity.cjs` kiểm: 100 mẫu, dựng khối, giữ dữ liệu qua lưu, không sửa catalog gốc | Chưa chạy |
| LP04-S04-TC002 | Xem trước section khớp trang thật | P1 | Thư viện section mở. | 1. Xem trước một section.<br>2. Thêm vào trang.<br>3. So sánh. | Bản xem trước giống phần thêm vào trang. | Chưa có | Chưa chạy |
| LP04-S04-TC003 | Thêm section bằng nhấp | P0 | Trang trống hoặc có section. | 1. Mở thư viện section.<br>2. Chọn một mẫu và chọn vị trí chèn. | Section được chèn đúng vị trí, nội dung mẫu không trùng id với section khác. | Chưa có | Chưa chạy |
| LP04-S04-TC004 | Thêm section bằng kéo thả | P0 | Thanh Thêm thành phần mở. | 1. Kéo thẻ section (loại `block-type`) thả vào canvas. | Thêm đúng chỗ. Chân trang không nhân đôi thuộc tính `data-lp-block-id`. | Một phần: `scripts/test-landing-page-add-components-dnd.cjs` kiểm: cổng: thẻ section kéo được bằng HTML5; chân trang không nhân đôi id block. Thiếu: kéo thả thực tế | Chưa chạy |
| LP04-S04-TC005 | Thêm element vào ô lưới | P1 | Section có lưới. | 1. Chọn ảnh rồi thả vào ô lưới. | Hiện "Đã chèn ảnh vào ô lưới". | Chưa có | Chưa chạy |
| LP04-S04-TC006 | Thêm đoạn văn, danh sách, nhóm nút, thư viện ảnh | P1 | Thanh Thêm thành phần. | 1. Thêm lần lượt đoạn văn, danh sách, nhóm nút, Gallery. | Các thông báo "Đã chèn đoạn văn", "Đã chèn danh sách", "Đã chèn nhóm nút", "Đã thêm Gallery với ảnh đã chọn". Mỗi mục xuất hiện đúng một lần. | Chưa có | Chưa chạy |
| LP04-S04-TC007 | Thêm phần trống | P2 | Builder. | 1. Chọn thêm phần trống. | Hiện "Đã thêm phần trống". | Chưa có | Chưa chạy |
| LP04-S04-TC008 | Chèn nội dung không chồng lên tiêu đề hay hộp | P0 | Section có tiêu đề và hộp. | 1. Thả element vào khoảng giữa tiêu đề và hộp. | Nội dung chèn không chồng lên hộp hay tiêu đề, các phần tử anh em không chồng nhau. Thả không bị đẩy vào trong hộp. | Đã có: `scripts/qa-landing-page-drop-layout-browser.cjs` kiểm: "Inserted content must not overlap boxes"; "Inserted content must not overlap heading"; "Inserted siblings do not overlap"; "Drop marker must stay outside all boxes" (khoảng 33 dòng kiểm) | Chưa chạy |
| LP04-S04-TC009 | Thêm section khi ở chế độ vị trí tự do | P1 | Trang có section vị trí tự do. | 1. Thêm section mới từ thư viện. | Section mới thêm đúng, section tự do cũ không dịch chuyển. | Chưa có | Chưa chạy |
| LP04-S04-TC010 | Xóa native box giữ quyền sở hữu React | P2 | Section có box gốc. | 1. Xóa một box gốc rồi thao tác tiếp. | Không lỗi React, không element ma. | Đã có: `scripts/qa-landing-page-drop-layout-browser.cjs` kiểm: "Deleting a native box must preserve React ownership" | Chưa chạy |

## LP04-S05. Inspector và theme

**Mục tiêu:** Bảng thuộc tính hiển thị đúng ngữ cảnh, đổi theme đúng màu/phông.

**Căn cứ:** Các cổng giao diện đọc mã nguồn (LP04-F3). Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S05-TC001 | Chế độ Inspector (thu gọn, nổi, kéo) | P1 | Builder mở. | 1. Thu gọn thanh trái.<br>2. Chuyển Inspector sang chế độ nổi và kéo. | Hoạt động đúng, canvas cuộn trang (không còn khung cuộn bên trong trên desktop). | Một phần: `scripts/test-landing-page-inspector-modes.cjs` kiểm: cổng: thu gọn thanh trái, Inspector nổi/kéo, cuộn trang (không assert, kiểm mã nguồn). Thiếu: thao tác thật | Chưa chạy |
| LP04-S05-TC002 | Tab thiết kế theo ngữ cảnh | P1 | Chọn lần lượt section, chữ, ảnh, nút. | 1. Quan sát tab và trường trong Inspector. | Mỗi loại hiển thị đúng bộ trường, ẩn trường không liên quan. | Một phần: `scripts/test-landing-page-inspector-modes.cjs` kiểm: cổng mã nguồn các chế độ. Thiếu: kiểm giao diện | Chưa chạy |
| LP04-S05-TC003 | Đổi theme nhanh | P0 | Trang dùng theme MODERN. | 1. Đổi sang BOLD bằng bộ chuyển theme nhanh.<br>2. Chờ lưu, xuất bản, mở trang công khai. | Màu và phông đổi đúng (`themeTokens` theo preset). Lưu `theme = BOLD`. Trang công khai cùng theme. | Một phần: `scripts/test-landing-page-theme-switcher.cjs` kiểm: cổng bộ chuyển theme nhanh (không assert, kiểm mã nguồn). Thiếu: kết quả hiển thị và lưu | Chưa chạy |
| LP04-S05-TC004 | Theme giữ sau reload | P1 | Đã đổi theme. | 1. Reload. | Theme giữ nguyên. | Chưa có | Chưa chạy |
| LP04-S05-TC005 | CSS tùy biến | P2 | Ô CSS tùy biến của tab thiết kế. | 1. Nhập CSS đơn giản và CSS chứa `</style><script>`. | CSS hợp lệ áp dụng. CSS nguy hiểm bị loại hoặc vô hiệu, không chạy script trên trang công khai. | Một phần: `scripts/test-landing-page-publish-flush.cjs` kiểm: có kiểm sự hiện diện ô CSS tùy biến (`data-lp-design-custom-css-textarea`). Thiếu: làm sạch CSS nguy hiểm | Chưa chạy |
| LP04-S05-TC006 | Màu thương hiệu từ hồ sơ doanh nghiệp | P2 | Hồ sơ có màu thương hiệu. | 1. Áp hồ sơ vào trang (LP10). | Theme/màu cập nhật theo hồ sơ, không ghi đè khi người dùng đã đổi. | Một phần: `scripts/test-landing-page-business-profile.cjs` kiểm: áp hồ sơ không ghi đè nội dung người dùng. Thiếu: màu thương hiệu cụ thể | Chưa chạy |

## LP04-S06. Khung thiết bị và xem trước toàn màn hình

**Mục tiêu:** Chuyển Desktop/Tablet/Mobile đúng, xem trước giống bản công khai.

**Căn cứ:** Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S06-TC001 | Chuyển khung thiết bị | P0 | Builder mở. | 1. Chuyển Desktop, Tablet, Mobile. | Khung thay đổi đúng chiều rộng, nội dung responsive đúng. Nút chuyển có ("mobile device toggle found"). | Một phần: `scripts/test-landing-page-device-frame.cjs` kiểm: cổng khung thiết bị mobile/tablet (không assert, kiểm mã nguồn). Thiếu: hiển thị thật | Chưa chạy |
| LP04-S06-TC002 | Chỉnh riêng bố cục Mobile | P1 | Trang đã có bố cục Desktop. | 1. Chỉnh một element ở Mobile.<br>2. Quay lại Desktop. | Desktop không đổi. Mobile giữ chỉnh sửa sau reload. | Đã có: `scripts/qa-landing-page-section-rows-browser.cjs` kiểm: "mobile view does not rewrite desktop layout" | Chưa chạy |
| LP04-S06-TC003 | Xem trước toàn màn hình giống bản công khai | P0 | Trang có Hero, CTA, bảo đảm, form, lợi ích, bảng giá, ảnh. | 1. Mở xem trước toàn màn hình.<br>2. So với `/p/<slug>` của bản đã xuất bản cùng nội dung. | Cùng cấu trúc, cùng thành phần. Ghi lại khác biệt có chủ đích (không có thanh builder). | Một phần: `scripts/test-landing-page-builder-preview-public-parity.cjs` kiểm: cổng so khớp mã nguồn builder/xem trước/công khai (BUG-03/04/05, không assert). Thiếu: so khớp trực quan | Chưa chạy |
| LP04-S06-TC004 | Xem trước không gửi lead thật | P0 | Chế độ xem trước. | 1. Điền và gửi form. | Hiện "Preview: form không gửi lead thật.", không có lead. | Chưa có | Chưa chạy |
| LP04-S06-TC005 | Xoay thiết bị và cỡ cửa sổ rất nhỏ | P2 | Cửa sổ 320 px. | 1. Mở builder và công khai ở 320 px. | Không có cuộn ngang ở trang công khai. Builder dùng được hoặc có thông báo màn hình quá nhỏ. | Chưa có | Chưa chạy |

## LP04-S07. Trường hợp biên

**Mục tiêu:** Các tình huống ít gặp nhưng từng gây lỗi.

**Căn cứ:** Căn cứ kết quả mong đợi: thông điệp assert trong các script QA (đã đọc) và flow gốc; chưa đối chiếu từng nhãn nút trong code giao diện, khi chạy cần ghi lại nhãn thực tế.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP04-S07-TC001 | Xóa cột đang có nội dung | P1 | Cột có 2 element. | 1. Xóa cột (hoặc xóa toàn bộ element của cột). | Hỏi xác nhận hoặc xóa kèm nội dung theo thiết kế; số cột còn lại chia đều, không mất element ở cột khác. | Chưa có | Chưa chạy |
| LP04-S07-TC002 | Thêm section khi đang chọn element | P2 | Đang chọn element. | 1. Thêm section từ thư viện. | Section thêm đúng chỗ, lựa chọn giữ hợp lý, không lỗi. | Chưa có | Chưa chạy |
| LP04-S07-TC003 | Nhân bản section | P1 | Section có element. | 1. Nhân bản section. | Bản sao có id mới, độc lập; sửa bản sao không đổi gốc. Thông báo "Đã nhân bản". | Chưa có | Chưa chạy |
| LP04-S07-TC004 | Xóa section và Undo | P1 | Trang nhiều section. | 1. Xóa một section.<br>2. Undo. | Section quay lại đúng vị trí, nội dung nguyên vẹn. | Chưa có | Chưa chạy |
| LP04-S07-TC005 | Sắp xếp lại thứ tự section | P1 | Trang 4 section. | 1. Kéo section 4 lên đầu, lưu, reload. | Thứ tự mới giữ sau reload và trên trang công khai. | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa logic hàng/cột/thả: chạy S01, S02 và `qa-landing-page-section-rows-browser.cjs`, `qa-landing-page-drop-layout-browser.cjs`.
- Sửa thư viện section hoặc catalog khối: chạy S04.
- Sửa Inspector, theme hoặc khung thiết bị: chạy S05, S06.
- Sửa CSS section hoặc tự giãn nội dung: chạy S03 và LP12.
- Mọi thay đổi `landing-page-builder.tsx`: chạy tối thiểu S01-TC001, S02-TC001, S04-TC003, S06-TC001.
