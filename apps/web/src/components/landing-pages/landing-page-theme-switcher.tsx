'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { LandingPageSpec } from '@marketingspa/shared';
import {
  LANDING_PAGE_QUICK_THEME_PRESETS,
  applyQuickThemeToSpecTokens,
  isLandingPageQuickThemeId,
  normalizeLandingPageThemeTokens,
  type LandingPageQuickThemeId,
  type LandingPageThemeTokenSet,
} from '@marketingspa/shared';

type Snapshot = {
  theme: LandingPageSpec['theme'];
  themeTokens: LandingPageThemeTokenSet;
  themePreset?: string;
};

type Props = {
  spec: LandingPageSpec;
  /** Instant apply into builder draft (triggers autosave via dirty). */
  onChange: (next: LandingPageSpec) => void;
  aiSuggested?: LandingPageQuickThemeId | null;
};

export function LandingPageThemeSwitcher({ spec, onChange, aiSuggested }: Props) {
  const currentId = (spec.meta?.themePreset as string) || 'light';
  const [selected, setSelected] = useState<LandingPageQuickThemeId>(
    isLandingPageQuickThemeId(currentId) ? currentId : 'custom',
  );
  const [customDraft, setCustomDraft] = useState<LandingPageThemeTokenSet>(() =>
    normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme),
  );
  const undoStack = useRef<Snapshot[]>([]);
  const resetBaseline = useRef<Snapshot>({
    theme: spec.theme,
    themeTokens: normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme),
    themePreset: spec.meta?.themePreset,
  });

  const activeId = useMemo(() => {
    if (isLandingPageQuickThemeId(spec.meta?.themePreset)) return spec.meta!.themePreset as LandingPageQuickThemeId;
    return selected === 'custom' ? 'custom' : selected;
  }, [spec.meta?.themePreset, selected]);

  function pushUndo() {
    undoStack.current.push({
      theme: spec.theme,
      themeTokens: normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme),
      themePreset: spec.meta?.themePreset,
    });
    if (undoStack.current.length > 20) undoStack.current.shift();
  }

  function applyPreset(id: LandingPageQuickThemeId, overrides?: Partial<LandingPageThemeTokenSet>) {
    pushUndo();
    const applied = applyQuickThemeToSpecTokens(id, overrides);
    setSelected(id);
    if (id === 'custom') {
      setCustomDraft(applied.themeTokens);
    }
    onChange({
      ...spec,
      theme: applied.theme,
      themeTokens: applied.themeTokens,
      meta: {
        ...spec.meta,
        themePreset: applied.themePreset,
        themeUserLocked: true,
      },
    });
  }

  function applyCustom() {
    applyPreset('custom', customDraft);
  }

  function undo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    const id = isLandingPageQuickThemeId(prev.themePreset) ? prev.themePreset : 'custom';
    setSelected(id);
    setCustomDraft(normalizeLandingPageThemeTokens(prev.themeTokens, prev.theme));
    onChange({
      ...spec,
      theme: prev.theme,
      themeTokens: prev.themeTokens,
      meta: {
        ...spec.meta,
        themePreset: prev.themePreset,
        themeUserLocked: true,
      },
    });
  }

  function reset() {
    pushUndo();
    const base = resetBaseline.current;
    const id = isLandingPageQuickThemeId(base.themePreset) ? base.themePreset : 'light';
    const applied =
      id === 'custom'
        ? {
            theme: base.theme,
            themeTokens: base.themeTokens,
            themePreset: 'custom' as const,
          }
        : applyQuickThemeToSpecTokens(id);
    setSelected(isLandingPageQuickThemeId(applied.themePreset) ? applied.themePreset : 'light');
    onChange({
      ...spec,
      theme: applied.theme,
      themeTokens: applied.themeTokens,
      meta: {
        ...spec.meta,
        themePreset: applied.themePreset,
        themeUserLocked: true,
      },
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-white/10 p-2" data-lp-theme-switcher>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide opacity-60">Quick Theme</div>
        {aiSuggested ? (
          <button
            type="button"
            className="text-[10px] font-medium text-amber-300/90 underline-offset-2 hover:underline"
            onClick={() => applyPreset(aiSuggested)}
            title="Áp dụng theme AI đề xuất — bạn vẫn đổi được sau"
          >
            AI: {aiSuggested}
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {LANDING_PAGE_QUICK_THEME_PRESETS.map((p) => {
          const active = activeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              title={`${p.label} — ${p.description}`}
              onClick={() => {
                if (p.id === 'custom') {
                  setSelected('custom');
                  setCustomDraft(normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme));
                  return;
                }
                applyPreset(p.id);
              }}
              className={`rounded-md border p-1.5 text-left transition ${
                active ? 'border-white/50 ring-1 ring-white/30' : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="mb-1 flex h-5 overflow-hidden rounded-sm">
                {p.swatch.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <div className="truncate text-[9px] font-semibold leading-tight">{p.label}</div>
            </button>
          );
        })}
      </div>

      {selected === 'custom' || activeId === 'custom' ? (
        <div className="space-y-2 rounded border border-white/10 bg-black/20 p-2">
          <div className="text-[10px] font-semibold uppercase opacity-60">Custom tokens</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['primary', 'Primary'],
                ['accent', 'Accent'],
                ['background', 'Background'],
                ['text', 'Text'],
                ['button', 'Button'],
                ['surface', 'Surface'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-[10px]">
                <span className="mb-0.5 block opacity-60">{label}</span>
                <Input
                  type="color"
                  className="h-8 w-full cursor-pointer p-0.5"
                  value={customDraft[key] || '#000000'}
                  onChange={(e) => setCustomDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <label className="block text-[10px]">
            <span className="mb-0.5 block opacity-60">Radius</span>
            <Input
              value={customDraft.radius || '12px'}
              onChange={(e) => setCustomDraft((d) => ({ ...d, radius: e.target.value }))}
            />
          </label>
          <Button size="sm" className="w-full" onClick={applyCustom}>
            Apply Custom
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={applyCustom} disabled={selected !== 'custom' && activeId !== 'custom'}>
          Apply
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={undo}>
          Undo
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={reset}>
          Reset
        </Button>
      </div>
      <p className="text-[10px] leading-snug opacity-50">
        Đổi theme ngay — không mất nội dung. Autosave giữ theme khi reload.
      </p>
    </div>
  );
}
