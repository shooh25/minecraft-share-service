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


## タグ

| テーブル | カラム |
|---|---|
| tags | id (PK) / name（NOT NULL UNIQUE） |
| post_tags | post_id FK → posts（CASCADE）/ tag_id FK → tags（CASCADE）/ PK = (post_id, tag_id) |

- タグ名は投稿時に `name` で upsert → id 化（重複・表記ゆれの防止）
- `post_tags(tag_id)` にインデックス（タグ → 作品一覧の検索用）
- チップ表示の件数（count）は保存せず、`post_tags` の GROUP BY で都度集計（上位20件を表示）

## RLS ポリシー（要約）

| テーブル | SELECT | INSERT | UPDATE / DELETE |
|---|---|---|---|
| profiles | 本人（auth.uid() = id） | 未使用（トリガーで自動作成） | 本人 |
| posts | 全員 | 認証済み | 本人 |
| comments | 全員 | 認証済み | 本人・作品作者・管理者 |
| likes | 全員 | 認証済み（UNIQUE(user_id, post_id) で多重防止） | 本人 |
| tags | 全員 | 認証済み（投稿処理時の upsert） | 未使用 |
| post_tags | 全員 | 本人の投稿に対してのみ | 未使用（CASCADE） |

- INSERT は「認証済みかつ ニックネーム設定済み」ユーザーのみ（RLS で profiles JOIN 判定）。
- テーブル権限は各マイグレーションで明示的に GRANT する。
- posts / comments / likes の詳細カラムは実装時に追記する。
