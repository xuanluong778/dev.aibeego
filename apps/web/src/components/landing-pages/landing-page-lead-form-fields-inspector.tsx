'use client';

/**
 * Lead form field list editor — CRUD on block.fields (sanitize already allows ≤20).
 * Lives in Content inspector alongside CRM.
 */

import type {
  LandingPageLeadFormBlock,
  LandingPageLeadFormField,
  LandingPageLeadFormFieldType,
} from '@marketingspa/shared';
import {
  InspectorAccordion,
  InspectorFieldLabel,
} from './landing-page-inspector-ui';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FIELD_TYPES: Array<{ value: LandingPageLeadFormFieldType; label: string }> = [
  { value: 'text', label: 'Văn bản' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Điện thoại' },
  { value: 'textarea', label: 'Đoạn văn' },
  { value: 'select', label: 'Danh sách chọn' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
];

function uidField() {
  return `f_${Math.random().toString(36).slice(2, 10)}`;
}

type Props = {
  block: LandingPageLeadFormBlock;
  onChange: (fields: LandingPageLeadFormField[]) => void;
};

export function LandingPageLeadFormFieldsInspector({ block, onChange }: Props) {
  const fields = Array.isArray(block.fields) ? block.fields : [];

  function patchAt(index: number, patch: Partial<LandingPageLeadFormField>) {
    const next = fields.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    onChange(next);
  }

  function remove(index: number) {
    if (fields.length <= 1) return;
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    if (fields.length >= 20) return;
    onChange([
      ...fields,
      {
        id: uidField(),
        name: `field_${fields.length + 1}`,
        label: 'Trường mới',
        fieldType: 'text',
        required: false,
        placeholder: '',
      },
    ]);
  }

  return (
    <InspectorAccordion title="Trường biểu mẫu" data-lp="form-fields" defaultOpen>
      <div className="space-y-2" data-lp-form-fields-inspector>
        {fields.map((row, index) => (
          <div
            key={row.id}
            className="space-y-1.5 rounded-md border border-white/10 bg-black/20 p-2"
            data-lp-form-field-row={row.id}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase text-white/50">
                #{index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/5 disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  title="Lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/5 disabled:opacity-30"
                  disabled={index >= fields.length - 1}
                  onClick={() => move(index, 1)}
                  title="Xuống"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded border border-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/5',
                    fields.length <= 1 && 'opacity-30',
                  )}
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  title="Xóa"
                >
                  Xóa
                </button>
              </div>
            </div>

            <InspectorFieldLabel>Nhãn</InspectorFieldLabel>
            <Input
              className="h-8 text-xs"
              value={row.label}
              onChange={(e) => patchAt(index, { label: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-1.5">
              <label className="text-[10px]">
                <span className="mb-0.5 block opacity-60">Tên (name)</span>
                <Input
                  className="h-8 text-xs"
                  value={row.name}
                  onChange={(e) =>
                    patchAt(index, {
                      name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40),
                    })
                  }
                />
              </label>
              <label className="text-[10px]">
                <span className="mb-0.5 block opacity-60">Loại</span>
                <select
                  className="lp-dark-select h-8 w-full rounded-md border border-white/10 bg-zinc-900 px-1.5 text-xs text-white"
                  value={row.fieldType}
                  onChange={(e) =>
                    patchAt(index, {
                      fieldType: e.target.value as LandingPageLeadFormFieldType,
                    })
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <InspectorFieldLabel>Placeholder</InspectorFieldLabel>
            <Input
              className="h-8 text-xs"
              value={row.placeholder || ''}
              onChange={(e) => patchAt(index, { placeholder: e.target.value })}
            />

            {(row.fieldType === 'select' ||
              row.fieldType === 'checkbox' ||
              row.fieldType === 'radio') && (
              <>
                <InspectorFieldLabel>Tùy chọn (mỗi dòng 1)</InspectorFieldLabel>
                <textarea
                  className="min-h-[56px] w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white outline-none focus:border-orange-400/50"
                  value={(row.options || []).join('\n')}
                  onChange={(e) =>
                    patchAt(index, {
                      options: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 30),
                    })
                  }
                />
              </>
            )}

            <label className="flex items-center gap-2 text-[11px] text-white/70">
              <input
                type="checkbox"
                checked={row.required === true}
                onChange={(e) => patchAt(index, { required: e.target.checked })}
              />
              Bắt buộc
            </label>
          </div>
        ))}

        <button
          type="button"
          className="w-full rounded-md border border-dashed border-white/20 px-2 py-1.5 text-[11px] text-white/70 hover:bg-white/5 disabled:opacity-40"
          disabled={fields.length >= 20}
          onClick={addField}
        >
          + Thêm trường {fields.length >= 20 ? '(tối đa 20)' : ''}
        </button>
      </div>
    </InspectorAccordion>
  );
}
