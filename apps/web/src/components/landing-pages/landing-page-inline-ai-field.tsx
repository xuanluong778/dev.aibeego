'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LANDING_PAGE_INLINE_AI_ACTIONS,
  LANDING_PAGE_INLINE_AI_ACTION_LABELS,
  hashInlineAiFieldContent,
  type LandingPageInlineAiAction,
  type LandingPageInlineAiFieldKind,
} from '@marketingspa/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type BlockTypeProp =
  | 'Hero'
  | 'Benefits'
  | 'Features'
  | 'Product'
  | 'Pricing'
  | 'Testimonials'
  | 'Gallery'
  | 'Video'
  | 'Process'
  | 'Guarantee'
  | 'FAQ'
  | 'LeadForm'
  | 'CTA'
  | 'Footer'
  | 'SEO';

export type LandingPageInlineAiFieldProps = {
  pageId: string;
  label: string;
  fieldKind: LandingPageInlineAiFieldKind;
  blockType: BlockTypeProp;
  value: string;
  onChange: (next: string) => void;
  /** Called when user picks an AI option (defaults to onChange). */
  onApplyAi?: (next: string) => void;
  /** Stable key for per-field loading / abort (e.g. hero_x.headline). */
  requestKey: string;
  multiline?: boolean;
  rows?: number;
  pageGoal?: 'lead' | 'sales' | 'signup' | 'consult' | 'event';
  blockContext?: string;
  disabled?: boolean;
};

type SuggestResponse = {
  options: [string, string, string];
  source: 'ai' | 'fallback';
  warning?: string;
  contentHash?: string;
};

