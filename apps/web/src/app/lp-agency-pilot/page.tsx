import { notFound } from 'next/navigation';
import { getLandingPageSystemTemplate } from '@marketingspa/shared';
import legacy from '../../../../../scripts/fixtures/agency-portfolio/legacy-spec.json';
import type { LandingPageSpec } from '@marketingspa/shared';
import { AgencyPilotQa } from './pilot-qa';
export const dynamic = 'force-dynamic';
/** Local QA only; never available in a production build. No database connection. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ surface?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development' || process.env.LP_AGENCY_PILOT_QA !== '1') notFound();
  const { surface } = await searchParams;
  const spec =
    surface === 'legacy'
      ? (legacy as LandingPageSpec)
      : getLandingPageSystemTemplate('agency-portfolio')!.spec;
  return <AgencyPilotQa spec={spec} surface={surface || 'preview'} />;
}
