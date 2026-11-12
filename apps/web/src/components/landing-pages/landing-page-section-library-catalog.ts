/**
 * Section Library catalog — 100 production templates.
 * Each template materializes to ONE live LandingPageBlock (existing 17 types + variants).
 * Each inserted section retains the exact visual context shown by its preview.
 */

import type { LandingPageBlock, LandingPageBlockType, LandingPageTheme, LandingPageThemeTokens } from '@marketingspa/shared';
import { LANDING_PAGE_THEME_PRESETS, verifiedBackdropUrl } from '@marketingspa/shared';
import { finishSectionLibraryTemplate } from './landing-page-section-library-quality';
import type { SectionLibraryPresentation } from './landing-page-section-library-context';

export const LP_SECTION_LIBRARY_CATEGORIES = [
  { id: 'hero', label: 'Hero', count: 11 },
  { id: 'intro', label: 'Tiêu đề / Intro', count: 6 },
  { id: 'benefits', label: 'Benefits', count: 7 },
  { id: 'features', label: 'Features', count: 7 },
  { id: 'content', label: 'Content / Text', count: 6 },
  { id: 'image-content', label: 'Image + Content', count: 7 },
  { id: 'gallery', label: 'Gallery', count: 5 },
  { id: 'services', label: 'Services', count: 6 },
  { id: 'product', label: 'Product', count: 5 },
  { id: 'pricing', label: 'Pricing', count: 6 },
  { id: 'testimonials', label: 'Testimonials', count: 6 },
  { id: 'stats', label: 'Stats / Numbers', count: 4 },
  { id: 'process', label: 'Process / Steps', count: 4 },
  { id: 'faq', label: 'FAQ', count: 4 },
  { id: 'lead', label: 'Lead / Form / Contact', count: 5 },
  { id: 'cta', label: 'CTA', count: 4 },
  { id: 'guarantee', label: 'Guarantee / Trust', count: 3 },
  { id: 'video', label: 'Video', count: 2 },
  { id: 'countdown', label: 'Countdown / Offer', count: 2 },
] as const;

export type LpSectionLibraryCategoryId = (typeof LP_SECTION_LIBRARY_CATEGORIES)[number]['id'];

/** Wireframe layout key for lightweight CSS thumbnails (not full renderer). */
export type LpSectionThumbLayout =
  | 'hero-centered'
  | 'hero-split-left'
  | 'hero-split-right'
  | 'hero-overlay'
  | 'hero-fullbleed'
  | 'hero-minimal'
  | 'hero-card'
  | 'intro-center'
  | 'intro-left'
  | 'cards-2'
  | 'cards-3'
  | 'cards-4'
  | 'list-editorial'
  | 'list-numbered'
  | 'alternating'
  | 'image-left'
  | 'image-right'
  | 'gallery-grid'
  | 'gallery-mosaic'
  | 'pricing-3'
  | 'pricing-compare'
  | 'quote'
  | 'quotes-cards'
  | 'stats-row'
  | 'process-steps'
  | 'faq-list'
  | 'form-card'
  | 'form-split'
  | 'cta-banner'
  | 'cta-split'
  | 'guarantee'
  | 'video'
  | 'countdown';

export type LpSectionLibraryTemplate = {
  presentation?: SectionLibraryPresentation;
  id: string;
  category: LpSectionLibraryCategoryId;
  label: string;
  description: string;
  /** Search keywords */
  tags: string[];
  composition: string;
  thumb: LpSectionThumbLayout;
  blockType: LandingPageBlockType;
  /** Partial block fields merged onto a typed shell (id assigned at insert). */
  patch: Record<string, unknown>;
  /** Visual context retained by both preview and inserted section. */
  previewTheme?: LandingPageTheme;
  previewTokens?: LandingPageThemeTokens;
  designFamily?: string;
};

function items(
  rows: Array<{ title: string; description?: string; role?: string; quote?: string; question?: string; answer?: string; imageUrl?: string }>,
) {
  return rows.map((r, i) => ({
    id: `tpl-item-${i}`,
    title: r.title || r.question || r.quote?.slice(0, 24) || `Mục ${i + 1}`,
    description: r.description || r.answer || '',
    ...(r.role ? { role: r.role } : null),
    ...(r.quote ? { quote: r.quote, author: r.title, role: r.role || '' } : null),
    ...(r.question ? { question: r.question, answer: r.answer || '' } : null),
    ...(r.imageUrl ? { imageUrl: r.imageUrl } : null),
  }));
}

function plans(
  rows: Array<{ name: string; price: string; period?: string; features: string[]; featured?: boolean }>,
) {
  return rows.map((r, i) => ({
    id: `tpl-plan-${i}`,
    name: r.name,
    price: r.price,
    period: r.period || 'tháng',
    features: r.features,
    ctaLabel: 'Chọn gói',
    featured: r.featured,
  }));
}

function img(n: number) {
  return verifiedBackdropUrl('product', n);
}

function formFields() {
  return [
    { id: 'tpl-fld-name', name: 'name', label: 'Họ tên', fieldType: 'text' as const, required: true },
    { id: 'tpl-fld-phone', name: 'phone', label: 'Số điện thoại', fieldType: 'tel' as const, required: true },
    { id: 'tpl-fld-email', name: 'email', label: 'Email', fieldType: 'email' as const, required: false },
  ];
}

