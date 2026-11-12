'use client';

/**
 * Button + button-group presets panel for Landing Page Builder (rail «Nút bấm»).
 * Inserts CTA (single) or Benefits nav-group — reuses existing blocks/drag/history.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { beginSidebarPresetDrag, suppressClickAfterSidebarDrag } from './landing-page-sidebar-dnd';
import { cn } from '@/lib/utils';

/** Button chrome — mirrors LandingPageCanvasStyle fields used by CTA.style. */
export type LandingPageButtonChromeStyle = {
  width?: string;
  padding?: string;
  background?: string;
  backgroundImage?: string;
  color?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  letterSpacing?: string;
  lineHeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
};

export type LandingPageButtonPreset = {
  id: string;
  label: string;
  /** Visual chrome applied to CTA block.style + ctaLabel color. */
  style: LandingPageButtonChromeStyle;
  /** Icon-only square/circle buttons. */
  iconOnly?: boolean;
};

export type LandingPageButtonGroupVariant =
  | 'row-plain'
  | 'row-underline'
  | 'row-active-block'
  | 'row-bar-blue'
  | 'row-bar-dark'
  | 'row-outline'
  | 'row-orange'
  | 'row-pastel'
  | 'row-pill'
  | 'row-mixed'
  | 'col-teal'
  | 'col-gray'
  | 'col-orange'
  | 'col-blue'
  | 'col-black'
  | 'col-yellow'
  | 'col-green'
  | 'col-peach';

export type LandingPageButtonGroupPreset = {
  id: string;
  variant: LandingPageButtonGroupVariant;
  labels: string[];
  /** Preview layout hint. */
  layout: 'row' | 'col';
};

export type ButtonPresetTab = 'buttons' | 'groups';

const EN_NAV = ['Products', 'Solutions', 'Pricing', 'Contact'];
const VI_NAV = ['Giới thiệu', 'Bảng giá', 'Bộ sưu tập', 'Liên hệ'];

function btn(
  id: string,
  label: string,
  style: LandingPageButtonChromeStyle,
  iconOnly?: boolean,
): LandingPageButtonPreset {
  return { id, label, style, iconOnly };
}

