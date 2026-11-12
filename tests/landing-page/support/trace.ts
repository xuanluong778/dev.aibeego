import { appendFileSync } from 'node:fs';
import { env } from './env';

/**
 * In ra dữ liệu của test để người đọc thấy rõ:
 *  FAKE   = dữ liệu giả do bộ test tự tạo (fixture)
 *  SYSTEM = dữ liệu/yêu cầu mà bộ test gửi vào hệ thống (HTTP request, tham số hàm)
 *  ACTUAL = kết quả thực tế hệ thống trả về
 *  EXPECT = giá trị mong đợi
 */
export type TraceKind = 'FAKE' | 'SYSTEM' | 'ACTUAL' | 'EXPECT';

const SECRET = /password|authorization|token|secret/i;
function redact(_k: string, v: unknown): unknown {
  return typeof v === 'string' && v.length > 600 ? `${v.slice(0, 600)}…(${v.length} ký tự)` : v;
}
function safe(value: unknown): string {
  return JSON.stringify(
    value,
    (k, v) => (SECRET.test(k) && typeof v === 'string' ? '***' : redact(k, v)),
    2,
  ) as string;
}

let current = '';
export function setCurrentCase(id: string) {
  current = id;
}

export function show(kind: TraceKind, label: string, value?: unknown) {
  const body = value === undefined ? '' : ` ${safe(value)}`;
  if (env.trace) process.stdout.write(`    ┃ [${kind}] ${label}:${body.includes('\n') ? '\n' : ''}${body.replace(/^/gm, body.includes('\n') ? '      ' : '')}\n`);
  if (env.traceFile) {
    try {
      appendFileSync(env.traceFile, JSON.stringify({ case: current, kind, label, value: value === undefined ? null : JSON.parse(safe(value)) }) + '\n');
    } catch {
      /* không để việc ghi log làm hỏng test */
    }
  }
}
export const fake = (label: string, v?: unknown) => show('FAKE', label, v);
export const sent = (label: string, v?: unknown) => show('SYSTEM', label, v);
export const actual = (label: string, v?: unknown) => show('ACTUAL', label, v);
export const expected = (label: string, v?: unknown) => show('EXPECT', label, v);
