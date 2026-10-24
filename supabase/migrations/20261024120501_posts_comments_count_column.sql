-- コメント件数を追跡するカラムを posts に追加
alter table public.posts
  add column comments_count integer not null default 0 check (comments_count >= 0);