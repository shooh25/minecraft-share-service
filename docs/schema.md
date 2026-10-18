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


## RLS ポリシー（要約）

| テーブル | SELECT | INSERT | UPDATE / DELETE |
|---|---|---|---|
| profiles | 本人（auth.uid() = id） | 未使用（トリガーで自動作成） | 本人 |
| posts | 全員 | 認証済み | 本人 |
| comments | 全員 | 認証済み | 本人・作品作者・管理者 |
| likes | 全員 | 認証済み（UNIQUE(user_id, post_id) で多重防止） | 本人 |

- INSERT は「認証済みかつ ニックネーム設定済み」ユーザーのみ（RLS で profiles JOIN 判定）。
- posts / comments / likes の詳細カラムは実装時に追記する。
