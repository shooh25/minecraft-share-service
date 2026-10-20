-- profiles のテーブル権限
-- このプロジェクトでは新規テーブルの自動公開がされないため、必要な権限を明示する。
grant select, update on table public.profiles to authenticated;
grant select, update on table public.profiles to service_role;

-- トリガー関数を RPC(PostgREST)経由で呼べないようにする。
revoke execute on function public.sanitize_user_metadata() from public, anon, authenticated;
revoke execute on function public.sanitize_identity_data() from public, anon, authenticated;
revoke execute on function public.create_profile_on_signup() from public, anon, authenticated;
