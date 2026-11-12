'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, Crown, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { sidebarNavGroups, type NavGroup, type NavItem } from '@/config/navigation';
import { useT } from '@/i18n/i18n-provider';
import { useCurrentUser } from '@/hooks/use-auth';
import { useSubscriptionDisplay } from '@/hooks/use-subscription-display';
import { CONTENT_AUTO_POST_BASE } from '@/lib/content-auto-post-routes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapsedNavHoverLabel } from './collapsed-nav-hover-label';

/** Canonicalize create-section for active match (`ads-check` → `facebook-check`). */
function normalizeContentSection(section: string | null | undefined): string {
  const value = (section || 'ad').trim();
  if (value === 'ads-check') return 'facebook-check';
  return value || 'ad';
}

interface SidebarProps {
  onNavigate?: () => void;
  /** Main app sidebar rail (icon-only). Does not affect LP builder white toolbar. */
  collapsed?: boolean;
  /** Desktop-only: collapse/expand main green sidebar. */
  onToggleCollapsed?: () => void;
}

export function Sidebar({ onNavigate, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const t = useT();
  const { data: currentUser } = useCurrentUser();
  const isPlatformAdmin = currentUser?.role === 'SUPER_ADMIN';
  const navGroups = useMemo(
    () =>
      sidebarNavGroups.map((g) =>
        g.items ? { ...g, items: g.items.filter((i) => !i.adminOnly || isPlatformAdmin) } : g,
      ),
    [isPlatformAdmin],
  );
  const pathname = usePathname();
  // Keep editing focused on this page; prefetching other routes loads unused CSS.
  const prefetchNavigation = (pathname.startsWith('/landing-pages/builder/') || pathname === '/landing-pages/manage-templates') ? false : undefined;
  const searchParams = useSearchParams();
  const currentPathWithQuery = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const isNavItemActive = useMemo(
    () => (item: NavItem) => {
      if (!item.href) return false;

      try {
        const want = new URL(item.href, 'http://local');
        const have = new URL(currentPathWithQuery, 'http://local');

        if (item.href.startsWith(`${CONTENT_AUTO_POST_BASE}?`)) {
          if (have.pathname !== CONTENT_AUTO_POST_BASE) return false;
          const wantTab = want.searchParams.get('tab');
          const haveTab = have.searchParams.get('tab') || 'create';
          if (wantTab !== haveTab) return false;
          const wantSection = want.searchParams.get('section');
          if (wantSection) {
            return (
              normalizeContentSection(have.searchParams.get('section')) ===
              normalizeContentSection(wantSection)
            );
          }
          return true;
        }

        if (want.pathname === '/automation' && want.searchParams.has('tab')) {
          if (have.pathname !== '/automation') return false;
          const wantTab = want.searchParams.get('tab');
          const haveTab = have.searchParams.get('tab') || 'campaigns';
          if (wantTab === 'flows') {
            return (
              haveTab === 'flows' ||
              haveTab === 'templates' ||
              haveTab === 'logs' ||
              haveTab === 'channels'
            );
          }
          return wantTab === haveTab;
        }

        if (want.pathname === '/automation' && !want.search) {
          if (have.pathname !== '/automation') return false;
          const haveTab = have.searchParams.get('tab') || 'campaigns';
          return (
            haveTab === 'flows' ||
            haveTab === 'templates' ||
            haveTab === 'logs' ||
            haveTab === 'channels'
          );
        }

        if (want.search) {
          if (have.pathname !== want.pathname) return false;
          if (want.pathname === '/settings' && want.searchParams.get('tab') === 'account') {
            const haveTab = have.searchParams.get('tab');
            // Hub (/settings without tab) is not the Account child
            return haveTab === 'account' || haveTab === 'general';
          }
          for (const [key, value] of want.searchParams.entries()) {
            if (key === 'tab' && want.pathname === '/settings') {
              const haveTab = have.searchParams.get('tab');
              if (value === 'knowledge') {
                return haveTab === 'knowledge' || haveTab === 'knowledge-base' || haveTab === 'kb';
              }
              if (value === 'connections') {
                return (
                  haveTab === 'connections' ||
                  haveTab === 'connect' ||
                  haveTab === 'zalo' ||
                  haveTab === 'zalo-oa'
                );
              }
              if (value === 'api') {
                return haveTab === 'api' || haveTab === 'integrations';
              }
              if (value === 'system') {
                return haveTab === 'system' || haveTab === 'general';
              }
            }
            if (have.searchParams.get(key) !== value) return false;
          }
          return true;
        }
      } catch {
        return currentPathWithQuery === item.href;
      }

      return (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`) ||
        (item.href === CONTENT_AUTO_POST_BASE &&
          (pathname === '/ai' ||
            pathname.startsWith('/ai/') ||
            pathname === '/auto-post' ||
            pathname.startsWith('/auto-post/')))
      );
    },
    [currentPathWithQuery, pathname],
  );

  const isGroupActive = useMemo(
    () => (group: NavGroup) => {
      if (group.items?.some(isNavItemActive)) return true;
      if (!group.href) return false;

      if (group.href === '/settings') {
        return pathname === '/settings' || pathname.startsWith('/settings/');
      }
      if (group.href === '/content-marketing' || group.href === CONTENT_AUTO_POST_BASE) {
        if (pathname === '/content-marketing' || pathname.startsWith('/content-marketing/')) {
          return true;
        }
        if (pathname === '/teleprompter' || pathname.startsWith('/teleprompter/')) return true;
        if (
          pathname === CONTENT_AUTO_POST_BASE ||
          pathname.startsWith(`${CONTENT_AUTO_POST_BASE}/`)
        ) {
          return true;
        }
        return (
          pathname === '/ai' ||
          pathname.startsWith('/ai/') ||
          pathname === '/auto-post' ||
          pathname.startsWith('/auto-post/')
        );
      }
      if (group.href === '/hrm') {
        return (
          pathname === '/hrm' ||
          pathname.startsWith('/hrm/') ||
          pathname.startsWith('/work-management')
        );
      }
      if (group.href === '/messaging') {
        return (
          pathname === '/messaging' ||
          pathname.startsWith('/messaging/') ||
          pathname.startsWith('/automation') ||
          pathname.startsWith('/chatbot-cskh') ||
          pathname.startsWith('/email-marketing') ||
          pathname.startsWith('/zalo-marketing') ||
          pathname.startsWith('/messages')
        );
      }
      if (group.href === '/advertising') {
        return (
          pathname === '/advertising' ||
          pathname.startsWith('/advertising/') ||
          pathname.startsWith('/ads') ||
          pathname.startsWith('/attribution')
        );
      }
      if (group.href === '/finance-billing') {
        return (
          pathname === '/finance-billing' ||
          pathname.startsWith('/finance-billing/') ||
          pathname.startsWith('/finance') ||
          pathname.startsWith('/business-goals') ||
          pathname.startsWith('/affiliate') ||
          pathname.startsWith('/credits')
        );
      }
      if (group.href === '/crm') {
        return (
          pathname === '/crm' ||
          pathname.startsWith('/crm/') ||
          pathname.startsWith('/customers') ||
          pathname.startsWith('/leads') ||
          pathname.startsWith('/funnel')
        );
      }
      if (group.href === '/sales') {
        return pathname === '/sales' || pathname.startsWith('/sales/');
      }

      return pathname === group.href || pathname.startsWith(`${group.href}/`);
    },
    [isNavItemActive, pathname],
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of navGroups) {
        if (group.items?.length && next[group.title] == null) {
          next[group.title] = isGroupActive(group);
        }
        if (group.items?.length && isGroupActive(group)) {
          next[group.title] = true;
        }
      }
      return next;
    });
  }, [isGroupActive]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const { display: subscriptionDisplay } = useSubscriptionDisplay();
  const upgradeNav = subscriptionDisplay?.upgradeButton;
  const sidebarPlanLabel =
    subscriptionDisplay?.tier === 'PRO_12M'
      ? subscriptionDisplay.planLabel
      : upgradeNav?.show
        ? upgradeNav.label
        : (subscriptionDisplay?.planLabel ?? t('layout.upgradePro'));
  const sidebarPlanHref = upgradeNav?.href ?? '/pricing';
  const sidebarPlanIsUpgrade =
    upgradeNav?.show !== false && subscriptionDisplay?.tier !== 'PRO_12M';

  return (
    <div
      className="relative flex h-full min-h-0 flex-col text-white"
      data-main-sidebar-nav={collapsed ? 'collapsed' : 'expanded'}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-white/10',
          collapsed ? 'justify-center px-1' : 'gap-2 px-4 pr-10',
        )}
      >
        <Sparkles className="h-5 w-5 shrink-0 text-white" />
        {!collapsed ? (
          <span className="whitespace-nowrap text-base font-bold leading-tight text-white">
            Ai Bee Go
          </span>
        ) : null}
      </div>
      <ScrollArea className="min-h-0 flex-1 py-4">
        <nav className={cn('grid gap-2 pb-24', collapsed ? 'px-1' : 'px-2')}>
          {navGroups.map((group) => {
            const active = isGroupActive(group);
            const hasChildren = Boolean(group.items?.length);
            const iconOnlyLinkClass = cn(
              'flex items-center rounded-lg text-sm font-medium transition-colors touch-manipulation',
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            );

            if (hasChildren && group.items?.length === 1) {
              const onlyItem = group.items[0]!;
              const itemActive = isNavItemActive(onlyItem);
              return (
                <CollapsedNavHoverLabel
                  key={group.title}
                  enabled={collapsed}
                  label={t(group.title)}
                >
                  <Link
                    prefetch={prefetchNavigation}
                    href={onlyItem.href}
                    onClick={onNavigate}
                    className={cn(
                      iconOnlyLinkClass,
                      itemActive
                        ? 'bg-white text-[#0A3D30] shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{t(group.title)}</span> : null}
                  </Link>
                </CollapsedNavHoverLabel>
              );
            }

            if (!hasChildren && group.href) {
              const isOverview = group.title === 'nav.overview';
              const overviewToggle =
                isOverview && onToggleCollapsed ? (
                  <button
                    type="button"
                    aria-label={collapsed ? 'Mở sidebar chính' : 'Đóng sidebar chính'}
                    aria-expanded={!collapsed}
                    data-testid="main-app-sidebar-toggle"
                    onClick={onToggleCollapsed}
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      'border border-white/25 bg-white text-[#0A3D30] shadow-sm',
                      'text-sm font-semibold leading-none transition hover:bg-emerald-50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
                    )}
                  >
                    {collapsed ? '→' : '←'}
                  </button>
                ) : null;

              if (overviewToggle && collapsed) {
                return (
                  <div
                    key={group.title}
                    className="flex flex-col items-center gap-1.5"
                    data-main-sidebar-overview-row="collapsed"
                  >
                    {overviewToggle}
                    <CollapsedNavHoverLabel enabled label={t(group.title)}>
                      <Link
                        prefetch={prefetchNavigation}
                        href={group.href}
                        onClick={onNavigate}
                        className={cn(
                          iconOnlyLinkClass,
                          'w-full',
                          active
                            ? 'bg-white text-[#0A3D30] shadow-sm'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        <group.icon className="h-4 w-4 shrink-0" />
                      </Link>
                    </CollapsedNavHoverLabel>
                  </div>
                );
              }

              if (overviewToggle && !collapsed) {
                return (
                  <div
                    key={group.title}
                    className="flex items-center gap-1"
                    data-main-sidebar-overview-row="expanded"
                  >
                    <Link
                      prefetch={prefetchNavigation}
                      href={group.href}
                      onClick={onNavigate}
                      className={cn(
                        iconOnlyLinkClass,
                        'min-w-0 flex-1',
                        active
                          ? 'bg-white text-[#0A3D30] shadow-sm'
                          : 'text-white/70 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <group.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t(group.title)}</span>
                    </Link>
                    {overviewToggle}
                  </div>
                );
              }

              return (
                <CollapsedNavHoverLabel
                  key={group.title}
                  enabled={collapsed}
                  label={t(group.title)}
                >
                  <Link
                    prefetch={prefetchNavigation}
                    href={group.href}
                    onClick={onNavigate}
                    className={cn(
                      iconOnlyLinkClass,
                      active
                        ? 'bg-white text-[#0A3D30] shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{t(group.title)}</span> : null}
                  </Link>
                </CollapsedNavHoverLabel>
              );
            }

            const hubHref = group.href || group.items?.[0]?.href || '#';
            const isHubExact =
              pathname === hubHref ||
              (hubHref === '/settings' && pathname === '/settings' && !searchParams.get('tab'));

            if (collapsed) {
              return (
                <CollapsedNavHoverLabel key={group.title} enabled label={t(group.title)}>
                  <Link
                    prefetch={prefetchNavigation}
                    href={hubHref}
                    onClick={onNavigate}
                    className={cn(
                      iconOnlyLinkClass,
                      active || isHubExact
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                  </Link>
                </CollapsedNavHoverLabel>
              );
            }

            return (
              <div
                key={group.title}
                className="rounded-xl border border-transparent bg-transparent"
              >
                <div
                  className={cn(
                    'flex w-full items-stretch rounded-lg transition-colors',
                    active || isHubExact
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Link
                    prefetch={prefetchNavigation}
                    href={hubHref}
                    onClick={() => {
                      setOpenGroups((prev) => ({ ...prev, [group.title]: true }));
                      onNavigate?.();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm font-medium touch-manipulation"
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{t(group.title)}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label={t('moduleHub.toggleSubmenu')}
                    aria-expanded={Boolean(openGroups[group.title])}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleGroup(group.title);
                    }}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center px-2.5 touch-manipulation hover:bg-white/10 rounded-r-lg"
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform',
                        openGroups[group.title] ? 'rotate-180' : '',
                      )}
                    />
                  </button>
                </div>
                {openGroups[group.title] ? (
                  <div className="mt-1 ml-3 space-y-1 border-l border-white/15 pl-3">
                    {group.items?.map((item) => {
                      const itemActive = isNavItemActive(item);
                      return (
                        <Link
                          prefetch={prefetchNavigation}
                          key={`${group.title}-${item.title}`}
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors touch-manipulation',
                            itemActive
                              ? 'bg-white text-[#0A3D30] shadow-sm'
                              : 'text-white/65 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{t(item.title)}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#0A3D30] via-[#0A3D30]/95 to-transparent',
          collapsed && 'hidden',
        )}
        aria-hidden
      />

      <div
        className={cn(
          'absolute z-20',
          collapsed
            ? 'bottom-3 left-1 right-1'
            : 'bottom-4 left-4 right-4 lg:fixed lg:bottom-4 lg:left-4 lg:right-auto lg:w-[calc(var(--app-sidebar-width,16rem)-2rem)]',
        )}
      >
        <Link
          prefetch={prefetchNavigation}
          href={sidebarPlanHref}
          onClick={onNavigate}
          title={collapsed ? sidebarPlanLabel : undefined}
          className={cn(
            'flex w-full items-center justify-center font-semibold transition-all touch-manipulation',
            collapsed ? 'rounded-lg p-2' : 'gap-2.5 rounded-xl px-4 py-3 text-sm',
            sidebarPlanIsUpgrade
              ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-300 text-[#0A3D30] shadow-lg shadow-amber-500/30 ring-1 ring-white/25 hover:from-amber-300 hover:via-amber-300 hover:to-yellow-200 hover:shadow-amber-400/40'
              : 'bg-emerald-500/25 text-emerald-50 ring-1 ring-emerald-300/40 hover:bg-emerald-500/35',
            'active:scale-[0.98]',
            pathname.startsWith('/pricing') && 'ring-2 ring-white shadow-amber-300/50',
          )}
        >
          <Crown className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed ? <span className="truncate">{sidebarPlanLabel}</span> : null}
        </Link>
      </div>
    </div>
  );
}
