#!/usr/bin/env node
/**
 * Test gate for Landing Page "Trang của tôi" list/table redesign:
 * - Table layout with thumbnail, page name, status, modified date, visits, leads, registration rate, 3-dot menu
 * - Exact button text "Tạo landing page"
 * - Vietnamese localization of all filters, labels, actions
 * - UI-only natural Vietnamese name translation + (copy) -> (bản sao)
 * - Three-dot menu preserving duplicate/unpublish/archive (no "Xóa")
 * - Placeholder for missing thumbnail, "—" for missing stats
 * - Loading, error, empty states
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pageFile = path.join(root, 'apps/web/src/app/(app)/landing-pages/pages/page.tsx');
const translatorFile = path.join(
  root,
  'apps/web/src/components/landing-pages/landing-page-name-translator.ts',
);
const viFile = path.join(root, 'apps/web/src/i18n/dictionaries/vi.ts');

const pageContent = fs.readFileSync(pageFile, 'utf8');
const translatorContent = fs.readFileSync(translatorFile, 'utf8');
const viContent = fs.readFileSync(viFile, 'utf8');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' ' + detail : ''));
}

// 1. Button exact text
gate(
  'BUTTON_EXACT_LABEL',
  pageContent.includes('Tạo landing page') &&
    pageContent.includes('/landing-pages/create'),
  'New page button must be exactly "Tạo landing page" and link to create wizard',
);

// 2. Table columns
gate(
  'TABLE_COLUMNS',
  pageContent.includes('<TableHead') &&
    pageContent.includes('Tên') &&
    pageContent.includes('Trạng thái') &&
    pageContent.includes('Đã sửa vào') &&
    pageContent.includes('Lượt truy cập') &&
    pageContent.includes('Khách hàng tiềm năng') &&
    pageContent.includes('Tỷ lệ đăng ký'),
  'Table includes preview, name, status, modified date, visits, leads, registration rate, action columns',
);

// 3. Vietnamese filters & localization
gate(
  'VIETNAMESE_FILTERS_AND_LABELS',
  pageContent.includes("'Tất cả'") &&
    pageContent.includes("'Đã xuất bản'") &&
    pageContent.includes("'Bản nháp'") &&
    pageContent.includes("'Đã lưu trữ'") &&
    !pageContent.includes('myPagesDesc'),
  'All filters are localized to Vietnamese; English description under header removed',
);

// 4. Three-dot menu actions (includes "Lưu trữ" and "Xóa" with Trash2)
gate(
  'THREE_DOT_MENU_ACTIONS',
  pageContent.includes('Chỉnh sửa thiết kế') &&
    pageContent.includes('Xem trang công khai') &&
    pageContent.includes('Nhân đôi') &&
    pageContent.includes('Gỡ xuất bản') &&
    pageContent.includes('Lưu trữ') &&
    pageContent.includes('Xóa') &&
    pageContent.includes('Trash2') &&
    pageContent.includes('DropdownMenuContent'),
  'Three-dot menu contains all actions: builder, duplicate, unpublish, archive and delete (Trash2)',
);

// 4b. Checkbox selection & sticky/fixed action bar with delete button next to "Đã lưu trữ"
gate(
  'SELECTION_AND_FIXED_DELETE',
  pageContent.includes('Checkbox') &&
    pageContent.includes('Chọn tất cả') &&
    pageContent.includes('selectedIds') &&
    pageContent.includes('sticky top-16 z-20') &&
    pageContent.includes('deleteSelected') &&
    pageContent.includes('/landing-pages/bulk-delete'),
  'Checkboxes in front of thumbnails + Select all in header + Sticky fixed bar + Delete button next to "Đã lưu trữ"',
);

// 5. Name translation & copy suffix logic
gate(
  'NAME_TRANSLATION_LOGIC',
  translatorContent.includes('formatLandingPageDisplayName') &&
    translatorContent.includes('Tiếp thị chuyên nghiệp') &&
    translatorContent.includes('(bản sao') &&
    translatorContent.includes('Hồ sơ năng lực Agency') &&
    translatorContent.includes('Phản hồi trực tiếp nền tối') &&
    translatorContent.includes('Bán hàng Editorial tông kem'),
  'Translator module converts template names and (copy) suffix to natural Vietnamese',
);

// 6. Thumbnail placeholder & missing stats placeholder ("—")
gate(
  'PLACEHOLDER_AND_STATS_HANDLING',
  pageContent.includes('PageThumbnail') &&
    pageContent.includes('LayoutTemplate') &&
    pageContent.includes("p.visits != null ? p.visits.toLocaleString('vi-VN') : '—'") &&
    pageContent.includes("p.leads != null ? p.leads.toLocaleString('vi-VN') : '—'") &&
    pageContent.includes("p.conversionRate != null ? `${p.conversionRate}%` : '—'"),
  'Uses thumbnail placeholder when missing and displays "—" for missing stats without faking data',
);

// 7. Responsive, loading skeleton, empty and error states
gate(
  'UX_STATES',
  pageContent.includes('overflow-x-auto') &&
    pageContent.includes('animate-pulse') &&
    pageContent.includes('Chưa có landing page nào') &&
    pageContent.includes('Thử lại'),
  'Responsive scroll, loading skeleton, empty state with CTA, and error retry',
);

// 8. Runtime test of name translator
const vm = require('vm');
const tsCode = fs.readFileSync(translatorFile, 'utf8')
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  .replace(/: Record<[^>]+>/g, '')
  .replace(/\?: string \| null/g, '')
  .replace(/: string \| null/g, '')
  .replace(/: string/g, '');

const context = { console };
vm.createContext(context);
vm.runInContext(tsCode + '\nthis.formatLandingPageDisplayName = formatLandingPageDisplayName;', context);
const formatLandingPageDisplayName = context.formatLandingPageDisplayName;

const testCases = [
  { in: 'Marketing pro', out: 'Tiếp thị chuyên nghiệp' },
  { in: 'Marketing pro (copy)', out: 'Tiếp thị chuyên nghiệp (bản sao)' },
  { in: 'Marketing pro (copy 2)', out: 'Tiếp thị chuyên nghiệp (bản sao 2)' },
  { in: 'Agency Portfolio · Split Hero', out: 'Hồ sơ năng lực Agency · Hero chia đôi' },
  {
    in: 'Agency Portfolio · Cream Editorial Sales',
    out: 'Hồ sơ năng lực Agency · Bán hàng Editorial tông kem',
  },
  {
    in: 'Agency Portfolio · Dark Direct-Response',
    out: 'Hồ sơ năng lực Agency · Phản hồi trực tiếp nền tối',
  },
  {
    in: 'Agency Portfolio · Dark Direct-Response (copy)',
    out: 'Hồ sơ năng lực Agency · Phản hồi trực tiếp nền tối (bản sao)',
  },
  { in: 'Landing-page-6aa263f6c771a', out: 'Trang-đích-6aa263f6c771a' },
  { in: "Trần Gia Bảo's Spa", out: "Trần Gia Bảo's Spa" },
  { in: "Trần Gia Bảo's Spa (copy)", out: "Trần Gia Bảo's Spa (bản sao)" },
];

let runtimeOk = true;
for (const tc of testCases) {
  const actual = formatLandingPageDisplayName(tc.in);
  if (actual !== tc.out) {
    console.error(`Mismatch: "${tc.in}" -> expected "${tc.out}", got "${actual}"`);
    runtimeOk = false;
  }
}

gate(
  'NAME_TRANSLATOR_RUNTIME',
  runtimeOk,
  'Runtime name translations match all expected Vietnamese mappings and copy suffixes',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('\nOVERALL RESULT: ' + (failed.length === 0 ? 'PASS' : 'FAIL'));
process.exit(failed.length ? 1 : 0);