/** Build catalog — exactly 100 templates across declared category counts. */
function buildCatalog(): LpSectionLibraryTemplate[] {
  const t: LpSectionLibraryTemplate[] = [];

  // —— Hero ×12 ——
  const heroes: Array<Partial<LpSectionLibraryTemplate> & { id: string; label: string; thumb: LpSectionThumbLayout; patch: Record<string, unknown> }> = [
    { id: 'hero-01', label: 'Hero centered + CTA', composition: 'centered conversion', thumb: 'hero-centered', patch: { variant: 'centered', headline: 'Xây dựng trang đích chuyển đổi', subheadline: 'Thiết kế rõ ràng, CTA nổi bật, sẵn sàng thu lead.', ctaLabel: 'Bắt đầu ngay', ctaUrl: '#lead-form', spacing: 'lg' } },
    { id: 'hero-02', label: 'Hero split trái', composition: 'split-left SaaS', thumb: 'hero-split-left', patch: { variant: 'split-left', headline: 'Phần mềm giúp đội sales chốt nhanh hơn', subheadline: 'Tự động hóa follow-up và báo cáo pipeline.', ctaLabel: 'Xem demo', imageUrl: img(0), spacing: 'lg' } },
    { id: 'hero-03', label: 'Hero split phải', composition: 'split-right product', thumb: 'hero-split-right', patch: { variant: 'split-right', headline: 'Sản phẩm được thiết kế cho trải nghiệm thật', subheadline: 'Hình ảnh nổi bật bên phải, copy bên trái.', ctaLabel: 'Khám phá', imageUrl: img(1), spacing: 'lg' } },
    { id: 'hero-04', label: 'Hero editorial overlay', composition: 'editorial overlay', thumb: 'hero-overlay', patch: { variant: 'editorial-overlay', headline: 'Câu chuyện thương hiệu trên nền ảnh', subheadline: 'Contrast cao, typography editorial.', ctaLabel: 'Đọc thêm', imageUrl: img(2), spacing: 'lg' } },
    { id: 'hero-05', label: 'Hero full-bleed', composition: 'full-bleed visual', thumb: 'hero-fullbleed', patch: { variant: 'fullscreen-image', headline: 'Một khung hình — một lời mời', subheadline: 'Full viewport image với CTA rõ.', ctaLabel: 'Đăng ký', imageUrl: img(3), spacing: 'none' } },
    { id: 'hero-06', label: 'Hero minimal copy', composition: 'minimal', thumb: 'hero-minimal', patch: { variant: 'minimal-copy', headline: 'Ít chữ. Nhiều khoảng trắng.', subheadline: 'Tối giản, tập trung vào một CTA.', ctaLabel: 'Tiếp tục', spacing: 'lg' } },
    { id: 'hero-07', label: 'Hero floating card', composition: 'floating-card lead', thumb: 'hero-card', patch: { variant: 'floating-card', headline: 'Ưu đãi dành cho bạn', subheadline: 'Card nổi trên nền ảnh — sẵn sàng thu form.', ctaLabel: 'Nhận ưu đãi', imageUrl: img(4), spacing: 'lg' } },
    { id: 'hero-08', label: 'Hero local business', composition: 'local centered', thumb: 'hero-centered', patch: { variant: 'centered', headline: 'Dịch vụ gần bạn — đặt lịch trong 60 giây', subheadline: 'Phù hợp spa, clinic, cửa hàng địa phương.', ctaLabel: 'Đặt lịch', ctaUrl: '#lead-form', spacing: 'md' } },
    { id: 'hero-09', label: 'Hero ecommerce', composition: 'ecommerce split', thumb: 'hero-split-left', patch: { variant: 'split-left', headline: 'Bộ sưu tập mới đã mở bán', subheadline: 'Free ship nội thành · Đổi trả 7 ngày.', ctaLabel: 'Mua ngay', imageUrl: img(5), spacing: 'lg' } },
    { id: 'hero-10', label: 'Hero premium dark tone', composition: 'premium centered', thumb: 'hero-centered', patch: { variant: 'centered', headline: 'Trải nghiệm cao cấp, quy trình minh bạch', subheadline: 'Dành cho dịch vụ premium và tư vấn 1:1.', ctaLabel: 'Tư vấn riêng', spacing: 'lg', background: null } },
    { id: 'hero-11', label: 'Hero asymmetric visual', composition: 'asymmetric split-right', thumb: 'hero-split-right', patch: { variant: 'split-right', headline: 'Làm chủ quy trình marketing của bạn', subheadline: 'Visual nặng bên phải, copy ngắn bên trái.', ctaLabel: 'Dùng thử', imageUrl: img(6), spacing: 'lg' } },
  ];
  // hero-12 trimmed to hit exactly 100 templates (listed category sum was 104).
  for (const h of heroes) {
    t.push({
      id: h.id,
      category: 'hero',
      label: h.label,
      description: h.composition!,
      tags: ['hero', 'banner', h.composition!],
      composition: h.composition!,
      thumb: h.thumb,
      blockType: 'Hero',
      patch: h.patch,
    });
  }

  // —— Intro ×6 (Benefits as title bands) ——
  const intros = [
    { id: 'intro-01', label: 'Intro centered', thumb: 'intro-center' as const, variant: 'minimal-list', headline: 'Vì sao khách hàng chọn chúng tôi', sub: 'Một đoạn mở đầu rõ ràng trước khi vào chi tiết.' },
    { id: 'intro-02', label: 'Intro left editorial', thumb: 'intro-left' as const, variant: 'editorial-list', headline: 'Câu chuyện bắt đầu từ đây', sub: 'Tone editorial, căn trái, khoảng thở rộng.' },
    { id: 'intro-03', label: 'Intro + 3 bullets', thumb: 'list-editorial' as const, variant: 'editorial-list', headline: 'Ba điều bạn sẽ nhận được', sub: 'Intro kèm bullet ngắn.', bullets: true },
    { id: 'intro-04', label: 'Intro SaaS value', thumb: 'intro-center' as const, variant: 'default', headline: 'Một nền tảng. Mọi kênh bán hàng.', sub: 'Giới thiệu value proposition dạng SaaS.' },
    { id: 'intro-05', label: 'Intro local trust', thumb: 'intro-left' as const, variant: 'minimal-list', headline: 'Hơn 10 năm phục vụ cộng đồng', sub: 'Intro tin cậy cho local business.' },
    { id: 'intro-06', label: 'Intro conversion hook', thumb: 'intro-center' as const, variant: 'default', headline: 'Sẵn sàng tăng tỷ lệ chuyển đổi?', sub: 'Hook ngắn trước Benefits/Features.' },
  ];
  for (const x of intros) {
    t.push({
      id: x.id,
      category: 'intro',
      label: x.label,
      description: 'Tiêu đề / intro band',
      tags: ['intro', 'title', 'headline'],
      composition: x.label,
      thumb: x.thumb,
      blockType: 'Benefits',
      patch: {
        variant: x.variant,
        headline: x.headline,
        subheadline: x.sub,
        spacing: 'md',
        items: x.bullets
          ? items([
              { title: 'Rõ ràng', description: 'Thông điệp dễ hiểu ngay từ đầu.' },
              { title: 'Tin cậy', description: 'Social proof và cam kết minh bạch.' },
              { title: 'Hành động', description: 'CTA dẫn đến bước tiếp theo.' },
            ])
          : [],
      },
    });
  }

  // —— Benefits ×8 ——
  const benefitSpecs: Array<{ id: string; label: string; thumb: LpSectionThumbLayout; variant: string; n: number; composition: string }> = [
    { id: 'ben-01', label: 'Benefits 3 cards', thumb: 'cards-3', variant: 'icon-grid', n: 3, composition: 'cards grid' },
    { id: 'ben-02', label: 'Benefits 4 cards', thumb: 'cards-4', variant: 'icon-grid', n: 4, composition: '4-up grid' },
    { id: 'ben-03', label: 'Benefits image cards', thumb: 'cards-3', variant: 'image-cards', n: 3, composition: 'image cards' },
    { id: 'ben-04', label: 'Benefits alternating', thumb: 'alternating', variant: 'alternating', n: 3, composition: 'asymmetric alternating' },
    { id: 'ben-05', label: 'Benefits editorial list', thumb: 'list-editorial', variant: 'editorial-list', n: 4, composition: 'editorial list' },
    { id: 'ben-06', label: 'Benefits numbered', thumb: 'list-numbered', variant: 'numbered', n: 4, composition: 'numbered list' },
    { id: 'ben-07', label: 'Benefits minimal', thumb: 'cards-2', variant: 'minimal-list', n: 2, composition: 'minimal 2-col' },
  ];
  // ben-08 trimmed for exact 100.
  const benefitCopy = [
    ['Nhanh chóng', 'Triển khai trong vài phút'],
    ['Chuyên nghiệp', 'Giao diện chuẩn conversion'],
    ['Đo lường', 'Theo dõi kết quả rõ ràng'],
    ['Linh hoạt', 'Tuỳ biến theo từng chiến dịch'],
  ];
  for (const b of benefitSpecs) {
    t.push({
      id: b.id,
      category: 'benefits',
      label: b.label,
      description: b.composition,
      tags: ['benefits', 'value', b.variant],
      composition: b.composition,
      thumb: b.thumb,
      blockType: 'Benefits',
      patch: {
        variant: b.variant,
        headline: 'Lợi ích nổi bật',
        subheadline: 'Những lý do khách hàng tin tưởng lựa chọn.',
        spacing: 'lg',
        items: items(
          Array.from({ length: b.n }, (_, i) => ({
            title: benefitCopy[i % benefitCopy.length]![0]!,
            description: benefitCopy[i % benefitCopy.length]![1],
            ...(b.variant === 'image-cards' ? { imageUrl: img(10 + i) } : null),
          })),
        ),
      },
    });
  }

  // —— Features ×8 ——
  const featureSpecs = [
    { id: 'feat-01', label: 'Features icon grid', thumb: 'cards-3' as const, variant: 'icon-grid', n: 6 },
    { id: 'feat-02', label: 'Features 3 image cards', thumb: 'cards-3' as const, variant: 'image-cards', n: 3 },
    { id: 'feat-03', label: 'Features alternating', thumb: 'alternating' as const, variant: 'alternating', n: 3 },
    { id: 'feat-04', label: 'Features editorial', thumb: 'list-editorial' as const, variant: 'editorial-list', n: 5 },
    { id: 'feat-05', label: 'Features numbered', thumb: 'list-numbered' as const, variant: 'numbered', n: 5 },
    { id: 'feat-06', label: 'Features minimal list', thumb: 'list-editorial' as const, variant: 'minimal-list', n: 4 },
    { id: 'feat-07', label: 'Features SaaS grid', thumb: 'cards-4' as const, variant: 'icon-grid', n: 4 },
  ];
  // feat-08 trimmed for exact 100.
  for (const f of featureSpecs) {
    t.push({
      id: f.id,
      category: 'features',
      label: f.label,
      description: f.variant,
      tags: ['features', 'capability', f.variant],
      composition: f.variant,
      thumb: f.thumb,
      blockType: 'Features',
      patch: {
        variant: f.variant,
        headline: 'Tính năng chính',
        subheadline: 'Đủ mạnh để vận hành — đủ đơn giản để bắt đầu.',
        spacing: 'lg',
        items: items(
          Array.from({ length: f.n }, (_, i) => ({
            title: `Tính năng ${i + 1}`,
            description: 'Mô tả ngắn gọn về năng lực sản phẩm hoặc dịch vụ.',
            ...(f.variant === 'image-cards' || f.variant === 'alternating' ? { imageUrl: img(20 + i) } : null),
          })),
        ),
      },
    });
  }

  // —— Content/Text ×6 ——
  const contents = [
    { id: 'txt-01', label: 'Content centered essay', thumb: 'intro-center' as const, variant: 'minimal-list' },
    { id: 'txt-02', label: 'Content left longform', thumb: 'intro-left' as const, variant: 'editorial-list' },
    { id: 'txt-03', label: 'Content + checklist', thumb: 'list-editorial' as const, variant: 'editorial-list', list: true },
    { id: 'txt-04', label: 'Content numbered takeaways', thumb: 'list-numbered' as const, variant: 'numbered', list: true },
    { id: 'txt-05', label: 'Content two pillars', thumb: 'cards-2' as const, variant: 'minimal-list', n: 2 },
    { id: 'txt-06', label: 'Content three pillars', thumb: 'cards-3' as const, variant: 'default', n: 3 },
  ];
  for (const c of contents) {
    const n = c.n ?? (c.list ? 4 : 0);
    t.push({
      id: c.id,
      category: 'content',
      label: c.label,
      description: 'Text-focused section',
      tags: ['content', 'text', 'copy'],
      composition: c.label,
      thumb: c.thumb,
      blockType: 'Benefits',
      patch: {
        variant: c.variant,
        headline: 'Nội dung chính',
        subheadline:
          'Đoạn văn trung tính giúp khách hàng hiểu vấn đề, giải pháp và bước tiếp theo — không phụ thuộc brand color.',
        spacing: 'md',
        items:
          n > 0
            ? items(
                Array.from({ length: n }, (_, i) => ({
                  title: `Ý chính ${i + 1}`,
                  description: 'Giải thích ngắn, dễ scan trên mobile và desktop.',
                })),
              )
            : [],
      },
    });
  }

  // —— Image + Content ×8 ——
  const imgContent = [
    { id: 'imgc-01', label: 'Image left + copy', thumb: 'image-left' as const, type: 'Product' as const, variant: 'alternating' },
    { id: 'imgc-02', label: 'Image right + copy', thumb: 'image-right' as const, type: 'Features' as const, variant: 'alternating' },
    { id: 'imgc-03', label: 'Image cards trio', thumb: 'cards-3' as const, type: 'Product' as const, variant: 'image-cards' },
    { id: 'imgc-04', label: 'Hero-like split product', thumb: 'hero-split-left' as const, type: 'Hero' as const, variant: 'split-left' },
    { id: 'imgc-05', label: 'Hero-like split right', thumb: 'hero-split-right' as const, type: 'Hero' as const, variant: 'split-right' },
    { id: 'imgc-06', label: 'Editorial image story', thumb: 'alternating' as const, type: 'Features' as const, variant: 'editorial-list' },
    { id: 'imgc-07', label: 'Product showcase grid', thumb: 'cards-3' as const, type: 'Product' as const, variant: 'image-cards' },
  ];
  // imgc-08 trimmed for exact 100.
  for (const row of imgContent) {
    t.push({
      id: row.id,
      category: 'image-content',
      label: row.label,
      description: 'Image + content composition',
      tags: ['image', 'content', 'split'],
      composition: row.label,
      thumb: row.thumb,
      blockType: row.type,
      patch:
        row.type === 'Hero'
          ? {
              variant: row.variant,
              headline: 'Hình ảnh kể câu chuyện sản phẩm',
              subheadline: 'Kết hợp visual và copy theo tỉ lệ rõ ràng.',
              ctaLabel: 'Xem chi tiết',
              imageUrl: img(30),
              spacing: 'lg',
            }
          : {
              variant: row.variant,
              headline: 'Hình ảnh + nội dung',
              subheadline: 'Bố cục cân bằng giữa media và thông điệp.',
              spacing: 'lg',
              items: items([
                { title: 'Điểm nhấn 1', description: 'Mô tả kèm hình minh hoạ.', imageUrl: img(31) },
                { title: 'Điểm nhấn 2', description: 'Giữ khoảng cách và hierarchy.', imageUrl: img(32) },
                { title: 'Điểm nhấn 3', description: 'CTA rõ ở cuối section.', imageUrl: img(33) },
              ]),
            },
    });
  }

  // —— Gallery ×5 ——
  const galleries = [
    { id: 'gal-01', label: 'Gallery grid', thumb: 'gallery-grid' as const, variant: 'grid', n: 6 },
    { id: 'gal-02', label: 'Gallery masonry', thumb: 'gallery-mosaic' as const, variant: 'masonry', n: 6 },
    { id: 'gal-03', label: 'Gallery editorial mosaic', thumb: 'gallery-mosaic' as const, variant: 'editorial-mosaic', n: 5 },
    { id: 'gal-04', label: 'Gallery featured + grid', thumb: 'gallery-grid' as const, variant: 'featured-plus-grid', n: 5 },
    { id: 'gal-05', label: 'Gallery default', thumb: 'gallery-grid' as const, variant: 'default', n: 4 },
  ];
  for (const g of galleries) {
    t.push({
      id: g.id,
      category: 'gallery',
      label: g.label,
      description: g.variant,
      tags: ['gallery', 'photos', g.variant],
      composition: g.variant,
      thumb: g.thumb,
      blockType: 'Gallery',
      patch: {
        variant: g.variant,
        headline: 'Thư viện hình ảnh',
        subheadline: 'Showcase trực quan — tối ưu cho portfolio và sản phẩm.',
        spacing: 'lg',
        items: items(
          Array.from({ length: g.n }, (_, i) => ({
            title: `Ảnh ${i + 1}`,
            description: '',
            imageUrl: img(40 + i),
          })),
        ),
      },
    });
  }

  // —— Services ×6 (Features/Process framed as services) ——
  const services = [
    { id: 'svc-01', label: 'Services 3 cards', type: 'Features' as const, thumb: 'cards-3' as const, variant: 'icon-grid', n: 3 },
    { id: 'svc-02', label: 'Services 4 cards', type: 'Features' as const, thumb: 'cards-4' as const, variant: 'icon-grid', n: 4 },
    { id: 'svc-03', label: 'Services image cards', type: 'Features' as const, thumb: 'cards-3' as const, variant: 'image-cards', n: 3 },
    { id: 'svc-04', label: 'Services steps', type: 'Process' as const, thumb: 'process-steps' as const, variant: 'steps', n: 4 },
    { id: 'svc-05', label: 'Services timeline', type: 'Process' as const, thumb: 'process-steps' as const, variant: 'timeline', n: 4 },
    { id: 'svc-06', label: 'Services list', type: 'Features' as const, thumb: 'list-editorial' as const, variant: 'editorial-list', n: 5 },
  ];
  for (const s of services) {
    t.push({
      id: s.id,
      category: 'services',
      label: s.label,
      description: 'Services offering',
      tags: ['services', 'local', s.variant],
      composition: s.label,
      thumb: s.thumb,
      blockType: s.type,
      patch: {
        variant: s.variant,
        headline: 'Dịch vụ của chúng tôi',
        subheadline: 'Gói dịch vụ rõ ràng — dễ so sánh và chọn.',
        spacing: 'lg',
        items: items(
          Array.from({ length: s.n }, (_, i) => ({
            title: `Dịch vụ ${i + 1}`,
            description: 'Phạm vi công việc, thời gian và kết quả kỳ vọng.',
            ...(s.variant === 'image-cards' ? { imageUrl: img(50 + i) } : null),
          })),
        ),
      },
    });
  }

  // —— Product ×5 ——
  const products = [
    { id: 'prd-01', label: 'Product icon grid', thumb: 'cards-3' as const, variant: 'icon-grid' },
    { id: 'prd-02', label: 'Product image cards', thumb: 'cards-3' as const, variant: 'image-cards' },
    { id: 'prd-03', label: 'Product alternating', thumb: 'alternating' as const, variant: 'alternating' },
    { id: 'prd-04', label: 'Product editorial', thumb: 'list-editorial' as const, variant: 'editorial-list' },
    { id: 'prd-05', label: 'Product numbered', thumb: 'list-numbered' as const, variant: 'numbered' },
  ];
  for (const p of products) {
    t.push({
      id: p.id,
      category: 'product',
      label: p.label,
      description: p.variant,
      tags: ['product', 'ecommerce', p.variant],
      composition: p.variant,
      thumb: p.thumb,
      blockType: 'Product',
      patch: {
        variant: p.variant,
        headline: 'Sản phẩm nổi bật',
        subheadline: 'Hộp sản phẩm sẵn sàng cho landing ecommerce.',
        spacing: 'lg',
        items: items([
          { title: 'Sản phẩm A', description: 'Mô tả ngắn · giá và CTA ở Inspector.', imageUrl: img(60) },
          { title: 'Sản phẩm B', description: 'Điểm khác biệt rõ ràng.', imageUrl: img(61) },
          { title: 'Sản phẩm C', description: 'Phù hợp upsell / cross-sell.', imageUrl: img(62) },
        ]),
      },
    });
  }

  // —— Pricing ×6 ——
  const pricing = [
    { id: 'price-01', label: 'Pricing 3 cards', thumb: 'pricing-3' as const, variant: 'cards', n: 3 },
    { id: 'price-02', label: 'Pricing comparison', thumb: 'pricing-compare' as const, variant: 'comparison', n: 3 },
    { id: 'price-03', label: 'Pricing minimal 2', thumb: 'cards-2' as const, variant: 'minimal', n: 2 },
    { id: 'price-04', label: 'Pricing default', thumb: 'pricing-3' as const, variant: 'default', n: 3 },
    { id: 'price-05', label: 'Pricing featured middle', thumb: 'pricing-3' as const, variant: 'cards', n: 3, featureMid: true },
    { id: 'price-06', label: 'Pricing 4 tiers', thumb: 'cards-4' as const, variant: 'cards', n: 4 },
  ];
  for (const p of pricing) {
    const names = ['Starter', 'Pro', 'Business', 'Enterprise'];
    const prices = ['199.000đ', '499.000đ', '999.000đ', 'Liên hệ'];
    t.push({
      id: p.id,
      category: 'pricing',
      label: p.label,
      description: p.variant,
      tags: ['pricing', 'plans', p.variant],
      composition: p.variant,
      thumb: p.thumb,
      blockType: 'Pricing',
      patch: {
        variant: p.variant,
        headline: 'Bảng giá minh bạch',
        subheadline: 'Chọn gói phù hợp — nâng cấp bất cứ lúc nào.',
        spacing: 'lg',
        plans: plans(
          Array.from({ length: p.n }, (_, i) => ({
            name: names[i]!,
            price: prices[i]!,
            features: ['Tính năng cốt lõi', 'Hỗ trợ cơ bản', 'Cập nhật định kỳ'],
            featured: Boolean(p.featureMid && i === 1),
          })),
        ),
      },
    });
  }

  // —— Testimonials ×6 ——
  const testi = [
    { id: 'tes-01', label: 'Testimonials cards', thumb: 'quotes-cards' as const, variant: 'cards', n: 3 },
    { id: 'tes-02', label: 'Quote centered', thumb: 'quote' as const, variant: 'quote-centered', n: 1 },
    { id: 'tes-03', label: 'Editorial quotes', thumb: 'quotes-cards' as const, variant: 'editorial', n: 3 },
    { id: 'tes-04', label: 'Portrait quotes', thumb: 'quotes-cards' as const, variant: 'portrait-quotes', n: 3 },
    { id: 'tes-05', label: 'Metric + quote', thumb: 'stats-row' as const, variant: 'metric-plus-quote', n: 2 },
    { id: 'tes-06', label: 'Testimonials default', thumb: 'quotes-cards' as const, variant: 'default', n: 3 },
  ];
  for (const row of testi) {
    t.push({
      id: row.id,
      category: 'testimonials',
      label: row.label,
      description: row.variant,
      tags: ['testimonials', 'social proof', row.variant],
      composition: row.variant,
      thumb: row.thumb,
      blockType: 'Testimonials',
      patch: {
        variant: row.variant,
        headline: 'Khách hàng nói gì',
        subheadline: 'Phản hồi thật — thay nội dung trong Inspector.',
        spacing: 'lg',
        items: items(
          Array.from({ length: row.n }, (_, i) => ({
            title: `Khách hàng ${i + 1}`,
            role: 'Người dùng',
            quote: 'Trải nghiệm rõ ràng, hỗ trợ nhanh và kết quả đo được.',
            description: '',
          })),
        ),
      },
    });
  }

  // —— Stats ×4 ——
  const stats = [
    { id: 'stat-01', label: 'Stats 4 metrics', thumb: 'stats-row' as const, variant: 'numbered', n: 4 },
    { id: 'stat-02', label: 'Stats 3 metrics', thumb: 'stats-row' as const, variant: 'icon-grid', n: 3 },
    { id: 'stat-03', label: 'Stats + proof quote', thumb: 'stats-row' as const, type: 'Testimonials' as const, variant: 'metric-plus-quote' },
    { id: 'stat-04', label: 'Stats minimal row', thumb: 'stats-row' as const, variant: 'minimal-list', n: 4 },
  ];
  for (const s of stats) {
    if (s.type === 'Testimonials') {
      t.push({
        id: s.id,
        category: 'stats',
        label: s.label,
        description: 'Metric + quote',
        tags: ['stats', 'numbers'],
        composition: s.label,
        thumb: s.thumb,
        blockType: 'Testimonials',
        patch: {
          variant: s.variant,
          headline: 'Con số biết nói',
          subheadline: 'Kết quả trung tính — điền số thật của bạn.',
          spacing: 'md',
          items: items([
            { title: '2.4×', role: 'Tăng trưởng', quote: 'Quy trình rõ ràng giúp đội ngũ chạy nhanh hơn.' },
            { title: '98%', role: 'Hài lòng', quote: 'Hỗ trợ tận tình trong suốt quá trình.' },
          ]),
        },
      });
    } else {
      t.push({
        id: s.id,
        category: 'stats',
        label: s.label,
        description: 'Numbers band',
        tags: ['stats', 'numbers'],
        composition: s.label,
        thumb: s.thumb,
        blockType: 'Benefits',
        patch: {
          variant: s.variant,
          headline: 'Tác động đo được',
          subheadline: 'Các chỉ số then chốt.',
          spacing: 'md',
          items: items(
            [
              { title: '10k+', description: 'Người dùng' },
              { title: '4.9★', description: 'Đánh giá' },
              { title: '24/7', description: 'Hỗ trợ' },
              { title: '3×', description: 'ROI trung bình' },
            ].slice(0, s.n),
          ),
        },
      });
    }
  }

  // —— Process ×4 ——
  const processes = [
    { id: 'proc-01', label: 'Process steps', thumb: 'process-steps' as const, variant: 'steps' },
    { id: 'proc-02', label: 'Process timeline', thumb: 'process-steps' as const, variant: 'timeline' },
    { id: 'proc-03', label: 'Process default', thumb: 'process-steps' as const, variant: 'default' },
    { id: 'proc-04', label: 'Process 5 steps', thumb: 'process-steps' as const, variant: 'steps', n: 5 },
  ];
  for (const p of processes) {
    const n = p.n ?? 4;
    t.push({
      id: p.id,
      category: 'process',
      label: p.label,
      description: p.variant,
      tags: ['process', 'steps', p.variant],
      composition: p.variant,
      thumb: p.thumb,
      blockType: 'Process',
      patch: {
        variant: p.variant,
        headline: 'Quy trình làm việc',
        subheadline: 'Từ tư vấn đến bàn giao — rõ từng bước.',
        spacing: 'lg',
        items: items(
          Array.from({ length: n }, (_, i) => ({
            title: `Bước ${i + 1}`,
            description: 'Mô tả đầu ra và thời gian dự kiến.',
          })),
        ),
      },
    });
  }

  // —— FAQ ×4 ——
  const faqs = [
    { id: 'faq-01', label: 'FAQ accordion', thumb: 'faq-list' as const, variant: 'accordion', n: 5 },
    { id: 'faq-02', label: 'FAQ two-column', thumb: 'faq-list' as const, variant: 'two-column', n: 6 },
    { id: 'faq-03', label: 'FAQ default', thumb: 'faq-list' as const, variant: 'default', n: 4 },
    { id: 'faq-04', label: 'FAQ compact 3', thumb: 'faq-list' as const, variant: 'accordion', n: 3 },
  ];
  for (const f of faqs) {
    t.push({
      id: f.id,
      category: 'faq',
      label: f.label,
      description: f.variant,
      tags: ['faq', 'questions', f.variant],
      composition: f.variant,
      thumb: f.thumb,
      blockType: 'FAQ',
      patch: {
        variant: f.variant,
        headline: 'Câu hỏi thường gặp',
        subheadline: 'Giải đáp nhanh trước khi khách liên hệ.',
        spacing: 'md',
        items: items(
          Array.from({ length: f.n }, (_, i) => ({
            question: `Câu hỏi ${i + 1}?`,
            answer: 'Câu trả lời trung tính, ngắn gọn, dễ chỉnh trong Inspector.',
            title: `Câu hỏi ${i + 1}?`,
            description: 'Câu trả lời trung tính, ngắn gọn, dễ chỉnh trong Inspector.',
          })),
        ),
      },
    });
  }

  // —— Lead/Form ×5 ——
  const leads = [
    { id: 'lead-01', label: 'Form card', thumb: 'form-card' as const, variant: 'card' },
    { id: 'lead-02', label: 'Form split', thumb: 'form-split' as const, variant: 'split' },
    { id: 'lead-03', label: 'Form compact', thumb: 'form-card' as const, variant: 'compact' },
    { id: 'lead-04', label: 'Form booking', thumb: 'form-card' as const, variant: 'booking' },
    { id: 'lead-05', label: 'Form floating card', thumb: 'form-card' as const, variant: 'floating-card' },
  ];
  for (const l of leads) {
    t.push({
      id: l.id,
      category: 'lead',
      label: l.label,
      description: l.variant,
      tags: ['form', 'lead', 'contact', l.variant],
      composition: l.variant,
      thumb: l.thumb,
      blockType: 'LeadForm',
      patch: {
        variant: l.variant,
        headline: 'Đăng ký nhận tư vấn',
        subheadline: 'Để lại thông tin — đội ngũ sẽ liên hệ sớm.',
        submitLabel: 'Gửi đăng ký',
        spacing: 'lg',
        fields: formFields(),
      },
    });
  }

  // —— CTA ×4 ——
  const ctas = [
    { id: 'cta-01', label: 'CTA centered', thumb: 'cta-banner' as const, variant: 'centered' },
    { id: 'cta-02', label: 'CTA split', thumb: 'cta-split' as const, variant: 'split' },
    { id: 'cta-03', label: 'CTA banner', thumb: 'cta-banner' as const, variant: 'banner' },
    { id: 'cta-04', label: 'CTA image background', thumb: 'cta-banner' as const, variant: 'image-background', image: true },
  ];
  for (const c of ctas) {
    t.push({
      id: c.id,
      category: 'cta',
      label: c.label,
      description: c.variant,
      tags: ['cta', 'conversion', c.variant],
      composition: c.variant,
      thumb: c.thumb,
      blockType: 'CTA',
      patch: {
        variant: c.variant,
        headline: 'Sẵn sàng bắt đầu?',
        subheadline: 'Một bước duy nhất để chuyển sang hành động.',
        ctaLabel: 'Liên hệ ngay',
        ctaUrl: '#lead-form',
        spacing: 'lg',
        ...(c.image ? { imageUrl: img(70) } : null),
      },
    });
  }

  // —— Guarantee ×3 ——
  const guars = [
    { id: 'guar-01', label: 'Guarantee banner', thumb: 'guarantee' as const, variant: 'banner' },
    { id: 'guar-02', label: 'Guarantee minimal', thumb: 'guarantee' as const, variant: 'minimal' },
    { id: 'guar-03', label: 'Guarantee default', thumb: 'guarantee' as const, variant: 'default' },
  ];
  for (const g of guars) {
    t.push({
      id: g.id,
      category: 'guarantee',
      label: g.label,
      description: g.variant,
      tags: ['guarantee', 'trust', g.variant],
      composition: g.variant,
      thumb: g.thumb,
      blockType: 'Guarantee',
      patch: {
        variant: g.variant,
        headline: 'Cam kết của chúng tôi',
        body: 'Đảm bảo chất lượng dịch vụ. Liên hệ nếu bạn chưa hài lòng — chúng tôi hỗ trợ theo chính sách.',
        ctaLabel: 'Tìm hiểu chính sách',
        spacing: 'md',
      },
    });
  }

  // —— Video ×2 ——
  t.push({
    id: 'vid-01',
    category: 'video',
    label: 'Video widescreen',
    description: 'widescreen',
    tags: ['video', 'media'],
    composition: 'widescreen',
    thumb: 'video',
    blockType: 'Video',
    patch: {
      variant: 'widescreen',
      headline: 'Xem sản phẩm hoạt động',
      subheadline: 'Video thuyết phục — thay URL trong Inspector.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      spacing: 'lg',
    },
  });
  t.push({
    id: 'vid-02',
    category: 'video',
    label: 'Video sidebar',
    description: 'sidebar',
    tags: ['video', 'sidebar'],
    composition: 'sidebar',
    thumb: 'video',
    blockType: 'Video',
    patch: {
      variant: 'sidebar',
      headline: 'Demo nhanh 90 giây',
      subheadline: 'Layout sidebar — copy kèm video.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      spacing: 'md',
    },
  });

  // —— Countdown ×2 ——
  t.push({
    id: 'cd-01',
    category: 'countdown',
    label: 'Countdown boxes',
    description: 'urgency boxes',
    tags: ['countdown', 'offer'],
    composition: 'boxes',
    thumb: 'countdown',
    blockType: 'Countdown',
    patch: {
      variant: 'boxes',
      styleVariant: 'boxes',
      headline: 'Ưu đãi kết thúc sau',
      subheadline: 'Đặt lịch trước khi hết giờ.',
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      expireBehavior: 'message',
      expireMessage: 'Đã hết thời gian ưu đãi',
      spacing: 'lg',
    },
  });
  t.push({
    id: 'cd-02',
    category: 'countdown',
    label: 'Countdown inline',
    description: 'urgency inline',
    tags: ['countdown', 'inline'],
    composition: 'inline',
    thumb: 'countdown',
    blockType: 'Countdown',
    patch: {
      variant: 'inline',
      styleVariant: 'inline',
      headline: 'Chỉ còn vài giờ',
      subheadline: 'Offer band gọn cho conversion.',
      endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
      showDays: false,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      expireBehavior: 'cta',
      expireCtaLabel: 'Liên hệ ngay',
      expireCtaUrl: '#lead-form',
      spacing: 'md',
    },
  });

  return t;
}

