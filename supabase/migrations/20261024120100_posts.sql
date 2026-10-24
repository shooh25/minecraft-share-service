-- 建築作品
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  description text not null
    check (char_length(btrim(description)) between 1 and 1000),
  images text[] not null
    check (cardinality(images) between 1 and 5),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 一覧の並び順ごとのインデックス（新着 / 人気 / ユーザー別）
create index posts_recent_idx on public.posts (created_at desc, id desc);
create index posts_popular_idx on public.posts (likes_count desc, created_at desc, id desc);
create index posts_author_idx on public.posts (author_id, created_at desc, id desc);

-- RLS
alter table public.posts enable row level security;

-- 未ログインでも読める
create policy "posts_select_all" on public.posts
  for select
  using (true);

-- 自分の投稿のみ。ニックネーム未設定のユーザーは投稿できない
create policy "posts_insert_own" on public.posts
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and btrim(p.nickname) <> ''
    )
  );

-- 本人のみ（ユーザーによる編集は不可）
create policy "posts_delete_own" on public.posts
  for delete
  to authenticated
  using (author_id = auth.uid());

-- 更新時に updated_at を進める
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- 権限
-- 既定の権限でテーブル全体の権限が付く環境でも、下の権限だけが残るようにする
revoke all on table public.posts from anon, authenticated, service_role;

grant select on table public.posts to anon, authenticated;
grant insert, delete on table public.posts to authenticated;
grant select, insert, update, delete on table public.posts to service_role;

-- トリガー関数を RPC(PostgREST)経由で呼べないようにする
revoke execute on function public.set_updated_at() from public, anon, authenticated;
