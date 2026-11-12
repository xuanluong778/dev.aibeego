export type Pair = [string, string];

export type FieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type CommercialPack = {
  brand: string;
  nav: string[];
  /** Used by generic angles, e.g. "khóa học" / "đăng ký". */
  noun: string;
  verb: string;
  heroAlt: string;
  description: string;
  hero: { h: string; s: string; cta: string; trust: string[] };
  /** Webinar only: [date, time, format] as honest descriptions (no invented dates). */
  eventMeta?: [string, string, string];
  angles: { trust: Pair; price: Pair; process: Pair; proof: Pair };
  benefits: { h: string; s?: string; items: Pair[] };
  features: { h: string; s?: string; items: Pair[] };
  process: { h: string; s?: string; items: Pair[] };
  gallery: { h: string; s?: string; items: Pair[] };
  pricing?: {
    h: string;
    s?: string;
    plans: { name: string; price: string; period?: string; features: string[]; highlighted?: boolean; cta?: string }[];
  };
  faq: { h: string; items: Pair[] };
  guarantee: Pair;
  cta: { h: string; b: string; label: string };
  form: { h: string; s: string; submit: string; success: string; footer: string; fields: FieldSpec[] };
  footer: string;
};

const NAME: FieldSpec = { name: 'name', label: 'Họ và tên', type: 'text', required: true, placeholder: 'Nguyễn Văn A' };
const PHONE: FieldSpec = { name: 'phone', label: 'Số điện thoại', type: 'tel', required: true, placeholder: '09xx xxx xxx' };
const ZALO: FieldSpec = { name: 'phone', label: 'Số điện thoại / Zalo', type: 'tel', required: true, placeholder: '09xx xxx xxx' };
const EMAIL: FieldSpec = { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ban@email.com' };
const EMAIL_REQ: FieldSpec = { ...EMAIL, required: true };

export const F = {
  NAME,
  PHONE,
  ZALO,
  EMAIL,
  EMAIL_REQ,
  note: (label: string, placeholder: string, name = 'note'): FieldSpec => ({
    name,
    label,
    type: 'textarea',
    required: false,
    placeholder,
  }),
  text: (name: string, label: string, placeholder: string, required = false): FieldSpec => ({
    name,
    label,
    type: 'text',
    required,
    placeholder,
  }),
  select: (name: string, label: string, options: string[], required = false): FieldSpec => ({
    name,
    label,
    type: 'select',
    required,
    options,
  }),
};
