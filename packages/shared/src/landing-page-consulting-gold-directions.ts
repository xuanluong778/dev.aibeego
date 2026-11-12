/**
 * Consulting gold-standard copy — audit CTA / trust credentials / retainer pricing.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  CONSULTING_GOLD_ARCHITECTURE_IDS,
  type ConsultingGoldStandard,
  resolveConsultingGoldStandard,
} from './landing-page-consulting-gold-system';

export type ConsultingGoldDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  speakerHeadline?: string;
  speaker?: Array<{ title: string; role: string; description: string }>;
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

const DIRECTIONS: Record<string, ConsultingGoldDirectionCopy> = {
  [CONSULTING_GOLD_ARCHITECTURE_IDS['audit-cta']]: {
    hero: {
      headline: 'Strategic audit B2B — chẩn đoán vấn đề, roadmap 90 ngày có KPI',
      subheadline:
        'Workshop diagnostic 2 tuần: phỏng vấn stakeholder, benchmark ngành, ưu tiên initiative theo impact và effort. Không slide deck 80 trang.',
      body: 'Dành cho CEO, COO và board cần quyết định đầu tư dựa trên dữ liệu — không cảm tính.',
      ctaLabel: 'Đặt discovery call',
      trustPoints: [
        'Partner 12+ năm · FMCG & B2B',
        'Deliverable board-ready',
        'NDA trước khi trao đổi sâu',
      ],
    },
    featuresHeadline: 'Vấn đề doanh nghiệp thường gặp',
    features: [
      {
        title: 'Growth chậm dù spend marketing tăng',
        description: 'CAC leo, pipeline không đều — thiếu visibility funnel và ownership rõ.',
      },
      {
        title: 'Ops không scale theo headcount',
        description: 'Quy trình thủ công, silo giữa sales và delivery — margin bị ăn mòn.',
      },
      {
        title: 'Chiến lược trên giấy, triển khai lệch',
        description: 'OKR không cascade, initiative trùng lặp — không có decision log.',
      },
    ],
    processHeadline: 'Quy trình engagement audit',
    process: [
      {
        title: 'Discovery & NDA',
        description: 'Problem statement, stakeholder map, data access — 3 ngày làm việc.',
      },
      {
        title: 'Diagnostic workshop',
        description: 'Phỏng vấn C-level, review KPI, benchmark 5–8 competitor.',
      },
      {
        title: 'Findings & prioritization',
        description: 'Impact/effort matrix, quick wins vs structural fixes — present board.',
      },
      {
        title: 'Roadmap 90 ngày',
        description: 'Initiative owner, metric, milestone — optional retainer triển khai.',
      },
    ],
    testimonialsHeadline: 'Client outcomes',
    testimonials: [
      {
        quote:
          'Audit 2 tuần giúp board chốt 3 initiative thay vì 12 — tiết kiệm 6 tháng tranh luận nội bộ.',
        author: 'Trần H.',
        role: 'CEO · Manufacturing · 800 nhân sự',
      },
      {
        quote:
          'Roadmap có KPI baseline và owner rõ — PMO nội bộ onboard nhanh hơn dự kiến.',
        author: 'Lan M.',
        role: 'COO · B2B SaaS · Series B',
      },
    ],
    formHeadline: 'Đặt discovery call — review fit audit',
    formSub: '30 phút — problem statement, timeline, ballpark phí. Không sales ép.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Cần chẩn đoán trước khi đầu tư lớn?',
    ctaSub: 'Discovery call miễn phí — slot partner còn 4/tuần.',
    ctaLabel: 'Đặt discovery call',
  },

  [CONSULTING_GOLD_ARCHITECTURE_IDS['trust-credentials']]: {
    hero: {
      headline: 'Tư vấn chiến lược — credentials, case KPI và cam kết scope rõ',
      subheadline:
        'Trust-first: partner profile, chứng chỉ, case study có metric trước khi book call. Phù hợp buyer cần social proof cấp board.',
      ctaLabel: 'Xem credentials & case',
      trustPoints: [
        'Ex-McKinsey · BCG alumni network',
        '18+ engagement B2B',
        'Reference call on request',
      ],
    },
    guarantee:
      'Cam kết: case study từ engagement thật · metric verified client · scope fixed trước ký · NDA chuẩn · không phí ẩn giữa phase.',
    speakerHeadline: 'Lead partner & credentials',
    speaker: [
      {
        title: 'Dr. Nguyễn Minh Quân',
        role: 'Managing Partner · Strategy & Ops · 15 năm',
        description:
          'MBA INSEAD · ex-McKinsey · 40+ engagement manufacturing, retail, fintech. Board advisor 3 scale-up Series B/C.',
      },
      {
        title: 'Lê Thu Hà',
        role: 'Partner · Digital Transformation · 12 năm',
        description:
          'CPA · Lean Six Sigma Black Belt · lead 12 ERP/CRM transformation · avg ROI payback 14 tháng.',
      },
    ],
    benefitsHeadline: 'Practice areas',
    benefits: [
      {
        title: 'Corporate strategy',
        description: 'Market entry, portfolio, M&A readiness — deck board-level.',
      },
      {
        title: 'Operating model',
        description: 'Org design, process, KPI cascade — triển khai cùng PMO optional.',
      },
      {
        title: 'Digital & data',
        description: 'Roadmap tech, data governance, change management — không bán software.',
      },
    ],
    testimonialsHeadline: 'Executive references',
    testimonials: [
      {
        quote:
          'Credentials và case ngành FMCG giúp tôi convince board trong 1 meeting — không cần RFP 3 tháng.',
        author: 'Phạm K.',
        role: 'CEO · FMCG · 1.200 nhân sự',
      },
      {
        quote:
          'Reference call với client cũ — transparency hiếm gặp ở firm tư vấn lớn.',
        author: 'David W.',
        role: 'CFO · Logistics · Regional HQ',
      },
      {
        quote:
          'Guarantee scope fixed — không change order giữa phase diagnostic.',
        author: 'Hương T.',
        role: 'CHRO · Retail group',
      },
    ],
    formHeadline: 'Book discovery — sau khi review credentials',
    formSub: '15 phút — fit ngành, engagement model, timeline.',
    formSubmit: 'Giữ slot partner call',
    ctaHeadline: 'Muốn case study ngành bạn?',
    ctaSub: 'Gửi brief ngắn — share 2 case tương tự trong 48h làm việc.',
    ctaLabel: 'Yêu cầu case tương tự',
  },

  [CONSULTING_GOLD_ARCHITECTURE_IDS['retainer-pricing']]: {
    hero: {
      headline: 'Retainer tư vấn B2B — gói rõ, deliverable cố định, cancel 30 ngày',
      subheadline:
        'Diagnostic, embedded advisory hoặc PMO support — pricing công khai, không surprise invoice. So sánh gói trước discovery call.',
      ctaLabel: 'Nhận báo giá chi tiết',
      trustPoints: ['Scope fixed monthly', 'Cancel 30 ngày notice', 'Partner time guaranteed'],
    },
    pricingHeadline: 'Gói retainer & project',
    pricing: [
      {
        name: 'Diagnostic',
        price: '48.000.000đ',
        period: '2 tuần',
        features: ['Workshop C-level', 'Benchmark report', 'Roadmap 90 ngày'],
        highlighted: false,
      },
      {
        name: 'Advisory retainer',
        price: '58.000.000đ',
        period: '/tháng',
        features: ['2 ngày partner/tháng', 'Monthly QBR', 'Slack async'],
        highlighted: true,
      },
      {
        name: 'Embedded PMO',
        price: 'Liên hệ',
        features: ['Dedicated squad', 'Implementation', 'Custom SLA'],
        highlighted: false,
      },
    ],
    featuresHeadline: 'Mỗi gói bao gồm',
    features: [
      {
        title: 'Partner access',
        description: 'Senior consultant lead — không delegate xuống analyst từ tuần 2.',
      },
      {
        title: 'Deliverable cố định',
        description: 'SOW 1 trang: output, timeline, acceptance criteria — không scope creep.',
      },
      {
        title: 'Reporting executive',
        description: 'Monthly deck: KPI vs plan, risk, decision needed — 30 phút QBR.',
      },
    ],
    faq: [
      {
        question: 'Retainer khác project-based thế nào?',
        answer:
          'Retainer = capacity cố định partner/tháng + QBR. Project = fixed scope deliverable (diagnostic, roadmap) — kết thúc khi bàn giao.',
      },
      {
        question: 'Ai sở hữu deliverable?',
        answer: 'Client owns final report, deck, playbook — source file handoff cuối engagement.',
      },
      {
        question: 'Cancel policy?',
        answer: '30 ngày notice — hoàn tất deliverable tháng hiện tại, không penalty.',
      },
      {
        question: 'Cam kết KPI?',
        answer:
          'Cam kết process, deliverable và reporting — outcome phụ thuộc execution nội bộ và market condition.',
      },
    ],
    formHeadline: 'Nhận proposal retainer',
    formSub: 'Chọn gói quan tâm — quote chi tiết trong 48h làm việc.',
    formSubmit: 'Gửi yêu cầu báo giá',
    ctaHeadline: 'Cần custom scope multi-entity?',
    ctaSub: 'Holding, regional rollout — talk managing partner.',
    ctaLabel: 'Liên hệ partner lead',
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
  src: ConsultingGoldDirectionCopy['pricing'],
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

export function applyConsultingGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveConsultingGoldStandard(architectureId);
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
      case 'Speaker': {
        const items = copy.speaker;
        if (!items?.length) {
          return { ...block, headline: copy.speakerHeadline || block.headline };
        }
        return {
          ...block,
          headline: copy.speakerHeadline || block.headline,
          items: block.items.map((item, i) => ({
            ...item,
            title: items[i]?.title ?? item.title,
            role: items[i]?.role ?? item.role,
            description: items[i]?.description ?? item.description,
          })),
        };
      }
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
            id: `consulting_gold_faq_${i + 1}`,
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

export function consultingGoldLabel(gold: ConsultingGoldStandard): string {
  const labels: Record<ConsultingGoldStandard, string> = {
    'audit-cta': 'Audit & Discovery CTA',
    'trust-credentials': 'Trust & Credentials',
    'retainer-pricing': 'Retainer Pricing',
  };
  return labels[gold];
}
