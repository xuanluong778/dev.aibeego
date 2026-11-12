'use client';

/**
 * “✨ Gợi ý AI” for the Text panel “Nội dung chữ” field.
 * Does not own the textarea — apply goes through onApply → live/commit (undo-safe).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LANDING_PAGE_INLINE_AI_ACTION_LABELS,
  LANDING_PAGE_INLINE_AI_QUICK_ACTIONS,
  hashInlineAiFieldContent,
  type LandingPageInlineAiAction,
  type LandingPageInlineAiFieldKind,
} from '@marketingspa/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type SuggestResponse = {
  options: [string, string, string];
  source: 'ai' | 'fallback';
  warning?: string;
  contentHash?: string;
};

export type LandingPageTextAiSuggestProps = {
  pageId: string;
  fieldKind: LandingPageInlineAiFieldKind;
  blockType: string;
  /** Live draft from the textarea (not only committed spec). */
  value: string;
  requestKey: string;
  pageGoal?: 'lead' | 'sales' | 'signup' | 'consult' | 'event';
  blockContext: string;
  /** Apply suggestion into textarea + canvas history. */
  onApply: (next: string) => void;
  /** Persist clarify answer on the website (meta.aiTopicHint). */
  onSaveTopicHint?: (hint: string) => void;
  clarifyQuestion?: string | null;
  disabled?: boolean;
  tone?: 'dark' | 'light';
};

