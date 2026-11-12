import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageTemplateDefinition,
} from './landing-page-types';
import {
  buildRestaurantRepresentative,
  isRestaurantMenuRepresentative,
} from './landing-page-restaurant-representative';
import {
  buildLocalServiceRepresentative,
  isLocalServiceRepresentative,
} from './landing-page-local-service-representative';
import { buildArchitectureRecipe } from './landing-page-template-foundation';

type Recipe = {
  direction: string;
  label: string;
  purpose: string;
  headline: string;
  sequence: LandingPageBlock['type'][];
};
export const RESTAURANT_VARIANTS: Record<string, Recipe> = {
  'restaurant-promo': {
    direction: 'standard',
    label: 'Nhà hàng',
    purpose: 'Thực đơn, không gian và yêu cầu đặt bàn',
    headline: '',
    sequence: [],
  },
  'restaurant-promo-trust': {
    direction: 'chef-story',
    label: 'Câu chuyện bếp',
    purpose: 'Làm rõ cách chọn món và chuẩn bị bữa ăn; không giả hồ sơ đầu bếp',
    headline: 'Hiểu bữa ăn từ những điều phía sau.',
    sequence: ['Header', 'Hero', 'Features', 'Gallery', 'FAQ', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-pricing': {
    direction: 'set-menu',
    label: 'Set menu',
    purpose: 'So sánh cách chọn món cho bàn nhỏ và nhóm trước khi yêu cầu đặt bàn',
    headline: 'Chọn cách dùng bữa phù hợp với bàn của bạn.',
    sequence: ['Header', 'Hero', 'Pricing', 'Product', 'FAQ', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-process': {
    direction: 'dining-flow',
    label: 'Trải nghiệm bữa ăn',
    purpose: 'Timeline chuẩn bị cuộc hẹn và nhu cầu của bàn',
    headline: 'Một cuộc hẹn, chuẩn bị theo từng bước.',
    sequence: ['Header', 'Hero', 'Process', 'Benefits', 'Gallery', 'LeadForm', 'FAQ', 'Footer'],
  },
  'restaurant-promo-gallery': {
    direction: 'food-gallery',
    label: 'Món & không gian',
    purpose: 'Thư viện hình minh họa mở đầu, thực đơn sau khi xem cảm hứng',
    headline: 'Tìm cảm hứng cho bữa ăn sắp tới.',
    sequence: ['Header', 'Gallery', 'Hero', 'Product', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-video': {
    direction: 'kitchen-story',
    label: 'Chuyện trong bếp',
    purpose: 'Nội dung giới thiệu bếp có slot video thật khi được bổ sung',
    headline: 'Một góc nhìn gần hơn về bữa ăn.',
    sequence: ['Header', 'Hero', 'Video', 'Product', 'Gallery', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-faq': {
    direction: 'booking-faq',
    label: 'Hỏi đáp đặt bàn',
    purpose: 'Giải đáp về số khách, giờ, dị ứng và xác nhận trước yêu cầu đặt bàn',
    headline: 'Làm rõ nhu cầu trước khi giữ chỗ.',
    sequence: ['Header', 'Hero', 'FAQ', 'Benefits', 'Product', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-split': {
    direction: 'menu-guide',
    label: 'Hướng dẫn thực đơn',
    purpose: 'Ảnh bên trái, thực đơn dạng danh mục và không gian xen kẽ',
    headline: 'Từ món bạn thích đến bàn bạn muốn.',
    sequence: ['Header', 'Hero', 'Product', 'Gallery', 'Process', 'LeadForm', 'Footer'],
  },
  'restaurant-promo-form': {
    direction: 'early-reserve',
    label: 'Yêu cầu đặt bàn sớm',
    purpose: 'Form ngày/giờ/số khách ngay sau hero, thực đơn để tham khảo phía dưới',
    headline: 'Chia sẻ kế hoạch dùng bữa của bạn.',
    sequence: ['Header', 'Hero', 'LeadForm', 'Product', 'Gallery', 'Process', 'Footer'],
  },
  'restaurant-promo-minimal': {
    direction: 'quick-reserve',
    label: 'Đặt bàn tối giản',
    purpose: 'Trang ngắn với thực đơn gọn và một hành động yêu cầu đặt bàn',
    headline: 'Hẹn nhau bên bàn ăn.',
    sequence: ['Header', 'Hero', 'Product', 'LeadForm', 'Footer'],
  },
};
export const LOCAL_SERVICE_VARIANTS: Record<string, Recipe> = {
  'local-service': {
    direction: 'standard',
    label: 'Dịch vụ địa phương',
    purpose: 'Hạng mục, khu vực, phạm vi và yêu cầu trao đổi',
    headline: '',
    sequence: [],
  },
  'local-service-neighborhood-trust': {
    direction: 'neighborhood-trust',
    label: 'Phạm vi minh bạch',
    purpose: 'Checklist kiểm tra đơn vị và phạm vi, không dùng đánh giá khách hàng giả',
    headline: 'Rõ đầu mối, rõ phạm vi trước khi hẹn.',
    sequence: ['Header', 'Hero', 'Benefits', 'Features', 'FAQ', 'LeadForm', 'Footer'],
  },
  'local-service-package-pro': {
    direction: 'package-scope',
    label: 'Phạm vi gói việc',
    purpose: 'Bảng đối chiếu gói việc và chi phí cần được xác nhận',
    headline: 'Chọn phạm vi việc trước khi nhận đề xuất.',
    sequence: ['Header', 'Hero', 'Pricing', 'Features', 'FAQ', 'LeadForm', 'Footer'],
  },
  'local-service-work-process': {
    direction: 'work-process',
    label: 'Quy trình triển khai',
    purpose: 'Timeline dọc và đầu việc theo từng mốc',
    headline: 'Biết mỗi bước cần thống nhất điều gì.',
    sequence: ['Header', 'Hero', 'Process', 'Features', 'Benefits', 'FAQ', 'LeadForm', 'Footer'],
  },
  'local-service-job-proof': {
    direction: 'job-gallery',
    label: 'Hồ sơ hạng mục',
    purpose: 'Hình minh họa từng hạng mục, không giả công trình đã thi công',
    headline: 'Xem hạng mục để mô tả việc cần làm.',
    sequence: ['Header', 'Gallery', 'Hero', 'Features', 'Benefits', 'LeadForm', 'Footer'],
  },
  'local-service-team-video': {
    direction: 'team-intro',
    label: 'Giới thiệu cách làm',
    purpose: 'Slot video giới thiệu và checklist chuẩn bị, không giả danh đội ngũ',
    headline: 'Hiểu cách phối hợp trước khi gọi dịch vụ.',
    sequence: ['Header', 'Hero', 'Video', 'Process', 'Features', 'FAQ', 'LeadForm', 'Footer'],
  },
  'local-service-faq-booking': {
    direction: 'scope-faq',
    label: 'FAQ trước lịch hẹn',
    purpose: 'Giải đáp chi phí, vật tư, khảo sát và bảo hành trước yêu cầu',
    headline: 'Câu trả lời rõ trước khi đặt lịch.',
    sequence: ['Header', 'Hero', 'FAQ', 'Benefits', 'Pricing', 'LeadForm', 'Footer'],
  },
  'local-service-area-nav': {
    direction: 'area-guide',
    label: 'Khu vực phục vụ',
    purpose: 'Khu vực và điều kiện di chuyển trước danh mục việc',
    headline: 'Bắt đầu từ khu vực bạn cần hỗ trợ.',
    sequence: ['Header', 'Hero', 'Benefits', 'Features', 'Process', 'LeadForm', 'Footer'],
  },
  'local-service-early-book': {
    direction: 'early-request',
    label: 'Yêu cầu sớm',
    purpose: 'Form khu vực/hạng mục sớm; đối chiếu phạm vi sau',
    headline: 'Nêu việc cần làm, cùng xác định bước tiếp theo.',
    sequence: ['Header', 'Hero', 'LeadForm', 'Features', 'Benefits', 'Process', 'Footer'],
  },
  'local-service-quick-book': {
    direction: 'quick-request',
    label: 'Liên hệ nhanh',
    purpose: 'Bốn trường cốt lõi cho khách đã biết hạng mục và khu vực',
    headline: 'Việc gì, ở đâu? Cùng trao đổi.',
    sequence: ['Header', 'Hero', 'Features', 'LeadForm', 'Footer'],
  },
};

export function industryDirection(spec: LandingPageSpec): string | undefined {
  const registry = isRestaurantMenuRepresentative(spec)
    ? RESTAURANT_VARIANTS
    : isLocalServiceRepresentative(spec)
      ? LOCAL_SERVICE_VARIANTS
      : null;
  if (!registry) return undefined;
  return Object.values(registry).find(
    (r) =>
      r.direction !== 'standard' &&
      spec.meta?.architectureRecipe?.architectureId === `industry-${r.direction}-v2`,
  )?.direction;
}

export function applyIndustryVariant(
  template: LandingPageTemplateDefinition,
): LandingPageTemplateDefinition {
  const dining = template.category === 'restaurant',
    service = template.category === 'service';
  const recipe = (dining ? RESTAURANT_VARIANTS : service ? LOCAL_SERVICE_VARIANTS : {})[
    template.slug
  ];
  if (!recipe) return template;
  const spec = dining ? buildRestaurantRepresentative(template) : buildLocalServiceRepresentative();
  if (service) spec.meta!.catalogVersion = template.spec.meta?.catalogVersion;
  if (recipe.direction !== 'standard') {
    const available = new Map(spec.blocks.map((b) => [b.type, b]));
    const baseFeatures = spec.blocks.find((b) => b.type === (dining ? 'Product' : 'Features'))!;
    if (dining) {
      available.set('Features', {
        id: 'restaurant-team',
        type: 'Features',
        enabled: true,
        headline: 'Ba phần tạo nên trải nghiệm.',
        subheadline: 'Vai trò minh họa; bổ sung thông tin đội ngũ được xác nhận nếu có.',
        items: [
          {
            id: 'team-menu',
            title: 'Từ gian bếp',
            description: 'Thực đơn, nguyên liệu và cách chuẩn bị cần được nhà hàng giới thiệu rõ.',
          },
          {
            id: 'team-room',
            title: 'Từ không gian',
            description: 'Trao đổi cách sắp xếp bàn phù hợp với số khách và dịp gặp mặt.',
          },
          {
            id: 'team-service',
            title: 'Từ nhu cầu của bạn',
            description: 'Nêu trước nhu cầu ăn uống và các điều cần được xác nhận.',
          },
        ],
      });
      available.set('Benefits', {
        id: 'restaurant-conditions',
        type: 'Benefits',
        enabled: true,
        headline: 'Chuẩn bị thông tin cho bàn của bạn.',
        items: [
          {
            id: 'condition-group',
            title: 'Số khách & dịp gặp mặt',
            description: 'Khẩu phần, không gian và điều kiện cho nhóm cần được trao đổi riêng.',
          },
          {
            id: 'condition-time',
            title: 'Ngày & giờ mong muốn',
            description: 'Lịch gửi trong form chưa xác nhận tình trạng bàn.',
          },
          {
            id: 'condition-menu',
            title: 'Thành phần & nhu cầu ăn uống',
            description: 'Hỏi nhà hàng khả năng đáp ứng trước khi chốt thực đơn.',
          },
        ],
      });
    } else {
      available.set('Gallery', {
        id: 'service-gallery',
        type: 'Gallery',
        enabled: true,
        headline: 'Ba cách mô tả đầu việc.',
        subheadline:
          'Minh họa danh mục, không phải ảnh công trình đã thực hiện hoặc bằng chứng bảo hành.',
        items: ['repair', 'install', 'maintain'].map((name, i) => ({
          id: 'gallery-' + name,
          title: ['Hiện trạng cần xem', 'Thiết bị & vị trí', 'Danh mục cần bảo trì'][i]!,
          description: [
            'Chia sẻ phần việc cần kiểm tra trước khi đề xuất phương án.',
            'Nêu thiết bị và điều kiện lắp đặt cần được xác nhận.',
            'Liệt kê thiết bị và thời điểm mong muốn để thống nhất phạm vi.',
          ][i]!,
          imageUrl: `/landing-page-assets/local-service-v2/${name}.svg`,
          imageStyle: {
            alt: 'Minh họa hạng mục dịch vụ, không phải công trình khách hàng.',
            fit: 'contain' as const,
          },
        })),
      });
    }
    available.set('Pricing', {
      id: dining ? 'restaurant-options' : 'service-packages',
      type: 'Pricing',
      enabled: true,
      headline: dining ? 'Đối chiếu cách chọn thực đơn.' : 'Đối chiếu phạm vi công việc.',
      subheadline: dining
        ? 'Giá, món và khẩu phần phải được nhà hàng xác nhận.'
        : 'Bảng minh họa phạm vi, không phải báo giá đã xác nhận.',
      plans: (dining ? ['Bàn nhỏ', 'Bàn theo nhóm'] : ['Một hạng mục', 'Nhiều hạng mục']).map(
        (name, i) => ({
          id: (dining ? 'dining' : 'scope') + '-' + i,
          name,
          price: dining ? 'Theo thực đơn được xác nhận' : 'Đề xuất theo phạm vi',
          features: dining
            ? i
              ? ['Trao đổi số khách', 'Thống nhất thực đơn', 'Xác nhận điều kiện nhóm']
              : ['Chọn món phù hợp', 'Trao đổi nhu cầu ăn uống', 'Chờ xác nhận bàn']
            : i
              ? ['Danh mục ưu tiên', 'Đối chiếu vật tư và chi phí', 'Thống nhất lịch thực hiện']
              : ['Mô tả hiện trạng', 'Xác nhận phần việc', 'Trao đổi chi phí khảo sát'],
          ctaLabel: dining ? 'Trao đổi lựa chọn này' : 'Trao đổi phạm vi này',
          ctaUrl: dining ? '#restaurant-booking' : '#service-request',
          highlighted: i === 1,
        }),
      ),
    });
    available.set('Video', {
      id: dining ? 'restaurant-story' : 'service-intro',
      type: 'Video',
      enabled: true,
      headline: dining ? 'Câu chuyện từ gian bếp.' : 'Giới thiệu cách phối hợp.',
      videoUrl: '',
      style: { industryVideoPlaceholder: true },
      posterUrl: dining
        ? '/landing-page-assets/restaurant-menu-v2/room.jpg'
        : '/landing-page-assets/local-service-v2/home-service.svg',
    });
    spec.blocks = recipe.sequence.map((type) => structuredClone(available.get(type)!));
    if (recipe.direction === 'neighborhood-trust') {
      const checklist = spec.blocks.find((b) => b.type === 'Benefits');
      if (checklist?.type === 'Benefits') {
        checklist.variant = 'icon-grid';
        checklist.headline = 'Ba điều nên xác nhận với đơn vị nhận việc.';
        checklist.items = [
          {
            id: 'verify-contact',
            title: 'Đầu mối được xác nhận',
            description:
              'Kiểm tra tên đơn vị và cách liên hệ. Không suy ra độ tin cậy từ ảnh minh họa hoặc lời giới thiệu trong mẫu.',
          },
          {
            id: 'verify-scope',
            title: 'Danh mục việc viết rõ',
            description:
              'Đối chiếu việc được làm, vật tư, phần loại trừ và trách nhiệm trước khi đồng ý.',
          },
          {
            id: 'verify-terms',
            title: 'Thỏa thuận trước khi hẹn',
            description:
              'Yêu cầu xác nhận chi phí, điều kiện đổi lịch và chính sách bảo hành nếu có.',
          },
        ];
      }
    }
    if (recipe.direction === 'area-guide') {
      const area = spec.blocks.find((b) => b.type === 'Benefits');
      if (area?.type === 'Benefits') {
        area.headline = 'Kiểm tra khu vực trước khi nêu đầu việc.';
        area.items = [
          {
            id: 'scope-area',
            title: 'Khu vực cần hỗ trợ',
            description:
              'Nêu quận/huyện hoặc khu vực trong yêu cầu. Đơn vị cần xác nhận địa bàn có thể phục vụ; bản mẫu chưa có danh sách khu vực thực tế.',
          },
          {
            id: 'scope-access',
            title: 'Điều kiện tiếp cận',
            description:
              'Trao đổi giờ có thể tiếp cận, quy định của tòa nhà và điều kiện vận chuyển thiết bị nếu cần.',
          },
          {
            id: 'scope-travel',
            title: 'Di chuyển & khảo sát',
            description: 'Xác nhận phí đi lại, khảo sát và cách tính trước khi đồng ý lịch hẹn.',
          },
        ];
      }
      const form = spec.blocks.find((b) => b.type === 'LeadForm');
      if (form?.type === 'LeadForm')
        form.fields.sort(
          (a, b) =>
            ['name', 'phone', 'area', 'service', 'preferred_time', 'note'].indexOf(a.name) -
            ['name', 'phone', 'area', 'service', 'preferred_time', 'note'].indexOf(b.name),
        );
    }
    // Describe the compositions that the industry renderer actually draws.
    // In particular, a featured gallery must not retain the base grid stamp.
    for (const block of spec.blocks) {
      if (block.type === 'Gallery' && ['food-gallery', 'job-gallery'].includes(recipe.direction))
        block.variant = 'featured-plus-grid';
      if (block.type === 'Process' && ['dining-flow', 'work-process'].includes(recipe.direction))
        block.variant = 'timeline';
      if (block.type === 'Pricing')
        block.variant = ['set-menu', 'package-scope'].includes(recipe.direction)
          ? 'comparison'
          : 'cards';
      if (block.type === 'FAQ' && recipe.direction === 'booking-faq') block.variant = 'two-column';
      if (block.type === 'Product' && recipe.direction === 'quick-reserve')
        block.variant = 'minimal-list';
      if (block.type === 'LeadForm' && recipe.direction.startsWith('early-'))
        block.variant = 'split';
      if (block.type === 'LeadForm' && recipe.direction.startsWith('quick-'))
        block.variant = 'compact';
    }
    const hero = spec.blocks.find((b) => b.type === 'Hero');
    if (hero?.type === 'Hero') {
      hero.headline = recipe.headline;
      hero.variant = [
        'early-reserve',
        'quick-reserve',
        'booking-faq',
        'food-gallery',
        'kitchen-story',
        'work-process',
        'scope-faq',
        'early-request',
        'quick-request',
        'team-intro',
        'job-gallery',
        'area-guide',
      ].includes(recipe.direction)
        ? 'minimal-copy'
        : recipe.direction === 'menu-guide'
          ? 'split-right'
          : 'split-left';
      if (hero.variant === 'minimal-copy') delete hero.imageUrl;
      if (recipe.direction.startsWith('quick-')) hero.trustPoints = [];
    }
    const faq = spec.blocks.find((b) => b.type === 'FAQ');
    if (faq?.type === 'FAQ' && ['booking-faq', 'scope-faq'].includes(recipe.direction))
      faq.items.push(
        ...(dining
          ? [
              [
                'Trẻ em có cần tính vào số khách?',
                'Hãy nêu cả số người lớn và trẻ em để nhà hàng xác nhận cách sắp xếp và khẩu phần.',
              ],
              [
                'Có thể thay đổi số khách?',
                'Liên hệ nhà hàng để xác nhận khả năng đáp ứng và điều kiện thay đổi.',
              ],
              [
                'Có yêu cầu đặt cọc không?',
                'Nhà hàng cần thông báo rõ khoản đặt cọc, hạn thanh toán và điều kiện hoàn/hủy nếu áp dụng.',
              ],
              [
                'Có thể chọn thực đơn trước không?',
                'Nêu lựa chọn trong phần ghi chú và chờ xác nhận món, giá và khả năng phục vụ.',
              ],
            ]
          : [
              [
                'Có phí khảo sát không?',
                'Phí khảo sát, đi lại và cách tính cần được xác nhận trước khi hẹn.',
              ],
              [
                'Vật tư có nằm trong giá không?',
                'Cần đối chiếu danh mục vật tư được bao gồm và phần tính thêm trước khi thực hiện.',
              ],
              [
                'Có thể gửi thông tin trước không?',
                'Mô tả ngắn hạng mục và hiện trạng; đơn vị sẽ trao đổi thông tin cần bổ sung.',
              ],
              [
                'Nếu yêu cầu ngoài phạm vi thì sao?',
                'Thống nhất thay đổi phạm vi, chi phí và lịch trước khi triển khai phần việc bổ sung.',
              ],
            ]
        ).map(([question, answer], i) => ({
          id: 'extra-faq-' + i,
          question: question!,
          answer: answer!,
        })),
      );
    if (recipe.direction === 'quick-request') {
      const form = spec.blocks.find((b) => b.type === 'LeadForm');
      if (form?.type === 'LeadForm')
        form.fields = form.fields.filter((f) =>
          ['name', 'phone', 'service', 'area'].includes(f.name),
        );
    }
    if (recipe.direction === 'quick-reserve' && baseFeatures.type === 'Product') {
      const menu = spec.blocks.find((b) => b.type === 'Product');
      if (menu?.type === 'Product') menu.items = menu.items.slice(0, 3);
    }
    const architecture = buildArchitectureRecipe({
      ...spec.meta!.architectureRecipe!,
      architectureId: `industry-${recipe.direction}-v2`,
      purpose: recipe.purpose,
      sectionSequence: spec.blocks.map((b) => b.type),
      formPlacement: recipe.direction.startsWith('early-') ? 'early_after_hero' : 'late',
      blockVariants: {
        ...spec.meta?.architectureRecipe?.blockVariants,
        ...Object.fromEntries(spec.blocks.filter((b) => b.variant).map((b) => [b.type, b.variant])),
      },
    });
    spec.meta = { ...spec.meta, architectureRecipe: architecture };
  }
  const asset = `/landing-page-assets/${dining ? 'restaurant-menu-v2' : 'local-service-v2'}/variants/${recipe.direction}`;
  spec.meta = {
    ...spec.meta,
    gallery: {
      thumbnail: asset + '-thumb.webp',
      previewLongImage: asset + '-long.webp',
      flowId: recipe.direction,
      badges: ['new'],
    },
  };
  spec.seo = {
    ...spec.seo,
    title: recipe.label + ' | ' + (dining ? 'Bếp & Bàn' : 'Gần Nhà'),
    metaDescription: recipe.purpose,
    ogImage: asset + '-thumb.webp',
  };
  return {
    ...template,
    name: (dining ? 'Nhà hàng' : 'Dịch vụ địa phương') + ' · ' + recipe.label,
    description: recipe.purpose,
    theme: spec.theme,
    conversionGoal: dining ? 'booking' : 'lead',
    designFamily: dining ? 'organic' : 'local',
    badges: ['new'],
    tags: [template.category, 'reviewed-industry-family', recipe.direction, 'demo-content'],
    thumbnail: asset + '-thumb.webp',
    previewLongImage: asset + '-long.webp',
    spec,
  };
}

function canSeedIndustry(
  identity: { slug: string; isSystem: boolean; organizationId: string | null; managed?: boolean },
  stored: LandingPageSpec,
  canonical: LandingPageSpec,
): boolean {
  const config = RESTAURANT_VARIANTS[identity.slug] || LOCAL_SERVICE_VARIANTS[identity.slug];
  const valid =
    config &&
    (RESTAURANT_VARIANTS[identity.slug]
      ? isRestaurantMenuRepresentative(canonical)
      : isLocalServiceRepresentative(canonical));
  const expected =
    config?.direction === 'standard'
      ? RESTAURANT_VARIANTS[identity.slug]
        ? 'restaurant_menu_pilot_v2'
        : 'local_service_review_v2'
      : `industry-${config?.direction}-v2`;
  return Boolean(
    valid &&
    canonical.meta?.architectureRecipe?.architectureId === expected &&
    identity.isSystem &&
    identity.organizationId === null &&
    !identity.managed &&
    !stored.meta?.htmlSource &&
    stored.meta?.catalogVersion === canonical.meta?.catalogVersion &&
    (!stored.meta?.rendererVersion ||
      stored.meta.rendererVersion === canonical.meta.rendererVersion),
  );
}

export function industryCreationSeed(
  identity: { slug: string; isSystem: boolean; organizationId: string | null; managed?: boolean },
  stored: LandingPageSpec,
  canonical: LandingPageSpec,
): LandingPageSpec {
  return canSeedIndustry(identity, stored, canonical) ? structuredClone(canonical) : stored;
}

/** Gallery metadata follows the same strict creation-only identity gate as its spec. */
export function industryTemplatePresentation(
  identity: { slug: string; isSystem: boolean; organizationId: string | null; managed?: boolean },
  stored: LandingPageSpec,
  canonical: LandingPageTemplateDefinition,
): LandingPageTemplateDefinition | undefined {
  return canSeedIndustry(identity, stored, canonical.spec) ? canonical : undefined;
}
