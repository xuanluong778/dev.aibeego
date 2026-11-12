/**
 * Phase 3 — config-driven direction copy for all LP categories.
 * SPA keeps hand-tuned copy in landing-page-spa-directions.ts.
 */

import type { LandingPageBlock, LandingPageCategory } from './landing-page-types';
import { applySpaDirectionCopy } from './landing-page-spa-directions';
import { applyAgencyGoldDirectionCopy } from './landing-page-agency-gold-directions';
import { applyAgencyDirectionCopy } from './landing-page-agency-directions';
import {
  isAgencyDirectionArchitecture,
  isAgencyGoldArchitecture,
} from './landing-page-agency-gold-system';
import { applyClinicGoldDirectionCopy } from './landing-page-clinic-gold-directions';
import { applyClinicDirectionCopy, isClinicDirectionArchitecture } from './landing-page-clinic-directions';
import { isClinicGoldArchitecture } from './landing-page-clinic-gold-system';
import { applySaasGoldDirectionCopy } from './landing-page-saas-gold-directions';
import { applySaasDirectionCopy } from './landing-page-saas-directions';
import {
  isSaasDirectionArchitecture,
  isSaasGoldArchitecture,
} from './landing-page-saas-gold-system';
import { applyServiceGoldDirectionCopy } from './landing-page-service-gold-directions';
import { applyServiceDirectionCopy } from './landing-page-service-directions';
import {
  isServiceDirectionArchitecture,
  isServiceGoldArchitecture,
} from './landing-page-service-gold-system';
import { applyConsultingGoldDirectionCopy } from './landing-page-consulting-gold-directions';
import { applyConsultingDirectionCopy } from './landing-page-consulting-directions';
import {
  isConsultingDirectionArchitecture,
  isConsultingGoldArchitecture,
} from './landing-page-consulting-gold-system';
import { applySeoGoldDirectionCopy } from './landing-page-seo-gold-directions';
import { applySeoDirectionCopy } from './landing-page-seo-directions';
import {
  isSeoDirectionArchitecture,
  isSeoGoldArchitecture,
} from './landing-page-seo-gold-system';
import { applyWebsiteGoldDirectionCopy } from './landing-page-website-gold-directions';
import { applyWebsiteDirectionCopy } from './landing-page-website-directions';
import {
  isWebsiteDirectionArchitecture,
  isWebsiteGoldArchitecture,
} from './landing-page-website-gold-system';
import { applyProductGoldDirectionCopy } from './landing-page-product-gold-directions';
import { applyProductDirectionCopy } from './landing-page-product-directions';
import {
  isProductDirectionArchitecture,
  isProductGoldArchitecture,
} from './landing-page-product-gold-system';
import { applyFashionGoldDirectionCopy } from './landing-page-fashion-gold-directions';
import { applyFashionDirectionCopy } from './landing-page-fashion-directions';
import {
  isFashionDirectionArchitecture,
  isFashionGoldArchitecture,
} from './landing-page-fashion-gold-system';
import { applyCosmeticsGoldDirectionCopy } from './landing-page-cosmetics-gold-directions';
import { applyCosmeticsDirectionCopy } from './landing-page-cosmetics-directions';
import {
  isCosmeticsDirectionArchitecture,
  isCosmeticsGoldArchitecture,
} from './landing-page-cosmetics-gold-system';
import { CTA_COPY, type CtaStrategy } from './landing-page-cta-copy';

export type CategoryDirectionCopy = {
  hero: { headline: string; subheadline: string; body?: string; ctaLabel: string };
  featuresHeadline: string;
  features: Array<{ title: string; description: string }>;
  benefitsHeadline?: string;
  benefits?: Array<{ title: string; description: string }>;
  processHeadline?: string;
  process?: Array<{ title: string; description: string }>;
  pricingHeadline?: string;
  pricing?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>;
  galleryHeadline?: string;
  gallerySub?: string;
  testimonialsHeadline?: string;
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  guarantee?: string;
  faq?: Array<{ question: string; answer: string }>;
  formHeadline: string;
  formSubmit: string;
  ctaHeadline: string;
  ctaLabel: string;
  countdownHeadline?: string;
  countdownSub?: string;
};

type CategoryLexicon = {
  label: string;
  offer: string;
  heroAngles: string[];
  /** User-facing hero subheadlines — never internal architecture hints. */
  heroSubheadlines?: string[];
  featureSets: Array<Array<{ title: string; description: string }>>;
  benefitSets: Array<Array<{ title: string; description: string }>>;
  processSets: Array<Array<{ title: string; description: string }>>;
  pricingSets: Array<Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>>;
  galleryHeadlines: string[];
  testimonialHeadlines: string[];
  testimonialSets?: Array<Array<{ quote: string; author: string; role: string }>>;
  guaranteeLines: string[];
  faqSets: Array<Array<{ question: string; answer: string }>>;
  ctaHeadlines: string[];
};

