# Cloudflare Workers対応ガイド

## 概要

このプロジェクトは**Cloudflare Workers / Pages**でも動作するように設計されています。Vercelの代わりにCloudflareを使うことで、**無料でカスタムドメイン**を使用できます。

## Cloudflare対応の方法

### オプション1: Cloudflare Pages（推奨）

Cloudflare PagesはNext.jsを直接サポートしており、最も簡単に移行できます。

#### 手順

1. **Cloudflare Pagesにプロジェクトを接続**
   - Cloudflare Dashboard → Pages → Create a project
   - GitHubリポジトリを接続

2. **ビルド設定**
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

3. **環境変数設定**
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_REDIRECT_URI=https://your-domain.com/auth/callback
   ```

4. **カスタムドメイン設定**
   - Pages → プロジェクト → Custom domains
   - ドメインを追加（**無料**）

### オプション2: Cloudflare Workers + KV

より細かい制御が必要な場合、Cloudflare WorkersとKVを使用できます。

#### 必要な変更

1. **CloudflareKVClientの実装**
   - `infrastructure/external/storage/CloudflareKVClient.ts` を実装済み
   - Cloudflare KV名前空間を使用

2. **API Routesの調整**
   - Next.js API RoutesをCloudflare Workers形式に変換
   - または、`@cloudflare/next-on-pages`を使用

3. **依存性注入の更新**
   ```typescript
   // Cloudflare KVを使用する場合
   if (config.cloudflareKV) {
     const kvClient = new CloudflareKVClient(config.cloudflareKV);
     prRepository = new VercelKVPRRepository(kvClient); // 同じインターフェース
   }
   ```

## Vercel KV vs Cloudflare KV

| 機能 | Vercel KV | Cloudflare KV |
|------|-----------|---------------|
| 無料プラン | あり（制限あり） | あり（制限あり） |
| カスタムドメイン | 有料 | **無料** |
| レイテンシ | 低 | 非常に低（エッジ） |
| グローバル分散 | あり | あり（エッジ） |

## 移行のメリット

1. **カスタムドメインが無料**
2. **エッジコンピューティング**による低レイテンシ
3. **無料プランが充実**（100,000リクエスト/日）

## 現在の実装状況

- ✅ CloudflareKVClientの型定義は実装済み
- ⚠️ 実際のKV実装は未実装（必要に応じて実装）
- ✅ IndexedDBは既に実装済み（ローカルストレージとして使用可能）

## 推奨アプローチ

**Cloudflare Pages**を使用することを推奨します：
- Next.jsをそのまま使用可能
- カスタムドメインが無料
- 設定が簡単
- ストレージはIndexedDB（クライアント側）を使用

KVが必要な場合は、Cloudflare KVを追加実装できます。
