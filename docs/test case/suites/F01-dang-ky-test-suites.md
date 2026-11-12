# F01: Đăng ký tài khoản (OTP email) - Test suites

Cập nhật: 11/11/2026. Flow gốc: [../flows/F01-dang-ky.md](../flows/F01-dang-ky.md).

Tài liệu này được viết sau khi đọc code thật: `apps/api/src/auth/auth.service.ts` (hàm `sendRegistrationOtp`, `resendRegistrationOtp`, `verifyRegistrationOtp`, `createRegisteredUser`), `auth.controller.ts`, `dto/register.dto.ts`, `dto/registration-otp.dto.ts` và `apps/web/src/app/(auth)/register/page.tsx`. Kết quả mong đợi bám theo code, không đoán. Chưa chạy test nào trong tài liệu này.

## 0. Phát hiện quan trọng trước khi test

| # | Phát hiện | Mức độ | Ảnh hưởng đến test |
|---|---|---|---|
| P1 | `apps/web/src/components/auth/otp-verify-form.tsx` hiện là **bản giữ chỗ**: chỉ hiển thị dòng "Form xác minh OTP tạm thời chưa khả dụng trên bản dựng này." Không có ô nhập mã, không có nút gửi lại. File này đã như vậy từ commit `bc43642` (snapshot trước khi đổi thương hiệu), không phải do thay đổi gần đây. | **Cao** | Người dùng đăng ký bằng email **không thể hoàn tất bước OTP trên giao diện**. Các TC UI bước OTP (S11-08 đến S11-12) sẽ FAIL cho đến khi có form thật. Cần xác nhận đây là cố ý hay thiếu sót. Đăng ký bằng nút Google vẫn là lối đi khác. |
| P2 | Các test tự động hiện có (`test-auth-registration-otp.ts`) **không gọi** `AuthService`. Script ghi trực tiếp bảng `registrationOtp` rồi tự kiểm tra, nên không chứng minh được `sendRegistrationOtp` hay `verifyRegistrationOtp` đúng. `test-login-rate-limit.ts` chỉ đọc mã nguồn tìm chuỗi và nói về đăng nhập, không phải gửi OTP. | Cao | Gần như toàn bộ test case dưới đây là test **mới cần viết**. Cột "Tự động hóa" ghi rõ. |
| P3 | `slug` tổ chức sinh từ tên doanh nghiệp (`slugify`). Nếu slug đã tồn tại, API trả 409 "Slug organization đã tồn tại". Hai khách hàng khác nhau có thể cùng tên doanh nghiệp; người thứ hai bị chặn mà không có cách tự chọn slug trên UI (form không có ô slug). | Trung bình | S2-05, S8-05. Cần quyết định sản phẩm. |
| P4 | `resendRegistrationOtp` kiểm tra email trùng bằng `findUnique({ email })` (không chuẩn hóa), trong khi `sendRegistrationOtp` dùng `assertEmailAvailable` (có chuẩn hóa). Hiện `normalizeEmailForUniqueness` chỉ `trim + lowercase` nên hai cách giống nhau, nhưng nếu hàm chuẩn hóa được nâng cấp thì gửi lại có thể lọt. | Thấp | S5-08 làm bảo vệ hồi quy. |
| P5 | Mô tả flow cũ ghi "tạo gói dùng thử và credit khởi tạo". Code `createRegisteredUser` chỉ tạo: tổ chức, các role mặc định, quyền, user chủ sở hữu (role OWNER), và ví credit với số dư **0**. Không thấy tạo gói dùng thử trong hàm này. | Trung bình | S6-07 theo code (ví = 0). Cần xác nhận với sản phẩm. |
| P6 | Thông báo lỗi trùng email nói "kể cả biến thể Gmail có dấu chấm hoặc +alias", nhưng hàm chuẩn hóa hiện chỉ `trim + lowercase`. | Trung bình | S2-09. |
| P7 | Endpoint cũ `POST /auth/register` tạo tài khoản trực tiếp, **không cần OTP**, và đặt luôn `emailVerifiedAt`. | Cao nếu endpoint mở ra ngoài | Suite S10. |

## 1. Quy ước chung

### 1.1 Môi trường và công cụ
- **API**: viết tắt `{API}`. Gọi bằng `curl -i -X POST {API}/auth/register/send-otp -H 'Content-Type: application/json' -d '{...}'`.
- **Lấy mã OTP khi test**: mã chỉ được lưu dạng băm SHA-256 (`codeHash`), không đọc ngược được. Có 3 cách:
  1. Môi trường không cấu hình SMTP: theo ghi chú trong `test-auth-registration-otp.ts`, `AuthMailService` ghi mã ra **log** của API (`docker logs marketingspa-api`). Cách dễ nhất.
  2. Hộp thư giả (Mailpit, MailHog) nếu có.
  3. Trong test tự động: tự tạo hàng `registrationOtp` với `codeHash = sha256(mã mình chọn)`, như script cũ đang làm.
