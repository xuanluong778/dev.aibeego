import type { LandingPageThemeTokens } from '@marketingspa/shared';
import { LANDING_PAGE_THEME_PRESETS } from '@marketingspa/shared';
import type { LpSectionLibraryTemplate } from './landing-page-section-library-catalog';

const asset = (name: string) => `/landing-page-assets/section-library-v2/${name}.jpg`;
const fonts = '"SL2 Be Vietnam Pro", Arial, sans-serif';
const palettes = {
  indigo: {
    primary: '#4338ca',
    background: '#f5f7ff',
    surface: '#ffffff',
    surfaceAlt: '#eef2ff',
    text: '#172033',
    muted: '#475569',
    border: '#dce3f1',
  },
  forest: {
    primary: '#047857',
    background: '#f2f8f5',
    surface: '#ffffff',
    surfaceAlt: '#e5f2eb',
    text: '#14352c',
    muted: '#426156',
    border: '#d7e7df',
  },
  warm: {
    primary: '#9a3412',
    background: '#fffaf5',
    surface: '#ffffff',
    surfaceAlt: '#f8eee3',
    text: '#292524',
    muted: '#66574c',
    border: '#ebdfd3',
  },
  slate: {
    primary: '#1d4ed8',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceAlt: '#eef2f6',
    text: '#152238',
    muted: '#475569',
    border: '#dce3eb',
  },
  dark: {
    primary: '#a5f3d2',
    background: '#102a2c',
    surface: '#183a3b',
    surfaceAlt: '#204646',
    text: '#f4faf8',
    muted: '#c3d6d0',
    border: '#426560',
  },
} as const;

