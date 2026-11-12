# LP11: Hiệu ứng (motion) cho section và element - Test suites

Cập nhật: 11/11/2026. Trạng thái thực thi của mọi case: **Chưa chạy**. Tài liệu chỉ mô tả kiểm thử, không sửa code sản phẩm.

Flow gốc: [../flows/LP11-hieu-ung-motion.md](../flows/LP11-hieu-ung-motion.md). Mức ưu tiên flow: P2. Route giao diện: `/landing-pages/builder/[id]`, `/p/[slug]`. Mẫu trình bày: [F01-dang-ky-test-suites.md](F01-dang-ky-test-suites.md). Mục lục: [LP-README.md](LP-README.md).

## Phạm vi và căn cứ code

**Phạm vi:** cấu hình hiệu ứng vào (entrance motion) cho section và element, lưu và xuất bản, chạy trên trang công khai, giảm chuyển động, mặc định tắt.

**Căn cứ code:** `packages/shared/src/landing-page-motion.ts` (11 kiểu, thời lượng 150 đến 1200 ms, độ trễ 0 đến 400 ms, trigger luôn là scroll), `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts` (CSS và tìm phần tử), script `test-landing-page-motion.cjs`, `qa-landing-page-motion-browser.cjs`, `qa-landing-page-motion-cascade-browser.cjs`. Chi tiết giao diện chọn hiệu ứng trong builder chưa đối chiếu từng nhãn.

**Case liên quan ở flow khác:** LP03 (sửa phần tử); LP05 (lưu và xuất bản); LP07 (trang công khai); LP09 (gói mẫu chứa motion); LP12 (tràn ngang).

## Điểm lệch tài liệu hoặc cần xác nhận

| Mã | Hành vi hiện tại trong code | Vị trí trong code | Kỳ vọng cần xác nhận | Case liên quan |
|---|---|---|---|---|
| LP11-F1 | Cấu hình hiệu ứng được làm sạch ở `sanitizeLandingPageMotion`: chỉ nhận 11 kiểu (`fade, slide-down, slide-up, slide-right, slide-left, zoom-in, zoom-out, slide-down-right, slide-down-left, slide-up-right, slide-up-left`). Thời lượng giới hạn 150 đến 1200 ms (mặc định 1200), độ trễ 0 đến 400 ms (mặc định 0). Thuộc tính `trigger` cũ `load` vẫn được chấp nhận nhưng **luôn bị đổi thành `scroll`**. | `packages/shared/src/landing-page-motion.ts` hàm `sanitizeLandingPageMotion`, hằng `LP_MOTION_DEFAULTS` | Khớp mong đợi "chạy khi cuộn tới". Cần xác nhận không còn nhu cầu hiệu ứng khi tải trang. | LP11-S02-TC002, LP11-S02-TC003 |
| LP11-F2 | Quy tắc CSS: với người dùng **không** bật giảm chuyển động, phần tử đang chờ (`data-lp-motion-pending`) bị đặt `opacity: 0 !important`. Nếu mã chạy hiệu ứng không thực thi (lỗi JavaScript hoặc chặn script), các phần tử này có thể vẫn ẩn. Chưa xác định thuộc tính chờ được đặt bởi máy chủ hay chỉ bởi trình duyệt. | `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts` hằng `LP_MOTION_CSS` | Cần xác nhận cách trang công khai suy giảm êm khi JavaScript không chạy. Case LP11-S03-TC007. | LP11-S03-TC007 |
| LP11-F3 | Khóa phần tử hợp lệ tối đa 200 ký tự và chỉ thuộc các dạng `image`, `form`, `grid:<số>`, `countdown:*`, `item:*`, `field:*` (và `section`). Mỗi phần tử hiệu ứng tối đa 500 mục mỗi section; khóa lạ bị bỏ. | `packages/shared/src/landing-page-motion.ts` hàm `isLandingPageMotionElementKey`, `sanitizeLandingPageMotionStyle` (`slice(0, 500)`) | Ghi lại để biết giới hạn khi viết case biên. | LP11-S02-TC005 |
| LP11-F4 | Tên kiểu hiệu ứng hiển thị trên giao diện (ví dụ "Hiện dần" cho `fade`) lấy từ script QA; danh sách nhãn đầy đủ trên giao diện chưa đối chiếu. | `scripts/qa-landing-page-motion-browser.cjs` (giá trị `name: 'Hiện dần'`) | Khi chạy, ghi lại nhãn thực tế của 11 kiểu. | LP11-S01-TC002 |

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
| LP11-S01 | Bật và cấu hình hiệu ứng trong builder | 10 |
| LP11-S02 | Lưu, làm sạch và xuất bản cấu hình hiệu ứng | 7 |
| LP11-S03 | Chạy hiệu ứng trên trang công khai | 10 |
| LP11-S04 | Mặc định tắt, tương thích trang cũ và hiệu năng | 6 |
| | **Tổng** | **33** |

