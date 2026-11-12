'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  LandingPageBriefSuggestField,
  LandingPageBriefSuggestInput,
} from '@marketingspa/shared';
import { LandingPageAiBriefSuggestion } from './landing-page-ai-brief-suggestion';

export type LandingPageAiFormFields = {
  businessType: string;
  brandName: string;
  productService: string;
  targetCustomer: string;
  painPoint: string;
  uspBenefits: string;
  price: string;
  offer: string;
  ctaLabel: string;
  ctaUrl: string;
  extraNotes: string;
  imageUrl: string;
  logoUrl: string;
  brandColor: string;
  guarantee: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
};
export const EMPTY_LANDING_PAGE_AI_FIELDS: LandingPageAiFormFields = {
  businessType: '',
  brandName: '',
  productService: '',
  targetCustomer: '',
  painPoint: '',
  uspBenefits: '',
  price: '',
  offer: '',
  ctaLabel: '',
  ctaUrl: '',
  extraNotes: '',
  imageUrl: '',
  logoUrl: '',
  brandColor: '',
  guarantee: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
};
export const LANDING_PAGE_AI_INDUSTRIES = [
  ['spa', 'Spa / chăm sóc sắc đẹp'],
  ['clinic', 'Phòng khám / nha khoa'],
  ['cosmetics', 'Mỹ phẩm'],
  ['fashion', 'Thời trang'],
  ['product', 'Sản phẩm'],
  ['saas', 'Phần mềm / SaaS'],
  ['course', 'Khóa học / đào tạo'],
  ['coaching', 'Coaching / tư vấn cá nhân'],
  ['restaurant', 'Nhà hàng / ẩm thực'],
  ['real_estate', 'Bất động sản'],
  ['agency', 'Agency'],
  ['seo', 'Dịch vụ SEO'],
  ['website', 'Thiết kế website'],
  ['service', 'Dịch vụ'],
  ['consulting', 'Tư vấn doanh nghiệp'],
  ['webinar', 'Sự kiện / hội thảo'],
  ['ebook', 'Sách điện tử'],
  ['lead_magnet', 'Tài liệu'],
  ['demo', 'Giới thiệu giải pháp'],
  ['quote', 'Báo giá'],
] as const;

