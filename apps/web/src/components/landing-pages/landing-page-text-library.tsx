'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ensureLandingPageTitleFonts,
  LP_TITLE_PRESETS,
  LP_PARAGRAPH_PRESETS,
  LP_LIST_PRESETS,
  type LandingPageTitlePreset,
  type LandingPageParagraphPreset,
  type LandingPageListPreset,
  type TextPresetTab,
} from './landing-page-title-presets';
import './landing-page-text-library.css';

type Category = 'all' | 'themed' | TextPresetTab;
type TextCard =
  | { kind: 'title'; preset: LandingPageTitlePreset; large?: boolean }
  | { kind: 'paragraph'; preset: LandingPageParagraphPreset; large?: boolean }
  | { kind: 'list'; preset: LandingPageListPreset };

const intro =
  "Use this space to elaborate on your headline and connect with your visitors. You can build on the first idea or add your second point. Now that you've got your visitors' attention, let them know what they can expect, and encourage them to explore your site.";
const serif = 'Georgia, "Times New Roman", serif';
const themedCards: TextCard[] = [
  {
    kind: 'title',
    preset: {
      id: 'theme-intro-center',
      label: 'Introduce your idea',
      style: {
        fontFamily: serif,
        fontSize: 36,
        fontWeight: 700,
        textAlign: 'center',
        color: '#212830',
        textTransform: 'uppercase',
      },
    },
  },
  {
    kind: 'paragraph',
    preset: {
      id: 'theme-intro-left',
      text: intro,
      style: { fontFamily: serif, fontSize: 18, textAlign: 'left', color: '#212830' },
    },
  },
  {
    kind: 'title',
    preset: {
      id: 'theme-intro-light',
      label: 'Introduce your idea',
      style: {
        fontFamily: serif,
        fontSize: 34,
        fontWeight: 600,
        textAlign: 'center',
        color: '#212830',
        textTransform: 'uppercase',
      },
    },
  },
  {
    kind: 'title',
    preset: {
      id: 'theme-intro-start',
      label: 'Introduce your idea',
      style: {
        fontFamily: serif,
        fontSize: 36,
        fontWeight: 700,
        textAlign: 'left',
        color: '#212830',
        textTransform: 'uppercase',
      },
    },
  },
  {
    kind: 'paragraph',
    large: true,
    preset: {
      id: 'theme-intro-justify',
      text: intro,
      style: { fontFamily: serif, fontSize: 20, textAlign: 'justify', color: '#212830' },
    },
  },
  {
    kind: 'paragraph',
    preset: {
      id: 'theme-intro-center',
      text: intro,
      style: { fontFamily: serif, fontSize: 18, textAlign: 'center', color: '#212830' },
    },
  },
  {
    kind: 'title',
    large: true,
    preset: {
      id: 'theme-add-title',
      label: 'Add your title',
      style: {
        fontFamily: serif,
        fontSize: 48,
        fontWeight: 700,
        textAlign: 'center',
        color: '#212830',
        textTransform: 'uppercase',
      },
    },
  },
  {
    kind: 'title',
    large: true,
    preset: {
      id: 'theme-add-title-start',
      label: 'Add your title',
      style: {
        fontFamily: serif,
        fontSize: 48,
        fontWeight: 700,
        textAlign: 'left',
        color: '#212830',
        textTransform: 'uppercase',
      },
    },
  },
];

const categories: Array<{ id: Category; label: string }> = [
  { id: 'all', label: 'Tất cả các danh mục' },
  { id: 'themed', label: 'Có chủ đề' },
  { id: 'title', label: 'Tiêu đề' },
  { id: 'paragraph', label: 'Đoạn' },
  { id: 'list', label: 'Danh sách' },
];