## LP11-S01. Bật và cấu hình hiệu ứng trong builder

**Mục tiêu:** Chọn kiểu, thời lượng, độ trễ cho section hoặc element, thử nhanh, tắt.

**Căn cứ:** `packages/shared/src/landing-page-motion.ts`, `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts`, script `test-landing-page-motion.cjs`, `qa-landing-page-motion-browser.cjs`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP11-S01-TC001 | Bật hiệu ứng Hiện dần cho một tiêu đề | P0 | Trang T trong builder, section có tiêu đề. Cửa sổ 1542x900. | 1. Chọn tiêu đề.<br>2. Mở phần hiệu ứng, chọn "Hiện dần".<br>3. Chờ lưu. | Tiêu đề được gắn hiệu ứng `fade` với mặc định 1200 ms, độ trễ 0. Payload autosave có cấu hình motion. Reload thấy hiệu ứng vẫn được chọn. | Một phần: `scripts/qa-landing-page-motion-browser.cjs` kiểm: thao tác bật hiệu ứng trên builder thật, lưu và tải lại (khoảng 61 dòng kiểm). Thiếu: thông số chi tiết từng kiểu | Chưa chạy |
| LP11-S01-TC002 | Toàn bộ 11 kiểu hiệu ứng chọn được | P1 | Như trên. | 1. Lần lượt chọn từng kiểu: Hiện dần, trượt xuống/lên/trái/phải, bốn hướng chéo, thu phóng vào/ra. | Mỗi kiểu lưu đúng `preset` tương ứng. Ghi lại nhãn tiếng Việt thực tế (LP11-F4). | Một phần: `scripts/test-landing-page-motion.cjs` kiểm: hành vi `patch` và `read` trên dữ liệu motion bằng mã chia sẻ thật (khoảng 67 dòng kiểm). Thiếu: nhãn giao diện cho đủ 11 kiểu | Chưa chạy |
| LP11-S01-TC003 | Đặt thời lượng và độ trễ | P1 | Phần tử đã có hiệu ứng. | 1. Đặt thời lượng 450 ms, độ trễ 100 ms.<br>2. Chờ lưu, reload. | Giá trị giữ nguyên sau reload: `duration = 450`, `delay = 100`. | Một phần: `scripts/test-landing-page-motion.cjs` kiểm: giá trị thời lượng 450 được dùng trong các phép thử. Thiếu: độ trễ và nhập liệu trên giao diện | Chưa chạy |
| LP11-S01-TC004 | Hiệu ứng cho section | P1 | Section có nhiều phần tử. | 1. Chọn nền section, bật hiệu ứng cho cả section. | Cấu hình lưu ở khóa `section`. Cả khối hiện theo hiệu ứng. | Chưa có | Chưa chạy |
| LP11-S01-TC005 | Hiệu ứng cho từng loại phần tử | P1 | Section Hero có tiêu đề, ảnh, thẻ, nút CTA, biểu tượng tin cậy. | 1. Bật hiệu ứng lần lượt cho: tiêu đề, ảnh, một thẻ, mô tả thẻ, tiêu đề thẻ, nút CTA, biểu tượng tin cậy. | Mỗi mục lưu ở khóa riêng (`field:headline`, `image`, `item:card-a`, `field:itemTitle:card-a`, `field:itemDesc:card-a`, `field:ctaLabel`, `item:trust-icon-0`). | Đã có: `scripts/test-landing-page-motion.cjs` kiểm: bảy mục tiêu mẫu gồm tiêu đề, ảnh, thẻ, mô tả/tiêu đề thẻ, CTA, biểu tượng tin cậy | Chưa chạy |
| LP11-S01-TC006 | Thử hiệu ứng ngay trong builder | P1 | Phần tử đã có hiệu ứng. | 1. Bấm nút thử hiệu ứng. | Hiệu ứng chạy một lần trên đúng phần tử (sự kiện `aibeego:lp-motion-try`), không đổi dữ liệu trang, không tạo thay đổi chưa lưu. | Chưa có | Chưa chạy |
| LP11-S01-TC007 | Tắt hiệu ứng | P0 | Phần tử có hiệu ứng. | 1. Chọn "Không có hiệu ứng" (hoặc nút xóa).<br>2. Chờ lưu, xuất bản, mở trang công khai. | Cấu hình motion của phần tử bị xóa khỏi spec. Trang công khai không chạy hiệu ứng. | Một phần: `scripts/qa-landing-page-motion-browser.cjs` kiểm: thao tác bật/tắt trên builder. Thiếu: kết quả ở trang công khai | Chưa chạy |
| LP11-S01-TC008 | Undo và Redo thay đổi hiệu ứng | P1 | Đã đổi kiểu hiệu ứng hai lần. | 1. Undo một lần, Redo một lần. | Kiểu hiệu ứng quay lại đúng giá trị tương ứng từng bước. | Một phần: `scripts/qa-landing-page-motion-browser.cjs` kiểm: tương tác builder (chưa đọc điều kiện lịch sử cụ thể). Thiếu: xác nhận Undo/Redo của motion | Chưa chạy |
| LP11-S01-TC009 | Hiệu ứng không làm tràn ngang trong builder | P1 | Hiệu ứng slide trên phần tử sát mép. | 1. Bật slide-left/right trên phần tử sát mép canvas. | Không xuất hiện cuộn ngang. Phần tử có hiệu ứng được cắt (`overflow: clip`) khi cần (`data-lp-motion-clipping`). | Một phần: `scripts/qa-landing-page-motion-browser.cjs` kiểm: kiểm builder thật có hiệu ứng. Thiếu: đo cuộn ngang cụ thể | Chưa chạy |
| LP11-S01-TC010 | Người chỉ xem không sửa được | P1 | Token ORG-A-VIEWER. | 1. Autosave nội dung có motion. | 403. Xem LP05-S08. | Chưa có | Chưa chạy |

