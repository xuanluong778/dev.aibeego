'use client';

/**
 * Canvas-only right-click context menu for LP Builder.
 * Reuses existing canvas/builder actions — no parallel business logic.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Scan,
  Group,
  Ungroup,
  Copy,
  ClipboardCopy,
  ClipboardPaste,
  Layers,
  LockKeyhole,
  UnlockKeyhole,
  Trash2,
  AlignHorizontalJustifyCenter,
} from 'lucide-react';
import { elementFromField } from './landing-page-canvas-selection';
import type { LandingPageBlock, LandingPageBlockType } from '@marketingspa/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  resolveInspectorContext,
  type InspectorContextKind,
} from './landing-page-inspector-context';
import type {
  LandingPageCanvasElementKey,
  LandingPageInlineTextStyle,
} from './landing-page-canvas-ux';

export type LpCanvasClipboardStyle = {
  style?: Record<string, unknown>;
  background?: string | null;
  imageStyle?: Record<string, unknown>;
  inlineTextStyle?: LandingPageInlineTextStyle;
};

export type LandingPageCanvasContextMenuActions = {
  pageId: string;
  selectionCount?: number;
  grouped?: boolean;
  canGroupSelection?: boolean;
  canCopySelection?: boolean;
  canDuplicateSelection?: boolean;
  canLayerSelection?: boolean;
  canAlignSelection?: boolean;
  canEditSelection?: boolean;
  selectionLocked?: boolean;
  boxSelectionCount?: number;
  onSelectAllInBox?: () => void;
  onGroupSelection?: () => void;
  onUngroupSelection?: () => void;
  selectedBlock: LandingPageBlock | null;
  selectedElement: LandingPageCanvasElementKey;
  canPasteBlock: boolean;
  canPasteStyle: boolean;
  onSelectFromTarget: (
    blockId: string,
    element: LandingPageCanvasElementKey,
    field?: string,
  ) => void;
  /** Clear canvas selection (empty-canvas right-click). */
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onCopyBlock: (blockId: string) => void;
  onPasteBlock: () => void;
  onCopyStyle: (blockId: string, field?: string) => void;
  onPasteStyle: (blockId: string, field?: string) => void;
  onMoveLayer: (blockId: string, direction: 'up' | 'down') => void;
  onToggleLock: (blockId: string) => void;
  onAlign: (blockId: string, align: 'left' | 'center' | 'right', field?: string) => void;
  onToggleGroup: (blockId: string) => void;
  onInsertSection: (blockId: string, where: 'above' | 'below') => void;
  onReplaceImage: (blockId: string) => void;
  onImageFit: (blockId: string, fit: 'cover' | 'contain') => void;
  onFocusInlineEdit: (blockId: string, field: string) => void;
  onFocusButtonLink: (blockId: string) => void;
  onApplyField: (blockId: string, field: string, value: string, mode: 'replace' | 'append') => void;
};

export type LpCanvasAiPopoverState = {
  x: number;
  y: number;
  blockId: string;
  field: string;
  fieldKind: string;
  blockType: LandingPageBlockType;
  mode: 'quick' | 'rewrite' | 'cta' | 'section' | 'image';
  current: string;
};

export function resolveFieldForContext(
  block: LandingPageBlock,
  element: LandingPageCanvasElementKey,
  kind: InspectorContextKind,
  selectedField?: string,
): { field: string; fieldKind: string } {
  if (selectedField) {
    const prefix = selectedField.split(':')[0] || '';
    const kinds: Record<string, string> = {
      itemTitle: 'item.title',
      itemDesc: 'item.description',
      itemQuestion: 'item.question',
      itemAnswer: 'item.answer',
      itemQuote: 'item.quote',
      itemAuthor: 'item.author',
      fieldLabel: 'field.label',
      planName: 'headline',
      planPrice: 'body',
      planCta: 'ctaLabel',
      trustPoint: 'body',
    };
    return { field: selectedField, fieldKind: kinds[prefix] || selectedField };
  }
  if (kind === 'button' || element === 'cta') return { field: 'ctaLabel', fieldKind: 'ctaLabel' };
  if (element === 'headline') return { field: 'headline', fieldKind: 'headline' };
  if (element === 'subheadline') return { field: 'subheadline', fieldKind: 'subheadline' };
  if (element === 'body') return { field: 'body', fieldKind: 'body' };
  if (kind === 'text' || kind === 'section') {
    if ('headline' in block && (block as { headline?: string }).headline) {
      return { field: 'headline', fieldKind: 'headline' };
    }
    if ('body' in block) return { field: 'body', fieldKind: 'body' };
  }
  return { field: 'headline', fieldKind: 'headline' };
}

