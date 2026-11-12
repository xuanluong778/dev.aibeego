/** Pre-draft field assistance: suggestions never create or modify a landing page. */
import { z } from 'zod';
import { LP_INTERNAL_COPY_PATTERN, LP_PLACEHOLDER_PATTERN } from './landing-page-ai-draft';
export const LANDING_PAGE_BRIEF_SUGGEST_FIELDS = [
  'targetCustomer',
  'painPoint',
  'uspBenefits',
] as const;
export type LandingPageBriefSuggestField = (typeof LANDING_PAGE_BRIEF_SUGGEST_FIELDS)[number];
export const landingPageBriefSuggestInputSchema = z.object({
  field: z.enum(LANDING_PAGE_BRIEF_SUGGEST_FIELDS),
  businessType: z.string().max(80).optional().default(''),
  brandName: z.string().max(120).optional().default(''),
  productService: z.string().max(200).optional().default(''),
  targetCustomer: z.string().max(400).optional().default(''),
  painPoint: z.string().max(400).optional().default(''),
  uspBenefits: z.string().max(800).optional().default(''),
  pageGoal: z.enum(['lead', 'sales', 'signup', 'consult', 'event']).optional().default('lead'),
});
export type LandingPageBriefSuggestInput = z.infer<typeof landingPageBriefSuggestInputSchema>;
export type LandingPageBriefSuggestResponse = {
  field: LandingPageBriefSuggestField;
  options: [string, string, string];
  source: 'ai' | 'fallback';
  warning?: string;
};
export const LANDING_PAGE_BRIEF_SUGGEST_LABELS: Record<LandingPageBriefSuggestField, string> = {
  targetCustomer: 'Khách hàng mục tiêu',
  painPoint: 'Vấn đề khách hàng cần giải quyết',
  uspBenefits: 'Điểm khác biệt / lợi ích thực tế',
};
export function normalizeLandingPageBriefSuggestInput(raw: unknown): LandingPageBriefSuggestInput {
  const value = landingPageBriefSuggestInputSchema.parse(raw);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, entry.trim()]),
  ) as LandingPageBriefSuggestInput;
}
export function validateLandingPageBriefSuggestions(
  raw: unknown,
  input: LandingPageBriefSuggestInput,
): [string, string, string] {
  const maximum = input.field === 'uspBenefits' ? 800 : 400;
  const result = z
    .object({ options: z.array(z.string().trim().min(8).max(maximum)).length(3) })
    .strict()
    .parse(raw);
  const normalized = result.options.map((option) => option.toLowerCase().replace(/\s+/g, ' '));
  if (new Set(normalized).size !== 3) throw new Error('BRIEF_SUGGEST_DUPLICATE');
  const facts = [
    input.businessType,
    input.brandName,
    input.productService,
    input.targetCustomer,
    input.painPoint,
    input.uspBenefits,
  ]
    .join(' ')
    .toLowerCase();
  for (const option of result.options) {
    if (
      LP_INTERNAL_COPY_PATTERN.test(option) ||
      LP_PLACEHOLDER_PATTERN.test(option) ||
      /<\/?[a-z][^>]*>|https?:\/\//i.test(option)
    )
      throw new Error('BRIEF_SUGGEST_INVALID_TEXT');
    for (const number of option.matchAll(
      /\d[\d.,]*(?:\s*(?:%|₫|đồng|vnđ|vnd|triệu|tỷ|ngày|giờ|năm|sao))?/gi,
    )) {
      if (!facts.includes(number[0].toLowerCase()))
        throw new Error('BRIEF_SUGGEST_UNSUPPORTED_NUMBER');
    }
    for (const claim of option.matchAll(
      /miễn phí|cam kết|đảm bảo|bảo hành|hoàn tiền|chứng nhận|chứng chỉ|hàng đầu|tốt nhất|duy nhất|ISO|FDA/gi,
    )) {
      if (!facts.includes(claim[0].toLowerCase()))
        throw new Error('BRIEF_SUGGEST_UNSUPPORTED_CLAIM');
    }
    if (input.field === 'uspBenefits') {
      for (const capability of option.matchAll(
        /dễ sử dụng|tích hợp|tự động|tiết kiệm|nâng cao|tối ưu|phân chia nhiệm vụ|theo dõi tiến độ/gi,
      )) {
        if (!facts.includes(capability[0].toLowerCase()))
          throw new Error('BRIEF_SUGGEST_UNSUPPORTED_CAPABILITY');
      }
    }
  }
  return result.options as [string, string, string];
}
export function fallbackLandingPageBriefSuggestions(
  input: LandingPageBriefSuggestInput,
): [string, string, string] {
  const product = input.productService.slice(0, 120) || 'dịch vụ đang quan tâm';
  const audience = input.targetCustomer.slice(0, 140) || 'khách hàng đang tìm giải pháp phù hợp';
  const digital = /saas|website|agency|seo|phần mềm|website|online|công nghệ|tự động/i.test(
    `${input.businessType} ${product}`,
  );
  const care = /spa|clinic|cosmetics|chăm sóc|sắc đẹp|nha khoa/i.test(
    `${input.businessType} ${product}`,
  );
  const education = /course|coaching|webinar|khóa học|đào tạo/i.test(
    `${input.businessType} ${product}`,
  );
  let options: string[];
  if (input.field === 'targetCustomer') {
    options = digital
      ? [
          `Chủ doanh nghiệp nhỏ cần tìm ${product.toLowerCase()} phù hợp với hoạt động kinh doanh.`,
          `Các shop bán hàng online muốn tìm hiểu ${product.toLowerCase()} cho công việc hằng ngày.`,
          `Đội ngũ kinh doanh và vận hành đang cân nhắc ${product.toLowerCase()} theo nhu cầu thực tế.`,
        ]
      : care
        ? [
            `Khách hàng đang tìm hiểu ${product.toLowerCase()} phù hợp với nhu cầu cá nhân.`,
            'Người muốn được trao đổi kỹ về lựa chọn dịch vụ trước khi đặt lịch.',
            'Khách hàng quan tâm đến nội dung dịch vụ và chi phí trước khi quyết định.',
          ]
        : education
          ? [
              `Người có nhu cầu tìm hiểu ${product.toLowerCase()} để phục vụ mục tiêu học tập.`,
              'Người muốn xem xét nội dung và hình thức tham gia phù hợp với công việc.',
              'Người đang tìm lựa chọn phù hợp với kiến thức hiện có và thời gian tham gia.',
            ]
          : [
              `Khách hàng đang tìm ${product.toLowerCase()} phù hợp với nhu cầu của mình.`,
              `Người muốn tìm hiểu thông tin và chi phí của ${product.toLowerCase()} trước khi quyết định.`,
              `Khách hàng cần trao đổi yêu cầu cụ thể trước khi lựa chọn ${product.toLowerCase()}.`,
            ];
  } else if (input.field === 'painPoint') {
    options = [
      `${audience} khó lựa chọn ${product.toLowerCase()} vì chưa rõ phương án nào phù hợp với nhu cầu.`,
      `Khách hàng mất thời gian so sánh thông tin về ${product.toLowerCase()} nhưng vẫn chưa đủ cơ sở để quyết định.`,
      `Khách hàng cần làm rõ phạm vi, chi phí và cách bắt đầu với ${product.toLowerCase()} trước khi lựa chọn.`,
    ];
  } else if (input.uspBenefits.trim()) {
    const existing = input.uspBenefits.trim();
    options = [existing, `${product}: ${existing}`, `Dành cho ${audience}: ${existing}`];
  } else {
    options = [
      `${product} dành cho ${audience}.`,
      `Tập trung vào nhu cầu ${product.toLowerCase()} của ${audience}.`,
      `Định hướng ${product.toLowerCase()} theo những điều ${audience} đang quan tâm.`,
    ];
  }
  const maximum = input.field === 'uspBenefits' ? 800 : 400;
  return options.map((option) => option.slice(0, maximum)) as [string, string, string];
}
