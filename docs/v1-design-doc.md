# 個人開発向け認証基盤

## 目的

- Cloudflare上で動く、個人開発用の認証付きアプリ基盤を作る
- v1ではローカル環境でGoogleログインが動作することを確認する
- v1の認証方式はGoogleログインのみとする
- Googleログインによる初回ログイン時にユーザーを作成し、2回目以降は同じユーザーとしてログインする
- 将来、メールアドレス・パスワード認証やGitHubなどのOAuthプロバイダを追加できる構成にする
- v1では以下の画面を作る
  - `/login`: Googleログインを開始する
  - `/`: 認証済みAPIから取得したユーザー情報を表示する
  - `*`: 404画面

## 採用する技術

### フロントエンド

- TypeScript
- React
  - 画面・UIコンポーネントを作る
- Vite
  - ローカル開発サーバー、HMR、Reactのビルド
  - Cloudflare Vite pluginを使い、ReactとWorkerを同じ開発サーバーで動かす
- React Router（Declarative Mode）
  - `/login`、`/` の画面遷移とURL管理
  - Framework Mode / Remix相当の機能は初期版では採用しない

### バックエンド

- Cloudflare Workers
  - API、認証処理、デプロイ先
- Cloudflare Workers Static Assets
  - React SPAのHTML、JavaScript、CSSなどを配信する
- Hono
  - HTTPルーティング、ミドルウェア、アプリ固有APIの実装
- Better Auth
  - Googleの組み込みSocial Provider
  - 将来のメールアドレス・パスワード認証
  - 将来のOAuthプロバイダ追加
  - ユーザー、アカウント、セッション管理
  - HttpOnly Cookieによるセッション認証
- Cloudflare D1
  - Better Authの `user`、`account`、`session`、`verification` などの認証データを保存
  - アプリ固有データも保存する

## 認証・API通信の責務分離

### Better Auth

- `/api/auth/*` を担当する
- Google OAuthによる登録・ログインを担当する
- ログアウトとセッション管理を担当する
- React側ではBetter Auth Clientを使う
  - Googleログイン開始
  - ログアウト
  - セッション取得

### Hono

- Better Authの認証処理は実装しない
- v1では認証済みユーザー情報を返すAPIを担当する
  - `GET /api/me`
- 将来のアプリ固有APIも担当する
  - 例: `/api/posts`、`/api/settings`
- `/api/me`を含む認証が必要なAPIでは、Better Authのセッションを必ず検証する
- 未ログインなら `401 Unauthorized` を返す

### Hono RPC

- Better Authの認証エンドポイントには使わない
- v1の`/api/me`と将来のアプリ固有APIで使う
- `hono/client` でHono APIの型をReact側へ共有する
- 入力値があるAPIではZodで検証する

### 同一オリジン

- ReactとWorkerは同一オリジンで配信する
  - React: 画面
  - Better Auth: `/api/auth/*`
  - Hono: `/api/me`と将来のアプリ固有 `/api/*`
- 初期版ではCORS設定を不要にし、Cookieを単純に扱う

## 認証設計

### アカウントリンク方針

- v1ではGoogleログインのみのため、複数認証方式のアカウントリンクは扱わない
- メールアドレス・パスワード認証を追加するv2以降で、メールアドレス検証を含めたアカウントリンク方針を改めて決定する
- `user` はユーザー本体を表す
- `account` はGoogleなどの認証方式を表す
- OAuthプロバイダ追加時のアカウントリンクも将来検討する

### Honoの認証ミドルウェア

