'use client';

/**
 * Lightweight CSS wireframe thumbnails for Section Library.
 * Never mounts LandingPageRenderer — safe to show dozens at once.
 */

import type { LpSectionThumbLayout } from './landing-page-section-library-catalog';

const bar = 'rounded-sm bg-zinc-300/90';
const muted = 'rounded-sm bg-zinc-200/80';
const accent = 'rounded-sm bg-orange-400/80';

export function SectionLibraryThumb({
  layout,
  className,
}: {
  layout: LpSectionThumbLayout;
  className?: string;
}) {
  return (
    <div
      className={
        'relative aspect-[16/10] w-full overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 p-2 ' +
        (className || '')
      }
      data-lp-section-thumb={layout}
      aria-hidden
    >
      <ThumbInner layout={layout} />
    </div>
  );
}

function ThumbInner({ layout }: { layout: LpSectionThumbLayout }) {
  switch (layout) {
    case 'hero-centered':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4">
          <div className={`h-2 w-3/5 ${bar}`} />
          <div className={`h-1.5 w-2/5 ${muted}`} />
          <div className={`mt-1 h-2 w-14 ${accent}`} />
        </div>
      );
    case 'hero-split-left':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1 pr-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1.5 w-4/5 ${muted}`} />
            <div className={`mt-1 h-2 w-10 ${accent}`} />
          </div>
          <div className="rounded-sm bg-zinc-300/70" />
        </div>
      );
    case 'hero-split-right':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="rounded-sm bg-zinc-300/70" />
          <div className="flex flex-col justify-center gap-1 pl-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1.5 w-4/5 ${muted}`} />
            <div className={`mt-1 h-2 w-10 ${accent}`} />
          </div>
        </div>
      );
    case 'hero-overlay':
    case 'hero-fullbleed':
      return (
        <div className="relative flex h-full items-end rounded-sm bg-zinc-400/50 p-2">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-800/50 to-transparent" />
          <div className="relative space-y-1">
            <div className="h-2 w-24 rounded-sm bg-white/90" />
            <div className="h-1.5 w-16 rounded-sm bg-white/60" />
            <div className={`h-2 w-10 ${accent}`} />
          </div>
        </div>
      );
    case 'hero-minimal':
      return (
        <div className="flex h-full flex-col items-start justify-center gap-2 px-3">
          <div className={`h-2.5 w-2/5 ${bar}`} />
          <div className={`h-2 w-12 ${accent}`} />
        </div>
      );
    case 'hero-card':
      return (
        <div className="relative flex h-full items-center justify-end rounded-sm bg-zinc-300/60 p-2">
          <div className="w-[45%] space-y-1 rounded-md bg-white p-2 shadow-sm">
            <div className={`h-1.5 w-full ${bar}`} />
            <div className={`h-1 w-3/4 ${muted}`} />
            <div className={`h-2 w-full ${accent}`} />
          </div>
        </div>
      );
    case 'intro-center':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5">
          <div className={`h-2 w-1/2 ${bar}`} />
          <div className={`h-1 w-2/3 ${muted}`} />
          <div className={`h-1 w-1/2 ${muted}`} />
        </div>
      );
    case 'intro-left':
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 px-2">
          <div className={`h-2 w-2/5 ${bar}`} />
          <div className={`h-1 w-4/5 ${muted}`} />
          <div className={`h-1 w-3/5 ${muted}`} />
        </div>
      );
    case 'cards-2':
      return <Cards n={2} />;
    case 'cards-3':
      return <Cards n={3} />;
    case 'cards-4':
      return <Cards n={4} />;
    case 'list-editorial':
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 px-2">
          <div className={`mb-1 h-2 w-1/3 ${bar}`} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
              <div className={`h-1.5 flex-1 ${muted}`} />
            </div>
          ))}
        </div>
      );
    case 'list-numbered':
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 px-2">
          <div className={`mb-1 h-2 w-1/3 ${bar}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-zinc-400 text-[7px] text-white">
                {i}
              </div>
              <div className={`h-1.5 flex-1 ${muted}`} />
            </div>
          ))}
        </div>
      );
    case 'alternating':
      return (
        <div className="flex h-full flex-col justify-center gap-1.5">
          <div className="grid grid-cols-2 gap-1">
            <div className="h-6 rounded-sm bg-zinc-300/70" />
            <div className="flex flex-col justify-center gap-1">
              <div className={`h-1.5 w-full ${bar}`} />
              <div className={`h-1 w-3/4 ${muted}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex flex-col justify-center gap-1">
              <div className={`h-1.5 w-full ${bar}`} />
              <div className={`h-1 w-3/4 ${muted}`} />
            </div>
            <div className="h-6 rounded-sm bg-zinc-300/70" />
          </div>
        </div>
      );
    case 'image-left':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="rounded-sm bg-zinc-300/70" />
          <div className="flex flex-col justify-center gap-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1 w-full ${muted}`} />
            <div className={`h-1 w-3/4 ${muted}`} />
          </div>
        </div>
      );
    case 'image-right':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1 w-full ${muted}`} />
            <div className={`h-1 w-3/4 ${muted}`} />
          </div>
          <div className="rounded-sm bg-zinc-300/70" />
        </div>
      );
    case 'gallery-grid':
      return (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-sm bg-zinc-300/70" />
          ))}
        </div>
      );
    case 'gallery-mosaic':
      return (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
          <div className="col-span-2 row-span-2 rounded-sm bg-zinc-300/80" />
          <div className="rounded-sm bg-zinc-300/60" />
          <div className="rounded-sm bg-zinc-300/60" />
        </div>
      );
    case 'pricing-3':
      return (
        <div className="grid h-full grid-cols-3 gap-1 pt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 rounded-sm border p-1 ${i === 1 ? 'border-orange-300 bg-white shadow-sm' : 'border-zinc-200 bg-white/70'}`}
            >
              <div className={`h-1 w-full ${muted}`} />
              <div className={`h-2 w-2/3 ${bar}`} />
              <div className={`mt-auto h-1.5 w-full ${i === 1 ? accent : muted}`} />
            </div>
          ))}
        </div>
      );
    case 'pricing-compare':
      return (
        <div className="flex h-full flex-col gap-1 pt-2">
          <div className={`mx-auto h-2 w-1/3 ${bar}`} />
          <div className="grid flex-1 grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${i % 3 === 1 ? 'bg-orange-100' : 'bg-zinc-200/80'}`} />
            ))}
          </div>
        </div>
      );
    case 'quote':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4">
          <div className="text-lg leading-none text-zinc-400">“</div>
          <div className={`h-1.5 w-4/5 ${muted}`} />
          <div className={`h-1.5 w-3/5 ${muted}`} />
          <div className={`mt-1 h-1 w-16 ${bar}`} />
        </div>
      );
    case 'quotes-cards':
      return <Cards n={3} quote />;
    case 'stats-row':
      return (
        <div className="grid h-full grid-cols-4 gap-1 content-center">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`h-3 w-8 ${bar}`} />
              <div className={`h-1 w-6 ${muted}`} />
            </div>
          ))}
        </div>
      );
    case 'process-steps':
      return (
        <div className="flex h-full items-center gap-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-400 text-[8px] text-white">
                {i}
              </div>
              <div className={`h-1 w-full ${muted}`} />
            </div>
          ))}
        </div>
      );
    case 'faq-list':
      return (
        <div className="flex h-full flex-col justify-center gap-1 px-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-sm bg-white/80 px-1.5 py-1 ring-1 ring-zinc-200">
              <div className={`h-1 w-3/5 ${muted}`} />
              <div className="h-2 w-2 rounded-sm bg-zinc-300" />
            </div>
          ))}
        </div>
      );
    case 'form-card':
      return (
        <div className="mx-auto flex h-full w-[55%] flex-col justify-center gap-1 rounded-md bg-white p-2 shadow-sm ring-1 ring-zinc-200">
          <div className={`mx-auto h-1.5 w-2/3 ${bar}`} />
          <div className={`h-2 w-full ${muted}`} />
          <div className={`h-2 w-full ${muted}`} />
          <div className={`h-2 w-full ${accent}`} />
        </div>
      );
    case 'form-split':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1 w-4/5 ${muted}`} />
          </div>
          <div className="flex flex-col justify-center gap-1 rounded-md bg-white p-1.5 ring-1 ring-zinc-200">
            <div className={`h-2 w-full ${muted}`} />
            <div className={`h-2 w-full ${muted}`} />
            <div className={`h-2 w-full ${accent}`} />
          </div>
        </div>
      );
    case 'cta-banner':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-sm bg-zinc-700/80 px-3">
          <div className="h-2 w-1/2 rounded-sm bg-white/90" />
          <div className="h-1 w-1/3 rounded-sm bg-white/50" />
          <div className={`h-2 w-12 ${accent}`} />
        </div>
      );
    case 'cta-split':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1">
            <div className={`h-2 w-full ${bar}`} />
            <div className={`h-1 w-3/4 ${muted}`} />
          </div>
          <div className="flex items-center justify-center">
            <div className={`h-3 w-16 ${accent}`} />
          </div>
        </div>
      );
    case 'guarantee':
      return (
        <div className="flex h-full items-center gap-2 rounded-sm bg-emerald-50 px-3 ring-1 ring-emerald-100">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
            ✓
          </div>
          <div className="flex-1 space-y-1">
            <div className={`h-1.5 w-2/3 ${bar}`} />
            <div className={`h-1 w-full ${muted}`} />
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="flex h-full items-center justify-center rounded-sm bg-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700">
            ▶
          </div>
        </div>
      );
    case 'countdown':
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className={`h-1.5 w-1/3 ${bar}`} />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-7 w-7 flex-col items-center justify-center rounded-sm bg-zinc-800 text-[8px] text-white">
                00
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div className={`h-full w-full ${muted}`} />;
  }
}

function Cards({ n, quote }: { n: number; quote?: boolean }) {
  return (
    <div className="flex h-full flex-col gap-1.5 pt-1">
      <div className={`mx-auto h-1.5 w-1/3 ${bar}`} />
      <div
        className="grid flex-1 gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(n, 4)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-sm bg-white p-1.5 ring-1 ring-zinc-200">
            {quote ? (
              <>
                <div className={`h-1 w-full ${muted}`} />
                <div className={`h-1 w-4/5 ${muted}`} />
                <div className={`mt-auto h-1 w-1/2 ${bar}`} />
              </>
            ) : (
              <>
                <div className="h-3 w-3 rounded-full bg-zinc-300" />
                <div className={`h-1.5 w-full ${bar}`} />
                <div className={`h-1 w-full ${muted}`} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
