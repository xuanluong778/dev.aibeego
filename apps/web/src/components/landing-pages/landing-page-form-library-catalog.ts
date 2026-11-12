'use client';

/**
 * Visual Form Library Catalog for Landing Page Builder.
 * Provides curated, high-converting form templates with rich visual styling
 * matching luxury dark/gold, clean light cream, and modern minimal aesthetics.
 */

import type { LandingPageFormTheme, LandingPageLeadFormField } from '@marketingspa/shared';

export type LpFormLibraryCategoryId = 'all' | 'register' | 'contact' | 'order' | 'consult';

export type LpFormLibraryCategory = {
  id: LpFormLibraryCategoryId;
  label: string;
};

export const LP_FORM_LIBRARY_CATEGORIES: LpFormLibraryCategory[] = [
  { id: 'all', label: 'Tất cả các danh mục' },
  { id: 'contact', label: 'Liên lạc' },
  { id: 'register', label: 'Đăng ký' },
  { id: 'order', label: 'Đặt hàng' },
  { id: 'consult', label: 'Tư vấn' },
];

export type LpFormLibraryTemplate = {
  id: string;
  label: string;
  category: 'register' | 'contact' | 'order' | 'consult';
  headline?: string;
  subheadline?: string;
  submitLabel: string;
  footerText?: string;
  sectionStyle?: Record<string, unknown>;
  formTheme: LandingPageFormTheme;
  fields: Array<Omit<LandingPageLeadFormField, 'id'>>;
  preview: {
    outerBg: string;
    innerBg?: string;
    innerBorder?: string;
    inputStyle: 'pill' | 'box' | 'underline';
    labelPosition?: 'inside' | 'above';
    inputBg: string;
    inputBorder?: string;
    inputBorderBottom?: string;
    inputTextColor: string;
    labelColor: string;
    fontFamily: 'serif' | 'sans';
    buttonBg: string;
    buttonColor: string;
    buttonRadius: string;
    buttonText: string;
  };
};

function makeField(
  name: string,
  label: string,
  fieldType: LandingPageLeadFormField['fieldType'],
  opts?: Partial<Omit<LandingPageLeadFormField, 'id' | 'name' | 'label' | 'fieldType'>>,
): Omit<LandingPageLeadFormField, 'id'> {
  return {
    name,
    label,
    fieldType,
    required: opts?.required ?? false,
    placeholder: opts?.placeholder,
    options: opts?.options,
    optionsLayout: opts?.optionsLayout,
  };
}

