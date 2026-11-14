'use client';

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateWorkProject } from '@/hooks/use-work-management';
import type { WorkCustomFieldDef, WorkProjectDetail } from '@/types/work-management';

type Props = {
  project: WorkProjectDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchived?: () => void;
};

export function WorkProjectSettingsDialog({ project, open, onOpenChange, onArchived }: Props) {
  const update = useUpdateWorkProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [archived, setArchived] = useState(false);
  const [fields, setFields] = useState<WorkCustomFieldDef[]>([]);

  useEffect(() => {
    if (!project || !open) return;
    setName(project.name);
    setDescription(project.description || '');
    setArchived(project.isArchived);
    setFields([...(project.customFieldDefs ?? [])]);
  }, [project, open]);

  function addField() {
    const id = `field_${crypto.randomUUID()}`;
    setFields((prev) => [...prev, { id, name: 'Trường mới', type: 'text' }]);
  }

  function save() {
    if (!project || !name.trim()) return;
    update.mutate(
      {
        id: project.id,
        name: name.trim(),
        description: description.trim() || null,
        isArchived: archived,
        customFieldDefs: fields.map((f) => ({
          ...f,
          name: f.name.trim() || 'Trường',
          options: f.type === 'select' ? [...new Set((f.options ?? []).map(option => option.trim()).filter(Boolean))] : undefined,
        })),
      },
      {
        onSuccess: () => {
          if (archived) onArchived?.();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" closeOnlyWithButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5" />
            Cài đặt dự án
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <Label>Tên dự án *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Mô tả (tuỳ chọn)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mục tiêu dự án, ghi chú ngắn…"
            />
          </div>
          <label className="flex items-center gap-2 rounded-lg border p-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            <span>
              <span className="font-medium">Lưu trữ dự án</span>
              <span className="block text-xs text-muted-foreground">Ẩn khỏi danh sách mặc định, vẫn xem được khi bật &quot;Hiện dự án đã lưu&quot;</span>
            </span>
          </label>
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">Trường thông tin thêm (tuỳ chọn)</p>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                + Thêm trường
              </Button>
            </div>
            {!fields.length && (
              <p className="text-xs text-muted-foreground">Chưa có trường tùy chỉnh. Thêm nếu cần ghi thêm thông tin trên từng việc.</p>
            )}
            {fields.map((f, i) => (
              <div key={f.id} className="flex flex-wrap gap-2 rounded-lg border p-3">
                <Input
                  className="h-9 flex-1 min-w-[120px]"
                  value={f.name}
                  onChange={(e) =>
                    setFields((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Tên trường"
                />
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={f.type}
                  onChange={(e) =>
                    setFields((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, type: e.target.value as WorkCustomFieldDef['type'] } : x,
                      ),
                    )
                  }
                >
                  <option value="text">Chữ</option>
                  <option value="number">Số</option>
                  <option value="date">Ngày</option>
                  <option value="select">Chọn một</option>
                </select>
                {f.type === 'select' && <Input aria-label={`Lựa chọn cho ${f.name}`} placeholder="Các lựa chọn, ngăn cách bằng dấu phẩy"
                  className="min-h-[44px] w-full" value={(f.options ?? []).join(', ')}
                  onChange={event => setFields(previous => previous.map((field, index) => index === i ? { ...field, options: event.target.value.split(',').map(value => value.trim()) } : field))} />}
                <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={!!f.required}
                  onChange={event => setFields(previous => previous.map((field, index) => index === i ? { ...field, required: event.target.checked } : field))} />Bắt buộc nhập khi tạo việc</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setFields((prev) => prev.filter((_, j) => j !== i))}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        </div>
        {update.error && <p role="alert" className="text-sm text-destructive">{update.error.message}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={save} disabled={update.isPending || !name.trim()}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