- `src/auth/schema.ts`に、認証テーブル・追加フィールド・スキーマを追加するプラグインの設定を集約する
- `src/auth/create-auth.ts`で`createAuth(env)`をexportし、Worker実行時のD1 Binding、Secret、Google OAuth設定を`env`から注入する
- `scripts/better-auth.config.ts`をBetter Auth CLI専用の設定ファイルとし、同じ`schema.ts`を読み込んで`auth`をexportする
- CLI用設定はWorkerのリクエスト、D1 Binding、実Secretに依存せず、D1互換のSQLite方言を使ってSQLを生成する
- CLI用設定とWorker用設定の認証テーブル・フィールド設定は`schema.ts`を共有し、差分を持たない
- `auth:generate`スクリプトで、固定したBetter Auth CLIのバージョンと`--config scripts/better-auth.config.ts`を指定する
- `/api/me`を含む認証が必要なAPIでは、`auth.api.getSession()` を使ってセッションを検証する
- React Routerの画面制御だけに依存しない

## DB・マイグレーション

### 初版

- Better AuthのD1ネイティブ接続を使う
- `npm run auth:generate`でBetter Authの認証用スキーマSQLを生成する
- 生成SQLを確認して`migrations/0001_better_auth.sql`としてGit管理する
- `wrangler d1 migrations apply <database_name> --local`でローカルD1へ適用する
- v1ではBetter Auth CLIの`migrate`を実行せず、マイグレーションの適用はWrangler D1 Migrationsだけが行う
- 認証スキーマに影響するBetter Auth設定を変更した場合は、SQLを再生成して差分をレビューしてから新しいWrangler Migrationを追加する
- `/api/me`ではBetter Authのユーザー情報を利用し、アプリ固有テーブルは作成しない

### 将来

- アプリ固有テーブルやリレーションが増えたら、Drizzle ORMを導入する
- Drizzle導入時は、マイグレーションの管理元を一本化する
- 同じテーブル群に対して、Wrangler Migrationsとdrizzle-kitを並行利用しない

## ルーティング

### React Router

- `/login`
  - Googleでログイン
  - ログイン済みなら `/` へ遷移
- `/`
  - `RequireAuth` で画面遷移を保護する
  - 未ログインなら `/login` へ遷移する
  - `/api/me`からユーザー情報を取得する
  - `/api/me`が`401 Unauthorized`を返した場合は`/login`へ遷移する
  - `/api/me`から取得したログイン中ユーザーの`id`と`email`を表示する
  - ログアウト後は`/login`へ遷移する
- `*`
  - 404画面

### Hono

- `/api/auth/*`
  - Better Authの認証エンドポイントとして、`GET`と`POST`を`auth.handler(c.req.raw)`へ委譲する
  - Better Authの前にHonoのbody parserを適用しない
- `GET /api/me`
  - Better Authのセッションを検証する
  - ログイン済みならユーザーの`id`と`email`を返す
  - 未ログインなら`401 Unauthorized`を返す
- その他の`/api/*`
  - 将来のアプリ固有API
  - v1では未定義のAPIとしてJSONの404を返す

### Static AssetsとWorkerのルーティング

- 方式A: CloudflareにStatic Assetsを処理させる
- Static AssetsはSPAとして設定する
  - `not_found_handling: "single-page-application"`
- `/api/*`はStatic Assetsより先にWorkerで処理する
  - `run_worker_first: ["/api/*"]`
- Workerでは以下の順でルーティングする
  1. `/api/auth/*`をBetter Authへ委譲する
  2. `GET /api/me`をHonoで処理する
  3. その他の`/api/*`はJSONの404を返す
  4. その他のパスはWorkerで処理せず、CloudflareのStatic Assetsルーティングに任せる
- Workerから`env.ASSETS.fetch()`は呼び出さないため、Static Assetsの`binding`は設定しない
- SPAの未知の画面URLはCloudflareが`index.html`を返し、React Routerの`*`で404画面を表示する
- この404画面はSPAの画面上の404であり、HTTPステータスは`200 OK`になる

## セキュリティ方針

