'use client';

/**
 * Right-rail “THÊM THÀNH PHẦN” — full replacement for left-sidebar insert + layers.
 * Reuses left catalogs / DnD MIME / insert handlers; does not own engine logic.
 */

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import type { LandingPageBlock, LandingPageBlockType } from '@marketingspa/shared';
import { LP_ADD_ELEMENTS_LIVE } from './landing-page-builder-sidebar';
import { beginSidebarPresetDrag, suppressClickAfterSidebarDrag, ignoreSidebarElementClick } from './landing-page-sidebar-dnd';
import {
  LandingPageTextPresetsPanel,
  type LandingPageListPreset,
  type LandingPageParagraphPreset,
  type LandingPageTitlePreset,
  type TextPresetTab,
} from './landing-page-title-presets';
import {
  LandingPageButtonPresetsPanel,
  type LandingPageButtonGroupPreset,
  type LandingPageButtonPreset,
  type ButtonPresetTab,
} from './landing-page-button-presets';
import { LandingPageGraphicsLibraryPanel } from './landing-page-graphics-library';
import type { LandingPageBoxPreset } from './landing-page-box-presets';
import {
  LP_FORM_GROUPS,
  LP_FORM_PRESETS,
  type LandingPageFormPreset,
} from './landing-page-form-presets';
import { cn } from '@/lib/utils';

type RootMode = 'add' | 'layers';
type SubView = 'root' | 'text' | 'button' | 'graphics' | 'icon' | 'forms' | 'social';

type QuickCard = {
  id: string;
  label: string;
  icon: string;
  kind:
    | 'section-library'
    | 'media'
    | 'text'
    | 'button'
    | 'graphics'
    | 'icon'
    | 'social'
    | 'forms'
    | 'layers'
    | 'block';
  blockType?: LandingPageBlockType;
};

const GROUP_BASIC = 'Thành phần cơ bản';
const GROUP_ADVANCED = 'Thành phần nâng cao';
const GROUP_TOOLS = 'Công cụ bổ sung';
const GROUP_ECOMMERCE = 'Thương mại điện tử';

/** GetResponse-style basic row — section blocks live in thư viện Phần. */
const BASIC_CARDS: QuickCard[] = [
  { id: 'section', label: 'Phần', icon: '▭', kind: 'section-library' },
  { id: 'text', label: 'Văn bản', icon: '≡', kind: 'text' },
  { id: 'button', label: 'Nút', icon: '⏺', kind: 'button' },
  { id: 'image', label: 'Ảnh', icon: '🖼', kind: 'media' },
  { id: 'video', label: 'Video', icon: '▶', kind: 'block', blockType: 'Video' },
];

const SOCIAL_CARD: QuickCard = {
  id: 'social',
  label: 'Social Media',
  icon: '𝕏',
  kind: 'social',
};

const ADVANCED_CARDS: QuickCard[] = [
  { id: 'gallery', label: 'Thư viện', icon: '▦', kind: 'block', blockType: 'Gallery' },
  { id: 'forms', label: 'Biểu mẫu', icon: '▭', kind: 'forms' },
  { id: 'countdown', label: 'Bộ hẹn giờ', icon: '⏱', kind: 'block', blockType: 'Countdown' },
];

/** Đồ họa / biểu tượng — không ẩn để giữ preset hiện có. */
const TOOL_CARDS: QuickCard[] = [
  { id: 'graphics', label: 'Đồ họa', icon: '◇', kind: 'graphics' },
  { id: 'icon', label: 'Biểu tượng', icon: '✦', kind: 'icon' },
];

const ECOMMERCE_CARDS: QuickCard[] = [
  { id: 'product', label: 'Hộp sản phẩm', icon: '▣', kind: 'block', blockType: 'Product' },
];

/**
 * Section block types not represented in thư viện Phần — keep on grid so insert path remains.
 * (Hero/FAQ/Pricing/… are reachable via Phần → section library catalog.)
 */
const SECTION_BLOCKS_WITHOUT_LIBRARY: QuickCard[] = [
  { id: 'header', label: 'Header', icon: '☰', kind: 'block', blockType: 'Header' },
  { id: 'footer', label: 'Footer', icon: '▁', kind: 'block', blockType: 'Footer' },
  { id: 'speaker', label: 'Speaker', icon: '👤', kind: 'block', blockType: 'Speaker' },
];