export function LandingPageInlineAiField({
  pageId,
  label,
  fieldKind,
  blockType,
  value,
  onChange,
  onApplyAi,
  requestKey,
  multiline,
  rows = 2,
  pageGoal = 'lead',
  blockContext,
  disabled,
}: LandingPageInlineAiFieldProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [stale, setStale] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  /** Hash + raw value captured when request started — detect stale apply. */
  const requestSnapshotRef = useRef<{ hash: string; value: string } | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Cancel in-flight when switching field identity
  useEffect(() => {
    abortRef.current?.abort();
    inFlightRef.current = false;
    setLoading(false);
    setMenuOpen(false);
    setOptionsOpen(false);
    setStale(false);
    requestSnapshotRef.current = null;
  }, [requestKey]);

  // If user edits while suggestions are open → mark stale (still viewable).
  useEffect(() => {
    const snap = requestSnapshotRef.current;
    if (!snap || !optionsOpen) return;
    const nowHash = hashInlineAiFieldContent(value);
    setStale(nowHash !== snap.hash);
  }, [value, optionsOpen]);

  const runSuggest = useCallback(
    async (action: LandingPageInlineAiAction) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const snapshotValue = valueRef.current;
      const snapshotHash = hashInlineAiFieldContent(snapshotValue);
      requestSnapshotRef.current = { hash: snapshotHash, value: snapshotValue };
      setStale(false);
      setLoading(true);
      setMsg('');
      setMenuOpen(false);
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
            blockContext: blockContext || '',
            useBusinessProfile: true,
          }),
        });
        if (!mountedRef.current || ac.signal.aborted) return;
        // Drop if another request superseded this one
        if (requestSnapshotRef.current?.hash !== snapshotHash) return;
        const liveHash = hashInlineAiFieldContent(valueRef.current);
        const isStale = liveHash !== snapshotHash;
        setStale(isStale);
        setOptions(res.options || []);
        setOptionsOpen(true);
        setMsg(
          isStale
            ? 'Bạn đã sửa field sau khi gọi AI — xem gợi ý được, Apply sẽ cảnh báo'
            : res.warning ||
                (res.source === 'ai' ? 'Chọn 1 trong 3 gợi ý' : 'Gợi ý fallback — chọn 1 phiên bản'),
        );
      } catch (e) {
        if (!mountedRef.current) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (e instanceof ApiError && e.message.toLowerCase().includes('abort')) return;
        setMsg(e instanceof Error ? e.message : 'AI tạm lỗi — thử lại');
        setOptionsOpen(false);
      } finally {
        if (abortRef.current === ac) {
          inFlightRef.current = false;
          if (mountedRef.current) setLoading(false);
        }
      }
    },
    [pageId, fieldKind, blockType, pageGoal, blockContext],
  );

  const onPickAction = (action: LandingPageInlineAiAction) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSuggest(action);
    }, 80);
  };

  const pickOption = (opt: string) => {
    const snap = requestSnapshotRef.current;
    const liveHash = hashInlineAiFieldContent(valueRef.current);
    if (snap && liveHash !== snap.hash) {
      const ok = window.confirm(
        'Nội dung field đã đổi sau khi AI trả về. Vẫn áp dụng gợi ý cũ? (Nên gọi lại AI để khớp context mới.)',
      );
      if (!ok) {
        setMsg('Đã giữ nguyên — hãy gọi lại ✨ AI nếu cần');
        return;
      }
    }
    (onApplyAi || onChange)(opt);
    setOptionsOpen(false);
    setStale(false);
    requestSnapshotRef.current = null;
    setMsg('Đã áp dụng — sẽ autosave');
    setTimeout(() => {
      if (mountedRef.current) setMsg('');
    }, 2500);
  };

  const cancel = () => {
    abortRef.current?.abort();
    inFlightRef.current = false;
    setLoading(false);
    setMsg('Đã hủy yêu cầu AI');
  };

  return (
    <div
      className="space-y-1.5"
      data-inspector-field={
        fieldKind === 'headline' ||
        fieldKind === 'subheadline' ||
        fieldKind === 'body' ||
        fieldKind === 'ctaLabel'
          ? fieldKind
          : fieldKind === 'plan.subheadline'
            ? 'subheadline'
            : undefined
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <Label className="text-xs">{label}</Label>
        <div className="relative flex items-center gap-1">
          {loading ? (
            <Button type="button" size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={cancel}>
              Hủy
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            disabled={disabled || loading}
            data-lp-inline-ai-trigger
            onClick={() => setMenuOpen((v) => !v)}
          >
            {loading ? '…' : '✨ AI'}
          </Button>
          {menuOpen ? (
            <div className="absolute right-0 top-7 z-30 w-48 rounded-md border border-white/15 bg-zinc-950 p-1 shadow-lg">
              {LANDING_PAGE_INLINE_AI_ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="block w-full rounded px-2 py-1.5 text-left text-[11px] text-white hover:bg-white/10"
                  onClick={() => onPickAction(a)}
                >
                  {LANDING_PAGE_INLINE_AI_ACTION_LABELS[a]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      )}

      {msg ? (
        <p className={cn('text-[10px]', stale ? 'text-amber-300' : 'text-emerald-400/90')}>{msg}</p>
      ) : null}

      {optionsOpen && options.length > 0 ? (
        <div
          className={cn(
            'space-y-1.5 rounded-md border bg-black/40 p-2',
            stale ? 'border-amber-400/40' : 'border-white/15',
          )}
        >
          <p className="text-[10px] font-medium uppercase opacity-70">
            {stale ? 'Gợi ý cũ (field đã đổi) — Apply có cảnh báo' : 'Chọn 1 phiên bản'}
          </p>
          {options.map((opt, i) => (
            <button
              key={`${requestKey}-opt-${i}`}
              type="button"
              className={cn(
                'w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-left text-xs text-white',
                'hover:border-emerald-400/50 hover:bg-emerald-950/40',
              )}
              onClick={() => pickOption(opt)}
            >
              <span className="mr-1.5 text-[10px] opacity-50">{i + 1}.</span>
              {opt}
            </button>
          ))}
          <button
            type="button"
            className="text-[10px] underline opacity-60 hover:opacity-100"
            onClick={() => {
              setOptionsOpen(false);
              setStale(false);
            }}
          >
            Đóng
          </button>
        </div>
      ) : null}
    </div>
  );
}
