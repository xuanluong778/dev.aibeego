'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CompositionEvent, type FocusEvent } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import {
  buildLandingPageInlineAiContext,
  detectInlineAiMissingTopic,
  serializeInlineAiContextForApi,
  type LandingPageInlineAiPageMeta,
} from '@marketingspa/shared';
import { InspectorAccordion, InspectorFieldLabel } from './landing-page-inspector-ui';
import { isButtonLikeTextField } from './landing-page-canvas-ux';
import { LandingPageTextAiSuggest } from './landing-page-text-ai-suggest';

/** Read editable string for a canvas inline field key (same paths as builder applyNestedBlockField). */
export function readBlockFieldString(block: LandingPageBlock, field: string): string {
  const b = block as Record<string, unknown>;
  if (field === 'headline' || field === 'subheadline' || field === 'body' || field === 'ctaLabel') {
    return typeof b[field] === 'string' ? String(b[field]) : '';
  }
  const trustM = /^trustPoint:(\d+)$/.exec(field);
  if (trustM && Array.isArray(b.trustPoints)) {
    const idx = Number(trustM[1]);
    const arr = b.trustPoints as string[];
    return typeof arr[idx] === 'string' ? arr[idx] : '';
  }
  const itemM = /^(itemTitle|itemDesc|itemQuestion|itemAnswer|itemQuote|itemAuthor):(.+)$/.exec(field);
  if (itemM && Array.isArray(b.items)) {
    const kind = itemM[1];
    const itemId = itemM[2];
    const key =
      kind === 'itemTitle'
        ? 'title'
        : kind === 'itemDesc'
          ? 'description'
          : kind === 'itemQuestion'
            ? 'question'
            : kind === 'itemAnswer'
              ? 'answer'
              : kind === 'itemQuote'
                ? 'quote'
                : 'author';
    const row = (b.items as Array<Record<string, unknown>>).find((it) => it.id === itemId);
    return row && typeof row[key] === 'string' ? String(row[key]) : '';
  }
  const planM = /^(planName|planPrice|planCta):(.+)$/.exec(field);
  if (planM && Array.isArray(b.plans)) {
    const kind = planM[1];
    const planId = planM[2];
    const key = kind === 'planName' ? 'name' : kind === 'planPrice' ? 'price' : 'ctaLabel';
    const row = (b.plans as Array<Record<string, unknown>>).find((it) => it.id === planId);
    return row && typeof row[key] === 'string' ? String(row[key]) : '';
  }
  const fieldM = /^fieldLabel:(.+)$/.exec(field);
  if (fieldM && Array.isArray(b.fields)) {
    const fid = fieldM[1];
    const row = (b.fields as Array<Record<string, unknown>>).find((it) => it.id === fid);
    return row && typeof row.label === 'string' ? String(row.label) : '';
  }
  if (typeof b[field] === 'string') return String(b[field]);
  return '';
}

export function LandingPageInspectorTextContent({
  block,
  field,
  onLive,
  onCommit,
  tone = 'dark',
  pageId,
  pageMeta,
  hasBusinessProduct,
  onSaveTopicHint,
}: {
  block: LandingPageBlock;
  field: string;
  onLive: (value: string) => void;
  onCommit: (value: string) => void;
  /** Light surface for the left quick-edit drawer. Selection stays while this field is focused. */
  tone?: 'dark' | 'light';
  /** When set, show ✨ Gợi ý AI under the textarea. */
  pageId?: string;
  pageMeta?: LandingPageInlineAiPageMeta | null;
  /** True when org business profile already has product/service (skip clarify). */
  hasBusinessProduct?: boolean;
  onSaveTopicHint?: (hint: string) => void;
}) {
  const external = readBlockFieldString(block, field);
  const [draft, setDraft] = useState(external);
  const focusedRef = useRef(false);
  const composingRef = useRef(false);
  const [topicHintOverride, setTopicHintOverride] = useState<string | null>(null);

  useEffect(() => {
    setDraft(external);
    focusedRef.current = false;
    composingRef.current = false;
    setTopicHintOverride(null);
  }, [block.id, field]);

  useEffect(() => {
    if (focusedRef.current || composingRef.current) return;
    setDraft(external);
  }, [external]);

  const label = isButtonLikeTextField(field) ? 'Nhãn nút' : 'Nội dung chữ';

  const aiCtx = useMemo(() => {
    const meta: LandingPageInlineAiPageMeta = {
      ...(pageMeta || {}),
      aiTopicHint: topicHintOverride || pageMeta?.aiTopicHint || null,
    };
    return buildLandingPageInlineAiContext({ block, field, pageMeta: meta });
  }, [block, field, pageMeta, topicHintOverride]);

  const clarifyQuestion = useMemo(() => {
    if (!aiCtx || !pageId) return null;
    return detectInlineAiMissingTopic(aiCtx, Boolean(hasBusinessProduct));
  }, [aiCtx, pageId, hasBusinessProduct]);

  const applyAi = (next: string) => {
    focusedRef.current = false;
    composingRef.current = false;
    setDraft(next);
    onLive(next);
    onCommit(next);
  };

  const fields = (
    <>
      <label className={tone === 'light' ? 'text-xs font-medium text-slate-600' : undefined}>
        {tone === 'light' ? label : null}
      </label>
      {tone === 'dark' ? <InspectorFieldLabel>{label}</InspectorFieldLabel> : null}
      <textarea
        className={
          tone === 'light'
            ? 'min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-sky-400'
            : 'min-h-[72px] w-full resize-y rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1.5 text-xs text-white'
        }
        value={draft}
        data-lp-inspector-text-content
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
          focusedRef.current = false;
          composingRef.current = false;
          onCommit(e.target.value);
        }}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={(e: CompositionEvent<HTMLTextAreaElement>) => {
          composingRef.current = false;
          const v = e.currentTarget.value;
          setDraft(v);
          onLive(v);
        }}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          const v = e.target.value;
          setDraft(v);
          if (!composingRef.current) onLive(v);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {pageId && aiCtx ? (
        <LandingPageTextAiSuggest
          pageId={pageId}
          fieldKind={aiCtx.fieldKind}
          blockType={aiCtx.sectionType}
          value={draft}
          requestKey={`${pageId}::${block.id}::${field}`}
          pageGoal={
            (pageMeta?.aiPageGoal as 'lead' | 'sales' | 'signup' | 'consult' | 'event' | undefined) ||
            (pageMeta?.pageGoal as 'lead' | 'sales' | 'signup' | 'consult' | 'event' | undefined) ||
            'lead'
          }
          blockContext={serializeInlineAiContextForApi(aiCtx)}
          clarifyQuestion={clarifyQuestion}
          tone={tone}
          onApply={applyAi}
          onSaveTopicHint={(hint) => {
            setTopicHintOverride(hint);
            onSaveTopicHint?.(hint);
          }}
        />
      ) : null}
      {tone === 'dark' ? (
        <p className="text-[10px] opacity-40">Cập nhật realtime trên canvas. Double-click canvas để sửa trực tiếp.</p>
      ) : (
        <p className="text-[11px] text-slate-400">Chữ đang gõ giữ nguyên con trỏ. Định dạng chữ nằm trên thanh công cụ.</p>
      )}
    </>
  );

  if (tone === 'light') {
    return (
      <div className="space-y-1.5" data-lp="text-content">
        {fields}
      </div>
    );
  }

  return (
    <InspectorAccordion title={label} data-lp="text-content" defaultOpen>
      {fields}
    </InspectorAccordion>
  );
}
