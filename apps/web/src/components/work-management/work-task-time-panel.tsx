'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';
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
  const userQ = useCurrentUser();
  const [now, setNow] = useState(Date.now);
  const logsQ = useTaskTimeLogs(open ? taskId : null);
  const start = useStartTaskTimer(taskId);
  const pause = usePauseTaskTimer(taskId);
  const stop = useStopTaskTimer(taskId);
  const manual = useManualTaskTime(taskId);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const totalSeconds = useMemo(
    () => (logsQ.data ?? []).reduce((s, l) => s + (l.durationSeconds || 0)
      + (l.status === 'RUNNING' && l.startedAt ? Math.max(0, Math.floor((now - Date.parse(l.startedAt)) / 1000)) : 0), 0),
    [logsQ.data, now],
  );

  const running = useMemo(
    () => (logsQ.data ?? []).find((l) => l.status === 'RUNNING' && l.employeeId === userQ.data?.employeeId),
    [logsQ.data, userQ.data?.employeeId],
  );
  const ownOpenTimer = (logsQ.data ?? []).some(l => l.employeeId === userQ.data?.employeeId && ['RUNNING', 'PAUSED'].includes(l.status));
  const busy = start.isPending || pause.isPending || stop.isPending;
  const validMinutes = Number.isFinite(Number(minutes)) && Number(minutes) >= 1 && Number(minutes) <= 1440;
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [open, taskId]);

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
          disabled={!!running || busy || logsQ.isLoading || !userQ.data?.employeeId}
          onClick={() => start.mutate()}
        >
          <Play className="h-3.5 w-3.5" />
          {ownOpenTimer && !running ? 'Tiếp tục' : 'Bắt đầu'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-[40px] gap-1"
          disabled={!running || busy}
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
          disabled={!ownOpenTimer || busy}
        >
          <Square className="h-3.5 w-3.5" />
          Kết thúc
        </Button>
      </div>
      {logsQ.isError && <p role="alert" className="text-sm text-destructive">Không tải được thời gian làm việc. <button type="button" className="underline" onClick={() => logsQ.refetch()}>Thử lại</button></p>}
      {(start.error || pause.error || stop.error || manual.error) && <p role="alert" className="text-sm text-destructive">{(start.error || pause.error || stop.error || manual.error)?.message}</p>}
      {running && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">Đang ghi nhận thời gian…</p>
      )}
      <div className="space-y-2 border-t pt-3">
        <Label className="text-xs">Ghi thêm thủ công (phút)</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            min={1}
            max={1440}
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
            disabled={manual.isPending || !validMinutes || !userQ.data?.employeeId}
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
