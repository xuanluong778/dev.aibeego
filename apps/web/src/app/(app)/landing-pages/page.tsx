'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient } from '@/lib/api-client';
import { useT } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Overview = {
  total: number;
  published: number;
  draft: number;
  archived: number;
  templates: number;
  recent: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    theme: string;
    updatedAt: string;
  }>;
  defaultSubdomainHint: string;
};

type StatCard = {
  key: string;
  label: string;
  value: number;
  href: string;
  hint: string;
};

export default function LandingPagesOverviewPage() {
  const t = useT();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiClient<Overview>('/landing-pages/overview')
      .then((res) => {
        setData({
          total: Number(res?.total) || 0,
          published: Number(res?.published) || 0,
          draft: Number(res?.draft) || 0,
          archived: Number(res?.archived) || 0,
          templates: Number(res?.templates) || 0,
          recent: Array.isArray(res?.recent) ? res.recent : [],
          defaultSubdomainHint: res?.defaultSubdomainHint || '',
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  const stats: StatCard[] = data
    ? [
        {
          key: 'total',
          label: t('landingPages.statTotal'),
          value: data.total,
          href: '/landing-pages/pages',
          hint: t('landingPages.statTotalHint'),
        },
        {
          key: 'published',
          label: t('landingPages.statPublished'),
          value: data.published,
          href: '/landing-pages/pages?status=PUBLISHED',
          hint: t('landingPages.statPublishedHint'),
        },
        {
          key: 'draft',
          label: t('landingPages.statDraft'),
          value: data.draft,
          href: '/landing-pages/pages?status=DRAFT',
          hint: t('landingPages.statDraftHint'),
        },
        {
          key: 'templates',
          label: t('landingPages.statTemplates'),
          value: data.templates,
          href: '/landing-pages/templates',
          hint: t('landingPages.statTemplatesHint'),
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={t('landingPages.title')}
        description={t('landingPages.overviewDesc')}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/landing-pages/create">{t('landingPages.create')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/landing-pages/pages">{t('landingPages.myPages')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/landing-pages/templates">{t('landingPages.templates')}</Link>
        </Button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!data && !error ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-lp-overview-stats-loading>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[88px] animate-pulse rounded-lg border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : null}
      {data ? (
        <>
          <div
            className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            data-lp-overview-stats
          >
            {stats.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                data-lp-overview-stat={card.key}
                className={cn(
                  'group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition',
                  'hover:border-[#F97316]/50 hover:bg-white/[0.06] focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#F97316]/60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs opacity-60">{card.label}</div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[#F97316]/80 opacity-0 transition group-hover:opacity-100">
                    {t('landingPages.statOpen')}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{card.value}</div>
                <div className="mt-1 text-[11px] opacity-45">{card.hint}</div>
              </Link>
            ))}
          </div>
          {data.defaultSubdomainHint ? (
            <p className="mb-3 text-xs opacity-60">
              Subdomain mặc định: {data.defaultSubdomainHint}
            </p>
          ) : null}
          <h2 className="mb-2 text-sm font-semibold">{t('landingPages.recent')}</h2>
          <ul className="space-y-2">
            {data.recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{p.name || t('landingPages.untitled')}</div>
                  <div className="text-xs opacity-60">
                    /{p.slug} · {p.status} · {p.theme}
                  </div>
                </div>
                <Link className="underline" href={`/landing-pages/builder/${p.id}`}>
                  Builder
                </Link>
              </li>
            ))}
            {!data.recent.length ? (
              <li className="text-sm opacity-60">{t('landingPages.empty')}</li>
            ) : null}
          </ul>
        </>
      ) : null}
    </div>
  );
}