const benefits = [
  [
    'Bắt đầu rõ ràng',
    'Tập trung vào điều khách hàng cần, với thông tin dễ hiểu và bước tiếp theo cụ thể.',
  ],
  [
    'Đồng hành tận tâm',
    'Kết nối với đội ngũ để cùng lựa chọn giải pháp phù hợp với nhu cầu của bạn.',
  ],
  [
    'Chủ động mỗi bước',
    'Theo dõi tiến độ và nắm rõ những việc cần làm trong suốt quá trình triển khai.',
  ],
  [
    'Linh hoạt phát triển',
    'Điều chỉnh cách làm theo mục tiêu thực tế, từ khởi đầu nhỏ đến kế hoạch dài hạn.',
  ],
];
const features = [
  [
    'Thông tin tập trung',
    'Tập hợp thông tin khách hàng và lịch sử trao đổi trong một không gian làm việc rõ ràng.',
  ],
  [
    'Chăm sóc có kế hoạch',
    'Sắp xếp các bước theo dõi để đội ngũ luôn biết việc tiếp theo cần thực hiện.',
  ],
  [
    'Báo cáo dễ nắm bắt',
    'Quan sát kết quả chiến dịch và tìm những điểm có thể cải thiện từ dữ liệu thực tế.',
  ],
  [
    'Phối hợp thuận tiện',
    'Phân chia công việc và giữ các thành viên cùng cập nhật về mục tiêu chung.',
  ],
  [
    'Biểu mẫu linh hoạt',
    'Thu thập đúng thông tin cần thiết và tạo trải nghiệm đăng ký gọn gàng cho khách hàng.',
  ],
  [
    'Kết nối công cụ',
    'Xây dựng quy trình làm việc liền mạch cùng các công cụ doanh nghiệp đang sử dụng.',
  ],
];
const serviceCopy = [
  [
    'Tư vấn chiến lược',
    'Làm rõ mục tiêu, đối tượng khách hàng và hướng triển khai phù hợp với nguồn lực hiện tại.',
  ],
  [
    'Thiết kế trải nghiệm',
    'Sắp xếp thông điệp và hình ảnh để khách hàng dễ tìm hiểu, tin tưởng và hành động.',
  ],
  [
    'Triển khai đồng bộ',
    'Kết nối các bước thực hiện trong một kế hoạch có phạm vi và trách nhiệm rõ ràng.',
  ],
  [
    'Đo lường và tối ưu',
    'Theo dõi phản hồi thực tế, đánh giá kết quả và điều chỉnh những điểm cần cải thiện.',
  ],
  [
    'Đồng hành vận hành',
    'Hỗ trợ đội ngũ làm quen với quy trình và phát triển cách làm phù hợp theo thời gian.',
  ],
];
const steps = [
  ['Chia sẻ mục tiêu', 'Trao đổi về nhu cầu, khách hàng và những điều bạn muốn cải thiện.'],
  ['Thống nhất giải pháp', 'Cùng xác định phạm vi, cách làm và các ưu tiên quan trọng.'],
  ['Bắt đầu triển khai', 'Đưa kế hoạch vào thực tế với đầu việc và người phụ trách rõ ràng.'],
  ['Theo dõi kết quả', 'Đánh giá phản hồi, nhìn lại dữ liệu và điều chỉnh bước tiếp theo.'],
  ['Tiếp tục phát triển', 'Duy trì những điều hiệu quả và mở rộng khi đội ngũ sẵn sàng.'],
];
const productCopy = [
  [
    'Điểm nhấn cho mỗi ngày',
    'Đường nét tinh gọn, dễ phối hợp trong nhiều phong cách và hoạt động thường nhật.',
  ],
  [
    'Phong cách của riêng bạn',
    'Một lựa chọn để thể hiện cá tính qua những chi tiết vừa đủ, rõ ràng và hài hòa.',
  ],
  [
    'Lưu lại điều đáng nhớ',
    'Dành không gian cho những góc nhìn mới và những khoảnh khắc bạn muốn giữ lại.',
  ],
];
const faqs = [
  [
    'Tôi nên bắt đầu từ đâu?',
    'Hãy chia sẻ mục tiêu và nhu cầu của bạn qua biểu mẫu liên hệ. Đội ngũ sẽ cùng bạn làm rõ thông tin và đề xuất bước tiếp theo phù hợp.',
  ],
  [
    'Giải pháp có thể điều chỉnh theo nhu cầu không?',
    'Phạm vi triển khai được thống nhất sau khi trao đổi về tình hình thực tế, để các đầu việc phù hợp với nguồn lực và mục tiêu của bạn.',
  ],
  [
    'Tôi sẽ được tư vấn những thông tin gì?',
    'Bạn có thể trao đổi về cách tiếp cận, phạm vi công việc, kế hoạch thực hiện và các thông tin cần chuẩn bị trước khi bắt đầu.',
  ],
  [
    'Chi phí được xác định như thế nào?',
    'Chi phí phụ thuộc vào phạm vi và yêu cầu cụ thể. Các hạng mục, điều kiện và mức phí sẽ được làm rõ trong đề xuất trước khi bạn quyết định.',
  ],
  [
    'Làm thế nào để theo dõi tiến độ?',
    'Hai bên thống nhất đầu mối liên hệ và cách cập nhật trong quá trình triển khai, giúp bạn nắm được tiến độ và các việc cần phối hợp.',
  ],
  [
    'Tôi có thể trao đổi thêm trước khi quyết định không?',
    'Bạn có thể gửi câu hỏi hoặc đặt lịch trao đổi để hiểu rõ hơn về giải pháp và lựa chọn hướng đi phù hợp.',
  ],
];
const heroCopy: Record<string, [string, string, string, string | null]> = {
  'hero-01': [
    'Kết nối ý tưởng với cơ hội mới',
    'Giới thiệu giá trị bạn mang lại bằng một trải nghiệm rõ ràng, chỉn chu và dễ bắt đầu. Cùng tạo nên bước tiến tiếp theo cho doanh nghiệp.',
    'Khám phá giải pháp',
    'team',
  ],
  'hero-02': [
    'Để đội ngũ tập trung vào khách hàng',
    'Tập trung thông tin, kết nối các bước chăm sóc và theo dõi cơ hội bán hàng trong một quy trình rõ ràng.',
    'Khám phá giải pháp',
    'analytics',
  ],
  'hero-03': [
    'Một lựa chọn, nhiều dấu ấn riêng',
    'Khám phá những chi tiết được cân nhắc kỹ, để sản phẩm trở thành một phần tự nhiên trong cuộc sống của bạn.',
    'Khám phá bộ sưu tập',
    'watch',
  ],
  'hero-04': [
    'Cùng tạo nên điều đáng nhớ',
    'Từ những cuộc trao đổi đầu tiên đến trải nghiệm hoàn thiện, mỗi chi tiết đều góp phần kể câu chuyện thương hiệu của bạn.',
    'Tìm hiểu câu chuyện',
    'workspace',
  ],
  'hero-05': [
    'Không gian cho những ý tưởng lớn',
    'Một khởi đầu mới, một góc nhìn khác. Kết nối cùng đội ngũ để đưa ý tưởng của bạn thành kế hoạch có thể thực hiện.',
    'Kết nối với chúng tôi',
    'studio',
  ],
  'hero-06': [
    'Khởi đầu đơn giản. Tiến xa hơn.',
    'Tập trung vào điều quan trọng và xây dựng bước tiếp theo với một kế hoạch rõ ràng dành cho bạn.',
    'Bắt đầu trao đổi',
    null,
  ],
  'hero-07': [
    'Bước tiếp theo bắt đầu từ một cuộc trò chuyện',
    'Chia sẻ điều bạn đang tìm kiếm. Chúng tôi sẽ cùng bạn làm rõ nhu cầu và lựa chọn hướng đi phù hợp.',
    'Đặt lịch trao đổi',
    'meeting',
  ],
  'hero-08': [
    'Sự tận tâm trong từng trải nghiệm',
    'Lắng nghe nhu cầu và dành thời gian cho những điều quan trọng với bạn. Tìm hiểu dịch vụ và chọn thời gian trao đổi phù hợp.',
    'Tìm hiểu dịch vụ',
    'care',
  ],
  'hero-09': [
    'Những thiết kế dành cho phong cách riêng',
    'Khám phá các lựa chọn hài hòa giữa tính ứng dụng và dấu ấn cá nhân, cho mỗi ngày thêm cảm hứng.',
    'Xem bộ sưu tập',
    'fashion',
  ],
  'hero-10': [
    'Trải nghiệm chỉn chu, đồng hành trọn vẹn',
    'Một cách tiếp cận được cân nhắc kỹ, từ lắng nghe nhu cầu đến xây dựng giải pháp phù hợp với bạn.',
    'Đặt lịch tư vấn',
    'workspace',
  ],
  'hero-11': [
    'Từ dữ liệu rõ ràng đến quyết định tốt hơn',
    'Kết nối góc nhìn của đội ngũ và những thông tin cần thiết để chủ động hơn trong từng bước phát triển.',
    'Tìm hiểu thêm',
    'dashboard',
  ],
};