export const LP_SECTION_LIBRARY_TEMPLATES: LpSectionLibraryTemplate[] = buildCatalog().map(finishSectionLibraryTemplate);

export function assertSectionLibraryCount(): number {
  return LP_SECTION_LIBRARY_TEMPLATES.length;
}

export function getSectionLibraryTemplate(id: string): LpSectionLibraryTemplate | undefined {
  return LP_SECTION_LIBRARY_TEMPLATES.find((t) => t.id === id);
}

export function searchSectionLibraryTemplates(
  query: string,
  category: LpSectionLibraryCategoryId | 'all',
): LpSectionLibraryTemplate[] {
  const q = query.trim().toLowerCase();
  return LP_SECTION_LIBRARY_TEMPLATES.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (!q) return true;
    const hay = `${t.label} ${t.description} ${t.composition} ${t.tags.join(' ')} ${t.blockType}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Materialize a catalog template into a fresh editable block (new ids). */
export function materializeSectionLibraryTemplate(
  template: LpSectionLibraryTemplate,
  makeId: (prefix: string) => string,
): LandingPageBlock {
  const patch = { ...template.patch };
  const remapItems = (arr: unknown) => {
    if (!Array.isArray(arr)) return arr;
    return arr.map((raw) => {
      const it = { ...(raw as Record<string, unknown>) };
      it.id = makeId('item');
      return it;
    });
  };
  if (patch.items) patch.items = remapItems(patch.items);
  if (patch.plans) patch.plans = remapItems(patch.plans);
  if (patch.fields) patch.fields = remapItems(patch.fields);

  return {
    id: makeId(template.blockType.toLowerCase()),
    type: template.blockType,
    enabled: true,
    spacing: 'md',
    ...patch,
    style: {
      ...((patch.style || {}) as Record<string, unknown>),
      lpSectionLibrary: {
        version: template.presentation?.revision === 2 ? 2 : 1,
        ...(template.presentation ? { presentation: { ...template.presentation } } : {}),
        templateId: template.id,
        theme: template.previewTheme || 'MODERN',
        themeTokens: { ...(template.previewTokens || LANDING_PAGE_THEME_PRESETS[template.previewTheme || 'MODERN']) },
        designFamily: template.designFamily || 'conversion',
      },
    },
  } as LandingPageBlock;
}