function clampPopover(x: number, y: number, w = 300, h = 280) {
  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  return {
    x: Math.min(Math.max(pad, x), Math.max(pad, vw - w - pad)),
    y: Math.min(Math.max(pad, y), Math.max(pad, vh - h - pad)),
  };
}

export function readContextFieldValue(block: LandingPageBlock, field: string): string {
  const rec = block as unknown as Record<string, unknown>;
  const [kind = '', id] = field.split(':');
  const fields: Record<string, [string, string]> = {
    itemTitle: ['items', 'title'],
    itemDesc: ['items', 'description'],
    itemQuestion: ['items', 'question'],
    itemAnswer: ['items', 'answer'],
    itemQuote: ['items', 'quote'],
    itemAuthor: ['items', 'author'],
    planName: ['plans', 'name'],
    planPrice: ['plans', 'price'],
    planCta: ['plans', 'ctaLabel'],
    fieldLabel: ['fields', 'label'],
  };
  if (kind === 'trustPoint' && Array.isArray(rec.trustPoints))
    return String(rec.trustPoints[Number(id)] ?? '');
  const nested = fields[kind];
  if (nested && id && Array.isArray(rec[nested[0]])) {
    const row = (rec[nested[0]] as Array<Record<string, unknown>>).find((row) => row.id === id);
    return typeof row?.[nested[1]] === 'string' ? String(row[nested[1]]) : '';
  }
  return typeof rec[field] === 'string' ? String(rec[field]) : '';
}

function parseContextTarget(target: EventTarget | null): {
  blockId: string | null;
  element: LandingPageCanvasElementKey;
  field?: string;
} {
  const el = target as HTMLElement | null;
  if (!el?.closest) return { blockId: null, element: 'section' };
  const blockHost = el.closest<HTMLElement>('[data-lp-block-id]');
  const blockId = blockHost?.getAttribute('data-lp-block-id') || null;
  const inline = el.closest<HTMLElement>('[data-lp-inline-field]');
  const textWrap = el.closest<HTMLElement>('[data-lp-text-hug="1"][data-lp-free-id]');
  const freeId = textWrap?.getAttribute('data-lp-free-id') || '';
  const field =
    inline?.getAttribute('data-lp-inline-field') || freeId.split('::').slice(1).join('::');
  if (field) {
    const owner =
      inline?.getAttribute('data-lp-element-id')?.split('::')[0] ||
      freeId.split('::')[0] ||
      blockId;
    return { blockId: owner, element: elementFromField(field), field };
  }
  const elemHost = el.closest<HTMLElement>('[data-lp-element-id]');
  const eid = elemHost?.getAttribute('data-lp-element-id') || '';
  if (eid.includes('::')) {
    const [owner, key = ''] = eid.split('::');
    if (
      key === 'image' ||
      key === 'cta' ||
      key === 'headline' ||
      key === 'subheadline' ||
      key === 'body' ||
      key.startsWith('item:') ||
      key.startsWith('grid:')
    ) {
      return { blockId: owner || blockId, element: key as LandingPageCanvasElementKey };
    }
  }
  if (el.closest('[data-lp-section-bg-hit],[data-lp-selection-target="section-background"]'))
    return { blockId, element: 'section-background' };
  return { blockId, element: 'section' };
}

