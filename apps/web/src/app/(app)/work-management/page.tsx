'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings2,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/page-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useWorkProjects,
  useWorkProject,
  useCreateWorkProject,
  useCreateWorkTask,
  useUpdateWorkTask,
  useMoveWorkTask,
  useCopyWorkTask,
  useArchiveWorkTask,
  useSoftDeleteWorkTask,
  useUpdateWorkColumn,
} from '@/hooks/use-work-management';
import { useHrmEmployees } from '@/hooks/use-hrm';
import { useCurrentUser, hasPermission } from '@/hooks/use-auth';
import { WorkEmployeePicker } from '@/components/work-management/work-employee-picker';
import { PRIORITY_LABELS, type WorkTask } from '@/types/work-management';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { useT } from '@/i18n/i18n-provider';
import {
  WorkDocumentsPanel,
  WorkNotificationsBell,
  WorkTaskDetailDialog,
} from '@/components/work-management/work-task-collab';
import { WorkManagementSubNav } from '@/components/work-management/work-management-subnav';
import { WorkProjectSettingsDialog } from '@/components/work-management/work-project-settings-dialog';
import { WorkTaskBoardCard } from '@/components/work-management/work-task-board-card';
import { WorkTaskActionsMenu } from '@/components/work-management/work-task-actions-menu';
import { WorkKanbanColumnAdd } from '@/components/work-management/work-kanban-column-add';
import { matchesWorkDeadline } from '@/lib/work-board-filters';

const WORK_LAST_PROJECT_ID = 'work-management:lastProjectId';

function readInitialProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  const fromUrl = new URLSearchParams(window.location.search).get('projectId');
  if (fromUrl) return fromUrl;
  try {
    return localStorage.getItem(WORK_LAST_PROJECT_ID);
  } catch {
    return null;
  }
}

function readInitialWorkflow(): string {
  // Không khôi phục lọc giai đoạn cũ (vd. Hoàn thành) — tránh ẩn thẻ / nhầm cột
  return 'all';
}

export default function WorkManagementPage() {
  const t = useT();
  return (
    <Suspense fallback={<LoadingState message={t('work.loadingWork')} />}>
      <WorkManagementBoard />
    </Suspense>
  );
}

