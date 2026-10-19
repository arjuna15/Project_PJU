import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PT Parkit Jaya Utama — Tracking Unit & Monitoring Profit',
  description:
    'Sistem informasi monitoring pengiriman unit vendor serta dashboard profit & margin — PT Parkit Jaya Utama.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
