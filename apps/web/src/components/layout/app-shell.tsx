'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { cn } from '@/lib/utils';
import { AssistantWidget } from '@/components/assistant/assistant-widget';

const SIDEBAR_EXPANDED = '16rem';
const SIDEBAR_COLLAPSED = '3.5rem'; // 56px — within 48–60px rail
/** Floating LP toolbar (and others) listen for this to track the website sidebar edge. */
export const MAIN_SIDEBAR_WIDTH_EVENT = 'mkspa:main-sidebar-width';

function remToPx(remValue: string): number {
  const rem = parseFloat(remValue) || 16;
  if (typeof window === 'undefined') return rem * 16;
  return rem * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
}

function isLandingPageBuilderPath(pathname: string | null): boolean {
  return Boolean(pathname && pathname.includes('/landing-pages/builder/'));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mainSidebarCollapsedPref, setMainSidebarCollapsed] = useState(false);
  const [builderLeftExpanded, setBuilderLeftExpanded] = useState(false);
  const [lpPreviewMode, setLpPreviewMode] = useState(false);
  // Pathname is authoritative on first paint (body attribute arrives after useEffect).
  const lpBuilderActive = isLandingPageBuilderPath(pathname);
  const lockViewport = lpBuilderActive || lpPreviewMode;
  // Overview / Trang của tôi / every other tab: left nav stays expanded.
  // Only the landing-page design canvas (`/landing-pages/builder/…`) starts collapsed.
  const mainSidebarCollapsed = lpBuilderActive ? !builderLeftExpanded : mainSidebarCollapsedPref;

  useLayoutEffect(() => {
    if (lpBuilderActive) {
      setBuilderLeftExpanded(false);
      return;
    }
    setMainSidebarCollapsed(false);
  }, [pathname, lpBuilderActive]);

  useEffect(() => {
    const sync = () =>
      setLpPreviewMode(document.body.getAttribute('data-lp-preview-mode') === '1');
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-lp-preview-mode'],
    });
    return () => mo.disconnect();
  }, []);

  // Hard-lock document scroll while LP builder is open — prevents toolbar sliding under sticky header.
  useLayoutEffect(() => {
    if (!lockViewport) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.setAttribute('data-lp-builder-active', lpBuilderActive ? '1' : '0');
    body.setAttribute('data-lp-viewport-lock', '1');
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      if (!isLandingPageBuilderPath(window.location.pathname)) {
        body.removeAttribute('data-lp-builder-active');
      }
      body.removeAttribute('data-lp-viewport-lock');
    };
  }, [lockViewport, lpBuilderActive]);

  const sidebarWidth = mainSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    const widthPx = remToPx(sidebarWidth);
    try {
      window.dispatchEvent(
        new CustomEvent(MAIN_SIDEBAR_WIDTH_EVENT, {
          detail: {
            widthPx,
            collapsed: mainSidebarCollapsed,
            sidebarRight: widthPx, // lg:fixed lg:left-0 → right edge === width
          },
        }),
      );
    } catch {
      /* ignore */
    }
  }, [mainSidebarCollapsed, sidebarWidth]);

  return (
    <div
      className={cn(
        'flex',
        lockViewport
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-screen',
      )}
      style={{ ['--app-sidebar-width' as string]: sidebarWidth }}
      data-main-sidebar-collapsed={mainSidebarCollapsed ? '1' : '0'}
      data-lp-builder-sidebar-policy="collapse-on-builder-only"
      data-lp-app-preview={lpPreviewMode ? '1' : undefined}
      data-lp-viewport-locked={lockViewport ? '1' : undefined}
    >
      <aside
        className={cn(
          'relative hidden shrink-0 border-r border-[#0A3D30]/20 bg-[#0A3D30] lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col',
          'transition-[width] duration-200 ease-out',
          lpPreviewMode && '!hidden',
        )}
        style={{ width: sidebarWidth }}
        data-testid="main-app-sidebar"
        data-app-shell-sidebar="1"
        data-collapsed={mainSidebarCollapsed ? '1' : '0'}
        aria-hidden={lpPreviewMode || undefined}
      >
        <Sidebar
          collapsed={mainSidebarCollapsed}
          onToggleCollapsed={() => {
            if (lpBuilderActive) setBuilderLeftExpanded((v) => !v);
            else setMainSidebarCollapsed((v) => !v);
          }}
        />
      </aside>

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          lockViewport && 'h-full max-h-full overflow-hidden',
          'transition-[padding] duration-200 ease-out',
          lpPreviewMode ? 'lg:pl-0' : 'lg:pl-[var(--app-sidebar-width,16rem)]',
        )}
        data-app-shell-main-col="1"
      >
        <div
          className={cn(
            'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6',
            lpPreviewMode && 'hidden',
          )}
          data-app-shell-header="1"
          aria-hidden={lpPreviewMode || undefined}
        >
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-[#0A3D30]/20 bg-[#0A3D30] p-0 text-white">
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Topbar />
        </div>
        <main
          className={cn(
            'min-h-0',
            lockViewport
              ? 'flex h-full min-h-0 flex-1 flex-col overflow-hidden p-0'
              : 'flex-1 p-4 lg:p-6',
          )}
          data-app-shell-main="1"
          data-lp-builder-main={lpBuilderActive ? '1' : undefined}
        >
          {children}
        </main>
      </div>
      <div hidden={lpBuilderActive || lpPreviewMode} data-app-assistant-host="1">
        <AssistantWidget />
      </div>
    </div>
  );
}