export function LpCanvasAiQuickPopover({
  state,
  pageId,
  onClose,
  onApply,
}: {
  state: LpCanvasAiPopoverState;
  pageId: string;
  onClose: () => void;
  onApply: (value: string, mode: 'replace' | 'append') => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);

  const runSuggest = useCallback(
    async (action: 'rewrite' | 'suggest_3' = 'rewrite') => {
      setBusy(true);
      setError(null);
      try {
        const res = await apiClient<{ options: [string, string, string] }>(
          `/landing-pages/${pageId}/ai-suggest-field`,
          {
            method: 'POST',
            body: JSON.stringify({
              action,
              fieldKind: state.fieldKind,
              blockType: ['Header', 'Countdown', 'Speaker'].includes(state.blockType)
                ? 'Hero'
                : state.blockType,
              currentContent: prompt.trim() || state.current,
              pageGoal: 'lead',
              blockContext: `type=${state.blockType};mode=${state.mode}`,
            }),
          },
        );
        const opts = (res.options || []).filter(Boolean);
        setOptions(opts);
        setSelected(opts[0] || null);
        if (!opts.length) setError('Không có gợi ý — thử Tạo lại.');
      } catch (e) {
        setError(
          e instanceof ApiError && e.statusCode === 429
            ? 'Quá nhiều yêu cầu — đợi rồi thử lại.'
            : e instanceof Error
              ? e.message
              : 'AI lỗi',
        );
      } finally {
        setBusy(false);
      }
    },
    [pageId, prompt, state],
  );

  useEffect(() => {
    void runSuggest(state.mode === 'quick' || !state.current.trim() ? 'suggest_3' : 'rewrite');
  }, [state.blockId, state.field, state.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  const pos = clampPopover(state.x, state.y);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={panelRef}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      data-lp-ai-quick-popover="1"
      className="fixed z-[220] max-h-[calc(100dvh-1rem)] w-[min(300px,calc(100vw-1rem))] overflow-y-auto rounded-lg border border-white/15 bg-zinc-950 p-3 shadow-2xl"
      style={{ left: pos.x, top: pos.y, maxHeight: `calc(100dvh - ${pos.y}px - 8px)` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-white/90">✨ AI nhanh</div>
        <button
          type="button"
          className="text-[10px] text-white/50 hover:text-white"
          onClick={onClose}
        >
          Esc
        </button>
      </div>
      <input
        className="mb-2 w-full rounded border border-white/10 bg-transparent px-2 py-1.5 text-xs"
        placeholder="Gợi ý thêm (tuỳ chọn)…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      {busy ? <p className="text-xs text-white/50">Đang gợi ý…</p> : null}
      {error ? <p className="text-xs text-amber-200/90">{error}</p> : null}
      <div className="max-h-36 space-y-1 overflow-y-auto">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`block w-full rounded border px-2 py-1.5 text-left text-[11px] leading-snug ${
              selected === opt
                ? 'border-emerald-400/50 bg-emerald-500/15 text-white'
                : 'border-white/10 text-white/75 hover:bg-white/5'
            }`}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          className="h-7 text-[11px]"
          disabled={!selected || busy}
          data-lp-ai-apply-replace
          onClick={() => selected && onApply(selected, 'replace')}
        >
          Thay thế
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 border-white/20 text-[11px]"
          disabled={!selected || busy}
          data-lp-ai-apply-append
          onClick={() => selected && onApply(selected, 'append')}
        >
          Chèn thêm
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-[11px] text-white/70"
          disabled={busy}
          data-lp-ai-regenerate
          onClick={() => void runSuggest('suggest_3')}
        >
          Tạo lại
        </Button>
      </div>
      <p className="mt-2 text-[10px] text-white/40">Không tự ghi đè — chọn Thay thế / Chèn thêm.</p>
    </div>,
    document.body,
  );
}

export function LandingPageCanvasContextMenu({
  children,
  actions,
}: {
  children: ReactNode;
  actions: LandingPageCanvasContextMenuActions;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hit, setHit] = useState<ReturnType<typeof parseContextTarget> | null>(null);
  const hitRef = useRef<ReturnType<typeof parseContextTarget> | null>(null);
  const capture = (event: ReactMouseEvent) => {
    if ((event.target as HTMLElement)?.closest?.('[data-lp-inspector],[data-lp-left-rail]')) return;
    const target = parseContextTarget(event.target);
    hitRef.current = target;
    setHit(target);
    if (target.blockId) actions.onSelectFromTarget(target.blockId, target.element, target.field);
    else actions.onClearSelection();
  };
  const blockId = hit?.blockId;
  const count = blockId ? (actions.selectionCount ?? 1) : 0;
  const locked = Boolean(actions.selectionLocked ?? actions.selectedBlock?.locked);
  const editable = count > 0 && (actions.canEditSelection ?? !locked);
  const run = (action: (id: string) => void) => {
    const id = hitRef.current?.blockId;
    if (id) action(id);
  };
  const special =
    'gap-2.5 rounded-md bg-gradient-to-r from-amber-700/80 to-orange-800/70 text-white focus:bg-amber-700';
  const row = 'min-h-9 gap-2.5 px-2.5 py-2 text-sm [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0';
  return (
    <ContextMenu onOpenChange={setMenuOpen}>
      <ContextMenuTrigger asChild>
        <div
          data-lp-canvas-context-menu="1"
          data-lp-context-menu-open={menuOpen ? '1' : '0'}
          onContextMenuCapture={capture}
          className="min-h-[calc(100dvh-10rem)] min-w-0"
        >
          {children}
        </div>
      </ContextMenuTrigger>
      {(count > 0 || actions.canPasteBlock) && (
        <ContextMenuContent
          data-lp-canvas-context-menu-content="1"
          collisionPadding={8}
          className="w-60 rounded-xl border-zinc-700 bg-zinc-900 p-1.5 shadow-xl"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {count > 0 && (
            <>
              {actions.grouped ? (
                <ContextMenuItem
                  className={`${row} ${special}`}
                  data-lp-cm="ungroup"
                  disabled={!editable}
                  onSelect={actions.onUngroupSelection}
                >
                  <Ungroup />
                  Bỏ nhóm
                </ContextMenuItem>
              ) : count > 1 && actions.canGroupSelection ? (
                <ContextMenuItem
                  className={`${row} ${special}`}
                  data-lp-cm="group"
                  onSelect={actions.onGroupSelection}
                >
                  <Group />
                  Nhóm
                </ContextMenuItem>
              ) : count === 1 && (actions.boxSelectionCount || 0) >= 2 ? (
                <ContextMenuItem
                  className={`${row} ${special}`}
                  data-lp-cm="select-box"
                  onSelect={actions.onSelectAllInBox}
                >
                  <Scan />
                  <span>
                    Chọn tất cả phần tử
                    <br />
                    trong box
                  </span>
                </ContextMenuItem>
              ) : null}
              {count > 1 && actions.canAlignSelection && editable && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger data-lp-cm="align" className={row}>
                    <AlignHorizontalJustifyCenter />
                    Căn chỉnh
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent
                    collisionPadding={8}
                    sideOffset={6}
                    className="rounded-lg border-zinc-700 bg-zinc-900 p-1.5 text-white"
                  >
                    {(['left', 'center', 'right'] as const).map((align, i) => (
                      <ContextMenuItem
                        key={align}
                        className={row}
                        data-lp-cm={`align-${align}`}
                        onSelect={() => run((id) => actions.onAlign(id, align))}
                      >
                        {['Trái', 'Giữa', 'Phải'][i]}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              {actions.canCopySelection !== false && (
                <ContextMenuItem
                  className={row}
                  data-lp-cm="copy"
                  onSelect={() => run(actions.onCopyBlock)}
                >
                  <ClipboardCopy />
                  Sao chép
                </ContextMenuItem>
              )}
            </>
          )}
          {actions.canPasteBlock && !locked && (
            <ContextMenuItem className={row} data-lp-cm="paste" onSelect={actions.onPasteBlock}>
              <ClipboardPaste />
              Dán
            </ContextMenuItem>
          )}
          {count > 0 && (
            <>
              {actions.canDuplicateSelection !== false && (
                <ContextMenuItem
                  className={row}
                  data-lp-cm="duplicate"
                  onSelect={() => run(actions.onDuplicate)}
                >
                  <Copy />
                  Tạo bản sao
                </ContextMenuItem>
              )}
              {editable && actions.canLayerSelection !== false && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger data-lp-cm="layer" className={row}>
                    <Layers />
                    Lớp
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent
                    collisionPadding={8}
                    sideOffset={6}
                    className="rounded-lg border-zinc-700 bg-zinc-900 p-1.5 text-white"
                  >
                    <ContextMenuItem
                      className={row}
                      data-lp-cm="layer-up"
                      onSelect={() => run((id) => actions.onMoveLayer(id, 'up'))}
                    >
                      Đưa lên
                    </ContextMenuItem>
                    <ContextMenuItem
                      className={row}
                      data-lp-cm="layer-down"
                      onSelect={() => run((id) => actions.onMoveLayer(id, 'down'))}
                    >
                      Đưa xuống
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              <ContextMenuItem
                className={row}
                data-lp-cm="lock"
                onSelect={() => run(actions.onToggleLock)}
              >
                {locked ? <UnlockKeyhole /> : <LockKeyhole />}
                {locked ? 'Mở khóa' : 'Khóa'}
              </ContextMenuItem>
              {editable && (
                <>
                  <ContextMenuSeparator className="mx-1 my-1 bg-zinc-700" />
                  <ContextMenuItem
                    className={`${row} text-red-400 focus:text-red-300`}
                    data-lp-cm="delete"
                    onSelect={() => run(actions.onDelete)}
                  >
                    <Trash2 />
                    Xóa
                  </ContextMenuItem>
                </>
              )}
            </>
          )}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
