/**
 * Landing Page — structured extract from public HTML (no script execution).
 */

import { z } from 'zod';

export const landingPageUrlSummarySchema = z.object({
  schemaVersion: z.literal('landing-page-url-crawl.v1'),
  sourceUrl: z.string().max(2000),
  finalUrl: z.string().max(2000),
  brand: z.string().max(120).nullable(),
  title: z.string().max(200),
  description: z.string().max(500).nullable(),
  productService: z.string().max(400).nullable(),
  benefits: z.array(z.string().max(200)).max(10),
  usp: z.string().max(400).nullable(),
  contact: z
    .object({
      phone: z.string().max(40).nullable(),
      email: z.string().max(160).nullable(),
      address: z.string().max(300).nullable(),
    })
    .optional(),
  faq: z
    .array(z.object({ question: z.string().max(200), answer: z.string().max(600) }))
    .max(8),
  cta: z.string().max(80).nullable(),
  imageUrl: z.string().max(2000).nullable(),
  logoUrl: z.string().max(2000).nullable(),
});

export type LandingPageUrlSummary = z.infer<typeof landingPageUrlSummarySchema>;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaContent(html: string, names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
      'i',
    );
    const m = html.match(re) || html.match(re2);
    if (m?.[1]) return decodeEntities(m[1]).slice(0, 500);
  }
  return null;
}

function absUrl(base: string, maybe: string | null): string | null {
  if (!maybe) return null;
  const raw = maybe.trim();
  if (!raw || raw.startsWith('data:')) return null;
  try {
    const u = new URL(raw, base);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString().slice(0, 2000);
  } catch {
    return null;
  }
}

function extractListItems(html: string, max = 8): string[] {
  const items: string[] = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liRe.exec(html)) && items.length < max) {
    const raw = m[1] ?? '';
    const t = decodeEntities(raw.replace(/<[^>]+>/g, ' '));
    if (t.length >= 8 && t.length <= 200) items.push(t.slice(0, 200));
  }
  return items;
}

function extractFaq(html: string): Array<{ question: string; answer: string }> {
  const faq: Array<{ question: string; answer: string }> = [];
  // details/summary
  const detRe = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = detRe.exec(html)) && faq.length < 8) {
    const q = decodeEntities((m[1] ?? '').replace(/<[^>]+>/g, ' '));
    const a = decodeEntities((m[2] ?? '').replace(/<[^>]+>/g, ' '));
    if (q && a) faq.push({ question: q.slice(0, 200), answer: a.slice(0, 600) });
  }
  return faq;
}

function extractCta(html: string): string | null {
  const btn =
    html.match(
      /<(?:a|button)[^>]*(?:class|id)=["'][^"']*(?:cta|btn|button)[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|button)>/i,
    ) || html.match(/<(?:a|button)[^>]*>\s*(Đăng ký|Mua ngay|Nhận tư vấn|Liên hệ|Tìm hiểu)[^<]{0,40}/i);
  if (!btn?.[1] && !btn?.[0]) return null;
  const t = decodeEntities((btn[1] || btn[0] || '').replace(/<[^>]+>/g, ' '));
  return t.slice(0, 80) || null;
}

function extractPhone(text: string): string | null {
  const m = text.match(/(?:\+?84|0)\d[\d\s.-]{7,14}\d/);
  return m ? m[0].replace(/\s+/g, '').slice(0, 40) : null;
}

function extractEmail(text: string): string | null {
  const m = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return m ? m[0].slice(0, 160) : null;
}

/**
 * Build structured public summary from sanitized HTML + plaintext.
 * Never invents contact/FAQ — only extracts when present.
 */
export function extractLandingPageUrlSummary(input: {
  sourceUrl: string;
  finalUrl: string;
  title: string;
  text: string;
  html?: string;
}): LandingPageUrlSummary {
  const html = input.html || '';
  const text = input.text || '';
  const ogTitle = metaContent(html, ['og:title', 'twitter:title']);
  const description =
    metaContent(html, ['description', 'og:description', 'twitter:description']) ||
    text.slice(0, 280) ||
    null;
  const siteName = metaContent(html, ['og:site_name', 'application-name']);
  const brand = (siteName || input.title.split(/[|\-–—]/)[0] || '').trim().slice(0, 120) || null;
  const imageUrl = absUrl(
    input.finalUrl,
    metaContent(html, ['og:image', 'twitter:image']),
  );
  const logoMatch = html.match(
    /<img[^>]+(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
  ) || html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:class|id|alt)=["'][^"']*logo[^"']*["']/i);
  const logoUrl = absUrl(input.finalUrl, logoMatch?.[1] || null);
  const benefits = extractListItems(html, 8);
  const faq = extractFaq(html);
  const cta = extractCta(html);
  const phone = extractPhone(text + ' ' + html.slice(0, 50_000));
  const email = extractEmail(text + ' ' + html.slice(0, 50_000));
  const productService =
    (ogTitle || input.title || '').replace(/\s+/g, ' ').trim().slice(0, 400) || null;
  const usp = description?.slice(0, 400) || null;

  return landingPageUrlSummarySchema.parse({
    schemaVersion: 'landing-page-url-crawl.v1',
    sourceUrl: input.sourceUrl.slice(0, 2000),
    finalUrl: input.finalUrl.slice(0, 2000),
    brand,
    title: (ogTitle || input.title || 'Website').slice(0, 200),
    description,
    productService,
    benefits,
    usp,
    contact: { phone, email, address: null },
    faq,
    cta,
    imageUrl,
    logoUrl,
  });
}

/** Brief fields for Landing Page AI generate from crawl summary. */
export function landingPageUrlSummaryToBriefNotes(summary: LandingPageUrlSummary): string {
  return [
    summary.brand ? `Brand: ${summary.brand}` : '',
    summary.description ? `Mô tả: ${summary.description}` : '',
    summary.benefits.length ? `Benefits: ${summary.benefits.join('; ')}` : '',
    summary.usp ? `USP: ${summary.usp}` : '',
    summary.cta ? `CTA: ${summary.cta}` : '',
    summary.contact?.phone ? `Hotline: ${summary.contact.phone}` : '',
    summary.contact?.email ? `Email: ${summary.contact.email}` : '',
    summary.faq.length
      ? `FAQ: ${summary.faq.map((f) => `${f.question} → ${f.answer}`).join(' | ').slice(0, 400)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 1200);
}
