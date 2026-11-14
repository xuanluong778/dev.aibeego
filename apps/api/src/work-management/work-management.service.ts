import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@marketingspa/database';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  WORK_COLUMN_KEYS,
  WORK_NOTIFICATION_TYPES,
  WORK_PRIORITIES,
  DEFAULT_WORK_COLUMNS,
} from './work-management.constants';
import {
  assertCanWriteTask,
  canManageAnyTask,
  isWorkOrgWideRole,
  resolveWorkScope,
  workTaskVisibilityWhere,
} from './work-management.scope';
import type {
  CreateWorkProjectDto,
  CreateWorkTaskDto,
  MoveWorkTaskDto,
  UpdateWorkProjectDto,
  UpdateWorkTaskDto,
  WorkTaskQueryDto,
} from './dto/work-management.dto';
import { WorkCollabService } from './work-collab.service';

const taskInclude = {
  column: true,
  project: { select: { id: true, name: true } },
  assigner: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  lastSubmittedBy: { select: { id: true, name: true } },
  lastReviewedBy: { select: { id: true, name: true } },
  assignees: {
    include: { employee: { select: { id: true, name: true } } },
  },
  watchers: {
    include: { employee: { select: { id: true, name: true } } },
  },
  checklist: { orderBy: { sortOrder: 'asc' as const } },
  _count: {
    select: {
      comments: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.WorkTaskInclude;

@Injectable()
export class WorkManagementService {
  private readonly logger = new Logger(WorkManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly collab: WorkCollabService,
  ) {}

  // ── Projects ─────────────────────────────────────────────────────────────

  async listProjects(organizationId: string, user: AuthUser, includeArchived = false) {
    await resolveWorkScope(this.prisma, organizationId, user);
    return this.prisma.workProject.findMany({
      where: {
        organizationId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        columns: { orderBy: { sortOrder: 'asc' } },
        _count: {
          select: {
            tasks: { where: { deletedAt: null, isArchived: false } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProject(organizationId: string, user: AuthUser, projectId: string) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const project = await this.prisma.workProject.findFirst({
      where: { id: projectId, organizationId },
      include: {
        columns: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án');

    // Migrate legacy default name 'Đang làm' -> 'Làm việc' while preserving custom names
    const legacyCol = project.columns.find((c) => c.key === 'IN_PROGRESS' && c.name === 'Đang làm');
    if (legacyCol) {
      await this.prisma.workBoardColumn.update({
        where: { id: legacyCol.id },
        data: { name: 'Làm việc' },
      });
      legacyCol.name = 'Làm việc';
    }

    const visibility = workTaskVisibilityWhere(scope, user);
    const tasks = await this.prisma.workTask.findMany({
      where: {
        organizationId,
        projectId,
        deletedAt: null,
        isArchived: false,
        ...visibility,
      },
      include: taskInclude,
      orderBy: [{ columnId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      ...project,
      tasks: tasks.map((t) => this.serializeTask(t)),
    };
  }

  async createProject(organizationId: string, user: AuthUser, dto: CreateWorkProjectDto) {
    if (!organizationId?.trim()) {
      throw new BadRequestException('Thiếu organization — đăng nhập lại.');
    }
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Tên dự án không được để trống');

    try {
      return await this.createProjectRecord(organizationId, user, dto, name);
    } catch (err) {
      if (this.isMissingWorkCustomFieldColumn(err)) {
        await this.patchWorkCustomFieldColumns();
        try {
          return await this.createProjectRecord(organizationId, user, dto, name);
        } catch (retryErr) {
          err = retryErr;
        }
      }
      const code =
        err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`createProject failed org=${organizationId} code=${code} ${msg}`);
      if (code === 'P2021' || /relation.*work_projects.*does not exist/i.test(msg)) {
        throw new ServiceUnavailableException(
          'Module Quản lý công việc chưa được cài trên database. Chạy migration work_management hoặc liên hệ quản trị.',
        );
      }
      if (code === 'P2022' || /custom_field_defs/i.test(msg)) {
        throw new ServiceUnavailableException(
          'Database thiếu cột work_projects.custom_field_defs. Khởi động lại API (tự sửa) hoặc chạy pnpm db:migrate:deploy.',
        );
      }
      throw new InternalServerErrorException(
        process.env.NODE_ENV === 'production'
          ? 'Không tạo được dự án. Vui lòng thử lại sau ít phút.'
          : `Không tạo được dự án: ${msg}`,
      );
    }
  }

  private async createProjectRecord(
    organizationId: string,
    user: AuthUser,
    dto: CreateWorkProjectDto,
    name: string,
  ) {
    return this.prisma.workProject.create({
      data: {
        organizationId,
        name,
        description: dto.description?.trim() || null,
        createdById: user.employeeId || null,
        ...(dto.customFieldDefs?.length
          ? { customFieldDefs: dto.customFieldDefs as unknown as Prisma.InputJsonValue }
          : {}),
        columns: {
          create: DEFAULT_WORK_COLUMNS.map((c) => ({
            key: c.key,
            name: c.name,
            sortOrder: c.sortOrder,
          })),
        },
      },
      include: { columns: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  private isMissingWorkCustomFieldColumn(err: unknown): boolean {
    const code =
      err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
    const msg = err instanceof Error ? err.message : String(err);
    return (
      code === 'P2022' ||
      /column.*custom_field/i.test(msg) ||
      /column.*custom_fields/i.test(msg)
    );
  }

  private async patchWorkCustomFieldColumns() {
    await this.prisma.$executeRawUnsafe(`
      ALTER TABLE "work_projects"
        ADD COLUMN IF NOT EXISTS "custom_field_defs" JSONB DEFAULT '[]'::jsonb;
    `);
    await this.prisma.$executeRawUnsafe(`
      ALTER TABLE "work_tasks"
        ADD COLUMN IF NOT EXISTS "custom_fields" JSONB DEFAULT '{}'::jsonb;
    `);
  }

  async updateProject(
    organizationId: string,
    user: AuthUser,
    projectId: string,
    dto: UpdateWorkProjectDto,
  ) {
    if (dto.name !== undefined && !dto.name.trim()) throw new BadRequestException('Tên dự án không được để trống');
    await this.ensureProject(organizationId, projectId);
    if (!canManageAnyTask(user.role) && !isWorkOrgWideRole(user.role)) {
      // Staff may only rename unshared projects they created
      const p = await this.prisma.workProject.findFirst({
        where: { id: projectId, organizationId },
      });
      if (p?.createdById && p.createdById !== user.employeeId) {
        throw new ForbiddenException('Không có quyền sửa dự án này');
      }
    }
    return this.prisma.workProject.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        ...(dto.customFieldDefs !== undefined
          ? { customFieldDefs: dto.customFieldDefs as unknown as Prisma.InputJsonValue }
          : {}),
      },
      include: { columns: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  // ── Columns ──────────────────────────────────────────────────────────────

  async renameColumn(
    organizationId: string,
    user: AuthUser,
    columnId: string,
    name: string,
  ) {
    if (!name.trim()) throw new BadRequestException('Tên cột không được để trống');
    if (!canManageAnyTask(user.role) && !isWorkOrgWideRole(user.role)) {
      throw new ForbiddenException('Chỉ quản lý dự án mới có thể đổi tên cột');
    }
    const col = await this.prisma.workBoardColumn.findFirst({
      where: { id: columnId, project: { organizationId } },
    });
    if (!col) throw new NotFoundException('Không tìm thấy cột');
    return this.prisma.workBoardColumn.update({
      where: { id: columnId },
      data: { name: name.trim() },
    });
  }

  // ── Tasks ────────────────────────────────────────────────────────────────

  async listTasks(organizationId: string, user: AuthUser, query: WorkTaskQueryDto) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const visibility = workTaskVisibilityWhere(scope, user);

    const where: Prisma.WorkTaskWhereInput = {
      organizationId,
      deletedAt: null,
      ...(query.includeArchived ? {} : { isArchived: false }),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.label ? { labels: { has: query.label } } : {}),
      ...(query.assigneeId ? { assignees: { some: { employeeId: query.assigneeId } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...visibility,
    };

    const tasks = await this.prisma.workTask.findMany({
      where,
      include: taskInclude,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      take: 500,
    });
    return tasks.map((t) => this.serializeTask(t));
  }

  async getTask(organizationId: string, user: AuthUser, taskId: string) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const task = await this.prisma.workTask.findFirst({
      where: { id: taskId, organizationId, deletedAt: null },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Không tìm thấy công việc');
    this.assertTaskVisible(user, scope, task);
    return this.serializeTask(task);
  }

  async createTask(organizationId: string, user: AuthUser, dto: CreateWorkTaskDto) {
    this.validateTaskInput(dto);
    const project = await this.ensureProject(organizationId, dto.projectId);
    const columns = await this.prisma.workBoardColumn.findMany({
      where: { projectId: project.id },
      orderBy: { sortOrder: 'asc' },
    });
    if (!columns.length) throw new BadRequestException('Dự án chưa có cột Kanban');

    let columnId = dto.columnId;
    if (columnId) {
      if (!columns.some((c) => c.id === columnId)) {
        throw new BadRequestException('Cột không thuộc dự án');
      }
    } else {
      columnId = columns[0]!.id;
    }

    const priority = this.normalizePriority(dto.priority);
    const maxOrder = await this.prisma.workTask.aggregate({
      where: { columnId, deletedAt: null },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const customFieldDefs = ((project as any).customFieldDefs ?? []) as Array<{
      id: string;
      name: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
    if (customFieldDefs.length > 0) {
      this.validateCustomFields(customFieldDefs, dto.customFields ?? {});
    }

    const assigneeIds = dto.assigneeIds ?? [];
    const watcherIds = dto.watcherIds ?? [];
    await this.assertEmployeesInOrg(organizationId, [
      ...(dto.assignerId ? [dto.assignerId] : []),
      ...assigneeIds,
      ...watcherIds,
    ]);

    const task = await this.prisma.workTask.create({
      data: {
        organizationId,
        projectId: project.id,
        columnId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        assignerId: dto.assignerId ?? user.employeeId ?? null,
        createdById: user.employeeId || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        priority,
        labels: dto.labels ?? [],
        progress: dto.progress ?? 0,
        sortOrder,
        customFields: (dto.customFields ?? {}) as Prisma.InputJsonValue,
        assignees: {
          create: assigneeIds.map((employeeId) => ({ employeeId })),
        },
        watchers: {
          create: watcherIds.map((employeeId) => ({ employeeId })),
        },
        checklist: {
          create: (dto.checklist ?? []).map((c, i) => ({
            title: c.title.trim(),
            isDone: c.isDone ?? false,
            sortOrder: c.sortOrder ?? i,
          })),
        },
      },
      include: taskInclude,
    });

    if (assigneeIds.length) {
      await this.collab.notify(organizationId, assigneeIds, {
        type: WORK_NOTIFICATION_TYPES.TASK_ASSIGNED,
        title: `Được giao việc: ${task.title}`,
        body: 'Bạn được gán là người thực hiện',
        actorId: user.employeeId,
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    const col = task.column;
    await this.collab.recordMoveHistory(
      organizationId,
      task.id,
      null,
      { id: col.id, key: col.key },
      user.employeeId,
    );

    return this.serializeTask(task);
  }

  async updateTask(organizationId: string, user: AuthUser, taskId: string, dto: UpdateWorkTaskDto) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const existing = await this.prisma.workTask.findFirst({
      where: { id: taskId, organizationId, deletedAt: null },
      include: { assignees: true, watchers: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy công việc');

    this.validateTaskInput({
      ...dto,
      startDate: dto.startDate !== undefined ? dto.startDate : existing.startDate?.toISOString(),
      deadline: dto.deadline !== undefined ? dto.deadline : existing.deadline?.toISOString(),
    });

    assertCanWriteTask(
      user,
      {
        createdById: existing.createdById,
        assignerId: existing.assignerId,
        assigneeIds: existing.assignees.map((a) => a.employeeId),
        watcherIds: existing.watchers.map((w) => w.employeeId),
      },
      scope,
    );

    if (dto.assigneeIds || dto.watcherIds || dto.assignerId) {
      await this.assertEmployeesInOrg(organizationId, [
        ...(dto.assignerId ? [dto.assignerId] : []),
        ...(dto.assigneeIds ?? []),
        ...(dto.watcherIds ?? []),
      ]);
    }

    if (dto.customFields !== undefined) {
      const proj = await this.prisma.workProject.findUnique({
        where: { id: existing.projectId },
        select: { customFieldDefs: true },
      });
      const defs = ((proj as any)?.customFieldDefs ?? []) as Array<{
        id: string;
        name: string;
        type: string;
        required?: boolean;
        options?: string[];
      }>;
      if (defs.length > 0) {
        this.validateCustomFields(defs, dto.customFields);
      }
    }

    const task = await this.prisma.workTask.update({
      where: { id: taskId },
      data: {
        // Nested writes are atomic: a failed save never clears existing members/checklist.
        ...(dto.assigneeIds !== undefined ? { assignees: {
          deleteMany: {}, create: dto.assigneeIds.map(employeeId => ({ employeeId })),
        } } : {}),
        ...(dto.watcherIds !== undefined ? { watchers: {
          deleteMany: {}, create: dto.watcherIds.map(employeeId => ({ employeeId })),
        } } : {}),
        ...(dto.checklist !== undefined ? { checklist: {
          deleteMany: {}, create: dto.checklist.map((item, index) => ({
            title: item.title.trim(), isDone: item.isDone ?? false, sortOrder: item.sortOrder ?? index,
          })),
        } } : {}),
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.assignerId !== undefined ? { assignerId: dto.assignerId } : {}),
        ...(dto.startDate !== undefined
          ? { startDate: dto.startDate ? new Date(dto.startDate) : null }
          : {}),
        ...(dto.deadline !== undefined
          ? { deadline: dto.deadline ? new Date(dto.deadline) : null }
          : {}),
        ...(dto.priority !== undefined ? { priority: this.normalizePriority(dto.priority) } : {}),
        ...(dto.labels !== undefined ? { labels: dto.labels } : {}),
        ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        ...(dto.customFields !== undefined
          ? { customFields: dto.customFields as Prisma.InputJsonValue }
          : {}),
      },
      include: taskInclude,
    });

    const previous = new Set(existing.assignees.map(item => item.employeeId));
    const newlyAssigned = (dto.assigneeIds ?? []).filter(id => !previous.has(id));
    if (newlyAssigned.length) {
      await this.collab.notify(organizationId, newlyAssigned, {
        type: WORK_NOTIFICATION_TYPES.TASK_ASSIGNED,
        title: `Được giao việc: ${task.title}`,
        body: 'Bạn được gán là người thực hiện', actorId: user.employeeId,
        taskId, projectId: task.projectId,
      });
    }
    return this.serializeTask(task);
  }

  /** Kéo thả: lưu column + sortOrder; reindex cùng cột để giữ thứ tự ổn định. */
  async moveTask(organizationId: string, user: AuthUser, taskId: string, dto: MoveWorkTaskDto) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const task = await this.prisma.workTask.findFirst({
      where: { id: taskId, organizationId, deletedAt: null },
      include: { assignees: true, watchers: true },
    });
    if (!task) throw new NotFoundException('Không tìm thấy công việc');
    assertCanWriteTask(
      user,
      {
        createdById: task.createdById,
        assignerId: task.assignerId,
        assigneeIds: task.assignees.map((a) => a.employeeId),
        watcherIds: task.watchers.map((w) => w.employeeId),
      },
      scope,
    );

    const column = await this.prisma.workBoardColumn.findFirst({
      where: { id: dto.columnId, projectId: task.projectId },
    });
    if (!column) throw new BadRequestException('Cột không thuộc dự án');

    // ── Approval flow guard ───────────────────────────────────────────────
    // Only managers/org-wide roles may drag PENDING_REVIEW → DONE directly.
    // Assignees must use the submit-review → approve flow.
    const fromColForGuard = await this.prisma.workBoardColumn.findFirst({
      where: { id: task.columnId },
    });
    const isMovingToDone =
      column.key === WORK_COLUMN_KEYS.DONE &&
      fromColForGuard?.key !== WORK_COLUMN_KEYS.DONE;
    if (isMovingToDone && !canManageAnyTask(user.role) && !isWorkOrgWideRole(user.role)) {
      // Assignee trying to bypass approval — only allowed if already in PENDING_REVIEW approved flow
      const lastReview = await this.prisma.workTaskReviewEvent.findFirst({
        where: { taskId, type: 'APPROVE' },
        orderBy: { createdAt: 'desc' },
      });
      if (!lastReview) {
        throw new ForbiddenException(
          'Công việc cần được duyệt trước khi chuyển sang Hoàn thành. Hãy dùng nút "Nộp duyệt".',
        );
      }
    }

    const siblings = await this.prisma.workTask.findMany({
      where: {
        projectId: task.projectId,
        columnId: dto.columnId,
        deletedAt: null,
        id: { not: taskId },
      },
      orderBy: { sortOrder: 'asc' },
      select: { id: true },
    });

    const fromCol = await this.prisma.workBoardColumn.findFirst({
      where: { id: task.columnId },
    });

    const insertAt = Math.max(0, Math.min(dto.sortOrder, siblings.length));
    const ordered = [
      ...siblings.slice(0, insertAt).map((s) => s.id),
      taskId,
      ...siblings.slice(insertAt).map((s) => s.id),
    ];

    await this.prisma.$transaction([
      this.prisma.workTask.update({
        where: { id: taskId },
        data: { columnId: dto.columnId, sortOrder: insertAt },
      }),
      ...ordered.map((id, index) =>
        this.prisma.workTask.update({
          where: { id },
          data: { columnId: dto.columnId, sortOrder: index },
        }),
      ),
    ]);

    if (fromCol && fromCol.id !== column.id) {
      await this.collab.recordMoveHistory(
        organizationId,
        taskId,
        { id: fromCol.id, key: fromCol.key },
        { id: column.id, key: column.key },
        user.employeeId,
      );
    }

    return this.getTask(organizationId, user, taskId);
  }

  async copyTask(organizationId: string, user: AuthUser, taskId: string) {
    const src = await this.getTask(organizationId, user, taskId);
    return this.createTask(organizationId, user, {
      projectId: src.projectId,
      columnId: src.columnId,
      title: `${src.title} (bản sao)`,
      description: src.description ?? undefined,
      assignerId: src.assignerId,
      assigneeIds: src.assignees.map((a) => a.id),
      watcherIds: src.watchers.map((w) => w.id),
      startDate: src.startDate,
      deadline: src.deadline,
      priority: src.priority,
      labels: src.labels,
      customFields: src.customFields as Record<string, unknown>,
      progress: 0,
      checklist: src.checklist.map((c) => ({
        title: c.title,
        isDone: false,
        sortOrder: c.sortOrder,
      })),
    }).then(async (created) => {
      await this.prisma.workTask.update({
        where: { id: created.id },
        data: { copiedFromId: taskId },
      });
      return this.getTask(organizationId, user, created.id);
    });
  }

  async archiveTask(organizationId: string, user: AuthUser, taskId: string, archived = true) {
    return this.updateTask(organizationId, user, taskId, { isArchived: archived });
  }

  async softDeleteTask(organizationId: string, user: AuthUser, taskId: string) {
    const scope = await resolveWorkScope(this.prisma, organizationId, user);
    const task = await this.prisma.workTask.findFirst({
      where: { id: taskId, organizationId, deletedAt: null },
      include: { assignees: true, watchers: true },
    });
    if (!task) throw new NotFoundException('Không tìm thấy công việc');
    assertCanWriteTask(
      user,
      {
        createdById: task.createdById,
        assignerId: task.assignerId,
        assigneeIds: task.assignees.map((a) => a.employeeId),
        watcherIds: task.watchers.map((w) => w.employeeId),
      },
      scope,
    );
    await this.prisma.workTask.update({
      where: { id: taskId },
      data: { deletedAt: new Date(), isArchived: true },
    });
    return { ok: true };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private validateTaskInput(dto: {
    title?: string; startDate?: string | null; deadline?: string | null;
    assigneeIds?: string[]; watcherIds?: string[]; checklist?: { title: string }[];
  }) {
    if (dto.title !== undefined && !dto.title.trim()) throw new BadRequestException('Tên công việc không được để trống');
    for (const value of [dto.startDate, dto.deadline]) {
      if (value && (!Number.isFinite(Date.parse(value))
        || (/^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) !== value))) {
        throw new BadRequestException('Ngày công việc không hợp lệ');
      }
    }
    if (dto.startDate && dto.deadline && Date.parse(dto.deadline) < Date.parse(dto.startDate)) {
      throw new BadRequestException('Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu');
    }
    for (const ids of [dto.assigneeIds, dto.watcherIds]) {
      if (ids && new Set(ids).size !== ids.length) throw new BadRequestException('Danh sách nhân viên không được trùng lặp');
    }
    if (dto.checklist?.some(item => !item.title.trim())) throw new BadRequestException('Tên việc trong checklist không được để trống');
  }

  private validateCustomFields(
    defs: Array<{ id: string; name: string; type: string; required?: boolean; options?: string[] }>,
    values: Record<string, unknown>,
  ) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new BadRequestException('Thông tin bổ sung phải là một đối tượng hợp lệ');
    for (const def of defs) {
      const val = values[def.id];
      if (def.required && (val === undefined || val === null || (typeof val === 'string' && !val.trim()))) {
        throw new BadRequestException(`Trường bắt buộc "${def.name}" chưa có dữ liệu`);
      }
      if (val === undefined || val === null || val === '') continue;

      if (def.type === 'number') {
        const num = Number(val);
        if (!['number', 'string'].includes(typeof val) || !String(val).trim() || !Number.isFinite(num)) {
          throw new BadRequestException(`Trường "${def.name}" phải là số hợp lệ`);
        }
      } else if (def.type === 'date') {
        const d = new Date(String(val));
        if (isNaN(d.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(String(val)) || d.toISOString().slice(0, 10) !== val) {
          throw new BadRequestException(`Trường "${def.name}" phải là ngày hợp lệ (YYYY-MM-DD)`);
        }
      } else if (def.type === 'select') {
        if (def.options && def.options.length > 0 && !def.options.includes(String(val))) {
          throw new BadRequestException(
            `Giá trị "${val}" không hợp lệ cho trường "${def.name}". Lựa chọn hợp lệ: ${def.options.join(', ')}`,
          );
        }
      }
    }
  }

  private serializeTask(task: Prisma.WorkTaskGetPayload<{ include: typeof taskInclude }>) {
    return {
      id: task.id,
      organizationId: task.organizationId,
      projectId: task.projectId,
      projectName: task.project.name,
      project: { id: task.project.id, name: task.project.name },
      columnId: task.columnId,
      columnKey: task.column.key,
      columnName: task.column.name,
      title: task.title,
      description: task.description,
      assignerId: task.assignerId,
      assigner: task.assigner,
      createdById: task.createdById,
      createdBy: task.createdBy,
      startDate: task.startDate?.toISOString().slice(0, 10) ?? null,
      deadline: task.deadline?.toISOString().slice(0, 10) ?? null,
      priority: task.priority,
      labels: task.labels,
      progress: task.progress,
      sortOrder: task.sortOrder,
      isArchived: task.isArchived,
      customFields: ((task as any).customFields ?? {}) as Record<string, unknown>,
      copiedFromId: task.copiedFromId,
      revisionCount: task.revisionCount,
      lastSubmittedById: task.lastSubmittedById,
      lastSubmittedBy: task.lastSubmittedBy,
      lastSubmittedAt: task.lastSubmittedAt,
      lastReviewedById: task.lastReviewedById,
      lastReviewedBy: task.lastReviewedBy,
      lastReviewedAt: task.lastReviewedAt,
      lastReviewNote: task.lastReviewNote,
      lastReviewAction: task.lastReviewAction,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignees: task.assignees.map((a) => a.employee),
      watchers: task.watchers.map((w) => w.employee),
      checklist: task.checklist.map((c) => ({
        id: c.id,
        title: c.title,
        isDone: c.isDone,
        sortOrder: c.sortOrder,
      })),
      commentCount: task._count.comments,
      canSubmitReview:
        task.column.key === WORK_COLUMN_KEYS.IN_PROGRESS ||
        task.column.key === WORK_COLUMN_KEYS.NEEDS_FIX,
      canReview: task.column.key === WORK_COLUMN_KEYS.PENDING_REVIEW,
    };
  }

  private async ensureProject(organizationId: string, projectId: string) {
    const p = await this.prisma.workProject.findFirst({
      where: { id: projectId, organizationId },
    });
    if (!p) throw new NotFoundException('Không tìm thấy dự án');
    return p;
  }

  private normalizePriority(p?: string): string {
    const v = (p || 'MEDIUM').toUpperCase();
    if (!(WORK_PRIORITIES as readonly string[]).includes(v)) {
      throw new BadRequestException(`priority phải là ${WORK_PRIORITIES.join(', ')}`);
    }
    return v;
  }

  private async assertEmployeesInOrg(organizationId: string, employeeIds: string[]) {
    const unique = [...new Set(employeeIds.filter(Boolean))];
    if (!unique.length) return;
    const count = await this.prisma.employee.count({
      where: { organizationId, id: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException('Có nhân viên không thuộc tổ chức');
    }
  }

  private assertTaskVisible(
    user: AuthUser,
    scope: Awaited<ReturnType<typeof resolveWorkScope>>,
    task: {
      createdById: string | null;
      assignerId: string | null;
      assignees: { employeeId: string }[];
      watchers: { employeeId: string }[];
    },
  ) {
    if (scope.mode === 'all') return;
    try {
      assertCanWriteTask(
        user,
        {
          createdById: task.createdById,
          assignerId: task.assignerId,
          assigneeIds: task.assignees.map((a) => a.employeeId),
          watcherIds: task.watchers.map((w) => w.employeeId),
        },
        scope,
      );
    } catch {
      // Staff may only view related — reuse relation check softer for read
      const me = user.employeeId;
      const related = [
        task.createdById,
        task.assignerId,
        ...task.assignees.map((a) => a.employeeId),
        ...task.watchers.map((w) => w.employeeId),
      ];
      if (scope.mode === 'ids') {
        if (related.some((id) => id && scope.employeeIds.includes(id))) return;
      }
      if (me && related.includes(me)) return;
      throw new ForbiddenException('Không có quyền xem công việc này');
    }
  }
}
