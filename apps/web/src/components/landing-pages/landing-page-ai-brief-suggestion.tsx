'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import type {
  LandingPageBriefSuggestInput,
  LandingPageBriefSuggestResponse,
} from '@marketingspa/shared';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

type Props = {
  context: LandingPageBriefSuggestInput;
  disabled: boolean;
  label: string;
  onApply: (text: string) => void;
};

export function LandingPageAiBriefSuggestion({ context, disabled, label, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LandingPageBriefSuggestResponse | null>(null);
  const [error, setError] = useState('');
  const [resultFingerprint, setResultFingerprint] = useState('');
  const fingerprint = JSON.stringify(context);
  const latest = useRef(fingerprint);
  latest.current = fingerprint;
  const abort = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  const seeded = Boolean(context.productService.trim() || context.businessType.trim());
  const stale = result !== null && resultFingerprint !== fingerprint;

  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (!disabled) return;
    abort.current?.abort();
    inFlight.current = false;
    setLoading(false);
  }, [disabled]);

  async function suggest(forceNew = false) {
    if (disabled || !seeded || inFlight.current) return;
    if (!forceNew && !error && result && !stale) {
      setOpen(true);
      return;
    }
    inFlight.current = true;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const requestFingerprint = fingerprint;
    if (forceNew || retry.current?.fingerprint !== requestFingerprint) {
      const id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
              value.toString(16),
            ).join('');
      retry.current = { fingerprint: requestFingerprint, key: `lp-brief-${id}` };
    }
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const response = await apiClient<LandingPageBriefSuggestResponse>(
        '/landing-pages/ai-suggest-brief',
        {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({ ...context, idempotencyKey: retry.current.key }),
        },
      );
      if (controller.signal.aborted || abort.current !== controller) return;
      if (
        response.field !== context.field ||
        !Array.isArray(response.options) ||
        response.options.length !== 3 ||
        response.options.some((option) => typeof option !== 'string' || !option.trim())
      )
        throw new Error('Chưa nhận được gợi ý phù hợp. Vui lòng thử lại.');
      setResult(response);
      setResultFingerprint(requestFingerprint);
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error ? failure.message : 'Chưa lấy được gợi ý. Vui lòng thử lại.',
        );
    } finally {
      if (abort.current === controller) {
        inFlight.current = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }
  function close() {
    abort.current?.abort();
    inFlight.current = false;
    setLoading(false);
    setOpen(false);
  }

  return (
    <div className="mt-2" data-lp-brief-suggest={context.field}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-orange-400/30 px-2.5 text-xs text-orange-200 hover:bg-orange-500/10"
        disabled={disabled || !seeded || loading}
        onClick={() => void suggest()}
        aria-label={`Gợi ý AI cho ${label}`}
        aria-expanded={open}
        aria-controls={`lp-ai-suggestions-${context.field}`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}{' '}
        {loading ? 'Đang gợi ý…' : 'Gợi ý AI'}
      </Button>
      {!seeded ? (
        <span className="ml-2 text-xs opacity-55">Nhập ngành hoặc sản phẩm / dịch vụ trước.</span>
      ) : null}
      {open ? (
        <div
          id={`lp-ai-suggestions-${context.field}`}
          className="mt-3 min-w-0 space-y-3 rounded-xl border border-orange-400/25 bg-orange-500/[0.06] p-3 sm:p-4"
          role="region"
          aria-label={`Gợi ý cho ${label}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 text-xs opacity-80" aria-live="polite">
              {loading
                ? 'AI đang đọc thông tin bạn đã nhập…'
                : result?.source === 'ai'
                  ? 'Chọn một gợi ý phù hợp để điền vào ô.'
                  : 'Gợi ý tham khảo theo thông tin hiện tại.'}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label={`Đóng gợi ý ${label}`}
              onClick={close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error ? (
            <div className="flex flex-wrap items-center gap-2 text-xs" role="alert">
              <span className="text-red-200">{error}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || loading}
                onClick={() => void suggest()}
              >
                Thử lại
              </Button>
            </div>
          ) : null}
          {!loading && result ? (
            <>
              {result.warning ? (
                <p className="text-xs text-amber-100" role="status">
                  {result.warning}
                </p>
              ) : null}
              {stale ? (
                <p className="text-xs text-amber-100" role="status">
                  Thông tin đã thay đổi. Lấy gợi ý mới để khớp nội dung hiện tại.
                </p>
              ) : null}
              <div className="grid min-w-0 gap-2">
                {result.options.map((option, index) => (
                  <div
                    key={`${resultFingerprint}-${index}`}
                    className="flex min-w-0 flex-col gap-2 rounded-lg border border-white/10 bg-black/10 p-3 sm:flex-row sm:items-start"
                  >
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {option}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 self-end text-xs"
                      disabled={disabled || stale || loading}
                      aria-label={`Áp dụng gợi ý ${index + 1} cho ${label}`}
                      onClick={() => {
                        if (latest.current !== resultFingerprint || disabled) return;
                        onApply(option);
                        setOpen(false);
                        setResult(null);
                      }}
                    >
                      Áp dụng
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed opacity-60">
                Kiểm tra thông tin thực tế trước khi áp dụng. Gợi ý chưa được tự động điền vào biểu
                mẫu.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                disabled={disabled || loading || !seeded}
                onClick={() => void suggest(!stale)}
              >
                {stale ? 'Lấy gợi ý mới' : 'Gợi ý khác'}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
