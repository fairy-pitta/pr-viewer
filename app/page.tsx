// page.tsx
'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>PR Viewer</h1>
      <p className={styles.description}>GitHub PR進捗管理アプリ</p>
      <Link href="/prs" className={styles.link}>
        PR一覧を見る
      </Link>
    </main>
  );
}
