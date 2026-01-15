# クイックスタートガイド

## ローカルで起動する方法

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 3. 動作確認

現在の実装では、**IndexedDB**を使用するため、Vercel KVの設定は不要です。ブラウザのローカルストレージにデータが保存されます。

## 注意事項

- GitHub APIの認証トークンが必要です（後で実装予定）
- 現在はIndexedDBのみ対応（Vercel KVは未実装）
