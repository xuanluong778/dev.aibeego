'use client';
import { useEffect, useState } from 'react';
import { LandingPageRenderer } from '@/components/landing-pages/landing-page-renderer';
import type { LandingPageSpec } from '@marketingspa/shared';
import { PublicLandingPageClient } from '@/components/landing-pages/public-landing-page-client';
import { LandingPageBuilder } from '@/components/landing-pages/landing-page-builder';
export function AgencyPilotQa({ spec, surface }: { spec: LandingPageSpec; surface: string }) {
  const [current, setCurrent] = useState(spec);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  useEffect(() => {
    const sync = () =>
      setViewport(innerWidth < 640 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop');
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);
  useEffect(() => {
    (
      window as unknown as { agencyPilotSetSpec: (value: LandingPageSpec) => void }
    ).agencyPilotSetSpec = setCurrent;
  }, []);
  if (surface === 'renderer' || surface === 'legacy')
    return <LandingPageRenderer spec={current} mode="preview" viewport={viewport} />;
  if (surface === 'builder')
    return (
      <div className="h-screen flex flex-col" data-lp-builder-page="1">
        <LandingPageBuilder pageId="agency-pilot-local" />
      </div>
    );
  return (
    <PublicLandingPageClient
      initial={{
        slug: 'agency-pilot-local',
        name: 'Agency Portfolio — local QA',
        spec: current,
        seo: { title: 'Local QA', description: 'Local QA only', robotsIndex: false },
        isPreview: surface !== 'public',
      }}
    />
  );
}
