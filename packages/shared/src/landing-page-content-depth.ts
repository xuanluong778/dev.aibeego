/** Buyer-facing fallback copy. Only the brief supplies commercial facts. */
export type DetailPair = { title: string; description: string };
export type DepthBriefInput = {
  productService: string;
  brandName?: string;
  price?: string;
  targetCustomer: string;
  uspBenefits?: string;
  pageGoal?: 'lead' | 'sales' | 'signup' | 'consult' | 'event';
  extraNotes?: string;
  businessType?: string;
  painPoint?: string;
  offer?: string;
  tone?: 'professional' | 'bold' | 'friendly';
  ctaLabel?: string;
  guarantee?: string;
};

export function splitCopyChunks(text: string, _min = 0, max = 6): string[] {
  return [
    ...new Set(
      String(text || '')
        .split(/[;\n|•]+|\.\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 4),
    ),
  ].slice(0, max);
}
export function deepenBenefitPairs(
  titles: string[],
  details: string[] | undefined,
  _pain: string[],
  _audience: string,
  usp: string,
): DetailPair[] {
  return titles
    .slice(0, 8)
    .map((title, i) => ({
      title: title.slice(0, 120),
      description: (details?.[i] || (i === 0 ? usp : '')).slice(0, 280),
    }));
}
export function deepenFeaturePairs(
  titles: string[],
  details: string[] | undefined,
  _usp: string,
  _offer: string,
): DetailPair[] {
  return titles
    .slice(0, 8)
    .map((title, i) => ({
      title: title.slice(0, 120),
      description: (details?.[i] || '').slice(0, 280),
    }));
}
export function deepenProcessPairs(
  _titles: string[],
  steps: DetailPair[] | undefined,
  _features: string[],
  _goal: string,
  _audience: string,
): DetailPair[] {
  return (
    steps?.length
      ? steps
      : [
          {
            title: 'Chia sẻ nhu cầu',
            description: 'Cho biết điều bạn đang quan tâm và cách liên hệ phù hợp.',
          },
          {
            title: 'Trao đổi phương án',
            description: 'Làm rõ phạm vi, chi phí và các thông tin cần thiết trước khi quyết định.',
          },
          {
            title: 'Xác nhận bước tiếp theo',
            description: 'Chọn phương án phù hợp sau khi đã nắm rõ thông tin.',
          },
        ]
  )
    .slice(0, 6)
    .map((s) => ({ title: s.title.slice(0, 120), description: s.description.slice(0, 280) }));
}

const TOPICS: Array<{
  test: RegExp;
  topics: [string, string, string, string];
  details: [string, string, string, string];
}> = [
  {
    test: /spa|clinic|phòng khám|chăm sóc|nha khoa|skincare|thẩm mỹ/,
    topics: [
      'Nhu cầu của bạn',
      'Tìm hiểu dịch vụ',
      'Lựa chọn phù hợp',
      'Trao đổi trước khi đặt lịch',
    ],
    details: [
      'Chia sẻ tình trạng và điều bạn mong muốn cải thiện.',
      'Tìm hiểu nội dung dịch vụ và những điều cần chuẩn bị.',
      'Trao đổi về lựa chọn phù hợp với nhu cầu cá nhân.',
      'Hỏi rõ chi phí và lịch hẹn trước khi xác nhận.',
    ],
  },
  {
    test: /saas|software|phần mềm|crm|platform/,
    topics: [
      'Nhu cầu của đội ngũ',
      'Chức năng cần dùng',
      'Phương án triển khai',
      'Chi phí sử dụng',
    ],
    details: [
      'Xác định công việc và quy mô đội ngũ cần hỗ trợ.',
      'Trao đổi về các chức năng bạn cần cho công việc hằng ngày.',
      'Tìm hiểu cách bắt đầu phù hợp với hệ thống đang sử dụng.',
      'Làm rõ phạm vi sử dụng trước khi lựa chọn phương án.',
    ],
  },
  {
    test: /course|khóa học|đào tạo|coaching|học/,
    topics: ['Mục tiêu học tập', 'Nội dung quan tâm', 'Hình thức tham gia', 'Thông tin đăng ký'],
    details: [
      'Chia sẻ kiến thức hiện có và mục tiêu bạn muốn hướng đến.',
      'Tìm hiểu nội dung phù hợp với mục tiêu của bạn.',
      'Trao đổi về lịch và hình thức học trước khi đăng ký.',
      'Kiểm tra học phí và các điều kiện tham gia.',
    ],
  },
  {
    test: /restaurant|nhà hàng|ẩm thực|cafe|quán ăn/,
    topics: ['Dịp gặp gỡ', 'Món ăn quan tâm', 'Số lượng khách', 'Thông tin đặt bàn'],
    details: [
      'Chia sẻ dịp dùng bữa và không gian bạn đang tìm kiếm.',
      'Trao đổi về thực đơn và các yêu cầu ăn uống riêng.',
      'Cho biết số người dự kiến để tìm phương án phù hợp.',
      'Xác nhận thời gian và chi phí trước khi đặt bàn.',
    ],
  },
  {
    test: /real_estate|bất động sản|căn hộ|nhà đất/,
    topics: ['Nhu cầu tìm kiếm', 'Thông tin dự án', 'Ngân sách dự kiến', 'Lịch trao đổi'],
    details: [
      'Xác định nhu cầu ở hoặc đầu tư cùng khu vực quan tâm.',
      'Yêu cầu thông tin cụ thể về sản phẩm bạn đang xem xét.',
      'Trao đổi ngân sách để khoanh vùng lựa chọn phù hợp.',
      'Để lại thông tin để trao đổi chi tiết trước khi quyết định.',
    ],
  },
  {
    test: /product|fashion|cosmetics|sản phẩm|thời trang|mỹ phẩm/,
    topics: ['Nhu cầu sử dụng', 'Thông tin sản phẩm', 'Lựa chọn của bạn', 'Cách đặt hàng'],
    details: [
      'Xác định mục đích sử dụng trước khi lựa chọn.',
      'Tìm hiểu đặc điểm và thông tin được cung cấp về sản phẩm.',
      'Trao đổi yêu cầu cụ thể để chọn phương án phù hợp.',
      'Hỏi rõ giá và điều kiện mua hàng trước khi xác nhận.',
    ],
  },
];

