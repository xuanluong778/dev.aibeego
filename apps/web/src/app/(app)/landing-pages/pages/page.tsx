'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MoreVertical,
  Plus,
  ExternalLink,
  Edit3,
  Copy,
  EyeOff,
  Archive,
  LayoutTemplate,
  AlertCircle,
  FileText,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { apiClient } from '@/lib/api-client';
import { revalidatePublicLandingPage } from '@/components/landing-pages/revalidate-public-landing-page';
import { formatLandingPageDisplayName } from '@/components/landing-pages/landing-page-name-translator';
import { useT } from '@/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type PageRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme: string;
  updatedAt: string;
  publicPath: string;
  ogImage?: string | null;
  visits?: number | null;
  leads?: number | null;
  conversionRate?: number | null;
};

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

const FILTERS: StatusFilter[] = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

function normalizeStatus(raw: string | null): StatusFilter {
  const v = (raw || '').toUpperCase();
  if (v === 'PUBLISHED' || v === 'DRAFT' || v === 'ARCHIVED' || v === 'ALL') return v;
  return 'ALL';
}

function formatPageDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { datePart: '—', timePart: '' };
    const datePart = new Intl.DateTimeFormat('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const timePart = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return { datePart, timePart };
  } catch {
    return { datePart: '—', timePart: '' };
  }
}

