-- ブックマーク
-- - 主キーを (post_id, user_id) の組にして、同じ作品を二重にブックマークできないようにする
-- - 自分の一覧をブックマークした順に取得するため (user_id, created_at desc) にインデックスを張る
-- - ブックマークされた数は保存・集計・公開しない
-- - 一覧は本人のみ。未ログイン(anon)にはテーブル権限自体を与えない

-- =========================================================
-- bookmarks
-- =========================================================
create table public.bookmarks (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 自分のブックマーク一覧(ブックマークした日時の新しい順)の取得用
create index bookmarks_user_idx
  on public.bookmarks (user_id, created_at desc, post_id desc);

alter table public.bookmarks enable row level security;

-- 自分のブックマークだけ読める(他のユーザーの一覧は取得できない)
create policy "bookmarks_select_own" on public.bookmarks
  for select
  to authenticated
  using (user_id = auth.uid());

-- 自分としてしか追加できない
create policy "bookmarks_insert_own" on public.bookmarks
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- 自分のブックマークだけ解除できる(作品の投稿者に関係なく解除できる)
create policy "bookmarks_delete_own" on public.bookmarks
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 権限
-- =========================================================
revoke all on table public.bookmarks from anon, authenticated, service_role;

-- 未ログインには権限を与えない(存在も件数も推測できない)
grant select, insert, delete on table public.bookmarks to authenticated;
grant select, insert, delete on table public.bookmarks to service_role;
