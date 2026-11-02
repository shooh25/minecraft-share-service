-- 関連作品(作品詳細の下部に表示する)
-- - 共通タグが多い順に並べ、同数ならいいね数・新着順にする
-- - タグが一致する作品が足りない場合は、人気・新着順で埋める
-- - 同じ作者の作品も対象に含める
-- - 取得は公開情報のみのため security definer にはしない

create or replace function public.related_posts(target uuid, max_count integer default 6)
returns table (id uuid)
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
  ranked as (
    select
      m.id,
      row_number() over (
        order by m.shared_tags desc, p.likes_count desc, p.created_at desc, p.id desc
      ) as position
    from matched m
    join public.posts p on p.id = m.id
  ),
  fallback as (
    select
      p.id,
      (select count(*) from ranked) + row_number() over (
        order by p.likes_count desc, p.created_at desc, p.id desc
      ) as position
    from public.posts p
    where p.id <> target
      and not exists (select 1 from matched m where m.id = p.id)
  )
  select x.id
  from (
    select id, position from ranked
    union all
    select id, position from fallback
  ) x
  order by x.position
  limit greatest(0, least(max_count, 24));
$$;

revoke execute on function public.related_posts(uuid, integer) from public;
grant execute on function public.related_posts(uuid, integer)
  to anon, authenticated, service_role;
