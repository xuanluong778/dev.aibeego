'use client';

import type { LandingPageBlock } from '@marketingspa/shared';
import { elementFromField, isItemImageField } from './landing-page-canvas-selection';
import type { LandingPageCanvasElementKey } from './landing-page-canvas-ux';
import { isLandingPageBoxStyle } from './landing-page-box-presets';

export type InspectorContextKind =
  | 'section'
  | 'text'
  | 'card'
  | 'image'
  | 'icon'
  | 'button'
  | 'form'
  | 'video'
  | 'countdown'
  | 'none';

export type InspectorContext = {
  kind: InspectorContextKind;
  label: string;
  /** data attribute for gates / QA */
  dataAttr: string;
};

/** CTA that is a single button (library / preset) — not a full section or box graphic. */
export function isButtonOnlyCtaBlock(block: LandingPageBlock | null | undefined): boolean {
  if (!block || block.type !== 'CTA') return false;
  if (isLandingPageBoxStyle(block.style as Record<string, unknown> | undefined)) return false;
  const headline = 'headline' in block ? String(block.headline || '').trim() : '';
  const sub = 'subheadline' in block ? String(block.subheadline || '').trim() : '';
  const body = 'body' in block ? String(block.body || '').trim() : '';
  return !headline && !sub && !body;
}

/**
 * Context-aware inspector focus from canvas selection.
 * Additive — does not change selection model.
 */
export function resolveInspectorContext(
  selected: LandingPageBlock | null | undefined,
  selectedElement?: LandingPageCanvasElementKey | null,
  /** Canvas selection field — authoritative when element is stale (e.g. section + field:headline). */
  selectedField?: string | null,
): InspectorContext {
  if (!selected) {
    return { kind: 'none', label: 'Chưa chọn', dataAttr: 'none' };
  }

  const fieldKey = typeof selectedField === 'string' ? selectedField.trim() : '';
  if (fieldKey) {
    if (fieldKey.startsWith('planCta:')) return { kind: 'button', label: 'Nút trong thẻ', dataAttr: 'button' };
    // Gallery/card image — must win before item: text mapping.
    if (isItemImageField(fieldKey)) {
      return { kind: 'image', label: 'Ảnh', dataAttr: 'image' };
    }
    const derived = elementFromField(fieldKey);
    if (derived === 'cta') {
      return { kind: 'button', label: 'NÚT', dataAttr: 'button' };
    }
    if (derived === 'headline' || derived === 'subheadline' || derived === 'body') {
      return { kind: 'text', label: 'Text', dataAttr: 'text' };
    }
    if (typeof derived === 'string' && derived.startsWith('item:trust-icon-')) {
      return { kind: 'icon', label: 'Icon', dataAttr: 'icon' };
    }
    if (typeof derived === 'string' && derived.startsWith('item:')) {
      return { kind: 'text', label: 'Text', dataAttr: 'text' };
    }
    if (typeof derived === 'string' && derived.startsWith('countdown:')) {
      return { kind: 'countdown', label: 'Countdown cell', dataAttr: 'countdown' };
    }
  }

  const el = selectedElement || 'section';

  if (selected.type === 'LeadForm') {
    return { kind: 'form', label: 'Form', dataAttr: 'form' };
  }

  if (typeof el === 'string' && el.startsWith('item:trust-icon-')) {
    return { kind: 'icon', label: 'ICON', dataAttr: 'icon' };
  }

  // Shape-only graphics / box CTA → Icon inspector (not Button / Image).
  if (
    selected.type === 'CTA' &&
    isLandingPageBoxStyle(selected.style as Record<string, unknown> | undefined)
  ) {
    return { kind: 'icon', label: 'ICON', dataAttr: 'icon' };
  }

  if (el === 'image' || (typeof el === 'string' && el.startsWith('grid:'))) {
    return { kind: 'image', label: 'Ảnh', dataAttr: 'image' };
  }

  if (el === 'cta' || (el === 'section' && isButtonOnlyCtaBlock(selected))) {
    return { kind: 'button', label: 'NÚT', dataAttr: 'button' };
  }

  if (typeof el === 'string' && el.startsWith('item:') && !el.startsWith('item:trust-icon-')) {
    return { kind: 'card', label: 'Hộp', dataAttr: 'card' };
  }

  if (el === 'headline' || el === 'subheadline' || el === 'body') {
    return { kind: 'text', label: 'Text', dataAttr: 'text' };
  }

  if (typeof el === 'string' && el.startsWith('countdown:')) {
    return { kind: 'countdown', label: 'Ô đếm ngược', dataAttr: 'countdown' };
  }

  if (selected.type === 'Video') {
    return { kind: 'video', label: 'Video', dataAttr: 'video' };
  }

  if (selected.type === 'Countdown' && (el === 'section' || el === 'section-background')) {
    return { kind: 'countdown', label: 'Đếm ngược', dataAttr: 'countdown' };
  }

  return { kind: 'section', label: `Section · ${selected.type}`, dataAttr: 'section' };
}
