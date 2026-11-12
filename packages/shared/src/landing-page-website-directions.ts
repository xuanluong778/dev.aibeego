/**
 * Website direction copy — 7 non-gold premium architectures.
 * Data-driven; keyed by architectureId, no slug rules.
 */

import type { LandingPageBlock } from './landing-page-types';
import { patchClinicGalleryItems } from './landing-page-clinic-directions';
import type { WebsiteGoldDirectionCopy } from './landing-page-website-gold-directions';
import {
  WEBSITE_DIRECTION_ARCHITECTURE_IDS,
  resolveWebsiteDirectionStandard,
} from './landing-page-website-gold-system';

const DIRECTIONS: Record<string, WebsiteGoldDirectionCopy> = {
  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['build-steps']]: {
    hero: {
      headline: 'Quy trình build web 4 tuần — milestone rõ, staging review mỗi Friday',
      subheadline:
        'Process-first studio: brief locked tuần 1, design system sign-off tuần 2, Next.js trên staging tuần 3, go-live tuần 4. Founder biết tuần này có gì.',
      ctaLabel: 'Xem timeline chi tiết',
      trustPoints: ['Milestone hàng tuần', 'Staging URL cố định', 'Scope change order rõ'],
    },
    processHeadline: 'Build timeline — 4 tuần',
    process: [
      { title: 'Tuần 1 — Brief & IA', description: 'Page map, wireframe key pages, brand asset audit, CRM/form hook spec.' },
      { title: 'Tuần 2 — Design system', description: 'Figma components, 2 revision rounds, mobile/desktop sign-off.' },
      { title: 'Tuần 3 — Dev trên staging', description: 'Next.js build, CMS setup, internal link + form test — URL share nội bộ.' },
      { title: 'Tuần 4 — QA & launch', description: 'Core Web Vitals, SEO checklist, redirect, analytics — go-live + handoff doc.' },
    ],
    featuresHeadline: 'Deliverable mỗi milestone',
    features: [
      { title: 'IA & wire doc', description: 'Sitemap + low-fi wire — approved trước khi vào visual design.' },
      { title: 'Component library', description: 'Figma + code parity — button, card, form, nav reusable.' },
      { title: 'Launch checklist', description: 'Meta, schema, 404, SSL, sitemap — tick list trước production.' },
    ],
    benefitsHeadline: 'Lợi ích process có cấu trúc',
    benefits: [
      { title: 'Không scope trôi', description: 'Change request = add-on quote — không surprise invoice giữa sprint.' },
      { title: 'Review sớm trên staging', description: 'Stakeholder feedback tuần 3 — không chờ ngày launch mới thấy site.' },
      { title: 'Handoff predictable', description: 'Repo, CMS, training slot — locked trong SOW tuần 1.' },
    ],
    testimonialsHeadline: 'Teams đã chạy sprint build',
    testimonials: [
      {
        quote: 'Timeline tuần-by-tuần giúp board approve budget — biết chính xác khi nào có staging.',
        author: 'Growth Lead',
        role: 'B2B SaaS · 40 nhân sự',
      },
      {
        quote: 'Design system sign-off tuần 2 — dev không rework layout giữa sprint.',
        author: 'Product Manager',
        role: 'Fintech app',
      },
    ],
    formHeadline: 'Book walkthrough timeline',
    formSub: '30 phút — review milestone map cho scope của bạn.',
    formSubmit: 'Đặt lịch walkthrough',
    ctaHeadline: 'Cần timeline cho scope lớn hơn?',
    ctaSub: 'Corporate 8+ pages — custom milestone doc trong 48h.',
    ctaLabel: 'Yêu cầu timeline →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS.showcase]: {
    hero: {
      headline: 'Gallery site trước brief — UI craft, live URL, mobile proof',
      subheadline:
        'Showcase-first: scroll xem shipped work, click staging khi public, rồi mới gửi brief. Chất lượng pixel và performance thay pitch deck.',
      body: 'Creative lead và founder cần thấy responsive thật trước khi talk ngân sách.',
      ctaLabel: 'Gửi brief sau khi xem work',
      trustPoints: ['Desktop + mobile shots', 'Live link khi có', 'Design system samples'],
    },
    galleryHeadline: 'Selected shipped sites',
    gallerySub: 'Marketing · corporate · product landing — NDA client khi cần.',
    galleryItems: [
      { title: 'SaaS product marketing', description: 'Next.js · pricing + docs-style pages · Lighthouse 94 mobile.' },
      { title: 'Luxury brand corporate', description: 'Editorial layout · video hero · CMS self-serve content.' },
      { title: 'Startup launch landing', description: 'Waitlist + CRM · A/B hero · live 18 ngày từ brief.' },
      { title: 'Agency white-label kit', description: 'Reusable section library · 4 vertical templates · token export.' },
    ],
    featuresHeadline: 'Capability sau showcase',
    features: [
      { title: 'Custom UI, không template', description: 'Layout theo brand và conversion — không wrap theme generic.' },
      { title: 'Next.js production build', description: 'SSR/SSG mix, image opt, edge deploy — staging mirror production.' },
      { title: 'Post-launch iteration', description: 'Retainer section update · landing A/B · priority bug slot.' },
    ],
    pricingHeadline: 'Project & retainer',
    pricing: [
      {
        name: 'Single landing',
        price: '17.000.000đ',
        period: 'từ',
        features: ['1 page', 'Staging URL', '2 revision'],
        highlighted: false,
      },
      {
        name: 'Multi-page site',
        price: '36.000.000đ',
        period: 'từ',
        features: ['5–8 pages', 'CMS', 'Design system'],
        highlighted: true,
      },
      {
        name: 'Retainer',
        price: '10.000.000đ',
        period: '/tháng',
        features: ['2 landing/sprint', 'Section updates', 'Analytics review'],
        highlighted: false,
      },
    ],
    formHeadline: 'Brief sau khi xem showcase',
    formSub: 'Reference project yêu thích · scope · deadline.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Cần xem thêm ngành bạn?',
    ctaSub: 'Private URL list — NDA welcome.',
    ctaLabel: 'Request private list →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['demo-video']]: {
    hero: {
      headline: 'Xem studio build site — video walkthrough 90 giây',
      subheadline:
        'Demo-first: screen record từ Figma sang staging Next.js, thấy design system, form hook, và launch checklist thực tế.',
      ctaLabel: 'Xem demo & nhận quote',
      trustPoints: ['Figma-to-code flow', 'Staging walkthrough', 'Handoff preview'],
    },
    videoHeadline: 'Studio build walkthrough',
    videoSub: 'Brief, design tokens, staging review, go-live — quy trình thật trên dự án redacted.',
    processHeadline: 'Quy trình trong video',
    process: [
      { title: 'Brief workshop', description: 'Page map và brand constraint — clip 15s trong demo.' },
      { title: 'Design system', description: 'Token, component, responsive spec — Figma inspect.' },
      { title: 'Staging build', description: 'Next.js deploy, form test, mobile pass — live URL share.' },
      { title: 'Launch handoff', description: 'Repo access, CMS training, analytics — closing clip.' },
    ],
    benefitsHeadline: 'Sau khi xem demo',
    benefits: [
      { title: 'Hiểu squad workflow', description: 'Design và dev cùng sprint — không waterfall 8 tuần im lặng.' },
      { title: 'Thấy quality bar', description: 'Typography, spacing, motion — standard trước khi ký.' },
      { title: 'Quote nhanh hơn', description: 'Demo trả lời 80% câu hỏi process — call focus scope.' },
    ],
    faq: [
      {
        question: 'Video dùng project thật?',
        answer: 'Có — redacted client name · staging URL private · metric generic khi NDA.',
      },
      {
        question: 'Có bản dài hơn cho team?',
        answer: 'Gửi link 8 phút sau brief — deep dive CMS và component map.',
      },
    ],
    formHeadline: 'Nhận quote sau demo',
    formSub: 'Đã xem video · mô tả scope · chọn deadline.',
    formSubmit: 'Gửi yêu cầu quote',
    ctaHeadline: 'Muốn live walkthrough?',
    ctaSub: '15 phút screen-share staging — slot tuần này.',
    ctaLabel: 'Book live demo →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['faq-quote']]: {
    hero: {
      headline: 'Mọi câu hỏi báo giá web — trả lời trước khi gửi brief',
      subheadline:
        'FAQ-first: timeline, stack, revision, hosting, ownership — giảm friction cho buyer cần certainty trước quote.',
      ctaLabel: 'Đọc FAQ & nhận báo giá',
      trustPoints: ['Scope locked on quote', 'Source ownership rõ', '30 ngày bug-fix'],
    },
    featuresHeadline: 'Dịch vụ web studio',
    features: [
      { title: 'UI/UX & design system', description: 'Figma custom · 2–3 revision round · token export.' },
      { title: 'Next.js development', description: 'Production build · CMS integration · form/CRM hook.' },
      { title: 'Launch & SEO', description: 'Staging review · Core Web Vitals · schema + sitemap.' },
    ],
    faq: [
      {
        question: 'Giá landing vs corporate khác nhau thế nào?',
        answer: 'Landing 1 page cố định · Corporate 5–8 pages + CMS · Custom quote theo catalog và integration.',
      },
      {
        question: 'Timeline trung bình?',
        answer: 'Landing 2–3 tuần · Corporate 4–6 tuần · milestone tuần trên staging URL.',
      },
      {
        question: 'Revision design giới hạn?',
        answer: '2 round landing · 3 round corporate key pages — thêm round tính theo ngày design.',
      },
      {
        question: 'Ai sở hữu code và Figma?',
        answer: 'Client owns cuối project — repo transfer + Figma duplicate on handoff.',
      },
      {
        question: 'Hosting và domain?',
        answer: 'Client account preferred — agency setup staging + hướng dẫn production deploy.',
      },
      {
        question: 'Bảo hành sau launch?',
        answer: '30 ngày bug-fix production · content edit training · retainer optional.',
      },
    ],
    guarantee:
      'Cam kết minh bạch: quote tách design/dev/hosting · không phí ẩn · staging approve trước go-live · escalation PM rõ.',
    pricingHeadline: 'Gói sau FAQ',
    pricing: [
      {
        name: 'Landing',
        price: '14.000.000đ',
        features: ['1 page', 'Form', 'SEO cơ bản'],
        highlighted: false,
      },
      {
        name: 'Corporate',
        price: '37.000.000đ',
        features: ['5–8 pages', 'CMS', 'Design system', '30 ngày support'],
        highlighted: true,
      },
      {
        name: 'Custom',
        price: 'Liên hệ',
        features: ['E-commerce', 'Multi-lang', 'SLA riêng'],
        highlighted: false,
      },
    ],
    formHeadline: 'Nhận báo giá — đã đọc FAQ',
    formSub: 'Scope ngắn · deadline · budget range.',
    formSubmit: 'Yêu cầu quote',
    ctaHeadline: 'Còn câu hỏi ngoài FAQ?',
    ctaSub: 'Email studio — trả lời trong giờ làm việc.',
    ctaLabel: 'Hỏi studio →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['nav-services']]: {
    hero: {
      headline: 'Full-stack web studio — chọn dịch vụ, xem quy trình, nhận quote',
      subheadline:
        'Nav rõ: Landing · Corporate · E-commerce · Retainer. Self-serve so sánh scope trước discovery call.',
      ctaLabel: 'Nhận báo giá',
      trustPoints: ['Pricing công khai', 'Stack linh hoạt', 'Handoff sạch'],
    },
    featuresHeadline: 'Service lines',
    features: [
      { title: 'Marketing landing', description: 'Single page convert · form/CRM · A/B-ready sections.' },
      { title: 'Corporate site', description: 'Multi-page · CMS · design system · blog optional.' },
      { title: 'E-commerce & catalog', description: 'Headless storefront · payment hook · inventory sync spec.' },
      { title: 'Retainer & iteration', description: 'Landing refresh · section library · monthly analytics.' },
    ],
    benefitsHeadline: 'Một studio, một design system',
    benefits: [
      { title: 'Visual nhất quán', description: 'Landing và corporate pages cùng token — không lệch brand.' },
      { title: 'Dev velocity', description: 'Component reuse — page mới ship nhanh hơn build từ zero.' },
      { title: 'Single point quote', description: 'Một SOW · một timeline · không 3 vendor 3 invoice.' },
    ],
    processHeadline: 'Engagement flow',
    process: [
      { title: 'Chọn service mix', description: 'Self-serve hoặc call — match gói với page map.' },
      { title: 'Quote & SOW', description: 'Scope 1 trang · milestone · payment schedule.' },
      { title: 'Build sprint', description: 'Design system, staging review, QA, rồi go-live theo milestone.' },
      { title: 'Retainer optional', description: 'Iteration slot · priority support · analytics cadence.' },
    ],
    formHeadline: 'Nhận báo giá theo service',
    formSub: 'Tick dịch vụ · page count · deadline — quote 48h.',
    formSubmit: 'Yêu cầu báo giá',
    ctaHeadline: 'Cần scope multi-brand?',
    ctaSub: 'Enterprise portal — talk lead architect.',
    ctaLabel: 'Contact lead →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['early-brief']]: {
    hero: {
      headline: 'Gửi brief web ngay — quote và case tương tự trong 48h',
      subheadline:
        'High-intent landing: form ngay dưới hero, portfolio teaser phía dưới. Không scroll 8 section mới thấy cách liên hệ.',
      body: 'Mô tả page map ngắn — studio review fit trước call dài.',
      ctaLabel: 'Cuộn xuống — gửi brief',
      trustPoints: ['Phản hồi 48h', 'Ballpark quote', 'NDA sẵn sàng'],
    },
    galleryHeadline: 'Recent launches preview',
    gallerySub: 'UI detail · mobile · staging shots — teaser trước full deck.',
    galleryItems: [
      { title: 'Q3 SaaS launch', description: '8 pages · Next.js · signup +28% post-launch.' },
      { title: 'Corporate refresh', description: 'CMS migration · 12 pages · go-live đúng board deadline.' },
      { title: 'Product waitlist', description: 'Landing + email flow · live 16 ngày.' },
      { title: 'Partner white-label', description: 'Section kit · 3 verticals · token shared.' },
    ],
    benefitsHeadline: 'Sau khi gửi brief',
    benefits: [
      { title: 'Fit check 24h', description: 'Review ngành, timeline, budget — pass hoặc redirect rõ.' },
      { title: 'Teaser case 48h', description: '2 URL tương tự + ballpark quote — call không bắt buộc.' },
      { title: 'Discovery optional', description: '15 phút scope nếu muốn — không sales marathon.' },
    ],
    processHeadline: 'Brief đến quote',
    process: [
      { title: 'Submit brief', description: 'Form 2 phút — page count, brand link, deadline.' },
      { title: 'Internal review', description: 'Capacity + stack fit — 24h.' },
      { title: 'Teaser response', description: 'Case URL + range giá + next step — 48h.' },
      { title: 'SOW & kickoff', description: 'Call optional, milestone doc, kickoff brief workshop tuần 1.' },
    ],
    pricingHeadline: 'Ballpark gói phổ biến',
    pricing: [
      {
        name: 'Landing',
        price: '15–20 triệu',
        features: ['1 page', '2 revision', '~3 tuần'],
        highlighted: false,
      },
      {
        name: 'Corporate',
        price: '35–45 triệu',
        features: ['5–8 pages', 'CMS', '~5 tuần'],
        highlighted: true,
      },
      {
        name: 'Custom',
        price: 'Theo scope',
        features: ['E-commerce', 'Integration', 'Timeline riêng'],
        highlighted: false,
      },
    ],
    formHeadline: 'Project brief — 2 phút',
    formSub: 'URL brand hiện tại · page map · deadline · NDA tick nếu cần.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Đã gửi brief?',
    ctaSub: 'Check email — xác nhận receipt trong vài phút.',
    ctaLabel: 'Gửi lại brief →',
  },

  [WEBSITE_DIRECTION_ARCHITECTURE_IDS['minimal-quote']]: {
    hero: {
      headline: 'Web studio — báo giá nhanh, build Next.js, launch đúng hạn',
      subheadline: 'Landing và corporate site. Brief ngắn — quote 48h.',
      ctaLabel: 'Nhận báo giá',
      trustPoints: ['Next.js production', 'Staging trước launch', 'Design system handoff'],
    },
    benefitsHeadline: 'Core offer',
    benefits: [
      { title: 'Landing convert', description: '1 page · form/CRM · SEO launch-ready · 2–3 tuần.' },
      { title: 'Corporate site', description: '5–8 pages · CMS · design system · 4–6 tuần.' },
      { title: 'Handoff sạch', description: 'Repo · Figma · training — team tự vận hành.' },
    ],
    formHeadline: 'Brief nhanh — quote 48h',
    formSub: 'Email · page count · deadline.',
    formSubmit: 'Gửi brief',
    ctaHeadline: 'Slot quote tuần này',
    ctaSub: 'Form trên — hoặc bấm lại.',
    ctaLabel: 'Nhận báo giá →',
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
  src: WebsiteGoldDirectionCopy['pricing'] | undefined,
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

export function applyWebsiteDirectionCopy(
  architectureId: string,
  blocks: LandingPageBlock[],
): LandingPageBlock[] {
  const dir = resolveWebsiteDirectionStandard(architectureId);
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
            ...(block.items[i] || block.items[0] || { id: `website_dir_tm_${i + 1}` }),
            id: block.items[i]?.id || `website_dir_tm_${architectureId}_${i + 1}`,
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
            id: `website_dir_faq_${architectureId}_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'Guarantee':
        return copy.guarantee
          ? { ...block, headline: block.headline || 'Cam kết studio', body: copy.guarantee }
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

export function listWebsiteDirectionIds(): string[] {
  return Object.keys(DIRECTIONS);
}
