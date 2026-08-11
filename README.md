# Auth Template

Cloudflare Workers、D1、Hono、Better Auth、React を使う個人開発向け認証基盤です。v1 は Google ログインのみを提供します。

## ローカル開発

Node.js 22.13 以上を用意してから、依存パッケージをインストールします。

```sh
npm install
```

`.dev.vars.example` を `.dev.vars` にコピーし、以下を設定します。`.dev.vars` は Git 管理されません。

```dotenv
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`BETTER_AUTH_SECRET` には 32 文字以上の高エントロピーな値を設定してください。生成には `npx auth@1.6.26 secret` を使えます。

Google Cloud Console で OAuth クライアントを作成し、承認済みのリダイレクト URI に次を登録します。

```
http://localhost:5173/api/auth/callback/google
```

認証テーブルをローカル D1 に適用して、開発サーバーを起動します。

```sh
npm run db:migrate:local
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
```

テストでは、D1 migration をテスト用 D1 に適用し、`GET /api/me` の未認証時の 401 と有効セッション時の 200 を確認します。Google OAuth の実フローは Google Cloud のクライアント情報が必要なため手動確認です。