- **Dọn dữ liệu**: dùng email dạng `f01.<mã>@example.com`. Sau test xóa theo thứ tự trong hàm `cleanupEmail` của `scripts/test-auth-registration-otp.ts` (session, token, user, ví, role permission, role, organization, registrationOtp).
- **Giới hạn tần suất lưu trong bộ nhớ** (`rateLimit`): dùng chung giữa các test. Chạy nhiều test liên tiếp từ cùng IP có thể bị chặn nhầm (15 lần gửi, 30 lần xác minh mỗi 15 phút). Cách xử lý: khởi động lại API giữa các nhóm test, hoặc chạy nhóm S4 và S7-11 trong phiên riêng.
- **Cảnh báo an toàn**: chỉ chạy trên môi trường test hoặc database thử, không chạy trên dữ liệu khách thật.

### 1.2 Hằng số lấy từ code

| Hằng | Giá trị | Ý nghĩa |
|---|---|---|
| `OTP_TTL_MS` | 5 phút (300 giây) | Hạn dùng của mã |
| `OTP_RESEND_COOLDOWN_MS` | 60 giây | Khoảng chờ tối thiểu giữa 2 lần gửi |
| `OTP_MAX_ATTEMPTS` | 5 | Số lần nhập sai tối đa cho một mã |
| `OTP_SEND_EMAIL_LIMIT` | 5 lần / 15 phút / email | Giới hạn gửi theo email |
| `OTP_SEND_IP_LIMIT` | 15 lần / 15 phút / IP | Giới hạn gửi theo IP |
| `OTP_VERIFY_IP_LIMIT` | 30 lần / 15 phút / IP | Giới hạn xác minh theo IP |
| `BCRYPT_ROUNDS` | 12 | Độ mạnh băm mật khẩu |
| Mật khẩu | 8 đến 72 ký tự | `RegisterDto.password` |
| Tên người dùng | 2 đến 100 ký tự | `RegisterDto.name` |
| Tên doanh nghiệp | 2 đến 200 ký tự | `RegisterDto.organizationName` |
| Slug | `^[a-z0-9-]+$` | `RegisterDto.organizationSlug` (tùy chọn, UI không gửi) |

### 1.3 Cột "Tự động hóa"
- **Chưa**: chưa có test tự động, cần viết. Gợi ý: script `scripts/test-auth-register-flow.ts` mới chạy thẳng `AuthService`, và Playwright cho UI.
- **Một phần**: có test nhưng chỉ kiểm dữ liệu ở mức DB, không đi qua `AuthService`/HTTP.
- **Thủ công**: kiểm bằng tay.

### 1.4 Dữ liệu mẫu hợp lệ
```json
{
  "email": "f01.demo@example.com",
  "password": "Matkhau@12345",
  "name": "Nguyễn Văn A",
  "organizationName": "Spa Hoa Sen F01"
}
```

---

## Danh sách suite

| Suite | Tên | Số TC | Loại |
|---|---|---|---|
| S1 | Kiểm tra dữ liệu đầu vào khi gửi OTP | 14 | API |
| S2 | Chống trùng email và trùng slug | 9 | API + DB |
| S3 | Gửi OTP và lưu trữ an toàn | 8 | API + DB |
| S4 | Khoảng chờ và giới hạn tần suất khi gửi | 7 | API |
| S5 | Gửi lại OTP | 9 | API + DB |
| S6 | Xác minh OTP thành công và tạo tài khoản | 12 | API + DB |
| S7 | Xác minh OTP thất bại | 11 | API + DB |
| S8 | Đồng thời, nhất quán và khôi phục lỗi | 6 | API + DB |
| S9 | Mã giới thiệu và affiliate | 6 | API + DB |
| S10 | Endpoint cũ `POST /auth/register` | 5 | API |
| S11 | Giao diện `/register` | 14 | UI |
| S12 | Bảo mật | 8 | API |
| | **Tổng** | **109** | |

---

## S1. Kiểm tra dữ liệu đầu vào khi gửi OTP

- **Mục tiêu:** `POST /auth/register/send-otp` từ chối dữ liệu sai, không tạo hàng `registrationOtp`, không gửi email.
- **Căn cứ:** `RegisterDto` (class-validator). Lỗi validation trả HTTP 400.
- **Điều kiện trước:** email dùng chưa tồn tại; API chạy.
- **Cách kiểm chung cho TC lỗi:** đếm `registrationOtp` theo email phải bằng 0 và log API không có dòng gửi mã.

