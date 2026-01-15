// page.tsx
'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleHighlight}>PR Viewer</span>
          </h1>
          <p className={styles.description}>
            GitHub Pull Requestを効率的に管理
            <br />
            レビュー進捗を一目で把握
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <h3>進捗可視化</h3>
              <p>PRの状態を詳細に管理</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💬</div>
              <h3>コメント追跡</h3>
              <p>すべてのコメントを一元管理</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔔</div>
              <h3>通知機能</h3>
              <p>新しいコメントを即座に通知</p>
            </div>
          </div>
          <div className={styles.actions}>
            <Link href="/login" className={styles.primaryButton}>
              ログインして始める
            </Link>
            <Link href="/prs" className={styles.secondaryButton}>
              PR一覧を見る
            </Link>
          </div>
        </div>
        <div className={styles.illustration}>
          <div className={styles.cardPreview}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              <div className={styles.cardDot}></div>
              <div className={styles.cardDot}></div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>feat: Add new feature</div>
              <div className={styles.cardMeta}>
                <span>owner/repo</span>
                <span>#123</span>
              </div>
              <div className={styles.cardStats}>
                <span>✅ 2 承認</span>
                <span>💬 5 コメント</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