export function finishSectionLibraryTemplate(
  template: LpSectionLibraryTemplate,
): LpSectionLibraryTemplate {
  const t = template;
  const dark =
    t.id === 'hero-10' ||
    ['editorial-overlay', 'fullscreen-image'].includes(String(t.patch.variant)) ||
    t.id === 'cta-03' ||
    t.id === 'cta-04';
  const paletteName = dark
    ? 'dark'
    : ['services', 'process', 'lead', 'guarantee'].includes(t.category)
      ? 'forest'
      : ['product', 'image-content', 'gallery', 'testimonials'].includes(t.category)
        ? 'warm'
        : ['hero', 'features', 'pricing', 'countdown'].includes(t.category)
          ? 'indigo'
          : 'slate';
  const colors = palettes[paletteName];
  const tokens: LandingPageThemeTokens = {
    ...LANDING_PAGE_THEME_PRESETS.MINIMAL,
    ...colors,
    primary: colors.primary,
    button: colors.primary,
    secondary: colors.text,
    fontFamily: fonts,
    radius: '16px',
    buttonRadius: '10px',
    gradient: colors.background,
    shadow: '0 12px 36px rgba(15,23,42,.07)',
  };
  let patch: Record<string, any> = { ...t.patch, background: colors.background };
  let layout: string = String(patch.variant || 'default');
  let columns = t.thumb === 'cards-4' ? 4 : t.thumb === 'cards-2' ? 2 : 3;
  const rows = (copy: string[][], count: number, photos?: string[]) =>
    Array.from({ length: count }, (_, i) => ({
      id: `tpl-item-${i}`,
      title: copy[i % copy.length]![0],
      description: copy[i % copy.length]![1],
      ...(photos ? { imageUrl: asset(photos[i % photos.length]!) } : {}),
    }));
  if (t.category === 'hero' || patch.type === 'Hero' || t.blockType === 'Hero') {
    const copy = heroCopy[t.id] || [
      'Đưa ý tưởng vào trải nghiệm thực tế',
      'Một cách nhìn rõ ràng hơn về giải pháp, từ những chi tiết nhỏ đến giá trị bạn nhận được.',
      'Tìm hiểu giải pháp',
      t.id === 'imgc-05' ? 'collaboration' : 'laptop',
    ];
    patch = {
      ...patch,
      headline: copy[0],
      subheadline: copy[1],
      ctaLabel: copy[2],
      ctaUrl: '#lead-form',
      imageUrl: copy[3] ? asset(copy[3]) : null,
      trustPoints: ['Trao đổi rõ ràng', 'Giải pháp phù hợp', 'Đồng hành từng bước'],
    };
    if (t.id === 'hero-10') layout = 'premium-dark';
  }
  if (t.category === 'intro') {
    const intros: Record<string, [string, string]> = {
      'intro-01': [
        'Một lựa chọn phù hợp tạo nên khác biệt',
        'Khi mục tiêu được làm rõ và nhu cầu được lắng nghe, mỗi bước triển khai đều trở nên có ý nghĩa hơn.',
      ],
      'intro-02': [
        'Bắt đầu từ điều khách hàng quan tâm',
        'Chúng tôi tin vào những giải pháp dễ hiểu, những cuộc trao đổi thẳng thắn và sự chỉn chu trong từng chi tiết.',
      ],
      'intro-03': [
        'Ba điều làm nên một trải nghiệm tốt',
        'Thông tin rõ ràng, cách làm phù hợp và sự đồng hành giúp bạn tự tin hơn với lựa chọn của mình.',
      ],
      'intro-04': [
        'Kết nối đội ngũ trong một nhịp làm việc',
        'Từ thông tin khách hàng đến kế hoạch chăm sóc, tạo sự liền mạch để mọi người cùng nhìn về một mục tiêu.',
      ],
      'intro-05': [
        'Gần gũi từ lần trao đổi đầu tiên',
        'Lắng nghe điều bạn cần và dành thời gian để cùng tìm ra giải pháp phù hợp với hoàn cảnh thực tế.',
      ],
      'intro-06': [
        'Sẵn sàng cho bước phát triển tiếp theo?',
        'Làm rõ mục tiêu, kết nối đúng giải pháp và tạo một trải nghiệm khiến khách hàng muốn bắt đầu cùng bạn.',
      ],
    };
    patch.headline = intros[t.id]![0];
    patch.subheadline = intros[t.id]![1];
    patch.items = t.id === 'intro-03' ? rows(benefits, 3) : [];
    layout = t.id === 'intro-02' || t.id === 'intro-05' ? 'intro-left' : 'intro-center';
  }
  if (t.category === 'benefits') {
    patch.headline = 'Giá trị thiết thực trong từng bước';
    patch.subheadline = 'Những điều giúp bạn dễ bắt đầu, chủ động triển khai và tự tin phát triển.';
    patch.items = rows(
      benefits,
      patch.items.length,
      ['image-cards', 'alternating'].includes(patch.variant)
        ? ['team', 'meeting', 'planning']
        : undefined,
    );
    if (t.id === 'ben-07') columns = 2;
  }
  if (t.category === 'features') {
    patch.headline = 'Một nền tảng cho cách làm việc liền mạch';
    patch.subheadline =
      'Kết nối thông tin, con người và các bước thực hiện để đội ngũ tập trung vào điều quan trọng.';
    patch.items = rows(
      features,
      patch.items.length,
      ['image-cards', 'alternating'].includes(patch.variant)
        ? ['analytics', 'collaboration', 'laptop']
        : undefined,
    );
    if (patch.variant === 'minimal-list') columns = 2;
  }
  if (t.category === 'content') {
    patch.headline =
      t.id === 'txt-02'
        ? 'Một cách làm bắt đầu từ sự thấu hiểu'
        : 'Giải pháp tốt bắt đầu từ mục tiêu rõ ràng';
    patch.subheadline =
      'Mỗi doanh nghiệp có một câu chuyện, một nhóm khách hàng và một cách phát triển riêng. Chúng tôi dành thời gian lắng nghe trước khi đề xuất, để kế hoạch không chỉ rõ ràng mà còn phù hợp với những gì bạn đang cần.';
    patch.items = rows(
      [
        [
          'Hiểu đúng nhu cầu',
          'Làm rõ những ưu tiên, nguồn lực và mong muốn của bạn trước khi lựa chọn hướng đi.',
        ],
        [
          'Cùng thống nhất cách làm',
          'Một kế hoạch có phạm vi rõ ràng giúp đội ngũ phối hợp thuận tiện và chủ động hơn.',
        ],
        [
          'Điều chỉnh từ thực tế',
          'Theo dõi phản hồi và tiếp tục cải thiện để mỗi bước đi đều mang lại giá trị.',
        ],
        [
          'Phát triển bền vững',
          'Xây dựng cách làm phù hợp để những kết quả tốt có thể được duy trì theo thời gian.',
        ],
      ],
      patch.items.length,
    );
  }
  if (t.category === 'image-content' && t.blockType !== 'Hero') {
    patch.headline = 'Từ ý tưởng đến những kết nối có ý nghĩa';
    patch.subheadline =
      'Một góc nhìn rõ ràng hơn về cách chúng tôi lắng nghe, phối hợp và cùng bạn tạo ra giá trị.';
    patch.items = rows(
      [
        [
          'Lắng nghe để hiểu đúng',
          'Mỗi cuộc trao đổi giúp chúng tôi hiểu hơn về điều bạn cần và những ưu tiên quan trọng.',
        ],
        [
          'Kết nối những góc nhìn',
          'Tập hợp ý tưởng và kinh nghiệm của đội ngũ để cùng tìm ra cách tiếp cận phù hợp.',
        ],
        [
          'Chỉn chu trong từng bước',
          'Từ kế hoạch đến thực hiện, giữ sự rõ ràng trong công việc và nhất quán trong trải nghiệm.',
        ],
      ],
      patch.items.length,
      ['meeting', 'collaboration', 'workspace'],
    );
    if (['image-left', 'image-right'].includes(t.thumb)) layout = t.thumb;
    else if (t.id === 'imgc-06') layout = 'alternating';
  }
  if (t.category === 'gallery') {
    patch.headline = 'Một góc nhìn gần hơn';
    patch.subheadline =
      'Hình ảnh tham khảo về không gian làm việc, những cuộc kết nối và cảm hứng sáng tạo.';
    patch.items = rows(
      [
        ['Không gian cho ý tưởng', ''],
        ['Cùng nhau tìm lời giải', ''],
        ['Những cuộc trao đổi có ý nghĩa', ''],
        ['Cảm hứng từ điều giản dị', ''],
        ['Kết nối để tiến xa', ''],
        ['Một góc nhìn mới', ''],
      ],
      patch.items.length,
      ['workspace', 'meeting', 'collaboration', 'studio', 'team', 'laptop'],
    );
  }
  if (t.category === 'services') {
    patch.headline = 'Cùng bạn xây dựng bước tiến tiếp theo';
    patch.subheadline =
      'Từ định hướng đến triển khai, lựa chọn những hạng mục phù hợp với mục tiêu và nguồn lực của bạn.';
    patch.items = rows(
      serviceCopy,
      patch.items.length,
      patch.variant === 'image-cards' ? ['planning', 'workspace', 'collaboration'] : undefined,
    );
  }
  if (t.category === 'services' && t.blockType === 'Process')
    columns = Math.min(4, patch.items.length);
  if (t.category === 'product') {
    patch.headline = 'Được lựa chọn cho những trải nghiệm mỗi ngày';
    patch.subheadline =
      'Khám phá các thiết kế tinh gọn, dễ kết hợp và mang dấu ấn riêng trong từng chi tiết.';
    patch.items = rows(productCopy, patch.items.length, ['watch', 'eyewear', 'camera']);
  }
  if (t.blockType === 'Pricing') {
    patch.headline = 'Lựa chọn phù hợp với giai đoạn của bạn';
    patch.subheadline =
      'Khởi đầu với những gì cần thiết và mở rộng khi nhu cầu của đội ngũ thay đổi.';
    const names = ['Khởi đầu', 'Phát triển', 'Doanh nghiệp', 'Tùy chỉnh'];
    patch.plans = patch.plans.map((p: any, i: number) => ({
      ...p,
      name: names[i],
      features: [
        [
          'Không gian làm việc tập trung',
          'Biểu mẫu thu thập thông tin',
          'Theo dõi công việc cơ bản',
        ],
        [
          'Bao gồm các tính năng gói Khởi đầu',
          'Quy trình chăm sóc linh hoạt',
          'Báo cáo và phân tích chiến dịch',
        ],
        [
          'Bao gồm các tính năng gói Phát triển',
          'Phối hợp và phân quyền đội ngũ',
          'Tư vấn kế hoạch triển khai',
        ],
        [
          'Phạm vi theo nhu cầu doanh nghiệp',
          'Trao đổi yêu cầu tích hợp',
          'Kế hoạch đồng hành riêng',
        ],
      ][i],
      ctaLabel:
        i === 3 ? 'Trao đổi nhu cầu' : 'Chọn gói ' + (names[i] || 'Linh hoạt').toLowerCase(),
      ctaUrl: '#lead-form',
      highlighted: i === 1 && t.id !== 'price-03',
    }));
  }
  if (t.blockType === 'Testimonials') {
    patch.subheadline =
      'Những phản hồi minh họa cho cách lắng nghe, phối hợp và đồng hành trong mỗi hành trình.';
    patch.headline =
      t.category === 'stats'
        ? 'Những góc nhìn từ trải nghiệm đồng hành'
        : 'Mỗi trải nghiệm là một câu chuyện';
    patch.items = patch.items.map((it: any, i: number) => ({
      id: it.id,
      author: ['Minh Anh', 'Thanh Hà', 'Hoàng Nam'][i % 3],
      role: 'Phản hồi minh họa',
      quote: [
        'Điều chúng tôi đánh giá cao là cách đội ngũ lắng nghe và làm rõ từng bước trước khi bắt đầu.',
        'Thông tin được trình bày rõ ràng, giúp cả nhóm dễ phối hợp và chủ động hơn trong công việc.',
        'Một trải nghiệm chỉn chu từ những trao đổi ban đầu đến cách theo dõi các đầu việc trong quá trình triển khai.',
      ][i % 3],
      avatarUrl: null,
    }));
  }
  if (t.category === 'stats' && t.blockType !== 'Testimonials') {
    patch.headline = 'Nhìn rõ từng phần của hành trình';
    patch.subheadline = 'Kết nối những nền tảng quan trọng để xây dựng một cách làm nhất quán.';
    patch.items = rows(
      [
        ['01', 'Một mục tiêu chung'],
        ['02', 'Những góc nhìn kết nối'],
        ['03', 'Các bước thực hiện rõ ràng'],
        ['04', 'Dữ liệu để tiếp tục cải thiện'],
      ],
      patch.items.length,
    );
    columns = patch.items.length;
    layout = 'stats';
  }
  if (t.category === 'process') {
    patch.headline = 'Từ cuộc trò chuyện đầu tiên đến kế hoạch rõ ràng';
    patch.subheadline =
      'Một hành trình có định hướng, để bạn biết điều gì sẽ diễn ra và cần chuẩn bị những gì.';
    patch.items = rows(steps, patch.items.length);
    columns = Math.min(4, patch.items.length);
  }
  if (t.id === 'proc-04') layout = 'timeline';
  if (t.blockType === 'FAQ') {
    patch.headline = 'Những điều bạn có thể muốn biết';
    patch.items = faqs
      .slice(0, patch.items.length)
      .map((x, i) => ({ id: `tpl-question-${i}`, question: x[0], answer: x[1] }));
    columns = patch.variant === 'two-column' ? 2 : 1;
  }
  if (t.blockType === 'LeadForm') {
    patch.headline =
      t.id === 'lead-04' ? 'Chọn thời gian để cùng trao đổi' : 'Cùng tìm giải pháp phù hợp với bạn';
    patch.subheadline =
      'Để lại thông tin và điều bạn đang quan tâm. Đội ngũ sẽ tiếp nhận để cùng bạn trao đổi về bước tiếp theo.';
    patch.submitLabel = 'Gửi lời nhắn';
    patch.successMessage = 'Cảm ơn bạn đã kết nối. Chúng tôi đã nhận được thông tin của bạn.';
    patch.footerText = 'Thông tin được sử dụng để liên hệ về nhu cầu bạn đã chia sẻ.';
  }
  if (t.blockType === 'CTA') {
    patch.headline = 'Bước tiếp theo bắt đầu từ bạn';
    patch.subheadline =
      'Chia sẻ mục tiêu để cùng tìm ra một cách tiếp cận rõ ràng và phù hợp với nhu cầu của doanh nghiệp.';
    patch.ctaLabel = 'Cùng trao đổi';
    patch.ctaUrl = '#lead-form';
    patch.imageUrl = t.id === 'cta-04' ? asset('team') : null;
  }
  if (t.blockType === 'Guarantee') {
    patch.headline = 'Rõ ràng để bạn tự tin bắt đầu';
    patch.body =
      'Lắng nghe nhu cầu, thống nhất phạm vi và trao đổi minh bạch trước mỗi bước triển khai. Chúng tôi trân trọng sự tin tưởng và giữ trách nhiệm trong từng đầu việc.';
    patch.ctaLabel = 'Trao đổi cùng đội ngũ';
    patch.ctaUrl = '#lead-form';
  }
  if (t.blockType === 'Video') {
    delete patch.subheadline;
    patch.headline =
      t.id === 'vid-02' ? 'Một góc nhìn ngắn về cách làm việc' : 'Kết nối để tạo nên bước tiến mới';
    patch.videoUrl = '/landing-page-assets/section-library-v2/overview.mp4';
    patch.posterUrl = '/landing-page-assets/section-library-v2/video-poster.svg';
  }
  if (t.blockType === 'Countdown') {
    patch.headline = 'Dành thời gian cho bước tiếp theo';
    patch.subheadline =
      'Đăng ký lịch trao đổi trong thời gian tiếp nhận để cùng làm rõ nhu cầu và kế hoạch phù hợp.';
    patch.expireMessage = 'Đợt đăng ký này đã khép lại. Bạn vẫn có thể liên hệ để trao đổi thêm.';
    patch.expireCtaLabel = 'Liên hệ đội ngũ';
    patch.expireCtaUrl = '#lead-form';
  }
  return {
    ...t,
    patch,
    previewTheme: dark ? 'PREMIUM' : 'MINIMAL',
    previewTokens: tokens,
    designFamily: 'conversion',
    presentation: {
      revision: 2,
      category: t.category,
      layout,
      columns,
      sourceVariant: String(patch.variant || 'default'),
      tone: dark ? 'dark' : 'light',
    },
    description: `${t.composition} · ${dark ? 'Nền tối' : 'Nền sáng'} · Bản hoàn thiện`,
    tags: [...t.tags, paletteName, 'curated-v2'],
  };
}
