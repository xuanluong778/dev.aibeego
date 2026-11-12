import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiUpload } from '@/lib/api-client';
import type {
  WorkProject,
  WorkProjectDetail,
  WorkTask,
  CreateWorkProjectInput,
  CreateWorkTaskInput,
  UpdateWorkTaskInput,
  MoveWorkTaskInput,
  WorkComment,
  WorkAttachment,
  WorkNotification,
  WorkStatusHistory,
  WorkReviewEvent,
} from '@/types/work-management';

const KEY = ['work-management'] as const;

export function useWorkTask(taskId: string | null | undefined) {
  return useQuery({
    queryKey: [...KEY, 'task', taskId],
    queryFn: () => apiClient<WorkTask>(`/work-management/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

export function useWorkProjects(includeArchived = false) {
  const qs = includeArchived ? '?includeArchived=1' : '';
  return useQuery({
    queryKey: [...KEY, 'projects', includeArchived],
    queryFn: () => apiClient<WorkProject[]>(`/work-management/projects${qs}`),
  });
}

export function useWorkProject(id: string | null) {
  return useQuery({
    queryKey: [...KEY, 'project', id],
    queryFn: () => apiClient<WorkProjectDetail>(`/work-management/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateWorkProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkProjectInput) =>
      apiClient<WorkProject>('/work-management/projects', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkTaskInput) =>
      apiClient<WorkTask>('/work-management/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateWorkTaskInput & { id: string }) =>
      apiClient<WorkTask>(`/work-management/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      if (data?.id) {
        qc.setQueryData([...KEY, 'task', data.id], data);
      }
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useMoveWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: MoveWorkTaskInput & { id: string }) =>
      apiClient<WorkTask>(`/work-management/tasks/${id}/move`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCopyWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<WorkTask>(`/work-management/tasks/${id}/copy`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useArchiveWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/work-management/tasks/${id}/archive`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSoftDeleteWorkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/work-management/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useWorkComments(taskId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'comments', taskId],
    queryFn: () => apiClient<WorkComment[]>(`/work-management/tasks/${taskId}/comments`),
    enabled: !!taskId,
  });
}

export function useCreateWorkComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { body: string; parentId?: string; mentionIds?: string[] }) =>
      apiClient<WorkComment>(`/work-management/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...KEY, 'comments', taskId] });
      qc.invalidateQueries({ queryKey: [...KEY, 'notifications'] });
    },
  });
}

export function useUpdateWorkComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body, mentionIds }: { id: string; body: string; mentionIds?: string[] }) =>
      apiClient<WorkComment>(`/work-management/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ body, mentionIds }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteWorkComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/work-management/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useTaskFiles(taskId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'files', taskId],
    queryFn: () => apiClient<WorkAttachment[]>(`/work-management/tasks/${taskId}/files`),
    enabled: !!taskId,
  });
}

export function useProjectDocuments(projectId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'documents', projectId],
    queryFn: () => apiClient<WorkAttachment[]>(`/work-management/projects/${projectId}/documents`),
    enabled: !!projectId,
  });
}

export function useUploadTaskFile(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload<WorkAttachment>(`/work-management/tasks/${taskId}/files`, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...KEY, 'files', taskId] });
      qc.invalidateQueries({ queryKey: [...KEY, 'documents'] });
      qc.invalidateQueries({ queryKey: [...KEY, 'notifications'] });
    },
  });
}

export function useUploadProjectDocument(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload<WorkAttachment>(`/work-management/projects/${projectId}/documents`, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'documents', projectId] }),
  });
}