const LEXICONS: Record<LandingPageCategory, CategoryLexicon> = {
  spa: {
    label: 'Spa',
    offer: 'liệu trình chăm sóc',
    heroAngles: [],
    featureSets: [],
    benefitSets: [],
    processSets: [],
    pricingSets: [],
    galleryHeadlines: [],
    testimonialHeadlines: [],
    guaranteeLines: [],
    faqSets: [],
    ctaHeadlines: [],
  },
  seo: {
    label: 'SEO',
    offer: 'dịch vụ SEO',
    heroAngles: [
      'Tăng traffic chất lượng từ Google',
      'SEO minh bạch — KPI rõ từ tháng đầu',
      'Gói SEO phù hợp ngân sách growth',
      'Lộ trình audit → tối ưu → báo cáo',
      'Case study thực tế trước khi ký hợp đồng',
      'Video giải thích quy trình SEO nội bộ',
      'FAQ SEO — trả lời trước khi audit',
      'Agency SEO có quy trình sprint',
      'Audit miễn phí ngay sau hero',
      'Landing audit tối giản — một CTA',
    ],
    featureSets: [
      [
        { title: 'Audit kỹ thuật', description: 'Index, crawl, Core Web Vitals, schema.' },
        { title: 'Keyword map', description: 'Nhóm intent theo funnel mua hàng.' },
        { title: 'Content cluster', description: 'Pillar + supporting theo ngành.' },
      ],
      [
        { title: 'On-page chuẩn', description: 'Title, meta, heading, internal link.' },
        { title: 'Off-page an toàn', description: 'Backlink có kiểm soát chất lượng.' },
        { title: 'Local SEO', description: 'Google Business Profile + NAP.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Traffic có intent', description: 'Tập trung từ khóa chuyển đổi.' },
        { title: 'Báo cáo hàng tháng', description: 'Ranking, click, lead, doanh thu ước tính.' },
        { title: 'Không cam kết ảo', description: 'KPI thống nhất trước khi triển khai.' },
      ],
    ],
    processSets: [
      [
        { title: 'Audit & chẩn đoán', description: 'Baseline kỹ thuật + content gap.' },
        { title: 'Roadmap 90 ngày', description: 'Quick win + nền tảng dài hạn.' },
        { title: 'Triển khai & đo lường', description: 'Sprint hàng tuần, review KPI.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Starter SEO', price: '8.900.000đ/th', features: ['Audit', '10 từ khóa', 'Báo cáo'], highlighted: false },
        { name: 'Growth', price: '18.900.000đ/th', features: ['30 từ khóa', 'Content', 'Link'], highlighted: true },
        { name: 'Enterprise', price: 'Liên hệ', features: ['Multi-site', 'Dedicated'], highlighted: false },
      ],
    ],
    galleryHeadlines: ['Portfolio SEO', 'Case trước / sau', 'Dashboard báo cáo'],
    testimonialHeadlines: ['Khách hàng B2B nói gì', 'KPI thực tế', 'Review agency'],
    guaranteeLines: ['Cam kết minh bạch phương pháp và báo cáo định kỳ.'],
    faqSets: [
      [
        { question: 'Bao lâu thấy kết quả?', answer: 'Thường 8–12 tuần cho tín hiệu ranking; lead phụ thuộc ngành.' },
        { question: 'Có cam kết top 1?', answer: 'Không — cam kết quy trình, KPI và effort minh bạch.' },
      ],
    ],
    ctaHeadlines: ['Sẵn sàng audit website?', 'Nhận roadmap SEO miễn phí', 'Bắt đầu sprint SEO'],
  },
  agency: {
    label: 'Agency',
    offer: 'dịch vụ marketing',
    heroAngles: [
      'Agency growth partner — KPI rõ',
      'Portfolio + case trước pitch',
      'Retainer linh hoạt theo sprint',
      'Sprint 2 tuần — deliverable rõ',
      'Creative + performance trong một team',
      'Showreel 60 giây — cảm nhận phong cách',
      'Giải đáp trước brief — minh bạch từ đầu',
      'Full-service agency — creative & growth',
      'Gửi brief — đề xuất trong 48 giờ',
      'Pitch tối giản — một CTA mạnh',
    ],
    heroSubheadlines: [
      'Growth partner minh bạch — sprint KPI rõ, dashboard tuần đích danh.',
      'Portfolio & case study trước pitch — ra quyết định nhanh hơn.',
      'Retainer linh hoạt theo sprint — scale theo ngân sách thực tế.',
      'Quy trình sprint 2 tuần — deliverable rõ, timeline cam kết.',
      'Creative + performance trong một team — giảm friction triển khai.',
      'Showreel 60 giây — cảm nhận phong cách trước discovery call.',
      'FAQ trả lời trước brief — giảm thời gian alignment.',
      'Nav dịch vụ rõ — hero tập trung CTA chính.',
      'Brief form sớm — nhận đề xuất trong 24–48 giờ.',
      'Pitch tối giản — một CTA, một lộ trình rõ ràng.',
    ],
    featureSets: [
      [
        { title: 'Brand & creative', description: 'Visual system + campaign concept.' },
        { title: 'Performance', description: 'Ads, landing, CRO theo funnel.' },
        { title: 'Analytics', description: 'Dashboard KPI tuần/tháng.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Một đầu mối', description: 'PM + team chuyên môn theo sprint.' },
        { title: 'Deliverable rõ', description: 'Timeline, asset, approval flow.' },
        { title: 'Scale theo ngân sách', description: 'Retainer hoặc project-based.' },
      ],
    ],
    processSets: [
      [
        { title: 'Discovery', description: 'Brief, audit, mục tiêu KPI.' },
        { title: 'Strategy sprint', description: 'Channel mix + creative territory.' },
        { title: 'Execute & optimize', description: 'Launch, test, scale winner.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Sprint', price: '45.000.000đ', features: ['2 tuần', '1 campaign', 'Report'], highlighted: false },
        { name: 'Retainer', price: '28.000.000đ/th', features: ['Always-on', 'Creative pool'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Work gallery', 'Campaign highlights', 'Before / after'],
    testimonialHeadlines: ['Client love', 'KPI case', 'Partner review'],
    testimonialSets: [
      [
        {
          quote: 'Team bám sprint KPI rất sát — dashboard tuần giúp leadership ra quyết định nhanh hơn.',
          author: 'Head of Marketing',
          role: 'B2B SaaS',
        },
        {
          quote: 'Creative + performance trong một đội ngũ — giảm friction giữa brand và growth.',
          author: 'Growth Lead',
          role: 'E-commerce',
        },
        {
          quote: 'Deliverable rõ, timeline minh bạch. Retainer 6 tháng và vẫn tiếp tục scale.',
          author: 'Founder',
          role: 'D2C brand',
        },
      ],
      [
        {
          quote: 'Case study trước pitch giúp chúng tôi thuyết phục board nội bộ trong một buổi.',
          author: 'CMO',
          role: 'Fintech',
        },
        {
          quote: 'Sprint 2 tuần đúng hạn — asset handoff sạch, không phải chase file.',
          author: 'Brand Manager',
          role: 'Retail',
        },
      ],
    ],
    guaranteeLines: ['Revision theo scope đã ký — timeline rõ trong SOW.'],
    faqSets: [[{ question: 'Timeline dự án?', answer: 'Sprint 2–4 tuần; retainer theo SLA tháng.' }]],
    ctaHeadlines: ['Book discovery call', 'Gửi brief dự án', 'Xem case tương tự'],
  },
  clinic: {
    label: 'Phòng khám',
    offer: 'dịch vụ y khoa / thẩm mỹ',
    heroAngles: [
      'Đặt lịch khám — quy trình rõ ràng',
      'Chứng chỉ & trust trước booking',
      'Gói điều trị minh bạch',
      'Lộ trình điều trị từng bước',
      'Before/after có consent',
      'Video giáo dục bệnh nhân',
      'FAQ chăm sóc sau điều trị',
      'Nav dịch vụ + booking',
      'Form đặt lịch sớm',
      'Booking tối giản',
    ],
    featureSets: [
      [
        { title: 'Khám & tư vấn', description: 'Bác sĩ đánh giá, giải thích phác đồ.' },
        { title: 'Điều trị chuẩn', description: 'Protocol an toàn, ghi nhận hồ sơ.' },
        { title: 'Theo dõi', description: 'Tái khám và chăm sóc tại nhà.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'An toàn', description: 'Vệ sinh, consent, hồ sơ điện tử.' },
        { title: 'Minh bạch chi phí', description: 'Báo giá trước khi làm.' },
        { title: 'Hỗ trợ nhanh', description: 'Hotline / Zalo lễ tân.' },
      ],
    ],
    processSets: [
      [
        { title: 'Tiếp nhận', description: 'Khai báo + mục tiêu điều trị.' },
        { title: 'Thăm khám', description: 'Chẩn đoán và phác đồ.' },
        { title: 'Follow-up', description: 'Tái khám theo lịch.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Gói cơ bản', price: '1.200.000đ', features: ['Khám', 'Tư vấn'], highlighted: false },
        { name: 'Liệu trình', price: 'Liên hệ', features: ['Multi-session', 'Theo dõi'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Không gian phòng khám', 'Thiết bị', 'Kết quả (minh họa)'],
    testimonialHeadlines: ['Bệnh nhân chia sẻ', 'Review Google', 'Cảm nhận sau điều trị'],
    guaranteeLines: ['Tuân thủ quy trình y khoa và bảo mật hồ sơ bệnh nhân.'],
    faqSets: [[{ question: 'Có bảo hiểm?', answer: 'Tùy gói — vui lòng hỏi lễ tân khi đặt lịch.' }]],
    ctaHeadlines: ['Đặt lịch khám', 'Giữ suất tuần này', 'Tư vấn miễn phí 15 phút'],
  },
  course: {
    label: 'Khóa học',
    offer: 'chương trình đào tạo',
    heroAngles: [
      'Học xong làm được — lộ trình rõ',
      'Outcome + review học viên',
      'Chọn gói học phù hợp',
      'Curriculum module-by-module',
      'Gallery học viên / project',
      'Trailer khóa học',
      'FAQ trước enroll',
      'Nav module + enroll',
      'Enroll sớm sau hero',
      'Enroll tối giản',
    ],
    featureSets: [
      [
        { title: 'Video bài giảng', description: 'Ngắn gọn, có action item.' },
        { title: 'Workbook & template', description: 'Tài liệu tải về, làm theo.' },
        { title: 'Community / Q&A', description: 'Hỏi đáp trong thời gian học.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Skill thực chiến', description: 'Bài tập gắn case thật.' },
        { title: 'Certificate', description: 'Hoàn thành nhận chứng nhận.' },
        { title: 'Lifetime access', description: 'Xem lại khi cần (theo gói).' },
      ],
    ],
    processSets: [
      [
        { title: 'Enroll', description: 'Chọn gói, thanh toán, vào LMS.' },
        { title: 'Learn', description: 'Module theo tuần + assignment.' },
        { title: 'Apply', description: 'Project cuối khóa / capstone.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Standard', price: '2.990.000đ', features: ['Video', 'Workbook'], highlighted: false },
        { name: 'Pro + Coach', price: '5.990.000đ', features: ['Review bài', 'Q&A live'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Project học viên', 'Behind the scenes', 'Lớp live'],
    testimonialHeadlines: ['Học viên nói gì', 'Kết quả sau khóa', 'Review 5 sao'],
    guaranteeLines: ['Hoàn tiền 7 ngày nếu chưa vào module 2 (theo chính sách khóa).'],
    faqSets: [[{ question: 'Học online hay offline?', answer: 'Tùy khóa — ghi rõ trên trang đăng ký.' }]],
    ctaHeadlines: ['Enroll khóa học', 'Giữ chỗ lớp sắp mở', 'Xem curriculum đầy đủ'],
  },
  saas: {
    label: 'SaaS',
    offer: 'nền tảng phần mềm',
    heroAngles: [
      'Trial 14 ngày — setup 10 phút',
      'Logo khách hàng + trial',
      'Pricing rõ — chọn plan nhanh',
      'Workflow automation story',
      'UI gallery — xem trước product',
      'Demo video 3 phút',
      'FAQ + guarantee trước trial',
      'Product nav + trial CTA',
      'Trial form sớm',
      'Trial landing tối giản',
    ],
    featureSets: [
      [
        { title: 'Automation', description: 'Workflow no-code kéo thả.' },
        { title: 'Integrations', description: 'CRM, email, webhook, API.' },
        { title: 'Analytics', description: 'Dashboard real-time.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Time-to-value nhanh', description: 'Template sẵn theo use case.' },
        { title: 'Scale team', description: 'Role, permission, audit log.' },
        { title: 'Support onboarding', description: 'CSM cho gói Business.' },
      ],
    ],
    processSets: [
      [
        { title: 'Sign up', description: 'Email công ty, workspace tự tạo.' },
        { title: 'Connect', description: 'Import data / integration.' },
        { title: 'Launch', description: 'Invite team, go live.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Starter', price: '$29/user', features: ['Core features', 'Email support'], highlighted: false },
        { name: 'Business', price: '$79/user', features: ['Integrations', 'Priority support'], highlighted: true },
        { name: 'Enterprise', price: 'Custom', features: ['SSO', 'SLA'], highlighted: false },
      ],
    ],
    galleryHeadlines: ['Product UI', 'Dashboard views', 'Mobile app'],
    testimonialHeadlines: ['Teams love it', 'G2 reviews', 'Case study SaaS'],
    guaranteeLines: ['Trial không cần thẻ — hủy bất cứ lúc nào.'],
    faqSets: [[{ question: 'Data export?', answer: 'CSV/API export trên mọi gói trả phí.' }]],
    ctaHeadlines: ['Start free trial', 'Book product demo', 'See pricing'],
  },
  product: {
    label: 'Sản phẩm',
    offer: 'sản phẩm vật lý',
    heroAngles: [
      'Mua ngay — gallery + specs',
      'Review thật trước checkout',
      'So sánh gói / biến thể',
      'Cách sản phẩm hoạt động',
      'Lookbook visual-first',
      'Demo reel sản phẩm',
      'FAQ mua hàng',
      'Shop nav + buy CTA',
      'Order form sớm',
      'Buy landing tối giản',
    ],
    featureSets: [
      [
        { title: 'Chất liệu premium', description: 'Nguyên liệu chọn lọc, bền theo thời gian.' },
        { title: 'Thiết kế ergonomic', description: 'Dùng hàng ngày thoải mái.' },
        { title: 'Bảo hành', description: '12 tháng — đổi trả theo chính sách.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Ship nhanh', description: 'Giao 1–3 ngày nội thành.' },
        { title: 'COD / online', description: 'Thanh toán linh hoạt.' },
        { title: 'Hỗ trợ Zalo', description: 'Tư vấn size / spec trước mua.' },
      ],
    ],
    processSets: [
      [
        { title: 'Chọn biến thể', description: 'Màu, size, combo.' },
        { title: 'Thanh toán', description: 'COD hoặc chuyển khoản.' },
        { title: 'Nhận hàng', description: 'Kiểm tra — đổi trả 7 ngày.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Standard', price: '890.000đ', features: ['1 unit', 'Ship'], highlighted: false },
        { name: 'Combo tiết kiệm', price: '1.590.000đ', features: ['2 units', 'Free ship'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Ảnh sản phẩm', 'Lifestyle', 'Chi tiết'],
    testimonialHeadlines: ['Khách đã mua', 'Unboxing review', 'Rating 4.9★'],
    guaranteeLines: ['Đổi trả 7 ngày nếu lỗi NSX — giữ tem nguyên.'],
    faqSets: [[{ question: 'Có ship tỉnh?', answer: 'Có — phí ship hiển thị khi checkout.' }]],
    ctaHeadlines: ['Mua ngay', 'Thêm giỏ — checkout', 'Nhận ưu đãi hôm nay'],
  },
  restaurant: {
    label: 'Nhà hàng',
    offer: 'ẩm thực / dining',
    heroAngles: [
      'Đặt bàn — menu & giờ mở cửa',
      'Chef & nguồn nguyên liệu',
      'Set menu / tasting',
      'Trải nghiệm dining từng bước',
      'Food gallery',
      'Kitchen video',
      'FAQ đặt bàn',
      'Nav menu + reserve',
      'Reserve form sớm',
      'Reserve tối giản',
    ],
    featureSets: [
      [
        { title: 'Menu theo mùa', description: 'Nguyên liệu local, đổi menu định kỳ.' },
        { title: 'Private dining', description: 'Phòng riêng 8–20 khách.' },
        { title: 'Wine pairing', description: 'Sommelier gợi ý theo món.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Giữ chỗ nhanh', description: 'Xác nhận SMS trong 30 phút.' },
        { title: 'Không gian', description: 'Indoor / terrace / bar.' },
        { title: 'Dịch vụ', description: 'Phục vụ chuẩn fine dining.' },
      ],
    ],
    processSets: [
      [
        { title: 'Chọn giờ', description: 'Lunch / dinner slot.' },
        { title: 'Confirm', description: 'SMS / call xác nhận.' },
        { title: 'Dine', description: 'Check-in tên + số khách.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Lunch set', price: '450.000đ', features: ['3 món', 'Nước'], highlighted: false },
        { name: 'Tasting menu', price: '1.290.000đ', features: ['7 món', 'Pairing'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Món signature', 'Không gian', 'Chef table'],
    testimonialHeadlines: ['Review Google', 'Food blogger', 'Khách quen'],
    guaranteeLines: ['Giữ bàn 15 phút — gọi trước nếu trễ.'],
    faqSets: [[{ question: 'Dress code?', answer: 'Smart casual — không slipper.' }]],
    ctaHeadlines: ['Đặt bàn', 'Giữ chỗ cuối tuần', 'Xem menu PDF'],
  },
  real_estate: {
    label: 'Bất động sản',
    offer: 'dự án / căn hộ',
    heroAngles: [
      'Đặt lịch xem nhà mẫu',
      'Pháp lý & chủ đầu tư uy tín',
      'Bảng giá căn / tiến độ',
      'Hành trình mua nhà',
      'Tour ảnh / 3D',
      'Drone video dự án',
      'FAQ pháp lý',
      'Nav dự án + viewing',
      'Form xem nhà sớm',
      'Viewing tối giản',
    ],
    featureSets: [
      [
        { title: 'Vị trí', description: 'Kết nối trung tâm, tiện ích 5 phút.' },
        { title: 'Tiện ích nội khu', description: 'Pool, gym, công viên, shophouse.' },
        { title: 'Pháp lý', description: 'Sổ hồng / lộ giới minh bạch.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Thanh toán linh hoạt', description: 'Vay ngân hàng hỗ trợ hồ sơ.' },
        { title: 'Bàn giao', description: 'Tiến độ cam kết theo hợp đồng.' },
        { title: 'Sales gallery', description: 'Mô hình + VR tour.' },
      ],
    ],
    processSets: [
      [
        { title: 'Tư vấn', description: 'Nhu cầu, ngân sách, khu vực.' },
        { title: 'Xem mẫu', description: 'Tour showroom / thực tế.' },
        { title: 'Ký cọc', description: 'Hồ sơ vay + hợp đồng.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Studio', price: '1.85 tỷ', features: ['45m²', 'Full nội thất cơ bản'], highlighted: false },
        { name: '2PN', price: '2.95 tỷ', features: ['72m²', 'View sông'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Phối cảnh', 'Nội thất mẫu', 'Tiện ích'],
    testimonialHeadlines: ['Cư dân nói gì', 'Nhà đầu tư', 'Review dự án'],
    guaranteeLines: ['Thông tin pháp lý công khai tại sales gallery.'],
    faqSets: [[{ question: 'Phí bảo trì?', answer: 'Theo quy định BQL — bảng phí tại gallery.' }]],
    ctaHeadlines: ['Đặt lịch xem nhà', 'Nhận bảng giá mới', 'Tour VR ngay'],
  },
  webinar: {
    label: 'Webinar',
    offer: 'sự kiện online',
    heroAngles: [
      'Đăng ký webinar — chỗ có hạn',
      'Speaker + agenda trust',
      'Gói vé / replay',
      'Agenda từng phần',
      'Replay gallery',
      'Teaser 60s',
      'FAQ đăng ký',
      'Nav event + register',
      'Register sớm',
      'Register tối giản',
    ],
    featureSets: [
      [
        { title: 'Live Q&A', description: 'Hỏi speaker trực tiếp.' },
        { title: 'Slide + replay', description: 'Gửi sau sự kiện 24h.' },
        { title: 'Certificate', description: 'Tham dự đủ 80% nhận cert.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Actionable', description: 'Framework áp dụng ngay.' },
        { title: 'Case study', description: 'Số liệu thật từ speaker.' },
        { title: 'Bonus', description: 'Template / checklist kèm.' },
      ],
    ],
    processSets: [
      [
        { title: 'Register', description: 'Email + calendar invite.' },
        { title: 'Attend live', description: 'Zoom link 15 phút trước.' },
        { title: 'Replay', description: 'Xem lại 7 ngày.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Free seat', price: '0đ', features: ['Live only'], highlighted: false },
        { name: 'VIP + replay', price: '299.000đ', features: ['Replay', 'Slides'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Highlight past events', 'Speaker on stage', 'Audience'],
    testimonialHeadlines: ['Attendee feedback', 'Past registrants', 'Rating'],
    guaranteeLines: ['Recording gửi trong 24h cho gói VIP.'],
    faqSets: [[{ question: 'Có recording?', answer: 'Gói VIP — free seat live only.' }]],
    ctaHeadlines: ['Đăng ký webinar', 'Giữ chỗ miễn phí', 'Add to calendar'],
  },
  cosmetics: {
    label: 'Mỹ phẩm',
    offer: 'skincare / makeup',
    heroAngles: [
      'Routine làm đẹp — mua ngay',
      'Dermatologist-tested trust',
      'Kit / combo pricing',
      'Routine 4 bước',
      'Lookbook makeup',
      'Tutorial video',
      'FAQ an toàn da',
      'Shop nav + order',
      'Order form sớm',
      'Buy tối giản',
    ],
    featureSets: [
      [
        { title: 'Serum active', description: 'Nồng độ rõ, hướng dẫn AM/PM.' },
        { title: 'Cleanser dịu', description: 'pH balanced, không SLS.' },
        { title: 'SPF daily', description: 'Finish nhẹ, không bí da.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Da nhạy cảm OK', description: 'Test patch khuyến nghị.' },
        { title: 'Clean label', description: 'Thành phần công bố đầy đủ.' },
        { title: 'Ship chuẩn', description: 'Đóng gói chống vỡ.' },
      ],
    ],
    processSets: [
      [
        { title: 'Cleanse', description: 'Làm sạch nhẹ nhàng.' },
        { title: 'Treat', description: 'Serum theo mục tiêu da.' },
        { title: 'Protect', description: 'Moisturize + SPF sáng.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Starter kit', price: '690.000đ', features: ['3 sản phẩm'], highlighted: false },
        { name: 'Full routine', price: '1.290.000đ', features: ['5 sản phẩm', 'Túi travel'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Texture swatch', 'Before glow', 'Packaging'],
    testimonialHeadlines: ['Review da nhạy cảm', 'Beauty creator', 'Repeat buyers'],
    guaranteeLines: ['Đổi trả 7 ngày nếu seal nguyên.'],
    faqSets: [[{ question: 'Bao hàm?', answer: 'Không — mỹ phẩm đã mở seal không đổi.' }]],
    ctaHeadlines: ['Mua routine', 'Nhận sample', 'Shop bestseller'],
  },
  fashion: {
    label: 'Thời trang',
    offer: 'collection / drop',
    heroAngles: [
      'New drop — mua / pre-order',
      'Fit & fabric trust',
      'Giá drop / early bird',
      'Style guide lookbook',
      'Lookbook gallery-first',
      'Runway video',
      'FAQ size & return',
      'Nav collection',
      'Pre-order sớm',
      'Drop tối giản',
    ],
    featureSets: [
      [
        { title: 'Fabric premium', description: 'Cotton organic / wool blend.' },
        { title: 'Cut modern', description: 'Regular & relaxed fit.' },
        { title: 'Limited run', description: 'Số lượng có hạn mỗi drop.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Free exchange size', description: 'Đổi size 7 ngày (còn hàng).' },
        { title: 'Authentic tag', description: 'Tem chống giả + care label.' },
        { title: 'Ship 24h', description: 'Nội thành giao nhanh.' },
      ],
    ],
    processSets: [
      [
        { title: 'Browse drop', description: 'Size chart rõ từng item.' },
        { title: 'Checkout', description: 'COD / card.' },
        { title: 'Wear', description: 'Care guide kèm hộp.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Tee', price: '590.000đ', features: ['Unisex'], highlighted: false },
        { name: 'Drop bundle', price: '1.490.000đ', features: ['3 items', '-15%'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Campaign shoot', 'On body', 'Detail stitch'],
    testimonialHeadlines: ['Stylist pick', 'Customer fit pics', 'Repeat drop buyers'],
    guaranteeLines: ['Đổi size miễn phí 1 lần — item còn tag.'],
    faqSets: [[{ question: 'True to size?', answer: 'Xem size chart — relaxed fit +1 nếu prefer loose.' }]],
    ctaHeadlines: ['Shop drop', 'Pre-order now', 'Get early bird price'],
  },
  website: {
    label: 'Website',
    offer: 'dịch vụ web',
    heroAngles: [
      'Báo giá website — brief nhanh',
      'Portfolio + testimonial',
      'Gói web sớm trên fold',
      'Quy trình build 4 bước',
      'Showcase dự án',
      'Demo quy trình video',
      'FAQ báo giá',
      'Nav dịch vụ',
      'Brief form sớm',
      'Quote tối giản',
    ],
    featureSets: [
      [
        { title: 'UI/UX custom', description: 'Figma trước khi code.' },
        { title: 'CMS / WordPress', description: 'Tự sửa nội dung sau bàn giao.' },
        { title: 'Performance', description: 'Core Web Vitals tối ưu.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Timeline rõ', description: '2–6 tuần tùy scope.' },
        { title: 'SEO-ready', description: 'Schema, meta, sitemap.' },
        { title: 'Bảo hành', description: '30 ngày fix bug sau launch.' },
      ],
    ],
    processSets: [
      [
        { title: 'Brief', description: 'Mục tiêu, page map, brand.' },
        { title: 'Design', description: '2 vòng revision.' },
        { title: 'Dev & launch', description: 'Staging → production.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Landing', price: '12.000.000đ', features: ['1 page', 'Form'], highlighted: false },
        { name: 'Corporate', price: '35.000.000đ', features: ['5–8 pages', 'CMS'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Portfolio web', 'UI detail', 'Mobile view'],
    testimonialHeadlines: ['Client review', 'Launch feedback', 'Agency partner'],
    guaranteeLines: ['Source code / asset bàn giao theo hợp đồng.'],
    faqSets: [[{ question: 'Hosting ai lo?', answer: 'Tư vấn gói — client hoặc agency setup.' }]],
    ctaHeadlines: ['Nhận báo giá', 'Gửi brief', 'Xem portfolio'],
  },
  service: {
    label: 'Dịch vụ',
    offer: 'dịch vụ tại nhà / local',
    heroAngles: [
      'Đặt dịch vụ — phản hồi nhanh',
      'Review local trust',
      'Gói dịch vụ rõ giá',
      'Quy trình làm việc',
      'Gallery job thực tế',
      'Intro video team',
      'FAQ đặt lịch',
      'Nav khu vực phục vụ',
      'Book form sớm',
      'Book tối giản',
    ],
    featureSets: [
      [
        { title: 'Đúng giờ', description: 'Slot booking rõ, nhắc SMS.' },
        { title: 'Team có badge', description: 'Đồng phục, ID, checklist.' },
        { title: 'Bảo hiểm', description: 'Trách nhiệm nghề theo hợp đồng.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Báo giá trước', description: 'Không phát sinh ngoài scope.' },
        { title: 'Local 24/7', description: 'Hotline hỗ trợ.' },
        { title: 'Guarantee', description: 'Làm lại nếu chưa đạt checklist.' },
      ],
    ],
    processSets: [
      [
        { title: 'Book', description: 'Chọn dịch vụ + địa chỉ.' },
        { title: 'Dispatch', description: 'Team đến đúng slot.' },
        { title: 'Done', description: 'Checklist + thanh toán.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Basic', price: '350.000đ', features: ['1 lần'], highlighted: false },
        { name: 'Monthly', price: '990.000đ', features: ['4 lần/th'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Job gallery', 'Before / after', 'Team on site'],
    testimonialHeadlines: ['Khách hàng local', 'Google review', 'Repeat booking'],
    guaranteeLines: ['Làm lại miễn phí trong 48h nếu chưa đạt tiêu chí.'],
    faqSets: [[{ question: 'Khu vực phục vụ?', answer: 'Nội thành + lân cận 15km — hỏi thêm ngoại thành.' }]],
    ctaHeadlines: ['Đặt dịch vụ', 'Book slot hôm nay', 'Gọi hotline'],
  },
  coaching: {
    label: 'Coaching',
    offer: 'coaching program',
    heroAngles: [
      'Apply coaching — kết quả rõ',
      'Testimonial + outcome',
      'Gói coaching',
      'Methodology steps',
      'Client gallery',
      'Intro video coach',
      'FAQ program',
      'Nav program',
      'Apply sớm',
      'Coaching tối giản',
    ],
    featureSets: [
      [
        { title: '1:1 session', description: '60 phút / tuần Zoom.' },
        { title: 'Accountability', description: 'Check-in async giữa buổi.' },
        { title: 'Playbook', description: 'Template theo mục tiêu.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Clarity', description: 'OKR cá nhân / team rõ.' },
        { title: 'Momentum', description: 'Sprint 12 tuần có milestone.' },
        { title: 'Network', description: 'Alumni community (gói Pro).' },
      ],
    ],
    processSets: [
      [
        { title: 'Discovery call', description: 'Fit check 20 phút.' },
        { title: 'Program', description: 'Weekly session + homework.' },
        { title: 'Review', description: 'Retro KPI cuối chu kỳ.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Starter', price: '8.000.000đ', features: ['4 sessions'], highlighted: false },
        { name: 'Intensive', price: '22.000.000đ', features: ['12 sessions', 'Slack'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Client wins', 'Workshop', 'Behind sessions'],
    testimonialHeadlines: ['Coachee stories', 'Before / after mindset', 'LinkedIn rec'],
    guaranteeLines: ['Hoàn tiền sau session 1 nếu không phù hợp (theo policy).'],
    faqSets: [[{ question: 'Online hay offline?', answer: 'Mặc định online — offline theo yêu cầu.' }]],
    ctaHeadlines: ['Apply coaching', 'Book discovery', 'Xem methodology'],
  },
  consulting: {
    label: 'Tư vấn',
    offer: 'consulting engagement',
    heroAngles: [
      'Audit / engagement CTA',
      'Trust & credentials',
      'Retainer packages',
      'Engagement model',
      'Case gallery',
      'Thought leadership video',
      'FAQ engagement',
      'Nav practice areas',
      'Brief sớm',
      'Consult tối giản',
    ],
    featureSets: [
      [
        { title: 'Diagnostic', description: 'Workshop + data review.' },
        { title: 'Strategy', description: 'Roadmap 90 ngày.' },
        { title: 'Implementation support', description: 'PMO optional.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Partner-level', description: 'Consultant 10+ năm kinh nghiệm.' },
        { title: 'Industry focus', description: 'Playbook theo vertical.' },
        { title: 'Executive-ready', description: 'Deck board-level.' },
      ],
    ],
    processSets: [
      [
        { title: 'Scope', description: 'NDA + problem statement.' },
        { title: 'Analyze', description: 'Interviews + benchmark.' },
        { title: 'Deliver', description: 'Report + workshop handoff.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Diagnostic', price: '45.000.000đ', features: ['2 tuần'], highlighted: false },
        { name: 'Retainer', price: '55.000.000đ/th', features: ['Embedded'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Case snapshots', 'Workshop', 'Deliverables'],
    testimonialHeadlines: ['C-suite quote', 'Engagement feedback', 'Repeat client'],
    guaranteeLines: ['Confidentiality theo NDA chuẩn.'],
    faqSets: [[{ question: 'On-site?', answer: 'Hybrid — on-site theo scope và location.' }]],
    ctaHeadlines: ['Book audit', 'Request proposal', 'Download credentials'],
  },
  quote: {
    label: 'Báo giá',
    offer: 'yêu cầu báo giá',
    heroAngles: [
      'Gửi yêu cầu báo giá',
      'Trust trước form',
      'Pricing tham khảo',
      'Quy trình báo giá',
      'Portfolio tham chiếu',
      'Video giải thích scope',
      'FAQ báo giá',
      'Nav dịch vụ',
      'Form sớm',
      'Quote tối giản',
    ],
    featureSets: [
      [
        { title: 'Scope rõ', description: 'Brief form có checklist.' },
        { title: 'Timeline', description: 'Phản hồi 24–48h làm việc.' },
        { title: 'Minh bạch', description: 'Breakdown chi phí trong proposal.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Không spam', description: 'Chỉ liên hệ theo brief.' },
        { title: 'Tư vấn miễn phí', description: 'Call 15 phút làm rõ scope.' },
        { title: 'So sánh gói', description: 'Good / better / best.' },
      ],
    ],
    processSets: [
      [
        { title: 'Submit brief', description: 'Mô tả nhu cầu + budget range.' },
        { title: 'Clarify', description: 'Call / email Q&A.' },
        { title: 'Proposal', description: 'PDF báo giá + timeline.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Basic quote', price: 'Từ 5.000.000đ', features: ['Scope nhỏ'], highlighted: false },
        { name: 'Custom', price: 'Theo brief', features: ['Full scope'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['Project refs', 'Sample deliverable', 'Team'],
    testimonialHeadlines: ['Client on pricing', 'Speed of response', 'Transparency'],
    guaranteeLines: ['Báo giá có hiệu lực 14 ngày trừ thay đổi scope.'],
    faqSets: [[{ question: 'Có mất phí báo giá?', answer: 'Không — miễn phí cho brief chuẩn.' }]],
    ctaHeadlines: ['Nhận báo giá', 'Gửi brief', 'Talk to sales'],
  },
  ebook: {
    label: 'Ebook',
    offer: 'tài liệu / ebook',
    heroAngles: [
      'Download ebook miễn phí',
      'Trust & author cred',
      'Bonus stack pricing',
      'Chapter preview',
      'Preview gallery',
      'Book trailer',
      'FAQ download',
      'Nav chapters',
      'Form sớm',
      'Download tối giản',
    ],
    featureSets: [
      [
        { title: 'PDF + EPUB', description: 'Đọc mọi thiết bị.' },
        { title: 'Checklist kèm', description: 'Template actionable.' },
        { title: 'Update free', description: 'Bản 2.x cho người đăng ký.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Đọc 30 phút', description: 'Tóm tắt practical.' },
        { title: 'Case mini', description: 'Ví dụ VN context.' },
        { title: 'No spam', description: '1 email/tuần tối đa.' },
      ],
    ],
    processSets: [
      [
        { title: 'Opt-in', description: 'Email + consent.' },
        { title: 'Delivery', description: 'Link download instant.' },
        { title: 'Follow-up', description: 'Tips series optional.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Free', price: '0đ', features: ['PDF'], highlighted: true },
        { name: 'Bundle', price: '199.000đ', features: ['Video', 'Workbook'], highlighted: false },
      ],
    ],
    galleryHeadlines: ['Page preview', 'Cover mockup', 'Inside spread'],
    testimonialHeadlines: ['Reader review', 'Download count', 'Creator shoutout'],
    guaranteeLines: ['Unsubscribe 1 click mọi email.'],
    faqSets: [[{ question: 'Có bản in?', answer: 'Digital only — in tại nhà được.' }]],
    ctaHeadlines: ['Download ngay', 'Get free ebook', 'Nhận link PDF'],
  },
  demo: {
    label: 'Demo',
    offer: 'product demo',
    heroAngles: [
      'Book demo sản phẩm',
      'Logo khách hàng',
      'Plans overview',
      'Demo workflow',
      'UI gallery',
      'Product video',
      'FAQ demo',
      'Nav product',
      'Demo form sớm',
      'Demo tối giản',
    ],
    featureSets: [
      [
        { title: 'Live walkthrough', description: '30 phút theo use case bạn.' },
        { title: 'Q&A', description: 'Technical + pricing.' },
        { title: 'Trial setup', description: 'Sandbox sau demo nếu fit.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'No fluff', description: 'Demo theo script nhu cầu.' },
        { title: 'Recording', description: 'Gửi replay nếu cần.' },
        { title: 'Next steps rõ', description: 'Proposal / trial trong 48h.' },
      ],
    ],
    processSets: [
      [
        { title: 'Schedule', description: 'Chọn slot calendar.' },
        { title: 'Demo', description: 'Screen share + checklist.' },
        { title: 'Follow-up', description: 'Summary email + assets.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Team', price: 'Liên hệ', features: ['≤20 seats'], highlighted: false },
        { name: 'Enterprise demo', price: 'Custom', features: ['POC', 'Security review'], highlighted: true },
      ],
    ],
    galleryHeadlines: ['UI screens', 'Integration map', 'Mobile'],
    testimonialHeadlines: ['After demo feedback', 'POC wins', 'Customer logos'],
    guaranteeLines: ['Không bắt buộc mua sau demo.'],
    faqSets: [[{ question: 'Cần chuẩn bị gì?', answer: 'Brief use case + người quyết định nên tham dự.' }]],
    ctaHeadlines: ['Book demo', 'Schedule 30 min', 'See product live'],
  },
  lead_magnet: {
    label: 'Lead magnet',
    offer: 'tài nguyên miễn phí',
    heroAngles: [
      'Nhận checklist / template free',
      'Social proof download',
      'Value stack',
      '3 bước nhận tài liệu',
      'Preview asset',
      'Explainer video',
      'FAQ opt-in',
      'Nav resources',
      'Instant form',
      'Capture tối giản',
    ],
    featureSets: [
      [
        { title: 'PDF actionable', description: 'Làm theo được ngay.' },
        { title: 'Notion template', description: 'Duplicate 1 click.' },
        { title: 'Email course', description: '3 email / 3 ngày.' },
      ],
    ],
    benefitSets: [
      [
        { title: 'Zero fluff', description: 'Không ebook 100 trang vô ích.' },
        { title: 'Updated', description: 'Bản mới gửi lại subscriber.' },
        { title: 'Privacy', description: 'Không bán email.' },
      ],
    ],
    processSets: [
      [
        { title: 'Opt-in', description: 'Name + email.' },
        { title: 'Deliver', description: 'Redirect download page.' },
        { title: 'Nurture', description: 'Optional drip.' },
      ],
    ],
    pricingSets: [
      [
        { name: 'Free', price: '0đ', features: ['Checklist'], highlighted: true },
        { name: 'Pro pack', price: '99.000đ', features: ['Video', 'Slides'], highlighted: false },
      ],
    ],
    galleryHeadlines: ['Asset preview', 'Screenshot pages', 'Template thumb'],
    testimonialHeadlines: ['Downloader said', 'Share count', 'Marketer rec'],
    guaranteeLines: ['Unsubscribe anytime.'],
    faqSets: [[{ question: 'Bao lâu nhận file?', answer: 'Instant sau submit form.' }]],
    ctaHeadlines: ['Get free resource', 'Download checklist', 'Send me the template'],
  },
};

function pick<T>(arr: T[], index: number, fallback: T): T {
  return arr[index] ?? arr[index % Math.max(arr.length, 1)] ?? fallback;
}

/** Internal architecture hints (arrows, flow tokens) must not appear in catalog preview. */
function isInternalArchitectureHint(text: string): boolean {
  return /→|->|\+\s*\w|Portfolio\s*→|Audit\s*→|Hero\s*→|Nav\s*\+/i.test(text);
}

function resolveHeroSubheadline(
  lex: CategoryLexicon,
  idx: number,
  descriptionHint: string,
): string {
  if (lex.heroSubheadlines?.length) {
    return pick(lex.heroSubheadlines, idx, lex.heroSubheadlines[0]!);
  }
  if (!isInternalArchitectureHint(descriptionHint)) {
    return descriptionHint;
  }
  return `Giải pháp ${lex.offer} chuyên nghiệp — triển khai nhanh, KPI minh bạch.`;
}

export function buildCategoryDirectionCopy(input: {
  category: LandingPageCategory;
  architectureId: string;
  variantIndex: number;
  ctaStrategy: CtaStrategy;
  descriptionHint: string;
}): CategoryDirectionCopy | null {
  if (input.category === 'spa') return null;

  const lex = LEXICONS[input.category];
  if (!lex || !lex.heroAngles.length) return null;

  const idx = input.variantIndex;
  const cta = CTA_COPY[input.ctaStrategy];
  const heroHeadline = pick(lex.heroAngles, idx, lex.heroAngles[0]!);
  const features = pick(lex.featureSets, idx % lex.featureSets.length, lex.featureSets[0]!);
  const benefits = pick(lex.benefitSets, idx % lex.benefitSets.length, lex.benefitSets[0]!);
  const process = pick(lex.processSets, idx % lex.processSets.length, lex.processSets[0]!);
  const pricing = pick(lex.pricingSets, idx % lex.pricingSets.length, lex.pricingSets[0]!);
  const faq = pick(lex.faqSets, idx % lex.faqSets.length, lex.faqSets[0]!);

  return {
    hero: {
      headline: heroHeadline,
      subheadline: resolveHeroSubheadline(lex, idx, input.descriptionHint),
      body: '',
      ctaLabel: cta.ctaLabel,
    },
    featuresHeadline: `Điểm mạnh ${lex.label.toLowerCase()}`,
    features,
    benefitsHeadline: `Lợi ích khi chọn ${lex.offer}`,
    benefits,
    processHeadline: 'Quy trình rõ ràng',
    process,
    pricingHeadline: 'Gói & đầu tư',
    pricing,
    galleryHeadline: pick(lex.galleryHeadlines, idx, 'Gallery'),
    gallerySub:
      input.category === 'clinic'
        ? `Hình ảnh minh họa ${lex.offer} — quy trình, cơ sở và kết quả (đã che thông tin khi cần).`
        : `Campaign & portfolio ${lex.offer} — visual proof theo ngành.`,
    testimonialsHeadline: pick(lex.testimonialHeadlines, idx, 'Khách hàng nói gì'),
    testimonials: pick(lex.testimonialSets || [], idx % Math.max(1, (lex.testimonialSets || []).length), (lex.testimonialSets || [])[0]),
    guarantee: pick(lex.guaranteeLines, idx, lex.guaranteeLines[0]!),
    faq,
    formHeadline: cta.formHeadline,
    formSubmit: cta.formSubmit,
    ctaHeadline: pick(lex.ctaHeadlines, idx, lex.ctaHeadlines[0]!),
    ctaLabel: cta.ctaLabel,
    countdownHeadline: idx === 5 ? 'Ưu đãi có thời hạn' : undefined,
    countdownSub: idx === 5 ? 'Đăng ký trước deadline để nhận bonus' : undefined,
  };
}

function patchItems(
  items: Array<{ id: string; title?: string; description?: string }> | undefined,
  next: Array<{ title: string; description: string }> | undefined,
) {
  if (!items?.length || !next?.length) return items;
  return items.map((it, i) => {
    const src = next[i % next.length]!;
    return { ...it, title: src.title, description: src.description };
  });
}

function patchPlans(
  plans: Array<{ id: string; name?: string; price?: string; features?: string[]; highlighted?: boolean }> | undefined,
  next: CategoryDirectionCopy['pricing'] | undefined,
) {
  if (!plans?.length || !next?.length) return plans;
  return plans.map((p, i) => {
    const src = next[Math.min(i, next.length - 1)]!;
    return {
      ...p,
      name: src.name,
      price: src.price,
      features: src.features,
      highlighted: src.highlighted ?? p.highlighted,
    };
  });
}

function applyDirectionCopyToBlocks(
  architectureId: string,
  blocks: LandingPageBlock[],
  copy: CategoryDirectionCopy,
  category: LandingPageCategory,
): LandingPageBlock[] {
  let ctaIndex = 0;
  return blocks.map((block): LandingPageBlock => {
    switch (block.type) {
      case 'Hero':
        return {
          ...block,
          headline: copy.hero.headline,
          subheadline: copy.hero.subheadline,
          body: copy.hero.body?.trim() ? copy.hero.body : undefined,
          trustPoints:
            (block as { trustPoints?: string[] }).trustPoints?.length
              ? (block as { trustPoints?: string[] }).trustPoints
              : [
                  'Uy tín rõ ràng',
                  'Quy trình minh bạch',
                  'Hỗ trợ nhanh',
                ],
          ctaLabel: copy.hero.ctaLabel,
        };
      case 'Features':
        return {
          ...block,
          headline: copy.featuresHeadline,
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
      case 'Pricing':
        return {
          ...block,
          headline: copy.pricingHeadline || block.headline,
          plans: (patchPlans(block.plans, copy.pricing) || block.plans) as typeof block.plans,
        };
      case 'Gallery':
        return {
          ...block,
          headline: copy.galleryHeadline || block.headline,
          subheadline: copy.gallerySub || block.subheadline,
        };
      case 'Testimonials': {
        const items = block.items?.length
          ? block.items.map((it, i) => {
              const src = copy.testimonials?.[i % (copy.testimonials?.length || 1)];
              if (!src) return it;
              return {
                ...it,
                quote: src.quote,
                author: src.author,
                role: src.role,
              };
            })
          : block.items;
        return {
          ...block,
          headline: copy.testimonialsHeadline || block.headline,
          items: items as typeof block.items,
        };
      }
      case 'Guarantee':
        return copy.guarantee
          ? {
              ...block,
              headline: `Cam kết ${LEXICONS[category]?.label || category}`,
              body: copy.guarantee,
              subheadline: copy.guarantee,
            }
          : block;
      case 'FAQ':
        if (!copy.faq?.length) return block;
        return {
          ...block,
          items: copy.faq.map((f, i) => ({
            id: `${category}_faq_${i + 1}`,
            question: f.question,
            answer: f.answer,
          })),
        };
      case 'LeadForm':
        return {
          ...block,
          headline: copy.formHeadline,
          submitLabel: copy.formSubmit,
        };
      case 'CTA': {
        ctaIndex += 1;
        const second = ctaIndex > 1;
        return {
          ...block,
          headline: second ? `${copy.ctaHeadline} — tiếp theo` : copy.ctaHeadline,
          ctaLabel: copy.ctaLabel,
        };
      }
      case 'Countdown':
        return {
          ...block,
          headline: copy.countdownHeadline || block.headline,
          subheadline: copy.countdownSub || block.subheadline,
        };
      case 'Footer':
        return {
          ...block,
          headline: LEXICONS[category]?.label || block.headline,
          body: `Chuyên ${LEXICONS[category]?.offer || 'dịch vụ'} — liên hệ qua form hoặc hotline.`,
        };
      default:
        return block;
    }
  });
}

/** Apply category-specific direction copy (SPA delegates to spa-directions). */
export function applyCategoryDirectionCopy(
  category: LandingPageCategory,
  architectureId: string,
  blocks: LandingPageBlock[],
  meta?: {
    variantIndex?: number;
    ctaStrategy?: CtaStrategy;
    descriptionHint?: string;
  },
): LandingPageBlock[] {
  if (category === 'spa') {
    return applySpaDirectionCopy(architectureId, blocks);
  }
  if (category === 'agency' && isAgencyGoldArchitecture(architectureId)) {
    return applyAgencyGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'agency' && isAgencyDirectionArchitecture(architectureId)) {
    return applyAgencyDirectionCopy(architectureId, blocks);
  }
  if (category === 'clinic' && isClinicGoldArchitecture(architectureId)) {
    return applyClinicGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'saas' && isSaasGoldArchitecture(architectureId)) {
    return applySaasGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'saas' && isSaasDirectionArchitecture(architectureId)) {
    return applySaasDirectionCopy(architectureId, blocks);
  }
  if (category === 'clinic' && isClinicDirectionArchitecture(architectureId)) {
    return applyClinicDirectionCopy(architectureId, blocks);
  }
  if (category === 'service' && isServiceGoldArchitecture(architectureId)) {
    return applyServiceGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'service' && isServiceDirectionArchitecture(architectureId)) {
    return applyServiceDirectionCopy(architectureId, blocks);
  }
  if (category === 'consulting' && isConsultingGoldArchitecture(architectureId)) {
    return applyConsultingGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'consulting' && isConsultingDirectionArchitecture(architectureId)) {
    return applyConsultingDirectionCopy(architectureId, blocks);
  }
  if (category === 'seo' && isSeoGoldArchitecture(architectureId)) {
    return applySeoGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'seo' && isSeoDirectionArchitecture(architectureId)) {
    return applySeoDirectionCopy(architectureId, blocks);
  }
  if (category === 'website' && isWebsiteGoldArchitecture(architectureId)) {
    return applyWebsiteGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'website' && isWebsiteDirectionArchitecture(architectureId)) {
    return applyWebsiteDirectionCopy(architectureId, blocks);
  }
  if (category === 'product' && isProductGoldArchitecture(architectureId)) {
    return applyProductGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'product' && isProductDirectionArchitecture(architectureId)) {
    return applyProductDirectionCopy(architectureId, blocks);
  }
  if (category === 'fashion' && isFashionGoldArchitecture(architectureId)) {
    return applyFashionGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'fashion' && isFashionDirectionArchitecture(architectureId)) {
    return applyFashionDirectionCopy(architectureId, blocks);
  }
  if (category === 'cosmetics' && isCosmeticsGoldArchitecture(architectureId)) {
    return applyCosmeticsGoldDirectionCopy(architectureId, blocks);
  }
  if (category === 'cosmetics' && isCosmeticsDirectionArchitecture(architectureId)) {
    return applyCosmeticsDirectionCopy(architectureId, blocks);
  }

  const copy = buildCategoryDirectionCopy({
    category,
    architectureId,
    variantIndex: meta?.variantIndex ?? 0,
    ctaStrategy: meta?.ctaStrategy ?? 'consult',
    descriptionHint: meta?.descriptionHint ?? architectureId,
  });

  if (!copy) return blocks;
  return applyDirectionCopyToBlocks(architectureId, blocks, copy, category);
}
