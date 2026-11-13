'use client';

import {
  AlignLeft,
  CheckCircle2,
  CheckSquare,
  Clock,
  MessageSquare,
} from 'lucide-react';
import type { WorkTask } from '@/types/work-management';
import { formatWorkTaskDateRange } from '@/lib/format';
import { parseWorkLabel } from '@/lib/work-task-detail';
import { cn } from '@/lib/utils';

type WorkTaskBoardCardProps = {
  task: WorkTask;
  /** Fallback when API payload has no projectName (cache cũ) */
  projectNameFallback?: string;
  className?: string;
};

const metaIcon = 'h-3.5 w-3.5 shrink-0 text-white';
const metaText = 'text-white font-semibold tabular-nums';

export function WorkTaskBoardCard({
  task,
  projectNameFallback,
  className,
}: WorkTaskBoardCardProps) {
  const isDone = task.columnKey === 'DONE' || !!task.completedAt;
  const projectName =
    task.projectName || task.project?.name || projectNameFallback || null;
  const dateLabel = formatWorkTaskDateRange(task.startDate, task.deadline);
  const checklistTotal = task.checklist.length;
  const checklistDone = task.checklist.filter((c) => c.isDone).length;
  const commentCount = task.commentCount ?? 0;
  const hasDescription = !!(task.description || '').trim();

  return (
    <div className={cn('space-y-2', className)}>
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 4).map((raw) => {
            const label = parseWorkLabel(raw);
            const title = label.title || label.colorId;
            return (
              <span
                key={raw}
                className="inline-block h-2 min-w-[40px] max-w-full rounded-sm px-0.5"
                style={{ backgroundColor: label.hex }}
                title={title}
              />
            );
          })}
        </div>
      )}

      <TaskTitle isDone={isDone} title={task.title} />

      {projectName ? (
        <p className="text-[11px] font-medium text-white/85 line-clamp-1">{projectName}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
        {dateLabel ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-white',
              isDone ? 'bg-white/20' : 'bg-emerald-600',
            )}
          >
            <Clock className="h-3 w-3 shrink-0 text-white" />
            {dateLabel}
          </span>
        ) : null}
        {hasDescription ? (
          <span title="Có mô tả" className="inline-flex text-white/90">
            <AlignLeft className={metaIcon} />
          </span>
        ) : null}
        <span className={cn('inline-flex items-center gap-1', metaText)} title="Bình luận">
          <MessageSquare className={metaIcon} />
          {commentCount}
        </span>
        {checklistTotal > 0 ? (
          <span
            className={cn(
              'inline-flex items-center gap-1',
              metaText,
              checklistDone === checklistTotal ? 'text-emerald-200' : 'text-white',
            )}
            title="Việc cần làm"
          >
            <CheckSquare className={metaIcon} />
            {checklistDone}/{checklistTotal}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function TaskTitle({ isDone, title }: { isDone: boolean; title: string }) {
  return (
    <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-white">
      {isDone ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
      ) : null}
      <span className={cn(isDone && 'text-white/75 line-through')}>{title}</span>
    </p>
  );
}
