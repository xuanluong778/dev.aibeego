/**
 * Agency direction copy — 7 non-gold premium architectures.
 * Data-driven; keyed by architectureId, no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import type { AgencyGoldDirectionCopy } from './landing-page-agency-gold-directions';
import {
  AGENCY_DIRECTION_ARCHITECTURE_IDS,
  resolveAgencyDirectionStandard,
} from './landing-page-agency-gold-system';

const DIRECTIONS: Record<string, AgencyGoldDirectionCopy> = {
  [AGENCY_DIRECTION_ARCHITECTURE_IDS['trust-case']]: {
    hero: {
      headline: 'Case study trước pitch — KPI thật, client thật, scope rõ',
      subheadline:
        'Trust-first agency landing: testimonial có metric, case study công khai, guarantee trước khi book call. Không slide deck 40 trang.',
      body: 'Dành cho marketing lead cần thấy proof ngành mình trước khi mở brief.',
      ctaLabel: 'Xem case tương tự',
      trustPoints: ['12+ case B2B/D2C', 'KPI public (ẩn danh khi cần)', 'Retainer minh bạch'],
    },
    testimonialsHeadline: 'Trusted by growth teams',
    testimonials: [
      {
        quote: 'Case study ngành SaaS giúp internal buy-in nhanh — không phải đoán agency có kinh nghiệm không.',
        author: 'Head of Marketing',
        role: 'B2B SaaS · Series A',
      },
      {
        quote: 'Metric +3.2x ROAS được show trước discovery call — tiết kiệm 2 tuần evaluation.',
        author: 'E-commerce Lead',
        role: 'D2C · 50 tỷ GMV/năm',
      },
      {
        quote: 'Guarantee scope rõ — không surprise invoice giữa sprint.',
        author: 'Founder',
        role: 'F&B chain · 8 chi nhánh',
      },
    ],
    galleryHeadline: 'Case study & KPI proof',
    gallerySub: 'Before/after · funnel · creative — metric thật, client ẩn danh khi cần.',
    galleryItems: [
      { title: 'SaaS lead gen', description: 'CPL −38% · MQL +2.1x trong 8 tuần — landing + paid sync.' },
      { title: 'D2C scale', description: 'ROAS 3.4x · creative refresh 2 tuần/lần — UGC + studio mix.' },
      { title: 'B2B ABM', description: 'Pipeline +45% · 6 account target — LinkedIn + email nurture.' },
      { title: 'Brand relaunch', description: 'Awareness +60% · brand lift study Q3 — TVC + social cutdown.' },
    ],
    featuresHeadline: 'Services sau khi bạn thấy proof',
    features: [
      { title: 'Growth sprint', description: '4 tuần — audit, test plan, creative pool, weekly KPI review.' },
      { title: 'Retainer always-on', description: 'Creative + media một team — không handoff lệch brief.' },
      { title: 'Brand + performance', description: 'Editorial craft song song KPI — không hy sinh visual.' },
    ],
    benefitsHeadline: 'Vì sao trust-first convert cao hơn',
    benefits: [
      { title: 'Champion có ammo', description: 'Case + metric để trình nội bộ trước khi ký retainer.' },
      { title: 'Fit rõ sớm', description: 'Biết agency có kinh nghiệm ngành bạn — không waste discovery.' },
      { title: 'Scope minh bạch', description: 'Deliverable, timeline, ngân sách media tách bạch từ đầu.' },
    ],
    guarantee:
      'Cam kết: case study metric từ campaign thật · scope retainer fixed monthly · cancel 30 ngày notice · không lock-in asset source.',
    pricingHeadline: 'Gói sau khi đã xem case',
    pricing: [
      {
        name: 'Sprint',
        price: '42.000.000đ',
        period: '4 tuần',
        features: ['Audit + 1 campaign', 'Weekly report', 'Creative pool 8'],
        highlighted: false,
      },
      {
        name: 'Retainer',
        price: '26.000.000đ',
        period: '/tháng',
        features: ['Always-on', 'Dedicated squad', 'Monthly strategy'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['Multi-brand', 'Embedded team', 'Custom SLA'],
        highlighted: false,
      },
    ],
    formHeadline: 'Book discovery — sau khi xem case',
    formSub: '15 phút — review fit ngành & KPI, không sales ép.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Muốn case study ngành bạn?',
    ctaSub: 'Gửi brief ngắn — share 2 case tương tự trong 24h.',
    ctaLabel: 'Yêu cầu case →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['process-sprint']]: {
    hero: {
      headline: 'Growth sprint 4 tuần — audit, test và scale',
      subheadline:
        'Process-first: timeline rõ từng tuần, deliverable cụ thể, decision log mỗi Friday. Không kickoff mơ hồ.',
      ctaLabel: 'Xem sprint playbook',
      trustPoints: ['Week-by-week deliverable', 'Decision log', 'Scope fixed'],
    },
    processHeadline: 'Sprint timeline — 4 tuần',
    process: [
      { title: 'Tuần 1 — Audit & map', description: 'Baseline KPI, channel audit, competitor tear-down, test backlog.' },
      { title: 'Tuần 2 — Strategy & creative', description: 'Angle chốt, 3–5 creative concepts, landing wireframe.' },
      { title: 'Tuần 3 — Launch & optimize', description: 'Go-live paid/organic, daily monitor, mid-week pivot nếu cần.' },
      { title: 'Tuần 4 — Scale & handoff', description: 'Winning test scale, playbook doc, retainer proposal hoặc handoff.' },
    ],
    featuresHeadline: 'Deliverable mỗi sprint',
    features: [
      { title: 'Audit deck', description: 'Channel, creative, landing — prioritized action list.' },
      { title: 'Creative kit', description: 'Static + video cuts theo platform spec — source file included.' },
      { title: 'Weekly growth review', description: 'KPI dashboard + decision log — biết test nào kill/scale.' },
    ],
    benefitsHeadline: 'Lợi ích process có cấu trúc',
    benefits: [
      { title: 'Không scope creep', description: 'Deliverable locked tuần 1 — change request = change order rõ.' },
      { title: 'Learnings tích lũy', description: 'Decision log reuse sprint sau — không bắt đầu từ zero.' },
      { title: 'Founder-friendly', description: 'Biết tuần này agency làm gì — không black box.' },
    ],
    galleryHeadline: 'Sprint output samples',
    gallerySub: 'Audit snapshot · creative board · KPI dashboard — redacted client work.',
    galleryItems: [
      { title: 'Audit snapshot', description: 'Channel scorecard + quick wins — tuần 1 deliverable.' },
      { title: 'Creative board', description: 'Concept → variant → winner — Figma + export spec.' },
      { title: 'KPI dashboard', description: 'Looker/Sheets template — weekly auto-update.' },
      { title: 'Handoff playbook', description: 'Winning angles, copy blocks, do/don\'t — tuần 4.' },
    ],
    testimonialsHeadline: 'Teams đã chạy sprint',
    testimonials: [
      {
        quote: 'Tuần 3 đã có winning creative — nhanh hơn agency cũ 6 tuần kickoff.',
        author: 'Growth Lead',
        role: 'Fintech app',
      },
      {
        quote: 'Decision log giúp board hiểu vì sao scale channel X — không còn tranh cãi gut feel.',
        author: 'CMO',
        role: 'Retail D2C',
      },
    ],
    formHeadline: 'Book sprint discovery',
    formSub: '30 phút — walkthrough timeline & deliverable tuần-by-tuần.',
    formSubmit: 'Đặt lịch sprint call',
    ctaHeadline: 'Cần timeline chi tiết hơn?',
    ctaSub: 'Download sprint playbook PDF — không spam.',
    ctaLabel: 'Nhận playbook →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['work-gallery']]: {
    hero: {
      headline: 'Portfolio trước pitch — work thật, metric thật',
      subheadline:
        'Gallery-first: campaign visual, landing shipped, brand identity — click xem case. Brief sau khi đã thấy chất lượng craft.',
      body: 'Creative directors & founders cần thấy tay nghề trước khi talk budget.',
      ctaLabel: 'Gửi brief sau khi xem work',
      trustPoints: ['Live URLs khi có thể', 'Before/after', 'Multi-industry'],
    },
    galleryHeadline: 'Selected work',
    gallerySub: 'Chiến dịch · brand · web · motion — ẩn danh client khi NDA.',
    galleryItems: [
      { title: 'Brand identity — FMCG', description: 'Key visual, packaging system, social templates — launch 2024.' },
      { title: 'Performance — SaaS', description: '15 ad variants, 3 landing iterations, +2.8x demo signups.' },
      { title: 'E-commerce relaunch', description: 'Shopify theme, email flows, UGC ads — Q4 peak season.' },
      { title: 'Corporate site — B2B', description: 'Next.js, design system, 12 pages — ship 21 ngày.' },
    ],
    benefitsHeadline: 'Craft highlights',
    benefits: [
      { title: 'Editorial-grade visual', description: 'Typography, color, layout — không template stock.' },
      { title: 'Performance-aware design', description: 'Creative built for test velocity — không chỉ đẹp trên Behance.' },
      { title: 'Handoff sạch', description: 'Source files, component map, staging URL — dev onboard nhanh.' },
    ],
    processHeadline: 'From brief → shipped work',
    process: [
      { title: 'Discovery', description: 'Brand audit, competitor, audience — 3 ngày.' },
      { title: 'Concept', description: '2–3 directions, moodboard, copy tone.' },
      { title: 'Production', description: 'Design, dev, media asset — sprint 2–4 tuần.' },
      { title: 'Launch & iterate', description: 'Go-live, test, optimize — retainer optional.' },
    ],
    testimonialsHeadline: 'Clients on our craft',
    testimonials: [
      {
        quote: 'Portfolio nói thay pitch deck — biết ngay agency match aesthetic brand mình.',
        author: 'Brand Director',
        role: 'Luxury retail',
      },
      {
        quote: 'Web + ads cùng design system — không lệch visual giữa landing và creative.',
        author: 'Head of Growth',
        role: 'SaaS Series B',
      },
    ],
    pricingHeadline: 'Project & retainer',
    pricing: [
      {
        name: 'Project',
        price: '38.000.000đ',
        period: 'từ',
        features: ['Brand hoặc campaign', '2 revision rounds', 'Source files'],
        highlighted: false,
      },
      {
        name: 'Retainer',
        price: '24.000.000đ',
        period: '/tháng',
        features: ['4 creative/sprint', 'Priority slot', 'Weekly sync'],
        highlighted: true,
      },
      {
        name: 'Partner',
        price: 'Liên hệ',
        features: ['Embedded creative', 'Unlimited briefs', 'Dedicated lead'],
        highlighted: false,
      },
    ],
    formHeadline: 'Gửi brief — sau khi xem portfolio',
    formSub: 'Brief project ngắn gọn — phản hồi trong 24h làm việc.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Cần xem thêm case ngành bạn?',
    ctaSub: 'NDA OK — share private deck on request.',
    ctaLabel: 'Request private deck →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['faq-pitch']]: {
    hero: {
      headline: 'Retainer agency — mọi câu hỏi trả lời trước discovery call',
      subheadline:
        'FAQ-first pitch: scope, timeline, phí media vs creative, cancel policy. Giảm friction cho buyer cần certainty.',
      ctaLabel: 'Đọc FAQ & book call',
      trustPoints: ['Scope fixed monthly', 'Cancel 30 ngày', 'Asset ownership rõ'],
    },
    featuresHeadline: 'Capability overview',
    features: [
      { title: 'Creative production', description: 'Static, video, UGC brief — 8–12 asset/tháng (Growth plan).' },
      { title: 'Media management', description: 'Meta, Google, TikTok — ngân sách client, fee management riêng.' },
      { title: 'Strategy & reporting', description: 'Weekly KPI, monthly strategy, quarterly business review.' },
    ],
    faq: [
      {
        question: 'Retainer gồm những gì?',
        answer: 'Creative pool, weekly sync, KPI report, Slack channel — media spend tách riêng, không markup ẩn.',
      },
      {
        question: 'Timeline kickoff?',
        answer: '5 ngày làm việc sau ký — onboarding workshop tuần 1.',
      },
      {
        question: 'Ai sở hữu asset?',
        answer: 'Client owns final deliverable — source file handoff cuối tháng hoặc khi cancel.',
      },
      {
        question: 'Cancel policy?',
        answer: '30 ngày notice — không penalty nếu đã trả tháng hiện tại.',
      },
      {
        question: 'Cam kết KPI?',
        answer: 'Cam kết process & reporting — KPI phụ thuộc baseline, ngân sách media, product-market fit.',
      },
      {
        question: 'Làm one-off project?',
        answer: 'Có sprint 4 tuần — retainer được ưu tiên slot sản xuất.',
      },
    ],
    guarantee:
      'Cam kết minh bạch: báo giá tách creative vs media · không phí ẩn · weekly report bắt buộc · escalation path rõ.',
    testimonialsHeadline: 'Clients về process & trust',
    testimonials: [
      {
        quote: 'FAQ trả lời hết objection — discovery call focus fit thay vì giải thích cơ bản.',
        author: 'Marketing Manager',
        role: 'EdTech',
      },
      {
        quote: 'Cancel policy rõ — thử retainer 3 tháng không lo lock-in.',
        author: 'Founder',
        role: 'Health D2C',
      },
    ],
    pricingHeadline: 'Retainer plans',
    pricing: [
      {
        name: 'Starter',
        price: '16.000.000đ',
        period: '/tháng',
        features: ['4 creative', '1 channel', 'Bi-weekly sync'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '28.000.000đ',
        period: '/tháng',
        features: ['10 creative', 'Multi-channel', 'Weekly sync + QBR'],
        highlighted: true,
      },
      {
        name: 'Partner',
        price: 'Liên hệ',
        features: ['Embedded squad', 'Unlimited brief', 'Custom SLA'],
        highlighted: false,
      },
    ],
    formHeadline: 'Book discovery — đã đọc FAQ',
    formSub: '15 phút — review fit & timeline kickoff.',
    formSubmit: 'Giữ slot call',
    ctaHeadline: 'Còn câu hỏi ngoài FAQ?',
    ctaSub: 'Email team — trả lời trong giờ làm việc.',
    ctaLabel: 'Hỏi team →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['nav-services']]: {
    hero: {
      headline: 'Full-service agency — chọn service, xem pricing, book call',
      subheadline:
        'Nav rõ: Brand · Performance · Web · Content. Self-serve pricing comparison trước khi talk sales.',
      ctaLabel: 'Nhận báo giá',
      trustPoints: ['Pricing công khai', 'Scope rõ từng gói', 'No hidden fee'],
    },
    featuresHeadline: 'Service lines',
    features: [
      { title: 'Brand & creative', description: 'Identity, campaign concept, production — studio + remote.' },
      { title: 'Performance marketing', description: 'Paid social, search, CRO — media fee transparent.' },
      { title: 'Web & funnel', description: 'Landing, site, automation — design system + dev handoff.' },
      { title: 'Content & social', description: 'Organic calendar, UGC, community — monthly deliverable.' },
    ],
    benefitsHeadline: 'Vì sao full-service một partner',
    benefits: [
      { title: 'Brief một lần', description: 'Brand và performance cùng DNA — không lệch message.' },
      { title: 'Timeline gọn', description: 'Creative → landing → ads trong một squad — không chờ handoff.' },
      { title: 'Reporting hợp nhất', description: 'Một dashboard brand + performance — không 3 agency 3 report.' },
    ],
    processHeadline: 'Engagement flow',
    process: [
      { title: 'Chọn service mix', description: 'Self-serve hoặc call — match gói với need.' },
      { title: 'Scope & quote', description: 'SOW 1 trang — deliverable, timeline, phí.' },
      { title: 'Kickoff', description: 'Workshop tuần 1 — brand, KPI, channel priority.' },
      { title: 'Sprint & retainer', description: 'Project ship → retainer optional.' },
    ],
    galleryHeadline: 'Cross-service work',
    gallerySub: 'Brand + web + ads — một timeline, một team.',
    galleryItems: [
      { title: 'Brand launch kit', description: 'Logo, KV, social templates, pitch deck — 3 tuần.' },
      { title: 'Web + ads bundle', description: 'Landing + 12 ad variants — ship cùng sprint.' },
      { title: 'Always-on content', description: '30 posts/tháng + 4 video — calendar approval flow.' },
      { title: 'ABM campaign', description: 'LinkedIn + landing + sales deck — B2B pipeline focus.' },
    ],
    pricingHeadline: 'Compare plans',
    pricing: [
      {
        name: 'Project',
        price: '35.000.000đ',
        period: 'từ',
        features: ['1 service line', 'Fixed scope', '2 revisions'],
        highlighted: false,
      },
      {
        name: 'Growth retainer',
        price: '30.000.000đ',
        period: '/tháng',
        features: ['2 service lines', 'Weekly sync', 'Priority production'],
        highlighted: true,
      },
      {
        name: 'Full partner',
        price: 'Liên hệ',
        features: ['All services', 'Embedded lead', 'Custom terms'],
        highlighted: false,
      },
    ],
    testimonialsHeadline: 'Self-serve → signed',
    testimonials: [
      {
        quote: 'Pricing table rõ — biết gói nào fit trước call, tiết kiệm 2 meeting.',
        author: 'Ops Lead',
        role: 'Startup 20 người',
      },
      {
        quote: 'Brand + web + ads một invoice — finance happy, marketing happy.',
        author: 'CMO',
        role: 'Mid-market',
      },
    ],
    formHeadline: 'Nhận báo giá chi tiết',
    formSub: 'Chọn service mix — quote trong 48h làm việc.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Cần custom scope?',
    ctaSub: 'Enterprise multi-brand — talk partner lead.',
    ctaLabel: 'Contact partner →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['early-brief']]: {
    hero: {
      headline: 'Gửi brief ngay — phản hồi proposal trong 48h',
      subheadline:
        'High-intent landing: form dưới hero, portfolio sau. Không scroll 8 section mới thấy cách liên hệ.',
      body: 'Mô tả project ngắn — team review fit trước khi book call dài.',
      ctaLabel: 'Cuộn xuống — gửi brief',
      trustPoints: ['Phản hồi 48h', 'NDA sẵn sàng', 'Không spam'],
    },
    galleryHeadline: 'Recent work preview',
    gallerySub: 'Chiến dịch & brand — teaser trước full deck.',
    galleryItems: [
      { title: 'Q4 showreel', description: '15s cuts — performance + brand spots.' },
      { title: 'SaaS rebrand', description: 'Identity + site — ship 4 tuần.' },
      { title: 'D2C UGC pack', description: '20 creator briefs — monthly retainer output.' },
      { title: 'B2B ABM kit', description: 'LinkedIn + landing + one-pager — pipeline focus.' },
    ],
    benefitsHeadline: 'Sau khi gửi brief',
    benefits: [
      { title: 'Fit check 24h', description: 'Team review ngành, budget, timeline — pass/redirect rõ.' },
      { title: 'Teaser case 48h', description: '2 case tương tự + ballpark quote — không meeting bắt buộc.' },
      { title: 'Discovery optional', description: 'Call 15 phút nếu muốn deep dive — không sales marathon.' },
    ],
    processHeadline: 'Brief → proposal flow',
    process: [
      { title: 'Submit brief', description: 'Form 2 phút — project type, budget range, deadline.' },
      { title: 'Internal review', description: 'Fit, capacity, conflict check — 24h.' },
      { title: 'Teaser response', description: 'Case + ballpark + next step — 48h.' },
      { title: 'Discovery & SOW', description: 'Call optional → SOW 1 trang → kickoff.' },
    ],
    testimonialsHeadline: 'Brief sớm — proposal nhanh',
    testimonials: [
      {
        quote: 'Gửi brief chiều thứ Sáu — thứ Hai có teaser case và range giá. Quyết định nhanh.',
        author: 'Founder',
        role: 'Consumer app',
      },
      {
        quote: 'Form ngắn, không bắt call trước — đúng friction cho agency search intent.',
        author: 'Brand Lead',
        role: 'FMCG',
      },
    ],
    formHeadline: 'Project brief — 2 phút',
    formSub: 'Brief ngắn · budget range · deadline · tick NDA nếu cần.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Đã gửi brief?',
    ctaSub: 'Check email — xác nhận receipt trong vài phút.',
    ctaLabel: 'Gửi lại brief →',
  },

  [AGENCY_DIRECTION_ARCHITECTURE_IDS['minimal-pitch']]: {
    hero: {
      headline: 'Agency partner — gọn, nhanh, KPI-focused',
      subheadline: 'Growth sprint & retainer. Brief ngắn — call 15 phút.',
      ctaLabel: 'Book call',
      trustPoints: ['Sprint 4 tuần', 'Retainer minh bạch', 'Weekly KPI'],
    },
    featuresHeadline: 'Core offer',
    features: [
      { title: 'Growth sprint', description: 'Audit, test và scale trong 4 tuần — scope fixed.' },
      { title: 'Retainer', description: 'Creative + media một team — monthly deliverable rõ.' },
      { title: 'Reporting', description: 'Weekly dashboard — decision log, không vanity metric.' },
    ],
    formHeadline: 'Book 15 phút',
    formSub: 'Tên · email · công ty — xác nhận qua calendar.',
    formSubmit: 'Giữ slot',
    ctaHeadline: 'Slot tuần này còn hạn',
    ctaSub: 'Form trên — hoặc bấm lại.',
    ctaLabel: 'Book call →',
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
  src: AgencyGoldDirectionCopy['pricing'] | undefined,
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

export function applyAgencyDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveAgencyDirectionStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `agency_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `agency_dir_tm_${architectureId}_${i + 1}`,
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
            id: `agency_dir_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết agency', body: copy.guarantee }
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

export function listAgencyDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