| ID | Mô tả | Dữ liệu vào | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S1-01 | Dữ liệu hợp lệ đầy đủ | Dữ liệu mẫu 1.4 | Thành công (POST của Nest mặc định 201). Body có `registrationId`, `email`, `expiresInSeconds = 300`, `resendAfterSeconds = 60`, `message = "Đã gửi mã OTP tới email của bạn"` | Chưa |
| S1-02 | Thiếu `email` | bỏ trường email | 400, thông báo về email | Chưa |
| S1-03 | Email sai định dạng | `"abc"`, `"a@"`, `"a b@c.com"`, `"@c.com"` | 400 cho cả 4 giá trị | Chưa |
| S1-04 | Thiếu `password` | bỏ trường | 400 | Chưa |
| S1-05 | Mật khẩu 7 ký tự (sát ngưỡng dưới) | `"Abcde@1"` | 400 (MinLength 8) | Chưa |
| S1-06 | Mật khẩu đúng 8 ký tự (biên dưới hợp lệ) | `"Abcde@12"` | Thành công | Chưa |
| S1-07 | Mật khẩu 72 ký tự (biên trên hợp lệ) | chuỗi 72 ký tự | Thành công | Chưa |
| S1-08 | Mật khẩu 73 ký tự | chuỗi 73 ký tự | 400 (MaxLength 72, phù hợp giới hạn của bcrypt) | Chưa |
| S1-09 | `name` thiếu hoặc 1 ký tự | `""`, `"A"` | 400 (MinLength 2) | Chưa |
| S1-10 | `name` 101 ký tự | chuỗi 101 ký tự | 400 | Chưa |
| S1-11 | `organizationName` 1 ký tự hoặc 201 ký tự | `"A"`, chuỗi 201 | 400 cho cả hai | Chưa |
| S1-12 | `organizationSlug` sai mẫu | `"Spa Hoa Sen"`, `"SPA"`, `"spa_1"`, `"spa.1"` | 400, thông báo "Slug chỉ chứa chữ thường, số và dấu gạch ngang" | Chưa |
| S1-13 | Kiểu dữ liệu sai | `password: 12345678` (số), `name: ["a"]`, body rỗng `{}` | 400 | Chưa |
| S1-14 | Trường dư | thêm `"role":"SUPER_ADMIN"`, `"isPlatformAdmin":true` | Không được ảnh hưởng quyền (xem S12-03). Nếu server bật `whitelist/forbidNonWhitelisted` thì 400, nếu không thì bỏ qua trường dư. Ghi lại hành vi thực tế | Chưa |

---

## S2. Chống trùng email và trùng slug

- **Mục tiêu:** không tạo hai tài khoản cùng email, không tạo hai tổ chức cùng slug.
- **Căn cứ:** `assertEmailAvailable` tìm theo `email` hoặc `emailNormalized`, trả 409 "Email đã được sử dụng (kể cả biến thể Gmail có dấu chấm hoặc +alias).". Slug trùng trả 409 "Slug organization đã tồn tại".

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S2-01 | Email đã có tài khoản | Tạo user A (đã xong S6-01). Gọi send-otp với đúng email A | 409 "Email đã được sử dụng...". Không tạo `registrationOtp` mới | Chưa |
| S2-02 | Khác hoa thường | send-otp với `F01.DEMO@Example.com` khi `f01.demo@example.com` đã có | 409 (email được `toLowerCase`) | Chưa |
| S2-03 | Khoảng trắng đầu cuối | send-otp với `"  f01.demo@example.com  "` | `@IsEmail` có thể từ chối trước (400). Ghi lại hành vi thực tế. Không được tạo tài khoản mới | Chưa |
| S2-04 | Email có OTP chờ từ phiên khác | Gửi OTP cho email X (phiên 1, chưa xác minh). Sau 60 giây gửi lại cho X bằng send-otp (phiên 2) | Thành công. Mã phiên 1 bị vô hiệu (`invalidatedAt` có giá trị). Chỉ phiên 2 xác minh được | Chưa |
| S2-05 | Trùng slug do tên doanh nghiệp giống nhau | Đăng ký xong khách 1 với `organizationName = "Spa Hoa Sen"`. send-otp khách 2 (email khác) cùng tên | 409 "Slug organization đã tồn tại". Người dùng cuối không có cách tự đổi slug (P3) | Chưa |
| S2-06 | Tên khác nhau nhưng cùng slug | `"Spa Hoa Sen"` rồi `"SPA hoa-sen"` rồi `"Spa Hoa Sen!!!"` | Ghi lại kết quả thực tế của `slugify` với dấu tiếng Việt và ký tự đặc biệt; các tên cho cùng slug thì phải 409 | Chưa |
| S2-07 | Truyền `organizationSlug` trùng | send-otp với `organizationSlug` đã tồn tại | 409 | Chưa |
| S2-08 | Email trùng nhưng tài khoản tạo bằng Google | Có user `authProvider = GOOGLE` với email Y. send-otp với Y | 409 (không phân biệt cách đăng ký) | Chưa |
| S2-09 | Gmail dấu chấm và `+alias` (P6) | Có user `abc@gmail.com`. send-otp với `a.bc@gmail.com` và `abc+1@gmail.com` | Theo thông báo lỗi và comment trong code, **mong đợi 409**. Với hàm chuẩn hóa hiện tại (chỉ `trim + lowercase`) có thể cho qua. Nếu cho qua thì ghi nhận là lỗi sản phẩm hoặc sửa thông báo | Chưa |

---

## S3. Gửi OTP và lưu trữ an toàn

