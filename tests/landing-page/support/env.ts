/**
 * Cấu hình môi trường cho bộ test Landing Page. Mọi giá trị đọc từ biến môi trường,
 * KHÔNG có mặc định trỏ vào môi trường thật.
 *
 *  LP_API_BASE        vd http://127.0.0.1:4000/api/v1   (bật nhóm test API)
 *  LP_WEB_BASE        vd http://127.0.0.1:3000          (bật nhóm test giao diện)
 *  LP_ALLOW_REMOTE=1  cho phép host khác localhost (mặc định chặn để không ghi dữ liệu test lên production)
 *  LP_ORG_A_OWNER_EMAIL / LP_ORG_A_OWNER_PASSWORD     tổ chức A, đủ lead.read + lead.write
 *  LP_ORG_A_VIEWER_EMAIL / LP_ORG_A_VIEWER_PASSWORD   tổ chức A, chỉ lead.read
 *  LP_ORG_B_OWNER_EMAIL / LP_ORG_B_OWNER_PASSWORD     tổ chức B
 *  LP_SUPER_ADMIN_EMAIL / LP_SUPER_ADMIN_PASSWORD     quản trị nền tảng
 *  LP_TRACE=0         tắt in dữ liệu vào/ra (mặc định bật)
 */
export const env = {
  apiBase: (process.env.LP_API_BASE || '').replace(/\/$/, ''),
  webBase: (process.env.LP_WEB_BASE || '').replace(/\/$/, ''),
  allowRemote: process.env.LP_ALLOW_REMOTE === '1',
  trace: process.env.LP_TRACE !== '0',
  traceFile: process.env.LP_TRACE_FILE || '',
};

export type AccountKey = 'ORG_A_OWNER' | 'ORG_A_VIEWER' | 'ORG_B_OWNER' | 'SUPER_ADMIN';

export function credentialsOf(key: AccountKey): { email: string; password: string } | null {
  const email = process.env[`LP_${key}_EMAIL`];
  const password = process.env[`LP_${key}_PASSWORD`];
  return email && password ? { email, password } : null;
}

function isLocal(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local');
  } catch {
    return false;
  }
}

/** Lý do bỏ qua nhóm API; null = chạy được. */
export function apiSkipReason(accounts: AccountKey[] = []): string | null {
  if (!env.apiBase) return 'chưa đặt LP_API_BASE (cần stack test riêng)';
  if (!isLocal(env.apiBase) && !env.allowRemote)
    return `LP_API_BASE (${env.apiBase}) không phải localhost; đặt LP_ALLOW_REMOTE=1 nếu chắc chắn là môi trường test`;
  for (const a of accounts) if (!credentialsOf(a)) return `thiếu LP_${a}_EMAIL / LP_${a}_PASSWORD`;
  return null;
}

export function webSkipReason(): string | null {
  if (!env.webBase) return 'chưa đặt LP_WEB_BASE';
  if (!isLocal(env.webBase) && !env.allowRemote) return `LP_WEB_BASE (${env.webBase}) không phải localhost`;
  return null;
}