export function LandingPageTextLibrary({
  initialTab,
  onTitle,
  onParagraph,
  onList,
}: {
  initialTab?: TextPresetTab;
  onTitle: (preset: LandingPageTitlePreset) => void;
  onParagraph: (preset: LandingPageParagraphPreset) => void;
  onList: (preset: LandingPageListPreset) => void;
}) {
  const [category, setCategory] = useState<Category>(initialTab || 'all');
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureLandingPageTitleFonts();
  }, []);
  useEffect(() => {
    setCategory(initialTab || 'all');
  }, [initialTab]);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0 });
  }, [category]);

  function card(item: TextCard, themed = false) {
    const preset = item.preset;
    const style = preset.style;
    const preview: CSSProperties = {
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight as CSSProperties['fontWeight'],
      fontStyle: style.fontStyle,
      textAlign: style.textAlign,
      letterSpacing: style.letterSpacing,
      color: '#ffffff',
      ...(themed ? { fontVariant: 'small-caps' } : { textTransform: style.textTransform }),
    };
    const choose = () => {
      if (item.kind === 'title') onTitle(item.preset);
      else if (item.kind === 'paragraph') onParagraph(item.preset);
      else onList(item.preset);
    };
    return (
      <button
        key={item.kind + ':' + preset.id}
        type="button"
        className="lp-text-library__card"
        data-lp-text-library-card={item.kind}
        data-lp-title-preset={item.kind === 'title' ? preset.id : undefined}
        data-lp-paragraph-preset={item.kind === 'paragraph' ? preset.id : undefined}
        data-lp-list-preset={item.kind === 'list' ? preset.id : undefined}
        data-large={'large' in item && item.large ? '1' : undefined}
        data-themed={themed ? '1' : undefined}
        onClick={choose}
        aria-label={`Chèn ${item.kind === 'title' ? 'tiêu đề' : item.kind === 'paragraph' ? 'đoạn văn' : 'danh sách'}: ${item.kind === 'title' ? item.preset.label : item.kind === 'paragraph' ? item.preset.text.slice(0, 80) : item.preset.lines[0]}`}
      >
        {item.kind === 'list' ? (
          <ul style={preview}>
            {item.preset.lines.map((line, i) => (
              <li key={i}>
                <span aria-hidden>{item.preset.bullet === 'check' ? '✓' : '•'}</span>
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <span className="lp-text-library__preview" style={preview}>
            {item.kind === 'title' ? item.preset.label : item.preset.text}
          </span>
        )}
      </button>
    );
  }
  function section(id: Exclude<Category, 'all'>, label: string, cards: TextCard[]) {
    if (category !== 'all' && category !== id) return null;
    return (
      <section
        className="lp-text-library__section"
        key={id}
        data-lp-text-library-section={id}
        aria-label={label}
      >
        <h3>{label}</h3>
        <div className="lp-text-library__columns" data-lp-text-card-columns>
          {[0, 1].map((column) => (
            <div className="lp-text-library__column" key={column}>
              {cards.filter((_, i) => i % 2 === column).map((item) => card(item, id === 'themed'))}
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <div className="lp-text-library" data-lp-text-presets-panel="1" data-lp-library-embedded="1">
      <aside className="lp-text-library__sidebar" aria-label="Danh mục văn bản">
        <div className="lp-text-library__heading">Văn bản</div>
        <nav aria-label="Loại mẫu văn bản">
          {categories.map((item) => (
            <button
              type="button"
              key={item.id}
              data-lp-text-category={item.id}
              data-lp-text-tab={item.id}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="lp-text-library__content" data-lp-text-presets-scroll ref={scroll}>
        {section('themed', 'Có chủ đề', themedCards)}
        {section(
          'title',
          'Tiêu đề',
          LP_TITLE_PRESETS.map((preset) => ({ kind: 'title', preset })),
        )}
        {section(
          'paragraph',
          'Đoạn',
          LP_PARAGRAPH_PRESETS.map((preset) => ({ kind: 'paragraph', preset })),
        )}
        {section(
          'list',
          'Danh sách',
          LP_LIST_PRESETS.map((preset) => ({ kind: 'list', preset })),
        )}
      </div>
    </div>
  );
}
