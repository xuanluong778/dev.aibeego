'use client';

/**
 * Text preset catalog + panel for Landing Page Builder
 * (Tiêu đề | Đoạn văn | Danh sách).
 * Additive UI — inserts styled text via existing Benefits + inlineTextStyles.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import type { LandingPageInlineTextStyle } from './landing-page-canvas-ux';
import { beginSidebarPresetDrag, suppressClickAfterSidebarDrag } from './landing-page-sidebar-dnd';
import { cn } from '@/lib/utils';

export type LandingPageTitlePreset = {
  id: string;
  label: string;
  style: LandingPageInlineTextStyle;
};

export type LandingPageParagraphPreset = {
  id: string;
  text: string;
  style: LandingPageInlineTextStyle;
};

export type LandingPageListBullet = 'bullet' | 'bullet-orange' | 'check';

export type LandingPageListPreset = {
  id: string;
  lines: string[];
  bullet: LandingPageListBullet;
  style: LandingPageInlineTextStyle;
};

/** Google fonts used by decorative title + paragraph presets (loaded once). */
export const LP_TITLE_PRESET_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Arima:wght@400;500&family=Black+Ops+One&family=Cormorant+Garamond:wght@300;400&family=Great+Vibes&family=Lobster&family=Montserrat:wght@600;700&family=Mulish:wght@400;500&family=Oswald:wght@500;600&family=Playfair+Display:wght@700&display=swap';

export function ensureLandingPageTitleFonts() {
  if (typeof document === 'undefined') return;
  const id = 'lp-title-preset-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = LP_TITLE_PRESET_FONTS_HREF;
  document.head.appendChild(link);
}

