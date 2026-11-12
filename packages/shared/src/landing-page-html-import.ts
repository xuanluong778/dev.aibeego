/**
 * Turn an uploaded HTML document into editable landing-page blocks.
 * Scripts are removed and never executed. CSS is stripped of active content
 * and scoped so it cannot restyle the rest of the app.
 */

const MAX_CSS = 20_000;
const MAX_SECTIONS = 40;

export type HtmlSectionRecord = {
  blockId: string;
  html: string;
  label: string;
};

export type HtmlImportResult = {
  blocks: Record<string, unknown>[];
  themeTokens: { primary?: string; accent?: string; background?: string; surface?: string; text?: string; fontFamily?: string };
  seo: { title: string; metaDescription: string };
  meta: {
    htmlConverted: true;
    htmlSections?: HtmlSectionRecord[];
    htmlImportNotes?: string[];
    scopedCss?: string;
    fontHref?: string;
    isolatedScriptCount: number;
    gallery?: { thumbnail?: string };
  };
};

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Top-level body elements, including nav. Nested sections stay inside their parent. */
export function splitTopLevelElements(html: string): string[] {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const parts: string[] = [];
  let i = 0;
  while (i < body.length && parts.length < MAX_SECTIONS) {
    while (i < body.length && /\s/.test(body[i] || '')) i += 1;
    if (i >= body.length) break;
    if (body.startsWith('<!--', i)) {
      const end = body.indexOf('-->', i);
      i = end === -1 ? body.length : end + 3;
      continue;
    }
    if (body[i] !== '<') {
      const next = body.indexOf('<', i);
      i = next === -1 ? body.length : next;
      continue;
    }
    const open = /^<([a-zA-Z][\w:-]*)\b[^>]*?>/.exec(body.slice(i));
    if (!open) {
      i += 1;
      continue;
    }
    const tag = open[1]!.toLowerCase();
    const openEnd = i + open[0].length;
    if (/\/\s*>$/.test(open[0]) || VOID_TAGS.has(tag)) {
      parts.push(body.slice(i, openEnd));
      i = openEnd;
      continue;
    }
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = openEnd;
    let depth = 1;
    let end = -1;
    let match: RegExpExecArray | null;
    while ((match = re.exec(body))) {
      if (match[1]) depth -= 1;
      else if (!/\/\s*>$/.test(match[0])) depth += 1;
      if (depth === 0) {
        end = re.lastIndex;
        break;
      }
    }
    if (end === -1) {
      const rest = body.slice(i).trim();
      if (rest) parts.push(rest);
      break;
    }
    parts.push(body.slice(i, end));
    i = end;
  }
  return parts.filter((part) => textOf(part).length > 0 || /<(img|video|svg|canvas|form|section|nav)\b/i.test(part));
}

export function sanitizeHtmlFragment(input: string): string {
  return String(input || '')
    .replace(/\0/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<(?:iframe|object|embed|base)\b[^>]*>[\s\S]*?<\/(?:iframe|object|embed|base)>/gi, '')
    .replace(/<(?:iframe|object|embed|base)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/(javascript|vbscript)\s*:/gi, '')
    .slice(0, 150_000)
    .trim();
}

/** What the importer removed or cannot run. Empty when the file is fully supported. */
export function describeHtmlImportLimits(html: string): string[] {
  const notes: string[] = [];
  const scripts = (html.match(/<script\b/gi) || []).length;
  if (scripts) {
    notes.push(
      `Đã cô lập ${scripts} đoạn JavaScript. Chúng không chạy trong trang quản trị và không chạy trên trang public.`,
    );
  }
  const frames = (html.match(/<iframe\b/gi) || []).length;
  if (frames) notes.push(`Đã bỏ ${frames} iframe. Trang không nhúng nội dung ngoài.`);
  const objects = (html.match(/<(?:object|embed)\b/gi) || []).length;
  if (objects) notes.push(`Đã bỏ ${objects} object/embed.`);
  const canvases = (html.match(/<canvas\b/gi) || []).length;
  if (canvases) notes.push(`${canvases} canvas giữ nguyên khung nhưng không chạy vì JavaScript đã được cô lập.`);
  const handlers = (html.match(/\son[a-z]+\s*=/gi) || []).length;
  if (handlers) notes.push(`Đã gỡ ${handlers} sự kiện inline (onclick, …) để không đụng phiên quản trị.`);
  return notes.slice(0, 12);
}

