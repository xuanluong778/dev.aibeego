'use client';

/**
 * Compact AI topbar menu for Landing Page Builder (additive).
 * Preview-before-apply; never auto-publish; Apply goes through caller pushHistory/undo.
 */

import { useEffect, useRef, useState } from 'react';
import {
  applyLandingPageAiCopyToSpec,
  markLandingPageAiSources,
  type LandingPageAiCopy,
  type LandingPageBlock,
  type LandingPageBlockType,
  type LandingPageSpec,
} from '@marketingspa/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type PageGoal = 'lead' | 'sales' | 'signup' | 'consult' | 'event';
type Tone = 'professional' | 'bold' | 'friendly';

type RewriteField = {
  field: string;
  label: string;
  fieldKind: string;
  current: string;
  options: string[];
  selected: string | null;
};

const PAGE_GOALS: { value: PageGoal; label: string }[] = [
  { value: 'lead', label: 'Thu lead' },
  { value: 'sales', label: 'Bán hàng' },
  { value: 'signup', label: 'Đăng ký' },
  { value: 'consult', label: 'Tư vấn' },
  { value: 'event', label: 'Sự kiện' },
];

const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Chuyên nghiệp' },
  { value: 'bold', label: 'Mạnh / bold' },
  { value: 'friendly', label: 'Thân thiện' },
];

function rewriteTargets(block: LandingPageBlock): Array<{ field: string; label: string; fieldKind: string }> {
  const t = block.type;
  if (t === 'Hero') {
    return [
      { field: 'headline', label: 'Headline', fieldKind: 'headline' },
      { field: 'subheadline', label: 'Subheadline', fieldKind: 'subheadline' },
      { field: 'ctaLabel', label: 'CTA', fieldKind: 'ctaLabel' },
    ];
  }
  if (t === 'Benefits' || t === 'Features') {
    return [
      { field: 'headline', label: 'Tiêu đề', fieldKind: 'headline' },
      { field: 'subheadline', label: 'Mô tả', fieldKind: 'subheadline' },
    ];
  }
  if (t === 'Pricing') {
    return [
      { field: 'headline', label: 'Tiêu đề gói', fieldKind: 'headline' },
      { field: 'subheadline', label: 'Mô tả gói', fieldKind: 'plan.subheadline' },
    ];
  }
  if (t === 'FAQ') {
    return [{ field: 'headline', label: 'Tiêu đề FAQ', fieldKind: 'headline' }];
  }
  if (t === 'CTA') {
    return [
      { field: 'headline', label: 'Headline CTA', fieldKind: 'headline' },
      { field: 'ctaLabel', label: 'Nút CTA', fieldKind: 'ctaLabel' },
    ];
  }
  if (t === 'Guarantee' || t === 'Footer' || t === 'Product' || t === 'LeadForm') {
    return [
      { field: 'headline', label: 'Headline', fieldKind: 'headline' },
      ...(t === 'Guarantee' || t === 'Footer'
        ? [{ field: 'body', label: 'Nội dung', fieldKind: 'body' }]
        : []),
      ...('ctaLabel' in block ? [{ field: 'ctaLabel', label: 'CTA', fieldKind: 'ctaLabel' }] : []),
    ];
  }
  return [{ field: 'headline', label: 'Headline', fieldKind: 'headline' }];
}

export type LandingPageAiMenuProps = {
  pageId: string;
  pageName: string;
  spec: LandingPageSpec;
  selectedBlock: LandingPageBlock | null;
  doctorBusy?: boolean;
  disabled?: boolean;
  /** sidebar = compact control on left LP rail; meta = legacy row (unused). */
  placement?: 'sidebar' | 'meta';
  onApplySpec: (next: LandingPageSpec, note: string) => void;
  onApplyBlockFields: (
    blockId: string,
    patch: Record<string, string>,
    note: string,
  ) => void;
  onOpenSectionPresets: () => void;
  onPageDoctor: () => void;
};

