/**
 * SEO direction copy — 7 non-gold premium architectures.
 * Data-driven; keyed by architectureId, no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import type { SeoGoldDirectionCopy } from './landing-page-seo-gold-directions';
import {
  SEO_DIRECTION_ARCHITECTURE_IDS,
  resolveSeoDirectionStandard,
} from './landing-page-seo-gold-system';

const DIRECTIONS: Record<string, SeoGoldDirectionCopy> = {
  [SEO_DIRECTION_ARCHITECTURE_IDS['process-roadmap']]: {
    hero: {
      headline: 'Lộ trình SEO 90 ngày — audit, tối ưu, báo cáo',
      subheadline:
        'Roadmap rõ từng tháng: technical fix, content cluster, authority building. Biết tuần này team SEO làm gì.',
      ctaLabel: 'Nhận roadmap mẫu',
      trustPoints: ['Timeline 90 ngày', 'Milestone đo được', 'Handoff playbook'],
    },
    processHeadline: 'Roadmap 3 tháng',
    process: [
      {
        title: 'Tháng 1 — Audit & foundation',
        description: 'Technical scan, keyword map, quick wins on-page, CWV baseline.',
      },
      {
        title: 'Tháng 2 — Content & structure',
        description: 'Cluster 6–10 bài intent match, internal link hub, schema deploy.',
      },
      {
        title: 'Tháng 3 — Authority & scale',
        description: 'Link outreach, refresh winner pages, dashboard ROI organic.',
      },
    ],
    featuresHeadline: 'Deliverable mỗi giai đoạn',
    features: [
      {
        title: 'Audit report PDF',
        description: 'Technical score, competitor gap, prioritized backlog — tuần 1.',
      },
      {
        title: 'Content calendar',
        description: 'Brief theo keyword cluster — approval flow trước khi viết.',
      },
      {
        title: 'KPI dashboard',
        description: 'Looker/Sheets — ranking, click, conversion organic auto-update.',
      },
    ],
    benefitsHeadline: 'Lợi ích roadmap có cấu trúc',
    benefits: [
      {
        title: 'Không black box',
        description: 'Milestone tháng — biết deliverable trước khi kickoff.',
      },
      {
        title: 'Pivot sớm',
        description: 'Review giữa tháng 2 — điều chỉnh cluster nếu SERP shift.',
      },
      {
        title: 'Handoff sạch',
        description: 'Playbook, template brief, dashboard — in-house tiếp tục được.',
      },
    ],
    testimonialsHeadline: 'Team đã chạy roadmap 90 ngày',
    testimonials: [
      {
        quote: 'Tháng 1 fix xong 180 technical issue — tháng 3 traffic commercial +52% so baseline.',
        author: 'Growth Lead',
        role: 'B2B software',
      },
      {
        quote: 'Roadmap PDF giúp board approve budget SEO — milestone rõ, không slide mơ hồ.',
        author: 'Marketing Manager',
        role: 'Healthcare D2C',
      },
    ],
    formHeadline: 'Yêu cầu audit SEO miễn phí',
    formSub: 'Gửi domain — nhận roadmap sơ bộ trong 48h làm việc.',
    formSubmit: 'Gửi yêu cầu audit',
    ctaHeadline: 'Muốn xem roadmap mẫu ngành bạn?',
    ctaSub: 'Gửi brief ngắn — share template 90 ngày tương tự.',
    ctaLabel: 'Nhận roadmap mẫu',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['portfolio-gallery']]: {
    hero: {
      headline: 'Ranking proof trước pitch — case organic thật, metric thật',
      subheadline:
        'Portfolio-first: screenshot SERP, traffic curve, keyword cluster won — xem proof trước khi book strategy call.',
      body: 'Marketing lead cần thấy kết quả ngành mình trước khi mở brief SEO dài hạn.',
      ctaLabel: 'Xem case tương tự',
      trustPoints: ['SERP screenshot', 'Traffic curve GA4', 'Keyword cluster won'],
    },
    galleryHeadline: 'Case study organic',
    gallerySub: 'Before/after ranking · traffic · revenue impact — client ẩn danh khi NDA.',
    galleryItems: [
      {
        title: 'SaaS B2B — commercial keywords',
        description: 'Top 3 cho 24 keyword demo intent — organic MQL +2.4x trong 6 tháng.',
      },
      {
        title: 'E-commerce — category pages',
        description: 'Traffic transactional +68% · revenue organic +31% — technical + content cluster.',
      },
      {
        title: 'Local service — map pack',
        description: 'Top 3 map pack 12 quận · call tracking +45% — GMB + local landing.',
      },
      {
        title: 'Publisher — informational hub',
        description: '12 pillar page · 840K monthly organic visit — internal link architecture rebuild.',
      },
    ],
    testimonialsHeadline: 'Client về ranking proof',
    testimonials: [
      {
        quote: 'Gallery SERP screenshot giúp internal buy-in nhanh — không phải tin vào promise.',
        author: 'Head of Marketing',
        role: 'B2B SaaS · Series A',
      },
      {
        quote: 'Traffic curve GA4 public (redacted) — biết agency có kinh nghiệm ngành retail.',
        author: 'E-commerce Director',
        role: 'Fashion D2C',
      },
    ],
    featuresHeadline: 'Services sau khi đã thấy proof',
    features: [
      {
        title: 'Technical SEO sprint',
        description: 'CWV, crawl, index — fix blocker trước khi scale content.',
      },
      {
        title: 'Content cluster',
        description: 'Pillar + supporting theo intent map — format match SERP winner.',
      },
      {
        title: 'Authority & reporting',
        description: 'Link outreach có chọn lọc, dashboard KPI tuần.',
      },
    ],
    formHeadline: 'Yêu cầu audit sau khi xem case',
    formSub: 'Gửi domain — so sánh với case tương tự trong 48h.',
    formSubmit: 'Gửi yêu cầu audit',
    ctaHeadline: 'Cần case study ngành bạn?',
    ctaSub: 'NDA OK — share private deck on request.',
    ctaLabel: 'Yêu cầu case riêng',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['video-audit']]: {
    hero: {
      headline: 'Hiểu quy trình audit SEO trong 4 phút',
      subheadline:
        'Video walkthrough: crawl scan, keyword gap, dashboard KPI — biết nhận được gì trước khi gửi domain.',
      ctaLabel: 'Xem video audit',
      trustPoints: ['4 phút overview', 'Screen recording thật', 'Không sales pitch'],
    },
    videoHeadline: 'Walkthrough audit SEO — từ crawl đến KPI dashboard',
    videoSub: 'Screen recording quy trình thật — redacted client data.',
    benefitsHeadline: 'Sau khi xem video bạn sẽ biết',
    benefits: [
      {
        title: 'Audit gồm những mục nào',
        description: 'Technical, on-page, content gap, competitor — checklist 40 điểm.',
      },
      {
        title: 'Timeline deliverable',
        description: 'Report tuần 1, quick wins tuần 2–3, roadmap 90 ngày tuần 4.',
      },
      {
        title: 'Cách đọc KPI dashboard',
        description: 'Ranking, click, conversion — metric nào quan trọng tháng đầu.',
      },
    ],
    processHeadline: 'Quy trình sau video',
    process: [
      { title: 'Gửi domain', description: 'Form 2 phút — URL, mục tiêu, competitor chính.' },
      { title: 'Audit sơ bộ', description: '48h — top 10 issue + keyword opportunity snapshot.' },
      { title: 'Strategy call', description: '30 phút — walkthrough report, Q&A, scope đề xuất.' },
      { title: 'Kickoff', description: 'Ký scope — sprint tuần 1 bắt đầu trong 5 ngày làm việc.' },
    ],
    faq: [
      {
        question: 'Video dùng data client thật?',
        answer: 'Demo dùng staging/redacted data — quy trình và tool giống audit thật 100%.',
      },
      {
        question: 'Audit miễn phí gồm gì?',
        answer: 'Snapshot technical + 20 keyword opportunity — full audit 40 điểm trong gói Growth trở lên.',
      },
    ],
    formHeadline: 'Yêu cầu audit SEO miễn phí',
    formSub: 'Đã xem video — gửi domain nhận report sơ bộ.',
    formSubmit: 'Gửi yêu cầu audit',
    ctaHeadline: 'Sẵn sàng nhận audit thật?',
    ctaSub: 'Form trên — phản hồi trong 48 giờ làm việc.',
    ctaLabel: 'Gửi domain audit',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['faq-authority']]: {
    hero: {
      headline: 'Dịch vụ SEO — mọi câu hỏi trả lời trước strategy call',
      subheadline:
        'FAQ authority-first: timeline, scope, cam kết, ownership content. Giảm friction cho buyer cần certainty.',
      ctaLabel: 'Đọc FAQ và đặt lịch',
      trustPoints: ['Scope fixed monthly', 'Cancel 30 ngày', 'Content ownership rõ'],
    },
    benefitsHeadline: 'Tại sao chọn SEO agency có quy trình',
    benefits: [
      {
        title: 'Process minh bạch',
        description: 'Audit, sprint, report — deliverable locked từ tháng 1.',
      },
      {
        title: 'KPI dashboard tuần',
        description: 'Ranking, traffic, conversion — không report PDF tĩnh cuối tháng.',
      },
      {
        title: 'Team dedicated',
        description: 'SEO lead + content + technical — không rotate freelancer mỗi tháng.',
      },
    ],
    faq: [
      {
        question: 'SEO gói tháng gồm những gì?',
        answer: 'Technical monitor, content theo cluster, on-page optimize, link outreach (Growth+), dashboard KPI tuần.',
      },
      {
        question: 'Bao lâu thấy kết quả?',
        answer: 'Quick wins technical 2–4 tuần; ranking commercial thường 3–6 tháng tùy competition và domain authority.',
      },
      {
        question: 'Có cam kết thứ hạng không?',
        answer: 'Không — cam kết process, deliverable và reporting. Ranking phụ thuộc competition, content và technical baseline.',
      },
      {
        question: 'Ai sở hữu content?',
        answer: 'Client owns bài viết sau thanh toán tháng phát hành — source file và brief included.',
      },
      {
        question: 'Cancel policy?',
        answer: '30 ngày notice sau 3 tháng đầu — không penalty, handoff dashboard và playbook.',
      },
      {
        question: 'Làm local SEO?',
        answer: 'Có — GMB, local landing, citation, map pack trong gói Starter trở lên.',
      },
    ],
    guarantee:
      'Cam kết authority: báo giá tách content vs technical · weekly KPI report bắt buộc · escalation path rõ · không outsource black hat.',
    featuresHeadline: 'Capability overview',
    features: [
      {
        title: 'Technical SEO',
        description: 'Crawl, index, CWV, schema, internal link — sprint liên tục.',
      },
      {
        title: 'Content & on-page',
        description: 'Cluster theo intent, brief SERP-driven, optimize existing pages.',
      },
      {
        title: 'Reporting & strategy',
        description: 'Dashboard tuần, monthly review, quarterly roadmap update.',
      },
    ],
    formHeadline: 'Đặt lịch strategy call',
    formSub: '15 phút — review fit sau khi đọc FAQ.',
    formSubmit: 'Giữ slot tư vấn',
    ctaHeadline: 'Còn câu hỏi ngoài FAQ?',
    ctaSub: 'Email team SEO — trả lời trong giờ làm việc.',
    ctaLabel: 'Hỏi team SEO',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['split-nav']]: {
    hero: {
      headline: 'Full-service SEO — chọn gói, xem pricing, book call',
      subheadline:
        'Nav rõ: Technical · Content · Local · Enterprise. Self-serve pricing comparison trước khi talk sales.',
      ctaLabel: 'Nhận báo giá',
      trustPoints: ['Pricing công khai', 'Scope rõ từng gói', 'No hidden fee'],
    },
    benefitsHeadline: 'Service lines',
    benefits: [
      {
        title: 'Technical SEO',
        description: 'Crawl, CWV, schema, migration support — dev ticket prioritized.',
      },
      {
        title: 'Content & cluster',
        description: 'Keyword map, brief, production, on-page — editorial QA built-in.',
      },
      {
        title: 'Local & international',
        description: 'GMB, hreflang, multi-market keyword research.',
      },
    ],
    processHeadline: 'Engagement flow',
    process: [
      { title: 'Chọn gói', description: 'Self-serve hoặc call — match scope với need.' },
      { title: 'Audit & quote', description: 'SOW 1 trang — deliverable, timeline, phí.' },
      { title: 'Kickoff', description: 'Workshop tuần 1 — KPI, competitor, priority pages.' },
      { title: 'Sprint & retainer', description: '90-day roadmap, retainer optional.' },
    ],
    pricingHeadline: 'So sánh gói SEO',
    pricing: [
      {
        name: 'Starter',
        price: '12.000.000đ',
        period: '/tháng',
        features: ['Audit + 5 page', 'Keyword map', 'Report tháng'],
        highlighted: false,
      },
      {
        name: 'Growth',
        price: '28.000.000đ',
        period: '/tháng',
        features: ['Content cluster', 'Dashboard tuần', 'Link outreach'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Liên hệ',
        features: ['Multi-site', 'Dedicated lead', 'Custom SLA'],
        highlighted: false,
      },
    ],
    formHeadline: 'Nhận báo giá chi tiết',
    formSub: 'Chọn gói quan tâm — quote custom trong 48h làm việc.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Cần custom scope multi-brand?',
    ctaSub: 'Enterprise — talk SEO lead trực tiếp.',
    ctaLabel: 'Liên hệ enterprise',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['early-audit-form']]: {
    hero: {
      headline: 'Audit SEO miễn phí — gửi domain, nhận report trong 48h',
      subheadline:
        'High-intent landing: form ngay dưới headline. Không scroll 8 section mới thấy cách liên hệ.',
      body: 'URL + mục tiêu ngắn — team review và gửi snapshot technical + keyword opportunity.',
      ctaLabel: 'Cuộn xuống gửi domain',
      trustPoints: ['Phản hồi 48h', 'Không bắt ký HĐ', 'Không spam'],
    },
    featuresHeadline: 'Report audit sơ bộ gồm',
    features: [
      {
        title: 'Technical snapshot',
        description: 'Top 10 issue index, CWV, crawl — ảnh hưởng ranking nhất.',
      },
      {
        title: 'Keyword gap',
        description: '20 opportunity keyword commercial — volume & difficulty estimate.',
      },
      {
        title: 'Competitor quick look',
        description: '3 competitor SERP — gap content và backlink sơ bộ.',
      },
    ],
    testimonialsHeadline: 'Audit sớm — quyết định nhanh',
    testimonials: [
      {
        quote: 'Gửi domain thứ Sáu — thứ Hai có report 12 trang, biết ngay cần fix gì trước Q4.',
        author: 'Founder',
        role: 'Consumer app',
      },
      {
        quote: 'Form 2 phút, không bắt call — đúng intent khi đang so sánh agency SEO.',
        author: 'Marketing Lead',
        role: 'B2B services',
      },
    ],
    benefitsHeadline: 'Sau khi gửi domain',
    benefits: [
      {
        title: 'Receipt ngay',
        description: 'Email xác nhận trong vài phút — ticket vào queue audit.',
      },
      {
        title: 'Report 48h',
        description: 'PDF snapshot — không meeting bắt buộc để nhận.',
      },
      {
        title: 'Strategy call optional',
        description: '15 phút walkthrough nếu muốn — không sales marathon.',
      },
    ],
    formHeadline: 'Yêu cầu audit SEO — 2 phút',
    formSub: 'Domain · mục tiêu · competitor chính (optional).',
    formSubmit: 'Gửi yêu cầu audit',
    ctaHeadline: 'Đã gửi domain?',
    ctaSub: 'Check email — report trong 48 giờ làm việc.',
    ctaLabel: 'Gửi lại yêu cầu',
  },

  [SEO_DIRECTION_ARCHITECTURE_IDS['minimal-cta']]: {
    hero: {
      headline: 'SEO organic growth — gọn, KPI-focused',
      subheadline: 'Audit miễn phí · dashboard tuần · scope rõ. Gửi domain hoặc book call 15 phút.',
      ctaLabel: 'Nhận audit miễn phí',
      trustPoints: ['Audit 48h', 'Không lock-in', 'KPI dashboard'],
    },
    benefitsHeadline: 'Core offer',
    benefits: [
      {
        title: 'Audit & roadmap',
        description: 'Technical + keyword map — prioritized action list tuần 1.',
      },
      {
        title: 'Retainer growth',
        description: 'Content cluster, on-page, reporting — deliverable monthly rõ.',
      },
      {
        title: 'Dashboard tuần',
        description: 'Ranking, traffic, conversion organic — decision log included.',
      },
    ],
    formHeadline: 'Gửi domain audit',
    formSub: 'URL · email · mục tiêu ngắn.',
    formSubmit: 'Gửi yêu cầu',
    ctaHeadline: 'Slot strategy call tuần này',
    ctaSub: 'Form trên — hoặc bấm lại.',
    ctaLabel: 'Book call 15 phút',
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
  src: SeoGoldDirectionCopy['pricing'] | undefined,
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

export function applySeoDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveSeoDirectionStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `seo_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `seo_dir_tm_${architectureId}_${i + 1}`,
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
            id: `seo_dir_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết SEO', body: copy.guarantee }
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

export function listSeoDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
