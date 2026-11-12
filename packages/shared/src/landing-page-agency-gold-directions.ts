/**
 * Agency gold-standard copy — per architectureId (dark / cream / modern).
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  AGENCY_GOLD_ARCHITECTURE_IDS,
  type AgencyGoldStandard,
  resolveAgencyGoldStandard,
} from './landing-page-agency-gold-system';

export type AgencyGoldDirectionCopy = {
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

const DIRECTIONS: Record<string, AgencyGoldDirectionCopy> = {
  [AGENCY_GOLD_ARCHITECTURE_IDS['dark-direct']]: {
    hero: {
      headline: 'Agency growth partner — KPI rõ, creative chuẩn thương hiệu',
      subheadline:
        'Performance + brand trong một team. Sprint rõ scope, báo cáo minh bạch, không cam kết mơ hồ.',
      body: 'Dành cho founder & marketing lead cần đối tác triển khai thật — không chỉ pitch deck.',
      ctaLabel: 'Đặt discovery call',
      trustPoints: ['Báo cáo KPI hàng tuần', 'Creative + media một team', 'Sprint 2–4 tuần, scope rõ'],
    },
    benefitsHeadline: 'Vấn đề thường gặp khi thuê agency',
    benefits: [
      { title: 'Báo cáo mơ hồ', description: 'Spend tăng nhưng không biết điều gì thực sự drive kết quả.' },
      { title: 'Creative và media tách rời', description: 'Brief lệch, test chậm, learnings không được tái sử dụng.' },
      { title: 'Scope trôi sprint', description: 'Kickoff dài, deliverable không khớng timeline ban đầu.' },
    ],
    featuresHeadline: 'Giải pháp: growth sprint có cấu trúc',
    features: [
      { title: 'Audit & KPI map', description: 'Chốt metric, baseline và ưu tiên channel trong tuần 1.' },
      { title: 'Creative sản xuất nhanh', description: 'Concept → asset test trong cùng sprint, không chờ handoff.' },
      { title: 'Weekly growth review', description: 'Decision log + next test — biết vì sao scale hoặc dừng.' },
    ],
    galleryHeadline: 'Case study & visual proof',
    gallerySub: 'Before / after · chiến dịch thật · KPI đã public (ẩn danh khi cần)',
    galleryItems: [
      { title: 'SaaS lead gen', description: 'CPL −38% · MQL +2.1x — landing + paid sync.' },
      { title: 'D2C scale', description: 'ROAS 3.4x · creative refresh 2 tuần/lần.' },
      { title: 'B2B ABM', description: 'Pipeline +45% · LinkedIn + email nurture.' },
      { title: 'Brand relaunch', description: 'Awareness +60% · TVC + social cutdown.' },
    ],
    testimonialsHeadline: 'Client feedback',
    testimonials: [
      { quote: 'Sprint 4 tuần — KPI dashboard rõ, creative test nhanh hơn agency cũ.', author: 'Minh T.', role: 'Marketing Lead · SaaS B2B' },
      { quote: 'Retainer minh bạch: biết tuần nào làm gì, không surprise invoice.', author: 'Lan P.', role: 'Founder · D2C' },
    ],
    processHeadline: 'Quy trình 4 bước',
    process: [
      { title: 'Discovery', description: 'Brief, KPI, constraint ngân sách & brand.' },
      { title: 'Strategy sprint', description: 'Channel mix, creative angle, test plan.' },
      { title: 'Execute', description: 'Launch, optimize, báo cáo tuần.' },
      { title: 'Scale / handoff', description: 'Playbook, asset library, retainer hoặc chuyển giao.' },
    ],
    pricingHeadline: 'Gói đầu tư',
    pricing: [
      { name: 'Sprint 4 tuần', price: '45.000.000đ', features: ['Audit', '1 campaign', 'Report'], highlighted: false },
      { name: 'Retainer', price: '28.000.000đ', period: '/tháng', features: ['Always-on', 'Creative pool', 'Weekly sync'], highlighted: true },
      { name: 'Enterprise', price: 'Liên hệ', features: ['Multi-brand', 'Embedded team'], highlighted: false },
    ],
    faq: [
      { question: 'Timeline dự án?', answer: 'Sprint chuẩn 4 tuần; retainer kickoff trong 5 ngày làm việc.' },
      { question: 'Cam kết KPI?', answer: 'Cam kết process & reporting; KPI phụ thuộc baseline và ngân sách media.' },
    ],
    formHeadline: 'Đặt lịch discovery call',
    formSub: '15 phút — review fit, không sales ép.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Sẵn sàng sprint growth có KPI?',
    ctaSub: 'Discovery call miễn phí — slot có hạn mỗi tuần.',
    ctaLabel: 'Đặt discovery call →',
  },
  [AGENCY_GOLD_ARCHITECTURE_IDS['cream-editorial']]: {
    hero: {
      headline: 'Retainer linh hoạt — creative & performance trong một lộ trình',
      subheadline:
        'Editorial-grade storytelling + media có số liệu. Phù hợp brand cần vừa đẹp vừa đo được.',
      ctaLabel: 'Nhận proposal mẫu',
      trustPoints: ['Case study chi tiết', 'Process minh bạch', 'Báo giá rõ scope'],
    },
    videoHeadline: 'Showreel & pitch 90 giây',
    videoSub: 'Creative direction, tone of voice và kết quả campaign gần nhất.',
    benefitsHeadline: 'Bạn đang mất doanh thu nếu…',
    benefits: [
      { title: 'Brand đẹp nhưng không convert', description: 'Visual cao cấp nhưng thiếu narrative và CTA rõ.' },
      { title: 'Ads chạy mà creative cạn', description: 'Fatigue nhanh vì không có pipeline sản xuất nội dung.' },
      { title: 'Agency trả slide, không trả work', description: 'Kickoff nhiều, deliverable ít, learning không tích lũy.' },
    ],
    featuresHeadline: 'Lộ trình retainer 90 ngày',
    features: [
      { title: 'Tháng 1 — Brand & message', description: 'Positioning, key visual, content pillars.' },
      { title: 'Tháng 2 — Campaign sản xuất', description: 'Concept, shoot/edit, launch test.' },
      { title: 'Tháng 3 — Scale & playbook', description: 'Winning angle, template, handoff hoặc retainer tiếp.' },
    ],
    processHeadline: 'Quy trình editorial',
    process: [
      { title: 'Immersion', description: 'Workshop brand, competitor, audience.' },
      { title: 'Creative platform', description: 'Big idea + visual system + copy tone.' },
      { title: 'Production', description: 'Asset, landing, media setup.' },
      { title: 'Review & iterate', description: 'Data + qualitative feedback mỗi sprint.' },
    ],
    galleryHeadline: 'Before / after & case study',
    gallerySub: 'Không template — work thật, metric thật',
    galleryItems: [
      { title: 'Brand refresh — FMCG', description: 'Key visual, packaging, social system — launch Q3.' },
      { title: 'Performance — retail', description: 'ROAS 2.9x · UGC + studio mix — 8 tuần sprint.' },
      { title: 'Editorial campaign', description: 'TVC 30s + 12 social cuts — brand lift +18%.' },
      { title: 'Web + funnel', description: 'Landing + email flow — conversion +34%.' },
    ],
    testimonialsHeadline: 'Lời khách hàng',
    testimonials: [
      { quote: 'Brand craft và performance cùng một team — không phải chọn một trong hai.', author: 'Hương N.', role: 'Brand Director · FMCG' },
      { quote: 'Retainer 90 ngày giúp chúng tôi có playbook creative tái sử dụng được.', author: 'Khoa V.', role: 'CMO · Retail' },
    ],
    pricingHeadline: 'Gói retainer',
    pricing: [
      { name: 'Starter', price: '18.000.000đ', period: '/tháng', features: ['1 channel', '4 creative/tháng'], highlighted: false },
      { name: 'Growth', price: '32.000.000đ', period: '/tháng', features: ['Multi-channel', '8 creative', 'Weekly call'], highlighted: true },
      { name: 'Partner', price: 'Liên hệ', features: ['Embedded', 'Unlimited sprint'], highlighted: false },
    ],
    faq: [
      { question: 'Khác gì agency performance thuần?', answer: 'Chúng tôi giữ brand craft song song với KPI — không hy sinh visual.' },
      { question: 'Có làm one-off project?', answer: 'Có sprint 4–6 tuần; retainer được ưu tiên slot sản xuất.' },
    ],
    guarantee: 'Không hài lòng sau sprint 1 — làm lại creative direction một lần (trong scope).',
    formHeadline: 'Yêu cầu proposal',
    formSub: 'Phản hồi trong 24 giờ làm việc.',
    formSubmit: 'Gửi yêu cầu',
    ctaHeadline: 'Xem case tương tự ngành bạn',
    ctaLabel: 'Nhận proposal →',
  },
  [AGENCY_GOLD_ARCHITECTURE_IDS['modern-saas']]: {
    hero: {
      headline: 'Modern growth studio — website, funnel & creative trong một stack',
      subheadline:
        'Thiết kế SaaS-grade, landing convert, và campaign performance. Một partner, một timeline.',
      ctaLabel: 'Book demo',
      trustPoints: ['Design system ready', 'Web + ads + CRM', 'Ship trong 3 tuần'],
    },
    featuresHeadline: 'Capability stack',
    features: [
      { title: 'Product marketing site', description: 'Landing, pricing, docs-style pages — responsive & fast.' },
      { title: 'Funnel & CRM hook', description: 'Form, automation, lead routing tích hợp sẵn.' },
      { title: 'Paid + organic creative', description: 'Asset kit cho Meta, Google, LinkedIn từ cùng design system.' },
    ],
    galleryHeadline: 'Shipped work',
    gallerySub: 'Screenshots & live URLs (ẩn danh khi cần)',
    galleryItems: [
      { title: 'Marketing site — SaaS', description: 'Next.js, design system, 8 pages — ship 21 ngày.' },
      { title: 'Funnel + CRM', description: 'Landing, form, HubSpot routing — live staging URL.' },
      { title: 'Ads kit — B2B', description: '15 variants Meta + LinkedIn — design system aligned.' },
      { title: 'Dashboard UI', description: 'Product marketing screens — responsive specs.' },
    ],
    testimonialsHeadline: 'Trusted by teams',
    testimonials: [
      { quote: 'Site + funnel + ads kit trong 3 tuần — ship đúng spec design system.', author: 'Alex R.', role: 'Head of Growth · SaaS' },
      { quote: 'Handoff sạch: component map, staging, analytics — team dev onboard nhanh.', author: 'Trang L.', role: 'Product · Startup' },
    ],
    processHeadline: 'Delivery process',
    process: [
      { title: 'Scope & wire', description: 'IA, copy outline, component map.' },
      { title: 'Design system', description: 'Tokens, components, responsive specs.' },
      { title: 'Build & launch', description: 'Staging, QA, go-live + handoff.' },
    ],
    pricingHeadline: 'Plans',
    pricing: [
      { name: 'Launch', price: '35.000.000đ', features: ['1 landing', 'Form + CRM'], highlighted: false },
      { name: 'Growth', price: '65.000.000đ', features: ['Site 5–8 pages', 'Ads kit', '30 ngày support'], highlighted: true },
      { name: 'Scale', price: 'Liên hệ', features: ['Retainer', 'Dedicated squad'], highlighted: false },
    ],
    faq: [
      { question: 'Tech stack?', answer: 'Next.js / headless CMS / analytics theo stack hiện tại của bạn.' },
      { question: 'Bảo hành?', answer: '30 ngày bug-fix sau go-live (Growth trở lên).' },
    ],
    formHeadline: 'Book a demo',
    formSub: '30 phút — walkthrough process & timeline.',
    formSubmit: 'Schedule demo',
    ctaHeadline: 'Ready to ship?',
    ctaSub: 'Slot demo tuần này còn 3.',
    ctaLabel: 'Book demo →',
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
  src: AgencyGoldDirectionCopy['pricing'],
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

export function applyAgencyGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveAgencyGoldStandard(architectureId);
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
            id: `gold_faq_${i + 1}`,
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

export function agencyGoldLabel(gold: AgencyGoldStandard): string {
  const labels: Record<AgencyGoldStandard, string> = {
    'dark-direct': 'Dark Direct-Response',
    'cream-editorial': 'Cream Editorial Sales',
    'modern-saas': 'Modern Agency / SaaS',
  };
  return labels[gold];
}
