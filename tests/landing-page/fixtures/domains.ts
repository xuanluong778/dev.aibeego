/** Đầu vào tên miền → kết quả chuẩn hóa/hợp lệ thực tế của normalizeLandingCustomDomain + isValidLandingCustomDomain. */
export const DOMAIN_INPUTS: Array<{ in: string; normalized: string; valid: boolean; note?: string }> = [
  { in: 'shop.example.com', normalized: 'shop.example.com', valid: true },
  { in: '  HTTPS://Shop.Example.COM/  ', normalized: 'shop.example.com', valid: true, note: 'bỏ khoảng trắng, giao thức, đường dẫn, viết thường' },
  { in: 'www.example.vn', normalized: 'example.vn', valid: true, note: 'tiền tố www. bị bỏ' },
  { in: 'Shop.Example.com:8080/abc', normalized: 'shop.example.com', valid: true, note: 'bỏ cổng và đường dẫn' },
  { in: 'sub.domain.example.co.uk.', normalized: 'sub.domain.example.co.uk', valid: true, note: 'bỏ dấu chấm cuối' },
  { in: 'localhost', normalized: 'localhost', valid: false },
  { in: 'a.b', normalized: 'a.b', valid: false, note: 'TLD 1 ký tự' },
  { in: 'khong hop le', normalized: 'khong hop le', valid: false },
  { in: 'a..b.com', normalized: 'a..b.com', valid: false },
  { in: '-bad.example.com', normalized: '-bad.example.com', valid: false },
  { in: `${'x'.repeat(64)}.com`, normalized: `${'x'.repeat(64)}.com`, valid: false, note: 'nhãn 64 ký tự' },
  { in: 'xn--e1afmkfd.xn--p1ai', normalized: 'xn--e1afmkfd.xn--p1ai', valid: false, note: 'GHI NHẬN: tên miền punycode (IDN) bị coi là không hợp lệ — cần xác nhận có chủ đích không' },
];
/** Các tên miền nội bộ mà service chặn (SSRF): chứa "localhost" hoặc đuôi ".local" ... */
export const INTERNAL_DOMAINS = ['localhost.example.com', 'my.server.local', 'localhost'];
