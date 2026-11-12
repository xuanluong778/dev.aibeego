'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient } from '@/lib/api-client';
import { useT } from '@/i18n/i18n-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Analytics = {
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    ctaClicks: number;
    formStarts: number;
    formSubmits: number;
    leads: number;
    conversionRate: number;
    bookingsOrSales: number;
  };
  funnel?: {
    views: number;
    cta: number;
    leads: number;
    sales: number;
    rates: {
      viewToCta: number;
      ctaToLead: number;
      leadToSale: number;
      viewToLead: number;
      viewToSale: number;
    };
  };
  viewsByDay?: Array<{ date: string; count: number }>;
  ctaByBlock?: Array<{ blockId: string; count: number }>;
  formByBlock?: Array<{ blockId: string; count: number }>;
  byDevice: Array<{ device: string; count: number }>;
  byUtm: Array<{ utmSource: string | null; utmCampaign: string | null; count: number }>;
};

type PageOpt = { id: string; name: string };

export default function LandingPagesAnalyticsPage() {
  const t = useT();
  const [data, setData] = useState<Analytics | null>(null);
  const [pages, setPages] = useState<PageOpt[]>([]);
  const [pageId, setPageId] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [device, setDevice] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const qs = new URLSearchParams();
    if (pageId) qs.set('pageId', pageId);
    if (utmSource) qs.set('utmSource', utmSource);
    if (device) qs.set('device', device);
    const q = qs.toString() ? `?${qs}` : '';
    const res = await apiClient<Analytics>(`/landing-pages/analytics${q}`);
    setData(res);
  }

  useEffect(() => {
    void apiClient<{ items: PageOpt[] }>('/landing-pages')
      .then((r) => setPages(r.items.map((p) => ({ id: p.id, name: p.name }))))
      .catch(() => undefined);
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader title={t('landingPages.analytics')} description={t('landingPages.analyticsDesc')} />
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="lp-dark-select rounded-md border border-white/10 bg-zinc-900 px-2 py-2 text-sm text-white"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
        >
          <option value="">Tất cả trang</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Input
          className="max-w-[160px]"
          placeholder="utm_source"
          value={utmSource}
          onChange={(e) => setUtmSource(e.target.value)}
        />
        <select
          className="lp-dark-select rounded-md border border-white/10 bg-zinc-900 px-2 py-2 text-sm text-white"
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        >
          <option value="">Device</option>
          <option value="desktop">desktop</option>
          <option value="tablet">tablet</option>
          <option value="mobile">mobile</option>
        </select>
        <Button
          size="sm"
          onClick={() => void load().catch((e) => setError(e instanceof Error ? e.message : 'Error'))}
        >
          Lọc
        </Button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {data ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['Page View', data.metrics.pageViews],
                ['Unique', data.metrics.uniqueVisitors],
                ['CTA Click', data.metrics.ctaClicks],
                ['Form Start', data.metrics.formStarts],
                ['Form Submit', data.metrics.formSubmits],
                ['Lead', data.metrics.leads],
                ['Conv %', data.metrics.conversionRate],
                ['Booking/Sale', data.metrics.bookingsOrSales],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 p-4">
                <div className="text-xs opacity-60">{label}</div>
                <div className="text-2xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
          {data.funnel ? (
            <div
              className="mb-4 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4"
              data-lp-analytics-funnel
            >
              <h3 className="mb-3 text-sm font-semibold">Funnel — View → CTA → Lead → Sale</h3>
              <div className="grid gap-2 sm:grid-cols-4">
                {(
                  [
                    ['View', data.funnel.views],
                    ['CTA', data.funnel.cta],
                    ['Lead', data.funnel.leads],
                    ['Sale', data.funnel.sales],
                  ] as const
                ).map(([label, count], i, arr) => (
                  <div key={label} className="relative rounded border border-white/10 p-3 text-center">
                    <div className="text-xs opacity-60">{label}</div>
                    <div className="text-xl font-semibold">{count}</div>
                    {i > 0 ? (
                      <div className="mt-1 text-[10px] text-violet-300">
                        {i === 1 && `${data.funnel!.rates.viewToCta}% từ View`}
                        {i === 2 && `${data.funnel!.rates.ctaToLead}% từ CTA`}
                        {i === 3 && `${data.funnel!.rates.leadToSale}% từ Lead`}
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] opacity-50">
                        View→Lead {data.funnel!.rates.viewToLead}% · View→Sale{' '}
                        {data.funnel!.rates.viewToSale}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 p-4" data-lp-analytics-views-by-day>
              <h3 className="mb-2 text-sm font-semibold">Views theo ngày</h3>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
                {(data.viewsByDay || []).length === 0 ? (
                  <li className="opacity-50">Chưa có dữ liệu</li>
                ) : (
                  (data.viewsByDay || []).map((r) => (
                    <li key={r.date}>
                      {r.date}: {r.count}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 p-4" data-lp-analytics-cta-by-block>
              <h3 className="mb-2 text-sm font-semibold">CTA click theo block</h3>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
                {(data.ctaByBlock || []).length === 0 ? (
                  <li className="opacity-50">Chưa có dữ liệu</li>
                ) : (
                  (data.ctaByBlock || []).map((r) => (
                    <li key={r.blockId} className="truncate" title={r.blockId}>
                      {r.blockId}: {r.count}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 p-4 md:col-span-2" data-lp-analytics-form-by-block>
              <h3 className="mb-2 text-sm font-semibold">Form submit theo block</h3>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
                {(data.formByBlock || []).length === 0 ? (
                  <li className="opacity-50">Chưa có dữ liệu</li>
                ) : (
                  (data.formByBlock || []).map((r) => (
                    <li key={r.blockId} className="truncate" title={r.blockId}>
                      {r.blockId}: {r.count}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 p-4">
              <h3 className="mb-2 text-sm font-semibold">Theo device</h3>
              <ul className="space-y-1 text-sm">
                {data.byDevice.map((r) => (
                  <li key={r.device}>
                    {r.device}: {r.count}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <h3 className="mb-2 text-sm font-semibold">Theo UTM</h3>
              <ul className="space-y-1 text-sm">
                {data.byUtm.map((r, i) => (
                  <li key={`${r.utmSource}-${r.utmCampaign}-${i}`}>
                    {r.utmSource || '—'} / {r.utmCampaign || '—'}: {r.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
