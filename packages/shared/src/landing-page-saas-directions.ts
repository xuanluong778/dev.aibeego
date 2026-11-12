/**
 * SaaS direction copy — 7 non-gold premium architectures.
 * Data-driven; keyed by architectureId, no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import type { SaasGoldDirectionCopy } from './landing-page-saas-gold-directions';
import {
  SAAS_DIRECTION_ARCHITECTURE_IDS,
  resolveSaasDirectionStandard,
} from './landing-page-saas-gold-system';

const DIRECTIONS: Record<string, SaasGoldDirectionCopy> = {
  [SAAS_DIRECTION_ARCHITECTURE_IDS['trust-first']]: {
    hero: {
      headline: '4.8★ trên G2 — teams chọn trial trước khi mua',
      subheadline:
        'Logo khách hàng thật, review có metric, security badge rõ. Trial 14 ngày sau khi bạn thấy social proof — không ép signup sớm.',
      body: 'Dành cho buyer cần thấy bằng chứng trước khi import data vào workspace.',
      ctaLabel: 'Bắt đầu trial sau khi xem proof',
      trustPoints: ['4.8/5 G2 · 120+ reviews', 'SOC 2 Type II', 'Logo Fortune 500 (opt-in)'],
    },
    testimonialsHeadline: 'Trusted by security-conscious teams',
    testimonials: [
      {
        quote: 'Chúng tôi so sánh 4 tool — chọn vì review G2 và case KPI công khai.',
        author: 'Head of RevOps',
        role: 'B2B SaaS · 120 seats',
        metric: '4.8★ G2',
      },
      {
        quote: 'Security team pass questionnaire trong 10 ngày — docs đầy đủ trên trust center.',
        author: 'CISO',
        role: 'Fintech scale-up',
        metric: 'SOC 2',
      },
      {
        quote: 'Trial không thẻ — team pilot 3 tuần trước khi trình budget.',
        author: 'IT Manager',
        role: 'Logistics · 400 users',
        metric: '14 ngày',
      },
    ],
    galleryHeadline: 'Integration ecosystem — connect stack hiện tại',
    gallerySub: 'Slack, Salesforce, HubSpot, Jira, Google Workspace — OAuth trong 2 phút.',
    galleryItems: [
      { title: 'Slack & Teams', description: 'Notify workflow, slash commands, thread sync.' },
      { title: 'CRM sync', description: 'HubSpot, Salesforce bi-directional — field mapping UI.' },
      { title: 'Developer API', description: 'REST + webhooks, sandbox keys, OpenAPI spec.' },
      { title: 'SSO / SCIM', description: 'Okta, Azure AD — provision user tự động (Business+).' },
    ],
    featuresHeadline: 'Built for teams cần proof trước purchase',
    features: [
      { title: 'Trust center public', description: 'SOC report summary, subprocessors, status page link.' },
      { title: 'Review-backed onboarding', description: 'Playbook từ top G2 reviewers — time-to-value nhanh.' },
      { title: 'Data portability', description: 'Export CSV/API mọi lúc — không lock-in sau trial.' },
    ],
    guarantee:
      'Cam kết trial: không auto-charge · export data khi hết hạn · security questionnaire support trong trial Business.',
    pricingHeadline: 'Plans sau khi bạn thấy proof',
    pricing: [
      {
        name: 'Starter',
        price: 'Miễn phí',
        period: '≤ 5 users',
        features: ['Core workflow', '5 integrations', 'Community support'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '790.000đ',
        period: '/user/tháng',
        features: ['Unlimited integrations', 'Audit log', 'Priority support'],
        highlighted: true,
      },
      {
        name: 'Business',
        price: 'Liên hệ',
        features: ['SSO/SCIM', 'Trust center SLA', 'Dedicated CSM'],
        highlighted: false,
      },
    ],
    formHeadline: 'Bắt đầu trial — sau khi đã xem proof',
    formSub: 'Work email · không spam · không thẻ tín dụng.',
    formSubmit: 'Tạo workspace trial',
    ctaHeadline: 'Sẵn sàng thử với team nhỏ trước?',
    ctaSub: 'Pilot 5 users — upgrade khi thấy ROI.',
    ctaLabel: 'Start trial →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['workflow-story']]: {
    hero: {
      headline: 'Workflow automation — từ trigger → action trong 15 phút',
      subheadline:
        'Kéo thả nodes, test sandbox, deploy production. Không code — nhưng có webhook & API khi cần mở rộng.',
      ctaLabel: 'Xem demo workflow',
      trustPoints: ['No-code builder', 'Version history', 'Run log 30 ngày'],
    },
    processHeadline: 'Automation story — 4 giai đoạn',
    process: [
      { title: 'Map trigger', description: 'Form submit, webhook, schedule, CRM stage change.' },
      { title: 'Design flow', description: 'Branch, delay, human approval, Slack notify.' },
      { title: 'Test sandbox', description: 'Replay events, mock payloads — không đụng prod.' },
      { title: 'Deploy & monitor', description: 'Alert fail, retry policy, usage dashboard.' },
    ],
    videoHeadline: 'Demo 3 phút — build workflow end-to-end',
    videoSub: 'Trigger → filter → Slack + CRM update — không cắt ghép.',
    featuresHeadline: 'Automation primitives',
    features: [
      { title: 'Visual builder', description: 'Drag-drop nodes, inline test data, diff versions.' },
      { title: 'Human-in-the-loop', description: 'Approval step, assign owner, SLA timer.' },
      { title: 'Observability', description: 'Run trace, error grouping, replay failed runs.' },
    ],
    galleryHeadline: 'Workflow UI — builder & run history',
    gallerySub: 'Screens từ staging — node graph, run log, template library.',
    galleryItems: [
      { title: 'Flow canvas', description: 'Zoom, snap grid, template từ marketplace.' },
      { title: 'Run inspector', description: 'Step-by-step log, payload JSON, retry button.' },
      { title: 'Template gallery', description: 'Onboarding, lead routing, invoice sync — 1-click clone.' },
      { title: 'Integration nodes', description: 'Pre-built actions cho 40+ apps phổ biến.' },
    ],
    testimonialsHeadline: 'Ops teams đã automate',
    testimonials: [
      {
        quote: 'Giảm 12h/tuần copy-paste giữa CRM và Slack — build flow chiều thứ Sáu, live thứ Hai.',
        author: 'Ops Lead',
        role: 'Agency 40 người',
      },
      {
        quote: 'Sandbox cứu chúng tôi khỏi 2 lần push logic sai lên prod.',
        author: 'Engineering Mgr',
        role: 'SaaS B2B',
      },
    ],
    formHeadline: 'Book demo workflow',
    formSub: '30 phút — mang use case automation của bạn.',
    formSubmit: 'Đặt lịch demo',
    ctaHeadline: 'Muốn clone template sẵn có?',
    ctaSub: '50+ workflow templates — customize trong trial.',
    ctaLabel: 'Xem demo →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['ui-gallery']]: {
    hero: {
      headline: 'Xem product UI trước — trial khi đã thấy dashboard thật',
      subheadline:
        'Gallery-first: dashboard, mobile, settings, integrations. Screens từ staging — không mockup Figma stock.',
      body: 'Visual buyers — design và product lead cần thấy UI trước khi invite team.',
      ctaLabel: 'Trial sau khi xem UI',
      trustPoints: ['Dark + light mode', 'Responsive mobile', 'Staging screenshots'],
    },
    galleryHeadline: 'Product UI gallery',
    gallerySub: 'Dashboard · pipeline · analytics · mobile — click để zoom.',
    galleryItems: [
      { title: 'Command dashboard', description: 'KPI cards, team load, tasks due — customizable widgets.' },
      { title: 'Pipeline board', description: 'Kanban + list view, drag stage, bulk edit.' },
      { title: 'Analytics hub', description: 'Funnel, cohort, export — filter theo workspace.' },
      { title: 'Mobile companion', description: 'Approve, comment, notify — iOS & Android parity.' },
    ],
    featuresHeadline: 'UI highlights buyers care about',
    features: [
      { title: 'Design system nhất quán', description: 'Component library, accessible contrast, keyboard nav.' },
      { title: 'Customizable workspace', description: 'Layout presets, saved views, role-based UI.' },
      { title: 'Performance', description: 'Sub-200ms interaction, lazy load heavy charts.' },
    ],
    pricingHeadline: 'Pricing khi UI đã convince',
    pricing: [
      {
        name: 'Starter',
        price: 'Miễn phí',
        period: '1 workspace',
        features: ['Core UI', '3 seats', 'Email support'],
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '990.000đ',
        period: '/user/tháng',
        features: ['Custom views', 'Integrations', 'Priority support'],
        highlighted: true,
      },
      {
        name: 'Team',
        price: '2.490.000đ',
        period: '/tháng flat',
        features: ['Unlimited seats', 'SSO', 'Audit log'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Product & design leads nói gì',
    testimonials: [
      {
        quote: 'UI sạch hơn tool cũ — team adopt nhanh vì không phải training 2 tuần.',
        author: 'Product Lead',
        role: 'Scale-up 80 người',
      },
      {
        quote: 'Dark mode và mobile app đủ dùng cho exec approve on-the-go.',
        author: 'Design Director',
        role: 'Consulting firm',
      },
    ],
    faq: [
      { question: 'Screens có phải mockup?', answer: 'Không — capture từ staging, cập nhật mỗi release minor.' },
      { question: 'Có demo live không?', answer: 'Có — trial 14 ngày hoặc book walkthrough 20 phút.' },
      { question: 'White-label UI?', answer: 'Enterprise — custom domain + logo, discuss trong sales call.' },
    ],
    formHeadline: 'Trial sau khi đã xem gallery',
    formSub: 'Invite team design/product — không cần thẻ.',
    formSubmit: 'Mở workspace trial',
    ctaHeadline: 'Còn câu hỏi về UI?',
    ctaSub: 'Book 20 phút walkthrough với product specialist.',
    ctaLabel: 'Book walkthrough →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['faq-trial']]: {
    hero: {
      headline: 'Trial 14 ngày — mọi câu hỏi trả lời trước khi signup',
      subheadline:
        'FAQ-first landing: billing, security, data export, integrations. Giảm friction cho buyer cần certainty trước khi thử.',
      ctaLabel: 'Đọc FAQ & bắt đầu trial',
      trustPoints: ['No credit card', 'Export anytime', 'GDPR-ready'],
    },
    featuresHeadline: 'Platform capabilities (tóm tắt)',
    features: [
      { title: 'Workspace & permissions', description: 'Role-based access, guest invite, audit log (Pro+).' },
      { title: 'Integrations', description: 'OAuth apps, webhook, REST API — docs đầy đủ.' },
      { title: 'Security baseline', description: 'Encrypt at rest, TLS 1.3, SOC 2 Type II in progress.' },
    ],
    benefitsHeadline: 'Lợi ích trial FAQ-first',
    benefits: [
      { title: 'Giảm ticket support', description: 'Buyer tự trả lời objection phổ biến trước signup.' },
      { title: 'Rút ngắn sales cycle', description: 'Champion mang FAQ link vào internal approval.' },
      { title: 'Trust qua transparency', description: 'Pricing, limits, data policy — không ẩn trong footnote.' },
    ],
    faq: [
      {
        question: 'Trial có cần thẻ tín dụng không?',
        answer: 'Không. Sau 14 ngày bạn chọn plan hoặc export — không auto-charge.',
      },
      {
        question: 'Data lưu ở đâu?',
        answer: 'AWS ap-southeast-1 (Singapore) mặc định — EU/US option trên Enterprise.',
      },
      {
        question: 'Export khi cancel?',
        answer: 'CSV + API export trên mọi gói trả phí; trial export contacts/deals limited nhưng đủ pilot.',
      },
      {
        question: 'Giới hạn trial?',
        answer: '≤ 5 users, 1 workspace, core integrations — đủ validate workflow thật.',
      },
      {
        question: 'Hỗ trợ trong trial?',
        answer: 'Email 24h SLA + docs + community — live chat trên Growth+.',
      },
      {
        question: 'Upgrade giữa chừng trial?',
        answer: 'Có — prorate, giữ data và settings, không reset workspace.',
      },
    ],
    guarantee:
      'Cam kết minh bạch: pricing công khai · không phí ẩn · cancel 1-click · export data trong 48h sau yêu cầu.',
    pricingHeadline: 'Plans (sau FAQ)',
    pricing: [
      {
        name: 'Trial',
        price: 'Miễn phí',
        period: '14 ngày',
        features: ['5 users', 'Core features', 'Email support'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '850.000đ',
        period: '/user/tháng',
        features: ['Automation', 'Integrations', 'Audit log'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['SSO', 'Custom SLA', 'Dedicated CSM'],
        highlighted: false,
      },
    ],
    formHeadline: 'Bắt đầu trial — đã đọc FAQ',
    formSub: 'Work email · xác nhận trong vài phút.',
    formSubmit: 'Tạo trial workspace',
    ctaHeadline: 'Còn câu hỏi chưa có trong FAQ?',
    ctaSub: 'Chat với support — trả lời trong giờ làm việc.',
    ctaLabel: 'Hỏi support →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['nav-product']]: {
    hero: {
      headline: 'Product platform — chọn module, xem pricing, trial ngay',
      subheadline:
        'Nav rõ: Product · Pricing · Integrations · Security. Split hero + comparison table — buyer self-serve trước khi talk sales.',
      ctaLabel: 'Start trial — Growth plan',
      trustPoints: ['Pricing công khai', 'Per-seat minh bạch', 'Annual discount 20%'],
    },
    featuresHeadline: 'Product modules',
    features: [
      { title: 'Workspace core', description: 'Projects, tasks, docs — single source of truth.' },
      { title: 'Automation engine', description: 'Rules, triggers, templates — scale ops không thêm headcount.' },
      { title: 'Insights', description: 'Dashboards, scheduled reports, Slack digest.' },
      { title: 'Admin & security', description: 'SSO, 2FA enforce, session policy, IP allowlist.' },
    ],
    processHeadline: 'Self-serve → trial → expand',
    process: [
      { title: 'Explore product nav', description: 'Docs, changelog, integration directory.' },
      { title: 'Compare plans', description: 'Feature matrix — biết chính xác cần tier nào.' },
      { title: 'Start trial', description: 'Growth features 14 ngày — import sample data.' },
      { title: 'Invite & expand', description: 'Add seats, connect integrations, measure adoption.' },
    ],
    galleryHeadline: 'Integrations directory preview',
    gallerySub: '40+ native apps · Zapier · REST API.',
    galleryItems: [
      { title: 'CRM & sales', description: 'HubSpot, Pipedrive, Salesforce — sync deals & activities.' },
      { title: 'Comms', description: 'Slack, Teams, email — notify & approve in-channel.' },
      { title: 'Dev tools', description: 'GitHub, Jira, Linear — link issues to work items.' },
      { title: 'Data & BI', description: 'Sheets, BigQuery export, webhook to warehouse.' },
    ],
    pricingHeadline: 'Compare plans — chọn đúng từ đầu',
    pricing: [
      {
        name: 'Starter',
        price: '0đ',
        period: '≤ 3 users',
        features: ['Core workspace', '5 integrations', 'Community'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '920.000đ',
        period: '/user/tháng',
        features: ['Automation', 'Advanced admin', 'Priority support'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['SSO/SCIM', 'Custom SLA', 'Dedicated CSM'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Teams self-serve thành công',
    testimonials: [
      {
        quote: 'Pricing table rõ — không phải hop on call chỉ để biết giá seat.',
        author: 'Founder',
        role: 'Startup 15 người',
        metric: 'Self-serve',
      },
      {
        quote: 'So sánh Growth vs Enterprise trong 5 phút — chọn đúng tier ngay.',
        author: 'Finance Ops',
        role: 'Mid-market SaaS',
        metric: '−2 calls',
      },
    ],
    formHeadline: 'Start trial — Growth plan',
    formSub: 'Full Growth features 14 ngày · downgrade về Starter bất cứ lúc nào.',
    formSubmit: 'Kích hoạt trial Growth',
    ctaHeadline: 'Cần quote Enterprise?',
    ctaSub: 'Custom seats, SLA, data residency — talk sales.',
    ctaLabel: 'Contact sales →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['early-trial']]: {
    hero: {
      headline: 'Trial ngay — form dưới hero, workspace sẵn trong 60 giây',
      subheadline:
        'High-intent landing: signup trước, xem demo video sau. Không scroll 8 section mới thấy form.',
      body: 'Work email · không thẻ · invite team sau khi vào dashboard.',
      ctaLabel: 'Cuộn xuống — tạo trial',
      trustPoints: ['Setup < 2 phút', 'No credit card', 'GDPR consent rõ'],
    },
    videoHeadline: 'Sau khi signup — xem 90s product tour',
    videoSub: 'Dashboard, invite team, connect Slack — quick start.',
    featuresHeadline: 'Có ngay trong trial',
    features: [
      { title: 'Sample workspace', description: 'Pre-loaded pipeline & tasks — xóa khi import data thật.' },
      { title: 'Quick connect', description: 'Google sign-in, Slack notify, CSV import wizard.' },
      { title: 'Onboarding checklist', description: '5 bước — team active trong ngày 1.' },
    ],
    benefitsHeadline: 'Vì sao form sớm convert cao',
    benefits: [
      { title: 'Intent cao', description: 'Visitor đã click ads/search — sẵn sàng thử.' },
      { title: 'Time-to-value', description: 'Vào product trước khi đọc hết marketing copy.' },
      { title: 'Nurture tự động', description: 'Email sequence trial day 1/7/14 — không spam.' },
    ],
    testimonialsHeadline: 'Signup sớm — adopt nhanh',
    testimonials: [
      {
        quote: 'Tạo account trong giờ nghỉ trưa — chiều đã invite 4 người và chạy workflow thật.',
        author: 'Team Lead',
        role: 'Ops · 20 người',
      },
      {
        quote: 'Form ngắn, không bắt số điện thoại — đúng friction mong muốn.',
        author: 'Founder',
        role: 'Early-stage SaaS',
      },
    ],
    formHeadline: 'Tạo trial workspace — 60 giây',
    formSub: 'Work email · password hoặc Google · không thẻ.',
    formSubmit: 'Tạo workspace ngay',
    ctaHeadline: 'Đã có account?',
    ctaSub: 'Login — tiếp tục trial hoặc upgrade.',
    ctaLabel: 'Login →',
  },

  [SAAS_DIRECTION_ARCHITECTURE_IDS['minimal-trial']]: {
    hero: {
      headline: 'Trial miễn phí — gọn, nhanh, không noise',
      subheadline: 'Headline · 3 bullets · form. Dành traffic search intent cao — biết họ cần gì.',
      ctaLabel: 'Bắt đầu trial',
      trustPoints: ['14 ngày', 'No card', 'Export data'],
    },
    featuresHeadline: 'Core value — 3 điểm',
    features: [
      { title: 'All-in-one workspace', description: 'Tasks, docs, pipeline — một login.' },
      { title: 'Integrations essentials', description: 'Slack, Google, CSV — đủ pilot team nhỏ.' },
      { title: 'Support thật', description: 'Email human — không chỉ bot FAQ.' },
    ],
    formHeadline: 'Trial',
    formSub: 'Email công ty · xác nhận qua link.',
    formSubmit: 'Start trial',
    ctaHeadline: 'Không cần thêm thông tin',
    ctaSub: 'Form ở trên — hoặc bấm lại nếu cần.',
    ctaLabel: 'Start trial →',
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

export function applySaasDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveSaasDirectionStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `saas_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `saas_dir_tm_${architectureId}_${i + 1}`,
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
            id: `saas_dir_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết trial', body: copy.guarantee }
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

export function listSaasDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
