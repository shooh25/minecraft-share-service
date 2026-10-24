# データモデル・スキーマ設計 (Schema)

## 方針

保存するユーザーデータは **内部UUID・GoogleアカウントID（`sub`）・ニックネーム** のみ。

## 認証ユーザー（auth.users / auth.identities）

Supabase Auth が管理する。アプリから直接扱わない。マイグレーションで DBトリガーを定義し、
INSERT / UPDATE 時にメタデータ（`raw_user_meta_data` / `identity_data`）を `sub` のホワイトリストに絞る。

## profiles

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | FK → auth.users.id, ON DELETE CASCADE |
| nickname | text | NOT NULL。ユーザー入力の表示名。**重複可** |


## posts

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK, 自動生成 |
| author_id | uuid | FK → auth.users.id, ON DELETE CASCADE。投稿者 |
| slug | text | NOT NULL UNIQUE。URL `/builds/{slug}` に使用 |
| description | text | NOT NULL。作品説明 |
| images | jsonb | NOT NULL。画像URLの配列(実体は Cloudflare R2) |
| likes_count | integer | NOT NULL, 初期 0。人気順の並び替えに使用 |
| created_at | timestamptz | NOT NULL, 初期 now()。新着順の並び替えに使用 |

## tags

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK, 自動生成 |
| name | text | NOT NULL UNIQUE。タグ名 |

- 運営側で用意する固定カタログ。ユーザーは投稿作成時に**既存タグを選ぶ**のみ（新規作成不可、UNIQUE で重複・表記ゆれを構造的に防ぐ）

## post_tags

| カラム | 型 | 説明 |
|---|---|---|
| post_id | uuid | FK → posts.id, ON DELETE CASCADE / 主キーは (post_id, tag_id) の組 |
| tag_id | uuid | FK → tags.id, ON DELETE CASCADE |

- 主キーが2列の組のため、**同じ作品に同じタグを2回付けられない**
- `post_tags(tag_id)` にインデックス（タグ → 作品一覧の検索用）
- タグの件数（count）は保存せず、`post_tags` の GROUP BY で都度集計

## RLS ポリシー（要約）

| テーブル | SELECT | INSERT | UPDATE / DELETE |
|---|---|---|---|
| profiles | 本人（auth.uid() = id） | 未使用（トリガーで自動作成） | 本人 |
| posts | 全員 | 認証済み | 本人 |
| comments | 全員 | 認証済み | 本人・作品作者・管理者 |
| likes | 全員 | 認証済み（UNIQUE(user_id, post_id) で多重防止） | 本人 |
| tags | 全員 | なし（追加は運営側が service_role で行う） | 未使用 |
| post_tags | 全員 | 本人の投稿に対してのみ | 未使用（CASCADE） |

- INSERT は「認証済みかつ ニックネーム設定済み」ユーザーのみ（RLS で profiles JOIN 判定）。
- テーブル権限は各マイグレーションで明示的に GRANT する。
