/**
 * SSRF-safe public HTTP(S) fetch for Landing Page crawl / ad URL analyze.
 * - Manual redirects only; each hop re-validated (URL + DNS + IP).
 * - Blocks localhost, private/link-local/metadata, non-HTTP(S).
 * - Resolves A/AAAA before connect; pins TCP to a validated public IP (anti DNS-rebinding).
 */
import { lookup as defaultDnsLookup } from 'dns/promises';
import * as http from 'http';
import * as https from 'https';
import { isIP } from 'net';
import {
  AD_URL_ANALYZE_LIMITS,
  detectUnsupportedCommerceHost,
} from './ad-url-analyze';

export class SsrfValidationError extends Error {
  code: string;
  constructor(message: string, code = 'SSRF_BLOCKED') {
    super(message);
    this.name = 'SsrfValidationError';
    this.code = code;
  }
}

export class FetchPublicError extends Error {
  code: string;
  constructor(message: string, code = 'FETCH_FAILED') {
    super(message);
    this.name = 'FetchPublicError';
    this.code = code;
  }
}

type DnsLookupFn = typeof defaultDnsLookup;
let dnsLookupImpl: DnsLookupFn = defaultDnsLookup;

/** Test-only: inject DNS resolver (DNS rebind / TOCTOU gates). */
export function __setDnsLookupForTests(fn: DnsLookupFn | null): void {
  dnsLookupImpl = fn ?? defaultDnsLookup;
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function parseIpv4MappedV6(lower: string): string | null {
  const dotted = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted?.[1]) return dotted[1];
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (hex?.[1] && hex[2]) {
    const a = parseInt(hex[1], 16);
    const b = parseInt(hex[2], 16);
    return `${(a >> 8) & 255}.${a & 255}.${(b >> 8) & 255}.${b & 255}`;
  }
  return null;
}

function ipv6FirstHextet(ip: string): number | null {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (lower === '::' || lower === '::1') return lower === '::1' ? 0 : 0;
  if (lower.startsWith('::')) return 0;
  const first = lower.split(':')[0];
  if (!first || !/^[0-9a-f]+$/i.test(first)) return null;
  return parseInt(first, 16);
}

/**
 * True for private, loopback, link-local, ULA, multicast, docs, CGNAT, metadata-ish ranges.
 * Exported for security gate tests.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const raw = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');
  const v = isIP(raw);
  if (v === 4) {
    const n = ipv4ToInt(raw);
    const ranges: Array<[number, number]> = [
      [ipv4ToInt('0.0.0.0'), ipv4ToInt('0.255.255.255')],
      [ipv4ToInt('10.0.0.0'), ipv4ToInt('10.255.255.255')],
      [ipv4ToInt('127.0.0.0'), ipv4ToInt('127.255.255.255')],
      [ipv4ToInt('169.254.0.0'), ipv4ToInt('169.254.255.255')],
      [ipv4ToInt('172.16.0.0'), ipv4ToInt('172.31.255.255')],
      [ipv4ToInt('192.168.0.0'), ipv4ToInt('192.168.255.255')],
      [ipv4ToInt('100.64.0.0'), ipv4ToInt('100.127.255.255')],
      [ipv4ToInt('192.0.0.0'), ipv4ToInt('192.0.0.255')],
      [ipv4ToInt('192.0.2.0'), ipv4ToInt('192.0.2.255')],
      [ipv4ToInt('198.18.0.0'), ipv4ToInt('198.19.255.255')],
      [ipv4ToInt('198.51.100.0'), ipv4ToInt('198.51.100.255')],
      [ipv4ToInt('203.0.113.0'), ipv4ToInt('203.0.113.255')],
      [ipv4ToInt('224.0.0.0'), ipv4ToInt('255.255.255.255')],
    ];
    return ranges.some(([a, b]) => n >= a && n <= b);
  }
  if (v === 6) {
    if (raw === '::1' || raw === '::') return true;
    const mapped = parseIpv4MappedV6(raw);
    if (mapped) return isPrivateOrReservedIp(mapped);
    const hextet = ipv6FirstHextet(raw);
    if (hextet === null) return true;
    // fc00::/7 unique local
    if ((hextet & 0xfe00) === 0xfc00) return true;
    // fe80::/10 link-local
    if ((hextet & 0xffc0) === 0xfe80) return true;
    // fec0::/10 site-local (deprecated)
    if ((hextet & 0xffc0) === 0xfec0) return true;
    // ff00::/8 multicast
    if ((hextet & 0xff00) === 0xff00) return true;
    // 2001:db8::/32 documentation
    if (raw.startsWith('2001:db8:') || raw === '2001:db8::' || raw.startsWith('2001:0db8:')) {
      return true;
    }
    return false;
  }
  return true;
}

export function assertAddressesPublic(addresses: string[]): void {
  if (!addresses.length) {
    throw new SsrfValidationError('Không phân giải được tên miền.', 'DNS_FAILED');
  }
  for (const address of addresses) {
    if (isPrivateOrReservedIp(address)) {
      throw new SsrfValidationError(
        'Tên miền trỏ tới IP nội bộ / metadata — bị chặn (SSRF).',
        'PRIVATE_IP',
      );
    }
  }
}

export async function resolvePublicHostname(hostname: string): Promise<string[]> {
  let records: Array<{ address: string }>;
  try {
    records = await dnsLookupImpl(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfValidationError('Không phân giải được tên miền.', 'DNS_FAILED');
  }
  const addresses = records.map((r) => r.address);
  assertAddressesPublic(addresses);
  return addresses;
}

export type AssertPublicHttpUrlOptions = {
  /** Skip marketplace/social crawl blocklist (Facebook/TikTok/etc.). */
  skipCommerceHostBlock?: boolean;
  /** When set, hostname must pass this allowlist (after localhost/metadata checks). */
  allowHost?: (hostname: string) => boolean;
};

