-- フォロー関係(docs/schema.md §follows どおり)
-- - 主キーを (follower_id, followee_id) の組にして、同じ相手を二重にフォローできないようにする
-- - フォロワー数の集計用に followee_id へインデックスを張る
-- - フォロー関係の閲覧は本人が関係する行のみ。未ログインには件数だけ follow_counts で公開する

-- =========================================================
-- follows
-- =========================================================
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  primary key (follower_id, followee_id),
  constraint follows_no_self check (follower_id <> followee_id)
);

-- フォロワー数の集計用
create index follows_followee_idx on public.follows (followee_id);

alter table public.follows enable row level security;

-- 本人が関係する行(自分がフォローした相手・自分をフォローした相手)だけ読める
create policy "follows_select_related" on public.follows
  for select
  to authenticated
  using (
    follower_id = auth.uid()
    or followee_id = auth.uid()
  );

-- 自分がしたフォローだけ追加できる
create policy "follows_insert_own" on public.follows
  for insert
  to authenticated
  with check (follower_id = auth.uid());

-- 自分がしたフォローだけ解除できる
create policy "follows_delete_own" on public.follows
  for delete
  to authenticated
  using (follower_id = auth.uid());

-- =========================================================
-- 権限
-- =========================================================
revoke all on table public.follows from anon, authenticated, service_role;

grant select on table public.follows to authenticated;
grant insert, delete on table public.follows to authenticated;
grant select, insert, delete on table public.follows to service_role;

-- =========================================================
-- フォロー数・フォロワー数(未ログインにも件数だけ公開する)
-- =========================================================
create or replace function public.follow_counts(target uuid)
returns table (followers_count integer, following_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select count(*)::integer
      from public.follows
      where followee_id = target
    ),
    (
      select count(*)::integer
      from public.follows
      where follower_id = target
    );
$$;

revoke execute on function public.follow_counts(uuid) from public;
grant execute on function public.follow_counts(uuid)
  to anon, authenticated, service_role;
