'use client';

/**
 * Public / draft-preview interactive shell.
 * Receives server-fetched payload — keeps builder out of this route's RSC tree.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LandingPageSpec } from '@marketingspa/shared';
import { isAgencyPortfolioStandard } from './agency-portfolio-client';
import { getApiBaseUrl } from '@/lib/api-client';
import { interpretPublicLeadResponse } from '@/components/landing-pages/landing-page-public-lead';

const LandingPageRenderer = dynamic(
  () => import('@/components/landing-pages/landing-page-renderer').then((m) => m.LandingPageRenderer),
  { loading: () => <div className="min-h-[40vh] bg-white" data-lp-public-loading="1" /> },
);
import {
  detectDevice,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  injectTrackingPixels,
  readUtmFromLocation,
} from '@/components/landing-pages/lp-tracking';

type PublicViewport = 'desktop' | 'tablet' | 'mobile';

function readPublicViewport(): PublicViewport {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth || 1280;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export type PublicLandingPayload = {
  slug: string;
  name: string;
  spec: LandingPageSpec;
  seo: {
    title: string;
    description: string;
    canonical?: string | null;
    ogImage?: string | null;
    robotsIndex: boolean;
  };
  trackingConfig?: Record<string, unknown> | null;
  /** Draft preview — no analytics write / noindex. */
  isPreview?: boolean;
};

export function PublicLandingPageClient({
  initial,
  eventsSlug,
}: {
  initial: PublicLandingPayload;
  /** Slug used for public event/lead endpoints (preview uses special path). */
  eventsSlug?: string;
}) {
  const api = useMemo(() => getApiBaseUrl(), []);
  const [data] = useState(initial);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const leadInflight = useRef<Promise<void> | null>(null);
  const [viewport, setViewport] = useState<PublicViewport>('desktop');
  const trackedView = useRef(false);
  const utm = useMemo(() => readUtmFromLocation(), []);
  const slug = eventsSlug || data.slug;
  const isPreview = Boolean(data.isPreview);

  useEffect(() => {
    const sync = () => setViewport(readPublicViewport());
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    injectTrackingPixels(isPreview ? null : data.trackingConfig);
  }, [data.trackingConfig, isPreview]);

  useEffect(() => {
    if (isPreview || trackedView.current) return;
    trackedView.current = true;
    void fetch(`${api}/landing-pages/public/${encodeURIComponent(slug)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'PAGE_VIEW',
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        device: detectDevice(),
        referrer: document.referrer || undefined,
        ...utm,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [api, isPreview, slug, utm]);

  async function track(eventType: string, meta?: Record<string, unknown>) {
    if (isPreview) return;
    await fetch(`${api}/landing-pages/public/${encodeURIComponent(slug)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        device: detectDevice(),
        referrer: document.referrer || undefined,
        meta,
        ...utm,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return (
    <main
      data-lp-public-root="1"
      data-lp-preview={isPreview ? '1' : undefined}
      onClick={(e) => {
        const t = e.target as HTMLElement | null;
        const a = t?.closest?.('a') as HTMLAnchorElement | null;
        if (!a?.href) return;
        const blockEl = t?.closest?.('[data-lp-block-id]') as HTMLElement | null;
        void track('CTA_CLICK', {
          href: a.href.slice(0, 500),
          blockId: blockEl?.getAttribute('data-lp-block-id') || undefined,
        });
      }}
    >
      {isPreview ? (
        <div
          className="sticky top-0 z-[100] bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-zinc-900"
          data-lp-preview-banner
        >
          Bản xem trước nháp — không index SEO · không ghi analytics
        </div>
      ) : null}
      {success ? (
        <div className="bg-emerald-600 px-4 py-2 text-center text-sm text-white">{success}</div>
      ) : null}
      {formError && !isAgencyPortfolioStandard(data.spec) ? (
        <div className="bg-red-700 px-4 py-2 text-center text-sm text-white" data-lp-form-error>
          {formError}
        </div>
      ) : null}
      <LandingPageRenderer
        spec={data.spec}
        mode={isPreview && isAgencyPortfolioStandard(data.spec) ? 'preview' : 'public'}
        viewport={viewport}
        onLeadSubmit={
          isPreview
            ? async () => {
                setSuccess('Preview: form không gửi lead thật.');
              }
            : async (fields, blockId) => {
                if (leadInflight.current) return leadInflight.current;
                setFormError(null);
                setSuccess(null);
                const task = (async () => {
                try {
                  const res = await fetch(
                    `${api}/landing-pages/public/${encodeURIComponent(slug)}/lead`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        fields,
                        blockId,
                        website: '',
                        attribution: utm,
                        referrer: document.referrer || undefined,
                        landingPageUrl: window.location.href,
                        visitorId: getOrCreateVisitorId(),
                        sessionId: getOrCreateSessionId(),
                        device: detectDevice(),
                      }),
                    },
                  );
                  let body: { ok?: boolean; message?: string } | null = null;
                  try {
                    body = (await res.json()) as { ok?: boolean; message?: string };
                  } catch {
                    body = null;
                  }
                  const result = isAgencyPortfolioStandard(data.spec) && body?.ok !== true
                    ? {ok:false, message:body?.message || 'Chưa nhận được xác nhận gửi thành công. Vui lòng thử lại.'}
                    : interpretPublicLeadResponse(res.status, body);
                  if (!result.ok) {
                    setSuccess(null);
                    setFormError(result.message);
                    throw new Error(result.message);
                  }
                  await track('FORM_SUBMIT', { blockId });
                  setFormError(null);
                  setSuccess(isAgencyPortfolioStandard(data.spec) ? null : result.message);
                } finally {
                  leadInflight.current = null;
                }
                })();
                leadInflight.current = task;
                return task;
              }
        }
        onFormStart={() => {
          void track('FORM_START');
        }}
      />
    </main>
  );
}