export type AssertPublicHttpUrlResult = {
  url: URL;
  /** Validated public A/AAAA (or literal IP). Empty only if validation threw. */
  resolvedIps: string[];
};

export async function assertPublicHttpUrl(
  raw: string,
  opts?: AssertPublicHttpUrlOptions,
): Promise<URL> {
  const { url } = await assertPublicHttpUrlDetailed(raw, opts);
  return url;
}

export async function assertPublicHttpUrlDetailed(
  raw: string,
  opts?: AssertPublicHttpUrlOptions,
): Promise<AssertPublicHttpUrlResult> {
  const trimmed = raw.trim();
  if (!trimmed) throw new SsrfValidationError('URL không được để trống.', 'EMPTY_URL');

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new SsrfValidationError('URL không hợp lệ.', 'INVALID_URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrfValidationError('Chỉ chấp nhận http:// hoặc https://.', 'BAD_SCHEME');
  }
  if (parsed.username || parsed.password) {
    throw new SsrfValidationError('URL không được chứa thông tin đăng nhập.', 'USERINFO');
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new SsrfValidationError('Không cho phép localhost / tên nội bộ.', 'LOCALHOST');
  }
  if (
    host === 'metadata.google.internal' ||
    host.endsWith('.internal') ||
    host === '169.254.169.254'
  ) {
    throw new SsrfValidationError('Không cho phép host metadata / internal.', 'METADATA');
  }

  if (opts?.allowHost && !opts.allowHost(host)) {
    throw new SsrfValidationError('Host không nằm trong danh sách được phép.', 'UNSUPPORTED_HOST');
  }

  if (!opts?.skipCommerceHostBlock) {
    const unsupported = detectUnsupportedCommerceHost(host);
    if (unsupported) {
      throw new SsrfValidationError(unsupported, 'UNSUPPORTED_HOST');
    }
  }

  const ipHost = host.replace(/^\[|\]$/g, '');
  let resolvedIps: string[];
  if (isIP(ipHost)) {
    if (isPrivateOrReservedIp(ipHost)) {
      throw new SsrfValidationError('Không cho phép IP nội bộ / đặc biệt.', 'PRIVATE_IP');
    }
    resolvedIps = [ipHost];
  } else {
    resolvedIps = await resolvePublicHostname(host);
  }

  return { url: parsed, resolvedIps };
}

/**
 * Re-resolve immediately before connect. Blocks DNS rebinding / TOCTOU where the
 * second lookup introduces a private address.
 */