const GROUP_SECTION_FALLBACK = 'Section (chưa có trong thư viện Phần)';

const LIVE_TYPES = new Set(LP_ADD_ELEMENTS_LIVE.map((r) => r.type));

function filterLiveCards(cards: QuickCard[]): QuickCard[] {
  return cards.filter((c) =>
    c.kind === 'block' ? c.blockType != null && LIVE_TYPES.has(c.blockType) : true,
  );
}

export type LandingPageAddComponentsPanelProps = {
  onAddBlock: (type: LandingPageBlockType) => void;
  onAddBlocks: (types: LandingPageBlockType[]) => void;
  onOpenMediaLibrary?: () => void;
  onOpenSectionLibrary?: () => void;
  onOpenButtonLibrary?: () => void;
  onOpenFormLibrary?: () => void;
  onOpenCountdownLibrary?: () => void;
  onInsertTitlePreset?: (preset: LandingPageTitlePreset) => void;
  onInsertParagraphPreset?: (preset: LandingPageParagraphPreset) => void;
  onInsertListPreset?: (preset: LandingPageListPreset) => void;
  onInsertButtonPreset?: (preset: LandingPageButtonPreset) => void;
  onInsertButtonGroupPreset?: (preset: LandingPageButtonGroupPreset) => void;
  onInsertBoxPreset?: (preset: LandingPageBoxPreset) => void;
  onInsertFormPreset?: (preset: LandingPageFormPreset) => void;
  /** Layers (from left sidebar) */
  blocks?: LandingPageBlock[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
  onReorderBlocks?: (fromIndex: number, toIndex: number) => void;
  onDupBlock?: (id: string) => void;
  onRemoveBlock?: (id: string) => void;
  /** Open on layers when launched from external request */
  initialRootMode?: RootMode;
  /** @deprecated bottom Phần tử/Section mẫu tabs removed — presets → mở thư viện Phần */
  initialAddTab?: 'elements' | 'presets';
  /** Open a preset picker after drag-drop from canvas (text / forms / …). */
  initialSubView?: SubView;
};

const EMBEDDED_PRESET_CLASS =
  '!relative !left-0 !top-0 !ml-0 !mt-0 !h-full !max-h-none !w-full !min-h-0 !rounded-none !border-0 !shadow-none';

export function LandingPageAddComponentsPanel({
  onAddBlock,
  onAddBlocks,
  onOpenMediaLibrary,
  onOpenSectionLibrary,
  onOpenButtonLibrary,
  onOpenFormLibrary,
  onOpenCountdownLibrary,
  onInsertTitlePreset,
  onInsertParagraphPreset,
  onInsertListPreset,
  onInsertButtonPreset,
  onInsertButtonGroupPreset,
  onInsertBoxPreset,
  onInsertFormPreset,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onReorderBlocks,
  onDupBlock,
  onRemoveBlock,
  initialRootMode = 'add',
  initialAddTab,
  initialSubView = 'root',
}: LandingPageAddComponentsPanelProps) {
  const [rootMode, setRootMode] = useState<RootMode>(initialRootMode);
  const [subView, setSubView] = useState<SubView>(initialSubView);
  const [textTab, setTextTab] = useState<TextPresetTab>('title');
  const [buttonTab, setButtonTab] = useState<ButtonPresetTab>('buttons');
  const dragIndex = useRef<number | null>(null);

  // AI / external "Section mẫu" → mở thư viện Phần (gọn hơn tab cũ).
  useEffect(() => {
    if (initialAddTab === 'presets' && onOpenSectionLibrary) {
      onOpenSectionLibrary();
    }
  }, [initialAddTab, onOpenSectionLibrary]);

  useEffect(() => {
    if (initialSubView === 'forms') {
      onOpenFormLibrary?.();
      setRootMode('add');
      setSubView('root');
      return;
    }
    if (initialSubView && initialSubView !== 'root') {
      setRootMode('add');
      setSubView(initialSubView);
    }
  }, [initialSubView, onOpenFormLibrary]);

  function runQuick(card: QuickCard) {
    switch (card.kind) {
      case 'layers':
        setRootMode('layers');
        setSubView('root');
        return;
      case 'section-library':
        onOpenSectionLibrary?.();
        return;
      case 'button':
        if (onOpenButtonLibrary) {
          onOpenButtonLibrary();
          return;
        }
        if (!onInsertButtonPreset) {
          onAddBlock('CTA');
          return;
        }
        setButtonTab('buttons');
        setSubView('button');
        return;
      case 'media':
        onOpenMediaLibrary?.();
        return;
      case 'text':
        if (!onInsertTitlePreset) {
          onAddBlock('Hero');
          return;
        }
        setSubView('text');
        return;
      case 'social':
        if (!onInsertBoxPreset) return;
        setSubView('social');
        return;
      case 'graphics':
        if (!onInsertBoxPreset) {
          onAddBlock('Product');
          return;
        }
        setSubView('graphics');
        return;
      case 'icon':
        if (!onInsertBoxPreset) {
          onAddBlock('Features');
          return;
        }
        setSubView('icon');
        return;
      case 'forms':
        onOpenFormLibrary?.();
        return;
      case 'block':
        if (card.blockType === 'Countdown' && onOpenCountdownLibrary) {
          onOpenCountdownLibrary();
          return;
        }
        if (card.blockType) onAddBlock(card.blockType);
        return;
      default:
        return;
    }
  }

  if (subView === 'text' && onInsertTitlePreset) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white text-zinc-900"
        data-lp-add-components-sub="text"
      >
        <LandingPageTextPresetsPanel
          className={EMBEDDED_PRESET_CLASS}
          initialTab={textTab}
          onTabChange={setTextTab}
          onClose={() => setSubView('root')}
          onInsertTitle={(preset) => onInsertTitlePreset(preset)}
          onInsertParagraph={(preset) => onInsertParagraphPreset?.(preset)}
          onInsertList={(preset) => onInsertListPreset?.(preset)}
        />
      </div>
    );
  }

  if (subView === 'button' && onInsertButtonPreset) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white text-zinc-900"
        data-lp-add-components-sub="button"
      >
        <LandingPageButtonPresetsPanel
          className={EMBEDDED_PRESET_CLASS}
          initialTab={buttonTab}
          onTabChange={setButtonTab}
          onClose={() => setSubView('root')}
          onInsertButton={(preset) => onInsertButtonPreset(preset)}
          onInsertGroup={(preset) => onInsertButtonGroupPreset?.(preset)}
        />
      </div>
    );
  }

  if (subView === 'graphics' && onInsertBoxPreset) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white text-zinc-900"
        data-lp-add-components-sub="graphics"
      >
        <LandingPageGraphicsLibraryPanel
          className={EMBEDDED_PRESET_CLASS}
          onClose={() => setSubView('root')}
          onInsertBox={(preset) => onInsertBoxPreset(preset)}
          onInsertForm={(preset) => onInsertFormPreset?.(preset)}
          onInsertBlockType={(type) => onAddBlock(type)}
          onOpenMediaLibrary={onOpenMediaLibrary}
          onOpenFormLibrary={onOpenFormLibrary}
        />
      </div>
    );
  }

  if (subView === 'icon' && onInsertBoxPreset) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100 text-zinc-900"
        data-lp-add-components-sub="icon"
      >
        <LandingPageGraphicsLibraryPanel
          className={EMBEDDED_PRESET_CLASS}
          initialCategory="graphics"
          iconsOnly
          panelTitle="Biểu tượng"
          onClose={() => setSubView('root')}
          onInsertBox={(preset) => onInsertBoxPreset(preset)}
          onInsertForm={(preset) => onInsertFormPreset?.(preset)}
          onInsertBlockType={(type) => onAddBlock(type)}
          onOpenMediaLibrary={onOpenMediaLibrary}
          onOpenFormLibrary={onOpenFormLibrary}
        />
      </div>
    );
  }

  if (subView === 'social' && onInsertBoxPreset) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100 text-zinc-900"
        data-lp-add-components-sub="social"
      >
        <LandingPageGraphicsLibraryPanel
          className={EMBEDDED_PRESET_CLASS}
          initialCategory="graphics"
          initialShapeGroup="social"
          iconsOnly
          panelTitle="Social Media"
          onClose={() => setSubView('root')}
          onInsertBox={(preset) => onInsertBoxPreset(preset)}
          onInsertForm={(preset) => onInsertFormPreset?.(preset)}
          onInsertBlockType={(type) => onAddBlock(type)}
          onOpenMediaLibrary={onOpenMediaLibrary}
          onOpenFormLibrary={onOpenFormLibrary}
        />
      </div>
    );
  }


  function renderComponentCard(card: QuickCard) {
    const dropHint = 'Thả vào canvas → hiện mẫu để chọn';
    const blockDragType = card.kind === 'block' ? card.blockType : null;
    let dragKind: 'section-library' | 'button-library' | 'block-type' | 'picker' | undefined;
    let onDragStart: ((e: DragEvent<HTMLButtonElement>) => void) | undefined;

    if (card.kind === 'section-library') {
      dragKind = 'section-library';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'section-library-open' }, 'Thư viện Section', {
          subtitle: dropHint,
        });
    } else if (card.kind === 'button' && onOpenButtonLibrary) {
      dragKind = 'button-library';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'button-library-open' }, 'Thư viện Nút', {
          subtitle: dropHint,
        });
    } else if (card.kind === 'button' && onInsertButtonPreset) {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'button' }, card.label, {
          subtitle: dropHint,
        });
    } else if (card.kind === 'text' && onInsertTitlePreset) {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'text' }, card.label, {
          subtitle: dropHint,
        });
    } else if (card.kind === 'forms') {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'form-library-open' }, card.label, {
          subtitle: 'Kéo thả vào canvas để chọn mẫu biểu mẫu',
        });
    } else if (card.kind === 'graphics' && onInsertBoxPreset) {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'graphics' }, card.label, {
          subtitle: dropHint,
        });
    } else if (card.kind === 'icon' && onInsertBoxPreset) {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'icon' }, card.label, {
          subtitle: dropHint,
        });
    } else if (card.kind === 'social' && onInsertBoxPreset) {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'social' }, card.label, {
          subtitle: dropHint,
        });
    } else if (card.kind === 'media') {
      dragKind = 'picker';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'add-picker-open', picker: 'media' }, card.label, {
          subtitle: 'Thả vào canvas → mở thư viện ảnh',
        });
    } else if (card.kind === 'block' && blockDragType) {
      dragKind = 'block-type';
      onDragStart = (e) =>
        beginSidebarPresetDrag(e, { kind: 'block-type', type: blockDragType }, card.label, {
          subtitle: 'Thả vào canvas để chèn',
        });
    }

    const canDrag = Boolean(onDragStart);
    const cardNode = (
      <ComponentCard
        key={card.id}
        card={card}
        dragKind={dragKind}
        onClick={() => runQuick(card)}
        draggable={canDrag}
        onDragStart={onDragStart}
      />
    );
    return card.kind === 'text' ? (
      <div key={card.id} className="flex min-w-0 flex-col gap-1">
        {cardNode}
        <button type="button" data-lp-open-text-library="1"
          className="rounded px-1 py-1 text-[10px] text-slate-700 underline hover:bg-white"
          onClick={() => runQuick(card)}>Chọn mẫu văn bản</button>
      </div>
    ) : cardNode;

  }

  const showSocial = Boolean(onInsertBoxPreset);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100 text-zinc-900"
      data-lp-add-components-panel="1"
      data-lp-add-root-mode={rootMode}
      data-lp-add-components-theme="light"
    >
      <div
        className="shrink-0 border-b border-slate-200 bg-white px-2 py-1.5"
        data-lp-add-root-tabs
      >
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            data-lp-add-root-tab="add"
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold',
              rootMode === 'add'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            )}
            onClick={() => {
              setRootMode('add');
              setSubView('root');
            }}
          >
            Thêm
          </button>
          <button
            type="button"
            data-lp-add-root-tab="layers"
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold',
              rootMode === 'layers'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            )}
            onClick={() => {
              setRootMode('layers');
              setSubView('root');
            }}
          >
            Section ({blocks?.length ?? 0})
          </button>
        </div>
      </div>

      {rootMode === 'layers' ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2" data-lp-add-components-layers>
          {!blocks?.length ? (
            <p className="px-1 py-3 text-[11px] text-slate-500">
              Chưa có section — dùng tab Thêm để chèn phần tử.
            </p>
          ) : (
            <ul className="space-y-1" data-lp-block-list>
              {blocks.map((b, index) => (
                <li
                  key={b.id}
                  data-lp-layer-id={b.id}
                  data-lp-layer-type={b.type}
                  draggable={Boolean(onReorderBlocks)}
                  onDragStart={() => {
                    dragIndex.current = index;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current == null || dragIndex.current === index) return;
                    onReorderBlocks?.(dragIndex.current, index);
                    dragIndex.current = null;
                  }}
                  className={cn(
                    'flex cursor-grab items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] shadow-sm',
                    selectedBlockId === b.id ? 'ring-2 ring-orange-400/60' : 'hover:border-sky-200',
                  )}
                  onClick={() => onSelectBlock?.(b.id)}
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                    {b.type}
                    {!b.enabled ? ' (ẩn)' : ''}
                    {b.locked ? ' 🔒' : ''}
                  </span>
                  {onReorderBlocks ? (['up', 'down'] as const).map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      aria-label={direction === 'up' ? 'Đưa block lên' : 'Đưa block xuống'}
                      data-lp-layer-move={direction}
                      disabled={b.locked || (direction === 'up' ? index === 0 : index === blocks.length - 1)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      onClick={(event) => {
                        event.stopPropagation();
                        onReorderBlocks(index, index + (direction === 'up' ? -1 : 1));
                      }}
                    >
                      {direction === 'up' ? '↑' : '↓'}
                    </button>
                  )) : null}
                  {onDupBlock ? (
                    <button
                      type="button"
                      className="min-h-11 rounded px-1.5 text-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDupBlock(b.id);
                      }}
                    >
                      Nhân bản
                    </button>
                  ) : null}
                  {onRemoveBlock ? (
                    <button
                      type="button"
                      className="min-h-11 rounded px-1.5 text-[10px] text-red-600/80 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBlock(b.id);
                      }}
                    >
                      Xóa
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2.5 py-3"
          data-lp-add-components-scroll
        >
          <CardGroup title={GROUP_BASIC}>
            {filterLiveCards(BASIC_CARDS).map((card) => renderComponentCard(card))}
            {showSocial ? renderComponentCard(SOCIAL_CARD) : null}
          </CardGroup>

          <CardGroup title={GROUP_ADVANCED}>
            {filterLiveCards(ADVANCED_CARDS).map((card) => renderComponentCard(card))}
          </CardGroup>

          {onInsertBoxPreset ? (
            <CardGroup title={GROUP_TOOLS}>
              {TOOL_CARDS.map((card) => renderComponentCard(card))}
            </CardGroup>
          ) : null}

          <CardGroup title={GROUP_SECTION_FALLBACK}>
            {filterLiveCards(SECTION_BLOCKS_WITHOUT_LIBRARY).map((card) => renderComponentCard(card))}
          </CardGroup>

          <CardGroup title={GROUP_ECOMMERCE}>
            {filterLiveCards(ECOMMERCE_CARDS).map((card) => renderComponentCard(card))}
          </CardGroup>
        </div>
      )}
    </div>
  );
}

function CardGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-lp-add-components-group={title}>
      <h3 className="mb-2 px-0.5 text-[11px] font-semibold text-slate-500">{title}</h3>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </section>
  );
}

function ComponentCard({
  card,
  onClick,
  draggable,
  onDragStart,
  dragKind,
}: {
  card: QuickCard;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLButtonElement>) => void;
  dragKind?: 'section-library' | 'button-library' | 'block-type' | 'picker';
}) {
  return (
    <button
      type="button"
      data-lp-add-component-card={card.id}
      data-lp-sidebar-draggable={dragKind}
      data-lp-sidebar-block-type={
        dragKind === 'block-type' && card.kind === 'block'
          ? card.blockType
          : dragKind === 'block-type' && card.kind === 'forms'
            ? 'LeadForm'
            : undefined
      }
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        'flex w-full flex-col items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-1.5 py-3 text-center shadow-sm transition hover:border-sky-200 hover:shadow-md',
        draggable && 'cursor-grab active:cursor-grabbing',
      )}
      onClick={(e) => {
        if(card.kind!=='layers'){ignoreSidebarElementClick(e);return;}
        onClick();
      }}
      onDoubleClick={card.kind==='layers'?undefined:ignoreSidebarElementClick}
      title={
        dragKind
          ? `${card.label} — giữ kéo vào canvas để chọn mẫu`
          : card.label
      }
    >
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-base text-sky-600"
        aria-hidden
      >
        {card.icon}
      </span>
      <span className="w-full truncate px-0.5 text-[10px] font-medium leading-tight text-slate-700">
        {card.label}
      </span>
    </button>
  );
}