function WorkManagementBoard() {
  const t = useT();
  const userQ = useCurrentUser();
  const canCreateProject = hasPermission(userQ.data, 'work.project.write');
  const canWriteTask = hasPermission(userQ.data, 'work.task.write');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get('taskId');

  const [includeArchived, setIncludeArchived] = useState(false);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  /** `all` | `open` | `key:NEW` | `key:DONE` … — lọc theo giai đoạn (columnKey), không phải ẩn thẻ ở cột khác vô lý */
  const [workflowFilter, setWorkflowFilter] = useState<string>(readInitialWorkflow);
  const projectsQ = useWorkProjects(includeArchived);
  const createProject = useCreateWorkProject();
  const createTask = useCreateWorkTask();
  const updateTask = useUpdateWorkTask();
  const moveTask = useMoveWorkTask();
  const copyTask = useCopyWorkTask();
  const archiveTask = useArchiveWorkTask();
  const deleteTask = useSoftDeleteWorkTask();
  const employeesQ = useHrmEmployees({ pageSize: 100 });

  const [projectId, setProjectId] = useState<string | null>(readInitialProjectId);
  const projectQ = useWorkProject(projectId);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [projectCreateError, setProjectCreateError] = useState<string | null>(null);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [taskActionError, setTaskActionError] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<WorkTask | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string | undefined>(undefined);
  const [docsOpen, setDocsOpen] = useState(false);

  const [projectDialog, setProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const [taskDialog, setTaskDialog] = useState(false);
  const [editTask, setEditTask] = useState<WorkTask | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailSnapshot, setDetailSnapshot] = useState<WorkTask | null>(null);
  const [renameColumnId, setRenameColumnId] = useState<string | null>(null);
  const [renameColumnName, setRenameColumnName] = useState('');
  const updateColumn = useUpdateWorkColumn();

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignerId: '',
    assigneeIds: [] as string[],
    watcherIds: [] as string[],
    startDate: '',
    deadline: '',
    priority: 'MEDIUM',
    labels: '',
    progress: 0,
    checklistText: '',
    customFields: {} as Record<string, any>,
  });

  const projects = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);
  const employees = employeesQ.data?.items ?? [];
  const firstProjectId = projects[0]?.id;

  const patchBoardUrl = useCallback(
    (patch: { projectId?: string | null; workflow?: string; taskId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.projectId !== undefined) {
        if (patch.projectId) params.set('projectId', patch.projectId);
        else params.delete('projectId');
      }
      if (patch.workflow !== undefined) {
        if (patch.workflow && patch.workflow !== 'all') params.set('workflow', patch.workflow);
        else params.delete('workflow');
      }
      if (patch.taskId !== undefined) {
        if (patch.taskId) params.set('taskId', patch.taskId);
        else params.delete('taskId');
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectProject = useCallback(
    (id: string) => {
      setProjectId(id);
      try {
        localStorage.setItem(WORK_LAST_PROJECT_ID, id);
      } catch {
        /* ignore */
      }
      patchBoardUrl({ projectId: id });
    },
    [patchBoardUrl],
  );

  useEffect(() => {
    if (!projects.length) return;
    if (projectId && projects.some((p) => p.id === projectId)) {
      const urlPid = searchParams.get('projectId');
      if (urlPid !== projectId) {
        try {
          localStorage.setItem(WORK_LAST_PROJECT_ID, projectId);
        } catch {
          /* ignore */
        }
        patchBoardUrl({ projectId });
      }
      return;
    }
    if (firstProjectId) selectProject(firstProjectId);
  }, [projects, projectId, firstProjectId, selectProject, patchBoardUrl, searchParams]);

  const setTaskIdInUrl = useCallback(
    (id: string | null) => {
      patchBoardUrl({ taskId: id });
    },
    [patchBoardUrl],
  );

  const setWorkflowFilterPersisted = useCallback(
    (value: string) => {
      setWorkflowFilter(value);
      patchBoardUrl({ workflow: value });
    },
    [patchBoardUrl],
  );

  useEffect(() => {
    setWorkflowFilter('all');
    const wf = searchParams.get('workflow');
    if (wf && wf !== 'all') patchBoardUrl({ workflow: 'all' });
  }, [patchBoardUrl, searchParams]);

  const openTaskDetail = useCallback(
    (task: WorkTask) => {
      setDetailSnapshot(task);
      setDetailTaskId(task.id);
      if (task.projectId) selectProject(task.projectId);
      setTaskIdInUrl(task.id);
    },
    [selectProject, setTaskIdInUrl],
  );

  const openTaskDetailById = useCallback(
    (id: string, nextProjectId?: string | null) => {
      setDetailTaskId(id);
      if (nextProjectId) selectProject(nextProjectId);
      const found = (projectQ.data?.tasks ?? []).find((t) => t.id === id);
      setDetailSnapshot(found ?? null);
      setTaskIdInUrl(id);
    },
    [projectQ.data?.tasks, selectProject, setTaskIdInUrl],
  );

  const closeTaskDetail = useCallback(() => {
    setDetailTaskId(null);
    setDetailSnapshot(null);
    setTaskIdInUrl(null);
  }, [setTaskIdInUrl]);

  // Deep link ?taskId= + browser back/forward
  useEffect(() => {
    if (taskIdParam) {
      setDetailTaskId(taskIdParam);
      const found = (projectQ.data?.tasks ?? []).find((t) => t.id === taskIdParam);
      if (found) {
        setDetailSnapshot(found);
        if (found.projectId) setProjectId(found.projectId);
      }
    } else {
      setDetailTaskId(null);
      setDetailSnapshot(null);
    }
  }, [taskIdParam, projectQ.data?.tasks]);

  const columns = useMemo(() => projectQ.data?.columns ?? [], [projectQ.data?.columns]);

  const workflowFilterOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const c of columns) {
      if (!byKey.has(c.key)) byKey.set(c.key, c.name);
    }
    const order = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'NEEDS_FIX', 'DONE', 'PAUSED'];
    return Array.from(byKey.entries()).sort(
      (a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99),
    );
  }, [columns]);

  useEffect(() => {
    if (workflowFilter === 'all' || workflowFilter === 'open') return;
    if (!workflowFilter.startsWith('key:')) {
      setWorkflowFilterPersisted('all');
      return;
    }
    const key = workflowFilter.slice(4);
    if (!columns.some((c) => c.key === key)) setWorkflowFilterPersisted('all');
  }, [columns, workflowFilter, setWorkflowFilterPersisted]);

  const workflowHighlightKey = workflowFilter.startsWith('key:')
    ? workflowFilter.slice(4)
    : null;

  const tasks = useMemo(() => {
    let list = projectQ.data?.tasks ?? [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          t.labels.some((l) => l.toLowerCase().includes(q)),
      );
    }
    if (priorityFilter !== 'all') {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    if (assigneeFilter !== 'all') {
      list = list.filter((t) => t.assignees.some((a) => a.id === assigneeFilter));
    }
    list = list.filter((task) => matchesWorkDeadline(task, deadlineFilter));
    return list;
  }, [projectQ.data?.tasks, query, priorityFilter, assigneeFilter, deadlineFilter]);

  const columnIdSet = useMemo(() => new Set(columns.map((c) => c.id)), [columns]);

  const orphanTasks = useMemo(
    () => tasks.filter((t) => !columnIdSet.has(t.columnId)),
    [tasks, columnIdSet],
  );

  const tasksByColumn = useMemo(() => {
    const map: Record<string, WorkTask[]> = {};
    for (const c of columns) map[c.id] = [];
    for (const t of tasks) {
      if (!columnIdSet.has(t.columnId)) continue;
      map[t.columnId]!.push(t);
    }
    for (const id of Object.keys(map)) {
      map[id]!.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [columns, tasks, columnIdSet]);

  // Full column list (unfiltered) to guarantee correct sortOrder calculation during drag-drop
  const allTasksByColumn = useMemo(() => {
    const map: Record<string, WorkTask[]> = {};
    for (const c of columns) map[c.id] = [];
    for (const t of projectQ.data?.tasks ?? []) {
      if (!map[t.columnId]) map[t.columnId] = [];
      map[t.columnId]!.push(t);
    }
    for (const id of Object.keys(map)) {
      map[id]!.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [columns, projectQ.data?.tasks]);

  function cancelQuickAdd() {
    setQuickAddColumnId(null);
    setQuickAddTitle('');
  }

  function submitQuickAdd(columnId: string) {
    const title = quickAddTitle.trim();
    if (!projectId || !title || createTask.isPending || !canWriteTask) return;
    // Required project information must be entered in the complete form.
    if (projectQ.data?.customFieldDefs?.some((field) => field.required)) {
      openCreateTask(columnId);
      setForm((current) => ({ ...current, title }));
      cancelQuickAdd();
      return;
    }
    createTask.mutate(
      {
        projectId,
        columnId,
        title,
        priority: 'MEDIUM',
      },
      {
        onSuccess: (created) => {
          cancelQuickAdd();
          openTaskDetail(created);
        },
      },
    );
  }

  function openCreateTask(columnId?: string) {
    setTaskFormError(null);
    setEditTask(null);
    setTargetColumnId(columnId);
    setForm({
      title: '',
      description: '',
      assignerId: '',
      assigneeIds: [],
      watcherIds: [],
      startDate: '',
      deadline: '',
      priority: 'MEDIUM',
      labels: '',
      progress: 0,
      checklistText: '',
      customFields: {},
    });
    setTaskDialog(true);
  }

  function openEditTask(task: WorkTask) {
    setTaskFormError(null);
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignerId: task.assignerId || '',
      assigneeIds: task.assignees.map((a) => a.id),
      watcherIds: task.watchers.map((w) => w.id),
      startDate: task.startDate || '',
      deadline: task.deadline || '',
      priority: task.priority || 'MEDIUM',
      labels: task.labels.join(', '),
      progress: task.progress,
      checklistText: task.checklist.map((c) => `${c.isDone ? '[x] ' : ''}${c.title}`).join('\n'),
      customFields: (task.customFields as Record<string, any>) || {},
    });
    setTaskDialog(true);
  }

  function saveTask() {
    if (!projectId || !form.title.trim() || createTask.isPending || updateTask.isPending) return;
    if (form.startDate && form.deadline && form.deadline < form.startDate) {
      setTaskFormError('Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu. Vui lòng kiểm tra lại hai ngày.');
      return;
    }
    const missingField = projectQ.data?.customFieldDefs?.find((field) => field.required
      && (form.customFields[field.id] == null || String(form.customFields[field.id]).trim() === ''));
    if (missingField) {
      setTaskFormError(`Vui lòng nhập thông tin: ${missingField.name}.`);
      return;
    }
    setTaskFormError(null);
    const labels = form.labels
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const checklist = form.checklistText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const done = /^\[x\]\s*/i.test(line);
        return {
          title: line.replace(/^\[x\]\s*/i, ''),
          isDone: done,
          sortOrder: i,
        };
      });

    if (editTask) {
      updateTask.mutate(
        {
          id: editTask.id,
          title: form.title.trim(),
          description: form.description,
          assignerId: form.assignerId || null,
          assigneeIds: form.assigneeIds,
          watcherIds: form.watcherIds,
          startDate: form.startDate || null,
          deadline: form.deadline || null,
          priority: form.priority,
          labels,
          progress: form.progress,
          checklist,
          customFields: form.customFields,
        },
        { onSuccess: () => setTaskDialog(false), onError: (error) => setTaskFormError(error.message) },
      );
    } else {
      createTask.mutate(
        {
          projectId,
          columnId: targetColumnId,
          title: form.title.trim(),
          description: form.description || undefined,
          assignerId: form.assignerId || undefined,
          assigneeIds: form.assigneeIds,
          watcherIds: form.watcherIds,
          startDate: form.startDate || undefined,
          deadline: form.deadline || undefined,
          priority: form.priority,
          labels,
          progress: form.progress,
          checklist,
          customFields: form.customFields,
        },
        {
          onSuccess: () => {
            setTaskDialog(false);
            setTargetColumnId(undefined);
          },
          onError: (error) => setTaskFormError(error.message),
        },
      );
    }
  }

  function onDrop(columnId: string) {
    if (!draggingId || !canWriteTask || projectQ.data?.isArchived) return;
    const fullList = allTasksByColumn[columnId] ?? [];
    moveTask.mutate({
      id: draggingId,
      columnId,
      sortOrder: fullList.length,
    });
    setDraggingId(null);
    setDropCol(null);
  }

  async function runTaskAction(action: () => Promise<unknown>) {
    setTaskActionError(null);
    try {
      await action();
    } catch (error) {
      setTaskActionError(error instanceof Error ? error.message : 'Không thể thực hiện thao tác. Vui lòng thử lại.');
    }
  }

  function moveTaskToColumn(task: WorkTask, columnId: string) {
    if (!canWriteTask || projectQ.data?.isArchived || moveTask.isPending || task.columnId === columnId) return;
    void runTaskAction(() => moveTask.mutateAsync({
      id: task.id,
      columnId,
      sortOrder: (allTasksByColumn[columnId] ?? []).length,
    }));
  }

  if (projectsQ.isLoading) return <LoadingState message={t('work.loadingProjects')} />;
  if (projectsQ.isError) return <ErrorState onRetry={projectsQ.refetch} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('work.title')}
        description="Giao việc rõ ràng, theo dõi tiến độ và hoàn thành đúng hạn trong một nơi."
      />

      <WorkManagementSubNav />

      {taskActionError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{taskActionError}</span>
          <Button variant="ghost" size="sm" aria-label="Đóng thông báo" onClick={() => setTaskActionError(null)}><X className="h-4 w-4" /></Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1 min-w-[200px] flex-1">
          <Label className="text-base">Dự án</Label>
          <Select value={projectId ?? ''} onValueChange={selectProject}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dự án" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p._count?.tasks != null ? ` (${p._count.tasks})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm min-h-[44px]">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          Hiện dự án đã lưu
        </label>
        <WorkNotificationsBell onOpenTask={openTaskDetailById} />
        <Button
          variant="outline"
          className="min-h-[44px]"
          disabled={!projectQ.data || !canCreateProject}
          onClick={() => setProjectSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4 mr-1" /> Cài đặt dự án
        </Button>
        <Button
          variant="outline"
          className="min-h-[44px]"
          disabled={!canCreateProject}
          onClick={() => {
            setProjectName('');
            setProjectDesc('');
            setProjectCreateError(null);
            setProjectDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> {t('work.createProject')}
        </Button>
        <Button className="min-h-[44px]" disabled={!projectId || !canWriteTask || projectQ.data?.isArchived} onClick={() => openCreateTask()}>
          <Plus className="h-4 w-4 mr-1" /> {t('work.createTaskTitle')}
        </Button>
      </div>

      <WorkProjectSettingsDialog
        project={projectQ.data ?? null}
        open={projectSettingsOpen}
        onOpenChange={setProjectSettingsOpen}
        onArchived={() => {
          setProjectId(null);
          projectsQ.refetch();
        }}
      />

      {projectId && (
        <div className="rounded-lg border bg-muted/30">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
            onClick={() => setDocsOpen((v) => !v)}
            aria-expanded={docsOpen}
          >
            {docsOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            Tài liệu dự án
          </button>
          {docsOpen && <div className="px-2 pb-2"><WorkDocumentsPanel projectId={projectId} /></div>}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder={t('work.filterPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Người thực hiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả người thực hiện</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Deadline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả deadline</SelectItem>
            <SelectItem value="overdue">Quá hạn</SelectItem>
            <SelectItem value="this_week">Tuần này</SelectItem>
            <SelectItem value="has_deadline">Có deadline</SelectItem>
          </SelectContent>
        </Select>
        {(query ||
          priorityFilter !== 'all' ||
          assigneeFilter !== 'all' ||
          deadlineFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1"
            onClick={() => {
              setQuery('');
              setPriorityFilter('all');
              setAssigneeFilter('all');
              setDeadlineFilter('all');
            }}
          >
            <X className="h-3.5 w-3.5" /> Xóa bộ lọc
          </Button>
        )}
      </div>

      {!projectId && (
        <EmptyState title={t('work.noProjectSelected')} description={t('work.noProjectSelectedDesc')} />
      )}
      {projectQ.data && <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground" role="status">
        <span>Đang hiển thị {tasks.length}/{projectQ.data.tasks.length} công việc.</span>
        <span className="md:hidden">Vuốt bảng sang ngang để xem các cột. Bấm vào việc để mở chi tiết.</span>
      </div>}

      {projectId && projectQ.isLoading && <LoadingState />}
      {projectId && projectQ.isError && <ErrorState onRetry={projectQ.refetch} />}

      {projectId && projectQ.data && (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 min-h-[min(70vh,640px)]">
          {columns.map((col) => {
            const items = tasksByColumn[col.id] ?? [];
            return (
              <div
                key={col.id}
                className={cn(
                  'flex-shrink-0 w-[min(85vw,280px)] sm:w-[300px] rounded-xl border bg-muted/30 flex flex-col',
                  dropCol === col.id && 'ring-2 ring-primary',
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropCol(col.id);
                }}
                onDragLeave={() => setDropCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(col.id);
                }}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b bg-background/60 rounded-t-xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{col.name}</p>
                    <p className="text-[11px] text-muted-foreground">{items.length} việc</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title="Đổi tên cột"
                      onClick={() => {
                        setRenameColumnId(col.id);
                        setRenameColumnName(col.name);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 gap-1 px-2 text-xs font-semibold"
                      title="Thêm công việc"
                      disabled={!canWriteTask || createTask.isPending || projectQ.data?.isArchived}
                      onClick={() => {
                        setQuickAddColumnId(col.id);
                        setQuickAddTitle('');
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Thêm công việc</span>
                    </Button>
                  </div>
                </div>
                <div className="max-h-[min(55vh,480px)] overflow-y-auto p-2 space-y-2">
                  {items.map((task, index) => (
                    <div
                      key={task.id}
                      draggable={canWriteTask}
                      onDragStart={(e) => {
                        setDraggingId(task.id);
                        e.dataTransfer.setData('text/plain', task.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropCol(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!draggingId || draggingId === task.id) return;
                        const fullList = allTasksByColumn[col.id] ?? [];
                        const targetIdx = fullList.findIndex((t) => t.id === task.id);
                        moveTask.mutate({
                          id: draggingId,
                          columnId: col.id,
                          sortOrder: targetIdx >= 0 ? targetIdx : fullList.length,
                        });
                        setDraggingId(null);
                        setDropCol(null);
                      }}
                      className={cn(
                        'rounded-lg border border-white/10 bg-card p-3 text-white shadow-sm cursor-grab active:cursor-grabbing touch-manipulation',
                        draggingId === task.id && 'opacity-50',
                      )}
                    >
                      <div className="flex items-start gap-1">
                        <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => openTaskDetail(task)}
                        >
                          <WorkTaskBoardCard
                            task={task}
                            projectNameFallback={projectQ.data?.name}
                            onOpen={() => openTaskDetail(task)}
                            onComplete={columns.some(c => c.key === 'DONE') && task.columnKey !== 'DONE' && !task.completedAt && canWriteTask && !projectQ.data?.isArchived
                              ? () => { const doneColumn = columns.find(c => c.key === 'DONE'); if (doneColumn) moveTaskToColumn(task, doneColumn.id); }
                              : undefined}
                            completionDisabled={moveTask.isPending}
                          />
                        </div>
                        <WorkTaskActionsMenu
                          task={task}
                          columns={columns}
                          disabled={!canWriteTask || !!projectQ.data?.isArchived || moveTask.isPending || copyTask.isPending || archiveTask.isPending || deleteTask.isPending}
                          onEdit={() => openEditTask(task)}
                          onMove={columnId => moveTaskToColumn(task, columnId)}
                          onCopy={() => { void runTaskAction(() => copyTask.mutateAsync(task.id)); }}
                          onArchive={() => { void runTaskAction(() => archiveTask.mutateAsync(task.id)); }}
                          onDelete={() => { setDeleteError(null); setTaskToDelete(task); }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <WorkKanbanColumnAdd
                  columnId={col.id}
                  active={quickAddColumnId === col.id}
                  title={quickAddColumnId === col.id ? quickAddTitle : ''}
                  disabled={createTask.isPending || !canWriteTask || projectQ.data?.isArchived}
                  onActivate={() => {
                    setQuickAddColumnId(col.id);
                    setQuickAddTitle('');
                  }}
                  onTitleChange={setQuickAddTitle}
                  onCancel={cancelQuickAdd}
                  onSubmit={() => submitQuickAdd(col.id)}
                />
              </div>
            );
          })}
          {orphanTasks.length > 0 && (
            <div className="flex-shrink-0 w-[min(85vw,280px)] sm:w-[300px] rounded-xl border border-amber-500/50 bg-amber-500/10 flex flex-col max-h-[min(70vh,640px)]">
              <div className="px-3 py-2.5 border-b border-amber-500/30">
                <p className="text-sm font-semibold text-amber-100">Khác / Hoàn thành</p>
                <p className="text-[11px] text-amber-200/80">
                  {orphanTasks.length} việc — kéo về cột Xuân Lượng hoặc cột phù hợp
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {orphanTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-white/10 bg-card p-3 text-white shadow-sm cursor-pointer"
                    onClick={() => openTaskDetail(task)}
                  >
                    <WorkTaskBoardCard
                      task={task}
                      projectNameFallback={projectQ.data?.name}
                    />
                    <p className="mt-2 text-[10px] text-amber-200/90">
                      Cột hiện tại: {task.columnName || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!taskToDelete} onOpenChange={open => { if (!open && !deleteTask.isPending) setTaskToDelete(null); }}>
        <DialogContent className="max-w-sm" closeOnlyWithButton>
          <DialogHeader><DialogTitle>Xóa công việc?</DialogTitle></DialogHeader>
          <p className="break-words text-sm text-muted-foreground">Bạn có chắc muốn xóa công việc <strong className="text-foreground">“{taskToDelete?.title}”</strong>?</p>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={deleteTask.isPending} onClick={() => setTaskToDelete(null)}>Hủy</Button>
            <Button variant="destructive" disabled={!canWriteTask || !!projectQ.data?.isArchived || deleteTask.isPending} onClick={async () => {
              if (!taskToDelete) return;
              setDeleteError(null);
              try { await deleteTask.mutateAsync(taskToDelete.id); setTaskToDelete(null); }
              catch (error) { setDeleteError(error instanceof Error ? error.message : 'Không thể xóa công việc. Vui lòng thử lại.'); }
            }}>{deleteTask.isPending ? 'Đang xóa…' : 'Xóa công việc'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename column dialog */}
      <Dialog open={!!renameColumnId} onOpenChange={(v) => !v && setRenameColumnId(null)}>
        <DialogContent className="max-w-sm" closeOnlyWithButton>
          <DialogHeader>
            <DialogTitle>Đổi tên cột Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Tên hiển thị cột</Label>
            <Input
              value={renameColumnName}
              onChange={(e) => setRenameColumnName(e.target.value)}
              placeholder="Nhập tên cột..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameColumnId(null)}>
              Hủy
            </Button>
            <Button
              disabled={!renameColumnName.trim() || updateColumn.isPending}
              onClick={() => {
                if (!renameColumnId || !renameColumnName.trim()) return;
                updateColumn.mutate(
                  { id: renameColumnId, name: renameColumnName.trim() },
                  { onSuccess: () => setRenameColumnId(null) },
                );
              }}
            >
              {updateColumn.isPending ? 'Đang lưu...' : 'Lưu tên cột'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create project */}
      <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
        <DialogContent closeOnlyWithButton>
          <DialogHeader>
            <DialogTitle>{t('work.createProjectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {projectCreateError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {projectCreateError}
              </p>
            ) : null}
            <div className="space-y-1">
              <Label>Tên dự án</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialog(false)}>
              Huỷ
            </Button>
            <Button
              disabled={!projectName.trim() || createProject.isPending}
              onClick={() => {
                setProjectCreateError(null);
                createProject.mutate(
                  { name: projectName.trim(), description: projectDesc || undefined },
                  {
                    onSuccess: (p) => {
                      setProjectDialog(false);
                      setProjectCreateError(null);
                      setProjectId(p.id);
                    },
                    onError: (err) => {
                      setProjectCreateError(
                        err instanceof Error ? err.message : 'Không tạo được dự án. Vui lòng thử lại.',
                      );
                    },
                  },
                );
              }}
            >
              {createProject.isPending ? 'Đang tạo…' : 'Tạo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task form */}
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" closeOnlyWithButton>
          <DialogHeader>
            <DialogTitle>{editTask ? 'Sửa công việc' : 'Tạo công việc'}</DialogTitle>
            <p className="text-sm text-muted-foreground">Nhập tên việc, chọn người thực hiện và hạn hoàn thành. Bạn có thể bổ sung thông tin sau.</p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="work-task-title">Tên công việc <span className="text-destructive">*</span></Label>
              <Input
                id="work-task-title"
                autoFocus
                maxLength={300}
                placeholder="Ví dụ: Chuẩn bị nội dung cho chương trình tháng 12"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ưu tiên</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="work-task-deadline">Hạn hoàn thành</Label>
                <Input
                  id="work-task-deadline"
                  type="date"
                  min={form.startDate || undefined}
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            {/* Employee assignments */}
            <div className="space-y-3 pt-2 border-t">
              <WorkEmployeePicker
                label="Người giao việc"
                value={form.assignerId}
                onChange={(id) => setForm({ ...form, assignerId: id })}
                multiple={false}
                placeholder="Gõ tên, mã hoặc email để tìm..."
                initialEmployees={
                  editTask?.assigner
                    ? [{ id: editTask.assigner.id, name: editTask.assigner.name }]
                    : []
                }
              />
              <WorkEmployeePicker
                label="Người thực hiện"
                value={form.assigneeIds}
                onChange={(ids) => setForm({ ...form, assigneeIds: ids })}
                multiple={true}
                placeholder="Gõ tên, mã hoặc email..."
                initialEmployees={
                  editTask?.assignees?.map((a) => ({ id: a.id, name: a.name })) ?? []
                }
              />
              <WorkEmployeePicker
                label="Người theo dõi"
                value={form.watcherIds}
                onChange={(ids) => setForm({ ...form, watcherIds: ids })}
                multiple={true}
                placeholder="Gõ tên, mã hoặc email..."
                initialEmployees={
                  editTask?.watchers?.map((w) => ({ id: w.id, name: w.name })) ?? []
                }
              />
            </div>

            {/* Custom fields */}
            {projectQ.data?.customFieldDefs && projectQ.data.customFieldDefs.length > 0 && (
              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Trường tùy chỉnh dự án
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectQ.data.customFieldDefs.map((def) => (
                    <div key={def.id} className="space-y-1">
                      <Label className="text-xs">
                        {def.name} {def.required && <span className="text-destructive">*</span>}
                      </Label>
                      {def.type === 'select' ? (
                        <Select
                          value={form.customFields[def.id] || '__none__'}
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              customFields: {
                                ...form.customFields,
                                [def.id]: v === '__none__' ? '' : v,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Chọn..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">—</SelectItem>
                            {(def.options ?? []).map((opt) => (
                              <SelectItem key={opt} value={opt} className="text-xs">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : def.type === 'number' ? (
                        <Input
                          type="number"
                          value={form.customFields[def.id] ?? ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customFields: { ...form.customFields, [def.id]: e.target.value },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      ) : def.type === 'date' ? (
                        <Input
                          type="date"
                          value={form.customFields[def.id] ?? ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customFields: { ...form.customFields, [def.id]: e.target.value },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      ) : (
                        <Input
                          value={form.customFields[def.id] ?? ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customFields: { ...form.customFields, [def.id]: e.target.value },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <details className="rounded-xl border p-3">
              <summary className="min-h-[44px] cursor-pointer font-medium">Thông tin bổ sung: nhãn, tiến độ và việc cần làm</summary>
            <div className="space-y-1 mt-3">
              <Label>Nhãn (phân tách bằng dấu phẩy)</Label>
              <Input
                value={form.labels}
                onChange={(e) => setForm({ ...form, labels: e.target.value })}
                placeholder="Marketing, Q3"
              />
            </div>
            <div className="space-y-1">
              <Label>Tiến độ ({form.progress}%)</Label>
              <Input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Danh sách việc cần làm (mỗi dòng một việc)</Label>
              <Textarea
                rows={4}
                value={form.checklistText}
                onChange={(e) => setForm({ ...form, checklistText: e.target.value })}
                placeholder={'Chuẩn bị slide\n[x] Gửi draft'}
              />
              <p className="text-xs text-muted-foreground">Sau khi tạo, bạn có thể đánh dấu từng việc đã hoàn thành trong chi tiết công việc.</p>
            </div>
            </details>
            {taskFormError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{taskFormError}</p>}
            {editTask && (
              <p className="text-xs text-muted-foreground">
                Cập nhật lần cuối: {formatDateTime(editTask.updatedAt)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialog(false)}>
              Huỷ
            </Button>
            <Button
              disabled={!form.title.trim() || createTask.isPending || updateTask.isPending}
              onClick={saveTask}
            >
              {createTask.isPending || updateTask.isPending ? 'Đang lưu…' : editTask ? 'Lưu thay đổi' : 'Tạo công việc'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WorkTaskDetailDialog
        taskId={detailTaskId}
        initialTask={detailSnapshot}
        open={!!detailTaskId}
        onOpenChange={(v) => {
          if (!v) closeTaskDetail();
        }}
        employees={employees}
      />
    </div>
  );
}
