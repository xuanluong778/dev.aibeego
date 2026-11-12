/**
 * Tài khoản test. Mật khẩu KHÔNG nằm trong mã nguồn: lấy từ biến môi trường (xem support/env.ts).
 * Bảng dưới là "dữ liệu hệ thống truyền vào" khi đăng nhập: POST /auth/login { email, password }.
 */
export const ACCOUNTS = {
  ORG_A_OWNER: { role: 'Chủ tổ chức A', permissions: ['lead.read', 'lead.write'], env: 'LP_ORG_A_OWNER_EMAIL / LP_ORG_A_OWNER_PASSWORD' },
  ORG_A_VIEWER: { role: 'Thành viên A chỉ xem', permissions: ['lead.read'], env: 'LP_ORG_A_VIEWER_EMAIL / LP_ORG_A_VIEWER_PASSWORD' },
  ORG_B_OWNER: { role: 'Chủ tổ chức B (kiểm tra tách dữ liệu)', permissions: ['lead.read', 'lead.write'], env: 'LP_ORG_B_OWNER_EMAIL / LP_ORG_B_OWNER_PASSWORD' },
  SUPER_ADMIN: { role: 'Quản trị nền tảng', permissions: ['platform:SUPER_ADMIN'], env: 'LP_SUPER_ADMIN_EMAIL / LP_SUPER_ADMIN_PASSWORD' },
} as const;
