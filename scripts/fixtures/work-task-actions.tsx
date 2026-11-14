import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkTaskActionsMenu } from '../../apps/web/src/components/work-management/work-task-actions-menu';
import { WorkTaskBoardCard } from '../../apps/web/src/components/work-management/work-task-board-card';
import type { WorkTask } from '../../apps/web/src/types/work-management';

const calls: string[] = [];
(window as any).__taskActionCalls = calls;
const task = { id: 'task', title: 'Chuẩn bị báo cáo', columnId: 'new', columnKey: 'NEW', labels: [], checklist: [] } as unknown as WorkTask;
const columns = [{ id: 'new', key: 'NEW', name: 'Cần làm', sortOrder: 0 }, { id: 'done', key: 'DONE', name: 'Hoàn thành', sortOrder: 1 }];
const disabled = new URLSearchParams(window.location.search).has('readonly');
createRoot(document.getElementById('root')!).render(
  <div style={{ padding: 24, display: 'flex', gap: 12, maxWidth: 340 }}>
    <div onClick={() => calls.push('open')}>
      <WorkTaskBoardCard task={task} onOpen={() => calls.push('open')} onComplete={disabled ? undefined : () => calls.push('complete')} />
    </div>
    <WorkTaskActionsMenu task={task} columns={columns} disabled={disabled}
      onEdit={() => calls.push('edit')} onMove={id => calls.push(`move:${id}`)}
      onCopy={() => calls.push('copy')} onArchive={() => calls.push('archive')} onDelete={() => calls.push('delete')} />
  </div>,
);
