// presentation/web/app/layout.tsx
import type { Metadata } from 'next';
import '../globals.css';
import { ClientScript } from '../components/ClientScript';

export const metadata: Metadata = {
  title: 'PR Viewer',
  description: 'GitHub PR進捗管理アプリ',
  manifest: '/manifest.json',
  themeColor: '#0066cc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ClientScript />
        {children}
      </body>
    </html>
  );
}