- **Mục tiêu:** gửi mã đúng định dạng, lưu an toàn, chưa tạo tài khoản ở bước này.
- **Căn cứ:** `randomInt(0, 1_000_000).padStart(6,'0')`, `codeHash = sha256(otp)`, `passwordHash = bcrypt`, hạn 5 phút.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S3-01 | Chưa tạo user/tổ chức ở bước gửi OTP | Gọi send-otp hợp lệ. Truy vấn `user`, `organization` | Không có user, không có organization mới. Có đúng 1 hàng `registrationOtp` | Chưa |
| S3-02 | Mã OTP đúng 6 chữ số | Lấy mã từ log/hộp thư giả, lặp 20 lần (đổi email) | Luôn khớp `^\d{6}$`, kể cả mã bắt đầu bằng 0 (ví dụ `004821`) | Chưa |
| S3-03 | Chỉ lưu băm của mã | Xem hàng `registrationOtp` | `codeHash` là chuỗi 64 ký tự hex và **không** chứa mã gốc | Một phần (script cũ) |
| S3-04 | Dữ liệu lưu đúng | Gửi với `name = "  Nguyễn Văn A  "` | `email` chữ thường, `name` đã trim, `organizationName` đã trim, `organizationSlug` = slug sinh ra, `expiresAt ≈ now + 5 phút`, `maxAttempts = 5`, `attemptCount = 0`, `consumedAt = null`, `invalidatedAt = null`, `ipAddress` = IP gọi | Chưa |
| S3-05 | Mật khẩu không lưu dạng rõ | Xem `passwordHash` | Bắt đầu bằng `$2` (bcrypt), `bcrypt.compare` với mật khẩu gốc là đúng | Chưa |
| S3-06 | Phản hồi API không lộ bí mật | Xem body của S1-01 | Không có trường `otp`, `codeHash`, `passwordHash` | Chưa |
| S3-07 | Email nhận đúng nội dung | Xem hộp thư giả hoặc log | Đến đúng địa chỉ, có mã 6 số, có tên người nhận, tiếng Việt không lỗi font | Thủ công |
| S3-08 | Dịch vụ email lỗi | Cấu hình SMTP sai hoặc giả lập `mail.sendRegistrationOtp` ném lỗi | API trả lỗi (không phải thành công giả). **Ghi nhận:** hàng `registrationOtp` đã tạo trước khi gửi mail, nên người dùng bị khóa cooldown 60 giây dù chưa nhận được mã. Cần xác nhận đây có phải hành vi mong muốn | Chưa |

---

## S4. Khoảng chờ và giới hạn tần suất khi gửi

- **Căn cứ:** thứ tự kiểm tra trong `sendRegistrationOtp`: email trùng, giới hạn theo email (5), giới hạn theo IP (15), slug trùng, khoảng chờ 60 giây.
- **Khuyến nghị:** chạy suite này riêng, khởi động lại API trước để bộ đếm về 0. Để khỏi chờ 60 giây thật, lùi `createdAt` của hàng OTP trong DB.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S4-01 | Gửi lần 2 trong vòng 60 giây | send-otp hợp lệ, ngay sau gửi lại cùng email | Lần 2: 400 "Vui lòng đợi Ns trước khi gửi lại OTP" với N từ 1 đến 60. Không tạo hàng mới | Chưa |
| S4-02 | Gửi lại sau 60 giây | Như S4-01 nhưng chờ hơn 60 giây (hoặc lùi `createdAt` 61 giây) | Thành công. Mã cũ bị vô hiệu, có `registrationId` mới | Chưa |
| S4-03 | Vượt 5 lần / email / 15 phút | Gọi send-otp 5 lần (lùi `createdAt` mỗi lần), lần thứ 6 | Lần 6: lỗi "Quá nhiều lần gửi OTP cho email này. Thử lại sau 15 phút." (ghi lại mã HTTP thực tế của `RateLimitService`) | Chưa |
| S4-04 | Vượt 15 lần / IP | Cùng một IP gửi cho 16 email khác nhau | Lần 16: "Quá nhiều lần gửi OTP từ IP này. Thử lại sau." | Chưa |
| S4-05 | Giới hạn độc lập giữa các email | Email A đã chạm giới hạn. Gửi cho email B từ IP khác | B vẫn gửi được | Chưa |
| S4-06 | Cooldown tính theo email | Gửi cho X, rồi gửi X với tên doanh nghiệp khác trong 60 giây | 400 "Vui lòng đợi..." | Chưa |
| S4-07 | Lần bị từ chối do cooldown có tính vào bộ đếm không | Bấm gửi liên tiếp 6 lần trong 60 giây | Theo thứ tự code, kiểm giới hạn email chạy **trước** kiểm cooldown. Nếu `assertWithinLimit` đếm mọi lần gọi thì người bấm nhanh có thể tự khóa 15 phút. Ghi lại hành vi thực tế và xác nhận có chủ ý | Chưa |

---

## S5. Gửi lại OTP

