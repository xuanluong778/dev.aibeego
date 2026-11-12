/** Selectable nodes inside an uploaded HTML landing page. */

export type HtmlNodeKind = 'heading' | 'text' | 'button' | 'image' | 'section' | 'box';

export type HtmlNodeSnapshot = {
  id: string;
  kind: HtmlNodeKind;
  tag: string;
  text: string;
  href: string;
  src: string;
  alt: string;
  color: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textTransform: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: string;
  fontFamily: string;
  background: string;
  radius: number;
  padding: number;
  borderWidth: number;
  borderColor: string;
  hidden: boolean;
};

export type HtmlNodePatch = Partial<{
  text: string;
  href: string;
  src: string;
  alt: string;
  color: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textTransform: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: string;
  fontFamily: string;
  background: string;
  radius: number;
  padding: number;
  borderWidth: number;
  borderColor: string;
  /** h1–h6, p, or div */
  tag: string;
  hidden: boolean;
}>;

export type HtmlPatchFn = (
  id: string,
  patch: HtmlNodePatch,
  commit: boolean,
) => HtmlNodeSnapshot | null;

const PICK_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'button',
  'li',
  'img',
  'label',
  'figcaption',
  'blockquote',
  '[data-lp-html-edit]',
  'section',
  'header',
  'footer',
  'nav',
  'article',
  '[class*="-card"]',
  '[class*="-item"]',
].join(',');

export function htmlNodeLabel(kind: HtmlNodeKind): string {
  if (kind === 'heading') return 'TIÊU ĐỀ';
  if (kind === 'button') return 'NÚT';
  if (kind === 'image') return 'ẢNH';
  if (kind === 'section') return 'SECTION';
  if (kind === 'box') return 'KHUNG';
  return 'VĂN BẢN';
}

export function pickHtmlTarget(start: Element): HTMLElement | null {
  const picked = start.closest(PICK_SELECTOR);
  if (!(picked instanceof HTMLElement)) return null;
  if (picked.closest('svg')) return null;
  if (picked.hasAttribute('data-lp-html-body')) return null;
  return picked;
}

export function stampHtmlNodeIds(root: ParentNode): boolean {
  let max = 0;
  root.querySelectorAll('[data-lp-node]').forEach((el) => {
    const match = /^n(\d+)$/.exec(el.getAttribute('data-lp-node') || '');
    if (match) max = Math.max(max, Number(match[1]));
  });
  let added = false;
  root.querySelectorAll(PICK_SELECTOR).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.closest('svg')) return;
    if (el.getAttribute('data-lp-node')) return;
    max += 1;
    el.setAttribute('data-lp-node', `n${max}`);
    added = true;
  });
  return added;
}

function rgbToHex(input: string): string {
  const match = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!match) return input.startsWith('#') ? input.slice(0, 7) : '';
  if (match[4] != null && Number(match[4]) === 0) return '';
  const hex = (part: string) => Number(part).toString(16).padStart(2, '0');
  return `#${hex(match[1] || '0')}${hex(match[2] || '0')}${hex(match[3] || '0')}`;
}

function nodeKind(el: HTMLElement): HtmlNodeKind {
  if (el.matches('img')) return 'image';
  if (el.matches('a, button')) return 'button';
  if (el.matches('h1,h2,h3,h4,h5,h6')) return 'heading';
  if (el.matches('section, header, footer, nav, article')) return 'section';
  if (el.matches('[class*="-card"], [class*="-item"]')) return 'box';
  return 'text';
}

export function readHtmlNode(el: HTMLElement): HtmlNodeSnapshot | null {
  const id = el.getAttribute('data-lp-node') || '';
  if (!id) return null;
  const style = getComputedStyle(el);
  const fontSize = Math.round(parseFloat(style.fontSize) || 16);
  const radius = Math.round(parseFloat(style.borderTopLeftRadius) || 0);
  const padding = Math.round(parseFloat(style.paddingTop) || 0);
  const align = style.textAlign === 'start' ? 'left' : style.textAlign === 'end' ? 'right' : style.textAlign;
  const linePx = parseFloat(style.lineHeight);
  const letter = parseFloat(style.letterSpacing);
  const decoration = style.textDecorationLine || style.textDecoration || 'none';
  return {
    id,
    kind: nodeKind(el),
    tag: el.tagName.toLowerCase(),
    text: el.matches('img') ? el.getAttribute('alt') || '' : (el.innerText || '').replace(/\s+/g, ' ').trim(),
    href: el.getAttribute('href') || '',
    src: el.getAttribute('src') || '',
    alt: el.getAttribute('alt') || '',
    color: rgbToHex(style.color),
    fontSize,
    fontWeight: String(Math.round(Number(style.fontWeight) || 400)),
    fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
    textDecoration: decoration,
    textTransform: style.textTransform || 'none',
    letterSpacing: Number.isFinite(letter) ? Math.round(letter * 10) / 10 : 0,
    lineHeight: Number.isFinite(linePx) && fontSize ? Math.round((linePx / fontSize) * 100) / 100 : 1.4,
    textAlign: align === 'center' || align === 'right' || align === 'justify' ? align : 'left',
    fontFamily: style.fontFamily,
    background: rgbToHex(style.backgroundColor),
    radius,
    padding,
    borderWidth: Math.round(parseFloat(style.borderTopWidth) || 0),
    borderColor: rgbToHex(style.borderTopColor),
    hidden: style.display === 'none',
  };
}