/** 23 presets matching the Tiêu đề panel sample (live typography preview). */
export const LP_TITLE_PRESETS: LandingPageTitlePreset[] = [
  {
    id: 'heading-3',
    label: 'Heading 3',
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
      headingLevel: 3,
    },
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
      headingLevel: 2,
    },
  },
  {
    id: 'heading-1',
    label: 'Heading 1',
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
      headingLevel: 1,
    },
  },
  {
    id: 'them-1',
    label: 'Thêm tiêu đề 1',
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'them-2',
    label: 'Thêm tiêu đề 2',
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: '#2563eb',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'them-3',
    label: 'Thêm tiêu đề 3',
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: '#ea580c',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'them-4',
    label: 'Thêm tiêu đề 4',
    style: {
      fontSize: 18,
      fontWeight: 500,
      color: '#f87171',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'them-5',
    label: 'Thêm tiêu đề 5',
    style: {
      fontSize: 14,
      fontWeight: 400,
      color: '#a8a29e',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'big-title',
    label: 'Big Title',
    style: {
      fontSize: 42,
      fontWeight: 900,
      color: '#0a0a0a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
      letterSpacing: '-0.02em',
    },
  },
  {
    id: 'caps-title',
    label: 'CAPS TITLE',
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: '#c2410c',
      textAlign: 'left',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'small-title',
    label: 'Small Title',
    style: {
      fontSize: 16,
      fontWeight: 500,
      color: '#78716c',
      textAlign: 'left',
      fontStyle: 'italic',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  {
    id: 'business-title',
    label: 'Business Title',
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: '#1e3a5f',
      textAlign: 'left',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  {
    id: 'huge-title',
    label: 'Huge Title',
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: '#5b21b6',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
      letterSpacing: '-0.03em',
    },
  },
  {
    id: 'luxury-title',
    label: 'Luxury Title',
    style: {
      fontSize: 30,
      fontWeight: 300,
      color: '#ec4899',
      textAlign: 'left',
      fontFamily: '"Cormorant Garamond", Didot, "Bodoni MT", serif',
      letterSpacing: '0.02em',
    },
  },
  {
    id: 'bold-title',
    label: 'Bold Title',
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: '#dc2626',
      textAlign: 'left',
      fontFamily: 'Georgia, "Rockwell", serif',
    },
  },
  {
    id: 'classic-title',
    label: 'Classic Title',
    style: {
      fontSize: 18,
      fontWeight: 500,
      color: '#9ca3af',
      textAlign: 'left',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  {
    id: 'magazine-title',
    label: 'MAGAZINE TITLE',
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: '#14532d',
      textAlign: 'left',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontFamily: '"Playfair Display", Georgia, serif',
    },
  },
  {
    id: 'game-title',
    label: 'GAME TITLE',
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: '#14b8a6',
      textAlign: 'left',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontFamily: '"Black Ops One", Impact, "Arial Black", sans-serif',
    },
  },
  {
    id: 'thin-title',
    label: 'Thin Title',
    style: {
      fontSize: 28,
      fontWeight: 200,
      color: '#5eead4',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'tall-title',
    label: 'Tall title',
    style: {
      fontSize: 26,
      fontWeight: 600,
      color: '#ea580c',
      textAlign: 'left',
      fontFamily: '"Oswald", "Arial Narrow", sans-serif',
      letterSpacing: '0.02em',
      lineHeight: 1.1,
    },
  },
  {
    id: 'lobster-title',
    label: 'Lobster title',
    style: {
      fontSize: 30,
      fontWeight: 400,
      color: '#ef4444',
      textAlign: 'left',
      fontFamily: '"Lobster", cursive',
    },
  },
  {
    id: 'writing-title',
    label: 'Writing title',
    style: {
      fontSize: 28,
      fontWeight: 400,
      color: '#60a5fa',
      textAlign: 'left',
      fontFamily: '"Great Vibes", cursive',
    },
  },
  {
    id: 'discover',
    label: 'DISCOVER',
    style: {
      fontSize: 36,
      fontWeight: 900,
      textAlign: 'left',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontFamily: 'system-ui, sans-serif',
      backgroundImage: 'linear-gradient(120deg, #38bdf8 0%, #0ea5e9 45%, #7dd3fc 100%)',
      backgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      color: 'transparent',
    },
  },
];

const VI_PARAGRAPH =
  'Đây là một đoạn văn bản. Nhấp vào đây để thay đổi nội dung theo ý bạn một cách dễ dàng!';

/** Paragraph presets matching the Đoạn văn panel sample. */
export const LP_PARAGRAPH_PRESETS: LandingPageParagraphPreset[] = [
  {
    id: 'para-en',
    text: 'Add a paragraph text here. Click to the textbox to customize content, font style, color of your paragraph.',
    style: {
      fontSize: 15,
      fontWeight: 400,
      color: '#0f172a',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'para-orange',
    text: VI_PARAGRAPH,
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#f97316',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'para-blue',
    text: VI_PARAGRAPH,
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#4f46e5',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'para-dark',
    text: VI_PARAGRAPH,
    style: {
      fontSize: 15,
      fontWeight: 400,
      color: '#334155',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'para-muted',
    text: VI_PARAGRAPH,
    style: {
      fontSize: 15,
      fontWeight: 400,
      color: '#94a3b8',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'para-montserrat',
    text: 'Montserrat is a geometric sans-serif typeface designed by Argentine graphic designer Julieta Ulanovsky and released in 2011.',
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#0f172a',
      textAlign: 'left',
      lineHeight: 1.5,
      fontFamily: '"Montserrat", system-ui, sans-serif',
    },
  },
  {
    id: 'para-mulish',
    text: 'Mulish is a minimalist Sans Serif typeface, designed for both display and text typography. It was initially drawn in 2011 by Vernon Adams.',
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: '#64748b',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: '"Mulish", system-ui, sans-serif',
    },
  },
  {
    id: 'para-arima',
    text: 'Arima font features a friendly and approachable style with rounded edges and a slightly playful character. The design is versatile, suitable for both digital and print media.',
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: '#1e293b',
      textAlign: 'left',
      lineHeight: 1.55,
      fontFamily: '"Arima", Georgia, serif',
    },
  },
];

const VI_LIST_LINES = [
  'Thêm dòng văn bản thứ 1 tại đây',
  'Thêm dòng văn bản thứ 2 tại đây',
  'Thêm dòng văn bản thứ 3 tại đây',
  'Thêm dòng văn bản thứ 4 tại đây',
];

/** List presets matching the Danh sách panel sample. */
export const LP_LIST_PRESETS: LandingPageListPreset[] = [
  {
    id: 'list-bullet-en',
    bullet: 'bullet',
    lines: [
      'Add text line 1 here',
      'Add text line 2 here',
      'Add text line 3 here',
      'Add text line 4 here',
    ],
    style: {
      fontSize: 15,
      fontWeight: 400,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'list-bullet-orange',
    bullet: 'bullet-orange',
    lines: VI_LIST_LINES,
    style: {
      fontSize: 14,
      fontWeight: 400,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
  {
    id: 'list-check',
    bullet: 'check',
    lines: [VI_LIST_LINES[0]!, VI_LIST_LINES[1]!],
    style: {
      fontSize: 15,
      fontWeight: 400,
      color: '#0f172a',
      textAlign: 'left',
      fontFamily: 'system-ui, sans-serif',
    },
  },
];

export type TextPresetTab = 'title' | 'paragraph' | 'list';

type PanelProps = {
  onClose: () => void;
  onInsertTitle: (preset: LandingPageTitlePreset) => void;
  onInsertParagraph?: (preset: LandingPageParagraphPreset) => void;
  onInsertList?: (preset: LandingPageListPreset) => void;
  /** Optional initial tab when opening the panel. */
  initialTab?: TextPresetTab;
  /** Render in normal flow inside an existing library dialog. */
  embedded?: boolean;
  onTabChange?: (tab: TextPresetTab) => void;
  /** Optional class merge (e.g. right-rail embedded). */
  className?: string;
};

function previewStyle(style: LandingPageInlineTextStyle, maxPx = 16): CSSProperties {
  return {
    fontSize: style.fontSize ? `${Math.min(style.fontSize, maxPx)}px` : undefined,
    fontWeight: style.fontWeight as CSSProperties['fontWeight'],
    color: style.backgroundImage ? undefined : style.color,
    fontFamily: style.fontFamily,
    fontStyle: style.fontStyle,
    textTransform: style.textTransform,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight || 1.45,
    ...(style.backgroundImage
      ? {
          backgroundImage: style.backgroundImage,
          WebkitBackgroundClip: 'text' as const,
          backgroundClip: 'text' as const,
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }
      : null),
  };
}

function ListBulletMark({ bullet }: { bullet: LandingPageListBullet }) {
  if (bullet === 'check') {
    return (
      <span
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
        aria-hidden
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className={cn(
        'mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full',
        bullet === 'bullet-orange' ? 'bg-orange-500' : 'bg-zinc-900',
      )}
      aria-hidden
    />
  );
}

/** Overlay panel: Tiêu đề | Đoạn văn | Danh sách */
export function LandingPageTextPresetsPanel({
  onClose,
  onInsertTitle,
  onInsertParagraph,
  onInsertList,
  initialTab = 'title',
  embedded = false,
  onTabChange,
  className,
}: PanelProps) {
  const [tab, setTab] = useState<TextPresetTab>(initialTab);

  useEffect(() => {
    ensureLandingPageTitleFonts();
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function selectTab(next: TextPresetTab) {
    setTab(next);
    onTabChange?.(next);
  }

  return (
    <div
      data-lp-sidebar-overlay={embedded ? undefined : 'text'}
      data-lp-library-embedded={embedded ? '1' : undefined}
      data-lp-text-presets-panel="1"
      className={cn(
        'flex flex-col overflow-hidden bg-white',
        embedded
          ? 'relative min-h-0 min-w-0 w-full flex-1'
          : 'absolute left-full top-0 z-40 ml-2 w-[min(320px,calc(100vw-4.5rem))] h-[min(calc(100vh-var(--builder-top-offset,6.75rem)-1rem),780px)] rounded-xl border border-zinc-200 shadow-xl max-md:fixed max-md:left-3 max-md:right-3 max-md:top-16 max-md:ml-0 max-md:h-[min(80vh,720px)] max-md:w-auto',
        className,
      )}
      role={embedded ? 'region' : 'dialog'}
      aria-label="Mẫu văn bản"
    >
      <div className="flex shrink-0 items-center border-b border-zinc-100 px-3 pt-2">
        {(
          [
            { id: 'title' as const, label: 'Tiêu đề' },
            { id: 'paragraph' as const, label: 'Đoạn văn' },
            { id: 'list' as const, label: 'Danh sách' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            data-lp-text-tab={t.id}
            data-lp-text-tab-active={tab === t.id ? '1' : '0'}
            className={cn(
              'relative px-2.5 pb-2.5 pt-1 text-sm font-medium transition',
              tab === t.id ? 'text-violet-600' : 'text-zinc-500 hover:text-zinc-800',
            )}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
            {tab === t.id ? (
              <span
                className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-violet-600"
                aria-hidden
              />
            ) : null}
          </button>
        ))}
        <button
          type="button"
          data-lp-sidebar-close
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          onClick={onClose}
          title="Đóng"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3" data-lp-text-presets-scroll>
        {tab === 'title' ? (
          <>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Tiêu đề
            </div>
            <ul
              className="space-y-1"
              data-lp-title-preset-list
              data-lp-title-preset-count={LP_TITLE_PRESETS.length}
            >
              {LP_TITLE_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    draggable
                    data-lp-title-preset={preset.id}
                    data-lp-sidebar-draggable="title"
                    className="block w-full cursor-grab rounded-lg px-2 py-2.5 text-left transition hover:bg-zinc-50 active:cursor-grabbing"
                    onClick={(e) => {
                      if (suppressClickAfterSidebarDrag(e)) return;
                      onInsertTitle(preset);
                    }}
                    onDragStart={(e) =>
                      beginSidebarPresetDrag(e, { kind: 'title', preset }, preset.label)
                    }
                    title={`Chèn «${preset.label}» — kéo thả vào canvas`}
                  >
                    <span
                      className="block max-w-full truncate leading-tight"
                      style={previewStyle(preset.style, 36)}
                    >
                      {preset.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {tab === 'paragraph' ? (
          <>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Đoạn văn
            </div>
            <ul
              className="space-y-2"
              data-lp-paragraph-preset-list
              data-lp-paragraph-preset-count={LP_PARAGRAPH_PRESETS.length}
            >
              {LP_PARAGRAPH_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    draggable
                    data-lp-paragraph-preset={preset.id}
                    data-lp-sidebar-draggable="paragraph"
                    className="block w-full cursor-grab rounded-lg px-2 py-2.5 text-left transition hover:bg-zinc-50 active:cursor-grabbing"
                    onClick={(e) => {
                      if (suppressClickAfterSidebarDrag(e)) return;
                      onInsertParagraph?.(preset);
                    }}
                    onDragStart={(e) =>
                      beginSidebarPresetDrag(
                        e,
                        { kind: 'paragraph', preset },
                        preset.text.slice(0, 48),
                      )
                    }
                    title="Chèn đoạn văn — kéo thả vào canvas"
                  >
                    <span
                      className="block max-w-full whitespace-normal leading-snug"
                      style={previewStyle(preset.style, 14)}
                    >
                      {preset.text}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {tab === 'list' ? (
          <>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Danh sách
            </div>
            <ul
              className="space-y-3"
              data-lp-list-preset-list
              data-lp-list-preset-count={LP_LIST_PRESETS.length}
            >
              {LP_LIST_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    draggable
                    data-lp-list-preset={preset.id}
                    data-lp-sidebar-draggable="list"
                    className="block w-full cursor-grab rounded-lg px-2 py-2.5 text-left transition hover:bg-zinc-50 active:cursor-grabbing"
                    onClick={(e) => {
                      if (suppressClickAfterSidebarDrag(e)) return;
                      onInsertList?.(preset);
                    }}
                    onDragStart={(e) =>
                      beginSidebarPresetDrag(e, { kind: 'list', preset }, 'Danh sách')
                    }
                    title="Chèn danh sách — kéo thả vào canvas"
                  >
                    <ul className="space-y-1.5" style={previewStyle(preset.style, 14)}>
                      {preset.lines.map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ListBulletMark bullet={preset.bullet} />
                          <span className="min-w-0 flex-1">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
