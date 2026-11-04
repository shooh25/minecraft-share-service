-- refresh_search_text() の修正
-- - posts / profiles / post_tags で参照する列が違うのに、1つの update 文で
--   new.post_id / old.post_id / new.id をまとめて参照していた
-- - PL/pgSQL は文を実行時にプランするため、posts の INSERT でも new.post_id が
--   評価されてしまい "record new has no field post_id" で失敗していた
-- - テーブルごとに update 文を分け、実行される文だけがそのテーブルの列を参照するようにする

create or replace function public.refresh_search_text()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'profiles' then
    update public.posts p
    set search_text = public.build_search_text(p.id)
    where p.author_id = new.id;

  elsif tg_table_name = 'post_tags' then
    if tg_op = 'DELETE' then
      update public.posts p
      set search_text = public.build_search_text(p.id)
      where p.id = old.post_id;
    else
      update public.posts p
      set search_text = public.build_search_text(p.id)
      where p.id = new.post_id;
    end if;

  else
    update public.posts p
    set search_text = public.build_search_text(p.id)
    where p.id = new.id;
  end if;

  return null;
end;
$$;

revoke execute on function public.refresh_search_text() from public, anon, authenticated;
