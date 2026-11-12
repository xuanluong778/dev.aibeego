import { buildStoredZip } from '../../../apps/api/src/landing-pages/template-pack';

export const PACK_FORMAT = 'aibeego.landing-template';

export const manifestOf = (over: Record<string, unknown> = {}) => ({
  format: PACK_FORMAT, formatVersion: 1, slug: 'lpt-mau-hop-le', name: 'LPT Mẫu hợp lệ', category: 'agency', theme: 'MODERN',
  description: 'Mẫu giả dùng cho kiểm thử', tags: ['lpt'], ...over,
});

export const templateOf = (blocks?: unknown[]) => ({
  version: 1, theme: 'MODERN',
  seo: { title: 'LPT', metaDescription: 'LPT', canonical: null, ogImage: null, robotsIndex: true },
  blocks: blocks ?? [
    { id: 'h', type: 'Hero', enabled: true, headline: 'Xin chào', subheadline: 'Mẫu giả', ctaLabel: 'Gửi', ctaUrl: '#lead-form', imageUrl: null },
    { id: 'f', type: 'LeadForm', enabled: true, headline: 'Form', submitLabel: 'Gửi', fields: [{ id: 'f1', name: 'phone', label: 'SĐT', fieldType: 'tel', required: true }] },
  ],
});

/** PNG 1x1 hợp lệ (67 byte). */
export const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

export const zip = (files: Record<string, string | Buffer>) =>
  buildStoredZip(Object.entries(files).map(([name, data]) => ({ name, data: Buffer.isBuffer(data) ? data : Buffer.from(data) })));

export const validPack = (slug = 'lpt-mau-hop-le', extra: Record<string, string | Buffer> = {}) =>
  zip({ 'manifest.json': JSON.stringify(manifestOf({ slug })), 'template.json': JSON.stringify(templateOf()), ...extra });

export const HTML_SAMPLE = '<!doctype html><html><head><title>LPT HTML</title></head><body><h1>Xin chào</h1><p>Mẫu HTML giả</p><script>window.x=1</script></body></html>';