function retag(el: HTMLElement, tag: string): HTMLElement {
  const next = document.createElement(tag);
  for (const attr of [...el.attributes]) next.setAttribute(attr.name, attr.value);
  next.innerHTML = el.innerHTML;
  el.replaceWith(next);
  return next;
}

function setVisibleText(el: HTMLElement, next: string) {
  const elements = [...el.children];
  if (!elements.length) {
    el.textContent = next;
    return;
  }
  let rest = next;
  const gaps: string[] = [];
  for (const child of elements) {
    const piece = child.textContent || '';
    if (!piece) {
      gaps.push('');
      continue;
    }
    const index = rest.indexOf(piece);
    if (index < 0) {
      el.textContent = next;
      return;
    }
    gaps.push(rest.slice(0, index));
    rest = rest.slice(index + piece.length);
  }
  gaps.push(rest);
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  });
  elements.forEach((child, index) => {
    const gap = gaps[index];
    if (gap) child.before(document.createTextNode(gap));
  });
  const tail = gaps[gaps.length - 1];
  const last = elements[elements.length - 1];
  if (last && tail) last.after(document.createTextNode(tail));
}

export function applyHtmlNodePatch(el: HTMLElement, patch: HtmlNodePatch): HTMLElement {
  let node = el;
  if (
    typeof patch.tag === 'string' &&
    /^(h[1-6]|p|div|span)$/.test(patch.tag) &&
    !el.matches('img, a, button') &&
    el.tagName.toLowerCase() !== patch.tag
  ) {
    node = retag(el, patch.tag);
  }
  if (typeof patch.text === 'string' && !node.matches('img')) setVisibleText(node, patch.text);
  if (typeof patch.alt === 'string') node.setAttribute('alt', patch.alt);
  if (typeof patch.href === 'string' && node.matches('a')) node.setAttribute('href', patch.href);
  if (typeof patch.src === 'string' && node.matches('img')) {
    const src = patch.src.trim();
    if (/^(https:\/\/|\/)/i.test(src)) node.setAttribute('src', src);
  }
  if (typeof patch.color === 'string' && patch.color) node.style.color = patch.color;
  if (typeof patch.fontSize === 'number' && Number.isFinite(patch.fontSize)) {
    node.style.fontSize = `${Math.round(patch.fontSize)}px`;
  }
  if (typeof patch.fontWeight === 'string') node.style.fontWeight = patch.fontWeight;
  if (typeof patch.fontStyle === 'string') node.style.fontStyle = patch.fontStyle;
  if (typeof patch.textDecoration === 'string') node.style.textDecoration = patch.textDecoration || 'none';
  if (typeof patch.textTransform === 'string') node.style.textTransform = patch.textTransform;
  if (typeof patch.letterSpacing === 'number' && Number.isFinite(patch.letterSpacing)) {
    node.style.letterSpacing = patch.letterSpacing === 0 ? '' : `${patch.letterSpacing}px`;
  }
  if (typeof patch.lineHeight === 'number' && Number.isFinite(patch.lineHeight)) {
    node.style.lineHeight = String(patch.lineHeight);
  }
  if (typeof patch.textAlign === 'string') node.style.textAlign = patch.textAlign;
  if (typeof patch.fontFamily === 'string') node.style.fontFamily = patch.fontFamily;
  if (typeof patch.background === 'string') node.style.background = patch.background || 'transparent';
  if (typeof patch.radius === 'number' && Number.isFinite(patch.radius)) {
    node.style.borderRadius = `${Math.round(patch.radius)}px`;
  }
  if (typeof patch.padding === 'number' && Number.isFinite(patch.padding)) {
    node.style.padding = `${Math.round(patch.padding)}px`;
  }
  if (typeof patch.borderWidth === 'number' && Number.isFinite(patch.borderWidth)) {
    node.style.borderStyle = patch.borderWidth > 0 ? 'solid' : '';
    node.style.borderWidth = `${Math.round(patch.borderWidth)}px`;
  }
  if (typeof patch.borderColor === 'string' && patch.borderColor) node.style.borderColor = patch.borderColor;
  if (typeof patch.hidden === 'boolean') node.style.display = patch.hidden ? 'none' : '';
  return node;
}
