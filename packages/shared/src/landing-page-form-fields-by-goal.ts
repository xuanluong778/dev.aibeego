/**
 * Goal-aware lead form field packs for catalog templates.
 * Uses existing field types only (no new fieldType).
 */

import type { LandingPageLeadFormField } from './landing-page-types';
import { defaultLeadFormFields } from './landing-page-lifecycle';
import type { LandingPageConversionGoal } from './landing-page-template-foundation';
import { resolveConversionGoal } from './landing-page-template-foundation';
import type { CtaStrategy } from './landing-page-cta-copy';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function leadFormFieldsForConversionGoal(
  goalRaw: unknown,
  ctaStrategy?: CtaStrategy | string,
): LandingPageLeadFormField[] {
  const goal = resolveConversionGoal(goalRaw);
  const strategy = String(ctaStrategy || '');

  if (goal === 'booking' || strategy === 'booking' || strategy === 'reserve') {
    return [
      { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true, placeholder: 'Nguyễn Văn A' },
      { id: uid('f'), name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true, placeholder: '09xx xxx xxx' },
      {
        id: uid('f'),
        name: 'preferred_date',
        label: 'Ngày mong muốn',
        fieldType: 'text',
        required: true,
        placeholder: 'VD: 20/09 hoặc Thứ 5 tuần này',
      },
      {
        id: uid('f'),
        name: 'time_slot',
        label: 'Khung giờ',
        fieldType: 'select',
        required: true,
        options: ['Sáng (8–11h)', 'Trưa (11–14h)', 'Chiều (14–17h)', 'Tối (17–20h)'],
      },
      {
        id: uid('f'),
        name: 'service',
        label: 'Dịch vụ quan tâm',
        fieldType: 'text',
        required: false,
        placeholder: 'Khám / liệu trình / tư vấn',
      },
    ];
  }

  if (goal === 'signup' || strategy === 'trial' || strategy === 'demo' || strategy === 'register' || strategy === 'enroll') {
    return [
      { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true, placeholder: 'Nguyễn Văn A' },
      {
        id: uid('f'),
        name: 'email',
        label: 'Work email',
        fieldType: 'email',
        required: true,
        placeholder: 'ban@congty.com',
      },
      {
        id: uid('f'),
        name: 'company',
        label: 'Công ty',
        fieldType: 'text',
        required: true,
        placeholder: 'Tên công ty',
      },
      {
        id: uid('f'),
        name: 'team_size',
        label: 'Quy mô team',
        fieldType: 'select',
        required: false,
        options: ['1–5', '6–20', '21–50', '50+'],
      },
    ];
  }

  if (goal === 'purchase' || strategy === 'buy') {
    return [
      { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true },
      { id: uid('f'), name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true },
      { id: uid('f'), name: 'email', label: 'Email nhận đơn', fieldType: 'email', required: true },
      {
        id: uid('f'),
        name: 'quantity',
        label: 'Số lượng',
        fieldType: 'select',
        required: false,
        options: ['1', '2', '3–5', '6+'],
      },
    ];
  }

  if (goal === 'download' || strategy === 'download') {
    return [
      { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true },
      { id: uid('f'), name: 'email', label: 'Email nhận tài liệu', fieldType: 'email', required: true },
      {
        id: uid('f'),
        name: 'role',
        label: 'Vai trò',
        fieldType: 'select',
        required: false,
        options: ['Founder', 'Marketer', 'Sales', 'Khác'],
      },
    ];
  }

  if (goal === 'contact' || strategy === 'consult' || strategy === 'quote' || strategy === 'audit') {
    return [
      { id: uid('f'), name: 'name', label: 'Họ tên', fieldType: 'text', required: true },
      { id: uid('f'), name: 'phone', label: 'Số điện thoại', fieldType: 'tel', required: true },
      { id: uid('f'), name: 'email', label: 'Email', fieldType: 'email', required: false },
      {
        id: uid('f'),
        name: 'need',
        label: 'Nhu cầu tư vấn',
        fieldType: 'textarea',
        required: false,
        placeholder: 'Mục tiêu dự án, ngân sách dự kiến và timeline',
      },
    ];
  }

  // lead default
  return defaultLeadFormFields();
}

export function conversionGoalFromCta(strategy: CtaStrategy | string): LandingPageConversionGoal {
  return resolveConversionGoal(
    strategy === 'booking' || strategy === 'reserve'
      ? 'booking'
      : strategy === 'buy'
        ? 'purchase'
        : strategy === 'trial' || strategy === 'demo' || strategy === 'register' || strategy === 'enroll'
          ? 'signup'
          : strategy === 'download'
            ? 'download'
            : strategy === 'consult' || strategy === 'quote'
              ? 'contact'
              : 'lead',
  );
}
