-- profiles を全員が読めるようにする
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_all" on public.profiles
  for select
  using (true);

-- 未ログインからの読み取りを許可
grant select on table public.profiles to anon;
