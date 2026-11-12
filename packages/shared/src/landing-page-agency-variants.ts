import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import {
  applyAgencyPortfolioStandard,
  isAgencyPortfolioStandard,
} from './landing-page-agency-portfolio-standard';
import { buildArchitectureRecipe } from './landing-page-template-foundation';

/** Creation-only recipes. Existing specs are rendered from their persisted version/recipe. */
export const AGENCY_VARIANT_RECIPES = {
  form: {
    id: 'agency_brief_form',
    title: 'Early Form',
    sequence: [
      'Header',
      'Hero',
      'LeadForm',
      'Benefits',
      'Gallery',
      'Process',
      'FAQ',
      'CTA',
      'Footer',
    ],
  },
  faq: {
    id: 'agency_faq_pitch',
    title: 'FAQ Heavy',
    sequence: [
      'Header',
      'Hero',
      'FAQ',
      'Features',
      'Process',
      'Pricing',
      'CTA',
      'LeadForm',
      'Footer',
    ],
  },
  gallery: {
    id: 'agency_work_gallery',
    title: 'Gallery',
    sequence: [
      'Header',
      'Gallery',
      'Hero',
      'Features',
      'Process',
      'Pricing',
      'CTA',
      'LeadForm',
      'Footer',
    ],
  },
  minimal: {
    id: 'agency_minimal_pitch',
    title: 'Minimal',
    sequence: ['Header', 'Hero', 'Features', 'CTA', 'LeadForm', 'Footer'],
  },
  trust: {
    id: 'agency_trust_case',
    title: 'Trust First',
    sequence: [
      'Header',
      'Hero',
      'Benefits',
      'Process',
      'Gallery',
      'FAQ',
      'Pricing',
      'LeadForm',
      'CTA',
      'Footer',
    ],
  },
  process: {
    id: 'agency_process_sprint',
    title: 'Process Story',
    sequence: [
      'Header',
      'Hero',
      'Process',
      'Features',
      'Gallery',
      'FAQ',
      'LeadForm',
      'CTA',
      'Footer',
    ],
  },
  'cream-editorial': {
    id: 'agency_cream_editorial',
    title: 'Cream Editorial',
    sequence: [
      'Header',
      'Hero',
      'Benefits',
      'Features',
      'Gallery',
      'Process',
      'FAQ',
      'LeadForm',
      'CTA',
      'Footer',
    ],
  },
  'modern-saas': {
    id: 'agency_modern_saas',
    title: 'Modern Agency',
    sequence: [
      'Header',
      'Hero',
      'Features',
      'Gallery',
      'Process',
      'Pricing',
      'FAQ',
      'CTA',
      'LeadForm',
      'Footer',
    ],
  },
  split: {
    id: 'agency_nav_services',
    title: 'Split Hero',
    sequence: [
      'Header',
      'Hero',
      'Features',
      'Benefits',
      'Pricing',
      'Process',
      'Gallery',
      'FAQ',
      'CTA',
      'LeadForm',
      'Footer',
    ],
  },
} as const;

export type AgencyVariantDirection = keyof typeof AGENCY_VARIANT_RECIPES;
export function agencyPortfolioDirection(
  spec: LandingPageSpec,
): AgencyVariantDirection | undefined {
  if (!isAgencyPortfolioStandard(spec)) return undefined;
  return (Object.keys(AGENCY_VARIANT_RECIPES) as AgencyVariantDirection[]).find(
    (key) => AGENCY_VARIANT_RECIPES[key].id === spec.meta?.architectureRecipe?.architectureId,
  );
}

export function agencyVariantForSlug(slug: string): AgencyVariantDirection | undefined {
  const suffix = slug.startsWith('agency-portfolio-') ? slug.slice('agency-portfolio-'.length) : '';
  return Object.prototype.hasOwnProperty.call(AGENCY_VARIANT_RECIPES, suffix)
    ? (suffix as AgencyVariantDirection)
    : undefined;
}

const COPY: Record<
  AgencyVariantDirection,
  { purpose: string; headline: string; sub: string; cta: string }
