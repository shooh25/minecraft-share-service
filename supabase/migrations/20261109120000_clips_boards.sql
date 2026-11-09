-- クリップ(保存した作品)とボード(クリップの保存先)
-- - 「すべてのクリップ」はボードを持たない仮想一覧で、clips 全体を表示する
-- - 1つのクリップは複数のボードに入れられる
-- - ボードを削除してもクリップ自体は削除しない
-- - クリップを解除すると、その作品のボード所属も CASCADE で削除する
-- - 一覧・ボードは本人のみ。未ログイン(anon)にはテーブル権限自体を与えない

-- =========================================================
-- bookmarks -> clips
-- =========================================================
alter table public.bookmarks rename to clips;
alter index public.bookmarks_user_idx rename to clips_user_idx;

alter policy "bookmarks_select_own" on public.clips
  rename to "clips_select_own";
alter policy "bookmarks_insert_own" on public.clips
  rename to "clips_insert_own";
alter policy "bookmarks_delete_own" on public.clips
  rename to "clips_delete_own";

-- =========================================================
-- boards
-- =========================================================
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 50),
  created_at timestamptz not null default now(),
  -- board_clips から (id, user_id) の複合外部キーで参照する
  constraint boards_id_user_key unique (id, user_id)
);

-- 自分のボード一覧(作成した日時の新しい順)の取得用
create index boards_user_idx
  on public.boards (user_id, created_at desc, id desc);

alter table public.boards enable row level security;

-- 自分のボードだけ読める
create policy "boards_select_own" on public.boards
  for select
  to authenticated
  using (user_id = auth.uid());

-- 自分としてしか作成できない
create policy "boards_insert_own" on public.boards
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- 自分のボードだけ名前を変更できる
create policy "boards_update_own" on public.boards
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 自分のボードだけ削除できる
create policy "boards_delete_own" on public.boards
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- board_clips (ボード所属)
-- =========================================================
create table public.board_clips (
  board_id uuid not null,
  user_id uuid not null,
  post_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (board_id, post_id),
  -- 自分のボードにしか追加できない
  constraint board_clips_board_fkey
    foreign key (board_id, user_id)
    references public.boards (id, user_id) on delete cascade,
  -- 保存(クリップ)していない作品は追加できない。解除時は所属も消える
  constraint board_clips_clip_fkey
    foreign key (post_id, user_id)
    references public.clips (post_id, user_id) on delete cascade
);

-- ボード内の一覧(追加した日時の新しい順)の取得用
create index board_clips_board_idx
  on public.board_clips (board_id, created_at desc, post_id desc);

-- クリップ解除時の CASCADE 用
create index board_clips_clip_idx
  on public.board_clips (post_id, user_id);

alter table public.board_clips enable row level security;

-- 自分のボード所属だけ読める
create policy "board_clips_select_own" on public.board_clips
  for select
  to authenticated
  using (user_id = auth.uid());

-- 自分としてしか追加できない
create policy "board_clips_insert_own" on public.board_clips
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- 自分のボード所属だけ削除できる
create policy "board_clips_delete_own" on public.board_clips
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 権限
-- =========================================================
-- clips は bookmarks から改名したため、既存の権限をそのまま引き継ぐ
revoke all on table public.boards, public.board_clips
  from anon, authenticated, service_role;

-- 改名できるのは名前だけに限定する
grant select, insert, delete on table public.boards to authenticated;
grant update (name) on table public.boards to authenticated;
grant select, insert, delete on table public.board_clips to authenticated;

grant select, insert, update, delete on table public.boards to service_role;
grant select, insert, delete on table public.board_clips to service_role;
