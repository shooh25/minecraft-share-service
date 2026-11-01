-- いいね
-- - 主キーを (post_id, user_id) の組にして、同じ作品を二重にいいねできないようにする
-- - 自分のいいね一覧を新しい順に取得するため (user_id, created_at desc) にインデックスを張る
-- - posts.likes_count は likes の INSERT / DELETE トリガーで加減算する
-- - 誰がいいねしたかは本人にしか公開しない(件数のみ posts.likes_count で公開する)

-- =========================================================
-- likes
-- =========================================================
create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 自分のいいね一覧(いいねした日時の新しい順)の取得用
create index likes_user_idx
  on public.likes (user_id, created_at desc, post_id desc);

alter table public.likes enable row level security;

-- 自分のいいねだけ読める(他のユーザーの一覧は取得できない)
create policy "likes_select_own" on public.likes
  for select
  to authenticated
  using (user_id = auth.uid());

-- 自分としてしか追加できない
create policy "likes_insert_own" on public.likes
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- 自分のいいねだけ解除できる(作品の投稿者に関係なく解除できる)
create policy "likes_delete_own" on public.likes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 権限
-- =========================================================
revoke all on table public.likes from anon, authenticated, service_role;

-- 未ログインには権限を与えない(いいね数は posts.likes_count を参照する)
grant select, insert, delete on table public.likes to authenticated;
grant select, insert, delete on table public.likes to service_role;

-- =========================================================
-- posts.likes_count の加減算
-- =========================================================
create or replace function public.sync_likes_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set likes_count = likes_count + 1
    where id = new.post_id;

    return new;
  end if;

  update public.posts
  set likes_count = likes_count - 1
  where id = old.post_id;

  return old;
end;
$$;

create trigger likes_sync_count
  after insert or delete on public.likes
  for each row execute function public.sync_likes_count();

-- トリガー関数を RPC(PostgREST)経由で呼べないようにする
revoke execute on function public.sync_likes_count() from public, anon, authenticated;