- **Căn cứ:** `POST /auth/register/resend-otp { registrationId }`.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S5-01 | Gửi lại hợp lệ sau 60 giây | send-otp, chờ/lùi 61 giây, resend-otp với `registrationId` | `message = "Đã gửi lại mã OTP"`, trả `registrationId` **mới** (khác id cũ), `email` đúng | Chưa |
| S5-02 | Mã cũ bị vô hiệu | Sau S5-01, verify bằng mã cũ với `registrationId` cũ | 400 "Phiên đăng ký không hợp lệ. Vui lòng đăng ký lại." | Một phần (script cũ ở mức DB) |
| S5-03 | Mã mới dùng được | Sau S5-01, verify mã mới với `registrationId` mới | Thành công (như S6) | Chưa |
| S5-04 | Gửi lại trong vòng 60 giây | resend-otp ngay sau send-otp | 400 "Vui lòng đợi Ns trước khi gửi lại OTP" | Chưa |
| S5-05 | `registrationId` không tồn tại | `registrationId = "khong-co"` | 400 "Phiên đăng ký không hợp lệ. Vui lòng đăng ký lại." | Chưa |
| S5-06 | Phiên đã dùng hoặc đã vô hiệu | resend với id của hàng đã `consumedAt` hoặc `invalidatedAt` | 400 như S5-05 | Chưa |
| S5-07 | Phiên đã hết hạn | Lùi `expiresAt` về quá khứ rồi resend | 400 "Mã OTP đã hết hạn. Vui lòng đăng ký lại." | Chưa |
| S5-08 | Email đã được đăng ký trong lúc chờ (P4) | send-otp cho X. Tạo user X bằng đường khác (Google). Resend | 409 "Email đã được sử dụng" | Chưa |
| S5-09 | Giữ nguyên dữ liệu đăng ký và mã giới thiệu | send-otp với `referralCode = "abc123"`. Resend | Hàng mới giữ `name`, `organizationName`, `organizationSlug`, `passwordHash`, `referralCode = "ABC123"` | Chưa |

---

## S6. Xác minh OTP thành công và tạo tài khoản

- **Căn cứ:** `verifyRegistrationOtp` gọi `createRegisteredUser` trong một giao dịch, rồi `issueTokens`, ghi audit, khóa referral, tạo hồ sơ affiliate.
- **Điều kiện trước:** có `registrationId` và mã đúng từ send-otp.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S6-01 | Xác minh đúng | `POST /auth/register/verify-otp { registrationId, otp }` | Thành công. Body có token truy cập và `user`; **không** có `refreshToken` trong body | Chưa |
| S6-02 | Refresh token ở cookie | Xem header phản hồi S6-01 | Có `Set-Cookie: ms_refresh_token=...` với `HttpOnly`. Ở HTTPS có `Secure`. Ghi lại `SameSite`, `Path` thực tế | Chưa |
| S6-03 | Tạo tổ chức | Truy vấn `organization` theo slug | 1 tổ chức với `name`, `slug`, `email` đúng | Chưa |
| S6-04 | Tạo role mặc định | Truy vấn `role` của tổ chức | Đủ các role trong `DEFAULT_ROLE_SEEDS`, đều `isSystem = true` | Chưa |
| S6-05 | Phân quyền cho role | Truy vấn `rolePermission` | Mỗi role có quyền theo `defaultPermissionCodesForRole`; OWNER có quyền rộng nhất | Chưa |
| S6-06 | User là chủ sở hữu | Truy vấn user | `role.code = OWNER`, `authProvider = LOCAL`, `organizationId` đúng, `emailVerifiedAt` có giá trị, `emailNormalized` đúng | Chưa |
| S6-07 | Ví credit khởi tạo (P5) | Truy vấn `creditWallet` | 1 ví, `balance = 0` | Chưa |
| S6-08 | Đăng nhập được bằng mật khẩu đã đăng ký | `POST /auth/login` với email và mật khẩu lúc đăng ký | Thành công. Chứng minh mật khẩu **không bị băm hai lần** | Chưa |
| S6-09 | Token dùng được | Gọi endpoint lấy thông tin người dùng hiện tại với token vừa nhận | 200, đúng user, đúng tổ chức | Chưa |
| S6-10 | Đánh dấu OTP đã dùng | Xem hàng `registrationOtp` | `consumedAt` có giá trị | Một phần (script cũ) |
| S6-11 | Nhật ký kiểm toán | Truy vấn `auditLog` | Có bản ghi `AUTH_REGISTER_OTP_VERIFIED`, `entityType = USER`, `entityId = user.id`, `ipAddress` đúng | Chưa |
| S6-12 | Tài khoản mới chỉ thấy dữ liệu của mình | Với token mới, gọi danh sách landing page, khách hàng | Rỗng, không thấy dữ liệu tổ chức khác | Chưa |

---

## S7. Xác minh OTP thất bại

