import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

const inter = { className: 'font-sans' };

export const metadata: Metadata = {
  title: 'Ai Bee Go - Nền tảng Marketing Automation',
  description: 'SaaS marketing automation dành cho spa, thẩm mỹ và doanh nghiệp dịch vụ',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Ai Bee Go',
    description: 'Nền tảng marketing automation',
    images: [{ url: '/brand/logo.png', width: 1024, height: 1024, alt: 'Ai Bee Go' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