/** Single button presets — live previews matching sample palette. */
export const LP_BUTTON_PRESETS: LandingPageButtonPreset[] = [
  btn('solid-black', 'Nút bấm', {
    background: '#0f172a',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: '14px',
  }),
  btn('soft-gray', 'Nút bấm', {
    background: '#e2e8f0',
    color: '#334155',
    borderRadius: '6px',
    padding: '10px 22px',
    fontWeight: 600,
    fontSize: '14px',
  }),
  btn('solid-blue', 'Nút bấm', {
    background: '#3b82f6',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: '14px',
  }),
  btn('outline-blue', "Let's Go", {
    background: 'transparent',
    color: '#2563eb',
    border: '2px solid #2563eb',
    borderRadius: '6px',
    padding: '9px 20px',
    fontWeight: 700,
    fontSize: '14px',
  }),
  btn('outline-dark', 'Nút bấm', {
    background: 'transparent',
    color: '#0f172a',
    border: '2px solid #0f172a',
    borderRadius: '6px',
    padding: '9px 20px',
    fontWeight: 700,
    fontSize: '14px',
  }),
  btn('shadow-blue', 'Nút bấm', {
    background: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '11px 24px',
    fontWeight: 800,
    fontSize: '14px',
    boxShadow: '0 8px 20px rgba(37,99,235,0.35)',
  }),
  btn('pill-orange', 'Mua Ngay →', {
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '999px',
    padding: '11px 26px',
    fontWeight: 800,
    fontSize: '14px',
  }),
  btn('pill-sky', 'THAM GIA', {
    background: '#7dd3fc',
    color: '#0c4a6e',
    borderRadius: '999px',
    padding: '11px 28px',
    fontWeight: 800,
    fontSize: '13px',
    letterSpacing: '0.04em',
  }),
  btn('link-muted', 'Trở về trang chủ', {
    background: 'transparent',
    color: '#64748b',
    borderRadius: '0',
    padding: '4px 0',
    fontWeight: 500,
    fontSize: '14px',
  }),
  btn('link-underline', 'Trang chủ', {
    background: 'transparent',
    color: '#0f172a',
    borderRadius: '0',
    padding: '4px 0',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
  }),
  btn('solid-teal', 'Xem Thêm', {
    background: '#0f766e',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: '14px',
  }),
  btn('download', '↓ TẢI XUỐNG', {
    background: '#1e3a5f',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '11px 22px',
    fontWeight: 800,
    fontSize: '13px',
    letterSpacing: '0.03em',
  }),
  btn('send-navy', 'GỬI', {
    background: '#1e3a8a',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '10px 28px',
    fontWeight: 800,
    fontSize: '14px',
  }),
  btn('join-us', 'JOIN US', {
    background: '#0f172a',
    color: '#f8fafc',
    borderRadius: '4px',
    padding: '12px 28px',
    fontWeight: 900,
    fontSize: '14px',
    letterSpacing: '0.08em',
  }),
  btn('chat-tan', '💬 Chat me now', {
    background: '#d6b48c',
    color: '#3f2e1e',
    borderRadius: '999px',
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: '13px',
  }),
  btn('call-us', '☺ Gọi chúng tôi', {
    background: '#7c3aed',
    color: '#ffffff',
    borderRadius: '999px',
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: '13px',
  }),
  btn('pill-go', 'GO', {
    background: '#22c55e',
    color: '#ffffff',
    borderRadius: '999px',
    padding: '8px 22px',
    fontWeight: 800,
    fontSize: '12px',
  }),
  btn('pill-send', 'SEND', {
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '999px',
    padding: '8px 22px',
    fontWeight: 800,
    fontSize: '12px',
  }),
  btn('outline-see', 'SEE ALL', {
    background: 'transparent',
    color: '#0f172a',
    border: '2px solid #0f172a',
    borderRadius: '999px',
    padding: '7px 18px',
    fontWeight: 800,
    fontSize: '12px',
  }),
  btn('link-all', 'XEM TẤT CẢ', {
    background: 'transparent',
    color: '#2563eb',
    padding: '4px 0',
    fontWeight: 700,
    fontSize: '13px',
  }),
  // Icon buttons
  btn('ico-doc', '📄', { background: '#7c3aed', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-home', '🏠', { background: '#1e3a8a', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-up', '↑', { background: '#06b6d4', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center', fontWeight: 800 }, true),
  btn('ico-bag', '🛒', { background: '#38bdf8', color: '#0c4a6e', borderRadius: '10px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-mail', '✉', { background: '#f9a8d4', color: '#831843', borderRadius: '10px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-arrow', '→', { background: '#facc15', color: '#713f12', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center', fontWeight: 800 }, true),
  btn('ico-x', '✕', { background: '#0f172a', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '14px', width: '44px', textAlign: 'center', fontWeight: 700 }, true),
  btn('ico-msg', '💬', { background: '#a78bfa', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-edit', '✎', { background: '#3b82f6', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-pin', '📍', { background: '#14b8a6', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-phone', '📞', { background: '#1d4ed8', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-video', '📹', { background: '#92400e', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-user', '👤', { background: '#d6b48c', color: '#3f2e1e', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-star', '★', { background: '#ea580c', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
  btn('ico-home2', '⌂', { background: '#64748b', color: '#fff', borderRadius: '999px', padding: '12px', fontSize: '16px', width: '44px', textAlign: 'center' }, true),
];

function group(
  id: string,
  variant: LandingPageButtonGroupVariant,
  labels: string[],
  layout: 'row' | 'col',
): LandingPageButtonGroupPreset {
  return { id, variant, labels, layout };
}

/** Button group presets (EN nav + VI nav styles from samples). */
export const LP_BUTTON_GROUP_PRESETS: LandingPageButtonGroupPreset[] = [
  group('en-plain', 'row-plain', EN_NAV, 'row'),
  group('en-underline', 'row-underline', EN_NAV, 'row'),
  group('en-active-block', 'row-active-block', EN_NAV, 'row'),
  group('en-bar-blue', 'row-bar-blue', EN_NAV, 'row'),
  group('en-bar-dark', 'row-bar-dark', EN_NAV, 'row'),
  group('en-outline', 'row-outline', EN_NAV, 'row'),
  group('vi-orange', 'row-orange', VI_NAV, 'row'),
  group('vi-pastel', 'row-pastel', VI_NAV, 'row'),
  group('vi-pill', 'row-pill', VI_NAV, 'row'),
  group('vi-mixed', 'row-mixed', VI_NAV, 'row'),
  group('vi-col-teal', 'col-teal', VI_NAV, 'col'),
  group('vi-col-gray', 'col-gray', VI_NAV, 'col'),
  group('vi-col-orange', 'col-orange', VI_NAV, 'col'),
  group('vi-col-blue', 'col-blue', VI_NAV, 'col'),
  group('vi-col-black', 'col-black', VI_NAV, 'col'),
  group('vi-col-yellow', 'col-yellow', VI_NAV, 'col'),
  group('vi-col-green', 'col-green', VI_NAV, 'col'),
  group('vi-col-peach', 'col-peach', VI_NAV, 'col'),
];

export function navIconForVariant(variant: LandingPageButtonGroupVariant): string {
  return `nav:${variant}`.slice(0, 40);
}

export function parseNavVariant(icon: string | null | undefined): LandingPageButtonGroupVariant | null {
  const raw = String(icon || '');
  if (!raw.startsWith('nav:')) return null;
  return raw.slice(4) as LandingPageButtonGroupVariant;
}

/** Canvas styles for nav-group items (shared with panel preview). */
export function navGroupItemStyle(
  variant: LandingPageButtonGroupVariant,
  index: number,
  activeIndex = 0,
): CSSProperties {
  const on = index === activeIndex;
  switch (variant) {
    case 'row-plain':
      return { color: '#334155', fontSize: 14, fontWeight: 500, padding: '8px 12px' };
    case 'row-underline':
      return {
        color: on ? '#2563eb' : '#64748b',
        fontSize: 14,
        fontWeight: on ? 700 : 500,
        padding: '8px 12px',
        borderBottom: on ? '2px solid #2563eb' : '2px solid transparent',
      };
    case 'row-active-block':
      return {
        background: on ? '#0f172a' : 'transparent',
        color: on ? '#fff' : '#334155',
        fontSize: 14,
        fontWeight: 600,
        padding: '10px 14px',
      };
    case 'row-bar-blue':
      return {
        background: on ? '#2563eb' : '#0f172a',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        padding: '10px 14px',
      };
    case 'row-bar-dark':
      return {
        background: on ? '#0f172a' : '#e2e8f0',
        color: on ? '#fff' : '#334155',
        fontSize: 14,
        fontWeight: 700,
        padding: '10px 14px',
      };
    case 'row-outline':
      return {
        background: on ? '#0f172a' : 'transparent',
        color: on ? '#fff' : '#0f172a',
        border: '1px solid #0f172a',
        fontSize: 14,
        fontWeight: 600,
        padding: '9px 14px',
      };
    case 'row-orange':
      return {
        background: on ? '#ea580c' : '#fff',
        color: on ? '#fff' : '#ea580c',
        border: '1px solid #ea580c',
        fontSize: 14,
        fontWeight: 700,
        padding: '9px 14px',
        borderRadius: 6,
      };
    case 'row-pastel':
      return {
        background: ['#fef08a', '#fbcfe8', '#fef08a', '#fbcfe8'][index % 4],
        color: '#57534e',
        fontSize: 14,
        fontWeight: 600,
        padding: '9px 14px',
        borderRadius: 6,
      };
    case 'row-pill':
      return {
        background: ['#7c3aed', '#facc15', '#7dd3fc', '#f9a8d4'][index % 4],
        color: index === 1 ? '#713f12' : '#fff',
        fontSize: 14,
        fontWeight: 700,
        padding: '10px 16px',
        borderRadius: 999,
      };
    case 'row-mixed':
      return on
        ? { background: '#14532d', color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 14px', borderRadius: 6 }
        : { color: '#14532d', fontSize: 14, fontWeight: 600, padding: '9px 12px' };
    case 'col-teal':
      return {
        background: '#0f766e',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        padding: '12px 20px',
        borderRadius: 999,
        display: 'block',
        textAlign: 'center',
      };
    case 'col-gray':
      return {
        background: '#e2e8f0',
        color: '#334155',
        fontSize: 15,
        fontWeight: 700,
        padding: '12px 20px',
        borderRadius: 999,
        display: 'block',
        textAlign: 'center',
      };
    case 'col-orange':
      return on
        ? { background: '#ea580c', color: '#fff', fontSize: 15, fontWeight: 700, padding: '12px 16px', borderRadius: 8, display: 'block', textAlign: 'center' }
        : { background: '#fff', color: '#ea580c', border: '1px solid #ea580c', fontSize: 15, fontWeight: 600, padding: '12px 16px', borderRadius: 8, display: 'block', textAlign: 'center' };
    case 'col-blue':
      return on
        ? { background: '#2563eb', color: '#fff', fontSize: 15, fontWeight: 700, padding: '12px 16px', display: 'block', textAlign: 'center' }
        : { background: '#dbeafe', color: '#1e3a8a', fontSize: 15, fontWeight: 600, padding: '12px 16px', display: 'block', textAlign: 'center', borderTop: '1px solid #bfdbfe' };
    case 'col-black':
      return on
        ? { background: '#0f172a', color: '#fff', fontSize: 15, fontWeight: 700, fontStyle: 'italic', padding: '12px 16px', display: 'block', textAlign: 'center' }
        : { color: '#0f172a', fontSize: 15, fontWeight: 500, padding: '12px 16px', display: 'block', textAlign: 'center', borderTop: '1px solid #e2e8f0' };
    case 'col-yellow':
      return on
        ? { background: '#facc15', color: '#422006', fontSize: 15, fontWeight: 800, padding: '12px 16px', display: 'block', textAlign: 'center' }
        : { color: '#0f172a', fontSize: 15, fontWeight: 700, padding: '12px 16px', display: 'block', textAlign: 'center' };
    case 'col-green':
      return {
        background: on ? '#14532d' : '#166534',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        padding: '12px 16px',
        display: 'block',
        textAlign: 'center',
      };
    case 'col-peach':
      return {
        background: on ? '#fdba74' : '#ffedd5',
        color: '#7c2d12',
        fontSize: 15,
        fontWeight: 700,
        padding: '12px 16px',
        display: 'block',
        textAlign: 'center',
      };
    default:
      return { fontSize: 14, padding: '8px 12px' };
  }
}

export function isNavGroupColumn(variant: LandingPageButtonGroupVariant): boolean {
  return variant.startsWith('col-');
}

type PanelProps = {
  onClose: () => void;
  onInsertButton: (preset: LandingPageButtonPreset) => void;
  onInsertGroup: (preset: LandingPageButtonGroupPreset) => void;
  initialTab?: ButtonPresetTab;
  onTabChange?: (tab: ButtonPresetTab) => void;
  /** Optional class merge (e.g. right-rail embedded). */
  className?: string;
};

/** Live preview chrome — matches what CTA.style applies on canvas. */
export function previewBtnStyle(style: LandingPageButtonChromeStyle): CSSProperties {
  return {
    background: style.backgroundImage ? undefined : style.background,
    backgroundImage: style.backgroundImage,
    color: style.color,
    borderRadius: style.borderRadius,
    padding: style.padding || '8px 14px',
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight as CSSProperties['fontWeight'],
    fontStyle: style.fontStyle,
    fontSize: style.fontSize || '12px',
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight ?? 1.2,
    boxShadow: style.boxShadow,
    border: style.border || 'none',
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: style.width,
    textAlign: style.textAlign,
    whiteSpace: 'nowrap',
  };
}

function GroupPreview({ preset }: { preset: LandingPageButtonGroupPreset }) {
  const { variant, labels, layout } = preset;
  const active = 0;
  const isCol = layout === 'col';

  const itemClass = (i: number): CSSProperties => {
    const on = i === active;
    switch (variant) {
      case 'row-plain':
        return { color: '#334155', fontSize: 11, fontWeight: 500, padding: '4px 8px' };
      case 'row-underline':
        return {
          color: on ? '#2563eb' : '#64748b',
          fontSize: 11,
          fontWeight: on ? 700 : 500,
          padding: '4px 8px',
          borderBottom: on ? '2px solid #2563eb' : '2px solid transparent',
        };
      case 'row-active-block':
        return {
          background: on ? '#0f172a' : 'transparent',
          color: on ? '#fff' : '#334155',
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 10px',
        };
      case 'row-bar-blue':
        return {
          background: on ? '#2563eb' : '#0f172a',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '7px 10px',
        };
      case 'row-bar-dark':
        return {
          background: on ? '#0f172a' : '#e2e8f0',
          color: on ? '#fff' : '#334155',
          fontSize: 11,
          fontWeight: 700,
          padding: '7px 10px',
        };
      case 'row-outline':
        return {
          background: on ? '#0f172a' : 'transparent',
          color: on ? '#fff' : '#0f172a',
          border: '1px solid #0f172a',
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 10px',
        };
      case 'row-orange':
        return {
          background: on ? '#ea580c' : '#fff',
          color: on ? '#fff' : '#ea580c',
          border: '1px solid #ea580c',
          fontSize: 11,
          fontWeight: 700,
          padding: '6px 10px',
          borderRadius: 4,
        };
      case 'row-pastel':
        return {
          background: ['#fef08a', '#fbcfe8', '#fef08a', '#fbcfe8'][i % 4],
          color: '#57534e',
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 10px',
          borderRadius: 4,
        };
      case 'row-pill':
        return {
          background: ['#7c3aed', '#facc15', '#7dd3fc', '#f9a8d4'][i % 4],
          color: i === 1 ? '#713f12' : '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '7px 12px',
          borderRadius: 999,
        };
      case 'row-mixed':
        return on
          ? { background: '#14532d', color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 4 }
          : { color: '#14532d', fontSize: 11, fontWeight: 600, padding: '6px 8px' };
      case 'col-teal':
        return {
          background: '#0f766e',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '10px 16px',
          borderRadius: 999,
          width: '100%',
          textAlign: 'center',
        };
      case 'col-gray':
        return {
          background: '#e2e8f0',
          color: '#334155',
          fontSize: 12,
          fontWeight: 700,
          padding: '10px 16px',
          borderRadius: 999,
          width: '100%',
          textAlign: 'center',
        };
      case 'col-orange':
        return on
          ? { background: '#ea580c', color: '#fff', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 6, width: '100%', textAlign: 'center' }
          : { background: '#fff', color: '#ea580c', border: '1px solid #ea580c', fontSize: 12, fontWeight: 600, padding: '10px 14px', borderRadius: 6, width: '100%', textAlign: 'center' };
      case 'col-blue':
        return on
          ? { background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 700, padding: '10px 14px', width: '100%', textAlign: 'center' }
          : { background: '#dbeafe', color: '#1e3a8a', fontSize: 12, fontWeight: 600, padding: '10px 14px', width: '100%', textAlign: 'center', borderTop: '1px solid #bfdbfe' };
      case 'col-black':
        return on
          ? { background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 700, fontStyle: 'italic', padding: '10px 14px', width: '100%', textAlign: 'center' }
          : { color: '#0f172a', fontSize: 12, fontWeight: 500, padding: '10px 14px', width: '100%', textAlign: 'center', borderTop: '1px solid #e2e8f0' };
      case 'col-yellow':
        return on
          ? { background: '#facc15', color: '#422006', fontSize: 12, fontWeight: 800, padding: '10px 14px', width: '100%', textAlign: 'center' }
          : { color: '#0f172a', fontSize: 12, fontWeight: 700, padding: '10px 14px', width: '100%', textAlign: 'center' };
      case 'col-green':
        return {
          background: on ? '#14532d' : '#166534',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '10px 14px',
          width: '100%',
          textAlign: 'center',
        };
      case 'col-peach':
        return {
          background: on ? '#fdba74' : '#ffedd5',
          color: '#7c2d12',
          fontSize: 12,
          fontWeight: 700,
          padding: '10px 14px',
          width: '100%',
          textAlign: 'center',
        };
      default:
        return { fontSize: 11, padding: '4px 8px' };
    }
  };

  return (
    <div
      className={cn('flex w-full gap-1', isCol ? 'flex-col' : 'flex-row flex-wrap items-center')}
      style={variant === 'row-active-block' ? { borderBottom: '1px solid #e2e8f0', paddingBottom: 4 } : undefined}
    >
      {labels.map((label, i) => (
        <span key={`${label}-${i}`} style={itemClass(i)}>
          {label}
        </span>
      ))}
    </div>
  );
}

/** Overlay: Nút bấm | Nhóm nút bấm */
export function LandingPageButtonPresetsPanel({
  onClose,
  onInsertButton,
  onInsertGroup,
  initialTab = 'buttons',
  onTabChange,
  className,
}: PanelProps) {
  const [tab, setTab] = useState<ButtonPresetTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function selectTab(next: ButtonPresetTab) {
    setTab(next);
    onTabChange?.(next);
  }

  const textButtons = LP_BUTTON_PRESETS.filter((p) => !p.iconOnly);
  const iconButtons = LP_BUTTON_PRESETS.filter((p) => p.iconOnly);

  return (
    <div
      data-lp-sidebar-overlay="button"
      data-lp-button-presets-panel="1"
      className={cn(
        'absolute left-full top-0 z-40 ml-2 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl',
        'w-[min(340px,calc(100vw-4.5rem))]',
        'h-[min(calc(100vh-var(--builder-top-offset,6.75rem)-1rem),780px)]',
        'max-md:fixed max-md:left-3 max-md:right-3 max-md:top-16 max-md:ml-0 max-md:h-[min(80vh,720px)] max-md:w-auto',
        className,
      )}
      role="dialog"
      aria-label="Mẫu nút bấm"
    >
      <div className="flex shrink-0 items-center border-b border-zinc-100 px-3 pt-2">
        {(
          [
            { id: 'buttons' as const, label: 'Nút bấm' },
            { id: 'groups' as const, label: 'Nhóm nút bấm' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            data-lp-button-tab={t.id}
            data-lp-button-tab-active={tab === t.id ? '1' : '0'}
            className={cn(
              'relative px-2.5 pb-2.5 pt-1 text-sm font-medium transition',
              tab === t.id ? 'text-violet-600' : 'text-zinc-500 hover:text-zinc-800',
            )}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
            {tab === t.id ? (
              <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-violet-600" aria-hidden />
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3" data-lp-button-presets-scroll>
        {tab === 'buttons' ? (
          <>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Nút bấm</div>
            <div
              className="grid grid-cols-2 gap-2"
              data-lp-button-preset-list
              data-lp-button-preset-count={textButtons.length}
            >
              {textButtons.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  draggable
                  data-lp-button-preset={preset.id}
                  data-lp-sidebar-draggable="button"
                  className="flex cursor-grab items-center justify-center rounded-lg px-1 py-2 transition hover:bg-zinc-50 active:cursor-grabbing"
                  onClick={(e) => {
                    if (suppressClickAfterSidebarDrag(e)) return;
                    onInsertButton(preset);
                  }}
                  onDragStart={(e) =>
                    beginSidebarPresetDrag(e, { kind: 'button', preset }, preset.label)
                  }
                  title={`Chèn «${preset.label}» — kéo thả vào canvas`}
                >
                  <span style={previewBtnStyle(preset.style)}>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Nút icon
            </div>
            <div
              className="grid grid-cols-5 gap-2"
              data-lp-icon-button-list
              data-lp-icon-button-count={iconButtons.length}
            >
              {iconButtons.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  draggable
                  data-lp-button-preset={preset.id}
                  data-lp-sidebar-draggable="button"
                  className="flex cursor-grab items-center justify-center rounded-lg p-1 transition hover:bg-zinc-50 active:cursor-grabbing"
                  onClick={(e) => {
                    if (suppressClickAfterSidebarDrag(e)) return;
                    onInsertButton(preset);
                  }}
                  onDragStart={(e) =>
                    beginSidebarPresetDrag(e, { kind: 'button', preset }, preset.label)
                  }
                  title="Chèn nút icon — kéo thả vào canvas"
                >
                  <span style={previewBtnStyle(preset.style)}>{preset.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Nhóm nút bấm
            </div>
            <ul
              className="space-y-3"
              data-lp-button-group-list
              data-lp-button-group-count={LP_BUTTON_GROUP_PRESETS.length}
            >
              {LP_BUTTON_GROUP_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    draggable
                    data-lp-button-group={preset.id}
                    data-lp-sidebar-draggable="button-group"
                    className="block w-full cursor-grab rounded-lg border border-zinc-100 px-2 py-2.5 text-left transition hover:border-zinc-200 hover:bg-zinc-50 active:cursor-grabbing"
                    onClick={(e) => {
                      if (suppressClickAfterSidebarDrag(e)) return;
                      onInsertGroup(preset);
                    }}
                    onDragStart={(e) =>
                      beginSidebarPresetDrag(
                        e,
                        { kind: 'button-group', preset },
                        preset.labels.join(' · '),
                      )
                    }
                    title="Chèn nhóm nút — kéo thả vào canvas"
                  >
                    <GroupPreview preset={preset} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
