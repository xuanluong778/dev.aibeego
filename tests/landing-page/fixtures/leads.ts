/** Body gửi form công khai: POST /landing-pages/public/:slug/lead (SubmitLandingPageLeadDto). */
export const VALID_LEAD = {
  fields: { name: 'Nguyễn Văn Test', phone: '0900000002', email: 'lead.valid@example.com' },
  blockId: 'p0_form',
  visitorId: 'visitor-lpt-0001',
  sessionId: 'session-lpt-0001',
  device: 'desktop',
  referrer: 'https://www.google.com/',
  attribution: { utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'lpt-campaign' },
};
export const leadWith = (over: Record<string, unknown>) => ({ ...VALID_LEAD, ...over });

/** Nhóm dữ liệu biên cho các case LP06. */
export const LEAD_CASES = {
  chiCoSdt: { fields: { name: 'Chỉ SĐT', phone: '0900000003' } },
  chiCoEmail: { fields: { name: 'Chỉ Email', email: 'only.email@example.com' } },
  thieuCaHai: { fields: { name: 'Thiếu liên hệ' } },
  honeypot: { fields: { name: 'Bot', phone: '0900000004' }, website: 'http://spam.example' },
  htmlTrongTen: { fields: { name: '<b>Tên</b><script>alert(1)</script>', phone: '0900000005' } },
  tenDai: { fields: { name: 'A'.repeat(500), phone: '0900000006' } },
  unicode: { fields: { name: 'Trần Thị Ánh Nguyệt — 😀', phone: '0900000007' } },
} as const;

/** Địa chỉ IP giả dùng để thử giới hạn tần suất (qua header X-Forwarded-For). */
export const FAKE_IPS = ['203.0.113.10', '203.0.113.11', '203.0.113.12', '198.51.100.7'] as const;

export const FAKE_EVENT = { eventType: 'PAGE_VIEW', visitorId: 'visitor-lpt-0002', sessionId: 'session-lpt-0002', device: 'mobile', utmSource: 'facebook', utmMedium: 'cpc' };

/** IP giả duy nhất cho mỗi lần gọi (gửi qua X-Forwarded-For) để các test không đụng giới hạn tần suất của nhau. */
let ipSeq = 0;
export const freshIp = () => `198.18.${Math.floor(Math.random() * 200)}.${(++ipSeq % 250) + 1}`;
/** SĐT/email giả duy nhất mỗi lần gọi (tránh bộ chống lặp 12 giây). */
let phoneSeq = 0;
export const freshPhone = () => `09${String(Date.now()).slice(-6)}${String(++phoneSeq % 100).padStart(2, '0')}`;
export const freshEmail = () => `lpt.${Date.now().toString(36)}.${++phoneSeq}@example.com`;