function PageThumbnail({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/30 shadow-sm"
        title={alt}
      >
        <LayoutTemplate className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/30 shadow-sm">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-top transition-transform duration-200 hover:scale-105"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function LandingPagesListInner() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useMemo(
    () => normalizeStatus(searchParams.get('status')),
    [searchParams],
  );
  const [items, setItems] = useState<PageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q =
        status === 'ALL'
          ? '/landing-pages'
          : `/landing-pages?status=${encodeURIComponent(status)}`;
      const res = await apiClient<{ items: PageRow[] }>(q);
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setSelectedIds([]);
    void reload();
  }, [reload, status]);

  async function act(id: string, action: 'duplicate' | 'archive' | 'unpublish' | 'delete') {
    const row = items.find((item) => item.id === id);
    const displayName = formatLandingPageDisplayName(row?.name);

    if (action === 'delete') {
      const ok = window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn landing page "${displayName}"? Thao tác này không thể hoàn tác.`,
      );
      if (!ok) return;
    }

    setBusyActionId(id);
    try {
      if (action === 'delete') {
        await apiClient(`/landing-pages/${id}`, { method: 'DELETE' });
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        await apiClient(`/landing-pages/${id}/${action}`, { method: 'POST', body: '{}' });
      }
      await reload();
      if ((action === 'unpublish' || action === 'delete') && row?.slug) {
        const fresh = await revalidatePublicLandingPage(row.slug);
        if (!fresh && action === 'unpublish') {
          setError('Đã gỡ publish. Cache trang công khai chưa làm mới — tải lại sau ít phút');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Thao tác không thành công');
    } finally {
      setBusyActionId(null);
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const ok = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn ${count} landing page đã chọn? Thao tác này không thể hoàn tác.`,
    );
    if (!ok) return;

    setIsDeletingBulk(true);
    setError(null);
    try {
      await apiClient('/landing-pages/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      await reload();
    } catch {
      // Fallback: delete sequentially if bulk endpoint fails
      try {
        await Promise.all(
          selectedIds.map((id) => apiClient(`/landing-pages/${id}`, { method: 'DELETE' })),
        );
        setSelectedIds([]);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xóa thất bại');
      }
    } finally {
      setIsDeletingBulk(false);
    }
  }

  function setFilter(next: StatusFilter) {
    const url =
      next === 'ALL' ? '/landing-pages/pages' : `/landing-pages/pages?status=${next}`;
    router.push(url);
  }

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(items.map((it) => it.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  }

  const filterLabel = (f: StatusFilter) => {
    if (f === 'ALL') return 'Tất cả';
    if (f === 'PUBLISHED') return 'Đã xuất bản';
    if (f === 'DRAFT') return 'Bản nháp';
    return 'Đã lưu trữ';
  };

  return (
    <div className="space-y-6">
      {/* Header — Vietnamese title without English description */}
      <PageHeader title={t('landingPages.myPages')} />

      {/* Sticky/Fixed Action bar: Stays fixed below header on scroll */}
      <div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-[#0A3D30]/95 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all">
        <div
          className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#093228]/90 p-1 backdrop-blur-sm"
          data-lp-pages-status-filters
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              data-lp-pages-status={f}
              data-active={status === f ? '1' : '0'}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                status === f
                  ? 'bg-[#F97316] text-white shadow-sm font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              {filterLabel(f)}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/20" />

          {/* Nút Xóa nằm cạnh nút Đã lưu trữ */}
          <button
            type="button"
            onClick={() => void deleteSelected()}
            disabled={selectedIds.length === 0 || isDeletingBulk}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
              selectedIds.length > 0
                ? 'bg-red-500/25 text-red-200 hover:bg-red-500/40 hover:text-white border border-red-500/40 cursor-pointer font-semibold shadow-sm'
                : 'text-white/40 hover:text-white/60 cursor-not-allowed opacity-60',
            )}
            title={
              selectedIds.length > 0
                ? `Xóa ${selectedIds.length} trang đã chọn`
                : 'Tích chọn các ô vuông để xóa'
            }
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            <span>Xóa{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
          </button>
        </div>

        <Button
          asChild
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-md transition-all duration-150 rounded-lg px-4"
        >
          <Link href="/landing-pages/create" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Tạo landing page</span>
          </Link>
        </Button>
      </div>

      {/* Error state */}
      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="flex items-center gap-1 text-xs font-semibold underline hover:text-red-200"
          >
            <RotateCw className="h-3 w-3" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : null}

      {/* Loading state skeleton */}
      {loading ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0A3D30]/50 shadow-xl backdrop-blur-sm">
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-4 w-4 rounded bg-white/10 shrink-0" />
                <div className="h-14 w-11 rounded-md bg-white/10 shrink-0" />
                <div className="min-w-[200px] flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-white/10" />
                  <div className="h-3 w-32 rounded bg-white/5" />
                </div>
                <div className="h-5 w-24 rounded-full bg-white/10 hidden sm:block" />
                <div className="h-4 w-28 rounded bg-white/10 hidden md:block" />
                <div className="h-4 w-12 rounded bg-white/10 hidden lg:block" />
                <div className="h-4 w-12 rounded bg-white/10 hidden lg:block" />
                <div className="h-4 w-12 rounded bg-white/10 hidden lg:block" />
                <div className="h-8 w-8 rounded bg-white/10 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Redesigned Table View with Selection Checkboxes */}
      {!loading ? (
        <div
          className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A3D30]/60 shadow-xl backdrop-blur-sm"
          data-lp-pages-list
          data-lp-pages-filter={status}
        >
          {items.length > 0 ? (
            <Table>
              <TableHeader className="bg-black/20 border-b border-white/10 text-xs font-semibold text-white/70">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  {/* Ô vuông chọn tất cả ở trước hình ảnh */}
                  <TableHead className="w-10 pl-4 pr-1 text-center align-middle">
                    <Checkbox
                      checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                      aria-label="Chọn tất cả"
                      className="border-white/30 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
                    />
                  </TableHead>
                  <TableHead className="w-14 px-2 text-transparent select-none">
                    Ảnh
                  </TableHead>
                  <TableHead className="min-w-[220px] px-3 font-semibold text-white/80">
                    Tên
                  </TableHead>
                  <TableHead className="w-36 px-3 font-semibold text-white/80">
                    Trạng thái
                  </TableHead>
                  <TableHead className="w-36 px-3 font-semibold text-white/80">
                    Đã sửa vào
                  </TableHead>
                  <TableHead className="w-28 px-3 text-center font-semibold text-white/80">
                    Lượt truy cập
                  </TableHead>
                  <TableHead className="w-40 px-3 text-center font-semibold text-white/80">
                    Khách hàng tiềm năng
                  </TableHead>
                  <TableHead className="w-32 px-3 text-center font-semibold text-white/80">
                    Tỷ lệ đăng ký
                  </TableHead>
                  <TableHead className="w-12 pl-2 pr-4 text-right text-transparent select-none">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {items.map((p) => {
                  const displayName = formatLandingPageDisplayName(p.name);
                  const dateInfo = formatPageDate(p.updatedAt);
                  const isBusy = busyActionId === p.id;
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <TableRow
                      key={p.id}
                      className={cn(
                        'border-b border-white/5 transition-colors duration-150 hover:bg-white/[0.04]',
                        isBusy && 'opacity-50 pointer-events-none',
                        isSelected && 'bg-[#F97316]/10',
                      )}
                    >
                      {/* Ô vuông tích chọn ở trước hình ảnh */}
                      <TableCell className="py-3 pl-4 pr-1 text-center align-middle">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleSelectOne(p.id, !!checked)}
                          aria-label={`Chọn ${displayName}`}
                          className="border-white/30 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]"
                        />
                      </TableCell>

                      {/* Preview thumbnail */}
                      <TableCell className="py-3 px-2 align-middle">
                        <PageThumbnail src={p.ogImage} alt={displayName} />
                      </TableCell>

                      {/* Page name */}
                      <TableCell className="py-3 px-3 align-middle">
                        <Link
                          href={`/landing-pages/builder/${p.id}`}
                          className="font-medium text-white hover:text-[#F97316] transition-colors line-clamp-1 break-words"
                          title={displayName}
                        >
                          {displayName}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-white/50">
                          <span className="font-mono truncate max-w-[200px]">/{p.slug}</span>
                          {p.theme ? (
                            <>
                              <span>·</span>
                              <span className="capitalize">{p.theme.toLowerCase()}</span>
                            </>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 px-3 align-middle">
                        {p.status === 'PUBLISHED' ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              title="Đang xuất bản (Bấm để gỡ xuất bản)"
                              onClick={() => void act(p.id, 'unpublish')}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  void act(p.id, 'unpublish');
                                }
                              }}
                            >
                              <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </span>
                            <span className="text-xs font-medium text-emerald-300">
                              Đã xuất bản
                            </span>
                          </div>
                        ) : p.status === 'ARCHIVED' ? (
                          <div className="flex items-center gap-2">
                            <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent bg-white/10 opacity-70">
                              <span className="translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white/40 shadow ring-0" />
                            </span>
                            <span className="text-xs font-medium text-amber-400/80">
                              Đã lưu trữ
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent bg-white/20 transition-colors duration-200 ease-in-out"
                              title="Bản nháp"
                            >
                              <span className="translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white/80 shadow ring-0" />
                            </span>
                            <span className="text-xs font-medium text-white/70">
                              Bản nháp
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Modified date */}
                      <TableCell className="py-3 px-3 align-middle text-xs">
                        <div className="font-medium text-white/90">{dateInfo.datePart}</div>
                        {dateInfo.timePart ? (
                          <div className="text-white/50">{dateInfo.timePart}</div>
                        ) : null}
                      </TableCell>

                      {/* Visits */}
                      <TableCell className="py-3 px-3 text-center align-middle font-mono text-xs text-white/70">
                        {p.visits != null ? p.visits.toLocaleString('vi-VN') : '—'}
                      </TableCell>

                      {/* Leads */}
                      <TableCell className="py-3 px-3 text-center align-middle font-mono text-xs text-white/70">
                        {p.leads != null ? p.leads.toLocaleString('vi-VN') : '—'}
                      </TableCell>

                      {/* Registration rate */}
                      <TableCell className="py-3 px-3 text-center align-middle font-mono text-xs text-white/70">
                        {p.conversionRate != null ? `${p.conversionRate}%` : '—'}
                      </TableCell>

                      {/* Three-dot menu */}
                      <TableCell className="py-3 pl-2 pr-4 text-right align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
                              aria-label="Thao tác"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-xl border border-white/15 bg-[#09352A] p-1.5 text-white shadow-2xl backdrop-blur-md"
                          >
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/landing-pages/builder/${p.id}`}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4 text-[#F97316]" />
                                <span>Chỉnh sửa thiết kế</span>
                              </Link>
                            </DropdownMenuItem>

                            {p.status === 'PUBLISHED' ? (
                              <DropdownMenuItem asChild>
                                <a
                                  href={p.publicPath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white cursor-pointer"
                                >
                                  <ExternalLink className="h-4 w-4 text-emerald-400" />
                                  <span>Xem trang công khai</span>
                                </a>
                              </DropdownMenuItem>
                            ) : null}

                            <DropdownMenuItem
                              onClick={() => void act(p.id, 'duplicate')}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white cursor-pointer"
                            >
                              <Copy className="h-4 w-4 text-sky-400" />
                              <span>Nhân đôi</span>
                            </DropdownMenuItem>

                            {p.status === 'PUBLISHED' ? (
                              <DropdownMenuItem
                                onClick={() => void act(p.id, 'unpublish')}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                              >
                                <EyeOff className="h-4 w-4 text-amber-400" />
                                <span>Gỡ xuất bản</span>
                              </DropdownMenuItem>
                            ) : null}

                            {p.status !== 'ARCHIVED' ? (
                              <>
                                <DropdownMenuSeparator className="my-1 bg-white/10" />
                                <DropdownMenuItem
                                  onClick={() => void act(p.id, 'archive')}
                                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                                >
                                  <Archive className="h-4 w-4 text-rose-400" />
                                  <span>Lưu trữ</span>
                                </DropdownMenuItem>
                              </>
                            ) : null}

                            <DropdownMenuSeparator className="my-1 bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => void act(p.id, 'delete')}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-3 text-base font-medium text-white/90">
                {status === 'ALL'
                  ? 'Chưa có landing page nào'
                  : `Không có landing page nào ở trạng thái ${filterLabel(status).toLowerCase()}`}
              </p>
              <p className="mt-1 text-xs text-white/50 max-w-sm">
                Bắt đầu tạo landing page mới để thu hút khách hàng tiềm năng và chuyển đổi hiệu quả.
              </p>
              <Button
                asChild
                className="mt-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-md transition-all rounded-lg"
              >
                <Link href="/landing-pages/create" className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Tạo landing page</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function LandingPagesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-sm text-white/60">
          <RotateCw className="h-4 w-4 animate-spin text-[#F97316]" />
          <span>Đang tải...</span>
        </div>
      }
    >
      <LandingPagesListInner />
    </Suspense>
  );
}