> = {
  form: {
    purpose: 'Thu thập brief sớm; xem đầu ra và quy trình sau khi xác định nhu cầu.',
    headline: 'Bắt đầu từ brief của bạn.',
    sub: 'Chia sẻ mục tiêu và hạng mục cần hỗ trợ. Phạm vi, chi phí và lịch triển khai được trao đổi sau khi làm rõ yêu cầu.',
    cta: 'Gửi brief dự án',
  },
  faq: {
    purpose: 'Giải đáp phạm vi, chi phí và cách phối hợp trước khi chọn hợp tác.',
    headline: 'Hiểu cách phối hợp trước khi bắt đầu.',
    sub: 'Tìm câu trả lời về phạm vi, ngân sách và bàn giao. Sau đó chọn hạng mục phù hợp và gửi yêu cầu trao đổi.',
    cta: 'Trao đổi sau khi xem FAQ',
  },
  gallery: {
    purpose: 'Xem minh họa đầu ra trước khi trao đổi nhu cầu và phạm vi.',
    headline: 'Từ đầu ra bạn cần đến kế hoạch triển khai.',
    sub: 'Các ví dụ phía trên minh họa website, nội dung và tài liệu bàn giao. Chúng giúp trao đổi phạm vi; không phải dự án khách hàng.',
    cta: 'Trao đổi đầu ra cần làm',
  },
  minimal: {
    purpose: 'Trang ngắn cho khách đã có nhu cầu rõ; một hành động liên hệ.',
    headline: 'Một nhu cầu rõ. Một cuộc trao đổi.',
    sub: 'Website, nội dung hoặc chiến dịch: chọn hạng mục bạn cần, chia sẻ mục tiêu và cùng làm rõ bước tiếp theo.',
    cta: 'Trao đổi nhu cầu',
  },
  trust: {
    purpose: 'Đánh giá cách kiểm soát phạm vi và bàn giao; không dùng lời chứng thực giả.',
    headline: 'Rõ cách làm trước khi quyết định hợp tác.',
    sub: 'Đối chiếu brief, phạm vi, mốc rà soát và danh mục bàn giao. Ví dụ đầu ra được ghi rõ là minh họa.',
    cta: 'Trao đổi phạm vi',
  },
  process: {
    purpose: 'Theo dõi quá trình từ brief đến bàn giao; không hứa lịch khi chưa xác nhận.',
    headline: 'Từng bước từ mục tiêu đến bàn giao.',
    sub: 'Bốn mốc phối hợp giúp xác định đầu việc, phản hồi và người phụ trách. Thời gian cụ thể được thống nhất theo từng dự án.',
    cta: 'Trao đổi kế hoạch',
  },
  'cream-editorial': {
    purpose: 'Mạch nội dung biên tập, phù hợp dự án thương hiệu và nội dung.',
    headline: 'Một ý tưởng nhất quán qua từng điểm chạm.',
    sub: 'Cùng phát triển thông điệp, nội dung và giao diện theo mục tiêu của dự án. Xem cách tổ chức đầu ra trước khi gửi brief.',
    cta: 'Chia sẻ ý tưởng',
  },
  'modern-saas': {
    purpose: 'Kết nối website, nội dung và đo lường; không giả giao diện phần mềm hoặc KPI.',
    headline: 'Website, nội dung và chiến dịch trong cùng một kế hoạch.',
    sub: 'Xác định vai trò của từng hạng mục, điểm liên hệ và chỉ số cần theo dõi. Phạm vi tích hợp được làm rõ trước triển khai.',
    cta: 'Trao đổi kế hoạch triển khai',
  },
  split: {
    purpose: 'Chọn dịch vụ trước, sau đó đối chiếu cách hợp tác và quy trình.',
    headline: 'Chọn hạng mục giúp dự án của bạn tiến lên.',
    sub: 'Bắt đầu từ website, nội dung hoặc chiến dịch. Kết hợp hạng mục theo mục tiêu và nguồn lực đang có.',
    cta: 'Trao đổi hạng mục',
  },
};

