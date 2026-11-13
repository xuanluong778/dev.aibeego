'use client';

import { useMemo, useState } from 'react';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useManualTaskTime,
  usePauseTaskTimer,
  useStartTaskTimer,
  useStopTaskTimer,
  useTaskTimeLogs,
} from '@/hooks/use-work-management';

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
}

export function WorkTaskTimePanel({ taskId, open }: { taskId: string; open: boolean }) {
  const logsQ = useTaskTimeLogs(open ? taskId : null);
  const start = useStartTaskTimer(taskId);
  const pause = usePauseTaskTimer(taskId);
  const stop = useStopTaskTimer(taskId);
  const manual = useManualTaskTime(taskId);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const totalSeconds = useMemo(
    () => (logsQ.data ?? []).reduce((s, l) => s + (l.durationSeconds || 0), 0),
    [logsQ.data],
  );

  const running = useMemo(
    () => (logsQ.data ?? []).find((l) => l.status === 'RUNNING'),
    [logsQ.data],
  );

  if (!open) return null;

  return (
    <section className="rounded-xl border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <Clock className="h-4 w-4" />
        Thời gian làm việc
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          Tổng: {formatDuration(totalSeconds)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="min-h-[40px] gap-1"
          disabled={!!running || start.isPending}
          onClick={() => start.mutate()}
        >
          <Play className="h-3.5 w-3.5" />
          Bắt đầu
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-[40px] gap-1"
          disabled={!running || pause.isPending}
          onClick={() => pause.mutate()}
        >
          <Pause className="h-3.5 w-3.5" />
          Tạm dừng
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="min-h-[40px] gap-1"
          onClick={() => stop.mutate()}
          disabled={stop.isPending}
        >
          <Square className="h-3.5 w-3.5" />
          Kết thúc
        </Button>
      </div>
      {running && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">Đang ghi nhận thời gian…</p>
      )}
      <div className="space-y-2 border-t pt-3">
        <Label className="text-xs">Ghi thêm thủ công (phút)</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            min={1}
            max={600}
            className="h-10 w-24"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          <Input
            className="h-10 flex-1 min-w-[140px]"
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            className="min-h-[40px]"
            disabled={manual.isPending || Number(minutes) < 1}
            onClick={() =>
              manual.mutate({
                durationMinutes: Number(minutes),
                note: note.trim() || undefined,
              })
            }
          >
            Lưu
          </Button>
        </div>
      </div>
    </section>
  );
}
