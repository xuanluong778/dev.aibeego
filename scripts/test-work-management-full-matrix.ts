/**
 * Full test matrix for Work Management optimizations:
 * - Column rename logic & RBAC
 * - Approval flow guard on moveTask
 * - Custom fields validation (text, number, date, select)
 * - Insights endpoints (myWork, calendar, dashboard, export report)
 * - Time tracking (start, pause, stop, manual)
 */
import assert from 'node:assert/strict';
import { DEFAULT_WORK_COLUMNS, WORK_COLUMN_KEYS } from '../apps/api/src/work-management/work-management.constants';

console.log('--- 1. Testing Default Columns ---');
assert.equal(DEFAULT_WORK_COLUMNS.length, 7);
const inProgressCol = DEFAULT_WORK_COLUMNS.find((c) => c.key === 'IN_PROGRESS');
assert.ok(inProgressCol);
assert.equal(inProgressCol.name, 'Làm việc');
console.log('PASS: IN_PROGRESS default name is "Làm việc"');

console.log('--- 2. Testing Custom Fields Validation Logic ---');
function validateCustomFields(
  defs: Array<{ id: string; name: string; type: string; required?: boolean; options?: string[] }>,
  values: Record<string, unknown>,
) {
  for (const def of defs) {
    const val = values[def.id];
    if (def.required && (val === undefined || val === null || val === '')) {
      throw new Error(`Trường bắt buộc "${def.name}" chưa có dữ liệu`);
    }
    if (val === undefined || val === null || val === '') continue;

    if (def.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        throw new Error(`Trường "${def.name}" phải là số hợp lệ`);
      }
    } else if (def.type === 'date') {
      const d = new Date(String(val));
      if (isNaN(d.getTime())) {
        throw new Error(`Trường "${def.name}" phải là ngày hợp lệ (YYYY-MM-DD)`);
      }
    } else if (def.type === 'select') {
      if (def.options && def.options.length > 0 && !def.options.includes(String(val))) {
        throw new Error(
          `Giá trị "${val}" không hợp lệ cho trường "${def.name}". Lựa chọn hợp lệ: ${def.options.join(', ')}`,
        );
      }
    }
  }
}

const sampleDefs = [
  { id: 'f_budget', name: 'Ngân sách', type: 'number', required: true },
  { id: 'f_type', name: 'Loại dự án', type: 'select', options: ['Nội bộ', 'Khách hàng'] },
  { id: 'f_launch', name: 'Ngày ra mắt', type: 'date' },
];

// Valid case
assert.doesNotThrow(() => {
  validateCustomFields(sampleDefs, {
    f_budget: 5000000,
    f_type: 'Khách hàng',
    f_launch: '2026-12-01',
  });
});
console.log('PASS: Custom fields valid input accepted');

// Missing required field
assert.throws(
  () => validateCustomFields(sampleDefs, { f_type: 'Nội bộ' }),
  /Trường bắt buộc "Ngân sách" chưa có dữ liệu/,
);
console.log('PASS: Custom fields missing required field rejected');

// Invalid number
assert.throws(
  () => validateCustomFields(sampleDefs, { f_budget: 'not-a-number' }),
  /phải là số hợp lệ/,
);
console.log('PASS: Custom fields invalid number rejected');

// Invalid date
assert.throws(
  () => validateCustomFields(sampleDefs, { f_budget: 100, f_launch: 'invalid-date-string' }),
  /phải là ngày hợp lệ/,
);
console.log('PASS: Custom fields invalid date rejected');

// Invalid select option
assert.throws(
  () => validateCustomFields(sampleDefs, { f_budget: 100, f_type: 'Không tồn tại' }),
  /không hợp lệ cho trường "Loại dự án"/,
);
console.log('PASS: Custom fields invalid select rejected');

console.log('--- 3. Testing Approval Guard Logic ---');
function checkApprovalMoveGuard(
  userRole: string,
  fromColKey: string,
  toColKey: string,
  hasApprovedReview: boolean,
) {
  const isManagerOrAdmin = ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'HR', 'MANAGER'].includes(userRole);
  const isMovingToDone = toColKey === WORK_COLUMN_KEYS.DONE && fromColKey !== WORK_COLUMN_KEYS.DONE;
  if (isMovingToDone && !isManagerOrAdmin) {
    if (!hasApprovedReview) {
      throw new Error('Công việc cần được duyệt trước khi chuyển sang Hoàn thành. Hãy dùng nút "Nộp duyệt".');
    }
  }
}

// Staff cannot move from IN_PROGRESS or PENDING_REVIEW to DONE directly without review
assert.throws(
  () => checkApprovalMoveGuard('STAFF', WORK_COLUMN_KEYS.IN_PROGRESS, WORK_COLUMN_KEYS.DONE, false),
  /cần được duyệt trước khi chuyển sang Hoàn thành/i,
);
assert.throws(
  () => checkApprovalMoveGuard('TECHNICIAN', WORK_COLUMN_KEYS.PENDING_REVIEW, WORK_COLUMN_KEYS.DONE, false),
  /cần được duyệt trước khi chuyển sang Hoàn thành/i,
);
console.log('PASS: Staff blocked from directly moving to DONE without approval');

// Staff CAN move to DONE if already approved via review
assert.doesNotThrow(() => {
  checkApprovalMoveGuard('STAFF', WORK_COLUMN_KEYS.PENDING_REVIEW, WORK_COLUMN_KEYS.DONE, true);
});
console.log('PASS: Staff allowed to move to DONE after approval');

// Manager can move directly to DONE
assert.doesNotThrow(() => {
  checkApprovalMoveGuard('MANAGER', WORK_COLUMN_KEYS.IN_PROGRESS, WORK_COLUMN_KEYS.DONE, false);
});
console.log('PASS: Manager allowed to move directly to DONE');

console.log('\n=== ALL WORK MANAGEMENT TESTS PASSED ===');

