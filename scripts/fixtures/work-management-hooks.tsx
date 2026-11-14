import React, { useEffect, useState } from 'react';
declare global { interface Window { __wmCalls: any[]; __wmLogs: any[]; __wmFail: boolean } }
window.__wmCalls = [];
window.__wmLogs = [{ id: 'other', employeeId: 'other-person', status: 'RUNNING', durationSeconds: 0, startedAt: new Date().toISOString() }];
function changed() { window.dispatchEvent(new Event('wm-change')); }
function useRefresh() { const [, setTick] = useState(0); useEffect(() => { const listener = () => setTick(v => v + 1); window.addEventListener('wm-change', listener); return () => window.removeEventListener('wm-change', listener); }, []); }
export function useCurrentUser() { return { data: { role: 'OWNER', employeeId: 'me', permissions: ['hrm.employee.write'] } }; }
export function hasPermission(user: any) { return !!user?.role; }
export function useHrmEmployees({ q = '', page = 1, pageSize = 20 }: any) {
  const employees = Array.from({ length: 21 }, (_, i) => ({ id: `employee-${i}`, name: i ? `Nhân viên ${i}` : 'Nguyễn An', isActive: true }));
  const filtered = employees.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  return { data: { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length }, isLoading: false, isError: false };
}
export function useHrmDepartments() { return { data: [] }; }
export function useHrmEmployeeMutations() { return { create: { isPending: false } }; }
export function useWorkProject() { return { data: { customFieldDefs: [{ id: 'budget', name: 'Ngân sách', type: 'number', required: true }, { id: 'kind', name: 'Loại việc', type: 'select', options: ['Nội bộ', 'Khách hàng'] }] }, isSuccess: true }; }
export function useTaskTimeLogs() { useRefresh(); return { data: window.__wmLogs, isLoading: false }; }
function useMutation(name: string) {
  const [error, setError] = useState<Error | null>(null);
  return { isPending: false, error, mutate(body?: any, options?: any) {
    if (window.__wmFail) { const e = new Error('Không thể lưu. Vui lòng thử lại.'); setError(e); options?.onError?.(e); return; }
    window.__wmCalls.push({ name, body });
    if (name === 'start') window.__wmLogs = [...window.__wmLogs.filter(l => l.employeeId !== 'me'), { id: 'mine', employeeId: 'me', status: 'RUNNING', startedAt: new Date().toISOString(), durationSeconds: 0 }];
    if (name === 'pause' || name === 'stop') window.__wmLogs = window.__wmLogs.map(l => l.employeeId === 'me' ? { ...l, status: name === 'pause' ? 'PAUSED' : 'STOPPED' } : l);
    changed(); options?.onSuccess?.(body);
  } };
}
export function useUpdateWorkTask() { return useMutation('update'); }
export function useStartTaskTimer() { return useMutation('start'); }
export function usePauseTaskTimer() { return useMutation('pause'); }
export function useStopTaskTimer() { return useMutation('stop'); }
export function useManualTaskTime() { return useMutation('manual'); }
