'use client';

import { useId, useState } from 'react';
import { useUpdateWorkTask, useWorkProject } from '@/hooks/use-work-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WorkTask } from '@/types/work-management';

export function WorkTaskCustomFields({ task }: { task: WorkTask }) {
  const projectQ = useWorkProject(task.projectId);
  const update = useUpdateWorkTask();
  const [values, setValues] = useState<Record<string, unknown>>({ ...task.customFields });
  const [message, setMessage] = useState('');
  const prefix = useId();
  const definitions = projectQ.data?.customFieldDefs ?? [];
  return <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900" aria-label="Thông tin bổ sung của công việc">
    <h3 className="text-sm font-semibold">Thông tin bổ sung</h3>
    {projectQ.isLoading && <p role="status" className="text-sm">Đang tải thông tin…</p>}
    {projectQ.isError && <p role="alert" className="text-sm text-destructive">Không tải được thông tin. <button type="button" className="underline" onClick={() => projectQ.refetch()}>Thử lại</button></p>}
    {projectQ.isSuccess && definitions.length === 0 && <p className="text-sm text-muted-foreground">Dự án chưa có trường thông tin bổ sung. Người quản lý có thể thêm tại Cài đặt dự án.</p>}
    {definitions.map(field => <div key={field.id} className="space-y-1.5">
      <Label htmlFor={`${prefix}-${field.id}`}>{field.name}{field.required ? ' *' : ''}</Label>
      {field.type === 'select' ? <select id={`${prefix}-${field.id}`} className="min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100" value={String(values[field.id] ?? '')}
        onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))}>
        <option value="">Chọn {field.name.toLowerCase()}</option>
        {(field.options ?? []).map(option => <option key={option} value={option}>{option}</option>)}
      </select> : <Input id={`${prefix}-${field.id}`} className="min-h-[44px] border-slate-300 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100" type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} value={String(values[field.id] ?? '')}
        onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} />}
    </div>)}
    {definitions.length > 0 && <Button type="button" className="min-h-[44px]" disabled={update.isPending} onClick={() => {
      const missing = definitions.find(field => field.required && !String(values[field.id] ?? '').trim());
      if (missing) { setMessage(`Vui lòng nhập ${missing.name}.`); return; }
      setMessage('');
      update.mutate({ id: task.id, customFields: values }, { onSuccess: () => setMessage('Đã lưu thông tin bổ sung.'), onError: error => setMessage(error.message) });
    }}>{update.isPending ? 'Đang lưu…' : 'Lưu thông tin bổ sung'}</Button>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