export const LP_FORM_LIBRARY_TEMPLATES: LpFormLibraryTemplate[] = [
  // ─── 1. CARD 1: Đăng ký sang trọng - Pill Dark Gold (Exact from screenshot #1) ───
  {
    id: 'form-reg-luxury-pill-dark',
    label: 'Đăng ký sang trọng - Pill Dark Gold',
    category: 'register',
    headline: 'ĐĂNG KÝ THÀNH VIÊN',
    subheadline: 'Nhận ngay đặc quyền & thông tin sớm nhất',
    submitLabel: 'SIGN UP',
    footerText: 'Thông tin của bạn được bảo mật tuyệt đối',
    sectionStyle: {
      backgroundColor: '#000000',
    },
    formTheme: {
      background: '#241a0d',
      border: 'none',
      headlineColor: '#ffffff',
      labelColor: '#e5a913',
      mutedColor: '#a1a1aa',
      inputBg: '#050403',
      inputBorder: '1px solid #110d08',
      inputColor: '#ffffff',
      inputRadius: '9999px',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '18px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true, placeholder: 'NAME *' }),
      makeField('email', 'EMAIL *', 'email', { required: true, placeholder: 'EMAIL *' }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#2a1e0f',
      innerBorder: '1px solid #3d2a13',
      inputStyle: 'pill',
      labelPosition: 'inside',
      inputBg: '#080604',
      inputBorder: '1px solid #120e09',
      inputTextColor: '#d4c5b2',
      labelColor: '#e5a913',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 2. CARD 2: Đăng ký tối giản - Box Dark Gold (Exact from screenshot #2) ───
  {
    id: 'form-reg-box-dark-gold',
    label: 'Đăng ký tối giản - Box Dark Gold',
    category: 'register',
    headline: 'THAM GIA NGAY',
    subheadline: 'Điền thông tin để đăng ký dịch vụ',
    submitLabel: 'SIGN UP',
    footerText: 'Cam kết bảo mật dữ liệu khách hàng',
    sectionStyle: {
      backgroundColor: '#000000',
    },
    formTheme: {
      background: '#0a0a0a',
      border: '1px solid #2e1f0e',
      headlineColor: '#ffffff',
      labelColor: '#bda078',
      mutedColor: '#71717a',
      inputBg: '#2a1b0b',
      inputBorder: '1px solid #452d14',
      inputColor: '#c9a775',
      inputRadius: '8px',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '12px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true, placeholder: 'NAME *' }),
      makeField('email', 'EMAIL *', 'email', { required: true, placeholder: 'EMAIL *' }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#000000',
      inputStyle: 'box',
      labelPosition: 'inside',
      inputBg: '#2d1e0d',
      inputBorder: '1px solid #432e16',
      inputTextColor: '#c9a775',
      labelColor: '#bda078',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 3. CARD 3: Đăng ký cổ điển - Underline Dark Gold (Exact from screenshot #3) ───
  {
    id: 'form-reg-underline-dark-gold',
    label: 'Đăng ký cổ điển - Underline Dark Gold',
    category: 'register',
    headline: 'ĐĂNG KÝ TRẢI NGHIỆM',
    subheadline: 'Để lại email để nhận tư vấn chi tiết',
    submitLabel: 'SIGN UP',
    footerText: 'Chúng tôi tôn trọng quyền riêng tư của bạn',
    sectionStyle: {
      backgroundColor: '#000000',
    },
    formTheme: {
      background: '#000000',
      border: 'none',
      headlineColor: '#f3ede2',
      labelColor: '#f3ede2',
      mutedColor: '#a1a1aa',
      inputBg: 'transparent',
      inputBorder: 'none',
      inputUnderline: true,
      inputBorderBottom: '1px solid #e5a913',
      inputColor: '#ffffff',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '12px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true }),
      makeField('email', 'EMAIL *', 'email', { required: true }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#000000',
      inputStyle: 'underline',
      labelPosition: 'above',
      inputBg: 'transparent',
      inputBorderBottom: '1.5px solid #e5a913',
      inputTextColor: '#ffffff',
      labelColor: '#f3ede2',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 4. CARD 4: Đăng ký thanh lịch - Underline Light Cream (Exact from screenshot #4) ───
  {
    id: 'form-reg-underline-light-cream',
    label: 'Đăng ký thanh lịch - Underline Light Cream',
    category: 'register',
    headline: 'THAM GIA NGAY HÔM NAY',
    subheadline: 'Đăng ký tài khoản để khám phá ưu đãi',
    submitLabel: 'SIGN UP',
    footerText: 'Bảo mật thông tin — Không gửi thư rác',
    sectionStyle: {
      backgroundColor: '#f5f3ec',
    },
    formTheme: {
      background: '#f5f3ec',
      border: 'none',
      headlineColor: '#2b1f0d',
      labelColor: '#2b1f0d',
      mutedColor: '#6b5d4f',
      inputBg: 'transparent',
      inputBorder: 'none',
      inputUnderline: true,
      inputBorderBottom: '1.5px solid #4a3518',
      inputColor: '#2b1f0d',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '12px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true }),
      makeField('email', 'EMAIL *', 'email', { required: true }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#f5f3ec',
      inputStyle: 'underline',
      labelPosition: 'above',
      inputBg: 'transparent',
      inputBorderBottom: '1.5px solid #4a3518',
      inputTextColor: '#2b1f0d',
      labelColor: '#2b1f0d',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 5. CARD 5: Đăng ký tương phản - Dark Box on Light Cream (Exact from screenshot #5) ───
  {
    id: 'form-reg-box-light-contrast',
    label: 'Đăng ký tương phản - Dark Box on Light Cream',
    category: 'register',
    headline: 'ĐĂNG KÝ NHẬN THÔNG TIN',
    subheadline: 'Hệ thống sẽ gửi tài liệu qua email của bạn',
    submitLabel: 'SIGN UP',
    footerText: 'Chúng tôi cam kết không chia sẻ dữ liệu với bên thứ ba',
    sectionStyle: {
      backgroundColor: '#f5f3ec',
    },
    formTheme: {
      background: '#f5f3ec',
      border: 'none',
      headlineColor: '#2b1f0d',
      labelColor: '#2b1f0d',
      mutedColor: '#6b5d4f',
      inputBg: '#382613',
      inputBorder: '1px solid #382613',
      inputColor: '#ffffff',
      inputRadius: '6px',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '12px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true }),
      makeField('email', 'EMAIL *', 'email', { required: true }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#f5f3ec',
      inputStyle: 'box',
      labelPosition: 'above',
      inputBg: '#382613',
      inputBorder: '1px solid #382613',
      inputTextColor: '#ffffff',
      labelColor: '#2b1f0d',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 6. CARD 6: Đăng ký hoàng gia - Pill Bronze Dark (Exact from screenshot #6) ───
  {
    id: 'form-reg-pill-bronze-dark',
    label: 'Đăng ký hoàng gia - Pill Bronze Dark',
    category: 'register',
    headline: 'THÀNH VIÊN VIP CLUB',
    subheadline: 'Đăng ký ngay để nhận quà tặng độc quyền',
    submitLabel: 'SIGN UP',
    footerText: 'Đặc quyền chỉ dành cho hội viên đăng ký sớm',
    sectionStyle: {
      backgroundColor: '#3a2713',
    },
    formTheme: {
      background: '#3a2713',
      border: 'none',
      headlineColor: '#d5b895',
      labelColor: '#d5b895',
      mutedColor: '#a89074',
      inputBg: '#0a0704',
      inputBorder: '1px solid #1a1209',
      inputColor: '#ffffff',
      inputRadius: '9999px',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      radius: '16px',
      titleFont: 'serif',
    },
    fields: [
      makeField('name', 'NAME *', 'text', { required: true }),
      makeField('email', 'EMAIL *', 'email', { required: true }),
    ],
    preview: {
      outerBg: '#000000',
      innerBg: '#3a2713',
      inputStyle: 'pill',
      labelPosition: 'above',
      inputBg: '#0a0704',
      inputBorder: '1px solid #1a1209',
      inputTextColor: '#ffffff',
      labelColor: '#d5b895',
      fontFamily: 'serif',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '9999px',
      buttonText: 'SIGN UP',
    },
  },

  // ─── 7. LIÊN LẠC: Form liên hệ phong cách Luxury (Dark Gold) ───
  {
    id: 'form-contact-luxury-gold',
    label: 'Liên hệ chuyên nghiệp - Luxury Dark Gold',
    category: 'contact',
    headline: 'LIÊN HỆ VỚI CHÚNG TÔI',
    subheadline: 'Đội ngũ chuyên viên sẽ phản hồi bạn trong 15 phút',
    submitLabel: 'GỬI LIÊN HỆ',
    footerText: 'Thông tin được chuyển trực tiếp đến bộ phận hỗ trợ',
    sectionStyle: {
      backgroundColor: '#0a0c10',
    },
    formTheme: {
      background: '#121620',
      border: '1px solid rgba(229,169,19,0.3)',
      headlineColor: '#ffffff',
      labelColor: '#e5a913',
      mutedColor: '#94a3b8',
      inputBg: '#080a0f',
      inputBorder: '1px solid #1f293d',
      inputColor: '#ffffff',
      inputRadius: '8px',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '8px',
      radius: '16px',
      titleFont: 'sans',
    },
    fields: [
      makeField('name', 'Họ và tên *', 'text', { required: true, placeholder: 'Nguyễn Văn A' }),
      makeField('phone', 'Số điện thoại *', 'tel', { required: true, placeholder: '0912 345 678' }),
      makeField('message', 'Nội dung tin nhắn', 'textarea', { placeholder: 'Tôi muốn tìm hiểu về dịch vụ…' }),
    ],
    preview: {
      outerBg: '#0a0c10',
      innerBg: '#121620',
      innerBorder: '1px solid rgba(229,169,19,0.3)',
      inputStyle: 'box',
      inputBg: '#080a0f',
      inputBorder: '1px solid #1f293d',
      inputTextColor: '#ffffff',
      labelColor: '#e5a913',
      fontFamily: 'sans',
      buttonBg: '#e5a913',
      buttonColor: '#000000',
      buttonRadius: '8px',
      buttonText: 'GỬI LIÊN HỆ',
    },
  },

  // ─── 8. LIÊN LẠC: Form liên hệ Clean Minimalist White ───
  {
    id: 'form-contact-clean-white',
    label: 'Liên hệ hiện đại - Clean Minimalist White',
    category: 'contact',
    headline: 'Gửi yêu cầu tư vấn',
    subheadline: 'Nhận báo giá và giải pháp chi tiết cho doanh nghiệp',
    submitLabel: 'GỬI YÊU CẦU NGAY',
    footerText: 'Cam kết bảo mật 100% — Không làm phiền',
    sectionStyle: {
      backgroundColor: '#f8fafc',
    },
    formTheme: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      headlineColor: '#0f172a',
      labelColor: '#334155',
      mutedColor: '#64748b',
      inputBg: '#f8fafc',
      inputBorder: '1px solid #cbd5e1',
      inputColor: '#0f172a',
      inputRadius: '8px',
      buttonBg: '#2563eb',
      buttonColor: '#ffffff',
      buttonRadius: '8px',
      radius: '16px',
      titleFont: 'sans',
    },
    fields: [
      makeField('name', 'Họ và tên *', 'text', { required: true, placeholder: 'Nguyễn Văn A' }),
      makeField('phone', 'Số điện thoại *', 'tel', { required: true, placeholder: '0988 888 888' }),
      makeField('email', 'Email', 'email', { placeholder: 'example@email.com' }),
    ],
    preview: {
      outerBg: '#f8fafc',
      innerBg: '#ffffff',
      innerBorder: '1px solid #e2e8f0',
      inputStyle: 'box',
      inputBg: '#f8fafc',
      inputBorder: '1px solid #cbd5e1',
      inputTextColor: '#0f172a',
      labelColor: '#334155',
      fontFamily: 'sans',
      buttonBg: '#2563eb',
      buttonColor: '#ffffff',
      buttonRadius: '8px',
      buttonText: 'GỬI YÊU CẦU NGAY',
    },
  },

  // ─── 9. TƯ VẤN: Đăng ký tư vấn nhanh (Underline Minimal Dark) ───
  {
    id: 'form-consult-quick-underline',
    label: 'Tư vấn nhanh - Underline Minimal Dark',
    category: 'consult',
    headline: 'NHẬN TƯ VẤN MIỄN PHÍ 1:1',
    subheadline: 'Chuyên gia sẽ liên hệ tư vấn trực tiếp theo nhu cầu',
    submitLabel: 'TƯ VẤN CHO TÔI',
    footerText: 'Hỗ trợ tư vấn hoàn toàn miễn phí 24/7',
    sectionStyle: {
      backgroundColor: '#18181b',
    },
    formTheme: {
      background: '#18181b',
      border: 'none',
      headlineColor: '#ffffff',
      labelColor: '#f43f5e',
      mutedColor: '#a1a1aa',
      inputBg: 'transparent',
      inputBorder: 'none',
      inputUnderline: true,
      inputBorderBottom: '1.5px solid #f43f5e',
      inputColor: '#ffffff',
      buttonBg: '#f43f5e',
      buttonColor: '#ffffff',
      buttonRadius: '9999px',
      radius: '12px',
      titleFont: 'sans',
    },
    fields: [
      makeField('name', 'Họ tên của bạn *', 'text', { required: true }),
      makeField('phone', 'Số điện thoại liên hệ *', 'tel', { required: true }),
    ],
    preview: {
      outerBg: '#18181b',
      innerBg: '#18181b',
      inputStyle: 'underline',
      inputBg: 'transparent',
      inputBorderBottom: '1.5px solid #f43f5e',
      inputTextColor: '#ffffff',
      labelColor: '#f43f5e',
      fontFamily: 'sans',
      buttonBg: '#f43f5e',
      buttonColor: '#ffffff',
      buttonRadius: '9999px',
      buttonText: 'TƯ VẤN CHO TÔI',
    },
  },

  // ─── 10. ĐẶT HÀNG: Biểu mẫu đặt hàng nhanh (Flash Order) ───
  {
    id: 'form-order-flash-amber',
    label: 'Đặt hàng nhanh - Flash Order Amber',
    category: 'order',
    headline: 'ĐẶT MUA SẢN PHẨM',
    subheadline: 'Nhận ưu đãi giảm giá 50% khi để lại thông tin ngay',
    submitLabel: 'ĐẶT HÀNG NGAY - GIAO TẬN NƠI',
    footerText: 'Kiểm tra hàng trước khi thanh toán — Đổi trả 7 ngày',
    sectionStyle: {
      backgroundColor: '#fffbeb',
    },
    formTheme: {
      background: '#ffffff',
      border: '2px solid #f59e0b',
      headlineColor: '#78350f',
      labelColor: '#92400e',
      mutedColor: '#b45309',
      inputBg: '#fff',
      inputBorder: '1px solid #fcd34d',
      inputColor: '#78350f',
      inputRadius: '8px',
      buttonBg: '#d97706',
      buttonColor: '#ffffff',
      buttonRadius: '9999px',
      radius: '16px',
      titleFont: 'sans',
    },
    fields: [
      makeField('name', 'Họ và tên *', 'text', { required: true, placeholder: 'Họ và tên người nhận' }),
      makeField('phone', 'Số điện thoại *', 'tel', { required: true, placeholder: 'Số điện thoại nhận hàng' }),
      makeField('address', 'Địa chỉ giao hàng *', 'text', { required: true, placeholder: 'Số nhà, đường, phường, quận…' }),
    ],
    preview: {
      outerBg: '#fffbeb',
      innerBg: '#ffffff',
      innerBorder: '2px solid #f59e0b',
      inputStyle: 'box',
      inputBg: '#ffffff',
      inputBorder: '1px solid #fcd34d',
      inputTextColor: '#78350f',
      labelColor: '#92400e',
      fontFamily: 'sans',
      buttonBg: '#d97706',
      buttonColor: '#ffffff',
      buttonRadius: '9999px',
      buttonText: 'ĐẶT HÀNG NGAY',
    },
  },
];

export function getFormLibraryTemplatesByCategory(category: LpFormLibraryCategoryId): LpFormLibraryTemplate[] {
  if (category === 'all') return LP_FORM_LIBRARY_TEMPLATES;
  return LP_FORM_LIBRARY_TEMPLATES.filter((t) => t.category === category);
}

