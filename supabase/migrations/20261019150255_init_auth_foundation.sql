-- 認証基盤(docs/schema.md / docs/architecture.md §2.1・§3.1 どおり)
-- - profiles テーブル(id + nickname のみ)
-- - メタデータホワイトリストトリガー
-- - 初回ログイン時の profiles 自動作成
-- - profiles の RLS

-- =========================================================
-- profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null
);

alter table public.profiles enable row level security;

-- 本人のみ SELECT 可能
create policy "profiles_select_own" on public.profiles
  for select
  using (auth.uid() = id);

-- 本人のみ UPDATE 可能
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =========================================================
-- メタデータホワイトリスト
-- =========================================================
create or replace function public.sanitize_user_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.raw_user_meta_data := jsonb_build_object('sub', new.raw_user_meta_data -> 'sub');
  return new;
end;
$$;

create trigger sanitize_user_metadata
  before insert or update on auth.users
  for each row execute function public.sanitize_user_metadata();

create or replace function public.sanitize_identity_data()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.identity_data := jsonb_build_object('sub', new.identity_data -> 'sub');
  return new;
end;
$$;

create trigger sanitize_identity_data
  before insert or update on auth.identities
  for each row execute function public.sanitize_identity_data();

-- =========================================================
-- 初回ログイン時に profiles を自動作成
-- nickname は空文字で作成し、ニックネーム設定画面で UPDATE する
-- =========================================================
create or replace function public.create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, '')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_on_signup();