export function useDeleteWorkFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/work-management/files/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient(`/work-management/tasks/${id}/submit-review`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient(`/work-management/tasks/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRequestFix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient(`/work-management/tasks/${id}/request-fix`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useTaskStatusHistory(taskId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'history', taskId],
    queryFn: () =>
      apiClient<WorkStatusHistory[]>(`/work-management/tasks/${taskId}/status-history`),
    enabled: !!taskId,
  });
}

export function useTaskReviewEvents(taskId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'reviews', taskId],
    queryFn: () => apiClient<WorkReviewEvent[]>(`/work-management/tasks/${taskId}/review-events`),
    enabled: !!taskId,
  });
}

export function useWorkNotifications() {
  return useQuery({
    queryKey: [...KEY, 'notifications'],
    queryFn: () => apiClient<WorkNotification[]>(`/work-management/notifications`),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/work-management/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient(`/work-management/notifications/read-all`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'notifications'] }),
  });
}

export type WorkTimeLog = {
  id: string;
  taskId: string;
  employeeId: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds: number;
  note?: string | null;
  employee?: { id: string; name: string };
  createdAt: string;
};

export function useTaskTimeLogs(taskId: string | null) {
  return useQuery({
    queryKey: [...KEY, 'time-logs', taskId],
    queryFn: () => apiClient<WorkTimeLog[]>(`/work-management/tasks/${taskId}/time-logs`),
    enabled: !!taskId,
  });
}

export function useStartTaskTimer(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient(`/work-management/tasks/${taskId}/time/start`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'time-logs', taskId] }),
  });
}

export function usePauseTaskTimer(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient(`/work-management/tasks/${taskId}/time/pause`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'time-logs', taskId] }),
  });
}

export function useStopTaskTimer(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient(`/work-management/tasks/${taskId}/time/stop`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'time-logs', taskId] }),
  });
}

export function useManualTaskTime(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { durationMinutes: number; note?: string }) =>
      apiClient(`/work-management/tasks/${taskId}/time/manual`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'time-logs', taskId] }),
  });
}

// ── Insights hooks ───────────────────────────────────────────────────────

export type MyWorkBucketTask = {
  id: string;
  title: string;
  columnName: string;
  columnKey: string;
  priority: string;
  deadline?: string | null;
  risk?: string;
  project?: { id: string; name: string };
};

export type MyWorkData = {
  today: string;
  timezone: string;
  counts: Record<string, number>;
  buckets: Record<string, MyWorkBucketTask[]>;
  warning?: string | null;
};

export function useWorkMyWork() {
  return useQuery({
    queryKey: [...KEY, 'my-work'],
    queryFn: () => apiClient<MyWorkData>('/work-management/my-work'),
    retry: (count, err) => {
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 401) return false;
      return count < 1;
    },
  });
}

export type CalendarEvent = MyWorkBucketTask & { date: string | null };

export function useWorkCalendar(from: string, to: string) {
  return useQuery({
    queryKey: [...KEY, 'calendar', from, to],
    queryFn: () =>
      apiClient<{ events: CalendarEvent[]; timezone: string }>(
        `/work-management/calendar?from=${from}&to=${to}`,
      ),
    enabled: !!from && !!to,
  });
}

export type DashboardGroup = {
  id: string;
  name: string;
  counts: {
    inProgress: number;
    pendingReview: number;
    overdue: number;
    done: number;
    atRisk: number;
    onTimeRate?: string;
  };
  workload?: { score: number; onTimeRate: string };
};

export type DashboardData = {
  today: string;
  timezone: string;
  groupBy: string;
  groups: DashboardGroup[];
  totals?: Record<string, number>;
};

export function useWorkDashboard(groupBy: 'employee' | 'project' = 'employee') {
  return useQuery({
    queryKey: [...KEY, 'dashboard', groupBy],
    queryFn: () =>
      apiClient<DashboardData>(`/work-management/dashboard?groupBy=${groupBy}`),
  });
}

// ── Column rename hook ───────────────────────────────────────────────────

export type WorkBoardColumn = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
};

export function useUpdateWorkColumn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient<WorkBoardColumn>(`/work-management/columns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// ── Export report hook ───────────────────────────────────────────────────

export function useExportWorkReport() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' = 'csv') => {
      const url = `/work-management/export-report?format=${format}`;
      // Use raw fetch to handle binary response
      const { getApiBaseUrl } = await import('@/lib/api-client');
      const { authStorage } = await import('@/lib/auth-storage');
      const baseUrl = getApiBaseUrl();
      const token = authStorage.getAccessToken();
      const res = await fetch(`${baseUrl}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const ext = format === 'xlsx' ? '.xlsx' : '.csv';
      const disp = res.headers.get('content-disposition') ?? '';
      const match = disp.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `work-report${ext}`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    },
  });
}
