/**
 * SaaS gold-standard copy — product-led / enterprise / ai-modern.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import {
  SAAS_GOLD_ARCHITECTURE_IDS,
  type SaasGoldStandard,
  resolveSaasGoldStandard,
} from './landing-page-saas-gold-system';

export type SaasGoldDirectionCopy = {
  hero: {
    headline: string;
    subheadline: string;
    body?: string;
    ctaLabel: string;
    trustPoints?: string[];
  };
  videoHeadline?: string;
  videoSub?: string;
  featuresHeadline?: string;
  features?: Array<{ title: string; description: string }>;
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  galleryHeadline?: string;
  gallerySub?: string;
  galleryItems?: Array<{ title: string; description: string }>;
  testimonialsHeadline?: string;
  testimonials?: Array<{ quote: string; author: string; role: string; metric?: string }>;
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
};

const DIRECTIONS: Record<string, SaasGoldDirectionCopy> = {
  [SAAS_GOLD_ARCHITECTURE_IDS['product-led']]: {
    hero: {
      headline: 'All-in-one workspace — setup 10 phút, thấy dashboard ngay',
      subheadline:
        'Pipeline, tasks và reporting trong một UI sạch. Trial 14 ngày — không cần thẻ, export data khi cần.',
      body: 'Dành cho team 5–50 người cần thay spreadsheet + 3 tool rời.',
      ctaLabel: 'Bắt đầu trial miễn phí',
      trustPoints: ['Trial 14 ngày · no credit card', 'SOC 2 Type II', 'Import CSV / API'],
    },
    galleryHeadline: 'Product UI — dashboard & workflow',
    gallerySub: 'Screens thật từ staging — không mockup stock.',
    galleryItems: [
      { title: 'Dashboard overview', description: 'KPI pipeline, tasks due, team load — một màn hình.' },
      { title: 'Workflow builder', description: 'Kéo thả stages, assign owner, SLA tự động.' },
      { title: 'Analytics & reports', description: 'Funnel, cohort, export CSV/PDF — filter theo team.' },
      { title: 'Integrations hub', description: 'Slack, Google Workspace, Zapier — connect trong 2 phút.' },
    ],
    featuresHeadline: 'Built for product-led growth',
    features: [
      { title: 'Onboarding checklist', description: 'Template theo use case — team active trong ngày 1.' },
      { title: 'Collaboration realtime', description: 'Comments, @mention, activity feed — không email thread.' },
      { title: 'Admin & permissions', description: 'Role-based access, audit log, SSO (Business plan).' },
    ],
    processHeadline: 'Trial → value trong 3 bước',
    process: [
      { title: 'Sign up & import', description: 'Email công ty hoặc Google — import CSV contacts/deals.' },
      { title: 'Activate workflow', description: 'Chọn template pipeline — invite team ≤ 5 người free.' },
      { title: 'Measure & scale', description: 'Dashboard adoption — upgrade khi cần SSO/advanced.' },
    ],
    testimonialsHeadline: 'Teams đã chuyển sang',
    testimonials: [
      {
        quote: 'Setup xong trong buổi chiều — team bỏ spreadsheet tuần sau.',
        author: 'Minh T.',
        role: 'Ops Lead · B2B SaaS',
        metric: '−4 tool',
      },
      {
        quote: 'Trial không bắt thẻ — thử thật trước khi xin budget.',
        author: 'Lan P.',
        role: 'Founder · Agency 12 người',
        metric: '14 ngày',
      },
    ],
    pricingHeadline: 'Pricing minh bạch',
    pricing: [
      {
        name: 'Starter',
        price: 'Miễn phí',
        period: '≤ 3 users',
        features: ['Pipeline cơ bản', '1 workspace', 'Email support'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '890.000đ',
        period: '/user/tháng',
        features: ['Automation', 'Integrations', 'Analytics'],
        highlighted: true,
      },
      {
        name: 'Business',
        price: 'Liên hệ',
        features: ['SSO', 'Audit log', 'Dedicated CSM'],
        highlighted: false,
      },
    ],
    faq: [
      { question: 'Trial có cần thẻ không?', answer: 'Không. Sau 14 ngày bạn chọn upgrade hoặc export data.' },
      { question: 'Import từ tool cũ?', answer: 'CSV, HubSpot/Pipedrive migration guide — support trong trial.' },
      { question: 'Data ở đâu?', answer: 'AWS ap-southeast-1 · encrypt at rest · daily backup.' },
    ],
    formHeadline: 'Bắt đầu trial 14 ngày',
    formSub: 'Work email — không spam, không auto-charge.',
    formSubmit: 'Tạo workspace trial',
    ctaHeadline: 'Sẵn sàng thấy dashboard thật?',
    ctaSub: 'Trial miễn phí — setup 10 phút.',
    ctaLabel: 'Bắt đầu trial →',
  },

  [SAAS_GOLD_ARCHITECTURE_IDS.enterprise]: {
    hero: {
      headline: 'Enterprise platform — security, compliance & scale cho tổ chức lớn',
      subheadline:
        'SOC 2 · GDPR-ready · SSO/SAML · dedicated success. Book demo với solutions engineer — không sales ép.',
      ctaLabel: 'Book demo enterprise',
      trustPoints: ['SOC 2 Type II · ISO 27001', '99.9% SLA', 'Dedicated CSM'],
    },
    testimonialsHeadline: 'Trusted by security-conscious teams',
    testimonials: [
      {
        quote: 'Security review pass trong 2 tuần — documentation đầy đủ, không surprise.',
        author: 'Director IT',
        role: 'Fintech · 800+ employees',
        metric: 'SOC 2',
      },
      {
        quote: 'Rollout 12 phòng ban — SSO + SCIM giảm ticket IT 60%.',
        author: 'Head of Ops',
        role: 'Enterprise retail',
        metric: '−60% tickets',
      },
    ],
    featuresHeadline: 'Enterprise-grade capabilities',
    features: [
      { title: 'Security & compliance', description: 'SSO/SAML, SCIM, audit log, data residency options.' },
      { title: 'Governance', description: 'Custom roles, approval flows, retention policies.' },
      { title: 'Scale & SLA', description: 'Dedicated infra option, 99.9% uptime SLA, priority support.' },
    ],
    guarantee:
      'Cam kết enterprise: security questionnaire support · DPA/BAA template · penetration test summary hàng năm · không lock-in export API.',
    processHeadline: 'Enterprise rollout 4 phase',
    process: [
      { title: 'Discovery call', description: 'Use case, compliance requirements, integration map.' },
      { title: 'POC / pilot', description: '1 business unit, 4–6 tuần, success criteria rõ.' },
      { title: 'Security & legal', description: 'Review SOC report, DPA, custom terms nếu cần.' },
      { title: 'Scale & enablement', description: 'CSM, training admin, playbooks adoption.' },
    ],
    pricingHeadline: 'Enterprise plans',
    pricing: [
      {
        name: 'Business',
        price: 'Liên hệ',
        features: ['SSO', 'Advanced admin', 'Priority support'],
        highlighted: false,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'annual',
        features: ['Dedicated CSM', 'Custom SLA', 'Data residency'],
        highlighted: true,
      },
      {
        name: 'Enterprise+',
        price: 'Custom',
        features: ['Private cloud option', '24/7 phone', 'Custom integrations'],
        highlighted: false,
      },
    ],
    faq: [
      { question: 'Có hỗ trợ security questionnaire?', answer: 'Có — gửi SIG/CAIQ, team trả lời trong 5 ngày làm việc.' },
      { question: 'Data residency?', answer: 'US/EU/APAC options trên Enterprise — discuss trong demo.' },
      { question: 'Minimum seats?', answer: 'Enterprise thường từ 50 seats — POC có thể nhỏ hơn.' },
    ],
    formHeadline: 'Book demo enterprise',
    formSub: 'Work email + company size — solutions engineer phản hồi trong 1 ngày làm việc.',
    formSubmit: 'Yêu cầu demo',
    ctaHeadline: 'Cần trao đổi security & rollout?',
    ctaSub: '30 phút với solutions engineer — không ép mua trong call.',
    ctaLabel: 'Book demo →',
  },

  [SAAS_GOLD_ARCHITECTURE_IDS['ai-modern']]: {
    hero: {
      headline: 'AI workflow platform — automate ops với agent có kiểm soát',
      subheadline:
        'Build flows bằng natural language, review trước khi deploy. Human-in-the-loop — không black box.',
      ctaLabel: 'Xem demo AI workflow',
      trustPoints: ['Model agnostic', 'Audit trail mọi step', 'On-prem option'],
    },
    videoHeadline: 'Demo 90 giây — từ prompt → workflow chạy',
    videoSub: 'Agent suggestions, approval gate, log trace.',
    featuresHeadline: 'AI-native building blocks',
    features: [
      { title: 'Prompt → workflow', description: 'Mô tả process — AI draft nodes, bạn edit trước publish.' },
      { title: 'RAG & knowledge', description: 'Connect docs, tickets, CRM — context có citation.' },
      { title: 'Guardrails', description: 'PII redaction, approval steps, rate limits, fallback human.' },
    ],
    galleryHeadline: 'Workflow & AI canvas',
    gallerySub: 'UI thật — dark mode, node graph, trace panel.',
    galleryItems: [
      { title: 'AI canvas', description: 'Node graph — trigger, LLM, action, human review.' },
      { title: 'Trace & observability', description: 'Token usage, latency, step log — debug nhanh.' },
      { title: 'Knowledge connectors', description: 'Notion, Drive, Slack — sync có permission scope.' },
      { title: 'Deploy & versions', description: 'Staging → prod, rollback 1-click, changelog.' },
    ],
    processHeadline: 'Ship AI workflow an toàn',
    process: [
      { title: 'Design', description: 'Prompt hoặc template — AI suggest flow.' },
      { title: 'Review', description: 'Test sandbox, red-team prompts, approval rules.' },
      { title: 'Deploy', description: 'Gradual rollout, monitor drift, alert anomaly.' },
      { title: 'Iterate', description: 'Feedback loop, A/B prompts, cost dashboard.' },
    ],
    testimonialsHeadline: 'Teams building with AI ops',
    testimonials: [
      {
        quote: 'Giảm 70% ticket lặp — agent có approval, không lo hallucination deploy thẳng.',
        author: 'Tech Lead',
        role: 'Support SaaS · 200 agents',
      },
      {
        quote: 'Trace log giúp compliance chấp nhận workflow AI nội bộ.',
        author: 'Compliance Mgr',
        role: 'Insurtech',
      },
    ],
    pricingHeadline: 'Plans for AI teams',
    pricing: [
      {
        name: 'Pro',
        price: '1.490.000đ',
        period: '/tháng',
        features: ['5 workflows', '10K runs', 'Community support'],
        highlighted: false,
      },
      {
        name: 'Team',
        price: '4.900.000đ',
        period: '/tháng',
        features: ['Unlimited flows', 'RAG connectors', 'SSO'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['On-prem', 'Custom models', 'Dedicated SLA'],
        highlighted: false,
      },
    ],
    faq: [
      { question: 'Dùng model nào?', answer: 'OpenAI, Anthropic, Azure OpenAI, local — bạn chọn endpoint.' },
      { question: 'Data train model?', answer: 'Không — tenant isolation, không dùng customer data train public model.' },
      { question: 'On-prem?', answer: 'Enterprise — Kubernetes deploy, air-gapped option.' },
    ],
    formHeadline: 'Book demo AI workflow',
    formSub: 'Technical demo 45 phút — mang use case của bạn.',
    formSubmit: 'Đặt lịch demo',
    ctaHeadline: 'Sẵn sàng prototype workflow đầu tiên?',
    ctaSub: 'Demo live — không slide deck 40 trang.',
    ctaLabel: 'Xem demo AI →',
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
  next: SaasGoldDirectionCopy['pricing'] | undefined,
) {
  if (!plans?.length || !next?.length) return plans;
  return plans.map((p, i) => {
    const src = next[Math.min(i, next.length - 1)]!;
    return {
      ...p,
      name: src.name,
      price: src.price,
      period: src.period,
      features: src.features,
      highlighted: src.highlighted ?? p.highlighted,
    };
  });
}

export function applySaasGoldDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const gold = resolveSaasGoldStandard(architectureId);
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
          headline: copy.videoSub
            ? `${copy.videoHeadline || block.headline || ''} — ${copy.videoSub}`.replace(/^ — /, '')
            : copy.videoHeadline || block.headline,
        };
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline || block.headline,
          items: (patchItems(block.items, copy.features) || block.items) as typeof block.items,
        };
      case 'Benefits':
        return {
          ...block,
          headline: copy.benefitsHeadline || block.headline,
          items: (patchItems(block.items, copy.benefits) || block.items) as typeof block.items,
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
            ...(block.items[i] || block.items[0] || { id: `saas_gold_tm_${i + 1}` }),
            id: block.items[i]?.id || `saas_gold_tm_${i + 1}`,
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
            id: `saas_gold_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Enterprise trust', body: copy.guarantee }
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

export function saasGoldLabel(gold: SaasGoldStandard): string {
  const labels: Record<SaasGoldStandard, string> = {
    'product-led': 'Product-Led SaaS',
    enterprise: 'Enterprise SaaS',
    'ai-modern': 'AI Modern SaaS',
  };
  return labels[gold];
}