export async function revalidateResolvedIps(
  hostname: string,
  previousIps: string[],
): Promise<string[]> {
  const ipHost = hostname.replace(/^\[|\]$/g, '');
  if (isIP(ipHost)) {
    if (isPrivateOrReservedIp(ipHost)) {
      throw new SsrfValidationError('Không cho phép IP nội bộ / đặc biệt.', 'PRIVATE_IP');
    }
    return [ipHost];
  }
  const fresh = await resolvePublicHostname(hostname);
  // If any previously validated IP disappeared and fresh still all-public, OK.
  // Block if fresh set is empty or private (resolvePublicHostname already asserts).
  if (!fresh.length) {
    throw new SsrfValidationError('Không phân giải được tên miền.', 'DNS_FAILED');
  }
  // Prefer sticky IP from previous set when still present (anti-flip mid-flight).
  const sticky = previousIps.filter((ip) => fresh.includes(ip));
  return sticky.length ? sticky : fresh;
}

function pickPinnedIp(ips: string[]): string {
  const v4 = ips.find((ip) => isIP(ip) === 4);
  if (v4) return v4;
  const v6 = ips.find((ip) => isIP(ip) === 6);
  if (v6) return v6;
  throw new SsrfValidationError('Không có IP công khai để kết nối.', 'DNS_FAILED');
}

type PinnedResponse = {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
};

function fetchPinnedOnce(
  target: URL,
  pinnedIp: string,
  opts: { timeoutMs: number; headers: Record<string, string>; signal?: AbortSignal },
): Promise<PinnedResponse> {
  const isHttps = target.protocol === 'https:';
  const lib = isHttps ? https : http;
  const port = target.port ? Number(target.port) : isHttps ? 443 : 80;
  const family = isIP(pinnedIp) === 6 ? 6 : 4;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port,
        path: `${target.pathname}${target.search}`,
        method: 'GET',
        headers: {
          ...opts.headers,
          Host: target.host,
        },
        servername: isHttps ? target.hostname : undefined,
        // Node 18+/22 may call lookup with { all: true } and expect
        // callback(err, [{ address, family }]) — string form yields "Invalid IP address: undefined".
        lookup: ((
          _hostname: string,
          options: unknown,
          cb?: (
            err: Error | null,
            address: string | Array<{ address: string; family: number }>,
            family?: number,
          ) => void,
        ) => {
          const callback = (typeof options === 'function' ? options : cb) as (
            err: Error | null,
            address: string | Array<{ address: string; family: number }>,
            family?: number,
          ) => void;
          const lookupOpts =
            typeof options === 'object' && options !== null
              ? (options as { all?: boolean })
              : {};
          if (lookupOpts.all) {
            callback(null, [{ address: pinnedIp, family }]);
          } else {
            callback(null, pinnedIp, family);
          }
        }) as unknown as NonNullable<https.RequestOptions['lookup']>,
        timeout: opts.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
        res.on('error', reject);
      },
    );

    const onAbort = () => {
      req.destroy(new Error('AbortError'));
    };
    if (opts.signal) {
      if (opts.signal.aborted) {
        onAbort();
        return;
      }
      opts.signal.addEventListener('abort', onAbort, { once: true });
    }

    req.on('timeout', () => {
      req.destroy(new Error('AbortError'));
    });
    req.on('error', (err) => {
      if (opts.signal) opts.signal.removeEventListener('abort', onAbort);
      reject(err);
    });
    req.end();
  });
}

