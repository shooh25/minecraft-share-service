-- 既存の post_comments を拡張して返信に対応する
--   parent_id = 実際の返信先 / root_id = スレッドの親コメント
-- - 親コメントを削除すると返信も CASCADE で削除する(「削除されました」は残さない)
-- - 件数は posts.comments_count を INSERT / DELETE トリガーで加減算する(返信も含む)
-- - 返信数は列に持たず、root_id の COUNT(*) で都度集計する

-- =========================================================
-- post_comments(既存テーブル。無ければ作る)
-- =========================================================
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 返信先とスレッドの親
alter table public.post_comments
  add column if not exists parent_id uuid,
  add column if not exists root_id uuid;

-- 制約(既存テーブルには付いていないため、未追加のときだけ追加する)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.post_comments'::regclass
      and conname = 'post_comments_post_id_id_key'
  ) then
    alter table public.post_comments
      -- 返信先・スレッド親が同じ投稿のコメントであることを複合外部キーで保証する
      add constraint post_comments_post_id_id_key unique (post_id, id),
      add constraint post_comments_content_length
        check (char_length(btrim(content)) between 1 and 500),
      -- トップレベルは parent_id / root_id ともに NULL、返信は両方 NOT NULL
      add constraint post_comments_reply_pair check (
        (parent_id is null and root_id is null)
        or (parent_id is not null and root_id is not null)
      ),
      -- 自分自身を返信先・スレッド親にはできない
      add constraint post_comments_no_self_reply check (
        parent_id is distinct from id and root_id is distinct from id
      ),
      add constraint post_comments_parent_fkey
        foreign key (post_id, parent_id)
        references public.post_comments (post_id, id) on delete cascade,
      add constraint post_comments_root_fkey
        foreign key (post_id, root_id)
        references public.post_comments (post_id, id) on delete cascade;
  end if;
end;
$$;

-- =========================================================
-- インデックス
-- =========================================================
-- トップレベルの一覧(新しい順)。post_id への外部キー削除にも使う
drop index if exists public.post_comments_post_id_idx;
create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at desc, id desc);

-- スレッド内の返信(古い順)と返信数の集計
create index if not exists post_comments_root_idx
  on public.post_comments (root_id, created_at asc, id asc)
  where root_id is not null;

-- 自分のコメント取得用
drop index if exists public.post_comments_user_id_idx;
create index if not exists post_comments_user_idx
  on public.post_comments (user_id, created_at desc, id desc);

-- =========================================================
-- root_id の自動設定
-- =========================================================
create or replace function public.set_comment_root()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_root uuid;
begin
  if new.parent_id is null then
    new.root_id := null;
    return new;
  end if;

  select c.root_id into parent_root
  from public.post_comments c
  where c.id = new.parent_id;

  -- 返信先がトップレベルならそのコメントがスレッドの親になる
  new.root_id := coalesce(parent_root, new.parent_id);
  return new;
end;
$$;

drop trigger if exists post_comments_set_root on public.post_comments;
create trigger post_comments_set_root
  before insert on public.post_comments
  for each row execute function public.set_comment_root();

-- =========================================================
-- RLS
-- =========================================================
alter table public.post_comments enable row level security;

drop policy if exists "post_comments_select_all" on public.post_comments;
drop policy if exists "post_comments_select_own" on public.post_comments;
drop policy if exists "post_comments_insert_own" on public.post_comments;
drop policy if exists "post_comments_delete_own" on public.post_comments;

-- コメントは全員が読める
create policy "post_comments_select_all" on public.post_comments
  for select
  to anon, authenticated
  using (true);

-- 自分としてのみ投稿できる。ニックネーム未設定のユーザーは投稿できない
create policy "post_comments_insert_own" on public.post_comments
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and btrim(p.nickname) <> ''
    )
  );

-- 自分のコメント、または自分の作品へのコメントを削除できる
create policy "post_comments_delete_own_or_post_author" on public.post_comments
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.author_id = auth.uid()
    )
  );

-- =========================================================
-- 権限(既存テーブルには権限が無いため付与し直す)
-- =========================================================
revoke all on table public.post_comments from anon, authenticated, service_role;

grant select on table public.post_comments to anon, authenticated;
grant insert, delete on table public.post_comments to authenticated;
grant select, insert, delete on table public.post_comments to service_role;

-- =========================================================
-- posts.comments_count の加減算(返信も含む)
-- =========================================================
-- 既存の関数は SECURITY DEFINER でないため、投稿権限のユーザーでは posts を更新できない
create or replace function public.update_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set comments_count = comments_count + 1
    where id = new.post_id;

    return new;
  end if;

  update public.posts
  set comments_count = comments_count - 1
  where id = old.post_id;

  return old;
end;
$$;

drop trigger if exists post_comments_insert_count on public.post_comments;
create trigger post_comments_insert_count
  after insert on public.post_comments
  for each row execute function public.update_post_comments_count();

drop trigger if exists post_comments_delete_count on public.post_comments;
create trigger post_comments_delete_count
  after delete on public.post_comments
  for each row execute function public.update_post_comments_count();

-- トリガー関数を RPC(PostgREST)経由で呼べないようにする
revoke execute on function public.set_comment_root() from public, anon, authenticated;
revoke execute on function public.update_post_comments_count() from public, anon, authenticated;
