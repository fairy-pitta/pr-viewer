# PR Viewer

GitHub PRに特化した進捗管理Webアプリ（PWA）

## 概要

PR Viewerは、GitHubのPull Requestを効率的に管理するためのWebアプリケーションです。レビューリクエストされているPRと自分が作成したPRを一元管理し、細かい進捗を追跡できます。

## 主な機能

- **PR一覧表示**: レビューリクエストされているPRと自分が作成したPRを一覧表示
- **進捗管理**: PRの状態（レビュー待ち、承認待ち、変更要求など）を詳細に管理
- **コメント追跡**: すべてのコメントソース（レビュアー、ボット、Copilot、CodeRabbitなど）を追跡
- **フィルタリング**: リポジトリ、状態、担当者、日付、検索でフィルタリング
- **通知機能**: 新しいコメントやPR状態変更を通知（ブラウザ通知 + PWA Push通知）
- **PWA対応**: オフライン対応、ホーム画面への追加が可能

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + CSS Modules
- **バックエンド**: Vercel Serverless Functions (API Routes)
- **認証**: GitHub App (OAuth flow)
- **データストレージ**: Vercel KV (Redis) / IndexedDB
- **通知**: PWA Push Notifications + Browser Notifications
- **デプロイ**: Vercel

## アーキテクチャ

このプロジェクトは**Clean Architecture**と**Domain-Driven Design (DDD)**の原則に従って設計されています。

### レイヤー構造

- **Domain層**: ビジネスロジック、エンティティ、値オブジェクト、ドメインサービス
- **Application層**: ユースケース、DTO、Mapper
- **Infrastructure層**: リポジトリ実装、外部APIクライアント、通知サービス
- **Presentation層**: Next.js UI、API Routes、React Hooks

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
npm install
```

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
VERCEL_KV_URL=your_vercel_kv_url
VERCEL_KV_TOKEN=your_vercel_kv_token
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
pr-viewer/
├── domain/              # Domain層（ビジネスロジック）
├── application/         # Application層（ユースケース）
├── infrastructure/      # Infrastructure層（外部サービス）
├── presentation/        # Presentation層（UI）
└── public/             # 静的ファイル
```

## ライセンス

MIT
