'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LandingPageLeadFormCrmConfig, LandingPageLeadFormBlock } from '@marketingspa/shared';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';

type PipelineRow = {
  id: string;
  name: string;
  stages?: Array<{ id: string; name: string; code: string }>;
};

type EmployeeRow = { id: string; name: string; isActive?: boolean };

export function LeadFormCrmInspector({
  block,
  onChange,
}: {
  block: LandingPageLeadFormBlock;
  onChange: (crm: LandingPageLeadFormCrmConfig | undefined) => void;
}) {
  const crm = block.crm ?? {};
  const [tagsText, setTagsText] = useState((crm.tags ?? []).join(', '));

  useEffect(() => {
    setTagsText((crm.tags ?? []).join(', '));
  }, [block.id, crm.tags]);

  const { data: pipelines = [] } = useQuery({
    queryKey: ['crm', 'pipelines'],
    queryFn: () => apiClient<PipelineRow[]>('/crm/pipelines'),
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient<{ items?: EmployeeRow[] } | EmployeeRow[]>('/employees'),
  });

  const employees = useMemo(() => {
    const raw = Array.isArray(employeesRes) ? employeesRes : employeesRes?.items ?? [];
    return raw.filter((e) => e.isActive !== false);
  }, [employeesRes]);

  const stages = useMemo(() => {
    const pipe = pipelines.find((p) => p.id === crm.pipelineId);
    return pipe?.stages ?? pipelines[0]?.stages ?? [];
  }, [pipelines, crm.pipelineId]);

  function patch(partial: Partial<LandingPageLeadFormCrmConfig>) {
    const next: LandingPageLeadFormCrmConfig = { ...crm, ...partial };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined && v !== '' && v !== null),
    ) as LandingPageLeadFormCrmConfig;
    onChange(Object.keys(cleaned).length ? cleaned : undefined);
  }

  return (
    <div className="space-y-2 rounded border border-violet-500/30 bg-violet-500/5 p-2" data-lp-crm-inspector>
      <div className="text-[10px] font-semibold uppercase text-violet-300">CRM — Form → Lead</div>
      <label className="block text-[11px] opacity-70">
        Pipeline
        <select
          className="lp-dark-select mt-0.5 w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm"
          value={crm.pipelineId ?? ''}
          onChange={(e) =>
            patch({ pipelineId: e.target.value || undefined, stageId: undefined })
          }
        >
          <option value="">Mặc định tổ chức</option>
          {pipelines.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] opacity-70">
        Giai đoạn (status)
        <select
          className="lp-dark-select mt-0.5 w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm"
          value={crm.stageId ?? ''}
          onChange={(e) => patch({ stageId: e.target.value || undefined })}
        >
          <option value="">Mặc định (New)</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] opacity-70">
        Người phụ trách
        <select
          className="lp-dark-select mt-0.5 w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm"
          value={crm.assignedToId ?? ''}
          onChange={(e) =>
            patch({
              assignedToId: e.target.value || undefined,
              autoAssign: e.target.value ? false : undefined,
            })
          }
        >
          <option value="">Tự động phân công</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] opacity-70">
        Tags (phẩy)
        <Input
          className="mt-0.5 h-8 text-sm"
          placeholder="vip, webinar-2026"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          onBlur={() => {
            const tags = tagsText
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 12);
            patch({ tags: tags.length ? tags : undefined });
          }}
        />
      </label>
      <label className="flex items-center gap-2 text-[11px] opacity-80">
        <input
          type="checkbox"
          checked={crm.autoAssign === false}
          onChange={(e) => patch({ autoAssign: e.target.checked ? false : undefined })}
        />
        Không tự phân công khi không chọn owner
      </label>
      <label className="block text-[11px] opacity-70">
        Webhook URL (HTTPS)
        <Input
          className="mt-0.5 h-8 text-sm"
          placeholder="https://hooks.example.com/lp-lead"
          value={crm.webhookUrl ?? ''}
          onChange={(e) => patch({ webhookUrl: e.target.value.trim() || undefined })}
        />
      </label>
      <label className="block text-[11px] opacity-70">
        Webhook secret (header X-LP-Webhook-Secret)
        <Input
          className="mt-0.5 h-8 text-sm"
          type="password"
          autoComplete="off"
          value={crm.webhookSecret ?? ''}
          onChange={(e) => patch({ webhookSecret: e.target.value.trim() || undefined })}
        />
      </label>
      <p className="text-[10px] leading-snug opacity-50">
        Lead lưu landingPageId, blockId, UTM, referrer, device, source. Automation:{' '}
        <strong>Landing Page Lead Created</strong>.
      </p>
    </div>
  );
}
