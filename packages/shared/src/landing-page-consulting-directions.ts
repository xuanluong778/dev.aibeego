/**
 * Consulting direction copy — 7 non-gold premium architectures.
 * Data-driven; keyed by architectureId, no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import type { ConsultingGoldDirectionCopy } from './landing-page-consulting-gold-directions';
import {
  CONSULTING_DIRECTION_ARCHITECTURE_IDS,
  resolveConsultingDirectionStandard,
} from './landing-page-consulting-gold-system';

const DIRECTIONS: Record<string, ConsultingGoldDirectionCopy> = {
  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['engagement-process']]: {
    hero: {
      headline: 'Engagement model rõ — từ diagnostic đến embedded advisory',
      subheadline:
        'Process-first: timeline từng phase, deliverable cụ thể, decision gate trước khi scale scope. Không kickoff mơ hồ 3 tháng.',
      ctaLabel: 'Xem engagement playbook',
      trustPoints: ['Phase gate rõ', 'SOW 1 trang/phase', 'Partner sign-off'],
    },
    processHeadline: 'Engagement timeline — 4 phase',
    process: [
      {
        title: 'Phase 0 — Scoping',
        description: 'NDA, problem statement, data request, stakeholder map — 1 tuần.',
      },
      {
        title: 'Phase 1 — Diagnostic',
        description: 'Workshop, interviews, benchmark — findings deck interim.',
      },
      {
        title: 'Phase 2 — Design',
        description: 'Roadmap, business case, org/process design — board presentation.',
      },
      {
        title: 'Phase 3 — Implement support',
        description: 'Embedded advisory hoặc PMO — weekly steering, KPI tracking.',
      },
    ],
    benefitsHeadline: 'Lợi ích engagement có cấu trúc',
    benefits: [
      {
        title: 'Không scope creep',
        description: 'Change request = change order — phase gate trước khi mở scope mới.',
      },
      {
        title: 'Board-ready cadence',
        description: 'Monthly QBR + decision log — executive biết status không cần chase.',
      },
      {
        title: 'Knowledge transfer',
        description: 'Playbook, template, train-the-trainer — không phụ thuộc consultant vĩnh viễn.',
      },
    ],
    featuresHeadline: 'Deliverable mỗi phase',
    features: [
      {
        title: 'Diagnostic report',
        description: 'Findings, root cause, prioritized initiative — 15–25 trang executive summary.',
      },
      {
        title: 'Roadmap & business case',
        description: 'NPV, timeline, resource, risk — assumption explicit.',
      },
      {
        title: 'Implementation playbook',
        description: 'RACI, milestone, KPI dashboard template — handoff PMO nội bộ.',
      },
    ],
    formHeadline: 'Book discovery — walkthrough engagement model',
    formSub: '30 phút — phase fit, timeline, ballpark investment.',
    formSubmit: 'Đặt lịch discovery',
    ctaHeadline: 'Cần SOW mẫu theo ngành?',
    ctaSub: 'Gửi email — share redacted SOW template trong 24h.',
    ctaLabel: 'Yêu cầu SOW mẫu',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['case-gallery']]: {
    hero: {
      headline: 'Case study trước pitch — KPI thật, engagement thật, client thật',
      subheadline:
        'Gallery-first: transformation outcome, metric before/after, industry context. Brief sau khi đã thấy proof ngành mình.',
      body: 'Dành cho procurement và C-suite cần evidence trước RFP.',
      ctaLabel: 'Xem case ngành bạn',
      trustPoints: ['12+ case B2B', 'Metric verified', 'NDA reference call'],
    },
    galleryHeadline: 'Selected engagements & KPI outcomes',
    gallerySub: 'Manufacturing · retail · fintech · logistics — client ẩn danh khi NDA.',
    galleryItems: [
      {
        title: 'Ops transformation — manufacturing',
        description: 'OEE +18% · lead time −22% — 6 tháng embedded advisory.',
      },
      {
        title: 'Go-to-market — B2B SaaS',
        description: 'Pipeline +41% · win rate +12pt — sales ops redesign.',
      },
      {
        title: 'Cost optimization — retail group',
        description: 'SG&A −8% · không layoff — shared services model.',
      },
      {
        title: 'Digital roadmap — bank',
        description: 'Legacy migration phased — 3-year roadmap, phase 1 ship 9 tháng.',
      },
    ],
    testimonialsHeadline: 'Executive feedback',
    testimonials: [
      {
        quote:
          'Case KPI ngành logistics giúp shortlist từ 5 firm xuống 2 — tiết kiệm 6 tuần evaluation.',
        author: 'Nguyễn V.',
        role: 'CEO · Logistics · 600 nhân sự',
      },
      {
        quote:
          'Before/after metric trong gallery — board không hỏi lại “firm này làm gì được”.',
        author: 'Sarah L.',
        role: 'CFO · Regional FMCG',
      },
    ],
    processHeadline: 'Từ case review đến engagement',
    process: [
      { title: 'Review case', description: 'Chọn 2–3 case ngành tương tự — metric & scope.' },
      { title: 'Reference call', description: 'Optional — talk client cũ (NDA, 30 phút).' },
      { title: 'Discovery', description: 'Problem fit, timeline, team composition.' },
      { title: 'SOW & kickoff', description: 'Fixed scope phase 1 — start trong 2 tuần.' },
    ],
    formHeadline: 'Book discovery — sau khi xem case',
    formSub: '15 phút — fit ngành & KPI target.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Cần private case deck?',
    ctaSub: 'NDA OK — share full case pack on request.',
    ctaLabel: 'Yêu cầu case deck',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['thought-video']]: {
    hero: {
      headline: 'Thought leadership — insight từ partner trước khi book advisory',
      subheadline:
        'Video keynote + speaker profile: framework, industry POV, engagement philosophy. Giảm friction cho buyer research intent.',
      ctaLabel: 'Xem keynote & book call',
      trustPoints: ['Keynote 12 phút', 'Published frameworks', 'Speaker bureau rated'],
    },
    videoHeadline: 'Keynote: Strategy under uncertainty',
    videoSub: 'Framework 3 horizon — prioritization khi ngân sách bị cắt 20%.',
    speakerHeadline: 'Lead advisors',
    speaker: [
      {
        title: 'Dr. Nguyễn Minh Quân',
        role: 'Managing Partner · Strategy',
        description:
          'Keynote speaker Gartner Vietnam · author “Ops Excellence ASEAN” · 15 năm advisory C-level.',
      },
    ],
    benefitsHeadline: 'Frameworks & publications',
    benefits: [
      {
        title: '3 Horizon Prioritization',
        description: 'Quick win / structural / bet — allocate resource khi budget tight.',
      },
      {
        title: 'Operating Model Canvas',
        description: 'Org, process, tech, governance — diagnostic 1 trang.',
      },
      {
        title: 'Executive Decision Log',
        description: 'Template track assumption, decision, outcome — reuse mỗi QBR.',
      },
    ],
    faq: [
      {
        question: 'Video có thay discovery call không?',
        answer: 'Không — video giúp align POV. Discovery vẫn cần cho fit và scope cụ thể.',
      },
      {
        question: 'Có workshop theo framework không?',
        answer: 'Có — half-day executive workshop áp dụng 3 Horizon cho leadership team.',
      },
    ],
    formHeadline: 'Book discovery sau keynote',
    formSub: '15 phút — áp dụng framework vào context công ty bạn.',
    formSubmit: 'Giữ slot partner',
    ctaHeadline: 'Muốn mời speaker sự kiện?',
    ctaSub: 'Corporate event, board offsite — inquiry riêng.',
    ctaLabel: 'Inquiry speaking',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['faq-authority']]: {
    hero: {
      headline: 'Engagement FAQ — mọi câu hỏi procurement trả lời trước call',
      subheadline:
        'Authority-first: phí, timeline, IP, cancel, conflict of interest. Giảm friction cho buyer cần certainty trước RFP.',
      ctaLabel: 'Đọc FAQ & book call',
      trustPoints: ['Pricing transparent', 'Cancel 30 ngày', 'No software resale'],
    },
    featuresHeadline: 'Capability overview',
    features: [
      {
        title: 'Strategy & diagnostic',
        description: 'Market, ops, org — 2–8 tuần fixed scope.',
      },
      {
        title: 'Embedded advisory',
        description: 'Partner days/tháng — steering, QBR, exec coaching.',
      },
      {
        title: 'PMO & implementation',
        description: 'Squad dedicated — milestone, RAID log, vendor neutral.',
      },
    ],
    faq: [
      {
        question: 'Phí engagement tính thế nào?',
        answer:
          'Project = fixed fee theo SOW. Retainer = monthly capacity (partner days + support). Expense travel bill actual — không markup ẩn.',
      },
      {
        question: 'Timeline kickoff?',
        answer: '5–10 ngày làm việc sau ký — scoping workshop tuần 1.',
      },
      {
        question: 'Conflict of interest?',
        answer: 'Không advise 2 direct competitor cùng workstream — disclose relationship trước ký.',
      },
      {
        question: 'Ai sở hữu IP deliverable?',
        answer: 'Client owns final work product — firm giữ generic methodology, không client-specific data.',
      },
      {
        question: 'Cancel policy?',
        answer: '30 ngày notice retainer — project theo milestone đã ký, không refund phase hoàn thành.',
      },
      {
        question: 'Có bán software không?',
        answer: 'Không — vendor neutral. Recommend tech nhưng không commission.',
      },
    ],
    guarantee:
      'Cam kết minh bạch: fee schedule trước ký · expense policy published · weekly status bắt buộc · escalation path đến managing partner.',
    processHeadline: 'Sau FAQ — engagement flow',
    process: [
      { title: 'Discovery call', description: '15–30 phút — fit, không repeat FAQ.' },
      { title: 'Proposal & SOW', description: 'Scope, fee, timeline — 48–72h sau discovery.' },
      { title: 'Contract & NDA', description: 'MSA chuẩn — legal review OK.' },
      { title: 'Kickoff workshop', description: 'Stakeholder align — tuần 1.' },
    ],
    formHeadline: 'Book discovery — đã đọc FAQ',
    formSub: '15 phút — focus fit & timeline, không giải thích cơ bản.',
    formSubmit: 'Giữ slot call',
    ctaHeadline: 'Còn câu hỏi ngoài FAQ?',
    ctaSub: 'Email partner desk — trả lời trong giờ làm việc.',
    ctaLabel: 'Hỏi partner desk',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['practice-nav']]: {
    hero: {
      headline: 'Practice areas — chọn dịch vụ, xem pricing, book discovery',
      subheadline:
        'Nav rõ: Strategy · Operations · Digital · Change. Self-serve pricing comparison trước khi talk partner.',
      ctaLabel: 'Nhận báo giá',
      trustPoints: ['Pricing công khai', 'Scope rõ từng gói', 'No hidden fee'],
    },
    benefitsHeadline: 'Practice lines',
    benefits: [
      {
        title: 'Corporate strategy',
        description: 'Market entry, portfolio, growth — board-level advisory.',
      },
      {
        title: 'Operations excellence',
        description: 'Lean, supply chain, shared services — KPI operational.',
      },
      {
        title: 'Digital transformation',
        description: 'Roadmap, vendor selection, change — không bán license.',
      },
      {
        title: 'Organization & change',
        description: 'Org design, culture, leadership — M&A integration.',
      },
    ],
    featuresHeadline: 'Typical engagement types',
    features: [
      {
        title: 'Diagnostic sprint',
        description: '2–4 tuần — findings + roadmap.',
      },
      {
        title: 'Advisory retainer',
        description: 'Partner days/tháng — QBR, exec coaching.',
      },
      {
        title: 'Embedded PMO',
        description: 'Squad 3–6 tháng — implementation support.',
      },
    ],
    pricingHeadline: 'Compare engagement packages',
    pricing: [
      {
        name: 'Diagnostic',
        price: '45.000.000đ',
        period: 'từ · 2 tuần',
        features: ['Workshop', 'Report', 'Roadmap'],
        highlighted: false,
      },
      {
        name: 'Advisory',
        price: '55.000.000đ',
        period: '/tháng',
        features: ['Partner access', 'QBR', 'Async support'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['Multi-workstream', 'Dedicated squad', 'Custom SLA'],
        highlighted: false,
      },
    ],
    formHeadline: 'Nhận báo giá theo practice area',
    formSub: 'Chọn 1–2 practice — quote trong 48h làm việc.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Cần multi-practice engagement?',
    ctaSub: 'Holding, regional — talk managing partner.',
    ctaLabel: 'Liên hệ managing partner',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['early-brief']]: {
    hero: {
      headline: 'Gửi brief ngay — proposal engagement trong 48h',
      subheadline:
        'High-intent landing: form dưới hero, case teaser sau. Không scroll 8 section mới thấy cách liên hệ partner.',
      body: 'Mô tả problem statement ngắn — team review fit trước discovery dài.',
      ctaLabel: 'Cuộn xuống gửi brief',
      trustPoints: ['Phản hồi 48h', 'NDA sẵn sàng', 'Không spam'],
    },
    featuresHeadline: 'Practice areas (teaser)',
    features: [
      {
        title: 'Strategy & growth',
        description: 'Market, portfolio, M&A readiness.',
      },
      {
        title: 'Operations',
        description: 'Efficiency, supply chain, shared services.',
      },
      {
        title: 'Digital & change',
        description: 'Transformation roadmap, org design.',
      },
    ],
    processHeadline: 'Brief đến proposal',
    process: [
      { title: 'Submit brief', description: 'Form 3 phút — problem, industry, timeline, budget range.' },
      { title: 'Fit review', description: 'Partner desk 24h — pass hoặc redirect rõ.' },
      { title: 'Teaser proposal', description: 'Approach, ballpark, 2 case — 48h.' },
      { title: 'Discovery & SOW', description: 'Call optional — SOW 1 trang nếu proceed.' },
    ],
    testimonialsHeadline: 'Brief sớm — proposal nhanh',
    testimonials: [
      {
        quote:
          'Gửi brief thứ Sáu — thứ Hai có approach note và range. Board approve tuần sau.',
        author: 'COO',
        role: 'Industrial group · 400 nhân sự',
      },
      {
        quote:
          'Form ngắn, không bắt call 60 phút trước — đúng intent khi search advisory firm.',
        author: 'Strategy Director',
        role: 'Fintech · Series C',
      },
    ],
    formHeadline: 'Engagement brief — 3 phút',
    formSub: 'Problem statement · industry · timeline · budget range · NDA tick nếu cần.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Đã gửi brief?',
    ctaSub: 'Check email — xác nhận receipt trong vài phút.',
    ctaLabel: 'Gửi lại brief',
  },

  [CONSULTING_DIRECTION_ARCHITECTURE_IDS['minimal-consult']]: {
    hero: {
      headline: 'B2B advisory — gọn, partner-level, KPI-focused',
      subheadline: 'Diagnostic sprint & retainer. Brief ngắn — discovery 15 phút.',
      ctaLabel: 'Book discovery',
      trustPoints: ['Diagnostic 2 tuần', 'Retainer transparent', 'Partner-led'],
    },
    featuresHeadline: 'Core offer',
    features: [
      {
        title: 'Diagnostic sprint',
        description: 'Workshop + roadmap 90 ngày — scope fixed 2 tuần.',
      },
      {
        title: 'Advisory retainer',
        description: 'Partner days/tháng — QBR, exec coaching, async.',
      },
      {
        title: 'Reporting',
        description: 'Decision log + KPI dashboard — không vanity deck.',
      },
    ],
    formHeadline: 'Book 15 phút',
    formSub: 'Tên · email · công ty · problem 1 dòng.',
    formSubmit: 'Giữ slot',
    ctaHeadline: 'Slot partner tuần này',
    ctaSub: 'Form trên — hoặc bấm lại.',
    ctaLabel: 'Book discovery',
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
  src: ConsultingGoldDirectionCopy['pricing'] | undefined,
) {
  if (!plans?.length || !src?.length) return plans;
  return plans.map((p, i) => {
    const s = src[Math.min(i, src.length - 1)]!;
    return {
      ...p,
      name: s.name,
      price: s.price,
      period: s.period,
      features: s.features,
      highlighted: s.highlighted ?? p.highlighted,
    };
  });
}

export function applyConsultingDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveConsultingDirectionStandard(architectureId);
  if (!dir) return blocks;
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
          headline: copy.videoSub
            ? `${copy.videoHeadline || block.headline || ''} — ${copy.videoSub}`.replace(/^ — /, '')
            : copy.videoHeadline || block.headline,
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
          items: items.map((t, i) => ({
            ...(block.items[i] || block.items[0] || { id: `consulting_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `consulting_dir_tm_${architectureId}_${i + 1}`,
            quote: t.quote,
            author: t.author,
            role: t.role,
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
            id: `consulting_dir_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết advisory', body: copy.guarantee }
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

export function listConsultingDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