export function LandingPageAiBriefFields({
  value,
  onChange,
  disabled,
  pageGoal = 'lead',
}: {
  value: LandingPageAiFormFields;
  onChange: (value: LandingPageAiFormFields) => void;
  disabled: boolean;
  pageGoal?: LandingPageBriefSuggestInput['pageGoal'];
}) {
  const fields: Array<{
    key: keyof LandingPageAiFormFields;
    label: string;
    placeholder: string;
    max: number;
    long?: boolean;
  }> = [
    { key: 'brandName', label: 'Thương hiệu', placeholder: 'Tên thương hiệu của bạn', max: 120 },
    {
      key: 'productService',
      label: 'Sản phẩm / dịch vụ',
      placeholder: 'Ví dụ: Chăm sóc da dành cho da nhạy cảm',
      max: 200,
    },
    {
      key: 'targetCustomer',
      label: 'Khách hàng mục tiêu',
      placeholder: 'Ai đang cần sản phẩm / dịch vụ này?',
      max: 400,
      long: true,
    },
    {
      key: 'painPoint',
      label: 'Vấn đề khách hàng cần giải quyết',
      placeholder: 'Điều khiến khách hàng muốn tìm giải pháp',
      max: 400,
      long: true,
    },
    {
      key: 'uspBenefits',
      label: 'Điểm khác biệt / lợi ích thực tế',
      placeholder: 'Thông tin thật về sản phẩm, dịch vụ hoặc cách phục vụ',
      max: 800,
      long: true,
    },
    {
      key: 'price',
      label: 'Giá đã xác nhận (nếu có)',
      placeholder: 'Để trống nếu cần tư vấn trước khi báo giá',
      max: 80,
    },
    {
      key: 'offer',
      label: 'Ưu đãi đã xác nhận (nếu có)',
      placeholder: 'Điều kiện và nội dung ưu đãi thực tế',
      max: 200,
    },
    {
      key: 'ctaLabel',
      label: 'Nội dung nút hành động',
      placeholder: 'Ví dụ: Đặt lịch tư vấn',
      max: 80,
    },
    {
      key: 'ctaUrl',
      label: 'Đích nút hành động',
      placeholder: 'Để trống để trỏ tới form; hoặc https://, tel:, mailto:',
      max: 2000,
    },
  ];
  function editor(field: (typeof fields)[number]) {
    const id = `lp-ai-${field.key}`;
    return (
      <div key={field.key} className={field.long ? 'sm:col-span-2' : ''}>
        <Label htmlFor={id}>{field.label}</Label>
        {field.long ? (
          <Textarea
            id={id}
            className="mt-1"
            rows={2}
            value={value[field.key]}
            maxLength={field.max}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
          />
        ) : (
          <Input
            id={id}
            className="mt-1"
            value={value[field.key]}
            maxLength={field.max}
            placeholder={field.placeholder}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
          />
        )}
        {['targetCustomer', 'painPoint', 'uspBenefits'].includes(field.key) ? (
          <LandingPageAiBriefSuggestion
            label={field.label}
            disabled={disabled}
            context={{
              field: field.key as LandingPageBriefSuggestField,
              businessType: value.businessType,
              brandName: value.brandName,
              productService: value.productService,
              targetCustomer: value.targetCustomer,
              painPoint: value.painPoint,
              uspBenefits: value.uspBenefits,
              pageGoal,
            }}
            onApply={(text) => onChange({ ...value, [field.key]: text })}
          />
        ) : null}
      </div>
    );
  }
  return (
    <div className="space-y-4" data-lp-ai-brief-fields>
      <div>
        <Label htmlFor="lp-ai-industry">Ngành</Label>
        <select
          id="lp-ai-industry"
          className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={value.businessType}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, businessType: e.target.value })}
        >
          <option value="">Tự nhận diện từ sản phẩm / dịch vụ</option>
          {value.businessType &&
          !LANDING_PAGE_AI_INDUSTRIES.some(([key]) => key === value.businessType) ? (
            <option value={value.businessType}>{value.businessType}</option>
          ) : null}
          {LANDING_PAGE_AI_INDUSTRIES.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(editor)}</div>
      <details className="rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Hình ảnh, thương hiệu và thông tin bổ sung
        </summary>
        <p className="mt-3 text-xs opacity-65">
          Dùng ảnh / logo của bạn hoặc ảnh từ website đã kiểm tra. Khi chưa có ảnh, hệ thống chọn bố
          cục không ảnh; bạn có thể thêm ảnh trong Builder.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              key: 'imageUrl' as const,
              label: 'URL ảnh chính',
              placeholder: 'https://… hoặc /uploads/…',
              max: 2000,
            },
            {
              key: 'logoUrl' as const,
              label: 'URL logo',
              placeholder: 'https://… hoặc /uploads/…',
              max: 2000,
            },
            {
              key: 'brandColor' as const,
              label: 'Màu thương hiệu',
              placeholder: '#2563EB — để trống để dùng màu mẫu',
              max: 32,
            },
            {
              key: 'contactPhone' as const,
              label: 'Số điện thoại liên hệ',
              placeholder: 'Số điện thoại của doanh nghiệp',
              max: 40,
            },
            {
              key: 'contactEmail' as const,
              label: 'Email liên hệ',
              placeholder: 'Email của doanh nghiệp',
              max: 160,
            },
            {
              key: 'contactAddress' as const,
              label: 'Địa chỉ',
              placeholder: 'Địa chỉ đã xác nhận',
              max: 300,
            },
            {
              key: 'guarantee' as const,
              label: 'Cam kết có thật (nếu có)',
              placeholder: 'Chỉ nhập cam kết doanh nghiệp có thể thực hiện',
              max: 400,
              long: true,
            },
            {
              key: 'extraNotes' as const,
              label: 'Ghi chú cho thiết kế và cách viết',
              placeholder:
                'Ví dụ: Giọng nhẹ nhàng, ưu tiên bố cục thoáng. Giá và USP nhập ở các ô riêng phía trên.',
              max: 1200,
              long: true,
            },
          ].map(editor)}
        </div>
      </details>
    </div>
  );
}
