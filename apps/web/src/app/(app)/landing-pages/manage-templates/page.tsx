'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import { useCurrentUser } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { planTemplateBulkUploadBatches } from '@/components/landing-pages/landing-page-template-bulk-upload-client';

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  publishStatus?: 'DRAFT' | 'PUBLISHED';
  hasPublishedVersion?: boolean;
};

type BulkResult = {
  total: number;
  created: number;
  updated: number;
  failed: number;
  results: Array<{ file: string; status: 'created' | 'updated' | 'error'; slug?: string; message?: string }>;
};

async function authedFetch(path: string, init: RequestInit = {}) {
  const token = authStorage.getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const msg = res.status === 413 ? 'Máy chủ từ chối dung lượng upload. ZIP tổng tối đa 256 MiB; hãy tải lại trang và kiểm tra kích thước file.' : Array.isArray(body.message) ? body.message.join('; ') : body.message;
    throw new Error(msg || (res.status === 413 ? 'File upload vượt giới hạn dung lượng. ZIP tổng tối đa 256 MiB, mỗi mẫu riêng tối đa 20 MiB.' : 'Không thực hiện được'));
  }
  return res;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManageTemplatesPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [report, setReport] = useState<BulkResult | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient<{ items: Row[] }>('/landing-pages/templates?includeSystem=true', {
        cache: 'no-store',
      });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách mẫu');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter((i) => `${i.name} ${i.slug} ${i.category}`.toLowerCase().includes(k));
  }, [items, q]);

  async function downloadAll() {
    setBusy('all');
    setError(null);
    setNotice(null);
    try {
      const res = await authedFetch('/landing-pages/templates/packs/export-all');
      const cd = res.headers.get('content-disposition') || '';
      const name = /filename="?([^";]+)"?/.exec(cd)?.[1] || 'all-landing-templates.zip';
      saveBlob(await res.blob(), name);
      setNotice(`Đã tải ${items.length} mẫu (file ZIP tổng).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được');
    } finally {
      setBusy(null);
    }
  }

  async function downloadOne(slug: string) {
    setBusy(`d:${slug}`);
    setError(null);
    try {
      const res = await authedFetch(`/landing-pages/templates/${encodeURIComponent(slug)}/pack`);
      saveBlob(await res.blob(), `${slug}-template.zip`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được mẫu');
    } finally {
      setBusy(null);
    }
  }

  async function uploadBulk(files: FileList | null) {
    if (!files?.length) return;
    setBusy('bulk');
    setError(null);
    setNotice(null);
    setReport(null);
    try {
      const batches = planTemplateBulkUploadBatches(Array.from(files));
      const data: BulkResult = { total: 0, created: 0, updated: 0, failed: 0, results: [] };
      for (let i = 0; i < batches.length; i++) {
        if (batches.length > 1) setNotice(`Đang upload đợt ${i + 1}/${batches.length}…`);
        const body = new FormData();
        batches[i]!.forEach((f) => body.append('files', f, f.name));
        const res = await authedFetch('/landing-pages/templates/packs/bulk', { method: 'POST', body });
        const part = (await res.json()) as BulkResult;
        data.total += part.total; data.created += part.created; data.updated += part.updated;
        data.failed += part.failed; data.results.push(...part.results);
        setReport({ ...data, results: [...data.results] });
      }
      if (data.failed && data.created + data.updated === 0) {
        setError(`Chưa nhập được mẫu nào: ${data.failed} lỗi. Xem chi tiết bên dưới.`);
      } else {
        setNotice(`${data.failed ? 'Đã nhập một phần' : 'Hoàn tất'}: ${data.created} tạo mới, ${data.updated} cập nhật, ${data.failed} lỗi.`);
      }
      await load();
    } catch (e) {
      setNotice(null);
      setError(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function publishOne(slug: string) {
    setBusy(`p:${slug}`);
    setError(null);
    try {
      await authedFetch(`/landing-pages/templates/${encodeURIComponent(slug)}/publish`, { method: 'POST' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xuất bản được');
    } finally {
      setBusy(null);
    }
  }

  async function editSource(slug: string) {
    setBusy(`e:${slug}`);
    setError(null);
    try {
      const s = await apiClient<{ pageId: string }>(
        `/landing-pages/templates/${encodeURIComponent(slug)}/edit-session`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      router.push(`/landing-pages/builder/${s.pageId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không mở được mẫu');
      setBusy(null);
    }
  }

  if (isLoading) return <p className="p-6 text-sm text-white/70">Đang tải…</p>;
  if (!isAdmin) {
    return <p className="p-6 text-sm text-white/70">Chỉ quản trị hệ thống mới dùng được trang này.</p>;
  }

  const drafts = items.filter((i) => i.publishStatus === 'DRAFT').length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Templates"
        description="Tải toàn bộ mẫu, upload hàng loạt để thêm mới hoặc cập nhật, sửa trực tiếp mẫu gốc."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 p-3">
        <Button onClick={() => void downloadAll()} disabled={busy !== null || items.length === 0}>
          {busy === 'all' ? 'Đang đóng gói…' : `Tải tất cả mẫu (${items.length})`}
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy !== null}>
          {busy === 'bulk' ? 'Đang upload…' : 'Upload hàng loạt'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".zip,.html,.htm"
          className="hidden"
          onChange={(e) => void uploadBulk(e.target.files)}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, slug, ngành…"
          className="ml-auto h-9 w-64 rounded-md border border-white/15 bg-transparent px-3 text-sm"
        />
      </div>
      <p className="text-xs text-white/60">
        Upload nhận nhiều file .zip hoặc .html cùng lúc, hoặc ZIP tổng chứa các gói ZIP/thư mục mẫu đã giải nén. ZIP tổng tối đa 256 MiB, mỗi mẫu riêng tối đa 20 MiB. Slug đã có thì cập nhật
        (và xuất bản ngay), slug mới thì tạo ở dạng nháp. Trang khách đã tạo từ mẫu không bị ảnh hưởng. Mỗi lần ghi đều
        lưu bản cũ vào lịch sử phiên bản.
        {drafts ? ` Hiện có ${drafts} mẫu đang ở dạng nháp.` : ''}
      </p>

      {error ? <p className="rounded-md bg-red-500/15 p-2 text-sm text-red-200">{error}</p> : null}
      {notice ? <p className="rounded-md bg-emerald-500/15 p-2 text-sm text-emerald-100">{notice}</p> : null}

      {report ? (
        <div className="max-h-64 overflow-auto rounded-lg border border-white/10 text-xs">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-900 text-left">
              <tr>
                <th className="p-2">File</th>
                <th className="p-2">Kết quả</th>
                <th className="p-2">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r, i) => (
                <tr key={`${r.file}-${i}`} className="border-t border-white/10">
                  <td className="p-2">{r.file}</td>
                  <td className="p-2">
                    {r.status === 'created' ? 'Tạo mới (nháp)' : r.status === 'updated' ? 'Đã cập nhật' : 'Lỗi'}
                  </td>
                  <td className="p-2">{r.status === 'error' ? r.message : r.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="overflow-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60">
            <tr>
              <th className="p-2">Tên</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Ngành</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <td className="p-2">{t.name}</td>
                <td className="p-2 font-mono text-xs">{t.slug}</td>
                <td className="p-2">{t.category}</td>
                <td className="p-2">
                  {t.publishStatus === 'DRAFT' ? 'Nháp' : 'Đã xuất bản'}
                  {t.tags.includes('pack:managed') ? ' · đã chỉnh tay' : ''}
                </td>
                <td className="space-x-1 p-2 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void editSource(t.slug)}>
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void downloadOne(t.slug)}>
                    Tải
                  </Button>
                  {t.publishStatus === 'DRAFT' ? (
                    <Button size="sm" disabled={busy !== null} onClick={() => void publishOne(t.slug)}>
                      Xuất bản
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-white/60">
                  Không có mẫu nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
