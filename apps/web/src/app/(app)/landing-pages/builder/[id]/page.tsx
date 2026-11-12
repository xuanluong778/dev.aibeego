'use client';

import { useParams } from 'next/navigation';
import { LandingPageBuilder } from '@/components/landing-pages/landing-page-builder';

export default function LandingPageBuilderPage() {
  const params = useParams<{ id: string }>();
  const pageId = params.id;

  return (
    // Height is locked by AppShell (h-[100dvh] + overflow-hidden) on builder routes.
    // Only the canvas column scrolls — toolbar stays pinned under the app header.
    <div
      className={
        'flex h-full min-h-0 flex-1 flex-col overflow-hidden ' +
        '[[data-lp-preview-mode=1]_&]:fixed [[data-lp-preview-mode=1]_&]:inset-0 ' +
        '[[data-lp-preview-mode=1]_&]:z-[90] [[data-lp-preview-mode=1]_&]:m-0 ' +
        '[[data-lp-preview-mode=1]_&]:h-[100dvh] [[data-lp-preview-mode=1]_&]:w-screen'
      }
      data-lp-builder-page="1"
      data-lp-no-double-scroll="1"
    >
      {/* Remount on page change so history/clipboard/refs never leak across pages. */}
      <LandingPageBuilder key={pageId} pageId={pageId} />
    </div>
  );
}
