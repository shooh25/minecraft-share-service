-- 1投稿に付けられるタグの上限を5個から10個へ変更

create or replace function public.enforce_post_tags_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  max_tags constant integer := 10;
  tag_count integer;
begin
  -- 同じ投稿への同時追加を1件ずつ処理する
  perform pg_advisory_xact_lock(
    hashtextextended('post_tags:' || new.post_id::text, 0)
  );

  select count(*)
  into tag_count
  from public.post_tags
  where post_id = new.post_id;

  if tag_count >= max_tags then
    raise exception 'タグは1投稿につき最大%個までです', max_tags
      using errcode = '23514';
  end if;

  return new;
end;
$$;

-- トリガー関数を RPC(PostgREST)経由で呼べないようにする
revoke execute on function public.enforce_post_tags_limit()
  from public, anon, authenticated;
