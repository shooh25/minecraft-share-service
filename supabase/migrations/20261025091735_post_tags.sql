-- 投稿とタグの紐付け(docs/schema.md §post_tags どおり)
-- - 主キーを (post_id, tag_id) の組にして、同じ作品に同じタグを2回付けられないようにする
-- - タグ → 作品一覧の検索用に tag_id へインデックスを張る
-- - ユーザーは投稿への追加のみ可能。解除・付け替えはできず、行は投稿・タグの削除時に CASCADE で消える

-- =========================================================
-- post_tags
-- =========================================================
create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index post_tags_tag_idx on public.post_tags (tag_id);

alter table public.post_tags enable row level security;

-- 全員が読める
create policy "post_tags_select_all" on public.post_tags
  for select
  using (true);

-- 自分の作品にのみタグを付けられる
create policy "post_tags_insert_own" on public.post_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.author_id = auth.uid()
    )
  );

-- =========================================================
-- 権限
-- =========================================================
revoke all on table public.post_tags from anon, authenticated, service_role;

grant select on table public.post_tags to anon, authenticated;
grant insert on table public.post_tags to authenticated;
grant select, insert, delete on table public.post_tags to service_role;
