'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [pat, setPat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePATLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // PATを検証
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: pat }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '認証に失敗しました');
      }

      const { user } = await response.json();
      
      // PATをセッションストレージに保存（セキュアな方法ではないが、デモ用）
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('github_token', pat);
        sessionStorage.setItem('github_user', JSON.stringify(user));
      }

      router.push('/prs');
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>PR Viewer</h1>
          <p className={styles.subtitle}>GitHub PR進捗管理アプリにログイン</p>
        </div>

        <form onSubmit={handlePATLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="pat" className={styles.label}>
              GitHub Personal Access Token (PAT)
            </label>
            <input
              id="pat"
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={styles.input}
              required
              disabled={loading}
            />
            <p className={styles.helpText}>
              PATの作成方法: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !pat}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            セキュリティのため、PATはブラウザのセッションストレージにのみ保存されます。
            <br />
            必要な権限: <code>repo</code>, <code>read:user</code>
          </p>
        </div>
      </div>
    </div>
  );
}
