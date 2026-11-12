import { uniq } from './run';

/** Dữ liệu cố định của chuỗi smoke (LP01 → LP03 → LP05 → LP07 → LP06). */
export const SMOKE = {
  pageName: 'SMOKE LP 20261111-01',
  headline: 'SMOKE-HEADLINE-20261111',
  sub: 'SMOKE-SUB-20261111',
  leadName: 'Nguyễn Smoke Test',
  leadPhone: '0900000001',
  leadEmail: 'smoke.lead.20261111@example.com',
} as const;

export interface FakeBlock {
  id: string;
  type: string;
  enabled: boolean;
  [k: string]: unknown;
}
export interface FakeSpec {
  version: 1;
  theme: string;
  themeTokens: Record<string, string>;
  seo: { title: string; metaDescription: string; canonical: string | null; ogImage: string | null; robotsIndex: boolean };
  blocks: FakeBlock[];
  meta?: Record<string, unknown>;
}

/** Spec tối thiểu hợp lệ: Hero + Benefits + LeadForm + Footer (cùng hình dạng createEmptyLandingPageSpec). */
export function makeSpec(over: { headline?: string; sub?: string; seoTitle?: string; revision?: number; meta?: Record<string, unknown> } = {}): FakeSpec {
  const headline = over.headline ?? 'Tiêu đề thử nghiệm';
  return {
    version: 1,
    theme: 'MODERN',
    themeTokens: { primary: '#2563eb', background: '#ffffff', text: '#0f172a' },
    seo: {
      title: over.seoTitle ?? `SEO ${headline}`.slice(0, 200),
      metaDescription: 'Mô tả thử nghiệm cho trang landing.',
      canonical: null,
      ogImage: null,
      robotsIndex: true,
    },
    blocks: [
      { id: 'p0_hero', type: 'Hero', enabled: true, spacing: 'lg', headline, subheadline: over.sub ?? 'Phụ đề thử nghiệm', ctaLabel: 'Đăng ký ngay', ctaUrl: '#lead-form', imageUrl: null },
      {
        id: 'p0_benefits', type: 'Benefits', enabled: true, spacing: 'md', headline: 'Lợi ích',
        items: [
          { id: 'b1', title: 'Nhanh chóng', description: 'Triển khai trong vài phút.' },
          { id: 'b2', title: 'Chuyên nghiệp', description: 'Giao diện chuẩn conversion.' },
        ],
      },
      {
        id: 'p0_form', type: 'LeadForm', enabled: true, spacing: 'md', headline: 'Để lại thông tin', submitLabel: 'Gửi thông tin',
        successMessage: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin.',
        fields: [
          { id: 'f1', name: 'name', label: 'Họ tên', fieldType: 'text', required: true, placeholder: 'Nguyễn Văn A' },
          { id: 'f2', name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true, placeholder: '09xx xxx xxx' },
          { id: 'f3', name: 'email', label: 'Email', fieldType: 'email', required: false, placeholder: 'ban@email.com' },
        ],
      },
      { id: 'p0_footer', type: 'Footer', enabled: true, spacing: 'sm', body: '© Ai Bee Go test' },
    ],
    meta: { ...(over.revision !== undefined ? { clientRevision: over.revision } : {}), ...(over.meta || {}) },
  };
}

/** Body tạo trang trống (POST /landing-pages). */
export const newPageBody = (name = uniq('LPT trang')) => ({ mode: 'blank' as const, name, idempotencyKey: `idem-${name}`.slice(0, 120) });

/** Body autosave đúng DTO AutosaveLandingPageDto. */
export function autosaveBody(a: { spec: FakeSpec; base: number; revision: number; requestId: string; name?: string }) {
  return { draftSpec: a.spec, baseRevision: a.base, clientRevision: a.revision, requestId: a.requestId, ...(a.name ? { name: a.name } : {}) };
}