function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function attr(tag: string, name: string): string {
  const re = new RegExp(`${name}\\s*=\\s*(['"])(.*?)\\1`, 'i');
  return tag.match(re)?.[2]?.trim() || '';
}

function imagesOf(html: string): string[] {
  const out: string[] = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, 'src');
    if (!src || /^javascript:/i.test(src)) continue;
    out.push(src);
  }
  return out;
}

function headings(html: string, level: number): string[] {
  const re = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
  return [...html.matchAll(re)].map((m) => textOf(m[1] || '')).filter(Boolean);
}

function paragraphs(html: string): string[] {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => textOf(m[1] || ''))
    .filter((p) => p.length > 1);
}

function buttonLabel(html: string): string {
  const link = html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
  const btn = html.match(/<button\b[^>]*>([\s\S]*?)<\/button>/i);
  return textOf(btn?.[1] || link?.[1] || '').slice(0, 80);
}

function buttonHref(html: string): string {
  const href = html.match(/<a\b[^>]*href\s*=\s*(['"])(.*?)\1/i)?.[2] || '';
  if (!href || /^(javascript:|data:)/i.test(href)) return '#lead-form';
  return href.slice(0, 500);
}

function assetPath(src: string, known?: Set<string>): string {
  const clean = src.trim();
  if (!clean || /^(javascript:|blob:)/i.test(clean)) return '';
  if (/^(https?:|data:image\/)/i.test(clean) || clean.startsWith('/')) return clean.slice(0, 2000);
  const base = clean.split('?')[0]?.split('#')[0]?.split('/').pop() || '';
  if (!base || base.includes('..') || (known && !known.has(base))) return '';
  return `assets/${base}`;
}

function sectionsOf(html: string): Array<{ tag: string; html: string }> {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const found = [...body.matchAll(/<(section|header|footer|article)\b[^>]*>[\s\S]*?<\/\1>/gi)];
  if (found.length) {
    return found.map((m) => ({ tag: (m[1] || 'section').toLowerCase(), html: m[0] }));
  }
  const chunks = body.split(/(?=<h[12]\b)/i).map((part) => part.trim()).filter((part) => textOf(part).length > 0);
  return (chunks.length ? chunks : [body]).slice(0, 12).map((part) => ({ tag: 'section', html: part }));
}

function safeCss(html: string): string {
  const raw = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] || '').join('\n');
  const cleaned = raw
    .replace(/@import[^;]+;/gi, '')
    .replace(/expression\s*\(/gi, '(')
    .replace(/javascript\s*:/gi, '')
    .replace(/behavior\s*:/gi, 'x:')
    .replace(/-moz-binding\s*:/gi, 'x:')
    .replace(/url\s*\(\s*(['"]?)(?!https:|data:image\/|\.|\/|assets\/)[^)'"]+\1\s*\)/gi, 'none')
    .slice(0, MAX_CSS);
  return cleaned
    .replace(/(^|})\s*([^@}{][^{]*)\{/g, (_m, brace: string, sel: string) => {
      const scoped = sel
        .split(',')
        .map((part) => {
          const s = part.trim();
          if (!s || s.startsWith('[data-lp-imported')) return s;
          return `[data-lp-imported="1"] ${s}`;
        })
        .filter(Boolean)
        .join(', ');
      return `${brace}${scoped}{`;
    })
    .trim();
}

function colorsOf(css: string): string[] {
  return [...css.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map((m) => m[0]).slice(0, 12);
}

function fontOf(css: string): string {
  const raw = css.match(/font-family\s*:\s*([^;}{]+)/i)?.[1] || '';
  return raw.replace(/!important/gi, '').replace(/["']/g, '').split(',')[0]?.trim().slice(0, 80) || '';
}

function fontHrefOf(html: string): string | undefined {
  const href = html.match(/<link\b[^>]*href\s*=\s*(['"])(https:\/\/fonts\.googleapis\.com\/[^'"]+)\1/i)?.[2];
  return href && href.length <= 500 ? href : undefined;
}

function leadFields(html: string): Record<string, unknown>[] {
  const inputs = [...html.matchAll(/<(input|textarea|select)\b[^>]*>/gi)].slice(0, 8);
  if (!inputs.length) {
    return [
      { id: 'f-name', name: 'name', label: 'Họ tên', fieldType: 'text', required: true, placeholder: '' },
      { id: 'f-phone', name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true, placeholder: '' },
      { id: 'f-email', name: 'email', label: 'Email', fieldType: 'email', required: false, placeholder: '' },
    ];
  }
  return inputs.map((m, i) => {
    const tag = m[0];
    const type = (attr(tag, 'type') || (m[1]?.toLowerCase() === 'textarea' ? 'textarea' : 'text')).toLowerCase();
    const fieldType = type === 'email' || type === 'tel' || type === 'textarea' ? type : 'text';
    const name = (attr(tag, 'name') || `field_${i + 1}`).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
    const label = attr(tag, 'placeholder') || attr(tag, 'aria-label') || name;
    return {
      id: `f-${i + 1}`,
      name: name || `field_${i + 1}`,
      label: label.slice(0, 80),
      fieldType,
      required: /\brequired\b/i.test(tag),
      placeholder: attr(tag, 'placeholder').slice(0, 120),
    };
  });
}

export function landingSpecFromHtml(html: string, fallbackName: string, knownAssets?: Set<string>): HtmlImportResult {
  const title = textOf(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '') || fallbackName || 'Landing page';
  const description = attr(
    html.match(/<meta\b[^>]*name\s*=\s*(['"])description\1[^>]*>/i)?.[0] || '',
    'content',
  );
  const scriptCount = (html.match(/<script\b/gi) || []).length;
  const importNotes = describeHtmlImportLimits(html);
  const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] || '').join('\n');
  const palette = colorsOf(css);
  const fontFamily = fontOf(css);
  const fontHref = fontHrefOf(html);
  const scopedCss = safeCss(html);
  const topLevel = splitTopLevelElements(html);
  const sections = topLevel.length
    ? topLevel.map((part) => ({
        tag: (part.match(/^<([a-zA-Z0-9]+)/)?.[1] || 'section').toLowerCase(),
        html: part,
      }))
    : sectionsOf(html);
  const blocks: Record<string, unknown>[] = [];
  const htmlSections: HtmlSectionRecord[] = [];
  let lead = false;
  let index = 0;

  const remember = (block: Record<string, unknown>, sectionHtml: string) => {
    blocks.push(block);
    const fragment = sanitizeHtmlFragment(sectionHtml);
    if (!fragment) return;
    htmlSections.push({
      blockId: String(block.id),
      html: fragment,
      label: String(block.type || 'Section'),
    });
  };

  for (const section of sections) {
    index += 1;
    const plain = textOf(section.html);
    if (!plain && !/<(img|video|svg|canvas|form|section|nav)\b/i.test(section.html)) continue;
    const h1 = headings(section.html, 1)[0] || headings(section.html, 2)[0] || '';
    const h3s = headings(section.html, 3);
    const paras = paragraphs(section.html);
    const imgs = imagesOf(section.html).map((src) => assetPath(src, knownAssets)).filter(Boolean);
    const cta = buttonLabel(section.html);
    const id = `html-${index}`;

    if (section.tag === 'header' || section.tag === 'nav') {
      remember({
        id,
        type: 'Header',
        enabled: true,
        headline: h1 || title,
        subheadline: paras[0] || '',
        body: '',
        ctaLabel: cta,
        ctaUrl: cta ? buttonHref(section.html) : '',
        imageUrl: imgs[0] || '',
      }, section.html);
      continue;
    }
    if (/<form\b/i.test(section.html)) {
      lead = true;
      remember({
        id,
        type: 'LeadForm',
        enabled: true,
        headline: h1 || 'Đăng ký',
        subheadline: paras[0] || '',
        submitLabel: cta || 'Gửi',
        fields: leadFields(section.html),
      }, section.html);
      continue;
    }
    if (section.tag === 'footer') {
      remember({
        id,
        type: 'Footer',
        enabled: true,
        headline: h1 || title,
        subheadline: '',
        body: plain.slice(0, 500),
        ctaLabel: '',
        ctaUrl: '',
      }, section.html);
      continue;
    }
    if (/<blockquote\b/i.test(section.html) || /testimonial|review|quote/i.test(section.html)) {
      const quotes = [...section.html.matchAll(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi)].map((m) => textOf(m[1] || ''));
      const items = (quotes.length ? quotes : paras).slice(0, 6).map((quote, i) => ({
        id: `${id}-q${i + 1}`,
        quote: quote.slice(0, 500),
        author: '',
        role: '',
      }));
      if (items.length) {
        remember({ id, type: 'Testimonials', enabled: true, headline: h1 || 'Khách hàng nói gì', items }, section.html);
        continue;
      }
    }
    if (imgs.length >= 2 && h3s.length === 0) {
      remember({
        id,
        type: 'Gallery',
        enabled: true,
        headline: h1 || 'Hình ảnh',
        subheadline: paras[0] || '',
        items: imgs.slice(0, 12).map((imageUrl, i) => ({
          id: `${id}-g${i + 1}`,
          title: '',
          description: '',
          imageUrl,
        })),
      }, section.html);
      continue;
    }
    if (h3s.length >= 2) {
      remember({
        id,
        type: 'Features',
        enabled: true,
        headline: h1 || headings(section.html, 2)[0] || 'Nội dung',
        subheadline: paras[0] || '',
        items: h3s.slice(0, 8).map((itemTitle, i) => ({
          id: `${id}-f${i + 1}`,
          title: itemTitle,
          description: paras[i + 1] || paras[i] || '',
          imageUrl: imgs[i] || '',
        })),
      }, section.html);
      continue;
    }
    if (blocks.length === 0) {
      remember({
        id,
        type: 'Hero',
        enabled: true,
        headline: h1 || title,
        subheadline: paras[0] || '',
        body: paras.slice(1, 3).join('\n'),
        ctaLabel: cta,
        ctaUrl: cta ? buttonHref(section.html) : '#lead-form',
        imageUrl: imgs[0] || '',
      }, section.html);
      continue;
    }
    remember({
      id,
      type: cta && plain.length < 280 ? 'CTA' : 'Benefits',
      enabled: true,
      headline: h1 || 'Nội dung',
      subheadline: paras[0] || '',
      body: plain.slice(0, 800),
      ctaLabel: cta,
      ctaUrl: cta ? buttonHref(section.html) : '',
      imageUrl: imgs[0] || '',
      items: [{ id: `${id}-b1`, title: h1 || title, description: paras[0] || plain.slice(0, 240), imageUrl: imgs[0] || '' }],
    }, section.html);
  }

  if (!blocks.some((b) => b.type === 'Hero') && htmlSections.length === 0) {
    blocks.unshift({
      id: 'html-hero',
      type: 'Hero',
      enabled: true,
      headline: title,
      subheadline: textOf(html).slice(0, 240),
      body: '',
      ctaLabel: 'Liên hệ',
      ctaUrl: '#lead-form',
      imageUrl: '',
    });
  }
  if (!lead) {
    blocks.push({
      id: 'html-lead',
      type: 'LeadForm',
      enabled: true,
      headline: 'Đăng ký nhận tư vấn',
      subheadline: '',
      submitLabel: 'Gửi',
      fields: leadFields(''),
    });
  }

  const firstImage = blocks
    .map((b) => (typeof b.imageUrl === 'string' ? b.imageUrl : ''))
    .find(Boolean) || imagesOf(html).map((src) => assetPath(src, knownAssets)).find(Boolean) || '';

  return {
    blocks,
    themeTokens: {
      ...(palette[0] ? { primary: palette[0] } : {}),
      ...(palette[1] ? { accent: palette[1] } : {}),
      ...(palette[2] ? { background: palette[2] } : {}),
      ...(palette[3] ? { text: palette[3] } : {}),
      ...(fontFamily ? { fontFamily } : {}),
    },
    seo: { title: title.slice(0, 120), metaDescription: (description || textOf(html).slice(0, 180)).slice(0, 300) },
    meta: {
      htmlConverted: true,
      ...(htmlSections.length ? { htmlSections } : {}),
      ...(importNotes.length ? { htmlImportNotes: importNotes } : {}),
      ...(scopedCss ? { scopedCss } : {}),
      ...(fontHref ? { fontHref } : {}),
      isolatedScriptCount: scriptCount,
      ...(firstImage ? { gallery: { thumbnail: firstImage } } : {}),
    },
  };
}

type HtmlSectionSpec = {
  blocks: Array<{ id: string }>;
  meta?: {
    htmlSource?: string;
    htmlSections?: Array<{ blockId: string }>;
    htmlImportNotes?: string[];
    isolatedScriptCount?: number;
    clientRevision?: number;
    lastAutosaveRequestId?: string;
  };
  seo?: { title?: string; metaDescription?: string };
  themeTokens?: Record<string, unknown>;
};

export function htmlSectionsMatchBlocks(spec: HtmlSectionSpec): boolean {
  const sections = spec.meta?.htmlSections || [];
  if (!sections.length) return false;
  const ids = new Set(spec.blocks.map((block) => block.id));
  return sections.every((section) => ids.has(section.blockId));
}

/** Independent page copy: keep edited sections, or split htmlSource into section blocks. */
export function specWithEditableHtmlSections<T extends HtmlSectionSpec>(spec: T): T | null {
  const html = typeof spec.meta?.htmlSource === 'string' ? spec.meta.htmlSource.trim() : '';
  if (!html || htmlSectionsMatchBlocks(spec)) return null;
  const imported = landingSpecFromHtml(html, spec.seo?.title || 'Landing page');
  const prevCount = spec.meta?.isolatedScriptCount || 0;
  const notes = imported.meta.htmlImportNotes?.length
    ? imported.meta.htmlImportNotes
    : spec.meta?.htmlImportNotes;
  return {
    ...spec,
    themeTokens: { ...(spec.themeTokens || {}), ...imported.themeTokens },
    seo: {
      ...(spec.seo || {}),
      title: imported.seo.title || spec.seo?.title,
      metaDescription: imported.seo.metaDescription || spec.seo?.metaDescription,
    },
    blocks: imported.blocks,
    meta: {
      ...(spec.meta || {}),
      ...imported.meta,
      htmlSource: html,
      isolatedScriptCount: Math.max(prevCount, imported.meta.isolatedScriptCount),
      ...(notes?.length ? { htmlImportNotes: notes } : {}),
      ...(spec.meta?.clientRevision != null ? { clientRevision: spec.meta.clientRevision } : {}),
      ...(spec.meta?.lastAutosaveRequestId
        ? { lastAutosaveRequestId: spec.meta.lastAutosaveRequestId }
        : {}),
    },
  };
}
