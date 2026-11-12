import { notFound } from 'next/navigation';
import { getLandingPageSystemTemplate } from '@marketingspa/shared';
import { LandingPageRenderer } from '@/components/landing-pages/landing-page-renderer';

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ viewport?: string }> | { viewport?: string };
};

/**
 * Auth-free shot route for screenshot/QA pipeline.
 * Renders the same LandingPageRenderer used after "Dùng mẫu".
 * Not linked in app navigation.
 */
export default async function LpTemplateShotPage({ params, searchParams }: Props) {
  const p = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams || {});
  const slug = decodeURIComponent(p.slug || '');
  const tpl = getLandingPageSystemTemplate(slug);
  if (!tpl) notFound();

  const vpRaw = typeof sp.viewport === 'string' ? sp.viewport : 'desktop';
  const viewport =
    vpRaw === 'tablet' || vpRaw === 'mobile' || vpRaw === 'desktop' ? vpRaw : 'desktop';

  return (
    <div
      data-lp-template-shot="1"
      data-slug={tpl.slug}
      data-design-family={tpl.designFamily || tpl.spec.meta?.designFamily || ''}
      data-conversion-goal={tpl.conversionGoal || tpl.spec.meta?.conversionGoal || ''}
      className="min-h-screen bg-white text-neutral-900"
    >
      <LandingPageRenderer
        spec={tpl.spec}
        categoryHint={tpl.category}
        viewport={viewport}
        mode="preview"
        className="min-h-screen"
      />
    </div>
  );
}