- **Căn cứ:** thứ tự kiểm trong `verifyRegistrationOtp`: giới hạn IP, tồn tại/vô hiệu, đã dùng, hết hạn, hết lượt thử, đúng/sai mã.
- **Kết luận chung cho mọi TC lỗi:** không tạo user, không tạo tổ chức, không cấp token, không đặt cookie.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S7-01 | Sai mã lần đầu | verify với mã chắc chắn khác mã thật | 400 "Mã OTP không đúng. Còn 4 lần thử." `attemptCount = 1` | Một phần (script cũ đếm ở DB) |
| S7-02 | Sai liên tiếp 5 lần | Sai 5 lần | Lần 2 còn 3, lần 3 còn 2, lần 4 còn 1. Lần 5: 400 "Đã nhập sai quá số lần cho phép. Vui lòng đăng ký lại." Hàng bị `invalidatedAt` | Chưa |
| S7-03 | Đúng mã sau khi hết lượt | Sau S7-02 nhập mã **đúng** | 400 "Phiên đăng ký không hợp lệ. Vui lòng đăng ký lại." | Chưa |
| S7-04 | Đúng mã ở lần thử thứ 5 | Sai 4 lần rồi nhập đúng | Thành công (`attemptCount 4 < maxAttempts 5`) | Chưa |
| S7-05 | Mã hết hạn | Lùi `expiresAt` về quá khứ, verify mã đúng | 400 "Mã OTP đã hết hạn. Vui lòng gửi lại mã." Hàng bị `invalidatedAt` | Một phần (script cũ) |
| S7-06 | Biên hết hạn | Đặt `expiresAt = now + 3 giây`, verify ngay, rồi verify lại sau 4 giây | Lần đầu thành công, lần sau hết hạn. Nên dùng đồng hồ giả để test ổn định | Chưa |
| S7-07 | Dùng lại mã đã dùng | Sau S6-01, verify lại cùng `registrationId` và mã | 400 "Mã OTP đã được sử dụng" | Một phần (script cũ) |
| S7-08 | `registrationId` không tồn tại | id bất kỳ | 400 "Phiên đăng ký không hợp lệ. Vui lòng đăng ký lại." | Chưa |
| S7-09 | Mã định dạng lạ | `"abcdef"`, `"12345"`, `"1234567"`, `"  123456  "`, `""` | Chuỗi rỗng: 400 do `MinLength(1)`. Các giá trị còn lại coi là sai mã (400, tăng `attemptCount`). Ghi lại nếu `"  123456  "` bị từ chối (code không trim) | Chưa |
| S7-10 | Thiếu trường | Body thiếu `otp` hoặc `registrationId` | 400 do validation | Chưa |
| S7-11 | Vượt 30 lần xác minh / IP / 15 phút | Gọi verify 31 lần từ cùng IP | Lần 31: "Quá nhiều lần xác minh OTP. Thử lại sau." | Chưa |

---

## S8. Đồng thời, nhất quán và khôi phục lỗi

- **Căn cứ:** `updateMany({ consumedAt: null, invalidatedAt: null })` để giành quyền dùng một lần; rollback khi tạo user lỗi.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S8-01 | Bấm xác minh hai lần cùng lúc | Gửi 2 yêu cầu verify đồng thời với cùng mã đúng | Đúng **một** thành công. Yêu cầu kia 400 "Mã OTP đã được sử dụng" (hoặc 409 trùng email). Chỉ **1 user**, **1 tổ chức** | Chưa |
| S8-02 | Hai phiên cùng email | Phiên 1 và 2 cùng gửi OTP cho X (mã 2 vô hiệu mã 1). Verify cả hai đồng thời | Chỉ phiên hợp lệ thành công; không có hai user cùng email | Chưa |
| S8-03 | Tạo user lỗi giữa chừng | Giả lập `createRegisteredUser` ném lỗi | Giao dịch quay lui, không còn tổ chức/role dở dang. Hàng OTP: `consumedAt = null`, `invalidatedAt` có giá trị, nên phải đăng ký lại | Chưa |
| S8-04 | Email bị chiếm trong lúc chờ OTP | send-otp cho X. Tạo user X bằng Google. Verify mã đúng | 409 "Email đã được sử dụng". Hàng OTP bị `invalidatedAt`. Không tạo tổ chức | Chưa |
| S8-05 | Slug bị chiếm trong lúc chờ OTP | send-otp. Tạo tổ chức cùng slug. Verify | 409 "Slug organization đã tồn tại". Lỗi này ném **trước** khi đánh dấu consumed nên hàng OTP chưa bị vô hiệu; người dùng không thể đổi slug (P3) | Chưa |
| S8-06 | Lỗi ở bước phụ không làm hỏng đăng ký | Giả lập `lockReferralBestEffort` hoặc `ensureAffiliateProfileBestEffort` ném lỗi | Đăng ký vẫn thành công và vẫn nhận token (hai hàm "best effort") | Chưa |

---

## S9. Mã giới thiệu và affiliate

