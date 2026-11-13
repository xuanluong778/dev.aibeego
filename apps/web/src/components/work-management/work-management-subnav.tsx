'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListTodo, BarChart3, CalendarDays, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/work-management', label: 'Bảng việc', hint: 'Kéo thả việc theo cột', icon: LayoutGrid },
  { href: '/work-management/my', label: 'Việc của tôi', hint: 'Việc cần làm hôm nay', icon: ListTodo },
  { href: '/work-management/dashboard', label: 'Tổng quan', hint: 'Tiến độ team & dự án', icon: BarChart3 },
  { href: '/work-management/calendar', label: 'Lịch', hint: 'Xem theo ngày', icon: CalendarDays },
] as const;

export function WorkManagementSubNav({ showHelp = true }: { showHelp?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      {showHelp && (
        <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-slate-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-slate-100">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
          <div>
            <p className="font-medium">Hướng dẫn nhanh</p>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              Chọn <strong>dự án</strong> → bấm thẻ việc để mở chi tiết (nhãn, ngày, checklist, bình luận). Kéo thẻ
              sang cột khác để đổi trạng thái.
            </p>
          </div>
        </div>
      )}
      <nav
        className="flex flex-wrap gap-2"
        aria-label="Điều hướng quản lý công việc"
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/work-management'
              ? pathname === '/work-management'
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
