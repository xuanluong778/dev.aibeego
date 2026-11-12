import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/** Refresh ISR for a single published landing page after publish or unpublish. */
export async function POST(request: Request) {
  let slug = '';
  try {
    const body = (await request.json()) as { slug?: unknown };
    if (typeof body.slug === 'string') slug = body.slug.trim();
  } catch {
    slug = '';
  }
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/i.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  revalidateTag(`lp-public-${slug}`);
  revalidatePath(`/p/${slug}`);
  return NextResponse.json({ ok: true, slug });
}
