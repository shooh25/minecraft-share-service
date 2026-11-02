-- 関連作品を無限スクロール用のカーソル方式にする
-- - 並び順は「共通タグ数 desc → いいね数 desc → 新着 desc → id desc」で一意に決まる
-- - タグが一致しない作品は共通タグ数 0 として、一致する作品の後ろに続く
-- - 取得位置は直前ページ末尾の (共通タグ数, いいね数, 日時, id) で指定する
-- - 同じ作者の作品も対象に含める

-- 旧シグネチャ(件数指定のみ)を削除
drop function public.related_posts(uuid, integer);

create or replace function public.related_posts(
  target uuid,
  page_size integer default 12,
  cursor_shared_tags integer default null,
  cursor_likes integer default null,
  cursor_created timestamptz default null,
  cursor_id uuid default null
)
returns table (
  id uuid,
  shared_tags integer,
  likes_count integer,
  created_at timestamptz
)
language sql
stable
set search_path = ''
as $$
  with target_tags as (
    select tag_id from public.post_tags where post_id = target
  ),
  matched as (
    select p.id, count(*)::integer as shared_tags
    from public.posts p
    join public.post_tags pt on pt.post_id = p.id
    join target_tags t on t.tag_id = pt.tag_id
    where p.id <> target
    group by p.id
  ),
  candidates as (
    select
      p.id,
      coalesce(m.shared_tags, 0) as shared_tags,
      p.likes_count,
      p.created_at
    from public.posts p
    left join matched m on m.id = p.id
    where p.id <> target
  )
  select c.id, c.shared_tags, c.likes_count, c.created_at
  from candidates c
  where cursor_shared_tags is null
     or c.shared_tags < cursor_shared_tags
     or (
       c.shared_tags = cursor_shared_tags
       and c.likes_count < cursor_likes
     )
     or (
       c.shared_tags = cursor_shared_tags
       and c.likes_count = cursor_likes
       and c.created_at < cursor_created
     )
     or (
       c.shared_tags = cursor_shared_tags
       and c.likes_count = cursor_likes
       and c.created_at = cursor_created
       and c.id < cursor_id
     )
  order by c.shared_tags desc, c.likes_count desc, c.created_at desc, c.id desc
  limit greatest(0, least(coalesce(page_size, 12), 50)) + 1;
$$;

revoke execute on function public.related_posts(uuid, integer, integer, integer, timestamptz, uuid) from public;
grant execute on function public.related_posts(uuid, integer, integer, integer, timestamptz, uuid)
  to anon, authenticated, service_role;
