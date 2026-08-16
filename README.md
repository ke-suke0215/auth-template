# Auth Template

Cloudflare Workers、D1、Hono、Better Auth、React を使う個人開発向け認証基盤です。v1 は Google ログインのみを提供します。

## ローカル起動

### Node.jsサポート方針

- 最低対応バージョン: Node.js 24.0.0
- 推奨バージョン: Node.js 24.19.0（`.nvmrc` に記載）

Node.js 24.0.0以上をサポート対象とし、CIではNode.js 24.19.0でtypecheck・test・build・依存関係の脆弱性監査を検証します。

### 前提

- Node.js 24.0.0 以上
- Google ログインを確認する場合は Google Cloud の OAuth クライアント

### 初回セットアップ

プロジェクトのルートディレクトリで実行します。

```sh
npm install
cp .dev.vars.example .dev.vars
```

`.dev.vars` を編集し、以下の値を設定します。`.dev.vars` は Git 管理されません。

```dotenv
BETTER_AUTH_SECRET=32文字以上のランダムな文字列
BETTER_AUTH_URL=http://localhost:5173
GOOGLE_CLIENT_ID=Google OAuth クライアントID
GOOGLE_CLIENT_SECRET=Google OAuth クライアントシークレット
```

`BETTER_AUTH_SECRET` は、次のコマンドで生成できます。

```sh
npx auth@1.6.26 secret
```

Google Cloud Console で OAuth クライアントを作成する場合は、承認済みのリダイレクト URI に次を登録します。

```text
http://localhost:5173/api/auth/callback/google
```

### 起動

認証テーブルをローカル D1 に適用してから、開発サーバーを起動します。

```sh
npm run db:migrate:local
npm run dev
```

ブラウザで [http://localhost:5173/](http://localhost:5173/) を開きます。

開発サーバーを停止するには、起動中のターミナルで `Ctrl+C` を押します。

### 2回目以降の起動

依存パッケージと `.dev.vars` の設定が済んでいれば、次のコマンドだけで起動できます。

```sh
npm run dev
```

## スキーマ変更

認証テーブル・追加フィールド・スキーマを追加するプラグインは `src/auth/schema.ts` に集約しています。変更後は、固定バージョンの Better Auth CLI で SQL を再生成し、差分をレビューしてから新しい Wrangler migration として追加してください。

```sh
npm run auth:generate
```

Better Auth の CLI による `migrate` は使いません。migration の適用は Wrangler D1 Migrations のみが担当します。

## 検証

```sh
npm run typecheck
npm test
npm run build
npm run audit
npm run audit:runtime
```

テストでは、D1 migration をテスト用 D1 に適用し、`GET /api/me` の未認証時の 401 と有効セッション時の 200 を確認します。Google OAuth の実フローは Google Cloud のクライアント情報が必要なため手動確認です。

ブラウザE2Eスモークテストは、ローカルWorker/D1環境を起動して次の画面経路を確認します。

```sh
npx playwright install chromium
npm run e2e
```

E2Eでは`/login`の表示、未認証時の`/`から`/login`への遷移、未知の画面URLでの404画面を確認します。Google OAuthの外部通信は行わず、失敗時は`playwright-report/`または`test-results/`に診断情報を保存します。

### 依存関係の脆弱性監査

CIではruntime依存とdev依存を含むすべての依存関係を `npm run audit` で監査します。`high` または `critical` の脆弱性が1件以上ある場合はCIを失敗させます。dev依存もCI runnerやビルドで実行されるため、判定対象から除外しません。

本番実行依存だけを確認する場合は `npm run audit:runtime` を使用します。更新で解消できない脆弱性を例外扱いにする場合は、Advisory ID、理由、期限、代替策を開発ドキュメントに記録します。
