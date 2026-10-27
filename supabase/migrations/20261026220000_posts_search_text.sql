-- 検索用の文字列 posts.search_text(説明・タグ名・作者ニックネームを空白で連結)
create extension if not exists pg_trgm with schema extensions;

alter table public.posts add column search_text text not null default '';

-- 1件分の検索文字列を組み立てる
create or replace function public.build_search_text(target_post_id uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select concat_ws(
    ' ',
    p.description,
    (
      select string_agg(t.name, ' ' order by t.name)
      from public.post_tags pt
      join public.tags t on t.id = pt.tag_id
      where pt.post_id = p.id
    ),
    nullif(pr.nickname, '')
  )
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where p.id = target_post_id;
$$;

-- posts / post_tags / profiles の変更を search_text に反映する
create or replace function public.refresh_search_text()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_table_name = 'profiles' then
    update public.posts p set search_text = public.build_search_text(p.id)
    where p.author_id = new.id;
  else
    update public.posts p set search_text = public.build_search_text(p.id)
    where p.id = case
      when tg_table_name = 'post_tags' then coalesce(new.post_id, old.post_id)
      else new.id
    end;
  end if;
  return null;
end;
$$;

create trigger posts_refresh_search_text_insert after insert on public.posts
  for each row execute function public.refresh_search_text();
create trigger posts_refresh_search_text_update
  after update of description, author_id on public.posts
  for each row execute function public.refresh_search_text();
create trigger post_tags_refresh_search_text
  after insert or delete on public.post_tags
  for each row execute function public.refresh_search_text();
create trigger profiles_refresh_search_text
  after update of nickname on public.profiles
  for each row when (old.nickname is distinct from new.nickname)
  execute function public.refresh_search_text();

-- 既存の投稿を埋める
update public.posts p set search_text = public.build_search_text(p.id);

-- 部分一致検索用のインデックス
create index posts_search_text_trgm_idx
  on public.posts using gin (search_text extensions.gin_trgm_ops);

-- RPC 経由で呼べないようにする
revoke execute on function public.build_search_text(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_search_text() from public, anon, authenticated;