function stripHtml(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = (titleMatch?.[1] || '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return { title, text };
}

export type PublicHtmlFetchResult = {
  finalUrl: string;
  title: string;
  text: string;
  contentType: string;
  /** Truncated sanitized HTML for structured extract (no scripts). */
  html?: string;
};

/**
 * Fetch public HTML with redirect + size + timeout limits.
 * Re-validates each redirect target; connects only to previously validated public IPs.
 */
export async function fetchPublicHtmlSafe(
  rawUrl: string,
  opts?: {
    timeoutMs?: number;
    maxBytes?: number;
    maxRedirects?: number;
    /** Allow marketplace/social hosts (Landing Page crawl). Default false for ads. */
    skipCommerceHostBlock?: boolean;
    /** Include truncated HTML (scripts already stripped) for richer parsers. */
    includeHtml?: boolean;
  },
): Promise<PublicHtmlFetchResult> {
  const timeoutMs = opts?.timeoutMs ?? AD_URL_ANALYZE_LIMITS.fetchTimeoutMs;
  const maxBytes = opts?.maxBytes ?? AD_URL_ANALYZE_LIMITS.maxHtmlBytes;
  const maxRedirects = opts?.maxRedirects ?? AD_URL_ANALYZE_LIMITS.maxRedirects;
  const ssrfOpts = { skipCommerceHostBlock: opts?.skipCommerceHostBlock === true };

  let asserted = await assertPublicHttpUrlDetailed(rawUrl, ssrfOpts);
  let redirects = 0;

  while (true) {
    // TOCTOU / DNS rebind: revalidate immediately before connect.
    const resolvedIps = await revalidateResolvedIps(
      asserted.url.hostname,
      asserted.resolvedIps,
    );
    const pinnedIp = pickPinnedIp(resolvedIps);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: PinnedResponse;
    try {
      response = await fetchPinnedOnce(asserted.url, pinnedIp, {
        timeoutMs,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIBeego-LandingPageCrawl/1.0)',
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
      });
    } catch (e) {
      clearTimeout(timer);
      if (
        e instanceof Error &&
        (e.name === 'AbortError' || e.message === 'AbortError' || controller.signal.aborted)
      ) {
        throw new FetchPublicError('Hết thời gian chờ khi tải trang.', 'TIMEOUT');
      }
      throw new FetchPublicError(
        e instanceof Error ? e.message : 'Không tải được trang.',
        'FETCH_FAILED',
      );
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const locRaw = response.headers.location;
      const loc = Array.isArray(locRaw) ? locRaw[0] : locRaw;
      if (!loc) throw new FetchPublicError('Redirect thiếu Location.', 'BAD_REDIRECT');
      redirects += 1;
      if (redirects > maxRedirects) {
        throw new FetchPublicError('Quá nhiều lần redirect.', 'TOO_MANY_REDIRECTS');
      }
      const next = new URL(loc, asserted.url);
      // Every redirect hop: full URL + DNS + IP validation again.
      asserted = await assertPublicHttpUrlDetailed(next.toString(), ssrfOpts);
      continue;
    }

    if (response.status < 200 || response.status >= 300) {
      throw new FetchPublicError(`Máy chủ trả HTTP ${response.status}.`, 'HTTP_ERROR');
    }

    const ctRaw = response.headers['content-type'];
    const contentType = (Array.isArray(ctRaw) ? ctRaw[0] : ctRaw || '').toLowerCase();
    if (
      contentType &&
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml') &&
      !contentType.includes('text/plain')
    ) {
      throw new FetchPublicError(
        'URL không phải trang HTML công khai (ví dụ file/PDF/media).',
        'UNSUPPORTED_CONTENT',
      );
    }

    const clRaw = response.headers['content-length'];
    const cl = Array.isArray(clRaw) ? clRaw[0] : clRaw;
    if (cl && Number(cl) > maxBytes) {
      throw new FetchPublicError('Trang quá lớn để phân tích.', 'TOO_LARGE');
    }

    if (response.body.length > maxBytes) {
      throw new FetchPublicError('Trang quá lớn để phân tích.', 'TOO_LARGE');
    }

    const html = response.body.toString('utf8');
    const safeHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ' ');
    const { title, text } = stripHtml(safeHtml);
    if (text.length < 40) {
      throw new FetchPublicError(
        'Không trích xuất được đủ nội dung công khai từ trang (có thể bị chặn hoặc trang trống).',
        'INSUFFICIENT_CONTENT',
      );
    }

    return {
      finalUrl: asserted.url.toString(),
      title: title || asserted.url.hostname,
      text: text.slice(0, AD_URL_ANALYZE_LIMITS.maxExtractChars),
      contentType,
      ...(opts?.includeHtml
        ? { html: safeHtml.slice(0, Math.min(maxBytes, 800_000)) }
        : {}),
    };
  }
}
