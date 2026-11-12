'use client';

import { useEffect } from 'react';
import { LP_COUNTDOWN_PRESETS, type LandingPageCountdownLaunchStyle } from '@marketingspa/shared';

const COUNTDOWN_FONTS =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';

export function LandingPageCountdownLibrary({
  onSelect,
}: {
  onSelect: (id: LandingPageCountdownLaunchStyle) => void;
}) {
  useEffect(() => {
    if (document.getElementById('lp-countdown-fonts')) return;
    const link = document.createElement('link');
    link.id = 'lp-countdown-fonts';
    link.rel = 'stylesheet';
    link.href = COUNTDOWN_FONTS;
    document.head.appendChild(link);
  }, []);

  return (
    <div
      className="min-h-0 flex-1 overflow-auto bg-[#07060b] p-5 sm:p-6"
      style={{ fontFamily: '"Be Vietnam Pro", "Plus Jakarta Sans", "Segoe UI", sans-serif' }}
      data-lp-countdown-library="1"
    >
      <p className="mb-4 text-sm text-zinc-400">
        Chọn một bộ hẹn giờ — mẫu sẽ được chèn vào landing page và vẫn chỉnh sửa được.
      </p>
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        data-lp-countdown-library-grid="1"
        data-lp-countdown-library-count={LP_COUNTDOWN_PRESETS.length}
      >
        {LP_COUNTDOWN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            data-lp-countdown-template={preset.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-[#120f18] text-left shadow-[0_16px_40px_rgba(0,0,0,.35)] transition hover:border-white/25 hover:shadow-[0_18px_48px_rgba(0,0,0,.5)]"
            onClick={() => onSelect(preset.id)}
          >
            <span className="block aspect-[2/1] overflow-hidden bg-black">
              <img
                src={preset.thumb}
                alt={preset.label}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </span>
            <span className="block px-4 py-3">
              <strong className="block text-sm font-semibold tracking-tight text-zinc-50">{preset.label}</strong>
              <span className="mt-0.5 block text-xs text-zinc-400">{preset.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