export function buildDeepFallbackNarrative(brief: DepthBriefInput) {
  const product = brief.productService.trim();
  const brand = brief.brandName?.trim() || product;
  const audience = brief.targetCustomer.trim();
  const topic = TOPICS.find((t) =>
    t.test.test(`${brief.businessType || ''} ${product}`.toLowerCase()),
  );
  const topics = topic?.topics || [
    'Nhu cầu thực tế',
    'Phạm vi công việc',
    'Phương án phù hợp',
    'Bước tiếp theo',
  ];
  const descriptions = topic?.details || [
    'Chia sẻ điều bạn cần giải quyết và kết quả mong muốn.',
    'Làm rõ những hạng mục bạn cần trước khi lựa chọn.',
    'Trao đổi về lựa chọn phù hợp với ngân sách và nhu cầu.',
    'Xác nhận thông tin cần thiết trước khi bắt đầu.',
  ];
  const supplied = splitCopyChunks(brief.uspBenefits || '', 0, 4);
  const usp = (brief.uspBenefits || `${product} dành cho ${audience}.`).slice(0, 240);
  const cta =
    brief.ctaLabel?.trim() ||
    (brief.pageGoal === 'event'
      ? 'Đăng ký tham dự'
      : brief.pageGoal === 'signup'
        ? 'Đăng ký nhận thông tin'
        : brief.pageGoal === 'sales'
          ? 'Hỏi về sản phẩm'
          : 'Trao đổi nhu cầu');
  return {
    headline: (brand === product ? product : `${product} tại ${brand}`).slice(0, 100),
    subheadline:
      `${product} dành cho ${audience}. ${brief.painPoint ? `Bạn đang quan tâm đến ${brief.painPoint.replace(/[.!?]+$/, '')}? ` : ''}Trao đổi cùng ${brand} để tìm lựa chọn phù hợp.`.slice(
        0,
        320,
      ),
    painPoints: [brief.painPoint || `Tìm ${product.toLowerCase()} phù hợp với nhu cầu của bạn`],
    usp,
    benefits: supplied.length >= 2 ? supplied.map((s) => s.slice(0, 100)) : topics.slice(),
    benefitDetails: supplied.length >= 2 ? supplied.map(() => '') : descriptions.slice(),
    features: [product.slice(0, 100)],
    featureDetails: [usp],
    processSteps: deepenProcessPairs([], undefined, [], '', ''),
    faq: [
      {
        question: 'Dịch vụ này phù hợp với ai?',
        answer:
          `${product} dành cho ${audience}. Hãy chia sẻ nhu cầu cụ thể để trao đổi thêm.`.slice(
            0,
            600,
          ),
      },
      {
        question: 'Chi phí được tính thế nào?',
        answer: brief.price
          ? `Giá được cung cấp: ${brief.price}.${brief.offer ? ` ${brief.offer}` : ''}`
          : `Liên hệ ${brand} để hỏi về chi phí và phạm vi phù hợp trước khi quyết định.`,
      },
      {
        question: 'Tôi bắt đầu như thế nào?',
        answer:
          `Chọn “${cta}” và gửi thông tin liên hệ hoặc sử dụng kênh liên hệ trên trang để trao đổi với ${brand}.`.slice(
            0,
            600,
          ),
      },
    ],
    guarantee: brief.guarantee?.trim() || '',
    pricingCopy:
      [brief.price, brief.offer].filter(Boolean).join(' · ') ||
      `Trao đổi với ${brand} về nhu cầu và chi phí phù hợp.`,
    leadFormHeadline:
      brief.pageGoal === 'event'
        ? 'Đăng ký tham dự'
        : brief.pageGoal === 'signup'
          ? 'Đăng ký nhận thông tin'
          : 'Cùng trao đổi nhu cầu',
    cta,
  };
}
