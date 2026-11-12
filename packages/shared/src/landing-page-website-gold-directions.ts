/**
 * Website gold-standard copy — per architectureId (studio / craft / dev).
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  WEBSITE_GOLD_ARCHITECTURE_IDS,
  type WebsiteGoldStandard,
  resolveWebsiteGoldStandard,
} from './landing-page-website-gold-system';

export type WebsiteGoldDirectionCopy = {
  hero: { headline: string; subheadline: string; body?: string; ctaLabel: string; trustPoints?: string[] };
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
  pricing?: Array<{ name: string; price: string; period?: string; features: string[]; highlighted?: boolean }>;
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

const DIRECTIONS: Record<string, WebsiteGoldDirectionCopy> = {
  [WEBSITE_GOLD_ARCHITECTURE_IDS['build-quote']]: {
    hero: {
      headline: 'Studio web Next.js — báo giá sau brief, timeline launch rõ từng tuần',
      subheadline:
        'Design system trong Figma, build production trên Next.js, staging URL trước go-live. Quote cố định scope — không phát sinh giữa sprint.',
      body: 'Dành cho founder và marketing lead cần site convert, không chỉ mockup đẹp trên Behance.',
      ctaLabel: 'Nhận báo giá chi tiết',
      trustPoints: ['Brief phản hồi 48h', 'Staging URL trước launch', 'Design system bàn giao'],
    },
    processHeadline: 'Lộ trình build 4 giai đoạn',
    process: [
      { title: 'Brief & page map', description: 'Mục tiêu, sitemap, brand asset, form/CRM hook — chốt scope tuần 1.' },
      { title: 'Design system', description: 'Figma tokens, component map, 2 vòng revision trước khi code.' },
      { title: 'Next.js build', description: 'Responsive, CMS hook, Core Web Vitals pass — review trên staging.' },
      { title: 'Launch & handoff', description: 'Go-live, analytics, source repo, 30 ngày bug-fix sau production.' },
    ],
    featuresHeadline: 'Stack & deliverable',
    features: [
      { title: 'UI/UX custom', description: 'Không theme mua sẵn — layout theo conversion goal và brand guideline.' },
      { title: 'Design system export', description: 'Tokens, spacing, typography spec — dev nội bộ extend sau handoff.' },
      { title: 'Performance-first build', description: 'Lighthouse 90+, lazy load, schema SEO — sẵn sàng index ngày launch.' },
    ],
    pricingHeadline: 'Gói website — giá cố định scope',
    pricing: [
      {
        name: 'Landing',
        price: '18.000.000đ',
        features: ['1 page Next.js', 'Form + email notify', 'Staging URL', '2 revision design'],
        highlighted: false,
      },
      {
        name: 'Corporate',
        price: '42.000.000đ',
        features: ['5–8 pages', 'CMS / headless', 'Design system', '30 ngày support'],
        highlighted: true,
      },
      {
        name: 'E-commerce',
        price: 'Liên hệ',
        features: ['Catalog + checkout', 'Payment hook', 'Dedicated squad'],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: 'Timeline trung bình?',
        answer: 'Landing 2–3 tuần · Corporate 4–6 tuần · E-commerce theo catalog — milestone tuần-by-tuần trên staging.',
      },
      {
        question: 'Tech stack mặc định?',
        answer: 'Next.js + headless CMS hoặc WordPress tùy team vận hành — match stack hiện tại nếu đã có.',
      },
      {
        question: 'Hosting ai setup?',
        answer: 'Tư vấn Vercel/Cloudflare/AWS — agency deploy staging; production theo quyền client hoặc managed add-on.',
      },
      {
        question: 'Sửa nội dung sau bàn giao?',
        answer: 'CMS training 1 buổi · video walkthrough · doc component map kèm repo.',
      },
    ],
    formHeadline: 'Gửi brief — nhận quote trong 48h',
    formSub: 'Brief project: số page, deadline và budget range dự kiến.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Cần ballpark trước khi brief dài?',
    ctaSub: 'Chọn gói Corporate phổ biến nhất — scope mẫu gửi kèm quote.',
    ctaLabel: 'Nhận báo giá →',
  },

  [WEBSITE_GOLD_ARCHITECTURE_IDS['portfolio-trust']]: {
    hero: {
      headline: 'Xem site đã ship — live URL, metric launch, rồi mới gửi brief',
      subheadline:
        'Portfolio-first studio: screenshot desktop/mobile, staging link khi NDA cho phép, testimonial có timeline thật. Trust trước quote.',
      body: 'Phù hợp buyer cần thấy tay nghề dev và design system trước khi mở budget.',
      ctaLabel: 'Xem dự án tương tự',
      trustPoints: ['Live URL khi có thể', 'Before/after UI', 'Handoff repo sạch'],
    },
    galleryHeadline: 'Shipped sites & UI proof',
    gallerySub: 'Corporate · SaaS marketing · e-commerce — client ẩn danh khi NDA.',
    galleryItems: [
      { title: 'SaaS marketing site', description: 'Next.js · 8 pages · design system — live staging 21 ngày · demo signup +34%.' },
      { title: 'Corporate rebrand', description: 'Figma system, 12 pages shipped · CMS self-serve · Core Web Vitals green.' },
      { title: 'D2C storefront', description: 'Headless Shopify · mobile-first · launch peak season on-time.' },
      { title: 'Agency partner white-label', description: 'Component library · 6 client sites/year · handoff spec đồng nhất.' },
    ],
    testimonialsHeadline: 'Client sau go-live',
    testimonials: [
      {
        quote: 'Staging URL tuần 3 — internal review sớm, không surprise layout ngày launch.',
        author: 'Thu H.',
        role: 'Marketing Lead · B2B SaaS',
      },
      {
        quote: 'Repo + design token export — team dev onboard component trong 2 ngày.',
        author: 'Khoa N.',
        role: 'CTO · Startup Series A',
      },
      {
        quote: 'Portfolio ngành fintech giúp legal approve vendor nhanh — metric launch có sẵn.',
        author: 'Lan M.',
        role: 'Head of Brand · Fintech',
      },
    ],
    featuresHeadline: 'Sau khi bạn thấy proof',
    features: [
      { title: 'Discovery sprint', description: 'Workshop brand, competitor tear-down, page map — 3 ngày.' },
      { title: 'Design + dev một squad', description: 'Không handoff Figma lệch code — cùng design system từ đầu.' },
      { title: 'Launch support', description: 'Analytics, redirect, SEO checklist — 30 ngày bug-fix production.' },
    ],
    benefitsHeadline: 'Vì sao trust-first convert cao',
    benefits: [
      { title: 'Champion có proof', description: 'Live URL và case gửi nội bộ trước khi ký SOW.' },
      { title: 'Fit rõ sớm', description: 'Thấy aesthetic và stack match — không waste discovery dài.' },
      { title: 'Scope minh bạch', description: 'Page count, revision round, hosting — tách dòng trên quote.' },
    ],
    guarantee:
      'Cam kết: staging review trước go-live · source repo + asset theo hợp đồng · 30 ngày bug-fix · không lock-in hosting bắt buộc.',
    pricingHeadline: 'Gói sau khi đã xem portfolio',
    pricing: [
      {
        name: 'Landing',
        price: '16.000.000đ',
        features: ['1 page', '2 revision', 'Staging URL'],
        highlighted: false,
      },
      {
        name: 'Corporate',
        price: '38.000.000đ',
        period: 'từ',
        features: ['5–8 pages', 'CMS', 'Design system', '30 ngày support'],
        highlighted: true,
      },
      {
        name: 'Retainer',
        price: '12.000.000đ',
        period: '/tháng',
        features: ['Landing iteration', 'A/B section', 'Priority slot'],
        highlighted: false,
      },
    ],
    formHeadline: 'Gửi brief — sau khi xem work',
    formSub: 'Ngành · số page · deadline — phản hồi 48h kèm 2 case tương tự.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Cần private deck ngành bạn?',
    ctaSub: 'NDA OK — share URL và metric chi tiết on request.',
    ctaLabel: 'Yêu cầu case riêng →',
  },

  [WEBSITE_GOLD_ARCHITECTURE_IDS['package-first']]: {
    hero: {
      headline: 'Chọn gói web — giá công khai, scope locked, brief một lần',
      subheadline:
        'Package-first landing: so sánh Landing / Corporate / Custom ngay trên fold. Biết đầu tư trước khi book call.',
      ctaLabel: 'Chọn gói & gửi brief',
      trustPoints: ['Giá cố định scope', 'Không phí ẩn', 'CMS training included'],
    },
    pricingHeadline: 'Gói website — chọn và bắt đầu',
    pricing: [
      {
        name: 'Landing',
        price: '15.000.000đ',
        features: ['1 page Next.js', 'Form + CRM hook', 'SEO cơ bản', '2 design revision'],
        highlighted: false,
      },
      {
        name: 'Corporate',
        price: '39.000.000đ',
        features: ['5–8 pages', 'Headless CMS', 'Design system', '30 ngày bug-fix'],
        highlighted: true,
      },
      {
        name: 'Custom',
        price: 'Liên hệ',
        features: ['E-commerce', 'Multi-locale', 'Dedicated dev lead'],
        highlighted: false,
      },
    ],
    benefitsHeadline: 'Mỗi gói đều gồm',
    benefits: [
      { title: 'Timeline milestone', description: 'Brief tuần 1 · design sign-off tuần 2–3 · staging tuần 4–5 · launch theo scope.' },
      { title: 'SEO-ready launch', description: 'Meta, schema, sitemap, redirect map — index-ready ngày go-live.' },
      { title: 'Handoff đầy đủ', description: 'Repo, Figma, CMS account, video training — team tự vận hành sau bàn giao.' },
    ],
    faq: [
      {
        question: 'Upgrade gói giữa project?',
        answer: 'Được — phần chênh lệch scope tính change order rõ, không reset timeline từ zero.',
      },
      {
        question: 'Revision design giới hạn?',
        answer: 'Landing 2 round · Corporate 3 round trên key pages — thêm round = add-on theo ngày design.',
      },
      {
        question: 'Ai sở hữu source?',
        answer: 'Client owns repo và asset cuối project — agency giữ backup 90 ngày theo hợp đồng.',
      },
      {
        question: 'Thanh toán thế nào?',
        answer: '50% kickoff · 30% staging approve · 20% go-live — milestone gắn deliverable cụ thể.',
      },
    ],
    formHeadline: 'Chọn gói — gửi brief quote',
    formSub: 'Tick gói · mô tả brand · deadline — confirm quote trong 48h.',
    formSubmit: 'Xác nhận gói & gửi brief',
    ctaHeadline: 'Chưa chắc gói nào?',
    ctaSub: 'Corporate phù hợp 80% SME — hoặc gửi brief Custom.',
    ctaLabel: 'So sánh gói →',
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
  src: WebsiteGoldDirectionCopy['pricing'],
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

export function applyWebsiteGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveWebsiteGoldStandard(architectureId);
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
            id: `website_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết bàn giao', body: copy.guarantee }
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

export function websiteGoldLabel(gold: WebsiteGoldStandard): string {
  const labels: Record<WebsiteGoldStandard, string> = {
    'build-quote': 'Studio Build Quote',
    'portfolio-trust': 'Portfolio Trust',
    'package-first': 'Package Pricing First',
  };
  return labels[gold];
}
