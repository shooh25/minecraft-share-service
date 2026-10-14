# Architecture Design

## 1. Overview & Tech Stack

本システムは、Minecraftの建築画像を投稿・閲覧・リアクションできるSNSである。初期リリース（MVP）では、工数を抑えつつ拡張性を保てるモノリシックな構成を採用する。

### 採用技術
- **Frontend / Application**: Next.js App Router (TypeScript, Tailwind CSS)
- **Authentication**: Supabase Auth (X / Twitter OAuth 2.0 のみ)
- **Database**: Supabase PostgreSQL
- **Object Storage**: Cloudflare R2 (S3互換API)
- **Hosting**: Vercel

### コンポーネント構成
```
[Browser]
   │
   ├── (1) ページ表示 / 操作 ─────────► [Next.js (Vercel)]
   │                                        │
   │                                        ├── (2) 認証・セッション管理 ──► [Supabase Auth (X OAuth)]
   │                                        │
   │                                        ├── (3) データ読み書き/RLS ───► [Supabase PostgreSQL]
   │                                        │
   │   ◄── (4) 署名付きアップロードURL発行 ───┘
   │
   └── (5) 画像直接アップロード ─────────► [Cloudflare R2]
```

---

## 2. Authentication & Authorization

### 2.1 認証プロバイダー
- **X (Twitter) OAuth 2.0 のみに限定**する。
- ユーザー識別子は Supabase Auth の `UID` (UUID) を主キーとする。
- Xから取得した情報（ユーザー名 `@handle`、表示名、アバター画像URL）は、初回ログイン時に `profiles` テーブルへ自動同期する。

### 2.2 Next.js App Router との統合
- `@supabase/ssr` パッケージを用いた PKCE (Proof Key for Code Exchange) フローを採用。
- コールバックエンドポイント（`app/auth/callback/route.ts`）で認可コードをセッションと交換し、Cookieにセッション情報を保持する。
- Server Components / Server Actions では `auth.getUser()` によりセッションと本人性を検証する。

### 2.3 認可・アクセス制御
- PostgreSQLの **Row Level Security (RLS)** を全テーブルで有効化。
- 投稿・いいね・コメントの作成・更新・削除は、セッションの `auth.uid()` とレコード所有者の一致をDBレベルで強制する。

---

## 3. Data Flow

### 3.1 認証フロー (X OAuth)
1. ユーザーが「Xでログイン」を実行。
2. Supabase Auth (`signInWithOAuth({ provider: 'twitter' })`) によりXの認可画面へ遷移。
3. 連携承認後、`/auth/callback?code=...` へリダイレクト。
4. サーバー側（Route Handler）でコードをセッションと交換し、Cookieを設定。
5. 初回認証時は `profiles` レコードを自動作成・更新後、遷移先へリダイレクト。

### 3.2 投稿・画像アップロードフロー
1. ユーザーが投稿情報（タイトル、説明、タグ等）と画像ファイルを選択。
2. サーバー（Server Actions / Route Handlers）で認証および入力検証（ファイルサイズ・形式）を実施。
3. サーバー側で R2 の署名付きアップロードURL（Presigned PUT URL）を発行してクライアントへ返す。
4. ブラウザから Cloudflare R2 へ画像を直接アップロード（Vercelの転送制限・負荷を回避）。
5. アップロード完了後、サーバー側で PostgreSQL に投稿データと画像メタデータ（オブジェクトキー等）を保存。
6. 投稿詳細ページへ遷移。

### 3.3 投稿閲覧フロー
- 公開投稿は未認証ユーザーでも閲覧可能。
- 詳細ページは固有URLを持ち、OGP/SEOメタデータをサーバーサイドで動的生成。
- 一覧はページネーションまたはカーソル方式で取得。

### 3.4 リアクション（いいね・コメント）
- いいねは `(user_id, post_id)` のユニーク制約により重複を防止。
- 書き込み処理は Server Actions で実行し、`auth.uid()` を検証。

### 3.5 投稿削除フロー
1. サーバー側で投稿者本人であることを検証。
2. PostgreSQLの投稿レコードを削除（CASCADEにより紐づくいいね・コメントも削除）。
3. サーバー側（AWS SDK S3クライアント）から Cloudflare R2 上の該当画像オブジェクトを削除。

---

## 4. Image Storage (Cloudflare R2)

- **保存方式**: 画像本体は Cloudflare R2 に保存し、DBにはオブジェクトキーとメタデータのみを保持。
- **オブジェクトキー規約**: `posts/{userId}/{uuid}.{ext}`（ユーザー入力ファイル名は使用しない）。
- **制限事項**:
  - 許容形式: JPEG, PNG, WebP
  - 許容サイズ: 1ファイルあたり最大 10MB
- **配信方式**: R2の公開バケットURL（またはカスタムドメインCDN）から直接配信し、長期キャッシュ（`Cache-Control`）を設定。

---

## 5. Database & Integrity

- **マイグレーション**: Supabase CLI によるバージョン管理されたマイグレーションファイルでスキーマを管理。
- **データ整合性**:
  - 外部キー制約と適切なインデックス（`user_id`, `created_at` 等）を設定。
  - いいねの多重登録防止は `UNIQUE(user_id, post_id)` 制約で担保。
- **機密情報保護**:
  - `SUPABASE_SERVICE_ROLE_KEY` や R2のアクセスキー（S3 Access/Secret Key）はサーバーサイド環境変数に秘匿し、ブラウザには絶対に露出させない。

---

## 6. Future Considerations (MVP以降)

MVPでは最小限の構成を維持し、ユーザー増やトラフィック増加に応じて以下を段階的に検討する。
- Cloudflare Workers / Images を利用したサムネイル自動生成・画像最適化
- 検索機能（タグ・全文検索）の強化
- API / 画像アップロードのエンドポイントに対するレート制限
