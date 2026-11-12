import { describe, it } from 'node:test';
import { apiSkipReason, webSkipReason, type AccountKey } from './env';
import { setCurrentCase } from './trace';

export type Prio = 'P0' | 'P1' | 'P2';
export type Layer = 'unit' | 'api' | 'e2e';
type Fn = () => void | Promise<void>;

/** Một suite = một nhóm hành vi (khớp "Suite" trong file test-suites.md). */
export function suite(id: string, title: string, fn: () => void) {
  describe(`${id} ${title}`, fn);
}

export interface CaseMeta {
  prio: Prio;
  layer: Layer;
  /** tài khoản cần có (chỉ với layer api) */
  accounts?: AccountKey[];
  smoke?: string;
  /** biến thể: ghi chú lý do bỏ qua tạm thời */
  skip?: string;
}

/** Case đã có code chạy thật. */
export function tc(id: string, name: string, meta: CaseMeta, fn: Fn) {
  const title = `${id} [${meta.prio}] ${meta.smoke ? `[${meta.smoke}] ` : ''}${name}`;
  let skip: string | false = meta.skip || false;
  if (!skip && meta.layer === 'api') skip = apiSkipReason(meta.accounts) || false;
  if (!skip && meta.layer === 'e2e') skip = webSkipReason() || apiSkipReason(meta.accounts) || false;
  it(title, { skip: skip || undefined }, async () => {
    setCurrentCase(id);
    process.stdout.write(`    ┏━━ ${id}\n`);
    await fn();
  });
}

/** Case chưa tự động hóa: giữ mã để không mất dấu vết, kèm lý do. */
export function todo(id: string, name: string, meta: { prio: Prio; why: string }) {
  it.todo(`${id} [${meta.prio}] ${name}  — chưa tự động hóa: ${meta.why}`);
}
