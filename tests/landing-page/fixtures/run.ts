/** Định danh của một lần chạy. Mọi dữ liệu tạo ra mang tiền tố này để dọn dẹp và truy vết. */
const d = new Date();
const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
export const RUN_ID = process.env.LP_RUN_ID || `LPT-${ymd}-${Math.random().toString(36).slice(2, 6)}`;
let seq = 0;
/** Tên duy nhất trong lần chạy: uniq('SMOKE') -> "SMOKE LPT-20261111-ab12-3" */
export const uniq = (prefix: string) => `${prefix} ${RUN_ID}-${++seq}`;
/** Slug hợp lệ (a-z0-9-, <=80 ký tự). */
export const uniqSlug = (prefix: string) => `${prefix}-${RUN_ID}-${++seq}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80);
