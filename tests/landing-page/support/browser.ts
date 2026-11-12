import type { Browser, Page } from 'playwright';
import { env } from './env';

export const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  tiny: { width: 320, height: 640 },
  below768: { width: 767, height: 900 },
  below1024: { width: 1023, height: 900 },
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

let browser: Browser | null = null;
/** Mở Chromium (cần `npx playwright install chromium`). */
export async function openBrowser(): Promise<Browser> {
  if (browser) return browser;
  const { chromium } = await import('playwright');
  browser = await chromium.launch();
  return browser;
}
export async function closeBrowser() {
  await browser?.close();
  browser = null;
}

/** Mở một trang web công khai ở khung hình cho trước, thu lỗi console/pageerror. */
export async function withPublicPage<T>(slug: string, viewport: ViewportName, fn: (page: Page, errors: string[]) => Promise<T>): Promise<T> {
  const b = await openBrowser();
  const ctx = await b.newContext({ viewport: VIEWPORTS[viewport] });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  try {
    await page.goto(`${env.webBase}/p/${encodeURIComponent(slug)}`, { waitUntil: 'networkidle' });
    return await fn(page, errors);
  } finally {
    await ctx.close();
  }
}

/** Độ rộng nội dung so với khung nhìn: >0 nghĩa là bị tràn ngang. */
export const horizontalOverflow = (page: Page) =>
  page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
