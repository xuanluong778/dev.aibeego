// Run against an explicitly selected local/test database. Uses real services and
// Prisma persistence in a unique test organization; removes only that fixture.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require(process.env.WM_PRISMA_CLIENT || '@marketingspa/database');
const { WorkManagementService } = require('../apps/api/src/work-management/work-management.service');
const { WorkCollabService } = require('../apps/api/src/work-management/work-collab.service');
const { WorkInsightsService } = require('../apps/api/src/work-management/work-insights.service');
const prisma = new PrismaClient();
const collab = new WorkCollabService(prisma);
const work = new WorkManagementService(prisma, collab);
const insights = new WorkInsightsService(prisma, collab);
const results = [];
async function test(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function main() {
  if (process.env.WM_TEST_DATABASE_CONFIRMED !== '1') throw new Error('Select a local/test database and set WM_TEST_DATABASE_CONFIRMED=1');
  const slug = `wm-qa-${randomUUID()}`;
  const org = await prisma.organization.create({ data: { name: 'Kiểm thử công việc tự động', slug } });
  let foreignOrg;
  try {
    const employee = await prisma.employee.create({ data: { organizationId: org.id, name: 'Quản lý kiểm thử' } });
    const staffEmp = await prisma.employee.create({ data: { organizationId: org.id, name: 'Nhân viên kiểm thử' } });
    const outsiderEmp = await prisma.employee.create({ data: { organizationId: org.id, name: 'Ngoài công việc' } });
    const owner = { id: randomUUID(), email: `${slug}@example.test`, name: 'QA', role: 'OWNER', organizationId: org.id, employeeId: employee.id };
    const staff = { ...owner, id: randomUUID(), role: 'TECHNICIAN', employeeId: staffEmp.id };
    const outsider = { ...staff, employeeId: outsiderEmp.id };
    let project, task, comment, attachment;
    const defs = [{ id: 'budget', name: 'Ngân sách', type: 'number', required: true }, { id: 'launch', name: 'Ngày bàn giao', type: 'date' }];
    await test('Tạo dự án và 7 cột mặc định', async () => {
      project = await work.createProject(org.id, owner, { name: 'Dự án kiểm thử', customFieldDefs: defs });
      assert.equal(project.columns.length, 7);
    });
    if (!project) throw new Error('Project setup failed');
    await test('Đổi tên cột Kanban', async () => {
      const target = project.columns.find(c => c.key === 'NEW');
      await work.renameColumn(org.id, owner, target.id, 'Cần thực hiện');
      assert.equal((await work.getProject(org.id, owner, project.id)).columns.find(c => c.id === target.id).name, 'Cần thực hiện');
    });
    await test('Đổi tên dự án; từ chối tên rỗng', async () => {
      assert.equal((await work.updateProject(org.id, owner, project.id, { name: 'Dự án dễ sử dụng' })).name, 'Dự án dễ sử dụng');
      await assert.rejects(() => work.updateProject(org.id, owner, project.id, { name: '  ' }));
    });
    const base = { projectId: project.id, title: 'Công việc kiểm thử', assigneeIds: [staffEmp.id], customFields: { budget: 100, launch: '2026-12-01' } };
    await test('Tạo việc đầy đủ: người phụ trách, người theo dõi, nhãn, ngày, checklist', async () => {
      task = await work.createTask(org.id, owner, { ...base, description: 'Mô tả có tiếng Việt', watcherIds: [employee.id], labels: ['Marketing'], startDate: '2026-11-13', deadline: '2026-12-01', checklist: [{ title: 'Chuẩn bị' }, { title: 'Bàn giao' }] });
      assert.equal(task.assignees[0].id, staffEmp.id); assert.equal(task.checklist.length, 2); assert.equal(task.deadline, '2026-12-01');
    });
    if (!task) throw new Error('Task setup failed');
    await test('Đọc lại việc đã tạo từ database', async () => assert.equal((await work.getTask(org.id, staff, task.id)).title, base.title));
    await test('Từ chối tên chỉ có khoảng trắng', () => assert.rejects(() => work.createTask(org.id, owner, { ...base, title: '   ' })));
    await test('Từ chối hạn hoàn thành trước ngày bắt đầu', () => assert.rejects(() => work.createTask(org.id, owner, { ...base, startDate: '2026-12-02', deadline: '2026-12-01' })));
    await test('Từ chối ngày không tồn tại', () => assert.rejects(() => work.createTask(org.id, owner, { ...base, deadline: '2026-02-30' })));
    await test('Từ chối nhân viên trùng và checklist rỗng', async () => {
      await assert.rejects(() => work.createTask(org.id, owner, { ...base, assigneeIds: [staffEmp.id, staffEmp.id] }));
      await assert.rejects(() => work.createTask(org.id, owner, { ...base, checklist: [{ title: ' ' }] }));
    });
    await test('Từ chối trường bắt buộc bị thiếu, số vô hạn, ngày tùy chỉnh sai', async () => {
      for (const customFields of [{}, { budget: 'Infinity' }, { budget: true }, { budget: 1, launch: '2026-02-30' }]) {
        await assert.rejects(() => work.createTask(org.id, owner, { ...base, customFields }));
      }
    });
    await test('Lưu không hợp lệ không làm mất người phụ trách/checklist', async () => {
      await assert.rejects(() => work.updateTask(org.id, owner, task.id, { assigneeIds: [], checklist: [], customFields: { budget: 'invalid' } }));
      const saved = await work.getTask(org.id, owner, task.id);
      assert.equal(saved.assignees[0].id, staffEmp.id); assert.equal(saved.checklist.length, 2);
    });
    await test('Sửa việc và lưu checklist đồng bộ', async () => {
      const updated = await work.updateTask(org.id, owner, task.id, { title: 'Việc đã sửa', priority: 'HIGH', progress: 50, checklist: [{ title: 'Chuẩn bị', isDone: true }, { title: 'Bàn giao', isDone: false }] });
      assert.equal(updated.progress, 50); assert.equal(updated.checklist.filter(x => x.isDone).length, 1);
    });
    await test('Sửa riêng ngày vẫn kiểm tra khoảng thời gian hiện có', () => assert.rejects(() => work.updateTask(org.id, owner, task.id, { startDate: '2026-12-05' })));
    await test('Sao chép giữ trường tùy chỉnh và đặt lại tiến độ/checklist', async () => {
      const copied = await work.copyTask(org.id, owner, task.id);
      assert.equal(copied.customFields.budget, 100); assert.equal(copied.progress, 0); assert.ok(copied.checklist.every(x => !x.isDone));
    });
    const column = key => project.columns.find(c => c.key === key).id;
    await test('Chuyển cột trạng thái và lưu thứ tự', async () => {
      await work.moveTask(org.id, staff, task.id, { columnId: column('IN_PROGRESS'), sortOrder: 0 });
      assert.equal((await work.getTask(org.id, owner, task.id)).columnKey, 'IN_PROGRESS');
    });
    await test('Nhân viên không được tự chuyển Hoàn thành khi chưa duyệt', () => assert.rejects(() => work.moveTask(org.id, staff, task.id, { columnId: column('DONE'), sortOrder: 0 })));
    await test('Bình luận, trả lời và nhắc tên', async () => {
      comment = await collab.createComment(org.id, owner, task.id, { body: 'Nhờ kiểm tra', mentionIds: [staffEmp.id] });
      await collab.createComment(org.id, staff, task.id, { body: 'Đã nhận', parentId: comment.id });
      assert.ok((await collab.listComments(org.id, owner, task.id)).length >= 1);
    });
    await test('Sửa và xóa bình luận', async () => {
      await collab.updateComment(org.id, owner, comment.id, { body: 'Nội dung đã sửa' });
      await collab.deleteComment(org.id, owner, comment.id);
    });
    await test('Nộp duyệt → yêu cầu sửa → nộp lại → duyệt hoàn thành', async () => {
      await collab.submitForReview(org.id, staff, task.id, { note: 'Bàn giao lần 1' });
      await collab.requestFix(org.id, owner, task.id, { note: 'Bổ sung báo cáo' });
      assert.equal((await work.getTask(org.id, owner, task.id)).columnKey, 'NEEDS_FIX');
      await collab.submitForReview(org.id, staff, task.id, { note: 'Đã sửa' });
      await collab.approveTask(org.id, owner, task.id, { note: 'Đạt' });
      assert.equal((await work.getTask(org.id, owner, task.id)).columnKey, 'DONE');
    });
    await test('Lịch sử trạng thái và lịch sử duyệt', async () => {
      assert.ok((await collab.listStatusHistory(org.id, owner, task.id)).length >= 3);
      assert.ok((await collab.listReviewEvents(org.id, owner, task.id)).length >= 3);
    });
    await test('Bắt đầu → tạm dừng → tiếp tục → kết thúc đo giờ', async () => {
      const started = await insights.startTimer(org.id, staff, task.id);
      assert.equal((await insights.startTimer(org.id, staff, task.id)).id, started.id);
      await insights.pauseTimer(org.id, staff, task.id);
      assert.equal((await insights.startTimer(org.id, staff, task.id)).id, started.id);
      await insights.stopTimer(org.id, staff, task.id);
      assert.ok((await insights.listTimeLogs(org.id, staff, task.id)).some(x => x.status === 'STOPPED'));
    });
    await test('Ghi thời gian thủ công và từ chối số phút không hợp lệ', async () => {
      await insights.manualTime(org.id, staff, task.id, { durationMinutes: 30, note: 'Soạn báo cáo' });
      await assert.rejects(() => insights.manualTime(org.id, staff, task.id, { durationMinutes: -1 }));
      await assert.rejects(() => insights.manualTime(org.id, staff, task.id, { durationMinutes: Infinity }));
      await assert.rejects(() => insights.manualTime(org.id, staff, task.id, { durationMinutes: 1441 }));
      assert.ok((await insights.listTimeLogs(org.id, owner, task.id)).some(x => x.durationSeconds === 1800));
    });
    await test('Thông báo giao việc/duyệt và đánh dấu đã đọc', async () => {
      const notifications = await collab.listNotifications(org.id, staff);
      const items = Array.isArray(notifications) ? notifications : notifications.items;
      assert.ok(items.length > 0); await collab.markNotificationRead(org.id, staff, items[0].id);
      await collab.markAllNotificationsRead(org.id, staff);
    });
    await test('Tải lên file, liệt kê và tải xuống', async () => {
      const bytes = Buffer.from('%PDF-1.4\nQA fixture\n%%EOF');
      attachment = await collab.uploadFile(org.id, owner, { originalname: 'qa.pdf', mimetype: 'application/pdf', size: bytes.length, buffer: bytes }, { projectId: project.id, taskId: task.id });
      assert.ok((await collab.listTaskFiles(org.id, owner, task.id)).length > 0);
      const download = await collab.downloadAttachment(org.id, owner, attachment.id);
      assert.ok(download);
      await collab.softDeleteAttachment(org.id, owner, attachment.id);
    });
    await test('Tài liệu dự án', async () => { assert.ok(Array.isArray(await collab.listProjectDocuments(org.id, owner, project.id))); });
    await test('Việc của tôi, lịch, tổng quan nhân viên và dự án', async () => {
      assert.ok(await insights.myWork(org.id, staff));
      assert.ok(await insights.calendar(org.id, owner, { from: '2026-11-01', to: '2026-12-31' }));
      assert.ok(await insights.dashboard(org.id, owner, 'employee'));
      assert.ok(await insights.dashboard(org.id, owner, 'project'));
      assert.ok(await insights.employeeStats(org.id, owner, staffEmp.id));
    });
    await test('Xuất báo cáo CSV và bảng tính', async () => {
      assert.ok(await insights.exportReport(org.id, owner, 'csv'));
      assert.ok(await insights.exportReport(org.id, owner, 'xlsx'));
    });
    await test('Lịch sử thao tác được ghi và đọc lại đúng cột database', async () => {
      const logs = await insights.listAuditLogs(org.id, owner, { taskId: task.id });
      assert.ok(logs.some(log => log.action === 'TIME_START'));
      assert.ok(logs.some(log => log.action === 'TIME_MANUAL'));
    });
    await test('Phân quyền: người không liên quan không được xem/sửa việc', async () => {
      await assert.rejects(() => work.getTask(org.id, outsider, task.id));
      await assert.rejects(() => work.updateTask(org.id, outsider, task.id, { title: 'Không được phép' }));
    });
    await test('Cô lập dữ liệu giữa các tổ chức', async () => {
      foreignOrg = await prisma.organization.create({ data: { name: 'QA tổ chức khác', slug: `${slug}-other` } });
      await assert.rejects(() => work.getTask(foreignOrg.id, { ...owner, organizationId: foreignOrg.id }, task.id));
    });
    await test('Lưu trữ và khôi phục công việc', async () => {
      await work.archiveTask(org.id, owner, task.id, true);
      assert.ok(!(await work.getProject(org.id, owner, project.id)).tasks.some(x => x.id === task.id));
      await work.archiveTask(org.id, owner, task.id, false);
      assert.ok((await work.getProject(org.id, owner, project.id)).tasks.some(x => x.id === task.id));
    });
    await test('Việc định kỳ được tạo một lần và giữ thông tin bổ sung', async () => {
      const template = await work.createTask(org.id, owner, { ...base, title: 'Kiểm tra định kỳ' });
      await prisma.workTask.update({ where: { id: template.id }, data: { isRecurrenceTemplate: true, recurrenceRule: 'DAILY', recurrenceInterval: 1 } });
      const first = await insights.materializeRecurrences(org.id);
      assert.ok(first.created > 0);
      assert.equal((await insights.materializeRecurrences(org.id)).created, 0);
      const occurrence = await prisma.workTask.findFirst({ where: { organizationId: org.id, recurrenceSeriesId: template.id, isRecurrenceTemplate: false } });
      assert.equal(occurrence.customFields.budget, 100);
    });
    await test('Nhắc hạn và quá hạn chỉ gửi một lần mỗi ngày trong tổ chức thử', async () => {
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const yesterday = new Date(`${today}T00:00:00Z`); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      await work.createTask(org.id, owner, { ...base, title: 'Việc đến hạn', deadline: today });
      await work.createTask(org.id, owner, { ...base, title: 'Việc quá hạn', deadline: yesterday.toISOString().slice(0, 10) });
      assert.ok((await insights.sendDeadlineReminders(org.id)).sent > 0);
      assert.equal((await insights.sendDeadlineReminders(org.id)).sent, 0);
      assert.ok((await insights.sendOverdueNotifications(org.id)).sent > 0);
      assert.equal((await insights.sendOverdueNotifications(org.id)).sent, 0);
    });
    await test('Xóa mềm công việc', async () => {
      await work.softDeleteTask(org.id, owner, task.id);
      await assert.rejects(() => work.getTask(org.id, owner, task.id));
      assert.ok((await prisma.workTask.findUnique({ where: { id: task.id } })).deletedAt);
    });
    await test('Lưu trữ và khôi phục dự án', async () => {
      await work.updateProject(org.id, owner, project.id, { isArchived: true });
      assert.equal((await work.listProjects(org.id, owner)).length, 0);
      assert.equal((await work.listProjects(org.id, owner, true)).length, 1);
      await work.updateProject(org.id, owner, project.id, { isArchived: false });
    });
  } finally {
    // Exact fixture IDs only; no customer/project record is selected for cleanup.
    const fixture = await prisma.organization.findFirst({ where: { id: org.id, slug } });
    if (fixture) await prisma.organization.delete({ where: { id: fixture.id } });
    if (foreignOrg) await prisma.organization.delete({ where: { id: foreignOrg.id } });
    await prisma.$disconnect();
    const report = { testedAt: new Date().toISOString(), passed: results.filter(x => x.passed).length, failed: results.filter(x => !x.passed).length, results };
    fs.writeFileSync(path.resolve(process.env.WM_QA_REPORT || 'work-qa-results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
    if (report.failed) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
