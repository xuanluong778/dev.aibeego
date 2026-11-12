/**
 * SEO gold-standard copy — audit KPI / problem-first / pricing packages.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  SEO_GOLD_ARCHITECTURE_IDS,
  type SeoGoldStandard,
  resolveSeoGoldStandard,
} from './landing-page-seo-gold-system';

export type SeoGoldDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  featuresHeadline?: string;
  features?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  galleryHeadline?: string;
  gallerySub?: string;
  galleryItems?: Array<{ title: string; description: string }>;
  testimonialsHeadline?: string;
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  pricingHeadline?: string;
  pricing?: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
  }>;
  faq?: Array<{ question: string; answer: string }>;
  guarantee?: string;
  formHeadline: string;
  formSub?: string;
  formSubmit: string;
  ctaHeadline: string;
  ctaSub?: string;
  ctaLabel: string;
  videoHeadline?: string;
  videoSub?: string;
};

const DIRECTIONS: Record<string, SeoGoldDirectionCopy> = {
  [SEO_GOLD_ARCHITECTURE_IDS['audit-kpi']]: {
    hero: {
      headline: 'SEO minh bạch — KPI organic rõ từ tháng đầu',
      subheadline:
        'Audit kỹ thuật + keyword map + dashboard ranking. Báo cáo tuần, không cam kết thứ hạng ảo.',
      body: 'Dành cho marketing lead & founder cần thấy traffic chất lượng tăng — không chỉ report vanity.',
      ctaLabel: 'Nhận audit miễn phí',
      trustPoints: ['Dashboard KPI realtime', 'Keyword map theo intent', 'Case ranking thật'],
    },
    featuresHeadline: 'Vấn đề SEO thường gặp',
    features: [
      {
        title: 'Traffic tăng nhưng không convert',
        description: 'Keyword rộng, intent lệch — visit tăng nhưng lead và doanh thu đứng im.',
      },
      {
        title: 'Agency báo cáo mơ hồ',
        description: 'Chỉ show impression và position trung bình — không map về pipeline hay revenue.',
      },
      {
        title: 'Technical debt tích lũy',
        description: 'Index lỗi, CWV kém, schema thiếu — content mới không được Google ưu tiên crawl.',
      },
    ],
    testimonialsHeadline: 'Kết quả organic đã đo',
    testimonials: [
      {
        quote: 'Dashboard tuần cho thấy keyword commercial tăng 2.3x — team sales thấy lead organic rõ.',
        author: 'Hà My',
        role: 'Marketing Lead · B2B SaaS',
      },
      {
        quote: 'Audit tuần 1 phát hiện 340 URL orphan — fix xong traffic qualified +41% trong 90 ngày.',
        author: 'Tuấn K.',
        role: 'Founder · E-commerce',
      },
    ],
    benefitsHeadline: 'Giải pháp: growth organic có cấu trúc',
    benefits: [
      {
        title: 'Audit kỹ thuật toàn diện',
        description: 'Crawl, index, CWV, internal link, schema — prioritized backlog tuần 1.',
      },
      {
        title: 'Keyword map theo funnel',
        description: 'Nhóm intent informational, commercial, transactional — content plan rõ.',
      },
      {
        title: 'KPI dashboard hàng tuần',
        description: 'Ranking, click, impression, conversion — biết page nào scale, page nào dừng.',
      },
    ],
    processHeadline: 'Lộ trình 4 giai đoạn',
    process: [
      { title: 'Audit & baseline', description: 'Technical scan, competitor tear-down, KPI map tháng 1.' },
      { title: 'Quick wins', description: 'Fix index, on-page priority pages, internal link hub.' },
      { title: 'Content & authority', description: 'Cluster content, link building có chọn lọc, CWV optimize.' },
      { title: 'Scale & report', description: 'Dashboard tuần, quarterly review, roadmap 90 ngày tiếp.' },
    ],
    formHeadline: 'Yêu cầu audit SEO miễn phí',
    formSub: 'Gửi domain — báo cáo sơ bộ trong 48 giờ làm việc.',
    formSubmit: 'Gửi yêu cầu audit',
    ctaHeadline: 'Sẵn sàng thấy KPI organic thật?',
    ctaSub: 'Audit miễn phí — không bắt ký hợp đồng dài hạn.',
    ctaLabel: 'Nhận audit miễn phí',
  },

  [SEO_GOLD_ARCHITECTURE_IDS['problem-first']]: {
    hero: {
      headline: 'Organic growth bền vững — vấn đề trước, giải pháp sau',
      subheadline:
        'Problem-first SEO: chẩn đoán rõ bottleneck ranking, content và technical trước khi cam kết scope.',
      body: 'Phù hợp brand đã thử SEO nhưng chưa thấy traffic chất lượng hoặc ROI rõ.',
      ctaLabel: 'Đặt lịch strategy call',
      trustPoints: ['Chẩn đoán trước scope', 'Không lock-in 12 tháng', 'Ranking proof ngành bạn'],
    },
    featuresHeadline: '3 bottleneck khiến SEO không lên',
    features: [
      {
        title: 'Content không match intent',
        description: 'Bài viết dài nhưng không trả lời query commercial — Google không rank top 10.',
      },
      {
        title: 'Site architecture yếu',
        description: 'Silos lỏng, cannibalization keyword, orphan pages — authority phân tán.',
      },
      {
        title: 'Không đo conversion organic',
        description: 'Chỉ track session — không biết keyword nào drive demo, form hay mua hàng.',
      },
    ],
    benefitsHeadline: 'USP: SEO agency làm việc như growth team',
    benefits: [
      {
        title: 'Intent-first content',
        description: 'Brief theo SERP analysis — format và depth match top ranking thật.',
      },
      {
        title: 'Technical sprint song song',
        description: 'Dev ticket ưu tiên CWV và index — không chờ content xong mới fix site.',
      },
      {
        title: 'Revenue-attributed reporting',
        description: 'GA4 + CRM map organic sang lead và deal — report cho board hiểu được.',
      },
    ],
    testimonialsHeadline: 'Client đã vượt bottleneck',
    testimonials: [
      {
        quote: 'Strategy call 30 phút chỉ ra cannibalization 12 URL — fix xong 6 tuần lên top 3 nhóm keyword chính.',
        author: 'Phương L.',
        role: 'CMO · EdTech',
      },
      {
        quote: 'Lần đầu thấy organic map vào pipeline CRM — không còn tranh cãi budget SEO nội bộ.',
        author: 'Đức H.',
        role: 'Growth · Fintech',
      },
    ],
    guarantee:
      'Cam kết minh bạch: audit report gửi trước khi ký · scope fixed monthly · cancel 30 ngày notice · không cam kết thứ hạng cụ thể.',
    formHeadline: 'Đặt lịch strategy call',
    formSub: '30 phút — review site, competitor và KPI mục tiêu.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Muốn chẩn đoán bottleneck trước khi đầu tư?',
    ctaSub: 'Strategy call miễn phí — slot tuần này còn hạn.',
    ctaLabel: 'Đặt lịch strategy call',
  },

  [SEO_GOLD_ARCHITECTURE_IDS['pricing-packages']]: {
    hero: {
      headline: 'Gói SEO rõ scope — từ startup đến enterprise',
      subheadline:
        'Pricing công khai: audit, content cluster, technical sprint. FAQ trả objection trước khi book call.',
      ctaLabel: 'Nhận báo giá chi tiết',
      trustPoints: ['3 gói so sánh rõ', 'Không phí ẩn', 'Scope fixed monthly'],
    },
    featuresHeadline: 'Mỗi gói gồm gì',
    features: [
      {
        title: 'Starter — foundation',
        description: 'Audit, 5 page on-page, keyword map cơ bản — phù hợp site mới hoặc local.',
      },
      {
        title: 'Growth — scale organic',
        description: 'Content cluster, technical sprint, link outreach — KPI dashboard tuần.',
      },
      {
        title: 'Enterprise — full squad',
        description: 'Multi-domain, international, dedicated SEO lead — custom SLA.',
      },
    ],
    benefitsHeadline: 'Vì sao chọn gói thay vì báo giá mù',
    benefits: [
      {
        title: 'Biết deliverable trước khi ký',
        description: 'Số bài, số page optimize, số report — không surprise giữa tháng.',
      },
      {
        title: 'Upgrade/downgrade linh hoạt',
        description: 'Scale gói theo season — Q4 peak có thể tăng content sprint.',
      },
      {
        title: 'ROI forecast sơ bộ',
        description: 'Ước tính traffic và lead từ keyword map — set expectation realistic.',
      },
    ],
    pricingHeadline: 'Bảng gói SEO',
    pricing: [
      {
        name: 'Starter',
        price: '12.000.000đ',
        period: '/tháng',
        features: ['Audit + 5 page on-page', 'Keyword map', 'Report tháng'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '28.000.000đ',
        period: '/tháng',
        features: ['Content cluster', 'Technical sprint', 'Dashboard tuần', 'Link outreach'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['Multi-site', 'Dedicated lead', 'Custom SLA', 'International SEO'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Gói Growth khác Starter thế nào?',
        answer: 'Growth thêm content cluster 4–8 bài/tháng, technical sprint liên tục và dashboard KPI tuần thay vì report tháng.',
      },
      {
        question: 'Có cam kết thứ hạng không?',
        answer: 'Không cam kết vị trí cụ thể — cam kết process, deliverable và reporting minh bạch theo scope gói.',
      },
      {
        question: 'Hợp đồng tối thiểu bao lâu?',
        answer: 'Starter/Growth: 3 tháng đầu để thấy signal; sau đó cancel 30 ngày notice.',
      },
      {
        question: 'Ai sở hữu content?',
        answer: 'Client sở hữu toàn bộ bài viết và asset on-page sau khi thanh toán tháng phát hành.',
      },
    ],
    formHeadline: 'Nhận báo giá chi tiết theo site',
    formSub: 'Gửi domain và mục tiêu — quote custom trong 48h làm việc.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Chưa chắc gói nào fit?',
    ctaSub: 'Strategy call 15 phút — match gói với ngân sách và timeline.',
    ctaLabel: 'Đặt lịch tư vấn gói',
  },
};

function patchItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  src: Array<{ title: string; description: string }> | undefined,
) {
  if (!src?.length || !items?.length) return items;
  return items.map((item, i) => ({
    ...item,
    title: src[i]?.title ?? item.title,
    description: src[i]?.description ?? item.description,
  }));
}

function patchPlans(
  plans: Array<{
    id: string;
    name?: string;
    price?: string;
    period?: string;
    features?: string[];
    highlighted?: boolean;
  }> | undefined,
  src: SeoGoldDirectionCopy['pricing'],
) {
  if (!src?.length || !plans?.length) return plans;
  return plans.map((plan, i) => {
    const s = src[i];
    if (!s) return plan;
    return {
      ...plan,
      name: s.name,
      price: s.price,
      period: s.period,
      features: s.features,
      highlighted: s.highlighted ?? plan.highlighted,
    };
  });
}

export function applySeoGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveSeoGoldStandard(architectureId);
  if (!gold) return blocks;
  const copy = DIRECTIONS[architectureId];
  if (!copy) return blocks;

  return blocks.map((block): LandingPageBlock => {
    switch (block.type) {
      case 'Hero':
        return {
          ...block,
          headline: copy.hero.headline,
          subheadline: copy.hero.subheadline,
          body: copy.hero.body ?? block.body,
          ctaLabel: copy.hero.ctaLabel,
          trustPoints: copy.hero.trustPoints ?? block.trustPoints,
        };
      case 'Video':
        return {
          ...block,
          headline: copy.videoHeadline || block.headline,
        };
      case 'Benefits':
        return {
          ...block,
          headline: copy.benefitsHeadline || block.headline,
          items: (patchItems(block.items, copy.benefits) || block.items) as typeof block.items,
        };
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline || block.headline,
          items: (patchItems(block.items, copy.features) || block.items) as typeof block.items,
        };
      case 'Process':
        return {
          ...block,
          headline: copy.processHeadline || block.headline,
          items: (patchItems(block.items, copy.process) || block.items) as typeof block.items,
        };
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
          items: (patchClinicGalleryItems(block.items, copy.galleryItems) ||
            block.items) as typeof block.items,
        };
      case 'Testimonials': {
        const items = copy.testimonials;
        if (!items?.length) {
          return { ...block, headline: copy.testimonialsHeadline || block.headline };
        }
        return {
          ...block,
          headline: copy.testimonialsHeadline || block.headline,
          items: block.items.map((item, i) => ({
            ...item,
            quote: items[i]?.quote ?? item.quote,
            author: items[i]?.author ?? item.author,
            role: items[i]?.role ?? item.role,
          })),
        };
      }
      case 'Pricing':
        return {
          ...block,
          headline: copy.pricingHeadline || block.headline,
          plans: (patchPlans(block.plans, copy.pricing) || block.plans) as typeof block.plans,
        };
      case 'FAQ':
        if (!copy.faq?.length) return block;
        return {
          ...block,
          items: copy.faq.map((f, i) => ({
            id: `seo_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết', body: copy.guarantee }
          : block;
      case 'LeadForm':
        return {
          ...block,
          headline: copy.formHeadline,
          subheadline: copy.formSub || block.subheadline,
          submitLabel: copy.formSubmit,
        };
      case 'CTA':
        return {
          ...block,
          headline: copy.ctaHeadline,
          subheadline: copy.ctaSub || block.subheadline,
          ctaLabel: copy.ctaLabel,
        };
      default:
        return block;
    }
  });
}

export function seoGoldLabel(gold: SeoGoldStandard): string {
  const labels: Record<SeoGoldStandard, string> = {
    'audit-kpi': 'Audit & KPI Dashboard',
    'problem-first': 'Problem-First Organic',
    'pricing-packages': 'SEO Pricing Packages',
  };
  return labels[gold];
}
