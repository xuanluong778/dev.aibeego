/**
 * Landing Page AI failure classification + client retry policy (Doctor / Apply / Generate).
 * Shared so gates + UI + API stay aligned. No side effects.
 */

export type LpAiFailureCode =
  | 'AI_TIMEOUT'
  | 'AI_ABORTED'
  | 'AI_RATE_LIMIT'
  | 'AI_SERVER_ERROR'
  | 'AI_MALFORMED'
  | 'AI_EMPTY'
  | 'AI_UNKNOWN';

export type LpAiFailureInfo = {
  code: LpAiFailureCode;
  retryable: boolean;
  message: string;
  /** Do not deduct / re-deduct credit on retryable idempotent retries. */
  skipCreditCharge: boolean;
};

export function classifyLpAiFailure(err: unknown): LpAiFailureInfo {
  const raw =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === 'string'
        ? err
        : String(err ?? '');
  const lower = raw.toLowerCase();

  if (
    lower.includes('abort') ||
    lower.includes('aborted') ||
    (err instanceof Error && err.name === 'AbortError')
  ) {
    return {
      code: 'AI_ABORTED',
      retryable: true,
      message: 'Yêu cầu AI bị hủy — thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  if (lower.includes('timeout') || lower.includes('etimedout')) {
    return {
      code: 'AI_TIMEOUT',
      retryable: true,
      message: 'AI hết thời gian chờ — thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  if (lower.includes('429') || lower.includes('rate limit') || lower.includes('too many')) {
    return {
      code: 'AI_RATE_LIMIT',
      retryable: true,
      message: 'AI đang giới hạn tốc độ (429) — đợi rồi thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  if (/\b5\d\d\b/.test(lower) || lower.includes('server error') || lower.includes('unavailable')) {
    return {
      code: 'AI_SERVER_ERROR',
      retryable: true,
      message: 'Máy chủ AI lỗi tạm thời — thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  if (lower.includes('empty') || lower.includes('no content')) {
    return {
      code: 'AI_EMPTY',
      retryable: true,
      message: 'AI trả về rỗng — thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  if (
    lower.includes('landingpageaicontentvalidationerror') ||
    /ai_(?:schema|section|unsupported|repeated|internal|invalid)/.test(lower) ||
    lower.includes('json') ||
    lower.includes('malformed') ||
    lower.includes('parse') ||
    lower.includes('invalid')
  ) {
    return {
      code: 'AI_MALFORMED',
      retryable: true,
      message: 'Phản hồi AI không hợp lệ — thử lại. Bản nháp không đổi.',
      skipCreditCharge: true,
    };
  }
  return {
    code: 'AI_UNKNOWN',
    retryable: true,
    message: 'AI lỗi — thử lại. Bản nháp không đổi.',
    skipCreditCharge: true,
  };
}

/** Exponential backoff delays (ms), capped — never infinite. */
export function lpAiRetryDelayMs(attemptIndex: number, baseMs = 400, maxMs = 8_000): number {
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attemptIndex));
  return exp;
}

export const LP_AI_RETRY_MAX_ATTEMPTS = 3;

export function shouldRetryLpAiHttpStatus(status: number): boolean {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}