## LP11-S02. Lưu, làm sạch và xuất bản cấu hình hiệu ứng

**Mục tiêu:** Dữ liệu motion hợp lệ được giữ, dữ liệu sai được làm sạch, và đi theo xuất bản.

**Căn cứ:** `sanitizeLandingPageMotion`, `sanitizeLandingPageMotionStyle`, `isLandingPageMotionElementKey` trong `packages/shared/src/landing-page-motion.ts`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP11-S02-TC001 | Motion đi theo autosave và xuất bản | P0 | Trang T có hiệu ứng ở tiêu đề. | 1. Lưu, xuất bản.<br>2. `GET /landing-pages/public/<slug>` và xem spec. | Spec công khai có cấu hình motion giống bản nháp (kiểu, thời lượng, độ trễ). | Đã có: `scripts/test-landing-page-motion.cjs` kiểm: chạy phương thức xuất bản thật với giao dịch giả: motion đi vào bản xuất bản | Chưa chạy |
| LP11-S02-TC002 | Kiểu hiệu ứng lạ bị loại (LP11-F1) | P1 | Token ORG-A-OWNER. | 1. Autosave với `motion.preset = "explode"`. | Cấu hình đó bị bỏ (trả `undefined`), phần tử không có hiệu ứng. Phần còn lại của spec lưu bình thường. | Một phần: `scripts/test-landing-page-motion.cjs` kiểm: làm sạch qua mã chia sẻ. Thiếu: qua HTTP autosave | Chưa chạy |
| LP11-S02-TC003 | Thời lượng và độ trễ ngoài khoảng (LP11-F1) | P1 | Token ORG-A-OWNER. | 1. Autosave với `duration` 50, 5000, `delay` -10, 9999, `"abc"`. | Giá trị được kẹp: thời lượng trong 150 đến 1200, độ trễ trong 0 đến 400. Giá trị không phải số dùng mặc định (1200 và 0). | Một phần: `scripts/test-landing-page-motion.cjs` kiểm: kẹp giá trị trong các phép thử. Thiếu: đủ các biên 149/150/1200/1201 và 0/400/401 | Chưa chạy |
| LP11-S02-TC004 | Trigger load được đổi thành scroll (LP11-F1) | P1 | Dữ liệu cũ có `trigger = load`. | 1. Autosave và đọc lại. | Lưu `trigger = scroll`. Dữ liệu `trigger` khác (`click`) làm cả cấu hình bị bỏ. | Chưa có | Chưa chạy |
| LP11-S02-TC005 | Khóa phần tử không hợp lệ (LP11-F3) | P2 | Token ORG-A-OWNER. | 1. Autosave với khóa `elements` lạ như `xyz`, `<script>`, khóa 201 ký tự, 501 mục. | Khóa lạ bị bỏ; chỉ giữ 500 mục đầu hợp lệ; không lỗi. | Chưa có | Chưa chạy |
| LP11-S02-TC006 | Gói mẫu có chứa motion | P1 | Gói mẫu `.zip` với motion hợp lệ và không hợp lệ. | 1. Upload gói qua LP09. | Motion hợp lệ giữ, không hợp lệ bị làm sạch. Phân tích gói và `acceptSpec` thật được dùng. | Đã có: `scripts/test-landing-page-motion.cjs` kiểm: bộ phân tích gói mẫu thật và phương thức `acceptSpec` | Chưa chạy |
| LP11-S02-TC007 | Nhân bản section hoặc trang giữ hiệu ứng | P1 | Section có hiệu ứng. | 1. Nhân bản section.<br>2. Nhân bản trang (LP08). | Bản sao giữ nguyên cấu hình motion với khóa phần tử hợp lệ trong bản sao. | Chưa có | Chưa chạy |

