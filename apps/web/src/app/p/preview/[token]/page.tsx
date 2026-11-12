import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  PublicLandingPageClient,
  type PublicLandingPayload,
} from '@/components/landing-pages/public-landing-page-client';
import { landingPagePublicApiBase } from '@/lib/landing-page-public-api';

export const dynamic = 'force-dynamic';

async function fetchPreview(token: string): Promise<PublicLandingPayload | null> {
  try {
    const res = await fetch(
      `${landingPagePublicApiBase()}/api/v1/landing-pages/public/preview/${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicLandingPayload;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Draft preview',
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

/** Read-only draft preview by opaque token — never indexes; never mutates published. */
export default async function DraftPreviewPage({
  params,
}: {
  params: Promise<{ token: string }> | { token: string };
}) {
  const { token } = await Promise.resolve(params);
  const data = await fetchPreview(token);
  if (!data) notFound();

  return <PublicLandingPageClient initial={{ ...data, isPreview: true }} />;
}
