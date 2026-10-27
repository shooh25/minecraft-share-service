# データモデル・スキーマ設計 (Schema)

## 方針

保存するユーザーデータは **内部UUID・GoogleアカウントID（`sub`）・ニックネーム・アバター画像** のみ。

## 認証ユーザー（auth.users / auth.identities）

Supabase Auth が管理する。アプリから直接扱わない。マイグレーションで DBトリガーを定義し、
INSERT / UPDATE 時にメタデータ（`raw_user_meta_data` / `identity_data`）を `sub` のホワイトリストに絞る。

## profiles

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | FK → auth.users.id, ON DELETE CASCADE |
| nickname | text | NOT NULL。ユーザー入力の表示名。**重複可** |
| avatar_key | text | NULL 可。R2のオブジェクトキー。未設定は NULL（空文字は不可） |

- 初回ログイン時にトリガーで自動作成する（nickname は空文字で作成し、設定画面で UPDATE する）
- SELECT は全員に開放する（作品一覧・作品詳細で作者名・アバターを表示するため）。UPDATE は本人のみ
- ユーザーが UPDATE できる列は `nickname` と `avatar_key` に限定する
- アバターは外部URLではなく R2 のオブジェクトキーで保持し、配信URLはアプリ側で組み立てる


## posts

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK, 自動生成。URL `/builds/{id}` に使用 |
| author_id | uuid | FK → profiles.id, ON DELETE CASCADE。投稿者 |
| description | text | NOT NULL。作品説明(1〜1000文字、空白のみ不可)。タイトルは持たない |
| images | text[] | NOT NULL。R2のオブジェクトキーを1〜5件。配列順が表示順 |
| likes_count | integer | NOT NULL, 初期 0, 非負。人気順の並び替えに使用 |
| comments_count | integer | NOT NULL, 初期 0, 非負。作品カードのコメント数表示に使用 |
| created_at | timestamptz | NOT NULL, 初期 now()。新着順の並び替えに使用 |
| updated_at | timestamptz | NOT NULL, 初期 now()。UPDATE 時にトリガーで更新 |
| search_text | text | NOT NULL。検索用に「説明・タグ名・作者ニックネーム」を空白で連結した文字列。トリガーで自動更新する |

- インデックス: `(created_at desc, id desc)` / `(likes_count desc, created_at desc, id desc)` / `(author_id, created_at desc, id desc)`
- 投稿後のユーザーによる編集は不可（UPDATE ポリシーなし）。変更できるのは service_role のみ
- 画像の件数制約は `cardinality(images)` で判定する（空配列は `array_length` だと NULL になるため）

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
- 投稿後のユーザー操作は**追加のみ**。解除・付け替えは不可で、行は投稿またはタグの削除時に CASCADE で削除される
- 1投稿につき**最大10個**

## likes

| カラム | 型 | 説明 |
|---|---|---|
| post_id | uuid | FK → posts.id, ON DELETE CASCADE / 主キーは (post_id, user_id) の組 |
| user_id | uuid | FK → profiles.id, ON DELETE CASCADE |
| created_at | timestamptz | NOT NULL, 初期 now() |

- 主キーが2列の組のため、**同一ユーザーが同じ作品に複数回いいねできない**
- `likes(user_id)` にインデックス（退会時の CASCADE・自分がいいねした作品の取得用）
- `posts.likes_count` は likes の INSERT / DELETE トリガーで加減算する（DB内で加算するため同時実行でもずれない）

## RLS ポリシー（要約）

| テーブル | SELECT | INSERT | UPDATE / DELETE |
|---|---|---|---|
| profiles | 全員 | 未使用（トリガーで自動作成） | UPDATE 本人（`nickname` / `avatar_key` の列単位）/ DELETE なし |
| posts | 全員 | 認証済み かつ ニックネーム設定済み | DELETE 本人（UPDATE なし） |
| post_tags | 全員 | 自分の作品に対してのみ | DELETE なし（投稿・タグ削除時は CASCADE、service_role は可）/ UPDATE なし |
| likes | 本人 | 認証済み（`user_id = auth.uid()`） | DELETE 本人（UPDATE なし） |
| tags | 全員 | なし（追加は運営側が service_role で行う） | 未使用 |

- 投稿・タグ付け・いいねの INSERT は `auth.uid()` と所有者の一致を条件にする。
- テーブル権限は各マイグレーションで明示的に GRANT / REVOKE する。
