-- タグ(docs/schema.md §タグ どおり)
-- - 作品に付けるラベル名の一覧。名前に UNIQUE 制約を付けて重複・表記ゆれを防ぐ
-- - タグは運営側で用意する固定カタログ。ユーザーは投稿作成時に既存タグを選ぶだけで、新規作成はできない

-- =========================================================
-- tags
-- =========================================================
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

alter table public.tags enable row level security;

-- 全員が読める
create policy "tags_select_all" on public.tags
  for select
  using (true);

-- タグの追加・変更は運営側の手順(service_role の手順や管理スクリプト)で行う

-- =========================================================
-- 権限
-- このプロジェクトでは新規テーブルの自動公開がされないため、必要な権限を明示する。
-- =========================================================
grant select on table public.tags to anon, authenticated, service_role;
grant insert on table public.tags to service_role;