## LP11-S03. Chạy hiệu ứng trên trang công khai

**Mục tiêu:** Hiệu ứng chạy khi cuộn tới, đúng thứ tự, tôn trọng giảm chuyển động.

**Căn cứ:** `apps/web/src/components/landing-pages/landing-page-motion-runtime.ts` (`LP_MOTION_CSS`, `findLpMotionNode`), script `qa-landing-page-motion-browser.cjs`, `qa-landing-page-motion-cascade-browser.cjs`.

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP11-S03-TC001 | Hiệu ứng chạy khi phần tử vào khung nhìn | P0 | Trang đã xuất bản, phần tử thứ 5 có hiệu ứng fade. | 1. Mở `/p/<slug>` ở cửa sổ ẩn danh.<br>2. Quan sát phần tử trước khi cuộn.<br>3. Cuộn tới phần tử. | Trước khi cuộn tới: phần tử ẩn (chờ). Khi vào khung nhìn: chạy hiệu ứng đúng kiểu, đúng thời lượng, rồi hiển thị đầy đủ. Hiệu ứng chạy một lần. | Một phần: `scripts/qa-landing-page-motion-browser.cjs` kiểm: chạy hiệu ứng trên trang kết xuất của builder. Thiếu: trang công khai thật `/p/<slug>` | Chưa chạy |
| LP11-S03-TC002 | Độ trễ được áp dụng | P1 | Phần tử có `delay = 300`. | 1. Cuộn tới phần tử và đo thời điểm bắt đầu. | Hiệu ứng bắt đầu sau khoảng 300 ms (sai số nhỏ). | Chưa có | Chưa chạy |
| LP11-S03-TC003 | Hiệu ứng nối tiếp (cascade) | P1 | Section có tiêu đề, mô tả, nút với độ trễ tăng dần. | 1. Cuộn tới section. | Các phần tử hiện theo đúng thứ tự cấu hình. | Đã có: `scripts/qa-landing-page-motion-cascade-browser.cjs` kiểm: thứ tự nối tiếp (khoảng 10 dòng kiểm) | Chưa chạy |
| LP11-S03-TC004 | Hiệu ứng chạy một lần khi cuộn qua lại | P2 | Trang đã chạy hiệu ứng. | 1. Cuộn lên rồi xuống nhiều lần. | Không chạy lại ở các lần sau (theo thiết kế vào khung nhìn một lần). Ghi lại hành vi thực tế. | Chưa có | Chưa chạy |
| LP11-S03-TC005 | Giảm chuyển động tắt hiệu ứng | P0 | Hệ điều hành/trình duyệt bật `prefers-reduced-motion: reduce`. | 1. Mở `/p/<slug>` và cuộn. | Phần tử hiển thị ngay, không chạy hoạt ảnh (`animation: none`). Không có phần tử bị kẹt ẩn. | Chưa có | Chưa chạy |
| LP11-S03-TC006 | Không bật giảm chuyển động | P1 | `prefers-reduced-motion: no-preference`. | 1. Mở trang. | Phần tử đang chờ ẩn bằng `opacity: 0` đến khi chạy. | Chưa có | Chưa chạy |
| LP11-S03-TC007 | JavaScript lỗi hoặc bị chặn (LP11-F2) | P0 | Chặn script của trang (hoặc giả lập lỗi trong mã hiệu ứng). | 1. Mở trang và cuộn qua tất cả phần tử có hiệu ứng. | Nội dung vẫn đọc được. Nếu phần tử bị kẹt `opacity: 0`, ghi lỗi nghiêm trọng (nội dung biến mất với khách). | Chưa có | Chưa chạy |
| LP11-S03-TC008 | Hiệu ứng nằm trong khung cuộn nội bộ | P2 | Phần tử hiệu ứng ở trong khối có cuộn riêng (carousel). | 1. Cuộn khối đó. | Hiệu ứng dùng đúng khung quan sát, không chạy sớm hay không chạy. | Chưa có | Chưa chạy |
| LP11-S03-TC009 | Hiệu ứng khớp giữa xem trước và công khai | P1 | Trang có hiệu ứng. | 1. Mở link xem trước (`/p/preview/<token>`) và trang công khai. | Cùng hiệu ứng, cùng thứ tự. | Chưa có | Chưa chạy |
| LP11-S03-TC010 | Ảnh hưởng đến lead form | P1 | Form có hiệu ứng. | 1. Điền và gửi form trong lúc hiệu ứng đang chạy. | Form dùng được, gửi lead thành công (LP06). Không bị che bởi `opacity: 0`. | Chưa có | Chưa chạy |