export function applyAgencyPortfolioVariant(
  template: LandingPageTemplateDefinition,
): LandingPageTemplateDefinition {
  const direction = agencyVariantForSlug(template.slug);
  if (!direction || template.category !== 'agency') return template;
  const config = AGENCY_VARIANT_RECIPES[direction],
    copy = COPY[direction];
  const standard = applyAgencyPortfolioStandard({ ...template, slug: 'agency-portfolio' });
  const blocks: LandingPageBlock[] = config.sequence.map((type) =>
    structuredClone(standard.spec.blocks.find((b) => b.type === type)!),
  );
  const hero = blocks.find((b) => b.type === 'Hero')!;
  if (hero.type === 'Hero') {
    hero.headline = copy.headline;
    hero.subheadline = copy.sub;
    hero.ctaLabel = copy.cta;
    hero.variant = ['form', 'faq', 'minimal', 'cream-editorial'].includes(direction)
      ? 'minimal-copy'
      : direction === 'split'
        ? 'split-right'
        : 'split-left';
    if (hero.variant === 'minimal-copy') delete hero.imageUrl;
    if (direction === 'minimal') hero.trustPoints = [];
  }
  const header = blocks.find((b) => b.type === 'Header')!;
  if (header.type === 'Header') {
    header.headline = 'Agency Portfolio';
    header.subheadline = 'BẢN MẪU · ' + config.title.toUpperCase();
    header.ctaLabel = copy.cta;
  }
  const form = blocks.find((b) => b.type === 'LeadForm')!;
  if (form.type === 'LeadForm') {
    form.headline = direction === 'form' ? 'Chia sẻ brief ban đầu.' : 'Chia sẻ nhu cầu của bạn.';
    form.submitLabel = direction === 'form' ? 'Gửi brief' : 'Gửi yêu cầu trao đổi';
    form.subheadline =
      'Thông tin giúp làm rõ nhu cầu; gửi form chưa xác nhận giá, lịch hoặc phạm vi hợp tác.';
  }
  const faq = blocks.find((b) => b.type === 'FAQ');
  if (faq?.type === 'FAQ' && direction === 'faq') {
    faq.headline = 'Làm rõ những điều bạn đang cân nhắc.';
    faq.items.push(
      {
        id: 'faq-prepare',
        question: 'Cần chuẩn bị gì cho buổi trao đổi?',
        answer:
          'Mục tiêu, đối tượng, hạng mục cần làm và thời điểm dự kiến là điểm bắt đầu. Có thể bổ sung ngân sách nếu đã xác định.',
      },
      {
        id: 'faq-revisions',
        question: 'Số lần chỉnh sửa được tính thế nào?',
        answer:
          'Số vòng phản hồi và phạm vi chỉnh sửa được ghi trong đề xuất. Yêu cầu ngoài phạm vi cần được thống nhất bổ sung.',
      },
      {
        id: 'faq-ownership',
        question: 'Quyền sử dụng file và nội dung ra sao?',
        answer:
          'Danh mục file nguồn, giấy phép tài sản và quyền sử dụng được xác nhận trong thỏa thuận; không mặc định mọi tài sản đều chuyển giao.',
      },
      {
        id: 'faq-results',
        question: 'Có cam kết doanh số hoặc chỉ số không?',
        answer:
          'Chỉ tiêu và cách đo được trao đổi theo điều kiện dự án. Bản mẫu không đưa ra cam kết doanh số, thứ hạng hoặc hiệu quả quảng cáo.',
      },
    );
  }
  if (direction === 'minimal') {
    const services = blocks.find((b) => b.type === 'Features');
    if (services?.type === 'Features') services.variant = 'minimal-list';
  }
  // One persisted recipe describes the actual sequence; navigation omits missing sections at render time.
  const recipe = buildArchitectureRecipe({
    ...template.spec.meta!.architectureRecipe!,
    architectureId: config.id,
    purpose: copy.purpose,
    sectionSequence: blocks.map((b) => b.type),
    formPlacement: direction === 'form' ? 'early_after_hero' : 'late',
    proofType:
      direction === 'minimal' || direction === 'faq' ? 'none' : 'illustrative-deliverables',
    conversionGoal: 'contact',
    layout: 'agency',
    blockVariants: {
      Header: 'default',
      Hero: hero.variant,
      Features: direction === 'minimal' ? 'minimal-list' : 'icon-grid',
      Benefits: direction === 'trust' ? 'editorial-list' : 'icon-grid',
      Gallery: direction === 'gallery' ? 'featured-plus-grid' : 'grid',
      Process: direction === 'process' ? 'timeline' : 'steps',
      Pricing: 'cards',
      FAQ: 'accordion',
      CTA: 'banner',
      LeadForm: direction === 'form' ? 'split' : 'card',
      Footer: 'default',
    },
  });
  for (const b of blocks) b.variant = recipe.blockVariants[b.type] || 'default';
  if (direction === 'cream-editorial' && hero.type === 'Hero') hero.background = '#FAF7F0';
  const base = '/landing-page-assets/agency-portfolio-v2/variants/' + direction;
  return {
    ...template,
    description: copy.purpose,
    conversionGoal: 'contact',
    tags: [
      ...new Set(
        template.tags
          .filter(
            (tag) =>
              ![
                'signup',
                'demo',
                'case_kpi',
                'before_after',
                'certificate',
                'integrations',
              ].includes(tag),
          )
          .concat('contact', 'demo-content'),
      ),
    ],
    thumbnail: base + '-thumb.webp',
    previewLongImage: base + '-long.webp',
    spec: {
      ...standard.spec,
      blocks,
      seo: {
        ...standard.spec.seo,
        title: template.name + ' | Landing Page',
        metaDescription: copy.purpose,
        ogImage: base + '-thumb.webp',
      },
      meta: {
        ...standard.spec.meta,
        goldStandard: undefined,
        architectureRecipe: recipe,
        conversionGoal: 'contact',
        designFamily: template.designFamily,
        gallery: {
          ...template.spec.meta?.gallery,
          thumbnail: base + '-thumb.webp',
          previewLongImage: base + '-long.webp',
          architecture: { ...recipe, id: recipe.architectureId },
        },
      },
    },
  };
}
