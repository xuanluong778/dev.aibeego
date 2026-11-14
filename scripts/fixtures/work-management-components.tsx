// Browser component fixture: production components, mocked network hooks only.
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WorkEmployeePicker } from '../../apps/web/src/components/work-management/work-employee-picker';
import { WorkTaskCustomFields } from '../../apps/web/src/components/work-management/work-task-custom-fields';
import { WorkTaskTimePanel } from '../../apps/web/src/components/work-management/work-task-time-panel';
export function App() {
  const [selected, setSelected] = useState<string[]>([]);
  return <main>
    <section id="employees"><WorkEmployeePicker label="Người thực hiện" value={selected} onChange={setSelected} multiple /></section>
    <section id="custom"><WorkTaskCustomFields task={{ id: 'task', projectId: 'project', customFields: {} } as any} /></section>
    <section id="time"><WorkTaskTimePanel taskId="task" open /></section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App />);