## LP11-S04. Mặc định tắt, tương thích trang cũ và hiệu năng

**Mục tiêu:** Hiệu ứng chỉ có khi chủ trang chọn; không làm hỏng trang hiện có.

**Căn cứ:** `LP_MOTION_DEFAULTS`, thông tin phiên bản triển khai `lp-motion-default1200` (thời lượng mặc định 1200 ms).

| Mã case | Tên case | Ưu tiên | Điều kiện trước và dữ liệu test | Các bước | Kết quả mong đợi | Mức phủ tự động hóa | Thực thi |
|---|---|---|---|---|---|---|---|
| LP11-S04-TC001 | Hiệu ứng mặc định tắt | P0 | Trang tạo mới và trang cũ không cấu hình motion. | 1. Mở trang công khai.<br>2. Đọc spec: có khóa motion không. | Không có hiệu ứng, không có phần tử bị `opacity: 0`. Trang cũ hiển thị như trước khi có tính năng. | Một phần: `scripts/test-landing-page-motion.cjs` kiểm: hành vi mặc định trong mã chia sẻ. Thiếu: trang công khai thật | Chưa chạy |
| LP11-S04-TC002 | Mẫu hệ thống không có hiệu ứng tự động | P1 | Tạo trang từ vài mẫu hệ thống. | 1. Mở trang công khai sau xuất bản. | Không có hiệu ứng nếu mẫu không cấu hình. Nếu mẫu có hiệu ứng thì chạy đúng như thiết kế. | Chưa có | Chưa chạy |
| LP11-S04-TC003 | Nhiều hiệu ứng cùng lúc trên Mobile | P1 | Trang có 30 phần tử có hiệu ứng, thiết bị yếu (giới hạn CPU 4x trong DevTools). | 1. Cuộn nhanh trên Mobile 390 px. | Không giật nghiêm trọng, không treo trang. Ghi lại số khung hình thấp nhất. | Chưa có | Chưa chạy |
| LP11-S04-TC004 | Hiệu ứng không gây tràn ngang trang | P0 | Hiệu ứng trượt ngang cho phần tử sát mép. | 1. Mở trang công khai ở 390 px.<br>2. Đo `scrollWidth` trước, trong và sau hiệu ứng. | `scrollWidth` không vượt chiều rộng khung nhìn ở mọi thời điểm. Xem LP12. | Chưa có | Chưa chạy |
| LP11-S04-TC005 | Phần tử có hiệu ứng vẫn bấm được | P1 | Nút CTA có hiệu ứng. | 1. Bấm ngay khi hiệu ứng đang chạy và sau khi xong. | Bấm được. Sự kiện CTA được ghi (LP06-S05). | Chưa có | Chưa chạy |
| LP11-S04-TC006 | Lỗi khi vài phần tử không tìm thấy | P2 | Cấu hình motion trỏ tới phần tử đã bị xóa. | 1. Xuất bản và mở trang. | Không lỗi console; phần tử không tồn tại bị bỏ qua (`findLpMotionNode` trả null). | Chưa có | Chưa chạy |

## Chạy lại khi nào

- Sửa `landing-page-motion.ts`: chạy S02 và `test-landing-page-motion.cjs`.
- Sửa `landing-page-motion-runtime.ts` hoặc CSS: chạy S03, S04 và `qa-landing-page-motion-*-browser.cjs`.
- Sửa giao diện chọn hiệu ứng trong builder: chạy S01.
- Sửa renderer công khai: chạy S03-TC001 và S03-TC007.
- Mọi thay đổi liên quan hiệu ứng: kiểm tra tràn ngang (S04-TC004, LP12).
