-- クリップは必ずコレクションに保存する(ArtStation 方式)
-- - ボードをコレクションに改名する
-- - クリップはコレクションへ追加した時点で作られ、単独では存在できない
-- - コレクションから最後の1件を外すと、そのクリップも解除される
-- - 既存のクリップは、ユーザーごとの「保存した作品」コレクションへ移行する
-- - コレクション・クリップは本人のみ。未ログイン(anon)にはテーブル権限自体を与えない

-- =========================================================
-- boards -> collections
-- =========================================================
alter table public.boards rename to collections;
alter table public.collections rename constraint boards_pkey to collections_pkey;
alter table public.collections rename constraint boards_id_user_key to collections_id_user_key;
alter table public.collections rename constraint boards_name_check to collections_name_check;
alter index public.boards_user_idx rename to collections_user_idx;

alter policy "boards_select_own" on public.collections
  rename to "collections_select_own";
alter policy "boards_insert_own" on public.collections
  rename to "collections_insert_own";
alter policy "boards_update_own" on public.collections
  rename to "collections_update_own";
alter policy "boards_delete_own" on public.collections
  rename to "collections_delete_own";

-- =========================================================
-- board_clips -> collection_clips
-- =========================================================
alter table public.board_clips rename to collection_clips;
alter table public.collection_clips rename column board_id to collection_id;
alter table public.collection_clips rename constraint board_clips_pkey to collection_clips_pkey;
alter table public.collection_clips
  rename constraint board_clips_board_fkey to collection_clips_collection_fkey;
alter table public.collection_clips
  rename constraint board_clips_clip_fkey to collection_clips_clip_fkey;
alter index public.board_clips_board_idx rename to collection_clips_collection_idx;
alter index public.board_clips_clip_idx rename to collection_clips_clip_idx;

alter policy "board_clips_select_own" on public.collection_clips
  rename to "collection_clips_select_own";
alter policy "board_clips_insert_own" on public.collection_clips
  rename to "collection_clips_insert_own";
alter policy "board_clips_delete_own" on public.collection_clips
  rename to "collection_clips_delete_own";

-- =========================================================
-- 既存クリップの移行
-- =========================================================
-- どのコレクションにも入っていないクリップを、ユーザーごとの
-- 「保存した作品」コレクションへ移す。すでにコレクションに入っている
-- クリップはそのまま残す。
with orphan_clips as (
  select c.user_id, c.post_id, c.created_at
  from public.clips c
  where not exists (
    select 1
    from public.collection_clips cc
    where cc.user_id = c.user_id
      and cc.post_id = c.post_id
  )
),
default_collections as (
  insert into public.collections (user_id, name, created_at)
  select user_id, '保存した作品', min(created_at)
  from orphan_clips
  group by user_id
  returning id, user_id
)
insert into public.collection_clips (collection_id, user_id, post_id, created_at)
select d.id, o.user_id, o.post_id, o.created_at
from orphan_clips o
join default_collections d on d.user_id = o.user_id;

-- =========================================================
-- クリップはコレクションへの追加でのみ作る
-- =========================================================
-- コレクションへ追加されたら、同じトランザクションでクリップを作る。
-- これにより「コレクションに属さないクリップ」は作られない。
create or replace function public.create_clip_for_collection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.clips (post_id, user_id, created_at)
  values (new.post_id, new.user_id, new.created_at)
  on conflict (post_id, user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.create_clip_for_collection() from public;

create trigger collection_clips_create_clip
  before insert on public.collection_clips
  for each row execute function public.create_clip_for_collection();

-- コレクションから外れて、どのコレクションにも属さなくなったら
-- そのクリップも解除する。
create or replace function public.delete_clip_without_collection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.clips c
  where c.post_id = old.post_id
    and c.user_id = old.user_id
    and not exists (
      select 1
      from public.collection_clips cc
      where cc.post_id = old.post_id
        and cc.user_id = old.user_id
    );

  return old;
end;
$$;

revoke all on function public.delete_clip_without_collection() from public;

create trigger collection_clips_delete_clip
  after delete on public.collection_clips
  for each row execute function public.delete_clip_without_collection();

-- =========================================================
-- 権限
-- =========================================================
-- クリップの追加は collection_clips 経由に限定する。
-- 解除は clips の削除(所属も CASCADE)で行う。
drop policy if exists "clips_insert_own" on public.clips;
revoke insert on table public.clips from authenticated, service_role;

-- 作成日時やIDをクライアントに決めさせない
revoke insert on table public.collections from authenticated;
grant insert (user_id, name) on table public.collections to authenticated;

revoke insert on table public.collection_clips from authenticated;
grant insert (collection_id, user_id, post_id)
  on table public.collection_clips to authenticated;