- **Căn cứ:** `send-otp` lưu mã đã viết hoa vào hàng OTP; `verify` ưu tiên mã trong OTP, chỉ dùng cookie/header khi OTP thiếu mã.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S9-01 | Mã giới thiệu qua body | send-otp với `referralCode = "abc123"` (mã tồn tại), verify | Hàng OTP lưu `ABC123`. Sau verify, tổ chức mới được gắn người giới thiệu | Chưa |
| S9-02 | Mã giới thiệu qua cookie | send-otp có cookie giới thiệu, body không có mã | Hàng OTP lưu mã từ cookie | Chưa |
| S9-03 | Mã không tồn tại | `referralCode = "KHONGCO"` | Đăng ký vẫn thành công, không gắn người giới thiệu, không lỗi | Chưa |
| S9-04 | Không tự giới thiệu chính mình | Dùng mã của chính tài khoản (nếu có thể) | Không tạo hoa hồng cho chính mình | Chưa |
| S9-05 | Mã chốt lúc gửi OTP | send-otp với mã A. Trước khi verify, đổi cookie sang mã B | Dùng mã A | Chưa |
| S9-06 | Hồ sơ affiliate được tạo | Sau S6-01 | Có hồ sơ/mã affiliate cho tổ chức mới, không cần vào trang `/affiliate` | Chưa (xem `test-affiliate-signup-stats.ts`, chưa mở đọc) |

---

## S10. Endpoint cũ `POST /auth/register`

- **Căn cứ:** comment trong code: "Giữ endpoint cũ cho tương thích nội bộ/test - tạo user trực tiếp". UI không dùng. Xem P7.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S10-01 | Gọi trực tiếp | `POST /auth/register` với dữ liệu mẫu | Theo code: thành công, tạo ngay user + tổ chức + token, **không cần OTP**. Cần xác nhận đây có mong muốn | Chưa |
| S10-02 | Bỏ qua xác minh email | Thực hiện S10-01 với email không có thật | Nếu thành công: tài khoản chưa xác minh email nhưng `emailVerifiedAt` vẫn được đặt. **Đánh dấu rủi ro lạm dụng**, đề xuất khóa ở production hoặc bắt buộc OTP | Chưa |
| S10-03 | Trùng email | Gọi lại với email đã dùng | 409 | Chưa |
| S10-04 | Trùng slug | Cùng `organizationName` với tổ chức đã có | 409 "Slug organization đã tồn tại" | Chưa |
| S10-05 | Truy cập qua domain công khai | Gọi từ bên ngoài qua domain | Ghi lại: truy cập được hay bị chặn. Nếu công khai thì liên quan S10-02 | Thủ công |

---

## S11. Giao diện `/register`

- **Căn cứ:** `apps/web/src/app/(auth)/register/page.tsx`. Hai bước: `form` và `otp`. Có nút Google. Sau thành công `router.replace('/overview')`.
- **Công cụ gợi ý:** Playwright, viewport 1366x768 và 390x844. Chặn API bằng `page.route` khi cần.
- **Cảnh báo:** S11-08 đến S11-12 phụ thuộc `OtpVerifyForm` thật (P1). Hiện component là bản giữ chỗ nên các TC này **FAIL do thiếu tính năng**, không phải hồi quy.

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S11-01 | Hiển thị form | Mở `/register` | Có tiêu đề, nút Google, dải "hoặc email", 4 ô: tên doanh nghiệp (`#org`), họ tên (`#name`), email (`#email`), mật khẩu (`#password`), nút đăng ký, link sang `/login` | Chưa |
| S11-02 | Trường bắt buộc | Bấm đăng ký khi để trống | Trình duyệt chặn bằng `required`, không gọi API | Chưa |
| S11-03 | Email sai định dạng | Nhập `abc` | Trình duyệt chặn (`type=email`), không gọi API | Chưa |
| S11-04 | Mật khẩu ngắn | Nhập 7 ký tự | Trình duyệt chặn (`minLength=8`), không gọi API | Chưa |
| S11-05 | Gửi thành công chuyển sang bước OTP | Điền đúng, bấm đăng ký | Nút đổi thành "đang gửi OTP" và bị vô hiệu lúc chờ. Sau đó tiêu đề đổi sang "Xác minh email" và hiện bước OTP | Chưa |
| S11-06 | Lỗi từ API hiển thị | Dùng email đã tồn tại | Hiện thông báo lỗi 409 trên form, ở lại bước form, bấm lại được | Chưa |
| S11-07 | Mất mạng khi gửi OTP | Chặn request `send-otp` | Hiện lỗi, không kẹt "đang gửi", dữ liệu đã nhập không mất | Chưa |
| S11-08 | Bước OTP có ô nhập mã | Sau S11-05 | Có ô nhập 6 số, nút xác minh, nút gửi lại, nút quay lại. **Hiện FAIL (P1)** | Chưa |
| S11-09 | Xác minh đúng | Nhập mã đúng | Chuyển `/overview`, đã đăng nhập | Chưa |
| S11-10 | Xác minh sai | Nhập mã sai | Hiện "Mã OTP không đúng. Còn N lần thử.", ở lại bước OTP | Chưa |
| S11-11 | Nút gửi lại và đếm ngược | Quan sát sau khi vào bước OTP | Nút gửi lại khóa theo `resendAfterSeconds` (60 giây), sau đó bấm được. Gửi xong đếm lại và xóa lỗi cũ | Chưa |
| S11-12 | Nút quay lại | Ở bước OTP bấm quay lại | Về form, lỗi cũ được xóa. Ghi lại dữ liệu form còn hay mất | Chưa |
| S11-13 | Đăng ký bằng Google | Bấm nút Google (cần Client ID và tài khoản Google thật) | Chuyển `/overview` sau khi xác thực. Liên quan `test-auth-google.ts` | Một phần |
| S11-14 | Giao diện và đa ngôn ngữ | Xem ở 390x844, chuyển tiếng Việt và tiếng Anh | Không tràn ngang, không vỡ bố cục, không hiện khóa i18n thô (ví dụ `auth.register`), tiếng Việt đủ dấu | Thủ công |

