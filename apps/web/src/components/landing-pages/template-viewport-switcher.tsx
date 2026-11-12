'use client';

export type TemplateViewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: TemplateViewport[] = ['desktop', 'tablet', 'mobile'];

const LABEL: Record<TemplateViewport, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

function DeviceIcon({ kind }: { kind: TemplateViewport }) {
  const common = 'pointer-events-none shrink-0 stroke-current';
  if (kind === 'desktop') {
    return (
      <svg viewBox="0 0 24 24" className={`${common} h-4 w-4`} fill="none" aria-hidden>
        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.75" />
        <path d="M8 21h8" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 17v4" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'tablet') {
    return (
      <svg viewBox="0 0 24 24" className={`${common} h-[18px] w-[18px]`} fill="none" aria-hidden>
        <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="1.75" />
        <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`${common} h-3.5 w-3.5`} fill="none" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.75" />
      <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  viewport: TemplateViewport;
  onChange: (v: TemplateViewport) => void;
};

/** Icon-only device switcher for template gallery preview modal. */
export function TemplateViewportSwitcher({ viewport, onChange }: Props) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      data-lp-template-viewport-switcher
      data-lp-template-viewport-ui="inline-svg-v2"
    >
      {VIEWPORTS.map((v) => {
        const active = viewport === v;
        return (
          <button
            key={v}
            type="button"
            title={LABEL[v]}
            aria-label={LABEL[v]}
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white transition ' +
              'hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 ' +
              (active ? 'bg-orange-500 text-white shadow-sm' : 'bg-white/10 text-white/85')
            }
          >
            <DeviceIcon kind={v} />
          </button>
        );
      })}
    </div>
  );
}
