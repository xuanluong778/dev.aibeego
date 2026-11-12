/** Conversion CTA / form labels by strategy — shared to avoid circular imports. */

export type CtaStrategy =
  | 'audit'
  | 'booking'
  | 'trial'
  | 'enroll'
  | 'buy'
  | 'reserve'
  | 'register'
  | 'quote'
  | 'consult'
  | 'viewing'
  | 'download'
  | 'demo';

export const CTA_COPY: Record<
  CtaStrategy,
  { ctaLabel: string; formHeadline: string; formSubmit: string }
> = {
  audit: {
    ctaLabel: 'Nhận audit miễn phí',
    formHeadline: 'Đăng ký audit',
    formSubmit: 'Nhận audit',
  },
  booking: {
    ctaLabel: 'Đặt lịch ngay',
    formHeadline: 'Đặt lịch hẹn',
    formSubmit: 'Đặt lịch',
  },
  trial: {
    ctaLabel: 'Dùng thử miễn phí',
    formHeadline: 'Đăng ký dùng thử',
    formSubmit: 'Bắt đầu trial',
  },
  enroll: {
    ctaLabel: 'Đăng ký khóa học',
    formHeadline: 'Đăng ký học',
    formSubmit: 'Enroll ngay',
  },
  buy: {
    ctaLabel: 'Mua ngay',
    formHeadline: 'Đặt mua / nhận tư vấn',
    formSubmit: 'Đặt mua',
  },
  reserve: {
    ctaLabel: 'Đặt bàn',
    formHeadline: 'Đặt bàn / giữ chỗ',
    formSubmit: 'Đặt bàn',
  },
  register: {
    ctaLabel: 'Đăng ký webinar',
    formHeadline: 'Đăng ký tham dự',
    formSubmit: 'Đăng ký ngay',
  },
  quote: {
    ctaLabel: 'Nhận báo giá',
    formHeadline: 'Yêu cầu báo giá',
    formSubmit: 'Gửi yêu cầu',
  },
  consult: {
    ctaLabel: 'Đặt tư vấn',
    formHeadline: 'Đặt lịch tư vấn',
    formSubmit: 'Đặt tư vấn',
  },
  viewing: {
    ctaLabel: 'Đặt lịch xem nhà',
    formHeadline: 'Đăng ký xem dự án',
    formSubmit: 'Đặt lịch xem',
  },
  download: {
    ctaLabel: 'Nhận tài liệu',
    formHeadline: 'Nhận tài liệu miễn phí',
    formSubmit: 'Gửi cho tôi',
  },
  demo: {
    ctaLabel: 'Xem demo',
    formHeadline: 'Đăng ký demo',
    formSubmit: 'Đặt demo',
  },
};