---

## S12. Bảo mật

| ID | Mô tả | Các bước | Kết quả mong đợi | Tự động hóa |
|---|---|---|---|---|
| S12-01 | Mã OTP không đoán trước được | Xem mã nguồn, và sinh nhiều mã để quan sát | Code dùng `randomInt` của `crypto` (đạt). Phân bố không lệch rõ rệt | Chưa |
| S12-02 | Brute-force OTP | Đoán nhiều lần (S7-02, S7-11) | Bị chặn sau 5 lần/mã và 30 lần/IP. Xác suất đoán trúng tối đa 5/1.000.000 mỗi mã | Chưa |
| S12-03 | Không leo thang quyền qua dữ liệu thừa | Gửi thêm `"roleId"`, `"role":"SUPER_ADMIN"`, `"platformRole":"SUPER_ADMIN"`, `"organizationId":"<id khác>"` trong send-otp | Sau verify, user là OWNER của tổ chức **mới**, không phải SUPER_ADMIN, không thuộc tổ chức khác | Chưa |
| S12-04 | Dò tài khoản (account enumeration) | So sánh phản hồi khi email đã tồn tại và chưa tồn tại | API trả 409 xác nhận email tồn tại, tức là cho phép dò email. Ghi nhận là đánh đổi UX/bảo mật đã chấp nhận hay cần che | Chưa |
| S12-05 | Chèn mã độc vào tên | `name` và `organizationName` là `<script>alert(1)</script>` và `' OR 1=1 --` | Lưu như chuỗi thường. Khi hiển thị ở UI và trong email OTP phải được thoát (escape), không chạy script | Chưa |
| S12-06 | Slug từ tên bất thường | `organizationName = "../../etc"`, `"a/b"`, `"!!!"`, ký tự Unicode lạ | `slugify` cho slug an toàn khớp `^[a-z0-9-]+$` hoặc từ chối. Ghi lại kết quả với tên toàn ký tự đặc biệt vì slug có thể thành chuỗi rỗng | Chưa |
| S12-07 | Cookie refresh an toàn | Xem S6-02 trên HTTPS thật | `HttpOnly`, `Secure`, phạm vi đường dẫn hợp lý | Chưa |
| S12-08 | Không ghi mật khẩu/OTP vào log | Quan sát log API sau một lần đăng ký | Log không chứa mật khẩu. Mã OTP chỉ được ghi ở môi trường test không có SMTP, **không** được ghi ở production | Thủ công |

---

## 2. Thứ tự ưu tiên khi chạy

1. **Smoke (khoảng 5 phút):** S1-01, S6-01, S6-08, S6-09, S7-01, S11-05. Đủ để biết đường đăng ký chính còn sống.
2. **Cốt lõi (P0):** toàn bộ S1, S2, S3, S5, S6, S7.
3. **Độ bền (P1):** S4, S8, S9.
4. **Rủi ro và giao diện (P1/P2):** S10, S11, S12.

## 3. Trạng thái tự động hóa hiện tại

| Nội dung | Số TC | Ghi chú |
|---|---|---|
| Test tự động đúng nghĩa (đi qua `AuthService`/HTTP) | 0 | Xem P2 |
| Một phần (chỉ ở mức DB, hoặc phần Google) | 7 | S3-03, S5-02, S6-10, S7-01, S7-05, S7-07, S11-13 |
| Chưa có | 102 | Cần viết mới (S9-06 có thể được `test-affiliate-signup-stats.ts` phủ một phần, chưa mở đọc) |

**Đề xuất thứ tự viết test:** (1) script chạy thẳng `AuthService` với database thử cho S1, S2, S5, S6, S7, S8; (2) Playwright cho S11 sau khi có form OTP thật; (3) S4 chạy trong phiên riêng để không ảnh hưởng test khác.

## 4. Việc cần chủ sản phẩm quyết định

1. Form OTP trên giao diện đang là bản giữ chỗ (P1): cố ý tạm tắt hay cần làm lại?
2. Có khóa endpoint cũ `POST /auth/register` ở production không (S10, P7)?
3. Người dùng trùng tên doanh nghiệp bị chặn (P3): tự thêm hậu tố hay giữ nguyên?
4. Tặng credit hoặc gói dùng thử khi đăng ký (P5): hiện ví bắt đầu 0, có nơi nào khác cấp không?
5. Thông báo "kể cả biến thể Gmail" không khớp hàm chuẩn hóa (P6): sửa thông báo hay nâng cấp hàm chuẩn hóa?
