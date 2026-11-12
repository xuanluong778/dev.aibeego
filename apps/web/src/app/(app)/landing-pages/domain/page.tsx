'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient } from '@/lib/api-client';
import { useT } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DomainRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subdomainSlug: string | null;
  customDomain: string | null;
  customDomainStatus: string | null;
  customDomainError: string | null;
  customDomainVerifiedAt?: string | null;
};

export default function LandingPagesDomainPage() {
  const t = useT();
  const [items, setItems] = useState<DomainRow[]>([]);
  const [architecture, setArchitecture] = useState<Record<string, string> | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [domain, setDomain] = useState('');
  const [msg, setMsg] = useState('');

  async function reload() {
    const res = await apiClient<{ items: DomainRow[]; architecture: Record<string, string> }>(
      '/landing-pages/domains',
    );
    setItems(res.items);
    setArchitecture(res.architecture);
    if (!selectedId && res.items[0]) setSelectedId(res.items[0].id);
  }

  useEffect(() => {
    void reload().catch((e) => setMsg(e instanceof Error ? e.message : 'Error'));
  }, []);

  async function saveDomain() {
    if (!selectedId || !domain.trim()) return;
    await apiClient(`/landing-pages/${selectedId}/domain`, {
      method: 'POST',
      body: JSON.stringify({ customDomain: domain.trim() }),
    });
    setMsg('Đã lưu domain (PENDING) — bấm Verify DNS');
    setDomain('');
    await reload();
  }

  async function verify() {
    if (!selectedId) return;
    const res = await apiClient<{
      page: DomainRow;
      dns: { ok: boolean; expected: string; found: string[]; error?: string };
    }>(`/landing-pages/${selectedId}/domain/verify`, { method: 'POST', body: '{}' });
    setMsg(
      res.dns.ok
        ? `ACTIVE — CNAME OK → ${res.dns.expected}`
        : `FAILED — ${res.dns.error || 'DNS mismatch'} (found: ${res.dns.found.join(', ') || 'none'})`,
    );
    await reload();
  }

  return (
    <div>
      <PageHeader title={t('landingPages.domain')} description={t('landingPages.domainDesc')} />
      {architecture ? (
        <div className="mb-4 rounded-lg border border-white/10 p-3 text-sm opacity-80">
          <div>Subdomain: {architecture.defaultSubdomain}</div>
          <div className="mt-1">Custom: {architecture.customDomain}</div>
          <div className="mt-1">Status: {architecture.statuses}</div>
        </div>
      ) : null}
      <div className="mb-4 flex max-w-xl flex-wrap gap-2">
        <select
          className="lp-dark-select rounded-md border border-white/10 bg-zinc-900 px-2 py-2 text-sm text-white"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <Input
          className="max-w-xs"
          placeholder="lp.example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <Button onClick={() => void saveDomain()}>Gắn domain</Button>
        <Button variant="outline" onClick={() => void verify()}>
          Verify DNS
        </Button>
      </div>
      {msg ? <p className="mb-2 text-sm opacity-70">{msg}</p> : null}
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm">
            <div className="font-medium">{i.name}</div>
            <div className="text-xs opacity-60">
              subdomain: {i.subdomainSlug || '—'} · custom: {i.customDomain || '—'} ·{' '}
              <span className="font-medium">{i.customDomainStatus || 'n/a'}</span>
              {i.customDomainError ? ` · ${i.customDomainError}` : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
