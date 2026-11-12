'use client';

/**
 * Landing Page — Quản lý Media modal (Hình ảnh rail).
 * Reuses POST /landing-pages/:id/upload-image + GET /landing-pages/:id/media.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MoreVertical, PlusCircle, Search, X } from 'lucide-react';
import { apiClient, apiUpload } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { beginSidebarPresetDrag } from './landing-page-sidebar-dnd';

const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 10 * 1024 * 1024;

export type LpMediaItem = {
  id: string;
  url: string;
  name: string;
  sizeBytes?: number;
  updatedAt?: string;
  source?: 'mine' | 'free' | 'illustration';
  tag?: string;
};

type TabId = 'mine' | 'free' | 'illustration';

type Props = {
  open: boolean;
  pageId: string;
  onClose: () => void;
  onUse: (item: LpMediaItem) => void;
};

const FREE_STOCK: LpMediaItem[] = [
  {
    id: 'free-1',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    name: 'Team collaboration',
    source: 'free',
    tag: 'business',
  },
  {
    id: 'free-2',
    url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
    name: 'Startup workspace',
    source: 'free',
    tag: 'business',
  },
  {
    id: 'free-3',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    name: 'Healthcare',
    source: 'free',
    tag: 'health',
  },
  {
    id: 'free-4',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    name: 'Code & laptop',
    source: 'free',
    tag: 'tech',
  },
  {
    id: 'free-5',
    url: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=80',
    name: 'Retail store',
    source: 'free',
    tag: 'retail',
  },
  {
    id: 'free-6',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    name: 'Food & dining',
    source: 'free',
    tag: 'food',
  },
];

const ILLUSTRATION_STOCK: LpMediaItem[] = [
  {
    id: 'illu-1',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    name: 'Abstract gradient',
    source: 'illustration',
    tag: 'abstract',
  },
  {
    id: 'illu-2',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
    name: 'Color shapes',
    source: 'illustration',
    tag: 'abstract',
  },
  {
    id: 'illu-3',
    url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
    name: 'Soft waves',
    source: 'illustration',
    tag: 'abstract',
  },
  {
    id: 'illu-4',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
    name: 'Neon mesh',
    source: 'illustration',
    tag: 'abstract',
  },
];

function tagsStorageKey(pageId: string) {
  return `lp-media-tags:${pageId}`;
}

function loadTags(pageId: string): string[] {
  try {
    const raw = localStorage.getItem(tagsStorageKey(pageId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string').slice(0, 40) : [];
  } catch {
    return [];
  }
}

function saveTags(pageId: string, tags: string[]) {
  try {
    localStorage.setItem(tagsStorageKey(pageId), JSON.stringify(tags.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

function itemTagKey(pageId: string) {
  return `lp-media-item-tags:${pageId}`;
}

function loadItemTags(pageId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(itemTagKey(pageId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveItemTags(pageId: string, map: Record<string, string>) {
  try {
    localStorage.setItem(itemTagKey(pageId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function LandingPageMediaModal({ open, pageId, onClose, onUse }: Props) {
  const [tab, setTab] = useState<TabId>('mine');
  const [q, setQ] = useState('');
  const [mine, setMine] = useState<LpMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [busyUpload, setBusyUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folder, setFolder] = useState<string>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [itemTags, setItemTags] = useState<Record<string, string>>({});
  const [menuId, setMenuId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reloadMine = useCallback(
    async (search = '') => {
      setLoading(true);
      setErr('');
      try {
        const qs = new URLSearchParams({ scope: 'org' });
        const term = search.trim();
        if (term) qs.set('q', term);
        const res = await apiClient<{ items: Array<Omit<LpMediaItem, 'source'>> }>(
          `/landing-pages/${pageId}/media?${qs.toString()}`,
        );
        const map = loadItemTags(pageId);
        setMine(
          (res.items || []).map((row) => ({
            ...row,
            source: 'mine' as const,
            tag: map[row.id] || map[row.url] || undefined,
          })),
        );
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Không tải được thư viện ảnh');
        setMine([]);
      } finally {
        setLoading(false);
      }
    },
    [pageId],
  );

  useEffect(() => {
    if (!open) return;
    setTab('mine');
    setSelectedId(null);
    setFolder('all');
    setQ('');
    setTags(loadTags(pageId));
    setItemTags(loadItemTags(pageId));
    void reloadMine('');
  }, [open, pageId, reloadMine]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const catalog = useMemo(() => {
    if (tab === 'free') return FREE_STOCK;
    if (tab === 'illustration') return ILLUSTRATION_STOCK;
    return mine;
  }, [tab, mine]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return catalog.filter((item) => {
      if (folder !== 'all') {
        const tag = item.tag || itemTags[item.id] || itemTags[item.url];
        if (tag !== folder) return false;
      }
      if (!term) return true;
      return item.name.toLowerCase().includes(term) || item.url.toLowerCase().includes(term);
    });
  }, [catalog, q, folder, itemTags]);

  const selected = useMemo(
    () => catalog.find((x) => x.id === selectedId) || null,
    [catalog, selectedId],
  );

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setErr('');
    const name = file.name.toLowerCase();
    if (!ALLOWED.has(file.type) && !/\.(jpe?g|png|webp|gif)$/i.test(name)) {
      setErr('Chỉ JPG/PNG/WebP/GIF');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr('File tối đa 10MB');
      return;
    }
    setBusyUpload(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{
        url: string;
        originalName?: string;
        sizeBytes?: number;
      }>(`/landing-pages/${pageId}/upload-image`, fd);
      const item: LpMediaItem = {
        id: `up:${res.url}`,
        url: res.url,
        name: res.originalName || file.name,
        sizeBytes: res.sizeBytes || file.size,
        updatedAt: new Date().toISOString(),
        source: 'mine',
        tag: folder !== 'all' ? folder : undefined,
      };
      if (item.tag) {
        const nextMap = { ...itemTags, [item.id]: item.tag, [item.url]: item.tag };
        setItemTags(nextMap);
        saveItemTags(pageId, nextMap);
      }
      setMine((prev) => [item, ...prev.filter((x) => x.url !== item.url)]);
      setTab('mine');
      setSelectedId(item.id);
      void reloadMine(q);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setBusyUpload(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function createTag() {
    const name = window.prompt('Tên tag / folder mới')?.trim();
    if (!name) return;
    const next = Array.from(new Set([...tags, name])).slice(0, 40);
    setTags(next);
    saveTags(pageId, next);
    setFolder(name);
  }

  function assignTag(item: LpMediaItem, tag: string) {
    const next = { ...itemTags, [item.id]: tag, [item.url]: tag };
    setItemTags(next);
    saveItemTags(pageId, next);
    setMine((prev) => prev.map((row) => (row.id === item.id ? { ...row, tag } : row)));
    setMenuId(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 sm:p-6"
      data-lp-media-modal
      role="dialog"
      aria-modal="true"
      aria-label="Quản lý Media"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`body[data-lp-dragging-media="1"] [data-lp-media-modal]{opacity:0!important;pointer-events:none!important}body[data-lp-dragging-media="1"] [data-lp-media-modal] *{pointer-events:none!important}`}</style>
      <div
        className="flex h-[min(90vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        data-lp-media-dialog
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex shrink-0 items-center justify-center border-b border-zinc-200 px-4 py-3">
          <h2 className="text-base font-semibold text-zinc-900">Quản lý Media</h2>
          <button
            type="button"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            onClick={onClose}
            aria-label="Đóng"
            data-lp-media-close
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs + search / upload */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto" data-lp-media-tabs>
            {(
              [
                ['mine', 'Ảnh của tôi'],
                ['free', 'Ảnh miễn phí'],
                ['illustration', 'Ảnh minh họa'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                data-lp-media-tab={id}
                data-active={tab === id ? '1' : '0'}
                onClick={() => {
                  setTab(id);
                  setSelectedId(null);
                }}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition',
                  tab === id
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:w-56 sm:flex-none">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tab === 'mine') void reloadMine(q);
                }}
                placeholder="Tìm kiếm hình ảnh"
                className="h-9 border-zinc-200 bg-white pr-9 text-sm text-zinc-900 placeholder:text-zinc-400"
                data-lp-media-search
              />
              <Search className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              className="h-9 bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={busyUpload}
              data-lp-media-upload
              onClick={() => fileRef.current?.click()}
            >
              {busyUpload ? 'Đang tải…' : '+ Chọn tệp'}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          <aside
            className="hidden w-44 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 p-3 sm:flex"
            data-lp-media-folders
          >
            <button
              type="button"
              data-lp-media-folder="all"
              data-active={folder === 'all' ? '1' : '0'}
              onClick={() => setFolder('all')}
              className={cn(
                'mb-1 rounded-md px-2.5 py-2 text-left text-sm font-medium',
                folder === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-700 hover:bg-zinc-200/70',
              )}
            >
              Tất cả
            </button>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  data-lp-media-folder={tag}
                  data-active={folder === tag ? '1' : '0'}
                  onClick={() => setFolder(tag)}
                  className={cn(
                    'block w-full truncate rounded-md px-2.5 py-2 text-left text-sm',
                    folder === tag
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-200/70',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              data-lp-media-create-tag
              onClick={createTag}
            >
              <PlusCircle className="h-4 w-4" />
              Tạo Tag mới
            </button>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/50 p-3 sm:p-4" data-lp-media-grid>
            {err ? (
              <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {err}
              </p>
            ) : null}
            {loading && tab === 'mine' ? (
              <p className="text-sm text-zinc-500">Đang tải thư viện…</p>
            ) : null}
            {!loading && !filtered.length ? (
              <div className="flex h-40 flex-col items-center justify-center text-sm text-zinc-500">
                <p>Chưa có ảnh trong mục này.</p>
                {tab === 'mine' ? (
                  <p className="mt-1 text-xs">Bấm “+ Chọn tệp” để upload ảnh mới.</p>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((item) => {
                  const active = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      data-lp-media-item={item.id}
                      data-selected={active ? '1' : '0'}
                      data-lp-sidebar-draggable="media"
                      draggable
                      onDragStart={(e) =>
                        beginSidebarPresetDrag(
                          e,
                          { kind: 'media', url: item.url, name: item.name },
                          item.name,
                        )
                      }
                      className={cn(
                        'group relative cursor-grab overflow-hidden rounded-xl border bg-white shadow-sm transition active:cursor-grabbing',
                        active
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                          : 'border-zinc-200 hover:border-zinc-300',
                      )}
                    >
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => setSelectedId(item.id)}
                        onDoubleClick={() => {
                          setSelectedId(item.id);
                          onUse(item);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          className="aspect-[4/3] w-full object-cover bg-zinc-100"
                          loading="lazy"
                        />
                        <div className="flex items-center gap-1 px-2 py-2">
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-800">
                            {item.name}
                          </span>
                        </div>
                      </button>
                      <div className="absolute right-1.5 top-1.5">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-zinc-600 shadow hover:bg-white"
                          aria-label="Menu ảnh"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuId((cur) => (cur === item.id ? null : item.id));
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuId === item.id ? (
                          <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-50"
                              onClick={() => {
                                setSelectedId(item.id);
                                setMenuId(null);
                              }}
                            >
                              Chọn
                            </button>
                            {tags.length ? (
                              tags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-50"
                                  onClick={() => assignTag(item, tag)}
                                >
                                  Gán tag: {tag}
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-50"
                                onClick={() => {
                                  setMenuId(null);
                                  createTag();
                                }}
                              >
                                Tạo tag…
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-200 bg-white px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
            onClick={onClose}
            data-lp-media-cancel
          >
            Đóng
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
            disabled={!selected}
            data-lp-media-use
            onClick={() => {
              if (!selected) return;
              onUse(selected);
            }}
          >
            Sử dụng
          </Button>
        </div>
      </div>
    </div>
  );
}