export function LandingPageTextAiSuggest({
  pageId,
  fieldKind,
  blockType,
  value,
  requestKey,
  pageGoal = 'lead',
  blockContext,
  onApply,
  onSaveTopicHint,
  clarifyQuestion = null,
  disabled,
  tone = 'dark',
}: LandingPageTextAiSuggestProps) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [stale, setStale] = useState(false);
  const [clarifyDraft, setClarifyDraft] = useState('');
  const [showClarify, setShowClarify] = useState(Boolean(clarifyQuestion));
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const requestSnapshotRef = useRef<{ hash: string; value: string; key: string } | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const requestSeqRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Selection / page / field change → drop stale results and cancel in-flight.
  useEffect(() => {
    abortRef.current?.abort();
    inFlightRef.current = false;
    setLoading(false);
    setOptions([]);
    setOptionsOpen(false);
    setStale(false);
    setMsg('');
    setShowClarify(Boolean(clarifyQuestion));
    setClarifyDraft('');
    requestSnapshotRef.current = null;
    requestSeqRef.current += 1;
  }, [requestKey, clarifyQuestion]);

  useEffect(() => {
    const snap = requestSnapshotRef.current;
    if (!snap || !optionsOpen) return;
    setStale(hashInlineAiFieldContent(value) !== snap.hash);
  }, [value, optionsOpen]);

  const runSuggest = useCallback(
    async (action: LandingPageInlineAiAction, contextOverride?: string) => {
      if (inFlightRef.current) return;
      if (disabled) return;
      inFlightRef.current = true;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const seq = ++requestSeqRef.current;
      const snapshotValue = valueRef.current;
      const snapshotHash = hashInlineAiFieldContent(snapshotValue);
      requestSnapshotRef.current = { hash: snapshotHash, value: snapshotValue, key: requestKey };
      setStale(false);
      setLoading(true);
      setMsg('');
      setShowClarify(false);
      try {
        const res = await apiClient<SuggestResponse>(`/landing-pages/${pageId}/ai-suggest-field`, {
          method: 'POST',
          signal: ac.signal,
          body: JSON.stringify({
            action,
            fieldKind,
            currentContent: snapshotValue,
            blockType,
            pageGoal,
            blockContext: contextOverride ?? blockContext ?? '',
            useBusinessProfile: true,
          }),
        });
        if (!mountedRef.current || ac.signal.aborted) return;
        // Superseded by newer request or selection change
        if (seq !== requestSeqRef.current) return;
        if (requestSnapshotRef.current?.key !== requestKey) return;
        if (requestSnapshotRef.current?.hash !== snapshotHash) return;
        const liveHash = hashInlineAiFieldContent(valueRef.current);
        const isStale = liveHash !== snapshotHash;
        setStale(isStale);
        setOptions(res.options || []);
        setOptionsOpen(true);
        setMsg(
          isStale
            ? 'Bạn đã sửa chữ sau khi gọi AI — Áp dụng sẽ cảnh báo'
            : res.warning ||
                (res.source === 'ai' ? 'Bấm vào câu để chọn' : 'Gợi ý dự phòng — bấm vào câu để chọn'),
        );
      } catch (e) {
        if (!mountedRef.current) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (e instanceof ApiError && e.message.toLowerCase().includes('abort')) return;
        if (seq !== requestSeqRef.current) return;
        const msgText = e instanceof Error ? e.message : 'AI tạm lỗi — thử lại';
        if (
          (e instanceof ApiError && e.code === 'INSUFFICIENT_CREDITS') ||
          /INSUFFICIENT_CREDITS|Không đủ AI Credit/i.test(msgText)
        ) {
          setMsg('Không đủ AI Credit — nạp credit để dùng Gợi ý AI');
        } else {
          setMsg(msgText);
        }
        setOptionsOpen(false);
      } finally {
        if (abortRef.current === ac) {
          inFlightRef.current = false;
          if (mountedRef.current && seq === requestSeqRef.current) setLoading(false);
        }
      }
    },
    [pageId, fieldKind, blockType, pageGoal, blockContext, requestKey, disabled],
  );

  const applyOption = (opt: string) => {
    const snap = requestSnapshotRef.current;
    const liveHash = hashInlineAiFieldContent(valueRef.current);
    if (snap && liveHash !== snap.hash) {
      const ok = window.confirm(
        'Nội dung đã đổi sau khi AI trả về. Vẫn áp dụng gợi ý cũ? (Nên bấm Gợi ý AI lại.)',
      );
      if (!ok) {
        setMsg('Đã giữ nguyên — hãy gọi lại ✨ Gợi ý AI');
        return;
      }
    }
    // Ignore if selection already moved
    if (snap && snap.key !== requestKey) {
      setMsg('Đã đổi phần tử — bỏ qua gợi ý cũ');
      setOptionsOpen(false);
      return;
    }
    onApply(opt);
    setOptionsOpen(false);
    setStale(false);
    requestSnapshotRef.current = null;
    setMsg('Đã áp dụng');
    setTimeout(() => {
      if (mountedRef.current) setMsg('');
    }, 2000);
  };

  const cancel = () => {
    abortRef.current?.abort();
    inFlightRef.current = false;
    setLoading(false);
    setMsg('Đã hủy yêu cầu AI');
  };

  const chip =
    tone === 'light'
      ? 'rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50'
      : 'rounded-md border border-white/15 bg-zinc-900 px-2 py-1 text-[10px] text-white hover:border-amber-400/50 hover:bg-amber-950/30 disabled:opacity-50';

  const panel =
    tone === 'light'
      ? 'space-y-1.5 rounded-lg border border-slate-200 bg-white p-2'
      : 'space-y-1.5 rounded-md border border-white/15 bg-black/40 p-2';

  return (
    <div className="space-y-1.5" data-lp-text-ai-suggest="1">
      <div className="flex flex-wrap items-center gap-1.5">
        {loading ? (
          <button type="button" className={chip} onClick={cancel}>
            Hủy
          </button>
        ) : null}
        <button
          type="button"
          className={cn(
            chip,
            tone === 'dark' && 'border-amber-400/40 text-amber-100',
            tone === 'light' && 'border-amber-300 bg-amber-50 text-amber-900',
          )}
          disabled={disabled || loading}
          data-lp-text-ai-trigger
          onClick={() => {
            if (clarifyQuestion && !blockContext.includes('TOPIC_HINT=')) {
              setShowClarify(true);
              setMsg(clarifyQuestion);
              return;
            }
            void runSuggest('suggest_3');
          }}
        >
          {loading ? 'Đang gợi ý…' : '✨ Gợi ý AI'}
        </button>
        {LANDING_PAGE_INLINE_AI_QUICK_ACTIONS.map((a) => (
          <button
            key={a}
            type="button"
            className={chip}
            disabled={disabled || loading}
            onClick={() => void runSuggest(a)}
          >
            {LANDING_PAGE_INLINE_AI_ACTION_LABELS[a]}
          </button>
        ))}
      </div>

      {showClarify ? (
        <div className={panel} data-lp-text-ai-clarify="1">
          <p className={tone === 'light' ? 'text-xs text-slate-600' : 'text-[10px] opacity-80'}>
            {clarifyQuestion || 'Website này bán gì / phục vụ ai? (1 câu)'}
          </p>
          <input
            className={
              tone === 'light'
                ? 'w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm'
                : 'w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white'
            }
            value={clarifyDraft}
            onChange={(e) => setClarifyDraft(e.target.value)}
            placeholder="VD: Agency chạy ads cho spa"
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              className={chip}
              disabled={!clarifyDraft.trim()}
              onClick={() => {
                const hint = clarifyDraft.trim().slice(0, 240);
                onSaveTopicHint?.(hint);
                setShowClarify(false);
                setMsg('Đã lưu chủ đề website — đang gợi ý…');
                const ctx = blockContext.includes('TOPIC_HINT=')
                  ? blockContext
                  : `${blockContext}\nTOPIC_HINT=${hint}`.slice(0, 2000);
                void runSuggest('suggest_3', ctx);
              }}
            >
              Lưu & gợi ý
            </button>
            <button
              type="button"
              className={chip}
              onClick={() => {
                setShowClarify(false);
                void runSuggest('suggest_3');
              }}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      ) : null}

      {msg ? (
        <p
          className={cn(
            'text-[10px]',
            stale
              ? tone === 'light'
                ? 'text-amber-700'
                : 'text-amber-300'
              : tone === 'light'
                ? 'text-emerald-700'
                : 'text-emerald-400/90',
          )}
        >
          {msg}
        </p>
      ) : null}

      {optionsOpen && options.length > 0 ? (
        <div
          className={cn(panel, stale && (tone === 'light' ? 'border-amber-300' : 'border-amber-400/40'))}
          data-lp-text-ai-options="1"
        >
          <p
            className={
              tone === 'light'
                ? 'text-[10px] font-medium uppercase text-slate-500'
                : 'text-[10px] font-medium uppercase opacity-70'
            }
          >
            {stale ? 'Gợi ý cũ (đã sửa chữ)' : '3 gợi ý'}
          </p>
          {options.map((opt, i) => (
            <button
              key={`${requestKey}-opt-${i}`}
              type="button"
              data-lp-text-ai-apply={i}
              onClick={() => applyOption(opt)}
              className={
                tone === 'light'
                  ? 'w-full cursor-pointer rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-left text-xs text-slate-800 transition hover:border-sky-400 hover:bg-sky-50 hover:shadow-sm'
                  : 'w-full cursor-pointer rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-left text-xs text-white transition hover:border-amber-400/60 hover:bg-amber-950/40 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35)]'
              }
            >
              <span className="mr-1 opacity-50">{i + 1}.</span>
              {opt}
            </button>
          ))}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              className={chip}
              disabled={loading}
              onClick={() => void runSuggest('suggest_3')}
            >
              Thêm gợi ý
            </button>
            <button
              type="button"
              className={chip}
              onClick={() => {
                setOptionsOpen(false);
                setStale(false);
                setOptions([]);
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
