'use client';

/**
 * Version History — uses existing GET versions + POST restore APIs.
 * Restore is append-only (server snapshots current draft before applying).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import type { LandingPageSpec } from '@marketingspa/shared';
import { LandingPageRenderer } from './landing-page-renderer';

type VersionRow = {
  id: string;
  version: number;
  note: string | null;
  createdAt: string;
  kind?: 'published' | 'draft' | 'restore_guard';
  editorName?: string | null;
  editorEmail?: string | null;
  previewHint?: string;
};

type RestoreResult = {
  draftSpec: LandingPageSpec;
  name?: string;
  status?: string;
  restoredFromVersion?: number;
  guardVersion?: number;
};

export function LandingPageVersionHistoryPanel({
  pageId,
  pageStatus,
  onRestored,
}: {
  pageId: string;
  pageStatus?: string;
  onRestored: (page: RestoreResult) => void;
}) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [previewSpec, setPreviewSpec] = useState<LandingPageSpec | null>(null);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<{ versions: VersionRow[] }>(
        `/landing-pages/${pageId}/versions`,
      );
      setVersions(res.versions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được lịch sử');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function preview(version: number) {
    setBusy(version);
    setError(null);
    try {
      const res = await apiClient<{ snapshot: LandingPageSpec; version: number }>(
        `/landing-pages/${pageId}/versions/${version}`,
      );
      setPreviewSpec(res.snapshot);
      setPreviewVersion(res.version);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không mở được preview version');
    } finally {
      setBusy(null);
    }
  }

  async function restore(version: number) {
    const ok = window.confirm(
      `Khôi phục bản v${version} vào nháp?\n\n` +
        `• Bản nháp hiện tại sẽ được lưu thành revision mới (không mất lịch sử)\n` +
        `• Trang Published công khai không đổi cho đến khi bạn Publish lại`,
    );
    if (!ok) return;
    setBusy(version);
    setError(null);
    setMsg(null);
    try {
      const updated = await apiClient<RestoreResult>(
        `/landing-pages/${pageId}/versions/${version}/restore`,
        {
          method: 'POST',
          body: JSON.stringify({ note: `before-restore-v${version}` }),
        },
      );
      onRestored(updated);
      setMsg(
        `Đã restore v${version}` +
          (updated.guardVersion != null ? ` (guard v${updated.guardVersion})` : ''),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore thất bại');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2 border-t border-white/10 pt-3" data-lp-version-history>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase opacity-60">Version History</div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          onClick={() => void load()}
        >
          {loading ? '…' : 'Refresh'}
        </Button>
      </div>
      <p className="text-[10px] opacity-50">
        Trạng thái trang: {pageStatus || '—'} · Restore chỉ đổi nháp, không auto-publish.
      </p>
      {error ? <p className="text-[11px] text-red-300">{error}</p> : null}
      {msg ? <p className="text-[11px] text-emerald-300">{msg}</p> : null}
      <ul className="max-h-48 space-y-1.5 overflow-y-auto text-xs" data-lp-version-list>
        {versions.length === 0 && !loading ? (
          <li className="opacity-50">Chưa có snapshot (Publish / Page Doctor tạo version).</li>
        ) : null}
        {versions.map((v) => {
          const when = v.createdAt
            ? new Date(v.createdAt).toLocaleString('vi-VN', { hour12: false })
            : '—';
          const who = v.editorName || v.editorEmail || '—';
          const kindLabel =
            v.kind === 'published'
              ? 'published'
              : v.kind === 'restore_guard'
                ? 'draft (pre-restore)'
                : 'draft';
          return (
            <li
              key={v.id}
              className="rounded border border-white/10 px-2 py-1.5"
              data-lp-version={v.version}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium">
                    v{v.version}{' '}
                    <span className="font-normal opacity-60">· {kindLabel}</span>
                  </div>
                  <div className="truncate opacity-60">{when}</div>
                  <div className="truncate opacity-60">{who}</div>
                  {v.note ? (
                    <div className="truncate opacity-40" title={v.note}>
                      {v.note}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    disabled={busy === v.version}
                    onClick={() => void preview(v.version)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[10px]"
                    disabled={busy === v.version}
                    onClick={() => void restore(v.version)}
                  >
                    {busy === v.version ? '…' : 'Restore'}
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {previewSpec && previewVersion != null ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-auto bg-black/70 p-4 pt-12"
          data-lp-version-preview-modal
          onClick={() => {
            setPreviewSpec(null);
            setPreviewVersion(null);
          }}
        >
          <div
            className="w-full max-w-3xl rounded-lg border border-white/10 bg-zinc-950 p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Preview version v{previewVersion} (read-only)</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setPreviewSpec(null);
                  setPreviewVersion(null);
                }}
              >
                Đóng
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded border border-white/10 bg-white">
              <LandingPageRenderer spec={previewSpec} mode="public" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LandingPageDraftPreviewPanel({ pageId }: { pageId: string }) {
  const [path, setPath] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient<{
        active: boolean;
        expiresAt: string | null;
        previewPath: string | null;
      }>(`/landing-pages/${pageId}/preview-token`);
      setPath(res.active ? res.previewPath : null);
      setExpiresAt(res.active ? res.expiresAt : null);
    } catch {
      /* ignore */
    }
  }, [pageId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function issue() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient<{
        previewPath: string;
        expiresAt: string;
      }>(`/landing-pages/${pageId}/preview-token`, {
        method: 'POST',
        body: JSON.stringify({ expiresInHours: 72 }),
      });
      setPath(res.previewPath);
      setExpiresAt(res.expiresAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được preview');
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    try {
      await apiClient(`/landing-pages/${pageId}/preview-token/revoke`, {
        method: 'POST',
        body: '{}',
      });
      setPath(null);
      setExpiresAt(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke thất bại');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-white/10 pt-3" data-lp-draft-preview>
      <div className="text-xs font-semibold uppercase opacity-60">Draft Preview URL</div>
      <p className="text-[10px] opacity-50">
        Link đọc-only · hết hạn · noindex · không cần Publish · không ghi analytics.
      </p>
      {error ? <p className="text-[11px] text-red-300">{error}</p> : null}
      {path ? (
        <div className="space-y-1">
          <a
            className="block break-all text-[11px] underline opacity-90"
            href={path}
            target="_blank"
            rel="noreferrer"
            data-lp-preview-link
          >
            {path}
          </a>
          {expiresAt ? (
            <p className="text-[10px] opacity-50">
              Hết hạn: {new Date(expiresAt).toLocaleString('vi-VN', { hour12: false })}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-[10px] opacity-50">Chưa có token preview.</p>
      )}
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          className="h-7 text-[10px]"
          disabled={busy}
          onClick={() => void issue()}
        >
          {path ? 'Tạo lại link' : 'Tạo link preview'}
        </Button>
        {path ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            disabled={busy}
            onClick={() => void revoke()}
          >
            Thu hồi
          </Button>
        ) : null}
      </div>
    </div>
  );
}
