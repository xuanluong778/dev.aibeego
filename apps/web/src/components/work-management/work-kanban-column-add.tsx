'use client';

import { useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type WorkKanbanColumnAddProps = {
  columnId: string;
  active: boolean;
  title: string;
  disabled?: boolean;
  onActivate: () => void;
  onTitleChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function WorkKanbanColumnAdd({
  columnId,
  active,
  title,
  disabled,
  onActivate,
  onTitleChange,
  onCancel,
  onSubmit,
}: WorkKanbanColumnAddProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active, columnId]);

  if (active) {
    return (
      <div
        className="shrink-0 space-y-2 border-t border-border bg-background/80 p-2 backdrop-blur-sm"
        data-column-id={columnId}
      >
        <Input
          ref={inputRef}
          value={title}
          disabled={disabled}
          placeholder="Nhập tên công việc, ví dụ: Cài win"
          className="h-9 border-white/15 bg-background text-sm text-foreground"
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={disabled || !title.trim()}
            onClick={onSubmit}
          >
            Thêm công việc
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Đóng"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border bg-muted/40 p-2">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm font-semibold',
          'text-foreground hover:bg-accent hover:text-accent-foreground',
        )}
        onClick={onActivate}
      >
        <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        Thêm công việc
      </button>
    </div>
  );
}