- JWTをlocalStorageへ保存しない
- Better AuthのDBセッション + HttpOnly Cookieを使う
- Cookieは `HttpOnly`、`SameSite=Lax` を基本とする
- 本番環境では `Secure` を付与する
- ローカルHTTP環境では `Secure` を強制しない
- クロスサイトCookieは初期版では使わない
- Better Authの `baseURL` と `trustedOrigins` はローカル環境を明示する
- Better Authの認証エンドポイントはBetter AuthのCSRF保護に任せる
- v1では更新APIを作らないため、HonoのCSRFミドルウェアは将来の更新API追加時に適用する
- Google OAuthのClient SecretとBetter Auth SecretはローカルのSecretとして管理する
- ローカルWorkerのSecretは `.dev.vars` または `.env` を使い、Gitへ登録しない
- `.env.local` はWorker Secretの保存先として扱わない
- 環境変数名は以下に固定する
  - `BETTER_AUTH_SECRET`: 32文字以上の高エントロピーなSecret
  - `BETTER_AUTH_URL`: `http://localhost:5173`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- 上記のSecretは`VITE_`接頭辞を付けず、Reactのクライアントバンドルへ公開しない
- Google OAuthにはローカル用のCallback URLを登録する
  - `http://localhost:5173/api/auth/callback/google`
- Googleログイン開始時のBetter Auth Clientには`callbackURL: "/"`を指定する

## v1の対象外

- メールアドレス・パスワード認証
- メールアドレス検証
- パスワードリセット
- 二要素認証
- OAuthプロバイダの追加
- 組織・ロール・権限管理
- `/api/me`以外のアプリ固有API
- 本番環境への反映
- Preview環境

メールアドレス・パスワード認証を追加するv2以降では、メールアドレス検証とアカウントリンクを含めて再設計する。

## 開発・デプロイ

- Cloudflare Vite plugin
  - `npm run dev` でReact、Worker、ローカルD1を同じオリジンで起動する
- Wrangler
  - ローカルD1へのマイグレーション適用
- `wrangler.jsonc`
  - D1 Binding
  - Static Assets
  - `/api/*`をWorkerへ送るルール
  - ローカル環境の設定を管理する
- Cloudflare Workers実行設定
  - Better AuthのAsyncLocalStorage対応のため`compatibility_flags: ["nodejs_compat"]`を設定する
  - `compatibility_date`を明示的に固定する
  - `run_worker_first`の配列指定を使うため、Wrangler 4.20以上、Cloudflare Vite plugin 1.7以上を使用する
- v1ではローカル環境のみを対象とし、本番デプロイは行わない
- v1ではPreview環境を用意しない

## 初期実装の順番

1. CloudflareのHono + React + Viteテンプレートを作成する
2. D1 Binding、Static Assets、`/api/*` のWorkerルーティングを設定する
3. Better AuthをD1接続で設定する
4. Better Authの組み込みGoogle Providerを設定する
5. Better Auth用のSQLを生成し、ローカルD1へWrangler D1 Migrationsとして適用する
6. `/api/auth/*` をHonoからBetter Authへ委譲する
7. React Routerで `/login`、`/` を作る
8. Better Auth ClientでGoogleログイン（`callbackURL: "/"`）、ログアウト、セッション取得を実装する
9. Honoに`GET /api/me`とセッション検証を実装する
10. `/`から`/api/me`を呼び出し、ログイン中ユーザーの`id`と`email`を表示する
11. Vitestと `@cloudflare/vitest-pool-workers` でD1、`/api/me`の`401`/`200`をテストする
    - Google OAuthの実フローを自動化するテストはTODOとする
12. ローカルのGoogle Callback URLを設定する

## v1の完了条件

- `npm run dev`でReact、Worker、ローカルD1が起動する
- `/login`からGoogleログインを開始できる
- Googleログイン後に`/`へ遷移する
- 初回ログイン時にD1へユーザーが作成される
- `/`が`/api/me`から取得したユーザーの`id`と`email`を表示する
- 未ログインで`/api/me`へアクセスすると`401 Unauthorized`になる
- ログアウト後に`/api/me`へアクセスすると`401 Unauthorized`になる
- `/api/*`以外の未知のURLはSPAとして処理され、React Routerの404画面が表示される