export function LandingPageAiMenu({
  pageId,
  pageName,
  spec,
  selectedBlock,
  doctorBusy,
  disabled,
  placement = 'sidebar',
  onApplySpec,
  onApplyBlockFields,
  onOpenSectionPresets,
  onPageDoctor,
}: LandingPageAiMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [productService, setProductService] = useState(pageName || '');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [pageGoal, setPageGoal] = useState<PageGoal>('lead');
  const [ctaHint, setCtaHint] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [previewCopy, setPreviewCopy] = useState<LandingPageAiCopy | null>(null);
  const [previewSource, setPreviewSource] = useState<string>('');

  const [rewriteBusy, setRewriteBusy] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteFields, setRewriteFields] = useState<RewriteField[]>([]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown, true);
    return () => window.removeEventListener('mousedown', onDown, true);
  }, [menuOpen]);

  async function runGeneratePreview() {
    if (!productService.trim() || !targetCustomer.trim()) {
      setGenError('Nhập sản phẩm/dịch vụ và khách hàng mục tiêu');
      return;
    }
    setGenBusy(true);
    setGenError(null);
    setPreviewCopy(null);
    try {
      // Preview only — omit landingPageId so draft is NOT overwritten on server.
      const res = await apiClient<{
        copy: LandingPageAiCopy;
        source: string;
        warning?: string;
        page?: unknown;
      }>('/landing-pages/generate', {
        method: 'POST',
        body: JSON.stringify({
          productService: productService.trim(),
          targetCustomer: targetCustomer.trim(),
          pageGoal,
          tone,
          extraNotes: ctaHint.trim()
            ? `CTA mong muốn: ${ctaHint.trim()}`
            : undefined,
          uspBenefits: ctaHint.trim() || undefined,
          useBusinessProfile: true,
          // Explicitly no landingPageId / no publish
        }),
      });
      if (res.page) {
        // Safety: never accept server page mutation on preview path
        setGenError('Preview trả page — huỷ Apply. Thử lại.');
        return;
      }
      setPreviewCopy(res.copy);
      setPreviewSource(res.warning || res.source);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generate thất bại');
    } finally {
      setGenBusy(false);
    }
  }

  function applyGeneratePreview() {
    if (!previewCopy) return;
    const next = markLandingPageAiSources(applyLandingPageAiCopyToSpec(spec, previewCopy));
    onApplySpec(next, 'Đã Apply AI Generate — Undo được; chưa Publish');
    setGenOpen(false);
    setPreviewCopy(null);
    setMenuOpen(false);
  }

  async function runRewriteSelected() {
    if (!selectedBlock) {
      setRewriteError('Chọn một block trên canvas trước');
      return;
    }
    // Testimonials: never invent fake quotes / metrics via bulk rewrite.
    if (selectedBlock.type === 'Testimonials') {
      setRewriteError('Testimonials: chỉ placeholder — dùng AI từng field, không bịa review/số liệu.');
      return;
    }
    setRewriteBusy(true);
    setRewriteError(null);
    setRewriteFields([]);
    const targets = rewriteTargets(selectedBlock);
    const blockType = selectedBlock.type as LandingPageBlockType;
    const rec = selectedBlock as unknown as Record<string, unknown>;
    try {
      const rows: RewriteField[] = [];
      for (const t of targets) {
        const current = typeof rec[t.field] === 'string' ? String(rec[t.field]) : '';
        if (!current.trim()) continue;
        const res = await apiClient<{ options: [string, string, string]; source: string }>(
          `/landing-pages/${pageId}/ai-suggest-field`,
          {
            method: 'POST',
            body: JSON.stringify({
              action: 'rewrite',
              fieldKind: t.fieldKind,
              blockType,
              currentContent: current,
              pageGoal,
              blockContext: `type=${blockType}`,
            }),
          },
        );
        rows.push({
          field: t.field,
          label: t.label,
          fieldKind: t.fieldKind,
          current,
          options: res.options || [],
          selected: res.options?.[0] || null,
        });
      }
      if (!rows.length) {
        setRewriteError('Block chưa có nội dung để viết lại — điền headline trước.');
      }
      setRewriteFields(rows);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.statusCode === 429
          ? 'Quá nhiều yêu cầu — đợi rồi thử lại. Draft không đổi.'
          : e instanceof Error
            ? e.message
            : 'Rewrite thất bại';
      setRewriteError(msg);
    } finally {
      setRewriteBusy(false);
    }
  }

  function applyRewrite() {
    if (!selectedBlock || !rewriteFields.length) return;
    const patch: Record<string, string> = {};
    for (const row of rewriteFields) {
      if (row.selected && row.selected.trim()) patch[row.field] = row.selected.trim();
    }
    if (!Object.keys(patch).length) {
      setRewriteError('Chọn ít nhất 1 gợi ý');
      return;
    }
    onApplyBlockFields(selectedBlock.id, patch, 'Đã viết lại block — Undo được');
    setRewriteOpen(false);
    setRewriteFields([]);
    setMenuOpen(false);
  }

  const sidebar = placement === 'sidebar';

  return (
    <div
      ref={rootRef}
      className={sidebar ? 'relative flex w-full justify-center' : 'relative'}
      data-lp-ai-menu
      data-lp-ai-menu-placement={placement}
    >
      <Button
        size="sm"
        variant="outline"
        className={
          sidebar
            ? 'h-9 w-[3.25rem] shrink-0 gap-0.5 rounded-lg border-[#0A3D30]/40 bg-[#0A3D30] px-1.5 text-[11px] font-bold text-white hover:bg-[#0c4a3a] hover:text-white sm:w-14'
            : 'border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white'
        }
        disabled={disabled}
        data-lp-ai-menu-trigger
        title="AI"
        aria-label="AI"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span aria-hidden className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-[12px] text-transparent">
          ✦
        </span>
        AI
      </Button>
      {menuOpen ? (
        <div
          className={
            sidebar
              ? 'absolute left-full top-0 z-50 ml-2 min-w-[220px] rounded-lg border border-white/15 bg-zinc-950 py-1 shadow-xl'
              : 'absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-lg border border-white/15 bg-zinc-950 py-1 shadow-xl'
          }
          data-lp-ai-menu-panel
          role="menu"
        >
          <MenuItem
            label="Tạo Landing Page bằng AI"
            onClick={() => {
              setMenuOpen(false);
              setGenOpen(true);
              setPreviewCopy(null);
              setGenError(null);
              setProductService(pageName || productService);
            }}
          />
          <MenuItem
            label="Tạo thêm Section"
            onClick={() => {
              setMenuOpen(false);
              onOpenSectionPresets();
            }}
          />
          <MenuItem
            label="Viết lại block đang chọn"
            disabled={!selectedBlock}
            onClick={() => {
              setMenuOpen(false);
              setRewriteOpen(true);
              setRewriteFields([]);
              setRewriteError(null);
              void runRewriteSelected();
            }}
          />
          <MenuItem
            label={doctorBusy ? 'Đang tối ưu…' : 'AI tối ưu trang'}
            disabled={!!doctorBusy}
            onClick={() => {
              setMenuOpen(false);
              onPageDoctor();
            }}
          />
        </div>
      ) : null}

      {genOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto bg-black/70 p-4 pt-16"
          data-lp-ai-generate-modal
        >
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-zinc-950 p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Tạo Landing Page bằng AI</div>
                <p className="text-xs opacity-60">
                  Preview trước — không Publish, không ghi đè tới khi Apply.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setGenOpen(false)}>
                Đóng
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Sản phẩm / dịch vụ</Label>
                <Input
                  className="mt-1"
                  value={productService}
                  onChange={(e) => setProductService(e.target.value)}
                  disabled={genBusy}
                />
              </div>
              <div>
                <Label className="text-xs">Khách hàng mục tiêu</Label>
                <Input
                  className="mt-1"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  disabled={genBusy}
                />
              </div>
              <div>
                <Label className="text-xs">Mục tiêu trang</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {PAGE_GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      disabled={genBusy}
                      onClick={() => setPageGoal(g.value)}
                      className={`rounded border px-2 py-1 text-xs ${
                        pageGoal === g.value
                          ? 'border-orange-400/50 bg-orange-500/15'
                          : 'border-white/10'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">CTA mong muốn (tuỳ chọn)</Label>
                <Input
                  className="mt-1"
                  placeholder="VD: Đăng ký tư vấn miễn phí"
                  value={ctaHint}
                  onChange={(e) => setCtaHint(e.target.value)}
                  disabled={genBusy}
                />
              </div>
              <div>
                <Label className="text-xs">Tone</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {TONES.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      disabled={genBusy}
                      onClick={() => setTone(g.value)}
                      className={`rounded border px-2 py-1 text-xs ${
                        tone === g.value
                          ? 'border-sky-400/50 bg-sky-500/15'
                          : 'border-white/10'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              {genError ? (
                <p className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-100">
                  {genError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={genBusy} onClick={() => void runGeneratePreview()}>
                  {genBusy ? 'Đang tạo preview…' : 'Xem trước'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={genBusy || !previewCopy}
                  data-lp-ai-generate-apply
                  onClick={applyGeneratePreview}
                >
                  Apply vào draft
                </Button>
              </div>
              {previewCopy ? (
                <div
                  className="max-h-56 space-y-2 overflow-auto rounded border border-white/10 p-3 text-xs"
                  data-lp-ai-generate-preview
                >
                  <div className="opacity-50">Nguồn: {previewSource || 'ai'} · chưa ghi đè draft</div>
                  <div>
                    <span className="opacity-50">Headline:</span> {previewCopy.headline}
                  </div>
                  <div>
                    <span className="opacity-50">Sub:</span> {previewCopy.subheadline}
                  </div>
                  <div>
                    <span className="opacity-50">CTA:</span> {previewCopy.cta}
                  </div>
                  {previewCopy.benefits?.length ? (
                    <ul className="list-disc pl-4 opacity-90">
                      {previewCopy.benefits.slice(0, 4).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {rewriteOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto bg-black/70 p-4 pt-16"
          data-lp-ai-rewrite-modal
        >
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-zinc-950 p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Viết lại block đang chọn</div>
                <p className="text-xs opacity-60">
                  {selectedBlock
                    ? `${selectedBlock.type} · chọn option rồi Apply · không bịa testimonial/số liệu`
                    : 'Chưa chọn block'}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setRewriteOpen(false)}>
                Đóng
              </Button>
            </div>
            {rewriteError ? (
              <p className="mb-2 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs">
                {rewriteError}
              </p>
            ) : null}
            {rewriteBusy ? <p className="text-sm opacity-70">Đang gợi ý…</p> : null}
            <div className="max-h-72 space-y-3 overflow-auto">
              {rewriteFields.map((row) => (
                <div key={row.field} className="rounded border border-white/10 p-2 text-xs">
                  <div className="mb-1 font-medium">{row.label}</div>
                  <div className="mb-1 truncate opacity-50">Hiện tại: {row.current}</div>
                  <div className="space-y-1">
                    {row.options.map((opt) => (
                      <label key={opt} className="flex cursor-pointer gap-2 rounded border border-white/5 p-1.5">
                        <input
                          type="radio"
                          name={`rw-${row.field}`}
                          checked={row.selected === opt}
                          onChange={() =>
                            setRewriteFields((list) =>
                              list.map((r) => (r.field === row.field ? { ...r, selected: opt } : r)),
                            )
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={rewriteBusy || !rewriteFields.length}
                data-lp-ai-rewrite-apply
                onClick={applyRewrite}
              >
                Apply đã chọn
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={rewriteBusy || !selectedBlock}
                onClick={() => void runRewriteSelected()}
              >
                Chạy lại
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}
