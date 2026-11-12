import { credentialsOf, env, type AccountKey } from './env';
import { actual, sent } from './trace';

export interface ApiResult<T = any> {
  status: number;
  body: T;
  headers: Headers;
}

export interface RequestOpts {
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  /** không in dữ liệu (dùng cho login) */
  quiet?: boolean;
}

const tokens = new Map<AccountKey, string>();

export async function api<T = any>(method: string, path: string, opts: RequestOpts = {}): Promise<ApiResult<T>> {
  const url = new URL(env.apiBase + path);
  for (const [k, v] of Object.entries(opts.query || {})) if (v !== undefined) url.searchParams.set(k, String(v));
  const headers: Record<string, string> = { Accept: 'application/json', ...(opts.headers || {}) };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (!opts.quiet) sent(`${method} ${url.pathname}${url.search}`, { headers, body: opts.body });
  const res = await fetch(url, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) });
  const text = await res.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* giữ nguyên text */
  }
  if (!opts.quiet) actual(`HTTP ${res.status}`, body);
  return { status: res.status, body, headers: res.headers };
}

/** Đăng nhập một tài khoản test (cache token trong tiến trình). */
export async function loginAs(key: AccountKey): Promise<string> {
  const cached = tokens.get(key);
  if (cached) return cached;
  const cred = credentialsOf(key);
  if (!cred) throw new Error(`Thiếu LP_${key}_EMAIL / LP_${key}_PASSWORD`);
  const r = await api('POST', '/auth/login', { body: cred, quiet: true });
  const token = r.body?.accessToken || r.body?.access_token || r.body?.token;
  if (r.status >= 300 || !token) throw new Error(`Đăng nhập ${key} thất bại: HTTP ${r.status}`);
  tokens.set(key, token);
  return token;
}

/** Client gắn sẵn token của một tài khoản. */
export async function as(key: AccountKey) {
  const token = await loginAs(key);
  return {
    token,
    get: <T = any>(p: string, o: RequestOpts = {}) => api<T>('GET', p, { ...o, token }),
    post: <T = any>(p: string, body?: unknown, o: RequestOpts = {}) => api<T>('POST', p, { ...o, body, token }),
    patch: <T = any>(p: string, body?: unknown, o: RequestOpts = {}) => api<T>('PATCH', p, { ...o, body, token }),
    del: <T = any>(p: string, o: RequestOpts = {}) => api<T>('DELETE', p, { ...o, token }),
  };
}

/** Gọi route công khai (không token). */
export const pub = {
  get: <T = any>(p: string, o: RequestOpts = {}) => api<T>('GET', p, o),
  post: <T = any>(p: string, body?: unknown, o: RequestOpts = {}) => api<T>('POST', p, { ...o, body }),
};
