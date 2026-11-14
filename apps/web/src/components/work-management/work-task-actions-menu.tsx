'use client';

import { useEffect, useState } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Archive, ArrowLeft, ArrowRightLeft, Check, ChevronRight, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { WorkBoardColumn, WorkTask } from '@/types/work-management';

const itemClass = 'min-h-10 gap-2 cursor-pointer';
const panelClass = 'z-50 w-56 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg';

export function WorkTaskActionsMenu({ task, columns, disabled, onEdit, onMove, onCopy, onArchive, onDelete }: {
  task: WorkTask;
  columns: WorkBoardColumn[];
  disabled: boolean;
  onEdit: () => void;
  onMove: (columnId: string) => void;
  onCopy: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showStatuses, setShowStatuses] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const statuses = columns.map(column => (
    <DropdownMenuItem
      key={column.id}
      className={itemClass}
      disabled={disabled || column.id === task.columnId}
      onSelect={() => onMove(column.id)}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {column.id === task.columnId && <Check className="h-4 w-4" />}
      </span>
      <span className="min-w-0 break-words">{column.name}</span>
      {column.id === task.columnId && <span className="sr-only"> (hiện tại)</span>}
    </DropdownMenuItem>
  ));

  return (
    <DropdownMenu open={open} onOpenChange={value => { setOpen(value); if (!value) setShowStatuses(false); }}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] p-0" aria-label={`Thao tác với ${task.title}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={8} className={panelClass} onClick={event => event.stopPropagation()}>
        {mobile && showStatuses ? <>
          <DropdownMenuItem className={itemClass} onSelect={event => { event.preventDefault(); setShowStatuses(false); }}>
            <ArrowLeft className="h-4 w-4 shrink-0" /> Chuyển trạng thái
          </DropdownMenuItem>
          {statuses}
        </> : <>
          <DropdownMenuItem className={itemClass} disabled={disabled} onSelect={onEdit}>
            <Pencil className="h-4 w-4 shrink-0" /> Chỉnh sửa
          </DropdownMenuItem>
          {mobile ? (
            <DropdownMenuItem className={itemClass} disabled={disabled} onSelect={event => { event.preventDefault(); setShowStatuses(true); }}>
              <ArrowRightLeft className="h-4 w-4 shrink-0" /> Chuyển trạng thái <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
            </DropdownMenuItem>
          ) : (
            <Menu.Sub>
              <Menu.SubTrigger disabled={disabled} className={`relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${itemClass}`}>
                <ArrowRightLeft className="h-4 w-4 shrink-0" /> Chuyển trạng thái <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
              </Menu.SubTrigger>
              <Menu.Portal>
                <Menu.SubContent className={panelClass} sideOffset={6} collisionPadding={8}>{statuses}</Menu.SubContent>
              </Menu.Portal>
            </Menu.Sub>
          )}
          <DropdownMenuItem className={itemClass} disabled={disabled} onSelect={onCopy}>
            <Copy className="h-4 w-4 shrink-0" /> Nhân bản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className={itemClass} disabled={disabled} onSelect={onArchive}>
            <Archive className="h-4 w-4 shrink-0" /> Lưu trữ
          </DropdownMenuItem>
          <DropdownMenuItem className={`${itemClass} text-destructive focus:bg-destructive/10 focus:text-destructive`} disabled={disabled} onSelect={onDelete}>
            <Trash2 className="h-4 w-4 shrink-0" /> Xóa
          </DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
