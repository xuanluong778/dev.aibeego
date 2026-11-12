/** Bust the Next cache for one public landing page. Never touches other slugs. */
export async function revalidatePublicLandingPage(slug: string): Promise<boolean> {
  const clean = slug.trim();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/i.test(clean)) return false;
  try {
    const res = await fetch('/api/landing-pages/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: clean }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
