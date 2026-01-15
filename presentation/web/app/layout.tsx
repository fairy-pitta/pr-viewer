// presentation/web/app/layout.tsx
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'PR Viewer',
  description: 'GitHub PR進捗管理アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
