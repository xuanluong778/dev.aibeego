import type { LandingPageSpec } from './landing-page-types';
import { createEmptyLandingPageSpec } from './landing-page-lifecycle';

export const BLANK_STARTER_RENDERER = 'blank-starter-v1';
export const BLANK_STARTER_IMAGE = '/landing-page-assets/blank/image-placeholder.svg';

/** Creation-only starter. Existing drafts and other creation modes keep their own spec. */
export function createBlankLandingPageSpec(): LandingPageSpec {
  const base = createEmptyLandingPageSpec('MINIMAL');
  const id = (kind: string) => `blank_${kind}_${Math.random().toString(36).slice(2, 10)}`;
  return {
    ...base,
    meta: { rendererVersion: BLANK_STARTER_RENDERER, layout: 'classic' },
    themeTokens: {
      ...base.themeTokens,
      primary: '#03458e', button: '#03458e', secondary: '#222830', text: '#222830',
      muted: '#222830', background: '#ffffff', surface: '#ffffff', surfaceAlt: '#f6f6f6',
      fontFamily: 'Arial, sans-serif', radius: '5px', buttonRadius: '5px',
    },
    blocks: [
      { id: id('header'), type: 'Header', enabled: true, layerName: 'Header', background: '#ffffff',
        headline: 'LOGO', imageUrl: '/landing-page-assets/blank/logo-placeholder.svg' },
      { id: id('hero'), type: 'Hero', enabled: true, layerName: 'Giới thiệu ý tưởng', background: '#f6f6f6',
        imageUrl: BLANK_STARTER_IMAGE, imageStyle: { fit: 'contain', alt: 'Ảnh minh họa ý tưởng' },
        headline: 'Giới thiệu ý tưởng của bạn',
        subheadline: 'Chia sẻ sản phẩm hoặc dịch vụ của bạn và những lợi ích nổi bật. Thay ảnh và nội dung để kể câu chuyện của riêng bạn.',
        ctaLabel: 'Đăng ký ngay', ctaUrl: '#lead-form' },
      { id: id('form'), type: 'LeadForm', enabled: true, layerName: 'Form đăng ký', background: '#ffffff',
        headline: 'Kết nối với chúng tôi',
        subheadline: 'Chia sẻ thêm về ý tưởng của bạn. Giới thiệu những thông tin hữu ích để khách hàng hiểu hơn về sản phẩm, dịch vụ và thương hiệu của bạn.',
        submitLabel: 'Đăng ký', successMessage: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin đăng ký.',
        formTheme: { background: '#ffffff', border: 'none', radius: '0px', inputRadius: '5px',
          inputBorder: '1px solid #222830', buttonBg: '#03458e', buttonColor: '#ffffff', buttonRadius: '5px' },
        fields: [
          { id: id('name'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true, placeholder: '' },
          { id: id('email'), name: 'email', label: 'Email', fieldType: 'email', required: true, placeholder: '' },
        ] },
      { id: id('features'), type: 'Features', enabled: true, layerName: 'Giới thiệu 3 mục', background: '#ffffff',
        items: [1, 2, 3].map(n => ({ id: id(`item${n}`), title: `Tiêu đề mục ${n}`,
          description: 'Giới thiệu sản phẩm hoặc dịch vụ của bạn và những lợi ích nổi bật. Chia sẻ thêm về thương hiệu và đội ngũ để khách hàng hiểu hơn về bạn.',
          imageUrl: BLANK_STARTER_IMAGE, imageStyle: { fit: 'cover', alt: `Ảnh minh họa mục ${n}` } })) },
      { id: id('cta'), type: 'CTA', enabled: true, layerName: 'Lời kêu gọi đăng ký', background: '#f6f6f6',
        headline: 'Biến ý tưởng thành hiện thực',
        subheadline: 'Chia sẻ giá trị mà bạn mang lại và mời khách hàng cùng bắt đầu. Đăng ký để kết nối và tìm hiểu thêm.',
        ctaLabel: 'Đăng ký ngay', ctaUrl: '#lead-form' },
      { id: id('footer'), type: 'Footer', enabled: true, layerName: 'Footer', background: '#222830' },
    ],
  };
}
