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

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3333](http://localhost:3333) を開きます。

**注意**: 現在の実装では**IndexedDB**（ブラウザのローカルストレージ）を使用するため、追加の設定は不要です。データはブラウザに保存されます。

## ログイン方法

このアプリでは、**GitHub Personal Access Token (PAT)**を使用してログインします。

### PATの作成方法

1. GitHubにログイン
2. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** に移動
3. **Generate new token (classic)** をクリック
4. 以下の設定を行います：
   - **Note**: トークンの説明（例: "PR Viewer"）
   - **Expiration**: 有効期限を設定（推奨: 90日または無期限）
   - **Select scopes**: 以下の権限にチェック
     - ✅ `repo` - リポジトリへのアクセス（プライベートリポジトリも含む）
     - ✅ `read:user` - ユーザー情報の読み取り
5. **Generate token** をクリック
6. 表示されたトークンを**必ずコピーして保存**してください（後で再表示できません）

### ログイン手順

1. アプリを開く（`http://localhost:3333`）
2. **ログインして始める** ボタンをクリック、または `/login` ページに移動
3. 作成したPATを入力
4. **ログイン** ボタンをクリック
5. ログイン後、PR一覧ページに自動的にリダイレクトされます

### セキュリティについて

- PATは**ブラウザのセッションストレージ**にのみ保存されます
- ページを閉じるとセッションは終了します（次回アクセス時は再度ログインが必要）
- PATは**絶対に他人と共有しない**でください
- PATが漏洩した場合は、すぐにGitHubで無効化してください

### 環境変数（オプション）

本番環境で環境変数としてトークンを設定することも可能です：

```env
GITHUB_ACCESS_TOKEN=your_personal_access_token
```

この場合、ユーザーはログインなしで使用できます（セキュリティ上の推奨事項ではありません）。

## デプロイ

### Vercel

```bash
vercel
```

### Cloudflare Pages（推奨：カスタムドメイン無料）

詳細は [CLOUDFLARE.md](./CLOUDFLARE.md) を参照してください。

1. Cloudflare Dashboard → Pages → Create a project
2. GitHubリポジトリを接続
3. カスタムドメインを追加（**無料**）

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
